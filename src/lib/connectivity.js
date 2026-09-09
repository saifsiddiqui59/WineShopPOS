const env = import.meta.env ?? {};
const SUPABASE_URL = String(env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");

export const CONNECTIVITY_PROBE_MARKER = "V5_24_BACKEND_REACHABILITY";

/**
 * Connectivity means the configured Supabase host returned an HTTP response.
 * HTTP 401/403/404/405 still proves the network/backend is reachable.
 * Browser navigator.onLine is intentionally NOT authoritative here.
 */
export async function probeBackendUrl({
  url = SUPABASE_URL,
  timeoutMs = 4000,
  fetchImpl = globalThis.fetch,
} = {}) {
  const target = String(url || "").replace(/\/+$/, "");

  if (!target || typeof fetchImpl !== "function") {
    return {
      reachable: false,
      status: 0,
      reason: "CONFIG_OR_FETCH_UNAVAILABLE",
      marker: CONNECTIVITY_PROBE_MARKER,
    };
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout = Math.max(250, Number(timeoutMs) || 4000);
  const timer = controller
    ? setTimeout(() => controller.abort(), timeout)
    : null;

  try {
    const response = await fetchImpl(`${target}/rest/v1/`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller?.signal,
    });

    return {
      reachable: Boolean(response),
      status: Number(response?.status || 0),
      reason: "HTTP_RESPONSE",
      marker: CONNECTIVITY_PROBE_MARKER,
    };
  } catch (error) {
    return {
      reachable: false,
      status: 0,
      reason: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
      marker: CONNECTIVITY_PROBE_MARKER,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function probeBackendConnectivity(options = {}) {
  return probeBackendUrl({
    ...options,
    url: options.url || SUPABASE_URL,
  });
}
