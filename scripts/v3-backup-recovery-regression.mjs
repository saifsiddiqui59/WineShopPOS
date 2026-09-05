import fs from "node:fs";
import assert from "node:assert/strict";

const page = fs.readFileSync("src/pages/BackupRecovery.jsx","utf8");
const e2e = fs.readFileSync("tests/e2e/read-only.spec.mjs","utf8");

assert.equal(
  page.includes('.order("tested_at",{ascending:false})'),
  false,
  "BackupRecovery must not query non-existent tested_at"
);

assert.equal(
  page.includes('.order("created_at",{ascending:false})'),
  true,
  "BackupRecovery must order restore-test history by created_at"
);

assert.equal(
  e2e.includes('page.goto("/#/'),
  false,
  "Read-only E2E must preserve configured preview base path"
);

assert.equal(
  e2e.includes('page.goto("./#/login")'),
  true,
  "Login E2E must use preview-path-safe navigation"
);

assert.equal(
  e2e.includes('Admin Backup & Recovery loads restore history without schema error'),
  true,
  "Backup & Recovery browser regression must exist"
);

assert.equal(
  e2e.includes('page.goto("./#/admin/backup")'),
  true,
  "Backup & Recovery browser test must target preview-safe admin route"
);

console.log("V3_BACKUP_RECOVERY_REGRESSION=PASS");
