import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("ShopAI authority guard recognizes modern Supabase service-role context",()=>{
  const migration=fs.readFileSync(
    new URL("../supabase/migrations/20260920061906_v6_shopai_authority_role_fix_v1.sql",import.meta.url),
    "utf8",
  );

  assert.match(migration,/auth\.role\(\)::text/);
  assert.match(migration,/current_user in \('postgres','supabase_admin','service_role'\)/);
  assert.match(migration,/request\.jwt\.claim\.role/);
  assert.match(migration,/SHOPAI_REVIEW_SERVER_ONLY/);
  assert.doesNotMatch(migration,/grant execute on function/i);
});

