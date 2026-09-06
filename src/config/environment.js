export const PROD_STATIC_HOST = "wineshoppos.z29.web.core.windows.net";
export const V4_QA_STATIC_HOST = "wspv4d66ca1d443.z29.web.core.windows.net";

function hashSearchParams() {
  const hash = String(window.location.hash || "");
  const queryIndex = hash.indexOf("?");
  return new URLSearchParams(queryIndex >= 0 ? hash.slice(queryIndex + 1) : "");
}

export function getEnvironment() {
  const host = String(window.location.hostname || "").toLowerCase();
  const mode = hashSearchParams().get("mode");

  const production =
    host === PROD_STATIC_HOST ||
    host.startsWith("app.") ||
    host.startsWith("prod.");

  const qa =
    host === V4_QA_STATIC_HOST ||
    host.startsWith("qa.") ||
    host.startsWith("dev.") ||
    host.startsWith("wspv4");

  return {
    production,
    qa: !production && qa,
    demoEntry: mode === "demo",
    label: production ? "PRODUCTION" : (qa ? "QA / DEV" : "ENVIRONMENT"),
  };
}
