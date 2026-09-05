import fs from "node:fs";

const required = [
  "docs/CURRENT_VERSION",
  "docs/shared/governance/DOCUMENTATION_STANDARD.md",
  "docs/shared/governance/VERSION_CLASSIFICATION_RULES.md",
  "docs/shared/templates/FEATURE_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/TABLE_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/RPC_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/ADR_TEMPLATE.md",
  "docs/versions/v1/README.md",
  "docs/versions/v2/README.md",
  "docs/versions/v3/README.md",
  "docs/versions/v3/reference/data/TABLE_CATALOG.md",
  "docs/versions/v3/reference/FEATURE_TRACEABILITY_CORE.md",
  "scripts/docs/generate-static-traceability.mjs",
  "scripts/docs/live-schema-export.sql",
];

const failures = [];

for (const p of required) {
  if (!fs.existsSync(p)) failures.push(`missing: ${p}`);
}

if (fs.existsSync("docs/CURRENT_VERSION")) {
  const current = fs.readFileSync("docs/CURRENT_VERSION", "utf8").trim();
  if (current !== "v3") failures.push(`V3 branch CURRENT_VERSION must be v3, found ${current}`);
}

if (fs.existsSync("docs/versions/v3/reference/data/TABLE_CATALOG.md")) {
  const text = fs.readFileSync("docs/versions/v3/reference/data/TABLE_CATALOG.md", "utf8");
  const rows = (text.match(/^\| `[^`]+` \|/gm) || []).length;
  if (rows < 58) failures.push(`table catalog unexpectedly small: ${rows}`);
}

if (failures.length) {
  console.error("DOC SYSTEM CHECK: FAIL");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log("DOC SYSTEM CHECK: PASS");
