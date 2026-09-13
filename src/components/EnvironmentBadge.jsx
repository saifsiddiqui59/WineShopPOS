export default function EnvironmentBadge() {
  const configured = String(import.meta.env.VITE_ENV_BADGE || "").trim();
  const configuredUpper = configured.toUpperCase();
  const host =
    typeof window === "undefined"
      ? ""
      : String(window.location.hostname || "").toLowerCase();

  // Production must never render the QA/DEV banner. Preview detection is
  // intentionally generic so a deployment-specific QA hostname is never baked
  // into the production JavaScript bundle.
  const productionConfigured =
    configuredUpper === "PROD" || configuredUpper === "PRODUCTION";
  const productionHost = host === "wineshoppos.z29.web.core.windows.net";

  if (productionConfigured || productionHost) return null;

  const previewHost =
    host.startsWith("qa.") ||
    host.startsWith("dev.") ||
    (host.startsWith("wspv") && host.includes("qa"));

  const label = configured || (previewHost ? "QA / DEV · V5 · NOT PROD" : "");
  if (!label) return null;

  return (
    <div
      className="environment-preview-badge"
      data-environment-badge="QA-DEV-V5"
      data-environment-visible="true"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <strong>QA / DEV</strong>
      <span>V5</span>
      <span>NOT PROD</span>
    </div>
  );
}
