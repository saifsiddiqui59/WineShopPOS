import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSaaS } from "../context/SaaSContext";
import { getEnvironment } from "../config/environment";

const card = {
  background:"#0b0b0d",
  border:"1px solid #27272a",
  color:"#f8fafc",
  borderRadius:16,
  padding:20,
  boxShadow:"0 10px 30px rgba(0,0,0,.22)",
};

const labelStyle = {
  display:"grid",
  gap:6,
  marginBottom:13,
  color:"#cbd5e1",
  fontSize:13,
  fontWeight:700,
};

const controlStyle = {
  width:"100%",
  background:"#050608",
  color:"#fff",
  border:"1px solid #334155",
  borderRadius:9,
  padding:"10px 11px",
};

function expiryDisplay(value) {
  if (!value) return "No expiry";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "No expiry";
}

export default function PlatformAdmin() {
  const saas = useSaaS();
  const environment = getEnvironment();

  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");

  const [account, setAccount] = useState({
    email:"",
    plan:"BASIC",
    status:"ACTIVE",
    expiresAt:"",
    demo:false,
    trialDays:2,
  });

  const [runtime, setRuntime] = useState({
    latest:saas.latestVersion || "V4",
    minimum:saas.minimumSupportedVersion || "V4",
    force:false,
    updateMessage:saas.updateMessage || "",
  });

  const [notice, setNotice] = useState({
    message:"",
    severity:"INFO",
    hours:24,
  });

  async function load() {
    const {data,error} = await supabase.rpc("saas_admin_list_accounts");
    if (error) setMessage(error.message);
    else setAccounts(data || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveAccount(event) {
    event.preventDefault();

    const {error} = await supabase.rpc("saas_admin_set_account_by_email", {
      p_email:account.email.trim(),
      p_plan_code:account.plan,
      p_status:account.status,
      p_expires_at:account.expiresAt
        ? new Date(account.expiresAt).toISOString()
        : null,
      p_demo:account.demo,
      p_trial_days:Number(account.trialDays || 2),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      account.demo
        ? "Demo configured. Trial begins on the first successful demo login."
        : "Subscription saved. In-app reminders are generated automatically from status and expiry.",
    );

    await load();
  }

  async function saveRuntime(event) {
    event.preventDefault();

    const {error} = await supabase.rpc("saas_admin_set_runtime", {
      p_latest_version:runtime.latest,
      p_minimum_supported_version:runtime.minimum,
      p_force_update:runtime.force,
      p_update_message:runtime.updateMessage,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Version controls saved.");
    await saas.refresh();
  }

  async function publish(event) {
    event.preventDefault();

    const {error} = await supabase.rpc("saas_admin_publish_announcement", {
      p_message:notice.message,
      p_severity:notice.severity,
      p_hours:Number(notice.hours || 24),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Operational announcement published. Logged-in users will receive it automatically on the next background check.",
    );

    setNotice((current) => ({...current,message:""}));
    await saas.refresh();
  }

  return (
    <div style={{padding:24,maxWidth:1280,margin:"0 auto",color:"#fff"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <h1 style={{margin:"0 0 6px"}}>WineShopPOS Platform Control</h1>
        <span style={{
          border:"1px solid #3f3f46",
          borderRadius:999,
          padding:"4px 8px",
          fontSize:11,
          fontWeight:900,
        }}>
          {environment.label}
        </span>
      </div>

      <p style={{color:"#94a3b8",marginTop:0}}>
        Provider-only subscription lifecycle, demo trials, version notices and operational announcements.
      </p>

      <div style={{
        background:"rgba(30,41,59,.58)",
        border:"1px solid #334155",
        borderRadius:12,
        padding:"12px 14px",
        margin:"16px 0",
        color:"#dbeafe",
        lineHeight:1.5,
      }}>
        <strong>Subscription reminders are automatic.</strong>{" "}
        Set Status + Expires for a live account. WineShopPOS decides which
        in-app reminder each role sees. Do not use Operational Announcement
        for normal subscription-due reminders.
      </div>

      {message ? (
        <div className="purchase-message" style={{marginBottom:16}}>
          {message}
        </div>
      ) : null}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",
        gap:16,
      }}>
        <form style={card} onSubmit={saveAccount}>
          <h2 style={{marginTop:0}}>Account / Subscription</h2>

          <label style={labelStyle}>
            Email
            <input
              style={controlStyle}
              type="email"
              required
              value={account.email}
              onChange={(e) => setAccount({...account,email:e.target.value})}
            />
          </label>

          <label style={{...labelStyle,display:"flex",alignItems:"center",gap:10}}>
            <input
              type="checkbox"
              checked={account.demo}
              onChange={(e) => setAccount({...account,demo:e.target.checked})}
            />
            Disposable demo account
          </label>

          {account.demo ? (
            <label style={labelStyle}>
              Trial days
              <input
                style={controlStyle}
                type="number"
                min="1"
                max="30"
                value={account.trialDays}
                onChange={(e) => setAccount({...account,trialDays:e.target.value})}
              />
            </label>
          ) : (
            <>
              <label style={labelStyle}>
                Plan
                <select
                  style={controlStyle}
                  value={account.plan}
                  onChange={(e) => setAccount({...account,plan:e.target.value})}
                >
                  <option>BASIC</option>
                  <option>PLUS</option>
                  <option>PRO</option>
                  <option>ENTERPRISE</option>
                </select>
              </label>

              <label style={labelStyle}>
                Status
                <select
                  style={controlStyle}
                  value={account.status}
                  onChange={(e) => setAccount({...account,status:e.target.value})}
                >
                  <option>ACTIVE</option>
                  <option>TRIALING</option>
                  <option>PAST_DUE</option>
                  <option>SUSPENDED</option>
                  <option>EXPIRED</option>
                  <option>CANCELLED</option>
                </select>
              </label>

              <label style={labelStyle}>
                Expires
                <input
                  style={controlStyle}
                  type="datetime-local"
                  value={account.expiresAt}
                  onChange={(e) => setAccount({...account,expiresAt:e.target.value})}
                />
              </label>
            </>
          )}

          <button className="primary-button">Save Account</button>

          <div style={{marginTop:14,fontSize:12,lineHeight:1.55,color:"#94a3b8"}}>
            Live account reminders:
            <br/>• 30–15 days: ADMIN only
            <br/>• 14–8 days: ADMIN + MANAGER
            <br/>• 7–3 days: ADMIN + MANAGER + generic CASHIER warning
            <br/>• 2 days: ADMIN/MANAGER modal + persistent warning
            <br/>• Due today: modal for all shop roles
            <br/>• Server allowed=false: complete application block
          </div>
        </form>

        <form style={card} onSubmit={saveRuntime}>
          <h2 style={{marginTop:0}}>Version Control</h2>

          <label style={labelStyle}>
            Latest version
            <input
              style={controlStyle}
              value={runtime.latest}
              onChange={(e) => setRuntime({...runtime,latest:e.target.value})}
            />
          </label>

          <label style={labelStyle}>
            Minimum supported
            <input
              style={controlStyle}
              value={runtime.minimum}
              onChange={(e) => setRuntime({...runtime,minimum:e.target.value})}
            />
          </label>

          <label style={{...labelStyle,display:"flex",alignItems:"center",gap:10}}>
            <input
              type="checkbox"
              checked={runtime.force}
              onChange={(e) => setRuntime({...runtime,force:e.target.checked})}
            />
            Force update notice
          </label>

          <label style={labelStyle}>
            Update message
            <textarea
              style={controlStyle}
              rows="4"
              value={runtime.updateMessage}
              onChange={(e) => setRuntime({...runtime,updateMessage:e.target.value})}
            />
          </label>

          <button className="primary-button">
            Save Version Controls
          </button>

          <div style={{marginTop:14,fontSize:12,lineHeight:1.55,color:"#94a3b8"}}>
            Force update is currently a strong in-app notice. This executor does
            not silently convert version controls into a hard application block.
          </div>
        </form>

        <form style={card} onSubmit={publish}>
          <h2 style={{marginTop:0}}>Operational Announcement</h2>

          <div style={{
            padding:"10px 12px",
            border:"1px solid #3f3f46",
            borderRadius:10,
            marginBottom:14,
            color:"#cbd5e1",
            fontSize:12,
            lineHeight:1.55,
          }}>
            INFO / SUCCESS = compact notice.<br/>
            WARNING = prominent warning.<br/>
            CRITICAL = acknowledgement modal + persistent warning.<br/>
            Billing reminders are automatic and separate.
          </div>

          <label style={labelStyle}>
            Message
            <textarea
              style={controlStyle}
              required
              rows="4"
              value={notice.message}
              onChange={(e) => setNotice({...notice,message:e.target.value})}
            />
          </label>

          <label style={labelStyle}>
            Severity
            <select
              style={controlStyle}
              value={notice.severity}
              onChange={(e) => setNotice({...notice,severity:e.target.value})}
            >
              <option>INFO</option>
              <option>SUCCESS</option>
              <option>WARNING</option>
              <option>CRITICAL</option>
            </select>
          </label>

          <label style={labelStyle}>
            Show for hours
            <input
              style={controlStyle}
              type="number"
              min="1"
              max="720"
              value={notice.hours}
              onChange={(e) => setNotice({...notice,hours:e.target.value})}
            />
          </label>

          <button className="primary-button">
            Publish Announcement
          </button>
        </form>
      </div>

      <h2 style={{marginTop:28}}>Accounts</h2>

      <div style={{
        overflowX:"auto",
        border:"1px solid #27272a",
        borderRadius:14,
      }}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{background:"#111827"}}>
            <tr>
              {["Email","Role","Mode","Plan","Status","Expiry"].map((item) => (
                <th key={item} style={{padding:11,textAlign:"left",color:"#cbd5e1"}}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {accounts.map((item) => (
              <tr
                key={`${item.user_id}-${item.email}`}
                style={{borderTop:"1px solid #27272a"}}
              >
                <td style={{padding:10}}>{item.email}</td>
                <td style={{padding:10}}>{item.role}</td>
                <td style={{padding:10}}>{item.demo ? "DEMO" : "LIVE"}</td>
                <td style={{padding:10}}>{item.plan_code}</td>
                <td style={{padding:10}}>{item.status}</td>
                <td style={{padding:10}}>{expiryDisplay(item.expires_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
