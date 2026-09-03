import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

export default function OwnerWhatsApp(){
  const{profile}=useAuth();
  const[s,setS]=useState({});
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState(false);

  async function load(){
    setBusy(true);
    const{data,error}=await supabase.rpc("owner_center_summary",{});
    if(error)setMsg("Unable to generate summary.");
    else{setS(data||{});setMsg("");}
    setBusy(false);
  }

  useEffect(()=>{load()},[]);

  const text=useMemo(()=>[
    "WineShopPOS — Business Summary",
    `Shop: ${profile?.shop_name||"Current Shop"}`,
    `Period: ${s.from||""} to ${s.to||""}`,
    `Revenue: ${money.format(s.revenue||0)}`,
    `Bills: ${s.bills||0}`,
    `Gross Profit: ${money.format(s.gross_profit||0)}`,
    `Expenses: ${money.format(s.expenses||0)}`,
    `Operating Profit: ${money.format(s.operating_profit||0)}`,
    `Returns: ${money.format(s.returns||0)}`,
    `Cash Variance: ${money.format(s.cash_variance||0)}`,
    `Low Stock SKUs: ${s.low_stock_count||0}`,
  ].join("\n"),[s,profile]);

  function share(){window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer")}

  async function copy(){
    try{
      await navigator.clipboard.writeText(text);
      setMsg("Summary copied.");
    }catch{
      setMsg("Copy is unavailable in this browser. Use the preview text or Share with Owner.");
    }
  }

  return <div>
    <PageHeader title="Owner WhatsApp Summary" subtitle="Generate a pre-written operating summary. Nothing is sent automatically." tier="PLUS"/>
    <div className="panel filter-bar">
      <button className="secondary-button" onClick={load} disabled={busy}>{busy?"Refreshing...":"Refresh Summary"}</button>
      <button className="secondary-button" onClick={copy}>Copy Summary</button>
    </div>
    {msg?<div className="purchase-message">{msg}</div>:null}
    <div className="settings-grid" style={{marginTop:16}}>
      <section className="panel"><h3>Preview</h3><pre className="share-preview">{text}</pre><button className="primary-button" onClick={share}>Share with Owner</button></section>
      <section className="panel"><h3>Privacy & Sending</h3><p>WineShopPOS does not call a WhatsApp API, does not send background alerts and does not schedule messages.</p><p>Your device opens WhatsApp or WhatsApp Web with this text. The user chooses the recipient and manually sends it.</p></section>
    </div>
  </div>
}
