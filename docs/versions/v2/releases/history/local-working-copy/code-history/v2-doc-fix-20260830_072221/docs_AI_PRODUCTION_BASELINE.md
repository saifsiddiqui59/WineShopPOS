# WineShopPOS — Verified AI Production Baseline

**Current product/documentation generation: V2**

## Current verified status

```text
AI Owner Assistant:
VERIFIED WORKING end-to-end in production
```

## Function

```text
Name:
wineshoppos-ai-1a61d5885c

Region:
Central India

Plan:
Consumption Y1
```

No Premium/Dedicated/Always-On AI hosting is the current production requirement.

## Microsoft Foundry

```text
Production resource:
wineshoppos-ai-in-1a61d5885c

Region:
South India

Project:
wineshoppos-ai

Model:
gpt-5-mini

Version:
2025-08-07

SKU:
GlobalStandard

Logical agent:
WineShopPOS-Owner-Agent
```

## Runtime authentication/authorization

User side:

```text
logged-in Supabase session/access token
↓
Azure Function
↓
auth.uid()
↓
user_shop_memberships
↓
authorized organization/shop
```

Azure side:

```text
Azure Function
↓
system-assigned managed identity
↓
Foundry project RBAC/User access
↓
existing Owner Agent
```

## Production AI migration record

```text
20260830070000
```

Production record indicates this migration has been applied.

## Legacy resource

The East US Foundry resource named:

```text
wineshoppos-ai-1a61d5885c
```

is not the production Foundry environment.

Treat it as cleanup-only after dependency review.

## Next milestone

```text
Application Insights / Foundry tracing
AI evaluations
quality gates
monitoring/dashboard
```

Evaluation should cover:

- groundedness
- relevance
- numeric correctness
- tool correctness
- tenant correctness
- shop correctness
- usefulness

Critical failures include:

- cross-tenant data exposure
- wrong numeric business result
- critical tool regression

The current Owner Agent should be hardened rather than replaced.
