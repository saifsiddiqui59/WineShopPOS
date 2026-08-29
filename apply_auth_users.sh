#!/usr/bin/env bash
set -euo pipefail

cd /e/WineShopPOS

echo "=== WineShopPOS Auth + Roles + Shop User Management ==="

npm install @supabase/supabase-js

mkdir -p src/lib src/context src/components src/pages
mkdir -p supabase/functions/manage-shop-users
mkdir -p docs/chapters

# Local Vite configuration. anon/public key is allowed in browser.
cat > .env.local <<'EOF'
VITE_SUPABASE_URL=https://uiurgplnsgmawvxhjzzp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InVpdXJncGxuc2dtYXd2eGhqenpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTAwNDMsImV4cCI6MjEwMzU4NjA0M30.U3MYjD0zG_gnd2cBUinykobCG56_t0ZcjUM-TvwTQSY
EOF

cat > .env.example <<'EOF'
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
EOF

grep -qxF ".env.local" .gitignore || echo ".env.local" >> .gitignore

cat > src/lib/supabase.js <<'EOF'
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing Supabase VITE environment variables.");
}

export const supabase = createClient(url, anonKey);
EOF

cat > src/context/AuthContext.jsx <<'EOF'
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
EOF

cat > src/components/RequireAuth.jsx <<'EOF'
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { user, profile, access, loading, signOut } = useAuth();

  if (loading) {
    return <div className="auth-screen"><div className="auth-card">Loading...</div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.active) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>Account Disabled</h2>
          <p>Your user account is inactive. Contact your shop administrator.</p>
          <button className="primary-button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
    );
  }

  if (!access?.allowed) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>Shop Access Suspended</h2>
          <p>Subscription is inactive or shop access has been disabled.</p>
          <p>Please contact the software provider.</p>
          <button className="primary-button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
EOF

cat > src/pages/Login.jsx <<'EOF'
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const { error } = await signIn(email.trim(), password);

    if (error) setMessage(error.message);
    setBusy(false);
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>WineShop POS</h1>
        <p>Sign in to your shop</p>

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {message && <div className="purchase-message error">{message}</div>}

        <button className="primary-button" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
EOF

cat > src/pages/Users.jsx <<'EOF'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CASHIER",
  });

  const isAdmin = profile?.role === "ADMIN";

  async function callFunction(body) {
    const { data, error } = await supabase.functions.invoke(
      "manage-shop-users",
      { body }
    );

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || "Operation failed");
    return data;
  }

  async function loadUsers() {
    if (!isAdmin) return;

    try {
      const data = await callFunction({ action: "list" });
      setUsers(data.users || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [isAdmin]);

  async function createUser(event) {
    event.preventDefault();
    setMessage("");

    try {
      await callFunction({
        action: "create",
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "CASHIER",
      });

      setMessage("User created successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function setActive(userId, active) {
    try {
      await callFunction({ action: "set_active", userId, active });
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="panel">
        <h2>Users</h2>
        <p>Only the shop ADMIN can manage users.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Users & Roles</h2>
          <p>Shop Admin can create Manager and Cashier accounts.</p>
        </div>
      </div>

      {message && <div className="purchase-message success">{message}</div>}

      <div className="settings-grid">
        <form className="panel" onSubmit={createUser}>
          <h3>Create Shop User</h3>

          <div className="settings-fields">
            <label>
              Full Name
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Temporary Password
              <input
                type="password"
                required
                minLength="8"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="CASHIER">Cashier</option>
                <option value="MANAGER">Manager</option>
              </select>
            </label>
          </div>

          <br />
          <button className="primary-button">Create User</button>
        </form>

        <section className="panel">
          <h3>Role Liberty</h3>
          <p><strong>ADMIN:</strong> users, products, purchases, inventory, reports, POS.</p>
          <p><strong>MANAGER:</strong> products, purchases, inventory adjustments, reports, POS.</p>
          <p><strong>CASHIER:</strong> POS and permitted sales views only.</p>
          <p><strong>PLATFORM OWNER:</strong> not a shop role. Controls shop ADMIN + subscription kill switch.</p>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h3>Shop Users</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.full_name}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.role}</td>
                  <td>{item.active ? "ACTIVE" : "INACTIVE"}</td>
                  <td>
                    {item.role === "ADMIN" ? (
                      <span>Platform controlled</span>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() => setActive(item.id, !item.active)}
                      >
                        {item.active ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
EOF

# Secure Supabase Edge Function.
cat > supabase/functions/manage-shop-users/index.ts <<'EOF'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) throw new Error("Missing authorization");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const admin = createClient(url, serviceKey);

    const {
      data: { user },
      error: userError,
    } = await caller.auth.getUser();

    if (userError || !user) throw new Error("Invalid session");

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("id,shop_id,role,active")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile) throw new Error("Profile not found");
    if (!callerProfile.active) throw new Error("Account disabled");
    if (callerProfile.role !== "ADMIN") throw new Error("Admin role required");

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id,access_enabled,subscription_status,subscription_end_date,max_users")
      .eq("id", callerProfile.shop_id)
      .single();

    if (shopError || !shop) throw new Error("Shop not found");

    const today = new Date().toISOString().slice(0, 10);
    const allowed =
      shop.access_enabled === true &&
      ["TRIAL", "ACTIVE"].includes(shop.subscription_status) &&
      (!shop.subscription_end_date || shop.subscription_end_date >= today);

    if (!allowed) throw new Error("SHOP_ACCESS_DISABLED");

    const body = await req.json();
    const action = body.action;

    if (action === "list") {
      const { data, error } = await admin
        .from("profiles")
        .select("id,full_name,email,role,active,created_at")
        .eq("shop_id", callerProfile.shop_id)
        .order("created_at");

      if (error) throw error;

      return Response.json({ ok: true, users: data }, { headers: corsHeaders });
    }

    if (action === "create") {
      const role = String(body.role || "").toUpperCase();

      // Shop ADMIN cannot create another ADMIN.
      if (!["MANAGER", "CASHIER"].includes(role)) {
        throw new Error("Shop Admin can create only MANAGER or CASHIER");
      }

      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!fullName || !email || password.length < 8) {
        throw new Error("Name, email and password (8+ chars) are required");
      }

      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", callerProfile.shop_id);

      if ((count ?? 0) >= shop.max_users) {
        throw new Error(`Shop user limit reached (${shop.max_users})`);
      }

      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

      if (createError) throw createError;

      const { error: insertError } = await admin.from("profiles").insert({
        id: created.user.id,
        shop_id: callerProfile.shop_id,
        full_name: fullName,
        email,
        role,
        active: true,
      });

      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw insertError;
      }

      return Response.json(
        { ok: true, userId: created.user.id },
        { headers: corsHeaders }
      );
    }

    if (action === "set_active") {
      const targetId = String(body.userId || "");
      const active = body.active === true;

      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id,shop_id,role")
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id)
        .single();

      if (targetError || !target) throw new Error("User not found");
      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");

      const { error } = await admin
        .from("profiles")
        .update({ active })
        .eq("id", targetId)
        .eq("shop_id", callerProfile.shop_id);

      if (error) throw error;

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 400, headers: corsHeaders }
    );
  }
});
EOF

# Rewrite Layout with role-aware Users menu + logout.
cat > src/components/Layout.jsx <<'EOF'
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
EOF

# Rewrite App routes with login/protection/users.
cat > src/App.jsx <<'EOF'
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import AddProduct from "./pages/AddProduct";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import SaleDetails from "./pages/SaleDetails";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />

          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />

          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />

          <Route path="sales" element={<Sales />} />
          <Route path="sales/:id" element={<SaleDetails />} />

          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
EOF

# Patch main.jsx to HashRouter + AuthProvider.
node <<'NODE'
const fs = require("fs");
const file = "src/main.jsx";
let text = fs.readFileSync(file, "utf8");

text = text.replaceAll("BrowserRouter", "HashRouter");

if (!text.includes('AuthProvider')) {
  text = text.replace(
    'import App from "./App";',
    'import App from "./App";\nimport { AuthProvider } from "./context/AuthContext";'
  );

  text = text.replace(
    "<ShopProvider>\n        <App />\n      </ShopProvider>",
    "<AuthProvider>\n        <ShopProvider>\n          <App />\n        </ShopProvider>\n      </AuthProvider>"
  );
}

fs.writeFileSync(file, text);
NODE

cat >> src/index.css <<'EOF'

/* Auth / subscription / user-management */
.auth-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f4f5f7;
}

.auth-card {
  width: min(420px, 100%);
  padding: 28px;
  display: grid;
  gap: 16px;
  border: 1px solid #e5e6e9;
  border-radius: 14px;
  background: #fff;
}

.auth-card h1,
.auth-card h2,
.auth-card p {
  margin: 0;
}

.auth-card label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.auth-card input,
.settings-fields select {
  width: 100%;
  height: 43px;
  padding: 0 11px;
  border: 1px solid #dcdde0;
  border-radius: 8px;
  background: #fff;
}
EOF

cat > docs/chapters/14-auth-multishop-users.md <<'EOF'
# Chapter 14 — Authentication, Multi-Shop Roles & User Management

## Hierarchy

PLATFORM OWNER / DEVELOPER
- creates/controls the first ADMIN for each shop
- controls subscription status / kill switch
- is stored separately in `platform_admins`
- is NOT a tenant/shop role

SHOP ADMIN
- manages its own shop
- can create MANAGER and CASHIER users
- cannot create another ADMIN
- can disable/re-enable Manager/Cashier users

MANAGER
- product/inventory/purchase/report/POS operational permissions

CASHIER
- POS-focused permissions

## Security

The browser never receives `service_role`.

`manage-shop-users` is a Supabase Edge Function.
It validates the logged-in caller is the shop ADMIN, then uses service-role only inside the server-side function.

## Kill Switch

`shops.access_enabled = false` blocks shop data/RPC access.

## OCR Purchase Roadmap

Recommended invoice-stock workflow:

Invoice image/PDF
-> Azure AI Document Intelligence prebuilt invoice model
-> supplier + invoice number + line items + quantity + unit price
-> match extracted items to Product Master
-> human review screen
-> user confirms
-> call `receive_purchase()`
-> inventory + stock movement updated transactionally

OCR must never directly change stock without user confirmation.
EOF

echo "Running production build..."
npm run build

git add   .env.example   .gitignore   src/lib   src/context/AuthContext.jsx   src/components/RequireAuth.jsx   src/components/Layout.jsx   src/pages/Login.jsx   src/pages/Users.jsx   src/App.jsx   src/main.jsx   src/index.css   supabase/functions/manage-shop-users/index.ts   docs/chapters/14-auth-multishop-users.md   apply_auth_users.sh

git commit -m "Chapter 14 - Supabase auth multi-shop roles and user management"
git push

echo
echo "============================================================"
echo "FRONTEND AUTH PATCH COMPLETE"
echo
echo "NEXT REQUIRED:"
echo "1. Run supabase_multi_shop_schema.sql in Supabase SQL Editor."
echo "2. Rotate the previously exposed service-role key."
echo "3. Deploy Edge Function using Supabase CLI:"
echo "   supabase login"
echo "   supabase link --project-ref uiurgplnsgmawvxhjzzp"
echo "   supabase functions deploy manage-shop-users"
echo "============================================================"
