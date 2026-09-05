# V5-F.1 Rebuilt OCR / Product Enrichment UAT

Do not click **Receive Stock** during this UAT.

## Invoice A — Create and Learn
Use `V5F_UAT_INVOICE_A_CREATE_AND_LEARN.pdf`.

Expected:
1. OCR completes and shows stage timing.
2. A single exact existing supplier match auto-confirms.
3. ₹0 product-line gap is a simple green match.
4. Weak Product Master candidates are not presented as reliable matches.
5. `Search Product Catalogue` is beside Product Resolution.
6. Provider no-result never exposes raw HTTP 404 text.
7. Catalogue lookup checks UPCitemdb and Open Food Facts.
8. If no catalogue match exists, `Create OCR-Prefilled Product` is available.
9. OCR creation prefills name, inferred brand/category, size, purchase price and bottles/case; scan/type barcode if missing.
10. Create and return to OCR.
11. The created product is shown as linked; stale weak candidates are not shown as the linked product.
12. Confirm Line.
13. UI reports alias learned.
14. Stop. Do not Receive Stock.

## Invoice B — Alias Recheck
Use `V5F_UAT_INVOICE_B_ALIAS_RECHECK.pdf`.

Expected:
1. Exact supplier auto-confirms.
2. Learned alias resolves through Product Master without catalogue lookup.
3. Status says learned alias match.
4. Confirm the line.
5. Stop. Do not Receive Stock.
