# V3 -> PROD Release Retrospective and V4 Lessons — 2026-09-05

Status: **HISTORICAL V3 RELEASE LEARNING — REQUIRED INPUT FOR V4 PLANNING**

Reusable procedure:
`docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md`

## 1. Final V3 promotion outcome

- Qualified V3 SHA: `93ba6ebd3f9dc545247c24f0875eedbebfd71907`
- Hosted-preview application SHA: `10bac5ea4a0f038dde19494694b6d811eeb8766e`
- Promotion merge SHA: `a226a476c57031ccd8c0ba217957e81c15b1c571`
- Release-evidence SHA at closure: `81ae9207cacc1acdb3e05ad060ba03c48d37af33`
- PROD DB gates: PASS
- PROD invoice automation Edge Function: v10 PASS
- Owner AI: no delta, no redeploy
- PROD frontend: PASS
- PROD Playwright: 7/7 PASS, skipped 0, flaky 0
- Frontend rollback copy: `/e/WineShopPOS_RELEASE_EVIDENCE/PROD_FRONTEND_PREDEPLOY_20260905T101430Z`

Main later advanced beyond the release-evidence SHA with additional production fixes. Therefore deployed identity must never be inferred only from latest `main`.

## 2. What worked

- preview qualification before PROD;
- narrow migration allowlist instead of blind push;
- SECDEF security post-verification;
- stock-count fix verification;
- differential Edge deployment;
- no unnecessary Owner AI redeploy;
- dirty files preserved without destructive cleanup;
- frontend rollback captured before overwrite;
- local/remote frontend hash equality verified;
- authenticated PROD browser qualification 7/7;
- final browser gate remained read-only.

## 3. Mistakes and permanent lessons

### 3.1 Old documentation can mislead
V4: establish Git/source/migrations/live truth first.

### 3.2 Remembered SHAs become stale
V4: fetch at each mutation boundary and separately record candidate, promotion, deployed artifact, evidence, and latest-main identities.

### 3.3 PROD migration history drifted from main
Seven Sept 2-3 migrations were already live; only two Sept 4 migrations were missing.
V4: reconcile live history and use an explicit migration allowlist.

### 3.4 Backup assumptions were too optimistic
Local Supabase dump required Docker; PROD Free plan lacked automatic backup/PITR.
Recovery used targeted rollback evidence for two non-data migrations.
V4: data-changing releases need real DR-grade backup/PITR or explicit risk acceptance.

### 3.5 Dirty worktree was falsely treated as a generic blocker
Hundreds of historical untracked files and three tracked migration edits were legitimate.
V4: isolated release checkout preferred; otherwise hash-lock dirt, verify no collision, keep unstaged.

### 3.6 Script download/copy was assumed
`cp ~/Downloads/...` failed when the browser download had not occurred.
V4: verify executor existence/hash/version before run; CI removes this class.

### 3.7 Playwright package was declared but not installed
Recovery: locked `npm ci --include=dev`.
V4: bootstrap toolchain before any PROD write.

### 3.8 Browser runtime can still be missing
V4: launch a real headless browser during preflight.

### 3.9 `git grep -x` was unsupported
V4: use portable exact-line checks.

### 3.10 Native Windows Python misread `/e/...`
V4: `cygpath -w`, environment-passed native paths, or relative paths.

### 3.11 MSYS rewrote Vite `--base=/v3-preview/`
HTML referenced `/Program Files/Git/...`.
V4: keep preview base in Vite JS/config memory and validate exact attributes.

### 3.12 Native `npx.cmd` spawn failed with `EINVAL`
V4: direct JS API or known shell invocation.

### 3.13 Stale E2E UI contracts caused false failures
Inventory title, POS behavior, shift gate, scanner placement and Backup selector had changed.
V4: update tests during candidate development and trace assertions to current contracts.

### 3.14 Test self-check expected the wrong selector representation
V4: validate behavior, not fragile textual API representations.

### 3.15 CRLF/LF and multiline exact matching caused false failures
V4: semantic/structured validation; byte hashes only for exact-byte requirements.

### 3.16 EOF whitespace stopped promotion after build
`git diff --cached --check` caught three incoming files.
V4: staged/format checks before expensive build; rebuild after any correction.

### 3.17 `comm` emitted sorted-order warnings
V4: use deterministic set comparison in Node/Python for critical checks.

### 3.18 Wrong PROD password caused a late stop
Account was valid; password was initially wrong.
V4: validate E2E credentials during read-only preflight before promotion/deploy.

### 3.19 Literal `$web` + `set -u` crashed a section title
V4: escape/single-quote literal `$` text; logging must not break release logic.

### 3.20 Known Azure Blob RBAC failure was repeated
Management-plane login worked; Blob data-plane login lacked role.
Recovery: verified key-auth fallback without printing/persisting key.
V4: use known failure knowledge up front; target OIDC + least-privilege Blob role.

### 3.21 HTTP 200 is not functional verification
V4: separate source/build, transport, runtime config, DB/security, authenticated E2E and manual visual UAT.

### 3.22 7/7 Playwright != 8/8 combined qualification
V4: label every metric by its real test class.

### 3.23 Source markers are not visual UAT
V4: visual behavior remains pending until observed/approved.

### 3.24 Service deploy must be differential
OCR/product enrichment/Owner AI did not all require redeploy.
V4: no delta = no deploy.

### 3.25 Edge auth config is release identity
`invoice-automation-ingest` intentionally kept `verify_jwt=false` with `x-wsp-automation-secret`.
V4: snapshot source + auth/config, not source alone.

### 3.26 Security hardening should not be auto-rolled back
V4: rollback is risk/object-specific; do not reopen vulnerabilities due to unrelated later failure.

### 3.27 Release evidence generation corrupted Markdown
Backtick-wrapped `--auth-mode key`/`--auth-mode login` were eaten by shell substitution.
V4: literal-safe generation + marker verification + docs checks.

### 3.28 PWA/service-worker cache can hide deployed version
V4: cache-busting automated checks plus PWA update/install UAT where relevant.

### 3.29 Partial upload can break clients
V4: assets first, HTML/404 last; preserve old hashed assets where practical.

### 3.30 Latest main is not necessarily the deployed frontend
Main advanced after release closure.
V4: independently track `DEPLOYED_APP_SHA`/artifact hash and `MAIN_HEAD`.

### 3.31 Warnings need policy
Vite >500 kB chunk warning was performance debt, not release failure.
V4: block security/config/data-integrity warnings; classify known performance warnings separately.

## 4. Immediate V4 changes

1. Linux CI runner preferred.
2. Freeze candidate SHA.
3. Machine-readable release manifest.
4. Verify toolchain/auth before first PROD write.
5. Verify PROD E2E credentials before Git promotion.
6. Reconcile migration history.
7. Differential service deployment.
8. Isolated release checkout.
9. Rollback evidence before mutation.
10. Immutable exact-SHA artifact.
11. Azure assets before HTML.
12. Authenticated read-only PROD E2E after artifact proof.
13. Manual visual UAT separate.
14. Literal-safe evidence generation.
15. Deployed identity separate from latest main.

## 5. V4 success target

One qualification workflow + one approved PROD workflow, no destructive cleanup, no repeated known mechanisms, no source replay after partial success, exact artifact identity, exact E2E counts, and one mechanically validated evidence record.
