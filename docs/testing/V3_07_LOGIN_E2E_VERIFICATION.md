# V3-07 Login Reliability — Hosted Preview Verification

Verification UTC: 20260901T140823Z

## Source

- Feature commit: `a0905ceee0c056c102b9e8ab3feea54a7c35a53c`
- V3-07 documentation/source head before hosted evidence: `f616fe604525817cf66e315c0187867aab994949`
- V3 preview: `https://wspv35c9453b6e9a1.z29.web.core.windows.net`

## Hosted result

- Preview deployment: PASS.
- Login without browser refresh: PASS in five sequential fresh-browser runs.
- Full hosted read-only Playwright suite: PASS.
- The POS cart-persistence test may be skipped when the live shop has no eligible stocked product with a positive Selling Price; the read-only suite does not change live business data to manufacture a prerequisite.

## Auth behavior verified

A valid active user can authenticate and reach Main navigation without a manual refresh. The application distinguishes verified Disabled/Suspended states from transient verification errors and automatically retries the observed Supabase/PostgREST `PGRST303 / JWT issued at future` timing rejection with bounded backoff.

## Scope

Performed:
- V3 preview frontend deployment.
- Hosted V3 preview E2E verification.

Not performed:
- production static deployment;
- Owner AI Function deployment;
- database mutation;
- local main worktree cleanup or modification.
