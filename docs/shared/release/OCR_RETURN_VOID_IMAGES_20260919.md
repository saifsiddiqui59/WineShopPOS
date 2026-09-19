# OCR Spelling + Barcode Return/Void + One-Time Product Image Completion

Date: 2026-09-19

## PROD backend already live

### OCR deterministic spelling normalization

The production OCR normalization path already applies:

- `KFULTRA` -> `KF ULTRA`
- `STORNG` -> `STRONG`

The rules are exact-token, case-insensitive corrections and are applied to both
prebuilt invoice items and semantic-table descriptions. They are not a general
fuzzy rewrite system.

### Return / Void barcode lookup

PROD migration:

`20260919110955_return_void_barcode_lookup_v1`

Functions:

- `return_void_invoice_lookup_v1`
- `return_void_sale_context_v1`

Barcode scanning is lookup-only. It lists accessible invoices containing the
scanned product and never changes stock, refunds money or voids a sale by itself.

Cashier scope is own sales. Manager/Admin scope is the current shop.

Invoice context subtracts both PENDING and APPROVED return quantities before
showing the available return quantity.

Existing `create_return_request`, approval/rejection and `void_sale` remain the
authoritative mutation paths.

## One-time product image completion

Product images were completed as a one-time PROD background maintenance task.

Verified current PROD result:

- Active products: 39
- Products with image: 39
- Missing images: 0

There is intentionally no permanent `Update Missing Images` button.

The one-time maintenance path was closed after completion. Temporary HTTP helper
extensions used only to invoke the one-time background task were removed again.

Normal Edit Product image replacement/correction remains available.
