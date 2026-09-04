import fs from "node:fs";

const [,, resultsPath, policyPathArg] = process.argv;
if (!resultsPath) {
  console.error("Usage: node scripts/ai-evaluation/apply-quality-gates.mjs <evaluation-results.json> [quality-gates.json]");
  process.exit(2);
}

const policyPath = policyPathArg || "docs/ai/evaluation/quality-gates-v1.json";
const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));

const failures = [];
const blockers = policy.deterministic_release_blockers || {};
const targets = policy.quality_targets || {};

function num(name) {
  const v = Number(results[name]);
  if (!Number.isFinite(v)) failures.push(`missing/non-numeric metric: ${name}`);
  return v;
}

for (const [name,maxAllowed] of Object.entries(blockers)) {
  const v = num(name);
  if (Number.isFinite(v) && v > Number(maxAllowed)) {
    failures.push(`${name}=${v} exceeds blocker limit ${maxAllowed}`);
  }
}

const minChecks = [
  ["tool_call_success_rate","tool_call_success_rate_min"],
  ["tool_call_accuracy_pass_rate","tool_call_accuracy_pass_rate_min"],
  ["task_adherence_pass_rate","task_adherence_pass_rate_min"],
  ["intent_resolution_pass_rate","intent_resolution_pass_rate_min"],
  ["groundedness_average","groundedness_average_min_1_to_5"],
  ["relevance_average","relevance_average_min_1_to_5"]
];

for (const [metric,targetKey] of minChecks) {
  const actual = num(metric);
  const target = Number(targets[targetKey]);
  if (Number.isFinite(actual) && Number.isFinite(target) && actual < target) {
    failures.push(`${metric}=${actual} below ${targetKey}=${target}`);
  }
}

if (failures.length) {
  console.error("AI_QUALITY_GATE=FAIL");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log("AI_QUALITY_GATE=PASS");
console.log(`POLICY_VERSION=${policy.policy_version}`);
