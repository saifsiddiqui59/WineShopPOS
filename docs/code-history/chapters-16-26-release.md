# WineShopPOS Chapters 16-26 — Actual Git Release History

> Generated from the real release commit. Git is the source of truth; this is not reconstructed from chat memory.

## Commit

```text
Commit: da2b8d6db139bd0d73e4eb5ee56613e7a759b9ce
Short: da2b8d6
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T16:39:59-04:00
Subject: Chapters 16-26 - Production operations offline OCR and audit
```

## Changed files

```text
A	docs/PRODUCTION_RUNBOOK_CH16_26.md
A	docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md
A	docs/chapters/16-professional-barcode-scanner.md
A	docs/chapters/17-returns-refunds-voids.md
A	docs/chapters/18-cashier-shift-day-close.md
A	docs/chapters/19-physical-stock-count.md
A	docs/chapters/20-thermal-receipt-printer.md
A	docs/chapters/21-supplier-purchase-improvements.md
A	docs/chapters/22-smart-reordering.md
A	docs/chapters/23-multi-shop-stock-transfer.md
A	docs/chapters/24-owner-controls-audit.md
A	docs/chapters/25-offline-pos.md
A	docs/chapters/26-ocr-compliance-automation.md
A	docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md
A	docs/handbook/WineShopPOS_Developer_Handbook_Chapters_16_26.docx
A	docs/handoff/NEXT_CHAT_CONTEXT_CH16_26.txt
A	docs/manual/WineShopPOS_User_Manual_Advanced.docx
A	docs/manual/WineShopPOS_User_Manual_Advanced.md
A	docs/testing/CHAPTERS_16_26_TEST_MATRIX.md
M	index.html
A	public/manifest.webmanifest
A	public/sw.js
A	scripts/apply_chapters_16_26.sh
A	scripts/create_document_intelligence_f0.sh
M	src/App.jsx
A	src/chapters16to26.css
M	src/components/Layout.jsx
A	src/components/OfflineStatus.jsx
A	src/components/Receipt80mm.jsx
M	src/context/AuthContext.jsx
A	src/context/ScannerContext.jsx
M	src/context/ShopContext.jsx
A	src/lib/offlineQueue.js
M	src/main.jsx
M	src/pages/AddProduct.jsx
A	src/pages/Audit.jsx
A	src/pages/AutomationHub.jsx
A	src/pages/OfflineQueue.jsx
M	src/pages/POS.jsx
A	src/pages/PriceHistory.jsx
A	src/pages/PrinterSettings.jsx
A	src/pages/Procurement.jsx
M	src/pages/Purchases.jsx
A	src/pages/Reorder.jsx
A	src/pages/Returns.jsx
M	src/pages/SaleDetails.jsx
A	src/pages/ScannerSettings.jsx
A	src/pages/Shifts.jsx
A	src/pages/StockCount.jsx
A	src/pages/Transfers.jsx
A	supabase/functions/ocr-invoice/index.ts
A	supabase/migrations/20260829190000_chapters_16_26.sql
```

## Exact release patch

`````diff
commit da2b8d6db139bd0d73e4eb5ee56613e7a759b9ce
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sat Aug 29 16:39:59 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sat Aug 29 16:39:59 2026 -0400

    Chapters 16-26 - Production operations offline OCR and audit
---
 docs/PRODUCTION_RUNBOOK_CH16_26.md                 |   47 +
 docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md       |   15 +
 docs/chapters/16-professional-barcode-scanner.md   |   28 +
 docs/chapters/17-returns-refunds-voids.md          |   22 +
 docs/chapters/18-cashier-shift-day-close.md        |   19 +
 docs/chapters/19-physical-stock-count.md           |   17 +
 docs/chapters/20-thermal-receipt-printer.md        |   17 +
 docs/chapters/21-supplier-purchase-improvements.md |   22 +
 docs/chapters/22-smart-reordering.md               |   21 +
 docs/chapters/23-multi-shop-stock-transfer.md      |   15 +
 docs/chapters/24-owner-controls-audit.md           |   19 +
 docs/chapters/25-offline-pos.md                    |   24 +
 docs/chapters/26-ocr-compliance-automation.md      |   37 +
 .../WineShopPOS_Developer_Handbook_Ch16_26.md      |  505 +++++++
 ...eShopPOS_Developer_Handbook_Chapters_16_26.docx |  Bin 0 -> 50847 bytes
 docs/handoff/NEXT_CHAT_CONTEXT_CH16_26.txt         |   38 +
 docs/manual/WineShopPOS_User_Manual_Advanced.docx  |  Bin 0 -> 41986 bytes
 docs/manual/WineShopPOS_User_Manual_Advanced.md    |  140 ++
 docs/testing/CHAPTERS_16_26_TEST_MATRIX.md         |   84 ++
 index.html                                         |    3 +-
 public/manifest.webmanifest                        |    9 +
 public/sw.js                                       |   28 +
 scripts/apply_chapters_16_26.sh                    |  280 ++++
 scripts/create_document_intelligence_f0.sh         |  186 +++
 src/App.jsx                                        |   51 +-
 src/chapters16to26.css                             |    4 +
 src/components/Layout.jsx                          |  113 +-
 src/components/OfflineStatus.jsx                   |   32 +
 src/components/Receipt80mm.jsx                     |   44 +
 src/context/AuthContext.jsx                        |  102 +-
 src/context/ScannerContext.jsx                     |  170 +++
 src/context/ShopContext.jsx                        |  667 ++-------
 src/lib/offlineQueue.js                            |  168 +++
 src/main.jsx                                       |   23 +-
 src/pages/AddProduct.jsx                           |   20 +-
 src/pages/Audit.jsx                                |    4 +
 src/pages/AutomationHub.jsx                        |   11 +
 src/pages/OfflineQueue.jsx                         |    6 +
 src/pages/POS.jsx                                  |  204 +--
 src/pages/PriceHistory.jsx                         |    5 +
 src/pages/PrinterSettings.jsx                      |   11 +
 src/pages/Procurement.jsx                          |   20 +
 src/pages/Purchases.jsx                            |  186 +--
 src/pages/Reorder.jsx                              |    7 +
 src/pages/Returns.jsx                              |   32 +
 src/pages/SaleDetails.jsx                          |   50 +-
 src/pages/ScannerSettings.jsx                      |   36 +
 src/pages/Shifts.jsx                               |   17 +
 src/pages/StockCount.jsx                           |   20 +
 src/pages/Transfers.jsx                            |   12 +
 supabase/functions/ocr-invoice/index.ts            |  184 +++
 .../migrations/20260829190000_chapters_16_26.sql   | 1482 ++++++++++++++++++++
 52 files changed, 4044 insertions(+), 1213 deletions(-)

diff --git a/docs/PRODUCTION_RUNBOOK_CH16_26.md b/docs/PRODUCTION_RUNBOOK_CH16_26.md
new file mode 100644
index 0000000..a74a3c6
--- /dev/null
+++ b/docs/PRODUCTION_RUNBOOK_CH16_26.md
@@ -0,0 +1,47 @@
+# Production Runbook — Chapters 16–26
+
+## Deploy order
+1. Backup source/Git checkpoint.
+2. Production React build.
+3. Supabase migration dry-run.
+4. Push migration.
+5. Create/reuse Azure Document Intelligence **F0 only** and set its secrets in Supabase.
+6. Deploy `ocr-invoice` Edge Function.
+7. Production build again.
+8. Commit code/docs.
+9. Generate actual Git release code-history from the release commit.
+10. Commit code-history.
+11. One network `git push`.
+12. Upload `dist/` to Azure `$web`.
+
+## OCR activation
+The final installer performs this automatically and is intentionally cost-safe:
+
+1. Selects `Azure subscription 1`.
+2. Uses resource group `wineshopPOS`.
+3. Discovers whether `FormRecognizer` and SKU `F0` are available in `centralindia`.
+4. Reuses an existing F0 Document Intelligence account if one already exists in the subscription; otherwise creates a new F0 account.
+5. **Stops instead of creating S0** if F0 cannot be created.
+6. Retrieves the endpoint/key locally.
+7. Places them in Supabase Edge Function secrets, never browser configuration.
+8. Deletes the temporary local secrets file.
+9. Deploys `ocr-invoice`.
+
+The Azure secret must never be placed in `.env.local`, React source, Markdown, Word files or Git.
+
+## Create a second branch
+Create the new shop through platform operations, then assign both shops the same `organization_id`. Do **not** simply reuse an organization across unrelated customers.
+
+## Rollback strategy
+- Frontend: redeploy the previous Git commit's `dist`.
+- Database: migrations are additive; do not manually drop tables in production. Fix forward with a new migration.
+- Offline conflicts: never delete a conflict until a manager has compared the offline receipt and cloud stock.
+
+## Daily operational checks
+- pending return requests
+- CLOSE_REQUESTED shifts
+- submitted stock counts
+- offline conflicts
+- supplier balances
+- low-stock reorder suggestions
+- audit exceptions
diff --git a/docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md b/docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md
new file mode 100644
index 0000000..937536c
--- /dev/null
+++ b/docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md
@@ -0,0 +1,15 @@
+# Azure Document Intelligence — WineShopPOS
+
+- Resource name: `wineshoppos-docintel-45b7d2b9`
+- Resource group: `wineshopPOS`
+- Location: `centralindia`
+- Kind: `FormRecognizer`
+- SKU: `F0`
+- Endpoint: `https://wineshoppos-docintel-45b7d2b9-9a6f8.cognitiveservices.azure.com/`
+- Reused existing resource: `false`
+- Model used by application: `prebuilt-invoice`
+- REST API version: `2024-11-30`
+
+The subscription key is intentionally **not documented or committed**. It is stored only as a Supabase Edge Function secret.
+
+Cost rule: the deployment automation accepts F0 only and has no automatic S0 fallback.
diff --git a/docs/chapters/16-professional-barcode-scanner.md b/docs/chapters/16-professional-barcode-scanner.md
new file mode 100644
index 0000000..3b96ed1
--- /dev/null
+++ b/docs/chapters/16-professional-barcode-scanner.md
@@ -0,0 +1,28 @@
+# Chapter 16 — Professional Barcode Scanner
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Make a normal USB/Bluetooth HID scanner feel like a commercial POS device.
+
+## Implementation
+- `src/context/ScannerContext.jsx` owns a global capturing `keydown` listener.
+- Rapid key sequences are distinguished from human typing using average inter-key delay.
+- Enter terminates a scan.
+- The input field value present before scanning is snapshotted and restored when the sequence is classified as scanner input. This prevents the completed barcode from remaining in discount, payment-reference, search or other fields.
+- Once the sequence is confidently scanner-like, later characters are prevented immediately.
+- `src/pages/POS.jsx` subscribes to the scanner event, looks up an active product and auto-adds it.
+- Repeated barcode scans increment cart quantity.
+- WebAudio provides separate success/error tones.
+- Unknown scans show a large PRODUCT NOT FOUND banner and link to Add Product with `?barcode=` prefilled.
+- `ScannerSettings.jsx` exposes minimum barcode length, average key-gap threshold and reset interval plus live diagnostics.
+
+## Operational note
+The scanner should be configured in its manufacturer settings to append Enter/CR after each barcode.
+
+## Tests
+1. Focus Discount and scan `8900000010016`; discount must remain unchanged after the scan.
+2. Scan the same barcode twice; cart quantity becomes 2.
+3. Slowly type six digits; it must not be treated as a scan.
+4. Scan an unknown barcode; error tone + Add Product action appears.
+5. Create the unknown product; barcode is already populated.
diff --git a/docs/chapters/17-returns-refunds-voids.md b/docs/chapters/17-returns-refunds-voids.md
new file mode 100644
index 0000000..3578217
--- /dev/null
+++ b/docs/chapters/17-returns-refunds-voids.md
@@ -0,0 +1,22 @@
+# Chapter 17 — Returns, Refunds & Voids
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Restore inventory and payment history safely rather than editing past sales.
+
+## Database
+- `sale_return_requests`
+- `sale_return_items`
+- RPCs: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.
+
+## Workflow
+Cashier can request a return. Stock does **not** move at request time. Manager/Admin approval adds stock, creates `CUSTOMER_RETURN` stock movements and records a `REFUND` payment. Refund value is allocated using the original sale's effective discount ratio. Full returned quantity marks the sale RETURNED; otherwise PARTIAL_RETURN.
+
+Void is Manager/Admin only and only for a clean COMPLETED invoice without return activity. It restores all items and records `SALE_VOID` movements plus refund payment.
+
+## Tests
+- Request 1 of 2 sold units: stock unchanged while PENDING; +1 after approval.
+- Attempt a second return beyond remaining quantity: rejected.
+- Reject request: stock/payment unchanged.
+- Void clean invoice: all stock restored and status VOID.
diff --git a/docs/chapters/18-cashier-shift-day-close.md b/docs/chapters/18-cashier-shift-day-close.md
new file mode 100644
index 0000000..aad08a3
--- /dev/null
+++ b/docs/chapters/18-cashier-shift-day-close.md
@@ -0,0 +1,19 @@
+# Chapter 18 — Cashier Shift & Day Close
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Tie cashier activity to an auditable till shift.
+
+## Database
+`cashier_shifts` stores opening cash, Cash/UPI/Card totals, cash refunds, expected cash, actual cash, variance, approval and timestamps.
+
+## Rules
+- Cashier must have an OPEN shift before `complete_sale_v2` accepts a sale.
+- Admin/Manager can bill without a cashier shift for administrative use.
+- Close request snapshots payment totals.
+- Expected cash = opening cash + cash payments - cash refunds.
+- Manager/Admin approves CLOSE_REQUESTED to CLOSED.
+
+## Tests
+Open ₹5,000; sell ₹1,000 cash + ₹500 UPI; request close with ₹5,950 actual. Expected ₹6,000 and difference -₹50.
diff --git a/docs/chapters/19-physical-stock-count.md b/docs/chapters/19-physical-stock-count.md
new file mode 100644
index 0000000..a2a0ac2
--- /dev/null
+++ b/docs/chapters/19-physical-stock-count.md
@@ -0,0 +1,17 @@
+# Chapter 19 — Physical Stock Count
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Use barcode scanning to perform a controlled physical count and post only approved discrepancies.
+
+## Database
+- `stock_counts`
+- `stock_count_items`
+
+Creating a count snapshots every active SKU's current system quantity. Scanning increments counted quantity. Manual quantity is available for cases/shelves where scanning every unit is impractical.
+
+Unscanned SKUs remain NULL rather than silently becoming zero. A deliberate **Mark Unseen = 0** step is required before submission. Approval replaces system quantity with counted quantity and creates both stock-adjustment and `STOCK_COUNT` movement records.
+
+## Tests
+Count expected 26 as 24 → submit → approval produces -2 movement. Cancel/unfinished count must never modify inventory.
diff --git a/docs/chapters/20-thermal-receipt-printer.md b/docs/chapters/20-thermal-receipt-printer.md
new file mode 100644
index 0000000..1115b68
--- /dev/null
+++ b/docs/chapters/20-thermal-receipt-printer.md
@@ -0,0 +1,17 @@
+# Chapter 20 — Thermal Receipt Printer
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Produce a clean 80mm/58mm thermal receipt from the static web application.
+
+## Implementation
+- `Receipt80mm.jsx` renders invoice, store header, lines, totals and payment.
+- print CSS uses `@page` and thermal widths.
+- Printer Settings stores address, phone, registration text, footer and 58/80mm paper width.
+
+## Important browser boundary
+The production frontend is an Azure Blob static website. It can open the browser print dialog and print to an installed USB/Bluetooth thermal printer. It cannot safely guarantee silent raw ESC/POS access for arbitrary printers. Silent printing would require a trusted local bridge/native helper or vendor-specific WebUSB integration.
+
+## Tests
+Install printer in Windows; open invoice → Print Receipt → choose printer → verify no clipping and correct width.
diff --git a/docs/chapters/21-supplier-purchase-improvements.md b/docs/chapters/21-supplier-purchase-improvements.md
new file mode 100644
index 0000000..38ffaae
--- /dev/null
+++ b/docs/chapters/21-supplier-purchase-improvements.md
@@ -0,0 +1,22 @@
+# Chapter 21 — Supplier & Purchase Improvements
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Extend receiving into a procurement/ledger workflow.
+
+## Database
+- `purchase_orders`, `purchase_order_items`
+- `supplier_payments`
+- `purchase_returns`, `purchase_return_items`
+- purchases may reference `purchase_order_id`.
+
+## Workflow
+Create PO → mark sent → receive full/partial quantities → regular `receive_purchase` updates inventory → supplier balance = received purchases - supplier payments - completed purchase returns.
+
+Supplier return validates on-hand stock, deducts quantity and creates `SUPPLIER_RETURN` stock movements.
+
+`purchase_price_history` provides historical unit purchase price by invoice. The Price History UI calculates oldest-to-latest percentage change.
+
+## Tests
+Create PO 24 bottles; receive → inventory +24. Record supplier payment → balance falls. Return 2 bottles → inventory -2 and balance falls by returned value.
diff --git a/docs/chapters/22-smart-reordering.md b/docs/chapters/22-smart-reordering.md
new file mode 100644
index 0000000..98c905f
--- /dev/null
+++ b/docs/chapters/22-smart-reordering.md
@@ -0,0 +1,21 @@
+# Chapter 22 — Smart Reordering
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Suggest orders using facts already in the POS instead of AI.
+
+## Formula
+- history window default: 30 days
+- average daily sales = units sold / history days
+- days remaining = current stock / average daily sales
+- desired quantity = max(avg daily × target days, minimum stock)
+- suggested bottles = max(0, desired quantity - current stock)
+- suggested cases = ceil(suggested bottles / units per case)
+
+`reorder_suggestions` ignores voided/fully returned sales and returns only products below minimum or within target days.
+
+The UI can create a Purchase Order from a recommendation.
+
+## Tests
+A product selling 11/day, stock 18, target 7 days should show low days remaining and a positive case suggestion.
diff --git a/docs/chapters/23-multi-shop-stock-transfer.md b/docs/chapters/23-multi-shop-stock-transfer.md
new file mode 100644
index 0000000..50d053e
--- /dev/null
+++ b/docs/chapters/23-multi-shop-stock-transfer.md
@@ -0,0 +1,15 @@
+# Chapter 23 — Multi-Shop Stock Transfer
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Architecture decision
+The existing Chapter 15 `shop_id` model separated **customers/tenants**. It was unsafe to assume every shop belonged to the same owner. Chapter 23 adds `organizations`; existing shops are initially placed into separate organizations. Only shops intentionally assigned to the same organization become branches eligible for transfers.
+
+## Workflow
+Source Manager/Admin requests transfer. No inventory changes yet. Destination Manager/Admin approves. Approval locks source stock, revalidates quantity, creates/copies destination product by barcode if needed, subtracts source, adds destination, and posts paired `TRANSFER_OUT` / `TRANSFER_IN` movements in one transaction.
+
+## Tests
+- Unrelated organizations cannot appear as destinations.
+- Request does not alter stock.
+- Approval -24 source/+24 destination.
+- Insufficient source stock at approval rejects entire transaction.
diff --git a/docs/chapters/24-owner-controls-audit.md b/docs/chapters/24-owner-controls-audit.md
new file mode 100644
index 0000000..db825a2
--- /dev/null
+++ b/docs/chapters/24-owner-controls-audit.md
@@ -0,0 +1,19 @@
+# Chapter 24 — Owner Controls & Audit
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Provide traceability for commercial operations.
+
+## Database
+`audit_logs` captures actor, action, entity, old/new JSON, metadata and time. Product/supplier/sale/purchase triggers record row changes; transactional RPCs add explicit business events for returns, voids, shifts, counts, POs, payments and transfers.
+
+## RLS hardening
+- Cashier sales SELECT is limited to own invoices.
+- Sale items/payments follow accessible sales.
+- Purchases and procurement data are Manager/Admin only.
+- `get_products()` masks purchase price for Cashier.
+- Audit is ADMIN only.
+
+## Tests
+Change selling price and verify old/new row in Audit. Approve return and verify RETURN_APPROVED event. Cashier must not see other cashier sales or purchase-cost data.
diff --git a/docs/chapters/25-offline-pos.md b/docs/chapters/25-offline-pos.md
new file mode 100644
index 0000000..f0afff9
--- /dev/null
+++ b/docs/chapters/25-offline-pos.md
@@ -0,0 +1,24 @@
+# Chapter 25 — Offline POS
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Provide emergency selling after a device has already authenticated and cached the catalog.
+
+## Client design
+- service worker caches visited app resources.
+- last cloud catalog/inventory is cached locally for emergency operation.
+- offline sales are stored in IndexedDB.
+- sale payload is encrypted with a non-extractable AES-GCM WebCrypto key stored in IndexedDB.
+- every sale has a UUID `client_sale_id` for idempotency.
+
+## Sync design
+`sync_offline_sale` calls the server-side transaction. Supabase re-reads live product prices and locks current stock. If stock is insufficient or the shift is no longer valid, the item becomes CONFLICT rather than being forced into the database.
+
+## Boundaries
+- First-time/cold login still requires internet.
+- Offline queue does not make supplier, user-management, returns or stock adjustments offline-capable.
+- Cashier should sync before closing the shift.
+
+## Tests
+Load online → disconnect → create sale → queue shows PENDING → reconnect → Sync Now → inventory/sale appears once. Re-sync same client UUID must not duplicate.
diff --git a/docs/chapters/26-ocr-compliance-automation.md b/docs/chapters/26-ocr-compliance-automation.md
new file mode 100644
index 0000000..c2bca61
--- /dev/null
+++ b/docs/chapters/26-ocr-compliance-automation.md
@@ -0,0 +1,37 @@
+# Chapter 26 — OCR, Compliance & Automation
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## OCR
+A Supabase Edge Function `ocr-invoice` integrates Azure AI Document Intelligence `prebuilt-invoice` using API version `2024-11-30`. Azure credentials remain Edge Function secrets, never Vite/browser variables.
+
+The frontend sends invoice image/PDF → OCR extracts supplier/invoice/date/items → `match_product_text` uses aliases/trigram similarity → human review → draft is sent to Receive Stock. **OCR never modifies inventory directly.**
+
+If Azure secrets are absent, the feature returns `OCR_NOT_CONFIGURED` and the rest of the application continues normally.
+
+## Product aliases
+`product_aliases` allows supplier/OCR wording to be taught to a product without renaming the product master.
+
+## Compliance boundary
+State/excise compliance is intentionally not labeled complete. India alcohol reporting is jurisdiction/license specific. A future chapter must identify state, license class, statutory forms and reporting rules before implementation/certification.
+
+## Future AI
+Anomaly detection, forecasting and an owner assistant may be added over audited read models; they must never bypass transaction-safe RPCs or approval controls.
+
+## Azure free-tier deployment used by this release
+
+The release installer creates or reuses an Azure AI Document Intelligence resource of kind `FormRecognizer` in the existing `wineshopPOS` resource group. It **only accepts F0**. There is deliberately no automatic S0 fallback. If F0 is unavailable, the installer stops before creating a paid OCR resource.
+
+Target Azure configuration:
+- Subscription: `Azure subscription 1`
+- Resource group: `wineshopPOS`
+- Preferred region: `centralindia`
+- Kind: `FormRecognizer`
+- SKU: `F0`
+- Model: `prebuilt-invoice`
+- REST API: `2024-11-30`
+
+The installer retrieves the Azure endpoint/key locally and sends them directly to Supabase Edge Function secrets using a temporary file outside the repository. The Azure key is never written to React, `.env.local`, Git documentation, or source control.
+
+### F0 operational limits
+F0 is intended for development/light testing. The application enforces a 4 MB file guard and tells the operator that only the first two pages are analyzed on F0. When production invoice volume exceeds the free allowance, upgrade deliberately rather than allowing an automatic paid fallback.
diff --git a/docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md b/docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md
new file mode 100644
index 0000000..bc0cab1
--- /dev/null
+++ b/docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md
@@ -0,0 +1,505 @@
+# WineShopPOS Developer Handbook — Chapters 16–26
+
+Version: Production-expansion release, 29-Aug-2026
+
+## Purpose
+This addendum is the canonical technical handbook for the Chapters 16–26 expansion of the existing WineShopPOS cloud MVP. It is meant to let a future developer or a new ChatGPT session continue safely without replaying the implementation conversation.
+
+## Starting architecture
+Before this release the application already had React/Vite, Supabase Auth, multi-shop RLS, products/inventory/purchases/sales/payments/stock movements, Admin/Manager/Cashier roles, a subscription kill switch, a secure `manage-shop-users` Edge Function, and Azure Blob Static Website hosting.
+
+The release is additive. It deliberately does not replace the proven Chapter 15 transaction core.
+
+## Non-negotiable invariants
+1. `shop_id` is customer/branch isolation and must never be taken from browser input for a stock transaction.
+2. All stock changes happen in database transactions/RPCs.
+3. Inventory may never become negative.
+4. A pending approval never changes stock.
+5. Cross-shop transfers require both shops to share an explicit organization.
+6. OCR is advisory until a person confirms the receipt.
+7. Offline sync revalidates cloud stock and does not force conflicts.
+8. Supabase service-role/Azure OCR secrets never enter the React bundle or Git.
+
+## New database model
+### Organizations
+`organizations` groups branches owned by the same customer. Existing shops are migrated into separate organizations to preserve tenant isolation. A platform operator may later place multiple branches into one organization.
+
+### Returns
+`sale_return_requests` and `sale_return_items` separate request from approval. Refund payments remain positive numbers with `payment_type='REFUND'`; reports subtract them according to type instead of relying on negative monetary rows.
+
+### Shifts
+`cashier_shifts` records opening cash, tender totals, expected/actual cash, variance, request and approval timestamps.
+
+### Stock count
+`stock_counts` is the count session; `stock_count_items` is a full snapshot of active SKU expectations. NULL counted quantity means not yet counted and is intentionally different from zero.
+
+### Procurement
+`purchase_orders`, `purchase_order_items`, `supplier_payments`, `purchase_returns`, and `purchase_return_items` extend the existing `purchases`/`purchase_items` receipt ledger.
+
+### Transfers
+`stock_transfers` and `stock_transfer_items` implement a request/approval model. Stock changes only during destination approval.
+
+### Audit
+`audit_logs` captures actor/action/entity/old/new JSON/metadata. Business RPCs add semantic audit events while row triggers preserve before/after state for key master/transaction tables.
+
+### OCR aliases
+`product_aliases` lets a supplier invoice description map to the internal product without changing the product name.
+
+## New transaction API
+- `get_products()` — role-safe product read; hides purchase price from Cashier.
+- `update_product_details()` / `set_product_active()` — Manager/Admin product write RPCs.
+- returns: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.
+- shifts: `open_shift`, `my_open_shift`, `shift_totals`, `request_close_shift`, `approve_shift_close`.
+- stock count: `create_stock_count`, `stock_count_scan`, `set_stock_count_quantity`, `mark_unseen_stock_count_zero`, `submit_stock_count`, `approve_stock_count`.
+- purchasing: `create_purchase_order`, `set_purchase_order_status`, `receive_purchase_order`, `record_supplier_payment`, `create_purchase_return`, `supplier_balances`, `purchase_price_history`.
+- reordering: `reorder_suggestions`.
+- transfers: `available_transfer_destinations`, `create_stock_transfer`, `cancel_stock_transfer`, `reject_stock_transfer`, `approve_stock_transfer`.
+- offline/idempotent sale: `complete_sale_v2`, `sync_offline_sale`.
+- OCR matching: `match_product_text`.
+
+## Frontend modules
+- global scanner: `src/context/ScannerContext.jsx`
+- encrypted offline queue: `src/lib/offlineQueue.js`
+- offline indicator: `src/components/OfflineStatus.jsx`
+- thermal receipt: `src/components/Receipt80mm.jsx`
+- pages: Scanner Settings, Returns, Shifts, Stock Count, Printer Settings, Procurement, Price History, Reorder, Transfers, Audit, Offline Queue, Automation Hub.
+
+## Offline security design
+IndexedDB stores only AES-GCM ciphertext and metadata for queued sale payloads. The AES key is generated through WebCrypto as non-extractable and kept in IndexedDB as a CryptoKey object. The client sale UUID is intentionally visible because it is an idempotency key, not customer/product content.
+
+Offline mode is not positioned as a full disconnected ERP. The device must already have a valid cached session/catalog. Cloud synchronization is authoritative and may produce a conflict if stock, price, authorization or shift state no longer permits the sale.
+
+## Thermal printing boundary
+An Azure Blob static web app has no universal trusted route to silently write raw ESC/POS bytes to arbitrary local USB/Bluetooth printers. This release therefore produces a real 58/80mm receipt layout and uses the operating system/browser print path. If a specific printer model later requires silent printing, add a separately installed, signed local print bridge or carefully evaluated device-specific WebUSB integration.
+
+## OCR design
+The `ocr-invoice` Edge Function calls Azure AI Document Intelligence's `prebuilt-invoice` model. OCR credentials are read only from Edge Function secrets. The browser receives normalized invoice fields, asks PostgreSQL for product candidates, then requires human confirmation before `receive_purchase()` changes inventory.
+
+## Compliance boundary
+No generic report is labeled excise/statutory compliant. Alcohol compliance in India depends on state, license class, statutory forms and filing rules. Before building Chapter 26 compliance reports, record exact jurisdiction and obtain the official report specification.
+
+## Deployment strategy
+The single release script checkpoints a dirty repo if necessary, writes all generated files, runs a Vite production build, runs Supabase migration dry-run and push, deploys the OCR Edge Function, builds again, creates local Git commits, generates an **actual** Git patch/code-history from the release commit, makes a second documentation commit, performs one network `git push`, then uploads `dist/` to Azure Blob `$web`.
+
+## Rollback
+Frontend rollback is Git-based: build and redeploy a previous known-good commit. Database changes are additive and should be fixed forward with a new migration; never manually drop live transactional tables as a rollback shortcut.
+
+## Security review after release
+- rotate any secret ever pasted into chat or terminal history.
+- enforce MFA for privileged accounts.
+- review Admin/Manager/Cashier user list monthly.
+- monitor audit/void/refund/stock-adjustment events.
+- keep service-role and Azure OCR keys in server-side secrets only.
+- for commercial rollout, add formal staging, automated integration tests, database backups and deployment approvals.
+
+
+---
+
+# Chapter 16 — Professional Barcode Scanner
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Make a normal USB/Bluetooth HID scanner feel like a commercial POS device.
+
+## Implementation
+- `src/context/ScannerContext.jsx` owns a global capturing `keydown` listener.
+- Rapid key sequences are distinguished from human typing using average inter-key delay.
+- Enter terminates a scan.
+- The input field value present before scanning is snapshotted and restored when the sequence is classified as scanner input. This prevents the completed barcode from remaining in discount, payment-reference, search or other fields.
+- Once the sequence is confidently scanner-like, later characters are prevented immediately.
+- `src/pages/POS.jsx` subscribes to the scanner event, looks up an active product and auto-adds it.
+- Repeated barcode scans increment cart quantity.
+- WebAudio provides separate success/error tones.
+- Unknown scans show a large PRODUCT NOT FOUND banner and link to Add Product with `?barcode=` prefilled.
+- `ScannerSettings.jsx` exposes minimum barcode length, average key-gap threshold and reset interval plus live diagnostics.
+
+## Operational note
+The scanner should be configured in its manufacturer settings to append Enter/CR after each barcode.
+
+## Tests
+1. Focus Discount and scan `8900000010016`; discount must remain unchanged after the scan.
+2. Scan the same barcode twice; cart quantity becomes 2.
+3. Slowly type six digits; it must not be treated as a scan.
+4. Scan an unknown barcode; error tone + Add Product action appears.
+5. Create the unknown product; barcode is already populated.
+
+
+---
+
+# Chapter 17 — Returns, Refunds & Voids
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Restore inventory and payment history safely rather than editing past sales.
+
+## Database
+- `sale_return_requests`
+- `sale_return_items`
+- RPCs: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.
+
+## Workflow
+Cashier can request a return. Stock does **not** move at request time. Manager/Admin approval adds stock, creates `CUSTOMER_RETURN` stock movements and records a `REFUND` payment. Refund value is allocated using the original sale's effective discount ratio. Full returned quantity marks the sale RETURNED; otherwise PARTIAL_RETURN.
+
+Void is Manager/Admin only and only for a clean COMPLETED invoice without return activity. It restores all items and records `SALE_VOID` movements plus refund payment.
+
+## Tests
+- Request 1 of 2 sold units: stock unchanged while PENDING; +1 after approval.
+- Attempt a second return beyond remaining quantity: rejected.
+- Reject request: stock/payment unchanged.
+- Void clean invoice: all stock restored and status VOID.
+
+
+---
+
+# Chapter 18 — Cashier Shift & Day Close
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Tie cashier activity to an auditable till shift.
+
+## Database
+`cashier_shifts` stores opening cash, Cash/UPI/Card totals, cash refunds, expected cash, actual cash, variance, approval and timestamps.
+
+## Rules
+- Cashier must have an OPEN shift before `complete_sale_v2` accepts a sale.
+- Admin/Manager can bill without a cashier shift for administrative use.
+- Close request snapshots payment totals.
+- Expected cash = opening cash + cash payments - cash refunds.
+- Manager/Admin approves CLOSE_REQUESTED to CLOSED.
+
+## Tests
+Open ₹5,000; sell ₹1,000 cash + ₹500 UPI; request close with ₹5,950 actual. Expected ₹6,000 and difference -₹50.
+
+
+---
+
+# Chapter 19 — Physical Stock Count
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Use barcode scanning to perform a controlled physical count and post only approved discrepancies.
+
+## Database
+- `stock_counts`
+- `stock_count_items`
+
+Creating a count snapshots every active SKU's current system quantity. Scanning increments counted quantity. Manual quantity is available for cases/shelves where scanning every unit is impractical.
+
+Unscanned SKUs remain NULL rather than silently becoming zero. A deliberate **Mark Unseen = 0** step is required before submission. Approval replaces system quantity with counted quantity and creates both stock-adjustment and `STOCK_COUNT` movement records.
+
+## Tests
+Count expected 26 as 24 → submit → approval produces -2 movement. Cancel/unfinished count must never modify inventory.
+
+
+---
+
+# Chapter 20 — Thermal Receipt Printer
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Produce a clean 80mm/58mm thermal receipt from the static web application.
+
+## Implementation
+- `Receipt80mm.jsx` renders invoice, store header, lines, totals and payment.
+- print CSS uses `@page` and thermal widths.
+- Printer Settings stores address, phone, registration text, footer and 58/80mm paper width.
+
+## Important browser boundary
+The production frontend is an Azure Blob static website. It can open the browser print dialog and print to an installed USB/Bluetooth thermal printer. It cannot safely guarantee silent raw ESC/POS access for arbitrary printers. Silent printing would require a trusted local bridge/native helper or vendor-specific WebUSB integration.
+
+## Tests
+Install printer in Windows; open invoice → Print Receipt → choose printer → verify no clipping and correct width.
+
+
+---
+
+# Chapter 21 — Supplier & Purchase Improvements
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Extend receiving into a procurement/ledger workflow.
+
+## Database
+- `purchase_orders`, `purchase_order_items`
+- `supplier_payments`
+- `purchase_returns`, `purchase_return_items`
+- purchases may reference `purchase_order_id`.
+
+## Workflow
+Create PO → mark sent → receive full/partial quantities → regular `receive_purchase` updates inventory → supplier balance = received purchases - supplier payments - completed purchase returns.
+
+Supplier return validates on-hand stock, deducts quantity and creates `SUPPLIER_RETURN` stock movements.
+
+`purchase_price_history` provides historical unit purchase price by invoice. The Price History UI calculates oldest-to-latest percentage change.
+
+## Tests
+Create PO 24 bottles; receive → inventory +24. Record supplier payment → balance falls. Return 2 bottles → inventory -2 and balance falls by returned value.
+
+
+---
+
+# Chapter 22 — Smart Reordering
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Suggest orders using facts already in the POS instead of AI.
+
+## Formula
+- history window default: 30 days
+- average daily sales = units sold / history days
+- days remaining = current stock / average daily sales
+- desired quantity = max(avg daily × target days, minimum stock)
+- suggested bottles = max(0, desired quantity - current stock)
+- suggested cases = ceil(suggested bottles / units per case)
+
+`reorder_suggestions` ignores voided/fully returned sales and returns only products below minimum or within target days.
+
+The UI can create a Purchase Order from a recommendation.
+
+## Tests
+A product selling 11/day, stock 18, target 7 days should show low days remaining and a positive case suggestion.
+
+
+---
+
+# Chapter 23 — Multi-Shop Stock Transfer
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Architecture decision
+The existing Chapter 15 `shop_id` model separated **customers/tenants**. It was unsafe to assume every shop belonged to the same owner. Chapter 23 adds `organizations`; existing shops are initially placed into separate organizations. Only shops intentionally assigned to the same organization become branches eligible for transfers.
+
+## Workflow
+Source Manager/Admin requests transfer. No inventory changes yet. Destination Manager/Admin approves. Approval locks source stock, revalidates quantity, creates/copies destination product by barcode if needed, subtracts source, adds destination, and posts paired `TRANSFER_OUT` / `TRANSFER_IN` movements in one transaction.
+
+## Tests
+- Unrelated organizations cannot appear as destinations.
+- Request does not alter stock.
+- Approval -24 source/+24 destination.
+- Insufficient source stock at approval rejects entire transaction.
+
+
+---
+
+# Chapter 24 — Owner Controls & Audit
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Provide traceability for commercial operations.
+
+## Database
+`audit_logs` captures actor, action, entity, old/new JSON, metadata and time. Product/supplier/sale/purchase triggers record row changes; transactional RPCs add explicit business events for returns, voids, shifts, counts, POs, payments and transfers.
+
+## RLS hardening
+- Cashier sales SELECT is limited to own invoices.
+- Sale items/payments follow accessible sales.
+- Purchases and procurement data are Manager/Admin only.
+- `get_products()` masks purchase price for Cashier.
+- Audit is ADMIN only.
+
+## Tests
+Change selling price and verify old/new row in Audit. Approve return and verify RETURN_APPROVED event. Cashier must not see other cashier sales or purchase-cost data.
+
+
+---
+
+# Chapter 25 — Offline POS
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## Goal
+Provide emergency selling after a device has already authenticated and cached the catalog.
+
+## Client design
+- service worker caches visited app resources.
+- last cloud catalog/inventory is cached locally for emergency operation.
+- offline sales are stored in IndexedDB.
+- sale payload is encrypted with a non-extractable AES-GCM WebCrypto key stored in IndexedDB.
+- every sale has a UUID `client_sale_id` for idempotency.
+
+## Sync design
+`sync_offline_sale` calls the server-side transaction. Supabase re-reads live product prices and locks current stock. If stock is insufficient or the shift is no longer valid, the item becomes CONFLICT rather than being forced into the database.
+
+## Boundaries
+- First-time/cold login still requires internet.
+- Offline queue does not make supplier, user-management, returns or stock adjustments offline-capable.
+- Cashier should sync before closing the shift.
+
+## Tests
+Load online → disconnect → create sale → queue shows PENDING → reconnect → Sync Now → inventory/sale appears once. Re-sync same client UUID must not duplicate.
+
+
+---
+
+# Chapter 26 — OCR, Compliance & Automation
+
+Status: Implemented in Chapters 16–26 production-expansion release.
+
+## OCR
+A Supabase Edge Function `ocr-invoice` integrates Azure AI Document Intelligence `prebuilt-invoice` using API version `2024-11-30`. Azure credentials remain Edge Function secrets, never Vite/browser variables.
+
+The frontend sends invoice image/PDF → OCR extracts supplier/invoice/date/items → `match_product_text` uses aliases/trigram similarity → human review → draft is sent to Receive Stock. **OCR never modifies inventory directly.**
+
+If Azure secrets are absent, the feature returns `OCR_NOT_CONFIGURED` and the rest of the application continues normally.
+
+## Product aliases
+`product_aliases` allows supplier/OCR wording to be taught to a product without renaming the product master.
+
+## Compliance boundary
+State/excise compliance is intentionally not labeled complete. India alcohol reporting is jurisdiction/license specific. A future chapter must identify state, license class, statutory forms and reporting rules before implementation/certification.
+
+## Future AI
+Anomaly detection, forecasting and an owner assistant may be added over audited read models; they must never bypass transaction-safe RPCs or approval controls.
+
+
+---
+
+# Release Testing
+
+# Chapters 16–26 Test Matrix
+
+## Release gate
+1. `npm run build` passes.
+2. `npx supabase db push --dry-run` shows the intended migration only.
+3. `npx supabase db push` succeeds.
+4. `npx supabase functions deploy ocr-invoice` succeeds.
+5. Admin login and Chapter 15 regression still work.
+
+## Chapter 16 Scanner
+- Scan `8900000010016` with focus in Discount; barcode does not remain in Discount.
+- Duplicate scan increments quantity.
+- Slow human typing does not trigger scan.
+- Unknown barcode opens Add Product with barcode prefilled.
+- Success/error beeps are distinct.
+
+## Chapter 17 Returns
+- Pending return causes no stock movement.
+- Approval restores exact quantity, refund payment and audit.
+- Over-return is rejected.
+- Void clean invoice restores all stock; invoice cannot be voided twice.
+
+## Chapter 18 Shift
+- Cashier cannot sell without open shift.
+- Opening cash + Cash sales - Cash refunds = expected cash.
+- actual/expected variance stored.
+- close requires manager/admin approval.
+
+## Chapter 19 Stock Count
+- Create snapshots active SKUs.
+- Scanner increments counted SKU.
+- Submission fails while NULL/unseen SKUs remain.
+- explicit zero action works.
+- approval applies discrepancies exactly once.
+
+## Chapter 20 Receipt
+- 80mm and 58mm layouts print without clipping.
+- invoice totals/payment/store header are correct.
+
+## Chapter 21 Procurement
+- PO create/send/receive.
+- inventory increases only on receive.
+- supplier payment reduces balance.
+- supplier return reduces stock/balance.
+- price history reflects invoices.
+
+## Chapter 22 Reorder
+- low-stock/high-velocity products are suggested.
+- case rounding uses units_per_case.
+- Create PO produces correct quantity.
+
+## Chapter 23 Transfer
+- unrelated organization shop not listed.
+- request moves no stock.
+- destination approval creates paired stock movements.
+- insufficient stock rejects atomically.
+
+## Chapter 24 Audit/Security
+- product price edit shows before/after audit.
+- cashier sees only own sales.
+- cashier cannot query purchase price through get_products.
+- audit page is ADMIN only.
+
+## Chapter 25 Offline
+- after prior online load, disconnect and create offline sale.
+- IndexedDB record is encrypted (no plaintext cart JSON in the queue record).
+- reconnect and sync creates one sale.
+- repeat sync cannot duplicate client_sale_id.
+- stock conflict remains CONFLICT.
+
+## Chapter 26 OCR
+- without Azure secrets returns OCR_NOT_CONFIGURED.
+- with configured resource, invoice extracts fields/items.
+- human review is required before Receive Stock.
+- stock does not change during OCR itself.
+
+## Regression
+- login/kill switch
+- product CRUD
+- normal POS sale
+- receive stock
+- dashboard/reports
+- Admin creates Manager/Cashier
+- Azure static URL after deployment
+
+---
+
+# Production Runbook
+
+# Production Runbook — Chapters 16–26
+
+## Deploy order
+1. Backup source/Git checkpoint.
+2. Production React build.
+3. Supabase migration dry-run.
+4. Push migration.
+5. Deploy `ocr-invoice` Edge Function.
+6. Production build again.
+7. Commit code/docs.
+8. Generate actual Git release code-history from the release commit.
+9. Commit code-history.
+10. One network `git push`.
+11. Upload `dist/` to Azure `$web`.
+
+## OCR activation (optional after release)
+Create Azure AI Document Intelligence and set secrets:
+```bash
+npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR-RESOURCE.cognitiveservices.azure.com
+npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_KEY=YOUR_SECRET
+```
+Do not put this key in `.env.local`, React or Git. Edge Function secrets become available to the deployed function without exposing them to the browser.
+
+## Create a second branch
+Create the new shop through platform operations, then assign both shops the same `organization_id`. Do **not** simply reuse an organization across unrelated customers.
+
+## Rollback strategy
+- Frontend: redeploy the previous Git commit's `dist`.
+- Database: migrations are additive; do not manually drop tables in production. Fix forward with a new migration.
+- Offline conflicts: never delete a conflict until a manager has compared the offline receipt and cloud stock.
+
+## Daily operational checks
+- pending return requests
+- CLOSE_REQUESTED shifts
+- submitted stock counts
+- offline conflicts
+- supplier balances
+- low-stock reorder suggestions
+- audit exceptions
+
+---
+
+# Code History
+
+After the release commit is created, `apply_chapters_16_26.sh` generates `docs/code-history/chapters-16-26-release.md` directly from `git show`. That file is the authoritative verbatim patch for this release. The handbook explains architecture; Git remains the source of truth for exact source code.
+
+
+# Azure Document Intelligence F0 deployment decision
+
+For OCR, the production-expansion installer uses the existing Azure subscription/resource group and provisions Document Intelligence only when the `F0` SKU is available. It never falls back to `S0`. The endpoint and key are transferred directly to Supabase Edge Function secrets and are not committed. The OCR flow uses `prebuilt-invoice`, REST API `2024-11-30`, a 4 MB client/server guard, and mandatory human review before `receive_purchase()` changes stock.
diff --git a/docs/handbook/WineShopPOS_Developer_Handbook_Chapters_16_26.docx b/docs/handbook/WineShopPOS_Developer_Handbook_Chapters_16_26.docx
new file mode 100644
index 0000000..cc47b31
--- /dev/null
+++ b/docs/handbook/WineShopPOS_Developer_Handbook_Chapters_16_26.docx
@@ -0,0 +1,375 @@
+                        WineShopPOS Developer Handbook
+                   Chapters 16 - 26 :: Production Expansion
+             Cloud POS :: Supabase :: Azure Blob Static Website
+Executive Release Map
+ChapterModulePrimary safety rule16Professional scannerScanner sequence must not corrupt focused fields17Returns / voidsPending request never changes stock18Cashier shiftCashier sales require open shift19Physical stock countUnseen SKU is not silently zero20Thermal receiptBrowser print, no fake universal silent ESC/POS21ProcurementInventory changes only on receipt/approved return22Smart reorderSuggestion is calculation, not automatic purchase23Branch transferSame organization + destination approval24Audit/securityCashier cost/sales access restricted25Offline POSEncrypted queue + server conflict validation26OCR/automationHuman confirms before inventory updateHow to use this handbook
+Read the architecture and invariants first. For exact source code, use the generated Git code-history file after deployment: docs/code-history/chapters-16-26-release.md. The release SQL is supabase/migrations/20260829190000_chapters_16_26.sql.
+WineShopPOS Developer Handbook  --  Chapters 16 - 26
+Version: Production-expansion release, 29-Aug-2026
+Purpose
+This addendum is the canonical technical handbook for the Chapters 16 - 26 expansion of the existing WineShopPOS cloud MVP. It is meant to let a future developer or a new ChatGPT session continue safely without replaying the implementation conversation.
+Starting architecture
+Before this release the application already had React/Vite, Supabase Auth, multi-shop RLS, products/inventory/purchases/sales/payments/stock movements, Admin/Manager/Cashier roles, a subscription kill switch, a secure manage-shop-users Edge Function, and Azure Blob Static Website hosting.
+The release is additive. It deliberately does not replace the proven Chapter 15 transaction core.
+Non-negotiable invariants
+shop_id is customer/branch isolation and must never be taken from browser input for a stock transaction.
+All stock changes happen in database transactions/RPCs.
+Inventory may never become negative.
+A pending approval never changes stock.
+Cross-shop transfers require both shops to share an explicit organization.
+OCR is advisory until a person confirms the receipt.
+Offline sync revalidates cloud stock and does not force conflicts.
+Supabase service-role/Azure OCR secrets never enter the React bundle or Git.
+New database model
+Organizations
+organizations groups branches owned by the same customer. Existing shops are migrated into separate organizations to preserve tenant isolation. A platform operator may later place multiple branches into one organization.
+Returns
+sale_return_requests and sale_return_items separate request from approval. Refund payments remain positive numbers with payment_type='REFUND'; reports subtract them according to type instead of relying on negative monetary rows.
+Shifts
+cashier_shifts records opening cash, tender totals, expected/actual cash, variance, request and approval timestamps.
+Stock count
+stock_counts is the count session; stock_count_items is a full snapshot of active SKU expectations. NULL counted quantity means not yet counted and is intentionally different from zero.
+Procurement
+purchase_orders, purchase_order_items, supplier_payments, purchase_returns, and purchase_return_items extend the existing purchases/purchase_items receipt ledger.
+Transfers
+stock_transfers and stock_transfer_items implement a request/approval model. Stock changes only during destination approval.
+Audit
+audit_logs captures actor/action/entity/old/new JSON/metadata. Business RPCs add semantic audit events while row triggers preserve before/after state for key master/transaction tables.
+OCR aliases
+product_aliases lets a supplier invoice description map to the internal product without changing the product name.
+New transaction API
+get_products()  --  role-safe product read; hides purchase price from Cashier.
+update_product_details() / set_product_active()  --  Manager/Admin product write RPCs.
+returns: create_return_request, approve_return_request, reject_return_request, void_sale.
+shifts: open_shift, my_open_shift, shift_totals, request_close_shift, approve_shift_close.
+stock count: create_stock_count, stock_count_scan, set_stock_count_quantity, mark_unseen_stock_count_zero, submit_stock_count, approve_stock_count.
+purchasing: create_purchase_order, set_purchase_order_status, receive_purchase_order, record_supplier_payment, create_purchase_return, supplier_balances, purchase_price_history.
+reordering: reorder_suggestions.
+transfers: available_transfer_destinations, create_stock_transfer, cancel_stock_transfer, reject_stock_transfer, approve_stock_transfer.
+offline/idempotent sale: complete_sale_v2, sync_offline_sale.
+OCR matching: match_product_text.
+Frontend modules
+global scanner: src/context/ScannerContext.jsx
+encrypted offline queue: src/lib/offlineQueue.js
+offline indicator: src/components/OfflineStatus.jsx
+thermal receipt: src/components/Receipt80mm.jsx
+pages: Scanner Settings, Returns, Shifts, Stock Count, Printer Settings, Procurement, Price History, Reorder, Transfers, Audit, Offline Queue, Automation Hub.
+Offline security design
+IndexedDB stores only AES-GCM ciphertext and metadata for queued sale payloads. The AES key is generated through WebCrypto as non-extractable and kept in IndexedDB as a CryptoKey object. The client sale UUID is intentionally visible because it is an idempotency key, not customer/product content.
+Offline mode is not positioned as a full disconnected ERP. The device must already have a valid cached session/catalog. Cloud synchronization is authoritative and may produce a conflict if stock, price, authorization or shift state no longer permits the sale.
+Thermal printing boundary
+An Azure Blob static web app has no universal trusted route to silently write raw ESC/POS bytes to arbitrary local USB/Bluetooth printers. This release therefore produces a real 58/80mm receipt layout and uses the operating system/browser print path. If a specific printer model later requires silent printing, add a separately installed, signed local print bridge or carefully evaluated device-specific WebUSB integration.
+OCR design
+The ocr-invoice Edge Function calls Azure AI Document Intelligence's prebuilt-invoice model. OCR credentials are read only from Edge Function secrets. The browser receives normalized invoice fields, asks PostgreSQL for product candidates, then requires human confirmation before receive_purchase() changes inventory.
+Compliance boundary
+No generic report is labeled excise/statutory compliant. Alcohol compliance in India depends on state, license class, statutory forms and filing rules. Before building Chapter 26 compliance reports, record exact jurisdiction and obtain the official report specification.
+Deployment strategy
+The single release script checkpoints a dirty repo if necessary, writes all generated files, runs a Vite production build, runs Supabase migration dry-run and push, deploys the OCR Edge Function, builds again, creates local Git commits, generates an actual Git patch/code-history from the release commit, makes a second documentation commit, performs one network git push, then uploads dist/ to Azure Blob $web.
+Rollback
+Frontend rollback is Git-based: build and redeploy a previous known-good commit. Database changes are additive and should be fixed forward with a new migration; never manually drop live transactional tables as a rollback shortcut.
+Security review after release
+rotate any secret ever pasted into chat or terminal history.
+enforce MFA for privileged accounts.
+review Admin/Manager/Cashier user list monthly.
+monitor audit/void/refund/stock-adjustment events.
+keep service-role and Azure OCR keys in server-side secrets only.
+for commercial rollout, add formal staging, automated integration tests, database backups and deployment approvals.
+Chapter 16  --  Professional Barcode Scanner
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Make a normal USB/Bluetooth HID scanner feel like a commercial POS device.
+Implementation
+src/context/ScannerContext.jsx owns a global capturing keydown listener.
+Rapid key sequences are distinguished from human typing using average inter-key delay.
+Enter terminates a scan.
+The input field value present before scanning is snapshotted and restored when the sequence is classified as scanner input. This prevents the completed barcode from remaining in discount, payment-reference, search or other fields.
+Once the sequence is confidently scanner-like, later characters are prevented immediately.
+src/pages/POS.jsx subscribes to the scanner event, looks up an active product and auto-adds it.
+Repeated barcode scans increment cart quantity.
+WebAudio provides separate success/error tones.
+Unknown scans show a large PRODUCT NOT FOUND banner and link to Add Product with ?barcode= prefilled.
+ScannerSettings.jsx exposes minimum barcode length, average key-gap threshold and reset interval plus live diagnostics.
+Operational note
+The scanner should be configured in its manufacturer settings to append Enter/CR after each barcode.
+Tests
+Focus Discount and scan 8900000010016; discount must remain unchanged after the scan.
+Scan the same barcode twice; cart quantity becomes 2.
+Slowly type six digits; it must not be treated as a scan.
+Scan an unknown barcode; error tone + Add Product action appears.
+Create the unknown product; barcode is already populated.
+Chapter 17  --  Returns, Refunds & Voids
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Restore inventory and payment history safely rather than editing past sales.
+Database
+sale_return_requests
+sale_return_items
+RPCs: create_return_request, approve_return_request, reject_return_request, void_sale.
+Workflow
+Cashier can request a return. Stock does not move at request time. Manager/Admin approval adds stock, creates CUSTOMER_RETURN stock movements and records a REFUND payment. Refund value is allocated using the original sale's effective discount ratio. Full returned quantity marks the sale RETURNED; otherwise PARTIAL_RETURN.
+Void is Manager/Admin only and only for a clean COMPLETED invoice without return activity. It restores all items and records SALE_VOID movements plus refund payment.
+Tests
+Request 1 of 2 sold units: stock unchanged while PENDING; +1 after approval.
+Attempt a second return beyond remaining quantity: rejected.
+Reject request: stock/payment unchanged.
+Void clean invoice: all stock restored and status VOID.
+Chapter 18  --  Cashier Shift & Day Close
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Tie cashier activity to an auditable till shift.
+Database
+cashier_shifts stores opening cash, Cash/UPI/Card totals, cash refunds, expected cash, actual cash, variance, approval and timestamps.
+Rules
+Cashier must have an OPEN shift before complete_sale_v2 accepts a sale.
+Admin/Manager can bill without a cashier shift for administrative use.
+Close request snapshots payment totals.
+Expected cash = opening cash + cash payments - cash refunds.
+Manager/Admin approves CLOSE_REQUESTED to CLOSED.
+Tests
+Open ₹5,000; sell ₹1,000 cash + ₹500 UPI; request close with ₹5,950 actual. Expected ₹6,000 and difference -₹50.
+Chapter 19  --  Physical Stock Count
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Use barcode scanning to perform a controlled physical count and post only approved discrepancies.
+Database
+stock_counts
+stock_count_items
+Creating a count snapshots every active SKU's current system quantity. Scanning increments counted quantity. Manual quantity is available for cases/shelves where scanning every unit is impractical.
+Unscanned SKUs remain NULL rather than silently becoming zero. A deliberate Mark Unseen = 0 step is required before submission. Approval replaces system quantity with counted quantity and creates both stock-adjustment and STOCK_COUNT movement records.
+Tests
+Count expected 26 as 24 --> submit --> approval produces -2 movement. Cancel/unfinished count must never modify inventory.
+Chapter 20  --  Thermal Receipt Printer
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Produce a clean 80mm/58mm thermal receipt from the static web application.
+Implementation
+Receipt80mm.jsx renders invoice, store header, lines, totals and payment.
+print CSS uses @page and thermal widths.
+Printer Settings stores address, phone, registration text, footer and 58/80mm paper width.
+Important browser boundary
+The production frontend is an Azure Blob static website. It can open the browser print dialog and print to an installed USB/Bluetooth thermal printer. It cannot safely guarantee silent raw ESC/POS access for arbitrary printers. Silent printing would require a trusted local bridge/native helper or vendor-specific WebUSB integration.
+Tests
+Install printer in Windows; open invoice --> Print Receipt --> choose printer --> verify no clipping and correct width.
+Chapter 21  --  Supplier & Purchase Improvements
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Extend receiving into a procurement/ledger workflow.
+Database
+purchase_orders, purchase_order_items
+supplier_payments
+purchase_returns, purchase_return_items
+purchases may reference purchase_order_id.
+Workflow
+Create PO --> mark sent --> receive full/partial quantities --> regular receive_purchase updates inventory --> supplier balance = received purchases - supplier payments - completed purchase returns.
+Supplier return validates on-hand stock, deducts quantity and creates SUPPLIER_RETURN stock movements.
+purchase_price_history provides historical unit purchase price by invoice. The Price History UI calculates oldest-to-latest percentage change.
+Tests
+Create PO 24 bottles; receive --> inventory +24. Record supplier payment --> balance falls. Return 2 bottles --> inventory -2 and balance falls by returned value.
+Chapter 22  --  Smart Reordering
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Suggest orders using facts already in the POS instead of AI.
+Formula
+history window default: 30 days
+average daily sales = units sold / history days
+days remaining = current stock / average daily sales
+desired quantity = max(avg daily x target days, minimum stock)
+suggested bottles = max(0, desired quantity - current stock)
+suggested cases = ceil(suggested bottles / units per case)
+reorder_suggestions ignores voided/fully returned sales and returns only products below minimum or within target days.
+The UI can create a Purchase Order from a recommendation.
+Tests
+A product selling 11/day, stock 18, target 7 days should show low days remaining and a positive case suggestion.
+Chapter 23  --  Multi-Shop Stock Transfer
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Architecture decision
+The existing Chapter 15 shop_id model separated customers/tenants. It was unsafe to assume every shop belonged to the same owner. Chapter 23 adds organizations; existing shops are initially placed into separate organizations. Only shops intentionally assigned to the same organization become branches eligible for transfers.
+Workflow
+Source Manager/Admin requests transfer. No inventory changes yet. Destination Manager/Admin approves. Approval locks source stock, revalidates quantity, creates/copies destination product by barcode if needed, subtracts source, adds destination, and posts paired TRANSFER_OUT / TRANSFER_IN movements in one transaction.
+Tests
+Unrelated organizations cannot appear as destinations.
+Request does not alter stock.
+Approval -24 source/+24 destination.
+Insufficient source stock at approval rejects entire transaction.
+Chapter 24  --  Owner Controls & Audit
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Provide traceability for commercial operations.
+Database
+audit_logs captures actor, action, entity, old/new JSON, metadata and time. Product/supplier/sale/purchase triggers record row changes; transactional RPCs add explicit business events for returns, voids, shifts, counts, POs, payments and transfers.
+RLS hardening
+Cashier sales SELECT is limited to own invoices.
+Sale items/payments follow accessible sales.
+Purchases and procurement data are Manager/Admin only.
+get_products() masks purchase price for Cashier.
+Audit is ADMIN only.
+Tests
+Change selling price and verify old/new row in Audit. Approve return and verify RETURN_APPROVED event. Cashier must not see other cashier sales or purchase-cost data.
+Chapter 25  --  Offline POS
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+Goal
+Provide emergency selling after a device has already authenticated and cached the catalog.
+Client design
+service worker caches visited app resources.
+last cloud catalog/inventory is cached locally for emergency operation.
+offline sales are stored in IndexedDB.
+sale payload is encrypted with a non-extractable AES-GCM WebCrypto key stored in IndexedDB.
+every sale has a UUID client_sale_id for idempotency.
+Sync design
+sync_offline_sale calls the server-side transaction. Supabase re-reads live product prices and locks current stock. If stock is insufficient or the shift is no longer valid, the item becomes CONFLICT rather than being forced into the database.
+Boundaries
+First-time/cold login still requires internet.
+Offline queue does not make supplier, user-management, returns or stock adjustments offline-capable.
+Cashier should sync before closing the shift.
+Tests
+Load online --> disconnect --> create sale --> queue shows PENDING --> reconnect --> Sync Now --> inventory/sale appears once. Re-sync same client UUID must not duplicate.
+Chapter 26  --  OCR, Compliance & Automation
+Status: Implemented in Chapters 16 - 26 production-expansion release.
+OCR
+A Supabase Edge Function ocr-invoice integrates Azure AI Document Intelligence prebuilt-invoice using API version 2024-11-30. Azure credentials remain Edge Function secrets, never Vite/browser variables.
+The frontend sends invoice image/PDF --> OCR extracts supplier/invoice/date/items --> match_product_text uses aliases/trigram similarity --> human review --> draft is sent to Receive Stock. OCR never modifies inventory directly.
+If Azure secrets are absent, the feature returns OCR_NOT_CONFIGURED and the rest of the application continues normally.
+Product aliases
+product_aliases allows supplier/OCR wording to be taught to a product without renaming the product master.
+Compliance boundary
+State/excise compliance is intentionally not labeled complete. India alcohol reporting is jurisdiction/license specific. A future chapter must identify state, license class, statutory forms and reporting rules before implementation/certification.
+Future AI
+Anomaly detection, forecasting and an owner assistant may be added over audited read models; they must never bypass transaction-safe RPCs or approval controls.
+Release Testing
+Chapters 16 - 26 Test Matrix
+Release gate
+npm run build passes.
+npx supabase db push --dry-run shows the intended migration only.
+npx supabase db push succeeds.
+npx supabase functions deploy ocr-invoice succeeds.
+Admin login and Chapter 15 regression still work.
+Chapter 16 Scanner
+Scan 8900000010016 with focus in Discount; barcode does not remain in Discount.
+Duplicate scan increments quantity.
+Slow human typing does not trigger scan.
+Unknown barcode opens Add Product with barcode prefilled.
+Success/error beeps are distinct.
+Chapter 17 Returns
+Pending return causes no stock movement.
+Approval restores exact quantity, refund payment and audit.
+Over-return is rejected.
+Void clean invoice restores all stock; invoice cannot be voided twice.
+Chapter 18 Shift
+Cashier cannot sell without open shift.
+Opening cash + Cash sales - Cash refunds = expected cash.
+actual/expected variance stored.
+close requires manager/admin approval.
+Chapter 19 Stock Count
+Create snapshots active SKUs.
+Scanner increments counted SKU.
+Submission fails while NULL/unseen SKUs remain.
+explicit zero action works.
+approval applies discrepancies exactly once.
+Chapter 20 Receipt
+80mm and 58mm layouts print without clipping.
+invoice totals/payment/store header are correct.
+Chapter 21 Procurement
+PO create/send/receive.
+inventory increases only on receive.
+supplier payment reduces balance.
+supplier return reduces stock/balance.
+price history reflects invoices.
+Chapter 22 Reorder
+low-stock/high-velocity products are suggested.
+case rounding uses units_per_case.
+Create PO produces correct quantity.
+Chapter 23 Transfer
+unrelated organization shop not listed.
+request moves no stock.
+destination approval creates paired stock movements.
+insufficient stock rejects atomically.
+Chapter 24 Audit/Security
+product price edit shows before/after audit.
+cashier sees only own sales.
+cashier cannot query purchase price through get_products.
+audit page is ADMIN only.
+Chapter 25 Offline
+after prior online load, disconnect and create offline sale.
+IndexedDB record is encrypted (no plaintext cart JSON in the queue record).
+reconnect and sync creates one sale.
+repeat sync cannot duplicate client_sale_id.
+stock conflict remains CONFLICT.
+Chapter 26 OCR
+without Azure secrets returns OCR_NOT_CONFIGURED.
+with configured resource, invoice extracts fields/items.
+human review is required before Receive Stock.
+stock does not change during OCR itself.
+Regression
+login/kill switch
+product CRUD
+normal POS sale
+receive stock
+dashboard/reports
+Admin creates Manager/Cashier
+Azure static URL after deployment
+Production Runbook
+Production Runbook  --  Chapters 16 - 26
+Deploy order
+Backup source/Git checkpoint.
+Production React build.
+Supabase migration dry-run.
+Push migration.
+Deploy ocr-invoice Edge Function.
+Production build again.
+Commit code/docs.
+Generate actual Git release code-history from the release commit.
+Commit code-history.
+One network git push.
+Upload dist/ to Azure $web.
+OCR activation (optional after release)
+Create Azure AI Document Intelligence and set secrets:
+ npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR-RESOURCE.cognitiveservices.azure.com
+npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_KEY=YOUR_SECRET
+Do not put this key in .env.local, React or Git. Edge Function secrets become available to the deployed function without exposing them to the browser.
+Create a second branch
+Create the new shop through platform operations, then assign both shops the same organization_id. Do not simply reuse an organization across unrelated customers.
+Rollback strategy
+Frontend: redeploy the previous Git commit's dist.
+Database: migrations are additive; do not manually drop tables in production. Fix forward with a new migration.
+Offline conflicts: never delete a conflict until a manager has compared the offline receipt and cloud stock.
+Daily operational checks
+pending return requests
+CLOSE_REQUESTED shifts
+submitted stock counts
+offline conflicts
+supplier balances
+low-stock reorder suggestions
+audit exceptions
+Code History
+After the release commit is created, apply_chapters_16_26.sh generates docs/code-history/chapters-16-26-release.md directly from git show. That file is the authoritative verbatim patch for this release. The handbook explains architecture; Git remains the source of truth for exact source code.
+Appendix A  --  Release File Map
+src/context/ScannerContext.jsx
+src/context/AuthContext.jsx
+src/context/ShopContext.jsx
+src/lib/offlineQueue.js
+src/components/OfflineStatus.jsx
+src/components/Receipt80mm.jsx
+src/pages/POS.jsx
+src/pages/ScannerSettings.jsx
+src/pages/Returns.jsx
+src/pages/Shifts.jsx
+src/pages/StockCount.jsx
+src/pages/PrinterSettings.jsx
+src/pages/Procurement.jsx
+src/pages/PriceHistory.jsx
+src/pages/Reorder.jsx
+src/pages/Transfers.jsx
+src/pages/Audit.jsx
+src/pages/OfflineQueue.jsx
+src/pages/AutomationHub.jsx
+supabase/migrations/20260829190000_chapters_16_26.sql
+supabase/functions/ocr-invoice/index.ts
+Appendix B  --  Support Triage
+SHIFT_REQUIRED: cashier must open a shift.
+PRODUCT_NOT_FOUND: add/match barcode; never create a fake stock line.
+OCR_NOT_CONFIGURED: configure Edge Function Azure secrets; rest of app remains operational.
+Offline CONFLICT: reconcile physical receipt and cloud inventory; do not force/delete blindly.
+Transfer destination missing: branches are not yet grouped under one organization.
+Migration error: stop release before Git/Azure deployment and fix the exact database error.
+Azure Document Intelligence F0 Deployment
+Purpose: The Chapters 16 - 26 release activates supplier-invoice OCR using Azure AI Document Intelligence prebuilt-invoice while preserving the existing Azure Blob + Supabase architecture.Cost rule: The automated installer creates or reuses only the Free F0 SKU. It never falls back to paid S0. If F0 is unavailable for the subscription, quota, or Central India region, the installer stops OCR provisioning and leaves the paid resource uncreated.Azure target: Subscription: Azure subscription 1; resource group: wineshopPOS; preferred region: Central India; resource kind: FormRecognizer; SKU: F0.Secret handling: The installer reads the Azure endpoint and key through Azure CLI, writes them only to a temporary file outside the Git repository, pushes them to Supabase Edge Function secrets, and deletes the temporary file. The key must never appear in React, .env.local, Git, Markdown, screenshots, or user documentation.OCR API: The ocr-invoice Edge Function uses the prebuilt-invoice model with Document Intelligence REST API version 2024-11-30. It polls the asynchronous operation until completion and returns structured invoice fields to the browser.F0 guardrails: The UI and Edge Function reject files above 4 MB. F0 is intended for development/light usage and analyzes only the first two pages of a multi-page document. Human review remains mandatory before any receive_purchase operation changes inventory.Offline/shift safety correction: Offline sales are linked to the cashier shift that was active at the sale timestamp, even if synchronization occurs after shift close. The client also blocks shift-close requests while the device has pending or conflicting offline sales.
\ No newline at end of file
diff --git a/docs/handoff/NEXT_CHAT_CONTEXT_CH16_26.txt b/docs/handoff/NEXT_CHAT_CONTEXT_CH16_26.txt
new file mode 100644
index 0000000..d137cf4
--- /dev/null
+++ b/docs/handoff/NEXT_CHAT_CONTEXT_CH16_26.txt
@@ -0,0 +1,38 @@
+PROJECT CONTINUATION: WineShopPOS Chapters 16–26
+
+The current production architecture before this release was Chapter 15: React/Vite + Supabase Auth/Postgres/RLS/RPCs + Azure Blob static website.
+
+This release adds:
+16 global professional scanner
+17 returns/refunds/voids
+18 cashier shifts/day close
+19 physical stock count
+20 80mm/58mm receipt printing via browser installed printer
+21 PO/supplier ledger/purchase returns/price history
+22 rule-based smart reorder
+23 organizations + branch stock transfer
+24 audit controls and RLS hardening
+25 emergency encrypted offline POS queue + idempotent server sync
+26 Azure Document Intelligence invoice OCR scaffold + human review/product matching
+
+Critical decisions:
+- Platform Owner is separate from shop roles.
+- Existing shops are isolated into separate organizations; stock transfer only after branches are explicitly grouped under one organization.
+- returns do not move stock until manager/admin approval.
+- stock count does not convert unscanned SKUs to zero silently.
+- static browser thermal printing uses print dialog; silent raw ESC/POS requires a future trusted local bridge/device-specific integration.
+- offline is emergency POS only after prior authenticated/cache load; conflicts are server-revalidated and never force-applied.
+- OCR secrets are Supabase Edge Function secrets. OCR never changes inventory directly.
+- statutory excise/compliance reports remain jurisdiction-specific and are not falsely certified.
+
+Migration:
+supabase/migrations/20260829190000_chapters_16_26.sql
+
+OCR Edge Function:
+supabase/functions/ocr-invoice/index.ts
+
+Release test matrix:
+docs/testing/CHAPTERS_16_26_TEST_MATRIX.md
+
+Runbook:
+docs/PRODUCTION_RUNBOOK_CH16_26.md
diff --git a/docs/manual/WineShopPOS_User_Manual_Advanced.docx b/docs/manual/WineShopPOS_User_Manual_Advanced.docx
new file mode 100644
index 0000000..84c5e7e
--- /dev/null
+++ b/docs/manual/WineShopPOS_User_Manual_Advanced.docx
@@ -0,0 +1,128 @@
+                            WineShopPOS User Manual
+                 Advanced Shop Operations :: Chapters 16 - 26
+             Cloud POS :: Supabase :: Azure Blob Static Website
+Role Quick Guide
+ChapterModulePrimary safety ruleCashierPOS / shifts / return requests / own salesCannot approve stock/refundsManagerInventory / returns / counts / procurement / transfersOperational approvalAdminAll shop modules / users / audit / printerShop-level controlGolden rules
+Never make a manual stock adjustment to imitate a return; use Returns.
+Never receive OCR output without reviewing product, quantity and price.
+Never mark unseen stock-count items zero until the physical count is truly complete.
+Sync offline sales before closing the cashier shift.
+Investigate cash variance; do not edit sales to make the drawer balance.
+WineShopPOS User Manual  --  Advanced Operations (Chapters 16 - 26)
+Who should use this manual
+Cashier: POS, shift, return request, own sales, offline queue, scanner test.
+Manager: all Cashier tasks plus products, inventory, stock count, receiving, procurement, reordering, transfers, OCR review.
+Admin: all shop functions plus users, audit, printer/shop settings.
+1. Start of day  --  Cashier
+Sign in.
+Open Shift / Close.
+Enter physical opening cash in the drawer.
+Select Open Shift.
+Open POS. A Cashier cannot complete an online sale without an open shift.
+2. Barcode billing
+The scanner works globally. You do not need to click a barcode box.
+Scan a known barcode: product is added and success beep plays.
+Scan again: quantity increases.
+Unknown barcode: red PRODUCT NOT FOUND panel appears.
+Manager/Admin may choose Add Product with this Barcode.
+The scanner should be configured to send Enter after every barcode.
+3. Complete a sale
+Verify cart and quantity.
+Enter discount if approved by shop policy.
+Select CASH/UPI/CARD.
+Enter UPI/Card reference if used.
+Complete sale.
+Print receipt if required.
+4. Return request
+Open Returns / Voids.
+Select original invoice.
+Enter return quantity beside the product.
+Enter reason/refund method.
+Submit.
+No stock changes while request is pending. Manager/Admin approves or rejects. Do not manually adjust stock to imitate a return.
+5. Void invoice (Manager/Admin)
+Use only for a fully cancelled clean transaction. Select invoice, enter reason and choose Void Entire Sale. Do not use Void after a partial return has started.
+6. End cashier shift
+Count actual cash physically.
+Open Shift / Close.
+Enter Actual Cash and request close.
+Manager/Admin compares expected versus actual cash and approves close.
+Investigate/document any variance.
+7. Physical stock count (Manager/Admin)
+Inventory --> Stock Count --> Start Stock Count.
+Walk the shop and scan bottles. Repeated scans increment count.
+For bulk shelf/case counts, type counted quantity manually.
+After the full shop is counted, review unseen SKUs.
+Only if truly absent, use Mark Unseen = 0.
+Submit.
+Manager/Admin approves. Approval is when inventory changes.
+8. Thermal receipt
+Admin opens Printer settings and configures 80mm or 58mm, store address/phone/footer. On invoice choose Print Receipt, select the installed thermal printer and use minimum/no margins.
+9. Purchase Order
+Procurement --> select supplier.
+Add products/ordered quantities/purchase prices.
+Create PO.
+Mark Sent when ordered.
+When goods arrive choose Receive, enter supplier invoice number.
+Inventory increases only after Receive succeeds.
+10. Supplier payment
+Procurement --> Record Supplier Payment. Select supplier, amount, method and reference. Supplier Balance shows received invoices less payments and purchase returns.
+11. Purchase return
+Use Supplier Return only when goods physically leave the shop. The system checks stock, decreases inventory and records a supplier-return movement.
+12. Purchase price history
+Open Price History, choose product and compare invoices. Positive percentage means latest known purchase cost increased versus the oldest row loaded.
+13. Smart reorder
+Open Smart Reorder. Default history is 30 days and target is 7 stock days. Review suggested bottles/cases and create a PO where appropriate. The suggestion is a calculation, not a mandatory order.
+14. Branch transfer
+Branches must be configured by platform administration under the same organization.
+Source creates transfer request.
+Stock does not move yet.
+Destination Manager/Admin verifies goods/request and approves.
+Approval moves source and destination stock together.
+Never use branch transfer to move stock between unrelated customer accounts.
+15. Audit (Admin)
+Audit shows important creates/updates and business actions. Use it to investigate price changes, stock adjustments, voids, refunds, receipts and transfers. JSON details may show before/after values.
+16. Internet outage / Offline POS
+Offline selling is emergency-only.
+The device must have been logged in and loaded online previously.
+If connection drops, POS can store a sale in the encrypted local queue.
+The Offline Queue shows pending items.
+On reconnection choose Sync Now.
+If server rejects a sale due to stock/authorization/shift conflict, do not delete it casually. Manager reconciles the physical receipt and cloud stock.
+Sync before requesting shift close.
+17. Invoice OCR (Manager/Admin)
+OCR / Automation --> choose invoice photo/PDF.
+Analyze.
+Review supplier, invoice number, every line, quantity, price and product match.
+Send reviewed draft to Receive Stock.
+Review again and press Confirm & Receive Stock.
+OCR by itself never updates stock. If the page says OCR_NOT_CONFIGURED, Azure Document Intelligence has not yet been activated by the developer.
+18. Daily Manager checklist
+pending returns
+cashier close requests/variances
+offline conflicts
+submitted stock counts
+low-stock reorder list
+open/partially received POs
+supplier balances
+unusual audit events
+19. Troubleshooting
+Product not found
+Check barcode in Products. If new, add it using the unknown-barcode action.
+Cashier gets SHIFT_REQUIRED
+Open Shift / Close and start a shift.
+Offline sale will not sync
+Read the conflict message. Common reasons are insufficient current stock or a closed/missing cashier shift.
+Scanner behaves like keyboard typing
+Use Scanner Test. Confirm scanner appends Enter and adjust average key-gap threshold only after testing.
+Receipt width wrong
+Admin --> Printer --> choose 58/80mm matching paper; use browser minimum/no margins.
+OCR not configured
+This is not a user error. Developer must configure Azure Document Intelligence Edge Function secrets.
+Invoice OCR - Operator Guide
+Open OCR / Automation from the left menu (Admin or Manager only).
+Choose an invoice photo or PDF. For the free OCR tier, keep the file at or below 4 MB. Only the first two pages of a multi-page invoice are analyzed.
+Click Analyze Invoice and wait for the extracted supplier, invoice number, date, quantity, price, and product-match suggestions.
+Review every line. OCR is an assistant, not an automatic stock update.
+Choose Send Reviewed Draft to Receive Stock, correct any product/quantity/price mismatch, and only then confirm receipt.
+If OCR is unavailable, continue using manual Receive Stock; normal POS and inventory functions are unaffected.
diff --git a/docs/manual/WineShopPOS_User_Manual_Advanced.md b/docs/manual/WineShopPOS_User_Manual_Advanced.md
new file mode 100644
index 0000000..57c5684
--- /dev/null
+++ b/docs/manual/WineShopPOS_User_Manual_Advanced.md
@@ -0,0 +1,140 @@
+# WineShopPOS User Manual — Advanced Operations (Chapters 16–26)
+
+## Who should use this manual
+- Cashier: POS, shift, return request, own sales, offline queue, scanner test.
+- Manager: all Cashier tasks plus products, inventory, stock count, receiving, procurement, reordering, transfers, OCR review.
+- Admin: all shop functions plus users, audit, printer/shop settings.
+
+## 1. Start of day — Cashier
+1. Sign in.
+2. Open **Shift / Close**.
+3. Enter physical opening cash in the drawer.
+4. Select **Open Shift**.
+5. Open POS. A Cashier cannot complete an online sale without an open shift.
+
+## 2. Barcode billing
+The scanner works globally. You do not need to click a barcode box.
+- Scan a known barcode: product is added and success beep plays.
+- Scan again: quantity increases.
+- Unknown barcode: red PRODUCT NOT FOUND panel appears.
+- Manager/Admin may choose **Add Product with this Barcode**.
+
+The scanner should be configured to send Enter after every barcode.
+
+## 3. Complete a sale
+1. Verify cart and quantity.
+2. Enter discount if approved by shop policy.
+3. Select CASH/UPI/CARD.
+4. Enter UPI/Card reference if used.
+5. Complete sale.
+6. Print receipt if required.
+
+## 4. Return request
+1. Open **Returns / Voids**.
+2. Select original invoice.
+3. Enter return quantity beside the product.
+4. Enter reason/refund method.
+5. Submit.
+
+No stock changes while request is pending. Manager/Admin approves or rejects. Do not manually adjust stock to imitate a return.
+
+## 5. Void invoice (Manager/Admin)
+Use only for a fully cancelled clean transaction. Select invoice, enter reason and choose **Void Entire Sale**. Do not use Void after a partial return has started.
+
+## 6. End cashier shift
+1. Count actual cash physically.
+2. Open **Shift / Close**.
+3. Enter Actual Cash and request close.
+4. Manager/Admin compares expected versus actual cash and approves close.
+5. Investigate/document any variance.
+
+## 7. Physical stock count (Manager/Admin)
+1. Inventory → Stock Count → Start Stock Count.
+2. Walk the shop and scan bottles. Repeated scans increment count.
+3. For bulk shelf/case counts, type counted quantity manually.
+4. After the full shop is counted, review unseen SKUs.
+5. Only if truly absent, use **Mark Unseen = 0**.
+6. Submit.
+7. Manager/Admin approves. Approval is when inventory changes.
+
+## 8. Thermal receipt
+Admin opens Printer settings and configures 80mm or 58mm, store address/phone/footer. On invoice choose **Print Receipt**, select the installed thermal printer and use minimum/no margins.
+
+## 9. Purchase Order
+1. Procurement → select supplier.
+2. Add products/ordered quantities/purchase prices.
+3. Create PO.
+4. Mark Sent when ordered.
+5. When goods arrive choose Receive, enter supplier invoice number.
+6. Inventory increases only after Receive succeeds.
+
+## 10. Supplier payment
+Procurement → Record Supplier Payment. Select supplier, amount, method and reference. Supplier Balance shows received invoices less payments and purchase returns.
+
+## 11. Purchase return
+Use Supplier Return only when goods physically leave the shop. The system checks stock, decreases inventory and records a supplier-return movement.
+
+## 12. Purchase price history
+Open **Price History**, choose product and compare invoices. Positive percentage means latest known purchase cost increased versus the oldest row loaded.
+
+## 13. Smart reorder
+Open **Smart Reorder**. Default history is 30 days and target is 7 stock days. Review suggested bottles/cases and create a PO where appropriate. The suggestion is a calculation, not a mandatory order.
+
+## 14. Branch transfer
+Branches must be configured by platform administration under the same organization.
+- Source creates transfer request.
+- Stock does not move yet.
+- Destination Manager/Admin verifies goods/request and approves.
+- Approval moves source and destination stock together.
+
+Never use branch transfer to move stock between unrelated customer accounts.
+
+## 15. Audit (Admin)
+Audit shows important creates/updates and business actions. Use it to investigate price changes, stock adjustments, voids, refunds, receipts and transfers. JSON details may show before/after values.
+
+## 16. Internet outage / Offline POS
+Offline selling is emergency-only.
+1. The device must have been logged in and loaded online previously.
+2. If connection drops, POS can store a sale in the encrypted local queue.
+3. The Offline Queue shows pending items.
+4. On reconnection choose Sync Now.
+5. If server rejects a sale due to stock/authorization/shift conflict, do not delete it casually. Manager reconciles the physical receipt and cloud stock.
+6. Sync before requesting shift close.
+
+## 17. Invoice OCR (Manager/Admin)
+1. OCR / Automation → choose invoice photo/PDF.
+2. Analyze.
+3. Review supplier, invoice number, every line, quantity, price and product match.
+4. Send reviewed draft to Receive Stock.
+5. Review again and press Confirm & Receive Stock.
+
+OCR by itself never updates stock. If the page says OCR_NOT_CONFIGURED, Azure Document Intelligence has not yet been activated by the developer.
+
+## 18. Daily Manager checklist
+- pending returns
+- cashier close requests/variances
+- offline conflicts
+- submitted stock counts
+- low-stock reorder list
+- open/partially received POs
+- supplier balances
+- unusual audit events
+
+## 19. Troubleshooting
+### Product not found
+Check barcode in Products. If new, add it using the unknown-barcode action.
+
+### Cashier gets SHIFT_REQUIRED
+Open Shift / Close and start a shift.
+
+### Offline sale will not sync
+Read the conflict message. Common reasons are insufficient current stock or a closed/missing cashier shift.
+
+### Scanner behaves like keyboard typing
+Use Scanner Test. Confirm scanner appends Enter and adjust average key-gap threshold only after testing.
+
+### Receipt width wrong
+Admin → Printer → choose 58/80mm matching paper; use browser minimum/no margins.
+
+### OCR not configured
+This is not a user error. Developer must configure Azure Document Intelligence Edge Function secrets.
diff --git a/docs/testing/CHAPTERS_16_26_TEST_MATRIX.md b/docs/testing/CHAPTERS_16_26_TEST_MATRIX.md
new file mode 100644
index 0000000..07ccbe3
--- /dev/null
+++ b/docs/testing/CHAPTERS_16_26_TEST_MATRIX.md
@@ -0,0 +1,84 @@
+# Chapters 16–26 Test Matrix
+
+## Release gate
+1. `npm run build` passes.
+2. `npx supabase db push --dry-run` shows the intended migration only.
+3. `npx supabase db push` succeeds.
+4. `npx supabase functions deploy ocr-invoice` succeeds.
+5. Admin login and Chapter 15 regression still work.
+
+## Chapter 16 Scanner
+- Scan `8900000010016` with focus in Discount; barcode does not remain in Discount.
+- Duplicate scan increments quantity.
+- Slow human typing does not trigger scan.
+- Unknown barcode opens Add Product with barcode prefilled.
+- Success/error beeps are distinct.
+
+## Chapter 17 Returns
+- Pending return causes no stock movement.
+- Approval restores exact quantity, refund payment and audit.
+- Over-return is rejected.
+- Void clean invoice restores all stock; invoice cannot be voided twice.
+
+## Chapter 18 Shift
+- Cashier cannot sell without open shift.
+- Opening cash + Cash sales - Cash refunds = expected cash.
+- actual/expected variance stored.
+- close requires manager/admin approval.
+
+## Chapter 19 Stock Count
+- Create snapshots active SKUs.
+- Scanner increments counted SKU.
+- Submission fails while NULL/unseen SKUs remain.
+- explicit zero action works.
+- approval applies discrepancies exactly once.
+
+## Chapter 20 Receipt
+- 80mm and 58mm layouts print without clipping.
+- invoice totals/payment/store header are correct.
+
+## Chapter 21 Procurement
+- PO create/send/receive.
+- inventory increases only on receive.
+- supplier payment reduces balance.
+- supplier return reduces stock/balance.
+- price history reflects invoices.
+
+## Chapter 22 Reorder
+- low-stock/high-velocity products are suggested.
+- case rounding uses units_per_case.
+- Create PO produces correct quantity.
+
+## Chapter 23 Transfer
+- unrelated organization shop not listed.
+- request moves no stock.
+- destination approval creates paired stock movements.
+- insufficient stock rejects atomically.
+
+## Chapter 24 Audit/Security
+- product price edit shows before/after audit.
+- cashier sees only own sales.
+- cashier cannot query purchase price through get_products.
+- audit page is ADMIN only.
+
+## Chapter 25 Offline
+- after prior online load, disconnect and create offline sale.
+- IndexedDB record is encrypted (no plaintext cart JSON in the queue record).
+- reconnect and sync creates one sale.
+- repeat sync cannot duplicate client_sale_id.
+- stock conflict remains CONFLICT.
+
+## Chapter 26 OCR
+- without Azure secrets returns OCR_NOT_CONFIGURED.
+- with configured resource, invoice extracts fields/items.
+- human review is required before Receive Stock.
+- stock does not change during OCR itself.
+
+## Regression
+- login/kill switch
+- product CRUD
+- normal POS sale
+- receive stock
+- dashboard/reports
+- Admin creates Manager/Cashier
+- Azure static URL after deployment
diff --git a/index.html b/index.html
index 1b9f1fa..5e8b810 100644
--- a/index.html
+++ b/index.html
@@ -5,7 +5,8 @@
     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>wineshoppos</title>
-  </head>
+    <link rel="manifest" href="./manifest.webmanifest" />
+</head>
   <body>
     <div id="root"></div>
     <script type="module" src="/src/main.jsx"></script>
diff --git a/public/manifest.webmanifest b/public/manifest.webmanifest
new file mode 100644
index 0000000..281804a
--- /dev/null
+++ b/public/manifest.webmanifest
@@ -0,0 +1,9 @@
+{
+  "name": "WineShop POS",
+  "short_name": "WineShopPOS",
+  "start_url": "./",
+  "display": "standalone",
+  "background_color": "#ffffff",
+  "theme_color": "#15171c",
+  "description": "Wine shop barcode POS and inventory management"
+}
diff --git a/public/sw.js b/public/sw.js
new file mode 100644
index 0000000..c3d2e05
--- /dev/null
+++ b/public/sw.js
@@ -0,0 +1,28 @@
+const CACHE = "wineshoppos-shell-v16";
+const SHELL = ["./", "./index.html"];
+
+self.addEventListener("install", (event) => {
+  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
+});
+
+self.addEventListener("activate", (event) => {
+  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
+});
+
+self.addEventListener("fetch", (event) => {
+  if (event.request.method !== "GET") return;
+  event.respondWith(
+    fetch(event.request)
+      .then((response) => {
+        const copy = response.clone();
+        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
+        return response;
+      })
+      .catch(async () => {
+        const cached = await caches.match(event.request);
+        if (cached) return cached;
+        if (event.request.mode === "navigate") return caches.match("./index.html");
+        throw new Error("OFFLINE_NOT_CACHED");
+      })
+  );
+});
diff --git a/scripts/apply_chapters_16_26.sh b/scripts/apply_chapters_16_26.sh
new file mode 100644
index 0000000..13b7a8c
--- /dev/null
+++ b/scripts/apply_chapters_16_26.sh
@@ -0,0 +1,280 @@
+#!/usr/bin/env bash
+set -euo pipefail
+
+PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+PROJECT_ROOT="/e/WineShopPOS"
+PROJECT_REF="uiurgplnsgmawvxhjzzp"
+AZ_SUBSCRIPTION="Azure subscription 1"
+AZ_RG="wineshopPOS"
+AZ_STORAGE="wineshoppos"
+
+say() { printf '\n============================================================\n%s\n============================================================\n' "$1"; }
+fail() { echo "ERROR: $*" >&2; exit 1; }
+
+say "WineShopPOS Chapters 16-26 FINAL RELEASE"
+
+test -d "$PROJECT_ROOT/.git" || fail "$PROJECT_ROOT is not the WineShopPOS Git repository."
+test -d "$PACKAGE_DIR/source" || fail "Release package source/ folder is missing. Extract the full ZIP first."
+test -f "$PACKAGE_DIR/release_docs/WineShopPOS_Developer_Handbook_Chapters_16_26.docx" || fail "Developer handbook missing from release package."
+
+cd "$PROJECT_ROOT"
+
+BRANCH="$(git branch --show-current)"
+[[ "$BRANCH" == "main" ]] || fail "Please run this release from Git branch main. Current branch: $BRANCH"
+
+# Checkpoint only existing TRACKED modifications. Untracked personal/download files are not staged.
+if ! git diff --quiet || ! git diff --cached --quiet; then
+  say "Creating local checkpoint for existing tracked work"
+  git add -u
+  if ! git diff --cached --quiet; then
+    git commit -m "Checkpoint before Chapters 16-26 production expansion"
+  fi
+fi
+
+say "Applying Chapters 16-26 source overlay"
+cp -R "$PACKAGE_DIR/source/." "$PROJECT_ROOT/"
+mkdir -p docs/handbook docs/manual scripts docs/azure
+cp "$PACKAGE_DIR/release_docs/WineShopPOS_Developer_Handbook_Chapters_16_26.docx" docs/handbook/
+cp "$PACKAGE_DIR/release_docs/WineShopPOS_User_Manual_Advanced.docx" docs/manual/
+cp "$PACKAGE_DIR/apply_chapters_16_26.sh" scripts/apply_chapters_16_26.sh
+cp "$PACKAGE_DIR/create_document_intelligence_f0.sh" scripts/create_document_intelligence_f0.sh
+chmod +x scripts/apply_chapters_16_26.sh scripts/create_document_intelligence_f0.sh
+
+# Add web manifest if the older Chapter 15 index does not already reference it.
+node <<'NODE'
+const fs = require("fs");
+const file = "index.html";
+let text = fs.readFileSync(file, "utf8");
+if (!text.includes("manifest.webmanifest")) {
+  text = text.replace(/<\/head>/i, '  <link rel="manifest" href="./manifest.webmanifest" />\n</head>');
+  fs.writeFileSync(file, text);
+  console.log("Added manifest.webmanifest link to index.html");
+}
+NODE
+
+# ------------------------------------------------------------
+# GATE 1: front-end build BEFORE any database changes.
+# ------------------------------------------------------------
+say "Gate 1 - Production build before cloud changes"
+npm run build
+
+# ------------------------------------------------------------
+# Azure Document Intelligence: F0 ONLY, no paid fallback.
+# Do this before DB changes so OCR configuration is known early.
+# ------------------------------------------------------------
+say "Creating/reusing Azure Document Intelligence F0"
+command -v az >/dev/null 2>&1 || fail "Azure CLI is required. Install az, reopen Git Bash, rerun."
+OCR_SECRET_FILE="$(mktemp "${TMPDIR:-/tmp}/wineshop-ocr-secrets.XXXXXX")"
+chmod 600 "$OCR_SECRET_FILE" 2>/dev/null || true
+trap 'rm -f "$OCR_SECRET_FILE"' EXIT
+
+set +e
+OCR_OUTPUT="$(WINESHOP_OCR_SECRET_FILE="$OCR_SECRET_FILE" \
+  WINESHOP_OCR_METADATA_FILE="$PROJECT_ROOT/docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md" \
+  bash "$PACKAGE_DIR/create_document_intelligence_f0.sh" 2>&1)"
+OCR_RC=$?
+set -e
+printf '%s\n' "$OCR_OUTPUT"
+
+OCR_READY=false
+if [[ $OCR_RC -eq 0 ]]; then
+  OCR_READY=true
+elif [[ $OCR_RC -eq 20 ]]; then
+  echo "WARNING: F0 is unavailable. Continuing Chapters 16-25 and deploying OCR function unconfigured."
+  echo "No S0/paid OCR resource was created."
+  cat > docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md <<'EOF'
+# Azure Document Intelligence — WineShopPOS
+
+Status: **F0 unavailable during release**.
+
+The installer deliberately did **not** create S0 or another paid OCR resource. The OCR Edge Function can still be deployed, but will return `OCR_NOT_CONFIGURED` until an F0 (or manually approved paid resource) is configured later.
+EOF
+else
+  fail "Azure Document Intelligence provisioning failed unexpectedly (exit $OCR_RC). No paid fallback was attempted."
+fi
+
+# ------------------------------------------------------------
+# Supabase CLI + additive DB migration.
+# ------------------------------------------------------------
+say "Supabase migration preflight"
+if ! npx supabase --version >/dev/null 2>&1; then
+  echo "Installing Supabase CLI locally as dev dependency..."
+  npm install supabase --save-dev
+fi
+
+# Re-linking is safe and verifies the intended remote project.
+npx supabase link --project-ref "$PROJECT_REF"
+
+say "Supabase migration DRY RUN"
+npx supabase db push --dry-run
+
+say "Applying additive Chapters 16-26 migration"
+npx supabase db push
+
+# Upload Azure OCR secrets only after migration succeeds.
+if [[ "$OCR_READY" == "true" ]]; then
+  say "Storing Azure OCR endpoint/key in Supabase Edge Function secrets"
+  npx supabase secrets set --env-file "$OCR_SECRET_FILE" --project-ref "$PROJECT_REF"
+  : > "$OCR_SECRET_FILE"
+fi
+rm -f "$OCR_SECRET_FILE"
+trap - EXIT
+
+say "Deploying OCR Edge Function"
+npx supabase functions deploy ocr-invoice --project-ref "$PROJECT_REF" --use-api
+
+# ------------------------------------------------------------
+# GATE 2: final production build after migration/function source.
+# ------------------------------------------------------------
+say "Gate 2 - Final production build"
+npm run build
+cp dist/index.html dist/404.html
+
+# ------------------------------------------------------------
+# Git release commit. Stage explicit project paths, never .env.local.
+# ------------------------------------------------------------
+say "Creating local release commit"
+git add \
+  src \
+  public \
+  index.html \
+  supabase/migrations \
+  supabase/functions/ocr-invoice \
+  supabase/config.toml \
+  docs \
+  scripts/apply_chapters_16_26.sh \
+  scripts/create_document_intelligence_f0.sh \
+  package.json
+if [[ -f package-lock.json ]]; then git add package-lock.json; fi
+
+if git diff --cached --quiet; then
+  echo "No staged application changes found; using current HEAD as release commit."
+else
+  git commit -m "Chapters 16-26 - Production operations offline OCR and audit"
+fi
+RELEASE_COMMIT="$(git rev-parse HEAD)"
+
+# ------------------------------------------------------------
+# Generate ACTUAL Git code history from the release commit.
+# ------------------------------------------------------------
+say "Generating actual Git code-history for Chapters 16-26"
+export RELEASE_COMMIT
+node <<'NODE'
+const { execFileSync } = require("child_process");
+const fs = require("fs");
+const path = require("path");
+
+const hash = process.env.RELEASE_COMMIT;
+const out = path.join("docs", "code-history");
+fs.mkdirSync(out, { recursive: true });
+
+function git(args) {
+  try {
+    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 250 });
+  } catch { return ""; }
+}
+function at(file) { return git(["show", `${hash}:${file}`]); }
+function exists(file) {
+  try { execFileSync("git", ["cat-file", "-e", `${hash}:${file}`], { stdio: "ignore" }); return true; }
+  catch { return false; }
+}
+function lang(file) {
+  const ext = path.extname(file).toLowerCase();
+  return ({".jsx":"jsx",".js":"javascript",".ts":"typescript",".css":"css",".sql":"sql",".md":"markdown",".json":"json"})[ext] || "text";
+}
+function fence(text) { return text.replace(/````\`/g, "````\\`"); }
+const meta = git(["show","-s","--format=Commit: %H%nShort: %h%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s","--date=iso-strict",hash]).trim();
+const changed = git(["diff-tree","--no-commit-id","--name-status","-r","-M",hash]).trim();
+const patch = git(["show","--format=fuller","--find-renames","--stat","--patch",hash]);
+
+const featureFiles = {
+  16:["src/context/ScannerContext.jsx","src/pages/POS.jsx","src/pages/ScannerSettings.jsx","src/pages/AddProduct.jsx","src/context/ShopContext.jsx"],
+  17:["src/pages/Returns.jsx","src/context/ShopContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  18:["src/pages/Shifts.jsx","src/pages/POS.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  19:["src/pages/StockCount.jsx","src/context/ScannerContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  20:["src/components/Receipt80mm.jsx","src/pages/PrinterSettings.jsx","src/pages/SaleDetails.jsx","src/chapters16to26.css"],
+  21:["src/pages/Procurement.jsx","src/pages/Purchases.jsx","src/pages/PriceHistory.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  22:["src/pages/Reorder.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  23:["src/pages/Transfers.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  24:["src/pages/Audit.jsx","src/components/Layout.jsx","src/context/AuthContext.jsx","src/context/ShopContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  25:["src/lib/offlineQueue.js","src/components/OfflineStatus.jsx","src/pages/OfflineQueue.jsx","src/pages/Shifts.jsx","src/context/AuthContext.jsx","src/context/ShopContext.jsx","public/sw.js","public/manifest.webmanifest","supabase/migrations/20260829190000_chapters_16_26.sql"],
+  26:["src/pages/AutomationHub.jsx","src/pages/Purchases.jsx","supabase/functions/ocr-invoice/index.ts","supabase/migrations/20260829190000_chapters_16_26.sql","docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md"]
+};
+
+const combined = [];
+combined.push("# WineShopPOS Chapters 16-26 — Actual Git Release History","");
+combined.push("> Generated from the real release commit. Git is the source of truth; this is not reconstructed from chat memory.","");
+combined.push("## Commit", "", "```text", meta, "```", "");
+combined.push("## Changed files", "", "```text", changed || "(none)", "```", "");
+combined.push("## Exact release patch", "", "````\`diff", fence(patch).trimEnd(), "````\`", "");
+fs.writeFileSync(path.join(out,"chapters-16-26-release.md"), combined.join("\n")+"\n");
+
+for (let chapter=16; chapter<=26; chapter++) {
+  const lines=[];
+  lines.push(`# Chapter ${chapter} — Actual Release Code`,"");
+  lines.push("> This chapter was delivered in the combined Chapters 16-26 release commit.","");
+  lines.push("## Shared release commit","","```text",meta,"```","");
+  lines.push("## Feature-specific canonical source snapshots","");
+  for (const file of featureFiles[chapter] || []) {
+    if (!exists(file)) continue;
+    lines.push(`### \`${file}\``,"",`\`\`\`\`\`${lang(file)}`,fence(at(file)).trimEnd(),"````\`","");
+  }
+  fs.writeFileSync(path.join(out,`chapter-${chapter}-code.md`),lines.join("\n")+"\n");
+}
+
+const index=["# Chapters 16-26 Code History","",`Release commit: \`${hash}\``,"","All chapter files are generated from that exact combined release commit.",""];
+for(let c=16;c<=26;c++) index.push(`- [Chapter ${c}](chapter-${c}-code.md)`);
+index.push("- [Combined exact patch](chapters-16-26-release.md)","");
+fs.writeFileSync(path.join(out,"README-16-26.md"),index.join("\n"));
+console.log(`Generated code history from ${hash}`);
+NODE
+
+git add docs/code-history
+if ! git diff --cached --quiet; then
+  git commit -m "Docs - Add actual Git code history for Chapters 16-26"
+fi
+
+# ONE network Git push for checkpoint/release/history commits.
+say "Pushing all release commits to GitHub once"
+git push origin main
+
+# ------------------------------------------------------------
+# Azure Blob deployment.
+# ------------------------------------------------------------
+say "Deploying final Vite build to Azure Blob static website"
+az account set --subscription "$AZ_SUBSCRIPTION"
+az storage account show -n "$AZ_STORAGE" -g "$AZ_RG" -o none
+STORAGE_KEY="$(az storage account keys list -n "$AZ_STORAGE" -g "$AZ_RG" --query '[0].value' -o tsv)"
+[[ -n "$STORAGE_KEY" ]] || fail "Could not retrieve Azure Storage account key."
+
+az storage blob service-properties update \
+  --account-name "$AZ_STORAGE" \
+  --account-key "$STORAGE_KEY" \
+  --static-website true \
+  --index-document index.html \
+  --404-document 404.html \
+  -o none
+
+az storage blob upload-batch \
+  --account-name "$AZ_STORAGE" \
+  --account-key "$STORAGE_KEY" \
+  --destination '$web' \
+  --source dist \
+  --overwrite true \
+  -o none
+unset STORAGE_KEY
+
+SITE_URL="$(az storage account show -n "$AZ_STORAGE" -g "$AZ_RG" --query primaryEndpoints.web -o tsv)"
+
+say "RELEASE COMPLETE"
+echo "Website: $SITE_URL"
+echo "Git release commit: $RELEASE_COMMIT"
+echo "Supabase project: $PROJECT_REF"
+echo "OCR F0 configured: $OCR_READY"
+if [[ "$OCR_READY" == "true" ]]; then
+  echo "Azure OCR metadata: docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md"
+else
+  echo "OCR is intentionally unconfigured because no free F0 resource was available. No paid fallback occurred."
+fi
+echo
+echo "Run the manual smoke test: docs/testing/CHAPTERS_16_26_TEST_MATRIX.md"
diff --git a/scripts/create_document_intelligence_f0.sh b/scripts/create_document_intelligence_f0.sh
new file mode 100644
index 0000000..697bb0c
--- /dev/null
+++ b/scripts/create_document_intelligence_f0.sh
@@ -0,0 +1,186 @@
+#!/usr/bin/env bash
+set -euo pipefail
+
+# WineShopPOS Azure Document Intelligence F0 provisioner.
+# Safe rule: only F0. Never silently create S0.
+
+SUBSCRIPTION="Azure subscription 1"
+TARGET_RG="wineshopPOS"
+TARGET_LOCATION="centralindia"
+KIND="FormRecognizer"
+PROJECT_REF="uiurgplnsgmawvxhjzzp"
+
+if ! command -v az >/dev/null 2>&1; then
+  echo "ERROR: Azure CLI (az) is not installed."
+  exit 1
+fi
+
+if ! az account show >/dev/null 2>&1; then
+  echo "Azure login required..."
+  az login
+fi
+
+az account set --subscription "$SUBSCRIPTION"
+
+if ! az group show --name "$TARGET_RG" >/dev/null 2>&1; then
+  echo "ERROR: Azure resource group $TARGET_RG was not found."
+  exit 1
+fi
+
+echo "Registering Microsoft.CognitiveServices if needed..."
+az provider register --namespace Microsoft.CognitiveServices --wait >/dev/null
+
+F0_AVAILABLE="$(az cognitiveservices account list-skus \
+  --kind "$KIND" \
+  --location "$TARGET_LOCATION" \
+  --query "[?name=='F0'].name | [0]" \
+  -o tsv 2>/dev/null || true)"
+
+if [[ "$F0_AVAILABLE" != "F0" ]]; then
+  echo "WARNING: Azure did not advertise Document Intelligence F0 in $TARGET_LOCATION."
+fi
+
+# Prefer an existing project-local F0 resource.
+DOC_NAME="$(az cognitiveservices account list \
+  --resource-group "$TARGET_RG" \
+  --query "[?kind=='FormRecognizer' && sku.name=='F0'] | [0].name" \
+  -o tsv 2>/dev/null || true)"
+DOC_RG="$TARGET_RG"
+DOC_LOCATION=""
+DOC_REUSED="false"
+
+if [[ -n "$DOC_NAME" ]]; then
+  DOC_REUSED="true"
+  DOC_LOCATION="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query location -o tsv)"
+  echo "Reusing existing F0 Document Intelligence resource: $DOC_NAME"
+else
+  if [[ "$F0_AVAILABLE" == "F0" ]]; then
+    SUB_ID="$(az account show --query id -o tsv)"
+    if command -v sha256sum >/dev/null 2>&1; then
+      SUFFIX="$(printf '%s' "$SUB_ID" | sha256sum | cut -c1-8)"
+    else
+      SUFFIX="$(printf '%s' "$SUB_ID" | tr -cd '[:alnum:]' | tail -c 9)"
+    fi
+    DOC_NAME="wineshoppos-docintel-${SUFFIX,,}"
+    echo "Creating Azure Document Intelligence F0: $DOC_NAME"
+    set +e
+    CREATE_OUTPUT="$(az cognitiveservices account create \
+      --name "$DOC_NAME" \
+      --resource-group "$TARGET_RG" \
+      --kind "$KIND" \
+      --sku F0 \
+      --location "$TARGET_LOCATION" \
+      --tags project=WineShopPOS costTier=F0-free-only \
+      --yes \
+      --only-show-errors \
+      -o json 2>&1)"
+    CREATE_RC=$?
+    set -e
+
+    if [[ $CREATE_RC -ne 0 ]]; then
+      echo "First F0 create attempt failed. No paid resource was created."
+      echo "$CREATE_OUTPUT"
+
+      # Retry once with a different free-resource name in case only the name collided.
+      RETRY_NAME="wineshoppos-docintel-${SUFFIX,,}-$RANDOM"
+      echo "Retrying F0 with alternate name: $RETRY_NAME"
+      set +e
+      CREATE_OUTPUT="$(az cognitiveservices account create \
+        --name "$RETRY_NAME" \
+        --resource-group "$TARGET_RG" \
+        --kind "$KIND" \
+        --sku F0 \
+        --location "$TARGET_LOCATION" \
+        --tags project=WineShopPOS costTier=F0-free-only \
+        --yes \
+        --only-show-errors \
+        -o json 2>&1)"
+      CREATE_RC=$?
+      set -e
+      if [[ $CREATE_RC -eq 0 ]]; then
+        DOC_NAME="$RETRY_NAME"
+        DOC_LOCATION="$TARGET_LOCATION"
+      else
+        echo "Second F0 create attempt also failed. No paid resource was created."
+        echo "$CREATE_OUTPUT"
+        DOC_NAME=""
+      fi
+    else
+      DOC_LOCATION="$TARGET_LOCATION"
+    fi
+  fi
+
+  # If F0 creation is blocked because the subscription already has a free
+  # FormRecognizer account elsewhere, reuse that free account rather than pay.
+  if [[ -z "$DOC_NAME" ]]; then
+    EXISTING_ROW="$(az cognitiveservices account list \
+      --query "[?kind=='FormRecognizer' && sku.name=='F0'] | [0].[name,resourceGroup,location]" \
+      -o tsv 2>/dev/null || true)"
+    if [[ -n "$EXISTING_ROW" ]]; then
+      IFS=$'\t' read -r DOC_NAME DOC_RG DOC_LOCATION <<< "$EXISTING_ROW"
+      DOC_REUSED="true"
+      echo "Reusing subscription F0 Document Intelligence resource: $DOC_NAME ($DOC_RG / $DOC_LOCATION)"
+    fi
+  fi
+fi
+
+if [[ -z "$DOC_NAME" ]]; then
+  echo "OCR_F0_AVAILABLE=false"
+  echo "No F0 resource could be created or reused."
+  echo "The installer will NOT create S0 or any paid OCR resource."
+  exit 20
+fi
+
+ACTUAL_SKU="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query sku.name -o tsv)"
+if [[ "$ACTUAL_SKU" != "F0" ]]; then
+  echo "ERROR: Selected OCR resource is $ACTUAL_SKU, not F0. Refusing to continue."
+  exit 21
+fi
+
+DOC_ENDPOINT="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query properties.endpoint -o tsv)"
+DOC_KEY="$(az cognitiveservices account keys list -n "$DOC_NAME" -g "$DOC_RG" --query key1 -o tsv)"
+
+if [[ -z "$DOC_ENDPOINT" || -z "$DOC_KEY" ]]; then
+  echo "ERROR: Could not retrieve F0 endpoint/key."
+  exit 22
+fi
+
+# Outputs intended for the parent installer. Key is written only to the named
+# temp env file when supplied; it is never printed.
+if [[ -n "${WINESHOP_OCR_SECRET_FILE:-}" ]]; then
+  umask 077
+  cat > "$WINESHOP_OCR_SECRET_FILE" <<EOF
+AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$DOC_ENDPOINT
+AZURE_DOCUMENT_INTELLIGENCE_KEY=$DOC_KEY
+EOF
+  chmod 600 "$WINESHOP_OCR_SECRET_FILE" 2>/dev/null || true
+fi
+
+if [[ -n "${WINESHOP_OCR_METADATA_FILE:-}" ]]; then
+  mkdir -p "$(dirname "$WINESHOP_OCR_METADATA_FILE")"
+  cat > "$WINESHOP_OCR_METADATA_FILE" <<EOF
+# Azure Document Intelligence — WineShopPOS
+
+- Resource name: \`$DOC_NAME\`
+- Resource group: \`$DOC_RG\`
+- Location: \`$DOC_LOCATION\`
+- Kind: \`FormRecognizer\`
+- SKU: \`F0\`
+- Endpoint: \`$DOC_ENDPOINT\`
+- Reused existing resource: \`$DOC_REUSED\`
+- Model used by application: \`prebuilt-invoice\`
+- REST API version: \`2024-11-30\`
+
+The subscription key is intentionally **not documented or committed**. It is stored only as a Supabase Edge Function secret.
+
+Cost rule: the deployment automation accepts F0 only and has no automatic S0 fallback.
+EOF
+fi
+
+unset DOC_KEY
+
+echo "OCR_F0_AVAILABLE=true"
+echo "OCR_RESOURCE_NAME=$DOC_NAME"
+echo "OCR_RESOURCE_GROUP=$DOC_RG"
+echo "OCR_RESOURCE_LOCATION=$DOC_LOCATION"
+echo "OCR_ENDPOINT=$DOC_ENDPOINT"
diff --git a/src/App.jsx b/src/App.jsx
index accdbf2..b189edc 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -1,48 +1,5 @@
 import { Route, Routes } from "react-router-dom";
-import Layout from "./components/Layout";
-import RequireAuth from "./components/RequireAuth";
-import RequireRole from "./components/RequireRole";
-import AddProduct from "./pages/AddProduct";
-import Dashboard from "./pages/Dashboard";
-import EditProduct from "./pages/EditProduct";
-import Inventory from "./pages/Inventory";
-import Login from "./pages/Login";
-import POS from "./pages/POS";
-import Products from "./pages/Products";
-import Purchases from "./pages/Purchases";
-import Reports from "./pages/Reports";
-import SaleDetails from "./pages/SaleDetails";
-import Sales from "./pages/Sales";
-import Settings from "./pages/Settings";
-import Users from "./pages/Users";
-
-export default function App() {
-  return (
-    <Routes>
-      <Route path="/login" element={<Login />} />
-
-      <Route element={<RequireAuth />}>
-        <Route element={<Layout />}>
-          <Route index element={<Dashboard />} />
-          <Route path="pos" element={<POS />} />
-          <Route path="sales" element={<Sales />} />
-          <Route path="sales/:id" element={<SaleDetails />} />
-
-          <Route element={<RequireRole roles={["ADMIN","MANAGER"]} />}>
-            <Route path="products" element={<Products />} />
-            <Route path="products/new" element={<AddProduct />} />
-            <Route path="products/:id/edit" element={<EditProduct />} />
-            <Route path="inventory" element={<Inventory />} />
-            <Route path="purchases" element={<Purchases />} />
-            <Route path="reports" element={<Reports />} />
-          </Route>
-
-          <Route element={<RequireRole roles={["ADMIN"]} />}>
-            <Route path="users" element={<Users />} />
-            <Route path="settings" element={<Settings />} />
-          </Route>
-        </Route>
-      </Route>
-    </Routes>
-  );
-}
+import Layout from "./components/Layout";import RequireAuth from "./components/RequireAuth";import RequireRole from "./components/RequireRole";
+import AddProduct from "./pages/AddProduct";import Dashboard from "./pages/Dashboard";import EditProduct from "./pages/EditProduct";import Inventory from "./pages/Inventory";import Login from "./pages/Login";import POS from "./pages/POS";import Products from "./pages/Products";import Purchases from "./pages/Purchases";import Reports from "./pages/Reports";import SaleDetails from "./pages/SaleDetails";import Sales from "./pages/Sales";import Settings from "./pages/Settings";import Users from "./pages/Users";
+import PriceHistory from "./pages/PriceHistory";import ScannerSettings from "./pages/ScannerSettings";import Returns from "./pages/Returns";import Shifts from "./pages/Shifts";import StockCount from "./pages/StockCount";import PrinterSettings from "./pages/PrinterSettings";import Procurement from "./pages/Procurement";import Reorder from "./pages/Reorder";import Transfers from "./pages/Transfers";import Audit from "./pages/Audit";import OfflineQueue from "./pages/OfflineQueue";import AutomationHub from "./pages/AutomationHub";
+export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route element={<RequireAuth/>}><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="pos" element={<POS/>}/><Route path="shifts" element={<Shifts/>}/><Route path="returns" element={<Returns/>}/><Route path="sales" element={<Sales/>}/><Route path="sales/:id" element={<SaleDetails/>}/><Route path="scanner-settings" element={<ScannerSettings/>}/><Route path="offline-queue" element={<OfflineQueue/>}/><Route element={<RequireRole roles={["ADMIN","MANAGER"]}/> }><Route path="products" element={<Products/>}/><Route path="products/new" element={<AddProduct/>}/><Route path="products/:id/edit" element={<EditProduct/>}/><Route path="inventory" element={<Inventory/>}/><Route path="stock-count" element={<StockCount/>}/><Route path="purchases" element={<Purchases/>}/><Route path="procurement" element={<Procurement/>}/><Route path="price-history" element={<PriceHistory/>}/><Route path="reorder" element={<Reorder/>}/><Route path="transfers" element={<Transfers/>}/><Route path="reports" element={<Reports/>}/><Route path="automation" element={<AutomationHub/>}/></Route><Route element={<RequireRole roles={["ADMIN"]}/> }><Route path="users" element={<Users/>}/><Route path="audit" element={<Audit/>}/><Route path="printer-settings" element={<PrinterSettings/>}/><Route path="settings" element={<Settings/>}/></Route></Route></Route></Routes>}
diff --git a/src/chapters16to26.css b/src/chapters16to26.css
new file mode 100644
index 0000000..37bdd31
--- /dev/null
+++ b/src/chapters16to26.css
@@ -0,0 +1,4 @@
+/* WineShopPOS Chapters 16-26 */
+.button-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.button-row.spread{justify-content:space-between}.danger-button{background:#9d1d20;color:#fff;border:0;border-radius:7px;padding:10px 14px;cursor:pointer}.negative{color:#a91c1f;font-weight:700}.positive{color:#167346;font-weight:700}.icon-logout{margin-left:auto;border:0;background:transparent;color:#fff;padding:4px;cursor:pointer}.topbar-actions{display:flex;align-items:center;gap:12px}.offline-status{display:flex;flex-direction:column;align-items:flex-end;font-size:11px;font-weight:800}.offline-status.online span{color:#167346}.offline-status.offline span{color:#b42318}.offline-status small{font-weight:500;color:#666}.product-not-found{margin-bottom:16px;padding:18px;border:2px solid #b42318;background:#fff2f0;border-radius:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}.product-not-found strong{font-size:22px;color:#b42318}.product-not-found span{font-family:monospace;font-size:18px}.scanner-last{min-height:100px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:2px dashed #ccd0d7;border-radius:12px;margin:12px 0}.scanner-last strong{font-family:monospace;font-size:24px}.scanner-last.muted{color:#777}.scanner-commercial-card{border-left:4px solid #333}.audit-json{max-width:520px;white-space:pre-wrap;word-break:break-word;font-size:11px}.thermal-receipt{width:80mm;max-width:100%;margin:0 auto;background:white;color:#000;padding:5mm;font-family:"Courier New",monospace;font-size:11px;line-height:1.3}.thermal-receipt.paper-58{width:58mm}.thermal-receipt header{text-align:center}.thermal-receipt h2,.thermal-receipt p{margin:3px 0}.receipt-rule{border-top:1px dashed #000;margin:7px 0}.receipt-item{margin:5px 0}.receipt-item>div,.receipt-total{display:flex;justify-content:space-between;gap:8px}.receipt-total.grand{font-weight:900;font-size:14px;border-top:1px solid #000;border-bottom:1px solid #000;padding:5px 0;margin:5px 0}.thermal-receipt footer{text-align:center;margin-top:12px;font-weight:700}.print-test-ticket{font-family:monospace}.settings-fields textarea{min-height:90px;padding:8px;border:1px solid #dfe2e7;border-radius:7px}.data-table select{max-width:250px}.panel details summary{cursor:pointer}.pos-layout{align-items:start}
+@media(max-width:1000px){.topbar-actions{align-items:flex-end;flex-direction:column}.nav-menu{overflow-y:auto}.thermal-receipt{width:100%}}
+@media print{body *{visibility:hidden!important}.thermal-receipt,.thermal-receipt *,.print-test-ticket,.print-test-ticket *{visibility:visible!important}.thermal-receipt,.print-test-ticket{position:absolute;left:0;top:0;margin:0!important;box-shadow:none!important;border:0!important}.no-print{display:none!important}@page{size:80mm auto;margin:2mm}body{margin:0;padding:0;background:#fff}}
diff --git a/src/components/Layout.jsx b/src/components/Layout.jsx
index 8c1ca05..245434f 100644
--- a/src/components/Layout.jsx
+++ b/src/components/Layout.jsx
@@ -1,108 +1,9 @@
 import { NavLink, Outlet } from "react-router-dom";
-import {
-  BarChart3,
-  LayoutDashboard,
-  LogOut,
-  Package,
-  ReceiptText,
-  ScanBarcode,
-  Settings,
-  ShoppingBag,
-  Truck,
-  UsersRound,
-  Warehouse,
-  Wine,
-} from "lucide-react";
+import { BarChart3, ClipboardCheck, FileSearch, LayoutDashboard, LogOut, Package, Printer, ReceiptText, RefreshCw, ScanBarcode, Settings, ShoppingBag, ShieldCheck, Truck, Undo2, UsersRound, Warehouse, Wine, ArrowLeftRight, Clock3, Sparkles, TrendingUp } from "lucide-react";
 import { useAuth } from "../context/AuthContext";
-
-const navigation = [
-  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN","MANAGER","CASHIER"] },
-  { path: "/pos", label: "POS Billing", icon: ScanBarcode, roles: ["ADMIN","MANAGER","CASHIER"] },
-  { path: "/products", label: "Products", icon: Package, roles: ["ADMIN","MANAGER"] },
-  { path: "/inventory", label: "Inventory", icon: Warehouse, roles: ["ADMIN","MANAGER"] },
-  { path: "/purchases", label: "Purchases", icon: Truck, roles: ["ADMIN","MANAGER"] },
-  { path: "/sales", label: "Sales", icon: ReceiptText, roles: ["ADMIN","MANAGER","CASHIER"] },
-  { path: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN","MANAGER"] },
-  { path: "/users", label: "Users", icon: UsersRound, roles: ["ADMIN"] },
-  { path: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
-];
-
-export default function Layout() {
-  const { profile, signOut } = useAuth();
-
-  return (
-    <div className="app-shell">
-      <aside className="sidebar">
-        <div className="brand">
-          <div className="brand-icon"><Wine size={25} /></div>
-          <div>
-            <div className="brand-name">WineShop POS</div>
-            <div className="brand-subtitle">{profile?.shop_name || "Retail Management"}</div>
-          </div>
-        </div>
-
-        <nav className="nav-menu">
-          {navigation
-            .filter((item) => item.roles.includes(profile?.role))
-            .map((item) => {
-              const Icon = item.icon;
-              return (
-                <NavLink
-                  key={item.path}
-                  to={item.path}
-                  end={item.path === "/"}
-                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
-                >
-                  <Icon size={19} />
-                  <span>{item.label}</span>
-                </NavLink>
-              );
-            })}
-        </nav>
-
-        <div className="sidebar-footer">
-          <ShoppingBag size={18} />
-          <div>
-            <strong>{profile?.full_name || "User"}</strong>
-            <span>{profile?.role || ""}</span>
-          </div>
-          <button
-            title="Sign out"
-            onClick={signOut}
-            style={{
-              marginLeft: "auto",
-              border: 0,
-              background: "transparent",
-              color: "white",
-              padding: 4,
-              cursor: "pointer",
-            }}
-          >
-            <LogOut size={17} />
-          </button>
-        </div>
-      </aside>
-
-      <main className="main-area">
-        <header className="topbar">
-          <div>
-            <h1>Wine Shop Management</h1>
-            <p>Cloud POS, barcode billing & inventory</p>
-          </div>
-
-          <div className="user-pill">
-            <div className="avatar">
-              {(profile?.full_name || "U").slice(0, 1).toUpperCase()}
-            </div>
-            <div>
-              <strong>{profile?.full_name || "User"}</strong>
-              <span>{profile?.role || ""}</span>
-            </div>
-          </div>
-        </header>
-
-        <div className="page-area"><Outlet /></div>
-      </main>
-    </div>
-  );
-}
+import OfflineStatus from "./OfflineStatus";
+const navigation=[
+{path:"/",label:"Dashboard",icon:LayoutDashboard,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/pos",label:"POS Billing",icon:ScanBarcode,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/shifts",label:"Shift / Close",icon:Clock3,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/returns",label:"Returns / Voids",icon:Undo2,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/sales",label:"Sales",icon:ReceiptText,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/offline-queue",label:"Offline Queue",icon:RefreshCw,roles:["ADMIN","MANAGER","CASHIER"]},
+{path:"/products",label:"Products",icon:Package,roles:["ADMIN","MANAGER"]},{path:"/inventory",label:"Inventory",icon:Warehouse,roles:["ADMIN","MANAGER"]},{path:"/stock-count",label:"Stock Count",icon:ClipboardCheck,roles:["ADMIN","MANAGER"]},{path:"/purchases",label:"Receive Stock",icon:Truck,roles:["ADMIN","MANAGER"]},{path:"/procurement",label:"Procurement",icon:ShoppingBag,roles:["ADMIN","MANAGER"]},{path:"/price-history",label:"Price History",icon:TrendingUp,roles:["ADMIN","MANAGER"]},{path:"/reorder",label:"Smart Reorder",icon:Sparkles,roles:["ADMIN","MANAGER"]},{path:"/transfers",label:"Transfers",icon:ArrowLeftRight,roles:["ADMIN","MANAGER"]},{path:"/reports",label:"Reports",icon:BarChart3,roles:["ADMIN","MANAGER"]},{path:"/automation",label:"OCR / Automation",icon:FileSearch,roles:["ADMIN","MANAGER"]},{path:"/scanner-settings",label:"Scanner",icon:ScanBarcode,roles:["ADMIN","MANAGER","CASHIER"]},
+{path:"/users",label:"Users",icon:UsersRound,roles:["ADMIN"]},{path:"/audit",label:"Audit",icon:ShieldCheck,roles:["ADMIN"]},{path:"/printer-settings",label:"Printer",icon:Printer,roles:["ADMIN"]},{path:"/settings",label:"Settings",icon:Settings,roles:["ADMIN"]},];
+export default function Layout(){const{profile,signOut}=useAuth();return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-icon"><Wine size={25}/></div><div><div className="brand-name">WineShop POS</div><div className="brand-subtitle">{profile?.shop_name||"Retail Management"}</div></div></div><nav className="nav-menu">{navigation.filter((i)=>i.roles.includes(profile?.role)).map((i)=>{const Icon=i.icon;return <NavLink key={i.path} to={i.path} end={i.path==="/"} className={({isActive})=>isActive?"nav-item active":"nav-item"}><Icon size={18}/><span>{i.label}</span></NavLink>})}</nav><div className="sidebar-footer"><ShoppingBag size={18}/><div><strong>{profile?.full_name||"User"}</strong><span>{profile?.role||""}</span></div><button title="Sign out" onClick={signOut} className="icon-logout"><LogOut size={17}/></button></div></aside><main className="main-area"><header className="topbar"><div><h1>Wine Shop Management</h1><p>Cloud POS, barcode billing & inventory</p></div><div className="topbar-actions"><OfflineStatus/><div className="user-pill"><div className="avatar">{(profile?.full_name||"U")[0].toUpperCase()}</div><div><strong>{profile?.full_name||"User"}</strong><span>{profile?.role||""}</span></div></div></div></header><div className="page-area"><Outlet/></div></main></div>}
diff --git a/src/components/OfflineStatus.jsx b/src/components/OfflineStatus.jsx
new file mode 100644
index 0000000..08c6ef6
--- /dev/null
+++ b/src/components/OfflineStatus.jsx
@@ -0,0 +1,32 @@
+import { useEffect, useState } from "react";
+import { offlineQueueCounts } from "../lib/offlineQueue";
+
+export default function OfflineStatus() {
+  const [online, setOnline] = useState(navigator.onLine);
+  const [counts, setCounts] = useState({ pending: 0, conflict: 0 });
+
+  useEffect(() => {
+    const refresh = () => {
+      setOnline(navigator.onLine);
+      offlineQueueCounts().then(setCounts).catch(() => {});
+    };
+    refresh();
+    window.addEventListener("online", refresh);
+    window.addEventListener("offline", refresh);
+    const timer = setInterval(refresh, 5000);
+    return () => {
+      clearInterval(timer);
+      window.removeEventListener("online", refresh);
+      window.removeEventListener("offline", refresh);
+    };
+  }, []);
+
+  return (
+    <div className={`offline-status ${online ? "online" : "offline"}`}>
+      <span>{online ? "ONLINE" : "OFFLINE"}</span>
+      {(counts.pending > 0 || counts.conflict > 0) && (
+        <small>{counts.pending} pending · {counts.conflict} conflict</small>
+      )}
+    </div>
+  );
+}
diff --git a/src/components/Receipt80mm.jsx b/src/components/Receipt80mm.jsx
new file mode 100644
index 0000000..ae56603
--- /dev/null
+++ b/src/components/Receipt80mm.jsx
@@ -0,0 +1,44 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+
+const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
+
+export default function Receipt80mm({ sale }) {
+  const { profile } = useAuth();
+  const [settings, setSettings] = useState(null);
+
+  useEffect(() => {
+    supabase.from("shop_settings").select("store_address,store_phone,tax_registration_number,receipt_footer,printer_paper_mm").maybeSingle()
+      .then(({ data }) => setSettings(data || null));
+  }, []);
+
+  return (
+    <section className={`thermal-receipt paper-${settings?.printer_paper_mm || 80}`}>
+      <header>
+        <h2>{profile?.shop_name || "Wine Shop"}</h2>
+        {settings?.store_address && <p>{settings.store_address}</p>}
+        {settings?.store_phone && <p>Phone: {settings.store_phone}</p>}
+        {settings?.tax_registration_number && <p>Reg: {settings.tax_registration_number}</p>}
+      </header>
+      <div className="receipt-meta">
+        <p>Invoice: {sale.invoiceNumber}</p>
+        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>
+        <p>Cashier: {profile?.full_name || "-"}</p>
+      </div>
+      <div className="receipt-rule" />
+      {sale.items.map((item) => (
+        <div className="receipt-item" key={item.id || item.productId}>
+          <strong>{item.productName}</strong>
+          <div><span>{item.quantity} × {money.format(item.unitPrice)}</span><span>{money.format(item.lineTotal)}</span></div>
+        </div>
+      ))}
+      <div className="receipt-rule" />
+      <div className="receipt-total"><span>Subtotal</span><span>{money.format(sale.subtotal)}</span></div>
+      <div className="receipt-total"><span>Discount</span><span>{money.format(sale.discount)}</span></div>
+      <div className="receipt-total grand"><span>TOTAL</span><span>{money.format(sale.grandTotal)}</span></div>
+      <p>Payment: {sale.paymentMethod}{sale.paymentReference ? ` · ${sale.paymentReference}` : ""}</p>
+      <footer>{settings?.receipt_footer || "THANK YOU"}</footer>
+    </section>
+  );
+}
diff --git a/src/context/AuthContext.jsx b/src/context/AuthContext.jsx
index c3bd6e8..d19ea06 100644
--- a/src/context/AuthContext.jsx
+++ b/src/context/AuthContext.jsx
@@ -2,90 +2,68 @@ import { createContext, useContext, useEffect, useState } from "react";
 import { supabase } from "../lib/supabase";
 
 const AuthContext = createContext(null);
+const CACHE_KEY = "wineshop_auth_cache_v2";
+
+function readCache() {
+  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
+}
+
+function writeCache(profile, access) {
+  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ profile, access, cachedAt: new Date().toISOString() })); } catch {}
+}
 
 export function AuthProvider({ children }) {
+  const cached = readCache();
   const [session, setSession] = useState(null);
-  const [profile, setProfile] = useState(null);
-  const [access, setAccess] = useState(null);
+  const [profile, setProfile] = useState(cached?.profile || null);
+  const [access, setAccess] = useState(cached?.access || null);
   const [loading, setLoading] = useState(true);
+  const [offlineAuth, setOfflineAuth] = useState(false);
 
   async function loadUserState(nextSession) {
     if (!nextSession?.user) {
-      setSession(null);
-      setProfile(null);
-      setAccess(null);
-      setLoading(false);
+      setSession(null); setProfile(null); setAccess(null); setOfflineAuth(false); setLoading(false);
       return;
     }
-
     setSession(nextSession);
-
-    const [profileResult, accessResult] = await Promise.all([
-      supabase.rpc("my_profile"),
-      supabase.rpc("my_shop_access"),
-    ]);
-
-    if (profileResult.error) {
-      console.error(profileResult.error);
-      setProfile(null);
-    } else {
-      setProfile(profileResult.data?.[0] ?? null);
-    }
-
-    if (accessResult.error) {
-      console.error(accessResult.error);
-      setAccess(null);
-    } else {
-      setAccess(accessResult.data?.[0] ?? null);
-    }
-
-    setLoading(false);
+    try {
+      const [profileResult, accessResult] = await Promise.all([
+        supabase.rpc("my_profile"),
+        supabase.rpc("my_shop_access"),
+      ]);
+      if (profileResult.error) throw profileResult.error;
+      if (accessResult.error) throw accessResult.error;
+      const nextProfile = profileResult.data?.[0] ?? null;
+      const nextAccess = accessResult.data?.[0] ?? null;
+      setProfile(nextProfile); setAccess(nextAccess); setOfflineAuth(false);
+      if (nextProfile && nextAccess) writeCache(nextProfile, nextAccess);
+    } catch (error) {
+      const fallback = readCache();
+      if (!navigator.onLine && fallback?.profile && fallback?.access) {
+        setProfile(fallback.profile); setAccess(fallback.access); setOfflineAuth(true);
+      } else {
+        console.error(error); setProfile(null); setAccess(null); setOfflineAuth(false);
+      }
+    } finally { setLoading(false); }
   }
 
   async function refreshAccess() {
     if (!session) return;
-    setLoading(true);
-    await loadUserState(session);
+    setLoading(true); await loadUserState(session);
   }
 
   useEffect(() => {
     let mounted = true;
-
-    supabase.auth.getSession().then(({ data }) => {
-      if (mounted) loadUserState(data.session);
-    });
-
-    const { data: listener } = supabase.auth.onAuthStateChange(
-      (_event, nextSession) => loadUserState(nextSession)
-    );
-
-    return () => {
-      mounted = false;
-      listener.subscription.unsubscribe();
-    };
+    supabase.auth.getSession().then(({ data }) => { if (mounted) loadUserState(data.session); });
+    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => loadUserState(nextSession));
+    return () => { mounted = false; listener.subscription.unsubscribe(); };
   }, []);
 
-  async function signIn(email, password) {
-    return supabase.auth.signInWithPassword({ email, password });
-  }
-
-  async function signOut() {
-    await supabase.auth.signOut();
-  }
+  async function signIn(email, password) { return supabase.auth.signInWithPassword({ email, password }); }
+  async function signOut() { localStorage.removeItem(CACHE_KEY); await supabase.auth.signOut(); }
 
   return (
-    <AuthContext.Provider
-      value={{
-        session,
-        user: session?.user ?? null,
-        profile,
-        access,
-        loading,
-        signIn,
-        signOut,
-        refreshAccess,
-      }}
-    >
+    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, access, loading, offlineAuth, signIn, signOut, refreshAccess }}>
       {children}
     </AuthContext.Provider>
   );
diff --git a/src/context/ScannerContext.jsx b/src/context/ScannerContext.jsx
new file mode 100644
index 0000000..bf53594
--- /dev/null
+++ b/src/context/ScannerContext.jsx
@@ -0,0 +1,170 @@
+import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
+
+const ScannerContext = createContext(null);
+const SETTINGS_KEY = "wineshop_scanner_settings_v1";
+
+const defaults = {
+  enabled: true,
+  minLength: 6,
+  maxAverageGapMs: 55,
+  resetGapMs: 160,
+  successFrequency: 1046,
+  errorFrequency: 220,
+};
+
+function loadSettings() {
+  try {
+    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
+  } catch {
+    return defaults;
+  }
+}
+
+function isEditable(el) {
+  if (!el) return false;
+  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
+}
+
+function snapshotEditable(el) {
+  if (!isEditable(el)) return null;
+  return {
+    element: el,
+    value: "value" in el ? el.value : el.textContent,
+    start: typeof el.selectionStart === "number" ? el.selectionStart : null,
+    end: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
+  };
+}
+
+function restoreEditable(snapshot) {
+  if (!snapshot?.element?.isConnected) return;
+  const el = snapshot.element;
+  if ("value" in el) {
+    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set;
+    if (setter) setter.call(el, snapshot.value);
+    else el.value = snapshot.value;
+    el.dispatchEvent(new Event("input", { bubbles: true }));
+  } else {
+    el.textContent = snapshot.value;
+    el.dispatchEvent(new Event("input", { bubbles: true }));
+  }
+  try {
+    if (snapshot.start !== null) el.setSelectionRange(snapshot.start, snapshot.end);
+  } catch {}
+}
+
+function tone(frequency, duration = 90, volume = 0.08) {
+  try {
+    const AudioCtx = window.AudioContext || window.webkitAudioContext;
+    if (!AudioCtx) return;
+    const ctx = new AudioCtx();
+    const osc = ctx.createOscillator();
+    const gain = ctx.createGain();
+    osc.frequency.value = frequency;
+    gain.gain.value = volume;
+    osc.connect(gain);
+    gain.connect(ctx.destination);
+    osc.start();
+    setTimeout(() => {
+      osc.stop();
+      ctx.close();
+    }, duration);
+  } catch {}
+}
+
+export function ScannerProvider({ children }) {
+  const [settings, setSettingsState] = useState(loadSettings);
+  const [lastScan, setLastScan] = useState(null);
+  const buffer = useRef([]);
+  const times = useRef([]);
+  const initialFocusSnapshot = useRef(null);
+  const lastKeyAt = useRef(0);
+
+  function saveSettings(next) {
+    const merged = { ...settings, ...next };
+    setSettingsState(merged);
+    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
+  }
+
+  function successBeep() {
+    tone(settings.successFrequency, 80, 0.06);
+  }
+
+  function errorBeep() {
+    tone(settings.errorFrequency, 180, 0.1);
+  }
+
+  useEffect(() => {
+    function reset() {
+      buffer.current = [];
+      times.current = [];
+      initialFocusSnapshot.current = null;
+      lastKeyAt.current = 0;
+    }
+
+    function onKeyDown(event) {
+      if (!settings.enabled || event.ctrlKey || event.altKey || event.metaKey) return;
+      const now = performance.now();
+      const gap = lastKeyAt.current ? now - lastKeyAt.current : 0;
+
+      if (lastKeyAt.current && gap > settings.resetGapMs) reset();
+
+      if (event.key === "Enter") {
+        if (!buffer.current.length) return;
+        const chars = buffer.current.join("");
+        const gaps = times.current.slice(1).map((t, i) => t - times.current[i]);
+        const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 999;
+        const scannerLike = chars.length >= settings.minLength && avgGap <= settings.maxAverageGapMs;
+
+        if (scannerLike) {
+          event.preventDefault();
+          event.stopPropagation();
+          restoreEditable(initialFocusSnapshot.current);
+          setLastScan({
+            id: crypto.randomUUID(),
+            barcode: chars,
+            at: new Date().toISOString(),
+            averageGapMs: Math.round(avgGap),
+            length: chars.length,
+          });
+          requestAnimationFrame(() => initialFocusSnapshot.current?.element?.focus?.());
+        }
+        reset();
+        return;
+      }
+
+      if (event.key.length !== 1) return;
+
+      if (!buffer.current.length) initialFocusSnapshot.current = snapshotEditable(document.activeElement);
+      buffer.current.push(event.key);
+      times.current.push(now);
+      lastKeyAt.current = now;
+
+      // Once a rapid sequence is confidently scanner-like, block subsequent characters.
+      // The first few characters are restored on Enter from the saved field snapshot.
+      if (buffer.current.length >= 4) {
+        const recent = times.current.slice(-4);
+        const recentAvg = (recent[3] - recent[0]) / 3;
+        if (recentAvg <= settings.maxAverageGapMs) {
+          event.preventDefault();
+          event.stopPropagation();
+        }
+      }
+    }
+
+    window.addEventListener("keydown", onKeyDown, true);
+    return () => window.removeEventListener("keydown", onKeyDown, true);
+  }, [settings]);
+
+  const value = useMemo(
+    () => ({ settings, saveSettings, lastScan, successBeep, errorBeep }),
+    [settings, lastScan]
+  );
+
+  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
+}
+
+export function useScanner() {
+  const value = useContext(ScannerContext);
+  if (!value) throw new Error("useScanner must be inside ScannerProvider");
+  return value;
+}
diff --git a/src/context/ShopContext.jsx b/src/context/ShopContext.jsx
index 5ee90a3..f1efce5 100644
--- a/src/context/ShopContext.jsx
+++ b/src/context/ShopContext.jsx
@@ -1,602 +1,179 @@
-import {
-  createContext,
-  useCallback,
-  useContext,
-  useEffect,
-  useMemo,
-  useState,
-} from "react";
+import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
 import { supabase } from "../lib/supabase";
 import { useAuth } from "./AuthContext";
+import { listOfflineSales, queueOfflineSale, removeOfflineSale, setOfflineSaleStatus } from "../lib/offlineQueue";
 
 const ShopContext = createContext(null);
+const DATA_CACHE_KEY = "wineshop_cloud_cache_v2";
 
-function moneyNumber(value) {
-  const n = Number(value ?? 0);
-  return Number.isFinite(n) ? n : 0;
-}
+const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
 
 function normalizeProduct(row) {
   return {
-    id: row.id,
-    barcode: row.barcode ?? "",
-    sku: row.sku ?? "",
-    name: row.product_name ?? "",
-    brand: row.brand ?? "",
-    category: row.categories?.name ?? "",
-    categoryId: row.category_id ?? null,
-    subcategory: row.subcategory ?? "",
-    sizeMl: Number(row.size_ml ?? 0),
-    size: `${Number(row.size_ml ?? 0)} ml`,
-    alcoholPercentage:
-      row.alcohol_percentage === null ? null : Number(row.alcohol_percentage),
-    purchasePrice: moneyNumber(row.purchase_price),
-    mrp: moneyNumber(row.mrp),
-    price: moneyNumber(row.selling_price),
-    minimumStock: Number(row.minimum_stock ?? 0),
-    unitsPerCase: Number(row.units_per_case ?? 1),
-    active: row.active !== false,
-    createdAt: row.created_at,
-    updatedAt: row.updated_at,
+    id: row.id, barcode: row.barcode ?? "", sku: row.sku ?? "", name: row.product_name ?? "",
+    brand: row.brand ?? "", category: row.category_name ?? row.categories?.name ?? "", categoryId: row.category_id ?? null,
+    subcategory: row.subcategory ?? "", sizeMl: num(row.size_ml), size: `${num(row.size_ml)} ml`,
+    alcoholPercentage: row.alcohol_percentage == null ? null : num(row.alcohol_percentage),
+    purchasePrice: row.purchase_price == null ? 0 : num(row.purchase_price), mrp: num(row.mrp), price: num(row.selling_price),
+    minimumStock: num(row.minimum_stock), unitsPerCase: num(row.units_per_case) || 1, active: row.active !== false,
+    createdAt: row.created_at, updatedAt: row.updated_at,
   };
 }
 
 function normalizeSale(row, productById) {
-  const payment = row.payments?.[0] ?? null;
-
+  const payment = (row.payments || []).find((p) => p.payment_type !== "REFUND") || row.payments?.[0] || null;
   return {
-    id: row.id,
-    invoiceNumber: row.invoice_number,
-    createdAt: row.created_at,
-    cashierId: row.cashier_id,
-    paymentMethod: payment?.payment_method ?? "",
-    paymentReference: payment?.reference_number ?? "",
-    subtotal: moneyNumber(row.subtotal),
-    discount: moneyNumber(row.discount),
-    grandTotal: moneyNumber(row.grand_total),
-    status: row.status,
-    items: (row.sale_items ?? []).map((item) => ({
-      id: item.id,
-      productId: item.product_id,
-      productName: item.product_name_snapshot,
-      barcode: item.barcode_snapshot,
-      quantity: Number(item.quantity ?? 0),
-      unitPrice: moneyNumber(item.unit_price),
-      purchasePrice: moneyNumber(productById[item.product_id]?.purchasePrice),
-      lineTotal: moneyNumber(item.line_total),
-    })),
+    id: row.id, invoiceNumber: row.invoice_number, createdAt: row.created_at, cashierId: row.cashier_id,
+    shiftId: row.shift_id, clientSaleId: row.client_sale_id, offlineCreatedAt: row.offline_created_at,
+    paymentMethod: payment?.payment_method ?? "", paymentReference: payment?.reference_number ?? "",
+    subtotal: num(row.subtotal), discount: num(row.discount), grandTotal: num(row.grand_total), status: row.status,
+    items: (row.sale_items || []).map((item) => ({ id: item.id, productId: item.product_id,
+      productName: item.product_name_snapshot, barcode: item.barcode_snapshot, quantity: num(item.quantity),
+      unitPrice: num(item.unit_price), purchasePrice: num(productById[item.product_id]?.purchasePrice), lineTotal: num(item.line_total) })),
   };
 }
 
 function normalizePurchase(row, productById) {
-  const items = (row.purchase_items ?? []).map((item) => ({
-    id: item.id,
-    productId: item.product_id,
-    productName: productById[item.product_id]?.name ?? "Product",
-    barcode: productById[item.product_id]?.barcode ?? "",
-    purchaseUnit: item.purchase_unit,
-    caseCount: Number(item.case_count ?? 0),
-    unitsPerCase: Number(item.units_per_case ?? 1),
-    looseBottles: Number(item.loose_bottles ?? 0),
-    quantity: Number(item.quantity ?? 0),
-    purchasePrice: moneyNumber(item.purchase_price),
-    lineTotal: moneyNumber(item.line_total),
-  }));
-
-  return {
-    id: row.id,
-    purchaseNumber: row.purchase_number,
-    supplierId: row.supplier_id,
-    supplierName: row.supplier_name_snapshot ?? "Supplier",
-    invoiceNumber: row.invoice_number,
-    invoiceDate: row.invoice_date,
-    createdAt: row.created_at,
-    notes: row.notes ?? "",
-    total: moneyNumber(row.total),
-    totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
-    items,
-  };
+  const items = (row.purchase_items || []).map((item) => ({ id: item.id, productId: item.product_id,
+    productName: productById[item.product_id]?.name ?? "Product", barcode: productById[item.product_id]?.barcode ?? "",
+    purchaseUnit: item.purchase_unit, caseCount: num(item.case_count), unitsPerCase: num(item.units_per_case) || 1,
+    looseBottles: num(item.loose_bottles), quantity: num(item.quantity), purchasePrice: num(item.purchase_price), lineTotal: num(item.line_total) }));
+  return { id: row.id, purchaseNumber: row.purchase_number, supplierId: row.supplier_id,
+    supplierName: row.supplier_name_snapshot ?? "Supplier", invoiceNumber: row.invoice_number,
+    invoiceDate: row.invoice_date, createdAt: row.created_at, notes: row.notes ?? "", total: num(row.total),
+    totalUnits: items.reduce((s, i) => s + i.quantity, 0), items };
 }
 
+function readCache() { try { return JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || "null"); } catch { return null; } }
+function writeCache(data) { try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ ...data, cachedAt: new Date().toISOString() })); } catch {} }
+
 export function ShopProvider({ children }) {
   const { user, profile, access } = useAuth();
-
-  const [products, setProducts] = useState([]);
-  const [inventory, setInventory] = useState({});
-  const [sales, setSales] = useState([]);
-  const [purchases, setPurchases] = useState([]);
-  const [categories, setCategories] = useState([]);
-  const [suppliers, setSuppliers] = useState([]);
+  const cached = readCache();
+  const [products, setProducts] = useState(cached?.products || []);
+  const [inventory, setInventory] = useState(cached?.inventory || {});
+  const [sales, setSales] = useState(cached?.sales || []);
+  const [purchases, setPurchases] = useState(cached?.purchases || []);
+  const [categories, setCategories] = useState(cached?.categories || []);
+  const [suppliers, setSuppliers] = useState(cached?.suppliers || []);
   const [loadingData, setLoadingData] = useState(false);
   const [dataError, setDataError] = useState("");
-
   const canUseShop = Boolean(user && profile?.active && access?.allowed);
 
   const refreshAll = useCallback(async () => {
-    if (!canUseShop) {
-      setProducts([]);
-      setInventory({});
-      setSales([]);
-      setPurchases([]);
-      setCategories([]);
-      setSuppliers([]);
-      return { ok: false, message: "Shop session is not active." };
+    if (!canUseShop) return { ok: false, message: "Shop session is not active." };
+    if (!navigator.onLine) {
+      const c = readCache();
+      if (c) { setProducts(c.products || []); setInventory(c.inventory || {}); setSales(c.sales || []); setPurchases(c.purchases || []); setCategories(c.categories || []); setSuppliers(c.suppliers || []); }
+      return { ok: Boolean(c), offline: true, message: c ? "Using cached offline data." : "No cached shop data." };
     }
-
-    setLoadingData(true);
-    setDataError("");
-
+    setLoadingData(true); setDataError("");
     try {
-      const [
-        categoriesResult,
-        suppliersResult,
-        productsResult,
-        inventoryResult,
-      ] = await Promise.all([
-        supabase
-          .from("categories")
-          .select("id,name,active")
-          .order("name"),
-        supabase
-          .from("suppliers")
-          .select("id,supplier_name,active")
-          .order("supplier_name"),
-        supabase
-          .from("products")
-          .select("*, categories(name)")
-          .order("product_name"),
-        supabase
-          .from("inventory")
-          .select("product_id,quantity,reserved_quantity"),
+      const [categoriesResult, suppliersResult, productsResult, inventoryResult] = await Promise.all([
+        supabase.from("categories").select("id,name,active").order("name"),
+        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("suppliers").select("id,supplier_name,active").order("supplier_name"),
+        supabase.rpc("get_products"),
+        supabase.from("inventory").select("product_id,quantity,reserved_quantity"),
       ]);
-
-      for (const result of [
-        categoriesResult,
-        suppliersResult,
-        productsResult,
-        inventoryResult,
-      ]) {
-        if (result.error) throw result.error;
-      }
-
-      const normalizedProducts = (productsResult.data ?? []).map(normalizeProduct);
-      const productById = Object.fromEntries(
-        normalizedProducts.map((product) => [product.id, product])
-      );
-
-      const stockMap = {};
-      for (const row of inventoryResult.data ?? []) {
-        stockMap[row.product_id] = Number(row.quantity ?? 0);
-      }
-
-      let salesQuery = supabase
-        .from("sales")
-        .select(`
-          id, invoice_number, subtotal, discount, grand_total,
-          payment_status, cashier_id, status, notes, created_at,
-          sale_items(
-            id, product_id, product_name_snapshot, barcode_snapshot,
-            quantity, unit_price, discount, line_total
-          ),
-          payments(
-            id, payment_method, amount, reference_number, created_at
-          )
-        `)
-        .order("created_at", { ascending: false })
-        .limit(1000);
-
-      if (profile?.role === "CASHIER") {
-        salesQuery = salesQuery.eq("cashier_id", profile.user_id);
-      }
-
+      for (const r of [categoriesResult, suppliersResult, productsResult, inventoryResult]) if (r.error) throw r.error;
+      const normalizedProducts = (productsResult.data || []).map(normalizeProduct);
+      const productById = Object.fromEntries(normalizedProducts.map((p) => [p.id, p]));
+      const stockMap = Object.fromEntries((inventoryResult.data || []).map((r) => [r.product_id, num(r.quantity)]));
+      let salesQuery = supabase.from("sales").select(`id,invoice_number,subtotal,discount,grand_total,payment_status,cashier_id,status,notes,created_at,shift_id,client_sale_id,offline_created_at,sale_items(id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total),payments(id,payment_method,amount,reference_number,payment_type,created_at)`).order("created_at", { ascending: false }).limit(1000);
+      if (profile?.role === "CASHIER") salesQuery = salesQuery.eq("cashier_id", profile.user_id);
       const [salesResult, purchasesResult] = await Promise.all([
         salesQuery,
-        profile?.role === "CASHIER"
-          ? Promise.resolve({ data: [], error: null })
-          : supabase
-              .from("purchases")
-              .select(`
-                id, purchase_number, supplier_id, supplier_name_snapshot,
-                invoice_number, invoice_date, subtotal, tax, total,
-                status, notes, created_at,
-                purchase_items(
-                  id, product_id, quantity, purchase_unit,
-                  case_count, units_per_case, loose_bottles,
-                  purchase_price, line_total
-                )
-              `)
-              .order("created_at", { ascending: false })
-              .limit(1000),
+        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("purchases").select(`id,purchase_number,supplier_id,supplier_name_snapshot,invoice_number,invoice_date,subtotal,tax,total,status,notes,created_at,purchase_items(id,product_id,quantity,purchase_unit,case_count,units_per_case,loose_bottles,purchase_price,line_total)`).order("created_at", { ascending: false }).limit(1000),
       ]);
-
-      if (salesResult.error) throw salesResult.error;
-      if (purchasesResult.error) throw purchasesResult.error;
-
-      setCategories(categoriesResult.data ?? []);
-      setSuppliers(suppliersResult.data ?? []);
-      setProducts(normalizedProducts);
-      setInventory(stockMap);
-      setSales(
-        (salesResult.data ?? []).map((row) => normalizeSale(row, productById))
-      );
-      setPurchases(
-        (purchasesResult.data ?? []).map((row) =>
-          normalizePurchase(row, productById)
-        )
-      );
-
+      if (salesResult.error) throw salesResult.error; if (purchasesResult.error) throw purchasesResult.error;
+      const nextSales = (salesResult.data || []).map((r) => normalizeSale(r, productById));
+      const nextPurchases = (purchasesResult.data || []).map((r) => normalizePurchase(r, productById));
+      setCategories(categoriesResult.data || []); setSuppliers(suppliersResult.data || []); setProducts(normalizedProducts);
+      setInventory(stockMap); setSales(nextSales); setPurchases(nextPurchases);
+      writeCache({ products: normalizedProducts, inventory: stockMap, sales: nextSales, purchases: nextPurchases, categories: categoriesResult.data || [], suppliers: suppliersResult.data || [] });
       return { ok: true };
     } catch (error) {
-      const message = error?.message || String(error);
-      setDataError(message);
+      const message = error?.message || String(error); setDataError(message);
+      const c = readCache();
+      if (!navigator.onLine && c) return { ok: true, offline: true, message: "Using cached shop data." };
       return { ok: false, message };
-    } finally {
-      setLoadingData(false);
-    }
+    } finally { setLoadingData(false); }
   }, [canUseShop, profile?.role, profile?.user_id]);
 
-  useEffect(() => {
-    refreshAll();
-  }, [refreshAll]);
+  useEffect(() => { refreshAll(); }, [refreshAll]);
+  useEffect(() => { const fn = () => refreshAll(); window.addEventListener("online", fn); return () => window.removeEventListener("online", fn); }, [refreshAll]);
 
-  function getStock(productId) {
-    return Number(inventory[productId] ?? 0);
-  }
+  const getStock = (id) => num(inventory[id]);
 
   async function ensureCategory(name) {
-    const categoryName = String(name ?? "").trim();
-    if (!categoryName) return null;
-
-    const existing = categories.find(
-      (item) => item.name.toLowerCase() === categoryName.toLowerCase()
-    );
-    if (existing) return existing.id;
-
-    const { data, error } = await supabase
-      .from("categories")
-      .insert({
-        shop_id: profile.shop_id,
-        name: categoryName,
-        active: true,
-      })
-      .select("id,name,active")
-      .single();
-
-    if (error) throw error;
-    setCategories((current) => [...current, data].sort((a, b) =>
-      a.name.localeCompare(b.name)
-    ));
-    return data.id;
-  }
-
-  function validateProduct(data, includeOpeningStock = false) {
-    const value = {
-      barcode: String(data.barcode ?? "").trim(),
-      sku: String(data.sku ?? "").trim().toUpperCase(),
-      name: String(data.name ?? "").trim(),
-      brand: String(data.brand ?? "").trim(),
-      category: String(data.category ?? "").trim(),
-      subcategory: String(data.subcategory ?? "").trim(),
-      sizeMl: Number(data.sizeMl),
-      alcoholPercentage:
-        data.alcoholPercentage === "" ||
-        data.alcoholPercentage === null ||
-        data.alcoholPercentage === undefined
-          ? null
-          : Number(data.alcoholPercentage),
-      purchasePrice: Number(data.purchasePrice),
-      mrp: Number(data.mrp),
-      price: Number(data.price),
-      minimumStock: Number(data.minimumStock),
-      unitsPerCase: Number(data.unitsPerCase),
-      openingStock: includeOpeningStock ? Number(data.openingStock ?? 0) : 0,
-    };
-
-    if (!value.barcode) return { ok: false, message: "Barcode is required." };
-    if (!value.sku) return { ok: false, message: "SKU is required." };
-    if (!value.name) return { ok: false, message: "Product name is required." };
-    if (!value.brand) return { ok: false, message: "Brand is required." };
-    if (!value.category) return { ok: false, message: "Category is required." };
-    if (!Number.isInteger(value.sizeMl) || value.sizeMl <= 0) {
-      return { ok: false, message: "Bottle size is invalid." };
-    }
-    if (!Number.isFinite(value.purchasePrice) || value.purchasePrice < 0) {
-      return { ok: false, message: "Purchase price is invalid." };
-    }
-    if (!Number.isFinite(value.mrp) || value.mrp < 0) {
-      return { ok: false, message: "MRP is invalid." };
-    }
-    if (!Number.isFinite(value.price) || value.price < 0) {
-      return { ok: false, message: "Selling price is invalid." };
-    }
-    if (!Number.isInteger(value.minimumStock) || value.minimumStock < 0) {
-      return { ok: false, message: "Minimum stock is invalid." };
-    }
-    if (!Number.isInteger(value.unitsPerCase) || value.unitsPerCase <= 0) {
-      return { ok: false, message: "Bottles per case is invalid." };
-    }
-    if (
-      includeOpeningStock &&
-      (!Number.isInteger(value.openingStock) || value.openingStock < 0)
-    ) {
-      return { ok: false, message: "Opening stock is invalid." };
-    }
-    return { ok: true, value };
-  }
-
-  async function addProduct(productData) {
-    try {
-      const validation = validateProduct(productData, true);
-      if (!validation.ok) return validation;
-
-      const v = validation.value;
-      const categoryId = await ensureCategory(v.category);
-
-      const { data, error } = await supabase.rpc("create_new_product", {
-        p_barcode: v.barcode,
-        p_sku: v.sku,
-        p_product_name: v.name,
-        p_brand: v.brand,
-        p_category_id: categoryId,
-        p_subcategory: v.subcategory || null,
-        p_size_ml: v.sizeMl,
-        p_alcohol_percentage: v.alcoholPercentage,
-        p_purchase_price: v.purchasePrice,
-        p_mrp: v.mrp,
-        p_selling_price: v.price,
-        p_minimum_stock: v.minimumStock,
-        p_units_per_case: v.unitsPerCase,
-        p_opening_stock: v.openingStock,
-      });
-
-      if (error) throw error;
-      await refreshAll();
-
-      return {
-        ok: true,
-        productId: data,
-        message: `${v.name} created successfully.`,
-      };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
-    }
+    const categoryName = String(name || "").trim(); if (!categoryName) return null;
+    const existing = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()); if (existing) return existing.id;
+    const { data, error } = await supabase.from("categories").insert({ shop_id: profile.shop_id, name: categoryName, active: true }).select("id,name,active").single();
+    if (error) throw error; setCategories((c) => [...c, data]); return data.id;
   }
 
-  async function updateProduct(productId, productData) {
-    try {
-      const validation = validateProduct(productData, false);
-      if (!validation.ok) return validation;
-
-      const v = validation.value;
-      const categoryId = await ensureCategory(v.category);
-
-      const { error } = await supabase
-        .from("products")
-        .update({
-          barcode: v.barcode,
-          sku: v.sku,
-          product_name: v.name,
-          brand: v.brand,
-          category_id: categoryId,
-          subcategory: v.subcategory || null,
-          size_ml: v.sizeMl,
-          alcohol_percentage: v.alcoholPercentage,
-          purchase_price: v.purchasePrice,
-          mrp: v.mrp,
-          selling_price: v.price,
-          minimum_stock: v.minimumStock,
-          units_per_case: v.unitsPerCase,
-        })
-        .eq("id", productId);
-
-      if (error) throw error;
-      await refreshAll();
-      return { ok: true, message: `${v.name} updated successfully.` };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
-    }
+  function validateProduct(d, opening = false) {
+    const v = { barcode:String(d.barcode||"").trim(),sku:String(d.sku||"").trim().toUpperCase(),name:String(d.name||"").trim(),brand:String(d.brand||"").trim(),category:String(d.category||"").trim(),subcategory:String(d.subcategory||"").trim(),sizeMl:Number(d.sizeMl),alcoholPercentage:d.alcoholPercentage===""?null:Number(d.alcoholPercentage),purchasePrice:Number(d.purchasePrice),mrp:Number(d.mrp),price:Number(d.price),minimumStock:Number(d.minimumStock),unitsPerCase:Number(d.unitsPerCase),openingStock:opening?Number(d.openingStock||0):0 };
+    for (const [key,label] of [["barcode","Barcode"],["sku","SKU"],["name","Product name"],["brand","Brand"],["category","Category"]]) if (!v[key]) return { ok:false,message:`${label} is required.` };
+    if (!Number.isInteger(v.sizeMl)||v.sizeMl<=0) return {ok:false,message:"Bottle size is invalid."};
+    if (![v.purchasePrice,v.mrp,v.price].every((x)=>Number.isFinite(x)&&x>=0)) return {ok:false,message:"Price values are invalid."};
+    if (!Number.isInteger(v.minimumStock)||v.minimumStock<0||!Number.isInteger(v.unitsPerCase)||v.unitsPerCase<=0) return {ok:false,message:"Stock settings are invalid."};
+    if (opening&&(!Number.isInteger(v.openingStock)||v.openingStock<0)) return {ok:false,message:"Opening stock is invalid."};
+    return {ok:true,value:v};
   }
 
-  async function setProductStatus(productId, active) {
-    try {
-      const { error } = await supabase
-        .from("products")
-        .update({ active })
-        .eq("id", productId);
-
-      if (error) throw error;
-      await refreshAll();
-      return {
-        ok: true,
-        message: active ? "Product activated." : "Product deactivated.",
-      };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
-    }
-  }
-
-  async function deactivateProduct(productId) {
-    return setProductStatus(productId, false);
+  async function addProduct(data) {
+    try { const check=validateProduct(data,true); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
+      const {data:id,error}=await supabase.rpc("create_new_product",{p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||null,p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase,p_opening_stock:v.openingStock});
+      if(error)throw error; await refreshAll(); return {ok:true,productId:id,message:`${v.name} created successfully.`};
+    } catch(e){return {ok:false,message:e.message||String(e)}}
   }
 
-  async function activateProduct(productId) {
-    return setProductStatus(productId, true);
+  async function updateProduct(id,data) {
+    try { const check=validateProduct(data,false); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
+      const {error}=await supabase.rpc("update_product_details",{p_product_id:id,p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||"",p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase});
+      if(error)throw error;await refreshAll();return {ok:true,message:`${v.name} updated successfully.`};
+    }catch(e){return {ok:false,message:e.message||String(e)}}
   }
-
-  async function completeSale(
-    cart,
-    paymentMethod,
-    { discount = 0, paymentReference = "" } = {}
-  ) {
-    try {
-      if (!cart?.length) return { ok: false, message: "Cart is empty." };
-
-      const { data, error } = await supabase.rpc("complete_sale", {
-        p_items: cart.map((item) => ({
-          product_id: item.product.id,
-          quantity: Number(item.quantity),
-        })),
-        p_payment_method: paymentMethod,
-        p_discount: Number(discount || 0),
-        p_payment_reference: String(paymentReference ?? "").trim() || null,
-      });
-
-      if (error) throw error;
-      await refreshAll();
-
-      const sale = sales.find((item) => item.id === data) ?? { id: data };
-      return { ok: true, sale: { ...sale, id: data } };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
+  async function setProductStatus(id,active){try{const {error}=await supabase.rpc("set_product_active",{p_product_id:id,p_active:active});if(error)throw error;await refreshAll();return{ok:true,message:active?"Product activated.":"Product deactivated."}}catch(e){return{ok:false,message:e.message||String(e)}}}
+  const deactivateProduct=(id)=>setProductStatus(id,false); const activateProduct=(id)=>setProductStatus(id,true);
+
+  async function completeSale(cart,paymentMethod,{discount=0,paymentReference=""}={}) {
+    const clientSaleId=crypto.randomUUID();
+    const payload={clientSaleId,offlineCreatedAt:new Date().toISOString(),items:cart.map((i)=>({product_id:i.product.id,quantity:Number(i.quantity)})),paymentMethod,discount:Number(discount||0),paymentReference:String(paymentReference||"").trim()||null,cartSnapshot:cart.map((i)=>({product:{id:i.product.id,name:i.product.name,barcode:i.product.barcode,price:i.product.price},quantity:Number(i.quantity)}))};
+    if (!navigator.onLine) {
+      try {
+        await queueOfflineSale(payload);
+        setInventory((current)=>{const next={...current};for(const item of cart)next[item.product.id]=Math.max(0,num(next[item.product.id])-Number(item.quantity));return next;});
+        const offlineSale={id:`offline-${clientSaleId}`,invoiceNumber:`OFFLINE-${clientSaleId.slice(0,8).toUpperCase()}`,createdAt:payload.offlineCreatedAt,paymentMethod,paymentReference,subtotal:cart.reduce((s,i)=>s+i.product.price*i.quantity,0),discount:Number(discount||0),grandTotal:Math.max(0,cart.reduce((s,i)=>s+i.product.price*i.quantity,0)-Number(discount||0)),status:"OFFLINE_PENDING",items:cart.map((i)=>({productId:i.product.id,productName:i.product.name,barcode:i.product.barcode,quantity:i.quantity,unitPrice:i.product.price,lineTotal:i.product.price*i.quantity}))};
+        setSales((s)=>[offlineSale,...s]); return {ok:true,offline:true,sale:offlineSale,message:"Sale saved securely offline. Sync when internet returns."};
+      } catch(e){return{ok:false,message:e.message||String(e)}}
     }
-  }
-
-  async function ensureSupplier(supplierName) {
-    const name = String(supplierName ?? "").trim();
-    if (!name) throw new Error("Supplier name is required.");
-
-    const existing = suppliers.find(
-      (item) => item.supplier_name.toLowerCase() === name.toLowerCase()
-    );
-
-    if (existing) return existing.id;
-
-    const { data, error } = await supabase
-      .from("suppliers")
-      .insert({
-        shop_id: profile.shop_id,
-        supplier_name: name,
-        active: true,
-      })
-      .select("id,supplier_name,active")
-      .single();
-
-    if (error) throw error;
-    setSuppliers((current) => [...current, data]);
-    return data.id;
-  }
-
-  async function receiveStock({
-    supplierName,
-    invoiceNumber,
-    invoiceDate,
-    items,
-    notes = "",
-  }) {
     try {
-      if (!items?.length) {
-        return { ok: false, message: "Add at least one product." };
-      }
-
-      const supplierId = await ensureSupplier(supplierName);
-
-      const payloadItems = items.map((item) => ({
-        product_id: item.productId,
-        case_count: Number(item.caseCount ?? 0),
-        units_per_case: Number(item.unitsPerCase ?? 1),
-        loose_bottles: Number(item.looseBottles ?? 0),
-        quantity: Number(item.quantity),
-        purchase_price: Number(item.purchasePrice),
-      }));
-
-      const { data, error } = await supabase.rpc("receive_purchase", {
-        p_supplier_id: supplierId,
-        p_invoice_number: String(invoiceNumber ?? "").trim(),
-        p_invoice_date:
-          invoiceDate || new Date().toISOString().slice(0, 10),
-        p_items: payloadItems,
-        p_notes: notes || null,
-      });
-
-      if (error) throw error;
-      await refreshAll();
-
-      return {
-        ok: true,
-        purchaseId: data,
-        message: "Stock received successfully.",
-      };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
-    }
+      const {data,error}=await supabase.rpc("complete_sale_v2",{p_items:payload.items,p_payment_method:paymentMethod,p_discount:Number(discount||0),p_payment_reference:paymentReference||null,p_client_sale_id:clientSaleId,p_offline_created_at:null});
+      if(error)throw error;await refreshAll();return{ok:true,sale:{id:data}};
+    }catch(e){return{ok:false,message:e.message||String(e)}}
   }
 
-  async function adjustStock({
-    productId,
-    adjustmentType,
-    quantityChange,
-    reason,
-    notes = "",
-  }) {
-    try {
-      const { data, error } = await supabase.rpc("adjust_stock", {
-        p_product_id: productId,
-        p_adjustment_type: adjustmentType,
-        p_quantity_change: Number(quantityChange),
-        p_reason: String(reason ?? "").trim(),
-        p_notes: notes || null,
-      });
-
-      if (error) throw error;
-      await refreshAll();
-      return { ok: true, quantity: data, message: "Stock adjusted." };
-    } catch (error) {
-      return { ok: false, message: error?.message || String(error) };
+  async function syncOfflineSales() {
+    if (!navigator.onLine) return {ok:false,message:"Internet is offline."};
+    const rows=await listOfflineSales(); let synced=0,conflicts=0;
+    for(const row of rows.filter((r)=>r.status==="PENDING"||r.status==="CONFLICT")){
+      if(!row.payload){await setOfflineSaleStatus(row.id,"CONFLICT","Unable to decrypt local sale");conflicts++;continue;}
+      const p=row.payload;
+      const {error}=await supabase.rpc("sync_offline_sale",{p_client_sale_id:p.clientSaleId,p_offline_created_at:p.offlineCreatedAt,p_items:p.items,p_payment_method:p.paymentMethod,p_discount:p.discount,p_payment_reference:p.paymentReference});
+      if(error){await setOfflineSaleStatus(row.id,"CONFLICT",error.message);conflicts++;}else{await removeOfflineSale(row.id);synced++;}
     }
+    await refreshAll();return{ok:conflicts===0,synced,conflicts,message:`Synced ${synced}; conflicts ${conflicts}.`};
   }
 
-  function createBackup() {
-    return {
-      meta: {
-        app: "WineShopPOS",
-        mode: "SUPABASE_CLOUD",
-        exportedAt: new Date().toISOString(),
-      },
-      data: { products, inventory, sales, purchases },
-    };
-  }
+  async function ensureSupplier(name){const n=String(name||"").trim();if(!n)throw new Error("Supplier name is required.");const existing=suppliers.find((s)=>s.supplier_name.toLowerCase()===n.toLowerCase());if(existing)return existing.id;const{data,error}=await supabase.from("suppliers").insert({shop_id:profile.shop_id,supplier_name:n,active:true}).select("id,supplier_name,active").single();if(error)throw error;setSuppliers((s)=>[...s,data]);return data.id;}
+  async function receiveStock({supplierName,invoiceNumber,invoiceDate,items,notes=""}){try{if(!items?.length)return{ok:false,message:"Add at least one product."};const supplierId=await ensureSupplier(supplierName);const payload=items.map((i)=>({product_id:i.productId,case_count:Number(i.caseCount||0),units_per_case:Number(i.unitsPerCase||1),loose_bottles:Number(i.looseBottles||0),quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{data,error}=await supabase.rpc("receive_purchase",{p_supplier_id:supplierId,p_invoice_number:String(invoiceNumber||"").trim(),p_invoice_date:invoiceDate||new Date().toISOString().slice(0,10),p_items:payload,p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,purchaseId:data,message:"Stock received successfully."}}catch(e){return{ok:false,message:e.message||String(e)}}}
+  async function adjustStock({productId,adjustmentType,quantityChange,reason,notes=""}){try{const{data,error}=await supabase.rpc("adjust_stock",{p_product_id:productId,p_adjustment_type:adjustmentType,p_quantity_change:Number(quantityChange),p_reason:String(reason||"").trim(),p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,quantity:data,message:"Stock adjusted."}}catch(e){return{ok:false,message:e.message||String(e)}}}
+  function createBackup(){return{meta:{app:"WineShopPOS",mode:"SUPABASE_CLOUD",exportedAt:new Date().toISOString()},data:{products,inventory,sales,purchases}}}
+  const lowStockProducts=useMemo(()=>products.filter((p)=>p.active&&getStock(p.id)<=p.minimumStock),[products,inventory]);
 
-  const lowStockProducts = useMemo(
-    () =>
-      products.filter(
-        (product) =>
-          product.active !== false &&
-          getStock(product.id) <= product.minimumStock
-      ),
-    [products, inventory]
-  );
-
-  return (
-    <ShopContext.Provider
-      value={{
-        products,
-        inventory,
-        sales,
-        purchases,
-        categories,
-        suppliers,
-        loadingData,
-        dataError,
-        lowStockProducts,
-        getStock,
-        refreshAll,
-        addProduct,
-        updateProduct,
-        deactivateProduct,
-        activateProduct,
-        completeSale,
-        receiveStock,
-        adjustStock,
-        createBackup,
-      }}
-    >
-      {children}
-    </ShopContext.Provider>
-  );
+  return <ShopContext.Provider value={{products,inventory,sales,purchases,categories,suppliers,loadingData,dataError,lowStockProducts,getStock,refreshAll,addProduct,updateProduct,deactivateProduct,activateProduct,completeSale,receiveStock,adjustStock,createBackup,syncOfflineSales}}>{children}</ShopContext.Provider>;
 }
 
-export function useShop() {
-  const context = useContext(ShopContext);
-  if (!context) throw new Error("useShop must be used inside ShopProvider");
-  return context;
-}
+export function useShop(){const c=useContext(ShopContext);if(!c)throw new Error("useShop must be used inside ShopProvider");return c;}
diff --git a/src/lib/offlineQueue.js b/src/lib/offlineQueue.js
new file mode 100644
index 0000000..a1fb4bc
--- /dev/null
+++ b/src/lib/offlineQueue.js
@@ -0,0 +1,168 @@
+const DB_NAME = "wineshoppos_offline_v1";
+const DB_VERSION = 1;
+const QUEUE_STORE = "sale_queue";
+const KEY_STORE = "crypto_keys";
+const KEY_ID = "queue-aes-key";
+
+function openDb() {
+  return new Promise((resolve, reject) => {
+    const req = indexedDB.open(DB_NAME, DB_VERSION);
+    req.onupgradeneeded = () => {
+      const db = req.result;
+      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
+        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
+        store.createIndex("status", "status");
+        store.createIndex("createdAt", "createdAt");
+      }
+      if (!db.objectStoreNames.contains(KEY_STORE)) {
+        db.createObjectStore(KEY_STORE, { keyPath: "id" });
+      }
+    };
+    req.onsuccess = () => resolve(req.result);
+    req.onerror = () => reject(req.error);
+  });
+}
+
+function reqPromise(req) {
+  return new Promise((resolve, reject) => {
+    req.onsuccess = () => resolve(req.result);
+    req.onerror = () => reject(req.error);
+  });
+}
+
+async function getCryptoKey() {
+  const db = await openDb();
+  try {
+    const tx = db.transaction(KEY_STORE, "readwrite");
+    const store = tx.objectStore(KEY_STORE);
+    const existing = await reqPromise(store.get(KEY_ID));
+    if (existing?.key) return existing.key;
+
+    const key = await crypto.subtle.generateKey(
+      { name: "AES-GCM", length: 256 },
+      false,
+      ["encrypt", "decrypt"]
+    );
+    store.put({ id: KEY_ID, key });
+    return key;
+  } finally {
+    db.close();
+  }
+}
+
+function bytesToBase64(bytes) {
+  let binary = "";
+  for (const byte of bytes) binary += String.fromCharCode(byte);
+  return btoa(binary);
+}
+
+function base64ToBytes(value) {
+  const binary = atob(value);
+  const bytes = new Uint8Array(binary.length);
+  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
+  return bytes;
+}
+
+async function encryptPayload(payload) {
+  const key = await getCryptoKey();
+  const iv = crypto.getRandomValues(new Uint8Array(12));
+  const plain = new TextEncoder().encode(JSON.stringify(payload));
+  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
+  return {
+    iv: bytesToBase64(iv),
+    cipher: bytesToBase64(new Uint8Array(cipher)),
+  };
+}
+
+async function decryptPayload(record) {
+  const key = await getCryptoKey();
+  const plain = await crypto.subtle.decrypt(
+    { name: "AES-GCM", iv: base64ToBytes(record.iv) },
+    key,
+    base64ToBytes(record.cipher)
+  );
+  return JSON.parse(new TextDecoder().decode(plain));
+}
+
+export async function queueOfflineSale(payload) {
+  if (!crypto?.subtle || !indexedDB) {
+    throw new Error("Secure offline storage is not available in this browser.");
+  }
+  const encrypted = await encryptPayload(payload);
+  const db = await openDb();
+  try {
+    const tx = db.transaction(QUEUE_STORE, "readwrite");
+    tx.objectStore(QUEUE_STORE).put({
+      id: payload.clientSaleId,
+      createdAt: payload.offlineCreatedAt,
+      status: "PENDING",
+      attempts: 0,
+      lastError: null,
+      ...encrypted,
+    });
+  } finally {
+    db.close();
+  }
+  return payload.clientSaleId;
+}
+
+export async function listOfflineSales() {
+  const db = await openDb();
+  try {
+    const tx = db.transaction(QUEUE_STORE, "readonly");
+    const rows = await reqPromise(tx.objectStore(QUEUE_STORE).getAll());
+    const output = [];
+    for (const row of rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
+      try {
+        output.push({ ...row, payload: await decryptPayload(row) });
+      } catch (error) {
+        output.push({ ...row, payload: null, decryptError: error.message });
+      }
+    }
+    return output;
+  } finally {
+    db.close();
+  }
+}
+
+export async function setOfflineSaleStatus(id, status, lastError = null) {
+  const db = await openDb();
+  try {
+    const tx = db.transaction(QUEUE_STORE, "readwrite");
+    const store = tx.objectStore(QUEUE_STORE);
+    const row = await reqPromise(store.get(id));
+    if (!row) return;
+    store.put({
+      ...row,
+      status,
+      attempts: Number(row.attempts || 0) + 1,
+      lastError,
+      updatedAt: new Date().toISOString(),
+    });
+  } finally {
+    db.close();
+  }
+}
+
+export async function removeOfflineSale(id) {
+  const db = await openDb();
+  try {
+    const tx = db.transaction(QUEUE_STORE, "readwrite");
+    tx.objectStore(QUEUE_STORE).delete(id);
+  } finally {
+    db.close();
+  }
+}
+
+export async function offlineQueueCounts() {
+  const rows = await listOfflineSales();
+  return rows.reduce(
+    (acc, row) => {
+      acc.total += 1;
+      if (row.status === "PENDING") acc.pending += 1;
+      if (row.status === "CONFLICT") acc.conflict += 1;
+      return acc;
+    },
+    { total: 0, pending: 0, conflict: 0 }
+  );
+}
diff --git a/src/main.jsx b/src/main.jsx
index 0513225..3d7b055 100644
--- a/src/main.jsx
+++ b/src/main.jsx
@@ -1,20 +1,3 @@
-import { StrictMode } from "react";
-import { createRoot } from "react-dom/client";
-import { HashRouter } from "react-router-dom";
-import App from "./App";
-import { AuthProvider } from "./context/AuthContext";
-import { ShopProvider } from "./context/ShopContext";
-import "./index.css";
-import "./chapters9to12.css";
-
-createRoot(document.getElementById("root")).render(
-  <StrictMode>
-    <HashRouter>
-      <AuthProvider>
-        <ShopProvider>
-          <App />
-        </ShopProvider>
-      </AuthProvider>
-    </HashRouter>
-  </StrictMode>
-);
+import { StrictMode } from "react";import { createRoot } from "react-dom/client";import { HashRouter } from "react-router-dom";import App from "./App";import { AuthProvider } from "./context/AuthContext";import { ShopProvider } from "./context/ShopContext";import { ScannerProvider } from "./context/ScannerContext";import "./index.css";import "./chapters9to12.css";import "./chapters16to26.css";
+if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error))}
+createRoot(document.getElementById("root")).render(<StrictMode><HashRouter><AuthProvider><ScannerProvider><ShopProvider><App/></ShopProvider></ScannerProvider></AuthProvider></HashRouter></StrictMode>);
diff --git a/src/pages/AddProduct.jsx b/src/pages/AddProduct.jsx
index 53a5147..6bdb25c 100644
--- a/src/pages/AddProduct.jsx
+++ b/src/pages/AddProduct.jsx
@@ -1,21 +1,5 @@
-import { useNavigate } from "react-router-dom";
+import { useNavigate, useSearchParams } from "react-router-dom";
 import ProductForm from "../components/ProductForm";
 import { useShop } from "../context/ShopContext";
 
-export default function AddProduct() {
-  const { addProduct } = useShop();
-  const navigate = useNavigate();
-
-  async function save(form) {
-    const result = await addProduct(form);
-    if (result.ok) navigate("/products");
-    return result;
-  }
-
-  return (
-    <div>
-      <div className="page-heading"><div><h2>Add Product</h2><p>Create product directly in Supabase</p></div></div>
-      <ProductForm showOpeningStock onSubmit={save} submitLabel="Create Product" />
-    </div>
-  );
-}
+export default function AddProduct(){const{addProduct}=useShop();const navigate=useNavigate();const[params]=useSearchParams();const barcode=params.get("barcode")||"";async function save(form){const r=await addProduct(form);if(r.ok)navigate("/products");return r}return <div><div className="page-heading"><div><h2>Add Product</h2><p>{barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div></div><ProductForm key={barcode||"new"} initialValue={barcode?{barcode}:undefined} showOpeningStock onSubmit={save} submitLabel="Create Product"/></div>}
diff --git a/src/pages/Audit.jsx b/src/pages/Audit.jsx
new file mode 100644
index 0000000..7cfb47c
--- /dev/null
+++ b/src/pages/Audit.jsx
@@ -0,0 +1,4 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+
+export default function Audit(){const[rows,setRows]=useState([]);const[filter,setFilter]=useState("");const[message,setMessage]=useState("");async function load(){let q=supabase.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(500);if(filter.trim())q=q.ilike("action",`%${filter.trim()}%`);const{data,error}=await q;if(error)setMessage(error.message);else setRows(data||[])}useEffect(()=>{load()},[]);return <div><div className="page-heading"><div><h2>Owner Audit Trail</h2><p>Who changed what, when, and the before/after record where available.</p></div><button className="primary-button" onClick={load}>Refresh</button></div>{message&&<div className="purchase-message">{message}</div>}<div className="panel"><input placeholder="Filter action e.g. RETURN, SALE, UPDATE" value={filter} onChange={(e)=>setFilter(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&load()}/></div><section className="panel" style={{marginTop:16}}><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th><th>Details</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString("en-IN")}</td><td><strong>{r.action}</strong></td><td>{r.entity_type}<br/><small>{r.entity_id}</small></td><td>{r.actor_id?.slice(0,8)||"system"}</td><td><details><summary>View JSON</summary><pre className="audit-json">{JSON.stringify({old:r.old_data,new:r.new_data,meta:r.metadata},null,2)}</pre></details></td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/AutomationHub.jsx b/src/pages/AutomationHub.jsx
new file mode 100644
index 0000000..0211d1b
--- /dev/null
+++ b/src/pages/AutomationHub.jsx
@@ -0,0 +1,11 @@
+import { useState } from "react";
+import { useNavigate } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+
+export default function AutomationHub(){const{products}=useShop();const navigate=useNavigate();const[file,setFile]=useState(null);const[result,setResult]=useState(null);const[matches,setMatches]=useState({});const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
+function toBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
+async function analyze(){if(!file)return;if(file.size>4*1024*1024){setMessage("F0 OCR accepts files up to 4 MB. Compress or split this invoice first.");return}setBusy(true);setMessage("");try{const contentBase64=await toBase64(file);const{data,error}=await supabase.functions.invoke("ocr-invoice",{body:{contentBase64,contentType:file.type||"application/octet-stream"}});if(error)throw error;if(!data?.ok)throw new Error(data?.message||"OCR failed");setResult(data.invoice);const next={};for(let i=0;i<(data.invoice.items||[]).length;i++){const item=data.invoice.items[i];const{data:m}=await supabase.rpc("match_product_text",{p_text:item.description,p_supplier_id:null,p_limit:5});next[i]=m||[]}setMatches(next)}catch(e){setMessage(e.message||String(e))}finally{setBusy(false)}}
+function useDraft(){if(!result)return;const lines=(result.items||[]).map((item,i)=>{const selected=(matches[i]||[])[0];const p=products.find((x)=>x.id===selected?.product_id);return{description:item.description,productId:p?.id||"",quantity:Number(item.quantity||1),caseCount:0,unitsPerCase:p?.unitsPerCase||1,looseBottles:Number(item.quantity||1),purchasePrice:Number(item.unitPrice||p?.purchasePrice||0),confidence:item.confidence,matchScore:selected?.score||0}});sessionStorage.setItem("wineshop_ocr_purchase_draft",JSON.stringify({supplierName:result.supplierName||"",invoiceNumber:result.invoiceNumber||"",invoiceDate:result.invoiceDate||new Date().toISOString().slice(0,10),items:lines,sourceFile:file?.name,createdAt:new Date().toISOString()}));navigate("/purchases")}
+return <div><div className="page-heading"><div><h2>OCR & Automation Hub</h2><p>Invoice OCR with mandatory human review before stock receipt.</p></div></div>{message&&<div className="purchase-message error">{message}</div>}<div className="settings-grid"><section className="panel"><h3>Purchase Invoice OCR</h3><input type="file" accept="image/*,.pdf,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)}/><br/><br/><button className="primary-button" disabled={!file||busy} onClick={analyze}>{busy?"Analyzing...":"Analyze Invoice"}</button><p><small>Azure Document Intelligence F0 is configured server-side. F0 is intended for low-cost testing and processes only the first two pages of a document; upload files up to 4 MB. Human review is mandatory before inventory changes.</small></p></section><section className="panel"><h3>Compliance / AI Roadmap</h3><p>State excise/compliance reports are not claimed as implemented because the exact Indian state, licensing format and statutory report specification must be selected first.</p><p>Smart reorder is already rule-based. Future anomaly detection and an owner assistant should read audited business data, never bypass transaction controls.</p></section></div>
+{result&&<section className="panel" style={{marginTop:16}}><h3>Human Review</h3><p>Supplier: <strong>{result.supplierName||"-"}</strong> · Invoice: <strong>{result.invoiceNumber||"-"}</strong> · Date: <strong>{result.invoiceDate||"-"}</strong></p><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>OCR Description</th><th>Qty</th><th>Unit Price</th><th>Best Product Match</th><th>Score</th></tr></thead><tbody>{(result.items||[]).map((item,i)=>{const m=(matches[i]||[])[0];return <tr key={i}><td>{item.description}</td><td>{item.quantity}</td><td>{item.unitPrice}</td><td>{m?.product_name||"No confident match"}</td><td>{m?.score||"-"}</td></tr>})}</tbody></table></div><button className="primary-button" onClick={useDraft}>Send Reviewed Draft to Receive Stock</button></section>}</div>}
diff --git a/src/pages/OfflineQueue.jsx b/src/pages/OfflineQueue.jsx
new file mode 100644
index 0000000..ba19ffc
--- /dev/null
+++ b/src/pages/OfflineQueue.jsx
@@ -0,0 +1,6 @@
+import { useEffect, useState } from "react";
+import { listOfflineSales } from "../lib/offlineQueue";
+import { useShop } from "../context/ShopContext";
+
+export default function OfflineQueue(){const{syncOfflineSales}=useShop();const[rows,setRows]=useState([]);const[message,setMessage]=useState("");async function load(){try{setRows(await listOfflineSales())}catch(e){setMessage(e.message)}}useEffect(()=>{load()},[]);async function sync(){const r=await syncOfflineSales();setMessage(r.message);await load()}
+return <div><div className="page-heading"><div><h2>Offline POS Queue</h2><p>Encrypted emergency sales awaiting controlled Supabase synchronization.</p></div><button className="primary-button" disabled={!navigator.onLine} onClick={sync}>Sync Now</button></div>{message&&<div className="purchase-message">{message}</div>}<section className="panel"><p><strong>Important:</strong> offline mode is for a device that has already logged in and cached the catalog. A first-time cold login still requires internet. Server sync revalidates stock and prices; conflicts remain visible instead of being force-applied.</p><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Created</th><th>Client Sale ID</th><th>Items</th><th>Payment</th><th>Status</th><th>Error</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{new Date(r.createdAt).toLocaleString("en-IN")}</td><td>{r.id}</td><td>{r.payload?.items?.reduce((s,i)=>s+i.quantity,0)??"?"}</td><td>{r.payload?.paymentMethod||"?"}</td><td>{r.status}</td><td>{r.lastError||r.decryptError||"-"}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/POS.jsx b/src/pages/POS.jsx
index 7961c58..13b6285 100644
--- a/src/pages/POS.jsx
+++ b/src/pages/POS.jsx
@@ -1,190 +1,18 @@
-import { useMemo, useRef, useState } from "react";
+import { useEffect, useMemo, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { useShop } from "../context/ShopContext";
-
-const money = new Intl.NumberFormat("en-IN", {
-  style: "currency",
-  currency: "INR",
-  maximumFractionDigits: 0,
-});
-
-export default function POS() {
-  const { products, getStock, completeSale } = useShop();
-  const navigate = useNavigate();
-  const barcodeRef = useRef(null);
-
-  const [barcode, setBarcode] = useState("");
-  const [search, setSearch] = useState("");
-  const [cart, setCart] = useState([]);
-  const [paymentMethod, setPaymentMethod] = useState("CASH");
-  const [paymentReference, setPaymentReference] = useState("");
-  const [discount, setDiscount] = useState(0);
-  const [message, setMessage] = useState("Ready to scan barcode 8900000010016");
-  const [busy, setBusy] = useState(false);
-
-  const activeProducts = products.filter((p) => p.active);
-
-  const searchResults = useMemo(() => {
-    const q = search.trim().toLowerCase();
-    if (!q) return [];
-    return activeProducts.filter((p) =>
-      [p.name,p.brand,p.sku,p.barcode].some((v) => String(v).toLowerCase().includes(q))
-    ).slice(0,8);
-  }, [search, activeProducts]);
-
-  function cartQty(id) {
-    return cart.find((item) => item.product.id === id)?.quantity ?? 0;
-  }
-
-  function add(product) {
-    const stock = getStock(product.id);
-    if (cartQty(product.id) >= stock) {
-      setMessage(`Only ${stock} unit(s) available for ${product.name}.`);
-      return;
-    }
-
-    setCart((current) => {
-      const existing = current.find((item) => item.product.id === product.id);
-      if (existing) {
-        return current.map((item) =>
-          item.product.id === product.id
-            ? { ...item, quantity: item.quantity + 1 }
-            : item
-        );
-      }
-      return [...current, { product, quantity: 1 }];
-    });
-    setMessage(`${product.name} added.`);
-  }
-
-  function scan(event) {
-    event.preventDefault();
-    const code = barcode.trim();
-    const product = activeProducts.find((p) => p.barcode === code);
-    if (!product) setMessage(`Product not found: ${code}`);
-    else add(product);
-    setBarcode("");
-    requestAnimationFrame(() => barcodeRef.current?.focus());
-  }
-
-  function change(id, delta) {
-    const item = cart.find((x) => x.product.id === id);
-    if (!item) return;
-    const next = item.quantity + delta;
-    if (next <= 0) {
-      setCart((c) => c.filter((x) => x.product.id !== id));
-      return;
-    }
-    if (next > getStock(id)) {
-      setMessage(`Only ${getStock(id)} unit(s) available.`);
-      return;
-    }
-    setCart((c) => c.map((x) => x.product.id === id ? { ...x, quantity: next } : x));
-  }
-
-  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
-  const normalizedDiscount = Math.max(0, Number(discount || 0));
-  const total = Math.max(0, subtotal - normalizedDiscount);
-
-  async function checkout() {
-    setBusy(true);
-    const result = await completeSale(cart, paymentMethod, {
-      discount: normalizedDiscount,
-      paymentReference,
-    });
-    setBusy(false);
-
-    if (!result.ok) {
-      setMessage(result.message);
-      return;
-    }
-
-    setCart([]);
-    setDiscount(0);
-    setPaymentReference("");
-    navigate(`/sales/${result.sale.id}`);
-  }
-
-  return (
-    <div>
-      <div className="page-heading"><div><h2>POS Billing</h2><p>USB/Bluetooth scanner works as keyboard input</p></div></div>
-
-      <div className="pos-layout">
-        <div className="pos-left">
-          <form className="panel" onSubmit={scan}>
-            <label>Scan Barcode</label>
-            <div className="barcode-input-row">
-              <input ref={barcodeRef} autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan barcode + Enter" />
-              <button className="primary-button">Add</button>
-            </div>
-            <div className="purchase-message" style={{ marginTop:10 }}>{message}</div>
-          </form>
-
-          <div className="panel" style={{ marginTop:14 }}>
-            <input style={{ width:"100%" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." />
-            {searchResults.map((p) => (
-              <button key={p.id} type="button" className="search-result" onClick={() => add(p)}>
-                <span>{p.name}</span>
-                <span>{money.format(p.price)} · Stock {getStock(p.id)}</span>
-              </button>
-            ))}
-          </div>
-        </div>
-
-        <div className="panel">
-          <h3>Cart</h3>
-          <div className="data-table-wrapper">
-            <table className="data-table">
-              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
-              <tbody>
-                {cart.map((item) => (
-                  <tr key={item.product.id}>
-                    <td>{item.product.name}</td>
-                    <td>
-                      <button type="button" onClick={() => change(item.product.id,-1)}>-</button>
-                      {" "}{item.quantity}{" "}
-                      <button type="button" onClick={() => change(item.product.id,1)}>+</button>
-                    </td>
-                    <td>{money.format(item.product.price)}</td>
-                    <td>{money.format(item.product.price * item.quantity)}</td>
-                  </tr>
-                ))}
-              </tbody>
-            </table>
-          </div>
-
-          <hr/>
-          <p>Subtotal <strong>{money.format(subtotal)}</strong></p>
-          <label>Discount
-            <input type="number" min="0" max={subtotal} value={discount} onChange={(e) => setDiscount(e.target.value)} />
-          </label>
-          <h2>Total {money.format(total)}</h2>
-
-          <div className="payment-methods">
-            {["CASH","UPI","CARD"].map((method) => (
-              <button
-                type="button"
-                key={method}
-                className={paymentMethod === method ? "payment-button active" : "payment-button"}
-                onClick={() => setPaymentMethod(method)}
-              >
-                {method}
-              </button>
-            ))}
-          </div>
-
-          {paymentMethod !== "CASH" && (
-            <label>Payment Reference
-              <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
-            </label>
-          )}
-
-          <br/>
-          <button className="primary-button" disabled={!cart.length || busy} onClick={checkout}>
-            {busy ? "Processing..." : "Complete Sale"}
-          </button>
-        </div>
-      </div>
-    </div>
-  );
-}
+import { useScanner } from "../context/ScannerContext";
+
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+export default function POS(){const{products,getStock,completeSale}=useShop();const{lastScan,successBeep,errorBeep}=useScanner();const navigate=useNavigate();const[search,setSearch]=useState("");const[cart,setCart]=useState([]);const[paymentMethod,setPaymentMethod]=useState("CASH");const[paymentReference,setPaymentReference]=useState("");const[discount,setDiscount]=useState(0);const[message,setMessage]=useState("Scanner ready");const[unknown,setUnknown]=useState("");const[busy,setBusy]=useState(false);
+const active=products.filter((p)=>p.active);const results=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return active.filter((p)=>[p.name,p.brand,p.sku,p.barcode].some((v)=>String(v).toLowerCase().includes(q))).slice(0,8)},[search,active]);
+function qty(id){return cart.find((i)=>i.product.id===id)?.quantity||0}function add(p){const stock=getStock(p.id);if(qty(p.id)>=stock){errorBeep();setMessage(`Only ${stock} unit(s) available for ${p.name}.`);return false}setCart((c)=>{const x=c.find((i)=>i.product.id===p.id);return x?c.map((i)=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{product:p,quantity:1}]});setUnknown("");setMessage(`${p.name} added.`);successBeep();return true}
+function processBarcode(code){const p=active.find((x)=>x.barcode===code);if(!p){errorBeep();setUnknown(code);setMessage(`PRODUCT NOT FOUND: ${code}`);return}add(p)}
+useEffect(()=>{if(lastScan?.barcode)processBarcode(lastScan.barcode)},[lastScan?.id]);
+function change(id,d){const i=cart.find((x)=>x.product.id===id);if(!i)return;const next=i.quantity+d;if(next<=0)return setCart((c)=>c.filter((x)=>x.product.id!==id));if(next>getStock(id)){errorBeep();return setMessage(`Only ${getStock(id)} unit(s) available.`)}setCart((c)=>c.map((x)=>x.product.id===id?{...x,quantity:next}:x))}
+const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0);const disc=Math.max(0,Number(discount||0));const total=Math.max(0,subtotal-disc);
+async function checkout(){setBusy(true);const r=await completeSale(cart,paymentMethod,{discount:disc,paymentReference});setBusy(false);if(!r.ok){errorBeep();setMessage(r.message);return}successBeep();setCart([]);setDiscount(0);setPaymentReference("");if(r.offline){setMessage(r.message);return}navigate(`/sales/${r.sale.id}`)}
+return <div><div className="page-heading"><div><h2>POS Billing</h2><p>Global HID scanner active — scan from anywhere on this page.</p></div><button className="secondary-button" onClick={()=>navigate("/scanner-settings")}>Scanner Test</button></div>
+{unknown&&<div className="product-not-found"><strong>PRODUCT NOT FOUND</strong><span>{unknown}</span><button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button></div>}
+<div className="pos-layout"><div className="pos-left"><div className="panel"><label>Manual Search<input style={{width:"100%"}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>{results.map((p)=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}<div className="purchase-message" style={{marginTop:10}}>{message}</div></div><div className="panel scanner-commercial-card" style={{marginTop:14}}><strong>Scanner mode</strong><p>Rapid keystrokes + Enter are captured globally. Scanner text is removed from discount/payment fields automatically.</p><p>Test barcode: <code>8900000010016</code></p></div></div>
+<div className="panel"><h3>Cart</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{cart.map((i)=><tr key={i.product.id}><td>{i.product.name}</td><td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td><td>{money.format(i.product.price)}</td><td>{money.format(i.product.price*i.quantity)}</td></tr>)}</tbody></table></div><hr/><p>Subtotal <strong>{money.format(subtotal)}</strong></p><label>Discount<input type="number" min="0" max={subtotal} value={discount} onChange={(e)=>setDiscount(e.target.value)}/></label><h2>Total {money.format(total)}</h2><div className="payment-methods">{["CASH","UPI","CARD"].map((m)=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>{paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)}/></label>}<br/><button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button></div></div></div>}
diff --git a/src/pages/PriceHistory.jsx b/src/pages/PriceHistory.jsx
new file mode 100644
index 0000000..5e2f095
--- /dev/null
+++ b/src/pages/PriceHistory.jsx
@@ -0,0 +1,5 @@
+import { useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+export default function PriceHistory(){const{products}=useShop();const[id,setId]=useState("");const[rows,setRows]=useState([]);const[message,setMessage]=useState("");async function load(productId){setId(productId);if(!productId)return setRows([]);const{data,error}=await supabase.rpc("purchase_price_history",{p_product_id:productId,p_limit:24});if(error)setMessage(error.message);else setRows(data||[])}const newest=rows[0]?.purchase_price;const oldest=rows.at(-1)?.purchase_price;const change=oldest&&newest?((Number(newest)-Number(oldest))/Number(oldest))*100:null;return <div><div className="page-heading"><div><h2>Purchase Price History</h2><p>Track supplier cost movement for each product.</p></div></div>{message&&<div className="purchase-message">{message}</div>}<div className="panel"><label>Product<select value={id} onChange={(e)=>load(e.target.value)}><option value="">Select product</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{change!=null&&<p>Oldest → latest change: <strong className={change>0?"negative":"positive"}>{change>=0?"+":""}{change.toFixed(2)}%</strong></p>}</div><section className="panel" style={{marginTop:16}}><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Qty</th><th>Price / Bottle</th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.invoice_date}-${i}`}><td>{r.invoice_date}</td><td>{r.supplier_name}</td><td>{r.quantity}</td><td>{money.format(r.purchase_price)}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/PrinterSettings.jsx b/src/pages/PrinterSettings.jsx
new file mode 100644
index 0000000..593981e
--- /dev/null
+++ b/src/pages/PrinterSettings.jsx
@@ -0,0 +1,11 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+
+export default function PrinterSettings(){const{profile}=useAuth();const[form,setForm]=useState({store_address:"",store_phone:"",tax_registration_number:"",receipt_footer:"THANK YOU",printer_paper_mm:80});const[message,setMessage]=useState("");
+useEffect(()=>{supabase.from("shop_settings").select("store_address,store_phone,tax_registration_number,receipt_footer,printer_paper_mm").maybeSingle().then(({data,error})=>{if(error)setMessage(error.message);else if(data)setForm({...form,...data})})},[]);
+async function save(e){e.preventDefault();const{error}=await supabase.from("shop_settings").update(form).eq("shop_id",profile.shop_id);setMessage(error?error.message:"Receipt settings saved.")}
+function testPrint(){window.print()}
+return <div><div className="page-heading"><div><h2>Thermal Printer</h2><p>80mm/58mm browser-print receipt optimized for installed USB/Bluetooth printers.</p></div></div>{message&&<div className="purchase-message">{message}</div>}
+<div className="settings-grid"><form className="panel" onSubmit={save}><h3>Receipt Header</h3><div className="settings-fields"><label>Store Address<textarea value={form.store_address||""} onChange={(e)=>setForm({...form,store_address:e.target.value})}/></label><label>Phone<input value={form.store_phone||""} onChange={(e)=>setForm({...form,store_phone:e.target.value})}/></label><label>Registration / GST / License text<input value={form.tax_registration_number||""} onChange={(e)=>setForm({...form,tax_registration_number:e.target.value})}/></label><label>Paper Width<select value={form.printer_paper_mm} onChange={(e)=>setForm({...form,printer_paper_mm:Number(e.target.value)})}><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label><label>Receipt Footer<input value={form.receipt_footer||""} onChange={(e)=>setForm({...form,receipt_footer:e.target.value})}/></label></div><br/><button className="primary-button">Save</button></form>
+<section className="panel print-test-ticket"><h3>Printer Test</h3><p><strong>{profile?.shop_name}</strong></p><p>{form.store_address}</p><div className="receipt-rule"/><p>Printer test line</p><p>2 × ₹180 = ₹360</p><div className="receipt-rule"/><h3>TOTAL ₹360</h3><p>{form.receipt_footer}</p><button className="primary-button no-print" onClick={testPrint}>Open Print Dialog</button><p className="no-print"><small>Choose your installed thermal printer and set margins to None/Minimum. Static web apps cannot safely force silent raw ESC/POS printing across arbitrary printer models.</small></p></section></div></div>}
diff --git a/src/pages/Procurement.jsx b/src/pages/Procurement.jsx
new file mode 100644
index 0000000..239fc86
--- /dev/null
+++ b/src/pages/Procurement.jsx
@@ -0,0 +1,20 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+const line=()=>({productId:"",quantity:12,purchasePrice:0});
+export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");
+async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select(`*,purchase_order_items(*)`).order("created_at",{ascending:false}).limit(100),supabase.rpc("supplier_balances")]);if(po.error)setMessage(po.error.message);else setOrders(po.data||[]);if(b.error)setMessage(b.error.message);else setBalances(b.data||[])}useEffect(()=>{load()},[]);
+function update(i,k,v){setItems((x)=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find((p)=>p.id===v)?.purchasePrice||0}:{})}:r))}
+const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
+async function createPO(e){e.preventDefault();const payload=items.filter((i)=>i.productId&&Number(i.quantity)>0).map((i)=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?error.message:"Purchase order created.");if(!error){setItems([line()]);load()}}
+async function setStatus(id,status){const{error}=await supabase.rpc("set_purchase_order_status",{p_po_id:id,p_status:status});setMessage(error?error.message:`PO ${status.toLowerCase()}.`);if(!error)load()}
+async function receive(po){const inv=prompt("Supplier invoice number");if(!inv)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:po.id,p_invoice_number:inv,p_invoice_date:new Date().toISOString().slice(0,10),p_receive_items:null,p_notes:"Received from PO screen"});setMessage(error?error.message:"PO goods received and inventory updated.");if(!error){await Promise.all([load(),refreshAll()])}}
+async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?error.message:"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
+async function purchaseReturn(){const productId=prompt("Paste/select product UUID to return (use Products screen if needed)");if(!productId)return;const qty=Number(prompt("Quantity to return",1));const p=products.find((x)=>x.id===productId);if(!p)return setMessage("Product UUID not found in this shop.");const sid=prompt("Supplier UUID",supplierId||suppliers[0]?.id||"");if(!sid)return;const reason=prompt("Reason","Damaged/incorrect supply");if(!reason)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:sid,p_items:[{product_id:productId,quantity:qty,purchase_price:p.purchasePrice}],p_reason:reason,p_purchase_id:null});setMessage(error?error.message:"Purchase return completed and stock reduced.");if(!error){await Promise.all([load(),refreshAll()])}}
+return <div><div className="page-heading"><div><h2>Supplier & Purchasing</h2><p>PO → receive → supplier balance → payment → purchase return.</p></div><button className="secondary-button" onClick={purchaseReturn}>Supplier Return</button></div>{message&&<div className="purchase-message">{message}</div>}
+<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order</h3><label>Supplier<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={(e)=>setExpected(e.target.value)}/></label><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={(e)=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" onClick={()=>setItems((x)=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,line()])}>Add Line</button><button className="primary-button">Create PO</button></div></form>
+<form className="panel" onSubmit={pay}><h3>Record Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={(e)=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e)=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={(e)=>setPayment({...payment,method:e.target.value})}><option>BANK_TRANSFER</option><option>UPI</option><option>CASH</option><option>CARD</option><option>CHEQUE</option><option>OTHER</option></select></label><label>Reference<input value={payment.reference} onChange={(e)=>setPayment({...payment,reference:e.target.value})}/></label></div><br/><button className="primary-button">Record Payment</button></form></div>
+<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map((b)=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
+<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Action</th></tr></thead><tbody>{orders.map((o)=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find((s)=>s.id===o.supplier_id)?.supplier_name||o.supplier_id.slice(0,8)}</td><td>{o.status}</td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td>{o.status==="DRAFT"&&<button className="secondary-button" onClick={()=>setStatus(o.id,"SENT")}>Mark Sent</button>} {["DRAFT","SENT","PARTIALLY_RECEIVED"].includes(o.status)&&<button className="primary-button" onClick={()=>receive(o)}>Receive</button>}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/Purchases.jsx b/src/pages/Purchases.jsx
index 2f31a07..036d2d6 100644
--- a/src/pages/Purchases.jsx
+++ b/src/pages/Purchases.jsx
@@ -1,179 +1,9 @@
-import { useMemo, useState } from "react";
+import { useEffect, useMemo, useState } from "react";
 import { useShop } from "../context/ShopContext";
-
-const money = new Intl.NumberFormat("en-IN", {
-  style: "currency",
-  currency: "INR",
-  maximumFractionDigits: 0,
-});
-
-function emptyLine() {
-  return {
-    productId: "",
-    caseCount: 0,
-    unitsPerCase: 12,
-    looseBottles: 0,
-    quantity: 0,
-    purchasePrice: 0,
-  };
-}
-
-export default function Purchases() {
-  const { products, purchases, suppliers, receiveStock } = useShop();
-  const active = products.filter((p) => p.active);
-
-  const [supplierName, setSupplierName] = useState("");
-  const [invoiceNumber, setInvoiceNumber] = useState("");
-  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
-  const [notes, setNotes] = useState("");
-  const [items, setItems] = useState([emptyLine()]);
-  const [message, setMessage] = useState("");
-  const [busy, setBusy] = useState(false);
-
-  function updateLine(index, field, value) {
-    setItems((current) =>
-      current.map((item, i) => {
-        if (i !== index) return item;
-        const next = { ...item, [field]: value };
-
-        if (field === "productId") {
-          const product = active.find((p) => p.id === value);
-          if (product) {
-            next.unitsPerCase = product.unitsPerCase || 1;
-            next.purchasePrice = product.purchasePrice || 0;
-          }
-        }
-
-        const cases = Number(next.caseCount || 0);
-        const units = Number(next.unitsPerCase || 1);
-        const loose = Number(next.looseBottles || 0);
-        next.quantity = cases * units + loose;
-        return next;
-      })
-    );
-  }
-
-  const total = useMemo(
-    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0),
-    [items]
-  );
-
-  async function submit(event) {
-    event.preventDefault();
-    setBusy(true);
-    setMessage("");
-
-    const cleaned = items.filter((item) => item.productId && Number(item.quantity) > 0);
-
-    const result = await receiveStock({
-      supplierName,
-      invoiceNumber,
-      invoiceDate,
-      notes,
-      items: cleaned,
-    });
-
-    setMessage(result.message);
-    if (result.ok) {
-      setInvoiceNumber("");
-      setNotes("");
-      setItems([emptyLine()]);
-    }
-    setBusy(false);
-  }
-
-  return (
-    <div>
-      <div className="page-heading">
-        <div><h2>Receive Stock</h2><p>Purchases update inventory transactionally in Supabase</p></div>
-      </div>
-
-      <form className="panel" onSubmit={submit}>
-        <div className="form-grid">
-          <label>Supplier
-            <input
-              list="supplier-list"
-              value={supplierName}
-              onChange={(e) => setSupplierName(e.target.value)}
-              required
-            />
-            <datalist id="supplier-list">
-              {suppliers.filter((s) => s.active).map((s) => <option key={s.id} value={s.supplier_name} />)}
-            </datalist>
-          </label>
-          <label>Supplier Invoice<input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required /></label>
-          <label>Invoice Date<input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required /></label>
-          <label>Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
-        </div>
-
-        <div className="data-table-wrapper" style={{ marginTop: 18 }}>
-          <table className="data-table">
-            <thead>
-              <tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Total Bottles</th><th>Price/Bottle</th><th>Line Total</th><th></th></tr>
-            </thead>
-            <tbody>
-              {items.map((item, index) => (
-                <tr key={index}>
-                  <td>
-                    <select value={item.productId} onChange={(e) => updateLine(index,"productId",e.target.value)} required>
-                      <option value="">Select</option>
-                      {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
-                    </select>
-                  </td>
-                  <td><input type="number" min="0" value={item.caseCount} onChange={(e) => updateLine(index,"caseCount",e.target.value)} /></td>
-                  <td><input type="number" min="1" value={item.unitsPerCase} onChange={(e) => updateLine(index,"unitsPerCase",e.target.value)} /></td>
-                  <td><input type="number" min="0" value={item.looseBottles} onChange={(e) => updateLine(index,"looseBottles",e.target.value)} /></td>
-                  <td>{item.quantity}</td>
-                  <td><input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => updateLine(index,"purchasePrice",e.target.value)} /></td>
-                  <td>{money.format(Number(item.quantity || 0) * Number(item.purchasePrice || 0))}</td>
-                  <td>
-                    <button type="button" className="secondary-button" onClick={() => setItems((c) => c.filter((_,i) => i !== index))}>Remove</button>
-                  </td>
-                </tr>
-              ))}
-            </tbody>
-          </table>
-        </div>
-
-        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, gap:10 }}>
-          <button type="button" className="secondary-button" onClick={() => setItems((c) => [...c, emptyLine()])}>Add Line</button>
-          <strong>Total: {money.format(total)}</strong>
-        </div>
-
-        {message && <div className="purchase-message" style={{ marginTop:12 }}>{message}</div>}
-        <br/>
-        <button className="primary-button" disabled={busy}>{busy ? "Receiving..." : "Receive Stock"}</button>
-      </form>
-
-      <section className="panel" style={{ marginTop:18 }}>
-        <h3>Invoice OCR</h3>
-        <p>
-          Architecture is reserved for Azure AI Document Intelligence: invoice image/PDF → extracted lines →
-          product match → human confirmation → receive_purchase(). OCR is not enabled yet because an Azure
-          Document Intelligence resource/endpoint has not been provided.
-        </p>
-      </section>
-
-      <section className="panel" style={{ marginTop:18 }}>
-        <h3>Recent Purchases</h3>
-        <div className="data-table-wrapper">
-          <table className="data-table">
-            <thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead>
-            <tbody>
-              {purchases.slice(0,20).map((p) => (
-                <tr key={p.id}>
-                  <td>{p.purchaseNumber}</td>
-                  <td>{p.invoiceNumber}</td>
-                  <td>{p.supplierName}</td>
-                  <td>{p.invoiceDate}</td>
-                  <td>{p.totalUnits}</td>
-                  <td>{money.format(p.total)}</td>
-                </tr>
-              ))}
-            </tbody>
-          </table>
-        </div>
-      </section>
-    </div>
-  );
-}
+import { useNavigate } from "react-router-dom";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});const empty=()=>({productId:"",caseCount:0,unitsPerCase:12,looseBottles:0,quantity:0,purchasePrice:0});
+export default function Purchases(){const{products,purchases,suppliers,receiveStock}=useShop();const navigate=useNavigate();const active=products.filter((p)=>p.active);const[supplierName,setSupplierName]=useState("");const[invoiceNumber,setInvoiceNumber]=useState("");const[invoiceDate,setInvoiceDate]=useState(new Date().toISOString().slice(0,10));const[notes,setNotes]=useState("");const[items,setItems]=useState([empty()]);const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
+useEffect(()=>{try{const raw=sessionStorage.getItem("wineshop_ocr_purchase_draft");if(!raw)return;const d=JSON.parse(raw);setSupplierName(d.supplierName||"");setInvoiceNumber(d.invoiceNumber||"");setInvoiceDate(d.invoiceDate||new Date().toISOString().slice(0,10));setNotes(`OCR draft from ${d.sourceFile||"invoice"}. REVIEW ALL LINES BEFORE RECEIVING.`);setItems((d.items||[]).map((x)=>({...empty(),...x,quantity:Number(x.quantity||0)})));sessionStorage.removeItem("wineshop_ocr_purchase_draft");setMessage("OCR draft loaded. Review every product match, quantity and price before receiving stock.")}catch{}},[]);
+function update(n,k,v){setItems((cur)=>cur.map((i,idx)=>{if(idx!==n)return i;const x={...i,[k]:v};if(k==="productId"){const p=active.find((p)=>p.id===v);if(p){x.unitsPerCase=p.unitsPerCase||1;x.purchasePrice=p.purchasePrice||0}}x.quantity=Number(x.caseCount||0)*Number(x.unitsPerCase||1)+Number(x.looseBottles||0);return x}))}const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
+async function submit(e){e.preventDefault();setBusy(true);const cleaned=items.filter((i)=>i.productId&&Number(i.quantity)>0);const r=await receiveStock({supplierName,invoiceNumber,invoiceDate,notes,items:cleaned});setMessage(r.message);if(r.ok){setInvoiceNumber("");setNotes("");setItems([empty()])}setBusy(false)}
+return <div><div className="page-heading"><div><h2>Receive Stock</h2><p>Manual, PO, or OCR-reviewed stock receipt.</p></div><button className="secondary-button" onClick={()=>navigate("/automation")}>Invoice OCR</button></div>{message&&<div className="purchase-message">{message}</div>}<form className="panel" onSubmit={submit}><div className="form-grid"><label>Supplier<input list="supplier-list" value={supplierName} onChange={(e)=>setSupplierName(e.target.value)} required/><datalist id="supplier-list">{suppliers.filter((s)=>s.active).map((s)=><option key={s.id} value={s.supplier_name}/>)}</datalist></label><label>Supplier Invoice<input value={invoiceNumber} onChange={(e)=>setInvoiceNumber(e.target.value)} required/></label><label>Invoice Date<input type="date" value={invoiceDate} onChange={(e)=>setInvoiceDate(e.target.value)} required/></label><label>Notes<input value={notes} onChange={(e)=>setNotes(e.target.value)}/></label></div><div className="data-table-wrapper" style={{marginTop:18}}><table className="data-table"><thead><tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Total</th><th>Price/Bottle</th><th>Amount</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select product</option>{active.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="0" value={i.caseCount} onChange={(e)=>update(n,"caseCount",e.target.value)}/></td><td><input type="number" min="1" value={i.unitsPerCase} onChange={(e)=>update(n,"unitsPerCase",e.target.value)}/></td><td><input type="number" min="0" value={i.looseBottles} onChange={(e)=>update(n,"looseBottles",e.target.value)}/></td><td>{i.quantity}</td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td>{money.format(Number(i.quantity||0)*Number(i.purchasePrice||0))}</td><td><button type="button" onClick={()=>setItems((x)=>x.filter((_,idx)=>idx!==n))}>×</button></td></tr>)}</tbody></table></div><div className="button-row spread"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,empty()])}>Add Line</button><strong>Total {money.format(total)}</strong></div><br/><button className="primary-button" disabled={busy}>{busy?"Receiving...":"Confirm & Receive Stock"}</button></form><section className="panel" style={{marginTop:16}}><h3>Recent Purchases</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead><tbody>{purchases.slice(0,20).map((p)=><tr key={p.id}><td>{p.purchaseNumber}</td><td>{p.invoiceNumber}</td><td>{p.supplierName}</td><td>{p.invoiceDate}</td><td>{p.totalUnits}</td><td>{money.format(p.total)}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/Reorder.jsx b/src/pages/Reorder.jsx
new file mode 100644
index 0000000..b370341
--- /dev/null
+++ b/src/pages/Reorder.jsx
@@ -0,0 +1,7 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+
+export default function Reorder(){const{products,suppliers}=useShop();const[days,setDays]=useState(30);const[target,setTarget]=useState(7);const[rows,setRows]=useState([]);const[message,setMessage]=useState("");async function load(){const{data,error}=await supabase.rpc("reorder_suggestions",{p_history_days:Number(days),p_target_days:Number(target)});if(error)setMessage(error.message);else setRows(data||[])}useEffect(()=>{load()},[]);
+async function createPO(row){const sid=prompt("Supplier UUID for this order",suppliers[0]?.id||"");if(!sid)return;const p=products.find((x)=>x.id===row.product_id);const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:sid,p_items:[{product_id:row.product_id,quantity:row.suggested_cases*row.units_per_case,purchase_price:p?.purchasePrice||0}],p_expected_date:null,p_notes:`Smart reorder: ${row.suggested_cases} case(s)`});setMessage(error?error.message:"Purchase order created from reorder suggestion.")}
+return <div><div className="page-heading"><div><h2>Smart Reordering</h2><p>Rule-based demand calculation; no AI required.</p></div><button className="primary-button" onClick={load}>Refresh</button></div>{message&&<div className="purchase-message">{message}</div>}<div className="panel form-grid"><label>Sales history days<input type="number" min="7" max="180" value={days} onChange={(e)=>setDays(e.target.value)}/></label><label>Target stock days<input type="number" min="1" max="60" value={target} onChange={(e)=>setTarget(e.target.value)}/></label></div><section className="panel" style={{marginTop:16}}><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Stock</th><th>Sold</th><th>Avg/day</th><th>Days left</th><th>Suggested</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.current_stock}</td><td>{r.units_sold}</td><td>{r.avg_daily}</td><td>{r.days_remaining??"No recent sales"}</td><td><strong>{r.suggested_cases} case(s)</strong><br/><small>{r.suggested_bottles} bottle target gap</small></td><td>{r.suggested_cases>0&&<button className="primary-button" onClick={()=>createPO(r)}>Create PO</button>}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/Returns.jsx b/src/pages/Returns.jsx
new file mode 100644
index 0000000..6fd7d95
--- /dev/null
+++ b/src/pages/Returns.jsx
@@ -0,0 +1,32 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import { useAuth } from "../context/AuthContext";
+
+const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 });
+
+export default function Returns() {
+  const { sales, refreshAll } = useShop();
+  const { profile } = useAuth();
+  const [saleId,setSaleId]=useState(""); const [qty,setQty]=useState({}); const [reason,setReason]=useState("");
+  const [method,setMethod]=useState("CASH"); const [reference,setReference]=useState(""); const [requests,setRequests]=useState([]); const [message,setMessage]=useState("");
+  const selected=useMemo(()=>sales.find((s)=>s.id===saleId),[sales,saleId]);
+  const manager=["ADMIN","MANAGER"].includes(profile?.role);
+
+  async function load(){const{data,error}=await supabase.from("sale_return_requests").select(`id,sale_id,status,reason,refund_method,total_refund,created_at,reviewed_at,sale_return_items(id,sale_item_id,product_id,quantity,unit_refund,line_refund)`).order("created_at",{ascending:false}).limit(100);if(error)setMessage(error.message);else setRequests(data||[])}
+  useEffect(()=>{load()},[]);
+  async function requestReturn(e){e.preventDefault();const items=(selected?.items||[]).map((i)=>({sale_item_id:i.id,quantity:Number(qty[i.id]||0)})).filter((i)=>i.quantity>0);const{error}=await supabase.rpc("create_return_request",{p_sale_id:saleId,p_items:items,p_reason:reason,p_refund_method:method,p_refund_reference:reference||null});setMessage(error?error.message:"Return request submitted for manager approval.");if(!error){setQty({});setReason("");await load()}}
+  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
+  async function voidSale(){if(!selected||!reason.trim())return setMessage("Select an invoice and enter a void reason.");if(!confirm(`Void ${selected.invoiceNumber}? Stock will be restored and refund recorded.`))return;const{error}=await supabase.rpc("void_sale",{p_sale_id:selected.id,p_reason:reason,p_refund_method:method,p_refund_reference:reference||null});setMessage(error?error.message:"Sale voided and stock restored.");if(!error)await refreshAll()}
+
+  return <div><div className="page-heading"><div><h2>Returns, Refunds & Voids</h2><p>Return requests require Manager/Admin approval before stock changes.</p></div></div>
+    {message&&<div className="purchase-message">{message}</div>}
+    <div className="settings-grid">
+      <form className="panel" onSubmit={requestReturn}><h3>New Return Request</h3><div className="settings-fields"><label>Original Invoice<select value={saleId} onChange={(e)=>{setSaleId(e.target.value);setQty({})}} required><option value="">Select invoice</option>{sales.filter((s)=>!["VOID","RETURNED"].includes(s.status)&&!String(s.id).startsWith("offline-")).map((s)=><option value={s.id} key={s.id}>{s.invoiceNumber} · {money.format(s.grandTotal)}</option>)}</select></label>
+      {selected?.items.map((i)=><label key={i.id}>{i.productName} · sold {i.quantity}<input type="number" min="0" max={i.quantity} value={qty[i.id]||0} onChange={(e)=>setQty({...qty,[i.id]:e.target.value})}/></label>)}
+      <label>Reason<input value={reason} onChange={(e)=>setReason(e.target.value)} required/></label><label>Refund Method<select value={method} onChange={(e)=>setMethod(e.target.value)}><option>CASH</option><option>UPI</option><option>CARD</option></select></label><label>Refund Reference<input value={reference} onChange={(e)=>setReference(e.target.value)}/></label></div><br/><button className="primary-button">Request Return</button>{manager&&selected&&<button type="button" className="danger-button" onClick={voidSale} style={{marginLeft:8}}>Void Entire Sale</button>}</form>
+      <section className="panel"><h3>Rules</h3><p>Cashier may request a return. Only Manager/Admin approves. Approval restores inventory and creates a refund payment plus CUSTOMER_RETURN stock movement.</p><p>Void is Manager/Admin only and is allowed only for a clean completed invoice with no return activity.</p></section>
+    </div>
+    <section className="panel" style={{marginTop:16}}><h3>Return Queue</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Created</th><th>Sale</th><th>Qty</th><th>Refund</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((r)=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString("en-IN")}</td><td>{sales.find((s)=>s.id===r.sale_id)?.invoiceNumber||r.sale_id.slice(0,8)}</td><td>{(r.sale_return_items||[]).reduce((a,i)=>a+i.quantity,0)}</td><td>{money.format(r.total_refund)}</td><td>{r.reason}</td><td>{r.status}</td><td>{manager&&r.status==="PENDING"?<><button className="secondary-button" onClick={()=>review(r.id,"approve")}>Approve</button> <button className="secondary-button" onClick={()=>review(r.id,"reject")}>Reject</button></>:"-"}</td></tr>)}</tbody></table></div></section>
+  </div>
+}
diff --git a/src/pages/SaleDetails.jsx b/src/pages/SaleDetails.jsx
index 32fee3c..079cbd0 100644
--- a/src/pages/SaleDetails.jsx
+++ b/src/pages/SaleDetails.jsx
@@ -1,51 +1,5 @@
 import { Navigate, useParams } from "react-router-dom";
 import { useShop } from "../context/ShopContext";
+import Receipt80mm from "../components/Receipt80mm";
 
-const money = new Intl.NumberFormat("en-IN", {
-  style: "currency",
-  currency: "INR",
-  maximumFractionDigits: 0,
-});
-
-export default function SaleDetails() {
-  const { id } = useParams();
-  const { sales, loadingData } = useShop();
-  const sale = sales.find((item) => item.id === id);
-
-  if (loadingData) return <div className="panel">Loading...</div>;
-  if (!sale) return <Navigate to="/sales" replace />;
-
-  return (
-    <div className="invoice-page">
-      <div className="page-heading no-print">
-        <div><h2>Invoice {sale.invoiceNumber}</h2></div>
-        <button className="primary-button" onClick={() => window.print()}>Print</button>
-      </div>
-
-      <div className="panel invoice-card">
-        <h2>WineShop POS</h2>
-        <p>{sale.invoiceNumber}</p>
-        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>
-
-        <table className="data-table">
-          <thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
-          <tbody>
-            {sale.items.map((item) => (
-              <tr key={item.id || item.productId}>
-                <td>{item.productName}</td>
-                <td>{item.quantity}</td>
-                <td>{money.format(item.unitPrice)}</td>
-                <td>{money.format(item.lineTotal)}</td>
-              </tr>
-            ))}
-          </tbody>
-        </table>
-
-        <p>Subtotal: {money.format(sale.subtotal)}</p>
-        <p>Discount: {money.format(sale.discount)}</p>
-        <h2>Total: {money.format(sale.grandTotal)}</h2>
-        <p>Payment: {sale.paymentMethod} {sale.paymentReference ? `· ${sale.paymentReference}` : ""}</p>
-      </div>
-    </div>
-  );
-}
+export default function SaleDetails(){const{id}=useParams();const{sales,loadingData}=useShop();const sale=sales.find((s)=>s.id===id);if(loadingData)return <div className="panel">Loading...</div>;if(!sale)return <Navigate to="/sales" replace/>;return <div className="invoice-page"><div className="page-heading no-print"><div><h2>Invoice {sale.invoiceNumber}</h2><p>80mm thermal receipt layout</p></div><button className="primary-button" onClick={()=>window.print()}>Print Receipt</button></div><Receipt80mm sale={sale}/></div>}
diff --git a/src/pages/ScannerSettings.jsx b/src/pages/ScannerSettings.jsx
new file mode 100644
index 0000000..36053f2
--- /dev/null
+++ b/src/pages/ScannerSettings.jsx
@@ -0,0 +1,36 @@
+import { useEffect, useState } from "react";
+import { useScanner } from "../context/ScannerContext";
+
+export default function ScannerSettings() {
+  const { settings, saveSettings, lastScan, successBeep, errorBeep } = useScanner();
+  const [draft, setDraft] = useState(settings);
+  const [history, setHistory] = useState([]);
+
+  useEffect(() => setDraft(settings), [settings]);
+  useEffect(() => { if (lastScan) setHistory((h) => [lastScan, ...h].slice(0, 10)); }, [lastScan]);
+
+  return (
+    <div>
+      <div className="page-heading"><div><h2>Scanner Test & Settings</h2><p>USB/Bluetooth HID barcode scanner diagnostics</p></div></div>
+      <div className="settings-grid">
+        <section className="panel">
+          <h3>Detection</h3>
+          <div className="settings-fields">
+            <label><input type="checkbox" checked={draft.enabled} onChange={(e)=>setDraft({...draft,enabled:e.target.checked})}/> Global scanner enabled</label>
+            <label>Minimum barcode length<input type="number" min="3" max="40" value={draft.minLength} onChange={(e)=>setDraft({...draft,minLength:Number(e.target.value)})}/></label>
+            <label>Maximum average key gap (ms)<input type="number" min="10" max="150" value={draft.maxAverageGapMs} onChange={(e)=>setDraft({...draft,maxAverageGapMs:Number(e.target.value)})}/></label>
+            <label>Sequence reset gap (ms)<input type="number" min="80" max="1000" value={draft.resetGapMs} onChange={(e)=>setDraft({...draft,resetGapMs:Number(e.target.value)})}/></label>
+          </div>
+          <br/><button className="primary-button" onClick={()=>saveSettings(draft)}>Save Scanner Settings</button>
+        </section>
+        <section className="panel scanner-test-zone">
+          <h3>Live Test</h3>
+          <p>Click anywhere or type in another field, then scan a barcode. The scanner listener is global.</p>
+          {lastScan ? <div className="scanner-last"><strong>{lastScan.barcode}</strong><span>{lastScan.length} chars · avg gap {lastScan.averageGapMs} ms</span></div> : <div className="scanner-last muted">No scan detected yet</div>}
+          <div className="button-row"><button className="secondary-button" onClick={successBeep}>Test success beep</button><button className="secondary-button" onClick={errorBeep}>Test error beep</button></div>
+        </section>
+      </div>
+      <section className="panel" style={{marginTop:16}}><h3>Last 10 scans</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Barcode</th><th>Time</th><th>Avg gap</th></tr></thead><tbody>{history.map((s)=><tr key={s.id}><td>{s.barcode}</td><td>{new Date(s.at).toLocaleTimeString()}</td><td>{s.averageGapMs} ms</td></tr>)}</tbody></table></div></section>
+    </div>
+  );
+}
diff --git a/src/pages/Shifts.jsx b/src/pages/Shifts.jsx
new file mode 100644
index 0000000..eb43e3b
--- /dev/null
+++ b/src/pages/Shifts.jsx
@@ -0,0 +1,17 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+import { offlineQueueCounts } from "../lib/offlineQueue";
+
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+export default function Shifts(){const{profile}=useAuth();const[shifts,setShifts]=useState([]);const[opening,setOpening]=useState(0);const[actual,setActual]=useState(0);const[message,setMessage]=useState("");const[offlineCounts,setOfflineCounts]=useState({total:0,pending:0,conflict:0});const manager=["ADMIN","MANAGER"].includes(profile?.role);
+async function load(){const[{data,error},counts]=await Promise.all([supabase.from("cashier_shifts").select("*").order("opened_at",{ascending:false}).limit(100),offlineQueueCounts().catch(()=>({total:0,pending:0,conflict:0}))]);setOfflineCounts(counts);if(error)setMessage(error.message);else setShifts(data||[])}useEffect(()=>{load();const fn=()=>load();window.addEventListener("online",fn);return()=>window.removeEventListener("online",fn)},[]);
+const mine=shifts.find((s)=>s.cashier_id===profile?.user_id&&["OPEN","CLOSE_REQUESTED"].includes(s.status));
+async function open(){const{error}=await supabase.rpc("open_shift",{p_opening_cash:Number(opening||0),p_notes:null});setMessage(error?error.message:"Shift opened.");if(!error)load()}
+async function requestClose(){if(!navigator.onLine)return setMessage("Internet is required to request shift close.");if(offlineCounts.pending||offlineCounts.conflict)return setMessage(`Sync/resolve offline sales before closing shift. Pending ${offlineCounts.pending}, conflicts ${offlineCounts.conflict}.`);const{error}=await supabase.rpc("request_close_shift",{p_actual_cash:Number(actual||0),p_notes:null});setMessage(error?error.message:"Close request sent to manager.");if(!error)load()}
+async function approve(id){const{error}=await supabase.rpc("approve_shift_close",{p_shift_id:id,p_notes:"Approved from Shift screen"});setMessage(error?error.message:"Shift closed.");if(!error)load()}
+return <div><div className="page-heading"><div><h2>Cashier Shift & Day Close</h2><p>Opening cash, payment totals, expected cash, actual cash and variance.</p></div></div>{message&&<div className="purchase-message">{message}</div>}
+{(offlineCounts.pending>0||offlineCounts.conflict>0)&&<div className="purchase-message error">Offline queue must be cleared before shift close. Pending {offlineCounts.pending} · Conflicts {offlineCounts.conflict}</div>}
+<div className="settings-grid"><section className="panel"><h3>My Shift</h3>{!mine?<><label>Opening Cash<input type="number" min="0" step="0.01" value={opening} onChange={(e)=>setOpening(e.target.value)}/></label><br/><button className="primary-button" onClick={open}>Open Shift</button></>:<><p>Status: <strong>{mine.status}</strong></p><p>Opened: {new Date(mine.opened_at).toLocaleString("en-IN")}</p><p>Opening Cash: {money.format(mine.opening_cash)}</p>{mine.status==="OPEN"&&<><label>Actual cash in drawer<input type="number" min="0" step="0.01" value={actual} onChange={(e)=>setActual(e.target.value)}/></label><br/><button className="primary-button" disabled={!navigator.onLine||offlineCounts.pending>0||offlineCounts.conflict>0} onClick={requestClose}>Request Close</button></>}</>}</section>
+<section className="panel"><h3>Close Rule</h3><p>Cashier sales require an OPEN shift. Cash expected = opening cash + cash sales - cash refunds. Manager/Admin approves the final close and variance.</p><p>Offline sales must be synchronized or resolved before the device can request close.</p></section></div>
+<section className="panel" style={{marginTop:16}}><h3>Shift History</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Opened</th><th>Cashier</th><th>Status</th><th>Cash</th><th>UPI</th><th>Card</th><th>Expected</th><th>Actual</th><th>Difference</th><th></th></tr></thead><tbody>{shifts.map((s)=><tr key={s.id}><td>{new Date(s.opened_at).toLocaleString("en-IN")}</td><td>{s.cashier_id===profile?.user_id?"Me":s.cashier_id.slice(0,8)}</td><td>{s.status}</td><td>{money.format(s.cash_sales)}</td><td>{money.format(s.upi_sales)}</td><td>{money.format(s.card_sales)}</td><td>{money.format(s.expected_cash)}</td><td>{s.actual_cash==null?"-":money.format(s.actual_cash)}</td><td className={Number(s.cash_difference)<0?"negative":""}>{s.cash_difference==null?"-":money.format(s.cash_difference)}</td><td>{manager&&s.status==="CLOSE_REQUESTED"?<button className="primary-button" onClick={()=>approve(s.id)}>Approve Close</button>:""}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/StockCount.jsx b/src/pages/StockCount.jsx
new file mode 100644
index 0000000..4d7fc6d
--- /dev/null
+++ b/src/pages/StockCount.jsx
@@ -0,0 +1,20 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useScanner } from "../context/ScannerContext";
+import { useShop } from "../context/ShopContext";
+
+export default function StockCount(){const{lastScan,successBeep,errorBeep}=useScanner();const{products,refreshAll}=useShop();const[counts,setCounts]=useState([]);const[items,setItems]=useState([]);const[activeId,setActiveId]=useState("");const[message,setMessage]=useState("");
+async function load(){const{data,error}=await supabase.from("stock_counts").select("*").order("created_at",{ascending:false}).limit(30);if(error)setMessage(error.message);else{setCounts(data||[]);const active=(data||[]).find((x)=>["OPEN","SUBMITTED"].includes(x.status));if(active&&!activeId)setActiveId(active.id)}}
+async function loadItems(id){if(!id){setItems([]);return}const{data,error}=await supabase.from("stock_count_items").select("*").eq("stock_count_id",id).order("product_id");if(error)setMessage(error.message);else setItems(data||[])}
+useEffect(()=>{load()},[]);useEffect(()=>{loadItems(activeId)},[activeId]);
+useEffect(()=>{if(!lastScan||!activeId)return;const active=counts.find((c)=>c.id===activeId);if(active?.status!=="OPEN")return;(async()=>{const{data,error}=await supabase.rpc("stock_count_scan",{p_stock_count_id:activeId,p_barcode:lastScan.barcode});if(error){errorBeep();setMessage(error.message)}else{successBeep();setMessage(`${data?.[0]?.product_name||lastScan.barcode}: counted ${data?.[0]?.counted_quantity}`);loadItems(activeId)}})()},[lastScan]);
+async function create(){const{data,error}=await supabase.rpc("create_stock_count",{p_notes:"Physical stock count"});setMessage(error?error.message:"Stock count started. Walk the store and scan each bottle.");if(!error){setActiveId(data);await load();await loadItems(data)}}
+async function setQty(item,q){const{error}=await supabase.rpc("set_stock_count_quantity",{p_stock_count_id:activeId,p_product_id:item.product_id,p_quantity:Number(q)});if(error)setMessage(error.message);else loadItems(activeId)}
+async function markZero(){if(!confirm("Mark every unscanned SKU as counted quantity ZERO? Use only after the physical count is complete."))return;const{data,error}=await supabase.rpc("mark_unseen_stock_count_zero",{p_stock_count_id:activeId});setMessage(error?error.message:`${data} unseen SKU(s) marked zero.`);if(!error)loadItems(activeId)}
+async function submit(){const{error}=await supabase.rpc("submit_stock_count",{p_stock_count_id:activeId});setMessage(error?error.message:"Count submitted for approval.");if(!error)load()}
+async function approve(){if(!confirm("Approve discrepancies and replace system stock with counted stock?"))return;const{error}=await supabase.rpc("approve_stock_count",{p_stock_count_id:activeId});setMessage(error?error.message:"Stock count approved; inventory adjusted and audited.");if(!error){await Promise.all([load(),refreshAll()])}}
+const active=counts.find((c)=>c.id===activeId);const summary=useMemo(()=>items.reduce((a,i)=>{a.total++;if(i.counted_quantity==null)a.unseen++;else if(i.counted_quantity===i.expected_quantity)a.match++;else if(i.counted_quantity<i.expected_quantity)a.short++;else a.excess++;a.diff+=i.counted_quantity==null?0:i.counted_quantity-i.expected_quantity;return a},{total:0,unseen:0,match:0,short:0,excess:0,diff:0}),[items]);
+return <div><div className="page-heading"><div><h2>Physical Stock Count</h2><p>Scan every bottle; the global scanner increments the active SKU count.</p></div>{!counts.some((c)=>["OPEN","SUBMITTED"].includes(c.status))&&<button className="primary-button" onClick={create}>Start Stock Count</button>}</div>{message&&<div className="purchase-message">{message}</div>}
+<div className="stats-grid"><div className="stat-card"><span>SKUs</span><strong>{summary.total}</strong></div><div className="stat-card"><span>Matched</span><strong>{summary.match}</strong></div><div className="stat-card"><span>Short</span><strong>{summary.short}</strong></div><div className="stat-card"><span>Excess</span><strong>{summary.excess}</strong></div><div className="stat-card"><span>Unseen</span><strong>{summary.unseen}</strong></div></div>
+<div className="panel" style={{marginTop:16}}><label>Count Session<select value={activeId} onChange={(e)=>setActiveId(e.target.value)}><option value="">Select</option>{counts.map((c)=><option key={c.id} value={c.id}>{c.count_number} · {c.status}</option>)}</select></label>{active&&<div className="button-row" style={{marginTop:10}}>{active.status==="OPEN"&&<><button className="secondary-button" onClick={markZero}>Mark Unseen = 0</button><button className="primary-button" onClick={submit}>Submit Count</button></>}{active.status==="SUBMITTED"&&<button className="primary-button" onClick={approve}>Approve & Adjust Inventory</button>}</div>}</div>
+<section className="panel" style={{marginTop:16}}><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>System</th><th>Counted</th><th>Difference</th></tr></thead><tbody>{items.map((i)=>{const p=products.find((p)=>p.id===i.product_id);const diff=i.counted_quantity==null?null:i.counted_quantity-i.expected_quantity;return <tr key={i.id}><td>{p?.name||i.product_id.slice(0,8)}</td><td>{i.expected_quantity}</td><td><input type="number" min="0" value={i.counted_quantity??""} placeholder="unseen" disabled={active?.status!=="OPEN"} onChange={(e)=>e.target.value!==""&&setQty(i,e.target.value)}/></td><td className={diff<0?"negative":diff>0?"positive":""}>{diff==null?"-":diff}</td></tr>})}</tbody></table></div></section></div>}
diff --git a/src/pages/Transfers.jsx b/src/pages/Transfers.jsx
new file mode 100644
index 0000000..85161e6
--- /dev/null
+++ b/src/pages/Transfers.jsx
@@ -0,0 +1,12 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import { useAuth } from "../context/AuthContext";
+
+export default function Transfers(){const{products,getStock,refreshAll}=useShop();const{profile}=useAuth();const[dest,setDest]=useState([]);const[transfers,setTransfers]=useState([]);const[destination,setDestination]=useState("");const[productId,setProductId]=useState("");const[qty,setQty]=useState(1);const[message,setMessage]=useState("");
+async function load(){const[d,t]=await Promise.all([supabase.rpc("available_transfer_destinations"),supabase.from("stock_transfers").select(`*,stock_transfer_items(*)`).order("created_at",{ascending:false}).limit(100)]);if(d.error)setMessage(d.error.message);else setDest(d.data||[]);if(t.error)setMessage(t.error.message);else setTransfers(t.data||[])}useEffect(()=>{load()},[]);
+async function create(e){e.preventDefault();const{error}=await supabase.rpc("create_stock_transfer",{p_destination_shop_id:destination,p_items:[{product_id:productId,quantity:Number(qty)}],p_notes:null});setMessage(error?error.message:"Transfer requested. Destination branch must approve before stock moves.");if(!error)load()}
+async function act(id,action){const fn=action==="approve"?"approve_stock_transfer":action==="reject"?"reject_stock_transfer":"cancel_stock_transfer";const args=action==="reject"?{p_transfer_id:id,p_note:"Rejected from transfer screen"}:{p_transfer_id:id};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Transfer ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
+return <div><div className="page-heading"><div><h2>Branch Stock Transfer</h2><p>Transfers are allowed only between shops in the same organization.</p></div></div>{message&&<div className="purchase-message">{message}</div>}
+<div className="settings-grid"><form className="panel" onSubmit={create}><h3>Request Transfer Out</h3>{dest.length===0?<p>No other branch is linked to this organization yet. Platform owner must create/link another shop first.</p>:<div className="settings-fields"><label>Destination<select value={destination} onChange={(e)=>setDestination(e.target.value)} required><option value="">Select branch</option>{dest.map((d)=><option key={d.shop_id} value={d.shop_id}>{d.shop_name}</option>)}</select></label><label>Product<select value={productId} onChange={(e)=>setProductId(e.target.value)} required><option value="">Select product</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name} · stock {getStock(p.id)}</option>)}</select></label><label>Quantity<input type="number" min="1" max={productId?getStock(productId):99999} value={qty} onChange={(e)=>setQty(e.target.value)} required/></label><button className="primary-button">Request Transfer</button></div>}</form><section className="panel"><h3>Safety Model</h3><p>Source request does not immediately deduct stock. Destination Manager/Admin approves. Approval re-checks source inventory under row lock and posts TRANSFER_OUT + TRANSFER_IN atomically.</p></section></div>
+<section className="panel" style={{marginTop:16}}><h3>Transfer Queue</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Created</th><th>Direction</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead><tbody>{transfers.map((t)=>{const incoming=t.destination_shop_id===profile?.shop_id;return <tr key={t.id}><td>{new Date(t.created_at).toLocaleString("en-IN")}</td><td>{incoming?"INCOMING":"OUTGOING"}</td><td>{(t.stock_transfer_items||[]).reduce((s,i)=>s+i.quantity,0)}</td><td>{t.status}</td><td>{t.status==="REQUESTED"&&incoming?<><button className="primary-button" onClick={()=>act(t.id,"approve")}>Approve</button> <button className="secondary-button" onClick={()=>act(t.id,"reject")}>Reject</button></>:t.status==="REQUESTED"&&!incoming?<button className="secondary-button" onClick={()=>act(t.id,"cancel")}>Cancel</button>:"-"}</td></tr>})}</tbody></table></div></section></div>}
diff --git a/supabase/functions/ocr-invoice/index.ts b/supabase/functions/ocr-invoice/index.ts
new file mode 100644
index 0000000..7f50ee8
--- /dev/null
+++ b/supabase/functions/ocr-invoice/index.ts
@@ -0,0 +1,184 @@
+import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
+
+const corsHeaders = {
+  "Access-Control-Allow-Origin": "*",
+  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
+};
+
+const json = (body: unknown, status = 200) =>
+  new Response(JSON.stringify(body), {
+    status,
+    headers: { ...corsHeaders, "Content-Type": "application/json" },
+  });
+
+function fieldContent(field: any) {
+  return (
+    field?.content ??
+    field?.valueString ??
+    field?.valueNumber ??
+    field?.valueDate ??
+    null
+  );
+}
+
+function numberValue(field: any) {
+  const value = field?.valueNumber ?? field?.valueCurrency?.amount ?? field?.content;
+  const number = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
+  return Number.isFinite(number) ? number : null;
+}
+
+function getSupabasePublicKey() {
+  const legacyAnon = Deno.env.get("SUPABASE_ANON_KEY");
+  if (legacyAnon) return legacyAnon;
+
+  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
+  if (raw) {
+    try {
+      const parsed = JSON.parse(raw);
+      if (parsed?.default) return parsed.default;
+      const first = Object.values(parsed ?? {}).find((value) => typeof value === "string");
+      if (first) return String(first);
+    } catch {
+      // continue to the explicit error below
+    }
+  }
+
+  throw new Error("Supabase publishable key is not available in Edge Function environment");
+}
+
+Deno.serve(async (req) => {
+  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
+
+  try {
+    const authHeader = req.headers.get("Authorization");
+    if (!authHeader) throw new Error("Missing authorization");
+
+    const supabaseUrl = Deno.env.get("SUPABASE_URL");
+    if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");
+
+    const client = createClient(supabaseUrl, getSupabasePublicKey(), {
+      global: { headers: { Authorization: authHeader } },
+    });
+
+    const {
+      data: { user },
+      error: userError,
+    } = await client.auth.getUser();
+
+    if (userError || !user) throw new Error("Invalid session");
+
+    const { data: profile, error: profileError } = await client
+      .from("profiles")
+      .select("role,active,shop_id")
+      .eq("id", user.id)
+      .single();
+
+    if (
+      profileError ||
+      !profile?.active ||
+      !["ADMIN", "MANAGER"].includes(profile.role)
+    ) {
+      throw new Error("Manager or Admin role required");
+    }
+
+    const endpoint = (Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT") || "").replace(/\/$/, "");
+    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY");
+
+    if (!endpoint || !key) {
+      return json(
+        {
+          ok: false,
+          code: "OCR_NOT_CONFIGURED",
+          message: "Azure Document Intelligence secrets are not configured yet.",
+        },
+        400,
+      );
+    }
+
+    const body = await req.json();
+    const contentBase64 = String(body?.contentBase64 || "");
+    if (!contentBase64) throw new Error("Document content is required");
+
+    // F0 supports up to 4 MB input. Base64 is larger than the binary input,
+    // so enforce an approximate decoded-size guard here as well as in React.
+    const estimatedBytes = Math.floor((contentBase64.length * 3) / 4);
+    if (estimatedBytes > 4 * 1024 * 1024) {
+      throw new Error("Document exceeds Azure Document Intelligence F0 4 MB limit");
+    }
+
+    const analyzeUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?_overload=analyzeDocument&api-version=2024-11-30`;
+
+    const analyze = await fetch(analyzeUrl, {
+      method: "POST",
+      headers: {
+        "Ocp-Apim-Subscription-Key": key,
+        "Content-Type": "application/json",
+      },
+      body: JSON.stringify({ base64Source: contentBase64 }),
+    });
+
+    if (!analyze.ok) {
+      throw new Error(`Azure OCR analyze failed: ${analyze.status} ${await analyze.text()}`);
+    }
+
+    const operation = analyze.headers.get("operation-location");
+    if (!operation) throw new Error("Azure OCR did not return operation-location");
+
+    let result: any = null;
+    for (let attempt = 0; attempt < 45; attempt += 1) {
+      await new Promise((resolve) => setTimeout(resolve, 1000));
+
+      const poll = await fetch(operation, {
+        headers: { "Ocp-Apim-Subscription-Key": key },
+      });
+
+      if (!poll.ok) throw new Error(`Azure OCR poll failed: ${poll.status}`);
+
+      result = await poll.json();
+      if (result.status === "succeeded") break;
+      if (result.status === "failed") {
+        throw new Error(
+          `Azure OCR analysis failed: ${JSON.stringify(result?.error || result)}`,
+        );
+      }
+    }
+
+    if (result?.status !== "succeeded") throw new Error("Azure OCR timed out");
+
+    const document = result.analyzeResult?.documents?.[0];
+    const fields = document?.fields || {};
+
+    const items = (fields.Items?.valueArray || []).map((row: any) => {
+      const item = row.valueObject || {};
+      return {
+        description: String(fieldContent(item.Description) || fieldContent(item.ProductCode) || ""),
+        quantity: numberValue(item.Quantity) ?? 1,
+        unitPrice: numberValue(item.UnitPrice),
+        amount: numberValue(item.Amount),
+        confidence: row.confidence ?? item.Description?.confidence ?? null,
+      };
+    });
+
+    return json({
+      ok: true,
+      invoice: {
+        supplierName: String(fieldContent(fields.VendorName) || ""),
+        invoiceNumber: String(fieldContent(fields.InvoiceId) || ""),
+        invoiceDate: String(fieldContent(fields.InvoiceDate) || ""),
+        total: numberValue(fields.InvoiceTotal),
+        items,
+      },
+      rawConfidence: document?.confidence ?? null,
+      model: "prebuilt-invoice",
+      apiVersion: "2024-11-30",
+    });
+  } catch (error) {
+    return json(
+      {
+        ok: false,
+        message: error instanceof Error ? error.message : String(error),
+      },
+      400,
+    );
+  }
+});
diff --git a/supabase/migrations/20260829190000_chapters_16_26.sql b/supabase/migrations/20260829190000_chapters_16_26.sql
new file mode 100644
index 0000000..0fdc0a5
--- /dev/null
+++ b/supabase/migrations/20260829190000_chapters_16_26.sql
@@ -0,0 +1,1482 @@
+-- WineShopPOS Chapters 16-26 production expansion
+-- Additive migration over the Chapter 15 schema.
+-- Designed for the existing multi-shop Supabase project.
+
+create extension if not exists pgcrypto;
+create extension if not exists pg_trgm;
+
+-- ============================================================
+-- CHAPTER 23 FOUNDATION: ORGANIZATIONS / BRANCH GROUPING
+-- Existing shops are isolated into separate organizations first.
+-- Shops may only transfer stock when they share organization_id.
+-- ============================================================
+create table if not exists public.organizations (
+  id uuid primary key default gen_random_uuid(),
+  name text not null,
+  active boolean not null default true,
+  created_at timestamptz not null default now(),
+  updated_at timestamptz not null default now()
+);
+
+alter table public.shops add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
+
+-- Reuse the Chapter 15 updated_at helper.
+drop trigger if exists trg_organizations_updated_at on public.organizations;
+create trigger trg_organizations_updated_at before update on public.organizations
+for each row execute function public.set_updated_at();
+
+do $$
+declare
+  r record;
+  v_org uuid;
+begin
+  for r in select id, name from public.shops where organization_id is null
+  loop
+    insert into public.organizations(name) values (r.name || ' Organization') returning id into v_org;
+    update public.shops set organization_id = v_org where id = r.id;
+  end loop;
+end $$;
+
+alter table public.shops alter column organization_id set not null;
+create index if not exists idx_shops_organization on public.shops(organization_id);
+
+create or replace function public.current_organization_id()
+returns uuid
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select s.organization_id
+  from public.shops s
+  where s.id = public.current_shop_id()
+  limit 1;
+$$;
+
+-- ============================================================
+-- EXISTING TABLE EXTENSIONS
+-- ============================================================
+alter table public.sales add column if not exists shift_id uuid;
+alter table public.sales add column if not exists client_sale_id uuid;
+alter table public.sales add column if not exists offline_created_at timestamptz;
+create unique index if not exists uq_sales_shop_client_sale
+  on public.sales(shop_id, client_sale_id)
+  where client_sale_id is not null;
+
+alter table public.purchases add column if not exists purchase_order_id uuid;
+
+alter table public.payments add column if not exists payment_type text not null default 'PAYMENT';
+alter table public.payments add column if not exists return_request_id uuid;
+alter table public.payments add column if not exists shift_id uuid;
+
+do $$ begin
+  alter table public.payments add constraint payments_payment_type_check
+    check (payment_type in ('PAYMENT','REFUND'));
+exception when duplicate_object then null; end $$;
+
+alter table public.shop_settings add column if not exists store_address text;
+alter table public.shop_settings add column if not exists store_phone text;
+alter table public.shop_settings add column if not exists tax_registration_number text;
+alter table public.shop_settings add column if not exists printer_paper_mm integer not null default 80;
+do $$ begin
+  alter table public.shop_settings add constraint shop_settings_printer_paper_check
+    check (printer_paper_mm in (58,80));
+exception when duplicate_object then null; end $$;
+
+alter table public.shop_counters add column if not exists po_counter bigint not null default 0;
+
+-- Extend stock movement type vocabulary safely.
+alter table public.stock_movements drop constraint if exists stock_movements_movement_type_check;
+alter table public.stock_movements add constraint stock_movements_movement_type_check
+  check (movement_type in (
+    'OPENING_STOCK','PURCHASE','SALE','CUSTOMER_RETURN','SUPPLIER_RETURN',
+    'DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION',
+    'SALE_VOID','STOCK_COUNT','TRANSFER_OUT','TRANSFER_IN','OFFLINE_SALE'
+  ));
+
+-- ============================================================
+-- CHAPTER 17: RETURN / REFUND REQUESTS
+-- ============================================================
+create table if not exists public.sale_return_requests (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  sale_id uuid not null references public.sales(id) on delete restrict,
+  requested_by uuid not null references auth.users(id) on delete restrict,
+  approved_by uuid references auth.users(id) on delete set null,
+  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
+  reason text not null,
+  refund_method text not null check (refund_method in ('CASH','UPI','CARD')),
+  refund_reference text,
+  total_refund numeric(14,2) not null default 0 check (total_refund >= 0),
+  created_at timestamptz not null default now(),
+  reviewed_at timestamptz
+);
+
+create table if not exists public.sale_return_items (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
+  sale_item_id uuid not null references public.sale_items(id) on delete restrict,
+  product_id uuid not null references public.products(id) on delete restrict,
+  quantity integer not null check (quantity > 0),
+  unit_refund numeric(12,2) not null check (unit_refund >= 0),
+  line_refund numeric(14,2) not null check (line_refund >= 0),
+  created_at timestamptz not null default now()
+);
+
+create index if not exists idx_return_requests_shop_sale on public.sale_return_requests(shop_id, sale_id, created_at desc);
+create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
+
+-- ============================================================
+-- CHAPTER 18: CASHIER SHIFT / DAY CLOSE
+-- ============================================================
+create table if not exists public.cashier_shifts (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  cashier_id uuid not null references auth.users(id) on delete restrict,
+  status text not null default 'OPEN' check (status in ('OPEN','CLOSE_REQUESTED','CLOSED','CANCELLED')),
+  opening_cash numeric(14,2) not null default 0 check (opening_cash >= 0),
+  cash_sales numeric(14,2) not null default 0,
+  upi_sales numeric(14,2) not null default 0,
+  card_sales numeric(14,2) not null default 0,
+  cash_refunds numeric(14,2) not null default 0,
+  expected_cash numeric(14,2) not null default 0,
+  actual_cash numeric(14,2),
+  cash_difference numeric(14,2),
+  opened_at timestamptz not null default now(),
+  close_requested_at timestamptz,
+  closed_at timestamptz,
+  approved_by uuid references auth.users(id) on delete set null,
+  notes text,
+  created_at timestamptz not null default now()
+);
+create unique index if not exists uq_cashier_open_shift
+  on public.cashier_shifts(shop_id, cashier_id)
+  where status in ('OPEN','CLOSE_REQUESTED');
+create index if not exists idx_shifts_shop_date on public.cashier_shifts(shop_id, opened_at desc);
+
+-- Foreign keys added after shift table exists.
+do $$ begin
+  alter table public.sales add constraint sales_shift_id_fkey foreign key (shift_id) references public.cashier_shifts(id) on delete set null;
+exception when duplicate_object then null; end $$;
+do $$ begin
+  alter table public.payments add constraint payments_shift_id_fkey foreign key (shift_id) references public.cashier_shifts(id) on delete set null;
+exception when duplicate_object then null; end $$;
+
+-- ============================================================
+-- CHAPTER 19: PHYSICAL STOCK COUNT
+-- ============================================================
+create table if not exists public.stock_counts (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  count_number text not null,
+  status text not null default 'OPEN' check (status in ('OPEN','SUBMITTED','APPROVED','CANCELLED')),
+  created_by uuid not null references auth.users(id) on delete restrict,
+  submitted_by uuid references auth.users(id) on delete set null,
+  approved_by uuid references auth.users(id) on delete set null,
+  notes text,
+  created_at timestamptz not null default now(),
+  submitted_at timestamptz,
+  approved_at timestamptz,
+  unique(shop_id, count_number)
+);
+
+create table if not exists public.stock_count_items (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  stock_count_id uuid not null references public.stock_counts(id) on delete cascade,
+  product_id uuid not null references public.products(id) on delete restrict,
+  expected_quantity integer not null check (expected_quantity >= 0),
+  counted_quantity integer,
+  difference integer generated always as (coalesce(counted_quantity, expected_quantity) - expected_quantity) stored,
+  first_scanned_at timestamptz,
+  last_scanned_at timestamptz,
+  unique(stock_count_id, product_id)
+);
+create index if not exists idx_stock_count_items_count on public.stock_count_items(stock_count_id);
+
+-- ============================================================
+-- CHAPTER 21: PROCUREMENT / SUPPLIER LEDGER
+-- ============================================================
+create table if not exists public.purchase_orders (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  po_number text not null,
+  supplier_id uuid not null references public.suppliers(id) on delete restrict,
+  status text not null default 'DRAFT' check (status in ('DRAFT','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED')),
+  expected_date date,
+  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
+  notes text,
+  created_by uuid not null references auth.users(id) on delete restrict,
+  created_at timestamptz not null default now(),
+  updated_at timestamptz not null default now(),
+  unique(shop_id, po_number)
+);
+drop trigger if exists trg_purchase_orders_updated_at on public.purchase_orders;
+create trigger trg_purchase_orders_updated_at before update on public.purchase_orders
+for each row execute function public.set_updated_at();
+
+create table if not exists public.purchase_order_items (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
+  product_id uuid not null references public.products(id) on delete restrict,
+  ordered_quantity integer not null check (ordered_quantity > 0),
+  received_quantity integer not null default 0 check (received_quantity >= 0),
+  purchase_price numeric(12,2) not null check (purchase_price >= 0),
+  line_total numeric(14,2) not null check (line_total >= 0)
+);
+create index if not exists idx_po_items_po on public.purchase_order_items(purchase_order_id);
+
+do $$ begin
+  alter table public.purchases add constraint purchases_purchase_order_id_fkey foreign key (purchase_order_id) references public.purchase_orders(id) on delete set null;
+exception when duplicate_object then null; end $$;
+
+create table if not exists public.supplier_payments (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  supplier_id uuid not null references public.suppliers(id) on delete restrict,
+  amount numeric(14,2) not null check (amount > 0),
+  payment_method text not null check (payment_method in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER')),
+  reference_number text,
+  payment_date date not null default current_date,
+  notes text,
+  created_by uuid not null references auth.users(id) on delete restrict,
+  created_at timestamptz not null default now()
+);
+create index if not exists idx_supplier_payments_supplier on public.supplier_payments(shop_id, supplier_id, payment_date desc);
+
+create table if not exists public.purchase_returns (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  supplier_id uuid not null references public.suppliers(id) on delete restrict,
+  purchase_id uuid references public.purchases(id) on delete set null,
+  status text not null default 'COMPLETED' check (status in ('COMPLETED','CANCELLED')),
+  reason text not null,
+  total numeric(14,2) not null default 0 check (total >= 0),
+  created_by uuid not null references auth.users(id) on delete restrict,
+  created_at timestamptz not null default now()
+);
+
+create table if not exists public.purchase_return_items (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  purchase_return_id uuid not null references public.purchase_returns(id) on delete cascade,
+  product_id uuid not null references public.products(id) on delete restrict,
+  quantity integer not null check (quantity > 0),
+  purchase_price numeric(12,2) not null check (purchase_price >= 0),
+  line_total numeric(14,2) not null check (line_total >= 0)
+);
+
+-- ============================================================
+-- CHAPTER 23: STOCK TRANSFERS
+-- ============================================================
+create table if not exists public.stock_transfers (
+  id uuid primary key default gen_random_uuid(),
+  organization_id uuid not null references public.organizations(id) on delete restrict,
+  source_shop_id uuid not null references public.shops(id) on delete restrict,
+  destination_shop_id uuid not null references public.shops(id) on delete restrict,
+  status text not null default 'REQUESTED' check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED')),
+  requested_by uuid not null references auth.users(id) on delete restrict,
+  approved_by uuid references auth.users(id) on delete set null,
+  notes text,
+  created_at timestamptz not null default now(),
+  reviewed_at timestamptz,
+  check(source_shop_id <> destination_shop_id)
+);
+
+create table if not exists public.stock_transfer_items (
+  id uuid primary key default gen_random_uuid(),
+  transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
+  source_product_id uuid not null references public.products(id) on delete restrict,
+  destination_product_id uuid references public.products(id) on delete restrict,
+  quantity integer not null check (quantity > 0)
+);
+create index if not exists idx_transfers_source on public.stock_transfers(source_shop_id, created_at desc);
+create index if not exists idx_transfers_destination on public.stock_transfers(destination_shop_id, created_at desc);
+
+-- ============================================================
+-- CHAPTER 24: AUDIT LOG
+-- ============================================================
+create table if not exists public.audit_logs (
+  id bigserial primary key,
+  shop_id uuid references public.shops(id) on delete cascade,
+  organization_id uuid references public.organizations(id) on delete cascade,
+  actor_id uuid references auth.users(id) on delete set null,
+  action text not null,
+  entity_type text not null,
+  entity_id text,
+  old_data jsonb,
+  new_data jsonb,
+  metadata jsonb not null default '{}'::jsonb,
+  created_at timestamptz not null default now()
+);
+create index if not exists idx_audit_shop_time on public.audit_logs(shop_id, created_at desc);
+create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id, created_at desc);
+
+-- ============================================================
+-- CHAPTER 26: OCR PRODUCT ALIASES
+-- ============================================================
+create table if not exists public.product_aliases (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  product_id uuid not null references public.products(id) on delete cascade,
+  supplier_id uuid references public.suppliers(id) on delete cascade,
+  alias_text text not null,
+  normalized_alias text generated always as (lower(regexp_replace(alias_text, '[^a-zA-Z0-9]+', ' ', 'g'))) stored,
+  created_by uuid references auth.users(id) on delete set null,
+  created_at timestamptz not null default now(),
+  unique(shop_id, supplier_id, alias_text)
+);
+create index if not exists idx_product_aliases_trgm on public.product_aliases using gin (normalized_alias gin_trgm_ops);
+
+-- ============================================================
+-- GENERIC AUDIT HELPERS / TRIGGERS
+-- ============================================================
+create or replace function public.write_audit(
+  p_shop_id uuid,
+  p_action text,
+  p_entity_type text,
+  p_entity_id text,
+  p_old_data jsonb default null,
+  p_new_data jsonb default null,
+  p_metadata jsonb default '{}'::jsonb
+)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_org uuid;
+begin
+  select organization_id into v_org from public.shops where id = p_shop_id;
+  insert into public.audit_logs(shop_id, organization_id, actor_id, action, entity_type, entity_id, old_data, new_data, metadata)
+  values (p_shop_id, v_org, auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, coalesce(p_metadata,'{}'::jsonb));
+end;
+$$;
+
+create or replace function public.audit_row_changes()
+returns trigger
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid;
+  v_old jsonb;
+  v_new jsonb;
+  v_id text;
+begin
+  if tg_op = 'INSERT' then
+    v_new := to_jsonb(new);
+    v_shop := (v_new->>'shop_id')::uuid;
+    v_id := v_new->>'id';
+    perform public.write_audit(v_shop, 'CREATE', tg_table_name, v_id, null, v_new, jsonb_build_object('trigger', true));
+    return new;
+  elsif tg_op = 'UPDATE' then
+    v_old := to_jsonb(old);
+    v_new := to_jsonb(new);
+    v_shop := coalesce((v_new->>'shop_id')::uuid, (v_old->>'shop_id')::uuid);
+    v_id := coalesce(v_new->>'id', v_old->>'id');
+    if v_old is distinct from v_new then
+      perform public.write_audit(v_shop, 'UPDATE', tg_table_name, v_id, v_old, v_new, jsonb_build_object('trigger', true));
+    end if;
+    return new;
+  else
+    v_old := to_jsonb(old);
+    v_shop := (v_old->>'shop_id')::uuid;
+    v_id := v_old->>'id';
+    perform public.write_audit(v_shop, 'DELETE', tg_table_name, v_id, v_old, null, jsonb_build_object('trigger', true));
+    return old;
+  end if;
+end;
+$$;
+
+drop trigger if exists trg_audit_products on public.products;
+create trigger trg_audit_products after insert or update or delete on public.products
+for each row execute function public.audit_row_changes();
+
+drop trigger if exists trg_audit_suppliers on public.suppliers;
+create trigger trg_audit_suppliers after insert or update or delete on public.suppliers
+for each row execute function public.audit_row_changes();
+
+drop trigger if exists trg_audit_sales on public.sales;
+create trigger trg_audit_sales after insert or update on public.sales
+for each row execute function public.audit_row_changes();
+
+drop trigger if exists trg_audit_purchases on public.purchases;
+create trigger trg_audit_purchases after insert or update on public.purchases
+for each row execute function public.audit_row_changes();
+
+-- ============================================================
+-- SECURE PRODUCT READ / WRITE API
+-- Cashiers get purchase_price = NULL; managers/admins get the real value.
+-- ============================================================
+create or replace function public.get_products()
+returns table (
+  id uuid,
+  shop_id uuid,
+  barcode text,
+  sku text,
+  product_name text,
+  brand text,
+  category_id uuid,
+  category_name text,
+  subcategory text,
+  size_ml integer,
+  alcohol_percentage numeric,
+  purchase_price numeric,
+  mrp numeric,
+  selling_price numeric,
+  minimum_stock integer,
+  units_per_case integer,
+  active boolean,
+  created_at timestamptz,
+  updated_at timestamptz
+)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select p.id, p.shop_id, p.barcode, p.sku, p.product_name, p.brand,
+         p.category_id, c.name,
+         p.subcategory, p.size_ml, p.alcohol_percentage,
+         case when public.current_user_role() in ('ADMIN','MANAGER') then p.purchase_price else null end,
+         p.mrp, p.selling_price, p.minimum_stock, p.units_per_case, p.active,
+         p.created_at, p.updated_at
+  from public.products p
+  left join public.categories c on c.id = p.category_id
+  where p.shop_id = public.assert_shop_access()
+  order by p.product_name;
+$$;
+
+create or replace function public.update_product_details(
+  p_product_id uuid,
+  p_barcode text,
+  p_sku text,
+  p_product_name text,
+  p_brand text,
+  p_category_id uuid,
+  p_subcategory text,
+  p_size_ml integer,
+  p_alcohol_percentage numeric,
+  p_purchase_price numeric,
+  p_mrp numeric,
+  p_selling_price numeric,
+  p_minimum_stock integer,
+  p_units_per_case integer
+)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+  update public.products set
+    barcode = trim(p_barcode), sku = upper(trim(p_sku)), product_name = trim(p_product_name),
+    brand = trim(p_brand), category_id = p_category_id, subcategory = nullif(trim(p_subcategory),''),
+    size_ml = p_size_ml, alcohol_percentage = p_alcohol_percentage,
+    purchase_price = p_purchase_price, mrp = p_mrp, selling_price = p_selling_price,
+    minimum_stock = p_minimum_stock, units_per_case = p_units_per_case
+  where id = p_product_id and shop_id = v_shop;
+  if not found then raise exception 'Product not found'; end if;
+end;
+$$;
+
+create or replace function public.set_product_active(p_product_id uuid, p_active boolean)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+  update public.products set active = p_active where id = p_product_id and shop_id = v_shop;
+  if not found then raise exception 'Product not found'; end if;
+end;
+$$;
+
+-- ============================================================
+-- CHAPTER 17 RPCs
+-- ============================================================
+create or replace function public.create_return_request(
+  p_sale_id uuid,
+  p_items jsonb,
+  p_reason text,
+  p_refund_method text,
+  p_refund_reference text default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid;
+  v_request uuid;
+  v_sale public.sales%rowtype;
+  v_item jsonb;
+  v_sale_item public.sale_items%rowtype;
+  v_qty integer;
+  v_already integer;
+  v_factor numeric := 1;
+  v_unit_refund numeric(12,2);
+  v_total numeric(14,2) := 0;
+begin
+  v_shop := public.assert_shop_access();
+  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Return items required'; end if;
+  if nullif(trim(p_reason),'') is null then raise exception 'Return reason required'; end if;
+  if p_refund_method not in ('CASH','UPI','CARD') then raise exception 'Invalid refund method'; end if;
+
+  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop;
+  if not found then raise exception 'Sale not found'; end if;
+  if v_sale.status = 'VOID' then raise exception 'Voided sale cannot be returned'; end if;
+  if v_sale.subtotal > 0 then v_factor := v_sale.grand_total / v_sale.subtotal; end if;
+
+  insert into public.sale_return_requests(shop_id,sale_id,requested_by,reason,refund_method,refund_reference)
+  values(v_shop,p_sale_id,auth.uid(),trim(p_reason),p_refund_method,p_refund_reference)
+  returning id into v_request;
+
+  for v_item in select * from jsonb_array_elements(p_items)
+  loop
+    v_qty := coalesce((v_item->>'quantity')::integer,0);
+    if v_qty <= 0 then raise exception 'Return quantity must be positive'; end if;
+    select * into v_sale_item from public.sale_items
+    where id=(v_item->>'sale_item_id')::uuid and sale_id=p_sale_id and shop_id=v_shop;
+    if not found then raise exception 'Sale item not found'; end if;
+
+    select coalesce(sum(sri.quantity),0) into v_already
+    from public.sale_return_items sri
+    join public.sale_return_requests rr on rr.id=sri.return_request_id
+    where sri.sale_item_id=v_sale_item.id and rr.status in ('PENDING','APPROVED');
+
+    if v_already + v_qty > v_sale_item.quantity then raise exception 'Return quantity exceeds remaining sold quantity'; end if;
+    v_unit_refund := round(v_sale_item.unit_price * v_factor, 2);
+    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
+    values(v_shop,v_request,v_sale_item.id,v_sale_item.product_id,v_qty,v_unit_refund,round(v_unit_refund*v_qty,2));
+    v_total := v_total + round(v_unit_refund*v_qty,2);
+  end loop;
+
+  update public.sale_return_requests set total_refund=v_total where id=v_request;
+  perform public.write_audit(v_shop,'RETURN_REQUESTED','sale_return_request',v_request::text,null,null,
+    jsonb_build_object('sale_id',p_sale_id,'refund',v_total,'reason',p_reason));
+  return v_request;
+end;
+$$;
+
+create or replace function public.approve_return_request(p_request_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid;
+  v_req public.sale_return_requests%rowtype;
+  r record;
+  v_before integer;
+  v_after integer;
+  v_sold integer;
+  v_returned integer;
+  v_shift uuid;
+begin
+  v_shop := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
+  if not found then raise exception 'Return request not found'; end if;
+  if v_req.status <> 'PENDING' then raise exception 'Return request already reviewed'; end if;
+
+  for r in select * from public.sale_return_items where return_request_id=p_request_id
+  loop
+    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
+    if v_before is null then v_before := 0; insert into public.inventory(shop_id,product_id,quantity) values(v_shop,r.product_id,0) on conflict do nothing; end if;
+    v_after := v_before + r.quantity;
+    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
+  end loop;
+
+  select shift_id into v_shift from public.sales where id=v_req.sale_id;
+  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
+  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
+
+  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
+
+  select coalesce(sum(si.quantity),0) into v_sold from public.sale_items si where si.sale_id=v_req.sale_id;
+  select coalesce(sum(sri.quantity),0) into v_returned
+  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
+  where rr.sale_id=v_req.sale_id and rr.status='APPROVED';
+  update public.sales
+  set status=case when v_returned >= v_sold then 'RETURNED' else 'PARTIAL_RETURN' end,
+      payment_status=case when v_returned >= v_sold then 'REFUNDED' else payment_status end
+  where id=v_req.sale_id;
+
+  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
+end;
+$$;
+
+create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+  update public.sale_return_requests set status='REJECTED',approved_by=auth.uid(),reviewed_at=now(),reason=reason || case when nullif(trim(p_note),'') is null then '' else E'\nReview: '||trim(p_note) end
+  where id=p_request_id and shop_id=v_shop and status='PENDING';
+  if not found then raise exception 'Pending return request not found'; end if;
+  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
+end;
+$$;
+
+create or replace function public.void_sale(p_sale_id uuid, p_reason text, p_refund_method text default 'CASH', p_refund_reference text default null)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid;
+  v_sale public.sales%rowtype;
+  r record;
+  v_before integer;
+  v_after integer;
+begin
+  v_shop := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop for update;
+  if not found then raise exception 'Sale not found'; end if;
+  if v_sale.status <> 'COMPLETED' then raise exception 'Only a clean completed sale can be voided'; end if;
+  if exists(select 1 from public.sale_return_requests where sale_id=p_sale_id and status in ('PENDING','APPROVED')) then raise exception 'Sale has return activity; use return workflow'; end if;
+  if nullif(trim(p_reason),'') is null then raise exception 'Void reason required'; end if;
+
+  for r in select * from public.sale_items where sale_id=p_sale_id
+  loop
+    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
+    v_before := coalesce(v_before,0); v_after := v_before + r.quantity;
+    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_shop,r.product_id,'SALE_VOID',r.quantity,v_before,v_after,'SALE',p_sale_id,trim(p_reason),auth.uid());
+  end loop;
+
+  update public.sales set status='VOID',payment_status='REFUNDED',notes=concat_ws(E'\n',notes,'VOID: '||trim(p_reason)) where id=p_sale_id;
+  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
+  values(v_shop,p_sale_id,p_refund_method,v_sale.grand_total,p_refund_reference,'REFUND',v_sale.shift_id);
+  perform public.write_audit(v_shop,'SALE_VOIDED','sale',p_sale_id::text,to_jsonb(v_sale),null,jsonb_build_object('reason',p_reason,'refund',v_sale.grand_total));
+end;
+$$;
+
+-- ============================================================
+-- CHAPTER 18 RPCs
+-- ============================================================
+create or replace function public.open_shift(p_opening_cash numeric, p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_id uuid;
+begin
+  v_shop := public.assert_shop_access();
+  if p_opening_cash < 0 then raise exception 'Opening cash cannot be negative'; end if;
+  if exists(select 1 from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')) then raise exception 'You already have an active shift'; end if;
+  insert into public.cashier_shifts(shop_id,cashier_id,opening_cash,expected_cash,notes)
+  values(v_shop,auth.uid(),p_opening_cash,p_opening_cash,p_notes) returning id into v_id;
+  perform public.write_audit(v_shop,'SHIFT_OPENED','cashier_shift',v_id::text,null,null,jsonb_build_object('opening_cash',p_opening_cash));
+  return v_id;
+end;
+$$;
+
+create or replace function public.my_open_shift()
+returns setof public.cashier_shifts
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select * from public.cashier_shifts
+  where shop_id=public.assert_shop_access() and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')
+  order by opened_at desc limit 1;
+$$;
+
+create or replace function public.shift_totals(p_shift_id uuid)
+returns table(cash_sales numeric, upi_sales numeric, card_sales numeric, cash_refunds numeric, expected_cash numeric)
+language plpgsql
+stable
+security definer
+set search_path = public
+as $$
+declare v_shift public.cashier_shifts%rowtype;
+begin
+  select * into v_shift from public.cashier_shifts where id=p_shift_id and shop_id=public.assert_shop_access();
+  if not found then raise exception 'Shift not found'; end if;
+  return query
+  select
+    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount else 0 end),0),
+    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='UPI' then p.amount else 0 end),0),
+    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CARD' then p.amount else 0 end),0),
+    coalesce(sum(case when p.payment_type='REFUND' and p.payment_method='CASH' then p.amount else 0 end),0),
+    v_shift.opening_cash + coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount when p.payment_type='REFUND' and p.payment_method='CASH' then -p.amount else 0 end),0)
+  from public.payments p where p.shift_id=p_shift_id;
+end;
+$$;
+
+create or replace function public.request_close_shift(p_actual_cash numeric, p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid; v_shift public.cashier_shifts%rowtype; v_cash numeric; v_upi numeric; v_card numeric; v_ref numeric; v_expected numeric;
+begin
+  v_shop := public.assert_shop_access();
+  if p_actual_cash < 0 then raise exception 'Actual cash cannot be negative'; end if;
+  select * into v_shift from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN' order by opened_at desc limit 1 for update;
+  if not found then raise exception 'No open shift'; end if;
+  select * into v_cash,v_upi,v_card,v_ref,v_expected from public.shift_totals(v_shift.id);
+  update public.cashier_shifts set status='CLOSE_REQUESTED', cash_sales=v_cash,upi_sales=v_upi,card_sales=v_card,cash_refunds=v_ref,expected_cash=v_expected,actual_cash=p_actual_cash,cash_difference=p_actual_cash-v_expected,close_requested_at=now(),notes=concat_ws(E'\n',notes,p_notes)
+  where id=v_shift.id;
+  perform public.write_audit(v_shop,'SHIFT_CLOSE_REQUESTED','cashier_shift',v_shift.id::text,null,null,jsonb_build_object('actual_cash',p_actual_cash,'expected_cash',v_expected));
+  return v_shift.id;
+end;
+$$;
+
+create or replace function public.approve_shift_close(p_shift_id uuid, p_notes text default null)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  update public.cashier_shifts set status='CLOSED',approved_by=auth.uid(),closed_at=now(),notes=concat_ws(E'\n',notes,p_notes)
+  where id=p_shift_id and shop_id=v_shop and status='CLOSE_REQUESTED';
+  if not found then raise exception 'Close request not found'; end if;
+  perform public.write_audit(v_shop,'SHIFT_CLOSED','cashier_shift',p_shift_id::text,null,null,jsonb_build_object('note',p_notes));
+end;
+$$;
+
+-- ============================================================
+-- CHAPTER 19 RPCs
+-- ============================================================
+create or replace function public.create_stock_count(p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_id uuid; v_num text;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if exists(select 1 from public.stock_counts where shop_id=v_shop and status in ('OPEN','SUBMITTED')) then raise exception 'An active stock count already exists'; end if;
+  v_num := 'SC-' || to_char(now(),'YYYYMMDD-HH24MISS');
+  insert into public.stock_counts(shop_id,count_number,created_by,notes) values(v_shop,v_num,auth.uid(),p_notes) returning id into v_id;
+  insert into public.stock_count_items(shop_id,stock_count_id,product_id,expected_quantity)
+  select v_shop,v_id,p.id,coalesce(i.quantity,0)
+  from public.products p left join public.inventory i on i.shop_id=v_shop and i.product_id=p.id
+  where p.shop_id=v_shop and p.active=true;
+  perform public.write_audit(v_shop,'STOCK_COUNT_CREATED','stock_count',v_id::text,null,null,jsonb_build_object('count_number',v_num));
+  return v_id;
+end;
+$$;
+
+create or replace function public.stock_count_scan(p_stock_count_id uuid, p_barcode text)
+returns table(product_id uuid, product_name text, expected_quantity integer, counted_quantity integer)
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_product uuid;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count is not open'; end if;
+  select id into v_product from public.products where shop_id=v_shop and barcode=trim(p_barcode) and active=true;
+  if v_product is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
+  update public.stock_count_items
+  set counted_quantity=coalesce(counted_quantity,0)+1,first_scanned_at=coalesce(first_scanned_at,now()),last_scanned_at=now()
+  where stock_count_id=p_stock_count_id and product_id=v_product;
+  return query select p.id,p.product_name,sci.expected_quantity,sci.counted_quantity
+  from public.stock_count_items sci join public.products p on p.id=sci.product_id
+  where sci.stock_count_id=p_stock_count_id and sci.product_id=v_product;
+end;
+$$;
+
+create or replace function public.set_stock_count_quantity(p_stock_count_id uuid, p_product_id uuid, p_quantity integer)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if p_quantity < 0 then raise exception 'Count cannot be negative'; end if;
+  update public.stock_count_items set counted_quantity=p_quantity,last_scanned_at=now(),first_scanned_at=coalesce(first_scanned_at,now())
+  where stock_count_id=p_stock_count_id and product_id=p_product_id and shop_id=v_shop
+    and exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN');
+  if not found then raise exception 'Open stock count item not found'; end if;
+end;
+$$;
+
+create or replace function public.mark_unseen_stock_count_zero(p_stock_count_id uuid)
+returns integer
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_count integer;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count not open'; end if;
+  update public.stock_count_items set counted_quantity=0 where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null;
+  get diagnostics v_count = row_count; return v_count;
+end;
+$$;
+
+create or replace function public.submit_stock_count(p_stock_count_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if exists(select 1 from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null) then raise exception 'Uncounted SKUs remain. Scan them or explicitly mark unseen SKUs as zero.'; end if;
+  update public.stock_counts set status='SUBMITTED',submitted_by=auth.uid(),submitted_at=now() where id=p_stock_count_id and shop_id=v_shop and status='OPEN';
+  if not found then raise exception 'Open stock count not found'; end if;
+end;
+$$;
+
+create or replace function public.approve_stock_count(p_stock_count_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; r record; v_before integer; v_after integer; v_adj uuid;
+begin
+  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='SUBMITTED') then raise exception 'Submitted stock count not found'; end if;
+  for r in select * from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is distinct from expected_quantity
+  loop
+    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
+    v_before := coalesce(v_before,0); v_after := r.counted_quantity;
+    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
+    insert into public.stock_adjustments(shop_id,product_id,adjustment_type,quantity_change,reason,notes,created_by)
+    values(v_shop,r.product_id,'STOCK_CORRECTION',v_after-v_before,'Approved physical stock count','Stock count '||p_stock_count_id,auth.uid()) returning id into v_adj;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_shop,r.product_id,'STOCK_COUNT',v_after-v_before,v_before,v_after,'STOCK_COUNT',p_stock_count_id,'Approved physical count',auth.uid());
+  end loop;
+  update public.stock_counts set status='APPROVED',approved_by=auth.uid(),approved_at=now() where id=p_stock_count_id;
+  perform public.write_audit(v_shop,'STOCK_COUNT_APPROVED','stock_count',p_stock_count_id::text,null,null,'{}'::jsonb);
+end;
+$$;
+
+-- ============================================================
+-- CHAPTER 21 RPCs
+-- ============================================================
+create or replace function public.next_po_number(p_shop_id uuid)
+returns text
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_counter bigint;
+begin
+  insert into public.shop_counters(shop_id) values(p_shop_id) on conflict(shop_id) do nothing;
+  update public.shop_counters set po_counter=po_counter+1 where shop_id=p_shop_id returning po_counter into v_counter;
+  return 'PO-'||to_char(current_date,'YYYY')||'-'||lpad(v_counter::text,6,'0');
+end;
+$$;
+
+create or replace function public.create_purchase_order(p_supplier_id uuid, p_items jsonb, p_expected_date date default null, p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_id uuid; v_num text; v_item jsonb; v_product uuid; v_qty integer; v_price numeric; v_total numeric:=0;
+begin
+  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop and active=true) then raise exception 'Invalid supplier'; end if;
+  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'PO items required'; end if;
+  v_num:=public.next_po_number(v_shop);
+  insert into public.purchase_orders(shop_id,po_number,supplier_id,expected_date,notes,created_by)
+  values(v_shop,v_num,p_supplier_id,p_expected_date,p_notes,auth.uid()) returning id into v_id;
+  for v_item in select * from jsonb_array_elements(p_items) loop
+    v_product:=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'quantity')::integer; v_price:=(v_item->>'purchase_price')::numeric;
+    if v_qty<=0 or v_price<0 then raise exception 'Invalid PO item'; end if;
+    if not exists(select 1 from public.products where id=v_product and shop_id=v_shop and active=true) then raise exception 'Invalid product'; end if;
+    insert into public.purchase_order_items(shop_id,purchase_order_id,product_id,ordered_quantity,purchase_price,line_total)
+    values(v_shop,v_id,v_product,v_qty,v_price,v_qty*v_price);
+    v_total:=v_total+v_qty*v_price;
+  end loop;
+  update public.purchase_orders set subtotal=v_total where id=v_id;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_CREATED','purchase_order',v_id::text,null,null,jsonb_build_object('po_number',v_num,'total',v_total));
+  return v_id;
+end;
+$$;
+
+create or replace function public.set_purchase_order_status(p_po_id uuid, p_status text)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if p_status not in ('SENT','CANCELLED') then raise exception 'Only SENT/CANCELLED status may be set manually'; end if;
+  update public.purchase_orders set status=p_status where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT');
+  if not found then raise exception 'Purchase order cannot be changed'; end if;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_'||p_status,'purchase_order',p_po_id::text,null,null,'{}'::jsonb);
+end;
+$$;
+
+create or replace function public.receive_purchase_order(
+  p_po_id uuid,
+  p_invoice_number text,
+  p_invoice_date date,
+  p_receive_items jsonb default null,
+  p_notes text default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid; v_po public.purchase_orders%rowtype; r record; v_payload jsonb:='[]'::jsonb; v_qty integer; v_remaining integer; v_purchase uuid; v_all_received boolean;
+begin
+  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
+  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT','PARTIALLY_RECEIVED') for update;
+  if not found then raise exception 'Receivable purchase order not found'; end if;
+
+  if p_receive_items is null then
+    for r in select * from public.purchase_order_items where purchase_order_id=p_po_id loop
+      v_remaining:=r.ordered_quantity-r.received_quantity;
+      if v_remaining>0 then
+        v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_remaining,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_remaining,'po_item_id',r.id));
+      end if;
+    end loop;
+  else
+    for r in select poi.*, x.qty from public.purchase_order_items poi join lateral (
+      select (e->>'po_item_id')::uuid id,(e->>'quantity')::integer qty from jsonb_array_elements(p_receive_items) e
+    ) x on x.id=poi.id where poi.purchase_order_id=p_po_id
+    loop
+      v_remaining:=r.ordered_quantity-r.received_quantity; v_qty:=r.qty;
+      if v_qty<=0 or v_qty>v_remaining then raise exception 'Invalid receive quantity'; end if;
+      v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_qty,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_qty,'po_item_id',r.id));
+    end loop;
+  end if;
+
+  if jsonb_array_length(v_payload)=0 then raise exception 'Nothing remaining to receive'; end if;
+  v_purchase:=public.receive_purchase(v_po.supplier_id,p_invoice_number,p_invoice_date,v_payload,p_notes);
+  update public.purchases set purchase_order_id=p_po_id where id=v_purchase;
+
+  for r in select * from jsonb_array_elements(v_payload) loop
+    update public.purchase_order_items set received_quantity=received_quantity+(r->>'quantity')::integer where id=(r->>'po_item_id')::uuid;
+  end loop;
+  select not exists(select 1 from public.purchase_order_items where purchase_order_id=p_po_id and received_quantity<ordered_quantity) into v_all_received;
+  update public.purchase_orders set status=case when v_all_received then 'RECEIVED' else 'PARTIALLY_RECEIVED' end where id=p_po_id;
+  return v_purchase;
+end;
+$$;
+
+create or replace function public.record_supplier_payment(p_supplier_id uuid,p_amount numeric,p_payment_method text,p_reference text default null,p_payment_date date default current_date,p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_id uuid;
+begin
+  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if p_amount<=0 then raise exception 'Payment must be positive'; end if;
+  if p_payment_method not in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER') then raise exception 'Invalid payment method'; end if;
+  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop) then raise exception 'Supplier not found'; end if;
+  insert into public.supplier_payments(shop_id,supplier_id,amount,payment_method,reference_number,payment_date,notes,created_by)
+  values(v_shop,p_supplier_id,p_amount,p_payment_method,p_reference,coalesce(p_payment_date,current_date),p_notes,auth.uid()) returning id into v_id;
+  perform public.write_audit(v_shop,'SUPPLIER_PAYMENT','supplier_payment',v_id::text,null,null,jsonb_build_object('supplier_id',p_supplier_id,'amount',p_amount));
+  return v_id;
+end;
+$$;
+
+create or replace function public.create_purchase_return(p_supplier_id uuid,p_items jsonb,p_reason text,p_purchase_id uuid default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid; v_id uuid; v_item jsonb; v_product uuid; v_qty integer; v_price numeric; v_before integer; v_after integer; v_total numeric:=0;
+begin
+  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
+  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Return items required'; end if;
+  insert into public.purchase_returns(shop_id,supplier_id,purchase_id,reason,created_by) values(v_shop,p_supplier_id,p_purchase_id,trim(p_reason),auth.uid()) returning id into v_id;
+  for v_item in select * from jsonb_array_elements(p_items) loop
+    v_product:=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'quantity')::integer; v_price:=(v_item->>'purchase_price')::numeric;
+    if v_qty<=0 then raise exception 'Invalid return quantity'; end if;
+    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
+    if v_before is null or v_before<v_qty then raise exception 'Insufficient stock for supplier return'; end if;
+    v_after:=v_before-v_qty; update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
+    insert into public.purchase_return_items(shop_id,purchase_return_id,product_id,quantity,purchase_price,line_total)
+    values(v_shop,v_id,v_product,v_qty,v_price,v_qty*v_price);
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_shop,v_product,'SUPPLIER_RETURN',-v_qty,v_before,v_after,'PURCHASE_RETURN',v_id,p_reason,auth.uid());
+    v_total:=v_total+v_qty*v_price;
+  end loop;
+  update public.purchase_returns set total=v_total where id=v_id;
+  perform public.write_audit(v_shop,'PURCHASE_RETURN','purchase_return',v_id::text,null,null,jsonb_build_object('total',v_total));
+  return v_id;
+end;
+$$;
+
+create or replace function public.supplier_balances()
+returns table(supplier_id uuid,supplier_name text,purchases numeric,payments numeric,returns numeric,balance numeric)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access()),
+  p as (select supplier_id,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' group by supplier_id),
+  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() group by supplier_id),
+  pr as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' group by supplier_id)
+  select s.id,s.supplier_name,coalesce(p.total,0),coalesce(pay.total,0),coalesce(pr.total,0),coalesce(p.total,0)-coalesce(pay.total,0)-coalesce(pr.total,0)
+  from s left join p on p.supplier_id=s.id left join pay on pay.supplier_id=s.id left join pr on pr.supplier_id=s.id order by s.supplier_name;
+$$;
+
+create or replace function public.purchase_price_history(p_product_id uuid,p_limit integer default 12)
+returns table(invoice_date date,supplier_name text,purchase_price numeric,quantity integer)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select pu.invoice_date,pu.supplier_name_snapshot,pi.purchase_price,pi.quantity
+  from public.purchase_items pi join public.purchases pu on pu.id=pi.purchase_id
+  where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and pu.status='RECEIVED'
+  order by pu.invoice_date desc,pu.created_at desc limit greatest(1,least(p_limit,100));
+$$;
+
+-- ============================================================
+-- CHAPTER 22: SMART REORDERING
+-- ============================================================
+create or replace function public.reorder_suggestions(p_history_days integer default 30,p_target_days integer default 7)
+returns table(product_id uuid,barcode text,product_name text,current_stock integer,minimum_stock integer,units_per_case integer,units_sold integer,avg_daily numeric,days_remaining numeric,suggested_bottles integer,suggested_cases integer)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  with base as (
+    select p.id,p.barcode,p.product_name,p.minimum_stock,p.units_per_case,coalesce(i.quantity,0) stock
+    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
+    where p.shop_id=public.assert_shop_access() and p.active=true
+  ), sold as (
+    select si.product_id,coalesce(sum(si.quantity),0)::int units
+    from public.sale_items si join public.sales s on s.id=si.sale_id
+    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED') and s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval
+    group by si.product_id
+  ), calc as (
+    select b.*,coalesce(s.units,0) units,
+      round(coalesce(s.units,0)::numeric/greatest(p_history_days,1),2) avgd
+    from base b left join sold s on s.product_id=b.id
+  )
+  select id,barcode,product_name,stock,minimum_stock,units_per_case,units,avgd,
+    case when avgd>0 then round(stock/avgd,1) else null end,
+    greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))::int,
+    case when greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))=0 then 0
+         else ceil(greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))::numeric/greatest(units_per_case,1))::int end
+  from calc
+  where stock<=minimum_stock or (avgd>0 and stock/avgd<=p_target_days)
+  order by case when avgd>0 then stock/avgd else 999999 end,stock;
+$$;
+
+-- ============================================================
+-- CHAPTER 23: TRANSFER RPCs
+-- ============================================================
+create or replace function public.available_transfer_destinations()
+returns table(shop_id uuid,shop_name text)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select s.id,s.name from public.shops s
+  where s.organization_id=public.current_organization_id() and s.id<>public.assert_shop_access() and s.active=true and s.access_enabled=true
+  order by s.name;
+$$;
+
+create or replace function public.create_stock_transfer(p_destination_shop_id uuid,p_items jsonb,p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_source uuid; v_org uuid; v_id uuid; v_item jsonb; v_product uuid; v_qty integer;
+begin
+  v_source:=public.assert_shop_access(); perform public.assert_manager_or_admin(); v_org:=public.current_organization_id();
+  if not exists(select 1 from public.shops where id=p_destination_shop_id and organization_id=v_org and id<>v_source and active=true) then raise exception 'Destination is not a branch in this organization'; end if;
+  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Transfer items required'; end if;
+  insert into public.stock_transfers(organization_id,source_shop_id,destination_shop_id,requested_by,notes)
+  values(v_org,v_source,p_destination_shop_id,auth.uid(),p_notes) returning id into v_id;
+  for v_item in select * from jsonb_array_elements(p_items) loop
+    v_product:=(v_item->>'product_id')::uuid;v_qty:=(v_item->>'quantity')::integer;
+    if v_qty<=0 then raise exception 'Transfer quantity must be positive'; end if;
+    if not exists(select 1 from public.products where id=v_product and shop_id=v_source and active=true) then raise exception 'Source product not found'; end if;
+    insert into public.stock_transfer_items(transfer_id,source_product_id,quantity) values(v_id,v_product,v_qty);
+  end loop;
+  perform public.write_audit(v_source,'TRANSFER_REQUESTED','stock_transfer',v_id::text,null,null,jsonb_build_object('destination',p_destination_shop_id));
+  return v_id;
+end;
+$$;
+
+create or replace function public.cancel_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.stock_transfers set status='CANCELLED',reviewed_at=now() where id=p_transfer_id and source_shop_id=v_shop and status='REQUESTED';
+  if not found then raise exception 'Transfer cannot be cancelled'; end if;
+  perform public.write_audit(v_shop,'TRANSFER_CANCELLED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
+end;
+$$;
+
+create or replace function public.reject_stock_transfer(p_transfer_id uuid,p_note text default null)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.stock_transfers set status='REJECTED',approved_by=auth.uid(),reviewed_at=now(),notes=concat_ws(E'\n',notes,p_note)
+  where id=p_transfer_id and destination_shop_id=v_shop and status='REQUESTED';
+  if not found then raise exception 'Incoming transfer not found'; end if;
+  perform public.write_audit(v_shop,'TRANSFER_REJECTED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('note',p_note));
+end;
+$$;
+
+create or replace function public.approve_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_dest uuid; v_transfer public.stock_transfers%rowtype; r record; v_src_product public.products%rowtype; v_dest_product uuid; v_cat_name text; v_dest_cat uuid; v_before_src integer; v_after_src integer; v_before_dest integer; v_after_dest integer;
+begin
+  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
+  if not found then raise exception 'Incoming transfer not found'; end if;
+  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
+
+  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id
+  loop
+    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_transfer.source_shop_id;
+    if not found then raise exception 'Source product missing'; end if;
+    select quantity into v_before_src from public.inventory where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id for update;
+    if v_before_src is null or v_before_src<r.quantity then raise exception 'Insufficient stock for %',v_src_product.product_name; end if;
+
+    select id into v_dest_product from public.products where shop_id=v_dest and barcode=v_src_product.barcode limit 1;
+    if v_dest_product is null then
+      select name into v_cat_name from public.categories where id=v_src_product.category_id;
+      if v_cat_name is not null then
+        select id into v_dest_cat from public.categories where shop_id=v_dest and lower(name)=lower(v_cat_name) limit 1;
+        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_dest,v_cat_name) returning id into v_dest_cat; end if;
+      end if;
+      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
+      values(v_dest,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
+      returning id into v_dest_product;
+      insert into public.inventory(shop_id,product_id,quantity) values(v_dest,v_dest_product,0);
+    end if;
+
+    select quantity into v_before_dest from public.inventory where shop_id=v_dest and product_id=v_dest_product for update;
+    v_before_dest:=coalesce(v_before_dest,0);v_after_src:=v_before_src-r.quantity;v_after_dest:=v_before_dest+r.quantity;
+    update public.inventory set quantity=v_after_src where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id;
+    update public.inventory set quantity=v_after_dest where shop_id=v_dest and product_id=v_dest_product;
+    update public.stock_transfer_items set destination_product_id=v_dest_product where id=r.id;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_transfer.source_shop_id,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before_src,v_after_src,'STOCK_TRANSFER',p_transfer_id,'Branch transfer out',auth.uid());
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_dest,v_dest_product,'TRANSFER_IN',r.quantity,v_before_dest,v_after_dest,'STOCK_TRANSFER',p_transfer_id,'Branch transfer in',auth.uid());
+  end loop;
+  update public.stock_transfers set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_transfer_id;
+  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
+end;
+$$;
+
+-- ============================================================
+-- CHAPTER 25: IDEMPOTENT SALE / OFFLINE SYNC
+-- ============================================================
+create or replace function public.complete_sale_v2(
+  p_items jsonb,
+  p_payment_method text,
+  p_discount numeric default 0,
+  p_payment_reference text default null,
+  p_client_sale_id uuid default gen_random_uuid(),
+  p_offline_created_at timestamptz default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop uuid; v_existing uuid; v_sale_id uuid; v_invoice text; v_item jsonb; v_product uuid; v_name text; v_barcode text; v_qty integer; v_price numeric; v_before integer; v_after integer; v_subtotal numeric:=0; v_total numeric; v_shift uuid; v_role text;
+begin
+  v_shop:=public.assert_shop_access(); v_role:=public.current_user_role();
+  if p_client_sale_id is null then p_client_sale_id:=gen_random_uuid(); end if;
+  select id into v_existing from public.sales where shop_id=v_shop and client_sale_id=p_client_sale_id;
+  if v_existing is not null then return v_existing; end if;
+  if p_payment_method not in ('CASH','UPI','CARD') then raise exception 'Invalid payment method'; end if;
+  if p_discount<0 then raise exception 'Discount cannot be negative'; end if;
+  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Sale items required'; end if;
+
+  if p_offline_created_at is null then
+    select id into v_shift
+    from public.cashier_shifts
+    where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN'
+    order by opened_at desc limit 1;
+  else
+    -- Offline synchronization may happen after the shift was closed. Attach the sale
+    -- to the shift that was active when the sale actually occurred, not the shift state
+    -- at synchronization time.
+    select id into v_shift
+    from public.cashier_shifts
+    where shop_id=v_shop
+      and cashier_id=auth.uid()
+      and opened_at <= p_offline_created_at
+      and coalesce(closed_at, now() + interval '100 years') >= p_offline_created_at
+      and status in ('OPEN','CLOSE_REQUESTED','CLOSED')
+    order by opened_at desc limit 1;
+  end if;
+  if v_role='CASHIER' and v_shift is null then raise exception 'SHIFT_REQUIRED'; end if;
+
+  v_invoice:=public.next_sale_number(v_shop);
+  insert into public.sales(shop_id,invoice_number,cashier_id,status,payment_status,shift_id,client_sale_id,offline_created_at)
+  values(v_shop,v_invoice,auth.uid(),'COMPLETED','PAID',v_shift,p_client_sale_id,p_offline_created_at) returning id into v_sale_id;
+
+  for v_item in select * from jsonb_array_elements(p_items) loop
+    v_product:=(v_item->>'product_id')::uuid;v_qty:=(v_item->>'quantity')::integer;
+    if v_qty<=0 then raise exception 'Invalid sale quantity'; end if;
+    select product_name,barcode,selling_price into v_name,v_barcode,v_price from public.products where id=v_product and shop_id=v_shop and active=true;
+    if v_name is null then raise exception 'Invalid/inactive product'; end if;
+    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
+    if v_before is null or v_before<v_qty then raise exception 'Insufficient stock for %',v_name; end if;
+    v_after:=v_before-v_qty;
+    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
+    insert into public.sale_items(shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total)
+    values(v_shop,v_sale_id,v_product,v_name,v_barcode,v_qty,v_price,0,v_qty*v_price);
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_shop,v_product,case when p_offline_created_at is null then 'SALE' else 'OFFLINE_SALE' end,-v_qty,v_before,v_after,'SALE',v_sale_id,case when p_offline_created_at is null then 'POS sale' else 'Synced offline POS sale' end,auth.uid());
+    v_subtotal:=v_subtotal+v_qty*v_price;
+  end loop;
+  if p_discount>v_subtotal then raise exception 'Discount cannot exceed subtotal'; end if;
+  v_total:=v_subtotal-p_discount;
+  update public.sales set subtotal=v_subtotal,discount=p_discount,grand_total=v_total where id=v_sale_id;
+  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
+  values(v_shop,v_sale_id,p_payment_method,v_total,p_payment_reference,'PAYMENT',v_shift);
+  perform public.write_audit(v_shop,case when p_offline_created_at is null then 'SALE_COMPLETED' else 'OFFLINE_SALE_SYNCED' end,'sale',v_sale_id::text,null,null,jsonb_build_object('invoice',v_invoice,'discount',p_discount,'client_sale_id',p_client_sale_id));
+  return v_sale_id;
+end;
+$$;
+
+create or replace function public.sync_offline_sale(
+  p_client_sale_id uuid,p_offline_created_at timestamptz,p_items jsonb,p_payment_method text,p_discount numeric default 0,p_payment_reference text default null
+)
+returns uuid
+language sql
+security definer
+set search_path = public
+as $$
+  select public.complete_sale_v2(p_items,p_payment_method,p_discount,p_payment_reference,p_client_sale_id,p_offline_created_at);
+$$;
+
+-- ============================================================
+-- CHAPTER 26: OCR PRODUCT MATCHING
+-- ============================================================
+create or replace function public.match_product_text(p_text text,p_supplier_id uuid default null,p_limit integer default 5)
+returns table(product_id uuid,barcode text,product_name text,score numeric,match_source text)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  with q as (select lower(regexp_replace(coalesce(p_text,''),'[^a-zA-Z0-9]+',' ','g')) txt),
+  alias_matches as (
+    select pa.product_id,p.barcode,p.product_name,similarity(pa.normalized_alias,q.txt)::numeric score,'ALIAS'::text source
+    from public.product_aliases pa join public.products p on p.id=pa.product_id cross join q
+    where pa.shop_id=public.assert_shop_access() and (pa.supplier_id is null or p_supplier_id is null or pa.supplier_id=p_supplier_id)
+  ), product_matches as (
+    select p.id,p.barcode,p.product_name,greatest(similarity(lower(p.product_name),q.txt),similarity(lower(coalesce(p.brand,'')||' '||p.product_name||' '||p.size_ml::text),q.txt))::numeric score,'PRODUCT'::text source
+    from public.products p cross join q where p.shop_id=public.current_shop_id() and p.active=true
+  ), allm as (select * from alias_matches union all select * from product_matches), ranked as (
+    select *,row_number() over(partition by product_id order by score desc) rn from allm
+  )
+  select product_id,barcode,product_name,round(score,3),source from ranked where rn=1 and score>0.10 order by score desc limit greatest(1,least(p_limit,20));
+$$;
+
+-- ============================================================
+-- RLS + GRANTS
+-- ============================================================
+alter table public.organizations enable row level security;
+alter table public.sale_return_requests enable row level security;
+alter table public.sale_return_items enable row level security;
+alter table public.cashier_shifts enable row level security;
+alter table public.stock_counts enable row level security;
+alter table public.stock_count_items enable row level security;
+alter table public.purchase_orders enable row level security;
+alter table public.purchase_order_items enable row level security;
+alter table public.supplier_payments enable row level security;
+alter table public.purchase_returns enable row level security;
+alter table public.purchase_return_items enable row level security;
+alter table public.stock_transfers enable row level security;
+alter table public.stock_transfer_items enable row level security;
+alter table public.audit_logs enable row level security;
+alter table public.product_aliases enable row level security;
+
+-- Harden existing transactional reads.
+drop policy if exists sales_select on public.sales;
+create policy sales_select on public.sales for select to authenticated using (
+  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id)
+  and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
+);
+
+drop policy if exists sale_items_select on public.sale_items;
+create policy sale_items_select on public.sale_items for select to authenticated using (
+  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
+);
+
+drop policy if exists payments_select on public.payments;
+create policy payments_select on public.payments for select to authenticated using (
+  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
+);
+
+drop policy if exists purchases_select on public.purchases;
+create policy purchases_select on public.purchases for select to authenticated using (
+  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
+);
+drop policy if exists purchase_items_select on public.purchase_items;
+create policy purchase_items_select on public.purchase_items for select to authenticated using (
+  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
+);
+
+-- New table policies.
+drop policy if exists organizations_select on public.organizations;
+create policy organizations_select on public.organizations for select to authenticated using (id=public.current_organization_id() or public.is_platform_admin());
+
+drop policy if exists returns_select on public.sale_return_requests;
+create policy returns_select on public.sale_return_requests for select to authenticated using (
+  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or requested_by=auth.uid())
+);
+drop policy if exists return_items_select on public.sale_return_items;
+create policy return_items_select on public.sale_return_items for select to authenticated using (
+  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
+);
+
+drop policy if exists shifts_select on public.cashier_shifts;
+create policy shifts_select on public.cashier_shifts for select to authenticated using (
+  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
+);
+
+drop policy if exists stock_counts_select on public.stock_counts;
+create policy stock_counts_select on public.stock_counts for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+drop policy if exists stock_count_items_select on public.stock_count_items;
+create policy stock_count_items_select on public.stock_count_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+
+drop policy if exists po_select on public.purchase_orders;
+create policy po_select on public.purchase_orders for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+drop policy if exists po_items_select on public.purchase_order_items;
+create policy po_items_select on public.purchase_order_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+drop policy if exists supplier_payments_select on public.supplier_payments;
+create policy supplier_payments_select on public.supplier_payments for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+drop policy if exists purchase_returns_select on public.purchase_returns;
+create policy purchase_returns_select on public.purchase_returns for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+drop policy if exists purchase_return_items_select on public.purchase_return_items;
+create policy purchase_return_items_select on public.purchase_return_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+
+drop policy if exists transfers_select on public.stock_transfers;
+create policy transfers_select on public.stock_transfers for select to authenticated using (
+  public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(public.current_shop_id()) and (source_shop_id=public.current_shop_id() or destination_shop_id=public.current_shop_id())
+);
+drop policy if exists transfer_items_select on public.stock_transfer_items;
+create policy transfer_items_select on public.stock_transfer_items for select to authenticated using (
+  exists(select 1 from public.stock_transfers t where t.id=transfer_id and (t.source_shop_id=public.current_shop_id() or t.destination_shop_id=public.current_shop_id()) and public.current_user_role() in ('ADMIN','MANAGER'))
+);
+
+drop policy if exists audit_select on public.audit_logs;
+create policy audit_select on public.audit_logs for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and public.shop_access_allowed(shop_id));
+
+drop policy if exists aliases_select on public.product_aliases;
+create policy aliases_select on public.product_aliases for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+
+-- Edge/browser direct insert only for aliases, controlled by RLS manager/admin.
+drop policy if exists aliases_manage on public.product_aliases;
+create policy aliases_manage on public.product_aliases for all to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id)) with check (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
+
+-- Grants. Transaction mutations are RPC-only.
+grant select on public.organizations,public.sale_return_requests,public.sale_return_items,public.cashier_shifts,public.stock_counts,public.stock_count_items,public.purchase_orders,public.purchase_order_items,public.supplier_payments,public.purchase_returns,public.purchase_return_items,public.stock_transfers,public.stock_transfer_items,public.audit_logs,public.product_aliases to authenticated;
+grant insert,update,delete on public.product_aliases to authenticated;
+
+grant execute on function public.get_products() to authenticated;
+grant execute on function public.update_product_details(uuid,text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer) to authenticated;
+grant execute on function public.set_product_active(uuid,boolean) to authenticated;
+grant execute on function public.create_return_request(uuid,jsonb,text,text,text) to authenticated;
+grant execute on function public.approve_return_request(uuid) to authenticated;
+grant execute on function public.reject_return_request(uuid,text) to authenticated;
+grant execute on function public.void_sale(uuid,text,text,text) to authenticated;
+grant execute on function public.open_shift(numeric,text) to authenticated;
+grant execute on function public.my_open_shift() to authenticated;
+grant execute on function public.shift_totals(uuid) to authenticated;
+grant execute on function public.request_close_shift(numeric,text) to authenticated;
+grant execute on function public.approve_shift_close(uuid,text) to authenticated;
+grant execute on function public.create_stock_count(text) to authenticated;
+grant execute on function public.stock_count_scan(uuid,text) to authenticated;
+grant execute on function public.set_stock_count_quantity(uuid,uuid,integer) to authenticated;
+grant execute on function public.mark_unseen_stock_count_zero(uuid) to authenticated;
+grant execute on function public.submit_stock_count(uuid) to authenticated;
+grant execute on function public.approve_stock_count(uuid) to authenticated;
+grant execute on function public.create_purchase_order(uuid,jsonb,date,text) to authenticated;
+grant execute on function public.set_purchase_order_status(uuid,text) to authenticated;
+grant execute on function public.receive_purchase_order(uuid,text,date,jsonb,text) to authenticated;
+grant execute on function public.record_supplier_payment(uuid,numeric,text,text,date,text) to authenticated;
+grant execute on function public.create_purchase_return(uuid,jsonb,text,uuid) to authenticated;
+grant execute on function public.supplier_balances() to authenticated;
+grant execute on function public.purchase_price_history(uuid,integer) to authenticated;
+grant execute on function public.reorder_suggestions(integer,integer) to authenticated;
+grant execute on function public.available_transfer_destinations() to authenticated;
+grant execute on function public.create_stock_transfer(uuid,jsonb,text) to authenticated;
+grant execute on function public.cancel_stock_transfer(uuid) to authenticated;
+grant execute on function public.reject_stock_transfer(uuid,text) to authenticated;
+grant execute on function public.approve_stock_transfer(uuid) to authenticated;
+grant execute on function public.complete_sale_v2(jsonb,text,numeric,text,uuid,timestamptz) to authenticated;
+grant execute on function public.sync_offline_sale(uuid,timestamptz,jsonb,text,numeric,text) to authenticated;
+grant execute on function public.match_product_text(text,uuid,integer) to authenticated;
+
+-- Column-level hardening: Cashier/browser code cannot query purchase_price directly.
+-- Chapter 16+ reads products through get_products(), which returns purchase_price only to ADMIN/MANAGER.
+revoke select on public.products from authenticated;
+grant select(id,shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,mrp,selling_price,minimum_stock,units_per_case,active,created_by,created_at,updated_at) on public.products to authenticated;
+
+-- Refresh PostgREST schema cache after migration in case the platform does not do it immediately.
+notify pgrst, 'reload schema';
`````

