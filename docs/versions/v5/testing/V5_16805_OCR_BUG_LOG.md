# V5 Incident — Invoice 16805 OCR Line Loss

Date: 2026-09-11  
Environment: V5 / DEV Supabase `juhcypzoacauzmtzqnwd`  
Status: OPEN — application/OCR investigation required

## Symptom

The V5 UAT runner found existing OCR evidence for invoice **16805** with **2 normalized item lines**, while the physical invoice visibly contains **3 product rows**.

Expected physical rows:

1. DING DONGS FORTIFIED WINE
2. DYNAMITE XXX FORTIFIED WINE
3. GO LIMLET FORTIFIED WINE

Each row shows MRP 60 and rate approximately 2637.30; printed product subtotal is 7911 and printed invoice total is 8044.

## Classification

This is no longer classified as a Playwright selector/timing issue.

If DEV `invoice_ingestions.normalized_invoice.items` contains only 2 items, the defect is in the OCR extraction / invoice normalization / persistence path.

## Safety

- Do not receive invoice 16805 while one physical line is missing.
- Preserve the original invoice evidence and ingestion.
- Do not delete/recreate the ingestion merely to make UAT pass.
- PROD remains untouched.

## Required diagnostic evidence

Run `DIAGNOSE_V5_16805_OCR.sh`.

Capture:
- ingestion id
- review status
- `purchase_id`
- all stored `normalized_invoice.items`
- `review_draft`
- extracted invoice number/date/total
- which of the three physical rows is missing

## Fix decision tree

1. If OCR Edge Function output already contains only 2 rows:
   - fix invoice table extraction / OCR normalization input interpretation.
2. If OCR output contains 3 rows but `invoice_record_ocr_result` stores 2:
   - fix frontend normalization/persistence.
3. If normalized invoice has 3 but Purchase Receiving restores only 2:
   - fix review-draft / receiving hydration.
4. Add invoice 16805 as a permanent 3-row regression fixture.
5. Re-run only the focused 16805 test first.
6. After 16805 passes, resume the full certification.

## Acceptance criteria

Invoice 16805 must show all three physical rows before receive, post exactly three purchase lines, and preserve subtotal/total reconciliation without duplicate stock posting.
