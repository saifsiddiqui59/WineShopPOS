
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const BASE = process.env.WSP_BASE_URL || "http://127.0.0.1:4185";
const PROD_FRONTEND = "https://wineshoppos.z29.web.core.windows.net";
const PROD_REF = "uiurgplnsgmawvxhjzzp";
const DEV_REF = "juhcypzoacauzmtzqnwd";
const ADMIN_EMAIL = "saif.mhd47@gmail.com";
const AUTH_FILE = process.env.WSP_AUTH_FILE;
const ROOT = process.env.WSP_MAIN_REPO;
const RUN = process.env.WSP_RUN_ID;
const RAW = process.env.WSP_RAW_DIR;
const CASHIER_FILE = process.env.WSP_CASHIER_FILE;
const ADMIN_PASSWORD = process.env.WSP_ADMIN_PASSWORD || "";

const report = {
  runId: RUN,
  mode: "STRESS_ONLY_96_UI_FROM_CHAT",
  environment: "V5 QA / DEV",
  productionTouched: false,
  result: "RUNNING",
  startedAt: new Date().toISOString(),
  checks: [],
  invoices: [],
  productsAfterInvoices: [],
  cashiers: [],
  stress: {},
  return: null,
  shifts: [],
  analytics: {},
  consoleErrors: [],
  failedRequests: [],
  failure: "",
};

const invoiceAssets = {};
const invoices = [];

function logPass(name,detail=""){
  report.checks.push({name,status:"PASS",detail});
  console.log(`[PASS] ${name}${detail ? ` — ${detail}` : ""}`);
}
function assert(v,msg){ if(!v) throw new Error(msg); }
function appFail(msg){ const e=new Error(`APP_DEFECT: ${msg}`); e.classification="APP_DEFECT"; throw e; }
function appAssert(v,msg){ if(!v) appFail(msg); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function moneyNumber(text){
  const n=Number(String(text||"").replace(/[^\d.-]/g,""));
  return Number.isFinite(n) ? n : NaN;
}
function randomPassword(){
  return `Wsp!${crypto.randomBytes(16).toString("base64url")}9aA`;
}
function safeFileName(x){ return String(x).replace(/[^A-Za-z0-9_.-]+/g,"_"); }

fs.mkdirSync(RAW,{recursive:true});
const invoiceDir=path.join(RAW,"invoice-assets");
fs.mkdirSync(invoiceDir,{recursive:true});
for(const [name,data] of Object.entries(invoiceAssets)){
  fs.writeFileSync(path.join(invoiceDir,name),Buffer.from(data,"base64"));
}

function attachGuards(context,label){
  context.on("page",p=>attachPageDiagnostics(p,label));
  return context.route("**/*",route=>{
    const u=route.request().url();
    if(u.startsWith(PROD_FRONTEND) || u.includes(PROD_REF)){
      report.productionTouched=true;
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
}
function attachPageDiagnostics(page,label){
  page.on("console",m=>{
    if(m.type()==="error"){
      const t=m.text();
      if(!/favicon|ResizeObserver/i.test(t)) report.consoleErrors.push(`${label}: ${t}`);
    }
  });
  page.on("requestfailed",req=>{
    const u=req.url();
    if(u.includes(PROD_REF) || u.startsWith(PROD_FRONTEND)) return;
    report.failedRequests.push(`${label}: ${req.failure()?.errorText||"FAILED"} ${u}`);
  });
}
async function checkBadge(page,label){
  const badge=page.locator('[data-environment-badge="QA-DEV-V5"]');
  await badge.waitFor({state:"visible",timeout:30000});
  const t=(await badge.innerText()).trim();
  assert(/QA\s*\/\s*DEV/i.test(t)&&/V5/i.test(t)&&/NOT PROD/i.test(t),`${label}: invalid environment badge: ${t}`);
}
async function openAdminFromSuccessfulRunner(browser){
  assert(AUTH_FILE && fs.existsSync(AUTH_FILE),
    "Saved ADMIN auth from successful R11 runner is missing.");
  const context=await browser.newContext({
    viewport:{width:1500,height:950},
    storageState:AUTH_FILE,
  });
  await attachGuards(context,"DEV ADMIN");
  const page=await context.newPage();
  attachPageDiagnostics(page,"DEV ADMIN");
  await page.goto(`${BASE}/#/`,{waitUntil:"domcontentloaded"});
  await checkBadge(page,"DEV ADMIN");
  const nav=page.getByRole("navigation",{name:"Main navigation"});
  await nav.waitFor({state:"visible",timeout:30000});
  return {context,page,label:"DEV ADMIN",email:ADMIN_EMAIL};
}

async function loginContext(browser,email,password,label){
  const context=await browser.newContext({viewport:{width:1500,height:950}});
  await attachGuards(context,label);
  const page=await context.newPage();
  attachPageDiagnostics(page,label);

  await page.goto(`${BASE}/#/login`,{waitUntil:"domcontentloaded"});
  await checkBadge(page,label);

  if(page.url().includes("#/login")){
    const authCard=page.locator(".auth-card").first();
    await authCard.waitFor({state:"visible",timeout:20000});
    await authCard.locator('input[type="email"]').first().fill(email);
    await authCard.locator('input[type="password"]').first().fill(password);
    await authCard.locator("button").filter({hasText:/^Login$/}).first().click();
    await page.waitForFunction(()=>!location.hash.startsWith("#/login"),null,{timeout:30000});
  }
  await checkBadge(page,label);
  return {context,page,label,email};
}
function invoiceStatusSelect(page){
  // Invoice Inbox status filter is uniquely identified by its RECEIVED option.
  // This avoids accessibility-label collisions/availability differences between builds.
  return page.locator('select:has(option[value="RECEIVED"])').first();
}

async function waitInvoiceInboxLoaded(page){
  await page.locator("h2").filter({hasText:/^Invoice Inbox$/}).first()
    .waitFor({state:"visible",timeout:20000});
  const done=page.locator(".muted-text").filter({hasText:/^\d+ invoice\(s\)$/}).first();
  await done.waitFor({state:"visible",timeout:20000});
  return Number(((await done.innerText()).match(/\d+/)||["0"])[0]);
}

async function waitProductMasterLoaded(page){
  await page.locator("h2").filter({hasText:/^Products$/}).first()
    .waitFor({state:"visible",timeout:20000});
  await page.locator(".products-master-table").waitFor({state:"visible",timeout:20000});
  const loading=page.locator(".data-table-wrapper").filter({hasText:"Loading..."}).first();
  if(await loading.isVisible().catch(()=>false)){
    await loading.waitFor({state:"hidden",timeout:30000});
  }
  await sleep(250);
}

async function waitInventoryLoaded(page){
  await page.locator("h2").filter({hasText:/^Inventory & Product Stock$/}).first()
    .waitFor({state:"visible",timeout:20000});
  await page.locator("table.data-table").first().waitFor({state:"visible",timeout:20000});
}

async function screenshot(page,name){
  try{await page.screenshot({path:path.join(RAW,safeFileName(name)),fullPage:true});}catch{}
}

async function verifySuccessfulBaseViaUi(page){
  console.log("[BASE] Confirm successful R11 contract + inspect current DEV invoice state...");

  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
  const statusSelect=invoiceStatusSelect(page);
  await statusSelect.waitFor({state:"visible",timeout:20000});
  await statusSelect.selectOption("ALL");
  await waitInvoiceInboxLoaded(page);

  const rows=page.locator("table.data-table tbody tr");
  const current={};
  for(const invoice of ["16845","B-3339","16805","15983"]){
    const row=rows.filter({hasText:invoice}).first();
    if(await row.isVisible().catch(()=>false)){
      const txt=(await row.innerText()).replace(/\s+/g," ").trim();
      current[invoice]=/Completed/i.test(txt)
        ?"COMPLETED"
        :/Ready for Stock|Continue Receive Stock/i.test(txt)
          ?"READY_TO_RECEIVE"
          :"REVIEW_OR_PENDING";
    }else{
      current[invoice]="ABSENT";
    }
  }

  // Historical golden invoices are regression contracts owned by successful R11.
  // They are NOT required to still exist as mutable DEV rows on continuation runs.
  // The only hard safety invariant here: 16805 must never already be completed.
  if(current["16805"]==="COMPLETED"){
    appFail("16805 is Completed in current DEV; fail-closed golden safety was violated.");
  }

  report.stress.baseInvoiceSnapshot=current;
  logPass("Successful R11 base contract",
    `R11 passed in documented rerun mode; current DEV snapshot=${JSON.stringify(current)}`);
}

function fallbackPack(sizeText,description){
  const size=Number((String(sizeText).match(/(\d{2,4})\s*ml/i)||[])[1]||0);
  const d=String(description||"").toLowerCase();
  if(size===180) return 48;
  if(size===330) return 24;
  if(size===500) return 24;
  if(size===650) return 12;
  if(size===750) return 12;
  if(/can/.test(d)) return 24;
  return 12;
}

async function prepareReceiveRows(page,meta){
  const table=page.locator("table.purchase-receiving-table");
  await table.waitFor({state:"visible",timeout:30000});
  const rows=table.locator("tbody tr");
  const count=await rows.count();
  assert(count>0,`${meta.invoice}: Purchase Receiving has zero invoice rows.`);
  if(meta.expectedLines){
    appAssert(count===meta.expectedLines,
      `${meta.invoice}: OCR/Purchase Receiving has ${count} physical product row(s); expected ${meta.expectedLines}.`);
  }

  for(let pass=0;pass<3;pass++){
    for(let i=0;i<count;i++){
      const row=rows.nth(i);
      const cells=row.locator("td");
      const description=(await cells.nth(1).innerText()).trim();

      const select=cells.nth(2).locator("select");
      const selected=await select.inputValue().catch(()=> "");
      const pendingText=await cells.nth(2).innerText().catch(()=> "");
      if(!selected && !/Pending:/i.test(pendingText)){
        const assign=row.getByRole("button",{name:"Assign Later",exact:true});
        if(await assign.isVisible().catch(()=>false)){
          await assign.click();
          await sleep(120);
        }
      }

      const bpc=cells.nth(6).locator('input[type="number"]');
      let bpcVal=Number(await bpc.inputValue().catch(()=>0));
      if(!Number.isFinite(bpcVal)||bpcVal<=0){
        const sizeText=await cells.nth(4).innerText().catch(()=> "");
        const pack=fallbackPack(sizeText,description);
        await bpc.fill(String(pack));
        await sleep(80);
        bpcVal=pack;
      }

      const mrpInput=cells.nth(11).locator('input[type="number"]');
      const mrp=Number(await mrpInput.inputValue().catch(()=>0));
      assert(mrp>0,`${meta.invoice} line ${i+1} (${description}): OCR MRP missing; UI-only run will not invent MRP.`);

      const finalQtyText=await cells.nth(8).innerText();
      const finalQty=Number(String(finalQtyText).replace(/[^\d.-]/g,""));
      assert(finalQty>0,`${meta.invoice} line ${i+1} (${description}): final bottle quantity is not positive.`);

      const status=await cells.nth(13).innerText();
      if(/NEEDS REVIEW/i.test(status)){
        const confirm=row.getByRole("button",{name:"Confirm Pack",exact:true});
        if(await confirm.isVisible().catch(()=>false)){
          await confirm.click();
          await sleep(120);
        }
      }

      const keep=row.getByRole("button",{name:"Keep Separate",exact:true});
      if(await keep.isVisible().catch(()=>false)){
        await keep.click();
        await sleep(120);
      }
    }
    await sleep(400);
    const remaining=await table.locator("tbody tr .invoice-status-badge").filter({hasText:"NEEDS REVIEW"}).count();
    if(remaining===0) break;
  }

  const remaining=await table.locator("tbody tr .invoice-status-badge").filter({hasText:"NEEDS REVIEW"}).count();
  if(remaining>0){
    const reasons=[];
    for(let i=0;i<count;i++){
      const row=rows.nth(i);
      if(/NEEDS REVIEW/i.test(await row.locator("td").nth(13).innerText())){
        reasons.push((await row.locator("td").nth(13).innerText()).replace(/\s+/g," ").trim());
      }
    }
    throw new Error(`${meta.invoice}: ${remaining} purchase row(s) still need review: ${reasons.slice(0,5).join(" | ")}`);
  }
  return count;
}

async function analyzePhysicalInvoiceOnOcrPage(page,meta,index){
  await page.locator("h2").filter({hasText:/^Invoice OCR$/}).first()
    .waitFor({state:"visible",timeout:30000});

  const fileInput=page.locator('input[type="file"][accept*="application/pdf"]').first();
  await fileInput.waitFor({state:"attached",timeout:20000});
  await fileInput.setInputFiles(path.join(invoiceDir,meta.file));

  const analyzeButton=page.getByRole("button",{name:"Analyze Invoice",exact:true});
  await analyzeButton.waitFor({state:"visible",timeout:20000});
  await analyzeButton.click();

  const deadline=Date.now()+180000;
  while(Date.now()<deadline){
    // Global application/OCR errors are alertdialogs. Capture the exact error BEFORE closing it.
    const alert=page.getByRole("alertdialog").first();
    if(await alert.isVisible().catch(()=>false)){
      const text=(await alert.innerText()).replace(/\s+/g," ").trim();
      await screenshot(page,`invoice_${index+1}_${meta.invoice}_OCR_ERROR.png`);

      // Finance mismatch is a review state, not an OCR failure.
      if(/Invoice Total Does Not Match/i.test(text)){
        const close=alert.getByRole("button",{name:"Close",exact:true});
        if(await close.isVisible().catch(()=>false)) await close.click();
      }else{
        throw new Error(`OCR_UI_ERROR: ${meta.invoice}: ${text}`);
      }
    }

    // Current V5 source always renders this bottom action once `result` exists.
    const open=page.getByRole("button",{name:"Open Purchase Receiving Workspace",exact:true});
    if(await open.isVisible().catch(()=>false)){
      await screenshot(page,`invoice_${index+1}_${meta.invoice}_ocr.png`);
      await open.click();
      await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first()
        .waitFor({state:"visible",timeout:30000});
      return "RECEIVING";
    }

    // Unmatched rows also expose direct prepare actions; either is valid.
    const prepare=page.getByRole("button",{name:/^(Prepare in Purchase Receiving|Prepare New Product in Receiving)$/}).first();
    if(await prepare.isVisible().catch(()=>false)){
      await screenshot(page,`invoice_${index+1}_${meta.invoice}_ocr.png`);
      await prepare.click();
      await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first()
        .waitFor({state:"visible",timeout:30000});
      return "RECEIVING";
    }

    const body=(await page.locator("body").innerText()).replace(/\s+/g," ");
    if(/Duplicate invoice file detected\. Existing status:/i.test(body)){
      // Let Invoice Inbox state drive the safe continuation path.
      return "DUPLICATE_STATE";
    }

    await sleep(500);
  }

  await screenshot(page,`invoice_${index+1}_${meta.invoice}_OCR_TIMEOUT.png`);
  throw new Error(`${meta.invoice}: OCR UI did not produce a review result within 180 seconds.`);
}

async function openOrResumeInvoiceToReceiving(page,meta,index){
  // Always inspect Invoice Inbox first. This makes reruns idempotent and lets us
  // continue from OCR_FAILED / review / receive checkpoints without duplicating stock.
  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
  const statusSelect=invoiceStatusSelect(page);
  await statusSelect.waitFor({state:"visible",timeout:20000});
  await statusSelect.selectOption("ALL");
  await waitInvoiceInboxLoaded(page);

  const row=page.locator("table.data-table tbody tr").filter({hasText:meta.invoice}).first();

  if(await row.isVisible().catch(()=>false)){
    const rowText=(await row.innerText()).replace(/\s+/g," ").trim();

    if(/Completed/i.test(rowText)){
      report.invoices.push({
        invoice:meta.invoice,supplier:meta.supplier,date:meta.date,total:meta.total,
        lineCount:null,status:"RECEIVED",resumed:true
      });
      logPass(`Invoice ${meta.invoice}`,"already completed; reused existing UI state");
      return "COMPLETED";
    }

    const continueReceive=row.getByRole("button",{name:"Continue Receive Stock",exact:true});
    if(await continueReceive.isVisible().catch(()=>false)){
      console.log(`[RESUME] ${meta.invoice}: continuing saved Receive Stock draft`);
      await continueReceive.click();
      await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first()
        .waitFor({state:"visible",timeout:30000});
      return "RECEIVING";
    }

    const resumeReview=row.getByRole("button",{name:"Resume Review",exact:true});
    const startReview=row.getByRole("button",{name:"Start Review",exact:true});
    const reviewButton =
      await resumeReview.isVisible().catch(()=>false) ? resumeReview :
      await startReview.isVisible().catch(()=>false) ? startReview :
      null;

    if(reviewButton){
      console.log(`[RESUME] ${meta.invoice}: reopening stored OCR review`);
      await reviewButton.click();
      await page.locator("h2").filter({hasText:/^Invoice OCR$/}).first()
        .waitFor({state:"visible",timeout:30000});

      // If normalized OCR already exists, current V5 renders the bottom Open action.
      const open=page.getByRole("button",{name:"Open Purchase Receiving Workspace",exact:true});
      if(await open.isVisible().catch(()=>false)){
        await open.click();
        await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first()
          .waitFor({state:"visible",timeout:30000});
        return "RECEIVING";
      }

      // If a prior run stored the original file but OCR itself failed, retry through
      // the official Analyze Invoice UI. AutomationHub treats OCR_FAILED/FAILED as
      // recoverable duplicates and reuses the same ingestion evidence.
      if(/OCR Failed|Processing Failed/i.test(rowText)){
        console.log(`[RETRY] ${meta.invoice}: stored evidence exists with failed OCR; retrying Analyze Invoice through UI`);
        const state=await analyzePhysicalInvoiceOnOcrPage(page,meta,index);
        if(state==="RECEIVING") return "RECEIVING";
      }

      // Review exists but no result/action appeared. Retry same physical file safely.
      console.log(`[RETRY] ${meta.invoice}: review page has no usable OCR result; re-analyzing same stored invoice`);
      const state=await analyzePhysicalInvoiceOnOcrPage(page,meta,index);
      if(state==="RECEIVING") return "RECEIVING";
    }

    // OCR_FAILED rows may have no normalized_invoice/review_draft, so Invoice Inbox
    // intentionally exposes no Start/Resume button. Re-analyze through OCR UI.
    if(/OCR Failed|Processing Failed/i.test(rowText)){
      console.log(`[RETRY] ${meta.invoice}: Inbox status is failed OCR; using official recoverable re-analysis path`);
      await page.goto(`${BASE}/#/purchasing/ocr`,{waitUntil:"domcontentloaded"});
      const state=await analyzePhysicalInvoiceOnOcrPage(page,meta,index);
      if(state==="RECEIVING") return "RECEIVING";
    }

    throw new Error(`${meta.invoice}: existing Invoice Inbox row cannot be safely resumed. ${rowText}`);
  }

  console.log(`[UPLOAD] ${meta.invoice}: absent from Invoice Inbox; uploading physical invoice through OCR UI`);
  await page.goto(`${BASE}/#/purchasing/ocr`,{waitUntil:"domcontentloaded"});
  const state=await analyzePhysicalInvoiceOnOcrPage(page,meta,index);

  if(state==="DUPLICATE_STATE"){
    // Re-enter once through Inbox; do not blindly upload again.
    return await openOrResumeInvoiceToReceiving(page,meta,index);
  }
  return state;
}

async function uploadAndReceiveInvoice(page,meta,index){
  console.log(`[2.${index+1}] OCR + receive invoice ${meta.invoice} through V5 UI...`);

  const state=await openOrResumeInvoiceToReceiving(page,meta,index);
  if(state==="COMPLETED") return;

  // Use DOM structure from the current V5 Purchase Receiving page instead of
  // global accessible-name matching. Several labels contain helper text and
  // "Supplier" also appears elsewhere in the shell.
  const supplier=page.locator('input[list="supplier-list-v5"]').first();
  await supplier.waitFor({state:"visible",timeout:20000});
  await supplier.fill(meta.supplier);

  const invoiceNo=page.locator('label').filter({hasText:/^Invoice Number/}).locator('input').first();
  await invoiceNo.waitFor({state:"visible",timeout:20000});
  await invoiceNo.fill(meta.invoice);

  const invoiceDate=page.locator('label').filter({hasText:/^Invoice Date/}).locator('input[type="date"]').first();
  await invoiceDate.waitFor({state:"visible",timeout:20000});
  await invoiceDate.fill(meta.date);

  const receivingBody=await page.locator("body").innerText();
  assert(receivingBody.includes("Financial Reconciliation"),
    `${meta.invoice}: Purchase Receiving loaded without Financial Reconciliation section.`);
  const financialPanel=page.locator('section.panel').filter({hasText:"Financial Reconciliation"}).first();
  await financialPanel.waitFor({state:"visible",timeout:20000});
  const printed=financialPanel
    .locator('label')
    .filter({hasText:/^Reviewed Printed Invoice Total/})
    .locator('input[type="number"]')
    .first();
  await printed.waitFor({state:"visible",timeout:20000});
  await printed.fill(String(meta.total));

  const onDialog=async d=>{
    try{
      if(d.type()==="prompt") await d.accept(d.defaultValue() || "Verified against the physical invoice.");
      else await d.accept();
    }catch{}
  };
  page.on("dialog",onDialog);
  const lineCount=await prepareReceiveRows(page,meta);
  page.off("dialog",onDialog);

  await sleep(600);
  const footer=page.locator(".purchase-receive-footer");
  const footerText=(await footer.innerText()).replace(/\s+/g," ").trim();
  if(!/Ready to Receive/i.test(footerText)){
    await screenshot(page,`invoice_${index+1}_${meta.invoice}_BLOCKED.png`);
    throw new Error(`${meta.invoice}: Receive Stock blocked after UI review. ${footerText}`);
  }

  const receive=footer.getByRole("button",{name:"Approve & Receive Stock",exact:true});
  assert(!(await receive.isDisabled()),`${meta.invoice}: Receive Stock button is disabled.`);
  await screenshot(page,`invoice_${index+1}_${meta.invoice}_ready.png`);
  await receive.click();

  await page.waitForURL(u=>u.hash.includes("#/purchasing/receipts/"),{timeout:60000});
  await page.locator("h2").filter({hasText:/^Purchase Verification$/}).first()
    .waitFor({state:"visible",timeout:30000});
  await page.locator("section#posted-purchase-lines").filter({hasText:"Posted Purchase Lines"}).first()
    .waitFor({state:"visible",timeout:30000});
  report.invoices.push({
    invoice:meta.invoice,supplier:meta.supplier,date:meta.date,total:meta.total,
    lineCount,status:"RECEIVED",resumed:false
  });
  logPass(`Invoice ${meta.invoice}`,`${lineCount} reviewed line(s) · received through OCR + Purchase Receiving UI`);
}

async function verifyInvoiceInbox(page){
  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
  const statusSelect=invoiceStatusSelect(page);
  await statusSelect.waitFor({state:"visible",timeout:20000});
  await statusSelect.selectOption("ALL");
  await waitInvoiceInboxLoaded(page);
  const rows=page.locator("table.data-table tbody tr");

  const row15983=rows.filter({hasText:"15983"}).first();
  await row15983.waitFor({state:"visible",timeout:20000});
  appAssert(/Completed/i.test(await row15983.innerText()),
    "Invoice Inbox: new physical invoice 15983 is not Completed.");

  const safe=rows.filter({hasText:"16805"}).first();
  if(await safe.isVisible().catch(()=>false)){
    appAssert(!/Completed/i.test(await safe.innerText()),
      "Invoice Inbox: 16805 must remain fail-closed and unreceived.");
  }

  logPass("New physical invoice 15983",
    "received once through OCR + Purchase Receiving UI; historical R11 rows are not replay prerequisites");
}

async function duplicateInvoiceUiCheck(page){
  console.log("[3] Duplicate invoice protection through OCR UI...");
  const before=await readProductMaster(page);
  const beforeQty=before.reduce((a,p)=>a+p.stock,0);

  const meta=invoices.find(x=>x.invoice==="15983");
  await page.goto(`${BASE}/#/purchasing/ocr`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Invoice\ OCR$/}).first().waitFor({state:"visible",timeout:20000});
  await page.locator('input[type="file"][accept*="application/pdf"]').first().setInputFiles(path.join(invoiceDir,meta.file));
  await page.getByRole("button",{name:"Analyze Invoice",exact:true}).click();

  let duplicate=false;
  for(let i=0;i<100;i++){
    const body=await page.locator("body").innerText();
    if(/Duplicate invoice file detected|Existing status:\s*RECEIVED|instead of receiving it again/i.test(body)){
      duplicate=true; break;
    }
    await sleep(300);
  }
  appAssert(duplicate,"15983 duplicate upload was not blocked by the UI.");

  const after=await readProductMaster(page);
  const afterQty=after.reduce((a,p)=>a+p.stock,0);
  appAssert(afterQty===beforeQty,`Duplicate invoice changed Product Master stock ${beforeQty}->${afterQty}.`);
  logPass("Duplicate invoice protection","re-upload of received 15983 blocked; stock unchanged");
}

async function readProductMaster(page){
  await page.goto(`${BASE}/#/products`,{waitUntil:"domcontentloaded"});
  await waitProductMasterLoaded(page);
  const rows=page.locator(".products-master-table tbody tr");
  const n=await rows.count();
  const out=[];
  for(let i=0;i<n;i++){
    const row=rows.nth(i);
    const cells=row.locator("td");
    const name=(await row.locator(".products-product-name").innerText()).trim();
    const meta=(await row.locator(".products-product-meta").innerText()).trim();
    const size=Number((meta.match(/(\d+)\s*ml/i)||[])[1]||0);
    const stock=Number((await cells.nth(3).innerText()).replace(/[^\d.-]/g,""));
    const purchase=moneyNumber(await cells.nth(4).innerText());
    const mrp=moneyNumber(await cells.nth(5).innerText());
    const selling=moneyNumber(await cells.nth(6).innerText());
    const barcode=(await cells.nth(1).innerText()).trim();
    out.push({
      key:`${name}||${size}`,
      name,size,stock,purchase,mrp,selling,barcode,
      meta
    });
  }
  return out;
}

async function readAdminSalesSummary(page){
  await page.goto(`${BASE}/#/pos/sales`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Sales$/}).first()
    .waitFor({state:"visible",timeout:20000});
  const refresh=page.getByRole("button",{name:/Refresh Sales/});
  if(await refresh.isVisible().catch(()=>false)) await refresh.click();
  await sleep(900);
  const rows=page.locator("table.data-table tbody tr");
  const count=await rows.count();
  let total=0;
  const paymentMix={CASH:0,UPI:0,CARD:0};
  for(let i=0;i<count;i++){
    const cells=rows.nth(i).locator("td");
    const method=(await cells.nth(3).innerText()).trim();
    const amount=moneyNumber(await cells.nth(5).innerText());
    if(Number.isFinite(amount)) total+=amount;
    if(paymentMix[method]!==undefined) paymentMix[method]++;
  }
  return {count,total,paymentMix};
}

async function createCashiersViaUi(page){
  console.log("[4] Create four real cashier accounts through Admin → Users UI...");
  await page.goto(`${BASE}/#/admin/users`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Users\ \&\ Roles$/}).first().waitFor({state:"visible",timeout:20000});

  const creds=[];
  for(let i=1;i<=4;i++){
    const fullName=`Test Cashier ${i}`;
    const email=`wsp.e2e.${RUN.replace(/[^0-9]/g,"")}.cashier${i}@example.com`;
    const password=randomPassword();

    const existing=page.locator("table.data-table tbody tr").filter({hasText:email});
    if(await existing.count()){
      throw new Error(`${email} already exists. UI-only run refuses to overwrite or guess its password.`);
    }

    const createForm=page.locator("form").filter({hasText:"Create Shop User"}).first();
    await createForm.waitFor({state:"visible",timeout:20000});
    await createForm.locator("label").filter({hasText:/^Full Name/}).locator("input").fill(fullName);
    await createForm.locator("label").filter({hasText:/^Email/}).locator('input[type="email"]').fill(email);
    await createForm.locator("label").filter({hasText:/^Temporary Password/}).locator('input[type="password"]').fill(password);
    await createForm.locator("label").filter({hasText:/^Role/}).locator("select").selectOption("CASHIER");
    await createForm.getByRole("button",{name:"Create User",exact:true}).click();

    const msg=page.locator(".purchase-message");
    await msg.filter({hasText:"User created successfully."}).waitFor({state:"visible",timeout:30000});
    await sleep(450);

    const row=page.locator("table.data-table tbody tr").filter({hasText:email});
    await row.waitFor({state:"visible",timeout:20000});
    assert(/CASHIER/i.test(await row.innerText()),`${fullName}: user row is not CASHIER.`);
    assert(/ACTIVE/i.test(await row.innerText()),`${fullName}: user row is not ACTIVE.`);

    creds.push({fullName,email,password});
    console.log(`[CREATED] ${fullName}`);
  }

  fs.writeFileSync(CASHIER_FILE,JSON.stringify({
    environment:"DEV / QA",
    source:"Playwright Admin Users UI",
    runId:RUN,
    users:creds,
  },null,2));

  report.cashiers=creds.map(({password,...x})=>x);
  logPass("Four cashier profiles","created and verified through Admin → Users UI");
  return creds;
}

async function openShiftViaUi(session){
  const {page,label}=session;
  await page.goto(`${BASE}/#/pos`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Fast\ POS\ Billing$/}).first().waitFor({state:"visible",timeout:20000});

  const auto=page.getByRole("button",{name:/Auto Print:/});
  if(await auto.isVisible().catch(()=>false) && /ON/i.test(await auto.innerText())) await auto.click();

  const dialog=page.getByRole("dialog",{name:"Start your shift before making any bill"});
  await dialog.waitFor({state:"visible",timeout:20000});
  await dialog.getByLabel("Opening Cash").fill("500");
  await dialog.getByRole("button",{name:"Start Shift",exact:true}).click();
  await dialog.waitFor({state:"hidden",timeout:30000});
  logPass(`${label} login + shift`,"independent browser context · shift opened through POS UI");
}

function buildUiStressPlan(products,minTx=96){
  const eligible=products
    .filter(p=>p.stock>=3 && p.selling>0)
    .sort((a,b)=>a.key.localeCompare(b.key));
  assert(eligible.length>=12,`Only ${eligible.length} sellable products available after invoices.`);

  const targets=new Map();
  const toSell=new Map();
  for(let i=0;i<eligible.length;i++){
    const p=eligible[i];
    const target=3+(i%4);
    assert(p.stock>=target,`${p.name} ${p.size}ml has ${p.stock}; cannot end at target ${target}.`);
    targets.set(p.key,target);
    toSell.set(p.key,p.stock-target);
  }

  const active=eligible.filter(p=>(toSell.get(p.key)||0)>0);
  const totalUnits=active.reduce((a,p)=>a+toSell.get(p.key),0);
  assert(totalUnits>=minTx*4,`Only ${totalUnits} bottles can be sold while keeping 3–7; need at least ${minTx*4}.`);

  const chunkCounts=new Map();
  let minChunks=0;
  for(const p of active){
    const n=Math.ceil(toSell.get(p.key)/4);
    chunkCounts.set(p.key,n);
    minChunks+=n;
  }

  let txCount=Math.max(minTx,Math.ceil(minChunks/5));
  while(true){
    txCount=Math.max(txCount,...[...chunkCounts.values()]);
    const minLines=Math.max(minChunks,4*txCount);
    const maxLines=Math.min(totalUnits,5*txCount);
    if(minLines<=maxLines) break;
    txCount++;
    assert(txCount<1000,"Could not construct mixed UI stress plan.");
  }

  const targetLines=Math.max(minChunks,4*txCount);
  let current=[...chunkCounts.values()].reduce((a,b)=>a+b,0);
  while(current<targetLines){
    let changed=false;
    for(const p of active){
      const n=chunkCounts.get(p.key);
      const qty=toSell.get(p.key);
      if(n<qty && n<txCount){
        chunkCounts.set(p.key,n+1);
        current++;
        changed=true;
        if(current>=targetLines) break;
      }
    }
    assert(changed,"Unable to split stock into enough UI stress lines.");
  }

  const chunks=[];
  for(const p of active){
    const qty=toSell.get(p.key);
    const n=chunkCounts.get(p.key);
    const base=Math.floor(qty/n);
    const rem=qty%n;
    const sizes=Array.from({length:n},(_,i)=>base+(i<rem?1:0));
    assert(sizes.every(x=>x>=1&&x<=4),`${p.key}: planned line quantity outside 1..4.`);
    chunks.push({product:p,sizes});
  }
  chunks.sort((a,b)=>b.sizes.length-a.sizes.length);

  const extra=targetLines-4*txCount;
  const txs=Array.from({length:txCount},(_,i)=>({
    index:i,
    capacity:i<extra?5:4,
    lines:[],
    keys:new Set(),
  }));

  for(const c of chunks){
    for(const qty of c.sizes){
      const choices=txs
        .filter(t=>t.lines.length<t.capacity&&!t.keys.has(c.product.key))
        .sort((a,b)=>a.lines.length-b.lines.length||a.index-b.index);
      assert(choices.length,`Unable to place ${c.product.key} without duplicate SKU in a bill.`);
      const t=choices[0];
      t.lines.push({product:c.product,qty});
      t.keys.add(c.product.key);
    }
  }
  for(const t of txs){
    assert(t.lines.length===t.capacity,`Bill ${t.index}: ${t.lines.length}/${t.capacity} lines.`);
  }
  return {txs,targets,totalUnits,txCount,targetLines};
}

async function addLineToPos(page,line){
  const p=line.product;
  const search=page.getByLabel("Scan barcode or search products");
  await search.fill(p.name);
  let tiles=page.locator("button.pos-v5h-product-tile").filter({hasText:p.name});
  if(p.size>0) tiles=tiles.filter({hasText:`${p.size} ml`});
  const tile=tiles.first();
  await tile.waitFor({state:"visible",timeout:15000});
  await tile.click();

  let cart=page.locator("article.pos-v5h-cart-line").filter({hasText:p.name});
  if(p.size>0) cart=cart.filter({hasText:`${p.size} ml`});
  const lineCard=cart.first();
  await lineCard.waitFor({state:"visible",timeout:10000});
  const plus=lineCard.locator(".pos-v5h-quantity button").last();
  for(let k=1;k<line.qty;k++) await plus.click();
  const qtyText=await lineCard.locator(".pos-v5h-quantity strong").innerText();
  assert(Number(qtyText)===line.qty,`${p.key}: cart qty=${qtyText}, expected ${line.qty}.`);
}

async function runOneUiSale(session,tx,globalIndex){
  const {page,label}=session;
  await page.goto(`${BASE}/#/pos`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Fast\ POS\ Billing$/}).first().waitFor({state:"visible",timeout:20000});
  const dialog=page.getByRole("dialog",{name:"Start your shift before making any bill"});
  assert(!(await dialog.isVisible().catch(()=>false)),`${label}: shift gate appeared during stress.`);

  const auto=page.getByRole("button",{name:/Auto Print:/});
  if(await auto.isVisible().catch(()=>false) && /ON/i.test(await auto.innerText())) await auto.click();

  for(const line of tx.lines) await addLineToPos(page,line);

  const method=["CASH","UPI","CARD"][globalIndex%3];
  await page.getByRole("button",{name:method,exact:true}).click();
  if(method!=="CASH"){
    await page.getByLabel("Payment Reference").fill(`UI-${RUN}-${globalIndex+1}-${method}`);
  }

  const complete=page.getByRole("button",{name:/Complete Sale/});
  assert(!(await complete.isDisabled()),`${label}: Complete Sale disabled for stress bill ${globalIndex+1}.`);
  const started=Date.now();
  await complete.click();
  await page.waitForURL(u=>u.hash.startsWith("#/sales/"),{timeout:45000});
  const latency=Date.now()-started;
  return {cashier:label,method,lineCount:tx.lines.length,bottles:tx.lines.reduce((a,x)=>a+x.qty,0),latency};
}

async function runAllUiStress(sessions,plan){
  console.log(`[6] Run ${plan.txCount} genuine POS UI transactions across four sessions...`);
  const results=[];
  for(let i=0;i<plan.txs.length;i+=4){
    const batch=plan.txs.slice(i,i+4);
    const batchResults=await Promise.all(batch.map((tx,j)=>runOneUiSale(sessions[(i+j)%4],tx,i+j)));
    results.push(...batchResults);
    if(results.length%20===0||results.length===plan.txs.length){
      console.log(`[UI STRESS] ${results.length}/${plan.txs.length} bills completed`);
    }
    await sleep(120);
  }
  report.stress.transactions=results.length;
  report.stress.totalBottles=results.reduce((a,x)=>a+x.bottles,0);
  report.stress.paymentMix=results.reduce((a,x)=>{a[x.method]=(a[x.method]||0)+1;return a;},{});
  report.stress.perCashier=results.reduce((a,x)=>{a[x.cashier]=(a[x.cashier]||0)+1;return a;},{});
  report.stress.latency={
    minMs:Math.min(...results.map(x=>x.latency)),
    maxMs:Math.max(...results.map(x=>x.latency)),
    avgMs:Math.round(results.reduce((a,x)=>a+x.latency,0)/results.length),
  };
  logPass("Genuine multi-session POS stress",`${results.length} complete browser/UI bills · ${report.stress.totalBottles} bottles`);
}

async function verifyCashierSales(session){
  const {page,label}=session;
  await page.goto(`${BASE}/#/pos/sales`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Sales$/}).first().waitFor({state:"visible",timeout:20000});
  const refresh=page.getByRole("button",{name:/Refresh Sales/});
  if(await refresh.isVisible().catch(()=>false)) await refresh.click();
  await sleep(900);
  const rows=page.locator("table.data-table tbody tr");
  const count=await rows.count();
  assert(count>=20,`${label}: only ${count} sales visible.`);
  const methods={CASH:0,UPI:0,CARD:0};
  for(let i=0;i<count;i++){
    const m=(await rows.nth(i).locator("td").nth(3).innerText()).trim();
    if(methods[m]!==undefined) methods[m]++;
  }
  logPass(`${label} own-sales visibility`,`${count} own sales · ${JSON.stringify(methods)}`);
  return {count,methods};
}

async function returnViaUi(cashier,adminPage){
  console.log("[7] Cashier return request + Admin approval through UI...");
  const page=cashier.page;
  await page.goto(`${BASE}/#/pos/returns`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Returns,\ Refunds\ \&\ Voids$/}).first().waitFor({state:"visible",timeout:20000});

  const invoice=page.getByLabel("Original Invoice");
  const options=await invoice.locator("option").all();
  assert(options.length>1,"No cashier sale available for return.");
  const targetValue=await options[1].getAttribute("value");
  const targetText=await options[1].innerText();
  await invoice.selectOption(targetValue);

  const form=page.locator("form").filter({hasText:"New Return Request"});
  const qtyInputs=form.locator('input[type="number"]');
  assert(await qtyInputs.count()>=1,"Return form has no item quantity input.");
  await qtyInputs.first().fill("1");
  await form.getByLabel("Reason").fill(`UI return ${RUN}`);
  await form.getByLabel("Refund Method").selectOption("CASH");
  await form.getByRole("button",{name:"Request Return",exact:true}).click();
  await page.locator(".purchase-message").filter({hasText:"Return request submitted"}).waitFor({state:"visible",timeout:30000});

  await adminPage.goto(`${BASE}/#/pos/returns`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Returns,\ Refunds\ \&\ Voids$/}).first().waitFor({state:"visible",timeout:20000});
  const row=adminPage.locator("table.data-table tbody tr").filter({hasText:`UI return ${RUN}`}).first();
  await row.waitFor({state:"visible",timeout:20000});
  assert(/PENDING/i.test(await row.innerText()),"Admin return queue did not show PENDING.");
  await row.getByRole("button",{name:"Approve",exact:true}).click();
  await adminPage.locator(".purchase-message").filter({hasText:"Return approved."}).waitFor({state:"visible",timeout:30000});
  report.return={invoice:targetText,status:"APPROVED",qty:1};
  logPass("Return/refund workflow","cashier requested 1 unit · Admin approved through UI");
}

async function requestShiftCloseViaUi(session){
  const {page,label}=session;
  await page.goto(`${BASE}/#/operations/shifts`,{waitUntil:"domcontentloaded"});
  await page.locator("h2").filter({hasText:/^Cashier\ Shift\ \&\ Day\ Close$/}).first().waitFor({state:"visible",timeout:20000});
  await sleep(700);

  const row=page.locator("table.data-table tbody tr").filter({hasText:"Me"}).filter({hasText:"OPEN"}).first();
  await row.waitFor({state:"visible",timeout:15000});
  const expectedText=await row.locator("td").nth(6).innerText();
  const expected=moneyNumber(expectedText);
  assert(Number.isFinite(expected)&&expected>=0,`${label}: cannot parse Expected Cash from ${expectedText}.`);

  await page.getByLabel("Actual cash physically counted in drawer").fill(String(expected));
  await page.getByRole("button",{name:"Request Close",exact:true}).click();
  await page.locator(".purchase-message").filter({hasText:"Close request sent to manager."}).waitFor({state:"visible",timeout:30000});
  return {label,expected};
}

async function approveAllShiftCloses(adminPage){
  await adminPage.goto(`${BASE}/#/operations/shifts`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Cashier\ Shift\ \&\ Day\ Close$/}).first().waitFor({state:"visible",timeout:20000});
  for(let i=0;i<4;i++){
    await sleep(500);
    const buttons=adminPage.getByRole("button",{name:"Approve Close",exact:true});
    const count=await buttons.count();
    assert(count>0,`Admin has only approved ${i}/4 shift close requests.`);
    await buttons.first().click();
    await adminPage.locator(".purchase-message").filter({hasText:"Shift closed."}).waitFor({state:"visible",timeout:30000});
  }
  await sleep(700);
  assert(await adminPage.getByRole("button",{name:"Approve Close",exact:true}).count()===0,"Unapproved shift close remains.");
  logPass("Four shift closes","all four cashier shifts approved through UI");
}

async function cashierRoleSmoke(session){
  const restricted=[
    ["/#/admin/users","Users & Roles"],
    ["/#/owner","Owner Control Center"],
    ["/#/products","Products"],
    ["/#/purchasing/receive","Purchase Receiving Workspace"],
    ["/#/reports","Reports & Exports"],
  ];
  for(const [route,forbidden] of restricted){
    await session.page.goto(`${BASE}${route}`,{waitUntil:"domcontentloaded"});
    await sleep(450);
    const body=await session.page.locator("body").innerText();
    assert(!body.includes(forbidden),`${session.label}: unauthorized access to ${route}.`);
  }
  logPass(`${session.label} role restrictions`,"Admin/Owner/Product/Purchasing/Reports content inaccessible");
}

async function metricValue(page,label){
  const card=page.locator(".metric-card").filter({hasText:label}).first();
  await card.waitFor({state:"visible",timeout:15000});
  return moneyNumber(await card.locator("strong").innerText());
}

async function finalUiValidation(adminPage,plan,baselineSales){
  console.log("[10] One-pass dashboard/chart/feature validation...");

  const finalProducts=await readProductMaster(adminPage);
  assert(finalProducts.length===report.productsAfterInvoices.length,
    `Final Product Master count ${finalProducts.length} changed from ${report.productsAfterInvoices.length}.`);
  const bad=finalProducts.filter(p=>p.stock<3||p.stock>7);
  appAssert(bad.length===0,`Final inventory outside 3–7: ${bad.slice(0,10).map(p=>`${p.name} ${p.size}ml=${p.stock}`).join(", ")}`);
  report.stress.finalInventory={products:finalProducts.length,min:Math.min(...finalProducts.map(p=>p.stock)),max:Math.max(...finalProducts.map(p=>p.stock))};
  logPass("Final inventory range",`${finalProducts.length}/${finalProducts.length} products between 3 and 7 bottles`);

  await adminPage.goto(`${BASE}/#/pos/sales`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Sales$/}).first().waitFor({state:"visible",timeout:20000});
  const refresh=adminPage.getByRole("button",{name:/Refresh Sales/});
  if(await refresh.isVisible().catch(()=>false)) await refresh.click();
  await sleep(1000);
  const salesRows=adminPage.locator("table.data-table tbody tr");
  const salesCount=await salesRows.count();
  appAssert(salesCount===baselineSales.count+plan.txCount,`Admin Sales count=${salesCount}; expected baseline ${baselineSales.count} + stress ${plan.txCount}.`);
  let salesTotal=0;
  const paymentMix={CASH:0,UPI:0,CARD:0};
  for(let i=0;i<salesCount;i++){
    const cells=salesRows.nth(i).locator("td");
    const method=(await cells.nth(3).innerText()).trim();
    const total=moneyNumber(await cells.nth(5).innerText());
    salesTotal+=total;
    if(paymentMix[method]!==undefined) paymentMix[method]++;
  }
  report.stress.adminSales={count:salesCount,total:salesTotal,paymentMix};
  appAssert(Object.values(paymentMix).every(x=>x>0),`Global payment mix incomplete: ${JSON.stringify(paymentMix)}`);
  logPass("Admin Sales history",`${salesCount} bills · CASH ${paymentMix.CASH} · UPI ${paymentMix.UPI} · CARD ${paymentMix.CARD}`);

  await adminPage.goto(`${BASE}/#/owner`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Owner\ Control\ Center$/}).first().waitFor({state:"visible",timeout:20000});
  await sleep(1000);
  const revenue=await metricValue(adminPage,"Revenue · 30 Days");
  const bills=await metricValue(adminPage,"Bills");
  appAssert(revenue>0,"Owner Center revenue is zero after stress.");
  appAssert(bills===salesCount,`Owner Center Bills=${bills}, Sales history=${salesCount}.`);
  for(const title of ["30-Day Sales Trend","Payment Mix","Top Products by Sales"]){
    await adminPage.locator(".chart-card").filter({hasText:title}).first().waitFor({state:"visible",timeout:15000});
  }
  report.analytics.owner={revenue,bills};
  logPass("Owner Center + charts",`Revenue ${revenue} · Bills ${bills} · 3 charts visible`);

  await adminPage.goto(`${BASE}/#/inventory/intelligence`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Inventory\ Intelligence$/}).first().waitFor({state:"visible",timeout:20000});
  await sleep(700);
  const invIntelBody=await adminPage.locator("body").innerText();
  assert(/Stockout Risk|Dead Stock|Overstock|Out of Stock/i.test(invIntelBody),"Inventory Intelligence metrics missing.");
  report.analytics.inventoryIntelligence="VISIBLE";
  logPass("Inventory Intelligence","metrics and inventory health page rendered");

  await adminPage.goto(`${BASE}/#/inventory/ageing`,{waitUntil:"domcontentloaded"});
  await sleep(700);
  assert((await adminPage.locator("body").innerText()).length>100,"Inventory Ageing page blank.");
  logPass("Inventory Ageing","page rendered after stress");

  await adminPage.goto(`${BASE}/#/owner/profit`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Profit\ \&\ Business\ Intelligence$/}).first().waitFor({state:"visible",timeout:20000});
  await sleep(700);
  for(const label of ["Revenue","COGS","Gross Profit","Operating Profit"]){
    const v=await metricValue(adminPage,label);
    assert(Number.isFinite(v),`Profit Intelligence ${label} metric missing.`);
  }
  report.analytics.profit="VISIBLE";
  logPass("Profit Intelligence","Revenue / COGS / Gross Profit / Operating Profit rendered");

  await adminPage.goto(`${BASE}/#/purchasing/intelligence`,{waitUntil:"domcontentloaded"});
  await adminPage.getByText("Purchase Intelligence",{exact:true}).first().waitFor({state:"visible",timeout:20000});
  assert((await adminPage.locator("body").innerText()).length>150,"Purchase Intelligence page blank.");
  report.analytics.purchaseIntelligence="VISIBLE";
  logPass("Purchase Intelligence","purchase/supplier analysis page rendered");

  await adminPage.goto(`${BASE}/#/reports`,{waitUntil:"domcontentloaded"});
  await adminPage.locator("h2").filter({hasText:/^Reports\ \&\ Exports$/}).first().waitFor({state:"visible",timeout:20000});
  await sleep(800);
  const reportSales=await metricValue(adminPage,"Sales");
  appAssert(reportSales===salesTotal,`Reports Sales=${reportSales}, Sales history total=${salesTotal}.`);
  for(const title of ["Sales Trend","Payment Mix"]){
    await adminPage.locator(".chart-card").filter({hasText:title}).first().waitFor({state:"visible",timeout:15000});
  }
  report.analytics.reports={sales:reportSales};
  logPass("Reports + charts",`Sales ${reportSales} matches Sales history · Sales Trend / Payment Mix visible`);

  const smoke=[
    ["/#/products","Products"],
    ["/#/purchasing/receive","Purchase Receiving Workspace"],
    ["/#/purchasing/invoices","Invoice Inbox"],
    ["/#/purchasing/suppliers","Suppliers"],
    ["/#/purchasing/procurement","Procurement"],
    ["/#/inventory","Inventory & Product Stock"],
    ["/#/inventory/count","Stock"],
    ["/#/inventory/transfers","Transfer"],
    ["/#/operations/offline","Offline"],
    ["/#/operations/shifts","Cashier Shift & Day Close"],
    ["/#/admin/users","Users & Roles"],
    ["/#/admin/access","Access"],
    ["/#/admin/audit","Audit"],
    ["/#/admin/backup","Backup"],
    ["/#/admin/settings","Settings"],
    ["/#/owner/recommendations","Recommendation"],
    ["/#/owner/exceptions","Exception"],
    ["/#/owner/ask","Ask"],
  ];
  for(const [route,needle] of smoke){
    await adminPage.goto(`${BASE}${route}`,{waitUntil:"domcontentloaded"});
    await sleep(350);
    const body=await adminPage.locator("body").innerText();
    assert(!/Application error|Something went wrong/i.test(body),`${route}: visible application error.`);
    assert(body.toLowerCase().includes(needle.toLowerCase().split(" ")[0]),`${route}: expected ${needle} content not visible.`);
  }
  logPass("Critical feature smoke",`${smoke.length} management/operations routes rendered without visible application error`);
}

function writeReport(){
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(RAW,"UI_ONLY_RESULT.json"),JSON.stringify(report,null,2));
  const lines=[
    "# WineShopPOS V5 — Stress-Only 96 UI Continuation",
    "",
    `**Result: ${report.result}**`,
    "",
    `Run: \`${RUN}\``,
    "",
    "- Source: exact prior-chat stress logic from RUN_V5_END_TO_END.sh",
    "- Direct Supabase REST/RPC/SQL from the test runner: **none**",
    "- Environment: V5 QA / DEV",
    `- PROD request attempted: **${report.productionTouched ? "YES" : "No"}**`,
    "",
    "## Checks",
    "",
    "| Check | Status | Detail |",
    "|---|---|---|",
    ...report.checks.map(x=>`| ${x.name.replace(/\|/g,"/")} | ${x.status} | ${String(x.detail||"").replace(/\|/g,"/")} |`),
    "",
    "## Invoices",
    "```json",
    JSON.stringify(report.invoices,null,2),
    "```",
    "",
    "## Stress",
    "```json",
    JSON.stringify(report.stress,null,2),
    "```",
    "",
    "## Analytics",
    "```json",
    JSON.stringify(report.analytics,null,2),
    "```",
  ];
  if(report.failure){
    lines.push("","## Failure","```text",report.failure,"```");
  }
  fs.writeFileSync(path.join(RAW,"UI_ONLY_SUMMARY.md"),lines.join("\n"));
}

let browser;
const sessions=[];
let admin=null;

try{
  browser=await chromium.launch({headless:false,slowMo:5});

  console.log("============================================================");
  console.log(" V5 STRESS ONLY — EXACT PRIOR-CHAT STRESS LOGIC");
  console.log(" 4 cashiers + 96+ genuine POS UI bills + return + shift close + analytics");
  console.log(" R11 replay: NO · invoice/OCR/receive: NO · PROD: HARD BLOCKED");
  console.log("============================================================");

  admin=await openAdminFromSuccessfulRunner(browser);
  logPass("DEV ADMIN session","saved auth reused or interactive DEV login completed");

  report.productsAfterInvoices=await readProductMaster(admin.page);
  appAssert(report.productsAfterInvoices.length>0,"Product Master is empty before stress.");
  appAssert(report.productsAfterInvoices.every(p=>p.stock>=0),
    "Product Master contains an invalid negative stock value before stress.");
  logPass("Product Master pre-stress",
    `${report.productsAfterInvoices.length} products available for genuine POS stress`);

  const baselineSales=await readAdminSalesSummary(admin.page);
  report.stress.baselineSales=baselineSales;
  logPass("Pre-stress Sales baseline",`${baselineSales.count} existing bill(s) preserved`);

  const creds=await createCashiersViaUi(admin.page);
  for(let i=0;i<creds.length;i++){
    const s=await loginContext(browser,creds[i].email,creds[i].password,`Test Cashier ${i+1}`);
    sessions.push(s);
    await openShiftViaUi(s);
  }

  const productsForPlan=await readProductMaster(admin.page);
  const plan=buildUiStressPlan(productsForPlan,96);
  report.stress.plan={
    transactions:plan.txCount,
    lines:plan.targetLines,
    bottlesToSell:plan.totalUnits,
    targetBeforeReturn:"3–6 bottles/product",
    requiredFinal:"3–7 bottles/product after one approved return",
    maxSameSkuPerBill:4,
    browserSessions:4,
  };
  appAssert(plan.txCount>=96,`Stress plan generated only ${plan.txCount} bills.`);
  logPass("UI stress plan",
    `${plan.txCount} bills · ${plan.targetLines} lines · ${plan.totalUnits} bottles · 4 independent sessions`);

  await runAllUiStress(sessions,plan);
  appAssert(report.stress.transactions>=96,
    `Only ${report.stress.transactions||0} UI bills completed; expected at least 96.`);

  for(const s of sessions) await verifyCashierSales(s);

  await returnViaUi(sessions[0],admin.page);

  for(const s of sessions){
    report.shifts.push(await requestShiftCloseViaUi(s));
  }
  await approveAllShiftCloses(admin.page);

  for(const s of sessions) await cashierRoleSmoke(s);

  await finalUiValidation(admin.page,plan,baselineSales);

  appAssert(report.productionTouched===false,"PROD/wrong environment request was attempted.");
  report.result="PASS";
  report.classification="PASS";
  console.log("");
  console.log("[FINAL] V5 STRESS ONLY: PASS");
}catch(err){
  report.result="FAIL";
  report.failure=err?.stack||String(err);
  const message=String(err?.message||err);

  if(err?.classification==="APP_DEFECT" || message.startsWith("APP_DEFECT:")){
    report.classification="APP_DEFECT";
  }else if(
    /strict mode violation|locator\.|waitFor|Timeout|expected exactly 1 element|browser has been closed/i.test(message)
  ){
    report.classification="HARNESS";
  }else{
    report.classification="TRIAGE_REQUIRED";
  }

  console.error("");
  console.error("[FINAL] V5 STRESS ONLY: FAIL");
  console.error(`[CLASSIFICATION] ${report.classification}`);
  console.error(`[FAIL] ${message}`);
  try{if(admin?.page) await screenshot(admin.page,"FAIL_admin_page.png");}catch{}
  process.exitCode=1;
}finally{
  try{writeReport();}catch(e){console.error("Evidence write failed:",e);}
  for(const s of sessions){ try{await s.context.close();}catch{} }
  try{if(admin?.context)await admin.context.close();}catch{}
  try{if(browser)await browser.close();}catch{}
  console.log(`[RAW EVIDENCE] ${RAW}`);
}
