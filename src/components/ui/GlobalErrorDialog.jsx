import { useEffect } from "react";

export default function GlobalErrorDialog({
  open,
  title = "Something went wrong",
  message = "An unexpected error occurred.",
  details = "",
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="global-error-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className="global-error-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="global-error-title"
        aria-describedby="global-error-message"
      >
        <button
          type="button"
          className="global-error-x"
          aria-label="Close error"
          onClick={onClose}
        >
          ×
        </button>

        <div className="global-error-icon" aria-hidden="true">!</div>

        <div className="global-error-copy">
          <h2 id="global-error-title">{title}</h2>
          <p id="global-error-message">{message}</p>
          {details ? (
            <details className="global-error-details">
              <summary>Technical details</summary>
              <pre>{details}</pre>
            </details>
          ) : null}
        </div>

        <div className="global-error-actions">
          <button
            type="button"
            className="primary-button"
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
