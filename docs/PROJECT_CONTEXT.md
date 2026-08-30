# WineShopPOS Current Project Context

## Repository

GitHub:

`saifsiddiqui59/WineShopPOS`

Local Windows folder:

`E:\WineShopPOS`

Git Bash:

`/e/WineShopPOS`

Branch:

`main`

## Technology

- React
- Vite
- JavaScript
- React Router
- Lucide React
- CSS
- Browser LocalStorage for current MVP

## LocalStorage keys

- `wineshop_products_v1`
- `wineshop_inventory_v1`
- `wineshop_sales_v1`
- `wineshop_purchases_v1`

## Product seed

`src/data/products.js`

contains approximately 50 dummy Indian-market products.

Barcodes/prices are development data only.

## Current completed modules

- Dashboard
- POS Billing
- barcode scanning
- manual product search
- cart
- discount
- Cash / UPI / Card
- optional UPI/Card payment reference
- sale completion
- invoice details
- browser print preview
- Product Master
- Add Product
- Edit Product
- activate / deactivate Product
- Inventory
- Receive Stock
- case + loose-bottle purchase handling
- Purchase History
- Sales History
- Reports
- JSON Export
- JSON Import
- Demo Reset

## Important inventory rules

Product Master = what the item is.

Inventory = how many sellable bottles exist.

Purchases increase inventory.

Sales decrease inventory.

Cases are converted to individual bottle quantities.

Editing product information does not directly overwrite stock.

Inactive products remain historically referenced and cannot be sold/received.

## Current persistence limitation

This is still a single-browser prototype.

LocalStorage is not suitable for a final multi-user shop.

## Planned production backend

Later chapters will introduce:

- Supabase PostgreSQL
- database tables
- transactional stock functions
- Supabase Auth
- ADMIN / MANAGER / CASHIER roles
- RLS
- secure inventory mutations
- audit / stock movements

## Hosting plan

Frontend can be statically hosted on Azure.

Production architecture may later use Azure Static Web Apps or another frontend host depending on authentication/routing needs.

## Scanner test barcode

`8900000010016`

Dummy product:

Kingfisher Strong 650ml

## AI Owner Assistant V1 — PRO

WineShopPOS added a read-only, multi-tenant AI Owner Assistant milestone. It uses one Microsoft Foundry model deployment, one logical WineShopPOS Owner Agent, an Azure Function trust boundary, caller-scoped Supabase authorization and narrow deterministic analytics RPCs. AI is ADMIN/Owner Center only and cannot write business transactions. Tenant/shop access is resolved programmatically from `user_shop_memberships`; the model never decides tenant access.

See `docs/ai/` and `docs/testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md`.

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
