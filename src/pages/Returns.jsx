import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 });

export default function Returns() {
  const { sales, refreshAll } = useShop();
  const { profile } = useAuth();
  const [saleId,setSaleId]=useState(""); const [qty,setQty]=useState({}); const [reason,setReason]=useState("");
  const [method,setMethod]=useState("CASH"); const [reference,setReference]=useState(""); const [requests,setRequests]=useState([]); const [message,setMessage]=useState("");
  const selected=useMemo(()=>sales.find((s)=>s.id===saleId),[sales,saleId]);
  const manager=["ADMIN","MANAGER"].includes(profile?.role);

  async function load(){const{data,error}=await supabase.from("sale_return_requests").select(`id,sale_id,status,reason,refund_method,total_refund,created_at,reviewed_at,sale_return_items(id,sale_item_id,product_id,quantity,unit_refund,line_refund)`).order("created_at",{ascending:false}).limit(100);if(error)setMessage(error.message);else setRequests(data||[])}
  useEffect(()=>{load()},[]);
  async function requestReturn(e){e.preventDefault();const items=(selected?.items||[]).map((i)=>({sale_item_id:i.id,quantity:Number(qty[i.id]||0)})).filter((i)=>i.quantity>0);const{error}=await supabase.rpc("create_return_request",{p_sale_id:saleId,p_items:items,p_reason:reason,p_refund_method:method,p_refund_reference:reference||null});setMessage(error?error.message:"Return request submitted for manager approval.");if(!error){setQty({});setReason("");await load()}}
  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
  async function voidSale(){if(!selected||!reason.trim())return setMessage("Select an invoice and enter a void reason.");if(!confirm(`Void ${selected.invoiceNumber}? Stock will be restored and refund recorded.`))return;const{error}=await supabase.rpc("void_sale",{p_sale_id:selected.id,p_reason:reason,p_refund_method:method,p_refund_reference:reference||null});setMessage(error?error.message:"Sale voided and stock restored.");if(!error)await refreshAll()}

  return <div><div className="page-heading"><div><h2>Returns, Refunds & Voids</h2><p>Return requests require Manager/Admin approval before stock changes.</p></div></div>
    {message&&<div className="purchase-message">{message}</div>}
    <div className="settings-grid">
      <form className="panel" onSubmit={requestReturn}><h3>New Return Request</h3><div className="settings-fields"><label>Original Invoice<select value={saleId} onChange={(e)=>{setSaleId(e.target.value);setQty({})}} required><option value="">Select invoice</option>{sales.filter((s)=>!["VOID","RETURNED"].includes(s.status)&&!String(s.id).startsWith("offline-")).map((s)=><option value={s.id} key={s.id}>{s.invoiceNumber} · {money.format(s.grandTotal)}</option>)}</select></label>
      {selected?.items.map((i)=><label key={i.id}>{i.productName} · sold {i.quantity}<input type="number" min="0" max={i.quantity} value={qty[i.id]||0} onChange={(e)=>setQty({...qty,[i.id]:e.target.value})}/></label>)}
      <label>Reason<input value={reason} onChange={(e)=>setReason(e.target.value)} required/></label><label>Refund Method<select value={method} onChange={(e)=>setMethod(e.target.value)}><option>CASH</option><option>UPI</option><option>CARD</option></select></label><label>Refund Reference<input value={reference} onChange={(e)=>setReference(e.target.value)}/></label></div><br/><button className="primary-button">Request Return</button>{manager&&selected&&<button type="button" className="danger-button" onClick={voidSale} style={{marginLeft:8}}>Void Entire Sale</button>}</form>
      <section className="panel"><h3>Rules</h3><p>Cashier may request a return. Only Manager/Admin approves. Approval restores inventory and creates a refund payment plus CUSTOMER_RETURN stock movement.</p><p>Void is Manager/Admin only and is allowed only for a clean completed invoice with no return activity.</p></section>
    </div>
    <section className="panel" style={{marginTop:16}}><h3>Return Queue</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Created</th><th>Sale</th><th>Qty</th><th>Refund</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((r)=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString("en-IN")}</td><td>{sales.find((s)=>s.id===r.sale_id)?.invoiceNumber||r.sale_id.slice(0,8)}</td><td>{(r.sale_return_items||[]).reduce((a,i)=>a+i.quantity,0)}</td><td>{money.format(r.total_refund)}</td><td>{r.reason}</td><td>{r.status}</td><td>{manager&&r.status==="PENDING"?<><button className="secondary-button" onClick={()=>review(r.id,"approve")}>Approve</button> <button className="secondary-button" onClick={()=>review(r.id,"reject")}>Reject</button></>:"-"}</td></tr>)}</tbody></table></div></section>
  </div>
}
