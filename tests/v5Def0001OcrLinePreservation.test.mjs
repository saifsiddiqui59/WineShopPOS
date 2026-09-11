import assert from "node:assert/strict";
import { normalizeDocumentIntelligenceResult } from "../supabase/functions/_shared/invoiceDocument.js";

const cell = (rowIndex, columnIndex, content, confidence = 0.96) => ({
  rowIndex,
  columnIndex,
  content,
  confidence,
  boundingRegions: [{
    pageNumber: 1,
    polygon: [
      columnIndex, rowIndex * 0.2,
      columnIndex + 0.9, rowIndex * 0.2,
      columnIndex + 0.9, rowIndex * 0.2 + 0.15,
      columnIndex, rowIndex * 0.2 + 0.15,
    ],
  }],
});

const rawItem = (description) => ({
  confidence: 0.92,
  valueObject: {
    Description: { content: description, confidence: 0.92 },
    Quantity: { valueNumber: 1 },
    Unit: { content: "case" },
    UnitPrice: { valueCurrency: { amount: 2637.30 } },
    Amount: { valueCurrency: { amount: 2637.00 } },
    MRP: { valueCurrency: { amount: 60 } },
  },
});

const result = {
  status: "succeeded",
  analyzeResult: {
    pages: [{ width: 10, height: 14, lines: [] }],
    documents: [{
      confidence: 0.95,
      fields: {
        VendorName: { content: "METRI SPIRITS PRIVATE LIMITED" },
        InvoiceId: { content: "16805" },
        InvoiceDate: { content: "3-9-2026" },
        SubTotal: { valueCurrency: { amount: 7911 } },
        InvoiceTotal: { valueCurrency: { amount: 8044 } },
        Items: {
          valueArray: [
            rawItem("DING DONGS FORTIFIED WINE"),
            rawItem("DYNAMITE XXX FORTIFIED WINE"),
            rawItem("GO LIMLET FORTIFIED WINE"),
          ],
        },
      },
    }],
    // Reproduces DEF-0001: Azure structured table has only physical rows 1 and 3.
    tables: [{
      cells: [
        cell(0, 0, "Name of Item"),
        cell(0, 1, "Packing"),
        cell(0, 2, "Qty/Cs"),
        cell(0, 3, "Rate/Cs"),
        cell(0, 4, "Amount"),

        cell(1, 0, "DING"),
        cell(1, 1, "180 Ml"),
        cell(1, 2, "1"),
        cell(1, 3, "2637.30"),
        cell(1, 4, "2637.00"),

        cell(2, 0, "Go"),
        cell(2, 1, "180 Ml"),
        cell(2, 2, "1"),
        cell(2, 3, "2637.30"),
        cell(2, 4, "2637.00"),
      ],
    }],
  },
};

const invoice = normalizeDocumentIntelligenceResult(result);

assert.equal(invoice.ocrQuality.genericItemLineCount, 3);
assert.equal(invoice.ocrQuality.semanticTableLineCount, 2);
assert.equal(invoice.items.length, 3, "partial semantic table must not delete a physical/prebuilt row");
assert.deepEqual(
  invoice.items.map((x) => x.description),
  [
    "DING DONGS FORTIFIED WINE",
    "DYNAMITE XXX FORTIFIED WINE",
    "GO LIMLET FORTIFIED WINE",
  ],
);
assert.deepEqual(invoice.items.map((x) => Number(x.caseCount)), [1, 1, 1]);
assert.deepEqual(invoice.items.map((x) => Number(x.amount)), [2637, 2637, 2637]);
assert.equal(invoice.subtotal, 7911);
assert.equal(invoice.total, 8044);
assert.equal(invoice.ocrQuality.derivedCaseTotal, 3);
assert.equal(
  invoice.ocrQuality.extractionMode,
  "SEMANTIC_TABLE_PARTIAL_PREBUILT_PRESERVED",
);

console.log("DEF_0001_OCR_LINE_PRESERVATION=PASS");
