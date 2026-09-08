# V5.19 — Global Phone Scanner + Mobile 1D Decoder + Product Image Flow

Date: 2026-09-08

Starting V5 SHA:
`41755f157e330cd0eb3cb8667ee6ea063389d25c`

## Why this release exists

Human UAT after V5_17 confirmed that the mobile camera could open but still did
not reliably recognise a real bottle/can barcode.

The V5_19 design also changes the separate-phone scanner from a POS-owned pairing
panel into a persistent, application-level barcode-machine connection managed
from Operations.

## Mobile decoder

The shared camera scanner now:
- uses `BrowserMultiFormatOneDReader` as the primary product-barcode decoder;
- extracts an enlarged center ROI from the live camera;
- tries wide, tight, high-contrast, inverted and rotated ROI passes;
- keeps `BrowserMultiFormatReader` as a secondary fallback;
- keeps native `BarcodeDetector` as another independent signal;
- requests `facingMode: environment` before relying on camera labels;
- preserves continuous focus when supported;
- preserves manual Zoom + / Zoom -, Torch, Switch Camera and typed barcode;
- does not force automatic zoom.

No paid barcode-recognition service is added.

## Global phone scanner

PC:
`Operations -> Phone Scanner`

- Connect Phone creates a 192-bit Web Crypto pairing secret plus a random session id.
- The pairing is saved locally on the authenticated PC browser.
- The authenticated `GlobalPhoneScannerHost` remains mounted across protected modules.
- Phone scans are injected through `ScannerContext`, the same application scanner
  event layer already used by barcode-aware pages.
- Replace / Reconnect rotates the pairing.
- Disconnect Phone removes the PC pairing/listener.

Phone:
- the HashRouter QR remains `#/phone-scanner?...`;
- the phone saves the paired PC locally;
- Auto Scan and manual Scan Barcode are both available;
- delivery retries up to three times with event-id acknowledgement/dedupe;
- Forget This PC removes the saved phone-side pairing.

### Pairing lifetime change

V5_19 intentionally supersedes the V5_14/V5_16 **10-minute pairing lifetime**.
The secret remains 192-bit and unguessable, but it persists until the user
explicitly Disconnects/Replaces the phone on the PC or uses Forget This PC on
the phone.

The QR/token is still a possession credential and must not be shared.

The phone still has no billing authority and no product/customer/inventory table
access. The authenticated PC remains authoritative for page logic, stock,
shift and sale behavior.

## Product Image / Add Product

V5_19 simplifies duplicate controls without replacing the proven image workflow:
- the duplicate top Product verification control is removed;
- one `Find Product / Image` action remains in the Product Image section;
- `OcrProductImagePreview` continues automatic pre-save preview;
- secure `importCandidateImage` selection remains;
- Add Product post-save `autoFindProductImage({ replace:false })` remains;
- the existing barcode input keeps exactly one `data-scanner-capture="barcode"`;
- image processing never changes barcode.

## Cost / infrastructure

- new dependency: NONE
- new paid service: NONE
- new DB object: NONE
- new Supabase/Azure service: NONE
- V5 frontend deploy: YES
- PROD deploy: NO

## Mandatory human UAT

1. Real EAN-13 bottle/can using This Device Camera.
2. Verify expected rear camera metadata and Switch Camera behavior.
3. USB/Bluetooth scanner still adds the correct product.
4. Operations -> Phone Scanner -> Connect Phone.
5. Pair once and navigate across protected modules; pairing remains active.
6. Scan known/unknown/repeated barcodes from the phone on barcode-aware pages.
7. Verify no duplicate event is processed for a retried phone scan.
8. Disconnect Phone and verify the old phone can no longer inject scans.
9. Replace/Reconnect and verify the old pairing no longer controls the new listener.
10. Add Product shows one `Find Product / Image` action.
11. Pre-save Product Image preview still appears automatically.
12. Save without explicit image and verify post-save Product Image workflow.
13. Verify PROD remains unchanged.
