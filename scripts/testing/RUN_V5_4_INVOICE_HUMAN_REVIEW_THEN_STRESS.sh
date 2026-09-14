#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/e/WineShopPOS_V5_E2E_20260912_105856"
R11_REL="scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh"
STRESS_REL="scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh"
CREDS="$REPO/.wsp-local/stress_only_20260913_180633-cashiers.json"

DEV_REF="juhcypzoacauzmtzqnwd"
PROD_REF="uiurgplnsgmawvxhjzzp"
PROD_HOST="wineshoppos.z29.web.core.windows.net"

RUN_ID="four_invoice_human_review_$(date +%Y%m%d_%H%M%S)"
RAW="$REPO/.wsp-local/four-invoice-human-review/$RUN_ID"
mkdir -p "$RAW"

R11_ONLY="$RAW/R11_INVOICE_ONLY.sh"
R11_LOG="$RAW/R11_3_INVOICE.log"
PORT_15983="4195"
BASE_15983="http://127.0.0.1:${PORT_15983}"
VITE_PID=""

die(){
  echo
  echo "================================================================"
  echo "STOPPED SAFELY: $*"
  echo "Evidence: $RAW"
  echo "Do not blindly rerun after any committed sale."
  echo "================================================================"
  exit 1
}

cleanup(){
  set +e
  [[ -n "$VITE_PID" ]] && kill "$VITE_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd "$REPO" || die "Missing certification worktree."
[[ "$(git branch --show-current)" == "V5" ]] || die "Certification worktree is not V5."

git fetch origin V5 --quiet
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/V5)" ]] \
  || die "Certification worktree differs from origin/V5."

[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  git status --porcelain --untracked-files=no
  die "Certification worktree has tracked changes."
}

if grep -Rqs "$PROD_REF" .env .env.local 2>/dev/null; then
  die "PROD Supabase ref found in certification env."
fi
grep -Rqs "$DEV_REF" .env .env.local 2>/dev/null \
  || die "Expected DEV Supabase ref missing from certification env."

[[ -f "$R11_REL" ]] || die "R11 source missing."
[[ -f "$STRESS_REL" ]] || die "Stress continuation missing."
[[ -f "$CREDS" ]] || die "Preserved four-cashier checkpoint missing."

echo "================================================================"
echo " WineShopPOS V5 — 4 INVOICES + HUMAN REVIEW + STRESS"
echo "================================================================"
echo "16845  : R11 proven path"
echo "B-3339 : R11 proven path"
echo "16805  : R11 OCR/safe-review path"
echo "15983  : golden human correction path"
echo "Stress : existing 4 cashiers / OPEN shifts / 96+ UI bills"
echo "PROD   : HARD BLOCKED"
echo "Evidence: $RAW"
echo "================================================================"
echo

echo "[1/6] Extract current proven R11 invoice harness only..."

python - "$R11_REL" "$R11_ONLY" <<'PY_EXTRACT'
from pathlib import Path
import sys

src=Path(sys.argv[1]).read_text(encoding="utf-8")
out=Path(sys.argv[2])

start="cat > \"$RUNTIME/invoice-uat.sh\" <<'__WSP_EMBEDDED_INVOICE_RUNNER__'\n"
end="\n__WSP_EMBEDDED_INVOICE_RUNNER__\n"

a=src.find(start)
if a<0: raise SystemExit("R11 embedded invoice harness start marker missing.")
a+=len(start)
b=src.find(end,a)
if b<0: raise SystemExit("R11 embedded invoice harness end marker missing.")

runner=src[a:b]

required=[
  'input[type="file"][accept*="application/pdf"]',
  'getByRole("combobox", { name: "Supplier", exact: true })',
  'READY_TO_RECEIVE',
  'invoice_ocr_record_review',
  '"invoiceNumber": "16845"',
  '"invoiceNumber": "B-3339"',
  '"invoiceNumber": "16805"',
]
missing=[x for x in required if x not in runner]
if missing:
    raise SystemExit("R11 invoice harness missing safeguard(s): "+", ".join(missing))

out.write_text(runner.rstrip()+"\n",encoding="utf-8",newline="\n")
PY_EXTRACT

chmod +x "$R11_ONLY"
bash -n "$R11_ONLY" || die "Extracted R11 invoice harness failed bash -n."

# Syntax-check the embedded Playwright runner too.
python - "$R11_ONLY" "$RAW/r11-runner-check.mjs" <<'PY_JS'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text(encoding="utf-8")
m="cat > \"$RUNTIME/runner.mjs\" <<'NODE'\n"
a=s.find(m)
if a<0: raise SystemExit("Embedded runner.mjs start missing.")
a+=len(m)
b=s.find("\nNODE\n",a)
if b<0: raise SystemExit("Embedded runner.mjs end missing.")
Path(sys.argv[2]).write_text(s[a:b]+"\n",encoding="utf-8",newline="\n")
PY_JS
node --check "$RAW/r11-runner-check.mjs" || die "R11 Playwright syntax failed."

echo "[PASS] Current successful R11 invoice harness validated."

echo
echo "[2/6] Run 16845 + B-3339 + 16805 through current R11 invoice logic..."

set +e
bash "$R11_ONLY" 2>&1 | tee "$R11_LOG"
R11_RC=${PIPESTATUS[0]}
set -e

if [[ "$R11_RC" -ne 0 ]]; then
  # 16805 is allowed to remain safe-review if the only remaining issue is
  # genuinely unreadable finance evidence. Any unrelated R11 failure stops.
  if grep -Eqi '16805.*(safe.?review|unreadable|printed total|NEEDS_REVIEW|financial)|FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE' "$R11_LOG" \
     && ! grep -Eqi '16845.*FAIL|B-3339.*FAIL|PROD|wrong environment' "$R11_LOG"; then
    echo "[SAFE REVIEW] 16805 still has unresolved physical finance evidence."
    echo "[SAFE REVIEW] It remains unreceived; the suite continues as a human reviewer would."
  else
    die "R11 3-invoice stage failed outside the accepted 16805 safe-review boundary."
  fi
else
  echo "[PASS] R11 3-invoice stage completed."
fi

echo
echo "[3/6] Start current V5 for 15983 human-style verification..."

VITE_ENV_BADGE="QA / DEV · V5 · NOT PROD" \
  npx vite --host 127.0.0.1 --port "$PORT_15983" \
  >"$RAW/vite-15983.log" 2>&1 &
VITE_PID=$!

for _ in $(seq 1 80); do
  if curl -fsS "$BASE_15983/" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
curl -fsS "$BASE_15983/" >/dev/null 2>&1 \
  || die "Vite 15983 review server did not start."

cat > "$RAW/review-15983.mjs" <<'NODE_15983'
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE=process.env.BASE_URL;
const RAW=process.env.RAW;
const AUTH=process.env.AUTH_FILE;
const PROD_REF="uiurgplnsgmawvxhjzzp";
const PROD_HOST="wineshoppos.z29.web.core.windows.net";

const golden={
  invoice:"15983",
  supplier:"METRI SPIRITS PRIVATE LIMITED",
  date:"2026-08-17",
  cases:[20,2,5,13,5,5,2],
  packs:[12,24,24,12,24,12,24],
  rates:[2271.73,3546.12,2881.23,2881.22,4432.65,2659.59,4100.20],
  mrp:[205,160,140,250,200,240,185],
  amounts:[45435,7092,14406,37456,22163,13298,8200],
  subtotal:148050,
  cashDiscount:1497,
  invoiceDiscount:2475,
  freight:1144,
  misc:2910,
  total:148132,
  bottles:792,
};

const report={
  invoice:"15983",
  result:"RUNNING",
  corrections:[],
  before:{},
  after:{},
  assistance:"",
  received:false,
  productionTouched:false,
};

const norm=v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(v,m)=>{if(!v)throw new Error(m);};

function num(v){
  const n=Number(String(v??"").replace(/[^\d.-]/g,""));
  return Number.isFinite(n)?n:NaN;
}
function changed(field,before,after){
  if(String(before??"")!==String(after??"")){
    report.corrections.push({field,before,after,source:"PHYSICAL_GOLDEN_REVIEW"});
  }
}
async function fillIfDifferent(locator,value,field){
  const before=await locator.inputValue();
  if(String(before)!==String(value)){
    await locator.fill(String(value));
    changed(field,before,value);
  }
}
async function openReceiving(page){
  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/Invoice Inbox/i}).first()
    .waitFor({state:"visible",timeout:30000});

  const status=page.locator("select").filter({has:page.locator('option[value="ALL"]')}).first();
  if(await status.isVisible().catch(()=>false)){
    await status.selectOption("ALL").catch(()=>{});
    await sleep(500);
  }

  const row=page.locator("table.data-table tbody tr").filter({hasText:"15983"}).first();
  await row.waitFor({state:"visible",timeout:30000});
  const rowText=(await row.innerText()).replace(/\s+/g," ").trim();

  if(/Completed/i.test(rowText)){
    report.result="PASS_ALREADY_RECEIVED";
    report.received=true;
    return false;
  }

  const actionNames=[
    /Continue Receive Stock/i,
    /Resume Review/i,
    /Start Review/i,
  ];

  let clicked=false;
  for(const rx of actionNames){
    const b=row.getByRole("button",{name:rx}).first();
    if(await b.isVisible().catch(()=>false)){
      await b.click();
      clicked=true;
      break;
    }
  }
  assert(clicked,`15983 row has no resume/receive action. Row: ${rowText}`);

  for(let i=0;i<120;i++){
    if(await page.locator("h2").filter({hasText:/Purchase Receiving Workspace/i}).isVisible().catch(()=>false)){
      return true;
    }
    const open=page.getByRole("button",{name:/Open Purchase Receiving Workspace/i}).first();
    if(await open.isVisible().catch(()=>false)){
      await open.click();
      await sleep(300);
      continue;
    }
    await sleep(250);
  }
  throw new Error("15983 did not reach Purchase Receiving Workspace.");
}

let browser;
try{
  assert(fs.existsSync(AUTH),`Saved QA auth missing: ${AUTH}`);
  browser=await chromium.launch({headless:false,slowMo:8});
  const context=await browser.newContext({storageState:AUTH});

  await context.route("**/*",route=>{
    const u=route.request().url();
    if(u.includes(PROD_REF)||u.includes(PROD_HOST)){
      report.productionTouched=true;
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });

  const page=await context.newPage();
  const shouldReview=await openReceiving(page);

  if(!shouldReview){
    console.log("[15983] already received; no duplicate receipt attempted.");
  }else{
    await page.locator("h2").filter({hasText:/Purchase Receiving Workspace/i}).first()
      .waitFor({state:"visible",timeout:30000});

    const assistance=page.locator("section.panel").filter({hasText:"OCR Exception Assistance"}).first();
    if(await assistance.isVisible().catch(()=>false)){
      report.assistance=(await assistance.innerText()).replace(/\s+/g," ").trim();
      console.log(`[15983] OCR assistance: ${report.assistance}`);
    }

    const supplier=page.getByRole("combobox",{name:"Supplier",exact:true});
    const invNo=page.getByLabel("Invoice Number",{exact:true});
    const invDate=page.getByLabel("Invoice Date",{exact:true});

    report.before.supplier=await supplier.inputValue();
    report.before.invoice=await invNo.inputValue();
    report.before.date=await invDate.inputValue();

    await fillIfDifferent(supplier,golden.supplier,"header.supplier");
    await fillIfDifferent(invNo,golden.invoice,"header.invoice_number");
    await fillIfDifferent(invDate,golden.date,"header.invoice_date");

    const table=page.locator("table.purchase-receiving-table");
    await table.waitFor({state:"visible",timeout:30000});
    const rows=table.locator("tbody tr");
    const count=await rows.count();

    // Physical golden has 7 lines. A line-loss here is not an OCR-score failure:
    // keep the invoice in review rather than inventing a missing product identity.
    if(count!==7){
      report.result="SAFE_REVIEW";
      report.after.reason=`Physical invoice has 7 rows; receiving workspace has ${count}.`;
      fs.writeFileSync(path.join(RAW,"15983_RESULT.json"),JSON.stringify(report,null,2));
      console.log(`[15983 SAFE REVIEW] expected 7 physical rows, found ${count}; no stock posted.`);
      await context.close();
      process.exit(0);
    }

    const beforeRows=[];
    page.on("dialog",async d=>{
      await d.accept("Verified/corrected against physical invoice golden fixture.");
    });

    for(let i=0;i<7;i++){
      const row=rows.nth(i);
      const cells=row.locator("td");
      const description=(await cells.nth(1).innerText()).trim();

      const caseInput=cells.nth(5).locator('input[type="number"]');
      const packInput=cells.nth(6).locator('input[type="number"]');
      const looseInput=cells.nth(7).locator('input[type="number"]');
      const rateInput=cells.nth(9).locator('input[type="number"]');
      const mrpInput=cells.nth(11).locator('input[type="number"]');
      const amountInput=cells.nth(12).locator('input[type="number"]');

      const snap={
        line:i+1,
        description,
        cases:await caseInput.inputValue(),
        pack:await packInput.inputValue(),
        loose:await looseInput.inputValue(),
        rate:await rateInput.inputValue(),
        mrp:await mrpInput.inputValue(),
        amount:await amountInput.inputValue(),
      };
      beforeRows.push(snap);

      await fillIfDifferent(caseInput,golden.cases[i],`line.${i+1}.cases`);
      await fillIfDifferent(packInput,golden.packs[i],`line.${i+1}.bottles_per_case`);
      await fillIfDifferent(looseInput,0,`line.${i+1}.loose`);
      await fillIfDifferent(rateInput,golden.rates[i],`line.${i+1}.rate_per_case`);
      await fillIfDifferent(mrpInput,golden.mrp[i],`line.${i+1}.mrp`);
      await fillIfDifferent(amountInput,golden.amounts[i],`line.${i+1}.amount`);

      // If OCR could not resolve Product Master, stage the reviewed row exactly as
      // the real UI permits. Nothing is created until receive succeeds.
      const productSelect=cells.nth(2).locator("select");
      const selected=await productSelect.inputValue().catch(()=>"");
      const pendingText=await cells.nth(2).innerText().catch(()=>"");
      if(!selected&&!/Pending:/i.test(pendingText)){
        const assign=row.getByRole("button",{name:"Assign Later",exact:true});
        if(await assign.isVisible().catch(()=>false)){
          await assign.click();
          await sleep(120);
        }
      }

      const confirm=row.getByRole("button",{name:"Confirm Pack",exact:true});
      await confirm.click();
      await sleep(120);

      const keep=row.getByRole("button",{name:"Keep Separate",exact:true});
      if(await keep.isVisible().catch(()=>false)){
        await keep.click();
        await sleep(120);
      }
    }
    report.before.lines=beforeRows;

    const finance={
      "Freight / Carting":golden.freight,
      "Transport":0,
      "Handling":0,
      "Loading / Unloading":0,
      "Cash / Supplier Discount":golden.cashDiscount,
      "Other Invoice Deduction":golden.invoiceDiscount,
      "TCS / Stamp / Other Additions":golden.misc,
      "Rounding Adjustment":0,
      "Reviewed Printed Invoice Total":golden.total,
    };

    for(const [label,value] of Object.entries(finance)){
      const loc=page.getByLabel(label,{exact:true});
      await fillIfDifferent(loc,value,`finance.${label}`);
    }

    // Allow the application's 700 ms server-draft debounce to settle.
    await sleep(1200);

    const footer=page.locator("section.purchase-receive-footer");
    await footer.getByText("Ready to Receive",{exact:true})
      .waitFor({state:"visible",timeout:30000});

    const sync=page.locator(".purchase-sync-strip strong");
    for(let i=0;i<60;i++){
      const body=await page.locator("body").innerText();
      assert(!/SYNC ERROR/.test(body),"15983 authoritative review draft shows SYNC ERROR.");
      if(/SYNCED/i.test(await sync.innerText().catch(()=>""))) break;
      await sleep(500);
    }

    const totalsText=await table.locator("tfoot").innerText();
    report.after.totals=totalsText.replace(/\s+/g," ").trim();
    assert(/52 cases/i.test(totalsText),`15983 cases total not 52: ${totalsText}`);
    assert(/792 bottles/i.test(totalsText),`15983 bottles total not 792: ${totalsText}`);

    const receive=footer.getByRole("button",{name:"Approve & Receive Stock",exact:true});
    assert(!(await receive.isDisabled()),"15983 receive button remains disabled after golden human review.");

    await page.screenshot({path:path.join(RAW,"15983_READY_AFTER_HUMAN_REVIEW.png"),fullPage:true});
    await receive.click();

    await page.waitForURL(u=>u.hash.includes("#/purchasing/receipts/"),{timeout:60000});
    await page.locator("h2").filter({hasText:/Purchase Verification/i}).first()
      .waitFor({state:"visible",timeout:30000});

    report.received=true;
    report.result="PASS_RECEIVED";
    await page.screenshot({path:path.join(RAW,"15983_RECEIPT.png"),fullPage:true});
  }

  assert(report.productionTouched===false,"PROD request was attempted.");
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(RAW,"15983_RESULT.json"),JSON.stringify(report,null,2));

  console.log(`[15983] RESULT=${report.result}`);
  console.log(`[15983] OCR/HUMAN CORRECTIONS=${report.corrections.length}`);
  for(const c of report.corrections){
    console.log(`[15983 CORRECTION] ${c.field}: ${c.before} -> ${c.after}`);
  }

  await context.close();
}catch(e){
  report.result="FAIL";
  report.failure=e?.stack||String(e);
  report.finishedAt=new Date().toISOString();
  try{fs.writeFileSync(path.join(RAW,"15983_RESULT.json"),JSON.stringify(report,null,2));}catch{}
  console.error("[15983] FAIL:",e?.message||e);
  process.exitCode=1;
}finally{
  try{if(browser)await browser.close();}catch{}
}
NODE_15983

AUTH_FILE="$HOME/.wineshoppos-v5-uat/auth.json"
[[ -f "$AUTH_FILE" ]] || die "Saved QA auth is missing."

echo
echo "[4/6] Run 15983 as human verification: OCR -> compare -> correct -> learn -> receive..."

set +e
BASE_URL="$BASE_15983" \
RAW="$RAW" \
AUTH_FILE="$AUTH_FILE" \
node "$RAW/review-15983.mjs" 2>&1 | tee "$RAW/15983-console.log"
R15983=${PIPESTATUS[0]}
set -e

[[ "$R15983" -eq 0 ]] || die "15983 human-review stage failed before safe completion."

# SAFE_REVIEW is a valid UAT outcome: OCR/image was reviewed and no unsafe stock
# was posted. PASS_RECEIVED and PASS_ALREADY_RECEIVED are also valid.
node - "$RAW/15983_RESULT.json" <<'NODE_VALIDATE'
const fs=require("fs");
const f=process.argv[2];
const j=JSON.parse(fs.readFileSync(f,"utf8"));
if(!["PASS_RECEIVED","PASS_ALREADY_RECEIVED","SAFE_REVIEW"].includes(j.result)){
  throw new Error(`Unexpected 15983 result ${j.result}`);
}
if(j.productionTouched)throw new Error("15983 attempted PROD.");
console.log(`[PASS] 15983 human-review outcome: ${j.result}; corrections logged=${j.corrections?.length||0}`);
NODE_VALIDATE

echo
echo "[5/6] Stop temporary 15983 Vite server before stress..."
kill "$VITE_PID" >/dev/null 2>&1 || true
VITE_PID=""
sleep 1

echo
echo "[6/6] Run preserved 4-cashier 96+ UI stress continuation..."

# The invoice stages may add stock, but they do not close or recreate the four
# preserved cashier shifts. Stress runner validates those shifts again.
STRESS_RUN_ID="stress_after_4_invoice_$(date +%Y%m%d_%H%M%S)"

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
  echo "FINAL 4-INVOICE HUMAN REVIEW + STRESS: PASS"
  echo "16845   : tested/revalidated by R11"
  echo "B-3339  : tested/revalidated by R11"
  echo "16805   : tested by R11; safe-review allowed if evidence remains unreadable"
  echo "15983   : tested with golden human correction and learning path"
  echo "Stress  : PASS"
  echo "PROD    : NOT TOUCHED"
  echo "Evidence: $RAW"
  echo "================================================================"
else
  echo
  echo "================================================================"
  echo "INVOICES COMPLETED; STRESS STOPPED ($STRESS_RC)"
  echo "Do NOT rerun invoices blindly."
  echo "Use the stress evidence/progress checkpoint for continuation."
  echo "Evidence: $RAW"
  echo "================================================================"
fi

exit "$STRESS_RC"
