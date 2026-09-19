import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");

test("safe checkout migration enforces server idempotency and authoritative receipt",()=>{
  const s=read("supabase/migrations/20260919102016_checkout_transaction_safety_v1.sql");
  for(const marker of [
    "checkout_attempts",
    "canonical_checkout_payload_v1",
    "complete_sale_safe_v1",
    "resolve_checkout_v1",
    "IDEMPOTENCY_CONFLICT",
    "sale_receipt_v1",
    "for update",
  ]) assert.ok(s.includes(marker),`migration missing ${marker}`);
});

test("ShopContext uses terminal-aware safe checkout v2 and never direct v4",()=>{
  const s=read("src/context/ShopContext.jsx");
  assert.ok(s.includes('supabase.rpc("complete_sale_safe_v2"'));
  assert.ok(s.includes('supabase.rpc("resolve_checkout_v2"'));
  assert.ok(s.includes('supabase.rpc("mark_checkout_unknown_v1"'));
  assert.ok(s.includes("p_terminal_id"));
  assert.ok(s.includes("p_client_sequence"));
  assert.ok(s.includes("void refreshAll()"));
  assert.ok(!s.includes('supabase.rpc("complete_sale_safe_v1"'));
  assert.ok(!s.includes('supabase.rpc("resolve_checkout_v1"'));
});

test("POS persists checkout identity and has explicit unknown and confirmed states",()=>{
  const s=read("src/pages/POS.jsx");
  for(const marker of [
    "saveCheckoutAttempt",
    "loadActiveCheckoutAttempt",
    'setCheckoutPhase("UNKNOWN")',
    "Retry Same Checkout",
    "✓ SALE COMPLETED",
    "New Sale",
    "SCANNER LOCKED",
    "loadAuthoritativeReceipt",
  ]) assert.ok(s.includes(marker),`POS missing ${marker}`);
  assert.ok(!s.includes('navigate(autoPrint?`/sales/${r.sale.id}?print=1`'));
});

test("SaleDetails always loads one authoritative receipt RPC and never auto-prints from URL",()=>{
  const s=read("src/pages/SaleDetails.jsx");
  assert.ok(s.includes("loadAuthoritativeReceipt"));
  assert.ok(!s.includes("useSearchParams"));
  assert.ok(!s.includes("print=1"));
  assert.ok(!s.includes("setTimeout(() => window.print()"));
});

test("receipt displays complete tender breakdown when available",()=>{
  const s=read("src/components/Receipt80mm.jsx");
  assert.ok(s.includes("sale?.tenders"));
  assert.ok(s.includes("Approved returns after invoice"));
});
