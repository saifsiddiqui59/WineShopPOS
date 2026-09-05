import { Navigate, Outlet } from "react-router-dom";
import { useSaaS } from "../context/SaaSContext";
export default function RequirePlatformAdmin(){const{loading,isPlatformAdmin}=useSaaS();if(loading)return <div className="auth-screen"><div className="auth-card">Checking platform access...</div></div>;return isPlatformAdmin?<Outlet/>:<Navigate to="/" replace/>}
