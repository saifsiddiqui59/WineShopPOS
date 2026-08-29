import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const CACHE_KEY = "wineshop_auth_cache_v2";

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
}

function writeCache(profile, access) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ profile, access, cachedAt: new Date().toISOString() })); } catch {}
}

export function AuthProvider({ children }) {
  const cached = readCache();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(cached?.profile || null);
  const [access, setAccess] = useState(cached?.access || null);
  const [loading, setLoading] = useState(true);
  const [offlineAuth, setOfflineAuth] = useState(false);

  async function loadUserState(nextSession) {
    if (!nextSession?.user) {
      setSession(null); setProfile(null); setAccess(null); setOfflineAuth(false); setLoading(false);
      return;
    }
    setSession(nextSession);
    try {
      const [profileResult, accessResult] = await Promise.all([
        supabase.rpc("my_profile"),
        supabase.rpc("my_shop_access"),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (accessResult.error) throw accessResult.error;
      const nextProfile = profileResult.data?.[0] ?? null;
      const nextAccess = accessResult.data?.[0] ?? null;
      setProfile(nextProfile); setAccess(nextAccess); setOfflineAuth(false);
      if (nextProfile && nextAccess) writeCache(nextProfile, nextAccess);
    } catch (error) {
      const fallback = readCache();
      if (!navigator.onLine && fallback?.profile && fallback?.access) {
        setProfile(fallback.profile); setAccess(fallback.access); setOfflineAuth(true);
      } else {
        console.error(error); setProfile(null); setAccess(null); setOfflineAuth(false);
      }
    } finally { setLoading(false); }
  }

  async function refreshAccess() {
    if (!session) return;
    setLoading(true); await loadUserState(session);
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) loadUserState(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => loadUserState(nextSession));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signIn(email, password) { return supabase.auth.signInWithPassword({ email, password }); }
  async function signOut() { localStorage.removeItem(CACHE_KEY); await supabase.auth.signOut(); }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, access, loading, offlineAuth, signIn, signOut, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
