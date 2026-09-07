# WineShopPOS V5

Status: ACTIVE DEV / QA

## Inherited PROD baseline

V5 was created directly from current PROD/main.

Inherited main SHA:

`770d8db9674151aebe249976a82d042cd57cfed1`

V5 starts with the complete current PROD application source, including all
promoted V4 functionality, PROD hotfixes, Purchase Verification and the current
working PROD OCR source.

## Environment isolation

V5 MUST NOT connect to PROD Supabase.

DEV / QA Supabase:

- Project: WineshopPOS_DEV
- Project ref: juhcypzoacauzmtzqnwd
- URL: https://juhcypzoacauzmtzqnwd.supabase.co

V5 must use a dedicated DEV Invoice API configured for this DEV Supabase project.
The existing PROD Invoice API must not be rebound or modified for DEV.

## Initial V5 gate

Before new Purchase/OCR feature development:

1. verify V5 frontend parity with inherited PROD source;
2. bind V5 runtime to WineshopPOS_DEV;
3. deploy an isolated DEV Invoice API from current PROD Invoice API source;
4. verify authenticated V5 OCR;
5. regression-test invoices 15983 and 16845;
6. create a visibly-labelled V5 QA preview;
7. only then begin Purchase Receiving Workspace changes.

PROD remains untouched until explicit promotion.

<!-- V5_DEV_RUNTIME_COMPLETE_20260907 -->
## V5 DEV runtime — completed 2026-09-07

- V5 application source/features remain PROD-derived.
- Existing WineshopPOS_DEV business data was retained; PROD business data was not copied.
- Supabase DEV ref: `juhcypzoacauzmtzqnwd`.
- Existing DEV `ocr-invoice` Edge Function retained.
- Dedicated DEV Invoice API: `https://wsp-v5-invoice-dev-53b6e9a1.azurewebsites.net`.
- Dedicated private DEV invoice storage: `wspv5invdev53b6e9a1/invoice-documents`.
- DEV Invoice API uses the inherited current Invoice API source with managed identity against DEV storage.
- PROD Invoice API and PROD invoice storage were not rebound.
- V5 browser code fails closed when `VITE_INVOICE_API_URL` is missing instead of falling back to PROD.
<!-- /V5_DEV_RUNTIME_COMPLETE_20260907 -->
