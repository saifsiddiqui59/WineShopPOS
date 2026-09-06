# Chapter 8 — Persistent Product Master

Status: COMPLETE

Implemented:

- Product Master persisted in LocalStorage
- Add New Product
- opening stock
- duplicate barcode prevention
- duplicate SKU prevention
- Edit Product
- product edits do not overwrite inventory
- deactivate Product
- reactivate Product
- inactive products excluded from POS
- inactive products excluded from Receive Stock
- inactive products remain in history

LocalStorage:

`wineshop_products_v1`

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Current V2 Product Master note — 2026-08-31

This historical Product Master chapter remains for implementation history.
Current production behavior is:

- normal Add Product: Barcode mandatory;
- SKU: automatic server-generated `WSP-######` per shop;
- Opening Stock: removed from Product Master;
- bulk manual/Invoice OCR onboarding: Barcode optional;
- stock after Product creation: zero;
- purchased physical stock enters through Receive Stock;
- Product Master barcode filters: All / With Barcode / Without Barcode.

When this historical chapter conflicts with current source/migrations, current V2
source and additive migrations are authoritative.
