import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const r=(path)=>fs.readFileSync(path,"utf8");
const remote=r("src/pages/PhoneScannerRemote.jsx");
const host=r("src/components/GlobalPhoneScannerHost.jsx");
const setup=r("src/pages/PhoneScannerSetup.jsx");
const app=r("src/App.jsx");

test("phone scanner public route remains",()=>{
  assert.match(app,/path="\/phone-scanner"/);
});

test("persistent pairing uses high entropy secret",()=>{
  assert.match(host,/Uint8Array\(24\)/);
  assert.match(host,/crypto\.getRandomValues/);
  assert.match(host,/crypto\.randomUUID/);
  assert.doesNotMatch(host,/expiresAt/);
});

test("Realtime transport is present regardless of source formatting",()=>{
  assert.match(remote,/supabase\s*\.\s*channel\s*\(/);
  assert.match(host,/supabase\s*\.\s*channel\s*\(/);
  assert.doesNotMatch(remote,/WebSocket\s*\(|fetch\s*\(/);
});

test("phone cannot mutate business tables directly",()=>{
  assert.doesNotMatch(
    remote,
    /supabase\s*\.\s*from\s*\(|completeSale|receiveStock|create_new_product|update_product_details/,
  );
});

test("simple Phone Scanner UI has no visible auto toggle",()=>{
  assert.match(remote,/<h1>Phone Scanner<\/h1>/);
  assert.match(remote,/>[\s\n]*Scan Barcode[\s\n]*<\/button>/);
  assert.match(remote,/title="Scan Barcode"/);
  assert.match(remote,/Forget This PC/);
  assert.doesNotMatch(remote,/Auto Scan:/);
  assert.doesNotMatch(remote,/Scan Barcode for PC|Barcode Scanner for PC/);
  assert.match(setup,/<h2>Phone Scanner<\/h2>/);
});

test("connected phone opens once then reopens after accepted ACK",()=>{
  assert.match(remote,/autoOpenedRef/);
  assert.match(remote,/if \(!autoOpenedRef\.current\)/);
  assert.match(remote,/if \(ack\?\.accepted\)/);
  assert.match(remote,/setTimeout\(\(\) => setScannerOpen\(true\), 450\)/);
  assert.match(remote,/SEND_ATTEMPTS = 3/);
  assert.match(remote,/barcode-ack/);
});
