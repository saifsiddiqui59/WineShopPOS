# Product Enrichment V2 — Two-Pass Discovery + Physical Barcode Confirmation

Marker: `V5_PRODUCT_ENRICHMENT_V2_20260907`

Status: IMPLEMENTED ON V5 / DEV QUALIFICATION PENDING

Starting V5 SHA: `2a089219492aa9105a1733fcd0e622672b5304f5`

## Scope

This extends the existing WineShopPOS product-enrichment architecture. It does not create a global product catalogue and does not add an LLM/AI model.

Flow:

1. DISCOVERY may run before a barcode exists using product name, brand, size and package context.
2. UPCItemDB + OpenFoodFacts run first.
3. Brave Images is used only when useful visual candidates are insufficient and `BRAVE_SEARCH_API_KEY` exists as a DEV Supabase Edge Function secret.
4. An internet barcode is suggestion-only.
5. User selects the physical item candidate.
6. Existing ScannerContext captures the completed physical scan; no API call is made for each typed digit.
7. BARCODE_CONFIRM compares exact provider evidence with the selected/current identity.
8. Outcomes are CONFIRMED, CONFLICT, or UNVERIFIED.
9. Product Master changes happen only through the existing explicit Add/Edit Save action.
10. Optional external image import happens after save, server-side, from the server-cached candidate ID.

## Security

- Authenticated session + active current-shop membership is verified server-side.
- Finalization requires ADMIN or MANAGER.
- Final image import accepts `confirmationCacheKey + candidateId`; it does not accept an arbitrary browser URL.
- Image download requires HTTPS, DNS safety validation, redirect revalidation, private/loopback/link-local/metadata blocking, timeout, 5 MB limit, and JPEG/PNG/WebP magic-byte validation.
- SVG/HTML are rejected.
- Existing `product-images` storage and `set_product_image` RPC are reused.
- Explicit enrichment evidence is written to the existing `audit_logs` table.
- No inventory, purchase, sales, payment, price or stock mutation is performed by enrichment.

## Current architecture limitation

The current Product Master schema has no persisted package-type column. Therefore CAN/TIN vs BOTTLE/BTL is lookup/verification context only in this V5 implementation. No schema field was invented in this task.

## Brave configuration

Server secret name only:

`BRAVE_SEARCH_API_KEY`

No value belongs in Vite, React, Git or documentation.

If the secret is absent, Brave returns `NOT_CONFIGURED`; UPCItemDB/OpenFoodFacts/manual creation continue normally.

## Regression correction

The former OCR flow could pass an internet-candidate barcode into Add Product. V5 now passes only the physically scanned barcode. Candidate internet barcodes remain visibly unverified suggestions until physical confirmation.

Unknown new-product size is no longer silently defaulted to 750 ml. A valid size must be entered/confirmed before save.

## Qualification boundary

Automated unit/lint/build/deployment checks do not equal human UAT. Physical scanner, real external-provider behavior, light/dark imagery, and cross-shop negative tests remain MANUAL_UAT until verified in the V5 preview.
