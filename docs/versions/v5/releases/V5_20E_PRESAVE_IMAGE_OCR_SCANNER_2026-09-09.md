# V5.20E — Pre-save Product Image + OCR Edit Return + Full-screen Pinch Scanner + AI Gate Path Repair

Date: 2026-09-09

Starting V5 SHA:
`bd7a1fa8f5a26ccfe9b1fa12cec291b87d8d2449`

## Scope

This release closes the current V5 UAT repair as one semantic change set.

### Product Image before barcode/save

- Add Product uses the existing free-only Google Images/SerpApi path before a barcode is required.
- Search identity is Product Name + Brand + Size + package context.
- Barcode is not sent by the pre-save image-search action.
- India/Global image choices and 20-per-page chooser remain.
- Automatic pre-save search selects a preview when a safe candidate is available.
- Try Another Image / Find Product Images works before Product Master creation.
- The selected candidate cache key + candidate id are carried through Product creation.
- After Product Master creation the server applies that exact cached candidate.
- Before mutation the server verifies the saved Product Master identity still matches the pre-save search identity.
- After mutation the server re-verifies barcode, name, brand and size are unchanged.
- If exact selected-image application fails, WineShopPOS does not silently substitute a different automatic image.

### OCR

A linked OCR line now exposes Edit Product. The current invoice review snapshot is preserved before navigation. Save or Cancel from Edit Product returns to `/purchasing/ocr`.

### Mobile scanner

The V5_19 decode architecture remains unchanged:
- BrowserMultiFormatOneDReader primary
- wide/tight/high-contrast/inverted/rotated ROI passes
- BrowserMultiFormatReader fallback
- native BarcodeDetector fallback
- rear camera preference
- camera switch and torch

UX changes:
- scanner uses full `100dvh`;
- Zoom +/- buttons are removed;
- supported cameras use two-finger pinch zoom;
- duplicate scanner headings/help are removed.

### Phone Scanner

Pairing, ACK, retry, persistent pairing and global ScannerContext injection are preserved.
Phone and PC setup pages use one concise **Phone Scanner** interface.

## Deployment

- DEV Edge Function: `product-enrichment` on `juhcypzoacauzmtzqnwd`
- QA frontend: `https://wspv5qa3a5e8018.z29.web.core.windows.net/`
- PROD: read-only verification only; no mutation
