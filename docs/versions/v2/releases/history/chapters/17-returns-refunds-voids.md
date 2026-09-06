# Chapter 17 — Returns, Refunds & Voids

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Restore inventory and payment history safely rather than editing past sales.

## Database
- `sale_return_requests`
- `sale_return_items`
- RPCs: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.

## Workflow
Cashier can request a return. Stock does **not** move at request time. Manager/Admin approval adds stock, creates `CUSTOMER_RETURN` stock movements and records a `REFUND` payment. Refund value is allocated using the original sale's effective discount ratio. Full returned quantity marks the sale RETURNED; otherwise PARTIAL_RETURN.

Void is Manager/Admin only and only for a clean COMPLETED invoice without return activity. It restores all items and records `SALE_VOID` movements plus refund payment.

## Tests
- Request 1 of 2 sold units: stock unchanged while PENDING; +1 after approval.
- Attempt a second return beyond remaining quantity: rejected.
- Reject request: stock/payment unchanged.
- Void clean invoice: all stock restored and status VOID.
