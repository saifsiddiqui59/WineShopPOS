import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProductEnrichmentPanel({ shopId, item, sizeMl, disabled=false, onUseCandidate }) {
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState(null);
  const [message,setMessage]=useState("");

  async function search(){
    setOpen(true);
    if(result||busy)return;
    if(!shopId){setMessage("Active shop is unavailable.");return;}
    setBusy(true);setMessage("");
    const {data,error}=await supabase.functions.invoke("product-enrichment",{body:{
      shopId,query:String(item?.description||""),sizeMl:Number(sizeMl||0)||null,
    }});
    if(error||!data?.ok){
      setMessage(data?.message||error?.message||"External product lookup is temporarily unavailable.");
      setBusy(false);return;
    }
    setResult(data);setBusy(false);
  }

  return <>
    <button type="button" className="secondary-button" disabled={disabled} onClick={search}>Find Product Info</button>
    {open?<div className="product-enrichment-backdrop" role="presentation">
      <div className="product-enrichment-modal" role="dialog" aria-modal="true" aria-label="External product suggestions">
        <div className="section-row">
          <div><h3>External Product Suggestions</h3><p className="muted-text">Product Master was checked first. These are suggestions only.</p></div>
          <button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Close</button>
        </div>
        <div className="product-enrichment-query"><span>OCR</span><strong>{item?.description||"Unnamed OCR line"}</strong>{sizeMl?<small>{sizeMl} ml</small>:null}</div>
        {busy?<div className="purchase-message">Searching external catalogues…</div>:null}
        {message?<div className="purchase-message">{message}</div>:null}
        {result?<>
          <div className="product-enrichment-meta">
            <span>{result.cacheHit?"Cached result":"Live lookup"}</span>
            <span>{Number(result.latencyMs||0)} ms</span>
            <span>{(result.providers||[]).join(" + ")||"No provider match"}</span>
          </div>
          {(result.candidates||[]).length?<div className="product-enrichment-list">
            {result.candidates.map((candidate,index)=><article className="product-enrichment-card" key={`${candidate.barcode||candidate.title}-${index}`}>
              <div className="product-enrichment-image">{candidate.imageUrl?<img src={candidate.imageUrl} alt="" referrerPolicy="no-referrer"/>:<span>No image</span>}</div>
              <div className="product-enrichment-copy">
                <strong>{candidate.title||"Unnamed candidate"}</strong>
                <span>{candidate.brand||"Brand unknown"}{candidate.sizeMl?` · ${candidate.sizeMl} ml`:""}</span>
                <span>Barcode: {candidate.barcode||"Not provided"}</span>
                <span>Match score: {Math.round(Number(candidate.score||0)*100)}%</span>
                <small>Sources: {(candidate.providers||[]).join(" + ")}</small>
              </div>
              <button type="button" className="primary-button" onClick={()=>{onUseCandidate(candidate);setOpen(false);}}>Use Candidate</button>
            </article>)}
          </div>:<div className="verification-guidance verification-guidance--neutral">No external candidate found. Keep Product Master/manual creation as the fallback.</div>}
          {(result.providerWarnings||[]).map((warning)=><div className="muted-text" key={warning}>{warning}</div>)}
          <p className="muted-text">External images are reference previews only. WineShopPOS does not automatically copy third-party images into your product library.</p>
        </>:null}
      </div>
    </div>:null}
  </>;
}

