# V5 Harness Preflight

**Result: FAIL**

Run: `harness_preflight_20260913_023005`

- Business mutation: **none**
- Direct Supabase SQL/REST/RPC from preflight: **none**
- Purpose: validate the complete Playwright locator/source contract before another business-data run

## Current state snapshot
```json
{
  "productRows": 0,
  "inventoryRows": 0,
  "salesRows": 0,
  "invoiceRows": 0,
  "invoice16845State": "ABSENT"
}
```

## Static source contracts

| Contract | Status | Detail |
|---|---|---|
| Login | PASS | 5 source contract token(s) verified in src/pages/Login.jsx |
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
| Login auth card | PASS | exactly one matching element |
| Login email | PASS | exactly one matching element |
| Login password | PASS | exactly one matching element |
| Login button | PASS | exactly one matching element |
| Admin authentication | PASS | real login form; no storage-state shortcut |
| /products route | FAIL | blank/empty page |
| /inventory route | FAIL | blank/empty page |
| /pos/sales route | FAIL | blank/empty page |
| /purchasing/invoices route | PASS | rendered with title Invoice Inbox |
| Invoice Inbox status filter | PASS | exactly one matching element |
| /purchasing/ocr route | PASS | rendered with title Invoice OCR |
| OCR invoice file input | PASS | exactly one matching element |
| OCR Analyze Invoice button | PASS | exactly one matching element |
| /purchasing/receive route | PASS | rendered with title Purchase Receiving Workspace |
| Receiving Supplier input | PASS | exactly one matching element |
| Receiving Invoice Number | PASS | exactly one matching element |
| Receiving Invoice Date | PASS | exactly one matching element |
| Financial Reconciliation panel | PASS | exactly one matching element |
| Reviewed Printed Invoice Total | PASS | exactly one matching element |
| Approve & Receive Stock button | PASS | exactly one matching element |
| /admin/users route | PASS | rendered with title Users & Roles |
| Create Shop User form | PASS | exactly one matching element |
| User Full Name input | PASS | exactly one matching element |
| User Email input | PASS | exactly one matching element |
| User Temporary Password input | PASS | exactly one matching element |
| User Role select | PASS | exactly one matching element |
| Create User button | PASS | exactly one matching element |
| /pos route | PASS | rendered with title Fast POS Billing |
| POS product search | PASS | exactly one matching element |
| POS CASH payment button | PASS | present |
| POS UPI payment button | PASS | present |
| POS CARD payment button | PASS | present |
| POS shift gate | PASS | present; preflight did not start shift |
| /pos/returns route | PASS | rendered with title Returns, Refunds & Voids |
| /operations/shifts route | PASS | rendered with title Cashier Shift & Day Close |
| /owner route | PASS | rendered with title Owner Control Center |
| /inventory/intelligence route | PASS | rendered with title Inventory Intelligence |
| /owner/profit route | PASS | rendered with title Profit & Business Intelligence |
| /purchasing/intelligence route | PASS | rendered |
| /reports route | PASS | rendered with title Reports & Exports |
| /inventory/ageing route | PASS | rendered |
| /inventory/count route | PASS | rendered |
| /inventory/transfers route | PASS | rendered |
| /operations/offline route | PASS | rendered |
| /admin/access route | PASS | rendered |
| /admin/audit route | PASS | rendered |
| /admin/backup route | PASS | rendered |
| /admin/settings route | PASS | rendered |
| /owner/recommendations route | PASS | rendered |
| /owner/exceptions route | PASS | rendered |
| /owner/ask route | PASS | rendered |

## Skipped dynamic contracts

- 16845 state: not currently present in Invoice Inbox
- Return form runtime controls: no sale exists yet; source contract verified

## Failure
```text
Error: Preflight collected 0 static failure(s) and 3 runtime DOM failure(s). See evidence for all failures.
    at runtimeContracts (file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_023005.mjs:402:11)
    at async file:///E:/WineShopPOS_V5_E2E_20260912_105856/tests/e2e/.wsp_harness_preflight_harness_preflight_20260913_023005.mjs:459:3
```