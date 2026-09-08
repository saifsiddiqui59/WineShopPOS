import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scanner = fs.readFileSync(
  "src/components/MobileBarcodeScanner.jsx",
  "utf8",
);

test("mobile scanner prefers native detector with ZXing fallback", () => {
  assert.match(scanner, /BarcodeDetector/);
  assert.match(scanner, /BrowserMultiFormatReader/);
  assert.match(scanner, /startZxing/);
  assert.match(scanner, /6500/);
});

test("mobile scanner requests rear camera and supports camera switch", () => {
  assert.match(scanner, /facingMode/);
  assert.match(scanner, /environment/);
  assert.match(scanner, /listVideoInputDevices/);
  assert.match(scanner, /Switch Camera/);
});

test("mobile scanner exposes retry torch and manual fallback", () => {
  assert.match(scanner, /Retry Scanner/);
  assert.match(scanner, /torchSupported/);
  assert.match(scanner, /Use Barcode/);
  assert.match(scanner, /validateGtin/);
});

test("mobile scanner does not use any paid service", () => {
  assert.match(scanner, /no paid scanning service/i);
  assert.doesNotMatch(
    scanner,
    /serpapi|google vision|azure ai vision|aws rekognition/i,
  );
});
