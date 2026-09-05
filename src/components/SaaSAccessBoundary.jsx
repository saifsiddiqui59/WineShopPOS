import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSaaS } from "../context/SaaSContext";
import { getEnvironment } from "../config/environment";

function when(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Not available";
}

export default function SaaSAccessBoundary() {
  const location = useLocation();
  const { signOut } = useAuth();
  const saas = useSaaS();
  const environment = getEnvironment();

  if (saas.loading) {
    return (
      <div className="auth-screen">
        <div className="auth-card">Checking subscription...</div>
      </div>
    );
  }

  if (saas.error) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>Subscription verification unavailable</h2>
          <p>WineShopPOS could not verify this account.</p>
          <p style={{opacity:.7}}>{saas.error}</p>
          <div className="button-row">
            <button className="primary-button" onClick={() => saas.refresh()}>
              Retry
            </button>
            <button className="secondary-button" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!saas.allowed) {
    const demo = saas.isDemo;

    return (
      <div style={{
        minHeight:"100vh",
        background:"radial-gradient(circle at top, #2b0b0b 0%, #090909 52%, #000 100%)",
        color:"#fff",
        display:"grid",
        placeItems:"center",
        padding:24,
      }}>
        <section style={{
          width:"min(700px,96vw)",
          background:"rgba(10,10,11,.97)",
          border:"1px solid rgba(248,113,113,.52)",
          borderRadius:20,
          padding:30,
          boxShadow:"0 30px 90px rgba(0,0,0,.65)",
        }}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            <span style={{
              border:"1px solid #3f3f46",
              borderRadius:999,
              padding:"4px 8px",
              fontSize:11,
              fontWeight:900,
            }}>
              {environment.label}
            </span>
            {demo ? (
              <span style={{
                border:"1px solid rgba(56,189,248,.42)",
                borderRadius:999,
                padding:"4px 8px",
                fontSize:11,
                fontWeight:900,
                color:"#bae6fd",
              }}>
                DEMO
              </span>
            ) : null}
          </div>

          <div style={{
            fontSize:12,
            fontWeight:900,
            letterSpacing:".14em",
            color:"#fca5a5",
          }}>
            ACCESS RESTRICTED
          </div>

          <h1 style={{fontSize:32,margin:"8px 0 10px"}}>
            {demo ? "Demo trial expired" : "WineShopPOS subscription inactive"}
          </h1>

          <p style={{fontSize:17,lineHeight:1.55,color:"#e5e7eb"}}>
            {demo
              ? "The demo trial period has ended. Clearing browser data or starting a new browser session does not restart the server-side trial."
              : "This shop cannot enter WineShopPOS because the subscription service currently reports that access is not allowed."}
          </p>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
            gap:10,
            margin:"20px 0",
          }}>
            <div style={{border:"1px solid #27272a",borderRadius:12,padding:12}}>
              <div style={{fontSize:11,color:"#94a3b8"}}>PLAN</div>
              <strong>{saas.planCode}</strong>
            </div>

            <div style={{border:"1px solid #27272a",borderRadius:12,padding:12}}>
              <div style={{fontSize:11,color:"#94a3b8"}}>STATUS</div>
              <strong>{saas.subscriptionStatus}</strong>
            </div>

            <div style={{border:"1px solid #27272a",borderRadius:12,padding:12}}>
              <div style={{fontSize:11,color:"#94a3b8"}}>
                {demo ? "TRIAL END" : "EXPIRY"}
              </div>
              <strong>{when(demo ? saas.trialEndsAt : saas.expiresAt)}</strong>
            </div>
          </div>

          <p style={{color:"#cbd5e1"}}>
            {demo
              ? "Please ask the WineShopPOS provider if you need another demo or a live shop account."
              : "Please ask the shop owner to contact the WineShopPOS provider for renewal or reactivation."}
          </p>

          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>
            <button className="primary-button" onClick={() => saas.refresh()}>
              Check Again
            </button>
            <button className="secondary-button" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (saas.isDemo && location.pathname !== "/demo") {
    return <Navigate to="/demo" replace />;
  }

  if (!saas.isDemo && location.pathname === "/demo") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
