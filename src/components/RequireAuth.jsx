import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { user, profile, access, loading, signOut } = useAuth();

  if (loading) {
    return <div className="auth-screen"><div className="auth-card">Loading...</div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.active) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>Account Disabled</h2>
          <p>Your user account is inactive. Contact your shop administrator.</p>
          <button className="primary-button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
    );
  }

  if (!access?.allowed) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>Shop Access Suspended</h2>
          <p>Subscription is inactive or shop access has been disabled.</p>
          <p>Please contact the software provider.</p>
          <button className="primary-button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
