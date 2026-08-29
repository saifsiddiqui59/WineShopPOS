import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  ScanBarcode,
  Settings,
  ShoppingBag,
  Truck,
  UsersRound,
  Warehouse,
  Wine,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "POS Billing", icon: ScanBarcode },
  { path: "/products", label: "Products", icon: Package },
  { path: "/inventory", label: "Inventory", icon: Warehouse },
  { path: "/purchases", label: "Purchases", icon: Truck },
  { path: "/sales", label: "Sales", icon: ReceiptText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/users", label: "Users", icon: UsersRound, adminOnly: true },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Wine size={25} /></div>
          <div>
            <div className="brand-name">WineShop POS</div>
            <div className="brand-subtitle">{profile?.shop_name || "Retail Management"}</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation
            .filter((item) => !item.adminOnly || profile?.role === "ADMIN")
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        <div className="sidebar-footer">
          <ShoppingBag size={18} />
          <div>
            <strong>{profile?.full_name || "User"}</strong>
            <span>{profile?.role || ""}</span>
          </div>
          <button
            title="Sign out"
            onClick={signOut}
            style={{
              marginLeft: "auto",
              border: 0,
              background: "transparent",
              color: "white",
              padding: 4
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>Wine Shop Management</h1>
            <p>Barcode billing & inventory</p>
          </div>

          <div className="user-pill">
            <div className="avatar">
              {(profile?.full_name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{profile?.full_name || "User"}</strong>
              <span>{profile?.role || ""}</span>
            </div>
          </div>
        </header>

        <div className="page-area"><Outlet /></div>
      </main>
    </div>
  );
}
