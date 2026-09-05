# WineShopPOS — Current Project Context

**Current product/documentation generation: V2**

This document is the canonical current-state project context.

The old Chapters 1–26 remain useful as implementation history, but they must
not be treated as the current implementation state.

## Application

WineShopPOS is an existing React/Vite Wine Shop POS application.

Current production architecture/direction includes:

- React + Vite
- Supabase PostgreSQL
- Supabase Auth
- RLS
- RPC/backend transaction operations
- multi-shop organizations
- UUID shops
- `user_shop_memberships`
- ADMIN / MANAGER / CASHIER authorization
- Azure Blob static hosting
- production AI Owner Assistant

## Existing application capability

The current application has progressed substantially beyond the early MVP.

Existing/current areas include or have been developed around:

- Core POS
- barcode scanner workflow
- cart and billing
- payments
- receipt printing
- inventory
- stock movements
- purchasing
- purchase orders
- GRN / receiving
- suppliers
- returns/refunds
- sale void
- cashier shifts
- physical stock counts
- stock adjustments
- transfers
- reports
- Owner Center
- reorder intelligence
- supplier intelligence
- Purchase Coach
- Leakage Shield / exception intelligence
- OCR invoice workflow
- offline foundation
- backup foundation
- multi-shop access
- owner WhatsApp summary
- AI Owner Assistant
- AI business explanation
- AI investigation
- AI daily-summary direction

Any requested V2 feature must first be checked against current implementation
before new functionality is added.

## Critical business rules

```text
Product Master defines product

Purchases/receiving increase stock

Sales reduce stock

Returns/void/adjustment follow controlled transaction rules

Historic business records should be preserved

Stock-changing operations should be transaction-safe backend/database operations

Backend authorization > frontend hiding

Organization/shop isolation is mandatory
```

## Current verified AI production state

AI status:

```text
Ask WineShopPOS PRO AI Owner Assistant
VERIFIED WORKING end-to-end in production
```

Azure Function:

```text
Name:
wineshoppos-ai-1a61d5885c

Region:
Central India

Plan:
Consumption Y1
```

Microsoft Foundry:

```text
Production resource:
wineshoppos-ai-in-1a61d5885c

Region:
South India

Project:
wineshoppos-ai

Model:
gpt-5-mini

Model version:
2025-08-07

SKU:
GlobalStandard

Logical Agent:
WineShopPOS-Owner-Agent
```

Runtime user authorization:

```text
React
↓
current logged-in Supabase session/access token
↓
Azure Function
↓
auth.uid()
↓
user_shop_memberships
↓
authorized organization/shop
↓
existing Owner Agent
```

Function → Foundry authentication uses the Function App's system-assigned
managed identity with the required Foundry project-level User access.

The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is not
the production Foundry environment and should only be treated as cleanup after
dependency verification.

Production record indicates Supabase AI migration:

```text
20260830070000
```

has been applied.

## Next AI milestone

The next AI milestone is production quality and observability:

- Application Insights / Foundry tracing
- request correlation
- tool latency/error visibility
- automated evaluations
- groundedness/relevance
- numeric correctness
- tool correctness
- tenant/shop correctness
- deployment quality gates
- monitoring/dashboarding

The existing Owner Assistant should be hardened, not rebuilt.
