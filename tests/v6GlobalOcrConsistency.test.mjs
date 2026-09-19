import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeDocumentIntelligenceResult,
} from "../supabase/functions/_shared/invoiceDocument.js";
import {
  extractInvoiceFinancials,
} from "../supabase/functions/_shared/invoiceFinance.js";

const cell = (rowIndex, columnIndex, content, confidence = 0.96) => ({
  rowIndex,
  columnIndex,
  content,
  confidence,
});

function semanticResult({ mrp, description, merged = false }) {
  const row = merged
    ? [
        cell(1, 0, String(mrp) + " " + String(description)),
        cell(1, 2, "650 ML"),
        cell(1, 3, "3"),
        cell(1, 4, "500 Aug-2026"),
        cell(1, 5, "1,773.07"),
        cell(1, 6, "5,319.00"),
      ]
    : [
        cell(1, 0, mrp),
        cell(1, 1, description),
        cell(1, 2, "650 ML"),
        cell(1, 3, "3"),
        cell(1, 4, "500 Aug-2026"),
        cell(1, 5, "1,773.07"),
        cell(1, 6, "5,319.00"),
      ];

  return normalizeDocumentIntelligenceResult({
    status: "succeeded",
    analyzeResult: {
      pages: [],
      documents: [{ confidence: 0.96, fields: {} }],
      tables: [{
        cells: [
          cell(0, 0, "MRP"),
          cell(0, 1, ""),
          cell(0, 2, "Packing"),
          cell(0, 3, "Qty Cs"),
          cell(0, 4, "Batch"),
          cell(0, 5, "Rate/Cs"),
          cell(0, 6, "Amount"),
          ...row,
        ],
      }],
    },
  });
}

test("lost Brand header keeps dedicated MRP out of product identity", () => {
  const r = semanticResult({
    mrp: "160.00",
    description: "Haywards 2000 Strong Beer",
  });

  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].description, "Haywards 2000 Strong Beer");
  assert.equal(r.items[0].mrp, 160);
  assert.equal(r.items[0].batchNumber, "500 Aug-2026");
});

test("legitimate numeric product name is preserved", () => {
  const r = semanticResult({
    mrp: "1800.00",
    description: "1800 Tequila Reserva",
  });

  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].description, "1800 Tequila Reserva");
  assert.equal(r.items[0].mrp, 1800);
});

test("MRP plus description merged into one row cell is recovered structurally", () => {
  const r = semanticResult({
    mrp: "140.00",
    description: "GROVER MISFIT CRAFT SPARK",
    merged: true,
  });

  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].description, "GROVER MISFIT CRAFT SPARK");
  assert.equal(r.items[0].mrp, 140);
});

function financeResult(printedTotal) {
  return extractInvoiceFinancials(
    {
      analyzeResult: {
        pages: [],
        keyValuePairs: [],
        tables: [{
          cells: [
            cell(0, 0, "Other Discount (-)"),
            cell(0, 9, "15,740.00"),
            cell(1, 0, "Stamp Fees (+)"),
            cell(1, 9, "5.00"),
            cell(2, 0, "Carrying & Forwarding (+)"),
            cell(2, 9, "600.00"),
            cell(3, 0, "Gross Amount"),
            cell(3, 9, "68,809.00"),
            cell(4, 0, "TCS (+)"),
            cell(4, 9, "1,376.00"),
            cell(5, 0, "TOTAL"),
            cell(5, 9, printedTotal),
          ],
        }],
      },
    },
    {},
    [{ description: "GENERIC PRODUCT VALUE", amount: 83944 }],
  );
}

test("plausible-size but contradictory OCR TOTAL fails closed", () => {
  const r = financeResult("30.001");

  assert.equal(r.subtotal, 83944);
  assert.equal(r.invoiceDiscountAmount, 15740);
  assert.equal(r.freightAmount, 600);
  assert.equal(r.financialAdjustments.calculatedGrossAmount, 68809);
  assert.equal(r.financialAdjustments.grossReconciliationStatus, "MATCH");
  assert.equal(r.financialAdjustments.tcsAmount, 1376);
  assert.equal(r.financialAdjustments.calculatedInvoiceTotal, 70185);

  assert.equal(r.financialAdjustments.printedTotalArithmeticStrong, true);
  assert.equal(r.financialAdjustments.printedTotalArithmeticConflict, true);
  assert.equal(r.financialAdjustments.reconciledTotalCandidate, 70185);

  assert.equal(r.total, null);
  assert.equal(r.amountDue, null);
  assert.equal(
    r.financialAdjustments.printedTotalEvidenceStatus,
    "LABELED_TOTAL_UNREADABLE",
  );
  assert.equal(
    r.financialAdjustments.reconciliationStatus,
    "REVIEW_PRINTED_TOTAL_UNREADABLE",
  );
});

test("matching labelled TOTAL stays authoritative", () => {
  const r = financeResult("70,185.00");

  assert.equal(r.total, 70185);
  assert.equal(r.financialAdjustments.printedTotalArithmeticStrong, true);
  assert.equal(r.financialAdjustments.printedTotalArithmeticConflict, false);
  assert.equal(
    r.financialAdjustments.printedTotalEvidenceStatus,
    "LABELED_TOTAL_RELIABLE",
  );
  assert.equal(r.financialAdjustments.reconciliationStatus, "MATCH");
});
