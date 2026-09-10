# Generated Source Data-Access Inventory

Status: GENERATED_INFERENCE

This file is machine-generated from source text. It is not authoritative until curated/verified.

| Source | Direct tables/views | RPCs | Edge functions | Storage buckets | Browser keys |
|---|---|---|---|---|---|
| `src/components/LegalAdminCard.jsx` | - | `saas_admin_get_v4_flags`, `saas_admin_list_legal_documents`, `saas_admin_set_legal_notice` | - | - | - |
| `src/components/LegalNoticeBoundary.jsx` | - | `accept_legal_notice`, `my_legal_notice` | - | - | - |
| `src/components/PurchaseCorrectionPanel.jsx` | - | `correct_received_purchase_item`, `get_purchase_item_corrections` | - | - | - |
| `src/components/PurchaseVerificationEngine.jsx` | - | `get_purchase_verification_state`, `reopen_purchase_financial_exception`, `resolve_purchase_financial_exception` | - | - | - |
| `src/components/Receipt80mm.jsx` | `shop_settings` | - | - | - | - |
| `src/components/ShopSelector.jsx` | - | `my_shop_memberships`, `switch_shop` | - | - | - |
| `src/components/SpiritualImageTile.jsx` | - | - | - | - | `${baseKey}_height`, `${baseKey}_image` |
| `src/components/SupplierEditor.jsx` | `suppliers` | - | - | - | - |
| `src/components/ThemeToggle.jsx` | - | `update_my_theme` | - | - | - |
| `src/components/ui/SortableTable.jsx` | - | - | - | - | `wineshop_table_widths:${key}`, `wineshop_table_widths:${resizeKey}` |
| `src/context/AuthContext.jsx` | - | `my_profile`, `my_shop_access` | - | - | `wineshoppos_demo_workspace_v1` |
| `src/context/SaaSContext.jsx` | - | `my_saas_context` | - | - | - |
| `src/context/ShopContext.jsx` | `categories`, `inventory`, `payments`, `purchases`, `sale_items`, `sales`, `suppliers` | `adjust_stock`, `complete_sale_v4`, `create_new_product`, `get_product_images`, `get_products`, `receive_purchase_v3`, `set_product_active`, `sync_offline_sale`, `update_product_details` | - | - | - |
| `src/lib/productImages.js` | - | `set_product_image` | - | - | - |
| `src/pages/Account.jsx` | - | `update_my_profile` | - | - | - |
| `src/pages/AddProduct.jsx` | - | - | - | - | `wineshop_ocr_created_product` |
| `src/pages/Approvals.jsx` | `cashier_shifts`, `purchase_orders`, `sale_override_requests`, `sale_return_requests`, `stock_counts`, `stock_transfers` | - | - | - | - |
| `src/pages/Audit.jsx` | `audit_logs` | - | - | - | - |
| `src/pages/AutomationHub.jsx` | - | `invoice_cancel_review`, `invoice_record_ocr_result`, `invoice_reopen_review`, `invoice_save_review_draft`, `remember_product_alias`, `resolve_product_master_text` | `ocr-invoice` | - | - |
| `src/pages/BackupRecovery.jsx` | `backup_restore_tests` | `record_backup_restore_test` | - | - | - |
| `src/pages/BulkProductImport.jsx` | - | `bulk_create_products`, `get_products` | - | - | - |
| `src/pages/Compliance.jsx` | `compliance_profiles` | `upsert_compliance_profile` | - | - | - |
| `src/pages/CustomerCredit.jsx` | `gift_vouchers`, `promotions` | `adjust_loyalty_points`, `create_customer`, `create_promotion`, `customer_balances`, `grant_store_credit`, `issue_gift_voucher`, `record_customer_credit` | - | - | - |
| `src/pages/EditProduct.jsx` | - | `get_products` | - | - | - |
| `src/pages/Expenses.jsx` | `expense_categories`, `expenses` | `record_expense`, `void_expense` | - | - | - |
| `src/pages/InventoryAgeing.jsx` | - | `fifo_receipt_lots`, `inventory_ageing_report` | - | - | - |
| `src/pages/InventoryIntelligence.jsx` | - | `create_purchase_order`, `inventory_health`, `stock_explanation` | - | - | - |
| `src/pages/InvoiceInbox.jsx` | `invoice_ingestions` | `invoice_cancel_review`, `invoice_reopen_review`, `invoice_resolve_duplicate` | - | - | - |
| `src/pages/OwnerAI.jsx` | - | `my_shop_memberships` | - | - | - |
| `src/pages/OwnerCenter.jsx` | - | `loss_control_exceptions_v3`, `owner_center_summary`, `owner_recommendations` | - | - | - |
| `src/pages/OwnerExceptions.jsx` | - | `loss_control_exceptions_v3`, `loss_control_resolved_activity_v1` | - | - | - |
| `src/pages/OwnerProfit.jsx` | - | `owner_center_summary`, `profit_by_product` | - | - | - |
| `src/pages/OwnerWhatsApp.jsx` | - | `owner_center_summary` | - | - | - |
| `src/pages/PlatformAdmin.jsx` | - | `saas_admin_list_accounts`, `saas_admin_publish_announcement`, `saas_admin_set_account_by_email`, `saas_admin_set_runtime` | - | - | - |
| `src/pages/POS.jsx` | `cashier_shifts`, `customers`, `reason_codes`, `sale_override_requests` | `commercial_quote`, `customer_commercial_summary`, `open_shift`, `request_sale_override` | - | - | - |
| `src/pages/PriceHistory.jsx` | - | `purchase_price_history` | - | - | - |
| `src/pages/PrinterSettings.jsx` | `shop_settings` | - | - | - | - |
| `src/pages/Procurement.jsx` | `purchase_orders` | `create_purchase_order`, `create_purchase_return`, `receive_purchase_order`, `receive_purchase_order_v2`, `record_supplier_payment`, `supplier_balances` | - | - | - |
| `src/pages/ProductCleanup.jsx` | - | `admin_delete_test_product`, `admin_product_cleanup_check` | - | - | - |
| `src/pages/PurchaseDetails.jsx` | `invoice_ingestions`, `purchases` | `get_purchase_item_corrections` | - | - | - |
| `src/pages/PurchaseIntelligence.jsx` | - | `purchase_coach_v2`, `purchase_price_history`, `supplier_intelligence`, `supplier_performance_scores`, `supplier_price_comparison` | - | - | - |
| `src/pages/Purchases.jsx` | `invoice_ingestions`, `purchases` | `invoice_link_purchase`, `invoice_save_review_draft`, `resolve_product_master_text` | - | - | `wineshop_ocr_purchase_draft` |
| `src/pages/Recommendations.jsx` | - | `owner_recommendations` | - | - | - |
| `src/pages/Reorder.jsx` | - | `create_purchase_order`, `reorder_suggestions` | - | - | - |
| `src/pages/ReportsConsolidated.jsx` | `expenses` | `accountant_export_v2` | - | - | - |
| `src/pages/Returns.jsx` | `sale_return_requests` | `create_return_request`, `void_sale` | - | - | - |
| `src/pages/SaleDetails.jsx` | `payments`, `sale_items`, `sales` | - | - | - | - |
| `src/pages/Settings.jsx` | - | `demo_reset_current_shop`, `get_shop_configuration`, `update_shop_configuration` | - | - | - |
| `src/pages/Shifts.jsx` | `cashier_shifts` | `approve_shift_close`, `open_shift`, `request_close_shift`, `revise_shift_actual_cash` | - | - | - |
| `src/pages/ShopImport.jsx` | - | `onboarding_apply_import`, `onboarding_validate_import` | - | - | - |
| `src/pages/StockCount.jsx` | `stock_count_items`, `stock_counts` | `approve_stock_count`, `create_stock_count`, `mark_unseen_stock_count_zero`, `set_stock_count_quantity`, `stock_count_scan`, `submit_stock_count` | - | - | - |
| `src/pages/Suppliers.jsx` | `suppliers` | - | - | - | - |
| `src/pages/Transfers.jsx` | `stock_transfers` | `available_transfer_destinations`, `create_stock_transfer` | - | - | - |
| `src/pages/Users.jsx` | - | - | `manage-shop-users` | - | - |
| `supabase/functions/invoice-automation-ingest/index.ts` | `invoice_ingestion_channels`, `invoice_ingestions`, `purchases` | - | - | - | - |
| `supabase/functions/manage-shop-users/index.ts` | `profiles`, `shops`, `user_shop_memberships` | - | - | - | - |
| `supabase/functions/ocr-invoice/index.ts` | `profiles` | - | - | - | - |
| `supabase/functions/product-enrichment/index.ts` | `audit_logs`, `product_aliases`, `product_enrichment_cache`, `products`, `profiles`, `shops`, `user_shop_memberships` | `set_product_image` | - | - | - |
| `azure-functions/v3-invoice-api/src/invoiceStorage.js` | `invoice_ingestions`, `profiles` | - | - | - | - |
