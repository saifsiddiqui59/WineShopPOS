# DEF-0002 — Fresh OCR of invoice B-3339 fails to extract finance summary

**Sr No:** 2
**Status:** OPEN
**Classification:** APP_OCR_DATA
**Severity:** HIGH
**Environment:** V5 DEV/QA (`juhcypzoacauzmtzqnwd`)
**PROD:** untouched

## Defect statement

A fresh-clean OCR of golden invoice **B-3339** correctly preserves all **14 product rows** and product subtotal **86715**, but the finance-summary extractor does not recover the printed discount, freight, stamp duty, or final payable total.

B-3339 is a golden receipt invoice. It must **not** be accepted as a generic `SAFE_REVIEW` success.

## Physical finance summary

- Product subtotal: **86715**
- Discount: **599**
- Freight: **700**
- Stamp: **5**
- TCS: **1737**
- Final total: **88558**

## Current fresh OCR failure

```text
cashDiscountAmount = 0
freightAmount = 0
stampDutyAmount = 0
tcsAmount = 1737
printedTotalRaw = "X6/15.00"
total = null
calculatedInvoiceTotal = 88452
printedTotalEvidenceStatus = LABELED_TOTAL_UNREADABLE
reconciliationStatus = REVIEW_PRINTED_TOTAL_UNREADABLE
```

Latest DEV ingestion:

```text
id = 3742e84d-331a-47f6-b305-82641af9cc8f
invoice = B-3339
review_status = NEEDS_REVIEW
purchase_id = null
created_at = 2026-09-12 07:34:29.116878+00
```

No purchase/stock mutation occurred.

## Root-cause direction

The stored evidence shows Azure merging finance-summary semantics:

```text
TCS+EC+SC -> 1737
TOTAL
(-)DISCOUNT -> X6/15.00
```

Current extraction gives structured table evidence precedence and allows a compound `TOTAL / DISCOUNT` label to mask direct page-line finance evidence. It also lacks exact bare-label support for the short `DISCOUNT`, `FREIGHT`, and `STAMP` labels used by this invoice.

The fix must use directly associated OCR label/value evidence, not arithmetic reconstruction.

## Required behavior

- recover Discount **599**
- recover Freight **700**
- recover Stamp **5**
- recover TCS **1737**
- recover final payable total **88558**
- reconciliation = `MATCH`
- do not invent any finance value if direct evidence is absent/ambiguous
- keep DEF-0001 / invoice 16805 fail-closed protections unchanged

## Acceptance criteria

Fresh-clean certification must prove all three branches:

```text
16845  -> scan -> leave -> revisit -> same ingestion -> receive -> PASS
B-3339 -> fresh OCR -> finance MATCH -> receive -> PASS
16805  -> fresh OCR -> unsafe finance blocked -> PASS_SAFE_REVIEW
```

For B-3339 specifically:

- fresh OCR returns 14 physical product rows
- finance fields equal the physical printed values above
- printed total evidence is reliable
- reconciliation is `MATCH`
- purchase is received exactly once
- purchase lines / stock posting are correct and non-duplicated
- focused DEF-0002 regression passes
- relevant master certification passes

Only then mark DEF-0002 `RESOLVED`.


## Live recurrence after first DEF-0002 fix

Fresh physical OCR on DEV OCR v11 still failed B-3339.

The normalized invoice persisted the same `88558` evidence as both discount and freight, while the final printed-total evidence became `#6821`. The invoice remained `NEEDS_REVIEW` with no purchase.

This occurrence proves the first focused regression was too synthetic. Further finance-parser work must use the permanent real Azure fixtures in `tests/fixtures/ocr/`, not hand-created ideal coordinates.

DEF-0002 remains **OPEN**. No DEF-0003 is created.
