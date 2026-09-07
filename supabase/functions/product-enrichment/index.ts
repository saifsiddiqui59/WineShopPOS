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

function imageEditDistance(aRaw: unknown, bRaw: unknown) {
  const a = normalizeText(aRaw);
  const b = normalizeText(bRaw);
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }

  return dp[a.length][b.length];
}

const IMAGE_GENERIC_WORDS = new Set([
  "beer", "premium", "strong", "super", "classic", "lager",
  "whisky", "whiskey", "vodka", "rum", "gin", "brandy", "wine",
  "bottle", "can", "original", "reserve", "gold", "silver",
]);

function imageDistinctiveTokens(value: unknown) {
  return normalizeText(value)
    .split(" ")
    .filter((token) =>
      token.length >= 5 &&
      !IMAGE_GENERIC_WORDS.has(token) &&
      !/^\d+$/.test(token)
    );
}

function correctedImageToken(tokenRaw: string) {
  const token = normalizeText(tokenRaw);
  if (!token || token.length < 5 || /^\d+$/.test(token)) return token;

  // Search-only domain corrections. These do not mutate Product Master.
  const domain = [
    "premium", "lager", "original", "classic", "strong",
    "elephant", "reserve",
  ];

  let best = token;
  let bestDistance = 99;
  for (const candidate of domain) {
    if (Math.abs(candidate.length - token.length) > 2) continue;
    const d = imageEditDistance(token, candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }

  return bestDistance <= 2 ? best : token;
}

async function buildSerpImageIdentity(admin: any, shopId: string, product: any) {
  const [{ data: aliases, error: aliasError }, { data: shopProducts, error: productsError }] =
    await Promise.all([
      admin
        .from("product_aliases")
        .select("alias_text")
        .eq("shop_id", shopId)
        .eq("product_id", product.id)
        .limit(30),
      admin
        .from("products")
        .select("id,product_name,brand,size_ml,image_path")
        .eq("shop_id", shopId)
        .eq("active", true)
        .limit(500),
    ]);

  if (aliasError) throw aliasError;
  if (productsError) throw productsError;

  const rawName = String(product.product_name || "").trim();
  const rawBrand = String(product.brand || "").trim();
  const rawBrandNorm = normalizeText(rawBrand);
  const sizeMl = Number(product.size_ml || 0) || null;
  const packageType = inferPackageType(rawName);

  const currentDistinctive = new Set([
    ...imageDistinctiveTokens(rawName),
    ...(aliases || []).flatMap((row: any) => imageDistinctiveTokens(row.alias_text)),
  ]);

  // Search-only brand correction is conservative:
  // 1) brand spelling must be very close
  // 2) a sibling product using that brand must share a distinctive family token
  // This lets Cartsberg Elephant -> Carlsberg Elephant, but avoids arbitrary
  // correction between unrelated similarly-spelled brands.
  let searchBrand = rawBrand;
  let bestEvidence: any = null;

  for (const sibling of shopProducts || []) {
    const siblingBrand = String(sibling.brand || "").trim();
    const siblingBrandNorm = normalizeText(siblingBrand);
    if (!siblingBrandNorm || siblingBrandNorm === rawBrandNorm) continue;

    const distance = imageEditDistance(rawBrandNorm, siblingBrandNorm);
    const maxDistance = Math.max(rawBrandNorm.length, siblingBrandNorm.length) >= 7 ? 2 : 1;
    if (distance > maxDistance) continue;

    const siblingDistinctive = imageDistinctiveTokens(sibling.product_name);
    const overlap = siblingDistinctive.filter((token) => currentDistinctive.has(token));
    if (!overlap.length) continue;

    const evidence = {
      brand: siblingBrand,
      distance,
      overlap,
    };

    if (
      !bestEvidence ||
      evidence.distance < bestEvidence.distance ||
      (
        evidence.distance === bestEvidence.distance &&
        evidence.overlap.length > bestEvidence.overlap.length
      )
    ) {
      bestEvidence = evidence;
      searchBrand = siblingBrand;
    }
  }

  let workingName = rawName;
  if (
    rawBrand &&
    searchBrand &&
    normalizeText(rawBrand) !== normalizeText(searchBrand)
  ) {
    const escaped = rawBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    workingName = workingName.replace(new RegExp(`\\b${escaped}\\b`, "i"), searchBrand);
  }

  const correctedTokens = normalizeText(workingName)
    .split(" ")
    .filter(Boolean)
    .map(correctedImageToken);

  let searchName = correctedTokens.join(" ");
  const searchBrandNorm = normalizeText(searchBrand);

  if (searchBrand && searchName.startsWith(searchBrandNorm)) {
    searchName = searchBrand + searchName.slice(searchBrandNorm.length);
  }

  const packageLabel =
    packageType === "CAN" ? "Can" :
      packageType === "BOTTLE" ? "Bottle" : "";

  const distinctive = correctedTokens.filter((token) =>
    !IMAGE_GENERIC_WORDS.has(token) &&
    !searchBrandNorm.split(" ").includes(token)
  );

  // At most TWO search requests per product.
  const query1 = [
    searchName,
    sizeMl ? `${sizeMl} ml` : "",
    packageLabel,
    "India",
  ].filter(Boolean).join(" ");

  const query2 = [
    searchBrand,
    distinctive.slice(0, 4).join(" "),
    sizeMl ? `${sizeMl} ml` : "",
    packageLabel,
    "India",
  ].filter(Boolean).join(" ");

  const queries = [...new Set([query1, query2].map((q) => q.trim()).filter(Boolean))]
    .slice(0, 2);

  return {
    expected: {
      query: searchName,
      title: searchName,
      brand: searchBrand,
      sizeMl,
      packageType,
    },
    queries,
    raw: {
      productName: rawName,
      brand: rawBrand,
      aliases: (aliases || []).map((row: any) => row.alias_text),
    },
    canonical: {
      productName: searchName,
      brand: searchBrand,
      brandCorrectedForSearchOnly: normalizeText(searchBrand) !== rawBrandNorm,
      brandEvidence: bestEvidence,
    },
    shopProducts: shopProducts || [],
  };
}

async function serpApiFreeAccount() {
  const key = String(Deno.env.get("SERPAPI_API_KEY") || "").trim();
  if (!key) {
    throw new HttpError(
      503,
      "Free Google Images search is not configured. Add a SerpApi FREE API key or upload an image manually.",
    );
  }

  const url = new URL("https://serpapi.com/account.json");
  url.searchParams.set("api_key", key);

  const result = await fetchJson(
    url.toString(),
    { headers: { Accept: "application/json" } },
    5000,
  );

  if (!result.ok) {
    throw new HttpError(503, "Could not verify the free image-search account.");
  }

  const price = Number(result.payload?.plan_monthly_price);
  const allowPaid =
    String(Deno.env.get("SERPAPI_ALLOW_PAID") || "false").toLowerCase() === "true";

  if (!Number.isFinite(price)) {
    throw new HttpError(
      503,
      "Image search stopped because the provider plan price could not be verified.",
    );
  }

  if (price > 0 && !allowPaid) {
    throw new HttpError(
      402,
      "Image search stopped because the configured provider is a paid plan. No paid search was attempted.",
    );
  }

  const searchesLeft = Number(
    result.payload?.plan_searches_left ??
    result.payload?.total_searches_left ??
    NaN
  );

  if (Number.isFinite(searchesLeft) && searchesLeft <= 0) {
    throw new HttpError(
      429,
      "Free internet image-search quota is exhausted. No paid search was attempted. Upload an image manually or wait for the free quota to renew.",
    );
  }

  return {
    key,
    planName: String(result.payload?.plan_name || result.payload?.plan_id || "Free"),
    monthlyPrice: price,
    searchesPerMonth: Number(result.payload?.searches_per_month || 0) || null,
    searchesLeft: Number.isFinite(searchesLeft) ? searchesLeft : null,
  };
}

async function serpApiGoogleImages(query: string, account: any, choiceScope = "INDIA") {
  const scope = String(choiceScope || "INDIA").toUpperCase() === "GLOBAL"
    ? "GLOBAL"
    : "INDIA";

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en");
  url.searchParams.set("ijn", "0");

  if (scope === "INDIA") {
    url.searchParams.set("gl", "in");
    url.searchParams.set("google_domain", "google.co.in");
  } else {
    url.searchParams.set("google_domain", "google.com");
  }

  url.searchParams.set("api_key", account.key);

  const result = await fetchJson(
    url.toString(),
    { headers: { Accept: "application/json" } },
    9000,
  );

  if (!result.ok) {
    return {
      items: [],
      state: `UNAVAILABLE_${result.status}`,
      error: String(result.payload?.error || ""),
    };
  }

  if (result.payload?.error) {
    return {
      items: [],
      state: "PROVIDER_ERROR",
      error: String(result.payload.error),
    };
  }

  return {
    items: Array.isArray(result.payload?.images_results)
      ? result.payload.images_results
      : [],
    state: "OK",
    error: "",
  };
}

function fromSerpApiImage(item: any, expected: any) {
  const title = String(item?.title || "").trim();
  const pageUrl = String(item?.link || "").trim() || null;
  const publisher = String(item?.source || "").trim();
  const originalImageUrl = String(item?.original || "").trim() || null;
  const imagePreviewUrl = String(item?.thumbnail || "").trim() || null;

  const expectedBrand = String(expected?.brand || "").trim();
  const titleNorm = normalizeText(title);
  let brand = "";

  if (
    expectedBrand &&
    titleNorm.includes(normalizeText(expectedBrand))
  ) {
    brand = expectedBrand;
  } else {
    try {
      const host = new URL(pageUrl || "").hostname
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const brandToken = normalizeText(expectedBrand).replace(/\s+/g, "");
      if (brandToken && host.includes(brandToken)) brand = expectedBrand;
    } catch {}
  }

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
    providers: ["SERPAPI_GOOGLE_IMAGES"],
    originalWidth: Number(item?.original_width || 0) || null,
    originalHeight: Number(item?.original_height || 0) || null,
    isProduct: Boolean(item?.is_product),
    unsafe: Boolean(item?.unsafe),
    licenseDetailsUrl: String(item?.license_details_url || "").trim() || null,
  };

  return {
    ...result,
    sourceTier: sourceQualityTier(result),
  };
}

async function bestSameShopSerpImage(identity: any, product: any) {
  const ranked = (identity.shopProducts || [])
    .filter((row: any) =>
      row.id !== product.id &&
      Boolean(row.image_path) &&
      (Number(row.size_ml || 0) || null) === identity.expected.sizeMl
    )
    .map((row: any) => {
      const candidate = {
        title: row.product_name,
        brand: row.brand,
        sizeMl: Number(row.size_ml || 0) || null,
        packageType: inferPackageType(row.product_name),
        sourceTier: "A",
      };

      return {
        row,
        scored: scoreEnrichmentCandidate(identity.expected, candidate, "DISCOVERY"),
      };
    })
    .filter((entry: any) =>
      !(entry.scored.conflicts || []).length &&
      Number(entry.scored.score || 0) >= 0.82
    )
    .sort((a: any, b: any) =>
      Number(b.scored.score || 0) - Number(a.scored.score || 0)
    );

  return ranked[0] || null;
}

async function searchSerpImagesFree(identity: any, choiceScope = "INDIA") {
  const account = await serpApiFreeAccount();
  const scope = String(choiceScope || "INDIA").toUpperCase() === "GLOBAL"
    ? "GLOBAL"
    : "INDIA";

  const allRows: any[] = [];
  const attempts: any[] = [];

  for (const query of identity.queries.slice(0, 2)) {
    const result = await serpApiGoogleImages(query, account, scope);

    attempts.push({
      query,
      state: result.state,
      error: result.error || null,
    });

    const rows = (result.items || [])
      .filter((item: any) =>
        !item?.unsafe &&
        String(item?.original || "").startsWith("https://")
      )
      .slice(0, 100)
      .map((item: any) => fromSerpApiImage(item, identity.expected));

    allRows.push(...rows);

    const ranked = await rankCandidates(
      identity.expected,
      allRows,
      "DISCOVERY",
      100,
    );

    const useful = ranked.filter((candidate: any) =>
      Boolean(candidate.originalImageUrl) &&
      !(candidate.conflicts || []).length &&
      Number(candidate.score || 0) >= 0.50
    );

    // A single Google Images request can return a large result set.
    // Do not spend the second free request when the first already has choices.
    if (useful.length >= 4) break;
  }

  const ranked = await rankCandidates(
    identity.expected,
    allRows,
    "DISCOVERY",
    100,
  );

  return {
    account: {
      planName: account.planName,
      monthlyPrice: account.monthlyPrice,
      searchesPerMonth: account.searchesPerMonth,
      searchesLeftBefore: account.searchesLeft,
      paidAllowed: false,
    },
    attempts,
    candidates: ranked.filter((candidate: any) =>
      Boolean(candidate.originalImageUrl) &&
      !(candidate.conflicts || []).length &&
      Number(candidate.score || 0) >= 0.38
    ),
  };
}

async function imageChoiceCacheKeyFor(product: any, identity: any, choiceScope = "INDIA") {
  const scope = String(choiceScope || "INDIA").toUpperCase() === "GLOBAL"
    ? "GLOBAL"
    : "INDIA";

  return sha256(JSON.stringify({
    v: 5,
    mode: "IMAGE_CHOICES",
    scope,
    productId: String(product.id || ""),
    q: normalizeText(identity?.expected?.query || ""),
    brand: normalizeText(identity?.expected?.brand || ""),
    sizeMl: Number(identity?.expected?.sizeMl || 0) || null,
    packageType: normalizePackageType(identity?.expected?.packageType),
  }));
}

function scopedImageIdentity(identity: any, choiceScope = "INDIA") {
  const scope = String(choiceScope || "INDIA").toUpperCase() === "GLOBAL"
    ? "GLOBAL"
    : "INDIA";

  if (scope === "INDIA") return { ...identity, choiceScope: scope };

  const queries = (identity?.queries || [])
    .map((query: string) => {
      const text = String(query || "").trim();
      return text.toLowerCase().endsWith(" india")
        ? text.slice(0, -6).trim()
        : text;
    })
    .filter(Boolean);

  return {
    ...identity,
    queries: [...new Set(queries)].slice(0, 2),
    choiceScope: scope,
  };
}

async function imageCandidateHistory(
  admin: any,
  shopId: string,
  productId: string,
  imagePath: string | null,
) {
  const relevantActions = [
    "PRODUCT_IMAGE_AUTO_ENRICHED_SERPAPI_FREE",
    "PRODUCT_IMAGE_SELECTED_FROM_CHOOSER",
    "PRODUCT_IMAGE_TRY_ANOTHER",
  ];

  const { data, error } = await admin
    .from("audit_logs")
    .select("action,new_data,metadata,created_at")
    .eq("shop_id", shopId)
    .eq("entity_type", "product")
    .eq("entity_id", String(productId))
    .in("action", relevantActions)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const usedCandidateIds: string[] = [];
  let currentCandidateId: string | null = null;

  for (const row of data || []) {
    const candidateId = String(row?.metadata?.candidate_id || "").trim();
    if (candidateId && !usedCandidateIds.includes(candidateId)) {
      usedCandidateIds.push(candidateId);
    }

    if (
      !currentCandidateId &&
      imagePath &&
      String(row?.new_data?.image_path || "") === String(imagePath) &&
      candidateId
    ) {
      currentCandidateId = candidateId;
    }
  }

  return {
    currentCandidateId,
    usedCandidateIds,
  };
}

async function storeImageChoiceCache({
  admin,
  shopId,
  productId,
  cacheKey,
  identity,
  provider,
  candidates,
  userId,
  choiceScope,
}: any) {
  const usable = Array.isArray(candidates) ? candidates : [];
  const ttlMs = usable.length
    ? 24 * 60 * 60 * 1000
    : 30 * 60 * 1000;

  const response = {
    ok: true,
    mode: "IMAGE_CHOICES",
    strategyVersion: 5,
    productId,
    choiceScope,
    searchIdentity: {
      productName: identity?.canonical?.productName || null,
      brand: identity?.canonical?.brand || null,
      brandCorrectedOnlyForSearch:
        Boolean(identity?.canonical?.brandCorrectedForSearchOnly),
    },
    providerAccount: provider?.account || null,
    providerAttempts: provider?.attempts || [],
    candidates: usable.slice(0, 100),
    createdAt: new Date().toISOString(),
    positiveCache: usable.length > 0,
  };

  const { error } = await admin
    .from("product_enrichment_cache")
    .upsert({
      shop_id: shopId,
      cache_key: cacheKey,
      query_text: String(identity?.queries?.[0] || identity?.expected?.query || "image choices"),
      query_size_ml: Number(identity?.expected?.sizeMl || 0) || null,
      query_barcode: null,
      response,
      providers: ["SERPAPI_GOOGLE_IMAGES"],
      hit_count: 0,
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      created_by: userId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "shop_id,cache_key",
    });

  if (error) throw error;
  return response;
}

function publicImageChoice(candidate: any, history: any) {
  const previewCandidate = String(
    candidate?.imagePreviewUrl || candidate?.originalImageUrl || ""
  ).trim();

  const previewUrl = previewCandidate.startsWith("https://")
    ? previewCandidate
    : null;

  const candidateId = String(candidate?.candidateId || "");

  return {
    candidateId,
    title: candidate?.title || "Product image",
    publisher: candidate?.publisher || "Web image",
    sourcePageUrl: candidate?.sourcePageUrl || null,
    imagePreviewUrl: previewUrl,
    sizeMl: Number(candidate?.sizeMl || 0) || null,
    packageType: candidate?.packageType || null,
    score: candidate?.score ?? null,
    confidenceBand: candidate?.confidenceBand || null,
    isCurrent:
      Boolean(candidateId) &&
      candidateId === history?.currentCandidateId,
    wasUsed:
      Boolean(candidateId) &&
      (history?.usedCandidateIds || []).includes(candidateId),
  };
}

async function getProductImageChoices({
  admin,
  user,
  membership,
  shopId,
  productId,
  choiceScope,
}: any) {
  if (!["ADMIN", "MANAGER"].includes(String(membership?.role || "").toUpperCase())) {
    throw new HttpError(403, "Manager or Admin access is required");
  }

  if (!productId) throw new HttpError(400, "productId is required");

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,shop_id,barcode,product_name,brand,size_ml,image_path")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new HttpError(404, "Product not found in current shop");

  const rawIdentity = await buildSerpImageIdentity(admin, shopId, product);
  const scope = String(choiceScope || "INDIA").toUpperCase() === "GLOBAL"
    ? "GLOBAL"
    : "INDIA";
  const identity = scopedImageIdentity(rawIdentity, scope);
  const cacheKey = await imageChoiceCacheKeyFor(product, identity, scope);

  let cached = await getCached(admin, shopId, cacheKey, true);
  let response = cached?.response;
  let cacheHit = false;

  if (
    response?.mode === "IMAGE_CHOICES" &&
    String(response?.productId || "") === String(productId)
  ) {
    cacheHit = true;

    await admin
      .from("product_enrichment_cache")
      .update({
        hit_count: Number(cached?.hit_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cached.id);
  } else {
    const provider = await searchSerpImagesFree(identity, scope);

    response = await storeImageChoiceCache({
      admin,
      shopId,
      productId,
      cacheKey,
      identity,
      provider,
      candidates: provider.candidates || [],
      userId: user.id,
      choiceScope: scope,
    });
  }

  const history = await imageCandidateHistory(
    admin,
    shopId,
    productId,
    product.image_path || null,
  );

  const choices = (response?.candidates || [])
    .slice(0, 100)
    .map((candidate: any) => publicImageChoice(candidate, history));

  return {
    ok: true,
    action: "IMAGE_CHOICES",
    strategyVersion: 5,
    productId,
    choiceScope: scope,
    choiceCacheKey: cacheKey,
    cacheHit,
    cachePolicy: choices.length
      ? "24_HOURS_POSITIVE"
      : "30_MINUTES_EMPTY",
    maxProviderSearchesWhenFresh: 2,
    freeOnly: true,
    paidAllowed: false,
    choices,
    currentCandidateId: history.currentCandidateId,
    usedCandidateIds: history.usedCandidateIds,
    searchIdentity: response?.searchIdentity || null,
    providerAccount: response?.providerAccount || null,
    providerAttempts: cacheHit ? [] : response?.providerAttempts || [],
    barcodeBefore: String(product.barcode || ""),
    barcodeAfter: String(product.barcode || ""),
    barcodeUnchanged: true,
  };
}

async function applyCachedImageChoice({
  caller,
  admin,
  user,
  membership,
  shopId,
  productId,
  choiceCacheKey,
  candidateId,
  selectionMode,
}: any) {
  if (!["ADMIN", "MANAGER"].includes(String(membership?.role || "").toUpperCase())) {
    throw new HttpError(403, "Manager or Admin access is required");
  }

  const mode = String(selectionMode || "CHOOSER").toUpperCase();
  if (!["CHOOSER", "TRY_ANOTHER"].includes(mode)) {
    throw new HttpError(400, "Unsupported image selection mode");
  }

  if (!productId || !choiceCacheKey || !candidateId) {
    throw new HttpError(400, "Product, image choices and candidate are required");
  }

  const cached = await getCached(admin, shopId, String(choiceCacheKey), true);
  const choiceSet = cached?.response;

  if (
    !choiceSet ||
    choiceSet.mode !== "IMAGE_CHOICES" ||
    String(choiceSet.productId || "") !== String(productId)
  ) {
    throw new HttpError(
      410,
      "Image choices expired. Open Choose Image again to refresh the list.",
    );
  }

  const candidate = (choiceSet.candidates || []).find(
    (row: any) => String(row?.candidateId || "") === String(candidateId)
  );

  if (!candidate?.originalImageUrl) {
    throw new HttpError(400, "Selected image is not available in the verified choice set");
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,shop_id,barcode,product_name,brand,size_ml,image_path")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new HttpError(404, "Product not found in current shop");

  const barcodeBefore = String(product.barcode || "");
  const oldPath = product.image_path || null;

  const image = await downloadSafeImage(candidate.originalImageUrl);
  const newPath =
    `${shopId}/${productId}/${Date.now()}-` +
    `${mode === "TRY_ANOTHER" ? "try-another" : "chosen"}-image.${image.ext}`;

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

  const { data: verified, error: verifyError } = await admin
    .from("products")
    .select("barcode,image_path,product_name,brand,size_ml")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();

  const identityUnchanged =
    verified &&
    String(verified.barcode || "") === barcodeBefore &&
    String(verified.product_name || "") === String(product.product_name || "") &&
    String(verified.brand || "") === String(product.brand || "") &&
    Number(verified.size_ml || 0) === Number(product.size_ml || 0);

  if (
    verifyError ||
    !verified ||
    !identityUnchanged ||
    String(verified.image_path || "") !== newPath
  ) {
    await caller.rpc("set_product_image", {
      p_product_id: productId,
      p_image_path: oldPath,
    }).catch(() => {});

    await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});

    throw new HttpError(
      409,
      "Image-only safety verification failed. Image change was rolled back.",
    );
  }

  const { data: shop } = await admin
    .from("shops")
    .select("organization_id")
    .eq("id", shopId)
    .maybeSingle();

  const auditAction =
    mode === "TRY_ANOTHER"
      ? "PRODUCT_IMAGE_TRY_ANOTHER"
      : "PRODUCT_IMAGE_SELECTED_FROM_CHOOSER";

  const { error: auditError } = await admin.from("audit_logs").insert({
    shop_id: shopId,
    organization_id: shop?.organization_id || null,
    actor_id: user.id,
    action: auditAction,
    entity_type: "product",
    entity_id: String(productId),
    old_data: { image_path: oldPath },
    new_data: { image_path: newPath },
    metadata: {
      image_only: true,
      strategy_version: 4,
      selection_mode: mode,
      chosen_by_user: mode === "CHOOSER",
      try_another: mode === "TRY_ANOTHER",
      free_only: true,
      paid_provider_allowed: false,
      choice_cache_key: choiceCacheKey,
      candidate_id: candidate.candidateId || null,
      candidate_title: candidate.title || null,
      candidate_publisher: candidate.publisher || null,
      source_page_url: candidate.sourcePageUrl || null,
      original_image_source: image.finalUrl || candidate.originalImageUrl || null,
      match_score: candidate.score ?? null,
      confidence_band: candidate.confidenceBand || null,
      barcode_before: barcodeBefore,
      barcode_after: String(verified.barcode || ""),
      barcode_changed: false,
      product_identity_changed: false,
      inventory_changed: false,
      prices_changed: false,
    },
  });

  if (auditError) {
    await caller.rpc("set_product_image", {
      p_product_id: productId,
      p_image_path: oldPath,
    }).catch(() => {});

    await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});

    throw new HttpError(
      503,
      "Image audit could not be recorded. Image change was not retained.",
    );
  }

  if (oldPath && oldPath !== newPath) {
    await admin.storage.from(IMAGE_BUCKET).remove([oldPath]).catch(() => {});
  }

  return {
    ok: true,
    action:
      mode === "TRY_ANOTHER"
        ? "TRY_ANOTHER_IMAGE"
        : "APPLY_IMAGE_CHOICE",
    strategyVersion: 4,
    productId,
    imagePath: newPath,
    candidate: {
      candidateId: candidate.candidateId || null,
      title: candidate.title || null,
      publisher: candidate.publisher || null,
      sourcePageUrl: candidate.sourcePageUrl || null,
      score: candidate.score ?? null,
      confidenceBand: candidate.confidenceBand || null,
    },
    barcodeBefore,
    barcodeAfter: String(verified.barcode || ""),
    barcodeUnchanged: true,
    productIdentityUnchanged: true,
    note:
      mode === "TRY_ANOTHER"
        ? "Next unused image candidate applied. Barcode and Product Master identity unchanged."
        : "Selected image applied. Barcode and Product Master identity unchanged.",
  };
}

async function tryAnotherProductImage({
  caller,
  admin,
  user,
  membership,
  shopId,
  productId,
}: any) {
  const choices = await getProductImageChoices({
    admin,
    user,
    membership,
    shopId,
    productId,
    choiceScope: "INDIA",
  });

  if (!choices.choices?.length) {
    throw new HttpError(
      404,
      "No alternative image choices are currently available.",
    );
  }

  let next = choices.choices.find(
    (choice: any) => !choice.isCurrent && !choice.wasUsed
  );

  if (!next) {
    next = choices.choices.find((choice: any) => !choice.isCurrent);
  }

  if (!next) {
    throw new HttpError(
      404,
      "No different image is available in the current search results.",
    );
  }

  return applyCachedImageChoice({
    caller,
    admin,
    user,
    membership,
    shopId,
    productId,
    choiceCacheKey: choices.choiceCacheKey,
    candidateId: next.candidateId,
    selectionMode: "TRY_ANOTHER",
  });
}


async function autoFindAndAttachImage({
  caller,
  admin,
  user,
  membership,
  shopId,
  productId,
  replace,
}: any) {
  if (!["ADMIN", "MANAGER"].includes(String(membership?.role || "").toUpperCase())) {
    throw new HttpError(403, "Manager or Admin access is required");
  }

  if (!productId) throw new HttpError(400, "productId is required");

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,shop_id,barcode,product_name,brand,size_ml,image_path")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new HttpError(404, "Product not found in current shop");

  const barcodeBefore = String(product.barcode || "");

  if (product.image_path && !replace) {
    return {
      ok: true,
      action: "AUTO_IMAGE",
      strategyVersion: 3,
      productId,
      imagePath: product.image_path,
      sourceType: "EXISTING",
      barcodeBefore,
      barcodeAfter: barcodeBefore,
      barcodeUnchanged: true,
      reviewRecommended: false,
      note: "Product already has an image. Open Edit Product to replace it.",
    };
  }

  const identity = await buildSerpImageIdentity(admin, shopId, product);

  let bytes: Uint8Array | null = null;
  let mime: string | null = null;
  let ext: string | null = null;
  let sourceType = "SERPAPI_GOOGLE_IMAGES";
  let sourceProductId: string | null = null;
  let sourceImagePath: string | null = null;
  let downloadedFrom: string | null = null;
  let candidate: any = null;
  let provider: any = null;
  const downloadFailures: any[] = [];

  const peer = await bestSameShopSerpImage(identity, product);

  if (peer?.row?.image_path) {
    const { data: blob, error: downloadError } = await admin.storage
      .from(IMAGE_BUCKET)
      .download(peer.row.image_path);

    if (!downloadError && blob) {
      const raw = new Uint8Array(await blob.arrayBuffer());
      const detected = sniffImage(raw);

      bytes = raw;
      mime = detected.mime;
      ext = detected.ext;
      sourceType = "SHOP_IMAGE";
      sourceProductId = String(peer.row.id);
      sourceImagePath = String(peer.row.image_path);

      candidate = {
        candidateId: `shop-${peer.row.id}`,
        title: peer.row.product_name,
        brand: peer.row.brand,
        sizeMl: Number(peer.row.size_ml || 0) || null,
        packageType: inferPackageType(peer.row.product_name),
        score: Number(peer.scored.score || 1),
        confidenceBand: "HIGH",
        conflicts: [],
        providers: ["SHOP_IMAGE"],
        publisher: "WineShopPOS shop catalogue",
      };
    }
  }

  if (!bytes) {
    provider = await searchSerpImagesFree(identity);

    for (const rankedCandidate of provider.candidates.slice(0, 8)) {
      try {
        const image = await downloadSafeImage(rankedCandidate.originalImageUrl);

        candidate = rankedCandidate;
        bytes = image.bytes;
        mime = image.mime;
        ext = image.ext;
        downloadedFrom = image.finalUrl;
        break;
      } catch (error) {
        downloadFailures.push({
          candidateId: rankedCandidate.candidateId || null,
          publisher: rankedCandidate.publisher || null,
          sourcePageUrl: rankedCandidate.sourcePageUrl || null,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (!bytes) {
      throw new HttpError(
        404,
        "Google Images search ran but no safe matching image could be attached. Barcode was not changed. Use Edit Product to upload an image or try again later.",
      );
    }
  }

  if (!bytes || !mime || !ext) {
    throw new HttpError(500, "Image candidate could not be prepared safely");
  }

  const oldPath = product.image_path || null;
  const newPath = `${shopId}/${productId}/${Date.now()}-serpapi-image.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(IMAGE_BUCKET)
    .upload(newPath, bytes, {
      contentType: mime,
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

  // Only image_path is allowed to change. Prove identity/barcode stayed intact.
  const { data: verified, error: verifyError } = await admin
    .from("products")
    .select("barcode,image_path,product_name,brand,size_ml")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .maybeSingle();

  const identityUnchanged =
    verified &&
    String(verified.barcode || "") === barcodeBefore &&
    String(verified.product_name || "") === String(product.product_name || "") &&
    String(verified.brand || "") === String(product.brand || "") &&
    Number(verified.size_ml || 0) === Number(product.size_ml || 0);

  if (
    verifyError ||
    !verified ||
    !identityUnchanged ||
    String(verified.image_path || "") !== newPath
  ) {
    await caller.rpc("set_product_image", {
      p_product_id: productId,
      p_image_path: oldPath,
    }).catch(() => {});

    await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});

    throw new HttpError(
      409,
      "Image-only safety verification failed. Image attachment was rolled back.",
    );
  }

  const { data: shop } = await admin
    .from("shops")
    .select("organization_id")
    .eq("id", shopId)
    .maybeSingle();

  const { error: auditError } = await admin.from("audit_logs").insert({
    shop_id: shopId,
    organization_id: shop?.organization_id || null,
    actor_id: user.id,
    action: "PRODUCT_IMAGE_AUTO_ENRICHED_SERPAPI_FREE",
    entity_type: "product",
    entity_id: String(productId),
    old_data: { image_path: oldPath },
    new_data: { image_path: newPath },
    metadata: {
      image_only: true,
      strategy_version: 3,
      free_only: true,
      paid_provider_allowed: false,
      max_searches_per_product: 2,

      raw_product_name: identity.raw.productName,
      raw_brand: identity.raw.brand,
      learned_aliases_used: identity.raw.aliases,

      search_product_name: identity.canonical.productName,
      search_brand: identity.canonical.brand,
      search_brand_corrected_only_for_search:
        identity.canonical.brandCorrectedForSearchOnly,
      search_brand_evidence: identity.canonical.brandEvidence,

      search_queries: provider?.attempts?.map((x: any) => x.query) || [],
      provider_attempts: provider?.attempts || [],
      provider_account: provider?.account || null,

      barcode_before: barcodeBefore,
      barcode_after: String(verified.barcode || ""),
      barcode_changed: false,
      product_identity_changed: false,
      inventory_changed: false,
      prices_changed: false,

      source_type: sourceType,
      source_product_id: sourceProductId,
      source_image_path: sourceImagePath,
      candidate_id: candidate?.candidateId || null,
      candidate_title: candidate?.title || null,
      source_publisher: candidate?.publisher || null,
      source_page_url: candidate?.sourcePageUrl || null,
      original_image_source:
        downloadedFrom || candidate?.originalImageUrl || null,
      license_details_url: candidate?.licenseDetailsUrl || null,
      match_score: candidate?.score ?? null,
      confidence_band: candidate?.confidenceBand || null,

      download_failures: downloadFailures.slice(0, 8),
      generic_discovery_cache_used: false,
    },
  });

  if (auditError) {
    await caller.rpc("set_product_image", {
      p_product_id: productId,
      p_image_path: oldPath,
    }).catch(() => {});

    await admin.storage.from(IMAGE_BUCKET).remove([newPath]).catch(() => {});

    throw new HttpError(
      503,
      "Image audit could not be recorded. Image change was not retained.",
    );
  }

  if (oldPath && oldPath !== newPath) {
    await admin.storage.from(IMAGE_BUCKET).remove([oldPath]).catch(() => {});
  }

  return {
    ok: true,
    action: "AUTO_IMAGE",
    strategyVersion: 3,
    productId,
    imagePath: newPath,
    sourceType,

    searchIdentity: {
      rawProductName: identity.raw.productName,
      rawBrand: identity.raw.brand,
      searchProductName: identity.canonical.productName,
      searchBrand: identity.canonical.brand,
      brandCorrectedOnlyForSearch:
        identity.canonical.brandCorrectedForSearchOnly,
      queries: provider?.attempts?.map((x: any) => x.query) || [],
    },

    freeProvider: provider?.account || null,

    candidate: candidate
      ? {
          candidateId: candidate.candidateId || null,
          title: candidate.title || null,
          publisher: candidate.publisher || null,
          sourcePageUrl: candidate.sourcePageUrl || null,
          providers: candidate.providers || [],
          score: candidate.score ?? null,
          confidenceBand: candidate.confidenceBand || null,
        }
      : null,

    barcodeBefore,
    barcodeAfter: String(verified.barcode || ""),
    barcodeUnchanged: true,

    reviewRecommended:
      sourceType === "SERPAPI_GOOGLE_IMAGES" &&
      Number(candidate?.score || 0) < 0.62,

    note:
      sourceType === "SHOP_IMAGE"
        ? "Approved same-shop image reused. Barcode and Product Master identity unchanged."
        : "Google Images result attached through the free-only provider. Barcode and Product Master identity unchanged.",
  };
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

    if (action === "IMAGE_CHOICES") {
      response = await getProductImageChoices({
        admin,
        user,
        membership,
        shopId,
        productId: String(body?.productId || ""),
        choiceScope: String(body?.choiceScope || "INDIA"),
      });
    } else if (action === "APPLY_IMAGE_CHOICE") {
      response = await applyCachedImageChoice({
        caller,
        admin,
        user,
        membership,
        shopId,
        productId: String(body?.productId || ""),
        choiceCacheKey: String(body?.choiceCacheKey || ""),
        candidateId: String(body?.candidateId || ""),
        selectionMode: "CHOOSER",
      });
    } else if (action === "TRY_ANOTHER_IMAGE") {
      response = await tryAnotherProductImage({
        caller,
        admin,
        user,
        membership,
        shopId,
        productId: String(body?.productId || ""),
      });
    } else if (action === "AUTO_IMAGE") {
      response = await autoFindAndAttachImage({
        caller,
        admin,
        user,
        membership,
        shopId,
        productId: String(body?.productId || ""),
        replace: Boolean(body?.replace),
      });
    } else if (action === "FINALIZE") {
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
