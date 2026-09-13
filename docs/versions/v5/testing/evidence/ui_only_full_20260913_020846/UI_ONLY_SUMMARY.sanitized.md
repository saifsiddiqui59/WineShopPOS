# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_020846`

- Automation method: Playwright browser/UI only
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Admin authentication | PASS | real V5 login form · QA/DEV badge verified |
| Resumable DEV UI state | PASS | 0 products · 0 inventory · 0 sales · one pending OCR draft for 16845 |

## Invoices
```json
[]
```

## Stress
```json
{}
```

## Analytics
```json
{}
```

## Failure
```text
locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('spinbutton', { name: 'Reviewed Printed Invoice Total', exact: true }).first() to be visible[22m

    at uploadAndReceiveInvoice (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\.wsp_ui_only_ui_only_full_20260913_020846.mjs:380:17)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_020846.mjs:996:38
```