import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 });
const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day:"numeric", month:"short" });

export default function OwnerCenter() {
  const { profile } = useAuth();
  const { sales, products } = useShop();
  const [summary,setSummary]=useState({});
  const [recommendations,setRecommendations]=useState([]);
  const [exceptions,setExceptions]=useState([]);
  const [message,setMessage]=useState("");

  async function load(){
    const[s,r,e]=await Promise.all([
      supabase.rpc("owner_center_summary",{}),
      supabase.rpc("owner_recommendations",{p_history_days:30}),
      supabase.rpc("loss_control_exceptions_v3",{p_days:30}),
    ]);
    if(s.error||r.error||e.error)setMessage("Unable to load all Owner Center insights.");
    setSummary(s.data||{});setRecommendations(r.data||[]);setExceptions(e.data||[]);
  }
  useEffect(()=>{load()},[]);

  const chartData = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0);
    const recent = sales.filter((sale)=>sale.status!=="VOID" && new Date(sale.createdAt)>=start);
    const dayMap = new Map();
    for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()+i);dayMap.set(d.toISOString().slice(0,10),0);}
    const pay = { CASH:0, UPI:0, CARD:0 };
    const productMap = new Map();
    recent.forEach((sale)=>{
      const key=sale.createdAt?.slice(0,10); if(dayMap.has(key)) dayMap.set(key,(dayMap.get(key)||0)+Number(sale.grandTotal||0));
      const method=String(sale.paymentMethod||"OTHER").toUpperCase(); pay[method]=(pay[method]||0)+Number(sale.grandTotal||0);
      (sale.items||[]).forEach((item)=>{const current=productMap.get(item.productId)||{label:item.productName||"Product",value:0};current.value+=Number(item.lineTotal||0);productMap.set(item.productId,current);});
    });
    return {
      trend:[...dayMap.entries()].map(([date,value])=>({label:dayLabel(date),value})),
      payments:Object.entries(pay).filter(([,value])=>value>0).map(([label,value])=>({label,value})),
      topProducts:[...productMap.values()].sort((a,b)=>b.value-a.value).slice(0,7),
      activeProducts:products.filter((p)=>p.active).length,
    };
  },[sales,products]);

  return <div className="dashboard-page">
    <PageHeader title="Owner Control Center" subtitle={`What happened, what needs attention and what to do next · ${profile?.shop_name||"Current Shop"}`} tier="PRO"/>
    {message?<div className="purchase-message">{message}</div>:null}

    <div className="metric-grid four executive-metrics">
      <div className="metric-card metric-accent-blue"><span>Revenue · 30 Days</span><strong>{money.format(summary.revenue||0)}</strong><small>{summary.bills||0} bills</small></div>
      <div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(summary.gross_profit||0)}</strong><small>After cost of goods</small></div>
      <div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(summary.operating_profit||0)}</strong><small>After expenses</small></div>
      <div className="metric-card metric-accent-orange"><span>Inventory Cost</span><strong>{money.format(summary.inventory_cost||0)}</strong><small>{chartData.activeProducts} active products</small></div>
    </div>

    <div className="dashboard-chart-grid primary" style={{marginTop:16}}>
      <LineChartCard title="30-Day Sales Trend" subtitle="Daily completed sales value" data={chartData.trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="Cash, UPI and Card share" data={chartData.payments} formatValue={(v)=>money.format(v)} centerLabel="Sales"/>
    </div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <HorizontalBarChartCard title="Top Products by Sales" subtitle="Highest product sales value in the current 30-day window" data={chartData.topProducts} formatValue={(v)=>money.format(v)}/>
      <section className="chart-card attention-card"><div className="chart-heading"><div><h3>Business Attention</h3><p>Live owner-level operating signals</p></div></div><div className="attention-metrics"><div><span>Expenses</span><strong>{money.format(summary.expenses||0)}</strong></div><div><span>Low Stock</span><strong>{summary.low_stock_count||0}</strong></div><div><span>Cash Variance</span><strong>{money.format(summary.cash_variance||0)}</strong></div><div><span>Requires Review</span><strong>{exceptions.length}</strong></div></div></section>
    </div>

    <div className="settings-grid" style={{marginTop:16}}>
      <section className="panel"><div className="section-row"><h3>What Should I Do Next?</h3><Link to="/owner/recommendations">View all</Link></div>{recommendations.slice(0,6).map((r,i)=><Link to={r.action_path||"/owner"} className="recommendation-row" key={`${r.recommendation_type}-${i}`}><div><strong>{r.title}</strong><p>{r.message}</p></div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span></Link>)}</section>
      <section className="panel"><div className="section-row"><h3>Requires Review</h3><Link to="/owner/exceptions">Open Loss & Exceptions</Link></div>{exceptions.slice(0,6).map((r,i)=><div className="recommendation-row" key={`${r.entity_id}-${i}`}><div><strong>{r.exception_type.replaceAll("_"," ")}</strong><p>{r.summary}</p></div><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></div>)}</section>
    </div>
    <div className="quick-action-grid"><Link className="quick-action" to="/owner/profit"><strong>Profit Intelligence</strong><span>Revenue → COGS → expenses → operating profit</span></Link><Link className="quick-action" to="/inventory/intelligence"><strong>Inventory Health</strong><span>Dead stock, stockout risk and reordering</span></Link><Link className="quick-action" to="/purchasing/intelligence"><strong>Purchase Intelligence</strong><span>OCR, supplier pricing and margin impact</span></Link><Link className="quick-action" to="/owner/share"><strong>Share with Owner</strong><span>Prepare a WhatsApp operating summary</span></Link></div>
  </div>;
}
