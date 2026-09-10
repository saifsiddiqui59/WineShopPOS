import test from "node:test";
import assert from "node:assert/strict";
import { inferInvoiceUnitsPerCase, resolveInvoiceUnitsPerCase } from "../src/lib/invoicePack.js";

test("exact 500 ml defaults to 24 for can bottle and unknown",()=>{
  for(const item of[
    {description:"HOEGAARDEN BELGIAN WITBIER",packing:"500 ml"},
    {description:"Beer CAN",packing:"500 ml"},
    {description:"Generic bottle",packing:"500 ml"},
    {description:"Unknown item",packing:"500 ml"},
    {description:"",packing:"500 MI"},
  ]){
    const h=inferInvoiceUnitsPerCase(item);
    assert.equal(h?.value,24,JSON.stringify(item));
    assert.equal(h?.source,"PRIOR_500ML_24",JSON.stringify(item));
    assert.equal(h?.strong,false,JSON.stringify(item));
  }
});

test("printed Bottles/Case still wins",()=>{
  const h=inferInvoiceUnitsPerCase({description:"Anything",packing:"500 ml",unitsPerCaseHint:12});
  assert.equal(h?.value,12); assert.equal(h?.source,"PRINTED_BOTTLE_TOTAL"); assert.equal(h?.strong,true);
});

test("new 500 ml product gets 24 suggestion but still requires review",()=>{
  const r=resolveInvoiceUnitsPerCase({description:"HOEGAARDEN BELGIAN WITBIER",packing:"500 ml"},null);
  assert.equal(r.value,24); assert.equal(r.suggestedValue,24); assert.equal(r.suggestionSource,"PRIOR_500ML_24");
  assert.equal(r.strong,false); assert.equal(r.reviewRequired,true);
});

test("existing Product Master is not silently overwritten",()=>{
  const r=resolveInvoiceUnitsPerCase({description:"Existing 500 ml item",packing:"500 ml"},{unitsPerCase:12});
  assert.equal(r.value,12); assert.equal(r.suggestedValue,24); assert.equal(r.conflict,true); assert.equal(r.reviewRequired,true);
});

test("non-500 nearby sizes are untouched",()=>{
  assert.equal(inferInvoiceUnitsPerCase({description:"Unknown",packing:"499 ml"}),null);
  assert.equal(inferInvoiceUnitsPerCase({description:"Unknown",packing:"501 ml"}),null);
});
