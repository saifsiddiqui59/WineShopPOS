# WineShopPOS Developer Handbook — Chapters 16–26

Version: Production-expansion release, 29-Aug-2026

## Purpose
This addendum is the canonical technical handbook for the Chapters 16–26 expansion of the existing WineShopPOS cloud MVP. It is meant to let a future developer or a new ChatGPT session continue safely without replaying the implementation conversation.

## Starting architecture
Before this release the application already had React/Vite, Supabase Auth, multi-shop RLS, products/inventory/purchases/sales/payments/stock movements, Admin/Manager/Cashier roles, a subscription kill switch, a secure `manage-shop-users` Edge Function, and Azure Blob Static Website hosting.

The release is additive. It deliberately does not replace the proven Chapter 15 transaction core.

## Non-negotiable invariants
1. `shop_id` is customer/branch isolation and must never be taken from browser input for a stock transaction.
2. All stock changes happen in database transactions/RPCs.
3. Inventory may never become negative.
4. A pending approval never changes stock.
5. Cross-shop transfers require both shops to share an explicit organization.
6. OCR is advisory until a person confirms the receipt.
7. Offline sync revalidates cloud stock and does not force conflicts.
8. Supabase service-role/Azure OCR secrets never enter the React bundle or Git.

## New database model
### Organizations
`organizations` groups branches owned by the same customer. Existing shops are migrated into separate organizations to preserve tenant isolation. A platform operator may later place multiple branches into one organization.

### Returns
`sale_return_requests` and `sale_return_items` separate request from approval. Refund payments remain positive numbers with `payment_type='REFUND'`; reports subtract them according to type instead of relying on negative monetary rows.

### Shifts
`cashier_shifts` records opening cash, tender totals, expected/actual cash, variance, request and approval timestamps.

### Stock count
`stock_counts` is the count session; `stock_count_items` is a full snapshot of active SKU expectations. NULL counted quantity means not yet counted and is intentionally different from zero.

### Procurement
`purchase_orders`, `purchase_order_items`, `supplier_payments`, `purchase_returns`, and `purchase_return_items` extend the existing `purchases`/`purchase_items` receipt ledger.

### Transfers
`stock_transfers` and `stock_transfer_items` implement a request/approval model. Stock changes only during destination approval.

### Audit
`audit_logs` captures actor/action/entity/old/new JSON/metadata. Business RPCs add semantic audit events while row triggers preserve before/after state for key master/transaction tables.

### OCR aliases
`product_aliases` lets a supplier invoice description map to the internal product without changing the product name.

## New transaction API
- `get_products()` — role-safe product read; hides purchase price from Cashier.
- `update_product_details()` / `set_product_active()` — Manager/Admin product write RPCs.
- returns: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.
- shifts: `open_shift`, `my_open_shift`, `shift_totals`, `request_close_shift`, `approve_shift_close`.
- stock count: `create_stock_count`, `stock_count_scan`, `set_stock_count_quantity`, `mark_unseen_stock_count_zero`, `submit_stock_count`, `approve_stock_count`.
- purchasing: `create_purchase_order`, `set_purchase_order_status`, `receive_purchase_order`, `record_supplier_payment`, `create_purchase_return`, `supplier_balances`, `purchase_price_history`.
- reordering: `reorder_suggestions`.
- transfers: `available_transfer_destinations`, `create_stock_transfer`, `cancel_stock_transfer`, `reject_stock_transfer`, `approve_stock_transfer`.
- offline/idempotent sale: `complete_sale_v2`, `sync_offline_sale`.
- OCR matching: `match_product_text`.

## Frontend modules
- global scanner: `src/context/ScannerContext.jsx`
- encrypted offline queue: `src/lib/offlineQueue.js`
- offline indicator: `src/components/OfflineStatus.jsx`
- thermal receipt: `src/components/Receipt80mm.jsx`
- pages: Scanner Settings, Returns, Shifts, Stock Count, Printer Settings, Procurement, Price History, Reorder, Transfers, Audit, Offline Queue, Automation Hub.

## Offline security design
IndexedDB stores only AES-GCM ciphertext and metadata for queued sale payloads. The AES key is generated through WebCrypto as non-extractable and kept in IndexedDB as a CryptoKey object. The client sale UUID is intentionally visible because it is an idempotency key, not customer/product content.

Offline mode is not positioned as a full disconnected ERP. The device must already have a valid cached session/catalog. Cloud synchronization is authoritative and may produce a conflict if stock, price, authorization or shift state no longer permits the sale.

## Thermal printing boundary
An Azure Blob static web app has no universal trusted route to silently write raw ESC/POS bytes to arbitrary local USB/Bluetooth printers. This release therefore produces a real 58/80mm receipt layout and uses the operating system/browser print path. If a specific printer model later requires silent printing, add a separately installed, signed local print bridge or carefully evaluated device-specific WebUSB integration.

## OCR design
The `ocr-invoice` Edge Function calls Azure AI Document Intelligence's `prebuilt-invoice` model. OCR credentials are read only from Edge Function secrets. The browser receives normalized invoice fields, asks PostgreSQL for product candidates, then requires human confirmation before `receive_purchase()` changes inventory.

## Compliance boundary
No generic report is labeled excise/statutory compliant. Alcohol compliance in India depends on state, license class, statutory forms and filing rules. Before building Chapter 26 compliance reports, record exact jurisdiction and obtain the official report specification.

## Deployment strategy
The single release script checkpoints a dirty repo if necessary, writes all generated files, runs a Vite production build, runs Supabase migration dry-run and push, deploys the OCR Edge Function, builds again, creates local Git commits, generates an **actual** Git patch/code-history from the release commit, makes a second documentation commit, performs one network `git push`, then uploads `dist/` to Azure Blob `$web`.

## Rollback
Frontend rollback is Git-based: build and redeploy a previous known-good commit. Database changes are additive and should be fixed forward with a new migration; never manually drop live transactional tables as a rollback shortcut.

## Security review after release
- rotate any secret ever pasted into chat or terminal history.
- enforce MFA for privileged accounts.
- review Admin/Manager/Cashier user list monthly.
- monitor audit/void/refund/stock-adjustment events.
- keep service-role and Azure OCR keys in server-side secrets only.
- for commercial rollout, add formal staging, automated integration tests, database backups and deployment approvals.


---

# Chapter 16 — Professional Barcode Scanner

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Make a normal USB/Bluetooth HID scanner feel like a commercial POS device.

## Implementation
- `src/context/ScannerContext.jsx` owns a global capturing `keydown` listener.
- Rapid key sequences are distinguished from human typing using average inter-key delay.
- Enter terminates a scan.
- The input field value present before scanning is snapshotted and restored when the sequence is classified as scanner input. This prevents the completed barcode from remaining in discount, payment-reference, search or other fields.
- Once the sequence is confidently scanner-like, later characters are prevented immediately.
- `src/pages/POS.jsx` subscribes to the scanner event, looks up an active product and auto-adds it.
- Repeated barcode scans increment cart quantity.
- WebAudio provides separate success/error tones.
- Unknown scans show a large PRODUCT NOT FOUND banner and link to Add Product with `?barcode=` prefilled.
- `ScannerSettings.jsx` exposes minimum barcode length, average key-gap threshold and reset interval plus live diagnostics.

## Operational note
The scanner should be configured in its manufacturer settings to append Enter/CR after each barcode.

## Tests
1. Focus Discount and scan `8900000010016`; discount must remain unchanged after the scan.
2. Scan the same barcode twice; cart quantity becomes 2.
3. Slowly type six digits; it must not be treated as a scan.
4. Scan an unknown barcode; error tone + Add Product action appears.
5. Create the unknown product; barcode is already populated.


---

# Chapter 17 — Returns, Refunds & Voids

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Restore inventory and payment history safely rather than editing past sales.

## Database
- `sale_return_requests`
- `sale_return_items`
- RPCs: `create_return_request`, `approve_return_request`, `reject_return_request`, `void_sale`.

## Workflow
Cashier can request a return. Stock does **not** move at request time. Manager/Admin approval adds stock, creates `CUSTOMER_RETURN` stock movements and records a `REFUND` payment. Refund value is allocated using the original sale's effective discount ratio. Full returned quantity marks the sale RETURNED; otherwise PARTIAL_RETURN.

Void is Manager/Admin only and only for a clean COMPLETED invoice without return activity. It restores all items and records `SALE_VOID` movements plus refund payment.

## Tests
- Request 1 of 2 sold units: stock unchanged while PENDING; +1 after approval.
- Attempt a second return beyond remaining quantity: rejected.
- Reject request: stock/payment unchanged.
- Void clean invoice: all stock restored and status VOID.


---

# Chapter 18 — Cashier Shift & Day Close

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Tie cashier activity to an auditable till shift.

## Database
`cashier_shifts` stores opening cash, Cash/UPI/Card totals, cash refunds, expected cash, actual cash, variance, approval and timestamps.

## Rules
- Cashier must have an OPEN shift before `complete_sale_v2` accepts a sale.
- Admin/Manager can bill without a cashier shift for administrative use.
- Close request snapshots payment totals.
- Expected cash = opening cash + cash payments - cash refunds.
- Manager/Admin approves CLOSE_REQUESTED to CLOSED.

## Tests
Open ₹5,000; sell ₹1,000 cash + ₹500 UPI; request close with ₹5,950 actual. Expected ₹6,000 and difference -₹50.


---

# Chapter 19 — Physical Stock Count

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Use barcode scanning to perform a controlled physical count and post only approved discrepancies.

## Database
- `stock_counts`
- `stock_count_items`

Creating a count snapshots every active SKU's current system quantity. Scanning increments counted quantity. Manual quantity is available for cases/shelves where scanning every unit is impractical.

Unscanned SKUs remain NULL rather than silently becoming zero. A deliberate **Mark Unseen = 0** step is required before submission. Approval replaces system quantity with counted quantity and creates both stock-adjustment and `STOCK_COUNT` movement records.

## Tests
Count expected 26 as 24 → submit → approval produces -2 movement. Cancel/unfinished count must never modify inventory.


---

# Chapter 20 — Thermal Receipt Printer

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Produce a clean 80mm/58mm thermal receipt from the static web application.

## Implementation
- `Receipt80mm.jsx` renders invoice, store header, lines, totals and payment.
- print CSS uses `@page` and thermal widths.
- Printer Settings stores address, phone, registration text, footer and 58/80mm paper width.

## Important browser boundary
The production frontend is an Azure Blob static website. It can open the browser print dialog and print to an installed USB/Bluetooth thermal printer. It cannot safely guarantee silent raw ESC/POS access for arbitrary printers. Silent printing would require a trusted local bridge/native helper or vendor-specific WebUSB integration.

## Tests
Install printer in Windows; open invoice → Print Receipt → choose printer → verify no clipping and correct width.


---

# Chapter 21 — Supplier & Purchase Improvements

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Extend receiving into a procurement/ledger workflow.

## Database
- `purchase_orders`, `purchase_order_items`
- `supplier_payments`
- `purchase_returns`, `purchase_return_items`
- purchases may reference `purchase_order_id`.

## Workflow
Create PO → mark sent → receive full/partial quantities → regular `receive_purchase` updates inventory → supplier balance = received purchases - supplier payments - completed purchase returns.

Supplier return validates on-hand stock, deducts quantity and creates `SUPPLIER_RETURN` stock movements.

`purchase_price_history` provides historical unit purchase price by invoice. The Price History UI calculates oldest-to-latest percentage change.

## Tests
Create PO 24 bottles; receive → inventory +24. Record supplier payment → balance falls. Return 2 bottles → inventory -2 and balance falls by returned value.


---

# Chapter 22 — Smart Reordering

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Suggest orders using facts already in the POS instead of AI.

## Formula
- history window default: 30 days
- average daily sales = units sold / history days
- days remaining = current stock / average daily sales
- desired quantity = max(avg daily × target days, minimum stock)
- suggested bottles = max(0, desired quantity - current stock)
- suggested cases = ceil(suggested bottles / units per case)

`reorder_suggestions` ignores voided/fully returned sales and returns only products below minimum or within target days.

The UI can create a Purchase Order from a recommendation.

## Tests
A product selling 11/day, stock 18, target 7 days should show low days remaining and a positive case suggestion.


---

# Chapter 23 — Multi-Shop Stock Transfer

Status: Implemented in Chapters 16–26 production-expansion release.

## Architecture decision
The existing Chapter 15 `shop_id` model separated **customers/tenants**. It was unsafe to assume every shop belonged to the same owner. Chapter 23 adds `organizations`; existing shops are initially placed into separate organizations. Only shops intentionally assigned to the same organization become branches eligible for transfers.

## Workflow
Source Manager/Admin requests transfer. No inventory changes yet. Destination Manager/Admin approves. Approval locks source stock, revalidates quantity, creates/copies destination product by barcode if needed, subtracts source, adds destination, and posts paired `TRANSFER_OUT` / `TRANSFER_IN` movements in one transaction.

## Tests
- Unrelated organizations cannot appear as destinations.
- Request does not alter stock.
- Approval -24 source/+24 destination.
- Insufficient source stock at approval rejects entire transaction.


---

# Chapter 24 — Owner Controls & Audit

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Provide traceability for commercial operations.

## Database
`audit_logs` captures actor, action, entity, old/new JSON, metadata and time. Product/supplier/sale/purchase triggers record row changes; transactional RPCs add explicit business events for returns, voids, shifts, counts, POs, payments and transfers.

## RLS hardening
- Cashier sales SELECT is limited to own invoices.
- Sale items/payments follow accessible sales.
- Purchases and procurement data are Manager/Admin only.
- `get_products()` masks purchase price for Cashier.
- Audit is ADMIN only.

## Tests
Change selling price and verify old/new row in Audit. Approve return and verify RETURN_APPROVED event. Cashier must not see other cashier sales or purchase-cost data.


---

# Chapter 25 — Offline POS

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Provide emergency selling after a device has already authenticated and cached the catalog.

## Client design
- service worker caches visited app resources.
- last cloud catalog/inventory is cached locally for emergency operation.
- offline sales are stored in IndexedDB.
- sale payload is encrypted with a non-extractable AES-GCM WebCrypto key stored in IndexedDB.
- every sale has a UUID `client_sale_id` for idempotency.

## Sync design
`sync_offline_sale` calls the server-side transaction. Supabase re-reads live product prices and locks current stock. If stock is insufficient or the shift is no longer valid, the item becomes CONFLICT rather than being forced into the database.

## Boundaries
- First-time/cold login still requires internet.
- Offline queue does not make supplier, user-management, returns or stock adjustments offline-capable.
- Cashier should sync before closing the shift.

## Tests
Load online → disconnect → create sale → queue shows PENDING → reconnect → Sync Now → inventory/sale appears once. Re-sync same client UUID must not duplicate.


---

# Chapter 26 — OCR, Compliance & Automation

Status: Implemented in Chapters 16–26 production-expansion release.

## OCR
A Supabase Edge Function `ocr-invoice` integrates Azure AI Document Intelligence `prebuilt-invoice` using API version `2024-11-30`. Azure credentials remain Edge Function secrets, never Vite/browser variables.

The frontend sends invoice image/PDF → OCR extracts supplier/invoice/date/items → `match_product_text` uses aliases/trigram similarity → human review → draft is sent to Receive Stock. **OCR never modifies inventory directly.**

If Azure secrets are absent, the feature returns `OCR_NOT_CONFIGURED` and the rest of the application continues normally.

## Product aliases
`product_aliases` allows supplier/OCR wording to be taught to a product without renaming the product master.

## Compliance boundary
State/excise compliance is intentionally not labeled complete. India alcohol reporting is jurisdiction/license specific. A future chapter must identify state, license class, statutory forms and reporting rules before implementation/certification.

## Future AI
Anomaly detection, forecasting and an owner assistant may be added over audited read models; they must never bypass transaction-safe RPCs or approval controls.


---

# Release Testing

# Chapters 16–26 Test Matrix

## Release gate
1. `npm run build` passes.
2. `npx supabase db push --dry-run` shows the intended migration only.
3. `npx supabase db push` succeeds.
4. `npx supabase functions deploy ocr-invoice` succeeds.
5. Admin login and Chapter 15 regression still work.

## Chapter 16 Scanner
- Scan `8900000010016` with focus in Discount; barcode does not remain in Discount.
- Duplicate scan increments quantity.
- Slow human typing does not trigger scan.
- Unknown barcode opens Add Product with barcode prefilled.
- Success/error beeps are distinct.

## Chapter 17 Returns
- Pending return causes no stock movement.
- Approval restores exact quantity, refund payment and audit.
- Over-return is rejected.
- Void clean invoice restores all stock; invoice cannot be voided twice.

## Chapter 18 Shift
- Cashier cannot sell without open shift.
- Opening cash + Cash sales - Cash refunds = expected cash.
- actual/expected variance stored.
- close requires manager/admin approval.

## Chapter 19 Stock Count
- Create snapshots active SKUs.
- Scanner increments counted SKU.
- Submission fails while NULL/unseen SKUs remain.
- explicit zero action works.
- approval applies discrepancies exactly once.

## Chapter 20 Receipt
- 80mm and 58mm layouts print without clipping.
- invoice totals/payment/store header are correct.

## Chapter 21 Procurement
- PO create/send/receive.
- inventory increases only on receive.
- supplier payment reduces balance.
- supplier return reduces stock/balance.
- price history reflects invoices.

## Chapter 22 Reorder
- low-stock/high-velocity products are suggested.
- case rounding uses units_per_case.
- Create PO produces correct quantity.

## Chapter 23 Transfer
- unrelated organization shop not listed.
- request moves no stock.
- destination approval creates paired stock movements.
- insufficient stock rejects atomically.

## Chapter 24 Audit/Security
- product price edit shows before/after audit.
- cashier sees only own sales.
- cashier cannot query purchase price through get_products.
- audit page is ADMIN only.

## Chapter 25 Offline
- after prior online load, disconnect and create offline sale.
- IndexedDB record is encrypted (no plaintext cart JSON in the queue record).
- reconnect and sync creates one sale.
- repeat sync cannot duplicate client_sale_id.
- stock conflict remains CONFLICT.

## Chapter 26 OCR
- without Azure secrets returns OCR_NOT_CONFIGURED.
- with configured resource, invoice extracts fields/items.
- human review is required before Receive Stock.
- stock does not change during OCR itself.

## Regression
- login/kill switch
- product CRUD
- normal POS sale
- receive stock
- dashboard/reports
- Admin creates Manager/Cashier
- Azure static URL after deployment

---

# Production Runbook

# Production Runbook — Chapters 16–26

## Deploy order
1. Backup source/Git checkpoint.
2. Production React build.
3. Supabase migration dry-run.
4. Push migration.
5. Deploy `ocr-invoice` Edge Function.
6. Production build again.
7. Commit code/docs.
8. Generate actual Git release code-history from the release commit.
9. Commit code-history.
10. One network `git push`.
11. Upload `dist/` to Azure `$web`.

## OCR activation (optional after release)
Create Azure AI Document Intelligence and set secrets:
```bash
npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR-RESOURCE.cognitiveservices.azure.com
npx supabase secrets set AZURE_DOCUMENT_INTELLIGENCE_KEY=YOUR_SECRET
```
Do not put this key in `.env.local`, React or Git. Edge Function secrets become available to the deployed function without exposing them to the browser.

## Create a second branch
Create the new shop through platform operations, then assign both shops the same `organization_id`. Do **not** simply reuse an organization across unrelated customers.

## Rollback strategy
- Frontend: redeploy the previous Git commit's `dist`.
- Database: migrations are additive; do not manually drop tables in production. Fix forward with a new migration.
- Offline conflicts: never delete a conflict until a manager has compared the offline receipt and cloud stock.

## Daily operational checks
- pending return requests
- CLOSE_REQUESTED shifts
- submitted stock counts
- offline conflicts
- supplier balances
- low-stock reorder suggestions
- audit exceptions

---

# Code History

After the release commit is created, `apply_chapters_16_26.sh` generates `docs/code-history/chapters-16-26-release.md` directly from `git show`. That file is the authoritative verbatim patch for this release. The handbook explains architecture; Git remains the source of truth for exact source code.


# Azure Document Intelligence F0 deployment decision

For OCR, the production-expansion installer uses the existing Azure subscription/resource group and provisions Document Intelligence only when the `F0` SKU is available. It never falls back to `S0`. The endpoint and key are transferred directly to Supabase Edge Function secrets and are not committed. The OCR flow uses `prebuilt-invoice`, REST API `2024-11-30`, a 4 MB client/server guard, and mandatory human review before `receive_purchase()` changes stock.
