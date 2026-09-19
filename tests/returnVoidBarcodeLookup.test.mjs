import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("Return/Void page is barcode-first and does not depend on capped ShopContext sales", () => {
  const source = read("src/pages/Returns.jsx");

  for (const marker of [
    'data-scanner-capture="barcode"',
    "return_void_invoice_lookup_v1",
    "return_void_sale_context_v1",
    "availableQty",
    "pendingQty",
    "Void Entire Sale",
    "Scan the product first",
  ]) {
    assert.ok(
      source.includes(marker),
      `Returns missing ${marker}`,
    );
  }

  assert.ok(!source.includes("const { sales, refreshAll }"));
  assert.ok(!source.includes("sales.find("));
});

test("Return/Void migration enforces cashier scope and pending-return protection", () => {
  const source = read(
    "supabase/migrations/20260919110955_return_void_barcode_lookup_v1.sql",
  );

  for (const marker of [
    "return_void_invoice_lookup_v1",
    "return_void_sale_context_v1",
    "v_role <> 'CASHIER' or s.cashier_id=auth.uid()",
    "Cashier may access only own sales",
    "rr.status='PENDING'",
    "rr.status='APPROVED'",
    "available_return_qty",
    "void_eligible",
  ]) {
    assert.ok(
      source.includes(marker),
      `migration missing ${marker}`,
    );
  }
});

test("Products does not expose a missing-image maintenance button", () => {
  const source = read("src/pages/Products.jsx");

  assert.ok(
    !source.includes("Update Missing Images"),
    "One-time image maintenance must not become a permanent Product Master button.",
  );
});

test("Return/Void lookup v2 supports product-name search and UI labels all search modes", () => {
  const page = read("src/pages/Returns.jsx");
  const migration = read(
    "supabase/migrations/20260919114726_return_void_product_name_lookup_v2.sql",
  );

  assert.ok(page.includes("Scan barcode or search invoice / product name"));
  assert.ok(page.includes("invoice number or product"));
  assert.ok(migration.includes("si.product_name_snapshot ilike"));
  assert.ok(migration.includes("'PRODUCT_NAME'"));
  assert.ok(migration.includes("when 'BARCODE' then 1 when 'INVOICE' then 2 else 3"));
});
