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

`ocr-invoice` requires the already-stored ingestion UUID and uses that UUID as
the correlation ID. Requests without a stored ingestion ID are rejected so OCR,
Blob evidence and ShopAI audit cannot drift onto different document identities.
The same `x-ms-client-request-id` is sent to Document Intelligence, Vision Read
and the ShopAI multimodal judge request.

The Edge Function emits one compact `WSP_OCR_TRACE` event containing only:
status, conflict counts, provider status and token counts.

## Shop-AI judge

`gpt-5-mini` remains an evidence judge, not an inventory authority.

- one multimodal AI call maximum per stored invoice;
- `reasoning.effort = minimal`;
- the actual hash-verified invoice visual, DI values, Azure Vision evidence and deterministic calculations are supplied together;
- all business-critical fields stay owner-visible, including MATCH fields;
- `INFERRED_VISUAL` is allowed only as an advisory suggestion when the pixels support it and OCR does not;
- ShopAI never silently applies a suggestion; Owner GO / manual override remains explicit;
- unknown or over-budget PDFs fall back to manual review instead of an unbounded visual request;
- stock receiving stays fail-closed behind deterministic server validation.

## Cost verification

The executor performs a read-only Cost Management query against the exact
Application Insights and Log Analytics resource IDs from 2026-08-01 through the
current UTC day. Cost Management data may lag recent activity.
