# WineShopPOS V2 — Route Inventory

Run: `20260830_065028`

## Route definitions / navigation evidence
```text
54:  return <Routes>
55:    <Route path="/login" element={<Login/>}/>
57:    <Route element={<RequireAuth/>}>
58:      <Route element={<Layout/>}>
59:        <Route index element={<HomeRedirect/>}/>
60:        <Route path="account" element={<Account/>}/>
62:        <Route path="pos" element={module("POS & Billing", "Scan → Cart → Pay → Print. Operational distractions stay outside the cashier flow.", MODULE_TABS.pos)}>
63:          <Route index element={<POS/>}/>
64:          <Route path="sales" element={<Sales/>}/>
65:          <Route path="returns" element={<Returns/>}/>
66:          <Route path="shifts" element={<Shifts/>}/>
67:          <Route path="scanner" element={<ScannerSettings/>}/>
71:        <Route path="sales/:id" element={<SaleDetails/>}/>
73:        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
74:          <Route path="products" element={module("Products", "Product master, barcode configuration and physical label printing.", MODULE_TABS.products)}>
75:            <Route index element={<Products/>}/>
76:            <Route path="new" element={<AddProduct/>}/>
77:            <Route path=":id/edit" element={<EditProduct/>}/>
78:            <Route path="labels" element={<BarcodeLabels/>}/>
81:          <Route path="purchasing" element={module("Purchases & Suppliers", "Receive goods, control procurement and understand supplier/purchase cost changes.", MODULE_TABS.purchasing)}>
82:            <Route index element={<Navigate to="receive" replace/>}/>
83:            <Route path="receive" element={<Purchases/>}/>
84:            <Route path="suppliers" element={<Suppliers/>}/>
85:            <Route path="procurement" element={<Procurement/>}/>
86:            <Route path="intelligence" element={<PurchaseIntelligence/>}/>
89:          <Route path="inventory" element={module("Inventory", "Current stock, physical count, inter-branch movement and inventory intelligence.", MODULE_TABS.inventory)}>
90:            <Route index element={<Inventory/>}/>
91:            <Route path="count" element={<StockCount/>}/>
92:            <Route path="transfers" element={<Transfers/>}/>
93:            <Route path="intelligence" element={<InventoryIntelligence/>}/>
97:        <Route path="operations" element={module("Operations", "Day-to-day shifts and reliability, with management controls shown only to authorized roles.", MODULE_TABS.operations)}>
98:          <Route index element={<Navigate to="shifts" replace/>}/>
99:          <Route path="shifts" element={<Shifts/>}/>
100:          <Route path="offline" element={<OfflineQueue/>}/>
101:          <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
102:            <Route path="expenses" element={<Expenses/>}/>
103:            <Route path="approvals" element={<Approvals/>}/>
104:            <Route path="customers" element={<CustomerCredit/>}/>
108:        <Route element={<RequireRole roles={["ADMIN"]}/>}>
109:          <Route path="owner" element={module("Owner Center", "Business health, profitability, risk and recommended next actions in one place.", MODULE_TABS.owner)}>
110:            <Route index element={<OwnerCenter/>}/>
111:            <Route path="recommendations" element={<Recommendations/>}/>
112:            <Route path="share" element={<OwnerWhatsApp/>}/>
113:            <Route path="profit" element={<OwnerProfit/>}/>
114:            <Route path="exceptions" element={<OwnerExceptions/>}/>
115:            <Route path="ask" element={<OwnerAI/>}/>
119:        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
120:          <Route path="reports" element={module("Reports & Compliance", "Operational exports plus a safe foundation for verified liquor-compliance requirements.", MODULE_TABS.reports)}>
121:            <Route index element={<ReportsConsolidated/>}/>
122:            <Route path="compliance" element={<Compliance/>}/>
126:        <Route element={<RequireRole roles={["ADMIN"]}/>}>
127:          <Route path="admin" element={module("Settings & Admin", "Users, devices, backup/recovery, audit and shop administration.", MODULE_TABS.admin)}>
128:            <Route index element={<Navigate to="users" replace/>}/>
129:            <Route path="users" element={<Users/>}/>
130:            <Route path="access" element={<AccessControl/>}/>
131:            <Route path="hardware" element={<HardwareSetup/>}/>
132:            <Route path="hardware/scanner" element={<ScannerSettings/>}/>
133:            <Route path="hardware/printer" element={<PrinterSettings/>}/>
134:            <Route path="backup" element={<BackupRecovery/>}/>
135:            <Route path="audit" element={<Audit/>}/>
136:            <Route path="settings" element={<Settings/>}/>
141:        <Route path="shifts" element={<Navigate to="/operations/shifts" replace/>}/>
142:        <Route path="returns" element={<Navigate to="/pos/returns" replace/>}/>
143:        <Route path="sales" element={<Navigate to="/pos/sales" replace/>}/>
144:        <Route path="scanner-settings" element={<Navigate to="/pos/scanner" replace/>}/>
145:        <Route path="offline-queue" element={<Navigate to="/operations/offline" replace/>}/>
146:        <Route path="stock-count" element={<Navigate to="/inventory/count" replace/>}/>
147:        <Route path="purchases" element={<Navigate to="/purchasing/receive" replace/>}/>
148:        <Route path="suppliers" element={<Navigate to="/purchasing/suppliers" replace/>}/>
149:        <Route path="procurement" element={<Navigate to="/purchasing/procurement" replace/>}/>
150:        <Route path="price-history" element={<Navigate to="/purchasing/intelligence" replace/>}/>
151:        <Route path="reorder" element={<Navigate to="/inventory/intelligence" replace/>}/>
152:        <Route path="transfers" element={<Navigate to="/inventory/transfers" replace/>}/>
153:        <Route path="automation" element={<Navigate to="/purchasing/intelligence" replace/>}/>
154:        <Route path="users" element={<Navigate to="/admin/users" replace/>}/>
155:        <Route path="audit" element={<Navigate to="/admin/audit" replace/>}/>
156:        <Route path="printer-settings" element={<Navigate to="/admin/hardware/printer" replace/>}/>
157:        <Route path="settings" element={<Navigate to="/admin/settings" replace/>}/>
159:        <Route path="*" element={<HomeRedirect/>}/>
```

## Pages
```text
src/pages/AccessControl.jsx
src/pages/Account.jsx
src/pages/AddProduct.jsx
src/pages/Approvals.jsx
src/pages/Audit.jsx
src/pages/AutomationHub.jsx
src/pages/BackupRecovery.jsx
src/pages/BarcodeLabels.jsx
src/pages/Compliance.jsx
src/pages/CustomerCredit.jsx
src/pages/Dashboard.jsx
src/pages/EditProduct.jsx
src/pages/Expenses.jsx
src/pages/HardwareSetup.jsx
src/pages/Inventory.jsx
src/pages/InventoryIntelligence.jsx
src/pages/Login.jsx
src/pages/OfflineQueue.jsx
src/pages/OwnerAI.jsx
src/pages/OwnerCenter.jsx
src/pages/OwnerExceptions.jsx
src/pages/OwnerProfit.jsx
src/pages/OwnerWhatsApp.jsx
src/pages/Placeholder.jsx
src/pages/POS.jsx
src/pages/PriceHistory.jsx
src/pages/PrinterSettings.jsx
src/pages/Procurement.jsx
src/pages/Products.jsx
src/pages/PurchaseIntelligence.jsx
src/pages/Purchases.jsx
src/pages/Recommendations.jsx
src/pages/Reorder.jsx
src/pages/Reports.jsx
src/pages/ReportsConsolidated.jsx
src/pages/Returns.jsx
src/pages/SaleDetails.jsx
src/pages/Sales.jsx
src/pages/ScannerSettings.jsx
src/pages/Settings.jsx
src/pages/Shifts.jsx
src/pages/StockCount.jsx
src/pages/Suppliers.jsx
src/pages/Transfers.jsx
src/pages/Users.jsx
```
