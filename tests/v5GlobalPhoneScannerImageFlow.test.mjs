import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scanner=fs.readFileSync("src/components/MobileBarcodeScanner.jsx","utf8");
const ctx=fs.readFileSync("src/context/ScannerContext.jsx","utf8");
const host=fs.readFileSync("src/components/GlobalPhoneScannerHost.jsx","utf8");
const remote=fs.readFileSync("src/pages/PhoneScannerRemote.jsx","utf8");
const setup=fs.readFileSync("src/pages/PhoneScannerSetup.jsx","utf8");
const app=fs.readFileSync("src/App.jsx","utf8");
const nav=fs.readFileSync("src/config/navigation.js","utf8");
const layout=fs.readFileSync("src/components/Layout.jsx","utf8");
const pos=fs.readFileSync("src/pages/POS.jsx","utf8");
const form=fs.readFileSync("src/components/ProductForm.jsx","utf8");

test("mobile scanner uses dedicated 1D ROI decoder with independent fallbacks",()=> {
  assert.match(scanner,/BrowserMultiFormatOneDReader/);
  assert.match(scanner,/BrowserMultiFormatReader/);
  assert.match(scanner,/decodeFromCanvas/);
  assert.match(scanner,/ZXING_1D_ROI_WIDE/);
  assert.match(scanner,/ZXING_1D_HIGH_CONTRAST/);
  assert.match(scanner,/NATIVE_BARCODE_DETECTOR/);
  assert.match(scanner,/facingMode:\s*\{\s*ideal:\s*"environment"/);
});

test("persistent pairing remains 192-bit and explicit-disconnect controlled",()=> {
  assert.match(host,/new Uint8Array\(24\)/);
  assert.match(host,/crypto\.getRandomValues/);
  assert.match(host,/crypto\.randomUUID/);
  assert.match(host,/wsp_global_phone_scanner_pairing_v1/);
  assert.doesNotMatch(host,/expiresAt|10 \* 60 \* 1000/);
  assert.match(setup,/Disconnect Phone/);
  assert.match(remote,/Forget This PC/);
  assert.match(remote,/wsp_saved_pc_scanner_pairing_v1/);
});

test("global host injects through ScannerContext and bounds dedupe cache",()=> {
  assert.match(ctx,/const injectScan = useCallback/);
  assert.match(host,/injectScan\(barcode/);
  assert.match(host,/MAX_ACK_CACHE = 500/);
  assert.match(host,/rememberAck/);
  assert.match(layout,/GlobalPhoneScannerHost/);
});

test("connection management moved to Operations while local POS scanner remains",()=> {
  assert.match(app,/path="operations"/);
  assert.match(app,/path="phone-scanner"\s+element=\{<PhoneScannerSetup\/>\}/);
  assert.match(nav,/path:\s*"\/operations\/phone-scanner"/);
  assert.match(nav,/Phone Scanner/);
  assert.doesNotMatch(pos,/PhoneToPcScannerPanel/);
  assert.doesNotMatch(pos,/Phone → this PC/);
  assert.match(pos,/Barcode Scanner/);
  assert.match(pos,/This Device Camera/);
  assert.match(pos,/MobileBarcodeScanner/);
  assert.match(pos,/useScanner/);
  assert.match(pos,/lastScan/);
  assert.match(pos,/processBarcode/);
});

test("phone supports auto/manual scan with retry and acknowledgement",()=> {
  assert.match(remote,/Auto Scan:/);
  assert.match(remote,/Scan Barcode/);
  assert.match(remote,/SEND_ATTEMPTS = 3/);
  assert.match(remote,/ACK_TIMEOUT_MS = 1600/);
  assert.match(remote,/barcode-ack/);
  assert.match(host,/prior/);
  assert.match(host,/SCAN_INJECTED/);
});

test("Add Product simplification preserves proven image and scanner safety",()=> {
  assert.match(form,/OcrProductImagePreview/);
  assert.match(form,/importCandidateImage/);
  assert.match(form,/Find Product \/ Image/);
  assert.doesNotMatch(form,/Review \/ Find Product Image/);
  assert.equal((form.match(/<ProductEnrichmentPanel/g)||[]).length,1);
  assert.equal((form.match(/data-scanner-capture="barcode"/g)||[]).length,1);
});

test("global phone implementation does not add direct business-table mutations",()=> {
  assert.doesNotMatch(host,/supabase\s*\.\s*from\s*\(|\.insert\s*\(|\.upsert\s*\(|\.update\s*\(|completeSale|receiveStock/);
  assert.doesNotMatch(remote,/supabase\s*\.\s*from\s*\(|\.insert\s*\(|\.upsert\s*\(|\.update\s*\(|completeSale|receiveStock/);
});
