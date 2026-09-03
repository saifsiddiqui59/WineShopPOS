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
