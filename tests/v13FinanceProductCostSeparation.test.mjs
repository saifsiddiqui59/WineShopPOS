import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const p=fs.readFileSync("src/pages/Purchases.jsx","utf8");
const a=fs.readFileSync("src/pages/AutomationHub.jsx","utf8");
test("receiving financial reconciliation uses invoice arithmetic only",()=>{assert.match(p,/calcTotal=Number\(\(invoiceProductValue\+adjustment\)/);assert.doesNotMatch(p,/calcTotal=Number\(\(productValue\+adjustment\)/);assert.match(p,/Product Cost Review/);assert.match(p,/Other Discount \/ Deduction \(-\)/);});
test("invoice OCR financial reconciliation is independent of product cost review",()=>{assert.match(a,/reviewedInvoiceTotal = invoiceLineSubtotal \+ reviewedAdjustment/);assert.doesNotMatch(a,/reviewedInvoiceTotal = reviewedProductValue \+ reviewedAdjustment/);assert.match(a,/Product Cost Review/);assert.match(a,/Other Discount \/ Deduction \(-\)/);});
