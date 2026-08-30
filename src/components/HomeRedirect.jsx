import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function HomeRedirect() {
  const { profile } = useAuth();
  return <Navigate to={profile?.role === "CASHIER" ? "/pos" : "/owner"} replace/>;
}
