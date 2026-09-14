import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../src/pages/POS.jsx",import.meta.url),"utf8");
const marker='className="secondary-button pos-v5h-clear"';
const start=source.indexOf(marker);
assert.notEqual(start,-1,"Clear Bill button marker missing.");
const block=source.slice(start,start+2200);

test("Clear Bill resets all transaction-scoped state",()=>{
  for(const expected of [
    'sessionStorage.removeItem(cartStorageKey)',
    'setCart([])',
    'setDiscount(0)',
    'setPaymentMethod("CASH")',
    'setPaymentReference("")',
    'setCustomerId("")',
    'setCustomerSummary(null)',
    'setReasonCodeId("")',
    'setReasonNote("")',
    'clearApproval()',
    'setCouponCode("")',
    'setLoyaltyPoints(0)',
    'setStoreCreditAmount(0)',
    'setGiftVoucherCode("")',
    'setQuote(null)',
    'setUnknown("")',
    'setSearch("")',
  ]){
    assert.ok(block.includes(expected),`Clear Bill missing reset: ${expected}`);
  }
});
