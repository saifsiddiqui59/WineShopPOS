#!/usr/bin/env bash
set -euo pipefail

cd /e/WineShopPOS

echo "============================================================"
echo "WineShopPOS FINALIZATION"
echo "Supabase live data + roles + build + Git + Azure Blob"
echo "============================================================"

mkdir -p src/context src/components src/pages src/lib docs/chapters docs/testing

# ------------------------------------------------------------
# 1. Ensure dependencies
# ------------------------------------------------------------
npm install @supabase/supabase-js

# ------------------------------------------------------------
# 2. Supabase live ShopContext
# ------------------------------------------------------------
cat > src/context/ShopContext.jsx <<'EOF'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

function moneyNumber(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(row) {
  return {
    id: row.id,
    barcode: row.barcode ?? "",
    sku: row.sku ?? "",
    name: row.product_name ?? "",
    brand: row.brand ?? "",
    category: row.categories?.name ?? "",
    categoryId: row.category_id ?? null,
    subcategory: row.subcategory ?? "",
    sizeMl: Number(row.size_ml ?? 0),
    size: `${Number(row.size_ml ?? 0)} ml`,
    alcoholPercentage:
      row.alcohol_percentage === null ? null : Number(row.alcohol_percentage),
    purchasePrice: moneyNumber(row.purchase_price),
    mrp: moneyNumber(row.mrp),
    price: moneyNumber(row.selling_price),
    minimumStock: Number(row.minimum_stock ?? 0),
    unitsPerCase: Number(row.units_per_case ?? 1),
    active: row.active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSale(row, productById) {
  const payment = row.payments?.[0] ?? null;

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    createdAt: row.created_at,
    cashierId: row.cashier_id,
    paymentMethod: payment?.payment_method ?? "",
    paymentReference: payment?.reference_number ?? "",
    subtotal: moneyNumber(row.subtotal),
    discount: moneyNumber(row.discount),
    grandTotal: moneyNumber(row.grand_total),
    status: row.status,
    items: (row.sale_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot,
      barcode: item.barcode_snapshot,
      quantity: Number(item.quantity ?? 0),
      unitPrice: moneyNumber(item.unit_price),
      purchasePrice: moneyNumber(productById[item.product_id]?.purchasePrice),
      lineTotal: moneyNumber(item.line_total),
    })),
  };
}

function normalizePurchase(row, productById) {
  const items = (row.purchase_items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: productById[item.product_id]?.name ?? "Product",
    barcode: productById[item.product_id]?.barcode ?? "",
    purchaseUnit: item.purchase_unit,
    caseCount: Number(item.case_count ?? 0),
    unitsPerCase: Number(item.units_per_case ?? 1),
    looseBottles: Number(item.loose_bottles ?? 0),
    quantity: Number(item.quantity ?? 0),
    purchasePrice: moneyNumber(item.purchase_price),
    lineTotal: moneyNumber(item.line_total),
  }));

  return {
    id: row.id,
    purchaseNumber: row.purchase_number,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name_snapshot ?? "Supplier",
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    createdAt: row.created_at,
    notes: row.notes ?? "",
    total: moneyNumber(row.total),
    totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
  };
}

export function ShopProvider({ children }) {
  const { user, profile, access } = useAuth();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const canUseShop = Boolean(user && profile?.active && access?.allowed);

  const refreshAll = useCallback(async () => {
    if (!canUseShop) {
      setProducts([]);
      setInventory({});
      setSales([]);
      setPurchases([]);
      setCategories([]);
      setSuppliers([]);
      return { ok: false, message: "Shop session is not active." };
    }

    setLoadingData(true);
    setDataError("");

    try {
      const [
        categoriesResult,
        suppliersResult,
        productsResult,
        inventoryResult,
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id,name,active")
          .order("name"),
        supabase
          .from("suppliers")
          .select("id,supplier_name,active")
          .order("supplier_name"),
        supabase
          .from("products")
          .select("*, categories(name)")
          .order("product_name"),
        supabase
          .from("inventory")
          .select("product_id,quantity,reserved_quantity"),
      ]);

      for (const result of [
        categoriesResult,
        suppliersResult,
        productsResult,
        inventoryResult,
      ]) {
        if (result.error) throw result.error;
      }

      const normalizedProducts = (productsResult.data ?? []).map(normalizeProduct);
      const productById = Object.fromEntries(
        normalizedProducts.map((product) => [product.id, product])
      );

      const stockMap = {};
      for (const row of inventoryResult.data ?? []) {
        stockMap[row.product_id] = Number(row.quantity ?? 0);
      }

      let salesQuery = supabase
        .from("sales")
        .select(`
          id, invoice_number, subtotal, discount, grand_total,
          payment_status, cashier_id, status, notes, created_at,
          sale_items(
            id, product_id, product_name_snapshot, barcode_snapshot,
            quantity, unit_price, discount, line_total
          ),
          payments(
            id, payment_method, amount, reference_number, created_at
          )
        `)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (profile?.role === "CASHIER") {
        salesQuery = salesQuery.eq("cashier_id", profile.user_id);
      }

      const [salesResult, purchasesResult] = await Promise.all([
        salesQuery,
        profile?.role === "CASHIER"
          ? Promise.resolve({ data: [], error: null })
          : supabase
              .from("purchases")
              .select(`
                id, purchase_number, supplier_id, supplier_name_snapshot,
                invoice_number, invoice_date, subtotal, tax, total,
                status, notes, created_at,
                purchase_items(
                  id, product_id, quantity, purchase_unit,
                  case_count, units_per_case, loose_bottles,
                  purchase_price, line_total
                )
              `)
              .order("created_at", { ascending: false })
              .limit(1000),
      ]);

      if (salesResult.error) throw salesResult.error;
      if (purchasesResult.error) throw purchasesResult.error;

      setCategories(categoriesResult.data ?? []);
      setSuppliers(suppliersResult.data ?? []);
      setProducts(normalizedProducts);
      setInventory(stockMap);
      setSales(
        (salesResult.data ?? []).map((row) => normalizeSale(row, productById))
      );
      setPurchases(
        (purchasesResult.data ?? []).map((row) =>
          normalizePurchase(row, productById)
        )
      );

      return { ok: true };
    } catch (error) {
      const message = error?.message || String(error);
      setDataError(message);
      return { ok: false, message };
    } finally {
      setLoadingData(false);
    }
  }, [canUseShop, profile?.role, profile?.user_id]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  function getStock(productId) {
    return Number(inventory[productId] ?? 0);
  }

  async function ensureCategory(name) {
    const categoryName = String(name ?? "").trim();
    if (!categoryName) return null;

    const existing = categories.find(
      (item) => item.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        shop_id: profile.shop_id,
        name: categoryName,
        active: true,
      })
      .select("id,name,active")
      .single();

    if (error) throw error;
    setCategories((current) => [...current, data].sort((a, b) =>
      a.name.localeCompare(b.name)
    ));
    return data.id;
  }

  function validateProduct(data, includeOpeningStock = false) {
    const value = {
      barcode: String(data.barcode ?? "").trim(),
      sku: String(data.sku ?? "").trim().toUpperCase(),
      name: String(data.name ?? "").trim(),
      brand: String(data.brand ?? "").trim(),
      category: String(data.category ?? "").trim(),
      subcategory: String(data.subcategory ?? "").trim(),
      sizeMl: Number(data.sizeMl),
      alcoholPercentage:
        data.alcoholPercentage === "" ||
        data.alcoholPercentage === null ||
        data.alcoholPercentage === undefined
          ? null
          : Number(data.alcoholPercentage),
      purchasePrice: Number(data.purchasePrice),
      mrp: Number(data.mrp),
      price: Number(data.price),
      minimumStock: Number(data.minimumStock),
      unitsPerCase: Number(data.unitsPerCase),
      openingStock: includeOpeningStock ? Number(data.openingStock ?? 0) : 0,
    };

    if (!value.barcode) return { ok: false, message: "Barcode is required." };
    if (!value.sku) return { ok: false, message: "SKU is required." };
    if (!value.name) return { ok: false, message: "Product name is required." };
    if (!value.brand) return { ok: false, message: "Brand is required." };
    if (!value.category) return { ok: false, message: "Category is required." };
    if (!Number.isInteger(value.sizeMl) || value.sizeMl <= 0) {
      return { ok: false, message: "Bottle size is invalid." };
    }
    if (!Number.isFinite(value.purchasePrice) || value.purchasePrice < 0) {
      return { ok: false, message: "Purchase price is invalid." };
    }
    if (!Number.isFinite(value.mrp) || value.mrp < 0) {
      return { ok: false, message: "MRP is invalid." };
    }
    if (!Number.isFinite(value.price) || value.price < 0) {
      return { ok: false, message: "Selling price is invalid." };
    }
    if (!Number.isInteger(value.minimumStock) || value.minimumStock < 0) {
      return { ok: false, message: "Minimum stock is invalid." };
    }
    if (!Number.isInteger(value.unitsPerCase) || value.unitsPerCase <= 0) {
      return { ok: false, message: "Bottles per case is invalid." };
    }
    if (
      includeOpeningStock &&
      (!Number.isInteger(value.openingStock) || value.openingStock < 0)
    ) {
      return { ok: false, message: "Opening stock is invalid." };
    }
    return { ok: true, value };
  }

  async function addProduct(productData) {
    try {
      const validation = validateProduct(productData, true);
      if (!validation.ok) return validation;

      const v = validation.value;
      const categoryId = await ensureCategory(v.category);

      const { data, error } = await supabase.rpc("create_new_product", {
        p_barcode: v.barcode,
        p_sku: v.sku,
        p_product_name: v.name,
        p_brand: v.brand,
        p_category_id: categoryId,
        p_subcategory: v.subcategory || null,
        p_size_ml: v.sizeMl,
        p_alcohol_percentage: v.alcoholPercentage,
        p_purchase_price: v.purchasePrice,
        p_mrp: v.mrp,
        p_selling_price: v.price,
        p_minimum_stock: v.minimumStock,
        p_units_per_case: v.unitsPerCase,
        p_opening_stock: v.openingStock,
      });

      if (error) throw error;
      await refreshAll();

      return {
        ok: true,
        productId: data,
        message: `${v.name} created successfully.`,
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function updateProduct(productId, productData) {
    try {
      const validation = validateProduct(productData, false);
      if (!validation.ok) return validation;

      const v = validation.value;
      const categoryId = await ensureCategory(v.category);

      const { error } = await supabase
        .from("products")
        .update({
          barcode: v.barcode,
          sku: v.sku,
          product_name: v.name,
          brand: v.brand,
          category_id: categoryId,
          subcategory: v.subcategory || null,
          size_ml: v.sizeMl,
          alcohol_percentage: v.alcoholPercentage,
          purchase_price: v.purchasePrice,
          mrp: v.mrp,
          selling_price: v.price,
          minimum_stock: v.minimumStock,
          units_per_case: v.unitsPerCase,
        })
        .eq("id", productId);

      if (error) throw error;
      await refreshAll();
      return { ok: true, message: `${v.name} updated successfully.` };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function setProductStatus(productId, active) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ active })
        .eq("id", productId);

      if (error) throw error;
      await refreshAll();
      return {
        ok: true,
        message: active ? "Product activated." : "Product deactivated.",
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function deactivateProduct(productId) {
    return setProductStatus(productId, false);
  }

  async function activateProduct(productId) {
    return setProductStatus(productId, true);
  }

  async function completeSale(
    cart,
    paymentMethod,
    { discount = 0, paymentReference = "" } = {}
  ) {
    try {
      if (!cart?.length) return { ok: false, message: "Cart is empty." };

      const { data, error } = await supabase.rpc("complete_sale", {
        p_items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: Number(item.quantity),
        })),
        p_payment_method: paymentMethod,
        p_discount: Number(discount || 0),
        p_payment_reference: String(paymentReference ?? "").trim() || null,
      });

      if (error) throw error;
      await refreshAll();

      const sale = sales.find((item) => item.id === data) ?? { id: data };
      return { ok: true, sale: { ...sale, id: data } };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function ensureSupplier(supplierName) {
    const name = String(supplierName ?? "").trim();
    if (!name) throw new Error("Supplier name is required.");

    const existing = suppliers.find(
      (item) => item.supplier_name.toLowerCase() === name.toLowerCase()
    );

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        shop_id: profile.shop_id,
        supplier_name: name,
        active: true,
      })
      .select("id,supplier_name,active")
      .single();

    if (error) throw error;
    setSuppliers((current) => [...current, data]);
    return data.id;
  }

  async function receiveStock({
    supplierName,
    invoiceNumber,
    invoiceDate,
    items,
    notes = "",
  }) {
    try {
      if (!items?.length) {
        return { ok: false, message: "Add at least one product." };
      }

      const supplierId = await ensureSupplier(supplierName);

      const payloadItems = items.map((item) => ({
        product_id: item.productId,
        case_count: Number(item.caseCount ?? 0),
        units_per_case: Number(item.unitsPerCase ?? 1),
        loose_bottles: Number(item.looseBottles ?? 0),
        quantity: Number(item.quantity),
        purchase_price: Number(item.purchasePrice),
      }));

      const { data, error } = await supabase.rpc("receive_purchase", {
        p_supplier_id: supplierId,
        p_invoice_number: String(invoiceNumber ?? "").trim(),
        p_invoice_date:
          invoiceDate || new Date().toISOString().slice(0, 10),
        p_items: payloadItems,
        p_notes: notes || null,
      });

      if (error) throw error;
      await refreshAll();

      return {
        ok: true,
        purchaseId: data,
        message: "Stock received successfully.",
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function adjustStock({
    productId,
    adjustmentType,
    quantityChange,
    reason,
    notes = "",
  }) {
    try {
      const { data, error } = await supabase.rpc("adjust_stock", {
        p_product_id: productId,
        p_adjustment_type: adjustmentType,
        p_quantity_change: Number(quantityChange),
        p_reason: String(reason ?? "").trim(),
        p_notes: notes || null,
      });

      if (error) throw error;
      await refreshAll();
      return { ok: true, quantity: data, message: "Stock adjusted." };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  function createBackup() {
    return {
      meta: {
        app: "WineShopPOS",
        mode: "SUPABASE_CLOUD",
        exportedAt: new Date().toISOString(),
      },
      data: { products, inventory, sales, purchases },
    };
  }

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false &&
          getStock(product.id) <= product.minimumStock
      ),
    [products, inventory]
  );

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        purchases,
        categories,
        suppliers,
        loadingData,
        dataError,
        lowStockProducts,
        getStock,
        refreshAll,
        addProduct,
        updateProduct,
        deactivateProduct,
        activateProduct,
        completeSale,
        receiveStock,
        adjustStock,
        createBackup,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
EOF

# ------------------------------------------------------------
# 3. Role guard
# ------------------------------------------------------------
cat > src/components/RequireRole.jsx <<'EOF'
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ roles }) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
EOF

# ------------------------------------------------------------
# 4. Role-aware Layout
# ------------------------------------------------------------
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
  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN","MANAGER","CASHIER"] },
  { path: "/pos", label: "POS Billing", icon: ScanBarcode, roles: ["ADMIN","MANAGER","CASHIER"] },
  { path: "/products", label: "Products", icon: Package, roles: ["ADMIN","MANAGER"] },
  { path: "/inventory", label: "Inventory", icon: Warehouse, roles: ["ADMIN","MANAGER"] },
  { path: "/purchases", label: "Purchases", icon: Truck, roles: ["ADMIN","MANAGER"] },
  { path: "/sales", label: "Sales", icon: ReceiptText, roles: ["ADMIN","MANAGER","CASHIER"] },
  { path: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN","MANAGER"] },
  { path: "/users", label: "Users", icon: UsersRound, roles: ["ADMIN"] },
  { path: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
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
            .filter((item) => item.roles.includes(profile?.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
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
              padding: 4,
              cursor: "pointer",
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
            <p>Cloud POS, barcode billing & inventory</p>
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

# ------------------------------------------------------------
# 5. Product form/pages
# ------------------------------------------------------------
cat > src/components/ProductForm.jsx <<'EOF'
import { useEffect, useState } from "react";

const emptyProduct = {
  barcode: "",
  sku: "",
  name: "",
  brand: "",
  category: "Whisky",
  subcategory: "",
  sizeMl: 750,
  alcoholPercentage: "",
  purchasePrice: 0,
  mrp: 0,
  price: 0,
  minimumStock: 5,
  unitsPerCase: 12,
  openingStock: 0,
};

export default function ProductForm({
  initialValue,
  showOpeningStock = false,
  onSubmit,
  submitLabel,
}) {
  const [form, setForm] = useState(emptyProduct);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        ...emptyProduct,
        ...initialValue,
        openingStock: 0,
      });
    }
  }, [initialValue]);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const result = await onSubmit(form);
    if (!result?.ok) setMessage(result?.message || "Operation failed.");

    setBusy(false);
  }

  return (
    <form className="panel" onSubmit={submit}>
      <div className="form-grid">
        <label>Barcode<input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} required /></label>
        <label>SKU<input value={form.sku} onChange={(e) => set("sku", e.target.value)} required /></label>
        <label>Product Name<input value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
        <label>Brand<input value={form.brand} onChange={(e) => set("brand", e.target.value)} required /></label>
        <label>Category<input value={form.category} onChange={(e) => set("category", e.target.value)} required /></label>
        <label>Subcategory<input value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} /></label>
        <label>Size (ml)<input type="number" min="1" value={form.sizeMl} onChange={(e) => set("sizeMl", e.target.value)} required /></label>
        <label>Alcohol %<input type="number" min="0" step="0.1" value={form.alcoholPercentage ?? ""} onChange={(e) => set("alcoholPercentage", e.target.value)} /></label>
        <label>Purchase Price<input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} required /></label>
        <label>MRP<input type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} required /></label>
        <label>Selling Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required /></label>
        <label>Minimum Stock<input type="number" min="0" value={form.minimumStock} onChange={(e) => set("minimumStock", e.target.value)} required /></label>
        <label>Bottles / Case<input type="number" min="1" value={form.unitsPerCase} onChange={(e) => set("unitsPerCase", e.target.value)} required /></label>
        {showOpeningStock && (
          <label>Opening Stock<input type="number" min="0" value={form.openingStock} onChange={(e) => set("openingStock", e.target.value)} required /></label>
        )}
      </div>

      {message && <div className="purchase-message error" style={{ marginTop: 12 }}>{message}</div>}

      <div style={{ marginTop: 16 }}>
        <button className="primary-button" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
EOF

cat > src/pages/AddProduct.jsx <<'EOF'
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function AddProduct() {
  const { addProduct } = useShop();
  const navigate = useNavigate();

  async function save(form) {
    const result = await addProduct(form);
    if (result.ok) navigate("/products");
    return result;
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Add Product</h2><p>Create product directly in Supabase</p></div></div>
      <ProductForm showOpeningStock onSubmit={save} submitLabel="Create Product" />
    </div>
  );
}
EOF

cat > src/pages/EditProduct.jsx <<'EOF'
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function EditProduct() {
  const { id } = useParams();
  const { products, updateProduct, loadingData } = useShop();
  const navigate = useNavigate();

  const product = products.find((item) => item.id === id);

  if (loadingData) return <div className="panel">Loading...</div>;
  if (!product) return <Navigate to="/products" replace />;

  async function save(form) {
    const result = await updateProduct(id, form);
    if (result.ok) navigate("/products");
    return result;
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Edit Product</h2><p>Stock is not changed by editing product details</p></div></div>
      <ProductForm initialValue={product} onSubmit={save} submitLabel="Save Changes" />
    </div>
  );
}
EOF

cat > src/pages/Products.jsx <<'EOF'
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock, deactivateProduct, activateProduct, loadingData } = useShop();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.brand, p.sku, p.barcode, p.category]
        .some((value) => String(value ?? "").toLowerCase().includes(q))
    );
  }, [products, search]);

  async function toggle(product) {
    const result = product.active
      ? await deactivateProduct(product.id)
      : await activateProduct(product.id);
    setMessage(result.message);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Products</h2><p>{products.length} products in Supabase</p></div>
        <Link to="/products/new" className="primary-button">Add Product</Link>
      </div>

      {message && <div className="purchase-message success">{message}</div>}

      <div className="panel">
        <input
          placeholder="Search name, barcode, SKU, brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 420 }}
        />
      </div>

      <div className="panel data-table-wrapper" style={{ marginTop: 14 }}>
        {loadingData ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>Barcode</th><th>Category</th><th>Stock</th>
                <th>Purchase</th><th>Selling</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br/><small>{p.brand} · {p.size}</small></td>
                  <td>{p.barcode}</td>
                  <td>{p.category}</td>
                  <td>{getStock(p.id)}</td>
                  <td>{money.format(p.purchasePrice)}</td>
                  <td>{money.format(p.price)}</td>
                  <td>{p.active ? "ACTIVE" : "INACTIVE"}</td>
                  <td>
                    <Link className="secondary-button" to={`/products/${p.id}/edit`}>Edit</Link>{" "}
                    <button className="secondary-button" onClick={() => toggle(p)}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 6. Inventory + adjustment
# ------------------------------------------------------------
cat > src/pages/Inventory.jsx <<'EOF'
import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock, adjustStock, loadingData } = useShop();
  const [selectedId, setSelectedId] = useState("");
  const [quantityChange, setQuantityChange] = useState(-1);
  const [adjustmentType, setAdjustmentType] = useState("STOCK_CORRECTION");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const active = products.filter((p) => p.active);
  const inventoryValue = useMemo(
    () => active.reduce((sum, p) => sum + getStock(p.id) * p.purchasePrice, 0),
    [active, getStock]
  );

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    const result = await adjustStock({
      productId: selectedId,
      adjustmentType,
      quantityChange: Number(quantityChange),
      reason,
    });

    setMessage(result.message);
    if (result.ok) setReason("");
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Inventory</h2><p>Live Supabase stock · value {money.format(inventoryValue)}</p></div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Current Stock</h3>
          <div className="data-table-wrapper">
            {loadingData ? <p>Loading...</p> : (
              <table className="data-table">
                <thead><tr><th>Product</th><th>Stock</th><th>Minimum</th><th>Status</th></tr></thead>
                <tbody>
                  {active.map((p) => {
                    const stock = getStock(p.id);
                    return (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{stock}</td>
                        <td>{p.minimumStock}</td>
                        <td>{stock <= p.minimumStock ? "LOW STOCK" : "IN STOCK"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <form className="panel" onSubmit={submit}>
          <h3>Stock Adjustment</h3>
          <p>For damage, breakage, missing stock or physical-count correction.</p>

          <div className="settings-fields">
            <label>Product
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                <option value="">Select product</option>
                {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>

            <label>Type
              <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)}>
                <option value="STOCK_CORRECTION">Stock Correction</option>
                <option value="DAMAGE">Damage</option>
                <option value="BROKEN">Broken</option>
                <option value="MISSING">Missing</option>
                <option value="CUSTOMER_RETURN">Customer Return</option>
                <option value="SUPPLIER_RETURN">Supplier Return</option>
              </select>
            </label>

            <label>Quantity Change
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                required
              />
            </label>

            <label>Reason
              <input value={reason} onChange={(e) => setReason(e.target.value)} required />
            </label>
          </div>

          {message && <div className="purchase-message" style={{ marginTop: 12 }}>{message}</div>}
          <br/>
          <button className="primary-button">Apply Adjustment</button>
        </form>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 7. Purchases / receive stock
# ------------------------------------------------------------
cat > src/pages/Purchases.jsx <<'EOF'
import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function emptyLine() {
  return {
    productId: "",
    caseCount: 0,
    unitsPerCase: 12,
    looseBottles: 0,
    quantity: 0,
    purchasePrice: 0,
  };
}

export default function Purchases() {
  const { products, purchases, suppliers, receiveStock } = useShop();
  const active = products.filter((p) => p.active);

  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyLine()]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function updateLine(index, field, value) {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };

        if (field === "productId") {
          const product = active.find((p) => p.id === value);
          if (product) {
            next.unitsPerCase = product.unitsPerCase || 1;
            next.purchasePrice = product.purchasePrice || 0;
          }
        }

        const cases = Number(next.caseCount || 0);
        const units = Number(next.unitsPerCase || 1);
        const loose = Number(next.looseBottles || 0);
        next.quantity = cases * units + loose;
        return next;
      })
    );
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0),
    [items]
  );

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const cleaned = items.filter((item) => item.productId && Number(item.quantity) > 0);

    const result = await receiveStock({
      supplierName,
      invoiceNumber,
      invoiceDate,
      notes,
      items: cleaned,
    });

    setMessage(result.message);
    if (result.ok) {
      setInvoiceNumber("");
      setNotes("");
      setItems([emptyLine()]);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Receive Stock</h2><p>Purchases update inventory transactionally in Supabase</p></div>
      </div>

      <form className="panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Supplier
            <input
              list="supplier-list"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              required
            />
            <datalist id="supplier-list">
              {suppliers.filter((s) => s.active).map((s) => <option key={s.id} value={s.supplier_name} />)}
            </datalist>
          </label>
          <label>Supplier Invoice<input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required /></label>
          <label>Invoice Date<input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required /></label>
          <label>Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>

        <div className="data-table-wrapper" style={{ marginTop: 18 }}>
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Total Bottles</th><th>Price/Bottle</th><th>Line Total</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select value={item.productId} onChange={(e) => updateLine(index,"productId",e.target.value)} required>
                      <option value="">Select</option>
                      {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td><input type="number" min="0" value={item.caseCount} onChange={(e) => updateLine(index,"caseCount",e.target.value)} /></td>
                  <td><input type="number" min="1" value={item.unitsPerCase} onChange={(e) => updateLine(index,"unitsPerCase",e.target.value)} /></td>
                  <td><input type="number" min="0" value={item.looseBottles} onChange={(e) => updateLine(index,"looseBottles",e.target.value)} /></td>
                  <td>{item.quantity}</td>
                  <td><input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => updateLine(index,"purchasePrice",e.target.value)} /></td>
                  <td>{money.format(Number(item.quantity || 0) * Number(item.purchasePrice || 0))}</td>
                  <td>
                    <button type="button" className="secondary-button" onClick={() => setItems((c) => c.filter((_,i) => i !== index))}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, gap:10 }}>
          <button type="button" className="secondary-button" onClick={() => setItems((c) => [...c, emptyLine()])}>Add Line</button>
          <strong>Total: {money.format(total)}</strong>
        </div>

        {message && <div className="purchase-message" style={{ marginTop:12 }}>{message}</div>}
        <br/>
        <button className="primary-button" disabled={busy}>{busy ? "Receiving..." : "Receive Stock"}</button>
      </form>

      <section className="panel" style={{ marginTop:18 }}>
        <h3>Invoice OCR</h3>
        <p>
          Architecture is reserved for Azure AI Document Intelligence: invoice image/PDF → extracted lines →
          product match → human confirmation → receive_purchase(). OCR is not enabled yet because an Azure
          Document Intelligence resource/endpoint has not been provided.
        </p>
      </section>

      <section className="panel" style={{ marginTop:18 }}>
        <h3>Recent Purchases</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead>
            <tbody>
              {purchases.slice(0,20).map((p) => (
                <tr key={p.id}>
                  <td>{p.purchaseNumber}</td>
                  <td>{p.invoiceNumber}</td>
                  <td>{p.supplierName}</td>
                  <td>{p.invoiceDate}</td>
                  <td>{p.totalUnits}</td>
                  <td>{money.format(p.total)}</td>
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

# ------------------------------------------------------------
# 8. POS
# ------------------------------------------------------------
cat > src/pages/POS.jsx <<'EOF'
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("Ready to scan barcode 8900000010016");
  const [busy, setBusy] = useState(false);

  const activeProducts = products.filter((p) => p.active);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return activeProducts.filter((p) =>
      [p.name,p.brand,p.sku,p.barcode].some((v) => String(v).toLowerCase().includes(q))
    ).slice(0,8);
  }, [search, activeProducts]);

  function cartQty(id) {
    return cart.find((item) => item.product.id === id)?.quantity ?? 0;
  }

  function add(product) {
    const stock = getStock(product.id);
    if (cartQty(product.id) >= stock) {
      setMessage(`Only ${stock} unit(s) available for ${product.name}.`);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setMessage(`${product.name} added.`);
  }

  function scan(event) {
    event.preventDefault();
    const code = barcode.trim();
    const product = activeProducts.find((p) => p.barcode === code);
    if (!product) setMessage(`Product not found: ${code}`);
    else add(product);
    setBarcode("");
    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  function change(id, delta) {
    const item = cart.find((x) => x.product.id === id);
    if (!item) return;
    const next = item.quantity + delta;
    if (next <= 0) {
      setCart((c) => c.filter((x) => x.product.id !== id));
      return;
    }
    if (next > getStock(id)) {
      setMessage(`Only ${getStock(id)} unit(s) available.`);
      return;
    }
    setCart((c) => c.map((x) => x.product.id === id ? { ...x, quantity: next } : x));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const normalizedDiscount = Math.max(0, Number(discount || 0));
  const total = Math.max(0, subtotal - normalizedDiscount);

  async function checkout() {
    setBusy(true);
    const result = await completeSale(cart, paymentMethod, {
      discount: normalizedDiscount,
      paymentReference,
    });
    setBusy(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setCart([]);
    setDiscount(0);
    setPaymentReference("");
    navigate(`/sales/${result.sale.id}`);
  }

  return (
    <div>
      <div className="page-heading"><div><h2>POS Billing</h2><p>USB/Bluetooth scanner works as keyboard input</p></div></div>

      <div className="pos-layout">
        <div className="pos-left">
          <form className="panel" onSubmit={scan}>
            <label>Scan Barcode</label>
            <div className="barcode-input-row">
              <input ref={barcodeRef} autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan barcode + Enter" />
              <button className="primary-button">Add</button>
            </div>
            <div className="purchase-message" style={{ marginTop:10 }}>{message}</div>
          </form>

          <div className="panel" style={{ marginTop:14 }}>
            <input style={{ width:"100%" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." />
            {searchResults.map((p) => (
              <button key={p.id} type="button" className="search-result" onClick={() => add(p)}>
                <span>{p.name}</span>
                <span>{money.format(p.price)} · Stock {getStock(p.id)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Cart</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>
                    <td>
                      <button type="button" onClick={() => change(item.product.id,-1)}>-</button>
                      {" "}{item.quantity}{" "}
                      <button type="button" onClick={() => change(item.product.id,1)}>+</button>
                    </td>
                    <td>{money.format(item.product.price)}</td>
                    <td>{money.format(item.product.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr/>
          <p>Subtotal <strong>{money.format(subtotal)}</strong></p>
          <label>Discount
            <input type="number" min="0" max={subtotal} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>
          <h2>Total {money.format(total)}</h2>

          <div className="payment-methods">
            {["CASH","UPI","CARD"].map((method) => (
              <button
                type="button"
                key={method}
                className={paymentMethod === method ? "payment-button active" : "payment-button"}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          {paymentMethod !== "CASH" && (
            <label>Payment Reference
              <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
            </label>
          )}

          <br/>
          <button className="primary-button" disabled={!cart.length || busy} onClick={checkout}>
            {busy ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 9. Sales
# ------------------------------------------------------------
cat > src/pages/Sales.jsx <<'EOF'
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();
  const { profile } = useAuth();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales</h2>
          <p>{profile?.role === "CASHIER" ? "Your sales" : "Shop sales"} stored in Supabase</p>
        </div>
      </div>

      <div className="panel data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Items</th><th>Payment</th><th>Discount</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.invoiceNumber}</td>
                <td>{new Date(sale.createdAt).toLocaleString("en-IN")}</td>
                <td>{sale.items.reduce((sum,i) => sum + i.quantity, 0)}</td>
                <td>{sale.paymentMethod}</td>
                <td>{money.format(sale.discount)}</td>
                <td>{money.format(sale.grandTotal)}</td>
                <td><Link to={`/sales/${sale.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
EOF

cat > src/pages/SaleDetails.jsx <<'EOF'
import { Navigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SaleDetails() {
  const { id } = useParams();
  const { sales, loadingData } = useShop();
  const sale = sales.find((item) => item.id === id);

  if (loadingData) return <div className="panel">Loading...</div>;
  if (!sale) return <Navigate to="/sales" replace />;

  return (
    <div className="invoice-page">
      <div className="page-heading no-print">
        <div><h2>Invoice {sale.invoiceNumber}</h2></div>
        <button className="primary-button" onClick={() => window.print()}>Print</button>
      </div>

      <div className="panel invoice-card">
        <h2>WineShop POS</h2>
        <p>{sale.invoiceNumber}</p>
        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>

        <table className="data-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id || item.productId}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{money.format(item.unitPrice)}</td>
                <td>{money.format(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>Subtotal: {money.format(sale.subtotal)}</p>
        <p>Discount: {money.format(sale.discount)}</p>
        <h2>Total: {money.format(sale.grandTotal)}</h2>
        <p>Payment: {sale.paymentMethod} {sale.paymentReference ? `· ${sale.paymentReference}` : ""}</p>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 10. Dashboard
# ------------------------------------------------------------
cat > src/pages/Dashboard.jsx <<'EOF'
import { useMemo } from "react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock, lowStockProducts, loadingData, dataError } = useShop();
  const { profile } = useAuth();

  const today = new Date().toISOString().slice(0,10);
  const todaySales = sales.filter((s) => s.createdAt?.slice(0,10) === today);
  const todayTotal = todaySales.reduce((sum,s) => sum + s.grandTotal,0);
  const inventoryValue = products.reduce((sum,p) => sum + getStock(p.id) * p.purchasePrice,0);

  const top = useMemo(() => {
    const map = {};
    sales.forEach((sale) => sale.items.forEach((item) => {
      map[item.productName] = (map[item.productName] || 0) + item.quantity;
    }));
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,5);
  }, [sales]);

  if (loadingData) return <div className="panel">Loading Supabase data...</div>;

  return (
    <div>
      <div className="page-heading">
        <div><h2>Dashboard</h2><p>{profile?.shop_name} · live cloud data</p></div>
      </div>

      {dataError && <div className="purchase-message error">{dataError}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span>Today's Sales</span><strong>{money.format(todayTotal)}</strong></div>
        <div className="stat-card"><span>Bills Today</span><strong>{todaySales.length}</strong></div>
        <div className="stat-card"><span>Low Stock</span><strong>{lowStockProducts.length}</strong></div>
        <div className="stat-card"><span>Inventory Value</span><strong>{money.format(inventoryValue)}</strong></div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Recent Sales</h3>
          {sales.slice(0,8).map((s) => (
            <div key={s.id} className="list-row">
              <span>{s.invoiceNumber}</span><strong>{money.format(s.grandTotal)}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h3>Low Stock</h3>
          {lowStockProducts.slice(0,8).map((p) => (
            <div key={p.id} className="list-row">
              <span>{p.name}</span><strong>{getStock(p.id)}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h3>Top Selling Products</h3>
          {top.map(([name,qty]) => (
            <div key={name} className="list-row"><span>{name}</span><strong>{qty}</strong></div>
          ))}
        </section>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 11. Reports
# ------------------------------------------------------------
cat > src/pages/Reports.jsx <<'EOF'
import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Reports() {
  const { sales, purchases, products, getStock, lowStockProducts } = useShop();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const today = now.toISOString().slice(0,10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const filteredSales = sales.filter((s) => {
    const d = s.createdAt?.slice(0,10);
    return d >= from && d <= to;
  });

  const filteredPurchases = purchases.filter((p) => {
    const d = p.invoiceDate;
    return d >= from && d <= to;
  });

  const salesTotal = filteredSales.reduce((sum,s) => sum + s.grandTotal,0);
  const purchaseTotal = filteredPurchases.reduce((sum,p) => sum + p.total,0);
  const inventoryCost = products.reduce((sum,p) => sum + getStock(p.id)*p.purchasePrice,0);
  const potentialSales = products.reduce((sum,p) => sum + getStock(p.id)*p.price,0);

  const paymentTotals = useMemo(() => {
    const result = { CASH:0, UPI:0, CARD:0 };
    filteredSales.forEach((s) => {
      if (result[s.paymentMethod] !== undefined) result[s.paymentMethod] += s.grandTotal;
    });
    return result;
  }, [filteredSales]);

  return (
    <div>
      <div className="page-heading"><div><h2>Reports</h2><p>Supabase live reporting</p></div></div>

      <div className="panel form-grid">
        <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>

      <div className="stats-grid" style={{ marginTop:14 }}>
        <div className="stat-card"><span>Sales</span><strong>{money.format(salesTotal)}</strong></div>
        <div className="stat-card"><span>Purchases</span><strong>{money.format(purchaseTotal)}</strong></div>
        <div className="stat-card"><span>Inventory Cost</span><strong>{money.format(inventoryCost)}</strong></div>
        <div className="stat-card"><span>Potential Sales</span><strong>{money.format(potentialSales)}</strong></div>
        <div className="stat-card"><span>Low Stock</span><strong>{lowStockProducts.length}</strong></div>
      </div>

      <div className="settings-grid" style={{ marginTop:14 }}>
        <section className="panel">
          <h3>Payment Methods</h3>
          <p>Cash: <strong>{money.format(paymentTotals.CASH)}</strong></p>
          <p>UPI: <strong>{money.format(paymentTotals.UPI)}</strong></p>
          <p>Card: <strong>{money.format(paymentTotals.CARD)}</strong></p>
        </section>

        <section className="panel">
          <h3>Period</h3>
          <p>Bills: <strong>{filteredSales.length}</strong></p>
          <p>Purchases: <strong>{filteredPurchases.length}</strong></p>
        </section>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 12. Settings - cloud backup snapshot
# ------------------------------------------------------------
cat > src/pages/Settings.jsx <<'EOF'
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { profile, access } = useAuth();
  const { products, sales, purchases, createBackup, refreshAll } = useShop();

  function exportSnapshot() {
    const backup = createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wineshoppos-cloud-snapshot-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Settings</h2><p>Cloud shop configuration</p></div></div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Shop</h3>
          <p>Name: <strong>{profile?.shop_name}</strong></p>
          <p>Slug: <strong>{profile?.shop_slug}</strong></p>
          <p>Role: <strong>{profile?.role}</strong></p>
          <p>Subscription: <strong>{access?.subscription_status}</strong></p>
          <p>Products: <strong>{products.length}</strong></p>
          <p>Sales loaded: <strong>{sales.length}</strong></p>
          <p>Purchases loaded: <strong>{purchases.length}</strong></p>
        </section>

        <section className="panel">
          <h3>Cloud Data</h3>
          <p>Supabase is now the source of truth. LocalStorage is no longer used for business transactions.</p>
          <button className="primary-button" onClick={refreshAll}>Refresh Cloud Data</button>{" "}
          <button className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button>
        </section>
      </div>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 13. Final App routes with role enforcement
# ------------------------------------------------------------
cat > src/App.jsx <<'EOF'
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
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
          <Route path="sales" element={<Sales />} />
          <Route path="sales/:id" element={<SaleDetails />} />

          <Route element={<RequireRole roles={["ADMIN","MANAGER"]} />}>
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
EOF

# ------------------------------------------------------------
# 14. Ensure main.jsx uses HashRouter and providers
# ------------------------------------------------------------
cat > src/main.jsx <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import "./index.css";
import "./chapters9to12.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
EOF

# ------------------------------------------------------------
# 15. Small CSS additions
# ------------------------------------------------------------
cat >> src/index.css <<'EOF'

/* === FINAL SUPABASE CLOUD PATCH === */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
}
.form-grid label,
.settings-fields label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}
.form-grid input,
.form-grid select,
.settings-fields input,
.settings-fields select,
.data-table input,
.data-table select,
.panel > input {
  min-height: 38px;
  padding: 7px 9px;
  border: 1px solid #dfe2e7;
  border-radius: 7px;
  background: #fff;
}
.search-result {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #eee;
  background: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
}
.search-result:hover { background: #f7f7f8; }
.list-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #eee;
}
EOF

# ------------------------------------------------------------
# 16. Docs
# ------------------------------------------------------------
cat > docs/chapters/15-supabase-live-production.md <<'EOF'
# Chapter 15 — Supabase Live Data Integration

Status: COMPLETE for current cloud MVP.

## Source of truth

Business data now uses Supabase instead of LocalStorage:

- products
- categories
- suppliers
- inventory
- purchases
- purchase items
- sales
- sale items
- payments
- stock movements
- stock adjustments

## Transaction safety

Stock-changing operations use PostgreSQL RPCs:

- `create_new_product()`
- `receive_purchase()`
- `adjust_stock()`
- `complete_sale()`

This prevents the browser from directly mutating inventory.

## Roles

### Platform owner
Outside shop tenancy. Controls:
- first Shop ADMIN
- subscription
- kill switch

### ADMIN
- all shop screens
- create Manager/Cashier
- products
- inventory
- purchases
- reports
- settings
- POS

### MANAGER
- products
- inventory
- purchases
- reports
- POS
- sales

### CASHIER
- dashboard
- POS
- own sales view

## Subscription Kill Switch

`shops.access_enabled = false` blocks shop application data through RLS/RPC checks.

## OCR roadmap

Purchase invoice OCR is intentionally not enabled because Azure AI Document Intelligence credentials/resource are not configured.

Safe target flow:

invoice PDF/photo
-> OCR
-> supplier/invoice/line extraction
-> product matching
-> human review
-> `receive_purchase()`

OCR must never update stock without confirmation.

## Hosting

Frontend target:
Azure Storage static website `$web`.

HashRouter is used for SPA routing.
EOF

cat > docs/testing/FINAL_SMOKE_TEST.md <<'EOF'
# Final WineShopPOS Smoke Test

1. Login as Shop ADMIN.
2. Dashboard loads Supabase data.
3. Products shows seeded products.
4. Search barcode `8900000010016`.
5. POS sells one bottle.
6. Inventory decreases by one.
7. Sale appears in Sales.
8. Receive a purchase.
9. Inventory increases.
10. Add a new product.
11. Refresh browser; product remains.
12. Create Manager/Cashier in Users.
13. Login as Cashier; restricted menus are hidden.
14. Disable shop using `shops.access_enabled=false`; app shows subscription blocked.
15. Re-enable shop.
16. `npm run build` passes.
17. Azure static URL opens from another device.
EOF

# ------------------------------------------------------------
# 17. Production build
# ------------------------------------------------------------
echo
echo "Running production build..."
npm run build

cp dist/index.html dist/404.html

# ------------------------------------------------------------
# 18. Git
# ------------------------------------------------------------
git add .
if git diff --cached --quiet; then
  echo "No new Git changes."
else
  git commit -m "Chapter 15 - Supabase live data roles and cloud-ready POS"
  git push
fi

# ------------------------------------------------------------
# 19. Azure Blob deployment
# ------------------------------------------------------------
echo
echo "============================================================"
echo "APP FINALIZATION PASSED"
echo "Attempting Azure Blob deployment..."
echo "============================================================"

if command -v az >/dev/null 2>&1; then
  if ! az account show >/dev/null 2>&1; then
    az login
  fi

  az account set --subscription "Azure subscription 1"

  az storage account show \
    --name wineshoppos \
    --resource-group wineshopPOS \
    --output none

  az storage blob service-properties update \
    --account-name wineshoppos \
    --static-website true \
    --index-document index.html \
    --404-document 404.html \
    --auth-mode key \
    --output none

  az storage blob upload-batch \
    --account-name wineshoppos \
    --destination '$web' \
    --source dist \
    --overwrite true \
    --auth-mode key \
    --output none

  WEBSITE_URL="$(az storage account show \
    --name wineshoppos \
    --resource-group wineshopPOS \
    --query 'primaryEndpoints.web' \
    --output tsv)"

  echo
  echo "============================================================"
  echo "SUCCESS - WineShopPOS is live"
  echo "$WEBSITE_URL"
  echo "============================================================"
else
  echo
  echo "Azure CLI is not installed, so everything except the final upload is complete."
  echo "Install Azure CLI, reopen Git Bash, then run:"
  echo
  echo "  bash deploy_azure_blob.sh"
  echo
  echo "Your existing deploy_azure_blob.sh will upload dist/ to Azure."
fi
