import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  const [documents, setDocuments] = useState([]);
  const [config, setConfig] = useState({
    enabled:false,
    documentId:"",
    clientAudit:false,
    customerImport:false,
  });
  const [message, setMessage] = useState("");

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

  async function save(event) {
    event.preventDefault();
    const { error } = await supabase.rpc("saas_admin_set_legal_notice", {
      p_enabled:config.enabled,
      p_document_id:config.documentId || null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage(config.enabled ? "Pilot/privacy notice enabled for normal live shop users." : "Pilot/privacy notice remains disabled.");
    await load();
  }

  return (
    <form style={card} onSubmit={save}>
      <h2 style={{marginTop:0}}>Pilot / Privacy Notice</h2>
      <p style={{color:"#94a3b8",fontSize:12,lineHeight:1.55}}>
        Prepared for V4 but intentionally disabled until you choose to activate it.
        Demo and Platform Control are not gated by this notice.
      </p>

      <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,fontWeight:800}}>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(event) => setConfig({...config,enabled:event.target.checked})}
        />
        Require notice acceptance after login
      </label>

      <label style={{display:"grid",gap:6,marginBottom:14,fontWeight:700}}>
        Document version
        <select
          style={control}
          value={config.documentId}
          onChange={(event) => setConfig({...config,documentId:event.target.value})}
        >
          <option value="">Choose active document</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.version} · {document.title}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button">Save Pilot / Privacy Control</button>

      {message ? <div style={{marginTop:12,color:"#bae6fd",fontSize:12}}>{message}</div> : null}

      <div style={{marginTop:14,fontSize:12,lineHeight:1.55,color:"#94a3b8"}}>
        <strong>Current privacy-sensitive flags</strong>
        <br/>• Device/session telemetry: {config.clientAudit ? "ENABLED" : "DISABLED"}
        <br/>• Customer file import: {config.customerImport ? "ENABLED" : "DISABLED"}
        <br/>• Source IP capture: NOT IMPLEMENTED
        <br/>• MAC address capture: NOT IMPLEMENTED
      </div>
    </form>
  );
}
