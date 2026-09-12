import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh",
  "utf8",
);

const criticalStart = source.indexOf("async function criticalFlow()");
const stockStart = source.indexOf("async function stockCount()", criticalStart);

assert.ok(criticalStart >= 0, "criticalFlow must exist");
assert.ok(stockStart > criticalStart, "criticalFlow boundary must exist");

const critical = source.slice(criticalStart, stockStart);

assert.doesNotMatch(
  critical,
  /products\?select=[^"\n]*\bprice\b/,
  "R11 must not query nonexistent public.products.price",
);

assert.match(
  critical,
  /products\?select=id,product_name,barcode&barcode=eq\.2900000000018&limit=1/,
  "criticalFlow should request only product columns it actually uses",
);

for (const property of ["p.id", "p.product_name", "p.barcode"]) {
  assert.match(
    critical,
    new RegExp(property.replace(".", "\\.")),
    `criticalFlow should still use ${property}`,
  );
}

console.log("V5_MASTER_CERT_PRODUCT_SCHEMA_CONTRACT=PASS");
