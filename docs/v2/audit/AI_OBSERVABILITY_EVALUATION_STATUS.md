# WineShopPOS AI Observability / Evaluation Status

Generated: 2026-08-30T17:04:03-04:00

## Production resources
- Function App: wineshoppos-ai-1a61d5885c
- Foundry resource: wineshoppos-ai-in-1a61d5885c
- Foundry project: wineshoppos-ai
- Application Insights: wineshoppos-ai-insights
- Application Insights resource ID: /subscriptions/3a5e8018-40a4-49e3-bcba-a9af3344f50e/resourceGroups/wineshopPOS/providers/microsoft.insights/components/wineshoppos-ai-insights
- Log Analytics workspace: wineshoppos-ai-law
- Log Analytics resource ID: /subscriptions/3a5e8018-40a4-49e3-bcba-a9af3344f50e/resourceGroups/wineshopPOS/providers/Microsoft.OperationalInsights/workspaces/wineshoppos-ai-law
- Foundry connection: wineshoppos-appinsights
- Foundry project managed identity: 457a1c35-127a-47c2-9c72-b38db3d96470

## Verified connection
- authType: ProjectManagedIdentity
- target: exact Application Insights ARM resource ID
- metadata.ApplicationInsightsConnectionString: present
- Git Bash/MSYS path conversion disabled for ARM-bearing REST/RBAC calls

## Verified project MI RBAC
- Monitoring Metrics Publisher -> Application Insights
- Log Analytics Reader -> Application Insights
- Log Analytics Reader -> linked Log Analytics workspace

## Runtime safety
- Owner AI source unchanged
- Function application settings unchanged
- Owner AI health HTTP 200
- chat no-auth HTTP 401
- appHelpKnowledge preserved
- userManualReference preserved

## Final E2E
Ask one authenticated Owner AI question, then confirm a new interaction under
Foundry -> Agents -> Traces. Only then mark trace ingestion end-to-end verified.
