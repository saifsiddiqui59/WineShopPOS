import { useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEnvironment } from "../config/environment";
import { supabase } from "../lib/supabase";

const PUBLIC_DEMO_EMAIL =
  import.meta.env.VITE_DEMO_EMAIL || "admin@demowineshop.com";
const PUBLIC_DEMO_PASSWORD =
  import.meta.env.VITE_DEMO_PASSWORD || "1234";

export default function Login() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const environment = useMemo(() => getEnvironment(), [location.search, location.hash]);

  const demoMode =
    environment.demoEntry ||
    new URLSearchParams(location.search).get("mode") === "demo";

  const [email, setEmail] = useState(demoMode ? PUBLIC_DEMO_EMAIL : "");
  const [password, setPassword] = useState(demoMode ? PUBLIC_DEMO_PASSWORD : "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [busy, setBusy] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  if (user && !recoveryMode) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setMessageType("error");

    const { error } = await signIn(email.trim(), password);

    if (error) setMessage(error.message);
    setBusy(false);
  }

  async function sendRecovery(event) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessageType("error");
      setMessage("Enter your email address first.");
      return;
    }

    setBusy(true);
    setMessage("");
    setMessageType("error");

    const redirectTo = `${window.location.origin}/`;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    setBusy(false);

    if (error) {
      setMessage(error.message || "Unable to send password reset email.");
      return;
    }

    setMessageType("success");
    setMessage("Password reset email sent. Open the newest email and follow the link.");
  }

  if (recoveryMode) {
    return (
      <div className="auth-screen">
        <form className="auth-card" onSubmit={sendRecovery}>
          <h1>Forgot Password</h1>
          <p>Enter the email used for your WineShop POS account.</p>

          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          {message && (
            <div className={`purchase-message ${messageType}`}>
              {message}
            </div>
          )}

          <button className="primary-button" disabled={busy}>
            {busy ? "Sending..." : "Send Reset Email"}
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={() => {
              setRecoveryMode(false);
              setMessage("");
            }}
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <span style={{
            border:"1px solid rgba(148,163,184,.35)",
            borderRadius:999,
            padding:"4px 8px",
            fontSize:11,
            fontWeight:900,
            letterSpacing:".08em"
          }}>
            {environment.label}
          </span>
          {demoMode ? (
            <span style={{
              border:"1px solid rgba(56,189,248,.45)",
              borderRadius:999,
              padding:"4px 8px",
              fontSize:11,
              fontWeight:900,
              color:"#bae6fd"
            }}>
              DEMO LOGIN
            </span>
          ) : null}
        </div>

        <h1>WineShop POS</h1>
        <p>
          {demoMode
            ? "Try the disposable demo workspace. Business changes stay in this browser session only."
            : "Sign in to your shop"}
        </p>

        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {demoMode ? (
          <div style={{
            margin:"8px 0 12px",
            padding:"10px 12px",
            border:"1px solid rgba(56,189,248,.28)",
            borderRadius:10,
            fontSize:12,
            lineHeight:1.5,
            color:"#bae6fd"
          }}>
            Demo data resets after logout/new browser session. The server-side
            trial timer does not reset when browser data is cleared.
          </div>
        ) : null}

        {message && <div className={`purchase-message ${messageType}`}>{message}</div>}

        <button className="primary-button" disabled={busy}>
          {busy ? "Signing in..." : (demoMode ? "Enter Demo" : "Login")}
        </button>

        {!demoMode ? (
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={() => {
              setRecoveryMode(true);
              setMessage("");
            }}
          >
            Forgot Password?
          </button>
        ) : null}
      </form>
    </div>
  );
}
