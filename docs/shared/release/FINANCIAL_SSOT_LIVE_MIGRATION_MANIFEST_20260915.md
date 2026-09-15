# Financial SSoT Live Migration Manifest — 2026-09-15

Status: **LIVE PROD BACKEND VERIFIED / GIT BODY BACKFILL PARTIALLY PENDING**

Current PROD project:
- ref: `uiurgplnsgmawvxhjzzp`
- project: `WineShopPOS`
- status at verification: `ACTIVE_HEALTHY`

Verified live migration history:
- `20260915035201` — `india_financial_date_consistency_v2`
- `20260915040745` — `financial_india_business_dates_v2`
- `20260915050757` — `financial_single_source_truth_v3`
- `20260915050958` — `financial_single_source_truth_v3_acl_hardening`

Current repository state:
- `20260915040745_financial_india_business_dates_v2.sql` is already tracked.
- The exact bodies for `20260915035201`, `20260915050757` and
  `20260915050958` remain to be backfilled into Git once direct database
  hostname resolution is available.

Why body backfill is pending:
The linked migration fetch failed with:
`getaddrinfo ENOTFOUND db.uiurgplnsgmawvxhjzzp.supabase.co`.

Release rule:
- DO NOT run `supabase db push` to "fix" this history gap.
- DO NOT run migration repair for this release.
- DO NOT replay any of the four migrations.
- Runtime backend state is already live and was reconciled independently.
- Backfill exact migration bodies later from verified remote history once the
  direct database path is available.

Functional financial release status is independent of this source-history
backfill because the live RPCs/ACLs were already verified before frontend
promotion.
