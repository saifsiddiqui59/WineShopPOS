# Production Runbook — Master Reconsolidation

## One-command release

Run `bash apply_master_reconsolidation.sh` from the extracted release folder.

## Safety gates

1. Detect actual Git repo root.
2. Confirm/preserve existing tracked work.
3. Fast-forward pull.
4. Baseline build and lint evidence.
5. Create local checkpoint tag.
6. Overlay source files and install `jsbarcode`.
7. Production build.
8. Supabase migration dry-run.
9. Apply migration.
10. Deploy updated `manage-shop-users` Edge Function.
11. Production build again.
12. Deploy `dist/` to Azure Blob `$web`.
13. Confirm static website responds.
14. Create release Git commit.
15. Generate actual Git patch/source code-history from that commit.
16. Add deployment report and handoff docs.
17. Documentation commit.
18. One push of branch + checkpoint tag.

## Rollback

The checkpoint tag identifies the pre-release frontend/database code state. Git rollback alone does not remove an already-applied additive database migration. Database rollback must use a reviewed forward-fix/reversal migration; do not delete transaction history.

If frontend deployment is bad but DB migration is healthy:
- checkout the checkpoint tag into a temporary worktree,
- build it,
- upload its `dist/` to `$web`,
- then diagnose the frontend release.

## Secrets

- Supabase service-role stays only in Supabase server-side environment.
- Frontend contains only publishable/anon key via gitignored `.env.local`.
- Azure Document Intelligence key remains in Supabase Edge Function secrets.
