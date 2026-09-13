# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_015036`

- Automation method: Playwright browser/UI only
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Admin authentication | PASS | real V5 login form · QA/DEV badge verified |
| Fresh DEV UI baseline | PASS | 0 products · 0 inventory rows · 0 sales · 0 invoice ingestions |

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
locator.setInputFiles: Error: strict mode violation: locator('input[type="file"]') resolved to 2 elements:
    1) <input hidden="" type="file" accept="image/jpeg,image/png,image/webp"/> aka getByRole('complementary', { name: 'Application navigation' }).locator('input[type="file"]')
    2) <input type="file" accept="image/*,.pdf,application/pdf"/> aka getByRole('button', { name: 'Choose File' })

Call log:
[2m  - waiting for locator('input[type="file"]')[22m

    at async uploadAndReceiveInvoice (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\.wsp_ui_only_ui_only_full_20260913_015036.mjs:245:3)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_015036.mjs:890:38
```