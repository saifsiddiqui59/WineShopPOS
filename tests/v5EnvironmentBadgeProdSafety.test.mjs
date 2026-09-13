import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../src/components/EnvironmentBadge.jsx", import.meta.url),
  "utf8",
);

test("production EnvironmentBadge cannot display the QA banner", () => {
  assert.match(source, /configuredUpper === "PROD"/);
  assert.match(source, /productionConfigured \|\| productionHost/);
  assert.match(source, /return null/);
});

test("production bundle source has no deployment-specific V5 QA hostname", () => {
  assert.doesNotMatch(source, /wspv5qa/i);
  assert.doesNotMatch(source, /wspv5qa3a5e8018\.z29\.web\.core\.windows\.net/i);
});

test("non-production builds retain the QA DEV V5 banner", () => {
  assert.match(source, /QA \/ DEV · V5 · NOT PROD/);
  assert.match(source, /host\.startsWith\("wspv"\) && host\.includes\("qa"\)/);
});
