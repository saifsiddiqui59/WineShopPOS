# DEF-0002 Source Context

## Confirmed DEV state

Fresh B-3339 ingestion `3742e84d-331a-47f6-b305-82641af9cc8f` is `NEEDS_REVIEW` with `purchase_id = null`.

The normalized invoice has:

- 14 items
- `lineProductValue = 86715`
- `cashDiscountAmount = 0`
- `freightCartingAmount = 0`
- `stampDutyAmount = 0`
- `tcsAmount = 1737`
- `printedTotalRaw = "X6/15.00"`
- `printedInvoiceTotal = null`
- `calculatedInvoiceTotal = 88452`
- `reconciliationStatus = REVIEW_PRINTED_TOTAL_UNREADABLE`

Observed finance evidence includes:

```text
TCS+EC+SC -> 1737
TOTAL
(-)DISCOUNT -> X6/15.00
```

## Current source behavior

`supabase/functions/_shared/invoiceFinance.js`:

1. prefers semantic-table same-row label/value evidence;
2. then key/value evidence;
3. previously allowed a matching structured label with no good row amount to block page-line recovery;
4. uses generic `total` among final-total aliases.

This is safe for ambiguous documents but is too literal for B-3339's merged summary structure.

## Fix strategy

- reject compound finance labels such as `TOTAL + DISCOUNT` as a single semantic field;
- support exact bare `DISCOUNT`, `FREIGHT`, and `STAMP` labels;
- recover values only from direct structured pairs, inline page lines, or same-visual-row page-line pairs;
- prefer strong final-total labels (`NET AMOUNT`, `GRAND TOTAL`, etc.) before generic `TOTAL`;
- retain malformed-total reliability checks and fail closed when direct evidence is not sufficient.

No arithmetic is used to manufacture 599, 700, 5, 1737, or 88558.

## Existing protections that must remain

DEF-0001 / invoice 16805 must continue to preserve:

```text
raw TOTAL = 85.044.00
total = null
printedTotalEvidenceStatus = LABELED_TOTAL_UNREADABLE
reconciliationStatus = REVIEW_PRINTED_TOTAL_UNREADABLE
Approve & Receive Stock = blocked
```

## Confirmed continuation behavior

The latest run also proves the previously questioned reopen workflow for invoice 16845:

```text
scan
-> leave
-> revisit from Invoice Inbox
-> same ingestion
-> no premature purchase
-> complete receipt
-> duplicate protection
-> PASS
```

That is valid current behavior and is not part of DEF-0002.
