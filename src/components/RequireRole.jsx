import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ roles }) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
