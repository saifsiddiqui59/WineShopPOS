#!/usr/bin/env bash
set -u

RG="${1:-wineshopPOS}"
OUT="${2:-/e/WineShopPOS_patch_logs/azure-cost-readonly-$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$OUT"

section(){ echo; echo "================================================================"; echo "$1"; echo "================================================================"; }

section "AZURE COST CHECK - READ ONLY"
echo "AZURE_CHANGES_MADE=0"

if ! az account show -o json > "$OUT/account.json" 2> "$OUT/account_error.txt"; then
  echo "AZURE_AUTH=FAILED"
  cat "$OUT/account_error.txt"
  exit 0
fi

read MONTH_START END_DATE <<< "$(python - <<'PY'
from datetime import datetime,timezone,timedelta
now=datetime.now(timezone.utc)
print(now.strftime("%Y-%m-01"), (now+timedelta(days=1)).strftime("%Y-%m-%d"))
PY
)"

section "1. LOGIC APP STATE"
az resource list -g "$RG" --resource-type Microsoft.Logic/workflows -o json > "$OUT/logic.json" 2>/dev/null || echo "[]" > "$OUT/logic.json"

python - "$OUT/logic.json" <<'PY'
import json,sys
rows=json.load(open(sys.argv[1],encoding="utf-8"))
if not rows:
    print("LOGIC_APP=NONE")
for r in rows:
    print(f'LOGIC_APP={r.get("name","")} ID={r.get("id","")}')
PY

python - "$OUT/logic.json" > "$OUT/logic_ids.txt" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    if r.get("id"): print(r["id"])
PY

while IFS= read -r id; do
  [[ -n "$id" ]] || continue
  name="$(az resource show --ids "$id" --query name -o tsv 2>/dev/null || true)"
  state="$(az resource show --ids "$id" --query properties.state -o tsv 2>/dev/null || true)"
  echo "LOGIC_APP_STATE=${name:-UNKNOWN}:${state:-UNKNOWN}"
done < "$OUT/logic_ids.txt"

section "2. FUNCTION APPS / PLANS"
az functionapp list -g "$RG" -o json > "$OUT/functions.json" 2>/dev/null || echo "[]" > "$OUT/functions.json"

python - "$OUT/functions.json" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    print(
        f'FUNCTION={r.get("name","")} STATE={r.get("state","")} '
        f'PLAN={(r.get("serverFarmId","") or "").split("/")[-1]}'
    )
PY

az appservice plan list -g "$RG" -o json > "$OUT/plans.json" 2>/dev/null || echo "[]" > "$OUT/plans.json"
python - "$OUT/plans.json" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    sku=r.get("sku") or {}
    print(f'PLAN={r.get("name","")} SKU={sku.get("name","")} TIER={sku.get("tier","")}')
PY

section "3. STORAGE CAPACITY / 24H TRANSACTIONS"
az storage account list -g "$RG" -o json > "$OUT/storage.json" 2>/dev/null || echo "[]" > "$OUT/storage.json"

python - "$OUT/storage.json" > "$OUT/storage_ids.tsv" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    print(f'{r.get("name","")}\t{r.get("id","")}')
PY

while IFS=$'\t' read -r name id; do
  [[ -n "$id" ]] || continue

  cap="$OUT/${name}_capacity.json"
  tx="$OUT/${name}_tx.json"

  az monitor metrics list --resource "$id" --metric UsedCapacity --interval PT1H --aggregation Average --offset 1d -o json > "$cap" 2>/dev/null || echo '{"value":[]}' > "$cap"
  az monitor metrics list --resource "$id" --metric Transactions --interval PT1H --aggregation Total --offset 1d -o json > "$tx" 2>/dev/null || echo '{"value":[]}' > "$tx"

  python - "$name" "$cap" "$tx" <<'PY'
import json,sys
name,capf,txf=sys.argv[1:4]

def vals(path,key):
    d=json.load(open(path,encoding="utf-8"))
    out=[]
    for v in d.get("value",[]) or []:
        for ts in v.get("timeseries",[]) or []:
            for p in ts.get("data",[]) or []:
                value=p.get(key)
                if isinstance(value,(int,float)):
                    out.append(float(value))
    return out

caps=vals(capf,"average")
txs=vals(txf,"total")
used=max(caps) if caps else 0
print(f"STORAGE={name} USED_GB={used/1024/1024/1024:.6f} TX_24H={sum(txs):.0f}")
PY
done < "$OUT/storage_ids.tsv"

section "4. AI / COGNITIVE ACCOUNTS"
az cognitiveservices account list -g "$RG" -o json > "$OUT/ai.json" 2>/dev/null || echo "[]" > "$OUT/ai.json"

python - "$OUT/ai.json" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    sku=r.get("sku") or {}
    print(f'AI_ACCOUNT={r.get("name","")} KIND={r.get("kind","")} SKU={sku.get("name","")} LOCATION={r.get("location","")}')
PY

section "5. MONITORING RESOURCES"
az resource list -g "$RG" -o json > "$OUT/resources.json" 2>/dev/null || echo "[]" > "$OUT/resources.json"

python - "$OUT/resources.json" <<'PY'
import json,sys
for r in json.load(open(sys.argv[1],encoding="utf-8")):
    t=str(r.get("type","")).lower()
    if t in ("microsoft.insights/components","microsoft.operationalinsights/workspaces"):
        print(f'MONITOR={r.get("name","")} TYPE={r.get("type","")}')
PY

section "6. MONTH-TO-DATE COST BREAKDOWN"
if az consumption usage list \
    --start-date "$MONTH_START" \
    --end-date "$END_DATE" \
    --include-meter-details \
    --include-additional-properties \
    -o json > "$OUT/usage.json" 2> "$OUT/cost_error.txt"; then

python - "$OUT/usage.json" "$RG" <<'PY'
import json,sys,re
from collections import defaultdict

raw=json.load(open(sys.argv[1],encoding="utf-8"))
project_rg=sys.argv[2]
rows=raw.get("value",[]) if isinstance(raw,dict) else raw

def props(row):
    p=row.get("properties")
    return p if isinstance(p,dict) else row

def number(value):
    try:
        return float(value) if value is not None else 0.0
    except (TypeError,ValueError):
        return 0.0

def resource_group(rid):
    m=re.search(r"/resourceGroups/([^/]+)",rid or "",re.I)
    return m.group(1) if m else "(unattributed)"

services=defaultdict(float)
resources=defaultdict(float)
meters=defaultdict(float)
currency=""

for row in rows:
    p=props(row)
    cost=number(p.get("pretaxCost") or p.get("cost"))
    if not cost:
        continue

    md=p.get("meterDetails") or {}
    currency=currency or str(p.get("currency") or "")
    service=md.get("serviceName") or p.get("consumedService") or md.get("meterCategory") or p.get("product") or "(unknown)"
    resource=p.get("instanceName") or p.get("resourceName") or "(unattributed)"
    rid=p.get("instanceId") or p.get("resourceId") or ""
    rg=resource_group(rid)
    meter=md.get("meterName") or p.get("meterName") or "(unknown)"

    services[service]+=cost
    resources[(resource,rg,service)]+=cost
    meters[(meter,service,resource,rg)]+=cost

print(f"CURRENCY={currency or 'UNKNOWN'}")

print("\nTOP_SERVICES")
for name,cost in sorted(services.items(),key=lambda x:x[1],reverse=True)[:20]:
    print(f"{cost:.6f}\t{name}")

print("\nTOP_RESOURCES")
for (resource,rg,service),cost in sorted(resources.items(),key=lambda x:x[1],reverse=True)[:30]:
    mark=" <== wineshopPOS" if rg.lower()==project_rg.lower() else ""
    print(f"{cost:.6f}\t{resource}\tRG={rg}\tSERVICE={service}{mark}")

print("\nTOP_METERS")
for (meter,service,resource,rg),cost in sorted(meters.items(),key=lambda x:x[1],reverse=True)[:40]:
    print(f"{cost:.6f}\tMETER={meter}\tSERVICE={service}\tRESOURCE={resource}\tRG={rg}")
PY

else
  echo "COST_API=UNAVAILABLE"
  sed -n '1,12p' "$OUT/cost_error.txt" || true
fi

section "FINAL READ-ONLY COST STATUS"
echo "AZURE_CHANGES_MADE=0"
echo "REPORT_DIR=$OUT"
