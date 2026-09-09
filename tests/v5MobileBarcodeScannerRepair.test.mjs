import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scanner=fs.readFileSync("src/components/MobileBarcodeScanner.jsx","utf8");
const css=fs.readFileSync("src/index.css","utf8");

test("dedicated 1D ROI decoder remains",()=>{
  for(const marker of[
    "BrowserMultiFormatOneDReader",
    "ZXING_1D_ROI_WIDE",
    "ZXING_1D_ROI_TIGHT",
    "ZXING_1D_HIGH_CONTRAST",
    "ZXING_1D_INVERTED",
    "ZXING_1D_ROTATED",
  ]) assert.ok(scanner.includes(marker),marker);
});

test("rear camera and native fallback remain",()=>{
  assert.match(scanner,/facingMode:\s*\{\s*ideal:\s*"environment"/);
  assert.match(scanner,/BarcodeDetector/);
  assert.match(scanner,/Switch Camera/);
  assert.match(scanner,/Torch/);
});

test("pinch replaces Zoom plus/minus controls",()=>{
  assert.match(scanner,/handlePinchStart/);
  assert.match(scanner,/handlePinchMove/);
  assert.match(scanner,/touchDistance/);
  assert.match(scanner,/applyZoom/);
  assert.doesNotMatch(scanner,/>[\s\n]*Zoom -[\s\n]*</);
  assert.doesNotMatch(scanner,/>[\s\n]*Zoom \+[\s\n]*</);
  assert.match(scanner,/pinch to zoom/i);
});

test("scanner copy is minimal and Retry is error-only",()=>{
  assert.match(scanner,/Point at barcode/);
  assert.match(scanner,/Bottle\/can: keep full bars \+ numbers inside the box/);
  assert.match(scanner,/scannerMode === "ERROR"/);
  assert.match(scanner,/>[\s\n]*Retry[\s\n]*<\/button>/);
  assert.doesNotMatch(scanner,/Dedicated 1D product-barcode decoder/);
  assert.doesNotMatch(scanner,/1D Product Barcode Scanner/);
  assert.doesNotMatch(scanner,/Best way to scan bottle\/can barcode/);
  assert.doesNotMatch(scanner,/mobile-barcode-camera-meta/);
  assert.doesNotMatch(scanner,/>[\s\n]*Cancel[\s\n]*<\/button>/);
});

test("scanner is hardened to full dynamic mobile viewport",()=>{
  assert.match(css,/V5_20D_MINIMAL_FULLSCREEN_PINCH_SCANNER_20260909/);
  assert.match(css,/position:\s*fixed\s*!important/);
  assert.match(css,/inset:\s*0\s*!important/);
  assert.match(css,/height:\s*100vh\s*!important/);
  assert.match(css,/height:\s*100dvh\s*!important/);
  assert.match(css,/object-fit:\s*cover\s*!important/);
  assert.match(css,/touch-action:\s*none/);
});

test("scanner remains local with no paid recognition service",()=>{
  assert.doesNotMatch(scanner,/azure ai vision|google vision|aws rekognition|paid scanner|barcode lookup api/i);
});

test("V5_21 starts ZXing before optional camera enhancements",()=>{
  assert.match(scanner,/CAMERA_REQUEST_WATCHDOG_MS = 7000/);
  assert.match(scanner,/void videoRef\.current\.play\(\)\.catch\(\(\) => \{\}\)/);
  assert.match(scanner,/void tuneTrack\(stream\)/);
  assert.doesNotMatch(scanner,/await videoRef\.current\.play\(\)/);
  assert.doesNotMatch(scanner,/await tuneTrack\(stream\)/);
  assert.doesNotMatch(scanner,/setRequestedDeviceId\(rear\.deviceId\)/);

  const activeAt=scanner.indexOf('setScannerMode("ONE_D_ROI");');
  const scanAt=scanner.indexOf("void scanFrame();",activeAt);
  const enhanceAt=scanner.indexOf("await ensureRearCamera(stream);",activeAt);
  assert.ok(activeAt>0);
  assert.ok(scanAt>activeAt);
  assert.ok(enhanceAt>scanAt);
});

test("V5_21 exposes Retry instead of indefinite Opening camera",()=>{
  assert.match(scanner,/Camera is taking too long to open/);
  assert.match(scanner,/Camera permission is blocked/);
  assert.match(scanner,/Camera is busy in another app or browser tab/);
  assert.match(scanner,/scannerMode === "ERROR"/);
});
