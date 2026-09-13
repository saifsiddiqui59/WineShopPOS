# V5 Harness Preflight

**Result: FAIL**

Run: `harness_preflight_20260913_022236`

- Business mutation: **none**
- Direct Supabase SQL/REST/RPC from preflight: **none**
- Purpose: validate the complete Playwright locator/source contract before another business-data run

## Current state snapshot
```json
{}
```

## Static source contracts

| Contract | Status | Detail |
|---|---|---|
| Invoice OCR | PASS | 5 source contract token(s) verified in src/pages/AutomationHub.jsx |
| Invoice Inbox | PASS | 6 source contract token(s) verified in src/pages/InvoiceInbox.jsx |
| Purchase Receiving | PASS | 10 source contract token(s) verified in src/pages/Purchases.jsx |
| Purchase Verification receipt | PASS | 3 source contract token(s) verified in src/pages/PurchaseDetails.jsx |
| Receipt success assertion | PASS | use Purchase Verification + Posted Purchase Lines; do NOT require invoice number text |
| Users & Roles | PASS | 7 source contract token(s) verified in src/pages/Users.jsx |
| POS | PASS | 7 source contract token(s) verified |
| Returns | PASS | 5 source contract token(s) verified |
| Shift close | PASS | 4 source contract token(s) verified |
| Owner Center | PASS | 4 source contract token(s) verified |
| Inventory Intelligence | PASS | 1 source contract token(s) verified |
| Profit Intelligence | PASS | 1 source contract token(s) verified |
| Purchase Intelligence | PASS | 1 source contract token(s) verified |
| Reports | PASS | 3 source contract token(s) verified |

## Runtime DOM contracts

| Contract | Status | Detail |
|---|---|---|
| QA/DEV environment badge | PASS | exactly one matching element |

## Skipped dynamic contracts

- None

## Failure
```text
Error: Login email: expected exactly 1 element, found 0.
    at assert (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_022236.mjs:39:36)
    at uniqueVisible (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_022236.mjs:69:3)
    at async login (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_022236.mjs:121:3)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_022236.mjs:388:11
```