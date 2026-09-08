import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scanner = fs.readFileSync(
  "src/components/MobileBarcodeScanner.jsx",
  "utf8",
);
const css = fs.readFileSync("src/index.css", "utf8");

test("mobile scanner keeps native detector plus ZXing fallback", () => {
  assert.match(scanner, /BarcodeDetector/);
  assert.match(scanner, /BrowserMultiFormatReader/);
  assert.match(scanner, /startNativeDetector/);
  assert.match(scanner, /startZxing/);
  assert.match(scanner, /NATIVE_TO_ZXING_MS = 3200/);
});

test("ZXing primary path requests high-resolution rear camera", () => {
  const constraints = scanner.indexOf("decodeFromConstraints");
  const deviceFallback = scanner.indexOf("decodeFromVideoDevice");

  assert.ok(constraints > 0);
  assert.ok(deviceFallback > constraints);
  assert.match(scanner, /width:\s*\{\s*ideal:\s*1920\s*\}/);
  assert.match(scanner, /height:\s*\{\s*ideal:\s*1080\s*\}/);
  assert.match(scanner, /frameRate:\s*\{\s*ideal:\s*30,\s*min:\s*15\s*\}/);
  assert.match(scanner, /facingMode:\s*\{\s*ideal:\s*"environment"\s*\}/);
});

test("native detector performs center ROI second pass", () => {
  assert.match(scanner, /detectNativeFrame/);
  assert.match(scanner, /roiCanvas/);
  assert.match(scanner, /cropWidth/);
  assert.match(scanner, /cropHeight/);
  assert.match(scanner, /context\.drawImage/);
  assert.match(scanner, /detector\.detect\(roiCanvas\)/);
});

test("camera track uses autofocus and conservative optical zoom assist", () => {
  assert.match(scanner, /focusMode/);
  assert.match(scanner, /"continuous"/);
  assert.match(scanner, /AUTO_ZOOM_TARGET = 1\.25/);
  assert.match(scanner, /zoomRangeRef/);
  assert.match(scanner, /Zoom \+/);
  assert.match(scanner, /Zoom -/);
});

test("rear-camera selection survives native to ZXing transition", () => {
  assert.match(scanner, /actualDeviceId/);
  assert.match(scanner, /fallbackDeviceId/);
  assert.match(scanner, /requestedDeviceId/);
  assert.match(scanner, /Switch Camera/);
});

test("torch retry manual fallback and GTIN validation remain", () => {
  assert.match(scanner, /Retry Scanner/);
  assert.match(scanner, /torchSupported/);
  assert.match(scanner, /Use Barcode/);
  assert.match(scanner, /validateGtin/);
});

test("scanner UI gives bottle/can focus guidance and visible target", () => {
  assert.match(scanner, /10–20 cm/);
  assert.match(scanner, /mobile-barcode-guide-v17/);
  assert.match(scanner, /mobile-barcode-scan-line/);
  assert.match(css, /V5_17_MOBILE_CAMERA_BARCODE_RECOGNITION_20260908/);
  assert.match(css, /object-fit:\s*contain/);
});

test("mobile scanner remains local/free and has no paid scanning provider", () => {
  assert.match(scanner, /no paid scanning service/i);
  assert.doesNotMatch(
    scanner,
    /serpapi|google vision|azure ai vision|aws rekognition/i,
  );
});
