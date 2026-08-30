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
    { path: "/purchasing/ocr", label: "Invoice OCR", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/purchasing/suppliers", label: "Suppliers", roles: ["ADMIN", "MANAGER"] },
    { path: "/purchasing/procurement", label: "Procurement", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/purchasing/intelligence", label: "Purchase Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
  ],
  inventory: [
    { path: "/inventory", label: "Overview", roles: ["ADMIN", "MANAGER"] },
    { path: "/inventory/count", label: "Stock Count", roles: ["ADMIN", "MANAGER"] },
    { path: "/inventory/transfers", label: "Transfers", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
    { path: "/inventory/intelligence", label: "Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
    { path: "/inventory/ageing", label: "Ageing & FIFO", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
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
    { path: "/owner/ask", label: "Ask WineShopPOS", roles: ["ADMIN"], tier: "PRO" },
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
