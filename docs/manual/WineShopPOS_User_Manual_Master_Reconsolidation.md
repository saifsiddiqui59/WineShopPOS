# WineShopPOS User Manual — Master Reconsolidation

<!-- WINEPOS_V2_CURRENT_BEGIN -->
## Current V2 User Guide Update

**Current product/documentation generation: V2**

> This section is the current user-facing reference where an older section
> conflicts with current production behavior.

### Current application areas

Depending on role and shop authorization, WineShopPOS currently covers or has
developed workflows around:

- POS billing
- barcode scanning
- payments
- receipt printing
- products/categories
- inventory
- suppliers
- purchases / PO / receiving / GRN
- returns/refunds
- sale void
- cashier shifts
- physical stock count
- stock adjustment
- stock transfer
- reports / Owner Center
- reorder / Purchase Coach intelligence
- Leakage Shield / exception review
- OCR invoice review
- offline foundation
- owner WhatsApp summary
- Ask WineShopPOS PRO AI Owner Assistant

### Cashier workflow

Keep the cashier flow simple:

```text
SCAN
→ CART
→ PAY
→ PRINT
```

### V2 user-visible capabilities

As V2 features are verified/implemented, this same manual will document:

- landed cost views
- receipt lot/batch traceability
- stock ageing
- FIFO/rotation views
- controlled discount/price overrides
- standardized reasons
- Accountant/Tally-ready export
- loyalty
- coupons/promotions
- gift vouchers/store credit
- supplier performance score
- expanded transfer lifecycle
- shared Approval Center additions
- Leakage Shield additions
- Purchase Coach additions

A feature should not be shown as available to users until the actual
application implementation is verified.

### Ask WineShopPOS PRO AI Owner Assistant

The Owner Assistant is **verified working end-to-end in production**.

Example owner/manager questions include:

- What were today's sales?
- What was yesterday's gross profit?
- Why did profit fall?
- What should I reorder?
- Which supplier increased prices?
- Compare my shops.
- What requires my attention?
- Which inventory is ageing?

Access uses the currently logged-in Supabase user and authorized shop
membership. The AI does not decide tenant access.

If AI is unavailable, core POS should remain operational.

### Role rule

UI visibility is not security. Backend/RLS/RPC authorization remains
authoritative for ADMIN, MANAGER and CASHIER permissions.

### Manual versioning

This remains the single master WineShopPOS User Manual.
Future V2/V3 changes update this same file; Git and V2 chapter records preserve
history.
<!-- WINEPOS_V2_CURRENT_END -->

## 1. What changed

WineShopPOS now groups work into eight clear areas instead of showing every feature in the main sidebar.

- POS & Billing
- Products
- Purchases & Suppliers
- Inventory
- Operations
- Owner Center
- Reports & Compliance
- Settings & Admin

You only see modules allowed for your role.

## 2. Roles

### Cashier
Use POS, sales lookup, returns where permitted, current shift, scanner and offline queue. Management/owner/admin screens are hidden.

### Manager
Use cashier functions plus products, procurement, inventory, stock count, transfers, expenses, approvals, customer credit and operational reports.

### Admin / Owner
Use all authorized shop functions including users, Owner Center, profit, exceptions, hardware, compliance configuration, backup evidence and audit.

You cannot change your own role from the account menu.

## 3. Top Bar and Account Menu

Top-right shows:
- current shop,
- online/offline status,
- your avatar/name.

Click your avatar for:
- My Profile,
- Account Settings,
- Security,
- Help & Manual,
- Logout.

You may update display name, phone and profile image URL. Email/role/shop security are controlled by administration.

## 4. POS & Billing

### Normal sale

1. Open POS & Billing → Billing.
2. Scan a barcode.
3. Confirm the product appears in the cart.
4. Scan the same barcode again to increase quantity.
5. Adjust quantity if needed.
6. Optionally select a known customer while online.
7. Enter allowed discount if applicable.
8. Select Cash, UPI or Card.
9. For UPI/Card, record the reference if available.
10. Select Complete Sale.
11. Print the receipt if needed.

### Unknown barcode

If the barcode is unknown:
- PRODUCT NOT FOUND is shown.
- Manager/Admin can select Add Product with this Barcode.
- The scanned barcode is prefilled.

### Scanner behavior

The scanner works globally on the POS page. Rapid scanner input ending with Enter is separated from normal human typing. If the scanner appears unreliable, open Scanner diagnostics from the POS module or Admin Hardware.

## 5. Sales / Returns / Voids

Open POS & Billing → Sales to find invoices.

For a return:
1. open Returns & Voids,
2. choose original invoice/product,
3. enter return quantity and reason,
4. submit request,
5. Manager/Admin approves where required,
6. approved returned quantity is added back to inventory through the controlled backend.

Never manually increase stock to imitate a return.

## 6. Shift & Day Close

1. Open Shift.
2. Enter opening cash and open shift.
3. Work normally through the day.
4. At closing, enter actual cash and request close.
5. Review expected cash and difference.
6. Manager approves close where required.

The app may block closing if this device still has unsynced/conflicting offline sales.

## 7. Products

### Add/Edit

Managers/Admins use Products → Product Master.

Maintain:
- barcode,
- SKU,
- name/brand/category,
- bottle size,
- case size,
- purchase price,
- MRP/selling price,
- minimum stock,
- active/inactive status.

Editing product details does not directly rewrite inventory.

### Barcode Labels

1. Open Products → Barcode Labels.
2. Search/select product.
3. Choose number of copies.
4. Select Print Labels.
5. Choose installed barcode/label printer in system print dialog.
6. Verify paper size/calibration before bulk printing.

## 8. Purchases & Suppliers

### Receive Stock

Use Receive Stock for direct supplier invoice receiving. Enter supplier/invoice/items and confirm. Stock increases only after controlled purchase receipt succeeds.

### Procurement PLUS

Purchase order flow:

1. Create Draft PO.
2. Submit for Approval.
3. Manager/Admin approves.
4. Mark PO Sent when sent to supplier.
5. On arrival, select PO and enter supplier invoice/date.
6. Receive Goods.
7. Inventory and stock movements update transactionally.

Also use Procurement for supplier payments and purchase returns.

### Purchase Intelligence PRO

Use Purchase Intelligence to view:
- invoice OCR,
- product purchase-price history,
- supplier price comparison,
- supplier outstanding/return/payment statistics,
- estimated margin impact.

OCR is a draft assistant. Always review extracted quantities, product match and price before receiving.

## 9. Inventory

### Overview

Shows live stock from Supabase.

### Stock Count

1. Start a count.
2. Walk through the store and scan products.
3. Record physical quantities.
4. Submit count.
5. Manager approves.
6. Approved differences create stock adjustments/movements.

### Transfers PLUS

1. Source requests transfer to another shop in same organization.
2. Destination approves.
3. Source dispatches — source stock decreases.
4. Mark In Transit.
5. Destination receives — destination stock increases.
6. Destination completes transfer.

Do not use manual adjustments instead of the transfer workflow.

### Inventory Intelligence PRO

Use this screen to identify:
- stockout risk,
- out of stock,
- dead stock,
- overstock,
- fast/slow stock.

Explain My Stock summarizes movement categories for a selected product. Reorder-risk products can create a draft PO after selecting supplier.

## 10. Operations

### Expenses

Managers/Admins record operating expenses such as rent, salary, electricity, transport and maintenance. If an entry is wrong, Void it with a reason instead of deleting history.

### Approvals

The Approvals tab consolidates pending operational approvals such as returns, shift closes, stock counts, transfers and purchase orders.

### Customer & Credit PLUS

Use Customer & Credit to:
- add customer,
- record Udhaar/charge,
- record payment received,
- review outstanding balance.

Normal POS customer capture remains optional.

### Offline Queue

If internet fails after the catalog was loaded:
- continue emergency billing,
- the sale is encrypted/queued locally,
- reconnect,
- synchronize,
- resolve any conflict instead of forcing inventory.

Never clear browser data while unsynced offline sales exist.

## 11. Owner Center

### Overview PRO

Shows revenue, bills, gross profit, operating profit, expenses, low stock, inventory cost and cash variance for the current shop.

### Profit Intelligence PRO

Shows revenue, COGS, gross profit and SKU margins. Older sales created before cost snapshots may not have complete historical COGS.

### Loss & Exceptions PRO

Flags operational events for review using neutral wording. It does not accuse staff of fraud.

### Recommendations PLUS

Shows rule-based suggestions such as stockout risk, dead/overstock and shift variance, with links to the relevant action screen.

### WhatsApp Summary PLUS

1. Open WhatsApp Summary.
2. Review generated text.
3. Select Share with Owner.
4. WhatsApp/WhatsApp Web opens.
5. Select recipient and manually send.

WineShopPOS does not automatically send or schedule WhatsApp messages.

## 12. Reports & Compliance

### Reports / Exports

Choose date range and export:
- sales CSV,
- purchases CSV,
- current inventory CSV,
- expenses CSV.

Confirm any accountant/Tally import format with your accountant before relying on it.

### Liquor Compliance

Admin stores verified license/state metadata. The application does not currently claim generic state excise compliance. Only enter verified values supplied for the licensed shop.

## 13. Settings & Admin

### Users

Shop Admin can create Manager/Cashier accounts. Shop Admin cannot create another Admin. Activate/deactivate operational users from Users.

### Hardware

Hardware links to scanner diagnostics and receipt printer settings. Barcode labels are under Products.

### Backup & Recovery

Admin can export an operational JSON snapshot. This is not a full PostgreSQL backup.

A proper backup process also requires database backup and a successful restore drill in a separate environment. Record restore-test evidence only after it actually happened.

### Audit Log

Admin can inspect technical audit history for changes/actions captured by the backend.

## 14. Troubleshooting

### Product does not scan
- Open Scanner diagnostics.
- Test barcode `8900000010016`.
- Confirm scanner sends Enter after barcode.
- Confirm product is active and barcode matches Product Master.

### Sale says inventory changed
Refresh cloud stock and retry. Do not manually force a lower inventory number.

### Offline sale not syncing
Reconnect internet, open Offline Queue and retry synchronization. If conflict remains, Manager should review live stock.

### OCR product match looks wrong
Do not confirm. Correct the product match/quantity/price first.

### Printer layout wrong
Use the correct installed printer, paper width (58/80mm) or label paper and recalibrate system printer settings.

### Subscription blocked
Contact the WineShopPOS software provider. Shop data access may be intentionally suspended by the platform owner.

## 15. Daily Shop Checklist

### Opening
- login,
- confirm Online status,
- open Cashier shift,
- scanner quick test,
- confirm printer paper.

### During day
- use POS for sales,
- use Receive Stock/PO workflow for stock-in,
- use Returns for customer returns,
- use Stock Adjustments/Stock Count rather than direct inventory editing,
- monitor Offline indicator.

### Closing
- sync offline queue,
- close shift and reconcile cash,
- review pending approvals,
- review low-stock recommendations,
- owner/manager reviews exceptions if needed.

## 18. Modern Theme and Dashboard

WineShopPOS now uses a modern light/dark visual system with Power BI-inspired business charts on management screens.

### Change theme

Use either:

- the theme button in the top-right application bar, or
- My Account → Account Settings → Theme.

Options:

- Light
- Dark
- System/Auto

System/Auto follows the device/browser light or dark preference. The theme should change immediately; saved account preference is reused on later sessions.

### Charts

Charts are management aids and do not replace transaction records. You will see visual trends in Owner Center, Profit Intelligence, Reports, Inventory Intelligence and Purchase Intelligence. Hover/labels and the detailed tables should be used when exact values are needed.

## 19. Shop Settings — ADMIN

Open Settings & Admin → Shop Settings.

The Shop Admin can edit:

1. shop name,
2. address and phone,
3. registration number,
4. currency code/symbol,
5. invoice and purchase prefixes,
6. receipt paper size,
7. receipt footer,
8. configured tax enable/percentage.

Select **Save Shop Settings**. Successful changes are stored centrally and audited.

The shop slug is read-only. Subscription status and the access kill switch are platform-controlled and are not editable here.

## 20. Users and Role Access — ADMIN

Open Settings & Admin → Users to create staff and manage their role/status.

### Cashier

Cashier is the fast-selling role. It can use POS/scanner, permitted sales/returns, its shift and offline queue. Cashier cannot edit product master, purchases, inventory, Owner Center or administration.

### Manager

Manager can run operational workflows: products, purchases, suppliers, inventory, stock count/transfers, expenses, approvals, customer credit and reports. Manager cannot open Owner Center or Shop Admin administration.

### Shop Admin

Shop Admin has all authorized shop functionality, including Owner Center, users, role management, Shop Settings, backup and audit.

### Change staff role

For a non-admin staff row, choose **Cashier** or **Manager** in the Role field. Role changes are applied through the secure user-management function. ADMIN is platform-controlled and cannot be assigned from this screen.

Open Settings & Admin → Access Control for the complete access matrix.

## 21. Help / About & User Manual

Open the user menu from your name in the top-right corner, then select
**Help / About**.

Select **Open Full User Manual** to open the complete WineShopPOS manual in a
new browser tab. The manual includes its own clickable table of contents.

WineShopPOS does not use a separate Help category in the main application
navigation.
<!-- SUPPLIER_MASTER_OCR_PATCH -->

### Install WineShopPOS on Windows

Windows users can download the official desktop-shortcut package from the Account **About** area:

1. Open the top-right user menu.
2. Open the Account **About** area.
3. Select **Install WineShopPOS on Windows**.
4. Extract `WineShopPOS_Customer_Windows_Setup.zip`.
5. Double-click `WineShopPOS_Windows_App_Setup.cmd`.
6. Use the new **WineShopPOS** Desktop or Start Menu shortcut.

Microsoft Edge must already be installed. Administrator access is not required.
The package creates shortcuts only and always opens:

`https://wineshoppos.z29.web.core.windows.net/`

Run `WineShopPOS_Windows_App_Remove.cmd` to remove the shortcuts.

## Supplier Master and OCR Supplier Review

ADMIN and MANAGER can open **Purchases & Suppliers → Suppliers** to create, edit, deactivate or reactivate suppliers. While creating a Purchase Order, use **+ New Supplier** to create a supplier without leaving the PO, or **Edit Selected Supplier** to correct the selected supplier.

For invoice OCR, first analyze the invoice, then confirm an existing supplier or choose **Create Supplier From Invoice**. Review the OCR-proposed supplier name, GST/tax number and address before saving. The supplier must be confirmed before the OCR draft can proceed to Receive Stock. Stock changes only after the normal receive confirmation.

<!-- WSP_AI_VERIFIED_V1_START -->
## Ask WineShopPOS (PRO)

Ask WineShopPOS is the Owner Center business copilot for quick questions about your shop.

### Who can use it

Ask WineShopPOS is currently available to authorized **ADMIN** users from:

**Owner Center → Ask WineShopPOS**

### What you can ask

Examples:

- How is my shop performing today?
- What should I reorder?
- Which products may run out soon?
- Which products are moving slowly?
- How is my profit today?
- Which supplier prices changed?
- Show me stock movement for a product.
- Are there shift differences I should review?
- What expenses affected my business?
- Is there anything operational that needs my attention?

### Shop selection

The shop context comes from your WineShopPOS account.

If your account is authorized for more than one shop, use the available shop/scope selector to choose the business context you want to review.

### Using the answer

Ask WineShopPOS explains the business information available in the application and can point you to the relevant screen for more detail.

AI V1 provides **insights and recommendations**. Final operational actions remain under the user's control in the normal WineShopPOS workflows.

### If AI is temporarily unavailable

Your normal POS, billing, inventory, purchasing and operational workflows continue to work. Try the AI question again after a short interval.

### Example

**Question:** How is my shop performing today?

Ask WineShopPOS can combine current sales, profit, expenses, shift information and operational exceptions into one business summary.
<!-- WSP_AI_VERIFIED_V1_END -->

---

## V2 Phase 1 — OCR Product Resolution & Landed Cost

For purchase invoice OCR:

1. Analyze the invoice.
2. Confirm an existing supplier or create the reviewed supplier.
3. Every OCR line must resolve to a Product Master product.
4. Strong product matches are auto-selected but the line is still shown for
   confirmation.
5. Uncertain matches require human selection/confirmation.
6. Unmatched lines provide **Select Existing Product** and **Create New Product**.
7. Confirmed description-to-product mappings are saved as aliases for future invoices.
8. Review **Cases**, **Bottles / Case**, **Loose Bottles** and **Final Bottles**.
9. Only confirmed lines can be sent to Receive Stock.
10. Receive Stock shows landed-cost adjustments before inventory is posted.

Receipt-based ageing and FIFO views are available under Inventory after the
Phase-1 database migration is active.

---

## V2 POS and Billing Interface

The POS is arranged as a retail workstation:

1. Product search / barcode scanner
2. Optional customer/reward controls
3. Current Bill
4. Applicable override/reward controls
5. CASH / UPI / CARD selection
6. Complete Sale

On large screens the bill stays visible while products are scanned. On smaller
screens the interface stacks automatically to prevent overlapping buttons and
clipped fields.

The invoice screen provides a 58mm/80mm thermal receipt preview. Printing hides
normal application navigation and uses receipt-focused print styling.

<!-- V2_CURRENT_USER_WORKFLOWS_START -->
## V2 Current User Workflows

This section is authoritative where older manual wording conflicts.

### Receive multiple inventory products

Open **Purchasing → Receive Stock**.

1. Select supplier and invoice details.
2. Add all required product lines.
3. Confirm cases, bottles per case, loose bottles and final bottle quantity.
4. Enter purchase price and optional batch/expiry.
5. Add applicable landed-cost charges/discounts.
6. Review and confirm Receive Stock.

### Receive an invoice with OCR

Open **Purchasing → Purchase Intelligence** and use Invoice OCR.

For every OCR line:

1. Review description and quantity interpretation.
2. Accept a strong match only when correct.
3. For uncertain lines, select the correct existing product.
4. For unmatched lines, use Select Existing Product or Create New Product.
5. Confirm the mapping; WineShopPOS stores it as a product alias.
6. Confirm cases, bottles per case, loose bottles and final bottles.
7. Continue through controlled Receive Stock.

Unresolved OCR lines must not post inventory.

### Discount or price override

At POS:

1. Add products.
2. Enter discount/change item sale price only when required.
3. Select a standardized reason.
4. If policy requires it, request approval.
5. MANAGER/ADMIN reviews in **Operations → Approvals**.
6. Complete sale after approval.

Changing controlled pricing after approval requires a new approval.

### Customer loyalty

At POS select the customer, review points, enter points to redeem, preview
benefits, and complete checkout. The database revalidates balances.

Authorized managers/admins can manage loyalty adjustments from
**Operations → Customers**.

### Coupons and promotions

Managers/admins create promotions from **Operations → Customers**. Promotions
can use fixed/percentage discounts, coupon codes, minimum purchase, maximum
discount, validity dates and automatic application. POS eligibility is
revalidated at checkout.

### Gift voucher and store credit

From **Operations → Customers**, authorized managers/admins can grant store
credit and issue gift vouchers.

At POS select the customer for store credit or enter a gift-voucher code,
preview the tender, then complete sale. These are non-cash tender, not hidden
manual discounts.

### Accountant / Tally-ready export

Open **Reports & Exports**, select the date range, then choose
**Export Accountant / Tally-ready Ledger**. The output contains ledger-oriented
date, voucher, debit, credit, reference and narration rows. The accountant
should validate final ledger-name mapping for the target Tally company.

### Supplier Performance Score

Open **Purchasing → Purchase Intelligence**. The score uses available evidence
such as fill rate, on-time receipts, returns, price stability and purchase
activity. It is decision support, not an accusation or contractual rating.

### Purchase Coach

Open **Purchasing → Purchase Intelligence → Purchase Coach**. It can flag
REORDER, NO_MOVEMENT, OVERSTOCK and MARGIN_RISK using stock, demand and recent
purchase/supplier evidence.

### Advanced stock transfer

Open **Inventory → Transfers**.

`REQUESTED → APPROVED → DISPATCHED → IN_TRANSIT → RECEIVED → COMPLETED`

Use the action for the current state; do not directly edit stock to imitate a
transfer.

### Leakage Shield

Open **Owner Center → Leakage Shield / Exceptions** as ADMIN. Review neutral
signals such as cash variance, unusual refunds/discounts, repeated approved POS
overrides, large store-credit grants and high-value vouchers.

### Add a new user

Open **Admin → Users** as ADMIN. Create/invite the user through the current user
management workflow, then assign the intended shop membership and role.

### View historical data

Use the relevant screen:

- Sales: **POS → Sales**
- Stock/movements: **Inventory**
- Audit activity: **Admin → Audit**
- Purchase/supplier history: **Purchasing → Purchase Intelligence**

History availability depends on retained production records and screen filters.
Deleted or never-retained records cannot be assumed recoverable.
<!-- V2_CURRENT_USER_WORKFLOWS_END -->


<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Product Master — real product onboarding

### Add one product

Open **Products → Product Master → Add Product**.

1. Scan or enter Barcode. Barcode is mandatory in this normal form.
2. Enter Product Name, Brand, Category, Size, pricing and pack information.
3. SKU is generated automatically; you do not type it.
4. There is no Opening Stock field.
5. Save the Product.

The Product starts with stock 0. Use **Purchases & Suppliers → Receive Stock**
when physical stock is actually received.

### Add many products manually

Open **Products → Bulk Product Import**.

- Add as many rows as required.
- Barcode can be left blank in this bulk workflow.
- Review Product Name, Size, Category and commercial fields.
- Create the batch; WineShopPOS generates every SKU automatically.
- Bulk Product creation does not increase inventory.

### Add new products from Invoice OCR

1. Open **Purchases & Suppliers → Invoice OCR**.
2. Analyze the supplier invoice and confirm the supplier.
3. Existing products are matched normally.
4. When several lines are unmatched, click **Bulk Create Unmatched Products**.
5. Review the new Product Master rows in Bulk Product Import.
6. Create the products. Barcode can be added later.
7. WineShopPOS returns the created Product IDs to their OCR invoice lines.
8. Review cases, units/case, final bottles and purchase price per bottle.
9. Confirm every line.
10. Send the confirmed draft to Receive Stock.

### Find products that still need barcodes

Open Product Master and use **All**, **With Barcode** or **Without Barcode**.
Choose **Without Barcode**, open **Edit**, scan/enter the physical barcode and save.

## Invoice Inbox and stored supplier invoices
<!-- V3_API_AUTOMATION_20260831 -->
ADMIN/MANAGER users can use **Purchases & Suppliers → Invoice Inbox** in the V3 preview. Filter by Year, Month and Status. **View Original** opens the private invoice through temporary secure access. **Review OCR** reopens stored OCR. `POSSIBLE_DUPLICATE` must be resolved before Receive Stock. An Inbox invoice does not mean stock was received; only **Confirm & Receive Stock** changes inventory. Manual App OCR storage is part of V3. Email remains pending until the real Gmail/Google Workspace connection is authorized and tested.

### Email invoices in V3 (20260831T123139Z)
V3 Email invoice automation is deployed on branch `V3`. Gmail uses a dedicated App Password kept only in Azure Function settings. Unread PDF/JPEG/PNG invoices from a registered EMAIL channel are polled every 5 minutes, deduplicated, stored in private Blob, OCR-processed, and routed to Invoice Inbox. Inventory remains unchanged until a human completes Receive Stock. WhatsApp V3-01B is preserved but ON HOLD.

### Demo / Test Data Reset
ADMIN users can open **Settings → Demo / Test Data Reset** during testing. Type **DELETE DEMO DATA** exactly and accept the confirmation. This clears operational test data such as products, purchases, sales, inventory, suppliers and invoice-review records together. Shop identity, users, settings, categories and Email sender mapping remain available.

This is destructive and is intended for controlled test/demo cleanup.

### Email attachment larger than 4 MB
When a registered shop Email sends a supported invoice PDF/JPG/PNG larger than 4 MB, WineShopPOS does not OCR or receive stock from that oversized attachment. The system replies from the central WineShopPOS Gmail account with the filename, size, current 4 MB limit and a request to compress and resend.

### Barcode demo behavior
USB/Bluetooth HID scanners may terminate a barcode with **Enter or Tab**. WineShopPOS normalizes scanner whitespace/control characters while preserving leading zeros. Use **POS → Scanner Test** to confirm the device before a live billing demo.

### Invoice financial reconciliation
When Invoice OCR recognizes invoice-level values such as Freight/Carting, Cash Discount, Other Deduction, TCS, Stamp Duty or other additions, WineShopPOS pre-fills **Landed Cost Adjustments**. Always review the values before receiving stock. If a printed invoice total is available, WineShopPOS compares it with the calculated landed total and shows **MATCH** or **REVIEW**.

### Supplier Invoice / Reference
The Supplier Invoice / Reference field is optional for the operator. WineShopPOS uses the OCR invoice number when available. If the invoice number cannot be read or is absent, WineShopPOS supplies an internal `AUTO-...` reference so stock receiving is not blocked.

### Invoice Email acknowledgement
For an authorized shop Email with a supported invoice attachment, WineShopPOS sends one automatic acknowledgement confirming that the Email was received and asking the sender to allow up to **1 hour** for it to appear in Invoice Inbox. Oversized attachments continue to use the separate >4 MB rejection message.

### Required fields
A red `*` identifies required fields. Fields explicitly labelled **optional** are not required.

### OCR Bulk Product suggestions
For unmatched OCR products, Bulk Product Import suggests **Brand** from the first word of the product name, **MRP** from a recognized invoice MRP column, and **Category** when the description or beverage brand matches an active category. Review all suggestions before creating products.

### Invoice total mismatch popup
If the calculated invoice does not match the printed invoice total, WineShopPOS shows a large warning with Calculated Invoice, Printed Invoice and Difference and blocks Receive Stock until reviewed.

### Scan barcode in Bulk Product Import
Click the Barcode field for the desired row and scan the bottle/can. The complete barcode should remain in that row. You can still type the barcode manually.

### Automatic Email polling paused
When the Email scheduler is paused, invoice Emails remain in the mailbox until the administrator enables automatic polling again.

### Better liquor invoice OCR
Invoice OCR now checks the supplier's printed item table rather than trusting only generic invoice fields. It recognizes common liquor-invoice columns even when suppliers use different headings, including combined headings such as MRP Brand. If Azure misses the Cases header/value but Rate/Case and Amount are reliable, WineShopPOS derives Cases only when the ratio is near an integer and validates the invoice-level case total when printed.

### Batch / Lot
When a Batch/Lot column exists, WineShopPOS preserves the raw OCR value during review and carries the reviewed value into Receive Stock and FIFO history. It does not invent corrected batch numbers when OCR is uncertain.

### Price/Bottle precision
Price/Bottle can contain more than two decimal places because it may be calculated from the printed line amount divided by final bottles. Precise unit cost is retained; invoice totals remain two-decimal currency amounts.

### FIFO: what to sell
Inventory → Ageing & FIFO marks the oldest tracked lot for each product as **SELL FIRST** and shows a **BOX-xxxxxx** code. Write that code on the physical carton/box. A full warehouse rack system is not required.

## Product Cleanup (Admin)
Settings & Admin -> Product Cleanup can permanently purge only a non-transactional test product after typing DELETE. Products with sales, purchases, returns, transfers, stock-count or transactional stock movement history are blocked and should be deactivated/corrected instead. POS Current Bill survives navigation to Scanner Test; use × Remove or Clear Cart explicitly.

## Invoice Inbox — friendly workflow labels

Open **Purchasing → Invoice Inbox** to see retained supplier invoice reviews.

| Display label | Meaning | Typical action |
| --- | --- | --- |
| **Needs Review** | OCR/human verification is incomplete. | Start Review / Resume Review |
| **Ready for Stock** | Review is complete and a saved Receive Stock draft is ready. | Continue Receive Stock |
| **Completed** | Inventory was received and a purchase receipt is linked. | View Receipt / View Original |
| **Possible Duplicate** | Duplicate decision is required. | Not Duplicate / Confirm Duplicate |
| **Duplicate — Closed** | Confirmed duplicate; do not receive again. | View evidence |
| **Cancelled** | Review was closed only; original invoice remains saved and inventory was not changed. | Reopen Review |
| **OCR Failed / Processing Failed** | Processing needs investigation. | Investigate / Cancel Review |

**Cancel Review is not delete.** It retains the original document and does not change inventory.

**Completed** is the user-facing term for internal status `RECEIVED`.

### Save & Close versus Apply on Product Edit

- **Save & Close** saves and returns to Product Master.
- **Apply** saves and keeps the Edit Product screen open.

Selling Price remains a manual product-master value. POS blocks zero Selling Price instead of silently substituting MRP.

## Login status troubleshooting — V3-07

WineShopPOS distinguishes a genuine disabled/suspended account from a temporary authorization verification failure.

- **Account Disabled** is shown only for a verified inactive profile.
- **Shop Access Suspended** is shown only for verified disallowed shop access.
- A transient backend JWT timing error is retried automatically before the user sees an error.
- A valid active account should enter the application without a browser refresh.

<!-- RELEASE_WITH_AI_EVAL_SKIPPED_20260901 -->
## Edit Product — Selling Price
On **Edit Product**, enter the Selling Price and choose **Save & Close**. The screen verifies the saved Selling Price before closing. If the saved value cannot be verified or differs, the form stays open and shows an error so the value can be corrected or retried.

The Edit Product screen uses **Save & Close** and **Cancel**. The former **Apply** action and duplicate top-right **Back** / **Close** controls are removed.

<!-- OCR_BULK_PRODUCT_SYNC_FIX_20260902 -->
## First invoice when Product Master is empty
Use: **Invoice OCR → Confirm Supplier → Bulk Create Unmatched Products → return to OCR → review/confirm each line → reconcile → Send Confirmed Draft to Receive Stock → Receive Stock**.

Before products exist, `No existing product match found` is normal. After Bulk Create succeeds, the rows should show **Created product linked** and the products should appear in Products. Do not run Bulk Create again for products that were already created.

For reconciliation, compare **Invoice Rate/Case** with **Reviewed Rate/Case** and use the **Gap (Inv - Rev)** column to identify the exact line causing a mismatch. Changing Reviewed Rate/Case automatically recalculates Price/Bottle from Bottles/Case.

Creating Product Master records does not increase stock. Stock changes only through Receive Stock.

<!-- POS_SALES_RECEIPT_REPORT_SORT_20260902 -->
## POS receipt, Sales and Reports
After successful payment, WineShopPOS opens the completed receipt and requests the browser print dialog. Use **Print Receipt** if automatic printing is dismissed. Sales reloads from Supabase and includes **Refresh Sales**. Reports refreshes current transactions before charts/totals. On read-only lists, click headers: `↕` sortable, `↑` ascending, `↓` descending. Click again to reverse direction.

<!-- SALES_SPLIT_LOADER_20260902 -->
## If stock reduced but Sales looks empty
Do not repeat the bill immediately. Open POS & Billing > Sales and click Refresh Sales. Existing completed invoices should load from Supabase. If a read fails, WineShopPOS shows a visible data-refresh notice. Use View to open and print an existing receipt.

<!-- AUTOPRINT_SRNO_SHIFT_CASH_20260902 -->
## Automatic receipt printing
Use **Auto Print: ON/OFF** in POS Billing or Printer Settings. OFF opens the receipt without automatically opening the print dialog. ON opens both the receipt and print dialog. This preference belongs to the current browser/device.

## Sr. No. and list sorting
Read-only sortable lists show **Sr. No.**. Ageing and FIFO Rotation Queue also support sorting. FIFO starts in its operational FIFO order until you click a header.

## Shift Actual Cash
Expected Cash is calculated by WineShopPOS. Actual Cash is the physical cash counted in the drawer. Enter it explicitly before Request Close. If a CLOSE_REQUESTED amount is wrong, use **Update Actual** before **Approve Close**. WineShopPOS recalculates variance and records the correction in the audit trail.

<!-- PREMIUM_UI_PRODUCT_IMAGES_FIFO_PRIORITY_20260902_V2 -->
## Product bottle/can images
Add Product and Edit Product support an optional JPEG, PNG or WebP bottle/can image up to 5 MB. Use an image you own or are permitted to use. Images appear in Products, Inventory and POS.

## Ageing and FIFO priority
Normal read-only lists may use Sr. No. Ageing and FIFO instead show stable Product Ref plus Age Priority/FIFO Priority. FIFO Priority 1 means SELL FIRST. Sorting another column changes only the view and does not renumber the operational priority.

## UI polish
WineShop POS uses a short cheers/reveal brand animation, subtle Royal 21 gold treatment, lightweight menu/page feedback, and a user menu that stays above page content. Theme remains under My Account → Account Settings.

<!-- BRAND_THEME_REFINEMENT_20260902_V3 -->
## Brand animation and themes
WineShop POS shows a short two-glass cheers animation when the app layout loads. The mark can replay when you hover, focus or click the logo. It does not continuously loop.

Royal 21 uses a subtle gold highlight approximately every six seconds.

Choose **System**, **Light** or **Dark** under **My Account → Account Settings**. System follows the device preference. Both Light and Dark use the same WineShop POS wine-and-gold brand language. Reduced-motion device settings disable decorative motion.

<!-- REFERENCE_BRANDING_TRUE_BLACK_20260902_V4 -->
## Premium branding and Dark theme
Royal 21 appears as a large centered gold shop identity with crown and subtle periodic shine. Dark theme uses black/charcoal rather than dark blue. Light theme remains available from **My Account → Account Settings**.

<!-- BRAND_SPIRIT_TILE_V6_CANONICAL -->
## Spiritual image tile
Below Settings & Admin, click + or drag/drop a JPEG/PNG/WebP image. Drag the bottom handle up/down to change tile height. The tile collapses with the sidebar.

## Sidebar collapse
Collapse now narrows the whole sidebar and gives the freed space to the main application.

<!-- EXACT_REFERENCE_PIXEL_ANIMATION_V7 -->
## Premium brand animation
WineShop POS now plays the same five visual stages shown in the approved reference artwork. Hover, focus or click the logo to replay it. Royal 21 uses the same approved gold/crown stages and repeats its short sequence approximately every six seconds.

<!-- ROYAL21_CROWN_COST_V8 -->
## Royal 21 header
Royal 21 remains stationary in the center header while its crown rotates continuously. The header is contained above the application content and does not cover POS or purchasing screens.

<!-- ROYAL21_Y_AXIS_DARK_TILE_V9 -->
## Royal 21 header
Royal 21 is displayed prominently in the center header. The crown revolves in a 3D side-to-side/Y-axis motion while the shop name remains stationary. In Dark mode the spiritual image tile uses a true black background.

<!-- ROYAL21_3D_SHIMMER_PITCH_BLACK_V10 -->
## Royal 21 header appearance
Royal 21 appears on a pitch-black premium tile with a subtle shimmer. The crown has a stronger 3D revolving effect, and the spiritual image tile also appears pitch black in Dark mode.

<!-- USER_CROWN_FULL_HERO_PITCH_BLACK_V11 -->
## Royal 21 premium header
Royal 21 uses the jeweled crown supplied for the shop, rotating in a side-to-side 3D/Y-axis motion. The complete center header area carries a subtle gold shimmer. Dark mode uses pitch-black application and module backgrounds.

<!-- DEMO_SAFE_ROYAL_HERO_V12 -->
## Royal 21 premium header
Royal 21 is presented in the full center header with a restrained gold-light effect and light shimmer. Its jeweled crown rotates around its own vertical axis. The Shop Admin control remains fixed above the hero effects on the right.

<!-- FORT_ONLY_TOP_HERO_V14B -->
## Demo center header
The center header displays a Rajasthan-inspired fort visual while existing shop context behavior remains available behind the presentation layer.

<!-- EXACT_USER_REFERENCE_BANNER_V15 -->
## Royal 21 header artwork
The center header displays the supplied Royal 21 Rajasthan artwork directly.

<!-- PRODUCT_MASTER_OCR_PREVIEW_V1 -->
## Product Master preview improvements
Product Master shows Purchase, MRP and Selling separately. OCR-created products carry detected bottle size and MRP when available. Selling defaults to MRP + ₹15 for new OCR products but remains editable. Background refresh no longer clears values while editing a product.

<!-- PREVIEW_CURATED_7_PRODUCT_IMAGES_V4 -->
## Product images in V3 preview
The seven current demo products show recognizable product imagery in Product Master when no image has been uploaded yet. Uploading an image through Edit Product continues to override the preview fallback automatically.

<!-- V5A_RESPONSIVE_RESIZABLE_PREVIEW_20260902 -->
## Responsive screens and adjustable Product Master columns
WineShopPOS V3 preview adapts the navigation, header, cards, forms and page spacing to desktop, laptop, tablet and phone widths. On phone-sized screens, use the menu button to open the navigation drawer.

In Product Master, drag the small divider at the right edge of a column heading to make that column wider or narrower. Your widths are remembered in the current browser. Use **Reset column widths** above the table to return to the standard layout. Wide data tables may still scroll horizontally on smaller screens so values are not squeezed into unreadable columns.

<!-- V5A1_ONE_SIDED_COLUMNS_RESPONSIVE_REFINEMENT_20260902 -->
## Adjusting Product Master columns
Drag the **right edge** of a column. Its left edge stays in the same place; only its right edge moves. Columns to the left stay fixed. Widths are remembered in the browser and **Reset column widths** restores defaults. Smaller screens keep wide tables horizontally scrollable instead of squeezing values.

<!-- V5B_PURCHASE_CORRECTION_OCR_PACK_SAFETY_20260902 -->
## Correcting a completed purchase
Open **Purchases & Suppliers → Invoice Inbox → View Receipt**. In **Completed Purchase Correction**, choose **Correct** on the affected line. Enter the correct Cases, Bottles/Case and Loose Bottles plus a reason. WineShopPOS keeps the supplier line amount unchanged and shows the resulting final bottles, inventory difference and corrected per-bottle price before confirmation.

The normal correction is allowed only while that receipt lot is completely unconsumed. If bottles from that FIFO lot were already sold/used, WineShopPOS blocks the correction and requires an advanced reversal workflow.

Before Receive Stock, WineShopPOS warns about package conflicts. CAN products normally suggest 24/case and glass/bottle products below 500 ml normally suggest 24/case, but these are review suggestions; supplier evidence and verified Product Master data take priority.

<!-- V5C_PURCHASE_VERIFICATION_FIFO_TABLE_USABILITY_20260903 -->
## Purchase verification and FIFO display
If OCR cannot prove Bottles/Case, Quantity Check shows REVIEW · OCR pack unconfirmed. Financial Variance shows the exact OCR-vs-landed difference. Purchase/correction tables show Size (ml). Purchase, Ageing and FIFO tables allow right-edge resizing with remembered widths. True Receipt Ageing uses Box Mark; hover it for the technical lot.

<!-- V5D_ACTIONABLE_VERIFICATION_FRIENDLY_FIFO_20260903 -->
## Actionable Purchase Verification
Purchase Verification cards are clickable. Amber means review; green means the business issue is resolved; neutral is informational. OCR Pack Evidence can remain amber because it represents original extraction. If Pack Resolution is green, no further OCR action is required.

Click Financial Check or Financial Variance to open Financial Reconciliation and see exactly how WineShopPOS reached the landed total, plus the remaining OCR invoice difference and a View Original Invoice action.

Ageing/FIFO uses a readable Receipt Ref such as METRI-02/09. Hover it to see the technical database lot for audit/debug.

<!-- V5E_HYBRID_VERIFICATION_ENGINE_20260903 -->
## 2026-09-03 — V5-E
V5-E Purchase Verification: amber means action required, green means resolved, historical OCR is neutral. Financial exceptions can be accepted as reviewed variance or marked OCR total incorrect with an audited reason; this does not change purchase amount, stock or FIFO. Receipt Ref remains user-facing; technical lot is internal.

<!-- V5F_PRODUCT_MASTER_FIRST_EXTERNAL_ENRICHMENT_20260903 -->
## OCR product matching and Find Product Info
WineShopPOS checks Product Master first. A spelling error such as TABORG can still suggest the existing Tuborg product; when you confirm it, WineShopPOS remembers that OCR wording for later invoices.

For a genuinely unresolved line, click Find Product Info. Review suggested barcode, corrected name, brand, size and reference image, then choose Use Candidate to prefill Add Product. If the suggested barcode already exists in Product Master, WineShopPOS links the existing product instead of creating a duplicate.

External catalogue information is a suggestion. Product Master becomes authoritative only after your approval.

<!-- V5G_OWNER_CENTER_QUALITY_20260903 -->
## Owner Center — active loss vs audited corrections
Loss & Exceptions separates **Requires Action** from **Resolved / Audited Activity**. A legitimate completed-purchase correction appears in green audited history and no longer counts as an active loss exception. Damage, missing stock, unexplained/manual corrections and other unresolved rules can still require review.

Profit Intelligence SKU columns can be resized from the column's right edge and retain their widths. Recommendations has a lookback/refresh control. WhatsApp Summary can be refreshed or copied; WineShopPOS still never sends WhatsApp messages automatically.

The top header uses the compact shop-name selector again.

<!-- V5G1_INVENTORY_RESIZE_20260903 -->
## Inventory Current Stock column widths
On Inventory > Current Stock, drag a column's right edge to resize it. The left edge stays fixed and the selected column width is remembered in the browser.

<!-- V5H_FAST_POS_AND_HEADER_FIX_20260903 -->
## Fast POS Billing
Fast POS is optimized for counter speed:
1. Scan a barcode or type in the large search field.
2. You can also tap a category and product tile.
3. Current Sale remains visible with quantity controls and line totals.
4. Open Customer & Offers only for loyalty, coupons, store credit or gift vouchers.
5. Review Amount to Collect and choose CASH, UPI or CARD.
6. Complete Sale. Existing approval rules still apply to manual discount or changed sale price.

Inventory Current Stock columns use the right-edge resize control and remember widths in the browser.

## OCR product matching and catalogue lookup

A single exact existing supplier match is confirmed automatically. Ambiguous supplier matches remain manual.

WineShopPOS checks Product Master and learned aliases first. Weak similarity candidates are not auto-selected. If no reliable product exists, use **Search Product Catalogue** beside Product Resolution.

Catalogue results are suggestions only. If no result exists, use **Create OCR-Prefilled Product** or **Create New Product**. OCR prefills name, inferred brand/category, size, purchase price and bottles/case. Scan or type the barcode before saving if the catalogue did not provide one.

After returning to the invoice, review quantity and price and click **Confirm Line**. WineShopPOS learns that supplier description for future invoices. OCR and catalogue lookup never receive stock automatically.

## Error Messages During Invoice Review

WineShopPOS separates normal review guidance from system failures.

- Normal review guidance (for example, select a product or correct bottle quantity) can appear inside the page.
- A database, API or unexpected application failure appears in a larger **Something went wrong** dialog so the message is readable.
- Use **Close**, the **X** button, or the **Esc** key to dismiss the dialog.
- If **Confirm Line** fails, the line is not treated as confirmed. Review the displayed error before trying again.
- Alias learning during **Confirm Line** does not receive inventory by itself. Inventory is posted only through the authorized Receive Stock workflow.

## V5-F.2 Confirm Line preview retest

V3 preview: `https://wspv35c9453b6e9a1.z29.web.core.windows.net/v3-preview/`

For this regression:
1. Open Invoice OCR in the V3 preview.
2. Re-run the V5-F.2 test invoice.
3. Review the Product Master match and quantity/rate.
4. Click **Confirm Line**.
5. Expected: the prior `normalized_alias` generated-column error does not occur.
6. If a real system/database/runtime error occurs, WineShopPOS shows the larger error dialog with **Close**, **X**, and **Esc**.
7. Stop after Confirm Line verification for this focused test; do **not** use Receive Stock.

## Cancelled Invoice OCR review

Cancel Review keeps the original invoice saved and does not change stock.

To continue, use **Invoice Inbox → Reopen Review**, or select the same cancelled PDF again. If you select the same PDF again, WineShopPOS reopens and reuses the original invoice record before running OCR again.

## Products and Inventory

Products defines the item (name, barcode, category, pack and prices). Inventory holds the live quantity and audited stock movements. Inventory now shows key Product Master fields beside live stock.

## Physical Stock Count

Before a count starts, Stock Count shows current system stock. Start Stock Count only when ready to physically scan/count.

## Invoice dates

Supplier invoice dates use **DD/MM/YYYY**.

## Start a shift before billing

WineShopPOS will not allow a bill until you have an open shift. If no shift is open, POS shows **Start your shift before making any bill**.

1. Enter Opening Cash.
2. Select **Start Shift**.
3. Billing becomes available.

This rule applies to cashiers, managers and administrators.

## Barcode scanner settings

Barcode scanners still work automatically as keyboard input in POS. Scanner setup/testing is no longer a POS tab; administrators manage scanner hardware under **Settings & Admin → Hardware**.

## Physical Stock Count

Stock Count is a physical count. Start a session, physically scan/count stock, compare it with the system quantity, submit the count, and have a manager/admin approve discrepancies.

## Products vs Inventory

Products defines the SKU/barcode/category/pack/prices. Inventory owns current stock, movements, counts and FIFO. They remain separate for data safety, while Inventory shows key Product Master information beside live stock.

## Mobile and smaller screens

WineShopPOS navigation, panels, tabs, forms and tables adapt to smaller screens. Wide tables remain horizontally scrollable rather than cutting off columns.

## Physical Stock Count scan/search
1. Start/select an OPEN Stock Count.
2. Scan each bottle; one scanner event adds one unit.
3. If needed, search by barcode, SKU, name, brand, category, subcategory or size.
4. NOT COUNTED means not physically checked.
5. MARKED ZERO means explicitly confirmed zero.
6. Use Mark Unseen = 0 only after the physical walk/count is complete.
7. Submit, then Manager/Admin approves discrepancies.

## POS scanner rule
POS remains barcode scan-first. **Scan barcode or search product** is the cashier's primary product-entry workflow. Manual search is fallback.
