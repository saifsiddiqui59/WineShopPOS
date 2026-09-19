import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");

test("Daily Closing is automatic and read-only",()=>{
  const page=read("src/pages/BusinessDayClose.jsx");
  const nav=read("src/config/navigation.js");

  for(const marker of [
    "Automatic Daily Closing",
    "No daily button is required.",
    "Closed automatically ✓",
    "WineShopPOS retries automatically",
    "Automatic Checks",
  ])assert.ok(page.includes(marker),`missing ${marker}`);

  for(const forbidden of [
    "Close Business Day",
    "begin_financial_day_close_v1",
    "reconcile_financial_day_v1",
    "finalize_financial_day_v1",
  ])assert.ok(!page.includes(forbidden),`manual close remains: ${forbidden}`);

  assert.ok(nav.includes('label: "Daily Closing"'));
});

test("previous-day cash reconciliation does not block today's shift",()=>{
  const shifts=read("src/pages/Shifts.jsx");
  assert.ok(shifts.includes("They do not block starting today's shift."));
  assert.ok(shifts.includes("Ended at midnight · Cash not counted"));
  assert.ok(shifts.includes("Start Shift"));
});
