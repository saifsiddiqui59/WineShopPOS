import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <h1>WineShop POS</h1>
        <p>Sign in to your shop</p>

        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {message && <div className="purchase-message error">{message}</div>}

        <button className="primary-button" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </button>

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
      </form>
    </div>
  );
}
