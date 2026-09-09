import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge=fs.readFileSync("supabase/functions/product-enrichment/index.ts","utf8");

function block(startText,endText){
  const start=edge.indexOf(startText),end=edge.indexOf(endText,start);
  assert.ok(start>=0,`missing ${startText}`);assert.ok(end>start,`missing ${endText}`);
  return edge.slice(start,end);
}

test("SerpApi remains free-only by default",()=>{
  const x=block("async function serpApiFreeAccount","async function serpApiGoogleImages");
  assert.match(x,/plan_monthly_price/);
  assert.match(x,/SERPAPI_ALLOW_PAID/);
  assert.match(x,/price > 0 && !allowPaid/);
  assert.match(x,/No paid search was attempted/);
});

test("internet image provider remains capped at two searches",()=>{
  const x=block("async function searchSerpImagesFree","function buildPreSaveImageIdentity");
  assert.match(x,/identity\.queries\.slice\(0, 2\)/);
  assert.match(x,/useful\.length >= 4/);
});

test("pre-save choices use same free internet image provider and no barcode key",()=>{
  const x=block("function buildPreSaveImageIdentity","async function imageChoiceCacheKeyFor");
  assert.match(x,/searchSerpImagesFree/);
  assert.match(x,/query_barcode: null/);
  assert.match(x,/PRE_SAVE_IMAGE_CHOICES/);
  assert.doesNotMatch(x,/p_barcode|update_product_details|create_new_product/);
});
