import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const form=fs.readFileSync("src/components/ProductForm.jsx","utf8");
const add=fs.readFileSync("src/pages/AddProduct.jsx","utf8");
const phone=fs.readFileSync("src/pages/PhoneScannerRemote.jsx","utf8");
const host=fs.readFileSync("src/components/GlobalPhoneScannerHost.jsx","utf8");

test("Add Product image and barcode are independent",()=>{
  assert.match(form,/Product Name \+ Brand \+ Size/);
  assert.match(form,/before a barcode is required/);
  assert.match(form,/preSaveImageSelection/);
  assert.match(form,/Verify Product \/ Barcode/);
  assert.match(form,/data-scanner-capture="barcode"/);
});
test("exact chosen image survives Product creation",()=>{
  assert.match(add,/applyPreSaveProductImageChoice/);
  assert.match(add,/choiceCacheKey/);
  assert.match(add,/candidateId/);
  assert.match(add,/No different automatic image was substituted/);
});
test("phone remains global persistent scanner transport",()=>{
  assert.match(host,/wsp_global_phone_scanner_pairing_v1/);
  assert.match(host,/injectScan\(barcode/);
  assert.match(phone,/SEND_ATTEMPTS = 3/);
  assert.match(phone,/title="Scan Barcode"/);
  assert.doesNotMatch(phone,/Auto Scan:/);
});
