# WineShopPOS — Current Project Context

**Current product/documentation generation: V2**

This is the canonical current-state reference.

Old Chapters 1–26 remain implementation history and must not be used as the
current architecture/pending-work source without verification against current
source, migrations and deployment state.

## Current application

WineShopPOS is an existing React/Vite production POS application.

Current architecture/direction includes:

- React + Vite
- Supabase PostgreSQL
- Supabase Auth
- RLS
- RPC/backend transaction operations
- organizations
- UUID shops
- `user_shop_memberships`
- ADMIN / MANAGER / CASHIER authorization
- Azure Blob static hosting
- Azure Document Intelligence OCR where configured
- production AI Owner Assistant

## Existing functional areas

The application has progressed substantially beyond the early MVP.

Existing/developed areas include:

- Core POS
- barcode scanner
- cart/billing
- payments
- inventory
- purchasing
- purchase orders
- receiving / GRN
- suppliers
- sales
- sale items
- payments
- returns/refunds
- sale void
- cashier shifts
- physical stock counts
- stock adjustments
- stock transfers
- stock movement/ledger
- reports
- Owner Center
- supplier intelligence
- reorder intelligence
- Purchase Coach
- Leakage Shield / exception intelligence
- OCR invoice workflow
- offline foundation
- backup foundation
- receipt printing
- owner WhatsApp summary
- multi-shop access/security
- AI Owner Assistant
- AI business explanation/investigation/daily-summary direction

A V2 feature must be checked against the current implementation before it is
treated as new development.

## Core business rules

```text
Product Master defines the product.

Inventory changes through controlled business transactions.

Purchases/receiving increase stock.

Sales reduce stock.

Returns/voids/adjustments follow their controlled transaction rules.

Historical business records are preserved.

Stock-changing operations should be transaction-safe server/database operations.

Backend authorization and RLS are authoritative.

The browser never decides tenant authorization.
```

## Current verified production AI

Status:

```text
Ask WineShopPOS PRO AI Owner Assistant
VERIFIED WORKING end-to-end in production
```

Azure Function:

```text
Name:
wineshoppos-ai-1a61d5885c

Region:
Central India

Plan:
Consumption Y1
```

No Premium/Dedicated/Always-On AI hosting is the current production requirement.

Microsoft Foundry:

```text
Production resource:
wineshoppos-ai-in-1a61d5885c

Region:
South India

Project:
wineshoppos-ai

Model:
gpt-5-mini

Version:
2025-08-07

SKU:
GlobalStandard

Logical agent:
WineShopPOS-Owner-Agent
```

Runtime user authorization:

```text
currently logged-in Supabase session/access token
↓
Azure Function
↓
auth.uid()
↓
user_shop_memberships
↓
authorized organization/shop
↓
existing Owner Agent
```

Function → Foundry authentication uses the Function App system-assigned managed
identity with required Foundry project-level User access.

Production record indicates Supabase AI migration:

```text
20260830070000
```

has been applied.

The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is not
the production Foundry environment and is cleanup-only after dependency review.

## AI observability and next quality milestone

Foundry server-side tracing infrastructure is configured:

- Application Insights: `wineshoppos-ai-insights`
- Log Analytics workspace: `wineshoppos-ai-law`
- Foundry AppInsights authentication: `ProjectManagedIdentity`
- project managed identity has `Monitoring Metrics Publisher` for trace ingestion
- project managed identity has `Log Analytics Reader` for trace access

The remaining verification boundary is a real authenticated Owner AI interaction
appearing in Foundry Traces.

After trace ingestion is verified, the next AI quality work is:

- production trace evaluations
- golden evaluation dataset
- groundedness/relevance
- numeric correctness
- tool correctness
- tenant/shop correctness
- deployment quality gates
- monitoring/dashboarding

AI failure must never break core POS availability.

## V2 feature program

V2 requests include:

1. Landed Cost Engine
2. Batch / Receipt Lot Tracking
3. True Stock Ageing
4. FIFO / Stock Rotation Foundation
5. Discount / Price Override Control
6. Standardized Reason Codes
7. Accountant / Tally-ready Export
8. Customer Loyalty
9. Coupons / Promotions
10. Gift Voucher / Store Credit
11. Supplier Performance Score
12. Advanced Stock Transfer
13. Approval Center Expansion
14. Leakage Shield Expansion
15. Purchase Coach Expansion

Each item must first be classified from current code as:

```text
EXISTING
PARTIAL
MISSING
NEEDS TESTING
BROKEN
```

V2 does not rebuild a working feature simply because it appears in the program.

<!-- V2_STATUS_START -->
## V2 implementation status — current

N1–N11 and N13–N15 are implemented in the current V2 implementation history.
N12 Advanced Stock Transfer remains an existing controlled workflow and is not
a feature to rebuild.

Recent interface work includes a dedicated POS/billing responsive UI pass and
58mm/80mm thermal receipt styling.

The production Owner Assistant remains read-only and working. Verified
functionality/how-to knowledge is deployed. Foundry/Application Insights tracing
infrastructure is configured; trace ingestion remains pending final authenticated
end-to-end verification before evaluation quality gates are treated as complete.
<!-- V2_STATUS_END -->

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Product Master real-catalogue onboarding — 2026-08-31

WineShopPOS Product Master now uses real supplier-invoice onboarding rather than
the development/sample catalogue.

Current rules:

- Normal **Add Product** keeps Barcode mandatory.
- SKU is generated inside PostgreSQL per shop as `WSP-000001`, `WSP-000002`, ...
- SKU is a stable internal identity; Category, Brand, Size and Barcode remain separate fields.
- Opening Stock is no longer a Product Master input.
- Product creation initializes inventory at zero and creates no OPENING_STOCK movement.
- Physical purchased stock is posted only through the controlled Receive Stock workflow.
- **Bulk Product Import** is a first-class Products screen for manual and Invoice OCR onboarding.
- Barcode may be missing only in this controlled bulk/OCR onboarding path.
- Invoice OCR bulk onboarding reads unresolved lines from `wineshop_ocr_review_state`,
  returns created Product IDs to OCR, and keeps the existing human quantity/price
  confirmation and Receive Stock handoff.
- Product Master filters **All / With Barcode / Without Barcode** so missing physical
  barcodes can be completed later through Edit Product.
- The known legacy dummy barcode catalogue is retired from active use without
  deleting historical sale/purchase references.

<!-- AI_MONITOR_STATUS_20260831_START -->
## Foundry Monitor access / trace verification — 2026-08-31

Current verified/configured state:

- Foundry AppInsights connection uses `ProjectManagedIdentity`.
- The connection target is the exact Application Insights ARM resource ID.
- The prior human permission error in the Foundry Monitor UI is resolved.
- Owner-observed Monitor state after access repair: **No results to show**.

Status boundary:

```text
MONITOR PERMISSION ISSUE: RESOLVED
MONITOR UI ACCESS:        AVAILABLE
TRACE RESULTS:            NO RESULTS TO SHOW
TRACE INGESTION E2E:      NOT YET VERIFIED
```

A new authenticated production Owner Assistant interaction must appear in
Foundry Traces before trace ingestion is described as end-to-end verified.
Trace evaluations and deployment quality gates remain follow-on work.
<!-- AI_MONITOR_STATUS_20260831_END -->

<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
## Help entry — simplified production SaaS UX

Customer Help access is intentionally simple:

- there is no standalone **Help & Manual** module in the main navigation;
- the top-right signed-in user menu keeps **Help / About**;
- Help / About exposes one **Open Full User Manual** button;
- the full HTML manual remains the customer documentation surface and keeps its
  clickable table of contents;
- legacy `#/help` navigation redirects to Account → Help / About instead of
  rendering a separate Help category page.

## V3 API Automation Integration
<!-- V3_API_AUTOMATION_20260831 -->
V3 is isolated on branch `V3`; main is not merged. Private per-shop invoice storage, `invoice_ingestions`, duplicate protection, standalone invoice API, automation Edge Function and Invoice Inbox are deployed/previewed. Existing manual OCR and Receive Stock remain authoritative. Preview: `https://wspv35c9453b6e9a1.z29.web.core.windows.net/`. Gmail Email ingestion is NOT DEPLOYED because a real OAuth-authorized Gmail connection is required; the failed unauthorised connection design was removed.

### V3 Email automation current state (20260831T123139Z)
V3 Email invoice automation is deployed on branch `V3`. Gmail uses a dedicated App Password kept only in Azure Function settings. Unread PDF/JPEG/PNG invoices from a registered EMAIL channel are polled every 5 minutes, deduplicated, stored in private Blob, OCR-processed, and routed to Invoice Inbox. Inventory remains unchanged until a human completes Receive Stock. WhatsApp V3-01B is preserved but ON HOLD.

### Demo-ready production state (20260831T160407Z)
V3 invoice reliability plus the demo fixes are deployed to the production static site. The invoice Email Function is 64-bit; Gmail IMAP and SMTP health passed; registered senders receive >4 MB rejection feedback; barcode handling was normalized/tolerance-tested; and ADMINs have a controlled whole-shop operational Demo/Test Data Reset. Production URL: https://wineshoppos.z29.web.core.windows.net/. Logic App remains every 5 minutes for acceptance testing; lowering recurrence for cost is a future task.

### V3-02 local validated patch (20260831T182936Z)
Feature `0bc8d8db4e0fadfe2cb5a942bc0d40de2e9a7310`: invoice financial-summary reconciliation/landed-cost auto-fill, Gmail receipt acknowledgement (up to 1 hour expectation), optional auto-filled supplier invoice/reference, and required-field star UX. First-row case logic intentionally unchanged. Build/lint/finance smoke passed locally. Deployment and push are pending explicit instruction.

### V3-03 local verified state (20260831T193701Z)
Feature `ce1c14c8772fdb024f346b64a3aa8c278da9f2c5` hardens invoice finance-row matching/final-total selection, adds a large mismatch popup, recovers OCR MRP from invoice tables, and improves Bulk Product Import Brand/Category prefilling. Quantity/case logic is unchanged. Build/lint and finance/product-prefill smoke tests passed. Deployment/push pending.

### V3-03B production state (20260831T195134Z)
V3-03 finance/product-prefill improvements and Bulk Product Import scanner capture are deployed to preview and production. Barcode feature `94e65616a4df66148dfcf1e9d8da13f6c7970d53` fixes the flash-then-blank input behavior. Logic App `wsp-v3-email-scheduler-53b6e9a1` is intentionally Disabled until testing resumes.

### V3-02/V3-03 production clarification
The V3-02 Email receipt acknowledgement ("received; allow up to 1 hour to reflect"), >4 MB rejection feedback, invoice finance UX, barcode capture and the other previous-build features are already in the production/main baseline. The Email Logic App is intentionally Disabled after testing; that pause does not remove deployed Email code.

### V3-04 production state (20260901T055315Z)
Feature `7340fac6604d9e0e6281dd7c82070ffb818d4c9f` passed synthetic tests plus a live Azure Document Intelligence regression using the supplied METRI SPIRITS invoice before deployment was allowed. Semantic-table-first liquor OCR, review-safe Batch/MRP handling, validated case derivation, 6-decimal unit-cost precision and FIFO SELL FIRST/BOX guidance are deployed. METRI normalized total: ₹148,132 with MATCH reconciliation. Logic App remains Disabled.

## V3-05 FINAL END-TO-END
V3-05 consolidates OCR evidence/review reliability, durable invoice routing, POS/scanner state reliability, receipt verification, forward FIFO sale allocation/COGS snapshots, and protected Admin Product Cleanup. The V3 preview, both OCR Edge Functions, and the V3-05 FIFO/Product Cleanup migration are deployed. Production static frontend remains pending final preview acceptance.

## V3-06 friendly invoice workflow

Invoice Inbox now uses business-friendly labels while preserving database workflow values. The actual Owner AI app knowledge source also contains the same semantics. A Playwright read-only E2E smoke framework is included.

This local V3 change does not by itself deploy the production Owner AI Function.

## V3-07 PGRST303 login resilience

The login reliability fix now handles an observed Supabase/PostgREST transient `PGRST303: JWT issued at future` condition with bounded retry/backoff. This is separate from the original frontend null-profile/false-disabled bug.

## V3-07 hosted preview verification — 20260901T140823Z

V3-07 passed five sequential hosted login/no-refresh checks and the full hosted read-only Playwright suite on the V3 preview. Production promotion remains a separate explicit step.

## V3-07 production AI complete — 20260901T143945Z

Production Owner AI is verified after V3-07 deployment. Health is passing and authenticated SHOP-scope app-help successfully uses the `/login` knowledge route. The verification continuation fixed only a Git Bash CRLF issue in its local Azure-CLI parsing; no database or local-main mutation occurred.

## Production AI trace ingestion verified

A fresh authenticated production Owner AI interaction produced qualifying AI/Foundry telemetry in the dedicated Application Insights / Log Analytics observability path. Trace ingestion is now verified end to end.

The next AI milestone is evaluation engineering: golden dataset, deterministic tool/scope/security checks, LLM quality evaluators, release gates, and monitoring/alerting.

## AI-09 golden dataset and quality gates

Production trace ingestion is verified. Evaluation engineering now has a versioned golden dataset and deterministic release-gate policy.

The golden dataset includes positive coverage for every current Owner AI tool and blocker cases for cross-shop leakage, tenant isolation, unauthorized writes, secrets, SQL/system prompt disclosure and prompt injection.

Next execution milestone: AI-10 live/batch evaluation using the pinned dataset and Microsoft Foundry evaluators.

<!-- RELEASE_WITH_AI_EVAL_SKIPPED_20260901 -->
## 2026-09-01 — Production release proceeds without AI-10/AI-11 evaluation gate
- Owner explicitly chose to stop the remaining AI evaluation work and proceed with the rest of the release.
- AI-10 and AI-11 are **SKIPPED BY USER** for this release and must not be recorded as PASS.
- This release still runs normal application lint/build checks before production promotion.
- Edit Product release behavior: Selling Price is re-read from `get_products` after save and must match before the form closes; Apply is removed; duplicate top-right Back/Close controls are removed.
- Remaining Owner AI/business validation is manual owner validation.

<!-- PRODUCTION_RELEASE_AI_EVAL_SKIPPED_20260901 -->
## 2026-09-01 — Production frontend promoted
- AI-10: **SKIPPED BY USER**.
- AI-11: **SKIPPED BY USER**.
- Standard application build checks: PASS.
- Production code SHA: `f43e70590b9b1aed1dc1ceeed66fa08558fb050f`.
- Production static frontend deployed to `https://wineshoppos.z29.web.core.windows.net/`.
- Production `index.html` SHA-256 matched the exact clean release build: `97f716ec879e9e0bafcff02fc1128af4ed33b755df9dd0e1af9f45e7536ae0c6`.
- Edit Product release fix: Selling Price persistence verification; Apply removed; duplicate top-right Back/Close removed.
- Remaining application/Owner AI validation is manual owner validation.

<!-- OCR_BULK_PRODUCT_SYNC_FIX_20260902 -->
## 2026-09-02 — OCR bulk-created Product Master synchronization fix
- Live investigation confirmed OCR Bulk Create persisted products correctly in Supabase while the browser could still show `0 real catalogue products` and stale `No product match found` text.
- OCR return state now refreshes Product Master and labels newly-created links explicitly.
- Bulk import verifies every successful created product ID against shop-scoped `get_products()` before linking/navigating.
- Product Master state is published independently from Sales/Purchases refresh, so an unrelated operational-history error cannot keep an old/empty catalogue visible.
- Send Confirmed Draft re-verifies product IDs against live `get_products()` before Receive Stock.
- Reconciliation review now exposes Invoice Rate/Case, editable Reviewed Rate/Case, Invoice Line Amount, Reviewed Line Amount and per-row Gap (Invoice - Reviewed), plus a product-line subtotal gap summary.
- Editing Reviewed Rate/Case recalculates Price/Bottle using Bottles/Case, preserving bottle-level FIFO costing while making supplier-invoice case rates easy to compare.
- Inventory invariant is unchanged: product creation does not increase stock; Receive Stock remains authoritative.
- No database migration is required.

<!-- OCR_BULK_PRODUCT_SYNC_DEPLOYED_20260902 -->
### Production evidence
OCR Product Master synchronization fix deployed to production from code SHA `81fec0f2a683e22b2b033d3393567c25603d3886`. Public static root/assets and Vite runtime configuration verification passed. Production URL: `https://wineshoppos.z29.web.core.windows.net/`

<!-- POS_SALES_RECEIPT_REPORT_SORT_20260902 -->
## 2026-09-02 — POS sale visibility, durable receipt, reports refresh and list sorting
Live verification found completed POS sales and stock deductions in Supabase while the UI Sales collection could remain stale when an unrelated Purchases refresh failed. ShopContext now publishes Sales and Purchases independently. POS opens `/sales/:id?print=1`; Sale Details can fetch the exact committed sale directly from Supabase and auto-request printing. Reports refreshes current shop transactions before chart calculations. Read-only list tables use shared sortable headers (`↕`, `↑`, `↓`); editable transaction-entry/reconciliation grids remain fixed-order. No DB migration or Logic App change.

<!-- POS_SALES_RECEIPT_REPORT_SORT_DEPLOYED_20260902 -->
### Production evidence
POS/Sales/Receipt/Reports/list-sorting reliability release deployed from code SHA `e592877cf57954ee4b29fcc7daf6e98b395bc5d1`. Public root, referenced assets and Vite runtime configuration verification passed. Production URL: `https://wineshoppos.z29.web.core.windows.net/`.

Live Supabase verification before this release showed three completed Royal 21 POS sales already committed with sale items/payments; those historical sales must not be repeated merely because the old frontend list was stale.

<!-- SALES_SPLIT_LOADER_20260902 -->
## 2026-09-02 - Sales split-loader hardening
Live verification confirmed three completed POS sales already exist with sale items/payments and ADMIN RLS can read them. Do not repeat those bills merely because the browser list is empty.

Sales history now loads authorized sale headers first, then sale items and payments separately and merges them in React. Child enrichment failure can no longer erase valid sale headers. Receipt fallback uses the same split direct-read pattern. Sales UI also displays refresh errors instead of silently showing an empty table. No DB migration is required.

<!-- AUTOPRINT_SRNO_SHIFT_CASH_20260902 -->
## 2026-09-02 — Auto Print, list serial numbers, FIFO/Ageing sorting and Shift actual-cash controls
- Receipt auto-print is a per-device preference, default OFF. Checkout always opens the saved receipt; ON additionally requests the browser print dialog.
- POS Billing and Printer Settings expose the same Auto Print ON/OFF device preference.
- Shared SortableTable injects Sr. No. after current sorting. Inventory Ageing and FIFO Rotation Queue now also use SortableTable.
- Shift Actual Cash is no longer initialized to zero. Cashiers must physically count and explicitly enter Actual Cash before Request Close.
- CLOSE_REQUESTED Actual Cash can be corrected through audited RPC revise_shift_actual_cash; variance is recalculated before approval. Non-zero variance requires explicit approval confirmation.
- Live migrations 20260901204924 (sale_items authenticated SELECT) and 20260901211003 (shift actual-cash correction) are now recorded in Git.

<!-- PREMIUM_UI_PRODUCT_IMAGES_FIFO_PRIORITY_20260902_V2 -->
## 2026-09-01 — Premium UI / product images / stable FIFO-Age priority / executor hardening
- New release executors derive live shared `origin/main == origin/V3` base at runtime; stale hardcoded release SHA is forbidden. Failure history is tracked in `docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md`.
- Subtle WineShop POS cheers/splash/name reveal animation with reduced-motion support.
- Royal 21 shop context receives subtle gold treatment.
- Duplicate topbar Light/Dark removed; Theme remains under My Account → Account Settings.
- Top-right User Menu layering hardened against clipping/burial.
- Static product images use live migration `20260901213751_product_images_v1`: `products.image_path`, `product-images` bucket, 5 MB JPEG/PNG/WebP limit, shop-scoped ADMIN/MANAGER writes, and narrow image RPCs.
- Images display in Product Master, Inventory and POS.
- Normal read-only sortable lists retain Sr. No.
- Ageing/FIFO deliberately disable generic Sr. No. and use stable Product Ref + per-product Age/FIFO Priority. FIFO Priority 1 means SELL FIRST and does not change when another column is sorted.
- Auto Print and Shift Actual Cash controls are inherited from the immediately previous successful release.
