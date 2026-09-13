# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_014348`

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
locator.waitFor: Error: strict mode violation: getByRole('heading', { name: 'Products', exact: true }) resolved to 3 elements:
    1) <h1>Products</h1> aka locator('header').getByRole('heading', { name: 'Products' })
    2) <h1>Products</h1> aka getByRole('heading', { name: 'Products' }).nth(1)
    3) <h2>Products</h2> aka locator('h2')

Call log:
[2m  - waiting for getByRole('heading', { name: 'Products', exact: true }) to be visible[22m

    at initialUiCleanCheck (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\.wsp_ui_only_ui_only_full_20260913_014348.mjs:124:64)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_014348.mjs:888:3
```