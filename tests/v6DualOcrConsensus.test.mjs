import test from "node:test";
import assert from "node:assert/strict";

import {
  applySecondaryOcrConsensus,
  buildVisionReadSummary,
} from "../supabase/functions/_shared/invoiceSecondaryOcr.js";
import {
  buildResolutionEvidence,
  detectInvoiceIssues,
  validateAiMappingResponse,
} from "../supabase/functions/_shared/invoiceResolutionFallback.js";

function line(text, y, x = 20, confidence = 0.99) {
  return {
    text,
    boundingBox: [x, y, x + 300, y, x + 300, y + 20, x, y + 20],
    words: text.split(/\s+/).map((word) => ({ text: word, confidence })),
  };
}

function visionPayload() {
  return {
    status: "succeeded",
    analyzeResult: {
      readResults: [{
        page: 1,
        width: 1200,
        height: 1800,
        unit: "pixel",
        lines: [
          line("KAPIL ALCOTECH LLP", 80),
          line("Invoice No 19185", 120),
          line("Invoice Date 19-9-2026", 150),
          line("Haywards 2000 Strong Beer", 600, 120),
          line("500 Aug-2026", 600, 760),
          line("TOTAL 70,185.00", 1500),
        ],
      }],
    },
  };
}

function primaryInvoice(overrides = {}) {
  return {
    supplierName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    invoiceNumber: "19185",
    invoiceDate: "2021-07-19",
    invoiceDateRaw: "1 19-7-2021",
    invoiceDateReviewRequired: false,
    total: 70185,
    amountDue: 70185,
    items: [{
      description: "Haywards 2000 Strong Beer",
      amount: 5319,
      caseCount: 3,
      ratePerCase: 1773.07,
      batchNumber: "$00 Aue-2026",
      batchReviewRequired: true,
    }],
    financialAdjustments: {
      lineProductValue: 83944,
      calculatedInvoiceTotal: 70185,
      printedInvoiceTotal: 70185,
      reconciliationStatus: "MATCH",
    },
    ...overrides,
  };
}

test("Vision Read supplies independent date supplier total and row-batch evidence", () => {
  const primary = primaryInvoice();
  const secondary = buildVisionReadSummary(visionPayload(), primary);

  assert.equal(secondary.status, "SUCCEEDED");
  assert.equal(secondary.chosen.invoiceDate.value, "2026-09-19");
  assert.equal(secondary.chosen.invoiceNumber.value, "19185");
  assert.equal(secondary.chosen.invoiceTotal.value, 70185);
  assert.equal(secondary.chosen.supplierName.value, "KAPIL ALCOTECH LLP");
  assert.equal(secondary.itemBatches[0][0].value, "500 Aug-2026");
});

test("conflicting independent OCR remains human review and never silently overwrites", () => {
  const primary = primaryInvoice();
  const secondary = buildVisionReadSummary(visionPayload(), primary);
  const consensus = applySecondaryOcrConsensus(primary, secondary);

  assert.equal(consensus.invoiceDate, "2021-07-19");
  assert.equal(consensus.invoiceDateReviewRequired, true);
  assert.equal(consensus.items[0].batchNumber, "$00 Aue-2026");
  assert.equal(consensus.items[0].batchReviewRequired, true);
  assert.equal(consensus.total, 70185);

  const targets = new Set(consensus.crossOcr.reviewTargets.map((row) => row.targetId));
  assert.equal(targets.has("header:invoice_date"), true);
  assert.equal(targets.has("header:supplier_name"), true);
  assert.equal(targets.has("item:0:batch_number"), true);
  assert.equal(targets.has("finance:invoice_total"), false, "matching totals must be agreement, not conflict");
});

test("two OCR engines agreeing on batch clears batch review", () => {
  const primary = primaryInvoice({
    supplierName: "KAPIL ALCOTECH LLP",
    invoiceDate: "2026-09-19",
    items: [{
      description: "Haywards 2000 Strong Beer",
      amount: 5319,
      caseCount: 3,
      ratePerCase: 1773.07,
      batchNumber: "500 Aug-2026",
      batchReviewRequired: true,
    }],
  });
  const secondary = buildVisionReadSummary(visionPayload(), primary);
  const consensus = applySecondaryOcrConsensus(primary, secondary);
  assert.equal(consensus.items[0].batchReviewRequired, false);
});

test("Vision total plus accounting is a review candidate, not a fabricated printed total", () => {
  const primary = primaryInvoice({
    total: null,
    amountDue: null,
    financialAdjustments: {
      lineProductValue: 83944,
      calculatedInvoiceTotal: 70185,
      printedInvoiceTotal: null,
      reconciliationStatus: "REVIEW_PRINTED_TOTAL_UNREADABLE",
    },
  });
  const secondary = buildVisionReadSummary(visionPayload(), primary);
  const consensus = applySecondaryOcrConsensus(primary, secondary);
  const target = consensus.crossOcr.reviewTargets.find((row) => row.targetId === "finance:invoice_total");

  assert.equal(consensus.total, null);
  assert.equal(target.secondaryValue, 70185);
  assert.equal(target.arithmeticValue, 70185);
  assert.equal(target.reason, "SECONDARY_TOTAL_SUPPORTED_BY_ARITHMETIC");
});

test("existing app AI receives Vision evidence but conflict mappings are marked human-review", () => {
  const primary = primaryInvoice();
  const secondary = buildVisionReadSummary(visionPayload(), primary);
  const consensus = applySecondaryOcrConsensus(primary, secondary);
  const issues = detectInvoiceIssues(consensus);
  const evidence = buildResolutionEvidence({}, consensus, secondary);

  const dateIssue = issues.find((row) => row.targetId === "header:invoice_date");
  assert.equal(dateIssue.requiresHumanConfirmation, true);

  const dateEvidence = evidence.find((row) => row.id === secondary.chosen.invoiceDate.evidenceId);
  assert.ok(dateEvidence);

  const validated = validateAiMappingResponse(
    {
      needs_review: true,
      mappings: [{ target_id: "header:invoice_date", evidence_id: dateEvidence.id }],
    },
    issues,
    evidence,
    consensus,
  );

  assert.equal(validated.ok, true);
  assert.equal(validated.mappings[0].value, "2026-09-19");
  assert.equal(validated.mappings[0].requiresHumanConfirmation, true);
});
