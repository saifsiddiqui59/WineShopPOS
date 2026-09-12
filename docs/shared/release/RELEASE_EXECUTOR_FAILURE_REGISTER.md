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

Last updated: 2026-09-12.

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

## V4 WHOLE-RELEASE LESSONS 2026-09-06

Detailed retrospective:
`docs/versions/v4/releases/V4_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-06.md`

Reusable failure classes:

1. Classify migration risk before choosing backup tooling.
2. Preflight known PROD endpoints/config before expensive release stages.
3. Selective promotion requires tracked delta plus new non-ignored additions.
4. Use isolated worktrees around legitimate dirty long-lived PROD/main.
5. Require real-device mobile visual UAT before release close.
6. Treat operator path/paste/file-transfer friction as release engineering quality.

<!-- V5_BRANCH_SPECIFIC_PATCH_ANCHOR_MISMATCH_20260912 -->
### 2026-09-12 — branch-specific patch anchor copied from the wrong source flow

Observed:
`V5_LEARNED_AI_OCR_EXCEPTION_RESOLVER_SINGLE_PATCH.sh` stopped safely with
`PATCH FAILED: AutomationHub session handoff assist metadata count=0`.
No application commit, database migration, function deployment, QA deployment,
or PROD change occurred; targeted cleanup restored the tracked source edits.

Root cause:
The executor expected an older/default-branch `AutomationHub` flow containing
`sessionStorage.setItem("wineshop_ocr_purchase_draft", ...)`. Current V5 had
already moved to the authoritative ingestion-id handoff:
`/purchasing/receive?ingestion=<id>`, with `normalized_invoice` persisted on the
server. A branch-specific executor therefore tried to patch a code path that no
longer existed on V5.

Classification:
Release/executor patch-construction defect. This is not an Azure OCR failure,
not an AI-model failure, and not a new application defect/DEF.

Permanent prevention:
- branch-specific patch anchors must come from the exact target branch/current
  HEAD (`git show HEAD:path` or repository fetch with an explicit branch ref);
- default-branch code search is discovery only and must never be the authority
  for exact replacement anchors on V5 or another version branch;
- verify current architecture before editing; do not preserve obsolete
  sessionStorage handoffs when the branch uses server-authoritative ingestion;
- validate every exact replacement anchor/count for every target file before
  the first source write;
- if an anchor is absent, stop before mutation and re-read current source rather
  than adding another guessed anchor;
- resume/deployment scripts must derive current `origin/<branch>` at runtime;
  do not hardcode a previous-turn base SHA;
- continue to preserve targeted cleanup and explicit-file staging only.

<!-- V5_AI_EVIDENCE_BUDGET_AND_STATIC_ASSERTION_20260912 -->
### 2026-09-12 — AI resolver offline gate exposed evidence starvation and a brittle static assertion

Observed:
`V5_LEARNED_AI_OCR_EXCEPTION_RESOLVER_R2.sh` passed repository/source-anchor
preflight and created only local candidate files, then stopped during the
offline test gate. The real B-3339 fixture test could not find direct
`(+)CD -> 599` evidence, and the integration test expected the punctuation-
sensitive regex `ingestionId}})` even though the patched source correctly
contained `ingestionId}});`.

The executor cleanup then restored the tracked source edits and removed its new
candidate files. It stopped before Git commit/push, DEV migration, Edge Function
deployment, QA deployment, or any PROD operation.

Root causes:
1. `buildResolutionEvidence()` appended product-table row evidence before the
   later finance-summary table and then sliced the first 72 rows globally.
   B-3339 has a large item table, so valid direct finance evidence such as
   `(+)CD -> 599` was outside that insertion-order budget.
2. The static integration test asserted an incidental punctuation shape rather
   than the semantic invariant that the OCR Edge Function request carries the
   ingestion id.

Classification:
Executor/implementation-test design defect. The captured Azure OCR evidence is
valid; this is not an Azure OCR regression, not an AI provider failure, and not
a new product DEF.

Permanent prevention:
- never truncate heterogeneous OCR evidence by raw insertion order;
- preserve direct table/KV evidence independently from large line-item evidence;
- choose the small AI prompt evidence set by unresolved target compatibility and
  evidence priority, not document position;
- never truncate serialized JSON mid-document; compact structured data before
  serialization and fail closed if it still exceeds budget;
- real golden fixtures must explicitly assert that critical direct evidence
  survives evidence-budgeting before AI mapping tests run;
- static source tests must assert semantic integration markers and avoid
  punctuation-sensitive regexes when punctuation is not the contract;
- offline fixture/regression gates remain before commit, database mutation,
  service deployment, or QA deployment.

<!-- V5_STATIC_CONTRACT_ASSERTION_FALSE_NEGATIVE_20260912 -->
### 2026-09-12 — R3 still used punctuation-sensitive static source verification

Observed:
`V5_LEARNED_AI_OCR_EXCEPTION_RESOLVER_R3.sh` reached the offline gate after
the current-source preflight and source transformation, but its integration
test failed on an exact regex for the OCR invoke-call punctuation even though
the Stage 5 transform had already succeeded. Cleanup restored the candidate
tracked edits before commit/deploy.

Root cause:
The verification still encoded punctuation/formatting as the contract instead
of isolating `invokeOcrWithRetry` and validating the semantic data flow.

Classification:
Executor verification false negative. Not OCR, not Azure AI, not Supabase, and
not a new product defect.

Permanent prevention:
- validate semantic postconditions immediately after deterministic transforms;
- integration tests must isolate the relevant function/call block and verify
  identifiers/data flow rather than exact punctuation;
- avoid assertions that dump an entire 60k+ source file for a one-line contract;
- direct OCR finance evidence must be budgeted ahead of large line-item evidence;
- ambiguous product-table rows tied to multiple item indexes may never be
  AI-corrected or auto-learned;
- a first-time novel/misspelled label may be suggested by AI but must remain a
  manual correction until successful human review confirms that field; only
  confirmed supplier/shop memory may auto-apply it on later invoices.

<!-- V5_R4_RESOLVER_ROUTE_AND_AUTOMATION_WRITE_OMISSION_20260912 -->
### 2026-09-12 — R4 offline gate exposed resolver-route assumptions and an unwritten transformed source file

Observed:
`V5_LEARNED_AI_OCR_EXCEPTION_RESOLVER_R4.sh` passed repository/source preflight
and reached the offline regression gate, then stopped with four tests failing:
- real B-3339 remained on the old unsafe parser values (`cashDiscountAmount`
  stayed `88558` instead of `599`), proving the AI finance batch was not
  applied;
- the `needs_review=true` test did not retain the expected suggestion set;
- 16845 made one AI call even though its finance reconciliation already MATCHed;
- the AutomationHub integration test could not find the new `ingestionId`
  function parameter on disk.

Confirmed root cause for the AutomationHub failure:
R4 transformed and semantically validated the `automation` string in memory,
but omitted `automation_path.write_text(...)`. The pre-write semantic check
therefore passed while the actual file remained unchanged. Cleanup then
restored/removes all candidate files before commit/deploy.

Resolver design finding:
Known generic finance vocabulary (for example `CD`, `FREIGHT`, `TP FEES`,
`TCS`, and a strong payable/Outstanding total) should not depend on an LLM
round trip at all. R4 routed these through AI after the primary parser failed.
The B-3339 result showed that if that AI batch is not accepted as a complete
reconciled set, the old parser's bad values survive. The exact R4 AI-response
rejection subreason was not printed by that test, so it must not be guessed.

Also, R4 treated individually missing Rate/Case as an AI-worthy failure even
when the existing V5 receiving logic can derive price safely from Amount plus a
usable quantity/case basis. That created unnecessary AI work on a receive-valid
golden invoice.

Permanent prevention:
- every in-memory source transformation must be written to disk before any
  integration/static test and must be re-read from disk by that test;
- semantic postconditions must validate the persisted file, not only the
  temporary Python string;
- generic unambiguous direct OCR labels are resolved deterministically before
  AI; supplier-confirmed memory still has priority;
- deterministic/memory finance corrections are applied only when the complete
  accounting equation reaches MATCH;
- AI is reserved for genuinely novel/ambiguous labels or unresolved fields;
- optional/derivable line fields are not classified as failures merely because
  one redundant representation (such as Rate/Case) is absent;
- tests that depend on an AI response must expose `reason` when validation
  rejects a response instead of hiding the rejection behind downstream values;
- do not create a new product DEF for executor/test-design failures; keep
  DEF-0002 OPEN until the physical B-3339 certification succeeds.

Classification:
Executor/implementation-route defect. No commit, migration, Edge deployment,
QA deployment, or PROD operation occurred in this failed R4 run.

<!-- V5_R5_MANUAL_DATE_TRUSTED_PARTIAL_AND_STALE_OUTAGE_TEST_20260912 -->
### 2026-09-12 — R5 offline gate exposed manual-date misclassification, over-strict trusted partial application, and a stale outage test

Observed:
`V5_LEARNED_AI_OCR_EXCEPTION_RESOLVER_R5.sh` passed current-source preflight,
persisted the candidate source edits correctly, and reached the offline
regression gate. 24/27 tests passed. The remaining failures were:
- 16845 was incorrectly classified as having an AI-actionable
  `header:invoice_date` exception even though current V5 intentionally marks its
  invoice date for the existing human date-review/candidate-selection flow;
- a human-confirmed supplier mapping (`FRIEGHT -> freight`) was found from
  mapping memory but was not applied because trusted finance mappings were
  incorrectly gated on the entire invoice already reaching MATCH;
- the AI-provider-outage regression still used B-3339, but R5 had correctly
  moved B-3339's normal `CD/FREIGHT/TP FEES/TCS/Outstanding` vocabulary into the
  deterministic direct-evidence layer, so that invoice legitimately reached
  MATCH without needing the simulated failed AI call.

Cleanup restored the candidate tracked edits and removed generated candidate
files before commit/deploy. No Git push, DEV migration, Edge Function
deployment, QA deployment, paid AI smoke, or PROD operation occurred.

Classification:
Resolver policy/test-design defects found by the offline gate. Not an Azure OCR
failure, not an Azure AI provider failure, not a Supabase failure, and not a new
product DEF. DEF-0002 remains OPEN until physical B-3339 certification.

Permanent prevention:
- distinguish an existing explicit human-review workflow from an AI-actionable
  exception; `invoiceDateReviewRequired=true` remains on V5's manual date
  candidate/correction path and does not spend an AI call;
- human-confirmed supplier memory and unambiguous deterministic direct OCR
  evidence may fill their individual fields even if another finance field is
  unresolved; the global reconciliation must remain REVIEW and Receive Stock
  blocked until the complete accounting equation MATCHes;
- novel/unconfirmed AI finance mappings still require their stricter
  suggestion/manual-confirmation policy;
- provider-outage tests must force a genuinely AI-dependent novel/ambiguous
  label; do not use a golden invoice that a newer deterministic layer is
  intentionally able to resolve without AI;
- test the stage-specific safety invariant (no invented novel value, no false
  MATCH, manual review preserved), rather than requiring the output to remain
  byte-for-byte equal to an older parser result after a trusted deterministic
  stage has legitimately improved it.

<!-- V5_R7_UNTRACKED_SCOPE_AND_MAIN_MIGRATION_LEDGER_ASSUMPTION_20260912 -->
### 2026-09-12 — R7 compared all repo untracked files and would still have misread the canonical migration ledger

Observed:
`V5_R7_RESUME_AFTER_DEV_MIGRATION_HISTORY_DRIFT.sh` correctly identified DEV
remote-only migration-history versions and created candidate local no-op
history markers. It then failed before commit because its safety check compared
the entire repository's untracked-file inventory with only those new markers.

The repository already contained many intentionally untracked historical
operator/UAT scripts at the repository root. Those files predated R7 and were
not created by the release executor. Treating them as unexpected release
artifacts produced a false failure.

The same migration-list output also showed a second problem that R7 would have
hit next: the canonical V5 migration directory contains many historical
LOCAL-only migration versions (20260829..20260903 and 20260904162500) that the
current DEV ledger does not record under those exact versions because DEV was
reconstructed through later clone/sync history. Therefore merely adding
local files for the remote-only versions would NOT make the new OCR resolver
migration the only pending canonical migration.

Classification:
Release-executor scope/history-model defect. Not an OCR regression, not an AI
failure, not a Supabase schema-execution failure, and not a new product DEF.
No DEV database migration, Edge Function deployment, QA deployment, or PROD
operation occurred in R7.

Permanent prevention:
- never compare an executor's expected new files against the entire repository
  untracked-file set; scope the check to the exact directory/files the executor
  owns, or snapshot the baseline before creating files;
- never delete or stage unrelated user/operator untracked scripts;
- do not add fake/no-op history markers to the canonical repository merely to
  force a historically divergent environment through `db push`;
- do not run `migration repair --status reverted` or automatic `db pull` as a
  release workaround;
- for a bounded DEV release when canonical history and the DEV ledger are
  intentionally divergent, create a TEMPORARY Supabase workdir containing:
  (a) one no-op local marker for every version already present in the remote
  migration ledger, and (b) only the exact committed migration being deployed;
- use `supabase --workdir <temporary-project> migration list` to prove zero
  remote-only versions and exactly one local-only version before dry-run/push;
- delete the temporary workdir afterward; canonical Git migration history is
  not rewritten by this release workaround;
- handle long-term DEV migration-history normalization as a separate controlled
  maintenance task, not inside an OCR feature release.
