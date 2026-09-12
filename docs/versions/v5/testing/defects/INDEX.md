# WineShopPOS V5 Real Defect Register

Open real defects: **0** · Total real defects: **1**

This index contains **application/data/security defects only**. Test harness and prerequisite failures are kept separately under `../harness/`.

| Sr | Defect ID | Status | Class | Severity | Defect |
|---:|---|---|---|---|---|
| 1 | DEF-0001 | RESOLVED | APP_OCR_DATA | HIGH | Invoice 16805 OCR stored 2 lines instead of 3 |

## Current state

There are no open real defects in the V5 registry.

DEF-0001 was resolved after final certification confirmed that invoice 16805 preserves all 3 OCR rows and that unreadable printed-total evidence remains safely in `NEEDS_REVIEW` without purchase or stock mutation.

## New-chat workflow

1. Read this file.
2. If an `OPEN` defect exists, select the lowest-numbered open defect.
3. Read that defect's `DEFECT.md`, `meta.json`, `SOURCE_CONTEXT.md`, and newest `occurrences/` evidence.
4. Fix only that defect in V5 DEV/QA.
5. Add/verify a focused regression test.
6. Run the relevant end-to-end flow.
7. Mark `RESOLVED` only after verification.
8. If there is no `OPEN` defect, do not invent a new defect number without a newly verified application/data/security failure.
