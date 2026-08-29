# Production Runbook — Chapters 16–26

## Deploy order
1. Backup source/Git checkpoint.
2. Production React build.
3. Supabase migration dry-run.
4. Push migration.
5. Create/reuse Azure Document Intelligence **F0 only** and set its secrets in Supabase.
6. Deploy `ocr-invoice` Edge Function.
7. Production build again.
8. Commit code/docs.
9. Generate actual Git release code-history from the release commit.
10. Commit code-history.
11. One network `git push`.
12. Upload `dist/` to Azure `$web`.

## OCR activation
The final installer performs this automatically and is intentionally cost-safe:

1. Selects `Azure subscription 1`.
2. Uses resource group `wineshopPOS`.
3. Discovers whether `FormRecognizer` and SKU `F0` are available in `centralindia`.
4. Reuses an existing F0 Document Intelligence account if one already exists in the subscription; otherwise creates a new F0 account.
5. **Stops instead of creating S0** if F0 cannot be created.
6. Retrieves the endpoint/key locally.
7. Places them in Supabase Edge Function secrets, never browser configuration.
8. Deletes the temporary local secrets file.
9. Deploys `ocr-invoice`.

The Azure secret must never be placed in `.env.local`, React source, Markdown, Word files or Git.

## Create a second branch
Create the new shop through platform operations, then assign both shops the same `organization_id`. Do **not** simply reuse an organization across unrelated customers.

## Rollback strategy
- Frontend: redeploy the previous Git commit's `dist`.
- Database: migrations are additive; do not manually drop tables in production. Fix forward with a new migration.
- Offline conflicts: never delete a conflict until a manager has compared the offline receipt and cloud stock.

## Daily operational checks
- pending return requests
- CLOSE_REQUESTED shifts
- submitted stock counts
- offline conflicts
- supplier balances
- low-stock reorder suggestions
- audit exceptions
