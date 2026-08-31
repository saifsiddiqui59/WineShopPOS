import assert from "node:assert/strict";
import { extractInvoiceFinancials } from "../supabase/functions/_shared/invoiceFinance.js";

const rect = (x1, y1, x2, y2) => [x1,y1,x2,y1,x2,y2,x1,y2];
const line = (content, x1, y1, x2, y2) => ({ content, polygon: rect(x1,y1,x2,y2) });

const analyzeResult = {
  analyzeResult: {
    pages: [{
      width: 1000,
      height: 1000,
      lines: [
        line("Cash Discount", 20, 600, 180, 620),
        line("(-)1,527.00", 840, 600, 950, 620),
        line("Other Deduction", 20, 635, 180, 655),
        line("(-)2,475.00", 840, 635, 950, 655),
        line("Freight/Carting", 20, 670, 180, 690),
        line("1,210.00", 840, 670, 950, 690),
        line("Stamp Duty", 20, 705, 180, 725),
        line("5.00", 840, 705, 950, 725),
        line("TCS", 20, 740, 180, 760),
        line("2,963.00", 840, 740, 950, 760),
        line("1,51,108.00", 820, 830, 960, 855),
      ],
    }],
  },
};

const items = [
  { amount: 45434.59 },
  { amount: 17730.60 },
  { amount: 14406.14 },
  { amount: 37456.01 },
  { amount: 14406.00 },
  { amount: 13298.00 },
  { amount: 8200.40 },
];

const r = extractInvoiceFinancials(analyzeResult, {}, items);
assert.equal(r.freightAmount, 1210);
assert.equal(r.supplierDiscountAmount, 1527);
assert.equal(r.invoiceDiscountAmount, 2475);
assert.equal(r.miscellaneousAmount, 2968);
assert.equal(r.roundingAdjustment, 0.26); // mock line values sum to 150931.74
assert.equal(r.total, 151108);
assert.equal(r.financialAdjustments.reconciliationStatus, "MATCH");
assert.equal(r.financialAdjustments.difference, 0);
console.log("INVOICE_FINANCE_SMOKE=PASS", JSON.stringify(r.financialAdjustments));
