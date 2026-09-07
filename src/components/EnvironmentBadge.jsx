export default function EnvironmentBadge() {
  const label = String(import.meta.env.VITE_ENV_BADGE || "").trim();
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
