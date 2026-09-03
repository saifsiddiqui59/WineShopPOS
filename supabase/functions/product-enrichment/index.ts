import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OFF_FIELDS = "code,product_name,brands,quantity,product_quantity,product_quantity_unit,image_front_url,image_url,categories,countries_tags";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function digits(value: unknown) { return String(value ?? "").replace(/\D/g, ""); }
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
async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 5500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}
async function upcSearch(query: string, barcode: string | null) {
  const endpoint = barcode
    ? `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`
    : `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(query)}`;
  const payload = await fetchJson(endpoint, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
  return Array.isArray(payload?.items) ? payload.items : [];
}
async function offLookup(barcode: string) {
  if (!barcode) return null;
  try {
    const payload = await fetchJson(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`,
      { headers: { "User-Agent": "WineShopPOS/3.0 (product-enrichment)" } },
    );
    return payload?.status === 1 ? payload.product || null : null;
  } catch { return null; }
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

    const cacheKey = await sha256(JSON.stringify({ q: normalize(query), sizeMl: querySizeMl || null, barcode }));
    const { data: cached } = await admin.from("product_enrichment_cache").select("id,response,expires_at,hit_count")
      .eq("shop_id", shopId).eq("cache_key", cacheKey).gt("expires_at", new Date().toISOString()).maybeSingle();

    if (cached?.response) {
      await admin.from("product_enrichment_cache").update({
        hit_count: Number(cached.hit_count || 0) + 1, updated_at: new Date().toISOString(),
      }).eq("id", cached.id);
      return Response.json({ ...cached.response, cacheHit: true, latencyMs: Date.now() - started }, { headers: corsHeaders });
    }

    let upcItems: any[] = [];
    let upcError = "";
    try { upcItems = await upcSearch(query, barcode); }
    catch (error) { upcError = error instanceof Error ? error.message : String(error); }

    const baseCandidates = upcItems.slice(0, 6).map((item: any) => {
      const candidateBarcode = digits(item?.ean || item?.upc || "");
      const sizeText = [item?.size, item?.title].filter(Boolean).join(" ");
      return {
        barcode: candidateBarcode || null,
        title: String(item?.title || "").trim(),
        brand: String(item?.brand || "").trim(),
        sizeMl: inferSizeMl(sizeText),
        category: String(item?.category || "").trim(),
        imageUrl: Array.isArray(item?.images) ? item.images[0] || null : null,
        providers: ["UPCITEMDB"],
      };
    }).filter((item: any) => item.title || item.barcode);

    const offDetails = await Promise.all(
      baseCandidates.slice(0, 3).map((candidate: any) =>
        candidate.barcode ? offLookup(candidate.barcode) : Promise.resolve(null)
      )
    );

    for (let i = 0; i < Math.min(3, baseCandidates.length); i += 1) {
      const off = offDetails[i];
      if (!off) continue;
      const candidate = baseCandidates[i];
      const offSize = Number(off?.product_quantity || 0) > 0
        ? String(off?.product_quantity_unit || "").toLowerCase() === "l"
          ? Math.round(Number(off.product_quantity) * 1000)
          : String(off?.product_quantity_unit || "").toLowerCase() === "cl"
            ? Math.round(Number(off.product_quantity) * 10)
            : Math.round(Number(off.product_quantity))
        : inferSizeMl(off?.quantity || "");
      candidate.title = String(off?.product_name || candidate.title || "").trim();
      candidate.brand = String(off?.brands || candidate.brand || "").trim();
      candidate.sizeMl = offSize || candidate.sizeMl;
      candidate.category = String(off?.categories || candidate.category || "").split(",")[0]?.trim() || candidate.category;
      candidate.imageUrl = off?.image_front_url || off?.image_url || candidate.imageUrl;
      candidate.providers.push("OPENFOODFACTS");
    }

    const deduped = new Map<string, any>();
    for (const candidate of baseCandidates) {
      const key = candidate.barcode || normalize(`${candidate.title}|${candidate.brand}|${candidate.sizeMl || ""}`);
      if (!key) continue;
      const existing = deduped.get(key);
      if (!existing || candidate.providers.length > existing.providers.length) deduped.set(key, candidate);
    }

    const candidates = [...deduped.values()].map((candidate: any) => ({
      ...candidate, score: Number(scoreCandidate(query, querySizeMl, candidate).toFixed(3)),
    })).sort((a: any, b: any) => b.score - a.score).slice(0, 5);

    const response = {
      ok: true, query, querySizeMl, barcode, candidates,
      providers: [...new Set(candidates.flatMap((candidate: any) => candidate.providers))],
      providerWarnings: upcError ? [`UPCitemdb: ${upcError}`] : [],
      cacheHit: false, latencyMs: Date.now() - started,
      note: candidates.length
        ? "External catalogue results are suggestions. Product Master remains authoritative until a user approves a candidate."
        : "No external candidate found. Create/review the product manually; Product Master remains authoritative.",
    };

    await admin.from("product_enrichment_cache").upsert({
      shop_id: shopId, cache_key: cacheKey, query_text: query,
      query_size_ml: querySizeMl, query_barcode: barcode, response,
      providers: response.providers, hit_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: user.id, updated_at: new Date().toISOString(),
    }, { onConflict: "shop_id,cache_key" });

    return Response.json(response, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : String(error), latencyMs: Date.now() - started },
      { status: 400, headers: corsHeaders },
    );
  }
});

