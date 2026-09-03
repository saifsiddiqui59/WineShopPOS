import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDateIN } from "../lib/dateFormat";
import { HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function PurchaseIntelligence(){
  const{products}=useShop();
  const[productId,setProductId]=useState("");
  const[comparison,setComparison]=useState([]);
  const[suppliers,setSuppliers]=useState([]);
  const[scores,setScores]=useState([]);
  const[coach,setCoach]=useState([]);
  const[history,setHistory]=useState([]);
  const[loading,setLoading]=useState(false);
  const[message,setMessage]=useState("");
  const selected=useMemo(()=>products.find((p)=>p.id===productId),[products,productId]);

  async function loadSupplierIntelligence(){
    const[a,b,c]=await Promise.all([
      supabase.rpc("supplier_intelligence",{p_days:180}),
      supabase.rpc("supplier_performance_scores",{p_days:180}),
      supabase.rpc("purchase_coach_v2",{p_days:30})
    ]);
    if(a.error||b.error||c.error)setMessage("Unable to load all purchase intelligence.");
    if(!a.error)setSuppliers(a.data||[]);
    if(!b.error)setScores(b.data||[]);
    if(!c.error)setCoach(c.data||[]);
  }

  useEffect(()=>{loadSupplierIntelligence()},[]);

  async function inspectProduct(id){
    setProductId(id);setComparison([]);setHistory([]);setMessage("");
    if(!id)return;
    setLoading(true);
    const[compare,price]=await Promise.all([
      supabase.rpc("supplier_price_comparison",{p_product_id:id,p_days:180}),
      supabase.rpc("purchase_price_history",{p_product_id:id,p_limit:24})
    ]);
    if(compare.error||price.error)setMessage("Unable to load purchase intelligence for this product.");
    else{setComparison(compare.data||[]);setHistory(price.data||[])}
    setLoading(false);
  }

  const latest=history[0],previous=history[1];
  const priceDiff=latest&&previous?Number(latest.purchase_price)-Number(previous.purchase_price):null;
  const pct=previous&&Number(previous.purchase_price)>0?priceDiff/Number(previous.purchase_price)*100:null;
  const marginPct=selected?.price>0&&latest?(selected.price-Number(latest.purchase_price))/selected.price*100:null;
  const priceTrend=useMemo(()=>history.slice().reverse().map((r)=>({label:r.invoice_date||"Purchase",value:Number(r.purchase_price||0)})),[history]);
  const supplierChart=useMemo(()=>comparison.slice().sort((a,b)=>Number(a.avg_price||0)-Number(b.avg_price||0)).map((r)=>({label:r.supplier_name||"Supplier",value:Number(r.avg_price||0)})),[comparison]);

  return <div>
    <PageHeader title="Smart Purchase Intelligence" subtitle="OCR review, supplier score, landed-cost trends, overbuy warnings and reorder coaching." tier="PRO"/>
    {message?<div className="purchase-message">{message}</div>:null}

    <section className="panel intelligence-filter">
      <label>Analyze Product<select value={productId} onChange={(e)=>inspectProduct(e.target.value)}><option value="">Select product</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    </section>

    {loading?<LoadingState label="Analyzing purchase history..."/>:null}

    {selected&&!loading?<>
      <div className="metric-grid four" style={{marginTop:16}}>
        <div className="metric-card"><span>Current Selling Price</span><strong>{money.format(selected.price)}</strong></div>
        <div className="metric-card"><span>Latest Purchase Price</span><strong>{latest?money.format(latest.purchase_price):"No history"}</strong></div>
        <div className="metric-card"><span>Latest Change</span><strong>{priceDiff===null?"-":`${priceDiff>=0?"+":""}${money.format(priceDiff)}${pct===null?"":` (${pct.toFixed(2)}%)`}`}</strong></div>
        <div className="metric-card"><span>Estimated Gross Margin</span><strong>{marginPct===null?"-":`${marginPct.toFixed(2)}%`}</strong></div>
      </div>
      <div className="dashboard-chart-grid" style={{marginTop:16}}>
        <LineChartCard title="Purchase Price Trend" subtitle="Historical unit purchase cost for the selected SKU" data={priceTrend} formatValue={(v)=>money.format(v)}/>
        <HorizontalBarChartCard title="Supplier Average Price" subtitle="Lower bars indicate more competitive historical unit cost" data={supplierChart} formatValue={(v)=>money.format(v)}/>
      </div>
      <div className="settings-grid" style={{marginTop:16}}>
        <section className="panel"><h3>Supplier Price Comparison</h3>{comparison.length===0?<EmptyState title="No supplier history yet" message="Receive this product from suppliers to build comparison history."/>:<div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Units</th><th>Avg</th><th>Min</th><th>Max</th><th>Last</th></tr></thead><tbody>{comparison.map((r)=><tr key={r.supplier_id}><td>{r.supplier_name||"Supplier"}</td><td>{r.purchase_count}</td><td>{r.total_units}</td><td>{money.format(r.avg_price)}</td><td>{money.format(r.min_price)}</td><td>{money.format(r.max_price)}</td><td>{money.format(r.last_price)}</td></tr>)}</tbody></SortableTable></div>}</section>
        <section className="panel"><h3>Recent Price History</h3>{history.length===0?<EmptyState title="No price history" message="Purchase receipts will populate this timeline."/>:<div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Price</th></tr></thead><tbody>{history.slice(0,10).map((r,i)=><tr key={`${r.invoice_date||i}-${r.invoice_date}`}><td>{formatDateIN(r.invoice_date)}</td><td>{r.supplier_name||"-"}</td><td>{money.format(r.purchase_price)}</td></tr>)}</tbody></SortableTable></div>}</section>
      </div>
    </>:null}

    <section className="panel" style={{marginTop:16}}>
      <h3>Supplier Performance Score · Last 180 Days</h3>
      {scores.length===0?<EmptyState title="No supplier score yet" message="Purchases and purchase orders will build the score."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Supplier</th><th>Score</th><th>Fill</th><th>On Time</th><th>Returns</th><th>Price Variation</th><th>Spend</th><th>Outstanding</th></tr></thead><tbody>{scores.map((r)=><tr key={r.supplier_id}><td>{r.supplier_name}</td><td><strong>{Number(r.score).toFixed(1)}/100</strong></td><td>{Number(r.fill_rate).toFixed(1)}%</td><td>{Number(r.on_time_rate).toFixed(1)}%</td><td>{Number(r.return_rate).toFixed(1)}%</td><td>{Number(r.price_variation).toFixed(1)}%</td><td>{money.format(r.total_spend)}</td><td>{money.format(r.outstanding)}</td></tr>)}</tbody></table></div>}
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Purchase Coach</h3>
      <p className="muted-text">Uses 30-day demand, current stock, recent supplier cost and margin to flag reorder, overbuy/no-movement and margin risk.</p>
      {coach.length===0?<EmptyState title="No purchase action needed" message="No configured reorder/overbuy/margin condition is currently triggered."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Priority</th><th>Product</th><th>Action</th><th>Stock</th><th>Days Cover</th><th>Recommended Qty</th><th>Best Supplier</th><th>Recent Cost</th><th>Margin</th><th>Why</th></tr></thead><tbody>{coach.map((r)=><tr key={`${r.product_id}-${r.recommendation_type}`}><td><StatusBadge status={r.priority}/></td><td>{r.product_name}</td><td>{r.recommendation_type.replaceAll("_"," ")}</td><td>{r.current_stock}</td><td>{r.days_cover??"-"}</td><td>{r.recommended_quantity}</td><td>{r.best_supplier_name||"-"}</td><td>{r.best_recent_cost==null?"-":money.format(r.best_recent_cost)}</td><td>{r.estimated_margin_percent==null?"-":`${Number(r.estimated_margin_percent).toFixed(1)}%`}</td><td>{r.message}</td></tr>)}</tbody></table></div>}
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Supplier Intelligence · Last 180 Days</h3>
      {suppliers.length===0?<EmptyState title="No supplier activity yet" message="Purchases and supplier payments will build reliability and price history."/>:<div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Purchase Total</th><th>Returns</th><th>Outstanding</th><th>Ordered</th><th>Received</th><th>Variance</th></tr></thead><tbody>{suppliers.map((r)=><tr key={r.supplier_id}><td>{r.supplier_name}</td><td>{r.purchase_count}</td><td>{money.format(r.purchase_total)}</td><td>{money.format(r.return_total)}</td><td>{money.format(r.outstanding)}</td><td>{r.po_ordered}</td><td>{r.po_received}</td><td>{r.receive_variance}</td></tr>)}</tbody></SortableTable></div>}
    </section>

  </div>
}
