import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, Clock3, ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const HOUR_MS = 60 * 60 * 1000;

function actionLabel(action) {
  return {
    REVIEW_EXISTING_PO: "Review existing PO",
    CHECK_ETA: "Confirm supplier ETA",
    EXPEDITE_INBOUND: "Review / expedite PO",
    REVIEW_PURCHASE: "Review purchase plan",
  }[action] || "Review purchase plan";
}

function coverText(alert) {
  const days = Number(alert?.days_cover);
  if (!Number.isFinite(days)) return "Stock cover unavailable";
  if (days === 0) return "Out of stock";
  return `${days.toFixed(days < 10 ? 1 : 0)} days stock cover`;
}

export default function PurchaseAlertCenter() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lastCheckRef = useRef(0);

  const isAdmin = profile?.role === "ADMIN";
  const shopId = profile?.shop_id || "";
  const alerts = useMemo(() => Array.isArray(snapshot?.alerts) ? snapshot.alerts : [], [snapshot]);
  const dueAlerts = useMemo(() => alerts.filter((row) => row?.should_notify), [alerts]);

  const claim = useCallback(async () => {
    if (!isAdmin || !shopId) return;
    const now = Date.now();
    if (now - lastCheckRef.current < 15_000) return;
    lastCheckRef.current = now;

    const { data, error } = await supabase.rpc("purchase_alert_snapshot_v1", { p_claim: true });
    if (error) return;

    setSnapshot(data || null);
    if (data?.enabled && Number(data?.due_count || 0) > 0) setToastOpen(true);
    if (!data?.enabled || Number(data?.active_count || 0) === 0) {
      setToastOpen(false);
      setPanelOpen(false);
    }
  }, [isAdmin, shopId]);

  useEffect(() => {
    if (!isAdmin || !shopId) {
      setSnapshot(null);
      setToastOpen(false);
      setPanelOpen(false);
      return undefined;
    }

    void claim();
    const timer = window.setInterval(() => void claim(), HOUR_MS);
    const onOnline = () => void claim();
    const onVisibility = () => { if (document.visibilityState === "visible") void claim(); };

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAdmin, shopId, claim]);

  async function snooze(days) {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("snooze_all_purchase_alerts_v1", { p_days: days });
    setBusy(false);
    if (!error) {
      setToastOpen(false);
      setPanelOpen(false);
    }
  }

  async function dismiss() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("dismiss_all_purchase_alerts_v1");
    setBusy(false);
    if (!error) {
      setToastOpen(false);
      setPanelOpen(false);
    }
  }

  function reviewPlan() {
    setToastOpen(false);
    setPanelOpen(false);
    navigate("/purchasing/intelligence");
  }

  if (!isAdmin || !snapshot?.enabled) return null;

  const activeCount = Number(snapshot?.active_count || 0);
  const dueCount = Number(snapshot?.due_count || 0);
  const toastRows = dueAlerts.slice(0, 3);

  return <div className="purchase-alert-host">
    <button type="button" className="purchase-alert-bell"
      aria-label={`Purchase alerts${activeCount ? `, ${activeCount} active` : ""}`}
      aria-expanded={panelOpen} onClick={() => setPanelOpen((value) => !value)}>
      <Bell size={18}/>
      {activeCount > 0 ? <span className="purchase-alert-count">{activeCount > 99 ? "99+" : activeCount}</span> : null}
    </button>

    {panelOpen ? <div className="purchase-alert-panel">
      <div className="purchase-alert-panel-head">
        <div><strong>Purchase Action Center</strong><span>4-day delivery · 2-day safety window</span></div>
        <button type="button" className="purchase-alert-icon-button" aria-label="Close purchase alerts" onClick={() => setPanelOpen(false)}><X size={17}/></button>
      </div>
      {activeCount === 0 ? <div className="purchase-alert-empty">No purchase action needs attention right now.</div> : <>
        <div className="purchase-alert-list">
          {alerts.slice(0, 8).map((alert) => <div className="purchase-alert-row" key={alert.product_id}>
            <span className={`purchase-alert-severity ${String(alert.priority || "").toLowerCase()}`}>
              {alert.priority === "CRITICAL" ? <AlertTriangle size={14}/> : <Clock3 size={14}/>}</span>
            <div><strong>{alert.product_name}</strong><span>{coverText(alert)} · {actionLabel(alert.action_kind)}</span></div>
          </div>)}
        </div>
        {activeCount > alerts.length ? <p className="purchase-alert-more">+ {activeCount - alerts.length} more active purchase actions.</p> : null}
        <div className="purchase-alert-actions">
          <button type="button" className="primary-button" onClick={reviewPlan}><ShoppingCart size={15}/> Review Purchase Plan</button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => snooze(1)}>Snooze 1 day</button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => snooze(2)}>Snooze 2 days</button>
        </div>
      </>}
    </div> : null}

    {toastOpen && dueCount > 0 ? <div className="purchase-alert-toast" role="status" aria-live="polite">
      <div className="purchase-alert-toast-head">
        <div><strong>Purchase Attention</strong><span>{dueCount} purchase {dueCount === 1 ? "action needs" : "actions need"} attention</span></div>
        <button type="button" className="purchase-alert-icon-button" aria-label="Dismiss purchase reminder" onClick={dismiss} disabled={busy}><X size={18}/></button>
      </div>
      <div className="purchase-alert-toast-list">
        {toastRows.map((alert) => <div key={alert.product_id}><strong>{alert.product_name}</strong><span>{coverText(alert)} · {actionLabel(alert.action_kind)}</span></div>)}
      </div>
      <div className="purchase-alert-actions">
        <button type="button" className="primary-button" onClick={reviewPlan}>Review Purchase Plan</button>
        <button type="button" className="secondary-button" disabled={busy} onClick={() => snooze(1)}>Snooze 1 day</button>
        <button type="button" className="secondary-button" disabled={busy} onClick={() => snooze(2)}>Snooze 2 days</button>
        <button type="button" className="text-button" disabled={busy} onClick={dismiss}>Dismiss</button>
      </div>
    </div> : null}
  </div>;
}
