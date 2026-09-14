#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/e/WineShopPOS_V5_E2E_20260912_105856"
R11_REL="scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh"
FIXTURE_REL="tests/fixtures/v5-four-invoice-e2e.json"
BARCODE_REL="tests/e2e/v5-four-invoice-barcode-ui.mjs"
REVIEW_REL="tests/e2e/v5-15983-human-review.mjs"
STRESS_REL="scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh"
CREDS="$REPO/.wsp-local/stress_only_20260913_180633-cashiers.json"

DEV_REF="juhcypzoacauzmtzqnwd"
PROD_REF="uiurgplnsgmawvxhjzzp"
PORT="4196"
BASE="http://127.0.0.1:${PORT}"
AUTH="$HOME/.wineshoppos-v5-uat/auth.json"
RUN_ID="true_e2e_4_invoices_$(date +%Y%m%d_%H%M%S)"
RAW="$REPO/.wsp-local/true-e2e/$RUN_ID"
R11_ONLY="$RAW/r11-invoices-only.sh"
R11_LOG="$RAW/r11.log"
VITE_PID=""

mkdir -p "$RAW"

die(){
  echo
  echo "================================================================"
  echo "TRUE E2E STOPPED SAFELY: $*"
  echo "Evidence: $RAW"
  echo "Do not blindly rerun stress after any sale mutation."
  echo "================================================================"
  exit 1
}
cleanup(){
  set +e
  if [[ -n "$VITE_PID" ]]; then
    kill "$VITE_PID" >/dev/null 2>&1 || true
    wait "$VITE_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

cd "$REPO" || die "Certification worktree missing."
[[ "$(git branch --show-current)" == "V5" ]] || die "Certification worktree is not V5."
git fetch origin V5 --quiet
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/V5)" ]] || die "Certification worktree differs from origin/V5."
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || die "Certification worktree has tracked changes."
[[ -f "$AUTH" ]] || die "Saved QA ADMIN auth missing: $AUTH"
[[ -f "$CREDS" ]] || die "Preserved four-cashier checkpoint missing."
for f in "$R11_REL" "$FIXTURE_REL" "$BARCODE_REL" "$REVIEW_REL" "$STRESS_REL"; do
  [[ -f "$f" ]] || die "Required file missing: $f"
done
if grep -Rqs "$PROD_REF" .env .env.local 2>/dev/null; then die "PROD Supabase ref found in certification env."; fi
grep -Rqs "$DEV_REF" .env .env.local 2>/dev/null || die "DEV Supabase ref missing from certification env."

echo "================================================================"
echo " WineShopPOS V5 — TRUE END-TO-END 4-INVOICE CERTIFICATION"
echo "================================================================"
echo " 16845   : received earlier -> idempotent revalidation"
echo " B-3339  : received earlier -> idempotent revalidation"
echo " 16805   : OCR + 3 physical rows + fail-closed finance when unreadable"
echo " 15983   : human-reviewed physical golden -> UI corrections -> receive"
echo " Products : missing barcodes added only through Product UI"
echo " POS      : barcode-driven 96+ genuine UI bills / 4 cashiers"
echo " Finish   : return -> shift close -> reports / analytics"
echo " PROD     : HARD BLOCKED"
echo " Evidence : $RAW"
echo "================================================================"

echo
echo "[1/7] Extract proven R11 invoice stage and remove stale harness assumptions..."

python - "$R11_REL" "$R11_ONLY" <<'PY'
from pathlib import Path
import sys
src=Path(sys.argv[1]).read_text(encoding="utf-8")
out=Path(sys.argv[2])
start="cat > \"$RUNTIME/invoice-uat.sh\" <<'__WSP_EMBEDDED_INVOICE_RUNNER__'\n"
end="\n__WSP_EMBEDDED_INVOICE_RUNNER__\n"
a=src.find(start)
if a<0: raise SystemExit("R11 embedded invoice harness start marker missing")
a+=len(start)
b=src.find(end,a)
if b<0: raise SystemExit("R11 embedded invoice harness end marker missing")
runner=src[a:b]

old="""  const products = await getProducts();
  const productByBarcode = new Map(products.map((p) => [String(p.barcode || "").trim(), p]));
  const itemByProduct = new Map(items.map((i) => [i.product_id, i]));

  for (const line of fixture.lines) {
    const p = productByBarcode.get(line.barcode);
    assert(p, `${fixture.invoiceNumber}: previously received product missing for barcode ${line.barcode}.`);
"""
new="""  const products = await getProducts();
  const productByBarcode = new Map(products.map((p) => [String(p.barcode || "").trim(), p]));
  const itemByProduct = new Map(items.map((i) => [i.product_id, i]));
  const purchaseProductIds = new Set(items.map((i) => i.product_id).filter(Boolean));
  const fallbackUsedProductIds = new Set();

  for (const line of fixture.lines) {
    let p = productByBarcode.get(line.barcode);
    if (!p) {
      const expectedQty = Number(line.cases || 0) * Number(line.pack || 0) + Number(line.loose || 0);
      const candidates = products.filter((candidate) => {
        if (!purchaseProductIds.has(candidate.id) || fallbackUsedProductIds.has(candidate.id)) return false;
        const pi = itemByProduct.get(candidate.id);
        return pi
          && norm(candidate.product_name) === norm(line.name)
          && Number(candidate.size_ml) === Number(line.size)
          && Number(pi.quantity || 0) === expectedQty;
      });
      assert(candidates.length === 1,
        `${fixture.invoiceNumber}: missing historical QA barcode ${line.barcode}; strict purchase-linked fallback found ${candidates.length} match(es) for ${line.name} ${line.size}ml.`);
      p = candidates[0];
      fallbackUsedProductIds.add(p.id);
      log(`${fixture.invoiceNumber}: revalidated ${p.product_name} ${p.size_ml}ml by immutable purchase link; barcode will be repaired later through Product UI if missing.`);
    }
    assert(p, `${fixture.invoiceNumber}: previously received product identity could not be revalidated for ${line.name}.`);
"""
if old in runner:
    runner=runner.replace(old,new,1)
elif "purchaseProductIds" not in runner:
    raise SystemExit("R11 received revalidation shape changed; refusing fuzzy transform")

old2="""  await search.fill(line.barcode);
  await page.getByText(line.name, { exact: false }).first().waitFor({ state: "visible", timeout: 10_000 });
"""
new2="""  await search.fill(line.name);
  const currentStock = page.locator("section.panel").filter({ hasText: "Current Stock" }).first();
  const stockRow = currentStock.locator("table.data-table tbody tr").filter({ hasText: line.name }).first();
  await stockRow.waitFor({ state: "visible", timeout: 10_000 });
"""
if old2 in runner:
    runner=runner.replace(old2,new2,1)
elif 'filter({ hasText: "Current Stock" })' not in runner:
    raise SystemExit("R11 inventory spot-check shape changed; refusing fuzzy transform")

for marker in ['"invoiceNumber": "16845"','"invoiceNumber": "B-3339"','"invoiceNumber": "16805"',"READY_TO_RECEIVE"]:
    if marker not in runner: raise SystemExit(f"R11 transformed harness missing {marker}")
out.write_text(runner.rstrip()+"\n",encoding="utf-8")
PY

chmod +x "$R11_ONLY"
bash -n "$R11_ONLY" || die "Transformed R11 invoice shell failed bash -n."
python - "$R11_ONLY" "$RAW/r11-runner.mjs" <<'PY'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text(encoding="utf-8")
m="cat > \"$RUNTIME/runner.mjs\" <<'NODE'\n"
a=s.find(m)
if a<0: raise SystemExit("runner.mjs marker missing")
a+=len(m); b=s.find("\nNODE\n",a)
if b<0: raise SystemExit("runner.mjs end marker missing")
Path(sys.argv[2]).write_text(s[a:b]+"\n",encoding="utf-8")
PY
node --check "$RAW/r11-runner.mjs" || die "Transformed R11 Playwright failed syntax check."

echo
echo "[2/7] Run 16845 + B-3339 + 16805 invoice stage..."
set +e
bash "$R11_ONLY" 2>&1 | tee "$R11_LOG"
R11_RC=${PIPESTATUS[0]}
set -e
[[ "$R11_RC" -eq 0 ]] || die "R11 invoice stage failed. Business state is preserved; inspect r11.log."
grep -q '16845: PASS' "$R11_LOG" || die "16845 PASS marker missing."
grep -q 'B-3339: PASS' "$R11_LOG" || die "B-3339 PASS marker missing."
grep -q '16805: PASS' "$R11_LOG" || die "16805 PASS marker missing."
echo "[PASS] R11 three-invoice stage completed without duplicate receipt."

echo
echo "[3/7] Start one DEV browser app for barcode + 15983 human review..."
VITE_ENV_BADGE="QA / DEV · V5 · NOT PROD" npx vite --host 127.0.0.1 --port "$PORT" --strictPort >"$RAW/vite.log" 2>&1 &
VITE_PID=$!
for _ in $(seq 1 100); do
  if curl -fsS "$BASE/" >/dev/null 2>&1; then break; fi
  if ! kill -0 "$VITE_PID" >/dev/null 2>&1; then cat "$RAW/vite.log"; die "DEV Vite exited early."; fi
  sleep 0.2
done
curl -fsS "$BASE/" >/dev/null 2>&1 || die "DEV Vite did not become ready."

echo
echo "[4/7] Add/verify missing 16845 + B-3339 barcodes through Product UI..."
WSP_BASE_URL="$BASE" WSP_AUTH_FILE="$AUTH" WSP_E2E_FIXTURE="$REPO/$FIXTURE_REL" \
WSP_STRICT_INVOICES="16845,B-3339" node "$BARCODE_REL" 2>&1 | tee "$RAW/barcodes-before-15983.log"

echo
echo "[5/7] Resume invoice 15983 and act like a human reviewer..."
WSP_BASE_URL="$BASE" WSP_AUTH_FILE="$AUTH" WSP_E2E_FIXTURE="$REPO/$FIXTURE_REL" \
WSP_E2E_OUT="$RAW" node "$REVIEW_REL" 2>&1 | tee "$RAW/15983.log"
grep -Eq 'PASS_RECEIVED|PASS_ALREADY_RECEIVED' "$RAW/15983.log" || die "15983 did not complete safely."

echo
echo "[6/7] Verify all received invoice products have barcodes through Product UI..."
WSP_BASE_URL="$BASE" WSP_AUTH_FILE="$AUTH" WSP_E2E_FIXTURE="$REPO/$FIXTURE_REL" \
WSP_STRICT_INVOICES="16845,B-3339,15983" node "$BARCODE_REL" 2>&1 | tee "$RAW/barcodes-after-15983.log"

kill "$VITE_PID" >/dev/null 2>&1 || true
wait "$VITE_PID" >/dev/null 2>&1 || true
VITE_PID=""
sleep 1

echo
echo "[7/7] Barcode-driven 4-cashier 96+ UI stress -> return -> shifts -> analytics..."
STRESS_RUN_ID="true_e2e_stress_$(date +%Y%m%d_%H%M%S)"
set +e
WSP_REPO="$REPO" \
WSP_RESUME_CASHIER_FILE="$CREDS" \
WSP_RUN_ID="$STRESS_RUN_ID" \
bash "$STRESS_REL"
STRESS_RC=$?
set -e

if [[ "$STRESS_RC" -eq 0 ]]; then
  echo
  echo "================================================================"
  echo " TRUE END-TO-END RESULT: PASS"
  echo " 4 physical invoices covered"
  echo " OCR/human review covered"
  echo " Product/barcode UI covered"
  echo " Purchase/inventory covered"
  echo " 96+ barcode-driven POS UI bills covered"
  echo " Return + shift close + analytics covered"
  echo " PROD untouched"
  echo " Evidence: $RAW"
  echo "================================================================"
else
  echo
  echo "================================================================"
  echo " INVOICE/BARCODE STAGES PASSED; STRESS STOPPED: $STRESS_RC"
  echo " Do not blindly rerun if STRESS_PROGRESS.json indicates sales were committed."
  echo " Evidence: $RAW"
  echo "================================================================"
fi
exit "$STRESS_RC"
