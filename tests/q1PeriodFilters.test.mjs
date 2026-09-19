import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("period presets use India date semantics and inclusive 7D/30D ranges", () => {
  const source = read("src/lib/businessDate.js");
  for (const marker of [
    '"TODAY"',
    '"YESTERDAY"',
    '"D7"',
    '"D30"',
    '"MTD"',
    '"CUSTOM"',
    "shiftDateKey(today, -6)",
    "shiftDateKey(today, -29)",
    "indiaMonthStartKey()",
  ]) {
    assert.ok(source.includes(marker), `missing period marker ${marker}`);
  }
});

test("period selector exposes Today Yesterday 7D 30D MTD Custom", () => {
  const source = read("src/components/ui/PeriodSelector.jsx");
  assert.ok(source.includes("PERIOD_PRESETS"));
  assert.ok(source.includes("India business date"));
  assert.ok(source.includes('preset === "CUSTOM"'));
});

test("Sales is server-paginated by business date and is role scoped in the backend", () => {
  const page = read("src/pages/Sales.jsx");
  const migration = read("supabase/migrations/20260919105427_q1_period_sales_v1.sql");
  assert.ok(page.includes('supabase.rpc("sales_period_page_v1"'));
  assert.ok(page.includes('preset: "TODAY"'));
  assert.ok(!page.includes("const { sales"));
  assert.ok(migration.includes("wsp_business_date"));
  assert.ok(migration.includes("v_role <> 'CASHIER' or s.cashier_id = auth.uid()"));
  assert.ok(migration.includes("s.status"));
});

test("Owner Center defaults Today but keeps recommendations and exceptions at 30 days", () => {
  const source = read("src/pages/OwnerCenter.jsx");
  assert.ok(source.includes('preset: "TODAY"'));
  assert.ok(source.includes('supabase.rpc("owner_center_summary"'));
  assert.ok(source.includes("p_from: period.from"));
  assert.ok(source.includes("p_to: period.to"));
  assert.ok(source.includes("p_history_days: 30"));
  assert.ok(source.includes("p_days: 30"));
  assert.ok(source.includes("Current Inventory Cost"));
  assert.ok(source.includes("Requires Review · 30D"));
});

test("Reports defaults Today and every export follows the selected period", () => {
  const source = read("src/pages/ReportsConsolidated.jsx");
  assert.ok(source.includes('preset: "TODAY"'));
  assert.ok(source.includes("<PeriodSelector"));
  assert.ok(source.includes("p_from: period.from"));
  assert.ok(source.includes("p_to: period.to"));
  assert.ok(source.includes("sales-${period.from}-${period.to}.csv"));
  assert.ok(source.includes("expenses-${period.from}-${period.to}.csv"));
});
