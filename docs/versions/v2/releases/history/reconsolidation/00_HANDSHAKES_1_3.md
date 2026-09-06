# WineShopPOS Master Reconsolidation — Handshakes 1–3

This report records the required Discover → Map → Protect analysis before implementation. The Git repository and active migrations were treated as the source of truth.

## Repository Current State — Before This Release

- Branch: `main`.
- Confirmed production expansion commits already contained Chapters 16–26.
- Frontend: React/Vite, HashRouter, Azure Blob Static Website.
- Backend: Supabase PostgreSQL, RLS, transaction-safe RPCs and Edge Functions.
- Existing secure user-management Edge Function: `manage-shop-users`.
- Existing OCR Edge Function: `ocr-invoice`.
- Existing migration: `20260829190000_chapters_16_26.sql`.
- Existing scanner, returns, shifts, stock count, procurement, reordering, transfers, audit, offline queue and OCR functionality were already present.
- The largest UX problem was a long flat sidebar exposing operational capabilities as separate top-level navigation items.

## Existing / Partial / Missing / Needs Testing

| Capability | Baseline Classification | Evidence / Decision |
|---|---|---|
| Fast POS billing | EXISTING | Global scanner, cart, repeated scan, stock checks, discount, Cash/UPI/Card and offline queue already implemented. Reused. |
| Sales/payments/returns | EXISTING | Sale history, return request/approval and void RPCs already existed. Reused. |
| Product/barcode master | EXISTING | Product CRUD and barcode fields already existed. Reused. |
| Receipt printing | PARTIAL | 58/80mm browser print existed; real hardware validation still required. |
| Barcode label printing | MISSING | Added in this release using CODE128 browser-print labels. |
| Supplier/procurement | PARTIAL | PO/receiving/payment/return existed, but approval lifecycle and UX were incomplete. Extended, not rebuilt. |
| Invoice OCR | EXISTING / NEEDS TESTING | Azure Document Intelligence F0 + OCR Edge Function existed; retained under Purchase Intelligence. Real supplier invoices still require field validation. |
| Purchase price history | EXISTING | Existing RPC and page. Reused inside Purchase Intelligence. |
| Supplier comparison/intelligence | MISSING | Added deterministic RPCs and consolidated PRO view. |
| Stock management/audit | EXISTING | Inventory, movements, adjustments, counts existed. Reused. |
| Advanced transfer lifecycle | PARTIAL | Request/approval existed and moved stock too early. Extended to approve → dispatch → transit → receive → complete. |
| Inventory intelligence | PARTIAL | Reorder existed. Added stock explanation and health classification. |
| Shift/day close | EXISTING | Open/close/approval and offline close protection existed. Reused. |
| Expenses | MISSING | Added expense categories, transactions, void audit and reporting. |
| Approval center | PARTIAL | Approval logic existed separately. Added centralized UI over existing/new approval RPCs. |
| Customer & credit | MISSING | Added customer master and Udhaar ledger. Customer selection is optional in POS; credit ledger remains management-controlled. |
| Loyalty | MISSING / DEFERRED | Explicitly lower priority than production readiness. No speculative loyalty engine added. |
| Owner Control Center | MISSING | Added consolidated deterministic business overview. |
| Profit intelligence | MISSING | Added sale-time cost snapshot, COGS/gross/operating profit and SKU profitability. |
| Audit/loss control | PARTIAL | Raw audit existed. Added neutral rule-based exception analysis. |
| Smart recommendations | PARTIAL | Reorder existed. Added consolidated actionable recommendations. |
| Owner WhatsApp summary | MISSING | Added manual `wa.me` prefilled summary. No API/background sending. |
| Reports/exports | PARTIAL | Reports existed. Added CSV export center and expenses/inventory exports. |
| Liquor compliance | MISSING | Added metadata foundation only. No legal rules invented. |
| Shop/users/security | EXISTING / PARTIAL | Roles/RLS existed. Added account UX, profile preferences and multi-shop membership/switch foundation. |
| Hardware/device setup | PARTIAL | Scanner/printer screens existed separately. Consolidated hardware entry point + labels. |
| Offline/reliability | EXISTING / NEEDS TESTING | Encrypted IndexedDB queue + idempotent sync already existed. Preserved. Real disconnect/reconnect testing remains required. |
| Backup/recovery | PARTIAL | JSON snapshot existed. Added recovery strategy + restore-drill evidence log; a real successful restore drill is still required. |
| AI owner assistant | DEFERRED | Hidden. No LLM added. |
| Voice AI | DEFERRED | Hidden. No voice/LLM layer added. |

## Mapping — Current Screens to 8 Final Modules

### 1. POS & Billing
- Billing → existing `POS.jsx` with optional customer attachment.
- Sales → existing `Sales.jsx`.
- Returns & Voids → existing `Returns.jsx`.
- Shift → existing `Shifts.jsx`.
- Scanner → existing `ScannerSettings.jsx`.

### 2. Products
- Product Master → existing Products/Add/Edit pages.
- Barcode Labels → new `BarcodeLabels.jsx`.

### 3. Purchases & Suppliers
- Receive Stock → existing `Purchases.jsx`.
- Procurement PLUS → consolidated/extended `Procurement.jsx`.
- Purchase Intelligence PRO → new composition over OCR + price/supplier intelligence.

### 4. Inventory
- Overview → existing `Inventory.jsx`.
- Stock Count → existing `StockCount.jsx`.
- Transfers PLUS → extended lifecycle in `Transfers.jsx`.
- Inventory Intelligence PRO → new deterministic intelligence screen.

### 5. Operations
- Shift & Day Close → existing `Shifts.jsx`.
- Expenses → new.
- Approvals → new consolidated approvals UI.
- Customer & Credit PLUS → new.
- Offline Queue → existing.

### 6. Owner Center
- Overview PRO → new.
- Profit PRO → new.
- Loss & Exceptions PRO → new over audit/operational data.
- Recommendations PLUS → new.
- WhatsApp Summary PLUS → new manual share flow.

### 7. Reports & Compliance
- Reports & Exports → expanded reporting/export screen.
- Liquor Compliance → new configuration foundation only.

### 8. Settings & Admin
- Users → existing secure Edge Function UI.
- Hardware → new consolidation entry point to scanner/printer + product labels.
- Backup & Recovery → new restore-test runbook/evidence UI.
- Audit Log → existing Admin audit.
- Shop Settings → existing.

## Mapping to the 24 Consolidated Features

1. Fast POS Billing — EXISTING, reused and ergonomically consolidated.
2. Sales, Payments & Returns — EXISTING, reused.
3. Product & Barcode Management — EXISTING, reused.
4. Receipt & Label Printing — receipt EXISTING/PARTIAL; labels NEW.
5. Supplier & Procurement — PARTIAL → extended approval lifecycle.
6. Smart Purchase Intelligence PRO — OCR reused; supplier comparison/margin view NEW.
7. Stock Management & Audit — EXISTING, reused.
8. Advanced Stock Transfers PLUS — PARTIAL → extended multi-stage lifecycle.
9. Inventory Intelligence PRO — PARTIAL → expanded.
10. Shift & Day Close — EXISTING, reused.
11. Expense Management — NEW.
12. Approval Controls — existing approval engines + NEW centralized UI.
13. Customer & Credit PLUS — NEW.
14. Customer Loyalty — DEFERRED.
15. Owner Control Center PRO — NEW, includes business/profit/loss views.
16. Smart Recommendations PLUS — expanded deterministic recommendations.
17. Reports & Exports — expanded.
18. Liquor Compliance — foundation NEW; legal rules DEFERRED pending verified requirements.
19. Shop, Users & Security — existing backend + new account/membership UX.
20. Hardware & Device Setup — consolidated.
21. Offline & Reliability — existing; preserved and regression-tested by installer/build plus manual test matrix.
22. Backup & Recovery — expanded, restore test still must be performed in non-production environment.
23. AI Owner Assistant — DEFERRED/HIDDEN.
24. Voice AI Layer — DEFERRED/HIDDEN.

## PRO / PLUS Product Classification

### PRO
- Smart Purchase Intelligence.
- Inventory Intelligence.
- Owner Control Center.
- Profit & Business Intelligence.
- Audit & Loss Control.

### PLUS
- Smart Recommendations.
- Advanced Supplier & Procurement.
- Advanced Stock Transfers.
- Owner WhatsApp Summary.
- Customer & Credit.

Tier badges are metadata/UI only. No subscription enforcement, RLS plan gating or payment integration is introduced.

## Files Expected to Change

### Reused without backend rewrite
- Current sale/return/shift/stock-count/offline/OCR business engines.
- Existing product/inventory/purchase/sale tables.
- Existing multi-shop organization and stock-movement architecture.

### Frontend overlay
- `src/App.jsx`
- `src/main.jsx`
- `src/components/Layout.jsx`
- consolidated navigation/config and shared UI components.
- selected existing screens: `POS.jsx`, `Procurement.jsx`, `Transfers.jsx`.
- new account, expenses, approvals, customer credit, labels, intelligence, owner, reports/compliance, backup pages.
- `src/masterConsolidation.css`.

### Backend overlay
- one additive migration: `20260829233000_master_reconsolidation.sql`.
- updated `manage-shop-users` Edge Function so new users also receive shop-membership records.

## Database Changes Expected

The migration does NOT create duplicate sales/inventory/product systems.

New structures:
- `user_shop_memberships`
- `expense_categories`
- `expenses`
- `customers`
- `customer_credit_entries`
- `compliance_profiles`
- `backup_restore_tests`

Extensions to existing structures:
- safe profile UX fields.
- optional `sales.customer_id`.
- sale-item cost snapshot fields for profit reporting.
- purchase-order approval fields/statuses.
- stock-transfer dispatch/receive/completion lifecycle fields/statuses.

New/extended RPCs remain security-definer, shop-scoped and role-aware.

## Risk Assessment

### High
- Stock transfer lifecycle transition from legacy atomic approval to physical dispatch/receive stages.
- Purchase-order lifecycle status migration.

Mitigation: existing legacy approved transfers are marked completed before the new constraint; new stock changes occur only in RPCs under row locks.

### Medium
- `my_profile()` return shape changes for account UX.
- cost snapshots affect future profit reporting.
- new multi-shop membership records.

Mitigation: migration backfills memberships and cost snapshots; installer performs Supabase dry-run before applying.

### Low
- navigation, badges, page composition, account menu, reports/export, WhatsApp share.

## Must Not Break

- POS barcode scanning.
- online checkout and stock decrement.
- offline queue/idempotent synchronization.
- purchase receiving and stock increment.
- returns/refunds/voids.
- shift open/close.
- physical stock count.
- organization/shop isolation.
- Cashier purchase-cost protection.
- RLS and role gates.
- OCR review-before-stock rule.
- Azure static hosting.

## Regression Test Plan

The installer performs build/lint/migration checks. The full manual matrix is stored at `docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md` and covers POS, purchases, returns, shifts, inventory, access roles, multi-shop isolation, offline sync, transfer lifecycle, expenses, customer credit, owner metrics, reports/export, hardware print, OCR, backups and legacy-route compatibility.

## Recommended Implementation Sequence

1. Baseline build/lint/status and checkpoint tag.
2. Shared shell, account UX, role-aware consolidated navigation.
3. Additive database migration dry-run.
4. Missing CORE features: expenses, backup/compliance foundation, labels.
5. PLUS: procurement, transfer lifecycle, customer/credit, recommendations/share.
6. PRO deterministic intelligence: purchase, inventory, owner/profit/loss.
7. Build/lint.
8. Apply migration and deploy updated Edge Function.
9. Build again.
10. Deploy Azure static site.
11. Create actual Git code-history from the resulting commit.
12. Commit documentation and push once.

This sequence follows the master instruction: preserve the engine, improve the experience.
