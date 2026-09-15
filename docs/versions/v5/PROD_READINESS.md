# WineShopPOS V5 -> PROD

Status: **DEPLOYED — FINANCIAL SSoT ALL-10 RELEASE PASS**

Current deployed application runtime:

`0ffe5335278c4075c81629e3807738bae702c66b`

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
