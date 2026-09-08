export default function EnvironmentBadge() {
  const configured = String(import.meta.env.VITE_ENV_BADGE || "").trim();
  const host = typeof window === "undefined" ? "" : String(window.location.hostname || "").toLowerCase();
  const isV5Preview = host === "wspv5qa3a5e8018.z29.web.core.windows.net" || host.startsWith("wspv5qa3a5e8018.");
  const label = configured || (isV5Preview ? "QA / DEV · V5 · NOT PROD" : "");
  if (!label) return null;
  return (
    <div className="environment-preview-badge" data-environment-badge="QA-DEV-V5" data-environment-visible="true" role="status" aria-live="polite" aria-label={label}>
      <strong>QA / DEV</strong><span>V5</span><span>NOT PROD</span>
    </div>
  );
}
