import { readFile } from "node:fs/promises";

function ok(value, message) {
  if (!value) throw new Error(message);
}

const migrationPath =
  "supabase/migrations/20260904125419_v3_security_definer_rpc_privileges.sql";

const sql = await readFile(migrationPath, "utf8");
const auth = await readFile("src/context/AuthContext.jsx", "utf8");
const shop = await readFile("src/context/ShopContext.jsx", "utf8");

ok(
  sql.includes("p.prosecdef = true"),
  "Migration does not target the complete current SECURITY DEFINER surface.",
);
ok(
  /revoke execute on function %s from public, anon/i.test(sql),
  "Migration must revoke SECURITY DEFINER execution from PUBLIC and anon.",
);

for (const helper of [
  "next_sale_number(uuid)",
  "next_purchase_number(uuid)",
  "next_po_number(uuid)",
  "v2_refresh_receipt_lot_balance(uuid,uuid)",
]) {
  ok(
    sql.includes(`public.${helper}`),
    `Internal helper revoke missing: ${helper}`,
  );
}

ok(
  sql.includes(
    "public.write_audit(\n  uuid,text,text,text,jsonb,jsonb,jsonb\n) from authenticated",
  ),
  "write_audit authenticated revoke missing.",
);

for (const role of ["public", "anon", "authenticated"]) {
  ok(
    sql.toLowerCase().includes(`revoke execute on functions from ${role};`),
    `Future-function default privilege revoke missing for ${role}.`,
  );
}

ok(
  /has_function_privilege\('anon', p\.oid, 'EXECUTE'\)/i.test(sql),
  "Migration does not self-verify anonymous SECURITY DEFINER access.",
);
ok(
  /has_function_privilege\('authenticated', p\.oid, 'EXECUTE'\)/i.test(sql),
  "Migration does not self-verify authenticated RPC compatibility.",
);

// Current V3 does not call application RPCs until Supabase has produced a
// user session. This is the compatibility assumption behind removing anon RPC
// execution. Keep this assertion intentionally simple and stable.
ok(
  auth.includes("if (!nextSession?.user)"),
  "Auth no-session guard missing; re-review anonymous RPC requirements.",
);
ok(
  auth.includes('supabase.rpc("my_profile")') &&
    auth.includes('supabase.rpc("my_shop_access")'),
  "Expected authenticated authorization RPCs changed.",
);

// Ensure current operational functions remain routed through named RPCs that
// are explicitly checked by the migration's compatibility list.
for (const rpc of [
  "complete_sale_v4",
  "adjust_stock",
]) {
  ok(
    shop.includes(`"${rpc}"`) || sql.includes(`'${rpc}'`),
    `Expected current workflow RPC not found: ${rpc}`,
  );
}

console.log("V3 SECURITY DEFINER PRIVILEGE REGRESSION PASS");
console.log(" - PUBLIC/anon SECURITY DEFINER execution revoked by migration");
console.log(" - internal helper direct authenticated execution revoked");
console.log(" - future postgres public functions fail closed by default");
console.log(" - core authenticated RPC compatibility asserted");
