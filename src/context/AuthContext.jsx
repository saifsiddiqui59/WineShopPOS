import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUserState(nextSession) {
    if (!nextSession?.user) {
      setSession(null);
      setProfile(null);
      setAccess(null);
      setLoading(false);
      return;
    }

    setSession(nextSession);

    const [profileResult, accessResult] = await Promise.all([
      supabase.rpc("my_profile"),
      supabase.rpc("my_shop_access"),
    ]);

    if (profileResult.error) {
      console.error(profileResult.error);
      setProfile(null);
    } else {
      setProfile(profileResult.data?.[0] ?? null);
    }

    if (accessResult.error) {
      console.error(accessResult.error);
      setAccess(null);
    } else {
      setAccess(accessResult.data?.[0] ?? null);
    }

    setLoading(false);
  }

  async function refreshAccess() {
    if (!session) return;
    setLoading(true);
    await loadUserState(session);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) loadUserState(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => loadUserState(nextSession)
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        access,
        loading,
        signIn,
        signOut,
        refreshAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
