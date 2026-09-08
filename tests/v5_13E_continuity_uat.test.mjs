import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  inferInvoiceSizeMl,
  inferInvoiceSizeResolution,
} from "../src/lib/invoicePack.js";

const form = fs.readFileSync("src/components/ProductForm.jsx", "utf8");
const panel = fs.readFileSync("src/components/ProductEnrichmentPanel.jsx", "utf8");
const preview = fs.readFileSync("src/components/OcrProductImagePreview.jsx", "utf8");
const add = fs.readFileSync("src/pages/AddProduct.jsx", "utf8");
const automation = fs.readFileSync("src/pages/AutomationHub.jsx", "utf8");
const purchases = fs.readFileSync("src/pages/Purchases.jsx", "utf8");
const pos = fs.readFileSync("src/pages/POS.jsx", "utf8");
const css = fs.readFileSync("src/index.css", "utf8");
const currentState = fs.readFileSync("docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md", "utf8");

test("subcategory no longer uses the crashing datalist path", () => {
  assert.doesNotMatch(form, /product-subcategory-options/);
  assert.match(form, /Other \/ Custom/);
  assert.match(form, /subcategorySelectValue/);
  assert.match(form, /String\(form\.subcategory \|\| ""\)/);
});

test("Product Image can be selected in the new-product flow", () => {
  assert.match(form, /Find Product Image/);
  assert.match(form, /importCandidateImage/);
  assert.match(panel, /importCandidateImage/);
  assert.match(panel, /Use This Product \+ Image/);
  assert.match(add, /autoFindProductImage/);
});

test("OCR image wording uses Product Image language", () => {
  assert.match(preview, /Product Image suggestion/);
  assert.match(preview, /Product Image not selected yet/);
  assert.doesNotMatch(preview, /No candidate image/);
});

test("explicit invoice size always wins", () => {
  assert.equal(
    inferInvoiceSizeMl(
      { description: "Example CAN 650 ml", unitsPerCaseHint: 24 },
      24,
    ),
    650,
  );
  assert.equal(
    inferInvoiceSizeResolution({ description: "Example 50 cl CAN" }, 24).source,
    "EXPLICIT_OCR_SIZE",
  );
});

test("shop size rules apply only when explicit size is absent", () => {
  assert.equal(inferInvoiceSizeMl({ description: "Example Beer CAN" }, 24), 500);
  assert.equal(inferInvoiceSizeMl({ description: "Example Beer" }, 24), 330);
  assert.equal(inferInvoiceSizeMl({ description: "Example Beer" }, 12), 650);
  assert.equal(inferInvoiceSizeMl({ description: "Example Beer" }, 6), 0);
});

test("pack price warning moved to Bottles Case and auto suggestion is reviewable", () => {
  assert.match(automation, /PRICE_MRP_AUTO_SUGGESTED/);
  assert.match(automation, /ocr-pack-auto-warning/);
  assert.match(automation, /Auto-suggested/);
  assert.match(automation, /HUMAN_REVIEW/);
  assert.doesNotMatch(automation, /className="ocr-price-impossible"/);
  assert.match(css, /ocr-pack-auto-warning/);
});

test("purchase receiving shares the size and pack suggestion rules", () => {
  assert.match(purchases, /inferInvoiceSizeMl/);
  assert.match(purchases, /PRICE_MRP_AUTO_SUGGESTED/);
  assert.match(purchases, /Auto-suggested/);
});

test("POS has collapsible mobile scanner while physical scanner remains", () => {
  assert.match(pos, /MobileBarcodeScanner/);
  assert.match(pos, /Mobile Barcode Scanner/);
  assert.match(pos, /Scan Product for Billing/);
  assert.match(pos, /Physical USB\/keyboard barcode scanners continue/);
  assert.match(pos, /useScanner/);
  assert.match(pos, /lastScan/);
  assert.match(pos, /processBarcode/);
});

test("continuity doc is sufficient for a new chat", () => {
  assert.match(currentState, /START HERE IN A NEW CHAT/);
  assert.match(currentState, /59a800d043050e8566adb7a38377c537e221bd7f/);
  assert.match(currentState, /juhcypzoacauzmtzqnwd/);
  assert.match(currentState, /RELEASE_EXECUTOR_FAILURE_REGISTER/);
  assert.match(currentState, /Remaining manual UAT/);
  assert.match(currentState, /No paid provider|No paid/);
});
