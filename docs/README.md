# WineShopPOS Documentation

Current repository generation: **V5**

`docs/CURRENT_VERSION` is authoritative for the active repository generation and
must be `v5` for the V5 production-promotion line.

## Current V5

- `versions/v5/README.md`
- `versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md`
- `versions/v5/architecture/`
- `versions/v5/reference/`
- `versions/v5/security/`
- `versions/v5/testing/`
- `versions/v5/features/`
- `versions/v5/releases/`

V5 is **DEPLOYED TO PROD**. The current verified production runtime is
`483ad7fedfa99ed6e033c9967a60f91319e37919`. Historical candidate and qualification SHAs remain under
`versions/v5/releases/` and testing evidence.

## Previous deployed generations

- `versions/v4/` — previous deployed PROD generation and inherited V5 baseline
- `versions/v3/` — historical deployed lineage
- `versions/v2/` — historical
- `versions/v1/` — historical

## Shared governance

- `shared/governance/`
- `shared/templates/`
- `shared/security/`
- `shared/release/`

## Truth and environment rule

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS > MEMORY`

`main` is PROD-only. Every non-main version/development branch is DEV/QA-only.

A documentation-only successor may have a later Git SHA than the qualified
runtime candidate. Keep runtime SHA, documentation SHA, production deployment
SHA and final documentation-closure SHA distinct.
