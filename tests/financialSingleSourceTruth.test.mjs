import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");

test("live migration manifest records verified backend versions",()=>{
  const s=read("docs/shared/release/FINANCIAL_SSOT_LIVE_MIGRATION_MANIFEST_20260915.md");
  for(const marker of [
    "20260915035201",
    "20260915040745",
    "20260915050757",
    "20260915050958",
    "PENDING",
  ]) assert.ok(s.includes(marker),`manifest missing ${marker}`);
});

test("reports use reconciled server pagination and atomic date refresh",()=>{
  const s=read("src/pages/ReportsConsolidated.jsx");
  for(const marker of [
    "business_analytics",
    "report_sales_page",
    "report_purchases_page",
    "report_expenses_page",
    "fetchAllRpc",
    "Current Inventory Cost",
    "All tenders after approved refunds",
  ]) assert.ok(s.includes(marker),`reports missing ${marker}`);
  assert.ok(s.includes("useEffect(()=>{void load()},[load])"));
  assert.ok(!s.includes("const{sales,purchases"));
  assert.ok(!s.includes("showSerial={false}"));
});

test("purchase intelligence uses landed cost",()=>{
  const s=read("src/pages/PurchaseIntelligence.jsx");
  for(const marker of [
    "supplier_price_comparison_v2",
    "purchase_price_history_v2",
    "latestLanded",
    "Latest Landed Cost",
    "Estimated Gross Margin",
  ]) assert.ok(s.includes(marker),`purchase intelligence missing ${marker}`);
  assert.ok(!s.includes('supabase.rpc("supplier_price_comparison",'));
  assert.ok(!s.includes('supabase.rpc("purchase_price_history",'));
});

test("inventory intelligence uses FIFO value and return-adjusted demand",()=>{
  const s=read("src/pages/InventoryIntelligence.jsx");
  for(const marker of [
    'supabase.rpc("inventory_health"',
    "FIFO Inventory Value",
    "Net 30d Sales",
    "FIFO Inventory Cost",
  ]) assert.ok(s.includes(marker),`inventory intelligence missing ${marker}`);
});

test("owner WhatsApp and sales list expose reconciled semantics",()=>{
  const w=read("src/pages/OwnerWhatsApp.jsx");
  for(const marker of [
    "Net Revenue:",
    "Invoice Discounts:",
    "Approved Returns:",
    "FIFO COGS:",
    "Current FIFO Inventory Cost:",
  ]) assert.ok(w.includes(marker),`WhatsApp missing ${marker}`);

  const sales=read("src/pages/Sales.jsx");
  assert.ok(sales.includes("<th>Status</th>"));
  assert.ok(sales.includes("<StatusBadge"));
});

test("executive money formatting is consistent at two decimals",()=>{
  for(const p of [
    "src/pages/Dashboard.jsx",
    "src/pages/OwnerCenter.jsx",
    "src/pages/OwnerProfit.jsx",
    "src/pages/OwnerWhatsApp.jsx",
    "src/pages/ReportsConsolidated.jsx",
  ]){
    const s=read(p);
    assert.ok(
      s.includes("minimumFractionDigits:2") ||
      s.includes("minimumFractionDigits: 2"),
      `${p} is not two-decimal money`,
    );
  }
});

test("no financial page uses UTC date slicing",()=>{
  for(const p of [
    "src/pages/Dashboard.jsx",
    "src/pages/OwnerCenter.jsx",
    "src/pages/OwnerProfit.jsx",
    "src/pages/OwnerWhatsApp.jsx",
    "src/pages/ReportsConsolidated.jsx",
  ]){
    assert.ok(!read(p).includes("toISOString().slice(0,10)"),`${p} contains UTC day slicing`);
  }
});
