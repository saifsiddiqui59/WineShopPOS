# Chapter 26 — OCR, Compliance & Automation

Status: Implemented in Chapters 16–26 production-expansion release.

## OCR
A Supabase Edge Function `ocr-invoice` integrates Azure AI Document Intelligence `prebuilt-invoice` using API version `2024-11-30`. Azure credentials remain Edge Function secrets, never Vite/browser variables.

The frontend sends invoice image/PDF → OCR extracts supplier/invoice/date/items → `match_product_text` uses aliases/trigram similarity → human review → draft is sent to Receive Stock. **OCR never modifies inventory directly.**

If Azure secrets are absent, the feature returns `OCR_NOT_CONFIGURED` and the rest of the application continues normally.

## Product aliases
`product_aliases` allows supplier/OCR wording to be taught to a product without renaming the product master.

## Compliance boundary
State/excise compliance is intentionally not labeled complete. India alcohol reporting is jurisdiction/license specific. A future chapter must identify state, license class, statutory forms and reporting rules before implementation/certification.

## Future AI
Anomaly detection, forecasting and an owner assistant may be added over audited read models; they must never bypass transaction-safe RPCs or approval controls.

## Azure free-tier deployment used by this release

The release installer creates or reuses an Azure AI Document Intelligence resource of kind `FormRecognizer` in the existing `wineshopPOS` resource group. It **only accepts F0**. There is deliberately no automatic S0 fallback. If F0 is unavailable, the installer stops before creating a paid OCR resource.

Target Azure configuration:
- Subscription: `Azure subscription 1`
- Resource group: `wineshopPOS`
- Preferred region: `centralindia`
- Kind: `FormRecognizer`
- SKU: `F0`
- Model: `prebuilt-invoice`
- REST API: `2024-11-30`

The installer retrieves the Azure endpoint/key locally and sends them directly to Supabase Edge Function secrets using a temporary file outside the repository. The Azure key is never written to React, `.env.local`, Git documentation, or source control.

### F0 operational limits
F0 is intended for development/light testing. The application enforces a 4 MB file guard and tells the operator that only the first two pages are analyzed on F0. When production invoice volume exceeds the free allowance, upgrade deliberately rather than allowing an automatic paid fallback.
