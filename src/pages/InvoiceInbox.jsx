import { useEffect,useMemo,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getInvoiceReadUrl } from "../lib/invoiceClient";

const REVIEW_KEY="wineshop_ocr_review_state";
const PURCHASE_DRAFT_KEY="wineshop_ocr_purchase_draft";
const STATUS_OPTIONS=["ALL","NEEDS_REVIEW","READY_TO_RECEIVE","POSSIBLE_DUPLICATE","DUPLICATE","RECEIVED","OCR_FAILED","FAILED","CANCELLED"];

function monthRange(year,month){
  return{
    start:new Date(Date.UTC(year,month-1,1)).toISOString(),
    end:new Date(Date.UTC(year,month,1)).toISOString()
  };
}

export default function InvoiceInbox(){
  const{session,profile}=useAuth();
  const navigate=useNavigate();
  const now=new Date();

  const[year,setYear]=useState(now.getFullYear());
  const[month,setMonth]=useState(now.getMonth()+1);
  const[status,setStatus]=useState("ALL");
  const[rows,setRows]=useState([]);
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState("");

  const years=useMemo(()=>[now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1],[now]);

  async function load(){
    if(!profile?.shop_id)return;
    setBusy(true);
    setMessage("");
    const{start,end}=monthRange(Number(year),Number(month));
    let q=supabase.from("invoice_ingestions")
      .select("id,shop_id,purchase_id,source,source_identity,original_file_name,stored_file_name,blob_path,content_type,size_bytes,received_at,ocr_status,review_status,extracted_supplier_name,extracted_invoice_number,extracted_invoice_date,extracted_total,normalized_invoice,possible_duplicate_purchase_id,processing_error,review_draft,review_draft_updated_at,review_cancel_reason,review_cancelled_at")
      .eq("shop_id",profile.shop_id)
      .gte("received_at",start)
      .lt("received_at",end)
      .order("received_at",{ascending:false});

    if(status!=="ALL")q=q.eq("review_status",status);
    const{data,error}=await q;
    if(error)setMessage(error.message||"Unable to load invoice history.");
    setRows(data||[]);
    setBusy(false);
  }

  useEffect(()=>{load();},[profile?.shop_id,year,month,status]);

  async function viewOriginal(row){
    setMessage("");
    try{
      const r=await getInvoiceReadUrl({token:session?.access_token,ingestionId:row.id});
      window.open(r.url,"_blank","noopener,noreferrer");
    }catch(e){
      setMessage(e.message||"Unable to open original invoice.");
    }
  }

  function reviewInvoice(row){
    if(!row.normalized_invoice&&!row.review_draft){
      setMessage("OCR result is not available yet.");
      return;
    }
    if(["POSSIBLE_DUPLICATE","DUPLICATE"].includes(row.review_status)){
      setMessage("Resolve duplicate status before Receive Stock.");
      return;
    }
    if(row.review_status==="CANCELLED"){
      setMessage("Reopen this cancelled review first.");
      return;
    }

    const draft=row.review_draft||null;
    if(draft?.stage==="RECEIVE_STOCK"&&draft?.purchaseDraft){
      sessionStorage.setItem(PURCHASE_DRAFT_KEY,JSON.stringify({
        ...draft.purchaseDraft,
        ingestionId:row.id,
      }));
      navigate("/purchasing/receive");
      return;
    }

    if(draft?.stage==="OCR_REVIEW"){
      sessionStorage.setItem(REVIEW_KEY,JSON.stringify({
        ...draft,
        ingestionId:row.id,
        sourceFileName:draft.sourceFileName||row.stored_file_name,
      }));
    }else{
      sessionStorage.setItem(REVIEW_KEY,JSON.stringify({
        result:row.normalized_invoice,
        matches:{},
        resolution:{},
        supplierId:"",
        confirmedSupplier:null,
        ingestionId:row.id,
        sourceFileName:row.stored_file_name,
      }));
    }
    navigate("/purchasing/ocr");
  }

  async function resolveDuplicate(row,decision){
    const note=window.prompt(
      decision==="NOT_DUPLICATE"?"Reason this is not a duplicate:":"Reason this duplicate is confirmed:",""
    );
    if(note===null)return;
    setBusy(true);
    const{error}=await supabase.rpc("invoice_resolve_duplicate",{
      p_ingestion_id:row.id,p_decision:decision,p_note:note
    });
    if(error)setMessage(error.message||"Unable to resolve duplicate.");
    else{
      setMessage(decision==="NOT_DUPLICATE"?"Duplicate warning cleared.":"Invoice marked duplicate; it cannot be received.");
      await load();
    }
    setBusy(false);
  }

  async function cancelReview(row){
    if(!window.confirm("Cancel this invoice review? The original document is retained and inventory is not changed."))return;
    const reason=window.prompt("Optional cancellation reason:","")??"";
    setBusy(true);
    const{error}=await supabase.rpc("invoice_cancel_review",{
      p_ingestion_id:row.id,p_reason:reason||null
    });
    if(error)setMessage(error.message||"Unable to cancel review.");
    else{
      setMessage("Invoice review cancelled. Original evidence was retained.");
      await load();
    }
    setBusy(false);
  }

  async function reopenReview(row){
    setBusy(true);
    const{error}=await supabase.rpc("invoice_reopen_review",{p_ingestion_id:row.id});
    if(error)setMessage(error.message||"Unable to reopen review.");
    else{
      setMessage("Invoice review reopened.");
      await load();
    }
    setBusy(false);
  }

  return <div>
    <div className="page-heading"><div>
      <h2>Invoice Inbox</h2>
      <p>Private shop invoice history from Manual OCR, Email and future WhatsApp ingestion. Draft review progress is saved server-side.</p>
    </div></div>

    {message&&<div className="purchase-message">{message}</div>}

    <section className="panel">
      <div className="form-grid">
        <label>Year
          <select value={year} onChange={e=>setYear(Number(e.target.value))}>
            {years.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>Month
          <select value={month} onChange={e=>setMonth(Number(e.target.value))}>
            {Array.from({length:12},(_,i)=>i+1).map(v=>
              <option key={v} value={v}>
                {new Intl.DateTimeFormat("en-IN",{month:"long"}).format(new Date(2026,v-1,1))}
              </option>
            )}
          </select>
        </label>
        <label>Status
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(v=><option key={v} value={v}>{v.replaceAll("_"," ")}</option>)}
          </select>
        </label>
      </div>
    </section>

    <section className="panel" style={{marginTop:16}}>
      <div className="button-row spread">
        <h3>Invoices</h3>
        <span className="muted-text">{busy?"Loading...":`${rows.length} invoice(s)`}</span>
      </div>
      <div className="data-table-wrapper"><table className="data-table">
        <thead><tr>
          <th>Received</th><th>Invoice</th><th>Supplier</th><th>Source</th><th>Status</th>
          <th>Total</th><th>Draft</th><th>Purchase</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {rows.map(row=><tr key={row.id}>
            <td>{row.received_at?new Date(row.received_at).toLocaleString("en-IN"):"—"}</td>
            <td>{row.extracted_invoice_number||row.original_file_name}</td>
            <td>{row.extracted_supplier_name||"Pending OCR"}</td>
            <td>{row.source}</td>
            <td>{row.review_status}</td>
            <td>{row.extracted_total==null?"—":new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(row.extracted_total))}</td>
            <td>{row.review_draft?`${row.review_draft.stage==="RECEIVE_STOCK"?"Receive Stock":"OCR Review"} saved`:"—"}</td>
            <td>{row.purchase_id||"Not received"}</td>
            <td><div className="button-row">
              <button type="button" className="secondary-button" onClick={()=>viewOriginal(row)}>View Original</button>
              {(row.normalized_invoice||row.review_draft)&&!["RECEIVED","DUPLICATE","POSSIBLE_DUPLICATE","CANCELLED"].includes(row.review_status)?
                <button type="button" className="secondary-button" onClick={()=>reviewInvoice(row)}>
                  {row.review_draft?"Resume Draft":"Review OCR"}
                </button>:null}
              {["NEEDS_REVIEW","READY_TO_RECEIVE","OCR_FAILED","FAILED"].includes(row.review_status)?
                <button type="button" className="secondary-button" onClick={()=>cancelReview(row)} disabled={busy}>Cancel</button>:null}
              {row.review_status==="CANCELLED"?
                <button type="button" className="secondary-button" onClick={()=>reopenReview(row)} disabled={busy}>Reopen</button>:null}
              {row.review_status==="POSSIBLE_DUPLICATE"?<>
                <button type="button" className="secondary-button" onClick={()=>resolveDuplicate(row,"NOT_DUPLICATE")} disabled={busy}>Not Duplicate</button>
                <button type="button" className="secondary-button" onClick={()=>resolveDuplicate(row,"CONFIRMED_DUPLICATE")} disabled={busy}>Confirm Duplicate</button>
              </>:null}
            </div></td>
          </tr>)}
          {!rows.length&&!busy?<tr><td colSpan="9">No invoices for selected month/status.</td></tr>:null}
        </tbody>
      </table></div>
    </section>
  </div>;
}
