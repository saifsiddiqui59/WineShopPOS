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

## Mandatory pre-patch failure-knowledge contract

Status: REQUIRED for every future WineShopPOS patch, executor, continuation and deployment script.

Before creating a patch/executor:
1. Read this file in full from the current target branch.
2. Classify the proposed work against these risk dimensions:
   - Git/repository state and dirty-tree ownership
   - operating system / Git Bash / Windows path behavior
   - authentication mode and required RBAC/data-plane permissions
   - CLI/tool behavior and version assumptions
   - language/runtime/library dependencies
   - Vite/build-time environment injection
   - deployment target isolation (V3 preview vs production root)
   - verification class (source/build/transport/runtime/manual UAT)
3. Reuse a previously verified resolution pattern when the failure class already exists.
4. Never repeat a known failed mechanism unless the executor explicitly proves why the previous root cause no longer applies.
5. If a new failure occurs, record it here before creating the next continuation.

Required incident fields:
- Date / release / stage
- Symptom or exact failure class
- Authentication/tool/library/platform involved
- Root cause
- Resolution used
- Permanent prevention rule
- Safe continuation point
- Verified outcome

### 2026-09-02 — V5-A Windows Python POSIX-path interpretation

Release/stage:
V5-A responsive/resizable/preview patch — source application stage.

Symptom:
Python `pathlib.Path("/e/WineShopPOS_V3")` executed by native Windows Python resolved to `C:\e\WineShopPOS_V3`, then failed to find `src/pages/Products.jsx`.

Platform/runtime:
Git Bash on Windows invoking native Windows Python 3.13.

Root cause:
A Git-Bash POSIX path was passed directly into native Windows Python. Git Bash path syntax is not automatically translated inside Python string literals.

Resolution:
Resolve the worktree path in Bash with `cygpath -w "$V3"`, export it, and read that native path from Python through an environment variable. Add a Python assertion that the expected repository file exists before any writes.

Permanent prevention:
- Never hardcode `/e/...` inside native Windows Python blocks.
- Convert Git-Bash paths with `cygpath -w` before crossing into native Windows Python.
- Prefer shell-native file operations when Python is not required.
- Before Python modifies files, assert a known target such as `src/pages/Products.jsx` exists at the resolved path.

Safe continuation point:
The failed run did not modify the real V3 worktree. Rerun with the Windows-path-fixed executor from the original V3 base.

Verified outcome:
The corrected executor reached commit/push and advanced V3 to `4de3e0faaecac0c2e9d682d551e7e593216ca8d6`.

### 2026-09-02 — V5-A Azure Storage data-plane RBAC/auth-mode mismatch

Release/stage:
V5-A — deploy only to Azure Storage `$web/v3-preview`.

Symptom:
`az storage blob upload-batch ... --auth-mode login` failed with:
`You do not have the required permissions needed to perform this operation`
and suggested Storage Blob Data Owner/Contributor/Reader roles.

Authentication involved:
Microsoft Entra/Azure CLI login authentication was valid for management-plane access, but the signed-in identity lacked the required Azure Storage Blob data-plane role for upload.

Root cause:
The executor assumed `--auth-mode login` was the working upload mechanism. Existing WineShopPOS release knowledge already identified that RBAC upload can fail while account-key upload remains available.

Resolution:
For this existing storage account, obtain the account key through Azure management-plane authorization without printing it, pass it only in memory to the upload command, and immediately unset it after the upload. Upload remains restricted to `$web/v3-preview`.

Permanent prevention:
- Before generating an Azure Storage deployment executor, read this failure register and choose the previously verified auth path.
- Do not default blindly to `--auth-mode login`.
- Preferred current WineShopPOS fallback when Blob Data Contributor is not assigned:
  1. verify Azure CLI login and subscription;
  2. retrieve a storage account key with `az storage account keys list`;
  3. never echo/log the key;
  4. use the key only for the intended storage operation;
  5. `unset` the key immediately afterward.
- If key retrieval is denied, stop and report the missing management-plane permission; do not expose credentials or weaken storage security.
- Never upload V3 preview files to production root.

Safe continuation point:
V5-A source/build/commit/push already succeeded. Do not rerun the source patch. Continue from exact committed V3 SHA `4de3e0faaecac0c2e9d682d551e7e593216ca8d6`, rebuild it with the required Vite environment and `/v3-preview/` base, then perform preview-only upload.

Verified outcome:
Pending this continuation.


### 2026-09-02 — Git Bash/MSYS rewrote Vite preview `--base=/v3-preview/`

Release/stage:
V5-A public `/v3-preview/` exact-SHA build/runtime verification.

Symptom:
Azure returned HTTP 200 for `index.html`, the real JS bundle and the real CSS bundle, but Chrome still showed 404 errors. Browser console exposed requests such as:
`/Program%20Files/Git/v3-preview/assets/index-....js`
and
`/Program%20Files/Git/v3-preview/assets/index-....css`.

Platform/tool:
Windows Git Bash/MSYS launching npm/Vite.

Root cause:
The executor passed the Vite CLI argument `--base=/v3-preview/`. Git Bash/MSYS treated `/v3-preview/` as a POSIX filesystem path and rewrote it for the native Windows process to a path rooted under the Git installation (`C:\Program Files\Git\v3-preview\`). Vite then emitted that converted path into `index.html`.

Why the prior transport check falsely passed:
The validator searched for the substring `/v3-preview/assets/...`. That substring also exists inside the wrong value `/Program Files/Git/v3-preview/assets/...`, so the test extracted the tail and successfully curled the real asset even though the HTML attribute itself was wrong.

Resolution:
Do not pass a rooted preview URL through the Git-Bash/native-Windows CLI boundary. For preview builds, create a temporary Vite config in the isolated build directory with:
`base: "/v3-preview/"`
and build with `--config vite.preview.config.js`.
The temporary config is build-only and is not committed.

Permanent prevention:
- Never pass URL-root values such as `--base=/.../` to native Windows build tools from Git Bash unless MSYS argument conversion is explicitly controlled.
- Prefer a temporary/build-specific config file for Vite base paths.
- Preview HTML validation must verify exact attribute prefixes:
  `src="/v3-preview/assets/..."`
  and
  `href="/v3-preview/assets/..."`
  rather than substring matching.
- Explicitly fail if generated/public HTML contains `Program%20Files/Git`, `Program Files/Git`, or a Windows drive path.
- Verify every JS/CSS asset referenced by the final public `index.html`.
- Publish hashed/static files first and `index.html`/`404.html` last to avoid a new HTML shell referencing assets that are not yet available.

Safe continuation point:
Do not rerun V5-A source edits. Build the exact current V3 SHA with the corrected temporary Vite config, deploy only `$web/v3-preview`, and publish HTML last.

Verified outcome:
Pending this continuation.


### 2026-09-02 — V5-B Supabase CLI executable unavailable

Release/stage:
V5-B purchase correction / OCR pack safety — database migration stage after source commit/push.

Symptom:
The executor stopped with:
`[FAIL] Supabase CLI not installed`
after V3 source had already committed and pushed successfully.

Tool/platform involved:
Windows Git Bash. The executor used `command -v supabase` and assumed a globally installed Supabase CLI binary must exist on PATH.

Root cause:
The release mechanism was coupled to one local CLI installation method even though the WineShopPOS Supabase project was already reachable through the connected Supabase integration. The application/source was not broken and the database had not been modified by the failed local step.

Resolution used:
- Did NOT rerun or reapply V5-B source.
- Verified GitHub V3 contained exactly the new migration `20260902214000_v5_purchase_correction_ocr_pack_safety.sql`.
- Verified live Supabase migration history ended at `20260901213751_product_images_v1`.
- Applied the V5-B SQL through the connected Supabase migration action.
- The connector initially generated its own migration-history timestamp; migration history was then aligned to the repository filename/version `20260902214000`.
- Verified live table `purchase_item_corrections`, RPC `correct_received_purchase_item(...)`, RPC `get_purchase_item_corrections(uuid)`, and migration version `20260902214000`.

Permanent prevention:
- Do not hard-fail solely because a global `supabase` executable is absent.
- Before generating a DB continuation, determine which verified execution path is actually available:
  1. connected Supabase migration action, or
  2. existing local Supabase CLI / `npx supabase`.
- Do not install or upgrade CLI tooling automatically during a release.
- When a connected migration action generates its own timestamp, explicitly align/verify migration history against the canonical repository migration filename before declaring DB migration PASS.
- Keep source/build, DB migration, deployment transport, and manual UAT as separate verification classes.

Safe continuation point:
V3 source commit `a66ffcb9894bf52034351ffbcfcf5122a1cdebb3` is already pushed. Supabase migration `20260902214000_v5_purchase_correction_ocr_pack_safety` is live and verified. Continue only with failure-register commit + V3 preview build/deployment; do not re-run the migration and do not auto-correct invoice 15983.

Verified outcome:
- V5-B DB migration: PASS.
- Invoice 15983 auto-correction: NOT EXECUTED.
- V3 preview deployment of V5-B UI: still pending at the time of this incident record.

### 2026-09-03 — V5-H dynamic branch but stale per-file hash guard

Release/stage:
V5-H Fast POS + premium header continuation — source preflight.

Symptom:
`V5H_FAST_POS_AND_TOP_HEADER_FIX.sh` fetched current `origin/V3` dynamically but then stopped with:
`[FAIL] ShopSelector source changed; regenerate from current V3`.

Git/source state involved:
The V3 branch had already advanced to the intended V5-H release state (`feat: streamline Fast POS register and restore premium header`). That state already contains the V5-H Fast POS render, restored RoyalHero header, V5-H CSS/docs, and the previously committed Inventory resize. The executor still compared `ShopSelector.jsx` to an older hardcoded blob hash.

Root cause:
The executor fixed stale branch-SHA handling but retained stale hardcoded per-file source hashes as mandatory gates. It also lacked an idempotent desired-state path, so an already-completed release state was treated as an error.

Resolution used:
- Do not rerun V5-H source mutation.
- Verify current V3 semantic release markers.
- Record this incident before the next continuation.
- Continue later with an exact-current-V3 preview build/deploy only.

Permanent prevention:
- Dynamic branch resolution and per-file guards must use the same fetched snapshot.
- If semantic release markers prove the desired state is already present, report `ALREADY_APPLIED` and skip mutation.
- Do not fail solely because a historical blob hash differs when no mutation is required.
- Mutation executors must derive target blob SHAs from the exact fetched release base used for that run, or be regenerated before writing.
- Deploy-only continuations must validate semantic markers and commit ancestry rather than historical file hashes.

Safe continuation point:
Current V3 already contains V5-H source. Next step is safe local V3 fast-forward if needed, clean exact-SHA lint/build with `.env.local`, then preview-only Azure deployment. Do not modify POS/header/Inventory source again.

Verified outcome:
- V5-H source on GitHub V3: PASS.
- Failure-register incident: RECORDED by this documentation-only continuation.
- V3 preview transport for this exact state: PENDING.
- Manual authenticated visual/functional UAT: PENDING.

### 2026-09-03 — V5-F.1 empty-string idempotence guard skipped required deletion

Release/stage:
V5-F.1 OCR/Product Enrichment + Inventory UAT correction — source patch stage.

Symptom:
`V5F1_OCR_ENRICHMENT_AND_INVENTORY_UAT_FIX.sh` stopped inside the generated Python patcher with:
`AssertionError`
for the condition that the global text
`Drag a column's right edge; its left edge stays fixed.`
must no longer exist in `src/components/ui/SortableTable.jsx`.

Tool/platform involved:
Git Bash on Windows invoking native Windows Python. The path conversion itself worked; this failure was in the generated patch helper logic.

Root cause:
The generated literal replacement helper tried to be idempotent using:
`if new_text in current_text: return`
before checking the old anchor.
For a deletion operation, `new_text` was the empty string (`""`). In Python, the empty string is contained in every string, so the helper incorrectly treated the deletion as already applied and returned without removing the old text. The later semantic assertion then correctly detected that the text still existed.

Repository state after failure:
The executor stopped before manual sync, lint/build, staging, commit, Git push, and Azure preview deployment. Several allowlisted V5-F.1 source/documentation targets may already contain partial local edits from earlier patch operations. They are legitimate failed-run work and must be preserved. No destructive cleanup is allowed.

Resolution used:
- Do not rerun the failed executor.
- Do not reset, restore, stash, clean, or overwrite the partial target edits.
- Record this incident first in the canonical failure register.
- Generate the recovery only after treating the current partially modified V3 worktree as the source of truth for the failed run.
- In the recovery patch helper, handle deletion explicitly: only use an idempotence `new in text` shortcut when `new` is non-empty; for `new == ""`, check whether the old anchor is present and remove it exactly once.

Permanent prevention:
- Generic replacement helpers must distinguish replace/update from deletion.
- Never use `if replacement in text` as an idempotence guard when `replacement == ""`.
- For deletion:
  1. if old anchor is absent, verify the desired semantic state and treat as already applied;
  2. if old anchor appears exactly once, delete it;
  3. if it appears multiple times, stop for inspection.
- Run patch-helper unit/syntax checks for empty replacement cases before packaging an executor.
- Keep post-patch semantic assertions; the assertion in this run correctly prevented a bad commit.
- Recovery executors after a partial patch must operate from the current dirty target state and must not assume the original clean base.

Safe continuation point:
After this documentation-only incident commit, keep all partial V5-F.1 target edits unstaged. Next create a V5-F.1 recovery executor that:
- reads the failure register in full;
- accepts only the known partial V5-F.1 target dirt;
- fixes/completes the desired semantic state idempotently;
- validates the live `product-enrichment` Edge Function as version 2 without redeploying it;
- runs manual sync, lint/build, exact allowlist staging, V3 commit/push, and `/v3-preview/` deployment only.

Verified outcome:
- Application/source build: NOT EXECUTED after the failed patcher.
- Git commit/push for V5-F.1 application files: NOT EXECUTED.
- Azure preview deployment for V5-F.1: NOT EXECUTED.
- Production main: unchanged by this failed run.
- Database schema/purchases/inventory/FIFO/sales: unchanged by this failed run.
- Live `product-enrichment` Edge Function: version 2 was already deployed separately before this executor and is not part of this failure.

### 2026-09-03 — V5-F.1 cleanup left ProductForm worktree dirty

Release/stage:
Cleanup after failed V5-F.1 OCR/Product Enrichment executor.

Symptom:
The failed-run cleanup reported successful restoration of the V5-F.1 tracked targets, but its final `git status --porcelain` still showed:
`M src/components/ProductForm.jsx`.

Classification:
Git/worktree cleanup verification failure.

Resolution:
Treat the remaining `ProductForm.jsx` modification as failed-run dirt because that file was an explicit V5-F.1 mutation target and was clean before the failed run. Restore only that exact file from current `origin/V3`, then verify it is clean.

Permanent prevention:
Every failed-run cleanup must verify each owned target with both:
- `git diff --quiet -- <path>`
- a final path-specific `git status --porcelain -- <path>`
and must fail before printing cleanup success if either check reports dirt.

Policy update from user:
Going forward, failed executors must remove dirty files they created rather than preserving them. Pre-existing unrelated project dirt must not be deleted unless explicitly requested.

### 2026-09-03 — ProductForm metadata-only dirty state after failed-run cleanup

Observed:
`git status --porcelain` reported `M src/components/ProductForm.jsx` while `git diff --raw`, `git diff --summary`, and normal `git diff` were empty. EOL was `i/lf w/lf`; `core.filemode=false` and `core.autocrlf=false`. Filtered worktree content matched HEAD.

Permanent prevention:
- Do not treat porcelain `M` alone as proof of a content change.
- Compare normal diff, HEAD/index blob, and `git hash-object --path=<path> <path>`.
- If filtered content equals HEAD and cached diff is empty, explicit-path `git add -- <path>` may refresh index metadata.
- Never use `git add .` or `git add -A`.
- V5-F.1 rebuilt deliberately does not modify `ProductForm.jsx`; OCR category handling is corrected in the OCR-specific route.
- If a new executor fails before commit, restore only its own target files from a pre-run backup.

### 2026-09-03 — V5-F.2 Azure preview RBAC failure and account-key recovery

Date / release / stage:
2026-09-03 — V5-F.2 Confirm Line alias/global-error runtime continuation — Azure V3 preview upload.

Symptom / failure class:
The first runtime continuation successfully applied Supabase migration `20260903114500`, then Azure Storage upload using `--auth-mode login` failed with the Blob Data Contributor/Owner permission message.

Authentication/tool/platform involved:
Azure CLI on Windows Git Bash; management-plane access was available, but Entra login lacked Azure Storage Blob data-plane write RBAC for preview account `wspv35c9453b6e9a1`.

Root cause:
The continuation repeated the already-known failure class documented in this register: RBAC upload can fail while account-key upload is available. The executor should have reused the existing verified account-key resolution pattern instead of retrying `--auth-mode login`.

Resolution used:
- did not reapply Supabase migration `20260903114500`;
- verified Local and Remote migration history already contain the target;
- rebuilt current V3 for exact base `/v3-preview/` using a temporary Vite config rather than a rooted CLI `--base` argument;
- retrieved the dedicated preview storage account key through Azure management-plane authorization without printing it;
- used the key only in memory for the `v3-preview` upload and unset it afterward;
- uploaded static/non-HTML content first and HTML last;
- verified remote `index.html` SHA-256 equals the local build and public JS/CSS asset paths resolve.

Permanent prevention rule:
Every future WineShopPOS Azure Storage executor must read this failure register before deployment and reuse the documented auth pattern. It must never blindly default to `--auth-mode login` when this account is known to require the key fallback. Secrets must never be printed.

Safe continuation point:
Source was already on V3 and migration `20260903114500` was already live. Continuation began from preview build/deploy only.

Verified outcome:
RESOLVED by this single-file continuation. V3 preview deployment verified at `https://wspv35c9453b6e9a1.z29.web.core.windows.net/v3-preview/`.

Classification:
Known deployment-auth failure repeated by an executor; application source and V5-F.2 database migration were not the cause.

## Mandatory corruption / partial-artifact hygiene policy

Status: REQUIRED for every future WineShopPOS patch, executor, continuation and deployment.

Rules:
1. Run `git fsck --full` before a release-owned mutation; stop on repository-object corruption.
2. Critical tracked source/script/migration/document files (`.sh`, `.js`, `.jsx`, `.mjs`, `.sql`, `.md`, `.json`, `.html`, `.css`, `.py`) must not be zero-byte.
3. Detect common partial artifacts (`*.partial`, `*.corrupt`, `*.rej`, `*.orig`, `*.tmp`) outside `.git` and `node_modules`. Do not delete unknown files automatically; stop and resolve ownership.
4. Never use destructive Git cleanup to make a tree look clean.
5. Before editing, all release-owned target files must be clean. Unrelated dirt is preserved.
6. Temporary executor/build files must be removed by a trap on success or failure.
7. Validate changed/staged text files for merge-conflict markers before commit.
8. Stage only an explicit allowlist and reject any unexpected staged file.
9. Re-run zero-byte/partial-artifact/conflict checks immediately before commit.
10. After push, require local HEAD to equal `origin/<target-branch>`.
11. A failed executor may not be described as “rolled back” if any remote DB/cloud mutation already succeeded; the actual partial state must be recorded.
12. Every new failure class must be written into this canonical register before the next continuation is considered complete.

### 2026-09-03 — V5-F.3 executor construction failures

Observed sequence:
1. an executor correctly stopped on the untracked AI-11 workflow because committing it unchanged could activate an automatic quality gate;
2. a follow-up executor failed in embedded Python quoting before changing application source;
3. another follow-up failed in embedded Node quoting before changing application source;
4. a later unified patch file was malformed (`corrupt patch`) and failed at `git apply --check`.

Application/cloud impact of those failed attempts:
- no V5-F.3 application commit/push;
- no V5-F.3 Azure preview deployment;
- no V5-F.3 Supabase/database mutation;
- no inventory mutation;
- AI-11 was intentionally converted locally to manual-only `workflow_dispatch`.

Root cause:
The executor generation mechanism became more complex than the behavior change and repeatedly introduced quoting/patch-format defects.

Permanent prevention:
For small React source changes, use a minimal exact-text file transform with explicit pre/post assertions. Do not generate another source language inside quoted source strings, and do not use hand-counted unified-patch hunk lengths.

### 2026-09-03 — CANCELLED invoice duplicate dead-end

Symptom:
After Cancel Review, selecting the identical invoice PDF again was blocked with `Existing status: CANCELLED`.

Root cause:
The frontend duplicate recoverable-state list omitted `CANCELLED`.

Correct behavior:
Cancel Review preserves evidence and posts no inventory. Re-analysis of the identical cancelled PDF must reuse the existing ingestion, call `invoice_reopen_review` first to clear cancellation reason/time/user, and then rerun OCR on that same ingestion.

Protected states:
READY_TO_RECEIVE, RECEIVED, COMPLETED and terminal duplicate-resolution states remain protected against accidental duplicate processing.

## ZERO-TOLERANCE CLEAN WORKTREE POLICY — 2026-09-03

Normal WineShopPOS feature/fix/deploy work must start and finish with `git status --porcelain` empty. Unknown dirty files are never silently deleted. Destructive shortcuts remain prohibited: `git reset --hard`, `git clean`, `git stash`, `git checkout .`, `git restore .`, `git add .`, and `git add -A`.

### 2026-09-03 — V5-G page/data consistency audit

Observed: normalized duplicate suppliers; Stock Count blank before session; SortableTable content-width collapse on pages without configured widths; Purchase Intelligence embedded the complete Invoice OCR page; Azure interpreted ambiguous `03/09/2026` as March 9 despite retained Indian DD/MM/YYYY evidence.

Resolution: supplier merge + normalized unique index + UI normalized check; live Stock Count baseline; global SortableTable full-width fallback; remove embedded OCR; raw DMY invoice date preference and correction of retained existing DMY records; Product/Inventory integrated operational view; audit every routed page module and full src lint/build.

Verification boundary: automated route/source/build/transport checks do not replace authenticated manual visual UAT of every screen.

## SUPABASE CLI MULTI-RESULT VERIFICATION VISIBILITY FAILURE — 2026-09-03

### Failure
V5-G executor successfully:
- pushed source;
- applied `20260903193000_v5g_page_data_consistency.sql`;
- deployed `ocr-invoice`.

It then failed at post-migration verification with `supplier verify missing`.

### Root cause
The verification SQL file contained multiple independent `SELECT` statements. In this execution path, `supabase db query --file ... --output table` surfaced only the final result set. Therefore the terminal displayed `UAT_B_DATE`, while earlier supplier verification rows were not visible to subsequent `grep` checks.

This was a verification-harness failure, NOT a database migration failure.

### Permanent rule
Post-mutation Supabase verification that contains several assertions MUST produce one result set:
- one SELECT with several columns, or
- `UNION ALL` rows in a single SELECT.

Do not depend on the CLI printing every independent SELECT result set.

### Partial-state rule
If DB migration / function deployment succeeds and only the verifier fails:
1. record the actual remote partial state;
2. verify migration history/current DB state first;
3. DO NOT reapply the migration merely because verification output was incomplete;
4. DO NOT claim rollback;
5. continue with a dedicated recovery executor.

### Verified recovery state
Independent live verification established:
- duplicate normalized supplier groups = 0;
- METRI normalized supplier rows = 1;
- normalized supplier unique index exists;
- UAT-V5F-001 date = 2026-09-03;
- UAT-V5F-002 date = 2026-09-03.

## V5-H RESPONSIVE / SHIFT-GATE / UAT CLEANUP — 2026-09-03

### Permanent POS shift rule
Every completed POS sale must belong to a valid cashier shift, regardless of whether the user role is CASHIER, MANAGER or ADMIN. The UI blocks billing with a Start Shift dialog, and the database independently rejects a completed sale with no valid shift. Offline synchronization must attach the sale to the shift that covered the offline sale timestamp.

### Scanner placement rule
USB/Bluetooth barcode scanning remains supported as keyboard input. The dedicated Scanner option is removed from POS & Billing. Scanner diagnostics/settings belong under Settings & Admin → Hardware.

### Product vs Inventory rule
Products and Inventory must not be merged into one database table:
- Products = SKU/barcode/name/category/pack/pricing master data.
- Inventory = live quantity/reservations/movements/counts/FIFO state.
Operational screens may combine them by product_id.

### Responsive UI rule
All routed modules must remain usable at desktop, tablet and mobile widths. Main content must allow min-width:0, tables may scroll horizontally, module tabs may scroll horizontally, and page/form grids must collapse at mobile breakpoints instead of forcing desktop widths.

### Test-fixture cleanup rule
Destructive UAT fixture cleanup requires exact identity and dependency preconditions. Abort if a test product has sales, returns, transfers, purchase orders or non-test purchases. Never treat a broad product-name match as permission to delete operational history.

### V5-G verifier failure carried forward
The prior V5-G migration and OCR deployment succeeded, but its first verifier used multiple independent SELECT statements and the CLI surfaced only the final result set. Future post-mutation verification must return one result set.

## V5-H MIN(UUID) MIGRATION FAILURE — 2026-09-03
The V5-H migration failed because it used `min(id)` / `min(shop_id)` on UUID columns. The transaction rolled back and the migration remained local-only. Permanent rule: assert cardinality with `count(*)`, then select the UUID row directly.

## SUPABASE MIGRATION LIST LOCAL/REMOTE FALSE POSITIVE — 2026-09-03
Executor 22 matched the Local column of the formatted migration list and falsely reported the migration as remote. Permanent rule: remote migration truth comes from `supabase_migrations.schema_migrations`, not grep over CLI table output.

## V5-H3 REGRESSION VARIABLE-NAME FALSE NEGATIVE — 2026-09-03
Executor 23 reported `Stock Count search methods incomplete` because the regression expected literal `product.sku`/`product.brand` while the correct implementation used `p.sku`/`p.brand`. Permanent rule: regressions validate behavior/structure, not incidental local variable names.

## V5-H4 AUDIT COLUMN PRECHECK FALSE NEGATIVE — 2026-09-04
Executor 24 expected `audit_logs.old_data` and `audit_logs.new_data` to be absent and stopped when the live database correctly returned both columns as present. Both are JSONB and are valid cleanup predicates.

Root cause: an earlier schema conclusion was encoded as a hard precondition without re-querying the exact live columns immediately before use.

Permanent prevention: query destructive-migration columns directly from `information_schema.columns`; assert the current linked database state; keep valid old_data/new_data cleanup predicates when those columns exist.

Safe continuation: executor 24 stopped before source, DB, Azure or preview mutation; the same five failed-23 local dirty paths remain.

## STOCK COUNT ONE-SCAN/ONE-COUNT RULE — 2026-09-03
A physical scanner event ID must be consumed once. React re-render/effect changes must not replay a bottle scan. `NOT COUNTED`, `COUNTED`, and explicit `MARKED ZERO` are separate states.

<!-- V3_SECURITY_DEFINER_RPC_PRIVILEGE_RULE_20260904 -->
## V3 release security rule — SECURITY DEFINER EXECUTE grants

Discovered during V3 production-readiness review on 2026-09-04.

### Failure pattern

A `SECURITY DEFINER` function can contain correct internal shop/role checks and
still have an unnecessarily broad execution surface. More seriously, internal
helper functions may inherit or receive `PUBLIC`, `anon` or `authenticated`
EXECUTE privileges even though they were intended to be called only by other
database/server-side routines.

Confirmed V3 examples included sequence/counter helpers, `write_audit`, and
the receipt-lot refresh helper.

### Permanent prevention rule

For WineShopPOS public-schema functions:

1. `SECURITY DEFINER` never implies client access.
2. `PUBLIC` and `anon` must not receive EXECUTE on `SECURITY DEFINER` RPCs.
3. Internal-only helpers must not be directly executable by `authenticated`.
4. Client-facing functions require explicit grants to their intended role.
5. Function-body `auth.uid()`, membership, shop and role checks remain
   mandatory even when grants are restricted.
6. Release UAT must verify both EXECUTE privileges and negative authorization
   behavior; checking source text alone is not sufficient.
7. Never fix this by weakening RLS or removing internal authorization checks.
<!-- /V3_SECURITY_DEFINER_RPC_PRIVILEGE_RULE_20260904 -->

<!-- V3_SECURITY_CHECKPOINT_STALE_SHA_INCIDENT_20260904 -->
### 2026-09-04 — Security checkpoint stale hardcoded SHA

Symptom:
A security checkpoint executor expected `ae3b427...` after V3 had legitimately
advanced.

Root cause:
Previous-turn Git state was hardcoded.

Permanent prevention:
Fetch current refs and derive current branch state dynamically. Do not repair a
stale SHA by replacing it with another hardcoded SHA.
<!-- /V3_SECURITY_CHECKPOINT_STALE_SHA_INCIDENT_20260904 -->

<!-- V3_SECURITY_CHECKPOINT_CLASSIFIED_DIVERGENCE_20260904 -->
### 2026-09-04 — Classified PROD/DEV environment-isolation divergence

Git reported V3 ahead of and behind main because PROD and DEV environment
bindings were committed independently on their respective branches.

Safe intermediate rule:
A non-merge checkpoint may continue only if the complete main-only effective
file set is explicitly allowlisted as environment-isolation state, branch
bindings are semantically correct, and the pending patch has no overlap.

Promotion remains blocked while V3 is behind main. Reconcile from a clean tree
after the independent patch is checkpointed.
<!-- /V3_SECURITY_CHECKPOINT_CLASSIFIED_DIVERGENCE_20260904 -->

<!-- V3_SECURITY_CHECKPOINT_MSYS_REF_PATH_INCIDENT_20260904 -->
### 2026-09-04 — Git Bash/MSYS rewrote Git `ref:path` syntax

Release/stage:
V3 security-hardening checkpoint — classified branch-divergence validation.

Symptom:
`git show origin/main:.env.example` failed as:
`fatal: ambiguous argument 'origin\main;.env.example'`.

Platform:
Windows Git Bash / MSYS invoking native Git.

Root cause:
The `origin/main:.env.example` argument contains colon/path-like syntax that
MSYS interpreted and rewrote before Git received it.

Resolution:
Do not use Git `ref:path` syntax in release executors on this Windows Git Bash
workflow. For content-presence validation, use:
`git grep -Fq -e "<pattern>" <ref> -- <path>`.
For tree comparison, use ordinary ref arguments plus `--` path separators.

Permanent prevention:
- Avoid `git show <ref>:<path>` and `git cat-file ... <ref>:<path>` in WineShopPOS
  Git Bash executors.
- Prefer `git grep <ref> -- <path>` when only semantic markers are required.
- If exact remote-file bytes are ever needed, use an isolated archive/temp-tree
  mechanism or explicitly proven MSYS conversion controls.
- Never globally disable MSYS argument conversion for an entire release
  executor unless every affected command has been tested.
- Keep Git's `--` revision/path separator explicit.

Safe continuation point:
The failure occurred before migration rename, documentation edits, staging,
commit, push or deployment. The pre-existing four-file security patch remains
the continuation source of truth.
<!-- /V3_SECURITY_CHECKPOINT_MSYS_REF_PATH_INCIDENT_20260904 -->

<!-- V3_MAIN_RECONCILIATION_20260904 -->
### 2026-09-04 — Controlled main -> V3 environment-isolation reconciliation

Pre-reconciliation condition:
- V3 security checkpoint was committed/pushed and the V3 worktree was clean.
- Git reported V3 ahead of and behind main because PROD and DEV environment
  isolation had been committed independently.

Safety proof before merge:
- The complete main-only effective tree delta was exactly:
  `.env.example`,
  `.github/workflows/environment-isolation.yml`,
  `docs/environment/ENVIRONMENT_ISOLATION.md`,
  `package.json`,
  `scripts/supabase-environment-policy.mjs`,
  `src/lib/supabase.js`,
  `vite.config.js`.
- Six shared isolation files were byte-identical between main and V3.
- `.env.example` was intentionally branch-specific:
  main -> PROD `uiurgplnsgmawvxhjzzp`;
  V3 -> DEV `juhcypzoacauzmtzqnwd`.

Resolution:
A Git `ours` merge strategy was used only after the above proof. This records
main as an ancestor of V3 while retaining V3's already-equivalent isolation
implementation and its required DEV binding.

Permanent rule:
Never use an `ours` merge merely to silence divergence. It is allowed only when
the complete incoming effective delta is explicitly classified, all shared
files are proven identical, and every intentional branch-specific difference is
verified semantically before merge.

Post-merge release requirement:
V3 must report zero commits behind main, remain DEV-bound, pass the environment
guard/security regressions/lint/build, and finish with a clean tree before
preview/UAT work continues.
<!-- /V3_MAIN_RECONCILIATION_20260904 -->

<!-- V3_MAIN_RECONCILIATION_PARENT_VALIDATOR_INCIDENT_20260904 -->
### 2026-09-04 — Valid reconciliation merge rejected by fragile parent validator

Symptom:
The reconciliation merge commit was created with the expected two parents, but
a shell pattern over the full `git rev-list --parents` output rejected it.

Root cause:
The validator compared a combined commit/parent line instead of resolving each
parent explicitly.

Permanent prevention:
Validate merge identity with exact values from `git rev-parse HEAD^1` and
`git rev-parse HEAD^2`, plus an explicit two-parent count. Never recreate a
valid merge solely because a post-commit validator failed.
<!-- /V3_MAIN_RECONCILIATION_PARENT_VALIDATOR_INCIDENT_20260904 -->

<!-- V3_MAIN_RECONCILIATION_REACHABILITY_COUNT_INCIDENT_20260904 -->
### 2026-09-04 — Generic rev-list count misclassified one local merge as three commits

Symptom:
A resume executor expected:
`git rev-list --count origin/V3..HEAD == 1`
but received `3`.

Root cause:
For a merge commit, `origin/V3..HEAD` includes every commit newly reachable
through either parent. The reconciliation merge made the two main-only commits
reachable through `HEAD^2`, so the set correctly contained:
1. the reconciliation merge commit;
2. main-only isolation commit;
3. main-only merge commit.

This metric does not answer “how many commits were created locally on V3's
first-parent line?”

Resolution:
Use:
`git rev-list --count --first-parent origin/V3..HEAD`
and separately validate:
`HEAD^1 == origin/V3`,
`HEAD^2 == origin/main`,
and exactly two parents.

Permanent prevention:
Do not use generic reachability counts to identify the number of newly-created
local commits after a merge. Distinguish graph reachability from first-parent
branch history.
<!-- /V3_MAIN_RECONCILIATION_REACHABILITY_COUNT_INCIDENT_20260904 -->

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

## VITE PREVIEW BASE PATH / WINDOWS EXECUTOR FAILURE — 2026-09-05

### Failure sequence

1. Windows Git Bash rewrote the Vite preview base and generated malformed paths
   such as `/Program Files/Git/v3-preview/favicon.svg`.
2. `spawnSync("npx.cmd", ..., shell:false)` failed with `EINVAL`.
3. Verified resolution: Vite JavaScript API inside Node:
   `await build({ base: "/v3-preview/" })`.

### Permanent prevention

- Do not pass path-like Vite preview bases through Git Bash/MSYS.
- Use Vite's JavaScript API for this Windows preview build.
- Reject drive letters, `Program Files`, or Git-install path leakage.
- HTTP-check remote assets after deployment.

## HOSTED E2E STALE UI CONTRACTS — 2026-09-05

### Failure

Hosted V3 Playwright assertions lagged behind current UI contracts:

- Inventory expected exact H2 `Inventory`; current page H2 is
  `Inventory & Product Stock`.
- POS expected historical `Manual Search`, `.search-result`, and an in-POS
  `Scanner Test` button.
- Backup & Recovery used an unscoped heading selector although the shell H1 and
  page H2 intentionally share the same title.

### Root cause

The application evolved but historical browser selectors were retained.
The historical POS cart test also conflicted with the current mandatory
cashier-shift rule and therefore no longer belonged in a read-only suite.

### Permanent prevention

1. Assert current accessible UI contracts rather than incidental classes.
2. Scope duplicate shell/page titles semantically.
3. Keep read-only release suites free of shifts, cart/billing mutations, sales,
   and other operational writes.
4. Verify scanner diagnostics at Admin → Hardware → Scanner.
5. Update browser contracts in the same release when UI architecture changes.

## EXECUTOR SELF-CHECK SELECTOR API MISMATCH — 2026-09-05

### Failure

The E2E structural patch correctly wrote:

`getByLabel("Scan barcode or search products")`

but the executor's static verifier incorrectly searched for:

`name:"Scan barcode or search products"`

The patch therefore succeeded and the verifier failed afterward, leaving one
legitimate modified test file in the working tree.

### Permanent prevention

- Static release-executor assertions must verify the exact API form written by
  the patch.
- When a verifier fails after a write, resume from the known partial state
  instead of replaying the mutation.
- Require exact dirty-path classification before continuation.

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

<!-- RELEASE_SHA_STDOUT_CAPTURE_20260905 -->
### 2026-09-05 — command substitution captured noisy Git commit stdout instead of only SHA

Observed:
A release helper was called inside command substitution while also allowing
`git commit` to write its normal summary to stdout. The resulting variable
contained the commit summary plus the SHA, and `git archive` rejected it.

Permanent prevention:
- never capture mutating Git helper mixed stdout as an identifier;
- run commit/push normally, then call `git rev-parse HEAD`;
- validate SHA variables with `^[0-9a-f]{40}$`;
- reserve stdout exclusively for machine data when a helper must return data;
- after a source push succeeds, resume from that pushed SHA rather than replaying it.

<!-- EXACT_ARCHIVE_BRANCH_IDENTITY_20260905 -->
### 2026-09-05 — exact Git archive lacked branch identity for environment isolation

Observed:
An exact-SHA `git archive` intentionally had no `.git` directory. Vite loaded
the Supabase environment policy, which could not infer a branch and correctly
blocked the build.

Permanent prevention:
- preserve exact Git-free archive builds;
- do not disable environment isolation;
- provide the repository-supported branch identity using `BRANCH_NAME`,
  `GITHUB_REF_NAME`, or `GITHUB_HEAD_REF`;
- use `BRANCH_NAME=V3` for QA and `BRANCH_NAME=main` for PROD;
- verify resulting compiled assets contain only the expected Supabase ref.

<!-- CONTINUATION_BRANCH_ADVANCED_20260905 -->
### 2026-09-05 — resume executor required stale exact branch head after legitimate concurrent commit

Observed:
A resume executor correctly knew that the Help/User Manual removal had been
pushed at `c8580a53c1a37cd174a82efa431d9154db9168ee`, but it required local V3
HEAD to equal that exact SHA. Before the next run, V3 legitimately advanced by
one descendant commit adding the Windows setup download. main also advanced
with the related Windows setup work. The rigid equality check stopped safely.

Root cause:
The continuation confused "last verified release commit" with "branch must
remain frozen forever."

Permanent prevention:
- fetch current branch state at every continuation;
- if newer commits exist, inspect them before writing;
- allow continuation when the last verified release commit is an ancestor of
  the current candidate AND the required source invariant is still true;
- preserve unrelated/newer functionality rather than resetting to the old SHA;
- derive the actual candidate SHA after safe synchronization and bind the
  artifact/deployment evidence to that SHA;
- stop on divergence, target collision, or invariant regression.

<!-- V5_DEV_INVOICE_MISSING_SUBSCRIPTION_20260907 -->
## 2026-09-07 — V5 DEV Invoice API Azure `MissingSubscription` continuation failure

Incident marker:
`V5_DEV_INVOICE_MISSING_SUBSCRIPTION_20260907`

Date / release / stage:
2026-09-07 — V5 bootstrap — isolated DEV Invoice API setup, managed-identity/storage-access stage.

Symptom:
The resume executor reached the DEV managed-identity/storage-access stage and stopped with:

`(MissingSubscription) The request did not have a subscription or a valid tenant level resource provider.`

Confirmed partial cloud state before this incident was recorded:
- DEV storage account `wspv5invdev53b6e9a1` exists.
- Private invoice container had been created by the earlier run.
- DEV Function App `wsp-v5-invoice-dev-53b6e9a1` exists.
- HTTPS-only was enabled successfully.
- Azure auto-created Application Insights during Function creation; Function telemetry connection settings were later removed, but the Application Insights resource itself was not deleted.
- PROD Invoice API `wsp-v3-invoice-53b6e9a1` remained bound to PROD Supabase.
- No PROD business data was copied.
- The DEV Invoice API code deployment and final DEV runtime binding had not yet been reached when this failure occurred.

Authentication/tool/platform involved:
Azure CLI 2.87.0 on Windows Git Bash; active Azure subscription was visible and management-plane reads had previously succeeded.

Root cause:
NOT YET PROVEN. The exact Azure CLI subcommand producing `MissingSubscription` must be isolated by read-only diagnosis before another mutation is attempted. Do not infer that Git cloning, Supabase, or application source caused this error.

Resolution used:
1. Stop further DEV cloud mutation.
2. Record this incident in the canonical failure register.
3. Run read-only Azure checks with the subscription ID supplied explicitly to account/resource/RBAC commands.
4. Only after the exact failing command/auth context is known may a resume executor be generated.

Permanent prevention:
- New Azure continuation scripts must pass the resolved active subscription explicitly where the command supports `--subscription`.
- Do not diagnose Azure management-plane/RBAC failures by assumption.
- Separate resource existence, identity read, role-assignment read, role-definition read, storage data-plane access and app-setting configuration into independently labelled checks.
- Reuse existing resources after partial success; do not delete/recreate them to make an executor pass.
- PROD resources remain read-only during V5 DEV bootstrap.
- A failed run with successful prior cloud creation is partial state, not rollback.

Safe continuation point:
Start from current V5 HEAD and the existing DEV Function/storage resources. First complete read-only Azure diagnosis. Do not rerun source bootstrap, recreate V5, copy PROD data, or recreate the already-existing DEV resources.

Verified outcome:
Pending read-only diagnosis.
<!-- /V5_DEV_INVOICE_MISSING_SUBSCRIPTION_20260907 -->

<!-- V5_DEV_INVOICE_MSYS_SCOPE_RESOLVED_20260907 -->
## 2026-09-07 — V5 DEV Invoice API `MissingSubscription` root cause resolved

Incident marker:
`V5_DEV_INVOICE_MSYS_SCOPE_RESOLVED_20260907`

Linked incident:
`V5_DEV_INVOICE_MISSING_SUBSCRIPTION_20260907`

Verified root cause:
Windows Git Bash/MSYS path conversion affected the Azure RBAC `--scope` argument because the Azure resource ID begins with `/subscriptions/...`. Azure account, resource-group, Function, storage, managed-identity, provider and role-definition reads were valid; the same storage-scope role-assignment read succeeded when executed with `MSYS_NO_PATHCONV=1`.

Resolution:
Use `MSYS_NO_PATHCONV=1` only for Azure CLI role-assignment commands that receive Azure resource IDs beginning with `/subscriptions/...`. Do not disable MSYS conversion globally for the executor.

Permanent prevention:
- Treat Azure ARM resource IDs as Azure identifiers, not filesystem paths.
- On this Windows Git Bash workflow, wrap `az role assignment list/create/delete ... --scope "/subscriptions/..."` with `MSYS_NO_PATHCONV=1`.
- Continue to pass `--subscription` explicitly.
- Do not replace the inherited managed-identity architecture with storage keys merely to work around a shell argument-conversion defect.
- Keep PROD resources read-only during DEV/V5 work.

Safe continuation point:
Reuse existing `wsp-v5-invoice-dev-53b6e9a1` and `wspv5invdev53b6e9a1`, grant the existing Function managed identity the required DEV storage role, deploy the inherited Invoice API source, bind V5 to DEV and verify.

Verified outcome:
Azure storage-scope role-assignment READ with `MSYS_NO_PATHCONV=1`: PASS.
Full V5 DEV runtime completion: pending this same continuation.
<!-- /V5_DEV_INVOICE_MSYS_SCOPE_RESOLVED_20260907 -->


<!-- V5_DEV_INVOICE_SINGLE_PUSH_VERIFIED_20260907 -->
### 2026-09-07 — V5 DEV Invoice runtime continuation verified

- MSYS Azure scope handling with `MSYS_NO_PATHCONV=1`: PASS.
- Existing DEV Function managed identity storage role: verified/granted.
- DEV Invoice API deployment from inherited current source: PASS.
- DEV Invoice API bound to WineshopPOS_DEV: PASS.
- DEV private invoice storage health: PASS.
- V5 frontend DEV-only build isolation: PASS.
- PROD Invoice API/storage bindings: verified unchanged after continuation.
- Authenticated OCR/manual browser UAT remains a separate pending verification class.
<!-- /V5_DEV_INVOICE_SINGLE_PUSH_VERIFIED_20260907 -->

### 2026-09-07 — V5-04 exact allowlist ignored new untracked release files

Marker: `V5_04_ALLOWLIST_UNTRACKED_20260907`

Release/stage:
V5 Product Enrichment V2 + dedicated QA/DEV preview, Step 5 exact Git allowlist.

Symptom:
The executor expected both modified tracked files and newly-created release files, but computed:
`ACTUAL_CHANGED="$(git diff --name-only | sort)"`.
`git diff --name-only` reports tracked modifications only, so new release-owned files were omitted from the actual list and the executor falsely stopped with `Unexpected changed-file set`.

Git/tool behavior involved:
Git worktree status and exact allowlist validation.

Root cause:
The validator compared an allowlist containing tracked + untracked paths against a command that can enumerate only tracked diffs.

Resolution used:
Build the exact changed set from:
1. `git diff --name-only` for tracked modifications, plus
2. only the expected release-owned paths that currently exist and are not tracked.
Then sort/deduplicate and compare that union to the exact allowlist. Unrelated pre-existing untracked executor/download files remain ignored and unstaged.

Permanent prevention:
- Never use `git diff --name-only` alone when an executor intentionally creates new files.
- Exact release validation must include both tracked modifications and newly-created allowlisted paths.
- Preserve unrelated untracked files; never use destructive cleanup to make the set pass.
- Stage only the explicit release allowlist and separately verify the staged set.

Safe continuation point:
The failed V5-04 run stopped before commit/push, DEV Edge Function deployment and Azure V5 preview deployment. Its cleanup restored only executor-owned source files. Continue from the unchanged V5 remote base with the corrected 04B executor.

Verified outcome:
Pending this continuation.

### 2026-09-07 — V5 preview QA/DEV badge automated marker passed but visual UAT failed

Marker: `V5_PREVIEW_BADGE_VISUAL_UAT_FAILED_20260907`

Release/stage:
V5 dedicated QA/DEV preview after Product Enrichment V2 deployment.

Symptom:
Automated checks proved that the deployed JavaScript contained the `QA / DEV · V5 · NOT PROD` marker, but authenticated browser visual UAT showed no visible QA/DEV environment badge. The inherited sidebar brand also visibly showed `V4`.

Verified source issue:
`src/components/AnimatedBrand.jsx` on V5 still hard-coded the sidebar version badge and aria label as V4.

Root cause:
The V4 sidebar label was a source carry-forward defect. The reason the separate fixed-position environment badge was not visually observable is not treated as proven from bundle-marker checks alone.

Resolution used:
- Change V5 sidebar version badge from V4 to V5.
- Keep the environment badge component environment-controlled.
- Add a redundant high-z-index top-center QA/DEV warning style so the environment state is unmistakable in browser UAT.
- Rebuild and redeploy only the dedicated V5 QA storage from the exact committed V5 SHA.
- Keep visual status pending until a human confirms the new preview.

Permanent prevention:
- Bundle-string presence is not visual UAT.
- Version branding must be checked explicitly when bootstrapping a new generation.
- QA/DEV previews should use redundant visible cues: generation badge plus environment warning.
- Automated deployment must continue to verify DEV runtime binding and PROD non-mutation separately from visual UAT.

Safe continuation point:
V5 source and DEV runtime remain authoritative. Redeploy the existing dedicated V5 preview storage only after the badge fix commit.

Verified outcome:
Pending V5 preview visual re-test.

### 2026-09-07 — V5-05 built-CSS verification falsely failed on a source comment marker

Marker: `V5_PREVIEW_CSS_COMMENT_CHECK_FALSE_FAILURE_20260907`

Release/stage:
V5 visible QA/DEV badging fix, automated build verification.

Symptom:
The V5-05 executor completed lint with 111 warnings and 0 errors and Vite built successfully, then stopped at:
`FAILED: Built CSS missing visible badge fix.`

Root cause:
The executor attempted to prove the built CSS by searching the production/minified CSS bundle for a source comment marker:
`V5_PREVIEW_BADGE_VISIBILITY_FIX_20260907`.
Production CSS minification is allowed to remove comments, so the absence of that comment in `dist/assets/*.css` does not prove the CSS rules are missing.

Resolution used:
Keep the source-marker assertion against `src/index.css`, but validate built/public CSS semantically using durable selectors/properties:
- `environment-preview-badge`
- `data-environment-visible`
- highest z-index `2147483647`
- fixed positioning / top-center warning rule
The validator must not depend on preservation of source comments in minified artifacts.

Permanent prevention:
- Never use non-license source comments as proof of production CSS/JS behavior.
- Use selectors, data attributes, runtime strings, durable declarations, artifact hashes and browser UAT.
- Lint warnings are not release failures when the configured linter reports zero errors.
- Visual UAT remains separate from bundle verification.

Safe continuation point:
The failed V5-05 run stopped before commit and preview redeployment. Cleanup restored only executor-owned files. Remote V5 therefore remains at the previously deployed Product Enrichment commit until this 05B continuation succeeds.

Verified outcome:
Pending 05B.

### 2026-09-07 — V5-06 nested template literal broke executor source generation

Marker: `V5_06_NESTED_TEMPLATE_LITERAL_SYNTAX_20260907`

Release/stage:
V5 automatic product image separation, Step 3/8 source generation.

Symptom:
Node stopped before source mutation completed with:
`SyntaxError: Unexpected identifier 'shop'`
at:
`candidateId: \`shop-${peer.id}\``

Root cause:
The executor embedded a TypeScript block inside a JavaScript `String.raw` template literal, while the generated TypeScript itself also contained template literals. The inner backtick closed the outer generator string, so Node parsed the remaining TypeScript as generator code and failed.

Resolution used:
V5-06B writes the generated TypeScript block to a temporary file with a single-quoted shell heredoc. A small Node patcher reads that file as plain text and inserts it into the current Edge Function source. Embedded TypeScript backticks no longer interact with the generator parser.

Permanent prevention:
- Avoid nested same-delimiter template literals in executor code generation.
- Prefer literal quoted heredoc files for large generated source blocks.
- Parser-check generator code before Git/cloud mutation.
- Treat this as a local executor-generation failure, not a product-code failure.

Safe continuation point:
V5-06 cleanup restored only release-owned source files and stopped before Git commit, DEV Edge Function deployment or preview redeployment. Resume from unchanged V5 with V5-06B.

Verified outcome:
Pending V5-06B.

### 2026-09-07 — Paid/card-required image provider was proposed before explicit user approval

Marker: `V5_PAID_PROVIDER_PREAPPROVAL_GAP_20260907`

Context:
The broad image-search fix initially selected Brave Images. UAT then exposed that the provider required payment details/card setup. The user had an existing project rule that any paid or potentially chargeable service must be explicitly approved before implementation.

Outcome:
The Brave-based executor was stopped at the missing-secret prompt before Git/code/cloud product mutation. No Brave key was configured.

Permanent rule:
Any new service that:
- has a non-zero subscription,
- requires payment details for the intended plan,
- can automatically move from free to paid,
- or can create usage charges,
must stop and request explicit user approval before implementation.

Current corrective design:
Use SerpApi only when its Account API reports monthly price = $0.
Runtime defaults `SERPAPI_ALLOW_PAID=false`.
If free quota is exhausted, image search stops and manual image upload remains available.
No automatic upgrade, paid fallback, Azure paid search resource, or alternate paid provider is allowed.

### 2026-09-07 — AUTO_IMAGE returned false "no image" because broad provider was absent and negative discovery was cached

Marker: `V5_AUTO_IMAGE_FALSE_NO_RESULT_CACHE_PROVIDER_GAP_20260907`

Observed UAT:
`Cartsberg Elephant Strong Super Premium Beer CAN: No usable internet image was found...`

Verified provider/cache state:
- UPCItemDB: NO_MATCH
- OpenFoodFacts: no useful candidate
- Brave Images: NOT_CONFIGURED
- negative generic discovery response was reused from the enrichment cache

Permanent fix:
AUTO_IMAGE receives a dedicated broad-image path that:
- does not use generic product-discovery negative cache,
- uses existing aliases and same-shop product-family knowledge,
- runs at most two SerpApi Google Images requests,
- safely retries multiple returned image URLs,
- never uses barcode in the search query,
- mutates only image_path,
- verifies product identity/barcode unchanged.

### 2026-09-07 — V5 image correction UX gap

Marker: `V5_IMAGE_CHOOSER_TRY_ANOTHER_UX_20260907`

UAT found that automatic product image lookup could successfully attach an
image, but correcting a visually wrong result was still awkward because
Find/Replace could choose the same top-ranked image again.

Permanent UX fix:
- Try Another Image skips the current and previously used candidates first.
- Choose Image opens a thumbnail picker with up to 8 server-generated choices.
- Choice sets are cached positively for 24 hours to conserve the free quota.
- Empty choice sets cache only 30 minutes.
- The browser cannot submit arbitrary image URLs; it can select only a
  server-cached candidate ID.
- Barcode/Product Master identity remains immutable during image correction.

### 2026-09-07 — V5_11 AutomationHub sendDraft boundary mismatch

Marker: `V5_11_AUTOMATIONHUB_SENDDRAFT_BOUNDARY_20260907`

Observed:
- V5_11 reached Step 4/11.
- Product/image/mobile changes were still uncommitted.
- The AutomationHub transformer searched for `\n  return <` after
  `async function sendDraft()`, but current V5 uses `return (` and has
  `const supplierDefaults = useMemo(...)` directly after sendDraft.
- The executor stopped before commit/push/deploy and restored only its owned files.
- V5 remained at the pre-run SHA.

Root cause:
The patch used an assumed JSX return boundary instead of the exact current V5
function boundary.

Resolution / permanent prevention:
- V5_11B reads the current V5 AutomationHub structure.
- sendDraft is bounded by `async function sendDraft()` and the following
  `const supplierDefaults = useMemo(...)`.
- The receiving CTA is replaced by its exact current JSX block.
- The replacement does not reference the analyze-local `duplicateStatus`.
- Server review draft persistence is verified before navigating to the unified
  Purchase Receiving Workspace.

### 2026-09-07 — V5_11B duplicateStatus postcondition false positive

Marker: `V5_11B_DUPLICATESTATUS_SCOPE_ASSERT_FALSE_POSITIVE_20260907`

Observed:
- V5_11B reached Step 4/11.
- The corrected sendDraft transformer itself no longer referenced duplicateStatus.
- A whole-file assertion `s.includes("duplicateStatus ===")` still failed because
  current AutomationHub legitimately uses duplicateStatus inside the OCR analyze()
  workflow.
- The executor stopped before commit/push/deploy and restored only its owned files.
- V5 remained at the pre-run SHA.

Root cause:
A safety assertion was applied to the entire AutomationHub source instead of only
the transformed sendDraft function.

Resolution / permanent prevention:
- V5_11C scopes the duplicateStatus assertion to the transformed sendDraft block.
- Legitimate duplicateStatus logic elsewhere in OCR analysis is preserved.
- V5_11C also removes the exact Bulk Create Unmatched Products JSX button together
  with its obsolete OCR bulk-create function, preventing a later undefined-symbol
  lint/build failure.

### 2026-09-07 — V5_11C image localization + popup scroll regression

Marker: `V5_11C_IMAGE_LOCALIZATION_AND_SCROLL_REGRESSION_20260907`

Observed:
- V5_11C completed implementation phases through Step 7/11.
- Automated regression reached 46 tests: 44 PASS, 2 FAIL.
- Failing tests:
  1. `India and Global localization`
  2. `popup scrolls`
- The executor stopped before commit/push/deploy and restored only its owned files.
- V5 remained at the pre-run SHA.

Root causes:
1. The Edge transformer inserted a regex literal through a JavaScript template
   literal using `\s`. The template-literal cooking removed the intended
   backslashes, so the generated Global query cleanup did not contain the exact
   whitespace regex expected by the regression test.
2. ProductForm contained the new `.product-image-chooser-scroll` wrapper, but the
   final consolidation CSS block did not yet define that class.

Resolution / permanent prevention in V5_11D:
- Global query cleanup uses ordinary string operations
  (`endsWith(" india")` + `slice(0, -6)`) instead of a nested regex literal.
- Edge postconditions validate the generated Global suffix-removal code.
- Popup CSS explicitly defines the scroll container, modal flex layout and
  India/Global scope controls.
- The regression test validates the string-based Global cleanup and scroll CSS.

### 2026-09-07 — V5_10C India/Global source-regex test false negative
Marker: `V5_10C_GOOGLE_LOCALIZATION_TEST_FALSE_NEGATIVE_20260907`
Observed: 35/36 tests passed; implementation contained valid Global normalization, but the source-regex test double-escaped the regex literal. Executor restored owned files before commit/push/deploy; V5 remained dd3be262cf738f6998d0c7e77d8ecbf30c88fc96.
Permanent prevention: source assertions for regex literals use direct string inclusion/semantic assertions. V5_11 absorbs the valid implementation and corrected test.

### 2026-09-07 — V5 non-mobile human UAT gaps

Marker: `V5_NON_MOBILE_UAT_GAPS_20260907`

Human UAT exposed non-mobile gaps: preview badge could disappear, OCR non-2xx errors were generic, OCR table lacked Sr No/Size/column controls/sticky heading, unmatched lines hid the suggested product name and automatic candidate image preview, impossible Price/Bottle >= MRP could still be confirmed, ambiguous dates lacked a quick candidate picker, and the Edit Product image chooser did not identify the product being searched.

V5_12B fixes these UAT gaps and also repairs the mobile barcode camera scanner. Mobile product-photo capture is left unchanged because it already passed UAT.

### 2026-09-07 — V5_12 ProductForm template interpolation failure

Marker: `V5_12_PRODUCTFORM_TEMPLATE_INTERPOLATION_FAILURE_20260907`

Observed:
- V5_12 reached Step 4/8.
- The ProductForm patch generator embedded JSX template expressions such as
  `${form.brand}` inside the executor's own JavaScript template literal.
- The patch generator evaluated `form` while running under Node and failed with
  `ReferenceError: form is not defined`.
- The executor stopped before commit/push/deploy and restored only V5_12-owned files.

Prevention in V5_12B:
- Product identity JSX uses ordinary expression concatenation rather than nested
  `${...}` template interpolation inside the patch generator.
- The generated ProductForm source is validated by lint/build before commit.

### 2026-09-07 — Mobile barcode camera did not decode during human UAT

Marker: `V5_MOBILE_BARCODE_CAMERA_UAT_FAILED_20260907`

Observed:
- Product photo capture from the mobile camera works.
- Mobile camera barcode scanning did not successfully decode/return a barcode.
- The existing scanner used one ZXing `decodeFromConstraints` path only.

Resolution in V5_12B:
- Prefer the browser-native BarcodeDetector API on supported mobile browsers.
- Automatically fall back to ZXing BrowserMultiFormatReader when native scanning
  is unavailable or has not decoded after a short interval.
- Explicitly request the rear/environment camera.
- Enumerate available cameras and allow Switch Camera when multiple cameras exist.
- Expose torch control when the selected camera reports torch capability.
- Preserve typed/manual barcode fallback and GTIN validation.
- No paid scanning service is introduced.

### 2026-09-08 — V5_12B post-deploy human UAT gaps

Marker: `V5_12B_POST_DEPLOY_UAT_GAPS_20260908`

Human UAT on deployed V5_12B confirmed:
- QA / DEV · V5 · NOT PROD badge is visible.
- Suggested Product Name and Price/Bottle >= MRP protection are visible.
- Product photo capture works.

Remaining defects/gaps found by human UAT:
1. Selecting Product subcategory can still raise the global application error
   `Cannot read properties of undefined (reading 'length')`.
2. OCR image placeholder says `No candidate image`; user-facing wording must be
   Product Image language instead.
3. First-time Product creation still tells the user to save first before online
   image handling; image selection/preview must be available in the same new
   Product flow and imported after Product Master creation.
4. Shop pack/size defaults requested for missing explicit invoice size:
   CAN -> 500 ml; otherwise 24 bottles/case -> 330 ml; otherwise
   12 bottles/case -> 650 ml. Explicit printed/OCR size always wins.
5. When pack interpretation makes Price/Bottle >= MRP, the likely pack should be
   auto-applied as a reviewable suggestion and the warning belongs under
   Bottles/Case, not under Price/Bottle.
6. POS Billing needs an explicit mobile camera Scan Product action in a
   collapsible panel, while preserving the existing USB/keyboard scanner flow.
7. V5 continuity documentation must be strong enough for a new chat to recover
   current implementation state from Git, without relying on conversation memory.

V5_13D addresses these gaps. No new paid service is introduced.

### 2026-09-08 — V5_13 Price/Bottle warning move patch missed actual JSX

Marker: `V5_13_PRICE_WARNING_MOVE_PATCH_MISSED_20260908`

Observed:
- V5_13 reached the automated Node test stage.
- The implementation patch added the new reviewable Bottles/Case warning, but its
  removal regex did not match the actual compact JSX for the old
  `ocr-price-impossible` Price/Bottle warning.
- `tests/v5_13_continuity_uat.test.mjs` correctly failed because the old warning
  was still present in `AutomationHub.jsx`.
- The executor stopped before commit/push/deploy and restored only V5_13-owned
  files.
- GitHub V5 therefore remained at
  `59a800d043050e8566adb7a38377c537e221bd7f`.

Permanent prevention in V5_13B:
- remove the old warning using an exact semantic regex anchored on
  `className="ocr-price-impossible"`;
- require the removal patch to match, otherwise fail immediately;
- assert the old class is absent before the full test suite;
- keep the hard Price/Bottle >= MRP confirmation block while presenting the
  human guidance under Bottles/Case.

### 2026-09-08 — V5_13B legacy V5_12 test contract became stale

Marker: `V5_13B_LEGACY_TEST_CONTRACT_STALE_20260908`

Observed:
- V5_13B reached the full automated regression suite.
- 68 tests ran: 66 PASS, 2 FAIL.
- Both failures were in the older `tests/v5NonMobileUatFixes.test.mjs`.
- Failure 1 still expected the old phrase `Candidate preview`, while V5_13B
  intentionally changed user-facing wording to `Product Image suggestion`.
- Failure 2 still expected the old Price/Bottle banner
  `BLOCKED · Cost ≥ MRP`, while V5_13B intentionally moved human guidance under
  Bottles/Case and preserved the hard confirmation guard through
  `priceSanity.impossible`.
- V5_13B stopped before commit/push/deploy and restored only its owned files.
- GitHub V5 remained at
  `59a800d043050e8566adb7a38377c537e221bd7f`.

Resolution in V5_13C:
- update the legacy V5_12 regression contract to the new Product Image wording;
- verify image discovery remains preview-only;
- verify the MRP safety logic remains a hard confirmation guard;
- verify the old Price/Bottle warning class is absent;
- verify the new Bottles/Case auto-suggestion warning is present.

### 2026-09-08 — V5_13D preflight found stale staged index from prior failed executor

Marker: `V5_13D_PREFLIGHT_STALE_INDEX_FROM_FAILED_EXECUTOR_20260908`

Observed:
- V5_13C reached `git add` and then failed at `git diff --cached --check`.
- Cleanup restored owned working-tree files but did not clear the staged index.
- V5_13D therefore saw only the exact prior executor-owned paths as `MM` / `AD`
  and stopped before mutation.
- GitHub V5 remained unchanged.

Resolution / permanent prevention in V5_13E:
- recover only when the worktree itself exactly matches HEAD;
- recover only when every staged path belongs to the exact known V5_13C allowlist;
- clear only those index entries; do not modify file contents;
- future pre-commit cleanup also unstages only current executor-owned paths before
  restoring their backups.

### 2026-09-08 — V5_13C staged diff failed on trailing whitespace

Marker: `V5_13C_GIT_DIFF_CHECK_TRAILING_WHITESPACE_20260908`

Observed:
- V5_13C passed the documentation system check.
- V5_13C passed environment isolation, user-manual sync and Vite production build.
- All V5_13C dist markers passed.
- Step 6 stopped at `git diff --cached --check` because
  `src/pages/AutomationHub.jsx` contained trailing whitespace at the generated
  line around 1820.
- The executor stopped before commit/push/deploy and restored only its owned files.
- GitHub V5 remained at
  `59a800d043050e8566adb7a38377c537e221bd7f`.

Resolution in V5_13D:
- normalize trailing spaces/tabs only in the V5_13-owned AutomationHub file after
  the deterministic source patch;
- fail immediately if any trailing spaces/tabs remain in AutomationHub;
- keep `git diff --cached --check` as the final staging gate;
- do not normalize or touch unrelated files.

### 2026-09-08 — V5_14B Realtime regression test failed on line-broken method chaining

Marker: `V5_14B_REALTIME_TEST_DOT_CHAIN_LINEBREAK_FALSE_NEGATIVE_20260908`

Observed:
- V5_14B reached the full Node regression suite.
- 76 tests ran: 75 PASS, 1 FAIL.
- The failing test expected the literal source pattern `supabase.channel`.
- The actual valid source intentionally formats the call across lines as:

  `supabase`
  `.channel(...)`

- Therefore the implementation was present, but the source-text test regex was
  too strict and produced a false negative.
- The executor stopped before commit/push/deploy and restored only V5_14B-owned
  files.
- GitHub V5 remained at
  `618fb0d9198b94af0eb1095d2bac491c91b9c268`.

Resolution in V5_14C:
- make the source-contract regex whitespace tolerant:
  `supabase\\s*\\.channel`;
- retain checks that both phone and PC use the existing Supabase Realtime
  Broadcast path;
- retain checks forbidding direct insert/upsert/update mutations in the remote
  scanner components.

### 2026-09-08 — V5_14 feature-document security wording test mismatch

Marker: `V5_14_FEATURE_DOC_TEMPORARY_SECRET_TEST_WORDING_MISMATCH_20260908`

Observed:
- V5_14 created the phone-to-PC scanner implementation and its documentation.
- The automated feature-document test expected the exact phrase
  `temporary pairing secret`.
- The feature document described the same control as
  `192-bit random pairing secret` and separately documented the 10-minute
  temporary pairing lifetime.
- The behavior/security design was unchanged; this was a documentation-contract
  wording mismatch.
- The executor stopped before commit/push/deploy and restored only V5_14-owned files.
- GitHub V5 remained at
  `618fb0d9198b94af0eb1095d2bac491c91b9c268`.

Resolution in V5_14B:
- use the explicit phrase `192-bit random temporary pairing secret` in the
  canonical feature/security document;
- retain the 10-minute expiry and Web Crypto requirements;
- keep the documentation regression test so future wording cannot accidentally
  weaken or hide the temporary-credential contract.

### 2026-09-08 — V5_16C malformed NODE_LEGACY_TEST heredoc

Marker: `V5_16C_MALFORMED_NODE_HEREDOC_TERMINATOR_20260908`

Observed:
- V5_16C reached step 7 before running the full regression suite.
- Node failed immediately with:
  `SyntaxError: Invalid or unexpected token`
- The generated executor contained a malformed heredoc boundary:
  a malformed NODE_LEGACY_TEST terminator containing an extra quote
  followed by a duplicated legacy Node patch body.
- Because that line was not an exact shell heredoc terminator, Node received the
  stray terminator text as JavaScript.
- The executor stopped before commit/push/deploy and restored only V5_16C-owned
  files.
- GitHub V5 remained at
  `d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`.

Resolution in V5_16D:
- rebuild from the last structurally valid V5_16B executor, not from V5_16C;
- replace the historical scanner test as one semantic block;
- verify every quoted heredoc has exactly one opening and one exact closing line;
- reject any suspicious `HEREDOC_NAME'` pseudo-terminator before giving the
  executor to the user.

### 2026-09-08 — V5_16B legacy scanner test still asserted removed USB help copy

Marker: `V5_16B_LEGACY_USB_HELP_TEXT_ASSERTION_STALE_20260908`

Observed:
- V5_16B reached the full root Node regression suite.
- 91 tests ran: 90 PASS, 1 FAIL.
- The stale same-device label assertion had already been updated successfully.
- The same historical V5_13E test then required obsolete copy:
  `Physical USB/keyboard barcode scanners continue`.
- V5_16 intentionally replaced the old scanner help copy with the scanner-tab
  semantic contract: Barcode Scanner / This Device Camera / Use Phone.
- New V5_16 tests for USB scanner preservation, same-device camera preservation,
  HashRouter phone pairing, acknowledgement retry/dedupe and dark-mode scanner UI
  had already passed.

Resolution in V5_16D:
- replace the whole old scanner test block instead of patching old wording one
  assertion at a time.

### 2026-09-08 — V5_16 legacy continuity test expected obsolete scanner label

Marker: `V5_16_LEGACY_SCANNER_LABEL_TEST_STALE_20260908`

Observed:
- V5_16 reached the full root Node regression suite.
- 91 tests ran: 90 PASS, 1 FAIL.
- The combined V5_16 scanner UX intentionally renamed the same-device camera tab
  to `This Device Camera`.
- Older `tests/v5_13E_continuity_uat.test.mjs` still required the obsolete source
  phrase `Camera Scan on This Device`.
- All new V5_16 scanner tests passed, including HashRouter pairing, acknowledgement
  retry/dedupe, clear scanner tabs, USB preservation, camera preservation and
  dark-mode readability.
- The executor stopped before commit/push/deploy and restored only V5_16-owned
  files.
- GitHub V5 remained at
  `d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`.

Resolution in V5_16B:
- update only the stale legacy scanner-label assertion from
  `Camera Scan on This Device` to `This Device Camera`;
- preserve the legacy requirements for MobileBarcodeScanner,
  PhoneToPcScannerPanel, USB/keyboard scanner, useScanner, lastScan and
  processBarcode;
- rerun the complete regression/docs/build/deploy workflow.

### 2026-09-08 — V5_15 Product Image documentation regex false negative

Marker: `V5_15_IMAGE_DOC_MULTILINE_REGEX_FALSE_NEGATIVE_20260908`

Observed:
- V5_15 reached the full root Node regression suite.
- 83 tests ran: 81 PASS, 2 FAIL.
- Product Image documentation correctly stated that Add Product calls the same
  `autoFindProductImage({ replace:false })` workflow used by the Products page.
- The test used `/same.*Products page/i`, where `.` did not match the newline
  between those phrases.
- This was a stale source-text test contract, not an implementation failure.
- V5_15 stopped before commit/push/deploy and restored only owned files.

Resolution in V5_16:
- use a whitespace/newline-tolerant documentation assertion;
- retain the exact Product Image workflow requirement.

### 2026-09-08 — V5_15 continuity test expected an obsolete V5 SHA

Marker: `V5_15_CONTINUITY_TEST_SHA_STALE_20260908`

Observed:
- the second V5_15 failure was the older
  `tests/v5_13E_continuity_uat.test.mjs`;
- that test still required parent SHA
  `618fb0d9198b94af0eb1095d2bac491c91b9c268`;
- current V5 before the combined repair is
  `d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`;
- the current-state document was correctly updated to the newer V5 baseline.

Resolution in V5_16:
- update only the stale continuity SHA assertion to the current parent;
- keep the environment/failure-register/UAT continuity requirements intact.

### 2026-09-08 — Phone-as-scanner QR used BrowserRouter-style URL in a HashRouter app

Marker: `V5_14C_PHONE_SCANNER_HASHROUTER_DEEPLINK_FAILURE_20260908`

Human UAT:
- separate-phone barcode-machine workflow did not work reliably;
- the scanner flow was confusing;
- dark-mode instructions were difficult to read;
- scanner sections/tabs were not visually clear.

Source inspection found a concrete routing defect:
- WineShopPOS uses React Router `HashRouter`;
- the PC generated a pairing URL like `/phone-scanner?...`;
- the phone scanner read `window.location.search`;
- in a HashRouter application the correct route/query belongs after `#/`;
- therefore the QR/deep-link could miss the React route and/or pairing parameters.

Resolution in V5_16:
- generate `#/phone-scanner?...` QR/deep links;
- read pairing query values through React Router `useSearchParams`;
- add safe barcode delivery retry with PC acknowledgement and duplicate-event
  acknowledgement replay;
- show PC result back on the phone;
- replace confusing scanner collapsibles with one clear scanner-method tab panel;
- add high-contrast dark-mode scanner help/status styling;
- preserve physical USB/keyboard scanner and same-device camera scanner;
- no paid scanning service or new backend resource.

### 2026-09-08 — Add Product image did not auto-load like Product Master

Marker: `V5_14C_ADD_PRODUCT_IMAGE_AUTOLOAD_UAT_GAP_20260908`

Observed:
- OCR -> Add Product showed a Product Image panel with `No image`;
- the user had to click Product Image lookup manually;
- Products page already had automatic Product Image processing.

Resolution in V5_16:
- auto-load a non-mutating Product Image preview from current product identity;
- after product creation, when no explicit image was chosen/uploaded, call the
  same `autoFindProductImage({ replace:false })` path used by Products page;
- wait for the image operation and refresh Product Master before navigation;
- barcode remains unchanged;
- no new provider, paid service, database object or Edge Function.

### 2026-09-08 — V5_16D mobile camera opens but does not identify barcode reliably

Marker: `V5_16D_MOBILE_CAMERA_BARCODE_RECOGNITION_UAT_FAILED_20260908`

Human UAT:
- mobile camera scanner opens;
- camera feed is visible;
- real product barcode is not being identified reliably.

Source-level findings in the V5_16D scanner:
- native BarcodeDetector was allowed 6.5 seconds before switching;
- ZXing first used `decodeFromVideoDevice`, which does not request the same
  high-resolution rear-camera constraints used by the native path;
- the high-resolution `decodeFromConstraints` path ran only when the first ZXing
  startup threw, not when it successfully opened a low-quality stream but failed
  to decode;
- native -> ZXing fallback could lose the selected rear-camera identity because
  React state used for activeDeviceId may not yet have updated;
- no center-region native second pass, autofocus tuning or automatic optical zoom
  assist was applied.

Resolution in V5_17:
- make high-resolution rear-camera `decodeFromConstraints` the primary ZXing path;
- keep `decodeFromVideoDevice` only as compatibility fallback;
- native detector also scans an enlarged center-region canvas;
- switch from native to ZXing sooner when no result;
- request continuous focus where the browser exposes it;
- apply a conservative automatic zoom assist where optical zoom is supported;
- keep manual Zoom + / Zoom - controls, torch, camera switching and typed barcode;
- no paid scanning service or new cloud/backend resource.

### 2026-09-08 — V5_17 mobile camera still did not recognise real barcode

Marker: `V5_17_MOBILE_CAMERA_STILL_NOT_RECOGNISING_REAL_BARCODE_20260908`

Human UAT after V5_17:
- camera opens;
- barcode target is visible;
- real mobile barcode recognition still fails.

Additional source diagnosis:
- the scanner still depended mainly on continuous whole-video decoding;
- product barcodes are overwhelmingly 1D (EAN/UPC/Code128/ITF), but the main ZXing
  reader was MultiFormat rather than the dedicated MultiFormatOneD reader;
- no ZXing center-ROI canvas decode loop existed;
- no grayscale/high-contrast ROI pass existed;
- before camera permission, device labels can be blank; picking an arbitrary
  enumerated device ID can select the wrong lens when native BarcodeDetector is
  unavailable.

Resolution in V5_19B:
- open the camera directly with `facingMode: environment` unless the user explicitly
  selected a camera;
- after permission, prefer an actually labelled rear/back camera if the first
  stream is not rear-facing;
- run dedicated `BrowserMultiFormatOneDReader` against an enlarged center ROI;
- run normal + high-contrast + occasional rotated ROI passes;
- keep `BrowserMultiFormatReader` as secondary fallback for non-1D formats;
- keep native BarcodeDetector as another independent signal;
- do not auto-zoom by default; manual zoom remains available;
- no paid scanning provider or new backend/cloud resource.

### 2026-09-08 — V5_19 global scanner change collided with older continuity contracts

Marker: `V5_19_GLOBAL_PHONE_SCANNER_LEGACY_CONTRACT_COLLISION_20260908`

Observed in the first V5_19 executor:
- V5_19 intentionally moved separate-phone pairing out of POS and into
  Operations -> Phone Scanner with a global authenticated Layout host.
- `tests/v5_13E_continuity_uat.test.mjs` still required
  `PhoneToPcScannerPanel` inside `POS.jsx`.
- The test therefore failed after the intentional architecture change.
- The executor stopped before commit/push/deploy and restored only V5_19-owned
  files. GitHub V5 remained at
  `41755f157e330cd0eb3cb8667ee6ea063389d25c`.

Full pre-retry review also found:
- older V5_14/V5_16 phone-scanner tests still required the POS-owned panel and
  10-minute pairing contract;
- the V5_17 scanner regression test still required the superseded native->ZXing
  timing/auto-zoom implementation rather than the new dedicated 1D ROI decoder;
- the first V5_19 ProductForm patch would have added a duplicate
  `data-scanner-capture="barcode"` attribute even though current V5 already has it;
- the first V5_19 ProductForm patch replaced the proven OcrProductImagePreview
  flow with a second discovery path that previewed a URL without preserving the
  existing secure candidate-selection contract;
- the first executor wrote the same new scanner-test file twice, so the second
  heredoc silently replaced the first scanner-specific contract.

Resolution in V5_19B:
- update only the legacy contracts whose architecture is intentionally superseded;
- preserve USB/Bluetooth scanning, same-device camera scanning, POS processBarcode,
  OcrProductImagePreview, secure candidate import and post-save AUTO_IMAGE;
- add stable ScannerContext software injection for the global phone scanner;
- keep 192-bit Web Crypto pairing entropy while making the V5_19 pairing lifetime
  persistent until explicit Disconnect/Replace/Forget;
- bound remote event-dedupe memory;
- use one dedicated V5_19 test file plus updated semantic legacy tests;
- assert exactly one barcode scanner-capture attribute and exactly one remaining
  ProductEnrichmentPanel in Add Product;
- retain full regression/docs/lint/build/environment/PROD-isolation gates.

### 2026-09-08 — V5_19B nested Operations route test false negative

Marker: `V5_19B_NESTED_OPERATIONS_ROUTE_TEST_FALSE_NEGATIVE_20260908`

Observed during the V5_19B retry:
- `App.jsx` correctly added `<Route path="phone-scanner" .../>` as a child of
  `<Route path="operations" ...>`, which resolves to `/operations/phone-scanner`;
- the updated test incorrectly searched the raw `App.jsx` source for the literal
  text `operations/phone-scanner`;
- React Router nested routes do not contain that combined literal in source;
- `src/config/navigation.js` does contain the full navigable path
  `/operations/phone-scanner`;
- the executor stopped before commit/push/deploy and restored only V5_19-owned
  paths.

Resolution in V5_19C:
- test the authenticated parent route `path="operations"`;
- test the nested child route `path="phone-scanner"` with `PhoneScannerSetup`;
- separately test the navigation contract contains the full
  `/operations/phone-scanner` URL;
- make the same correction in both the dedicated V5_19 test and the updated
  legacy phone-scanner contract;
- do not weaken scanner, security, Product Image, environment, build or PROD
  isolation gates.

### 2026-09-08 — V5_19C business-table mutation test false positive

Marker: `V5_19C_ARRAY_FROM_FALSE_POSITIVE_20260908`

Observed during the V5_19C retry:
- 102 of 103 automated tests passed;
- the only failure was the V5_19 global-phone safety test;
- the test used `\.from\(` to prohibit direct Supabase table access;
- `GlobalPhoneScannerHost.jsx` legitimately contains `Array.from(...)` while
  converting 24 Web Crypto random bytes into the persistent pairing token;
- `Array.from(...)` was therefore falsely detected as a Supabase `.from(...)`
  business-table call;
- the host itself uses Supabase Realtime `channel(...)` / `removeChannel(...)`
  and does not perform direct product, sale, purchase, inventory or customer
  table mutations;
- the executor stopped before commit/push/deploy and restored only V5_19-owned
  paths.

Resolution in V5_19D:
- scope the direct-table prohibition specifically to `supabase.from(...)`;
- continue prohibiting insert/upsert/update, completeSale and receiveStock from
  the global phone host and phone remote surface;
- preserve all existing Realtime-only, shop-isolation, scanner-injection,
  Product Image, environment, documentation, build and PROD-isolation gates;
- do not weaken any functional scanner test.

### 2026-09-09 — V5_20 stale mobile-scanner Retry assertion

Marker: `V5_20_STALE_RETRY_TEST_20260909`

Observed:
- V5_20 reached the full regression suite.
- A historical mobile scanner test expected the obsolete literal `>Retry<`.
- The V5_20 scanner UX had intentionally moved away from that wording.
- The executor stopped before commit/push/deploy and restored only V5_20-owned files.

Prevention:
- V5_20C updates the complete evolving scanner/image/phone semantic contract set together.
- Tests verify behavior and safety markers rather than obsolete button wording.

### 2026-09-09 — V5_20B stale Add Product image wording assertion

Marker: `V5_20B_STALE_IMAGE_WORDING_TEST_20260909`

Observed:
- V5_20B again reached the full regression suite.
- `v5CombinedImagePhoneScanner.test.mjs` still required the historical sentence
  `first Product Image preview appears automatically`.
- The current implementation had intentionally changed the wording.
- The executor stopped before commit/push/deploy and restored only V5_20-owned files.

Prevention:
- V5_20C treats pre-save Product Image selection as a real functional contract:
  internet image choices are available before barcode/save, the selected candidate
  is carried through Product creation, and the server applies that exact cached
  candidate after creation with barcode/Product Master identity verification.
- Evolving tests are reconciled together in one executor.

### 2026-09-09 — V5_20C Phone Realtime source test was formatting-sensitive

Marker: `V5_20C_PHONE_REALTIME_WHITESPACE_TEST_FALSE_FAILURE_20260909`

Observed:
- V5_20C reached the full regression suite.
- `tests/v5PhoneToPcScanner.test.mjs` expected literal `supabase.channel`.
- The valid implementation is formatted as `supabase` followed by a newline and
  `.channel(...)`.
- The executor therefore failed on source formatting, not missing Realtime behavior.
- It stopped before commit/push/DEV Edge deploy/QA deploy and restored only
  V5_20C-owned files.

Resolution in V5_20D:
- Realtime assertions use `supabase\s*\.\s*channel`.
- Direct-table guards use `supabase\s*\.\s*from\s*\(`.
- Visible Auto Scan is removed in the same pass.
- Phone camera opens once after connection and reopens after an accepted ACK.
- The phone camera title is `Scan Barcode`.
- Mobile scanner copy is reduced to one short status and one short bottle/can tip.
- Technical camera metadata is removed.
- Retry is shown only on camera error.
- Duplicate bottom Cancel is removed.
- Full-screen CSS is hardened using fixed/inset + 100vh/100dvh + object-fit cover.

Permanent prevention:
- Source-contract tests must validate semantics, not exact whitespace formatting.
- Scanner human-UAT requirements and regression tests must be reconciled together.

### 2026-09-09 — V5_20D AI evaluation path broken by documentation restructure

Marker: `V5_20D_AI_EVALUATION_RESTRUCTURE_PATH_FAILURE_20260909`

Observed:
- V5_20D reached the complete release regression stage.
- 69 of 73 tests passed.
- All scanner, phone, Product Image, OCR Edit Product, USB scanner, Realtime ACK/dedupe and full-screen/pinch tests passed.
- The only four failures were Owner AI quality-gate contract tests.
- Active AI scripts/tests still referenced the deleted path `docs/ai/evaluation/`.
- The canonical tracked assets now live under `docs/versions/v2/testing/ai/`.
- The executor stopped before commit/push/DEV Edge deploy/QA deploy and restored its owned files.

Resolution in V5_20E:
- repoint the active AI gate runner, validator, live evaluator and contract test;
- update the quality policy and evaluation lock internal paths;
- keep every threshold and absolute blocker unchanged;
- explicitly run golden-dataset validation and quality-gate tests before the full suite.

### 2026-09-09 — V5_20E real-device scanner stuck on Opening camera

Marker: `V5_20E_CAMERA_STUCK_OPENING_REAL_DEVICE_20260909`

Human UAT:
- simplified scanner UI rendered;
- scanner remained on `Opening camera…`;
- user could not scan a real barcode.

Root cause found in current V5 source:
The scan loop and active state started only after a serial chain of optional camera
setup work finished: video.play, focus/zoom tuning, rear-camera refinement, device
enumeration and native BarcodeDetector initialization.

V5_21 resolution:
- MediaStream attachment is the only hard startup requirement;
- video.play() is best-effort/non-blocking;
- track tuning is best-effort/non-blocking;
- local ZXing scanFrame starts immediately after getUserMedia returns;
- rear-camera refinement, device enumeration and native detector setup cannot block;
- automatic rear-camera refinement no longer writes requestedDeviceId and therefore
  cannot cause an unnecessary second scanner effect restart;
- 7-second camera request watchdog exposes ERROR + Retry instead of indefinite
  `Opening camera…`.

No backend, Function App, Edge Function, database or PROD behavior is changed.
