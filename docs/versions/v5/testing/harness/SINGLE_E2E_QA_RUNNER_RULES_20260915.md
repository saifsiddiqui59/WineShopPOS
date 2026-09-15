# WineShopPOS V5 Single E2E QA Runner Rules — 2026-09-15

Status: **CURRENT TEST-HARNESS INSTRUCTION**

The combined business-mutating certification runs on DEV/QA only. QA ref is
`juhcypzoacauzmtzqnwd`; PROD ref `uiurgplnsgmawvxhjzzp` and the PROD website
must be blocked by the runner.

## Fresh clean baseline

When a new run is explicitly requested, reset only target-shop transactional
QA/UAT state. Preserve shop/org/auth/profile/membership/subscription state,
Product Master/categories, suppliers, reason codes, policy/settings and the
product SKU counter.

Reset sales/items/payments/returns/override requests, cashier shifts, purchases
and child rows, invoice-ingestion instances/events, FIFO allocations/receipt
lots, stock movements/counts/adjustments, purchase orders, supplier-payment
transaction rows, expenses, sales-linked commercial ledgers/redemptions, and
inventory quantity/reserved quantity to zero. Reset sale/purchase/PO counters to
zero. Do **not** reset `product_sku_counter` while products are retained.

Do not use a global schema/database TRUNCATE. Reset must be shop-scoped,
dependency-aware and verified afterward.

## Pre-existing active shift rule

A fresh E2E run owns only a shift it opened or recovered from its own run state.
Never silently adopt an older active QA shift.

A pre-existing active shift may be closed through the application UI only after
proving: same QA account/shop, zero linked sales, zero linked payments, zero
cash/UPI/card totals, zero expected cash, and a zero-value-compatible cash state.
Then open a new dedicated E2E shift before the first stress sale.

If any linked sale/payment or non-zero tender/expected amount exists, stop with
`TRIAGE_REQUIRED`. Never auto-close or repurpose a non-empty shift.

## Resume rule

Successful mutations are revalidated and skipped, never blindly replayed:
already-received invoice, committed checkout, approved return, or closed shift.
A genuinely new run requires an explicit fresh-run request plus a verified clean
QA transactional baseline.

## 2026-09-15 lessons

Run `20260915_034022` successfully received its fresh invoice, then stopped at
STRESS because QA contained an older OPEN shift. Live QA validation proved the
old shift had zero linked sales and zero tender totals. This was a correct
harness safety stop, not an application defect.

V1 also had a Node env-parser bug caused by wrong `process.argv` positions; it
returned an empty QA URL after selecting the correct env file. That failure was
harness-only and occurred before business mutation.

Truth: `VERIFIED LIVE QA STATE + RUN CHECKPOINT > HARNESS ASSUMPTION`
