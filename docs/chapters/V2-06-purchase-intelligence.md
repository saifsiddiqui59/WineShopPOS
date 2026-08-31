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

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## OCR-first bulk Product Master onboarding

Invoice OCR can hand all unresolved product descriptions to Product Master in one
reviewed batch. Bulk-created Products receive automatic internal SKUs and may
temporarily have no barcode. Created Product IDs return to the corresponding OCR
line indexes, after which the existing quantity/price confirmation, alias learning
and Receive Stock handoff continue unchanged.

The OCR review state remains `wineshop_ocr_review_state`; the purchase draft is
still created only after every invoice line is resolved and confirmed.
