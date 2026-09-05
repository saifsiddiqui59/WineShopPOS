# WineShopPOS End-to-End Testing & Production Promotion Playbook (V4+)

Status: **CROSS-VERSION RELEASE STANDARD — REQUIRED FOR V4 AND LATER**

Purpose: provide one reusable strategy for qualifying a candidate version, promoting it to production, verifying it end to end, recovering from partial failures, and recording enough evidence that the next release does not repeat earlier mistakes.

This is the reusable procedure. Historical incidents stay in the failure register and version retrospectives.

## 1. Authority and mandatory read order

Before creating any V4+ executor, continuation, deployment script, or production mutation:

1. Read `docs/CURRENT_VERSION`.
2. Read `docs/DOCUMENTATION_REGISTER.md`.
3. Read `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md`.
4. Read this playbook.
5. Read the latest prior-version release retrospective.
6. Fetch current Git state and inspect current source/migrations.
7. Inspect live production state for every system that may be changed.

Canonical truth:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED DEPLOYMENT > OLD DOCUMENTATION`

Never use conversation memory, an old handoff, a prior executor, or a remembered SHA as current production truth.

## 2. Strategy challenge — approaches we reject

### A. One giant local Windows release script
Rejected because V3 exposed failures caused by Windows/Git-Bash/MSYS, missing tools, Azure auth assumptions, dirty worktrees, and partial-success resumes.

### B. Requiring a perfectly clean long-lived PROD worktree
Rejected because legitimate historical tracked/untracked files exist. A clean-tree obsession creates pressure for destructive cleanup.

### C. Fast-forwarding the candidate branch directly into main
Rejected because candidate branches can contain DEV-bound environment examples and because a promotion boundary/evidence identity is useful.

### D. Redeploying every service
Rejected because no-delta services such as Owner AI should not be touched. Wider blast radius makes rollback harder.

### E. Treating HTTP 200 as E2E PASS
Rejected because transport can work while auth, routing, runtime config, RLS, or UI behavior is broken.

## 3. Selected V4+ model

Preferred flow:

`candidate -> preview qualification -> immutable release manifest -> manual PROD approval -> differential DB/services -> controlled Git promotion -> exact artifact -> PROD deploy -> authenticated E2E -> evidence closure`

Preferred execution environment:
- Linux CI runner (GitHub Actions/Azure DevOps);
- protected production environment with manual approval;
- environment secrets;
- Azure OIDC/service principal with least-privilege data-plane access;
- release concurrency lock.

Manual Windows/Git-Bash executors remain a fallback, not the primary release engine.

## 4. Release state machine

Every release has one current state:

1. `CANDIDATE_FROZEN`
2. `PREVIEW_QUALIFIED`
3. `PROD_PREFLIGHT_PASS`
4. `ROLLBACK_READY`
5. `DB_PROMOTED`
6. `SERVICES_PROMOTED`
7. `GIT_PROMOTED`
8. `ARTIFACT_BUILT`
9. `FRONTEND_DEPLOYED`
10. `PROD_E2E_PASS`
11. `RELEASE_CLOSED`

Every continuation derives the live state again. Never replay earlier successful stages by default.

## 5. Immutable release manifest

Create before the first PROD write. Record:
- release/version;
- candidate branch and SHA;
- preview URL and artifact hash;
- production main SHA at freeze;
- migration allowlist + live-history classification;
- DB objects expected to change;
- Edge/Azure Function/AI deltas;
- frontend delta;
- PROD environment identifiers;
- release test-account identifier, never password;
- rollback locations;
- approval timestamp/operator;
- current state-machine stage.

Any candidate SHA change after preview qualification invalidates qualification.

## 6. Candidate qualification

Required:
- current candidate/main fetch and diff;
- version marker correct;
- docs health PASS;
- lint PASS;
- source regressions PASS;
- DEV preview isolation PASS;
- exact preview base PASS;
- no Windows/Git path leakage in generated HTML;
- DEV migrations/RLS/SECDEF regressions PASS;
- transaction-safe stock-changing RPC tests PASS.

Read-only browser qualification should include:
- public login;
- active account login;
- core modules;
- current Inventory contract;
- shift-safe POS search;
- scanner diagnostics;
- invoice/purchase read paths;
- Backup & Recovery read path;
- role-safe routes.

Report Playwright count exactly. A broader qualification count is not a Playwright count.

Manual visual UAT remains separate for responsive layout, clipping, animation, scanner hardware, printing and PWA behavior.

## 7. Production read-only preflight

Before any mutation:
- fetch current main/candidate again;
- stop if either moved unexpectedly;
- inspect workflows that may auto-deploy;
- identify DEV-only files that require PROD restoration;
- confirm PROD DB health;
- reconcile repo migration files with live migration history;
- snapshot deployed service versions/hashes/config;
- snapshot current frontend index/artifact hash;
- validate the intended PROD E2E account and password;
- prove Node/npm, locked dependencies, Playwright package, browser runtime, Azure CLI, Supabase mechanism and backup tooling.

Do not discover tool or credential problems halfway through promotion.

## 8. Rollback readiness

Rollback must match risk.

For non-data DDL:
- exact function definitions;
- grants/ACL/default privileges;
- hashes;
- rollback SQL that does not re-open security exposure.

For data migrations:
- real logical/physical backup appropriate to the change.

A targeted function/grant snapshot is not full disaster recovery.

If the PROD Supabase plan lacks automatic backup/PITR, higher-risk data changes require explicit risk acceptance or a stronger backup plan.

Frontend:
- capture/hash current `$web` or a verified previous artifact before overwrite.

Services:
- capture current version/hash/config before deploy.

## 9. Database promotion

- Apply only manifest-listed missing migrations.
- Never blindly `db push` all candidate migrations.
- Use repository SQL, never remembered SQL.
- Post-verify each security/data contract.
- Do not automatically reverse security hardening because a later frontend step fails.

## 10. Service promotion by verified delta

Rule:

`candidate hash/config != production hash/config ? deploy : do not deploy`

Preserve intentional auth configuration.

Example: `invoice-automation-ingest` intentionally used `verify_jwt=false` because it validates `x-wsp-automation-secret`. A generic deployment must not silently flip it.

Owner AI: no source/config/model/agent delta means no redeploy.

## 11. Controlled Git promotion

- candidate must already be qualified at immutable SHA;
- use an explicit promotion commit;
- restore PROD-bound `.env.example` before commit;
- set `docs/CURRENT_VERSION` to the promoted version;
- stage exact allowlisted files only;
- run `git diff --cached --check`.

Never destructive-clean unrelated dirt.

Prefer an isolated release checkout/clone. If a dirty worktree must be used, snapshot path set + SHA-256, verify no candidate collision, and keep unrelated dirt unstaged.

## 12. Exact production artifact

Build from the exact promoted application source identity with PROD Vite environment injected.

Required:
- locked dependency install;
- docs/lint/regressions;
- PROD environment guard;
- DEV Supabase ref absent from `dist`;
- DEV API/function URLs absent;
- PROD ref present;
- preview base absent;
- `dist/index.html` hash;
- referenced assets present.

After any content/whitespace correction, rebuild. Never deploy an artifact built before the final committed correction.

## 13. Azure static-site deployment

Known WineShopPOS behavior:
management-plane login may work while Blob data-plane RBAC fails.

Preferred V4 solution:
OIDC/least-privilege Blob role.

Verified fallback:
Azure Storage key auth for the intended data-plane operation only; never print/persist the key; unset in-memory key immediately.

Deployment safety:
1. verify exact storage account and PROD URL;
2. capture/hash rollback copy;
3. upload immutable assets first;
4. upload `index.html`/`404.html` last;
5. cache-bust verification;
6. remote index hash must equal local index hash.

Upload success alone is not deployment success.

## 14. Production E2E qualification

Run only after artifact identity is proven.

Default PROD qualification is read-only.

Required output:
- exact Playwright N/N;
- skipped = 0 unless explicitly approved;
- flaky = 0;
- browser operational mutations = NONE for read-only gate.

Mutating UAT must use synthetic/reversible data with explicit cleanup/compensation and be reported separately.

## 15. Evidence and closure

Record separately:
- candidate SHA;
- promotion SHA;
- **deployed application/source SHA**;
- frontend artifact SHA-256;
- final evidence SHA;
- current main SHA at closure;
- DB migration versions;
- service versions/hashes;
- rollback evidence;
- browser counts;
- manual UAT status;
- accepted warnings/risks.

Critical rule:

`main HEAD` is not automatically the deployed app identity.

Evidence generation itself is a release surface:
- use literal-safe heredocs/file generation;
- never allow command substitution to eat Markdown backticks;
- verify mandatory literal markers;
- run docs checks before commit.

## 16. Resume contract

After any failure:
1. classify write boundaries already crossed;
2. re-read live state;
3. identify last verified state;
4. continue only from that state;
5. never replay successful DB/service/Git/deploy stages;
6. preserve rollback evidence;
7. record genuinely new failure knowledge.

Examples:
- source pushed, deploy failed -> resume deploy;
- migration 1 passed, migration 2 not run -> verify 1, continue at 2;
- Git promotion pushed, credential gate failed -> do not re-merge;
- frontend deployed, browser failed -> diagnose live artifact first.

## 17. Windows/Git-Bash fallback rules

- Native Windows Python does not understand hardcoded `/e/...` Python paths; use `cygpath -w` or relative paths.
- MSYS can rewrite rooted CLI URL arguments such as `/v4-preview/`; keep Vite base in JS/config memory.
- Avoid fragile `spawnSync("npx.cmd", ..., shell:false)`.
- Do not assume `git grep -x` exists.
- Do not use CRLF/LF as the sole semantic proof.
- Avoid locale-sensitive `comm` for critical set validation.
- With `set -u`, escape/single-quote literal `$web`.
- Resolve self-script path before `cd` if self-inspection is unavoidable.
- Prefer standard-library validators over optional Python packages.

## 18. Secrets

Never store:
- Supabase passwords;
- Gmail/app passwords;
- Azure Storage keys;
- service-role keys;
- automation secrets;
- recovery URLs;
- raw auth tokens.

Credentials are validated, never written into release evidence.

## 19. Preferred V4 CI/CD architecture

Candidate workflow:
- Linux runner;
- pinned Node/tool versions;
- `npm ci`;
- docs/lint/regressions;
- exact DEV preview build;
- `/v4-preview/` deploy;
- Playwright qualification;
- publish immutable artifact + release manifest.

Production workflow:
- manual environment approval;
- `production-release` concurrency lock;
- download exact qualified artifact/manifest;
- recheck Git/live state;
- rollback readiness;
- differential migrations/services;
- controlled main promotion;
- exact artifact build/promotion;
- rollback snapshot;
- PROD deploy;
- artifact hash check;
- authenticated Playwright;
- evidence commit.

CI risks:
- secret leakage -> masked secrets/no `set -x`;
- concurrent releases -> lock;
- stale artifact -> bind artifact hash to candidate SHA;
- overprivileged Azure identity -> least privilege;
- migration replay -> explicit allowlist + live history diff;
- runner drift -> pinned versions;
- post-deploy failure -> preserved rollback artifact + explicit decision point.

## 20. Stop conditions

Stop before the next write if:
- candidate SHA changed;
- main moved unexpectedly;
- migration history differs from manifest;
- rollback evidence is insufficient;
- PROD env contains DEV refs;
- artifact identity cannot be proven;
- E2E credentials fail;
- staged files exceed allowlist;
- unrelated dirt collides;
- service auth config differs unexpectedly;
- skipped/flaky tests violate policy.

## 21. V4 checklist

- [ ] failure register read
- [ ] playbook read
- [ ] V3 retrospective read
- [ ] candidate SHA frozen
- [ ] preview E2E PASS
- [ ] manual visual UAT explicit
- [ ] migration manifest generated
- [ ] PROD history reconciled
- [ ] service delta manifest generated
- [ ] E2E credentials verified
- [ ] toolchain verified before PROD write
- [ ] rollback evidence ready
- [ ] PROD approval captured
- [ ] PROD env isolation PASS
- [ ] controlled promotion complete
- [ ] exact artifact proven
- [ ] frontend rollback captured
- [ ] PROD deploy complete
- [ ] remote/local hashes match
- [ ] PROD Playwright exact count PASS
- [ ] skipped=0
- [ ] flaky=0
- [ ] evidence validated/committed
- [ ] deployed-app identity separate from final main/evidence SHA

## 22. Success criterion

The goal is not “zero script failures.” The goal is:
- failures happen before irreversible writes whenever possible;
- every write has rollback evidence;
- successful stages are not replayed;
- tool/environment failures are separated from app failures;
- every continuation derives live state;
- deployed artifact is provably qualified;
- future releases require fewer manual decisions.
