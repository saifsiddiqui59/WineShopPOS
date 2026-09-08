import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main = fs.readFileSync("src/main.jsx", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const pos = fs.readFileSync("src/pages/POS.jsx", "utf8");
const panel = fs.readFileSync(
  "src/components/PhoneToPcScannerPanel.jsx",
  "utf8",
);
const phone = fs.readFileSync(
  "src/pages/PhoneScannerRemote.jsx",
  "utf8",
);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const feature = fs.readFileSync(
  "docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md",
  "utf8",
);

test("phone scanner route remains public and minimal", () => {
  const routeIndex = app.indexOf('path="/phone-scanner"');
  const authIndex = app.indexOf("<Route element={<RequireAuth/>}>");
  assert.ok(routeIndex > 0);
  assert.ok(authIndex > routeIndex);
  assert.doesNotMatch(phone, /\.from\("products"\)|completeSale|receiveStock/);
});

test("HashRouter deep link is correct", () => {
  assert.match(main, /HashRouter/);
  assert.match(panel, /url\.hash\s*=\s*`\/phone-scanner\?/);
  assert.match(phone, /useSearchParams/);
  assert.doesNotMatch(phone, /window\.location\.search/);
});

test("pairing remains high entropy and temporary", () => {
  assert.match(panel, /crypto\.getRandomValues/);
  assert.match(panel, /randomToken\(24\)/);
  assert.match(panel, /10 \* 60 \* 1000/);
  assert.match(panel, /Date\.now\(\) >= pairing\.expiresAt/);
});

test("existing Supabase Realtime Broadcast remains the only transport", () => {
  assert.match(panel, /supabase\s*\.channel/);
  assert.match(phone, /supabase\s*\.channel/);
  assert.doesNotMatch(panel, /\.insert\(|\.upsert\(|\.update\(/);
  assert.doesNotMatch(phone, /\.insert\(|\.upsert\(|\.update\(/);
});

test("delivery retries are idempotent by event id", () => {
  assert.match(phone, /SEND_ATTEMPTS = 3/);
  assert.match(phone, /waitForAck/);
  assert.match(panel, /ackCacheRef/);
  assert.match(panel, /priorAck/);
  assert.match(panel, /eventId/);
});

test("POS exposes clear scanner tabs and preserves USB scanner", () => {
  assert.match(pos, /role="tablist"/);
  assert.match(pos, /Barcode Scanner/);
  assert.match(pos, /This Device Camera/);
  assert.match(pos, /Use Phone/);
  assert.match(pos, /useScanner/);
  assert.match(pos, /lastScan/);
});

test("QR renderer remains local open source", () => {
  assert.equal(pkg.dependencies["qrcode.react"], "4.2.0");
  assert.match(panel, /QRCodeSVG/);
});

test("documentation describes router repair and no new paid service", () => {
  assert.match(feature, /HashRouter/);
  assert.match(feature, /#\/phone-scanner/);
  assert.match(feature, /No new paid service/);
});
