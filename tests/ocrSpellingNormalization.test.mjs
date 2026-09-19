import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  normalizeDocumentIntelligenceResult,
  normalizeOcrProductDescription,
} from "../supabase/functions/_shared/invoiceDocument.js";

test("OCR deterministic product spelling corrections are exact-token only", () => {
  assert.equal(
    normalizeOcrProductDescription("KFULTRA MAX STORNG BEER"),
    "KF ULTRA MAX STRONG BEER",
  );

  assert.equal(
    normalizeOcrProductDescription("kfultra storng can"),
    "KF ULTRA STRONG can",
  );

  assert.equal(
    normalizeOcrProductDescription("KF ULTRA STRONG BEER"),
    "KF ULTRA STRONG BEER",
  );

  assert.equal(
    normalizeOcrProductDescription("KFULTRAX STORNGEST"),
    "KFULTRAX STORNGEST",
  );
});

test("prebuilt invoice output receives deterministic spelling normalization", () => {
  const result = normalizeDocumentIntelligenceResult({
    analyzeResult: {
      documents: [{
        fields: {
          Items: {
            valueArray: [{
              valueObject: {
                Description: {
                  content: "KFULTRA MAX STORNG BEER",
                },
                Quantity: { valueNumber: 1 },
                UnitPrice: { valueNumber: 100 },
                Amount: { valueNumber: 100 },
              },
            }],
          },
        },
      }],
      pages: [],
      tables: [],
      keyValuePairs: [],
    },
  });

  assert.equal(result.items.length, 1);
  assert.equal(
    result.items[0].description,
    "KF ULTRA MAX STRONG BEER",
  );
});

test("semantic table path uses the same OCR spelling normalizer", () => {
  const source = fs.readFileSync(
    "supabase/functions/_shared/invoiceDocument.js",
    "utf8",
  );

  assert.ok(
    source.includes(
      "description = normalizeOcrProductDescription(description);",
    ),
  );
});
