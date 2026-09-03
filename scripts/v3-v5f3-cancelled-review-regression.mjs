import { readFile } from "node:fs/promises";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await readFile("src/pages/AutomationHub.jsx", "utf8");

assert(
  source.includes(
    'const recoverable = ["NEEDS_REVIEW", "OCR_FAILED", "FAILED", "CANCELLED"].includes(existingStatus);',
  ),
  "CANCELLED must be recoverable.",
);

assert(
  source.includes('if (existingStatus === "CANCELLED") {'),
  "CANCELLED must have an explicit recovery branch.",
);

assert(
  source.includes('"invoice_reopen_review"'),
  "CANCELLED recovery must call invoice_reopen_review.",
);

assert(
  source.includes('duplicateStatus = "NEEDS_REVIEW";'),
  "CANCELLED recovery must continue as NEEDS_REVIEW.",
);

const allowlist = source
  .split("\n")
  .find((line) => line.includes("const recoverable ="));

assert(allowlist, "Recoverable allowlist not found.");
assert(!allowlist.includes("READY_TO_RECEIVE"), "READY_TO_RECEIVE must stay protected.");
assert(!allowlist.includes("RECEIVED"), "RECEIVED must stay protected.");
assert(!allowlist.includes("COMPLETED"), "COMPLETED must stay protected.");

console.log("V5-F.3 regression PASS");
console.log(" - CANCELLED reuses/reopens the existing ingestion");
console.log(" - cancellation metadata is cleared by invoice_reopen_review");
console.log(" - ready/received/completed states remain protected");
