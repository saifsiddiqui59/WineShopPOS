import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge=fs.readFileSync("supabase/functions/product-enrichment/index.ts","utf8");
const client=fs.readFileSync("src/lib/productEnrichmentClient.js","utf8");
const add=fs.readFileSync("src/pages/AddProduct.jsx","utf8");

function between(source,startText,endText){
  const start=source.indexOf(startText),end=source.indexOf(endText,start);
  assert.ok(start>=0,`missing ${startText}`);assert.ok(end>start,`missing ${endText}`);
  return source.slice(start,end);
}

test("AUTO_IMAGE remains image-only",()=>{
  const block=between(edge,"async function autoFindAndAttachImage(","async function finalizeSelection(");
  assert.match(block,/set_product_image/);
  assert.match(block,/barcodeUnchanged: true/);
  assert.match(block,/product_identity_changed: false/);
  assert.doesNotMatch(block,/update_product_details|create_new_product|receive_purchase|complete_sale/);
});

test("pre-save image search never sends barcode",()=>{
  const start=client.indexOf("export function getPreSaveProductImageChoices");
  const end=client.indexOf("export function applyPreSaveProductImageChoice",start);
  const block=client.slice(start,end);
  assert.match(block,/PRE_SAVE_IMAGE_CHOICES/);
  assert.match(block,/query/);
  assert.match(block,/brand/);
  assert.match(block,/sizeMl/);
  assert.doesNotMatch(block,/\bbarcode\b/);
});

test("exact pre-save choice is applied before fallback auto image",()=>{
  const applyAt=add.indexOf("applyPreSaveProductImageChoice");
  const fallbackAt=add.indexOf("autoFindProductImage",applyAt+1);
  assert.ok(applyAt>=0&&fallbackAt>applyAt);
  assert.match(add,/No different automatic image was substituted/);
  assert.match(add,/productIdentityUnchanged/);
});
