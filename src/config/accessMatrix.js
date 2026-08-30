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
