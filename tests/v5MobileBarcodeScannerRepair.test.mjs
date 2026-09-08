import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scanner = fs.readFileSync(
  "src/components/MobileBarcodeScanner.jsx",
  "utf8",
);
const css = fs.readFileSync("src/index.css", "utf8");

test("scanner uses dedicated 1D reader plus multi-format fallback", () => {
  assert.match(scanner, /BrowserMultiFormatOneDReader/);
  assert.match(scanner, /new BrowserMultiFormatOneDReader/);
  assert.match(scanner, /BrowserMultiFormatReader/);
  assert.match(scanner, /ZXING_1D_ROI_WIDE/);
  assert.match(scanner, /ZXING_MULTI_FORMAT_ROI/);
});

test("camera starts with environment-facing constraints unless explicitly switched", () => {
  assert.match(scanner, /facingMode:\s*\{\s*ideal:\s*"environment"/);
  assert.match(scanner, /requestedDeviceId \|\| ""/);
  assert.match(scanner, /labelledRearCamera/);
  assert.match(scanner, /looksFrontFacing/);
});

test("scanner performs normal tight contrast inverted and rotated ROI passes", () => {
  assert.match(scanner, /roiWide/);
  assert.match(scanner, /roiTight/);
  assert.match(scanner, /roiContrast/);
  assert.match(scanner, /roiInvert/);
  assert.match(scanner, /roiRotated/);
  assert.match(scanner, /makeHighContrast/);
  assert.match(scanner, /rotateCanvas90/);
  assert.match(scanner, /decodeFromCanvas/);
});

test("native BarcodeDetector remains an independent signal", () => {
  assert.match(scanner, /BarcodeDetector/);
  assert.match(scanner, /nativeDetector\.detect\(video\)/);
  assert.match(scanner, /NATIVE_BARCODE_DETECTOR/);
});

test("scanner does not auto zoom but preserves manual zoom focus torch and camera switch", () => {
  assert.match(scanner, /focusMode/);
  assert.match(scanner, /"continuous"/);
  assert.match(scanner, /Zoom \+/);
  assert.match(scanner, /Zoom -/);
  assert.match(scanner, /torchSupported/);
  assert.match(scanner, /Switch Camera/);
  assert.doesNotMatch(scanner, /AUTO_ZOOM_TARGET/);
});

test("scanner gives real camera metadata and large matching guide", () => {
  assert.match(scanner, /cameraResolution/);
  assert.match(scanner, /activeCameraLabel/);
  assert.match(scanner, /mobile-barcode-guide-v19/);
  assert.match(css, /V5_19_MOBILE_1D_ROI_DECODER_20260908/);
  assert.match(css, /width:\s*min\(92%,\s*620px\)/);
});

test("manual barcode fallback and GTIN validation remain", () => {
  assert.match(scanner, /Use Barcode/);
  assert.match(scanner, /validateGtin/);
  assert.match(scanner, /Retry Scanner/);
});

test("scanner remains local/free with no paid recognition provider", () => {
  assert.match(scanner, /no paid scanning service/i);
  assert.doesNotMatch(
    scanner,
    /serpapi|google vision|azure ai vision|aws rekognition/i,
  );
});
