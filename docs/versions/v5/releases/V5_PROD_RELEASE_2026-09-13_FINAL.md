# WineShopPOS V5 Production Release — 2026-09-13

Status: **DEPLOYED**

Runtime commit:
`309ee5b8fd0e4f6fdee167c63198e266be9cf609`

Previous production main:
`770d8db9674151aebe249976a82d042cd57cfed1`

Production URL:
`https://wineshoppos.z29.web.core.windows.net/`

Frontend entry:
`/assets/index-cKfqaUht.js`

Production verification:
- 3 V5 migrations applied and verified
- latest V5 ocr-invoice deployed
- latest V5 product-enrichment deployed
- AI OCR exception configuration present
- exact candidate frontend deployed
- direct PROD Supabase authentication/profile/shop access PASS
- SPA-preserving authenticated browser smoke PASS
- main fast-forwarded to exact deployed runtime

Phone-as-Barcode-Scanner human UAT: **COMPLETE / WORKING**

DEV business data was not copied to PROD.
DEV-only forensic/stress functions were not deployed.

Evidence:
`/e/WineShopPOS_V5_PROD_AUTH_SMOKE_20260913_171630`
