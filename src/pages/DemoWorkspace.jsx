import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSaaS } from "../context/SaaSContext";

export const DEMO_SESSION_KEY="wineshoppos_demo_workspace_v1";
const SEED={products:[
{id:"d1",barcode:"8901234500011",name:"Kingfisher Premium 650 ml",category:"Beer",price:160,stock:48},
{id:"d2",barcode:"8901234500028",name:"Budweiser Magnum 650 ml",category:"Beer",price:220,stock:36},
{id:"d3",barcode:"8901234500035",name:"Royal Stag 750 ml",category:"Whisky",price:780,stock:18},
{id:"d4",barcode:"8901234500042",name:"Blenders Pride 750 ml",category:"Whisky",price:1250,stock:14},
{id:"d5",barcode:"8901234500059",name:"Old Monk 750 ml",category:"Rum",price:720,stock:21},
{id:"d6",barcode:"8901234500066",name:"Smirnoff Red 750 ml",category:"Vodka",price:980,stock:17},
{id:"d7",barcode:"8901234500073",name:"Sula Chenin Blanc 750 ml",category:"Wine",price:900,stock:12},
{id:"d8",barcode:"8901234500080",name:"Bacardi Carta Blanca 750 ml",category:"Rum",price:1050,stock:10}
],sales:[{id:"S-1001",at:"Today 10:15",total:440},{id:"S-1002",at:"Today 11:02",total:780},{id:"S-1003",at:"Today 11:44",total:1250}]};
const fresh=()=>JSON.parse(JSON.stringify(SEED));
function load(){try{const raw=sessionStorage.getItem(DEMO_SESSION_KEY);return raw?JSON.parse(raw):fresh()}catch{return fresh()}}
export function clearDemoWorkspace(){sessionStorage.removeItem(DEMO_SESSION_KEY)}
export default function DemoWorkspace(){
 const{signOut}=useAuth();const{trialEndsAt}=useSaaS();const[data,setData]=useState(load);const[msg,setMsg]=useState("Demo data is temporary and never saved to Supabase.");
 function save(next){setData(next);sessionStorage.setItem(DEMO_SESSION_KEY,JSON.stringify(next))}
 function sell(p){if(p.stock<=0)return;save({...data,products:data.products.map(x=>x.id===p.id?{...x,stock:x.stock-1}:x),sales:[{id:`DEMO-${Date.now()}`,at:"Just now",total:p.price},...data.sales]});setMsg(`${p.name} sold in demo memory only.`)}
 function receive(p){save({...data,products:data.products.map(x=>x.id===p.id?{...x,stock:x.stock+12}:x)});setMsg(`Received 1 demo case (+12) of ${p.name}.`)}
 function reset(){clearDemoWorkspace();setData(fresh());setMsg("Demo workspace restored to original seed data.")}
 const revenue=useMemo(()=>data.sales.reduce((s,x)=>s+Number(x.total||0),0),[data.sales]);const units=useMemo(()=>data.products.reduce((s,x)=>s+Number(x.stock||0),0),[data.products]);
 return <div style={{padding:24,maxWidth:1200,margin:"0 auto"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",alignItems:"center"}}><div><h1>WineShopPOS Demo Workspace</h1><p>Disposable browser-only workspace · resets on logout/new session.</p><p><strong>Trial ends:</strong> {trialEndsAt?new Date(trialEndsAt).toLocaleString():"2 days after first demo login"}</p></div><div style={{display:"flex",gap:8}}><button className="secondary-button" onClick={reset}>Reset Demo</button><button className="secondary-button" onClick={signOut}>Logout</button></div></div>
  <div className="purchase-message" style={{margin:"16px 0"}}>{msg}</div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}><div className="auth-card"><strong>{data.products.length}</strong><div>Products</div></div><div className="auth-card"><strong>{units}</strong><div>Units in stock</div></div><div className="auth-card"><strong>{data.sales.length}</strong><div>Demo sales</div></div><div className="auth-card"><strong>₹{revenue.toLocaleString("en-IN")}</strong><div>Demo revenue</div></div></div>
  <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th>Barcode</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{data.products.map(p=><tr key={p.id} style={{borderTop:"1px solid rgba(148,163,184,.25)"}}><td style={{padding:10}}>{p.barcode}</td><td style={{padding:10}}>{p.name}</td><td style={{padding:10}}>{p.category}</td><td style={{padding:10}}>₹{p.price}</td><td style={{padding:10}}>{p.stock}</td><td style={{padding:10}}><button className="primary-button" onClick={()=>sell(p)}>Demo Sale</button> <button className="secondary-button" onClick={()=>receive(p)}>+1 Case</button></td></tr>)}</tbody></table></div>
 </div>
}
