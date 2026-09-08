import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main=fs.readFileSync("src/main.jsx","utf8");
const add=fs.readFileSync("src/pages/AddProduct.jsx","utf8");
const form=fs.readFileSync("src/components/ProductForm.jsx","utf8");
const products=fs.readFileSync("src/pages/Products.jsx","utf8");
const pos=fs.readFileSync("src/pages/POS.jsx","utf8");
const host=fs.readFileSync("src/components/GlobalPhoneScannerHost.jsx","utf8");
const setup=fs.readFileSync("src/pages/PhoneScannerSetup.jsx","utf8");
const phone=fs.readFileSync("src/pages/PhoneScannerRemote.jsx","utf8");
const mobileScanner=fs.readFileSync("src/components/MobileBarcodeScanner.jsx","utf8");
const css=fs.readFileSync("src/index.css","utf8");
const masterCss=fs.readFileSync("src/masterConsolidation.css","utf8");
const current=fs.readFileSync("docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md","utf8");
const imageFeature=fs.readFileSync("docs/versions/v5/features/PRODUCT_IMAGE_AUTO_ENRICHMENT.md","utf8");
const phoneFeature=fs.readFileSync("docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md","utf8");

test("new Product Image preview still auto-loads without click",()=>{
  assert.match(form,/OcrProductImagePreview/);
  assert.match(form,/delayMs=\{450\}/);
  assert.match(form,/Product Image will load automatically/);
  assert.match(form,/first Product Image preview appears automatically/i);
});

test("saved Add Product keeps same automatic image client as Products page",()=>{
  assert.match(add,/autoFindProductImage/);
  assert.match(products,/autoFindProductImage/);
  assert.match(add,/replace:\s*false/);
  assert.match(add,/await refreshAll\(\)/);
  assert.match(add,/hasExplicitImage/);
  assert.match(add,/imageFinalizedBySelection/);
});

test("auto image path preserves barcode safety proof",()=>{
  assert.match(add,/barcodeUnchanged/);
  assert.match(form,/Barcode is never changed by image processing/);
});

test("new Add Product keeps one simplified Product Image action plus local upload/camera",()=>{
  assert.match(form,/Find Product \/ Image/);
  assert.doesNotMatch(form,/Review \/ Find Product Image/);
  assert.equal((form.match(/<ProductEnrichmentPanel/g)||[]).length,1);
  assert.match(form,/type="file"/);
  assert.match(form,/Open Camera/);
});

test("Product Image panel keeps dark-mode readability rules",()=>{
  assert.match(css,/V5_16_COMBINED_IMAGE_PHONE_SCANNER_20260908/);
  assert.match(css,/html\[data-theme="dark"\] \.product-image-editor/);
  assert.match(css,/#cbd1dc/);
});

test("global phone QR remains a HashRouter route",()=>{
  assert.match(main,/HashRouter/);
  assert.match(host,/url\.hash\s*=\s*`\/phone-scanner\?/);
  assert.match(setup,/QRCodeSVG/);
});

test("phone route reads hash-router query through React Router",()=>{
  assert.match(phone,/useSearchParams/);
  assert.doesNotMatch(phone,/window\.location\.search/);
});

test("phone barcode delivery retries safely and global PC host dedupes",()=>{
  assert.match(phone,/SEND_ATTEMPTS = 3/);
  assert.match(phone,/ACK_TIMEOUT_MS/);
  assert.match(phone,/waitAck/);
  assert.match(host,/seenRef/);
  assert.match(host,/prior/);
  assert.match(host,/barcode-ack/);
});

test("global PC host acknowledges scanner injection while PC remains authoritative",()=>{
  assert.match(host,/SCAN_INJECTED/);
  assert.match(host,/injectScan/);
  assert.match(pos,/ADDED_TO_CART/);
  assert.match(pos,/PRODUCT_NOT_FOUND/);
  assert.match(pos,/processBarcode/);
});

test("POS keeps clear local scanner tabs; phone pairing lives in Operations",()=>{
  assert.match(pos,/role="tablist"/);
  assert.match(pos,/Barcode Scanner/);
  assert.match(pos,/This Device Camera/);
  assert.doesNotMatch(pos,/PhoneToPcScannerPanel/);
  assert.doesNotMatch(pos,/Phone → this PC/);
});

test("USB and same-device mobile camera scanner remain preserved",()=>{
  assert.match(pos,/useScanner/);
  assert.match(pos,/lastScan/);
  assert.match(pos,/MobileBarcodeScanner/);
  assert.match(mobileScanner,/BarcodeDetector/);
  assert.match(mobileScanner,/BrowserMultiFormatOneDReader/);
  assert.match(mobileScanner,/BrowserMultiFormatReader/);
  assert.match(mobileScanner,/facingMode:\s*\{\s*ideal:\s*"environment"/);
});

test("scanner dark mode and module tabs remain readable",()=>{
  assert.match(css,/V5_16_PHONE_SCANNER_REPAIR_20260908/);
  assert.match(css,/html\[data-theme="dark"\] \.pos-scanner-tab/);
  assert.match(css,/html\[data-theme="dark"\] \.mobile-barcode-modal/);
  assert.match(masterCss,/V5_16_DARK_MODULE_TAB_READABILITY_20260908/);
  assert.match(masterCss,/html\[data-theme="dark"\] \.module-tab\.active/);
});

test("image documentation contract tolerates line breaks",()=>{
  assert.match(imageFeature,/Add Product/);
  assert.match(imageFeature,/auto-load/i);
  assert.match(imageFeature,/same[\s\S]*Products page/i);
  assert.match(imageFeature,/No new paid service/i);
});

test("phone documentation records V5_19 supersession and retest requirement",()=>{
  assert.match(phoneFeature,/V5_19/);
  assert.match(phoneFeature,/supersedes[\s\S]*10-minute/i);
  assert.match(phoneFeature,/human retest/i);
});

test("continuity document carries V5_19 global scanner and Product Image safety",()=>{
  assert.match(current,/41755f157e330cd0eb3cb8667ee6ea063389d25c/);
  assert.match(current,/V5_19/);
  assert.match(current,/GlobalPhoneScannerHost|global phone scanner/i);
  assert.match(current,/Product Image/);
  assert.match(current,/Remaining manual UAT/);
});
