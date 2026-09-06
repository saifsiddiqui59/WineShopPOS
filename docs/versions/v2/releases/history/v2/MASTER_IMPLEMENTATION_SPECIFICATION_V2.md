# WineShopPOS — V2 Master Implementation Specification

## Operating principle

```text
FETCH
→ DISCOVER
→ CLASSIFY
→ PROTECT
→ ARCHITECT
→ IMPLEMENT
→ TEST
→ FULL APP AUDIT
→ SECURITY REVIEW
→ DOCUMENT
```

Repository evidence outranks old documentation.

Reuse working functionality instead of duplicating it.

## Requested V2 feature areas

1. Landed Cost Engine
2. Batch / Receipt Lot Tracking
3. True Stock Ageing
4. FIFO / Stock Rotation Foundation
5. Discount / Price Override Control
6. Standardized Reason Codes
7. Accountant / Tally-ready Export
8. Customer Loyalty
9. Coupons / Promotions
10. Gift Voucher / Store Credit
11. Supplier Performance Score
12. Advanced Stock Transfer
13. Approval Center Expansion
14. Leakage Shield Expansion
15. Purchase Coach Expansion

Before implementation classify every item:

```text
EXISTING
PARTIAL
MISSING
NEEDS TESTING
BROKEN
```

## Existing features are verification-first

Treat current Purchase/PO/GRN, OCR, returns/refunds, sale void, shifts,
physical counts, adjustments, multi-shop, Leakage Shield, Purchase Coach,
supplier intelligence, owner WhatsApp summary, offline, backup, scanner,
receipt printing, RLS/security and AI Owner Assistant as VERIFY/TEST/FIX
before rebuilding.

## AI

The existing production Owner Assistant must be reused.

Do not create another Function App, Foundry project/resource, model deployment
or Owner Agent.

Current next AI milestone:

- tracing
- evaluations
- quality gates
- monitoring
- Explanation/Investigation/Daily Summary verification
