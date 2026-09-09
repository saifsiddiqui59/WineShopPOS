import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const purchases=fs.readFileSync("src/pages/Purchases.jsx","utf8");
const css=fs.readFileSync("src/index.css","utf8");
const scannerContext=fs.readFileSync("src/context/ScannerContext.jsx","utf8");
const phoneHost=fs.readFileSync("src/components/GlobalPhoneScannerHost.jsx","utf8");
const shop=fs.readFileSync("src/context/ShopContext.jsx","utf8");

test("Purchase Receiving separates local camera and paired phone",()=>{
  assert.match(purchases,/Camera This Device/);
  assert.match(purchases,/Scan with Phone/);
  assert.doesNotMatch(purchases,/>Scan Now<\/button>/);
  assert.match(purchases,/lastScan\.source!=="PHONE_REMOTE"/);
  assert.match(purchases,/armPhoneScan/);
});

test("Prepare Product consumes paired phone barcode without committing Product Master",()=>{
  assert.match(purchases,/setCreateForm\(current=>current\?\{\.\.\.current,barcode:scan\}/);
  assert.match(purchases,/data-scanner-capture="barcode"/);
  assert.match(purchases,/Nothing is committed yet/);
  assert.match(purchases,/created only on successful receive/);
});

test("Selected Line sidebar is removed and table is full width",()=>{
  assert.doesNotMatch(purchases,/<h3>Selected Line<\/h3>/);
  assert.doesNotMatch(purchases,/purchase-review-side/);
  assert.match(css,/\.purchase-workspace-layout\{display:grid;grid-template-columns:minmax\(0,1fr\);/);
});

test("existing global scanner transport is reused, not rewritten",()=>{
  assert.match(phoneHost,/injectScan\(barcode/);
  assert.match(phoneHost,/source: "PHONE_REMOTE"/);
  assert.match(scannerContext,/lastScan/);
  assert.ok(scannerContext.includes('dataset?.scannerCapture === "barcode"'));
});

test("V5_23 atomic purchase and V5_24 connectivity remain",()=>{
  assert.match(shop,/receive_purchase_v3/);
  assert.match(purchases,/receiveStock\(\{/);
  assert.match(purchases,/probeBackendConnectivity/);
  assert.match(purchases,/disabled=\{busy\|\|!ready\}/);
  assert.match(purchases,/pruneEmptyManualPurchaseDrafts/);
});
