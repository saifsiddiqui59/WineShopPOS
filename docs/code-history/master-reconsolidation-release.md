# WineShopPOS — Master Reconsolidation Actual Git Code History

> Generated from the real Git commit produced after successful Supabase/Azure deployment.

## Commit

```text
Commit: 51d2bba006dea60b53e4a30c5562e229ff106202
Short: 51d2bba
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-30T01:04:10-04:00
Subject: Master reconsolidation - UX modules operations intelligence
```

## Changed files

```text
package-lock.json
package.json
src/App.jsx
src/components/HomeRedirect.jsx
src/components/Layout.jsx
src/components/ModuleLayout.jsx
src/components/ShopSelector.jsx
src/components/ThemeToggle.jsx
src/components/UserMenu.jsx
src/components/charts/BusinessCharts.jsx
src/components/ui/ActionMenu.jsx
src/components/ui/ConfirmationDialog.jsx
src/components/ui/EmptyState.jsx
src/components/ui/ErrorState.jsx
src/components/ui/FeatureTierBadge.jsx
src/components/ui/LoadingState.jsx
src/components/ui/MetricCard.jsx
src/components/ui/MoneyDisplay.jsx
src/components/ui/PageHeader.jsx
src/components/ui/QuantityDisplay.jsx
src/components/ui/SearchFilterBar.jsx
src/components/ui/SectionHeader.jsx
src/components/ui/StatusBadge.jsx
src/components/ui/UserAvatar.jsx
src/config/accessMatrix.js
src/config/featureCatalog.js
src/config/navigation.js
src/lib/theme.js
src/main.jsx
src/masterConsolidation.css
src/pages/AccessControl.jsx
src/pages/Account.jsx
src/pages/Approvals.jsx
src/pages/BackupRecovery.jsx
src/pages/BarcodeLabels.jsx
src/pages/Compliance.jsx
src/pages/CustomerCredit.jsx
src/pages/Expenses.jsx
src/pages/HardwareSetup.jsx
src/pages/InventoryIntelligence.jsx
src/pages/OwnerCenter.jsx
src/pages/OwnerExceptions.jsx
src/pages/OwnerProfit.jsx
src/pages/OwnerWhatsApp.jsx
src/pages/POS.jsx
src/pages/Procurement.jsx
src/pages/PurchaseIntelligence.jsx
src/pages/Recommendations.jsx
src/pages/ReportsConsolidated.jsx
src/pages/Settings.jsx
src/pages/Transfers.jsx
src/pages/Users.jsx
supabase/functions/manage-shop-users/index.ts
supabase/migrations/20260829233000_master_reconsolidation.sql
```

## Exact patch

```diff
commit 51d2bba006dea60b53e4a30c5562e229ff106202
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sun Aug 30 01:04:10 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sun Aug 30 01:04:10 2026 -0400

    Master reconsolidation - UX modules operations intelligence
---
 package-lock.json                                  |    7 +
 package.json                                       |    1 +
 src/App.jsx                                        |  163 +++-
 src/components/HomeRedirect.jsx                    |    6 +
 src/components/Layout.jsx                          |   77 +-
 src/components/ModuleLayout.jsx                    |   17 +
 src/components/ShopSelector.jsx                    |   31 +
 src/components/ThemeToggle.jsx                     |   31 +
 src/components/UserMenu.jsx                        |   38 +
 src/components/charts/BusinessCharts.jsx           |   89 ++
 src/components/ui/ActionMenu.jsx                   |    2 +
 src/components/ui/ConfirmationDialog.jsx           |    1 +
 src/components/ui/EmptyState.jsx                   |    3 +
 src/components/ui/ErrorState.jsx                   |    3 +
 src/components/ui/FeatureTierBadge.jsx             |    4 +
 src/components/ui/LoadingState.jsx                 |    3 +
 src/components/ui/MetricCard.jsx                   |    3 +
 src/components/ui/MoneyDisplay.jsx                 |    2 +
 src/components/ui/PageHeader.jsx                   |    4 +
 src/components/ui/QuantityDisplay.jsx              |    1 +
 src/components/ui/SearchFilterBar.jsx              |    1 +
 src/components/ui/SectionHeader.jsx                |    1 +
 src/components/ui/StatusBadge.jsx                  |    4 +
 src/components/ui/UserAvatar.jsx                   |    5 +
 src/config/accessMatrix.js                         |   24 +
 src/config/featureCatalog.js                       |   18 +
 src/config/navigation.js                           |   72 ++
 src/lib/theme.js                                   |   44 +
 src/main.jsx                                       |   30 +-
 src/masterConsolidation.css                        |  350 +++++++
 src/pages/AccessControl.jsx                        |   24 +
 src/pages/Account.jsx                              |   57 ++
 src/pages/Approvals.jsx                            |   10 +
 src/pages/BackupRecovery.jsx                       |   11 +
 src/pages/BarcodeLabels.jsx                        |    8 +
 src/pages/Compliance.jsx                           |   13 +
 src/pages/CustomerCredit.jsx                       |   11 +
 src/pages/Expenses.jsx                             |   20 +
 src/pages/HardwareSetup.jsx                        |   12 +
 src/pages/InventoryIntelligence.jsx                |   27 +
 src/pages/OwnerCenter.jsx                          |   77 ++
 src/pages/OwnerExceptions.jsx                      |    7 +
 src/pages/OwnerProfit.jsx                          |   27 +
 src/pages/OwnerWhatsApp.jsx                        |    6 +
 src/pages/POS.jsx                                  |   23 +-
 src/pages/Procurement.jsx                          |   35 +-
 src/pages/PurchaseIntelligence.jsx                 |   90 ++
 src/pages/Recommendations.jsx                      |    6 +
 src/pages/ReportsConsolidated.jsx                  |   16 +
 src/pages/Settings.jsx                             |  120 ++-
 src/pages/Transfers.jsx                            |   15 +-
 src/pages/Users.jsx                                |  213 +---
 supabase/functions/manage-shop-users/index.ts      |  126 ++-
 .../20260829233000_master_reconsolidation.sql      | 1025 ++++++++++++++++++++
 54 files changed, 2732 insertions(+), 282 deletions(-)

diff --git a/package-lock.json b/package-lock.json
index 266b999..a521e1c 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -9,6 +9,7 @@
       "version": "0.0.0",
       "dependencies": {
         "@supabase/supabase-js": "^2.112.4",
+        "jsbarcode": "^3.12.1",
         "lucide-react": "^1.37.0",
         "react": "^19.2.8",
         "react-dom": "^19.2.8",
@@ -1029,6 +1030,12 @@
         "url": "https://github.com/sponsors/panva"
       }
     },
+    "node_modules/jsbarcode": {
+      "version": "3.12.1",
+      "resolved": "https://registry.npmjs.org/jsbarcode/-/jsbarcode-3.12.1.tgz",
+      "integrity": "sha512-QZQSqIknC2Rr/YOUyOkCBqsoiBAOTYK+7yNN3JsqfoUtJtkazxNw1dmPpxuv7VVvqW13kA3/mKiLq+s/e3o9hQ==",
+      "license": "MIT"
+    },
     "node_modules/lightningcss": {
       "version": "1.33.0",
       "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
diff --git a/package.json b/package.json
index fb0d15d..e00527e 100644
--- a/package.json
+++ b/package.json
@@ -11,6 +11,7 @@
   },
   "dependencies": {
     "@supabase/supabase-js": "^2.112.4",
+    "jsbarcode": "^3.12.1",
     "lucide-react": "^1.37.0",
     "react": "^19.2.8",
     "react-dom": "^19.2.8",
diff --git a/src/App.jsx b/src/App.jsx
index b189edc..9a56828 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -1,5 +1,158 @@
-import { Route, Routes } from "react-router-dom";
-import Layout from "./components/Layout";import RequireAuth from "./components/RequireAuth";import RequireRole from "./components/RequireRole";
-import AddProduct from "./pages/AddProduct";import Dashboard from "./pages/Dashboard";import EditProduct from "./pages/EditProduct";import Inventory from "./pages/Inventory";import Login from "./pages/Login";import POS from "./pages/POS";import Products from "./pages/Products";import Purchases from "./pages/Purchases";import Reports from "./pages/Reports";import SaleDetails from "./pages/SaleDetails";import Sales from "./pages/Sales";import Settings from "./pages/Settings";import Users from "./pages/Users";
-import PriceHistory from "./pages/PriceHistory";import ScannerSettings from "./pages/ScannerSettings";import Returns from "./pages/Returns";import Shifts from "./pages/Shifts";import StockCount from "./pages/StockCount";import PrinterSettings from "./pages/PrinterSettings";import Procurement from "./pages/Procurement";import Reorder from "./pages/Reorder";import Transfers from "./pages/Transfers";import Audit from "./pages/Audit";import OfflineQueue from "./pages/OfflineQueue";import AutomationHub from "./pages/AutomationHub";
-export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route element={<RequireAuth/>}><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="pos" element={<POS/>}/><Route path="shifts" element={<Shifts/>}/><Route path="returns" element={<Returns/>}/><Route path="sales" element={<Sales/>}/><Route path="sales/:id" element={<SaleDetails/>}/><Route path="scanner-settings" element={<ScannerSettings/>}/><Route path="offline-queue" element={<OfflineQueue/>}/><Route element={<RequireRole roles={["ADMIN","MANAGER"]}/> }><Route path="products" element={<Products/>}/><Route path="products/new" element={<AddProduct/>}/><Route path="products/:id/edit" element={<EditProduct/>}/><Route path="inventory" element={<Inventory/>}/><Route path="stock-count" element={<StockCount/>}/><Route path="purchases" element={<Purchases/>}/><Route path="procurement" element={<Procurement/>}/><Route path="price-history" element={<PriceHistory/>}/><Route path="reorder" element={<Reorder/>}/><Route path="transfers" element={<Transfers/>}/><Route path="reports" element={<Reports/>}/><Route path="automation" element={<AutomationHub/>}/></Route><Route element={<RequireRole roles={["ADMIN"]}/> }><Route path="users" element={<Users/>}/><Route path="audit" element={<Audit/>}/><Route path="printer-settings" element={<PrinterSettings/>}/><Route path="settings" element={<Settings/>}/></Route></Route></Route></Routes>}
+import { Navigate, Route, Routes } from "react-router-dom";
+import Layout from "./components/Layout";
+import ModuleLayout from "./components/ModuleLayout";
+import RequireAuth from "./components/RequireAuth";
+import RequireRole from "./components/RequireRole";
+import HomeRedirect from "./components/HomeRedirect";
+import { MODULE_TABS } from "./config/navigation";
+
+import Login from "./pages/Login";
+import POS from "./pages/POS";
+import Sales from "./pages/Sales";
+import SaleDetails from "./pages/SaleDetails";
+import Returns from "./pages/Returns";
+import Shifts from "./pages/Shifts";
+import ScannerSettings from "./pages/ScannerSettings";
+import Products from "./pages/Products";
+import AddProduct from "./pages/AddProduct";
+import EditProduct from "./pages/EditProduct";
+import BarcodeLabels from "./pages/BarcodeLabels";
+import Purchases from "./pages/Purchases";
+import Procurement from "./pages/Procurement";
+import PurchaseIntelligence from "./pages/PurchaseIntelligence";
+import Inventory from "./pages/Inventory";
+import StockCount from "./pages/StockCount";
+import Transfers from "./pages/Transfers";
+import InventoryIntelligence from "./pages/InventoryIntelligence";
+import Expenses from "./pages/Expenses";
+import Approvals from "./pages/Approvals";
+import CustomerCredit from "./pages/CustomerCredit";
+import OfflineQueue from "./pages/OfflineQueue";
+import OwnerCenter from "./pages/OwnerCenter";
+import OwnerProfit from "./pages/OwnerProfit";
+import OwnerExceptions from "./pages/OwnerExceptions";
+import Recommendations from "./pages/Recommendations";
+import OwnerWhatsApp from "./pages/OwnerWhatsApp";
+import ReportsConsolidated from "./pages/ReportsConsolidated";
+import Compliance from "./pages/Compliance";
+import Users from "./pages/Users";
+import AccessControl from "./pages/AccessControl";
+import HardwareSetup from "./pages/HardwareSetup";
+import PrinterSettings from "./pages/PrinterSettings";
+import BackupRecovery from "./pages/BackupRecovery";
+import Settings from "./pages/Settings";
+import Audit from "./pages/Audit";
+import Account from "./pages/Account";
+
+function module(title, subtitle, tabs) {
+  return <ModuleLayout title={title} subtitle={subtitle} tabs={tabs}/>;
+}
+
+export default function App() {
+  return <Routes>
+    <Route path="/login" element={<Login/>}/>
+
+    <Route element={<RequireAuth/>}>
+      <Route element={<Layout/>}>
+        <Route index element={<HomeRedirect/>}/>
+        <Route path="account" element={<Account/>}/>
+
+        <Route path="pos" element={module("POS & Billing", "Scan → Cart → Pay → Print. Operational distractions stay outside the cashier flow.", MODULE_TABS.pos)}>
+          <Route index element={<POS/>}/>
+          <Route path="sales" element={<Sales/>}/>
+          <Route path="returns" element={<Returns/>}/>
+          <Route path="shifts" element={<Shifts/>}/>
+          <Route path="scanner" element={<ScannerSettings/>}/>
+        </Route>
+
+        {/* Current POS/Sales code already navigates to /sales/:id. Keep it stable. */}
+        <Route path="sales/:id" element={<SaleDetails/>}/>
+
+        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
+          <Route path="products" element={module("Products", "Product master, barcode configuration and physical label printing.", MODULE_TABS.products)}>
+            <Route index element={<Products/>}/>
+            <Route path="new" element={<AddProduct/>}/>
+            <Route path=":id/edit" element={<EditProduct/>}/>
+            <Route path="labels" element={<BarcodeLabels/>}/>
+          </Route>
+
+          <Route path="purchasing" element={module("Purchases & Suppliers", "Receive goods, control procurement and understand supplier/purchase cost changes.", MODULE_TABS.purchasing)}>
+            <Route index element={<Navigate to="receive" replace/>}/>
+            <Route path="receive" element={<Purchases/>}/>
+            <Route path="procurement" element={<Procurement/>}/>
+            <Route path="intelligence" element={<PurchaseIntelligence/>}/>
+          </Route>
+
+          <Route path="inventory" element={module("Inventory", "Current stock, physical count, inter-branch movement and inventory intelligence.", MODULE_TABS.inventory)}>
+            <Route index element={<Inventory/>}/>
+            <Route path="count" element={<StockCount/>}/>
+            <Route path="transfers" element={<Transfers/>}/>
+            <Route path="intelligence" element={<InventoryIntelligence/>}/>
+          </Route>
+        </Route>
+
+        <Route path="operations" element={module("Operations", "Day-to-day shifts and reliability, with management controls shown only to authorized roles.", MODULE_TABS.operations)}>
+          <Route index element={<Navigate to="shifts" replace/>}/>
+          <Route path="shifts" element={<Shifts/>}/>
+          <Route path="offline" element={<OfflineQueue/>}/>
+          <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
+            <Route path="expenses" element={<Expenses/>}/>
+            <Route path="approvals" element={<Approvals/>}/>
+            <Route path="customers" element={<CustomerCredit/>}/>
+          </Route>
+        </Route>
+
+        <Route element={<RequireRole roles={["ADMIN"]}/>}> 
+          <Route path="owner" element={module("Owner Center", "Business health, profitability, risk and recommended next actions in one place.", MODULE_TABS.owner)}>
+            <Route index element={<OwnerCenter/>}/>
+            <Route path="recommendations" element={<Recommendations/>}/>
+            <Route path="share" element={<OwnerWhatsApp/>}/>
+            <Route path="profit" element={<OwnerProfit/>}/>
+            <Route path="exceptions" element={<OwnerExceptions/>}/>
+          </Route>
+        </Route>
+
+        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
+          <Route path="reports" element={module("Reports & Compliance", "Operational exports plus a safe foundation for verified liquor-compliance requirements.", MODULE_TABS.reports)}>
+            <Route index element={<ReportsConsolidated/>}/>
+            <Route path="compliance" element={<Compliance/>}/>
+          </Route>
+        </Route>
+
+        <Route element={<RequireRole roles={["ADMIN"]}/>}> 
+          <Route path="admin" element={module("Settings & Admin", "Users, devices, backup/recovery, audit and shop administration.", MODULE_TABS.admin)}>
+            <Route index element={<Navigate to="users" replace/>}/>
+            <Route path="users" element={<Users/>}/>
+            <Route path="access" element={<AccessControl/>}/>
+            <Route path="hardware" element={<HardwareSetup/>}/>
+            <Route path="hardware/scanner" element={<ScannerSettings/>}/>
+            <Route path="hardware/printer" element={<PrinterSettings/>}/>
+            <Route path="backup" element={<BackupRecovery/>}/>
+            <Route path="audit" element={<Audit/>}/>
+            <Route path="settings" element={<Settings/>}/>
+          </Route>
+        </Route>
+
+        {/* Legacy route compatibility: preserve old bookmarks while moving navigation. */}
+        <Route path="shifts" element={<Navigate to="/operations/shifts" replace/>}/>
+        <Route path="returns" element={<Navigate to="/pos/returns" replace/>}/>
+        <Route path="sales" element={<Navigate to="/pos/sales" replace/>}/>
+        <Route path="scanner-settings" element={<Navigate to="/pos/scanner" replace/>}/>
+        <Route path="offline-queue" element={<Navigate to="/operations/offline" replace/>}/>
+        <Route path="stock-count" element={<Navigate to="/inventory/count" replace/>}/>
+        <Route path="purchases" element={<Navigate to="/purchasing/receive" replace/>}/>
+        <Route path="procurement" element={<Navigate to="/purchasing/procurement" replace/>}/>
+        <Route path="price-history" element={<Navigate to="/purchasing/intelligence" replace/>}/>
+        <Route path="reorder" element={<Navigate to="/inventory/intelligence" replace/>}/>
+        <Route path="transfers" element={<Navigate to="/inventory/transfers" replace/>}/>
+        <Route path="automation" element={<Navigate to="/purchasing/intelligence" replace/>}/>
+        <Route path="users" element={<Navigate to="/admin/users" replace/>}/>
+        <Route path="audit" element={<Navigate to="/admin/audit" replace/>}/>
+        <Route path="printer-settings" element={<Navigate to="/admin/hardware/printer" replace/>}/>
+        <Route path="settings" element={<Navigate to="/admin/settings" replace/>}/>
+
+        <Route path="*" element={<HomeRedirect/>}/>
+      </Route>
+    </Route>
+  </Routes>;
+}
diff --git a/src/components/HomeRedirect.jsx b/src/components/HomeRedirect.jsx
new file mode 100644
index 0000000..befa4b6
--- /dev/null
+++ b/src/components/HomeRedirect.jsx
@@ -0,0 +1,6 @@
+import { Navigate } from "react-router-dom";
+import { useAuth } from "../context/AuthContext";
+export default function HomeRedirect() {
+  const { profile } = useAuth();
+  return <Navigate to={profile?.role === "CASHIER" ? "/pos" : "/owner"} replace/>;
+}
diff --git a/src/components/Layout.jsx b/src/components/Layout.jsx
index 245434f..081a7e4 100644
--- a/src/components/Layout.jsx
+++ b/src/components/Layout.jsx
@@ -1,9 +1,72 @@
-import { NavLink, Outlet } from "react-router-dom";
-import { BarChart3, ClipboardCheck, FileSearch, LayoutDashboard, LogOut, Package, Printer, ReceiptText, RefreshCw, ScanBarcode, Settings, ShoppingBag, ShieldCheck, Truck, Undo2, UsersRound, Warehouse, Wine, ArrowLeftRight, Clock3, Sparkles, TrendingUp } from "lucide-react";
+import { useEffect, useMemo, useState } from "react";
+import { NavLink, Outlet, useLocation } from "react-router-dom";
+import { ChevronRight, PanelLeftClose, PanelLeftOpen, Wine } from "lucide-react";
 import { useAuth } from "../context/AuthContext";
 import OfflineStatus from "./OfflineStatus";
-const navigation=[
-{path:"/",label:"Dashboard",icon:LayoutDashboard,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/pos",label:"POS Billing",icon:ScanBarcode,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/shifts",label:"Shift / Close",icon:Clock3,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/returns",label:"Returns / Voids",icon:Undo2,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/sales",label:"Sales",icon:ReceiptText,roles:["ADMIN","MANAGER","CASHIER"]},{path:"/offline-queue",label:"Offline Queue",icon:RefreshCw,roles:["ADMIN","MANAGER","CASHIER"]},
-{path:"/products",label:"Products",icon:Package,roles:["ADMIN","MANAGER"]},{path:"/inventory",label:"Inventory",icon:Warehouse,roles:["ADMIN","MANAGER"]},{path:"/stock-count",label:"Stock Count",icon:ClipboardCheck,roles:["ADMIN","MANAGER"]},{path:"/purchases",label:"Receive Stock",icon:Truck,roles:["ADMIN","MANAGER"]},{path:"/procurement",label:"Procurement",icon:ShoppingBag,roles:["ADMIN","MANAGER"]},{path:"/price-history",label:"Price History",icon:TrendingUp,roles:["ADMIN","MANAGER"]},{path:"/reorder",label:"Smart Reorder",icon:Sparkles,roles:["ADMIN","MANAGER"]},{path:"/transfers",label:"Transfers",icon:ArrowLeftRight,roles:["ADMIN","MANAGER"]},{path:"/reports",label:"Reports",icon:BarChart3,roles:["ADMIN","MANAGER"]},{path:"/automation",label:"OCR / Automation",icon:FileSearch,roles:["ADMIN","MANAGER"]},{path:"/scanner-settings",label:"Scanner",icon:ScanBarcode,roles:["ADMIN","MANAGER","CASHIER"]},
-{path:"/users",label:"Users",icon:UsersRound,roles:["ADMIN"]},{path:"/audit",label:"Audit",icon:ShieldCheck,roles:["ADMIN"]},{path:"/printer-settings",label:"Printer",icon:Printer,roles:["ADMIN"]},{path:"/settings",label:"Settings",icon:Settings,roles:["ADMIN"]},];
-export default function Layout(){const{profile,signOut}=useAuth();return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-icon"><Wine size={25}/></div><div><div className="brand-name">WineShop POS</div><div className="brand-subtitle">{profile?.shop_name||"Retail Management"}</div></div></div><nav className="nav-menu">{navigation.filter((i)=>i.roles.includes(profile?.role)).map((i)=>{const Icon=i.icon;return <NavLink key={i.path} to={i.path} end={i.path==="/"} className={({isActive})=>isActive?"nav-item active":"nav-item"}><Icon size={18}/><span>{i.label}</span></NavLink>})}</nav><div className="sidebar-footer"><ShoppingBag size={18}/><div><strong>{profile?.full_name||"User"}</strong><span>{profile?.role||""}</span></div><button title="Sign out" onClick={signOut} className="icon-logout"><LogOut size={17}/></button></div></aside><main className="main-area"><header className="topbar"><div><h1>Wine Shop Management</h1><p>Cloud POS, barcode billing & inventory</p></div><div className="topbar-actions"><OfflineStatus/><div className="user-pill"><div className="avatar">{(profile?.full_name||"U")[0].toUpperCase()}</div><div><strong>{profile?.full_name||"User"}</strong><span>{profile?.role||""}</span></div></div></div></header><div className="page-area"><Outlet/></div></main></div>}
+import ShopSelector from "./ShopSelector";
+import UserMenu from "./UserMenu";
+import ThemeToggle from "./ThemeToggle";
+import { watchThemePreference } from "../lib/theme";
+import { MAIN_MODULES } from "../config/navigation";
+
+const COLLAPSE_KEY = "wineshop_sidebar_collapsed_v1";
+
+function pageMeta(pathname) {
+  const parts = pathname.split("/").filter(Boolean);
+  if (!parts.length) return { title: "WineShopPOS", crumbs: [] };
+  const labels = {
+    pos: "POS & Billing", products: "Products", purchasing: "Purchases & Suppliers",
+    inventory: "Inventory", operations: "Operations", owner: "Owner Center",
+    reports: "Reports & Compliance", admin: "Settings & Admin", account: "My Account",
+    sales: "Sales", returns: "Returns & Voids", shifts: "Shift & Day Close", scanner: "Scanner",
+    labels: "Barcode Labels", receive: "Receive Stock", procurement: "Procurement", intelligence: "Intelligence",
+    count: "Stock Count", transfers: "Transfers", expenses: "Expenses", approvals: "Approvals",
+    customers: "Customer & Credit", offline: "Offline Queue", profit: "Profit Intelligence",
+    exceptions: "Loss & Exceptions", recommendations: "Recommendations", share: "WhatsApp Summary",
+    compliance: "Liquor Compliance", users: "Users", access: "Access Control", hardware: "Hardware", backup: "Backup & Recovery",
+    settings: "Settings", printer: "Printer",
+  };
+  const crumbs = parts.map((part) => labels[part] || part.replaceAll("-", " "));
+  return { title: crumbs.at(-1), crumbs };
+}
+
+export default function Layout() {
+  const { profile } = useAuth();
+  const location = useLocation();
+  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
+  const meta = useMemo(() => pageMeta(location.pathname), [location.pathname]);
+
+  useEffect(() => localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"), [collapsed]);
+  useEffect(() => watchThemePreference(() => profile?.theme || "SYSTEM"), [profile?.theme]);
+
+  return <div className={collapsed ? "app-shell sidebar-collapsed" : "app-shell"}>
+    <aside className="sidebar">
+      <div className="brand">
+        <div className="brand-icon"><Wine size={24}/></div>
+        {!collapsed ? <div><div className="brand-name">WineShop POS</div><div className="brand-subtitle">Retail Management</div></div> : null}
+      </div>
+      <nav className="nav-menu" aria-label="Main navigation">
+        {MAIN_MODULES.filter((item) => item.roles.includes(profile?.role)).map((item) => {
+          const Icon = item.icon;
+          return <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} title={collapsed ? item.label : undefined}>
+            <Icon size={19}/>{!collapsed ? <span>{item.label}</span> : null}
+          </NavLink>;
+        })}
+      </nav>
+      <button className="sidebar-collapse" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
+        {collapsed ? <PanelLeftOpen size={18}/> : <><PanelLeftClose size={18}/><span>Collapse</span></>}
+      </button>
+    </aside>
+
+    <main className="main-area">
+      <header className="topbar consolidated-topbar">
+        <div className="topbar-page-context">
+          <button className="mobile-sidebar-toggle" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle navigation"><PanelLeftOpen size={19}/></button>
+          <div><h1>{meta.title}</h1><div className="breadcrumbs">{meta.crumbs.map((crumb, index) => <span key={`${crumb}-${index}`}>{index ? <ChevronRight size={13}/> : null}{crumb}</span>)}</div></div>
+        </div>
+        <div className="topbar-actions"><ShopSelector/><OfflineStatus/><ThemeToggle/><UserMenu/></div>
+      </header>
+      <div className="page-area"><Outlet/></div>
+    </main>
+  </div>;
+}
diff --git a/src/components/ModuleLayout.jsx b/src/components/ModuleLayout.jsx
new file mode 100644
index 0000000..44cb83f
--- /dev/null
+++ b/src/components/ModuleLayout.jsx
@@ -0,0 +1,17 @@
+import { NavLink, Outlet } from "react-router-dom";
+import { useAuth } from "../context/AuthContext";
+import FeatureTierBadge from "./ui/FeatureTierBadge";
+
+export default function ModuleLayout({ title, subtitle, tabs = [] }) {
+  const { profile } = useAuth();
+  const visible = tabs.filter((tab) => tab.roles?.includes(profile?.role));
+  return <div className="module-shell">
+    <div className="module-heading"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div></div>
+    {visible.length > 1 ? <nav className="module-tabs" aria-label={`${title} navigation`}>
+      {visible.map((tab) => <NavLink key={tab.path} to={tab.path} end={tab.end ?? true} className={({ isActive }) => isActive ? "module-tab active" : "module-tab"}>
+        <span>{tab.label}</span><FeatureTierBadge tier={tab.tier}/>
+      </NavLink>)}
+    </nav> : null}
+    <div className="module-content"><Outlet/></div>
+  </div>;
+}
diff --git a/src/components/ShopSelector.jsx b/src/components/ShopSelector.jsx
new file mode 100644
index 0000000..ec5c77a
--- /dev/null
+++ b/src/components/ShopSelector.jsx
@@ -0,0 +1,31 @@
+import { useEffect, useState } from "react";
+import { Store } from "lucide-react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+
+export default function ShopSelector() {
+  const { profile, refreshAccess } = useAuth();
+  const [shops, setShops] = useState([]);
+  const [busy, setBusy] = useState(false);
+
+  useEffect(() => {
+    let alive = true;
+    supabase.rpc("my_shop_memberships").then(({ data }) => { if (alive) setShops(data || []); });
+    return () => { alive = false; };
+  }, [profile?.shop_id]);
+
+  async function change(shopId) {
+    if (!shopId || shopId === profile?.shop_id) return;
+    setBusy(true);
+    const { error } = await supabase.rpc("switch_shop", { p_shop_id: shopId });
+    if (!error) {
+      await refreshAccess();
+      window.location.assign("#/owner");
+      window.location.reload();
+    }
+    setBusy(false);
+  }
+
+  if (profile?.role === "CASHIER" || shops.length <= 1) return <div className="shop-context-pill"><Store size={15}/><span>{profile?.shop_name || "Shop"}</span></div>;
+  return <label className="shop-selector"><Store size={15}/><span className="sr-only">Current shop</span><select value={profile?.shop_id || ""} disabled={busy} onChange={(e) => change(e.target.value)}>{shops.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}</select></label>;
+}
diff --git a/src/components/ThemeToggle.jsx b/src/components/ThemeToggle.jsx
new file mode 100644
index 0000000..16a7206
--- /dev/null
+++ b/src/components/ThemeToggle.jsx
@@ -0,0 +1,31 @@
+import { useState } from "react";
+import { Laptop, Moon, Sun } from "lucide-react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+import { notifyThemePreference, normalizeTheme } from "../lib/theme";
+
+const ORDER = ["LIGHT", "DARK", "SYSTEM"];
+const ICONS = { LIGHT: Sun, DARK: Moon, SYSTEM: Laptop };
+const LABELS = { LIGHT: "Light theme", DARK: "Dark theme", SYSTEM: "System theme" };
+
+export default function ThemeToggle() {
+  const { profile, refreshAccess } = useAuth();
+  const [busy, setBusy] = useState(false);
+  const current = normalizeTheme(profile?.theme);
+  const Icon = ICONS[current];
+
+  async function cycleTheme() {
+    if (busy) return;
+    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
+    notifyThemePreference(next);
+    setBusy(true);
+    const { error } = await supabase.rpc("update_my_theme", { p_theme: next });
+    if (!error) await refreshAccess();
+    else notifyThemePreference(current);
+    setBusy(false);
+  }
+
+  return <button className="theme-toggle" type="button" onClick={cycleTheme} disabled={busy} title={`${LABELS[current]} · click to change`} aria-label={`${LABELS[current]}. Click to change theme.`}>
+    <Icon size={17}/><span>{current === "SYSTEM" ? "Auto" : current[0] + current.slice(1).toLowerCase()}</span>
+  </button>;
+}
diff --git a/src/components/UserMenu.jsx b/src/components/UserMenu.jsx
new file mode 100644
index 0000000..6331e62
--- /dev/null
+++ b/src/components/UserMenu.jsx
@@ -0,0 +1,38 @@
+import { useEffect, useRef, useState } from "react";
+import { CircleHelp, LogOut, Settings, Shield, UserRound } from "lucide-react";
+import { useNavigate } from "react-router-dom";
+import { useAuth } from "../context/AuthContext";
+import UserAvatar from "./ui/UserAvatar";
+import StatusBadge from "./ui/StatusBadge";
+import { APP_VERSION } from "../config/featureCatalog";
+
+export default function UserMenu() {
+  const { profile, user, signOut } = useAuth();
+  const [open, setOpen] = useState(false);
+  const ref = useRef(null);
+  const navigate = useNavigate();
+
+  useEffect(() => {
+    const click = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
+    document.addEventListener("mousedown", click);
+    return () => document.removeEventListener("mousedown", click);
+  }, []);
+
+  function go(path) { setOpen(false); navigate(path); }
+
+  return <div className="user-menu" ref={ref}>
+    <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
+      <UserAvatar profile={profile}/><div className="user-menu-trigger-text"><strong>{profile?.full_name || "User"}</strong><span>{profile?.role || ""}</span></div>
+    </button>
+    {open ? <div className="user-menu-popover">
+      <div className="user-menu-summary"><UserAvatar profile={profile} size="lg"/><div><strong>{profile?.full_name || "User"}</strong><span>{profile?.email || user?.email || ""}</span><div className="summary-badges"><StatusBadge status={profile?.role}/></div></div></div>
+      <div className="user-menu-shop"><strong>{profile?.shop_name || "Shop"}</strong><span>{profile?.organization_name || "Organization"}</span></div>
+      <button onClick={() => go("/account")}><UserRound size={16}/> My Profile</button>
+      <button onClick={() => go("/account?tab=settings")}><Settings size={16}/> Account Settings</button>
+      <button onClick={() => go("/account?tab=security")}><Shield size={16}/> Security</button>
+      <button onClick={() => go("/account?tab=about")}><CircleHelp size={16}/> Help / About <small>{APP_VERSION}</small></button>
+      <div className="user-menu-divider"/>
+      <button className="logout-menu-button" onClick={signOut}><LogOut size={16}/> Logout</button>
+    </div> : null}
+  </div>;
+}
diff --git a/src/components/charts/BusinessCharts.jsx b/src/components/charts/BusinessCharts.jsx
new file mode 100644
index 0000000..7ea7dbf
--- /dev/null
+++ b/src/components/charts/BusinessCharts.jsx
@@ -0,0 +1,89 @@
+import { useId } from "react";
+
+// Power BI-inspired categorical palette: strong, readable, restrained.
+const PALETTE = ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#197278", "#D64550"];
+
+function safeNumber(value) {
+  const n = Number(value);
+  return Number.isFinite(n) ? n : 0;
+}
+
+function formatDefault(value) {
+  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeNumber(value));
+}
+
+function EmptyChart({ message = "Not enough data yet" }) {
+  return <div className="chart-empty">{message}</div>;
+}
+
+export function LineChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
+  const gradientId = useId().replaceAll(":", "");
+  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
+  if (!rows.length) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
+
+  const width = 680; const height = 230; const left = 28; const right = 18; const top = 20; const bottom = 34;
+  const values = rows.map((row) => safeNumber(row[valueKey]));
+  const max = Math.max(...values, 0); const min = Math.min(...values, 0); const spread = Math.max(1, max - min);
+  const x = (index) => rows.length === 1 ? width / 2 : left + index * ((width - left - right) / (rows.length - 1));
+  const y = (value) => top + (max - value) / spread * (height - top - bottom);
+  const points = rows.map((row, index) => `${x(index)},${y(safeNumber(row[valueKey]))}`).join(" ");
+  const areaPoints = `${left},${height-bottom} ${points} ${x(rows.length-1)},${height-bottom}`;
+  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
+  const last = rows[rows.length - 1];
+
+  return <section className="chart-card">
+    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div><strong>{formatValue(last[valueKey])}</strong></div>
+    <div className="line-chart" role="img" aria-label={`${title}. Latest value ${formatValue(last[valueKey])}.`}>
+      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
+        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#118DFF" stopOpacity="0.24"/><stop offset="100%" stopColor="#118DFF" stopOpacity="0"/></linearGradient></defs>
+        {[0, .5, 1].map((ratio) => <line key={ratio} x1={left} x2={width-right} y1={top + ratio*(height-top-bottom)} y2={top + ratio*(height-top-bottom)} className="chart-grid-line"/>)}
+        <polygon points={areaPoints} fill={`url(#${gradientId})`}/>
+        <polyline points={points} className="chart-line-path"/>
+        {rows.map((row, index) => index === rows.length-1 || index % Math.max(1, Math.ceil(rows.length/8)) === 0 ? <circle key={index} cx={x(index)} cy={y(safeNumber(row[valueKey]))} r="3.2" className="chart-line-point"><title>{row[labelKey]}: {formatValue(row[valueKey])}</title></circle> : null)}
+      </svg>
+      <div className="chart-axis-labels">{labelIndexes.map((index) => <span key={index} style={{ left: `${x(index)/width*100}%` }}>{rows[index]?.[labelKey]}</span>)}</div>
+    </div>
+  </section>;
+}
+
+export function DonutChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, centerLabel = "Total" }) {
+  const rows = data.filter((row) => safeNumber(row?.[valueKey]) > 0);
+  const total = rows.reduce((sum, row) => sum + safeNumber(row[valueKey]), 0);
+  if (!total) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
+  let cursor = 0;
+  const stops = rows.map((row, index) => { const start = cursor; cursor += safeNumber(row[valueKey]) / total * 100; return `${PALETTE[index % PALETTE.length]} ${start}% ${cursor}%`; });
+  return <section className="chart-card">
+    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
+    <div className="donut-layout">
+      <div className="donut-chart" style={{ background: `conic-gradient(${stops.join(",")})` }} role="img" aria-label={`${title}. ${rows.map((row)=>`${row[labelKey]} ${formatValue(row[valueKey])}`).join(", ")}.`}><div className="donut-hole"><span>{centerLabel}</span><strong>{formatValue(total)}</strong></div></div>
+      <div className="chart-legend">{rows.map((row,index)=><div key={`${row[labelKey]}-${index}`}><i style={{ background: PALETTE[index % PALETTE.length] }}/><span>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div>)}</div>
+    </div>
+  </section>;
+}
+
+export function HorizontalBarChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, limit = 7 }) {
+  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey]))).slice(0, limit);
+  const max = Math.max(...rows.map((row) => safeNumber(row[valueKey])), 0);
+  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
+  return <section className="chart-card">
+    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
+    <div className="horizontal-bars" role="img" aria-label={title}>{rows.map((row,index)=><div className="horizontal-bar-row" key={`${row[labelKey]}-${index}`}><div className="horizontal-bar-meta"><span title={row[labelKey]}>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div><div className="horizontal-bar-track"><div className="horizontal-bar-fill" style={{ width: `${Math.max(3, safeNumber(row[valueKey])/max*100)}%`, background: PALETTE[index % PALETTE.length] }}/></div></div>)}</div>
+  </section>;
+}
+
+export function ColumnChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
+  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
+  const max = Math.max(...rows.map((row) => Math.abs(safeNumber(row[valueKey]))), 0);
+  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
+  return <section className="chart-card">
+    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
+    <div className="column-chart" role="img" aria-label={title}>{rows.map((row,index)=>{
+      const value=safeNumber(row[valueKey]);
+      return <div className="column-item" key={`${row[labelKey]}-${index}`} title={`${row[labelKey]}: ${formatValue(value)}`}>
+        <div className="column-value">{formatValue(value)}</div>
+        <div className="column-track"><div className={`column-fill ${value<0?"negative":""}`} style={{height:`${Math.max(6,Math.abs(value)/max*100)}%`,background:value<0?"#D64550":PALETTE[index%PALETTE.length]}}/></div>
+        <div className="column-label">{row[labelKey]}</div>
+      </div>;
+    })}</div>
+  </section>;
+}
diff --git a/src/components/ui/ActionMenu.jsx b/src/components/ui/ActionMenu.jsx
new file mode 100644
index 0000000..d0eefa4
--- /dev/null
+++ b/src/components/ui/ActionMenu.jsx
@@ -0,0 +1,2 @@
+import {useEffect,useRef,useState} from "react";
+export default function ActionMenu({actions=[]}){const[open,setOpen]=useState(false);const ref=useRef(null);useEffect(()=>{const fn=e=>{if(!ref.current?.contains(e.target))setOpen(false)};document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn)},[]);return <div className="action-menu" ref={ref}><button className="icon-button" onClick={()=>setOpen(v=>!v)} aria-label="More actions">•••</button>{open?<div className="action-menu-popover">{actions.filter(a=>!a.hidden).map((a,i)=><button key={i} onClick={()=>{setOpen(false);a.onClick?.()}} disabled={a.disabled}>{a.label}</button>)}</div>:null}</div>}
diff --git a/src/components/ui/ConfirmationDialog.jsx b/src/components/ui/ConfirmationDialog.jsx
new file mode 100644
index 0000000..240ad45
--- /dev/null
+++ b/src/components/ui/ConfirmationDialog.jsx
@@ -0,0 +1 @@
+export default function ConfirmationDialog({open,title,message,confirmLabel="Confirm",onConfirm,onCancel,busy=false}){if(!open)return null;return <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}><div className="dialog-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()}><h3>{title}</h3><p>{message}</p><div className="button-row"><button className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-button" onClick={onConfirm} disabled={busy}>{busy?"Working...":confirmLabel}</button></div></div></div>}
diff --git a/src/components/ui/EmptyState.jsx b/src/components/ui/EmptyState.jsx
new file mode 100644
index 0000000..015cdf8
--- /dev/null
+++ b/src/components/ui/EmptyState.jsx
@@ -0,0 +1,3 @@
+export default function EmptyState({ title, message, action }) {
+  return <div className="state-card empty-state"><strong>{title}</strong>{message ? <p>{message}</p> : null}{action}</div>;
+}
diff --git a/src/components/ui/ErrorState.jsx b/src/components/ui/ErrorState.jsx
new file mode 100644
index 0000000..bdfbfa9
--- /dev/null
+++ b/src/components/ui/ErrorState.jsx
@@ -0,0 +1,3 @@
+export default function ErrorState({ message = "Unable to load this information. Please retry." }) {
+  return <div className="state-card error-state"><strong>Something needs attention</strong><p>{message}</p></div>;
+}
diff --git a/src/components/ui/FeatureTierBadge.jsx b/src/components/ui/FeatureTierBadge.jsx
new file mode 100644
index 0000000..453cd83
--- /dev/null
+++ b/src/components/ui/FeatureTierBadge.jsx
@@ -0,0 +1,4 @@
+export default function FeatureTierBadge({ tier }) {
+  if (!tier) return null;
+  return <span className={`feature-tier-badge tier-${String(tier).toLowerCase()}`}>{tier}</span>;
+}
diff --git a/src/components/ui/LoadingState.jsx b/src/components/ui/LoadingState.jsx
new file mode 100644
index 0000000..780080c
--- /dev/null
+++ b/src/components/ui/LoadingState.jsx
@@ -0,0 +1,3 @@
+export default function LoadingState({ label = "Loading..." }) {
+  return <div className="state-card loading-state"><span className="state-spinner" /> <span>{label}</span></div>;
+}
diff --git a/src/components/ui/MetricCard.jsx b/src/components/ui/MetricCard.jsx
new file mode 100644
index 0000000..4cce686
--- /dev/null
+++ b/src/components/ui/MetricCard.jsx
@@ -0,0 +1,3 @@
+export default function MetricCard({ label, value, helper, tone = "default" }) {
+  return <div className={`metric-card metric-${tone}`}><span>{label}</span><strong>{value}</strong>{helper ? <small>{helper}</small> : null}</div>;
+}
diff --git a/src/components/ui/MoneyDisplay.jsx b/src/components/ui/MoneyDisplay.jsx
new file mode 100644
index 0000000..44dbe8b
--- /dev/null
+++ b/src/components/ui/MoneyDisplay.jsx
@@ -0,0 +1,2 @@
+const formatter=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+export default function MoneyDisplay({value=0}){return <span>{formatter.format(Number(value||0))}</span>}
diff --git a/src/components/ui/PageHeader.jsx b/src/components/ui/PageHeader.jsx
new file mode 100644
index 0000000..ae8c09d
--- /dev/null
+++ b/src/components/ui/PageHeader.jsx
@@ -0,0 +1,4 @@
+import FeatureTierBadge from "./FeatureTierBadge";
+export default function PageHeader({ title, subtitle, tier, actions }) {
+  return <div className="page-header-standard"><div><div className="page-title-row"><h2>{title}</h2><FeatureTierBadge tier={tier}/></div>{subtitle ? <p>{subtitle}</p> : null}</div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
+}
diff --git a/src/components/ui/QuantityDisplay.jsx b/src/components/ui/QuantityDisplay.jsx
new file mode 100644
index 0000000..face9fd
--- /dev/null
+++ b/src/components/ui/QuantityDisplay.jsx
@@ -0,0 +1 @@
+export default function QuantityDisplay({value=0,unit="bottles"}){return <span>{Number(value||0).toLocaleString("en-IN")} {unit}</span>}
diff --git a/src/components/ui/SearchFilterBar.jsx b/src/components/ui/SearchFilterBar.jsx
new file mode 100644
index 0000000..b793bec
--- /dev/null
+++ b/src/components/ui/SearchFilterBar.jsx
@@ -0,0 +1 @@
+export default function SearchFilterBar({value,onChange,placeholder="Search...",children}){return <div className="filter-bar"><input value={value} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}/>{children}</div>}
diff --git a/src/components/ui/SectionHeader.jsx b/src/components/ui/SectionHeader.jsx
new file mode 100644
index 0000000..c390861
--- /dev/null
+++ b/src/components/ui/SectionHeader.jsx
@@ -0,0 +1 @@
+export default function SectionHeader({title,subtitle,actions}){return <div className="section-row"><div><h3>{title}</h3>{subtitle?<p className="muted-text">{subtitle}</p>:null}</div>{actions?<div className="page-actions">{actions}</div>:null}</div>}
diff --git a/src/components/ui/StatusBadge.jsx b/src/components/ui/StatusBadge.jsx
new file mode 100644
index 0000000..e947501
--- /dev/null
+++ b/src/components/ui/StatusBadge.jsx
@@ -0,0 +1,4 @@
+export default function StatusBadge({ status }) {
+  const value = String(status || "UNKNOWN").replaceAll("_", " ");
+  return <span className={`status-badge status-${String(status || "unknown").toLowerCase().replaceAll("_", "-")}`}>{value}</span>;
+}
diff --git a/src/components/ui/UserAvatar.jsx b/src/components/ui/UserAvatar.jsx
new file mode 100644
index 0000000..5034151
--- /dev/null
+++ b/src/components/ui/UserAvatar.jsx
@@ -0,0 +1,5 @@
+export default function UserAvatar({ profile, size = "md" }) {
+  const name = profile?.full_name || "User";
+  if (profile?.avatar_url) return <img className={`user-avatar avatar-${size}`} src={profile.avatar_url} alt={`${name} profile`} />;
+  return <div className={`user-avatar avatar-${size} avatar-fallback`} aria-label={`${name} profile`}>{name.slice(0, 1).toUpperCase()}</div>;
+}
diff --git a/src/config/accessMatrix.js b/src/config/accessMatrix.js
new file mode 100644
index 0000000..e881e14
--- /dev/null
+++ b/src/config/accessMatrix.js
@@ -0,0 +1,24 @@
+export const ROLE_ACCESS_ROWS = [
+  { capability: "POS billing", cashier: "USE", manager: "USE", admin: "USE", note: "Scan/search, cart and checkout." },
+  { capability: "Own sales & receipt", cashier: "USE", manager: "USE", admin: "USE", note: "Cashier sales are limited by current backend policy." },
+  { capability: "Return request", cashier: "REQUEST", manager: "APPROVE", admin: "APPROVE", note: "Cashier can request; approval remains management-controlled." },
+  { capability: "Shift / day close", cashier: "OWN", manager: "MANAGE", admin: "MANAGE", note: "Cashier works own shift; management reviews discrepancies." },
+  { capability: "Products & pricing", cashier: "VIEW IN POS", manager: "EDIT", admin: "EDIT", note: "Cashier cannot change product master or purchase cost." },
+  { capability: "Purchases & suppliers", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Receiving and procurement are management functions." },
+  { capability: "Inventory / stock count", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Stock-changing operations stay controlled/RPC-backed." },
+  { capability: "Stock transfer", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Organization-safe transfer workflow." },
+  { capability: "Expenses", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Feeds business profitability." },
+  { capability: "Customer & credit", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Normal checkout keeps customer capture optional." },
+  { capability: "Approvals", cashier: "NO", manager: "OPERATIONS", admin: "ALL", note: "Sensitive decisions remain manager/admin controlled." },
+  { capability: "Reports & compliance", cashier: "NO", manager: "VIEW/EXPORT", admin: "VIEW/EXPORT", note: "Compliance remains configuration-only until verified." },
+  { capability: "Owner Center / profit / loss", cashier: "NO", manager: "NO", admin: "ADMIN ONLY", note: "Protected in navigation, routes and backend RPCs." },
+  { capability: "Users & role changes", cashier: "NO", manager: "NO", admin: "MANAGE", note: "Admin can set staff as Cashier or Manager only." },
+  { capability: "Shop settings", cashier: "NO", manager: "NO", admin: "EDIT", note: "Commercial/subscription kill switch remains platform-controlled." },
+  { capability: "Backup / audit / hardware admin", cashier: "NO", manager: "NO", admin: "MANAGE", note: "Hardware scanner test remains available from POS scanner screen." },
+];
+
+export const ROLE_SUMMARY = {
+  CASHIER: "Fast selling role: bill, scan, own shift, permitted sales/returns and offline queue. No master-data or financial administration.",
+  MANAGER: "Operational management role: products, purchases, inventory, stock counts/transfers, expenses, approvals and reports. No Owner Center or user/shop administration.",
+  ADMIN: "Shop owner/admin role: all shop-authorized functionality including Owner Center, users, role changes, shop settings, backup and audit.",
+};
diff --git a/src/config/featureCatalog.js b/src/config/featureCatalog.js
new file mode 100644
index 0000000..aecc16f
--- /dev/null
+++ b/src/config/featureCatalog.js
@@ -0,0 +1,18 @@
+export const FEATURE_TIERS = Object.freeze({
+  smart_purchase_intelligence: "PRO",
+  inventory_intelligence: "PRO",
+  owner_control_center: "PRO",
+  profit_intelligence: "PRO",
+  audit_loss_control: "PRO",
+  smart_recommendations: "PLUS",
+  advanced_procurement: "PLUS",
+  advanced_transfers: "PLUS",
+  owner_whatsapp_summary: "PLUS",
+  customer_credit: "PLUS",
+});
+
+export const APP_VERSION = "2026.08-master-consolidation";
+
+export function featureTier(featureKey) {
+  return FEATURE_TIERS[featureKey] || null;
+}
diff --git a/src/config/navigation.js b/src/config/navigation.js
new file mode 100644
index 0000000..2e84610
--- /dev/null
+++ b/src/config/navigation.js
@@ -0,0 +1,72 @@
+import {
+  BarChart3,
+  Boxes,
+  Building2,
+  ClipboardList,
+  Package,
+  Settings,
+  ShoppingCart,
+  Store,
+} from "lucide-react";
+
+export const MAIN_MODULES = [
+  { path: "/pos", label: "POS & Billing", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
+  { path: "/products", label: "Products", icon: Package, roles: ["ADMIN", "MANAGER"] },
+  { path: "/purchasing", label: "Purchases & Suppliers", icon: Store, roles: ["ADMIN", "MANAGER"] },
+  { path: "/inventory", label: "Inventory", icon: Boxes, roles: ["ADMIN", "MANAGER"] },
+  { path: "/operations", label: "Operations", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
+  { path: "/owner", label: "Owner Center", icon: Building2, roles: ["ADMIN"] },
+  { path: "/reports", label: "Reports & Compliance", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
+  { path: "/admin", label: "Settings & Admin", icon: Settings, roles: ["ADMIN"] },
+];
+
+export const MODULE_TABS = {
+  pos: [
+    { path: "/pos", label: "Billing", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+    { path: "/pos/sales", label: "Sales", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+    { path: "/pos/returns", label: "Returns & Voids", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+    { path: "/pos/shifts", label: "Shift", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+    { path: "/pos/scanner", label: "Scanner", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+  ],
+  products: [
+    { path: "/products", label: "Product Master", roles: ["ADMIN", "MANAGER"] },
+    { path: "/products/labels", label: "Barcode Labels", roles: ["ADMIN", "MANAGER"] },
+  ],
+  purchasing: [
+    { path: "/purchasing/receive", label: "Receive Stock", roles: ["ADMIN", "MANAGER"] },
+    { path: "/purchasing/procurement", label: "Procurement", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
+    { path: "/purchasing/intelligence", label: "Purchase Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
+  ],
+  inventory: [
+    { path: "/inventory", label: "Overview", roles: ["ADMIN", "MANAGER"] },
+    { path: "/inventory/count", label: "Stock Count", roles: ["ADMIN", "MANAGER"] },
+    { path: "/inventory/transfers", label: "Transfers", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
+    { path: "/inventory/intelligence", label: "Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
+  ],
+  operations: [
+    { path: "/operations/shifts", label: "Shift & Day Close", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+    { path: "/operations/expenses", label: "Expenses", roles: ["ADMIN", "MANAGER"] },
+    { path: "/operations/approvals", label: "Approvals", roles: ["ADMIN", "MANAGER"] },
+    { path: "/operations/customers", label: "Customer & Credit", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
+    { path: "/operations/offline", label: "Offline Queue", roles: ["ADMIN", "MANAGER", "CASHIER"] },
+  ],
+  owner: [
+    { path: "/owner", label: "Overview", roles: ["ADMIN"], tier: "PRO" },
+    { path: "/owner/profit", label: "Profit Intelligence", roles: ["ADMIN"], tier: "PRO" },
+    { path: "/owner/exceptions", label: "Loss & Exceptions", roles: ["ADMIN"], tier: "PRO" },
+    { path: "/owner/recommendations", label: "Recommendations", roles: ["ADMIN"], tier: "PLUS" },
+    { path: "/owner/share", label: "WhatsApp Summary", roles: ["ADMIN"], tier: "PLUS" },
+  ],
+  reports: [
+    { path: "/reports", label: "Reports & Exports", roles: ["ADMIN", "MANAGER"] },
+    { path: "/reports/compliance", label: "Liquor Compliance", roles: ["ADMIN", "MANAGER"] },
+  ],
+  admin: [
+    { path: "/admin/users", label: "Users", roles: ["ADMIN"] },
+    { path: "/admin/access", label: "Access Control", roles: ["ADMIN"] },
+    { path: "/admin/hardware", label: "Hardware", roles: ["ADMIN"] },
+    { path: "/admin/backup", label: "Backup & Recovery", roles: ["ADMIN"] },
+    { path: "/admin/audit", label: "Audit Log", roles: ["ADMIN"] },
+    { path: "/admin/settings", label: "Shop Settings", roles: ["ADMIN"] },
+  ],
+};
diff --git a/src/lib/theme.js b/src/lib/theme.js
new file mode 100644
index 0000000..ce96e6d
--- /dev/null
+++ b/src/lib/theme.js
@@ -0,0 +1,44 @@
+const THEME_EVENT = "wineshop-theme-change";
+const MEDIA_QUERY = "(prefers-color-scheme: dark)";
+
+export function normalizeTheme(value) {
+  const theme = String(value || "SYSTEM").toUpperCase();
+  return ["SYSTEM", "LIGHT", "DARK"].includes(theme) ? theme : "SYSTEM";
+}
+
+export function resolvedTheme(value) {
+  const preference = normalizeTheme(value);
+  if (preference === "SYSTEM") {
+    return typeof window !== "undefined" && window.matchMedia?.(MEDIA_QUERY).matches ? "dark" : "light";
+  }
+  return preference.toLowerCase();
+}
+
+export function applyThemePreference(value) {
+  if (typeof document === "undefined") return;
+  const preference = normalizeTheme(value);
+  document.documentElement.dataset.themePreference = preference.toLowerCase();
+  document.documentElement.dataset.theme = resolvedTheme(preference);
+}
+
+export function notifyThemePreference(value) {
+  applyThemePreference(value);
+  if (typeof window !== "undefined") {
+    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: normalizeTheme(value) } }));
+  }
+}
+
+export function watchThemePreference(getPreference) {
+  if (typeof window === "undefined") return () => {};
+  const media = window.matchMedia?.(MEDIA_QUERY);
+  const sync = () => applyThemePreference(getPreference?.() || "SYSTEM");
+  const onSystemChange = () => { if (normalizeTheme(getPreference?.()) === "SYSTEM") sync(); };
+  const onCustom = (event) => applyThemePreference(event?.detail?.theme || getPreference?.() || "SYSTEM");
+  sync();
+  media?.addEventListener?.("change", onSystemChange);
+  window.addEventListener(THEME_EVENT, onCustom);
+  return () => {
+    media?.removeEventListener?.("change", onSystemChange);
+    window.removeEventListener(THEME_EVENT, onCustom);
+  };
+}
diff --git a/src/main.jsx b/src/main.jsx
index 3d7b055..9255f58 100644
--- a/src/main.jsx
+++ b/src/main.jsx
@@ -1,3 +1,27 @@
-import { StrictMode } from "react";import { createRoot } from "react-dom/client";import { HashRouter } from "react-router-dom";import App from "./App";import { AuthProvider } from "./context/AuthContext";import { ShopProvider } from "./context/ShopContext";import { ScannerProvider } from "./context/ScannerContext";import "./index.css";import "./chapters9to12.css";import "./chapters16to26.css";
-if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error))}
-createRoot(document.getElementById("root")).render(<StrictMode><HashRouter><AuthProvider><ScannerProvider><ShopProvider><App/></ShopProvider></ScannerProvider></AuthProvider></HashRouter></StrictMode>);
+import { StrictMode } from "react";
+import { createRoot } from "react-dom/client";
+import { HashRouter } from "react-router-dom";
+import App from "./App";
+import { AuthProvider } from "./context/AuthContext";
+import { ShopProvider } from "./context/ShopContext";
+import { ScannerProvider } from "./context/ScannerContext";
+import "./index.css";
+import "./chapters9to12.css";
+import "./chapters16to26.css";
+import "./masterConsolidation.css";
+
+if ("serviceWorker" in navigator) {
+  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
+}
+
+createRoot(document.getElementById("root")).render(
+  <StrictMode>
+    <HashRouter>
+      <AuthProvider>
+        <ScannerProvider>
+          <ShopProvider><App/></ShopProvider>
+        </ScannerProvider>
+      </AuthProvider>
+    </HashRouter>
+  </StrictMode>
+);
diff --git a/src/masterConsolidation.css b/src/masterConsolidation.css
new file mode 100644
index 0000000..08ac589
--- /dev/null
+++ b/src/masterConsolidation.css
@@ -0,0 +1,350 @@
+/* WineShopPOS Master Reconsolidation — UX layer only. Existing transaction styles remain available. */
+:root {
+  --ws-bg: #f6f7f9;
+  --ws-surface: #ffffff;
+  --ws-surface-muted: #f1f3f5;
+  --ws-text: #1f2937;
+  --ws-muted: #667085;
+  --ws-border: #e4e7ec;
+  --ws-accent: #6f243d;
+  --ws-accent-strong: #55192e;
+  --ws-success: #16794b;
+  --ws-warning: #9a6700;
+  --ws-danger: #b42318;
+  --ws-shadow: 0 8px 24px rgba(16,24,40,.06);
+}
+
+html[data-theme="dark"] {
+  --ws-bg: #111318;
+  --ws-surface: #181b22;
+  --ws-surface-muted: #232733;
+  --ws-text: #f3f4f6;
+  --ws-muted: #a7adba;
+  --ws-border: #303542;
+  --ws-shadow: none;
+}
+html[data-theme="dark"] body { background: var(--ws-bg); color: var(--ws-text); }
+html[data-theme="dark"] .panel,
+html[data-theme="dark"] .metric-card,
+html[data-theme="dark"] .state-card,
+html[data-theme="dark"] .user-menu-popover,
+html[data-theme="dark"] .quick-action,
+html[data-theme="dark"] .recommendation-card { background: var(--ws-surface); color: var(--ws-text); border-color: var(--ws-border); }
+html[data-theme="dark"] input,
+html[data-theme="dark"] select,
+html[data-theme="dark"] textarea { background: var(--ws-surface-muted); color: var(--ws-text); border-color: var(--ws-border); }
+
+.app-shell { background: var(--ws-bg); }
+.app-shell.sidebar-collapsed { grid-template-columns: 76px 1fr; }
+.sidebar { min-width: 0; }
+.sidebar-collapse { margin: auto 12px 14px; min-height: 38px; border: 1px solid rgba(255,255,255,.15); background: transparent; color: inherit; border-radius: 8px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; }
+.sidebar-collapsed .brand { justify-content:center; }
+.nav-menu { overflow-y:auto; }
+.consolidated-topbar { display:flex; align-items:center; justify-content:space-between; gap:18px; }
+.topbar-page-context, .topbar-actions, .breadcrumbs, .breadcrumbs span, .section-row, .button-row, .page-title-row, .page-header-standard, .filter-bar { display:flex; align-items:center; }
+.topbar-page-context { gap:12px; min-width:0; }
+.topbar-page-context h1 { margin:0; font-size:18px; line-height:1.2; color:var(--ws-text); }
+.topbar-actions { gap:10px; }
+.breadcrumbs { gap:4px; flex-wrap:wrap; margin-top:4px; color:var(--ws-muted); font-size:12px; }
+.breadcrumbs span { gap:4px; text-transform:capitalize; }
+.mobile-sidebar-toggle { display:none; border:0; background:transparent; cursor:pointer; }
+
+.shop-context-pill,.shop-selector,.offline-pill { display:flex; align-items:center; gap:7px; min-height:36px; padding:0 10px; border:1px solid var(--ws-border); border-radius:8px; background:var(--ws-surface); color:var(--ws-text); font-size:12px; }
+.shop-selector select { border:0; min-height:auto; padding:0; max-width:160px; background:transparent; color:inherit; }
+
+.user-menu { position:relative; }
+.user-menu-trigger { border:0; background:transparent; display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--ws-text); }
+.user-menu-trigger-text { display:grid; text-align:left; line-height:1.2; }
+.user-menu-trigger-text strong { font-size:12px; }
+.user-menu-trigger-text span { font-size:10px; color:var(--ws-muted); }
+.user-menu-popover { position:absolute; right:0; top:calc(100% + 9px); z-index:50; width:300px; padding:10px; border:1px solid var(--ws-border); border-radius:12px; background:var(--ws-surface); box-shadow:var(--ws-shadow); }
+.user-menu-popover > button { width:100%; border:0; background:transparent; color:var(--ws-text); display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:7px; text-align:left; cursor:pointer; }
+.user-menu-popover > button:hover { background:var(--ws-surface-muted); }
+.user-menu-popover > button small { margin-left:auto; color:var(--ws-muted); }
+.user-menu-summary { display:flex; gap:11px; padding:8px; }
+.user-menu-summary > div { display:grid; gap:3px; }
+.user-menu-summary span { font-size:11px; color:var(--ws-muted); }
+.user-menu-shop { padding:9px; margin:4px 0 7px; border-radius:8px; background:var(--ws-surface-muted); display:grid; }
+.user-menu-shop span { font-size:11px; color:var(--ws-muted); }
+.user-menu-divider { border-top:1px solid var(--ws-border); margin:6px 0; }
+.logout-menu-button { color:var(--ws-danger)!important; }
+.user-avatar { object-fit:cover; border-radius:50%; flex:0 0 auto; }
+.avatar-md { width:34px; height:34px; }
+.avatar-lg { width:48px; height:48px; }
+.avatar-xl { width:76px; height:76px; font-size:28px; }
+.avatar-fallback { display:grid; place-items:center; background:var(--ws-accent); color:#fff; font-weight:800; }
+
+.module-shell { min-width:0; }
+.module-heading { margin:0 0 12px; }
+.module-heading h1 { margin:0; font-size:20px; color:var(--ws-text); }
+.module-heading p { margin:4px 0 0; color:var(--ws-muted); max-width:820px; }
+.module-tabs { display:flex; gap:2px; overflow:auto; border-bottom:1px solid var(--ws-border); margin-bottom:18px; scrollbar-width:thin; }
+.module-tab { flex:0 0 auto; border:0; border-bottom:2px solid transparent; padding:9px 11px; display:flex; align-items:center; gap:6px; text-decoration:none; color:var(--ws-muted); background:transparent; cursor:pointer; font-size:13px; }
+.module-tab.active { color:var(--ws-accent); border-bottom-color:var(--ws-accent); font-weight:700; }
+.feature-tier-badge { display:inline-flex; align-items:center; height:18px; padding:0 6px; border-radius:999px; font-size:9px; font-weight:800; letter-spacing:.06em; border:1px solid var(--ws-border); }
+.tier-pro { background:#f4ecff; color:#6941c6; border-color:#e9d7fe; }
+.tier-plus { background:#ecfdf3; color:#067647; border-color:#abefc6; }
+
+.page-header-standard { justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:15px; }
+.page-title-row { gap:8px; }
+.page-header-standard h2 { margin:0; font-size:20px; color:var(--ws-text); }
+.page-header-standard p { margin:4px 0 0; color:var(--ws-muted); max-width:780px; }
+.page-actions { display:flex; gap:8px; flex-wrap:wrap; }
+.section-row { justify-content:space-between; gap:12px; }
+.section-row > label { min-width:180px; }
+.button-row { gap:8px; }
+.button-row.wrap { flex-wrap:wrap; }
+.button-row.compact button { min-height:30px; padding:5px 8px; font-size:11px; }
+.filter-bar { gap:12px; flex-wrap:wrap; }
+.filter-bar label { display:flex; align-items:center; gap:7px; }
+.muted-text { color:var(--ws-muted); font-size:12px; }
+.big-number { font-size:28px; font-weight:800; margin-top:8px; }
+
+.metric-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
+.metric-grid.four { grid-template-columns:repeat(4,minmax(0,1fr)); }
+.metric-card { border:1px solid var(--ws-border); border-radius:10px; padding:14px; background:var(--ws-surface); display:grid; gap:4px; }
+.metric-card span { color:var(--ws-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; }
+.metric-card strong { font-size:21px; color:var(--ws-text); }
+.metric-card small { color:var(--ws-muted); }
+
+.status-badge,.priority { display:inline-flex; align-items:center; white-space:nowrap; border-radius:999px; padding:3px 7px; font-size:10px; font-weight:800; background:#f2f4f7; color:#344054; }
+.status-approved,.status-active,.status-completed,.status-received,.status-pass { background:#ecfdf3; color:#067647; }
+.status-pending,.status-requested,.status-approval-pending,.status-in-transit,.status-partially-received { background:#fffaeb; color:#b54708; }
+.status-rejected,.status-cancelled,.status-void,.status-fail,.status-out-of-stock { background:#fef3f2; color:#b42318; }
+.priority.high { background:#fef3f2; color:#b42318; }
+.priority.medium { background:#fffaeb; color:#b54708; }
+.priority.low { background:#eff8ff; color:#175cd3; }
+
+.state-card { padding:18px; border:1px dashed var(--ws-border); border-radius:10px; background:var(--ws-surface); text-align:center; color:var(--ws-muted); }
+.state-card strong { display:block; color:var(--ws-text); margin-bottom:4px; }
+.state-spinner { display:inline-block; width:16px; height:16px; border:2px solid var(--ws-border); border-top-color:var(--ws-accent); border-radius:50%; animation:ws-spin .8s linear infinite; }
+@keyframes ws-spin { to { transform:rotate(360deg); } }
+
+.quick-action-grid,.capability-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:16px; }
+.quick-action,.capability-card { text-decoration:none; color:var(--ws-text); display:flex; gap:11px; padding:14px; border:1px solid var(--ws-border); border-radius:10px; background:var(--ws-surface); }
+.quick-action { display:grid; }
+.quick-action span,.capability-card span { color:var(--ws-muted); font-size:12px; }
+.capability-card div { display:grid; gap:4px; }
+
+.recommendation-list { display:grid; gap:10px; }
+.recommendation-card,.recommendation-row { display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid var(--ws-border); padding:11px 0; }
+.recommendation-card { border:1px solid var(--ws-border); border-radius:10px; padding:13px; }
+.recommendation-row { text-decoration:none; color:var(--ws-text); }
+.recommendation-row p,.recommendation-card p { margin:3px 0 0; color:var(--ws-muted); font-size:12px; }
+.share-preview { white-space:pre-wrap; background:var(--ws-surface-muted); border:1px solid var(--ws-border); padding:15px; border-radius:8px; line-height:1.7; font-family:inherit; }
+
+.movement-breakdown { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:9px; margin-top:10px; }
+.movement-chip { border:1px solid var(--ws-border); border-radius:8px; padding:10px; display:grid; gap:3px; }
+.movement-chip span { color:var(--ws-muted); font-size:11px; }
+.movement-chip strong { font-size:18px; }
+.movement-chip small { color:var(--ws-muted); }
+
+.profile-summary-card { display:flex; gap:16px; align-items:flex-start; }
+.profile-summary-card > div { display:grid; gap:5px; }
+.profile-summary-card h3,.profile-summary-card p { margin:0; }
+.compact-form { max-width:620px; display:grid; gap:12px; }
+.account-tabs { margin-bottom:16px; }
+.runbook-list { padding-left:20px; line-height:1.7; }
+textarea { min-height:86px; resize:vertical; }
+.icon-button { border:0; background:transparent; cursor:pointer; font-size:18px; }
+.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
+
+.data-table.sticky thead th { position:sticky; top:0; z-index:1; background:var(--ws-surface); }
+.data-table-wrapper { max-width:100%; overflow:auto; }
+
+/* barcode label printing */
+.barcode-label-workspace { display:grid; grid-template-columns:minmax(280px,360px) 1fr; gap:16px; }
+.barcode-label-preview { display:flex; flex-wrap:wrap; align-items:flex-start; gap:8px; }
+.barcode-label { width:50mm; min-height:30mm; border:1px dashed #999; background:#fff; color:#111; display:grid; place-items:center; align-content:center; padding:2mm; text-align:center; break-inside:avoid; }
+.barcode-label strong { font-size:10px; line-height:1.1; }
+.barcode-label svg { max-width:100%; height:auto; }
+
+@media (max-width: 1100px) {
+  .metric-grid.four { grid-template-columns:repeat(2,minmax(0,1fr)); }
+  .consolidated-topbar { align-items:flex-start; }
+  .user-menu-trigger-text { display:none; }
+}
+@media (max-width: 800px) {
+  .app-shell,.app-shell.sidebar-collapsed { grid-template-columns:68px 1fr; }
+  .app-shell .sidebar .brand > div:not(.brand-icon), .app-shell .nav-item span, .sidebar-collapse span { display:none; }
+  .app-shell .brand,.app-shell .nav-item { justify-content:center; }
+  .topbar-actions .shop-context-pill span { display:none; }
+  .page-area { padding-left:12px; padding-right:12px; }
+  .quick-action-grid,.capability-grid,.barcode-label-workspace { grid-template-columns:1fr; }
+}
+@media (max-width: 600px) {
+  .metric-grid,.metric-grid.four { grid-template-columns:1fr; }
+  .consolidated-topbar { flex-direction:column; }
+  .topbar-actions { width:100%; justify-content:flex-end; }
+  .module-tabs { margin-left:-12px; margin-right:-12px; padding-left:12px; }
+}
+
+@media print {
+  .barcode-label-only .sidebar,.barcode-label-only .topbar,.barcode-label-only .module-heading,.barcode-label-only .module-tabs,.barcode-label-only .no-print { display:none!important; }
+  .barcode-label-only .main-area,.barcode-label-only .page-area { padding:0!important; margin:0!important; }
+  .barcode-label { border:0; }
+}
+.dialog-backdrop{position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:100;display:grid;place-items:center;padding:20px}.dialog-card{width:min(440px,100%);background:var(--ws-surface);color:var(--ws-text);border-radius:12px;border:1px solid var(--ws-border);box-shadow:var(--ws-shadow);padding:18px}.dialog-card h3{margin-top:0}.action-menu{position:relative;display:inline-block}.action-menu-popover{position:absolute;right:0;top:100%;z-index:20;min-width:150px;border:1px solid var(--ws-border);border-radius:8px;background:var(--ws-surface);box-shadow:var(--ws-shadow);padding:5px}.action-menu-popover button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:7px;border-radius:5px;color:var(--ws-text)}.action-menu-popover button:hover{background:var(--ws-surface-muted)}.barcode-label-sheet{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}.barcode-label-sheet .barcode-label{break-inside:avoid}@media print{.sidebar,.topbar,.module-heading,.module-tabs,.no-print{display:none!important}.app-shell,.app-shell.sidebar-collapsed{display:block!important}.main-area,.page-area,.module-content{margin:0!important;padding:0!important}.barcode-label-sheet{gap:0}.barcode-label{border:0}}
+
+/* ============================================================
+   MODERN BUSINESS UI — POWER BI-INSPIRED INFORMATION DESIGN
+   Loaded after legacy styles so the existing engine receives a
+   consistent modern visual layer without a backend rewrite.
+   ============================================================ */
+:root,
+html[data-theme="light"] {
+  color-scheme: light;
+  --ws-bg:#f4f6fa;
+  --ws-surface:#ffffff;
+  --ws-surface-muted:#f7f9fc;
+  --ws-surface-raised:#ffffff;
+  --ws-text:#172033;
+  --ws-muted:#697386;
+  --ws-border:#e3e8f0;
+  --ws-accent:#118DFF;
+  --ws-accent-strong:#0b6fd3;
+  --ws-accent-soft:#eaf5ff;
+  --ws-success:#138a5b;
+  --ws-warning:#b7791f;
+  --ws-danger:#d64550;
+  --ws-sidebar:#111827;
+  --ws-sidebar-muted:#94a3b8;
+  --ws-sidebar-active:#1f2937;
+  --ws-shadow:0 8px 26px rgba(16,24,40,.07);
+  --ws-shadow-soft:0 2px 10px rgba(16,24,40,.05);
+}
+html[data-theme="dark"] {
+  color-scheme: dark;
+  --ws-bg:#0b1020;
+  --ws-surface:#111827;
+  --ws-surface-muted:#172033;
+  --ws-surface-raised:#141d2e;
+  --ws-text:#f4f7fb;
+  --ws-muted:#9aa7b8;
+  --ws-border:#28354b;
+  --ws-accent:#49a6ff;
+  --ws-accent-strong:#79bbff;
+  --ws-accent-soft:#102c47;
+  --ws-success:#49b98b;
+  --ws-warning:#e0a84a;
+  --ws-danger:#f26b74;
+  --ws-sidebar:#060a13;
+  --ws-sidebar-muted:#8fa0b5;
+  --ws-sidebar-active:#172033;
+  --ws-shadow:0 12px 30px rgba(0,0,0,.22);
+  --ws-shadow-soft:0 4px 14px rgba(0,0,0,.18);
+}
+
+html, body, #root { min-height:100%; }
+body { margin:0; background:var(--ws-bg)!important; color:var(--ws-text)!important; font-family:"Segoe UI",Inter,system-ui,-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }
+.app-shell { min-height:100vh; background:var(--ws-bg)!important; color:var(--ws-text); }
+.main-area,.page-area,.module-shell,.module-content { background:var(--ws-bg); color:var(--ws-text); }
+.page-area { padding-top:22px; }
+
+.sidebar { background:var(--ws-sidebar)!important; border-right:1px solid rgba(255,255,255,.07); box-shadow:8px 0 28px rgba(15,23,42,.08); }
+.brand { border-bottom:1px solid rgba(255,255,255,.08); }
+.brand-icon { background:#118DFF!important; box-shadow:0 5px 16px rgba(17,141,255,.28); }
+.brand-name { color:#fff!important; letter-spacing:-.01em; }
+.brand-subtitle { color:var(--ws-sidebar-muted)!important; }
+.nav-item { margin:3px 10px; border-radius:9px!important; color:#c7d2e0!important; border-left:0!important; transition:background .14s ease,color .14s ease,transform .14s ease; }
+.nav-item:hover { background:rgba(255,255,255,.07)!important; color:#fff!important; }
+.nav-item.active { background:var(--ws-sidebar-active)!important; color:#fff!important; box-shadow:inset 3px 0 0 #118DFF; }
+.sidebar-collapse { color:#c7d2e0; }
+.sidebar-collapse:hover { background:rgba(255,255,255,.06); }
+
+.topbar { background:color-mix(in srgb,var(--ws-surface) 94%,transparent)!important; color:var(--ws-text)!important; border-bottom:1px solid var(--ws-border)!important; box-shadow:0 1px 0 rgba(16,24,40,.02); backdrop-filter:blur(12px); }
+.topbar-page-context h1 { font-weight:700; letter-spacing:-.015em; }
+.breadcrumbs { color:var(--ws-muted)!important; }
+.theme-toggle { min-height:36px; padding:0 10px; border:1px solid var(--ws-border); border-radius:9px; background:var(--ws-surface); color:var(--ws-text); display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; font-weight:600; }
+.theme-toggle:hover { border-color:#118DFF; background:var(--ws-accent-soft); }
+.theme-toggle:disabled { opacity:.6; cursor:wait; }
+
+.panel,.metric-card,.chart-card,.quick-action,.capability-card,.state-card,.dialog-card,.user-menu-popover,.recommendation-card {
+  background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid var(--ws-border)!important; box-shadow:var(--ws-shadow-soft); border-radius:14px!important;
+}
+.panel { padding:18px!important; }
+.panel h2,.panel h3,.panel h4,.quick-action strong,.capability-card strong { color:var(--ws-text); }
+.panel p,.quick-action span,.capability-card span { color:var(--ws-muted); }
+
+.page-header-standard h2,.module-heading h1 { font-weight:750; letter-spacing:-.025em; }
+.module-heading p,.page-header-standard p { color:var(--ws-muted); }
+.module-tabs { gap:4px; padding:0 2px; }
+.module-tab { border-radius:8px 8px 0 0; font-weight:600; }
+.module-tab:hover { background:var(--ws-surface-muted); color:var(--ws-text); }
+.module-tab.active { color:var(--ws-accent); background:var(--ws-accent-soft); border-bottom-color:var(--ws-accent); }
+
+.primary-button,.secondary-button,.danger-button,button.primary-button,button.secondary-button,a.primary-button,a.secondary-button {
+  min-height:38px; border-radius:9px!important; font-weight:650; transition:transform .12s ease,box-shadow .12s ease,background .12s ease; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px;
+}
+.primary-button { background:var(--ws-accent)!important; color:#fff!important; border:1px solid var(--ws-accent)!important; box-shadow:0 3px 10px rgba(17,141,255,.2); }
+.primary-button:hover { background:var(--ws-accent-strong)!important; transform:translateY(-1px); }
+.secondary-button { background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid var(--ws-border)!important; }
+.secondary-button:hover { background:var(--ws-surface-muted)!important; border-color:#b8c4d5!important; }
+.button-link { padding:0 13px; }
+
+input,select,textarea { background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid #cfd7e3!important; border-radius:9px!important; outline:none; transition:border-color .12s ease,box-shadow .12s ease; }
+html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea { border-color:var(--ws-border)!important; }
+input:focus,select:focus,textarea:focus { border-color:var(--ws-accent)!important; box-shadow:0 0 0 3px color-mix(in srgb,var(--ws-accent) 16%,transparent)!important; }
+input:disabled,select:disabled,textarea:disabled { background:var(--ws-surface-muted)!important; color:var(--ws-muted)!important; opacity:1; }
+label { color:var(--ws-text); font-weight:600; }
+label small { display:block; margin-top:5px; color:var(--ws-muted); font-weight:400; }
+
+.data-table-wrapper { border:1px solid var(--ws-border); border-radius:12px; background:var(--ws-surface); }
+.data-table { width:100%; border-collapse:separate!important; border-spacing:0!important; background:transparent!important; color:var(--ws-text)!important; }
+.data-table th { background:var(--ws-surface-muted)!important; color:#566176!important; font-size:11px; text-transform:uppercase; letter-spacing:.035em; font-weight:750; border-bottom:1px solid var(--ws-border)!important; }
+html[data-theme="dark"] .data-table th { color:#aeb8c8!important; }
+.data-table td { color:var(--ws-text)!important; border-bottom:1px solid var(--ws-border)!important; }
+.data-table tbody tr:last-child td { border-bottom:0!important; }
+.data-table tbody tr:hover td { background:color-mix(in srgb,var(--ws-accent) 4%,var(--ws-surface))!important; }
+
+.metric-card { position:relative; overflow:hidden; min-height:98px; padding:16px 16px 14px!important; }
+.metric-card::before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--metric-accent,#118DFF); }
+.metric-card span { text-transform:none!important; letter-spacing:0!important; font-size:12px!important; font-weight:650!important; }
+.metric-card strong { font-size:24px!important; font-weight:760; letter-spacing:-.025em; }
+.metric-card small { font-size:11px; }
+.metric-accent-blue { --metric-accent:#118DFF; }.metric-accent-indigo { --metric-accent:#12239E; }.metric-accent-green { --metric-accent:#197278; }.metric-accent-orange { --metric-accent:#E66C37; }.metric-accent-red { --metric-accent:#D64550; }
+
+/* Power BI-inspired chart cards */
+.dashboard-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
+.dashboard-chart-grid.primary { grid-template-columns:minmax(0,1.65fr) minmax(320px,.85fr); }
+.chart-card { padding:17px; min-height:320px; }
+.chart-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
+.chart-heading h3 { margin:0; font-size:15px; letter-spacing:-.01em; }
+.chart-heading p { margin:4px 0 0; color:var(--ws-muted); font-size:12px; }
+.chart-heading > strong { font-size:16px; color:var(--ws-text); }
+.chart-empty { min-height:220px; display:grid; place-items:center; color:var(--ws-muted); border:1px dashed var(--ws-border); border-radius:10px; background:var(--ws-surface-muted); }
+.line-chart { position:relative; height:245px; padding-bottom:26px; }
+.line-chart svg { width:100%; height:100%; overflow:visible; }
+.chart-grid-line { stroke:var(--ws-border); stroke-width:1; vector-effect:non-scaling-stroke; }
+.chart-line-path { fill:none; stroke:#118DFF; stroke-width:3; vector-effect:non-scaling-stroke; stroke-linejoin:round; stroke-linecap:round; }
+.chart-line-point { fill:#fff; stroke:#118DFF; stroke-width:2; vector-effect:non-scaling-stroke; }
+html[data-theme="dark"] .chart-line-point { fill:var(--ws-surface); }
+.chart-axis-labels { position:absolute; left:0; right:0; bottom:0; height:22px; color:var(--ws-muted); font-size:10px; }
+.chart-axis-labels span { position:absolute; transform:translateX(-50%); white-space:nowrap; }
+.donut-layout { min-height:235px; display:grid; grid-template-columns:190px 1fr; gap:20px; align-items:center; }
+.donut-chart { width:180px; height:180px; border-radius:50%; display:grid; place-items:center; margin:auto; box-shadow:inset 0 0 0 1px rgba(0,0,0,.03); }
+.donut-hole { width:104px; height:104px; border-radius:50%; background:var(--ws-surface); display:grid; place-items:center; align-content:center; box-shadow:0 0 0 1px var(--ws-border); }
+.donut-hole span { color:var(--ws-muted); font-size:11px; }.donut-hole strong { font-size:18px; }
+.chart-legend { display:grid; gap:9px; }.chart-legend>div { display:grid; grid-template-columns:9px 1fr auto; gap:8px; align-items:center; font-size:12px; }.chart-legend i { width:9px; height:9px; border-radius:2px; }.chart-legend span { color:var(--ws-muted); }.chart-legend strong { color:var(--ws-text); }
+.horizontal-bars { display:grid; gap:12px; padding-top:2px; }.horizontal-bar-row { display:grid; gap:5px; }.horizontal-bar-meta { display:flex; justify-content:space-between; gap:12px; font-size:12px; }.horizontal-bar-meta span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--ws-text); }.horizontal-bar-meta strong { color:var(--ws-muted); font-weight:650; }.horizontal-bar-track { height:10px; background:var(--ws-surface-muted); border-radius:999px; overflow:hidden; }.horizontal-bar-fill { height:100%; border-radius:999px; }
+.column-chart { min-height:230px; display:flex; align-items:stretch; justify-content:space-around; gap:10px; padding:10px 4px 0; border-bottom:1px solid var(--ws-border); }.column-item { min-width:58px; flex:1; max-width:110px; display:grid; grid-template-rows:24px 1fr 34px; text-align:center; gap:4px; }.column-value { font-size:10px; color:var(--ws-muted); overflow:hidden; text-overflow:ellipsis; }.column-track { display:flex; align-items:flex-end; justify-content:center; min-height:155px; }.column-fill { width:min(46px,70%); border-radius:5px 5px 0 0; min-height:6px; }.column-fill.negative { opacity:.9; }.column-label { font-size:10px; color:var(--ws-muted); line-height:1.2; display:grid; place-items:start center; }
+.attention-card { min-height:320px; }.attention-metrics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }.attention-metrics>div { padding:14px; border:1px solid var(--ws-border); background:var(--ws-surface-muted); border-radius:10px; display:grid; gap:5px; }.attention-metrics span { color:var(--ws-muted); font-size:11px; }.attention-metrics strong { font-size:20px; }
+
+/* Settings / role administration */
+.settings-section { height:fit-content; }.settings-section-heading { margin-bottom:14px; }.settings-section-heading h3 { margin:0; }.settings-section-heading p { margin:4px 0 0; font-size:12px; color:var(--ws-muted); }
+.settings-fields { display:grid!important; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px!important; }.settings-fields label { display:grid; gap:6px; }.settings-fields .span-two { grid-column:1/-1; }
+.settings-inline-row { display:flex; align-items:end; gap:18px; flex-wrap:wrap; }.toggle-field { display:flex!important; flex-direction:row!important; align-items:center; gap:9px; min-height:40px; }.toggle-field input { width:18px; height:18px; box-shadow:none!important; }
+.settings-action-bar { position:sticky; bottom:12px; z-index:10; margin-top:16px; padding:12px 14px; border:1px solid var(--ws-border); border-radius:12px; background:color-mix(in srgb,var(--ws-surface) 94%,transparent); backdrop-filter:blur(12px); box-shadow:var(--ws-shadow); display:flex; align-items:center; justify-content:space-between; gap:16px; color:var(--ws-muted); font-size:12px; }
+.settings-action-bar strong { color:var(--ws-text); }
+.role-summary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }.role-summary-card { display:flex; gap:12px; }.role-summary-card h3,.role-summary-card p { margin:0; }.role-summary-card p { margin-top:5px; font-size:12px; line-height:1.5; }.role-orb { width:42px; height:42px; border-radius:11px; display:grid; place-items:center; flex:0 0 auto; }.role-orb.cashier { background:#eaf5ff; color:#118DFF; }.role-orb.manager { background:#f0edff; color:#744EC2; }.role-orb.admin { background:#fff1e9; color:#E66C37; }
+.access-chip { display:inline-flex; gap:5px; align-items:center; border-radius:999px; padding:4px 7px; font-size:9px; font-weight:750; white-space:nowrap; }.access-chip.allowed { color:#087a51; background:#e8f8f1; }.access-chip.denied { color:#a12d37; background:#fff0f1; }
+html[data-theme="dark"] .access-chip.allowed { color:#66d3a9; background:#10352a; } html[data-theme="dark"] .access-chip.denied { color:#ff9da4; background:#421f25; }
+.access-matrix th:nth-child(1){min-width:180px}.access-matrix th:nth-child(5){min-width:280px}.access-safety-note { display:flex; gap:12px; align-items:flex-start; }.access-safety-note p { margin:4px 0 0; }.role-rule-list { display:grid; gap:11px; margin:14px 0; }.role-rule-list>div { display:grid; grid-template-columns:90px 1fr; gap:10px; align-items:start; }.role-rule-list span:last-child { color:var(--ws-muted); font-size:12px; line-height:1.5; }.role-select { min-width:120px; }
+.about-faith-line { margin-top:18px!important; font-size:16px; color:var(--ws-accent)!important; }
+
+.product-not-found { background:color-mix(in srgb,var(--ws-danger) 8%,var(--ws-surface))!important; border-color:color-mix(in srgb,var(--ws-danger) 55%,var(--ws-border))!important; }
+.purchase-message { border-radius:10px!important; }
+.share-preview { background:var(--ws-surface-muted)!important; }
+
+@media(max-width:1150px){.dashboard-chart-grid.primary,.dashboard-chart-grid{grid-template-columns:1fr}.role-summary-grid{grid-template-columns:1fr}.settings-action-bar{position:static;flex-direction:column;align-items:flex-start}.settings-action-bar .button-row{width:100%;}}
+@media(max-width:760px){.settings-fields{grid-template-columns:1fr}.settings-fields .span-two{grid-column:auto}.donut-layout{grid-template-columns:1fr}.dashboard-chart-grid{grid-template-columns:1fr}.theme-toggle span{display:none}.chart-card{min-height:280px}.role-rule-list>div{grid-template-columns:1fr}.column-chart{overflow-x:auto;justify-content:flex-start}.column-item{min-width:76px}.metric-card strong{font-size:22px!important}}
diff --git a/src/pages/AccessControl.jsx b/src/pages/AccessControl.jsx
new file mode 100644
index 0000000..f91a88a
--- /dev/null
+++ b/src/pages/AccessControl.jsx
@@ -0,0 +1,24 @@
+import { Link } from "react-router-dom";
+import { Check, Eye, LockKeyhole, ShieldCheck, X } from "lucide-react";
+import PageHeader from "../components/ui/PageHeader";
+import { ROLE_ACCESS_ROWS, ROLE_SUMMARY } from "../config/accessMatrix";
+
+function AccessCell({ value }) {
+  const denied = value === "NO";
+  const Icon = denied ? X : value === "VIEW IN POS" || value === "VIEW/EXPORT" ? Eye : value.includes("ADMIN") ? LockKeyhole : Check;
+  return <span className={denied ? "access-chip denied" : "access-chip allowed"}><Icon size={13}/>{value}</span>;
+}
+
+export default function AccessControl() {
+  return <div>
+    <PageHeader title="Role Access Control" subtitle="Authoritative role boundaries for Cashier, Manager and Shop Admin. Change a user's role from Users; ADMIN itself remains platform-controlled."/>
+    <div className="role-summary-grid">
+      {Object.entries(ROLE_SUMMARY).map(([role, text]) => <section className="panel role-summary-card" key={role}><div className={`role-orb ${role.toLowerCase()}`}><ShieldCheck size={20}/></div><div><h3>{role}</h3><p>{text}</p></div></section>)}
+    </div>
+    <section className="panel" style={{marginTop:16}}>
+      <div className="section-row"><div><h3>Access Matrix</h3><p className="muted-text">Roles are security boundaries, not just hidden menu items. Backend RLS/RPC checks remain authoritative.</p></div><Link className="primary-button button-link" to="/admin/users">Manage Users</Link></div>
+      <div className="data-table-wrapper access-matrix-wrap"><table className="data-table access-matrix"><thead><tr><th>Capability</th><th>Cashier</th><th>Manager</th><th>Shop Admin</th><th>Control</th></tr></thead><tbody>{ROLE_ACCESS_ROWS.map((row)=><tr key={row.capability}><td><strong>{row.capability}</strong></td><td><AccessCell value={row.cashier}/></td><td><AccessCell value={row.manager}/></td><td><AccessCell value={row.admin}/></td><td className="muted-text">{row.note}</td></tr>)}</tbody></table></div>
+    </section>
+    <section className="panel access-safety-note" style={{marginTop:16}}><LockKeyhole size={20}/><div><strong>Security rule</strong><p>A Shop Admin can move a non-admin staff account between CASHIER and MANAGER, or disable it. A Shop Admin cannot create/promote another ADMIN, change the platform-owned subscription kill switch, or bypass Supabase security.</p></div></section>
+  </div>;
+}
diff --git a/src/pages/Account.jsx b/src/pages/Account.jsx
new file mode 100644
index 0000000..d5d988c
--- /dev/null
+++ b/src/pages/Account.jsx
@@ -0,0 +1,57 @@
+import { useEffect, useMemo, useState } from "react";
+import { useSearchParams } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+import PageHeader from "../components/ui/PageHeader";
+import UserAvatar from "../components/ui/UserAvatar";
+import StatusBadge from "../components/ui/StatusBadge";
+import { APP_VERSION } from "../config/featureCatalog";
+import { notifyThemePreference } from "../lib/theme";
+
+export default function Account() {
+  const { profile, user, refreshAccess } = useAuth();
+  const [params, setParams] = useSearchParams();
+  const tab = params.get("tab") || "profile";
+  const [form, setForm] = useState({ fullName: "", phone: "", avatarUrl: "", theme: "SYSTEM" });
+  const [password, setPassword] = useState({ next: "", confirm: "" });
+  const [message, setMessage] = useState("");
+  const [busy, setBusy] = useState(false);
+
+  useEffect(() => setForm({ fullName: profile?.full_name || "", phone: profile?.phone || "", avatarUrl: profile?.avatar_url || "", theme: profile?.theme || "SYSTEM" }), [profile]);
+  const lastLogin = useMemo(() => user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("en-IN") : "Not available", [user]);
+
+  async function saveProfile(event) {
+    event.preventDefault(); setBusy(true); setMessage("");
+    const { error } = await supabase.rpc("update_my_profile", { p_full_name: form.fullName, p_phone: form.phone || null, p_avatar_url: form.avatarUrl || null, p_theme: form.theme });
+    if (error) setMessage("Unable to update profile. Check the entered values and try again.");
+    else { setMessage("Profile updated."); await refreshAccess(); }
+    setBusy(false);
+  }
+
+  async function changePassword(event) {
+    event.preventDefault(); setMessage("");
+    if (password.next.length < 8) return setMessage("Use a password with at least 8 characters.");
+    if (password.next !== password.confirm) return setMessage("Passwords do not match.");
+    setBusy(true);
+    const { error } = await supabase.auth.updateUser({ password: password.next });
+    setMessage(error ? "Unable to change password. Please retry." : "Password changed successfully.");
+    if (!error) setPassword({ next: "", confirm: "" });
+    setBusy(false);
+  }
+
+  return <div><PageHeader title="My Account" subtitle="Profile, preferences and security for your signed-in account."/>
+    <nav className="module-tabs account-tabs">
+      {[['profile','My Profile'],['settings','Account Settings'],['security','Security'],['about','Help / About']].map(([key,label]) => <button key={key} className={tab===key ? "module-tab active" : "module-tab"} onClick={() => setParams({ tab:key })}>{label}</button>)}
+    </nav>
+    {message ? <div className="purchase-message">{message}</div> : null}
+
+    {tab === "profile" ? <div className="settings-grid"><section className="panel profile-summary-card"><UserAvatar profile={profile} size="xl"/><div><h3>{profile?.full_name}</h3><p>{profile?.email || user?.email}</p><StatusBadge status={profile?.role}/><p><strong>Shop:</strong> {profile?.shop_name}</p><p><strong>Organization:</strong> {profile?.organization_name || "-"}</p><p><strong>Account:</strong> {profile?.active ? "Active" : "Inactive"}</p><p><strong>Last login:</strong> {lastLogin}</p></div></section>
+      <form className="panel" onSubmit={saveProfile}><h3>Editable profile</h3><div className="settings-fields"><label>Display Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label><label>Profile Image URL<input type="url" value={form.avatarUrl} onChange={(e)=>setForm({...form,avatarUrl:e.target.value})} placeholder="https://..."/></label></div><p className="muted-text">Email, role and shop security assignments cannot be changed here.</p><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Profile"}</button></form></div> : null}
+
+    {tab === "settings" ? <form className="panel compact-form" onSubmit={saveProfile}><h3>UI Preferences</h3><label>Theme<select value={form.theme} onChange={(e)=>{ const theme=e.target.value; setForm({...form,theme}); notifyThemePreference(theme); }}><option value="SYSTEM">System</option><option value="LIGHT">Light</option><option value="DARK">Dark</option></select></label><p className="muted-text">Theme changes preview immediately and are saved to your account. System follows your device light/dark preference.</p><button className="primary-button" disabled={busy}>Save Preferences</button></form> : null}
+
+    {tab === "security" ? <form className="panel compact-form" onSubmit={changePassword}><h3>Change Password</h3><label>New Password<input type="password" minLength="8" value={password.next} onChange={(e)=>setPassword({...password,next:e.target.value})} required/></label><label>Confirm Password<input type="password" minLength="8" value={password.confirm} onChange={(e)=>setPassword({...password,confirm:e.target.value})} required/></label><button className="primary-button" disabled={busy}>Change Password</button><p className="muted-text">Role changes remain Admin/Platform-controlled. Never share passwords or service keys.</p></form> : null}
+
+    {tab === "about" ? <section className="panel"><h3>WineShopPOS</h3><p><strong>Version:</strong> {APP_VERSION}</p><p className="about-faith-line"><strong>Trust the GOD.</strong></p><p><strong>Created by:</strong> Almighty sa_f</p><p><strong>Support:</strong> Contact your WineShopPOS software provider for account, subscription or database support.</p><p><strong>Documentation:</strong> Project developer handbook and user manual are stored in the Git repository under <code>docs/</code>.</p></section> : null}
+  </div>;
+}
diff --git a/src/pages/Approvals.jsx b/src/pages/Approvals.jsx
new file mode 100644
index 0000000..bcad604
--- /dev/null
+++ b/src/pages/Approvals.jsx
@@ -0,0 +1,10 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+import StatusBadge from "../components/ui/StatusBadge";
+
+export default function Approvals(){const[items,setItems]=useState([]);const[message,setMessage]=useState("");const[busy,setBusy]=useState("");
+async function load(){const[r,s,c,t,p]=await Promise.all([supabase.from("sale_return_requests").select("id,status,reason,total_refund,created_at").eq("status","PENDING").order("created_at"),supabase.from("cashier_shifts").select("id,status,cash_difference,opened_at,close_requested_at").eq("status","CLOSE_REQUESTED").order("close_requested_at"),supabase.from("stock_counts").select("id,count_number,status,submitted_at").eq("status","SUBMITTED").order("submitted_at"),supabase.from("stock_transfers").select("id,status,created_at,source_shop_id,destination_shop_id").eq("status","REQUESTED").order("created_at"),supabase.from("purchase_orders").select("id,po_number,status,subtotal,created_at").eq("status","APPROVAL_PENDING").order("created_at")]);if([r,s,c,t,p].some((x)=>x.error)){setMessage("Unable to load all approval queues.");return}setItems([...(r.data||[]).map((x)=>({type:"RETURN",id:x.id,title:`Return ${Number(x.total_refund||0).toFixed(2)}`,detail:x.reason,when:x.created_at,status:x.status})),...(s.data||[]).map((x)=>({type:"SHIFT",id:x.id,title:"Shift close",detail:`Cash difference ${x.cash_difference??"pending"}`,when:x.close_requested_at||x.opened_at,status:x.status})),...(c.data||[]).map((x)=>({type:"STOCK_COUNT",id:x.id,title:x.count_number,detail:"Physical stock count submitted",when:x.submitted_at,status:x.status})),...(t.data||[]).map((x)=>({type:"TRANSFER",id:x.id,title:"Incoming transfer",detail:`From ${String(x.source_shop_id).slice(0,8)}`,when:x.created_at,status:x.status})),...(p.data||[]).map((x)=>({type:"PURCHASE_ORDER",id:x.id,title:x.po_number,detail:`PO total ${x.subtotal}`,when:x.created_at,status:x.status}))].sort((a,b)=>new Date(b.when)-new Date(a.when)))}useEffect(()=>{load()},[]);
+async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
+return <div><PageHeader title="Approval Center" subtitle="One place for sensitive operational approvals; existing transaction RPCs remain authoritative." actions={<button className="secondary-button" onClick={load}>Refresh</button>}/>{message?<div className="purchase-message">{message}</div>:null}{items.length===0?<EmptyState title="Nothing is waiting for approval" message="Returns, shift closes, stock counts, transfer requests and purchase orders will appear here."/>:<div className="approval-list">{items.map((item)=><article className="approval-card" key={`${item.type}-${item.id}`}><div><div className="approval-type">{item.type.replaceAll("_"," ")}</div><strong>{item.title}</strong><p>{item.detail}</p><small>{new Date(item.when).toLocaleString("en-IN")}</small></div><div className="approval-actions"><StatusBadge status={item.status}/><button className="primary-button" disabled={!!busy} onClick={()=>act(item,"approve")}>Approve</button>{!["SHIFT","STOCK_COUNT"].includes(item.type)?<button className="secondary-button" disabled={!!busy} onClick={()=>act(item,"reject")}>Reject</button>:null}</div></article>)}</div>}</div>}
diff --git a/src/pages/BackupRecovery.jsx b/src/pages/BackupRecovery.jsx
new file mode 100644
index 0000000..9998cca
--- /dev/null
+++ b/src/pages/BackupRecovery.jsx
@@ -0,0 +1,11 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import StatusBadge from "../components/ui/StatusBadge";
+import EmptyState from "../components/ui/EmptyState";
+
+export default function BackupRecovery(){const{createBackup}=useShop();const[tests,setTests]=useState([]);const[msg,setMsg]=useState("");const[form,setForm]=useState({environment:"STAGING",reference:"",result:"PASS",notes:""});async function load(){const{data,error}=await supabase.from("backup_restore_tests").select("*").order("tested_at",{ascending:false}).limit(50);if(error)setMsg("Unable to load restore-test history.");else setTests(data||[])}useEffect(()=>{load()},[]);
+function exportSnapshot(){const snapshot=createBackup();const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`wineshoppos-operational-snapshot-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)}
+async function record(e){e.preventDefault();const{error}=await supabase.rpc("record_backup_restore_test",{p_environment:form.environment,p_backup_reference:form.reference,p_result:form.result,p_notes:form.notes||null});setMsg(error?"Unable to record restore test.":"Restore test evidence recorded.");if(!error){setForm({...form,reference:"",notes:""});load()}}
+return <div><PageHeader title="Backup & Recovery" subtitle="Operational snapshot export plus documented restore-test evidence."/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><section className="panel"><h3>Recovery Strategy</h3><ol className="runbook-list"><li>Use Supabase platform/database backups appropriate to the subscribed plan.</li><li>Keep migrations and Edge Functions in Git as infrastructure history.</li><li>Export operational JSON snapshots for human-readable emergency reference.</li><li>Perform restore drills in a separate non-production environment.</li><li>Record PASS/FAIL evidence below.</li></ol><button className="primary-button" onClick={exportSnapshot}>Export Operational Snapshot</button><p className="muted-text">This JSON is not a substitute for a PostgreSQL database backup.</p></section><form className="panel" onSubmit={record}><h3>Record Restore Drill</h3><div className="settings-fields"><label>Environment<select value={form.environment} onChange={(e)=>setForm({...form,environment:e.target.value})}><option>STAGING</option><option>TEST</option><option>DISASTER_RECOVERY</option></select></label><label>Backup Reference<input required value={form.reference} onChange={(e)=>setForm({...form,reference:e.target.value})} placeholder="backup id/date/runbook reference"/></label><label>Result<select value={form.result} onChange={(e)=>setForm({...form,result:e.target.value})}><option>PASS</option><option>FAIL</option></select></label><label>Notes<textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label></div><br/><button className="primary-button">Record Test</button></form></div><section className="panel" style={{marginTop:16}}><h3>Restore Test History</h3>{tests.length===0?<EmptyState title="No restore drill recorded" message="Production backup readiness is not considered proven until a restore drill succeeds."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>When</th><th>Environment</th><th>Backup Reference</th><th>Result</th><th>Notes</th></tr></thead><tbody>{tests.map(t=><tr key={t.id}><td>{new Date(t.test_date||t.created_at).toLocaleString("en-IN")}</td><td>{t.environment}</td><td>{t.backup_reference}</td><td><StatusBadge status={t.result}/></td><td>{t.notes||"-"}</td></tr>)}</tbody></table></div>}</section></div>}
diff --git a/src/pages/BarcodeLabels.jsx b/src/pages/BarcodeLabels.jsx
new file mode 100644
index 0000000..c243699
--- /dev/null
+++ b/src/pages/BarcodeLabels.jsx
@@ -0,0 +1,8 @@
+import { useEffect, useMemo, useRef, useState } from "react";
+import JsBarcode from "jsbarcode";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+
+function BarcodeSvg({ value }){const ref=useRef(null);useEffect(()=>{if(ref.current&&value)JsBarcode(ref.current,value,{format:"CODE128",displayValue:true,fontSize:12,height:42,margin:4,width:1.6})},[value]);return <svg ref={ref}/>}
+export default function BarcodeLabels(){const{products}=useShop();const[id,setId]=useState("");const[copies,setCopies]=useState(1);const[query,setQuery]=useState("");const selected=products.find((p)=>p.id===id);const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return products.filter((p)=>p.active&&(!q||[p.name,p.brand,p.barcode,p.sku].some((v)=>String(v||"").toLowerCase().includes(q)))).slice(0,50)},[products,query]);
+return <div><PageHeader title="Barcode Label Printing" subtitle="Generate CODE128 labels for product shelves/bottles; test final size on your real label printer." actions={<button className="primary-button no-print" disabled={!selected} onClick={()=>window.print()}>Print Labels</button>}/><div className="settings-grid no-print"><section className="panel"><label>Search<input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Product, SKU or barcode"/></label><label>Product<select value={id} onChange={(e)=>setId(e.target.value)}><option value="">Select product</option>{filtered.map((p)=><option key={p.id} value={p.id}>{p.name} · {p.barcode}</option>)}</select></label><label>Copies<input type="number" min="1" max="100" value={copies} onChange={(e)=>setCopies(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></label></section><section className="panel"><h3>Printer note</h3><p>Browser printing is used intentionally. Choose your installed barcode/label printer in the system print dialog and calibrate paper size once.</p></section></div>{selected?<div className="barcode-label-sheet">{Array.from({length:copies}).map((_,i)=><div className="barcode-label" key={i}><strong>{selected.name}</strong><span>{selected.size}</span><BarcodeSvg value={selected.barcode}/><small>{selected.sku}</small></div>)}</div>:<div className="panel">Select a product to preview its label.</div>}</div>}
diff --git a/src/pages/Compliance.jsx b/src/pages/Compliance.jsx
new file mode 100644
index 0000000..23e2f45
--- /dev/null
+++ b/src/pages/Compliance.jsx
@@ -0,0 +1,13 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+
+export default function Compliance(){
+  const [form,setForm]=useState({stateCode:"",stateName:"",licenseType:"",licenseNumber:"",validFrom:"",validTo:"",exciseRegistration:"",notes:""});
+  const [exists,setExists]=useState(false);const[msg,setMsg]=useState("");const[busy,setBusy]=useState(false);
+  async function load(){const{data,error}=await supabase.from("compliance_profiles").select("*").maybeSingle();if(error){setMsg("Unable to load compliance configuration.");return}if(data){setExists(true);setForm({stateCode:data.state_code||"",stateName:data.state_name||"",licenseType:data.license_type||"",licenseNumber:data.license_number||"",validFrom:data.license_valid_from||"",validTo:data.license_valid_to||"",exciseRegistration:data.excise_registration_number||"",notes:data.notes||""})}}
+  useEffect(()=>{load()},[]);
+  async function save(e){e.preventDefault();setBusy(true);const{error}=await supabase.rpc("upsert_compliance_profile",{p_state_code:form.stateCode||null,p_state_name:form.stateName||null,p_license_number:form.licenseNumber||null,p_license_type:form.licenseType||null,p_license_valid_from:form.validFrom||null,p_license_valid_to:form.validTo||null,p_excise_registration_number:form.exciseRegistration||null,p_notes:form.notes||null});setMsg(error?"Unable to save compliance configuration.":"Compliance profile saved. No legal report is enabled until its verified state specification is implemented.");if(!error)setExists(true);setBusy(false)}
+  return <div><PageHeader title="Liquor Compliance Foundation" subtitle="Store verified state/license metadata without inventing excise or tax rules."/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={save}><h3>{exists?"Compliance Profile":"Create Compliance Profile"}</h3><div className="settings-fields"><label>State Code<input value={form.stateCode} onChange={(e)=>setForm({...form,stateCode:e.target.value})} placeholder="MH"/></label><label>State Name<input required value={form.stateName} onChange={(e)=>setForm({...form,stateName:e.target.value})} placeholder="Maharashtra"/></label><label>License Type<input required value={form.licenseType} onChange={(e)=>setForm({...form,licenseType:e.target.value})}/></label><label>License Number<input required value={form.licenseNumber} onChange={(e)=>setForm({...form,licenseNumber:e.target.value})}/></label><label>Valid From<input type="date" value={form.validFrom} onChange={(e)=>setForm({...form,validFrom:e.target.value})}/></label><label>Valid To<input type="date" value={form.validTo} onChange={(e)=>setForm({...form,validTo:e.target.value})}/></label><label>Excise Registration Number<input value={form.exciseRegistration} onChange={(e)=>setForm({...form,exciseRegistration:e.target.value})}/></label><label>Notes<textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label></div><br/><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Configuration"}</button></form><section className="panel"><h3>Compliance Safety Rule</h3><p>WineShopPOS does not currently claim any generic report is legally excise-compliant.</p><p>State-specific registers, fields and calculations must be added only from verified requirements supplied for the licensed shop.</p><EmptyState title="No invented legal rules" message="This foundation is intentionally configuration-only until a verified state/report specification is provided."/></section></div></div>
+}
diff --git a/src/pages/CustomerCredit.jsx b/src/pages/CustomerCredit.jsx
new file mode 100644
index 0000000..8cb08f4
--- /dev/null
+++ b/src/pages/CustomerCredit.jsx
@@ -0,0 +1,11 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import FeatureTierBadge from "../components/ui/FeatureTierBadge";
+import EmptyState from "../components/ui/EmptyState";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
+export default function CustomerCredit(){const[balances,setBalances]=useState([]);const[message,setMessage]=useState("");const[customer,setCustomer]=useState({name:"",mobile:"",email:""});const[entry,setEntry]=useState({customerId:"",type:"CHARGE",amount:"",reference:"",description:""});
+async function load(){const{data,error}=await supabase.rpc("customer_balances");if(error)setMessage("Unable to load customer balances.");else setBalances(data||[])}useEffect(()=>{load()},[]);
+async function addCustomer(e){e.preventDefault();const{data,error}=await supabase.rpc("create_customer",{p_full_name:customer.name,p_mobile:customer.mobile||null,p_email:customer.email||null,p_notes:null});if(error)setMessage("Unable to add customer. Mobile number may already exist.");else{setMessage("Customer created.");setCustomer({name:"",mobile:"",email:""});setEntry({...entry,customerId:data});load()}}
+async function postEntry(e){e.preventDefault();const{error}=await supabase.rpc("record_customer_credit",{p_customer_id:entry.customerId,p_entry_type:entry.type,p_amount:Number(entry.amount),p_sale_id:null,p_reference:entry.reference||null,p_description:entry.description||null});setMessage(error?"Unable to record customer credit entry.":"Customer credit ledger updated.");if(!error){setEntry({...entry,amount:"",reference:"",description:""});load()}}
+return <div><PageHeader title="Customer & Credit" tier="PLUS" subtitle="Optional customer records and Udhaar ledger without slowing normal barcode billing."/>{message?<div className="purchase-message">{message}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={addCustomer}><h3>New Customer <FeatureTierBadge tier="PLUS"/></h3><div className="settings-fields"><label>Name<input required value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})}/></label><label>Mobile<input value={customer.mobile} onChange={(e)=>setCustomer({...customer,mobile:e.target.value})}/></label><label>Email<input type="email" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})}/></label></div><br/><button className="primary-button">Add Customer</button></form><form className="panel" onSubmit={postEntry}><h3>Credit / Payment Entry</h3><div className="settings-fields"><label>Customer<select required value={entry.customerId} onChange={(e)=>setEntry({...entry,customerId:e.target.value})}><option value="">Select customer</option>{balances.map((c)=><option key={c.customer_id} value={c.customer_id}>{c.full_name} · {money.format(c.outstanding)}</option>)}</select></label><label>Entry Type<select value={entry.type} onChange={(e)=>setEntry({...entry,type:e.target.value})}><option value="CHARGE">Udhaar / Charge</option><option value="PAYMENT">Payment Received</option><option value="ADJUSTMENT_DEBIT">Debit Adjustment</option><option value="ADJUSTMENT_CREDIT">Credit Adjustment</option></select></label><label>Amount<input type="number" min="0.01" step="0.01" required value={entry.amount} onChange={(e)=>setEntry({...entry,amount:e.target.value})}/></label><label>Reference<input value={entry.reference} onChange={(e)=>setEntry({...entry,reference:e.target.value})}/></label><label>Description<input value={entry.description} onChange={(e)=>setEntry({...entry,description:e.target.value})}/></label></div><br/><button className="primary-button">Record Entry</button></form></div><section className="panel" style={{marginTop:16}}><h3>Customer Outstanding</h3>{balances.length===0?<EmptyState title="No customer credit records" message="Customer capture remains optional during normal billing."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Charges</th><th>Payments</th><th>Outstanding</th></tr></thead><tbody>{balances.map((c)=><tr key={c.customer_id}><td>{c.full_name}</td><td>{c.mobile||"-"}</td><td>{money.format(c.total_charges)}</td><td>{money.format(c.total_payments)}</td><td><strong>{money.format(c.outstanding)}</strong></td></tr>)}</tbody></table></div>}</section></div>}
diff --git a/src/pages/Expenses.jsx b/src/pages/Expenses.jsx
new file mode 100644
index 0000000..ae42745
--- /dev/null
+++ b/src/pages/Expenses.jsx
@@ -0,0 +1,20 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+import StatusBadge from "../components/ui/StatusBadge";
+
+const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 });
+export default function Expenses() {
+  const [categories,setCategories]=useState([]); const [rows,setRows]=useState([]); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
+  const [form,setForm]=useState({categoryId:"",date:new Date().toISOString().slice(0,10),amount:"",description:"",method:"CASH",reference:""});
+  async function load(){const[c,e]=await Promise.all([supabase.from("expense_categories").select("id,name,active").eq("active",true).order("name"),supabase.from("expenses").select("id,expense_date,amount,description,payment_method,reference_number,status,created_at,expense_categories(name)").order("expense_date",{ascending:false}).limit(300)]);if(c.error||e.error)setMessage("Unable to load expense data.");else{setCategories(c.data||[]);setRows(e.data||[])}}
+  useEffect(()=>{load()},[]);
+  const monthTotal=useMemo(()=>{const month=new Date().toISOString().slice(0,7);return rows.filter((r)=>r.status==="ACTIVE"&&String(r.expense_date).startsWith(month)).reduce((s,r)=>s+Number(r.amount||0),0)},[rows]);
+  async function submit(event){event.preventDefault();setBusy(true);const{error}=await supabase.rpc("record_expense",{p_category_id:form.categoryId,p_expense_date:form.date,p_amount:Number(form.amount),p_description:form.description,p_payment_method:form.method,p_reference:form.reference||null});setMessage(error?"Unable to record expense. Check the fields and retry.":"Expense recorded.");if(!error){setForm({...form,amount:"",description:"",reference:""});await load()}setBusy(false)}
+  async function voidRow(id){const reason=window.prompt("Reason for voiding this expense");if(!reason)return;const{error}=await supabase.rpc("void_expense",{p_expense_id:id,p_reason:reason});setMessage(error?"Unable to void expense.":"Expense voided and retained in audit history.");if(!error)load()}
+  return <div><PageHeader title="Expense Management" subtitle="Track operating expenses so Owner Center can calculate operating profit."/>{message?<div className="purchase-message">{message}</div>:null}
+    <div className="settings-grid"><form className="panel" onSubmit={submit}><h3>Record Expense</h3><div className="settings-fields"><label>Date<input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required/></label><label>Category<select value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})} required><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} required/></label><label>Payment Method<select value={form.method} onChange={(e)=>setForm({...form,method:e.target.value})}>{["CASH","UPI","CARD","BANK_TRANSFER","CHEQUE","OTHER"].map((x)=><option key={x}>{x}</option>)}</select></label><label>Description<input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required/></label><label>Reference<input value={form.reference} onChange={(e)=>setForm({...form,reference:e.target.value})}/></label></div><br/><button className="primary-button" disabled={busy}>{busy?"Saving...":"Record Expense"}</button></form><section className="panel"><h3>This Month</h3><div className="big-number">{money.format(monthTotal)}</div><p className="muted-text">Active expenses for the current calendar month.</p></section></div>
+    <section className="panel" style={{marginTop:16}}><h3>Expense History</h3>{rows.length===0?<EmptyState title="No expenses recorded yet" message="Record rent, salaries, electricity, transport, maintenance or other operating expenses."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.expense_date}</td><td>{r.expense_categories?.name||"-"}</td><td>{r.description}</td><td>{r.payment_method}</td><td>{money.format(r.amount)}</td><td><StatusBadge status={r.status}/></td><td>{r.status==="ACTIVE"?<button className="secondary-button" onClick={()=>voidRow(r.id)}>Void</button>:null}</td></tr>)}</tbody></table></div>}</section>
+  </div>;
+}
diff --git a/src/pages/HardwareSetup.jsx b/src/pages/HardwareSetup.jsx
new file mode 100644
index 0000000..7ac217c
--- /dev/null
+++ b/src/pages/HardwareSetup.jsx
@@ -0,0 +1,12 @@
+import { Link } from "react-router-dom";
+import { Printer, ScanBarcode, Tags } from "lucide-react";
+import PageHeader from "../components/ui/PageHeader";
+export default function HardwareSetup() {
+  return <div><PageHeader title="Hardware & Device Setup" subtitle="Keep scanner and printer setup in one predictable place."/>
+    <div className="capability-grid">
+      <Link className="capability-card" to="/admin/hardware/scanner"><ScanBarcode/><div><strong>Barcode Scanner</strong><span>Detection speed, global listener and beep tests.</span></div></Link>
+      <Link className="capability-card" to="/admin/hardware/printer"><Printer/><div><strong>Receipt Printer</strong><span>58/80mm receipt settings and print test.</span></div></Link>
+      <Link className="capability-card" to="/products/labels"><Tags/><div><strong>Barcode Labels</strong><span>Generate and print product barcode labels.</span></div></Link>
+    </div>
+  </div>;
+}
diff --git a/src/pages/InventoryIntelligence.jsx b/src/pages/InventoryIntelligence.jsx
new file mode 100644
index 0000000..2fb9d67
--- /dev/null
+++ b/src/pages/InventoryIntelligence.jsx
@@ -0,0 +1,27 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import StatusBadge from "../components/ui/StatusBadge";
+import EmptyState from "../components/ui/EmptyState";
+import { DonutChartCard, HorizontalBarChartCard } from "../components/charts/BusinessCharts";
+
+const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
+export default function InventoryIntelligence() {
+  const { products, suppliers } = useShop();
+  const [health, setHealth] = useState([]); const [explain, setExplain] = useState([]); const [productId, setProductId] = useState(""); const [supplierId, setSupplierId] = useState(""); const [message, setMessage] = useState("");
+  async function load(){const {data,error}=await supabase.rpc("inventory_health",{p_history_days:30,p_dead_days:45});if(error)setMessage("Unable to load inventory intelligence.");else setHealth(data||[])}
+  useEffect(()=>{load()},[]);
+  async function explainProduct(id){setProductId(id);setExplain([]);if(!id)return;const{data,error}=await supabase.rpc("stock_explanation",{p_product_id:id,p_days:365});if(error)setMessage("Unable to explain stock movement.");else setExplain(data||[])}
+  async function createPO(row){if(!supplierId)return setMessage("Select a supplier before creating a purchase order.");const product=products.find((p)=>p.id===row.product_id);if(!product)return;const qty=Math.max(product.unitsPerCase||1,Number(row.current_stock<=0?product.unitsPerCase:Math.ceil((Number(row.avg_daily||0)*14-Number(row.current_stock||0))/(product.unitsPerCase||1))*(product.unitsPerCase||1)));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:[{product_id:row.product_id,quantity:qty,purchase_price:product.purchasePrice}],p_expected_date:null,p_notes:"Created from Inventory Intelligence"});setMessage(error?"Unable to create purchase order.":`Draft purchase order created for ${qty} bottle(s).`)}
+  const selected=useMemo(()=>products.find((p)=>p.id===productId),[products,productId]);
+  const counts=useMemo(()=>health.reduce((a,r)=>({...a,[r.classification]:(a[r.classification]||0)+1}),{}),[health]);
+  const healthChart=useMemo(()=>Object.entries(counts).map(([label,value])=>({label:label.replaceAll("_"," "),value})),[counts]);
+  const riskChart=useMemo(()=>health.filter((r)=>["STOCKOUT_RISK","OUT_OF_STOCK"].includes(r.classification)).sort((a,b)=>Number(a.days_remaining??999)-Number(b.days_remaining??999)).slice(0,7).map((r)=>({label:r.product_name,value:Number(r.current_stock||0)})),[health]);
+  return <div><PageHeader title="Inventory Intelligence" subtitle="Explain stock, detect health risks and convert reorder needs into purchase orders." tier="PRO"/>{message?<div className="purchase-message">{message}</div>:null}
+    <div className="metric-grid four"><div className="metric-card metric-accent-orange"><span>Stockout Risk</span><strong>{counts.STOCKOUT_RISK||0}</strong></div><div className="metric-card metric-accent-indigo"><span>Dead Stock</span><strong>{counts.DEAD||0}</strong></div><div className="metric-card metric-accent-blue"><span>Overstock</span><strong>{counts.OVERSTOCK||0}</strong></div><div className="metric-card metric-accent-red"><span>Out of Stock</span><strong>{counts.OUT_OF_STOCK||0}</strong></div></div>
+    <div className="dashboard-chart-grid" style={{marginTop:16}}><DonutChartCard title="Inventory Health Mix" subtitle="Product count by current health classification" data={healthChart} centerLabel="SKUs"/><HorizontalBarChartCard title="Immediate Stock Risk" subtitle="Current bottles for products closest to stockout" data={riskChart}/></div>
+    <section className="panel" style={{marginTop:16}}><div className="section-row"><div><h3>Inventory Health</h3><p className="muted-text">30-day sales velocity with 45-day dead-stock threshold.</p></div><label>Supplier for PO<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label></div>{health.length===0?<EmptyState title="No inventory health data" message="Products and sales history are required."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Product</th><th>Stock</th><th>30d Sales</th><th>Avg/Day</th><th>Days Left</th><th>Inventory Cost</th><th>Health</th><th></th></tr></thead><tbody>{health.map((r)=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.current_stock}</td><td>{r.units_sold}</td><td>{r.avg_daily}</td><td>{r.days_remaining??"-"}</td><td>{money.format(r.inventory_cost)}</td><td><StatusBadge status={r.classification}/></td><td>{["STOCKOUT_RISK","OUT_OF_STOCK"].includes(r.classification)?<button className="secondary-button" onClick={()=>createPO(r)}>Create PO</button>:null}</td></tr>)}</tbody></table></div>}</section>
+    <section className="panel" style={{marginTop:16}}><h3>Explain My Stock</h3><label>Product<select value={productId} onChange={(e)=>explainProduct(e.target.value)}><option value="">Select product</option>{products.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{selected?<><h4 style={{marginTop:14}}>{selected.name}</h4><div className="movement-breakdown">{explain.map((r)=><div className="movement-chip" key={r.movement_type}><span>{r.movement_type.replaceAll("_"," ")}</span><strong>{Number(r.quantity_change)>0?"+":""}{r.quantity_change}</strong><small>{r.event_count} event(s)</small></div>)}</div></>:null}</section>
+  </div>;
+}
diff --git a/src/pages/OwnerCenter.jsx b/src/pages/OwnerCenter.jsx
new file mode 100644
index 0000000..6e3281e
--- /dev/null
+++ b/src/pages/OwnerCenter.jsx
@@ -0,0 +1,77 @@
+import { useEffect, useMemo, useState } from "react";
+import { Link } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import { DonutChartCard, HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";
+
+const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 });
+const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
+
+export default function OwnerCenter() {
+  const { profile } = useAuth();
+  const { sales, products } = useShop();
+  const [summary,setSummary]=useState({});
+  const [recommendations,setRecommendations]=useState([]);
+  const [exceptions,setExceptions]=useState([]);
+  const [message,setMessage]=useState("");
+
+  async function load(){
+    const[s,r,e]=await Promise.all([
+      supabase.rpc("owner_center_summary",{}),
+      supabase.rpc("owner_recommendations",{p_history_days:30}),
+      supabase.rpc("loss_control_exceptions",{p_days:30}),
+    ]);
+    if(s.error||r.error||e.error)setMessage("Unable to load all Owner Center insights.");
+    setSummary(s.data||{});setRecommendations(r.data||[]);setExceptions(e.data||[]);
+  }
+  useEffect(()=>{load()},[]);
+
+  const chartData = useMemo(() => {
+    const start = new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0);
+    const recent = sales.filter((sale)=>sale.status!=="VOID" && new Date(sale.createdAt)>=start);
+    const dayMap = new Map();
+    for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()+i);dayMap.set(d.toISOString().slice(0,10),0);}
+    const pay = { CASH:0, UPI:0, CARD:0 };
+    const productMap = new Map();
+    recent.forEach((sale)=>{
+      const key=sale.createdAt?.slice(0,10); if(dayMap.has(key)) dayMap.set(key,(dayMap.get(key)||0)+Number(sale.grandTotal||0));
+      const method=String(sale.paymentMethod||"OTHER").toUpperCase(); pay[method]=(pay[method]||0)+Number(sale.grandTotal||0);
+      (sale.items||[]).forEach((item)=>{const current=productMap.get(item.productId)||{label:item.productName||"Product",value:0};current.value+=Number(item.lineTotal||0);productMap.set(item.productId,current);});
+    });
+    return {
+      trend:[...dayMap.entries()].map(([date,value])=>({label:dayLabel(date),value})),
+      payments:Object.entries(pay).filter(([,value])=>value>0).map(([label,value])=>({label,value})),
+      topProducts:[...productMap.values()].sort((a,b)=>b.value-a.value).slice(0,7),
+      activeProducts:products.filter((p)=>p.active).length,
+    };
+  },[sales,products]);
+
+  return <div className="dashboard-page">
+    <PageHeader title="Owner Control Center" subtitle={`What happened, what needs attention and what to do next · ${profile?.shop_name||"Current Shop"}`} tier="PRO"/>
+    {message?<div className="purchase-message">{message}</div>:null}
+
+    <div className="metric-grid four executive-metrics">
+      <div className="metric-card metric-accent-blue"><span>Revenue · 30 Days</span><strong>{money.format(summary.revenue||0)}</strong><small>{summary.bills||0} bills</small></div>
+      <div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(summary.gross_profit||0)}</strong><small>After cost of goods</small></div>
+      <div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(summary.operating_profit||0)}</strong><small>After expenses</small></div>
+      <div className="metric-card metric-accent-orange"><span>Inventory Cost</span><strong>{money.format(summary.inventory_cost||0)}</strong><small>{chartData.activeProducts} active products</small></div>
+    </div>
+
+    <div className="dashboard-chart-grid primary" style={{marginTop:16}}>
+      <LineChartCard title="30-Day Sales Trend" subtitle="Daily completed sales value" data={chartData.trend} formatValue={(v)=>money.format(v)}/>
+      <DonutChartCard title="Payment Mix" subtitle="Cash, UPI and Card share" data={chartData.payments} formatValue={(v)=>money.format(v)} centerLabel="Sales"/>
+    </div>
+    <div className="dashboard-chart-grid" style={{marginTop:16}}>
+      <HorizontalBarChartCard title="Top Products by Sales" subtitle="Highest product sales value in the current 30-day window" data={chartData.topProducts} formatValue={(v)=>money.format(v)}/>
+      <section className="chart-card attention-card"><div className="chart-heading"><div><h3>Business Attention</h3><p>Live owner-level operating signals</p></div></div><div className="attention-metrics"><div><span>Expenses</span><strong>{money.format(summary.expenses||0)}</strong></div><div><span>Low Stock</span><strong>{summary.low_stock_count||0}</strong></div><div><span>Cash Variance</span><strong>{money.format(summary.cash_variance||0)}</strong></div><div><span>Requires Review</span><strong>{exceptions.length}</strong></div></div></section>
+    </div>
+
+    <div className="settings-grid" style={{marginTop:16}}>
+      <section className="panel"><div className="section-row"><h3>What Should I Do Next?</h3><Link to="/owner/recommendations">View all</Link></div>{recommendations.slice(0,6).map((r,i)=><Link to={r.action_path||"/owner"} className="recommendation-row" key={`${r.recommendation_type}-${i}`}><div><strong>{r.title}</strong><p>{r.message}</p></div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span></Link>)}</section>
+      <section className="panel"><div className="section-row"><h3>Requires Review</h3><Link to="/owner/exceptions">Open Loss & Exceptions</Link></div>{exceptions.slice(0,6).map((r,i)=><div className="recommendation-row" key={`${r.entity_id}-${i}`}><div><strong>{r.exception_type.replaceAll("_"," ")}</strong><p>{r.summary}</p></div><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></div>)}</section>
+    </div>
+    <div className="quick-action-grid"><Link className="quick-action" to="/owner/profit"><strong>Profit Intelligence</strong><span>Revenue → COGS → expenses → operating profit</span></Link><Link className="quick-action" to="/inventory/intelligence"><strong>Inventory Health</strong><span>Dead stock, stockout risk and reordering</span></Link><Link className="quick-action" to="/purchasing/intelligence"><strong>Purchase Intelligence</strong><span>OCR, supplier pricing and margin impact</span></Link><Link className="quick-action" to="/owner/share"><strong>Share with Owner</strong><span>Prepare a WhatsApp operating summary</span></Link></div>
+  </div>;
+}
diff --git a/src/pages/OwnerExceptions.jsx b/src/pages/OwnerExceptions.jsx
new file mode 100644
index 0000000..ee4abe0
--- /dev/null
+++ b/src/pages/OwnerExceptions.jsx
@@ -0,0 +1,7 @@
+import { useEffect, useState } from "react";
+import { Link } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
+export default function OwnerExceptions(){const[rows,setRows]=useState([]);const[days,setDays]=useState(30);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("loss_control_exceptions",{p_days:Number(days)});if(error)setMsg("Unable to load exceptions.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Audit & Loss Control" subtitle="Neutral, rule-based exception detection. Items are flagged for review, not accusations." tier="PRO"/><div className="panel filter-bar"><label>Lookback<select value={days} onChange={(e)=>setDays(e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel" style={{marginTop:16}}><h3>Requires Review</h3>{rows.length===0?<EmptyState title="No unusual activity found" message="No configured rule exceeded its review threshold in this period."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Severity</th><th>Type</th><th>When</th><th>Summary</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.entity_id}-${i}`}><td><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></td><td>{r.exception_type.replaceAll("_"," ")}</td><td>{new Date(r.event_time).toLocaleString("en-IN")}</td><td>{r.summary}</td><td>{money.format(r.amount||0)}</td><td><Link to={r.action_path||"/owner"}>Review</Link></td></tr>)}</tbody></table></div>}</section></div>}
diff --git a/src/pages/OwnerProfit.jsx b/src/pages/OwnerProfit.jsx
new file mode 100644
index 0000000..dce66bc
--- /dev/null
+++ b/src/pages/OwnerProfit.jsx
@@ -0,0 +1,27 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+import { ColumnChartCard, HorizontalBarChartCard } from "../components/charts/BusinessCharts";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
+export default function OwnerProfit(){
+  const now=new Date();
+  const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));
+  const[to,setTo]=useState(now.toISOString().slice(0,10));
+  const[s,setS]=useState({});const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");
+  async function load(){const[a,b]=await Promise.all([supabase.rpc("owner_center_summary",{p_from:from,p_to:to}),supabase.rpc("profit_by_product",{p_from:from,p_to:to})]);if(a.error||b.error)setMsg("Unable to calculate profit intelligence.");else{setS(a.data||{});setRows(b.data||[])}}
+  useEffect(()=>{load()},[]);
+  const bridge=useMemo(()=>[
+    {label:"Revenue",value:Number(s.revenue||0)},
+    {label:"COGS",value:Number(s.cogs||0)},
+    {label:"Gross Profit",value:Number(s.gross_profit||0)},
+    {label:"Expenses",value:Number(s.expenses||0)},
+    {label:"Operating",value:Number(s.operating_profit||0)},
+  ],[s]);
+  const topProfit=useMemo(()=>rows.slice().sort((a,b)=>Number(b.gross_profit||0)-Number(a.gross_profit||0)).slice(0,7).map(r=>({label:r.product_name,value:Number(r.gross_profit||0)})),[rows]);
+  return <div><PageHeader title="Profit & Business Intelligence" subtitle="Revenue − COGS = gross profit; gross profit − operating expenses = operating profit." tier="PRO"/>
+    <div className="panel filter-bar"><label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}
+    <div className="metric-grid four" style={{marginTop:16}}><div className="metric-card metric-accent-blue"><span>Revenue</span><strong>{money.format(s.revenue||0)}</strong></div><div className="metric-card metric-accent-orange"><span>COGS</span><strong>{money.format(s.cogs||0)}</strong></div><div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(s.gross_profit||0)}</strong></div><div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(s.operating_profit||0)}</strong></div></div>
+    <div className="dashboard-chart-grid" style={{marginTop:16}}><ColumnChartCard title="Profit Bridge" subtitle="Power BI-style financial comparison for the selected period" data={bridge} formatValue={(v)=>money.format(v)}/><HorizontalBarChartCard title="Top SKU Gross Profit" subtitle="Highest gross profit contribution" data={topProfit} formatValue={(v)=>money.format(v)}/></div>
+    <section className="panel" style={{marginTop:16}}><h3>SKU Profitability</h3>{rows.length===0?<EmptyState title="No profitability data" message="Completed sales with cost snapshots are required."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Revenue</th><th>COGS</th><th>Gross Profit</th><th>Margin</th></tr></thead><tbody>{rows.map(r=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.quantity}</td><td>{money.format(r.revenue)}</td><td>{money.format(r.cogs)}</td><td><strong>{money.format(r.gross_profit)}</strong></td><td>{Number(r.margin_pct||0).toFixed(2)}%</td></tr>)}</tbody></table></div>}</section><p className="muted-text">Historical sales created before cost snapshots were introduced may have incomplete COGS. This screen reports only what trusted stored data supports.</p></div>;
+}
diff --git a/src/pages/OwnerWhatsApp.jsx b/src/pages/OwnerWhatsApp.jsx
new file mode 100644
index 0000000..a2ea616
--- /dev/null
+++ b/src/pages/OwnerWhatsApp.jsx
@@ -0,0 +1,6 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+import PageHeader from "../components/ui/PageHeader";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
+export default function OwnerWhatsApp(){const{profile}=useAuth();const[s,setS]=useState({});const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("owner_center_summary",{});if(error)setMsg("Unable to generate summary.");else setS(data||{})}useEffect(()=>{load()},[]);const text=useMemo(()=>[`WineShopPOS — Business Summary`,`Shop: ${profile?.shop_name||"Current Shop"}`,`Period: ${s.from||""} to ${s.to||""}`,`Revenue: ${money.format(s.revenue||0)}`,`Bills: ${s.bills||0}`,`Gross Profit: ${money.format(s.gross_profit||0)}`,`Expenses: ${money.format(s.expenses||0)}`,`Operating Profit: ${money.format(s.operating_profit||0)}`,`Returns: ${money.format(s.returns||0)}`,`Cash Variance: ${money.format(s.cash_variance||0)}`,`Low Stock SKUs: ${s.low_stock_count||0}`].join("\n"),[s,profile]);function share(){window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer")}return <div><PageHeader title="Owner WhatsApp Summary" subtitle="Generate a pre-written operating summary. Nothing is sent automatically." tier="PLUS"/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><section className="panel"><h3>Preview</h3><pre className="share-preview">{text}</pre><button className="primary-button" onClick={share}>Share with Owner</button></section><section className="panel"><h3>Privacy & Sending</h3><p>WineShopPOS does not call a WhatsApp API, does not send background alerts and does not schedule messages.</p><p>Your device opens WhatsApp or WhatsApp Web with this text. The user chooses the recipient and manually sends it.</p></section></div></div>}
diff --git a/src/pages/POS.jsx b/src/pages/POS.jsx
index 13b6285..f3aae4b 100644
--- a/src/pages/POS.jsx
+++ b/src/pages/POS.jsx
@@ -2,17 +2,18 @@ import { useEffect, useMemo, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { useShop } from "../context/ShopContext";
 import { useScanner } from "../context/ScannerContext";
-
+import { supabase } from "../lib/supabase";
 const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
-export default function POS(){const{products,getStock,completeSale}=useShop();const{lastScan,successBeep,errorBeep}=useScanner();const navigate=useNavigate();const[search,setSearch]=useState("");const[cart,setCart]=useState([]);const[paymentMethod,setPaymentMethod]=useState("CASH");const[paymentReference,setPaymentReference]=useState("");const[discount,setDiscount]=useState(0);const[message,setMessage]=useState("Scanner ready");const[unknown,setUnknown]=useState("");const[busy,setBusy]=useState(false);
-const active=products.filter((p)=>p.active);const results=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return active.filter((p)=>[p.name,p.brand,p.sku,p.barcode].some((v)=>String(v).toLowerCase().includes(q))).slice(0,8)},[search,active]);
-function qty(id){return cart.find((i)=>i.product.id===id)?.quantity||0}function add(p){const stock=getStock(p.id);if(qty(p.id)>=stock){errorBeep();setMessage(`Only ${stock} unit(s) available for ${p.name}.`);return false}setCart((c)=>{const x=c.find((i)=>i.product.id===p.id);return x?c.map((i)=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{product:p,quantity:1}]});setUnknown("");setMessage(`${p.name} added.`);successBeep();return true}
-function processBarcode(code){const p=active.find((x)=>x.barcode===code);if(!p){errorBeep();setUnknown(code);setMessage(`PRODUCT NOT FOUND: ${code}`);return}add(p)}
+export default function POS(){const{products,getStock,completeSale}=useShop();const{lastScan,successBeep,errorBeep}=useScanner();const navigate=useNavigate();const[search,setSearch]=useState("");const[cart,setCart]=useState([]);const[paymentMethod,setPaymentMethod]=useState("CASH");const[paymentReference,setPaymentReference]=useState("");const[discount,setDiscount]=useState(0);const[message,setMessage]=useState("Scanner ready");const[unknown,setUnknown]=useState("");const[busy,setBusy]=useState(false);const[customers,setCustomers]=useState([]);const[customerId,setCustomerId]=useState("");
+const active=products.filter(p=>p.active);const results=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return active.filter(p=>[p.name,p.brand,p.sku,p.barcode].some(v=>String(v).toLowerCase().includes(q))).slice(0,8)},[search,active]);
+useEffect(()=>{if(navigator.onLine)supabase.from("customers").select("id,full_name,mobile").eq("active",true).order("full_name").limit(200).then(({data})=>setCustomers(data||[]))},[]);
+function qty(id){return cart.find(i=>i.product.id===id)?.quantity||0}function add(p){const stock=getStock(p.id);if(qty(p.id)>=stock){errorBeep();setMessage(`Only ${stock} unit(s) available for ${p.name}.`);return false}setCart(c=>{const x=c.find(i=>i.product.id===p.id);return x?c.map(i=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{product:p,quantity:1}]});setUnknown("");setMessage(`${p.name} added.`);successBeep();return true}
+function processBarcode(code){const p=active.find(x=>x.barcode===code);if(!p){errorBeep();setUnknown(code);setMessage(`PRODUCT NOT FOUND: ${code}`);return}add(p)}
 useEffect(()=>{if(lastScan?.barcode)processBarcode(lastScan.barcode)},[lastScan?.id]);
-function change(id,d){const i=cart.find((x)=>x.product.id===id);if(!i)return;const next=i.quantity+d;if(next<=0)return setCart((c)=>c.filter((x)=>x.product.id!==id));if(next>getStock(id)){errorBeep();return setMessage(`Only ${getStock(id)} unit(s) available.`)}setCart((c)=>c.map((x)=>x.product.id===id?{...x,quantity:next}:x))}
+function change(id,d){const i=cart.find(x=>x.product.id===id);if(!i)return;const next=i.quantity+d;if(next<=0)return setCart(c=>c.filter(x=>x.product.id!==id));if(next>getStock(id)){errorBeep();return setMessage(`Only ${getStock(id)} unit(s) available.`)}setCart(c=>c.map(x=>x.product.id===id?{...x,quantity:next}:x))}
 const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0);const disc=Math.max(0,Number(discount||0));const total=Math.max(0,subtotal-disc);
-async function checkout(){setBusy(true);const r=await completeSale(cart,paymentMethod,{discount:disc,paymentReference});setBusy(false);if(!r.ok){errorBeep();setMessage(r.message);return}successBeep();setCart([]);setDiscount(0);setPaymentReference("");if(r.offline){setMessage(r.message);return}navigate(`/sales/${r.sale.id}`)}
-return <div><div className="page-heading"><div><h2>POS Billing</h2><p>Global HID scanner active — scan from anywhere on this page.</p></div><button className="secondary-button" onClick={()=>navigate("/scanner-settings")}>Scanner Test</button></div>
-{unknown&&<div className="product-not-found"><strong>PRODUCT NOT FOUND</strong><span>{unknown}</span><button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button></div>}
-<div className="pos-layout"><div className="pos-left"><div className="panel"><label>Manual Search<input style={{width:"100%"}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>{results.map((p)=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}<div className="purchase-message" style={{marginTop:10}}>{message}</div></div><div className="panel scanner-commercial-card" style={{marginTop:14}}><strong>Scanner mode</strong><p>Rapid keystrokes + Enter are captured globally. Scanner text is removed from discount/payment fields automatically.</p><p>Test barcode: <code>8900000010016</code></p></div></div>
-<div className="panel"><h3>Cart</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{cart.map((i)=><tr key={i.product.id}><td>{i.product.name}</td><td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td><td>{money.format(i.product.price)}</td><td>{money.format(i.product.price*i.quantity)}</td></tr>)}</tbody></table></div><hr/><p>Subtotal <strong>{money.format(subtotal)}</strong></p><label>Discount<input type="number" min="0" max={subtotal} value={discount} onChange={(e)=>setDiscount(e.target.value)}/></label><h2>Total {money.format(total)}</h2><div className="payment-methods">{["CASH","UPI","CARD"].map((m)=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>{paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)}/></label>}<br/><button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button></div></div></div>}
+async function checkout(){setBusy(true);const r=await completeSale(cart,paymentMethod,{discount:disc,paymentReference});if(!r.ok){setBusy(false);errorBeep();setMessage(r.message);return}if(!r.offline&&customerId){const{error}=await supabase.rpc("link_sale_customer",{p_sale_id:r.sale.id,p_customer_id:customerId});if(error)setMessage("Sale completed, but customer could not be attached. The sale itself is safe.")}
+setBusy(false);successBeep();setCart([]);setDiscount(0);setPaymentReference("");setCustomerId("");if(r.offline){setMessage(r.message);return}navigate(`/sales/${r.sale.id}`)}
+return <div><div className="page-heading"><div><h2>Fast POS Billing</h2><p>Global HID scanner active — scan, collect payment and print.</p></div><button className="secondary-button" onClick={()=>navigate("/pos/scanner")}>Scanner Test</button></div>{unknown&&<div className="product-not-found"><strong>PRODUCT NOT FOUND</strong><span>{unknown}</span><button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button></div>}
+<div className="pos-layout"><div className="pos-left"><div className="panel"><label>Manual Search<input style={{width:"100%"}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>{results.map(p=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}<div className="purchase-message" style={{marginTop:10}}>{message}</div></div><div className="panel scanner-commercial-card" style={{marginTop:14}}><strong>Scanner Ready</strong><p>Rapid keystrokes + Enter are captured globally. Scanner text is restored out of discount/payment fields.</p><p>Test barcode: <code>8900000010016</code></p></div></div>
+<div className="panel"><h3>Cart</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{cart.map(i=><tr key={i.product.id}><td>{i.product.name}</td><td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td><td>{money.format(i.product.price)}</td><td>{money.format(i.product.price*i.quantity)}</td></tr>)}</tbody></table></div><hr/><label>Customer (optional)<select value={customerId} onChange={e=>setCustomerId(e.target.value)} disabled={!navigator.onLine}><option value="">Walk-in customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.full_name}{c.mobile?` · ${c.mobile}`:""}</option>)}</select></label><p>Subtotal <strong>{money.format(subtotal)}</strong></p><label>Discount<input type="number" min="0" max={subtotal} value={discount} onChange={e=>setDiscount(e.target.value)}/></label><h2>Total {money.format(total)}</h2><div className="payment-methods">{["CASH","UPI","CARD"].map(m=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>{paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={e=>setPaymentReference(e.target.value)}/></label>}<br/><button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button><p className="muted-text">Customer capture is optional. Udhaar/credit entries are managed under Operations → Customer & Credit so the normal cashier flow remains fast.</p></div></div></div>}
diff --git a/src/pages/Procurement.jsx b/src/pages/Procurement.jsx
index 239fc86..f719bed 100644
--- a/src/pages/Procurement.jsx
+++ b/src/pages/Procurement.jsx
@@ -1,20 +1,25 @@
 import { useEffect, useMemo, useState } from "react";
 import { supabase } from "../lib/supabase";
 import { useShop } from "../context/ShopContext";
-
+import FeatureTierBadge from "../components/ui/FeatureTierBadge";
+import PageHeader from "../components/ui/PageHeader";
+import StatusBadge from "../components/ui/StatusBadge";
+import EmptyState from "../components/ui/EmptyState";
 const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
 const line=()=>({productId:"",quantity:12,purchasePrice:0});
-export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");
-async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select(`*,purchase_order_items(*)`).order("created_at",{ascending:false}).limit(100),supabase.rpc("supplier_balances")]);if(po.error)setMessage(po.error.message);else setOrders(po.data||[]);if(b.error)setMessage(b.error.message);else setBalances(b.data||[])}useEffect(()=>{load()},[]);
-function update(i,k,v){setItems((x)=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find((p)=>p.id===v)?.purchasePrice||0}:{})}:r))}
-const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
-async function createPO(e){e.preventDefault();const payload=items.filter((i)=>i.productId&&Number(i.quantity)>0).map((i)=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?error.message:"Purchase order created.");if(!error){setItems([line()]);load()}}
-async function setStatus(id,status){const{error}=await supabase.rpc("set_purchase_order_status",{p_po_id:id,p_status:status});setMessage(error?error.message:`PO ${status.toLowerCase()}.`);if(!error)load()}
-async function receive(po){const inv=prompt("Supplier invoice number");if(!inv)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:po.id,p_invoice_number:inv,p_invoice_date:new Date().toISOString().slice(0,10),p_receive_items:null,p_notes:"Received from PO screen"});setMessage(error?error.message:"PO goods received and inventory updated.");if(!error){await Promise.all([load(),refreshAll()])}}
-async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?error.message:"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
-async function purchaseReturn(){const productId=prompt("Paste/select product UUID to return (use Products screen if needed)");if(!productId)return;const qty=Number(prompt("Quantity to return",1));const p=products.find((x)=>x.id===productId);if(!p)return setMessage("Product UUID not found in this shop.");const sid=prompt("Supplier UUID",supplierId||suppliers[0]?.id||"");if(!sid)return;const reason=prompt("Reason","Damaged/incorrect supply");if(!reason)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:sid,p_items:[{product_id:productId,quantity:qty,purchase_price:p.purchasePrice}],p_reason:reason,p_purchase_id:null});setMessage(error?error.message:"Purchase return completed and stock reduced.");if(!error){await Promise.all([load(),refreshAll()])}}
-return <div><div className="page-heading"><div><h2>Supplier & Purchasing</h2><p>PO → receive → supplier balance → payment → purchase return.</p></div><button className="secondary-button" onClick={purchaseReturn}>Supplier Return</button></div>{message&&<div className="purchase-message">{message}</div>}
-<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order</h3><label>Supplier<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={(e)=>setExpected(e.target.value)}/></label><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={(e)=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" onClick={()=>setItems((x)=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,line()])}>Add Line</button><button className="primary-button">Create PO</button></div></form>
-<form className="panel" onSubmit={pay}><h3>Record Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={(e)=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e)=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={(e)=>setPayment({...payment,method:e.target.value})}><option>BANK_TRANSFER</option><option>UPI</option><option>CASH</option><option>CARD</option><option>CHEQUE</option><option>OTHER</option></select></label><label>Reference<input value={payment.reference} onChange={(e)=>setPayment({...payment,reference:e.target.value})}/></label></div><br/><button className="primary-button">Record Payment</button></form></div>
-<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map((b)=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
-<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Action</th></tr></thead><tbody>{orders.map((o)=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find((s)=>s.id===o.supplier_id)?.supplier_name||o.supplier_id.slice(0,8)}</td><td>{o.status}</td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td>{o.status==="DRAFT"&&<button className="secondary-button" onClick={()=>setStatus(o.id,"SENT")}>Mark Sent</button>} {["DRAFT","SENT","PARTIALLY_RECEIVED"].includes(o.status)&&<button className="primary-button" onClick={()=>receive(o)}>Receive</button>}</td></tr>)}</tbody></table></div></section></div>}
+export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[receive,setReceive]=useState({poId:"",invoice:"",date:new Date().toISOString().slice(0,10)});const[ret,setRet]=useState({supplierId:"",productId:"",qty:1,reason:"Damaged/incorrect supply"});
+async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select("*,purchase_order_items(*)").order("created_at",{ascending:false}).limit(150),supabase.rpc("supplier_balances")]);if(po.error||b.error)setMessage("Unable to load procurement data.");else{setOrders(po.data||[]);setBalances(b.data||[])}}useEffect(()=>{load()},[]);
+function update(i,k,v){setItems(x=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find(p=>p.id===v)?.purchasePrice||0}:{})}:r))}const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
+async function createPO(e){e.preventDefault();const payload=items.filter(i=>i.productId&&Number(i.quantity)>0).map(i=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?"Unable to create purchase order.":"Draft purchase order created.");if(!error){setItems([line()]);await load()}}
+async function rpc(fn,args,ok){const{error}=await supabase.rpc(fn,args);setMessage(error?`Unable to complete ${ok.toLowerCase()}.`:ok);if(!error){await Promise.all([load(),refreshAll()])}}
+async function receivePO(e){e.preventDefault();if(!receive.poId)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:receive.poId,p_invoice_number:receive.invoice,p_invoice_date:receive.date,p_receive_items:null,p_notes:"Received from consolidated Procurement"});setMessage(error?"Unable to receive this purchase order. Check status, invoice number and quantities.":"Goods received; inventory and supplier balance updated transactionally.");if(!error){setReceive({...receive,poId:"",invoice:""});await Promise.all([load(),refreshAll()])}}
+async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?"Unable to record supplier payment.":"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
+async function purchaseReturn(e){e.preventDefault();const p=products.find(x=>x.id===ret.productId);if(!p)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:ret.supplierId,p_items:[{product_id:ret.productId,quantity:Number(ret.qty),purchase_price:p.purchasePrice}],p_reason:ret.reason,p_purchase_id:null});setMessage(error?"Unable to complete supplier return.":"Supplier return completed; stock reduced with movement history.");if(!error){setRet({...ret,productId:"",qty:1});await Promise.all([load(),refreshAll()])}}
+return <div><PageHeader title="Advanced Supplier & Procurement" subtitle="Draft → approval → send → receive → supplier balance/payment → purchase return." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}
+<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order <FeatureTierBadge tier="PLUS"/></h3><div className="settings-fields"><label>Supplier<select value={supplierId} onChange={e=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={e=>setExpected(e.target.value)}/></label></div><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={e=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={e=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={e=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" className="icon-button" onClick={()=>setItems(x=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems(x=>[...x,line()])}>Add Line</button><button className="primary-button">Create Draft PO</button></div></form>
+<form className="panel" onSubmit={receivePO}><h3>Receive Approved/Sent PO</h3><div className="settings-fields"><label>Purchase Order<select value={receive.poId} onChange={e=>setReceive({...receive,poId:e.target.value})} required><option value="">Select ready PO</option>{orders.filter(o=>["APPROVED","SENT","PARTIALLY_RECEIVED"].includes(o.status)).map(o=><option key={o.id} value={o.id}>{o.po_number} · {o.status}</option>)}</select></label><label>Supplier Invoice<input required value={receive.invoice} onChange={e=>setReceive({...receive,invoice:e.target.value})}/></label><label>Invoice Date<input type="date" required value={receive.date} onChange={e=>setReceive({...receive,date:e.target.value})}/></label></div><p className="muted-text">Inventory changes only inside the controlled receive RPC.</p><button className="primary-button">Receive Goods</button></form></div>
+<div className="settings-grid" style={{marginTop:16}}><form className="panel" onSubmit={pay}><h3>Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={e=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}>{["BANK_TRANSFER","UPI","CASH","CARD","CHEQUE","OTHER"].map(m=><option key={m}>{m}</option>)}</select></label><label>Reference<input value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></label></div><button className="primary-button">Record Payment</button></form>
+<form className="panel" onSubmit={purchaseReturn}><h3>Purchase Return</h3><div className="settings-fields"><label>Supplier<select required value={ret.supplierId} onChange={e=>setRet({...ret,supplierId:e.target.value})}><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Product<select required value={ret.productId} onChange={e=>setRet({...ret,productId:e.target.value})}><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Quantity<input type="number" min="1" required value={ret.qty} onChange={e=>setRet({...ret,qty:e.target.value})}/></label><label>Reason<input required value={ret.reason} onChange={e=>setRet({...ret,reason:e.target.value})}/></label></div><button className="secondary-button">Complete Return</button></form></div>
+<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3>{orders.length===0?<EmptyState title="No purchase orders" message="Create a draft purchase order to begin procurement."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Next Action</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find(s=>s.id===o.supplier_id)?.supplier_name||"Supplier"}</td><td><StatusBadge status={o.status}/></td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td><div className="button-row compact">{o.status==="DRAFT"?<button className="secondary-button" onClick={()=>rpc("submit_purchase_order",{p_po_id:o.id},"Submitted for approval")}>Submit</button>:null}{o.status==="APPROVAL_PENDING"?<button className="primary-button" onClick={()=>rpc("approve_purchase_order",{p_po_id:o.id},"Purchase order approved")}>Approve</button>:null}{o.status==="APPROVED"?<button className="secondary-button" onClick={()=>rpc("set_purchase_order_status",{p_po_id:o.id,p_status:"SENT"},"Purchase order marked sent")}>Mark Sent</button>:null}</div></td></tr>)}</tbody></table></div>}</section>
+<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map(b=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
+</div>}
diff --git a/src/pages/PurchaseIntelligence.jsx b/src/pages/PurchaseIntelligence.jsx
new file mode 100644
index 0000000..a2f6514
--- /dev/null
+++ b/src/pages/PurchaseIntelligence.jsx
@@ -0,0 +1,90 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import AutomationHub from "./AutomationHub";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+import LoadingState from "../components/ui/LoadingState";
+import { HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";
+
+const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
+
+export default function PurchaseIntelligence() {
+  const { products } = useShop();
+  const [productId, setProductId] = useState("");
+  const [comparison, setComparison] = useState([]);
+  const [suppliers, setSuppliers] = useState([]);
+  const [history, setHistory] = useState([]);
+  const [loading, setLoading] = useState(false);
+  const [message, setMessage] = useState("");
+
+  const selected = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
+
+  async function loadSupplierIntelligence() {
+    const { data, error } = await supabase.rpc("supplier_intelligence", { p_days: 180 });
+    if (error) setMessage("Unable to load supplier intelligence.");
+    else setSuppliers(data || []);
+  }
+
+  useEffect(() => { loadSupplierIntelligence(); }, []);
+
+  async function inspectProduct(id) {
+    setProductId(id);
+    setComparison([]); setHistory([]); setMessage("");
+    if (!id) return;
+    setLoading(true);
+    const [compare, price] = await Promise.all([
+      supabase.rpc("supplier_price_comparison", { p_product_id: id, p_days: 180 }),
+      supabase.rpc("purchase_price_history", { p_product_id: id, p_limit: 24 }),
+    ]);
+    if (compare.error || price.error) setMessage("Unable to load purchase intelligence for this product.");
+    else { setComparison(compare.data || []); setHistory(price.data || []); }
+    setLoading(false);
+  }
+
+  const latest = history[0];
+  const previous = history[1];
+  const priceDiff = latest && previous ? Number(latest.purchase_price) - Number(previous.purchase_price) : null;
+  const pct = previous && Number(previous.purchase_price) > 0 ? priceDiff / Number(previous.purchase_price) * 100 : null;
+  const marginPct = selected?.price > 0 && latest ? (selected.price - Number(latest.purchase_price)) / selected.price * 100 : null;
+  const priceTrend = useMemo(() => history.slice().reverse().map((r) => ({ label: r.invoice_date || "Purchase", value: Number(r.purchase_price || 0) })), [history]);
+  const supplierChart = useMemo(() => comparison.slice().sort((a,b)=>Number(a.avg_price||0)-Number(b.avg_price||0)).map((r)=>({label:r.supplier_name||"Supplier",value:Number(r.avg_price||0)})), [comparison]);
+
+  return <div>
+    <PageHeader title="Smart Purchase Intelligence" subtitle="OCR review, purchase-price change, supplier comparison and margin impact." tier="PRO"/>
+    {message ? <div className="purchase-message">{message}</div> : null}
+
+    <section className="panel intelligence-filter">
+      <label>Analyze Product
+        <select value={productId} onChange={(e) => inspectProduct(e.target.value)}>
+          <option value="">Select product</option>
+          {products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
+        </select>
+      </label>
+    </section>
+
+    {loading ? <LoadingState label="Analyzing purchase history..."/> : null}
+    {selected && !loading ? <>
+      <div className="metric-grid four" style={{ marginTop: 16 }}>
+        <div className="metric-card"><span>Current Selling Price</span><strong>{money.format(selected.price)}</strong></div>
+        <div className="metric-card"><span>Latest Purchase Price</span><strong>{latest ? money.format(latest.purchase_price) : "No history"}</strong></div>
+        <div className="metric-card"><span>Latest Change</span><strong>{priceDiff === null ? "-" : `${priceDiff >= 0 ? "+" : ""}${money.format(priceDiff)}${pct === null ? "" : ` (${pct.toFixed(2)}%)`}`}</strong></div>
+        <div className="metric-card"><span>Estimated Gross Margin</span><strong>{marginPct === null ? "-" : `${marginPct.toFixed(2)}%`}</strong></div>
+      </div>
+
+      <div className="dashboard-chart-grid" style={{ marginTop: 16 }}>
+        <LineChartCard title="Purchase Price Trend" subtitle="Historical unit purchase cost for the selected SKU" data={priceTrend} formatValue={(v)=>money.format(v)}/>
+        <HorizontalBarChartCard title="Supplier Average Price" subtitle="Lower bars indicate more competitive historical unit cost" data={supplierChart} formatValue={(v)=>money.format(v)}/>
+      </div>
+
+      <div className="settings-grid" style={{ marginTop: 16 }}>
+        <section className="panel"><h3>Supplier Price Comparison</h3>{comparison.length === 0 ? <EmptyState title="No supplier history yet" message="Receive this product from suppliers to build comparison history."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Units</th><th>Avg</th><th>Min</th><th>Max</th><th>Last</th></tr></thead><tbody>{comparison.map((r) => <tr key={r.supplier_id}><td>{r.supplier_name || "Supplier"}</td><td>{r.purchase_count}</td><td>{r.total_units}</td><td>{money.format(r.avg_price)}</td><td>{money.format(r.min_price)}</td><td>{money.format(r.max_price)}</td><td>{money.format(r.last_price)}</td></tr>)}</tbody></table></div>}</section>
+        <section className="panel"><h3>Recent Price History</h3>{history.length === 0 ? <EmptyState title="No price history" message="Purchase receipts will populate this timeline."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Price</th></tr></thead><tbody>{history.slice(0, 10).map((r, i) => <tr key={`${r.invoice_date || i}-${r.invoice_date}`}><td>{r.invoice_date}</td><td>{r.supplier_name || "-"}</td><td>{money.format(r.purchase_price)}</td></tr>)}</tbody></table></div>}</section>
+      </div>
+    </> : null}
+
+    <section className="panel" style={{ marginTop: 16 }}><h3>Supplier Intelligence · Last 180 Days</h3>{suppliers.length === 0 ? <EmptyState title="No supplier activity yet" message="Purchases and supplier payments will build reliability and price history."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Purchase Total</th><th>Returns</th><th>Outstanding</th><th>Ordered</th><th>Received</th><th>Variance</th></tr></thead><tbody>{suppliers.map((r) => <tr key={r.supplier_id}><td>{r.supplier_name}</td><td>{r.purchase_count}</td><td>{money.format(r.purchase_total)}</td><td>{money.format(r.return_total)}</td><td>{money.format(r.outstanding)}</td><td>{r.po_ordered}</td><td>{r.po_received}</td><td>{r.receive_variance}</td></tr>)}</tbody></table></div>}</section>
+
+    <div className="embedded-capability" style={{ marginTop: 20 }}><AutomationHub/></div>
+  </div>;
+}
diff --git a/src/pages/Recommendations.jsx b/src/pages/Recommendations.jsx
new file mode 100644
index 0000000..6383077
--- /dev/null
+++ b/src/pages/Recommendations.jsx
@@ -0,0 +1,6 @@
+import { useEffect, useState } from "react";
+import { Link } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+export default function Recommendations(){const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("owner_recommendations",{p_history_days:30});if(error)setMsg("Unable to calculate recommendations.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Smart Recommendations" subtitle="Rule-based actions from live stock, sales, inventory health and shift variance." tier="PLUS"/>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel recommendation-list">{rows.length===0?<EmptyState title="No recommendations right now" message="The shop has no configured condition requiring an action."/>:rows.map((r,i)=><div className="recommendation-card" key={`${r.recommendation_type}-${i}`}><div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span><h3>{r.title}</h3><p>{r.message}</p></div><Link className="secondary-button" to={r.action_path||"/owner"}>Take Action</Link></div>)}</section></div>}
diff --git a/src/pages/ReportsConsolidated.jsx b/src/pages/ReportsConsolidated.jsx
new file mode 100644
index 0000000..94a075c
--- /dev/null
+++ b/src/pages/ReportsConsolidated.jsx
@@ -0,0 +1,16 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import { DonutChartCard, LineChartCard } from "../components/charts/BusinessCharts";
+const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
+function csvEscape(value){const s=String(value??"");return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
+function downloadCsv(name,headers,rows){const csv=[headers.join(","),...rows.map(r=>r.map(csvEscape).join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
+export default function ReportsConsolidated(){const{sales,purchases,products,getStock}=useShop();const now=new Date();const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));const[to,setTo]=useState(now.toISOString().slice(0,10));const[expenses,setExpenses]=useState([]);const[message,setMessage]=useState("");async function load(){const{data,error}=await supabase.from("expenses").select("expense_date,amount,description,payment_method,status,expense_categories(name)").gte("expense_date",from).lte("expense_date",to).order("expense_date",{ascending:false});if(error)setMessage("Unable to load expenses for report.");else setExpenses(data||[])}useEffect(()=>{load()},[]);
+const fs=sales.filter(s=>s.createdAt?.slice(0,10)>=from&&s.createdAt?.slice(0,10)<=to&&s.status!=="VOID");const fp=purchases.filter(p=>p.invoiceDate>=from&&p.invoiceDate<=to);const salesTotal=fs.reduce((a,s)=>a+s.grandTotal,0);const purchaseTotal=fp.reduce((a,p)=>a+p.total,0);const expenseTotal=expenses.filter(e=>e.status==="ACTIVE").reduce((a,e)=>a+Number(e.amount||0),0);const inventoryValue=useMemo(()=>products.reduce((a,p)=>a+getStock(p.id)*p.purchasePrice,0),[products,getStock]);
+const trend=useMemo(()=>{const map=new Map();fs.forEach(s=>{const k=s.createdAt.slice(0,10);map.set(k,(map.get(k)||0)+Number(s.grandTotal||0))});return [...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({label:new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}),value}))},[fs]);
+const paymentMix=useMemo(()=>{const map={};fs.forEach(s=>{const k=String(s.paymentMethod||"OTHER").toUpperCase();map[k]=(map[k]||0)+Number(s.grandTotal||0)});return Object.entries(map).map(([label,value])=>({label,value}))},[fs]);
+return <div><PageHeader title="Reports & Exports" subtitle="Operational reporting with visual trends and accountant-friendly CSV exports."/><div className="panel filter-bar"><label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label><button className="primary-button" onClick={load}>Refresh</button></div>{message?<div className="purchase-message">{message}</div>:null}<div className="metric-grid four" style={{marginTop:16}}><div className="metric-card metric-accent-blue"><span>Sales</span><strong>{money.format(salesTotal)}</strong></div><div className="metric-card metric-accent-indigo"><span>Purchases</span><strong>{money.format(purchaseTotal)}</strong></div><div className="metric-card metric-accent-orange"><span>Expenses</span><strong>{money.format(expenseTotal)}</strong></div><div className="metric-card metric-accent-green"><span>Inventory Cost</span><strong>{money.format(inventoryValue)}</strong></div></div>
+<div className="dashboard-chart-grid" style={{marginTop:16}}><LineChartCard title="Sales Trend" subtitle="Sales value across the selected report period" data={trend} formatValue={(v)=>money.format(v)}/><DonutChartCard title="Payment Mix" subtitle="Selected-period payment distribution" data={paymentMix} formatValue={(v)=>money.format(v)} centerLabel="Sales"/></div>
+<section className="panel" style={{marginTop:16}}><h3>Export Center</h3><div className="button-row wrap"><button className="secondary-button" onClick={()=>downloadCsv(`sales-${from}-${to}.csv`,["Invoice","Date","Payment","Subtotal","Discount","Total"],fs.map(s=>[s.invoiceNumber,s.createdAt,s.paymentMethod,s.subtotal,s.discount,s.grandTotal]))}>Export Sales CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`purchases-${from}-${to}.csv`,["Purchase","Invoice","Date","Supplier","Units","Total"],fp.map(p=>[p.purchaseNumber,p.invoiceNumber,p.invoiceDate,p.supplierName,p.totalUnits,p.total]))}>Export Purchases CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`inventory-${new Date().toISOString().slice(0,10)}.csv`,["SKU","Barcode","Product","Category","Stock","Purchase Price","Selling Price"],products.map(p=>[p.sku,p.barcode,p.name,p.category,getStock(p.id),p.purchasePrice,p.price]))}>Export Inventory CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`expenses-${from}-${to}.csv`,["Date","Category","Description","Method","Amount","Status"],expenses.map(e=>[e.expense_date,e.expense_categories?.name,e.description,e.payment_method,e.amount,e.status]))}>Export Expenses CSV</button></div><p className="muted-text">CSV exports are the first accounting integration point. Any exact Tally import format should be validated with the accountant before claiming compatibility.</p></section>
+<section className="panel" style={{marginTop:16}}><h3>Sales Summary</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead><tbody>{fs.slice(0,100).map(s=><tr key={s.id}><td>{s.invoiceNumber}</td><td>{new Date(s.createdAt).toLocaleString("en-IN")}</td><td>{s.paymentMethod}</td><td>{money.format(s.discount)}</td><td>{money.format(s.grandTotal)}</td></tr>)}</tbody></table></div></section></div>}
diff --git a/src/pages/Settings.jsx b/src/pages/Settings.jsx
index 817267c..03e70e8 100644
--- a/src/pages/Settings.jsx
+++ b/src/pages/Settings.jsx
@@ -1,9 +1,68 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
 import { useAuth } from "../context/AuthContext";
 import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import LoadingState from "../components/ui/LoadingState";
+
+const emptyForm = {
+  shopName: "", shopSlug: "", storeAddress: "", storePhone: "", taxRegistrationNumber: "",
+  currencyCode: "INR", currencySymbol: "₹", invoicePrefix: "INV", purchasePrefix: "PUR",
+  taxEnabled: false, taxPercentage: 0, printerPaperMm: 80, receiptFooter: "",
+};
 
 export default function Settings() {
-  const { profile, access } = useAuth();
+  const { refreshAccess } = useAuth();
   const { products, sales, purchases, createBackup, refreshAll } = useShop();
+  const [form, setForm] = useState(emptyForm);
+  const [loading, setLoading] = useState(true);
+  const [busy, setBusy] = useState(false);
+  const [message, setMessage] = useState("");
+
+  async function load() {
+    setLoading(true); setMessage("");
+    const { data, error } = await supabase.rpc("get_shop_configuration");
+    if (error) setMessage("Unable to load shop settings.");
+    else if (data?.[0]) {
+      const r = data[0];
+      setForm({
+        shopName: r.shop_name || "", shopSlug: r.shop_slug || "", storeAddress: r.store_address || "",
+        storePhone: r.store_phone || "", taxRegistrationNumber: r.tax_registration_number || "",
+        currencyCode: r.currency_code || "INR", currencySymbol: r.currency_symbol || "₹",
+        invoicePrefix: r.invoice_prefix || "INV", purchasePrefix: r.purchase_prefix || "PUR",
+        taxEnabled: Boolean(r.tax_enabled), taxPercentage: Number(r.tax_percentage || 0),
+        printerPaperMm: Number(r.printer_paper_mm || 80), receiptFooter: r.receipt_footer || "",
+      });
+    }
+    setLoading(false);
+  }
+
+  useEffect(() => { load(); }, []);
+
+  async function save(event) {
+    event.preventDefault(); setBusy(true); setMessage("");
+    const { error } = await supabase.rpc("update_shop_configuration", {
+      p_shop_name: form.shopName,
+      p_store_address: form.storeAddress || null,
+      p_store_phone: form.storePhone || null,
+      p_tax_registration_number: form.taxRegistrationNumber || null,
+      p_currency_code: form.currencyCode,
+      p_currency_symbol: form.currencySymbol,
+      p_invoice_prefix: form.invoicePrefix,
+      p_purchase_prefix: form.purchasePrefix,
+      p_tax_enabled: form.taxEnabled,
+      p_tax_percentage: Number(form.taxPercentage || 0),
+      p_printer_paper_mm: Number(form.printerPaperMm),
+      p_receipt_footer: form.receiptFooter || null,
+    });
+    if (error) setMessage("Unable to save shop settings. Check the values and try again.");
+    else {
+      setMessage("Shop settings saved successfully.");
+      await Promise.all([refreshAccess(), refreshAll()]);
+      await load();
+    }
+    setBusy(false);
+  }
 
   function exportSnapshot() {
     const backup = createBackup();
@@ -16,29 +75,50 @@ export default function Settings() {
     URL.revokeObjectURL(url);
   }
 
-  return (
-    <div>
-      <div className="page-heading"><div><h2>Settings</h2><p>Cloud shop configuration</p></div></div>
+  if (loading) return <LoadingState label="Loading shop settings..."/>;
 
+  return <div>
+    <PageHeader title="Shop Settings" subtitle="Edit the operational identity, invoice numbering, receipt and printer defaults for the current shop."/>
+    {message ? <div className="purchase-message">{message}</div> : null}
+    <form onSubmit={save}>
       <div className="settings-grid">
-        <section className="panel">
-          <h3>Shop</h3>
-          <p>Name: <strong>{profile?.shop_name}</strong></p>
-          <p>Slug: <strong>{profile?.shop_slug}</strong></p>
-          <p>Role: <strong>{profile?.role}</strong></p>
-          <p>Subscription: <strong>{access?.subscription_status}</strong></p>
-          <p>Products: <strong>{products.length}</strong></p>
-          <p>Sales loaded: <strong>{sales.length}</strong></p>
-          <p>Purchases loaded: <strong>{purchases.length}</strong></p>
+        <section className="panel settings-section">
+          <div className="settings-section-heading"><div><h3>Shop Identity</h3><p>Customer-facing details used across receipts and operational screens.</p></div></div>
+          <div className="settings-fields">
+            <label>Shop Name<input required value={form.shopName} onChange={(e)=>setForm({...form,shopName:e.target.value})}/></label>
+            <label>Shop Slug<input value={form.shopSlug} disabled/><small>Stable system identifier. It is intentionally read-only.</small></label>
+            <label>Phone<input value={form.storePhone} onChange={(e)=>setForm({...form,storePhone:e.target.value})} placeholder="+91 ..."/></label>
+            <label>Tax / Registration Number<input value={form.taxRegistrationNumber} onChange={(e)=>setForm({...form,taxRegistrationNumber:e.target.value})}/></label>
+            <label className="span-two">Address<textarea value={form.storeAddress} onChange={(e)=>setForm({...form,storeAddress:e.target.value})}/></label>
+          </div>
         </section>
 
-        <section className="panel">
-          <h3>Cloud Data</h3>
-          <p>Supabase is now the source of truth. LocalStorage is no longer used for business transactions.</p>
-          <button className="primary-button" onClick={refreshAll}>Refresh Cloud Data</button>{" "}
-          <button className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button>
+        <section className="panel settings-section">
+          <div className="settings-section-heading"><div><h3>Billing & Numbering</h3><p>Defaults used by invoices, purchase documents and receipts.</p></div></div>
+          <div className="settings-fields">
+            <label>Currency Code<input required maxLength="3" value={form.currencyCode} onChange={(e)=>setForm({...form,currencyCode:e.target.value.toUpperCase()})}/></label>
+            <label>Currency Symbol<input required maxLength="4" value={form.currencySymbol} onChange={(e)=>setForm({...form,currencySymbol:e.target.value})}/></label>
+            <label>Invoice Prefix<input required maxLength="12" value={form.invoicePrefix} onChange={(e)=>setForm({...form,invoicePrefix:e.target.value.toUpperCase()})}/></label>
+            <label>Purchase Prefix<input required maxLength="12" value={form.purchasePrefix} onChange={(e)=>setForm({...form,purchasePrefix:e.target.value.toUpperCase()})}/></label>
+            <label>Receipt Paper<select value={form.printerPaperMm} onChange={(e)=>setForm({...form,printerPaperMm:Number(e.target.value)})}><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label>
+            <label className="span-two">Receipt Footer<textarea value={form.receiptFooter} onChange={(e)=>setForm({...form,receiptFooter:e.target.value})} placeholder="Thank you for your purchase"/></label>
+          </div>
         </section>
       </div>
-    </div>
-  );
+
+      <section className="panel settings-section" style={{marginTop:16}}>
+        <div className="settings-section-heading"><div><h3>Tax Configuration</h3><p>Enable only when the shop's verified accounting/legal configuration requires it.</p></div></div>
+        <div className="settings-inline-row">
+          <label className="toggle-field"><input type="checkbox" checked={form.taxEnabled} onChange={(e)=>setForm({...form,taxEnabled:e.target.checked})}/><span>Enable configured tax percentage</span></label>
+          <label>Tax Percentage<input type="number" min="0" step="0.01" disabled={!form.taxEnabled} value={form.taxPercentage} onChange={(e)=>setForm({...form,taxPercentage:e.target.value})}/></label>
+        </div>
+        <p className="muted-text">WineShopPOS does not invent state liquor/excise rules. Configure tax only from verified requirements.</p>
+      </section>
+
+      <div className="settings-action-bar">
+        <div><strong>{products.length}</strong> products · <strong>{sales.length}</strong> sales loaded · <strong>{purchases.length}</strong> purchases loaded</div>
+        <div className="button-row"><button type="button" className="secondary-button" onClick={refreshAll}>Refresh Cloud Data</button><button type="button" className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save Shop Settings"}</button></div>
+      </div>
+    </form>
+  </div>;
 }
diff --git a/src/pages/Transfers.jsx b/src/pages/Transfers.jsx
index 85161e6..7222b06 100644
--- a/src/pages/Transfers.jsx
+++ b/src/pages/Transfers.jsx
@@ -2,11 +2,12 @@ import { useEffect, useState } from "react";
 import { supabase } from "../lib/supabase";
 import { useShop } from "../context/ShopContext";
 import { useAuth } from "../context/AuthContext";
-
+import PageHeader from "../components/ui/PageHeader";
+import StatusBadge from "../components/ui/StatusBadge";
+import EmptyState from "../components/ui/EmptyState";
 export default function Transfers(){const{products,getStock,refreshAll}=useShop();const{profile}=useAuth();const[dest,setDest]=useState([]);const[transfers,setTransfers]=useState([]);const[destination,setDestination]=useState("");const[productId,setProductId]=useState("");const[qty,setQty]=useState(1);const[message,setMessage]=useState("");
-async function load(){const[d,t]=await Promise.all([supabase.rpc("available_transfer_destinations"),supabase.from("stock_transfers").select(`*,stock_transfer_items(*)`).order("created_at",{ascending:false}).limit(100)]);if(d.error)setMessage(d.error.message);else setDest(d.data||[]);if(t.error)setMessage(t.error.message);else setTransfers(t.data||[])}useEffect(()=>{load()},[]);
-async function create(e){e.preventDefault();const{error}=await supabase.rpc("create_stock_transfer",{p_destination_shop_id:destination,p_items:[{product_id:productId,quantity:Number(qty)}],p_notes:null});setMessage(error?error.message:"Transfer requested. Destination branch must approve before stock moves.");if(!error)load()}
-async function act(id,action){const fn=action==="approve"?"approve_stock_transfer":action==="reject"?"reject_stock_transfer":"cancel_stock_transfer";const args=action==="reject"?{p_transfer_id:id,p_note:"Rejected from transfer screen"}:{p_transfer_id:id};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Transfer ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
-return <div><div className="page-heading"><div><h2>Branch Stock Transfer</h2><p>Transfers are allowed only between shops in the same organization.</p></div></div>{message&&<div className="purchase-message">{message}</div>}
-<div className="settings-grid"><form className="panel" onSubmit={create}><h3>Request Transfer Out</h3>{dest.length===0?<p>No other branch is linked to this organization yet. Platform owner must create/link another shop first.</p>:<div className="settings-fields"><label>Destination<select value={destination} onChange={(e)=>setDestination(e.target.value)} required><option value="">Select branch</option>{dest.map((d)=><option key={d.shop_id} value={d.shop_id}>{d.shop_name}</option>)}</select></label><label>Product<select value={productId} onChange={(e)=>setProductId(e.target.value)} required><option value="">Select product</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name} · stock {getStock(p.id)}</option>)}</select></label><label>Quantity<input type="number" min="1" max={productId?getStock(productId):99999} value={qty} onChange={(e)=>setQty(e.target.value)} required/></label><button className="primary-button">Request Transfer</button></div>}</form><section className="panel"><h3>Safety Model</h3><p>Source request does not immediately deduct stock. Destination Manager/Admin approves. Approval re-checks source inventory under row lock and posts TRANSFER_OUT + TRANSFER_IN atomically.</p></section></div>
-<section className="panel" style={{marginTop:16}}><h3>Transfer Queue</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Created</th><th>Direction</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead><tbody>{transfers.map((t)=>{const incoming=t.destination_shop_id===profile?.shop_id;return <tr key={t.id}><td>{new Date(t.created_at).toLocaleString("en-IN")}</td><td>{incoming?"INCOMING":"OUTGOING"}</td><td>{(t.stock_transfer_items||[]).reduce((s,i)=>s+i.quantity,0)}</td><td>{t.status}</td><td>{t.status==="REQUESTED"&&incoming?<><button className="primary-button" onClick={()=>act(t.id,"approve")}>Approve</button> <button className="secondary-button" onClick={()=>act(t.id,"reject")}>Reject</button></>:t.status==="REQUESTED"&&!incoming?<button className="secondary-button" onClick={()=>act(t.id,"cancel")}>Cancel</button>:"-"}</td></tr>})}</tbody></table></div></section></div>}
+async function load(){const[d,t]=await Promise.all([supabase.rpc("available_transfer_destinations"),supabase.from("stock_transfers").select("*,stock_transfer_items(*)").order("created_at",{ascending:false}).limit(150)]);if(d.error||t.error)setMessage("Unable to load transfer queue.");else{setDest(d.data||[]);setTransfers(t.data||[])}}useEffect(()=>{load()},[]);
+async function create(e){e.preventDefault();const{error}=await supabase.rpc("create_stock_transfer",{p_destination_shop_id:destination,p_items:[{product_id:productId,quantity:Number(qty)}],p_notes:null});setMessage(error?"Unable to request transfer.":"Transfer requested. Destination must approve before dispatch.");if(!error){setProductId("");setQty(1);load()}}
+async function act(fn,id,args={},ok="Transfer updated"){const{error}=await supabase.rpc(fn,{p_transfer_id:id,...args});setMessage(error?`Unable to ${ok.toLowerCase()}.`:ok);if(!error){await Promise.all([load(),refreshAll()])}}
+function actions(t){const incoming=t.destination_shop_id===profile?.shop_id;const outgoing=t.source_shop_id===profile?.shop_id;if(t.status==="REQUESTED"&&incoming)return <><button className="primary-button" onClick={()=>act("approve_stock_transfer",t.id,{},"Transfer approved")}>Approve</button><button className="secondary-button" onClick={()=>act("reject_stock_transfer",t.id,{p_note:"Rejected from consolidated transfer screen"},"Transfer rejected")}>Reject</button></>;if(t.status==="REQUESTED"&&outgoing)return <button className="secondary-button" onClick={()=>act("cancel_stock_transfer",t.id,{},"Transfer cancelled")}>Cancel</button>;if(t.status==="APPROVED"&&outgoing)return <button className="primary-button" onClick={()=>act("dispatch_stock_transfer",t.id,{},"Transfer dispatched; source stock deducted")}>Dispatch</button>;if(t.status==="DISPATCHED"&&outgoing)return <button className="secondary-button" onClick={()=>act("mark_stock_transfer_in_transit",t.id,{},"Transfer marked in transit")}>Mark In Transit</button>;if(["DISPATCHED","IN_TRANSIT"].includes(t.status)&&incoming)return <button className="primary-button" onClick={()=>act("receive_stock_transfer",t.id,{},"Transfer received; destination stock increased")}>Receive</button>;if(t.status==="RECEIVED"&&incoming)return <button className="primary-button" onClick={()=>act("complete_stock_transfer",t.id,{},"Transfer completed")}>Complete</button>;return <span className="muted-text">No action</span>}
+return <div><PageHeader title="Advanced Stock Transfers" subtitle="Request → approve → dispatch → in transit → receive → complete. Stock changes follow the physical lifecycle." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={create}><h3>Request Transfer</h3>{dest.length===0?<EmptyState title="No transfer destination" message="Only shops inside the same organization can be destinations."/>:<div className="settings-fields"><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)} required><option value="">Select branch</option>{dest.map(d=><option key={d.shop_id} value={d.shop_id}>{d.shop_name}</option>)}</select></label><label>Product<select value={productId} onChange={e=>setProductId(e.target.value)} required><option value="">Select product</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} · stock {getStock(p.id)}</option>)}</select></label><label>Quantity<input type="number" min="1" max={productId?getStock(productId):99999} value={qty} onChange={e=>setQty(e.target.value)} required/></label><button className="primary-button">Request</button></div>}</form><section className="panel"><h3>Transaction Safety</h3><p>Approval reserves permission only. Source stock is deducted only at Dispatch. Destination stock is increased only at Receive.</p><p>Every inventory change is performed inside a database RPC and recorded as a stock movement.</p></section></div><section className="panel" style={{marginTop:16}}><h3>Transfer Queue</h3>{transfers.length===0?<EmptyState title="No transfers" message="Transfer requests will appear here."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Created</th><th>Direction</th><th>Qty</th><th>Status</th><th>Dispatched</th><th>Received</th><th>Action</th></tr></thead><tbody>{transfers.map(t=>{const incoming=t.destination_shop_id===profile?.shop_id;return <tr key={t.id}><td>{new Date(t.created_at).toLocaleString("en-IN")}</td><td>{incoming?"INCOMING":"OUTGOING"}</td><td>{(t.stock_transfer_items||[]).reduce((s,i)=>s+Number(i.quantity||0),0)}</td><td><StatusBadge status={t.status}/></td><td>{t.dispatched_at?new Date(t.dispatched_at).toLocaleString("en-IN"):"-"}</td><td>{t.received_at?new Date(t.received_at).toLocaleString("en-IN"):"-"}</td><td><div className="button-row compact">{actions(t)}</div></td></tr>})}</tbody></table></div>}</section></div>}
diff --git a/src/pages/Users.jsx b/src/pages/Users.jsx
index 1a1982b..d48a6d1 100644
--- a/src/pages/Users.jsx
+++ b/src/pages/Users.jsx
@@ -1,26 +1,21 @@
 import { useEffect, useState } from "react";
+import { Link } from "react-router-dom";
 import { supabase } from "../lib/supabase";
 import { useAuth } from "../context/AuthContext";
+import PageHeader from "../components/ui/PageHeader";
+import StatusBadge from "../components/ui/StatusBadge";
+import EmptyState from "../components/ui/EmptyState";
 
 export default function Users() {
   const { profile } = useAuth();
   const [users, setUsers] = useState([]);
   const [message, setMessage] = useState("");
-  const [form, setForm] = useState({
-    fullName: "",
-    email: "",
-    password: "",
-    role: "CASHIER",
-  });
-
+  const [busyId, setBusyId] = useState("");
+  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "CASHIER" });
   const isAdmin = profile?.role === "ADMIN";
 
   async function callFunction(body) {
-    const { data, error } = await supabase.functions.invoke(
-      "manage-shop-users",
-      { body }
-    );
-
+    const { data, error } = await supabase.functions.invoke("manage-shop-users", { body });
     if (error) throw error;
     if (!data?.ok) throw new Error(data?.message || "Operation failed");
     return data;
@@ -28,169 +23,65 @@ export default function Users() {
 
   async function loadUsers() {
     if (!isAdmin) return;
-
-    try {
-      const data = await callFunction({ action: "list" });
-      setUsers(data.users || []);
-    } catch (error) {
-      setMessage(error.message);
-    }
+    try { const data = await callFunction({ action: "list" }); setUsers(data.users || []); }
+    catch (error) { setMessage(error.message || "Unable to load users."); }
   }
 
-  useEffect(() => {
-    loadUsers();
-  }, [isAdmin]);
+  useEffect(() => { loadUsers(); }, [isAdmin]);
 
   async function createUser(event) {
-    event.preventDefault();
-    setMessage("");
-
+    event.preventDefault(); setMessage("");
     try {
-      await callFunction({
-        action: "create",
-        fullName: form.fullName,
-        email: form.email,
-        password: form.password,
-        role: form.role,
-      });
-
-      setForm({
-        fullName: "",
-        email: "",
-        password: "",
-        role: "CASHIER",
-      });
-
-      setMessage("User created successfully.");
-      await loadUsers();
-    } catch (error) {
-      setMessage(error.message);
-    }
+      await callFunction({ action: "create", fullName: form.fullName, email: form.email, password: form.password, role: form.role });
+      setForm({ fullName: "", email: "", password: "", role: "CASHIER" });
+      setMessage("User created successfully."); await loadUsers();
+    } catch (error) { setMessage(error.message || "Unable to create user."); }
   }
 
   async function setActive(userId, active) {
-    try {
-      await callFunction({ action: "set_active", userId, active });
-      await loadUsers();
-    } catch (error) {
-      setMessage(error.message);
-    }
+    setBusyId(userId); setMessage("");
+    try { await callFunction({ action: "set_active", userId, active }); setMessage(active ? "User enabled." : "User disabled."); await loadUsers(); }
+    catch (error) { setMessage(error.message || "Unable to update user status."); }
+    setBusyId("");
   }
 
-  if (!isAdmin) {
-    return (
-      <div className="panel">
-        <h2>Users</h2>
-        <p>Only the shop ADMIN can manage users.</p>
-      </div>
-    );
+  async function setRole(userId, role) {
+    setBusyId(userId); setMessage("");
+    try { await callFunction({ action: "set_role", userId, role }); setMessage(`Role changed to ${role}.`); await loadUsers(); }
+    catch (error) { setMessage(error.message || "Unable to change user role."); }
+    setBusyId("");
   }
 
-  return (
-    <div>
-      <div className="page-heading">
-        <div>
-          <h2>Users & Roles</h2>
-          <p>Shop Admin can create Manager and Cashier accounts.</p>
+  if (!isAdmin) return <section className="panel"><h2>Users</h2><p>Only the Shop Admin can manage users and roles.</p></section>;
+
+  return <div>
+    <PageHeader title="Users & Roles" subtitle="Create staff, change Cashier/Manager responsibilities and disable access without weakening backend security." actions={<Link className="secondary-button button-link" to="/admin/access">View Access Matrix</Link>}/>
+    {message ? <div className="purchase-message">{message}</div> : null}
+    <div className="settings-grid">
+      <form className="panel settings-section" onSubmit={createUser}>
+        <div className="settings-section-heading"><div><h3>Create Shop User</h3><p>Create operational staff only. Shop Admin creation remains platform-controlled.</p></div></div>
+        <div className="settings-fields">
+          <label>Full Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label>
+          <label>Email<input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
+          <label>Temporary Password<input type="password" required minLength="8" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label>
+          <label>Role<select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select></label>
         </div>
-      </div>
-
-      {message && <div className="purchase-message success">{message}</div>}
-
-      <div className="settings-grid">
-        <form className="panel" onSubmit={createUser}>
-          <h3>Create Shop User</h3>
-
-          <div className="settings-fields">
-            <label>
-              Full Name
-              <input
-                required
-                value={form.fullName}
-                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
-              />
-            </label>
-
-            <label>
-              Email
-              <input
-                type="email"
-                required
-                value={form.email}
-                onChange={(e) => setForm({ ...form, email: e.target.value })}
-              />
-            </label>
-
-            <label>
-              Temporary Password
-              <input
-                type="password"
-                required
-                minLength="8"
-                value={form.password}
-                onChange={(e) => setForm({ ...form, password: e.target.value })}
-              />
-            </label>
-
-            <label>
-              Role
-              <select
-                value={form.role}
-                onChange={(e) => setForm({ ...form, role: e.target.value })}
-              >
-                <option value="CASHIER">Cashier</option>
-                <option value="MANAGER">Manager</option>
-              </select>
-            </label>
-          </div>
-
-          <br />
-          <button className="primary-button">Create User</button>
-        </form>
-
-        <section className="panel">
-          <h3>Role Liberty</h3>
-          <p><strong>ADMIN:</strong> users, products, purchases, inventory, reports, POS.</p>
-          <p><strong>MANAGER:</strong> products, purchases, inventory adjustments, reports, POS.</p>
-          <p><strong>CASHIER:</strong> POS and permitted sales views only.</p>
-          <p><strong>PLATFORM OWNER:</strong> not a shop role. Controls shop ADMIN + subscription kill switch.</p>
-        </section>
-      </div>
-
-      <section className="panel" style={{ marginTop: 18 }}>
-        <h3>Shop Users</h3>
-        <div className="data-table-wrapper">
-          <table className="data-table">
-            <thead>
-              <tr>
-                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
-              </tr>
-            </thead>
-            <tbody>
-              {users.map((item) => (
-                <tr key={item.id}>
-                  <td>{item.full_name}</td>
-                  <td>{item.email || "-"}</td>
-                  <td>{item.role}</td>
-                  <td>{item.active ? "ACTIVE" : "INACTIVE"}</td>
-                  <td>
-                    {item.role === "ADMIN" ? (
-                      <span>Platform controlled</span>
-                    ) : (
-                      <button
-                        className="secondary-button"
-                        onClick={() => setActive(item.id, !item.active)}
-                      >
-                        {item.active ? "Disable" : "Enable"}
-                      </button>
-                    )}
-                  </td>
-                </tr>
-              ))}
-            </tbody>
-          </table>
+        <button className="primary-button">Create User</button>
+      </form>
+      <section className="panel settings-section">
+        <div className="settings-section-heading"><div><h3>Role Principle</h3><p>Give each user the least access needed for their job.</p></div></div>
+        <div className="role-rule-list">
+          <div><StatusBadge status="CASHIER"/><span>Sell, scan, own shift, permitted sales/returns and offline queue.</span></div>
+          <div><StatusBadge status="MANAGER"/><span>Operational control: products, purchasing, inventory, approvals, expenses and reports.</span></div>
+          <div><StatusBadge status="ADMIN"/><span>Owner/Admin functions: Owner Center, users, settings, backup and audit.</span></div>
         </div>
+        <Link to="/admin/access">Open the complete role access matrix →</Link>
       </section>
     </div>
-  );
+
+    <section className="panel" style={{marginTop:18}}>
+      <div className="section-row"><div><h3>Shop Users</h3><p className="muted-text">Role changes take effect after the user's access state refreshes/signs in again.</p></div></div>
+      {users.length === 0 ? <EmptyState title="No shop users" message="Create the first Manager or Cashier account above."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access Management</th></tr></thead><tbody>{users.map((item)=><tr key={item.id}><td><strong>{item.full_name}</strong></td><td>{item.email || "-"}</td><td>{item.role === "ADMIN" ? <StatusBadge status="ADMIN"/> : <select className="role-select" value={item.role} disabled={busyId===item.id} onChange={(e)=>setRole(item.id,e.target.value)}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select>}</td><td><StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"}/></td><td>{item.role === "ADMIN" ? <span className="muted-text">Platform controlled</span> : <button className="secondary-button" disabled={busyId===item.id} onClick={()=>setActive(item.id,!item.active)}>{item.active ? "Disable Access" : "Enable Access"}</button>}</td></tr>)}</tbody></table></div>}
+    </section>
+  </div>;
 }
diff --git a/supabase/functions/manage-shop-users/index.ts b/supabase/functions/manage-shop-users/index.ts
index d8dd364..291380e 100644
--- a/supabase/functions/manage-shop-users/index.ts
+++ b/supabase/functions/manage-shop-users/index.ts
@@ -2,35 +2,24 @@ import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
-  "Access-Control-Allow-Headers":
-    "authorization, x-client-info, apikey, content-type",
+  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
-  if (req.method === "OPTIONS") {
-    return new Response("ok", { headers: corsHeaders });
-  }
+  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
 
   try {
     const authHeader = req.headers.get("Authorization");
-
     if (!authHeader) throw new Error("Missing authorization");
 
     const url = Deno.env.get("SUPABASE_URL")!;
     const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
     const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 
-    const caller = createClient(url, anonKey, {
-      global: { headers: { Authorization: authHeader } },
-    });
-
+    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
     const admin = createClient(url, serviceKey);
 
-    const {
-      data: { user },
-      error: userError,
-    } = await caller.auth.getUser();
-
+    const { data: { user }, error: userError } = await caller.auth.getUser();
     if (userError || !user) throw new Error("Invalid session");
 
     const { data: callerProfile, error: profileError } = await admin
@@ -50,13 +39,10 @@ Deno.serve(async (req) => {
       .single();
 
     if (shopError || !shop) throw new Error("Shop not found");
-
     const today = new Date().toISOString().slice(0, 10);
-    const allowed =
-      shop.access_enabled === true &&
+    const allowed = shop.access_enabled === true &&
       ["TRIAL", "ACTIVE"].includes(shop.subscription_status) &&
       (!shop.subscription_end_date || shop.subscription_end_date >= today);
-
     if (!allowed) throw new Error("SHOP_ACCESS_DISABLED");
 
     const body = await req.json();
@@ -65,19 +51,15 @@ Deno.serve(async (req) => {
     if (action === "list") {
       const { data, error } = await admin
         .from("profiles")
-        .select("id,full_name,email,role,active,created_at")
+        .select("id,full_name,email,phone,avatar_url,role,active,created_at")
         .eq("shop_id", callerProfile.shop_id)
         .order("created_at");
-
       if (error) throw error;
-
       return Response.json({ ok: true, users: data }, { headers: corsHeaders });
     }
 
     if (action === "create") {
       const role = String(body.role || "").toUpperCase();
-
-      // Shop ADMIN cannot create another ADMIN.
       if (!["MANAGER", "CASHIER"].includes(role)) {
         throw new Error("Shop Admin can create only MANAGER or CASHIER");
       }
@@ -85,7 +67,6 @@ Deno.serve(async (req) => {
       const fullName = String(body.fullName || "").trim();
       const email = String(body.email || "").trim().toLowerCase();
       const password = String(body.password || "");
-
       if (!fullName || !email || password.length < 8) {
         throw new Error("Name, email and password (8+ chars) are required");
       }
@@ -94,22 +75,14 @@ Deno.serve(async (req) => {
         .from("profiles")
         .select("id", { count: "exact", head: true })
         .eq("shop_id", callerProfile.shop_id);
+      if ((count ?? 0) >= shop.max_users) throw new Error(`Shop user limit reached (${shop.max_users})`);
 
-      if ((count ?? 0) >= shop.max_users) {
-        throw new Error(`Shop user limit reached (${shop.max_users})`);
-      }
-
-      const { data: created, error: createError } =
-        await admin.auth.admin.createUser({
-          email,
-          password,
-          email_confirm: true,
-          user_metadata: { full_name: fullName },
-        });
-
+      const { data: created, error: createError } = await admin.auth.admin.createUser({
+        email, password, email_confirm: true, user_metadata: { full_name: fullName },
+      });
       if (createError) throw createError;
 
-      const { error: insertError } = await admin.from("profiles").insert({
+      const { error: profileInsert } = await admin.from("profiles").insert({
         id: created.user.id,
         shop_id: callerProfile.shop_id,
         full_name: fullName,
@@ -118,38 +91,85 @@ Deno.serve(async (req) => {
         active: true,
       });
 
-      if (insertError) {
+      if (profileInsert) {
         await admin.auth.admin.deleteUser(created.user.id);
-        throw insertError;
+        throw profileInsert;
       }
 
-      return Response.json(
-        { ok: true, userId: created.user.id },
-        { headers: corsHeaders }
-      );
+      const { error: membershipInsert } = await admin.from("user_shop_memberships").upsert({
+        user_id: created.user.id,
+        shop_id: callerProfile.shop_id,
+        role,
+        active: true,
+      }, { onConflict: "user_id,shop_id" });
+
+      if (membershipInsert) {
+        await admin.from("profiles").delete().eq("id", created.user.id);
+        await admin.auth.admin.deleteUser(created.user.id);
+        throw membershipInsert;
+      }
+
+      return Response.json({ ok: true, userId: created.user.id }, { headers: corsHeaders });
     }
 
-    if (action === "set_active") {
+    if (action === "set_role") {
       const targetId = String(body.userId || "");
-      const active = body.active === true;
+      const role = String(body.role || "").toUpperCase();
+      if (!["MANAGER", "CASHIER"].includes(role)) throw new Error("Role must be MANAGER or CASHIER");
+      if (targetId === callerProfile.id) throw new Error("Shop ADMIN role is platform controlled");
 
       const { data: target, error: targetError } = await admin
         .from("profiles")
-        .select("id,shop_id,role")
+        .select("id,shop_id,role,active")
         .eq("id", targetId)
         .eq("shop_id", callerProfile.shop_id)
         .single();
-
       if (targetError || !target) throw new Error("User not found");
-      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");
+      if (target.role === "ADMIN") throw new Error("Shop ADMIN role is platform controlled");
 
-      const { error } = await admin
+      const { error: profileUpdate } = await admin
         .from("profiles")
-        .update({ active })
+        .update({ role })
         .eq("id", targetId)
         .eq("shop_id", callerProfile.shop_id);
+      if (profileUpdate) throw profileUpdate;
+
+      const { error: membershipUpdate } = await admin
+        .from("user_shop_memberships")
+        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role, active: target.active }, { onConflict: "user_id,shop_id" });
+      if (membershipUpdate) {
+        // Keep profile + membership authorization state consistent if the second write fails.
+        await admin.from("profiles").update({ role: target.role }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
+        throw membershipUpdate;
+      }
 
-      if (error) throw error;
+      return Response.json({ ok: true }, { headers: corsHeaders });
+    }
+
+    if (action === "set_active") {
+      const targetId = String(body.userId || "");
+      const active = body.active === true;
+      const { data: target, error: targetError } = await admin
+        .from("profiles")
+        .select("id,shop_id,role,active")
+        .eq("id", targetId)
+        .eq("shop_id", callerProfile.shop_id)
+        .single();
+
+      if (targetError || !target) throw new Error("User not found");
+      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");
+
+      const { error: profileUpdate } = await admin
+        .from("profiles").update({ active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
+      if (profileUpdate) throw profileUpdate;
+
+      const { error: membershipUpdate } = await admin
+        .from("user_shop_memberships")
+        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role: target.role, active }, { onConflict: "user_id,shop_id" });
+      if (membershipUpdate) {
+        await admin.from("profiles").update({ active: target.active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
+        throw membershipUpdate;
+      }
 
       return Response.json({ ok: true }, { headers: corsHeaders });
     }
@@ -158,7 +178,7 @@ Deno.serve(async (req) => {
   } catch (error) {
     return Response.json(
       { ok: false, message: error instanceof Error ? error.message : String(error) },
-      { status: 400, headers: corsHeaders }
+      { status: 400, headers: corsHeaders },
     );
   }
 });
diff --git a/supabase/migrations/20260829233000_master_reconsolidation.sql b/supabase/migrations/20260829233000_master_reconsolidation.sql
new file mode 100644
index 0000000..e4f487f
--- /dev/null
+++ b/supabase/migrations/20260829233000_master_reconsolidation.sql
@@ -0,0 +1,1025 @@
+-- WineShopPOS Master Reconsolidation
+-- UX/product consolidation over the existing Chapters 1-26 architecture.
+-- IMPORTANT: This migration is additive/replacement-only for functions and constraints.
+-- It does not drop transactional history or rebuild existing sale/purchase/inventory tables.
+
+create extension if not exists pgcrypto;
+
+-- ============================================================
+-- 1. ACCOUNT / PROFILE UX + FUTURE MULTI-SHOP MEMBERSHIP
+-- ============================================================
+alter table public.profiles add column if not exists phone text;
+alter table public.profiles add column if not exists avatar_url text;
+alter table public.profiles add column if not exists theme text not null default 'SYSTEM';
+
+do $$ begin
+  alter table public.profiles add constraint profiles_theme_check
+    check (theme in ('SYSTEM','LIGHT','DARK'));
+exception when duplicate_object then null; end $$;
+
+create table if not exists public.user_shop_memberships (
+  user_id uuid not null references auth.users(id) on delete cascade,
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  role text not null check (role in ('ADMIN','MANAGER','CASHIER')),
+  active boolean not null default true,
+  created_at timestamptz not null default now(),
+  updated_at timestamptz not null default now(),
+  primary key (user_id, shop_id)
+);
+
+drop trigger if exists trg_user_shop_memberships_updated_at on public.user_shop_memberships;
+create trigger trg_user_shop_memberships_updated_at before update on public.user_shop_memberships
+for each row execute function public.set_updated_at();
+
+insert into public.user_shop_memberships(user_id,shop_id,role,active)
+select id,shop_id,role,active from public.profiles
+on conflict (user_id,shop_id) do update
+set role=excluded.role,active=excluded.active;
+
+drop function if exists public.my_profile();
+create function public.my_profile()
+returns table (
+  user_id uuid,
+  shop_id uuid,
+  full_name text,
+  email text,
+  phone text,
+  avatar_url text,
+  theme text,
+  role text,
+  active boolean,
+  shop_name text,
+  shop_slug text,
+  organization_id uuid,
+  organization_name text,
+  max_users integer
+)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select
+    p.id,
+    p.shop_id,
+    p.full_name,
+    p.email,
+    p.phone,
+    p.avatar_url,
+    p.theme,
+    p.role,
+    p.active,
+    s.name,
+    s.slug,
+    s.organization_id,
+    o.name,
+    s.max_users
+  from public.profiles p
+  join public.shops s on s.id=p.shop_id
+  left join public.organizations o on o.id=s.organization_id
+  where p.id=auth.uid();
+$$;
+
+create or replace function public.update_my_profile(
+  p_full_name text,
+  p_phone text default null,
+  p_avatar_url text default null,
+  p_theme text default 'SYSTEM'
+)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+begin
+  if nullif(trim(p_full_name),'') is null then raise exception 'Display name is required'; end if;
+  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
+  update public.profiles
+  set full_name=trim(p_full_name),phone=nullif(trim(p_phone),''),avatar_url=nullif(trim(p_avatar_url),''),theme=p_theme
+  where id=auth.uid() and active=true;
+  if not found then raise exception 'Active profile not found'; end if;
+end;
+$$;
+
+create or replace function public.my_shop_memberships()
+returns table(shop_id uuid,shop_name text,shop_slug text,role text,is_current boolean)
+language sql
+stable
+security definer
+set search_path = public
+as $$
+  select m.shop_id,s.name,s.slug,m.role,(m.shop_id=public.current_shop_id())
+  from public.user_shop_memberships m
+  join public.shops s on s.id=m.shop_id
+  where m.user_id=auth.uid() and m.active=true and s.active=true and s.access_enabled=true
+    and s.subscription_status in ('TRIAL','ACTIVE')
+    and (s.subscription_end_date is null or s.subscription_end_date>=current_date)
+  order by (m.shop_id=public.current_shop_id()) desc,s.name;
+$$;
+
+create or replace function public.switch_shop(p_shop_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare v_role text;
+begin
+  select m.role into v_role
+  from public.user_shop_memberships m
+  join public.shops s on s.id=m.shop_id
+  where m.user_id=auth.uid() and m.shop_id=p_shop_id and m.active=true and s.active=true and s.access_enabled=true
+    and s.subscription_status in ('TRIAL','ACTIVE')
+    and (s.subscription_end_date is null or s.subscription_end_date>=current_date);
+  if v_role is null then raise exception 'You do not have access to this shop'; end if;
+  update public.profiles set shop_id=p_shop_id,role=v_role where id=auth.uid() and active=true;
+  if not found then raise exception 'Active profile not found'; end if;
+end;
+$$;
+
+-- ============================================================
+-- 2. EXPENSE MANAGEMENT (CORE)
+-- ============================================================
+create table if not exists public.expense_categories (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  name text not null,
+  active boolean not null default true,
+  created_at timestamptz not null default now(),
+  unique(shop_id,name)
+);
+
+create table if not exists public.expenses (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  category_id uuid not null references public.expense_categories(id) on delete restrict,
+  expense_date date not null default current_date,
+  amount numeric(14,2) not null check (amount>0),
+  description text not null,
+  payment_method text not null check (payment_method in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER')),
+  reference_number text,
+  status text not null default 'ACTIVE' check (status in ('ACTIVE','VOID')),
+  entered_by uuid not null references auth.users(id) on delete restrict,
+  voided_by uuid references auth.users(id) on delete set null,
+  void_reason text,
+  voided_at timestamptz,
+  created_at timestamptz not null default now()
+);
+create index if not exists idx_expenses_shop_date on public.expenses(shop_id,expense_date desc);
+
+insert into public.expense_categories(shop_id,name)
+select s.id,x.name from public.shops s
+cross join (values ('Rent'),('Salary'),('Electricity'),('Transport'),('Maintenance'),('Miscellaneous')) x(name)
+on conflict(shop_id,name) do nothing;
+
+create or replace function public.record_expense(
+  p_category_id uuid,p_expense_date date,p_amount numeric,p_description text,p_payment_method text,p_reference text default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;v_id uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  if p_amount<=0 then raise exception 'Expense amount must be positive'; end if;
+  if nullif(trim(p_description),'') is null then raise exception 'Description is required'; end if;
+  if p_payment_method not in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER') then raise exception 'Invalid payment method'; end if;
+  if not exists(select 1 from public.expense_categories where id=p_category_id and shop_id=v_shop and active=true) then raise exception 'Expense category not found'; end if;
+  insert into public.expenses(shop_id,category_id,expense_date,amount,description,payment_method,reference_number,entered_by)
+  values(v_shop,p_category_id,coalesce(p_expense_date,current_date),p_amount,trim(p_description),p_payment_method,nullif(trim(p_reference),''),auth.uid())
+  returning id into v_id;
+  perform public.write_audit(v_shop,'EXPENSE_RECORDED','expense',v_id::text,null,null,jsonb_build_object('amount',p_amount,'category_id',p_category_id));
+  return v_id;
+end;$$;
+
+create or replace function public.void_expense(p_expense_id uuid,p_reason text)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  if nullif(trim(p_reason),'') is null then raise exception 'Void reason is required'; end if;
+  update public.expenses set status='VOID',voided_by=auth.uid(),void_reason=trim(p_reason),voided_at=now()
+  where id=p_expense_id and shop_id=v_shop and status='ACTIVE';
+  if not found then raise exception 'Active expense not found'; end if;
+  perform public.write_audit(v_shop,'EXPENSE_VOIDED','expense',p_expense_id::text,null,null,jsonb_build_object('reason',p_reason));
+end;$$;
+
+-- ============================================================
+-- 3. CUSTOMER + CREDIT / UDHAAR (PLUS)
+-- ============================================================
+create table if not exists public.customers (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  full_name text not null,
+  mobile text,
+  email text,
+  notes text,
+  active boolean not null default true,
+  created_by uuid references auth.users(id) on delete set null,
+  created_at timestamptz not null default now(),
+  updated_at timestamptz not null default now()
+);
+drop trigger if exists trg_customers_updated_at on public.customers;
+create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
+create unique index if not exists uq_customers_shop_mobile on public.customers(shop_id,mobile) where mobile is not null and mobile<>'';
+
+alter table public.sales add column if not exists customer_id uuid references public.customers(id) on delete set null;
+
+create table if not exists public.customer_credit_entries (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  customer_id uuid not null references public.customers(id) on delete restrict,
+  entry_type text not null check (entry_type in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT')),
+  amount numeric(14,2) not null check (amount>0),
+  sale_id uuid references public.sales(id) on delete set null,
+  reference_number text,
+  description text,
+  created_by uuid references auth.users(id) on delete set null,
+  created_at timestamptz not null default now()
+);
+create index if not exists idx_customer_credit_shop_customer on public.customer_credit_entries(shop_id,customer_id,created_at desc);
+
+create or replace function public.create_customer(p_full_name text,p_mobile text default null,p_email text default null,p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;v_id uuid;
+begin
+  v_shop:=public.assert_shop_access();
+  if public.current_user_role() not in ('ADMIN','MANAGER','CASHIER') then raise exception 'Role not allowed'; end if;
+  if nullif(trim(p_full_name),'') is null then raise exception 'Customer name is required'; end if;
+  insert into public.customers(shop_id,full_name,mobile,email,notes,created_by)
+  values(v_shop,trim(p_full_name),nullif(trim(p_mobile),''),nullif(trim(p_email),''),nullif(trim(p_notes),''),auth.uid())
+  returning id into v_id;
+  return v_id;
+end;$$;
+
+create or replace function public.link_sale_customer(p_sale_id uuid,p_customer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();
+  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
+  update public.sales set customer_id=p_customer_id where id=p_sale_id and shop_id=v_shop;
+  if not found then raise exception 'Sale not found'; end if;
+end;$$;
+
+create or replace function public.record_customer_credit(
+  p_customer_id uuid,p_entry_type text,p_amount numeric,p_sale_id uuid default null,p_reference text default null,p_description text default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;v_id uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  if p_entry_type not in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT') then raise exception 'Invalid credit entry type'; end if;
+  if p_amount<=0 then raise exception 'Amount must be positive'; end if;
+  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
+  if p_sale_id is not null and not exists(select 1 from public.sales where id=p_sale_id and shop_id=v_shop) then raise exception 'Sale not found'; end if;
+  insert into public.customer_credit_entries(shop_id,customer_id,entry_type,amount,sale_id,reference_number,description,created_by)
+  values(v_shop,p_customer_id,p_entry_type,p_amount,p_sale_id,nullif(trim(p_reference),''),nullif(trim(p_description),''),auth.uid()) returning id into v_id;
+  perform public.write_audit(v_shop,'CUSTOMER_CREDIT_'||p_entry_type,'customer_credit',v_id::text,null,null,jsonb_build_object('customer_id',p_customer_id,'amount',p_amount));
+  return v_id;
+end;$$;
+
+create or replace function public.customer_balances()
+returns table(customer_id uuid,full_name text,mobile text,total_charges numeric,total_payments numeric,outstanding numeric)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  select c.id,c.full_name,c.mobile,
+    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else 0 end),0),
+    coalesce(sum(case when e.entry_type in ('PAYMENT','ADJUSTMENT_CREDIT') then e.amount else 0 end),0),
+    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else -e.amount end),0)
+  from public.customers c
+  left join public.customer_credit_entries e on e.customer_id=c.id and e.shop_id=c.shop_id
+  where c.shop_id=public.assert_shop_access() and c.active=true and public.current_user_role() in ('ADMIN','MANAGER')
+  group by c.id,c.full_name,c.mobile
+  order by 6 desc,c.full_name;
+$$;
+
+-- ============================================================
+-- 4. COMPLIANCE FOUNDATION (NO LEGAL RULES HARDCODED)
+-- ============================================================
+create table if not exists public.compliance_profiles (
+  shop_id uuid primary key references public.shops(id) on delete cascade,
+  state_code text,
+  state_name text,
+  license_number text,
+  license_type text,
+  license_valid_from date,
+  license_valid_to date,
+  excise_registration_number text,
+  notes text,
+  updated_by uuid references auth.users(id) on delete set null,
+  updated_at timestamptz not null default now()
+);
+
+create or replace function public.upsert_compliance_profile(
+  p_state_code text,p_state_name text,p_license_number text,p_license_type text,p_license_valid_from date,p_license_valid_to date,p_excise_registration_number text,p_notes text
+)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_admin();
+  insert into public.compliance_profiles(shop_id,state_code,state_name,license_number,license_type,license_valid_from,license_valid_to,excise_registration_number,notes,updated_by,updated_at)
+  values(v_shop,nullif(trim(p_state_code),''),nullif(trim(p_state_name),''),nullif(trim(p_license_number),''),nullif(trim(p_license_type),''),p_license_valid_from,p_license_valid_to,nullif(trim(p_excise_registration_number),''),nullif(trim(p_notes),''),auth.uid(),now())
+  on conflict(shop_id) do update set state_code=excluded.state_code,state_name=excluded.state_name,license_number=excluded.license_number,license_type=excluded.license_type,license_valid_from=excluded.license_valid_from,license_valid_to=excluded.license_valid_to,excise_registration_number=excluded.excise_registration_number,notes=excluded.notes,updated_by=auth.uid(),updated_at=now();
+end;$$;
+
+-- ============================================================
+-- 5. BACKUP / RECOVERY VERIFICATION LOG
+-- ============================================================
+create table if not exists public.backup_restore_tests (
+  id uuid primary key default gen_random_uuid(),
+  shop_id uuid not null references public.shops(id) on delete cascade,
+  test_date date not null default current_date,
+  environment text not null,
+  backup_reference text,
+  result text not null check (result in ('PASS','FAIL')),
+  notes text,
+  tested_by uuid not null references auth.users(id) on delete restrict,
+  created_at timestamptz not null default now()
+);
+
+create or replace function public.record_backup_restore_test(p_environment text,p_backup_reference text,p_result text,p_notes text default null)
+returns uuid
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;v_id uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_admin();
+  if p_result not in ('PASS','FAIL') then raise exception 'Result must be PASS or FAIL'; end if;
+  if nullif(trim(p_environment),'') is null then raise exception 'Test environment is required'; end if;
+  insert into public.backup_restore_tests(shop_id,environment,backup_reference,result,notes,tested_by)
+  values(v_shop,trim(p_environment),nullif(trim(p_backup_reference),''),p_result,nullif(trim(p_notes),''),auth.uid()) returning id into v_id;
+  perform public.write_audit(v_shop,'BACKUP_RESTORE_TEST_'||p_result,'backup_restore_test',v_id::text,null,null,jsonb_build_object('environment',p_environment));
+  return v_id;
+end;$$;
+
+-- ============================================================
+-- 6. HISTORICAL COST SNAPSHOT FOR PROFIT INTELLIGENCE
+-- ============================================================
+alter table public.sale_items add column if not exists cost_price_snapshot numeric(12,2);
+alter table public.sale_items add column if not exists cost_snapshot_source text;
+
+update public.sale_items si
+set cost_price_snapshot=p.purchase_price,cost_snapshot_source='CURRENT_PRODUCT_BACKFILL'
+from public.products p
+where si.product_id=p.id and si.cost_price_snapshot is null;
+
+create or replace function public.set_sale_item_cost_snapshot()
+returns trigger
+language plpgsql
+security definer
+set search_path=public
+as $$
+begin
+  if new.cost_price_snapshot is null then
+    select purchase_price into new.cost_price_snapshot from public.products where id=new.product_id and shop_id=new.shop_id;
+    new.cost_snapshot_source:='SALE_TIME_PRODUCT_COST';
+  end if;
+  return new;
+end;$$;
+
+drop trigger if exists trg_sale_item_cost_snapshot on public.sale_items;
+create trigger trg_sale_item_cost_snapshot before insert on public.sale_items
+for each row execute function public.set_sale_item_cost_snapshot();
+
+-- ============================================================
+-- 7. ADVANCED PURCHASE-ORDER APPROVAL LIFECYCLE (PLUS)
+-- ============================================================
+alter table public.purchase_orders add column if not exists approved_by uuid references auth.users(id) on delete set null;
+alter table public.purchase_orders add column if not exists approved_at timestamptz;
+
+alter table public.purchase_orders drop constraint if exists purchase_orders_status_check;
+alter table public.purchase_orders add constraint purchase_orders_status_check
+check (status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED'));
+
+create or replace function public.submit_purchase_order(p_po_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.purchase_orders set status='APPROVAL_PENDING' where id=p_po_id and shop_id=v_shop and status='DRAFT';
+  if not found then raise exception 'Draft purchase order not found'; end if;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_SUBMITTED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+create or replace function public.approve_purchase_order(p_po_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.purchase_orders set status='APPROVED',approved_by=auth.uid(),approved_at=now()
+  where id=p_po_id and shop_id=v_shop and status='APPROVAL_PENDING';
+  if not found then raise exception 'Purchase order is not awaiting approval'; end if;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_APPROVED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+create or replace function public.set_purchase_order_status(p_po_id uuid,p_status text)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  if p_status='SENT' then
+    update public.purchase_orders set status='SENT' where id=p_po_id and shop_id=v_shop and status='APPROVED';
+  elsif p_status='CANCELLED' then
+    update public.purchase_orders set status='CANCELLED' where id=p_po_id and shop_id=v_shop and status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT');
+  else
+    raise exception 'Unsupported purchase order status transition';
+  end if;
+  if not found then raise exception 'Purchase order cannot be changed from its current status'; end if;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_'||p_status,'purchase_order',p_po_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+-- Replace receive_purchase_order only to enforce the approved procurement lifecycle.
+create or replace function public.receive_purchase_order(
+  p_po_id uuid,p_invoice_number text,p_invoice_date date,p_receive_items jsonb default null,p_notes text default null
+)
+returns uuid
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare
+  v_shop uuid;v_po public.purchase_orders%rowtype;r record;v_payload jsonb:='[]'::jsonb;v_qty integer;v_remaining integer;v_purchase uuid;v_all_received boolean;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('APPROVED','SENT','PARTIALLY_RECEIVED') for update;
+  if not found then raise exception 'PO must be approved before receiving goods'; end if;
+  if p_receive_items is null then
+    for r in select * from public.purchase_order_items where purchase_order_id=p_po_id loop
+      v_remaining:=r.ordered_quantity-r.received_quantity;
+      if v_remaining>0 then
+        v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_remaining,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_remaining,'po_item_id',r.id));
+      end if;
+    end loop;
+  else
+    for r in select poi.*,x.qty from public.purchase_order_items poi join lateral(
+      select (e->>'po_item_id')::uuid id,(e->>'quantity')::integer qty from jsonb_array_elements(p_receive_items)e
+    )x on x.id=poi.id where poi.purchase_order_id=p_po_id loop
+      v_remaining:=r.ordered_quantity-r.received_quantity;v_qty:=r.qty;
+      if v_qty<=0 or v_qty>v_remaining then raise exception 'Invalid receive quantity'; end if;
+      v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_qty,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_qty,'po_item_id',r.id));
+    end loop;
+  end if;
+  if jsonb_array_length(v_payload)=0 then raise exception 'Nothing remaining to receive'; end if;
+  v_purchase:=public.receive_purchase(v_po.supplier_id,p_invoice_number,p_invoice_date,v_payload,p_notes);
+  update public.purchases set purchase_order_id=p_po_id where id=v_purchase;
+  for r in select * from jsonb_array_elements(v_payload) loop
+    update public.purchase_order_items set received_quantity=received_quantity+(r->>'quantity')::integer where id=(r->>'po_item_id')::uuid;
+  end loop;
+  select not exists(select 1 from public.purchase_order_items where purchase_order_id=p_po_id and received_quantity<ordered_quantity) into v_all_received;
+  update public.purchase_orders set status=case when v_all_received then 'RECEIVED' else 'PARTIALLY_RECEIVED' end where id=p_po_id;
+  perform public.write_audit(v_shop,'PURCHASE_ORDER_RECEIVED','purchase_order',p_po_id::text,null,null,jsonb_build_object('purchase_id',v_purchase));
+  return v_purchase;
+end;$$;
+
+-- ============================================================
+-- 8. ADVANCED STOCK TRANSFER LIFECYCLE (PLUS)
+-- Existing legacy APPROVED transfers already moved stock atomically; mark them COMPLETE.
+-- New lifecycle: REQUESTED -> APPROVED -> DISPATCHED -> IN_TRANSIT -> RECEIVED -> COMPLETED
+-- ============================================================
+alter table public.stock_transfers drop constraint if exists stock_transfers_status_check;
+update public.stock_transfers set status='COMPLETED' where status='APPROVED';
+alter table public.stock_transfers add constraint stock_transfers_status_check
+check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED','DISPATCHED','IN_TRANSIT','RECEIVED','COMPLETED'));
+
+alter table public.stock_transfers add column if not exists dispatched_by uuid references auth.users(id) on delete set null;
+alter table public.stock_transfers add column if not exists received_by uuid references auth.users(id) on delete set null;
+alter table public.stock_transfers add column if not exists dispatched_at timestamptz;
+alter table public.stock_transfers add column if not exists received_at timestamptz;
+alter table public.stock_transfers add column if not exists completed_at timestamptz;
+
+create or replace function public.approve_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_dest uuid;v_transfer public.stock_transfers%rowtype;
+begin
+  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
+  if not found then raise exception 'Incoming transfer request not found'; end if;
+  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
+  update public.stock_transfers set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_transfer_id;
+  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
+end;$$;
+
+create or replace function public.dispatch_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare
+  v_source uuid;v_transfer public.stock_transfers%rowtype;r record;v_src_product public.products%rowtype;v_dest_product uuid;v_cat_name text;v_dest_cat uuid;v_before integer;v_after integer;
+begin
+  v_source:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  select * into v_transfer from public.stock_transfers where id=p_transfer_id and source_shop_id=v_source and status='APPROVED' for update;
+  if not found then raise exception 'Approved outgoing transfer not found'; end if;
+  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
+    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_source;
+    if not found then raise exception 'Source product missing'; end if;
+    select quantity into v_before from public.inventory where shop_id=v_source and product_id=v_src_product.id for update;
+    if v_before is null or v_before<r.quantity then raise exception 'Insufficient stock for %',v_src_product.product_name; end if;
+    select id into v_dest_product from public.products where shop_id=v_transfer.destination_shop_id and barcode=v_src_product.barcode limit 1;
+    if v_dest_product is null then
+      select name into v_cat_name from public.categories where id=v_src_product.category_id;
+      if v_cat_name is not null then
+        select id into v_dest_cat from public.categories where shop_id=v_transfer.destination_shop_id and lower(name)=lower(v_cat_name) limit 1;
+        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_transfer.destination_shop_id,v_cat_name) returning id into v_dest_cat; end if;
+      end if;
+      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
+      values(v_transfer.destination_shop_id,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
+      returning id into v_dest_product;
+      insert into public.inventory(shop_id,product_id,quantity) values(v_transfer.destination_shop_id,v_dest_product,0);
+    end if;
+    update public.stock_transfer_items set destination_product_id=v_dest_product where id=r.id;
+    v_after:=v_before-r.quantity;
+    update public.inventory set quantity=v_after where shop_id=v_source and product_id=v_src_product.id;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_source,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer dispatched',auth.uid());
+  end loop;
+  update public.stock_transfers set status='DISPATCHED',dispatched_by=auth.uid(),dispatched_at=now() where id=p_transfer_id;
+  perform public.write_audit(v_source,'TRANSFER_DISPATCHED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+create or replace function public.mark_stock_transfer_in_transit(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.stock_transfers set status='IN_TRANSIT' where id=p_transfer_id and source_shop_id=v_shop and status='DISPATCHED';
+  if not found then raise exception 'Dispatched transfer not found'; end if;
+  perform public.write_audit(v_shop,'TRANSFER_IN_TRANSIT','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+create or replace function public.receive_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_dest uuid;v_transfer public.stock_transfers%rowtype;r record;v_before integer;v_after integer;
+begin
+  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status in ('DISPATCHED','IN_TRANSIT') for update;
+  if not found then raise exception 'Transfer is not ready to receive'; end if;
+  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
+    if r.destination_product_id is null then raise exception 'Destination product mapping missing'; end if;
+    select quantity into v_before from public.inventory where shop_id=v_dest and product_id=r.destination_product_id for update;
+    v_before:=coalesce(v_before,0);v_after:=v_before+r.quantity;
+    update public.inventory set quantity=v_after where shop_id=v_dest and product_id=r.destination_product_id;
+    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
+    values(v_dest,r.destination_product_id,'TRANSFER_IN',r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer received',auth.uid());
+  end loop;
+  update public.stock_transfers set status='RECEIVED',received_by=auth.uid(),received_at=now() where id=p_transfer_id;
+  perform public.write_audit(v_dest,'TRANSFER_RECEIVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
+end;$$;
+
+create or replace function public.complete_stock_transfer(p_transfer_id uuid)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare v_dest uuid;
+begin
+  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
+  update public.stock_transfers set status='COMPLETED',completed_at=now() where id=p_transfer_id and destination_shop_id=v_dest and status='RECEIVED';
+  if not found then raise exception 'Received transfer not found'; end if;
+  perform public.write_audit(v_dest,'TRANSFER_COMPLETED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
+end;$$;
+
+-- ============================================================
+-- 9. PURCHASE / SUPPLIER INTELLIGENCE (PRO)
+-- ============================================================
+create or replace function public.supplier_price_comparison(p_product_id uuid,p_days integer default 180)
+returns table(supplier_id uuid,supplier_name text,purchase_count bigint,total_units bigint,avg_price numeric,min_price numeric,max_price numeric,last_price numeric,last_purchase_date date)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  with rows as (
+    select p.supplier_id,p.supplier_name_snapshot supplier_name,pi.quantity,pi.purchase_price,p.invoice_date,
+           row_number() over(partition by p.supplier_id order by p.invoice_date desc,p.created_at desc) rn
+    from public.purchase_items pi join public.purchases p on p.id=pi.purchase_id
+    where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and p.status='RECEIVED'
+      and p.invoice_date>=current_date-greatest(p_days,1)
+  )
+  select supplier_id,max(supplier_name),count(*),sum(quantity),round(avg(purchase_price),2),min(purchase_price),max(purchase_price),max(purchase_price) filter(where rn=1),max(invoice_date)
+  from rows group by supplier_id order by avg(purchase_price),max(invoice_date) desc;
+$$;
+
+create or replace function public.supplier_intelligence(p_days integer default 180)
+returns table(supplier_id uuid,supplier_name text,purchase_count bigint,purchase_total numeric,return_total numeric,payment_total numeric,outstanding numeric,po_ordered integer,po_received integer,receive_variance integer)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access() and active=true),
+  p as (select supplier_id,count(*) cnt,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' and invoice_date>=current_date-greatest(p_days,1) group by supplier_id),
+  r as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' and created_at>=now()-(greatest(p_days,1)||' days')::interval group by supplier_id),
+  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() and payment_date>=current_date-greatest(p_days,1) group by supplier_id),
+  po as (select o.supplier_id,sum(i.ordered_quantity)::int ordered,sum(i.received_quantity)::int received from public.purchase_orders o join public.purchase_order_items i on i.purchase_order_id=o.id where o.shop_id=public.current_shop_id() and o.created_at>=now()-(greatest(p_days,1)||' days')::interval group by o.supplier_id)
+  select s.id,s.supplier_name,coalesce(p.cnt,0),coalesce(p.total,0),coalesce(r.total,0),coalesce(pay.total,0),coalesce(p.total,0)-coalesce(r.total,0)-coalesce(pay.total,0),coalesce(po.ordered,0),coalesce(po.received,0),coalesce(po.ordered,0)-coalesce(po.received,0)
+  from s left join p on p.supplier_id=s.id left join r on r.supplier_id=s.id left join pay on pay.supplier_id=s.id left join po on po.supplier_id=s.id
+  order by coalesce(p.total,0) desc,s.supplier_name;
+$$;
+
+-- ============================================================
+-- 10. INVENTORY INTELLIGENCE (PRO)
+-- ============================================================
+create or replace function public.stock_explanation(p_product_id uuid,p_days integer default 365)
+returns table(movement_type text,quantity_change bigint,event_count bigint)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  select sm.movement_type,sum(sm.quantity_change)::bigint,count(*)::bigint
+  from public.stock_movements sm
+  where sm.shop_id=public.assert_shop_access() and sm.product_id=p_product_id
+    and sm.created_at>=now()-(greatest(p_days,1)||' days')::interval
+  group by sm.movement_type order by sm.movement_type;
+$$;
+
+create or replace function public.inventory_health(p_history_days integer default 30,p_dead_days integer default 45)
+returns table(product_id uuid,product_name text,current_stock integer,units_sold integer,avg_daily numeric,days_remaining numeric,last_sale_at timestamptz,classification text,inventory_cost numeric)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  with base as (
+    select p.id,p.product_name,p.minimum_stock,p.purchase_price,coalesce(i.quantity,0) stock
+    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
+    where p.shop_id=public.assert_shop_access() and p.active=true
+  ),sales as (
+    select si.product_id,
+      sum(si.quantity) filter(where s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval)::int units,
+      max(s.created_at) last_sale
+    from public.sale_items si join public.sales s on s.id=si.sale_id
+    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED')
+    group by si.product_id
+  ),calc as (
+    select b.*,coalesce(s.units,0) units,s.last_sale,round(coalesce(s.units,0)::numeric/greatest(p_history_days,1),2) avgd
+    from base b left join sales s on s.product_id=b.id
+  )
+  select id,product_name,stock,units,avgd,
+    case when avgd>0 then round(stock/avgd,1) else null end,last_sale,
+    case
+      when stock=0 then 'OUT_OF_STOCK'
+      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 'DEAD'
+      when avgd>0 and stock/avgd<=3 then 'STOCKOUT_RISK'
+      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 'OVERSTOCK'
+      when units>=greatest(p_history_days,1) then 'FAST'
+      when units<=2 then 'SLOW'
+      else 'HEALTHY'
+    end,
+    round(stock*purchase_price,2)
+  from calc order by
+    case
+      when stock=0 then 1
+      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 2
+      when avgd>0 and stock/avgd<=3 then 3
+      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 4
+      else 5 end,
+    product_name;
+$$;
+
+-- ============================================================
+-- 11. OWNER CENTER / PROFIT / LOSS CONTROL (PRO)
+-- ============================================================
+create or replace function public.owner_center_summary(p_from date default current_date-30,p_to date default current_date)
+returns jsonb
+language plpgsql
+stable
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;v_revenue numeric;v_cogs numeric;v_expenses numeric;v_purchases numeric;v_returns numeric;v_variance numeric;v_bills bigint;v_low bigint;v_inventory numeric;
+begin
+  v_shop:=public.assert_shop_access();perform public.assert_admin();
+  select coalesce(sum(grand_total),0),count(*) into v_revenue,v_bills from public.sales where shop_id=v_shop and status<>'VOID' and created_at::date between p_from and p_to;
+  select coalesce(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),0) into v_cogs from public.sale_items si join public.sales s on s.id=si.sale_id where si.shop_id=v_shop and s.status<>'VOID' and s.created_at::date between p_from and p_to;
+  select coalesce(sum(amount),0) into v_expenses from public.expenses where shop_id=v_shop and status='ACTIVE' and expense_date between p_from and p_to;
+  select coalesce(sum(total),0) into v_purchases from public.purchases where shop_id=v_shop and status='RECEIVED' and invoice_date between p_from and p_to;
+  select coalesce(sum(total_refund),0) into v_returns from public.sale_return_requests where shop_id=v_shop and status='APPROVED' and created_at::date between p_from and p_to;
+  select coalesce(sum(cash_difference),0) into v_variance from public.cashier_shifts where shop_id=v_shop and status='CLOSED' and closed_at::date between p_from and p_to;
+  select count(*) into v_low from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id where p.shop_id=v_shop and p.active=true and coalesce(i.quantity,0)<=p.minimum_stock;
+  select coalesce(sum(i.quantity*p.purchase_price),0) into v_inventory from public.inventory i join public.products p on p.id=i.product_id where i.shop_id=v_shop and p.active=true;
+  return jsonb_build_object('from',p_from,'to',p_to,'revenue',v_revenue,'bills',v_bills,'cogs',v_cogs,'gross_profit',v_revenue-v_cogs,'expenses',v_expenses,'operating_profit',v_revenue-v_cogs-v_expenses,'purchases',v_purchases,'returns',v_returns,'cash_variance',v_variance,'low_stock_count',v_low,'inventory_cost',v_inventory);
+end;$$;
+
+create or replace function public.profit_by_product(p_from date default current_date-30,p_to date default current_date)
+returns table(product_id uuid,product_name text,quantity bigint,revenue numeric,cogs numeric,gross_profit numeric,margin_pct numeric)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  select si.product_id,max(si.product_name_snapshot),sum(si.quantity)::bigint,round(sum(si.line_total),2),round(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),round(sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),
+    case when sum(si.line_total)>0 then round((sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)))/sum(si.line_total)*100,2) else 0 end
+  from public.sale_items si join public.sales s on s.id=si.sale_id
+  where si.shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and s.status<>'VOID' and s.created_at::date between p_from and p_to
+  group by si.product_id order by 6 desc;
+$$;
+
+create or replace function public.loss_control_exceptions(p_days integer default 30)
+returns table(exception_type text,severity text,event_time timestamptz,entity_id text,summary text,amount numeric,action_path text)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  with q as (
+    select 'CASH_VARIANCE'::text type,case when abs(coalesce(cash_difference,0))>=1000 then 'HIGH' else 'MEDIUM' end severity,coalesce(closed_at,opened_at) t,id::text entity,
+      'Shift cash difference '||coalesce(cash_difference,0)::text summary,abs(coalesce(cash_difference,0)) amount,'/operations/shifts' path
+    from public.cashier_shifts where shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and status='CLOSED' and abs(coalesce(cash_difference,0))>=200 and opened_at>=now()-(greatest(p_days,1)||' days')::interval
+    union all
+    select 'REFUND',case when total_refund>=2000 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Approved refund '||total_refund::text,total_refund,'/pos/returns'
+    from public.sale_return_requests where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and status='APPROVED' and total_refund>=500 and created_at>=now()-(greatest(p_days,1)||' days')::interval
+    union all
+    select 'DISCOUNT',case when discount>=1000 or (subtotal>0 and discount/subtotal>=0.20) then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Sale discount '||discount::text,discount,'/pos/sales'
+    from public.sales where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and discount>0 and (discount>=500 or (subtotal>0 and discount/subtotal>=0.10)) and created_at>=now()-(greatest(p_days,1)||' days')::interval
+    union all
+    select 'STOCK_ADJUSTMENT',case when abs(quantity_change)>=12 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Stock adjustment '||quantity_change::text,abs(quantity_change)::numeric,'/inventory'
+    from public.stock_movements where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and movement_type in ('DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION','STOCK_COUNT') and abs(quantity_change)>=5 and created_at>=now()-(greatest(p_days,1)||' days')::interval
+  )
+  select type,severity,t,entity,summary,amount,path from q order by case severity when 'HIGH' then 1 else 2 end,t desc;
+$$;
+
+create or replace function public.owner_recommendations(p_history_days integer default 30)
+returns table(priority text,recommendation_type text,title text,message text,action_path text,tier text)
+language sql
+stable
+security definer
+set search_path=public
+as $$
+  with reorder as (
+    select * from public.reorder_suggestions(p_history_days,7) limit 8
+  ),dead as (
+    select * from public.inventory_health(p_history_days,45) where classification in ('DEAD','OVERSTOCK') limit 8
+  ),shiftx as (
+    select * from public.loss_control_exceptions(p_history_days) where exception_type='CASH_VARIANCE' limit 5
+  )
+  select case when coalesce(days_remaining,999)<=2 then 'HIGH' else 'MEDIUM' end,'REORDER','Stockout risk: '||product_name,
+    'Stock '||current_stock||'; suggested order '||suggested_cases||' case(s).','/inventory/intelligence','PLUS' from reorder where public.current_user_role()='ADMIN'
+  union all
+  select 'MEDIUM','INVENTORY_HEALTH',classification||': '||product_name,
+    'Current stock '||current_stock||'; inventory cost '||inventory_cost::text||'.','/inventory/intelligence','PLUS' from dead where public.current_user_role()='ADMIN'
+  union all
+  select severity,'CASH_VARIANCE','Shift variance requires review',summary,'/owner/exceptions','PLUS' from shiftx where public.current_user_role()='ADMIN'
+  limit 20;
+$$;
+
+-- ============================================================
+-- 12. RLS / AUDIT / GRANTS FOR NEW TABLES
+-- ============================================================
+alter table public.user_shop_memberships enable row level security;
+alter table public.expense_categories enable row level security;
+alter table public.expenses enable row level security;
+alter table public.customers enable row level security;
+alter table public.customer_credit_entries enable row level security;
+alter table public.compliance_profiles enable row level security;
+alter table public.backup_restore_tests enable row level security;
+
+drop policy if exists user_shop_memberships_select on public.user_shop_memberships;
+create policy user_shop_memberships_select on public.user_shop_memberships for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());
+
+drop policy if exists expense_categories_select on public.expense_categories;
+create policy expense_categories_select on public.expense_categories for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
+
+drop policy if exists expenses_select on public.expenses;
+create policy expenses_select on public.expenses for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
+
+drop policy if exists customers_select on public.customers;
+create policy customers_select on public.customers for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));
+
+drop policy if exists customer_credit_select on public.customer_credit_entries;
+create policy customer_credit_select on public.customer_credit_entries for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
+
+drop policy if exists compliance_profiles_select on public.compliance_profiles;
+create policy compliance_profiles_select on public.compliance_profiles for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
+
+drop policy if exists backup_restore_tests_select on public.backup_restore_tests;
+create policy backup_restore_tests_select on public.backup_restore_tests for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role()='ADMIN');
+
+-- Generic audit triggers on new shop-scoped mutable business tables.
+drop trigger if exists trg_audit_expenses on public.expenses;
+create trigger trg_audit_expenses after insert or update on public.expenses for each row execute function public.audit_row_changes();
+drop trigger if exists trg_audit_customers on public.customers;
+create trigger trg_audit_customers after insert or update on public.customers for each row execute function public.audit_row_changes();
+
+-- Direct browser mutations are not granted for transactional new tables; RPCs are authoritative.
+grant select on public.user_shop_memberships,public.expense_categories,public.expenses,public.customers,public.customer_credit_entries,public.compliance_profiles,public.backup_restore_tests to authenticated;
+
+grant execute on function public.my_profile() to authenticated;
+grant execute on function public.update_my_profile(text,text,text,text) to authenticated;
+grant execute on function public.my_shop_memberships() to authenticated;
+grant execute on function public.switch_shop(uuid) to authenticated;
+grant execute on function public.record_expense(uuid,date,numeric,text,text,text) to authenticated;
+grant execute on function public.void_expense(uuid,text) to authenticated;
+grant execute on function public.create_customer(text,text,text,text) to authenticated;
+grant execute on function public.link_sale_customer(uuid,uuid) to authenticated;
+grant execute on function public.record_customer_credit(uuid,text,numeric,uuid,text,text) to authenticated;
+grant execute on function public.customer_balances() to authenticated;
+grant execute on function public.upsert_compliance_profile(text,text,text,text,date,date,text,text) to authenticated;
+grant execute on function public.record_backup_restore_test(text,text,text,text) to authenticated;
+grant execute on function public.submit_purchase_order(uuid) to authenticated;
+grant execute on function public.approve_purchase_order(uuid) to authenticated;
+grant execute on function public.dispatch_stock_transfer(uuid) to authenticated;
+grant execute on function public.mark_stock_transfer_in_transit(uuid) to authenticated;
+grant execute on function public.receive_stock_transfer(uuid) to authenticated;
+grant execute on function public.complete_stock_transfer(uuid) to authenticated;
+grant execute on function public.supplier_price_comparison(uuid,integer) to authenticated;
+grant execute on function public.supplier_intelligence(integer) to authenticated;
+grant execute on function public.stock_explanation(uuid,integer) to authenticated;
+grant execute on function public.inventory_health(integer,integer) to authenticated;
+grant execute on function public.owner_center_summary(date,date) to authenticated;
+grant execute on function public.profit_by_product(date,date) to authenticated;
+grant execute on function public.loss_control_exceptions(integer) to authenticated;
+grant execute on function public.owner_recommendations(integer) to authenticated;
+
+-- Protect cost snapshots from Cashier direct queries. Owner/profit intelligence reads through security-definer RPCs.
+revoke select on public.sale_items from authenticated;
+grant select(id,shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total,created_at) on public.sale_items to authenticated;
+
+
+
+-- ============================================================
+-- 13. MODERN UX PATCH: THEME + EDITABLE SHOP SETTINGS
+-- ============================================================
+create or replace function public.update_my_theme(p_theme text)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+begin
+  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
+  update public.profiles set theme=p_theme where id=auth.uid() and active=true;
+  if not found then raise exception 'Active profile not found'; end if;
+end;
+$$;
+
+create or replace function public.get_shop_configuration()
+returns table(
+  shop_id uuid,
+  shop_name text,
+  shop_slug text,
+  store_address text,
+  store_phone text,
+  tax_registration_number text,
+  currency_code text,
+  currency_symbol text,
+  invoice_prefix text,
+  purchase_prefix text,
+  tax_enabled boolean,
+  tax_percentage numeric,
+  printer_paper_mm integer,
+  receipt_footer text
+)
+language plpgsql
+stable
+security definer
+set search_path=public
+as $$
+declare v_shop uuid;
+begin
+  v_shop:=public.assert_shop_access();
+  perform public.assert_admin();
+  return query
+  select s.id,s.name,s.slug,ss.store_address,ss.store_phone,ss.tax_registration_number,
+    ss.currency_code,ss.currency_symbol,ss.invoice_prefix,ss.purchase_prefix,
+    ss.tax_enabled,ss.tax_percentage,ss.printer_paper_mm,ss.receipt_footer
+  from public.shops s
+  left join public.shop_settings ss on ss.shop_id=s.id
+  where s.id=v_shop;
+end;
+$$;
+
+create or replace function public.update_shop_configuration(
+  p_shop_name text,
+  p_store_address text default null,
+  p_store_phone text default null,
+  p_tax_registration_number text default null,
+  p_currency_code text default 'INR',
+  p_currency_symbol text default '₹',
+  p_invoice_prefix text default 'INV',
+  p_purchase_prefix text default 'PUR',
+  p_tax_enabled boolean default false,
+  p_tax_percentage numeric default 0,
+  p_printer_paper_mm integer default 80,
+  p_receipt_footer text default null
+)
+returns void
+language plpgsql
+security definer
+set search_path=public
+as $$
+declare
+  v_shop uuid;
+  v_old jsonb;
+  v_new jsonb;
+begin
+  v_shop:=public.assert_shop_access();
+  perform public.assert_admin();
+  if nullif(trim(p_shop_name),'') is null then raise exception 'Shop name is required'; end if;
+  if nullif(trim(p_currency_code),'') is null then raise exception 'Currency code is required'; end if;
+  if nullif(trim(p_currency_symbol),'') is null then raise exception 'Currency symbol is required'; end if;
+  if nullif(trim(p_invoice_prefix),'') is null then raise exception 'Invoice prefix is required'; end if;
+  if nullif(trim(p_purchase_prefix),'') is null then raise exception 'Purchase prefix is required'; end if;
+  if coalesce(p_tax_percentage,0)<0 then raise exception 'Tax percentage cannot be negative'; end if;
+  if p_printer_paper_mm not in (58,80) then raise exception 'Printer paper must be 58 or 80 mm'; end if;
+
+  select jsonb_build_object(
+    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
+    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
+    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
+    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
+    'receipt_footer',ss.receipt_footer
+  ) into v_old
+  from public.shops s left join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;
+
+  update public.shops set name=trim(p_shop_name) where id=v_shop;
+  insert into public.shop_settings(
+    shop_id,currency_code,currency_symbol,invoice_prefix,purchase_prefix,tax_enabled,tax_percentage,
+    receipt_footer,store_address,store_phone,tax_registration_number,printer_paper_mm
+  ) values (
+    v_shop,upper(trim(p_currency_code)),trim(p_currency_symbol),upper(trim(p_invoice_prefix)),upper(trim(p_purchase_prefix)),
+    coalesce(p_tax_enabled,false),coalesce(p_tax_percentage,0),nullif(trim(p_receipt_footer),''),
+    nullif(trim(p_store_address),''),nullif(trim(p_store_phone),''),nullif(trim(p_tax_registration_number),''),p_printer_paper_mm
+  )
+  on conflict(shop_id) do update set
+    currency_code=excluded.currency_code,currency_symbol=excluded.currency_symbol,
+    invoice_prefix=excluded.invoice_prefix,purchase_prefix=excluded.purchase_prefix,
+    tax_enabled=excluded.tax_enabled,tax_percentage=excluded.tax_percentage,
+    receipt_footer=excluded.receipt_footer,store_address=excluded.store_address,
+    store_phone=excluded.store_phone,tax_registration_number=excluded.tax_registration_number,
+    printer_paper_mm=excluded.printer_paper_mm;
+
+  select jsonb_build_object(
+    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
+    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
+    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
+    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
+    'receipt_footer',ss.receipt_footer
+  ) into v_new
+  from public.shops s join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;
+
+  perform public.write_audit(v_shop,'UPDATE','SHOP_SETTINGS',v_shop::text,v_old,v_new,'{}'::jsonb);
+end;
+$$;
+
+grant execute on function public.update_my_theme(text) to authenticated;
+grant execute on function public.get_shop_configuration() to authenticated;
+grant execute on function public.update_shop_configuration(text,text,text,text,text,text,text,text,boolean,numeric,integer,text) to authenticated;
+
+
+notify pgrst,'reload schema';
```

## Exact source snapshots

### `package-lock.json`

```json
{
  "name": "wineshoppos",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "wineshoppos",
      "version": "0.0.0",
      "dependencies": {
        "@supabase/supabase-js": "^2.112.4",
        "jsbarcode": "^3.12.1",
        "lucide-react": "^1.37.0",
        "react": "^19.2.8",
        "react-dom": "^19.2.8",
        "react-router-dom": "^7.18.3"
      },
      "devDependencies": {
        "@types/react": "^19.2.18",
        "@types/react-dom": "^19.2.4",
        "@vitejs/plugin-react": "^6.1.0",
        "oxlint": "^1.79.0",
        "supabase": "^2.116.0",
        "vite": "^8.2.2"
      }
    },
    "node_modules/@ecies/ciphers": {
      "version": "0.2.6",
      "resolved": "https://registry.npmjs.org/@ecies/ciphers/-/ciphers-0.2.6.tgz",
      "integrity": "sha512-patgsRPKGkhhoBjETV4XxD0En4ui5fbX0hzayqI3M8tvNMGUoUvmyYAIWwlxBc1KX5cturfqByYdj5bYGRpN9g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "bun": ">=1",
        "deno": ">=2.7.10",
        "node": ">=16"
      },
      "peerDependencies": {
        "@noble/ciphers": "^1.0.0"
      }
    },
    "node_modules/@noble/ciphers": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/@noble/ciphers/-/ciphers-1.3.0.tgz",
      "integrity": "sha512-2I0gnIVPtfnMw9ee9h1dJG7tp81+8Ob3OJb3Mv37rx5L40/b0i7djjCVvGOVqc9AEIQyvyu1i6ypKdFw8R8gQw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.21.3 || >=16"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@noble/curves": {
      "version": "1.9.7",
      "resolved": "https://registry.npmjs.org/@noble/curves/-/curves-1.9.7.tgz",
      "integrity": "sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "1.8.0"
      },
      "engines": {
        "node": "^14.21.3 || >=16"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@noble/hashes": {
      "version": "1.8.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz",
      "integrity": "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.21.3 || >=16"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.147.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.147.0.tgz",
      "integrity": "sha512-IJ3s6ltHLp45S0bh7phkX+gJO7A1Wuz2EaqpAhb8WjqDwbzMiWKHhyyT42tskaWjEYXtHtVCPpnBJVT9+dcRLg==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      }
    },
    "node_modules/@oxlint/binding-android-arm-eabi": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm-eabi/-/binding-android-arm-eabi-1.80.0.tgz",
      "integrity": "sha512-RM3Plj+biQpxa5d1GOOX6ciDlcUROmm4OZ/pLTpitkQt2mJv4jhtY4cbgaetOm5UKWZe05/TGQ6o1Vl8EOHkrA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-android-arm64": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm64/-/binding-android-arm64-1.80.0.tgz",
      "integrity": "sha512-YlO5JEf0Yr2bUUlu8O8daVcUxtcGGbcSmyV7E7nSbJbfAdxTE0PFPwgnIlw7wXJaTYjb+qs5hI5q3jxUkI7cAw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-darwin-arm64": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-arm64/-/binding-darwin-arm64-1.80.0.tgz",
      "integrity": "sha512-BULDOyO3AhsmdWfQeIUCykDt3dd7XZBGLhp1eIh56skRv01O+cNjNPwXMIbeW1x4+pxcln5if72wcRgViVo7PA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-darwin-x64": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-x64/-/binding-darwin-x64-1.80.0.tgz",
      "integrity": "sha512-YJ4JzLw7N5TDSQFlA0hAQGHvnDZgyypm1yunObVWcWiF9KM7eGCJKYKLgTC2Fi/57OdnBhbj4OkzPGdFQJ6HyA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-freebsd-x64": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-freebsd-x64/-/binding-freebsd-x64-1.80.0.tgz",
      "integrity": "sha512-AYUIk5QnL0s8oWAYsREZwkRYy1SupJTXALo93J1TgzHywxQtdM99FecRMQ87MXEdPQ0j1TmEpeeq3fGNkpvMqg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm-gnueabihf": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.80.0.tgz",
      "integrity": "sha512-9hBZVANupQ89W9dXyE0n8doCyaW5pDyGn3y6XlIMPZ+rIKuyqkr3SNUXmVJIhuvUq0NBU3RBiSXXE69l4XI6KA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm-musleabihf": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-musleabihf/-/binding-linux-arm-musleabihf-1.80.0.tgz",
      "integrity": "sha512-SvS2uKqzY+pbfuvAHzH4338R6Zwo805GAwrIMVvK1KxoOWCIjZUdfzTCvilD7z6JK91v011+zYMryabhDo2AsQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm64-gnu": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.80.0.tgz",
      "integrity": "sha512-tCLadyqRVL3pQTRPNg7cjXKvcvS4fbyXeQHhKk5BTJ1oftQln5/yIIWbu/Xom/DX41zv2P9QGt6+D/TtQVtY3A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm64-musl": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.80.0.tgz",
      "integrity": "sha512-XfpCNRlOPcLlJl4Bn/FUhjqlR6BVavEykERBf/MV7YA9VZDa5g5znVqYhyviMafcxS9Pe/i/kPvHNO0U6svEHQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-ppc64-gnu": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.80.0.tgz",
      "integrity": "sha512-3I4yMwcFG9NeO8ioY6JBBuKsIm5GL/x7MATt1S4tVWaxPu5HcJ+XnLUbcVBTxG8q2Wu56HSj+NmXQiVYb1lp6A==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-riscv64-gnu": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-gnu/-/binding-linux-riscv64-gnu-1.80.0.tgz",
      "integrity": "sha512-E1wAKymkpe1/E8helzBKdm81OBOF+ezxRyXRMEuik3ZpWDER5CPOKZwF66RsdwW98uwZv8UTFremUQtC1CzdJA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-riscv64-musl": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-musl/-/binding-linux-riscv64-musl-1.80.0.tgz",
      "integrity": "sha512-+gLRGD4sIo3+VA++iham5UxD9tKSoJ/VOrROCEXIcknrYtQg6iIQgvjN0cpiRF7N6UYC7pJbvHJlDnMge5LRpQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-s390x-gnu": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.80.0.tgz",
      "integrity": "sha512-aR0PrzHj9leW3NmzBAAP4EzdoBNoJcs9sjnIQPIwyRnBGYrRbXUIpEB5Q39AqK3PLY5JK5uEhDQDiUa1QSAstw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-gnu": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.80.0.tgz",
      "integrity": "sha512-vSVh5cSo3Xxs6ghBCcFJlpbkbENzDog1qXtoXLa/HC3aCrR4XO76GZbXmQoCPHnu99nQpdCeC3H9tdNICfDh7A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-musl": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-musl/-/binding-linux-x64-musl-1.80.0.tgz",
      "integrity": "sha512-FfzBXpNQ8u7/ZI/p8bl73MeZ508Ax3hxWp3SiJpEFiC+BB9XcXy5FAZHTLKDPSzrUpxQZSZJAVdDmuJp/+HDBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-openharmony-arm64": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-openharmony-arm64/-/binding-openharmony-arm64-1.80.0.tgz",
      "integrity": "sha512-zMzbkumtmprCgRwoYNzcB3iC39fXdJIMLMU33KdCjEGLlJGOEt1+LwQ4LF8ndLzAEKVz4BR0y3V6Xrkk3Nm3yA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-arm64-msvc": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.80.0.tgz",
      "integrity": "sha512-ib6iRcrXsk4t1fm3iKcwksyWh1ZkZXC/2mEzakl0ai2+6HZunf1WWMZ/xP9EJAvw9g9K4UVTC3NF/+G2qLrbTQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-ia32-msvc": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-ia32-msvc/-/binding-win32-ia32-msvc-1.80.0.tgz",
      "integrity": "sha512-xhRWBMpLxZvgKAH6+DJZmpP+W8Y8UdQOSU1JfxSWNXsaBaRGW77j+1hCuNHlzj7OH4SPN8fYd1q0o2qrDtoVyw==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-x64-msvc": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.80.0.tgz",
      "integrity": "sha512-yAnO7lwBYQnz2pcfBPIGQQZWIX5zd5R/1aAKIF3oE+TVj7IhoHcROjOkz3sRDngzqhfPKfFaXqug5j5rE5dn6Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.6.tgz",
      "integrity": "sha512-b+jTcARdTiFLI6jB4a5XjTm0RWd6KcRfQj/I2356fxUZemiho9zQLxo0RtCuMDAyKcLo6cEltkgbQp6d1+sjjQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.6.tgz",
      "integrity": "sha512-lkWU8ZJaRk9q3CIEY1Tc7vIFALp3Xw5NfGJo2hQg5oIqNgxWi1zI+IiDEK3r70BF5Dzol1tcXsnzsRc8NLhG+Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.6.tgz",
      "integrity": "sha512-dgR56NYnvAszm7Ob1B2/Vn0e8bUQYZH2UjVaMMtMVOCKFSfjhfLmuA/9+O+F+ajUdG6B/bSssrKW6JJYASa8jA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.6.tgz",
      "integrity": "sha512-vpVxFvUCFioJqug7OTvqptkc4yb8UX0AwfDmJpaR/0sWz+BUmqSVAf7c8JkUgnN8YLspb4a/N6NhTyMAmdyQ7Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.6.tgz",
      "integrity": "sha512-h1wG6Y6K3JlRswxsI64qQJqBAy4vrLuHgRbc8CZMGSWTOFRY6ghMApM1NKzB2I0n5xV1fjkE18SuVl2QpLeNpA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.6.tgz",
      "integrity": "sha512-tbCiqub0q2MVWJKgF5PoAlNWCtQydiOYSLIkd8sByqK/6MMYLJRcSXSYodqYtd0O+Fw7QaVmKKlS4oL94YRZ0w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.6.tgz",
      "integrity": "sha512-oxK9+baEBPhZG5HB4URY+uU04zJWeZlH6Tb9rB5DK4DF9XR1uXNLXt5Q5ZsugTKayNCNLhkcwz/ye74hRI98dg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.6.tgz",
      "integrity": "sha512-muWCk27FVBEZtv0MsK8gnfSmgczA8KQ0uRVJbTABKhkRfQc38aUrcb7fhi3BNiyseFmgcRsoMfQsSNJ+DbZdSw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.6.tgz",
      "integrity": "sha512-eWDoSfU7Co2qj3vgB3Dt4lj1mG6CoWbcJQkRMP3XJplyCMtuaq3LHvPFjS9QIPvMGWVadJC04Xiy0IdcVPtnwQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.6.tgz",
      "integrity": "sha512-2bWNjRSIayvupRKxXUY2tWG9fYdoUlTqWywHRvE8Eq3GvuQ+f2HeIkve697fIt+IQs/PV8yFsdWuhp1aJ1PdnA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.6.tgz",
      "integrity": "sha512-KekI0gS0wLxe1UBSQSjenBVwou/JkcQPDzBPICGZjxUv9k3RteHDPBQaiOicZUFKRIH2wKEimGwVpnJsbPzu7w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.6.tgz",
      "integrity": "sha512-TvtPnfVr+HtyGiDmPK4VWmlNm7QhNNAcK5Q9A7aOXsI8545yCyaoMaicXrFZ72JzeYjaUVk7yT243zT0jzjFKQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.6.tgz",
      "integrity": "sha512-iOo0VEay2XFhaCcH0sps5XIimkSuOnNaZrf6+ZkoSOQBJPKNU48RkmJv0/lSpipexu5P+ouFgafe5IGr/DiQfg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.6.tgz",
      "integrity": "sha512-y5NTmmasMS455JlOCO4ZM9krIchv3Mvm1crL1iUPGOPgEzSkves9n0SdC5Sjz6+qWDFhd8/JpfWMH8NSWNHe+A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.6.tgz",
      "integrity": "sha512-np8iZSLfXlAD4kWhiyq/u0Yt8oZDtRQ8lGhQaCXo2rl37KNjeU0GjJuwr4P3oeZ++ROfofsKNBqR5LTO8aXyWQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.112.4.tgz",
      "integrity": "sha512-z8DesgwLzKM5PiT0yNmJU8VJyh1zAhYi+20Z7drdJQLXg/wWW4yGt/un+He5ERYUo94Vz66t5aeyr1DIDemI5A==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/cli-darwin-arm64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-darwin-arm64/-/cli-darwin-arm64-2.116.0.tgz",
      "integrity": "sha512-Mvfxf5q7oQ1KR59ndFFyGkh12IfwKH5ZOv7OWtHsFkBuwHtHiJgY6Zwd3w09tnat4spkpDTFavclBlLsOQnh2A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@supabase/cli-darwin-x64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-darwin-x64/-/cli-darwin-x64-2.116.0.tgz",
      "integrity": "sha512-dxKmIPcVunC8sPTuU+eVWj2SOB5tLoRTE5FX6J/KMZhGH03khTn6ptHvaanZp0YwaACbm//uoffUlJKZrAgt0w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@supabase/cli-linux-arm64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-linux-arm64/-/cli-linux-arm64-2.116.0.tgz",
      "integrity": "sha512-ZmV96NQqcgx1MH4jWdfyqqjLghy57mRI5bysy6lM7MezsirQh+eXaOdWI0xCy7r7FA09k2fKLGh+r7r0X3mxBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@supabase/cli-linux-arm64-musl": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-linux-arm64-musl/-/cli-linux-arm64-musl-2.116.0.tgz",
      "integrity": "sha512-6lYrbKFJT5NKbEKGBJTArEc1F3oMfWxnQeq8+RZ4wSLjCq4uwluh6+fzKCsLVxZgPOg4r+RZRqDdb+/cLi0yyg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@supabase/cli-linux-x64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-linux-x64/-/cli-linux-x64-2.116.0.tgz",
      "integrity": "sha512-o0PvHKyQSKEuC3jJqeV2qorgyMIFGDWQ1Bj+OXf0p80ddgktnJFlDElCU+VDKZkuwLC6vO/LMoBql34zFHzXhw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@supabase/cli-linux-x64-musl": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-linux-x64-musl/-/cli-linux-x64-musl-2.116.0.tgz",
      "integrity": "sha512-EtPJPHUvLHvXHkvZHAEr+i6w/bDVm5BOPD+09uXgUffsUbNAzfZ8r7Fb94+SfWI+dQwivw4WmijsX7tlx61Zcg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@supabase/cli-windows-arm64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-windows-arm64/-/cli-windows-arm64-2.116.0.tgz",
      "integrity": "sha512-IiglNMXXssDiZbeSRvixYH7eYDDvhiEa2CrOSj419jO5vLrMKvzi1ATxe8E4i7MpKuI9S5U/3tA3rFlIMHtwrg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@supabase/cli-windows-x64": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/@supabase/cli-windows-x64/-/cli-windows-x64-2.116.0.tgz",
      "integrity": "sha512-pz4zNDs3KCEx0l9JS9Xaiuzd5WXrISajVlBSxC5/2Jyo2+g+N/ftQJDYTHQ6Jir5fNelIqSHIXZelmGds14upw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.112.4.tgz",
      "integrity": "sha512-DQ0aVH8wSQAccVqNoEkec62qCu2QRNyoGN53RqsVZ1k6F1zq4/v8scrlR6LNT2RJmT97apiTmORijPVhErCS2g==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/phoenix": {
      "version": "0.4.5",
      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",
      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",
      "license": "MIT"
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.112.4.tgz",
      "integrity": "sha512-uaubtPSeg2TR4wrtfQoQWgkTAe+a0qWX2KhmwvTfNl5mGN9+U7owiJt6abk3o/V6O899PSRD1yzxs5RlF4xTug==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.112.4.tgz",
      "integrity": "sha512-vZ+j079SKrM0Xiq7MJCvQKLDpaH2kfKfLY68xuQE1sqsCsMmx1CyrDBJHsxZ3cX01VOs5SI9igmoZAF3BmdZxw==",
      "license": "MIT",
      "dependencies": {
        "@supabase/phoenix": "0.4.5",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.112.4.tgz",
      "integrity": "sha512-lQ0JemuTlMIXVKgSci1qez8yPnM5hyDngeAfEBjZS2Om4D+Cus0EE5BE6glFobrxdyii1OF4UzWfF0zcQgDq5A==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.112.4",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.112.4.tgz",
      "integrity": "sha512-UiCX1udlFY1fQQrO7Z3GU7obQsju0w5Vk9mOOwalfo/+Gy+tahWVenSSuu5E/GTy/q//HxvGv2IrCdW66/61kw==",
      "license": "MIT",
      "dependencies": {
        "@supabase/auth-js": "2.112.4",
        "@supabase/functions-js": "2.112.4",
        "@supabase/postgrest-js": "2.112.4",
        "@supabase/realtime-js": "2.112.4",
        "@supabase/storage-js": "2.112.4"
      },
      "engines": {
        "node": ">=22.0.0"
      },
      "peerDependencies": {
        "@opentelemetry/api": ">=1.0.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        }
      }
    },
    "node_modules/@types/react": {
      "version": "19.2.18",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz",
      "integrity": "sha512-AnzbBERsrLKtk2XSfTbYRLjQPdy116Sty4q+T+Bp3IC4l6jNBvreVPAHmpq9qhXQM7CXZPjLVmGMw9sy+hxQ3w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.5",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.5.tgz",
      "integrity": "sha512-fMPwH9v7r/pp43yUd2/Mbiex5KouJwwR3dzHkhLREUC6764VyDsqxhAxv6OFEYR1RhjOyD1naqba8ECDBe7ZQg==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.1.tgz",
      "integrity": "sha512-yxLaQV9gkhS8ezJqCM6+ndU7mDY6gqAg75NQ+0IjwEI8IYOmQCgkRwHKVSfWXW076DsqMo0Dk+0FK1U+M5RgFw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.145.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/eciesjs": {
      "version": "0.5.0",
      "resolved": "https://registry.npmjs.org/eciesjs/-/eciesjs-0.5.0.tgz",
      "integrity": "sha512-s0J9SEVYAEPg7J63GFMApLYzPH9VNIQIyC6s15JpnqVc0TqcKWdbgFlnAweEBRyMmko2dcs2sfC83Hj4J43tuA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@ecies/ciphers": "^0.2.6",
        "@noble/ciphers": "^1.3.0",
        "@noble/curves": "^1.9.7",
        "@noble/hashes": "^1.8.0"
      },
      "engines": {
        "bun": ">=1",
        "deno": ">=2.7.10",
        "node": ">=16"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/jose": {
      "version": "6.2.10",
      "resolved": "https://registry.npmjs.org/jose/-/jose-6.2.10.tgz",
      "integrity": "sha512-iiW7J9qRFlGxvCOIBDBDxFePQSn7ZMAnrYGhrrOo6siO/MIqwfyilLR27pkfDgUk+raLuzADS8A3S/KLBisc0g==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/panva"
      }
    },
    "node_modules/jsbarcode": {
      "version": "3.12.1",
      "resolved": "https://registry.npmjs.org/jsbarcode/-/jsbarcode-3.12.1.tgz",
      "integrity": "sha512-QZQSqIknC2Rr/YOUyOkCBqsoiBAOTYK+7yNN3JsqfoUtJtkazxNw1dmPpxuv7VVvqW13kA3/mKiLq+s/e3o9hQ==",
      "license": "MIT"
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.37.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.37.0.tgz",
      "integrity": "sha512-LPsB4rD1TD6wZu1djKOf9vUnS1jTNaHbolXebXDgiTdb6jeA1agIJhJsIybCmjKmQClcOaal1o1OaiYahEftyQ==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.18",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/oxlint": {
      "version": "1.80.0",
      "resolved": "https://registry.npmjs.org/oxlint/-/oxlint-1.80.0.tgz",
      "integrity": "sha512-5nTiSps4qdbCWLbxzuO00alHkEO2exR9YMN/ig6QXWrLsYSG0KaObOAM+l6oU2LcKPWoSAGYbkZIGEu1ViiWKA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "oxlint": "bin/oxlint"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      },
      "optionalDependencies": {
        "@oxlint/binding-android-arm-eabi": "1.80.0",
        "@oxlint/binding-android-arm64": "1.80.0",
        "@oxlint/binding-darwin-arm64": "1.80.0",
        "@oxlint/binding-darwin-x64": "1.80.0",
        "@oxlint/binding-freebsd-x64": "1.80.0",
        "@oxlint/binding-linux-arm-gnueabihf": "1.80.0",
        "@oxlint/binding-linux-arm-musleabihf": "1.80.0",
        "@oxlint/binding-linux-arm64-gnu": "1.80.0",
        "@oxlint/binding-linux-arm64-musl": "1.80.0",
        "@oxlint/binding-linux-ppc64-gnu": "1.80.0",
        "@oxlint/binding-linux-riscv64-gnu": "1.80.0",
        "@oxlint/binding-linux-riscv64-musl": "1.80.0",
        "@oxlint/binding-linux-s390x-gnu": "1.80.0",
        "@oxlint/binding-linux-x64-gnu": "1.80.0",
        "@oxlint/binding-linux-x64-musl": "1.80.0",
        "@oxlint/binding-openharmony-arm64": "1.80.0",
        "@oxlint/binding-win32-arm64-msvc": "1.80.0",
        "@oxlint/binding-win32-ia32-msvc": "1.80.0",
        "@oxlint/binding-win32-x64-msvc": "1.80.0"
      },
      "peerDependencies": {
        "oxlint-tsgolint": ">=7.0.2001",
        "vite-plus": "*"
      },
      "peerDependenciesMeta": {
        "oxlint-tsgolint": {
          "optional": true
        },
        "vite-plus": {
          "optional": true
        }
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.26",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.17",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.8.tgz",
      "integrity": "sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.8.tgz",
      "integrity": "sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.27.0"
      },
      "peerDependencies": {
        "react": "^19.2.8"
      }
    },
    "node_modules/react-router": {
      "version": "7.18.3",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.18.3.tgz",
      "integrity": "sha512-gyXgtdr5uACJ5b1Q4udzjVV+tb/rlHIMJKuJ0e89R4Kzgz47z/rgP0dIKxktqIEUhDHluGTPJJH/wRha7CyqsA==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.18.3",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.18.3.tgz",
      "integrity": "sha512-ytVbyBBM7vMfRCam25r0WMhSVSom909A8p+8m0/f1w853dz/xfFu6etAT2SEbVoSnI+ZoPRDqIsQXVT89gp7kg==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.18.3"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.6.tgz",
      "integrity": "sha512-vMM4q3aixf46GiF1Kok8jDPFsEpXgFWGjUHXNkNHNm+Y2adXAG2dbX91jkti3i0ZRsOlcmbuzAz1poObSHCmUA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.147.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.6",
        "@rolldown/binding-android-arm64": "1.2.6",
        "@rolldown/binding-darwin-arm64": "1.2.6",
        "@rolldown/binding-darwin-x64": "1.2.6",
        "@rolldown/binding-freebsd-x64": "1.2.6",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.6",
        "@rolldown/binding-linux-arm64-gnu": "1.2.6",
        "@rolldown/binding-linux-arm64-musl": "1.2.6",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.6",
        "@rolldown/binding-linux-s390x-gnu": "1.2.6",
        "@rolldown/binding-linux-x64-gnu": "1.2.6",
        "@rolldown/binding-linux-x64-musl": "1.2.6",
        "@rolldown/binding-openharmony-arm64": "1.2.6",
        "@rolldown/binding-win32-arm64-msvc": "1.2.6",
        "@rolldown/binding-win32-x64-msvc": "1.2.6"
      }
    },
    "node_modules/scheduler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
      "license": "MIT"
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/supabase": {
      "version": "2.116.0",
      "resolved": "https://registry.npmjs.org/supabase/-/supabase-2.116.0.tgz",
      "integrity": "sha512-cMUHkpjBacq4oLGWnMM2HC2drmUlAlfN/PQb31RARoIdYJ8sqA0xONvqBR6yd5v7w8dXuCPwvfd4N1NTHjBKEw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eciesjs": "^0.5.0",
        "jose": "^6.2.9"
      },
      "bin": {
        "supabase": "dist/supabase.js"
      },
      "optionalDependencies": {
        "@supabase/cli-darwin-arm64": "2.116.0",
        "@supabase/cli-darwin-x64": "2.116.0",
        "@supabase/cli-linux-arm64": "2.116.0",
        "@supabase/cli-linux-arm64-musl": "2.116.0",
        "@supabase/cli-linux-x64": "2.116.0",
        "@supabase/cli-linux-x64-musl": "2.116.0",
        "@supabase/cli-windows-arm64": "2.116.0",
        "@supabase/cli-windows-x64": "2.116.0"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/vite": {
      "version": "8.2.2",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.2.2.tgz",
      "integrity": "sha512-cFKLV/PRgAUlIRm5WjMjJ86jrftzpqcgH+Us+DS8mI3CDNiH30Whrz8uHL3+MOLPAgqbMBAqWdAHAphOAM+z/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.5",
        "postcss": "^8.5.26",
        "rolldown": "~1.2.4",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.4.0 || ^0.5.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    }
  }
}
```

### `package.json`

```json
{
  "name": "wineshoppos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.4",
    "jsbarcode": "^3.12.1",
    "lucide-react": "^1.37.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "supabase": "^2.116.0",
    "vite": "^8.2.2"
  }
}
```

### `src/App.jsx`

```javascript
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ModuleLayout from "./components/ModuleLayout";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
import HomeRedirect from "./components/HomeRedirect";
import { MODULE_TABS } from "./config/navigation";

import Login from "./pages/Login";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import SaleDetails from "./pages/SaleDetails";
import Returns from "./pages/Returns";
import Shifts from "./pages/Shifts";
import ScannerSettings from "./pages/ScannerSettings";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import BarcodeLabels from "./pages/BarcodeLabels";
import Purchases from "./pages/Purchases";
import Procurement from "./pages/Procurement";
import PurchaseIntelligence from "./pages/PurchaseIntelligence";
import Inventory from "./pages/Inventory";
import StockCount from "./pages/StockCount";
import Transfers from "./pages/Transfers";
import InventoryIntelligence from "./pages/InventoryIntelligence";
import Expenses from "./pages/Expenses";
import Approvals from "./pages/Approvals";
import CustomerCredit from "./pages/CustomerCredit";
import OfflineQueue from "./pages/OfflineQueue";
import OwnerCenter from "./pages/OwnerCenter";
import OwnerProfit from "./pages/OwnerProfit";
import OwnerExceptions from "./pages/OwnerExceptions";
import Recommendations from "./pages/Recommendations";
import OwnerWhatsApp from "./pages/OwnerWhatsApp";
import ReportsConsolidated from "./pages/ReportsConsolidated";
import Compliance from "./pages/Compliance";
import Users from "./pages/Users";
import AccessControl from "./pages/AccessControl";
import HardwareSetup from "./pages/HardwareSetup";
import PrinterSettings from "./pages/PrinterSettings";
import BackupRecovery from "./pages/BackupRecovery";
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";
import Account from "./pages/Account";

function module(title, subtitle, tabs) {
  return <ModuleLayout title={title} subtitle={subtitle} tabs={tabs}/>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>

    <Route element={<RequireAuth/>}>
      <Route element={<Layout/>}>
        <Route index element={<HomeRedirect/>}/>
        <Route path="account" element={<Account/>}/>

        <Route path="pos" element={module("POS & Billing", "Scan → Cart → Pay → Print. Operational distractions stay outside the cashier flow.", MODULE_TABS.pos)}>
          <Route index element={<POS/>}/>
          <Route path="sales" element={<Sales/>}/>
          <Route path="returns" element={<Returns/>}/>
          <Route path="shifts" element={<Shifts/>}/>
          <Route path="scanner" element={<ScannerSettings/>}/>
        </Route>

        {/* Current POS/Sales code already navigates to /sales/:id. Keep it stable. */}
        <Route path="sales/:id" element={<SaleDetails/>}/>

        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
          <Route path="products" element={module("Products", "Product master, barcode configuration and physical label printing.", MODULE_TABS.products)}>
            <Route index element={<Products/>}/>
            <Route path="new" element={<AddProduct/>}/>
            <Route path=":id/edit" element={<EditProduct/>}/>
            <Route path="labels" element={<BarcodeLabels/>}/>
          </Route>

          <Route path="purchasing" element={module("Purchases & Suppliers", "Receive goods, control procurement and understand supplier/purchase cost changes.", MODULE_TABS.purchasing)}>
            <Route index element={<Navigate to="receive" replace/>}/>
            <Route path="receive" element={<Purchases/>}/>
            <Route path="procurement" element={<Procurement/>}/>
            <Route path="intelligence" element={<PurchaseIntelligence/>}/>
          </Route>

          <Route path="inventory" element={module("Inventory", "Current stock, physical count, inter-branch movement and inventory intelligence.", MODULE_TABS.inventory)}>
            <Route index element={<Inventory/>}/>
            <Route path="count" element={<StockCount/>}/>
            <Route path="transfers" element={<Transfers/>}/>
            <Route path="intelligence" element={<InventoryIntelligence/>}/>
          </Route>
        </Route>

        <Route path="operations" element={module("Operations", "Day-to-day shifts and reliability, with management controls shown only to authorized roles.", MODULE_TABS.operations)}>
          <Route index element={<Navigate to="shifts" replace/>}/>
          <Route path="shifts" element={<Shifts/>}/>
          <Route path="offline" element={<OfflineQueue/>}/>
          <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
            <Route path="expenses" element={<Expenses/>}/>
            <Route path="approvals" element={<Approvals/>}/>
            <Route path="customers" element={<CustomerCredit/>}/>
          </Route>
        </Route>

        <Route element={<RequireRole roles={["ADMIN"]}/>}> 
          <Route path="owner" element={module("Owner Center", "Business health, profitability, risk and recommended next actions in one place.", MODULE_TABS.owner)}>
            <Route index element={<OwnerCenter/>}/>
            <Route path="recommendations" element={<Recommendations/>}/>
            <Route path="share" element={<OwnerWhatsApp/>}/>
            <Route path="profit" element={<OwnerProfit/>}/>
            <Route path="exceptions" element={<OwnerExceptions/>}/>
          </Route>
        </Route>

        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}> 
          <Route path="reports" element={module("Reports & Compliance", "Operational exports plus a safe foundation for verified liquor-compliance requirements.", MODULE_TABS.reports)}>
            <Route index element={<ReportsConsolidated/>}/>
            <Route path="compliance" element={<Compliance/>}/>
          </Route>
        </Route>

        <Route element={<RequireRole roles={["ADMIN"]}/>}> 
          <Route path="admin" element={module("Settings & Admin", "Users, devices, backup/recovery, audit and shop administration.", MODULE_TABS.admin)}>
            <Route index element={<Navigate to="users" replace/>}/>
            <Route path="users" element={<Users/>}/>
            <Route path="access" element={<AccessControl/>}/>
            <Route path="hardware" element={<HardwareSetup/>}/>
            <Route path="hardware/scanner" element={<ScannerSettings/>}/>
            <Route path="hardware/printer" element={<PrinterSettings/>}/>
            <Route path="backup" element={<BackupRecovery/>}/>
            <Route path="audit" element={<Audit/>}/>
            <Route path="settings" element={<Settings/>}/>
          </Route>
        </Route>

        {/* Legacy route compatibility: preserve old bookmarks while moving navigation. */}
        <Route path="shifts" element={<Navigate to="/operations/shifts" replace/>}/>
        <Route path="returns" element={<Navigate to="/pos/returns" replace/>}/>
        <Route path="sales" element={<Navigate to="/pos/sales" replace/>}/>
        <Route path="scanner-settings" element={<Navigate to="/pos/scanner" replace/>}/>
        <Route path="offline-queue" element={<Navigate to="/operations/offline" replace/>}/>
        <Route path="stock-count" element={<Navigate to="/inventory/count" replace/>}/>
        <Route path="purchases" element={<Navigate to="/purchasing/receive" replace/>}/>
        <Route path="procurement" element={<Navigate to="/purchasing/procurement" replace/>}/>
        <Route path="price-history" element={<Navigate to="/purchasing/intelligence" replace/>}/>
        <Route path="reorder" element={<Navigate to="/inventory/intelligence" replace/>}/>
        <Route path="transfers" element={<Navigate to="/inventory/transfers" replace/>}/>
        <Route path="automation" element={<Navigate to="/purchasing/intelligence" replace/>}/>
        <Route path="users" element={<Navigate to="/admin/users" replace/>}/>
        <Route path="audit" element={<Navigate to="/admin/audit" replace/>}/>
        <Route path="printer-settings" element={<Navigate to="/admin/hardware/printer" replace/>}/>
        <Route path="settings" element={<Navigate to="/admin/settings" replace/>}/>

        <Route path="*" element={<HomeRedirect/>}/>
      </Route>
    </Route>
  </Routes>;
}
```

### `src/components/HomeRedirect.jsx`

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function HomeRedirect() {
  const { profile } = useAuth();
  return <Navigate to={profile?.role === "CASHIER" ? "/pos" : "/owner"} replace/>;
}
```

### `src/components/Layout.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Wine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import OfflineStatus from "./OfflineStatus";
import ShopSelector from "./ShopSelector";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { watchThemePreference } from "../lib/theme";
import { MAIN_MODULES } from "../config/navigation";

const COLLAPSE_KEY = "wineshop_sidebar_collapsed_v1";

function pageMeta(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { title: "WineShopPOS", crumbs: [] };
  const labels = {
    pos: "POS & Billing", products: "Products", purchasing: "Purchases & Suppliers",
    inventory: "Inventory", operations: "Operations", owner: "Owner Center",
    reports: "Reports & Compliance", admin: "Settings & Admin", account: "My Account",
    sales: "Sales", returns: "Returns & Voids", shifts: "Shift & Day Close", scanner: "Scanner",
    labels: "Barcode Labels", receive: "Receive Stock", procurement: "Procurement", intelligence: "Intelligence",
    count: "Stock Count", transfers: "Transfers", expenses: "Expenses", approvals: "Approvals",
    customers: "Customer & Credit", offline: "Offline Queue", profit: "Profit Intelligence",
    exceptions: "Loss & Exceptions", recommendations: "Recommendations", share: "WhatsApp Summary",
    compliance: "Liquor Compliance", users: "Users", access: "Access Control", hardware: "Hardware", backup: "Backup & Recovery",
    settings: "Settings", printer: "Printer",
  };
  const crumbs = parts.map((part) => labels[part] || part.replaceAll("-", " "));
  return { title: crumbs.at(-1), crumbs };
}

export default function Layout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
  const meta = useMemo(() => pageMeta(location.pathname), [location.pathname]);

  useEffect(() => localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"), [collapsed]);
  useEffect(() => watchThemePreference(() => profile?.theme || "SYSTEM"), [profile?.theme]);

  return <div className={collapsed ? "app-shell sidebar-collapsed" : "app-shell"}>
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Wine size={24}/></div>
        {!collapsed ? <div><div className="brand-name">WineShop POS</div><div className="brand-subtitle">Retail Management</div></div> : null}
      </div>
      <nav className="nav-menu" aria-label="Main navigation">
        {MAIN_MODULES.filter((item) => item.roles.includes(profile?.role)).map((item) => {
          const Icon = item.icon;
          return <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} title={collapsed ? item.label : undefined}>
            <Icon size={19}/>{!collapsed ? <span>{item.label}</span> : null}
          </NavLink>;
        })}
      </nav>
      <button className="sidebar-collapse" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeftOpen size={18}/> : <><PanelLeftClose size={18}/><span>Collapse</span></>}
      </button>
    </aside>

    <main className="main-area">
      <header className="topbar consolidated-topbar">
        <div className="topbar-page-context">
          <button className="mobile-sidebar-toggle" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle navigation"><PanelLeftOpen size={19}/></button>
          <div><h1>{meta.title}</h1><div className="breadcrumbs">{meta.crumbs.map((crumb, index) => <span key={`${crumb}-${index}`}>{index ? <ChevronRight size={13}/> : null}{crumb}</span>)}</div></div>
        </div>
        <div className="topbar-actions"><ShopSelector/><OfflineStatus/><ThemeToggle/><UserMenu/></div>
      </header>
      <div className="page-area"><Outlet/></div>
    </main>
  </div>;
}
```

### `src/components/ModuleLayout.jsx`

```javascript
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeatureTierBadge from "./ui/FeatureTierBadge";

export default function ModuleLayout({ title, subtitle, tabs = [] }) {
  const { profile } = useAuth();
  const visible = tabs.filter((tab) => tab.roles?.includes(profile?.role));
  return <div className="module-shell">
    <div className="module-heading"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    {visible.length > 1 ? <nav className="module-tabs" aria-label={`${title} navigation`}>
      {visible.map((tab) => <NavLink key={tab.path} to={tab.path} end={tab.end ?? true} className={({ isActive }) => isActive ? "module-tab active" : "module-tab"}>
        <span>{tab.label}</span><FeatureTierBadge tier={tab.tier}/>
      </NavLink>)}
    </nav> : null}
    <div className="module-content"><Outlet/></div>
  </div>;
}
```

### `src/components/ShopSelector.jsx`

```javascript
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ShopSelector() {
  const { profile, refreshAccess } = useAuth();
  const [shops, setShops] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.rpc("my_shop_memberships").then(({ data }) => { if (alive) setShops(data || []); });
    return () => { alive = false; };
  }, [profile?.shop_id]);

  async function change(shopId) {
    if (!shopId || shopId === profile?.shop_id) return;
    setBusy(true);
    const { error } = await supabase.rpc("switch_shop", { p_shop_id: shopId });
    if (!error) {
      await refreshAccess();
      window.location.assign("#/owner");
      window.location.reload();
    }
    setBusy(false);
  }

  if (profile?.role === "CASHIER" || shops.length <= 1) return <div className="shop-context-pill"><Store size={15}/><span>{profile?.shop_name || "Shop"}</span></div>;
  return <label className="shop-selector"><Store size={15}/><span className="sr-only">Current shop</span><select value={profile?.shop_id || ""} disabled={busy} onChange={(e) => change(e.target.value)}>{shops.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}</select></label>;
}
```

### `src/components/ThemeToggle.jsx`

```javascript
import { useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { notifyThemePreference, normalizeTheme } from "../lib/theme";

const ORDER = ["LIGHT", "DARK", "SYSTEM"];
const ICONS = { LIGHT: Sun, DARK: Moon, SYSTEM: Laptop };
const LABELS = { LIGHT: "Light theme", DARK: "Dark theme", SYSTEM: "System theme" };

export default function ThemeToggle() {
  const { profile, refreshAccess } = useAuth();
  const [busy, setBusy] = useState(false);
  const current = normalizeTheme(profile?.theme);
  const Icon = ICONS[current];

  async function cycleTheme() {
    if (busy) return;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    notifyThemePreference(next);
    setBusy(true);
    const { error } = await supabase.rpc("update_my_theme", { p_theme: next });
    if (!error) await refreshAccess();
    else notifyThemePreference(current);
    setBusy(false);
  }

  return <button className="theme-toggle" type="button" onClick={cycleTheme} disabled={busy} title={`${LABELS[current]} · click to change`} aria-label={`${LABELS[current]}. Click to change theme.`}>
    <Icon size={17}/><span>{current === "SYSTEM" ? "Auto" : current[0] + current.slice(1).toLowerCase()}</span>
  </button>;
}
```

### `src/components/UserMenu.jsx`

```javascript
import { useEffect, useRef, useState } from "react";
import { CircleHelp, LogOut, Settings, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./ui/UserAvatar";
import StatusBadge from "./ui/StatusBadge";
import { APP_VERSION } from "../config/featureCatalog";

export default function UserMenu() {
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const click = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  function go(path) { setOpen(false); navigate(path); }

  return <div className="user-menu" ref={ref}>
    <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <UserAvatar profile={profile}/><div className="user-menu-trigger-text"><strong>{profile?.full_name || "User"}</strong><span>{profile?.role || ""}</span></div>
    </button>
    {open ? <div className="user-menu-popover">
      <div className="user-menu-summary"><UserAvatar profile={profile} size="lg"/><div><strong>{profile?.full_name || "User"}</strong><span>{profile?.email || user?.email || ""}</span><div className="summary-badges"><StatusBadge status={profile?.role}/></div></div></div>
      <div className="user-menu-shop"><strong>{profile?.shop_name || "Shop"}</strong><span>{profile?.organization_name || "Organization"}</span></div>
      <button onClick={() => go("/account")}><UserRound size={16}/> My Profile</button>
      <button onClick={() => go("/account?tab=settings")}><Settings size={16}/> Account Settings</button>
      <button onClick={() => go("/account?tab=security")}><Shield size={16}/> Security</button>
      <button onClick={() => go("/account?tab=about")}><CircleHelp size={16}/> Help / About <small>{APP_VERSION}</small></button>
      <div className="user-menu-divider"/>
      <button className="logout-menu-button" onClick={signOut}><LogOut size={16}/> Logout</button>
    </div> : null}
  </div>;
}
```

### `src/components/charts/BusinessCharts.jsx`

```javascript
import { useId } from "react";

// Power BI-inspired categorical palette: strong, readable, restrained.
const PALETTE = ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#197278", "#D64550"];

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDefault(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeNumber(value));
}

function EmptyChart({ message = "Not enough data yet" }) {
  return <div className="chart-empty">{message}</div>;
}

export function LineChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
  const gradientId = useId().replaceAll(":", "");
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
  if (!rows.length) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;

  const width = 680; const height = 230; const left = 28; const right = 18; const top = 20; const bottom = 34;
  const values = rows.map((row) => safeNumber(row[valueKey]));
  const max = Math.max(...values, 0); const min = Math.min(...values, 0); const spread = Math.max(1, max - min);
  const x = (index) => rows.length === 1 ? width / 2 : left + index * ((width - left - right) / (rows.length - 1));
  const y = (value) => top + (max - value) / spread * (height - top - bottom);
  const points = rows.map((row, index) => `${x(index)},${y(safeNumber(row[valueKey]))}`).join(" ");
  const areaPoints = `${left},${height-bottom} ${points} ${x(rows.length-1)},${height-bottom}`;
  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  const last = rows[rows.length - 1];

  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div><strong>{formatValue(last[valueKey])}</strong></div>
    <div className="line-chart" role="img" aria-label={`${title}. Latest value ${formatValue(last[valueKey])}.`}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#118DFF" stopOpacity="0.24"/><stop offset="100%" stopColor="#118DFF" stopOpacity="0"/></linearGradient></defs>
        {[0, .5, 1].map((ratio) => <line key={ratio} x1={left} x2={width-right} y1={top + ratio*(height-top-bottom)} y2={top + ratio*(height-top-bottom)} className="chart-grid-line"/>)}
        <polygon points={areaPoints} fill={`url(#${gradientId})`}/>
        <polyline points={points} className="chart-line-path"/>
        {rows.map((row, index) => index === rows.length-1 || index % Math.max(1, Math.ceil(rows.length/8)) === 0 ? <circle key={index} cx={x(index)} cy={y(safeNumber(row[valueKey]))} r="3.2" className="chart-line-point"><title>{row[labelKey]}: {formatValue(row[valueKey])}</title></circle> : null)}
      </svg>
      <div className="chart-axis-labels">{labelIndexes.map((index) => <span key={index} style={{ left: `${x(index)/width*100}%` }}>{rows[index]?.[labelKey]}</span>)}</div>
    </div>
  </section>;
}

export function DonutChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, centerLabel = "Total" }) {
  const rows = data.filter((row) => safeNumber(row?.[valueKey]) > 0);
  const total = rows.reduce((sum, row) => sum + safeNumber(row[valueKey]), 0);
  if (!total) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  let cursor = 0;
  const stops = rows.map((row, index) => { const start = cursor; cursor += safeNumber(row[valueKey]) / total * 100; return `${PALETTE[index % PALETTE.length]} ${start}% ${cursor}%`; });
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="donut-layout">
      <div className="donut-chart" style={{ background: `conic-gradient(${stops.join(",")})` }} role="img" aria-label={`${title}. ${rows.map((row)=>`${row[labelKey]} ${formatValue(row[valueKey])}`).join(", ")}.`}><div className="donut-hole"><span>{centerLabel}</span><strong>{formatValue(total)}</strong></div></div>
      <div className="chart-legend">{rows.map((row,index)=><div key={`${row[labelKey]}-${index}`}><i style={{ background: PALETTE[index % PALETTE.length] }}/><span>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div>)}</div>
    </div>
  </section>;
}

export function HorizontalBarChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, limit = 7 }) {
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey]))).slice(0, limit);
  const max = Math.max(...rows.map((row) => safeNumber(row[valueKey])), 0);
  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="horizontal-bars" role="img" aria-label={title}>{rows.map((row,index)=><div className="horizontal-bar-row" key={`${row[labelKey]}-${index}`}><div className="horizontal-bar-meta"><span title={row[labelKey]}>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div><div className="horizontal-bar-track"><div className="horizontal-bar-fill" style={{ width: `${Math.max(3, safeNumber(row[valueKey])/max*100)}%`, background: PALETTE[index % PALETTE.length] }}/></div></div>)}</div>
  </section>;
}

export function ColumnChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
  const max = Math.max(...rows.map((row) => Math.abs(safeNumber(row[valueKey]))), 0);
  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="column-chart" role="img" aria-label={title}>{rows.map((row,index)=>{
      const value=safeNumber(row[valueKey]);
      return <div className="column-item" key={`${row[labelKey]}-${index}`} title={`${row[labelKey]}: ${formatValue(value)}`}>
        <div className="column-value">{formatValue(value)}</div>
        <div className="column-track"><div className={`column-fill ${value<0?"negative":""}`} style={{height:`${Math.max(6,Math.abs(value)/max*100)}%`,background:value<0?"#D64550":PALETTE[index%PALETTE.length]}}/></div>
        <div className="column-label">{row[labelKey]}</div>
      </div>;
    })}</div>
  </section>;
}
```

### `src/components/ui/ActionMenu.jsx`

```javascript
import {useEffect,useRef,useState} from "react";
export default function ActionMenu({actions=[]}){const[open,setOpen]=useState(false);const ref=useRef(null);useEffect(()=>{const fn=e=>{if(!ref.current?.contains(e.target))setOpen(false)};document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn)},[]);return <div className="action-menu" ref={ref}><button className="icon-button" onClick={()=>setOpen(v=>!v)} aria-label="More actions">•••</button>{open?<div className="action-menu-popover">{actions.filter(a=>!a.hidden).map((a,i)=><button key={i} onClick={()=>{setOpen(false);a.onClick?.()}} disabled={a.disabled}>{a.label}</button>)}</div>:null}</div>}
```

### `src/components/ui/ConfirmationDialog.jsx`

```javascript
export default function ConfirmationDialog({open,title,message,confirmLabel="Confirm",onConfirm,onCancel,busy=false}){if(!open)return null;return <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}><div className="dialog-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()}><h3>{title}</h3><p>{message}</p><div className="button-row"><button className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-button" onClick={onConfirm} disabled={busy}>{busy?"Working...":confirmLabel}</button></div></div></div>}
```

### `src/components/ui/EmptyState.jsx`

```javascript
export default function EmptyState({ title, message, action }) {
  return <div className="state-card empty-state"><strong>{title}</strong>{message ? <p>{message}</p> : null}{action}</div>;
}
```

### `src/components/ui/ErrorState.jsx`

```javascript
export default function ErrorState({ message = "Unable to load this information. Please retry." }) {
  return <div className="state-card error-state"><strong>Something needs attention</strong><p>{message}</p></div>;
}
```

### `src/components/ui/FeatureTierBadge.jsx`

```javascript
export default function FeatureTierBadge({ tier }) {
  if (!tier) return null;
  return <span className={`feature-tier-badge tier-${String(tier).toLowerCase()}`}>{tier}</span>;
}
```

### `src/components/ui/LoadingState.jsx`

```javascript
export default function LoadingState({ label = "Loading..." }) {
  return <div className="state-card loading-state"><span className="state-spinner" /> <span>{label}</span></div>;
}
```

### `src/components/ui/MetricCard.jsx`

```javascript
export default function MetricCard({ label, value, helper, tone = "default" }) {
  return <div className={`metric-card metric-${tone}`}><span>{label}</span><strong>{value}</strong>{helper ? <small>{helper}</small> : null}</div>;
}
```

### `src/components/ui/MoneyDisplay.jsx`

```javascript
const formatter=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function MoneyDisplay({value=0}){return <span>{formatter.format(Number(value||0))}</span>}
```

### `src/components/ui/PageHeader.jsx`

```javascript
import FeatureTierBadge from "./FeatureTierBadge";
export default function PageHeader({ title, subtitle, tier, actions }) {
  return <div className="page-header-standard"><div><div className="page-title-row"><h2>{title}</h2><FeatureTierBadge tier={tier}/></div>{subtitle ? <p>{subtitle}</p> : null}</div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}
```

### `src/components/ui/QuantityDisplay.jsx`

```javascript
export default function QuantityDisplay({value=0,unit="bottles"}){return <span>{Number(value||0).toLocaleString("en-IN")} {unit}</span>}
```

### `src/components/ui/SearchFilterBar.jsx`

```javascript
export default function SearchFilterBar({value,onChange,placeholder="Search...",children}){return <div className="filter-bar"><input value={value} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}/>{children}</div>}
```

### `src/components/ui/SectionHeader.jsx`

```javascript
export default function SectionHeader({title,subtitle,actions}){return <div className="section-row"><div><h3>{title}</h3>{subtitle?<p className="muted-text">{subtitle}</p>:null}</div>{actions?<div className="page-actions">{actions}</div>:null}</div>}
```

### `src/components/ui/StatusBadge.jsx`

```javascript
export default function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").replaceAll("_", " ");
  return <span className={`status-badge status-${String(status || "unknown").toLowerCase().replaceAll("_", "-")}`}>{value}</span>;
}
```

### `src/components/ui/UserAvatar.jsx`

```javascript
export default function UserAvatar({ profile, size = "md" }) {
  const name = profile?.full_name || "User";
  if (profile?.avatar_url) return <img className={`user-avatar avatar-${size}`} src={profile.avatar_url} alt={`${name} profile`} />;
  return <div className={`user-avatar avatar-${size} avatar-fallback`} aria-label={`${name} profile`}>{name.slice(0, 1).toUpperCase()}</div>;
}
```

### `src/config/accessMatrix.js`

```javascript
export const ROLE_ACCESS_ROWS = [
  { capability: "POS billing", cashier: "USE", manager: "USE", admin: "USE", note: "Scan/search, cart and checkout." },
  { capability: "Own sales & receipt", cashier: "USE", manager: "USE", admin: "USE", note: "Cashier sales are limited by current backend policy." },
  { capability: "Return request", cashier: "REQUEST", manager: "APPROVE", admin: "APPROVE", note: "Cashier can request; approval remains management-controlled." },
  { capability: "Shift / day close", cashier: "OWN", manager: "MANAGE", admin: "MANAGE", note: "Cashier works own shift; management reviews discrepancies." },
  { capability: "Products & pricing", cashier: "VIEW IN POS", manager: "EDIT", admin: "EDIT", note: "Cashier cannot change product master or purchase cost." },
  { capability: "Purchases & suppliers", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Receiving and procurement are management functions." },
  { capability: "Inventory / stock count", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Stock-changing operations stay controlled/RPC-backed." },
  { capability: "Stock transfer", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Organization-safe transfer workflow." },
  { capability: "Expenses", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Feeds business profitability." },
  { capability: "Customer & credit", cashier: "NO", manager: "MANAGE", admin: "MANAGE", note: "Normal checkout keeps customer capture optional." },
  { capability: "Approvals", cashier: "NO", manager: "OPERATIONS", admin: "ALL", note: "Sensitive decisions remain manager/admin controlled." },
  { capability: "Reports & compliance", cashier: "NO", manager: "VIEW/EXPORT", admin: "VIEW/EXPORT", note: "Compliance remains configuration-only until verified." },
  { capability: "Owner Center / profit / loss", cashier: "NO", manager: "NO", admin: "ADMIN ONLY", note: "Protected in navigation, routes and backend RPCs." },
  { capability: "Users & role changes", cashier: "NO", manager: "NO", admin: "MANAGE", note: "Admin can set staff as Cashier or Manager only." },
  { capability: "Shop settings", cashier: "NO", manager: "NO", admin: "EDIT", note: "Commercial/subscription kill switch remains platform-controlled." },
  { capability: "Backup / audit / hardware admin", cashier: "NO", manager: "NO", admin: "MANAGE", note: "Hardware scanner test remains available from POS scanner screen." },
];

export const ROLE_SUMMARY = {
  CASHIER: "Fast selling role: bill, scan, own shift, permitted sales/returns and offline queue. No master-data or financial administration.",
  MANAGER: "Operational management role: products, purchases, inventory, stock counts/transfers, expenses, approvals and reports. No Owner Center or user/shop administration.",
  ADMIN: "Shop owner/admin role: all shop-authorized functionality including Owner Center, users, role changes, shop settings, backup and audit.",
};
```

### `src/config/featureCatalog.js`

```javascript
export const FEATURE_TIERS = Object.freeze({
  smart_purchase_intelligence: "PRO",
  inventory_intelligence: "PRO",
  owner_control_center: "PRO",
  profit_intelligence: "PRO",
  audit_loss_control: "PRO",
  smart_recommendations: "PLUS",
  advanced_procurement: "PLUS",
  advanced_transfers: "PLUS",
  owner_whatsapp_summary: "PLUS",
  customer_credit: "PLUS",
});

export const APP_VERSION = "2026.08-master-consolidation";

export function featureTier(featureKey) {
  return FEATURE_TIERS[featureKey] || null;
}
```

### `src/config/navigation.js`

```javascript
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Package,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react";

export const MAIN_MODULES = [
  { path: "/pos", label: "POS & Billing", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { path: "/products", label: "Products", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { path: "/purchasing", label: "Purchases & Suppliers", icon: Store, roles: ["ADMIN", "MANAGER"] },
  { path: "/inventory", label: "Inventory", icon: Boxes, roles: ["ADMIN", "MANAGER"] },
  { path: "/operations", label: "Operations", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { path: "/owner", label: "Owner Center", icon: Building2, roles: ["ADMIN"] },
  { path: "/reports", label: "Reports & Compliance", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { path: "/admin", label: "Settings & Admin", icon: Settings, roles: ["ADMIN"] },
];

export const MODULE_TABS = {
  pos: [
    { path: "/pos", label: "Billing", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos/sales", label: "Sales", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos/returns", label: "Returns & Voids", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos/shifts", label: "Shift", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos/scanner", label: "Scanner", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  ],
  products: [
    { path: "/products", label: "Product Master", roles: ["ADMIN", "MANAGER"] },
    { path: "/products/labels", label: "Barcode Labels", roles: ["ADMIN", "MANAGER"] },
  ],
  purchasing: [
    { path: "/purchasing/receive", label: "Receive Stock", roles: ["ADMIN", "MANAGER"] },
    { path: "/purchasing/procurement", label: "Procurement", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/purchasing/intelligence", label: "Purchase Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
  ],
  inventory: [
    { path: "/inventory", label: "Overview", roles: ["ADMIN", "MANAGER"] },
    { path: "/inventory/count", label: "Stock Count", roles: ["ADMIN", "MANAGER"] },
    { path: "/inventory/transfers", label: "Transfers", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/inventory/intelligence", label: "Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
  ],
  operations: [
    { path: "/operations/shifts", label: "Shift & Day Close", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/operations/expenses", label: "Expenses", roles: ["ADMIN", "MANAGER"] },
    { path: "/operations/approvals", label: "Approvals", roles: ["ADMIN", "MANAGER"] },
    { path: "/operations/customers", label: "Customer & Credit", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/operations/offline", label: "Offline Queue", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  ],
  owner: [
    { path: "/owner", label: "Overview", roles: ["ADMIN"], tier: "PRO" },
    { path: "/owner/profit", label: "Profit Intelligence", roles: ["ADMIN"], tier: "PRO" },
    { path: "/owner/exceptions", label: "Loss & Exceptions", roles: ["ADMIN"], tier: "PRO" },
    { path: "/owner/recommendations", label: "Recommendations", roles: ["ADMIN"], tier: "PLUS" },
    { path: "/owner/share", label: "WhatsApp Summary", roles: ["ADMIN"], tier: "PLUS" },
  ],
  reports: [
    { path: "/reports", label: "Reports & Exports", roles: ["ADMIN", "MANAGER"] },
    { path: "/reports/compliance", label: "Liquor Compliance", roles: ["ADMIN", "MANAGER"] },
  ],
  admin: [
    { path: "/admin/users", label: "Users", roles: ["ADMIN"] },
    { path: "/admin/access", label: "Access Control", roles: ["ADMIN"] },
    { path: "/admin/hardware", label: "Hardware", roles: ["ADMIN"] },
    { path: "/admin/backup", label: "Backup & Recovery", roles: ["ADMIN"] },
    { path: "/admin/audit", label: "Audit Log", roles: ["ADMIN"] },
    { path: "/admin/settings", label: "Shop Settings", roles: ["ADMIN"] },
  ],
};
```

### `src/lib/theme.js`

```javascript
const THEME_EVENT = "wineshop-theme-change";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function normalizeTheme(value) {
  const theme = String(value || "SYSTEM").toUpperCase();
  return ["SYSTEM", "LIGHT", "DARK"].includes(theme) ? theme : "SYSTEM";
}

export function resolvedTheme(value) {
  const preference = normalizeTheme(value);
  if (preference === "SYSTEM") {
    return typeof window !== "undefined" && window.matchMedia?.(MEDIA_QUERY).matches ? "dark" : "light";
  }
  return preference.toLowerCase();
}

export function applyThemePreference(value) {
  if (typeof document === "undefined") return;
  const preference = normalizeTheme(value);
  document.documentElement.dataset.themePreference = preference.toLowerCase();
  document.documentElement.dataset.theme = resolvedTheme(preference);
}

export function notifyThemePreference(value) {
  applyThemePreference(value);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: normalizeTheme(value) } }));
  }
}

export function watchThemePreference(getPreference) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia?.(MEDIA_QUERY);
  const sync = () => applyThemePreference(getPreference?.() || "SYSTEM");
  const onSystemChange = () => { if (normalizeTheme(getPreference?.()) === "SYSTEM") sync(); };
  const onCustom = (event) => applyThemePreference(event?.detail?.theme || getPreference?.() || "SYSTEM");
  sync();
  media?.addEventListener?.("change", onSystemChange);
  window.addEventListener(THEME_EVENT, onCustom);
  return () => {
    media?.removeEventListener?.("change", onSystemChange);
    window.removeEventListener(THEME_EVENT, onCustom);
  };
}
```

### `src/main.jsx`

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { ScannerProvider } from "./context/ScannerContext";
import "./index.css";
import "./chapters9to12.css";
import "./chapters16to26.css";
import "./masterConsolidation.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ScannerProvider>
          <ShopProvider><App/></ShopProvider>
        </ScannerProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
```

### `src/masterConsolidation.css`

```css
/* WineShopPOS Master Reconsolidation — UX layer only. Existing transaction styles remain available. */
:root {
  --ws-bg: #f6f7f9;
  --ws-surface: #ffffff;
  --ws-surface-muted: #f1f3f5;
  --ws-text: #1f2937;
  --ws-muted: #667085;
  --ws-border: #e4e7ec;
  --ws-accent: #6f243d;
  --ws-accent-strong: #55192e;
  --ws-success: #16794b;
  --ws-warning: #9a6700;
  --ws-danger: #b42318;
  --ws-shadow: 0 8px 24px rgba(16,24,40,.06);
}

html[data-theme="dark"] {
  --ws-bg: #111318;
  --ws-surface: #181b22;
  --ws-surface-muted: #232733;
  --ws-text: #f3f4f6;
  --ws-muted: #a7adba;
  --ws-border: #303542;
  --ws-shadow: none;
}
html[data-theme="dark"] body { background: var(--ws-bg); color: var(--ws-text); }
html[data-theme="dark"] .panel,
html[data-theme="dark"] .metric-card,
html[data-theme="dark"] .state-card,
html[data-theme="dark"] .user-menu-popover,
html[data-theme="dark"] .quick-action,
html[data-theme="dark"] .recommendation-card { background: var(--ws-surface); color: var(--ws-text); border-color: var(--ws-border); }
html[data-theme="dark"] input,
html[data-theme="dark"] select,
html[data-theme="dark"] textarea { background: var(--ws-surface-muted); color: var(--ws-text); border-color: var(--ws-border); }

.app-shell { background: var(--ws-bg); }
.app-shell.sidebar-collapsed { grid-template-columns: 76px 1fr; }
.sidebar { min-width: 0; }
.sidebar-collapse { margin: auto 12px 14px; min-height: 38px; border: 1px solid rgba(255,255,255,.15); background: transparent; color: inherit; border-radius: 8px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; }
.sidebar-collapsed .brand { justify-content:center; }
.nav-menu { overflow-y:auto; }
.consolidated-topbar { display:flex; align-items:center; justify-content:space-between; gap:18px; }
.topbar-page-context, .topbar-actions, .breadcrumbs, .breadcrumbs span, .section-row, .button-row, .page-title-row, .page-header-standard, .filter-bar { display:flex; align-items:center; }
.topbar-page-context { gap:12px; min-width:0; }
.topbar-page-context h1 { margin:0; font-size:18px; line-height:1.2; color:var(--ws-text); }
.topbar-actions { gap:10px; }
.breadcrumbs { gap:4px; flex-wrap:wrap; margin-top:4px; color:var(--ws-muted); font-size:12px; }
.breadcrumbs span { gap:4px; text-transform:capitalize; }
.mobile-sidebar-toggle { display:none; border:0; background:transparent; cursor:pointer; }

.shop-context-pill,.shop-selector,.offline-pill { display:flex; align-items:center; gap:7px; min-height:36px; padding:0 10px; border:1px solid var(--ws-border); border-radius:8px; background:var(--ws-surface); color:var(--ws-text); font-size:12px; }
.shop-selector select { border:0; min-height:auto; padding:0; max-width:160px; background:transparent; color:inherit; }

.user-menu { position:relative; }
.user-menu-trigger { border:0; background:transparent; display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--ws-text); }
.user-menu-trigger-text { display:grid; text-align:left; line-height:1.2; }
.user-menu-trigger-text strong { font-size:12px; }
.user-menu-trigger-text span { font-size:10px; color:var(--ws-muted); }
.user-menu-popover { position:absolute; right:0; top:calc(100% + 9px); z-index:50; width:300px; padding:10px; border:1px solid var(--ws-border); border-radius:12px; background:var(--ws-surface); box-shadow:var(--ws-shadow); }
.user-menu-popover > button { width:100%; border:0; background:transparent; color:var(--ws-text); display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:7px; text-align:left; cursor:pointer; }
.user-menu-popover > button:hover { background:var(--ws-surface-muted); }
.user-menu-popover > button small { margin-left:auto; color:var(--ws-muted); }
.user-menu-summary { display:flex; gap:11px; padding:8px; }
.user-menu-summary > div { display:grid; gap:3px; }
.user-menu-summary span { font-size:11px; color:var(--ws-muted); }
.user-menu-shop { padding:9px; margin:4px 0 7px; border-radius:8px; background:var(--ws-surface-muted); display:grid; }
.user-menu-shop span { font-size:11px; color:var(--ws-muted); }
.user-menu-divider { border-top:1px solid var(--ws-border); margin:6px 0; }
.logout-menu-button { color:var(--ws-danger)!important; }
.user-avatar { object-fit:cover; border-radius:50%; flex:0 0 auto; }
.avatar-md { width:34px; height:34px; }
.avatar-lg { width:48px; height:48px; }
.avatar-xl { width:76px; height:76px; font-size:28px; }
.avatar-fallback { display:grid; place-items:center; background:var(--ws-accent); color:#fff; font-weight:800; }

.module-shell { min-width:0; }
.module-heading { margin:0 0 12px; }
.module-heading h1 { margin:0; font-size:20px; color:var(--ws-text); }
.module-heading p { margin:4px 0 0; color:var(--ws-muted); max-width:820px; }
.module-tabs { display:flex; gap:2px; overflow:auto; border-bottom:1px solid var(--ws-border); margin-bottom:18px; scrollbar-width:thin; }
.module-tab { flex:0 0 auto; border:0; border-bottom:2px solid transparent; padding:9px 11px; display:flex; align-items:center; gap:6px; text-decoration:none; color:var(--ws-muted); background:transparent; cursor:pointer; font-size:13px; }
.module-tab.active { color:var(--ws-accent); border-bottom-color:var(--ws-accent); font-weight:700; }
.feature-tier-badge { display:inline-flex; align-items:center; height:18px; padding:0 6px; border-radius:999px; font-size:9px; font-weight:800; letter-spacing:.06em; border:1px solid var(--ws-border); }
.tier-pro { background:#f4ecff; color:#6941c6; border-color:#e9d7fe; }
.tier-plus { background:#ecfdf3; color:#067647; border-color:#abefc6; }

.page-header-standard { justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:15px; }
.page-title-row { gap:8px; }
.page-header-standard h2 { margin:0; font-size:20px; color:var(--ws-text); }
.page-header-standard p { margin:4px 0 0; color:var(--ws-muted); max-width:780px; }
.page-actions { display:flex; gap:8px; flex-wrap:wrap; }
.section-row { justify-content:space-between; gap:12px; }
.section-row > label { min-width:180px; }
.button-row { gap:8px; }
.button-row.wrap { flex-wrap:wrap; }
.button-row.compact button { min-height:30px; padding:5px 8px; font-size:11px; }
.filter-bar { gap:12px; flex-wrap:wrap; }
.filter-bar label { display:flex; align-items:center; gap:7px; }
.muted-text { color:var(--ws-muted); font-size:12px; }
.big-number { font-size:28px; font-weight:800; margin-top:8px; }

.metric-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.metric-grid.four { grid-template-columns:repeat(4,minmax(0,1fr)); }
.metric-card { border:1px solid var(--ws-border); border-radius:10px; padding:14px; background:var(--ws-surface); display:grid; gap:4px; }
.metric-card span { color:var(--ws-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; }
.metric-card strong { font-size:21px; color:var(--ws-text); }
.metric-card small { color:var(--ws-muted); }

.status-badge,.priority { display:inline-flex; align-items:center; white-space:nowrap; border-radius:999px; padding:3px 7px; font-size:10px; font-weight:800; background:#f2f4f7; color:#344054; }
.status-approved,.status-active,.status-completed,.status-received,.status-pass { background:#ecfdf3; color:#067647; }
.status-pending,.status-requested,.status-approval-pending,.status-in-transit,.status-partially-received { background:#fffaeb; color:#b54708; }
.status-rejected,.status-cancelled,.status-void,.status-fail,.status-out-of-stock { background:#fef3f2; color:#b42318; }
.priority.high { background:#fef3f2; color:#b42318; }
.priority.medium { background:#fffaeb; color:#b54708; }
.priority.low { background:#eff8ff; color:#175cd3; }

.state-card { padding:18px; border:1px dashed var(--ws-border); border-radius:10px; background:var(--ws-surface); text-align:center; color:var(--ws-muted); }
.state-card strong { display:block; color:var(--ws-text); margin-bottom:4px; }
.state-spinner { display:inline-block; width:16px; height:16px; border:2px solid var(--ws-border); border-top-color:var(--ws-accent); border-radius:50%; animation:ws-spin .8s linear infinite; }
@keyframes ws-spin { to { transform:rotate(360deg); } }

.quick-action-grid,.capability-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:16px; }
.quick-action,.capability-card { text-decoration:none; color:var(--ws-text); display:flex; gap:11px; padding:14px; border:1px solid var(--ws-border); border-radius:10px; background:var(--ws-surface); }
.quick-action { display:grid; }
.quick-action span,.capability-card span { color:var(--ws-muted); font-size:12px; }
.capability-card div { display:grid; gap:4px; }

.recommendation-list { display:grid; gap:10px; }
.recommendation-card,.recommendation-row { display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid var(--ws-border); padding:11px 0; }
.recommendation-card { border:1px solid var(--ws-border); border-radius:10px; padding:13px; }
.recommendation-row { text-decoration:none; color:var(--ws-text); }
.recommendation-row p,.recommendation-card p { margin:3px 0 0; color:var(--ws-muted); font-size:12px; }
.share-preview { white-space:pre-wrap; background:var(--ws-surface-muted); border:1px solid var(--ws-border); padding:15px; border-radius:8px; line-height:1.7; font-family:inherit; }

.movement-breakdown { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:9px; margin-top:10px; }
.movement-chip { border:1px solid var(--ws-border); border-radius:8px; padding:10px; display:grid; gap:3px; }
.movement-chip span { color:var(--ws-muted); font-size:11px; }
.movement-chip strong { font-size:18px; }
.movement-chip small { color:var(--ws-muted); }

.profile-summary-card { display:flex; gap:16px; align-items:flex-start; }
.profile-summary-card > div { display:grid; gap:5px; }
.profile-summary-card h3,.profile-summary-card p { margin:0; }
.compact-form { max-width:620px; display:grid; gap:12px; }
.account-tabs { margin-bottom:16px; }
.runbook-list { padding-left:20px; line-height:1.7; }
textarea { min-height:86px; resize:vertical; }
.icon-button { border:0; background:transparent; cursor:pointer; font-size:18px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

.data-table.sticky thead th { position:sticky; top:0; z-index:1; background:var(--ws-surface); }
.data-table-wrapper { max-width:100%; overflow:auto; }

/* barcode label printing */
.barcode-label-workspace { display:grid; grid-template-columns:minmax(280px,360px) 1fr; gap:16px; }
.barcode-label-preview { display:flex; flex-wrap:wrap; align-items:flex-start; gap:8px; }
.barcode-label { width:50mm; min-height:30mm; border:1px dashed #999; background:#fff; color:#111; display:grid; place-items:center; align-content:center; padding:2mm; text-align:center; break-inside:avoid; }
.barcode-label strong { font-size:10px; line-height:1.1; }
.barcode-label svg { max-width:100%; height:auto; }

@media (max-width: 1100px) {
  .metric-grid.four { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .consolidated-topbar { align-items:flex-start; }
  .user-menu-trigger-text { display:none; }
}
@media (max-width: 800px) {
  .app-shell,.app-shell.sidebar-collapsed { grid-template-columns:68px 1fr; }
  .app-shell .sidebar .brand > div:not(.brand-icon), .app-shell .nav-item span, .sidebar-collapse span { display:none; }
  .app-shell .brand,.app-shell .nav-item { justify-content:center; }
  .topbar-actions .shop-context-pill span { display:none; }
  .page-area { padding-left:12px; padding-right:12px; }
  .quick-action-grid,.capability-grid,.barcode-label-workspace { grid-template-columns:1fr; }
}
@media (max-width: 600px) {
  .metric-grid,.metric-grid.four { grid-template-columns:1fr; }
  .consolidated-topbar { flex-direction:column; }
  .topbar-actions { width:100%; justify-content:flex-end; }
  .module-tabs { margin-left:-12px; margin-right:-12px; padding-left:12px; }
}

@media print {
  .barcode-label-only .sidebar,.barcode-label-only .topbar,.barcode-label-only .module-heading,.barcode-label-only .module-tabs,.barcode-label-only .no-print { display:none!important; }
  .barcode-label-only .main-area,.barcode-label-only .page-area { padding:0!important; margin:0!important; }
  .barcode-label { border:0; }
}
.dialog-backdrop{position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:100;display:grid;place-items:center;padding:20px}.dialog-card{width:min(440px,100%);background:var(--ws-surface);color:var(--ws-text);border-radius:12px;border:1px solid var(--ws-border);box-shadow:var(--ws-shadow);padding:18px}.dialog-card h3{margin-top:0}.action-menu{position:relative;display:inline-block}.action-menu-popover{position:absolute;right:0;top:100%;z-index:20;min-width:150px;border:1px solid var(--ws-border);border-radius:8px;background:var(--ws-surface);box-shadow:var(--ws-shadow);padding:5px}.action-menu-popover button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:7px;border-radius:5px;color:var(--ws-text)}.action-menu-popover button:hover{background:var(--ws-surface-muted)}.barcode-label-sheet{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}.barcode-label-sheet .barcode-label{break-inside:avoid}@media print{.sidebar,.topbar,.module-heading,.module-tabs,.no-print{display:none!important}.app-shell,.app-shell.sidebar-collapsed{display:block!important}.main-area,.page-area,.module-content{margin:0!important;padding:0!important}.barcode-label-sheet{gap:0}.barcode-label{border:0}}

/* ============================================================
   MODERN BUSINESS UI — POWER BI-INSPIRED INFORMATION DESIGN
   Loaded after legacy styles so the existing engine receives a
   consistent modern visual layer without a backend rewrite.
   ============================================================ */
:root,
html[data-theme="light"] {
  color-scheme: light;
  --ws-bg:#f4f6fa;
  --ws-surface:#ffffff;
  --ws-surface-muted:#f7f9fc;
  --ws-surface-raised:#ffffff;
  --ws-text:#172033;
  --ws-muted:#697386;
  --ws-border:#e3e8f0;
  --ws-accent:#118DFF;
  --ws-accent-strong:#0b6fd3;
  --ws-accent-soft:#eaf5ff;
  --ws-success:#138a5b;
  --ws-warning:#b7791f;
  --ws-danger:#d64550;
  --ws-sidebar:#111827;
  --ws-sidebar-muted:#94a3b8;
  --ws-sidebar-active:#1f2937;
  --ws-shadow:0 8px 26px rgba(16,24,40,.07);
  --ws-shadow-soft:0 2px 10px rgba(16,24,40,.05);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --ws-bg:#0b1020;
  --ws-surface:#111827;
  --ws-surface-muted:#172033;
  --ws-surface-raised:#141d2e;
  --ws-text:#f4f7fb;
  --ws-muted:#9aa7b8;
  --ws-border:#28354b;
  --ws-accent:#49a6ff;
  --ws-accent-strong:#79bbff;
  --ws-accent-soft:#102c47;
  --ws-success:#49b98b;
  --ws-warning:#e0a84a;
  --ws-danger:#f26b74;
  --ws-sidebar:#060a13;
  --ws-sidebar-muted:#8fa0b5;
  --ws-sidebar-active:#172033;
  --ws-shadow:0 12px 30px rgba(0,0,0,.22);
  --ws-shadow-soft:0 4px 14px rgba(0,0,0,.18);
}

html, body, #root { min-height:100%; }
body { margin:0; background:var(--ws-bg)!important; color:var(--ws-text)!important; font-family:"Segoe UI",Inter,system-ui,-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }
.app-shell { min-height:100vh; background:var(--ws-bg)!important; color:var(--ws-text); }
.main-area,.page-area,.module-shell,.module-content { background:var(--ws-bg); color:var(--ws-text); }
.page-area { padding-top:22px; }

.sidebar { background:var(--ws-sidebar)!important; border-right:1px solid rgba(255,255,255,.07); box-shadow:8px 0 28px rgba(15,23,42,.08); }
.brand { border-bottom:1px solid rgba(255,255,255,.08); }
.brand-icon { background:#118DFF!important; box-shadow:0 5px 16px rgba(17,141,255,.28); }
.brand-name { color:#fff!important; letter-spacing:-.01em; }
.brand-subtitle { color:var(--ws-sidebar-muted)!important; }
.nav-item { margin:3px 10px; border-radius:9px!important; color:#c7d2e0!important; border-left:0!important; transition:background .14s ease,color .14s ease,transform .14s ease; }
.nav-item:hover { background:rgba(255,255,255,.07)!important; color:#fff!important; }
.nav-item.active { background:var(--ws-sidebar-active)!important; color:#fff!important; box-shadow:inset 3px 0 0 #118DFF; }
.sidebar-collapse { color:#c7d2e0; }
.sidebar-collapse:hover { background:rgba(255,255,255,.06); }

.topbar { background:color-mix(in srgb,var(--ws-surface) 94%,transparent)!important; color:var(--ws-text)!important; border-bottom:1px solid var(--ws-border)!important; box-shadow:0 1px 0 rgba(16,24,40,.02); backdrop-filter:blur(12px); }
.topbar-page-context h1 { font-weight:700; letter-spacing:-.015em; }
.breadcrumbs { color:var(--ws-muted)!important; }
.theme-toggle { min-height:36px; padding:0 10px; border:1px solid var(--ws-border); border-radius:9px; background:var(--ws-surface); color:var(--ws-text); display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; font-weight:600; }
.theme-toggle:hover { border-color:#118DFF; background:var(--ws-accent-soft); }
.theme-toggle:disabled { opacity:.6; cursor:wait; }

.panel,.metric-card,.chart-card,.quick-action,.capability-card,.state-card,.dialog-card,.user-menu-popover,.recommendation-card {
  background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid var(--ws-border)!important; box-shadow:var(--ws-shadow-soft); border-radius:14px!important;
}
.panel { padding:18px!important; }
.panel h2,.panel h3,.panel h4,.quick-action strong,.capability-card strong { color:var(--ws-text); }
.panel p,.quick-action span,.capability-card span { color:var(--ws-muted); }

.page-header-standard h2,.module-heading h1 { font-weight:750; letter-spacing:-.025em; }
.module-heading p,.page-header-standard p { color:var(--ws-muted); }
.module-tabs { gap:4px; padding:0 2px; }
.module-tab { border-radius:8px 8px 0 0; font-weight:600; }
.module-tab:hover { background:var(--ws-surface-muted); color:var(--ws-text); }
.module-tab.active { color:var(--ws-accent); background:var(--ws-accent-soft); border-bottom-color:var(--ws-accent); }

.primary-button,.secondary-button,.danger-button,button.primary-button,button.secondary-button,a.primary-button,a.secondary-button {
  min-height:38px; border-radius:9px!important; font-weight:650; transition:transform .12s ease,box-shadow .12s ease,background .12s ease; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px;
}
.primary-button { background:var(--ws-accent)!important; color:#fff!important; border:1px solid var(--ws-accent)!important; box-shadow:0 3px 10px rgba(17,141,255,.2); }
.primary-button:hover { background:var(--ws-accent-strong)!important; transform:translateY(-1px); }
.secondary-button { background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid var(--ws-border)!important; }
.secondary-button:hover { background:var(--ws-surface-muted)!important; border-color:#b8c4d5!important; }
.button-link { padding:0 13px; }

input,select,textarea { background:var(--ws-surface)!important; color:var(--ws-text)!important; border:1px solid #cfd7e3!important; border-radius:9px!important; outline:none; transition:border-color .12s ease,box-shadow .12s ease; }
html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea { border-color:var(--ws-border)!important; }
input:focus,select:focus,textarea:focus { border-color:var(--ws-accent)!important; box-shadow:0 0 0 3px color-mix(in srgb,var(--ws-accent) 16%,transparent)!important; }
input:disabled,select:disabled,textarea:disabled { background:var(--ws-surface-muted)!important; color:var(--ws-muted)!important; opacity:1; }
label { color:var(--ws-text); font-weight:600; }
label small { display:block; margin-top:5px; color:var(--ws-muted); font-weight:400; }

.data-table-wrapper { border:1px solid var(--ws-border); border-radius:12px; background:var(--ws-surface); }
.data-table { width:100%; border-collapse:separate!important; border-spacing:0!important; background:transparent!important; color:var(--ws-text)!important; }
.data-table th { background:var(--ws-surface-muted)!important; color:#566176!important; font-size:11px; text-transform:uppercase; letter-spacing:.035em; font-weight:750; border-bottom:1px solid var(--ws-border)!important; }
html[data-theme="dark"] .data-table th { color:#aeb8c8!important; }
.data-table td { color:var(--ws-text)!important; border-bottom:1px solid var(--ws-border)!important; }
.data-table tbody tr:last-child td { border-bottom:0!important; }
.data-table tbody tr:hover td { background:color-mix(in srgb,var(--ws-accent) 4%,var(--ws-surface))!important; }

.metric-card { position:relative; overflow:hidden; min-height:98px; padding:16px 16px 14px!important; }
.metric-card::before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--metric-accent,#118DFF); }
.metric-card span { text-transform:none!important; letter-spacing:0!important; font-size:12px!important; font-weight:650!important; }
.metric-card strong { font-size:24px!important; font-weight:760; letter-spacing:-.025em; }
.metric-card small { font-size:11px; }
.metric-accent-blue { --metric-accent:#118DFF; }.metric-accent-indigo { --metric-accent:#12239E; }.metric-accent-green { --metric-accent:#197278; }.metric-accent-orange { --metric-accent:#E66C37; }.metric-accent-red { --metric-accent:#D64550; }

/* Power BI-inspired chart cards */
.dashboard-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.dashboard-chart-grid.primary { grid-template-columns:minmax(0,1.65fr) minmax(320px,.85fr); }
.chart-card { padding:17px; min-height:320px; }
.chart-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
.chart-heading h3 { margin:0; font-size:15px; letter-spacing:-.01em; }
.chart-heading p { margin:4px 0 0; color:var(--ws-muted); font-size:12px; }
.chart-heading > strong { font-size:16px; color:var(--ws-text); }
.chart-empty { min-height:220px; display:grid; place-items:center; color:var(--ws-muted); border:1px dashed var(--ws-border); border-radius:10px; background:var(--ws-surface-muted); }
.line-chart { position:relative; height:245px; padding-bottom:26px; }
.line-chart svg { width:100%; height:100%; overflow:visible; }
.chart-grid-line { stroke:var(--ws-border); stroke-width:1; vector-effect:non-scaling-stroke; }
.chart-line-path { fill:none; stroke:#118DFF; stroke-width:3; vector-effect:non-scaling-stroke; stroke-linejoin:round; stroke-linecap:round; }
.chart-line-point { fill:#fff; stroke:#118DFF; stroke-width:2; vector-effect:non-scaling-stroke; }
html[data-theme="dark"] .chart-line-point { fill:var(--ws-surface); }
.chart-axis-labels { position:absolute; left:0; right:0; bottom:0; height:22px; color:var(--ws-muted); font-size:10px; }
.chart-axis-labels span { position:absolute; transform:translateX(-50%); white-space:nowrap; }
.donut-layout { min-height:235px; display:grid; grid-template-columns:190px 1fr; gap:20px; align-items:center; }
.donut-chart { width:180px; height:180px; border-radius:50%; display:grid; place-items:center; margin:auto; box-shadow:inset 0 0 0 1px rgba(0,0,0,.03); }
.donut-hole { width:104px; height:104px; border-radius:50%; background:var(--ws-surface); display:grid; place-items:center; align-content:center; box-shadow:0 0 0 1px var(--ws-border); }
.donut-hole span { color:var(--ws-muted); font-size:11px; }.donut-hole strong { font-size:18px; }
.chart-legend { display:grid; gap:9px; }.chart-legend>div { display:grid; grid-template-columns:9px 1fr auto; gap:8px; align-items:center; font-size:12px; }.chart-legend i { width:9px; height:9px; border-radius:2px; }.chart-legend span { color:var(--ws-muted); }.chart-legend strong { color:var(--ws-text); }
.horizontal-bars { display:grid; gap:12px; padding-top:2px; }.horizontal-bar-row { display:grid; gap:5px; }.horizontal-bar-meta { display:flex; justify-content:space-between; gap:12px; font-size:12px; }.horizontal-bar-meta span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--ws-text); }.horizontal-bar-meta strong { color:var(--ws-muted); font-weight:650; }.horizontal-bar-track { height:10px; background:var(--ws-surface-muted); border-radius:999px; overflow:hidden; }.horizontal-bar-fill { height:100%; border-radius:999px; }
.column-chart { min-height:230px; display:flex; align-items:stretch; justify-content:space-around; gap:10px; padding:10px 4px 0; border-bottom:1px solid var(--ws-border); }.column-item { min-width:58px; flex:1; max-width:110px; display:grid; grid-template-rows:24px 1fr 34px; text-align:center; gap:4px; }.column-value { font-size:10px; color:var(--ws-muted); overflow:hidden; text-overflow:ellipsis; }.column-track { display:flex; align-items:flex-end; justify-content:center; min-height:155px; }.column-fill { width:min(46px,70%); border-radius:5px 5px 0 0; min-height:6px; }.column-fill.negative { opacity:.9; }.column-label { font-size:10px; color:var(--ws-muted); line-height:1.2; display:grid; place-items:start center; }
.attention-card { min-height:320px; }.attention-metrics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }.attention-metrics>div { padding:14px; border:1px solid var(--ws-border); background:var(--ws-surface-muted); border-radius:10px; display:grid; gap:5px; }.attention-metrics span { color:var(--ws-muted); font-size:11px; }.attention-metrics strong { font-size:20px; }

/* Settings / role administration */
.settings-section { height:fit-content; }.settings-section-heading { margin-bottom:14px; }.settings-section-heading h3 { margin:0; }.settings-section-heading p { margin:4px 0 0; font-size:12px; color:var(--ws-muted); }
.settings-fields { display:grid!important; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px!important; }.settings-fields label { display:grid; gap:6px; }.settings-fields .span-two { grid-column:1/-1; }
.settings-inline-row { display:flex; align-items:end; gap:18px; flex-wrap:wrap; }.toggle-field { display:flex!important; flex-direction:row!important; align-items:center; gap:9px; min-height:40px; }.toggle-field input { width:18px; height:18px; box-shadow:none!important; }
.settings-action-bar { position:sticky; bottom:12px; z-index:10; margin-top:16px; padding:12px 14px; border:1px solid var(--ws-border); border-radius:12px; background:color-mix(in srgb,var(--ws-surface) 94%,transparent); backdrop-filter:blur(12px); box-shadow:var(--ws-shadow); display:flex; align-items:center; justify-content:space-between; gap:16px; color:var(--ws-muted); font-size:12px; }
.settings-action-bar strong { color:var(--ws-text); }
.role-summary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }.role-summary-card { display:flex; gap:12px; }.role-summary-card h3,.role-summary-card p { margin:0; }.role-summary-card p { margin-top:5px; font-size:12px; line-height:1.5; }.role-orb { width:42px; height:42px; border-radius:11px; display:grid; place-items:center; flex:0 0 auto; }.role-orb.cashier { background:#eaf5ff; color:#118DFF; }.role-orb.manager { background:#f0edff; color:#744EC2; }.role-orb.admin { background:#fff1e9; color:#E66C37; }
.access-chip { display:inline-flex; gap:5px; align-items:center; border-radius:999px; padding:4px 7px; font-size:9px; font-weight:750; white-space:nowrap; }.access-chip.allowed { color:#087a51; background:#e8f8f1; }.access-chip.denied { color:#a12d37; background:#fff0f1; }
html[data-theme="dark"] .access-chip.allowed { color:#66d3a9; background:#10352a; } html[data-theme="dark"] .access-chip.denied { color:#ff9da4; background:#421f25; }
.access-matrix th:nth-child(1){min-width:180px}.access-matrix th:nth-child(5){min-width:280px}.access-safety-note { display:flex; gap:12px; align-items:flex-start; }.access-safety-note p { margin:4px 0 0; }.role-rule-list { display:grid; gap:11px; margin:14px 0; }.role-rule-list>div { display:grid; grid-template-columns:90px 1fr; gap:10px; align-items:start; }.role-rule-list span:last-child { color:var(--ws-muted); font-size:12px; line-height:1.5; }.role-select { min-width:120px; }
.about-faith-line { margin-top:18px!important; font-size:16px; color:var(--ws-accent)!important; }

.product-not-found { background:color-mix(in srgb,var(--ws-danger) 8%,var(--ws-surface))!important; border-color:color-mix(in srgb,var(--ws-danger) 55%,var(--ws-border))!important; }
.purchase-message { border-radius:10px!important; }
.share-preview { background:var(--ws-surface-muted)!important; }

@media(max-width:1150px){.dashboard-chart-grid.primary,.dashboard-chart-grid{grid-template-columns:1fr}.role-summary-grid{grid-template-columns:1fr}.settings-action-bar{position:static;flex-direction:column;align-items:flex-start}.settings-action-bar .button-row{width:100%;}}
@media(max-width:760px){.settings-fields{grid-template-columns:1fr}.settings-fields .span-two{grid-column:auto}.donut-layout{grid-template-columns:1fr}.dashboard-chart-grid{grid-template-columns:1fr}.theme-toggle span{display:none}.chart-card{min-height:280px}.role-rule-list>div{grid-template-columns:1fr}.column-chart{overflow-x:auto;justify-content:flex-start}.column-item{min-width:76px}.metric-card strong{font-size:22px!important}}
```

### `src/pages/AccessControl.jsx`

```javascript
import { Link } from "react-router-dom";
import { Check, Eye, LockKeyhole, ShieldCheck, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { ROLE_ACCESS_ROWS, ROLE_SUMMARY } from "../config/accessMatrix";

function AccessCell({ value }) {
  const denied = value === "NO";
  const Icon = denied ? X : value === "VIEW IN POS" || value === "VIEW/EXPORT" ? Eye : value.includes("ADMIN") ? LockKeyhole : Check;
  return <span className={denied ? "access-chip denied" : "access-chip allowed"}><Icon size={13}/>{value}</span>;
}

export default function AccessControl() {
  return <div>
    <PageHeader title="Role Access Control" subtitle="Authoritative role boundaries for Cashier, Manager and Shop Admin. Change a user's role from Users; ADMIN itself remains platform-controlled."/>
    <div className="role-summary-grid">
      {Object.entries(ROLE_SUMMARY).map(([role, text]) => <section className="panel role-summary-card" key={role}><div className={`role-orb ${role.toLowerCase()}`}><ShieldCheck size={20}/></div><div><h3>{role}</h3><p>{text}</p></div></section>)}
    </div>
    <section className="panel" style={{marginTop:16}}>
      <div className="section-row"><div><h3>Access Matrix</h3><p className="muted-text">Roles are security boundaries, not just hidden menu items. Backend RLS/RPC checks remain authoritative.</p></div><Link className="primary-button button-link" to="/admin/users">Manage Users</Link></div>
      <div className="data-table-wrapper access-matrix-wrap"><table className="data-table access-matrix"><thead><tr><th>Capability</th><th>Cashier</th><th>Manager</th><th>Shop Admin</th><th>Control</th></tr></thead><tbody>{ROLE_ACCESS_ROWS.map((row)=><tr key={row.capability}><td><strong>{row.capability}</strong></td><td><AccessCell value={row.cashier}/></td><td><AccessCell value={row.manager}/></td><td><AccessCell value={row.admin}/></td><td className="muted-text">{row.note}</td></tr>)}</tbody></table></div>
    </section>
    <section className="panel access-safety-note" style={{marginTop:16}}><LockKeyhole size={20}/><div><strong>Security rule</strong><p>A Shop Admin can move a non-admin staff account between CASHIER and MANAGER, or disable it. A Shop Admin cannot create/promote another ADMIN, change the platform-owned subscription kill switch, or bypass Supabase security.</p></div></section>
  </div>;
}
```

### `src/pages/Account.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import UserAvatar from "../components/ui/UserAvatar";
import StatusBadge from "../components/ui/StatusBadge";
import { APP_VERSION } from "../config/featureCatalog";
import { notifyThemePreference } from "../lib/theme";

export default function Account() {
  const { profile, user, refreshAccess } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const [form, setForm] = useState({ fullName: "", phone: "", avatarUrl: "", theme: "SYSTEM" });
  const [password, setPassword] = useState({ next: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setForm({ fullName: profile?.full_name || "", phone: profile?.phone || "", avatarUrl: profile?.avatar_url || "", theme: profile?.theme || "SYSTEM" }), [profile]);
  const lastLogin = useMemo(() => user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("en-IN") : "Not available", [user]);

  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.rpc("update_my_profile", { p_full_name: form.fullName, p_phone: form.phone || null, p_avatar_url: form.avatarUrl || null, p_theme: form.theme });
    if (error) setMessage("Unable to update profile. Check the entered values and try again.");
    else { setMessage("Profile updated."); await refreshAccess(); }
    setBusy(false);
  }

  async function changePassword(event) {
    event.preventDefault(); setMessage("");
    if (password.next.length < 8) return setMessage("Use a password with at least 8 characters.");
    if (password.next !== password.confirm) return setMessage("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: password.next });
    setMessage(error ? "Unable to change password. Please retry." : "Password changed successfully.");
    if (!error) setPassword({ next: "", confirm: "" });
    setBusy(false);
  }

  return <div><PageHeader title="My Account" subtitle="Profile, preferences and security for your signed-in account."/>
    <nav className="module-tabs account-tabs">
      {[['profile','My Profile'],['settings','Account Settings'],['security','Security'],['about','Help / About']].map(([key,label]) => <button key={key} className={tab===key ? "module-tab active" : "module-tab"} onClick={() => setParams({ tab:key })}>{label}</button>)}
    </nav>
    {message ? <div className="purchase-message">{message}</div> : null}

    {tab === "profile" ? <div className="settings-grid"><section className="panel profile-summary-card"><UserAvatar profile={profile} size="xl"/><div><h3>{profile?.full_name}</h3><p>{profile?.email || user?.email}</p><StatusBadge status={profile?.role}/><p><strong>Shop:</strong> {profile?.shop_name}</p><p><strong>Organization:</strong> {profile?.organization_name || "-"}</p><p><strong>Account:</strong> {profile?.active ? "Active" : "Inactive"}</p><p><strong>Last login:</strong> {lastLogin}</p></div></section>
      <form className="panel" onSubmit={saveProfile}><h3>Editable profile</h3><div className="settings-fields"><label>Display Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label><label>Profile Image URL<input type="url" value={form.avatarUrl} onChange={(e)=>setForm({...form,avatarUrl:e.target.value})} placeholder="https://..."/></label></div><p className="muted-text">Email, role and shop security assignments cannot be changed here.</p><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Profile"}</button></form></div> : null}

    {tab === "settings" ? <form className="panel compact-form" onSubmit={saveProfile}><h3>UI Preferences</h3><label>Theme<select value={form.theme} onChange={(e)=>{ const theme=e.target.value; setForm({...form,theme}); notifyThemePreference(theme); }}><option value="SYSTEM">System</option><option value="LIGHT">Light</option><option value="DARK">Dark</option></select></label><p className="muted-text">Theme changes preview immediately and are saved to your account. System follows your device light/dark preference.</p><button className="primary-button" disabled={busy}>Save Preferences</button></form> : null}

    {tab === "security" ? <form className="panel compact-form" onSubmit={changePassword}><h3>Change Password</h3><label>New Password<input type="password" minLength="8" value={password.next} onChange={(e)=>setPassword({...password,next:e.target.value})} required/></label><label>Confirm Password<input type="password" minLength="8" value={password.confirm} onChange={(e)=>setPassword({...password,confirm:e.target.value})} required/></label><button className="primary-button" disabled={busy}>Change Password</button><p className="muted-text">Role changes remain Admin/Platform-controlled. Never share passwords or service keys.</p></form> : null}

    {tab === "about" ? <section className="panel"><h3>WineShopPOS</h3><p><strong>Version:</strong> {APP_VERSION}</p><p className="about-faith-line"><strong>Trust the GOD.</strong></p><p><strong>Created by:</strong> Almighty sa_f</p><p><strong>Support:</strong> Contact your WineShopPOS software provider for account, subscription or database support.</p><p><strong>Documentation:</strong> Project developer handbook and user manual are stored in the Git repository under <code>docs/</code>.</p></section> : null}
  </div>;
}
```

### `src/pages/Approvals.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";

export default function Approvals(){const[items,setItems]=useState([]);const[message,setMessage]=useState("");const[busy,setBusy]=useState("");
async function load(){const[r,s,c,t,p]=await Promise.all([supabase.from("sale_return_requests").select("id,status,reason,total_refund,created_at").eq("status","PENDING").order("created_at"),supabase.from("cashier_shifts").select("id,status,cash_difference,opened_at,close_requested_at").eq("status","CLOSE_REQUESTED").order("close_requested_at"),supabase.from("stock_counts").select("id,count_number,status,submitted_at").eq("status","SUBMITTED").order("submitted_at"),supabase.from("stock_transfers").select("id,status,created_at,source_shop_id,destination_shop_id").eq("status","REQUESTED").order("created_at"),supabase.from("purchase_orders").select("id,po_number,status,subtotal,created_at").eq("status","APPROVAL_PENDING").order("created_at")]);if([r,s,c,t,p].some((x)=>x.error)){setMessage("Unable to load all approval queues.");return}setItems([...(r.data||[]).map((x)=>({type:"RETURN",id:x.id,title:`Return ${Number(x.total_refund||0).toFixed(2)}`,detail:x.reason,when:x.created_at,status:x.status})),...(s.data||[]).map((x)=>({type:"SHIFT",id:x.id,title:"Shift close",detail:`Cash difference ${x.cash_difference??"pending"}`,when:x.close_requested_at||x.opened_at,status:x.status})),...(c.data||[]).map((x)=>({type:"STOCK_COUNT",id:x.id,title:x.count_number,detail:"Physical stock count submitted",when:x.submitted_at,status:x.status})),...(t.data||[]).map((x)=>({type:"TRANSFER",id:x.id,title:"Incoming transfer",detail:`From ${String(x.source_shop_id).slice(0,8)}`,when:x.created_at,status:x.status})),...(p.data||[]).map((x)=>({type:"PURCHASE_ORDER",id:x.id,title:x.po_number,detail:`PO total ${x.subtotal}`,when:x.created_at,status:x.status}))].sort((a,b)=>new Date(b.when)-new Date(a.when)))}useEffect(()=>{load()},[]);
async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
return <div><PageHeader title="Approval Center" subtitle="One place for sensitive operational approvals; existing transaction RPCs remain authoritative." actions={<button className="secondary-button" onClick={load}>Refresh</button>}/>{message?<div className="purchase-message">{message}</div>:null}{items.length===0?<EmptyState title="Nothing is waiting for approval" message="Returns, shift closes, stock counts, transfer requests and purchase orders will appear here."/>:<div className="approval-list">{items.map((item)=><article className="approval-card" key={`${item.type}-${item.id}`}><div><div className="approval-type">{item.type.replaceAll("_"," ")}</div><strong>{item.title}</strong><p>{item.detail}</p><small>{new Date(item.when).toLocaleString("en-IN")}</small></div><div className="approval-actions"><StatusBadge status={item.status}/><button className="primary-button" disabled={!!busy} onClick={()=>act(item,"approve")}>Approve</button>{!["SHIFT","STOCK_COUNT"].includes(item.type)?<button className="secondary-button" disabled={!!busy} onClick={()=>act(item,"reject")}>Reject</button>:null}</div></article>)}</div>}</div>}
```

### `src/pages/BackupRecovery.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function BackupRecovery(){const{createBackup}=useShop();const[tests,setTests]=useState([]);const[msg,setMsg]=useState("");const[form,setForm]=useState({environment:"STAGING",reference:"",result:"PASS",notes:""});async function load(){const{data,error}=await supabase.from("backup_restore_tests").select("*").order("tested_at",{ascending:false}).limit(50);if(error)setMsg("Unable to load restore-test history.");else setTests(data||[])}useEffect(()=>{load()},[]);
function exportSnapshot(){const snapshot=createBackup();const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`wineshoppos-operational-snapshot-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)}
async function record(e){e.preventDefault();const{error}=await supabase.rpc("record_backup_restore_test",{p_environment:form.environment,p_backup_reference:form.reference,p_result:form.result,p_notes:form.notes||null});setMsg(error?"Unable to record restore test.":"Restore test evidence recorded.");if(!error){setForm({...form,reference:"",notes:""});load()}}
return <div><PageHeader title="Backup & Recovery" subtitle="Operational snapshot export plus documented restore-test evidence."/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><section className="panel"><h3>Recovery Strategy</h3><ol className="runbook-list"><li>Use Supabase platform/database backups appropriate to the subscribed plan.</li><li>Keep migrations and Edge Functions in Git as infrastructure history.</li><li>Export operational JSON snapshots for human-readable emergency reference.</li><li>Perform restore drills in a separate non-production environment.</li><li>Record PASS/FAIL evidence below.</li></ol><button className="primary-button" onClick={exportSnapshot}>Export Operational Snapshot</button><p className="muted-text">This JSON is not a substitute for a PostgreSQL database backup.</p></section><form className="panel" onSubmit={record}><h3>Record Restore Drill</h3><div className="settings-fields"><label>Environment<select value={form.environment} onChange={(e)=>setForm({...form,environment:e.target.value})}><option>STAGING</option><option>TEST</option><option>DISASTER_RECOVERY</option></select></label><label>Backup Reference<input required value={form.reference} onChange={(e)=>setForm({...form,reference:e.target.value})} placeholder="backup id/date/runbook reference"/></label><label>Result<select value={form.result} onChange={(e)=>setForm({...form,result:e.target.value})}><option>PASS</option><option>FAIL</option></select></label><label>Notes<textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label></div><br/><button className="primary-button">Record Test</button></form></div><section className="panel" style={{marginTop:16}}><h3>Restore Test History</h3>{tests.length===0?<EmptyState title="No restore drill recorded" message="Production backup readiness is not considered proven until a restore drill succeeds."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>When</th><th>Environment</th><th>Backup Reference</th><th>Result</th><th>Notes</th></tr></thead><tbody>{tests.map(t=><tr key={t.id}><td>{new Date(t.test_date||t.created_at).toLocaleString("en-IN")}</td><td>{t.environment}</td><td>{t.backup_reference}</td><td><StatusBadge status={t.result}/></td><td>{t.notes||"-"}</td></tr>)}</tbody></table></div>}</section></div>}
```

### `src/pages/BarcodeLabels.jsx`

```javascript
import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";

function BarcodeSvg({ value }){const ref=useRef(null);useEffect(()=>{if(ref.current&&value)JsBarcode(ref.current,value,{format:"CODE128",displayValue:true,fontSize:12,height:42,margin:4,width:1.6})},[value]);return <svg ref={ref}/>}
export default function BarcodeLabels(){const{products}=useShop();const[id,setId]=useState("");const[copies,setCopies]=useState(1);const[query,setQuery]=useState("");const selected=products.find((p)=>p.id===id);const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return products.filter((p)=>p.active&&(!q||[p.name,p.brand,p.barcode,p.sku].some((v)=>String(v||"").toLowerCase().includes(q)))).slice(0,50)},[products,query]);
return <div><PageHeader title="Barcode Label Printing" subtitle="Generate CODE128 labels for product shelves/bottles; test final size on your real label printer." actions={<button className="primary-button no-print" disabled={!selected} onClick={()=>window.print()}>Print Labels</button>}/><div className="settings-grid no-print"><section className="panel"><label>Search<input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Product, SKU or barcode"/></label><label>Product<select value={id} onChange={(e)=>setId(e.target.value)}><option value="">Select product</option>{filtered.map((p)=><option key={p.id} value={p.id}>{p.name} · {p.barcode}</option>)}</select></label><label>Copies<input type="number" min="1" max="100" value={copies} onChange={(e)=>setCopies(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></label></section><section className="panel"><h3>Printer note</h3><p>Browser printing is used intentionally. Choose your installed barcode/label printer in the system print dialog and calibrate paper size once.</p></section></div>{selected?<div className="barcode-label-sheet">{Array.from({length:copies}).map((_,i)=><div className="barcode-label" key={i}><strong>{selected.name}</strong><span>{selected.size}</span><BarcodeSvg value={selected.barcode}/><small>{selected.sku}</small></div>)}</div>:<div className="panel">Select a product to preview its label.</div>}</div>}
```

### `src/pages/Compliance.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

export default function Compliance(){
  const [form,setForm]=useState({stateCode:"",stateName:"",licenseType:"",licenseNumber:"",validFrom:"",validTo:"",exciseRegistration:"",notes:""});
  const [exists,setExists]=useState(false);const[msg,setMsg]=useState("");const[busy,setBusy]=useState(false);
  async function load(){const{data,error}=await supabase.from("compliance_profiles").select("*").maybeSingle();if(error){setMsg("Unable to load compliance configuration.");return}if(data){setExists(true);setForm({stateCode:data.state_code||"",stateName:data.state_name||"",licenseType:data.license_type||"",licenseNumber:data.license_number||"",validFrom:data.license_valid_from||"",validTo:data.license_valid_to||"",exciseRegistration:data.excise_registration_number||"",notes:data.notes||""})}}
  useEffect(()=>{load()},[]);
  async function save(e){e.preventDefault();setBusy(true);const{error}=await supabase.rpc("upsert_compliance_profile",{p_state_code:form.stateCode||null,p_state_name:form.stateName||null,p_license_number:form.licenseNumber||null,p_license_type:form.licenseType||null,p_license_valid_from:form.validFrom||null,p_license_valid_to:form.validTo||null,p_excise_registration_number:form.exciseRegistration||null,p_notes:form.notes||null});setMsg(error?"Unable to save compliance configuration.":"Compliance profile saved. No legal report is enabled until its verified state specification is implemented.");if(!error)setExists(true);setBusy(false)}
  return <div><PageHeader title="Liquor Compliance Foundation" subtitle="Store verified state/license metadata without inventing excise or tax rules."/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={save}><h3>{exists?"Compliance Profile":"Create Compliance Profile"}</h3><div className="settings-fields"><label>State Code<input value={form.stateCode} onChange={(e)=>setForm({...form,stateCode:e.target.value})} placeholder="MH"/></label><label>State Name<input required value={form.stateName} onChange={(e)=>setForm({...form,stateName:e.target.value})} placeholder="Maharashtra"/></label><label>License Type<input required value={form.licenseType} onChange={(e)=>setForm({...form,licenseType:e.target.value})}/></label><label>License Number<input required value={form.licenseNumber} onChange={(e)=>setForm({...form,licenseNumber:e.target.value})}/></label><label>Valid From<input type="date" value={form.validFrom} onChange={(e)=>setForm({...form,validFrom:e.target.value})}/></label><label>Valid To<input type="date" value={form.validTo} onChange={(e)=>setForm({...form,validTo:e.target.value})}/></label><label>Excise Registration Number<input value={form.exciseRegistration} onChange={(e)=>setForm({...form,exciseRegistration:e.target.value})}/></label><label>Notes<textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label></div><br/><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Configuration"}</button></form><section className="panel"><h3>Compliance Safety Rule</h3><p>WineShopPOS does not currently claim any generic report is legally excise-compliant.</p><p>State-specific registers, fields and calculations must be added only from verified requirements supplied for the licensed shop.</p><EmptyState title="No invented legal rules" message="This foundation is intentionally configuration-only until a verified state/report specification is provided."/></section></div></div>
}
```

### `src/pages/CustomerCredit.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import FeatureTierBadge from "../components/ui/FeatureTierBadge";
import EmptyState from "../components/ui/EmptyState";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function CustomerCredit(){const[balances,setBalances]=useState([]);const[message,setMessage]=useState("");const[customer,setCustomer]=useState({name:"",mobile:"",email:""});const[entry,setEntry]=useState({customerId:"",type:"CHARGE",amount:"",reference:"",description:""});
async function load(){const{data,error}=await supabase.rpc("customer_balances");if(error)setMessage("Unable to load customer balances.");else setBalances(data||[])}useEffect(()=>{load()},[]);
async function addCustomer(e){e.preventDefault();const{data,error}=await supabase.rpc("create_customer",{p_full_name:customer.name,p_mobile:customer.mobile||null,p_email:customer.email||null,p_notes:null});if(error)setMessage("Unable to add customer. Mobile number may already exist.");else{setMessage("Customer created.");setCustomer({name:"",mobile:"",email:""});setEntry({...entry,customerId:data});load()}}
async function postEntry(e){e.preventDefault();const{error}=await supabase.rpc("record_customer_credit",{p_customer_id:entry.customerId,p_entry_type:entry.type,p_amount:Number(entry.amount),p_sale_id:null,p_reference:entry.reference||null,p_description:entry.description||null});setMessage(error?"Unable to record customer credit entry.":"Customer credit ledger updated.");if(!error){setEntry({...entry,amount:"",reference:"",description:""});load()}}
return <div><PageHeader title="Customer & Credit" tier="PLUS" subtitle="Optional customer records and Udhaar ledger without slowing normal barcode billing."/>{message?<div className="purchase-message">{message}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={addCustomer}><h3>New Customer <FeatureTierBadge tier="PLUS"/></h3><div className="settings-fields"><label>Name<input required value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})}/></label><label>Mobile<input value={customer.mobile} onChange={(e)=>setCustomer({...customer,mobile:e.target.value})}/></label><label>Email<input type="email" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})}/></label></div><br/><button className="primary-button">Add Customer</button></form><form className="panel" onSubmit={postEntry}><h3>Credit / Payment Entry</h3><div className="settings-fields"><label>Customer<select required value={entry.customerId} onChange={(e)=>setEntry({...entry,customerId:e.target.value})}><option value="">Select customer</option>{balances.map((c)=><option key={c.customer_id} value={c.customer_id}>{c.full_name} · {money.format(c.outstanding)}</option>)}</select></label><label>Entry Type<select value={entry.type} onChange={(e)=>setEntry({...entry,type:e.target.value})}><option value="CHARGE">Udhaar / Charge</option><option value="PAYMENT">Payment Received</option><option value="ADJUSTMENT_DEBIT">Debit Adjustment</option><option value="ADJUSTMENT_CREDIT">Credit Adjustment</option></select></label><label>Amount<input type="number" min="0.01" step="0.01" required value={entry.amount} onChange={(e)=>setEntry({...entry,amount:e.target.value})}/></label><label>Reference<input value={entry.reference} onChange={(e)=>setEntry({...entry,reference:e.target.value})}/></label><label>Description<input value={entry.description} onChange={(e)=>setEntry({...entry,description:e.target.value})}/></label></div><br/><button className="primary-button">Record Entry</button></form></div><section className="panel" style={{marginTop:16}}><h3>Customer Outstanding</h3>{balances.length===0?<EmptyState title="No customer credit records" message="Customer capture remains optional during normal billing."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Charges</th><th>Payments</th><th>Outstanding</th></tr></thead><tbody>{balances.map((c)=><tr key={c.customer_id}><td>{c.full_name}</td><td>{c.mobile||"-"}</td><td>{money.format(c.total_charges)}</td><td>{money.format(c.total_payments)}</td><td><strong>{money.format(c.outstanding)}</strong></td></tr>)}</tbody></table></div>}</section></div>}
```

### `src/pages/Expenses.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";

const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 });
export default function Expenses() {
  const [categories,setCategories]=useState([]); const [rows,setRows]=useState([]); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({categoryId:"",date:new Date().toISOString().slice(0,10),amount:"",description:"",method:"CASH",reference:""});
  async function load(){const[c,e]=await Promise.all([supabase.from("expense_categories").select("id,name,active").eq("active",true).order("name"),supabase.from("expenses").select("id,expense_date,amount,description,payment_method,reference_number,status,created_at,expense_categories(name)").order("expense_date",{ascending:false}).limit(300)]);if(c.error||e.error)setMessage("Unable to load expense data.");else{setCategories(c.data||[]);setRows(e.data||[])}}
  useEffect(()=>{load()},[]);
  const monthTotal=useMemo(()=>{const month=new Date().toISOString().slice(0,7);return rows.filter((r)=>r.status==="ACTIVE"&&String(r.expense_date).startsWith(month)).reduce((s,r)=>s+Number(r.amount||0),0)},[rows]);
  async function submit(event){event.preventDefault();setBusy(true);const{error}=await supabase.rpc("record_expense",{p_category_id:form.categoryId,p_expense_date:form.date,p_amount:Number(form.amount),p_description:form.description,p_payment_method:form.method,p_reference:form.reference||null});setMessage(error?"Unable to record expense. Check the fields and retry.":"Expense recorded.");if(!error){setForm({...form,amount:"",description:"",reference:""});await load()}setBusy(false)}
  async function voidRow(id){const reason=window.prompt("Reason for voiding this expense");if(!reason)return;const{error}=await supabase.rpc("void_expense",{p_expense_id:id,p_reason:reason});setMessage(error?"Unable to void expense.":"Expense voided and retained in audit history.");if(!error)load()}
  return <div><PageHeader title="Expense Management" subtitle="Track operating expenses so Owner Center can calculate operating profit."/>{message?<div className="purchase-message">{message}</div>:null}
    <div className="settings-grid"><form className="panel" onSubmit={submit}><h3>Record Expense</h3><div className="settings-fields"><label>Date<input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required/></label><label>Category<select value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})} required><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} required/></label><label>Payment Method<select value={form.method} onChange={(e)=>setForm({...form,method:e.target.value})}>{["CASH","UPI","CARD","BANK_TRANSFER","CHEQUE","OTHER"].map((x)=><option key={x}>{x}</option>)}</select></label><label>Description<input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required/></label><label>Reference<input value={form.reference} onChange={(e)=>setForm({...form,reference:e.target.value})}/></label></div><br/><button className="primary-button" disabled={busy}>{busy?"Saving...":"Record Expense"}</button></form><section className="panel"><h3>This Month</h3><div className="big-number">{money.format(monthTotal)}</div><p className="muted-text">Active expenses for the current calendar month.</p></section></div>
    <section className="panel" style={{marginTop:16}}><h3>Expense History</h3>{rows.length===0?<EmptyState title="No expenses recorded yet" message="Record rent, salaries, electricity, transport, maintenance or other operating expenses."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.expense_date}</td><td>{r.expense_categories?.name||"-"}</td><td>{r.description}</td><td>{r.payment_method}</td><td>{money.format(r.amount)}</td><td><StatusBadge status={r.status}/></td><td>{r.status==="ACTIVE"?<button className="secondary-button" onClick={()=>voidRow(r.id)}>Void</button>:null}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
```

### `src/pages/HardwareSetup.jsx`

```javascript
import { Link } from "react-router-dom";
import { Printer, ScanBarcode, Tags } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
export default function HardwareSetup() {
  return <div><PageHeader title="Hardware & Device Setup" subtitle="Keep scanner and printer setup in one predictable place."/>
    <div className="capability-grid">
      <Link className="capability-card" to="/admin/hardware/scanner"><ScanBarcode/><div><strong>Barcode Scanner</strong><span>Detection speed, global listener and beep tests.</span></div></Link>
      <Link className="capability-card" to="/admin/hardware/printer"><Printer/><div><strong>Receipt Printer</strong><span>58/80mm receipt settings and print test.</span></div></Link>
      <Link className="capability-card" to="/products/labels"><Tags/><div><strong>Barcode Labels</strong><span>Generate and print product barcode labels.</span></div></Link>
    </div>
  </div>;
}
```

### `src/pages/InventoryIntelligence.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { DonutChartCard, HorizontalBarChartCard } from "../components/charts/BusinessCharts";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default function InventoryIntelligence() {
  const { products, suppliers } = useShop();
  const [health, setHealth] = useState([]); const [explain, setExplain] = useState([]); const [productId, setProductId] = useState(""); const [supplierId, setSupplierId] = useState(""); const [message, setMessage] = useState("");
  async function load(){const {data,error}=await supabase.rpc("inventory_health",{p_history_days:30,p_dead_days:45});if(error)setMessage("Unable to load inventory intelligence.");else setHealth(data||[])}
  useEffect(()=>{load()},[]);
  async function explainProduct(id){setProductId(id);setExplain([]);if(!id)return;const{data,error}=await supabase.rpc("stock_explanation",{p_product_id:id,p_days:365});if(error)setMessage("Unable to explain stock movement.");else setExplain(data||[])}
  async function createPO(row){if(!supplierId)return setMessage("Select a supplier before creating a purchase order.");const product=products.find((p)=>p.id===row.product_id);if(!product)return;const qty=Math.max(product.unitsPerCase||1,Number(row.current_stock<=0?product.unitsPerCase:Math.ceil((Number(row.avg_daily||0)*14-Number(row.current_stock||0))/(product.unitsPerCase||1))*(product.unitsPerCase||1)));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:[{product_id:row.product_id,quantity:qty,purchase_price:product.purchasePrice}],p_expected_date:null,p_notes:"Created from Inventory Intelligence"});setMessage(error?"Unable to create purchase order.":`Draft purchase order created for ${qty} bottle(s).`)}
  const selected=useMemo(()=>products.find((p)=>p.id===productId),[products,productId]);
  const counts=useMemo(()=>health.reduce((a,r)=>({...a,[r.classification]:(a[r.classification]||0)+1}),{}),[health]);
  const healthChart=useMemo(()=>Object.entries(counts).map(([label,value])=>({label:label.replaceAll("_"," "),value})),[counts]);
  const riskChart=useMemo(()=>health.filter((r)=>["STOCKOUT_RISK","OUT_OF_STOCK"].includes(r.classification)).sort((a,b)=>Number(a.days_remaining??999)-Number(b.days_remaining??999)).slice(0,7).map((r)=>({label:r.product_name,value:Number(r.current_stock||0)})),[health]);
  return <div><PageHeader title="Inventory Intelligence" subtitle="Explain stock, detect health risks and convert reorder needs into purchase orders." tier="PRO"/>{message?<div className="purchase-message">{message}</div>:null}
    <div className="metric-grid four"><div className="metric-card metric-accent-orange"><span>Stockout Risk</span><strong>{counts.STOCKOUT_RISK||0}</strong></div><div className="metric-card metric-accent-indigo"><span>Dead Stock</span><strong>{counts.DEAD||0}</strong></div><div className="metric-card metric-accent-blue"><span>Overstock</span><strong>{counts.OVERSTOCK||0}</strong></div><div className="metric-card metric-accent-red"><span>Out of Stock</span><strong>{counts.OUT_OF_STOCK||0}</strong></div></div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}><DonutChartCard title="Inventory Health Mix" subtitle="Product count by current health classification" data={healthChart} centerLabel="SKUs"/><HorizontalBarChartCard title="Immediate Stock Risk" subtitle="Current bottles for products closest to stockout" data={riskChart}/></div>
    <section className="panel" style={{marginTop:16}}><div className="section-row"><div><h3>Inventory Health</h3><p className="muted-text">30-day sales velocity with 45-day dead-stock threshold.</p></div><label>Supplier for PO<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label></div>{health.length===0?<EmptyState title="No inventory health data" message="Products and sales history are required."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Product</th><th>Stock</th><th>30d Sales</th><th>Avg/Day</th><th>Days Left</th><th>Inventory Cost</th><th>Health</th><th></th></tr></thead><tbody>{health.map((r)=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.current_stock}</td><td>{r.units_sold}</td><td>{r.avg_daily}</td><td>{r.days_remaining??"-"}</td><td>{money.format(r.inventory_cost)}</td><td><StatusBadge status={r.classification}/></td><td>{["STOCKOUT_RISK","OUT_OF_STOCK"].includes(r.classification)?<button className="secondary-button" onClick={()=>createPO(r)}>Create PO</button>:null}</td></tr>)}</tbody></table></div>}</section>
    <section className="panel" style={{marginTop:16}}><h3>Explain My Stock</h3><label>Product<select value={productId} onChange={(e)=>explainProduct(e.target.value)}><option value="">Select product</option>{products.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{selected?<><h4 style={{marginTop:14}}>{selected.name}</h4><div className="movement-breakdown">{explain.map((r)=><div className="movement-chip" key={r.movement_type}><span>{r.movement_type.replaceAll("_"," ")}</span><strong>{Number(r.quantity_change)>0?"+":""}{r.quantity_change}</strong><small>{r.event_count} event(s)</small></div>)}</div></>:null}</section>
  </div>;
}
```

### `src/pages/OwnerCenter.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 });
const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day:"numeric", month:"short" });

export default function OwnerCenter() {
  const { profile } = useAuth();
  const { sales, products } = useShop();
  const [summary,setSummary]=useState({});
  const [recommendations,setRecommendations]=useState([]);
  const [exceptions,setExceptions]=useState([]);
  const [message,setMessage]=useState("");

  async function load(){
    const[s,r,e]=await Promise.all([
      supabase.rpc("owner_center_summary",{}),
      supabase.rpc("owner_recommendations",{p_history_days:30}),
      supabase.rpc("loss_control_exceptions",{p_days:30}),
    ]);
    if(s.error||r.error||e.error)setMessage("Unable to load all Owner Center insights.");
    setSummary(s.data||{});setRecommendations(r.data||[]);setExceptions(e.data||[]);
  }
  useEffect(()=>{load()},[]);

  const chartData = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0);
    const recent = sales.filter((sale)=>sale.status!=="VOID" && new Date(sale.createdAt)>=start);
    const dayMap = new Map();
    for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()+i);dayMap.set(d.toISOString().slice(0,10),0);}
    const pay = { CASH:0, UPI:0, CARD:0 };
    const productMap = new Map();
    recent.forEach((sale)=>{
      const key=sale.createdAt?.slice(0,10); if(dayMap.has(key)) dayMap.set(key,(dayMap.get(key)||0)+Number(sale.grandTotal||0));
      const method=String(sale.paymentMethod||"OTHER").toUpperCase(); pay[method]=(pay[method]||0)+Number(sale.grandTotal||0);
      (sale.items||[]).forEach((item)=>{const current=productMap.get(item.productId)||{label:item.productName||"Product",value:0};current.value+=Number(item.lineTotal||0);productMap.set(item.productId,current);});
    });
    return {
      trend:[...dayMap.entries()].map(([date,value])=>({label:dayLabel(date),value})),
      payments:Object.entries(pay).filter(([,value])=>value>0).map(([label,value])=>({label,value})),
      topProducts:[...productMap.values()].sort((a,b)=>b.value-a.value).slice(0,7),
      activeProducts:products.filter((p)=>p.active).length,
    };
  },[sales,products]);

  return <div className="dashboard-page">
    <PageHeader title="Owner Control Center" subtitle={`What happened, what needs attention and what to do next · ${profile?.shop_name||"Current Shop"}`} tier="PRO"/>
    {message?<div className="purchase-message">{message}</div>:null}

    <div className="metric-grid four executive-metrics">
      <div className="metric-card metric-accent-blue"><span>Revenue · 30 Days</span><strong>{money.format(summary.revenue||0)}</strong><small>{summary.bills||0} bills</small></div>
      <div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(summary.gross_profit||0)}</strong><small>After cost of goods</small></div>
      <div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(summary.operating_profit||0)}</strong><small>After expenses</small></div>
      <div className="metric-card metric-accent-orange"><span>Inventory Cost</span><strong>{money.format(summary.inventory_cost||0)}</strong><small>{chartData.activeProducts} active products</small></div>
    </div>

    <div className="dashboard-chart-grid primary" style={{marginTop:16}}>
      <LineChartCard title="30-Day Sales Trend" subtitle="Daily completed sales value" data={chartData.trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="Cash, UPI and Card share" data={chartData.payments} formatValue={(v)=>money.format(v)} centerLabel="Sales"/>
    </div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <HorizontalBarChartCard title="Top Products by Sales" subtitle="Highest product sales value in the current 30-day window" data={chartData.topProducts} formatValue={(v)=>money.format(v)}/>
      <section className="chart-card attention-card"><div className="chart-heading"><div><h3>Business Attention</h3><p>Live owner-level operating signals</p></div></div><div className="attention-metrics"><div><span>Expenses</span><strong>{money.format(summary.expenses||0)}</strong></div><div><span>Low Stock</span><strong>{summary.low_stock_count||0}</strong></div><div><span>Cash Variance</span><strong>{money.format(summary.cash_variance||0)}</strong></div><div><span>Requires Review</span><strong>{exceptions.length}</strong></div></div></section>
    </div>

    <div className="settings-grid" style={{marginTop:16}}>
      <section className="panel"><div className="section-row"><h3>What Should I Do Next?</h3><Link to="/owner/recommendations">View all</Link></div>{recommendations.slice(0,6).map((r,i)=><Link to={r.action_path||"/owner"} className="recommendation-row" key={`${r.recommendation_type}-${i}`}><div><strong>{r.title}</strong><p>{r.message}</p></div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span></Link>)}</section>
      <section className="panel"><div className="section-row"><h3>Requires Review</h3><Link to="/owner/exceptions">Open Loss & Exceptions</Link></div>{exceptions.slice(0,6).map((r,i)=><div className="recommendation-row" key={`${r.entity_id}-${i}`}><div><strong>{r.exception_type.replaceAll("_"," ")}</strong><p>{r.summary}</p></div><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></div>)}</section>
    </div>
    <div className="quick-action-grid"><Link className="quick-action" to="/owner/profit"><strong>Profit Intelligence</strong><span>Revenue → COGS → expenses → operating profit</span></Link><Link className="quick-action" to="/inventory/intelligence"><strong>Inventory Health</strong><span>Dead stock, stockout risk and reordering</span></Link><Link className="quick-action" to="/purchasing/intelligence"><strong>Purchase Intelligence</strong><span>OCR, supplier pricing and margin impact</span></Link><Link className="quick-action" to="/owner/share"><strong>Share with Owner</strong><span>Prepare a WhatsApp operating summary</span></Link></div>
  </div>;
}
```

### `src/pages/OwnerExceptions.jsx`

```javascript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
export default function OwnerExceptions(){const[rows,setRows]=useState([]);const[days,setDays]=useState(30);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("loss_control_exceptions",{p_days:Number(days)});if(error)setMsg("Unable to load exceptions.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Audit & Loss Control" subtitle="Neutral, rule-based exception detection. Items are flagged for review, not accusations." tier="PRO"/><div className="panel filter-bar"><label>Lookback<select value={days} onChange={(e)=>setDays(e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel" style={{marginTop:16}}><h3>Requires Review</h3>{rows.length===0?<EmptyState title="No unusual activity found" message="No configured rule exceeded its review threshold in this period."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Severity</th><th>Type</th><th>When</th><th>Summary</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.entity_id}-${i}`}><td><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></td><td>{r.exception_type.replaceAll("_"," ")}</td><td>{new Date(r.event_time).toLocaleString("en-IN")}</td><td>{r.summary}</td><td>{money.format(r.amount||0)}</td><td><Link to={r.action_path||"/owner"}>Review</Link></td></tr>)}</tbody></table></div>}</section></div>}
```

### `src/pages/OwnerProfit.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ColumnChartCard, HorizontalBarChartCard } from "../components/charts/BusinessCharts";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
export default function OwnerProfit(){
  const now=new Date();
  const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));
  const[to,setTo]=useState(now.toISOString().slice(0,10));
  const[s,setS]=useState({});const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");
  async function load(){const[a,b]=await Promise.all([supabase.rpc("owner_center_summary",{p_from:from,p_to:to}),supabase.rpc("profit_by_product",{p_from:from,p_to:to})]);if(a.error||b.error)setMsg("Unable to calculate profit intelligence.");else{setS(a.data||{});setRows(b.data||[])}}
  useEffect(()=>{load()},[]);
  const bridge=useMemo(()=>[
    {label:"Revenue",value:Number(s.revenue||0)},
    {label:"COGS",value:Number(s.cogs||0)},
    {label:"Gross Profit",value:Number(s.gross_profit||0)},
    {label:"Expenses",value:Number(s.expenses||0)},
    {label:"Operating",value:Number(s.operating_profit||0)},
  ],[s]);
  const topProfit=useMemo(()=>rows.slice().sort((a,b)=>Number(b.gross_profit||0)-Number(a.gross_profit||0)).slice(0,7).map(r=>({label:r.product_name,value:Number(r.gross_profit||0)})),[rows]);
  return <div><PageHeader title="Profit & Business Intelligence" subtitle="Revenue − COGS = gross profit; gross profit − operating expenses = operating profit." tier="PRO"/>
    <div className="panel filter-bar"><label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}
    <div className="metric-grid four" style={{marginTop:16}}><div className="metric-card metric-accent-blue"><span>Revenue</span><strong>{money.format(s.revenue||0)}</strong></div><div className="metric-card metric-accent-orange"><span>COGS</span><strong>{money.format(s.cogs||0)}</strong></div><div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(s.gross_profit||0)}</strong></div><div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(s.operating_profit||0)}</strong></div></div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}><ColumnChartCard title="Profit Bridge" subtitle="Power BI-style financial comparison for the selected period" data={bridge} formatValue={(v)=>money.format(v)}/><HorizontalBarChartCard title="Top SKU Gross Profit" subtitle="Highest gross profit contribution" data={topProfit} formatValue={(v)=>money.format(v)}/></div>
    <section className="panel" style={{marginTop:16}}><h3>SKU Profitability</h3>{rows.length===0?<EmptyState title="No profitability data" message="Completed sales with cost snapshots are required."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Revenue</th><th>COGS</th><th>Gross Profit</th><th>Margin</th></tr></thead><tbody>{rows.map(r=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.quantity}</td><td>{money.format(r.revenue)}</td><td>{money.format(r.cogs)}</td><td><strong>{money.format(r.gross_profit)}</strong></td><td>{Number(r.margin_pct||0).toFixed(2)}%</td></tr>)}</tbody></table></div>}</section><p className="muted-text">Historical sales created before cost snapshots were introduced may have incomplete COGS. This screen reports only what trusted stored data supports.</p></div>;
}
```

### `src/pages/OwnerWhatsApp.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
export default function OwnerWhatsApp(){const{profile}=useAuth();const[s,setS]=useState({});const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("owner_center_summary",{});if(error)setMsg("Unable to generate summary.");else setS(data||{})}useEffect(()=>{load()},[]);const text=useMemo(()=>[`WineShopPOS — Business Summary`,`Shop: ${profile?.shop_name||"Current Shop"}`,`Period: ${s.from||""} to ${s.to||""}`,`Revenue: ${money.format(s.revenue||0)}`,`Bills: ${s.bills||0}`,`Gross Profit: ${money.format(s.gross_profit||0)}`,`Expenses: ${money.format(s.expenses||0)}`,`Operating Profit: ${money.format(s.operating_profit||0)}`,`Returns: ${money.format(s.returns||0)}`,`Cash Variance: ${money.format(s.cash_variance||0)}`,`Low Stock SKUs: ${s.low_stock_count||0}`].join("\n"),[s,profile]);function share(){window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer")}return <div><PageHeader title="Owner WhatsApp Summary" subtitle="Generate a pre-written operating summary. Nothing is sent automatically." tier="PLUS"/>{msg?<div className="purchase-message">{msg}</div>:null}<div className="settings-grid"><section className="panel"><h3>Preview</h3><pre className="share-preview">{text}</pre><button className="primary-button" onClick={share}>Share with Owner</button></section><section className="panel"><h3>Privacy & Sending</h3><p>WineShopPOS does not call a WhatsApp API, does not send background alerts and does not schedule messages.</p><p>Your device opens WhatsApp or WhatsApp Web with this text. The user chooses the recipient and manually sends it.</p></section></div></div>}
```

### `src/pages/POS.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useScanner } from "../context/ScannerContext";
import { supabase } from "../lib/supabase";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function POS(){const{products,getStock,completeSale}=useShop();const{lastScan,successBeep,errorBeep}=useScanner();const navigate=useNavigate();const[search,setSearch]=useState("");const[cart,setCart]=useState([]);const[paymentMethod,setPaymentMethod]=useState("CASH");const[paymentReference,setPaymentReference]=useState("");const[discount,setDiscount]=useState(0);const[message,setMessage]=useState("Scanner ready");const[unknown,setUnknown]=useState("");const[busy,setBusy]=useState(false);const[customers,setCustomers]=useState([]);const[customerId,setCustomerId]=useState("");
const active=products.filter(p=>p.active);const results=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return active.filter(p=>[p.name,p.brand,p.sku,p.barcode].some(v=>String(v).toLowerCase().includes(q))).slice(0,8)},[search,active]);
useEffect(()=>{if(navigator.onLine)supabase.from("customers").select("id,full_name,mobile").eq("active",true).order("full_name").limit(200).then(({data})=>setCustomers(data||[]))},[]);
function qty(id){return cart.find(i=>i.product.id===id)?.quantity||0}function add(p){const stock=getStock(p.id);if(qty(p.id)>=stock){errorBeep();setMessage(`Only ${stock} unit(s) available for ${p.name}.`);return false}setCart(c=>{const x=c.find(i=>i.product.id===p.id);return x?c.map(i=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{product:p,quantity:1}]});setUnknown("");setMessage(`${p.name} added.`);successBeep();return true}
function processBarcode(code){const p=active.find(x=>x.barcode===code);if(!p){errorBeep();setUnknown(code);setMessage(`PRODUCT NOT FOUND: ${code}`);return}add(p)}
useEffect(()=>{if(lastScan?.barcode)processBarcode(lastScan.barcode)},[lastScan?.id]);
function change(id,d){const i=cart.find(x=>x.product.id===id);if(!i)return;const next=i.quantity+d;if(next<=0)return setCart(c=>c.filter(x=>x.product.id!==id));if(next>getStock(id)){errorBeep();return setMessage(`Only ${getStock(id)} unit(s) available.`)}setCart(c=>c.map(x=>x.product.id===id?{...x,quantity:next}:x))}
const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0);const disc=Math.max(0,Number(discount||0));const total=Math.max(0,subtotal-disc);
async function checkout(){setBusy(true);const r=await completeSale(cart,paymentMethod,{discount:disc,paymentReference});if(!r.ok){setBusy(false);errorBeep();setMessage(r.message);return}if(!r.offline&&customerId){const{error}=await supabase.rpc("link_sale_customer",{p_sale_id:r.sale.id,p_customer_id:customerId});if(error)setMessage("Sale completed, but customer could not be attached. The sale itself is safe.")}
setBusy(false);successBeep();setCart([]);setDiscount(0);setPaymentReference("");setCustomerId("");if(r.offline){setMessage(r.message);return}navigate(`/sales/${r.sale.id}`)}
return <div><div className="page-heading"><div><h2>Fast POS Billing</h2><p>Global HID scanner active — scan, collect payment and print.</p></div><button className="secondary-button" onClick={()=>navigate("/pos/scanner")}>Scanner Test</button></div>{unknown&&<div className="product-not-found"><strong>PRODUCT NOT FOUND</strong><span>{unknown}</span><button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button></div>}
<div className="pos-layout"><div className="pos-left"><div className="panel"><label>Manual Search<input style={{width:"100%"}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>{results.map(p=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}<div className="purchase-message" style={{marginTop:10}}>{message}</div></div><div className="panel scanner-commercial-card" style={{marginTop:14}}><strong>Scanner Ready</strong><p>Rapid keystrokes + Enter are captured globally. Scanner text is restored out of discount/payment fields.</p><p>Test barcode: <code>8900000010016</code></p></div></div>
<div className="panel"><h3>Cart</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{cart.map(i=><tr key={i.product.id}><td>{i.product.name}</td><td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td><td>{money.format(i.product.price)}</td><td>{money.format(i.product.price*i.quantity)}</td></tr>)}</tbody></table></div><hr/><label>Customer (optional)<select value={customerId} onChange={e=>setCustomerId(e.target.value)} disabled={!navigator.onLine}><option value="">Walk-in customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.full_name}{c.mobile?` · ${c.mobile}`:""}</option>)}</select></label><p>Subtotal <strong>{money.format(subtotal)}</strong></p><label>Discount<input type="number" min="0" max={subtotal} value={discount} onChange={e=>setDiscount(e.target.value)}/></label><h2>Total {money.format(total)}</h2><div className="payment-methods">{["CASH","UPI","CARD"].map(m=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>{paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={e=>setPaymentReference(e.target.value)}/></label>}<br/><button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button><p className="muted-text">Customer capture is optional. Udhaar/credit entries are managed under Operations → Customer & Credit so the normal cashier flow remains fast.</p></div></div></div>}
```

### `src/pages/Procurement.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import FeatureTierBadge from "../components/ui/FeatureTierBadge";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const line=()=>({productId:"",quantity:12,purchasePrice:0});
export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[receive,setReceive]=useState({poId:"",invoice:"",date:new Date().toISOString().slice(0,10)});const[ret,setRet]=useState({supplierId:"",productId:"",qty:1,reason:"Damaged/incorrect supply"});
async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select("*,purchase_order_items(*)").order("created_at",{ascending:false}).limit(150),supabase.rpc("supplier_balances")]);if(po.error||b.error)setMessage("Unable to load procurement data.");else{setOrders(po.data||[]);setBalances(b.data||[])}}useEffect(()=>{load()},[]);
function update(i,k,v){setItems(x=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find(p=>p.id===v)?.purchasePrice||0}:{})}:r))}const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
async function createPO(e){e.preventDefault();const payload=items.filter(i=>i.productId&&Number(i.quantity)>0).map(i=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?"Unable to create purchase order.":"Draft purchase order created.");if(!error){setItems([line()]);await load()}}
async function rpc(fn,args,ok){const{error}=await supabase.rpc(fn,args);setMessage(error?`Unable to complete ${ok.toLowerCase()}.`:ok);if(!error){await Promise.all([load(),refreshAll()])}}
async function receivePO(e){e.preventDefault();if(!receive.poId)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:receive.poId,p_invoice_number:receive.invoice,p_invoice_date:receive.date,p_receive_items:null,p_notes:"Received from consolidated Procurement"});setMessage(error?"Unable to receive this purchase order. Check status, invoice number and quantities.":"Goods received; inventory and supplier balance updated transactionally.");if(!error){setReceive({...receive,poId:"",invoice:""});await Promise.all([load(),refreshAll()])}}
async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?"Unable to record supplier payment.":"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
async function purchaseReturn(e){e.preventDefault();const p=products.find(x=>x.id===ret.productId);if(!p)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:ret.supplierId,p_items:[{product_id:ret.productId,quantity:Number(ret.qty),purchase_price:p.purchasePrice}],p_reason:ret.reason,p_purchase_id:null});setMessage(error?"Unable to complete supplier return.":"Supplier return completed; stock reduced with movement history.");if(!error){setRet({...ret,productId:"",qty:1});await Promise.all([load(),refreshAll()])}}
return <div><PageHeader title="Advanced Supplier & Procurement" subtitle="Draft → approval → send → receive → supplier balance/payment → purchase return." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}
<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order <FeatureTierBadge tier="PLUS"/></h3><div className="settings-fields"><label>Supplier<select value={supplierId} onChange={e=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={e=>setExpected(e.target.value)}/></label></div><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={e=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={e=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={e=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" className="icon-button" onClick={()=>setItems(x=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems(x=>[...x,line()])}>Add Line</button><button className="primary-button">Create Draft PO</button></div></form>
<form className="panel" onSubmit={receivePO}><h3>Receive Approved/Sent PO</h3><div className="settings-fields"><label>Purchase Order<select value={receive.poId} onChange={e=>setReceive({...receive,poId:e.target.value})} required><option value="">Select ready PO</option>{orders.filter(o=>["APPROVED","SENT","PARTIALLY_RECEIVED"].includes(o.status)).map(o=><option key={o.id} value={o.id}>{o.po_number} · {o.status}</option>)}</select></label><label>Supplier Invoice<input required value={receive.invoice} onChange={e=>setReceive({...receive,invoice:e.target.value})}/></label><label>Invoice Date<input type="date" required value={receive.date} onChange={e=>setReceive({...receive,date:e.target.value})}/></label></div><p className="muted-text">Inventory changes only inside the controlled receive RPC.</p><button className="primary-button">Receive Goods</button></form></div>
<div className="settings-grid" style={{marginTop:16}}><form className="panel" onSubmit={pay}><h3>Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={e=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}>{["BANK_TRANSFER","UPI","CASH","CARD","CHEQUE","OTHER"].map(m=><option key={m}>{m}</option>)}</select></label><label>Reference<input value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></label></div><button className="primary-button">Record Payment</button></form>
<form className="panel" onSubmit={purchaseReturn}><h3>Purchase Return</h3><div className="settings-fields"><label>Supplier<select required value={ret.supplierId} onChange={e=>setRet({...ret,supplierId:e.target.value})}><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Product<select required value={ret.productId} onChange={e=>setRet({...ret,productId:e.target.value})}><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Quantity<input type="number" min="1" required value={ret.qty} onChange={e=>setRet({...ret,qty:e.target.value})}/></label><label>Reason<input required value={ret.reason} onChange={e=>setRet({...ret,reason:e.target.value})}/></label></div><button className="secondary-button">Complete Return</button></form></div>
<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3>{orders.length===0?<EmptyState title="No purchase orders" message="Create a draft purchase order to begin procurement."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Next Action</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find(s=>s.id===o.supplier_id)?.supplier_name||"Supplier"}</td><td><StatusBadge status={o.status}/></td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td><div className="button-row compact">{o.status==="DRAFT"?<button className="secondary-button" onClick={()=>rpc("submit_purchase_order",{p_po_id:o.id},"Submitted for approval")}>Submit</button>:null}{o.status==="APPROVAL_PENDING"?<button className="primary-button" onClick={()=>rpc("approve_purchase_order",{p_po_id:o.id},"Purchase order approved")}>Approve</button>:null}{o.status==="APPROVED"?<button className="secondary-button" onClick={()=>rpc("set_purchase_order_status",{p_po_id:o.id,p_status:"SENT"},"Purchase order marked sent")}>Mark Sent</button>:null}</div></td></tr>)}</tbody></table></div>}</section>
<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map(b=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
</div>}
```

### `src/pages/PurchaseIntelligence.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import AutomationHub from "./AutomationHub";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export default function PurchaseIntelligence() {
  const { products } = useShop();
  const [productId, setProductId] = useState("");
  const [comparison, setComparison] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  async function loadSupplierIntelligence() {
    const { data, error } = await supabase.rpc("supplier_intelligence", { p_days: 180 });
    if (error) setMessage("Unable to load supplier intelligence.");
    else setSuppliers(data || []);
  }

  useEffect(() => { loadSupplierIntelligence(); }, []);

  async function inspectProduct(id) {
    setProductId(id);
    setComparison([]); setHistory([]); setMessage("");
    if (!id) return;
    setLoading(true);
    const [compare, price] = await Promise.all([
      supabase.rpc("supplier_price_comparison", { p_product_id: id, p_days: 180 }),
      supabase.rpc("purchase_price_history", { p_product_id: id, p_limit: 24 }),
    ]);
    if (compare.error || price.error) setMessage("Unable to load purchase intelligence for this product.");
    else { setComparison(compare.data || []); setHistory(price.data || []); }
    setLoading(false);
  }

  const latest = history[0];
  const previous = history[1];
  const priceDiff = latest && previous ? Number(latest.purchase_price) - Number(previous.purchase_price) : null;
  const pct = previous && Number(previous.purchase_price) > 0 ? priceDiff / Number(previous.purchase_price) * 100 : null;
  const marginPct = selected?.price > 0 && latest ? (selected.price - Number(latest.purchase_price)) / selected.price * 100 : null;
  const priceTrend = useMemo(() => history.slice().reverse().map((r) => ({ label: r.invoice_date || "Purchase", value: Number(r.purchase_price || 0) })), [history]);
  const supplierChart = useMemo(() => comparison.slice().sort((a,b)=>Number(a.avg_price||0)-Number(b.avg_price||0)).map((r)=>({label:r.supplier_name||"Supplier",value:Number(r.avg_price||0)})), [comparison]);

  return <div>
    <PageHeader title="Smart Purchase Intelligence" subtitle="OCR review, purchase-price change, supplier comparison and margin impact." tier="PRO"/>
    {message ? <div className="purchase-message">{message}</div> : null}

    <section className="panel intelligence-filter">
      <label>Analyze Product
        <select value={productId} onChange={(e) => inspectProduct(e.target.value)}>
          <option value="">Select product</option>
          {products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
    </section>

    {loading ? <LoadingState label="Analyzing purchase history..."/> : null}
    {selected && !loading ? <>
      <div className="metric-grid four" style={{ marginTop: 16 }}>
        <div className="metric-card"><span>Current Selling Price</span><strong>{money.format(selected.price)}</strong></div>
        <div className="metric-card"><span>Latest Purchase Price</span><strong>{latest ? money.format(latest.purchase_price) : "No history"}</strong></div>
        <div className="metric-card"><span>Latest Change</span><strong>{priceDiff === null ? "-" : `${priceDiff >= 0 ? "+" : ""}${money.format(priceDiff)}${pct === null ? "" : ` (${pct.toFixed(2)}%)`}`}</strong></div>
        <div className="metric-card"><span>Estimated Gross Margin</span><strong>{marginPct === null ? "-" : `${marginPct.toFixed(2)}%`}</strong></div>
      </div>

      <div className="dashboard-chart-grid" style={{ marginTop: 16 }}>
        <LineChartCard title="Purchase Price Trend" subtitle="Historical unit purchase cost for the selected SKU" data={priceTrend} formatValue={(v)=>money.format(v)}/>
        <HorizontalBarChartCard title="Supplier Average Price" subtitle="Lower bars indicate more competitive historical unit cost" data={supplierChart} formatValue={(v)=>money.format(v)}/>
      </div>

      <div className="settings-grid" style={{ marginTop: 16 }}>
        <section className="panel"><h3>Supplier Price Comparison</h3>{comparison.length === 0 ? <EmptyState title="No supplier history yet" message="Receive this product from suppliers to build comparison history."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Units</th><th>Avg</th><th>Min</th><th>Max</th><th>Last</th></tr></thead><tbody>{comparison.map((r) => <tr key={r.supplier_id}><td>{r.supplier_name || "Supplier"}</td><td>{r.purchase_count}</td><td>{r.total_units}</td><td>{money.format(r.avg_price)}</td><td>{money.format(r.min_price)}</td><td>{money.format(r.max_price)}</td><td>{money.format(r.last_price)}</td></tr>)}</tbody></table></div>}</section>
        <section className="panel"><h3>Recent Price History</h3>{history.length === 0 ? <EmptyState title="No price history" message="Purchase receipts will populate this timeline."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Price</th></tr></thead><tbody>{history.slice(0, 10).map((r, i) => <tr key={`${r.invoice_date || i}-${r.invoice_date}`}><td>{r.invoice_date}</td><td>{r.supplier_name || "-"}</td><td>{money.format(r.purchase_price)}</td></tr>)}</tbody></table></div>}</section>
      </div>
    </> : null}

    <section className="panel" style={{ marginTop: 16 }}><h3>Supplier Intelligence · Last 180 Days</h3>{suppliers.length === 0 ? <EmptyState title="No supplier activity yet" message="Purchases and supplier payments will build reliability and price history."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Purchase Total</th><th>Returns</th><th>Outstanding</th><th>Ordered</th><th>Received</th><th>Variance</th></tr></thead><tbody>{suppliers.map((r) => <tr key={r.supplier_id}><td>{r.supplier_name}</td><td>{r.purchase_count}</td><td>{money.format(r.purchase_total)}</td><td>{money.format(r.return_total)}</td><td>{money.format(r.outstanding)}</td><td>{r.po_ordered}</td><td>{r.po_received}</td><td>{r.receive_variance}</td></tr>)}</tbody></table></div>}</section>

    <div className="embedded-capability" style={{ marginTop: 20 }}><AutomationHub/></div>
  </div>;
}
```

### `src/pages/Recommendations.jsx`

```javascript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
export default function Recommendations(){const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("owner_recommendations",{p_history_days:30});if(error)setMsg("Unable to calculate recommendations.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Smart Recommendations" subtitle="Rule-based actions from live stock, sales, inventory health and shift variance." tier="PLUS"/>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel recommendation-list">{rows.length===0?<EmptyState title="No recommendations right now" message="The shop has no configured condition requiring an action."/>:rows.map((r,i)=><div className="recommendation-card" key={`${r.recommendation_type}-${i}`}><div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span><h3>{r.title}</h3><p>{r.message}</p></div><Link className="secondary-button" to={r.action_path||"/owner"}>Take Action</Link></div>)}</section></div>}
```

### `src/pages/ReportsConsolidated.jsx`

```javascript
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, LineChartCard } from "../components/charts/BusinessCharts";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
function csvEscape(value){const s=String(value??"");return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function downloadCsv(name,headers,rows){const csv=[headers.join(","),...rows.map(r=>r.map(csvEscape).join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
export default function ReportsConsolidated(){const{sales,purchases,products,getStock}=useShop();const now=new Date();const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));const[to,setTo]=useState(now.toISOString().slice(0,10));const[expenses,setExpenses]=useState([]);const[message,setMessage]=useState("");async function load(){const{data,error}=await supabase.from("expenses").select("expense_date,amount,description,payment_method,status,expense_categories(name)").gte("expense_date",from).lte("expense_date",to).order("expense_date",{ascending:false});if(error)setMessage("Unable to load expenses for report.");else setExpenses(data||[])}useEffect(()=>{load()},[]);
const fs=sales.filter(s=>s.createdAt?.slice(0,10)>=from&&s.createdAt?.slice(0,10)<=to&&s.status!=="VOID");const fp=purchases.filter(p=>p.invoiceDate>=from&&p.invoiceDate<=to);const salesTotal=fs.reduce((a,s)=>a+s.grandTotal,0);const purchaseTotal=fp.reduce((a,p)=>a+p.total,0);const expenseTotal=expenses.filter(e=>e.status==="ACTIVE").reduce((a,e)=>a+Number(e.amount||0),0);const inventoryValue=useMemo(()=>products.reduce((a,p)=>a+getStock(p.id)*p.purchasePrice,0),[products,getStock]);
const trend=useMemo(()=>{const map=new Map();fs.forEach(s=>{const k=s.createdAt.slice(0,10);map.set(k,(map.get(k)||0)+Number(s.grandTotal||0))});return [...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({label:new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}),value}))},[fs]);
const paymentMix=useMemo(()=>{const map={};fs.forEach(s=>{const k=String(s.paymentMethod||"OTHER").toUpperCase();map[k]=(map[k]||0)+Number(s.grandTotal||0)});return Object.entries(map).map(([label,value])=>({label,value}))},[fs]);
return <div><PageHeader title="Reports & Exports" subtitle="Operational reporting with visual trends and accountant-friendly CSV exports."/><div className="panel filter-bar"><label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label><button className="primary-button" onClick={load}>Refresh</button></div>{message?<div className="purchase-message">{message}</div>:null}<div className="metric-grid four" style={{marginTop:16}}><div className="metric-card metric-accent-blue"><span>Sales</span><strong>{money.format(salesTotal)}</strong></div><div className="metric-card metric-accent-indigo"><span>Purchases</span><strong>{money.format(purchaseTotal)}</strong></div><div className="metric-card metric-accent-orange"><span>Expenses</span><strong>{money.format(expenseTotal)}</strong></div><div className="metric-card metric-accent-green"><span>Inventory Cost</span><strong>{money.format(inventoryValue)}</strong></div></div>
<div className="dashboard-chart-grid" style={{marginTop:16}}><LineChartCard title="Sales Trend" subtitle="Sales value across the selected report period" data={trend} formatValue={(v)=>money.format(v)}/><DonutChartCard title="Payment Mix" subtitle="Selected-period payment distribution" data={paymentMix} formatValue={(v)=>money.format(v)} centerLabel="Sales"/></div>
<section className="panel" style={{marginTop:16}}><h3>Export Center</h3><div className="button-row wrap"><button className="secondary-button" onClick={()=>downloadCsv(`sales-${from}-${to}.csv`,["Invoice","Date","Payment","Subtotal","Discount","Total"],fs.map(s=>[s.invoiceNumber,s.createdAt,s.paymentMethod,s.subtotal,s.discount,s.grandTotal]))}>Export Sales CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`purchases-${from}-${to}.csv`,["Purchase","Invoice","Date","Supplier","Units","Total"],fp.map(p=>[p.purchaseNumber,p.invoiceNumber,p.invoiceDate,p.supplierName,p.totalUnits,p.total]))}>Export Purchases CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`inventory-${new Date().toISOString().slice(0,10)}.csv`,["SKU","Barcode","Product","Category","Stock","Purchase Price","Selling Price"],products.map(p=>[p.sku,p.barcode,p.name,p.category,getStock(p.id),p.purchasePrice,p.price]))}>Export Inventory CSV</button><button className="secondary-button" onClick={()=>downloadCsv(`expenses-${from}-${to}.csv`,["Date","Category","Description","Method","Amount","Status"],expenses.map(e=>[e.expense_date,e.expense_categories?.name,e.description,e.payment_method,e.amount,e.status]))}>Export Expenses CSV</button></div><p className="muted-text">CSV exports are the first accounting integration point. Any exact Tally import format should be validated with the accountant before claiming compatibility.</p></section>
<section className="panel" style={{marginTop:16}}><h3>Sales Summary</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead><tbody>{fs.slice(0,100).map(s=><tr key={s.id}><td>{s.invoiceNumber}</td><td>{new Date(s.createdAt).toLocaleString("en-IN")}</td><td>{s.paymentMethod}</td><td>{money.format(s.discount)}</td><td>{money.format(s.grandTotal)}</td></tr>)}</tbody></table></div></section></div>}
```

### `src/pages/Settings.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import LoadingState from "../components/ui/LoadingState";

const emptyForm = {
  shopName: "", shopSlug: "", storeAddress: "", storePhone: "", taxRegistrationNumber: "",
  currencyCode: "INR", currencySymbol: "₹", invoicePrefix: "INV", purchasePrefix: "PUR",
  taxEnabled: false, taxPercentage: 0, printerPaperMm: 80, receiptFooter: "",
};

export default function Settings() {
  const { refreshAccess } = useAuth();
  const { products, sales, purchases, createBackup, refreshAll } = useShop();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    const { data, error } = await supabase.rpc("get_shop_configuration");
    if (error) setMessage("Unable to load shop settings.");
    else if (data?.[0]) {
      const r = data[0];
      setForm({
        shopName: r.shop_name || "", shopSlug: r.shop_slug || "", storeAddress: r.store_address || "",
        storePhone: r.store_phone || "", taxRegistrationNumber: r.tax_registration_number || "",
        currencyCode: r.currency_code || "INR", currencySymbol: r.currency_symbol || "₹",
        invoicePrefix: r.invoice_prefix || "INV", purchasePrefix: r.purchase_prefix || "PUR",
        taxEnabled: Boolean(r.tax_enabled), taxPercentage: Number(r.tax_percentage || 0),
        printerPaperMm: Number(r.printer_paper_mm || 80), receiptFooter: r.receipt_footer || "",
      });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.rpc("update_shop_configuration", {
      p_shop_name: form.shopName,
      p_store_address: form.storeAddress || null,
      p_store_phone: form.storePhone || null,
      p_tax_registration_number: form.taxRegistrationNumber || null,
      p_currency_code: form.currencyCode,
      p_currency_symbol: form.currencySymbol,
      p_invoice_prefix: form.invoicePrefix,
      p_purchase_prefix: form.purchasePrefix,
      p_tax_enabled: form.taxEnabled,
      p_tax_percentage: Number(form.taxPercentage || 0),
      p_printer_paper_mm: Number(form.printerPaperMm),
      p_receipt_footer: form.receiptFooter || null,
    });
    if (error) setMessage("Unable to save shop settings. Check the values and try again.");
    else {
      setMessage("Shop settings saved successfully.");
      await Promise.all([refreshAccess(), refreshAll()]);
      await load();
    }
    setBusy(false);
  }

  function exportSnapshot() {
    const backup = createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wineshoppos-cloud-snapshot-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <LoadingState label="Loading shop settings..."/>;

  return <div>
    <PageHeader title="Shop Settings" subtitle="Edit the operational identity, invoice numbering, receipt and printer defaults for the current shop."/>
    {message ? <div className="purchase-message">{message}</div> : null}
    <form onSubmit={save}>
      <div className="settings-grid">
        <section className="panel settings-section">
          <div className="settings-section-heading"><div><h3>Shop Identity</h3><p>Customer-facing details used across receipts and operational screens.</p></div></div>
          <div className="settings-fields">
            <label>Shop Name<input required value={form.shopName} onChange={(e)=>setForm({...form,shopName:e.target.value})}/></label>
            <label>Shop Slug<input value={form.shopSlug} disabled/><small>Stable system identifier. It is intentionally read-only.</small></label>
            <label>Phone<input value={form.storePhone} onChange={(e)=>setForm({...form,storePhone:e.target.value})} placeholder="+91 ..."/></label>
            <label>Tax / Registration Number<input value={form.taxRegistrationNumber} onChange={(e)=>setForm({...form,taxRegistrationNumber:e.target.value})}/></label>
            <label className="span-two">Address<textarea value={form.storeAddress} onChange={(e)=>setForm({...form,storeAddress:e.target.value})}/></label>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="settings-section-heading"><div><h3>Billing & Numbering</h3><p>Defaults used by invoices, purchase documents and receipts.</p></div></div>
          <div className="settings-fields">
            <label>Currency Code<input required maxLength="3" value={form.currencyCode} onChange={(e)=>setForm({...form,currencyCode:e.target.value.toUpperCase()})}/></label>
            <label>Currency Symbol<input required maxLength="4" value={form.currencySymbol} onChange={(e)=>setForm({...form,currencySymbol:e.target.value})}/></label>
            <label>Invoice Prefix<input required maxLength="12" value={form.invoicePrefix} onChange={(e)=>setForm({...form,invoicePrefix:e.target.value.toUpperCase()})}/></label>
            <label>Purchase Prefix<input required maxLength="12" value={form.purchasePrefix} onChange={(e)=>setForm({...form,purchasePrefix:e.target.value.toUpperCase()})}/></label>
            <label>Receipt Paper<select value={form.printerPaperMm} onChange={(e)=>setForm({...form,printerPaperMm:Number(e.target.value)})}><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label>
            <label className="span-two">Receipt Footer<textarea value={form.receiptFooter} onChange={(e)=>setForm({...form,receiptFooter:e.target.value})} placeholder="Thank you for your purchase"/></label>
          </div>
        </section>
      </div>

      <section className="panel settings-section" style={{marginTop:16}}>
        <div className="settings-section-heading"><div><h3>Tax Configuration</h3><p>Enable only when the shop's verified accounting/legal configuration requires it.</p></div></div>
        <div className="settings-inline-row">
          <label className="toggle-field"><input type="checkbox" checked={form.taxEnabled} onChange={(e)=>setForm({...form,taxEnabled:e.target.checked})}/><span>Enable configured tax percentage</span></label>
          <label>Tax Percentage<input type="number" min="0" step="0.01" disabled={!form.taxEnabled} value={form.taxPercentage} onChange={(e)=>setForm({...form,taxPercentage:e.target.value})}/></label>
        </div>
        <p className="muted-text">WineShopPOS does not invent state liquor/excise rules. Configure tax only from verified requirements.</p>
      </section>

      <div className="settings-action-bar">
        <div><strong>{products.length}</strong> products · <strong>{sales.length}</strong> sales loaded · <strong>{purchases.length}</strong> purchases loaded</div>
        <div className="button-row"><button type="button" className="secondary-button" onClick={refreshAll}>Refresh Cloud Data</button><button type="button" className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save Shop Settings"}</button></div>
      </div>
    </form>
  </div>;
}
```

### `src/pages/Transfers.jsx`

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
export default function Transfers(){const{products,getStock,refreshAll}=useShop();const{profile}=useAuth();const[dest,setDest]=useState([]);const[transfers,setTransfers]=useState([]);const[destination,setDestination]=useState("");const[productId,setProductId]=useState("");const[qty,setQty]=useState(1);const[message,setMessage]=useState("");
async function load(){const[d,t]=await Promise.all([supabase.rpc("available_transfer_destinations"),supabase.from("stock_transfers").select("*,stock_transfer_items(*)").order("created_at",{ascending:false}).limit(150)]);if(d.error||t.error)setMessage("Unable to load transfer queue.");else{setDest(d.data||[]);setTransfers(t.data||[])}}useEffect(()=>{load()},[]);
async function create(e){e.preventDefault();const{error}=await supabase.rpc("create_stock_transfer",{p_destination_shop_id:destination,p_items:[{product_id:productId,quantity:Number(qty)}],p_notes:null});setMessage(error?"Unable to request transfer.":"Transfer requested. Destination must approve before dispatch.");if(!error){setProductId("");setQty(1);load()}}
async function act(fn,id,args={},ok="Transfer updated"){const{error}=await supabase.rpc(fn,{p_transfer_id:id,...args});setMessage(error?`Unable to ${ok.toLowerCase()}.`:ok);if(!error){await Promise.all([load(),refreshAll()])}}
function actions(t){const incoming=t.destination_shop_id===profile?.shop_id;const outgoing=t.source_shop_id===profile?.shop_id;if(t.status==="REQUESTED"&&incoming)return <><button className="primary-button" onClick={()=>act("approve_stock_transfer",t.id,{},"Transfer approved")}>Approve</button><button className="secondary-button" onClick={()=>act("reject_stock_transfer",t.id,{p_note:"Rejected from consolidated transfer screen"},"Transfer rejected")}>Reject</button></>;if(t.status==="REQUESTED"&&outgoing)return <button className="secondary-button" onClick={()=>act("cancel_stock_transfer",t.id,{},"Transfer cancelled")}>Cancel</button>;if(t.status==="APPROVED"&&outgoing)return <button className="primary-button" onClick={()=>act("dispatch_stock_transfer",t.id,{},"Transfer dispatched; source stock deducted")}>Dispatch</button>;if(t.status==="DISPATCHED"&&outgoing)return <button className="secondary-button" onClick={()=>act("mark_stock_transfer_in_transit",t.id,{},"Transfer marked in transit")}>Mark In Transit</button>;if(["DISPATCHED","IN_TRANSIT"].includes(t.status)&&incoming)return <button className="primary-button" onClick={()=>act("receive_stock_transfer",t.id,{},"Transfer received; destination stock increased")}>Receive</button>;if(t.status==="RECEIVED"&&incoming)return <button className="primary-button" onClick={()=>act("complete_stock_transfer",t.id,{},"Transfer completed")}>Complete</button>;return <span className="muted-text">No action</span>}
return <div><PageHeader title="Advanced Stock Transfers" subtitle="Request → approve → dispatch → in transit → receive → complete. Stock changes follow the physical lifecycle." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={create}><h3>Request Transfer</h3>{dest.length===0?<EmptyState title="No transfer destination" message="Only shops inside the same organization can be destinations."/>:<div className="settings-fields"><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)} required><option value="">Select branch</option>{dest.map(d=><option key={d.shop_id} value={d.shop_id}>{d.shop_name}</option>)}</select></label><label>Product<select value={productId} onChange={e=>setProductId(e.target.value)} required><option value="">Select product</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} · stock {getStock(p.id)}</option>)}</select></label><label>Quantity<input type="number" min="1" max={productId?getStock(productId):99999} value={qty} onChange={e=>setQty(e.target.value)} required/></label><button className="primary-button">Request</button></div>}</form><section className="panel"><h3>Transaction Safety</h3><p>Approval reserves permission only. Source stock is deducted only at Dispatch. Destination stock is increased only at Receive.</p><p>Every inventory change is performed inside a database RPC and recorded as a stock movement.</p></section></div><section className="panel" style={{marginTop:16}}><h3>Transfer Queue</h3>{transfers.length===0?<EmptyState title="No transfers" message="Transfer requests will appear here."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Created</th><th>Direction</th><th>Qty</th><th>Status</th><th>Dispatched</th><th>Received</th><th>Action</th></tr></thead><tbody>{transfers.map(t=>{const incoming=t.destination_shop_id===profile?.shop_id;return <tr key={t.id}><td>{new Date(t.created_at).toLocaleString("en-IN")}</td><td>{incoming?"INCOMING":"OUTGOING"}</td><td>{(t.stock_transfer_items||[]).reduce((s,i)=>s+Number(i.quantity||0),0)}</td><td><StatusBadge status={t.status}/></td><td>{t.dispatched_at?new Date(t.dispatched_at).toLocaleString("en-IN"):"-"}</td><td>{t.received_at?new Date(t.received_at).toLocaleString("en-IN"):"-"}</td><td><div className="button-row compact">{actions(t)}</div></td></tr>})}</tbody></table></div>}</section></div>}
```

### `src/pages/Users.jsx`

```javascript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function Users() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "CASHIER" });
  const isAdmin = profile?.role === "ADMIN";

  async function callFunction(body) {
    const { data, error } = await supabase.functions.invoke("manage-shop-users", { body });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || "Operation failed");
    return data;
  }

  async function loadUsers() {
    if (!isAdmin) return;
    try { const data = await callFunction({ action: "list" }); setUsers(data.users || []); }
    catch (error) { setMessage(error.message || "Unable to load users."); }
  }

  useEffect(() => { loadUsers(); }, [isAdmin]);

  async function createUser(event) {
    event.preventDefault(); setMessage("");
    try {
      await callFunction({ action: "create", fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      setForm({ fullName: "", email: "", password: "", role: "CASHIER" });
      setMessage("User created successfully."); await loadUsers();
    } catch (error) { setMessage(error.message || "Unable to create user."); }
  }

  async function setActive(userId, active) {
    setBusyId(userId); setMessage("");
    try { await callFunction({ action: "set_active", userId, active }); setMessage(active ? "User enabled." : "User disabled."); await loadUsers(); }
    catch (error) { setMessage(error.message || "Unable to update user status."); }
    setBusyId("");
  }

  async function setRole(userId, role) {
    setBusyId(userId); setMessage("");
    try { await callFunction({ action: "set_role", userId, role }); setMessage(`Role changed to ${role}.`); await loadUsers(); }
    catch (error) { setMessage(error.message || "Unable to change user role."); }
    setBusyId("");
  }

  if (!isAdmin) return <section className="panel"><h2>Users</h2><p>Only the Shop Admin can manage users and roles.</p></section>;

  return <div>
    <PageHeader title="Users & Roles" subtitle="Create staff, change Cashier/Manager responsibilities and disable access without weakening backend security." actions={<Link className="secondary-button button-link" to="/admin/access">View Access Matrix</Link>}/>
    {message ? <div className="purchase-message">{message}</div> : null}
    <div className="settings-grid">
      <form className="panel settings-section" onSubmit={createUser}>
        <div className="settings-section-heading"><div><h3>Create Shop User</h3><p>Create operational staff only. Shop Admin creation remains platform-controlled.</p></div></div>
        <div className="settings-fields">
          <label>Full Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label>
          <label>Email<input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
          <label>Temporary Password<input type="password" required minLength="8" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label>
          <label>Role<select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select></label>
        </div>
        <button className="primary-button">Create User</button>
      </form>
      <section className="panel settings-section">
        <div className="settings-section-heading"><div><h3>Role Principle</h3><p>Give each user the least access needed for their job.</p></div></div>
        <div className="role-rule-list">
          <div><StatusBadge status="CASHIER"/><span>Sell, scan, own shift, permitted sales/returns and offline queue.</span></div>
          <div><StatusBadge status="MANAGER"/><span>Operational control: products, purchasing, inventory, approvals, expenses and reports.</span></div>
          <div><StatusBadge status="ADMIN"/><span>Owner/Admin functions: Owner Center, users, settings, backup and audit.</span></div>
        </div>
        <Link to="/admin/access">Open the complete role access matrix →</Link>
      </section>
    </div>

    <section className="panel" style={{marginTop:18}}>
      <div className="section-row"><div><h3>Shop Users</h3><p className="muted-text">Role changes take effect after the user's access state refreshes/signs in again.</p></div></div>
      {users.length === 0 ? <EmptyState title="No shop users" message="Create the first Manager or Cashier account above."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access Management</th></tr></thead><tbody>{users.map((item)=><tr key={item.id}><td><strong>{item.full_name}</strong></td><td>{item.email || "-"}</td><td>{item.role === "ADMIN" ? <StatusBadge status="ADMIN"/> : <select className="role-select" value={item.role} disabled={busyId===item.id} onChange={(e)=>setRole(item.id,e.target.value)}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select>}</td><td><StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"}/></td><td>{item.role === "ADMIN" ? <span className="muted-text">Platform controlled</span> : <button className="secondary-button" disabled={busyId===item.id} onClick={()=>setActive(item.id,!item.active)}>{item.active ? "Disable Access" : "Enable Access"}</button>}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
```

### `supabase/functions/manage-shop-users/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(url, serviceKey);

    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) throw new Error("Invalid session");

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("id,shop_id,role,active")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile) throw new Error("Profile not found");
    if (!callerProfile.active) throw new Error("Account disabled");
    if (callerProfile.role !== "ADMIN") throw new Error("Admin role required");

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id,access_enabled,subscription_status,subscription_end_date,max_users")
      .eq("id", callerProfile.shop_id)
      .single();

    if (shopError || !shop) throw new Error("Shop not found");
    const today = new Date().toISOString().slice(0, 10);
    const allowed = shop.access_enabled === true &&
      ["TRIAL", "ACTIVE"].includes(shop.subscription_status) &&
      (!shop.subscription_end_date || shop.subscription_end_date >= today);
    if (!allowed) throw new Error("SHOP_ACCESS_DISABLED");

    const body = await req.json();
    const action = body.action;

    if (action === "list") {
      const { data, error } = await admin
        .from("profiles")
        .select("id,full_name,email,phone,avatar_url,role,active,created_at")
        .eq("shop_id", callerProfile.shop_id)
        .order("created_at");
      if (error) throw error;
      return Response.json({ ok: true, users: data }, { headers: corsHeaders });
    }

    if (action === "create") {
      const role = String(body.role || "").toUpperCase();
      if (!["MANAGER", "CASHIER"].includes(role)) {
        throw new Error("Shop Admin can create only MANAGER or CASHIER");
      }

      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!fullName || !email || password.length < 8) {
        throw new Error("Name, email and password (8+ chars) are required");
      }

      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", callerProfile.shop_id);
      if ((count ?? 0) >= shop.max_users) throw new Error(`Shop user limit reached (${shop.max_users})`);

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name: fullName },
      });
      if (createError) throw createError;

      const { error: profileInsert } = await admin.from("profiles").insert({
        id: created.user.id,
        shop_id: callerProfile.shop_id,
        full_name: fullName,
        email,
        role,
        active: true,
      });

      if (profileInsert) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw profileInsert;
      }

      const { error: membershipInsert } = await admin.from("user_shop_memberships").upsert({
        user_id: created.user.id,
        shop_id: callerProfile.shop_id,
        role,
        active: true,
      }, { onConflict: "user_id,shop_id" });

      if (membershipInsert) {
        await admin.from("profiles").delete().eq("id", created.user.id);
        await admin.auth.admin.deleteUser(created.user.id);
        throw membershipInsert;
      }

      return Response.json({ ok: true, userId: created.user.id }, { headers: corsHeaders });
    }

    if (action === "set_role") {
      const targetId = String(body.userId || "");
      const role = String(body.role || "").toUpperCase();
      if (!["MANAGER", "CASHIER"].includes(role)) throw new Error("Role must be MANAGER or CASHIER");
      if (targetId === callerProfile.id) throw new Error("Shop ADMIN role is platform controlled");

      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id,shop_id,role,active")
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id)
        .single();
      if (targetError || !target) throw new Error("User not found");
      if (target.role === "ADMIN") throw new Error("Shop ADMIN role is platform controlled");

      const { error: profileUpdate } = await admin
        .from("profiles")
        .update({ role })
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id);
      if (profileUpdate) throw profileUpdate;

      const { error: membershipUpdate } = await admin
        .from("user_shop_memberships")
        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role, active: target.active }, { onConflict: "user_id,shop_id" });
      if (membershipUpdate) {
        // Keep profile + membership authorization state consistent if the second write fails.
        await admin.from("profiles").update({ role: target.role }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
        throw membershipUpdate;
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    if (action === "set_active") {
      const targetId = String(body.userId || "");
      const active = body.active === true;
      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id,shop_id,role,active")
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id)
        .single();

      if (targetError || !target) throw new Error("User not found");
      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");

      const { error: profileUpdate } = await admin
        .from("profiles").update({ active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
      if (profileUpdate) throw profileUpdate;

      const { error: membershipUpdate } = await admin
        .from("user_shop_memberships")
        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role: target.role, active }, { onConflict: "user_id,shop_id" });
      if (membershipUpdate) {
        await admin.from("profiles").update({ active: target.active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
        throw membershipUpdate;
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 400, headers: corsHeaders },
    );
  }
});
```

### `supabase/migrations/20260829233000_master_reconsolidation.sql`

```sql
-- WineShopPOS Master Reconsolidation
-- UX/product consolidation over the existing Chapters 1-26 architecture.
-- IMPORTANT: This migration is additive/replacement-only for functions and constraints.
-- It does not drop transactional history or rebuild existing sale/purchase/inventory tables.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. ACCOUNT / PROFILE UX + FUTURE MULTI-SHOP MEMBERSHIP
-- ============================================================
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists theme text not null default 'SYSTEM';

do $$ begin
  alter table public.profiles add constraint profiles_theme_check
    check (theme in ('SYSTEM','LIGHT','DARK'));
exception when duplicate_object then null; end $$;

create table if not exists public.user_shop_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  role text not null check (role in ('ADMIN','MANAGER','CASHIER')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

drop trigger if exists trg_user_shop_memberships_updated_at on public.user_shop_memberships;
create trigger trg_user_shop_memberships_updated_at before update on public.user_shop_memberships
for each row execute function public.set_updated_at();

insert into public.user_shop_memberships(user_id,shop_id,role,active)
select id,shop_id,role,active from public.profiles
on conflict (user_id,shop_id) do update
set role=excluded.role,active=excluded.active;

drop function if exists public.my_profile();
create function public.my_profile()
returns table (
  user_id uuid,
  shop_id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  theme text,
  role text,
  active boolean,
  shop_name text,
  shop_slug text,
  organization_id uuid,
  organization_name text,
  max_users integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.shop_id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.theme,
    p.role,
    p.active,
    s.name,
    s.slug,
    s.organization_id,
    o.name,
    s.max_users
  from public.profiles p
  join public.shops s on s.id=p.shop_id
  left join public.organizations o on o.id=s.organization_id
  where p.id=auth.uid();
$$;

create or replace function public.update_my_profile(
  p_full_name text,
  p_phone text default null,
  p_avatar_url text default null,
  p_theme text default 'SYSTEM'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(p_full_name),'') is null then raise exception 'Display name is required'; end if;
  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
  update public.profiles
  set full_name=trim(p_full_name),phone=nullif(trim(p_phone),''),avatar_url=nullif(trim(p_avatar_url),''),theme=p_theme
  where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

create or replace function public.my_shop_memberships()
returns table(shop_id uuid,shop_name text,shop_slug text,role text,is_current boolean)
language sql
stable
security definer
set search_path = public
as $$
  select m.shop_id,s.name,s.slug,m.role,(m.shop_id=public.current_shop_id())
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  where m.user_id=auth.uid() and m.active=true and s.active=true and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date)
  order by (m.shop_id=public.current_shop_id()) desc,s.name;
$$;

create or replace function public.switch_shop(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_role text;
begin
  select m.role into v_role
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  where m.user_id=auth.uid() and m.shop_id=p_shop_id and m.active=true and s.active=true and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date);
  if v_role is null then raise exception 'You do not have access to this shop'; end if;
  update public.profiles set shop_id=p_shop_id,role=v_role where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

-- ============================================================
-- 2. EXPENSE MANAGEMENT (CORE)
-- ============================================================
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(shop_id,name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  expense_date date not null default current_date,
  amount numeric(14,2) not null check (amount>0),
  description text not null,
  payment_method text not null check (payment_method in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER')),
  reference_number text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','VOID')),
  entered_by uuid not null references auth.users(id) on delete restrict,
  voided_by uuid references auth.users(id) on delete set null,
  void_reason text,
  voided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_expenses_shop_date on public.expenses(shop_id,expense_date desc);

insert into public.expense_categories(shop_id,name)
select s.id,x.name from public.shops s
cross join (values ('Rent'),('Salary'),('Electricity'),('Transport'),('Maintenance'),('Miscellaneous')) x(name)
on conflict(shop_id,name) do nothing;

create or replace function public.record_expense(
  p_category_id uuid,p_expense_date date,p_amount numeric,p_description text,p_payment_method text,p_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_amount<=0 then raise exception 'Expense amount must be positive'; end if;
  if nullif(trim(p_description),'') is null then raise exception 'Description is required'; end if;
  if p_payment_method not in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER') then raise exception 'Invalid payment method'; end if;
  if not exists(select 1 from public.expense_categories where id=p_category_id and shop_id=v_shop and active=true) then raise exception 'Expense category not found'; end if;
  insert into public.expenses(shop_id,category_id,expense_date,amount,description,payment_method,reference_number,entered_by)
  values(v_shop,p_category_id,coalesce(p_expense_date,current_date),p_amount,trim(p_description),p_payment_method,nullif(trim(p_reference),''),auth.uid())
  returning id into v_id;
  perform public.write_audit(v_shop,'EXPENSE_RECORDED','expense',v_id::text,null,null,jsonb_build_object('amount',p_amount,'category_id',p_category_id));
  return v_id;
end;$$;

create or replace function public.void_expense(p_expense_id uuid,p_reason text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if nullif(trim(p_reason),'') is null then raise exception 'Void reason is required'; end if;
  update public.expenses set status='VOID',voided_by=auth.uid(),void_reason=trim(p_reason),voided_at=now()
  where id=p_expense_id and shop_id=v_shop and status='ACTIVE';
  if not found then raise exception 'Active expense not found'; end if;
  perform public.write_audit(v_shop,'EXPENSE_VOIDED','expense',p_expense_id::text,null,null,jsonb_build_object('reason',p_reason));
end;$$;

-- ============================================================
-- 3. CUSTOMER + CREDIT / UDHAAR (PLUS)
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  full_name text not null,
  mobile text,
  email text,
  notes text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create unique index if not exists uq_customers_shop_mobile on public.customers(shop_id,mobile) where mobile is not null and mobile<>'';

alter table public.sales add column if not exists customer_id uuid references public.customers(id) on delete set null;

create table if not exists public.customer_credit_entries (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  entry_type text not null check (entry_type in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT')),
  amount numeric(14,2) not null check (amount>0),
  sale_id uuid references public.sales(id) on delete set null,
  reference_number text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_credit_shop_customer on public.customer_credit_entries(shop_id,customer_id,created_at desc);

create or replace function public.create_customer(p_full_name text,p_mobile text default null,p_email text default null,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  if public.current_user_role() not in ('ADMIN','MANAGER','CASHIER') then raise exception 'Role not allowed'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'Customer name is required'; end if;
  insert into public.customers(shop_id,full_name,mobile,email,notes,created_by)
  values(v_shop,trim(p_full_name),nullif(trim(p_mobile),''),nullif(trim(p_email),''),nullif(trim(p_notes),''),auth.uid())
  returning id into v_id;
  return v_id;
end;$$;

create or replace function public.link_sale_customer(p_sale_id uuid,p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
  update public.sales set customer_id=p_customer_id where id=p_sale_id and shop_id=v_shop;
  if not found then raise exception 'Sale not found'; end if;
end;$$;

create or replace function public.record_customer_credit(
  p_customer_id uuid,p_entry_type text,p_amount numeric,p_sale_id uuid default null,p_reference text default null,p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_entry_type not in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT') then raise exception 'Invalid credit entry type'; end if;
  if p_amount<=0 then raise exception 'Amount must be positive'; end if;
  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
  if p_sale_id is not null and not exists(select 1 from public.sales where id=p_sale_id and shop_id=v_shop) then raise exception 'Sale not found'; end if;
  insert into public.customer_credit_entries(shop_id,customer_id,entry_type,amount,sale_id,reference_number,description,created_by)
  values(v_shop,p_customer_id,p_entry_type,p_amount,p_sale_id,nullif(trim(p_reference),''),nullif(trim(p_description),''),auth.uid()) returning id into v_id;
  perform public.write_audit(v_shop,'CUSTOMER_CREDIT_'||p_entry_type,'customer_credit',v_id::text,null,null,jsonb_build_object('customer_id',p_customer_id,'amount',p_amount));
  return v_id;
end;$$;

create or replace function public.customer_balances()
returns table(customer_id uuid,full_name text,mobile text,total_charges numeric,total_payments numeric,outstanding numeric)
language sql
stable
security definer
set search_path=public
as $$
  select c.id,c.full_name,c.mobile,
    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else 0 end),0),
    coalesce(sum(case when e.entry_type in ('PAYMENT','ADJUSTMENT_CREDIT') then e.amount else 0 end),0),
    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else -e.amount end),0)
  from public.customers c
  left join public.customer_credit_entries e on e.customer_id=c.id and e.shop_id=c.shop_id
  where c.shop_id=public.assert_shop_access() and c.active=true and public.current_user_role() in ('ADMIN','MANAGER')
  group by c.id,c.full_name,c.mobile
  order by 6 desc,c.full_name;
$$;

-- ============================================================
-- 4. COMPLIANCE FOUNDATION (NO LEGAL RULES HARDCODED)
-- ============================================================
create table if not exists public.compliance_profiles (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  state_code text,
  state_name text,
  license_number text,
  license_type text,
  license_valid_from date,
  license_valid_to date,
  excise_registration_number text,
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create or replace function public.upsert_compliance_profile(
  p_state_code text,p_state_name text,p_license_number text,p_license_type text,p_license_valid_from date,p_license_valid_to date,p_excise_registration_number text,p_notes text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  insert into public.compliance_profiles(shop_id,state_code,state_name,license_number,license_type,license_valid_from,license_valid_to,excise_registration_number,notes,updated_by,updated_at)
  values(v_shop,nullif(trim(p_state_code),''),nullif(trim(p_state_name),''),nullif(trim(p_license_number),''),nullif(trim(p_license_type),''),p_license_valid_from,p_license_valid_to,nullif(trim(p_excise_registration_number),''),nullif(trim(p_notes),''),auth.uid(),now())
  on conflict(shop_id) do update set state_code=excluded.state_code,state_name=excluded.state_name,license_number=excluded.license_number,license_type=excluded.license_type,license_valid_from=excluded.license_valid_from,license_valid_to=excluded.license_valid_to,excise_registration_number=excluded.excise_registration_number,notes=excluded.notes,updated_by=auth.uid(),updated_at=now();
end;$$;

-- ============================================================
-- 5. BACKUP / RECOVERY VERIFICATION LOG
-- ============================================================
create table if not exists public.backup_restore_tests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  test_date date not null default current_date,
  environment text not null,
  backup_reference text,
  result text not null check (result in ('PASS','FAIL')),
  notes text,
  tested_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create or replace function public.record_backup_restore_test(p_environment text,p_backup_reference text,p_result text,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  if p_result not in ('PASS','FAIL') then raise exception 'Result must be PASS or FAIL'; end if;
  if nullif(trim(p_environment),'') is null then raise exception 'Test environment is required'; end if;
  insert into public.backup_restore_tests(shop_id,environment,backup_reference,result,notes,tested_by)
  values(v_shop,trim(p_environment),nullif(trim(p_backup_reference),''),p_result,nullif(trim(p_notes),''),auth.uid()) returning id into v_id;
  perform public.write_audit(v_shop,'BACKUP_RESTORE_TEST_'||p_result,'backup_restore_test',v_id::text,null,null,jsonb_build_object('environment',p_environment));
  return v_id;
end;$$;

-- ============================================================
-- 6. HISTORICAL COST SNAPSHOT FOR PROFIT INTELLIGENCE
-- ============================================================
alter table public.sale_items add column if not exists cost_price_snapshot numeric(12,2);
alter table public.sale_items add column if not exists cost_snapshot_source text;

update public.sale_items si
set cost_price_snapshot=p.purchase_price,cost_snapshot_source='CURRENT_PRODUCT_BACKFILL'
from public.products p
where si.product_id=p.id and si.cost_price_snapshot is null;

create or replace function public.set_sale_item_cost_snapshot()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.cost_price_snapshot is null then
    select purchase_price into new.cost_price_snapshot from public.products where id=new.product_id and shop_id=new.shop_id;
    new.cost_snapshot_source:='SALE_TIME_PRODUCT_COST';
  end if;
  return new;
end;$$;

drop trigger if exists trg_sale_item_cost_snapshot on public.sale_items;
create trigger trg_sale_item_cost_snapshot before insert on public.sale_items
for each row execute function public.set_sale_item_cost_snapshot();

-- ============================================================
-- 7. ADVANCED PURCHASE-ORDER APPROVAL LIFECYCLE (PLUS)
-- ============================================================
alter table public.purchase_orders add column if not exists approved_by uuid references auth.users(id) on delete set null;
alter table public.purchase_orders add column if not exists approved_at timestamptz;

alter table public.purchase_orders drop constraint if exists purchase_orders_status_check;
alter table public.purchase_orders add constraint purchase_orders_status_check
check (status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED'));

create or replace function public.submit_purchase_order(p_po_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.purchase_orders set status='APPROVAL_PENDING' where id=p_po_id and shop_id=v_shop and status='DRAFT';
  if not found then raise exception 'Draft purchase order not found'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_SUBMITTED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.approve_purchase_order(p_po_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.purchase_orders set status='APPROVED',approved_by=auth.uid(),approved_at=now()
  where id=p_po_id and shop_id=v_shop and status='APPROVAL_PENDING';
  if not found then raise exception 'Purchase order is not awaiting approval'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_APPROVED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.set_purchase_order_status(p_po_id uuid,p_status text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_status='SENT' then
    update public.purchase_orders set status='SENT' where id=p_po_id and shop_id=v_shop and status='APPROVED';
  elsif p_status='CANCELLED' then
    update public.purchase_orders set status='CANCELLED' where id=p_po_id and shop_id=v_shop and status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT');
  else
    raise exception 'Unsupported purchase order status transition';
  end if;
  if not found then raise exception 'Purchase order cannot be changed from its current status'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_'||p_status,'purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

-- Replace receive_purchase_order only to enforce the approved procurement lifecycle.
create or replace function public.receive_purchase_order(
  p_po_id uuid,p_invoice_number text,p_invoice_date date,p_receive_items jsonb default null,p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;v_po public.purchase_orders%rowtype;r record;v_payload jsonb:='[]'::jsonb;v_qty integer;v_remaining integer;v_purchase uuid;v_all_received boolean;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('APPROVED','SENT','PARTIALLY_RECEIVED') for update;
  if not found then raise exception 'PO must be approved before receiving goods'; end if;
  if p_receive_items is null then
    for r in select * from public.purchase_order_items where purchase_order_id=p_po_id loop
      v_remaining:=r.ordered_quantity-r.received_quantity;
      if v_remaining>0 then
        v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_remaining,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_remaining,'po_item_id',r.id));
      end if;
    end loop;
  else
    for r in select poi.*,x.qty from public.purchase_order_items poi join lateral(
      select (e->>'po_item_id')::uuid id,(e->>'quantity')::integer qty from jsonb_array_elements(p_receive_items)e
    )x on x.id=poi.id where poi.purchase_order_id=p_po_id loop
      v_remaining:=r.ordered_quantity-r.received_quantity;v_qty:=r.qty;
      if v_qty<=0 or v_qty>v_remaining then raise exception 'Invalid receive quantity'; end if;
      v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_qty,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_qty,'po_item_id',r.id));
    end loop;
  end if;
  if jsonb_array_length(v_payload)=0 then raise exception 'Nothing remaining to receive'; end if;
  v_purchase:=public.receive_purchase(v_po.supplier_id,p_invoice_number,p_invoice_date,v_payload,p_notes);
  update public.purchases set purchase_order_id=p_po_id where id=v_purchase;
  for r in select * from jsonb_array_elements(v_payload) loop
    update public.purchase_order_items set received_quantity=received_quantity+(r->>'quantity')::integer where id=(r->>'po_item_id')::uuid;
  end loop;
  select not exists(select 1 from public.purchase_order_items where purchase_order_id=p_po_id and received_quantity<ordered_quantity) into v_all_received;
  update public.purchase_orders set status=case when v_all_received then 'RECEIVED' else 'PARTIALLY_RECEIVED' end where id=p_po_id;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_RECEIVED','purchase_order',p_po_id::text,null,null,jsonb_build_object('purchase_id',v_purchase));
  return v_purchase;
end;$$;

-- ============================================================
-- 8. ADVANCED STOCK TRANSFER LIFECYCLE (PLUS)
-- Existing legacy APPROVED transfers already moved stock atomically; mark them COMPLETE.
-- New lifecycle: REQUESTED -> APPROVED -> DISPATCHED -> IN_TRANSIT -> RECEIVED -> COMPLETED
-- ============================================================
alter table public.stock_transfers drop constraint if exists stock_transfers_status_check;
update public.stock_transfers set status='COMPLETED' where status='APPROVED';
alter table public.stock_transfers add constraint stock_transfers_status_check
check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED','DISPATCHED','IN_TRANSIT','RECEIVED','COMPLETED'));

alter table public.stock_transfers add column if not exists dispatched_by uuid references auth.users(id) on delete set null;
alter table public.stock_transfers add column if not exists received_by uuid references auth.users(id) on delete set null;
alter table public.stock_transfers add column if not exists dispatched_at timestamptz;
alter table public.stock_transfers add column if not exists received_at timestamptz;
alter table public.stock_transfers add column if not exists completed_at timestamptz;

create or replace function public.approve_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;v_transfer public.stock_transfers%rowtype;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
  if not found then raise exception 'Incoming transfer request not found'; end if;
  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
  update public.stock_transfers set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_transfer_id;
  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
end;$$;

create or replace function public.dispatch_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_source uuid;v_transfer public.stock_transfers%rowtype;r record;v_src_product public.products%rowtype;v_dest_product uuid;v_cat_name text;v_dest_cat uuid;v_before integer;v_after integer;
begin
  v_source:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and source_shop_id=v_source and status='APPROVED' for update;
  if not found then raise exception 'Approved outgoing transfer not found'; end if;
  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_source;
    if not found then raise exception 'Source product missing'; end if;
    select quantity into v_before from public.inventory where shop_id=v_source and product_id=v_src_product.id for update;
    if v_before is null or v_before<r.quantity then raise exception 'Insufficient stock for %',v_src_product.product_name; end if;
    select id into v_dest_product from public.products where shop_id=v_transfer.destination_shop_id and barcode=v_src_product.barcode limit 1;
    if v_dest_product is null then
      select name into v_cat_name from public.categories where id=v_src_product.category_id;
      if v_cat_name is not null then
        select id into v_dest_cat from public.categories where shop_id=v_transfer.destination_shop_id and lower(name)=lower(v_cat_name) limit 1;
        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_transfer.destination_shop_id,v_cat_name) returning id into v_dest_cat; end if;
      end if;
      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
      values(v_transfer.destination_shop_id,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
      returning id into v_dest_product;
      insert into public.inventory(shop_id,product_id,quantity) values(v_transfer.destination_shop_id,v_dest_product,0);
    end if;
    update public.stock_transfer_items set destination_product_id=v_dest_product where id=r.id;
    v_after:=v_before-r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_source and product_id=v_src_product.id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_source,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer dispatched',auth.uid());
  end loop;
  update public.stock_transfers set status='DISPATCHED',dispatched_by=auth.uid(),dispatched_at=now() where id=p_transfer_id;
  perform public.write_audit(v_source,'TRANSFER_DISPATCHED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.mark_stock_transfer_in_transit(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='IN_TRANSIT' where id=p_transfer_id and source_shop_id=v_shop and status='DISPATCHED';
  if not found then raise exception 'Dispatched transfer not found'; end if;
  perform public.write_audit(v_shop,'TRANSFER_IN_TRANSIT','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.receive_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;v_transfer public.stock_transfers%rowtype;r record;v_before integer;v_after integer;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status in ('DISPATCHED','IN_TRANSIT') for update;
  if not found then raise exception 'Transfer is not ready to receive'; end if;
  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
    if r.destination_product_id is null then raise exception 'Destination product mapping missing'; end if;
    select quantity into v_before from public.inventory where shop_id=v_dest and product_id=r.destination_product_id for update;
    v_before:=coalesce(v_before,0);v_after:=v_before+r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_dest and product_id=r.destination_product_id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_dest,r.destination_product_id,'TRANSFER_IN',r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer received',auth.uid());
  end loop;
  update public.stock_transfers set status='RECEIVED',received_by=auth.uid(),received_at=now() where id=p_transfer_id;
  perform public.write_audit(v_dest,'TRANSFER_RECEIVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
end;$$;

create or replace function public.complete_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='COMPLETED',completed_at=now() where id=p_transfer_id and destination_shop_id=v_dest and status='RECEIVED';
  if not found then raise exception 'Received transfer not found'; end if;
  perform public.write_audit(v_dest,'TRANSFER_COMPLETED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

-- ============================================================
-- 9. PURCHASE / SUPPLIER INTELLIGENCE (PRO)
-- ============================================================
create or replace function public.supplier_price_comparison(p_product_id uuid,p_days integer default 180)
returns table(supplier_id uuid,supplier_name text,purchase_count bigint,total_units bigint,avg_price numeric,min_price numeric,max_price numeric,last_price numeric,last_purchase_date date)
language sql
stable
security definer
set search_path=public
as $$
  with rows as (
    select p.supplier_id,p.supplier_name_snapshot supplier_name,pi.quantity,pi.purchase_price,p.invoice_date,
           row_number() over(partition by p.supplier_id order by p.invoice_date desc,p.created_at desc) rn
    from public.purchase_items pi join public.purchases p on p.id=pi.purchase_id
    where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and p.status='RECEIVED'
      and p.invoice_date>=current_date-greatest(p_days,1)
  )
  select supplier_id,max(supplier_name),count(*),sum(quantity),round(avg(purchase_price),2),min(purchase_price),max(purchase_price),max(purchase_price) filter(where rn=1),max(invoice_date)
  from rows group by supplier_id order by avg(purchase_price),max(invoice_date) desc;
$$;

create or replace function public.supplier_intelligence(p_days integer default 180)
returns table(supplier_id uuid,supplier_name text,purchase_count bigint,purchase_total numeric,return_total numeric,payment_total numeric,outstanding numeric,po_ordered integer,po_received integer,receive_variance integer)
language sql
stable
security definer
set search_path=public
as $$
  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access() and active=true),
  p as (select supplier_id,count(*) cnt,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' and invoice_date>=current_date-greatest(p_days,1) group by supplier_id),
  r as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' and created_at>=now()-(greatest(p_days,1)||' days')::interval group by supplier_id),
  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() and payment_date>=current_date-greatest(p_days,1) group by supplier_id),
  po as (select o.supplier_id,sum(i.ordered_quantity)::int ordered,sum(i.received_quantity)::int received from public.purchase_orders o join public.purchase_order_items i on i.purchase_order_id=o.id where o.shop_id=public.current_shop_id() and o.created_at>=now()-(greatest(p_days,1)||' days')::interval group by o.supplier_id)
  select s.id,s.supplier_name,coalesce(p.cnt,0),coalesce(p.total,0),coalesce(r.total,0),coalesce(pay.total,0),coalesce(p.total,0)-coalesce(r.total,0)-coalesce(pay.total,0),coalesce(po.ordered,0),coalesce(po.received,0),coalesce(po.ordered,0)-coalesce(po.received,0)
  from s left join p on p.supplier_id=s.id left join r on r.supplier_id=s.id left join pay on pay.supplier_id=s.id left join po on po.supplier_id=s.id
  order by coalesce(p.total,0) desc,s.supplier_name;
$$;

-- ============================================================
-- 10. INVENTORY INTELLIGENCE (PRO)
-- ============================================================
create or replace function public.stock_explanation(p_product_id uuid,p_days integer default 365)
returns table(movement_type text,quantity_change bigint,event_count bigint)
language sql
stable
security definer
set search_path=public
as $$
  select sm.movement_type,sum(sm.quantity_change)::bigint,count(*)::bigint
  from public.stock_movements sm
  where sm.shop_id=public.assert_shop_access() and sm.product_id=p_product_id
    and sm.created_at>=now()-(greatest(p_days,1)||' days')::interval
  group by sm.movement_type order by sm.movement_type;
$$;

create or replace function public.inventory_health(p_history_days integer default 30,p_dead_days integer default 45)
returns table(product_id uuid,product_name text,current_stock integer,units_sold integer,avg_daily numeric,days_remaining numeric,last_sale_at timestamptz,classification text,inventory_cost numeric)
language sql
stable
security definer
set search_path=public
as $$
  with base as (
    select p.id,p.product_name,p.minimum_stock,p.purchase_price,coalesce(i.quantity,0) stock
    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    where p.shop_id=public.assert_shop_access() and p.active=true
  ),sales as (
    select si.product_id,
      sum(si.quantity) filter(where s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval)::int units,
      max(s.created_at) last_sale
    from public.sale_items si join public.sales s on s.id=si.sale_id
    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED')
    group by si.product_id
  ),calc as (
    select b.*,coalesce(s.units,0) units,s.last_sale,round(coalesce(s.units,0)::numeric/greatest(p_history_days,1),2) avgd
    from base b left join sales s on s.product_id=b.id
  )
  select id,product_name,stock,units,avgd,
    case when avgd>0 then round(stock/avgd,1) else null end,last_sale,
    case
      when stock=0 then 'OUT_OF_STOCK'
      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 'DEAD'
      when avgd>0 and stock/avgd<=3 then 'STOCKOUT_RISK'
      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 'OVERSTOCK'
      when units>=greatest(p_history_days,1) then 'FAST'
      when units<=2 then 'SLOW'
      else 'HEALTHY'
    end,
    round(stock*purchase_price,2)
  from calc order by
    case
      when stock=0 then 1
      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 2
      when avgd>0 and stock/avgd<=3 then 3
      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 4
      else 5 end,
    product_name;
$$;

-- ============================================================
-- 11. OWNER CENTER / PROFIT / LOSS CONTROL (PRO)
-- ============================================================
create or replace function public.owner_center_summary(p_from date default current_date-30,p_to date default current_date)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_shop uuid;v_revenue numeric;v_cogs numeric;v_expenses numeric;v_purchases numeric;v_returns numeric;v_variance numeric;v_bills bigint;v_low bigint;v_inventory numeric;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  select coalesce(sum(grand_total),0),count(*) into v_revenue,v_bills from public.sales where shop_id=v_shop and status<>'VOID' and created_at::date between p_from and p_to;
  select coalesce(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),0) into v_cogs from public.sale_items si join public.sales s on s.id=si.sale_id where si.shop_id=v_shop and s.status<>'VOID' and s.created_at::date between p_from and p_to;
  select coalesce(sum(amount),0) into v_expenses from public.expenses where shop_id=v_shop and status='ACTIVE' and expense_date between p_from and p_to;
  select coalesce(sum(total),0) into v_purchases from public.purchases where shop_id=v_shop and status='RECEIVED' and invoice_date between p_from and p_to;
  select coalesce(sum(total_refund),0) into v_returns from public.sale_return_requests where shop_id=v_shop and status='APPROVED' and created_at::date between p_from and p_to;
  select coalesce(sum(cash_difference),0) into v_variance from public.cashier_shifts where shop_id=v_shop and status='CLOSED' and closed_at::date between p_from and p_to;
  select count(*) into v_low from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id where p.shop_id=v_shop and p.active=true and coalesce(i.quantity,0)<=p.minimum_stock;
  select coalesce(sum(i.quantity*p.purchase_price),0) into v_inventory from public.inventory i join public.products p on p.id=i.product_id where i.shop_id=v_shop and p.active=true;
  return jsonb_build_object('from',p_from,'to',p_to,'revenue',v_revenue,'bills',v_bills,'cogs',v_cogs,'gross_profit',v_revenue-v_cogs,'expenses',v_expenses,'operating_profit',v_revenue-v_cogs-v_expenses,'purchases',v_purchases,'returns',v_returns,'cash_variance',v_variance,'low_stock_count',v_low,'inventory_cost',v_inventory);
end;$$;

create or replace function public.profit_by_product(p_from date default current_date-30,p_to date default current_date)
returns table(product_id uuid,product_name text,quantity bigint,revenue numeric,cogs numeric,gross_profit numeric,margin_pct numeric)
language sql
stable
security definer
set search_path=public
as $$
  select si.product_id,max(si.product_name_snapshot),sum(si.quantity)::bigint,round(sum(si.line_total),2),round(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),round(sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),
    case when sum(si.line_total)>0 then round((sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)))/sum(si.line_total)*100,2) else 0 end
  from public.sale_items si join public.sales s on s.id=si.sale_id
  where si.shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and s.status<>'VOID' and s.created_at::date between p_from and p_to
  group by si.product_id order by 6 desc;
$$;

create or replace function public.loss_control_exceptions(p_days integer default 30)
returns table(exception_type text,severity text,event_time timestamptz,entity_id text,summary text,amount numeric,action_path text)
language sql
stable
security definer
set search_path=public
as $$
  with q as (
    select 'CASH_VARIANCE'::text type,case when abs(coalesce(cash_difference,0))>=1000 then 'HIGH' else 'MEDIUM' end severity,coalesce(closed_at,opened_at) t,id::text entity,
      'Shift cash difference '||coalesce(cash_difference,0)::text summary,abs(coalesce(cash_difference,0)) amount,'/operations/shifts' path
    from public.cashier_shifts where shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and status='CLOSED' and abs(coalesce(cash_difference,0))>=200 and opened_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'REFUND',case when total_refund>=2000 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Approved refund '||total_refund::text,total_refund,'/pos/returns'
    from public.sale_return_requests where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and status='APPROVED' and total_refund>=500 and created_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'DISCOUNT',case when discount>=1000 or (subtotal>0 and discount/subtotal>=0.20) then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Sale discount '||discount::text,discount,'/pos/sales'
    from public.sales where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and discount>0 and (discount>=500 or (subtotal>0 and discount/subtotal>=0.10)) and created_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'STOCK_ADJUSTMENT',case when abs(quantity_change)>=12 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Stock adjustment '||quantity_change::text,abs(quantity_change)::numeric,'/inventory'
    from public.stock_movements where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and movement_type in ('DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION','STOCK_COUNT') and abs(quantity_change)>=5 and created_at>=now()-(greatest(p_days,1)||' days')::interval
  )
  select type,severity,t,entity,summary,amount,path from q order by case severity when 'HIGH' then 1 else 2 end,t desc;
$$;

create or replace function public.owner_recommendations(p_history_days integer default 30)
returns table(priority text,recommendation_type text,title text,message text,action_path text,tier text)
language sql
stable
security definer
set search_path=public
as $$
  with reorder as (
    select * from public.reorder_suggestions(p_history_days,7) limit 8
  ),dead as (
    select * from public.inventory_health(p_history_days,45) where classification in ('DEAD','OVERSTOCK') limit 8
  ),shiftx as (
    select * from public.loss_control_exceptions(p_history_days) where exception_type='CASH_VARIANCE' limit 5
  )
  select case when coalesce(days_remaining,999)<=2 then 'HIGH' else 'MEDIUM' end,'REORDER','Stockout risk: '||product_name,
    'Stock '||current_stock||'; suggested order '||suggested_cases||' case(s).','/inventory/intelligence','PLUS' from reorder where public.current_user_role()='ADMIN'
  union all
  select 'MEDIUM','INVENTORY_HEALTH',classification||': '||product_name,
    'Current stock '||current_stock||'; inventory cost '||inventory_cost::text||'.','/inventory/intelligence','PLUS' from dead where public.current_user_role()='ADMIN'
  union all
  select severity,'CASH_VARIANCE','Shift variance requires review',summary,'/owner/exceptions','PLUS' from shiftx where public.current_user_role()='ADMIN'
  limit 20;
$$;

-- ============================================================
-- 12. RLS / AUDIT / GRANTS FOR NEW TABLES
-- ============================================================
alter table public.user_shop_memberships enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.customers enable row level security;
alter table public.customer_credit_entries enable row level security;
alter table public.compliance_profiles enable row level security;
alter table public.backup_restore_tests enable row level security;

drop policy if exists user_shop_memberships_select on public.user_shop_memberships;
create policy user_shop_memberships_select on public.user_shop_memberships for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());

drop policy if exists expense_categories_select on public.expense_categories;
create policy expense_categories_select on public.expense_categories for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists customer_credit_select on public.customer_credit_entries;
create policy customer_credit_select on public.customer_credit_entries for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists compliance_profiles_select on public.compliance_profiles;
create policy compliance_profiles_select on public.compliance_profiles for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists backup_restore_tests_select on public.backup_restore_tests;
create policy backup_restore_tests_select on public.backup_restore_tests for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role()='ADMIN');

-- Generic audit triggers on new shop-scoped mutable business tables.
drop trigger if exists trg_audit_expenses on public.expenses;
create trigger trg_audit_expenses after insert or update on public.expenses for each row execute function public.audit_row_changes();
drop trigger if exists trg_audit_customers on public.customers;
create trigger trg_audit_customers after insert or update on public.customers for each row execute function public.audit_row_changes();

-- Direct browser mutations are not granted for transactional new tables; RPCs are authoritative.
grant select on public.user_shop_memberships,public.expense_categories,public.expenses,public.customers,public.customer_credit_entries,public.compliance_profiles,public.backup_restore_tests to authenticated;

grant execute on function public.my_profile() to authenticated;
grant execute on function public.update_my_profile(text,text,text,text) to authenticated;
grant execute on function public.my_shop_memberships() to authenticated;
grant execute on function public.switch_shop(uuid) to authenticated;
grant execute on function public.record_expense(uuid,date,numeric,text,text,text) to authenticated;
grant execute on function public.void_expense(uuid,text) to authenticated;
grant execute on function public.create_customer(text,text,text,text) to authenticated;
grant execute on function public.link_sale_customer(uuid,uuid) to authenticated;
grant execute on function public.record_customer_credit(uuid,text,numeric,uuid,text,text) to authenticated;
grant execute on function public.customer_balances() to authenticated;
grant execute on function public.upsert_compliance_profile(text,text,text,text,date,date,text,text) to authenticated;
grant execute on function public.record_backup_restore_test(text,text,text,text) to authenticated;
grant execute on function public.submit_purchase_order(uuid) to authenticated;
grant execute on function public.approve_purchase_order(uuid) to authenticated;
grant execute on function public.dispatch_stock_transfer(uuid) to authenticated;
grant execute on function public.mark_stock_transfer_in_transit(uuid) to authenticated;
grant execute on function public.receive_stock_transfer(uuid) to authenticated;
grant execute on function public.complete_stock_transfer(uuid) to authenticated;
grant execute on function public.supplier_price_comparison(uuid,integer) to authenticated;
grant execute on function public.supplier_intelligence(integer) to authenticated;
grant execute on function public.stock_explanation(uuid,integer) to authenticated;
grant execute on function public.inventory_health(integer,integer) to authenticated;
grant execute on function public.owner_center_summary(date,date) to authenticated;
grant execute on function public.profit_by_product(date,date) to authenticated;
grant execute on function public.loss_control_exceptions(integer) to authenticated;
grant execute on function public.owner_recommendations(integer) to authenticated;

-- Protect cost snapshots from Cashier direct queries. Owner/profit intelligence reads through security-definer RPCs.
revoke select on public.sale_items from authenticated;
grant select(id,shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total,created_at) on public.sale_items to authenticated;



-- ============================================================
-- 13. MODERN UX PATCH: THEME + EDITABLE SHOP SETTINGS
-- ============================================================
create or replace function public.update_my_theme(p_theme text)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
  update public.profiles set theme=p_theme where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

create or replace function public.get_shop_configuration()
returns table(
  shop_id uuid,
  shop_name text,
  shop_slug text,
  store_address text,
  store_phone text,
  tax_registration_number text,
  currency_code text,
  currency_symbol text,
  invoice_prefix text,
  purchase_prefix text,
  tax_enabled boolean,
  tax_percentage numeric,
  printer_paper_mm integer,
  receipt_footer text
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  return query
  select s.id,s.name,s.slug,ss.store_address,ss.store_phone,ss.tax_registration_number,
    ss.currency_code,ss.currency_symbol,ss.invoice_prefix,ss.purchase_prefix,
    ss.tax_enabled,ss.tax_percentage,ss.printer_paper_mm,ss.receipt_footer
  from public.shops s
  left join public.shop_settings ss on ss.shop_id=s.id
  where s.id=v_shop;
end;
$$;

create or replace function public.update_shop_configuration(
  p_shop_name text,
  p_store_address text default null,
  p_store_phone text default null,
  p_tax_registration_number text default null,
  p_currency_code text default 'INR',
  p_currency_symbol text default '₹',
  p_invoice_prefix text default 'INV',
  p_purchase_prefix text default 'PUR',
  p_tax_enabled boolean default false,
  p_tax_percentage numeric default 0,
  p_printer_paper_mm integer default 80,
  p_receipt_footer text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_old jsonb;
  v_new jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  if nullif(trim(p_shop_name),'') is null then raise exception 'Shop name is required'; end if;
  if nullif(trim(p_currency_code),'') is null then raise exception 'Currency code is required'; end if;
  if nullif(trim(p_currency_symbol),'') is null then raise exception 'Currency symbol is required'; end if;
  if nullif(trim(p_invoice_prefix),'') is null then raise exception 'Invoice prefix is required'; end if;
  if nullif(trim(p_purchase_prefix),'') is null then raise exception 'Purchase prefix is required'; end if;
  if coalesce(p_tax_percentage,0)<0 then raise exception 'Tax percentage cannot be negative'; end if;
  if p_printer_paper_mm not in (58,80) then raise exception 'Printer paper must be 58 or 80 mm'; end if;

  select jsonb_build_object(
    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
    'receipt_footer',ss.receipt_footer
  ) into v_old
  from public.shops s left join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;

  update public.shops set name=trim(p_shop_name) where id=v_shop;
  insert into public.shop_settings(
    shop_id,currency_code,currency_symbol,invoice_prefix,purchase_prefix,tax_enabled,tax_percentage,
    receipt_footer,store_address,store_phone,tax_registration_number,printer_paper_mm
  ) values (
    v_shop,upper(trim(p_currency_code)),trim(p_currency_symbol),upper(trim(p_invoice_prefix)),upper(trim(p_purchase_prefix)),
    coalesce(p_tax_enabled,false),coalesce(p_tax_percentage,0),nullif(trim(p_receipt_footer),''),
    nullif(trim(p_store_address),''),nullif(trim(p_store_phone),''),nullif(trim(p_tax_registration_number),''),p_printer_paper_mm
  )
  on conflict(shop_id) do update set
    currency_code=excluded.currency_code,currency_symbol=excluded.currency_symbol,
    invoice_prefix=excluded.invoice_prefix,purchase_prefix=excluded.purchase_prefix,
    tax_enabled=excluded.tax_enabled,tax_percentage=excluded.tax_percentage,
    receipt_footer=excluded.receipt_footer,store_address=excluded.store_address,
    store_phone=excluded.store_phone,tax_registration_number=excluded.tax_registration_number,
    printer_paper_mm=excluded.printer_paper_mm;

  select jsonb_build_object(
    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
    'receipt_footer',ss.receipt_footer
  ) into v_new
  from public.shops s join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;

  perform public.write_audit(v_shop,'UPDATE','SHOP_SETTINGS',v_shop::text,v_old,v_new,'{}'::jsonb);
end;
$$;

grant execute on function public.update_my_theme(text) to authenticated;
grant execute on function public.get_shop_configuration() to authenticated;
grant execute on function public.update_shop_configuration(text,text,text,text,text,text,text,text,boolean,numeric,integer,text) to authenticated;


notify pgrst,'reload schema';
```

## Reproduce the code milestone

```bash
git switch --detach 51d2bba006dea60b53e4a30c5562e229ff106202
# inspect the release snapshot
git switch main
```

