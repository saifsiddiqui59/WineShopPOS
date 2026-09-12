import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL;
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
const AUTH = process.env.AUTH_FILE;
const OUT = process.env.OUT;
const DEV = "juhcypzoacauzmtzqnwd";
const PROD = "uiurgplnsgmawvxhjzzp";
const PROD_HOST = "wineshoppos.z29.web.core.windows.net";
const RUN = process.env.RUN_ID || new Date().toISOString().replace(/\D/g,"").slice(0,14);

if (!BASE || !SB || !KEY || !AUTH || !OUT) throw new Error("Missing required environment.");
if (!SB.includes(DEV) || SB.includes(PROD)) throw new Error("DEV Supabase safety guard failed.");
fs.mkdirSync(OUT,{recursive:true});
fs.mkdirSync(path.join(OUT,"screenshots"),{recursive:true});

const report = {
  runId: RUN,
  startedAt: new Date().toISOString(),
  environment: DEV,
  final: "RUNNING",
  checks: [],
  warnings: [],
  consoleErrors: [],
  failedRequests: [],
  blockedProductionRequests: [],
  golden: {},
  largePurchase: {},
  sales: [],
  ownerCenter: {},
  inventoryIntelligence: {},
  ownerProfit: {},
  purchaseIntelligence: {},
  reports: {},
};

function check(name,status,detail=""){
  report.checks.push({name,status,detail});
  console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}
function assert(v,m){ if(!v) throw new Error(m); }
function almost(a,b,t=0.011){ return Number.isFinite(Number(a)) && Math.abs(Number(a)-Number(b)) <= t; }
function cleanInvoice(v){ return String(v||"").trim().replace(/^:+/,"").toUpperCase(); }
function parseMoney(text){
  const s=String(text||"").replace(/[₹,\s]/g,"").replace(/[^\d.-]/g,"");
  const n=Number(s);
  return Number.isFinite(n)?n:NaN;
}
function roundMoney(n){ return Math.round(Number(n||0)); }
function asObj(v){
  if(v && typeof v==="object") return v;
  if(typeof v==="string"){ try{return JSON.parse(v)}catch{} }
  return {};
}
async function shot(page,name){
  try{ await page.screenshot({path:path.join(OUT,"screenshots",name),fullPage:true}); }catch{}
}
async function waitFor(fn,label,timeout=30000){
  const started=Date.now();
  while(Date.now()-started<timeout){
    const value=await fn();
    if(value) return value;
    await new Promise(r=>setTimeout(r,400));
  }
  throw new Error(`Timeout waiting for ${label}`);
}
async function tokenFrom(page){
  const entries=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  const vals=[entries[`sb-${DEV}-auth-token`],...Object.values(entries)].filter(Boolean);
  const walk=(v,d=0)=>{
    if(d>8||v==null)return "";
    if(typeof v==="object"){
      if(typeof v.access_token==="string"&&v.access_token.length>40)return v.access_token;
      for(const x of Object.values(v)){const f=walk(x,d+1);if(f)return f;}
    }
    return "";
  };
  for(const raw of vals){
    try{const f=walk(JSON.parse(raw));if(f)return f;}catch{}
  }
  return "";
}

let browser, context, page, token="", profile=null;

async function rest(resource,{method="GET",body=null,auth=token}={}){
  assert(auth,"Missing DEV auth token.");
  const r=await fetch(`${SB.replace(/\/+$/,"")}/rest/v1/${resource}`,{
    method,
    headers:{
      apikey:KEY,
      Authorization:`Bearer ${auth}`,
      Accept:"application/json",
      ...(body==null?{}:{"Content-Type":"application/json"})
    },
    body:body==null?undefined:JSON.stringify(body),
  });
  const text=await r.text();
  if(!r.ok) throw new Error(`${method} ${resource}: HTTP ${r.status} ${text.slice(0,500)}`);
  if(!text)return null;
  try{return JSON.parse(text)}catch{return text}
}
const rpc=(name,body={},auth=token)=>rest(`rpc/${name}`,{method:"POST",body,auth});

async function login(){
  await page.goto(`${BASE}/#/login`,{waitUntil:"domcontentloaded"});
  const nav=page.getByRole("navigation",{name:"Main navigation"});
  if(!await nav.isVisible().catch(()=>false)){
    console.log("[EXTENDED] Saved QA session is unavailable. Sign in once in the visible DEV browser.");
    await nav.waitFor({state:"visible",timeout:300000});
  }
  token=await tokenFrom(page);
  assert(token,"Could not obtain DEV Supabase token.");
  await context.storageState({path:AUTH,indexedDB:true});
  const raw=await rpc("my_profile",{});
  profile=Array.isArray(raw)?raw[0]:raw;
  if(profile && !profile.id) profile.id=profile.user_id;
  assert(profile?.id && String(profile.role).toUpperCase()==="ADMIN","Extended certification requires DEV ADMIN.");
  check("Authentication / DEV ADMIN","PASS",`shop ${profile.shop_id}`);
}

function financeFor(ing){
  const inv=asObj(ing?.normalized_invoice);
  const f=inv.financialAdjustments||{};
  return {
    subtotal:Number(inv.subtotal ?? f.lineProductValue),
    cashDiscount:Number(inv.supplierDiscountAmount ?? f.cashDiscountAmount),
    invoiceDiscount:Number(inv.invoiceDiscountAmount ?? f.otherDeductionAmount),
    freight:Number(inv.freightAmount ?? f.freightCartingAmount),
    fees:Number(f.stampDutyAmount),
    tcs:Number(f.tcsAmount),
    total:inv.total==null ? (f.printedInvoiceTotal==null?null:Number(f.printedInvoiceTotal)) : Number(inv.total),
    reconciliationStatus:String(f.reconciliationStatus||""),
    printedTotalEvidenceStatus:String(f.printedTotalEvidenceStatus||""),
    itemCount:Array.isArray(inv.items)?inv.items.length:0,
    resolutionAssist:inv.resolutionAssist||{},
  };
}

async function verifyGoldenState(){
  const ing=await rest("invoice_ingestions?select=id,purchase_id,review_status,extracted_invoice_number,normalized_invoice,created_at&order=created_at.asc&limit=50");
  const purchases=await rest("purchases?select=id,invoice_number,total,status&limit=100");
  const items=await rest("purchase_items?select=purchase_id,quantity&limit=1000");
  const mov=await rest("stock_movements?select=reference_id,quantity_change&limit=2000");
  const find=(n)=>[...ing].reverse().find(x=>cleanInvoice(x.extracted_invoice_number)===cleanInvoice(n));
  const plist=(n)=>purchases.filter(x=>cleanInvoice(x.invoice_number)===cleanInvoice(n));

  const a=find("16845"); assert(a,"16845 ingestion missing after master.");
  const ap=plist("16845"); assert(ap.length===1,`16845 purchase count ${ap.length}, expected 1.`);
  const ai=items.filter(x=>x.purchase_id===ap[0].id);
  const am=mov.filter(x=>x.reference_id===ap[0].id);
  assert(a.review_status==="RECEIVED" && a.purchase_id===ap[0].id,"16845 not linked RECEIVED.");
  assert(ai.length===15 && ai.reduce((s,x)=>s+Number(x.quantity||0),0)===996,"16845 purchase lines/bottles incorrect.");
  assert(am.reduce((s,x)=>s+Number(x.quantity_change||0),0)===996,"16845 movement quantity incorrect.");
  report.golden["16845"]={ingestionId:a.id,purchaseId:ap[0].id,status:a.review_status,items:15,bottles:996};
  check("Golden 16845","PASS","RECEIVED once · 15 lines · 996 bottles");

  const b=find("B-3339"); assert(b,"B-3339 ingestion missing after master.");
  const bp=plist("B-3339"); assert(bp.length===1,`B-3339 purchase count ${bp.length}, expected 1.`);
  const bi=items.filter(x=>x.purchase_id===bp[0].id);
  const bm=mov.filter(x=>x.reference_id===bp[0].id);
  const bf=financeFor(b);
  assert(b.review_status==="RECEIVED" && b.purchase_id===bp[0].id,"B-3339 not linked RECEIVED.");
  assert(bi.length===14 && bi.reduce((s,x)=>s+Number(x.quantity||0),0)===540,"B-3339 line/bottle count incorrect.");
  assert(bm.reduce((s,x)=>s+Number(x.quantity_change||0),0)===540,"B-3339 movement quantity incorrect.");
  assert(almost(bf.subtotal,86715),`B-3339 subtotal ${bf.subtotal}`);
  assert(almost(bf.cashDiscount,599),`B-3339 cash discount ${bf.cashDiscount}`);
  assert(almost(bf.invoiceDiscount,0),`B-3339 invoice discount ${bf.invoiceDiscount}`);
  assert(almost(bf.freight,700),`B-3339 freight ${bf.freight}`);
  assert(almost(bf.fees,5),`B-3339 fees ${bf.fees}`);
  assert(almost(bf.tcs,1737),`B-3339 TCS ${bf.tcs}`);
  assert(almost(bf.total,88558,1),`B-3339 total ${bf.total}`);
  assert(bf.reconciliationStatus==="MATCH",`B-3339 reconciliation ${bf.reconciliationStatus}`);
  report.golden["B-3339"]={ingestionId:b.id,purchaseId:bp[0].id,status:b.review_status,items:14,bottles:540,finance:bf};
  check("Golden B-3339","PASS","14 lines · exact 7 finance assertions · MATCH · received once");

  const c=find("16805"); assert(c,"16805 ingestion missing after master.");
  const cp=plist("16805"); const cf=financeFor(c);
  assert(c.review_status==="NEEDS_REVIEW","16805 must remain NEEDS_REVIEW.");
  assert(c.purchase_id==null && cp.length===0,"16805 created a purchase.");
  assert(cf.itemCount===3,`16805 item count ${cf.itemCount}, expected 3.`);
  assert(cf.total==null,"16805 unsafe printed total must stay null.");
  assert(cf.printedTotalEvidenceStatus==="LABELED_TOTAL_UNREADABLE","16805 evidence status changed.");
  assert(cf.reconciliationStatus==="REVIEW_PRINTED_TOTAL_UNREADABLE","16805 reconciliation status changed.");
  report.golden["16805"]={ingestionId:c.id,status:c.review_status,purchaseId:null,items:3,finance:cf};
  check("Golden 16805","PASS","3 rows · unsafe finance blocked · zero purchase mutation");
}

async function productRows(){
  return await rest("products?select=id,product_name,brand,size_ml,barcode,purchase_price,selling_price,mrp,units_per_case,active&active=eq.true&order=product_name.asc&limit=200");
}
async function inventoryMap(){
  const rows=await rest("inventory?select=product_id,quantity,reserved_quantity&limit=1000");
  return new Map(rows.map(x=>[x.product_id,Number(x.quantity||0)]));
}
async function totalsSnapshot(){
  const [p,m,i]=await Promise.all([
    rest("purchases?select=id&limit=10000"),
    rest("stock_movements?select=id,quantity_change&limit=20000"),
    rest("inventory?select=product_id,quantity&limit=1000"),
  ]);
  return {
    purchases:p.length,
    movements:m.length,
    movementQty:m.reduce((s,x)=>s+Number(x.quantity_change||0),0),
    inventoryQty:i.reduce((s,x)=>s+Number(x.quantity||0),0),
  };
}

function largeDraft(products,supplier,invoiceNumber){
  const now=new Date().toISOString();
  return {
    version:2,
    receiveKey:`e2e-large-${RUN}`,
    ingestionId:null,
    supplierId:supplier.id,
    supplierName:supplier.supplier_name,
    invoiceNumber,
    invoiceDate:new Date().toISOString().slice(0,10),
    notes:`V5 EXTENDED PLAYWRIGHT ${RUN}`,
    charges:{
      freightAmount:0,transportAmount:0,handlingAmount:0,loadingUnloadingAmount:0,
      supplierDiscountAmount:0,invoiceDiscountAmount:0,miscellaneousAmount:0,roundingAdjustment:0
    },
    financialSummary:{},
    updatedAt:now,
    items:products.map((p,index)=>{
      const purchase=Math.max(0.01,Number(p.purchase_price||1));
      const units=Math.max(1,Math.round(Number(p.units_per_case||1)));
      const mrp=Math.max(Number(p.mrp||0),purchase+1);
      return {
        lineKey:`e2e-large-${index}-${p.id}`,
        sourceDescription:String(p.product_name),
        productId:p.id,
        productName:p.product_name,
        pendingProduct:null,
        invoiceSizeMl:Number(p.size_ml||0),
        sizeMl:Number(p.size_ml||0),
        caseCount:0,
        unitsPerCase:units,
        looseBottles:1,
        quantity:1,
        ratePerCase:Number((purchase*units).toFixed(6)),
        purchasePrice:Number(purchase.toFixed(6)),
        mrp:Number(mrp.toFixed(2)),
        lineAmount:Number(purchase.toFixed(2)),
        batchNumber:"",
        expiryDate:"",
        barcodeState:p.barcode?"KNOWN":"ASSIGN_LATER",
        scannedBarcode:p.barcode||"",
        matchSource:"E2E_LARGE_DRAFT",
        matchScore:1,
        duplicateResolution:"",
        duplicateReason:"",
        packResolution:{state:"MANUAL_ENTRY",source:"E2E_LARGE_DRAFT",reason:"",updatedAt:now},
        packHistory:[],
        packBaseline:{caseCount:0,unitsPerCase:units,looseBottles:1,quantity:1,source:"E2E_LARGE_DRAFT",legacy:false,capturedAt:now},
        sourceItem:{description:p.product_name,packing:`${p.size_ml||0} ml`,packageType:"",unitsPerCaseHint:units}
      };
    })
  };
}

async function injectDraftAndOpen(draft){
  await page.goto(`${BASE}/#/products`,{waitUntil:"domcontentloaded"});
  await page.evaluate((d)=>{
    sessionStorage.removeItem("wineshop_ocr_purchase_draft");
    sessionStorage.setItem("wineshop_ocr_purchase_draft",JSON.stringify(d));
  },draft);
  await page.goto(`${BASE}/#/purchasing/receive`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Purchase Receiving Workspace"}).waitFor({state:"visible",timeout:30000});
}

async function largePurchaseFlow(){
  const products=await productRows();
  assert(products.length>=25,`Large purchase prerequisite: only ${products.length} active products; expected >=25 after golden UAT.`);
  const selected=products.slice(0,Math.min(products.length,40));
  const suppliers=await rest("suppliers?select=id,supplier_name,active&active=eq.true&order=supplier_name.asc&limit=20");
  assert(suppliers.length>=1,"No supplier available for large purchase.");
  const supplier=suppliers[0];
  const invoiceNumber=`E2E-LARGE-${RUN}`;
  const draft=largeDraft(selected,supplier,invoiceNumber);
  const before=await inventoryMap();
  const beforeTotals=await totalsSnapshot();

  await injectDraftAndOpen(draft);
  const table=page.locator("table.purchase-receiving-table");
  await table.waitFor({state:"visible",timeout:20000});
  const rows=table.locator("tbody tr");
  await waitFor(async()=>await rows.count()===selected.length,"large purchase rows",20000);
  assert(await page.locator(".invoice-status-badge").filter({hasText:"NEEDS REVIEW"}).count()===0,
    "Large purchase draft has unresolved line review.");
  const footer=page.locator(".purchase-receive-footer");
  await footer.getByText("Ready to Receive",{exact:true}).waitFor({state:"visible",timeout:20000});
  const receive=footer.getByRole("button",{name:"Approve & Receive Stock",exact:true});
  assert(!(await receive.isDisabled()),"Large purchase Receive button is disabled.");
  await shot(page,"01_large_purchase_ready.png");

  await receive.click();
  await waitFor(async()=>{
    const rows=await rest(`purchases?select=id,invoice_number,total,status&invoice_number=eq.${encodeURIComponent(invoiceNumber)}&limit=5`);
    return rows?.[0]||null;
  },"large purchase commit",45000);

  const purchases=await rest(`purchases?select=id,invoice_number,total,status&invoice_number=eq.${encodeURIComponent(invoiceNumber)}&limit=10`);
  assert(purchases.length===1,`Large purchase count=${purchases.length}, expected 1.`);
  const purchase=purchases[0];
  const pitems=await rest(`purchase_items?select=id,product_id,quantity,case_count,units_per_case,loose_bottles,purchase_price,line_total&purchase_id=eq.${purchase.id}&limit=1000`);
  const moves=await rest(`stock_movements?select=id,product_id,quantity_change,quantity_before,quantity_after,reference_type,reference_id,movement_type&reference_id=eq.${purchase.id}&limit=1000`);
  assert(pitems.length===selected.length,`Large purchase items=${pitems.length}; expected ${selected.length}.`);
  assert(moves.length===selected.length,`Large purchase movements=${moves.length}; expected ${selected.length}.`);
  assert(pitems.reduce((s,x)=>s+Number(x.quantity||0),0)===selected.length,"Large purchase total quantity is not one bottle per line.");
  assert(moves.reduce((s,x)=>s+Number(x.quantity_change||0),0)===selected.length,"Large purchase stock movement quantity mismatch.");
  for(const m of moves){
    assert(Number(m.quantity_after)-Number(m.quantity_before)===Number(m.quantity_change),
      `Movement arithmetic mismatch for product ${m.product_id}.`);
  }
  const after=await inventoryMap();
  for(const p of selected){
    const delta=(after.get(p.id)||0)-(before.get(p.id)||0);
    assert(delta===1,`Large purchase inventory delta ${delta} for ${p.product_name}; expected +1.`);
  }
  await shot(page,"02_large_purchase_received.png");

  // Duplicate/idempotency through the same V5 receiving UI.
  const preDup=await totalsSnapshot();
  await injectDraftAndOpen({...draft,receiveKey:`e2e-dup-${RUN}`,updatedAt:new Date().toISOString()});
  const dupFooter=page.locator(".purchase-receive-footer");
  await dupFooter.getByText("Ready to Receive",{exact:true}).waitFor({state:"visible",timeout:20000});
  await dupFooter.getByRole("button",{name:"Approve & Receive Stock",exact:true}).click();
  await page.waitForTimeout(1800);
  const postDup=await totalsSnapshot();
  const dupPurchases=await rest(`purchases?select=id&invoice_number=eq.${encodeURIComponent(invoiceNumber)}&limit=10`);
  assert(dupPurchases.length===1,"Duplicate large invoice created another purchase.");
  assert(postDup.purchases===preDup.purchases,"Duplicate attempt changed purchase count.");
  assert(postDup.movements===preDup.movements,"Duplicate attempt created stock movements.");
  assert(postDup.inventoryQty===preDup.inventoryQty,"Duplicate attempt changed inventory quantity.");

  report.largePurchase={
    invoiceNumber,purchaseId:purchase.id,lineCount:selected.length,
    purchasedBottles:selected.length,movementCount:moves.length,
    duplicatePurchaseCount:dupPurchases.length,
    duplicateInventoryDelta:postDup.inventoryQty-preDup.inventoryQty,
    duplicateMovementDelta:postDup.movements-preDup.movements,
  };
  check("Large purchase atomic receive","PASS",`${selected.length} distinct lines · +${selected.length} bottles · exact per-product deltas`);
  check("Large purchase duplicate/idempotency","PASS","second UI receive caused zero purchase/inventory/movement delta");
  return {selected,purchase,invoiceNumber};
}

async function ensureShiftOpen(){
  await page.goto(`${BASE}/#/pos`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Fast POS Billing"}).waitFor({state:"visible",timeout:20000});
  const dialog=page.getByRole("dialog",{name:"Start your shift before making any bill"});
  if(await dialog.isVisible().catch(()=>false)){
    await dialog.getByLabel("Opening Cash").fill("0");
    await dialog.getByRole("button",{name:"Start Shift",exact:true}).click();
    await dialog.waitFor({state:"hidden",timeout:20000});
  }
  const shifts=await rest(`cashier_shifts?select=id,status,expected_cash,opened_at&cashier_id=eq.${profile.id}&status=eq.OPEN&order=opened_at.desc&limit=1`);
  assert(shifts?.[0]?.status==="OPEN","POS shift is not OPEN.");
  return shifts[0];
}

async function createSale(product,method,index){
  const before=(await rest(`inventory?select=quantity&product_id=eq.${product.id}&limit=1`))?.[0];
  const q0=Number(before?.quantity||0);
  assert(q0>=1,`${product.product_name}: no stock for POS sale.`);

  const known=await rest("sales?select=id&limit=5000");
  const knownIds=new Set(known.map(x=>x.id));

  await page.goto(`${BASE}/#/pos`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Fast POS Billing"}).waitFor({state:"visible",timeout:15000});
  const shiftDialog=page.getByRole("dialog",{name:"Start your shift before making any bill"});
  assert(!await shiftDialog.isVisible().catch(()=>false),"Shift unexpectedly closed during sales.");

  const search=page.getByLabel("Scan barcode or search products");
  await search.fill(product.product_name);
  const productButton=page.getByRole("button").filter({hasText:product.product_name}).first();
  await productButton.waitFor({state:"visible",timeout:12000});
  await productButton.click();

  await page.getByRole("button",{name:method,exact:true}).click();
  if(method!=="CASH"){
    await page.getByLabel("Payment Reference").fill(`E2E-${method}-${RUN}-${index}`);
  }

  const complete=page.getByRole("button",{name:/Complete Sale/});
  assert(!(await complete.isDisabled()),`${method} Complete Sale disabled.`);
  await complete.click();

  const sale=await waitFor(async()=>{
    const rows=await rest("sales?select=id,invoice_number,status,grand_total,created_at&order=created_at.desc&limit=20");
    return rows.find(x=>!knownIds.has(x.id))||null;
  },`new ${method} sale`,30000);

  const item=(await rest(`sale_items?select=id,sale_id,product_id,quantity,unit_price,line_total&sale_id=eq.${sale.id}&product_id=eq.${product.id}&limit=5`))?.[0];
  assert(item && Number(item.quantity)===1,`${sale.invoice_number}: expected one sold bottle of ${product.product_name}.`);
  const after=(await rest(`inventory?select=quantity&product_id=eq.${product.id}&limit=1`))?.[0];
  const q1=Number(after?.quantity||0);
  assert(q1===q0-1,`${product.product_name}: sale stock ${q0}->${q1}; expected -1.`);
  const payment=(await rest(`payments?select=id,payment_method,amount,payment_type&sale_id=eq.${sale.id}&payment_type=neq.REFUND&limit=5`))?.[0];
  assert(payment && String(payment.payment_method).toUpperCase()===method,`${sale.invoice_number}: payment method mismatch.`);
  report.sales.push({saleId:sale.id,invoiceNumber:sale.invoice_number,productId:product.id,productName:product.product_name,method,total:Number(sale.grand_total),stockBefore:q0,stockAfter:q1,saleItemId:item.id});
  console.log(`[SALE] ${sale.invoice_number} ${method} ${product.product_name} ${q0}->${q1}`);
  return {...sale,item,product,method,q0,q1};
}

async function salesReturnShiftFlow(selectedProducts){
  const shift=await ensureShiftOpen();
  const fresh=await productRows();
  const inv=await inventoryMap();
  const candidates=fresh.filter(p=>Number(p.selling_price||0)>0 && (inv.get(p.id)||0)>=1).slice(0,6);
  assert(candidates.length>=6,`Need 6 sellable stocked products; found ${candidates.length}.`);
  const methods=["CASH","CASH","UPI","UPI","CARD","CARD"];
  const made=[];
  for(let i=0;i<6;i++) made.push(await createSale(candidates[i],methods[i],i+1));
  await shot(page,"03_after_six_pos_sales.png");
  check("Six automated POS sales","PASS","2 CASH · 2 UPI · 2 CARD · six distinct products · exact stock -1 each");

  const target=made.find(x=>x.method==="CASH")||made[0];
  const beforeReturn=Number((await rest(`inventory?select=quantity&product_id=eq.${target.product.id}&limit=1`))?.[0]?.quantity||0);
  const requestId=await rpc("create_return_request",{
    p_sale_id:target.id,
    p_items:[{sale_item_id:target.item.id,quantity:1}],
    p_reason:`V5 extended Playwright ${RUN}`,
    p_refund_method:"CASH",
    p_refund_reference:null,
  });
  assert(requestId,"Return request id missing.");
  await rpc("approve_return_request",{p_request_id:requestId});
  const rr=(await rest(`sale_return_requests?select=id,status,total_refund&sale_id=eq.${target.id}&order=created_at.desc&limit=1`))?.[0];
  assert(rr?.status==="APPROVED",`Return status ${rr?.status}.`);
  const afterReturn=Number((await rest(`inventory?select=quantity&product_id=eq.${target.product.id}&limit=1`))?.[0]?.quantity||0);
  assert(afterReturn===beforeReturn+1,`Return stock ${beforeReturn}->${afterReturn}; expected +1.`);
  check("Approved return stock restoration","PASS",`${target.product.product_name} ${beforeReturn}->${afterReturn}`);

  const current=(await rest(`cashier_shifts?select=id,status,expected_cash&cashier_id=eq.${profile.id}&status=eq.OPEN&order=opened_at.desc&limit=1`))?.[0];
  assert(current?.id,"Open shift missing before close.");
  const expected=Number(current.expected_cash||0);
  await rpc("request_close_shift",{p_actual_cash:expected,p_notes:`V5 extended Playwright close ${RUN}`});
  await rpc("approve_shift_close",{p_shift_id:current.id,p_notes:`V5 extended Playwright approve ${RUN}`});
  const closed=(await rest(`cashier_shifts?select=status,cash_difference&id=eq.${current.id}&limit=1`))?.[0];
  assert(closed?.status==="CLOSED" && Math.abs(Number(closed.cash_difference||0))<0.01,"Shift did not close at zero variance.");
  check("Shift/day close","PASS","six-sale certification shift closed at zero variance");
}

async function metricCardValue(label){
  const card=page.locator(".metric-card").filter({hasText:label}).first();
  await card.waitFor({state:"visible",timeout:15000});
  return parseMoney(await card.locator("strong").innerText());
}
async function statCardValue(label){
  const card=page.locator(".stat-card").filter({hasText:label}).first();
  await card.waitFor({state:"visible",timeout:15000});
  return parseMoney(await card.locator("strong").innerText());
}

async function ownerCenterValidation(){
  const [summary,recs,exceptions]=await Promise.all([
    rpc("owner_center_summary",{}),
    rpc("owner_recommendations",{p_history_days:30}),
    rpc("loss_control_exceptions_v3",{p_days:30}),
  ]);

  await page.goto(`${BASE}/#/owner`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Owner Control Center"}).waitFor({state:"visible",timeout:20000});
  await page.waitForTimeout(1200);
  assert(!/Unable to load all Owner Center insights/i.test(await page.locator("body").innerText()),"Owner Center RPC load error.");

  const revenue=await metricCardValue("Revenue · 30 Days");
  const gross=await metricCardValue("Gross Profit");
  const operating=await metricCardValue("Operating Profit");
  const invCost=await metricCardValue("Inventory Cost");
  assert(revenue===roundMoney(summary.revenue),`Owner revenue UI ${revenue}, RPC ${summary.revenue}.`);
  assert(gross===roundMoney(summary.gross_profit),`Owner gross profit UI ${gross}, RPC ${summary.gross_profit}.`);
  assert(operating===roundMoney(summary.operating_profit),`Owner operating UI ${operating}, RPC ${summary.operating_profit}.`);
  assert(invCost===roundMoney(summary.inventory_cost),`Owner inventory cost UI ${invCost}, RPC ${summary.inventory_cost}.`);

  const revenueCard=page.locator(".metric-card").filter({hasText:"Revenue · 30 Days"}).first();
  const revenueText=await revenueCard.innerText();
  assert(revenueText.includes(`${Number(summary.bills||0)} bills`),`Owner bill count mismatch: ${revenueText}`);

  const attention=page.locator(".attention-metrics").first();
  const lowStockRow=attention.locator("div").filter({hasText:"Low Stock"}).first();
  const lowStock=Number((await lowStockRow.locator("strong").innerText()).replace(/\D/g,""));
  assert(lowStock===Number(summary.low_stock_count||0),`Owner low stock ${lowStock}, RPC ${summary.low_stock_count}.`);

  const start=new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0);
  const recent=await rest(`sales?select=id,grand_total,status,created_at&created_at=gte.${encodeURIComponent(start.toISOString())}&order=created_at.asc&limit=5000`);
  const eligible=recent.filter(s=>String(s.status)!=="VOID");
  const ids=eligible.map(s=>s.id);
  let saleItems=[],payments=[];
  if(ids.length){
    const inList=ids.join(",");
    saleItems=await rest(`sale_items?select=sale_id,product_id,product_name_snapshot,line_total&sale_id=in.(${inList})&limit=10000`);
    payments=await rest(`payments?select=sale_id,payment_method,payment_type,created_at&sale_id=in.(${inList})&order=created_at.asc&limit=10000`);
  }
  const today=new Date().toISOString().slice(0,10);
  const todaySales=eligible.filter(s=>String(s.created_at||"").slice(0,10)===today).reduce((a,s)=>a+Number(s.grand_total||0),0);
  const trendCard=page.locator(".chart-card").filter({hasText:"30-Day Sales Trend"}).first();
  const trendLatest=parseMoney(await trendCard.locator(".chart-heading strong").innerText());
  assert(trendLatest===roundMoney(todaySales),`Sales Trend today ${trendLatest}, expected ${todaySales}.`);

  const paymentMap={CASH:0,UPI:0,CARD:0};
  const payBySale=new Map();
  for(const p of payments){
    if(String(p.payment_type||"")!=="REFUND"&&!payBySale.has(p.sale_id))payBySale.set(p.sale_id,String(p.payment_method||"").toUpperCase());
  }
  for(const s of eligible){
    const method=payBySale.get(s.id);
    if(paymentMap[method]!=null)paymentMap[method]+=Number(s.grand_total||0);
  }
  const paymentCard=page.locator(".chart-card").filter({hasText:"Payment Mix"}).first();
  for(const method of ["CASH","UPI","CARD"]){
    if(paymentMap[method]<=0)continue;
    const row=paymentCard.locator(".chart-legend > div").filter({hasText:method}).first();
    await row.waitFor({state:"visible",timeout:10000});
    const ui=parseMoney(await row.locator("strong").innerText());
    assert(ui===roundMoney(paymentMap[method]),`Payment Mix ${method} ${ui}, expected ${paymentMap[method]}.`);
  }

  const productMap=new Map();
  const eligibleIds=new Set(ids);
  for(const i of saleItems){
    if(!eligibleIds.has(i.sale_id))continue;
    const cur=productMap.get(i.product_id)||{label:i.product_name_snapshot||"Product",value:0};
    cur.value+=Number(i.line_total||0); productMap.set(i.product_id,cur);
  }
  const expectedTop=[...productMap.values()].sort((a,b)=>b.value-a.value).slice(0,7);
  const topCard=page.locator(".chart-card").filter({hasText:"Top Products by Sales"}).first();
  const uiRows=topCard.locator(".horizontal-bar-row");
  const compareCount=Math.min(3,expectedTop.length,await uiRows.count());
  assert(compareCount>0,"Top Products graph has no populated rows.");
  for(let i=0;i<compareCount;i++){
    const uiRow=uiRows.nth(i);
    const label=String(await uiRow.locator(".horizontal-bar-meta span").innerText()).trim();
    const value=parseMoney(await uiRow.locator(".horizontal-bar-meta strong").innerText());
    assert(label===expectedTop[i].label,`Top product #${i+1} label ${label}, expected ${expectedTop[i].label}.`);
    assert(value===roundMoney(expectedTop[i].value),`Top product ${label} value ${value}, expected ${expectedTop[i].value}.`);
  }

  const reviewRow=attention.locator("div").filter({hasText:"Requires Review"}).first();
  const reviewCount=Number((await reviewRow.locator("strong").innerText()).replace(/\D/g,""));
  assert(reviewCount===Number(exceptions.length||0),`Owner exception count ${reviewCount}, RPC ${exceptions.length}.`);

  report.ownerCenter={summary,recommendationCount:recs.length,exceptionCount:exceptions.length,todaySales,paymentMap,topProducts:expectedTop.slice(0,3)};
  await shot(page,"04_owner_center_verified.png");
  check("Owner Center headline metrics","PASS","Revenue · Gross Profit · Operating Profit · Inventory Cost · bills · low stock match RPC");
  check("Owner Center graphs","PASS","Sales Trend · CASH/UPI/CARD Payment Mix · Top Products match authoritative sales data");
}

async function inventoryIntelligenceValidation(){
  const health=await rpc("inventory_health",{p_history_days:30,p_dead_days:45});
  assert(Array.isArray(health)&&health.length>0,"inventory_health returned no rows.");
  const counts=health.reduce((a,r)=>{a[r.classification]=(a[r.classification]||0)+1;return a;},{});
  await page.goto(`${BASE}/#/inventory/intelligence`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Inventory Intelligence"}).waitFor({state:"visible",timeout:20000});
  await page.waitForTimeout(900);
  assert(await metricCardValue("Stockout Risk")===Number(counts.STOCKOUT_RISK||0),"Inventory Intelligence Stockout Risk mismatch.");
  assert(await metricCardValue("Dead Stock")===Number(counts.DEAD||0),"Inventory Intelligence Dead Stock mismatch.");
  assert(await metricCardValue("Overstock")===Number(counts.OVERSTOCK||0),"Inventory Intelligence Overstock mismatch.");
  assert(await metricCardValue("Out of Stock")===Number(counts.OUT_OF_STOCK||0),"Inventory Intelligence Out of Stock mismatch.");
  const first=health[0];
  const row=page.locator("table.data-table tbody tr").filter({hasText:first.product_name}).first();
  await row.waitFor({state:"visible",timeout:12000});
  const txt=await row.innerText();
  assert(txt.includes(String(first.current_stock)),`Inventory Intelligence ${first.product_name} stock not visible.`);

  const explain=await rpc("stock_explanation",{p_product_id:first.product_id,p_days:365});
  await page.getByLabel("Product").selectOption(first.product_id);
  if(explain.length){
    await page.locator(".movement-chip").first().waitFor({state:"visible",timeout:12000});
    const chip=page.locator(".movement-chip").filter({hasText:String(explain[0].movement_type).replaceAll("_"," ")}).first();
    assert(await chip.count()===1,`Stock explanation missing ${explain[0].movement_type}.`);
  }
  report.inventoryIntelligence={rows:health.length,counts,checkedProduct:first.product_name};
  await shot(page,"05_inventory_intelligence_verified.png");
  check("Inventory Intelligence","PASS",`${health.length} health rows · metric counts and stock row match RPC`);
}

async function ownerProfitValidation(){
  const now=new Date();
  const from=new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10);
  const to=now.toISOString().slice(0,10);
  const [summary,profitRows]=await Promise.all([
    rpc("owner_center_summary",{p_from:from,p_to:to}),
    rpc("profit_by_product",{p_from:from,p_to:to}),
  ]);
  await page.goto(`${BASE}/#/owner/profit`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Profit & Business Intelligence"}).waitFor({state:"visible",timeout:20000});
  await page.waitForTimeout(900);
  assert(await metricCardValue("Revenue")===roundMoney(summary.revenue),"Owner Profit revenue mismatch.");
  assert(await metricCardValue("COGS")===roundMoney(summary.cogs),"Owner Profit COGS mismatch.");
  assert(await metricCardValue("Gross Profit")===roundMoney(summary.gross_profit),"Owner Profit gross mismatch.");
  assert(await metricCardValue("Operating Profit")===roundMoney(summary.operating_profit),"Owner Profit operating mismatch.");
  if(profitRows.length){
    const first=profitRows[0];
    const row=page.locator("table.data-table tbody tr").filter({hasText:first.product_name}).first();
    await row.waitFor({state:"visible",timeout:12000});
  }
  report.ownerProfit={summary,profitRows:profitRows.length};
  await shot(page,"06_owner_profit_verified.png");
  check("Profit Intelligence","PASS","Revenue · COGS · Gross Profit · Operating Profit match RPC");
}

async function purchaseIntelligenceValidation(product){
  const history=await rpc("purchase_price_history",{p_product_id:product.id,p_limit:24});
  assert(Array.isArray(history)&&history.length>0,`${product.product_name}: no purchase price history after large purchase.`);
  await page.goto(`${BASE}/#/purchasing/intelligence`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Smart Purchase Intelligence"}).waitFor({state:"visible",timeout:20000});
  await page.getByLabel("Analyze Product").selectOption(product.id);
  await page.waitForTimeout(1000);
  const latest=await metricCardValue("Latest Purchase Price");
  assert(almost(latest,Number(history[0].purchase_price),0.02),`Purchase Intelligence latest price ${latest}, RPC ${history[0].purchase_price}.`);
  report.purchaseIntelligence={product:product.product_name,latestPurchasePrice:Number(history[0].purchase_price),historyRows:history.length};
  await shot(page,"07_purchase_intelligence_verified.png");
  check("Purchase Intelligence","PASS",`${product.product_name} latest purchase price matches history RPC`);
}

async function reportsValidation(){
  const now=new Date();
  const from=new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10);
  const to=now.toISOString().slice(0,10);
  const [sales,purchases,products,inventory,payments]=await Promise.all([
    rest(`sales?select=id,grand_total,created_at,status&created_at=gte.${encodeURIComponent(from+"T00:00:00")}&created_at=lte.${encodeURIComponent(to+"T23:59:59")}&limit=5000`),
    rest(`purchases?select=id,total,invoice_date&invoice_date=gte.${from}&invoice_date=lte.${to}&limit=5000`),
    productRows(),
    rest("inventory?select=product_id,quantity&limit=1000"),
    rest("payments?select=sale_id,payment_method,payment_type&limit=10000"),
  ]);
  const salesTotal=sales.reduce((s,x)=>s+Number(x.grand_total||0),0);
  const purchaseTotal=purchases.reduce((s,x)=>s+Number(x.total||0),0);
  const invMap=new Map(inventory.map(x=>[x.product_id,Number(x.quantity||0)]));
  const inventoryCost=products.reduce((s,p)=>s+(invMap.get(p.id)||0)*Number(p.purchase_price||0),0);
  const potentialSales=products.reduce((s,p)=>s+(invMap.get(p.id)||0)*Number(p.selling_price||0),0);

  await page.goto(`${BASE}/#/reports`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Reports"}).waitFor({state:"visible",timeout:20000});
  await page.waitForTimeout(900);
  assert(await statCardValue("Sales")===roundMoney(salesTotal),`Reports Sales mismatch.`);
  assert(await statCardValue("Purchases")===roundMoney(purchaseTotal),`Reports Purchases mismatch.`);
  assert(await statCardValue("Inventory Cost")===roundMoney(inventoryCost),`Reports Inventory Cost mismatch.`);
  assert(await statCardValue("Potential Sales")===roundMoney(potentialSales),`Reports Potential Sales mismatch.`);
  const period=page.locator(".panel").filter({hasText:"Period"}).first();
  assert((await period.innerText()).includes(`Bills: ${sales.length}`),`Reports bill count mismatch.`);
  assert((await period.innerText()).includes(`Purchases: ${purchases.length}`),`Reports purchase count mismatch.`);
  report.reports={salesTotal,purchaseTotal,inventoryCost,potentialSales,bills:sales.length,purchases:purchases.length};
  await shot(page,"08_reports_verified.png");
  check("Reports business values","PASS","Sales · Purchases · Inventory Cost · Potential Sales · period counts match authoritative data");
}

async function finalInventoryAudit(){
  const [inventory,movements]=await Promise.all([
    rest("inventory?select=product_id,quantity&limit=1000"),
    rest("stock_movements?select=product_id,quantity_change&limit=20000"),
  ]);
  const movementByProduct=new Map();
  for(const m of movements) movementByProduct.set(m.product_id,(movementByProduct.get(m.product_id)||0)+Number(m.quantity_change||0));
  for(const row of inventory){
    const expected=movementByProduct.get(row.product_id)||0;
    assert(Number(row.quantity)===expected,`Final inventory mismatch ${row.product_id}: inventory ${row.quantity}, net movements ${expected}.`);
  }
  for(const [pid,expected] of movementByProduct){
    const row=inventory.find(x=>x.product_id===pid);
    assert(row && Number(row.quantity)===expected,`Final movement product ${pid} has no matching inventory ${expected}.`);
  }
  const totalInventory=inventory.reduce((s,x)=>s+Number(x.quantity||0),0);
  const totalMovements=movements.reduce((s,x)=>s+Number(x.quantity_change||0),0);
  assert(totalInventory===totalMovements,`Final inventory ${totalInventory} != net stock movements ${totalMovements}.`);
  check("Final inventory ledger equality","PASS",`inventory ${totalInventory} = net stock movements ${totalMovements}, per product`);
  report.finalInventory={rows:inventory.length,totalInventory,totalMovements,exactPerProduct:true};
}

function writeReport(){
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,"EXTENDED_CERT_RESULT.json"),JSON.stringify(report,null,2));
  const md=[
    "# WineShopPOS V5 Extended Business Playwright Certification",
    "",
    `**Final: ${report.final}**`,
    "",
    `Run: ${RUN}`,
    `Started: ${report.startedAt}`,
    `Finished: ${report.finishedAt}`,
    "",
    "## Checks",
    "",
    "| Check | Status | Detail |",
    "|---|---|---|",
    ...report.checks.map(x=>`| ${String(x.name).replace(/\|/g,"/")} | ${x.status} | ${String(x.detail||"").replace(/\|/g,"/")} |`),
    "",
    "## Golden invoices",
    "",
    "```json",
    JSON.stringify(report.golden,null,2),
    "```",
    "",
    "## Large purchase",
    "",
    "```json",
    JSON.stringify(report.largePurchase,null,2),
    "```",
    "",
    "## Owner analytics",
    "",
    "```json",
    JSON.stringify({ownerCenter:report.ownerCenter,inventoryIntelligence:report.inventoryIntelligence,ownerProfit:report.ownerProfit,purchaseIntelligence:report.purchaseIntelligence,reports:report.reports},null,2),
    "```",
    "",
    ...(report.warnings.length?["## Warnings","",...report.warnings.map(x=>`- ${x}`),""]:[]),
    ...(report.consoleErrors.length?["## Browser console errors","",...report.consoleErrors.slice(0,50).map(x=>`- ${x}`),""]:[]),
    ...(report.failedRequests.length?["## Failed requests","",...report.failedRequests.slice(0,50).map(x=>`- ${x}`),""]:[]),
  ];
  fs.writeFileSync(path.join(OUT,"EXTENDED_CERT_SUMMARY.md"),md.join("\n"));
}

try{
  browser=await chromium.launch({headless:false,slowMo:10});
  context=await browser.newContext({
    storageState:fs.existsSync(AUTH)?AUTH:undefined,
    viewport:{width:1600,height:1000},
  });
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  await context.route("**/*",async route=>{
    const url=route.request().url();
    let u; try{u=new URL(url);}catch{return route.continue();}
    const bad=u.hostname===PROD_HOST || u.hostname.includes(PROD) || url.includes(PROD) ||
      (u.hostname.endsWith(".supabase.co") && u.hostname!==`${DEV}.supabase.co`);
    if(bad){report.blockedProductionRequests.push(url);return route.abort("blockedbyclient");}
    return route.continue();
  });
  page=await context.newPage();
  page.on("console",msg=>{if(msg.type()==="error")report.consoleErrors.push(msg.text());});
  page.on("requestfailed",req=>{
    const u=req.url();
    if(!report.blockedProductionRequests.includes(u))report.failedRequests.push(`${req.failure()?.errorText||"failed"} ${u}`);
  });

  await login();
  await page.goto(`${BASE}/#/account`);
  await page.locator('[data-environment-badge="QA-DEV-V5"]').waitFor({state:"visible",timeout:15000});
  check("QA/DEV environment badge","PASS","V5 NOT PROD");

  await verifyGoldenState();
  const large=await largePurchaseFlow();
  await salesReturnShiftFlow(large.selected);
  await ownerCenterValidation();
  await inventoryIntelligenceValidation();
  await ownerProfitValidation();
  await purchaseIntelligenceValidation(large.selected[0]);
  await reportsValidation();
  await finalInventoryAudit();

  assert(report.blockedProductionRequests.length===0,`${report.blockedProductionRequests.length} PROD/wrong-environment request(s) attempted.`);
  report.final="PASS";
  console.log("[EXTENDED] FINAL RESULT: PASS");
}catch(error){
  report.final="FAIL";
  report.warnings.push(error?.stack||String(error));
  console.error(`[EXTENDED] FAIL: ${error?.message||error}`);
  if(page)await shot(page,"FAILURE_CURRENT_SCREEN.png");
  process.exitCode=1;
}finally{
  try{if(context)await context.tracing.stop({path:path.join(OUT,"extended-playwright-trace.zip")});}catch{}
  try{writeReport();}catch(e){console.error("Could not write report",e);}
  try{if(browser)await browser.close();}catch{}
}

console.log(`[EXTENDED] Evidence: ${OUT}`);

