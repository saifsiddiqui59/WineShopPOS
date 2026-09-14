
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE=process.env.WSP_BASE_URL || "http://127.0.0.1:4196";
const AUTH=process.env.WSP_AUTH_FILE || "";
const FIXTURE=process.env.WSP_E2E_FIXTURE || "";
const OUT=process.env.WSP_E2E_OUT || ".";
const PROD_REF="uiurgplnsgmawvxhjzzp";
const PROD_HOST="wineshoppos.z29.web.core.windows.net";

const assert=(v,m)=>{if(!v)throw new Error(m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=v=>String(v??"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const near=(a,b,t=1)=>Math.abs(Number(a||0)-Number(b||0))<=t;

assert(AUTH&&fs.existsSync(AUTH),`Saved QA auth missing: ${AUTH}`);
assert(FIXTURE&&fs.existsSync(FIXTURE),`E2E fixture missing: ${FIXTURE}`);
fs.mkdirSync(OUT,{recursive:true});
const all=JSON.parse(fs.readFileSync(FIXTURE,"utf8"));
const inv=all.invoices["15983"];
assert(inv?.lines?.length===7,"15983 golden fixture must contain exactly 7 lines.");

const report={
  invoice:"15983",result:"RUNNING",startedAt:new Date().toISOString(),
  corrections:[],lineMappings:[],received:false,productionTouched:false
};
const changed=(field,before,after)=>{
  if(String(before??"")!==String(after??"")){
    report.corrections.push({field,before,after,source:"PHYSICAL_GOLDEN_REVIEW"});
    console.log(`[15983 HUMAN] ${field}: ${before} -> ${after}`);
  }
};
async function fill(locator,value,field){
  const before=await locator.inputValue();
  if(String(before)!==String(value)){await locator.fill(String(value));changed(field,before,value);}
}
async function waitInbox(page){
  const heading=page.locator("h2").filter({hasText:/^Invoice Inbox$/}).first();
  await heading.waitFor({state:"visible",timeout:60000});

  const year=page.getByLabel("Year",{exact:true});
  const month=page.getByLabel("Month",{exact:true});
  const status=page.getByLabel("Status",{exact:true});

  if(await year.isVisible().catch(()=>false) && await year.inputValue()!=="2026")
    await year.selectOption("2026");
  if(await month.isVisible().catch(()=>false) && await month.inputValue()!=="9")
    await month.selectOption("9");
  if(await status.isVisible().catch(()=>false) && await status.inputValue()!=="ALL")
    await status.selectOption("ALL");

  await sleep(150);
}
async function open15983(page){
  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
  await waitInbox(page);
  const row=page.locator("table.data-table tbody tr").filter({hasText:"15983"}).first();

  let found=false;
  const deadline=Date.now()+60000;
  while(Date.now()<deadline){
    if(await row.isVisible().catch(()=>false)){found=true;break;}
    await sleep(250);
  }

  if(!found){
    const countText=(await page.locator(".button-row.spread .muted-text").first()
      .innerText().catch(()=>"unknown")).trim();
    const shopText=(await page.locator(
      ".shop-context-pill,.royal-v11-lockup,.shop-selector"
    ).first().innerText().catch(()=>"unknown")).replace(/\s+/g," ").trim();
    throw new Error(
      `15983 not visible after 60s of hydrated Inbox waiting; `+
      `shop=${shopText}; inbox=${countText}; url=${page.url()}`
    );
  }

  const text=(await row.innerText()).replace(/\s+/g," ").trim();
  console.log(`[15983 HUMAN] Existing ingestion confirmed after hydrated Inbox load: ${text}`);
  if(/Completed/i.test(text)) return "COMPLETED";

  for(const rx of [/Continue Receive Stock/i,/Resume Review/i,/Start Review/i]){
    const b=row.getByRole("button",{name:rx}).first();
    if(await b.isVisible().catch(()=>false)){await b.click();break;}
  }

  for(let i=0;i<160;i++){
    if(await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first().isVisible().catch(()=>false)) return "RECEIVING";
    if(await page.locator("h2").filter({hasText:/^Invoice OCR$/}).first().isVisible().catch(()=>false)){
      const open=page.getByRole("button",{name:"Open Purchase Receiving Workspace",exact:true});
      if(await open.isVisible().catch(()=>false)){await open.click();await sleep(200);continue;}
    }
    await sleep(250);
  }
  throw new Error(`15983 could not reopen receiving workspace. Inbox row: ${text}`);
}
function rowScore(description,line){
  const a=new Set(norm(description).split(" ").filter(Boolean));
  const names=[line.name,...(line.aliases||[])].map(norm);
  let best=0;
  for(const n of names){
    const b=new Set(n.split(" ").filter(Boolean));
    const inter=[...a].filter(x=>b.has(x)).length;
    const union=new Set([...a,...b]).size;
    best=Math.max(best,union?inter/union:0);
  }
  return best;
}
async function ensureSevenRows(page){
  const table=page.locator("table.purchase-receiving-table");
  await table.waitFor({state:"visible",timeout:30000});
  const rows=table.locator("tbody tr");
  let n=await rows.count();
  assert(n<=7,`15983 has ${n} receiving rows; physical invoice has exactly 7. Refusing to delete/guess rows.`);
  while(n<7){
    console.log(`[15983 HUMAN] OCR dropped a physical row (${n}/7). Adding one Manual Line through UI.`);
    await page.getByRole("button",{name:"+ Manual Line",exact:true}).click();
    await sleep(150);
    n=await rows.count();
  }
  return rows;
}
async function mapRows(rows){
  const n=await rows.count();
  const used=new Set();
  const mapped=new Map();

  // Strongest first: unique physical line amount.
  for(let i=0;i<n;i++){
    const cells=rows.nth(i).locator("td");
    const amount=Number(await cells.nth(12).locator('input[type="number"]').inputValue().catch(()=>0));
    const matches=inv.lines.map((x,j)=>({j,d:Math.abs(Number(x.amount)-amount)}))
      .filter(x=>x.d<=1&&!used.has(x.j)).sort((a,b)=>a.d-b.d);
    if(matches.length===1){mapped.set(i,matches[0].j);used.add(matches[0].j);}
  }

  // Then product text / known OCR aliases.
  for(let i=0;i<n;i++){
    if(mapped.has(i))continue;
    const desc=(await rows.nth(i).locator("td").nth(1).innerText()).trim();
    const candidates=inv.lines.map((x,j)=>({j,score:used.has(j)?-1:rowScore(desc,x)}))
      .sort((a,b)=>b.score-a.score);
    if(candidates[0]?.score>=0.45 && (candidates[1]?.score??-1)<candidates[0].score){
      mapped.set(i,candidates[0].j);used.add(candidates[0].j);
    }
  }

  // Manual rows (or badly mangled OCR rows) get the remaining physical line in deterministic order.
  const remaining=inv.lines.map((_,j)=>j).filter(j=>!used.has(j));
  for(let i=0;i<n;i++){
    if(mapped.has(i))continue;
    const j=remaining.shift();
    assert(j!==undefined,"15983 row mapping exhausted golden lines.");
    mapped.set(i,j);used.add(j);
  }
  assert(mapped.size===7&&used.size===7,"15983 rows could not be mapped one-to-one to the physical invoice.");
  return mapped;
}
async function selectExistingOrStage(page,row,line,rowIndex){
  const cells=row.locator("td");
  const select=cells.nth(2).locator("select");
  const options=await select.locator("option").allTextContents();
  const wanted=norm(`${line.name} ${line.size} ml`);
  let chosen=-1;
  for(let i=0;i<options.length;i++){
    const t=norm(options[i]);
    if(t.includes(norm(line.name))&&t.includes(norm(`${line.size} ml`))){chosen=i;break;}
  }
  if(chosen>0){
    const value=await select.locator("option").nth(chosen).getAttribute("value");
    await select.selectOption(value);
    console.log(`[15983 HUMAN] line ${rowIndex+1}: selected existing Product Master ${line.name} ${line.size}ml.`);
    return;
  }

  // No exact existing product. Use the app's staged Product workflow;
  // Product Master is created atomically only when receive succeeds.
  await select.selectOption("");
  const editPending=row.getByRole("button",{name:"Edit Pending Product",exact:true});
  const editNew=row.getByRole("button",{name:"Edit New Product Details",exact:true});
  if(await editPending.isVisible().catch(()=>false)) await editPending.click();
  else {
    await editNew.waitFor({state:"visible",timeout:10000});
    await editNew.click();
  }
  const modal=page.getByRole("heading",{name:"Edit New Product Details",exact:true}).locator("..").locator("..");
  await page.getByRole("heading",{name:"Edit New Product Details",exact:true}).waitFor({state:"visible",timeout:10000});

  const nameInput=page.getByLabel("Product Name",{exact:true});
  const brandInput=page.getByLabel("Brand",{exact:true});
  const sizeInput=page.getByLabel("Size (ml)",{exact:true});
  const packInput=page.getByLabel("Bottles/Case",{exact:true});
  const mrpInput=page.getByLabel("MRP",{exact:true});
  const barcodeInput=page.getByLabel("Barcode optional",{exact:true});
  await fill(nameInput,line.name,`line.${rowIndex+1}.product_name`);
  await fill(brandInput,line.brand,`line.${rowIndex+1}.brand`);
  await fill(sizeInput,line.size,`line.${rowIndex+1}.size_ml`);
  await fill(packInput,line.pack,`line.${rowIndex+1}.units_per_case`);
  await fill(mrpInput,line.mrp,`line.${rowIndex+1}.mrp`);
  await fill(barcodeInput,line.barcode,`line.${rowIndex+1}.barcode`);

  const category=page.getByLabel("Category",{exact:true});
  if(await category.isVisible().catch(()=>false)){
    const opt=category.locator("option").filter({hasText:/^Beer$/i}).first();
    if(await opt.count()){
      const val=await opt.getAttribute("value"); if(val) await category.selectOption(val);
    }
  }
  await page.getByRole("button",{name:"Use on This Purchase",exact:true}).click();
  await page.getByRole("heading",{name:"Edit New Product Details",exact:true}).waitFor({state:"hidden",timeout:10000});
  await row.getByText(line.barcode,{exact:true}).waitFor({state:"visible",timeout:10000});
}
async function prepareLines(page){
  const rows=await ensureSevenRows(page);
  const mapped=await mapRows(rows);
  page.on("dialog",async d=>{
    try{if(d.type()==="prompt")await d.accept("Verified/corrected against physical invoice 15983.");else await d.accept();}catch{}
  });

  for(let i=0;i<7;i++){
    const j=mapped.get(i), line=inv.lines[j];
    const row=rows.nth(i), cells=row.locator("td");
    const beforeDesc=(await cells.nth(1).innerText()).trim();
    report.lineMappings.push({uiRow:i+1,goldenLine:j+1,ocrDescription:beforeDesc,product:line.name});
    if(norm(beforeDesc)!==norm(line.name) && !(line.aliases||[]).map(norm).includes(norm(beforeDesc))){
      changed(`line.${i+1}.ocr_description`,beforeDesc,line.name);
    }else if(norm(beforeDesc)!==norm(line.name)){
      changed(`line.${i+1}.ocr_description`,beforeDesc,line.name);
    }

    await fill(cells.nth(5).locator('input[type="number"]'),line.cases,`line.${i+1}.cases`);
    await fill(cells.nth(6).locator('input[type="number"]'),line.pack,`line.${i+1}.units_per_case`);
    await fill(cells.nth(7).locator('input[type="number"]'),0,`line.${i+1}.loose`);
    await fill(cells.nth(9).locator('input[type="number"]'),line.rate,`line.${i+1}.rate_per_case`);
    await fill(cells.nth(11).locator('input[type="number"]'),line.mrp,`line.${i+1}.mrp`);
    await fill(cells.nth(12).locator('input[type="number"]'),line.amount,`line.${i+1}.amount`);
    await selectExistingOrStage(page,row,line,i);

    const confirm=row.getByRole("button",{name:"Confirm Pack",exact:true});
    if(await confirm.isVisible().catch(()=>false)){await confirm.click();await sleep(100);}
    const keep=row.getByRole("button",{name:"Keep Separate",exact:true});
    if(await keep.isVisible().catch(()=>false)){await keep.click();await sleep(100);}
  }
  return rows;
}
async function fillFinance(page){
  await fill(page.getByLabel("Supplier",{exact:true}),inv.supplier,"header.supplier");
  await fill(page.getByLabel("Invoice Number",{exact:true}),inv.invoiceNumber,"header.invoice_number");
  await fill(page.getByLabel("Invoice Date",{exact:true}),inv.invoiceDate,"header.invoice_date");

  const f=inv.finance;
  const fields=[
    ["Freight / Carting",f.freight],["Transport",0],["Handling",0],["Loading / Unloading",0],
    ["Cash / Supplier Discount",f.cashDiscount],["Other Invoice Deduction",f.invoiceDiscount],
    ["TCS / Stamp / Other Additions",f.misc],["Rounding Adjustment",0],
    ["Reviewed Printed Invoice Total",f.total],
  ];
  for(const [label,value] of fields) await fill(page.getByLabel(label,{exact:true}),value,`finance.${label}`);
}
async function verifyReadyAndReceive(page){
  // Let earlier debounced writes settle, then force one fresh harmless Notes
  // mutation and wait for the authoritative invoice_save_review_draft response.
  // This prevents a stale old SYNCED badge from being mistaken for the final
  // reviewed 15983 draft being persisted.
  await sleep(900);
  const notes=page.getByLabel("Notes",{exact:true});
  const marker="E2E physical review 15983";
  const currentNotes=await notes.inputValue();

  const finalSave=page.waitForResponse(
    (response)=>
      /\/rest\/v1\/rpc\/invoice_save_review_draft(?:\?|$)/.test(response.url()) &&
      response.request().method()==="POST" &&
      response.status()>=200 &&
      response.status()<300,
    {timeout:30000}
  );

  if(currentNotes===marker){
    await notes.fill(marker+" " );
    await notes.fill(marker);
  }else{
    await notes.fill(marker);
  }

  await finalSave;
  await sleep(150);

  const body=await page.locator("body").innerText();
  assert(!/SYNC ERROR/.test(body),"15983 authoritative review draft shows SYNC ERROR.");
  const footer=page.locator("section.purchase-receive-footer");
  await footer.getByText("Ready to Receive",{exact:true}).waitFor({state:"visible",timeout:30000});
  const totals=await page.locator("table.purchase-receiving-table tfoot").innerText();
  assert(/52 cases/i.test(totals),`15983 expected 52 cases; footer=${totals}`);
  assert(/792 bottles/i.test(totals),`15983 expected 792 bottles; footer=${totals}`);
  const sync=page.locator(".purchase-sync-strip strong");
  await sync.filter({hasText:/SYNCED/i}).waitFor({state:"visible",timeout:30000});

  const receive=footer.getByRole("button",{name:"Approve & Receive Stock",exact:true});
  assert(!(await receive.isDisabled()),"15983 Approve & Receive Stock remains disabled.");
  await page.screenshot({path:path.join(OUT,"15983-ready.png"),fullPage:true});
  await receive.click();
  await page.waitForURL(u=>u.hash.includes("#/purchasing/receipts/"),{timeout:60000});
  await page.locator("h2").filter({hasText:/^Purchase Verification$/}).first().waitFor({state:"visible",timeout:30000});
  await page.locator("section#posted-purchase-lines").filter({hasText:"Posted Purchase Lines"}).first().waitFor({state:"visible",timeout:30000});
  await page.screenshot({path:path.join(OUT,"15983-receipt.png"),fullPage:true});
  report.received=true;
}

let browser;
try{
  browser=await chromium.launch({headless:false,slowMo:5});
  const ctx=await browser.newContext({storageState:AUTH,viewport:{width:1600,height:1000}});
  await ctx.route("**/*",route=>{
    const u=route.request().url();
    if(u.includes(PROD_REF)||u.includes(PROD_HOST)){report.productionTouched=true;return route.abort("blockedbyclient");}
    return route.continue();
  });
  const page=await ctx.newPage();
  await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});

  const inboxHeading=page.locator("h2").filter({hasText:/^Invoice Inbox$/}).first();

  try{
    await inboxHeading.waitFor({state:"visible",timeout:30000});
  }catch{
    console.log("[15983 HUMAN] QA login is required. Sign in once in the visible DEV browser.");

    const nav=page.getByRole("navigation",{name:"Main navigation"});
    const verificationProblem=page.getByRole("heading",{name:"Unable to Verify Account",exact:true});

    const outcome=await Promise.race([
      nav.waitFor({state:"visible",timeout:300000}).then(()=>"AUTHENTICATED"),
      verificationProblem.waitFor({state:"visible",timeout:300000}).then(()=>"VERIFY_ERROR")
    ]);

    if(outcome==="VERIFY_ERROR"){
      throw new Error("Login succeeded but WineShopPOS could not verify profile/shop access.");
    }

    await ctx.storageState({path:AUTH});
    console.log("[15983 HUMAN] Login accepted. Refreshed QA session saved.");

    await page.goto(`${BASE}/#/purchasing/invoices`,{waitUntil:"domcontentloaded"});
    await waitInbox(page);
  }

  await ctx.storageState({path:AUTH});
  await page.locator('[data-environment-badge="QA-DEV-V5"]').waitFor({state:"visible",timeout:20000});

  const state=await open15983(page);
  if(state==="COMPLETED"){
    report.result="PASS_ALREADY_RECEIVED";
    report.received=true;
    console.log("[15983 HUMAN] already Completed; no duplicate receive attempted.");
  }else{
    await page.locator("h2").filter({hasText:/^Purchase Receiving Workspace$/}).first().waitFor({state:"visible",timeout:30000});
    await fillFinance(page);
    await prepareLines(page);
    await fillFinance(page); // line edits can recalculate finance; physical values win.
    await verifyReadyAndReceive(page);
    report.result="PASS_RECEIVED";
  }
  assert(report.productionTouched===false,"15983 attempted a PROD request.");
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,"15983-human-review.json"),JSON.stringify(report,null,2));
  console.log(`[15983 HUMAN] ${report.result}; corrections=${report.corrections.length}`);
  await ctx.close();
}catch(e){
  report.result="FAIL"; report.failure=e?.stack||String(e); report.finishedAt=new Date().toISOString();
  try{fs.writeFileSync(path.join(OUT,"15983-human-review.json"),JSON.stringify(report,null,2));}catch{}
  console.error("[15983 HUMAN] FAIL",e?.stack||e);
  process.exitCode=1;
}finally{
  try{if(browser)await browser.close();}catch{}
}
