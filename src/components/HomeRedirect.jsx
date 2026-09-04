import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { profile } = useAuth();

  // Owner Center is ADMIN-only. Sending MANAGER to /owner creates a
  // RequireRole -> / -> HomeRedirect redirect loop. POS is the first shared
  // operational module for MANAGER and CASHIER.
  const home = profile?.role === "ADMIN" ? "/owner" : "/pos";
  return <Navigate to={home} replace />;
}
