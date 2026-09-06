# Chapter 13 — Azure Blob Static Hosting

Status: LIVE

Azure:
- Subscription: Azure subscription 1
- Resource group: `wineshopPOS`
- Storage account: `wineshoppos`
- Region: Central India
- Performance: Standard
- Replication: LRS

Deployment:
- Vite production build outputs to `dist/`.
- `HashRouter` is used for static SPA routing.
- Build files are uploaded to Azure Storage `$web`.

Current website:
`https://wineshoppos.z29.web.core.windows.net/`

Deployment script:
`deploy_azure_blob.sh`
