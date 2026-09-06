import fs from "node:fs";
import assert from "node:assert/strict";

const platform = fs.readFileSync("src/pages/PlatformAdmin.jsx","utf8");
const legal = fs.readFileSync("src/components/LegalAdminCard.jsx","utf8");
const css = fs.readFileSync("src/index.css","utf8");

const tests = [];
function check(name, fn) {
  try { fn(); tests.push(["PASS",name,""]); }
  catch (error) { tests.push(["FAIL",name,error.message]); }
}

check("Platform Control has deterministic back button", () => {
  assert.match(platform, /Back to WineShopPOS/);
  assert.match(platform, /navigate\("\/"\)/);
});

check("Platform Control root owns dark background", () => {
  assert.match(platform, /background:"#050608"/);
  assert.match(platform, /minHeight:"100vh"/);
});

check("Accounts table owns readable dark styling", () => {
  assert.match(platform, /background:"#0b0b0d",color:"#f8fafc"/);
  assert.match(platform, /tbody style=\{\{color:"#e5e7eb"\}\}/);
});

check("Route scoped refresh/back CSS exists", () => {
  assert.match(css, /V4_11_PLATFORM_CONTROL_UX/);
  assert.match(css, /body:has\(\.wsp-platform-control-page\)/);
  assert.match(css, /background:#050608 !important/);
});

check("Legal control shows explicit status", () => {
  assert.match(legal, /Current status/);
  assert.match(legal, /ENABLED/);
  assert.match(legal, /DISABLED/);
});

check("Legal control warns global LIVE-user scope", () => {
  assert.match(legal, /ALL normal LIVE shop users/);
  assert.match(legal, /GLOBAL live-user gate/);
});

check("Legal enable requires confirmation", () => {
  assert.match(legal, /window\.confirm/);
  assert.match(legal, /ENABLE NOTICE/);
});

check("Legal disable is explicit", () => {
  assert.match(legal, /DISABLE NOTICE/);
  assert.match(legal, /persist\(false\)/);
});

for (const [state,name,detail] of tests) {
  console.log(`[${state}] ${name}${detail ? ` — ${detail}` : ""}`);
}
const failures = tests.filter(([state]) => state === "FAIL");
console.log(`Summary: ${tests.length-failures.length} PASS / ${failures.length} FAIL`);
if (failures.length) process.exitCode = 1;
