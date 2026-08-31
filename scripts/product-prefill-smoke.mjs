import assert from "node:assert/strict";
import {inferBrandFromProductName,inferCategoryId} from "../src/lib/productInference.js";
const c=[{id:"beer",name:"BEER",active:true},{id:"whisky",name:"Whisky",active:true}];
assert.equal(inferBrandFromProductName("TUBORG STRONG PREMIUM CAN 500 ML"),"TUBORG");
assert.equal(inferBrandFromProductName("Carlsberg Elephant Strong Super Premium Beer 650ml"),"Carlsberg");
assert.equal(inferCategoryId("TUBORG STRONG PREMIUM CAN 500 ML",c),"beer");
assert.equal(inferCategoryId("Royal Stag Whisky 750 ML",c),"whisky");
console.log("PRODUCT_PREFILL_SMOKE=PASS");
