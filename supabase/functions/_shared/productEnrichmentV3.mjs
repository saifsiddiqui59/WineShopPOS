export const CACHE_VERSION = 3;

const PACKAGE_ALIASES = new Map([
  ["can", "CAN"], ["tin", "CAN"], ["cans", "CAN"], ["tins", "CAN"],
  ["bottle", "BOTTLE"], ["bottles", "BOTTLE"], ["btl", "BOTTLE"], ["btls", "BOTTLE"],
]);

const VARIANT_TOKENS = new Set([
  "magnum", "premium", "strong", "classic", "extra", "light", "lite",
  "elephant", "witbier", "wheat", "lager", "stout", "ale", "original",
  "reserve", "gold", "silver", "black", "white", "red", "blue",
]);

const TIER_SCORE = { A: 1, B: 0.82, C: 0.68, D: 0.52, E: 0.36 };

export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\borginal\b/g, "original")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function inferSizeMl(value) {
  const matches = [...String(value ?? "").matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
  if (!matches.length) return null;
  const [, raw, unitRaw] = matches[matches.length - 1];
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = unitRaw.toLowerCase();
  if (unit === "l") return Math.round(n * 1000);
  if (unit === "cl") return Math.round(n * 10);
  return Math.round(n);
}

export function normalizePackageType(value) {
  const text = normalizeText(value);
  if (!text) return null;
  for (const token of text.split(" ")) {
    if (PACKAGE_ALIASES.has(token)) return PACKAGE_ALIASES.get(token);
  }
  return text.toUpperCase();
}

export function inferPackageType(value) {
  const text = normalizeText(value);
  if (/\b(can|tin|cans|tins)\b/.test(text)) return "CAN";
  if (/\b(bottle|bottles|btl|btls)\b/.test(text)) return "BOTTLE";
  return null;
}

function trigrams(value) {
  const text = `  ${normalizeText(value)}  `;
  const out = new Set();
  for (let i = 0; i < text.length - 2; i += 1) out.add(text.slice(i, i + 3));
  return out;
}

export function textSimilarity(a, b) {
  const aa = trigrams(a);
  const bb = trigrams(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection += 1;
  return (2 * intersection) / (aa.size + bb.size);
}

export function gtinValidation(value) {
  const code = digitsOnly(value);
  if (![8, 12, 13, 14].includes(code.length)) {
    return { recognized: false, valid: false, code };
  }
  const checkDigit = Number(code.at(-1));
  const body = code.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  const expected = (10 - (sum % 10)) % 10;
  return { recognized: true, valid: expected === checkDigit, code, expected };
}

export function variantTokens(value) {
  const out = new Set();
  for (const token of normalizeText(value).split(" ")) {
    if (VARIANT_TOKENS.has(token)) out.add(token);
  }
  return [...out];
}

function clearlyDifferentBrand(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return false;
  const leftTokens = new Set(left.split(" ").filter((x) => x.length >= 3));
  const rightTokens = new Set(right.split(" ").filter((x) => x.length >= 3));
  for (const token of leftTokens) if (rightTokens.has(token)) return false;
  return textSimilarity(left, right) < 0.42;
}

export function detectHardConflicts(expected = {}, candidate = {}) {
  const conflicts = [];
  const expectedSize = Number(expected.sizeMl || 0) || null;
  const candidateSize = Number(candidate.sizeMl || 0) || null;

  if (expectedSize && candidateSize && Math.abs(expectedSize - candidateSize) > 10) {
    conflicts.push({
      type: "SIZE",
      expected: expectedSize,
      actual: candidateSize,
      message: `${expectedSize} ml vs ${candidateSize} ml`,
    });
  }

  const expectedPackage = normalizePackageType(expected.packageType);
  const candidatePackage = normalizePackageType(candidate.packageType);
  if (expectedPackage && candidatePackage && expectedPackage !== candidatePackage) {
    conflicts.push({
      type: "PACKAGE",
      expected: expectedPackage,
      actual: candidatePackage,
      message: `${expectedPackage} vs ${candidatePackage}`,
    });
  }

  if (clearlyDifferentBrand(expected.brand, candidate.brand)) {
    conflicts.push({
      type: "BRAND",
      expected: String(expected.brand || ""),
      actual: String(candidate.brand || ""),
      message: `${expected.brand} vs ${candidate.brand}`,
    });
  }

  const expectedVariants = variantTokens(expected.title || expected.query || "");
  const candidateVariants = variantTokens(candidate.title || "");
  if (expectedVariants.length && candidateVariants.length) {
    const overlap = expectedVariants.some((token) => candidateVariants.includes(token));
    if (!overlap) {
      conflicts.push({
        type: "VARIANT",
        expected: expectedVariants.join(", "),
        actual: candidateVariants.join(", "),
        message: `${expectedVariants.join("/")} vs ${candidateVariants.join("/")}`,
      });
    }
  }

  return conflicts;
}

export function sourceQualityTier({ publisher = "", sourcePageUrl = "", brand = "", providers = [] } = {}) {
  let host = "";
  try { host = new URL(sourcePageUrl).hostname.toLowerCase(); } catch {}
  const publisherText = normalizeText(publisher);
  const brandToken = normalizeText(brand).replace(/\s+/g, "");
  const providerSet = new Set(providers || []);

  if (host.endsWith(".gov.in") || host.includes("csdindia") || host.includes("gs1")) return "A";
  if (brandToken && host.replace(/[^a-z0-9]/g, "").includes(brandToken)) return "A";
  if (/distributor|beverages|spirits|brewer|brewery/.test(`${host} ${publisherText}`)) return "B";
  if (/bigbasket|amazon|flipkart|livingliquidz|tonique|naturebasket|jiomart/.test(host)) return "C";
  if (providerSet.has("OPENFOODFACTS")) return "E";
  if (providerSet.has("UPCITEMDB")) return "D";
  return "D";
}

export function sourceTierScore(tier) {
  return TIER_SCORE[String(tier || "D").toUpperCase()] ?? TIER_SCORE.D;
}

function bounded01(n) {
  return Math.max(0, Math.min(1, Number(n || 0)));
}

export function scoreEnrichmentCandidate(expected = {}, candidate = {}, mode = "DISCOVERY") {
  const conflicts = detectHardConflicts(expected, candidate);
  const queryTitle = expected.title || expected.query || "";
  const nameScore = textSimilarity(queryTitle, candidate.title || "");
  const brandScore = expected.brand && candidate.brand
    ? textSimilarity(expected.brand, candidate.brand)
    : 0;
  const expectedSize = Number(expected.sizeMl || 0) || null;
  const candidateSize = Number(candidate.sizeMl || 0) || null;
  const sizeScore = expectedSize && candidateSize
    ? expectedSize === candidateSize ? 1 : Math.abs(expectedSize - candidateSize) <= 10 ? 0.65 : 0
    : 0;
  const expectedPackage = normalizePackageType(expected.packageType);
  const candidatePackage = normalizePackageType(candidate.packageType);
  const packageScore = expectedPackage && candidatePackage
    ? expectedPackage === candidatePackage ? 1 : 0
    : 0;
  const sourceScore = sourceTierScore(candidate.sourceTier);
  const expectedBarcode = digitsOnly(expected.barcode || "");
  const candidateBarcode = digitsOnly(candidate.barcode || "");
  const exactBarcode = Boolean(
    expectedBarcode && candidateBarcode && expectedBarcode === candidateBarcode
  );

  let score;
  if (mode === "BARCODE_CONFIRM") {
    score =
      (exactBarcode ? 0.55 : 0) +
      nameScore * 0.15 +
      sizeScore * 0.10 +
      packageScore * 0.10 +
      brandScore * 0.07 +
      sourceScore * 0.03;
  } else {
    score =
      nameScore * 0.35 +
      sizeScore * 0.20 +
      brandScore * 0.20 +
      packageScore * 0.15 +
      sourceScore * 0.10;
  }

  score = bounded01(score);
  const confidenceBand = score >= 0.82 ? "HIGH" : score >= 0.60 ? "MEDIUM" : "LOW";
  const matchReasons = [];
  if (nameScore >= 0.72) matchReasons.push("Product/variant name matches");
  if (brandScore >= 0.72) matchReasons.push("Brand matches");
  if (sizeScore === 1) matchReasons.push("Size matches");
  if (packageScore === 1) matchReasons.push("Package matches");
  if (exactBarcode) matchReasons.push("Exact barcode matches");
  if (["A", "B"].includes(candidate.sourceTier)) {
    matchReasons.push(`Higher-quality source tier ${candidate.sourceTier}`);
  }

  return {
    score: Number(score.toFixed(3)),
    confidenceBand,
    conflicts,
    matchReasons,
    exactBarcode,
    canConfirm: mode === "BARCODE_CONFIRM" && exactBarcode && conflicts.length === 0,
  };
}

export function buildCacheIdentity({
  mode,
  query,
  brand,
  sizeMl,
  packageType,
  barcode,
  discoveryCacheKey,
  selectedCandidateId,
} = {}) {
  return {
    v: CACHE_VERSION,
    mode: String(mode || "DISCOVERY").toUpperCase(),
    q: normalizeText(query),
    brand: normalizeText(brand),
    sizeMl: Number(sizeMl || 0) || null,
    packageType: normalizePackageType(packageType),
    barcode: digitsOnly(barcode) || null,
    discoveryCacheKey: discoveryCacheKey || null,
    selectedCandidateId: selectedCandidateId || null,
  };
}

export function buildDiscoveryQuery({ query, brand, sizeMl, packageType } = {}) {
  const normalizedPackage = normalizePackageType(packageType);
  return [
    brand,
    query,
    Number(sizeMl || 0) > 0 ? `${Math.round(Number(sizeMl))} ml` : "",
    normalizedPackage === "CAN" ? "Can" : normalizedPackage === "BOTTLE" ? "Bottle" : packageType,
    "India",
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function buildBarcodeConfirmationQuery({ barcode, query, brand, sizeMl, packageType } = {}) {
  const normalizedPackage = normalizePackageType(packageType);
  return [
    digitsOnly(barcode),
    brand,
    query,
    Number(sizeMl || 0) > 0 ? `${Math.round(Number(sizeMl))} ml` : "",
    normalizedPackage === "CAN" ? "Can" : normalizedPackage === "BOTTLE" ? "Bottle" : packageType,
    "India",
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function shouldUseBrave(candidates = []) {
  const usefulVisuals = candidates.filter(
    (candidate) =>
      candidate.imagePreviewUrl &&
      Number(candidate.score || 0) >= 0.60 &&
      !(candidate.conflicts || []).length
  );
  const top = Number(candidates[0]?.score || 0);
  return usefulVisuals.length < 3 || top < 0.72;
}
