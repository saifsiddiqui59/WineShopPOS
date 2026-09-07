import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge = fs.readFileSync(
  "supabase/functions/product-enrichment/index.ts",
  "utf8",
);
const client = fs.readFileSync(
  "src/lib/productEnrichmentClient.js",
  "utf8",
);
const products = fs.readFileSync(
  "src/pages/Products.jsx",
  "utf8",
);
const form = fs.readFileSync(
  "src/components/ProductForm.jsx",
  "utf8",
);
const panel = fs.readFileSync(
  "src/components/ProductEnrichmentPanel.jsx",
  "utf8",
);

test("AUTO_IMAGE exists and is image-only", () => {
  assert.match(edge, /action === "AUTO_IMAGE"/);
  const start = edge.indexOf("async function autoFindAndAttachImage(");
  const end = edge.indexOf("async function finalizeSelection(", start);
  assert.ok(start >= 0 && end > start);

  const block = edge.slice(start, end);
  assert.match(block, /barcodeBefore/);
  assert.match(block, /barcodeUnchanged: true/);
  assert.match(block, /set_product_image/);
  assert.doesNotMatch(block, /update_product_details/);
  assert.doesNotMatch(block, /create_new_product/);
  assert.doesNotMatch(block, /p_barcode/);
  assert.doesNotMatch(block, /receive_purchase/);
  assert.doesNotMatch(block, /complete_sale/);
});

test("browser AUTO_IMAGE request sends product identity reference, not barcode", () => {
  const start = client.indexOf("export function autoFindProductImage");
  assert.ok(start >= 0);
  const block = client.slice(start);
  assert.match(block, /shopId/);
  assert.match(block, /productId/);
  assert.match(block, /action: "AUTO_IMAGE"/);
  assert.doesNotMatch(block, /\bbarcode\b/);
});

test("Product Master missing image icon triggers auto image and promises barcode safety", () => {
  assert.match(products, /autoFindProductImage/);
  assert.match(products, /Barcode will not change/);
  assert.match(products, /barcodeUnchanged !== true/);
});

test("Edit Product image action is separate from barcode verification", () => {
  assert.match(form, /Find Image Online/);
  assert.match(form, /It never changes the barcode/);
  assert.match(panel, /Image is handled separately/);
  assert.match(panel, /importImage: false/);
  assert.doesNotMatch(panel, /setImportImage/);
});
