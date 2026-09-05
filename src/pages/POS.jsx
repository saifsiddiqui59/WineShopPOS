import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useScanner } from "../context/ScannerContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { findProductByBarcode, normalizeBarcode } from "../lib/barcode";
import { getReceiptAutoPrint, setReceiptAutoPrint } from "../lib/receiptPrintPreference";
import ProductThumb from "../components/ui/ProductThumb";
import ShiftRequiredDialog from "../components/ui/ShiftRequiredDialog";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function POS(){
  const{products,getStock,completeSale}=useShop();
  const{lastScan,successBeep,errorBeep}=useScanner();
  const { profile } = useAuth();
  const navigate=useNavigate();

  const[search,setSearch]=useState("");
  const[categoryFilter,setCategoryFilter]=useState("ALL");
  const[cart,setCart]=useState([]);
  const cartStorageKey=useMemo(()=>`wineshop_pos_cart_v3_${profile?.shop_id||"unknown"}`,[profile?.shop_id]);
  const loadedCartKeyRef=useRef("");
  const posMountedAtRef=useRef(Date.now());
  const searchInputRef=useRef(null);
  const[paymentMethod,setPaymentMethod]=useState("CASH");
  const[paymentReference,setPaymentReference]=useState("");
  const[discount,setDiscount]=useState(0);
  const[message,setMessage]=useState("Scanner ready");
  const[unknown,setUnknown]=useState("");
  const[busy,setBusy]=useState(false);
  const[autoPrint,setAutoPrint]=useState(false);
  const[shiftOpen,setShiftOpen]=useState(false);
  const[shiftLoading,setShiftLoading]=useState(true);
  const[shiftBusy,setShiftBusy]=useState(false);
  const[openingCash,setOpeningCash]=useState(0);
  const[shiftMessage,setShiftMessage]=useState("");

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
  const shiftStorageKey=useMemo(
    ()=>`wineshop_open_shift_v1_${profile?.shop_id||"shop"}_${profile?.user_id||"user"}`,
    [profile?.shop_id,profile?.user_id],
  );

  const refreshShiftState=useCallback(async()=>{
    if(!profile?.shop_id||!profile?.user_id){
      setShiftOpen(false);
      setShiftLoading(false);
      return false;
    }

    if(!navigator.onLine){
      const cached=sessionStorage.getItem(shiftStorageKey);
      setShiftOpen(Boolean(cached));
      setShiftLoading(false);
      setShiftMessage(
        cached
          ?"Using the shift verified earlier in this browser session."
          :"Connect to the internet to verify or start your shift.",
      );
      return Boolean(cached);
    }

    setShiftLoading(true);
    const{data,error}=await supabase
      .from("cashier_shifts")
      .select("id,status,opened_at")
      .eq("shop_id",profile.shop_id)
      .eq("cashier_id",profile.user_id)
      .eq("status","OPEN")
      .order("opened_at",{ascending:false})
      .limit(1);

    if(error){
      setShiftOpen(false);
      setShiftMessage(error.message||"Unable to verify your shift.");
      setShiftLoading(false);
      return false;
    }

    const current=data?.[0]||null;
    setShiftOpen(Boolean(current));
    setShiftMessage("");
    if(current?.id)sessionStorage.setItem(shiftStorageKey,current.id);
    else sessionStorage.removeItem(shiftStorageKey);
    setShiftLoading(false);
    return Boolean(current);
  },[profile?.shop_id,profile?.user_id,shiftStorageKey]);

  useEffect(()=>{
    void refreshShiftState();
    const online=()=>void refreshShiftState();
    const visible=()=>{if(document.visibilityState==="visible")void refreshShiftState();};
    window.addEventListener("online",online);
    document.addEventListener("visibilitychange",visible);
    return()=>{
      window.removeEventListener("online",online);
      document.removeEventListener("visibilitychange",visible);
    };
  },[refreshShiftState]);

  async function startShiftFromPOS(){
    if(!navigator.onLine){
      setShiftMessage("Connect to the internet to start your shift.");
      return;
    }
    const amount=Number(openingCash||0);
    if(!Number.isFinite(amount)||amount<0){
      setShiftMessage("Opening Cash must be zero or a positive amount.");
      return;
    }

    setShiftBusy(true);
    setShiftMessage("");
    const{data,error}=await supabase.rpc("open_shift",{
      p_opening_cash:amount,
      p_notes:"Shift opened from POS billing gate.",
    });
    setShiftBusy(false);

    if(error){
      setShiftMessage(error.message||"Unable to start shift.");
      await refreshShiftState();
      return;
    }

    if(data)sessionStorage.setItem(shiftStorageKey,data);
    setShiftOpen(true);
    setShiftMessage("");
    setMessage("Shift opened. POS billing is ready.");
    searchInputRef.current?.focus();
  }

  function requireOpenShift(){
    if(shiftLoading||!shiftOpen){
      setMessage("Start your shift before making any bill.");
      errorBeep();
      return false;
    }
    return true;
  }

  useEffect(()=>{
    setAutoPrint(getReceiptAutoPrint(profile?.shop_id));
  },[profile?.shop_id]);

  useEffect(()=>{
    searchInputRef.current?.focus();
  },[]);

  function toggleAutoPrint(){
    const next=!autoPrint;
    setAutoPrint(next);
    setReceiptAutoPrint(profile?.shop_id,next);
    setMessage(`Automatic receipt print ${next?"enabled":"disabled"} on this device.`);
  }

  useEffect(()=>{
    if(!profile?.shop_id||!products.length||loadedCartKeyRef.current===cartStorageKey)return;
    try{
      const saved=JSON.parse(sessionStorage.getItem(cartStorageKey)||"[]");
      const restored=Array.isArray(saved)?saved.map((row)=>{
        const product=products.find((p)=>p.id===row.productId&&p.active);
        if(!product)return null;
        return {product,quantity:Math.max(1,Number(row.quantity||1)),unitPrice:Number(row.unitPrice??product.price)};
      }).filter(Boolean):[];
      setCart(restored);
    }catch{sessionStorage.removeItem(cartStorageKey);setCart([]);}
    finally{loadedCartKeyRef.current=cartStorageKey;}
  },[cartStorageKey,profile?.shop_id,products]);

  useEffect(()=>{
    if(loadedCartKeyRef.current!==cartStorageKey)return;
    const snapshot=cart.map((i)=>({productId:i.product.id,quantity:Number(i.quantity),unitPrice:Number(i.unitPrice??i.product.price)}));
    if(snapshot.length)sessionStorage.setItem(cartStorageKey,JSON.stringify(snapshot));
    else sessionStorage.removeItem(cartStorageKey);
  },[cart,cartStorageKey]);

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
    if(!requireOpenShift())return false;
    if(Number(p.price)<=0){errorBeep();setMessage(`${p.name} has no selling price. Edit the product before billing.`);return false;}
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
    const normalized=normalizeBarcode(code);
    const p=findProductByBarcode(active,normalized);
    if(!p){
      errorBeep();
      setUnknown(normalized);
      setMessage(`PRODUCT NOT FOUND: ${normalized}`);
      return;
    }
    add(p);
  }

  useEffect(()=>{
    if(!lastScan?.barcode)return;
    const scannedAt=Date.parse(lastScan.at||"");
    if(Number.isFinite(scannedAt)&&scannedAt<posMountedAtRef.current)return;
    processBarcode(lastScan.barcode);
  },[lastScan?.id]);

  function removeItem(id){
    pricingChanged();setCart((rows)=>rows.filter((x)=>x.product.id!==id));
    setMessage("Product removed from current bill.");
  }

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
    if(!requireOpenShift())return;
    if(cart.some((i)=>Number(i.unitPrice??i.product.price)<=0)){setMessage("Cart contains a product with no selling price. Remove it or edit the product first.");return;}
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
      if(/SHIFT_REQUIRED/i.test(r.message||"")){
        setShiftOpen(false);
        sessionStorage.removeItem(shiftStorageKey);
        setMessage("Start your shift before making any bill.");
        errorBeep();
        return;
      }
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
    sessionStorage.removeItem(cartStorageKey);
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
    navigate(autoPrint?`/sales/${r.sale.id}?print=1`:`/sales/${r.sale.id}`);
  }

  const finalDue=quote?Number(quote.external_payment_due||0):manualTotal;
  const categoryOptions=[
    "ALL",
    ...Array.from(new Set(active.map((p)=>String(p.category||"").trim()).filter(Boolean))),
  ];
  const quickProducts=active
    .filter((p)=>categoryFilter==="ALL"||p.category===categoryFilter)
    .slice(0,18);
  const displayProducts=search.trim()?results:quickProducts;
  const cartUnits=cart.reduce((sum,item)=>sum+Number(item.quantity||0),0);

  return <div className="pos-page pos-v5h">
    {!shiftOpen ? <ShiftRequiredDialog
      loading={shiftLoading}
      online={navigator.onLine}
      openingCash={openingCash}
      onOpeningCash={setOpeningCash}
      onStart={startShiftFromPOS}
      busy={shiftBusy}
      message={shiftMessage}
    /> : null}
    <div className="page-heading pos-v5h-heading">
      <div>
        <h2>Fast POS Billing</h2>
        <p>Scan or tap products, check the bill, take payment. Advanced controls stay out of the way until needed.</p>
      </div>
      <div className="button-row pos-v5h-top-actions">
        <button type="button" className="secondary-button" onClick={toggleAutoPrint}>Auto Print: {autoPrint?"ON":"OFF"}</button>
        <button
          type="button"
          className="secondary-button pos-v5h-clear"
          disabled={!cart.length}
          onClick={()=>{setCart([]);pricingChanged();setMessage("Current bill cleared.");searchInputRef.current?.focus();}}
        >
          Clear Bill
        </button>
      </div>
    </div>

    {unknown?<div className="product-not-found pos-v5h-unknown">
      <strong>PRODUCT NOT FOUND</strong><span>{unknown}</span>
      <span className="muted-text">Nothing is saved unless you choose Add Product.</span>
      <button type="button" className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button>
      <button type="button" className="secondary-button" onClick={()=>{setUnknown("");setMessage("Scanner ready");searchInputRef.current?.focus();}}>× Ignore / Continue</button>
    </div>:null}

    <div className="pos-v5h-shell">
      <section className="pos-v5h-catalog">
        <div className="panel pos-v5h-search-dock">
          <div className="pos-v5h-search-meta">
            <div>
              <span className={`pos-v5h-connection ${navigator.onLine?"online":"offline"}`}>{navigator.onLine?"ONLINE":"OFFLINE"}</span>
              <strong>Scan barcode or search product</strong>
            </div>
            <small>{active.length} active products</small>
          </div>
          <input
            ref={searchInputRef}
            className="pos-v5h-search-input"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Scan barcode, or type product name / brand / SKU..."
            autoComplete="off"
            aria-label="Scan barcode or search products"
          />
          <div className="pos-v5h-status-line" role="status">{message}</div>
        </div>

        {!search.trim()?<div className="pos-v5h-category-strip">
          {categoryOptions.map((category)=>(
            <button
              type="button"
              key={category}
              className={categoryFilter===category?"pos-v5h-category active":"pos-v5h-category"}
              onClick={()=>{setCategoryFilter(category);setSearch("");searchInputRef.current?.focus();}}
            >
              {category==="ALL"?"All Products":category}
            </button>
          ))}
        </div>:null}

        <div className="pos-v5h-catalog-header">
          <div><strong>{search.trim()?"Search Results":categoryFilter==="ALL"?"Quick Products":categoryFilter}</strong><span>{displayProducts.length} shown</span></div>
          {search?<button type="button" className="text-button" onClick={()=>{setSearch("");searchInputRef.current?.focus();}}>Clear search</button>:null}
        </div>

        {displayProducts.length?<div className="pos-v5h-product-grid">
          {displayProducts.map((product)=>{
            const stock=getStock(product.id);
            const inCart=qty(product.id);
            return <button
              type="button"
              key={product.id}
              className={`pos-v5h-product-tile${stock<=0?" sold-out":""}`}
              disabled={stock<=0}
              onClick={()=>{if(add(product)){setSearch("");searchInputRef.current?.focus();}}}
            >
              <div className="pos-v5h-product-top">
                <ProductThumb product={product} size="md"/>
                {inCart>0?<span className="pos-v5h-cart-badge">{inCart}</span>:null}
              </div>
              <strong className="pos-v5h-product-name">{product.name}</strong>
              <span className="pos-v5h-product-meta">{[product.brand,product.size].filter(Boolean).join(" · ")}</span>
              <div className="pos-v5h-product-foot">
                <strong>{money.format(product.price)}</strong>
                <span className={stock<=product.minimumStock?"low":""}>{stock<=0?"Out of stock":`Stock ${stock}`}</span>
              </div>
            </button>
          })}
        </div>:<div className="panel pos-v5h-empty-products"><strong>No matching product</strong><span>Try another name, barcode, SKU or category.</span></div>}

        <details className="panel pos-v5h-customer-tools">
          <summary>
            <span><strong>Customer & Offers</strong><small>Optional loyalty, coupon, store credit and gift voucher</small></span>
            <span className="pos-v5h-summary-action">Open</span>
          </summary>
          <div className="pos-v5h-customer-body">
            <label>Customer
              <select value={customerId} onChange={(e)=>loadCustomerSummary(e.target.value)} disabled={!navigator.onLine}>
                <option value="">Walk-in customer</option>
                {customers.map((c)=><option key={c.id} value={c.id}>{c.full_name}{c.mobile?` · ${c.mobile}`:""}</option>)}
              </select>
            </label>

            {customerSummary?<div className="metric-grid two pos-v5h-customer-metrics">
              <div className="metric-card"><span>Loyalty Points</span><strong>{customerSummary.loyalty_points}</strong></div>
              <div className="metric-card"><span>Store Credit</span><strong>{money.format(customerSummary.store_credit||0)}</strong></div>
            </div>:null}

            <div className="pos-v5h-offer-grid">
              <label>Coupon / Promo<input value={couponCode} onChange={(e)=>{setCouponCode(e.target.value);clearQuote()}} placeholder="Optional"/></label>
              <label>Loyalty Points<input type="number" min="0" value={loyaltyPoints} onChange={(e)=>{setLoyaltyPoints(e.target.value);clearQuote()}} disabled={!customerId}/></label>
              <label>Store Credit<input type="number" min="0" step="0.01" value={storeCreditAmount} onChange={(e)=>{setStoreCreditAmount(e.target.value);clearQuote()}} disabled={!customerId}/></label>
              <label>Gift Voucher<input value={giftVoucherCode} onChange={(e)=>{setGiftVoucherCode(e.target.value);clearQuote()}} placeholder="Optional"/></label>
            </div>
            <button type="button" className="secondary-button" onClick={previewBenefits} disabled={!cart.length||busy||!navigator.onLine}>Preview Benefits</button>
          </div>
        </details>
      </section>

      <aside className="panel pos-v5h-cart-panel">
        <div className="pos-v5h-cart-header">
          <div><span>CURRENT SALE</span><h3>{cart.length?`${cart.length} line${cart.length===1?"":"s"}`:"New bill"}</h3></div>
          <strong>{cartUnits} item{cartUnits===1?"":"s"}</strong>
        </div>

        <div className="pos-v5h-cart-list">
          {!cart.length?<div className="pos-v5h-cart-empty"><strong>Ready to bill</strong><span>Scan a barcode or tap a product tile.</span></div>:cart.map((item)=>{
            const changed=Math.abs(Number(item.unitPrice??item.product.price)-Number(item.product.price))>0.001;
            return <article className="pos-v5h-cart-line" key={item.product.id}>
              <div className="pos-v5h-cart-product">
                <ProductThumb product={item.product} size="sm"/>
                <div><strong>{item.product.name}</strong><span>{item.product.size}{changed?` · Normal ${money.format(item.product.price)}`:""}</span></div>
                <button type="button" className="pos-v5h-remove" aria-label={`Remove ${item.product.name}`} onClick={()=>removeItem(item.product.id)}>×</button>
              </div>
              <div className="pos-v5h-cart-controls">
                <div className="pos-v5h-quantity">
                  <button type="button" onClick={()=>change(item.product.id,-1)}>−</button><strong>{item.quantity}</strong><button type="button" onClick={()=>change(item.product.id,1)}>+</button>
                </div>
                <label className="pos-v5h-price"><span>Sale price</span><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e)=>setUnitPrice(item.product.id,e.target.value)}/></label>
                <strong className="pos-v5h-line-total">{money.format(Number(item.unitPrice??item.product.price)*item.quantity)}</strong>
              </div>
            </article>
          })}
        </div>

        <div className="pos-v5h-bill-summary">
          <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
          <label className="pos-v5h-discount">
            <span>Manual Discount</span>
            <span className="pos-v5h-money-input"><b>₹</b><input type="number" min="0" max={subtotal} value={discount} onChange={(e)=>{setDiscount(e.target.value);pricingChanged()}}/></span>
          </label>
        </div>

        {needsReason?<div className="pos-v5h-override">
          <strong>Manual Override</strong><p>Choose the reason for discount or changed sale price.</p>
          <label>Standardized Reason
            <select value={reasonCodeId} onChange={(e)=>{setReasonCodeId(e.target.value);clearApproval()}}>
              <option value="">Select reason</option>
              {visibleReasons.map((r)=><option key={r.id} value={r.id}>{r.label} · {r.category.replaceAll("_"," ")}</option>)}
            </select>
          </label>
          <label>Note<input value={reasonNote} onChange={(e)=>{setReasonNote(e.target.value);clearApproval()}} placeholder="Required for Other"/></label>
        </div>:null}

        {approvalRequestId?<div className="purchase-message pos-v5h-approval">
          Approval: <strong>{approvalStatus||"PENDING"}</strong>
          <button type="button" className="secondary-button" onClick={refreshApproval}>Refresh Status</button>
        </div>:null}

        {quote?<div className="pos-v5h-benefits">
          <strong>Applied Benefits</strong>
          <div><span>Promotion</span><b>{quote.promotion_name||"None"} · {money.format(quote.promotion_discount||0)}</b></div>
          <div><span>Loyalty</span><b>{quote.loyalty_points_used||0} pts · {money.format(quote.loyalty_discount||0)}</b></div>
          <div><span>Store Credit</span><b>{money.format(quote.store_credit_used||0)}</b></div>
          <div><span>Gift Voucher</span><b>{money.format(quote.gift_voucher_used||0)}</b></div>
        </div>:null}

        <div className="pos-v5h-payment">
          <div className="pos-v5h-due"><span>AMOUNT TO COLLECT</span><strong>{money.format(finalDue)}</strong></div>
          <div className="pos-v5h-payment-methods">
            {["CASH","UPI","CARD"].map((m)=><button type="button" key={m} className={paymentMethod===m?"pos-v5h-payment-button active":"pos-v5h-payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}
          </div>

          {paymentMethod!=="CASH"?<label>Payment Reference<input value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)} placeholder={`${paymentMethod} reference`}/></label>:null}

          {needsReason&&!approvalRequestId?<button type="button" className="secondary-button pos-v5h-approval-button" disabled={!cart.length||busy||!navigator.onLine} onClick={requestApproval}>{busy?"Working...":"Request Approval (if required)"}</button>:null}

          <button type="button" className="primary-button pos-v5h-complete" disabled={!cart.length||busy} onClick={checkout}>
            {busy?"Processing...":navigator.onLine?`Complete Sale · ${money.format(finalDue)}`:"Save Offline Sale"}
          </button>
        </div>
      </aside>
    </div>
  </div>
}
