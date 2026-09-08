import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const badge = fs.readFileSync("src/components/EnvironmentBadge.jsx", "utf8");
const automation = fs.readFileSync("src/pages/AutomationHub.jsx", "utf8");
const preview = fs.readFileSync("src/components/OcrProductImagePreview.jsx", "utf8");
const form = fs.readFileSync("src/components/ProductForm.jsx", "utf8");
const css = fs.readFileSync("src/index.css", "utf8");

test("V5 preview badge survives missing env label", () => {
  assert.match(badge, /wspv5qa3a5e8018/);
  assert.match(badge, /QA \/ DEV/);
  assert.match(badge, /NOT PROD/);
});

test("OCR non-2xx detail and safe retry", () => {
  assert.match(automation, /edgeFunctionErrorDetails/);
  assert.match(automation, /invokeOcrWithRetry/);
  assert.match(automation, /\[429,500,502,503,504\]/);
  assert.match(automation, /Original invoice is safely stored/);
});

test("OCR table has Sr No Size and columns", () => {
  assert.match(automation, />Sr No</);
  assert.match(automation, />Size \(ml\)</);
  assert.match(automation, /OCR_COLUMN_OPTIONS/);
  assert.match(automation, /ocr-column-selector/);
});

test("OCR header sticky", () => {
  assert.match(css, /ocr-review-table-shell/);
  assert.match(css, /ocr-review-table thead th/);
  assert.match(css, /position:sticky/);
});

test("suggested product name", () => {
  assert.match(automation, /suggestedProductName/);
  assert.match(automation, /Suggested Product Name/);
});

test("automatic Product Image discovery remains preview only", () => {
  assert.match(automation, /OcrProductImagePreview/);
  assert.match(preview, /discoverProducts/);
  assert.match(preview, /Product Image suggestion/);
  assert.match(preview, /Product Image not selected yet/);
  assert.doesNotMatch(preview, /applyProductImageChoice|set_product_image/);
});

test("MRP safety remains hard guard with Bottles Case guidance", () => {
  assert.match(automation, /linePriceSanity/);
  assert.match(automation, /priceSanity\.impossible/);
  assert.match(automation, /PRICE_MRP_AUTO_SUGGESTED/);
  assert.match(automation, /ocr-pack-auto-warning/);
  assert.match(automation, /Auto-suggested/);
  assert.doesNotMatch(automation, /className="ocr-price-impossible"/);
});

test("date candidate picker", () => {
  assert.match(automation, /extractDateCandidates/);
  assert.match(automation, /Detected date candidates/);
  assert.match(automation, /HUMAN_REVIEW_FROM_OCR_CANDIDATE/);
});

test("image chooser identifies product", () => {
  assert.match(form, /product-image-chooser-product-name/);
  assert.match(form, /form\.name/);
  assert.match(form, /form\.sizeMl/);
});
