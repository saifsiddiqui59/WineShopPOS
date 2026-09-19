# V6 OCR Observability — Safe Production Baseline

## Reused resources

- Application Insights: `wineshoppos-ai-insights`
- Log Analytics workspace: `wineshoppos-ai-law`
- Document Intelligence: `wineshoppos-docintel-45b7d2b9`
- Azure Vision Read: `wspvisionf03a5e8018`
- Foundry/OpenAI resource: `wineshoppos-ai-in-1a61d5885c`

No second Application Insights or Log Analytics workspace is created.

## Privacy and cost policy

Only Azure diagnostic categories matching `Audit` or `Usage` are routed to the
existing Log Analytics workspace. `RequestResponse` is deliberately excluded so
raw invoice OCR text, invoice files, prompts and model responses are not exported
by this release.

## Correlation

`ocr-invoice` uses the ingestion UUID as the correlation ID when available,
otherwise a random UUID. The same `x-ms-client-request-id` is sent to Document
Intelligence, Vision Read and the Shop-AI judge request.

The Edge Function emits one compact `WSP_OCR_TRACE` event containing only:
status, conflict counts, provider status and token counts.

## Shop-AI judge

`gpt-5-mini` remains an evidence judge, not a document generator.

- one AI call maximum;
- `reasoning.effort = minimal`;
- maximum two compatible candidates per unresolved target;
- primary/DI and Vision candidates are both retained when available;
- no invented money/date/text value;
- conflicting OCR remains human-review unless deterministic validation resolves it;
- stock receiving stays fail-closed.

## Cost verification

The executor performs a read-only Cost Management query against the exact
Application Insights and Log Analytics resource IDs from 2026-08-01 through the
current UTC day. Cost Management data may lag recent activity.
