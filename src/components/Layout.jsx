import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Wine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import OfflineStatus from "./OfflineStatus";
import ShopSelector from "./ShopSelector";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { watchThemePreference } from "../lib/theme";
import { MAIN_MODULES } from "../config/navigation";

const COLLAPSE_KEY = "wineshop_sidebar_collapsed_v1";

function pageMeta(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { title: "WineShopPOS", crumbs: [] };
  const labels = {
    pos: "POS & Billing", products: "Products", purchasing: "Purchases & Suppliers",
    inventory: "Inventory", operations: "Operations", owner: "Owner Center",
    reports: "Reports & Compliance", admin: "Settings & Admin", account: "My Account",
    sales: "Sales", returns: "Returns & Voids", shifts: "Shift & Day Close", scanner: "Scanner",
    labels: "Barcode Labels", receive: "Receive Stock", procurement: "Procurement", intelligence: "Intelligence",
    count: "Stock Count", transfers: "Transfers", expenses: "Expenses", approvals: "Approvals",
    customers: "Customer & Credit", offline: "Offline Queue", profit: "Profit Intelligence",
    exceptions: "Loss & Exceptions", recommendations: "Recommendations", share: "WhatsApp Summary",
    compliance: "Liquor Compliance", users: "Users", access: "Access Control", hardware: "Hardware", backup: "Backup & Recovery",
    settings: "Settings", printer: "Printer", help: "Help & Manual",
  };
  const crumbs = parts.map((part) => labels[part] || part.replaceAll("-", " "));
  return { title: crumbs.at(-1), crumbs };
}

export default function Layout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
  const meta = useMemo(() => pageMeta(location.pathname), [location.pathname]);

  useEffect(() => localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"), [collapsed]);
  useEffect(() => watchThemePreference(() => profile?.theme || "SYSTEM"), [profile?.theme]);

  return <div className={collapsed ? "app-shell sidebar-collapsed" : "app-shell"}>
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Wine size={24}/></div>
        {!collapsed ? <div><div className="brand-name">WineShop POS</div><div className="brand-subtitle">Retail Management</div></div> : null}
      </div>
      <nav className="nav-menu" aria-label="Main navigation">
        {MAIN_MODULES.filter((item) => item.roles.includes(profile?.role)).map((item) => {
          const Icon = item.icon;
          return <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} title={collapsed ? item.label : undefined}>
            <Icon size={19}/>{!collapsed ? <span>{item.label}</span> : null}
          </NavLink>;
        })}
      </nav>
      <button className="sidebar-collapse" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeftOpen size={18}/> : <><PanelLeftClose size={18}/><span>Collapse</span></>}
      </button>
    </aside>

    <main className="main-area">
      <header className="topbar consolidated-topbar">
        <div className="topbar-page-context">
          <button className="mobile-sidebar-toggle" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle navigation"><PanelLeftOpen size={19}/></button>
          <div><h1>{meta.title}</h1><div className="breadcrumbs">{meta.crumbs.map((crumb, index) => <span key={`${crumb}-${index}`}>{index ? <ChevronRight size={13}/> : null}{crumb}</span>)}</div></div>
        </div>
        <div className="topbar-actions"><ShopSelector/><OfflineStatus/><ThemeToggle/><UserMenu/></div>
      </header>
      <div className="page-area"><Outlet/></div>
    </main>
  </div>;
}
