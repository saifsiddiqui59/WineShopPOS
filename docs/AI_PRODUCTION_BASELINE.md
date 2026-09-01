# WineShopPOS — Verified AI Production Baseline

**Current product/documentation generation: V2**

## AI status

`Ask WineShopPOS PRO AI Owner Assistant` is:

```text
VERIFIED WORKING end-to-end in production
```

## Azure Function

- Name: `wineshoppos-ai-1a61d5885c`
- Region: Central India
- Plan: Consumption Y1

## Microsoft Foundry

- Production resource: `wineshoppos-ai-in-1a61d5885c`
- Region: South India
- Project: `wineshoppos-ai`
- Model: `gpt-5-mini`
- Model version: `2025-08-07`
- SKU: GlobalStandard
- Logical agent: `WineShopPOS-Owner-Agent`

## Authorization

```text
logged-in Supabase session/access token
→ Azure Function
→ auth.uid()
→ user_shop_memberships
→ authorized organization/shop
```

Function → Foundry:

```text
system-assigned Function managed identity
→ Foundry project RBAC/User access
→ existing Owner Agent
```

## Production database record

AI migration:

```text
20260830070000
```

is recorded as applied in production.

## Legacy environment

The East US Foundry resource named `wineshoppos-ai-1a61d5885c` is not the
production Foundry environment.

## Next AI milestone

Tracing infrastructure is configured. The next verification/quality milestone is:

- authenticated production trace ingestion verification
- Foundry trace evaluations
- golden evaluation dataset
- quality gates
- monitoring/dashboarding
- Explanation verification
- Investigation verification
- Daily Summary verification

Critical quality failures include cross-tenant access, wrong business numeric
results and critical tool regressions.

<!-- NEXT_AI_PUSHES_START -->
## Current AI rollout status

1. Functionality knowledge / `get_app_help` - deployed and live.
2. Help & User Manual reference - deployed and live.
3. Foundry server-side tracing infrastructure - configured with dedicated Application Insights and Project Managed Identity authentication.
4. Next - create one authenticated production interaction, verify it in Foundry Traces, then run trace evaluations and define quality gates.
<!-- NEXT_AI_PUSHES_END -->

<!-- APP_HELP_KNOWLEDGE_START -->
## Functionality knowledge — deployed with AI help push

The existing production Owner Assistant includes a read-only deterministic
`get_app_help` tool for WineShopPOS functionality/navigation questions.

Covered verified topics include:

- multi-line/bulk stock receipt
- invoice OCR/product resolution
- product creation vs stock receipt
- ageing/FIFO and history guidance
- sales history
- users/roles/access
- stock count and transfers
- approvals and POS overrides
- loyalty/promotions/store credit/gift vouchers
- accountant/Tally-ready export
- supplier score/Purchase Coach
- Leakage Shield
- scanner/printer
- backup/audit

The tool does not write application data and does not introduce a second RAG
service or database. Unknown workflows return an explicit "not verified"
fallback so the agent does not invent app functionality.

Foundry/Application Insights tracing infrastructure is configured; authenticated trace ingestion and evaluation execution remain to be verified.
<!-- APP_HELP_KNOWLEDGE_END -->

<!-- AI_OBSERVABILITY_START -->
## Foundry tracing and evaluation observability

Foundry project `wineshoppos-ai` is connected to workspace-based Application Insights `wineshoppos-ai-insights`, backed by `wineshoppos-ai-law`.

The connection uses `ProjectManagedIdentity` and includes the required `ApplicationInsightsConnectionString` metadata. Git Bash ARM path conversion is explicitly disabled for connection and RBAC commands.

The Foundry project managed identity has `Monitoring Metrics Publisher` on Application Insights for trace ingestion and `Log Analytics Reader` for trace access.

No Owner AI source or Function configuration is changed by this repair.

Tracing infrastructure is configured. End-to-end tracing is verified only after a real authenticated Owner AI interaction appears in Foundry Traces.
<!-- AI_OBSERVABILITY_END -->

<!-- AI_MONITOR_STATUS_20260831_START -->
## Foundry Monitor access / trace verification — 2026-08-31

The Foundry Monitor permission problem is resolved.

Current state:

```text
TRACING INFRASTRUCTURE:  CONFIGURED
MONITOR ACCESS:          RESOLVED
TRACE VIEW:              NO RESULTS TO SHOW
TRACE INGESTION E2E:     NOT YET VERIFIED
```

The next verification is one fresh authenticated production Owner Assistant
interaction followed by confirmation of the corresponding Foundry trace after
telemetry ingestion delay. Only then should trace evaluations and quality gates
be treated as verified.
<!-- AI_MONITOR_STATUS_20260831_END -->

## V3-06 AI knowledge source update

The repository Owner Assistant knowledge source now contains `invoice_inbox_workflow`, covering Needs Review, Ready for Stock, Completed (`RECEIVED` internally), Resume Review, Continue Receive Stock, Cancel Review, Reopen Review and duplicate handling.

Knowledge source version: `2026-09-01-v4`.

Committing this source does not automatically alter the running production Azure Function. Runtime AI knowledge changes only after an explicit tested AI Function deployment.

## V3-07 login/access knowledge

Repository Owner AI knowledge distinguishes verified disabled/suspended states from temporary verification failures. The application also retries the observed transient Supabase/PostgREST JWT timing rejection before surfacing an access-verification error.
