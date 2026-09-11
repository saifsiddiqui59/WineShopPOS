# WineShopPOS V5 Real Defect Register

Open real defects: **1** · Total real defects: **1**

This index contains **application/data/security defects only**. Test harness and prerequisite failures are kept separately under `../harness/`.

| Sr | Defect ID | Status | Class | Severity | Defect |
|---:|---|---|---|---|---|
| 1 | DEF-0001 | OPEN | APP_OCR_DATA | HIGH | Invoice 16805 OCR stored 2 lines instead of 3 |

## New-chat workflow

1. Read this file.
2. Select the lowest-numbered `OPEN` defect.
3. Read that defect's `DEFECT.md`, `meta.json`, `SOURCE_CONTEXT.md`, and newest `occurrences/` evidence.
4. Fix only that defect in V5 DEV/QA.
5. Add/verify a focused regression test.
6. Run the relevant end-to-end flow.
7. Mark `RESOLVED` only after verification.
