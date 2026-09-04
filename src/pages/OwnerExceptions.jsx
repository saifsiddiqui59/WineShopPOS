import SortableTable from "../components/ui/SortableTable";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

export default function OwnerExceptions(){
  const[rows,setRows]=useState([]);
  const[days,setDays]=useState(30);
  const[msg,setMsg]=useState("");

  async function load(){
    const{data,error}=await supabase.rpc("loss_control_exceptions_v2",{p_days:Number(days)});
    if(error)setMsg("Unable to load expanded leakage exceptions.");
    else{setRows(data||[]);setMsg("")}
  }
  useEffect(()=>{load()},[]);

  return <div>
    <PageHeader title="Leakage Shield · Audit & Loss Control" subtitle="Neutral, rule-based review signals across stock, cash, returns, discounts, overrides, store credit and vouchers. Flags are not accusations." tier="PRO"/>
    <div className="panel filter-bar">
      <label>Lookback<select value={days} onChange={(e)=>setDays(e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label>
      <button className="primary-button" onClick={load}>Refresh</button>
    </div>
    {msg?<div className="purchase-message">{msg}</div>:null}

    <section className="panel" style={{marginTop:16}}>
      <h3>Requires Review</h3>
      {rows.length===0?<EmptyState title="No unusual activity found" message="No configured rule exceeded its review threshold in this period."/>:<div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Severity</th><th>Type</th><th>When</th><th>Summary</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.entity_id}-${r.exception_type}-${i}`}><td><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></td><td>{r.exception_type.replaceAll("_"," ")}</td><td>{new Date(r.event_time).toLocaleString("en-IN")}</td><td>{r.summary}</td><td>{money.format(r.amount||0)}</td><td><Link to={r.action_path||"/owner"}>Review</Link></td></tr>)}</tbody></SortableTable></div>}
    </section>
  </div>
}
