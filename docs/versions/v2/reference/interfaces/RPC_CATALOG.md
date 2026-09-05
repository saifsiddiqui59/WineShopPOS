# V2 Production RPC Catalog — Core Baseline

Snapshot: 2026-09-05
Environment: PROD
Main SHA: `af1d40ed9534d7205316ec6ac7b682f6c5b481d1`

| RPC | Security | Direct/nested relation evidence |
|---|---|---|
| `adjust_stock` | SECURITY DEFINER | inventory, stock_adjustments, stock_movements |
| `commercial_quote` | SECURITY DEFINER | customers, gift_vouchers, loyalty_settings + helpers |
| `complete_sale_v4` | SECURITY DEFINER | sales, payments, commercial ledgers + nested complete_sale_v3 |
| `create_new_product` | SECURITY DEFINER | products, inventory |
| `customer_commercial_summary` | SECURITY DEFINER | customers + loyalty/store-credit helpers |
| `get_product_images` | SECURITY DEFINER | products |
| `get_products` | SECURITY DEFINER | products, categories |
| `open_shift` | SECURITY DEFINER | cashier_shifts + audit helper |
| `receive_purchase_v2` | SECURITY DEFINER | purchase_items + nested receive_purchase / landed-cost helper |
| `request_sale_override` | SECURITY DEFINER | reason_codes, sale_override_requests + pricing/reason helpers |
| `set_product_active` | SECURITY DEFINER | products |
| `sync_offline_sale` | SECURITY DEFINER | nested complete_sale_v2 |
| `update_product_details` | SECURITY DEFINER | products |
