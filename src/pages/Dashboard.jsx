import { useEffect, useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { indiaDateKey } from "../lib/businessDate";

const money = new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2});

export default function Dashboard() {
  const { sales, loadingData, dataError } = useShop();
  const { profile } = useAuth();
  const today = indiaDateKey();
  const [summary,setSummary]=useState(null);
  const [summaryError,setSummaryError]=useState("");

  useEffect(()=>{
    let alive=true;
    supabase.rpc("dashboard_summary",{p_date:today}).then(({data,error})=>{
      if(!alive)return;
      if(error){setSummaryError("Reconciled dashboard totals are temporarily unavailable.");setSummary(null);}
      else{setSummary(data||{});setSummaryError("");}
    });
    return()=>{alive=false};
  },[today,sales.length]);

  const top=useMemo(()=>(summary?.top_products||[]).map(r=>[r.label,Number(r.quantity||0)]),[summary]);

  if (loadingData) return <div className="panel">Loading Supabase data...</div>;

  return <div>
    <div className="page-heading"><div><h2>Dashboard</h2><p>{profile?.shop_name} · live cloud data</p></div></div>
    {dataError&&<div className="purchase-message error">{dataError}</div>}
    {summaryError&&<div className="purchase-message error">{summaryError}</div>}

    <div className="stats-grid">
      <div className="stat-card"><span>Today's Net Sales</span><strong>{money.format(summary?.sales||0)}</strong></div>
      <div className="stat-card"><span>Bills Today</span><strong>{summary?.bills||0}</strong></div>
      <div className="stat-card"><span>Low Stock</span><strong>{summary?.low_stock_count||0}</strong></div>
      <div className="stat-card"><span>Current Inventory Value</span><strong>{money.format(summary?.inventory_cost||0)}</strong><small>FIFO landed cost</small></div>
    </div>

    <div className="dashboard-grid">
      <section className="panel"><h3>Recent Sales</h3>{sales.slice(0,8).map((s)=><div key={s.id} className="list-row"><span>{s.invoiceNumber}{s.status==="RETURNED"?" · RETURNED":s.status==="PARTIAL_RETURN"?" · PARTIAL RETURN":""}</span><strong>{money.format(s.grandTotal)}</strong></div>)}</section>
      <section className="panel"><h3>Daily Reconciliation</h3><div className="list-row"><span>Gross invoice sales</span><strong>{money.format(summary?.gross_sales||0)}</strong></div><div className="list-row"><span>Approved returns</span><strong>-{money.format(summary?.returns||0)}</strong></div><div className="list-row"><span>Net sales</span><strong>{money.format(summary?.sales||0)}</strong></div></section>
      <section className="panel"><h3>Top Selling Products</h3>{top.map(([name,qty])=><div key={name} className="list-row"><span>{name}</span><strong>{qty}</strong></div>)}</section>
    </div>
  </div>;
}
