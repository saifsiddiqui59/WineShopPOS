import assert from "node:assert/strict";
import { extractInvoiceFinancials } from "../supabase/functions/_shared/invoiceFinance.js";

const cell = (rowIndex, columnIndex, content) => ({
  rowIndex,
  columnIndex,
  content,
});

const items = [
  { description: "PRODUCT A", amount: 2637 },
  { description: "PRODUCT B", amount: 2637 },
  { description: "PRODUCT C", amount: 2637 },
];

function analyzeResult({ cashDiscount, printedTotal }) {
  return {
    analyzeResult: {
      pages: [],
      keyValuePairs: [],
      tables: [{
        cells: [
          cell(0, 0, "Cash Discountt (-)"),
          cell(0, 9, cashDiscount),
          cell(1, 0, "Stamp Fees (+)"),
          cell(1, 9, "5.00"),
          cell(2, 0, "Carrying & Forwarding (+)"),
          cell(2, 9, "66.00"),
          cell(3, 0, "Assesable Value"),
          cell(3, 10, "7,911.00"),
          cell(4, 0, "Gross Amount"),
          cell(4, 9, "7.886,00"),
          cell(5, 0, "TCS (+)"),
          cell(5, 10, "158,00"),
          cell(6, 0, "TOTAL"),
          cell(6, 9, printedTotal),
        ],
      }],
    },
  };
}

// Real failure mode: Azure itself says 95 and mangles TOTAL.
// Preserve those observations and force human review. Never manufacture 96
// or silently relabel 7911 as the printed final total.
{
  const fields = {
    SubTotal: {
      content: "7.886,00",
      valueCurrency: { amount: 7886, currencyCode: "INR" },
    },
    InvoiceTotal: {
      content: "85.044.00",
      valueCurrency: { amount: 44, currencyCode: "INR" },
    },
  };

  const r = extractInvoiceFinancials(
    analyzeResult({ cashDiscount: "95.00", printedTotal: "85.044.00" }),
    fields,
    items,
  );

  assert.equal(r.subtotal, 7911);
  assert.equal(r.supplierDiscountAmount, 95, "do not auto-correct Azure OCR 95 to 96");
  assert.equal(r.freightAmount, 66);
  assert.equal(r.financialAdjustments.stampDutyAmount, 5);
  assert.equal(r.financialAdjustments.tcsAmount, 158);

  assert.equal(r.financialAdjustments.assessableValueAmount, 7911);
  assert.equal(r.financialAdjustments.printedGrossAmount, 7886);
  assert.equal(r.financialAdjustments.calculatedGrossAmount, 7887);
  assert.equal(r.financialAdjustments.grossDifference, -1);
  assert.equal(r.financialAdjustments.grossReconciliationStatus, "REVIEW");

  assert.equal(r.financialAdjustments.printedTotalRaw, "85.044.00");
  assert.equal(
    r.financialAdjustments.printedTotalEvidenceStatus,
    "LABELED_TOTAL_UNREADABLE",
  );
  assert.equal(r.financialAdjustments.printedInvoiceTotal, null);
  assert.equal(r.total, null);
  assert.equal(r.amountDue, null);
  assert.equal(
    r.financialAdjustments.reconciliationStatus,
    "REVIEW_PRINTED_TOTAL_UNREADABLE",
  );
}

// Generic good-evidence case: structured InvoiceTotal is wrong (7911), but
// the explicitly labelled printed TOTAL is clean (8044). Trust that direct
// invoice evidence; no arithmetic correction is used.
{
  const fields = {
    SubTotal: {
      content: "7.886,00",
      valueCurrency: { amount: 7886, currencyCode: "INR" },
    },
    InvoiceTotal: {
      content: "7,911.00",
      valueCurrency: { amount: 7911, currencyCode: "INR" },
    },
  };

  const r = extractInvoiceFinancials(
    analyzeResult({ cashDiscount: "96.00", printedTotal: "8,044.00" }),
    fields,
    items,
  );

  assert.equal(r.subtotal, 7911);
  assert.equal(r.supplierDiscountAmount, 96);
  assert.equal(r.financialAdjustments.printedGrossAmount, 7886);
  assert.equal(r.financialAdjustments.grossReconciliationStatus, "MATCH");

  assert.equal(r.financialAdjustments.printedTotalRaw, "8,044.00");
  assert.equal(
    r.financialAdjustments.printedTotalEvidenceStatus,
    "LABELED_TOTAL_RELIABLE",
  );
  assert.equal(r.financialAdjustments.printedInvoiceTotal, 8044);
  assert.equal(r.total, 8044);
  assert.equal(r.amountDue, 8044);
  assert.equal(r.financialAdjustments.calculatedInvoiceTotal, 8044);
  assert.equal(r.financialAdjustments.difference, 0);
  assert.equal(r.financialAdjustments.reconciliationStatus, "MATCH");
}

console.log("DEF_0001_FINANCE_EVIDENCE_REGRESSION=PASS");
