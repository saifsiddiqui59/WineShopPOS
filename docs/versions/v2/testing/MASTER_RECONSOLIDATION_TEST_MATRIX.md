# WineShopPOS Master Reconsolidation — Regression Test Matrix
## Automated / Installer Gates

| Gate | Expected |
|---|---|
| Baseline `npm run build` | PASS before overlay |
| Baseline lint | Recorded; if baseline passes, post-change lint must pass |
| Post-overlay `npm run build` | PASS before DB migration |
| `supabase db push --dry-run` | Migration parses/plans successfully |
| `supabase db push` | Remote migration applied |
| `manage-shop-users` deploy | ACTIVE |
| Post-migration `npm run build` | PASS |
| Azure Blob upload | Completed and live index reachable |
## POS

1. Login as Cashier.
2. Main navigation should show only relevant modules.
3. Scan `8900000010016` from a non-input area.
4. Product auto-adds.
5. Scan again; cart quantity increases.
6. Focus discount/payment field and scan; barcode must not remain typed in field.
7. Scan unknown barcode; Product Not Found appears and Add Product opens with barcode prefilled for Manager/Admin.
8. Complete Cash sale; stock decreases once and stock movement exists.
9. Complete UPI/Card sale with reference.
10. Select optional customer online; sale customer link persists.
11. Print invoice and visually inspect 80mm layout.
## Purchases / Procurement

1. Create draft PO.
2. Submit for approval.
3. Approve.
4. Mark Sent.
5. Receive with unique supplier invoice.
6. Inventory increases exactly once.
7. PO becomes RECEIVED or PARTIALLY_RECEIVED.
8. Supplier balance increases.
9. Record supplier payment; balance decreases.
10. Perform purchase return; inventory decreases and movement history remains.
11. OCR invoice → review → confirmation → controlled purchase receipt. No stock before confirmation.
12. Purchase Intelligence shows price history and supplier comparison when data exists.
## Returns / Refunds

1. Locate original sale.
2. Request partial return with reason.
3. Manager/Admin approves.
4. Returned stock increases exactly once.
5. Refund/audit records persist.
6. Void eligible sale; verify reversal and audit.
## Shifts

1. Cashier opens shift with opening cash.
2. Complete sales.
3. Request shift close with actual cash.
4. Expected cash and difference calculated.
5. Pending offline sales must prevent unsafe close.
6. Manager approves close.
## Inventory / Stock Count

1. Inventory totals load.
2. Start stock count.
3. Scan products and enter physical quantities.
4. Submit.
5. Manager approves.
6. Differences create controlled stock adjustments/movements.
7. Inventory Intelligence classifications load.
8. Explain My Stock reconciles movement categories.
## Transfers PLUS

1. Two shops must belong to same organization.
2. Source creates REQUESTED transfer.
3. Destination approves — no stock changes yet.
4. Source dispatches — source stock decreases and TRANSFER_OUT exists.
5. Mark In Transit.
6. Destination receives — destination stock increases and TRANSFER_IN exists.
7. Destination completes.
8. Cross-organization destination is never offered/accepted.
## Expenses / Profit

1. Record expense.
2. Expense appears in history and Owner Center.
3. Void expense with reason; history remains.
4. Profit screen shows revenue, COGS, gross profit, expenses and operating profit.
5. Historical sales lacking cost snapshot are not misrepresented as fully accurate.
## Customer & Credit PLUS

1. Create customer.
2. Duplicate mobile validation behaves safely.
3. Record charge/Udhaar.
4. Record payment.
5. Outstanding balance reconciles.
6. Cashier cannot access management credit ledger route.
## Owner Center / Loss Control

1. Owner metrics load for current shop only.
2. Exceptions use neutral terminology such as Requires Review.
3. Recommendations link to relevant operational action.
4. WhatsApp Summary opens WhatsApp/Web with prefilled text only; nothing is automatically sent.
## Access / Security
### Cashier
- POS, Sales, Returns, Shift, Scanner, Offline visible as appropriate.
- No Products/Purchases/Inventory management/Owner/Admin navigation.
- Product purchase cost remains inaccessible through direct browser query/RLS/column grant.
### Manager
- Operations, purchases, inventory and reports visible.
- Owner Center and user administration are not available.
- Direct Owner Center RPC calls must not return owner/profit/loss data.
### Admin
- Full authorized shop features.
- Cannot change own role from account menu.
## Multi-Shop

1. User with multiple authorized memberships can switch shop if ADMIN/MANAGER.
2. Shop data refreshes after switch.
3. Cashier remains pinned to assigned/current shop in UX.
4. RLS still blocks unrelated shop/organization data.
## Offline

1. Login online and load catalog.
2. Disconnect network.
3. Complete emergency sale.
4. Sale queues locally with globally unique client ID.
5. Reconnect and sync.
6. Server validates live inventory.
7. Duplicate replay does not create duplicate sale.
8. Conflict is shown instead of force-overwriting inventory.
## Reports / Compliance

1. Date-range totals load.
2. Sales CSV exports.
3. Purchases CSV exports.
4. Inventory CSV exports.
5. Expenses CSV exports.
6. Compliance profile saves only verified metadata.
7. UI does not claim generic legal/excise compliance.
## Backup / Recovery

1. Export operational snapshot.
2. Confirm Git migrations/functions exist.
3. Restore a database backup into separate test/staging environment.
4. Verify schema/data and application login there.
5. Record PASS restore drill in Admin → Backup & Recovery.
## Legacy Route Compatibility

Old URLs for Shift, Returns, Sales, Scanner, Offline Queue, Stock Count, Purchases, Procurement, Price History, Reorder, Transfers, Automation, Users, Audit, Printer and Settings should redirect to the consolidated module without a blank page.
## Modern UI / Theme Regression

1. Login and switch Light → Dark → System from top bar.
2. Verify body, sidebar, top bar, panels, tables, forms and popovers all change theme consistently.
3. Set System; change OS/browser preferred color scheme and verify app follows it.
4. Save theme in My Account and refresh/re-login; preference persists.
5. Verify Owner Center charts render with real data and no console errors.
6. Verify Reports sales trend/payment mix, Inventory health charts, Purchase price charts and Profit charts.
7. Confirm POS remains uncluttered and scanner behavior is unchanged.
## Shop Settings Regression — ADMIN

1. Open Admin → Shop Settings.
2. Change shop name/address/phone/receipt footer and save.
3. Refresh and verify values persist.
4. Verify slug cannot be edited.
5. Verify printer paper accepts only 58/80mm.
6. Verify negative tax percentage is rejected.
7. Verify an audit entry exists for SHOP_SETTINGS update.
8. Login as Manager/Cashier and confirm Shop Settings route/RPC is denied.
9. Confirm subscription/access kill-switch values are not editable from Shop Settings.
## Role Management Regression — ADMIN

1. Create Cashier.
2. Change Cashier → Manager; re-login that user and verify Manager navigation.
3. Change Manager → Cashier; re-login and verify management modules disappear.
4. Disable/enable non-admin user.
5. Attempt to set role ADMIN through UI/function request; verify rejection.
6. Verify Shop Admin row remains platform-controlled.
7. Open Access Control and verify matrix matches route/backend behavior.
8. Manager cannot open Owner Center, Users, Access Control or Shop Settings.
9. Cashier cannot open product/purchase/inventory/admin management routes.


<!-- SUPPLIER_MASTER_OCR_PATCH -->
## Supplier/OCR Patch Regression

- [ ] ADMIN/MANAGER create supplier in Supplier Master.
- [ ] ADMIN/MANAGER edit supplier and changes persist.
- [ ] Deactivated supplier is hidden from new PO selection; history remains.
- [ ] Create PO → + New Supplier → save → supplier auto-selects.
- [ ] Create PO → Edit Selected Supplier works.
- [ ] OCR existing supplier suggests match but does not silently create.
- [ ] OCR new supplier pre-fills vendor name/address/tax ID and requires confirmation.
- [ ] OCR cannot continue to Receive Stock without supplier confirmation.
- [ ] CASHIER cannot access Supplier Master/Procurement.
- [ ] PO receiving and manual purchase receipt still update stock only through controlled RPCs.

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Product Master real-catalogue regression — 2026-08-31

- [ ] Legacy `src/data/products.js` no longer exposes dummy sample rows.
- [ ] Known dummy `890000001xxxx` DB products are inactive, not cascade-deleted.
- [ ] Normal Add Product refuses empty Barcode.
- [ ] Normal Add Product has no editable SKU.
- [ ] Normal Add Product has no Opening Stock field.
- [ ] Normal create generates unique per-shop `WSP-######` SKU.
- [ ] Newly created Product inventory quantity is 0.
- [ ] Product creation creates no OPENING_STOCK movement.
- [ ] Product Master shows All / With Barcode / Without Barcode filters.
- [ ] Missing barcode is clearly visible in Product Master.
- [ ] Edit Product can complete a missing barcode without changing SKU.
- [ ] Bulk Product Import is visible as a Products module tab.
- [ ] Manual bulk Product can be created without barcode.
- [ ] Bulk-created Product receives automatic SKU and inventory 0.
- [ ] Bulk Product creation does not receive stock.
- [ ] Invoice OCR unresolved rows open in Bulk Product Import.
- [ ] Bulk-created Product IDs return to the correct OCR line indexes.
- [ ] OCR still requires quantity/price human confirmation.
- [ ] OCR still sends a Receive Stock draft only after all lines are confirmed.
- [ ] Product alias learning still runs on confirmed OCR lines.
- [ ] ADMIN/MANAGER access remains allowed; CASHIER remains blocked by Products role guard.
- [ ] Existing Product audit trigger continues to record Product writes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.

<!-- AI_MONITOR_STATUS_20260831_START -->
## AI Monitor / tracing regression — 2026-08-31

- [x] Foundry Monitor no longer blocks the owner with the prior permission error.
- [x] Foundry AppInsights connection uses `ProjectManagedIdentity`.
- [x] Foundry connection target is an Azure ARM resource ID rather than a Git-Bash Windows path.
- [x] Standalone Help & Manual module is removed from main navigation.
- [x] Full User Manual is generated as HTML with a clickable table of contents.
- [x] Product Help/manual does not instruct customers to use AI as the Help mechanism.
- [ ] Generate a new authenticated production Owner Assistant request after tracing repair.
- [ ] Confirm that request appears in Foundry Traces.
- [ ] Run trace evaluation only after trace ingestion is observed.
<!-- AI_MONITOR_STATUS_20260831_END -->

<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
## Help entry regression — 2026-08-31

- [ ] Main navigation does not show a Help & Manual module/category.
- [ ] Top-right user menu still shows Help / About.
- [ ] Help / About shows exactly one customer-documentation action: Open Full User Manual.
- [ ] Open Full User Manual opens `/manual/index.html`.
- [ ] Full manual contains its clickable table of contents.
- [ ] `#/help` redirects to Account → Help / About and does not render category cards.
- [ ] Production application bundle does not contain `Browse by chapter`.
- [ ] Production application bundle does not expose Git/canonical-source documentation links.
