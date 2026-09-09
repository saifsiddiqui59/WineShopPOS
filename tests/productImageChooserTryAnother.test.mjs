import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const edge=fs.readFileSync("supabase/functions/product-enrichment/index.ts","utf8");
const client=fs.readFileSync("src/lib/productEnrichmentClient.js","utf8");
const form=fs.readFileSync("src/components/ProductForm.jsx","utf8");

test("saved Product Master chooser actions remain",()=>{
  for(const marker of['action === "IMAGE_CHOICES"','action === "APPLY_IMAGE_CHOICE"','action === "TRY_ANOTHER_IMAGE"']) assert.ok(edge.includes(marker),marker);
  assert.match(client,/getProductImageChoices/);
  assert.match(client,/applyProductImageChoice/);
});

test("new Product pre-save chooser actions exist",()=>{
  assert.ok(edge.includes('action === "PRE_SAVE_IMAGE_CHOICES"'));
  assert.ok(edge.includes('action === "APPLY_PRE_SAVE_IMAGE_CHOICE"'));
  assert.match(client,/getPreSaveProductImageChoices/);
  assert.match(client,/applyPreSaveProductImageChoice/);
});

test("ProductForm chooser works before and after save",()=>{
  assert.match(form,/initialValue\?\.id/);
  assert.match(form,/getPreSaveProductImageChoices/);
  assert.match(form,/getProductImageChoices/);
  assert.match(form,/Try Another Image/);
  assert.match(form,/Find Product Images/);
  assert.match(form,/Choose Product Image/);
  assert.match(form,/Use this image/);
});
