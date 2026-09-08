import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main = fs.readFileSync("src/main.jsx", "utf8");
const add = fs.readFileSync("src/pages/AddProduct.jsx", "utf8");
const form = fs.readFileSync("src/components/ProductForm.jsx", "utf8");
const products = fs.readFileSync("src/pages/Products.jsx", "utf8");
const pos = fs.readFileSync("src/pages/POS.jsx", "utf8");
const panel = fs.readFileSync(
  "src/components/PhoneToPcScannerPanel.jsx",
  "utf8",
);
const phone = fs.readFileSync(
  "src/pages/PhoneScannerRemote.jsx",
  "utf8",
);
const mobileScanner = fs.readFileSync(
  "src/components/MobileBarcodeScanner.jsx",
  "utf8",
);
const css = fs.readFileSync("src/index.css", "utf8");
const masterCss = fs.readFileSync("src/masterConsolidation.css", "utf8");
const current = fs.readFileSync(
  "docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md",
  "utf8",
);
const imageFeature = fs.readFileSync(
  "docs/versions/v5/features/PRODUCT_IMAGE_AUTO_ENRICHMENT.md",
  "utf8",
);
const phoneFeature = fs.readFileSync(
  "docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md",
  "utf8",
);

test("new Product Image preview auto-loads without click", () => {
  assert.match(form, /OcrProductImagePreview/);
  assert.match(form, /delayMs=\{450\}/);
  assert.match(form, /Product Image will load automatically/);
  assert.match(form, /first Product Image preview appears automatically/i);
});

test("saved Add Product uses same automatic image client as Products page", () => {
  assert.match(add, /autoFindProductImage/);
  assert.match(products, /autoFindProductImage/);
  assert.match(add, /replace:\s*false/);
  assert.match(add, /await refreshAll\(\)/);
  assert.match(add, /hasExplicitImage/);
  assert.match(add, /imageFinalizedBySelection/);
});

test("auto image path preserves barcode safety proof", () => {
  assert.match(add, /barcodeUnchanged/);
  assert.match(form, /Barcode is never changed by image processing/);
});

test("new Add Product keeps manual image choices", () => {
  assert.match(form, /Review \/ Find Product Image/);
  assert.match(form, /type="file"/);
  assert.match(form, /Open Camera/);
});

test("Product Image panel has dark-mode readability rules", () => {
  assert.match(css, /V5_16_COMBINED_IMAGE_PHONE_SCANNER_20260908/);
  assert.match(css, /html\[data-theme="dark"\] \.product-image-editor/);
  assert.match(css, /#cbd1dc/);
});

test("HashRouter phone QR is generated as a hash route", () => {
  assert.match(main, /HashRouter/);
  assert.match(panel, /url\.hash\s*=\s*`\/phone-scanner\?/);
  assert.doesNotMatch(panel, /new URL\("\/phone-scanner"/);
});

test("phone route reads hash-router query through React Router", () => {
  assert.match(phone, /useSearchParams/);
  assert.doesNotMatch(phone, /window\.location\.search/);
});

test("phone barcode delivery retries safely and waits for PC acknowledgement", () => {
  assert.match(phone, /SEND_ATTEMPTS = 3/);
  assert.match(phone, /ACK_TIMEOUT_MS/);
  assert.match(phone, /waitForAck/);
  assert.match(phone, /Retry Sending Last Barcode/);
  assert.match(panel, /ackCacheRef/);
  assert.match(panel, /priorAck/);
  assert.match(panel, /barcode-ack/);
});

test("PC sends actual POS barcode result back to phone", () => {
  assert.match(pos, /ADDED_TO_CART/);
  assert.match(pos, /PRODUCT_NOT_FOUND/);
  assert.match(panel, /productName/);
  assert.match(phone, /added on PC/);
});

test("POS scanner methods use clear real tabs", () => {
  assert.match(pos, /role="tablist"/);
  assert.match(pos, /Barcode Scanner/);
  assert.match(pos, /This Device Camera/);
  assert.match(pos, /Use Phone/);
  assert.match(pos, /pos-scanner-tabs/);
});

test("USB and same-device mobile camera scanner remain preserved", () => {
  assert.match(pos, /useScanner/);
  assert.match(pos, /lastScan/);
  assert.match(pos, /MobileBarcodeScanner/);
  assert.match(mobileScanner, /BarcodeDetector/);
  assert.match(mobileScanner, /BrowserMultiFormatReader/);
  assert.match(mobileScanner, /facingMode:\s*\{\s*ideal:\s*"environment"/);
});

test("scanner dark mode and module tabs are readable", () => {
  assert.match(css, /V5_16_PHONE_SCANNER_REPAIR_20260908/);
  assert.match(css, /html\[data-theme="dark"\] \.pos-scanner-tab/);
  assert.match(css, /html\[data-theme="dark"\] \.mobile-barcode-modal/);
  assert.match(masterCss, /V5_16_DARK_MODULE_TAB_READABILITY_20260908/);
  assert.match(masterCss, /html\[data-theme="dark"\] \.module-tab\.active/);
});

test("image documentation contract tolerates line breaks", () => {
  assert.match(imageFeature, /Add Product/);
  assert.match(imageFeature, /auto-load/i);
  assert.match(imageFeature, /same[\s\S]*Products page/i);
  assert.match(imageFeature, /No new paid service/i);
});

test("phone documentation records HashRouter repair and retest requirement", () => {
  assert.match(phoneFeature, /HashRouter/);
  assert.match(phoneFeature, /#\/phone-scanner/);
  assert.match(phoneFeature, /human retest is required/i);
});

test("continuity document carries current parent and combined repair", () => {
  assert.match(current, /d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef/);
  assert.match(current, /V5_16/);
  assert.match(current, /HashRouter/);
  assert.match(current, /Product Image/);
  assert.match(current, /Remaining manual UAT/);
});
