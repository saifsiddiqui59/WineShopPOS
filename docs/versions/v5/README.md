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
