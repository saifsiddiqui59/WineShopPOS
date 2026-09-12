# DEF-0002 Occurrence — fresh real DEV OCR after first extraction fix

**Timestamp:** 2026-09-12 08:42:32 UTC
**Commit under test:** `449584d276832f375b21aa45cae965fcd0549bae`
**DEV OCR:** version 11
**Environment:** DEV/QA only
**PROD:** untouched

## Ingestion

```text
id = b2c8dd1e-a8ea-48d7-bb10-d28b2c07066c
invoice = B-3339
review_status = NEEDS_REVIEW
purchase_id = null
```

## Live normalized result

```text
item count = 14
subtotal = 86715

cashDiscountAmount = 88558       WRONG
freightCartingAmount = 88558     WRONG
stampDutyAmount = 0              WRONG
tcsAmount = 1737                 CORRECT
printedTotalRaw = "#6821"        WRONG
total = null
calculatedInvoiceTotal = 88452
reconciliationStatus = REVIEW_PRINTED_TOTAL_UNREADABLE
```

Persisted evidence:

```text
(-)DISCOUNT -> 88558
(+)FREIGHT -> 88558
TCS+EC+SC -> 1737
Round Off -> 0
TOTAL -> #6821
```

Physical expected:

```text
discount = 599
freight = 700
stamp/TP fee = 5
TCS = 1737
total = 88558
```

## Classification

This is the same existing **DEF-0002**. Do not create DEF-0003.

The failure is already persisted inside `normalized_invoice.financialAdjustments` and `review_draft`; therefore it is not created by the Playwright receiving test.

The first DEF-0002 regression used idealized synthetic geometry and was insufficient.

## Next step

Real Azure structural evidence for 16845, B-3339 and 16805 is captured under:

```text
tests/fixtures/ocr/
```

B-3339 geometry diagnostics are stored beside this occurrence in `B3339_AZURE_GEOMETRY.md`.

No finance parser change is made during this capture stage. DEF-0002 remains OPEN until the parser is redesigned and replayed against these exact fixtures before another live deployment.
