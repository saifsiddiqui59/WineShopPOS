# Ask WineShopPOS — AI Owner Assistant V1

## Status

**PRODUCTION PATH VERIFIED — 2026-08-30**

Ask WineShopPOS is a PRO Owner Center feature that turns authenticated WineShopPOS business data into grounded natural-language insights.

## User experience

ADMIN opens:

`Owner Center → Ask WineShopPOS`

Examples:

- How is my shop performing today?
- What should I reorder?
- Which products are at risk of stockout?
- Why has profit changed?
- Which supplier prices increased?
- Are there shift variances I should review?
- What expenses affected today?
- Are there operational exceptions requiring attention?

## V1 scope

V1 is an insight/explanation capability. Business-changing actions remain in the existing WineShopPOS workflows.

The agent can use only approved deterministic business tools. It cannot run arbitrary SQL or freely browse database tables.

## Architecture

```text
React
  ↓ authenticated Supabase access token
Azure Function /api/ai/chat
  ↓ caller validation + shop scope
Microsoft Foundry
  ↓ WineShopPOS-Owner-Agent
Controlled function calls
  ↓
Caller-scoped Supabase RPCs
  ↓
Grounded answer + source paths
```

## Runtime

- Azure Function: Central India, Consumption Y1
- Foundry: South India
- Model: `gpt-5-mini`
- Agent: `WineShopPOS-Owner-Agent`
- Foundry request shape: `agent_reference`
- Function identity: system-assigned managed identity
- Foundry RBAC for current project-level runtime: Foundry User at project scope

## Business tools

- sales summary
- profit summary
- inventory health
- reorder recommendations
- supplier price history
- product stock history
- shift variances
- audit exceptions
- expense summary

## Tenant model

The model does not select tenant identity.

The Function validates the Supabase access token and resolves `auth.uid()` → membership → organization → authorized shop(s). The selected shop must be in that authorized set.

## Verified result

The complete production flow is working, including authentication, authorization, Foundry function calling, Supabase tool execution and the final response.
