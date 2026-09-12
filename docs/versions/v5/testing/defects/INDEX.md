# WineShopPOS V5 Real Defect Register

Open real defects: **1** · Total real defects: **2**

This index contains **application/data/security defects only**. Test harness and prerequisite failures are kept separately under `../harness/`.

| Sr | Defect ID | Status | Class | Severity | Defect |
|---:|---|---|---|---|---|
| 1 | DEF-0001 | RESOLVED | APP_OCR_DATA | HIGH | Invoice 16805 OCR stored 2 lines instead of 3 |
| 2 | DEF-0002 | OPEN | APP_OCR_DATA | HIGH | Fresh OCR of invoice B-3339 fails to extract finance summary |

## Current state

- DEF-0001 remains resolved. Its 16805 unreadable-total fail-closed protection must not be weakened.
- DEF-0002 is the only open real defect.
- B-3339 is a golden invoice and must reach reliable finance `MATCH` before receipt; generic safe-review is not an accepted pass for this fixture.

## New-chat workflow

1. Read this file.
2. If an `OPEN` defect exists, select the lowest-numbered open defect.
3. Read that defect's `DEFECT.md`, `meta.json`, `SOURCE_CONTEXT.md`, and newest `occurrences/` evidence.
4. Fix only that defect in V5 DEV/QA.
5. Add/verify a focused regression test.
6. Run the relevant end-to-end flow.
7. Mark `RESOLVED` only after verification.
8. Test harness/prerequisite failures stay under `../harness/` and do not receive a numbered real-defect ID.
