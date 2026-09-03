import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

export default function Recommendations(){
  const[rows,setRows]=useState([]);
  const[msg,setMsg]=useState("");
  const[days,setDays]=useState(30);
  const[busy,setBusy]=useState(false);

  async function load(){
    setBusy(true);
    const{data,error}=await supabase.rpc("owner_recommendations",{p_history_days:Number(days)});
    if(error)setMsg("Unable to calculate recommendations.");
    else{setRows(data||[]);setMsg("");}
    setBusy(false);
  }

  useEffect(()=>{load()},[]);

  return <div>
    <PageHeader title="Smart Recommendations" subtitle="Rule-based actions from live stock, sales, inventory health and shift variance." tier="PLUS"/>
    <div className="panel filter-bar">
      <label>Lookback
        <select value={days} onChange={(e)=>setDays(e.target.value)}>
          <option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option>
        </select>
      </label>
      <button className="primary-button" onClick={load} disabled={busy}>{busy?"Refreshing...":"Refresh"}</button>
    </div>
    {msg?<div className="purchase-message">{msg}</div>:null}
    <section className="panel recommendation-list" style={{marginTop:16}}>
      {rows.length===0
        ?<EmptyState title="No recommendations right now" message="The shop has no configured condition requiring an action."/>
        :rows.map((r,i)=><div className="recommendation-card" key={`${r.recommendation_type}-${i}`}>
          <div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span><h3>{r.title}</h3><p>{r.message}</p></div>
          <Link className="secondary-button" to={r.action_path||"/owner"}>Take Action</Link>
        </div>)}
    </section>
  </div>
}
