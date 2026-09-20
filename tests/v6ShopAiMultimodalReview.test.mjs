import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildShopAiFieldMatrix,
  buildShopAiRequest,
  estimatePdfPageCount,
  validateShopAiReview,
} from "../supabase/functions/_shared/invoiceShopAiReview.js";

function sample(){
  const primaryInvoice={
    supplierName:"ROYAL 21",
    invoiceNumber:"19185",
    invoiceDate:"2021-07-19",
    subtotal:83944,
    total:70185,
    totalTax:0,
    amountDue:70185,
    financialAdjustments:{
      evidence:[
        "Other Discount (-) -> 15,740.00",
        "Carrying & Forwarding (+) -> 600.00",
        "Stamp Fees -> 5.00",
        "TCS (+) -> 1,376.00",
      ],
      lineProductValue:83944,
      otherDeductionAmount:15740,
      assessableValueAmount:68204,
      freightCartingAmount:600,
      stampDutyAmount:5,
      printedGrossAmount:68809,
      tcsAmount:1376,
      otherAdditionsAmount:0,
      roundingAdjustment:0,
      printedInvoiceTotal:70185,
      calculatedInvoiceTotal:70185,
      reconciliationStatus:"MATCH",
    },
    items:[{
      description:"DR. KHATA KHAT PREMIUM QUALITY FORTIFIED WINE",
      packing:"180 ML",
      mrp:58,
      batchNumber:"KK21 Aug-21136",
      caseCount:1,
      unitsPerCaseHint:12,
      looseBottles:0,
      printedBottleQuantity:12,
      ratePerCase:2573,
      amount:2573,
    }],
  };
  const secondaryOcr={
    chosen:{
      supplierName:{value:"KAPIL ALCOTECH LLP"},
      invoiceDate:{value:"2020-04-19"},
      invoiceTotal:{value:70185},
    },
    itemBatches:{0:[{value:"KK21 Aug-2026"}]},
    textLines:[
      {page:1,text:"Invoice Date 19-09-2026",confidence:.91},
      {page:1,text:"DR. KHATA KHAT 180 ML MRP 58",confidence:.89},
    ],
  };
  const invoice=structuredClone(primaryInvoice);
  invoice.supplierName="KAPIL ALCOTECH LLP";
  invoice.invoiceDateReviewRequired=true;
  return {primaryInvoice,secondaryOcr,invoice};
}

test("matrix includes all core fields, finance coverage and line fields",()=>{
  const matrix=buildShopAiFieldMatrix(sample());
  const ids=new Set(matrix.map(x=>x.fieldId));
  for(const id of [
    "document:line_coverage",
    "header:supplier_name","header:invoice_number","header:invoice_date",
    "finance:adjustment_coverage","finance:line_product_value","finance:invoice_discount",
    "finance:assessable_value","finance:freight","finance:stamp_duty",
    "finance:gross_amount","finance:tcs","finance:printed_total","finance:calculated_total",
    "finance:tax_total","finance:amount_due",
    "item:0:description","item:0:packing","item:0:mrp","item:0:batch_number",
    "item:0:case_count","item:0:units_per_case","item:0:loose_bottles","item:0:printed_bottle_quantity",
    "item:0:rate_per_case","item:0:amount",
  ]) assert.equal(ids.has(id),true,id);
});

test("image request is one multimodal judge request with raw Vision context",()=>{
  const built=buildShopAiRequest({
    model:"gpt-5-mini",
    contentBase64:"YWJj",
    contentType:"image/jpeg",
    fileName:"invoice.jpg",
    documentPageCount:1,
    ...sample(),
  });
  assert.equal(built.ok,true);
  const content=built.request.input[0].content;
  assert.equal(content[0].type,"input_text");
  assert.equal(content[1].type,"input_image");
  assert.equal(content[1].detail,"high");
  assert.match(content[1].image_url,/^data:image\/jpeg;base64,/);
  const input=JSON.parse(content[0].text);
  assert.equal(input.vision_ocr_lines.length,2);
  assert.equal(input.deterministic_context.document_page_count,1);
  assert.ok(input.field_matrix.length>10);
  assert.equal(built.request.store,false);
  assert.equal(built.request.reasoning.effort,"minimal");
});

test("PDF request uses Responses API input_file data URI",()=>{
  const built=buildShopAiRequest({
    model:"gpt-5-mini",
    contentBase64:"YWJj",
    contentType:"application/pdf",
    fileName:"invoice.pdf",
    ...sample(),
  });
  const visual=built.request.input[0].content[1];
  assert.equal(visual.type,"input_file");
  assert.equal(visual.filename,"invoice.pdf");
  assert.match(visual.file_data,/^data:application\/pdf;base64,/);
});

test("DI/Vision conflict cannot be hidden as MATCH",()=>{
  const matrix=buildShopAiFieldMatrix(sample());
  const result=validateShopAiReview({
    recommendation:"GO",
    summary:"all good",
    matched_field_ids:matrix.map(x=>x.fieldId),
    findings:[],
  },matrix);
  const date=result.fields.find(x=>x.fieldId==="header:invoice_date");
  assert.equal(date.verdict,"MISMATCH");
  assert.equal(date.ownerConfirmationRequired,true);
  assert.equal(result.recommendation,"REVIEW");
});

test("visual inference is suggestion-only and forces REVIEW",()=>{
  const matrix=buildShopAiFieldMatrix(sample());
  const dateId="header:invoice_date";
  const result=validateShopAiReview({
    recommendation:"GO",
    summary:"date visible",
    matched_field_ids:matrix.map(x=>x.fieldId).filter(id=>id!==dateId),
    findings:[{
      field_id:dateId,
      verdict:"INFERRED_VISUAL",
      suggested_value:"2026-09-19",
      confidence:"HIGH",
      reason:"Printed date visually reads 19-09-2026.",
    }],
  },matrix);
  const date=result.fields.find(x=>x.fieldId===dateId);
  assert.equal(date.suggestedValue,"2026-09-19");
  assert.equal(date.verdict,"INFERRED_VISUAL");
  assert.equal(result.recommendation,"REVIEW");
});

test("line coverage issue forces NO_GO and omitted fields remain visible",()=>{
  const matrix=buildShopAiFieldMatrix(sample());
  const coverage="document:line_coverage";
  const omitted="item:0:mrp";
  const result=validateShopAiReview({
    recommendation:"REVIEW",
    summary:"coverage mismatch",
    matched_field_ids:matrix.map(x=>x.fieldId).filter(x=>x!==coverage&&x!==omitted),
    findings:[{
      field_id:coverage,
      verdict:"MISMATCH",
      suggested_value:"2",
      confidence:"HIGH",
      reason:"Visual has an unrepresented product row.",
    }],
  },matrix);
  assert.equal(result.recommendation,"NO_GO");
  assert.equal(result.fields.find(x=>x.fieldId===omitted).verdict,"NOT_JUDGED");
});

test("octet-stream visual type is inferred from filename",()=>{
  const built=buildShopAiRequest({
    model:"gpt-5-mini",
    contentBase64:"YWJj",
    contentType:"application/octet-stream",
    fileName:"invoice.jpg",
    ...sample(),
  });
  assert.equal(built.ok,true);
  assert.equal(built.request.input[0].content[1].type,"input_image");
});


test("PDF page budget uses structural PDF evidence instead of trusting DI processed-page count",()=>{
  const pdf=new TextEncoder().encode(
    "%PDF-1.7\n1 0 obj << /Type /Pages /Count 2 >> endobj\n"+
    "2 0 obj << /Type /Page /Parent 1 0 R >> endobj\n"+
    "3 0 obj << /Type /Page /Parent 1 0 R >> endobj\n%%EOF"
  );
  assert.equal(estimatePdfPageCount({bytes:pdf,contentType:"application/pdf",fileName:"x.pdf",diPageCount:1}),2);
  assert.equal(estimatePdfPageCount({bytes:new TextEncoder().encode("%PDF-1.7 opaque"),contentType:"application/pdf",fileName:"x.pdf",diPageCount:1}),9);
  assert.equal(estimatePdfPageCount({bytes:new Uint8Array([1,2]),contentType:"image/jpeg",fileName:"x.jpg",diPageCount:1}),1);
});

test("multimodal page budget fails safely to manual review",async()=>{
  const {runShopAiReview}=await import("../supabase/functions/_shared/invoiceShopAiReview.js");
  const out=await runShopAiReview({
    config:{enabled:true,baseUrl:"https://unit.invalid",apiKey:"x",model:"gpt-5-mini"},
    contentBase64:"YWJj",
    contentType:"application/pdf",
    fileName:"invoice.pdf",
    documentPageCount:9,
    ...sample(),
    fetchImpl:async()=>{throw new Error("provider should not be called")},
  });
  assert.equal(out.status,"UNAVAILABLE");
  assert.equal(out.reason,"SHOP_AI_PAGE_LIMIT");
});

test("Edge source uses canonical hash, Blob fallback, service-role authority and one multimodal call",()=>{
  const source=fs.readFileSync(new URL("../supabase/functions/ocr-invoice/index.ts",import.meta.url),"utf8");
  assert.match(source,/resolveCanonicalInvoiceDocument/);
  assert.match(source,/sha256Hex/);
  assert.match(source,/WSP_INVOICE_STORAGE_API_URL/);
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source,/persistAuthoritativeShopAiReview/);
  assert.match(source,/skipAi:\s*true/);
  assert.match(source,/estimatePdfPageCount/);
  assert.match(source,/runShopAiReview/);
});

test("Vision summary gives the judge compact raw OCR lines without persisting them in publicSecondary",()=>{
  const source=fs.readFileSync(new URL("../supabase/functions/_shared/invoiceSecondaryOcr.js",import.meta.url),"utf8");
  assert.match(source,/textLines: lines\.slice\(0, 180\)/);
  const publicBlock=source.slice(source.indexOf("function publicSecondary"),source.indexOf("export function applySecondaryOcrConsensus"));
  assert.doesNotMatch(publicBlock,/textLines:/);
});

test("owner UI shows every field and requires explicit GO/NO-GO choice",()=>{
  const source=fs.readFileSync(new URL("../src/pages/AutomationHub.jsx",import.meta.url),"utf8");
  assert.match(source,/ShopAI Invoice Judge/);
  assert.match(source,/shopAiReview\.fields/);
  assert.match(source,/View Original Invoice/);
  assert.match(source,/Owner GO/);
  assert.match(source,/Manual GO/);
  assert.match(source,/NO-GO/);
  assert.match(source,/shopAiOwnerDecision/);
});

test("Purchase Receiving and Inbox use authoritative ShopAI state",()=>{
  const purchases=fs.readFileSync(new URL("../src/pages/Purchases.jsx",import.meta.url),"utf8");
  const inbox=fs.readFileSync(new URL("../src/pages/InvoiceInbox.jsx",import.meta.url),"utf8");
  assert.match(purchases,/normalized_invoice,shopai_review/);
  assert.match(purchases,/shopAiReady/);
  assert.match(purchases,/financialReady&&shopAiReady/);
  assert.match(purchases,/shopAiOwnerDecision/);
  assert.match(inbox,/normalized_invoice,shopai_review/);
  assert.match(inbox,/shopAiReview:row\.shopai_review/);
});

test("migration separates authoritative ShopAI review from browser JSON and enforces owner gate",()=>{
  const sql=fs.readFileSync(new URL("../supabase/migrations/20260920043000_v6_shopai_multimodal_judge_v1.sql",import.meta.url),"utf8");
  assert.match(sql,/add column if not exists shopai_review jsonb/);
  assert.match(sql,/SHOPAI_REVIEW_SERVER_ONLY/);
  assert.match(sql,/v_jwt_role='service_role'/);
  assert.match(sql,/v_normalized:=coalesce\(p_normalized_invoice,'\{\}'::jsonb\)-'shopAiReview'/);
  assert.match(sql,/invoice_shopai_owner_gate_ok/);
  assert.match(sql,/MANUAL_GO/);
  assert.match(sql,/overrideReason/);
  assert.match(sql,/reviewGeneratedAt/);
  assert.match(sql,/SHOPAI_OWNER_REVIEW_REQUIRED/);
  assert.match(sql,/shopAiOwnerAudit/);
  assert.match(sql,/recordedBy',auth\.uid\(\)/);
  assert.match(sql,/invoice_assert_receivable/);
});
