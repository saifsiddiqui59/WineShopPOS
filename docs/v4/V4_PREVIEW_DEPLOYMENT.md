# V4 Preview Deployment

Status: DEPLOYED

Branch: `V4`
Azure subscription: `Azure subscription 1`
Resource group: `wineshopPOS`
Storage account: `wspv4d66ca1d443`
Supabase environment: DEV `juhcypzoacauzmtzqnwd`
Preview URL: `https://wspv4d66ca1d443.z29.web.core.windows.net/`

## Isolation

- V3 is not edited or deployed by this executor.
- Production storage account `wineshoppos` is not used.
- V4 preview uses its own Azure Static Website storage account.
- V4 remains bound to DEV Supabase.
- The storage account key is used only during deployment and is not written to Git.
