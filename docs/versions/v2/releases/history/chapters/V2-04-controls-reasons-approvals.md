# Chapter V2-04 — Controls, Reason Codes & Approvals

**Status: implemented in source; production verification required**

## N5 — Discount / Price Override Control

- Cashier discount default auto-limit: <= 5% and <= ₹500.
- Cashier item price override requires manager/admin approval.
- Manager/admin may execute authorized overrides directly with a standardized reason.
- Approval is bound to the exact cart pricing fingerprint.
- Changed cart pricing invalidates an approval.
- Approved requests are single-use.
- Offline discounts and price overrides are blocked.

## N6 — Standardized Reason Codes

Reusable reason architecture added for:

- DISCOUNT_OVERRIDE
- PRICE_OVERRIDE
- RETURN
- REFUND
- SALE_VOID
- STOCK_ADJUSTMENT
- PURCHASE_REJECTION
- TRANSFER_REJECTION
- EXPENSE_VOID
- MANUAL_CORRECTION

`OTHER` requires a note.

Historic free-text data is preserved.

## N13 — Approval Center Expansion

The existing Approval Center is reused and now also displays POS discount/price override requests.
