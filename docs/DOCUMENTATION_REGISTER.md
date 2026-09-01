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

### V3 Email automation documentation (20260831T123139Z)
V3 Email invoice automation is deployed on branch `V3`. Gmail uses a dedicated App Password kept only in Azure Function settings. Unread PDF/JPEG/PNG invoices from a registered EMAIL channel are polled every 5 minutes, deduplicated, stored in private Blob, OCR-processed, and routed to Invoice Inbox. Inventory remains unchanged until a human completes Receive Stock. WhatsApp V3-01B is preserved but ON HOLD.

- V3 Demo Ready (20260831T160407Z): feature commit `234088b6715110536391f9adf5c8398407606035`; production deployment verified before documentation. Covers V3-01D reliability, >4 MB Email feedback, barcode repair, ADMIN Demo/Test Data Reset, 64-bit V3 invoice Function and production demo promotion. Logic App cost cadence optimization remains deferred.

- V3-02 (20260831T182936Z) — LOCAL VERIFIED / NOT DEPLOYED / NOT PUSHED. Feature `0bc8d8db4e0fadfe2cb5a942bc0d40de2e9a7310`. Invoice financial reconciliation + landed-cost auto-fill + Email receipt ACK + optional supplier invoice/reference + mandatory-field stars.

- V3-03 (20260831T193701Z): local verified feature `ce1c14c8772fdb024f346b64a3aa8c278da9f2c5` — finance parser false-match repair, printed-total reconciliation, mismatch popup, OCR MRP extraction, first-token Brand and Category suggestion. Deployment/push pending.

- V3-03B (20260831T195134Z): deployed Bulk Product Import barcode scanner capture `94e65616a4df66148dfcf1e9d8da13f6c7970d53`; V3-03 finance/MRP/category improvements deployed; Logic App scheduler intentionally paused.

- V3-04 (20260901T055315Z): `7340fac6604d9e0e6281dd7c82070ffb818d4c9f` — live-Azure-verified semantic liquor invoice table extraction, finance reconciliation hardening, review-safe Batch/MRP handling, validated case derivation, 6-decimal unit-cost precision, FIFO SELL FIRST/BOX mark, and clarification that prior V3-02 Email acknowledgement features were already pushed to main. Logic App remains Disabled.

- `docs/testing/V3_05_END_TO_END_TEST_MATRIX.md` — V3-05 final acceptance matrix.
- `docs/code-history/v3-05-final-20260901T111035Z.md` — V3-05 deployed feature code history.
