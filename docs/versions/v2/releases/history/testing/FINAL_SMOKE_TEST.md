# Final WineShopPOS Smoke Test

1. Login as Shop ADMIN.
2. Dashboard loads Supabase data.
3. Products shows seeded products.
4. Search barcode `8900000010016`.
5. POS sells one bottle.
6. Inventory decreases by one.
7. Sale appears in Sales.
8. Receive a purchase.
9. Inventory increases.
10. Add a new product.
11. Refresh browser; product remains.
12. Create Manager/Cashier in Users.
13. Login as Cashier; restricted menus are hidden.
14. Disable shop using `shops.access_enabled=false`; app shows subscription blocked.
15. Re-enable shop.
16. `npm run build` passes.
17. Azure static URL opens from another device.

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
