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
  peekTerminalSequence,
} from "../lib/terminalIdentity";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function Shifts() {
  const { profile } = useAuth();
  const manager = ["ADMIN", "MANAGER"].includes(profile?.role);

  const [shifts, setShifts] = useState([]);
  const [opening, setOpening] = useState(0);
  const [actual, setActual] = useState("");
  const [corrections, setCorrections] = useState({});
  const [message, setMessage] = useState("");
  const [backendReachable, setBackendReachable] = useState(false);
  const [offlineCounts, setOfflineCounts] = useState({
    total: 0,
    pending: 0,
    conflict: 0,
  });

  const [dayDate, setDayDate] = useState(() => indiaBusinessDate(-1));
  const [dayView, setDayView] = useState(null);
  const [dayReason, setDayReason] = useState("");
  const [dayBusy, setDayBusy] = useState(false);

  const today = indiaBusinessDate(0);

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

    // Server refreshes India-business-date rollover before we read the shift list.
    await supabase.rpc("current_shift_state_v2");

    const { data, error } = await supabase
      .from("cashier_shifts")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(100);

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
        ? "Today's shift opened. Older CLOSE_REQUIRED shifts remain visible for reconciliation."
        : "Shift opened.",
    );
    await load();
  }

  async function requestClose(shift = currentShift, actualValue = actual) {
    if (!shift) return;

    const connectivity = await probeBackendConnectivity().catch(() => ({
      reachable: false,
    }));
    setBackendReachable(Boolean(connectivity.reachable));

    if (!connectivity.reachable) {
      setMessage("WineShopPOS backend is not reachable. Shift close was not requested.");
      return;
    }

    if (offlineCounts.pending || offlineCounts.conflict) {
      setMessage(
        `Sync/resolve offline sales before closing shift. Pending ${offlineCounts.pending}, conflicts ${offlineCounts.conflict}.`,
      );
      return;
    }

    const cash = Number(actualValue);
    if (actualValue === "" || !Number.isFinite(cash) || cash < 0) {
      setMessage(
        "Count the physical cash in the drawer and enter Actual Cash before requesting close.",
      );
      return;
    }

    const { error } = await supabase.rpc("request_shift_close_v3", {
      p_shift_id: shift.id,
      p_terminal_id: getTerminalId(),
      p_client_sequence: nextTerminalSequence(),
      p_actual_cash: cash,
      p_notes: "Actual cash physically counted before close request.",
    });

    setMessage(error ? error.message : "Close request sent to manager.");

    if (!error) {
      setActual("");
      await load();
    }
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
    const difference = Number(shift.cash_difference || 0);

    if (
      Math.abs(difference) > 0.009 &&
      !window.confirm(
        `Cash variance is ${money.format(difference)}. Approve and close this shift with this variance?`,
      )
    ) {
      return;
    }

    const { error } = await supabase.rpc("approve_shift_close", {
      p_shift_id: shift.id,
      p_notes: "Approved from Shift screen",
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

  async function runDayAction(rpc, success, requireReason = false) {
    if (!manager || dayBusy) return;

    if (requireReason && !dayReason.trim()) {
      setMessage("Enter an explicit amendment reason first.");
      return;
    }

    const label =
      rpc === "finalize_financial_day_v1"
        ? "FINALIZE"
        : rpc === "create_financial_day_amendment_v1"
          ? "AMEND FINAL"
          : rpc === "reconcile_financial_day_v1"
            ? "RECONCILE"
            : "BEGIN CLOSE";

    if (!window.confirm(`${label} financial day ${dayDate}?`)) return;

    setDayBusy(true);

    let params = { p_business_date: dayDate };

    if (
      rpc === "reconcile_financial_day_v1" ||
      rpc === "finalize_financial_day_v1"
    ) {
      params.p_exception_reason = dayReason.trim() || null;
    }

    if (rpc === "create_financial_day_amendment_v1") {
      params = {
        p_business_date: dayDate,
        p_reason: dayReason.trim(),
      };
    }

    const { error } = await supabase.rpc(rpc, params);
    setDayBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(success);
    await loadDay();
  }

  async function closeSelectedTerminalDay() {
    if (!manager) return;

    if (!window.confirm(`Close this terminal watermark for ${dayDate}?`)) return;

    setDayBusy(true);
    const { error } = await supabase.rpc("close_terminal_day_v1", {
      p_terminal_id: getTerminalId(),
      p_business_date: dayDate,
      p_client_sequence: peekTerminalSequence(),
    });
    setDayBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`This terminal is marked closed for ${dayDate}.`);
    await loadDay();
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
          <p>
            Terminal-aware shifts, physical cash close and financial-day
            finalization.
          </p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      {!backendReachable ? (
        <div className="purchase-message error">
          WineShopPOS backend is currently unreachable. No shift/day-close write
          will be attempted.
        </div>
      ) : null}

      {historicalRequired.length ? (
        <div className="purchase-message error">
          {historicalRequired.length} older shift(s) remain CLOSE_REQUIRED /
          CLOSE_REQUESTED. They do not silently disappear and do not prevent a
          fresh India-business-date shift.
        </div>
      ) : null}

      {offlineCounts.pending > 0 || offlineCounts.conflict > 0 ? (
        <div className="purchase-message error">
          Offline queue must be cleared before shift close. Pending{" "}
          {offlineCounts.pending} · Conflicts {offlineCounts.conflict}
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
              <p className="muted-text">
                Older unresolved shifts remain separately visible for
                reconciliation; they are not reused as today's physical cash
                drawer.
              </p>
            </>
          ) : (
            <>
              <p>
                Status: <strong>{currentShift.status}</strong>
              </p>
              <p>
                Business date: <strong>{currentShift.business_date}</strong>
              </p>
              <p>
                Opened: {new Date(currentShift.opened_at).toLocaleString("en-IN")}
              </p>
              <p>Opening Cash: {money.format(currentShift.opening_cash)}</p>

              {["OPEN", "CLOSE_REQUIRED"].includes(currentShift.status) ? (
                <>
                  <label>
                    Actual cash physically counted in drawer
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={actual}
                      placeholder="Required before close"
                      onChange={(event) => setActual(event.target.value)}
                    />
                  </label>
                  <p className="muted-text">
                    Actual Cash is the physical count. Expected Cash is
                    calculated by the server.
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
                  Close requested. Correct Actual Cash in Shift History before
                  approval if required.
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="panel">
          <h3>Close Rule</h3>
          <p>Expected Cash = opening cash + cash sales - cash refunds.</p>
          <p>Manager/Admin approves final shift close and any variance.</p>
          <p>
            Offline sales must be synchronized or explicitly reconciled before
            close.
          </p>
          <p>
            Terminal: <code>{getTerminalId().slice(0, 8)}</code> · sequence{" "}
            <strong>{peekTerminalSequence()}</strong>
          </p>
        </section>
      </div>

      {manager ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <h3>Financial Day Finalization</h3>
          <p className="muted-text">
            LIVE can change. FINAL is an immutable version; later corrections
            require an explicit amendment version.
          </p>

          <div className="button-row wrap">
            <label>
              Business Date
              <input
                type="date"
                value={dayDate}
                max={today}
                onChange={(event) => setDayDate(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="secondary-button"
              disabled={dayBusy}
              onClick={loadDay}
            >
              Refresh
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={dayBusy}
              onClick={closeSelectedTerminalDay}
            >
              Close This Terminal Day
            </button>
          </div>

          <p>
            State: <strong>{dayStatus}</strong>
            {dayView?.mode ? (
              <>
                {" "}
                · View: <strong>{dayView.mode}</strong>
              </>
            ) : null}
            {dayView?.version ? (
              <>
                {" "}
                · Version: <strong>{dayView.version}</strong>
              </>
            ) : null}
          </p>

          {snapshot ? (
            <div className="settings-grid">
              <div>
                <strong>Financial snapshot</strong>
                <p>Net Revenue: {money.format(Number(metrics.net_revenue || 0))}</p>
                <p>COGS: {money.format(Number(metrics.cogs || 0))}</p>
                <p>
                  Gross Profit: {money.format(Number(metrics.gross_profit || 0))}
                </p>
                <p>Expenses: {money.format(Number(metrics.expenses || 0))}</p>
                <p>
                  Operating Profit:{" "}
                  {money.format(Number(metrics.operating_profit || 0))}
                </p>
                <p>
                  Payment Gap: {money.format(Number(metrics.payment_gap || 0))}
                </p>
              </div>

              <div>
                <strong>Completeness</strong>
                <p>
                  Hard blockers: {Number(completeness.hard_blocker_count || 0)}
                </p>
                <p>
                  Exception gaps: {Number(completeness.exception_gap_count || 0)}
                </p>
                <p>
                  Unresolved checkout:{" "}
                  {Number(completeness.unresolved_checkout_count || 0)}
                </p>
                <p>
                  Pending returns:{" "}
                  {Number(completeness.pending_return_count || 0)}
                </p>
                <p>
                  Active shifts: {Number(completeness.active_shift_count || 0)}
                </p>
                <p>
                  Open terminal watermarks:{" "}
                  {Number(completeness.open_terminal_count || 0)}
                </p>
                <p>
                  Inventory exceptions:{" "}
                  {Number(completeness.open_inventory_exception_count || 0)}
                </p>
              </div>
            </div>
          ) : null}

          <label>
            Exception / Amendment Reason
            <textarea
              value={dayReason}
              onChange={(event) => setDayReason(event.target.value)}
              placeholder="Required for explicit exceptions or FINAL amendment"
            />
          </label>

          <div className="button-row wrap">
            <button
              type="button"
              className="secondary-button"
              disabled={dayBusy || dayStatus !== "OPEN"}
              onClick={() =>
                runDayAction(
                  "begin_financial_day_close_v1",
                  `Financial day ${dayDate} moved to CLOSING.`,
                )
              }
            >
              Begin Close
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={dayBusy || dayStatus !== "CLOSING"}
              onClick={() =>
                runDayAction(
                  "reconcile_financial_day_v1",
                  `Financial day ${dayDate} is RECONCILED.`,
                )
              }
            >
              Reconcile
            </button>

            <button
              type="button"
              className="primary-button"
              disabled={
                dayBusy || dayStatus !== "RECONCILED" || dayDate >= today
              }
              onClick={() =>
                runDayAction(
                  "finalize_financial_day_v1",
                  `Financial day ${dayDate} is FINAL.`,
                )
              }
            >
              Finalize Day
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={dayBusy || dayStatus !== "FINAL"}
              onClick={() =>
                runDayAction(
                  "create_financial_day_amendment_v1",
                  `A new FINAL amendment version was created for ${dayDate}.`,
                  true,
                )
              }
            >
              Create FINAL Amendment
            </button>
          </div>
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
                const canRevise =
                  shift.status === "CLOSE_REQUESTED" &&
                  (manager || shift.cashier_id === profile?.user_id);

                return (
                  <tr key={shift.id}>
                    <td>{shift.business_date || "-"}</td>
                    <td>
                      {new Date(shift.opened_at).toLocaleString("en-IN")}
                    </td>
                    <td>
                      {shift.cashier_id === profile?.user_id
                        ? "Me"
                        : shift.cashier_id.slice(0, 8)}
                    </td>
                    <td>{shift.status}</td>
                    <td>{money.format(shift.cash_sales)}</td>
                    <td>{money.format(shift.upi_sales)}</td>
                    <td>{money.format(shift.card_sales)}</td>
                    <td>{money.format(shift.expected_cash)}</td>
                    <td>
                      {shift.actual_cash == null
                        ? "-"
                        : money.format(shift.actual_cash)}
                    </td>
                    <td
                      className={
                        Number(shift.cash_difference) < 0 ? "negative" : ""
                      }
                    >
                      {shift.cash_difference == null
                        ? "-"
                        : money.format(shift.cash_difference)}
                    </td>
                    <td>
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
                            Update Actual
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

                      {shift.cashier_id === profile?.user_id &&
                      shift.status === "CLOSE_REQUIRED" ? (
                        <div className="muted-text">
                          Historical shift remains explicitly unresolved. Do not
                          reuse it as today's shift.
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
