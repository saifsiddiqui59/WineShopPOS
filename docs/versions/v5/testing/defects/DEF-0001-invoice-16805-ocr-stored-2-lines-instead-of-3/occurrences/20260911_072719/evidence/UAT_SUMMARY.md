# WineShopPOS V5_29 Real Invoice UAT

Run: 20260911_072719
Final: **FAIL**
Started: 2026-09-11T11:27:29.052Z
Finished: 2026-09-11T11:27:47.504Z

## Safety
- DEV Supabase: juhcypzoacauzmtzqnwd
- Phone scanner physical smoke: PRE-PASSED BY USER
- Invoice 15983: EXCLUDED

## Invoices
### 16845
- Result: PASS
- Mode: REVALIDATED_ALREADY_RECEIVED
- OCR lines: n/a
- OCR image suggestions: n/a
- Cases: 62
- Bottles: 996
- Purchase ID: 13d2ebf0-ec0b-4dbd-a0bb-34655bd40e20
- Duplicate/idempotency check: PASS — duplicate image blocked, purchase count stayed 1
- Note: Previously received invoice was revalidated and skipped; no second stock mutation was attempted.

### B-3339
- Result: PASS
- Mode: REVALIDATED_ALREADY_RECEIVED
- OCR lines: n/a
- OCR image suggestions: n/a
- Cases: 35
- Bottles: 540
- Purchase ID: 1b317e19-3724-4fbd-a797-496e43cc1779
- Duplicate/idempotency check: PASS — duplicate image blocked, purchase count stayed 1
- Note: Previously received invoice was revalidated and skipped; no second stock mutation was attempted.

### 16805
- Result: RUNNING
- Mode: RESUMED_EXISTING_NEEDS_REVIEW
- OCR lines: 2
- OCR image suggestions: n/a
- Cases: 3
- Bottles: 144
- Purchase ID: n/a
- Duplicate/idempotency check: n/a

## Warnings
- Error: 16805: existing OCR evidence has 2 lines; expected 3.
    at fail (file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4475/runner.mjs:533:9)
    at assert (file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4475/runner.mjs:536:19)
    at openOrCreateInvoice (file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4475/runner.mjs:935:5)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4475/runner.mjs:1402:25

## Browser console errors
- Failed to load resource: the server responded with a status of 401 ()
- Failed to load resource: the server responded with a status of 401 ()
- Failed to load resource: the server responded with a status of 401 ()

## Failed network requests
- net::ERR_ABORTED :: https://juhcypzoacauzmtzqnwd.supabase.co/rest/v1/
- net::ERR_ABORTED :: https://juhcypzoacauzmtzqnwd.supabase.co/rest/v1/
- net::ERR_ABORTED :: https://juhcypzoacauzmtzqnwd.supabase.co/rest/v1/
