export default function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").replaceAll("_", " ");
  return <span className={`status-badge status-${String(status || "unknown").toLowerCase().replaceAll("_", "-")}`}>{value}</span>;
}
