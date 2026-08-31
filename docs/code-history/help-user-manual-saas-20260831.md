# Help/User Manual SaaS Repair — Actual Git Code History

Feature commit: `6bf05ebea08f1e8edd075d628c8f40aa62e920f2`

Generated from the actual feature commit after successful build, lint and verified production deployment.

## Actual Git record
```text
commit 6bf05ebea08f1e8edd075d628c8f40aa62e920f2 (HEAD -> main)
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date:   Mon Aug 31 03:53:58 2026 -0400

    fix: keep product Help manual SaaS-focused
---
 ...WineShopPOS_User_Manual_Master_Reconsolidation.md | 18 ------------------
 public/manual/WineShopPOS_User_Manual.md             | 18 ------------------
 public/manual/index.html                             | 20 ++------------------
 3 files changed, 2 insertions(+), 54 deletions(-)

diff --git a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
index b0a09c9..47de090 100644
--- a/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
+++ b/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md
@@ -728,24 +728,6 @@ History availability depends on retained production records and screen filters.
 Deleted or never-retained records cannot be assumed recoverable.
 <!-- V2_CURRENT_USER_WORKFLOWS_END -->

-<!-- AI_APP_HELP_START -->
-## Ask WineShopPOS — functionality help
-
-You can ask the existing Owner Assistant questions such as:
-
-- "How do I add bulk inventory?"
-- "How do I scan a supplier invoice?"
-- "How do I add a new user?"
-- "Where can I see stock history?"
-- "How do transfers work?"
-- "Where do I approve a discount?"
-- "How do loyalty points or gift vouchers work?"
-- "How do I export for my accountant?"
-
-For these questions the assistant uses the verified WineShopPOS functionality
-knowledge tool and returns the relevant app area/route, role requirements, steps
-and cautions. It remains read-only and cannot perform the operation for you.
-<!-- AI_APP_HELP_END -->

 <!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
 ## Product Master — real product onboarding
diff --git a/public/manual/WineShopPOS_User_Manual.md b/public/manual/WineShopPOS_User_Manual.md
index b0a09c9..47de090 100644
--- a/public/manual/WineShopPOS_User_Manual.md
+++ b/public/manual/WineShopPOS_User_Manual.md
@@ -728,24 +728,6 @@ History availability depends on retained production records and screen filters.
 Deleted or never-retained records cannot be assumed recoverable.
 <!-- V2_CURRENT_USER_WORKFLOWS_END -->

-<!-- AI_APP_HELP_START -->
-## Ask WineShopPOS — functionality help
-
-You can ask the existing Owner Assistant questions such as:
-
-- "How do I add bulk inventory?"
-- "How do I scan a supplier invoice?"
-- "How do I add a new user?"
-- "Where can I see stock history?"
-- "How do transfers work?"
-- "Where do I approve a discount?"
-- "How do loyalty points or gift vouchers work?"
-- "How do I export for my accountant?"
-
-For these questions the assistant uses the verified WineShopPOS functionality
-knowledge tool and returns the relevant app area/route, role requirements, steps
-and cautions. It remains read-only and cannot perform the operation for you.
-<!-- AI_APP_HELP_END -->

 <!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
 ## Product Master — real product onboarding
diff --git a/public/manual/index.html b/public/manual/index.html
index e6a28e7..9aa27db 100644
--- a/public/manual/index.html
+++ b/public/manual/index.html
@@ -51,7 +51,7 @@
     <div class="manual-layout">
       <aside class="toc" aria-label="Manual contents">
         <h2>Contents</h2>
-        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-user-manual"><span>20</span><strong>21. Help & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#ask-wineshoppos-functionality-help"><span>26</span><strong>Ask WineShopPOS — functionality help</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>27</span><strong>Product Master — real product onboarding</strong></a></div>
+        <div class="toc-links"><a class="toc-link" href="#current-v2-user-guide-update"><span>01</span><strong>Current V2 User Guide Update</strong></a><a class="toc-link" href="#1-what-changed"><span>02</span><strong>1. What changed</strong></a><a class="toc-link" href="#2-roles"><span>03</span><strong>2. Roles</strong></a><a class="toc-link" href="#3-top-bar-and-account-menu"><span>04</span><strong>3. Top Bar and Account Menu</strong></a><a class="toc-link" href="#4-pos-billing"><span>05</span><strong>4. POS & Billing</strong></a><a class="toc-link" href="#5-sales-returns-voids"><span>06</span><strong>5. Sales / Returns / Voids</strong></a><a class="toc-link" href="#6-shift-day-close"><span>07</span><strong>6. Shift & Day Close</strong></a><a class="toc-link" href="#7-products"><span>08</span><strong>7. Products</strong></a><a class="toc-link" href="#8-purchases-suppliers"><span>09</span><strong>8. Purchases & Suppliers</strong></a><a class="toc-link" href="#9-inventory"><span>10</span><strong>9. Inventory</strong></a><a class="toc-link" href="#10-operations"><span>11</span><strong>10. Operations</strong></a><a class="toc-link" href="#11-owner-center"><span>12</span><strong>11. Owner Center</strong></a><a class="toc-link" href="#12-reports-compliance"><span>13</span><strong>12. Reports & Compliance</strong></a><a class="toc-link" href="#13-settings-admin"><span>14</span><strong>13. Settings & Admin</strong></a><a class="toc-link" href="#14-troubleshooting"><span>15</span><strong>14. Troubleshooting</strong></a><a class="toc-link" href="#15-daily-shop-checklist"><span>16</span><strong>15. Daily Shop Checklist</strong></a><a class="toc-link" href="#18-modern-theme-and-dashboard"><span>17</span><strong>18. Modern Theme and Dashboard</strong></a><a class="toc-link" href="#19-shop-settings-admin"><span>18</span><strong>19. Shop Settings — ADMIN</strong></a><a class="toc-link" href="#20-users-and-role-access-admin"><span>19</span><strong>20. Users and Role Access — ADMIN</strong></a><a class="toc-link" href="#21-help-user-manual"><span>20</span><strong>21. Help & User Manual</strong></a><a class="toc-link" href="#supplier-master-and-ocr-supplier-review"><span>21</span><strong>Supplier Master and OCR Supplier Review</strong></a><a class="toc-link" href="#ask-wineshoppos-pro"><span>22</span><strong>Ask WineShopPOS (PRO)</strong></a><a class="toc-link" href="#v2-phase-1-ocr-product-resolution-landed-cost"><span>23</span><strong>V2 Phase 1 — OCR Product Resolution & Landed Cost</strong></a><a class="toc-link" href="#v2-pos-and-billing-interface"><span>24</span><strong>V2 POS and Billing Interface</strong></a><a class="toc-link" href="#v2-current-user-workflows"><span>25</span><strong>V2 Current User Workflows</strong></a><a class="toc-link" href="#product-master-real-product-onboarding"><span>26</span><strong>Product Master — real product onboarding</strong></a></div>
       </aside>
       <article class="content"><h1>WineShopPOS User Manual — Master Reconsolidation</h1>
 <!-- WINEPOS_V2_CURRENT_BEGIN -->
@@ -617,23 +617,7 @@ management workflow, then assign the intended shop membership and role.</p>
 </ul>
 <p>History availability depends on retained production records and screen filters.
 Deleted or never-retained records cannot be assumed recoverable.</p>
-<!-- V2_CURRENT_USER_WORKFLOWS_END --><!-- AI_APP_HELP_START -->
-<h2 id="ask-wineshoppos-functionality-help">Ask WineShopPOS — functionality help</h2>
-<p>You can ask the existing Owner Assistant questions such as:</p>
-<ul>
-<li>&quot;How do I add bulk inventory?&quot;</li>
-<li>&quot;How do I scan a supplier invoice?&quot;</li>
-<li>&quot;How do I add a new user?&quot;</li>
-<li>&quot;Where can I see stock history?&quot;</li>
-<li>&quot;How do transfers work?&quot;</li>
-<li>&quot;Where do I approve a discount?&quot;</li>
-<li>&quot;How do loyalty points or gift vouchers work?&quot;</li>
-<li>&quot;How do I export for my accountant?&quot;</li>
-</ul>
-<p>For these questions the assistant uses the verified WineShopPOS functionality
-knowledge tool and returns the relevant app area/route, role requirements, steps
-and cautions. It remains read-only and cannot perform the operation for you.</p>
-<!-- AI_APP_HELP_END --><!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
+<!-- V2_CURRENT_USER_WORKFLOWS_END --><!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
 <h2 id="product-master-real-product-onboarding">Product Master — real product onboarding</h2>
 <h3 id="add-one-product">Add one product</h3>
 <p>Open <strong>Products → Product Master → Add Product</strong>.</p>
```
