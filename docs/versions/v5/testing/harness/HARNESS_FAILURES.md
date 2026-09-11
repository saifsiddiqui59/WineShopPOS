# V5 Test Harness / Prerequisite Failure Log

This file is separate from the real product defect register.

Harness failures do **not** receive `DEF-####` serial numbers.

Known resolved/observed harness issues from the 2026-09-11 certification work:

- Git Bash shell `base64 -d` portability failure.
- OCR upload generic file-input selector matched Product Image and invoice inputs.
- Fuzzy Supplier label matched unrelated controls.
- Barcode label accessible name included nested helper text.
- Supplier exact-match auto-confirm hid the Existing Supplier selector.
- Partial-success rerun needed revalidation instead of a second Receive.
- READY_TO_RECEIVE was checked before debounced persistence settled.
- Fresh OCR supplier state was not scoped to the Confirm Supplier panel.
- Focused diagnostic later hit expired saved QA JWT (`PGRST303` / HTTP 401).

These entries are retained so future test code does not repeat them, but they are not product defects.
## 2026-09-11T15:15:55.257Z — HARNESS_SELECTOR

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Playwright selector/state model

```text
locator.waitFor: Timeout 40000ms exceeded.
Call log:
[2m  - waiting for getByText(/Duplicate invoice file detected/i) to be visible[22m

```

