# WineShopPOS Developer Handbook

**Version:** 1.0  
**Date:** 29 August 2026  
**Production:** https://wineshoppos.z29.web.core.windows.net/  
**Repository:** https://github.com/saifsiddiqui59/WineShopPOS.git

> This Markdown companion is intentionally shorter than the Word handbook. The Word handbook contains the full appendices with generated scripts and SQL.

## Current Architecture

```text
Barcode Scanner -> React/Vite SPA -> Supabase Auth -> PostgreSQL/RLS/RPCs
                                      |
                                      +-> Edge Function manage-shop-users
Frontend hosting: Azure Blob Static Website
```

## Current Status

- Chapters 1-15 implemented for the current cloud MVP.
- Supabase is the live source of truth for products, inventory, purchases, sales and payments.
- Azure production URL: https://wineshoppos.z29.web.core.windows.net/
- Multi-shop and subscription kill switch are implemented.
- ADMIN can create MANAGER/CASHIER; Shop ADMIN cannot create another ADMIN.
- OCR invoice receiving is **not implemented yet**.

## Important Security Note

A service-role key was previously exposed in chat. Rotate it if not already rotated. Never commit service-role/secret credentials.

## Canonical Files

- `supabase_multi_shop_schema.sql`
- `supabase/functions/manage-shop-users/index.ts`
- `src/context/AuthContext.jsx`
- `src/context/ShopContext.jsx`
- `deploy_azure_blob.sh`
- `finalize_wineshoppos.sh`
- `docs/testing/FINAL_SMOKE_TEST.md`

## Known Hardening Before Strict Production

1. Tighten RLS so Cashier cannot query all shop sales/purchases directly.
2. Prevent Cashier access to purchase_price at database level, not only UI level.
3. Add platform audit log and MFA.
4. Complete compliance review for applicable liquor/tax/excise requirements.

## See the Word Handbook

`WineShopPOS_Developer_Handbook.docx` contains the full chapter history, database/RPC reference, testing matrix, operational runbook, troubleshooting, OCR design, and verbatim code/SQL archive.
