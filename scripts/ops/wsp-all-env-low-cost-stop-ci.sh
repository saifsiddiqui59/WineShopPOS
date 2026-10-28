#!/usr/bin/env bash
# WineShopPOS September-style REVERSIBLE low-cost stop.
# Strictly no deletion, no Supabase action, no data migration.
set -Eeuo pipefail
SUB_WANTED="3a5e8018-40a4-49e3-bcba-a9af3344f50e"
RG="wineshopPOS"
[[ "$GITHUB_REPOSITORY" == "saifsiddiqui59/WineShopPOS" ]] || exit 10
[[ "$GITHUB_REF" == "refs/heads/main" ]] || exit 11
[[ "$GITHUB_SHA" == "$(git rev-parse HEAD)" ]] || exit 12
SUB_ACTUAL=$(az account show --query id -o tsv)
[[ "$SUB_ACTUAL" == "$SUB_WANTED" ]] || { echo "::error::Wrong subscription"; exit 13; }
[[ "$(az group exists -n "$RG" -o tsv)" == "true" ]] ||
 { echo "::error::Wrong or inaccessible resource group"; exit 14; }
mkdir -p artifacts/wsp-shutdown
REPORT=artifacts/wsp-shutdown/results.tsv
ERR=artifacts/wsp-shutdown/latest-error.txt
printf "scope\tresource\taction\tstatus\n" > "$REPORT"
BAD=0
report() {
  printf "%s\t%s\t%s\t%s\n" "$1" "$2" "$3" "$4" | tee -a "$REPORT"
  case "$4" in OFF|ALREADY_OFF|ABSENT) ;; *) BAD=$((BAD+1));; esac
}
classify() {
  if grep -qiE 'ResourceNotFound|ResourceGroupNotFound|404|could not be found|was not found' "$ERR" 2>/dev/null; then
    echo ABSENT
  else
    echo UNVERIFIED
  fi
}
web_state() {
  az storage account blob-service-properties show -g "$RG" -n "$1" --query staticWebsite.enabled -o tsv 2>"$ERR"
}
web_stop() {
  local scope="$1" name="$2" initial="" final=""
  if ! initial=$(web_state "$name"); then
    report "$scope" "$name" "static-site" "$(classify)"
    return
  fi
  if [[ "$(echo "$initial" | tr '[:upper:]' '[:lower:]')" == false ]]; then
    report "$scope" "$name" "static-site" ALREADY_OFF
    return
  fi
  if ! az storage account blob-service-properties update -g "$RG" -n "$name" \
      --enable-static-website false -o none 2>"$ERR"; then
    report "$scope" "$name" "static-site" WRITE_BLOCKED
    return
  fi
  final=$(web_state "$name" || true)
  if [[ "$(echo "$final" | tr '[:upper:]' '[:lower:]')" == false ]]; then
    report "$scope" "$name" "static-site" OFF
  else
    report "$scope" "$name" "static-site" UNVERIFIED
  fi
}
fn_state() {
  az functionapp show -g "$RG" -n "$1" --query state -o tsv 2>"$ERR"
}
fn_stop() {
  local scope="$1" name="$2" invoice="$3" initial="" final="" status=""
  if ! initial=$(fn_state "$name"); then
    report "$scope" "$name" "function" "$(classify)"
    return
  fi
  if [[ "$invoice" == yes ]]; then
    if az functionapp config appsettings set -g "$RG" -n "$name" \
         --settings EMAIL_POLL_ENABLED=false "AzureWebJobs.email-invoice-poller.Disabled=true" \
         -o none >/dev/null 2>"$ERR"; then
      local email="" timer=""
      email=$(az functionapp config appsettings list -g "$RG" -n "$name" \
        --query "[?name=='EMAIL_POLL_ENABLED'].value | [0]" -o tsv 2>"$ERR" || true)
      timer=$(az functionapp config appsettings list -g "$RG" -n "$name" \
        --query "[?name=='AzureWebJobs.email-invoice-poller.Disabled'].value | [0]" -o tsv 2>"$ERR" || true)
      if [[ "$email" == false && "$timer" == true ]]; then status=OFF; else status=UNVERIFIED; fi
    else
      status=WRITE_BLOCKED
    fi
    report "$scope" "$name" "disable-email-timer" "$status"
  fi
  if [[ "$(echo "$initial" | tr '[:upper:]' '[:lower:]')" != stopped || "$invoice" == yes ]]; then
    if ! az functionapp stop -g "$RG" -n "$name" -o none 2>"$ERR"; then
      report "$scope" "$name" "function" WRITE_BLOCKED
      return
    fi
  fi
  for _ in $(seq 1 10); do
    final=$(fn_state "$name" || true)
    [[ "$(echo "$final" | tr '[:upper:]' '[:lower:]')" == stopped ]] && break
    sleep 5
  done
  if [[ "$(echo "$final" | tr '[:upper:]' '[:lower:]')" == stopped ]]; then
    report "$scope" "$name" "function" OFF
  else
    report "$scope" "$name" "function" UNVERIFIED
  fi
}
logic_stop() {
  local name="$1" initial="" final=""
  if ! initial=$(az resource show -g "$RG" -n "$name" \
      --resource-type Microsoft.Logic/workflows --query properties.state -o tsv 2>"$ERR"); then
    report PROD "$name" "logic-scheduler" "$(classify)"
    return
  fi
  if [[ "$initial" == Disabled ]]; then
    report PROD "$name" "logic-scheduler" ALREADY_OFF
    return
  fi
  if ! az resource update -g "$RG" -n "$name" \
       --resource-type Microsoft.Logic/workflows --set properties.state=Disabled -o none 2>"$ERR"; then
    report PROD "$name" "logic-scheduler" WRITE_BLOCKED
    return
  fi
  final=$(az resource show -g "$RG" -n "$name" \
    --resource-type Microsoft.Logic/workflows --query properties.state -o tsv 2>"$ERR" || true)
  if [[ "$final" == Disabled ]]; then report PROD "$name" "logic-scheduler" OFF
  else report PROD "$name" "logic-scheduler" UNVERIFIED; fi
}
echo "WSP September-style low-cost shutdown for SUB=$SUB_ACTUAL RG=$RG"
echo "SUPABASE_ACTION=NONE; DELETE_ACTION=NONE"
web_stop PROD "wineshoppos"
for site in wspv35c9453b6e9a1 wspv4d66ca1d443 wspv5qa3a5e8018; do
  web_stop DEV_QA "$site"
done
logic_stop "wsp-v3-email-scheduler-53b6e9a1"
fn_stop PROD "wsp-v3-invoice-53b6e9a1" yes
fn_stop PROD "wineshoppos-ai-1a61d5885c" no
fn_stop DEV "wsp-v5-invoice-dev-53b6e9a1" yes
fn_stop DEV "wsp-v3-dev-invoice-53b6e9a1" yes
fn_stop DEV "wsp-v3-invoice-dev-juhcypzo" yes
az functionapp list -g "$RG" --query '[].{name:name,state:state}' -o json \
  >artifacts/wsp-shutdown/function-inventory.json 2>/dev/null || true
az storage account list -g "$RG" --query '[].{name:name,sku:sku.name}' -o json \
  >artifacts/wsp-shutdown/storage-inventory.json 2>/dev/null || true
rm -f "$ERR"
echo "SUPABASE PROD uiurgplnsgmawvxhjzzp: UNTOUCHED"
echo "SUPABASE DEV juhcypzoacauzmtzqnwd: UNTOUCHED"
echo "STORAGE AND DATABASES RETAINED; ZERO_BILL_GUARANTEE=NO"
cat "$REPORT" >> "$GITHUB_STEP_SUMMARY"
echo "UNVERIFIED_OR_BLOCKED=$BAD"
if (( BAD > 0 )); then
  echo "::error::Partial shutdown: some actions blocked, absent resources are safe. Review status artifact."
  exit 1
fi
echo "WINESHOPPOS_ALL_KNOWN_AZURE_RUNTIME_SHUTDOWN_CONFIRMED"
