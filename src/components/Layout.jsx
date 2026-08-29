import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScanBarcode,
  Settings,
  ShoppingBag,
  Truck,
  Warehouse,
  Wine,
} from "lucide-react";

const navigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/pos",
    label: "POS Billing",
    icon: ScanBarcode,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    path: "/purchases",
    label: "Purchases",
    icon: Truck,
  },
  {
    path: "/sales",
    label: "Sales",
    icon: ReceiptText,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wine size={25} />
          </div>

          <div>
            <div className="brand-name">WineShop POS</div>
            <div className="brand-subtitle">Retail Management</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.map((item) => {
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
            <strong>Demo Store</strong>
            <span>Local prototype</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>Wine Shop Management</h1>
            <p>Barcode billing & inventory</p>
          </div>

          <div className="user-pill">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="page-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
