import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import SortableTable from "../components/ui/SortableTable";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const missing=(e)=>e&&(e.code==="PGRST202"||e.code==="42883"||/inventory_ageing_report|fifo_receipt_lots|does not exist|could not find the function/i.test(e.message||""));
const supplierShort=(name)=>{const first=String(name||"SUPPLIER").trim().split(/\s+/)[0]||"SUPPLIER";return first.replace(/[^a-z0-9]/gi,"").toUpperCase().slice(0,8)||"SUPPLIER";};
const shortDate=(value)=>{const match=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})/);if(match)return`${match[3]}/${match[2]}`;const d=new Date(value);return Number.isNaN(d.getTime())?"--/--":d.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit"});};
const receiptRef=(supplier,date)=>`${supplierShort(supplier)}-${shortDate(date)}`;
const priorityKey=(r)=>`${r.product_id}|${r.lot_number||"NOLOT"}`;
const productRef=(id)=>{const raw=String(id||"").replaceAll("-","").toUpperCase();return raw?`P-${raw.slice(0,6)}`:"-";};

function buildPriority(rows,dateField,untrackedLast=false){
  const ordered=[...rows].sort((a,b)=>{
    const pc=String(a.product_id).localeCompare(String(b.product_id));
    if(pc)return pc;
    if(untrackedLast){
      const au=a.age_bucket==="UNTRACKED",bu=b.age_bucket==="UNTRACKED";
      if(au!==bu)return au?1:-1;
    }
    const at=a[dateField]?new Date(a[dateField]).getTime():Number.MAX_SAFE_INTEGER;
    const bt=b[dateField]?new Date(b[dateField]).getTime():Number.MAX_SAFE_INTEGER;
    if(at!==bt)return at-bt;
    return String(a.lot_number||"").localeCompare(String(b.lot_number||""),"en",{numeric:true});
  });
  const counters=new Map(),result=new Map();
  for(const row of ordered){
    const next=(counters.get(row.product_id)||0)+1;
    counters.set(row.product_id,next);
    result.set(priorityKey(row),next);
  }
  return result;
}

export default function InventoryAgeing(){
  const[ageing,setAgeing]=useState([]),[fifo,setFifo]=useState([]),[loading,setLoading]=useState(true),[available,setAvailable]=useState(true),[message,setMessage]=useState("");
  async function load(){setLoading(true);setMessage("");const[a,f]=await Promise.all([supabase.rpc("inventory_ageing_report"),supabase.rpc("fifo_receipt_lots")]);if(missing(a.error)||missing(f.error)){setAvailable(false);setAgeing([]);setFifo([]);}else if(a.error||f.error)setMessage("Unable to load receipt ageing/FIFO data.");else{setAvailable(true);setAgeing(a.data||[]);setFifo(f.data||[]);}setLoading(false);}
  useEffect(()=>{load();},[]);
  const totals=useMemo(()=>{const b={};let value=0,old=0,untracked=0;for(const r of ageing){const v=Number(r.cost_value||0);value+=v;b[r.age_bucket]=(b[r.age_bucket]||0)+v;if(["91-180","180+"].includes(r.age_bucket))old+=v;if(r.age_bucket==="UNTRACKED")untracked+=Number(r.quantity||0);}return{b,value,old,untracked};},[ageing]);
  const ageingPriority=useMemo(()=>buildPriority(ageing,"receipt_date",true),[ageing]);
  const fifoPriority=useMemo(()=>buildPriority(fifo,"received_at"),[fifo]);

  return <div><PageHeader title="Stock Ageing & FIFO" subtitle="Receipt-based inventory age, money tied up in old stock, and oldest-lot rotation visibility." tier="PRO"/>{message&&<div className="purchase-message">{message}</div>}
  {loading?<section className="panel"><p>Loading stock ageing...</p></section>:!available?<section className="panel"><EmptyState title="V2 inventory-cost migration is not active" message="Apply migration 20260830080000 to enable landed cost, receipt lots, ageing and FIFO."/></section>:<>
  <div className="metric-grid four"><div className="metric-card"><span>Inventory Cost Value</span><strong>{money.format(totals.value)}</strong></div><div className="metric-card"><span>91+ Day Cost</span><strong>{money.format(totals.old)}</strong></div><div className="metric-card"><span>180+ Day Cost</span><strong>{money.format(totals.b["180+"]||0)}</strong></div><div className="metric-card"><span>Untracked Bottles</span><strong>{totals.untracked}</strong></div></div>
  <section className="panel" style={{marginTop:16}}><div className="section-row"><div><h3>True Receipt Ageing</h3><p className="muted-text">Age Priority remains attached to the same product/lot even after sorting. Priority 1 is that product's oldest tracked receipt.</p></div><button className="secondary-button" onClick={load}>Refresh</button></div><div className="data-table-wrapper"><SortableTable className="data-table sticky" showSerial={false} resizeKey="inventory-true-receipt-ageing" defaultColumnWidths={[100,100,240,190,145,125,115,80,90,80,125,125,80]}><thead><tr><th>Product Ref</th><th>Age Priority</th><th>Product</th><th>Supplier</th><th>Receipt Ref</th><th>Batch</th><th>Receipt Date</th><th>Age</th><th>Bucket</th><th>Qty</th><th>Landed/Bottle</th><th>Cost Value</th><th>%</th></tr></thead><tbody>{ageing.map((r,i)=><tr key={`${r.product_id}-${r.lot_number}-${i}`}><td><strong>{productRef(r.product_id)}</strong></td><td><strong>{ageingPriority.get(priorityKey(r))||"-"}</strong></td><td>{r.product_name}</td><td>{r.supplier_name||"-"}</td><td><strong title={`Technical lot: ${r.lot_number||"-"}`}>{receiptRef(r.supplier_name,r.receipt_date)}</strong></td><td>{r.batch_number||"-"}</td><td>{r.receipt_date||"-"}</td><td>{r.age_days==null?"-":`${r.age_days}d`}</td><td>{r.age_bucket}</td><td>{r.quantity}</td><td>{money.format(r.landed_unit_cost||0)}</td><td>{money.format(r.cost_value||0)}</td><td>{Number(r.inventory_percentage||0).toFixed(2)}%</td></tr>)}</tbody></SortableTable></div></section>
  <section className="panel" style={{marginTop:16}}><h3>FIFO Rotation Queue</h3><p className="muted-text">FIFO Priority is stable per product/lot. <strong>1 = SELL FIRST</strong>. Sorting another column changes only the view.</p>{fifo.length===0?<EmptyState title="No tracked receipt lots" message="New V2 purchase receipts create receipt-level lots."/>:<div className="data-table-wrapper"><SortableTable className="data-table sticky" showSerial={false} resizeKey="inventory-fifo-rotation" defaultColumnWidths={[100,100,110,145,250,125,115,115,105,125,190]}><thead><tr><th>Product Ref</th><th>FIFO Priority</th><th>Rotation</th><th>Receipt Ref</th><th>Product</th><th>Batch</th><th>Received</th><th>Expiry</th><th>Remaining</th><th>Landed/Bottle</th><th>Supplier</th></tr></thead><tbody>{fifo.map((r,i)=>{const priority=fifoPriority.get(priorityKey(r))||"-";return <tr key={`${r.product_id}-${r.lot_number}-${i}`}><td><strong>{productRef(r.product_id)}</strong></td><td><strong>{priority}</strong></td><td><strong>{priority===1?"SELL FIRST":"NEXT"}</strong></td><td><strong title={`Technical lot: ${r.lot_number||"-"}`}>{receiptRef(r.supplier_name,r.received_at)}</strong></td><td>{r.product_name}</td><td>{r.batch_number||"-"}</td><td>{r.received_at?new Date(r.received_at).toLocaleDateString():"-"}</td><td>{r.expiry_date||"-"}</td><td>{r.remaining_quantity}</td><td>{money.format(r.landed_unit_cost||0)}</td><td>{r.supplier_name||"-"}</td></tr>;})}</tbody></SortableTable></div>}</section>
  </>}</div>;
}
