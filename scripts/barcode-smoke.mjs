import assert from "node:assert/strict";
import {
  normalizeBarcode,
  scannerSequenceLooksValid,
  findProductByBarcode,
} from "../src/lib/barcode.js";

assert.equal(normalizeBarcode(" 8901234567890\r\n"), "8901234567890");
assert.equal(normalizeBarcode("000123456789"), "000123456789");

const fastTimes = Array.from({ length: 13 }, (_, i) => i * 40);
assert.equal(
  scannerSequenceLooksValid("8901234567890", fastTimes, {
    minLength: 6,
    maxAverageGapMs: 100,
  }),
  true,
);

const slowerScannerTimes = Array.from({ length: 13 }, (_, i) => i * 85);
assert.equal(
  scannerSequenceLooksValid("8901234567890", slowerScannerTimes, {
    minLength: 6,
    maxAverageGapMs: 100,
  }),
  true,
);

const humanTimes = Array.from({ length: 13 }, (_, i) => i * 200);
assert.equal(
  scannerSequenceLooksValid("8901234567890", humanTimes, {
    minLength: 6,
    maxAverageGapMs: 100,
  }),
  false,
);

const products = [{ id: "p1", barcode: "000123456789" }];
assert.equal(findProductByBarcode(products, " 000123456789\r")?.id, "p1");

console.log("BARCODE_SMOKE=PASS");
