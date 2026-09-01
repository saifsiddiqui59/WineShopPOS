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
