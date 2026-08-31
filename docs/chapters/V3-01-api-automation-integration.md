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

## V3-01B — WhatsApp Cloud API webhook Step 1

<!-- V3_WHATSAPP_WEBHOOK_20260831 -->

Status: WEBHOOK BACKEND DEPLOYED / META CALLBACK REGISTRATION PENDING
Feature commit: `6c88136acd40c6188c85464365a685cb194540ba`

Verified:
- callback endpoint: `https://wsp-v3-invoice-53b6e9a1.azurewebsites.net/api/whatsapp/webhook`;
- Meta GET verification challenge succeeds with the generated verify token;
- wrong verify token returns HTTP 403;
- POST payload with invalid `x-hub-signature-256` returns HTTP 401;
- correctly signed POST payload returns HTTP 200;
- initial pre-deployment Graph lookup with the temporary access token returned HTTP 400 before any webhook code/deploy; this did not affect V3 because webhook Step 1 does not require an access token;
- access-token validation is deferred to media-ingestion Step 2, where the token is actually required;
- Graph API version: `v25.0`;
- test Phone Number ID: `1363531840166137`;
- WABA ID: `2145563122689116`;
- Meta App Secret + generated verify token live only in Azure Function App settings and are not committed to Git;
- inbound webhook logs safe metadata only and does not log message body;
- media ingestion is intentionally disabled in Step 1;
- inventory mutation remains disabled.

Next Meta-side step:
1. register the callback URL and generated verify token;
2. subscribe the WhatsApp `messages` webhook field / application;
3. send inbound `hello`;
4. confirm the signed webhook event reaches Application Insights;
5. then implement V3-01B media download → existing private Blob → existing automation/OCR Inbox pipeline.

The WhatsApp access token is deliberately not stored by this webhook-only step. Step 2 will validate the token against the media API before storing/using it. A production long-lived/system-user token is required before production launch.

## V3-01C — Email invoice ingestion via Gmail IMAP

<!-- V3_EMAIL_IMAP_20260831T123139Z -->

Status: DEPLOYED / REAL INVOICE TEST PENDING
Feature commit: `931d681b9721a2620488dd420e0c7b8fa3bc233c`

Verified deployment:
- central Gmail mailbox: `wineshoppos@gmail.com`;
- Gmail authentication uses a dedicated Google App Password stored only in Azure Function App settings;
- Azure Function connects to Gmail over IMAPS (TLS/993) and polls unread mail every 5 minutes;
- authorized test sender `royal21beer.wine@gmail.com` resolves to shop `5c94dbca-9bb5-451e-831a-8cfa42d06013` through `invoice_ingestion_channels`;
- attachments accepted for automated OCR: PDF, JPEG, PNG, maximum 4 MB while Document Intelligence remains on F0;
- duplicate preflight remains source-message/file SHA-256 based before Blob/OCR;
- original document is saved to existing private Blob storage;
- existing `invoice-automation-ingest` records OCR result into `invoice_ingestions` / Invoice Inbox;
- automation never creates/receives inventory directly; human Review -> Receive Stock remains mandatory;
- Email health endpoint passed a real IMAP connection test after deployment.

Deployment recovery note:
- the first local Function publish attempt stopped with `Value cannot be null. (Parameter 'input')` before Function deployment;
- Supabase Edge Function deployment and Azure App Settings had already completed at that point;
- no source was reset or recreated;
- continuation used Microsoft's supported Function ZIP push deployment from the exact dirty safe-stop state;
- local Azure Functions Core Tools version observed during continuation: `4.7.0`.

Security:
- normal Gmail password is not used;
- App Password is not committed/logged/documented;
- sender-to-shop mapping is database controlled, not hard-coded into application source;
- unauthorized senders are not ingested.

### WhatsApp status
V3-01B webhook verification code remains deployed/preserved, but WhatsApp media ingestion is **ON HOLD**. No working code was deleted. Email is the active automation path during current V3 development.

Next real acceptance test:
1. send one PDF invoice from `royal21beer.wine@gmail.com` to `wineshoppos@gmail.com`;
2. allow up to 5 minutes for the timer;
3. confirm it appears in Invoice Inbox with Source = Email;
4. open View Original and Review OCR;
5. confirm stock is unchanged until Receive Stock.

## V3 Demo Ready — Invoice Reliability, Email Feedback, Reset, Barcode

Status: DEPLOYED TO PRODUCTION DEMO AND VERIFIED
Feature commit: `234088b6715110536391f9adf5c8398407606035`

### Runtime changes
- V3-01D invoice review reliability is active: server-side review drafts, resume/cancel/reopen, safer quantity interpretation and preserved OCR financial/batch fields.
- Gmail invoice polling is independent of Read/Unread state and uses the private Blob UID checkpoint.
- The existing HTTP-only Logic App remains at a 5-minute recurrence for current acceptance testing.
- Authorized shop senders now receive an automated reply from `wineshoppos@gmail.com` when a supported invoice attachment exceeds 4 MB.
- Oversize feedback is idempotency-protected by a private Blob marker per Gmail UID.
- Oversized attachments do not create purchases or inventory transactions.
- Barcode input is normalized, common Enter/Tab scanner suffixes are supported, and the default timing tolerance is widened for real HID scanners.
- An ADMIN-only **Demo / Test Data Reset** clears operational shop test data transaction-consistently while preserving shop/users/settings/categories/Email channel mapping/audit configuration.
- The standalone V3 invoice Function is configured with `use32BitWorkerProcess=false` (64-bit worker).
- Production frontend was deployed from the verified V3 build to `https://wineshoppos.z29.web.core.windows.net/`.

### Deferred cost task
After acceptance testing, increase the Logic App Email polling interval from 5 minutes to a lower-cost cadence. This was intentionally NOT changed for the demo.

## V3-02 — Invoice Financial Reconciliation + Email Receipt ACK

Status: LOCAL BUILD/LINT/SMOKE VERIFIED — NOT DEPLOYED / NOT PUSHED
Feature commit: `0bc8d8db4e0fadfe2cb5a942bc0d40de2e9a7310`

Implemented:
- Liquor-invoice summary-row recognition for Cash Discount, Other Deduction, Freight/Carting, Stamp Duty, TCS, Transport, Handling, Loading/Unloading, Other Additions and Round Off.
- Automatic landed-cost field population in OCR review and Receive Stock.
- Printed-vs-calculated invoice reconciliation; differences above ₹1 require review before Receive Stock.
- Supplier Invoice / Reference is optional in Receive Stock. OCR value is preferred; otherwise WineShopPOS pre-fills/generates an internal `AUTO-...` reference.
- Registered Email senders receive one idempotent acknowledgement per Gmail UID: invoice Email received, allow up to 1 hour to appear in Invoice Inbox.
- Existing >4 MB rejection Email remains independent.
- Native required form fields display a visible star; Receive Stock table explicitly marks required Product, Bottles/Case and Final Bottles.
- First-row quantity/case logic was intentionally NOT changed in this patch.

Deployment and Git push remain intentionally pending explicit user instruction.
