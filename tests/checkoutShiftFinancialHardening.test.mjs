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

test("checkout remains terminal-aware and backend-reachability based",()=>{
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

test("Shift page contains shift work only",()=>{
  const shifts=read("src/pages/Shifts.jsx");

  for(const marker of [
    "Cashier Shift",
    "Start Shift",
    "Close Shift",
    "Shift History",
    "request_shift_close_v4",
    "Ended at midnight · Cash not counted",
    "Closing cash check:",
  ])assert.ok(shifts.includes(marker),`Shifts missing ${marker}`);

  for(const forbidden of [
    "Business Day Close",
    "Close Business Day",
    "Owner Shift Setting",
    "set_shift_close_policy_v1",
    "Financial Day Finalization",
  ])assert.ok(!shifts.includes(forbidden),`Shift page still contains ${forbidden}`);
});

test("Closing Cash Check is managed in Settings like a device toggle",()=>{
  const settings=read("src/pages/Settings.jsx");
  for(const marker of [
    "Shift Closing",
    "Closing Cash Check:",
    "shift_close_policy_v1",
    "set_shift_close_policy_v1",
    "Cash count required",
    "Cash count optional",
  ])assert.ok(settings.includes(marker),`Settings missing ${marker}`);
});

test("Business Day Close lives under Reports and keeps technical states internal",()=>{
  const page=read("src/pages/BusinessDayClose.jsx");
  const app=read("src/App.jsx");
  const nav=read("src/config/navigation.js");

  for(const marker of [
    "Close Business Day",
    "Everything required for this day is clear.",
    "begin_financial_day_close_v1",
    "reconcile_financial_day_v1",
    "finalize_financial_day_v1",
    "legacy_terminal_acknowledged_count",
  ])assert.ok(page.includes(marker),`BusinessDayClose missing ${marker}`);

  assert.ok(app.includes('path="day-close"'));
  assert.ok(nav.includes('/reports/day-close'));
  assert.ok(nav.includes('label: "Day Close"'));

  for(const exposed of [
    "Exception / Amendment Reason",
    ">Begin Close<",
    ">Reconcile<",
    ">Finalize Day<",
    ">Create FINAL Amendment<",
  ])assert.ok(!page.includes(exposed),`technical control exposed: ${exposed}`);
});

test("logout and shop switch remain guarded against unresolved checkout",()=>{
  const auth=read("src/context/AuthContext.jsx");
  const selector=read("src/components/ShopSelector.jsx");
  const guard=read("src/lib/checkoutSessionGuard.js");

  assert.ok(auth.includes("assertSessionChangeSafe"));
  assert.ok(selector.includes("assertSessionChangeSafe"));
  assert.ok(guard.includes("checkout_session_guard_v1"));
});
