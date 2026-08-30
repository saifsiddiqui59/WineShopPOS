# WineShopPOS — Current Project Context

**Current product/documentation generation: V2**

This is the canonical current-state reference.

Old Chapters 1–26 remain implementation history and must not be used as the
current architecture/pending-work source without verification against current
source, migrations and deployment state.

## Current application

WineShopPOS is an existing React/Vite production POS application.

Current architecture/direction includes:

- React + Vite
- Supabase PostgreSQL
- Supabase Auth
- RLS
- RPC/backend transaction operations
- organizations
- UUID shops
- `user_shop_memberships`
- ADMIN / MANAGER / CASHIER authorization
- Azure Blob static hosting
- Azure Document Intelligence OCR where configured
- production AI Owner Assistant

## Existing functional areas

The application has progressed substantially beyond the early MVP.

Existing/developed areas include:

- Core POS
- barcode scanner
- cart/billing
- payments
- inventory
- purchasing
- purchase orders
- receiving / GRN
- suppliers
- sales
- sale items
- payments
- returns/refunds
- sale void
- cashier shifts
- physical stock counts
- stock adjustments
- stock transfers
- stock movement/ledger
- reports
- Owner Center
- supplier intelligence
- reorder intelligence
- Purchase Coach
- Leakage Shield / exception intelligence
- OCR invoice workflow
- offline foundation
- backup foundation
- receipt printing
- owner WhatsApp summary
- multi-shop access/security
- AI Owner Assistant
- AI business explanation/investigation/daily-summary direction

A V2 feature must be checked against the current implementation before it is
treated as new development.

## Core business rules

```text
Product Master defines the product.

Inventory changes through controlled business transactions.

Purchases/receiving increase stock.

Sales reduce stock.

Returns/voids/adjustments follow their controlled transaction rules.

Historical business records are preserved.

Stock-changing operations should be transaction-safe server/database operations.

Backend authorization and RLS are authoritative.

The browser never decides tenant authorization.
```

## Current verified production AI

Status:

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

No Premium/Dedicated/Always-On AI hosting is the current production requirement.

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

Version:
2025-08-07

SKU:
GlobalStandard

Logical agent:
WineShopPOS-Owner-Agent
```

Runtime user authorization:

```text
currently logged-in Supabase session/access token
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

Function → Foundry authentication uses the Function App system-assigned managed
identity with required Foundry project-level User access.

Production record indicates Supabase AI migration:

```text
20260830070000
```

has been applied.

The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is not
the production Foundry environment and is cleanup-only after dependency review.

## Next AI milestone

The next AI milestone is not rebuilding the assistant.

It is:

- Application Insights / Foundry tracing
- request correlation
- AI evaluations
- groundedness/relevance
- numeric correctness
- tool correctness
- tenant/shop correctness
- deployment quality gates
- production monitoring/dashboarding

AI failure must never break core POS availability.

## V2 feature program

V2 requests include:

1. Landed Cost Engine
2. Batch / Receipt Lot Tracking
3. True Stock Ageing
4. FIFO / Stock Rotation Foundation
5. Discount / Price Override Control
6. Standardized Reason Codes
7. Accountant / Tally-ready Export
8. Customer Loyalty
9. Coupons / Promotions
10. Gift Voucher / Store Credit
11. Supplier Performance Score
12. Advanced Stock Transfer
13. Approval Center Expansion
14. Leakage Shield Expansion
15. Purchase Coach Expansion

Each item must first be classified from current code as:

```text
EXISTING
PARTIAL
MISSING
NEEDS TESTING
BROKEN
```

V2 does not rebuild a working feature simply because it appears in the program.
