export default function LoadingState({ label = "Loading..." }) {
  return <div className="state-card loading-state"><span className="state-spinner" /> <span>{label}</span></div>;
}
