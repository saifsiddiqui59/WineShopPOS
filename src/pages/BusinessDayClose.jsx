import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { offlineQueueCounts } from "../lib/offlineQueue";
import { probeBackendConnectivity } from "../lib/connectivity";
import { indiaBusinessDate } from "../lib/terminalIdentity";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function BusinessDayClose() {
  const [dayDate, setDayDate] = useState(() => indiaBusinessDate(-1));
  const [view, setView] = useState(null);
  const [offlineCounts, setOfflineCounts] = useState({
    total: 0,
    pending: 0,
    conflict: 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const latestCompletedDay = indiaBusinessDate(-1);
  const snapshot = view?.snapshot || null;
  const metrics = snapshot?.metrics || {};
  const completeness = snapshot?.completeness || {};
  const status = view?.status || "OPEN";

  function issuesFor(dayView, queue = offlineCounts) {
    const c = dayView?.snapshot?.completeness || {};
    const m = dayView?.snapshot?.metrics || {};
    const issues = [];

    const add = (count, label) => {
      const value = Number(count || 0);
      if (value > 0) issues.push(label);
    };

    add(c.active_shift_count, "A shift still needs attention");
    add(c.unresolved_checkout_count, "A payment still needs resolution");
    add(c.pending_return_count, "A return is waiting for approval");
    add(c.open_terminal_count, "A terminal session is still open");
    add(c.unattributed_sale_count, "A sale still needs review");
    add(c.open_inventory_exception_count, "A stock issue needs review");
    add(c.late_after_terminal_close_count, "A late sale needs review");

    if (Number(queue.pending || 0) > 0) issues.push("An offline sale is waiting to sync");
    if (Number(queue.conflict || 0) > 0) issues.push("An offline sale conflict needs review");

    const paymentGap = Math.abs(Number(m.payment_gap || 0));
    if (paymentGap > 0.01) {
      issues.push(`Payments differ from net sales by ${money.format(paymentGap)}`);
    }

    return issues;
  }

  async function loadDay() {
    setBusy(true);
    setMessage("");

    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));

    if (!connectivity.reachable) {
      setBusy(false);
      setMessage("WineShopPOS backend is not reachable.");
      return;
    }

    const counts = await offlineQueueCounts().catch(() => ({
      total: 0,
      pending: 0,
      conflict: 0,
    }));
    setOfflineCounts(counts);

    const { data, error } = await supabase.rpc("financial_day_snapshot_read_v1", {
      p_business_date: dayDate,
    });

    setBusy(false);

    if (error) {
      setMessage(error.message || "Unable to check this business day.");
      return;
    }

    setView(data || null);
  }

  useEffect(() => {
    void loadDay();
  }, [dayDate]);

  const issues = issuesFor(view);
  const legacyCount = Number(
    completeness.legacy_terminal_acknowledged_count || 0,
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Automatic Daily Closing</h2>
          <p>No daily button is required. WineShopPOS closes completed days automatically.</p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      <section className="panel">
        <div className="settings-inline-row">
          <label>
            View completed day
            <input
              type="date"
              value={dayDate}
              max={latestCompletedDay}
              onChange={(event) => setDayDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={loadDay}
          >
            Refresh
          </button>
        </div>

        <p style={{ marginTop: 14 }}>
          Status:{" "}
          <strong>
            {status === "FINAL"
              ? "Closed automatically ✓"
              : issues.length
                ? "Waiting for an issue to clear"
                : "Automatic close pending"}
          </strong>
        </p>

        {status === "FINAL" ? (
          <div className="purchase-message">
            Done. This business day is locked automatically. No owner action is required.
          </div>
        ) : issues.length ? (
          <div className="purchase-message error">
            <strong>Needs attention:</strong>
            <ul style={{ marginBottom: 6 }}>
              {issues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
            WineShopPOS retries automatically after the issue is cleared.
          </div>
        ) : snapshot ? (
          <div className="purchase-message">
            Everything is clear. WineShopPOS will close this day automatically.
          </div>
        ) : null}

        {legacyCount > 0 ? (
          <div className="purchase-message" style={{ marginTop: 12 }}>
            {legacyCount} older sale(s) from before terminal tracking are preserved and already reviewed.
          </div>
        ) : null}

        {snapshot ? (
          <div className="settings-grid" style={{ marginTop: 14 }}>
            <div>
              <strong>Day Summary</strong>
              <p>Net Sales: {money.format(Number(metrics.net_revenue || 0))}</p>
              <p>Returns: {money.format(Number(metrics.returns || 0))}</p>
              <p>Expenses: {money.format(Number(metrics.expenses || 0))}</p>
              <p>Operating Profit: {money.format(Number(metrics.operating_profit || 0))}</p>
            </div>
            <div>
              <strong>Automatic Checks</strong>
              <p>Open shifts: {Number(completeness.active_shift_count || 0)}</p>
              <p>Unresolved payments: {Number(completeness.unresolved_checkout_count || 0)}</p>
              <p>Pending returns: {Number(completeness.pending_return_count || 0)}</p>
              <p>Offline sales: {offlineCounts.pending + offlineCounts.conflict}</p>
              <p>Stock issues: {Number(completeness.open_inventory_exception_count || 0)}</p>
            </div>
          </div>
        ) : null}

        {Number(completeness.active_shift_count || 0) > 0 ? (
          <div style={{ marginTop: 14 }}>
            <Link className="secondary-button" to="/operations/shifts">
              View Shifts
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
