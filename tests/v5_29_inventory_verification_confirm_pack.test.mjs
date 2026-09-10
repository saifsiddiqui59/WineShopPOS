import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const inventory=read("src/pages/Inventory.jsx");
const purchases=read("src/pages/Purchases.jsx");
const details=read("src/pages/PurchaseDetails.jsx");
const engine=read("src/components/PurchaseVerificationEngine.jsx");
const css=read("src/index.css");

test("Inventory paired-phone scan fills search and focused hardware scanner is supported",()=>{
  assert.match(inventory,/useScanner/);
  assert.match(inventory,/lastScan\.source !== "PHONE_REMOTE"/);
  assert.match(inventory,/setSearch\(barcode\)/);
  assert.match(inventory,/data-scanner-capture="barcode"/);
  assert.match(inventory,/Paired phone scans automatically search Inventory/);
});

test("Inventory product list receives the larger desktop column",()=>{
  assert.match(inventory,/settings-grid inventory-stock-layout/);
  assert.match(css,/\.inventory-stock-layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*3\.2fr\)\s*minmax\(280px,\s*0\.8fr\)/);
});

test("Confirm Pack automatically preserves audit distinction",()=>{
  assert.match(purchases,/const createPackBaseline=/);
  assert.match(purchases,/const packDiffersFromBaseline=/);
  assert.match(purchases,/const state=changed\?"CORRECTED":"CONFIRMED_AS_POSTED"/);
  assert.match(purchases,/>Confirm Pack<\/button>/);
  assert.doesNotMatch(purchases,/>Confirm as Posted<\/button>/);
  assert.doesNotMatch(purchases,/>Correct Pack<\/button>/);
});

test("completed Purchase Verification is success-first and audit lists stay explicit",()=>{
  assert.match(engine,/PURCHASE COMPLETE/);
  assert.match(engine,/Stock was posted successfully\. No further action is required\. You can close this page\./);
  assert.match(details,/\{showAuditTools \? <>/);
  assert.doesNotMatch(details,/\(!packResolved \|\| showAuditTools\)/);
  assert.equal((details.match(/View Original Invoice/g)||[]).length,1);
  assert.doesNotMatch(engine,/View Original Invoice/);
});

test("protected V5_28B, V5_27 and atomic purchase contracts remain",()=>{
  const invoicePack=read("src/lib/invoicePack.js");
  const shop=read("src/context/ShopContext.jsx");
  assert.match(purchases,/const localAttempt=saveOfflinePurchaseDraft\(draftId,p\)/);
  assert.match(purchases,/catch\(serverError\)/);
  assert.match(purchases,/Server Purchase Draft synced\./);
  assert.match(invoicePack,/if \(size === 500\)/);
  assert.match(invoicePack,/PRIOR_500ML_24/);
  assert.match(shop,/receive_purchase_v3/);
});
