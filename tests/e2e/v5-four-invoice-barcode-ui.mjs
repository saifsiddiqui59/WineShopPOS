
import fs from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.WSP_BASE_URL || "http://127.0.0.1:4196";
const AUTH = process.env.WSP_AUTH_FILE || "";
const FIXTURE = process.env.WSP_E2E_FIXTURE || "";
const STRICT = new Set(String(process.env.WSP_STRICT_INVOICES || "")
  .split(",").map(x=>x.trim()).filter(Boolean));
const PROD_REF = "uiurgplnsgmawvxhjzzp";
const PROD_HOST = "wineshoppos.z29.web.core.windows.net";

const assert=(v,m)=>{if(!v)throw new Error(m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=v=>String(v??"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");

assert(AUTH && fs.existsSync(AUTH), `Saved QA auth missing: ${AUTH}`);
assert(FIXTURE && fs.existsSync(FIXTURE), `E2E fixture missing: ${FIXTURE}`);

const fixture=JSON.parse(fs.readFileSync(FIXTURE,"utf8"));
const entries=Object.values(fixture.invoices).flatMap(inv =>
  (inv.lines||[]).map(line=>({
    invoice:String(inv.invoiceNumber),
    name:String(line.name),
    aliases:Array.isArray(line.aliases)?line.aliases:[],
    size:Number(line.size),
    sizeAliases:Array.isArray(line.sizeAliases)?line.sizeAliases.map(Number):[],
    barcode:String(line.barcode||"").trim(),
  }))
).filter(x=>x.barcode);

function sizeFromMeta(v){
  return Number((String(v||"").match(/(\d+)\s*ml/i)||[])[1]||0);
}
async function waitProducts(page){
  await page.locator("h2").filter({hasText:/^Products$/}).first().waitFor({state:"visible",timeout:30000});
  await page.locator(".products-master-table").waitFor({state:"visible",timeout:30000});
  const loading=page.locator(".data-table-wrapper").filter({hasText:"Loading..."}).first();
  if(await loading.isVisible().catch(()=>false)) await loading.waitFor({state:"hidden",timeout:30000});
}
async function productRows(page){
  return page.locator(".products-master-table tbody tr");
}
async function findProductRow(page,item){
  const search=page.locator('input[data-scanner-capture="barcode"]').first();
  const allowedNames=[item.name,...item.aliases].map(norm);
  const allowedSizes=[item.size,...item.sizeAliases].map(Number);
  for(const term of [item.name,...item.aliases]){
    await search.fill(term);
    await sleep(120);
    const rows=await productRows(page);
    const n=await rows.count();
    for(let i=0;i<n;i++){
      const row=rows.nth(i);
      if(!await row.isVisible().catch(()=>false)) continue;
      const name=norm(await row.locator(".products-product-name").innerText().catch(()=>""));
      const size=sizeFromMeta(await row.locator(".products-product-meta").innerText().catch(()=>""));
      if(allowedNames.includes(name)&&allowedSizes.includes(size)) return row;
    }
  }
  return null;
}
async function assertBarcodeUnowned(page,item){
  const search=page.locator('input[data-scanner-capture="barcode"]').first();
  await search.fill(item.barcode);
  await sleep(120);
  const rows=await productRows(page);
  const n=await rows.count();
  for(let i=0;i<n;i++){
    const row=rows.nth(i);
    if(!await row.isVisible().catch(()=>false)) continue;
    const barcode=(await row.locator("td").nth(1).innerText()).trim();
    if(barcode!==item.barcode) continue;
    const name=norm(await row.locator(".products-product-name").innerText());
    const size=sizeFromMeta(await row.locator(".products-product-meta").innerText());
    const allowedNames=[item.name,...item.aliases].map(norm);
    const allowedSizes=[item.size,...item.sizeAliases].map(Number);
    assert(allowedNames.includes(name)&&allowedSizes.includes(size),
      `${item.invoice}: mock barcode ${item.barcode} already belongs to another product (${name} ${size}ml).`);
  }
}
async function ensureBarcode(page,item){
  await page.goto(`${BASE}/#/products`,{waitUntil:"domcontentloaded"});
  await waitProducts(page);
  let row=await findProductRow(page,item);
  if(!row){
    if(STRICT.has(item.invoice)) throw new Error(`${item.invoice}: Product Master missing ${item.name} ${item.size}ml.`);
    console.log(`[BARCODE] ${item.invoice} ABSENT ${item.name} ${item.size}ml`);
    return "ABSENT";
  }
  const current=(await row.locator("td").nth(1).innerText()).trim();
  if(current && !/missing barcode/i.test(current)){
    console.log(`[BARCODE] ${item.invoice} KEEP ${item.name} ${item.size}ml -> ${current}`);
    return "KEEP";
  }
  await assertBarcodeUnowned(page,item);
  await page.goto(`${BASE}/#/products`,{waitUntil:"domcontentloaded"});
  await waitProducts(page);
  row=await findProductRow(page,item);
  assert(row,`${item.invoice}: product disappeared before UI barcode edit.`);
  await row.getByRole("link",{name:"Edit",exact:true}).click();
  await page.locator("h2").filter({hasText:/^Edit Product$/}).first().waitFor({state:"visible",timeout:30000});
  const barcodeInput=page.locator('input[data-scanner-capture="barcode"]').first();
  const nameInput=page.getByLabel("Product Name",{exact:true});
  const sizeInput=page.getByLabel("Size (ml)",{exact:true});
  await barcodeInput.waitFor({state:"visible",timeout:20000});

  const oldName=await nameInput.inputValue();
  const oldSize=Number(await sizeInput.inputValue());
  if(item.aliases.map(norm).includes(norm(oldName)) && norm(oldName)!==norm(item.name)){
    await nameInput.fill(item.name);
    console.log(`[BARCODE] ${item.invoice} human correction name: ${oldName} -> ${item.name}`);
  }
  if(item.sizeAliases.includes(oldSize) && oldSize!==item.size){
    await sizeInput.fill(String(item.size));
    console.log(`[BARCODE] ${item.invoice} human correction size: ${oldSize} -> ${item.size}`);
  }
  await barcodeInput.fill(item.barcode);
  await page.getByRole("button",{name:"Save & Close",exact:true}).click();
  await waitProducts(page);

  const search=page.locator('input[data-scanner-capture="barcode"]').first();
  await search.fill(item.barcode);
  await sleep(120);
  const verify=page.locator(".products-master-table tbody tr").filter({hasText:item.barcode}).first();
  await verify.waitFor({state:"visible",timeout:20000});
  console.log(`[BARCODE] ${item.invoice} UI ADDED ${item.name} ${item.size}ml -> ${item.barcode}`);
  return "ADDED";
}

let browser;
try{
  browser=await chromium.launch({headless:false,slowMo:4});
  const ctx=await browser.newContext({storageState:AUTH,viewport:{width:1500,height:950}});
  let blockedProd=0;
  await ctx.route("**/*",route=>{
    const u=route.request().url();
    if(u.includes(PROD_REF)||u.includes(PROD_HOST)){blockedProd++;return route.abort("blockedbyclient");}
    return route.continue();
  });
  const page=await ctx.newPage();
  await page.goto(`${BASE}/#/products`,{waitUntil:"domcontentloaded"});
  if(!await page.locator("h2").filter({hasText:/^Products$/}).first().isVisible().catch(()=>false)){
    console.log("[BARCODE] Saved QA session expired. Sign in once in the visible DEV browser.");
    await page.locator("h2").filter({hasText:/^Products$/}).first().waitFor({state:"visible",timeout:300000});
  }
  await waitProducts(page);
  await page.locator('[data-environment-badge="QA-DEV-V5"]').waitFor({state:"visible",timeout:20000});

  const stats={ADDED:0,KEEP:0,ABSENT:0};
  for(const item of entries) stats[await ensureBarcode(page,item)]++;
  assert(blockedProd===0,`Blocked ${blockedProd} PROD request(s).`);
  console.log(`[BARCODE] PASS total=${entries.length} added=${stats.ADDED} kept=${stats.KEEP} absent=${stats.ABSENT} strict=${[...STRICT].join(",")}`);
  await ctx.close();
}catch(e){
  console.error("[BARCODE] FAIL",e?.stack||e);
  process.exitCode=1;
}finally{
  try{if(browser)await browser.close();}catch{}
}
