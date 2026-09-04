# V3 Demo Ready Test Matrix

## Production smoke
- Production root URL returns the current Vite application.
- Login and navigation load normally.
- Invoice Inbox, OCR Review and Receive Stock routes open.

## Barcode
- Scanner Test accepts a normal HID scan ending in Enter.
- Scanner Test accepts a HID scan ending in Tab.
- Leading-zero barcodes remain unchanged.
- Trailing CR/LF/whitespace does not cause PRODUCT NOT FOUND.
- A known active product barcode adds the correct product to POS.
- Unknown barcode still shows PRODUCT NOT FOUND and the Add Product action.

## Email <= 4 MB
- Send PDF/JPG/PNG from the registered shop Email.
- Do not manually invoke the Function.
- Within the current ~5 minute polling cadence it appears in Invoice Inbox.
- Opening the Email in Gmail does not prevent processing.
- Reprocessing the same document does not create a duplicate receivable purchase.

## Email > 4 MB
- Send a supported invoice attachment above 4 MB from the registered shop Email.
- Verify no purchase/inventory mutation occurs.
- Verify the sender receives a WineShopPOS reply naming the oversized attachment and 4 MB limit.
- Verify the same Gmail UID does not repeatedly receive the rejection response.
- Unauthorized senders must not receive this automated business response.

## Invoice review reliability
- Partially review an OCR invoice, leave, and Resume Draft from Invoice Inbox.
- Verify supplier/product/quantity edits persist.
- Save Draft / Cancel / Reopen.
- Receive Stock only after final human confirmation.
- Verify invoice cannot be received twice.

## Demo/Test Data Reset
- ADMIN only.
- Wrong confirmation phrase is rejected.
- Exact DELETE DEMO DATA + browser confirmation is required.
- Products, purchases, sales, inventory, suppliers and invoice review records are cleared.
- Shop identity/users/settings/categories/Email sender mapping remain.
- Audit trail remains available.

## Infrastructure
- V3 invoice Function reports 64-bit worker configuration.
- Email health reports IMAP connected, SMTP connected, Blob UID checkpoint and oversize replies enabled.
- Logic App remains at 5-minute recurrence for current testing.

## Deferred
- Increase Logic App polling interval after acceptance testing to reduce cost.
