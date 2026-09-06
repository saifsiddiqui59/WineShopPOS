# Chapter 16 — Professional Barcode Scanner

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Make a normal USB/Bluetooth HID scanner feel like a commercial POS device.

## Implementation
- `src/context/ScannerContext.jsx` owns a global capturing `keydown` listener.
- Rapid key sequences are distinguished from human typing using average inter-key delay.
- Enter terminates a scan.
- The input field value present before scanning is snapshotted and restored when the sequence is classified as scanner input. This prevents the completed barcode from remaining in discount, payment-reference, search or other fields.
- Once the sequence is confidently scanner-like, later characters are prevented immediately.
- `src/pages/POS.jsx` subscribes to the scanner event, looks up an active product and auto-adds it.
- Repeated barcode scans increment cart quantity.
- WebAudio provides separate success/error tones.
- Unknown scans show a large PRODUCT NOT FOUND banner and link to Add Product with `?barcode=` prefilled.
- `ScannerSettings.jsx` exposes minimum barcode length, average key-gap threshold and reset interval plus live diagnostics.

## Operational note
The scanner should be configured in its manufacturer settings to append Enter/CR after each barcode.

## Tests
1. Focus Discount and scan `8900000010016`; discount must remain unchanged after the scan.
2. Scan the same barcode twice; cart quantity becomes 2.
3. Slowly type six digits; it must not be treated as a scan.
4. Scan an unknown barcode; error tone + Add Product action appears.
5. Create the unknown product; barcode is already populated.
