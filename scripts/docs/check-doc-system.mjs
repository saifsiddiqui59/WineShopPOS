import fs from "node:fs";

const failures = [];
const currentFile = "docs/CURRENT_VERSION";

if (!fs.existsSync(currentFile)) {
  failures.push(`missing: ${currentFile}`);
}

const current = fs.existsSync(currentFile)
  ? fs.readFileSync(currentFile, "utf8").trim()
  : "";

if (current && !/^v[0-9]+$/i.test(current)) {
  failures.push(`invalid CURRENT_VERSION: ${current}`);
}

const requiredShared = [
  "docs/shared/governance/DOCUMENTATION_STANDARD.md",
  "docs/shared/governance/VERSION_CLASSIFICATION_RULES.md",
  "docs/shared/templates/FEATURE_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/TABLE_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/RPC_DOCUMENT_TEMPLATE.md",
  "docs/shared/templates/ADR_TEMPLATE.md",
  "docs/shared/release/END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md",
  "docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md",
  "docs/versions/v1/README.md",
  "docs/versions/v2/README.md",
  "docs/versions/v3/README.md",
  "scripts/docs/generate-static-traceability.mjs",
  "scripts/docs/live-schema-export.sql",
];

const requiredCurrent = current ? [
  `docs/versions/${current}/README.md`,
  `docs/versions/${current}/architecture/README.md`,
  `docs/versions/${current}/reference/FEATURE_TRACEABILITY_CORE.md`,
  `docs/versions/${current}/reference/data/TABLE_CATALOG.md`,
  `docs/versions/${current}/reference/generated/SOURCE_DATA_ACCESS.md`,
  `docs/versions/${current}/reference/generated/MIGRATION_FUNCTION_INVENTORY.md`,
  `docs/versions/${current}/reference/generated/traceability.generated.json`,
  `docs/versions/${current}/security/README.md`,
  `docs/versions/${current}/testing/README.md`,
] : [];

for (const p of [...requiredShared, ...requiredCurrent]) {
  if (!fs.existsSync(p)) failures.push(`missing: ${p}`);
}

if (current === "v4") {
  const legacy = "docs/v4";
  if (fs.existsSync(legacy)) failures.push(`legacy current-version tree still exists: ${legacy}`);
}

if (failures.length) {
  console.error("DOC SYSTEM CHECK: FAIL");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`DOC SYSTEM CHECK: PASS (${current || "unknown"})`);
