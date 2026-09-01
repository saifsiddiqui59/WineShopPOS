import test from "node:test";
import assert from "node:assert/strict";
import { searchAppKnowledge } from "../src/appKnowledge.js";

test("bulk inventory routes to controlled receiving", () => {
  const result = searchAppKnowledge("how do I add bulk inventory?");
  assert.equal(result.found, true);
  assert.equal(result.matches[0].route, "/purchasing/receive");
});

test("new user help is admin user management", () => {
  const result = searchAppKnowledge("how to add a new user or cashier");
  assert.equal(result.found, true);
  assert.equal(result.matches[0].route, "/admin/users");
  assert.deepEqual(result.matches[0].roles, ["ADMIN"]);
});

test("old stock history does not promise retention", () => {
  const result = searchAppKnowledge("how old stock history can I see?");
  assert.equal(result.found, true);
  const text=JSON.stringify(result.matches);
  assert.match(text,/730/);
  assert.match(text,/retained/i);
});

test("unknown feature returns explicit fallback", () => {
  const result = searchAppKnowledge("configure interplanetary warehouse teleportation");
  assert.equal(result.found, false);
  assert.match(result.fallback,/do not invent/i);
});


test("invoice inbox help explains friendly workflow", () => {
  const result = searchAppKnowledge("what does cancel review, resume draft and completed mean in invoice inbox?");
  assert.equal(result.found, true);
  assert.equal(result.matches[0].route, "/purchasing/invoices");
  const text=JSON.stringify(result.matches[0]);
  assert.match(text,/Completed/);
  assert.match(text,/inventory is not changed/i);
  assert.match(text,/Reopen Review/i);
});
