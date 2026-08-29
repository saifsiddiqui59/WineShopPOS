# Chapter 20 — Actual Release Code

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

### `src/components/Receipt80mm.jsx`

`````jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

export default function Receipt80mm({ sale }) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    supabase.from("shop_settings").select("store_address,store_phone,tax_registration_number,receipt_footer,printer_paper_mm").maybeSingle()
      .then(({ data }) => setSettings(data || null));
  }, []);

  return (
    <section className={`thermal-receipt paper-${settings?.printer_paper_mm || 80}`}>
      <header>
        <h2>{profile?.shop_name || "Wine Shop"}</h2>
        {settings?.store_address && <p>{settings.store_address}</p>}
        {settings?.store_phone && <p>Phone: {settings.store_phone}</p>}
        {settings?.tax_registration_number && <p>Reg: {settings.tax_registration_number}</p>}
      </header>
      <div className="receipt-meta">
        <p>Invoice: {sale.invoiceNumber}</p>
        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>
        <p>Cashier: {profile?.full_name || "-"}</p>
      </div>
      <div className="receipt-rule" />
      {sale.items.map((item) => (
        <div className="receipt-item" key={item.id || item.productId}>
          <strong>{item.productName}</strong>
          <div><span>{item.quantity} × {money.format(item.unitPrice)}</span><span>{money.format(item.lineTotal)}</span></div>
        </div>
      ))}
      <div className="receipt-rule" />
      <div className="receipt-total"><span>Subtotal</span><span>{money.format(sale.subtotal)}</span></div>
      <div className="receipt-total"><span>Discount</span><span>{money.format(sale.discount)}</span></div>
      <div className="receipt-total grand"><span>TOTAL</span><span>{money.format(sale.grandTotal)}</span></div>
      <p>Payment: {sale.paymentMethod}{sale.paymentReference ? ` · ${sale.paymentReference}` : ""}</p>
      <footer>{settings?.receipt_footer || "THANK YOU"}</footer>
    </section>
  );
}
`````

### `src/pages/PrinterSettings.jsx`

`````jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function PrinterSettings(){const{profile}=useAuth();const[form,setForm]=useState({store_address:"",store_phone:"",tax_registration_number:"",receipt_footer:"THANK YOU",printer_paper_mm:80});const[message,setMessage]=useState("");
useEffect(()=>{supabase.from("shop_settings").select("store_address,store_phone,tax_registration_number,receipt_footer,printer_paper_mm").maybeSingle().then(({data,error})=>{if(error)setMessage(error.message);else if(data)setForm({...form,...data})})},[]);
async function save(e){e.preventDefault();const{error}=await supabase.from("shop_settings").update(form).eq("shop_id",profile.shop_id);setMessage(error?error.message:"Receipt settings saved.")}
function testPrint(){window.print()}
return <div><div className="page-heading"><div><h2>Thermal Printer</h2><p>80mm/58mm browser-print receipt optimized for installed USB/Bluetooth printers.</p></div></div>{message&&<div className="purchase-message">{message}</div>}
<div className="settings-grid"><form className="panel" onSubmit={save}><h3>Receipt Header</h3><div className="settings-fields"><label>Store Address<textarea value={form.store_address||""} onChange={(e)=>setForm({...form,store_address:e.target.value})}/></label><label>Phone<input value={form.store_phone||""} onChange={(e)=>setForm({...form,store_phone:e.target.value})}/></label><label>Registration / GST / License text<input value={form.tax_registration_number||""} onChange={(e)=>setForm({...form,tax_registration_number:e.target.value})}/></label><label>Paper Width<select value={form.printer_paper_mm} onChange={(e)=>setForm({...form,printer_paper_mm:Number(e.target.value)})}><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label><label>Receipt Footer<input value={form.receipt_footer||""} onChange={(e)=>setForm({...form,receipt_footer:e.target.value})}/></label></div><br/><button className="primary-button">Save</button></form>
<section className="panel print-test-ticket"><h3>Printer Test</h3><p><strong>{profile?.shop_name}</strong></p><p>{form.store_address}</p><div className="receipt-rule"/><p>Printer test line</p><p>2 × ₹180 = ₹360</p><div className="receipt-rule"/><h3>TOTAL ₹360</h3><p>{form.receipt_footer}</p><button className="primary-button no-print" onClick={testPrint}>Open Print Dialog</button><p className="no-print"><small>Choose your installed thermal printer and set margins to None/Minimum. Static web apps cannot safely force silent raw ESC/POS printing across arbitrary printer models.</small></p></section></div></div>}
`````

### `src/pages/SaleDetails.jsx`

`````jsx
import { Navigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import Receipt80mm from "../components/Receipt80mm";

export default function SaleDetails(){const{id}=useParams();const{sales,loadingData}=useShop();const sale=sales.find((s)=>s.id===id);if(loadingData)return <div className="panel">Loading...</div>;if(!sale)return <Navigate to="/sales" replace/>;return <div className="invoice-page"><div className="page-heading no-print"><div><h2>Invoice {sale.invoiceNumber}</h2><p>80mm thermal receipt layout</p></div><button className="primary-button" onClick={()=>window.print()}>Print Receipt</button></div><Receipt80mm sale={sale}/></div>}
`````

### `src/chapters16to26.css`

`````css
/* WineShopPOS Chapters 16-26 */
.button-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.button-row.spread{justify-content:space-between}.danger-button{background:#9d1d20;color:#fff;border:0;border-radius:7px;padding:10px 14px;cursor:pointer}.negative{color:#a91c1f;font-weight:700}.positive{color:#167346;font-weight:700}.icon-logout{margin-left:auto;border:0;background:transparent;color:#fff;padding:4px;cursor:pointer}.topbar-actions{display:flex;align-items:center;gap:12px}.offline-status{display:flex;flex-direction:column;align-items:flex-end;font-size:11px;font-weight:800}.offline-status.online span{color:#167346}.offline-status.offline span{color:#b42318}.offline-status small{font-weight:500;color:#666}.product-not-found{margin-bottom:16px;padding:18px;border:2px solid #b42318;background:#fff2f0;border-radius:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}.product-not-found strong{font-size:22px;color:#b42318}.product-not-found span{font-family:monospace;font-size:18px}.scanner-last{min-height:100px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:2px dashed #ccd0d7;border-radius:12px;margin:12px 0}.scanner-last strong{font-family:monospace;font-size:24px}.scanner-last.muted{color:#777}.scanner-commercial-card{border-left:4px solid #333}.audit-json{max-width:520px;white-space:pre-wrap;word-break:break-word;font-size:11px}.thermal-receipt{width:80mm;max-width:100%;margin:0 auto;background:white;color:#000;padding:5mm;font-family:"Courier New",monospace;font-size:11px;line-height:1.3}.thermal-receipt.paper-58{width:58mm}.thermal-receipt header{text-align:center}.thermal-receipt h2,.thermal-receipt p{margin:3px 0}.receipt-rule{border-top:1px dashed #000;margin:7px 0}.receipt-item{margin:5px 0}.receipt-item>div,.receipt-total{display:flex;justify-content:space-between;gap:8px}.receipt-total.grand{font-weight:900;font-size:14px;border-top:1px solid #000;border-bottom:1px solid #000;padding:5px 0;margin:5px 0}.thermal-receipt footer{text-align:center;margin-top:12px;font-weight:700}.print-test-ticket{font-family:monospace}.settings-fields textarea{min-height:90px;padding:8px;border:1px solid #dfe2e7;border-radius:7px}.data-table select{max-width:250px}.panel details summary{cursor:pointer}.pos-layout{align-items:start}
@media(max-width:1000px){.topbar-actions{align-items:flex-end;flex-direction:column}.nav-menu{overflow-y:auto}.thermal-receipt{width:100%}}
@media print{body *{visibility:hidden!important}.thermal-receipt,.thermal-receipt *,.print-test-ticket,.print-test-ticket *{visibility:visible!important}.thermal-receipt,.print-test-ticket{position:absolute;left:0;top:0;margin:0!important;box-shadow:none!important;border:0!important}.no-print{display:none!important}@page{size:80mm auto;margin:2mm}body{margin:0;padding:0;background:#fff}}
`````

