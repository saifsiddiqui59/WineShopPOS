import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluatePurchasePackResolution } from "../src/lib/packVerification.js";

const pending = ({name,size,barcode,cases,upc,amount}) => ({
  productId:"",
  pendingProduct:{productName:name,sizeMl:size,barcode,unitsPerCase:upc},
  productName:name,
  sizeMl:size,
  scannedBarcode:barcode,
  caseCount:cases,
  unitsPerCase:upc,
  looseBottles:0,
  quantity:cases*upc,
  lineAmount:amount,
  purchasePrice:amount/(cases*upc),
  packResolution:{state:"CONFIRMED_AS_POSTED"}
});
const posted = ({id,productId,cases,upc,amount}) => ({
  id,
  product_id:productId,
  case_count:cases,
  units_per_case:upc,
  loose_bottles:0,
  quantity:cases*upc,
  line_total:amount,
  purchase_price:amount/(cases*upc)
});

test("atomic pending products stay verified after Product Master IDs are created", () => {
  const drafts=[
    pending({name:"Budweiser Magnum Strong Beer",size:650,barcode:"2900000000018",cases:10,upc:12,amount:28812}),
    pending({name:"Corona Extra Premium Beer",size:500,barcode:"2900000000100",cases:1,upc:24,amount:5541})
  ];
  const items=[
    posted({id:"pi1",productId:"p1",cases:10,upc:12,amount:28812}),
    posted({id:"pi2",productId:"p2",cases:1,upc:24,amount:5541})
  ];
  const r=evaluatePurchasePackResolution({
    purchaseItems:items,
    reviewDraft:{purchaseDraft:{items:drafts}},
    ocrUnitMatch:false,
    productById:{
      p1:{name:"Budweiser Magnum Strong Beer",sizeMl:650,barcode:"2900000000018"},
      p2:{name:"Corona Extra Premium Beer",sizeMl:500,barcode:"2900000000100"}
    }
  });
  assert.equal(r.resolved,true);
  assert.equal(r.mode,"VERIFIED_DURING_RECEIVING");
  assert.equal(r.receivingVerifiedCount,2);
});

test("changed posted pack remains unresolved", () => {
  const d=pending({name:"Corona Extra Premium Beer",size:500,barcode:"2900000000100",cases:1,upc:24,amount:5541});
  const i=posted({id:"pi1",productId:"p1",cases:1,upc:12,amount:5541});
  const r=evaluatePurchasePackResolution({
    purchaseItems:[i],
    reviewDraft:{purchaseDraft:{items:[d]}},
    productById:{p1:{name:"Corona Extra Premium Beer",sizeMl:500,barcode:"2900000000100"}}
  });
  assert.equal(r.resolved,false);
});

test("different created Product Master identity remains unresolved", () => {
  const d=pending({name:"Corona Extra Premium Beer",size:500,barcode:"2900000000100",cases:1,upc:24,amount:5541});
  const i=posted({id:"pi1",productId:"p1",cases:1,upc:24,amount:5541});
  const r=evaluatePurchasePackResolution({
    purchaseItems:[i],
    reviewDraft:{purchaseDraft:{items:[d]}},
    productById:{p1:{name:"Hoegaarden Belgian Witbier",sizeMl:500,barcode:"2900000000999"}}
  });
  assert.equal(r.resolved,false);
});

test("repeated identical pending rows are consumed one-for-one", () => {
  const d=()=>pending({name:"Example Beer",size:500,barcode:"",cases:1,upc:24,amount:2400});
  const i1=posted({id:"pi1",productId:"p1",cases:1,upc:24,amount:2400});
  const i2=posted({id:"pi2",productId:"p2",cases:1,upc:24,amount:2400});
  const r=evaluatePurchasePackResolution({
    purchaseItems:[i1,i2],
    reviewDraft:{purchaseDraft:{items:[d(),d()]}},
    productById:{
      p1:{name:"Example Beer",sizeMl:500,barcode:""},
      p2:{name:"Example Beer",sizeMl:500,barcode:""}
    }
  });
  assert.equal(r.resolved,true);
  assert.equal(r.receivingVerifiedCount,2);
});

test("correction on one repeated Product Master line does not resolve its sibling", () => {
  const item1=posted({id:"pi1",productId:"same",cases:1,upc:24,amount:2400});
  const item2=posted({id:"pi2",productId:"same",cases:1,upc:24,amount:2500});
  const unresolved=(amount)=>({
    productId:"same",caseCount:1,unitsPerCase:24,looseBottles:0,quantity:24,
    lineAmount:amount,purchasePrice:amount/24,packResolution:{state:"NEEDS_REVIEW"}
  });
  const r=evaluatePurchasePackResolution({
    purchaseItems:[item1,item2],
    reviewDraft:{purchaseDraft:{items:[unresolved(2400),unresolved(2500)]}},
    corrections:[{
      purchase_item_id:"pi1",product_id:"same",quantity_delta:24,
      old_values:{units_per_case:12},new_values:{units_per_case:24}
    }]
  });
  assert.equal(r.correctedCount,1);
  assert.equal(r.resolved,false);
  assert.deepEqual(r.unresolvedPurchaseItemIds,["pi2"]);
});

test("normal completed UX hides correction tables but preserves explicit audit access", () => {
  const details=readFileSync(new URL("../src/pages/PurchaseDetails.jsx",import.meta.url),"utf8");
  const engine=readFileSync(new URL("../src/components/PurchaseVerificationEngine.jsx",import.meta.url),"utf8");
  const purchases=readFileSync(new URL("../src/pages/Purchases.jsx",import.meta.url),"utf8");
  assert.match(details,/Open Audit \/ Correction Tools/);
  assert.match(details,/\(!packResolved \|\| showAuditTools\)/);
  assert.match(engine,/openAuditTools/);
  assert.match(purchases,/function stagePendingProduct/);
  assert.match(purchases,/>Edit New Product Details<\/button>/);
  assert.doesNotMatch(purchases,/>Prepare Product<\/button>/);
});

test("V5_26 does not introduce an unrelated generic 500 ml beer -> 24 pack rule", () => {
  const purchases=readFileSync(new URL("../src/pages/Purchases.jsx",import.meta.url),"utf8");
  assert.doesNotMatch(purchases,/500\s*ml.*24.*case/i);
});
