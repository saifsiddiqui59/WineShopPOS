# WineShopPOS User Manual — Advanced Operations (Chapters 16–26)

## Who should use this manual
- Cashier: POS, shift, return request, own sales, offline queue, scanner test.
- Manager: all Cashier tasks plus products, inventory, stock count, receiving, procurement, reordering, transfers, OCR review.
- Admin: all shop functions plus users, audit, printer/shop settings.

## 1. Start of day — Cashier
1. Sign in.
2. Open **Shift / Close**.
3. Enter physical opening cash in the drawer.
4. Select **Open Shift**.
5. Open POS. A Cashier cannot complete an online sale without an open shift.

## 2. Barcode billing
The scanner works globally. You do not need to click a barcode box.
- Scan a known barcode: product is added and success beep plays.
- Scan again: quantity increases.
- Unknown barcode: red PRODUCT NOT FOUND panel appears.
- Manager/Admin may choose **Add Product with this Barcode**.

The scanner should be configured to send Enter after every barcode.

## 3. Complete a sale
1. Verify cart and quantity.
2. Enter discount if approved by shop policy.
3. Select CASH/UPI/CARD.
4. Enter UPI/Card reference if used.
5. Complete sale.
6. Print receipt if required.

## 4. Return request
1. Open **Returns / Voids**.
2. Select original invoice.
3. Enter return quantity beside the product.
4. Enter reason/refund method.
5. Submit.

No stock changes while request is pending. Manager/Admin approves or rejects. Do not manually adjust stock to imitate a return.

## 5. Void invoice (Manager/Admin)
Use only for a fully cancelled clean transaction. Select invoice, enter reason and choose **Void Entire Sale**. Do not use Void after a partial return has started.

## 6. End cashier shift
1. Count actual cash physically.
2. Open **Shift / Close**.
3. Enter Actual Cash and request close.
4. Manager/Admin compares expected versus actual cash and approves close.
5. Investigate/document any variance.

## 7. Physical stock count (Manager/Admin)
1. Inventory → Stock Count → Start Stock Count.
2. Walk the shop and scan bottles. Repeated scans increment count.
3. For bulk shelf/case counts, type counted quantity manually.
4. After the full shop is counted, review unseen SKUs.
5. Only if truly absent, use **Mark Unseen = 0**.
6. Submit.
7. Manager/Admin approves. Approval is when inventory changes.

## 8. Thermal receipt
Admin opens Printer settings and configures 80mm or 58mm, store address/phone/footer. On invoice choose **Print Receipt**, select the installed thermal printer and use minimum/no margins.

## 9. Purchase Order
1. Procurement → select supplier.
2. Add products/ordered quantities/purchase prices.
3. Create PO.
4. Mark Sent when ordered.
5. When goods arrive choose Receive, enter supplier invoice number.
6. Inventory increases only after Receive succeeds.

## 10. Supplier payment
Procurement → Record Supplier Payment. Select supplier, amount, method and reference. Supplier Balance shows received invoices less payments and purchase returns.

## 11. Purchase return
Use Supplier Return only when goods physically leave the shop. The system checks stock, decreases inventory and records a supplier-return movement.

## 12. Purchase price history
Open **Price History**, choose product and compare invoices. Positive percentage means latest known purchase cost increased versus the oldest row loaded.

## 13. Smart reorder
Open **Smart Reorder**. Default history is 30 days and target is 7 stock days. Review suggested bottles/cases and create a PO where appropriate. The suggestion is a calculation, not a mandatory order.

## 14. Branch transfer
Branches must be configured by platform administration under the same organization.
- Source creates transfer request.
- Stock does not move yet.
- Destination Manager/Admin verifies goods/request and approves.
- Approval moves source and destination stock together.

Never use branch transfer to move stock between unrelated customer accounts.

## 15. Audit (Admin)
Audit shows important creates/updates and business actions. Use it to investigate price changes, stock adjustments, voids, refunds, receipts and transfers. JSON details may show before/after values.

## 16. Internet outage / Offline POS
Offline selling is emergency-only.
1. The device must have been logged in and loaded online previously.
2. If connection drops, POS can store a sale in the encrypted local queue.
3. The Offline Queue shows pending items.
4. On reconnection choose Sync Now.
5. If server rejects a sale due to stock/authorization/shift conflict, do not delete it casually. Manager reconciles the physical receipt and cloud stock.
6. Sync before requesting shift close.

## 17. Invoice OCR (Manager/Admin)
1. OCR / Automation → choose invoice photo/PDF.
2. Analyze.
3. Review supplier, invoice number, every line, quantity, price and product match.
4. Send reviewed draft to Receive Stock.
5. Review again and press Confirm & Receive Stock.

OCR by itself never updates stock. If the page says OCR_NOT_CONFIGURED, Azure Document Intelligence has not yet been activated by the developer.

## 18. Daily Manager checklist
- pending returns
- cashier close requests/variances
- offline conflicts
- submitted stock counts
- low-stock reorder list
- open/partially received POs
- supplier balances
- unusual audit events

## 19. Troubleshooting
### Product not found
Check barcode in Products. If new, add it using the unknown-barcode action.

### Cashier gets SHIFT_REQUIRED
Open Shift / Close and start a shift.

### Offline sale will not sync
Read the conflict message. Common reasons are insufficient current stock or a closed/missing cashier shift.

### Scanner behaves like keyboard typing
Use Scanner Test. Confirm scanner appends Enter and adjust average key-gap threshold only after testing.

### Receipt width wrong
Admin → Printer → choose 58/80mm matching paper; use browser minimum/no margins.

### OCR not configured
This is not a user error. Developer must configure Azure Document Intelligence Edge Function secrets.
