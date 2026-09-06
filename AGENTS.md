# WineShopPOS Agent Start Contract

Status: **MANDATORY FIRST READ FOR ALL FUTURE REPO-AWARE CHATS / CODING AGENTS**

WineShopPOS is an existing production application.

Before current-state analysis, code changes, migrations, release executors,
DEV/PROD changes, or new-version planning, read in this order:

1. `docs/CURRENT_VERSION`
2. `docs/DOCUMENTATION_REGISTER.md`
3. `docs/shared/governance/NEW_VERSION_BOOTSTRAP_AND_CONTINUITY_STANDARD.md`
4. `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md`
5. `docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md`
6. latest prior-version `*_TO_PROD_RELEASE_RETROSPECTIVE_*.md`
7. current Git source and migrations
8. verified live DEV/PROD state for affected systems

Truth order:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS > CONVERSATION MEMORY`

Permanent rules:

- `main` -> PROD only.
- every non-main development/version branch -> DEV only.
- never copy DEV business data into PROD.
- never blindly copy PROD credentials/runtime state into development.
- never blind-merge a version into `main`.
- never blind-push all DB migrations into PROD.
- use explicit migration allowlists reconciled against live PROD.
- match backup/rollback strength to actual migration risk.
- deploy a service only when a verified delta exists.
- build the exact promoted source with PROD environment values.
- PROD artifacts must exclude DEV refs.
- capture frontend rollback before overwrite.
- verify exact local/remote deployed artifact identity.
- HTTP 200 is not authenticated E2E proof.
- no new paid resource/service without explicit cost disclosure and approval.

Never automatically run:

- `git reset --hard`
- `git clean`
- `git clean -fd`
- `git stash`
- `git checkout .`
- `git restore .`
- `git pull --rebase`
- `git add .`
- `git add -A`

Before PROD-promotion preparation, the active development version must have:

```bash
git ls-files --others --exclude-standard
git status --porcelain --untracked-files=no
```

Both returning no output.

Selective promotion must classify:

`tracked modified/deleted paths UNION new non-ignored untracked additions`

A continuation must detect already-successful stages and resume from the next
incomplete stage. Never replay successful DB, service, Git, or frontend stages.

Every new version inherits current PROD structure, security, testing,
documentation governance, migration discipline, environment isolation and
release workflow, while keeping its own version-specific code, migrations,
DEV config, QA/UAT evidence and docs.

Every completed version must publish a whole-version retrospective. The next
version must read it before implementation planning.
