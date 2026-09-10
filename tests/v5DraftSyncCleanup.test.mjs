import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const offline = fs.readFileSync("src/lib/offlinePurchaseDraft.js", "utf8");
const purchases = fs.readFileSync("src/pages/Purchases.jsx", "utf8");

test("IndexedDB encrypted draft writes and deletes wait for transaction completion", () => {
  assert.match(offline, /const txPromise=tx=>new Promise/);
  assert.match(offline, /const tx=db\.transaction\(DRAFT_STORE,"readwrite"\);\s*const done=txPromise\(tx\);\s*tx\.objectStore\(DRAFT_STORE\)\.put/);
  assert.match(offline, /tx\.objectStore\(DRAFT_STORE\)\.delete\(id\);\s*await done;/);
});

test("server success becomes SYNCED before local backup cleanup", () => {
  assert.match(
    purchases,
    /setSync\("SYNCING"\);await saveServer\(p\);setSync\("SYNCED"\);try\{await removeOfflinePurchaseDraft\(draftId\)/,
  );
});

test("local cleanup failure after server success is not mislabeled as server sync failure", () => {
  assert.match(
    purchases,
    /catch\(cleanupError\)\{setMessage\("Server draft synced\. Local backup cleanup pending"/,
  );
  assert.match(
    purchases,
    /catch\(e\)\{setSync\(online\?"SYNC ERROR":"OFFLINE"\)/,
  );
});

test("V5_27 500 ml rule and purchase posting remain present", () => {
  const pack = fs.readFileSync("src/lib/invoicePack.js", "utf8");
  const shop = fs.readFileSync("src/context/ShopContext.jsx", "utf8");
  assert.match(pack, /if \(size === 500\)/);
  assert.match(pack, /PRIOR_500ML_24/);
  assert.match(shop, /receive_purchase_v3/);
});

test("Correct Pack automation is deliberately not mixed into V5_28", () => {
  assert.match(purchases, /Confirm as Posted/);
  assert.match(purchases, /Correct Pack/);
});
