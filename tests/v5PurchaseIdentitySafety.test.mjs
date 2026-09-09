import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  duplicateLineSignature,
  findSuspiciousDuplicateGroups,
  purchaseIdentityIssues,
  purchaseLineReviewReasons,
  purchaseLineStatus,
} from "../src/lib/purchaseIdentity.js";

const purchases=fs.readFileSync("src/pages/Purchases.jsx","utf8");
const context=fs.readFileSync("src/context/ShopContext.jsx","utf8");
const migration=fs.readFileSync(
  "supabase/migrations/20260909110000_v5_purchase_identity_and_legitimate_repeat_lines.sql",
  "utf8",
);

function baseRow(overrides={}){
  return {
    productId:"p-hoegaarden-330",
    sourceDescription:"HOEGAARDEN BELGIAN WITBIER",
    invoiceSizeMl:330,
    sizeMl:330,
    caseCount:1,
    unitsPerCase:24,
    looseBottles:0,
    quantity:24,
    ratePerCase:3989.39,
    purchasePrice:166.224583,
    mrp:180,
    lineAmount:3989,
    scannedBarcode:"8907001000133",
    batchNumber:"",
    expiryDate:"",
    packResolution:{state:"CONFIRMED_AS_POSTED"},
    sourceItem:{packing:"330 ML"},
    ...overrides,
  };
}

const hoegaarden330={
  id:"p-hoegaarden-330",
  name:"Hoegaarden Belgian Witbier - 330 ml",
  brand:"Hoegaarden",
  sizeMl:330,
  barcode:"8907001000133",
  mrp:180,
};

test("real-invoice 500 ml line cannot become READY against 330 ml Product Master",()=>{
  const row=baseRow({
    sourceDescription:"HOEGAARDEN BELGIAN WITBIER",
    invoiceSizeMl:500,
    sizeMl:330,
  });
  const issues=purchaseIdentityIssues(row,hoegaarden330);
  assert.ok(issues.some((x)=>/Size mismatch: invoice 500 ml .* Product Master 330 ml/.test(x)));
  assert.equal(purchaseLineStatus(row,hoegaarden330),"NEEDS_REVIEW");
});

test("known physical barcode mismatch is a hard identity review",()=>{
  const row=baseRow({scannedBarcode:"8907001999999"});
  assert.ok(
    purchaseIdentityIssues(row,hoegaarden330)
      .some((x)=>/Barcode mismatch/.test(x)),
  );
  assert.equal(purchaseLineStatus(row,hoegaarden330),"NEEDS_REVIEW");
});

test("same Product Master at different MRP/rate/amount is a legitimate repeated commercial line",()=>{
  const a=baseRow({
    productId:"p-bud",
    sourceDescription:"BUDWEISER BEER",
    invoiceSizeMl:650,
    mrp:245,
    ratePerCase:2715,
    lineAmount:27150,
    caseCount:10,
    unitsPerCase:12,
    quantity:120,
  });
  const b=baseRow({
    productId:"p-bud",
    sourceDescription:"BUDWEISER BEER",
    invoiceSizeMl:650,
    mrp:170,
    ratePerCase:3767.76,
    lineAmount:3768,
    caseCount:1,
    unitsPerCase:24,
    quantity:24,
  });

  assert.notEqual(duplicateLineSignature(a),duplicateLineSignature(b));
  assert.deepEqual(findSuspiciousDuplicateGroups([a,b]),[]);
});

test("identical-looking repeated invoice rows require explicit Keep Separate review",()=>{
  const a=baseRow();
  const b=baseRow();
  const groups=findSuspiciousDuplicateGroups([a,b]);
  assert.equal(groups.length,1);
  assert.deepEqual(groups[0].indexes,[0,1]);

  const pending=purchaseLineReviewReasons(a,hoegaarden330,{duplicatePending:true});
  assert.ok(pending.some((x)=>/Possible duplicate invoice row/.test(x)));

  assert.equal(
    purchaseLineStatus(a,hoegaarden330,{duplicatePending:true}),
    "NEEDS_REVIEW",
  );
  assert.equal(
    purchaseLineStatus(
      {...a,duplicateResolution:"KEEP_SEPARATE"},
      hoegaarden330,
      {duplicatePending:false},
    ),
    "READY",
  );
});

test("package mismatch blocks only when both sides explicitly disagree",()=>{
  const product={...hoegaarden330,name:"Hoegaarden Belgian Witbier Bottle - 330 ml"};
  const row=baseRow({sourceDescription:"HOEGAARDEN BELGIAN WITBIER CAN"});
  assert.ok(
    purchaseIdentityIssues(row,product)
      .some((x)=>/Package mismatch/.test(x)),
  );
});

test("Purchase Receiving preserves invoice evidence and explains blockers",()=>{
  assert.match(purchases,/invoiceSizeMl/);
  assert.match(purchases,/findSuspiciousDuplicateGroups/);
  assert.match(purchases,/Keep Separate/);
  assert.match(purchases,/Receive Stock Blocked/);
  assert.match(purchases,/Product Master was NOT changed/);
  assert.doesNotMatch(purchases,/duplicates=new Set\(/);
});

test("ShopContext no longer rejects every repeated Product Master but repeats identity defense",()=>{
  assert.match(context,/purchaseIdentityIssues\(row,product\)/);
  assert.doesNotMatch(context,/new Set\(ids\)\.size!==ids\.length/);
  assert.match(context,/invoice_size_ml/);
  assert.match(context,/scanned_barcode/);
});

test("database V2 receive processes lines individually and has hard server identity guards",()=>{
  assert.match(migration,/for v_item in[\s\S]*jsonb_array_elements\(p_items\)/);
  assert.match(migration,/Product identity size mismatch/);
  assert.match(migration,/Product identity barcode mismatch/);
  assert.match(migration,/insert into public\.purchase_items/);
  assert.match(migration,/batch_number,expiry_date/);
  assert.doesNotMatch(migration,/Combine duplicate product lines before receiving/);
});
