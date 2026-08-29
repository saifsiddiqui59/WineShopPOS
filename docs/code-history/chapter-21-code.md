# Chapter 21 — Actual Release Code

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

### `src/pages/Procurement.jsx`

`````jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const line=()=>({productId:"",quantity:12,purchasePrice:0});
export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");
async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select(`*,purchase_order_items(*)`).order("created_at",{ascending:false}).limit(100),supabase.rpc("supplier_balances")]);if(po.error)setMessage(po.error.message);else setOrders(po.data||[]);if(b.error)setMessage(b.error.message);else setBalances(b.data||[])}useEffect(()=>{load()},[]);
function update(i,k,v){setItems((x)=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find((p)=>p.id===v)?.purchasePrice||0}:{})}:r))}
const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
async function createPO(e){e.preventDefault();const payload=items.filter((i)=>i.productId&&Number(i.quantity)>0).map((i)=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?error.message:"Purchase order created.");if(!error){setItems([line()]);load()}}
async function setStatus(id,status){const{error}=await supabase.rpc("set_purchase_order_status",{p_po_id:id,p_status:status});setMessage(error?error.message:`PO ${status.toLowerCase()}.`);if(!error)load()}
async function receive(po){const inv=prompt("Supplier invoice number");if(!inv)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:po.id,p_invoice_number:inv,p_invoice_date:new Date().toISOString().slice(0,10),p_receive_items:null,p_notes:"Received from PO screen"});setMessage(error?error.message:"PO goods received and inventory updated.");if(!error){await Promise.all([load(),refreshAll()])}}
async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?error.message:"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
async function purchaseReturn(){const productId=prompt("Paste/select product UUID to return (use Products screen if needed)");if(!productId)return;const qty=Number(prompt("Quantity to return",1));const p=products.find((x)=>x.id===productId);if(!p)return setMessage("Product UUID not found in this shop.");const sid=prompt("Supplier UUID",supplierId||suppliers[0]?.id||"");if(!sid)return;const reason=prompt("Reason","Damaged/incorrect supply");if(!reason)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:sid,p_items:[{product_id:productId,quantity:qty,purchase_price:p.purchasePrice}],p_reason:reason,p_purchase_id:null});setMessage(error?error.message:"Purchase return completed and stock reduced.");if(!error){await Promise.all([load(),refreshAll()])}}
return <div><div className="page-heading"><div><h2>Supplier & Purchasing</h2><p>PO → receive → supplier balance → payment → purchase return.</p></div><button className="secondary-button" onClick={purchaseReturn}>Supplier Return</button></div>{message&&<div className="purchase-message">{message}</div>}
<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order</h3><label>Supplier<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={(e)=>setExpected(e.target.value)}/></label><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={(e)=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" onClick={()=>setItems((x)=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,line()])}>Add Line</button><button className="primary-button">Create PO</button></div></form>
<form className="panel" onSubmit={pay}><h3>Record Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={(e)=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e)=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={(e)=>setPayment({...payment,method:e.target.value})}><option>BANK_TRANSFER</option><option>UPI</option><option>CASH</option><option>CARD</option><option>CHEQUE</option><option>OTHER</option></select></label><label>Reference<input value={payment.reference} onChange={(e)=>setPayment({...payment,reference:e.target.value})}/></label></div><br/><button className="primary-button">Record Payment</button></form></div>
<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map((b)=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Action</th></tr></thead><tbody>{orders.map((o)=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find((s)=>s.id===o.supplier_id)?.supplier_name||o.supplier_id.slice(0,8)}</td><td>{o.status}</td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td>{o.status==="DRAFT"&&<button className="secondary-button" onClick={()=>setStatus(o.id,"SENT")}>Mark Sent</button>} {["DRAFT","SENT","PARTIALLY_RECEIVED"].includes(o.status)&&<button className="primary-button" onClick={()=>receive(o)}>Receive</button>}</td></tr>)}</tbody></table></div></section></div>}
`````

### `src/pages/Purchases.jsx`

`````jsx
import { useEffect, useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});const empty=()=>({productId:"",caseCount:0,unitsPerCase:12,looseBottles:0,quantity:0,purchasePrice:0});
export default function Purchases(){const{products,purchases,suppliers,receiveStock}=useShop();const navigate=useNavigate();const active=products.filter((p)=>p.active);const[supplierName,setSupplierName]=useState("");const[invoiceNumber,setInvoiceNumber]=useState("");const[invoiceDate,setInvoiceDate]=useState(new Date().toISOString().slice(0,10));const[notes,setNotes]=useState("");const[items,setItems]=useState([empty()]);const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
useEffect(()=>{try{const raw=sessionStorage.getItem("wineshop_ocr_purchase_draft");if(!raw)return;const d=JSON.parse(raw);setSupplierName(d.supplierName||"");setInvoiceNumber(d.invoiceNumber||"");setInvoiceDate(d.invoiceDate||new Date().toISOString().slice(0,10));setNotes(`OCR draft from ${d.sourceFile||"invoice"}. REVIEW ALL LINES BEFORE RECEIVING.`);setItems((d.items||[]).map((x)=>({...empty(),...x,quantity:Number(x.quantity||0)})));sessionStorage.removeItem("wineshop_ocr_purchase_draft");setMessage("OCR draft loaded. Review every product match, quantity and price before receiving stock.")}catch{}},[]);
function update(n,k,v){setItems((cur)=>cur.map((i,idx)=>{if(idx!==n)return i;const x={...i,[k]:v};if(k==="productId"){const p=active.find((p)=>p.id===v);if(p){x.unitsPerCase=p.unitsPerCase||1;x.purchasePrice=p.purchasePrice||0}}x.quantity=Number(x.caseCount||0)*Number(x.unitsPerCase||1)+Number(x.looseBottles||0);return x}))}const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
async function submit(e){e.preventDefault();setBusy(true);const cleaned=items.filter((i)=>i.productId&&Number(i.quantity)>0);const r=await receiveStock({supplierName,invoiceNumber,invoiceDate,notes,items:cleaned});setMessage(r.message);if(r.ok){setInvoiceNumber("");setNotes("");setItems([empty()])}setBusy(false)}
return <div><div className="page-heading"><div><h2>Receive Stock</h2><p>Manual, PO, or OCR-reviewed stock receipt.</p></div><button className="secondary-button" onClick={()=>navigate("/automation")}>Invoice OCR</button></div>{message&&<div className="purchase-message">{message}</div>}<form className="panel" onSubmit={submit}><div className="form-grid"><label>Supplier<input list="supplier-list" value={supplierName} onChange={(e)=>setSupplierName(e.target.value)} required/><datalist id="supplier-list">{suppliers.filter((s)=>s.active).map((s)=><option key={s.id} value={s.supplier_name}/>)}</datalist></label><label>Supplier Invoice<input value={invoiceNumber} onChange={(e)=>setInvoiceNumber(e.target.value)} required/></label><label>Invoice Date<input type="date" value={invoiceDate} onChange={(e)=>setInvoiceDate(e.target.value)} required/></label><label>Notes<input value={notes} onChange={(e)=>setNotes(e.target.value)}/></label></div><div className="data-table-wrapper" style={{marginTop:18}}><table className="data-table"><thead><tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Total</th><th>Price/Bottle</th><th>Amount</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={(e)=>update(n,"productId",e.target.value)} required><option value="">Select product</option>{active.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="0" value={i.caseCount} onChange={(e)=>update(n,"caseCount",e.target.value)}/></td><td><input type="number" min="1" value={i.unitsPerCase} onChange={(e)=>update(n,"unitsPerCase",e.target.value)}/></td><td><input type="number" min="0" value={i.looseBottles} onChange={(e)=>update(n,"looseBottles",e.target.value)}/></td><td>{i.quantity}</td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={(e)=>update(n,"purchasePrice",e.target.value)}/></td><td>{money.format(Number(i.quantity||0)*Number(i.purchasePrice||0))}</td><td><button type="button" onClick={()=>setItems((x)=>x.filter((_,idx)=>idx!==n))}>×</button></td></tr>)}</tbody></table></div><div className="button-row spread"><button type="button" className="secondary-button" onClick={()=>setItems((x)=>[...x,empty()])}>Add Line</button><strong>Total {money.format(total)}</strong></div><br/><button className="primary-button" disabled={busy}>{busy?"Receiving...":"Confirm & Receive Stock"}</button></form><section className="panel" style={{marginTop:16}}><h3>Recent Purchases</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead><tbody>{purchases.slice(0,20).map((p)=><tr key={p.id}><td>{p.purchaseNumber}</td><td>{p.invoiceNumber}</td><td>{p.supplierName}</td><td>{p.invoiceDate}</td><td>{p.totalUnits}</td><td>{money.format(p.total)}</td></tr>)}</tbody></table></div></section></div>}
`````

### `src/pages/PriceHistory.jsx`

`````jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function PriceHistory(){const{products}=useShop();const[id,setId]=useState("");const[rows,setRows]=useState([]);const[message,setMessage]=useState("");async function load(productId){setId(productId);if(!productId)return setRows([]);const{data,error}=await supabase.rpc("purchase_price_history",{p_product_id:productId,p_limit:24});if(error)setMessage(error.message);else setRows(data||[])}const newest=rows[0]?.purchase_price;const oldest=rows.at(-1)?.purchase_price;const change=oldest&&newest?((Number(newest)-Number(oldest))/Number(oldest))*100:null;return <div><div className="page-heading"><div><h2>Purchase Price History</h2><p>Track supplier cost movement for each product.</p></div></div>{message&&<div className="purchase-message">{message}</div>}<div className="panel"><label>Product<select value={id} onChange={(e)=>load(e.target.value)}><option value="">Select product</option>{products.filter((p)=>p.active).map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{change!=null&&<p>Oldest → latest change: <strong className={change>0?"negative":"positive"}>{change>=0?"+":""}{change.toFixed(2)}%</strong></p>}</div><section className="panel" style={{marginTop:16}}><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Qty</th><th>Price / Bottle</th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.invoice_date}-${i}`}><td>{r.invoice_date}</td><td>{r.supplier_name}</td><td>{r.quantity}</td><td>{money.format(r.purchase_price)}</td></tr>)}</tbody></table></div></section></div>}
`````

### `supabase/migrations/20260829190000_chapters_16_26.sql`

`````sql
-- WineShopPOS Chapters 16-26 production expansion
-- Additive migration over the Chapter 15 schema.
-- Designed for the existing multi-shop Supabase project.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ============================================================
-- CHAPTER 23 FOUNDATION: ORGANIZATIONS / BRANCH GROUPING
-- Existing shops are isolated into separate organizations first.
-- Shops may only transfer stock when they share organization_id.
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shops add column if not exists organization_id uuid references public.organizations(id) on delete restrict;

-- Reuse the Chapter 15 updated_at helper.
drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

do $$
declare
  r record;
  v_org uuid;
begin
  for r in select id, name from public.shops where organization_id is null
  loop
    insert into public.organizations(name) values (r.name || ' Organization') returning id into v_org;
    update public.shops set organization_id = v_org where id = r.id;
  end loop;
end $$;

alter table public.shops alter column organization_id set not null;
create index if not exists idx_shops_organization on public.shops(organization_id);

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.organization_id
  from public.shops s
  where s.id = public.current_shop_id()
  limit 1;
$$;

-- ============================================================
-- EXISTING TABLE EXTENSIONS
-- ============================================================
alter table public.sales add column if not exists shift_id uuid;
alter table public.sales add column if not exists client_sale_id uuid;
alter table public.sales add column if not exists offline_created_at timestamptz;
create unique index if not exists uq_sales_shop_client_sale
  on public.sales(shop_id, client_sale_id)
  where client_sale_id is not null;

alter table public.purchases add column if not exists purchase_order_id uuid;

alter table public.payments add column if not exists payment_type text not null default 'PAYMENT';
alter table public.payments add column if not exists return_request_id uuid;
alter table public.payments add column if not exists shift_id uuid;

do $$ begin
  alter table public.payments add constraint payments_payment_type_check
    check (payment_type in ('PAYMENT','REFUND'));
exception when duplicate_object then null; end $$;

alter table public.shop_settings add column if not exists store_address text;
alter table public.shop_settings add column if not exists store_phone text;
alter table public.shop_settings add column if not exists tax_registration_number text;
alter table public.shop_settings add column if not exists printer_paper_mm integer not null default 80;
do $$ begin
  alter table public.shop_settings add constraint shop_settings_printer_paper_check
    check (printer_paper_mm in (58,80));
exception when duplicate_object then null; end $$;

alter table public.shop_counters add column if not exists po_counter bigint not null default 0;

-- Extend stock movement type vocabulary safely.
alter table public.stock_movements drop constraint if exists stock_movements_movement_type_check;
alter table public.stock_movements add constraint stock_movements_movement_type_check
  check (movement_type in (
    'OPENING_STOCK','PURCHASE','SALE','CUSTOMER_RETURN','SUPPLIER_RETURN',
    'DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION',
    'SALE_VOID','STOCK_COUNT','TRANSFER_OUT','TRANSFER_IN','OFFLINE_SALE'
  ));

-- ============================================================
-- CHAPTER 17: RETURN / REFUND REQUESTS
-- ============================================================
create table if not exists public.sale_return_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete restrict,
  requested_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  reason text not null,
  refund_method text not null check (refund_method in ('CASH','UPI','CARD')),
  refund_reference text,
  total_refund numeric(14,2) not null default 0 check (total_refund >= 0),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.sale_return_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
  sale_item_id uuid not null references public.sale_items(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_refund numeric(12,2) not null check (unit_refund >= 0),
  line_refund numeric(14,2) not null check (line_refund >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_return_requests_shop_sale on public.sale_return_requests(shop_id, sale_id, created_at desc);
create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);

-- ============================================================
-- CHAPTER 18: CASHIER SHIFT / DAY CLOSE
-- ============================================================
create table if not exists public.cashier_shifts (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  cashier_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSE_REQUESTED','CLOSED','CANCELLED')),
  opening_cash numeric(14,2) not null default 0 check (opening_cash >= 0),
  cash_sales numeric(14,2) not null default 0,
  upi_sales numeric(14,2) not null default 0,
  card_sales numeric(14,2) not null default 0,
  cash_refunds numeric(14,2) not null default 0,
  expected_cash numeric(14,2) not null default 0,
  actual_cash numeric(14,2),
  cash_difference numeric(14,2),
  opened_at timestamptz not null default now(),
  close_requested_at timestamptz,
  closed_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_cashier_open_shift
  on public.cashier_shifts(shop_id, cashier_id)
  where status in ('OPEN','CLOSE_REQUESTED');
create index if not exists idx_shifts_shop_date on public.cashier_shifts(shop_id, opened_at desc);

-- Foreign keys added after shift table exists.
do $$ begin
  alter table public.sales add constraint sales_shift_id_fkey foreign key (shift_id) references public.cashier_shifts(id) on delete set null;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.payments add constraint payments_shift_id_fkey foreign key (shift_id) references public.cashier_shifts(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================
-- CHAPTER 19: PHYSICAL STOCK COUNT
-- ============================================================
create table if not exists public.stock_counts (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  count_number text not null,
  status text not null default 'OPEN' check (status in ('OPEN','SUBMITTED','APPROVED','CANCELLED')),
  created_by uuid not null references auth.users(id) on delete restrict,
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  unique(shop_id, count_number)
);

create table if not exists public.stock_count_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  stock_count_id uuid not null references public.stock_counts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  expected_quantity integer not null check (expected_quantity >= 0),
  counted_quantity integer,
  difference integer generated always as (coalesce(counted_quantity, expected_quantity) - expected_quantity) stored,
  first_scanned_at timestamptz,
  last_scanned_at timestamptz,
  unique(stock_count_id, product_id)
);
create index if not exists idx_stock_count_items_count on public.stock_count_items(stock_count_id);

-- ============================================================
-- CHAPTER 21: PROCUREMENT / SUPPLIER LEDGER
-- ============================================================
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  po_number text not null,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'DRAFT' check (status in ('DRAFT','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED')),
  expected_date date,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(shop_id, po_number)
);
drop trigger if exists trg_purchase_orders_updated_at on public.purchase_orders;
create trigger trg_purchase_orders_updated_at before update on public.purchase_orders
for each row execute function public.set_updated_at();

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  ordered_quantity integer not null check (ordered_quantity > 0),
  received_quantity integer not null default 0 check (received_quantity >= 0),
  purchase_price numeric(12,2) not null check (purchase_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0)
);
create index if not exists idx_po_items_po on public.purchase_order_items(purchase_order_id);

do $$ begin
  alter table public.purchases add constraint purchases_purchase_order_id_fkey foreign key (purchase_order_id) references public.purchase_orders(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER')),
  reference_number text,
  payment_date date not null default current_date,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists idx_supplier_payments_supplier on public.supplier_payments(shop_id, supplier_id, payment_date desc);

create table if not exists public.purchase_returns (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  purchase_id uuid references public.purchases(id) on delete set null,
  status text not null default 'COMPLETED' check (status in ('COMPLETED','CANCELLED')),
  reason text not null,
  total numeric(14,2) not null default 0 check (total >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_return_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_return_id uuid not null references public.purchase_returns(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  purchase_price numeric(12,2) not null check (purchase_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0)
);

-- ============================================================
-- CHAPTER 23: STOCK TRANSFERS
-- ============================================================
create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  source_shop_id uuid not null references public.shops(id) on delete restrict,
  destination_shop_id uuid not null references public.shops(id) on delete restrict,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED')),
  requested_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check(source_shop_id <> destination_shop_id)
);

create table if not exists public.stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
  source_product_id uuid not null references public.products(id) on delete restrict,
  destination_product_id uuid references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0)
);
create index if not exists idx_transfers_source on public.stock_transfers(source_shop_id, created_at desc);
create index if not exists idx_transfers_destination on public.stock_transfers(destination_shop_id, created_at desc);

-- ============================================================
-- CHAPTER 24: AUDIT LOG
-- ============================================================
create table if not exists public.audit_logs (
  id bigserial primary key,
  shop_id uuid references public.shops(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_shop_time on public.audit_logs(shop_id, created_at desc);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id, created_at desc);

-- ============================================================
-- CHAPTER 26: OCR PRODUCT ALIASES
-- ============================================================
create table if not exists public.product_aliases (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete cascade,
  alias_text text not null,
  normalized_alias text generated always as (lower(regexp_replace(alias_text, '[^a-zA-Z0-9]+', ' ', 'g'))) stored,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(shop_id, supplier_id, alias_text)
);
create index if not exists idx_product_aliases_trgm on public.product_aliases using gin (normalized_alias gin_trgm_ops);

-- ============================================================
-- GENERIC AUDIT HELPERS / TRIGGERS
-- ============================================================
create or replace function public.write_audit(
  p_shop_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_data jsonb default null,
  p_new_data jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.shops where id = p_shop_id;
  insert into public.audit_logs(shop_id, organization_id, actor_id, action, entity_type, entity_id, old_data, new_data, metadata)
  values (p_shop_id, v_org, auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, coalesce(p_metadata,'{}'::jsonb));
end;
$$;

create or replace function public.audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid;
  v_old jsonb;
  v_new jsonb;
  v_id text;
begin
  if tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    v_shop := (v_new->>'shop_id')::uuid;
    v_id := v_new->>'id';
    perform public.write_audit(v_shop, 'CREATE', tg_table_name, v_id, null, v_new, jsonb_build_object('trigger', true));
    return new;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_shop := coalesce((v_new->>'shop_id')::uuid, (v_old->>'shop_id')::uuid);
    v_id := coalesce(v_new->>'id', v_old->>'id');
    if v_old is distinct from v_new then
      perform public.write_audit(v_shop, 'UPDATE', tg_table_name, v_id, v_old, v_new, jsonb_build_object('trigger', true));
    end if;
    return new;
  else
    v_old := to_jsonb(old);
    v_shop := (v_old->>'shop_id')::uuid;
    v_id := v_old->>'id';
    perform public.write_audit(v_shop, 'DELETE', tg_table_name, v_id, v_old, null, jsonb_build_object('trigger', true));
    return old;
  end if;
end;
$$;

drop trigger if exists trg_audit_products on public.products;
create trigger trg_audit_products after insert or update or delete on public.products
for each row execute function public.audit_row_changes();

drop trigger if exists trg_audit_suppliers on public.suppliers;
create trigger trg_audit_suppliers after insert or update or delete on public.suppliers
for each row execute function public.audit_row_changes();

drop trigger if exists trg_audit_sales on public.sales;
create trigger trg_audit_sales after insert or update on public.sales
for each row execute function public.audit_row_changes();

drop trigger if exists trg_audit_purchases on public.purchases;
create trigger trg_audit_purchases after insert or update on public.purchases
for each row execute function public.audit_row_changes();

-- ============================================================
-- SECURE PRODUCT READ / WRITE API
-- Cashiers get purchase_price = NULL; managers/admins get the real value.
-- ============================================================
create or replace function public.get_products()
returns table (
  id uuid,
  shop_id uuid,
  barcode text,
  sku text,
  product_name text,
  brand text,
  category_id uuid,
  category_name text,
  subcategory text,
  size_ml integer,
  alcohol_percentage numeric,
  purchase_price numeric,
  mrp numeric,
  selling_price numeric,
  minimum_stock integer,
  units_per_case integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.shop_id, p.barcode, p.sku, p.product_name, p.brand,
         p.category_id, c.name,
         p.subcategory, p.size_ml, p.alcohol_percentage,
         case when public.current_user_role() in ('ADMIN','MANAGER') then p.purchase_price else null end,
         p.mrp, p.selling_price, p.minimum_stock, p.units_per_case, p.active,
         p.created_at, p.updated_at
  from public.products p
  left join public.categories c on c.id = p.category_id
  where p.shop_id = public.assert_shop_access()
  order by p.product_name;
$$;

create or replace function public.update_product_details(
  p_product_id uuid,
  p_barcode text,
  p_sku text,
  p_product_name text,
  p_brand text,
  p_category_id uuid,
  p_subcategory text,
  p_size_ml integer,
  p_alcohol_percentage numeric,
  p_purchase_price numeric,
  p_mrp numeric,
  p_selling_price numeric,
  p_minimum_stock integer,
  p_units_per_case integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();
  update public.products set
    barcode = trim(p_barcode), sku = upper(trim(p_sku)), product_name = trim(p_product_name),
    brand = trim(p_brand), category_id = p_category_id, subcategory = nullif(trim(p_subcategory),''),
    size_ml = p_size_ml, alcohol_percentage = p_alcohol_percentage,
    purchase_price = p_purchase_price, mrp = p_mrp, selling_price = p_selling_price,
    minimum_stock = p_minimum_stock, units_per_case = p_units_per_case
  where id = p_product_id and shop_id = v_shop;
  if not found then raise exception 'Product not found'; end if;
end;
$$;

create or replace function public.set_product_active(p_product_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();
  update public.products set active = p_active where id = p_product_id and shop_id = v_shop;
  if not found then raise exception 'Product not found'; end if;
end;
$$;

-- ============================================================
-- CHAPTER 17 RPCs
-- ============================================================
create or replace function public.create_return_request(
  p_sale_id uuid,
  p_items jsonb,
  p_reason text,
  p_refund_method text,
  p_refund_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid;
  v_request uuid;
  v_sale public.sales%rowtype;
  v_item jsonb;
  v_sale_item public.sale_items%rowtype;
  v_qty integer;
  v_already integer;
  v_factor numeric := 1;
  v_unit_refund numeric(12,2);
  v_total numeric(14,2) := 0;
begin
  v_shop := public.assert_shop_access();
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Return items required'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Return reason required'; end if;
  if p_refund_method not in ('CASH','UPI','CARD') then raise exception 'Invalid refund method'; end if;

  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop;
  if not found then raise exception 'Sale not found'; end if;
  if v_sale.status = 'VOID' then raise exception 'Voided sale cannot be returned'; end if;
  if v_sale.subtotal > 0 then v_factor := v_sale.grand_total / v_sale.subtotal; end if;

  insert into public.sale_return_requests(shop_id,sale_id,requested_by,reason,refund_method,refund_reference)
  values(v_shop,p_sale_id,auth.uid(),trim(p_reason),p_refund_method,p_refund_reference)
  returning id into v_request;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := coalesce((v_item->>'quantity')::integer,0);
    if v_qty <= 0 then raise exception 'Return quantity must be positive'; end if;
    select * into v_sale_item from public.sale_items
    where id=(v_item->>'sale_item_id')::uuid and sale_id=p_sale_id and shop_id=v_shop;
    if not found then raise exception 'Sale item not found'; end if;

    select coalesce(sum(sri.quantity),0) into v_already
    from public.sale_return_items sri
    join public.sale_return_requests rr on rr.id=sri.return_request_id
    where sri.sale_item_id=v_sale_item.id and rr.status in ('PENDING','APPROVED');

    if v_already + v_qty > v_sale_item.quantity then raise exception 'Return quantity exceeds remaining sold quantity'; end if;
    v_unit_refund := round(v_sale_item.unit_price * v_factor, 2);
    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
    values(v_shop,v_request,v_sale_item.id,v_sale_item.product_id,v_qty,v_unit_refund,round(v_unit_refund*v_qty,2));
    v_total := v_total + round(v_unit_refund*v_qty,2);
  end loop;

  update public.sale_return_requests set total_refund=v_total where id=v_request;
  perform public.write_audit(v_shop,'RETURN_REQUESTED','sale_return_request',v_request::text,null,null,
    jsonb_build_object('sale_id',p_sale_id,'refund',v_total,'reason',p_reason));
  return v_request;
end;
$$;

create or replace function public.approve_return_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid;
  v_req public.sale_return_requests%rowtype;
  r record;
  v_before integer;
  v_after integer;
  v_sold integer;
  v_returned integer;
  v_shift uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();
  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
  if not found then raise exception 'Return request not found'; end if;
  if v_req.status <> 'PENDING' then raise exception 'Return request already reviewed'; end if;

  for r in select * from public.sale_return_items where return_request_id=p_request_id
  loop
    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
    if v_before is null then v_before := 0; insert into public.inventory(shop_id,product_id,quantity) values(v_shop,r.product_id,0) on conflict do nothing; end if;
    v_after := v_before + r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
  end loop;

  select shift_id into v_shift from public.sales where id=v_req.sale_id;
  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);

  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;

  select coalesce(sum(si.quantity),0) into v_sold from public.sale_items si where si.sale_id=v_req.sale_id;
  select coalesce(sum(sri.quantity),0) into v_returned
  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
  where rr.sale_id=v_req.sale_id and rr.status='APPROVED';
  update public.sales
  set status=case when v_returned >= v_sold then 'RETURNED' else 'PARTIAL_RETURN' end,
      payment_status=case when v_returned >= v_sold then 'REFUNDED' else payment_status end
  where id=v_req.sale_id;

  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
end;
$$;

create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();
  update public.sale_return_requests set status='REJECTED',approved_by=auth.uid(),reviewed_at=now(),reason=reason || case when nullif(trim(p_note),'') is null then '' else E'\nReview: '||trim(p_note) end
  where id=p_request_id and shop_id=v_shop and status='PENDING';
  if not found then raise exception 'Pending return request not found'; end if;
  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
end;
$$;

create or replace function public.void_sale(p_sale_id uuid, p_reason text, p_refund_method text default 'CASH', p_refund_reference text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid;
  v_sale public.sales%rowtype;
  r record;
  v_before integer;
  v_after integer;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();
  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop for update;
  if not found then raise exception 'Sale not found'; end if;
  if v_sale.status <> 'COMPLETED' then raise exception 'Only a clean completed sale can be voided'; end if;
  if exists(select 1 from public.sale_return_requests where sale_id=p_sale_id and status in ('PENDING','APPROVED')) then raise exception 'Sale has return activity; use return workflow'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Void reason required'; end if;

  for r in select * from public.sale_items where sale_id=p_sale_id
  loop
    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
    v_before := coalesce(v_before,0); v_after := v_before + r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_shop,r.product_id,'SALE_VOID',r.quantity,v_before,v_after,'SALE',p_sale_id,trim(p_reason),auth.uid());
  end loop;

  update public.sales set status='VOID',payment_status='REFUNDED',notes=concat_ws(E'\n',notes,'VOID: '||trim(p_reason)) where id=p_sale_id;
  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
  values(v_shop,p_sale_id,p_refund_method,v_sale.grand_total,p_refund_reference,'REFUND',v_sale.shift_id);
  perform public.write_audit(v_shop,'SALE_VOIDED','sale',p_sale_id::text,to_jsonb(v_sale),null,jsonb_build_object('reason',p_reason,'refund',v_sale.grand_total));
end;
$$;

-- ============================================================
-- CHAPTER 18 RPCs
-- ============================================================
create or replace function public.open_shift(p_opening_cash numeric, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_id uuid;
begin
  v_shop := public.assert_shop_access();
  if p_opening_cash < 0 then raise exception 'Opening cash cannot be negative'; end if;
  if exists(select 1 from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')) then raise exception 'You already have an active shift'; end if;
  insert into public.cashier_shifts(shop_id,cashier_id,opening_cash,expected_cash,notes)
  values(v_shop,auth.uid(),p_opening_cash,p_opening_cash,p_notes) returning id into v_id;
  perform public.write_audit(v_shop,'SHIFT_OPENED','cashier_shift',v_id::text,null,null,jsonb_build_object('opening_cash',p_opening_cash));
  return v_id;
end;
$$;

create or replace function public.my_open_shift()
returns setof public.cashier_shifts
language sql
stable
security definer
set search_path = public
as $$
  select * from public.cashier_shifts
  where shop_id=public.assert_shop_access() and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')
  order by opened_at desc limit 1;
$$;

create or replace function public.shift_totals(p_shift_id uuid)
returns table(cash_sales numeric, upi_sales numeric, card_sales numeric, cash_refunds numeric, expected_cash numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_shift public.cashier_shifts%rowtype;
begin
  select * into v_shift from public.cashier_shifts where id=p_shift_id and shop_id=public.assert_shop_access();
  if not found then raise exception 'Shift not found'; end if;
  return query
  select
    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount else 0 end),0),
    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='UPI' then p.amount else 0 end),0),
    coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CARD' then p.amount else 0 end),0),
    coalesce(sum(case when p.payment_type='REFUND' and p.payment_method='CASH' then p.amount else 0 end),0),
    v_shift.opening_cash + coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount when p.payment_type='REFUND' and p.payment_method='CASH' then -p.amount else 0 end),0)
  from public.payments p where p.shift_id=p_shift_id;
end;
$$;

create or replace function public.request_close_shift(p_actual_cash numeric, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid; v_shift public.cashier_shifts%rowtype; v_cash numeric; v_upi numeric; v_card numeric; v_ref numeric; v_expected numeric;
begin
  v_shop := public.assert_shop_access();
  if p_actual_cash < 0 then raise exception 'Actual cash cannot be negative'; end if;
  select * into v_shift from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN' order by opened_at desc limit 1 for update;
  if not found then raise exception 'No open shift'; end if;
  select * into v_cash,v_upi,v_card,v_ref,v_expected from public.shift_totals(v_shift.id);
  update public.cashier_shifts set status='CLOSE_REQUESTED', cash_sales=v_cash,upi_sales=v_upi,card_sales=v_card,cash_refunds=v_ref,expected_cash=v_expected,actual_cash=p_actual_cash,cash_difference=p_actual_cash-v_expected,close_requested_at=now(),notes=concat_ws(E'\n',notes,p_notes)
  where id=v_shift.id;
  perform public.write_audit(v_shop,'SHIFT_CLOSE_REQUESTED','cashier_shift',v_shift.id::text,null,null,jsonb_build_object('actual_cash',p_actual_cash,'expected_cash',v_expected));
  return v_shift.id;
end;
$$;

create or replace function public.approve_shift_close(p_shift_id uuid, p_notes text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  update public.cashier_shifts set status='CLOSED',approved_by=auth.uid(),closed_at=now(),notes=concat_ws(E'\n',notes,p_notes)
  where id=p_shift_id and shop_id=v_shop and status='CLOSE_REQUESTED';
  if not found then raise exception 'Close request not found'; end if;
  perform public.write_audit(v_shop,'SHIFT_CLOSED','cashier_shift',p_shift_id::text,null,null,jsonb_build_object('note',p_notes));
end;
$$;

-- ============================================================
-- CHAPTER 19 RPCs
-- ============================================================
create or replace function public.create_stock_count(p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_id uuid; v_num text;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if exists(select 1 from public.stock_counts where shop_id=v_shop and status in ('OPEN','SUBMITTED')) then raise exception 'An active stock count already exists'; end if;
  v_num := 'SC-' || to_char(now(),'YYYYMMDD-HH24MISS');
  insert into public.stock_counts(shop_id,count_number,created_by,notes) values(v_shop,v_num,auth.uid(),p_notes) returning id into v_id;
  insert into public.stock_count_items(shop_id,stock_count_id,product_id,expected_quantity)
  select v_shop,v_id,p.id,coalesce(i.quantity,0)
  from public.products p left join public.inventory i on i.shop_id=v_shop and i.product_id=p.id
  where p.shop_id=v_shop and p.active=true;
  perform public.write_audit(v_shop,'STOCK_COUNT_CREATED','stock_count',v_id::text,null,null,jsonb_build_object('count_number',v_num));
  return v_id;
end;
$$;

create or replace function public.stock_count_scan(p_stock_count_id uuid, p_barcode text)
returns table(product_id uuid, product_name text, expected_quantity integer, counted_quantity integer)
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_product uuid;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count is not open'; end if;
  select id into v_product from public.products where shop_id=v_shop and barcode=trim(p_barcode) and active=true;
  if v_product is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
  update public.stock_count_items
  set counted_quantity=coalesce(counted_quantity,0)+1,first_scanned_at=coalesce(first_scanned_at,now()),last_scanned_at=now()
  where stock_count_id=p_stock_count_id and product_id=v_product;
  return query select p.id,p.product_name,sci.expected_quantity,sci.counted_quantity
  from public.stock_count_items sci join public.products p on p.id=sci.product_id
  where sci.stock_count_id=p_stock_count_id and sci.product_id=v_product;
end;
$$;

create or replace function public.set_stock_count_quantity(p_stock_count_id uuid, p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if p_quantity < 0 then raise exception 'Count cannot be negative'; end if;
  update public.stock_count_items set counted_quantity=p_quantity,last_scanned_at=now(),first_scanned_at=coalesce(first_scanned_at,now())
  where stock_count_id=p_stock_count_id and product_id=p_product_id and shop_id=v_shop
    and exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN');
  if not found then raise exception 'Open stock count item not found'; end if;
end;
$$;

create or replace function public.mark_unseen_stock_count_zero(p_stock_count_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_count integer;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count not open'; end if;
  update public.stock_count_items set counted_quantity=0 where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null;
  get diagnostics v_count = row_count; return v_count;
end;
$$;

create or replace function public.submit_stock_count(p_stock_count_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if exists(select 1 from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null) then raise exception 'Uncounted SKUs remain. Scan them or explicitly mark unseen SKUs as zero.'; end if;
  update public.stock_counts set status='SUBMITTED',submitted_by=auth.uid(),submitted_at=now() where id=p_stock_count_id and shop_id=v_shop and status='OPEN';
  if not found then raise exception 'Open stock count not found'; end if;
end;
$$;

create or replace function public.approve_stock_count(p_stock_count_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; r record; v_before integer; v_after integer; v_adj uuid;
begin
  v_shop := public.assert_shop_access(); perform public.assert_manager_or_admin();
  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='SUBMITTED') then raise exception 'Submitted stock count not found'; end if;
  for r in select * from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is distinct from expected_quantity
  loop
    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
    v_before := coalesce(v_before,0); v_after := r.counted_quantity;
    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
    insert into public.stock_adjustments(shop_id,product_id,adjustment_type,quantity_change,reason,notes,created_by)
    values(v_shop,r.product_id,'STOCK_CORRECTION',v_after-v_before,'Approved physical stock count','Stock count '||p_stock_count_id,auth.uid()) returning id into v_adj;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_shop,r.product_id,'STOCK_COUNT',v_after-v_before,v_before,v_after,'STOCK_COUNT',p_stock_count_id,'Approved physical count',auth.uid());
  end loop;
  update public.stock_counts set status='APPROVED',approved_by=auth.uid(),approved_at=now() where id=p_stock_count_id;
  perform public.write_audit(v_shop,'STOCK_COUNT_APPROVED','stock_count',p_stock_count_id::text,null,null,'{}'::jsonb);
end;
$$;

-- ============================================================
-- CHAPTER 21 RPCs
-- ============================================================
create or replace function public.next_po_number(p_shop_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_counter bigint;
begin
  insert into public.shop_counters(shop_id) values(p_shop_id) on conflict(shop_id) do nothing;
  update public.shop_counters set po_counter=po_counter+1 where shop_id=p_shop_id returning po_counter into v_counter;
  return 'PO-'||to_char(current_date,'YYYY')||'-'||lpad(v_counter::text,6,'0');
end;
$$;

create or replace function public.create_purchase_order(p_supplier_id uuid, p_items jsonb, p_expected_date date default null, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_id uuid; v_num text; v_item jsonb; v_product uuid; v_qty integer; v_price numeric; v_total numeric:=0;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop and active=true) then raise exception 'Invalid supplier'; end if;
  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'PO items required'; end if;
  v_num:=public.next_po_number(v_shop);
  insert into public.purchase_orders(shop_id,po_number,supplier_id,expected_date,notes,created_by)
  values(v_shop,v_num,p_supplier_id,p_expected_date,p_notes,auth.uid()) returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product:=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'quantity')::integer; v_price:=(v_item->>'purchase_price')::numeric;
    if v_qty<=0 or v_price<0 then raise exception 'Invalid PO item'; end if;
    if not exists(select 1 from public.products where id=v_product and shop_id=v_shop and active=true) then raise exception 'Invalid product'; end if;
    insert into public.purchase_order_items(shop_id,purchase_order_id,product_id,ordered_quantity,purchase_price,line_total)
    values(v_shop,v_id,v_product,v_qty,v_price,v_qty*v_price);
    v_total:=v_total+v_qty*v_price;
  end loop;
  update public.purchase_orders set subtotal=v_total where id=v_id;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_CREATED','purchase_order',v_id::text,null,null,jsonb_build_object('po_number',v_num,'total',v_total));
  return v_id;
end;
$$;

create or replace function public.set_purchase_order_status(p_po_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if p_status not in ('SENT','CANCELLED') then raise exception 'Only SENT/CANCELLED status may be set manually'; end if;
  update public.purchase_orders set status=p_status where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT');
  if not found then raise exception 'Purchase order cannot be changed'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_'||p_status,'purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;
$$;

create or replace function public.receive_purchase_order(
  p_po_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_receive_items jsonb default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid; v_po public.purchase_orders%rowtype; r record; v_payload jsonb:='[]'::jsonb; v_qty integer; v_remaining integer; v_purchase uuid; v_all_received boolean;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT','PARTIALLY_RECEIVED') for update;
  if not found then raise exception 'Receivable purchase order not found'; end if;

  if p_receive_items is null then
    for r in select * from public.purchase_order_items where purchase_order_id=p_po_id loop
      v_remaining:=r.ordered_quantity-r.received_quantity;
      if v_remaining>0 then
        v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_remaining,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_remaining,'po_item_id',r.id));
      end if;
    end loop;
  else
    for r in select poi.*, x.qty from public.purchase_order_items poi join lateral (
      select (e->>'po_item_id')::uuid id,(e->>'quantity')::integer qty from jsonb_array_elements(p_receive_items) e
    ) x on x.id=poi.id where poi.purchase_order_id=p_po_id
    loop
      v_remaining:=r.ordered_quantity-r.received_quantity; v_qty:=r.qty;
      if v_qty<=0 or v_qty>v_remaining then raise exception 'Invalid receive quantity'; end if;
      v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_qty,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_qty,'po_item_id',r.id));
    end loop;
  end if;

  if jsonb_array_length(v_payload)=0 then raise exception 'Nothing remaining to receive'; end if;
  v_purchase:=public.receive_purchase(v_po.supplier_id,p_invoice_number,p_invoice_date,v_payload,p_notes);
  update public.purchases set purchase_order_id=p_po_id where id=v_purchase;

  for r in select * from jsonb_array_elements(v_payload) loop
    update public.purchase_order_items set received_quantity=received_quantity+(r->>'quantity')::integer where id=(r->>'po_item_id')::uuid;
  end loop;
  select not exists(select 1 from public.purchase_order_items where purchase_order_id=p_po_id and received_quantity<ordered_quantity) into v_all_received;
  update public.purchase_orders set status=case when v_all_received then 'RECEIVED' else 'PARTIALLY_RECEIVED' end where id=p_po_id;
  return v_purchase;
end;
$$;

create or replace function public.record_supplier_payment(p_supplier_id uuid,p_amount numeric,p_payment_method text,p_reference text default null,p_payment_date date default current_date,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_id uuid;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if p_amount<=0 then raise exception 'Payment must be positive'; end if;
  if p_payment_method not in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER') then raise exception 'Invalid payment method'; end if;
  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop) then raise exception 'Supplier not found'; end if;
  insert into public.supplier_payments(shop_id,supplier_id,amount,payment_method,reference_number,payment_date,notes,created_by)
  values(v_shop,p_supplier_id,p_amount,p_payment_method,p_reference,coalesce(p_payment_date,current_date),p_notes,auth.uid()) returning id into v_id;
  perform public.write_audit(v_shop,'SUPPLIER_PAYMENT','supplier_payment',v_id::text,null,null,jsonb_build_object('supplier_id',p_supplier_id,'amount',p_amount));
  return v_id;
end;
$$;

create or replace function public.create_purchase_return(p_supplier_id uuid,p_items jsonb,p_reason text,p_purchase_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid; v_id uuid; v_item jsonb; v_product uuid; v_qty integer; v_price numeric; v_before integer; v_after integer; v_total numeric:=0;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Return items required'; end if;
  insert into public.purchase_returns(shop_id,supplier_id,purchase_id,reason,created_by) values(v_shop,p_supplier_id,p_purchase_id,trim(p_reason),auth.uid()) returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product:=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'quantity')::integer; v_price:=(v_item->>'purchase_price')::numeric;
    if v_qty<=0 then raise exception 'Invalid return quantity'; end if;
    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
    if v_before is null or v_before<v_qty then raise exception 'Insufficient stock for supplier return'; end if;
    v_after:=v_before-v_qty; update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
    insert into public.purchase_return_items(shop_id,purchase_return_id,product_id,quantity,purchase_price,line_total)
    values(v_shop,v_id,v_product,v_qty,v_price,v_qty*v_price);
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_shop,v_product,'SUPPLIER_RETURN',-v_qty,v_before,v_after,'PURCHASE_RETURN',v_id,p_reason,auth.uid());
    v_total:=v_total+v_qty*v_price;
  end loop;
  update public.purchase_returns set total=v_total where id=v_id;
  perform public.write_audit(v_shop,'PURCHASE_RETURN','purchase_return',v_id::text,null,null,jsonb_build_object('total',v_total));
  return v_id;
end;
$$;

create or replace function public.supplier_balances()
returns table(supplier_id uuid,supplier_name text,purchases numeric,payments numeric,returns numeric,balance numeric)
language sql
stable
security definer
set search_path = public
as $$
  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access()),
  p as (select supplier_id,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' group by supplier_id),
  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() group by supplier_id),
  pr as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' group by supplier_id)
  select s.id,s.supplier_name,coalesce(p.total,0),coalesce(pay.total,0),coalesce(pr.total,0),coalesce(p.total,0)-coalesce(pay.total,0)-coalesce(pr.total,0)
  from s left join p on p.supplier_id=s.id left join pay on pay.supplier_id=s.id left join pr on pr.supplier_id=s.id order by s.supplier_name;
$$;

create or replace function public.purchase_price_history(p_product_id uuid,p_limit integer default 12)
returns table(invoice_date date,supplier_name text,purchase_price numeric,quantity integer)
language sql
stable
security definer
set search_path = public
as $$
  select pu.invoice_date,pu.supplier_name_snapshot,pi.purchase_price,pi.quantity
  from public.purchase_items pi join public.purchases pu on pu.id=pi.purchase_id
  where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and pu.status='RECEIVED'
  order by pu.invoice_date desc,pu.created_at desc limit greatest(1,least(p_limit,100));
$$;

-- ============================================================
-- CHAPTER 22: SMART REORDERING
-- ============================================================
create or replace function public.reorder_suggestions(p_history_days integer default 30,p_target_days integer default 7)
returns table(product_id uuid,barcode text,product_name text,current_stock integer,minimum_stock integer,units_per_case integer,units_sold integer,avg_daily numeric,days_remaining numeric,suggested_bottles integer,suggested_cases integer)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select p.id,p.barcode,p.product_name,p.minimum_stock,p.units_per_case,coalesce(i.quantity,0) stock
    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    where p.shop_id=public.assert_shop_access() and p.active=true
  ), sold as (
    select si.product_id,coalesce(sum(si.quantity),0)::int units
    from public.sale_items si join public.sales s on s.id=si.sale_id
    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED') and s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval
    group by si.product_id
  ), calc as (
    select b.*,coalesce(s.units,0) units,
      round(coalesce(s.units,0)::numeric/greatest(p_history_days,1),2) avgd
    from base b left join sold s on s.product_id=b.id
  )
  select id,barcode,product_name,stock,minimum_stock,units_per_case,units,avgd,
    case when avgd>0 then round(stock/avgd,1) else null end,
    greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))::int,
    case when greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))=0 then 0
         else ceil(greatest(0,ceil(greatest(avgd*p_target_days,minimum_stock)-stock))::numeric/greatest(units_per_case,1))::int end
  from calc
  where stock<=minimum_stock or (avgd>0 and stock/avgd<=p_target_days)
  order by case when avgd>0 then stock/avgd else 999999 end,stock;
$$;

-- ============================================================
-- CHAPTER 23: TRANSFER RPCs
-- ============================================================
create or replace function public.available_transfer_destinations()
returns table(shop_id uuid,shop_name text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id,s.name from public.shops s
  where s.organization_id=public.current_organization_id() and s.id<>public.assert_shop_access() and s.active=true and s.access_enabled=true
  order by s.name;
$$;

create or replace function public.create_stock_transfer(p_destination_shop_id uuid,p_items jsonb,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_source uuid; v_org uuid; v_id uuid; v_item jsonb; v_product uuid; v_qty integer;
begin
  v_source:=public.assert_shop_access(); perform public.assert_manager_or_admin(); v_org:=public.current_organization_id();
  if not exists(select 1 from public.shops where id=p_destination_shop_id and organization_id=v_org and id<>v_source and active=true) then raise exception 'Destination is not a branch in this organization'; end if;
  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Transfer items required'; end if;
  insert into public.stock_transfers(organization_id,source_shop_id,destination_shop_id,requested_by,notes)
  values(v_org,v_source,p_destination_shop_id,auth.uid(),p_notes) returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product:=(v_item->>'product_id')::uuid;v_qty:=(v_item->>'quantity')::integer;
    if v_qty<=0 then raise exception 'Transfer quantity must be positive'; end if;
    if not exists(select 1 from public.products where id=v_product and shop_id=v_source and active=true) then raise exception 'Source product not found'; end if;
    insert into public.stock_transfer_items(transfer_id,source_product_id,quantity) values(v_id,v_product,v_qty);
  end loop;
  perform public.write_audit(v_source,'TRANSFER_REQUESTED','stock_transfer',v_id::text,null,null,jsonb_build_object('destination',p_destination_shop_id));
  return v_id;
end;
$$;

create or replace function public.cancel_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='CANCELLED',reviewed_at=now() where id=p_transfer_id and source_shop_id=v_shop and status='REQUESTED';
  if not found then raise exception 'Transfer cannot be cancelled'; end if;
  perform public.write_audit(v_shop,'TRANSFER_CANCELLED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;
$$;

create or replace function public.reject_stock_transfer(p_transfer_id uuid,p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='REJECTED',approved_by=auth.uid(),reviewed_at=now(),notes=concat_ws(E'\n',notes,p_note)
  where id=p_transfer_id and destination_shop_id=v_shop and status='REQUESTED';
  if not found then raise exception 'Incoming transfer not found'; end if;
  perform public.write_audit(v_shop,'TRANSFER_REJECTED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('note',p_note));
end;
$$;

create or replace function public.approve_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dest uuid; v_transfer public.stock_transfers%rowtype; r record; v_src_product public.products%rowtype; v_dest_product uuid; v_cat_name text; v_dest_cat uuid; v_before_src integer; v_after_src integer; v_before_dest integer; v_after_dest integer;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
  if not found then raise exception 'Incoming transfer not found'; end if;
  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;

  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id
  loop
    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_transfer.source_shop_id;
    if not found then raise exception 'Source product missing'; end if;
    select quantity into v_before_src from public.inventory where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id for update;
    if v_before_src is null or v_before_src<r.quantity then raise exception 'Insufficient stock for %',v_src_product.product_name; end if;

    select id into v_dest_product from public.products where shop_id=v_dest and barcode=v_src_product.barcode limit 1;
    if v_dest_product is null then
      select name into v_cat_name from public.categories where id=v_src_product.category_id;
      if v_cat_name is not null then
        select id into v_dest_cat from public.categories where shop_id=v_dest and lower(name)=lower(v_cat_name) limit 1;
        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_dest,v_cat_name) returning id into v_dest_cat; end if;
      end if;
      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
      values(v_dest,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
      returning id into v_dest_product;
      insert into public.inventory(shop_id,product_id,quantity) values(v_dest,v_dest_product,0);
    end if;

    select quantity into v_before_dest from public.inventory where shop_id=v_dest and product_id=v_dest_product for update;
    v_before_dest:=coalesce(v_before_dest,0);v_after_src:=v_before_src-r.quantity;v_after_dest:=v_before_dest+r.quantity;
    update public.inventory set quantity=v_after_src where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id;
    update public.inventory set quantity=v_after_dest where shop_id=v_dest and product_id=v_dest_product;
    update public.stock_transfer_items set destination_product_id=v_dest_product where id=r.id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_transfer.source_shop_id,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before_src,v_after_src,'STOCK_TRANSFER',p_transfer_id,'Branch transfer out',auth.uid());
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_dest,v_dest_product,'TRANSFER_IN',r.quantity,v_before_dest,v_after_dest,'STOCK_TRANSFER',p_transfer_id,'Branch transfer in',auth.uid());
  end loop;
  update public.stock_transfers set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_transfer_id;
  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
end;
$$;

-- ============================================================
-- CHAPTER 25: IDEMPOTENT SALE / OFFLINE SYNC
-- ============================================================
create or replace function public.complete_sale_v2(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null,
  p_client_sale_id uuid default gen_random_uuid(),
  p_offline_created_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid; v_existing uuid; v_sale_id uuid; v_invoice text; v_item jsonb; v_product uuid; v_name text; v_barcode text; v_qty integer; v_price numeric; v_before integer; v_after integer; v_subtotal numeric:=0; v_total numeric; v_shift uuid; v_role text;
begin
  v_shop:=public.assert_shop_access(); v_role:=public.current_user_role();
  if p_client_sale_id is null then p_client_sale_id:=gen_random_uuid(); end if;
  select id into v_existing from public.sales where shop_id=v_shop and client_sale_id=p_client_sale_id;
  if v_existing is not null then return v_existing; end if;
  if p_payment_method not in ('CASH','UPI','CARD') then raise exception 'Invalid payment method'; end if;
  if p_discount<0 then raise exception 'Discount cannot be negative'; end if;
  if p_items is null or jsonb_array_length(p_items)=0 then raise exception 'Sale items required'; end if;

  if p_offline_created_at is null then
    select id into v_shift
    from public.cashier_shifts
    where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN'
    order by opened_at desc limit 1;
  else
    -- Offline synchronization may happen after the shift was closed. Attach the sale
    -- to the shift that was active when the sale actually occurred, not the shift state
    -- at synchronization time.
    select id into v_shift
    from public.cashier_shifts
    where shop_id=v_shop
      and cashier_id=auth.uid()
      and opened_at <= p_offline_created_at
      and coalesce(closed_at, now() + interval '100 years') >= p_offline_created_at
      and status in ('OPEN','CLOSE_REQUESTED','CLOSED')
    order by opened_at desc limit 1;
  end if;
  if v_role='CASHIER' and v_shift is null then raise exception 'SHIFT_REQUIRED'; end if;

  v_invoice:=public.next_sale_number(v_shop);
  insert into public.sales(shop_id,invoice_number,cashier_id,status,payment_status,shift_id,client_sale_id,offline_created_at)
  values(v_shop,v_invoice,auth.uid(),'COMPLETED','PAID',v_shift,p_client_sale_id,p_offline_created_at) returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product:=(v_item->>'product_id')::uuid;v_qty:=(v_item->>'quantity')::integer;
    if v_qty<=0 then raise exception 'Invalid sale quantity'; end if;
    select product_name,barcode,selling_price into v_name,v_barcode,v_price from public.products where id=v_product and shop_id=v_shop and active=true;
    if v_name is null then raise exception 'Invalid/inactive product'; end if;
    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
    if v_before is null or v_before<v_qty then raise exception 'Insufficient stock for %',v_name; end if;
    v_after:=v_before-v_qty;
    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
    insert into public.sale_items(shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total)
    values(v_shop,v_sale_id,v_product,v_name,v_barcode,v_qty,v_price,0,v_qty*v_price);
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_shop,v_product,case when p_offline_created_at is null then 'SALE' else 'OFFLINE_SALE' end,-v_qty,v_before,v_after,'SALE',v_sale_id,case when p_offline_created_at is null then 'POS sale' else 'Synced offline POS sale' end,auth.uid());
    v_subtotal:=v_subtotal+v_qty*v_price;
  end loop;
  if p_discount>v_subtotal then raise exception 'Discount cannot exceed subtotal'; end if;
  v_total:=v_subtotal-p_discount;
  update public.sales set subtotal=v_subtotal,discount=p_discount,grand_total=v_total where id=v_sale_id;
  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
  values(v_shop,v_sale_id,p_payment_method,v_total,p_payment_reference,'PAYMENT',v_shift);
  perform public.write_audit(v_shop,case when p_offline_created_at is null then 'SALE_COMPLETED' else 'OFFLINE_SALE_SYNCED' end,'sale',v_sale_id::text,null,null,jsonb_build_object('invoice',v_invoice,'discount',p_discount,'client_sale_id',p_client_sale_id));
  return v_sale_id;
end;
$$;

create or replace function public.sync_offline_sale(
  p_client_sale_id uuid,p_offline_created_at timestamptz,p_items jsonb,p_payment_method text,p_discount numeric default 0,p_payment_reference text default null
)
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.complete_sale_v2(p_items,p_payment_method,p_discount,p_payment_reference,p_client_sale_id,p_offline_created_at);
$$;

-- ============================================================
-- CHAPTER 26: OCR PRODUCT MATCHING
-- ============================================================
create or replace function public.match_product_text(p_text text,p_supplier_id uuid default null,p_limit integer default 5)
returns table(product_id uuid,barcode text,product_name text,score numeric,match_source text)
language sql
stable
security definer
set search_path = public
as $$
  with q as (select lower(regexp_replace(coalesce(p_text,''),'[^a-zA-Z0-9]+',' ','g')) txt),
  alias_matches as (
    select pa.product_id,p.barcode,p.product_name,similarity(pa.normalized_alias,q.txt)::numeric score,'ALIAS'::text source
    from public.product_aliases pa join public.products p on p.id=pa.product_id cross join q
    where pa.shop_id=public.assert_shop_access() and (pa.supplier_id is null or p_supplier_id is null or pa.supplier_id=p_supplier_id)
  ), product_matches as (
    select p.id,p.barcode,p.product_name,greatest(similarity(lower(p.product_name),q.txt),similarity(lower(coalesce(p.brand,'')||' '||p.product_name||' '||p.size_ml::text),q.txt))::numeric score,'PRODUCT'::text source
    from public.products p cross join q where p.shop_id=public.current_shop_id() and p.active=true
  ), allm as (select * from alias_matches union all select * from product_matches), ranked as (
    select *,row_number() over(partition by product_id order by score desc) rn from allm
  )
  select product_id,barcode,product_name,round(score,3),source from ranked where rn=1 and score>0.10 order by score desc limit greatest(1,least(p_limit,20));
$$;

-- ============================================================
-- RLS + GRANTS
-- ============================================================
alter table public.organizations enable row level security;
alter table public.sale_return_requests enable row level security;
alter table public.sale_return_items enable row level security;
alter table public.cashier_shifts enable row level security;
alter table public.stock_counts enable row level security;
alter table public.stock_count_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.supplier_payments enable row level security;
alter table public.purchase_returns enable row level security;
alter table public.purchase_return_items enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.product_aliases enable row level security;

-- Harden existing transactional reads.
drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales for select to authenticated using (
  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id)
  and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
);

drop policy if exists sale_items_select on public.sale_items;
create policy sale_items_select on public.sale_items for select to authenticated using (
  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
);

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated using (
  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
);

drop policy if exists purchases_select on public.purchases;
create policy purchases_select on public.purchases for select to authenticated using (
  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
);
drop policy if exists purchase_items_select on public.purchase_items;
create policy purchase_items_select on public.purchase_items for select to authenticated using (
  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
);

-- New table policies.
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations for select to authenticated using (id=public.current_organization_id() or public.is_platform_admin());

drop policy if exists returns_select on public.sale_return_requests;
create policy returns_select on public.sale_return_requests for select to authenticated using (
  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or requested_by=auth.uid())
);
drop policy if exists return_items_select on public.sale_return_items;
create policy return_items_select on public.sale_return_items for select to authenticated using (
  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
);

drop policy if exists shifts_select on public.cashier_shifts;
create policy shifts_select on public.cashier_shifts for select to authenticated using (
  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
);

drop policy if exists stock_counts_select on public.stock_counts;
create policy stock_counts_select on public.stock_counts for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
drop policy if exists stock_count_items_select on public.stock_count_items;
create policy stock_count_items_select on public.stock_count_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));

drop policy if exists po_select on public.purchase_orders;
create policy po_select on public.purchase_orders for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
drop policy if exists po_items_select on public.purchase_order_items;
create policy po_items_select on public.purchase_order_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
drop policy if exists supplier_payments_select on public.supplier_payments;
create policy supplier_payments_select on public.supplier_payments for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
drop policy if exists purchase_returns_select on public.purchase_returns;
create policy purchase_returns_select on public.purchase_returns for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
drop policy if exists purchase_return_items_select on public.purchase_return_items;
create policy purchase_return_items_select on public.purchase_return_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));

drop policy if exists transfers_select on public.stock_transfers;
create policy transfers_select on public.stock_transfers for select to authenticated using (
  public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(public.current_shop_id()) and (source_shop_id=public.current_shop_id() or destination_shop_id=public.current_shop_id())
);
drop policy if exists transfer_items_select on public.stock_transfer_items;
create policy transfer_items_select on public.stock_transfer_items for select to authenticated using (
  exists(select 1 from public.stock_transfers t where t.id=transfer_id and (t.source_shop_id=public.current_shop_id() or t.destination_shop_id=public.current_shop_id()) and public.current_user_role() in ('ADMIN','MANAGER'))
);

drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and public.shop_access_allowed(shop_id));

drop policy if exists aliases_select on public.product_aliases;
create policy aliases_select on public.product_aliases for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));

-- Edge/browser direct insert only for aliases, controlled by RLS manager/admin.
drop policy if exists aliases_manage on public.product_aliases;
create policy aliases_manage on public.product_aliases for all to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id)) with check (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));

-- Grants. Transaction mutations are RPC-only.
grant select on public.organizations,public.sale_return_requests,public.sale_return_items,public.cashier_shifts,public.stock_counts,public.stock_count_items,public.purchase_orders,public.purchase_order_items,public.supplier_payments,public.purchase_returns,public.purchase_return_items,public.stock_transfers,public.stock_transfer_items,public.audit_logs,public.product_aliases to authenticated;
grant insert,update,delete on public.product_aliases to authenticated;

grant execute on function public.get_products() to authenticated;
grant execute on function public.update_product_details(uuid,text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer) to authenticated;
grant execute on function public.set_product_active(uuid,boolean) to authenticated;
grant execute on function public.create_return_request(uuid,jsonb,text,text,text) to authenticated;
grant execute on function public.approve_return_request(uuid) to authenticated;
grant execute on function public.reject_return_request(uuid,text) to authenticated;
grant execute on function public.void_sale(uuid,text,text,text) to authenticated;
grant execute on function public.open_shift(numeric,text) to authenticated;
grant execute on function public.my_open_shift() to authenticated;
grant execute on function public.shift_totals(uuid) to authenticated;
grant execute on function public.request_close_shift(numeric,text) to authenticated;
grant execute on function public.approve_shift_close(uuid,text) to authenticated;
grant execute on function public.create_stock_count(text) to authenticated;
grant execute on function public.stock_count_scan(uuid,text) to authenticated;
grant execute on function public.set_stock_count_quantity(uuid,uuid,integer) to authenticated;
grant execute on function public.mark_unseen_stock_count_zero(uuid) to authenticated;
grant execute on function public.submit_stock_count(uuid) to authenticated;
grant execute on function public.approve_stock_count(uuid) to authenticated;
grant execute on function public.create_purchase_order(uuid,jsonb,date,text) to authenticated;
grant execute on function public.set_purchase_order_status(uuid,text) to authenticated;
grant execute on function public.receive_purchase_order(uuid,text,date,jsonb,text) to authenticated;
grant execute on function public.record_supplier_payment(uuid,numeric,text,text,date,text) to authenticated;
grant execute on function public.create_purchase_return(uuid,jsonb,text,uuid) to authenticated;
grant execute on function public.supplier_balances() to authenticated;
grant execute on function public.purchase_price_history(uuid,integer) to authenticated;
grant execute on function public.reorder_suggestions(integer,integer) to authenticated;
grant execute on function public.available_transfer_destinations() to authenticated;
grant execute on function public.create_stock_transfer(uuid,jsonb,text) to authenticated;
grant execute on function public.cancel_stock_transfer(uuid) to authenticated;
grant execute on function public.reject_stock_transfer(uuid,text) to authenticated;
grant execute on function public.approve_stock_transfer(uuid) to authenticated;
grant execute on function public.complete_sale_v2(jsonb,text,numeric,text,uuid,timestamptz) to authenticated;
grant execute on function public.sync_offline_sale(uuid,timestamptz,jsonb,text,numeric,text) to authenticated;
grant execute on function public.match_product_text(text,uuid,integer) to authenticated;

-- Column-level hardening: Cashier/browser code cannot query purchase_price directly.
-- Chapter 16+ reads products through get_products(), which returns purchase_price only to ADMIN/MANAGER.
revoke select on public.products from authenticated;
grant select(id,shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,mrp,selling_price,minimum_stock,units_per_case,active,created_by,created_at,updated_at) on public.products to authenticated;

-- Refresh PostgREST schema cache after migration in case the platform does not do it immediately.
notify pgrst, 'reload schema';
`````

