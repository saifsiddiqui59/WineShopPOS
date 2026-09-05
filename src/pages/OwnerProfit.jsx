import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ColumnChartCard, HorizontalBarChartCard } from "../components/charts/BusinessCharts";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
export default function OwnerProfit(){
  const now=new Date();
  const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));
  const[to,setTo]=useState(now.toISOString().slice(0,10));
  const[s,setS]=useState({});const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");
  async function load(){const[a,b]=await Promise.all([supabase.rpc("owner_center_summary",{p_from:from,p_to:to}),supabase.rpc("profit_by_product",{p_from:from,p_to:to})]);if(a.error||b.error)setMsg("Unable to calculate profit intelligence.");else{setS(a.data||{});setRows(b.data||[])}}
  useEffect(()=>{load()},[]);
  const bridge=useMemo(()=>[
    {label:"Revenue",value:Number(s.revenue||0)},
    {label:"COGS",value:Number(s.cogs||0)},
    {label:"Gross Profit",value:Number(s.gross_profit||0)},
    {label:"Expenses",value:Number(s.expenses||0)},
    {label:"Operating",value:Number(s.operating_profit||0)},
  ],[s]);
  const topProfit=useMemo(()=>rows.slice().sort((a,b)=>Number(b.gross_profit||0)-Number(a.gross_profit||0)).slice(0,7).map(r=>({label:r.product_name,value:Number(r.gross_profit||0)})),[rows]);
  return <div><PageHeader title="Profit & Business Intelligence" subtitle="Revenue − COGS = gross profit; gross profit − operating expenses = operating profit." tier="PRO"/>
    <div className="panel filter-bar"><label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}
    <div className="metric-grid four" style={{marginTop:16}}><div className="metric-card metric-accent-blue"><span>Revenue</span><strong>{money.format(s.revenue||0)}</strong></div><div className="metric-card metric-accent-orange"><span>COGS</span><strong>{money.format(s.cogs||0)}</strong></div><div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(s.gross_profit||0)}</strong></div><div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(s.operating_profit||0)}</strong></div></div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}><ColumnChartCard title="Profit Bridge" subtitle="Power BI-style financial comparison for the selected period" data={bridge} formatValue={(v)=>money.format(v)}/><HorizontalBarChartCard title="Top SKU Gross Profit" subtitle="Highest gross profit contribution" data={topProfit} formatValue={(v)=>money.format(v)}/></div>
    <section className="panel" style={{marginTop:16}}><h3>SKU Profitability</h3>{rows.length===0?<EmptyState title="No profitability data" message="Completed sales with cost snapshots are required."/>:<div className="data-table-wrapper"><SortableTable className="data-table" resizeKey="owner-profit-sku-profitability-v1"><thead><tr><th>Product</th><th>Qty</th><th>Revenue</th><th>COGS</th><th>Gross Profit</th><th>Margin</th></tr></thead><tbody>{rows.map(r=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.quantity}</td><td>{money.format(r.revenue)}</td><td>{money.format(r.cogs)}</td><td><strong>{money.format(r.gross_profit)}</strong></td><td>{Number(r.margin_pct||0).toFixed(2)}%</td></tr>)}</tbody></SortableTable></div>}</section><p className="muted-text">Historical sales created before cost snapshots were introduced may have incomplete COGS. This screen reports only what trusted stored data supports.</p></div>;
}
