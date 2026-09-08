# V5.17 — Mobile Camera Barcode Recognition Repair

Date: 2026-09-08

Starting V5 SHA:
`d7beca07986fe48c7dbc79be937e594b49ae5b46`

## Human UAT failure

The mobile camera opened but did not identify real product barcodes reliably.

## Source findings

The prior scanner had native BarcodeDetector plus ZXing, but:
- native scanning waited 6.5 seconds before switching;
- ZXing first opened `decodeFromVideoDevice` with default camera capture settings;
- high-resolution `decodeFromConstraints` was only an error fallback;
- native -> ZXing fallback could lose the latest rear-camera device identity;
- no center-ROI native second pass, continuous-focus request or zoom assist.

## Repair

- high-resolution 1920x1080 / 30fps rear-camera constraints are now the primary
  ZXing path;
- `decodeFromVideoDevice` is compatibility fallback only;
- native BarcodeDetector scans full frame plus enlarged center ROI;
- native-to-ZXing switch is shortened to 3.2 seconds;
- continuous autofocus is requested where available;
- conservative 1.25x optical zoom assist is applied where available;
- Zoom + / Zoom - controls are exposed when supported;
- rear-camera ID is carried into fallback;
- torch, camera switching, Retry Scanner and typed barcode remain;
- scan target uses `object-fit: contain` so the complete barcode is not visually
  cropped from the preview.

## Cost / infrastructure

- new paid service: NONE
- new dependency: NONE
- new Supabase object/function: NONE
- new Azure resource: NONE
- V5 frontend deploy: YES
- PROD deploy: NO

## Human retest

Use a real EAN-13 bottle/can barcode:
1. open This Device Camera or phone scanner camera;
2. hold 10–20 cm away;
3. keep the complete barcode inside the rectangle;
4. verify automatic recognition;
5. try glare/low-light with Torch;
6. test Zoom + if focus struggles;
7. verify known barcode reaches POS;
8. verify physical USB scanner is unaffected.
