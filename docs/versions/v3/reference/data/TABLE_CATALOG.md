# V3 Table Catalog

Live DEV schema snapshot: 2026-09-04
Environment: V3 DEV
Public relations in this snapshot: **58 tables**
RLS: **enabled on every table listed below**

This file is a high-level catalog. Column-level dictionaries and FK/relationship diagrams are separate generated/curated artifacts.

| Table | Owner domain | Columns | RLS | Confidence |
|---|---|---:|---|---|
| `ai_activity_logs` | AI / observability | 11 | YES | LIVE_VERIFIED |
| `audit_logs` | Audit | 11 | YES | LIVE_VERIFIED |
| `backup_restore_tests` | Backup / recovery | 9 | YES | LIVE_VERIFIED |
| `cashier_shifts` | POS / operations | 18 | YES | LIVE_VERIFIED |
| `categories` | Product catalog | 7 | YES | LIVE_VERIFIED |
| `compliance_profiles` | Compliance | 11 | YES | LIVE_VERIFIED |
| `customer_credit_entries` | Customer / commercial | 10 | YES | LIVE_VERIFIED |
| `customer_loyalty_ledger` | Customer / commercial | 9 | YES | LIVE_VERIFIED |
| `customer_store_credit_ledger` | Customer / commercial | 10 | YES | LIVE_VERIFIED |
| `customers` | Customer / commercial | 10 | YES | LIVE_VERIFIED |
| `expense_categories` | Operations / expenses | 5 | YES | LIVE_VERIFIED |
| `expenses` | Operations / expenses | 14 | YES | LIVE_VERIFIED |
| `gift_voucher_redemptions` | Customer / commercial | 6 | YES | LIVE_VERIFIED |
| `gift_vouchers` | Customer / commercial | 11 | YES | LIVE_VERIFIED |
| `inventory` | Inventory | 6 | YES | LIVE_VERIFIED |
| `inventory_fifo_allocations` | Inventory / FIFO | 13 | YES | LIVE_VERIFIED |
| `inventory_receipt_lots` | Inventory / FIFO | 17 | YES | LIVE_VERIFIED |
| `invoice_ingestion_channels` | Invoice ingestion | 8 | YES | LIVE_VERIFIED |
| `invoice_ingestions` | Invoice ingestion | 34 | YES | LIVE_VERIFIED |
| `loyalty_settings` | Customer / commercial | 6 | YES | LIVE_VERIFIED |
| `organizations` | Tenant / identity | 5 | YES | LIVE_VERIFIED |
| `payments` | Sales / payment | 10 | YES | LIVE_VERIFIED |
| `platform_admins` | Platform security | 2 | YES | LIVE_VERIFIED |
| `product_aliases` | Product resolution | 8 | YES | LIVE_VERIFIED |
| `product_enrichment_cache` | Product enrichment | 13 | YES | LIVE_VERIFIED |
| `products` | Product catalog | 20 | YES | LIVE_VERIFIED |
| `profiles` | Identity / profile | 11 | YES | LIVE_VERIFIED |
| `promotion_redemptions` | Customer / commercial | 7 | YES | LIVE_VERIFIED |
| `promotions` | Customer / commercial | 17 | YES | LIVE_VERIFIED |
| `purchase_item_corrections` | Purchasing / correction | 12 | YES | LIVE_VERIFIED |
| `purchase_items` | Purchasing | 16 | YES | LIVE_VERIFIED |
| `purchase_order_items` | Purchasing / PO | 8 | YES | LIVE_VERIFIED |
| `purchase_orders` | Purchasing / PO | 13 | YES | LIVE_VERIFIED |
| `purchase_return_items` | Purchasing / returns | 7 | YES | LIVE_VERIFIED |
| `purchase_returns` | Purchasing / returns | 9 | YES | LIVE_VERIFIED |
| `purchase_verification_resolutions` | Purchasing / verification | 14 | YES | LIVE_VERIFIED |
| `purchases` | Purchasing | 26 | YES | LIVE_VERIFIED |
| `reason_codes` | Approval / reasons | 8 | YES | LIVE_VERIFIED |
| `sale_items` | Sales | 15 | YES | LIVE_VERIFIED |
| `sale_override_requests` | Sales / approval | 16 | YES | LIVE_VERIFIED |
| `sale_override_settings` | Sales / approval | 6 | YES | LIVE_VERIFIED |
| `sale_return_items` | Sales / returns | 9 | YES | LIVE_VERIFIED |
| `sale_return_requests` | Sales / returns | 12 | YES | LIVE_VERIFIED |
| `sale_tender_adjustments` | Sales / payment | 7 | YES | LIVE_VERIFIED |
| `sales` | Sales | 23 | YES | LIVE_VERIFIED |
| `shop_counters` | Shop sequencing | 6 | YES | LIVE_VERIFIED |
| `shop_settings` | Shop configuration | 13 | YES | LIVE_VERIFIED |
| `shop_verification_policies` | Shop verification | 5 | YES | LIVE_VERIFIED |
| `shops` | Tenant / shop | 12 | YES | LIVE_VERIFIED |
| `stock_adjustments` | Inventory / adjustment | 9 | YES | LIVE_VERIFIED |
| `stock_count_items` | Inventory / stock count | 9 | YES | LIVE_VERIFIED |
| `stock_counts` | Inventory / stock count | 11 | YES | LIVE_VERIFIED |
| `stock_movements` | Inventory ledger | 13 | YES | LIVE_VERIFIED |
| `stock_transfer_items` | Inventory / transfer | 5 | YES | LIVE_VERIFIED |
| `stock_transfers` | Inventory / transfer | 15 | YES | LIVE_VERIFIED |
| `supplier_payments` | Supplier / payment | 10 | YES | LIVE_VERIFIED |
| `suppliers` | Supplier | 11 | YES | LIVE_VERIFIED |
| `user_shop_memberships` | Identity / authorization | 6 | YES | LIVE_VERIFIED |

## Rules

- Table owner domain is documentation classification, not database authorization.
- RLS enabled does not prove the policies are correct; security evidence lives separately.
- Feature usage is documented in the traceability matrix.
- RPC/function usage is documented in the RPC catalog.
- Refresh this snapshot after intentional schema change.
