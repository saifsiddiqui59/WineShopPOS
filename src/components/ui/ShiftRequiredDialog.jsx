export default function ShiftRequiredDialog({
  loading,
  online,
  openingCash,
  onOpeningCash,
  onStart,
  busy,
  message,
}) {
  return (
    <div className="shift-required-backdrop" role="presentation">
      <section
        className="shift-required-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-required-title"
      >
        <div className="shift-required-icon">₹</div>
        <h2 id="shift-required-title">Start your shift before making any bill</h2>
        <p>
          Every POS sale must belong to an open cashier shift so cash, UPI, card,
          refunds and day-close totals reconcile correctly.
        </p>

        {loading ? (
          <div className="purchase-message">Checking your current shift...</div>
        ) : (
          <>
            <label>
              Opening Cash
              <input
                type="number"
                min="0"
                step="0.01"
                value={openingCash}
                onChange={(event) => onOpeningCash(event.target.value)}
              />
            </label>

            {!online ? (
              <div className="purchase-message error">
                Connect to the internet to start or verify a shift.
              </div>
            ) : null}

            {message ? <div className="purchase-message">{message}</div> : null}

            <button
              type="button"
              className="primary-button"
              disabled={busy || !online}
              onClick={onStart}
            >
              {busy ? "Starting Shift..." : "Start Shift"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
