import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSaaS } from "../context/SaaSContext";

export default function SaaSAccessBoundary(){
  const location=useLocation();
  const {signOut}=useAuth();
  const saas=useSaaS();

  if(saas.loading)return <div className="auth-screen"><div className="auth-card">Checking subscription...</div></div>;
  if(saas.error)return <div className="auth-screen"><div className="auth-card"><h2>Subscription Check Unavailable</h2><p>{saas.error}</p><div className="button-row"><button className="primary-button" onClick={saas.refresh}>Retry</button><button className="secondary-button" onClick={signOut}>Sign Out</button></div></div></div>;
  if(!saas.allowed)return <div className="auth-screen"><div className="auth-card"><h2>{saas.isDemo?"Demo Trial Expired":"Subscription Expired"}</h2><p>Plan: <strong>{saas.planCode}</strong></p><p>Status: <strong>{saas.subscriptionStatus}</strong></p><p>Contact the software provider to renew or extend access.</p><button className="secondary-button" onClick={signOut}>Sign Out</button></div></div>;
  if(saas.isDemo&&location.pathname!=="/demo")return <Navigate to="/demo" replace/>;
  if(!saas.isDemo&&location.pathname==="/demo")return <Navigate to="/" replace/>;
  return <Outlet/>;
}
