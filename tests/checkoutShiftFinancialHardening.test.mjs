import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");

test("terminal identity is stable and sequence-backed",()=>{
  const s=read("src/lib/terminalIdentity.js");
  for(const marker of [
    "wineshop_terminal_id_v1",
    "getTerminalId",
    "nextTerminalSequence",
    "Asia/Kolkata",
  ])assert.ok(s.includes(marker),`terminal identity missing ${marker}`);
});

test("new checkout path uses terminal-aware v2 APIs and backend reachability",()=>{
  const shop=read("src/context/ShopContext.jsx");
  for(const marker of [
    "probeBackendConnectivity",
    "complete_sale_safe_v2",
    "resolve_checkout_v2",
    "mark_checkout_unknown_v1",
    "sync_offline_sale_v2",
    "p_terminal_id",
    "p_client_sequence",
  ])assert.ok(shop.includes(marker),`ShopContext missing ${marker}`);

  assert.ok(!shop.includes('supabase.rpc("complete_sale_safe_v1"'));
  assert.ok(!shop.includes('supabase.rpc("resolve_checkout_v1"'));
  assert.ok(!shop.includes("navigator.onLine"));
});

test("POS shift gate uses backend state and terminal-aware open",()=>{
  const pos=read("src/pages/POS.jsx");
  assert.ok(pos.includes('supabase.rpc("open_shift_v2"'));
  assert.ok(pos.includes('supabase.rpc("current_shift_state_v2"'));
  assert.ok(pos.includes('supabase.rpc("resolve_checkout_v2"'));
  assert.ok(pos.includes("BACKEND ONLINE"));
  assert.ok(!pos.includes("navigator.onLine"));
});

test("logout and shop switch are guarded against unresolved checkout",()=>{
  const auth=read("src/context/AuthContext.jsx");
  const selector=read("src/components/ShopSelector.jsx");
  const guard=read("src/lib/checkoutSessionGuard.js");

  assert.ok(auth.includes("assertSessionChangeSafe"));
  assert.ok(selector.includes("assertSessionChangeSafe"));
  assert.ok(guard.includes("checkout_session_guard_v1"));
});

test("shift page supports historical CLOSE_REQUIRED and financial-day lifecycle",()=>{
  const shifts=read("src/pages/Shifts.jsx");

  for(const marker of [
    "CLOSE_REQUIRED",
    "open_shift_v2",
    "request_shift_close_v3",
    "close_terminal_day_v1",
    "financial_day_snapshot_read_v1",
    "begin_financial_day_close_v1",
    "reconcile_financial_day_v1",
    "finalize_financial_day_v1",
    "create_financial_day_amendment_v1",
    "Start Today's Shift",
  ])assert.ok(shifts.includes(marker),`Shifts missing ${marker}`);

  assert.ok(!shifts.includes("navigator.onLine"));
});
