import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

export default function OwnerExceptions(){
  const[rows,setRows]=useState([]);
  const[resolved,setResolved]=useState([]);
  const[days,setDays]=useState(30);
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState(false);

  async function load(){
    setBusy(true);
    const[a,b]=await Promise.all([
      supabase.rpc("loss_control_exceptions_v3",{p_days:Number(days)}),
      supabase.rpc("loss_control_resolved_activity_v1",{p_days:Number(days)}),
    ]);
    if(a.error||b.error){
      setMsg("Unable to load all Loss & Exceptions activity.");
    }else{
      setRows(a.data||[]);
      setResolved(b.data||[]);
      setMsg("");
    }
    setBusy(false);
  }

  useEffect(()=>{load()},[]);

  const highCount=useMemo(()=>rows.filter(r=>r.severity==="HIGH").length,[rows]);

  return <div>
    <PageHeader
      title="Leakage Shield · Audit & Loss Control"
      subtitle="Only unresolved loss/risk signals stay in Requires Action. Legitimate audited corrections are shown separately as resolved activity."
      tier="PRO"
    />

    <div className="panel filter-bar">
      <label>Lookback
        <select value={days} onChange={(e)=>setDays(e.target.value)}>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
        </select>
      </label>
      <button className="primary-button" onClick={load} disabled={busy}>
        {busy?"Refreshing...":"Refresh"}
      </button>
    </div>

    {msg?<div className="purchase-message">{msg}</div>:null}

    <div className="metric-grid three" style={{marginTop:16}}>
      <div className={`metric-card ${rows.length?"metric-accent-orange":"metric-accent-green"}`}>
        <span>Open Exceptions</span><strong>{rows.length}</strong><small>Action still required</small>
      </div>
      <div className={`metric-card ${highCount?"metric-accent-orange":"metric-accent-green"}`}>
        <span>High Severity</span><strong>{highCount}</strong><small>Current review window</small>
      </div>
      <div className="metric-card metric-accent-green">
        <span>Resolved / Audited</span><strong>{resolved.length}</strong><small>History, not active loss</small>
      </div>
    </div>

    <section className="panel owner-exception-section" style={{marginTop:16}}>
      <div className="section-row">
        <div><h3>Requires Action</h3><p className="muted-text">Amber/red rows are unresolved and need owner review.</p></div>
        <span className={`owner-exception-count ${rows.length?"open":"clear"}`}>{rows.length}</span>
      </div>
      {rows.length===0
        ?<EmptyState title="No open loss exceptions" message="No configured unresolved rule exceeded its review threshold in this period."/>
        :<div className="data-table-wrapper">
          <SortableTable className="data-table" resizeKey="owner-loss-active-v1">
            <thead><tr><th>Severity</th><th>Type</th><th>When</th><th>Summary</th><th>Amount</th><th>Action</th></tr></thead>
            <tbody>{rows.map((r,i)=><tr key={`${r.entity_id}-${r.exception_type}-${i}`}>
              <td><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></td>
              <td>{r.exception_type.replaceAll("_"," ")}</td>
              <td>{new Date(r.event_time).toLocaleString("en-IN")}</td>
              <td>{r.summary}</td>
              <td>{money.format(r.amount||0)}</td>
              <td><Link to={r.action_path||"/owner"}>Review</Link></td>
            </tr>)}</tbody>
          </SortableTable>
        </div>}
    </section>

    <section className="panel owner-resolved-section" style={{marginTop:16}}>
      <div className="section-row">
        <div><h3>Resolved / Audited Activity</h3><p className="muted-text">Legitimate corrections stay visible for audit but do not count as current loss.</p></div>
        <span className="owner-exception-count clear">{resolved.length}</span>
      </div>
      {resolved.length===0
        ?<EmptyState title="No resolved correction activity" message="Audited purchase corrections in this review window will appear here."/>
        :<div className="data-table-wrapper">
          <SortableTable className="data-table" resizeKey="owner-loss-resolved-v1">
            <thead><tr><th>Status</th><th>Type</th><th>When</th><th>Summary</th><th>Qty Change</th><th>Source</th></tr></thead>
            <tbody>{resolved.map((r,i)=><tr key={`${r.entity_id}-${i}`}>
              <td><span className="owner-resolved-badge">AUDITED</span></td>
              <td>{r.activity_type.replaceAll("_"," ")}</td>
              <td>{new Date(r.event_time).toLocaleString("en-IN")}</td>
              <td>{r.summary}</td>
              <td><strong>{Number(r.quantity_change||0)>0?"+":""}{r.quantity_change||0}</strong></td>
              <td><Link to={r.action_path||"/owner"}>View Purchase</Link></td>
            </tr>)}</tbody>
          </SortableTable>
        </div>}
    </section>
  </div>
}

