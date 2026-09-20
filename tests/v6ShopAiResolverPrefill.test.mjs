import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildShopAiFieldMatrix,
  buildShopAiTargetMatrix,
  buildShopAiRequest,
  validateShopAiReview,
  runShopAiReview,
} from "../supabase/functions/_shared/invoiceShopAiReview.js";

function sample(){
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

function targeted(){const s=sample(),matrix=buildShopAiFieldMatrix(s),targets=buildShopAiTargetMatrix({matrix,invoice:s.invoice});return{s,matrix,targets};}

test("targeted request withholds OCR field candidates",()=>{
  const s=sample();
  const built=buildShopAiRequest({model:"gpt-5-mini",contentBase64:"YWJj",contentType:"image/jpeg",fileName:"invoice.jpg",documentPageCount:1,...s});
  assert.equal(built.ok,true);
  const payload=JSON.parse(built.request.input[0].content[0].text),serialized=JSON.stringify(payload);
  assert.equal(payload.mode,"TARGETED_BLIND_VISUAL_ADJUDICATION_V2");
  assert.equal(payload.candidate_values_withheld,true);
  for(const value of ["ROYAL 21","KAPIL ALCOTECH LLP","2021-07-19","2020-04-19","KK21 Aug-21136","KK21 Aug-2026"])assert.equal(serialized.includes(value),false,`candidate leaked: ${value}`);
  assert.ok(payload.target_fields.find(x=>x.field_id==="header:invoice_date")?.region_hint);
  assert.ok(payload.target_fields.find(x=>x.field_id==="item:0:batch_number")?.region_hint);
});

test("duplicate visual observations are field-local",()=>{
  const{matrix,targets}=targeted();
  const out=validateShopAiReview({recommendation:"REVIEW",summary:"visual",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1 product row"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:supplier_name","KAPIL ALCOTECH LLP","MEDIUM"),visual("header:invoice_date","2026-09-19"),visual("item:0:batch_number","KK21 Aug-2026")]},matrix,targets);
  assert.equal(out.ok,true);
  assert.equal(out.fields.find(x=>x.fieldId==="document:line_coverage").verdict,"MATCH");
  assert.deepEqual(out.duplicateFindingFieldIds,["header:supplier_name"]);
  assert.equal(out.fields.find(x=>x.fieldId==="header:supplier_name").verdict,"PREFER_VISION");
  assert.equal(out.fields.find(x=>x.fieldId==="header:invoice_date").suggestedValue,"2026-09-19");
});

test("missing target fails closed",()=>{
  const{matrix,targets}=targeted();
  const out=validateShopAiReview({recommendation:"REVIEW",summary:"partial",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:invoice_date","2026-09-19")]},matrix,targets);
  assert.equal(out.fields.find(x=>x.fieldId==="item:0:batch_number").verdict,"NOT_JUDGED");
  assert.equal(out.coverageComplete,false);
  assert.equal(out.recommendation,"NO_GO");
});

test("provider NO_GO cannot be weakened",()=>{
  const{matrix,targets}=targeted();
  const out=validateShopAiReview({recommendation:"NO_GO",summary:"unsafe",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:invoice_date","2026-09-19"),visual("item:0:batch_number","KK21 Aug-2026")]},matrix,targets);
  assert.equal(out.recommendation,"NO_GO");
});

test("targeted run completes end-to-end",async()=>{
  const s=sample();
  const out=await runShopAiReview({config:{enabled:true,baseUrl:"https://unit.invalid",apiKey:"x",model:"gpt-5-mini",timeoutMs:60000},contentBase64:"YWJj",contentType:"image/jpeg",fileName:"invoice.jpg",documentPageCount:1,...s,fetchImpl:async()=>({ok:true,status:200,json:async()=>({id:"r",model:"gpt-5-mini",status:"completed",output_text:JSON.stringify({recommendation:"REVIEW",summary:"visual",coverage_complete:true,too_many_findings:false,findings:[visual("document:line_coverage","1"),visual("header:supplier_name","KAPIL ALCOTECH LLP"),visual("header:invoice_date","2026-09-19"),visual("item:0:batch_number","KK21 Aug-2026")]}),usage:{input_tokens:800,output_tokens:250,output_tokens_details:{reasoning_tokens:0}}})})});
  assert.equal(out.status,"COMPLETED");
  assert.equal(out.version,5);
  assert.equal(out.mode,"TARGETED_BLIND_VISUAL_ADJUDICATION_V2");
  assert.equal(out.candidateValuesWithheld,true);
  assert.equal(out.diagnostics.timeoutMs,60000);
});

test("frontend keeps safe prefill and complete Prepare-to-Receive verification flow",()=>{
  const automation=fs.readFileSync(new URL("../src/pages/AutomationHub.jsx",import.meta.url),"utf8");
  const purchases=fs.readFileSync(new URL("../src/pages/Purchases.jsx",import.meta.url),"utf8");
  const block=automation.slice(automation.indexOf("function applyShopAiVisualPrefills"),automation.indexOf("const MACHINE_PACK_SOURCES"));
  assert.match(block,/header:supplier_name/);assert.match(block,/header:invoice_date/);assert.match(block,/batch_number/);assert.doesNotMatch(block,/header:invoice_number/);
  assert.match(automation,/existingMatch: ranked\[0\]\?\.score >= 80/);
  assert.match(automation,/aiSupplierNeedsReview \|\| aiSupplierPrefilled/);
  const send=automation.slice(automation.indexOf("async function sendDraft()"),automation.indexOf("const supplierDefaults"));
  assert.doesNotMatch(send,/shopAiOwnerReady\(\)/);assert.match(send,/ready: false/);
  assert.match(purchases,/function confirmShopAiReviewInReceiving/);assert.match(purchases,/Confirm Invoice Review/);
  assert.match(purchases,/financialReady&&shopAiReady/);assert.match(purchases,/disabled=\{busy\|\|!ready\}/);
});
