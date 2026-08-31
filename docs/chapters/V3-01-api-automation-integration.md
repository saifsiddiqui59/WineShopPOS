# V3-01 — API Automation Integration

<!-- V3_API_AUTOMATION_20260831 -->

Status: V3 FOUNDATION DEPLOYED / EMAIL GMAIL AUTHORIZATION REQUIRED  
Date: 2026-08-31  
Branch: `V3`  
Feature commit: `7dd99f21e03e79b17490c837cb1bd5d470823dca`

## Verified deployed foundation
- Private invoice storage: `wspinv5c9453b6e9a1` / `invoice-documents`.
- Path: `{shop_uuid}/{YYYY}/{MM}/{ingestion_uuid}/<original>_<MMDDYYYY>.<ext>`.
- Shop UUID used for sample mapping: `5c94dbca-9bb5-451e-831a-8cfa42d06013`.
- Additive `invoice_ingestions` staging/evidence layer deployed; it does not replace `purchases`.
- Existing `ocr-invoice` Edge Function remains unchanged.
- Manual OCR can persist its original invoice to private Blob while preserving existing OCR if storage is unavailable.
- Invoice Inbox added for ADMIN/MANAGER with month/status filters, View Original, OCR reopen and duplicate resolution.
- Duplicate protection exists at message/file/OCR/pre-receive/final-purchase boundaries.
- Standalone V3 invoice API: `https://wsp-v3-invoice-53b6e9a1.azurewebsites.net` on Windows Consumption / Node.js 24.
- Supabase `invoice-automation-ingest` Edge Function deployed and sample sender preflight resolved the correct shop.
- V3 preview: `https://wspv35c9453b6e9a1.z29.web.core.windows.net/`.
- `main` and the production static frontend were not changed.

## Gmail Logic App — NOT DEPLOYED
The sample ARM deployment failed with `GmailConnectorPolicyViolation` because a sample Gmail string is not an OAuth-authorized Gmail API connection.

The failed design that tried to create an unauthorised `Microsoft.Web/connections/gmail` resource inside ARM was removed. The active template now requires the resource ID of an **existing authorized Gmail connection**.

For later Email activation:
- Google Workspace: authorize the Gmail connection, then deploy the template.
- Consumer `@gmail.com`: this workflow combines Gmail with HTTP/Azure Blob operations, so use Gmail **Bring Your Own Application** OAuth before deployment.
- Keep the Logic App disabled until one real invoice reaches Blob → OCR → Invoice Inbox successfully.

Sample placeholders remain only as configuration examples:
- central mailbox: `wineshoppos.invoice.app@gmail.com`
- authorized shop sender: `wineshoppos.sample.shop@gmail.com`

## Superseded execution attempts
1. Node 20 Linux Consumption — rejected before deployment because the runtime was EOL.
2. Node 24 resource created, then Git Bash/MSYS rewrote Azure RBAC ARM scope — repaired with path conversion disabled only for RBAC.
3. Unauthorised Gmail API connection in ARM — rejected by Gmail connector policy; invalid V3 Gmail resource removed and template replaced with pre-authorized-connection design.
4. Local sender-normalization follow-up — its expected source marker was absent, so it stopped before preview/commit. No deployed resource changed; the patch was dropped until real Email OAuth activation.

## Document Intelligence
Current SKU: `F0`. F0 is branch-test only for this use case; production multi-page invoices should move to S0.

## Hard invariant
`OCR / Email / WhatsApp automation → Invoice Inbox / Human Review → Receive Stock → Inventory`.
Automation never posts inventory directly.

## Pending before V3 → main merge
- choose real central Email mailbox;
- authorize Google Workspace or consumer Gmail BYOA OAuth;
- deploy Email Logic App with the authorized connection;
- replace sample sender mapping;
- test one real invoice Email end-to-end;
- review V3 preview;
- WhatsApp remains V3-01B.
