import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  applyOcrLearningRules,
  normalizeOcrEvidenceText,
} from "../src/lib/ocrLearningRules.js";
import {
  inferInvoiceSizeResolution,
} from "../src/lib/invoicePack.js";
import {
  normalizeBeerOcrText,
} from "../src/lib/productInference.js";
import {
  duplicateLineSignature,
  purchaseIdentityIssues,
  purchaseLineStatus,
} from "../src/lib/purchaseIdentity.js";

const read=(p)=>fs.readFileSync(p,"utf8");

test("central OCR rules learn numeric MI/M1 as ml without a global MI replacement",()=>{
  assert.equal(normalizeOcrEvidenceText("Bottle 500 MI"),"Bottle 500 ml");
  assert.equal(normalizeOcrEvidenceText("Bottle 330 M1"),"Bottle 330 ml");
  assert.equal(normalizeOcrEvidenceText("MI Premium Brand"),"MI Premium Brand");
  const result=applyOcrLearningRules("500 MI");
  assert.ok(result.appliedRuleIds.includes("SIZE_MI_TO_ML"));
});

test("learned explicit 500 MI wins before pack-24 heuristic",()=>{
  const result=inferInvoiceSizeResolution(
    {description:"Premium Beer Bottle 500 MI",unitsPerCaseHint:24},
    24,
  );
  assert.equal(result.value,500);
  assert.equal(result.source,"EXPLICIT_OCR_SIZE");
  assert.equal(result.reviewRequired,false);
});

test("product OCR normalization applies learned product corrections",()=>{
  const text=normalizeBeerOcrText("Cartsberg Elephant Strong 500 MI Lagar");
  assert.match(text,/Carlsberg/);
  assert.match(text,/500 ml/);
  assert.match(text,/Lager/);
});

test("existing 330 ml Product Master remains blocked against learned 500 ml invoice evidence",()=>{
  const row={
    productId:"existing-330",
    sourceDescription:"Hoegaarden Belgian Witbier",
    invoiceSizeMl:500,
    sizeMl:330,
    caseCount:1,
    unitsPerCase:24,
    looseBottles:0,
    quantity:24,
    purchasePrice:100,
    mrp:250,
    packResolution:{state:"CONFIRMED_AS_POSTED"},
    sourceItem:{packing:"500 MI"},
  };
  const product={
    id:"existing-330",
    name:"Hoegaarden Belgian Witbier - 330 ml",
    brand:"Hoegaarden",
    sizeMl:330,
    barcode:"",
    mrp:180,
  };
  const issues=purchaseIdentityIssues(row,product);
  assert.ok(issues.some((x)=>/Size mismatch: invoice 500 ml .* Product Master 330 ml/.test(x)));
  assert.equal(purchaseLineStatus(row,product),"NEEDS_REVIEW");
});

test("prepared product can satisfy purchase identity without existing product id",()=>{
  const row={
    lineKey:"pending-1",
    sourceDescription:"Carlsberg Elephant Strong Beer 500 ml",
    productId:"",
    pendingProduct:{
      productName:"Carlsberg Elephant Strong Beer",
      brand:"Carlsberg",
      sizeMl:500,
      barcode:"8901234567890",
      unitsPerCase:24,
      mrp:190,
    },
    invoiceSizeMl:500,
    scannedBarcode:"8901234567890",
    caseCount:1,
    unitsPerCase:24,
    looseBottles:0,
    quantity:24,
    purchasePrice:100,
    mrp:190,
    ratePerCase:2400,
    lineAmount:2400,
    packResolution:{state:"CONFIRMED_AS_POSTED"},
    sourceItem:{packing:"500 ml bottle"},
  };
  const synthetic={
    name:row.pendingProduct.productName,
    brand:row.pendingProduct.brand,
    sizeMl:500,
    barcode:row.pendingProduct.barcode,
    unitsPerCase:24,
    mrp:190,
  };
  assert.equal(purchaseLineStatus(row,synthetic),"READY");
  assert.ok(duplicateLineSignature(row).startsWith("pending:"));
});

test("Purchase Receiving has no pre-receive Product Master write",()=>{
  const s=read("src/pages/Purchases.jsx");
  assert.match(s,/pendingProduct/);
  assert.match(s,/prepareProduct/);
  assert.match(s,/PENDING_ASSIGN_ON_RECEIVE/);
  assert.match(s,/created only on successful receive/i);
  assert.doesNotMatch(s,/bulk_create_products/);
  assert.doesNotMatch(s,/updateProduct\(p\.id/);
});

test("OCR review defers unmatched Product creation to receiving",()=>{
  const s=read("src/pages/AutomationHub.jsx");
  assert.match(s,/Prepare New Product in Receiving/);
  assert.match(s,/Product Master changes happen only if Receive Stock succeeds/);
  assert.doesNotMatch(s,/navigate\(`\/products\/new\?/);
  assert.doesNotMatch(s,/createProductFromCandidate/);
  assert.doesNotMatch(s,/ProductEnrichmentPanel/);
});

test("ShopContext uses atomic receive_purchase_v3 and carries pending product",()=>{
  const s=read("src/context/ShopContext.jsx");
  assert.match(s,/receive_purchase_v3/);
  assert.match(s,/pending_product/);
  assert.match(s,/p_supplier_name/);
  assert.doesNotMatch(s,/ensureSupplier\(supplierName\)/);
});

test("database RPC contains product/barcode/purchase/inventory atomic boundary",()=>{
  const s=read("supabase/migrations/20260909123000_v5_atomic_purchase_product_ocr_learning.sql");
  for(const pattern of [
    /create or replace function public\.receive_purchase_v3/,
    /insert into public\.products/,
    /update public\.products/,
    /insert into public\.suppliers/,
    /insert into public\.purchases/,
    /insert into public\.purchase_items/,
    /update public\.inventory/,
    /insert into public\.stock_movements/,
    /finalize_purchase_landed_cost/,
    /product_creation_atomic_with_purchase/,
    /Product identity size mismatch/,
    /Product identity barcode mismatch/,
  ]) assert.match(s,pattern);
});
