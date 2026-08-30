import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useScanner } from "../context/ScannerContext";
import { supabase } from "../lib/supabase";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function POS(){
  const{products,getStock,completeSale}=useShop();
  const{lastScan,successBeep,errorBeep}=useScanner();
  const navigate=useNavigate();

  const[search,setSearch]=useState("");
  const[cart,setCart]=useState([]);
  const[paymentMethod,setPaymentMethod]=useState("CASH");
  const[paymentReference,setPaymentReference]=useState("");
  const[discount,setDiscount]=useState(0);
  const[message,setMessage]=useState("Scanner ready");
  const[unknown,setUnknown]=useState("");
  const[busy,setBusy]=useState(false);

  const[customers,setCustomers]=useState([]);
  const[customerId,setCustomerId]=useState("");
  const[customerSummary,setCustomerSummary]=useState(null);

  const[reasons,setReasons]=useState([]);
  const[reasonCodeId,setReasonCodeId]=useState("");
  const[reasonNote,setReasonNote]=useState("");
  const[approvalRequestId,setApprovalRequestId]=useState("");
  const[approvalStatus,setApprovalStatus]=useState("");

  const[couponCode,setCouponCode]=useState("");
  const[loyaltyPoints,setLoyaltyPoints]=useState(0);
  const[storeCreditAmount,setStoreCreditAmount]=useState(0);
  const[giftVoucherCode,setGiftVoucherCode]=useState("");
  const[quote,setQuote]=useState(null);

  const active=products.filter((p)=>p.active);

  const results=useMemo(()=>{
    const q=search.trim().toLowerCase();
    if(!q)return[];
    return active.filter((p)=>[p.name,p.brand,p.sku,p.barcode].some((v)=>String(v).toLowerCase().includes(q))).slice(0,8);
  },[search,active]);

  useEffect(()=>{
    if(!navigator.onLine)return;
    Promise.all([
      supabase.from("customers").select("id,full_name,mobile").eq("active",true).order("full_name").limit(300),
      supabase.from("reason_codes").select("id,category,code,label,requires_note").in("category",["DISCOUNT_OVERRIDE","PRICE_OVERRIDE"]).eq("active",true).order("sort_order")
    ]).then(([c,r])=>{
      setCustomers(c.data||[]);
      setReasons(r.data||[]);
    });
  },[]);

  function clearApproval(){setApprovalRequestId("");setApprovalStatus("")}
  function clearQuote(){setQuote(null)}
  function pricingChanged(){clearApproval();clearQuote()}
  function qty(id){return cart.find((i)=>i.product.id===id)?.quantity||0}

  async function loadCustomerSummary(id){
    setCustomerId(id);
    clearQuote();
    setLoyaltyPoints(0);
    setStoreCreditAmount(0);
    if(!id){setCustomerSummary(null);return}
    const{data,error}=await supabase.rpc("customer_commercial_summary",{p_customer_id:id});
    if(error){setCustomerSummary(null);setMessage("Unable to load loyalty/store-credit balance.");return}
    setCustomerSummary(data);
  }

  function add(p){
    const stock=getStock(p.id);
    if(qty(p.id)>=stock){
      errorBeep();
      setMessage(`Only ${stock} unit(s) available for ${p.name}.`);
      return false;
    }
    setCart((rows)=>{
      const current=rows.find((i)=>i.product.id===p.id);
      return current
        ? rows.map((i)=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i)
        : [...rows,{product:p,quantity:1,unitPrice:Number(p.price)}];
    });
    pricingChanged();
    setUnknown("");
    setMessage(`${p.name} added.`);
    successBeep();
    return true;
  }

  function processBarcode(code){
    const p=active.find((x)=>x.barcode===code);
    if(!p){
      errorBeep();
      setUnknown(code);
      setMessage(`PRODUCT NOT FOUND: ${code}`);
      return;
    }
    add(p);
  }

  useEffect(()=>{if(lastScan?.barcode)processBarcode(lastScan.barcode)},[lastScan?.id]);

  function change(id,d){
    const item=cart.find((x)=>x.product.id===id);
    if(!item)return;
    const next=item.quantity+d;
    if(next<=0){pricingChanged();return setCart((rows)=>rows.filter((x)=>x.product.id!==id))}
    if(next>getStock(id)){errorBeep();setMessage(`Only ${getStock(id)} unit(s) available.`);return}
    pricingChanged();
    setCart((rows)=>rows.map((x)=>x.product.id===id?{...x,quantity:next}:x));
  }

  function setUnitPrice(id,value){
    pricingChanged();
    setCart((rows)=>rows.map((x)=>x.product.id===id?{...x,unitPrice:Math.max(0,Number(value||0))}:x));
  }

  const subtotal=cart.reduce((sum,item)=>sum+Number(item.unitPrice??item.product.price)*item.quantity,0);
  const disc=Math.max(0,Number(discount||0));
  const manualTotal=Math.max(0,subtotal-disc);
  const hasPriceOverride=cart.some((item)=>Math.abs(Number(item.unitPrice??item.product.price)-Number(item.product.price))>0.001);
  const needsReason=disc>0||hasPriceOverride;

  const visibleReasons=useMemo(()=>{
    if(hasPriceOverride&&disc>0)return reasons;
    if(hasPriceOverride)return reasons.filter((r)=>r.category==="PRICE_OVERRIDE");
    if(disc>0)return reasons.filter((r)=>r.category==="DISCOUNT_OVERRIDE");
    return[];
  },[reasons,hasPriceOverride,disc]);

  function pricingItems(){
    return cart.map((i)=>({
      product_id:i.product.id,
      quantity:Number(i.quantity),
      unit_price:Number(i.unitPrice??i.product.price)
    }));
  }

  async function requestApproval(){
    if(!reasonCodeId){setMessage("Select a standardized reason first.");return}
    const selected=reasons.find((r)=>r.id===reasonCodeId);
    if(selected?.requires_note&&!reasonNote.trim()){setMessage("This reason requires a note.");return}

    setBusy(true);
    const{data,error}=await supabase.rpc("request_sale_override",{
      p_items:pricingItems(),
      p_discount:disc,
      p_reason_code_id:reasonCodeId,
      p_note:reasonNote.trim()||null
    });
    setBusy(false);

    if(error){
      if(/within cashier policy/i.test(error.message||"")){
        setMessage("This pricing is within cashier policy. Complete the sale normally.");
      }else setMessage(error.message||"Unable to request approval.");
      return;
    }

    setApprovalRequestId(data);
    setApprovalStatus("PENDING");
    setMessage("Approval requested. Manager/Admin can review it in Operations → Approvals.");
  }

  async function refreshApproval(){
    if(!approvalRequestId)return;
    const{data,error}=await supabase.from("sale_override_requests").select("status").eq("id",approvalRequestId).single();
    if(error){setMessage("Unable to refresh approval status.");return}
    setApprovalStatus(data.status);
    setMessage(`Override approval status: ${data.status}.`);
  }

  async function previewBenefits(){
    if(!cart.length){setMessage("Add products before calculating rewards.");return}
    setBusy(true);
    const{data,error}=await supabase.rpc("commercial_quote",{
      p_customer_id:customerId||null,
      p_coupon_code:couponCode.trim()||null,
      p_subtotal:subtotal,
      p_manual_discount:disc,
      p_requested_points:Number(loyaltyPoints||0),
      p_store_credit_amount:Number(storeCreditAmount||0),
      p_gift_voucher_code:giftVoucherCode.trim()||null
    });
    setBusy(false);
    if(error){setQuote(null);setMessage(error.message||"Unable to calculate commercial benefits.");return}
    setQuote(data);
    setMessage("Rewards and tender preview calculated. Final values are revalidated by the database at checkout.");
  }

  async function checkout(){
    if(needsReason&&!reasonCodeId){setMessage("Select a standardized reason for this manual override.");return}
    const selected=reasons.find((r)=>r.id===reasonCodeId);
    if(needsReason&&selected?.requires_note&&!reasonNote.trim()){setMessage("This reason requires a note.");return}

    setBusy(true);
    const r=await completeSale(cart,paymentMethod,{
      discount:disc,
      paymentReference,
      reasonCodeId:reasonCodeId||null,
      reasonNote,
      overrideRequestId:approvalRequestId||null,
      customerId:customerId||null,
      couponCode,
      loyaltyPoints:Number(loyaltyPoints||0),
      storeCreditAmount:Number(storeCreditAmount||0),
      giftVoucherCode
    });

    if(!r.ok){
      setBusy(false);
      if(/OVERRIDE_APPROVAL_REQUIRED/i.test(r.message||"")){
        setMessage("This cashier discount/price change requires manager approval.");
        return;
      }
      if(/OVERRIDE_NOT_APPROVED/i.test(r.message||"")){
        setApprovalStatus("PENDING");setMessage("Approval is still pending.");return;
      }
      if(/OVERRIDE_REQUEST_CHANGED/i.test(r.message||"")){
        clearApproval();setMessage("Cart pricing changed after approval. Request a new approval.");return;
      }
      errorBeep();setMessage(r.message);return;
    }

    setBusy(false);
    successBeep();
    setCart([]);
    setDiscount(0);
    setPaymentReference("");
    setCustomerId("");
    setCustomerSummary(null);
    setReasonCodeId("");
    setReasonNote("");
    clearApproval();
    setCouponCode("");
    setLoyaltyPoints(0);
    setStoreCreditAmount(0);
    setGiftVoucherCode("");
    setQuote(null);

    if(r.offline){setMessage(r.message);return}
    navigate(`/sales/${r.sale.id}`);
  }

  const finalDue=quote?Number(quote.external_payment_due||0):manualTotal;

  return <div>
    <div className="page-heading">
      <div><h2>Fast POS Billing</h2><p>Scan → Cart → Rewards → Pay → Print with controlled overrides.</p></div>
      <button className="secondary-button" onClick={()=>navigate("/pos/scanner")}>Scanner Test</button>
    </div>

    {unknown&&<div className="product-not-found">
      <strong>PRODUCT NOT FOUND</strong><span>{unknown}</span>
      <button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button>
    </div>}

    <div className="pos-layout">
      <div className="pos-left">
        <div className="panel">
          <label>Manual Search<input style={{width:"100%"}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>
          {results.map((p)=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}
          <div className="purchase-message" style={{marginTop:10}}>{message}</div>
        </div>

        <div className="panel" style={{marginTop:14}}>
          <h3>Customer Rewards</h3>
          <label>Customer
            <select value={customerId} onChange={(e)=>loadCustomerSummary(e.target.value)} disabled={!navigator.onLine}>
              <option value="">Walk-in customer</option>
              {customers.map((c)=><option key={c.id} value={c.id}>{c.full_name}{c.mobile?` · ${c.mobile}`:""}</option>)}
            </select>
          </label>
          {customerSummary?<div className="metric-grid two" style={{marginTop:10}}>
            <div className="metric-card"><span>Loyalty Points</span><strong>{customerSummary.loyalty_points}</strong></div>
            <div className="metric-card"><span>Store Credit</span><strong>{money.format(customerSummary.store_credit||0)}</strong></div>
          </div>:null}
          <label>Coupon / Promo Code<input value={couponCode} onChange={(e)=>{setCouponCode(e.target.value);clearQuote()}} placeholder="Optional"/></label>
          <label>Loyalty Points to Redeem<input type="number" min="0" value={loyaltyPoints} onChange={(e)=>{setLoyaltyPoints(e.target.value);clearQuote()}} disabled={!customerId}/></label>
          <label>Store Credit to Use<input type="number" min="0" step="0.01" value={storeCreditAmount} onChange={(e)=>{setStoreCreditAmount(e.target.value);clearQuote()}} disabled={!customerId}/></label>
          <label>Gift Voucher Code<input value={giftVoucherCode} onChange={(e)=>{setGiftVoucherCode(e.target.value);clearQuote()}} placeholder="Optional"/></label>
          <button type="button" className="secondary-button" onClick={previewBenefits} disabled={!cart.length||busy||!navigator.onLine}>Preview Benefits</button>
        </div>
      </div>

      <div className="panel">
        <h3>Cart</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Normal</th><th>Sale Price</th><th>Total</th></tr></thead>
            <tbody>{cart.map((i)=>{
              const changed=Math.abs(Number(i.unitPrice??i.product.price)-Number(i.product.price))>0.001;
              return <tr key={i.product.id}>
                <td>{i.product.name}</td>
                <td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td>
                <td>{money.format(i.product.price)}</td>
                <td><input type="number" min="0" step="0.01" value={i.unitPrice} onChange={(e)=>setUnitPrice(i.product.id,e.target.value)} style={{maxWidth:110}}/>{changed?<small style={{display:"block"}}>Override</small>:null}</td>
                <td>{money.format(Number(i.unitPrice??i.product.price)*i.quantity)}</td>
              </tr>
            })}</tbody>
          </table>
        </div>

        <hr/>
        <p>Subtotal <strong>{money.format(subtotal)}</strong></p>
        <label>Manual Discount (₹)<input type="number" min="0" max={subtotal} value={discount} onChange={(e)=>{setDiscount(e.target.value);pricingChanged()}}/></label>

        {needsReason?<div className="panel" style={{marginTop:12}}>
          <strong>Manual Override Reason</strong>
          <label>Standardized Reason
            <select value={reasonCodeId} onChange={(e)=>{setReasonCodeId(e.target.value);clearApproval()}}>
              <option value="">Select reason</option>
              {visibleReasons.map((r)=><option key={r.id} value={r.id}>{r.label} · {r.category.replaceAll("_"," ")}</option>)}
            </select>
          </label>
          <label>Note<input value={reasonNote} onChange={(e)=>{setReasonNote(e.target.value);clearApproval()}} placeholder="Required for Other"/></label>
        </div>:null}

        {approvalRequestId?<div className="purchase-message" style={{marginTop:10}}>
          Approval: <strong>{approvalStatus||"PENDING"}</strong>
          <button type="button" className="secondary-button" onClick={refreshApproval} style={{marginLeft:8}}>Refresh Status</button>
        </div>:null}

        {quote?<div className="panel" style={{marginTop:12}}>
          <h3>Benefit Preview</h3>
          <p>Promotion: <strong>{quote.promotion_name||"None"}</strong> · {money.format(quote.promotion_discount||0)}</p>
          <p>Loyalty: <strong>{quote.loyalty_points_used||0} points</strong> · {money.format(quote.loyalty_discount||0)}</p>
          <p>Store Credit: <strong>{money.format(quote.store_credit_used||0)}</strong></p>
          <p>Gift Voucher: <strong>{money.format(quote.gift_voucher_used||0)}</strong></p>
        </div>:null}

        <h2>External Payment Due {money.format(finalDue)}</h2>

        <div className="payment-methods">{["CASH","UPI","CARD"].map((m)=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>
        {paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)}/></label>}
        <br/>

        {needsReason&&!approvalRequestId?<button type="button" className="secondary-button" disabled={!cart.length||busy||!navigator.onLine} onClick={requestApproval} style={{marginRight:8}}>{busy?"Working...":"Request Approval (if required)"}</button>:null}
        <button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button>
      </div>
    </div>
  </div>
}
