# WineShopPOS V4

Status: **ACTIVE DEV / QA — PRE-PROD**

V4 extends the existing WineShopPOS production application. It is not a rewrite.

## Runtime-qualified base

Runtime candidate qualified before this documentation reconciliation:

`81107e0833abe4d2c7a09d5bd0d75bb924b7634a`

Final DEV gate:

- top-level gate: `PASS=18 WARN=0 FAIL=0 BLOCKERS=0`
- detailed Realtime/concurrency/legal UAT: `PASS=26 WARN=0 FAIL=0`
- evidence directory:
  `/e/WineShopPOS_RELEASE_EVIDENCE/V4_FINAL_PREPROD_GATE_20260906T080132Z`
- PROD was not modified.

A documentation-only successor may have a later Git SHA while retaining the
same runtime tree and build artifact. Release evidence must preserve that
lineage explicitly rather than pretending the documentation SHA was separately
runtime-mutated.

## Environment

- V4 branch/worktree: DEV/QA only.
- DEV Supabase ref: `juhcypzoacauzmtzqnwd`.
- PROD Supabase ref must not appear in V4 frontend environment configuration.
- V4 QA site is separate from PROD.
- PROD business data/runtime state is not copied into V4.

## Major V4 areas

- SaaS subscription / Platform Control foundation.
- Demo/trial control and plan catalog.
- Shop onboarding import for products/opening stock and suppliers.
- Realtime inventory synchronization.
- legal notice / acceptance preparation and Platform Control UX.
- commercial-readiness/mobile/readability hardening.
- V4 migration/source reconciliation and pre-PROD qualification.

## Canonical V4 documentation

- `architecture/`
- `reference/`
- `security/`
- `testing/`
- `releases/`

## Truth order

CURRENT V4 SOURCE
+ CURRENT V4 MIGRATIONS
+ VERIFIED DEV/QA STATE
+ VERIFIED TEST EVIDENCE
> stale V1/V2/V3 documentation.

V3 documentation remains authoritative for verified PROD lineage, not for
V4-only behavior.
