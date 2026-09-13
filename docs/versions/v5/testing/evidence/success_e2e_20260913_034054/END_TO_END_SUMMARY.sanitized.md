# WineShopPOS V5 — Success-R11-Based End-to-End Delta

**Result: FAIL**

Run: `success_e2e_20260913_034054`

- Base: committed successful R11 master certification runner
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Successful-runner ADMIN session | PASS | reused R11 saved authenticated browser state |
| Successful R11 base contract | PASS | R11 passed in documented rerun mode; current DEV snapshot={"15983":"ABSENT","16805":"ABSENT","16845":"COMPLETED","B-3339":"ABSENT"} |

## Invoices
```json
[]
```

## Stress
```json
{
  "baseInvoiceSnapshot": {
    "15983": "ABSENT",
    "16805": "ABSENT",
    "16845": "COMPLETED",
    "B-3339": "ABSENT"
  }
}
```

## Analytics
```json
{}
```

## Failure
```text
Error: 15983: OCR did not reach Purchase Receiving within 180 seconds.
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_034054.mjs:48:38)
    at openOrResumeInvoiceToReceiving (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_034054.mjs:388:3)
    at async uploadAndReceiveInvoice (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_034054.mjs:400:15)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_034054.mjs:1073:3
```