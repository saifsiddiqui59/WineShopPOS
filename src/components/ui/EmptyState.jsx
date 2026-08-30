export default function EmptyState({ title, message, action }) {
  return <div className="state-card empty-state"><strong>{title}</strong>{message ? <p>{message}</p> : null}{action}</div>;
}
