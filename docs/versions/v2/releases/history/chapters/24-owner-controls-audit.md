# Chapter 24 — Owner Controls & Audit

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Provide traceability for commercial operations.

## Database
`audit_logs` captures actor, action, entity, old/new JSON, metadata and time. Product/supplier/sale/purchase triggers record row changes; transactional RPCs add explicit business events for returns, voids, shifts, counts, POs, payments and transfers.

## RLS hardening
- Cashier sales SELECT is limited to own invoices.
- Sale items/payments follow accessible sales.
- Purchases and procurement data are Manager/Admin only.
- `get_products()` masks purchase price for Cashier.
- Audit is ADMIN only.

## Tests
Change selling price and verify old/new row in Audit. Approve return and verify RETURN_APPROVED event. Cashier must not see other cashier sales or purchase-cost data.
