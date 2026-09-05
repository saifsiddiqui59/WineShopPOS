import { readFile } from "node:fs/promises";
function ok(v,m){if(!v)throw new Error(m)}
const invoice=await readFile("supabase/functions/_shared/invoiceDocument.js","utf8");
const supplier=await readFile("src/components/SupplierEditor.jsx","utf8");
const inventory=await readFile("src/pages/Inventory.jsx","utf8");
const inbox=await readFile("src/pages/InvoiceInbox.jsx","utf8");
const migration=await readFile("supabase/migrations/20260903193000_v5g_page_data_consistency.sql","utf8");
ok(invoice.includes('source: "RAW_DMY_DATE"'),"DMY source missing");
ok(supplier.includes("normalizeSupplierName"),"supplier normalize missing");
ok(migration.includes("suppliers_shop_normalized_name_unique"),"supplier unique index missing");
ok(inventory.includes("Inventory & Product Stock"),"Inventory integration missing");
ok(inbox.includes("<th>Invoice Date</th>"),"Invoice Inbox date missing");
console.log("V5-G REGRESSION PASS");
