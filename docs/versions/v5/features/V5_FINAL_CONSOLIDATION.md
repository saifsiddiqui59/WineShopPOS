# WineShopPOS V5 Final Consolidation
- Final image chooser: one Try Another Image action, India/Global, 20/page, up to 100 cached.
- SerpApi remains FREE-only; paid usage is blocked.
- Mobile Open Camera for product photo and free/open-source ZXing camera barcode scanner.
- Existing USB keyboard-wedge scanner remains unchanged.
- ml/cl/l are liquid units; unknown OCR size is review-required and no 750 ml default is invented.
- Beer-context Lagar/Larger normalizes to Lager for review/matching context.
- Server invoice_ingestions.review_draft is authoritative while online; offline review draft is AES-GCM encrypted on device.
- One Purchase Receiving Workspace: match/create inline, zero stock on create, Scan Now/Assign Later, line-level Pack Intelligence, Confirm as Posted/Correct Pack, financial reconciliation, six-decimal Price/Bottle.
- Barcode is not required for receiving; Products exposes Barcode Setup (N).
- Receive uses stable invoice/idempotency reference and duplicate-invoice recovery after reconnect.
- Post-receipt verification is line-level; one correction no longer resolves all lines.
- Golden contracts retained for invoices 15983 and 16845.
- No PROD mutation.

`ml` means millilitres, not machine learning.
