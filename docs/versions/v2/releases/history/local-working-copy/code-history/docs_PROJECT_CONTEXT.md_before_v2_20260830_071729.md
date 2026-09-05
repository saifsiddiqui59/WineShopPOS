# WineShopPOS V2 — Current Project Context

Status: **Canonical current-state reference.**

> Chapters 1–26 are retained as implementation history only. They MUST NOT be
> used as the current architecture/status source without verification against
> current `main`, current migrations and the deployed production environment.

## Repository

- GitHub: `saifsiddiqui59/WineShopPOS`
- Local Git Bash path: `/e/WineShopPOS`
- Source-of-truth branch: `main`
- Production frontend: `https://wineshoppos.z29.web.core.windows.net/`

## Current application architecture

WineShopPOS is an existing React/Vite multi-shop POS application.

Production direction/current implementation includes:

- React + Vite frontend
- Supabase PostgreSQL
- Supabase Auth
- RLS
- transaction-safe RPC/backend operations for stock-changing business flows
- organizations, UUID shops and `user_shop_memberships`
- ADMIN / MANAGER / CASHIER authorization
- Azure Blob static hosting
- Azure AI Document Intelligence invoice OCR where configured
- existing production AI Owner Assistant

Core business functionality already extends far beyond the original MVP and
must be **verified/reused before any V2 feature is implemented**.

## Current verified AI production state

### AI status

`Ask WineShopPOS PRO AI Owner Assistant` is **VERIFIED WORKING end-to-end in production**.

### Azure Function

- Function App: `wineshoppos-ai-1a61d5885c`
- Region: `Central India`
- Hosting: Azure Functions Consumption `Y1`
- No Premium/Dedicated/Always-On AI hosting requirement

### Microsoft Foundry

- Production resource: `wineshoppos-ai-in-1a61d5885c`
- Region: `South India`
- Project: `wineshoppos-ai`
- Model deployment: `gpt-5-mini`
- Model version: `2025-08-07`
- SKU: `GlobalStandard`
- Logical agent: `WineShopPOS-Owner-Agent`

The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is
**not the production Foundry resource** and is cleanup-only after dependency review.

## AI authentication and tenant authorization

Runtime user authorization is dynamic:

```text
React
→ currently logged-in Supabase session/access token
→ Azure Function
→ validate Supabase user
→ auth.uid()
→ user_shop_memberships
→ authorized organization/shop
→ existing WineShopPOS Owner Agent
```

The browser does not decide tenant authorization.

Function → Foundry authentication uses the Function App's **system-assigned
managed identity**. The identity has the required Foundry **User** access at
the production project scope, and the runtime uses the configured agent reference.

## AI database state

Production record: Supabase AI migration `20260830070000` has been applied.

The V2 executor must still verify that the migration is also represented in
current repository history. If deployed state and `origin/main` differ, report
the drift and reconcile it deliberately.

## Next AI milestone

The next AI phase is production quality/observability, not a second chatbot:

1. Application Insights / Foundry tracing
2. request/tool/model latency and error correlation
3. automated AI evaluations
4. numeric/tool/tenant correctness checks
5. deployment quality gates
6. production monitoring/dashboarding

## V2 engineering rule

```text
FETCH
→ DISCOVER
→ CLASSIFY
→ PROTECT
→ ARCHITECT
→ IMPLEMENT
→ TEST
→ FULL APP AUDIT
→ SECURITY REVIEW
→ DOCUMENT
```

Never rebuild a feature merely because it appears in a V2 requirement.
