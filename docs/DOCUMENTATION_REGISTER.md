# WineShopPOS Documentation Register — V5 PROD

Status: **V5 DEPLOYED TO PROD — CURRENT APPLICATION RUNTIME `0ffe5335278c4075c81629e3807738bae702c66b`**

Production frontend: `https://wineshoppos.z29.web.core.windows.net/`
Production Supabase: `uiurgplnsgmawvxhjzzp`

| Surface | Status |
|---|---|
| `AGENTS.md` | MANDATORY NEW-CHAT / AGENT ENTRY POINT |
| `docs/CURRENT_VERSION` | CURRENT REPOSITORY GENERATION (`v5`) |
| `docs/DOCUMENTATION_REGISTER.md` | CURRENT DOCUMENTATION AUTHORITY |
| `docs/versions/v5/reference/PROD_TREE_STRUCTURE_2026-09-15.md` | EXACT CURRENT PROD/MAIN REPOSITORY TREE SNAPSHOT |
| `docs/versions/v5/README.md` | CURRENT V5 INDEX |
| `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md` | CURRENT V5 PROD CONTINUATION AUTHORITY |
| `docs/versions/v5/PROD_READINESS.md` | CURRENT PROD DEPLOYMENT / VERIFICATION CHECKPOINT |
| `docs/versions/v5/architecture/README.md` | V5 ARCHITECTURE |
| `docs/versions/v5/reference/FEATURE_TRACEABILITY_CORE.md` | CURATED V5 FEATURE TRACEABILITY |
| `docs/versions/v5/reference/data/TABLE_CATALOG.md` | V5 DATA-OBJECT CATALOG |
| `docs/versions/v5/reference/generated/` | GENERATED SOURCE/MIGRATION TRACEABILITY |
| `docs/versions/v5/security/README.md` | V5 SECURITY CONTROLS |
| `docs/versions/v5/testing/README.md` | V5 TEST / UAT / QUALIFICATION RECORDS |
| `docs/versions/v5/features/` | V5 FEATURE-SPECIFIC DOCUMENTATION |
| `docs/versions/v5/releases/` | V5 RELEASE / PROMOTION HISTORY |
| `docs/shared/release/FINANCIAL_SSOT_LIVE_MIGRATION_MANIFEST_20260915.md` | LIVE FINANCIAL MIGRATION STATE + PENDING_DNS SOURCE-BODY BACKFILL |
| `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md` | CROSS-VERSION EXECUTOR FAILURE KNOWLEDGE |
| `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md` | CROSS-VERSION PROD RELEASE STANDARD |
| `docs/versions/v4/` | PREVIOUS GENERATION / HISTORICAL BASELINE |

## Required read order

1. `AGENTS.md`
2. `docs/CURRENT_VERSION`
3. `docs/DOCUMENTATION_REGISTER.md`
4. `docs/versions/v5/reference/PROD_TREE_STRUCTURE_2026-09-15.md`
5. `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md`
6. `docs/versions/v5/PROD_READINESS.md`
7. `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md`
8. `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md`
9. current Git source/migrations
10. verified live environment state for the affected system

## Current production authority

The deployed WineShopPOS application runtime is commit:

`0ffe5335278c4075c81629e3807738bae702c66b`

Financial SSoT all-10 release status:
- backend financial consistency: **PASS**
- source/build: **PASS**
- Git promotion: **PASS**
- Azure deployment: **PASS**
- public artifact/financial marker verification: **PASS**
- business transaction replay during release: **NONE**
- authenticated financial cross-page visual UAT: **PENDING**
- exact Git body backfill for 3 already-live financial migrations: **PENDING_DNS / NON-RUNTIME**

A later documentation-only commit may make `main` newer than the deployed
application SHA. That does **not** mean a newer frontend was deployed.

Truth:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS > MEMORY`
