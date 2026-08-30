# WineShopPOS AI Owner Assistant V1 — PRO

## Milestone

WineShopPOS now defines **Ask WineShopPOS** as a **PRO** capability inside **Owner Center**.

AI V1 is intentionally **read only**:

> Business engine calculates. AI explains.

Core POS, stock, purchasing, refunds, payments, roles and other transactions do not depend on AI availability.

## Architecture

```text
React Owner Center / Ask WineShopPOS
        |
        | Supabase access token
        v
Azure Function /api/ai/chat
        |
        | validate token with Supabase Auth
        | resolve ADMIN membership
        | authorize selected shop / same-org ALL scope
        v
ONE Microsoft Foundry Owner Agent
        |
        | approved function tools only
        v
Azure Function tool dispatcher
        |
        | caller-scoped Supabase JWT
        v
AI-safe deterministic Supabase RPCs
        |
        v
PostgreSQL
```

## Existing architecture reused

- `organizations`
- `shops.id` UUID tenant/shop identifier
- `shops.organization_id`
- `profiles.shop_id` retained for current-shop compatibility
- `user_shop_memberships` reused as scalable user → shop assignment
- existing product, sale, payment, purchase, inventory, movement, shift, expense, audit and intelligence data
- existing React Auth and Owner Center role gate
- existing Azure Blob static frontend hosting

No duplicate `user_shop_access` table is created.

## One model / one agent

AI V1 uses:

- one Foundry model deployment
- one logical `WineShopPOS-Owner-Agent`
- multiple controlled read-only business tools

There is no per-shop/per-customer LLM and no Sales/Inventory/Supplier sub-agent architecture.

## Initial tools

1. `get_sales_summary`
2. `get_profit_summary`
3. `get_inventory_health`
4. `get_reorder_recommendations`
5. `get_supplier_price_history`
6. `get_product_stock_history`
7. `get_shift_variances`
8. `get_audit_exceptions`
9. `get_expense_summary`

The model tool schemas contain no shop ID, organization ID, user ID, role, SQL or generic table argument.

## UI

Owner Center adds:

`Ask WineShopPOS   PRO`

Cashier and Manager routes do not expose the Owner AI page. Current WineShopPOS uses `ADMIN` as the owner-level application role; no unsupported `OWNER` database role is invented.

The AI page supports:
- suggested questions
- single-shop auto context
- ADMIN multi-shop selector
- optional `ALL` scope within the selected organization
- loading/retry/error states
- source-screen navigation
- ephemeral UI conversation history
- graceful offline/unavailable behavior

