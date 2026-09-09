import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8"),host=r("src/components/GlobalPhoneScannerHost.jsx"),remote=r("src/pages/PhoneScannerRemote.jsx"),setup=r("src/pages/PhoneScannerSetup.jsx"),layout=r("src/components/Layout.jsx"),ctx=r("src/context/ScannerContext.jsx"),pos=r("src/pages/POS.jsx");
test("persistent global pairing",()=>{assert.match(host,/wsp_global_phone_scanner_pairing_v1/);assert.match(host,/Uint8Array\(24\)/);assert.doesNotMatch(host,/expiresAt|10 \* 60 \* 1000/);assert.match(setup,/Disconnect Phone/);});
test("global host injects scanner events",()=>{assert.match(host,/injectScan\(barcode/);assert.match(ctx,/injectScan/);assert.match(layout,/GlobalPhoneScannerHost/);});
test("phone ACK/retry remains idempotent",()=>{assert.match(remote,/SEND_ATTEMPTS = 3/);assert.match(remote,/eventId = crypto\.randomUUID/);assert.match(remote,/barcode-ack/);});
test("host has no direct business-table mutation",()=>{assert.doesNotMatch(host,/supabase\s*\.\s*from\s*\(|completeSale|receiveStock|create_new_product|update_product_details/);});
test("POS no longer owns phone pairing panel",()=>{assert.doesNotMatch(pos,/PhoneToPcScannerPanel|Phone → this PC/);});
