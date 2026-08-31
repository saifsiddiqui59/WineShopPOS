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

## 21. Help & User Manual

Open **Help & Manual** from the main navigation.

The Help Center provides clickable chapters for the main WineShopPOS workflows,
including billing, sales/returns, shifts, products, purchasing, inventory,
operations, Owner Center, reports, administration and troubleshooting.

Select a chapter to jump directly to its guidance, or select **Open Full User
Manual** for the complete manual with a clickable table of contents.


<!-- SUPPLIER_MASTER_OCR_PATCH -->
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
