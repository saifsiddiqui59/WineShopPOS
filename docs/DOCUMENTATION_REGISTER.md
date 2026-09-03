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

- `docs/testing/PROGRAMMATIC_E2E_TESTING.md` — Playwright read-only E2E framework and safe transactional E2E design.

- `docs/testing/V3_07_LOGIN_E2E_VERIFICATION.md` — hosted V3 preview evidence for V3-07 login reliability and Playwright E2E.

- `docs/testing/V3_07_AI_PRODUCTION_VERIFICATION.md` — V3-07 production Owner AI deployment and authenticated app-help verification evidence.

- `docs/testing/AI_PRODUCTION_TRACE_INGESTION_VERIFICATION.md` — authenticated production Foundry/Application Insights trace-ingestion evidence.

- `docs/ai/evaluation/golden-owner-assistant-v1.jsonl` — versioned Owner AI golden evaluation dataset.
- `docs/ai/evaluation/quality-gates-v1.json` — deterministic blockers and product quality thresholds.
- `docs/ai/evaluation/evaluation-lock-v1.json` — dataset/model/agent/evaluator lock metadata for comparable evaluation runs.
- `docs/ai/evaluation/README.md` — Owner AI evaluation asset contract.

<!-- RELEASE_WITH_AI_EVAL_SKIPPED_20260901 -->
### 2026-09-01 release decision
- AI-10 / AI-11 evaluation was stopped by explicit owner decision and is not a production release gate for this release.
- Do not interpret incomplete local AI evaluator/workflow artifacts as PASS evidence or canonical release authority.
- Production release evidence is recorded in `docs/PROJECT_CONTEXT.md`.
- Edit Product production fix: Selling Price persistence verification; Apply removed; duplicate top-right Back/Close removed.

<!-- PRODUCTION_RELEASE_AI_EVAL_SKIPPED_20260901 -->
### 2026-09-01 production promotion evidence
- AI-10 / AI-11: **SKIPPED BY USER**, not PASS.
- Production code SHA: `f43e70590b9b1aed1dc1ceeed66fa08558fb050f`.
- Static frontend deployed to `https://wineshoppos.z29.web.core.windows.net/`.
- Exact-build and production `index.html` SHA-256 verified equal: `97f716ec879e9e0bafcff02fc1128af4ed33b755df9dd0e1af9f45e7536ae0c6`.

<!-- OCR_BULK_PRODUCT_SYNC_FIX_20260902 -->
### 2026-09-02 OCR Product Master synchronization
Updated AutomationHub, BulkProductImport, ShopContext, Developer Handbook and User Manual for verified bulk-created product synchronization. No migration or Logic App change.

<!-- OCR_BULK_PRODUCT_SYNC_DEPLOYED_20260902 -->
Production deployment recorded for OCR bulk-created Product Master synchronization fix. Code SHA `81fec0f2a683e22b2b033d3393567c25603d3886`; public frontend verification PASS.

<!-- POS_SALES_RECEIPT_REPORT_SORT_20260902 -->
### 2026-09-02 POS/Reports/list reliability
Updated ShopContext, POS, Sales, Sale Details, Reports, sortable read-only list UI, Developer Handbook and User Manual. No DB migration or Logic App change.

<!-- POS_SALES_RECEIPT_REPORT_SORT_DEPLOYED_20260902 -->
Production deployment recorded for independent Sales refresh, durable receipt loading/printing, Reports refresh and sortable read-only list columns. Code SHA `e592877cf57954ee4b29fcc7daf6e98b395bc5d1`; public frontend verification PASS.

<!-- SALES_SPLIT_LOADER_20260902 -->
### 2026-09-02 Sales split-loader hardening
Updated ShopContext, Sales and Sale Details to replace the fragile embedded Sales read with header/items/payments split reads. No DB migration or Logic App change.

<!-- AUTOPRINT_SRNO_SHIFT_CASH_20260902 -->
### 2026-09-02 POS/Lists/Shift controls
Updated POS auto-print preference, Printer Settings, SortableTable serial numbering, Inventory Ageing/FIFO, Shift close cash controls, and recorded live Supabase migrations 20260901204924 and 20260901211003.

<!-- PREMIUM_UI_PRODUCT_IMAGES_FIFO_PRIORITY_20260902_V2 -->
### Premium UI / product images / stable FIFO priority / executor hardening
Added dynamic-base release rule, executor failure register, static product image frontend/migration record, cheers brand, Royal 21 gold badge, Account-only theme control, user-menu layering fix, micro-animations and stable Age/FIFO product-lot priority.

<!-- BRAND_THEME_REFINEMENT_20260902_V3 -->
### Approved WineShop POS brand + Royal 21 + dual-theme refinement
Custom SVG cheers/splash wordmark, Royal 21 six-second gold shimmer, Light/Dark theme-aware premium surface overrides, reduced-motion behavior and visual-UAT verification rule documented.

<!-- REFERENCE_BRANDING_TRUE_BLACK_20260902_V4 -->
### Reference branding + true-black Dark mode
Dedicated center shop-brand zone, large Royal 21 crown/gold/ornament lockup, true-black Dark theme, Light theme preserved.

<!-- BRAND_SPIRIT_TILE_V6_CANONICAL -->
### Premium brand / real collapse / spiritual tile
Canonical spiritual image tile, physical sidebar collapse and five-stage premium brand sequence.

<!-- EXACT_REFERENCE_PIXEL_ANIMATION_V7 -->
### Exact storyboard pixel animation
Replaced hand-redrawn brand artwork with SHA-verified raster sprite frames cropped from the approved reference. Includes exact WineShop POS five-stage frames, exact final sidebar lockup and Royal 21 four-stage frames.

<!-- ROYAL21_CROWN_COST_V8 -->
### Royal 21 crown-only motion / Azure cost check
Removed Royal 21 sprite stretching, constrained the lockup to the topbar, added continuous crown rotation, and added a read-only Azure cost diagnostic. WineShop POS brand unchanged.

<!-- ROYAL21_Y_AXIS_DARK_TILE_V9 -->
### Royal 21 Y-axis crown / wider center / true-black spiritual tile
Crown now revolves in 3D on the Y axis, Royal 21 has wider center presence, topbar containment is enforced, and the dark spiritual tile is true black.

<!-- ROYAL21_3D_SHIMMER_PITCH_BLACK_V10 -->
### Royal 21 true 3D crown / shimmer / pitch-black dark surfaces
Royal 21 crown refined to a stronger 3D Y-axis revolve, premium center tile gets full-width shimmer on pitch black, and the spiritual tile is forced to pitch black in Dark mode.

<!-- USER_CROWN_FULL_HERO_PITCH_BLACK_V11 -->
### User crown / full center hero / pitch-black Dark mode
Uses the supplied jeweled crown as a transparent production asset with Y-axis rotation, moves shimmer/effects to the complete center header lane, and removes remaining navy/blue Dark-mode surfaces.

<!-- DEMO_SAFE_ROYAL_HERO_V12 -->
### Demo-safe Royal hero
CSS-only full-width center hero rays/shimmer, globe-like crown rotation, top-right admin stacking protection and pitch-black Dark-mode correction. No application component/business logic changed.

<!-- FORT_ONLY_TOP_HERO_V14B -->
### Fort-only center hero
Approved Rajasthan SVG replaces visible crown/shop-name decoration in the center header for the demo; business logic is unchanged.

<!-- EXACT_USER_REFERENCE_BANNER_V15 -->
### Exact supplied Royal 21 artwork
Uses the user's actual artwork as the center-header banner instead of a recreated SVG or CSS composition.

<!-- PRODUCT_MASTER_OCR_PREVIEW_V1 -->
### V3 Product Master/OCR preview
MRP column, readable Product Name, OCR size/MRP propagation, editable MRP+₹15 default selling price, and edit-draft refresh protection. Preview only.

<!-- PREVIEW_CURATED_7_PRODUCT_IMAGES_V4 -->
### V3 curated seven-product imagery
Preview-only fallback imagery for the seven current catalogue products. Existing uploaded image overrides the curated fallback. Includes subtle motion on the exact Rajasthan header artwork.

<!-- V5A_RESPONSIVE_RESIZABLE_PREVIEW_20260902 -->
- V5-A preview: responsive app shell/mobile drawer, persisted draggable Product Master column widths + reset, and isolated `/v3-preview/` service-worker behavior. V3 only; manual viewport UAT required before promotion.

<!-- V5A1_ONE_SIDED_COLUMNS_RESPONSIVE_REFINEMENT_20260902 -->
- V5-A.1 preview refinement: right-edge-only persisted column resizing and global responsive ownership cleanup. Manual visual UAT required.

<!-- V5B_PURCHASE_CORRECTION_OCR_PACK_SAFETY_20260902 -->
- V5-B: audited completed-purchase correction RPC/UI, unconsumed-FIFO safety guard, pack-profile review prompts, and 2-decimal purchase-price UI.

<!-- V5C_PURCHASE_VERIFICATION_FIFO_TABLE_USABILITY_20260903 -->
- V5-C: corrected OCR review semantics, financial variance, Size (ml), friendly Box Mark, and persisted table resizing across purchase/Ageing/FIFO views.

<!-- V5D_ACTIONABLE_VERIFICATION_FRIENDLY_FIFO_20260903 -->
- V5-D: clickable amber/green verification tiles, Pack Resolution separated from historical OCR evidence, financial reconciliation breakdown, and supplier/date Receipt Ref for Ageing/FIFO.

<!-- V5E_HYBRID_VERIFICATION_ENGINE_20260903 -->
## 2026-09-03 — V5-E
V5-E: hybrid active-exception verification engine, audited non-destructive financial resolution, centralized tolerance defaults, technical FIFO lot hidden from normal UI.

<!-- V5F_PRODUCT_MASTER_FIRST_EXTERNAL_ENRICHMENT_20260903 -->
- V5-F: size-aware Product Master resolver, audited alias learning, cached JWT-protected UPCitemdb + Open Food Facts enrichment, duplicate-by-barcode protection, and external candidate prefill.

<!-- V5G_OWNER_CENTER_QUALITY_20260903 -->
- V5-G: Owner Center false-loss classification fix, resolved/audited correction history, Profit Intelligence resizable columns, recommendations/WhatsApp refresh UX, compact top-header shop selector.

<!-- V5G1_INVENTORY_RESIZE_20260903 -->
- V5-G.1: Inventory Current Stock table now supports persisted one-sided column resizing.
