import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildShopAiFieldMatrix,
  buildShopAiTargetMatrix,
  buildShopAiRequest,
  validateShopAiReview,
} from "../supabase/functions/_shared/invoiceShopAiReview.js";

function fixture(){
  const primaryInvoice={
    supplierName:"ROYAL 21",
    invoiceNumber:"19185",
    invoiceDate:"2021-07-19",
    total:70185,
    amountDue:70185,
    financialAdjustments:{printedInvoiceTotal:70185,calculatedInvoiceTotal:70185,reconciliationStatus:"MATCH"},
    items:[{description:"DR KHATA KHAT PREMIUM QUALITY FORTIFIED WINE",packing:"180 ML",batchNumber:"KK21 Aug-21136",amount:2573}],
  };
  const secondaryOcr={
    chosen:{supplierName:{value:"KAPIL ALCOTECH LLP"},invoiceDate:{value:"2020-04-19"},invoiceTotal:{value:70185}},
    itemBatches:{0:[{value:"KK21 Aug-2026",region:{page:1,xMinNorm:.62,xMaxNorm:.79,yMinNorm:.48,yMaxNorm:.53}}]},
  };
  const invoice=structuredClone(primaryInvoice);
  invoice.invoiceDateReviewRequired=true;
  invoice.items[0].batchReviewRequired=true;
  invoice.crossOcr={status:"REVIEW_REQUIRED",reviewTargets:[{targetId:"header:supplier_name"},{targetId:"header:invoice_date"},{targetId:"item:0:batch_number"}]};
  return{primaryInvoice,secondaryOcr,invoice};
}

function visual(field_id,suggested_value,confidence="HIGH",verdict="INFERRED_VISUAL"){
  return{field_id,verdict,suggested_value,confidence,reason:"Visible on original invoice."};
}

test("target selection stays narrow",()=>{
  const f=fixture(),matrix=buildShopAiFieldMatrix(f),targets=buildShopAiTargetMatrix({matrix,invoice:f.invoice});
  const ids=new Set(targets.map(x=>x.fieldId));
  assert.equal(ids.has("document:line_coverage"),true);
  assert.equal(ids.has("header:supplier_name"),true);
  assert.equal(ids.has("header:invoice_date"),true);
  assert.equal(ids.has("item:0:batch_number"),true);
  assert.equal(ids.has("item:0:description"),false);
  assert.equal(ids.has("item:0:amount"),false);
  assert.ok(targets.length<matrix.length);
});

test("prompt withholds target OCR values but keeps safe focus hints",()=>{
  const f=fixture();
  const built=buildShopAiRequest({model:"gpt-5-mini",contentBase64:"YWJj",contentType:"image/jpeg",fileName:"invoice.jpg",documentPageCount:1,...f});
  assert.equal(built.ok,true);
  const payload=JSON.parse(built.request.input[0].content[0].text),serialized=JSON.stringify(payload);
  assert.equal(payload.mode,"TARGETED_BLIND_VISUAL_ADJUDICATION_V2");
  assert.equal(payload.candidate_values_withheld,true);
  for(const value of ["ROYAL 21","KAPIL ALCOTECH LLP","2021-07-19","2020-04-19","KK21 Aug-21136","KK21 Aug-2026"])assert.equal(serialized.includes(value),false,`leaked ${value}`);
  assert.ok(payload.target_fields.find(x=>x.field_id==="header:invoice_date")?.region_hint);
  assert.ok(payload.target_fields.find(x=>x.field_id==="item:0:batch_number")?.region_hint);
});

test("finance invoice_total target maps to printed_total",()=>{
  const f=fixture();
  f.invoice.crossOcr.reviewTargets.push({targetId:"finance:invoice_total"});
  const matrix=buildShopAiFieldMatrix(f),targets=buildShopAiTargetMatrix({matrix,invoice:f.invoice});
  assert.equal(targets.some(x=>x.fieldId==="finance:printed_total"),true);
});

test("line coverage handles natural count text and provider NO_GO cannot be weakened",()=>{
  const f=fixture(),matrix=buildShopAiFieldMatrix(f),targets=buildShopAiTargetMatrix({matrix,invoice:f.invoice});
  const out=validateShopAiReview({recommendation:"NO_GO",summary:"unsafe",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1 product row"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:invoice_date","2026-09-19"),visual("item:0:batch_number","KK21 Aug-2026")]},matrix,targets);
  assert.equal(out.fields.find(x=>x.fieldId==="document:line_coverage").verdict,"MATCH");
  assert.equal(out.recommendation,"NO_GO");
});

test("missing target fails closed",()=>{
  const f=fixture(),matrix=buildShopAiFieldMatrix(f),targets=buildShopAiTargetMatrix({matrix,invoice:f.invoice});
  const out=validateShopAiReview({recommendation:"REVIEW",summary:"partial",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:invoice_date","2026-09-19")]},matrix,targets);
  assert.equal(out.fields.find(x=>x.fieldId==="item:0:batch_number").verdict,"NOT_JUDGED");
  assert.equal(out.coverageComplete,false);
  assert.equal(out.recommendation,"NO_GO");
});

test("invoice number is explicit confirmation only",()=>{
  const source=fs.readFileSync(new URL("../src/pages/AutomationHub.jsx",import.meta.url),"utf8");
  const block=source.slice(source.indexOf("function applyShopAiVisualPrefills"),source.indexOf("const MACHINE_PACK_SOURCES"));
  assert.doesNotMatch(block,/header:invoice_number/);
  assert.match(source,/shopAiInvoiceNumberSuggestion/);
  assert.match(source,/invoiceNumberSource: "HUMAN_CONFIRMED_SHOPAI_VISUAL"/);
});

test("Prepare can open and receiving can finish AI review without weakening receive gates",()=>{
  const automation=fs.readFileSync(new URL("../src/pages/AutomationHub.jsx",import.meta.url),"utf8");
  const purchases=fs.readFileSync(new URL("../src/pages/Purchases.jsx",import.meta.url),"utf8");
  const sql=fs.readFileSync(new URL("../supabase/migrations/20260920043000_v6_shopai_multimodal_judge_v1.sql",import.meta.url),"utf8");
  const send=automation.slice(automation.indexOf("async function sendDraft()"),automation.indexOf("const supplierDefaults"));
  assert.match(send,/ready: false/);
  assert.doesNotMatch(send,/shopAiOwnerReady\(\)/);
  assert.match(purchases,/function confirmShopAiReviewInReceiving/);
  assert.match(purchases,/Confirm Invoice Review/);
  assert.match(purchases,/financialReady&&shopAiReady/);
  assert.match(purchases,/disabled=\{busy\|\|!ready\}/);
  assert.match(sql,/invoice_shopai_owner_gate_ok/);
  assert.match(sql,/SHOPAI_OWNER_REVIEW_REQUIRED/);
});
