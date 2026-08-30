# Chapter V2-06 — Supplier & Purchase Intelligence

**Status: implemented in source; production verification required**

## N11 Supplier Performance Score

0–100 supplier score uses:

- PO fill rate
- on-time receipt rate
- purchase-return rate
- purchase-price stability
- purchase activity

The score is a decision-support signal, not an accusation or contractual rating.

## N15 Purchase Coach Expansion

The coach uses:

- current stock
- 30-day sales velocity
- estimated days of cover
- recent landed/purchase cost
- best recent supplier
- estimated gross margin

It identifies:

- REORDER
- NO_MOVEMENT
- OVERSTOCK
- MARGIN_RISK

Reorder suggestions target approximately 14 days of stock cover.
