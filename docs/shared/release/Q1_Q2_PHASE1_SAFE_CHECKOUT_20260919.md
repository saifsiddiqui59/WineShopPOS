# Q1/Q2 Phase 1 — Safe Checkout

Date: 2026-09-19

## Scope completed by this patch

- Persistent checkout identity before online submission.
- Server-side canonical checkout payload and idempotency conflict protection.
- Same checkout ID retries resolve to one sale.
- Failed server-side checkout is persisted as FAILED and can be retried with the same payload.
- Ambiguous network outcome becomes UNKNOWN; UI says not to repeat payment.
- Browser recovery journal is encrypted in IndexedDB.
- Authoritative receipt is loaded from one database RPC snapshot.
- POS stays on a SALE COMPLETED screen instead of navigating away.
- Auto Print OFF still shows the receipt.
- Auto Print ON records the print request locally before invoking the browser print dialog.
- Scanner/cart mutation is blocked while an unresolved/confirmed checkout is active.
- `refreshAll()` is no longer inside the financial success/failure boundary.

## Backend deployment status

QA migration:
`20260919100827_checkout_transaction_safety_v1`

PROD migration already live before this frontend release:
`20260919102016_checkout_transaction_safety_v1`

The PROD backend was rollback-tested for same-ID idempotency, changed-payload conflict rejection, failed-attempt resolution and authoritative receipt output.

This frontend release does not call `supabase db push` and does not replay the PROD migration.

## Important release gate

Production Supabase backend was already modified through the controlled migration above; this release changes only the frontend/source tracking.

A parity check found that QA and PROD currently differ for several pre-existing financial RPCs, including:

- `business_analytics`
- `complete_sale_v3`
- `owner_center_summary`
- `report_sales_page`
- `void_expense`

`complete_sale_v4` itself matched.

Do not promote Q1 reporting changes or this checkout backend to PROD until the Phase 0 parity/source-history gate is deliberately resolved and QA end-to-end tests pass.

## Still intentionally outside Phase 1

- Financial event journal.
- Exact line-level refund/reversal allocation.
- Mixed-tender reversal engine.
- Offline price-freeze server sync.
- Midnight `CLOSE_REQUIRED`.
- Terminal watermarks/business-day FINAL lifecycle.
- Q1 Today/Owner/Reports canonical financial snapshot.

Those belong to later phases after parity.
