# WineShopPOS — Documentation Register

**Current documentation generation: V2**

WineShopPOS maintains ONE canonical copy of each living document.

| Document | Status | Purpose |
| --- | --- | --- |
| `README.md` | CURRENT V2 | repository entry point |
| `docs/README.md` | CURRENT V2 | documentation index |
| `docs/PROJECT_CONTEXT.md` | CANONICAL CURRENT | architecture/current state |
| `docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md` | CANONICAL CURRENT V2 | master developer/operations handbook |
| `docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md` | CANONICAL CURRENT V2 | master user manual |
| `docs/AI_PRODUCTION_BASELINE.md` | CANONICAL CURRENT | AI deployment/runtime baseline |
| `docs/DOCUMENTATION_REGISTER.md` | CANONICAL CURRENT | document ownership/status |
| `docs/chapters/V2-*` | CURRENT V2 HISTORY | V2 chapter records |
| `docs/chapters/01-*...26-*` | HISTORICAL | pre-V2 implementation history |
| `docs/v2/*` | V2 EXECUTION RECORD | V2 specification/audit/evidence |
| `docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md` | CURRENT AUDIT | Push-3 canonical documentation reconciliation evidence |
| `docs/v2/audit/AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md` | CURRENT AUDIT | Monitor access resolved; trace ingestion pending E2E verification |
| `docs/code-history/*` | HISTORICAL BACKUP | superseded snapshots |

## Rule

Do not create parallel canonical documents such as:

- `docs/HANDBOOK.md`
- `docs/USER_MANUAL.md`
- another competing V2-only master handbook/manual

The existing master Handbook and existing master User Manual evolve in place.

Git history plus versioned chapter records preserve historical evolution.

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## 2026-08-31 — Product Master real-catalogue milestone

The canonical current documents now include automatic per-shop SKU, removal of
Opening Stock from Product Master, manual/OCR Bulk Product Import, unresolved OCR
line round-trip, barcode-completion filtering and retirement of the legacy sample
catalogue. Current detail is maintained in Project Context, the Master Developer
Handbook, Master User Manual, Product Master chapter, V2 Purchase/Inventory
chapters, Master test matrix and Master handoff.

## V3-01 API Automation Integration
<!-- V3_API_AUTOMATION_20260831 -->
- `docs/chapters/V3-01-api-automation-integration.md` — private invoice storage, persistent Inbox, duplicate protection and Email automation foundation.
- Feature commit: `7dd99f21e03e79b17490c837cb1bd5d470823dca`
- Branch: `V3`; Preview: `https://wspv35c9453b6e9a1.z29.web.core.windows.net/`
- Gmail Logic App: AUTHORIZATION REQUIRED / NOT DEPLOYED
- Main merge: NOT YET
