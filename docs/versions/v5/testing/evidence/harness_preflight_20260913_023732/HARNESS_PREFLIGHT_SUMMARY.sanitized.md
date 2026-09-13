# V5 Harness Preflight

**Result: PASS**

Run: `harness_preflight_20260913_023732`

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
| Products page | PASS | 2 source contract token(s) verified in src/pages/Products.jsx |
| Inventory page | PASS | 2 source contract token(s) verified in src/pages/Inventory.jsx |
| Sales page | PASS | 3 source contract token(s) verified in src/pages/Sales.jsx |
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
| /products route | PASS | rendered with source-backed title Products |
| /inventory route | PASS | rendered with source-backed title Inventory & Product Stock |
| /pos/sales route | PASS | rendered with source-backed title Sales |
| /purchasing/invoices route | PASS | rendered with source-backed title Invoice Inbox |
| Invoice Inbox status filter | PASS | exactly one matching element |
| /purchasing/ocr route | PASS | rendered with source-backed title Invoice OCR |
| OCR invoice file input | PASS | exactly one matching element |
| OCR Analyze Invoice button | PASS | exactly one matching element |
| /purchasing/receive route | PASS | rendered with source-backed title Purchase Receiving Workspace |
| Receiving Supplier input | PASS | exactly one matching element |
| Receiving Invoice Number | PASS | exactly one matching element |
| Receiving Invoice Date | PASS | exactly one matching element |
| Financial Reconciliation panel | PASS | exactly one matching element |
| Reviewed Printed Invoice Total | PASS | exactly one matching element |
| Approve & Receive Stock button | PASS | exactly one matching element |
| /admin/users route | PASS | rendered with source-backed title Users & Roles |
| Create Shop User form | PASS | exactly one matching element |
| User Full Name input | PASS | exactly one matching element |
| User Email input | PASS | exactly one matching element |
| User Temporary Password input | PASS | exactly one matching element |
| User Role select | PASS | exactly one matching element |
| Create User button | PASS | exactly one matching element |
| /pos route | PASS | rendered with source-backed title Fast POS Billing |
| POS product search | PASS | exactly one matching element |
| POS CASH payment button | PASS | present |
| POS UPI payment button | PASS | present |
| POS CARD payment button | PASS | present |
| POS shift gate | PASS | present; preflight did not start shift |
| /pos/returns route | PASS | rendered with source-backed title Returns, Refunds & Voids |
| /operations/shifts route | PASS | rendered with source-backed title Cashier Shift & Day Close |
| /owner route | PASS | rendered with source-backed title Owner Control Center |
| /inventory/intelligence route | PASS | rendered with source-backed title Inventory Intelligence |
| /owner/profit route | PASS | rendered with source-backed title Profit & Business Intelligence |
| /purchasing/intelligence route | PASS | route remained active at #/purchasing/intelligence |
| /reports route | PASS | rendered with source-backed title Reports & Exports |
| /inventory/ageing route | PASS | route remained active at #/inventory/ageing |
| /inventory/count route | PASS | route remained active at #/inventory/count |
| /inventory/transfers route | PASS | route remained active at #/inventory/transfers |
| /operations/offline route | PASS | route remained active at #/operations/offline |
| /admin/access route | PASS | route remained active at #/admin/access |
| /admin/audit route | PASS | route remained active at #/admin/audit |
| /admin/backup route | PASS | route remained active at #/admin/backup |
| /admin/settings route | PASS | route remained active at #/admin/settings |
| /owner/recommendations route | PASS | route remained active at #/owner/recommendations |
| /owner/exceptions route | PASS | route remained active at #/owner/exceptions |
| /owner/ask route | PASS | route remained active at #/owner/ask |

## Skipped dynamic contracts

- 16845 state: not currently present in Invoice Inbox
- Return form runtime controls: no sale exists yet; source contract verified