# WineShopPOS V5

Status: **PROD PROMOTION CANDIDATE — QA QUALIFIED; PROD NOT YET DECLARED V5**

V5 extends the existing WineShopPOS production application. It is not a rewrite.

## Lineage

Inherited PROD/main SHA at V5 creation:

`770d8db9674151aebe249976a82d042cd57cfed1`

Runtime-qualified V5_29 candidate:

`92d68ceac8fb5cef00e82d0a8eef7035edd8513d`

A later V5_30 Git SHA is documentation-only and must not be confused with a
separately runtime-qualified application artifact.

## Current environments

### V5 DEV / QA

- branch/worktree: `V5`
- Supabase project: `WineshopPOS_DEV`
- Supabase ref: `juhcypzoacauzmtzqnwd`
- QA preview: `https://wspv5qa3a5e8018.z29.web.core.windows.net/`
- dedicated DEV Invoice API: `wsp-v5-invoice-dev-53b6e9a1`

### Current PROD before V5 promotion

- branch: `main`
- frontend: `https://wineshoppos.z29.web.core.windows.net/`
- Supabase ref: `uiurgplnsgmawvxhjzzp`

V5 DEV/QA resources must never be copied into the PROD frontend build.

## Major V5 areas

- OCR invoice review and original-invoice evidence retention.
- Purchase Receiving Workspace with pack, quantity, identity and financial checks.
- atomic purchase-originated Product Master/barcode + inventory posting through
  `receive_purchase_v3`.
- purchase verification and audited correction/resolution.
- Product Image discovery/selection workflow with free-only provider policy.
- USB/Bluetooth, local-camera and paired phone-to-PC barcode scanning.
- encrypted local purchase-draft recovery plus authoritative online server sync.
- exact 500 ml fallback pack rule and invoice normalization safeguards.
- V5_29 simplified Inventory scanning/layout, completed Purchase Verification UX,
  and one-button Confirm Pack classification.

## Canonical V5 documentation

- `V5_CURRENT_STATE_AND_CONTINUATION.md`
- `architecture/README.md`
- `reference/FEATURE_TRACEABILITY_CORE.md`
- `reference/data/TABLE_CATALOG.md`
- `reference/generated/`
- `security/README.md`
- `testing/README.md`
- `features/`
- `releases/`

## Production-promotion rule

Promotion must:
1. re-derive the exact main..V5 source/migration/service delta;
2. reconcile migration requirements against live PROD rather than blind-pushing migrations;
3. build from the promoted source using PROD environment values;
4. fail if DEV project refs/API endpoints appear in the PROD artifact;
5. capture rollback before frontend overwrite;
6. verify authenticated PROD workflows after deployment;
7. only then mark V5 as deployed and write the V5-to-PROD retrospective.

Truth order:
`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS`
