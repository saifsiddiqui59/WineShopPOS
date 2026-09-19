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

  const today = indiaBusinessDate(0);
  const latestClosableDay = indiaBusinessDate(-1);

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
      if (value > 0) issues.push({ count: value, label });
    };

    add(c.active_shift_count, "shift(s) still need closing");
    add(c.unresolved_checkout_count, "payment(s) still need resolution");
    add(c.pending_return_count, "return(s) are waiting for approval");
    add(c.open_terminal_count, "terminal session(s) are still open");
    add(c.unattributed_sale_count, "sale(s) still need review");
    add(c.open_inventory_exception_count, "stock issue(s) need review");
    add(c.late_after_terminal_close_count, "late sale(s) need review");

    if (Number(queue.pending || 0) > 0) {
      issues.push({ count: Number(queue.pending), label: "offline sale(s) are waiting to sync" });
    }
    if (Number(queue.conflict || 0) > 0) {
      issues.push({ count: Number(queue.conflict), label: "offline sale conflict(s) need review" });
    }

    const paymentGap = Math.abs(Number(m.payment_gap || 0));
    if (paymentGap > 0.01) {
      issues.push({
        count: null,
        label: `payments differ from net sales by ${money.format(paymentGap)}`,
      });
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
      return null;
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
      return null;
    }

    setView(data || null);
    return { view: data || null, counts };
  }

  useEffect(() => {
    void loadDay();
  }, [dayDate]);

  async function closeBusinessDay() {
    if (busy) return;

    if (dayDate >= today) {
      setMessage(
        "Today's business day is still in progress. Close cashier shifts today; lock the whole day after the India date ends.",
      );
      return;
    }

    if (
      !window.confirm(
        `Close business day ${dayDate}? WineShopPOS will check everything first and only lock the day when it is clean.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const connectivity = await probeBackendConnectivity().catch(() => ({
        reachable: false,
      }));
      if (!connectivity.reachable) {
        throw new Error("WineShopPOS backend is not reachable.");
      }

      let counts = await offlineQueueCounts().catch(() => ({
        total: 0,
        pending: 0,
        conflict: 0,
      }));
      setOfflineCounts(counts);

      const read = async () => {
        const { data, error } = await supabase.rpc("financial_day_snapshot_read_v1", {
          p_business_date: dayDate,
        });
        if (error) throw error;
        setView(data || null);
        return data || null;
      };

      let current = await read();
      let dayStatus = current?.status || "OPEN";

      if (dayStatus === "FINAL") {
        setMessage(`Business day ${dayDate} is already closed.`);
        return;
      }

      let issues = issuesFor(current, counts);
      if (issues.length) {
        setMessage(
          `Cannot close yet: ${issues.map((item) => item.label).join("; ")}.`,
        );
        return;
      }

      if (dayStatus === "OPEN") {
        const { error } = await supabase.rpc("begin_financial_day_close_v1", {
          p_business_date: dayDate,
        });
        if (error) throw error;
      }

      current = await read();
      dayStatus = current?.status || dayStatus;
      issues = issuesFor(current, counts);
      if (issues.length) {
        setMessage(`Close paused: ${issues.map((item) => item.label).join("; ")}.`);
        return;
      }

      if (dayStatus === "CLOSING") {
        const { error } = await supabase.rpc("reconcile_financial_day_v1", {
          p_business_date: dayDate,
          p_exception_reason: null,
        });
        if (error) throw error;
      }

      current = await read();
      dayStatus = current?.status || dayStatus;
      issues = issuesFor(current, counts);
      if (issues.length) {
        setMessage(`Close paused: ${issues.map((item) => item.label).join("; ")}.`);
        return;
      }

      if (dayStatus === "RECONCILED") {
        const { error } = await supabase.rpc("finalize_financial_day_v1", {
          p_business_date: dayDate,
          p_exception_reason: null,
        });
        if (error) throw error;
      }

      current = await read();

      if (current?.status !== "FINAL") {
        throw new Error("Business day did not reach the closed state.");
      }

      setMessage(`Business day ${dayDate} closed successfully.`);
    } catch (error) {
      const raw = String(error?.message || error || "");
      const friendly =
        raw.includes("FINANCIAL_DAY_CHANGED_RECONCILE_AGAIN")
          ? "Financial data changed during the check. Press Close Business Day again."
          : raw.includes("FINANCIAL_DAY_HARD_BLOCKERS")
            ? "Some shifts or transactions still need attention."
            : raw.includes("FINANCIAL_DAY_EXCEPTION_REASON_REQUIRED")
              ? "A reconciliation issue still needs review before closing."
              : raw || "Unable to close the business day.";
      setMessage(friendly);
    } finally {
      setBusy(false);
    }
  }

  const issues = issuesFor(view);
  const legacyCount = Number(completeness.legacy_terminal_acknowledged_count || 0);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Close Business Day</h2>
          <p>One check, one button. Technical accounting steps stay in the background.</p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      <section className="panel">
        <div className="settings-inline-row">
          <label>
            Day to close
            <input
              type="date"
              value={dayDate}
              max={latestClosableDay}
              onChange={(event) => setDayDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={loadDay}
          >
            Refresh Check
          </button>
        </div>

        <p style={{ marginTop: 14 }}>
          Status:{" "}
          <strong>
            {status === "FINAL"
              ? "Closed ✓"
              : status === "OPEN"
                ? "Open"
                : "Close in progress"}
          </strong>
        </p>

        {legacyCount > 0 ? (
          <div className="purchase-message">
            {legacyCount} older sale(s) from before terminal tracking were preserved and
            reviewed. Their original records were not changed, and they no longer block day close.
          </div>
        ) : null}

        {issues.length ? (
          <div className="purchase-message error">
            <strong>Before closing:</strong>
            <ul style={{ marginBottom: 0 }}>
              {issues.map((item, index) => (
                <li key={`${item.label}-${index}`}>{item.label}</li>
              ))}
            </ul>
          </div>
        ) : snapshot ? (
          <div className="purchase-message">
            Everything required for this day is clear.
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
              <strong>Checks</strong>
              <p>Open shifts: {Number(completeness.active_shift_count || 0)}</p>
              <p>Unresolved payments: {Number(completeness.unresolved_checkout_count || 0)}</p>
              <p>Pending returns: {Number(completeness.pending_return_count || 0)}</p>
              <p>Offline sales: {offlineCounts.pending + offlineCounts.conflict}</p>
              <p>Stock issues: {Number(completeness.open_inventory_exception_count || 0)}</p>
            </div>
          </div>
        ) : null}

        <div className="button-row" style={{ marginTop: 14 }}>
          <button
            type="button"
            className="primary-button"
            disabled={busy || status === "FINAL" || dayDate > latestClosableDay}
            onClick={closeBusinessDay}
          >
            {busy
              ? "Checking..."
              : status === "FINAL"
                ? "Business Day Closed ✓"
                : "Close Business Day"}
          </button>
          {Number(completeness.active_shift_count || 0) > 0 ? (
            <Link className="secondary-button" to="/operations/shifts">
              Go to Shifts
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
