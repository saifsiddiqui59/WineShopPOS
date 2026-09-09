import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8"),pos=r("src/pages/POS.jsx"),ctx=r("src/context/ScannerContext.jsx"),form=r("src/components/ProductForm.jsx"),current=r("docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md");
test("POS keeps USB and same-device camera",()=>{assert.match(pos,/MobileBarcodeScanner/);assert.match(pos,/Barcode Scanner/);assert.match(pos,/This Device Camera/);assert.match(pos,/useScanner/);assert.match(pos,/lastScan/);assert.match(pos,/processBarcode/);assert.doesNotMatch(pos,/PhoneToPcScannerPanel/);});
test("global scanner contract preserved",()=>{assert.match(ctx,/scannerSequenceLooksValid/);assert.match(ctx,/injectScan/);assert.match(form,/data-scanner-capture="barcode"/);});
test("continuity remains V5 QA authority",()=>{assert.match(current,/V5/);assert.match(current,/QA|DEV/);assert.match(current,/HUMAN UAT|UAT/i);});
