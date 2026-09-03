import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_VERSION = 2;
const OFF_FIELDS = "code,product_name,brands,quantity,product_quantity,product_quantity_unit,image_front_url,image_url,categories";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function digits(value: unknown) { return String(value ?? "").replace(/\D/g, ""); }
function searchText(value: unknown) {
  return String(value ?? "")
    .replace(/\borginal\b/gi, "original")
    .replace(/\b\d+(?:\.\d+)?\s*(ml|cl|l)\b/gi, " ")
    .replace(/\b(can|bottle|bottles|btl|tin|pack)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function inferSizeMl(value: unknown) {
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
function trigrams(value: string) {
  const text = `  ${normalize(value)}  `;
  const out = new Set<string>();
  for (let i = 0; i < text.length - 2; i += 1) out.add(text.slice(i, i + 3));
  return out;
}
function similarity(a: string, b: string) {
  const aa = trigrams(a), bb = trigrams(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection += 1;
  return (2 * intersection) / (aa.size + bb.size);
}
function scoreCandidate(query: string, querySizeMl: number | null, candidate: any) {
  const nameScore = similarity(query, `${candidate.title || ""} ${candidate.brand || ""}`);
  const size = Number(candidate.sizeMl || 0) || null;
  const sizeScore = querySizeMl && size ? (querySizeMl === size ? 0.16 : Math.abs(querySizeMl - size) <= 10 ? 0.08 : -0.08) : 0;
  return Math.max(0, Math.min(1, nameScore * 0.84 + sizeScore));
}
async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let payload: any = null;
    try { payload = await response.json(); } catch { payload = null; }
    return { ok: response.ok, status: response.status, payload };
  } finally { clearTimeout(timeout); }
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
  } catch { return { items: [], state: "UNAVAILABLE" }; }
}
async function offLookup(barcode: string) {
  if (!barcode) return null;
  try {
    const r = await fetchJson(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`,
      { headers: { "User-Agent": "WineShopPOS/3.1 (product-enrichment)" } },
    );
    return r.ok && r.payload?.status === 1 ? r.payload.product || null : null;
  } catch { return null; }
}
async function offSearch(query: string) {
  try {
    const q = searchText(query);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=6&fields=${encodeURIComponent(OFF_FIELDS)}`;
    const r = await fetchJson(url, { headers: { "User-Agent": "WineShopPOS/3.1 (product-enrichment)" } });
    if (r.status === 404) return { items: [], state: "NO_MATCH" };
    if (!r.ok) return { items: [], state: `UNAVAILABLE_${r.status}` };
    return { items: Array.isArray(r.payload?.products) ? r.payload.products : [], state: "OK" };
  } catch { return { items: [], state: "UNAVAILABLE" }; }
}
function fromOff(item: any) {
  const unit = String(item?.product_quantity_unit || "").toLowerCase();
  const qty = Number(item?.product_quantity || 0);
  const sizeMl = qty > 0
    ? unit === "l" ? Math.round(qty * 1000) : unit === "cl" ? Math.round(qty * 10) : Math.round(qty)
    : inferSizeMl(item?.quantity || item?.product_name || "");
  return {
    barcode: digits(item?.code || "") || null,
    title: String(item?.product_name || "").trim(),
    brand: String(item?.brands || "").split(",")[0]?.trim() || "",
    sizeMl,
    category: String(item?.categories || "").split(",")[0]?.trim() || "",
    imageUrl: item?.image_front_url || item?.image_url || null,
    providers: ["OPENFOODFACTS"],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const started = Date.now();
  try {
    if (req.method !== "POST") throw new Error("POST required");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) throw new Error("Invalid session");

    const body = await req.json();
    const shopId = String(body?.shopId || "");
    const query = String(body?.query || "").trim();
    const querySizeMl = Number(body?.sizeMl || 0) > 0 ? Math.round(Number(body.sizeMl)) : inferSizeMl(query);
    const barcode = digits(body?.barcode || "") || null;
    if (!shopId) throw new Error("shopId is required");
    if (!barcode && query.length < 3) throw new Error("Product query is too short");

    const { data: membership } = await admin.from("user_shop_memberships").select("shop_id,role,active")
      .eq("user_id", user.id).eq("shop_id", shopId).eq("active", true).maybeSingle();
    if (!membership) {
      const { data: profile } = await admin.from("profiles").select("shop_id,active")
        .eq("id", user.id).eq("shop_id", shopId).eq("active", true).maybeSingle();
      if (!profile) throw new Error("Shop access denied");
    }

    const cacheKey = await sha256(JSON.stringify({ v: CACHE_VERSION, q: normalize(searchText(query)), sizeMl: querySizeMl || null, barcode }));
    const { data: cached } = await admin.from("product_enrichment_cache").select("id,response,expires_at,hit_count")
      .eq("shop_id", shopId).eq("cache_key", cacheKey).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (cached?.response) {
      await admin.from("product_enrichment_cache").update({ hit_count: Number(cached.hit_count || 0) + 1, updated_at: new Date().toISOString() }).eq("id", cached.id);
      return Response.json({ ...cached.response, cacheHit: true, latencyMs: Date.now() - started }, { headers: corsHeaders });
    }

    const [upc, off] = await Promise.all([
      upcSearch(query, barcode),
      barcode ? offLookup(barcode).then((item) => ({ items: item ? [item] : [], state: item ? "OK" : "NO_MATCH" })) : offSearch(query),
    ]);

    const candidates: any[] = [];
    for (const item of (upc.items || []).slice(0, 6)) {
      candidates.push({
        barcode: digits(item?.ean || item?.upc || "") || null,
        title: String(item?.title || "").trim(),
        brand: String(item?.brand || "").trim(),
        sizeMl: inferSizeMl([item?.size, item?.title].filter(Boolean).join(" ")),
        category: String(item?.category || "").trim(),
        imageUrl: Array.isArray(item?.images) ? item.images[0] || null : null,
        providers: ["UPCITEMDB"],
      });
    }
    for (const item of (off.items || []).slice(0, 6)) candidates.push(fromOff(item));

    const upcCandidates = candidates.filter((x) => x.providers.includes("UPCITEMDB") && x.barcode).slice(0, 3);
    const details = await Promise.all(upcCandidates.map((x) => offLookup(x.barcode)));
    for (let i = 0; i < upcCandidates.length; i += 1) {
      const detail = details[i];
      if (!detail) continue;
      const enriched = fromOff(detail);
      const candidate = upcCandidates[i];
      candidate.title = enriched.title || candidate.title;
      candidate.brand = enriched.brand || candidate.brand;
      candidate.sizeMl = enriched.sizeMl || candidate.sizeMl;
      candidate.category = enriched.category || candidate.category;
      candidate.imageUrl = enriched.imageUrl || candidate.imageUrl;
      candidate.providers = [...new Set([...candidate.providers, "OPENFOODFACTS"])];
    }

    const deduped = new Map<string, any>();
    for (const candidate of candidates) {
      const key = candidate.barcode || normalize(`${candidate.title}|${candidate.brand}|${candidate.sizeMl || ""}`);
      if (!key || (!candidate.title && !candidate.barcode)) continue;
      const existing = deduped.get(key);
      if (!existing) deduped.set(key, candidate);
      else existing.providers = [...new Set([...(existing.providers || []), ...(candidate.providers || [])])];
    }

    const ranked = [...deduped.values()]
      .map((candidate) => ({ ...candidate, score: Number(scoreCandidate(query, querySizeMl, candidate).toFixed(3)) }))
      .filter((candidate) => candidate.score >= 0.28)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const response = {
      ok: true,
      cacheVersion: CACHE_VERSION,
      query,
      querySizeMl,
      barcode,
      candidates: ranked,
      providers: [...new Set(ranked.flatMap((x) => x.providers))],
      checkedProviders: ["UPCITEMDB", "OPENFOODFACTS"],
      providerStatus: { UPCITEMDB: upc.state, OPENFOODFACTS: off.state },
      providerWarnings: [],
      cacheHit: false,
      latencyMs: Date.now() - started,
      note: ranked.length
        ? "Catalogue suggestions found. Product Master remains authoritative until a user approves one."
        : "No catalogue match found. Use OCR-prefilled manual creation and scan/type the bottle barcode before saving.",
    };

    await admin.from("product_enrichment_cache").upsert({
      shop_id: shopId, cache_key: cacheKey, query_text: query, query_size_ml: querySizeMl,
      query_barcode: barcode, response, providers: response.providers, hit_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: user.id, updated_at: new Date().toISOString(),
    }, { onConflict: "shop_id,cache_key" });

    return Response.json(response, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ ok: false, message: error instanceof Error ? error.message : String(error), latencyMs: Date.now() - started }, { status: 400, headers: corsHeaders });
  }
});
