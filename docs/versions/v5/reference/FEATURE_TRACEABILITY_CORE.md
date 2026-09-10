# V5 Core Feature Traceability

Status: **CURRENT V5 CURATED TRACEABILITY**

| V5 area | Main source surfaces | Data / service surface | Key test/evidence |
|---|---|---|---|
| Invoice OCR + retained evidence | `src/pages/AutomationHub.jsx`, `src/pages/InvoiceInbox.jsx`, invoice client/lib code | `invoice_ingestions`, Invoice API, OCR Edge Function | invoice golden contracts + V5 OCR UAT |
| Purchase Receiving | `src/pages/Purchases.jsx`, `src/lib/invoicePack.js`, `src/lib/packVerification.js` | purchase review-draft RPCs + purchase/inventory RPC path | `v5PurchaseIdentitySafety`, `v5PurchaseVerificationFlow`, V5 invoice fixtures |
| Atomic receive / Product Master creation | `src/pages/Purchases.jsx`, `src/context/ShopContext.jsx` | `receive_purchase_v3`, `products`, `inventory`, `purchase_items`, `stock_movements` | `v5_23_atomic_purchase_ocr_learning.test.mjs` + receiving idempotency tests |
| Purchase Verification / corrections | `src/pages/PurchaseDetails.jsx`, `src/components/PurchaseVerificationEngine.jsx`, `src/components/PurchaseCorrectionPanel.jsx` | verification/correction RPCs and audit records | `v5PurchaseVerificationFlow.test.mjs` |
| Product resolver / alias learning | Purchase/OCR resolver code + product enrichment Edge Function | `product_aliases`, `product_enrichment_cache`, resolver/alias RPCs | product enrichment / OCR regression tests |
| Product Image workflow | `src/components/ProductForm.jsx`, product pages + enrichment client | Product Image storage/enrichment functions | `productImageAutoSafety`, chooser/provider tests |
| USB / camera / phone scanner | `src/context/ScannerContext.jsx`, `src/components/MobileBarcodeScanner.jsx`, `src/components/GlobalPhoneScannerHost.jsx`, phone scanner pages | Supabase Realtime broadcast for phone transport | V5 phone/mobile scanner tests |
| Offline purchase recovery / authoritative sync | `src/pages/Purchases.jsx`, `src/lib/offlinePurchaseDraft.js` | encrypted IndexedDB recovery + server review-draft RPC | `v5DraftSyncCleanup`, V5_28/V5_28B UAT |
| Inventory scan/search + V5_29 layout | `src/pages/Inventory.jsx`, `src/index.css` | existing inventory read/adjustment paths; scanner transport unchanged | `v5_29_inventory_verification_confirm_pack.test.mjs` |
| One-button Confirm Pack | `src/pages/Purchases.jsx` | review draft retains baseline + internal `CONFIRMED_AS_POSTED` / `CORRECTED` state | V5_29 regression + manual UAT |

## Generated traceability

Run:

`npm run docs:traceability`

This generates:
- `reference/generated/SOURCE_DATA_ACCESS.md`
- `reference/generated/MIGRATION_FUNCTION_INVENTORY.md`
- `reference/generated/traceability.generated.json`

Generated output is discovery evidence, not a substitute for curated semantics or
live PROD verification.
