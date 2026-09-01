import SortableTable from "../components/ui/SortableTable";
import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";

export default function ProductCleanup(){
  const{products,getStock,refreshAll}=useShop();
  const[search,setSearch]=useState("");const[selectedId,setSelectedId]=useState("");
  const[check,setCheck]=useState(null);const[confirmation,setConfirmation]=useState("");
  const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
  const rows=useMemo(()=>{const q=search.trim().toLowerCase();return products.filter((p)=>!q||[p.name,p.brand,p.barcode,p.sku].some((v)=>String(v||"").toLowerCase().includes(q))).slice(0,50);},[products,search]);
  const selected=products.find((p)=>p.id===selectedId)||null;
  async function inspect(id){setSelectedId(id);setCheck(null);setConfirmation("");setMessage("");setBusy(true);const{data,error}=await supabase.rpc("admin_product_cleanup_check",{p_product_id:id});setBusy(false);if(error){setMessage(error.message||"Unable to inspect product.");return}setCheck(data);}
  async function purge(){if(!selectedId||confirmation!=="DELETE")return;setBusy(true);const{data,error}=await supabase.rpc("admin_delete_test_product",{p_product_id:selectedId,p_confirmation:confirmation});setBusy(false);if(error){setMessage(error.message||"Product cleanup failed.");return}setMessage(data?.message||"Test product deleted.");setSelectedId("");setCheck(null);setConfirmation("");await refreshAll();}
  return <div><div className="page-heading"><div><h2>Product Cleanup</h2><p>Admin-only cleanup for mistakenly created test products. Transaction history is protected.</p></div></div>
  {message&&<div className="purchase-message">{message}</div>}
  <section className="panel"><h3>Find Product</h3><input data-scanner-capture="barcode" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search product or barcode..." style={{width:"100%",maxWidth:520}}/>
  <div className="data-table-wrapper" style={{marginTop:12}}><SortableTable className="data-table"><thead><tr><th>Product</th><th>Barcode</th><th>Stock</th><th>Action</th></tr></thead><tbody>{rows.map((p)=><tr key={p.id}><td>{p.name}</td><td>{p.barcode||"-"}</td><td>{getStock(p.id)}</td><td><button type="button" className="secondary-button" onClick={()=>inspect(p.id)}>Inspect</button></td></tr>)}</tbody></SortableTable></div></section>
  {selected&&check?<section className="panel" style={{marginTop:16}}><h3>Deletion Safety Check</h3><p><strong>{selected.name}</strong> · {selected.barcode||"-"}</p><p>Sales: <strong>{check.sale_references||0}</strong> · Purchases: <strong>{check.purchase_references||0}</strong> · Protected references: <strong>{check.protected_references||0}</strong></p>
  {check.deletable?<><div className="purchase-message success">SAFE TEST-DATA PURGE. Type DELETE to confirm.</div><label>Confirmation<input value={confirmation} onChange={(e)=>setConfirmation(e.target.value)} placeholder="DELETE"/></label><button type="button" className="danger-button" disabled={busy||confirmation!=="DELETE"} onClick={purge}>Permanently Delete Test Product</button></>:<div className="purchase-message">HARD DELETE BLOCKED. Deactivate or correct this product instead.</div>}
  {check.blockers?.length?<ul>{check.blockers.map((b)=><li key={b}>{b}</li>)}</ul>:null}</section>:null}</div>;
}
