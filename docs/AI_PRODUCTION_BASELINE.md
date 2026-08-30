# WineShopPOS — Verified AI Production Baseline

**Current product/documentation generation: V2**

## AI status

`Ask WineShopPOS PRO AI Owner Assistant` is:

```text
VERIFIED WORKING end-to-end in production
```

## Azure Function

- Name: `wineshoppos-ai-1a61d5885c`
- Region: Central India
- Plan: Consumption Y1

## Microsoft Foundry

- Production resource: `wineshoppos-ai-in-1a61d5885c`
- Region: South India
- Project: `wineshoppos-ai`
- Model: `gpt-5-mini`
- Model version: `2025-08-07`
- SKU: GlobalStandard
- Logical agent: `WineShopPOS-Owner-Agent`

## Authorization

```text
logged-in Supabase session/access token
→ Azure Function
→ auth.uid()
→ user_shop_memberships
→ authorized organization/shop
```

Function → Foundry:

```text
system-assigned Function managed identity
→ Foundry project RBAC/User access
→ existing Owner Agent
```

## Production database record

AI migration:

```text
20260830070000
```

is recorded as applied in production.

## Legacy environment

The East US Foundry resource named `wineshoppos-ai-1a61d5885c` is not the
production Foundry environment.

## Next AI milestone

- Application Insights / Foundry tracing
- AI evaluations
- quality gates
- monitoring/dashboarding
- Explanation verification
- Investigation verification
- Daily Summary verification

Critical quality failures include cross-tenant access, wrong business numeric
results and critical tool regressions.
