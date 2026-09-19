# WineShopPOS V6 OCR Safety Architecture V1

Production source and production Supabase are authoritative. QA is not used by
this release.

## Decision hierarchy

1. Azure Document Intelligence owns invoice/table structure.
2. Azure Vision Read is an independent OCR signal.
3. Field-specific deterministic evidence builders constrain what may compete:
   - Invoice date: Vision is anchored to the DI InvoiceDate geometry when available.
   - Batch/Lot: Vision is constrained to DI row + Batch column geometry.
   - Finance: only known semantic labels may be offered to the AI mapper.
4. Direct DI-vs-Vision disagreement may be shown to the LLM for advisory diagnostics, but every such mapping still requires human confirmation.
5. GPT-5-mini is an advisory evidence mapper. It may abstain by returning no mapping, and it never receives authority to clear a direct OCR conflict.
6. Human confirmation handles unresolved physical-document conflicts.
7. PostgreSQL re-computes final readiness from the authoritative Purchase Draft.
8. OCR receive uses a single PostgreSQL transaction:
   validate ingestion -> receive_purchase_v3 -> link ingestion.

## Date representation

All persisted dates remain ISO `YYYY-MM-DD`. User-facing invoice date entry is
forced to Indian `DD/MM/YYYY`; this avoids browser/OS locale ambiguity.

## Fail-closed cases

The server blocks READY/receive when any of these remain:
- invalid or unconfirmed invoice date;
- unresolved Product/pack/quantity identity;
- unresolved Batch/Lot review flag;
- missing printed invoice total;
- financial difference greater than ₹1;
- ingestion not in READY_TO_RECEIVE;
- duplicate/failed/cancelled/already-received ingestion.

## LLM boundary

The LLM never invents invoice values, never receives authority to post inventory,
and may suggest among a raw DI-vs-Vision conflict only as advisory output.
Cross-OCR conflicts remain human-review items and cannot auto-apply.
