import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const offline = fs.readFileSync("src/lib/offlinePurchaseDraft.js", "utf8");
const purchases = fs.readFileSync("src/pages/Purchases.jsx", "utf8");

test("IndexedDB encrypted draft writes and deletes still await transaction completion", () => {
  assert.match(offline, /const txPromise=tx=>new Promise/);
  assert.match(offline, /const tx=db\.transaction\(DRAFT_STORE,"readwrite"\);\s*const done=txPromise\(tx\);\s*tx\.objectStore\(DRAFT_STORE\)\.put/);
  assert.match(offline, /tx\.objectStore\(DRAFT_STORE\)\.delete\(id\);\s*await done;/);
});

test("online server save is not gated by local IndexedDB success", () => {
  assert.match(
    purchases,
    /const localAttempt=saveOfflinePurchaseDraft\(draftId,p\)[\s\S]*if\(online&&ingestionId\)\{\s*setSync\("SYNCING"\);\s*try\{\s*await saveServer\(p\);\s*setSync\("SYNCED"\);/,
  );
  assert.doesNotMatch(
    purchases,
    /const local=await saveOfflinePurchaseDraft\(draftId,p\);[\s\S]{0,200}if\(online&&ingestionId\)/,
  );
});

test("SYNC ERROR is reserved for authoritative server RPC failure", () => {
  assert.match(
    purchases,
    /catch\(serverError\)[\s\S]*setSync\("SYNC ERROR"\)/,
  );
  assert.match(
    purchases,
    /Server draft synced\. Local backup cleanup pending/,
  );
  assert.doesNotMatch(
    purchases,
    /catch\(cleanupError\)[\s\S]{0,250}setSync\("SYNC ERROR"\)/,
  );
});

test("online synced strip does not present global local-draft count as current invoice failure", () => {
  assert.match(purchases, /sync==="SYNCED"[\s\S]*"Server Purchase Draft synced\."/);
  assert.doesNotMatch(
    purchases,
    /\{online\?sync:"OFFLINE"\}<\/strong><span>\{online\?"Server Purchase Draft is authoritative while online\."/,
  );
});

test("V5_27 500 ml rule and atomic purchase posting remain protected", () => {
  const pack = fs.readFileSync("src/lib/invoicePack.js", "utf8");
  const shop = fs.readFileSync("src/context/ShopContext.jsx", "utf8");
  assert.match(pack, /if \(size === 500\)/);
  assert.match(pack, /PRIOR_500ML_24/);
  assert.match(shop, /receive_purchase_v3/);
});

test("V5_29 one-button pack confirmation preserves V5_28B sync protection", () => {
  assert.match(purchases, /function confirmPack/);
  assert.match(purchases, /packDiffersFromBaseline/);
  assert.match(purchases, />Confirm Pack<\/button>/);
  assert.doesNotMatch(purchases, />Confirm as Posted<\/button>/);
  assert.doesNotMatch(purchases, />Correct Pack<\/button>/);
});
