import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const edge=r("supabase/functions/product-enrichment/index.ts"),client=r("src/lib/productEnrichmentClient.js"),form=r("src/components/ProductForm.jsx"),add=r("src/pages/AddProduct.jsx"),automation=r("src/pages/AutomationHub.jsx"),edit=r("src/pages/EditProduct.jsx"),scanner=r("src/components/MobileBarcodeScanner.jsx"),phone=r("src/pages/PhoneScannerRemote.jsx"),css=r("src/index.css");

test("pre-save image search uses identity not barcode",()=>{
  const a=edge.indexOf("function buildPreSaveImageIdentity"),b=edge.indexOf("async function imageChoiceCacheKeyFor",a),x=edge.slice(a,b);
  assert.match(x,/PRE_SAVE_IMAGE_CHOICES/);assert.match(x,/searchSerpImagesFree/);assert.match(x,/query_barcode: null/);assert.doesNotMatch(x,/p_barcode/);
  assert.match(client,/PRE_SAVE_IMAGE_CHOICES/);
});
test("exact selected candidate applies after create with identity safety",()=>{
  assert.match(form,/preSaveImageSelection/);assert.match(add,/applyPreSaveProductImageChoice/);assert.match(edge,/selectionMode: "PRE_SAVE"/);assert.match(edge,/Saved Product Master identity no longer matches/);assert.match(edge,/productIdentityUnchanged: true/);
});
test("OCR Edit Product returns to same review",()=>{
  assert.match(automation,/V5_20C_OCR_EDIT_PRODUCT_RETURN_20260909/);assert.match(automation,/Edit Product/);assert.match(edit,/returnPath = fromOcr \? "\/purchasing\/ocr" : "\/products"/);
});
test("scanner full-screen pinch UX",()=>{
  assert.match(scanner,/V5_20D_MINIMAL_FULLSCREEN_PINCH_SCANNER_20260909/);assert.match(scanner,/handlePinchMove/);assert.doesNotMatch(scanner,/>Zoom -<|>Zoom \+</);assert.match(css,/100dvh/);
});
test("phone UI minimal but transport retained",()=>{
  assert.match(phone,/<h1>Phone Scanner<\/h1>/);
  assert.match(phone,/SEND_ATTEMPTS = 3/);
  assert.match(phone,/barcode-ack/);
  assert.match(phone,/supabase\s*\.\s*channel\s*\(/);
  assert.match(phone,/title="Scan Barcode"/);
  assert.doesNotMatch(phone,/Auto Scan:/);
});
