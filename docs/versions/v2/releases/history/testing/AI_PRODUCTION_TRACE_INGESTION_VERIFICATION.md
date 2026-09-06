# Production AI Trace Ingestion Verification

Verification UTC: 20260901T145042Z

## Baseline

- Production Owner AI: verified working before this test.
- Foundry resource: `wineshoppos-ai-in-1a61d5885c`
- Foundry project: `wineshoppos-ai`
- Agent: `WineShopPOS-Owner-Agent`
- Model: `gpt-5-mini`
- Application Insights: `wineshoppos-ai-insights`
- Log Analytics workspace: `wineshoppos-ai-law`
- Fresh telemetry window start: `2026-09-01T14:51:30Z`

## Production interaction

A real authenticated `SHOP`-scope Owner AI request was executed after the telemetry window started.

Safe correlation metadata:

- request id: `a630ad12-f02b-4431-9889-c93c196d3e97`
- tools called: `get_sales_summary`
- sources: `/pos/sales`
- returned scope: `SHOP`

The business answer itself is not committed as trace evidence.

## Trace result

**AUTHENTICATED PRODUCTION TRACE INGESTION: VERIFIED**

- telemetry rows observed after the fresh request: `1`
- qualifying AI/Foundry trace rows: `1`
- rows containing the Function request id: `0`
- telemetry tables: `AppDependencies`
- trace markers: `cognitiveservices, conversation, gen_ai, gpt-5-mini, wineshoppos-owner-agent`
- sample operation IDs: `94be773dbbbcba842248876c34076056`

Acceptance required a fresh AI/Foundry telemetry marker after the test start time in the dedicated observability workspace. A successful `/api/ai/chat` response by itself was not enough.

## Data handling

Raw Application Insights/Log Analytics payloads were retained only in the local executor evidence directory and were **not committed**.

No bearer token, Supabase key, password, or raw business answer is stored in this document.

## Scope / side effects

This verification did not:

- deploy the frontend;
- deploy the AI Function;
- modify the database schema;
- receive stock, post a sale, edit inventory, or change purchasing data;
- clean or stage the historical local main worktree.

The production AI interaction performed the application's normal AI activity/audit logging.

## Next quality milestone

Trace ingestion is no longer the blocker.

Proceed to:

1. define the versioned golden evaluation dataset;
2. implement deterministic tool/scope/security checks;
3. run Foundry/LLM quality evaluators;
4. enforce release quality gates;
5. build production monitoring/dashboard and alert thresholds.
