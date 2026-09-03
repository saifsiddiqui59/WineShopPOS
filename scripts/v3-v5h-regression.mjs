import { readFile } from "node:fs/promises";

function ok(value, message) {
  if (!value) throw new Error(message);
}

const pos = await readFile("src/pages/POS.jsx", "utf8");
const app = await readFile("src/App.jsx", "utf8");
const nav = await readFile("src/config/navigation.js", "utf8");
const css = await readFile("src/index.css", "utf8");
const shop = await readFile("src/context/ShopContext.jsx", "utf8");
const migration = await readFile(
  "supabase/migrations/20260903195500_v5h_shift_gate_and_uat_cleanup.sql",
  "utf8",
);

ok(pos.includes("Start your shift before making any bill"), "POS shift message missing.");
ok(pos.includes('supabase.rpc("open_shift"'), "POS Start Shift RPC missing.");
ok(pos.includes("requireOpenShift"), "POS bill shift guard missing.");
ok(!pos.includes('navigate("/pos/scanner")'), "Scanner Test still visible in POS.");
ok(!nav.includes('/pos/scanner", label: "Scanner"'), "Scanner POS tab still exists.");

const posBlock = app.split('path="pos"')[1]?.split("</Route>")[0] || "";
ok(!posBlock.includes('path="scanner"'), "POS scanner route still exists.");
ok(
  app.includes('path="hardware/scanner" element={<ScannerSettings/>}'),
  "Admin Hardware scanner route must remain.",
);

ok(
  css.includes("V5H_GLOBAL_RESPONSIVE_HARDENING_20260903"),
  "Global responsive hardening missing.",
);
ok(
  css.includes(".module-tabs") && css.includes("overflow-x:auto"),
  "Mobile tab scrolling missing.",
);
ok(
  shop.includes('wineshop_cloud_cache_v3'),
  "Shop cache version was not bumped after test-data purge.",
);

ok(
  migration.includes("trg_sales_require_valid_shift"),
  "DB sale-shift trigger missing.",
);
ok(
  migration.includes("AUTHORIZED_UAT_FIXTURE_PURGED"),
  "UAT purge migration marker missing.",
);
ok(
  migration.includes("UAT_PURGE_ABORTED"),
  "UAT purge safety guards missing.",
);

console.log("V5-H REGRESSION PASS");
console.log(" - universal POS shift gate");
console.log(" - Start Shift blocking dialog");
console.log(" - POS scanner option removed; Admin Hardware scanner preserved");
console.log(" - responsive/mobile hardening");
console.log(" - exact guarded UAT fixture purge");
