# WineShopPOS — Azure & Supabase Configuration

This is the non-secret cloud configuration reference for WineShopPOS.

> Never store service-role keys, Azure access keys, DB passwords, bearer tokens, Function keys or Foundry secrets in Git.

## Azure

### Subscription
- `Azure subscription 1`

### Resource group
All WineShopPOS Azure resources remain under:
- `wineshopPOS`

### Existing static website
- Storage account: `wineshoppos`
- Region: `Central India`
- Purpose: Azure Blob Static Website
- Live URL: `https://wineshoppos.z29.web.core.windows.net/`

### Existing invoice OCR
- Service: Azure AI Document Intelligence
- Resource: `wineshoppos-docintel-45b7d2b9`
- Kind: `FormRecognizer`
- SKU: `F0`
- Region: `Central India`
- Credentials remain backend-only.

## AI Owner Assistant — PRO

### Region policy
AI infrastructure is India-only.

Foundry selection order:
1. `Central India`
2. `South India`
3. STOP

The deployment must never automatically fall back to US/Europe/another non-India region.

Model selection order:
1. requested model (`gpt-5-mini` by default)
2. `gpt-4.1-mini` fallback when available in an allowed India region

The installer prints the selected region/model before creating usage-billed model capacity.

### Azure Function App
- Resource group: `wineshopPOS`
- Region: `Central India`
- Plan: Azure Functions Consumption only
- Expected plan SKU: `Y1`
- Always On: not used
- Purpose: trust boundary for `/api/ai/chat`

The deployment script verifies the Function plan is `Y1` and stops if Azure returns a Premium/Dedicated plan.

### Foundry architecture
```text
One Foundry resource/project
        ↓
One model deployment
        ↓
One WineShopPOS Owner Agent
        ↓
Controlled read-only business tools
```

No per-shop LLM and no per-customer agent is used for tenant isolation.

## Supabase

### Project
- Project: `WineShopPOS`
- Ref: `uiurgplnsgmawvxhjzzp`
- URL: `https://uiurgplnsgmawvxhjzzp.supabase.co`

### Tenant model
- Organization table: `organizations`
- Organization UUID: `organizations.id`
- Shop table: `shops`
- Unique shop UUID: `shops.id`
- Organization relation: `shops.organization_id`
- User-to-shop access: `user_shop_memberships`

`profiles.shop_id` remains for current/default-shop compatibility; scalable authorization uses memberships.

### AI migration
- `20260830070000_ai_owner_assistant_v1.sql`
- Remote status: applied before this India-only cloud-resume patch.

### AI operational audit
- Table: `ai_activity_logs`
- Stores request metadata/status/latency/tool category.
- Prompt and response bodies are not stored by default.

### AI V1 authorization
```text
React
  ↓ Supabase JWT
Azure Function
  ↓ validate caller
user_shop_memberships
  ↓ authorized shops + organization
validated selected shop
  ↓
Foundry Owner Agent
  ↓
controlled Supabase AI RPC
```

The model does not decide tenant access.

### AI V1 credential model
Azure Function uses:
- `SUPABASE_URL`
- browser-safe publishable/anon key
- authenticated caller's Supabase access token

AI V1 does not require a Supabase service-role key for normal business-tool execution.

### AI read-only RPC/tool layer
- `ai_get_sales_summary`
- `ai_get_profit_summary`
- `ai_get_inventory_health`
- `ai_get_reorder_recommendations`
- `ai_get_supplier_price_history`
- `ai_get_product_stock_history`
- `ai_get_shift_variances`
- `ai_get_audit_exceptions`
- `ai_get_expense_summary`

No unrestricted SQL/table tool is provided to the model.

## Frontend AI settings
`.env.local` only, never committed:
```text
VITE_AI_API_URL=<Azure Function base URL>
VITE_AI_OWNER_ENABLED=true
```

Never configure static `SHOP_ID`, `ORGANIZATION_ID`, `USER_ID` or `ROLE`; they are authenticated runtime context.

## Secret ownership
| Item | Correct location |
|---|---|
| Supabase publishable key | browser-safe frontend / Function config |
| Supabase user token | Authorization header at runtime |
| Supabase service-role | backend secret only if separately required; not React/model |
| Document Intelligence key | Supabase Edge Function secret |
| Foundry credentials | Managed Identity + Azure RBAC |
| Function config | Function App settings |
| Shop/org/user IDs | trusted runtime context |

## Change-control rule
Update this document whenever Azure/Supabase architecture changes, together with the migration/runbook/test matrix/handoff documentation.
