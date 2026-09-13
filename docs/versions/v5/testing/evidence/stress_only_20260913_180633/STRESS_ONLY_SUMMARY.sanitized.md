# WineShopPOS V5 — Stress-Only 96 UI Continuation

**Result: FAIL**

Run: `stress_only_20260913_180633`

- Source: exact prior-chat stress logic from RUN_V5_END_TO_END.sh
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| DEV ADMIN session | PASS | saved auth reused or interactive DEV login completed |
| Product Master pre-stress | PASS | 15 products available for genuine POS stress |
| Pre-stress Sales baseline | PASS | 0 existing bill(s) preserved |
| Four cashier profiles | PASS | created and verified through Admin → Users UI |
| Test Cashier 1 login + shift | PASS | independent browser context · shift opened through POS UI |
| Test Cashier 2 login + shift | PASS | independent browser context · shift opened through POS UI |
| Test Cashier 3 login + shift | PASS | independent browser context · shift opened through POS UI |
| Test Cashier 4 login + shift | PASS | independent browser context · shift opened through POS UI |

## Invoices
```json
[]
```

## Stress
```json
{
  "baselineSales": {
    "count": 0,
    "total": 0,
    "paymentMix": {
      "CASH": 0,
      "UPI": 0,
      "CARD": 0
    }
  }
}
```

## Analytics
```json
{}
```

## Failure
```text
Error: Only 0 sellable products available after invoices.
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-only-96-ui-from-chat.mjs:46:38)
    at buildUiStressPlan (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-only-96-ui-from-chat.mjs:686:3)
    at file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-only-96-ui-from-chat.mjs:1146:14
```