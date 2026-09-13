# WineShopPOS V5 — Playwright UI-Only Full Test

**Result: FAIL**

Run: `ui_only_full_20260913_015721`

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
locator.fill: Error: strict mode violation: getByLabel('Supplier') resolved to 3 elements:
    1) <nav class="module-tabs" aria-label="Purchases & Suppliers navigation">…</nav> aka getByRole('navigation', { name: 'Purchases & Suppliers' })
    2) <input list="supplier-list-v5" value="Kapil Alcotech LLP"/> aka getByRole('combobox', { name: 'Supplier' })
    3) <input step="0.01" value="1216" type="number"/> aka getByRole('spinbutton', { name: 'Cash / Supplier Discount' })

Call log:
[2m  - waiting for getByLabel('Supplier')[22m

    at uploadAndReceiveInvoice (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\.wsp_ui_only_ui_only_full_20260913_015721.mjs:275:37)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_ui_only_ui_only_full_20260913_015721.mjs:890:38
```