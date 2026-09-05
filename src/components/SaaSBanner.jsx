import { Link } from "react-router-dom";
import { useSaaS } from "../context/SaaSContext";
function remaining(iso){if(!iso)return"";const ms=new Date(iso).getTime()-Date.now();if(!Number.isFinite(ms))return"";if(ms<=0)return"expired";const h=Math.ceil(ms/3600000);return h<48?`${h} hour${h===1?"":"s"} left`:`${Math.ceil(h/24)} days left`}
export default function SaaSBanner(){
  const s=useSaaS();const expiry=remaining(s.expiresAt||s.trialEndsAt);const update=s.latestVersion&&s.latestVersion!==s.appVersion;
  if(!s.announcementMessage&&!update&&!s.isDemo&&!s.isPlatformAdmin)return null;
  return <div style={{margin:"10px 16px 0",border:"1px solid rgba(148,163,184,.35)",borderRadius:12,padding:"10px 14px",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
    {s.isDemo?<strong>DEMO · 2-day trial {expiry?`· ${expiry}`:""}</strong>:null}
    {s.announcementMessage?<span><strong>{s.announcementSeverity}:</strong> {s.announcementMessage}</span>:null}
    {update?<span><strong>New version {s.latestVersion}</strong> {s.updateMessage}</span>:null}
    {s.isPlatformAdmin?<Link to="/platform-admin" style={{marginLeft:"auto"}}>Platform Control</Link>:null}
  </div>
}
