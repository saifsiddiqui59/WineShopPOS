# AI Owner Assistant V1 — Deployment Runbook

## Verified production topology

- RG: `wineshopPOS`
- Supabase project ref: `uiurgplnsgmawvxhjzzp`
- Function: `wineshoppos-ai-1a61d5885c`
- Function region: Central India
- Function plan: Consumption Y1
- Foundry account: `wineshoppos-ai-in-1a61d5885c`
- Foundry project: `wineshoppos-ai`
- Foundry region: South India
- Model: `gpt-5-mini`
- Agent: `WineShopPOS-Owner-Agent`

## Required deployment rules

1. Reuse the existing `wineshopPOS` resource group.
2. Function App must remain Central India / Consumption Y1.
3. New production Foundry deployment must remain in approved India region(s).
4. Do not silently fall back to US/Europe.
5. Do not create a second production Function App if the existing one is healthy.
6. Supabase migrations must be additive and dry-run before push.
7. Never use service-role keys in React or the model.
8. Use current Foundry `agent_reference` invocation.
9. Function managed identity must have the project-scope permission required by the runtime.

## Current Foundry RBAC requirement

Because the Function uses `AIProjectClient` project-level Conversations/Responses APIs, grant the Function system-assigned managed identity **Foundry User** on the WineShopPOS Foundry **project** scope.

Agent Consumer alone is not sufficient for this runtime design.

## Verification

After deployment verify:

- `/api/ai/health` → HTTP 200
- unauthenticated `/api/ai/chat` → HTTP 401
- valid ADMIN → authenticated shop membership
- real AI question → HTTP 200
- tool calls recorded
- answer grounded in tool output
- tenant-isolation tests pass
- Function remains Consumption Y1

## Legacy East US resource

The earlier East US Foundry account is not production. Remove it only after final dependency review.
