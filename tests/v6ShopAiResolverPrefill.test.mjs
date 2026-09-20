import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildShopAiFieldMatrix,
  validateShopAiReview,
  runShopAiReview,
} from "../supabase/functions/_shared/invoiceShopAiReview.js";

function sample() {
  const primaryInvoice = {
    supplierName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    invoiceNumber: "19185",
    invoiceDate: "2021-07-19",
    subtotal: 83944,
    total: 70185,
    amountDue: 70185,
    financialAdjustments: {
      lineProductValue: 83944,
      otherDeductionAmount: 15740,
      freightCartingAmount: 600,
      stampDutyAmount: 5,
      tcsAmount: 1376,
      printedInvoiceTotal: 70185,
      calculatedInvoiceTotal: 70185,
      reconciliationStatus: "MATCH",
    },
    items: [{
      description: "LETS GO GIMLET FORTIFIED WINE PREMIUM QUALITY",
      packing: "180 ML",
      mrp: 60,
      batchNumber: "GM19 Se-2006",
      caseCount: 1,
      ratePerCase: 2662,
      amount: 2662,
    }],
  };

  const secondaryOcr = {
    chosen: {
      supplierName: { value: "KAPIL ALCOTECH LLP" },
      invoiceDate: { value: "2020-04-19" },
      invoiceTotal: { value: 70185 },
    },
    itemBatches: { 0: [{ value: "GM19 Sep-2026" }] },
    textLines: [
      { page: 1, text: "KAPIL ALCOTECH LLP", confidence: .95 },
      { page: 1, text: "Invoice Date 19-09-2026", confidence: .95 },
      { page: 1, text: "GM19 Sep-2026", confidence: .92 },
    ],
  };

  const invoice = structuredClone(primaryInvoice);
  invoice.invoiceDateReviewRequired = true;
  return { primaryInvoice, secondaryOcr, invoice };
}

function finding(field_id, verdict, suggested_value, confidence = "HIGH", reason = "visual check") {
  return { field_id, verdict, suggested_value, confidence, reason };
}

test("same-value duplicate supplier observations merge and preserve date/batch", () => {
  const matrix = buildShopAiFieldMatrix(sample());
  const out = validateShopAiReview({
    recommendation: "REVIEW",
    summary: "role-aware visual resolution",
    coverage_complete: true,
    too_many_findings: false,
    findings: [
      finding("header:supplier_name", "PREFER_VISION", "KAPIL ALCOTECH LLP"),
      finding("header:supplier_name", "INFERRED_VISUAL", "KAPIL ALCOTECH LLP", "MEDIUM"),
      finding("header:invoice_date", "INFERRED_VISUAL", "2026-09-19"),
      finding("item:0:batch_number", "PREFER_VISION", "GM19 Sep-2026"),
    ],
  }, matrix);

  assert.equal(out.ok, true);
  assert.equal(out.status, "COMPLETED");
  assert.deepEqual(out.duplicateFindingFieldIds, ["header:supplier_name"]);
  assert.equal(out.fields.find(x => x.fieldId === "header:supplier_name").suggestedValue, "KAPIL ALCOTECH LLP");
  assert.equal(out.fields.find(x => x.fieldId === "header:invoice_date").suggestedValue, "2026-09-19");
  assert.equal(out.fields.find(x => x.fieldId === "item:0:batch_number").suggestedValue, "GM19 Sep-2026");
});

test("conflicting duplicate supplier observations isolate supplier only", () => {
  const matrix = buildShopAiFieldMatrix(sample());
  const out = validateShopAiReview({
    recommendation: "GO",
    summary: "conflicting supplier observations",
    coverage_complete: true,
    too_many_findings: false,
    findings: [
      finding("header:supplier_name", "PREFER_VISION", "KAPIL ALCOTECH LLP"),
      finding("header:supplier_name", "INFERRED_VISUAL", "ROYAL 21"),
      finding("header:invoice_date", "INFERRED_VISUAL", "2026-09-19"),
    ],
  }, matrix);

  assert.equal(out.ok, true);
  const supplier = out.fields.find(x => x.fieldId === "header:supplier_name");
  const date = out.fields.find(x => x.fieldId === "header:invoice_date");
  assert.equal(supplier.verdict, "MISMATCH");
  assert.equal(supplier.suggestedValue, "");
  assert.equal(date.suggestedValue, "2026-09-19");
  assert.equal(out.recommendation, "REVIEW");
});

test("incomplete model coverage keeps valid visual suggestions and never fabricates MATCH", () => {
  const matrix = buildShopAiFieldMatrix(sample());
  const out = validateShopAiReview({
    recommendation: "REVIEW",
    summary: "partial visual resolution",
    coverage_complete: false,
    too_many_findings: false,
    findings: [
      finding("header:invoice_date", "INFERRED_VISUAL", "2026-09-19"),
    ],
  }, matrix);

  assert.equal(out.ok, true);
  assert.equal(out.coverageComplete, false);
  assert.equal(out.fields.find(x => x.fieldId === "header:invoice_date").suggestedValue, "2026-09-19");
  assert.equal(out.fields.find(x => x.fieldId === "header:invoice_number").verdict, "NOT_JUDGED");
  assert.equal(out.recommendation, "NO_GO");
});

test("completed provider response survives semantic duplicate end-to-end", async () => {
  const s = sample();
  const out = await runShopAiReview({
    config: {
      enabled: true,
      baseUrl: "https://unit.invalid",
      apiKey: "x",
      model: "gpt-5-mini",
      timeoutMs: 60000,
    },
    contentBase64: "YWJj",
    contentType: "image/jpeg",
    fileName: "invoice.jpg",
    documentPageCount: 1,
    ...s,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: "resp_test",
        model: "gpt-5-mini",
        status: "completed",
        output_text: JSON.stringify({
          recommendation: "REVIEW",
          summary: "visual resolution",
          coverage_complete: true,
          too_many_findings: false,
          findings: [
            finding("header:supplier_name", "PREFER_VISION", "KAPIL ALCOTECH LLP"),
            finding("header:supplier_name", "INFERRED_VISUAL", "KAPIL ALCOTECH LLP", "MEDIUM"),
            finding("header:invoice_date", "INFERRED_VISUAL", "2026-09-19"),
            finding("item:0:batch_number", "PREFER_VISION", "GM19 Sep-2026"),
          ],
        }),
        usage: {
          input_tokens: 1000,
          output_tokens: 400,
          output_tokens_details: { reasoning_tokens: 0 },
        },
      }),
    }),
  });

  assert.equal(out.status, "COMPLETED");
  assert.equal(out.version, 4);
  assert.equal(out.diagnostics.timeoutMs, 60000);
  assert.equal(out.fields.find(x => x.fieldId === "header:invoice_date").suggestedValue, "2026-09-19");
  assert.equal(out.fields.find(x => x.fieldId === "item:0:batch_number").suggestedValue, "GM19 Sep-2026");
});

test("frontend has automatic visual prefill markers without auto-confirming supplier/batch", () => {
  const automation = fs.readFileSync(new URL("../src/pages/AutomationHub.jsx", import.meta.url), "utf8");
  const purchases = fs.readFileSync(new URL("../src/pages/Purchases.jsx", import.meta.url), "utf8");

  assert.match(automation, /applyShopAiVisualPrefills/);
  assert.match(automation, /supplierSource\s*=\s*"SHOPAI_VISUAL_SUGGESTION"/);
  assert.match(automation, /invoiceDateSource\s*=\s*"SHOPAI_VISUAL_SUGGESTION"/);
  assert.match(automation, /batchSuggestionSource:\s*"SHOPAI_VISUAL_SUGGESTION"/);
  assert.match(automation, /invoiceDateReviewRequired\s*=\s*true/);
  assert.match(automation, /supplierReviewRequired\s*=\s*true/);
  assert.match(automation, /const aiSupplierPrefilled/);
  assert.match(automation, /if \(aiSupplierPrefilled\)[\s\S]*else if \(exactMatches\.length === 1\)/);

  assert.match(purchases, /batchSuggestionSource/);
  assert.match(purchases, /SHOPAI_VISUAL_SUGGESTION/);
  assert.match(purchases, /Confirm Batch/);
  assert.match(purchases, /HUMAN_CONFIRMED/);
});

