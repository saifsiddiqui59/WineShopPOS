# WineShopPOS Release Executor Failure Register

Purpose: permanently record release/executor mistakes, their root cause, and the prevention rule so later chats do not repeat them.

Canonical rule:
`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED DEPLOYMENT > OLD DOCUMENTATION`

Dirty-tree rule:
Never use destructive cleanup (`git reset --hard`, `git clean`, `git stash`, `git checkout .`, `git restore .`) to make an executor pass. Preserve unrelated dirt and stage only explicit allowlisted files.

## Failure classes

### 1. Stale hardcoded base SHA
Observed: a newly generated executor expected an earlier commit even though the immediately previous successful release had already advanced both `main` and `V3`.

Example: premium UI executor expected `0b130b34...`; both remotes were already at `cb4bd300...` from `feat: add auto print list serials and shift cash controls`.

Root cause: base SHA copied from conversation state instead of derived from Git at runtime.

Permanent prevention:
- `git fetch origin main V3`
- derive `BASE_MAIN=$(git rev-parse origin/main)`
- derive `BASE_V3=$(git rev-parse origin/V3)`
- require `BASE_MAIN == BASE_V3`
- use that shared SHA as `RELEASE_BASE`
- require local V3 HEAD equals `RELEASE_BASE`
- never hardcode a previous-turn release SHA in a newly generated executor.

### 2. Windows path separator mismatch
Observed: validators compared `src\pages\...` with Git's `src/pages/...`.

Prevention: normalize paths to `/` before comparisons.

### 3. Unrelated dirty V3 files falsely blocked a release
Observed: abandoned AI-11 workflow and legitimate historical dirt were treated as release-owned conflicts.

Prevention: inventory/preserve unrelated dirt; only target-file conflicts block; verify unrelated dirt remains unstaged.

### 4. Exact-SHA Vite build omitted production environment
Observed: a clean archive build returned HTTP 200 but React failed because `.env.local` was absent during Vite build.

Prevention: inject production `.env.local` into the isolated exact-SHA build and verify required VITE values in local and public JS without printing secrets.

### 5. Transport verification confused with functional verification
Observed: HTTP 200 root/assets were treated as app verification.

Prevention: report separate PASS states for source/build, transport/assets, public runtime config, database/RLS, and authenticated browser/manual UAT.

### 6. Azure Storage deployment auth mismatch
Observed: RBAC upload failed while account-key upload path was available.

Prevention: use documented static-site upload path and explicit `--auth-mode key` fallback without printing keys.

### 7. Resume executor assumed stale target state
Observed: resume scripts used assumptions from a previous failed run instead of current repository contents.

Prevention: generate resume/new executors only after fetching and reading the current base/target files.

## Mandatory executor preflight
1. Fetch `origin/main` and `origin/V3`.
2. Derive the shared release base dynamically.
3. Require `origin/main == origin/V3`.
4. Require local V3 HEAD equals the shared base without reset/restore/clean.
5. Inventory and preserve unrelated dirt.
6. Require release target files clean before editing.
7. Stage only exact allowlisted files.
8. Verify every staged file is allowlisted.
9. Verify unrelated pre-existing dirt is unstaged.
10. Lint/build before commit.
11. Inject `.env.local` for exact-SHA Vite production builds.
12. Verify Vite runtime config in built and public JS.
13. Keep transport verification separate from manual authenticated UAT.
14. Record new executor failure classes in this file before the next release.

Last updated: 2026-09-01.

### 8. Relative self-script path after directory change
Observed: validation used `grep ... "$0"` after the executor had changed directory from `/e/WineShopPOS` to `/e/WineShopPOS_V3`. Because `$0` was a relative filename, the validator searched for the executor inside the V3 worktree and failed with `No such file or directory`.

Root cause: the executor validated itself through a relative invocation path after `cd`.

Permanent prevention:
- do not use relative `$0` for release validation after directory changes;
- preferably validate actual release files and behavior, not the executor source;
- if self-location is genuinely required, resolve an absolute script path at startup using `BASH_SOURCE[0]` before any `cd`.

Classification: executor validation defect, not application source/build failure.

### 9. Automated source check mislabeled as visual UAT
Observed: release summaries reported the WineShop POS animation and Royal 21 visual treatment as PASS because source/CSS markers existed, but the authenticated production UI showed no meaningful visible animation and the shop-name size looked unchanged.

Root cause: automated source validation was incorrectly presented as proof of visual browser behavior.

Permanent prevention:
- automated checks may report `*_SOURCE_IMPLEMENTATION=PASS`;
- transport/runtime checks may report their own PASS;
- animation, layout, clipping, font sizing, shimmer and other visual behavior must remain `MANUAL_VISUAL_UAT=PENDING` until an authenticated production browser screenshot/user confirmation verifies them;
- never label a visual UX feature PASS based only on grep/lint/build.

Classification: verification-labeling defect, not proof that deployment transport failed.

### 12. Filename-only recovery missed failed-run component
Observed: a resume script searched only guessed spiritual/devotional tile filenames and found none, despite the prior release step reporting a component installation.

Root cause: recovery logic depended on a guessed filename.

Permanent prevention:
- do not require discovery of an earlier generated component;
- create/use one canonical release-owned component path when recovery is safe;
- preserve unknown leftover dirty files rather than deleting them;
- use the verified current Layout anchor for insertion.

### 13. Redrawing an approved raster storyboard cannot be pixel-exact
Observed: multiple SVG/CSS implementations reproduced the requested cheers/splash mechanics but still looked materially simpler than the approved storyboard.

Root cause: the executor attempted to recreate detailed generated artwork using hand-authored SVG paths and CSS. Matching motion semantics is not the same as matching artwork pixels.

Permanent prevention:
- when the user explicitly requires the approved storyboard itself to be visually exact, use the user-approved storyboard pixels as the production frame source instead of redrawing them;
- store cropped production sprite assets in Git with SHA-256 verification;
- CSS/React may control frame timing/replay only; it must not reconstruct or recolor the artwork;
- keep visual fidelity status `MANUAL_UAT=PENDING` until the user confirms production.

### 14. Center hero visually buried the top-right admin control
Observed: repeated Royal 21 center-header styling could visually cover or crowd the top-right Shop Admin/UserMenu area.

Root cause: center branding was enlarged without enforcing a strict three-column header ownership model and explicit action-layer z-index.

Permanent prevention:
- consolidated topbar must use three explicit layout zones: page context / shop hero / actions;
- topbar-actions and UserMenu must remain a higher stacking layer than the center hero;
- center effects must be clipped inside `.topbar-shop-hero`;
- for demo-safe visual changes, prefer CSS-only overrides and hash-lock business/component logic.

### V14 fort SVG raw-hash mismatch on Windows/Git Bash
Observed: `RELEASE_FORT_ONLY_TOP_HERO_V14.sh` stopped at Step 1 with `Fort asset hash mismatch` after creating the intended SVG.

Root cause: the executor embedded a text SVG directly in a shell heredoc and validated its raw-byte SHA. Cross-platform line-ending conversion can change LF/CRLF bytes without changing the SVG semantics, causing a false failure.

Permanent prevention:
- binary/exact assets embedded in release executors must use base64 transport;
- decode first, then validate the exact decoded SHA;
- XML/SVG assets must additionally be parsed as XML and checked for required/forbidden semantic markers;
- do not use a raw text-heredoc SHA as the sole cross-platform validator.

### V15 exact artwork validator required Pillow
Observed: `RELEASE_EXACT_USER_ROYAL21_ARTWORK_V15.sh` failed at Step 1 with `ModuleNotFoundError: No module named 'PIL'`.

Root cause: the release executor used Pillow only to validate PNG dimensions, introducing an unnecessary dependency that is not guaranteed in the user's Git Bash Python environment.

Permanent prevention:
- prefer Python standard-library validators for release-time asset checks;
- PNG signature/IHDR dimensions must be validated with `struct`;
- do not install optional Python packages during production release solely for validation.

<!-- PROD_PASSWORD_RECOVERY_AZURE_RBAC_REPEAT_20260904 -->
### Repeat occurrence — PROD password-recovery deployment ignored Failure Class 6

Date: 2026-09-04

Observed:
`17_PROD_FIX_PASSWORD_RECOVERY_AND_DEPLOY.sh` successfully built, committed and pushed the production password-recovery source, then stopped during Azure Storage deployment because `--auth-mode login` lacked Storage Blob Data permissions.

Why this is a repeated executor defect:
Failure Class 6 in this register already documented the same Azure Storage RBAC mismatch and required an explicit `--auth-mode key` fallback. The executor did not read/enforce the canonical failure register before deployment.

Permanent prevention:
- every production executor must require this failure register to exist and be non-empty before mutating/deploying;
- known failure rules relevant to the executor must be asserted before execution;
- Azure Storage static-site configuration and blob upload must attempt RBAC first and automatically use `--auth-mode key` when the known RBAC permission failure occurs;
- never print or persist storage account keys;
- a failed deployment after a successful source push must resume from deployment after verifying the exact current commit; do not reapply source changes or create duplicate feature commits.

Recovery result:
Static-site config mode: login
Blob upload mode: key
Live transport verification: HTTP 200 + exact built JS asset present.

<!-- V3_TO_PROD_V4_REQUIRED_RELEASE_KNOWLEDGE_20260905 -->
## V3 -> PROD completion addendum — mandatory V4 reference

The V3 production promotion exposed additional release-mechanism failures after
the earlier entries in this register. Full chronology and prevention rules:

- `docs/versions/v3/releases/V3_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-05.md`
- `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md`

V4+ executors must read both before writing or deploying.

Critical added lessons:
- reconcile live migration history; never blindly replay repo migrations;
- verify backup tooling before PROD writes; targeted rollback is not full DR;
- prefer isolated release checkout over forcing a dirty PROD worktree clean;
- bootstrap locked Playwright/browser tooling before PROD writes;
- validate PROD E2E credentials before Git promotion;
- avoid unsupported `git grep -x`, MSYS path rewriting, native Python POSIX
  paths, fragile `npx.cmd` spawning, CRLF-sensitive exact matching and
  locale-sensitive `comm`;
- with `set -u`, literal `$web` must be escaped/single-quoted;
- known Azure Blob RBAC failure must use the established safe auth mechanism
  or a least-privilege OIDC/RBAC replacement; do not rediscover it mid-release;
- run staged whitespace checks before build and rebuild after any correction;
- no service delta means no redeploy; auth/config is part of service identity;
- report Playwright counts separately from broader qualification counts;
- evidence files are release artifacts and must be literal-safe/validated;
- latest `main` is not proof of the currently deployed frontend: record
  deployed source/artifact identity separately.
