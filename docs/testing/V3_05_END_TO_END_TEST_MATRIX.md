# V3-05 End-to-End Test Matrix

Feature commit: `656b1162d70b5d8dba1a80750868e5f674bc1348`
Preview: https://wspv35c9453b6e9a1.z29.web.core.windows.net

## Automated and deployment gates
- Barcode smoke: PASS
- Invoice finance smoke: PASS
- Semantic OCR table smoke: PASS
- Kapil 16845 / METRI 15983 / ERP saved-Azure regression: PASS
- Pack-conflict regression: PASS
- FIFO contract simulation: PASS
- npm build: PASS
- npm lint: PASS
- Exact Supabase migration safety check: PASS
- V3-05 DB migration present remotely: PASS
- ocr-invoice Edge deployment: PASS
- invoice-automation-ingest Edge deployment: PASS
- V3 preview deployment and bundle smoke: PASS
- Logic App remained Disabled: PASS

## Final V3-05 behavior
- Original invoice is stored before OCR analysis.
- Manual OCR and automation ingestion use the same shared parser.
- Each new Analyze clears prior supplier/date/product review state.
- Azure typed invoice date is preferred by the shared normalizer.
- OCR never changes inventory directly; Receive Stock is the purchase posting boundary.
- POS current bill persists across Scanner Test/page navigation in the browser session.
- Old scanner events cannot replay into a newly mounted POS screen.
- Scanner Test history is temporary.
- POS provides explicit Remove and Clear Cart.
- Zero selling-price items are blocked from billing.
- Product Master barcode search accepts scanner input when the search field is focused.
- Forward FIFO allocation records stock-outs and snapshots FIFO COGS for new sale items.
- Settings & Admin includes protected Product Cleanup for non-transactional test products.

## Final manual acceptance before production static frontend deployment
1. Hard-refresh preview.
2. Upload one invoice -> Invoice Inbox -> View Original -> verify supplier/date -> Send Confirmed Draft.
3. Do not Receive Stock for an invoice already posted previously.
4. POS: add 3 items -> Scanner Test -> return -> same cart; no scanner replay.
5. Remove one cart row using × Remove and verify Clear Cart.
6. Complete one disposable test sale and inspect Ageing & FIFO behavior.
7. Product Cleanup: an unused test product may purge after typing DELETE; a transactional product must be blocked.
