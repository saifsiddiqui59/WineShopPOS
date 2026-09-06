# Chapter 16 — Actual Release Code

> This chapter was delivered in the combined Chapters 16-26 release commit.

## Shared release commit

```text
Commit: da2b8d6db139bd0d73e4eb5ee56613e7a759b9ce
Short: da2b8d6
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T16:39:59-04:00
Subject: Chapters 16-26 - Production operations offline OCR and audit
```

## Feature-specific canonical source snapshots

### `src/context/ScannerContext.jsx`

`````jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const ScannerContext = createContext(null);
const SETTINGS_KEY = "wineshop_scanner_settings_v1";

const defaults = {
  enabled: true,
  minLength: 6,
  maxAverageGapMs: 55,
  resetGapMs: 160,
  successFrequency: 1046,
  errorFrequency: 220,
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

function isEditable(el) {
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

function snapshotEditable(el) {
  if (!isEditable(el)) return null;
  return {
    element: el,
    value: "value" in el ? el.value : el.textContent,
    start: typeof el.selectionStart === "number" ? el.selectionStart : null,
    end: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
  };
}

function restoreEditable(snapshot) {
  if (!snapshot?.element?.isConnected) return;
  const el = snapshot.element;
  if ("value" in el) {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set;
    if (setter) setter.call(el, snapshot.value);
    else el.value = snapshot.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    el.textContent = snapshot.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  try {
    if (snapshot.start !== null) el.setSelectionRange(snapshot.start, snapshot.end);
  } catch {}
}

function tone(frequency, duration = 90, volume = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  } catch {}
}

export function ScannerProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings);
  const [lastScan, setLastScan] = useState(null);
  const buffer = useRef([]);
  const times = useRef([]);
  const initialFocusSnapshot = useRef(null);
  const lastKeyAt = useRef(0);

  function saveSettings(next) {
    const merged = { ...settings, ...next };
    setSettingsState(merged);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  }

  function successBeep() {
    tone(settings.successFrequency, 80, 0.06);
  }

  function errorBeep() {
    tone(settings.errorFrequency, 180, 0.1);
  }

  useEffect(() => {
    function reset() {
      buffer.current = [];
      times.current = [];
      initialFocusSnapshot.current = null;
      lastKeyAt.current = 0;
    }

    function onKeyDown(event) {
      if (!settings.enabled || event.ctrlKey || event.altKey || event.metaKey) return;
      const now = performance.now();
      const gap = lastKeyAt.current ? now - lastKeyAt.current : 0;

      if (lastKeyAt.current && gap > settings.resetGapMs) reset();

      if (event.key === "Enter") {
        if (!buffer.current.length) return;
        const chars = buffer.current.join("");
        const gaps = times.current.slice(1).map((t, i) => t - times.current[i]);
        const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 999;
        const scannerLike = chars.length >= settings.minLength && avgGap <= settings.maxAverageGapMs;

        if (scannerLike) {
          event.preventDefault();
          event.stopPropagation();
          restoreEditable(initialFocusSnapshot.current);
          setLastScan({
            id: crypto.randomUUID(),
            barcode: chars,
            at: new Date().toISOString(),
            averageGapMs: Math.round(avgGap),
            length: chars.length,
          });
          requestAnimationFrame(() => initialFocusSnapshot.current?.element?.focus?.());
        }
        reset();
        return;
      }

      if (event.key.length !== 1) return;

      if (!buffer.current.length) initialFocusSnapshot.current = snapshotEditable(document.activeElement);
      buffer.current.push(event.key);
      times.current.push(now);
      lastKeyAt.current = now;

      // Once a rapid sequence is confidently scanner-like, block subsequent characters.
      // The first few characters are restored on Enter from the saved field snapshot.
      if (buffer.current.length >= 4) {
        const recent = times.current.slice(-4);
        const recentAvg = (recent[3] - recent[0]) / 3;
        if (recentAvg <= settings.maxAverageGapMs) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [settings]);

  const value = useMemo(
    () => ({ settings, saveSettings, lastScan, successBeep, errorBeep }),
    [settings, lastScan]
  );

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
}

export function useScanner() {
  const value = useContext(ScannerContext);
  if (!value) throw new Error("useScanner must be inside ScannerProvider");
  return value;
}
`````

### `src/pages/POS.jsx`

`````jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useScanner } from "../context/ScannerContext";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function POS(){const{products,getStock,completeSale}=useShop();const{lastScan,successBeep,errorBeep}=useScanner();const navigate=useNavigate();const[search,setSearch]=useState("");const[cart,setCart]=useState([]);const[paymentMethod,setPaymentMethod]=useState("CASH");const[paymentReference,setPaymentReference]=useState("");const[discount,setDiscount]=useState(0);const[message,setMessage]=useState("Scanner ready");const[unknown,setUnknown]=useState("");const[busy,setBusy]=useState(false);
const active=products.filter((p)=>p.active);const results=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return active.filter((p)=>[p.name,p.brand,p.sku,p.barcode].some((v)=>String(v).toLowerCase().includes(q))).slice(0,8)},[search,active]);
function qty(id){return cart.find((i)=>i.product.id===id)?.quantity||0}function add(p){const stock=getStock(p.id);if(qty(p.id)>=stock){errorBeep();setMessage(`Only ${stock} unit(s) available for ${p.name}.`);return false}setCart((c)=>{const x=c.find((i)=>i.product.id===p.id);return x?c.map((i)=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{product:p,quantity:1}]});setUnknown("");setMessage(`${p.name} added.`);successBeep();return true}
function processBarcode(code){const p=active.find((x)=>x.barcode===code);if(!p){errorBeep();setUnknown(code);setMessage(`PRODUCT NOT FOUND: ${code}`);return}add(p)}
useEffect(()=>{if(lastScan?.barcode)processBarcode(lastScan.barcode)},[lastScan?.id]);
function change(id,d){const i=cart.find((x)=>x.product.id===id);if(!i)return;const next=i.quantity+d;if(next<=0)return setCart((c)=>c.filter((x)=>x.product.id!==id));if(next>getStock(id)){errorBeep();return setMessage(`Only ${getStock(id)} unit(s) available.`)}setCart((c)=>c.map((x)=>x.product.id===id?{...x,quantity:next}:x))}
const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0);const disc=Math.max(0,Number(discount||0));const total=Math.max(0,subtotal-disc);
async function checkout(){setBusy(true);const r=await completeSale(cart,paymentMethod,{discount:disc,paymentReference});setBusy(false);if(!r.ok){errorBeep();setMessage(r.message);return}successBeep();setCart([]);setDiscount(0);setPaymentReference("");if(r.offline){setMessage(r.message);return}navigate(`/sales/${r.sale.id}`)}
return <div><div className="page-heading"><div><h2>POS Billing</h2><p>Global HID scanner active — scan from anywhere on this page.</p></div><button className="secondary-button" onClick={()=>navigate("/scanner-settings")}>Scanner Test</button></div>
{unknown&&<div className="product-not-found"><strong>PRODUCT NOT FOUND</strong><span>{unknown}</span><button className="primary-button" onClick={()=>navigate(`/products/new?barcode=${encodeURIComponent(unknown)}`)}>Add Product with this Barcode</button></div>}
<div className="pos-layout"><div className="pos-left"><div className="panel"><label>Manual Search<input style={{width:"100%"}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name, barcode, SKU, brand..."/></label>{results.map((p)=><button key={p.id} className="search-result" onClick={()=>add(p)}><span>{p.name}</span><span>{money.format(p.price)} · Stock {getStock(p.id)}</span></button>)}<div className="purchase-message" style={{marginTop:10}}>{message}</div></div><div className="panel scanner-commercial-card" style={{marginTop:14}}><strong>Scanner mode</strong><p>Rapid keystrokes + Enter are captured globally. Scanner text is removed from discount/payment fields automatically.</p><p>Test barcode: <code>8900000010016</code></p></div></div>
<div className="panel"><h3>Cart</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{cart.map((i)=><tr key={i.product.id}><td>{i.product.name}</td><td><button onClick={()=>change(i.product.id,-1)}>-</button> {i.quantity} <button onClick={()=>change(i.product.id,1)}>+</button></td><td>{money.format(i.product.price)}</td><td>{money.format(i.product.price*i.quantity)}</td></tr>)}</tbody></table></div><hr/><p>Subtotal <strong>{money.format(subtotal)}</strong></p><label>Discount<input type="number" min="0" max={subtotal} value={discount} onChange={(e)=>setDiscount(e.target.value)}/></label><h2>Total {money.format(total)}</h2><div className="payment-methods">{["CASH","UPI","CARD"].map((m)=><button type="button" key={m} className={paymentMethod===m?"payment-button active":"payment-button"} onClick={()=>setPaymentMethod(m)}>{m}</button>)}</div>{paymentMethod!=="CASH"&&<label>Payment Reference<input value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)}/></label>}<br/><button className="primary-button" disabled={!cart.length||busy} onClick={checkout}>{busy?"Processing...":navigator.onLine?"Complete Sale":"Save Offline Sale"}</button></div></div></div>}
`````

### `src/pages/ScannerSettings.jsx`

`````jsx
import { useEffect, useState } from "react";
import { useScanner } from "../context/ScannerContext";

export default function ScannerSettings() {
  const { settings, saveSettings, lastScan, successBeep, errorBeep } = useScanner();
  const [draft, setDraft] = useState(settings);
  const [history, setHistory] = useState([]);

  useEffect(() => setDraft(settings), [settings]);
  useEffect(() => { if (lastScan) setHistory((h) => [lastScan, ...h].slice(0, 10)); }, [lastScan]);

  return (
    <div>
      <div className="page-heading"><div><h2>Scanner Test & Settings</h2><p>USB/Bluetooth HID barcode scanner diagnostics</p></div></div>
      <div className="settings-grid">
        <section className="panel">
          <h3>Detection</h3>
          <div className="settings-fields">
            <label><input type="checkbox" checked={draft.enabled} onChange={(e)=>setDraft({...draft,enabled:e.target.checked})}/> Global scanner enabled</label>
            <label>Minimum barcode length<input type="number" min="3" max="40" value={draft.minLength} onChange={(e)=>setDraft({...draft,minLength:Number(e.target.value)})}/></label>
            <label>Maximum average key gap (ms)<input type="number" min="10" max="150" value={draft.maxAverageGapMs} onChange={(e)=>setDraft({...draft,maxAverageGapMs:Number(e.target.value)})}/></label>
            <label>Sequence reset gap (ms)<input type="number" min="80" max="1000" value={draft.resetGapMs} onChange={(e)=>setDraft({...draft,resetGapMs:Number(e.target.value)})}/></label>
          </div>
          <br/><button className="primary-button" onClick={()=>saveSettings(draft)}>Save Scanner Settings</button>
        </section>
        <section className="panel scanner-test-zone">
          <h3>Live Test</h3>
          <p>Click anywhere or type in another field, then scan a barcode. The scanner listener is global.</p>
          {lastScan ? <div className="scanner-last"><strong>{lastScan.barcode}</strong><span>{lastScan.length} chars · avg gap {lastScan.averageGapMs} ms</span></div> : <div className="scanner-last muted">No scan detected yet</div>}
          <div className="button-row"><button className="secondary-button" onClick={successBeep}>Test success beep</button><button className="secondary-button" onClick={errorBeep}>Test error beep</button></div>
        </section>
      </div>
      <section className="panel" style={{marginTop:16}}><h3>Last 10 scans</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Barcode</th><th>Time</th><th>Avg gap</th></tr></thead><tbody>{history.map((s)=><tr key={s.id}><td>{s.barcode}</td><td>{new Date(s.at).toLocaleTimeString()}</td><td>{s.averageGapMs} ms</td></tr>)}</tbody></table></div></section>
    </div>
  );
}
`````

### `src/pages/AddProduct.jsx`

`````jsx
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function AddProduct(){const{addProduct}=useShop();const navigate=useNavigate();const[params]=useSearchParams();const barcode=params.get("barcode")||"";async function save(form){const r=await addProduct(form);if(r.ok)navigate("/products");return r}return <div><div className="page-heading"><div><h2>Add Product</h2><p>{barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div></div><ProductForm key={barcode||"new"} initialValue={barcode?{barcode}:undefined} showOpeningStock onSubmit={save} submitLabel="Create Product"/></div>}
`````

### `src/context/ShopContext.jsx`

`````jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { listOfflineSales, queueOfflineSale, removeOfflineSale, setOfflineSaleStatus } from "../lib/offlineQueue";

const ShopContext = createContext(null);
const DATA_CACHE_KEY = "wineshop_cloud_cache_v2";

const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

function normalizeProduct(row) {
  return {
    id: row.id, barcode: row.barcode ?? "", sku: row.sku ?? "", name: row.product_name ?? "",
    brand: row.brand ?? "", category: row.category_name ?? row.categories?.name ?? "", categoryId: row.category_id ?? null,
    subcategory: row.subcategory ?? "", sizeMl: num(row.size_ml), size: `${num(row.size_ml)} ml`,
    alcoholPercentage: row.alcohol_percentage == null ? null : num(row.alcohol_percentage),
    purchasePrice: row.purchase_price == null ? 0 : num(row.purchase_price), mrp: num(row.mrp), price: num(row.selling_price),
    minimumStock: num(row.minimum_stock), unitsPerCase: num(row.units_per_case) || 1, active: row.active !== false,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function normalizeSale(row, productById) {
  const payment = (row.payments || []).find((p) => p.payment_type !== "REFUND") || row.payments?.[0] || null;
  return {
    id: row.id, invoiceNumber: row.invoice_number, createdAt: row.created_at, cashierId: row.cashier_id,
    shiftId: row.shift_id, clientSaleId: row.client_sale_id, offlineCreatedAt: row.offline_created_at,
    paymentMethod: payment?.payment_method ?? "", paymentReference: payment?.reference_number ?? "",
    subtotal: num(row.subtotal), discount: num(row.discount), grandTotal: num(row.grand_total), status: row.status,
    items: (row.sale_items || []).map((item) => ({ id: item.id, productId: item.product_id,
      productName: item.product_name_snapshot, barcode: item.barcode_snapshot, quantity: num(item.quantity),
      unitPrice: num(item.unit_price), purchasePrice: num(productById[item.product_id]?.purchasePrice), lineTotal: num(item.line_total) })),
  };
}

function normalizePurchase(row, productById) {
  const items = (row.purchase_items || []).map((item) => ({ id: item.id, productId: item.product_id,
    productName: productById[item.product_id]?.name ?? "Product", barcode: productById[item.product_id]?.barcode ?? "",
    purchaseUnit: item.purchase_unit, caseCount: num(item.case_count), unitsPerCase: num(item.units_per_case) || 1,
    looseBottles: num(item.loose_bottles), quantity: num(item.quantity), purchasePrice: num(item.purchase_price), lineTotal: num(item.line_total) }));
  return { id: row.id, purchaseNumber: row.purchase_number, supplierId: row.supplier_id,
    supplierName: row.supplier_name_snapshot ?? "Supplier", invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date, createdAt: row.created_at, notes: row.notes ?? "", total: num(row.total),
    totalUnits: items.reduce((s, i) => s + i.quantity, 0), items };
}

function readCache() { try { return JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || "null"); } catch { return null; } }
function writeCache(data) { try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ ...data, cachedAt: new Date().toISOString() })); } catch {} }

export function ShopProvider({ children }) {
  const { user, profile, access } = useAuth();
  const cached = readCache();
  const [products, setProducts] = useState(cached?.products || []);
  const [inventory, setInventory] = useState(cached?.inventory || {});
  const [sales, setSales] = useState(cached?.sales || []);
  const [purchases, setPurchases] = useState(cached?.purchases || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [suppliers, setSuppliers] = useState(cached?.suppliers || []);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const canUseShop = Boolean(user && profile?.active && access?.allowed);

  const refreshAll = useCallback(async () => {
    if (!canUseShop) return { ok: false, message: "Shop session is not active." };
    if (!navigator.onLine) {
      const c = readCache();
      if (c) { setProducts(c.products || []); setInventory(c.inventory || {}); setSales(c.sales || []); setPurchases(c.purchases || []); setCategories(c.categories || []); setSuppliers(c.suppliers || []); }
      return { ok: Boolean(c), offline: true, message: c ? "Using cached offline data." : "No cached shop data." };
    }
    setLoadingData(true); setDataError("");
    try {
      const [categoriesResult, suppliersResult, productsResult, inventoryResult] = await Promise.all([
        supabase.from("categories").select("id,name,active").order("name"),
        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("suppliers").select("id,supplier_name,active").order("supplier_name"),
        supabase.rpc("get_products"),
        supabase.from("inventory").select("product_id,quantity,reserved_quantity"),
      ]);
      for (const r of [categoriesResult, suppliersResult, productsResult, inventoryResult]) if (r.error) throw r.error;
      const normalizedProducts = (productsResult.data || []).map(normalizeProduct);
      const productById = Object.fromEntries(normalizedProducts.map((p) => [p.id, p]));
      const stockMap = Object.fromEntries((inventoryResult.data || []).map((r) => [r.product_id, num(r.quantity)]));
      let salesQuery = supabase.from("sales").select(`id,invoice_number,subtotal,discount,grand_total,payment_status,cashier_id,status,notes,created_at,shift_id,client_sale_id,offline_created_at,sale_items(id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total),payments(id,payment_method,amount,reference_number,payment_type,created_at)`).order("created_at", { ascending: false }).limit(1000);
      if (profile?.role === "CASHIER") salesQuery = salesQuery.eq("cashier_id", profile.user_id);
      const [salesResult, purchasesResult] = await Promise.all([
        salesQuery,
        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("purchases").select(`id,purchase_number,supplier_id,supplier_name_snapshot,invoice_number,invoice_date,subtotal,tax,total,status,notes,created_at,purchase_items(id,product_id,quantity,purchase_unit,case_count,units_per_case,loose_bottles,purchase_price,line_total)`).order("created_at", { ascending: false }).limit(1000),
      ]);
      if (salesResult.error) throw salesResult.error; if (purchasesResult.error) throw purchasesResult.error;
      const nextSales = (salesResult.data || []).map((r) => normalizeSale(r, productById));
      const nextPurchases = (purchasesResult.data || []).map((r) => normalizePurchase(r, productById));
      setCategories(categoriesResult.data || []); setSuppliers(suppliersResult.data || []); setProducts(normalizedProducts);
      setInventory(stockMap); setSales(nextSales); setPurchases(nextPurchases);
      writeCache({ products: normalizedProducts, inventory: stockMap, sales: nextSales, purchases: nextPurchases, categories: categoriesResult.data || [], suppliers: suppliersResult.data || [] });
      return { ok: true };
    } catch (error) {
      const message = error?.message || String(error); setDataError(message);
      const c = readCache();
      if (!navigator.onLine && c) return { ok: true, offline: true, message: "Using cached shop data." };
      return { ok: false, message };
    } finally { setLoadingData(false); }
  }, [canUseShop, profile?.role, profile?.user_id]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { const fn = () => refreshAll(); window.addEventListener("online", fn); return () => window.removeEventListener("online", fn); }, [refreshAll]);

  const getStock = (id) => num(inventory[id]);

  async function ensureCategory(name) {
    const categoryName = String(name || "").trim(); if (!categoryName) return null;
    const existing = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()); if (existing) return existing.id;
    const { data, error } = await supabase.from("categories").insert({ shop_id: profile.shop_id, name: categoryName, active: true }).select("id,name,active").single();
    if (error) throw error; setCategories((c) => [...c, data]); return data.id;
  }

  function validateProduct(d, opening = false) {
    const v = { barcode:String(d.barcode||"").trim(),sku:String(d.sku||"").trim().toUpperCase(),name:String(d.name||"").trim(),brand:String(d.brand||"").trim(),category:String(d.category||"").trim(),subcategory:String(d.subcategory||"").trim(),sizeMl:Number(d.sizeMl),alcoholPercentage:d.alcoholPercentage===""?null:Number(d.alcoholPercentage),purchasePrice:Number(d.purchasePrice),mrp:Number(d.mrp),price:Number(d.price),minimumStock:Number(d.minimumStock),unitsPerCase:Number(d.unitsPerCase),openingStock:opening?Number(d.openingStock||0):0 };
    for (const [key,label] of [["barcode","Barcode"],["sku","SKU"],["name","Product name"],["brand","Brand"],["category","Category"]]) if (!v[key]) return { ok:false,message:`${label} is required.` };
    if (!Number.isInteger(v.sizeMl)||v.sizeMl<=0) return {ok:false,message:"Bottle size is invalid."};
    if (![v.purchasePrice,v.mrp,v.price].every((x)=>Number.isFinite(x)&&x>=0)) return {ok:false,message:"Price values are invalid."};
    if (!Number.isInteger(v.minimumStock)||v.minimumStock<0||!Number.isInteger(v.unitsPerCase)||v.unitsPerCase<=0) return {ok:false,message:"Stock settings are invalid."};
    if (opening&&(!Number.isInteger(v.openingStock)||v.openingStock<0)) return {ok:false,message:"Opening stock is invalid."};
    return {ok:true,value:v};
  }

  async function addProduct(data) {
    try { const check=validateProduct(data,true); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
      const {data:id,error}=await supabase.rpc("create_new_product",{p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||null,p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase,p_opening_stock:v.openingStock});
      if(error)throw error; await refreshAll(); return {ok:true,productId:id,message:`${v.name} created successfully.`};
    } catch(e){return {ok:false,message:e.message||String(e)}}
  }

  async function updateProduct(id,data) {
    try { const check=validateProduct(data,false); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
      const {error}=await supabase.rpc("update_product_details",{p_product_id:id,p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||"",p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase});
      if(error)throw error;await refreshAll();return {ok:true,message:`${v.name} updated successfully.`};
    }catch(e){return {ok:false,message:e.message||String(e)}}
  }
  async function setProductStatus(id,active){try{const {error}=await supabase.rpc("set_product_active",{p_product_id:id,p_active:active});if(error)throw error;await refreshAll();return{ok:true,message:active?"Product activated.":"Product deactivated."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  const deactivateProduct=(id)=>setProductStatus(id,false); const activateProduct=(id)=>setProductStatus(id,true);

  async function completeSale(cart,paymentMethod,{discount=0,paymentReference=""}={}) {
    const clientSaleId=crypto.randomUUID();
    const payload={clientSaleId,offlineCreatedAt:new Date().toISOString(),items:cart.map((i)=>({product_id:i.product.id,quantity:Number(i.quantity)})),paymentMethod,discount:Number(discount||0),paymentReference:String(paymentReference||"").trim()||null,cartSnapshot:cart.map((i)=>({product:{id:i.product.id,name:i.product.name,barcode:i.product.barcode,price:i.product.price},quantity:Number(i.quantity)}))};
    if (!navigator.onLine) {
      try {
        await queueOfflineSale(payload);
        setInventory((current)=>{const next={...current};for(const item of cart)next[item.product.id]=Math.max(0,num(next[item.product.id])-Number(item.quantity));return next;});
        const offlineSale={id:`offline-${clientSaleId}`,invoiceNumber:`OFFLINE-${clientSaleId.slice(0,8).toUpperCase()}`,createdAt:payload.offlineCreatedAt,paymentMethod,paymentReference,subtotal:cart.reduce((s,i)=>s+i.product.price*i.quantity,0),discount:Number(discount||0),grandTotal:Math.max(0,cart.reduce((s,i)=>s+i.product.price*i.quantity,0)-Number(discount||0)),status:"OFFLINE_PENDING",items:cart.map((i)=>({productId:i.product.id,productName:i.product.name,barcode:i.product.barcode,quantity:i.quantity,unitPrice:i.product.price,lineTotal:i.product.price*i.quantity}))};
        setSales((s)=>[offlineSale,...s]); return {ok:true,offline:true,sale:offlineSale,message:"Sale saved securely offline. Sync when internet returns."};
      } catch(e){return{ok:false,message:e.message||String(e)}}
    }
    try {
      const {data,error}=await supabase.rpc("complete_sale_v2",{p_items:payload.items,p_payment_method:paymentMethod,p_discount:Number(discount||0),p_payment_reference:paymentReference||null,p_client_sale_id:clientSaleId,p_offline_created_at:null});
      if(error)throw error;await refreshAll();return{ok:true,sale:{id:data}};
    }catch(e){return{ok:false,message:e.message||String(e)}}
  }

  async function syncOfflineSales() {
    if (!navigator.onLine) return {ok:false,message:"Internet is offline."};
    const rows=await listOfflineSales(); let synced=0,conflicts=0;
    for(const row of rows.filter((r)=>r.status==="PENDING"||r.status==="CONFLICT")){
      if(!row.payload){await setOfflineSaleStatus(row.id,"CONFLICT","Unable to decrypt local sale");conflicts++;continue;}
      const p=row.payload;
      const {error}=await supabase.rpc("sync_offline_sale",{p_client_sale_id:p.clientSaleId,p_offline_created_at:p.offlineCreatedAt,p_items:p.items,p_payment_method:p.paymentMethod,p_discount:p.discount,p_payment_reference:p.paymentReference});
      if(error){await setOfflineSaleStatus(row.id,"CONFLICT",error.message);conflicts++;}else{await removeOfflineSale(row.id);synced++;}
    }
    await refreshAll();return{ok:conflicts===0,synced,conflicts,message:`Synced ${synced}; conflicts ${conflicts}.`};
  }

  async function ensureSupplier(name){const n=String(name||"").trim();if(!n)throw new Error("Supplier name is required.");const existing=suppliers.find((s)=>s.supplier_name.toLowerCase()===n.toLowerCase());if(existing)return existing.id;const{data,error}=await supabase.from("suppliers").insert({shop_id:profile.shop_id,supplier_name:n,active:true}).select("id,supplier_name,active").single();if(error)throw error;setSuppliers((s)=>[...s,data]);return data.id;}
  async function receiveStock({supplierName,invoiceNumber,invoiceDate,items,notes=""}){try{if(!items?.length)return{ok:false,message:"Add at least one product."};const supplierId=await ensureSupplier(supplierName);const payload=items.map((i)=>({product_id:i.productId,case_count:Number(i.caseCount||0),units_per_case:Number(i.unitsPerCase||1),loose_bottles:Number(i.looseBottles||0),quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{data,error}=await supabase.rpc("receive_purchase",{p_supplier_id:supplierId,p_invoice_number:String(invoiceNumber||"").trim(),p_invoice_date:invoiceDate||new Date().toISOString().slice(0,10),p_items:payload,p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,purchaseId:data,message:"Stock received successfully."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  async function adjustStock({productId,adjustmentType,quantityChange,reason,notes=""}){try{const{data,error}=await supabase.rpc("adjust_stock",{p_product_id:productId,p_adjustment_type:adjustmentType,p_quantity_change:Number(quantityChange),p_reason:String(reason||"").trim(),p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,quantity:data,message:"Stock adjusted."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  function createBackup(){return{meta:{app:"WineShopPOS",mode:"SUPABASE_CLOUD",exportedAt:new Date().toISOString()},data:{products,inventory,sales,purchases}}}
  const lowStockProducts=useMemo(()=>products.filter((p)=>p.active&&getStock(p.id)<=p.minimumStock),[products,inventory]);

  return <ShopContext.Provider value={{products,inventory,sales,purchases,categories,suppliers,loadingData,dataError,lowStockProducts,getStock,refreshAll,addProduct,updateProduct,deactivateProduct,activateProduct,completeSale,receiveStock,adjustStock,createBackup,syncOfflineSales}}>{children}</ShopContext.Provider>;
}

export function useShop(){const c=useContext(ShopContext);if(!c)throw new Error("useShop must be used inside ShopProvider");return c;}
`````

