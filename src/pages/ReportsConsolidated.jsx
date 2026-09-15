import SortableTable from "../components/ui/SortableTable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, LineChartCard } from "../components/charts/BusinessCharts";
import { indiaDateKey, indiaMonthStartKey } from "../lib/businessDate";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2});
const dayLabel=(date)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
const PAGE_SIZE=500;

function csvEscape(value){const s=String(value??"");return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function downloadCsv(name,headers,rows){
  const csv=[headers.join(","),...rows.map(r=>r.map(csvEscape).join(","))].join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name;a.click();
  URL.revokeObjectURL(url);
}
async function fetchAllRpc(name,baseParams){
  const rows=[];let offset=0;
  for(;;){
    const{data,error}=await supabase.rpc(name,{...baseParams,p_offset:offset,p_limit:PAGE_SIZE});
    if(error)throw error;
    const batch=data||[];rows.push(...batch);
    if(batch.length<PAGE_SIZE)return rows;
    offset+=PAGE_SIZE;
    if(offset>200000)throw new Error(`${name} exceeded the report safety limit.`);
  }
}

export default function ReportsConsolidated(){
  const{products,getStock}=useShop();
  const[from,setFrom]=useState(indiaMonthStartKey());
  const[to,setTo]=useState(indiaDateKey());
  const[salesRows,setSalesRows]=useState([]);
  const[purchaseRows,setPurchaseRows]=useState([]);
  const[expenses,setExpenses]=useState([]);
  const[analytics,setAnalytics]=useState({});
  const[message,setMessage]=useState("");
  const[loading,setLoading]=useState(false);
  const requestSeq=useRef(0);

  const load=useCallback(async()=>{
    if(!from||!to||to<from){setMessage("Choose a valid report date range.");return}
    const seq=++requestSeq.current;setLoading(true);setMessage("");
    try{
      const[a,s,p,e]=await Promise.all([
        supabase.rpc("business_analytics",{p_from:from,p_to:to}),
        fetchAllRpc("report_sales_page",{p_from:from,p_to:to}),
        fetchAllRpc("report_purchases_page",{p_from:from,p_to:to}),
        fetchAllRpc("report_expenses_page",{p_from:from,p_to:to}),
      ]);
      if(seq!==requestSeq.current)return;
      if(a.error)throw a.error;
      const next=a.data||{};
      const notices=[];
      const sum=(rows,key)=>rows.reduce((n,r)=>n+Number(r[key]||0),0);
      if(s.length!==Number(next.bills||0))notices.push(`Sales detail count ${s.length} does not match aggregate bill count ${next.bills||0}.`);
      if(Math.abs(sum(s,"discount")-Number(next.discounts||0))>0.01)notices.push("Sales detail discount total does not match aggregate discount.");
      if(Math.abs(sum(s,"grand_total")-Number(next.gross_sales||0))>0.01)notices.push("Sales detail invoice total does not match aggregate gross sales.");
      if(Math.abs(sum(p,"total")-Number(next.purchases||0))>0.01)notices.push("Purchase detail total does not match aggregate purchases.");
      if(Math.abs(sum(e,"amount")-Number(next.expenses||0))>0.01)notices.push("Expense detail total does not match aggregate expenses.");
      if(Math.abs(Number(next.payment_gap||0))>0.01)notices.push(`Payment mix differs from net sales by ${money.format(next.payment_gap||0)}.`);
      setAnalytics(next);setSalesRows(s);setPurchaseRows(p);setExpenses(e);
      setMessage(notices.join(" "));
    }catch(err){
      if(seq===requestSeq.current)setMessage(err?.message||"Unable to load reconciled report.");
    }finally{
      if(seq===requestSeq.current)setLoading(false);
    }
  },[from,to]);

  useEffect(()=>{void load()},[load]);

  const trend=useMemo(()=>(analytics.trend||[]).map(r=>({label:dayLabel(r.date),value:Number(r.value||0)})),[analytics.trend]);
  const paymentMix=useMemo(()=>(analytics.payment_mix||[]).map(r=>({label:String(r.label||"OTHER").replaceAll("_"," "),value:Number(r.value||0)})).filter(r=>r.value!==0),[analytics.payment_mix]);

  async function exportAccountant(){
    setMessage("Preparing accountant ledger export...");
    const{data,error}=await supabase.rpc("accountant_export_v2",{p_from:from,p_to:to});
    if(error){setMessage(error.message||"Unable to prepare accountant export.");return}
    const rows=(data||[]).sort((a,b)=>String(a.voucher_date).localeCompare(String(b.voucher_date))||String(a.voucher_number).localeCompare(String(b.voucher_number)));
    downloadCsv(`tally-ready-ledger-${from}-${to}.csv`,
      ["Date","Voucher Type","Voucher Number","Ledger Name","Debit","Credit","Reference","Narration","Source Type","Source ID"],
      rows.map(r=>[r.voucher_date,r.voucher_type,r.voucher_number,r.ledger_name,r.debit,r.credit,r.reference,r.narration,r.source_type,r.source_id]));
    setMessage("Accountant/Tally-ready ledger CSV downloaded. Approved returns are included as balanced Sales Return vouchers.");
  }

  return <div>
    <PageHeader title="Reports & Exports" subtitle="Single-source financial reporting using India business dates, approved returns and FIFO landed cost."/>
    <div className="panel filter-bar">
      <label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label>
      <label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label>
      <button className="primary-button" onClick={load} disabled={loading}>{loading?"Refreshing...":"Refresh"}</button>
      <span className="muted-text">Changing either date refreshes the whole report automatically.</span>
    </div>

    {message?<div className={`purchase-message${message.includes("does not match")||message.includes("differs")?" error":""}`}>{message}</div>:null}

    <div className="metric-grid four" style={{marginTop:16}}>
      <div className="metric-card metric-accent-blue"><span>Net Sales</span><strong>{money.format(analytics.revenue||0)}</strong><small>Invoice discounts and approved returns already reflected</small></div>
      <div className="metric-card metric-accent-indigo"><span>Purchases</span><strong>{money.format(analytics.purchases||0)}</strong><small>Received invoice value · landed {money.format(analytics.purchases_landed||0)}</small></div>
      <div className="metric-card metric-accent-orange"><span>Expenses</span><strong>{money.format(analytics.expenses||0)}</strong><small>Active expenses in selected period</small></div>
      <div className="metric-card metric-accent-green"><span>Current Inventory Cost</span><strong>{money.format(analytics.inventory_cost||0)}</strong><small>Current on-hand FIFO landed cost · not historical as-of value</small></div>
    </div>

    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <LineChartCard title="Sales Trend" subtitle="Daily net sales after approved returns" data={trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="All tenders after approved refunds" data={paymentMix} formatValue={(v)=>money.format(v)} centerLabel="Net Sales"/>
    </div>

    <section className="panel" style={{marginTop:16}}>
      <h3>Export Center</h3>
      <div className="button-row wrap">
        <button className="primary-button" onClick={exportAccountant}>Export Accountant / Tally-ready Ledger</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`sales-${from}-${to}.csv`,["Invoice","Business Date","Payment","Subtotal","Discount","Total","Status"],salesRows.map(s=>[s.invoice_number,s.business_date,s.payment_method,s.subtotal,s.discount,s.grand_total,s.status]))}>Export Sales CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`purchases-${from}-${to}.csv`,["Purchase","Invoice","Date","Supplier","Units","Invoice Total","Landed Total","Status"],purchaseRows.map(p=>[p.purchase_number,p.invoice_number,p.invoice_date,p.supplier_name,p.total_units,p.total,p.total_landed_cost,p.status]))}>Export Purchases CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`inventory-${indiaDateKey()}.csv`,["SKU","Barcode","Product","Category","Stock","Base Purchase Price","Selling Price"],products.map(p=>[p.sku,p.barcode,p.name,p.category,getStock(p.id),p.purchasePrice,p.price]))}>Export Inventory CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`expenses-${from}-${to}.csv`,["Date","Category","Description","Method","Amount","Status"],expenses.map(e=>[e.expense_date,e.category,e.description,e.payment_method,e.amount,e.status]))}>Export Expenses CSV</button>
      </div>
      <p className="muted-text">Sales, purchases and expenses are loaded directly from server-side paginated report RPCs, so exports are not limited by the browser transaction cache.</p>
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Sales Summary</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Invoice</th><th>Business Date</th><th>Payment</th><th>Status</th><th>Discount</th><th>Total</th></tr></thead><tbody>{salesRows.map(s=><tr key={s.id}><td>{s.invoice_number}</td><td>{s.business_date}</td><td>{s.payment_method||"-"}</td><td>{String(s.status||"COMPLETED").replaceAll("_"," ")}</td><td>{money.format(s.discount||0)}</td><td>{money.format(s.grand_total||0)}</td></tr>)}</tbody><tfoot><tr><td></td><td><strong>Totals</strong></td><td><strong>{analytics.bills||0} bills</strong></td><td></td><td></td><td><strong>{money.format(analytics.discounts||0)}</strong></td><td><strong>{money.format(analytics.gross_sales||0)}</strong></td></tr></tfoot></SortableTable></div>
      <p className="muted-text" style={{marginTop:10}}>Invoice footer total is gross billed value after invoice discounts. Approved returns {money.format(analytics.returns||0)} are deducted in Net Sales above.</p>
    </section>
  </div>
}
