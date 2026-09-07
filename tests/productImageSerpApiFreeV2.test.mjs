import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge = fs.readFileSync(
  "supabase/functions/product-enrichment/index.ts",
  "utf8",
);

function block(startText, endText) {
  const start = edge.indexOf(startText);
  const end = edge.indexOf(endText, start);
  assert.ok(start >= 0, `missing ${startText}`);
  assert.ok(end > start, `missing ${endText}`);
  return edge.slice(start, end);
}

test("image identity reuses aliases and same-shop family evidence", () => {
  const x = block(
    "async function buildSerpImageIdentity",
    "async function serpApiFreeAccount",
  );

  assert.match(x, /\.from\("product_aliases"\)/);
  assert.match(x, /\.from\("products"\)/);
  assert.match(x, /currentDistinctive/);
  assert.match(x, /brandEvidence/);
  assert.doesNotMatch(x, /\bbarcode\b/);
});

test("SerpApi runtime is free-only by default", () => {
  const x = block(
    "async function serpApiFreeAccount",
    "async function serpApiGoogleImages",
  );

  assert.match(x, /plan_monthly_price/);
  assert.match(x, /SERPAPI_ALLOW_PAID/);
  assert.match(x, /price > 0 && !allowPaid/);
  assert.match(x, /No paid search was attempted/);
});

test("Google Images provider uses at most two searches per product", () => {
  const x = block(
    "async function searchSerpImagesFree",
    "async function autoFindAndAttachImage",
  );

  assert.match(x, /identity\.queries\.slice\(0, 2\)/);
  assert.match(x, /serpApiGoogleImages/);
  assert.match(x, /useful\.length >= 4/);
});

test("AUTO_IMAGE bypasses generic enrichment negative cache", () => {
  const x = block(
    "async function autoFindAndAttachImage",
    "async function finalizeSelection",
  );

  assert.match(x, /searchSerpImagesFree/);
  assert.doesNotMatch(x, /await discovery\(/);
  assert.match(x, /generic_discovery_cache_used: false/);
});

test("multiple returned image URLs can be safely retried", () => {
  const x = block(
    "async function autoFindAndAttachImage",
    "async function finalizeSelection",
  );

  assert.match(x, /provider\.candidates\.slice\(0, 8\)/);
  assert.match(x, /downloadSafeImage/);
  assert.match(x, /downloadFailures/);
});

test("image flow does not mutate barcode or Product Master identity", () => {
  const x = block(
    "async function autoFindAndAttachImage",
    "async function finalizeSelection",
  );

  assert.match(x, /set_product_image/);
  assert.match(x, /barcodeUnchanged: true/);
  assert.match(x, /product_identity_changed: false/);
  assert.doesNotMatch(x, /update_product_details/);
  assert.doesNotMatch(x, /create_new_product/);
  assert.doesNotMatch(x, /receive_purchase/);
});
