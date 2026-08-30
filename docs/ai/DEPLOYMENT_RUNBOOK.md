# AI Owner Assistant V1 — Deployment Runbook

## One-command release

```bash
cd /e/WineShopPOS
bash inject_ai_owner_assistant_v1.sh
```

The injection script is also stored after deployment as:

`scripts/inject_ai_owner_assistant_v1.sh`

## Deployment sequence

1. protect Git baseline and create pre-AI tag
2. baseline build + lint
3. write additive Supabase AI migration
4. write Azure Function trust boundary + tests
5. add `Ask WineShopPOS` PRO UI
6. local build/lint/function tests
7. logical Git checkpoints (local only)
8. Supabase `db push --dry-run`
9. Supabase migration
10. create/reuse one Foundry resource/project/model deployment
11. create a new version of one logical Owner Agent
12. create/reuse one Azure Function App
13. assign managed identities + least-privilege Foundry roles
14. configure non-secret/public Supabase connection settings
15. deploy Function ZIP
16. set local Vite AI endpoint
17. final Vite build
18. Azure Blob frontend deploy
19. write non-secret deployment metadata
20. generate actual Git code-history
21. final docs commit
22. one final push of commits + pre-AI tag

## Cost

A new Foundry model deployment is usage-billed. The script asks for explicit confirmation before creating a model deployment. Existing matching model deployments are reused.

## Environment variables

Frontend `.env.local` (not committed):
- `VITE_AI_API_URL`
- `VITE_AI_OWNER_ENABLED=true`

Azure Function App settings:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `FOUNDRY_PROJECT_ENDPOINT`
- `FOUNDRY_AGENT_NAME`
- `FOUNDRY_MODEL_DEPLOYMENT`
- `BUSINESS_TIMEZONE=Asia/Kolkata`
- `BUSINESS_CURRENCY=INR`
- request/tool/token limit settings

Dynamic tenant values are **not** environment variables:
- shop ID
- organization ID
- user ID
- role

## Rollback

AI is an additive layer.

Fast application rollback:
1. disable/hide `/owner/ask` or set `VITE_AI_OWNER_ENABLED=false`
2. redeploy frontend
3. optionally stop Function App

Core POS continues independently.

Do not delete production migration history casually. Database rollback should be a reviewed forward migration.

## India-only cloud policy
- Azure resource group: `wineshopPOS`.
- Function App: Central India, Consumption (`Y1`) only.
- Foundry: Central India → South India → stop.
- No automatic non-India fallback.
- If the requested model is unavailable in allowed India regions, use the documented India fallback only when the installer discovers it as supported.
- See `docs/ai/AZURE_SUPABASE_CONFIGURATION.md`.
