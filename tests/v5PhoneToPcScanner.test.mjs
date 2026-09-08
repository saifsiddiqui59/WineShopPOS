import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main=fs.readFileSync("src/main.jsx","utf8");
const app=fs.readFileSync("src/App.jsx","utf8");
const pos=fs.readFileSync("src/pages/POS.jsx","utf8");
const host=fs.readFileSync("src/components/GlobalPhoneScannerHost.jsx","utf8");
const setup=fs.readFileSync("src/pages/PhoneScannerSetup.jsx","utf8");
const phone=fs.readFileSync("src/pages/PhoneScannerRemote.jsx","utf8");
const layout=fs.readFileSync("src/components/Layout.jsx","utf8");
const nav=fs.readFileSync("src/config/navigation.js","utf8");
const ctx=fs.readFileSync("src/context/ScannerContext.jsx","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const feature=fs.readFileSync("docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md","utf8");

test("phone scanner remote route remains public and minimal",()=>{
  const routeIndex=app.indexOf('path="/phone-scanner"');
  assert.ok(routeIndex>0);
  assert.doesNotMatch(phone,/\.from\("products"\)|completeSale|receiveStock/);
});

test("HashRouter deep link remains correct",()=>{
  assert.match(main,/HashRouter/);
  assert.match(host,/url\.hash\s*=\s*`\/phone-scanner\?/);
  assert.match(phone,/useSearchParams/);
  assert.doesNotMatch(phone,/window\.location\.search/);
});

test("V5_19 pairing is high entropy and persistent until explicit disconnect",()=>{
  assert.match(host,/new Uint8Array\(24\)/);
  assert.match(host,/crypto\.getRandomValues/);
  assert.match(host,/crypto\.randomUUID/);
  assert.doesNotMatch(host,/expiresAt|10 \* 60 \* 1000/);
  assert.match(setup,/Disconnect Phone/);
  assert.match(setup,/Replace \/ Reconnect Phone/);
  assert.match(phone,/Forget This PC/);
});

test("existing Supabase Realtime Broadcast remains the only transport",()=>{
  assert.match(host,/supabase\s*\.channel/);
  assert.match(phone,/supabase\s*\.channel/);
  assert.doesNotMatch(host,/\.insert\(|\.upsert\(|\.update\(/);
  assert.doesNotMatch(phone,/\.insert\(|\.upsert\(|\.update\(/);
});

test("delivery retries remain idempotent by event id",()=>{
  assert.match(phone,/SEND_ATTEMPTS = 3/);
  assert.match(phone,/waitAck/);
  assert.match(host,/seenRef/);
  assert.match(host,/prior/);
  assert.match(host,/eventId/);
  assert.match(host,/barcode-ack/);
});

test("pairing management moved to Operations and global scanner context",()=>{
  assert.match(app,/path="operations"/);
  assert.match(app,/path="phone-scanner"\s+element=\{<PhoneScannerSetup\/>\}/);
  assert.match(nav,/path:\s*"\/operations\/phone-scanner"/);
  assert.match(nav,/Phone Scanner/);
  assert.match(layout,/GlobalPhoneScannerHost/);
  assert.match(ctx,/injectScan/);
  assert.doesNotMatch(pos,/PhoneToPcScannerPanel/);
});

test("POS preserves local USB and same-device camera scanner paths",()=>{
  assert.match(pos,/role="tablist"/);
  assert.match(pos,/Barcode Scanner/);
  assert.match(pos,/This Device Camera/);
  assert.match(pos,/useScanner/);
  assert.match(pos,/lastScan/);
  assert.match(pos,/processBarcode/);
});

test("QR renderer remains local open source",()=>{
  assert.equal(pkg.dependencies["qrcode.react"],"4.2.0");
  assert.match(setup,/QRCodeSVG/);
});

test("documentation explicitly records V5_19 persistent-pairing supersession",()=>{
  assert.match(feature,/V5_19/);
  assert.match(feature,/supersedes[\s\S]*10-minute/i);
  assert.match(feature,/No new paid service/i);
});
