export default function MetricCard({ label, value, helper, tone = "default" }) {
  return <div className={`metric-card metric-${tone}`}><span>{label}</span><strong>{value}</strong>{helper ? <small>{helper}</small> : null}</div>;
}
