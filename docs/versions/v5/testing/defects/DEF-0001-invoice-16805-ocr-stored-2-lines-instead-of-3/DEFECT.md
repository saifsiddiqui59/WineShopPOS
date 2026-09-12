# DEF-0001 — Invoice 16805 OCR stored 2 lines instead of 3

**Sr No:** 1
**Status:** RESOLVED
**Classification:** APP_OCR_DATA
**Severity:** HIGH
**Environment:** V5 DEV/QA (`juhcypzoacauzmtzqnwd`)
**Resolved:** 2026-09-12
**PROD:** untouched

## Original defect

Real invoice **16805** physically contains **3 product rows**, but the original V5 UAT found stored OCR evidence with only **2 normalized item lines**.

Original certification failure:

```text
[V5-UAT] FAIL: 16805: existing OCR evidence has 2 lines; expected 3.
```

Expected physical product rows:

1. DING DONGS FORTIFIED WINE
2. DYNAMITE XXX FORTIFIED WINE
3. GO LIMLET FORTIFIED WINE

## Resolution

The V5 OCR/normalization path now preserves all **3 physical product rows** from invoice 16805 through the review/receiving workspace.

The finance-safety behavior was also certified for the same invoice. The printed total remains unreadable rather than being arithmetically invented or silently corrected:

- `total = null`
- `printedTotalEvidenceStatus = LABELED_TOTAL_UNREADABLE`
- `reconciliationStatus = REVIEW_PRINTED_TOTAL_UNREADABLE`
- invoice status remains `NEEDS_REVIEW`
- `purchase_id = null`
- no inventory or stock mutation occurred

This is the expected safe outcome for unreadable printed-total evidence. Invoice 16805 remains intentionally unreceived.

## Final certification evidence — 2026-09-12

Evidence source:

```text
C:\Users\Shoyeb\WineShopPOS_V5_FULL_CERT\20260912_024605
```

Certified results:

- Physical invoice 16805 preserves all 3 OCR rows.
- Focused DEF-0001 finance-evidence regression: **PASS**.
- Focused DEF-0001 finance-receive guard regression: **PASS**.
- Invoice UAT branch: **PASS**.
- Master certification: **PASS_WITH_BLOCKED_PREREQUISITES**.
- Certification failures: **0**.
- Blocked prerequisites: **3**.
- PROD attempts: **0**.
- Purchase receipt for 16805: **not performed by design**.
- Inventory/stock mutation for 16805: **none**.

## Closure decision

**DEF-0001 is RESOLVED.**

The original application defect was loss of one of the three physical invoice rows. Final certification proves that all three rows are preserved and that unreadable financial evidence is handled safely without creating a purchase or mutating stock.

The unreadable printed total is a review condition, not an unresolved recurrence of DEF-0001.

Do not create a follow-on defect solely for this certified safe `NEEDS_REVIEW` state.

PROD was not touched.
