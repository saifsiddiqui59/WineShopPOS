import assert from "node:assert/strict";
import { resolveInvoiceUnitsPerCase } from "../src/lib/invoicePack.js";

let r = resolveInvoiceUnitsPerCase(
  { description: "TUBORG STRONG PREMIUM CAN 500 ML" },
  { unitsPerCase: 12 },
);
assert.equal(r.value, 24);
assert.equal(r.conflict, true);
assert.equal(r.source, "CAN_SIZE_PROFILE");

r = resolveInvoiceUnitsPerCase(
  { description: "TUBORG STRONG INT. PREMIUM BEER 650 ML" },
  { unitsPerCase: 12 },
);
assert.equal(r.value, 12);
assert.equal(r.conflict, false);

r = resolveInvoiceUnitsPerCase(
  { description: "UNKNOWN PRODUCT", unitsPerCaseHint: 24 },
  { unitsPerCase: 12 },
);
assert.equal(r.value, 24);
assert.equal(r.conflict, true);
assert.equal(r.source, "PRINTED_BOTTLE_TOTAL");

r = resolveInvoiceUnitsPerCase(
  { description: "WHISKY 750 ML" },
  { unitsPerCase: 12 },
);
assert.equal(r.value, 12);
assert.equal(r.source, "PRODUCT_MASTER");

console.log("V3_05_PACK_CONFLICT_REGRESSION=PASS");
