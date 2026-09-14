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

## 2026-09-11T15:21:29.052Z — HARNESS_SELECTOR

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Playwright selector/state model

```text
page.waitForResponse: Timeout 40000ms exceeded while waiting for event "response"
```
## 2026-09-11T15:37:44.658Z — HARNESS_SELECTOR

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Playwright selector/state model

```text
locator.waitFor: Timeout 120000ms exceeded.
Call log:
[2m  - waiting for getByRole('heading', { name: '1. Confirm Supplier', exact: true }) to be visible[22m

```
## 2026-09-11T17:31:04.002Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Unclassified test failure

```text
16805: OCR printed total 7911 does not match physical total 8044.
```

## 2026-09-12T05:44:11.052Z — HARNESS_SERVICE_PREREQUISITE

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: DEV invoice storage API availability

```text
16845: duplicate storage API returned HTTP 503.
```

## 2026-09-12T06:40:55.091Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `09_FULL_APP_CERT`
- Component: Unclassified test failure

```text
Error: GET products?select=id,product_name,barcode,price,selling_price,mrp,active&barcode=eq.2900000000018&limit=1: HTTP 400 {"code":"42703","details":null,"hint":null,"message":"column products.price does not exist"}
    at rest (file:///E:/WineShopPOS_V5/.wsp_v5_full_cert_2783/full-cert.mjs:29:41)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async criticalFlow (file:///E:/WineShopPOS_V5/.wsp_v5_full_cert_2783/full-cert.mjs:74:11)
    at async file:///E:/WineShopPOS_V5/.wsp_v5_full_cert_2783/full-cert.mjs:114:2
```

## 2026-09-12T07:17:29.565Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Unclassified test failure

```text
16845: Invoice Inbox shows 0 rows for the same scanned invoice; expected exactly 1.
```

## 2026-09-12T07:25:53.533Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Unclassified test failure

```text
B-3339: OCR printed total null does not match physical total 88558.
```

## 2026-09-12T07:27:14.885Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Unclassified test failure

```text
Error: Clean-baseline precondition failed: purchases has 1 row(s).
    at fail (file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4098/runner.mjs:538:9)
    at assert (file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4098/runner.mjs:541:19)
    at file:///E:/WineShopPOS_V5/.wsp_v5_uat_runtime_4098/runner.mjs:1781:5
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
```

## 2026-09-13T07:19:03.064Z — TRIAGE_REQUIRED

- Runner: `R11-REAL-DEFECT-REGISTRY`
- Stage: `07_REAL_INVOICE_UAT`
- Component: Unclassified test failure

```text
16845: previously received product missing for barcode 2900000000018.
```


## 2026-09-13T03:33:28-04:00 — HARNESS_SUCCESS_BASED_E2E

- Runner: SUCCESS-R11-PLUS-UI-DELTA
- Stage: 15983 / 4-cashier UI stress
- Evidence: `docs/versions/v5/testing/evidence/success_e2e_20260913_033206`
- Classification: harness only; **no DEF serial**.

<!-- STRESS_ONLY_ENV_WORKTREE_20260913_180313 -->
## 2026-09-13 — HARNESS_ENV_WORKTREE

- Runner: `RUN_V5_STRESS_ONLY_96_UI_FROM_CHAT.sh`
- Stage: stress-only preflight, before Vite/browser launch
- Symptom: `DEV Supabase ref was not found in local V5 env.`
- Root cause: the first committed stress-only wrapper hardcoded `/e/WineShopPOS_V5`, while the previously working certification flow intentionally selected `/e/WineShopPOS_V5_E2E_20260912_105856` when available because that worktree carries the DEV QA environment.
- Impact: **no stress mutation occurred**; Vite and Playwright were never started.
- Resolution: restore the original certification-worktree selection logic before the environment guard.
- Classification: test harness prerequisite/path defect; **not a WineShopPOS application defect**.
<!-- /STRESS_ONLY_ENV_WORKTREE_20260913_180313 -->

<!-- STRESS_ONLY_true_e2e_stress_20260914_052924 -->
## 2026-09-14T05:33:23-04:00 — STRESS_RESUME_AFTER_OCR

- Runner: `scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh`
- Evidence: `docs/versions/v5/testing/evidence/true_e2e_stress_20260914_052924`
- Classification: **HARNESS**
<!-- /STRESS_ONLY_true_e2e_stress_20260914_052924 -->
