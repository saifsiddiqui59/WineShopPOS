import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge = fs.readFileSync("supabase/functions/product-enrichment/index.ts", "utf8");
const client = fs.readFileSync("src/lib/productEnrichmentClient.js", "utf8");
const form = fs.readFileSync("src/components/ProductForm.jsx", "utf8");
const css = fs.readFileSync("src/index.css", "utf8");

function block(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);
  assert.ok(start >= 0, `missing ${startText}`);
  assert.ok(end > start, `missing ${endText}`);
  return source.slice(start, end);
}

test("server exposes chooser, apply and try-another actions", () => {
  assert.match(edge, /action === "IMAGE_CHOICES"/);
  assert.match(edge, /action === "APPLY_IMAGE_CHOICE"/);
  assert.match(edge, /action === "TRY_ANOTHER_IMAGE"/);
});

test("image choices use positive cache and short empty cache", () => {
  const x = block(
    edge,
    "async function storeImageChoiceCache",
    "function publicImageChoice",
  );

  assert.match(x, /24 \* 60 \* 60 \* 1000/);
  assert.match(x, /30 \* 60 \* 1000/);
  assert.match(x, /SERPAPI_GOOGLE_IMAGES/);
});

test("choice cache identity does not use barcode", () => {
  const x = block(
    edge,
    "async function imageChoiceCacheKeyFor",
    "async function imageCandidateHistory",
  );

  assert.doesNotMatch(x, /\bbarcode\b/);
});

test("try another skips current and previously used candidates first", () => {
  const x = block(
    edge,
    "async function tryAnotherProductImage",
    "async function autoFindAndAttachImage",
  );

  assert.match(x, /!choice\.isCurrent && !choice\.wasUsed/);
  assert.match(x, /!choice\.isCurrent/);
});

test("chosen image mutation is image-only and identity is verified", () => {
  const x = block(
    edge,
    "async function applyCachedImageChoice",
    "async function tryAnotherProductImage",
  );

  assert.match(x, /set_product_image/);
  assert.match(x, /barcode_changed: false/);
  assert.match(x, /product_identity_changed: false/);
  assert.doesNotMatch(x, /update_product_details/);
  assert.doesNotMatch(x, /create_new_product/);
  assert.doesNotMatch(x, /receive_purchase/);
});

test("browser client has all image choice actions", () => {
  assert.match(client, /getProductImageChoices/);
  assert.match(client, /applyProductImageChoice/);
  assert.match(client, /tryAnotherProductImage/);
});

test("Edit Product has Try Another and thumbnail chooser popup", () => {
  assert.match(form, /Try Another Image/);
  assert.match(form, /Choose Image/);
  assert.match(form, /Choose Product Image/);
  assert.match(form, /product-image-choice-grid/);
  assert.match(form, /Previously used/);
  assert.match(form, /Use this image/);
});

test("chooser CSS is present and responsive", () => {
  assert.match(css, /V5_PRODUCT_IMAGE_CHOOSER_TRY_ANOTHER_20260907/);
  assert.match(css, /\.product-image-chooser-backdrop/);
  assert.match(css, /\.product-image-choice-grid/);
  assert.match(css, /@media \(max-width: 540px\)/);
});
