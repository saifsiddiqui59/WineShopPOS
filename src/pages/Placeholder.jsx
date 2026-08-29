export default function Placeholder({ title, description }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel coming-soon">
        <h3>{title}</h3>
        <p>
          This module is reserved for the next development chapters.
        </p>
      </div>
    </div>
  );
}
