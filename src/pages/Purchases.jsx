import { useEffect, useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const empty=()=>({description:"",productId:"",caseCount:0,unitsPerCase:12,looseBottles:0,quantity:0,purchasePrice:0,batchNumber:"",expiryDate:""});
const emptyCharges=()=>({freightAmount:0,transportAmount:0,handlingAmount:0,loadingUnloadingAmount:0,supplierDiscountAmount:0,invoiceDiscountAmount:0,miscellaneousAmount:0,roundingAdjustment:0});

export default function Purchases(){
  const{products,purchases,suppliers,receiveStock}=useShop();
  const navigate=useNavigate();
  const active=products.filter((p)=>p.active);
  const[supplierName,setSupplierName]=useState("");
  const[invoiceNumber,setInvoiceNumber]=useState("");
  const[invoiceDate,setInvoiceDate]=useState(new Date().toISOString().slice(0,10));
  const[notes,setNotes]=useState("");
  const[items,setItems]=useState([empty()]);
  const[charges,setCharges]=useState(emptyCharges());
  const[financialSummary,setFinancialSummary]=useState(null);
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState(false);
  const[ingestionId,setIngestionId]=useState(null);
  const[draftLoaded,setDraftLoaded]=useState(false);

  useEffect(()=>{
    try{
      const raw=sessionStorage.getItem("wineshop_ocr_purchase_draft");
      if(!raw)return;
      const d=JSON.parse(raw);
      setSupplierName(d.supplierName||"");setInvoiceNumber(d.invoiceNumber||"");
      setInvoiceDate(d.invoiceDate||new Date().toISOString().slice(0,10));
      setNotes(d.notes||`OCR draft from ${d.sourceFile||"invoice"}. Product mapping and final bottle quantities were reviewed.`);
      setItems((d.items||[]).map((x)=>({...empty(),...x,caseCount:Number(x.caseCount||0),unitsPerCase:Number(x.unitsPerCase||1),looseBottles:Number(x.looseBottles||0),quantity:Number(x.quantity||0),purchasePrice:Number(x.purchasePrice||0)})));
      setCharges({...emptyCharges(),...(d.charges||{})});
      setFinancialSummary(d.financialSummary||null);
      setIngestionId(d.ingestionId||null);
      setDraftLoaded(Boolean(d.ingestionId));
      sessionStorage.removeItem("wineshop_ocr_purchase_draft");
      setMessage("OCR review loaded. Recheck final bottle quantities and landed-cost adjustments before posting.");
    }catch{setMessage("OCR draft could not be loaded. Enter the receipt manually.");}
  },[]);

  function receiveDraftSnapshot(){
    return {
      version:1,
      stage:"RECEIVE_STOCK",
      ingestionId,
      purchaseDraft:{
        supplierName,
        invoiceNumber,
        invoiceDate,
        notes,
        items,
        charges,
        financialSummary,
        ingestionId,
        sourceFile:"Saved Invoice Inbox draft",
        updatedAt:new Date().toISOString(),
      },
      updatedAt:new Date().toISOString(),
    };
  }

  async function persistReceiveDraft(showMessage=false){
    if(!ingestionId)return{ok:true,skipped:true};
    const{error}=await supabase.rpc("invoice_save_review_draft",{
      p_ingestion_id:ingestionId,
      p_review_draft:receiveDraftSnapshot(),
      p_ready:true,
    });
    if(error){
      if(showMessage)setMessage(error.message||"Unable to save Receive Stock draft.");
      return{ok:false,error};
    }
    if(showMessage)setMessage("Receive Stock draft saved. You can resume it from Invoice Inbox.");
    return{ok:true};
  }

  useEffect(()=>{
    if(!draftLoaded||!ingestionId)return undefined;
    const timer=window.setTimeout(()=>{persistReceiveDraft(false);},1200);
    return()=>window.clearTimeout(timer);
  },[draftLoaded,ingestionId,supplierName,invoiceNumber,invoiceDate,notes,items,charges,financialSummary]);

  async function cancelDraft(){
    if(!ingestionId){
      setItems([empty()]);setCharges(emptyCharges());setMessage("Manual draft cleared. Inventory was not changed.");
      return;
    }
    if(!window.confirm("Cancel this invoice review? The original document stays in Invoice Inbox and inventory is not changed."))return;
    const reason=window.prompt("Optional cancellation reason:","")??"";
    setBusy(true);
    const{error}=await supabase.rpc("invoice_cancel_review",{p_ingestion_id:ingestionId,p_reason:reason||null});
    setBusy(false);
    if(error){setMessage(error.message||"Unable to cancel invoice review.");return;}
    setIngestionId(null);setDraftLoaded(false);
    navigate("/purchasing/invoices");
  }

  function update(n,k,v){
    setItems((cur)=>cur.map((i,idx)=>{
      if(idx!==n)return i;const x={...i,[k]:v};
      if(k==="productId"){const p=active.find((p)=>p.id===v);if(p){x.unitsPerCase=p.unitsPerCase||1;x.purchasePrice=Number(x.purchasePrice||0)||p.purchasePrice||0;}}
      x.quantity=Number(x.caseCount||0)*Number(x.unitsPerCase||1)+Number(x.looseBottles||0);
      return x;
    }));
  }
  const baseTotal=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
  const adjustment=useMemo(()=>Number(charges.freightAmount||0)+Number(charges.transportAmount||0)+Number(charges.handlingAmount||0)+Number(charges.loadingUnloadingAmount||0)+Number(charges.miscellaneousAmount||0)-Number(charges.supplierDiscountAmount||0)-Number(charges.invoiceDiscountAmount||0)+Number(charges.roundingAdjustment||0),[charges]);
  const landedTotal=baseTotal+adjustment;
  const printedInvoiceTotal=Number(financialSummary?.total||0);
  const reconciliationDifference=printedInvoiceTotal>0?Number((printedInvoiceTotal-landedTotal).toFixed(2)):null;
  const reconciliationMatches=reconciliationDifference==null||Math.abs(reconciliationDifference)<=1;

  async function submit(e){
    e.preventDefault();setMessage("");
    const cleaned=items.filter((i)=>i.productId&&Number(i.quantity)>0);
    if(!cleaned.length||cleaned.length!==items.length){setMessage("Every line must have a resolved product and positive final bottle quantity.");return;}
    if(new Set(cleaned.map((i)=>i.productId)).size!==cleaned.length){setMessage("Combine duplicate product lines before receiving.");return;}
    for(const i of cleaned){if(Number(i.quantity)!==Number(i.caseCount||0)*Number(i.unitsPerCase||1)+Number(i.looseBottles||0)){setMessage("Final Bottles must equal Cases × Bottles/Case + Loose Bottles.");return;}}
    if(landedTotal<0){setMessage("Total landed cost cannot be negative.");return;}
    if(!reconciliationMatches){setMessage(`Invoice financials do not reconcile. Difference: ₹${Math.abs(reconciliationDifference).toFixed(2)}. Review landed-cost adjustments before receiving.`);return;}
    setBusy(true);
    if(ingestionId){const{error:guardError}=await supabase.rpc("invoice_assert_receivable",{p_ingestion_id:ingestionId});if(guardError){setMessage(guardError.message||"Invoice is not allowed to Receive Stock yet.");setBusy(false);return;}}
    const r=await receiveStock({supplierName,invoiceNumber,invoiceDate,notes,items:cleaned,charges});
    if(r.ok&&ingestionId){const{error:linkError}=await supabase.rpc("invoice_link_purchase",{p_ingestion_id:ingestionId,p_purchase_id:r.purchaseId});if(linkError){setMessage(`Stock was received, but invoice history linking failed: ${linkError.message}`);setBusy(false);return;}}
    setMessage(r.message);if(r.ok){setInvoiceNumber("");setNotes("");setItems([empty()]);setCharges(emptyCharges());setFinancialSummary(null);setIngestionId(null);}setBusy(false);
  }

  return <div>
    <div className="page-heading"><div><h2>Receive Stock</h2><p>Resolve products, confirm case/bottle quantities, review landed cost, then post inventory.</p></div><button className="secondary-button" onClick={()=>navigate("/purchasing/ocr")}>Invoice OCR</button></div>
    {message&&<div className="purchase-message">{message}</div>}
    <form className="panel" onSubmit={submit}>
      <div className="form-grid">
        <label>Supplier<input list="supplier-list" value={supplierName} onChange={(e)=>setSupplierName(e.target.value)} required/><datalist id="supplier-list">{suppliers.filter((s)=>s.active).map((s)=><option key={s.id} value={s.supplier_name}/>)}</datalist></label>
        <label>Supplier Invoice / Reference <span className="optional-field">(optional)</span><input value={invoiceNumber} onChange={(e)=>setInvoiceNumber(e.target.value)} placeholder="OCR or WineShopPOS auto reference"/></label>
        <label>Invoice Date<input type="date" value={invoiceDate} onChange={(e)=>setInvoiceDate(e.target.value)} required/></label>
        <label>Notes <span className="optional-field">(optional)</span><input value={notes} onChange={(e)=>setNotes(e.target.value)}/></label>
      </div>
      <div className="data-table-wrapper" style={{marginTop:18}}><table className="data-table"><thead><tr><th>OCR / Source</th><th>Product <span className="required-mark">*</span></th><th>Cases</th><th>Bottles/Case <span className="required-mark">*</span></th><th>Loose</th><th>Final Bottles <span className="required-mark">*</span></th><th>Price/Bottle</th><th>Batch</th><th>Expiry</th><th>Amount</th><th></th></tr></thead>
      <tbody>{items.map((i,n)=><tr key={n}><td>{i.description||"Manual entry"}</td><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select product</option>{active.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="0" value={i.caseCount} onChange={(e)=>update(n,"caseCount",e.target.value)}/></td><td><input type="number" min="1" value={i.unitsPerCase} onChange={(e)=>update(n,"unitsPerCase",e.target.value)} required/></td><td><input type="number" min="0" value={i.looseBottles} onChange={(e)=>update(n,"looseBottles",e.target.value)}/></td><td><strong>{i.quantity}</strong></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td><input value={i.batchNumber} placeholder="Optional" onChange={(e)=>update(n,"batchNumber",e.target.value)}/></td><td><input type="date" value={i.expiryDate} onChange={(e)=>update(n,"expiryDate",e.target.value)}/></td><td>{money.format(Number(i.quantity||0)*Number(i.purchasePrice||0))}</td><td><button type="button" aria-label="Remove purchase line" onClick={()=>setItems((x)=>x.filter((_,idx)=>idx!==n))}>×</button></td></tr>)}</tbody></table></div>
      <div className="button-row spread"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,empty()])}>Add Line</button><strong>Product Value {money.format(baseTotal)}</strong></div>
      <section style={{marginTop:22}}><h3>Landed Cost Adjustments</h3><p className="muted-text">Auto-filled from OCR when recognized. Review before posting; invoice-level adjustments are allocated deterministically across purchase lines.</p><div className="form-grid">
      {[["freightAmount","Freight"],["transportAmount","Transport"],["handlingAmount","Handling"],["loadingUnloadingAmount","Loading / Unloading"],["supplierDiscountAmount","Supplier Discount"],["invoiceDiscountAmount","Invoice Discount"],["miscellaneousAmount","Miscellaneous"]].map(([k,l])=><label key={k}>{l}<input type="number" min="0" step="0.01" value={charges[k]} onChange={(e)=>setCharges((c)=>({...c,[k]:e.target.value}))}/></label>)}
      <label>Rounding Adjustment<input type="number" step="0.01" value={charges.roundingAdjustment} onChange={(e)=>setCharges((c)=>({...c,roundingAdjustment:e.target.value}))}/></label></div>
      <div className="metric-grid four" style={{marginTop:16}}><div className="metric-card"><span>Product Value</span><strong>{money.format(baseTotal)}</strong></div><div className="metric-card"><span>Net Adjustment</span><strong>{money.format(adjustment)}</strong></div><div className="metric-card"><span>Landed Total</span><strong>{money.format(landedTotal)}</strong></div><div className="metric-card"><span>Allocation</span><strong>Pro-rata</strong></div></div>
      {printedInvoiceTotal>0?<div className="metric-grid four" style={{marginTop:12}}><div className="metric-card"><span>Printed Invoice</span><strong>{money.format(printedInvoiceTotal)}</strong></div><div className="metric-card"><span>Calculated Invoice</span><strong>{money.format(landedTotal)}</strong></div><div className="metric-card"><span>Difference</span><strong>{money.format(Math.abs(reconciliationDifference||0))}</strong></div><div className="metric-card"><span>Status</span><strong>{reconciliationMatches?"MATCH":"REVIEW"}</strong></div></div>:null}
      </section>
      <br/>
      <div className="button-row">
        {ingestionId?<button type="button" className="secondary-button" disabled={busy} onClick={()=>persistReceiveDraft(true)}>Save Draft</button>:null}
        {ingestionId?<button type="button" className="secondary-button" disabled={busy} onClick={cancelDraft}>Cancel Draft</button>:null}
        <button className="primary-button" disabled={busy||landedTotal<0}>{busy?"Receiving...":"Confirm & Receive Stock"}</button>
      </div>
    </form>
    <section className="panel" style={{marginTop:16}}><h3>Recent Purchases</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead><tbody>{purchases.slice(0,20).map((p)=><tr key={p.id}><td>{p.purchaseNumber}</td><td>{p.invoiceNumber}</td><td>{p.supplierName}</td><td>{p.invoiceDate}</td><td>{p.totalUnits}</td><td>{money.format(p.total)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
