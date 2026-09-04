import assert from "node:assert/strict";
import { normalizeDocumentIntelligenceResult } from "../supabase/functions/_shared/invoiceDocument.js";
import { parseOcrMoneyText } from "../supabase/functions/_shared/invoiceFinance.js";

assert.equal(parseOcrMoneyText("2.271.73"), 2271.73);
assert.equal(parseOcrMoneyText("14.406,00"), 14406);
assert.equal(parseOcrMoneyText("22.163.00"), 22163);
assert.equal(parseOcrMoneyText("1.144:00"), 1144);
assert.equal(parseOcrMoneyText("1.48.132.00"), 148132);
assert.equal(parseOcrMoneyText("1.45,227.00 2,905.00"), 2905);

const cell = (rowIndex, columnIndex, content, confidence = .95) => ({
  rowIndex, columnIndex, content, confidence,
  boundingRegions: [{ pageNumber: 1, polygon: [
    columnIndex, rowIndex * .2, columnIndex + .9, rowIndex * .2,
    columnIndex + .9, rowIndex * .2 + .15, columnIndex, rowIndex * .2 + .15,
  ] }],
});
const line = (content, x, y) => ({ content, polygon: [x, y, x + 1.5, y, x + 1.5, y + .1, x, y + .1] });

const canonical = { status: "succeeded", analyzeResult: {
  pages: [{ width: 10, height: 14, lines: [
    line("Other Discount", 1, 7.0), line("2,475.00", 8, 7.0),
    line("Cash Discounts", 1, 7.3), line("1,497.00", 8, 7.3),
    line("Stamp Fees", 1, 7.6), line("5.00", 8, 7.6),
    line("Carrying & Forwarding", 1, 7.9), line("1,144.00", 8, 7.9),
    line("TCS", 1, 8.2), line("2,905.00", 8, 8.2),
    line("1,48,132.00", 8, 9.0),
  ] }],
  documents: [{ confidence: .91, fields: {
    VendorName: { content: "METRI SPIRITS PRIVATE LIMITED" },
    InvoiceId: { content: "15983" },
    InvoiceDate: { valueDate: "2026-08-17" },
    SubTotal: { valueNumber: 45227 },
    InvoiceTotal: { valueNumber: 132 },
    AmountDue: { valueNumber: 132 },
    TotalTax: { valueNumber: 2905 },
    Items: { valueArray: [{ valueObject: {
      Description: { content: "TUBORG STRONG PREMIUM BEER" },
      Quantity: { valueNumber: 650 }, UnitPrice: { valueNumber: 2271.73 }, Amount: { valueNumber: 45435 },
    } }] },
  } }],
  tables: [{ cells: [
    cell(0, 0, "MRP"), cell(0, 1, "Brand"), cell(0, 2, "Batch No"), cell(0, 3, "Packing"),
    cell(0, 4, "Qty/Cs"), cell(0, 5, "Qty/Btl"), cell(0, 6, "Rate/Cs"), cell(0, 7, "Amount"),
    cell(1, 0, "205.00"), cell(1, 1, "TUBORG STRONG PREMIUM BEER"), cell(1, 2, "421 Jul-26"), cell(1, 3, "650 Ml"),
    cell(1, 4, "20"), cell(1, 5, ""), cell(1, 6, "2,271.73"), cell(1, 7, "45,435.00"),
    cell(2, 0, "160.00"), cell(2, 1, "TUBORG STRONG PREMIUM CAN"), cell(2, 2, "585 Aug-26"), cell(2, 3, "500 Ml"),
    cell(2, 4, "2"), cell(2, 5, ""), cell(2, 6, "3,546.12"), cell(2, 7, "7,092.00"),
  ] }],
} };

const a = normalizeDocumentIntelligenceResult(canonical);
assert.equal(a.items.length, 2);
assert.deepEqual(a.items.map((x) => x.caseCount), [20, 2]);
assert.equal(a.items[0].batchNumber, "421 Jul-26");
assert.equal(a.items[0].mrp, 205);
assert.equal(a.items[0].packing, "650 Ml");
assert.equal(a.subtotal, 52527);
assert.equal(a.freightAmount, 1144);
assert.equal(a.supplierDiscountAmount, 1497);
assert.equal(a.invoiceDiscountAmount, 2475);
assert.equal(a.miscellaneousAmount, 2910);

// Real METRI shape: combined `MRP Brand`, blank quantity headers, OCR punctuation noise,
// descriptions spilling into multiple columns, and case count recoverable from Amount / Rate-Cover-Case.
const realCells = [
  cell(3, 0, "MRP Brand"), cell(3, 3, "Batch No."), cell(3, 4, "Packing"), cell(3, 5, ""), cell(3, 6, ""), cell(3, 8, "Rate/Cs"), cell(3, 9, "Amount"),
  cell(4, 0, "205.00 TUBORG STRONG PREMIUM BEER"), cell(4, 3, "42| Jul-26"), cell(4, 4, "650 MI"), cell(4, 5, "201"), cell(4, 8, "2.271.73"), cell(4, 9, "45,435.00"),
  cell(5, 0, "10000 TUBORG STRONG PREMIUM CAN"), cell(5, 3, "595 Aug 20"), cell(5, 4, "500 MI"), cell(5, 8, "3,546.12"), cell(5, 9, "7,092.00"),
  cell(6, 0, "110.00 TURORG STRONG PREMIUM BEER"), cell(6, 3, "158 Aug-26"), cell(6, 4, "130 MI"), cell(6, 5, "P"), cell(6, 8, "2.881.23"), cell(6, 9, "14.406,00"),
  cell(7, 0, "150.000)"), cell(7, 1, "Carlsberg Elephant Strong Super Prentium Heer"), cell(7, 3, "57T Ait-26"), cell(7, 4, "650 MI"), cell(7, 8, "2.881,22"), cell(7, 9, "37,456.00"),
  cell(8, 0, "200.00"), cell(8, 1, "Cartsberg Elephant Strong Super Premium Beer CAN"), cell(8, 3, "530 101:26"), cell(8, 4, "500 ME"), cell(8, 5, "-SI"), cell(8, 8, "4,432.65"), cell(8, 9, "22.163.00"),
  cell(9, 0, "140.000"), cell(9, 1, "Tithore Classic Premium Scotch Beer"), cell(9, 3, "476 10F 20"), cell(9, 4, "6511 MI"), cell(9, 5, "5"), cell(9, 8, "2.659.59"), cell(9, 9, "13,298.00"),
  cell(10, 0, "185:00"), cell(10, 1, "Tuborg Classic Premium"), cell(10, 2, "Scotch Beer"), cell(10, 3, "375 Jut.20"), cell(10, 4, "500 Ntl"), cell(10, 5, "2"), cell(10, 8, "4,100.20"), cell(10, 9, "8,200.00"),
  cell(11, 9, "1,48,050.00"),
  cell(15, 2, "Other Discount1-1"), cell(15, 9, "2,475.00"),
  cell(16, 0, "Cash Discounts f-)"), cell(16, 9, "1,497.00"),
  cell(17, 2, "Stamp Fees (+)"), cell(17, 9, "5.00"),
  cell(18, 2, "Carrying & Forwarding (+)"), cell(18, 9, "1.144:00"),
  cell(20, 2, "Gros Amount TCS()"), cell(20, 9, "1.45,227.00 2,905.00"),
  cell(26, 2, "TOTAL"), cell(26, 5, "52.00"), cell(26, 9, "1.48.132.00"),
];
const realShape = { status: "succeeded", analyzeResult: {
  pages: [{ width: 10, height: 14, lines: [] }],
  documents: [{ fields: {
    VendorName: { content: "METRI SPIRITS\nPRIVATE LIMITED" }, InvoiceId: { content: "15983" }, InvoiceDate: { content: "17-8-2026" },
    SubTotal: { content: "1.45,227.00" }, TotalTax: { content: "2,905.00" }, InvoiceTotal: { content: "1.48.132.00" },
    Items: { valueArray: Array.from({ length: 7 }, (_, i) => ({ valueObject: { Description: { content: `GEN ${i + 1}` }, Quantity: { content: "650" }, UnitPrice: { content: "2.271.73" }, Amount: { content: "45,435.00" } } })) },
  } }],
  tables: [{ rowCount: 27, columnCount: 10, cells: realCells }],
} };
const b = normalizeDocumentIntelligenceResult(realShape);
assert.equal(b.ocrQuality.semanticTableDetected, true);
assert.equal(b.items.length, 7);
assert.deepEqual(b.items.map((x) => x.caseCount), [20, 2, 5, 13, 5, 5, 2]);
assert.deepEqual(b.items.map((x) => x.ratePerCase), [2271.73, 3546.12, 2881.23, 2881.22, 4432.65, 2659.59, 4100.20]);
assert.deepEqual(b.items.map((x) => x.amount), [45435, 7092, 14406, 37456, 22163, 13298, 8200]);
assert.equal(b.ocrQuality.derivedCaseTotal, 52);
assert.equal(b.ocrQuality.printedCaseTotal, 52);
assert.equal(b.ocrQuality.caseTotalMatches, true);
assert.equal(b.financialAdjustments.lineProductValue, 148050);
assert.equal(b.subtotal, 148050);
assert.equal(b.supplierDiscountAmount, 1497);
assert.equal(b.invoiceDiscountAmount, 2475);
assert.equal(b.freightAmount, 1144);
assert.equal(b.miscellaneousAmount, 2910);
assert.equal(b.total, 148132);
assert.equal(b.financialAdjustments.reconciliationStatus, "MATCH");
assert.equal(b.financialAdjustments.difference, 0);
assert.equal(b.items[1].mrp, null);
assert.equal(b.items[1].mrpReviewRequired, true);
assert.ok(b.items.some((x) => x.batchReviewRequired === true));
console.log("OCR_SEMANTIC_TABLE_SMOKE=PASS");
console.log("OCR_METRI_SHAPE_SMOKE=PASS");
