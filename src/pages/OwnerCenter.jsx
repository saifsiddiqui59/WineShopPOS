import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money = new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2});
const dayLabel=(date)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"});

export default function OwnerCenter() {
  const { profile } = useAuth();
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
    else if(Math.abs(Number(s.data?.payment_gap||0))>0.01)setMessage(`Financial reconciliation requires review: payment mix gap ${money.format(s.data.payment_gap)}.`);
    else setMessage("");
    setSummary(s.data||{});setRecommendations(r.data||[]);setExceptions(e.data||[]);
  }
  useEffect(()=>{void load()},[]);

  const chartData=useMemo(()=>({
    trend:(summary.trend||[]).map(r=>({label:dayLabel(r.date),value:Number(r.value||0)})),
    payments:(summary.payment_mix||[]).map(r=>({label:String(r.label||"OTHER").replaceAll("_"," "),value:Number(r.value||0)})).filter(r=>r.value!==0),
    topProducts:(summary.top_products||[]).map(r=>({label:r.label||"Product",value:Number(r.value||0)})),
  }),[summary]);

  return <div className="dashboard-page">
    <PageHeader title="Owner Control Center" subtitle={`What happened, what needs attention and what to do next · ${profile?.shop_name||"Current Shop"}`} tier="PRO"/>
    {message?<div className="purchase-message">{message}</div>:null}

    <div className="metric-grid four executive-metrics">
      <div className="metric-card metric-accent-blue"><span>Net Revenue · 30 Days</span><strong>{money.format(summary.revenue||0)}</strong><small>{summary.bills||0} bills · {money.format(summary.returns||0)} approved returns</small></div>
      <div className="metric-card metric-accent-indigo"><span>Gross Profit</span><strong>{money.format(summary.gross_profit||0)}</strong><small>After FIFO Cost of Goods Sold</small></div>
      <div className="metric-card metric-accent-green"><span>Operating Profit</span><strong>{money.format(summary.operating_profit||0)}</strong><small>After operating expenses</small></div>
      <div className="metric-card metric-accent-orange"><span>Current Inventory Cost</span><strong>{money.format(summary.inventory_cost||0)}</strong><small>Current on-hand FIFO landed cost</small></div>
    </div>

    <div className="dashboard-chart-grid primary" style={{marginTop:16}}>
      <LineChartCard title="30-Day Sales Trend" subtitle="Daily net sales after approved returns" data={chartData.trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="All tenders after approved refunds" data={chartData.payments} formatValue={(v)=>money.format(v)} centerLabel="Net Sales"/>
    </div>
    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <HorizontalBarChartCard title="Top Products by Sales" subtitle="Net product sales after discounts and approved returns" data={chartData.topProducts} formatValue={(v)=>money.format(v)}/>
      <section className="chart-card attention-card">
        <div className="chart-heading"><div><h3>Business Attention</h3><p>Live owner-level operating signals</p></div></div>
        <div className="attention-metrics">
          <div><span>Expenses</span><strong>{money.format(summary.expenses||0)}</strong></div>
          <div><span>Total Discount</span><strong>{money.format(summary.discounts||0)}</strong></div>
          <div><span>Low Stock</span><strong>{summary.low_stock_count||0}</strong></div>
          <div><span>Cash Variance</span><strong>{money.format(summary.cash_variance||0)}</strong></div>
          <div><span>Requires Review</span><strong>{exceptions.length}</strong></div>
        </div>
        <p className="muted-text" style={{marginTop:10}}>Sales and profit values already account for discounts and approved returns. Do not deduct them again.</p>
      </section>
    </div>

    <div className="settings-grid" style={{marginTop:16}}>
      <section className="panel"><div className="section-row"><h3>What Should I Do Next?</h3><Link to="/owner/recommendations">View all</Link></div>{recommendations.slice(0,6).map((r,i)=><Link to={r.action_path||"/owner"} className="recommendation-row" key={`${r.recommendation_type}-${i}`}><div><strong>{r.title}</strong><p>{r.message}</p></div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span></Link>)}</section>
      <section className="panel"><div className="section-row"><h3>Requires Review</h3><Link to="/owner/exceptions">Open Loss & Exceptions</Link></div>{exceptions.slice(0,6).map((r,i)=><div className="recommendation-row" key={`${r.entity_id}-${i}`}><div><strong>{r.exception_type.replaceAll("_"," ")}</strong><p>{r.summary}</p></div><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></div>)}</section>
    </div>
    <div className="quick-action-grid"><Link className="quick-action" to="/owner/profit"><strong>Profit Intelligence</strong><span>Net revenue → FIFO COGS → expenses → operating profit</span></Link><Link className="quick-action" to="/inventory/intelligence"><strong>Inventory Health</strong><span>Dead stock, stockout risk and return-adjusted reordering</span></Link><Link className="quick-action" to="/purchasing/intelligence"><strong>Purchase Intelligence</strong><span>Supplier pricing and landed-cost margin impact</span></Link><Link className="quick-action" to="/owner/share"><strong>Share with Owner</strong><span>Prepare a reconciled WhatsApp operating summary</span></Link></div>
  </div>;
}
