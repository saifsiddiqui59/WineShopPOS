import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function inspectSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted && data?.session) setReady(true);
    }

    void inspectSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setBusy(false);
      setMessage(error.message || "Unable to update password.");
      return;
    }

    setSuccess(true);
    setMessage("Password updated successfully. Returning to login...");
    await supabase.auth.signOut();
    setBusy(false);

    window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>Reset Password</h1>
        <p>Choose a new password for your WineShop POS account.</p>

        {!ready && !success && (
          <div className="purchase-message error">
            Recovery session not found. The link may be expired or already used.
            Request a new reset email from the login page.
          </div>
        )}

        <label>
          New Password
          <input
            type="password"
            required
            minLength="8"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!ready || busy || success}
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            required
            minLength="8"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={!ready || busy || success}
          />
        </label>

        {message && (
          <div className={`purchase-message ${success ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <button className="primary-button" disabled={!ready || busy || success}>
          {busy ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
