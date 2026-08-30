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
import Suppliers from "./pages/Suppliers";
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
            <Route path="suppliers" element={<Suppliers/>}/>
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
        <Route path="suppliers" element={<Navigate to="/purchasing/suppliers" replace/>}/>
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
