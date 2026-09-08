import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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
const manual = fs.readFileSync(
  "docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md",
  "utf8",
);
const feature = fs.readFileSync(
  "docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md",
  "utf8",
);

test("phone scanner route is public but exposes only scanner page", () => {
  const routeIndex = app.indexOf('path="/phone-scanner"');
  const authIndex = app.indexOf("<Route element={<RequireAuth/>}>");
  assert.ok(routeIndex > 0);
  assert.ok(authIndex > routeIndex);
  assert.match(phone, /This phone only scans and sends barcode numbers/);
  assert.doesNotMatch(phone, /\.from\("products"\)|completeSale|receiveStock/);
});

test("pairing uses high entropy Web Crypto token and 10 minute expiry", () => {
  assert.match(panel, /crypto\.getRandomValues/);
  assert.match(panel, /randomToken\(24\)/);
  assert.match(panel, /10 \* 60 \* 1000/);
  assert.match(panel, /Date\.now\(\) >= pairing\.expiresAt/);
  assert.match(panel, /pos-phone:/);
});

test("phone and PC use existing Supabase Realtime broadcast only", () => {
  assert.match(panel, /supabase\s*\.channel/);
  assert.match(panel, /event: "barcode"/);
  assert.match(phone, /supabase\s*\.channel/);
  assert.match(phone, /event: "phone-heartbeat"/);
  assert.match(phone, /event: "barcode"/);
  assert.doesNotMatch(panel, /\.insert\(|\.upsert\(|\.update\(/);
  assert.doesNotMatch(phone, /\.insert\(|\.upsert\(|\.update\(/);
});

test("phone scanner automatically reopens after a successful scan", () => {
  assert.match(phone, /setScannerOpen\(false\)/);
  assert.match(phone, /450/);
  assert.match(phone, /setScannerKey/);
  assert.match(phone, /Start Scanning/);
});

test("POS clearly separates same-device camera, phone-to-PC and USB scanning", () => {
  assert.match(pos, /Camera Scan on This Device/);
  assert.match(pos, /PhoneToPcScannerPanel/);
  assert.match(pos, /Phone as Barcode Scanner|PhoneToPcScannerPanel/);
  assert.match(pos, /Physical USB\/keyboard barcode scanners continue/);
  assert.match(pos, /useScanner/);
  assert.match(pos, /lastScan/);
  assert.doesNotMatch(pos, /<strong>Mobile Barcode Scanner<\/strong>/);
});

test("Quick Products are collapsible while search results stay direct", () => {
  assert.match(pos, /pos-quick-products-tools/);
  assert.match(pos, /<details className="panel pos-v5h-customer-tools pos-quick-products-tools">/);
  assert.match(pos, /Search Results/);
});

test("QR renderer is local open source dependency", () => {
  assert.equal(pkg.dependencies["qrcode.react"], "4.2.0");
  assert.match(panel, /QRCodeSVG/);
});

test("documentation explains exact phone to PC behavior", () => {
  assert.match(manual, /Phone as Barcode Scanner/);
  assert.match(manual, /separate phone/);
  assert.match(manual, /10 minutes/);
  assert.match(feature, /Supabase Realtime Broadcast/);
  assert.match(feature, /temporary pairing secret/);
  assert.match(feature, /No new paid service/);
});
