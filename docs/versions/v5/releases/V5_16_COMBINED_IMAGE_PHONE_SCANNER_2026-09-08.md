# V5.16 — Combined Product Image Auto-load + Phone Scanner Repair

Date: 2026-09-08

Starting V5 SHA:
`d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`

## Product Image

- Add Product preview auto-loads from existing discovery.
- Post-create image persistence uses the same `autoFindProductImage({replace:false})`
  path as Products page when no explicit image was supplied.
- Upload/Open Camera/review choices remain.
- Barcode remains unchanged.

## Phone scanner

Root cause repaired:
- app is HashRouter;
- old QR used BrowserRouter-style `/phone-scanner?...`;
- old phone page read `window.location.search`;
- new QR uses `#/phone-scanner?...`;
- phone reads `useSearchParams`.

Reliability:
- three send attempts;
- explicit PC acknowledgement;
- duplicate event ID replays prior acknowledgement, avoiding duplicate processing;
- phone shows actual PC result.

UX:
- Barcode Scanner / This Device Camera / Use Phone tabs;
- high-contrast dark-mode scanner text/status;
- improved dark-mode module tabs.

## Infrastructure / cost

- DB objects: NONE
- Supabase migration: NONE
- Edge Function: NONE
- Azure resource: NONE
- new paid service: NONE
- V5 frontend deploy: YES
- PROD deploy: NO

## Human UAT required

1. Add Product Product Image auto-load.
2. Saved new-product image persistence.
3. Barcode unchanged.
4. Use Phone QR opens correct phone scanner.
5. Phone shows Connected to PC.
6. Known barcode adds exactly once and phone gets product acknowledgement.
7. Unknown barcode reports Product Not Found.
8. Retry/no-ack path does not duplicate processing.
9. New QR / Disconnect invalidates old PC listener.
10. USB/Bluetooth barcode machine still works.
11. This Device Camera still works.
12. Dark-mode scanner instructions and tabs are readable.
