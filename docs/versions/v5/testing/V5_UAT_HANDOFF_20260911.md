# WineShopPOS V5 UAT Handoff — 2026-09-11

Status: **ACTIVE QA / UAT INVESTIGATION — PROD UNTOUCHED**

This document is the continuation entry point for another chat or coding agent.

## Environment

- Repository: `saifsiddiqui59/WineShopPOS`
- Branch: `V5`
- DEV Supabase: `WineshopPOS_DEV`
- DEV ref: `juhcypzoacauzmtzqnwd`
- PROD ref: `uiurgplnsgmawvxhjzzp`
- PROD must remain untouched.
- Current runtime implementation under qualification: V5_29. V5_30 is documentation-only.

## Latest real-invoice UAT status

### Invoice 16845 — Kapil Alcotech LLP

Status: **PASS**

- Real OCR flow completed.
- 15/15 purchase lines prepared.
- `Approve & Receive Stock` completed.
- Database verification passed.
- Duplicate/idempotency protection passed.
- On later runs this invoice must be **revalidated only**; never receive it a second time.

### Invoice B-3339 — S V Wines Pvt Ltd

Status: **PASS**

- Real OCR flow completed.
- 14/14 purchase lines prepared.
- `Approve & Receive Stock` completed.
- Database verification passed.
- Duplicate/idempotency protection passed.
- On later runs this invoice must be **revalidated only**; never receive it a second time.

### Invoice 16805 — Metri Spirits Pvt Ltd

Status: **BLOCKED — APPLICATION/OCR INVESTIGATION**

The physical invoice has 3 product rows, but existing DEV OCR evidence has only 2 normalized item lines.

Expected physical rows:

1. DING DONGS FORTIFIED WINE
2. DYNAMITE XXX FORTIFIED WINE
3. GO LIMLET FORTIFIED WINE

Printed values:
- MRP: 60 each
- rate: about 2637.30 each
- product subtotal: 7911
- printed invoice total: 8044

Do **not** receive invoice 16805 until all 3 physical lines are represented and reviewed.

## Latest test-runner state

Latest locally generated certification runner: `R9-SOURCE-AUDITED-OCR-SUPPLIER`.

Most failures before the 16805 line-count mismatch were test-harness defects:
- Git Bash shell base64 decode;
- generic file input selector;
- fuzzy Supplier label;
- Barcode label including helper text;
- supplier auto-confirm hiding the select;
- partial-success rerun/idempotent resume;
- premature READY_TO_RECEIVE assertion;
- source-unscoped supplier state detection.

These are documented in:

`docs/versions/v5/testing/V5_UAT_FAILURE_REGISTER_20260911.md`

## Failure classification rule

Use this before modifying code:

- selector/strict-mode/locator timeout -> test harness unless current source says the control should exist and source-scoped diagnostics prove otherwise;
- stale UI sync/timing -> test harness synchronization;
- correct UI state but wrong persisted business values -> application/database defect;
- physical invoice has 3 rows but stored normalized OCR has 2 -> OCR/normalization/persistence defect;
- never patch a test simply to hide a real data mismatch.

## Required next step

Run the read-only DEV diagnostic:

```bash
cd /e/WineShopPOS_V5
bash scripts/diagnostics/DIAGNOSE_V5_16805_OCR.sh
```

Review:

`~/WineShopPOS_V5_DIAG_16805/<timestamp>/SUMMARY.md`

The diagnostic must identify where the missing line is lost:

1. OCR output has 2 rows -> repair OCR/table extraction or normalization.
2. OCR output has 3 but `normalized_invoice.items` stores 2 -> repair persistence.
3. `normalized_invoice.items` has 3 but Purchase Receiving has 2 -> repair review-draft/receiving hydration.

## Safety / continuation rules

- Preserve the original 16805 invoice evidence and ingestion.
- Do not delete/recreate the ingestion merely to make UAT pass.
- Do not re-receive 16845 or B-3339.
- PROD remains untouched.
- Keep synthetic QA EAN-13 mappings stable across reruns.
- After the 16805 fix, make it a permanent 3-row regression fixture.
- Re-run the focused 16805 test first; only then resume full certification.

## Related documents

- `docs/versions/v5/testing/V5_16805_OCR_BUG_LOG.md`
- `docs/versions/v5/testing/V5_UAT_FAILURE_REGISTER_20260911.md`
- `scripts/diagnostics/DIAGNOSE_V5_16805_OCR.sh`
- `docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md`
- `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md`
