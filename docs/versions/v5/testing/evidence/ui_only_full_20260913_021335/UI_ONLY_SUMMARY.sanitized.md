# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_021335`

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
Error: 16845: receipt page does not show invoice number.
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_021335.mjs:50:38)
    at uploadAndReceiveInvoice (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_021335.mjs:420:3)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_021335.mjs:1009:38
```