# WineShopPOS V5 — Stress-Only 96 UI Continuation

**Result: FAIL**

Run: `true_e2e_stress_20260914_052145`

- Source: exact prior-chat stress logic from RUN_V5_END_TO_END.sh
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| DEV ADMIN session | PASS | saved auth reused or interactive DEV login completed |
| Product Master pre-stress | PASS | 36 products available for genuine POS stress |
| Pre-stress Sales baseline | PASS | 0 existing bill(s) preserved |
| Four cashier profiles | PASS | reused exact cashier credentials from the preserved stress checkpoint |
| Test Cashier 1 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 2 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 3 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 4 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| UI stress plan | PASS | 111 bills · 555 lines · 2166 bottles · 4 independent sessions |

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
  },
  "plan": {
    "transactions": 111,
    "lines": 555,
    "bottlesToSell": 2166,
    "targetBeforeReturn": "3–6 bottles/product",
    "requiredFinal": "3–7 bottles/product after one approved return",
    "maxSameSkuPerBill": 4,
    "browserSessions": 4
  },
  "transactions": 5,
  "totalBottles": 100,
  "partialMutationRisk": true,
  "activeBatch": {
    "startIndex": 4,
    "count": 4,
    "status": "FAILED_OR_UNKNOWN",
    "failures": [
      {
        "globalIndex": 4,
        "message": "Test Cashier 1: shift gate appeared during stress."
      },
      {
        "globalIndex": 5,
        "message": "Test Cashier 2: shift gate appeared during stress."
      },
      {
        "globalIndex": 7,
        "message": "Test Cashier 4: shift gate appeared during stress."
      }
    ]
  }
}
```

## Analytics
```json
{}
```

## Failure
```text
Error: Stress batch 4-7 had 3 failed/unknown sale(s). Automatic rerun is unsafe because a rejected browser task may already have committed. #5: Test Cashier 1: shift gate appeared during stress. | #6: Test Cashier 2: shift gate appeared during stress. | #8: Test Cashier 4: shift gate appeared during stress.
    at runAllUiStress (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-resume-after-ocr-from-chat.mjs:952:13)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-resume-after-ocr-from-chat.mjs:1317:3
```
