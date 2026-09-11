#!/usr/bin/env bash
set -Eeuo pipefail

DEV_REF="juhcypzoacauzmtzqnwd"
PROD_REF="uiurgplnsgmawvxhjzzp"
INVOICE_NO="16805"
AUTH_FILE="$HOME/.wineshoppos-v5-uat/auth.json"
RUN_ID="$(date +%Y%m%d_%H%M%S)"
OUT="$HOME/WineShopPOS_V5_DIAG_16805/$RUN_ID"
mkdir -p "$OUT"

die(){ echo; echo "FAILED: $*"; echo "Evidence: $OUT"; exit 1; }

find_repo(){
  local d
  for d in "$PWD" /e/WineShopPOS_V5; do
    if [[ -d "$d" ]] && git -C "$d" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      echo "$d"; return
    fi
  done
  return 1
}

REPO="$(find_repo)" || die "Could not locate /e/WineShopPOS_V5."
cd "$REPO"

echo "================================================================"
echo " WineShopPOS V5 — Invoice 16805 OCR DIAGNOSTIC"
echo "================================================================"
echo "Repo     : $REPO"
echo "Evidence : $OUT"
echo "Mode     : READ-ONLY / DEV ONLY"
echo

[[ "$(git branch --show-current)" == "V5" ]] || die "Current branch is not V5."
[[ -f "$AUTH_FILE" ]] || die "Saved QA auth not found at $AUTH_FILE. Run the V5 UAT login once first."

RUNTIME="$OUT/runtime"
mkdir -p "$RUNTIME"

cat > "$RUNTIME/read-env.mjs" <<'NODE'
import fs from "node:fs";
const key=process.argv[2]||"";
const files=[".env.local",".env"].filter(f=>fs.existsSync(f));
const v={};
for(const f of files){
  for(const raw of fs.readFileSync(f,"utf8").split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const i=line.indexOf("=");
    if(i<1)continue;
    let val=line.slice(i+1).trim();
    if((val.startsWith('"')&&val.endsWith('"'))||(val.startsWith("'")&&val.endsWith("'"))) val=val.slice(1,-1);
    v[line.slice(0,i).trim()]=val;
  }
}
process.stdout.write(String(v[key]||""));
NODE

SUPABASE_URL="$(node "$RUNTIME/read-env.mjs" VITE_SUPABASE_URL)"
SUPABASE_ANON_KEY="$(node "$RUNTIME/read-env.mjs" VITE_SUPABASE_ANON_KEY)"

[[ -n "$SUPABASE_URL" ]] || die "VITE_SUPABASE_URL missing."
[[ -n "$SUPABASE_ANON_KEY" ]] || die "VITE_SUPABASE_ANON_KEY missing."
[[ "$SUPABASE_URL" == *"$DEV_REF"* ]] || die "Not connected to expected DEV Supabase."
[[ "$SUPABASE_URL" != *"$PROD_REF"* ]] || die "PROD detected. STOP."

cat > "$RUNTIME/diag.mjs" <<'NODE'
import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL=process.env.SUPABASE_URL;
const ANON=process.env.SUPABASE_ANON_KEY;
const AUTH=process.env.AUTH_FILE;
const OUT=process.env.OUT;
const INVOICE=process.env.INVOICE_NO || "16805";

function fail(msg){console.error(`FAIL: ${msg}`);process.exit(1);}
function walk(v,d=0){
  if(d>8||v==null)return "";
  if(typeof v==="object"){
    if(typeof v.access_token==="string"&&v.access_token.length>40)return v.access_token;
    for(const x of Object.values(v)){const f=walk(x,d+1);if(f)return f;}
  }
  return "";
}
function tokenFromStorageState(){
  const state=JSON.parse(fs.readFileSync(AUTH,"utf8"));
  for(const origin of state.origins||[]){
    for(const entry of origin.localStorage||[]){
      try{
        const found=walk(JSON.parse(entry.value));
        if(found)return found;
      }catch{}
    }
  }
  return walk(state);
}
async function rest(resource){
  const token=tokenFromStorageState();
  if(!token)fail("Could not extract Supabase access token from saved Playwright auth state.");
  const r=await fetch(`${SUPABASE_URL.replace(/\/+$/,"")}/rest/v1/${resource}`,{
    headers:{apikey:ANON,Authorization:`Bearer ${token}`,Accept:"application/json"}
  });
  const txt=await r.text();
  if(!r.ok)fail(`Supabase HTTP ${r.status}: ${txt.slice(0,1000)}`);
  return txt?JSON.parse(txt):[];
}
const enc=encodeURIComponent;
let rows=await rest(
  `invoice_ingestions?select=id,sha256,review_status,purchase_id,extracted_invoice_number,extracted_invoice_date,extracted_total,normalized_invoice,review_draft,received_at&extracted_invoice_number=eq.${enc(INVOICE)}&limit=20`
);

if(!rows.length){
  const candidates=await rest(
    `invoice_ingestions?select=id,sha256,review_status,purchase_id,extracted_invoice_number,extracted_invoice_date,extracted_total,normalized_invoice,review_draft,received_at&review_status=eq.NEEDS_REVIEW&limit=100`
  );
  rows=candidates.filter(r=>
    String(r?.normalized_invoice?.invoiceNumber||"").trim()===INVOICE ||
    String(r?.extracted_invoice_number||"").trim()===INVOICE
  );
}

fs.writeFileSync(path.join(OUT,"16805_ingestions.json"),JSON.stringify(rows,null,2));

const expected=[
  {line:1,name:"DING DONGS FORTIFIED WINE",mrp:60,rate:2637.30,amount:2637.00},
  {line:2,name:"DYNAMITE XXX FORTIFIED WINE",mrp:60,rate:2637.30,amount:2637.00},
  {line:3,name:"GO LIMLET FORTIFIED WINE",mrp:60,rate:2637.30,amount:2637.00},
];

let md=`# Invoice 16805 OCR Diagnostic\n\n`;
md+=`- Mode: READ-ONLY / DEV ONLY\n`;
md+=`- Expected physical invoice rows: **3**\n`;
md+=`- Expected total: **8044**\n`;
md+=`- Expected product subtotal: **7911**\n`;
md+=`- Ingestion rows found: **${rows.length}**\n\n`;

if(!rows.length){
  md+=`## Result\n\nNo DEV ingestion for invoice 16805 was found with the saved QA account.\n`;
}else{
  for(const [ri,row] of rows.entries()){
    const inv=row.normalized_invoice||{};
    const items=Array.isArray(inv.items)?inv.items:[];
    md+=`## Ingestion ${ri+1}\n\n`;
    md+=`- id: \`${row.id}\`\n`;
    md+=`- status: **${row.review_status||"UNKNOWN"}**\n`;
    md+=`- purchase_id: ${row.purchase_id?`\`${row.purchase_id}\``:"NULL"}\n`;
    md+=`- extracted invoice: ${row.extracted_invoice_number||"NULL"}\n`;
    md+=`- normalized invoice: ${inv.invoiceNumber||"NULL"}\n`;
    md+=`- normalized supplier: ${inv.supplierName||"NULL"}\n`;
    md+=`- normalized total: ${inv.total??"NULL"}\n`;
    md+=`- normalized item count: **${items.length}**\n\n`;
    md+=`### Stored normalized items\n\n`;
    items.forEach((it,i)=>{
      md+=`${i+1}. **${it.description||"(no description)"}**`;
      md+=` | MRP ${it.mrp??"-"} | Cases ${it.caseCount??it.quantity??"-"} | Pack ${it.unitsPerCaseHint??it.unitsPerCase??"-"} | Rate ${it.ratePerCase??it.unitPrice??"-"} | Amount ${it.amount??"-"} | Batch ${it.batchNumber??"-"}\n`;
    });
    md+=`\n`;
  }
}

md+=`## Physical invoice expectation\n\n`;
for(const e of expected){
  md+=`${e.line}. ${e.name} | MRP ${e.mrp} | Rate ${e.rate.toFixed(2)} | Amount ${e.amount.toFixed(2)}\n`;
}

md+=`\n## Classification rule\n\n`;
md+=`- If stored \`normalized_invoice.items\` has **2** rows while the physical invoice has **3**, this is an **OCR/normalization application defect**, not a Playwright selector defect.\n`;
md+=`- Do not receive invoice 16805 until all 3 physical rows are represented and reviewed.\n`;
md+=`- Do not delete the original invoice evidence; preserve the ingestion for debugging/audit.\n`;

fs.writeFileSync(path.join(OUT,"SUMMARY.md"),md);
console.log(md);
NODE

AUTH_NATIVE="$AUTH_FILE"
OUT_NATIVE="$OUT"
if command -v cygpath >/dev/null 2>&1; then
  AUTH_NATIVE="$(cygpath -w "$AUTH_FILE")"
  OUT_NATIVE="$(cygpath -w "$OUT")"
fi

SUPABASE_URL="$SUPABASE_URL" \
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
AUTH_FILE="$AUTH_NATIVE" \
OUT="$OUT_NATIVE" \
INVOICE_NO="$INVOICE_NO" \
node "$RUNTIME/diag.mjs" | tee "$OUT/console.log"

echo
echo "Diagnostic complete."
echo "Evidence: $OUT"
echo "Open:     $OUT/SUMMARY.md"
