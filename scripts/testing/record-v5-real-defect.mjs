#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const repo = process.cwd();
const defectRoot = path.join(repo, "docs", "versions", "v5", "testing", "defects");
const harnessRoot = path.join(repo, "docs", "versions", "v5", "testing", "harness");
const stage = process.env.DEFECT_STAGE || "UNKNOWN_STAGE";
const runner = process.env.DEFECT_RUNNER || "UNKNOWN_RUNNER";
const exitCode = Number(process.env.DEFECT_EXIT_CODE || 1);
const primaryLog = process.env.DEFECT_PRIMARY_LOG || "";
const masterEvidence = process.env.DEFECT_EVIDENCE_DIR || "";
const nestedEvidence = process.env.DEFECT_NESTED_EVIDENCE_DIR || "";
const explicitMessage = process.env.DEFECT_MESSAGE || "";

function git(args, stdio = ["ignore", "pipe", "pipe"]) {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio }).trim();
}
function safeRead(file) {
  try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}
function redact(text) {
  return String(text || "")
    .replace(/Bearer\s+[A-Za-z0-9._~+\/=-]+/gi, "Bearer <REDACTED>")
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "<REDACTED_JWT>")
    .replace(/((?:password|service[_-]?role|access[_-]?token|refresh[_-]?token|apikey|authorization)\s*[:=]\s*)["']?[^,\s"']+/gi, "$1<REDACTED>")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "<REDACTED_EMAIL>");
}
function sha256(file) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
}
function normalize(text) {
  return String(text || "")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, "<UUID>")
    .replace(/\b20\d{6}_\d{6}\b/g, "<RUN_ID>")
    .replace(/[A-Z]:\\Users\\[^\\\s]+/gi, "<USER_HOME>")
    .replace(/\/c\/Users\/[^/\s]+/gi, "<USER_HOME>")
    .replace(/\s+/g, " ")
    .trim();
}
function extractFailure() {
  if (explicitMessage.trim()) return explicitMessage.trim();
  const lines = [];
  if (primaryLog && fs.existsSync(primaryLog)) {
    for (const line of safeRead(primaryLog).split(/\r?\n/)) {
      if (/\[V5-UAT\]\s+FAIL:|FULL CERT FAILURE|FAILED:|FAIL:|AssertionError|Timeout|Error:/i.test(line)) {
        lines.push(line.trim());
      }
    }
  }
  for (const dir of [nestedEvidence, masterEvidence]) {
    if (!dir || !fs.existsSync(dir)) continue;
    for (const n of ["UAT_RESULT.json", "FULL_CERT_RESULT.json", "FAILURE_BACKEND_SNAPSHOT.json"]) {
      const f = path.join(dir, n);
      if (!fs.existsSync(f)) continue;
      try {
        const j = JSON.parse(safeRead(f));
        for (const v of [
          ...(Array.isArray(j.warnings) ? j.warnings : []),
          ...(Array.isArray(j.failures) ? j.failures : []),
          j.failure,
        ]) if (v) lines.push(String(v));
      } catch {}
    }
  }
  return lines.at(-1) || `${stage} exited with code ${exitCode}`;
}

function classify(message) {
  const m = String(message || "");
  // REAL APPLICATION / DATA / SECURITY defect classes only.
  if (/existing OCR evidence has \d+ lines; expected \d+/i.test(m) ||
      /normalized.*items.*expected|physical invoice.*rows/i.test(m)) {
    return { real: true, cls: "APP_OCR_DATA", sev: "HIGH", component: "OCR / invoice normalization" };
  }
  if (/inventory.*mismatch|stock[- ]movement.*mismatch|purchase.*quantity.*mismatch|landed total.*expected|DB .*expected/i.test(m)) {
    return { real: true, cls: "APP_DATA", sev: "HIGH", component: "Business persistence / database" };
  }
  if (/RLS|cross-shop|unauthori[sz]ed|cashier.*admin|role.*forbidden|security/i.test(m)) {
    return { real: true, cls: "SECURITY", sev: "CRITICAL", component: "Authorization / RLS" };
  }
  if (/duplicate.*purchase|duplicate.*stock|idempotency.*fail|second.*receipt/i.test(m)) {
    return { real: true, cls: "APP_IDEMPOTENCY", sev: "CRITICAL", component: "Purchase idempotency" };
  }

  // Known harness / prerequisite classes are NOT product defects and get no DEF number.
  if (/JWT expired|PGRST303|401/i.test(m)) {
    return { real: false, cls: "HARNESS_AUTH_PREREQUISITE", sev: "LOW", component: "Saved QA authentication" };
  }
  if (/Create Supplier dialog has no text input for supplier name/i.test(m) ||
      /strict mode|locator\.|getByLabel|getByRole|waiting for .*visible|resolved to \d+ elements|Timeout \d+ms exceeded/i.test(m)) {
    return { real: false, cls: "HARNESS_SELECTOR", sev: "MEDIUM", component: "Playwright selector/state model" };
  }
  if (/READY_TO_RECEIVE|stale.*SYNCED|server draft.*NEEDS_REVIEW|settle/i.test(m)) {
    return { real: false, cls: "HARNESS_SYNC_OR_TRIAGE", sev: "MEDIUM", component: "Draft synchronization" };
  }

  return { real: false, cls: "TRIAGE_REQUIRED", sev: "MEDIUM", component: "Unclassified test failure" };
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "defect";
}
function titleFor(message, info) {
  if (/16805.*2 lines; expected 3/i.test(message)) return "Invoice 16805 OCR stored 2 lines instead of 3";
  return String(message || info.component).replace(/^\[V5-UAT\]\s*FAIL:\s*/i, "").replace(/^FAIL:\s*/i, "").replace(/\s+/g, " ").slice(0, 120);
}
function listFiles(dir, base = dir, out = []) {
  if (!dir || !fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|runtime/i.test(e.name)) listFiles(full, base, out);
    } else out.push({ full, rel: path.relative(base, full) });
  }
  return out;
}

const safeTextExt = new Set([".log", ".json", ".md", ".txt"]);
const localOnlyExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".zip", ".pdf"]);

function copySanitizedEvidence(src, destRoot, label, manifest) {
  if (!src || !fs.existsSync(src)) return;
  let committed = 0;
  for (const f of listFiles(src)) {
    const ext = path.extname(f.full).toLowerCase();
    const size = fs.statSync(f.full).size;
    const hash = sha256(f.full);
    if (safeTextExt.has(ext) && size <= 2*1024*1024 && committed + size <= 10*1024*1024) {
      const dest = path.join(destRoot, "evidence", label, f.rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, redact(safeRead(f.full)), "utf8");
      committed += size;
      manifest.push({ storage:"git", label, file:f.rel, bytes:size, sha256:hash });
    } else if (localOnlyExt.has(ext)) {
      manifest.push({ storage:"local-only", label, file:f.rel, bytes:size, sha256:hash });
    }
  }
}

function readMetas() {
  fs.mkdirSync(defectRoot, { recursive: true });
  const out = [];
  for (const n of fs.readdirSync(defectRoot)) {
    if (!/^DEF-\d{4}-/.test(n)) continue;
    const meta = path.join(defectRoot, n, "meta.json");
    try { out.push({ dir:n, ...JSON.parse(safeRead(meta)) }); } catch {}
  }
  return out;
}
function writeIndex() {
  const rows = readMetas().sort((a,b)=>Number(a.number)-Number(b.number));
  const open = rows.filter(x=>x.status==="OPEN").length;
  const md = [
    "# WineShopPOS V5 Real Defect Register","",
    `Open real defects: **${open}** · Total real defects: **${rows.length}**`,"",
    "This index contains **application/data/security defects only**. Test-harness/prerequisite failures are kept separately under `../harness/` and do not consume DEF serial numbers.","",
    "| Sr | Defect ID | Status | Class | Severity | Defect | First seen | Last seen | Occurrences |",
    "|---:|---|---|---|---|---|---|---|---:|",
    ...rows.map(x=>`| ${x.number} | ${x.id} | ${x.status} | ${x.classification} | ${x.severity} | ${String(x.title).replace(/\|/g,"/")} | ${x.firstSeen} | ${x.lastSeen} | ${x.occurrences||1} |`),
    "",
    "## New-chat workflow","",
    "1. Read this file.",
    "2. Select the lowest-numbered OPEN defect.",
    "3. Open that defect's `DEFECT.md`, `meta.json`, `SOURCE_CONTEXT.md`, and newest `occurrences/` evidence.",
    "4. Fix only that defect in DEV/QA.",
    "5. Add/verify regression coverage.",
    "6. Mark RESOLVED only after focused regression and relevant workflow pass.",
    "",
  ];
  fs.writeFileSync(path.join(defectRoot,"INDEX.md"), md.join("\n"), "utf8");
}
function logHarness(message, info) {
  fs.mkdirSync(harnessRoot, { recursive:true });
  const file = path.join(harnessRoot, "HARNESS_FAILURES.md");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file,
      "# V5 Test Harness / Prerequisite Failure Log\n\nThese are not product defect serials. They document test infrastructure issues so they are not confused with real application defects.\n\n",
      "utf8");
  }
  const cleanMessage = redact(message);
  const duplicateNeedle =
    `- Runner: \`${runner}\`\n- Stage: \`${stage}\`\n- Component: ${info.component}\n\n\`\`\`text\n${cleanMessage}\n\`\`\``;
  const existingLog = safeRead(file);
  if (existingLog.includes(duplicateNeedle)) {
    console.log(`[DEFECT-REGISTRY] Duplicate harness occurrence suppressed: ${info.cls}.`);
    return;
  }
  fs.appendFileSync(file,
    `## ${new Date().toISOString()} — ${info.cls}\n\n- Runner: \`${runner}\`\n- Stage: \`${stage}\`\n- Component: ${info.component}\n\n\`\`\`text\n${cleanMessage}\n\`\`\`\n\n`,
    "utf8");
  try {
    git(["add","--",path.relative(repo,file).replaceAll("\\","/")]);
    git(["commit","-m","test(v5): log harness prerequisite failure"]);
    try { git(["push","origin","V5"]); } catch {}
  } catch {}
  console.log(`[DEFECT-REGISTRY] Not a real product defect: ${info.cls}. No DEF number allocated.`);
}

const failure = extractFailure();
const info = classify(failure);
if (!info.real) {
  logHarness(failure, info);
  process.exit(0);
}

const title = titleFor(failure, info);
const now = new Date().toISOString();
const commit = (()=>{try{return git(["rev-parse","HEAD"])}catch{return "UNKNOWN"}})();
const fingerprint = crypto.createHash("sha256").update(normalize(`${info.cls}|${failure}`)).digest("hex");
const metas = readMetas();
let current = metas.find(x=>x.fingerprint===fingerprint && x.status==="OPEN");
let number, id, defectDir, occurrences;
if (current) {
  number=Number(current.number); id=current.id; occurrences=Number(current.occurrences||1)+1;
  defectDir=path.join(defectRoot,current.dir);
} else {
  number=Math.max(0,...metas.map(x=>Number(x.number)||0))+1;
  id=`DEF-${String(number).padStart(4,"0")}`;
  occurrences=1;
  defectDir=path.join(defectRoot,`${id}-${slug(title)}`);
}
fs.mkdirSync(defectDir,{recursive:true});
const runId=now.replace(/[:.]/g,"-");
const occDir=path.join(defectDir,"occurrences",runId);
fs.mkdirSync(occDir,{recursive:true});

const manifest=[];
copySanitizedEvidence(masterEvidence,occDir,"master",manifest);
if (nestedEvidence && path.resolve(nestedEvidence)!==path.resolve(masterEvidence||".")) {
  copySanitizedEvidence(nestedEvidence,occDir,"uat",manifest);
}
if (primaryLog && fs.existsSync(primaryLog)) {
  const d=path.join(occDir,"primary-failure.log");
  fs.writeFileSync(d,redact(safeRead(primaryLog)),"utf8");
  manifest.push({storage:"git",label:"primary",file:path.basename(primaryLog),bytes:fs.statSync(primaryLog).size,sha256:sha256(primaryLog)});
}
fs.writeFileSync(path.join(occDir,"EVIDENCE_MANIFEST.json"),JSON.stringify(manifest,null,2),"utf8");

const meta={
  id,number,title,status:"OPEN",classification:info.cls,severity:info.sev,component:info.component,
  fingerprint,firstSeen:current?.firstSeen||now,lastSeen:now,occurrences,
  runner,stage,exitCode,gitCommitUnderTest:commit
};
fs.writeFileSync(path.join(defectDir,"meta.json"),JSON.stringify(meta,null,2),"utf8");

const sourceContext = [
  `# ${id} Source / Debug Context`,"",
  `- Branch: V5`,
  `- Commit under test: \`${commit}\``,
  `- Environment: DEV/QA only`,
  `- PROD: must remain untouched`,
  `- Classification: ${info.cls}`,
  "",
  "## Likely source areas to inspect",
  "",
  "- `src/pages/AutomationHub.jsx` — OCR upload, normalized invoice result, supplier/product resolution.",
  "- `src/pages/Purchases.jsx` — Purchase Receiving hydration and line preparation.",
  "- `supabase/functions/ocr-invoice/` — OCR Edge Function and invoice extraction.",
  "- `src/lib/invoiceClient*` / invoice normalization helpers.",
  "- `scripts/ocr-metiri-real-regression.mjs` — existing Metri invoice regression knowledge.",
  "",
  "The coding agent must determine the actual root cause from current source and evidence; this list is guidance, not a conclusion.",
  ""
].join("\n");
fs.writeFileSync(path.join(defectDir,"SOURCE_CONTEXT.md"),sourceContext,"utf8");

if (!current) {
  const md=[
    `# ${id} — ${title}`,"",
    `**Sr No:** ${number}  `,
    `**Status:** OPEN  `,
    `**Classification:** ${info.cls}  `,
    `**Severity:** ${info.sev}  `,
    `**Detected:** ${now}  `,
    `**Runner:** ${runner}  `,
    `**Stage:** ${stage}  `,
    `**Commit under test:** \`${commit}\``,"",
    "## Defect statement","",
    redact(failure),"",
    "## Expected vs actual","",
    "- Expected: the business data represented by the real invoice/workflow must be completely and correctly persisted.",
    "- Actual: the automated certification detected a persisted-data mismatch.",
    "",
    "## Reproduction / evidence","",
    "Read the newest folder under `occurrences/`. Sanitized logs and JSON are committed there. Binary evidence is referenced by SHA-256 in `EVIDENCE_MANIFEST.json`.",
    "",
    "## Debug instructions for coding agent","",
    "1. Reproduce in V5 DEV/QA only.",
    "2. Inspect committed evidence before changing code.",
    "3. Identify root cause in current source/migrations/functions.",
    "4. Do not weaken the test to make the defect disappear.",
    "5. Add or update a focused regression test.",
    "6. Run focused regression, then relevant end-to-end flow.",
    "7. Update this document with root cause, files changed, verification, and final status.",
    "",
    "## Resolution","",
    "_OPEN._","",
    "## Acceptance criteria","",
    "- Focused regression passes.",
    "- Relevant full workflow passes.",
    "- No duplicate/incorrect business mutation is introduced.",
    "- DEF status changes to RESOLVED only after verification.",
    ""
  ];
  fs.writeFileSync(path.join(defectDir,"DEFECT.md"),md.join("\n"),"utf8");
} else {
  fs.appendFileSync(path.join(defectDir,"DEFECT.md"),
    `\n## Occurrence ${occurrences} — ${now}\n\n\`\`\`text\n${redact(failure)}\n\`\`\`\n`,
    "utf8");
}
writeIndex();

const relDir=path.relative(repo,defectDir).replaceAll("\\","/");
const relIndex=path.relative(repo,path.join(defectRoot,"INDEX.md")).replaceAll("\\","/");
git(["add","--",relDir,relIndex]);
const staged=git(["diff","--cached","--name-only"]).split(/\r?\n/).filter(Boolean);
const bad=staged.filter(f=>!(f===relIndex||f.startsWith(`${relDir}/`)));
if(bad.length) throw new Error(`Refusing non-defect staged files: ${bad.join(", ")}`);
git(["commit","-m",`defect(v5): register ${id} ${slug(title).slice(0,42)}`]);
let pushed=true;
try{git(["push","origin","V5"])}catch{pushed=false;}

console.log(`[DEFECT-REGISTRY] Registered real defect ${id} (Sr ${number}).`);
console.log(`[DEFECT-REGISTRY] ${title}`);
console.log(`[DEFECT-REGISTRY] ${pushed?"Committed and pushed to V5":"Committed locally; push failed — run git push origin V5"}.`);
console.log(`[DEFECT-REGISTRY] Path: ${relDir}`);
