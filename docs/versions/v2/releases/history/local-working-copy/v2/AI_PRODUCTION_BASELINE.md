# WineShopPOS V2 — Verified AI Production Baseline

## Verified

- AI Owner Assistant: working end-to-end in production
- Function: `wineshoppos-ai-1a61d5885c`
- Function region: Central India
- Function plan: Consumption Y1
- Foundry production resource: `wineshoppos-ai-in-1a61d5885c`
- Foundry region: South India
- project: `wineshoppos-ai`
- model: `gpt-5-mini`
- model version: `2025-08-07`
- SKU: GlobalStandard
- logical agent: `WineShopPOS-Owner-Agent`
- user runtime: current Supabase access token/session
- tenant mapping: `auth.uid()` → `user_shop_memberships`
- Function runtime identity: system-assigned managed identity
- Foundry RBAC: User access at production project scope
- production AI migration record: `20260830070000`

## Next milestone

1. tracing
2. evaluations
3. quality gates
4. monitoring/dashboard
