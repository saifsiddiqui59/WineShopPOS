# WineShopPOS V5 — Current PROD Repository Tree

Status: **AUTHORITATIVE PROD/MAIN TREE SNAPSHOT — 2026-09-15**

## Snapshot identity

- Repository: `saifsiddiqui59/WineShopPOS`
- Current generation: `v5`
- Source branch inspected: `main`
- Repository base used to generate this snapshot: `0ffe5335278c4075c81629e3807738bae702c66b`
- Deployed application runtime SHA: `0ffe5335278c4075c81629e3807738bae702c66b`
- PROD frontend: `https://wineshoppos.z29.web.core.windows.net/`
- PROD Supabase ref: `uiurgplnsgmawvxhjzzp`
- Financial SSoT all-10 release: **PASS**

The application runtime SHA and the Git `main` HEAD can differ after this file
is committed because this is a **documentation-only commit**. A newer docs-only
Git SHA does not mean a newer frontend artifact was deployed.

## Production-state notes

- Financial backend migrations are already live and verified.
- No sales, purchases, returns, shifts or stock transactions were replayed by
  the all-10 financial release.
- `20260915040745_financial_india_business_dates_v2.sql` is tracked in Git.
- Exact Git source bodies for live migrations `20260915035201`,
  `20260915050757`, and `20260915050958` remain **PENDING_DNS**.
- Do not use database push, migration repair or migration replay to close that
  source-history-only gap.
- Authenticated read-only financial cross-page visual UAT remains **PENDING**.

## Tree interpretation

This is the tracked repository structure used as the current V5 PROD source
authority, plus this documentation file being added by the same docs-only
commit. It is a **Git source tree**, not a listing of files physically uploaded
to Azure `$web`.

Top-level tracked file counts:

| Top-level path | Files |
|---|---:|
| `.env.example` | 1 |
| `.gitattributes` | 1 |
| `.github` | 2 |
| `.gitignore` | 1 |
| `.oxlintrc.json` | 1 |
| `AGENTS.md` | 1 |
| `AI_10_RUN_LIVE_FOUNDRY_EVALUATION_V3.sh` | 1 |
| `README.md` | 1 |
| `WineShopPOS_Windows_App_Remove.cmd` | 1 |
| `WineShopPOS_Windows_App_Setup.cmd` | 1 |
| `apply_auth_users.sh` | 1 |
| `apply_chapters_9_to_12.sh` | 1 |
| `azure-functions` | 20 |
| `deploy_azure_blob.sh` | 1 |
| `docs` | 445 |
| `finalize_wineshoppos.sh` | 1 |
| `index.html` | 1 |
| `infra` | 3 |
| `package-lock.json` | 1 |
| `package.json` | 1 |
| `playwright.config.mjs` | 1 |
| `public` | 16 |
| `scripts` | 35 |
| `src` | 147 |
| `supabase` | 55 |
| `supabase_multi_shop_schema.sql` | 1 |
| `tests` | 44 |
| `vite.config.js` | 1 |

Total tracked/new documentation files represented: **786**

## Complete current repository tree

```text
WineShopPOS/
├── .github/
│   └── workflows/
│       ├── ai-11-owner-ai-quality-gate.yml
│       └── environment-isolation.yml
├── azure-functions/
│   ├── ai-owner-assistant/
│   │   ├── scripts/
│   │   │   └── configure-agent.mjs
│   │   ├── src/
│   │   │   ├── agentConfig.js
│   │   │   ├── appKnowledge.js
│   │   │   ├── index.js
│   │   │   └── security.js
│   │   ├── tests/
│   │   │   ├── appKnowledge.test.mjs
│   │   │   └── security-contract.test.mjs
│   │   ├── .funcignore
│   │   ├── .gitignore
│   │   ├── host.json
│   │   ├── package-lock.json
│   │   └── package.json
│   └── v3-invoice-api/
│       ├── src/
│       │   ├── emailInvoicePoller.js
│       │   ├── index.js
│       │   ├── invoiceStorage.js
│       │   └── whatsappWebhook.js
│       ├── .funcignore
│       ├── host.json
│       ├── package-lock.json
│       └── package.json
├── docs/
│   ├── backups/
│   │   └── prod/
│   │       ├── 2026-09-04-local-working-copy-doc-ingest.json
│   │       ├── 2026-09-04-pre-version-restructure-manifest.json
│   │       └── 2026-09-04-pre-version-restructure.md
│   ├── handbook/
│   │   └── WineShopPOS_Developer_Handbook_Master_Reconsolidation.md
│   ├── manual/
│   │   └── WineShopPOS_User_Manual_Master_Reconsolidation.md
│   ├── security/
│   │   ├── SECURITY_MASTER_POLICY.md
│   │   ├── SECURITY_MASTER_STATUS.md
│   │   └── V3_SECURITY_DEFINER_RPC_HARDENING.md
│   ├── shared/
│   │   ├── governance/
│   │   │   ├── DOCUMENTATION_STANDARD.md
│   │   │   ├── NEW_VERSION_BOOTSTRAP_AND_CONTINUITY_STANDARD.md
│   │   │   └── VERSION_CLASSIFICATION_RULES.md
│   │   ├── release/
│   │   │   ├── END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md
│   │   │   ├── FINANCIAL_SSOT_LIVE_MIGRATION_MANIFEST_20260915.md
│   │   │   ├── README.md
│   │   │   └── RELEASE_EXECUTOR_FAILURE_REGISTER.md
│   │   └── templates/
│   │       ├── ADR_TEMPLATE.md
│   │       ├── FEATURE_DOCUMENT_TEMPLATE.md
│   │       ├── RPC_DOCUMENT_TEMPLATE.md
│   │       └── TABLE_DOCUMENT_TEMPLATE.md
│   ├── testing/
│   │   ├── MASTER_RECONSOLIDATION_TEST_MATRIX.md
│   │   └── V5F1_REBUILT_OCR_PRODUCT_ENRICHMENT_UAT.md
│   ├── versions/
│   │   ├── v1/
│   │   │   ├── releases/
│   │   │   │   └── history/
│   │   │   │       ├── chapters/
│   │   │   │       │   ├── 01-foundation.md
│   │   │   │       │   ├── 02-ui-shell.md
│   │   │   │       │   ├── 03-product-master.md
│   │   │   │       │   ├── 04-pos.md
│   │   │   │       │   ├── 05-barcode-scanner.md
│   │   │   │       │   ├── 06-local-inventory.md
│   │   │   │       │   ├── 07-receive-stock.md
│   │   │   │       │   ├── 09-payments-sales.md
│   │   │   │       │   ├── 11-reports.md
│   │   │   │       │   ├── 12-backup.md
│   │   │   │       │   ├── 16-professional-barcode-scanner.md
│   │   │   │       │   ├── 21-supplier-purchase-improvements.md
│   │   │   │       │   └── 22-smart-reordering.md
│   │   │   │       ├── code-history/
│   │   │   │       │   ├── chapter-01-code.md
│   │   │   │       │   ├── chapter-02-code.md
│   │   │   │       │   ├── chapter-03-code.md
│   │   │   │       │   ├── chapter-04-code.md
│   │   │   │       │   ├── chapter-05-code.md
│   │   │   │       │   ├── chapter-06-code.md
│   │   │   │       │   ├── chapter-07-code.md
│   │   │   │       │   ├── chapter-16-code.md
│   │   │   │       │   ├── chapters-01-07-combined.md
│   │   │   │       │   ├── README-16-26.md
│   │   │   │       │   └── README.md
│   │   │   │       ├── handbook/
│   │   │   │       │   ├── WineShopPOS_Developer_Handbook.docx
│   │   │   │       │   └── WineShopPOS_Developer_Handbook_Chapters_16_26.docx
│   │   │   │       └── manual/
│   │   │   │           ├── WineShopPOS_User_Manual.docx
│   │   │   │           └── WineShopPOS_User_Manual_Advanced.docx
│   │   │   └── README.md
│   │   ├── v2/
│   │   │   ├── architecture/
│   │   │   │   └── PROJECT_CONTEXT.md
│   │   │   ├── operations/
│   │   │   │   ├── AI_PRODUCTION_BASELINE.md
│   │   │   │   └── DEVELOPER_HANDBOOK.md
│   │   │   ├── reference/
│   │   │   │   ├── data/
│   │   │   │   │   └── TABLE_CATALOG.md
│   │   │   │   ├── generated/
│   │   │   │   │   ├── SOURCE_DATA_ACCESS.md
│   │   │   │   │   └── traceability.generated.json
│   │   │   │   └── interfaces/
│   │   │   │       └── RPC_CATALOG.md
│   │   │   ├── releases/
│   │   │   │   ├── history/
│   │   │   │   │   ├── ai/
│   │   │   │   │   │   ├── evaluation/
│   │   │   │   │   │   │   └── README.md
│   │   │   │   │   │   ├── AI_10_AI_11_RELEASE_GATE.md
│   │   │   │   │   │   ├── AI_OBSERVABILITY_EVALUATION_PLAN.md
│   │   │   │   │   │   ├── AI_OWNER_ASSISTANT_V1.md
│   │   │   │   │   │   ├── AZURE_SUPABASE_CONFIGURATION.md
│   │   │   │   │   │   ├── CURRENT_AI_INFRASTRUCTURE_STATUS.md
│   │   │   │   │   │   ├── DEPLOYMENT_METADATA.md
│   │   │   │   │   │   ├── DEPLOYMENT_RUNBOOK.md
│   │   │   │   │   │   └── SECURITY_AND_TENANT_ISOLATION.md
│   │   │   │   │   ├── azure/
│   │   │   │   │   │   └── DOCUMENT_INTELLIGENCE_RESOURCE.md
│   │   │   │   │   ├── chapters/
│   │   │   │   │   │   ├── 08-product-master.md
│   │   │   │   │   │   ├── 10-dashboard.md
│   │   │   │   │   │   ├── 13-azure-blob-hosting.md
│   │   │   │   │   │   ├── 14-auth-multishop-users.md
│   │   │   │   │   │   ├── 15-supabase-live-production.md
│   │   │   │   │   │   ├── 17-returns-refunds-voids.md
│   │   │   │   │   │   ├── 18-cashier-shift-day-close.md
│   │   │   │   │   │   ├── 19-physical-stock-count.md
│   │   │   │   │   │   ├── 20-thermal-receipt-printer.md
│   │   │   │   │   │   ├── 23-multi-shop-stock-transfer.md
│   │   │   │   │   │   ├── 24-owner-controls-audit.md
│   │   │   │   │   │   ├── 25-offline-pos.md
│   │   │   │   │   │   ├── 26-ocr-compliance-automation.md
│   │   │   │   │   │   ├── V2-01-current-production-baseline.md
│   │   │   │   │   │   ├── V2-02-discovery-feature-classification.md
│   │   │   │   │   │   ├── V2-03-inventory-cost-lots-ageing-fifo.md
│   │   │   │   │   │   ├── V2-04-controls-reasons-approvals.md
│   │   │   │   │   │   ├── V2-05-customer-commercial.md
│   │   │   │   │   │   ├── V2-06-purchase-intelligence.md
│   │   │   │   │   │   ├── V2-07-operations-accounting.md
│   │   │   │   │   │   ├── V2-08-reliability-security-hardware.md
│   │   │   │   │   │   ├── V2-09-ai-production-quality.md
│   │   │   │   │   │   └── V2-10-full-application-qa-regression.md
│   │   │   │   │   ├── code-history/
│   │   │   │   │   │   ├── ai-owner-assistant-v1.md
│   │   │   │   │   │   ├── chapter-17-code.md
│   │   │   │   │   │   ├── chapter-18-code.md
│   │   │   │   │   │   ├── chapter-19-code.md
│   │   │   │   │   │   ├── chapter-20-code.md
│   │   │   │   │   │   ├── chapter-21-code.md
│   │   │   │   │   │   ├── chapter-22-code.md
│   │   │   │   │   │   ├── chapter-23-code.md
│   │   │   │   │   │   ├── chapter-24-code.md
│   │   │   │   │   │   ├── chapter-25-code.md
│   │   │   │   │   │   ├── chapter-26-code.md
│   │   │   │   │   │   ├── chapters-16-26-release.md
│   │   │   │   │   │   ├── help-entry-full-manual-only-20260831.md
│   │   │   │   │   │   ├── help-user-manual-saas-20260831.md
│   │   │   │   │   │   ├── master-reconsolidation-release.md
│   │   │   │   │   │   ├── patch-supplier-ocr-20260830.md
│   │   │   │   │   │   └── product-master-real-catalogue-20260831.md
│   │   │   │   │   ├── environment/
│   │   │   │   │   │   └── ENVIRONMENT_ISOLATION.md
│   │   │   │   │   ├── handbook/
│   │   │   │   │   │   ├── WineShopPOS_Developer_Handbook.md
│   │   │   │   │   │   ├── WineShopPOS_Developer_Handbook_Ch16_26.md
│   │   │   │   │   │   └── WineShopPOS_Developer_Handbook_Master_Reconsolidation.docx
│   │   │   │   │   ├── handoff/
│   │   │   │   │   │   ├── AI_CLOUD_POLICY_LATEST.txt
│   │   │   │   │   │   ├── NEXT_CHAT_CONTEXT.txt
│   │   │   │   │   │   ├── NEXT_CHAT_CONTEXT_AI_V1.txt
│   │   │   │   │   │   ├── NEXT_CHAT_CONTEXT_CH16_26.txt
│   │   │   │   │   │   └── NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt
│   │   │   │   │   ├── local-working-copy/
│   │   │   │   │   │   ├── code-history/
│   │   │   │   │   │   │   ├── v2-doc-fix-20260830_072221/
│   │   │   │   │   │   │   │   ├── docs_AI_PRODUCTION_BASELINE.md
│   │   │   │   │   │   │   │   ├── docs_DOCUMENTATION_REGISTER.md
│   │   │   │   │   │   │   │   ├── docs_handbook_WineShopPOS_Developer_Handbook_Master_Reconsolidation.md
│   │   │   │   │   │   │   │   ├── docs_manual_WineShopPOS_User_Manual_Master_Reconsolidation.md
│   │   │   │   │   │   │   │   ├── docs_PROJECT_CONTEXT.md
│   │   │   │   │   │   │   │   ├── docs_README.md
│   │   │   │   │   │   │   │   └── README.md
│   │   │   │   │   │   │   ├── docs_PROJECT_CONTEXT.md_before_v2_20260830_071729.md
│   │   │   │   │   │   │   ├── docs_README.md_before_v2_20260830_071729.md
│   │   │   │   │   │   │   ├── README.md_before_v2_20260830_071729.md
│   │   │   │   │   │   │   ├── V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md
│   │   │   │   │   │   │   ├── V2_PREVIOUS_docs_README.md_20260830_065028.md
│   │   │   │   │   │   │   └── V2_PREVIOUS_README.md_20260830_065028.md
│   │   │   │   │   │   └── v2/
│   │   │   │   │   │       ├── audit/
│   │   │   │   │   │       │   ├── AI_PRODUCTION_QUALITY_INVENTORY.md
│   │   │   │   │   │       │   ├── API_RLS_RPC_INVENTORY.md
│   │   │   │   │   │       │   ├── BUTTON_ACTION_INVENTORY.md
│   │   │   │   │   │       │   ├── DEPLOYMENT_REPOSITORY_DRIFT.md
│   │   │   │   │   │       │   ├── DOCUMENTATION_UPDATE_STATUS.md
│   │   │   │   │   │       │   ├── FEATURE_MATRIX.md
│   │   │   │   │   │       │   ├── FINAL_REPORT_TEMPLATE.md
│   │   │   │   │   │       │   ├── IMPLEMENTATION_LEDGER.md
│   │   │   │   │   │       │   ├── REGRESSION_PROTECTION_MATRIX.md
│   │   │   │   │   │       │   ├── ROLE_SECURITY_INVENTORY.md
│   │   │   │   │   │       │   ├── ROUTE_INVENTORY.md
│   │   │   │   │   │       │   ├── TEST_FRAMEWORK_INVENTORY.md
│   │   │   │   │   │       │   └── VALIDATION_RESULTS.md
│   │   │   │   │   │       ├── chapters/
│   │   │   │   │   │       │   ├── v2-01-current-production-baseline.md
│   │   │   │   │   │       │   ├── v2-02-discovery-feature-classification.md
│   │   │   │   │   │       │   ├── v2-03-inventory-cost-lots-ageing-fifo.md
│   │   │   │   │   │       │   ├── v2-04-controls-reasons-approvals.md
│   │   │   │   │   │       │   ├── v2-05-customer-commercial.md
│   │   │   │   │   │       │   ├── v2-06-purchase-intelligence.md
│   │   │   │   │   │       │   ├── v2-07-operations-accounting.md
│   │   │   │   │   │       │   ├── v2-08-reliability-security-hardware.md
│   │   │   │   │   │       │   ├── v2-09-ai-production-quality.md
│   │   │   │   │   │       │   └── v2-10-full-application-qa-regression.md
│   │   │   │   │   │       ├── evidence/
│   │   │   │   │   │       │   ├── 00_repository_baseline.md
│   │   │   │   │   │       │   ├── 00_untracked_files.txt
│   │   │   │   │   │       │   ├── N1.txt
│   │   │   │   │   │       │   ├── N10.txt
│   │   │   │   │   │       │   ├── N11.txt
│   │   │   │   │   │       │   ├── N12.txt
│   │   │   │   │   │       │   ├── N13.txt
│   │   │   │   │   │       │   ├── N14.txt
│   │   │   │   │   │       │   ├── N15.txt
│   │   │   │   │   │       │   ├── N2.txt
│   │   │   │   │   │       │   ├── N3.txt
│   │   │   │   │   │       │   ├── N4.txt
│   │   │   │   │   │       │   ├── N5.txt
│   │   │   │   │   │       │   ├── N6.txt
│   │   │   │   │   │       │   ├── N7.txt
│   │   │   │   │   │       │   ├── N8.txt
│   │   │   │   │   │       │   └── N9.txt
│   │   │   │   │   │       ├── AI_PRODUCTION_BASELINE.md
│   │   │   │   │   │       ├── CODING_AGENT_EXECUTION_PROMPT.md
│   │   │   │   │   │       └── README.md
│   │   │   │   │   ├── manual/
│   │   │   │   │   │   ├── WineShopPOS_User_Manual.md
│   │   │   │   │   │   ├── WineShopPOS_User_Manual_Advanced.md
│   │   │   │   │   │   └── WineShopPOS_User_Manual_Master_Reconsolidation.docx
│   │   │   │   │   ├── patches/
│   │   │   │   │   │   └── 2026-08-30-supplier-ocr-workflow.md
│   │   │   │   │   ├── reconsolidation/
│   │   │   │   │   │   ├── 00_HANDSHAKES_1_3.md
│   │   │   │   │   │   ├── DEPLOYMENT_REPORT.md
│   │   │   │   │   │   ├── IMPLEMENTATION_REPORT.md
│   │   │   │   │   │   ├── MASTER_IMPLEMENTATION_SPECIFICATION.md
│   │   │   │   │   │   └── PRODUCTION_RUNBOOK.md
│   │   │   │   │   ├── testing/
│   │   │   │   │   │   ├── AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md
│   │   │   │   │   │   ├── AI_PRODUCTION_TRACE_INGESTION_VERIFICATION.md
│   │   │   │   │   │   ├── CHAPTERS_16_26_TEST_MATRIX.md
│   │   │   │   │   │   ├── FINAL_SMOKE_TEST.md
│   │   │   │   │   │   └── TEST_MATRIX.md
│   │   │   │   │   ├── v2/
│   │   │   │   │   │   ├── audit/
│   │   │   │   │   │   │   ├── AI_APP_HELP_IMPLEMENTATION_STATUS.md
│   │   │   │   │   │   │   ├── AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md
│   │   │   │   │   │   │   ├── AI_OBSERVABILITY_EVALUATION_STATUS.md
│   │   │   │   │   │   │   ├── ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md
│   │   │   │   │   │   │   ├── DOCUMENTATION_ALIGNMENT_STATUS.md
│   │   │   │   │   │   │   ├── DOCUMENTATION_RECONCILIATION_STATUS.md
│   │   │   │   │   │   │   ├── V2_BATCH2_IMPLEMENTATION_STATUS.md
│   │   │   │   │   │   │   ├── V2_FINAL_BUSINESS_FEATURES_STATUS.md
│   │   │   │   │   │   │   ├── V2_PHASE1_IMPLEMENTATION_STATUS.md
│   │   │   │   │   │   │   └── V2_UI_UX_PROGRESS.md
│   │   │   │   │   │   └── MASTER_IMPLEMENTATION_SPECIFICATION_V2.md
│   │   │   │   │   └── PRODUCTION_RUNBOOK_CH16_26.md
│   │   │   │   ├── prod-deltas/
│   │   │   │   │   ├── 2026-09-04-password-recovery.md
│   │   │   │   │   └── V3_ORIGIN_PRODUCTION_DELTA_EVIDENCE.md
│   │   │   │   └── EXCLUDED_DEVELOPMENT_EVIDENCE.md
│   │   │   ├── testing/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── evaluation-lock-v1.json
│   │   │   │   │   ├── golden-owner-assistant-v1.jsonl
│   │   │   │   │   └── quality-gates-v1.json
│   │   │   │   └── MASTER_RECONSOLIDATION_TEST_MATRIX.md
│   │   │   ├── user/
│   │   │   │   └── USER_MANUAL.md
│   │   │   └── README.md
│   │   ├── v3/
│   │   │   ├── architecture/
│   │   │   │   └── README.md
│   │   │   ├── reference/
│   │   │   │   ├── data/
│   │   │   │   │   └── TABLE_CATALOG.md
│   │   │   │   ├── generated/
│   │   │   │   │   ├── MIGRATION_FUNCTION_INVENTORY.md
│   │   │   │   │   ├── SOURCE_DATA_ACCESS.md
│   │   │   │   │   └── traceability.generated.json
│   │   │   │   └── FEATURE_TRACEABILITY_CORE.md
│   │   │   ├── releases/
│   │   │   │   ├── PROD_PROMOTION_2026-09-05.md
│   │   │   │   ├── REMOVE_HELP_MANUAL_UI_PROD_QA_2026-09-05.md
│   │   │   │   └── V3_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-05.md
│   │   │   ├── security/
│   │   │   │   └── README.md
│   │   │   ├── testing/
│   │   │   │   ├── BACKUP_RECOVERY_BROWSER_FIX.md
│   │   │   │   ├── HOSTED_PREVIEW_QUALIFICATION_2026-09-05.md
│   │   │   │   └── README.md
│   │   │   └── README.md
│   │   ├── v4/
│   │   │   ├── architecture/
│   │   │   │   ├── README.md
│   │   │   │   └── V4_COMMERCIAL_READINESS_BATCH1.md
│   │   │   ├── reference/
│   │   │   │   ├── data/
│   │   │   │   │   └── TABLE_CATALOG.md
│   │   │   │   ├── generated/
│   │   │   │   │   ├── MIGRATION_FUNCTION_INVENTORY.md
│   │   │   │   │   ├── SOURCE_DATA_ACCESS.md
│   │   │   │   │   └── traceability.generated.json
│   │   │   │   ├── FEATURE_TRACEABILITY_CORE.md
│   │   │   │   ├── README.md
│   │   │   │   ├── V4_APP_ONLY_SUBSCRIPTION_MESSAGING.md
│   │   │   │   ├── V4_APP_SETUP.md
│   │   │   │   ├── V4_ENVIRONMENT_LINKS.md
│   │   │   │   └── V4_SAAS_SUBSCRIPTION_DEMO.md
│   │   │   ├── releases/
│   │   │   │   ├── evidence/
│   │   │   │   │   ├── README.md
│   │   │   │   │   ├── SHA256SUMS.txt
│   │   │   │   │   ├── V4_12_PREPROD_RECONCILE_REPORT.SANITIZED.md
│   │   │   │   │   └── V4_12A_SAFE_DEV_MIGRATION_FETCH_REPORT.txt
│   │   │   │   ├── V4_DOCUMENTATION_GOVERNANCE_RECONCILIATION_2026-09-06.md
│   │   │   │   ├── V4_PREPROD_MIGRATION_RECONCILIATION_2026-09-06.md
│   │   │   │   ├── V4_PREPROD_RELEASE_MANIFEST_2026-09-06.json
│   │   │   │   ├── V4_PREVIEW_DEPLOYMENT.md
│   │   │   │   └── V4_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-06.md
│   │   │   ├── security/
│   │   │   │   └── README.md
│   │   │   ├── testing/
│   │   │   │   └── README.md
│   │   │   └── README.md
│   │   └── v5/
│   │       ├── architecture/
│   │       │   └── README.md
│   │       ├── features/
│   │       │   ├── POS_PHONE_TO_PC_BARCODE_SCANNER.md
│   │       │   ├── PRODUCT_ENRICHMENT_V2.md
│   │       │   ├── PRODUCT_IMAGE_AUTO_ENRICHMENT.md
│   │       │   ├── PRODUCT_IMAGE_CHOOSER_TRY_ANOTHER.md
│   │       │   ├── PRODUCT_IMAGE_POPUP_20_INDIA_GLOBAL.md
│   │       │   ├── PRODUCT_IMAGE_SERPAPI_FREE_V2.md
│   │       │   ├── V5_FINAL_CONSOLIDATION.md
│   │       │   └── V5_NON_MOBILE_UAT_FIXES.md
│   │       ├── reference/
│   │       │   ├── data/
│   │       │   │   └── TABLE_CATALOG.md
│   │       │   ├── generated/
│   │       │   │   ├── MIGRATION_FUNCTION_INVENTORY.md
│   │       │   │   ├── SOURCE_DATA_ACCESS.md
│   │       │   │   └── traceability.generated.json
│   │       │   ├── FEATURE_TRACEABILITY_CORE.md
│   │       │   └── PROD_TREE_STRUCTURE_2026-09-15.md
│   │       ├── releases/
│   │       │   ├── V5_13E_UAT_CONTINUATION_2026-09-08.md
│   │       │   ├── V5_14_PHONE_TO_PC_SCANNER_2026-09-08.md
│   │       │   ├── V5_16_COMBINED_IMAGE_PHONE_SCANNER_2026-09-08.md
│   │       │   ├── V5_17_MOBILE_CAMERA_BARCODE_RECOGNITION_2026-09-08.md
│   │       │   ├── V5_19_GLOBAL_PHONE_SCANNER_IMAGE_FLOW_2026-09-08.md
│   │       │   ├── V5_20E_PRESAVE_IMAGE_OCR_SCANNER_2026-09-09.md
│   │       │   ├── V5_21_CAMERA_STARTUP_NONBLOCKING_UAT_FIX_2026-09-09.md
│   │       │   ├── V5_22_PURCHASE_IDENTITY_DUPLICATE_LINE_SAFETY_2026-09-09.md
│   │       │   ├── V5_PREVIEW_DEPLOYMENT.md
│   │       │   ├── V5_PROD_RELEASE_2026-09-13_FINAL.md
│   │       │   └── V5_TO_PROD_PROMOTION_READINESS_2026-09-10.md
│   │       ├── security/
│   │       │   └── README.md
│   │       ├── testing/
│   │       │   ├── defects/
│   │       │   │   ├── DEF-0001-invoice-16805-ocr-stored-2-lines-instead-of-3/
│   │       │   │   │   ├── occurrences/
│   │       │   │   │   │   ├── 20260911_072719/
│   │       │   │   │   │   │   └── evidence/
│   │       │   │   │   │   │       ├── EVIDENCE_MANIFEST.json
│   │       │   │   │   │   │       ├── UAT_RESULT.json
│   │       │   │   │   │   │       └── UAT_SUMMARY.md
│   │       │   │   │   │   └── 20260912_024605/
│   │       │   │   │   │       └── FINAL_EVIDENCE.md
│   │       │   │   │   ├── DEFECT.md
│   │       │   │   │   ├── meta.json
│   │       │   │   │   └── SOURCE_CONTEXT.md
│   │       │   │   ├── DEF-0002-b-3339-fresh-ocr-finance-summary-not-extracted/
│   │       │   │   │   ├── occurrences/
│   │       │   │   │   │   ├── 20260912_073429/
│   │       │   │   │   │   │   └── EVIDENCE.md
│   │       │   │   │   │   └── 20260912_084232-live-v11/
│   │       │   │   │   │       ├── B3339_AZURE_GEOMETRY.md
│   │       │   │   │   │       └── EVIDENCE.md
│   │       │   │   │   ├── DEFECT.md
│   │       │   │   │   ├── meta.json
│   │       │   │   │   └── SOURCE_CONTEXT.md
│   │       │   │   └── INDEX.md
│   │       │   ├── evidence/
│   │       │   │   ├── harness_preflight_20260913_022213/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── harness_preflight_20260913_022236/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── harness_preflight_20260913_023005/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── harness_preflight_20260913_023451/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── harness_preflight_20260913_023516/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── harness_preflight_20260913_023732/
│   │       │   │   │   ├── HARNESS_PREFLIGHT_RESULT.sanitized.json
│   │       │   │   │   ├── HARNESS_PREFLIGHT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── resume_20260912_152711/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── resume_20260912_154117/
│   │       │   │   │   ├── CLASSIFICATION.md
│   │       │   │   │   ├── EXTENDED_CERT_RESULT.sanitized.json
│   │       │   │   │   ├── EXTENDED_CERT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── resume_analytics_20260912_154858/
│   │       │   │   │   ├── CLASSIFICATION.md
│   │       │   │   │   ├── EXTENDED_CERT_RESULT.sanitized.json
│   │       │   │   │   ├── EXTENDED_CERT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── resume_reports_ledger_20260912_155306/
│   │       │   │   │   ├── EXTENDED_CERT_RESULT.sanitized.json
│   │       │   │   │   ├── EXTENDED_CERT_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   └── sanitized-console.txt
│   │       │   │   ├── success_e2e_20260913_033206/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_034054/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_035655/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_040741/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_040953/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_042225/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── success_e2e_20260913_042803/
│   │       │   │   │   ├── base-r11-console.sanitized.log
│   │       │   │   │   ├── CLASSIFICATION.txt
│   │       │   │   │   ├── delta-console.sanitized.log
│   │       │   │   │   ├── END_TO_END_RESULT.sanitized.json
│   │       │   │   │   ├── END_TO_END_SUMMARY.sanitized.md
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   └── RUN_RESULT.md
│   │       │   │   ├── ui_only_full_20260913_014348/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_015036/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_015721/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_020522/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_020846/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_021335/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_024258/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   ├── ui_only_full_20260913_024652/
│   │       │   │   │   ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │   │   ├── RUN_RESULT.md
│   │       │   │   │   ├── sanitized-console.txt
│   │       │   │   │   ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │   │   └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   │   └── ui_only_full_20260913_024731/
│   │       │   │       ├── RAW_EVIDENCE_SHA256.txt
│   │       │   │       ├── RUN_RESULT.md
│   │       │   │       ├── sanitized-console.txt
│   │       │   │       ├── UI_ONLY_RESULT.sanitized.json
│   │       │   │       └── UI_ONLY_SUMMARY.sanitized.md
│   │       │   ├── harness/
│   │       │   │   └── HARNESS_FAILURES.md
│   │       │   ├── README.md
│   │       │   ├── V5_16805_OCR_BUG_LOG.md
│   │       │   ├── V5_UAT_FAILURE_REGISTER_20260911.md
│   │       │   └── V5_UAT_HANDOFF_20260911.md
│   │       ├── PROD_READINESS.md
│   │       ├── README.md
│   │       └── V5_CURRENT_STATE_AND_CONTINUATION.md
│   ├── AI_PRODUCTION_BASELINE.md
│   ├── CURRENT_PROD_V3_PARITY.md
│   ├── CURRENT_VERSION
│   ├── DOCUMENTATION_REGISTER.md
│   ├── PROJECT_CONTEXT.md
│   ├── README.md
│   └── RELEASE_EXECUTOR_FAILURE_REGISTER.md
├── infra/
│   └── v3-api-automation/
│       ├── email-poller-scheduler.json
│       ├── logic-app-email-intake.json
│       └── logic-app-parameters.sample.json
├── public/
│   ├── brand/
│   │   ├── royal21-crown-user-v11.png
│   │   ├── royal21-exact-reference-banner-v15.png
│   │   ├── royal21-rajasthan-fort-background-v14.svg
│   │   ├── royal21-storyboard-sprite.png
│   │   ├── wineshoppos-final-lockup.png
│   │   └── wineshoppos-storyboard-sprite.png
│   ├── downloads/
│   │   ├── WineShopPOS_Customer_Windows_Setup.zip
│   │   └── WineShopPOS_Windows_Setup_README.txt
│   ├── manual/
│   │   ├── index.html
│   │   └── WineShopPOS_User_Manual.md
│   ├── templates/
│   │   ├── wineshoppos-products-opening-stock.csv
│   │   └── wineshoppos-suppliers.csv
│   ├── favicon.svg
│   ├── icons.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   ├── ai-evaluation/
│   │   ├── apply-quality-gates.mjs
│   │   ├── run-live-golden-evaluation.py
│   │   └── validate-golden-dataset.mjs
│   ├── diagnostics/
│   │   ├── check-azure-cost-readonly-v3.sh
│   │   └── DIAGNOSE_V5_16805_OCR.sh
│   ├── docs/
│   │   ├── check-doc-system.mjs
│   │   ├── generate-static-traceability.mjs
│   │   └── live-schema-export.sql
│   ├── testing/
│   │   ├── capture-v5-azure-finance-fixtures.mjs
│   │   ├── inspect-v5-azure-finance-fixture.mjs
│   │   ├── record-v5-real-defect.mjs
│   │   ├── RUN_V5_EXTENDED_BUSINESS_CERTIFICATION.sh
│   │   └── RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh
│   ├── apply_chapters_16_26.sh
│   ├── barcode-smoke.mjs
│   ├── create_document_intelligence_f0.sh
│   ├── invoice-finance-smoke.mjs
│   ├── ocr-metiri-real-regression.mjs
│   ├── ocr-semantic-table-smoke.mjs
│   ├── product-prefill-smoke.mjs
│   ├── supabase-environment-policy.mjs
│   ├── sync-user-manual.mjs
│   ├── v3-05-fifo-contract-regression.mjs
│   ├── v3-05-pack-conflict-regression.mjs
│   ├── v3-05-three-invoice-regression.mjs
│   ├── v3-backup-recovery-regression.mjs
│   ├── v3-security-definer-privilege-regression.mjs
│   ├── v3-v5f2-regression.mjs
│   ├── v3-v5f3-cancelled-review-regression.mjs
│   ├── v3-v5g-regression.mjs
│   ├── v3-v5g-route-page-audit.mjs
│   ├── v3-v5h-regression.mjs
│   ├── v3-v5h2-stock-count-scan-recovery.mjs
│   ├── v4-commercial-readiness-regression.mjs
│   └── v4-platform-control-ux-regression.mjs
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── charts/
│   │   │   └── BusinessCharts.jsx
│   │   ├── ui/
│   │   │   ├── ActionMenu.jsx
│   │   │   ├── ConfirmationDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── FeatureTierBadge.jsx
│   │   │   ├── GlobalErrorDialog.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── MoneyDisplay.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── ProductThumb.jsx
│   │   │   ├── QuantityDisplay.jsx
│   │   │   ├── SearchFilterBar.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── ShiftRequiredDialog.jsx
│   │   │   ├── SortableTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── UserAvatar.jsx
│   │   ├── AnimatedBrand.jsx
│   │   ├── EnvironmentBadge.jsx
│   │   ├── GlobalPhoneScannerHost.jsx
│   │   ├── HomeRedirect.jsx
│   │   ├── Layout.jsx
│   │   ├── LegalAdminCard.jsx
│   │   ├── LegalNoticeBoundary.jsx
│   │   ├── MobileBarcodeScanner.jsx
│   │   ├── ModuleLayout.jsx
│   │   ├── OcrProductImagePreview.jsx
│   │   ├── OfflineStatus.jsx
│   │   ├── PhoneToPcScannerPanel.jsx
│   │   ├── ProductEnrichmentPanel.jsx
│   │   ├── ProductForm.jsx
│   │   ├── PurchaseCorrectionPanel.jsx
│   │   ├── PurchaseVerificationEngine.jsx
│   │   ├── Receipt80mm.jsx
│   │   ├── RequireAuth.jsx
│   │   ├── RequirePlatformAdmin.jsx
│   │   ├── RequireRole.jsx
│   │   ├── SaaSAccessBoundary.jsx
│   │   ├── SaaSBanner.jsx
│   │   ├── ShopSelector.jsx
│   │   ├── SidebarExtras.jsx
│   │   ├── SpiritualImageTile.jsx
│   │   ├── SupplierEditor.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── UserMenu.jsx
│   ├── config/
│   │   ├── accessMatrix.js
│   │   ├── environment.js
│   │   ├── featureCatalog.js
│   │   └── navigation.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── GlobalErrorContext.jsx
│   │   ├── SaaSContext.jsx
│   │   ├── ScannerContext.jsx
│   │   └── ShopContext.jsx
│   ├── data/
│   │   └── products.js
│   ├── lib/
│   │   ├── aiClient.js
│   │   ├── barcode.js
│   │   ├── businessDate.js
│   │   ├── clientIdentity.js
│   │   ├── connectivity.js
│   │   ├── curatedPreviewProductImages.js
│   │   ├── dateFormat.js
│   │   ├── invoiceClient.js
│   │   ├── invoicePack.js
│   │   ├── ocrLearningRules.js
│   │   ├── offlinePurchaseDraft.js
│   │   ├── offlineQueue.js
│   │   ├── onboardingImport.js
│   │   ├── packVerification.js
│   │   ├── productEnrichmentClient.js
│   │   ├── productImages.js
│   │   ├── productInference.js
│   │   ├── purchaseIdentity.js
│   │   ├── receiptPrintPreference.js
│   │   ├── supabase.js
│   │   └── theme.js
│   ├── pages/
│   │   ├── AccessControl.jsx
│   │   ├── Account.jsx
│   │   ├── AddProduct.jsx
│   │   ├── Approvals.jsx
│   │   ├── Audit.jsx
│   │   ├── AutomationHub.jsx
│   │   ├── BackupRecovery.jsx
│   │   ├── BarcodeLabels.jsx
│   │   ├── BulkProductImport.jsx
│   │   ├── Compliance.jsx
│   │   ├── CustomerCredit.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DemoWorkspace.jsx
│   │   ├── EditProduct.jsx
│   │   ├── Expenses.jsx
│   │   ├── HardwareSetup.jsx
│   │   ├── Inventory.jsx
│   │   ├── InventoryAgeing.jsx
│   │   ├── InventoryIntelligence.jsx
│   │   ├── InvoiceInbox.jsx
│   │   ├── Login.jsx
│   │   ├── OfflineQueue.jsx
│   │   ├── OwnerAI.jsx
│   │   ├── OwnerCenter.jsx
│   │   ├── OwnerExceptions.jsx
│   │   ├── OwnerProfit.jsx
│   │   ├── OwnerWhatsApp.jsx
│   │   ├── PhoneScannerRemote.jsx
│   │   ├── PhoneScannerSetup.jsx
│   │   ├── Placeholder.jsx
│   │   ├── PlatformAdmin.jsx
│   │   ├── POS.jsx
│   │   ├── PriceHistory.jsx
│   │   ├── PrinterSettings.jsx
│   │   ├── Procurement.jsx
│   │   ├── ProductCleanup.jsx
│   │   ├── Products.jsx
│   │   ├── PurchaseDetails.jsx
│   │   ├── PurchaseIntelligence.jsx
│   │   ├── Purchases.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Reorder.jsx
│   │   ├── Reports.jsx
│   │   ├── ReportsConsolidated.jsx
│   │   ├── Returns.jsx
│   │   ├── SaleDetails.jsx
│   │   ├── Sales.jsx
│   │   ├── ScannerSettings.jsx
│   │   ├── Settings.jsx
│   │   ├── Shifts.jsx
│   │   ├── ShopImport.jsx
│   │   ├── StockCount.jsx
│   │   ├── Suppliers.jsx
│   │   ├── Transfers.jsx
│   │   ├── UpdatePassword.jsx
│   │   └── Users.jsx
│   ├── aiOwnerAssistant.css
│   ├── App.css
│   ├── App.jsx
│   ├── chapters16to26.css
│   ├── chapters9to12.css
│   ├── globalError.css
│   ├── index.css
│   ├── main.jsx
│   ├── masterConsolidation.css
│   └── v4MobileProdHotfix.css
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── invoiceDocument.js
│   │   │   ├── invoiceFinance.js
│   │   │   ├── invoiceResolutionFallback.js
│   │   │   └── productEnrichmentV3.mjs
│   │   ├── invoice-automation-ingest/
│   │   │   └── index.ts
│   │   ├── manage-shop-users/
│   │   │   └── index.ts
│   │   ├── ocr-invoice/
│   │   │   └── index.ts
│   │   ├── ocr-invoice-forensic/
│   │   │   └── index.ts
│   │   └── product-enrichment/
│   │       └── index.ts
│   ├── migrations/
│   │   ├── 20260829190000_chapters_16_26.sql
│   │   ├── 20260829233000_master_reconsolidation.sql
│   │   ├── 20260830070000_ai_owner_assistant_v1.sql
│   │   ├── 20260830080000_v2_inventory_cost_lots_ocr.sql
│   │   ├── 20260830090000_v2_controls_reason_codes_approvals.sql
│   │   ├── 20260830100000_v2_commercial_accounting_intelligence.sql
│   │   ├── 20260831123000_product_master_real_catalogue.sql
│   │   ├── 20260831150000_v3_api_automation_invoice_ingestion.sql
│   │   ├── 20260831190000_v3_invoice_review_reliability.sql
│   │   ├── 20260831193000_demo_ready_fixes.sql
│   │   ├── 20260831213000_v3_ocr_precision.sql
│   │   ├── 20260901113000_v3_05_fifo_and_product_cleanup.sql
│   │   ├── 20260901204924_grant_sale_items_select_authenticated.sql
│   │   ├── 20260901211003_revise_shift_actual_cash.sql
│   │   ├── 20260901213751_product_images_v1.sql
│   │   ├── 20260902214000_v5_purchase_correction_ocr_pack_safety.sql
│   │   ├── 20260903073105_v5e_purchase_verification_resolution_engine.sql
│   │   ├── 20260903080139_v5f_product_resolver_enrichment_cache.sql
│   │   ├── 20260903084343_v5g_owner_center_exception_quality.sql
│   │   ├── 20260903114500_v5f2_alias_generated_column_fix.sql
│   │   ├── 20260903193000_v5g_page_data_consistency.sql
│   │   ├── 20260903195500_v5h_shift_gate_and_uat_cleanup.sql
│   │   ├── 20260904125419_v3_security_definer_rpc_privileges.sql
│   │   ├── 20260904162500_fix_stock_count_scan_ambiguous_product_id.sql
│   │   ├── 20260905121213_v4_saas_subscription_platform_control.sql
│   │   ├── 20260905121323_v4_saas_plan_admin_controls.sql
│   │   ├── 20260905121348_v4_saas_runtime_config_environment_neutral.sql
│   │   ├── 20260905121457_v4_saas_rpc_execute_hardening.sql
│   │   ├── 20260905121610_v4_saas_align_plan_feature_tiers.sql
│   │   ├── 20260905123241_v4_saas_public_catalog_policy_and_platform_plan_list.sql
│   │   ├── 20260905123708_v4_saas_subscription_demo_control_layer.sql
│   │   ├── 20260905204846_v3_first_five_commercial_security_hardening.sql
│   │   ├── 20260905205918_v3_set_updated_at_search_path.sql
│   │   ├── 20260905210140_v4_commercial_readiness_batch1_canonical.sql
│   │   ├── 20260906050120_v4_commercial_readiness_batch1_hardening.sql
│   │   ├── 20260906050403_v4_platform_runtime_flag_read.sql
│   │   ├── 20260909110000_v5_purchase_identity_and_legitimate_repeat_lines.sql
│   │   ├── 20260909123000_v5_atomic_purchase_product_ocr_learning.sql
│   │   ├── 20260912124500_v5_invoice_ocr_resolution_memory.sql
│   │   ├── 20260914214958_owner_financial_consistency_v1.sql
│   │   ├── 20260914215530_dashboard_financial_consistency_v1.sql
│   │   ├── 20260914215610_india_business_date_defaults_v1.sql
│   │   └── 20260915040745_financial_india_business_dates_v2.sql
│   ├── seed/
│   │   └── README.md
│   ├── .gitignore
│   └── config.toml
├── tests/
│   ├── ai-evaluation/
│   │   └── quality-gate-contract.test.mjs
│   ├── e2e/
│   │   ├── read-only.spec.mjs
│   │   ├── v4-commercial-readiness.spec.mjs
│   │   └── v5-extended-business-cert.mjs
│   ├── fixtures/
│   │   ├── ocr/
│   │   │   ├── 16805.azure-finance-raw.json
│   │   │   ├── 16845.azure-finance-raw.json
│   │   │   └── B-3339.azure-finance-raw.json
│   │   └── v5-golden-invoices.json
│   ├── financialSingleSourceTruth.test.mjs
│   ├── pos_clear_bill_state_reset.test.mjs
│   ├── productEnrichmentV2.test.mjs
│   ├── productImageAutoSafety.test.mjs
│   ├── productImageChooserTryAnother.test.mjs
│   ├── productImagePopup20IndiaGlobal.test.mjs
│   ├── productImageSerpApiFreeV2.test.mjs
│   ├── v5_13E_continuity_uat.test.mjs
│   ├── v5_15983_reviewed_identity_transport.test.mjs
│   ├── v5_20E_preSaveImageOcrScanner.test.mjs
│   ├── v5_23_atomic_purchase_ocr_learning.test.mjs
│   ├── v5_24_connectivity_draft_stability.test.mjs
│   ├── v5_25_purchase_phone_scanner_layout.test.mjs
│   ├── v5_29_inventory_verification_confirm_pack.test.mjs
│   ├── v5Any500MlPack24.test.mjs
│   ├── v5CombinedImagePhoneScanner.test.mjs
│   ├── v5Def0001FinanceEvidence.test.mjs
│   ├── v5Def0001FinanceReceiveGuard.test.mjs
│   ├── v5Def0001HarnessPolicy.test.mjs
│   ├── v5Def0001OcrLinePreservation.test.mjs
│   ├── v5Def0002AzureFixtureCapture.test.mjs
│   ├── v5Def0002B3339FinanceEvidence.test.mjs
│   ├── v5DraftSyncCleanup.test.mjs
│   ├── v5EnvironmentBadgeProdSafety.test.mjs
│   ├── v5FinalConsolidation.test.mjs
│   ├── v5GlobalPhoneScannerImageFlow.test.mjs
│   ├── v5InvoiceGoldenContracts.test.mjs
│   ├── v5InvoiceResolutionFallback.test.mjs
│   ├── v5InvoiceResolutionIntegration.test.mjs
│   ├── v5MasterCertificationProductSchema.test.mjs
│   ├── v5MobileBarcodeScannerRepair.test.mjs
│   ├── v5NonMobileUatFixes.test.mjs
│   ├── v5PhoneToPcScanner.test.mjs
│   ├── v5PurchaseIdentitySafety.test.mjs
│   ├── v5PurchaseIntelligenceTableUx.test.mjs
│   └── v5PurchaseVerificationFlow.test.mjs
├── .env.example
├── .gitattributes
├── .gitignore
├── .oxlintrc.json
├── AGENTS.md
├── AI_10_RUN_LIVE_FOUNDRY_EVALUATION_V3.sh
├── apply_auth_users.sh
├── apply_chapters_9_to_12.sh
├── deploy_azure_blob.sh
├── finalize_wineshoppos.sh
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.mjs
├── README.md
├── supabase_multi_shop_schema.sql
├── vite.config.js
├── WineShopPOS_Windows_App_Remove.cmd
└── WineShopPOS_Windows_App_Setup.cmd
```

## Primary production paths

For normal continuation work, the most important surfaces are:

- `src/` — React/Vite application source.
- `src/pages/` — POS, inventory, purchasing, reports, owner and admin screens.
- `src/context/` — authenticated/shop/business application state.
- `src/lib/` and `src/services/` — shared runtime helpers/integrations.
- `supabase/migrations/` — database source history.
- `supabase/functions/` — Supabase Edge Functions.
- `tests/` — permanent automated regression coverage.
- `scripts/` — repository tooling and qualification helpers.
- `docs/versions/v5/` — current V5 documentation.
- `docs/shared/release/` — cross-version release playbook, failure register and
  live financial migration manifest.

## New-chat authority

A new ChatGPT/coding session should not reconstruct state from old chapter
documents. Read:

1. `AGENTS.md`
2. `docs/CURRENT_VERSION`
3. `docs/DOCUMENTATION_REGISTER.md`
4. this file
5. `docs/versions/v5/V5_CURRENT_STATE_AND_CONTINUATION.md`
6. `docs/versions/v5/PROD_READINESS.md`
7. `docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md`
8. current source/migrations and verified live state for the affected system

Truth:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE STATE + VERIFIED TEST EVIDENCE > STALE DOCS > MEMORY`
