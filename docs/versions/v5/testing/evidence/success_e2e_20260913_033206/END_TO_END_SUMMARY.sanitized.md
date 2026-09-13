# WineShopPOS V5 — Success-R11-Based End-to-End Delta

**Result: FAIL**

Run: `success_e2e_20260913_033206`

- Base: committed successful R11 master certification runner
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Successful-runner ADMIN session | PASS | reused R11 saved authenticated browser state |

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
locator.waitFor: Timeout 20000ms exceeded.
Call log:
[2m  - waiting for locator('table.data-table tbody tr').filter({ hasText: 'B-3339' }).first() to be visible[22m

    at verifySuccessfulBaseViaUi (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\.wsp_success_e2e_success_e2e_20260913_033206.mjs:183:15)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_033206.mjs:1065:3
```