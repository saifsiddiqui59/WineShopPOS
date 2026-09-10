# V5 Architecture

Status: **CURRENT V5 PROMOTION-CANDIDATE ARCHITECTURE**

V5 preserves the WineShopPOS production architecture and extends it rather than
creating a second application stack.

## Application

- React + Vite frontend.
- Route/role boundaries for cashier, manager and admin workflows.
- current application source under `src/`.

## Data and identity

- Supabase Postgres.
- Supabase Auth session / `auth.uid()`.
- shop isolation through shop membership + RLS / server-side access assertions.
- transaction-safe stock-changing RPCs rather than arbitrary browser inventory writes.
- Supabase Realtime for the paired phone barcode transport.
- version-controlled database changes under `supabase/migrations/`.

## Purchase / OCR path

Supplier invoice
-> Invoice API / OCR ingestion
-> retained `invoice_ingestions` evidence
-> Purchase Receiving Workspace
-> product/pack/barcode/financial review
-> `receive_purchase_v3`
-> `purchases` + `purchase_items`
-> inventory / stock movement / receipt-lot state
-> Purchase Verification / audited correction when required.

Purchase-originated new Product Master creation and missing-barcode assignment
are committed inside the same database transaction as successful receiving.

## Barcode paths

- USB/Bluetooth keyboard-wedge -> ScannerContext.
- local device camera -> MobileBarcodeScanner.
- paired phone -> Supabase Realtime barcode-only broadcast -> authenticated PC.
- the paired phone does not receive POS billing authority.

## Product Image path

Product Image lookup/selection is separate from barcode identity. V5 keeps the
free-only automatic Product Image workflow and does not require AI/paid fallback
for every product.

## Runtime isolation

Non-main V5:
- DEV Supabase `juhcypzoacauzmtzqnwd`
- dedicated DEV Invoice API
- V5 QA static site.

`main`:
- PROD-only environment values and PROD services.

A PROD build must fail closed if a DEV project ref or DEV Invoice API is present.
