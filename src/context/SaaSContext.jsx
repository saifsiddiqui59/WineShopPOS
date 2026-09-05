import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SaaSContext = createContext(null);
const one = (data) => Array.isArray(data) ? (data[0] || null) : data;

export function SaaSProvider({ children }) {
  const { user } = useAuth();
  const [state,setState]=useState(null);
  const [loading,setLoading]=useState(Boolean(user));
  const [error,setError]=useState("");

  const refresh=useCallback(async()=>{
    if(!user){setState(null);setLoading(false);setError("");return null}
    setLoading(true);setError("");
    const {data,error:rpcError}=await supabase.rpc("my_saas_context");
    if(rpcError){setState(null);setError(rpcError.message||"Unable to verify subscription.");setLoading(false);return null}
    const next=one(data);setState(next);setLoading(false);return next;
  },[user]);

  useEffect(()=>{void refresh()},[refresh]);

  const value=useMemo(()=>({
    loading,error,refresh,
    allowed:state?.allowed===true,
    reason:state?.reason||"",
    mode:state?.mode||"LIVE",
    isDemo:state?.mode==="DEMO",
    planCode:state?.plan_code||"LEGACY",
    subscriptionStatus:state?.subscription_status||"ACTIVE",
    trialEndsAt:state?.trial_ends_at||null,
    expiresAt:state?.expires_at||null,
    isPlatformAdmin:state?.is_platform_admin===true,
    appVersion:state?.app_version||"V4",
    latestVersion:state?.latest_version||"V4",
    minimumSupportedVersion:state?.minimum_supported_version||"V4",
    forceUpdate:state?.force_update===true,
    updateMessage:state?.update_message||"",
    announcementMessage:state?.announcement_message||"",
    announcementSeverity:state?.announcement_severity||"INFO",
  }),[state,loading,error,refresh]);

  return <SaaSContext.Provider value={value}>{children}</SaaSContext.Provider>;
}

export function useSaaS(){const v=useContext(SaaSContext);if(!v)throw new Error("useSaaS must be inside SaaSProvider");return v}
