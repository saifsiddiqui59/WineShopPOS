import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSaaS } from "../context/SaaSContext";
import { getEnvironment } from "../config/environment";

export const DEMO_SESSION_KEY = "wineshoppos_demo_workspace_v1";

const SEED = {
  products:[
    {id:"d1",barcode:"8901234500011",name:"Kingfisher Premium 650 ml",category:"Beer",price:160,stock:48},
    {id:"d2",barcode:"8901234500028",name:"Budweiser Magnum 650 ml",category:"Beer",price:220,stock:36},
    {id:"d3",barcode:"8901234500035",name:"Royal Stag 750 ml",category:"Whisky",price:780,stock:18},
    {id:"d4",barcode:"8901234500042",name:"Blenders Pride 750 ml",category:"Whisky",price:1250,stock:14},
    {id:"d5",barcode:"8901234500059",name:"Old Monk 750 ml",category:"Rum",price:720,stock:21},
    {id:"d6",barcode:"8901234500066",name:"Smirnoff Red 750 ml",category:"Vodka",price:980,stock:17},
    {id:"d7",barcode:"8901234500073",name:"Sula Chenin Blanc 750 ml",category:"Wine",price:900,stock:12},
    {id:"d8",barcode:"8901234500080",name:"Bacardi Carta Blanca 750 ml",category:"Rum",price:1050,stock:10},
  ],
  sales:[
    {id:"S-1001",at:"Today 10:15",total:440},
    {id:"S-1002",at:"Today 11:02",total:780},
    {id:"S-1003",at:"Today 11:44",total:1250},
  ],
};

function fresh() {
  return JSON.parse(JSON.stringify(SEED));
}

function load() {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : fresh();
  } catch {
    return fresh();
  }
}

export function clearDemoWorkspace() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

function countdown(iso, now) {
  if (!iso) return "Starts on first successful demo login";
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return "Trial ended";
  const hours = Math.ceil(ms / 3_600_000);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} remaining`;
  const days = Math.floor(hours / 24);
  const remainderHours = hours % 24;
  return `${days} day${days === 1 ? "" : "s"} ${remainderHours} hour${remainderHours === 1 ? "" : "s"} remaining`;
}

export default function DemoWorkspace() {
  const { signOut } = useAuth();
  const { trialEndsAt } = useSaaS();
  const environment = getEnvironment();

  const [data, setData] = useState(load);
  const [message, setMessage] = useState(
    "Demo business data is temporary and never saved to Supabase.",
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  function save(next) {
    setData(next);
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(next));
  }

  function sell(product) {
    if (product.stock <= 0) return;

    save({
      ...data,
      products:data.products.map((item) =>
        item.id === product.id ? {...item,stock:item.stock - 1} : item
      ),
      sales:[
        {id:`DEMO-${Date.now()}`,at:"Just now",total:product.price},
        ...data.sales,
      ],
    });

    setMessage(`${product.name} sold in demo memory only.`);
  }

  function receive(product) {
    save({
      ...data,
      products:data.products.map((item) =>
        item.id === product.id ? {...item,stock:item.stock + 12} : item
      ),
    });

    setMessage(`Received 1 demo case (+12) of ${product.name}.`);
  }

  function reset() {
    clearDemoWorkspace();
    setData(fresh());
    setMessage("Demo workspace restored to original seed data.");
  }

  const revenue = useMemo(
    () => data.sales.reduce((sum,item) => sum + Number(item.total || 0), 0),
    [data.sales],
  );

  const units = useMemo(
    () => data.products.reduce((sum,item) => sum + Number(item.stock || 0), 0),
    [data.products],
  );

  return (
    <div style={{padding:24,maxWidth:1200,margin:"0 auto"}}>
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        gap:16,
        flexWrap:"wrap",
        alignItems:"center",
      }}>
        <div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
            <span style={{
              border:"1px solid #3f3f46",
              borderRadius:999,
              padding:"4px 8px",
              fontSize:11,
              fontWeight:900,
            }}>
              {environment.label}
            </span>
            <span style={{
              border:"1px solid rgba(56,189,248,.42)",
              borderRadius:999,
              padding:"4px 8px",
              fontSize:11,
              fontWeight:900,
              color:"#bae6fd",
            }}>
              DISPOSABLE DEMO
            </span>
          </div>

          <h1>WineShopPOS Demo Workspace</h1>
          <p>
            Browser-session-only business data · resets on logout/new browser session.
          </p>
          <p>
            <strong>Trial:</strong> {countdown(trialEndsAt, now)}
          </p>
          <p style={{fontSize:12,opacity:.72}}>
            Server-side trial end: {trialEndsAt ? new Date(trialEndsAt).toLocaleString() : "not started"}
          </p>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button className="secondary-button" onClick={reset}>
            Reset Demo
          </button>
          <button className="secondary-button" onClick={signOut}>
            Logout
          </button>
        </div>
      </div>

      <div className="purchase-message" style={{margin:"16px 0"}}>
        {message}
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
        gap:12,
        marginBottom:18,
      }}>
        <div className="auth-card">
          <strong>{data.products.length}</strong>
          <div>Products</div>
        </div>
        <div className="auth-card">
          <strong>{units}</strong>
          <div>Units in stock</div>
        </div>
        <div className="auth-card">
          <strong>{data.sales.length}</strong>
          <div>Demo sales</div>
        </div>
        <div className="auth-card">
          <strong>₹{revenue.toLocaleString("en-IN")}</strong>
          <div>Demo revenue</div>
        </div>
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.products.map((product) => (
              <tr key={product.id} style={{borderTop:"1px solid rgba(148,163,184,.25)"}}>
                <td style={{padding:10}}>{product.barcode}</td>
                <td style={{padding:10}}>{product.name}</td>
                <td style={{padding:10}}>{product.category}</td>
                <td style={{padding:10}}>₹{product.price}</td>
                <td style={{padding:10}}>{product.stock}</td>
                <td style={{padding:10}}>
                  <button className="primary-button" onClick={() => sell(product)}>
                    Demo Sale
                  </button>{" "}
                  <button className="secondary-button" onClick={() => receive(product)}>
                    +1 Case
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
