import { readFile } from "node:fs/promises";

function ok(value, message) {
  if (!value) throw new Error(message);
}

const pos = await readFile("src/pages/POS.jsx", "utf8");
const stock = await readFile("src/pages/StockCount.jsx", "utf8");
const scanner = await readFile("src/context/ScannerContext.jsx", "utf8");
const migration = await readFile(
  "supabase/migrations/20260903195500_v5h_shift_gate_and_uat_cleanup.sql",
  "utf8",
);

ok(pos.includes("Scan barcode or search product"), "POS scan/search field missing.");
ok(pos.includes("function processBarcode(code)"), "POS barcode processing missing.");
ok(pos.includes("useScanner()"), "POS scanner context missing.");
ok(pos.includes("/SHIFT_REQUIRED/i.test"), "POS SHIFT_REQUIRED recovery missing.");

ok(
  stock.includes("Scan / Search Physical Stock"),
  "Physical Stock Count scan/search panel missing.",
);
ok(stock.includes("stock_count_scan"), "Stock Count barcode RPC missing.");
ok(
  stock.includes("lastHandledScanIdRef") &&
    stock.includes("lastHandledScanIdRef.current === scanId"),
  "One-scan/one-count replay guard missing.",
);

const searchBlock =
  stock.match(/const searchableFields = \[([\s\S]*?)\]\s*\.filter\(Boolean\)/)?.[1] || "";

for (const field of [
  "name",
  "brand",
  "sku",
  "barcode",
  "category",
  "subcategory",
  "size",
  "sizeMl",
]) {
  ok(
    new RegExp(`\\.${field}\\b`).test(searchBlock),
    `Stock Count search field missing: ${field}`,
  );
}

ok(
  stock.includes("NOT COUNTED") &&
    stock.includes("COUNTED") &&
    stock.includes("MARKED ZERO"),
  "Physical count-state distinction missing.",
);
ok(
  stock.includes("countableProducts") &&
    stock.includes("itemByProductId[product.id]"),
  "Search must be restricted to current count snapshot.",
);
ok(
  scanner.includes("event?.stopPropagation?.()") &&
    scanner.includes("restoreEditable(snapshot)"),
  "Scanner capture contract changed.",
);
ok(!migration.includes("min(id)"), "Invalid min(uuid) remains.");
ok(!migration.includes("min(shop_id)"), "Invalid min(uuid shop_id) remains.");
ok(migration.includes("a.old_data"), "Live audit_logs.old_data cleanup missing.");
ok(migration.includes("a.new_data"), "Live audit_logs.new_data cleanup missing.");
ok(
  migration.includes("PRODUCT_NOT_IN_COUNT_SNAPSHOT"),
  "Stock-count snapshot guard missing from DB RPC.",
);
ok(
  migration.includes("trg_sales_require_valid_shift"),
  "Universal completed-sale shift trigger missing.",
);
ok(
  migration.includes("UAT_PURGE_ABORTED"),
  "Guarded UAT fixture purge missing.",
);

console.log("V5-H5 REGRESSION PASS");
