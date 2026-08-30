import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function Approvals(){
  const[items,setItems]=useState([]);
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState("");

  async function load(){
    const[r,s,c,t,p,o]=await Promise.all([
      supabase.from("sale_return_requests").select("id,status,reason,total_refund,created_at").eq("status","PENDING").order("created_at"),
      supabase.from("cashier_shifts").select("id,status,cash_difference,opened_at,close_requested_at").eq("status","CLOSE_REQUESTED").order("close_requested_at"),
      supabase.from("stock_counts").select("id,count_number,status,submitted_at").eq("status","SUBMITTED").order("submitted_at"),
      supabase.from("stock_transfers").select("id,status,created_at,source_shop_id,destination_shop_id").eq("status","REQUESTED").order("created_at"),
      supabase.from("purchase_orders").select("id,po_number,status,subtotal,created_at").eq("status","APPROVAL_PENDING").order("created_at"),
      supabase.from("sale_override_requests").select("id,status,override_type,subtotal,requested_discount,discount_percent,note,created_at,request_snapshot,reason_codes(label,code,category)").eq("status","PENDING").order("created_at")
    ]);

    if([r,s,c,t,p,o].some((x)=>x.error)){setMessage("Unable to load all approval queues.");return}

    const overrideItems=(o.data||[]).map((x)=>{
      const snap=x.request_snapshot||{};
      const changes=(snap.items||[]).filter((i)=>Number(i.normal_price)!==Number(i.requested_price));
      return{
        type:"SALE_OVERRIDE",
        id:x.id,
        title:x.override_type.replaceAll("_"," "),
        detail:`Subtotal ${money.format(x.subtotal)} · Discount ${money.format(x.requested_discount)} (${Number(x.discount_percent||0).toFixed(2)}%) · ${changes.length} price override(s) · Reason ${x.reason_codes?.label||"-"}${x.note?` · ${x.note}`:""}`,
        when:x.created_at,
        status:x.status
      };
    });

    setItems([
      ...(r.data||[]).map((x)=>({type:"RETURN",id:x.id,title:`Return ${money.format(x.total_refund||0)}`,detail:x.reason,when:x.created_at,status:x.status})),
      ...(s.data||[]).map((x)=>({type:"SHIFT",id:x.id,title:"Shift close",detail:`Cash difference ${x.cash_difference??"pending"}`,when:x.close_requested_at||x.opened_at,status:x.status})),
      ...(c.data||[]).map((x)=>({type:"STOCK_COUNT",id:x.id,title:x.count_number,detail:"Physical stock count submitted",when:x.submitted_at,status:x.status})),
      ...(t.data||[]).map((x)=>({type:"TRANSFER",id:x.id,title:"Incoming transfer",detail:`From ${String(x.source_shop_id).slice(0,8)}`,when:x.created_at,status:x.status})),
      ...(p.data||[]).map((x)=>({type:"PURCHASE_ORDER",id:x.id,title:x.po_number,detail:`PO total ${money.format(x.subtotal)}`,when:x.created_at,status:x.status})),
      ...overrideItems
    ].sort((a,b)=>new Date(b.when)-new Date(a.when)));
  }

  useEffect(()=>{load()},[]);

  async function act(item,action){
    setBusy(`${item.type}-${item.id}`);
    let fn,args;

    if(item.type==="RETURN"){
      fn=action==="approve"?"approve_return_request":"reject_return_request";
      args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"};
    }else if(item.type==="SHIFT"){
      fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"};
    }else if(item.type==="STOCK_COUNT"){
      fn="approve_stock_count";args={p_stock_count_id:item.id};
    }else if(item.type==="TRANSFER"){
      fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";
      args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"};
    }else if(item.type==="PURCHASE_ORDER"){
      fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";
      args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"};
    }else{
      fn=action==="approve"?"approve_sale_override":"reject_sale_override";
      args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"};
    }

    const{error}=await supabase.rpc(fn,args);
    setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);
    if(!error)await load();
    setBusy("");
  }

  return <div>
    <PageHeader title="Approval Center" subtitle="One place for returns, shift close, stock count, transfer, purchase order and POS override approvals." actions={<button className="secondary-button" onClick={load}>Refresh</button>}/>
    {message?<div className="purchase-message">{message}</div>:null}
    {items.length===0
      ?<EmptyState title="Nothing is waiting for approval" message="Sensitive operational requests will appear here when submitted."/>
      :<div className="approval-list">{items.map((item)=><article className="approval-card" key={`${item.type}-${item.id}`}>
        <div><div className="approval-type">{item.type.replaceAll("_"," ")}</div><strong>{item.title}</strong><p>{item.detail}</p><small>{new Date(item.when).toLocaleString("en-IN")}</small></div>
        <div className="approval-actions"><StatusBadge status={item.status}/><button className="primary-button" disabled={!!busy} onClick={()=>act(item,"approve")}>Approve</button>{!["SHIFT","STOCK_COUNT"].includes(item.type)?<button className="secondary-button" disabled={!!busy} onClick={()=>act(item,"reject")}>Reject</button>:null}</div>
      </article>)}</div>}
  </div>
}
