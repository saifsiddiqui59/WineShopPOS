# DEF-0001 — Invoice 16805 OCR stored 2 lines instead of 3

**Sr No:** 1
**Status:** OPEN
**Classification:** APP_OCR_DATA
**Severity:** HIGH
**Environment:** V5 DEV/QA (`juhcypzoacauzmtzqnwd`)
**PROD:** untouched

## Defect statement

Real invoice **16805** physically contains **3 product rows**, but the V5 UAT found existing stored OCR evidence with **2 normalized item lines**.

Exact certification failure:

```text
[V5-UAT] FAIL: 16805: existing OCR evidence has 2 lines; expected 3.
```

## Expected

Invoice 16805 must preserve all three physical product rows through OCR, normalization, review draft and Purchase Receiving:

1. DING DONGS FORTIFIED WINE
2. DYNAMITE XXX FORTIFIED WINE
3. GO LIMLET FORTIFIED WINE

Printed commercial values used by UAT:
- MRP: 60 each
- rate: approximately 2637.30 each
- printed product subtotal: 7911
- printed invoice total: 8044

## Actual

The stored OCR evidence examined by the UAT contained two normalized item rows. The test stopped before Receive Stock.

Invoice 16805 must **not** be received until the missing line is identified and fixed.

## Known surrounding state

- Invoice 16845: PASS; already received; revalidate-only on future runs.
- Invoice B-3339: PASS; already received; revalidate-only on future runs.
- Invoice 16805: not received; blocked by this defect.
- A later read-only diagnostic attempt was blocked by an expired saved QA JWT (`PGRST303`). That authentication failure is a harness prerequisite issue and is **not** this product defect.

## Debugging decision tree

1. If fresh OCR Edge Function output has 2 rows → inspect OCR/table extraction / normalization.
2. If OCR output has 3 rows but `invoice_ingestions.normalized_invoice.items` stores 2 → inspect persistence.
3. If `normalized_invoice.items` has 3 rows but Purchase Receiving restores 2 → inspect review-draft / receiving hydration.

## Likely source areas

- `src/pages/AutomationHub.jsx`
- `src/pages/Purchases.jsx`
- `supabase/functions/ocr-invoice/`
- invoice normalization/client helpers
- `scripts/ocr-metiri-real-regression.mjs`

## Required fix

Do not weaken the UAT expected line count.

Fix the application/OCR path so the physical three-row invoice remains three rows through the complete review/receive workflow.

## Acceptance criteria

- Fresh 16805 OCR resolves all 3 physical rows.
- Review/receiving workspace shows all 3 rows.
- Purchase receives exactly 3 purchase lines.
- Expected subtotal/total reconciliation remains correct.
- No duplicate stock posting.
- Focused 16805 regression passes.
- Relevant full certification passes.
- Only then change DEF-0001 to `RESOLVED`.
