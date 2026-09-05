import { useEffect, useRef, useState } from "react";
import { CircleHelp, LogOut, Settings, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./ui/UserAvatar";
import StatusBadge from "./ui/StatusBadge";
import { APP_VERSION } from "../config/featureCatalog";

export default function UserMenu() {
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const click = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  function go(path) { setOpen(false); navigate(path); }

  return <div className="user-menu" ref={ref}>
    <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <UserAvatar profile={profile}/><div className="user-menu-trigger-text"><strong>{profile?.full_name || "User"}</strong><span>{profile?.role || ""}</span></div>
    </button>
    {open ? <div className="user-menu-popover">
      <div className="user-menu-summary"><UserAvatar profile={profile} size="lg"/><div><strong>{profile?.full_name || "User"}</strong><span>{profile?.email || user?.email || ""}</span><div className="summary-badges"><StatusBadge status={profile?.role}/></div></div></div>
      <div className="user-menu-shop"><strong>{profile?.shop_name || "Shop"}</strong><span>{profile?.organization_name || "Organization"}</span></div>
      <button onClick={() => go("/account")}><UserRound size={16}/> My Profile</button>
      <button onClick={() => go("/account?tab=settings")}><Settings size={16}/> Account Settings</button>
      <button onClick={() => go("/account?tab=security")}><Shield size={16}/> Security</button>
      <button onClick={() => go("/account?tab=about")}><CircleHelp size={16}/> About <small>{APP_VERSION}</small></button>
      <div className="user-menu-divider"/>
      <button className="logout-menu-button" onClick={signOut}><LogOut size={16}/> Logout</button>
    </div> : null}
  </div>;
}
