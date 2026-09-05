import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSaaS } from "../context/SaaSContext";
import { getEnvironment } from "../config/environment";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

function remainingMs(iso, now) {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  return Number.isFinite(end) ? end - now : null;
}

function dateText(iso) {
  if (!iso) return "Not set";
  const value = new Date(iso);
  return Number.isFinite(value.getTime()) ? value.toLocaleString() : "Not set";
}

function remainingText(ms) {
  if (ms == null) return "";
  if (ms <= 0) return "due now";
  if (ms < DAY_MS) {
    const hours = Math.max(1, Math.ceil(ms / HOUR_MS));
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.max(1, Math.ceil(ms / DAY_MS));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function hashText(value) {
  let h = 2166136261;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function useSessionAck(namespace, value) {
  const key = useMemo(
    () => `wsp_${namespace}_${hashText(value)}`,
    [namespace, value],
  );

  const [acked, setAcked] = useState(() => {
    try {
      return sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      setAcked(sessionStorage.getItem(key) === "1");
    } catch {
      setAcked(false);
    }
  }, [key]);

  function acknowledge() {
    try {
      sessionStorage.setItem(key, "1");
    } catch {}
    setAcked(true);
  }

  return [acked, acknowledge];
}

function palette(level) {
  if (level === "critical") {
    return {
      bg:"linear-gradient(135deg, rgba(127,29,29,.97), rgba(69,10,10,.97))",
      border:"1px solid rgba(248,113,113,.62)",
      accent:"#fecaca",
      button:"#fee2e2",
      buttonText:"#7f1d1d",
    };
  }

  if (level === "strong") {
    return {
      bg:"linear-gradient(135deg, rgba(124,45,18,.94), rgba(67,20,7,.96))",
      border:"1px solid rgba(251,146,60,.55)",
      accent:"#fed7aa",
      button:"#ffedd5",
      buttonText:"#7c2d12",
    };
  }

  if (level === "warning") {
    return {
      bg:"linear-gradient(135deg, rgba(120,53,15,.88), rgba(69,26,3,.94))",
      border:"1px solid rgba(245,158,11,.48)",
      accent:"#fde68a",
      button:"#fef3c7",
      buttonText:"#78350f",
    };
  }

  if (level === "success") {
    return {
      bg:"rgba(6,78,59,.76)",
      border:"1px solid rgba(52,211,153,.35)",
      accent:"#a7f3d0",
      button:"#d1fae5",
      buttonText:"#065f46",
    };
  }

  return {
    bg:"rgba(8,47,73,.68)",
    border:"1px solid rgba(56,189,248,.30)",
    accent:"#bae6fd",
    button:"#e0f2fe",
    buttonText:"#075985",
  };
}

function Modal({ title, body, detail, level="critical", onAcknowledge }) {
  const p = palette(level);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position:"fixed",
        inset:0,
        zIndex:100000,
        background:"rgba(0,0,0,.72)",
        backdropFilter:"blur(5px)",
        display:"grid",
        placeItems:"center",
        padding:20,
      }}
    >
      <section style={{
        width:"min(640px, 96vw)",
        background:p.bg,
        border:p.border,
        color:"#fff",
        borderRadius:20,
        padding:28,
        boxShadow:"0 30px 90px rgba(0,0,0,.62)",
      }}>
        <div style={{
          color:p.accent,
          fontSize:12,
          fontWeight:900,
          letterSpacing:".13em",
          marginBottom:9,
        }}>
          ATTENTION REQUIRED
        </div>

        <h2 style={{fontSize:29,lineHeight:1.15,margin:"0 0 12px"}}>
          {title}
        </h2>

        <p style={{fontSize:17,lineHeight:1.55,margin:"0 0 10px",color:"#f8fafc"}}>
          {body}
        </p>

        {detail ? (
          <p style={{fontSize:14,fontWeight:800,color:p.accent,margin:"0 0 20px"}}>
            {detail}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onAcknowledge}
          style={{
            border:0,
            borderRadius:10,
            padding:"11px 18px",
            background:p.button,
            color:p.buttonText,
            fontWeight:900,
            cursor:"pointer",
          }}
        >
          I understand
        </button>
      </section>
    </div>
  );
}

function buildLiveBillingNotice({ saas, role, now }) {
  if (saas.isPlatformAdmin) return null;

  const userRole = String(role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isCashier = userRole === "CASHIER";

  const status = String(saas.subscriptionStatus || "ACTIVE").toUpperCase();
  const remaining = remainingMs(saas.expiresAt, now);

  if (status === "PAST_DUE") {
    return {
      level:"critical",
      title:isCashier ? "Subscription payment is overdue" : "Subscription payment is past due",
      body:isCashier
        ? "Please inform the shop owner immediately. WineShopPOS access may be interrupted."
        : `The ${saas.planCode} subscription is past due. Please contact the WineShopPOS provider to avoid interruption.`,
      detail:isCashier ? "" : (saas.expiresAt ? `Subscription date: ${dateText(saas.expiresAt)}` : `Plan: ${saas.planCode}`),
      modal:true,
      key:`past-due-${saas.planCode}-${saas.expiresAt || "none"}`,
    };
  }

  if (!saas.expiresAt || remaining == null || remaining > 30 * DAY_MS) {
    return null;
  }

  if (remaining <= 0) {
    return {
      level:"critical",
      title:"Subscription requires attention",
      body:isCashier
        ? "Please inform the shop owner immediately."
        : "The configured subscription expiry has passed. WineShopPOS will follow the server access decision.",
      detail:isCashier ? "" : `Expiry: ${dateText(saas.expiresAt)}`,
      modal:true,
      key:`passed-${saas.expiresAt}`,
    };
  }

  if (remaining <= DAY_MS) {
    return {
      level:"critical",
      title:"WineShopPOS subscription due today",
      body:isCashier
        ? "Please inform the shop owner immediately to avoid interruption."
        : `The ${saas.planCode} subscription expires in ${remainingText(remaining)}. Please contact the WineShopPOS provider to renew.`,
      detail:isCashier ? "" : `Expiry: ${dateText(saas.expiresAt)}`,
      modal:true,
      key:`due-today-${saas.expiresAt}`,
    };
  }

  if (remaining <= 2 * DAY_MS) {
    return {
      level:isCashier ? "strong" : "critical",
      title:"WineShopPOS subscription expires very soon",
      body:isCashier
        ? `Subscription expires in ${remainingText(remaining)}. Please inform the shop owner.`
        : `The ${saas.planCode} subscription expires in ${remainingText(remaining)}. Please contact the WineShopPOS provider to renew.`,
      detail:isCashier ? "" : `Expiry: ${dateText(saas.expiresAt)}`,
      modal:!isCashier,
      key:`two-days-${saas.expiresAt}`,
    };
  }

  if (remaining <= 7 * DAY_MS) {
    return {
      level:"strong",
      title:"Subscription expires soon",
      body:isCashier
        ? `WineShopPOS expires in ${remainingText(remaining)}. Please inform the shop owner.`
        : `The ${saas.planCode} subscription expires in ${remainingText(remaining)}.`,
      detail:isCashier ? "" : `Expiry: ${dateText(saas.expiresAt)}`,
      modal:false,
      key:`seven-days-${saas.expiresAt}`,
    };
  }

  if (remaining <= 14 * DAY_MS) {
    if (!isAdmin && !isManager) return null;

    return {
      level:isAdmin ? "warning" : "info",
      title:"Subscription renewal reminder",
      body:isAdmin
        ? `The ${saas.planCode} subscription expires in ${remainingText(remaining)}.`
        : `WineShopPOS expires in ${remainingText(remaining)}. Please ensure the shop owner is aware.`,
      detail:isAdmin ? `Expiry: ${dateText(saas.expiresAt)}` : "",
      modal:false,
      key:`fourteen-days-${saas.expiresAt}`,
    };
  }

  if (remaining <= 30 * DAY_MS && isAdmin) {
    return {
      level:"info",
      title:"Upcoming subscription renewal",
      body:`The ${saas.planCode} subscription expires in ${remainingText(remaining)}.`,
      detail:`Expiry: ${dateText(saas.expiresAt)}`,
      modal:false,
      key:`thirty-days-${saas.expiresAt}`,
    };
  }

  return null;
}

function buildDemoNotice(saas, now) {
  const remaining = remainingMs(saas.trialEndsAt, now);
  if (remaining == null) {
    return {
      level:"info",
      title:"Demo trial",
      body:"Your two-day demo trial starts on the first successful demo session.",
      detail:"Demo business data stays in this browser session only.",
      modal:false,
      key:"demo-not-started",
    };
  }

  if (remaining <= 0) {
    return {
      level:"critical",
      title:"Demo trial ended",
      body:"The WineShopPOS demo trial has reached its end time.",
      detail:`Trial end: ${dateText(saas.trialEndsAt)}`,
      modal:true,
      key:`demo-ended-${saas.trialEndsAt}`,
    };
  }

  if (remaining <= 6 * HOUR_MS) {
    return {
      level:"critical",
      title:"Demo trial ending soon",
      body:`Your WineShopPOS demo trial ends in ${remainingText(remaining)}.`,
      detail:`Trial end: ${dateText(saas.trialEndsAt)}`,
      modal:true,
      key:`demo-six-hours-${saas.trialEndsAt}`,
    };
  }

  if (remaining <= DAY_MS) {
    return {
      level:"strong",
      title:"Demo trial ending soon",
      body:`Your WineShopPOS demo trial ends in ${remainingText(remaining)}.`,
      detail:`Trial end: ${dateText(saas.trialEndsAt)}`,
      modal:false,
      key:`demo-one-day-${saas.trialEndsAt}`,
    };
  }

  return {
    level:"info",
    title:"Demo trial",
    body:`${remainingText(remaining)} remaining in this demo trial.`,
    detail:"Demo business data is temporary and resets after logout/new browser session.",
    modal:false,
    key:`demo-active-${saas.trialEndsAt}`,
  };
}

function NoticeStrip({ notice, tag="SUBSCRIPTION" }) {
  const p = palette(notice.level);

  return (
    <section style={{
      margin:"10px 16px 0",
      border:p.border,
      background:p.bg,
      borderRadius:14,
      padding:"13px 15px",
      color:"#fff",
      boxShadow:notice.level === "critical" ? "0 10px 34px rgba(127,29,29,.25)" : "none",
    }}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:".11em",color:p.accent}}>
        {tag}
      </div>
      <div style={{fontSize:17,fontWeight:900,marginTop:3}}>
        {notice.title}
      </div>
      <div style={{marginTop:4,lineHeight:1.45}}>
        {notice.body}
      </div>
      {notice.detail ? (
        <div style={{marginTop:5,fontSize:13,color:p.accent,fontWeight:800}}>
          {notice.detail}
        </div>
      ) : null}
    </section>
  );
}

export default function SaaSBanner() {
  const { profile } = useAuth();
  const saas = useSaaS();
  const environment = getEnvironment();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const billingNotice = useMemo(() => {
    if (saas.isDemo) return buildDemoNotice(saas, now);
    return buildLiveBillingNotice({saas, role:profile?.role, now});
  }, [
    saas.isDemo,
    saas.trialEndsAt,
    saas.expiresAt,
    saas.planCode,
    saas.subscriptionStatus,
    saas.isPlatformAdmin,
    profile?.role,
    now,
  ]);

  const announcement = saas.announcementMessage
    ? {
        severity:String(saas.announcementSeverity || "INFO").toUpperCase(),
        message:saas.announcementMessage,
      }
    : null;

  const billingAckValue = `${billingNotice?.key || "none"}:${profile?.role || "none"}`;
  const announcementAckValue = `${announcement?.severity || "none"}:${announcement?.message || ""}`;
  const updateAckValue = `${saas.forceUpdate}:${saas.latestVersion}:${saas.updateMessage}`;

  const [billingAcked, ackBilling] = useSessionAck("billing", billingAckValue);
  const [announcementAcked, ackAnnouncement] = useSessionAck("announcement", announcementAckValue);
  const [updateAcked, ackUpdate] = useSessionAck("update", updateAckValue);

  const announcementLevel =
    announcement?.severity === "CRITICAL" ? "critical" :
    announcement?.severity === "WARNING" ? "warning" :
    announcement?.severity === "SUCCESS" ? "success" :
    "info";

  return (
    <>
      <div style={{
        margin:"10px 16px 0",
        display:"flex",
        alignItems:"center",
        gap:9,
        flexWrap:"wrap",
      }}>
        <span style={{
          display:"inline-flex",
          alignItems:"center",
          padding:"5px 9px",
          border:"1px solid rgba(148,163,184,.35)",
          borderRadius:999,
          fontSize:11,
          fontWeight:900,
          letterSpacing:".08em",
          color:"#e2e8f0",
        }}>
          {environment.label}
        </span>

        {saas.isDemo ? (
          <span style={{
            display:"inline-flex",
            alignItems:"center",
            padding:"5px 9px",
            border:"1px solid rgba(56,189,248,.35)",
            borderRadius:999,
            fontSize:11,
            fontWeight:900,
            color:"#bae6fd",
          }}>
            DEMO
          </span>
        ) : null}

        {saas.isPlatformAdmin ? (
          <Link to="/platform-admin" style={{fontWeight:900}}>
            Platform Control
          </Link>
        ) : null}

        {saas.lastCheckedAt ? (
          <span style={{fontSize:11,color:"#64748b",marginLeft:"auto"}}>
            access checked {new Date(saas.lastCheckedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      {billingNotice ? <NoticeStrip notice={billingNotice} /> : null}

      {saas.updateMessage ? (
        <section style={{
          margin:"10px 16px 0",
          border:saas.forceUpdate
            ? "1px solid rgba(251,146,60,.52)"
            : "1px solid rgba(56,189,248,.28)",
          background:saas.forceUpdate
            ? "rgba(124,45,18,.85)"
            : "rgba(8,47,73,.64)",
          borderRadius:12,
          padding:"11px 13px",
          color:"#fff",
        }}>
          <strong>{saas.forceUpdate ? "UPDATE NOTICE" : "VERSION UPDATE"}</strong>
          <span style={{marginLeft:8}}>{saas.updateMessage}</span>
        </section>
      ) : null}

      {announcement ? (
        <section style={{
          margin:"10px 16px 0",
          border:palette(announcementLevel).border,
          background:palette(announcementLevel).bg,
          borderRadius:12,
          padding:"11px 13px",
          color:"#fff",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          gap:12,
        }}>
          <div>
            <strong>{announcement.severity}</strong>
            <span style={{marginLeft:8}}>{announcement.message}</span>
          </div>

          {announcement.severity !== "CRITICAL" ? (
            <button
              type="button"
              onClick={ackAnnouncement}
              style={{
                border:"1px solid rgba(255,255,255,.30)",
                background:"transparent",
                color:"#fff",
                borderRadius:8,
                padding:"6px 9px",
                cursor:"pointer",
              }}
            >
              Dismiss
            </button>
          ) : null}
        </section>
      ) : null}

      {billingNotice?.modal && !billingAcked ? (
        <Modal
          title={billingNotice.title}
          body={billingNotice.body}
          detail={billingNotice.detail}
          level={billingNotice.level}
          onAcknowledge={ackBilling}
        />
      ) : null}

      {announcement?.severity === "CRITICAL" && !announcementAcked ? (
        <Modal
          title="Important WineShopPOS notice"
          body={announcement.message}
          detail="This announcement was marked CRITICAL by the WineShopPOS platform administrator."
          level="critical"
          onAcknowledge={ackAnnouncement}
        />
      ) : null}

      {saas.forceUpdate && saas.updateMessage && !updateAcked ? (
        <Modal
          title="WineShopPOS update notice"
          body={saas.updateMessage}
          detail={`Current app: ${saas.appVersion} · Latest: ${saas.latestVersion}`}
          level="strong"
          onAcknowledge={ackUpdate}
        />
      ) : null}
    </>
  );
}
