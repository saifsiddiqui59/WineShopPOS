# WineShopPOS V5 — Stress-Only 96 UI Continuation

**Result: FAIL**

Run: `true_e2e_stress_20260914_052924`

- Source: exact prior-chat stress logic from RUN_V5_END_TO_END.sh
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| DEV ADMIN session | PASS | saved auth reused or interactive DEV login completed |
| Product Master pre-stress | PASS | 36 products available for genuine POS stress |
| Pre-stress Sales baseline | PASS | 5 existing bill(s) preserved |
| Four cashier profiles | PASS | reused exact cashier credentials from the preserved stress checkpoint |
| Test Cashier 1 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 2 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 3 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| Test Cashier 4 login + preserved shift | PASS | independent browser context · existing OPEN shift reused |
| UI stress plan | PASS | 106 bills · 530 lines · 2066 bottles · 4 independent sessions |
| Genuine multi-session POS stress | PASS | 106 complete browser/UI bills · 2066 bottles |
| Test Cashier 1 own-sales visibility | PASS | 28 own sales · {"CASH":0,"UPI":0,"CARD":0} |
| Test Cashier 2 own-sales visibility | PASS | 28 own sales · {"CASH":0,"UPI":0,"CARD":0} |
| Test Cashier 3 own-sales visibility | PASS | 28 own sales · {"CASH":0,"UPI":0,"CARD":0} |
| Test Cashier 4 own-sales visibility | PASS | 27 own sales · {"CASH":0,"UPI":0,"CARD":0} |
| Return/refund workflow | PASS | cashier requested 1 unit · Admin approved through UI |

## Invoices
```json
[]
```

## Stress
```json
{
  "baselineSales": {
    "count": 5,
    "total": 0,
    "paymentMix": {
      "CASH": 0,
      "UPI": 0,
      "CARD": 0
    }
  },
  "continuation": {
    "targetTotalBills": 96,
    "alreadyCommittedBills": 5,
    "minimumAdditionalBills": 91
  },
  "plan": {
    "transactions": 106,
    "lines": 530,
    "bottlesToSell": 2066,
    "targetBeforeReturn": "3–6 bottles/product",
    "requiredFinal": "3–7 bottles/product after one approved return",
    "maxSameSkuPerBill": 4,
    "browserSessions": 4
  },
  "transactions": 106,
  "totalBottles": 2066,
  "partialMutationRisk": false,
  "activeBatch": null,
  "paymentMix": {
    "CASH": 36,
    "UPI": 35,
    "CARD": 35
  },
  "perCashier": {
    "Test Cashier 1": 27,
    "Test Cashier 2": 27,
    "Test Cashier 3": 26,
    "Test Cashier 4": 26
  },
  "latency": {
    "minMs": 1397,
    "maxMs": 4595,
    "avgMs": 1753
  },
  "totalBillsIncludingPrior": 111
}
```

## Analytics
```json
{}
```

## Failure
```text
locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('.purchase-message').filter({ hasText: 'Shift closed.' }) to be visible[22m

    at approveAllShiftCloses (E:\WineShopPOS_V5_E2E_20260912_105856\tests\e2e\v5-stress-resume-after-ocr-from-chat.mjs:1094:84)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/v5-stress-resume-after-ocr-from-chat.mjs:1364:3
```
