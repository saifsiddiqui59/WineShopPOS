# V5 QA / DEV Preview Deployment

Status: executor-managed dedicated V5 preview

Branch: `V5`
Starting source SHA: `2a089219492aa9105a1733fcd0e622672b5304f5`
Supabase: `WineshopPOS_DEV` / `juhcypzoacauzmtzqnwd`
Invoice API: `https://wsp-v5-invoice-dev-53b6e9a1.azurewebsites.net`

The preview uses a dedicated Azure Static Website storage account selected/created by the executor. It never deploys to the production `wineshoppos` storage account and never reuses the V3/V4 preview as V5.

Preview build environment includes:

- `VITE_SUPABASE_URL=https://juhcypzoacauzmtzqnwd.supabase.co`
- `SUPABASE_PROJECT_ID=juhcypzoacauzmtzqnwd`
- `VITE_INVOICE_API_URL=https://wsp-v5-invoice-dev-53b6e9a1.azurewebsites.net`
- `VITE_PREVIEW_MODE=1`
- `VITE_ENV_BADGE=QA / DEV · V5 · NOT PROD`

The exact public preview endpoint is printed and transport-verified by the executor.

Visual badge status remains MANUAL_VISUAL_UAT until a user opens the deployed preview and confirms it.
