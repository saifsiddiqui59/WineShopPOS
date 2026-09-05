# WineShopPOS Documentation Register — V3

| Surface | Status |
|---|---|
| `docs/CURRENT_VERSION` | CURRENT BRANCH VERSION (`v3`) |
| `docs/versions/v3/README.md` | CURRENT V3 |
| `docs/versions/v3/architecture/` | CURRENT V3 ARCHITECTURE |
| `docs/versions/v3/reference/FEATURE_TRACEABILITY_CORE.md` | CURRENT V3 FEATURE TRACEABILITY |
| `docs/versions/v3/reference/data/TABLE_CATALOG.md` | CURRENT V3 DEV DATA BASELINE |
| `docs/versions/v3/reference/generated/` | GENERATED V3 DEPENDENCY EVIDENCE |
| `docs/versions/v3/security/` | CURRENT V3 SECURITY STATUS |
| `docs/versions/v3/testing/` | CURRENT V3 TEST/UAT STATUS |
| `docs/versions/v2/` | PREVIOUS PROD GENERATION + PROD DELTA HISTORY |
| `docs/versions/v1/` | HISTORICAL V1 |
| `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md` | CROSS-VERSION RELEASE FAILURE KNOWLEDGE |
| `docs/versions/v3/releases/PROD_PROMOTION_2026-09-05.md` | VERIFIED V3->PROD PROMOTION EVIDENCE |
| `docs/versions/v3/releases/V3_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-05.md` | V3 RELEASE LESSONS / REQUIRED V4 INPUT |
| `docs/shared/release/README.md` | CROSS-VERSION RELEASE DOCUMENT ENTRY POINT |
| `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md` | REQUIRED V4+ E2E TEST/PROMOTION STANDARD |
| `docs/backups/prod/` | VERIFIED PROD PRE-RESTRUCTURE BACKUP PROVENANCE |

Compatibility files at legacy paths remain V3 branch references until the
current V3 user/architecture/operations documents are fully migrated into the
versioned tree.

## V4 release documentation contract

Before any V4 production executor or deployment is generated, read:

1. the canonical shared failure register;
2. the cross-version E2E release playbook;
3. the V3->PROD retrospective;
4. current Git/source/migrations/live deployment state.

Do not infer deployed application identity from the latest `main` SHA alone.
