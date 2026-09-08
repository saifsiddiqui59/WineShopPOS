# V5.14 — Phone to PC Barcode Scanner + POS Compactness

Date: 2026-09-08

Starting V5 SHA:

`618fb0d9198b94af0eb1095d2bac491c91b9c268`

## Scope

- Quick Products becomes collapsible.
- Existing camera scanner is renamed **Camera Scan on This Device** to remove ambiguity.
- Add **Phone as Barcode Scanner** pairing panel to PC POS.
- Add QR-based temporary pairing.
- Add public minimal phone scanner route.
- Send barcode numbers from phone to PC using existing Supabase Realtime Broadcast.
- Reuse existing `processBarcode()` for normal product lookup/cart behavior.
- Update user, feature, continuity, test and release documentation.

## Infrastructure

- new database migration: NONE
- new Supabase table/RPC: NONE
- new Edge Function: NONE
- new Azure resource: NONE
- new paid provider: NONE
- V5 frontend deployment: YES
- PROD deployment: NO

## Security

Pairing uses a temporary high-entropy random secret, expires after 10 minutes,
and grants no billing or inventory authority to the phone.

## Verification

Executor gates:
- root Node regression suite;
- env isolation;
- lint;
- documentation-system check;
- manual sync;
- production Vite build;
- dist markers;
- staged diff check;
- V5 live marker proof;
- PROD binding and frontend non-mutation proof.

Human UAT is still required for real phone -> PC scanning.
