import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerificationProblem({ message, refreshAccess, signOut }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Unable to Verify Account</h2>
        <p>{message || "WineShopPOS could not load your account and shop access yet."}</p>
        <p>Retry access verification. This temporary state is not a disabled account.</p>
        <div className="button-row">
          <button className="primary-button" onClick={refreshAccess}>Retry</button>
          <button className="secondary-button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

export default function RequireAuth() {
  const { user, profile, access, loading, authError, refreshAccess, signOut } = useAuth();

  if (loading) {
    return <div className="auth-screen"><div className="auth-card">Loading account access...</div></div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (authError || !profile || !access) {
    return <VerificationProblem message={authError} refreshAccess={refreshAccess} signOut={signOut} />;
  }

  if (profile.active === false) {
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

  if (profile.active !== true) {
    return <VerificationProblem message="WineShopPOS could not confirm the account active flag." refreshAccess={refreshAccess} signOut={signOut} />;
  }

  if (access.allowed === false) {
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

  if (access.allowed !== true) {
    return <VerificationProblem message="WineShopPOS could not confirm shop access." refreshAccess={refreshAccess} signOut={signOut} />;
  }

  return <Outlet />;
}
