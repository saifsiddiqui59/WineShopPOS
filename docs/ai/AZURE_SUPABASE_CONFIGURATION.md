# WineShopPOS — Azure & Supabase Configuration

Non-secret configuration reference. Never store keys/passwords/tokens here.

## Azure

### Subscription / resource group

- Subscription: `Azure subscription 1`
- Resource group: `wineshopPOS`

### Frontend

- Storage account: `wineshoppos`
- Region: Central India
- Static website: `https://wineshoppos.z29.web.core.windows.net/`

### Document Intelligence

- Resource: `wineshoppos-docintel-45b7d2b9`
- Kind: FormRecognizer
- Region: Central India
- SKU: F0

### AI Function

- Name: `wineshoppos-ai-1a61d5885c`
- Region: Central India
- Plan: Consumption Y1
- System-assigned managed identity: enabled
- API: `/api/ai/chat`
- Health: `/api/ai/health`

### Microsoft Foundry

- Production account: `wineshoppos-ai-in-1a61d5885c`
- Region: South India
- Project: `wineshoppos-ai`
- Model: `gpt-5-mini`
- Model version: `2025-08-07`
- SKU: GlobalStandard
- Agent: `WineShopPOS-Owner-Agent`
- Function runtime RBAC: Foundry User at project scope

The old East US Foundry resource is legacy cleanup only.

## Supabase

- Project ref: `uiurgplnsgmawvxhjzzp`
- Project URL: `https://uiurgplnsgmawvxhjzzp.supabase.co`
- AI migration: `20260830070000_ai_owner_assistant_v1.sql`

### Tenant tables

- `organizations`
- `shops`
- `user_shop_memberships`
- `profiles`

### AI runtime model

```text
existing WineShopPOS browser session
        ↓
Supabase access token
        ↓
Azure Function validates caller
        ↓
authorized membership/shop scope
        ↓
Foundry tool request
        ↓
caller-scoped Supabase AI RPC
```

No fixed shop/admin account is part of the production architecture.
