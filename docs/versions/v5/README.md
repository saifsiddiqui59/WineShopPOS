# WineShopPOS V5

Status: **DEPLOYED TO PROD**

Current deployed application runtime:

`483ad7fedfa99ed6e033c9967a60f91319e37919`

Production frontend:

`https://wineshoppos.z29.web.core.windows.net/`

Production Supabase:

`uiurgplnsgmawvxhjzzp`

V5 extends the original WineShopPOS application; it is not a rewrite.

## Current authority

For a new chat or coding session, read in this order:

1. `../../CURRENT_VERSION`
2. `../../DOCUMENTATION_REGISTER.md`
3. `reference/PROD_TREE_STRUCTURE_2026-09-15.md`
4. `V5_CURRENT_STATE_AND_CONTINUATION.md`
5. `PROD_READINESS.md`
6. security/testing/release documentation as needed
7. current Git source and verified live state

## Current environments

### PROD

- source branch: `main`
- deployed application SHA: `483ad7fedfa99ed6e033c9967a60f91319e37919`
- frontend: `https://wineshoppos.z29.web.core.windows.net/`
- Supabase ref: `uiurgplnsgmawvxhjzzp`

### V5 DEV / QA history

- V5 QA/DEV resources remain historical qualification surfaces.
- DEV/QA values must never be copied into a PROD frontend build.
- Older V5 candidate/qualification SHAs remain in `releases/` and testing evidence.

## Major V5 production areas

- OCR invoice review and original-invoice evidence retention.
- Purchase Receiving Workspace with pack, quantity, identity and financial checks.
- atomic purchase-originated Product Master/barcode + inventory posting.
- purchase verification and audited correction/resolution.
- Product Image discovery/selection with free-only provider policy.
- USB/Bluetooth, local-camera and paired phone-to-PC barcode scanning.
- encrypted local purchase-draft recovery plus server-authoritative sync.
- Inventory, FIFO cost, reorder and Purchase Intelligence.
- Owner Center / Reports / Dashboard / Profit financial reconciliation.
- Ask WineShopPOS owner-assistant reporting aligned to India business dates.
- financial SSoT all-10 consistency release at `0ffe5335278c4075c81629e3807738bae702c66b`.

## Latest production checkpoint — 2026-09-21

After the financial SSoT baseline, production received these bounded OCR/purchase-review hotfixes:
- V12R1 `833201fcaaadf80fc5a4589fdd6aec7bae132af1`: fail-closed field-level adaptive OCR;
- V12R2 `c7fbdfa99586b0fb3d2605cc3931951aaa80cd29`: old OCR UI restored and row-confidence rescue fan-out removed;
- V12R3 `a4bb93f7e77fc3e7ce15beec66c3193dc23c3bee`: disputed header semantic rescue;
- V13 `9b8172745cd0f2c93932c3b0eeea673390fe31c0`: evidence-localized/raw-color adaptive OCR with a 3-group cap;
- V13R1 `483ad7fedfa99ed6e033c9967a60f91319e37919`: Financial Reconciliation separated from Product Cost Review.

Known open runtime issues:
- invoice 19185 date remains unresolved by OCR and must remain human-confirmed;
- Azure OCR polling can return HTTP 429 and currently lacks Retry-After/progressive backoff resilience;
- invoice 19185 must not be received until date and all product/pack/quantity/batch review gates are complete.

## Canonical V5 documentation

- `reference/PROD_TREE_STRUCTURE_2026-09-15.md`
- `V5_CURRENT_STATE_AND_CONTINUATION.md`
- `PROD_READINESS.md`
- `architecture/README.md`
- `reference/FEATURE_TRACEABILITY_CORE.md`
- `reference/data/TABLE_CATALOG.md`
- `reference/generated/`
- `security/README.md`
- `testing/README.md`
- `features/`
- `releases/`

## Current maintenance rule

Do not treat older V3/V4/V5 candidate documentation as the current runtime.
For any new change:

1. fetch current `main`;
2. read the failure register;
3. inspect current source and migrations;
4. verify live state for the affected system;
5. preserve unrelated local dirt;
6. stage only explicit release-owned files;
7. keep build/transport/runtime/manual-UAT evidence separate;
8. never replay successful business transactions simply to re-prove a release.

The live financial backend is already applied. Three exact migration bodies are
still marked `PENDING_DNS` for Git source-history backfill only. Do not use
database push or migration repair to close that documentation/history gap.

Truth order:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS`
