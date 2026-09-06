# WineShopPOS V2 — Initial Feature Classification

Run: `20260830_065028`

> Status is generated from lexical repository evidence and is intentionally
> conservative. Before coding, inspect the referenced source/migration
> semantics and upgrade/downgrade the status with concrete evidence.

| ID | Feature | Initial status | Evidence | Required action |
| --- | --- | --- | ---: | --- |
| N1 | Landed Cost Engine | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N2 | Batch / Receipt Lot Tracking | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N3 | True Stock Ageing | PARTIAL | 1 code hits | Evidence exists; inspect and extend only the missing behavior. |
| N4 | FIFO / Rotation Foundation | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N5 | Discount / Price Override | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N6 | Standardized Reason Codes | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N7 | Accountant / Tally-ready Export | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N8 | Customer Loyalty | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N9 | Coupons / Promotions | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N10 | Gift Voucher / Store Credit | MISSING | 0 code hits | No direct code/migration evidence; inspect semantics before creating anything. |
| N11 | Supplier Performance Score | PARTIAL | 5 code hits | Evidence exists; inspect and extend only the missing behavior. |
| N12 | Advanced Stock Transfer | NEEDS TESTING | 8 code hits | Substantial evidence exists; verify UI/backend/RLS/tests before changing architecture. |
| N13 | Approval Center Expansion | NEEDS TESTING | 6 code hits | Substantial evidence exists; verify UI/backend/RLS/tests before changing architecture. |
| N14 | Leakage Shield Expansion | PARTIAL | 3 code hits | Evidence exists; inspect and extend only the missing behavior. |
| N15 | Purchase Coach Expansion | NEEDS TESTING | 16 code hits | Substantial evidence exists; verify UI/backend/RLS/tests before changing architecture. |

## Evidence excerpts

### N1
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N2
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N3
```text
supabase/config.toml:305:# Configure MFA via Phone Messaging
```

### N4
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N5
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N6
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N7
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N8
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N9
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N10
_No direct lexical evidence found in src/supabase/scripts/package.json._

### N11
```text
src/pages/AutomationHub.jsx:46:      .map((supplier) => ({ ...supplier, score: supplierScore(result.supplierName, supplier.supplier_name) }))
src/pages/AutomationHub.jsx:47:      .filter((supplier) => supplier.score >= 35)
src/pages/AutomationHub.jsx:95:        .map((supplier) => ({ ...supplier, score: supplierScore(data.invoice.supplierName, supplier.supplier_name) }))
src/pages/AutomationHub.jsx:191:        {supplierMatches[0] ? <p className="muted-text">Best existing match: <strong>{supplierMatches[0].supplier_name}</strong> · confidence score {supplierMatches[0].score}%</p> : <p className="muted-text">No close existing supplier match was found.</p>}
src/pages/AutomationHub.jsx:198:                return <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}{scored ? ` · ${scored.score}% match` : ""}</option>;
```

### N12
```text
src/pages/Transfers.jsx:12:function actions(t){const incoming=t.destination_shop_id===profile?.shop_id;const outgoing=t.source_shop_id===profile?.shop_id;if(t.status==="REQUESTED"&&incoming)return <><button className="primary-button" onClick={()=>act("approve_stock_transfer",t.id,{},"Transfer approved")}>Approve</button><button className="secondary-button" onClick={()=>act("reject_stock_transfer",t.id,{p_note:"Rejected from consolidated transfer screen"},"Transfer rejected")}>Reject</button></>;if(t.status==="REQUESTED"&&outgoing)return <button className="secondary-button" onClick={()=>act("cancel_stock_transfer",t.id,{},"Transfer cancelled")}>Cancel</button>;if(t.status==="APPROVED"&&outgoing)return <button className="primary-button" onClick={()=>act("dispatch_stock_transfer",t.id,{},"Transfer dispatched; source stock deducted")}>Dispatch</button>;if(t.status==="DISPATCHED"&&outgoing)return <button className="secondary-button" onClick={()=>act("mark_stock_transfer_in_transit",t.id,{},"Transfer marked in transit")}>Mark In Transit</button>;if(["DISPATCHED","IN_TRANSIT"].includes(t.status)&&incoming)return <button className="primary-button" onClick={()=>act("receive_stock_transfer",t.id,{},"Transfer received; destination stock increased")}>Receive</button>;if(t.status==="RECEIVED"&&incoming)return <button className="primary-button" onClick={()=>act("complete_stock_transfer",t.id,{},"Transfer completed")}>Complete</button>;return <span className="muted-text">No action</span>}
supabase/migrations/20260829233000_master_reconsolidation.sql:517:-- New lifecycle: REQUESTED -> APPROVED -> DISPATCHED -> IN_TRANSIT -> RECEIVED -> COMPLETED
supabase/migrations/20260829233000_master_reconsolidation.sql:522:check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED','DISPATCHED','IN_TRANSIT','RECEIVED','COMPLETED'));
supabase/migrations/20260829233000_master_reconsolidation.sql:581:  update public.stock_transfers set status='DISPATCHED',dispatched_by=auth.uid(),dispatched_at=now() where id=p_transfer_id;
supabase/migrations/20260829233000_master_reconsolidation.sql:582:  perform public.write_audit(v_source,'TRANSFER_DISPATCHED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
supabase/migrations/20260829233000_master_reconsolidation.sql:594:  update public.stock_transfers set status='IN_TRANSIT' where id=p_transfer_id and source_shop_id=v_shop and status='DISPATCHED';
supabase/migrations/20260829233000_master_reconsolidation.sql:596:  perform public.write_audit(v_shop,'TRANSFER_IN_TRANSIT','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
supabase/migrations/20260829233000_master_reconsolidation.sql:608:  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status in ('DISPATCHED','IN_TRANSIT') for update;
```

### N13
```text
src/App.jsx:29:import Approvals from "./pages/Approvals";
src/App.jsx:103:            <Route path="approvals" element={<Approvals/>}/>
src/components/Layout.jsx:23:    count: "Stock Count", transfers: "Transfers", expenses: "Expenses", approvals: "Approvals",
src/config/accessMatrix.js:12:  { capability: "Approvals", cashier: "NO", manager: "OPERATIONS", admin: "ALL", note: "Sensitive decisions remain manager/admin controlled." },
src/config/navigation.js:50:    { path: "/operations/approvals", label: "Approvals", roles: ["ADMIN", "MANAGER"] },
src/pages/Approvals.jsx:7:export default function Approvals(){const[items,setItems]=useState([]);const[message,setMessage]=useState("");const[busy,setBusy]=useState("");
```

### N14
```text
src/App.jsx:34:import OwnerExceptions from "./pages/OwnerExceptions";
src/App.jsx:114:            <Route path="exceptions" element={<OwnerExceptions/>}/>
src/pages/OwnerExceptions.jsx:7:export default function OwnerExceptions(){const[rows,setRows]=useState([]);const[days,setDays]=useState(30);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("loss_control_exceptions",{p_days:Number(days)});if(error)setMsg("Unable to load exceptions.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Audit & Loss Control" subtitle="Neutral, rule-based exception detection. Items are flagged for review, not accusations." tier="PRO"/><div className="panel filter-bar"><label>Lookback<select value={days} onChange={(e)=>setDays(e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label><button className="primary-button" onClick={load}>Refresh</button></div>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel" style={{marginTop:16}}><h3>Requires Review</h3>{rows.length===0?<EmptyState title="No unusual activity found" message="No configured rule exceeded its review threshold in this period."/>:<div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Severity</th><th>Type</th><th>When</th><th>Summary</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.entity_id}-${i}`}><td><span className={`priority ${String(r.severity).toLowerCase()}`}>{r.severity}</span></td><td>{r.exception_type.replaceAll("_"," ")}</td><td>{new Date(r.event_time).toLocaleString("en-IN")}</td><td>{r.summary}</td><td>{money.format(r.amount||0)}</td><td><Link to={r.action_path||"/owner"}>Review</Link></td></tr>)}</tbody></table></div>}</section></div>}
```

### N15
```text
src/App.jsx:23:import PurchaseIntelligence from "./pages/PurchaseIntelligence";
src/App.jsx:86:            <Route path="intelligence" element={<PurchaseIntelligence/>}/>
src/pages/InventoryIntelligence.jsx:13:  async function load(){const {data,error}=await supabase.rpc("inventory_health",{p_history_days:30,p_dead_days:45});if(error)setMessage("Unable to load inventory intelligence.");else setHealth(data||[])}
src/pages/InventoryIntelligence.jsx:24:    <section className="panel" style={{marginTop:16}}><div className="section-row"><div><h3>Inventory Health</h3><p className="muted-text">30-day sales velocity with 45-day dead-stock threshold.</p></div><label>Supplier for PO<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">Select supplier</option>{suppliers.map((s)=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label></div>{health.length===0?<EmptyState title="No inventory health data" message="Products and sales history are required."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Product</th><th>Stock</th><th>30d Sales</th><th>Avg/Day</th><th>Days Left</th><th>Inventory Cost</th><th>Health</th><th></th></tr></thead><tbody>{health.map((r)=><tr key={r.product_id}><td>{r.product_name}</td><td>{r.current_stock}</td><td>{r.units_sold}</td><td>{r.avg_daily}</td><td>{r.days_remaining??"-"}</td><td>{money.format(r.inventory_cost)}</td><td><StatusBadge status={r.classification}/></td><td>{["STOCKOUT_RISK","OUT_OF_STOCK"].includes(r.classification)?<button className="secondary-button" onClick={()=>createPO(r)}>Create PO</button>:null}</td></tr>)}</tbody></table></div>}</section>
src/pages/PurchaseIntelligence.jsx:12:export default function PurchaseIntelligence() {
src/pages/Recommendations.jsx:6:export default function Recommendations(){const[rows,setRows]=useState([]);const[msg,setMsg]=useState("");async function load(){const{data,error}=await supabase.rpc("owner_recommendations",{p_history_days:30});if(error)setMsg("Unable to calculate recommendations.");else setRows(data||[])}useEffect(()=>{load()},[]);return <div><PageHeader title="Smart Recommendations" subtitle="Rule-based actions from live stock, sales, inventory health and shift variance." tier="PLUS"/>{msg?<div className="purchase-message">{msg}</div>:null}<section className="panel recommendation-list">{rows.length===0?<EmptyState title="No recommendations right now" message="The shop has no configured condition requiring an action."/>:rows.map((r,i)=><div className="recommendation-card" key={`${r.recommendation_type}-${i}`}><div><span className={`priority ${String(r.priority).toLowerCase()}`}>{r.priority}</span><h3>{r.title}</h3><p>{r.message}</p></div><Link className="secondary-button" to={r.action_path||"/owner"}>Take Action</Link></div>)}</section></div>}
src/pages/Reorder.jsx:5:export default function Reorder(){const{products,suppliers}=useShop();const[days,setDays]=useState(30);const[target,setTarget]=useState(7);const[rows,setRows]=useState([]);const[message,setMessage]=useState("");async function load(){const{data,error}=await supabase.rpc("reorder_suggestions",{p_history_days:Number(days),p_target_days:Number(target)});if(error)setMessage(error.message);else setRows(data||[])}useEffect(()=>{load()},[]);
src/pages/Reorder.jsx:6:async function createPO(row){const sid=prompt("Supplier UUID for this order",suppliers[0]?.id||"");if(!sid)return;const p=products.find((x)=>x.id===row.product_id);const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:sid,p_items:[{product_id:row.product_id,quantity:row.suggested_cases*row.units_per_case,purchase_price:p?.purchasePrice||0}],p_expected_date:null,p_notes:`Smart reorder: ${row.suggested_cases} case(s)`});setMessage(error?error.message:"Purchase order created from reorder suggestion.")}
supabase/migrations/20260829190000_chapters_16_26.sql:1078:create or replace function public.reorder_suggestions(p_history_days integer default 30,p_target_days integer default 7)
supabase/migrations/20260829190000_chapters_16_26.sql:1466:grant execute on function public.reorder_suggestions(integer,integer) to authenticated;
supabase/migrations/20260829233000_master_reconsolidation.sql:691:create or replace function public.inventory_health(p_history_days integer default 30,p_dead_days integer default 45)
supabase/migrations/20260829233000_master_reconsolidation.sql:805:    select * from public.reorder_suggestions(p_history_days,7) limit 8
supabase/migrations/20260829233000_master_reconsolidation.sql:807:    select * from public.inventory_health(p_history_days,45) where classification in ('DEAD','OVERSTOCK') limit 8
supabase/migrations/20260829233000_master_reconsolidation.sql:883:grant execute on function public.inventory_health(integer,integer) to authenticated;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:491:create or replace function public.ai_get_inventory_health(
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:990:grant execute on function public.ai_get_inventory_health(uuid,text,integer,integer) to authenticated;
```
