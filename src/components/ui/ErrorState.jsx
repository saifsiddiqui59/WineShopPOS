export default function ErrorState({ message = "Unable to load this information. Please retry." }) {
  return <div className="state-card error-state"><strong>Something needs attention</strong><p>{message}</p></div>;
}
