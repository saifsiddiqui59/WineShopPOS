import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { getDeviceId, getSessionId } from "../lib/clientIdentity";

function one(data) {
  return Array.isArray(data) ? (data[0] || null) : data;
}

function missingRpc(error) {
  const message = String(error?.message || "");
  return error?.code === "PGRST202" || /my_legal_notice|could not find the function|does not exist/i.test(message);
}

export default function LegalNoticeBoundary() {
  const { user, signOut } = useAuth();
  const [state, setState] = useState({ loading:true, notice:null, error:"" });
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setState({ loading:false, notice:null, error:"" });
      return;
    }
    if (!navigator.onLine) {
      setState({ loading:false, notice:{ enabled:false, accepted:false }, error:"" });
      return;
    }

    setState((current) => ({ ...current, loading:true, error:"" }));
    const { data, error } = await supabase.rpc("my_legal_notice");
    if (error) {
      if (missingRpc(error)) {
        console.warn("Legal notice RPC not available; compatibility mode keeps the gate disabled.");
        setState({ loading:false, notice:{ enabled:false, accepted:false }, error:"" });
      } else {
        setState({ loading:false, notice:null, error:error.message || "Unable to verify the pilot/privacy notice." });
      }
      return;
    }
    setState({ loading:false, notice:one(data), error:"" });
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function accept() {
    if (!checked || !state.notice?.document_id) return;
    setBusy(true);
    const { error } = await supabase.rpc("accept_legal_notice", {
      p_document_id:state.notice.document_id,
      p_device_id:getDeviceId(),
      p_session_id:getSessionId(),
      p_user_agent:navigator.userAgent,
      p_app_version:"V4",
    });
    setBusy(false);

    if (error) {
      setState((current) => ({ ...current, error:error.message || "Unable to record acceptance." }));
      return;
    }
    setState((current) => ({
      ...current,
      error:"",
      notice:{ ...current.notice, accepted:true },
    }));
  }

  if (state.loading) {
    return <div className="wsp-legal-loading">Checking WineShopPOS access…</div>;
  }

  if (state.error) {
    return (
      <div className="wsp-legal-screen">
        <section className="wsp-legal-card">
          <h1>Unable to verify access notice</h1>
          <p>{state.error}</p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={() => void load()}>Check Again</button>
            <button className="secondary-button" type="button" onClick={() => void signOut()}>Sign Out</button>
          </div>
        </section>
      </div>
    );
  }

  if (!state.notice?.enabled || state.notice?.accepted) return <Outlet/>;

  return (
    <div className="wsp-legal-screen">
      <section className="wsp-legal-card">
        <div className="wsp-legal-kicker">AUTHORIZED INTERNAL PILOT · V4</div>
        <h1>{state.notice.title}</h1>
        <div className="wsp-legal-meta">
          Notice version {state.notice.version} · Document hash {String(state.notice.content_sha256 || "").slice(0, 16)}…
        </div>
        <div className="wsp-legal-content">
          {String(state.notice.content || "").split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <label className="wsp-legal-check">
          <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)}/>
          <span>I have read and understood the Authorized Internal Pilot Use & Privacy Notice.</span>
        </label>
        <button className="primary-button" type="button" disabled={!checked || busy} onClick={() => void accept()}>
          {busy ? "Recording…" : "ACCEPT AND CONTINUE"}
        </button>
      </section>
    </div>
  );
}
