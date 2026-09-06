import fs from "node:fs";
import assert from "node:assert/strict";
import {
  autoMapHeaders,
  parseCsv,
  tableToRows,
} from "../src/lib/onboardingImport.js";

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push(["PASS", name, ""]);
  } catch (error) {
    results.push(["FAIL", name, error?.message || String(error)]);
  }
}

function text(path) {
  return fs.readFileSync(path, "utf8");
}

check("CSV quoted commas parse", () => {
  const rows = parseCsv('product_name,address\n"Test Beer","Road, City"\n');
  assert.equal(rows[1][1], "Road, City");
});

check("CSV leading-zero barcode preserved", () => {
  const rows = parseCsv("product_name,barcode\nBeer,0012345678901\n");
  assert.equal(rows[1][1], "0012345678901");
});

check("Import aliases auto-map", () => {
  const headers = ["Item Name", "UPC", "Qty", "CP", "MRP", "SP", "Pack Qty", "ML"];
  const mapping = autoMapHeaders(headers, "PRODUCTS_STOCK");
  assert.equal(mapping.product_name, 0);
  assert.equal(mapping.barcode, 1);
  assert.equal(mapping.opening_stock, 2);
  assert.equal(mapping.purchase_price, 3);
  assert.equal(mapping.mrp, 4);
  assert.equal(mapping.selling_price, 5);
  assert.equal(mapping.units_per_case, 6);
  assert.equal(mapping.size_ml, 7);
});

check("Mapped rows retain source values", () => {
  const table = [["Item Name","UPC","ML","Pack Qty"],["Beer","00123","650","12"]];
  const mapping = autoMapHeaders(table[0], "PRODUCTS_STOCK");
  const rows = tableToRows(table, "PRODUCTS_STOCK", mapping);
  assert.equal(rows[0].barcode, "00123");
  assert.equal(rows[0].size_ml, "650");
});

check("App contains Shop Import route", () => {
  assert.match(text("src/App.jsx"), /products\/import|path="import"/);
});

check("Realtime inventory postgres_changes exists", () => {
  const source = text("src/context/ShopContext.jsx");
  assert.match(source, /postgres_changes/);
  assert.match(source, /table:"inventory"|table:\s*"inventory"/);
});

check("POS exposes stock sync state", () => {
  assert.match(text("src/pages/POS.jsx"), /stockSyncStatus/);
});

check("Announcement dismissal actually hides non-critical strip", () => {
  assert.match(text("src/components/SaaSBanner.jsx"), /!announcementAcked/);
});

check("Old internal CRITICAL wording removed", () => {
  assert.doesNotMatch(text("src/components/SaaSBanner.jsx"), /marked CRITICAL by the WineShopPOS platform administrator/);
});

check("Critical modal uses finite visual hardening", () => {
  assert.match(text("src/index.css"), /wsp-critical-modal-card/);
  assert.match(text("src/index.css"), /animation-iteration-count:\s*3/);
});

check("ENTERPRISE not offered in Platform Control selector", () => {
  assert.doesNotMatch(text("src/pages/PlatformAdmin.jsx"), /<option>ENTERPRISE<\/option>/);
});

check("V4 badge exists near brand", () => {
  assert.match(text("src/components/AnimatedBrand.jsx"), /wsp-version-badge/);
});

check("Legal gate exists but runtime migration defaults disabled", () => {
  assert.match(text("src/components/LegalNoticeBoundary.jsx"), /ACCEPT AND CONTINUE/);
  const migration = text("supabase/migrations/20260906050120_v4_commercial_readiness_batch1_hardening.sql");
  assert.match(migration, /client_audit_enabled','false'/);
  assert.match(migration, /customer_import_enabled','false'/);
});

check("No source IP parameter is collected by legal acceptance RPC", () => {
  const migration = text("supabase/migrations/20260906050120_v4_commercial_readiness_batch1_hardening.sql");
  assert.doesNotMatch(migration, /p_source_ip/);
});

check("Customer import UI remains disabled in pilot", () => {
  assert.match(text("src/pages/ShopImport.jsx"), /Customers — prepared, currently disabled/);
});

for (const [state, name, detail] of results) {
  console.log(`[${state}] ${name}${detail ? ` — ${detail}` : ""}`);
}
const failures = results.filter(([state]) => state === "FAIL");
console.log(`Summary: ${results.length - failures.length} PASS / ${failures.length} FAIL`);
if (failures.length) process.exitCode = 1;
