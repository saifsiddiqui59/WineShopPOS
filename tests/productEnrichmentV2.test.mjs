import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCacheIdentity,
  detectHardConflicts,
  gtinValidation,
  inferSizeMl,
  normalizePackageType,
  scoreEnrichmentCandidate,
  shouldUseBrave,
} from "../supabase/functions/_shared/productEnrichmentV3.mjs";

test("size conversion handles ml/cl/l", () => {
  assert.equal(inferSizeMl("500 ml can"), 500);
  assert.equal(inferSizeMl("50 cl can"), 500);
  assert.equal(inferSizeMl("0.65 l bottle"), 650);
});

test("package aliases normalize CAN/TIN and BOTTLE/BTL", () => {
  assert.equal(normalizePackageType("tin"), "CAN");
  assert.equal(normalizePackageType("CAN"), "CAN");
  assert.equal(normalizePackageType("btl"), "BOTTLE");
});

test("EAN-13 checksum validation", () => {
  assert.equal(gtinValidation("8902246004670").recognized, true);
  assert.equal(gtinValidation("8902246004670").valid, true);
  assert.equal(gtinValidation("8902246004671").valid, false);
});

test("hard conflict catches size and package", () => {
  const conflicts = detectHardConflicts(
    { title: "Corona Extra", brand: "Corona", sizeMl: 330, packageType: "BOTTLE" },
    { title: "Corona Extra", brand: "Corona", sizeMl: 500, packageType: "CAN" },
  );
  assert.deepEqual(new Set(conflicts.map((x) => x.type)), new Set(["SIZE", "PACKAGE"]));
});

test("hard conflict catches clear variant mismatch", () => {
  const conflicts = detectHardConflicts(
    { title: "Budweiser Magnum Strong", brand: "Budweiser", sizeMl: 500, packageType: "CAN" },
    { title: "Budweiser Premium", brand: "Budweiser", sizeMl: 500, packageType: "CAN" },
  );
  assert.ok(conflicts.some((x) => x.type === "VARIANT"));
});

test("exact barcode cannot hide hard conflicts", () => {
  const scored = scoreEnrichmentCandidate(
    {
      title: "Budweiser Magnum Strong",
      brand: "Budweiser",
      sizeMl: 500,
      packageType: "CAN",
      barcode: "8902246004670",
    },
    {
      title: "Budweiser Premium",
      brand: "Budweiser",
      sizeMl: 330,
      packageType: "BOTTLE",
      barcode: "8902246004670",
      sourceTier: "A",
    },
    "BARCODE_CONFIRM",
  );
  assert.equal(scored.exactBarcode, true);
  assert.equal(scored.canConfirm, false);
  assert.ok(scored.conflicts.length >= 2);
});

test("cache identity separates discovery and barcode confirmation", () => {
  const discovery = buildCacheIdentity({
    mode: "DISCOVERY",
    query: "Budweiser Magnum",
    sizeMl: 500,
    packageType: "CAN",
  });
  const confirmation = buildCacheIdentity({
    mode: "BARCODE_CONFIRM",
    query: "Budweiser Magnum",
    sizeMl: 500,
    packageType: "CAN",
    barcode: "8902246004670",
  });
  assert.notDeepEqual(discovery, confirmation);
  assert.equal(discovery.v, 3);
});

test("exact barcode strongly prefers matching candidate", () => {
  const matching = scoreEnrichmentCandidate(
    {
      title: "Example Strong",
      brand: "Example",
      sizeMl: 500,
      packageType: "CAN",
      barcode: "8902246004670",
    },
    {
      title: "Example Strong",
      brand: "Example",
      sizeMl: 500,
      packageType: "CAN",
      barcode: "8902246004670",
      sourceTier: "B",
    },
    "BARCODE_CONFIRM",
  );
  const other = scoreEnrichmentCandidate(
    {
      title: "Example Strong",
      brand: "Example",
      sizeMl: 500,
      packageType: "CAN",
      barcode: "8902246004670",
    },
    {
      title: "Example Strong",
      brand: "Example",
      sizeMl: 500,
      packageType: "CAN",
      barcode: "12345670",
      sourceTier: "B",
    },
    "BARCODE_CONFIRM",
  );
  assert.ok(matching.score > other.score);
  assert.equal(matching.canConfirm, true);
});

test("Brave fallback decision only triggers when useful visuals are insufficient", () => {
  assert.equal(shouldUseBrave([]), true);
  assert.equal(
    shouldUseBrave([
      { score: 0.90, imagePreviewUrl: "https://a", conflicts: [] },
      { score: 0.84, imagePreviewUrl: "https://b", conflicts: [] },
      { score: 0.78, imagePreviewUrl: "https://c", conflicts: [] },
    ]),
    false,
  );
});
