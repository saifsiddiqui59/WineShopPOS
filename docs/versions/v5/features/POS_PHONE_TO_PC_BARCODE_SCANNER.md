# V5 POS — Phone as Barcode Scanner

## Status

V5 QA feature. Human UAT required before V5 closure.

## User goal

Allow a **separate phone** to behave like a wireless barcode gun for the
WineShopPOS POS running on a PC.

This is different from **Camera Scan on This Device**, which uses the camera
attached to the device that is already running the POS.

## POS scanning modes

WineShopPOS POS now keeps three scanning paths:

1. physical USB/Bluetooth keyboard-wedge scanner -> existing global scanner path;
2. Camera Scan on This Device -> existing camera barcode component;
3. Phone as Barcode Scanner -> separate phone sends scanned barcode numbers to the paired PC.

All three end at the existing POS `processBarcode()` path.

## User flow

PC:

`POS & Billing -> Phone as Barcode Scanner -> Connect Phone Scanner`

The PC creates a temporary QR code.

Phone:

1. scan the QR using the phone camera app;
2. open the WineShopPOS phone scanner page;
3. select **Start Scanning**;
4. scan product barcodes.

Each decoded barcode is transmitted to the paired PC. The PC performs the
normal product lookup, stock check, shift check, cart mutation and beep.

## Quick Products

Quick Products are collapsed by default to reduce cashier-screen clutter.
Search results remain direct and visible when the cashier types in product search.

## Architecture

### Components

- `src/components/PhoneToPcScannerPanel.jsx` — PC pairing/session UI.
- `src/pages/PhoneScannerRemote.jsx` — minimal public phone scanner surface.
- `src/pages/POS.jsx` — receives remote barcode and passes it to `processBarcode()`.
- `src/components/MobileBarcodeScanner.jsx` — barcode camera decoder reused on the phone.
- `src/App.jsx` — public `/phone-scanner` route.

### Transport

Existing **Supabase Realtime Broadcast** is used.

No database table, migration, RPC, Edge Function, Azure Function, queue or
additional provider is created for this feature.

The pairing topic contains:

- shop id;
- random session id;
- 192-bit random temporary pairing secret.

Pairing lifetime: **10 minutes**.

## Security controls

- pairing secret is generated with browser Web Crypto;
- QR is a possession credential and must not be shared;
- the PC accepts only messages on its exact random topic;
- the PC ignores messages after expiry;
- Disconnect/New Pairing invalidates the current PC listener;
- duplicate remote events are ignored by event id;
- the public phone page does not expose product lists, prices, inventory,
  customers, sale completion or receiving;
- phone page sends barcode numbers only;
- billing authorization, shift enforcement, stock checks and product lookup
  remain on the authenticated PC POS.

This design intentionally avoids giving the phone independent billing authority.

## Cost / provider rule

**No new paid service is introduced.**

The feature reuses the already-connected Supabase project and its Realtime
capability. QR rendering is local using the open-source `qrcode.react` package.

There is no automatic paid fallback or new card-required provider.

## Failure behavior

If Realtime is unavailable:

- Phone as Barcode Scanner shows a connection error;
- physical USB scanner still works;
- Camera Scan on This Device still works;
- normal POS product search still works.

## Traceability

Feature:
`Phone as Barcode Scanner`

Page/route:
- PC: `/pos`
- phone: `/phone-scanner?...temporary pairing parameters...`

Source:
- `src/pages/POS.jsx`
- `src/components/PhoneToPcScannerPanel.jsx`
- `src/pages/PhoneScannerRemote.jsx`
- `src/components/MobileBarcodeScanner.jsx`
- `src/App.jsx`

External service:
- existing Supabase Realtime Broadcast only

Tables/RPCs:
- none added by this feature

Migration:
- none

Automated tests:
- `tests/v5PhoneToPcScanner.test.mjs`
- `tests/v5_13E_continuity_uat.test.mjs`

Release:
- `docs/versions/v5/releases/V5_14_PHONE_TO_PC_SCANNER_2026-09-08.md`

## Human UAT

1. Open PC POS and create a phone pairing.
2. QR renders and expires in 10 minutes.
3. Open QR on a separate phone.
4. Phone connects and starts camera scanning.
5. Scan a known barcode; PC adds the correct product.
6. Scan the same barcode again; PC quantity increases.
7. Scan an unknown barcode; PC shows PRODUCT NOT FOUND.
8. Disconnect PC pairing; old phone link no longer affects POS.
9. Generate a new pairing; old pairing remains ineffective.
10. Verify USB scanner still works.
11. Verify Camera Scan on This Device still works.

## V5_16 functional repair — HashRouter + reliable acknowledgement

Starting parent:
`d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`

Human UAT after V5_14C failed. Source inspection found the main functional defect:
WineShopPOS uses React Router **HashRouter**, but the pairing QR was built as a
normal path/query and the phone page read `window.location.search`.

V5_16 changes the link contract to:

`https://<v5-host>/#/phone-scanner?session=...&token=...&shop=...&expires=...`

The phone route reads the query through React Router `useSearchParams`.

### Delivery reliability

- each phone scan receives a unique event ID;
- phone attempts delivery up to three times while waiting for PC acknowledgement;
- PC caches acknowledgement by event ID;
- retry of the same event ID replays the acknowledgement instead of processing
  the barcode twice;
- phone shows PC added / rejected / no acknowledgement;
- PC result includes Product Not Found or product-added outcome.

### UX

POS uses one scanner-method panel with real tabs:

1. **Barcode Scanner** — physical USB/Bluetooth keyboard-style scanner;
2. **This Device Camera** — camera on the device currently showing POS;
3. **Use Phone** — separate phone acts as the wireless barcode gun.

Dark-mode scanner instructions, statuses and module tabs use explicit high
contrast.

### Security / cost

The existing 192-bit temporary secret and 10-minute expiry remain.
The phone has no independent billing authority and no product/inventory DB access.

**No new paid service** and no new backend/cloud resource are introduced.

### Human UAT

Repair is implemented, but **human retest is required** before marking this
feature passed.

## V5_17 mobile camera recognition repair

Human retest after V5_16D reported that the camera opened but did not identify a
real product barcode reliably.

V5_17 keeps the same phone-to-PC pairing/acknowledgement architecture and repairs
the shared `MobileBarcodeScanner` recognition layer:

- primary ZXing capture is high-resolution rear-camera `decodeFromConstraints`;
- native BarcodeDetector uses full frame plus center-region second pass;
- native fallback changes to ZXing after about 3.2 seconds when no code is found;
- continuous focus and conservative optical zoom assist are requested when the
  browser/camera supports them;
- user gets Zoom + / Zoom -, Torch, Switch Camera and Retry Scanner where available;
- no paid barcode recognition provider is used.

This repair applies both to **This Device Camera** and the separate-phone scanner
because both use the same `MobileBarcodeScanner` component.

**Human retest remains required.**
