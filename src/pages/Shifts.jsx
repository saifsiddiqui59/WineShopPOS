import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { offlineQueueCounts } from "../lib/offlineQueue";
import { probeBackendConnectivity } from "../lib/connectivity";
import {
  getTerminalId,
  indiaBusinessDate,
  nextTerminalSequence,
} from "../lib/terminalIdentity";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const indiaDateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function formatIndiaDateTime(value) {
  if (!value) return "-";
  return indiaDateTime.format(new Date(value));
}

function shiftStatusLabel(shift) {
  if (shift?.status === "CLOSE_REQUIRED") {
    return "ENDED AT MIDNIGHT · CASH NOT COUNTED";
  }
  return shift?.status || "-";
}

export default function Shifts() {
  const { profile } = useAuth();
  const manager = ["ADMIN", "MANAGER"].includes(profile?.role);
  const ownerAdmin = profile?.role === "ADMIN";

  const [shifts, setShifts] = useState([]);
  const [opening, setOpening] = useState(0);
  const [actual, setActual] = useState("");
  const [historicalActuals, setHistoricalActuals] = useState({});
  const [corrections, setCorrections] = useState({});
  const [message, setMessage] = useState("");
  const [backendReachable, setBackendReachable] = useState(false);
  const [offlineCounts, setOfflineCounts] = useState({
    total: 0,
    pending: 0,
    conflict: 0,
  });

  const [closingCashRequired, setClosingCashRequired] = useState(true);
  const [policyBusy, setPolicyBusy] = useState(false);

  const [dayDate, setDayDate] = useState(() => indiaBusinessDate(-1));
  const [dayView, setDayView] = useState(null);
  const [dayBusy, setDayBusy] = useState(false);

  const today = indiaBusinessDate(0);
  const latestClosableDay = indiaBusinessDate(-1);

  const myRows = useMemo(
    () => shifts.filter((shift) => shift.cashier_id === profile?.user_id),
    [shifts, profile?.user_id],
  );

  const currentShift = myRows.find(
    (shift) =>
      shift.business_date === today &&
      ["OPEN", "CLOSE_REQUIRED", "CLOSE_REQUESTED"].includes(shift.status),
  );

  const historicalRequired = myRows.filter(
    (shift) =>
      shift.business_date < today &&
      ["CLOSE_REQUIRED", "CLOSE_REQUESTED"].includes(shift.status),
  );

  async function loadPolicy() {
    const { data, error } = await supabase.rpc("shift_close_policy_v1");
    if (error) {
      setMessage(error.message);
      return null;
    }
    const required = data?.shift_closing_cash_required !== false;
    setClosingCashRequired(required);
    return required;
  }

  async function load() {
    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));
    setBackendReachable(Boolean(connectivity.reachable));

    const counts = await offlineQueueCounts().catch(() => ({
      total: 0,
      pending: 0,
      conflict: 0,
    }));
    setOfflineCounts(counts);

    if (!connectivity.reachable) {
      setMessage("WineShopPOS backend is not reachable. Shift changes are disabled.");
      return;
    }

    await supabase.rpc("current_shift_state_v2");

    const [{ data, error }] = await Promise.all([
      supabase
        .from("cashier_shifts")
        .select("*")
        .order("opened_at", { ascending: false })
        .limit(100),
      loadPolicy(),
    ]);

    if (error) setMessage(error.message);
    else setShifts(data || []);
  }

  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  async function updateClosingCashPolicy(required) {
    if (!ownerAdmin || policyBusy) return;

    setPolicyBusy(true);
    const { data, error } = await supabase.rpc("set_shift_close_policy_v1", {
      p_shift_closing_cash_required: required,
    });
    setPolicyBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setClosingCashRequired(data?.shift_closing_cash_required !== false);
    setMessage(
      required
        ? "Closing cash count is now mandatory for shift close."
        : "Closing cash count is now optional for shift close.",
    );
  }

  async function open() {
    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));
    setBackendReachable(Boolean(connectivity.reachable));

    if (!connectivity.reachable) {
      setMessage("WineShopPOS backend is not reachable. Connect before starting a shift.");
      return;
    }

    const amount = Number(opening || 0);
    if (!Number.isFinite(amount) || amount < 0) {
      setMessage("Opening Cash must be zero or a positive amount.");
      return;
    }

    const { data, error } = await supabase.rpc("open_shift_v2", {
      p_opening_cash: amount,
      p_notes: "Shift opened from Shift & Day Close.",
      p_terminal_id: getTerminalId(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const shiftId = data?.shift_id || data?.id || data;
    if (shiftId) {
      sessionStorage.setItem(
        `wineshop_open_shift_v1_${profile?.shop_id || "shop"}_${profile?.user_id || "user"}`,
        String(shiftId),
      );
    }

    setMessage(
      historicalRequired.length
        ? "Today's shift opened. Older unresolved shifts remain visible separately."
        : "Shift opened.",
    );
    await load();
  }

  function parseActualCash(raw) {
    if (raw === "" || raw === null || raw === undefined) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : Number.NaN;
  }

  async function requestClose(shift = currentShift, actualValue = actual) {
    if (!shift) return false;

    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));
    setBackendReachable(Boolean(connectivity.reachable));

    if (!connectivity.reachable) {
      setMessage("WineShopPOS backend is not reachable. Shift close was not requested.");
      return false;
    }

    if (offlineCounts.pending || offlineCounts.conflict) {
      setMessage(
        `Sync/resolve offline sales before closing shift. Pending ${offlineCounts.pending}, conflicts ${offlineCounts.conflict}.`,
      );
      return false;
    }

    const cash = parseActualCash(actualValue);

    if (closingCashRequired && cash === null) {
      setMessage("Closing cash is mandatory. Enter the physical cash count before requesting close.");
      return false;
    }

    if (Number.isNaN(cash) || (cash !== null && cash < 0)) {
      setMessage("Closing cash must be blank, zero, or a positive amount.");
      return false;
    }

    const { data, error } = await supabase.rpc("request_shift_close_v4", {
      p_shift_id: shift.id,
      p_terminal_id: getTerminalId(),
      p_client_sequence: nextTerminalSequence(),
      p_actual_cash: cash,
      p_notes:
        shift.business_date < today
          ? "Historical shift reconciliation requested from Shift & Day Close."
          : cash === null
            ? "Shift close requested with optional closing cash policy."
            : "Actual cash physically counted before close request.",
    });

    if (error) {
      const friendly =
        String(error.message || "").includes("CLOSING_CASH_REQUIRED")
          ? "Closing cash is mandatory for this shop. Enter the physical cash count first."
          : error.message;
      setMessage(friendly);
      return false;
    }

    setMessage(
      shift.business_date < today
        ? `Historical shift ${shift.business_date} moved to CLOSE_REQUESTED.`
        : data?.actual_cash == null
          ? "Close request sent. Closing cash was optional and left blank."
          : "Close request sent to manager.",
    );

    setActual("");
    await load();
    return true;
  }

  async function reviseActual(shift) {
    const raw = corrections[shift.id] ?? String(shift.actual_cash ?? "");

    if (raw === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
      setMessage("Enter a valid physically counted Actual Cash amount.");
      return;
    }

    const { error } = await supabase.rpc("revise_shift_actual_cash", {
      p_shift_id: shift.id,
      p_actual_cash: Number(raw),
      p_notes: "Actual cash corrected from Shift screen before approval.",
    });

    setMessage(
      error ? error.message : "Actual cash corrected and variance recalculated.",
    );

    if (!error) {
      setCorrections((current) => {
        const next = { ...current };
        delete next[shift.id];
        return next;
      });
      await load();
    }
  }

  async function approve(shift) {
    const hasDifference = shift.cash_difference !== null && shift.cash_difference !== undefined;
    const difference = Number(shift.cash_difference || 0);

    if (
      hasDifference &&
      Math.abs(difference) > 0.009 &&
      !window.confirm(
        `Cash variance is ${money.format(difference)}. Approve and close this shift with this variance?`,
      )
    ) {
      return;
    }

    const { error } = await supabase.rpc("approve_shift_close", {
      p_shift_id: shift.id,
      p_notes:
        shift.actual_cash == null
          ? "Approved from Shift screen; closing cash was optional."
          : "Approved from Shift screen",
    });

    setMessage(error ? error.message : "Shift closed.");
    if (!error) await load();
  }

  async function loadDay() {
    if (!manager) return;

    setDayBusy(true);
    const { data, error } = await supabase.rpc(
      "financial_day_snapshot_read_v1",
      { p_business_date: dayDate },
    );
    setDayBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setDayView(data || null);
  }

  function dayIssues(view) {
    const completeness = view?.snapshot?.completeness || {};
    const metrics = view?.snapshot?.metrics || {};
    const issues = [];

    const add = (count, label) => {
      const value = Number(count || 0);
      if (value > 0) issues.push(`${value} ${label}`);
    };

    add(completeness.unresolved_checkout_count, "checkout(s) still need resolution");
    add(completeness.pending_return_count, "return(s) are waiting for approval");
    add(completeness.active_shift_count, "shift(s) are still open or waiting for close");
    add(completeness.open_terminal_count, "terminal day(s) are still open");
    add(completeness.unattributed_sale_count, "sale(s) need terminal attribution review");
    add(completeness.open_inventory_exception_count, "stock reconciliation issue(s) remain");
    add(completeness.late_after_terminal_close_count, "late sale(s) arrived after terminal close");

    const paymentGap = Math.abs(Number(metrics.payment_gap || 0));
    if (paymentGap > 0.01) {
      issues.push(`payments differ from net revenue by ${money.format(paymentGap)}`);
    }

    return issues;
  }

  async function readDayView() {
    const { data, error } = await supabase.rpc("financial_day_snapshot_read_v1", {
      p_business_date: dayDate,
    });
    if (error) throw error;
    setDayView(data || null);
    return data || null;
  }

  async function closeBusinessDay() {
    if (!manager || dayBusy) return;

    if (dayDate >= today) {
      setMessage(
        "Today's business day is still in progress. Close today's cashier shifts now; the whole business day can be locked after the India date ends.",
      );
      return;
    }

    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));
    setBackendReachable(Boolean(connectivity.reachable));

    if (!connectivity.reachable) {
      setMessage("WineShopPOS backend is not reachable. Business day close was not attempted.");
      return;
    }

    if (offlineCounts.pending || offlineCounts.conflict) {
      setMessage(
        `Cannot close business day: offline sales still need attention. Pending ${offlineCounts.pending}, conflicts ${offlineCounts.conflict}.`,
      );
      return;
    }

    if (
      !window.confirm(
        `Close business day ${dayDate}? WineShopPOS will check everything first and only lock the day if all checks pass.`,
      )
    ) {
      return;
    }

    setDayBusy(true);

    try {
      let view = await readDayView();
      let status = view?.status || "OPEN";

      if (status === "FINAL") {
        setMessage(`Business day ${dayDate} is already closed and locked.`);
        return;
      }

      let issues = dayIssues(view);
      if (issues.length) {
        setMessage(`Cannot close ${dayDate}: ${issues.join("; ")}.`);
        return;
      }

      if (status === "OPEN") {
        const { error } = await supabase.rpc("begin_financial_day_close_v1", {
          p_business_date: dayDate,
        });
        if (error) throw error;
      }

      view = await readDayView();
      issues = dayIssues(view);
      if (issues.length) {
        setMessage(`Close paused for ${dayDate}: ${issues.join("; ")}.`);
        return;
      }
      status = view?.status || status;

      if (status === "CLOSING") {
        const { error } = await supabase.rpc("reconcile_financial_day_v1", {
          p_business_date: dayDate,
          p_exception_reason: null,
        });
        if (error) throw error;
      }

      view = await readDayView();
      issues = dayIssues(view);
      if (issues.length) {
        setMessage(`Close paused for ${dayDate}: ${issues.join("; ")}.`);
        return;
      }
      status = view?.status || status;

      if (status === "RECONCILED") {
        const { error } = await supabase.rpc("finalize_financial_day_v1", {
          p_business_date: dayDate,
          p_exception_reason: null,
        });
        if (error) throw error;
      }

      view = await readDayView();

      if (view?.status !== "FINAL") {
        throw new Error("Business day did not reach the final closed state.");
      }

      setMessage(
        `Business day ${dayDate} closed successfully. Its financial totals are now locked.`,
      );
    } catch (error) {
      const raw = String(error?.message || error || "").trim();
      const friendly =
        raw.includes("FINANCIAL_DAY_HARD_BLOCKERS")
          ? "Some transactions or shifts still need attention before this day can close."
          : raw.includes("FINANCIAL_DAY_EXCEPTION_REASON_REQUIRED")
            ? "WineShopPOS found a reconciliation exception. Resolve the displayed issue before closing the day."
            : raw.includes("FINANCIAL_DAY_CHANGED_RECONCILE_AGAIN")
              ? "Financial data changed during the close check. Press Close Business Day again to re-check safely."
              : raw.includes("BUSINESS_DAY_NOT_ENDED")
                ? "This India business date has not ended yet. Close it after midnight."
                : raw || "Business day close could not be completed.";
      setMessage(friendly);
      await loadDay();
    } finally {
      setDayBusy(false);
    }
  }

  useEffect(() => {
    if (manager) void loadDay();
  }, [manager, dayDate]);

  const snapshot = dayView?.snapshot || null;
  const metrics = snapshot?.metrics || {};
  const completeness = snapshot?.completeness || {};
  const dayStatus = dayView?.status || "OPEN";

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Cashier Shift & Day Close</h2>
          <p>Simple shift close with safe financial-day locking.</p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      {!backendReachable ? (
        <div className="purchase-message error">
          WineShopPOS backend is currently unreachable. No shift/day-close write will be attempted.
        </div>
      ) : null}

      {historicalRequired.length ? (
        <div className="purchase-message error">
          {historicalRequired.length} older shift(s) still need reconciliation.
        </div>
      ) : null}

      {offlineCounts.pending > 0 || offlineCounts.conflict > 0 ? (
        <div className="purchase-message error">
          Offline queue must be cleared before shift close. Pending {offlineCounts.pending} ·
          Conflicts {offlineCounts.conflict}
        </div>
      ) : null}

      <div className="settings-grid">
        <section className="panel">
          <h3>My Current-Day Shift</h3>

          {!currentShift ? (
            <>
              <label>
                Opening Cash
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={opening}
                  onChange={(event) => setOpening(event.target.value)}
                />
              </label>
              <br />
              <button
                className="primary-button"
                disabled={!backendReachable}
                onClick={open}
              >
                Start Today's Shift
              </button>
            </>
          ) : (
            <>
              <p>Status: <strong>{currentShift.status}</strong></p>
              <p>Business date: <strong>{currentShift.business_date}</strong></p>
              <p>Opened (IST): {formatIndiaDateTime(currentShift.opened_at)}</p>
              <p>Opening Cash: {money.format(currentShift.opening_cash)}</p>

              {["OPEN", "CLOSE_REQUIRED"].includes(currentShift.status) ? (
                <>
                  <label>
                    {closingCashRequired ? "Actual cash physically counted in drawer" : "Closing cash (optional)"}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={actual}
                      placeholder={closingCashRequired ? "Required before close" : "Optional"}
                      onChange={(event) => setActual(event.target.value)}
                    />
                  </label>

                  <p className="muted-text">
                    {closingCashRequired
                      ? "Owner setting: the physical cash count is mandatory before shift close."
                      : "Owner setting: closing cash is optional. Leave blank if the shop does not require a drawer count."}
                  </p>

                  <button
                    className="primary-button"
                    disabled={
                      !backendReachable ||
                      offlineCounts.pending > 0 ||
                      offlineCounts.conflict > 0
                    }
                    onClick={() => requestClose()}
                  >
                    Request Close
                  </button>
                </>
              ) : null}

              {currentShift.status === "CLOSE_REQUESTED" ? (
                <div className="purchase-message">
                  Close requested. Manager/Admin can review and approve it below.
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="panel">
          <h3>Owner Shift Setting</h3>

          <p>
            Closing cash count:{" "}
            <strong>{closingCashRequired ? "Mandatory" : "Optional"}</strong>
          </p>

          {ownerAdmin ? (
            <button
              type="button"
              className="secondary-button"
              disabled={policyBusy || !backendReachable}
              onClick={() => void updateClosingCashPolicy(!closingCashRequired)}
            >
              Closing Cash Check: {closingCashRequired ? "ON" : "OFF"}
            </button>
          ) : (
            <p className="muted-text">
              Only Owner/Admin can change this setting.
            </p>
          )}

          <p className="muted-text" style={{ marginTop: 10 }}>
            ON = physical closing cash is mandatory. OFF = cashier may close with
            cash not counted; Expected Cash is still calculated and Actual/Difference stay blank.
          </p>

          <p className="muted-text">
            Midnight rule: at 12:00 AM India time the shift is switched OFF automatically.
            If it was not manually closed, it becomes
            <strong> Ended at midnight · Cash not counted</strong>. No fake cash value is created.
          </p>
        </section>
      </div>

      {manager ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <h3>Business Day Close</h3>
          <p className="muted-text">
            One action checks shifts, payments, returns, offline sales and stock issues.
          </p>

          <div className="button-row wrap">
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
              disabled={dayBusy}
              onClick={loadDay}
            >
              Refresh Check
            </button>
          </div>

          <p>
            Status:{" "}
            <strong>
              {dayStatus === "FINAL"
                ? "Closed ✓"
                : dayStatus === "OPEN"
                  ? "Open"
                  : "Close in progress"}
            </strong>
          </p>

          {snapshot ? (
            <>
              {dayIssues(dayView).length === 0 ? (
                <div className="purchase-message">
                  All automatic checks passed for this day.
                </div>
              ) : (
                <div className="purchase-message error">
                  <strong>Needs attention before closing:</strong>
                  <ul style={{ marginBottom: 0 }}>
                    {dayIssues(dayView).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="settings-grid">
                <div>
                  <strong>Day summary</strong>
                  <p>Net Revenue: {money.format(Number(metrics.net_revenue || 0))}</p>
                  <p>Returns: {money.format(Number(metrics.returns || 0))}</p>
                  <p>Expenses: {money.format(Number(metrics.expenses || 0))}</p>
                  <p>Operating Profit: {money.format(Number(metrics.operating_profit || 0))}</p>
                </div>
                <div>
                  <strong>Automatic checks</strong>
                  <p>Open shifts: {Number(completeness.active_shift_count || 0)}</p>
                  <p>Unknown checkouts: {Number(completeness.unresolved_checkout_count || 0)}</p>
                  <p>Pending returns: {Number(completeness.pending_return_count || 0)}</p>
                  <p>Offline queue: {offlineCounts.pending + offlineCounts.conflict}</p>
                  <p>Stock issues: {Number(completeness.open_inventory_exception_count || 0)}</p>
                </div>
              </div>
            </>
          ) : null}

          <button
            type="button"
            className="primary-button"
            disabled={dayBusy || dayStatus === "FINAL" || dayDate > latestClosableDay}
            onClick={closeBusinessDay}
          >
            {dayBusy
              ? "Checking & Closing..."
              : dayStatus === "FINAL"
                ? "Business Day Closed ✓"
                : "Close Business Day"}
          </button>

          <p className="muted-text" style={{ marginTop: 8 }}>
            A closed day is locked for audit. Technical accounting states stay internal.
          </p>
        </section>
      ) : null}

      <section className="panel" style={{ marginTop: 16 }}>
        <h3>Shift History</h3>
        <div className="data-table-wrapper">
          <SortableTable className="data-table">
            <thead>
              <tr>
                <th>Business Date</th>
                <th>Opened</th>
                <th>Cashier</th>
                <th>Status</th>
                <th>Cash</th>
                <th>UPI</th>
                <th>Card</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Difference</th>
                <th data-sort="false">Action</th>
              </tr>
            </thead>

            <tbody>
              {shifts.map((shift) => {
                const canRequestHistoricalClose =
                  shift.business_date < today &&
                  shift.status === "CLOSE_REQUIRED" &&
                  (manager || shift.cashier_id === profile?.user_id);

                const canRevise =
                  shift.status === "CLOSE_REQUESTED" &&
                  (manager || shift.cashier_id === profile?.user_id);

                return (
                  <tr key={shift.id}>
                    <td>{shift.business_date || "-"}</td>
                    <td>{formatIndiaDateTime(shift.opened_at)}</td>
                    <td>
                      {shift.cashier_id === profile?.user_id
                        ? "Me"
                        : shift.cashier_id.slice(0, 8)}
                    </td>
                    <td>{shiftStatusLabel(shift)}</td>
                    <td>{money.format(shift.cash_sales)}</td>
                    <td>{money.format(shift.upi_sales)}</td>
                    <td>{money.format(shift.card_sales)}</td>
                    <td>{money.format(shift.expected_cash)}</td>
                    <td>
                      {shift.actual_cash == null
                        ? "-"
                        : money.format(shift.actual_cash)}
                    </td>
                    <td className={Number(shift.cash_difference) < 0 ? "negative" : ""}>
                      {shift.cash_difference == null
                        ? "-"
                        : money.format(shift.cash_difference)}
                    </td>
                    <td>
                      {canRequestHistoricalClose ? (
                        <div className="button-row wrap">
                          <label style={{ minWidth: 150 }}>
                            {closingCashRequired
                              ? "Historical Actual Cash"
                              : "Historical Closing Cash (optional)"}
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={historicalActuals[shift.id] ?? ""}
                              placeholder={closingCashRequired ? "Physical count" : "Optional"}
                              onChange={(event) =>
                                setHistoricalActuals((current) => ({
                                  ...current,
                                  [shift.id]: event.target.value,
                                }))
                              }
                              aria-label={`Closing cash for historical shift ${shift.business_date}`}
                              style={{ maxWidth: 140 }}
                            />
                          </label>

                          <button
                            type="button"
                            className="primary-button"
                            disabled={!backendReachable}
                            onClick={async () => {
                              const ok = await requestClose(
                                shift,
                                historicalActuals[shift.id] ?? "",
                              );
                              if (ok) {
                                setHistoricalActuals((current) => {
                                  const next = { ...current };
                                  delete next[shift.id];
                                  return next;
                                });
                              }
                            }}
                          >
                            Request Reconciliation Close
                          </button>
                        </div>
                      ) : null}

                      {canRevise ? (
                        <div className="button-row wrap">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              corrections[shift.id] ??
                              String(shift.actual_cash ?? "")
                            }
                            onChange={(event) =>
                              setCorrections((current) => ({
                                ...current,
                                [shift.id]: event.target.value,
                              }))
                            }
                            aria-label="Correct actual cash"
                            style={{ maxWidth: 120 }}
                          />
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => reviseActual(shift)}
                          >
                            {shift.actual_cash == null ? "Add Actual Cash" : "Update Actual"}
                          </button>
                        </div>
                      ) : null}

                      {manager && shift.status === "CLOSE_REQUESTED" ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => approve(shift)}
                          style={{ marginTop: canRevise ? 8 : 0 }}
                        >
                          Approve Close
                        </button>
                      ) : null}

                      {shift.status === "CLOSE_REQUIRED" &&
                      !canRequestHistoricalClose ? (
                        <div className="muted-text">
                          Only the owning cashier or Manager/Admin can request close.
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </SortableTable>
        </div>
      </section>
    </div>
  );
}
