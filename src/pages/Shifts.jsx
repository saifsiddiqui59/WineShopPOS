import SortableTable from "../components/ui/SortableTable";
import { Link } from "react-router-dom";
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
  if (shift?.status === "CLOSE_REQUIRED") return "Ended at midnight · Cash not counted";
  if (shift?.status === "CLOSE_REQUESTED") return "Waiting for approval";
  if (shift?.status === "CLOSED") return "Closed";
  if (shift?.status === "OPEN") return "Open";
  return shift?.status || "-";
}

export default function Shifts() {
  const { profile } = useAuth();
  const manager = ["ADMIN", "MANAGER"].includes(profile?.role);
  const admin = profile?.role === "ADMIN";

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

  async function loadPolicy() {
    const { data, error } = await supabase.rpc("shift_close_policy_v1");
    if (error) return;
    setClosingCashRequired(data?.shift_closing_cash_required !== false);
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
    await loadPolicy();

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
      setMessage("Connect to WineShopPOS before starting a shift.");
      return;
    }

    const amount = Number(opening || 0);
    if (!Number.isFinite(amount) || amount < 0) {
      setMessage("Opening Cash must be zero or a positive amount.");
      return;
    }

    const { data, error } = await supabase.rpc("open_shift_v2", {
      p_opening_cash: amount,
      p_notes: "Shift opened from Shift screen.",
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

    setMessage("Shift started.");
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
      setMessage("Connect to WineShopPOS before closing a shift.");
      return false;
    }

    if (offlineCounts.pending || offlineCounts.conflict) {
      setMessage(
        `Sync offline sales first. Pending ${offlineCounts.pending}, conflicts ${offlineCounts.conflict}.`,
      );
      return false;
    }

    const cash = parseActualCash(actualValue);

    if (closingCashRequired && cash === null) {
      setMessage("Closing cash check is ON. Enter the physical cash count first.");
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
          ? "Historical midnight-ended shift close requested from Shift screen."
          : cash === null
            ? "Shift close requested with cash not counted; owner policy is optional."
            : "Physical closing cash counted before close request.",
    });

    if (error) {
      setMessage(
        String(error.message || "").includes("CLOSING_CASH_REQUIRED")
          ? "Closing cash check is ON. Enter the physical cash count first."
          : error.message,
      );
      return false;
    }

    setMessage(
      data?.actual_cash == null
        ? "Shift sent for approval · Cash not counted."
        : "Shift sent for approval.",
    );

    setActual("");
    await load();
    return true;
  }

  async function reviseActual(shift) {
    const raw = corrections[shift.id] ?? String(shift.actual_cash ?? "");
    if (raw === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
      setMessage("Enter a valid physical cash count.");
      return;
    }

    const { error } = await supabase.rpc("revise_shift_actual_cash", {
      p_shift_id: shift.id,
      p_actual_cash: Number(raw),
      p_notes: "Closing cash updated before approval.",
    });

    setMessage(error ? error.message : "Closing cash updated.");
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
    const hasDifference =
      shift.cash_difference !== null && shift.cash_difference !== undefined;
    const difference = Number(shift.cash_difference || 0);

    if (
      hasDifference &&
      Math.abs(difference) > 0.009 &&
      !window.confirm(
        `Cash difference is ${money.format(difference)}. Approve this shift close?`,
      )
    ) {
      return;
    }

    const { error } = await supabase.rpc("approve_shift_close", {
      p_shift_id: shift.id,
      p_notes:
        shift.actual_cash == null
          ? "Approved · closing cash was optional and not counted."
          : "Approved from Shift screen.",
    });

    setMessage(error ? error.message : "Shift closed.");
    if (!error) await load();
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Cashier Shift</h2>
          <p>Start shift, close shift, and see previous shifts.</p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      {!backendReachable ? (
        <div className="purchase-message error">
          WineShopPOS backend is offline. Shift changes are temporarily disabled.
        </div>
      ) : null}

      {historicalRequired.length ? (
        <div className="purchase-message error">
          {historicalRequired.length} older shift(s) ended without a completed close.
          They do not block starting today's shift. Finish them from Shift History when convenient.
        </div>
      ) : null}

      <section className="panel">
        <div className="section-row">
          <div>
            <h3>Current Shift</h3>
            <p className="muted-text">
              Closing cash check: <strong>{closingCashRequired ? "ON" : "OFF"}</strong>
              {admin ? <> · <Link to="/admin/settings">Change in Settings</Link></> : null}
            </p>
          </div>
        </div>

        {!currentShift ? (
          <div className="settings-inline-row">
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
            <button
              type="button"
              className="primary-button"
              disabled={!backendReachable}
              onClick={open}
            >
              Start Shift
            </button>
          </div>
        ) : (
          <div>
            <p>
              Status: <strong>{shiftStatusLabel(currentShift)}</strong>
            </p>
            <p>Opened: {formatIndiaDateTime(currentShift.opened_at)} IST</p>
            <p>Opening Cash: {money.format(currentShift.opening_cash)}</p>

            {["OPEN", "CLOSE_REQUIRED"].includes(currentShift.status) ? (
              <>
                <label>
                  {closingCashRequired ? "Closing Cash" : "Closing Cash (optional)"}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actual}
                    placeholder={closingCashRequired ? "Physical cash count" : "Leave blank if not counted"}
                    onChange={(event) => setActual(event.target.value)}
                  />
                </label>
                <p className="muted-text">
                  {closingCashRequired
                    ? "Count the drawer before closing."
                    : "Cash check is OFF. You may leave this blank; the shift will show Cash not counted."}
                </p>
                <button
                  type="button"
                  className="primary-button"
                  disabled={
                    !backendReachable ||
                    offlineCounts.pending > 0 ||
                    offlineCounts.conflict > 0
                  }
                  onClick={() => requestClose()}
                >
                  Close Shift
                </button>
              </>
            ) : null}

            {currentShift.status === "CLOSE_REQUESTED" ? (
              <div className="purchase-message">
                Waiting for Manager/Admin approval.
              </div>
            ) : null}
          </div>
        )}
      </section>

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
                <th>Expected Cash</th>
                <th>Counted Cash</th>
                <th>Variance</th>
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
                    <td>{formatIndiaDateTime(shift.opened_at)} IST</td>
                    <td>
                      {shift.cashier_id === profile?.user_id
                        ? "Me"
                        : shift.cashier_id.slice(0, 8)}
                    </td>
                    <td>{shiftStatusLabel(shift)}</td>
                    <td>{money.format(shift.expected_cash)}</td>
                    <td>
                      {shift.actual_cash == null
                        ? "Not counted"
                        : money.format(shift.actual_cash)}
                    </td>
                    <td>
                      {shift.cash_difference == null
                        ? "-"
                        : money.format(shift.cash_difference)}
                    </td>
                    <td>
                      {canRequestHistoricalClose ? (
                        <div className="button-row wrap">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={historicalActuals[shift.id] ?? ""}
                            placeholder={closingCashRequired ? "Closing cash" : "Optional"}
                            onChange={(event) =>
                              setHistoricalActuals((current) => ({
                                ...current,
                                [shift.id]: event.target.value,
                              }))
                            }
                            aria-label={`Closing cash for ${shift.business_date}`}
                            style={{ maxWidth: 130 }}
                          />
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
                            Finish Close
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
                            placeholder="Closing cash"
                            onChange={(event) =>
                              setCorrections((current) => ({
                                ...current,
                                [shift.id]: event.target.value,
                              }))
                            }
                            style={{ maxWidth: 130 }}
                          />
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => reviseActual(shift)}
                          >
                            {shift.actual_cash == null ? "Add Cash Count" : "Update Cash"}
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
