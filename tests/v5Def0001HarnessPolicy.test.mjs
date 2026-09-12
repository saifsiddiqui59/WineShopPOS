import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh",
  "utf8",
);

const start = source.indexOf('"invoiceNumber": "16805"');
const end = source.indexOf('"expectedBottles": 144', start);
assert.ok(start >= 0 && end > start, "16805 fixture must exist");
const block = source.slice(start, end);

assert.match(block, /"allowUnreadablePrintedTotal": true/);
assert.match(block, /"expectedUnreadableCashDiscount": 95/);
assert.match(block, /"supplierDiscount": 95/);
assert.doesNotMatch(block, /"supplierDiscount": 96/);

assert.match(block, /"identityTokens": \["ding", "dong"\]/);
assert.match(block, /"identityTokens": \["dynamite", "xxx"\]/);
assert.match(block, /"identityTokens": \["go", "limlet"\]/);

assert.match(source, /count === fixture\.lines\.length/);
assert.match(source, /assertOcrDescriptions\(fixture, ocrDescriptions\)/);
assert.match(source, /coverage >= 0\.75/);
assert.match(source, /LABELED_TOTAL_UNREADABLE/);
assert.match(source, /REVIEW_PRINTED_TOTAL_UNREADABLE/);
assert.match(source, /UNREADABLE_PRINTED_TOTAL_BLOCKED/);

assert.match(source, /getByText\("Receive Stock Blocked", \{ exact: true \}\)/);
assert.match(source, /await receiveButton\.isDisabled\(\)/);
assert.match(source, /if \(receiveState\?\.blockedByFinance\)/);
assert.match(source, /intentionally remains unreceived/);

const blockedBranch = source.indexOf("if (receiveState?.blockedByFinance)");
const receiveClick = source.indexOf(
  'log(`${fixture.invoiceNumber}: clicking Approve & Receive Stock.`)',
  blockedBranch,
);
assert.ok(
  blockedBranch >= 0 && receiveClick > blockedBranch,
  "blocked finance branch must be checked before the receive click",
);

assert.match(
  source,
  /no arithmetic total was manufactured/i,
  "harness must document that 8044 is not synthesized",
);

console.log("DEF_0001_HARNESS_POLICY_REGRESSION=PASS");
