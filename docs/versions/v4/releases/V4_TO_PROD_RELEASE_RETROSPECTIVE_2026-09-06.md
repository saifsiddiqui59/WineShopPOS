# V4 -> PROD Whole-Version Retrospective — 2026-09-06

Status: **V4 PROD COMPLETE — REQUIRED INPUT FOR V5**

Production URL:
`https://wineshoppos.z29.web.core.windows.net/`

Owner explicitly confirmed: **PROD DONE**.

## Final V4 identities

- runtime-qualified V4 base:
  `81107e0833abe4d2c7a09d5bd0d75bb924b7634a`
- clean V4 documentation/governance successor:
  `2a4e56e38231e701032dc020191937946922e3c1`
- controlled V4 production promotion SHA:
  `dcd6cbbc15f73c3dd201a7e8261fe93b79b43e10`
- final deployed V4 mobile-hotfix app SHA:
  `eaedaf5fc7aa2885c8a2f0f0d9797dd3e9063d7d`
- final verified frontend index SHA-256:
  `92c2770fb9d0e406509c715cafb84fcdc347979397a6504584d2bd9dc3e8bde8`

A later documentation-only closure commit is documentation authority, not the
deployed application identity.

## What V4 delivered

V4 extended the existing production application and delivered:

- SaaS subscription / Platform Control foundation;
- BASIC / PLUS / PRO plan controls;
- app-only subscription lifecycle messaging;
- demo/trial control layer;
- Shop Import for products/opening stock and suppliers;
- CSV/XLSX parsing, mapping, Dry Run, duplicate policy and source-hash safety;
- Realtime inventory UI synchronization;
- legal notice/acceptance infrastructure with runtime gate disabled;
- Platform Control legal/admin UX;
- commercial/readability hardening;
- mobile/responsive production hardening;
- environment-neutral runtime configuration;
- commercial/security RPC hardening.

No paid messaging service was added.
No new paid Azure resource was required for final release.

## DEV / QA maturity

Important gates included V4_10, V4_10D, V4_11, V4_12, V4_13A and V4_14C.

Final qualification included:

- `PASS=18 WARN=0 FAIL=0 BLOCKERS=0`
- Realtime/concurrency/legal UAT:
  `PASS=26 WARN=0 FAIL=0`
- repository hygiene finalization:
  `PASS=36 WARN=0 FAIL=0 BLOCKERS=0`

## Repository hygiene lesson

V4 established:

```bash
git ls-files --others --exclude-standard
git status --porcelain --untracked-files=no
```

Both empty before PROD-promotion preparation for the active development version.

This does not authorize destructive cleanup of long-lived PROD/main dirt.
Release work should use isolated worktrees where appropriate.

## PROD database promotion

Exactly 12 reconciled/allowlisted V4 migrations were applied to PROD in order and
post-verified.

Key postconditions:

- expected V4 tables/functions present;
- runtime configuration normalized to `DEFAULT`;
- no temporary DEV runtime row remained;
- `legal_notice_enabled=false`;
- `client_audit_enabled=false`;
- `customer_import_enabled=false`;
- inventory Realtime enabled;
- no DEV/UAT business-data copy into PROD.

Provider-level Platform Control admin:
`mdsaif72496@gmail.com`

## Risk-first backup lesson

An early release attempt overreached by treating `pg_dump` / `psql` as a
universal hard gate.

Correction:

`migration risk -> matching rollback/backup strategy`

Data-changing releases still require stronger recovery or explicit informed risk
acceptance.

## Differential deployment lesson

Owner AI, Invoice API and Supabase Edge Functions had no required release delta
and were not redeployed.

Permanent rule:

`no verified delta = no deploy`

## Release execution lessons

### Known endpoint vs missing local env

A known verified PROD Invoice API endpoint was temporarily treated as unknown
because it was absent from one local env file.

Lesson: distinguish a genuinely unknown production dependency from a known live
value missing from one machine-local config file.

### Selective promotion path bug

Using only:

`git diff --name-only <base>`

missed new non-ignored files.

Correct rule:

`tracked delta UNION git ls-files --others --exclude-standard`

then explicit allowlist validation and individual staging.

### Dirty local main

Long-lived local main contained legitimate historical tracked modifications and
many untracked executor/evidence files.

Release preserved them and used isolated worktrees.

Permanent rule: never use destructive cleanup as release preparation.

### Operator/file-transfer friction

Large downloaded executors, Git Bash path behavior and paste artifacts caused
avoidable time loss.

V5 should prefer reusable canonical repo executors and shorter continuation
surfaces.

## Git and frontend promotion

V4 and main had diverged, so V4 was selectively promoted rather than blindly
merged. Main-only production fixes were preserved.

The exact PROD frontend artifact was built with PROD environment values, rollback
was captured, static assets were uploaded before entry HTML and remote artifact
identity was verified.

## Mobile production hotfix

Real-device iPhone testing found responsive issues that desktop/automated
qualification did not fully catch.

The fix was frontend-only.

Final mobile hotfix SHA:
`eaedaf5fc7aa2885c8a2f0f0d9797dd3e9063d7d`

Local and Azure remote frontend SHA-256:
`92c2770fb9d0e406509c715cafb84fcdc347979397a6504584d2bd9dc3e8bde8`

Owner then confirmed **PROD DONE**.

Permanent lesson: future releases require real-device mobile visual UAT before
release close.

## V5 required improvements

1. read this retrospective before planning;
2. start V5 from current PROD/main structure;
3. establish hygiene at version creation time;
4. preflight all release environment/tool dependencies early;
5. make every continuation resume-aware;
6. use complete selective-promotion path classification from first executor;
7. keep differential deployment;
8. perform real-phone mobile UAT before release close;
9. reduce browser-download/path/paste release friction;
10. separately record runtime, promotion, artifact, hotfix and closure identities.

## V4 -> V5 scorecard

| Metric | V4 | V5 target |
|---|---|---|
| PROD DB replay | 0 | 0 |
| Blind DB push | 0 | 0 |
| Blind branch merge | 0 | 0 |
| Unnecessary service redeploy | 0 | 0 |
| Destructive Git cleanup | 0 | 0 |
| Unknown release paths | caught by gate | 0 from first executor |
| Late environment dependency failure | occurred once | 0 |
| Exact local/remote frontend hash | PASS | PASS |
| Real-device mobile UAT | post-release hotfix | pre-close |
| Paid resource without approval | 0 | 0 |

Improvement goal:

`same-or-higher safety + fewer repeated operations + earlier deterministic checks`
