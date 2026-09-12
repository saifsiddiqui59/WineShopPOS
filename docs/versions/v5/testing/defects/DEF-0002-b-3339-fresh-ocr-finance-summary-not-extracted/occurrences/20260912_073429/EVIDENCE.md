# DEF-0002 Occurrence — 2026-09-12 07:34:29 UTC

## Environment

V5 DEV/QA only. PROD untouched.

## DEV ingestion

```text
id: 3742e84d-331a-47f6-b305-82641af9cc8f
invoice: B-3339
created_at: 2026-09-12 07:34:29.116878+00
review_status: NEEDS_REVIEW
purchase_id: null
```

## Product extraction

```text
item count = 14
subtotal / lineProductValue = 86715
```

## Physical finance summary

```text
discount = 599
freight = 700
stamp = 5
TCS = 1737
total = 88558
```

## Current OCR finance state

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

Observed stored evidence:

```text
TCS+EC+SC -> 1737
TOTAL
(-)DISCOUNT -> X6/15.00
```

## Safety result

The application failed closed:

```text
review_status = NEEDS_REVIEW
purchase_id = null
stock mutation = none
```

Fail-closed behavior is correct as a safety boundary, but it is **not** the expected golden-invoice behavior for B-3339. DEF-0002 remains OPEN until fresh-clean OCR produces reliable finance `MATCH` and the receipt completes exactly once.
