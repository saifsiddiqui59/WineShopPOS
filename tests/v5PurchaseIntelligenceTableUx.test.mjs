import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync("src/pages/PurchaseIntelligence.jsx","utf8");

test("Purchase Intelligence has one page filter",()=>{
  assert.match(source,/const\[tableFilter,setTableFilter\]=useState\(""\)/);
  assert.match(source,/type="search"/);
  assert.match(source,/Filter Tables/);
  for(const name of ["filteredComparison","filteredHistory","filteredScores","filteredCoach","filteredSuppliers"])
    assert.match(source,new RegExp(name));
});

test("all five tables use shared serial and sortable behavior",()=>{
  assert.equal((source.match(/<SortableTable/g)||[]).length,5);
  assert.equal((source.match(/\sshowSerial/g)||[]).length,5);
  assert.doesNotMatch(source,/<table className="data-table sticky">/);
});

test("Purchase Coach priority remains sortable without changing badge",()=>{
  assert.match(source,/<span style=\{\{display:"none"\}\}>\{r\.priority\}<\/span><StatusBadge status=\{r\.priority\}\/>/);
});

test("data RPC contract is unchanged",()=>{
  for(const rpc of [
    "supplier_intelligence",
    "supplier_performance_scores",
    "purchase_coach_v2",
    "supplier_price_comparison_v2",
    "purchase_price_history_v2",
  ]) {
    assert.ok(
      source.includes(`supabase.rpc("${rpc}"`),
      `missing existing RPC call: ${rpc}`,
    );
  }
});
