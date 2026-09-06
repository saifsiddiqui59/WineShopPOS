# V2 Generated Source Dependency Inventory

Status: GENERATED_INFERENCE

| Source | Direct tables/views | RPCs | Edge functions | Storage buckets |
|---|---|---|---|---|
| `src/components/Receipt80mm.jsx` | `shop_settings` | - | - | - |
| `src/components/ShopSelector.jsx` | - | `my_shop_memberships`, `switch_shop` | - | - |
| `src/components/SupplierEditor.jsx` | `suppliers` | - | - | - |
| `src/components/ThemeToggle.jsx` | - | `update_my_theme` | - | - |
| `src/context/AuthContext.jsx` | - | `my_profile`, `my_shop_access` | - | - |
| `src/context/ShopContext.jsx` | `categories`, `inventory`, `payments`, `purchases`, `sale_items`, `sales`, `suppliers` | `adjust_stock`, `complete_sale_v4`, `create_new_product`, `get_product_images`, `get_products`, `receive_purchase_v2`, `set_product_active`, `sync_offline_sale`, `update_product_details` | - | - |
| `src/lib/productImages.js` | - | `set_product_image` | - | - |
| `src/pages/Account.jsx` | - | `update_my_profile` | - | - |
| `src/pages/Approvals.jsx` | `cashier_shifts`, `purchase_orders`, `sale_override_requests`, `sale_return_requests`, `stock_counts`, `stock_transfers` | - | - | - |
| `src/pages/Audit.jsx` | `audit_logs` | - | - | - |
| `src/pages/AutomationHub.jsx` | `product_aliases` | `get_products`, `invoice_cancel_review`, `invoice_record_ocr_result`, `invoice_save_review_draft`, `match_product_text` | `ocr-invoice` | - |
| `src/pages/BackupRecovery.jsx` | `backup_restore_tests` | `record_backup_restore_test` | - | - |
| `src/pages/BulkProductImport.jsx` | - | `bulk_create_products`, `get_products` | - | - |
| `src/pages/Compliance.jsx` | `compliance_profiles` | `upsert_compliance_profile` | - | - |
| `src/pages/CustomerCredit.jsx` | `gift_vouchers`, `promotions` | `adjust_loyalty_points`, `create_customer`, `create_promotion`, `customer_balances`, `grant_store_credit`, `issue_gift_voucher`, `record_customer_credit` | - | - |
| `src/pages/EditProduct.jsx` | - | `get_products` | - | - |
| `src/pages/Expenses.jsx` | `expense_categories`, `expenses` | `record_expense`, `void_expense` | - | - |
| `src/pages/InventoryAgeing.jsx` | - | `fifo_receipt_lots`, `inventory_ageing_report` | - | - |
| `src/pages/InventoryIntelligence.jsx` | - | `create_purchase_order`, `inventory_health`, `stock_explanation` | - | - |
| `src/pages/InvoiceInbox.jsx` | `invoice_ingestions` | `invoice_cancel_review`, `invoice_reopen_review`, `invoice_resolve_duplicate` | - | - |
| `src/pages/OwnerAI.jsx` | - | `my_shop_memberships` | - | - |
| `src/pages/OwnerCenter.jsx` | - | `loss_control_exceptions`, `owner_center_summary`, `owner_recommendations` | - | - |
| `src/pages/OwnerExceptions.jsx` | - | `loss_control_exceptions_v2` | - | - |
| `src/pages/OwnerProfit.jsx` | - | `owner_center_summary`, `profit_by_product` | - | - |
| `src/pages/OwnerWhatsApp.jsx` | - | `owner_center_summary` | - | - |
| `src/pages/POS.jsx` | `customers`, `reason_codes`, `sale_override_requests` | `commercial_quote`, `customer_commercial_summary`, `request_sale_override` | - | - |
| `src/pages/PriceHistory.jsx` | - | `purchase_price_history` | - | - |
| `src/pages/PrinterSettings.jsx` | `shop_settings` | - | - | - |
| `src/pages/Procurement.jsx` | `purchase_orders` | `create_purchase_order`, `create_purchase_return`, `receive_purchase_order`, `receive_purchase_order_v2`, `record_supplier_payment`, `supplier_balances` | - | - |
| `src/pages/ProductCleanup.jsx` | - | `admin_delete_test_product`, `admin_product_cleanup_check` | - | - |
| `src/pages/PurchaseDetails.jsx` | `invoice_ingestions`, `purchases` | - | - | - |
| `src/pages/PurchaseIntelligence.jsx` | - | `purchase_coach_v2`, `purchase_price_history`, `supplier_intelligence`, `supplier_performance_scores`, `supplier_price_comparison` | - | - |
| `src/pages/Purchases.jsx` | - | `invoice_assert_receivable`, `invoice_cancel_review`, `invoice_link_purchase`, `invoice_save_review_draft` | - | - |
| `src/pages/Recommendations.jsx` | - | `owner_recommendations` | - | - |
| `src/pages/Reorder.jsx` | - | `create_purchase_order`, `reorder_suggestions` | - | - |
| `src/pages/ReportsConsolidated.jsx` | `expenses` | `accountant_export_v2` | - | - |
| `src/pages/Returns.jsx` | `sale_return_requests` | `create_return_request`, `void_sale` | - | - |
| `src/pages/SaleDetails.jsx` | `payments`, `sale_items`, `sales` | - | - | - |
| `src/pages/Settings.jsx` | - | `demo_reset_current_shop`, `get_shop_configuration`, `update_shop_configuration` | - | - |
| `src/pages/Shifts.jsx` | `cashier_shifts` | `approve_shift_close`, `open_shift`, `request_close_shift`, `revise_shift_actual_cash` | - | - |
| `src/pages/StockCount.jsx` | `stock_count_items`, `stock_counts` | `approve_stock_count`, `create_stock_count`, `mark_unseen_stock_count_zero`, `set_stock_count_quantity`, `stock_count_scan`, `submit_stock_count` | - | - |
| `src/pages/Suppliers.jsx` | `suppliers` | - | - | - |
| `src/pages/Transfers.jsx` | `stock_transfers` | `available_transfer_destinations`, `create_stock_transfer` | - | - |
| `src/pages/Users.jsx` | - | - | `manage-shop-users` | - |
| `supabase/functions/invoice-automation-ingest/index.ts` | `invoice_ingestion_channels`, `invoice_ingestions`, `purchases` | - | - | - |
| `supabase/functions/manage-shop-users/index.ts` | `profiles`, `shops`, `user_shop_memberships` | - | - | - |
| `supabase/functions/ocr-invoice/index.ts` | `profiles` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/functions-js/dist/main/FunctionsClient.d.ts` | - | - | `hello`, `hello-world` | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/functions-js/dist/main/FunctionsClient.js` | - | - | `hello`, `hello-world` | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/functions-js/dist/module/FunctionsClient.d.ts` | - | - | `hello`, `hello-world` | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/functions-js/dist/module/FunctionsClient.js` | - | - | `hello`, `hello-world` | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/functions-js/src/FunctionsClient.ts` | - | - | `hello`, `hello-world` | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/dist/index.cjs` | `characters`, `countries`, `games`, `instruments`, `messages`, `mytable`, `orchestral_sections`, `profiles`, `users`, `very_big_table` | `add_one_each`, `echo`, `function_a`, `hello_world`, `list_stored_countries` | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/dist/index.mjs` | `characters`, `countries`, `games`, `instruments`, `messages`, `mytable`, `orchestral_sections`, `profiles`, `users`, `very_big_table` | `add_one_each`, `echo`, `function_a`, `hello_world`, `list_stored_countries` | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/src/PostgrestBuilder.ts` | `characters`, `countries`, `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/src/PostgrestClient.ts` | `profiles` | `add_one_each`, `echo`, `function_a`, `hello_world`, `list_stored_countries` | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/src/PostgrestFilterBuilder.ts` | `characters`, `classes`, `countries`, `issues`, `orchestral_sections`, `quotes`, `reservations`, `texts`, `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/src/PostgrestQueryBuilder.ts` | `characters`, `countries`, `games`, `instruments`, `messages`, `mytable`, `orchestral_sections`, `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/postgrest-js/src/PostgrestTransformBuilder.ts` | `characters`, `countries`, `instruments`, `orchestral_sections`, `very_big_table` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/dist/index.cjs` | `analytics-data`, `avatars`, `bucket`, `embeddings-prod`, `public-bucket` | - | - | `avatars` |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/dist/index.mjs` | `analytics-data`, `avatars`, `bucket`, `embeddings-prod`, `public-bucket` | - | - | `avatars` |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/packages/StorageAnalyticsClient.ts` | `analytics-data` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/packages/StorageFileApi.ts` | `avatars`, `public-bucket` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/packages/StorageVectorsClient.ts` | `embeddings-prod` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/packages/VectorDataApi.ts` | `bucket` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/packages/VectorIndexApi.ts` | `bucket` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/storage-js/src/StorageClient.ts` | `avatars` | - | - | `avatars` |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/supabase-js/dist/index.cjs` | `profiles`, `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/supabase-js/dist/index.mjs` | `profiles`, `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/supabase-js/src/index.ts` | `profiles` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/supabase-js/src/lib/types.ts` | `users` | - | - | - |
| `azure-functions/ai-owner-assistant/node_modules/@supabase/supabase-js/src/SupabaseClient.ts` | `profiles`, `users` | - | - | - |
| `azure-functions/v3-invoice-api/src/invoiceStorage.js` | `invoice_ingestions`, `profiles` | - | - | - |
