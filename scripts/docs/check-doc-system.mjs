import fs from "node:fs";
const version=fs.readFileSync("docs/CURRENT_VERSION","utf8").trim();
const required=["docs/shared/governance/DOCUMENTATION_STANDARD.md","docs/shared/governance/VERSION_CLASSIFICATION_RULES.md","docs/shared/templates/FEATURE_DOCUMENT_TEMPLATE.md","docs/shared/templates/TABLE_DOCUMENT_TEMPLATE.md","docs/shared/templates/RPC_DOCUMENT_TEMPLATE.md","docs/shared/templates/ADR_TEMPLATE.md","docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md",`docs/versions/${version}/README.md`,`docs/versions/${version}/user/USER_MANUAL.md`,`docs/versions/${version}/architecture/PROJECT_CONTEXT.md`,`docs/versions/${version}/reference/data/TABLE_CATALOG.md`,`docs/versions/${version}/reference/interfaces/RPC_CATALOG.md`,"scripts/docs/sync-current-version-docs.mjs","scripts/docs/generate-static-traceability.mjs"];
const bad=required.filter(p=>!fs.existsSync(p));
if(version==="v2"&&fs.existsSync("docs/versions/v3"))bad.push("docs/versions/v3 must not exist on current PROD/main");
if(bad.length){console.error("DOC SYSTEM CHECK: FAIL");bad.forEach(x=>console.error(`- ${x}`));process.exit(1);}console.log(`DOC SYSTEM CHECK: PASS (${version})`);
