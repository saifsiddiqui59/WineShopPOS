export default function EnvironmentBadge() {
  const label = String(import.meta.env.VITE_ENV_BADGE || "").trim();
  if (!label) return null;

  return (
    <div
      className="environment-preview-badge"
      data-environment-badge="QA-DEV-V5"
      role="status"
      aria-label={label}
    >
      {label}
    </div>
  );
}
