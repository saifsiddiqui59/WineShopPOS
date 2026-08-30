# Chapter V2-09 — AI Production Quality

The existing Owner Assistant is verified working and must be hardened, not rebuilt.

## Current production quality state

### Runtime

- Function App: `wineshoppos-ai-1a61d5885c`
- Function region/plan: Central India / Consumption Y1
- Foundry production resource: `wineshoppos-ai-in-1a61d5885c`
- Foundry project: `wineshoppos-ai`
- model: `gpt-5-mini`
- agent: `WineShopPOS-Owner-Agent`
- current agent version: `2`
- runtime tenant/shop authorization remains driven by the logged-in Supabase session

### Functionality knowledge

The read-only `get_app_help` capability is deployed and provides verified
application-navigation/workflow knowledge. It must not invent unsupported
workflows.

### Tracing infrastructure — configured

- Application Insights: `wineshoppos-ai-insights`
- Log Analytics workspace: `wineshoppos-ai-law`
- Foundry connection authentication: `ProjectManagedIdentity`
- required connection metadata includes `ApplicationInsightsConnectionString`
- App Insights local authentication is disabled for Entra-authenticated ingestion
- Foundry project MI has `Monitoring Metrics Publisher` on App Insights
- Foundry project MI has `Log Analytics Reader` for trace access

No Owner AI source redeployment was required for this server-side tracing
infrastructure step.

## Verification boundary

Tracing infrastructure is configured, but trace ingestion is not called
end-to-end verified until a real authenticated Owner AI interaction appears in
Foundry Traces.

## Next production-quality work

1. generate/confirm authenticated production traces
2. create a golden evaluation dataset
3. run groundedness/relevance evaluation
4. validate numeric correctness
5. validate tool correctness
6. validate tenant/shop correctness
7. define deployment quality thresholds/gates
8. add monitoring/dashboarding and operational alerts

AI failure must never break core POS availability.
