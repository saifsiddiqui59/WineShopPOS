# Help Entry Simplification — Actual Git Code History

Feature commit: `67828ac4b59447968375982c1be95bde92b4e354`

Generated from actual Git after build, lint and verified production deployment.

The rendered patch below is generated from `git show`; trailing whitespace is removed only from this documentation rendering so repository whitespace checks remain clean.

## Commit metadata and actual diff
```diff
commit 67828ac4b59447968375982c1be95bde92b4e354
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Mon Aug 31 04:17:46 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Mon Aug 31 04:17:46 2026 -0400

    feat: simplify Help access to full user manual
---
 docs/AI_PRODUCTION_BASELINE.md                     |  20 ++
 docs/DOCUMENTATION_REGISTER.md                     |   1 +
 docs/PROJECT_CONTEXT.md                            |  37 ++++
 docs/chapters/V2-09-ai-production-quality.md       |  17 ++
 .../code-history/help-user-manual-saas-20260831.md | 116 +++++++++++
 ...OS_Developer_Handbook_Master_Reconsolidation.md |  37 ++++
 .../NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt   |  26 +++
 ...neShopPOS_User_Manual_Master_Reconsolidation.md |  16 +-
 docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md |  26 +++
 .../AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md    |  48 +++++
 .../ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md   |  30 +++
 public/manual/WineShopPOS_User_Manual.md           |  16 +-
 public/manual/index.html                           |  16 +-
 src/App.jsx                                        |   3 +-
 src/config/navigation.js                           |   2 -
 src/pages/Account.jsx                              |   2 +-
 src/pages/Help.jsx                                 | 221 ---------------------
 17 files changed, 382 insertions(+), 252 deletions(-)

diff --git a/docs/AI_PRODUCTION_BASELINE.md b/docs/AI_PRODUCTION_BASELINE.md
index f36d907..d5c2f7d 100644
--- a/docs/AI_PRODUCTION_BASELINE.md
+++ b/docs/AI_PRODUCTION_BASELINE.md
@@ -127,3 +127,23 @@ No Owner AI source or Function configuration is changed by this repair.

 Tracing infrastructure is configured. End-to-end tracing is verified only after a real authenticated Owner AI interaction appears in Foundry Traces.
 <!-- AI_OBSERVABILITY_END -->
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## Foundry Monitor access / trace verification — 2026-08-31
+
+The Foundry Monitor permission problem is resolved.
+
+Current state:
+
+```text
+TRACING INFRASTRUCTURE:  CONFIGURED
+MONITOR ACCESS:          RESOLVED
+TRACE VIEW:              NO RESULTS TO SHOW
+TRACE INGESTION E2E:     NOT YET VERIFIED
+```
+
+The next verification is one fresh authenticated production Owner Assistant
+interaction followed by confirmation of the corresponding Foundry trace after
+telemetry ingestion delay. Only then should trace evaluations and quality gates
+be treated as verified.
+<!-- AI_MONITOR_STATUS_20260831_END -->
diff --git a/docs/DOCUMENTATION_REGISTER.md b/docs/DOCUMENTATION_REGISTER.md
index 47ca529..0733fda 100644
--- a/docs/DOCUMENTATION_REGISTER.md
+++ b/docs/DOCUMENTATION_REGISTER.md
@@ -17,6 +17,7 @@ WineShopPOS maintains ONE canonical copy of each living document.
 | `docs/chapters/01-*...26-*` | HISTORICAL | pre-V2 implementation history |
 | `docs/v2/*` | V2 EXECUTION RECORD | V2 specification/audit/evidence |
 | `docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md` | CURRENT AUDIT | Push-3 canonical documentation reconciliation evidence |
+| `docs/v2/audit/AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md` | CURRENT AUDIT | Monitor access resolved; trace ingestion pending E2E verification |
 | `docs/code-history/*` | HISTORICAL BACKUP | superseded snapshots |

 ## Rule
diff --git a/docs/PROJECT_CONTEXT.md b/docs/PROJECT_CONTEXT.md
index c992be2..e92bacc 100644
--- a/docs/PROJECT_CONTEXT.md
+++ b/docs/PROJECT_CONTEXT.md
@@ -268,3 +268,40 @@ Current rules:
   barcodes can be completed later through Edit Product.
 - The known legacy dummy barcode catalogue is retired from active use without
   deleting historical sale/purchase references.
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## Foundry Monitor access / trace verification — 2026-08-31
+
+Current verified/configured state:
+
+- Foundry AppInsights connection uses `ProjectManagedIdentity`.
+- The connection target is the exact Application Insights ARM resource ID.
+- The prior human permission error in the Foundry Monitor UI is resolved.
+- Owner-observed Monitor state after access repair: **No results to show**.
+
+Status boundary:
+
+```text
+MONITOR PERMISSION ISSUE: RESOLVED
+MONITOR UI ACCESS:        AVAILABLE
+TRACE RESULTS:            NO RESULTS TO SHOW
+TRACE INGESTION E2E:      NOT YET VERIFIED
+```
+
+A new authenticated production Owner Assistant interaction must appear in
+Foundry Traces before trace ingestion is described as end-to-end verified.
+Trace evaluations and deployment quality gates remain follow-on work.
+<!-- AI_MONITOR_STATUS_20260831_END -->
+
+<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
+## Help entry — simplified production SaaS UX
+
+Customer Help access is intentionally simple:
+
+- there is no standalone **Help & Manual** module in the main navigation;
+- the top-right signed-in user menu keeps **Help / About**;
+- Help / About exposes one **Open Full User Manual** button;
+- the full HTML manual remains the customer documentation surface and keeps its
+  clickable table of contents;
+- legacy `#/help` navigation redirects to Account → Help / About instead of
+  rendering a separate Help category page.
diff --git a/docs/chapters/V2-09-ai-production-quality.md b/docs/chapters/V2-09-ai-production-quality.md
index e232cb6..5e581a9 100644
--- a/docs/chapters/V2-09-ai-production-quality.md
+++ b/docs/chapters/V2-09-ai-production-quality.md
@@ -52,3 +52,20 @@ Foundry Traces.
 8. add monitoring/dashboarding and operational alerts

 AI failure must never break core POS availability.
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## Monitor access status — 2026-08-31
+
+The prior Foundry Monitor permission error is resolved.
+
+Configured/verified:
+
+- AppInsights connection authentication: `ProjectManagedIdentity`
+- connection target: exact Application Insights ARM resource ID
+- human Monitor access: available
+- current owner-observed Monitor result: **No results to show**
+
+Therefore the remaining quality boundary is trace ingestion itself, not RBAC.
+A fresh authenticated production interaction must appear in Foundry Traces
+before trace-based evaluations and deployment gates move to verified status.
+<!-- AI_MONITOR_STATUS_20260831_END -->
diff --git a/docs/code-history/help-user-manual-saas-20260831.md b/docs/code-history/help-user-manual-saas-20260831.md
new file mode 100644
index 0000000..5b5af87
--- /dev/null
+++ b/docs/code-history/help-user-manual-saas-20260831.md
@@ -0,0 +1,116 @@
+# Help/User Manual SaaS Repair — Actual Git Code History
+
+Feature commit: `6bf05ebea08f1e8edd075d628c8f40aa62e920f2`
+
+Generated from the actual feature commit after successful build, lint and verified production deployment.
+
+## Actual Git record
+```text
+commit 6bf05ebea08f1e8edd075d628c8f40aa62e920f2 (HEAD -> main)
+Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
+Date:   Mon Aug 31 03:53:58 2026 -0400
+
+    fix: keep product Help manual SaaS-focused
+---
+ ...WineShopPOS_User_Manual_Master_Reconsolidation.md | 18 ------------------
+ public/manual/WineShopPOS_User_Manual.md             | 18 ------------------
+ public/manual/index.html                             | 20 ++------------------
+ 3 files changed, 2 insertions(+), 54 deletions(-)
+
+diff --git a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
+index b0a09c9..47de090 100644
+--- a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
++++ b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
+@@ -728,24 +728,6 @@ History availability depends on retained production records and screen filters.
+ Deleted or never-retained records cannot be assumed recoverable.
+ <!-- V2_CURRENT_USER_WORKFLOWS_END -->
+
+-<!-- AI_APP_HELP_START -->
+-## Ask WineShopPOS — functionality help
+-
+-You can ask the existing Owner Assistant questions such as:
+-
+-- "How do I add bulk inventory?"
+-- "How do I scan a supplier invoice?"
+-- "How do I add a new user?"
+-- "Where can I see stock history?"
+-- "How do transfers work?"
+-- "Where do I approve a discount?"
+-- "How do loyalty points or gift vouchers work?"
+-- "How do I export for my accountant?"
+-
+-For these questions the assistant uses the verified WineShopPOS functionality
+-knowledge tool and returns the relevant app area/route, role requirements, steps
+-and cautions. It remains read-only and cannot perform the operation for you.
+-<!-- AI_APP_HELP_END -->
+
+ <!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
+ ## Product Master — real product onboarding
+diff --git a/public/manual/WineShopPOS_User_Manual.md b/public/manual/WineShopPOS_User_Manual.md
+index b0a09c9..47de090 100644
+--- a/public/manual/WineShopPOS_User_Manual.md
++++ b/public/manual/WineShopPOS_User_Manual.md
+@@ -728,24 +728,6 @@ History availability depends on retained production records and screen filters.
+ Deleted or never-retained records cannot be assumed recoverable.
+ <!-- V2_CURRENT_USER_WORKFLOWS_END -->
+
+-<!-- AI_APP_HELP_START -->
+-## Ask WineShopPOS — functionality help
+-
+-You can ask the existing Owner Assistant questions such as:
+-
+-- "How do I add bulk inventory?"
+-- "How do I scan a supplier invoice?"
+-- "How do I add a new user?"
+-- "Where can I see stock history?"
+-- "How do transfers work?"
+-- "Where do I approve a discount?"
+-- "How do loyalty points or gift vouchers work?"
+-- "How do I export for my accountant?"
+-
+-For these questions the assistant uses the verified WineShopPOS functionality
+-knowledge tool and returns the relevant app area/route, role requirements, steps
+-and cautions. It remains read-only and cannot perform the operation for you.
+-<!-- AI_APP_HELP_END -->
+
+ <!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
+ ## Product Master — real product onboarding
+diff --git a/public/manual/index.html b/public/manual/index.html
+index e6a28e7..9aa27db 100644
+--- a/public/manual/index.html
++++ b/public/manual/index.html
+@@ -51,7 +51,7 @@
+     <div class="manual-layout">
+       <aside class="toc" aria-label="Manual contents">
+         <h2>Contents</h2>
+-        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-user-manual"><span>20</span><strong>21. Help & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#ask-wineshoppos-functionality-help"><span>26</span><strong>Ask WineShopPOS — functionality help</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>27</span><strong>Product Master — real product onboarding</strong></a></div>
++        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-user-manual"><span>20</span><strong>21. Help & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>26</span><strong>Product Master — real product onboarding</strong></a></div>
+       </aside>
+       <article class="content"><h1>WineShopPOS User Manual — Master Reconsolidation</h1>
+ <!-- WINEPOS_V2_CURRENT_BEGIN -->
+@@ -617,23 +617,7 @@ management workflow, then assign the intended shop membership and role.</p>
+ </ul>
+ <p>History availability depends on retained production records and screen filters.
+ Deleted or never-retained records cannot be assumed recoverable.</p>
+-<!-- V2_CURRENT_USER_WORKFLOWS_END --><!-- AI_APP_HELP_START -->
+-<h2 id="ask-wineshoppos-functionality-help">Ask WineShopPOS — functionality help</h2>
+-<p>You can ask the existing Owner Assistant questions such as:</p>
+-<ul>
+-<li>&quot;How do I add bulk inventory?&quot;</li>
+-<li>&quot;How do I scan a supplier invoice?&quot;</li>
+-<li>&quot;How do I add a new user?&quot;</li>
+-<li>&quot;Where can I see stock history?&quot;</li>
+-<li>&quot;How do transfers work?&quot;</li>
+-<li>&quot;Where do I approve a discount?&quot;</li>
+-<li>&quot;How do loyalty points or gift vouchers work?&quot;</li>
+-<li>&quot;How do I export for my accountant?&quot;</li>
+-</ul>
+-<p>For these questions the assistant uses the verified WineShopPOS functionality
+-knowledge tool and returns the relevant app area/route, role requirements, steps
+-and cautions. It remains read-only and cannot perform the operation for you.</p>
+-<!-- AI_APP_HELP_END --><!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
++<!-- V2_CURRENT_USER_WORKFLOWS_END --><!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
+ <h2 id="product-master-real-product-onboarding">Product Master — real product onboarding</h2>
+ <h3 id="add-one-product">Add one product</h3>
+ <p>Open <strong>Products → Product Master → Add Product</strong>.</p>
+```
diff --git a/docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md b/docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md
index 4fea668..222d39d 100644
--- a/docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md
+++ b/docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md
@@ -916,3 +916,40 @@ Product Master exposes All / With Barcode / Without Barcode filtering. A Product
 created without barcode through Bulk Product Import is completed later through
 the existing Edit Product screen. Normal single-product creation continues to
 require Barcode.
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## AI observability — Monitor access resolved
+
+Foundry/Application Insights server-side tracing infrastructure remains
+configured. The prior human `not enough permission` condition in Foundry
+Monitor is resolved.
+
+Current verification boundary:
+
+```text
+Foundry connection target: EXACT APP INSIGHTS ARM ID
+Foundry auth:              ProjectManagedIdentity
+Human Monitor access:      RESOLVED
+Current trace view:        NO RESULTS TO SHOW
+Trace E2E:                 NOT YET VERIFIED
+```
+
+Do not classify tracing as end-to-end verified until a new authenticated
+production Owner Assistant request is visible in Foundry Traces.
+<!-- AI_MONITOR_STATUS_20260831_END -->
+
+<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
+## Customer Help entry
+
+The production SaaS does not expose a standalone Help module.
+
+```text
+Top-right user menu
+→ Help / About
+→ Open Full User Manual
+→ /manual/index.html
+```
+
+The previous `#/help` URL is retained only as a compatibility redirect to
+`/account?tab=about`. Do not rebuild a separate category/chapter Help page.
+The customer manual is generated from the canonical master User Manual.
diff --git a/docs/handoff/NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt b/docs/handoff/NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt
index 1747ba1..0bf032b 100644
--- a/docs/handoff/NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt
+++ b/docs/handoff/NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt
@@ -106,3 +106,29 @@ Current Product Master milestone:
 - Receive Stock remains the purchase-stock posting step
 - legacy dummy product catalogue retired from active use; history preserved
 - old applied migrations were NOT rewritten; one new additive migration carries the change
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+AI_MONITOR_STATUS_20260831
+
+Current AI observability continuation state:
+- Foundry Monitor permission issue => RESOLVED
+- Foundry connection auth => ProjectManagedIdentity
+- Foundry target => exact Application Insights ARM resource ID
+- Monitor UI => accessible
+- current trace result => No results to show
+- trace ingestion E2E => NOT YET VERIFIED
+- next action => generate one new authenticated production Owner Assistant request,
+  allow ingestion delay, then verify it in Foundry Traces
+- do not add more RBAC roles unless a new explicit permission error appears
+<!-- AI_MONITOR_STATUS_20260831_END -->
+
+<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
+HELP_ENTRY_SIMPLIFIED_20260831
+
+Customer documentation UX:
+- REMOVE standalone Help & Manual category from main navigation
+- KEEP top-right user menu -> Help / About
+- Help / About -> Open Full User Manual
+- full manual -> /manual/index.html with clickable TOC
+- #/help -> compatibility redirect to /account?tab=about
+- do not reintroduce browse-by-category Help cards/page
diff --git a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
index 47de090..a5a363c 100644
--- a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
+++ b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
@@ -498,18 +498,16 @@ For a non-admin staff row, choose **Cashier** or **Manager** in the Role field.

 Open Settings & Admin → Access Control for the complete access matrix.

-## 21. Help & User Manual
+## 21. Help / About & User Manual

-Open **Help & Manual** from the main navigation.
-
-The Help Center provides clickable chapters for the main WineShopPOS workflows,
-including billing, sales/returns, shifts, products, purchasing, inventory,
-operations, Owner Center, reports, administration and troubleshooting.
-
-Select a chapter to jump directly to its guidance, or select **Open Full User
-Manual** for the complete manual with a clickable table of contents.
+Open the user menu from your name in the top-right corner, then select
+**Help / About**.

+Select **Open Full User Manual** to open the complete WineShopPOS manual in a
+new browser tab. The manual includes its own clickable table of contents.

+WineShopPOS does not use a separate Help category in the main application
+navigation.
 <!-- SUPPLIER_MASTER_OCR_PATCH -->
 ## Supplier Master and OCR Supplier Review

diff --git a/docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md b/docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md
index 5d83c97..95a4e0c 100644
--- a/docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md
+++ b/docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md
@@ -238,3 +238,29 @@ Old URLs for Shift, Returns, Sales, Scanner, Offline Queue, Stock Count, Purchas
 - [ ] Existing Product audit trigger continues to record Product writes.
 - [ ] `npm run build` passes.
 - [ ] `npm run lint` passes.
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## AI Monitor / tracing regression — 2026-08-31
+
+- [x] Foundry Monitor no longer blocks the owner with the prior permission error.
+- [x] Foundry AppInsights connection uses `ProjectManagedIdentity`.
+- [x] Foundry connection target is an Azure ARM resource ID rather than a Git-Bash Windows path.
+- [x] Standalone Help & Manual module is removed from main navigation.
+- [x] Full User Manual is generated as HTML with a clickable table of contents.
+- [x] Product Help/manual does not instruct customers to use AI as the Help mechanism.
+- [ ] Generate a new authenticated production Owner Assistant request after tracing repair.
+- [ ] Confirm that request appears in Foundry Traces.
+- [ ] Run trace evaluation only after trace ingestion is observed.
+<!-- AI_MONITOR_STATUS_20260831_END -->
+
+<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
+## Help entry regression — 2026-08-31
+
+- [ ] Main navigation does not show a Help & Manual module/category.
+- [ ] Top-right user menu still shows Help / About.
+- [ ] Help / About shows exactly one customer-documentation action: Open Full User Manual.
+- [ ] Open Full User Manual opens `/manual/index.html`.
+- [ ] Full manual contains its clickable table of contents.
+- [ ] `#/help` redirects to Account → Help / About and does not render category cards.
+- [ ] Production application bundle does not contain `Browse by chapter`.
+- [ ] Production application bundle does not expose Git/canonical-source documentation links.
diff --git a/docs/v2/audit/AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md b/docs/v2/audit/AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md
new file mode 100644
index 0000000..055f821
--- /dev/null
+++ b/docs/v2/audit/AI_MONITOR_ACCESS_TRACE_INGESTION_STATUS.md
@@ -0,0 +1,48 @@
+# AI Monitor Access and Trace Ingestion Status
+
+Date: 2026-08-31
+
+## Status
+
+```text
+FOUNDRY MONITOR PERMISSION ISSUE: RESOLVED
+MONITOR UI ACCESS:              AVAILABLE
+TRACE RESULTS:                  NO RESULTS TO SHOW
+TRACE INGESTION E2E:            NOT YET VERIFIED
+```
+
+## Verified/configured telemetry
+
+- Foundry project: `wineshoppos-ai`
+- Application Insights: `wineshoppos-ai-insights`
+- Log Analytics workspace: `wineshoppos-ai-law`
+- Foundry AppInsights authentication: `ProjectManagedIdentity`
+- Foundry target: exact Application Insights ARM resource ID
+
+## Human access result
+
+The owner reported that the previous `not enough permission` condition is
+resolved and the Foundry Monitor surface now opens.
+
+## Current trace observation
+
+The Monitor surface currently reports:
+
+> No results to show
+
+This is not treated as successful trace ingestion.
+
+## Next E2E verification
+
+1. Sign in to the production WineShopPOS application.
+2. Generate one new authenticated Owner Assistant interaction.
+3. Allow for Application Insights / Foundry ingestion delay.
+4. Refresh Foundry Traces using a time range that includes the request.
+5. Confirm the matching production interaction appears.
+6. Only then mark trace ingestion E2E verified.
+7. Proceed to trace evaluations and quality gates.
+
+## Safety boundary
+
+This observability status does not change core POS, inventory, sales,
+purchasing, Product Master or Supabase transaction logic.
diff --git a/docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md b/docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md
index 312ac85..b62b2db 100644
--- a/docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md
+++ b/docs/v2/audit/ALL_CANONICAL_DOCS_RECONCILED_AFTER_PUSH3.md
@@ -49,3 +49,33 @@ gates remain follow-on work.
 Future changes update the existing canonical Project Context, Developer
 Handbook, User Manual, AI Production Baseline and relevant V2 chapter in place.
 Git history and audit/chapter records preserve implementation history.
+
+<!-- AI_MONITOR_STATUS_20260831_START -->
+## Post-Push-3 Monitor and Help correction
+
+Verified after the earlier Push-3 reconciliation:
+
+- standalone Help category/module is removed from the main navigation.
+- top-right Help / About exposes the full HTML User Manual.
+- full User Manual remains the customer documentation surface with a clickable TOC.
+- Foundry Monitor permission issue is resolved.
+- Current Monitor trace result is **No results to show**.
+- Trace ingestion remains explicitly **NOT YET VERIFIED E2E**.
+<!-- AI_MONITOR_STATUS_20260831_END -->
+
+<!-- HELP_ENTRY_SIMPLIFIED_20260831 -->
+## Final Help UX correction
+
+The earlier browse-by-category Help page was removed after live usability review.
+
+Final customer UX:
+
+```text
+Main navigation Help category: REMOVED
+Top-right Help / About:        KEPT
+Open Full User Manual:         AVAILABLE
+Full manual clickable TOC:     KEPT
+Legacy #/help:                 REDIRECTS TO HELP / ABOUT
+```
+
+No separate Help category/cards page should be reintroduced.
diff --git a/public/manual/WineShopPOS_User_Manual.md b/public/manual/WineShopPOS_User_Manual.md
index 47de090..a5a363c 100644
--- a/public/manual/WineShopPOS_User_Manual.md
+++ b/public/manual/WineShopPOS_User_Manual.md
@@ -498,18 +498,16 @@ For a non-admin staff row, choose **Cashier** or **Manager** in the Role field.

 Open Settings & Admin → Access Control for the complete access matrix.

-## 21. Help & User Manual
+## 21. Help / About & User Manual

-Open **Help & Manual** from the main navigation.
-
-The Help Center provides clickable chapters for the main WineShopPOS workflows,
-including billing, sales/returns, shifts, products, purchasing, inventory,
-operations, Owner Center, reports, administration and troubleshooting.
-
-Select a chapter to jump directly to its guidance, or select **Open Full User
-Manual** for the complete manual with a clickable table of contents.
+Open the user menu from your name in the top-right corner, then select
+**Help / About**.

+Select **Open Full User Manual** to open the complete WineShopPOS manual in a
+new browser tab. The manual includes its own clickable table of contents.

+WineShopPOS does not use a separate Help category in the main application
+navigation.
 <!-- SUPPLIER_MASTER_OCR_PATCH -->
 ## Supplier Master and OCR Supplier Review

diff --git a/public/manual/index.html b/public/manual/index.html
index 9aa27db..00a8bb6 100644
--- a/public/manual/index.html
+++ b/public/manual/index.html
@@ -51,7 +51,7 @@
     <div class="manual-layout">
       <aside class="toc" aria-label="Manual contents">
         <h2>Contents</h2>
-        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-user-manual"><span>20</span><strong>21. Help & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>26</span><strong>Product Master — real product onboarding</strong></a></div>
+        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-about-user-manual"><span>20</span><strong>21. Help / About & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>26</span><strong>Product Master — real product onboarding</strong></a></div>
       </aside>
       <article class="content"><h1>WineShopPOS User Manual — Master Reconsolidation</h1>
 <!-- WINEPOS_V2_CURRENT_BEGIN -->
@@ -453,13 +453,13 @@ history.</p>
 <h3 id="change-staff-role">Change staff role</h3>
 <p>For a non-admin staff row, choose <strong>Cashier</strong> or <strong>Manager</strong> in the Role field. Role changes are applied through the secure user-management function. ADMIN is platform-controlled and cannot be assigned from this screen.</p>
 <p>Open Settings &amp; Admin → Access Control for the complete access matrix.</p>
-<h2 id="21-help-user-manual">21. Help &amp; User Manual</h2>
-<p>Open <strong>Help &amp; Manual</strong> from the main navigation.</p>
-<p>The Help Center provides clickable chapters for the main WineShopPOS workflows,
-including billing, sales/returns, shifts, products, purchasing, inventory,
-operations, Owner Center, reports, administration and troubleshooting.</p>
-<p>Select a chapter to jump directly to its guidance, or select <strong>Open Full User
-Manual</strong> for the complete manual with a clickable table of contents.</p>
+<h2 id="21-help-about-user-manual">21. Help / About &amp; User Manual</h2>
+<p>Open the user menu from your name in the top-right corner, then select
+<strong>Help / About</strong>.</p>
+<p>Select <strong>Open Full User Manual</strong> to open the complete WineShopPOS manual in a
+new browser tab. The manual includes its own clickable table of contents.</p>
+<p>WineShopPOS does not use a separate Help category in the main application
+navigation.</p>
 <!-- SUPPLIER_MASTER_OCR_PATCH -->
 <h2 id="supplier-master-and-ocr-supplier-review">Supplier Master and OCR Supplier Review</h2>
 <p>ADMIN and MANAGER can open <strong>Purchases &amp; Suppliers → Suppliers</strong> to create, edit, deactivate or reactivate suppliers. While creating a Purchase Order, use <strong>+ New Supplier</strong> to create a supplier without leaving the PO, or <strong>Edit Selected Supplier</strong> to correct the selected supplier.</p>
diff --git a/src/App.jsx b/src/App.jsx
index d7bd951..81ff728 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -48,7 +48,6 @@ import BackupRecovery from "./pages/BackupRecovery";
 import Settings from "./pages/Settings";
 import Audit from "./pages/Audit";
 import Account from "./pages/Account";
-import Help from "./pages/Help";

 function module(title, subtitle, tabs) {
   return <ModuleLayout title={title} subtitle={subtitle} tabs={tabs}/>;
@@ -62,7 +61,7 @@ export default function App() {
       <Route element={<Layout/>}>
         <Route index element={<HomeRedirect/>}/>
         <Route path="account" element={<Account/>}/>
-        <Route path="help" element={<Help/>}/>
+        <Route path="help" element={<Navigate to="/account?tab=about" replace/>}/>

         <Route path="pos" element={module("POS & Billing", "Scan → Cart → Pay → Print. Operational distractions stay outside the cashier flow.", MODULE_TABS.pos)}>
           <Route index element={<POS/>}/>
diff --git a/src/config/navigation.js b/src/config/navigation.js
index cc4fc24..f06bf8c 100644
--- a/src/config/navigation.js
+++ b/src/config/navigation.js
@@ -1,6 +1,5 @@
 import {
   BarChart3,
-  BookOpen,
   Boxes,
   Building2,
   ClipboardList,
@@ -19,7 +18,6 @@ export const MAIN_MODULES = [
   { path: "/owner", label: "Owner Center", icon: Building2, roles: ["ADMIN"] },
   { path: "/reports", label: "Reports & Compliance", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
   { path: "/admin", label: "Settings & Admin", icon: Settings, roles: ["ADMIN"] },
-  { path: "/help", label: "Help & Manual", icon: BookOpen, roles: ["ADMIN", "MANAGER", "CASHIER"] },
 ];

 export const MODULE_TABS = {
diff --git a/src/pages/Account.jsx b/src/pages/Account.jsx
index d5d988c..4552a42 100644
--- a/src/pages/Account.jsx
+++ b/src/pages/Account.jsx
@@ -52,6 +52,6 @@ export default function Account() {

     {tab === "security" ? <form className="panel compact-form" onSubmit={changePassword}><h3>Change Password</h3><label>New Password<input type="password" minLength="8" value={password.next} onChange={(e)=>setPassword({...password,next:e.target.value})} required/></label><label>Confirm Password<input type="password" minLength="8" value={password.confirm} onChange={(e)=>setPassword({...password,confirm:e.target.value})} required/></label><button className="primary-button" disabled={busy}>Change Password</button><p className="muted-text">Role changes remain Admin/Platform-controlled. Never share passwords or service keys.</p></form> : null}

-    {tab === "about" ? <section className="panel"><h3>WineShopPOS</h3><p><strong>Version:</strong> {APP_VERSION}</p><p className="about-faith-line"><strong>Trust the GOD.</strong></p><p><strong>Created by:</strong> Almighty sa_f</p><p><strong>Support:</strong> Contact your WineShopPOS software provider for account, subscription or database support.</p><p><strong>Documentation:</strong> Project developer handbook and user manual are stored in the Git repository under <code>docs/</code>.</p></section> : null}
+    {tab === "about" ? <section className="panel"><h3>WineShopPOS</h3><p><strong>Version:</strong> {APP_VERSION}</p><p className="about-faith-line"><strong>Trust the GOD.</strong></p><p><strong>Created by:</strong> Almighty sa_f</p><p><strong>Support:</strong> Contact your WineShopPOS software provider for account, subscription or database support.</p><a className="primary-button" href="/manual/index.html" target="_blank" rel="noreferrer">Open Full User Manual</a></section> : null}
   </div>;
 }
diff --git a/src/pages/Help.jsx b/src/pages/Help.jsx
deleted file mode 100644
index 1fc58b6..0000000
--- a/src/pages/Help.jsx
+++ /dev/null
@@ -1,221 +0,0 @@
-import { BookOpen, ChevronRight, CircleHelp } from "lucide-react";
-
-const chapters = [
-  {
-    id: "getting-started",
-    title: "Getting Started",
-    description: "Sign in, understand your role and confirm the correct shop context.",
-    items: [
-      "Sign in with your assigned WineShopPOS account.",
-      "Confirm the current shop before starting operational work.",
-      "Only modules permitted for your role are shown.",
-    ],
-  },
-  {
-    id: "pos-billing",
-    title: "POS & Billing",
-    description: "Barcode scanning, cart, permitted pricing controls, payments and receipts.",
-    items: [
-      "Scan a barcode or search for a product.",
-      "Review quantity, customer and permitted pricing adjustments.",
-      "Choose Cash, UPI or Card and complete the sale.",
-      "Print the receipt when required.",
-    ],
-  },
-  {
-    id: "sales-returns",
-    title: "Sales, Returns & Voids",
-    description: "Find invoices and process controlled returns or voids.",
-    items: [
-      "Open Sales to locate the original invoice.",
-      "Use the return or void workflow rather than changing stock manually.",
-      "Provide the required reason and approval where policy requires it.",
-    ],
-  },
-  {
-    id: "shifts",
-    title: "Shifts & Day Close",
-    description: "Opening cash, shift operation, reconciliation and close.",
-    items: [
-      "Open the cashier shift with opening cash.",
-      "Complete normal billing during the shift.",
-      "Enter actual closing cash and review any variance.",
-      "Resolve pending offline activity before final close.",
-    ],
-  },
-  {
-    id: "products",
-    title: "Products & Barcodes",
-    description: "Product master, barcode details and label printing.",
-    items: [
-      "Create or edit products from Product Master.",
-      "Maintain barcode, SKU, brand, size, case size, purchase price and selling price.",
-      "Use Barcode Labels for label printing.",
-    ],
-  },
-  {
-    id: "purchasing",
-    title: "Purchases & Receiving",
-    description: "Suppliers, purchase orders, bulk receiving and invoice OCR.",
-    items: [
-      "Use Receive Stock for direct multi-line supplier receipts.",
-      "Use Procurement for the controlled purchase-order lifecycle.",
-      "Review OCR product matches, quantities and pricing before receiving.",
-      "Inventory increases only after the controlled receipt succeeds.",
-    ],
-  },
-  {
-    id: "inventory",
-    title: "Inventory",
-    description: "Stock, counts, ageing, FIFO guidance and branch transfers.",
-    items: [
-      "Use Inventory for current stock and stock movement history.",
-      "Use Stock Count for physical verification.",
-      "Use Transfers for movement between authorized shops.",
-      "Use Inventory Intelligence for ageing, stockout risk, dead stock and overstock.",
-    ],
-  },
-  {
-    id: "operations",
-    title: "Operations",
-    description: "Expenses, approvals, customers, rewards and offline queue.",
-    items: [
-      "Record and void operating expenses through controlled workflows.",
-      "Review pending approvals from the Approval Center.",
-      "Manage customer loyalty, promotions, store credit and vouchers where authorized.",
-      "Resolve offline synchronization conflicts instead of forcing stock.",
-    ],
-  },
-  {
-    id: "owner-center",
-    title: "Owner Center",
-    description: "Business performance, profit, exceptions and recommendations.",
-    items: [
-      "Review revenue, bills, profit, expenses and inventory indicators.",
-      "Use Profit Intelligence for margin and COGS views.",
-      "Review operational exceptions using Leakage Shield.",
-      "Use recommendations for stock and operational follow-up.",
-    ],
-  },
-  {
-    id: "reports",
-    title: "Reports & Compliance",
-    description: "Operational exports, accountant exports and configured compliance data.",
-    items: [
-      "Choose the required date range before exporting reports.",
-      "Use accountant/Tally-ready export when required.",
-      "Validate final accounting mappings with the accountant.",
-      "Maintain only verified shop licence/compliance information.",
-    ],
-  },
-  {
-    id: "settings",
-    title: "Settings & Administration",
-    description: "Users, access, hardware, backup, audit and shop settings.",
-    items: [
-      "Authorized administrators can manage staff and role access.",
-      "Use Hardware for scanner and printer configuration.",
-      "Use Backup & Recovery for operational export evidence.",
-      "Use Audit Log to review captured administrative activity.",
-    ],
-  },
-  {
-    id: "troubleshooting",
-    title: "Troubleshooting",
-    description: "Common scanner, inventory, OCR, offline and printer checks.",
-    items: [
-      "Confirm scanner input and barcode mapping when a product does not scan.",
-      "Refresh cloud stock when inventory changed during checkout.",
-      "Do not receive an OCR invoice until all uncertain lines are corrected.",
-      "Check printer paper size and calibration when receipt layout is incorrect.",
-    ],
-  },
-  {
-    id: "daily-checklist",
-    title: "Daily Shop Checklist",
-    description: "Recommended opening, operating and closing checks.",
-    items: [
-      "Opening: confirm connectivity, shift, scanner and printer.",
-      "During day: use controlled workflows for sales, receipts, returns and stock changes.",
-      "Closing: sync offline queue, reconcile cash and review pending approvals.",
-    ],
-  },
-];
-
-export default function Help() {
-  return (
-    <div className="page-stack help-center" id="help-top">
-      <section className="panel help-hero">
-        <div className="panel-header">
-          <div>
-            <p className="help-eyebrow">PRODUCT SUPPORT</p>
-            <h2>Help & User Manual</h2>
-            <p className="muted">
-              Guidance for billing, inventory, purchases, operations,
-              reporting and administration.
-            </p>
-          </div>
-          <div className="help-hero-icon" aria-hidden="true">
-            <CircleHelp size={28} />
-          </div>
-        </div>
-
-        <a
-          className="primary-button help-manual-button"
-          href="/manual/index.html"
-          target="_blank"
-          rel="noreferrer"
-        >
-          <BookOpen size={17} />
-          Open Full User Manual
-        </a>
-      </section>
-
-      <section className="panel">
-        <div className="panel-header">
-          <div>
-            <h3>Browse by chapter</h3>
-            <p className="muted">Select a chapter to jump directly to its guidance.</p>
-          </div>
-        </div>
-
-        <nav className="help-chapter-grid" aria-label="User manual chapters">
-          {chapters.map((chapter, index) => (
-            <a className="help-chapter-card" href={`#${chapter.id}`} key={chapter.id}>
-              <span className="help-chapter-number">
-                {String(index + 1).padStart(2, "0")}
-              </span>
-              <span className="help-chapter-copy">
-                <strong>{chapter.title}</strong>
-                <small>{chapter.description}</small>
-              </span>
-              <ChevronRight size={18} aria-hidden="true" />
-            </a>
-          ))}
-        </nav>
-      </section>
-
-      <div className="help-section-list">
-        {chapters.map((chapter, index) => (
-          <section className="panel help-section" id={chapter.id} key={chapter.id}>
-            <div className="help-section-heading">
-              <span className="help-chapter-number">
-                {String(index + 1).padStart(2, "0")}
-              </span>
-              <div>
-                <h3>{chapter.title}</h3>
-                <p className="muted">{chapter.description}</p>
-              </div>
-            </div>
-
-            <ol className="help-step-list">
-              {chapter.items.map((item) => <li key={item}>{item}</li>)}
-            </ol>
-
-            <a className="help-back-link" href="#help-top">Back to chapters</a>
-          </section>
-        ))}
-      </div>
-    </div>
-  );
-}
```
