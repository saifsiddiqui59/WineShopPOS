import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { extractInvoiceFinancials } from "../supabase/functions/_shared/invoiceFinance.js";

const polygon = (left, top, right, bottom) => [
  left, top,
  right, top,
  right, bottom,
  left, bottom,
];

const pageLine = (content, left, top, right, bottom) => ({
  content,
  polygon: polygon(left, top, right, bottom),
});

const tableCell = (rowIndex, columnIndex, content, left, top, right, bottom) => ({
  rowIndex,
  columnIndex,
  content,
  boundingRegions: [{ pageNumber: 1, polygon: polygon(left, top, right, bottom) }],
});

function b3339AnalyzeResult() {
  return {
    analyzeResult: {
      pages: [{
        pageNumber: 1,
        width: 10,
        height: 14,
        lines: [
          pageLine("TOTAL 35 86,715.00", 5.0, 8.00, 9.40, 8.22),

          pageLine("(-)DISCOUNT", 5.10, 8.55, 6.65, 8.76),
          pageLine("599",         8.55, 8.55, 9.35, 8.76),

          pageLine("FREIGHT",     5.10, 8.90, 6.40, 9.11),
          pageLine("700",         8.55, 8.90, 9.35, 9.11),

          pageLine("STAMP",       5.10, 9.25, 6.20, 9.46),
          pageLine("5",           8.55, 9.25, 9.35, 9.46),

          pageLine("TCS+EC+SC",   5.10, 9.60, 6.80, 9.81),
          pageLine("1737",        8.55, 9.60, 9.35, 9.81),

          pageLine("NET AMOUNT",  5.10, 10.05, 6.90, 10.26),
          pageLine("88,558.00",   8.30, 10.05, 9.40, 10.26),
        ],
      }],
      tables: [{
        cells: [
          // Actual observed B-3339 composite evidence.
          tableCell(20, 0, "TOTAL\n(-)DISCOUNT", 5.0, 8.00, 6.8, 8.76),
          tableCell(20, 9, "X6/15.00",            8.3, 8.00, 9.4, 8.76),

          tableCell(24, 0, "TCS+EC+SC", 5.1, 9.60, 6.8, 9.81),
          tableCell(24, 9, "1737",      8.5, 9.60, 9.4, 9.81),
        ],
      }],
      keyValuePairs: [{
        key: {
          content: "TOTAL\n(-)DISCOUNT",
          boundingRegions: [{ pageNumber: 1, polygon: polygon(5.0, 8.00, 6.8, 8.76) }],
        },
        value: {
          content: "X6/15.00",
          boundingRegions: [{ pageNumber: 1, polygon: polygon(8.3, 8.00, 9.4, 8.76) }],
        },
      }],
    },
  };
}

const itemAmounts = [
  9420, 6317, 5762, 4433, 5762, 3989, 4433,
  22163, 2992, 7092, 2660, 5818, 3325, 2549,
];
const items = itemAmounts.map((amount) => ({ amount }));

test("DEF-0002: B-3339 recovers directly labeled finance summary without arithmetic invention", () => {
  const out = extractInvoiceFinancials(b3339AnalyzeResult(), {}, items);

  assert.equal(out.subtotal, 86715);
  assert.equal(out.supplierDiscountAmount, 599);
  assert.equal(out.freightAmount, 700);
  assert.equal(out.financialAdjustments.stampDutyAmount, 5);
  assert.equal(out.financialAdjustments.tcsAmount, 1737);
  assert.equal(out.miscellaneousAmount, 1742);

  assert.equal(out.financialAdjustments.printedTotalRaw, "88,558.00");
  assert.equal(out.total, 88558);
  assert.equal(out.amountDue, 88558);
  assert.equal(out.financialAdjustments.calculatedInvoiceTotal, 88558);
  assert.equal(out.financialAdjustments.difference, 0);
  assert.equal(out.financialAdjustments.printedTotalEvidenceStatus, "LABELED_TOTAL_RELIABLE");
  assert.equal(out.financialAdjustments.reconciliationStatus, "MATCH");

  assert.ok(
    !out.financialAdjustments.evidence.some((row) =>
      String(row).includes("TOTAL\n(-)DISCOUNT -> X6/15.00")
    ),
    "compound TOTAL/DISCOUNT cell must not be accepted as final-total evidence",
  );
});

test("DEF-0002: ambiguous compound summary alone still fails closed", () => {
  const result = b3339AnalyzeResult();

  result.analyzeResult.pages[0].lines =
    result.analyzeResult.pages[0].lines.filter((line) =>
      line.content.startsWith("TOTAL 35") ||
      line.content === "TCS+EC+SC" ||
      line.content === "1737"
    );

  const out = extractInvoiceFinancials(result, {}, items);

  assert.equal(out.supplierDiscountAmount, 0);
  assert.equal(out.freightAmount, 0);
  assert.equal(out.financialAdjustments.stampDutyAmount, 0);
  assert.equal(out.financialAdjustments.tcsAmount, 1737);
  assert.equal(out.total, null, "must not invent 88558 when direct final-total evidence is absent");
  assert.notEqual(out.financialAdjustments.reconciliationStatus, "MATCH");
});

test("DEF-0002: R11 keeps B-3339 as a strict golden finance invoice", () => {
  const runner = fs.readFileSync(
    "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh",
    "utf8",
  );
  const start = runner.indexOf('"invoiceNumber": "B-3339"');
  const end = runner.indexOf('"invoiceNumber": "16805"', start);

  assert.ok(start >= 0 && end > start, "B-3339 and 16805 fixtures must exist");
  const block = runner.slice(start, end);

  assert.match(block, /"printedTotal": 88558/);
  assert.match(block, /"freight": 700/);
  assert.match(block, /"supplierDiscount": 599/);
  assert.match(block, /"misc": 1742/);
  assert.doesNotMatch(
    block,
    /allowUnreadablePrintedTotal/,
    "B-3339 must never be downgraded to the generic safe-review branch",
  );
});
