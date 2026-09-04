import fs from "node:fs";
import assert from "node:assert/strict";
import { normalizeDocumentIntelligenceResult } from "../supabase/functions/_shared/invoiceDocument.js";

const root = process.argv[2];
if (!root) throw new Error("Pass the directory containing saved *-azure.json files.");
const load = (id) => JSON.parse(fs.readFileSync(`${root}/${id}-azure.json`, "utf8"));
const approx = (actual, expected, tolerance = 1.3) =>
  assert.ok(Math.abs(Number(actual) - Number(expected)) <= tolerance, `${actual} != ${expected}`);
const cases = (invoice, expected) =>
  assert.deepEqual(invoice.items.map((x) => Number(x.caseCount || 0)), expected);

const kapil = normalizeDocumentIntelligenceResult(load("kapil_16845"));
assert.equal(kapil.invoiceNumber, "16845");
assert.equal(kapil.invoiceDate, "2026-08-26");
assert.equal(kapil.invoiceDateReviewRequired, false);
assert.equal(kapil.ocrQuality.semanticTableDetected, true);
assert.equal(kapil.items.length, 15);
cases(kapil, [10,1,5,10,1,5,15,3,1,1,3,2,3,1,1]);
assert.equal(kapil.ocrQuality.derivedCaseTotal, 62);
approx(kapil.financialAdjustments.lineProductValue, 175975);
approx(kapil.supplierDiscountAmount, 1216);
approx(kapil.invoiceDiscountAmount, 0);
approx(kapil.freightAmount, 1550);
approx(kapil.miscellaneousAmount, 3531);
approx(kapil.total, 179840);
assert.equal(kapil.financialAdjustments.reconciliationStatus, "MATCH");

const metri = normalizeDocumentIntelligenceResult(load("metri_15983"));
assert.equal(metri.invoiceNumber, "15983");
assert.equal(metri.invoiceDate, "2026-08-17");
assert.equal(metri.ocrQuality.semanticTableDetected, true);
assert.equal(metri.items.length, 7);
cases(metri, [20,2,5,13,5,5,2]);
assert.equal(metri.ocrQuality.derivedCaseTotal, 52);
approx(metri.financialAdjustments.lineProductValue, 148050);
approx(metri.supplierDiscountAmount, 1497);
approx(metri.invoiceDiscountAmount, 2475);
approx(metri.freightAmount, 1144);
approx(metri.miscellaneousAmount, 2910);
approx(metri.total, 148132);
assert.equal(metri.financialAdjustments.reconciliationStatus, "MATCH");

const erp = normalizeDocumentIntelligenceResult(load("erp_reference"));
assert.equal(erp.ocrQuality.semanticTableDetected, true);
assert.equal(erp.items.length, 7);
cases(erp, [20,5,5,13,5,5,2]);
assert.equal(erp.ocrQuality.derivedCaseTotal, 55);
assert.deepEqual(erp.items.map((x) => Number(x.unitsPerCaseHint || 0)), [12,24,24,12,12,12,24]);
assert.deepEqual(erp.items.map((x) => Number(x.printedBottleQuantity || 0)), [240,120,120,156,60,60,48]);
approx(erp.financialAdjustments.lineProductValue, 150932);
approx(erp.supplierDiscountAmount, 1527);
approx(erp.invoiceDiscountAmount, 2475);
approx(erp.freightAmount, 1210);
approx(erp.miscellaneousAmount, 2968);
approx(erp.total, 151108);
assert.equal(erp.financialAdjustments.reconciliationStatus, "MATCH");

console.log("V3_05_THREE_INVOICE_REGRESSION=PASS");
