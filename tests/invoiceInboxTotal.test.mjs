import assert from "node:assert/strict";
import { resolveInvoiceDisplayTotal } from "../src/lib/invoiceTotals.js";

// 16805: OCR total was intentionally null; reviewed total should fill the dash.
{
  const row={
    purchase_id:"eeb37a01-1527-412d-a42d-1e96737f5ca8",
    extracted_total:null,
    review_draft:{purchaseDraft:{financialSummary:{total:8045}}}
  };
  const purchase={total:7911,total_landed_cost:8045};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,purchase),
    {value:8045,source:"REVIEWED_TOTAL_FALLBACK"}
  );
}

// Existing OCR total must win even if posted landed cost differs.
{
  const row={
    purchase_id:"received-1",
    extracted_total:148132,
    review_draft:{purchaseDraft:{financialSummary:{total:148150}}}
  };
  const purchase={total:148050,total_landed_cost:148200};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,purchase),
    {value:148132,source:"OCR_EXTRACTED_TOTAL"}
  );
}

// Another existing invoice: no regression from OCR value to purchase value.
{
  const row={purchase_id:"received-2",extracted_total:88558};
  const purchase={total:88000,total_landed_cost:89000};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,purchase),
    {value:88558,source:"OCR_EXTRACTED_TOTAL"}
  );
}

// Another existing invoice: same compatibility rule.
{
  const row={purchase_id:"received-3",extracted_total:179840};
  const purchase={total:179000,total_landed_cost:180000};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,purchase),
    {value:179840,source:"OCR_EXTRACTED_TOTAL"}
  );
}

// If OCR/review are absent but invoice is linked, posted total can fill the dash.
{
  const row={purchase_id:"p1",extracted_total:null,review_draft:null};
  const purchase={total:7900,total_landed_cost:8100};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,purchase),
    {value:8100,source:"POSTED_PURCHASE_LANDED_FALLBACK"}
  );
}

// No evidence means dash remains.
{
  const row={purchase_id:null,extracted_total:null,review_draft:null};
  assert.deepEqual(
    resolveInvoiceDisplayTotal(row,null),
    {value:null,source:"UNAVAILABLE"}
  );
}

console.log("[PASS] V1 -> SAFE V2 Invoice Inbox total precedence");
console.log("[PASS] Existing OCR totals remain unchanged");
console.log("[PASS] 16805 null OCR total falls back to reviewed 8045");
