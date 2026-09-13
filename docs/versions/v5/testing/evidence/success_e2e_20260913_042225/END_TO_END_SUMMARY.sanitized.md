# WineShopPOS V5 — Success-R11-Based End-to-End Delta

**Result: FAIL**

Run: `success_e2e_20260913_042225`

- Base: committed successful R11 master certification runner
- Direct Supabase REST/RPC/SQL from the test runner: **none**
- Environment: V5 QA / DEV
- PROD request attempted: **No**

## Checks

| Check | Status | Detail |
|---|---|---|
| Successful-runner ADMIN session | PASS | reused R11 saved authenticated browser state |
| Successful R11 base contract | PASS | R11 passed in documented rerun mode; current DEV snapshot={"15983":"REVIEW_OR_PENDING","16805":"ABSENT","16845":"COMPLETED","B-3339":"ABSENT"} |
| Invoice 15983 resume fallback | HARNESS_RECOVERY | Resume Review populated official sessionStorage state; direct app route used because restored Open button was not visible within 30s. |

## Invoices
```json
[]
```

## Stress
```json
{
  "baseInvoiceSnapshot": {
    "15983": "REVIEW_OR_PENDING",
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
Error: 15983 line 2 (TUBORG STRONG PREMIUM CAN
UNMATCHED): OCR MRP missing; UI-only run will not invent MRP.
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_042225.mjs:48:38)
    at prepareReceiveRows (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_042225.mjs:259:7)
    at async uploadAndReceiveInvoice (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_042225.mjs:511:19)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_success_e2e_success_e2e_20260913_042225.mjs:1146:3
```