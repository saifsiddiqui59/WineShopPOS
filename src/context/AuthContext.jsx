import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const CACHE_KEY = "wineshop_auth_cache_v3";
const JWT_TIMING_RETRY_MS = [350, 900, 1800];

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
}

function readCacheForUser(userId) {
  const cached = readCache();
  return cached?.userId === userId ? cached : null;
}

function writeCache(userId, profile, access) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ userId, profile, access, cachedAt: new Date().toISOString() }),
    );
  } catch {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isJwtIssuedAtFuture(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  return code === "PGRST303" || message.includes("jwt issued at future");
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlineAuth, setOfflineAuth] = useState(false);
  const [authError, setAuthError] = useState("");

  const authSequence = useRef(0);
  const mounted = useRef(true);

  async function loadAuthorizationPair() {
    return Promise.all([
      supabase.rpc("my_profile"),
      supabase.rpc("my_shop_access"),
    ]);
  }

  async function verifySession(nextSession, sequence) {
    if (!nextSession?.user || sequence !== authSequence.current || !mounted.current) return;

    const userId = nextSession.user.id;

    try {
      let profileResult;
      let accessResult;

      for (let attempt = 0; attempt <= JWT_TIMING_RETRY_MS.length; attempt += 1) {
        [profileResult, accessResult] = await loadAuthorizationPair();

        if (sequence !== authSequence.current || !mounted.current) return;

        const timingFailure =
          isJwtIssuedAtFuture(profileResult.error) ||
          isJwtIssuedAtFuture(accessResult.error);

        if (!timingFailure) break;

        if (attempt >= JWT_TIMING_RETRY_MS.length) break;

        const delayMs = JWT_TIMING_RETRY_MS[attempt];
        console.warn(
          `Transient Supabase JWT timing rejection during account verification; retrying in ${delayMs}ms.`,
        );
        await sleep(delayMs);
      }

      if (profileResult.error) throw profileResult.error;
      if (accessResult.error) throw accessResult.error;

      const nextProfile = profileResult.data?.[0] ?? null;
      const nextAccess = accessResult.data?.[0] ?? null;

      if (!nextProfile) throw new Error("ACCOUNT_PROFILE_NOT_AVAILABLE");
      if (!nextAccess) throw new Error("SHOP_ACCESS_NOT_AVAILABLE");

      setProfile(nextProfile);
      setAccess(nextAccess);
      setOfflineAuth(false);
      setAuthError("");
      writeCache(userId, nextProfile, nextAccess);
    } catch (error) {
      if (sequence !== authSequence.current || !mounted.current) return;

      const fallback = readCacheForUser(userId);
      if (!navigator.onLine && fallback?.profile && fallback?.access) {
        setProfile(fallback.profile);
        setAccess(fallback.access);
        setOfflineAuth(true);
        setAuthError("");
      } else {
        console.error(error);
        setProfile(null);
        setAccess(null);
        setOfflineAuth(false);
        setAuthError(error?.message || "Unable to verify account access.");
      }
    } finally {
      if (sequence === authSequence.current && mounted.current) setLoading(false);
    }
  }

  function acceptAuthState(nextSession) {
    const sequence = ++authSequence.current;
    setAuthError("");

    if (!nextSession?.user) {
      setSession(null);
      setProfile(null);
      setAccess(null);
      setOfflineAuth(false);
      setLoading(false);
      return;
    }

    setSession(nextSession);
    setProfile(null);
    setAccess(null);
    setOfflineAuth(false);
    setLoading(true);

    setTimeout(() => {
      if (mounted.current && sequence === authSequence.current) {
        void verifySession(nextSession, sequence);
      }
    }, 0);
  }

  async function refreshAccess() {
    if (!session?.user) return;
    const sequence = ++authSequence.current;
    setProfile(null);
    setAccess(null);
    setAuthError("");
    setLoading(true);
    await verifySession(session, sequence);
  }

  useEffect(() => {
    mounted.current = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        window.location.hash = "#/update-password";
      }
      acceptAuthState(nextSession);
    });

    return () => {
      mounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    setAuthError("");
    setLoading(true);

    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setLoading(false);
      setAuthError(result.error.message || "Unable to sign in.");
    }

    return result;
  }

  async function signOut() {
    localStorage.removeItem(CACHE_KEY);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      access,
      loading,
      offlineAuth,
      authError,
      signIn,
      signOut,
      refreshAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
