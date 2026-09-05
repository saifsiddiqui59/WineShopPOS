# V3 Core Feature Traceability — Initial Verified Baseline

Snapshot: 2026-09-04

This file starts the curated feature-to-data traceability layer.

## POS Billing

Feature ID: `POS_BILLING`

Route: `/pos`

Roles:
- ADMIN
- MANAGER
- CASHIER

Primary source:
- `src/pages/POS.jsx`
- `src/context/ShopContext.jsx`
- `src/lib/offlineQueue.js`

### Direct page/data reads

| Relation | Access | Evidence |
|---|---|---|
| `cashier_shifts` | READ | POS shift verification |
| `customers` | READ | customer selection |
| `reason_codes` | READ | discount/price override reasons |
| `sale_override_requests` | READ | approval status refresh |

### RPCs

| RPC | Purpose |
|---|---|
| `open_shift` | open cashier shift |
| `request_sale_override` | request manager/admin pricing approval |
| `customer_commercial_summary` | loyalty/store-credit summary |
| `commercial_quote` | calculate commercial benefits |
| `complete_sale_v4` | authoritative online checkout |

### `complete_sale_v4` transitive relations — LIVE_VERIFIED

`audit_logs`, `cashier_shifts`, `customer_loyalty_ledger`,
`customer_store_credit_ledger`, `customers`, `gift_voucher_redemptions`,
`gift_vouchers`, `inventory`, `loyalty_settings`, `payments`, `products`,
`profiles`, `promotion_redemptions`, `promotions`, `reason_codes`,
`sale_items`, `sale_override_requests`, `sale_override_settings`,
`sale_tender_adjustments`, `sales`, `shop_counters`, `shop_settings`,
`shops`, `stock_movements`.

### Browser persistence

- session cart cache keyed by shop.
- shift session marker keyed by shop and user.
- offline sale queue uses browser IndexedDB with encrypted payloads.

### Critical security/business rules

- shift required before billing,
- stock availability checked,
- price/discount override authorization,
- commercial rewards require online verification,
- online sale mutation is delegated to the database RPC,
- offline sale sync is a separate controlled path.

---

## Product Master

Feature ID: `PRODUCT_MASTER`

Routes:
- `/products`
- add/edit product routes
- bulk import / labels related pages

Roles:
- ADMIN
- MANAGER

Primary source:
- `src/pages/Products.jsx`
- `src/context/ShopContext.jsx`
- product form/image helpers

### Data dependencies

Direct/reference load:
- `categories`
- `suppliers` for manager/admin shared context
- `inventory`

RPCs:
- `get_products`
- `get_product_images`
- `create_new_product`
- `update_product_details`
- `set_product_active`

`create_new_product` transitive relations — LIVE_VERIFIED:
- `inventory`
- `products`
- `profiles`
- `shops`

### Storage

Managed product image storage is a separate dependency and must be documented under Storage Reference.

### Rule

Product Master defines the approved product record.
External catalogue/enrichment suggestions do not become authoritative until accepted/saved.

---

## Receive Stock

Feature ID: `PURCHASE_RECEIVE`

Primary source:
- `src/context/ShopContext.jsx`
- purchasing/receive pages

Roles:
- ADMIN
- MANAGER

Direct data:
- `suppliers` may be read/created through the current shop context.

Authoritative RPC:
- `receive_purchase_v2`

### `receive_purchase_v2` transitive relations — LIVE_VERIFIED

`audit_logs`, `inventory`, `inventory_receipt_lots`, `products`, `profiles`,
`purchase_items`, `purchases`, `shop_counters`, `shop_settings`, `shops`,
`stock_movements`, `suppliers`.

### Critical rules

- every line must resolve to a product,
- duplicate product lines are rejected,
- final bottle quantity must match case/loose calculation,
- inventory changes happen through the receiving transaction,
- receipt/FIFO lot traceability is part of the transaction chain.

---

## Stock Adjustment

Feature ID: `STOCK_ADJUSTMENT`

Authoritative RPC:
- `adjust_stock`

Transitive relations — LIVE_VERIFIED:
- `inventory`
- `profiles`
- `shops`
- `stock_adjustments`
- `stock_movements`

Role expectation:
- manager/admin controlled.

Rule:
direct React inventory mutation is not the authoritative adjustment path.

---

## Offline Sale Sync

Feature ID: `OFFLINE_SALE_SYNC`

Source:
- `src/lib/offlineQueue.js`
- `src/context/ShopContext.jsx`

Browser persistence:
- IndexedDB database `wineshoppos_offline_v1`
- queue store `sale_queue`
- crypto-key store `crypto_keys`
- AES-GCM encrypted payload

Sync RPC:
- `sync_offline_sale`

Transitive relations — LIVE_VERIFIED:
`audit_logs`, `cashier_shifts`, `inventory`, `payments`, `products`,
`profiles`, `sale_items`, `sales`, `shop_counters`, `shop_settings`,
`shops`, `stock_movements`.

Critical rule:
offline data is a temporary client-side queue; the backend sync transaction remains authoritative.

---

## Next traceability expansion

Add the same treatment for:
- returns/voids,
- cashier/day close,
- stock count,
- transfers,
- OCR/invoice ingestion,
- purchase correction,
- customer credit,
- expenses/approvals,
- reports/compliance,
- Owner Center,
- AI Owner Assistant,
- users/access/settings,
- backup/recovery.
