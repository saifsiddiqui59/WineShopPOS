import test from "node:test";
import assert from "node:assert/strict";
import { TOOL_DEFINITIONS, AGENT_INSTRUCTIONS } from "../src/agentConfig.js";
import { normalizeChatBody, sanitizeToolArgs, bearerToken } from "../src/security.js";

test("AI tool schemas never expose tenant or SQL controls", () => {
  const forbidden = new Set([
    "shop_id","selected_shop_id","organization_id","user_id","role",
    "authorized_shop_ids","sql","query_database","table"
  ]);
  for (const tool of TOOL_DEFINITIONS) {
    const keys = Object.keys(tool.parameters?.properties || {}).map((x) => x.toLowerCase());
    for (const key of keys) assert.equal(forbidden.has(key), false, `${tool.name} exposes ${key}`);
  }
});

test("no unrestricted database tool exists", () => {
  const names = TOOL_DEFINITIONS.map((t) => t.name.toLowerCase());
  for (const bad of ["execute_sql","run_sql","query_database","get_any_table"]) {
    assert.equal(names.includes(bad), false);
  }
});

test("agent is explicitly read-only and grounded", () => {
  assert.match(AGENT_INSTRUCTIONS, /READ ONLY/i);
  assert.match(AGENT_INSTRUCTIONS, /Never invent business numbers/i);
  assert.match(AGENT_INSTRUCTIONS, /Tenant\/shop scope is trusted server context/i);
});

test("body validator restricts scope and UUID", () => {
  assert.throws(() => normalizeChatBody({ message: "x", selected_shop_id: "bad", scope: "SHOP" }));
  assert.throws(() => normalizeChatBody({
    message: "x",
    selected_shop_id: "5c94dbca-9bb5-451e-831a-8cfa42d06013",
    scope: "OTHER",
  }));
  const ok = normalizeChatBody({
    message: "What were sales today?",
    selected_shop_id: "5c94dbca-9bb5-451e-831a-8cfa42d06013",
    scope: "SHOP",
  });
  assert.equal(ok.scope, "SHOP");
});

test("tool args reject model-controlled tenant context", () => {
  assert.throws(() => sanitizeToolArgs("get_sales_summary", { period: "TODAY", shop_id: "x" }));
  assert.deepEqual(sanitizeToolArgs("get_sales_summary", { period: "TODAY" }), { period: "TODAY" });
});

test("bearer parser accepts only Bearer form", () => {
  assert.equal(bearerToken("Bearer abc"), "abc");
  assert.equal(bearerToken("abc"), "");
});
