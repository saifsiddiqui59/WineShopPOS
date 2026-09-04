# WineShopPOS AI V1 — Current Infrastructure Status

**Status: VERIFIED WORKING**

## Complete

- AI Supabase migration applied
- South India Foundry production resource
- Foundry project
- `gpt-5-mini` deployment
- `WineShopPOS-Owner-Agent`
- Central India Consumption Function App
- system-assigned Function managed identity
- Foundry project RBAC corrected
- current `agent_reference` runtime
- all nine Supabase AI business RPCs
- real authenticated `/api/ai/chat` end-to-end test
- authenticated production Foundry/Application Insights trace ingestion
- customer-facing Ask WineShopPOS route

## Verified failure root causes resolved during rollout

1. Azure CLI/Foundry partial provisioning left a legacy East US resource.
2. Git Bash `tr`/path-conversion issues interrupted automation.
3. Foundry deprecated `body.agent`; current runtime requires `agent_reference`.
4. Agent Consumer alone returned 403 for the project-level Responses/Conversations runtime.
5. Function managed identity now uses the verified project-scope Foundry User permission.

## Pending operational hardening

- production evaluation dashboard
- automated quality gates
- alerting
- legacy East US Foundry cleanup
