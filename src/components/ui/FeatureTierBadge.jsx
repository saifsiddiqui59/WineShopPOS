export default function FeatureTierBadge({ tier }) {
  if (!tier) return null;
  return <span className={`feature-tier-badge tier-${String(tier).toLowerCase()}`}>{tier}</span>;
}
