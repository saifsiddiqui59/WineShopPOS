# WineShopPOS Documentation Register — V4

| Surface | Status |
|---|---|
| `docs/CURRENT_VERSION` | CURRENT BRANCH VERSION (`v4`) |
| `docs/versions/v4/README.md` | CURRENT V4 |
| `docs/versions/v4/architecture/` | CURRENT V4 ARCHITECTURE / DESIGN RECORDS |
| `docs/versions/v4/reference/FEATURE_TRACEABILITY_CORE.md` | CURRENT V4 FEATURE TRACEABILITY |
| `docs/versions/v4/reference/data/TABLE_CATALOG.md` | V4 MIGRATION DELTA + INHERITED V3 DATA BASELINE |
| `docs/versions/v4/reference/generated/` | GENERATED V4 STATIC DEPENDENCY EVIDENCE |
| `docs/versions/v4/security/` | CURRENT V4 SECURITY STATUS |
| `docs/versions/v4/testing/` | CURRENT V4 TEST/UAT STATUS |
| `docs/versions/v4/releases/` | V4 PRE-PROD / RELEASE EVIDENCE |
| `docs/versions/v3/` | VERIFIED PROD/V3 LINEAGE INHERITED FROM PINNED MAIN |
| `docs/versions/v2/` | PREVIOUS PROD GENERATION + HISTORY |
| `docs/versions/v1/` | HISTORICAL V1 |
| `docs/shared/governance/` | CROSS-VERSION DOCUMENTATION / CLASSIFICATION STANDARD |
| `docs/shared/templates/` | CROSS-VERSION DOCUMENT TEMPLATES |
| `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md` | CROSS-VERSION RELEASE FAILURE KNOWLEDGE |
| `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md` | REQUIRED V4+ E2E TEST/PROMOTION STANDARD |
| `docs/versions/v3/releases/V3_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-05.md` | REQUIRED V4 RELEASE INPUT |

Compatibility/historical documents outside `docs/versions/v4/` remain available,
but they are not allowed to override the V4 truth order.

## V4 release documentation contract

Before any V4 production executor or deployment is generated, read:

1. `docs/CURRENT_VERSION`;
2. this register;
3. shared release failure register;
4. shared E2E release playbook;
5. V3->PROD retrospective;
6. V4 release/migration evidence;
7. current Git/source/migrations;
8. verified DEV and PROD live state.

Do not infer deployed application identity from the latest `main` SHA alone.

## Global version inheritance rule

Every new version inherits PROD's repository structure, coding conventions,
documentation governance, testing structure, migration discipline, security
controls, environment-isolation rules, and release/promotion workflow while
keeping its own version-specific code, migrations, DEV configuration, QA/UAT
evidence, and version documentation.

PROD-only runtime/state items, credentials, business data, deployment state,
emergency fixes, backups, and unknown production-only artifacts must never be
blindly copied.
