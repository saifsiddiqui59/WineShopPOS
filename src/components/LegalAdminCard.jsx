import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getEnvironment } from "../config/environment";

const card = {
  background:"#0b0b0d",
  border:"1px solid #27272a",
  color:"#f8fafc",
  borderRadius:16,
  padding:20,
  boxShadow:"0 10px 30px rgba(0,0,0,.22)",
};

const control = {
  width:"100%",
  background:"#050608",
  color:"#fff",
  border:"1px solid #334155",
  borderRadius:9,
  padding:"10px 11px",
};

export default function LegalAdminCard() {
  const environment = getEnvironment();
  const [documents, setDocuments] = useState([]);
  const [config, setConfig] = useState({
    enabled:false,
    documentId:"",
    clientAudit:false,
    customerImport:false,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [docsResult, flagsResult] = await Promise.all([
      supabase.rpc("saas_admin_list_legal_documents"),
      supabase.rpc("saas_admin_get_v4_flags"),
    ]);

    if (docsResult.error || flagsResult.error) {
      setMessage(docsResult.error?.message || flagsResult.error?.message || "Unable to load legal configuration.");
      return;
    }

    const docs = docsResult.data || [];
    const flags = Array.isArray(flagsResult.data) ? flagsResult.data[0] : flagsResult.data;
    setDocuments(docs);
    setConfig({
      enabled:flags?.legal_notice_enabled === true,
      documentId:flags?.legal_document_id || docs[0]?.id || "",
      clientAudit:flags?.client_audit_enabled === true,
      customerImport:flags?.customer_import_enabled === true,
    });
  }

  useEffect(() => {
    void load();
  }, []);

  async function persist(nextEnabled, { confirmEnable=false } = {}) {
    if (!config.documentId) {
      setMessage("Choose the legal document version first.");
      return;
    }

    if (nextEnabled && confirmEnable) {
      const approved = window.confirm(
        `Enable the Pilot / Privacy Notice in ${environment.label}?\n\n` +
        "This applies to ALL normal LIVE shop users after login. " +
        "They must accept the selected notice before entering the app.\n\n" +
        "Demo and Platform Control remain exempt."
      );
      if (!approved) return;
    }

    setBusy(true);
    setMessage("");
    const { error } = await supabase.rpc("saas_admin_set_legal_notice", {
      p_enabled:nextEnabled,
      p_document_id:config.documentId,
    });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      nextEnabled
        ? "Pilot / Privacy Notice ENABLED for all normal LIVE shop users."
        : "Pilot / Privacy Notice DISABLED. Normal live users can enter without notice acceptance."
    );
    await load();
  }

  return (
    <section style={card}>
      <h2 style={{marginTop:0}}>Pilot / Privacy Notice</h2>

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          gap:12,
          padding:"11px 12px",
          marginBottom:12,
          border:"1px solid #334155",
          borderRadius:10,
          background:"#050608",
        }}
      >
        <strong>Current status</strong>
        <span
          aria-label={`Pilot privacy notice ${config.enabled ? "enabled" : "disabled"}`}
          style={{
            borderRadius:999,
            padding:"5px 10px",
            fontSize:12,
            fontWeight:900,
            letterSpacing:".05em",
            background:config.enabled ? "rgba(220,38,38,.18)" : "rgba(22,163,74,.16)",
            color:config.enabled ? "#fecaca" : "#bbf7d0",
            border:`1px solid ${config.enabled ? "#7f1d1d" : "#166534"}`,
          }}
        >
          {config.enabled ? "ENABLED" : "DISABLED"}
        </span>
      </div>

      <div
        style={{
          padding:"10px 12px",
          marginBottom:14,
          border:"1px solid #7c2d12",
          borderRadius:10,
          background:"rgba(124,45,18,.14)",
          color:"#fed7aa",
          fontSize:12,
          lineHeight:1.55,
        }}
      >
        <strong>Scope:</strong> this is a GLOBAL live-user gate for the current environment.
        When enabled, it applies to <strong>ALL normal LIVE shop users after login</strong>,
        not only the email being edited in Account / Subscription.
        Demo and Platform Control are exempt.
      </div>

      <label style={{display:"grid",gap:6,marginBottom:14,fontWeight:700}}>
        Document version
        <select
          style={control}
          value={config.documentId}
          onChange={(event) => setConfig({...config,documentId:event.target.value})}
          disabled={busy}
        >
          <option value="">Choose active document</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.version} · {document.title}
            </option>
          ))}
        </select>
      </label>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button
          type="button"
          className="secondary-button"
          disabled={busy || !config.documentId}
          onClick={() => void persist(config.enabled)}
        >
          Save Selected Document
        </button>

        {config.enabled ? (
          <button
            type="button"
            className="danger-button"
            disabled={busy}
            onClick={() => void persist(false)}
          >
            {busy ? "Saving…" : "DISABLE NOTICE"}
          </button>
        ) : (
          <button
            type="button"
            className="primary-button"
            disabled={busy || !config.documentId}
            onClick={() => void persist(true,{confirmEnable:true})}
          >
            {busy ? "Saving…" : "ENABLE NOTICE"}
          </button>
        )}
      </div>

      {message ? <div style={{marginTop:12,color:"#bae6fd",fontSize:12}}>{message}</div> : null}

      <div style={{marginTop:14,fontSize:12,lineHeight:1.55,color:"#94a3b8"}}>
        <strong>Current privacy-sensitive flags</strong>
        <br/>• Device/session telemetry: {config.clientAudit ? "ENABLED" : "DISABLED"}
        <br/>• Customer file import: {config.customerImport ? "ENABLED" : "DISABLED"}
        <br/>• Source IP capture: NOT IMPLEMENTED
        <br/>• MAC address capture: NOT IMPLEMENTED
      </div>
    </section>
  );
}
