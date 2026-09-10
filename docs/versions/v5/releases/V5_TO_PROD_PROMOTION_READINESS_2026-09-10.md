# V5 -> PROD Promotion Readiness — 2026-09-10

Status: **PRE-PROMOTION RECORD — PROD NOT YET CHANGED**

## Git lineage

- current PROD/main before promotion: `770d8db9674151aebe249976a82d042cd57cfed1`
- runtime-qualified V5_29 candidate: `92d68ceac8fb5cef00e82d0a8eef7035edd8513d`
- V5 commits ahead of main before this docs-only successor: `26`
- V5 commits behind main: `0`

V5_30 is documentation-only. Its later SHA must be tracked separately from the
runtime-qualified V5_29 application candidate.

## Exact repository delta counts captured before V5_30

- migration paths changed in `main..V5_29`: `2`
- Supabase/Azure service paths changed in `main..V5_29`: `2`
- frontend/package paths changed in `main..V5_29`: `44`

These counts are historical promotion-preparation evidence only. The production
executor must re-derive the exact path lists again immediately before mutation.

## Automated candidate evidence

V5_29W reported:
- clean-snapshot dry run PASS;
- full test/build/environment gate PASS;
- V5 push PASS;
- QA deployment PASS;
- public QA runtime verification PASS.

Human UAT remains a distinct acceptance gate and must not be inferred from those
automated results.

## Production deployment requirements

1. archive/preserve local untracked executor/UAT files outside the release
   worktree rather than deleting them with `git clean`;
2. require a clean tracked + untracked V5 promotion worktree;
3. confirm `main` is still the exact reviewed ancestor of V5;
4. re-derive source, migration and service deltas;
5. reconcile each candidate migration against live PROD migration/schema state;
6. apply only the migration/service changes actually required by PROD;
7. build the promoted source using PROD environment configuration;
8. reject any artifact containing DEV Supabase/API identifiers;
9. capture frontend rollback evidence before upload;
10. deploy PROD;
11. verify authenticated PROD login/shop isolation/POS/purchase/OCR critical paths;
12. record deployed main SHA + frontend hash;
13. publish `V5_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-10.md`;
14. only then mark V5 as deployed/closed.

## Explicit non-claims

This document does NOT claim:
- V5 is already deployed to PROD;
- every V5-named migration must be applied to PROD;
- automated static tests equal manual UAT;
- DEV data/config should be copied to PROD.
