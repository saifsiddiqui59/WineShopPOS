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

<!-- BRAND_THEME_REFINEMENT_20260902_V3 -->
## 2026-09-01 — Approved brand animation + theme refinement
- Replaced the weak outline-icon animation with a custom SVG mark containing two gold-rimmed wine glasses with burgundy wine.
- On layout load the glasses move together for a brief cheers, a small clink spark/wine droplet effect appears, a burgundy reveal streak crosses the brand name, and WineShop POS settles into a metallic-gold wordmark.
- Brand animation replays on hover/focus/click and does not automatically loop.
- Royal 21 is visibly larger and uses metallic gold text with an approximately one-second shimmer sweep within each six-second cycle.
- Existing Account Settings theme model remains authoritative: SYSTEM, LIGHT, DARK. The topbar theme shortcut remains removed.
- Dark theme receives charcoal/black + wine/burgundy + restrained gold accents. Light theme receives warm white/light-neutral surfaces + wine/burgundy + restrained gold accents.
- All brand/shimmer motion respects `prefers-reduced-motion`.
- Visual UAT remains manual; automated checks must not label animation appearance PASS before authenticated browser confirmation.

<!-- REFERENCE_BRANDING_TRUE_BLACK_20260902_V4 -->
## 2026-09-01 — Reference-scale branding and true-black Dark theme
Visual UAT showed Royal 21 remained too small and Dark mode retained a navy cast. The approved supplied reference is now the target: large centered Royal 21 with crown, gold serif treatment, ornamental underline and restrained rays/shimmer; larger sidebar WineShop POS lockup; true black/charcoal Dark mode.

Implementation:
- topbar becomes page context | centered shop identity | online/user controls;
- Royal 21 gets a dedicated hero lockup with six-second shimmer cycle;
- Dark theme surfaces move to near-black/charcoal instead of dark blue;
- Light mode remains available through Account Settings.

<!-- BRAND_SPIRIT_TILE_V6_CANONICAL -->
## 2026-09-01 — Premium brand, real sidebar collapse, spiritual image tile
WineShop POS now uses a five-stage 1.6-second gold-glass / burgundy-splash brand sequence. Sidebar collapse physically shrinks the rail to 76px and expands main content. A browser-local shop-specific spiritual image tile sits below Settings & Admin with + upload, drag/drop, remove and vertical resizing.

<!-- EXACT_REFERENCE_PIXEL_ANIMATION_V7 -->
## 2026-09-01 — Exact approved storyboard pixels used for brand animation
The previous custom SVG versions were rejected in manual UAT because their artwork was simpler than the approved storyboard. V7 changes implementation strategy: the approved storyboard itself is the source.

Production assets:
- `/brand/wineshoppos-storyboard-sprite.png` — five exact cropped WineShop POS storyboard stages.
- `/brand/wineshoppos-final-lockup.png` — exact final sidebar lockup from the approved "How it looks in the app" reference.
- `/brand/royal21-storyboard-sprite.png` — four exact Royal 21 storyboard stages.

React/CSS only sequences these pixels. WineShop POS uses the five stages across 1.6 seconds and replays on hover/focus/click. Royal 21 runs the exact four-stage sequence at the start of each six-second cycle and holds the final state for the remainder. Light mode intentionally keeps the black premium artwork card rather than altering the approved pixels.

<!-- ROYAL21_CROWN_COST_V8 -->
## 2026-09-01 — Royal 21 crown-only motion + Azure cost diagnostic
- WineShop POS left branding is explicitly frozen and untouched.
- Royal 21 no longer uses a stretched sprite. It is rendered as stable metallic-gold text with ornament.
- Only the crown moves: continuous 360-degree rotation over 8 seconds.
- Royal 21 is constrained to a 72px lockup inside an 82px topbar hero area; consolidated topbar is fixed at 88px so the shop identity cannot overlap the page/POS Billing content below.
- Added `scripts/diagnostics/check-azure-cost-readonly-v3.sh`, a read-only Azure billing diagnostic covering Logic App state, Function plans, Storage capacity/transactions, AI/Cognitive accounts, monitoring resources and robust month-to-date cost by service/resource/meter.

<!-- ROYAL21_Y_AXIS_DARK_TILE_V9 -->
## 2026-09-01 — Royal 21 Y-axis crown + wider center lockup + dark spiritual tile
- WineShop POS left branding remains untouched.
- Royal 21 crown now revolves on its Y axis (`rotateY`) rather than rotating like a clock.
- Royal 21 name uses a wider text lockup (`scaleX`) with larger metallic-gold typography for stronger center visibility.
- Topbar center brand remains vertically constrained to prevent overlap with POS/Billing or other page content.
- Dark-mode spiritual/devotional tile surfaces are forced to solid `#050505`.

<!-- ROYAL21_3D_SHIMMER_PITCH_BLACK_V10 -->
## 2026-09-01 — Royal 21 true 3D crown + full-tile shimmer + pitch black
- WineShop POS left branding remains untouched.
- Royal 21 crown now uses a stronger 3D effect with layered depth and a Y-axis revolve rather than a flat 2D spin.
- The premium Royal 21 tile is explicitly pitch black (`#000000`) and has a full-width shimmering light pass that fades toward the left and right edges.
- The devotional/spiritual tile in Dark mode is also forced to pitch black (`#000000`).
- Topbar containment remains enforced so center branding never overlaps page content below.

<!-- USER_CROWN_FULL_HERO_PITCH_BLACK_V11 -->
## 2026-09-02 — User-supplied Royal crown + full center hero + pitch-black Dark mode
- WineShop POS left branding remains untouched.
- The user-supplied jeweled crown is converted from the uploaded checkerboard JPG into an optimized transparent PNG and stored at `/public/brand/royal21-crown-user-v11.png`.
- Royal 21 uses the crown as a double-sided 3D Y-axis rotor.
- The premium effect now belongs to the entire `topbar-shop-hero` center lane rather than a small black badge around the shop name.
- The full center lane has a restrained gold bloom and six-second shimmer fading at both ends.
- Dark mode forces body/app/main/page/module shell/module content/sidebar/topbar to pitch black and neutral panels to near-black, removing the visible navy/blue cast.
- Spiritual image tile remains pitch black in Dark mode.

<!-- DEMO_SAFE_ROYAL_HERO_V12 -->
## 2026-09-02 — Demo-safe Royal 21 hero refinement
A CSS-only visual refinement matches the approved premium mockup more closely while locking application logic. The complete center header lane carries subtle gold rays and a light eight-second shimmer. The existing user-supplied jeweled crown remains the source asset and receives a globe-like Y-axis self-rotation treatment. Royal 21 is larger and centered. The header is enforced as a three-zone grid so Shop Admin/UserMenu cannot be buried by the hero. Dark application/module surfaces are explicitly pitch black while cards remain near-black for visual separation.

<!-- FORT_ONLY_TOP_HERO_V14B -->
## 2026-09-02 — Fort-only center header
For the immediate demo, the approved Rajasthan-inspired fort SVG occupies the center topbar hero. Royal crown/name/ornament visuals are hidden, while ShopSelector stays mounted so authorization/shop-switching behavior is unchanged. WineShop POS, Layout, UserMenu, SpiritualImageTile and POS JSX remain unchanged.

<!-- EXACT_USER_REFERENCE_BANNER_V15 -->
## 2026-09-02 — Exact supplied Royal 21 banner
The center header now uses the user's supplied Rajasthan fort/crown/Royal 21 artwork itself, cropped only to remove unused vertical black space for header fit. The previous rotating crown/name/ornament UI remains mounted but visually hidden. No React/business logic was changed.

<!-- PRODUCT_MASTER_OCR_PREVIEW_V1 -->
## 2026-09-02 — V3 preview: Product Master/OCR usability fixes
Preview-only V3 change set; not promoted to production main.
- Product Master list shows MRP between Purchase and Selling.
- Product Name column is wider with stronger readable typography and balanced widths.
- Single-product OCR onboarding forwards inferred Size (ml), OCR MRP and default Selling = MRP + ₹15.
- Bulk OCR resolves size from structured size evidence first, then ml/cl/l product/package text, and defaults Selling = MRP + ₹15.
- Selling remains editable; a customized Selling value is not overwritten by later MRP edits.
- Product edit drafts survive background Product Master refresh.
- Preview deployment is isolated at `/v3-preview/`; production main/root remains unchanged.

<!-- PREVIEW_CURATED_7_PRODUCT_IMAGES_V4 -->
## 2026-09-02 — V3 preview curated images for current seven products
The seven currently active Royal 21 demo products have preview-only product-image fallbacks keyed primarily by barcode. Existing Supabase-uploaded product images retain first priority; a curated fallback is used only when `imageUrl` is empty. This avoids changing the existing product-image upload/storage workflow.

Current preview mappings cover:
- Carlsberg Elephant Strong 650 ml bottle
- Carlsberg/Cartsberg Elephant Strong 500 ml can
- Tuborg Classic with Scotch Malts 650 ml bottle
- Tuborg Classic with Scotch Malts 500 ml can
- Tuborg Strong 650 ml bottle
- Tuborg Strong 500 ml can
- Tuborg Strong 330 ml bottle

The exact supplied Rajasthan/Royal 21 center banner remains the header source and receives only subtle background pan/glow/light-sweep motion. Existing WineShop POS animation remains unchanged.

These are preview/reference images. Before commercial production promotion, replace any third-party demo image with a supplier/manufacturer-approved asset using the existing Product Image upload provision.

<!-- V5A_RESPONSIVE_RESIZABLE_PREVIEW_20260902 -->
## 2026-09-02 — V5-A responsive shell, resizable Product Master columns, preview isolation
V3 preview only. The application shell now adapts across desktop, laptop, tablet and phone widths. Mobile navigation becomes an off-canvas drawer instead of permanently consuming a 72px rail. Page/panel/grid sizing is constrained to the viewport, while data-heavy tables keep safe horizontal scrolling.

Product Master uses the shared SortableTable resizing capability. Users can drag header dividers, widths persist in browser localStorage, and Reset column widths restores defaults. Sorting remains available.

The `/v3-preview/` build no longer registers its own service worker. It may unregister an old service worker only when that registration's scope is already `/v3-preview/`; it never unregisters the production-root registration. Production service-worker cache cleanup is also restricted to WineShopPOS-owned cache keys.

Manual authenticated UAT is still required at 1920×1080, 1536×864, 1366×768, 1024×768, 768×1024 and 390×844 before production promotion.


<!-- MANDATORY_EXECUTOR_FAILURE_REGISTER_PRE_READ_20260902 -->
## Mandatory executor failure-register pre-read
Before creating or running any WineShopPOS patch/executor/continuation, read `docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md` from the current target branch in full. Reuse its verified resolutions for Git safety, Windows/Git Bash path conversion, authentication mode, CLI behavior, dependency/library issues, Vite environment injection, preview/production isolation and verification labeling. A new failure must be recorded in that register before the next continuation is created.

<!-- V5A1_ONE_SIDED_COLUMNS_RESPONSIVE_REFINEMENT_20260902 -->
## 2026-09-02 — V5-A.1 table and viewport refinement
V3 preview locks all measured table widths at resize start. Dragging the right edge of a column changes only that column width; the selected column's left edge and every earlier boundary remain fixed. Responsive ownership was refined so the existing fixed desktop sidebar and main-area offset do not compete with a second width calculation. Manual visual UAT remains required.

<!-- V5B_PURCHASE_CORRECTION_OCR_PACK_SAFETY_20260902 -->
## 2026-09-02 — V5-B completed purchase correction and OCR pack safety
V3 adds an audited completed-purchase-line correction workflow. The supplier line value is immutable; correcting Cases/Bottles-per-Case/Loose recalculates final bottles and the internal per-bottle/base/landed unit costs. Inventory and the unconsumed FIFO receipt lot move in the same transaction and a STOCK_CORRECTION movement plus audit/correction-history record is written. Simple correction is blocked after any unit from that receipt lot has been consumed.

Packaging heuristics are suggestions, not truth: CAN of any size suggests 24/case; glass/bottle/beer under 500 ml suggests 24/case; large beer 501–750 ml suggests 12/case. Printed bottle-total evidence is stronger. Existing Product Master stays authoritative for known products, and conflicts require review/confirmation before Receive Stock.

Purchase Price/Bottle user input is restricted to 2-decimal entry/display behavior; internal FIFO landed cost may retain 6-decimal precision.

<!-- V5C_PURCHASE_VERIFICATION_FIFO_TABLE_USABILITY_20260903 -->
## 2026-09-03 — V5-C verification/FIFO table usability
Unknown retained OCR pack evidence is now REVIEW, not a quantity MATCH. Financial variance is shown explicitly. Purchase/correction views show Size (ml). Purchase verification/correction, Ageing and FIFO tables opt into persisted right-edge-only resizing. True Receipt Ageing shows friendly Box Mark and keeps the technical lot in a tooltip; FIFO labels the raw value Technical Lot.

<!-- V5D_ACTIONABLE_VERIFICATION_FRIENDLY_FIFO_20260903 -->
## 2026-09-03 — V5-D actionable verification + friendly FIFO receipt references
Purchase Verification separates historical OCR evidence from resolved business state. OCR evidence may remain amber/unconfirmed; Pack Resolution becomes green when strong OCR agrees or an audited pack correction exists. Status tiles are clickable and navigate to posted lines, OCR evidence, financial reconciliation or correction history.

Financial Reconciliation displays Product Value + Freight + Transport/Handling - Discounts + Misc/Round = WineShopPOS Landed Total, then compares OCR Printed Total and shows the unreconciled difference. V5-D never silently changes a received financial total.

Ageing/FIFO primary human lot label is Receipt Ref derived from supplier first token + receipt date in DD/MM form, e.g. METRI-02/09. Technical database lot remains unchanged and is available in the tooltip.

<!-- V5E_HYBRID_VERIFICATION_ENGINE_20260903 -->
## 2026-09-03 — V5-E
V5-E hybrid purchase verification: Active Exceptions + Resolution State + Historical Evidence. Amber only for open actions; green for resolved; historical OCR neutral. Financial verification decisions are audited separately and never mutate purchase totals, inventory, FIFO or OCR. Defaults: ₹1 auto tolerance, ₹10 manager-review threshold. Technical FIFO lot removed from normal UI.

<!-- V5F_PRODUCT_MASTER_FIRST_EXTERNAL_ENRICHMENT_20260903 -->
## 2026-09-03 — V5-F Product Master-first external enrichment
Invoice OCR resolution order is Product Master -> learned OCR alias -> external enrichment only when unresolved/uncertain. resolve_product_master_text adds size-aware scoring. Human-confirmed OCR mappings use audited remember_product_alias.

product-enrichment is a JWT-protected Supabase Edge Function. UPCitemdb performs text discovery to obtain barcode candidates; top barcode candidates are enriched from Open Food Facts. Results are suggestions only, cached per shop/query for 30 days, and never mutate Product Master or stock automatically.

Find Product Info appears only on unresolved/uncertain OCR lines. If an external candidate barcode already exists locally, WineShopPOS links the existing Product Master product instead of creating a duplicate. External images are reference previews only.

<!-- V5G_OWNER_CENTER_QUALITY_20260903 -->
## 2026-09-03 — V5-G Owner Center quality pass
Owner Center now consumes `loss_control_exceptions_v3`, which excludes a stock movement from active Loss & Exceptions only when it is strictly proven to be the same audited purchase correction (purchase/product/quantity/timestamp/reason all match). Generic STOCK_CORRECTION activity remains reviewable.

`loss_control_resolved_activity_v1` exposes those legitimate purchase corrections in a separate green Resolved / Audited Activity section with a direct purchase link. The Owner Overview also uses the corrected active feed.

Profit Intelligence SKU Profitability enables persisted one-sided column resizing. Recommendations gains explicit lookback/refresh. WhatsApp Summary gains refresh/copy while sending remains manual.

The top header shop control is restored to the compact shop-name selector treatment. The WineShopPOS sidebar animation is untouched and Royal21 assets are retained.

<!-- V5G1_INVENTORY_RESIZE_20260903 -->
## 2026-09-03 — V5-G.1 Inventory Current Stock column resizing
Inventory > Current Stock now opts into the existing one-sided persisted SortableTable resize engine using `resizeKey="inventory-current-stock-v1"`. No inventory logic, stock adjustment workflow, database schema, FIFO or Owner Center logic changed.

<!-- V5H_FAST_POS_AND_HEADER_FIX_20260903 -->
## 2026-09-03 — V5-H Fast POS register + premium header correction
The accidental compact Royal 21 shop-name pill from V5-G is removed. Premium Royal 21 shops again use the established full center RoyalHero lockup and invisible shop-switch layer. Existing Royal animation CSS, user crown asset, topbar background effects and WineShopPOS sidebar animation are not modified by V5-H.

Fast POS Billing adopts a Square-inspired retail-register interaction model while preserving WineShopPOS transaction logic: large scan/search dock, category/quick-product tiles, one-tap item add, sticky current-sale panel, compact quantity/price controls, collapsible Customer & Offers, prominent amount-to-collect and CASH/UPI/CARD actions.

The existing barcode handler, stock guard, session cart persistence, customer/loyalty/store credit/gift voucher quote, price/discount approval, offline-sale support, auto print and completeSale backend flow remain in place.

Inventory Current Stock resizing was already committed on V3 before V5-H (`resizeKey=inventory-current-stock-v1`); V5-H rebuilds and redeploys current V3 so that change reaches preview.

## V5-F.1 rebuilt OCR/enrichment UAT correction — 2026-09-03

- Single exact normalized supplier match auto-confirms.
- Product Master line resolution runs in parallel after supplier confirmation.
- OCR stage timing is visible for diagnosis.
- Zero product-line difference uses a concise success message.
- Weak Product Master candidates are not presented as reliable matches.
- `Search Product Catalogue` moved into Product Resolution.
- Live `product-enrichment` version 6 keeps JWT verification, cache version 2, UPCitemdb 404-as-no-match, and independent Open Food Facts search.
- Raw provider HTTP errors are not user-facing catalogue results.
- No-result catalogue flow offers OCR-prefilled product creation.
- OCR creation passes inferred brand/category and uses `Other` rather than incorrectly defaulting OCR products to Whisky.
- Single create/return records the actual new Product Master item as the linked row.
- Confirm Line visibly reports alias learning.
- Inventory search restored.
- Global resize instruction removed and `Sr. No.` made resizable.
- No Receive Stock, inventory, FIFO, sales, Logic App or Azure AI mutation is part of this patch.
