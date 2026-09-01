import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import { DonutChartCard, LineChartCard } from "../components/charts/BusinessCharts";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

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
  const now=new Date();
  const[from,setFrom]=useState(new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));
  const[to,setTo]=useState(now.toISOString().slice(0,10));
  const[expenses,setExpenses]=useState([]);
  const[message,setMessage]=useState("");

  async function load(){
    const shopRefresh = await refreshAll();
    const{data,error}=await supabase.from("expenses").select("expense_date,amount,description,payment_method,status,expense_categories(name)").gte("expense_date",from).lte("expense_date",to).order("expense_date",{ascending:false});
    const notices=[];
    if(!shopRefresh?.ok) notices.push(shopRefresh?.message||"Unable to refresh shop transactions for report.");
    else if(shopRefresh?.partial) notices.push(shopRefresh.message);
    if(error) notices.push("Unable to load expenses for report."); else setExpenses(data||[]);
    setMessage(notices.join(" "));
  }
  useEffect(()=>{load()},[]);

  const fs=sales.filter(s=>s.createdAt?.slice(0,10)>=from&&s.createdAt?.slice(0,10)<=to&&s.status!=="VOID");
  const fp=purchases.filter(p=>p.invoiceDate>=from&&p.invoiceDate<=to);
  const salesTotal=fs.reduce((a,s)=>a+s.grandTotal,0);
  const purchaseTotal=fp.reduce((a,p)=>a+p.total,0);
  const expenseTotal=expenses.filter(e=>e.status==="ACTIVE").reduce((a,e)=>a+Number(e.amount||0),0);
  const inventoryValue=useMemo(()=>products.reduce((a,p)=>a+getStock(p.id)*p.purchasePrice,0),[products,getStock]);

  const trend=useMemo(()=>{
    const map=new Map();
    fs.forEach(s=>{const k=s.createdAt.slice(0,10);map.set(k,(map.get(k)||0)+Number(s.grandTotal||0))});
    return [...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({label:new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}),value}));
  },[fs]);

  const paymentMix=useMemo(()=>{
    const map={};
    fs.forEach(s=>{const k=String(s.paymentMethod||"OTHER").toUpperCase();map[k]=(map[k]||0)+Number(s.grandTotal||0)});
    return Object.entries(map).map(([label,value])=>({label,value}));
  },[fs]);

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
    setMessage("Accountant/Tally-ready ledger CSV downloaded. Ledger-name mapping should be confirmed by your accountant before import.");
  }

  return <div>
    <PageHeader title="Reports & Exports" subtitle="Operational reporting plus balanced accountant/Tally-ready ledger exports."/>
    <div className="panel filter-bar">
      <label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label>
      <label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label>
      <button className="primary-button" onClick={load}>Refresh</button>
    </div>

    {message?<div className="purchase-message">{message}</div>:null}

    <div className="metric-grid four" style={{marginTop:16}}>
      <div className="metric-card metric-accent-blue"><span>Sales</span><strong>{money.format(salesTotal)}</strong></div>
      <div className="metric-card metric-accent-indigo"><span>Purchases</span><strong>{money.format(purchaseTotal)}</strong></div>
      <div className="metric-card metric-accent-orange"><span>Expenses</span><strong>{money.format(expenseTotal)}</strong></div>
      <div className="metric-card metric-accent-green"><span>Inventory Cost</span><strong>{money.format(inventoryValue)}</strong></div>
    </div>

    <div className="dashboard-chart-grid" style={{marginTop:16}}>
      <LineChartCard title="Sales Trend" subtitle="Sales value across the selected report period" data={trend} formatValue={(v)=>money.format(v)}/>
      <DonutChartCard title="Payment Mix" subtitle="Selected-period payment distribution" data={paymentMix} formatValue={(v)=>money.format(v)} centerLabel="Sales"/>
    </div>

    <section className="panel" style={{marginTop:16}}>
      <h3>Export Center</h3>
      <div className="button-row wrap">
        <button className="primary-button" onClick={exportAccountant}>Export Accountant / Tally-ready Ledger</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`sales-${from}-${to}.csv`,["Invoice","Date","Payment","Subtotal","Discount","Total"],fs.map(s=>[s.invoiceNumber,s.createdAt,s.paymentMethod,s.subtotal,s.discount,s.grandTotal]))}>Export Sales CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`purchases-${from}-${to}.csv`,["Purchase","Invoice","Date","Supplier","Units","Total"],fp.map(p=>[p.purchaseNumber,p.invoiceNumber,p.invoiceDate,p.supplierName,p.totalUnits,p.total]))}>Export Purchases CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`inventory-${new Date().toISOString().slice(0,10)}.csv`,["SKU","Barcode","Product","Category","Stock","Purchase Price","Selling Price"],products.map(p=>[p.sku,p.barcode,p.name,p.category,getStock(p.id),p.purchasePrice,p.price]))}>Export Inventory CSV</button>
        <button className="secondary-button" onClick={()=>downloadCsv(`expenses-${from}-${to}.csv`,["Date","Category","Description","Method","Amount","Status"],expenses.map(e=>[e.expense_date,e.expense_categories?.name,e.description,e.payment_method,e.amount,e.status]))}>Export Expenses CSV</button>
      </div>
      <p className="muted-text">The accountant export is balanced and ledger-oriented. Exact Tally ledger names/configuration remain accountant-controlled; WineShopPOS does not claim a one-click import into every Tally setup.</p>
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Sales Summary</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead><tbody>{fs.slice(0,100).map(s=><tr key={s.id}><td>{s.invoiceNumber}</td><td>{new Date(s.createdAt).toLocaleString("en-IN")}</td><td>{s.paymentMethod}</td><td>{money.format(s.discount)}</td><td>{money.format(s.grandTotal)}</td></tr>)}</tbody></SortableTable></div>
    </section>
  </div>
}
