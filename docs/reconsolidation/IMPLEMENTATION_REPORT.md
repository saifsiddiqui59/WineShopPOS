# Master Reconsolidation Implementation Report

## Completed

- Reorganized the application into eight primary modules instead of a flat feature sidebar.
- Added subtle reusable PLUS/PRO tier metadata and badges without subscription enforcement.
- Added top-bar shop context, offline state and GitHub/Databricks-style account menu behavior.
- Added profile/account/security/about experience without self-role editing.
- Preserved legacy URLs through redirects/direct invoice routes.
- Added expense management and operating-profit input.
- Added customer master and management-controlled credit/Udhaar ledger.
- Added optional customer attachment to online POS sales.
- Added CODE128 product label generation/printing.
- Extended PO workflow to approval before receiving.
- Extended transfers to request → approve → dispatch → transit → receive → complete.
- Added purchase/supplier intelligence, inventory health/stock explanation, Owner Center, profit intelligence, neutral loss/exception rules, recommendations and manual WhatsApp share.
- Added accountant-friendly CSV exports.
- Added compliance metadata foundation without invented excise rules.
- Added backup/recovery strategy UI and restore-drill evidence log.
- Updated user creation Edge Function for multi-shop membership records.

## Reused

- Supabase products/inventory/sales/purchases/payments tables.
- Stock movements and stock adjustments.
- Transaction-safe sale/purchase/return/count/offline operations.
- Authentication, roles, RLS and subscription kill switch.
- Existing scanner engine and scanner diagnostics.
- Existing return, shift, physical count and OCR engines.
- Existing Azure Blob hosting and Azure Document Intelligence F0 OCR service.

## New Database Migration

`supabase/migrations/20260829233000_master_reconsolidation.sql`

The migration is additive or carefully replaces function/constraints. It intentionally avoids duplicate business tables such as `inventory_v2` or `sales_new`.

## Product Tier Policy

PLUS/PRO is visual/classification metadata only. No feature payment gating, subscription RLS changes or payment provider integration was added.

## Remaining Risk / Explicit Boundaries

- Real barcode/receipt/label printer hardware must still be validated at the shop.
- A real offline disconnect/reconnect test must be performed on the production browser/device.
- A real F0 OCR supplier invoice should be tested; OCR must continue to require human confirmation.
- A database restore drill must be performed in a separate environment before backup readiness is considered proven.
- Liquor compliance remains a foundation until verified state-specific requirements are supplied.
- Customer loyalty is intentionally deferred.
- AI Owner Assistant and Voice AI remain hidden/deferred.

## Deployment Ordering

The release script deploys the application/database first. It then creates the actual Git code-history and documentation commits and performs one final Git push.


## Owner Center security

Owner Center is ADMIN-only. Managers retain operational reports and management workflows, but Owner Center, profit intelligence, loss/exception intelligence, recommendations and owner WhatsApp summary are restricted in both React routing/navigation and Supabase RPC authorization. A separate shared Owner Center password is intentionally not used; user identity and role remain the authoritative security boundary.

## Modern UI / Access / Settings Revision

Added after the initial master reconsolidation package review:

- Power BI-inspired reusable line, donut, horizontal-bar and column charts.
- Dashboard charts wired to trusted existing sales/inventory/purchase/profit data.
- Modern SaaS visual tokens for sidebar, top bar, cards, tables, forms and responsive layouts.
- Working System/Light/Dark theme resolution, immediate preview and top-bar theme switch.
- Editable ADMIN-only Shop Settings backed by controlled audited RPCs.
- ADMIN-only Access Control matrix documenting Cashier/Manager/Admin boundaries.
- Shop Admin can change non-admin staff roles between CASHIER and MANAGER through `manage-shop-users`; ADMIN remains platform-controlled.
- Help/About infrastructure architecture line removed; faith/creator lines added exactly as requested.

No PRO/PLUS subscription enforcement was introduced. No stock-changing operation was moved out of transactional RPC control.

<!-- WSP_AI_VERIFIED_V1_START -->
## AI Owner Assistant V1 — VERIFIED PRODUCTION MILESTONE

**Verified:** 2026-08-30  
**Status:** Production path working end-to-end  
**Feature:** Ask WineShopPOS  
**Tier:** PRO  
**Current access:** ADMIN / Owner Center

### Verified production topology

```text
WineShopPOS React/Vite
        ↓ existing Supabase user session
Supabase Auth access token
        ↓
Azure Function /api/ai/chat
Central India — Consumption Y1
        ↓ system-assigned managed identity
Microsoft Foundry project
South India
        ↓
WineShopPOS-Owner-Agent
gpt-5-mini
        ↓ controlled function calls
Caller-scoped Supabase AI RPCs
        ↓
Grounded business answer
```

### Current Azure configuration

- Resource group: `wineshopPOS`
- Static website storage: `wineshoppos` — Central India
- Document Intelligence: `wineshoppos-docintel-45b7d2b9` — Central India — F0
- AI Function App: `wineshoppos-ai-1a61d5885c`
- AI Function region: Central India
- AI Function plan: Consumption `Y1`
- Always On/Premium/Dedicated hosting: not used for AI V1
- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
- Foundry region: South India
- Foundry project: `wineshoppos-ai`
- Model deployment: `gpt-5-mini`
- Model version verified during deployment: `2025-08-07`
- Model SKU: `GlobalStandard`
- Logical agent: `WineShopPOS-Owner-Agent`
- Foundry invocation: current `agent_reference` request shape

### Runtime identity / RBAC

The Azure Function uses its **system-assigned managed identity** for Foundry access.

The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.

This role is scoped to the WineShopPOS Foundry project, not the whole subscription.

### Supabase / tenant authorization

- Supabase project ref: `uiurgplnsgmawvxhjzzp`
- AI migration: `20260830070000_ai_owner_assistant_v1.sql` — applied
- Organization boundary: `organizations.id`
- Shop boundary: `shops.id`
- User/shop authorization: `user_shop_memberships`
- Production UI does **not** use a fixed ADMIN email, shop ID, organization ID or role.
- React sends the currently logged-in Supabase user's access token.
- Azure Function validates the caller and dynamically resolves authorized shop scope.
- Tenant/shop isolation is enforced programmatically, not by prompting the model.

### Verified business tools

1. `ai_get_sales_summary`
2. `ai_get_profit_summary`
3. `ai_get_inventory_health`
4. `ai_get_reorder_recommendations`
5. `ai_get_supplier_price_history`
6. `ai_get_product_stock_history`
7. `ai_get_shift_variances`
8. `ai_get_audit_exceptions`
9. `ai_get_expense_summary`

There is no unrestricted SQL/database-query tool and no MCP/RAG/vector database in AI V1.

### Verification evidence

The following were verified successfully:

- Supabase ADMIN authentication
- dynamic ADMIN shop membership resolution
- `ai_resolve_context`
- `ai_rate_limit_check`
- `ai_log_activity`
- all nine business RPCs
- direct Foundry `agent_reference` invocation
- Foundry function-call loop
- multiple business tool calls in one question
- function-call outputs returned to Foundry
- final grounded AI answer
- Azure Function hosted in Central India on Consumption Y1
- Function managed identity access to the South India Foundry project
- production `/api/ai/chat` path after the Foundry project RBAC correction

A verified test for **“How is my shop performing today?”** used multiple tools and returned the correct current business facts for the test shop.

### Legacy cloud cleanup

The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.

### Observability/evaluation status

- Application Insights exists for the AI Function App.
- Function health and failure telemetry are available.
- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
- Do not claim continuous Foundry evaluation is already enabled until that work is completed.

<!-- WSP_AI_VERIFIED_V1_END -->
