import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOOL_DEFINITIONS } from "../../azure-functions/ai-owner-assistant/src/agentConfig.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const datasetPath = path.join(root, "docs/ai/evaluation/golden-owner-assistant-v1.jsonl");
const policyPath = path.join(root, "docs/ai/evaluation/quality-gates-v1.json");

const toolNames = new Set(TOOL_DEFINITIONS.map((t) => t.name));
const requiredKeys = [
  "id","category","query","scope","expected_tools","forbidden_tools",
  "expected_source_routes","required_behaviors","forbidden_behaviors","notes"
];
const allowedScopes = new Set(["SHOP","ALL"]);

const lines = fs.readFileSync(datasetPath, "utf8")
  .split(/\r?\n/)
  .map((x) => x.trim())
  .filter(Boolean);

const rows = lines.map((line, i) => {
  try { return JSON.parse(line); }
  catch (e) { throw new Error(`Invalid JSONL at line ${i+1}: ${e.message}`); }
});

const errors = [];
const ids = new Set();

for (const [i,row] of rows.entries()) {
  for (const key of requiredKeys) {
    if (!(key in row)) errors.push(`line ${i+1}: missing ${key}`);
  }
  if (!row.id || typeof row.id !== "string") errors.push(`line ${i+1}: invalid id`);
  if (ids.has(row.id)) errors.push(`duplicate id: ${row.id}`);
  ids.add(row.id);

  if (!allowedScopes.has(row.scope)) errors.push(`${row.id}: invalid scope ${row.scope}`);
  if (!row.query || typeof row.query !== "string") errors.push(`${row.id}: query required`);

  for (const key of ["expected_tools","forbidden_tools","expected_source_routes","required_behaviors","forbidden_behaviors"]) {
    if (!Array.isArray(row[key])) errors.push(`${row.id}: ${key} must be array`);
  }

  for (const name of [...(row.expected_tools || []), ...(row.forbidden_tools || [])]) {
    if (!toolNames.has(name)) errors.push(`${row.id}: unknown tool ${name}`);
  }

  const overlap = (row.expected_tools || []).filter((x) => (row.forbidden_tools || []).includes(x));
  if (overlap.length) errors.push(`${row.id}: tool both expected and forbidden: ${overlap.join(",")}`);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
if (policy.dataset !== "docs/ai/evaluation/golden-owner-assistant-v1.jsonl") {
  errors.push("quality policy dataset path mismatch");
}

const representedExpectedTools = new Set(rows.flatMap((r) => r.expected_tools || []));
const missingToolCoverage = [...toolNames].filter((name) => !representedExpectedTools.has(name));
if (missingToolCoverage.length) errors.push(`golden dataset missing positive coverage for tools: ${missingToolCoverage.join(",")}`);

const categories = new Set(rows.map((r) => r.category));
for (const required of ["business_tool","app_help","security","business_rule","abstention","scope"]) {
  if (!categories.has(required)) errors.push(`missing category coverage: ${required}`);
}

const blockers = [
  "cross_shop_leakage",
  "unauthorized_write_claims",
  "credential_or_token_exposure",
  "system_prompt_or_sql_exposure",
  "tenant_isolation_failures"
];
for (const key of blockers) {
  if (policy.deterministic_release_blockers?.[key] !== 0) {
    errors.push(`release blocker ${key} must equal zero`);
  }
}

if (rows.length < 20) errors.push(`dataset too small: ${rows.length}; require >=20 cases`);

if (errors.length) {
  console.error("GOLDEN_DATASET_VALIDATION=FAIL");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("GOLDEN_DATASET_VALIDATION=PASS");
console.log(`CASES=${rows.length}`);
console.log(`TOOLS_IN_AGENT=${toolNames.size}`);
console.log(`TOOLS_WITH_POSITIVE_GOLDEN_COVERAGE=${representedExpectedTools.size}`);
console.log(`CATEGORIES=${[...categories].sort().join(",")}`);
console.log(`POLICY_VERSION=${policy.policy_version}`);
