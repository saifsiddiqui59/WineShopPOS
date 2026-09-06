# WineShopPOS V4

Status: **DEPLOYED TO PROD — V4 CLOSED 2026-09-06**

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


## Production close — 2026-09-06

- Production URL: `https://wineshoppos.z29.web.core.windows.net/`
- Controlled V4 promotion SHA: `dcd6cbbc15f73c3dd201a7e8261fe93b79b43e10`
- Final deployed mobile-hotfix app SHA: `eaedaf5fc7aa2885c8a2f0f0d9797dd3e9063d7d`
- Final verified frontend SHA-256: `92c2770fb9d0e406509c715cafb84fcdc347979397a6504584d2bd9dc3e8bde8`
- Platform Control and Shop Import were owner-visible in PROD.
- Owner explicitly confirmed PROD DONE.
- Whole-version lessons: `releases/V4_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-06.md`.
