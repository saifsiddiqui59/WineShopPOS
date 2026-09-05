# WineShopPOS V2 — Repository Baseline

- Run: `20260831_045314`
- Branch: `main`
- Local HEAD: `46f35e0de292dd219eb034859f83a374d7bf3c9b`
- origin/main HEAD: `46f35e0de292dd219eb034859f83a374d7bf3c9b`
- Tracked working tree dirty: `1`

## git status
```text
 M supabase/migrations/20260829190000_chapters_16_26.sql
 M supabase/migrations/20260829233000_master_reconsolidation.sql
 M supabase/migrations/20260830070000_ai_owner_assistant_v1.sql
?? 00_WINESHOPPOS_SOP_READ_ONLY_PREFLIGHT.sh
?? 00_cleanup_partial_ai_pushes.sh
?? "01_RECOVER_wineshoppos_docs_reconcile_push (1).sh"
?? 01_RECOVER_wineshoppos_docs_reconcile_push.sh
?? 01_wineshoppos_docs_reconcile_push.sh
?? 02_1_help_manual_sync_push.sh
?? 02_CONTINUE_after_health404.sh
?? 02_CONTINUE_from_healthy_baseline.sh
?? 02_FIX2_coretools_remote_build.sh
?? 02_FIX_remote_build_function_discovery.sh
?? "02_RECOVER_wineshoppos_ai_app_help_push (1).sh"
?? 02_RECOVER_wineshoppos_ai_app_help_push.sh
?? 02_SAFE_RECOVER_push2_via_zipdeploy.sh
?? 02_wineshoppos_ai_app_help_push.sh
?? 03A_trace_preflight_resolve_appinsights.sh
?? 03_CONTINUE_add_required_appinsights_metadata.sh
?? 03_CONTINUE_fix_gitbash_pathconv.sh
?? "03_CONTINUE_project_mi_tracing_final (1).sh"
?? 03_CONTINUE_project_mi_tracing_final.sh
?? "03_FINAL_appinsights_foundry_evaluation_push (1).sh"
?? 03_FINAL_appinsights_foundry_evaluation_push.sh
?? 03_RECOVER_wineshoppos_appinsights_foundry_evaluation_push.sh
?? 03_REPAIR_foundry_connection_no_msys_conversion.sh
?? 03_SERVER_SIDE_TRACING_CONNECT_FINAL.sh
?? 03_TRACE_EVALUATION_FINAL_v2.sh
?? 03_wineshoppos_appinsights_foundry_evaluation_push.sh
?? 04_SAAS_HELP_AND_CANONICAL_DOCS_RECONCILE.sh
?? 05_FIX_FOUNDRY_MONITOR_HUMAN_ACCESS.sh
?? 06B_REPAIR_FOUNDRY_TARGET_POWERSHELL_FIXED.sh
?? 06C_GIT_BASH_ONLY_REPAIR_FOUNDRY_TARGET.sh
?? 06D_GIT_BASH_ONLY_NO_ENV_CONVERSION.sh
?? 06_REPAIR_FOUNDRY_TARGET_VIA_POWERSHELL.sh
?? 07B_PRODUCT_MASTER_OCR_BULK_SKU_DIRTY_TREE_SINGLE_PUSH.sh
?? 07C_PRODUCT_MASTER_REAL_CATALOGUE_SINGLE_PUSH.sh
?? 07D_PRODUCT_MASTER_REAL_CATALOGUE_SINGLE_PUSH.sh
?? 07E_PRODUCT_MASTER_REAL_CATALOGUE_SINGLE_PUSH.sh
?? "07F_CONTINUE_PRODUCT_MASTER_AFTER_AZURE_RBAC (1).sh"
?? 07F_CONTINUE_PRODUCT_MASTER_AFTER_AZURE_RBAC.sh
?? 07_FIX_HELP_DEPLOY_AND_DOCUMENT_MONITOR_STATUS.sh
?? 07_PRODUCT_MASTER_OCR_BULK_SKU_SINGLE_PUSH.sh
?? 08B_CONTINUE_FROM_DOC_WHITESPACE_ONLY.sh
?? 08_CONTINUE_HELP_MANUAL_MONITOR_DOCS_SOP.sh
?? 09_CONTINUE_REMOVE_HELP_CATEGORY_USE_ACCOUNT_MANUAL.sh
?? 10_AI_TRACE_E2E_READ_ONLY_VERIFY.sh
?? WineShopPOS_Ch16_26_Final_Release/
?? WineShopPOS_Master_Reconsolidation_Final/
?? docs/code-history/README.md_before_v2_20260830_071729.md
?? docs/code-history/V2_PREVIOUS_README.md_20260830_065028.md
?? docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md
?? docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md
?? docs/code-history/docs_PROJECT_CONTEXT.md_before_v2_20260830_071729.md
?? docs/code-history/docs_README.md_before_v2_20260830_071729.md
?? docs/code-history/v2-doc-fix-20260830_072221/
?? docs/v2/AI_PRODUCTION_BASELINE.md
?? docs/v2/CODING_AGENT_EXECUTION_PROMPT.md
?? docs/v2/README.md
?? docs/v2/audit/AI_PRODUCTION_QUALITY_INVENTORY.md
?? docs/v2/audit/API_RLS_RPC_INVENTORY.md
?? docs/v2/audit/BUTTON_ACTION_INVENTORY.md
?? docs/v2/audit/DEPLOYMENT_REPOSITORY_DRIFT.md
?? docs/v2/audit/DOCUMENTATION_UPDATE_STATUS.md
?? docs/v2/audit/FEATURE_MATRIX.md
?? docs/v2/audit/FINAL_REPORT_TEMPLATE.md
?? docs/v2/audit/IMPLEMENTATION_LEDGER.md
?? docs/v2/audit/REGRESSION_PROTECTION_MATRIX.md
?? docs/v2/audit/ROLE_SECURITY_INVENTORY.md
?? docs/v2/audit/ROUTE_INVENTORY.md
?? docs/v2/audit/TEST_FRAMEWORK_INVENTORY.md
?? docs/v2/audit/VALIDATION_RESULTS.md
?? docs/v2/chapters/
?? docs/v2/evidence/
?? finalize_git_documentation.sh
?? generate_code_history_1_7.sh
?? patch_supplier_master_ocr.sh
?? sample_india_liquor_invoice_test.pdf
?? wineshoppos_ocr_test_and_git.sh
?? wineshoppos_ocr_test_node_v2.sh
?? wineshoppos_ocr_test_node_v3.sh
?? wineshoppos_v2_batch1_inventory_cost.sh
?? wineshoppos_v2_batch2_RECOVER.sh
?? wineshoppos_v2_batch2_controls_approvals.sh
?? wineshoppos_v2_docs_only.sh
?? wineshoppos_v2_final_business_features.sh
?? wineshoppos_v2_master_executor.sh
?? wineshoppos_v2_phase1_inventory_ocr_FINAL.sh
?? wineshoppos_v2_pos_billing_ui_polish.sh
?? wineshoppos_v2_unified_docs_fix.sh
```

## Last 15 commits
```text
46f35e0 docs: record Help entry simplification code history
67828ac feat: simplify Help access to full user manual
6bf05eb fix: keep product Help manual SaaS-focused
8ddad2f docs: record Product Master real-catalogue implementation
771ee02 feat: add real Product Master OCR bulk onboarding
47fc2d9 feat: productionize help center and reconcile Push 3 docs
00250ea docs: record verified Foundry tracing connection
d2112f7 feat: expose current user manual in app help and Owner AI
92901ce feat: add read-only WineShopPOS functionality knowledge to Owner AI
49e62f0 docs: reconcile V2 current implementation documentation
b41f02c docs: reconcile V2 current implementation documentation
40b5ade fix: polish POS billing layout and receipt UI
5ba5033 feat: complete V2 commercial accounting and intelligence
75a8442 feat: add V2 sale override controls and approvals
01a7b07 feat: add V2 inventory cost and OCR receipt foundation
```
