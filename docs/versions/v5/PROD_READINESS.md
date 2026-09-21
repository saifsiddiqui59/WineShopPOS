# WineShopPOS V5 -> PROD

Status: **DEPLOYED — FINANCIAL SSoT ALL-10 RELEASE PASS**

Current deployed application runtime:

`483ad7fedfa99ed6e033c9967a60f91319e37919`

Production:

`https://wineshoppos.z29.web.core.windows.net/`

Production Supabase:

`uiurgplnsgmawvxhjzzp`

## Verified release state

- V5 main promotion: **PASS**
- Financial SSoT backend: **LIVE / RECONCILED**
- Financial SSoT all-10 frontend/source: **PASS**
- Production build: **PASS**
- Azure static-site deployment: **PASS**
- Public exact artifact identity: **PASS**
- Public financial markers: **PASS**
- Storage deployment key cleanup: **PASS**
- Sales/purchases/returns/shifts/stock replay during financial release: **NONE**
- V3 mutation during financial release: **NONE**

## Current financial authority

The current financial implementation includes:
- India/offline business-date handling;
- Net Revenue after approved returns;
- FIFO COGS net of approved returned FIFO cost;
- FIFO landed current inventory valuation;
- all-tender payment mix including store credit/gift voucher and refunds;
- return-adjusted inventory/reorder demand;
- landed-cost Purchase Intelligence;
- server-paginated Reports;
- Owner / Dashboard / Reports / AI financial formula alignment;
- permanent reconciliation regression checks.

## Post-baseline production hotfix checkpoint — 2026-09-21

Verified:
- V13 evidence-localized OCR source/frontend/Edge line is live;
- V13R1 Financial Reconciliation / Product Cost Review separation is live;
- invoice 19185 backend finance remains MATCH: line product value ₹83,944, calculated invoice ₹70,185, printed invoice ₹70,185, difference ₹0;
- finance backend implementation was not changed by V13R1;
- no inventory mutation occurred during OCR review.

Open:
- invoice 19185 OCR date remains unresolved; competing OCR/AI readings are not trustworthy enough for auto-confirmation;
- Azure OCR polling HTTP 429 is a known resilience gap and must be fixed before high-volume OCR certification;
- complete authenticated 19185 line/pack/product review and representative-invoice regression UAT before declaring OCR redesign complete.

## Remaining follow-up

- Authenticated read-only financial cross-page visual UAT: **PENDING**
- Exact Git source-body backfill for live migrations
  `20260915035201`, `20260915050757`, `20260915050958`:
  **PENDING_DNS / NON-RUNTIME**
- Do **not** use database push, migration repair, or migration replay for that
  source-history follow-up.

See:
- `reference/PROD_TREE_STRUCTURE_2026-09-15.md`
- `../../shared/release/FINANCIAL_SSOT_LIVE_MIGRATION_MANIFEST_20260915.md`
