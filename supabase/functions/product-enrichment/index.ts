import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CACHE_VERSION,
  buildBarcodeConfirmationQuery,
  buildCacheIdentity,
  buildDiscoveryQuery,
  detectHardConflicts,
  digitsOnly,
  gtinValidation,
  inferPackageType,
  inferSizeMl,
  normalizePackageType,
  normalizeText,
  scoreEnrichmentCandidate,
  shouldUseBrave,
  sourceQualityTier,
  sourceTierScore,
} from "../_shared/productEnrichmentV3.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const OFF_FIELDS = [
  "code", "product_name", "brands", "quantity", "product_quantity",
  "product_quantity_unit", "image_front_url", "image_url", "categories", "packaging",
].join(",");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_BUCKET = "product-images";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function candidateId(candidate: any) {
  return (await sha256(JSON.stringify({
    title: normalizeText(candidate.title),
    brand: normalizeText(candidate.brand),
    sizeMl: Number(candidate.sizeMl || 0) || null,
    packageType: normalizePackageType(candidate.packageType),
    barcode: digitsOnly(candidate.barcode) || null,
    sourcePageUrl: candidate.sourcePageUrl || null,
    originalImageUrl: candidate.originalImageUrl || null,
    providers: candidate.providers || [],
  }))).slice(0, 24);
}

async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 5500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let payload: any = null;
    try { payload = await response.json(); } catch { payload = null; }
    return { ok: response.ok, status: response.status, payload };
  } finally {
    clearTimeout(timeout);
  }
}

function searchText(value: unknown) {
  return String(value ?? "")
    .replace(/\borginal\b/gi, "original")
    .replace(/\b\d+(?:\.\d+)?\s*(ml|cl|l)\b/gi, " ")
    .replace(/\b(can|bottle|bottles|btl|tin|pack)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function upcSearch(query: string, barcode: string | null) {
  try {
    const endpoint = barcode
      ? `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`
      : `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(searchText(query))}`;
    const r = await fetchJson(endpoint, { headers: { Accept: "application/json" } });
    if (r.status === 404) return { items: [], state: "NO_MATCH" };
    if (!r.ok) return { items: [], state: `UNAVAILABLE_${r.status}` };
    return { items: Array.isArray(r.payload?.items) ? r.payload.items : [], state: "OK" };
  } catch {
    return { items: [], state: "UNAVAILABLE" };
  }
}

async function offLookup(barcode: string) {
  if (!barcode) return { items: [], state: "NO_MATCH" };
  try {
    const r = await fetchJson(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${encodeURIComponent(OFF_FIELDS)}`,
      { headers: { "User-Agent": "WineShopPOS/5.0 (product-enrichment)" } },
    );
    if (r.ok && r.payload?.status === 1 && r.payload?.product) {
      return { items: [r.payload.product], state: "OK" };
    }
    if (r.status === 404 || r.payload?.status === 0) return { items: [], state: "NO_MATCH" };
    return { items: [], state: r.ok ? "NO_MATCH" : `UNAVAILABLE_${r.status}` };
  } catch {
    return { items: [], state: "UNAVAILABLE" };
  }
}

async function offSearch(query: string) {
  try {
    const q = searchText(query);
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}` +
      `&search_simple=1&action=process&json=1&page_size=8&fields=${encodeURIComponent(OFF_FIELDS)}`;
    const r = await fetchJson(
      url,
      { headers: { "User-Agent": "WineShopPOS/5.0 (product-enrichment)" } },
    );
    if (r.status === 404) return { items: [], state: "NO_MATCH" };
    if (!r.ok) return { items: [], state: `UNAVAILABLE_${r.status}` };
    return { items: Array.isArray(r.payload?.products) ? r.payload.products : [], state: "OK" };
  } catch {
    return { items: [], state: "UNAVAILABLE" };
  }
}

async function braveImageSearch(query: string) {
  const key = String(Deno.env.get("BRAVE_SEARCH_API_KEY") || "").trim();
  if (!key) return { items: [], state: "NOT_CONFIGURED" };

  const url = new URL("https://api.search.brave.com/res/v1/images/search");
  url.searchParams.set("q", query);
  url.searchParams.set("country", "IN");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("safesearch", "strict");
  url.searchParams.set("count", "16");

  try {
    const r = await fetchJson(
      url.toString(),
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": key,
        },
      },
      6500,
    );
    if (!r.ok) return { items: [], state: `UNAVAILABLE_${r.status}` };
    return {
      items: Array.isArray(r.payload?.results) ? r.payload.results : [],
      state: "OK",
    };
  } catch {
    return { items: [], state: "UNAVAILABLE" };
  }
}

function fromUpc(item: any, mode: string) {
  const barcode = digitsOnly(item?.ean || item?.upc || "");
  const title = String(item?.title || "").trim();
  const brand = String(item?.brand || "").trim();
  const image = Array.isArray(item?.images) ? item.images.find(Boolean) || null : null;
  const result = {
    title,
    brand,
    sizeMl: inferSizeMl([item?.size, title].filter(Boolean).join(" ")),
    packageType: inferPackageType([item?.size, title, item?.description].filter(Boolean).join(" ")),
    category: String(item?.category || "").trim(),
    barcode: barcode || null,
    barcodeStatus: barcode
      ? mode === "DISCOVERY" ? "INTERNET_SUGGESTED" : "EXACT_PROVIDER_RESULT"
      : "NOT_VERIFIED",
    imagePreviewUrl: image,
    originalImageUrl: image,
    sourcePageUrl: barcode ? `https://www.upcitemdb.com/upc/${encodeURIComponent(barcode)}` : null,
    publisher: "UPCitemdb",
    providers: ["UPCITEMDB"],
  };
  return { ...result, sourceTier: sourceQualityTier(result) };
}

function fromOff(item: any, mode: string) {
  const unit = String(item?.product_quantity_unit || "").toLowerCase();
  const qty = Number(item?.product_quantity || 0);
  const title = String(item?.product_name || "").trim();
  const barcode = digitsOnly(item?.code || "");
  const sizeMl = qty > 0
    ? unit === "l" ? Math.round(qty * 1000)
      : unit === "cl" ? Math.round(qty * 10)
      : Math.round(qty)
    : inferSizeMl(item?.quantity || title || "");
  const image = item?.image_front_url || item?.image_url || null;
  const result = {
    title,
    brand: String(item?.brands || "").split(",")[0]?.trim() || "",
    sizeMl,
    packageType: inferPackageType(`${item?.packaging || ""} ${item?.quantity || ""} ${title}`),
    category: String(item?.categories || "").split(",")[0]?.trim() || "",
    barcode: barcode || null,
    barcodeStatus: barcode
      ? mode === "DISCOVERY" ? "INTERNET_SUGGESTED" : "EXACT_PROVIDER_RESULT"
      : "NOT_VERIFIED",
    imagePreviewUrl: image,
    originalImageUrl: image,
    sourcePageUrl: barcode
      ? `https://world.openfoodfacts.org/product/${encodeURIComponent(barcode)}`
      : "https://world.openfoodfacts.org/",
    publisher: "OpenFoodFacts",
    providers: ["OPENFOODFACTS"],
  };
  return { ...result, sourceTier: sourceQualityTier(result) };
}

function fromBrave(item: any, expected: any) {
  const title = String(item?.title || "").trim();
  const pageUrl = String(item?.url || "").trim() || null;
  const publisher = String(item?.source || item?.meta_url?.hostname || "").trim();
  const originalImageUrl = String(item?.properties?.url || "").trim() || null;
  const imagePreviewUrl = String(item?.thumbnail?.src || item?.properties?.placeholder || "").trim() || null;
  const expectedBrand = String(expected?.brand || "").trim();
  const brand =
    expectedBrand && normalizeText(title).includes(normalizeText(expectedBrand))
      ? expectedBrand
      : "";

  const result = {
    title,
    brand,
    sizeMl: inferSizeMl(title),
    packageType: inferPackageType(title),
    category: "",
    barcode: null,
    barcodeStatus: "NOT_VERIFIED",
    imagePreviewUrl,
    originalImageUrl,
    sourcePageUrl: pageUrl,
    publisher,
    providers: ["BRAVE_IMAGES"],
  };
  return { ...result, sourceTier: sourceQualityTier(result) };
}

function betterTier(a: string, b: string) {
  return sourceTierScore(a) >= sourceTierScore(b) ? a : b;
}

function mergeCandidates(rows: any[]) {
  const map = new Map<string, any>();
  for (const candidate of rows) {
    const key =
      digitsOnly(candidate?.barcode || "") ||
      normalizeText(`${candidate?.title || ""}|${candidate?.brand || ""}|${candidate?.sizeMl || ""}|${candidate?.packageType || ""}|${candidate?.sourcePageUrl || ""}`);
    if (!key || (!candidate?.title && !candidate?.barcode)) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...candidate });
      continue;
    }
    existing.title ||= candidate.title;
    existing.brand ||= candidate.brand;
    existing.sizeMl ||= candidate.sizeMl;
    existing.packageType ||= candidate.packageType;
    existing.category ||= candidate.category;
    existing.imagePreviewUrl ||= candidate.imagePreviewUrl;
    existing.originalImageUrl ||= candidate.originalImageUrl;
    existing.sourcePageUrl ||= candidate.sourcePageUrl;
    existing.publisher ||= candidate.publisher;
    existing.barcode ||= candidate.barcode;
    existing.providers = [...new Set([...(existing.providers || []), ...(candidate.providers || [])])];
    existing.sourceTier = betterTier(existing.sourceTier || "E", candidate.sourceTier || "E");
  }
  return [...map.values()];
}

async function rankCandidates(expected: any, rows: any[], mode: string, limit = 5) {
  const merged = mergeCandidates(rows);
  const ranked = [];
  for (const candidate of merged) {
    const scored = scoreEnrichmentCandidate(expected, candidate, mode);
    ranked.push({
      ...candidate,
      candidateId: await candidateId(candidate),
      score: scored.score,
      confidenceBand: scored.confidenceBand,
      matchReasons: scored.matchReasons,
      conflicts: scored.conflicts,
      exactBarcode: scored.exactBarcode,
      canConfirm: scored.canConfirm,
    });
  }
  return ranked
    .filter((candidate) => mode === "BARCODE_CONFIRM" || candidate.score >= 0.24)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function authorize(authHeader: string | null) {
  if (!authHeader) throw new HttpError(401, "Missing authorization");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: { user }, error } = await caller.auth.getUser();
  if (error || !user) throw new HttpError(401, "Invalid session");

  return { caller, admin, user };
}

async function authorizeShop(admin: any, userId: string, shopId: string) {
  const { data: membership } = await admin
    .from("user_shop_memberships")
    .select("shop_id,role,active")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .eq("active", true)
    .maybeSingle();

  if (membership) return membership;

  const { data: profile } = await admin
    .from("profiles")
    .select("shop_id,role,active")
    .eq("id", userId)
    .eq("shop_id", shopId)
    .eq("active", true)
    .maybeSingle();

  if (!profile) throw new HttpError(403, "Shop access denied");
  return profile;
}

async function cacheKeyFor(body: any) {
  return sha256(JSON.stringify(buildCacheIdentity(body)));
}

async function getCached(admin: any, shopId: string, cacheKey: string, requireFresh = true) {
  let query = admin
    .from("product_enrichment_cache")
    .select("id,response,expires_at,hit_count")
    .eq("shop_id", shopId)
    .eq("cache_key", cacheKey);

  if (requireFresh) query = query.gt("expires_at", new Date().toISOString());

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data || null;
}

async function storeCache({
  admin,
  shopId,
  cacheKey,
  query,
  sizeMl,
  barcode,
  response,
  userId,
}: any) {
  const { error } = await admin.from("product_enrichment_cache").upsert({
    shop_id: shopId,
    cache_key: cacheKey,
    query_text: String(query || "barcode confirmation"),
    query_size_ml: Number(sizeMl || 0) || null,
    query_barcode: digitsOnly(barcode) || null,
    response,
    providers: response.providers || [],
    hit_count: 0,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "shop_id,cache_key" });
  if (error) throw error;
}

async function discovery({
  admin,
  user,
  shopId,
  query,
  brand,
  sizeMl,
  packageType,
}: any) {
  if (String(query || "").trim().length < 3) {
    throw new HttpError(400, "Product query is too short");
  }

  const mode = "DISCOVERY";
  const expected = {
    query,
    title: query,
    brand,
    sizeMl: Number(sizeMl || 0) || inferSizeMl(query),
    packageType: normalizePackageType(packageType) || inferPackageType(query),
  };

  const key = await cacheKeyFor({ mode, query, brand, sizeMl: expected.sizeMl, packageType: expected.packageType });
  const cached = await getCached(admin, shopId, key, true);
  if (cached?.response) {
    await admin
      .from("product_enrichment_cache")
      .update({
        hit_count: Number(cached.hit_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cached.id);
    return { ...cached.response, cacheHit: true };
  }

  const providerQuery = buildDiscoveryQuery(expected);
  const [upc, off] = await Promise.all([
    upcSearch(providerQuery, null),
    offSearch(providerQuery),
  ]);

  let rows = [
    ...(upc.items || []).slice(0, 8).map((item: any) => fromUpc(item, mode)),
    ...(off.items || []).slice(0, 8).map((item: any) => fromOff(item, mode)),
  ];

  let ranked = await rankCandidates(expected, rows, mode, 8);
  let brave = { items: [] as any[], state: "SKIPPED_SUFFICIENT_EXISTING" };

  if (shouldUseBrave(ranked)) {
    brave = await braveImageSearch(providerQuery);
    rows = [
      ...rows,
      ...(brave.items || []).map((item: any) => fromBrave(item, expected)),
    ];
    ranked = await rankCandidates(expected, rows, mode, 5);
  } else {
    ranked = ranked.slice(0, 5);
  }

  const providers = [...new Set(ranked.flatMap((x: any) => x.providers || []))];
  const response = {
    ok: true,
    mode,
    cacheVersion: CACHE_VERSION,
    cacheKey: key,
    query,
    queryBrand: brand || null,
    querySizeMl: expected.sizeMl || null,
    queryPackageType: expected.packageType || null,
    candidates: ranked,
    providers,
    checkedProviders: ["UPCITEMDB", "OPENFOODFACTS", "BRAVE_IMAGES"],
    providerStatus: {
      UPCITEMDB: upc.state,
      OPENFOODFACTS: off.state,
      BRAVE_IMAGES: brave.state,
    },
    cacheHit: false,
    note: ranked.length
      ? "Suggestions only. Select a candidate, then scan the physical product barcode."
      : "No external candidate found. Manual product creation remains available.",
  };

  await storeCache({
    admin,
    shopId,
    cacheKey: key,
    query,
    sizeMl: expected.sizeMl,
    barcode: null,
    response,
    userId: user.id,
  });

  return response;
}

async function barcodeConfirm({
  admin,
  user,
  shopId,
  query,
  brand,
  sizeMl,
  packageType,
  barcode,
  discoveryCacheKey,
  selectedCandidateId,
}: any) {
  const mode = "BARCODE_CONFIRM";
  const physicalBarcode = digitsOnly(barcode);
  if (physicalBarcode.length < 6) throw new HttpError(400, "Physical barcode is too short");

  const validation = gtinValidation(physicalBarcode);
  if (validation.recognized && !validation.valid) {
    throw new HttpError(400, "Barcode checksum is invalid. Scan the physical product again.");
  }

  let selectedCandidate: any = null;
  if (discoveryCacheKey && selectedCandidateId) {
    const discoveryCache = await getCached(admin, shopId, String(discoveryCacheKey), false);
    if (!discoveryCache?.response || discoveryCache.response.mode !== "DISCOVERY") {
      throw new HttpError(400, "Selected discovery candidate is no longer available");
    }
    selectedCandidate = (discoveryCache.response.candidates || [])
      .find((candidate: any) => candidate.candidateId === selectedCandidateId) || null;
    if (!selectedCandidate) throw new HttpError(400, "Selected candidate is invalid");
  }

  const expected = selectedCandidate
    ? {
        query: selectedCandidate.title,
        title: selectedCandidate.title,
        brand: selectedCandidate.brand,
        sizeMl: selectedCandidate.sizeMl,
        packageType: selectedCandidate.packageType,
        barcode: physicalBarcode,
      }
    : {
        query,
        title: query,
        brand,
        sizeMl: Number(sizeMl || 0) || inferSizeMl(query),
        packageType: normalizePackageType(packageType) || inferPackageType(query),
        barcode: physicalBarcode,
      };

  const key = await cacheKeyFor({
    mode,
    query: expected.query,
    brand: expected.brand,
    sizeMl: expected.sizeMl,
    packageType: expected.packageType,
    barcode: physicalBarcode,
    discoveryCacheKey,
    selectedCandidateId,
  });

  const cached = await getCached(admin, shopId, key, true);
  if (cached?.response) {
    await admin
      .from("product_enrichment_cache")
      .update({
        hit_count: Number(cached.hit_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cached.id);
    return { ...cached.response, cacheHit: true };
  }

  const providerQuery = buildBarcodeConfirmationQuery({
    barcode: physicalBarcode,
    query: expected.query,
    brand: expected.brand,
    sizeMl: expected.sizeMl,
    packageType: expected.packageType,
  });

  const [upc, off] = await Promise.all([
    upcSearch(providerQuery, physicalBarcode),
    offLookup(physicalBarcode),
  ]);

  const structuredRows = [
    ...(upc.items || []).slice(0, 6).map((item: any) => fromUpc(item, mode)),
    ...(off.items || []).slice(0, 6).map((item: any) => fromOff(item, mode)),
  ].filter((candidate: any) => digitsOnly(candidate.barcode) === physicalBarcode);

  let structuredRanked = await rankCandidates(expected, structuredRows, mode, 5);
  let brave = { items: [] as any[], state: "SKIPPED_STRUCTURED_EXACT_RESULT" };
  let fallbackRanked: any[] = [];

  if (!structuredRanked.length) {
    brave = await braveImageSearch(providerQuery);
    fallbackRanked = await rankCandidates(
      expected,
      (brave.items || []).map((item: any) => fromBrave(item, expected)),
      mode,
      5,
    );
  }

  const barcodeMatch = structuredRanked[0] || null;
  let outcome = "UNVERIFIED";
  let conflicts: any[] = [];

  if (barcodeMatch) {
    conflicts = detectHardConflicts(expected, barcodeMatch);
    outcome = conflicts.length ? "CONFLICT" : "CONFIRMED";
  }

  // For direct barcode lookup, a structured provider candidate becomes the selected result.
  // If providers cannot identify the barcode, a Brave image may be offered only as an
  // explicitly unverified visual suggestion.
  const effectiveSelected =
    selectedCandidate ||
    barcodeMatch ||
    fallbackRanked[0] ||
    null;

  const providers = [...new Set([
    ...structuredRanked.flatMap((x: any) => x.providers || []),
    ...fallbackRanked.flatMap((x: any) => x.providers || []),
    ...(effectiveSelected?.providers || []),
  ])];

  const response = {
    ok: true,
    mode,
    cacheVersion: CACHE_VERSION,
    cacheKey: key,
    confirmationCacheKey: key,
    physicalBarcode,
    gtinRecognized: validation.recognized,
    gtinChecksumValid: validation.recognized ? validation.valid : null,
    outcome,
    confirmed: outcome === "CONFIRMED",
    conflicts,
    selectedCandidate: effectiveSelected,
    selectedCandidateId: effectiveSelected?.candidateId || null,
    barcodeMatch,
    barcodeCandidates: structuredRanked,
    fallbackCandidates: fallbackRanked,
    providers,
    checkedProviders: ["UPCITEMDB", "OPENFOODFACTS", "BRAVE_IMAGES"],
    providerStatus: {
      UPCITEMDB: upc.state,
      OPENFOODFACTS: off.state,
      BRAVE_IMAGES: brave.state,
    },
    cacheHit: false,
    note:
      outcome === "CONFIRMED"
        ? "Physical barcode is supported by exact provider evidence and no hard product conflict was detected."
        : outcome === "CONFLICT"
          ? "Physical barcode evidence conflicts with the selected/current product identity. Nothing was changed automatically."
          : "Barcode was physically scanned, but internet identity could not be independently verified.",
  };

  await storeCache({
    admin,
    shopId,
    cacheKey: key,
    query: expected.query || physicalBarcode,
    sizeMl: expected.sizeMl,
    barcode: physicalBarcode,
    response,
    userId: user.id,
  });

  return response;
}

function ipv4Private(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return false;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function ipv6Private(ip: string) {
  const x = ip.toLowerCase();
  return (
    x === "::1" ||
    x === "::" ||
    x.startsWith("fc") ||
    x.startsWith("fd") ||
    x.startsWith("fe8") ||
    x.startsWith("fe9") ||
    x.startsWith("fea") ||
    x.startsWith("feb") ||
    x.startsWith("::ffff:127.") ||
    x.startsWith("::ffff:10.") ||
    x.startsWith("::ffff:192.168.") ||
    x.startsWith("::ffff:169.254.")
  );
}

function unsafeHostLiteral(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    host === "169.254.169.254" ||
    host === "100.100.100.200"
  ) return true;

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return ipv4Private(host);
  if (host.includes(":")) return ipv6Private(host);
  return false;
}

async function validateRemoteImageUrl(raw: string) {
  let url: URL;
  try { url = new URL(raw); } catch { throw new HttpError(400, "Candidate image URL is invalid"); }
  if (url.protocol !== "https:") throw new HttpError(400, "Candidate image must use HTTPS");
  if (url.username || url.password) throw new HttpError(400, "Credentialed image URLs are not allowed");
  if (unsafeHostLiteral(url.hostname)) throw new HttpError(400, "Unsafe image host blocked");

  const resolver = (Deno as any).resolveDns;
  if (typeof resolver !== "function") {
    throw new HttpError(503, "Image host safety validation is unavailable");
  }

  const addresses: string[] = [];
  try {
    const a = await resolver(url.hostname, "A");
    addresses.push(...(a || []));
  } catch {}
  try {
    const aaaa = await resolver(url.hostname, "AAAA");
    addresses.push(...(aaaa || []));
  } catch {}

  if (!addresses.length) throw new HttpError(400, "Image host could not be safely resolved");
  if (addresses.some((ip) => ipv4Private(ip) || ipv6Private(ip))) {
    throw new HttpError(400, "Unsafe image network target blocked");
  }
  return url;
}

function sniffImage(bytes: Uint8Array) {
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png =
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const webp =
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (jpeg) return { mime: "image/jpeg", ext: "jpg" };
  if (png) return { mime: "image/png", ext: "png" };
  if (webp) return { mime: "image/webp", ext: "webp" };
  throw new HttpError(400, "Downloaded candidate is not a supported JPEG, PNG or WebP image");
}

async function readLimitedBody(response: Response, maxBytes: number) {
  if (!response.body) throw new HttpError(400, "Image response is empty");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new HttpError(400, "Candidate image exceeds 5 MB");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function downloadSafeImage(raw: string) {
  let current = await validateRemoteImageUrl(raw);

  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    let response: Response;
    try {
      response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.5" },
      });
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirect === 3) throw new HttpError(400, "Too many image redirects");
      const location = response.headers.get("location");
      if (!location) throw new HttpError(400, "Image redirect is invalid");
      current = await validateRemoteImageUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) throw new HttpError(400, `Candidate image fetch failed (${response.status})`);

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_IMAGE_BYTES) throw new HttpError(400, "Candidate image exceeds 5 MB");

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (/html|svg|text\/|xml/.test(contentType)) {
      throw new HttpError(400, "Candidate source did not return a supported raster image");
    }

    const bytes = await readLimitedBody(response, MAX_IMAGE_BYTES);
    const type = sniffImage(bytes);
    return { bytes, ...type, finalUrl: current.toString() };
  }

  throw new HttpError(400, "Candidate image could not be downloaded safely");
}

async function finalizeSelection({
  caller,
  admin,
  user,
  membership,
  shopId,
  productId,
  confirmationCacheKey,
  candidateId: requestedCandidateId,
  importImage,
}: any) {
  if (!["ADMIN", "MANAGER"].includes(String(membership?.role || "").toUpperCase())) {
    throw new HttpError(403, "Manager or Admin access is required");
  }

  const cached = await getCached(admin, shopId, String(confirmationCacheKey || ""), false);
  const confirmation = cached?.response;
  if (!confirmation || confirmation.mode !== "BARCODE_CONFIRM") {
    throw new HttpError(400, "Barcode confirmation evidence is unavailable");
  }
  if (confirmation.outcome === "CONFLICT") {
    throw new HttpError(409, "Conflicting barcode evidence cannot be finalized");
  }
  if (!["CONFIRMED", "UNVERIFIED"].includes(confirmation.outcome)) {
    throw new HttpError(400, "Barcode confirmation state is not finalizable");
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,shop_id,barcode,product_name,brand,size_ml,image_path")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();
  if (productError) throw productError;
  if (!product) throw new HttpError(404, "Product not found in current shop");

  if (digitsOnly(product.barcode) !== digitsOnly(confirmation.physicalBarcode)) {
    throw new HttpError(409, "Saved Product Master barcode does not match the physically confirmed barcode");
  }

  const candidate = confirmation.selectedCandidate || null;
  if (
    requestedCandidateId &&
    candidate?.candidateId &&
    requestedCandidateId !== candidate.candidateId
  ) {
    throw new HttpError(400, "Candidate does not belong to this confirmation");
  }

  let newPath: string | null = null;
  let oldPath = product.image_path || null;
  let downloadedFrom: string | null = null;

  if (importImage) {
    if (!candidate?.candidateId || !candidate?.originalImageUrl) {
      throw new HttpError(400, "Selected candidate has no importable source image");
    }
    const image = await downloadSafeImage(candidate.originalImageUrl);
    downloadedFrom = image.finalUrl;
    newPath = `${shopId}/${productId}/${Date.now()}-enrichment.${image.ext}`;

    const { error: uploadError } = await admin.storage
      .from(IMAGE_BUCKET)
      .upload(newPath, image.bytes, {
        contentType: image.mime,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { error: linkError } = await caller.rpc("set_product_image", {
      p_product_id: productId,
      p_image_path: newPath,
    });
    if (linkError) {
      await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});
      throw linkError;
    }
  }

  const { data: shop } = await admin
    .from("shops")
    .select("organization_id")
    .eq("id", shopId)
    .maybeSingle();

  const auditPayload = {
    shop_id: shopId,
    organization_id: shop?.organization_id || null,
    actor_id: user.id,
    action: "PRODUCT_ENRICHMENT_ACCEPTED",
    entity_type: "product",
    entity_id: String(productId),
    old_data: null,
    new_data: newPath ? { image_path: newPath } : null,
    metadata: {
      enrichment_version: CACHE_VERSION,
      confirmation_state: confirmation.outcome,
      physical_barcode: confirmation.physicalBarcode,
      candidate_id: candidate?.candidateId || null,
      confirmation_cache_key: confirmationCacheKey,
      providers: confirmation.providers || [],
      source_publisher: candidate?.publisher || null,
      source_page_url: candidate?.sourcePageUrl || null,
      original_image_source: downloadedFrom || candidate?.originalImageUrl || null,
      match_score: candidate?.score ?? null,
      conflicts: confirmation.conflicts || [],
      image_imported: Boolean(newPath),
      inventory_changed: false,
      prices_changed: false,
    },
  };

  const { error: auditError } = await admin.from("audit_logs").insert(auditPayload);
  if (auditError) {
    if (newPath) {
      await caller.rpc("set_product_image", {
        p_product_id: productId,
        p_image_path: oldPath,
      }).catch(() => {});
      await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});
    }
    throw new HttpError(503, "Enrichment audit could not be recorded; image change was not retained");
  }

  if (newPath && oldPath && oldPath !== newPath) {
    await admin.storage.from(IMAGE_BUCKET).remove([oldPath]).catch(() => {});
  }

  return {
    ok: true,
    action: "FINALIZE",
    productId,
    confirmationState: confirmation.outcome,
    imageImported: Boolean(newPath),
    imagePath: newPath,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const started = Date.now();

  try {
    if (req.method !== "POST") throw new HttpError(405, "POST required");

    const { caller, admin, user } = await authorize(req.headers.get("Authorization"));
    const body = await req.json();
    const shopId = String(body?.shopId || "").trim();
    if (!shopId) throw new HttpError(400, "shopId is required");

    const membership = await authorizeShop(admin, user.id, shopId);
    const action = String(body?.action || "SEARCH").toUpperCase();

    let response: any;

    if (action === "FINALIZE") {
      response = await finalizeSelection({
        caller,
        admin,
        user,
        membership,
        shopId,
        productId: String(body?.productId || ""),
        confirmationCacheKey: String(body?.confirmationCacheKey || ""),
        candidateId: body?.candidateId ? String(body.candidateId) : null,
        importImage: Boolean(body?.importImage),
      });
    } else {
      const mode = String(body?.mode || "DISCOVERY").toUpperCase();
      if (mode === "DISCOVERY") {
        response = await discovery({
          admin,
          user,
          shopId,
          query: String(body?.query || "").trim(),
          brand: String(body?.brand || "").trim(),
          sizeMl: Number(body?.sizeMl || 0) || null,
          packageType: body?.packageType || null,
        });
      } else if (mode === "BARCODE_CONFIRM") {
        response = await barcodeConfirm({
          admin,
          user,
          shopId,
          query: String(body?.query || "").trim(),
          brand: String(body?.brand || "").trim(),
          sizeMl: Number(body?.sizeMl || 0) || null,
          packageType: body?.packageType || null,
          barcode: String(body?.barcode || ""),
          discoveryCacheKey: body?.discoveryCacheKey || null,
          selectedCandidateId: body?.selectedCandidateId || null,
        });
      } else {
        throw new HttpError(400, "Unsupported enrichment mode");
      }
    }

    return json(200, {
      ...response,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 400;
    const message = error instanceof Error ? error.message : String(error);
    return json(status, {
      ok: false,
      message,
      latencyMs: Date.now() - started,
    });
  }
});
