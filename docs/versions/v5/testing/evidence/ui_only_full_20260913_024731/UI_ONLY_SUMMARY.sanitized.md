# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_024731`

- Automation method: Playwright browser/UI only
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Admin authentication | PASS | real V5 login form · QA/DEV badge verified |

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
Error: Resume safety failed: Product Master already has 15 row(s).
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_024731.mjs:50:38)
    at initialUiCleanCheck (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_024731.mjs:135:3)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_024731.mjs:1010:3
```