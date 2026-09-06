import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SaaSContext = createContext(null);
const POLL_MS = 60_000;

function one(data) {
  return Array.isArray(data) ? (data[0] || null) : data;
}

export function SaaSProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const inFlightRef = useRef(false);
  const goodStateRef = useRef(false);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setState(null);
      setLoading(false);
      setError("");
      setLastCheckedAt(null);
      goodStateRef.current = false;
      return null;
    }

    if (inFlightRef.current) return null;
    inFlightRef.current = true;

    if (!silent || !goodStateRef.current) setLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("my_saas_context");

      if (rpcError) {
        if (!goodStateRef.current) {
          setState(null);
          setError(rpcError.message || "Unable to verify subscription.");
        } else {
          console.warn("Background subscription refresh failed:", rpcError.message);
        }
        return null;
      }

      const next = one(data);
      setState(next);
      setError("");
      setLastCheckedAt(new Date().toISOString());
      goodStateRef.current = Boolean(next);
      return next;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setState(null);
    setError("");
    setLastCheckedAt(null);
    goodStateRef.current = false;

    if (user) {
      setLoading(true);
      void refresh();
    } else {
      setLoading(false);
    }
  }, [user?.id, refresh]);

  useEffect(() => {
    if (!user) return undefined;

    const intervalId = window.setInterval(() => {
      void refresh({ silent:true });
    }, POLL_MS);

    const onFocus = () => void refresh({ silent:true });
    const onOnline = () => void refresh({ silent:true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent:true });
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user?.id, refresh]);

  const value = useMemo(() => ({
    loading,
    error,
    refresh,
    lastCheckedAt,
    allowed: state?.allowed === true,
    reason: state?.reason || "",
    mode: state?.mode || "LIVE",
    isDemo: state?.mode === "DEMO",
    planCode: state?.plan_code || "LEGACY",
    subscriptionStatus: state?.subscription_status || "ACTIVE",
    trialEndsAt: state?.trial_ends_at || null,
    expiresAt: state?.expires_at || null,
    isPlatformAdmin: state?.is_platform_admin === true,
    appVersion: state?.app_version || "V4",
    latestVersion: state?.latest_version || "V4",
    minimumSupportedVersion: state?.minimum_supported_version || "V4",
    forceUpdate: state?.force_update === true,
    updateMessage: state?.update_message || "",
    announcementMessage: state?.announcement_message || "",
    announcementSeverity: state?.announcement_severity || "INFO",
  }), [state, loading, error, refresh, lastCheckedAt]);

  return (
    <SaaSContext.Provider value={value}>
      {children}
    </SaaSContext.Provider>
  );
}

export function useSaaS() {
  const value = useContext(SaaSContext);
  if (!value) throw new Error("useSaaS must be inside SaaSProvider");
  return value;
}
