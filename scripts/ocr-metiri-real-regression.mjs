import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeDocumentIntelligenceResult } from "../supabase/functions/_shared/invoiceDocument.js";

const input = process.argv[2];
if (!input) throw new Error("Azure result JSON path is required");
const raw = JSON.parse(fs.readFileSync(input, "utf8"));
assert.equal(String(raw?.status || "").toLowerCase(), "succeeded");
const invoice = normalizeDocumentIntelligenceResult(raw);
const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

assert.ok(norm(invoice.supplierName).includes("metri spirits"), `supplier: ${invoice.supplierName}`);
assert.ok(String(invoice.invoiceNumber || "").includes("15983"), `invoice: ${invoice.invoiceNumber}`);
assert.equal(invoice.ocrQuality?.semanticTableDetected, true, "semantic table not detected");
assert.equal(invoice.items.length, 7, `expected 7 lines, got ${invoice.items.length}`);

const expectedCases = [20, 2, 5, 13, 5, 5, 2];
const expectedRates = [2271.73, 3546.12, 2881.23, 2881.22, 4432.65, 2659.59, 4100.20];
const expectedAmounts = [45435, 7092, 14406, 37456, 22163, 13298, 8200];

invoice.items.forEach((item, i) => {
  assert.equal(Number(item.caseCount), expectedCases[i], `line ${i + 1} cases`);
  assert.ok(Math.abs(Number(item.ratePerCase) - expectedRates[i]) <= 0.01, `line ${i + 1} rate ${item.ratePerCase}`);
  assert.ok(Math.abs(Number(item.amount) - expectedAmounts[i]) <= 0.01, `line ${i + 1} amount ${item.amount}`);
  assert.ok(String(item.batchNumber || "").trim().length > 0, `line ${i + 1} batch missing`);
  assert.equal(item.caseCountSource, "DERIVED_AMOUNT_RATE", `line ${i + 1} case source`);
});

assert.equal(invoice.ocrQuality?.derivedCaseTotal, 52, "derived case total");
assert.equal(invoice.ocrQuality?.printedCaseTotal, 52, "printed case total");
assert.equal(invoice.ocrQuality?.caseTotalMatches, true, "printed vs derived case total mismatch");
assert.equal(invoice.financialAdjustments.lineProductValue, 148050);
assert.equal(invoice.subtotal, 148050);
assert.equal(invoice.supplierDiscountAmount, 1497);
assert.equal(invoice.invoiceDiscountAmount, 2475);
assert.equal(invoice.freightAmount, 1144);
assert.equal(invoice.miscellaneousAmount, 2910);
assert.equal(invoice.total, 148132);
assert.equal(invoice.financialAdjustments.reconciliationStatus, "MATCH");
assert.equal(invoice.financialAdjustments.difference, 0);

// Azure's batch OCR is visibly noisy on this photo. Preserve it for review; never invent corrected batch IDs.
assert.ok(invoice.items.some((item) => item.batchReviewRequired === true), "expected at least one batch review flag");
// The second MRP was returned once as `10000` (lost decimal). Accept either a clean 100.00 parse or a review-required null.
const secondMrp = invoice.items[1]?.mrp;
assert.ok(secondMrp == null || Math.abs(Number(secondMrp) - 100) <= 0.01, `line 2 MRP ${secondMrp}`);
if (secondMrp == null) assert.equal(invoice.items[1]?.mrpReviewRequired, true, "ambiguous MRP must be review flagged");

console.log("METRI_REAL_AZURE_REGRESSION=PASS");
console.log(JSON.stringify({
  supplier: invoice.supplierName,
  invoiceNumber: invoice.invoiceNumber,
  cases: invoice.items.map((x) => x.caseCount),
  caseSources: invoice.items.map((x) => x.caseCountSource),
  batches: invoice.items.map((x) => ({ raw: x.batchNumber, review: x.batchReviewRequired })),
  mrp: invoice.items.map((x) => ({ value: x.mrp, raw: x.mrpRaw, review: x.mrpReviewRequired })),
  productValue: invoice.financialAdjustments.lineProductValue,
  total: invoice.total,
  reconciliation: invoice.financialAdjustments.reconciliationStatus,
  caseTotal: {
    derived: invoice.ocrQuality?.derivedCaseTotal,
    printed: invoice.ocrQuality?.printedCaseTotal,
    matches: invoice.ocrQuality?.caseTotalMatches,
  },
}, null, 2));
