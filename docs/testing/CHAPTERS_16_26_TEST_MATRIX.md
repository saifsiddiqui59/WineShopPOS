# Chapters 16–26 Test Matrix

## Release gate
1. `npm run build` passes.
2. `npx supabase db push --dry-run` shows the intended migration only.
3. `npx supabase db push` succeeds.
4. `npx supabase functions deploy ocr-invoice` succeeds.
5. Admin login and Chapter 15 regression still work.

## Chapter 16 Scanner
- Scan `8900000010016` with focus in Discount; barcode does not remain in Discount.
- Duplicate scan increments quantity.
- Slow human typing does not trigger scan.
- Unknown barcode opens Add Product with barcode prefilled.
- Success/error beeps are distinct.

## Chapter 17 Returns
- Pending return causes no stock movement.
- Approval restores exact quantity, refund payment and audit.
- Over-return is rejected.
- Void clean invoice restores all stock; invoice cannot be voided twice.

## Chapter 18 Shift
- Cashier cannot sell without open shift.
- Opening cash + Cash sales - Cash refunds = expected cash.
- actual/expected variance stored.
- close requires manager/admin approval.

## Chapter 19 Stock Count
- Create snapshots active SKUs.
- Scanner increments counted SKU.
- Submission fails while NULL/unseen SKUs remain.
- explicit zero action works.
- approval applies discrepancies exactly once.

## Chapter 20 Receipt
- 80mm and 58mm layouts print without clipping.
- invoice totals/payment/store header are correct.

## Chapter 21 Procurement
- PO create/send/receive.
- inventory increases only on receive.
- supplier payment reduces balance.
- supplier return reduces stock/balance.
- price history reflects invoices.

## Chapter 22 Reorder
- low-stock/high-velocity products are suggested.
- case rounding uses units_per_case.
- Create PO produces correct quantity.

## Chapter 23 Transfer
- unrelated organization shop not listed.
- request moves no stock.
- destination approval creates paired stock movements.
- insufficient stock rejects atomically.

## Chapter 24 Audit/Security
- product price edit shows before/after audit.
- cashier sees only own sales.
- cashier cannot query purchase price through get_products.
- audit page is ADMIN only.

## Chapter 25 Offline
- after prior online load, disconnect and create offline sale.
- IndexedDB record is encrypted (no plaintext cart JSON in the queue record).
- reconnect and sync creates one sale.
- repeat sync cannot duplicate client_sale_id.
- stock conflict remains CONFLICT.

## Chapter 26 OCR
- without Azure secrets returns OCR_NOT_CONFIGURED.
- with configured resource, invoice extracts fields/items.
- human review is required before Receive Stock.
- stock does not change during OCR itself.

## Regression
- login/kill switch
- product CRUD
- normal POS sale
- receive stock
- dashboard/reports
- Admin creates Manager/Cashier
- Azure static URL after deployment
