import { supabase } from "./supabase";

function functionUrl() {
  const base = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL is not configured.");
  return `${base}/functions/v1/product-enrichment`;
}

async function invoke(body, { signal } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Sign in again to use product lookup.");

  const apiKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "");
  const response = await fetch(functionUrl(), {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: apiKey,
    },
    body: JSON.stringify(body),
  });

  let payload = {};
  try { payload = await response.json(); } catch {}
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message || "Product lookup failed.");
  }
  return payload;
}

export function discoverProducts(body, options) {
  return invoke({ ...body, action: "SEARCH", mode: "DISCOVERY" }, options);
}

export function confirmPhysicalBarcode(body, options) {
  return invoke({ ...body, action: "SEARCH", mode: "BARCODE_CONFIRM" }, options);
}

export function finalizeProductEnrichment(body, options) {
  return invoke({ ...body, action: "FINALIZE" }, options);
}
