import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const edge=fs.readFileSync("supabase/functions/product-enrichment/index.ts","utf8");
const form=fs.readFileSync("src/components/ProductForm.jsx","utf8");
const css=fs.readFileSync("src/index.css","utf8");

test("image chooser remains 20 per page",()=>{
  assert.match(form,/imageChoicePageSize = 20/);
  assert.match(form,/Refresh \/ Next 20/);
});
test("India and Global scopes remain",()=>{
  assert.match(form,/switchImageChoiceScope\("INDIA"\)/);
  assert.match(form,/switchImageChoiceScope\("GLOBAL"\)/);
  assert.ok(edge.includes('url.searchParams.set("gl", "in")'));
  assert.ok(edge.includes('url.searchParams.set("google_domain", "google.co.in")'));
  assert.ok(edge.includes('url.searchParams.set("google_domain", "google.com")'));
});
test("chooser remains scrollable",()=>{
  assert.match(css,/product-image-chooser-scroll/);
  assert.match(css,/overflow-y:auto/);
});
