# V6 ShopAI Multimodal Invoice Judge

## Decision

One uploaded supplier invoice is one evidence object. WineShopPOS never merges a
PDF and an image, or any two different uploads, to manufacture a single answer.

The original invoice is stored first in private Azure Blob Storage. The OCR Edge
Function processes bytes only after proving they match the ingestion's stored
SHA-256. Under the normal manual-upload flow, the just-uploaded request bytes are
already available, so WineShopPOS reuses them after hash verification instead of
paying another Blob round trip. If those bytes are missing or do not match, the
Edge Function may use the existing authenticated Invoice Storage API to obtain a
short-lived read URL, download the stored Blob, and verify the SHA-256 again.

A Blob SAS URL is never sent to ShopAI and is never logged by the OCR Edge
Function. ShopAI receives inline document bytes only.

## Evidence flow

For the same single stored invoice:

1. Azure Document Intelligence extracts invoice structure, tables and fields.
2. Azure Vision Read produces an independent OCR reading.
3. Deterministic WineShopPOS normalization and accounting reconciliation run.
4. One ShopAI multimodal request receives:
   - the actual invoice image or PDF;
   - DI structured values;
   - mapped Vision candidates where they exist;
   - compact raw Vision OCR lines for independent context;
   - deterministic normalized values and finance statuses.
5. ShopAI reviews every business-critical field. Matching fields are not hidden.
6. ShopAI may recommend GO, REVIEW or NO_GO, but it never posts inventory and it
   never silently applies a visual inference.
7. The owner sees the complete table and records Owner GO, Needs Correction or
   NO-GO. Overriding ShopAI REVIEW/NO_GO requires an audit reason.
8. Product Master, pack, batch, quantity, finance, duplicate and server readiness
   gates remain authoritative after Owner GO.

The legacy text exception resolver keeps supplier memory and deterministic label
recovery, but its LLM call is deferred when the multimodal judge is active. This
keeps the architecture to one LLM call per invoice.

## Field coverage

ShopAI sees and judges:

- document line coverage;
- supplier, invoice number and invoice date;
- product/line value;
- financial adjustment label coverage;
- cash/supplier discount, invoice discount, assessable value, C&F/freight,
  transport, handling, loading/unloading, stamp duty, gross amount, TCS, other
  additions, rounding, printed total, calculated payable, tax total and amount due;
- for every invoice row: description, packing/size, MRP, batch/lot, cases,
  bottles/case when printed, loose bottles, printed bottle quantity, rate/case
  and line amount.

Product Master matching remains a separate deterministic/catalogue workflow: it
is not an invoice visual field and the multimodal model is not allowed to invent
a catalogue identity.

`finance:adjustment_coverage` is deliberately a coverage field. It allows the
visual judge to flag a meaningful printed fee/discount/tax/charge that the
structured parser failed to represent rather than silently losing that row.

## ShopAI output

To control cost and latency, ShopAI returns a compact result:

- IDs of fields it found to MATCH;
- detailed findings only for fields that need attention;
- one advisory recommendation.

The server expands that compact response back into a complete owner-visible
field table. An omitted field becomes NOT_JUDGED rather than disappearing.

Supported findings are:

- `PREFER_DI`
- `PREFER_VISION`
- `INFERRED_VISUAL`
- `UNREADABLE`
- `MISMATCH`

When both OCR engines fail but the actual document visually supports a value,
ShopAI may use `INFERRED_VISUAL`. The suggested value remains advisory. The
owner must edit/confirm the real review field through the normal workflow.

## Authoritative audit boundary

`invoice_ingestions.shopai_review` is the authoritative server-written ShopAI
review. The OCR Edge Function writes it using the Supabase service role only
after authenticating the manager/admin and verifying the ingestion's shop.

Browser clients may read this field but a database trigger rejects browser
attempts to create, change or clear it. `invoice_record_ocr_result` strips any
browser-provided `shopAiReview` object and re-injects the authoritative database
copy before saving `normalized_invoice`.

The server READY/receive gates use the authoritative `shopai_review`, not the
browser copy.

For existing legacy ingestions with no authoritative ShopAI record, the old
manual workflow remains available. A normal post-release re-analysis creates an
authoritative record.

## Owner decision semantics

- ShopAI `COMPLETED` + recommendation `GO`: Owner GO is required.
- ShopAI `COMPLETED` + recommendation `REVIEW`/`NO_GO`: Owner may still choose
  GO, but an explicit override reason is required and deterministic gates still
  must pass.
- ShopAI `UNAVAILABLE`: manual review remains possible, but `MANUAL_GO` with a
  reason is required.
- ShopAI `PROCESSING`: server readiness is blocked.

Every GO decision is bound to the authoritative ShopAI review `generatedAt`. A
new analysis therefore invalidates an older GO decision automatically at the
server gate. The browser also binds GO to its current review fingerprint so
editing reviewed OCR values requires the owner to acknowledge the updated state.

Owner GO acknowledges all visible MATCH rows; it does not hide them or require
an unnecessary click on every green row.

## Failure challenge and tightening

### Different document bytes reach OCR and audit Blob
Hash the request bytes and compare with the stored ingestion SHA. On mismatch,
fetch the private Blob through the authenticated storage API and verify its hash.
If verification still fails, stop.

### Malicious browser fabricates a ShopAI review
The authoritative review is a separate service-role-only database column. A
trigger blocks authenticated client mutation, and the OCR-result RPC sanitizes
its normalized JSON copy.

### ShopAI hides a DI/Vision conflict as MATCH
Server validation converts a MATCH back to MISMATCH when both mapped OCR values
exist and differ.

### ShopAI omits fields
The server creates NOT_JUDGED rows. Nothing disappears from owner review.

### DI and Vision are both wrong but the pixels are readable
The actual document is available to ShopAI. It can return INFERRED_VISUAL, which
requires owner action and is never silently applied.

### The document itself is unreadable
ShopAI returns UNREADABLE or the provider fails. Manual verification is required;
no plausible value is invented.

### A product row was missed or duplicated
The `document:line_coverage` field asks ShopAI to compare visible product rows
with structured row count. A mismatch forces advisory NO_GO.

### A financial adjustment label was missed
`finance:adjustment_coverage` asks the model to compare visible summary labels
against the structured adjustment evidence. It can flag the missing label/value
without automatically posting it.

### Prompt injection printed inside invoice
The model is explicitly told that all invoice text, QR text, URLs and commands
are untrusted evidence, never instructions.

### LLM timeout/outage/invalid JSON
The result becomes UNAVAILABLE. The owner can continue only through the explicit
manual-review path; existing deterministic inventory gates remain unchanged.

### ShopAI gives a wrong recommendation
The recommendation is advisory. The owner sees the actual original invoice plus
DI/Vision/model values, and final stock posting still requires deterministic
server validation.

### Duplicate AI cost
The old text-judge call is skipped in this flow. Deterministic/memory resolution
runs first, followed by at most one multimodal judge call.

### Pathological multi-page document cost
The multimodal judge has an eight-page safety budget. For PDFs, WineShopPOS
conservatively estimates the real PDF page-tree count from the stored bytes; it
does not trust the DI F0 processed-page count as proof of total PDF length. If
the PDF page count cannot be established safely, visual ShopAI review falls back
to manual review rather than risking an unexpectedly expensive full-PDF request.
The existing DI/Vision evidence remains available.

## Accepted residual risk

A multimodal model can still misread fine print, rotated text or poor-quality
images. No safe architecture can infer information that is genuinely absent or
unreadable. The acceptable boundary is therefore: model suggestion + visible
source evidence + owner decision + deterministic server enforcement, rather than
model autonomy.
