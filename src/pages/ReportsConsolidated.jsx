import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, LineChartCard } from "../components/charts/BusinessCharts";
import { indiaDateKey, indiaMonthStartKey } from "../lib/businessDate";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
const money2=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2});
const dayLabel=(date)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"});

function csvEscape(value){const s=String(value??"");return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function downloadCsv(name,headers,rows){
  const csv=[headers.join(","),...rows.map(r=>r.map(csvEscape).join(","))].join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=name;a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsConsolidated(){
  const{sales,purchases,products,getStock,refreshAll}=useShop();
  const[from,setFrom]=useState(indiaMonthStartKey());
  const[to,setTo]=useState(indiaDateKey());
  const[expenses,setExpenses]=useState([]);
  const[analytics,setAnalytics]=useState({});
  const[message,setMessage]=useState("");

  async function load(){
    const[shopRefresh,analyticsResult,expenseResult]=await Promise.all([
      refreshAll(),
      supabase.rpc("business_analytics",{p_from:from,p_to:to}),
      supabase.from("expenses").select("expense_date,amount,description,payment_method,status,expense_categories(name)").gte("expense_date",from).lte("expense_date",to).order("expense_date",{ascending:false}),
    ]);
    const notices=[];
    if(!shopRefresh?.ok)notices.push(shopRefresh?.message||"Unable to refresh shop transactions for report.");
    else if(shopRefresh?.partial)notices.push(shopRefresh.message);
    if(analyticsResult.error)notices.push("Unable to calculate reconciled report totals.");else setAnalytics(analyticsResult.data||{});
    if(expenseResult.error)notices.push("Unable to load expenses for report.");else setExpenses(expenseResult.data||[]);
    setMessage(notices.join(" "));
  }
  useEffect(()=>{load()},[]);

  const fs=sales.filter(s=>{const key=s.createdAt?indiaDateKey(new Date(s.createdAt)):"";return key>=from&&key<=to&&s.status!=="VOID";});
  const fp=purchases.filter(p=>p.invoiceDate>=from&&p.invoiceDate<=to);
  const invoiceDiscountTotal=fs.reduce((a,s)=>a+Number(s.discount||0),0);
  const invoiceTotal=fs.reduce((a,s)=>a+Number(s.grandTotal||0),0);

  const trend=useMemo(()=>(analytics.trend||[]).map(r=>({label:dayLabel(r.date),value:Number(r.value||0)})),[analytics.trend]);
  const paymentMix=useMemo(()=>(analytics.payment_mix||[]).map(r=>({label:String(r.label||"OTHER"),value:Number(r.value||0)})).filter(r=>r.value!==0),[analytics.payment_mix]);

  async function exportAccountant(){
    setMessage("Preparing accountant ledger export...");
    const{data,error}=await supabase.rpc("accountant_export_v2",{p_from:from,p_to:to});
    if(error){setMessage(error.message||"Unable to prepare accountant export.");return}

    const rows=(data||[]).sort((a,b)=>
      String(a.voucher_date).localeCompare(String(b.voucher_date))||
      String(a.voucher_number).localeCompare(String(b.voucher_number))
    );

    downloadCsv(
      `tally-ready-ledger-${from}-${to}.csv`,
      ["Date","Voucher Type","Voucher Number","Ledger Name","Debit","Credit","Reference","Narration","Source Type","Source ID"],
      rows.map(r=>[
        r.voucher_date,r.voucher_type,r.voucher_number,r.ledger_name,
        r.debit,r.credit,r.reference,r.narration,r.source_type,r.source_id
      ])
    );
    setMessage("Accountant/Tally-ready ledger CSV downloaded. Approved returns are included as balanced Sales Return vouchers. Ledger-name mapping should still be confirmed by your accountant before import.");
  }

  return <div>
    <PageHeader title="Reports & Exports" subtitle="Reconciled operational reporting plus balanced accountant/Tally-ready ledger exports."/>
    <div className="panel filter-bar">
      <label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label>
      <label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label>
      <button className="primary-button" onClick={load}>Refresh</button>
    </div>

    {message?<div className="purchase-message">{message}</div>:null}

    <div className="metric-grid four" style={{marginTop:16}}>
      <div className="metric-card metric-accent-blue"><span>Net Sales</span><strong>{money.format(analytics.revenue||0)}</strong><small>After approved returns</small></div>
      <div className="metric-card metric-accent-indigo"><span>Purchases</span><strong>{money.format(analytics.purchases||0)}</strong><small>Received purchases only</small></div>
      <div className="metric-card metric-accent-orange"><span>Expenses</span><strong>{money.format(analytics.expenses||0)}</strong><small>Active expenses</small></div>
      <div className="metric-card metric-accent-green"><span>Inventory Cost</span><strong>{money.format(analytics.inventory_cost||0)}</strong><small>Remaining FIFO landed cost</small></div>
    </div>

    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <LineChartCard title="Sales Trend" subtitle="Net sales after approved returns" data={trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="Net payment distribution after refunds" data={paymentMix} formatValue={(v)=>money.format(v)} centerLabel="Net Sales"/>
    </div>

    <section className="panel" style={{marginTop:16}}>
      <h3>Export Center</h3>
      <div className="button-row wrap">
        <button className="primary-button" onClick={exportAccountant}>Export Accountant / Tally-ready Ledger</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`sales-${from}-${to}.csv`,["Invoice","Date","Payment","Subtotal","Discount","Total","Status"],fs.map(s=>[s.invoiceNumber,s.createdAt,s.paymentMethod,s.subtotal,s.discount,s.grandTotal,s.status]))}>Export Sales CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`purchases-${from}-${to}.csv`,["Purchase","Invoice","Date","Supplier","Units","Total"],fp.map(p=>[p.purchaseNumber,p.invoiceNumber,p.invoiceDate,p.supplierName,p.totalUnits,p.total]))}>Export Purchases CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`inventory-${indiaDateKey()}.csv`,["SKU","Barcode","Product","Category","Stock","Purchase Price","Selling Price"],products.map(p=>[p.sku,p.barcode,p.name,p.category,getStock(p.id),p.purchasePrice,p.price]))}>Export Inventory CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`expenses-${from}-${to}.csv`,["Date","Category","Description","Method","Amount","Status"],expenses.map(e=>[e.expense_date,e.expense_categories?.name,e.description,e.payment_method,e.amount,e.status]))}>Export Expenses CSV</button>
      </div>
      <p className="muted-text">The accountant export is balanced and ledger-oriented. Approved refunds are exported as Sales Return vouchers. Exact Tally ledger names/configuration remain accountant-controlled.</p>
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Sales Summary</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead><tbody>{fs.map(s=><tr key={s.id}><td>{s.invoiceNumber}</td><td>{new Date(s.createdAt).toLocaleString("en-IN")}</td><td>{s.paymentMethod}</td><td>{money2.format(s.discount||0)}</td><td>{money2.format(s.grandTotal||0)}</td></tr>)}</tbody><tfoot><tr><td></td><td><strong>Totals</strong></td><td><strong>{fs.length} bills</strong></td><td></td><td><strong>{money2.format(invoiceDiscountTotal)}</strong></td><td><strong>{money2.format(invoiceTotal)}</strong></td></tr></tfoot></SortableTable></div>
      <p className="muted-text" style={{marginTop:10}}>Invoice footer totals are billed invoice totals. Approved returns {money2.format(analytics.returns||0)} are already deducted from Net Sales above.</p>
    </section>
  </div>
}
