# WineShopPOS Developer Handbook — Master Reconsolidation

<!-- WINEPOS_V2_CURRENT_BEGIN -->
## Current V2 Production State — Canonical Update

**Current product/documentation generation: V2**

> This section supersedes older statements elsewhere in this historical
> handbook when they conflict with current production state. Older references
> to LocalStorage-only architecture, future/planned Supabase, hidden/future AI,
> or a deferred Owner Assistant are historical implementation notes.

### Current architecture

- React + Vite frontend
- Supabase PostgreSQL/Auth/RLS/RPC backend
- organizations + UUID shops + `user_shop_memberships`
- ADMIN / MANAGER / CASHIER roles
- transaction-safe backend/database stock-changing operations
- Azure Blob static hosting
- current OCR/offline/backup foundations
- production WineShopPOS AI Owner Assistant

### Critical protected workflows

```text
Login

Scan
→ cart
→ payment
→ sale
→ inventory deduction
→ receipt

Purchase / PO / GRN
→ receiving
→ inventory increase
→ stock movement

Return/refund
Sale void
Shift open/close
Physical stock count
Stock adjustment
Stock transfer
Multi-shop/RLS
Offline queue
OCR invoice review
Owner Center
AI Owner Assistant
```

### Verified production AI

```text
AI:
VERIFIED WORKING

Function:
wineshoppos-ai-1a61d5885c
Central India
Consumption Y1

Foundry:
wineshoppos-ai-in-1a61d5885c
South India
project wineshoppos-ai

Model:
gpt-5-mini
version 2025-08-07
GlobalStandard

Agent:
WineShopPOS-Owner-Agent
```

Runtime authorization:

```text
Supabase logged-in session/access token
→ Azure Function
→ auth.uid()
→ user_shop_memberships
→ authorized organization/shop
```

Function-to-Foundry uses the Function system-assigned managed identity with
required Foundry project-level User access.

Production record indicates AI migration `20260830070000` is applied.

### V2 engineering program

Before adding a requested V2 feature, inspect the current implementation and
classify it:

```text
EXISTING
PARTIAL
MISSING
NEEDS TESTING
BROKEN
```

V2 requested areas:

- Landed Cost Engine
- Receipt Lot / Batch Tracking
- True Stock Ageing
- FIFO / Stock Rotation Foundation
- Discount / Price Override Control
- Standardized Reason Codes
- Accountant / Tally-ready Export
- Customer Loyalty
- Coupons / Promotions
- Gift Voucher / Store Credit
- Supplier Performance Score
- Advanced Stock Transfer
- Approval Center Expansion
- Leakage Shield Expansion
- Purchase Coach Expansion

Existing Purchase/PO/GRN, OCR, returns, sale void, shifts, counts, adjustments,
transfers, multi-shop, Leakage Shield, Purchase Coach, supplier intelligence,
offline, backup, scanner, receipt printing, RLS and AI should be verified and
extended rather than rebuilt.

### AI observability / next quality milestone

```text
Foundry server-side tracing infrastructure CONFIGURED
→ authenticated production trace verification
→ automated trace evaluations
→ numeric/tool/tenant correctness
→ deployment quality gates
→ monitoring/dashboarding
```

Tracing resources:
- Application Insights: `wineshoppos-ai-insights`
- Log Analytics: `wineshoppos-ai-law`
- Foundry connection auth: `ProjectManagedIdentity`
- project MI ingestion role: `Monitoring Metrics Publisher`
- project MI trace-read role: `Log Analytics Reader`


AI failure must never break core POS availability.

### Documentation rule

This master handbook remains the single developer/operations handbook.
V2/V3/etc. update this file in place. Version history is preserved in Git and
the chapter records under `docs/chapters/`.
<!-- WINEPOS_V2_CURRENT_END -->

Version: 2026.08 Master Reconsolidation

## 1. Purpose

This handbook is the canonical engineering guide for the WineShopPOS reconsolidated application. It must be read together with the repository code, migrations and actual Git code-history. The repository remains the primary source of truth when documentation and code disagree.

The release does not rebuild WineShopPOS. It preserves the existing Supabase transaction engine and reorganizes the experience into eight predictable modules while adding genuine missing capabilities.

## 2. Production Architecture

```text
USB/Bluetooth Barcode Scanner
        ↓ HID keyboard events
React + Vite SPA
        ↓ Supabase publishable client
Supabase Auth
        ↓
PostgreSQL + RLS + Security-Definer RPCs
        ↓
Products / Inventory / Sales / Purchases / Stock Movements
        ↓
Azure Blob Static Website frontend

Invoice PDF/Image
        ↓
Supabase ocr-invoice Edge Function
        ↓ server-side secret
Azure AI Document Intelligence F0
        ↓ extracted draft only
Human review
        ↓
Controlled purchase receipt RPC
```

### Production resources

- Azure Resource Group: `wineshopPOS`.
- Azure Storage Account: `wineshoppos`.
- Static website: `https://wineshoppos.z29.web.core.windows.net/`.
- Supabase project ref: `uiurgplnsgmawvxhjzzp`.
- Document Intelligence resource: `wineshoppos-docintel-45b7d2b9`, `FormRecognizer`, F0, Central India.

Never put the Supabase service-role key or Azure OCR key in the React bundle or Git.

## 3. Core Architectural Rules

### Preserve the engine

Sales, purchases, returns, counts, transfers, stock adjustments and offline synchronization must reuse controlled database operations. React is an orchestration/UI layer and must not directly set arbitrary inventory quantities.

### Tenant isolation

Every shop-scoped business query must remain constrained by RLS/security-definer functions. Organization membership is additionally required for cross-shop transfer destinations.

### Role security

Frontend route/menu hiding improves UX but is not security. Database RLS/RPC validation remains authoritative.

### Tier metadata

CORE has no badge. PLUS and PRO are visual/product classification only. This release does not add plan enforcement, payment-provider integration or RLS tier gating.

## 4. Final Application Navigation

The primary sidebar contains only:

1. POS & Billing
2. Products
3. Purchases & Suppliers
4. Inventory
5. Operations
6. Owner Center
7. Reports & Compliance
8. Settings & Admin

Cashiers see only relevant modules. Managers see operating modules. Admins see authorized full-shop administration. AI Owner Assistant is production-active; see Current V2 Production State.

## 5. Account and Shop Context

The top bar provides:

- current page title and breadcrumb,
- current shop context,
- online/offline state,
- user avatar and account menu.

The account menu provides My Profile, Account Settings, Security, Help & Manual and Logout.

Safe self-editable profile fields:
- display name,
- phone,
- avatar URL,
- UI theme preference.

The user cannot self-edit:
- email identity,
- role,
- shop security assignment.

`user_shop_memberships` provides a future-safe many-shop membership model. The current `profiles.shop_id` remains the active shop context so existing RPC/RLS helpers continue to work.

## 6. Module 1 — POS & Billing

### Fast billing

The existing global scanner engine is preserved. Rapid keystrokes ending in Enter are treated as scanner input. Repeated scans increment quantity. Unknown barcode shows Product Not Found and links to Add Product with the barcode prefilled.

The cashier mental model remains:

**Scan → Cart → Pay → Print.**

### Customer attachment

Online POS can optionally attach an existing customer to the sale through `link_sale_customer()`. Customer selection is optional and does not slow walk-in billing.

Udhaar/credit ledger posting is intentionally management-controlled under Operations rather than silently changing payment behavior in the core sale RPC.

### Payment policy

Cash, UPI and Card are operator-recorded. No bank/payment gateway integration is introduced.

## 7. Module 2 — Products

Existing product CRUD is retained.

The release adds CODE128 barcode label generation with `jsbarcode`. Label output uses browser printing so the operator can select an installed label printer. Paper size and printer calibration require a real-hardware test.

## 8. Module 3 — Purchases & Suppliers

### Procurement lifecycle

New lifecycle:

```text
DRAFT
  ↓ Submit
APPROVAL_PENDING
  ↓ Approve
APPROVED
  ↓ Mark Sent
SENT
  ↓ Receive
PARTIALLY_RECEIVED / RECEIVED
```

Receiving continues to call the controlled purchase receipt engine, so inventory changes and stock movements remain transaction-safe.

### Smart Purchase Intelligence — PRO

Combines:
- existing Azure invoice OCR review,
- purchase-price history,
- supplier price comparison,
- supplier purchase/payment/return statistics,
- current selling-margin impact.

OCR never changes stock directly.

## 9. Module 4 — Inventory

Existing stock overview and physical stock count are preserved.

### Advanced Transfers — PLUS

New lifecycle:

```text
REQUESTED
  ↓ destination approve
APPROVED
  ↓ source dispatch
DISPATCHED
  ↓ source marks transit
IN_TRANSIT
  ↓ destination receives
RECEIVED
  ↓ destination completes
COMPLETED
```

Important accounting behavior:
- Approval does not change stock.
- Dispatch decreases source stock and records `TRANSFER_OUT`.
- Receive increases destination stock and records `TRANSFER_IN`.

Legacy transfers whose old `APPROVED` state already moved stock are converted to `COMPLETED` before the new constraint is installed.

### Inventory Intelligence — PRO

`inventory_health()` calculates deterministic classifications using recent sales and current stock:
- OUT_OF_STOCK,
- STOCKOUT_RISK,
- DEAD,
- OVERSTOCK,
- FAST,
- SLOW,
- HEALTHY.

`stock_explanation()` groups movement history so the user can reconcile stock from auditable movements rather than opaque inventory numbers.

## 10. Module 5 — Operations

### Shift & Day Close

Existing shift workflows remain intact, including protection against unsafe closing while offline sales are pending/conflicting.

### Expense Management

New tables:
- `expense_categories`,
- `expenses`.

Expenses are immutable operational records except controlled VOID with reason. They feed operating-profit calculations.

Default categories seeded for each shop:
- Rent,
- Salary,
- Electricity,
- Transport,
- Maintenance,
- Miscellaneous.

### Approval Center

The centralized Approvals screen composes existing approval engines instead of duplicating them. It surfaces pending return requests, shift closes, stock counts, transfer requests and purchase orders awaiting approval.

### Customer & Credit — PLUS

New tables:
- `customers`,
- `customer_credit_entries`.

Ledger types:
- CHARGE,
- PAYMENT,
- ADJUSTMENT_CREDIT,
- ADJUSTMENT_DEBIT.

Balance is derived from ledger entries rather than storing a mutable outstanding field.

## 11. Module 6 — Owner Center

### Owner Control Center — PRO

`owner_center_summary()` provides deterministic shop KPIs for a date range:
- revenue,
- bill count,
- COGS,
- gross profit,
- expenses,
- operating profit,
- purchases,
- approved returns,
- cash variance,
- low-stock SKU count,
- inventory cost.

### Profit Intelligence — PRO

New sale-item cost snapshots record the product purchase cost at sale-item insert time. This enables later profit analysis without relying solely on the current product cost.

Formula:

```text
Revenue - COGS = Gross Profit
Gross Profit - Expenses = Operating Profit
```

Historical sales created before cost snapshots may be incomplete. The UI explicitly warns about this limitation.

### Audit & Loss Control — PRO

Rule-based exception detection looks for high/medium review conditions such as:
- cash variance,
- significant approved refunds,
- significant discounts,
- unusual stock adjustments.

The system uses neutral terms such as **Requires Review** and does not label employees as fraudulent.

### Recommendations — PLUS

`owner_recommendations()` combines reorder, inventory health and shift variance signals into actionable cards.

### Owner WhatsApp Summary — PLUS

The app generates text and opens WhatsApp/WhatsApp Web using `wa.me`. The user chooses the recipient and manually sends. There is no WhatsApp API, scheduled sending or background alert.

## 12. Module 7 — Reports & Compliance

### Reports & Exports

The release adds CSV exports for:
- sales,
- purchases,
- current inventory,
- expenses.

This is a safer first integration step for accountants/Tally than an unvalidated direct accounting API.

### Liquor Compliance Foundation

`compliance_profiles` stores verified shop/license metadata. The application does not invent state excise rules or claim generic legal compliance.

State-specific registers and formulas must be implemented only after verified requirements are supplied.

## 13. Module 8 — Settings & Admin

### Users

The existing `manage-shop-users` Edge Function remains server-side and service-role protected. It is extended so a newly created Manager/Cashier also receives a `user_shop_memberships` row.

Shop Admin still cannot create another Admin.

### Hardware

The Hardware landing screen consolidates:
- scanner diagnostics,
- receipt printer settings,
- barcode-label printing entry point.

### Backup & Recovery

The operational JSON snapshot is retained but is explicitly described as **not a PostgreSQL backup**.

`backup_restore_tests` stores evidence of restore drills performed in a separate environment. Production backup readiness is not considered proven until a real restore test succeeds.

## 14. Database Migration

Migration:

`supabase/migrations/20260829233000_master_reconsolidation.sql`

New tables:
- `user_shop_memberships`,
- `expense_categories`,
- `expenses`,
- `customers`,
- `customer_credit_entries`,
- `compliance_profiles`,
- `backup_restore_tests`.

Existing tables extended:
- profiles: phone/avatar/theme,
- sales: optional customer,
- sale_items: cost snapshot,
- purchase_orders: approval metadata/status lifecycle,
- stock_transfers: dispatch/receive/complete metadata/status lifecycle.

Major new/extended RPCs:
- `update_my_profile`,
- `my_shop_memberships`,
- `switch_shop`,
- `record_expense`,
- `void_expense`,
- `create_customer`,
- `link_sale_customer`,
- `record_customer_credit`,
- `customer_balances`,
- `upsert_compliance_profile`,
- `record_backup_restore_test`,
- `submit_purchase_order`,
- `approve_purchase_order`,
- `dispatch_stock_transfer`,
- `mark_stock_transfer_in_transit`,
- `receive_stock_transfer`,
- `complete_stock_transfer`,
- `supplier_price_comparison`,
- `supplier_intelligence`,
- `stock_explanation`,
- `inventory_health`,
- `owner_center_summary`,
- `profit_by_product`,
- `loss_control_exceptions`,
- `owner_recommendations`.

## 15. RLS and Security

New business tables have RLS enabled.

Key access rules:
- expenses: Admin/Manager current shop,
- customer master: current authenticated shop; credit ledger: Admin/Manager,
- compliance: Admin/Manager read, Admin-controlled update RPC,
- backup restore-test evidence: Admin only,
- user memberships: own memberships or platform admin.

The migration revokes broad `sale_items` SELECT and re-grants safe non-cost columns to authenticated clients. Profit/cost analytics read through security-definer functions.

## 16. Offline Reliability

The existing encrypted IndexedDB emergency queue and idempotent sync remain untouched by the reconsolidation.

Offline architecture remains:

```text
cached product snapshot
→ local emergency sale with globally unique client ID
→ encrypted queue
→ reconnect
→ controlled sync RPC
→ server inventory validation
→ synced or conflict
```

The server is never overwritten with locally calculated inventory.

## 17. OCR

Azure Document Intelligence F0 remains the OCR engine. The Edge Function retains server-side OCR credentials.

Workflow:

```text
Invoice PDF/photo
→ prebuilt-invoice extraction
→ matching suggestions
→ human review/correction
→ Receive Stock confirmation
→ transaction-safe purchase receipt
```

Real invoices and F0 limits must be tested operationally.

## 18. Frontend Shared UX System

Reusable components include:
- `PageHeader`,
- `SectionHeader`,
- `FeatureTierBadge`,
- `StatusBadge`,
- `MetricCard`,
- `EmptyState`,
- `LoadingState`,
- `ErrorState`,
- `UserAvatar`,
- `ShopSelector`,
- `ActionMenu`,
- `ConfirmationDialog`,
- `SearchFilterBar`,
- `MoneyDisplay`,
- `QuantityDisplay`.

The new shell intentionally contains only eight primary sidebar items. Secondary capabilities live as module tabs.

## 19. Deployment

The one-command installer:

1. detects the actual repo root,
2. preserves tracked work,
3. fast-forward pulls,
4. runs baseline build/lint,
5. tags a checkpoint,
6. overlays the release,
7. installs `jsbarcode`,
8. runs production build,
9. runs Supabase migration dry-run,
10. applies migration,
11. deploys `manage-shop-users`,
12. builds again,
13. deploys Azure Blob static site,
14. creates release commit,
15. generates actual Git code-history,
16. commits docs,
17. performs one final Git push.

## 20. Rollback Principles

Do not delete production transaction history to roll back a feature.

Frontend rollback can deploy a checkpoint build. Database rollback must use a reviewed forward-fix/reversal migration because the migration is already recorded remotely.

## 21. Regression Testing

The canonical matrix is:

`docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md`

A feature is not considered fully operational merely because the build passes. Hardware, offline, OCR and restore workflows require real-world validation.

## 22. Known Boundaries

- Silent raw ESC/POS printing is not guaranteed by a static browser; browser/system printing remains the safe cross-printer path.
- Barcode labels require printer/paper calibration.
- Customer loyalty is implemented in V2; see the canonical current-state section.
- Compliance legal rules are deferred until verified.
- AI Owner Assistant is live in production; see the current AI baseline.
- Voice AI is hidden/deferred.
- PLUS/PRO do not enforce payment plans yet.

## 23. Development Rules Going Forward

- Use VS Code and Git Bash/Linux commands.
- Inspect current code/migrations first.
- Prefer a downloadable `.sh` release for large changes.
- Preserve working functionality.
- Stock changes must remain database-controlled.
- Run build/lint/migration verification.
- Update docs/tests/code-history with every major release.
- Never commit `.env.local`, Supabase service-role, Azure OCR key or other secrets.

## 24. Source of Truth

When continuing in a future chat, read in this order:

1. repository `main`,
2. latest Supabase migrations,
3. `docs/reconsolidation/MASTER_IMPLEMENTATION_SPECIFICATION.md`,
4. `docs/reconsolidation/00_HANDSHAKES_1_3.md`,
5. `docs/reconsolidation/IMPLEMENTATION_REPORT.md`,
6. actual Git code-history under `docs/code-history/`,
7. this handbook,
8. user manual.

## Modern UI / Theme / Dashboard Revision

The master reconsolidation release now includes a modern business UI layer inspired by contemporary SaaS administration products and Power BI dashboard information design. This is a presentation-layer enhancement; transactional Supabase/RPC logic is not rewritten.

### Theme system

Theme preference supports `SYSTEM`, `LIGHT`, and `DARK`.

- `SYSTEM` resolves the browser/OS `prefers-color-scheme` setting and listens for changes.
- `LIGHT` and `DARK` apply immediately.
- A compact top-bar theme control allows fast switching.
- Account Settings persists the preference through `update_my_theme()` / `update_my_profile()`.
- `masterConsolidation.css` is loaded after legacy chapter styles so the modern design tokens consistently override older fixed colors.

### Dashboard visual language

The chart palette is Power BI-inspired and uses restrained categorical colors led by `#118DFF`. The application uses reusable native React/CSS/SVG chart cards instead of coupling business screens to a large charting framework.

Charts now appear in:

- Owner Center: 30-day sales trend, payment mix, top-product sales and attention summary.
- Profit Intelligence: profit bridge and top SKU gross-profit contribution.
- Reports: sales trend and payment mix.
- Inventory Intelligence: health mix and immediate stock risk.
- Purchase Intelligence: purchase-price trend and supplier average-price comparison.

Cashier POS deliberately remains visually simpler than management dashboards.

## Editable Shop Settings

`Admin → Shop Settings` is no longer a read-only information screen.

Admin can edit operational shop identity and billing defaults through controlled RPCs:

- shop name,
- address,
- phone,
- tax/registration number,
- currency code/symbol,
- invoice prefix,
- purchase prefix,
- receipt paper width (58/80mm),
- receipt footer,
- configured tax enable/percentage.

The shop slug remains read-only. Commercial subscription state, access kill switch and platform ownership are not exposed to Shop Admin editing.

`get_shop_configuration()` is ADMIN-only and `update_shop_configuration()` performs validation, updates only approved fields and writes an audit record through `write_audit()`.

## Role Access Management

Security continues to use three shop roles: `CASHIER`, `MANAGER`, `ADMIN`.

A Shop Admin can:

- create Cashier or Manager users,
- enable/disable Cashier or Manager accounts,
- change an existing non-admin staff member between Cashier and Manager,
- review the complete Role Access Matrix.

A Shop Admin cannot:

- create/promote another Shop Admin,
- demote the platform-controlled Shop Admin,
- change the subscription/access kill switch,
- bypass RLS/RPC checks.

### Role boundaries

| Capability | CASHIER | MANAGER | ADMIN |
|---|---|---|---|
| POS billing / scanner | Yes | Yes | Yes |
| Own shift / permitted sale lookup | Yes | Yes | Yes |
| Return request | Request | Approve/manage | Approve/manage |
| Products/pricing | POS lookup only | Edit | Edit |
| Purchases/suppliers | No | Manage | Manage |
| Inventory/count/transfers | No | Manage | Manage |
| Expenses/approvals/customer credit | No | Manage | Manage |
| Reports | No | View/export | View/export |
| Owner Center/profit/loss | No | No | ADMIN only |
| Users/role changes | No | No | Manage |
| Shop settings/backup/audit | No | No | Manage |

The role matrix is a clear product/security contract. Frontend route visibility remains secondary to backend RLS/RPC authorization.

## Help / About Branding

The Help/About panel intentionally omits infrastructure architecture details. It includes the product version, support/documentation references, the line `Trust the GOD.` and creator attribution `Almighty sa_f`.


<!-- SUPPLIER_MASTER_OCR_PATCH -->
## Supplier Master + OCR Supplier Confirmation Patch (2026-08-30)

Purchases & Suppliers now includes a dedicated Supplier Master plus inline supplier create/edit actions in Purchase Order creation. Supplier CRUD reuses the existing suppliers table and existing ADMIN/MANAGER RLS. OCR performs a supplier-review step before continuing: existing suppliers are suggested from normalized name similarity, or the operator can review and create a supplier prefilled with Azure VendorName, VendorAddress and VendorTaxId. OCR never silently creates a supplier and never changes stock.

---

## V2 Phase 1 — Landed Cost, Receipt Lots & OCR Resolution

Phase 1 source now covers deterministic invoice landed-cost allocation,
receipt-level lots, receipt-based stock ageing and FIFO analytical rotation.

Manual/OCR receiving and approved-PO receiving reuse the existing controlled
purchase RPCs through V2 wrapper functions. Existing POS sale stock deduction
and sale cost snapshot behavior are intentionally unchanged.

OCR requires:
- confirmed supplier
- a resolved Product Master product for every line
- human confirmation for uncertain product matches
- Select Existing Product / Create New Product for unmatched lines
- alias persistence for confirmed description-to-product mappings
- explicit cases, bottles-per-case, loose bottles and final bottle quantity
  before the draft can move to Receive Stock

See `docs/chapters/V2-03-inventory-cost-lots-ageing-fifo.md`.

<!-- V2_CANONICAL_CURRENT_START -->
## V2 Current Implementation — Canonical Summary

This section is the current implementation summary. Older chapter text below is
historical implementation evidence and must not override this section when the
two conflict.

### Production architecture

- React/Vite frontend on Azure Storage static website.
- Supabase PostgreSQL/Auth/RLS/RPC is the production business backend.
- Multi-shop authorization uses authenticated membership and role resolution.
- Roles: ADMIN, MANAGER, CASHIER.
- Stock-changing workflows use transaction-safe database operations rather than
  arbitrary direct browser inventory edits.

### V2 feature status

| ID | Capability | Current state |
| --- | --- | --- |
| N1 | Landed Cost Engine | Implemented |
| N2 | Receipt Lot / Batch Tracking | Implemented |
| N3 | True Stock Ageing | Implemented |
| N4 | FIFO / Stock Rotation Foundation | Implemented |
| N5 | Discount / Price Override Control | Implemented |
| N6 | Standardized Reason Codes | Implemented |
| N7 | Accountant / Tally-ready Export | Implemented |
| N8 | Customer Loyalty | Implemented |
| N9 | Coupons / Promotions | Implemented |
| N10 | Gift Voucher / Store Credit | Implemented |
| N11 | Supplier Performance Score | Implemented |
| N12 | Advanced Stock Transfer | Existing controlled workflow; preserved |
| N13 | Approval Center Expansion | Implemented |
| N14 | Leakage Shield Expansion | Implemented |
| N15 | Purchase Coach Expansion | Implemented |

### OCR receiving rules

Every OCR line must resolve to a product before inventory is posted.

- strong matches may auto-select but remain reviewable
- uncertain matches require confirmation
- unmatched lines offer Select Existing Product or Create New Product
- confirmed description-to-product mappings are saved as aliases
- case count, bottles per case and loose bottles remain distinct
- final bottle quantity is visible before receipt
- inventory posting still occurs through controlled purchase receipt

### POS and billing controls

- cashier discounts and item-price overrides are backend-authorized
- standardized reason codes are used for controlled overrides
- manager/admin approval is required when policy thresholds demand it
- loyalty, promotions, store credit and gift vouchers use controlled checkout
- offline checkout cannot silently bypass authorization-required pricing/rewards

### Production AI

Ask WineShopPOS PRO Owner Assistant is a live, read-only production assistant.

- Function App: `wineshoppos-ai-1a61d5885c`
- Function region/plan: Central India / Consumption Y1
- Foundry production resource: `wineshoppos-ai-in-1a61d5885c`
- Foundry region: South India
- Project: `wineshoppos-ai`
- Model deployment: `gpt-5-mini`
- Agent: `WineShopPOS-Owner-Agent`
- caller authorization: current logged-in Supabase session
- Function-to-Foundry authentication: system-assigned managed identity

Current AI extension state:
1. functionality/how-to knowledge is deployed
2. Foundry/Application Insights server-side tracing infrastructure is configured
3. final trace ingestion verification requires one authenticated production interaction
4. trace evaluation quality gates remain the next implementation/verification stage
<!-- V2_CANONICAL_CURRENT_END -->

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Product Master real-catalogue architecture

### Normal one-product creation

```text
Barcode required
→ Product Master details
→ create_new_product RPC
→ PostgreSQL assigns WSP-######
→ inventory row = 0
→ no OPENING_STOCK movement
→ Receive Stock later
```

The deployed RPC signature retains `p_sku` and `p_opening_stock` as compatibility
parameters during rollout, but the current Product Master ignores user-supplied
values for both. This prevents an older browser bundle from breaking during the
frontend/database rollout.

### SKU

`shop_counters.product_sku_counter` is the per-shop sequence source. SKU is a
stable internal business identity, not a category code. Category, Brand, Size and
Barcode remain separate attributes. Product edits preserve SKU.

### Bulk Product Import

`bulk_create_products(jsonb)` is ADMIN/MANAGER-only, shop-scoped and
`security definer`. It permits NULL barcode because Invoice OCR may identify a
new product before the physical bottle/can barcode is captured. Every successful
Product starts with inventory quantity 0. The existing Product audit trigger
continues to audit INSERT/UPDATE operations.

### Invoice OCR integration

The active OCR review state is `sessionStorage["wineshop_ocr_review_state"]`.
Bulk Product Import loads only lines that do not yet have a `productId`.
Successful rows return line-index/Product-ID mappings through
`wineshop_ocr_bulk_created_products`. Invoice OCR restores those Product IDs,
requires human confirmation of cases/units/final quantity/purchase price, stores
the supplier alias and only then creates the existing Receive Stock draft.

The established `wineshop_ocr_purchase_draft` therefore remains a post-review
handoff to Receive Stock, not an input to Product Master bulk creation.

### Barcode completion

Product Master exposes All / With Barcode / Without Barcode filtering. A Product
created without barcode through Bulk Product Import is completed later through
the existing Edit Product screen. Normal single-product creation continues to
require Barcode.

<!-- AI_MONITOR_STATUS_20260831_START -->
## AI observability — Monitor access resolved

Foundry/Application Insights server-side tracing infrastructure remains
configured. The prior human `not enough permission` condition in Foundry
Monitor is resolved.

Current verification boundary:

```text
Foundry connection target: EXACT APP INSIGHTS ARM ID
Foundry auth:              ProjectManagedIdentity
Human Monitor access:      RESOLVED
Current trace view:        NO RESULTS TO SHOW
Trace E2E:                 NOT YET VERIFIED
```

Do not classify tracing as end-to-end verified until a new authenticated
production Owner Assistant request is visible in Foundry Traces.
<!-- AI_MONITOR_STATUS_20260831_END -->

<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
## Customer Help entry

The production SaaS does not expose a standalone Help module.

```text
Top-right user menu
→ Help / About
→ Open Full User Manual
→ /manual/index.html
```

The previous `#/help` URL is retained only as a compatibility redirect to
`/account?tab=about`. Do not rebuild a separate category/chapter Help page.
The customer manual is generated from the canonical master User Manual.

## V3 — Invoice document ingestion and storage
<!-- V3_API_AUTOMATION_20260831 -->
Architecture: Manual OCR / future Email / future WhatsApp → private Blob → `invoice_ingestions` → human review → Receive Stock → `purchases`. `invoice_ingestions` is evidence/workflow, not a second purchase table. React reads RLS metadata and original files open through short-lived read-only SAS from the standalone V3 invoice Function after ADMIN/MANAGER/shop authorization. Existing manual OCR remains independently usable. Email template deployment now requires an already authorized Gmail API connection; do not create a fake Gmail connection in ARM.

## V3 WhatsApp webhook boundary

<!-- V3_WHATSAPP_WEBHOOK_20260831 -->

The isolated V3 invoice Function exposes `https://wsp-v3-invoice-53b6e9a1.azurewebsites.net/api/whatsapp/webhook` for Meta WhatsApp Cloud API webhook verification/events. GET verification compares the configured verify token using timing-safe comparison. POST events require valid `x-hub-signature-256` HMAC-SHA256 calculated with the Meta App Secret before JSON is trusted.

Current Step 1 only acknowledges/logs safe metadata for inbound messages. It does not download media and cannot alter inventory. The Meta temporary access token/App Secret/verify token are Azure App Settings only and must never be committed.

### V3 Email invoice automation (20260831T123139Z)
V3 Email invoice automation is deployed on branch `V3`. Gmail uses a dedicated App Password kept only in Azure Function settings. Unread PDF/JPEG/PNG invoices from a registered EMAIL channel are polled every 5 minutes, deduplicated, stored in private Blob, OCR-processed, and routed to Invoice Inbox. Inventory remains unchanged until a human completes Receive Stock. WhatsApp V3-01B is preserved but ON HOLD.

### V3 Demo-Ready Runtime (20260831T160407Z)
The production demo now uses the V3 invoice reliability flow. Gmail automation uses a Blob UID checkpoint rather than Seen/Unread state. Authorized senders receive one automated oversize rejection response for supported PDF/JPG/PNG attachments above 4 MB; SMTP uses the already-secured Gmail App Password and never mutates inventory. Barcode input is normalized and supports Enter/Tab scanner suffixes with a more tolerant HID timing threshold. ADMINs have a guarded **Demo / Test Data Reset** RPC/UI requiring the exact phrase `DELETE DEMO DATA`; it removes operational test data while preserving tenant/users/settings/categories/Email mapping and audit/configuration records. The V3 invoice Function worker is configured 64-bit. Logic App remains every 5 minutes until a later cost-optimization task.

### V3-02 invoice finance / intake UX — local verified (20260831T182936Z)
Feature commit `0bc8d8db4e0fadfe2cb5a942bc0d40de2e9a7310` adds shared Document Intelligence financial-summary reconciliation across manual OCR and Email ingestion. It maps common liquor supplier invoice summary rows into landed-cost adjustments and derives small rounding differences when a printed final total is available. Receive Stock blocks a >₹1 financial mismatch for OCR-linked invoices. Supplier invoice/reference is optional to the operator; OCR is preferred and a deterministic/internal AUTO reference is used when absent. Authorized Gmail invoice intake sends an idempotent "received; allow up to 1 hour" acknowledgement for accepted attachments. Required native fields are visibly starred. This state is locally build/lint/smoke verified and is not yet deployed/pushed.

### V3-03 local verified patch
Invoice finance matching now uses strict summary labels, rejects date/time false positives, and can override Azure subtotal-as-total using the printed bottom total. Bulk OCR onboarding carries table MRP and suggests first-token Brand plus an existing matching Category. Reconciliation failures use a blocking modal. Feature: `ce1c14c8772fdb024f346b64a3aa8c278da9f2c5`; deployment/push pending.

### V3-03B scanner capture and Email scheduler
ScannerContext now supports explicit barcode inputs using `data-scanner-capture="barcode"`; these fields retain the completed HID scan while ordinary editable fields keep the existing protection behavior. Bulk Product Import also listens to the scanner event as a React-state fallback. Logic App `wsp-v3-email-scheduler-53b6e9a1` is intentionally Disabled after testing and must be explicitly enabled before automatic Email polling resumes.

### V3-04 OCR normalization
Do not treat `prebuilt-invoice.fields.Items` as authoritative when a stronger supplier item table exists. Shared `invoiceDocument.js` maps table-header synonyms into WineShopPOS item semantics before quantity/cost logic. This prevents pack size from becoming quantity and preserves Batch/MRP/Case/Rate/Amount relationships.

Purchase/base unit cost storage now preserves numeric(14,6) precision. Posted invoice and line totals remain two-decimal accounting amounts.

FIFO stays lightweight: the oldest tracked lot is SELL FIRST and the derived BOX code can be written on the carton. Full rack/bin management is intentionally deferred.

## V3-05 final reliability contract
OCR never posts inventory directly; Receive Stock is the purchase-posting boundary. Scanner events are ephemeral and POS cart state is session-scoped by shop. Forward FIFO stock-out allocation records untracked opening balance before tracked receipt lots, then consumes tracked lots oldest-first and snapshots FIFO COGS on new sale items. Admin hard deletion is restricted to non-transactional test products.

## V3-06 Invoice Inbox display vocabulary

Persisted `invoice_ingestions.review_status` values are unchanged. UI mapping:
`NEEDS_REVIEW` → Needs Review; `READY_TO_RECEIVE` → Ready for Stock; `RECEIVED` → Completed; `POSSIBLE_DUPLICATE` → Possible Duplicate; `DUPLICATE` → Duplicate — Closed; `OCR_FAILED` → OCR Failed; `FAILED` → Processing Failed; `CANCELLED` → Cancelled.

Do not rename DB enum values merely to change UI copy. Cancel Review retains evidence and does not change inventory.

Playwright read-only E2E is now repository-supported. Write-path E2E must use an isolated test shop.

## V3-07 Supabase PGRST303 retry

Observed production/test evidence showed successful Supabase Auth password grants followed immediately by intermittent PostgREST `401 PGRST303: JWT issued at future` on `my_profile` or `my_shop_access`. In the same interval the companion RPC could return 200.

The auth bootstrap therefore retries only the precise JWT-timing condition (`PGRST303` or message `JWT issued at future`) with bounded backoff. Both profile and access RPCs are rerun as a pair. Other authorization errors are not hidden or generically retried.

The browser regression uses sequential fresh-browser logins. Parallel same-account workers are not used as the acceptance criterion because they test backend concurrency rather than normal interactive login.

## AI production trace-ingestion verification

The Owner AI observability acceptance contract requires more than a successful `/api/ai/chat` call. A fresh authenticated production request must be followed by fresh AI/Foundry telemetry in the dedicated `wineshoppos-ai-insights` / `wineshoppos-ai-law` path.

Raw telemetry evidence is local-only because trace payloads can contain operational context. Repository evidence stores only safe correlation metadata such as request id, telemetry table names, operation ids, and marker names.

With trace ingestion verified, quality work proceeds to a versioned golden dataset, deterministic security/tool checks, evaluator scores and release gates.

## Owner AI golden evaluation contract

Do not evaluate Owner AI releases against an ad-hoc prompt list. Use the versioned assets under `docs/ai/evaluation/`.

Security blockers are binary. Any cross-shop leakage, tenant isolation failure, unauthorized write claim, secret/token exposure or SQL/system-prompt exposure fails the release regardless of average LLM-judge scores.

Before comparing two evaluation runs, record the dataset version, production model/deployment, agent version and evaluator package/version. Raw business answers should remain local evaluation artifacts unless explicitly sanitized.

<!-- RELEASE_WITH_AI_EVAL_SKIPPED_20260901 -->
## Edit Product persistence and release validation
`Save & Close` uses the existing product update path and then re-reads `get_products`. Navigation occurs only when the persisted `selling_price` matches the entered Selling Price.

The Edit Product page no longer renders the former Apply action or duplicate top-right Back/Close controls.

For the 2026-09-01 release, AI-10/AI-11 evaluator work was explicitly skipped by the owner. It is not represented as PASS. Standard application lint/build checks remain required before deployment.

<!-- OCR_BULK_PRODUCT_SYNC_FIX_20260902 -->
## OCR bulk-created products — persistence and UI synchronization
Bulk Product Import verifies returned `bulk_create_products` IDs against shop-scoped `get_products()` before linking the OCR review. On return, created rows are identified as created Product Master links and the Product Master is refreshed.

`ShopContext.refreshAll()` publishes catalogue/categories/suppliers/inventory immediately after their own successful queries. Later Sales/Purchases failures are partial refresh failures and must not hide a valid catalogue.

Before transition to Receive Stock, OCR Send Draft performs a fresh `get_products()` verification. The review grid also shows Invoice Rate/Case, editable Reviewed Rate/Case, Price/Bottle, Invoice Line Amount, Reviewed Line Amount and Gap (Invoice - Reviewed). Reviewed Rate/Case is converted back to bottle cost using Bottles/Case so FIFO stays bottle-based. Catalogue creation remains zero-stock; Receive Stock remains the authoritative physical inventory posting step.

<!-- POS_SALES_RECEIPT_REPORT_SORT_20260902 -->
## Durable POS completion and list sorting
A committed sale remains authoritative even if another UI refresh domain fails. Sales and Purchases refresh independently. Sale Details falls back to a direct shop-authorized Supabase read by sale ID and can auto-print after checkout. Reports refreshes shop state before metrics. Read-only list views use `SortableTable`; editable OCR/receipt/stock-count/transfer grids remain unsorted during data entry.
