# WineShopPOS Documentation Register — V5

Status: **V5 PROD PROMOTION CANDIDATE — PROD DEPLOYMENT NOT YET DECLARED**

| Surface | Status |
|---|---|
| `AGENTS.md` | MANDATORY NEW-CHAT / AGENT ENTRY POINT |
| `docs/CURRENT_VERSION` | CURRENT REPOSITORY GENERATION (`v5`) |
| `docs/versions/v5/README.md` | CURRENT V5 INDEX |
| `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md` | CURRENT V5 CONTINUATION AUTHORITY |
| `docs/versions/v5/architecture/README.md` | CURRENT V5 ARCHITECTURE |
| `docs/versions/v5/reference/FEATURE_TRACEABILITY_CORE.md` | CURRENT V5 CURATED FEATURE TRACEABILITY |
| `docs/versions/v5/reference/data/TABLE_CATALOG.md` | CURRENT V5 DATA-OBJECT CATALOG |
| `docs/versions/v5/reference/generated/` | CURRENT V5 GENERATED SOURCE/MIGRATION TRACEABILITY |
| `docs/versions/v5/security/README.md` | CURRENT V5 SECURITY / PROMOTION CONTROLS |
| `docs/versions/v5/testing/README.md` | CURRENT V5 TEST / UAT / QUALIFICATION STATUS |
| `docs/versions/v5/features/` | V5 FEATURE-SPECIFIC DOCUMENTATION |
| `docs/versions/v5/releases/` | V5 RELEASE / CONTINUATION / PROMOTION RECORDS |
| `docs/versions/v5/releases/V5_TO_PROD_PROMOTION_READINESS_2026-09-10.md` | V5 -> PROD PRE-PROMOTION RECORD |
| `docs/versions/v4/` | PREVIOUS DEPLOYED PROD GENERATION / V5 INHERITED BASELINE |
| `docs/shared/governance/NEW_VERSION_BOOTSTRAP_AND_CONTINUITY_STANDARD.md` | V5+ VERSION CONTINUITY STANDARD |
| `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md` | CROSS-VERSION FAILURE KNOWLEDGE |
| `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md` | CROSS-VERSION PROD RELEASE STANDARD |

## Required read order

1. `AGENTS.md`
2. `docs/CURRENT_VERSION`
3. `docs/DOCUMENTATION_REGISTER.md`
4. `docs/versions/v5/README.md`
5. `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md`
6. shared governance + release playbook + failure register
7. V4-to-PROD retrospective
8. current Git source/migrations
9. verified live environment state for the affected system

## Release-state rule

Do not infer deployment from a branch name or documentation version.

Before PROD:
`V5 = current promotion candidate; V4 = previous deployed baseline`.

After authenticated PROD verification:
update V5 release docs with the actual deployed SHA/artifact hash and publish the
whole-version V5-to-PROD retrospective.

Truth:
`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS > MEMORY`
