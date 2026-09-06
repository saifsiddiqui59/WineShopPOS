# WineShopPOS V4 — Commercial Readiness Batch 1

Status: QA / DEV first. PROD promotion is deliberately separate.

## Why this batch was remapped

Existing-shop migration and multi-cashier reliability are more important than adding more subscription tiers.

Competitor review:
- Square supports Excel/CSV item-library imports, column matching, add/update flows and recommends keeping an export backup before updates.
- Lightspeed Retail supports CSV/XLSX bulk inventory migration and explicitly warns that spreadsheet software can damage leading-zero UPC/SKU values.
- Lightspeed also limits/serializes import workflows, reinforcing the value of a controlled import batch instead of direct table writes.

WineShopPOS therefore uses:
1. CSV + XLSX browser parsing.
2. Automatic column matching plus manual remapping.
3. Dry Run before any write.
4. All validation issues returned together.
5. Explicit duplicate policy: SKIP / UPDATE / ERROR.
6. SHA-256 file identity to prevent accidental exact-file re-import.
7. Database RPC transaction for final import.
8. Import batch/audit record.
9. Opening-stock protection once live WineShopPOS sales exist.

## Realtime cashier design

`inventory` is published through Supabase Realtime. Each authenticated live shop client subscribes only to its own `shop_id`.

The browser stock display is updated from database events. Checkout RPC/database locking remains authoritative; Realtime is UX synchronization, not the oversell-control mechanism.

## Legal / privacy

The V4 Pilot & Privacy notice infrastructure is ready but `legal_notice_enabled=false`.

When enabled later:
- normal live shop users see the versioned notice after login,
- checkbox starts unticked,
- acceptance uses the authenticated user, shop/role snapshot, server time, document hash, V4, generated device ID and session ID,
- no MAC address is collected,
- source IP capture is not implemented,
- demo and Platform Control are not gated by the shop pilot notice.

Customer spreadsheet import remains disabled while the pilot/privacy rollout is disabled.

## Subscription plans

Normal selectable plans: BASIC / PLUS / PRO.

ENTERPRISE remains database-compatible as a reserved future value but is hidden from the normal V4 Platform Control selector until there are real enterprise-only features.

## Mobile / Android strategy

This batch fixes responsive web behavior first.

Android packaging is deliberately deferred until mobile QA passes. Capacitor is the preferred later wrapper because it can reuse the React/Vite application instead of creating a second independent codebase.

No Android paid service is created in this batch.

## Cost impact

No new Azure resource and no paid messaging provider.

`read-excel-file` is MIT-licensed and has no service fee.

Supabase Realtime is usage-metered inside Supabase:
- Realtime messages and peak connections count against plan quotas.
- This batch creates no separate Realtime service.
- For a small number of cashier terminals the expected volume is low, but usage should be watched before a large rollout.

Current pricing should always be rechecked before commercial rollout.

## Main failure modes handled

- dirty-tree damage: tracked dirty worktree blocks mutation; no cleanup commands are used,
- exact-file double import: SHA-256 source hash protection,
- partial import: final apply is a database transaction,
- malformed spreadsheet: Dry Run accumulates row errors,
- barcode leading zeros: CSV parser preserves text and XLSX UI warns to format barcode columns as Text,
- live-stock overwrite: opening-stock import rejects non-zero stock and completed-sale shops,
- concurrent imports: shop-scoped advisory transaction lock,
- stale cashier UI: Realtime inventory events update shared stock display,
- Realtime failure: checkout database logic remains authoritative,
- legal accidental activation: runtime default remains false,
- platform-admin lockout: legal gate wraps normal shop Layout only,
- critical announcement fatigue: finite pulse, reduced-motion handling, persistent critical strip,
- non-critical dismissal bug: acknowledged INFO/SUCCESS/WARNING strips stop rendering for the session.

## PROD gate

Do not promote until:
- V4 build/lint/source tests pass,
- hosted QA smoke passes,
- 3–5 cashier UAT confirms simultaneous checkout + Realtime stock display,
- import Dry Run is tested with a real exported shop spreadsheet copy,
- PROD migration plan is generated from verified DEV state,
- PROD legal notice remains disabled unless explicitly enabled later.
