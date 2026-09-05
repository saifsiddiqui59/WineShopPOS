# WineShopPOS Environment Isolation

## Hard binding

- `main` -> PROD Supabase only: `uiurgplnsgmawvxhjzzp`
- every non-main branch -> DEV Supabase only: `juhcypzoacauzmtzqnwd`

## Enforcement

1. `npm run dev`, `npm run build`, and `npm run preview` run the environment guard first.
2. Vite independently validates the Git branch against the configured Supabase URL/project ref, so direct Vite startup/build is also blocked on mismatch.
3. The compiled client receives the expected project ref and refuses to create a Supabase client if the runtime URL points at the other environment.
4. GitHub Actions checks active app/config paths and legacy shell executors on every push and pull request.
5. `.env.local` remains uncommitted. DEV and PROD credentials remain separate.
6. Supabase CLI link state (`supabase/.temp/project-ref`) is forced to the correct project for each worktree when present.

## Operational rule

Historical production executors may retain the PROD project ref only with `WSP_ENV_ISOLATION_GUARD_V1`; this guard exits immediately on every non-main branch before the original script body runs.

## Promotion

Develop/test against DEV. Promote only after verification, then execute production deployment/migrations from `main` with PROD-specific credentials.
