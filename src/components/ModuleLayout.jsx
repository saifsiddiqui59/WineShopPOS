import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeatureTierBadge from "./ui/FeatureTierBadge";

export default function ModuleLayout({ title, subtitle, tabs = [] }) {
  const { profile } = useAuth();
  const visible = tabs.filter((tab) => tab.roles?.includes(profile?.role));
  return <div className="module-shell">
    <div className="module-heading"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    {visible.length > 1 ? <nav className="module-tabs" aria-label={`${title} navigation`}>
      {visible.map((tab) => <NavLink key={tab.path} to={tab.path} end={tab.end ?? true} className={({ isActive }) => isActive ? "module-tab active" : "module-tab"}>
        <span>{tab.label}</span><FeatureTierBadge tier={tab.tier}/>
      </NavLink>)}
    </nav> : null}
    <div className="module-content"><Outlet/></div>
  </div>;
}
