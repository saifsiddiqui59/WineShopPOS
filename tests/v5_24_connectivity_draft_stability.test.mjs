import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  CONNECTIVITY_PROBE_MARKER,
  probeBackendUrl,
} from "../src/lib/connectivity.js";

import {
  DRAFT_GUARD_MARKER,
  isMeaningfulPurchaseDraft,
} from "../src/lib/offlinePurchaseDraft.js";

test("HTTP response including 401 proves backend reachability", async () => {
  const result = await probeBackendUrl({
    url: "https://example.supabase.co",
    fetchImpl: async () => ({ status: 401 }),
  });
  assert.equal(result.reachable, true);
  assert.equal(result.status, 401);
  assert.equal(result.marker, CONNECTIVITY_PROBE_MARKER);
});

test("network exception is classified unreachable", async () => {
  const result = await probeBackendUrl({
    url: "https://example.supabase.co",
    fetchImpl: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  assert.equal(result.reachable, false);
  assert.equal(result.reason, "NETWORK_ERROR");
});

test("blank manual purchase snapshot is not meaningful", () => {
  const empty = {
    supplierId: "",
    supplierName: "",
    invoiceNumber: "",
    invoiceDate: "",
    notes: "",
    items: [],
    charges: {
      freightAmount: 0,
      transportAmount: 0,
      handlingAmount: 0,
      loadingUnloadingAmount: 0,
      supplierDiscountAmount: 0,
      invoiceDiscountAmount: 0,
      miscellaneousAmount: 0,
      roundingAdjustment: 0,
    },
    financialSummary: {},
  };
  assert.equal(isMeaningfulPurchaseDraft(empty), false);
  assert.equal(DRAFT_GUARD_MARKER, "V5_24_EMPTY_MANUAL_DRAFT_GUARD");
});

test("meaningful purchase data remains draft-worthy", () => {
  assert.equal(isMeaningfulPurchaseDraft({ supplierName: "Kapil Alcotech LLP", items: [] }), true);
  assert.equal(isMeaningfulPurchaseDraft({ supplierName: "", items: [{ productId: "p1" }] }), true);
  assert.equal(isMeaningfulPurchaseDraft({ supplierName: "", items: [], charges: { freightAmount: 25 } }), true);
});

test("global header no longer trusts navigator.onLine", () => {
  const source = fs.readFileSync("src/components/OfflineStatus.jsx", "utf8");
  assert.doesNotMatch(source, /navigator\.onLine/);
  assert.match(source, /probeBackendConnectivity/);
  assert.match(source, /CHECKING/);
});

test("Purchase Receiving no longer blocks on navigator.onLine", () => {
  const source = fs.readFileSync("src/pages/Purchases.jsx", "utf8");
  assert.doesNotMatch(source, /navigator\.onLine/);
  assert.match(source, /probeBackendConnectivity/);
  assert.match(source, /disabled=\{busy\|\|!ready\}/);
  assert.doesNotMatch(source, /disabled=\{busy\|\|!online\|\|!ready\}/);
  assert.match(source, /pruneEmptyManualPurchaseDrafts/);
});

test("ShopContext still uses atomic purchase v3 and real refresh attempt", () => {
  const source = fs.readFileSync("src/context/ShopContext.jsx", "utf8");
  assert.match(source, /receive_purchase_v3/);
  assert.match(source, /probeBackendConnectivity/);

  const receiveStart = source.indexOf("  async function receiveStock(");
  const receiveEnd = source.indexOf("\n  async function adjustStock", receiveStart);
  assert.ok(receiveStart >= 0 && receiveEnd > receiveStart);
  const receive = source.slice(receiveStart, receiveEnd);

  assert.match(receive, /receive_purchase_v3/);
  assert.match(receive, /pending_product/);
  assert.match(receive, /Purchase identity check failed/);
});
