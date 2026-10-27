# WineShopPOS GitHub Source Safety Action

Workflow: `.github/workflows/wineshoppos-source-safety.yml`

Purpose: confirm that committed source, V5 continuity documents, Supabase migration history, lint, selected read-only tests and a production-compatible compile remain recoverable from Git.

## Automatic checks
- Runs on pull requests into `main` and pushes to `main`.
- Uses Node.js 22 and the committed npm lockfile.
- Runs `npm run docs:check`, `npm run lint`, two offline source-contract tests and `npm run build`.
- Selects the expected public Supabase project reference by Git branch, with a deliberately unusable key. This **does not** connect to, modify or deploy to Supabase.
- Uses only GitHub-hosted runner compute, with a 20-minute job timeout. No Azure deployment, Supabase mutation or paid API request is part of this workflow.

## Download a temporary source snapshot
After this workflow is merged into the default branch:
1. Open GitHub → WineShopPOS → **Actions** → **WineShopPOS Source Safety CI**.
2. Select **Run workflow** on `main`.
3. After the run succeeds, download the `wineshoppos-source-<commit>` artifact.
4. Check `SHA256SUMS.txt` against the compressed source archive.

The artifact retains only **tracked Git source files** and expires after **30 days**. Git commit history remains in the repository. This snapshot is not a permanent offsite backup.

## What this does NOT preserve
- ChatGPT project or chat history.
- Uncommitted files in `E:\\WineShopPOS`.
- Production Supabase rows, Storage objects, database roles, backups or live state.
- Azure configuration, keys, Function App runtime state, or deployment secrets.
- A verified production recovery; that requires separately validated backups and environment documentation.

For release authority follow `AGENTS.md` and `docs/DOCUMENTATION_REGISTER.md`. This workflow must not auto-deploy or auto-merge production changes.
