import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/pages/Purchases.jsx", "utf8");

assert.match(
  source,
  /const financialReady=!ingestionId\|\|\(difference!=null&&Math\.abs\(difference\)<=1\);/,
);

assert.doesNotMatch(
  source,
  /const\s+financialReady\s*=\s*difference\s*==\s*null\s*\|\|/,
);

assert.doesNotMatch(
  source,
  /const\s+reconciliationMatches\s*=\s*reconciliationDifference\s*==\s*null\s*\|\|/,
);

if (source.includes("const reconciliationMatches=")) {
  assert.match(
    source,
    /const reconciliationMatches=!ingestionId\|\|\(reconciliationDifference!=null&&Math\.abs\(reconciliationDifference\)<=1\);/,
  );
}

console.log("DEF_0001_FINANCE_RECEIVE_GUARD=PASS");
