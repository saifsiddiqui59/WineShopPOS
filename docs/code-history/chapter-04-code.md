# Chapter 4 — Actual Git Code History

> Generated automatically from the real Git repository on the developer machine.
> No source code in this document was reconstructed from chat memory.

## Important historical note

This chapter was committed together with Chapters 2, 3, 4, 5, 6 in the same Git commit.
Therefore, Git does not contain a separate exact intermediate snapshot for only this chapter.
The diff and snapshot below are the exact combined implementation recorded by Git.

## Commit

```text
Commit: d6d8334dae5b3821b43411cc070156bdfaae3f87
Short: d6d8334
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T08:48:04-04:00
Subject: Chapters 2-6 - POS UI barcode billing and local inventory
```

## Changed files in this commit

```text
M	src/App.jsx
A	src/components/Layout.jsx
A	src/context/ShopContext.jsx
A	src/data/products.js
M	src/index.css
M	src/main.jsx
A	src/pages/Dashboard.jsx
A	src/pages/Inventory.jsx
A	src/pages/POS.jsx
A	src/pages/Placeholder.jsx
A	src/pages/Products.jsx
A	src/pages/Sales.jsx
A	src/pages/Settings.jsx
```

## Exact Git patch introduced by this commit

This is the verbatim patch returned by `git show` for the milestone commit.

```diff
commit d6d8334dae5b3821b43411cc070156bdfaae3f87
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sat Aug 29 08:48:04 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sat Aug 29 08:48:04 2026 -0400

    Chapters 2-6 - POS UI barcode billing and local inventory
---
 src/App.jsx                 |  159 ++-----
 src/components/Layout.jsx   |  124 +++++
 src/context/ShopContext.jsx |  148 ++++++
 src/data/products.js        |  707 +++++++++++++++++++++++++++++
 src/index.css               | 1055 +++++++++++++++++++++++++++++++++++++++----
 src/main.jsx                |   22 +-
 src/pages/Dashboard.jsx     |  165 +++++++
 src/pages/Inventory.jsx     |  115 +++++
 src/pages/POS.jsx           |  444 ++++++++++++++++++
 src/pages/Placeholder.jsx   |   19 +
 src/pages/Products.jsx      |   99 ++++
 src/pages/Sales.jsx         |   78 ++++
 src/pages/Settings.jsx      |   64 +++
 13 files changed, 2985 insertions(+), 214 deletions(-)

diff --git a/src/App.jsx b/src/App.jsx
index 174b3f1..def6000 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -1,122 +1,49 @@
-import { useState } from 'react'
-import heroImg from './assets/hero.png'
-import reactLogo from './assets/react.svg'
-import viteLogo from './assets/vite.svg'
-import './App.css'
-
-function App() {
-  const [count, setCount] = useState(0)
+import { Route, Routes } from "react-router-dom";
+import Layout from "./components/Layout";
+import Dashboard from "./pages/Dashboard";
+import Inventory from "./pages/Inventory";
+import POS from "./pages/POS";
+import Placeholder from "./pages/Placeholder";
+import Products from "./pages/Products";
+import Sales from "./pages/Sales";
+import Settings from "./pages/Settings";
 
+export default function App() {
   return (
-    <>
-      <section id="center">
-        <div className="hero">
-          <img src={heroImg} className="base" width="170" height="179" alt="" />
-          <img src={reactLogo} className="framework" alt="React logo" />
-          <img src={viteLogo} className="vite" alt="Vite logo" />
-        </div>
-        <div>
-          <h1>Get started</h1>
-          <p>
-            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
-          </p>
-        </div>
-        <button
-          type="button"
-          className="counter"
-          onClick={() => setCount((count) => count + 1)}
-        >
-          Count is {count}
-        </button>
-      </section>
+    <Routes>
+      <Route element={<Layout />}>
+        <Route index element={<Dashboard />} />
 
-      <div className="ticks"></div>
+        <Route path="pos" element={<POS />} />
 
-      <section id="next-steps">
-        <div id="docs">
-          <svg className="icon" role="presentation" aria-hidden="true">
-            <use href="/icons.svg#documentation-icon"></use>
-          </svg>
-          <h2>Documentation</h2>
-          <p>Your questions, answered</p>
-          <ul>
-            <li>
-              <a href="https://vite.dev/" target="_blank">
-                <img className="logo" src={viteLogo} alt="" />
-                Explore Vite
-              </a>
-            </li>
-            <li>
-              <a href="https://react.dev/" target="_blank">
-                <img className="button-icon" src={reactLogo} alt="" />
-                Learn more
-              </a>
-            </li>
-          </ul>
-        </div>
-        <div id="social">
-          <svg className="icon" role="presentation" aria-hidden="true">
-            <use href="/icons.svg#social-icon"></use>
-          </svg>
-          <h2>Connect with us</h2>
-          <p>Join the Vite community</p>
-          <ul>
-            <li>
-              <a href="https://github.com/vitejs/vite" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#github-icon"></use>
-                </svg>
-                GitHub
-              </a>
-            </li>
-            <li>
-              <a href="https://chat.vite.dev/" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#discord-icon"></use>
-                </svg>
-                Discord
-              </a>
-            </li>
-            <li>
-              <a href="https://x.com/vite_js" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#x-icon"></use>
-                </svg>
-                X.com
-              </a>
-            </li>
-            <li>
-              <a href="https://bsky.app/profile/vite.dev" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#bluesky-icon"></use>
-                </svg>
-                Bluesky
-              </a>
-            </li>
-          </ul>
-        </div>
-      </section>
+        <Route path="products" element={<Products />} />
 
-      <div className="ticks"></div>
-      <section id="spacer"></section>
-    </>
-  )
-}
+        <Route path="inventory" element={<Inventory />} />
+
+        <Route
+          path="purchases"
+          element={
+            <Placeholder
+              title="Purchases"
+              description="Supplier purchases and receive-stock workflow"
+            />
+          }
+        />
 
-export default App
+        <Route path="sales" element={<Sales />} />
+
+        <Route
+          path="reports"
+          element={
+            <Placeholder
+              title="Reports"
+              description="Sales, inventory and performance reporting"
+            />
+          }
+        />
+
+        <Route path="settings" element={<Settings />} />
+      </Route>
+    </Routes>
+  );
+}
diff --git a/src/components/Layout.jsx b/src/components/Layout.jsx
new file mode 100644
index 0000000..42789ba
--- /dev/null
+++ b/src/components/Layout.jsx
@@ -0,0 +1,124 @@
+import { NavLink, Outlet } from "react-router-dom";
+import {
+  BarChart3,
+  LayoutDashboard,
+  Package,
+  ReceiptText,
+  ScanBarcode,
+  Settings,
+  ShoppingBag,
+  Truck,
+  Warehouse,
+  Wine,
+} from "lucide-react";
+
+const navigation = [
+  {
+    path: "/",
+    label: "Dashboard",
+    icon: LayoutDashboard,
+  },
+  {
+    path: "/pos",
+    label: "POS Billing",
+    icon: ScanBarcode,
+  },
+  {
+    path: "/products",
+    label: "Products",
+    icon: Package,
+  },
+  {
+    path: "/inventory",
+    label: "Inventory",
+    icon: Warehouse,
+  },
+  {
+    path: "/purchases",
+    label: "Purchases",
+    icon: Truck,
+  },
+  {
+    path: "/sales",
+    label: "Sales",
+    icon: ReceiptText,
+  },
+  {
+    path: "/reports",
+    label: "Reports",
+    icon: BarChart3,
+  },
+  {
+    path: "/settings",
+    label: "Settings",
+    icon: Settings,
+  },
+];
+
+export default function Layout() {
+  return (
+    <div className="app-shell">
+      <aside className="sidebar">
+        <div className="brand">
+          <div className="brand-icon">
+            <Wine size={25} />
+          </div>
+
+          <div>
+            <div className="brand-name">WineShop POS</div>
+            <div className="brand-subtitle">Retail Management</div>
+          </div>
+        </div>
+
+        <nav className="nav-menu">
+          {navigation.map((item) => {
+            const Icon = item.icon;
+
+            return (
+              <NavLink
+                key={item.path}
+                to={item.path}
+                end={item.path === "/"}
+                className={({ isActive }) =>
+                  isActive ? "nav-item active" : "nav-item"
+                }
+              >
+                <Icon size={19} />
+                <span>{item.label}</span>
+              </NavLink>
+            );
+          })}
+        </nav>
+
+        <div className="sidebar-footer">
+          <ShoppingBag size={18} />
+          <div>
+            <strong>Demo Store</strong>
+            <span>Local prototype</span>
+          </div>
+        </div>
+      </aside>
+
+      <main className="main-area">
+        <header className="topbar">
+          <div>
+            <h1>Wine Shop Management</h1>
+            <p>Barcode billing & inventory</p>
+          </div>
+
+          <div className="user-pill">
+            <div className="avatar">A</div>
+            <div>
+              <strong>Admin</strong>
+              <span>Administrator</span>
+            </div>
+          </div>
+        </header>
+
+        <div className="page-area">
+          <Outlet />
+        </div>
+      </main>
+    </div>
+  );
+}
diff --git a/src/context/ShopContext.jsx b/src/context/ShopContext.jsx
new file mode 100644
index 0000000..2a6a22e
--- /dev/null
+++ b/src/context/ShopContext.jsx
@@ -0,0 +1,148 @@
+import { createContext, useContext, useEffect, useState } from "react";
+import { products } from "../data/products";
+
+const ShopContext = createContext(null);
+
+const INVENTORY_KEY = "wineshop_inventory_v1";
+const SALES_KEY = "wineshop_sales_v1";
+
+function createInitialInventory() {
+  let saved = {};
+
+  try {
+    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
+  } catch {
+    saved = {};
+  }
+
+  return products.reduce((result, product) => {
+    result[product.id] =
+      typeof saved[product.id] === "number"
+        ? saved[product.id]
+        : product.openingStock;
+
+    return result;
+  }, {});
+}
+
+function createInitialSales() {
+  try {
+    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
+  } catch {
+    return [];
+  }
+}
+
+export function ShopProvider({ children }) {
+  const [inventory, setInventory] = useState(createInitialInventory);
+  const [sales, setSales] = useState(createInitialSales);
+
+  useEffect(() => {
+    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
+  }, [inventory]);
+
+  useEffect(() => {
+    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
+  }, [sales]);
+
+  function getStock(productId) {
+    return inventory[productId] ?? 0;
+  }
+
+  function completeSale(cart, paymentMethod) {
+    if (!cart.length) {
+      return {
+        ok: false,
+        message: "Cart is empty.",
+      };
+    }
+
+    for (const item of cart) {
+      const available = inventory[item.product.id] ?? 0;
+
+      if (item.quantity > available) {
+        return {
+          ok: false,
+          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
+        };
+      }
+    }
+
+    const updatedInventory = { ...inventory };
+
+    cart.forEach((item) => {
+      updatedInventory[item.product.id] -= item.quantity;
+    });
+
+    const subtotal = cart.reduce(
+      (total, item) => total + item.product.price * item.quantity,
+      0
+    );
+
+    const invoiceNumber = `INV-${new Date()
+      .toISOString()
+      .slice(0, 10)
+      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;
+
+    const sale = {
+      id: crypto.randomUUID(),
+      invoiceNumber,
+      createdAt: new Date().toISOString(),
+      paymentMethod,
+      subtotal,
+      discount: 0,
+      grandTotal: subtotal,
+      items: cart.map((item) => ({
+        productId: item.product.id,
+        productName: item.product.name,
+        barcode: item.product.barcode,
+        quantity: item.quantity,
+        unitPrice: item.product.price,
+        lineTotal: item.product.price * item.quantity,
+      })),
+    };
+
+    setInventory(updatedInventory);
+    setSales((currentSales) => [sale, ...currentSales]);
+
+    return {
+      ok: true,
+      sale,
+    };
+  }
+
+  function resetDemo() {
+    const initialInventory = products.reduce((result, product) => {
+      result[product.id] = product.openingStock;
+      return result;
+    }, {});
+
+    setInventory(initialInventory);
+    setSales([]);
+  }
+
+  return (
+    <ShopContext.Provider
+      value={{
+        products,
+        inventory,
+        sales,
+        getStock,
+        completeSale,
+        resetDemo,
+      }}
+    >
+      {children}
+    </ShopContext.Provider>
+  );
+}
+
+export function useShop() {
+  const context = useContext(ShopContext);
+
+  if (!context) {
+    throw new Error("useShop must be used inside ShopProvider");
+  }
+
+  return context;
+}
diff --git a/src/data/products.js b/src/data/products.js
new file mode 100644
index 0000000..98d3b0b
--- /dev/null
+++ b/src/data/products.js
@@ -0,0 +1,707 @@
+export const products = [
+  {
+    id: "p001",
+    barcode: "8900000010001",
+    sku: "WH-RS-180",
+    name: "Royal Stag 180ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "180 ml",
+    purchasePrice: 150,
+    price: 210,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 48,
+  },
+  {
+    id: "p002",
+    barcode: "8900000010002",
+    sku: "WH-RS-375",
+    name: "Royal Stag 375ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 285,
+    price: 410,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 30,
+  },
+  {
+    id: "p003",
+    barcode: "8900000010003",
+    sku: "WH-RS-750",
+    name: "Royal Stag 750ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 780,
+    minimumStock: 12,
+    unitsPerCase: 12,
+    openingStock: 36,
+  },
+  {
+    id: "p004",
+    barcode: "8900000010004",
+    sku: "WH-BP-375",
+    name: "Blenders Pride 375ml",
+    brand: "Blenders Pride",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 620,
+    price: 850,
+    minimumStock: 8,
+    unitsPerCase: 24,
+    openingStock: 20,
+  },
+  {
+    id: "p005",
+    barcode: "8900000010005",
+    sku: "WH-BP-750",
+    name: "Blenders Pride 750ml",
+    brand: "Blenders Pride",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 1200,
+    price: 1650,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p006",
+    barcode: "8900000010006",
+    sku: "WH-IB-180",
+    name: "Imperial Blue 180ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "180 ml",
+    purchasePrice: 125,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 45,
+  },
+  {
+    id: "p007",
+    barcode: "8900000010007",
+    sku: "WH-IB-375",
+    name: "Imperial Blue 375ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 245,
+    price: 350,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 32,
+  },
+  {
+    id: "p008",
+    barcode: "8900000010008",
+    sku: "WH-IB-750",
+    name: "Imperial Blue 750ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 460,
+    price: 680,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 28,
+  },
+  {
+    id: "p009",
+    barcode: "8900000010009",
+    sku: "WH-MD1-750",
+    name: "McDowell's No.1 750ml",
+    brand: "McDowell's",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 500,
+    price: 730,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 30,
+  },
+  {
+    id: "p010",
+    barcode: "8900000010010",
+    sku: "WH-RC-750",
+    name: "Royal Challenge 750ml",
+    brand: "Royal Challenge",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 620,
+    price: 850,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p011",
+    barcode: "8900000010011",
+    sku: "WH-SIG-750",
+    name: "Signature Rare Aged 750ml",
+    brand: "Signature",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1100,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 18,
+  },
+  {
+    id: "p012",
+    barcode: "8900000010012",
+    sku: "WH-AB-750",
+    name: "Antiquity Blue 750ml",
+    brand: "Antiquity",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 1100,
+    price: 1550,
+    minimumStock: 6,
+    unitsPerCase: 12,
+    openingStock: 15,
+  },
+  {
+    id: "p013",
+    barcode: "8900000010013",
+    sku: "WH-OC-750",
+    name: "Officer's Choice 750ml",
+    brand: "Officer's Choice",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 390,
+    price: 570,
+    minimumStock: 12,
+    unitsPerCase: 12,
+    openingStock: 34,
+  },
+  {
+    id: "p014",
+    barcode: "8900000010014",
+    sku: "WH-8PM-750",
+    name: "8PM Whisky 750ml",
+    brand: "8PM",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 430,
+    price: 620,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 27,
+  },
+
+  {
+    id: "p015",
+    barcode: "8900000010015",
+    sku: "BE-KFP-650",
+    name: "Kingfisher Premium 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 105,
+    price: 160,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 72,
+  },
+  {
+    id: "p016",
+    barcode: "8900000010016",
+    sku: "BE-KFS-650",
+    name: "Kingfisher Strong 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 120,
+    price: 180,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 84,
+  },
+  {
+    id: "p017",
+    barcode: "8900000010017",
+    sku: "BE-KFU-330",
+    name: "Kingfisher Ultra 330ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 95,
+    price: 150,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 48,
+  },
+  {
+    id: "p018",
+    barcode: "8900000010018",
+    sku: "BE-KFUM-650",
+    name: "Kingfisher Ultra Max 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 150,
+    price: 220,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 48,
+  },
+  {
+    id: "p019",
+    barcode: "8900000010019",
+    sku: "BE-TS-650",
+    name: "Tuborg Strong 650ml",
+    brand: "Tuborg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 125,
+    price: 190,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 78,
+  },
+  {
+    id: "p020",
+    barcode: "8900000010020",
+    sku: "BE-TG-650",
+    name: "Tuborg Green 650ml",
+    brand: "Tuborg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 115,
+    price: 175,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 60,
+  },
+  {
+    id: "p021",
+    barcode: "8900000010021",
+    sku: "BE-BUD-330",
+    name: "Budweiser Premium 330ml",
+    brand: "Budweiser",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 110,
+    price: 170,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 42,
+  },
+  {
+    id: "p022",
+    barcode: "8900000010022",
+    sku: "BE-BM-500",
+    name: "Budweiser Magnum 500ml",
+    brand: "Budweiser",
+    category: "Beer",
+    size: "500 ml",
+    purchasePrice: 135,
+    price: 210,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 50,
+  },
+  {
+    id: "p023",
+    barcode: "8900000010023",
+    sku: "BE-CE-650",
+    name: "Carlsberg Elephant 650ml",
+    brand: "Carlsberg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 130,
+    price: 200,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 54,
+  },
+  {
+    id: "p024",
+    barcode: "8900000010024",
+    sku: "BE-CS-650",
+    name: "Carlsberg Smooth 650ml",
+    brand: "Carlsberg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 120,
+    price: 185,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 55,
+  },
+  {
+    id: "p025",
+    barcode: "8900000010025",
+    sku: "BE-HEI-330",
+    name: "Heineken 330ml",
+    brand: "Heineken",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 115,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 36,
+  },
+  {
+    id: "p026",
+    barcode: "8900000010026",
+    sku: "BE-B91B-330",
+    name: "Bira 91 Blonde 330ml",
+    brand: "Bira 91",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 105,
+    price: 165,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 30,
+  },
+  {
+    id: "p027",
+    barcode: "8900000010027",
+    sku: "BE-B91W-330",
+    name: "Bira 91 White 330ml",
+    brand: "Bira 91",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 115,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 34,
+  },
+
+  {
+    id: "p028",
+    barcode: "8900000010028",
+    sku: "RU-OM-180",
+    name: "Old Monk 180ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "180 ml",
+    purchasePrice: 130,
+    price: 190,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 38,
+  },
+  {
+    id: "p029",
+    barcode: "8900000010029",
+    sku: "RU-OM-375",
+    name: "Old Monk 375ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "375 ml",
+    purchasePrice: 260,
+    price: 380,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 28,
+  },
+  {
+    id: "p030",
+    barcode: "8900000010030",
+    sku: "RU-OM-750",
+    name: "Old Monk 750ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 500,
+    price: 720,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 31,
+  },
+  {
+    id: "p031",
+    barcode: "8900000010031",
+    sku: "RU-MCR-750",
+    name: "McDowell's Celebration Rum 750ml",
+    brand: "McDowell's",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 430,
+    price: 630,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p032",
+    barcode: "8900000010032",
+    sku: "RU-CON-750",
+    name: "Contessa Rum 750ml",
+    brand: "Contessa",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 410,
+    price: 600,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 20,
+  },
+
+  {
+    id: "p033",
+    barcode: "8900000010033",
+    sku: "VO-MM-180",
+    name: "Magic Moments 180ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "180 ml",
+    purchasePrice: 140,
+    price: 210,
+    minimumStock: 10,
+    unitsPerCase: 48,
+    openingStock: 35,
+  },
+  {
+    id: "p034",
+    barcode: "8900000010034",
+    sku: "VO-MM-375",
+    name: "Magic Moments 375ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "375 ml",
+    purchasePrice: 280,
+    price: 410,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 28,
+  },
+  {
+    id: "p035",
+    barcode: "8900000010035",
+    sku: "VO-MM-750",
+    name: "Magic Moments 750ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 790,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 26,
+  },
+  {
+    id: "p036",
+    barcode: "8900000010036",
+    sku: "VO-ROM-750",
+    name: "Romanov 750ml",
+    brand: "Romanov",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 420,
+    price: 620,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 21,
+  },
+  {
+    id: "p037",
+    barcode: "8900000010037",
+    sku: "VO-SMI-375",
+    name: "Smirnoff 375ml",
+    brand: "Smirnoff",
+    category: "Vodka",
+    size: "375 ml",
+    purchasePrice: 420,
+    price: 610,
+    minimumStock: 8,
+    unitsPerCase: 24,
+    openingStock: 18,
+  },
+  {
+    id: "p038",
+    barcode: "8900000010038",
+    sku: "VO-SMI-750",
+    name: "Smirnoff 750ml",
+    brand: "Smirnoff",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 820,
+    price: 1180,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 22,
+  },
+  {
+    id: "p039",
+    barcode: "8900000010039",
+    sku: "VO-WM-750",
+    name: "White Mischief 750ml",
+    brand: "White Mischief",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 390,
+    price: 570,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 19,
+  },
+
+  {
+    id: "p040",
+    barcode: "8900000010040",
+    sku: "BR-MH-750",
+    name: "Mansion House 750ml",
+    brand: "Mansion House",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 610,
+    price: 890,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 22,
+  },
+  {
+    id: "p041",
+    barcode: "8900000010041",
+    sku: "BR-MOR-750",
+    name: "Morpheus Brandy 750ml",
+    brand: "Morpheus",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1120,
+    minimumStock: 6,
+    unitsPerCase: 12,
+    openingStock: 16,
+  },
+  {
+    id: "p042",
+    barcode: "8900000010042",
+    sku: "BR-HB-750",
+    name: "Honey Bee Brandy 750ml",
+    brand: "Honey Bee",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 480,
+    price: 700,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 18,
+  },
+
+  {
+    id: "p043",
+    barcode: "8900000010043",
+    sku: "WI-SCS-750",
+    name: "Sula Cabernet Shiraz 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 620,
+    price: 900,
+    minimumStock: 5,
+    unitsPerCase: 6,
+    openingStock: 14,
+  },
+  {
+    id: "p044",
+    barcode: "8900000010044",
+    sku: "WI-SCB-750",
+    name: "Sula Chenin Blanc 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 600,
+    price: 870,
+    minimumStock: 5,
+    unitsPerCase: 6,
+    openingStock: 12,
+  },
+  {
+    id: "p045",
+    barcode: "8900000010045",
+    sku: "WI-SBR-750",
+    name: "Sula Brut 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1150,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 10,
+  },
+  {
+    id: "p046",
+    barcode: "8900000010046",
+    sku: "WI-SZR-750",
+    name: "Sula Zinfandel Rosé 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 690,
+    price: 980,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 11,
+  },
+  {
+    id: "p047",
+    barcode: "8900000010047",
+    sku: "WI-FCR-750",
+    name: "Fratelli Cabernet Red 750ml",
+    brand: "Fratelli",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 560,
+    price: 820,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 12,
+  },
+  {
+    id: "p048",
+    barcode: "8900000010048",
+    sku: "WI-FCB-750",
+    name: "Fratelli Chenin Blanc 750ml",
+    brand: "Fratelli",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 790,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 10,
+  },
+  {
+    id: "p049",
+    barcode: "8900000010049",
+    sku: "WI-GZLR-750",
+    name: "Grover Zampa La Réserve 750ml",
+    brand: "Grover Zampa",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 760,
+    price: 1100,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 9,
+  },
+  {
+    id: "p050",
+    barcode: "8900000010050",
+    sku: "WI-GZAC-750",
+    name: "Grover Zampa Art Collection 750ml",
+    brand: "Grover Zampa",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 650,
+    price: 950,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 8,
+  },
+];
diff --git a/src/index.css b/src/index.css
index 2c84af0..32891a8 100644
--- a/src/index.css
+++ b/src/index.css
@@ -1,111 +1,986 @@
-:root {
-  --text: #6b6375;
-  --text-h: #08060d;
-  --bg: #fff;
-  --border: #e5e4e7;
-  --code-bg: #f4f3ec;
-  --accent: #aa3bff;
-  --accent-bg: rgba(170, 59, 255, 0.1);
-  --accent-border: rgba(170, 59, 255, 0.5);
-  --social-bg: rgba(244, 243, 236, 0.5);
-  --shadow:
-    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
-
-  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
-  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
-  --mono: ui-monospace, Consolas, monospace;
-
-  font: 18px/145% var(--sans);
-  letter-spacing: 0.18px;
-  color-scheme: light dark;
-  color: var(--text);
-  background: var(--bg);
-  font-synthesis: none;
-  text-rendering: optimizeLegibility;
-  -webkit-font-smoothing: antialiased;
-  -moz-osx-font-smoothing: grayscale;
-
-  @media (max-width: 1024px) {
-    font-size: 16px;
-  }
-}
-
-@media (prefers-color-scheme: dark) {
-  :root {
-    --text: #9ca3af;
-    --text-h: #f3f4f6;
-    --bg: #16171d;
-    --border: #2e303a;
-    --code-bg: #1f2028;
-    --accent: #c084fc;
-    --accent-bg: rgba(192, 132, 252, 0.15);
-    --accent-border: rgba(192, 132, 252, 0.5);
-    --social-bg: rgba(47, 48, 58, 0.5);
-    --shadow:
-      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
-  }
-
-  #social .button-icon {
-    filter: invert(1) brightness(2);
-  }
+* {
+  box-sizing: border-box;
+}
+
+html,
+body,
+#root {
+  min-height: 100%;
+  margin: 0;
 }
 
 body {
+  font-family:
+    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
+    "Segoe UI", sans-serif;
+  background: #f4f5f7;
+  color: #17181c;
+}
+
+button,
+input {
+  font: inherit;
+}
+
+button {
+  cursor: pointer;
+}
+
+.app-shell {
+  display: flex;
+  min-height: 100vh;
+}
+
+.sidebar {
+  position: fixed;
+  inset: 0 auto 0 0;
+  width: 250px;
+  display: flex;
+  flex-direction: column;
+  background: #23111b;
+  color: #fff;
+  z-index: 20;
+}
+
+.brand {
+  display: flex;
+  align-items: center;
+  gap: 12px;
+  padding: 24px 21px;
+  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
+}
+
+.brand-icon {
+  width: 44px;
+  height: 44px;
+  display: grid;
+  place-items: center;
+  border-radius: 12px;
+  background: #8e244d;
+}
+
+.brand-name {
+  font-weight: 800;
+  letter-spacing: -0.3px;
+}
+
+.brand-subtitle {
+  margin-top: 2px;
+  font-size: 12px;
+  color: #c6b5bd;
+}
+
+.nav-menu {
+  display: flex;
+  flex-direction: column;
+  gap: 5px;
+  padding: 19px 12px;
+  flex: 1;
+}
+
+.nav-item {
+  display: flex;
+  align-items: center;
+  gap: 12px;
+  min-height: 45px;
+  padding: 0 13px;
+  border-radius: 9px;
+  color: #cdbfc5;
+  text-decoration: none;
+  font-size: 14px;
+  font-weight: 600;
+}
+
+.nav-item:hover {
+  background: rgba(255, 255, 255, 0.06);
+  color: #fff;
+}
+
+.nav-item.active {
+  background: #8e244d;
+  color: #fff;
+}
+
+.sidebar-footer {
+  margin: 14px;
+  padding: 14px;
+  display: flex;
+  align-items: center;
+  gap: 10px;
+  border-radius: 10px;
+  background: rgba(255, 255, 255, 0.06);
+}
+
+.sidebar-footer div {
+  display: flex;
+  flex-direction: column;
+}
+
+.sidebar-footer strong {
+  font-size: 13px;
+}
+
+.sidebar-footer span {
+  color: #c6b5bd;
+  font-size: 11px;
+  margin-top: 2px;
+}
+
+.main-area {
+  width: calc(100% - 250px);
+  margin-left: 250px;
+}
+
+.topbar {
+  height: 75px;
+  padding: 0 30px;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  background: #fff;
+  border-bottom: 1px solid #e7e8eb;
+}
+
+.topbar h1 {
   margin: 0;
+  font-size: 17px;
 }
 
-#root {
-  width: 1126px;
-  max-width: 100%;
-  margin: 0 auto;
+.topbar p {
+  margin: 3px 0 0;
+  color: #8a8c94;
+  font-size: 12px;
+}
+
+.user-pill {
+  display: flex;
+  align-items: center;
+  gap: 10px;
+}
+
+.avatar {
+  width: 38px;
+  height: 38px;
+  border-radius: 50%;
+  display: grid;
+  place-items: center;
+  color: #fff;
+  font-weight: 800;
+  background: #8e244d;
+}
+
+.user-pill > div:last-child {
+  display: flex;
+  flex-direction: column;
+}
+
+.user-pill strong {
+  font-size: 13px;
+}
+
+.user-pill span {
+  color: #8a8c94;
+  font-size: 11px;
+}
+
+.page-area {
+  padding: 28px;
+}
+
+.page-heading {
+  margin-bottom: 22px;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 20px;
+}
+
+.page-heading h2 {
+  margin: 0;
+  font-size: 25px;
+  letter-spacing: -0.5px;
+}
+
+.page-heading p {
+  margin: 5px 0 0;
+  color: #787b83;
+  font-size: 13px;
+}
+
+.page-actions {
+  display: flex;
+  gap: 9px;
+}
+
+.panel {
+  background: #fff;
+  border: 1px solid #e5e6e9;
+  border-radius: 13px;
+  padding: 20px;
+  box-shadow: 0 2px 7px rgba(28, 23, 26, 0.025);
+}
+
+.panel-header {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 15px;
+  margin-bottom: 17px;
+}
+
+.panel-header h3,
+.panel h3 {
+  margin: 0;
+  font-size: 16px;
+}
+
+.panel-header p,
+.panel > p {
+  margin: 4px 0 0;
+  color: #8a8c94;
+  font-size: 12px;
+}
+
+.stats-grid {
+  display: grid;
+  grid-template-columns: repeat(4, minmax(0, 1fr));
+  gap: 16px;
+  margin-bottom: 18px;
+}
+
+.stat-card {
+  position: relative;
+  min-height: 145px;
+  padding: 20px;
+  border-radius: 13px;
+  background: #fff;
+  border: 1px solid #e5e6e9;
+}
+
+.stat-icon {
+  width: 39px;
+  height: 39px;
+  display: grid;
+  place-items: center;
+  border-radius: 10px;
+  margin-bottom: 17px;
+  background: #f5e9ee;
+  color: #8e244d;
+}
+
+.stat-label {
+  color: #73767d;
+  font-size: 12px;
+  font-weight: 600;
+}
+
+.stat-value {
+  margin-top: 3px;
+  font-size: 25px;
+  font-weight: 800;
+  letter-spacing: -0.5px;
+}
+
+.stat-note {
+  margin-top: 5px;
+  color: #97999f;
+  font-size: 11px;
+}
+
+.dashboard-grid {
+  display: grid;
+  grid-template-columns: 1.4fr 1fr;
+  gap: 18px;
+}
+
+.simple-list {
+  display: flex;
+  flex-direction: column;
+}
+
+.simple-list-row {
+  padding: 13px 0;
+  display: flex;
+  justify-content: space-between;
+  gap: 15px;
+  border-bottom: 1px solid #f0f0f1;
+}
+
+.simple-list-row:last-child {
+  border-bottom: 0;
+}
+
+.simple-list-row > div {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.simple-list-row strong {
+  font-size: 13px;
+}
+
+.simple-list-row span {
+  color: #8d8f96;
+  font-size: 11px;
+}
+
+.align-right {
+  text-align: right;
+}
+
+.stock-low {
+  color: #b42318;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.empty-state {
+  padding: 25px 5px;
+  color: #8a8c94;
+  font-size: 13px;
   text-align: center;
-  border-inline: 1px solid var(--border);
-  min-height: 100svh;
+}
+
+.large-empty-state {
+  min-height: 350px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  gap: 5px;
+  text-align: center;
+  color: #96989e;
+}
+
+.large-empty-state h3 {
+  margin-top: 10px;
+  color: #33353a;
+}
+
+.large-empty-state p {
+  margin: 0;
+}
+
+.demo-note {
+  margin-top: 17px;
+  padding: 11px 14px;
+  border-radius: 8px;
+  background: #fff8e6;
+  border: 1px solid #f3dfac;
+  color: #775d1c;
+  font-size: 11px;
+}
+
+.pos-layout {
+  display: grid;
+  grid-template-columns: minmax(0, 1fr) 330px;
+  gap: 18px;
+  align-items: start;
+}
+
+.pos-left {
   display: flex;
   flex-direction: column;
-  box-sizing: border-box;
+  gap: 17px;
 }
 
-h1,
-h2 {
-  font-family: var(--heading);
-  font-weight: 500;
-  color: var(--text-h);
+.input-label {
+  margin-bottom: 9px;
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  font-size: 13px;
+  font-weight: 700;
 }
 
-h1 {
-  font-size: 56px;
-  letter-spacing: -1.68px;
-  margin: 32px 0;
-  @media (max-width: 1024px) {
-    font-size: 36px;
-    margin: 20px 0;
-  }
+.barcode-input-row {
+  display: flex;
+  gap: 9px;
 }
-h2 {
-  font-size: 24px;
-  line-height: 118%;
-  letter-spacing: -0.24px;
-  margin: 0 0 8px;
-  @media (max-width: 1024px) {
-    font-size: 20px;
-  }
+
+.barcode-input,
+.search-input,
+.settings-fields input {
+  width: 100%;
+  height: 45px;
+  padding: 0 13px;
+  border: 1px solid #dcdde0;
+  border-radius: 9px;
+  outline: none;
+  background: #fff;
+}
+
+.barcode-input {
+  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
+  letter-spacing: 1px;
+}
+
+.barcode-input:focus,
+.search-input:focus {
+  border-color: #8e244d;
+  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.09);
+}
+
+.primary-button,
+.secondary-button,
+.danger-button {
+  min-height: 42px;
+  padding: 0 16px;
+  border-radius: 8px;
+  font-weight: 700;
+  border: 0;
+}
+
+.primary-button {
+  background: #8e244d;
+  color: #fff;
+}
+
+.primary-button:hover {
+  background: #761d40;
+}
+
+.secondary-button {
+  background: #fff;
+  border: 1px solid #dcdde0;
+}
+
+.pos-message {
+  margin-top: 12px;
+  padding: 9px 11px;
+  border-radius: 7px;
+  font-size: 12px;
+}
+
+.pos-message.info {
+  background: #edf4ff;
+  color: #315883;
+}
+
+.pos-message.success {
+  background: #eaf8ee;
+  color: #246b39;
+}
+
+.pos-message.error {
+  background: #fff0ef;
+  color: #a12b23;
+}
+
+.search-results {
+  margin-top: 10px;
+  border: 1px solid #e2e3e5;
+  border-radius: 9px;
+  overflow: hidden;
+}
+
+.search-result {
+  width: 100%;
+  padding: 11px 13px;
+  border: 0;
+  border-bottom: 1px solid #ededee;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  background: #fff;
+  text-align: left;
+}
+
+.search-result:last-child {
+  border-bottom: 0;
+}
+
+.search-result:hover {
+  background: #faf7f8;
+}
+
+.search-result > div,
+.search-result-right {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.search-result strong {
+  font-size: 12px;
+}
+
+.search-result span {
+  color: #8a8c94;
+  font-size: 10px;
+}
+
+.search-result-right {
+  text-align: right;
+}
+
+.text-button {
+  padding: 0;
+  border: 0;
+  background: transparent;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.danger-text {
+  color: #b42318;
+}
+
+.cart-empty {
+  min-height: 190px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  gap: 4px;
+  color: #a5a6aa;
+}
+
+.cart-empty strong {
+  margin-top: 8px;
+  color: #55575c;
+}
+
+.cart-empty span {
+  font-size: 12px;
+}
+
+.cart-table {
+  display: flex;
+  flex-direction: column;
+}
+
+.cart-row {
+  display: grid;
+  grid-template-columns: minmax(190px, 1fr) 120px 120px 35px;
+  gap: 14px;
+  align-items: center;
+  padding: 13px 0;
+  border-bottom: 1px solid #ededee;
+}
+
+.cart-row:last-child {
+  border-bottom: 0;
+}
+
+.cart-product,
+.cart-price {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.cart-product strong {
+  font-size: 13px;
+}
+
+.cart-product span,
+.cart-price span {
+  color: #8e9097;
+  font-size: 10px;
+}
+
+.cart-price {
+  text-align: right;
+}
+
+.quantity-control {
+  height: 34px;
+  display: grid;
+  grid-template-columns: 34px 1fr 34px;
+  align-items: center;
+  border: 1px solid #dedfe2;
+  border-radius: 7px;
+  overflow: hidden;
+}
+
+.quantity-control button {
+  height: 100%;
+  border: 0;
+  display: grid;
+  place-items: center;
+  background: #f6f6f7;
+}
+
+.quantity-control strong {
+  text-align: center;
+  font-size: 12px;
+}
+
+.icon-button {
+  width: 33px;
+  height: 33px;
+  display: grid;
+  place-items: center;
+  border: 0;
+  border-radius: 7px;
+  background: transparent;
+}
+
+.icon-button.danger {
+  color: #b42318;
+}
+
+.icon-button:hover {
+  background: #f7f7f8;
+}
+
+.checkout-panel {
+  position: sticky;
+  top: 94px;
+  padding: 21px;
+  border-radius: 13px;
+  background: #23111b;
+  color: #fff;
 }
-p {
+
+.checkout-panel h3 {
   margin: 0;
+  font-size: 18px;
+}
+
+.checkout-panel > div:first-child p {
+  margin: 4px 0 0;
+  color: #bbaeb4;
+  font-size: 11px;
+}
+
+.bill-lines {
+  margin-top: 23px;
+  padding: 16px 0;
+  display: flex;
+  flex-direction: column;
+  gap: 12px;
+  border-top: 1px solid rgba(255, 255, 255, 0.11);
+  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
+}
+
+.bill-lines > div,
+.grand-total {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+}
+
+.bill-lines span {
+  color: #bbaeb4;
+  font-size: 12px;
+}
+
+.bill-lines strong {
+  font-size: 13px;
+}
+
+.grand-total {
+  padding: 19px 0;
 }
 
-code,
-.counter {
-  font-family: var(--mono);
-  display: inline-flex;
-  border-radius: 4px;
-  color: var(--text-h);
+.grand-total span {
+  font-size: 13px;
 }
 
-code {
-  font-size: 15px;
-  line-height: 135%;
-  padding: 4px 8px;
-  background: var(--code-bg);
+.grand-total strong {
+  font-size: 26px;
+}
+
+.payment-title {
+  margin-bottom: 9px;
+  color: #cdbfc5;
+  font-size: 11px;
+  font-weight: 700;
+}
+
+.payment-options {
+  display: grid;
+  grid-template-columns: repeat(3, 1fr);
+  gap: 7px;
+}
+
+.payment-button {
+  min-height: 67px;
+  border: 1px solid rgba(255, 255, 255, 0.13);
+  border-radius: 8px;
+  display: grid;
+  place-items: center;
+  gap: 4px;
+  background: rgba(255, 255, 255, 0.05);
+  color: #d9cfd3;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.payment-button.selected {
+  border-color: #d85d8c;
+  background: #8e244d;
+  color: #fff;
+}
+
+.complete-sale {
+  width: 100%;
+  margin-top: 17px;
+  padding: 14px;
+  border: 0;
+  border-radius: 9px;
+  display: flex;
+  justify-content: space-between;
+  background: #cf477b;
+  color: #fff;
+  font-weight: 800;
+}
+
+.complete-sale:disabled {
+  opacity: 0.45;
+  cursor: not-allowed;
+}
+
+.test-barcode-box {
+  margin-top: 19px;
+  padding: 12px;
+  display: flex;
+  flex-direction: column;
+  gap: 4px;
+  border-radius: 8px;
+  background: rgba(255, 255, 255, 0.06);
+}
+
+.test-barcode-box strong {
+  font-size: 11px;
+}
+
+.test-barcode-box span {
+  color: #bbaeb4;
+  font-size: 10px;
+}
+
+.test-barcode-box code {
+  padding: 5px 7px;
+  border-radius: 5px;
+  background: rgba(0, 0, 0, 0.22);
+  color: #f4bdd2;
+}
+
+.cart-count {
+  padding: 8px 11px;
+  border-radius: 8px;
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  background: #fff;
+  border: 1px solid #e3e4e6;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.table-toolbar {
+  margin-bottom: 17px;
+}
+
+.table-search {
+  max-width: 430px;
+  height: 42px;
+  padding: 0 12px;
+  display: flex;
+  align-items: center;
+  gap: 8px;
+  border: 1px solid #dedfe2;
+  border-radius: 8px;
+}
+
+.table-search input {
+  width: 100%;
+  border: 0;
+  outline: 0;
+}
+
+.data-table-wrapper {
+  overflow-x: auto;
+}
+
+.data-table {
+  width: 100%;
+  border-collapse: collapse;
+}
+
+.data-table th {
+  padding: 11px 12px;
+  text-align: left;
+  background: #f7f7f8;
+  color: #7c7e84;
+  border-bottom: 1px solid #e4e5e7;
+  font-size: 10px;
+  text-transform: uppercase;
+  letter-spacing: 0.5px;
+}
+
+.data-table td {
+  padding: 12px;
+  border-bottom: 1px solid #eeeeef;
+  font-size: 12px;
+  vertical-align: middle;
+}
+
+.data-table tbody tr:hover {
+  background: #fcfafb;
+}
+
+.table-product {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.table-product span {
+  color: #919399;
+  font-size: 10px;
+}
+
+.category-badge {
+  padding: 5px 8px;
+  border-radius: 999px;
+  background: #f2edf0;
+  color: #673249;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.mono {
+  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
+}
+
+.stock-status {
+  padding: 5px 8px;
+  border-radius: 999px;
+  font-size: 9px;
+  font-weight: 800;
+}
+
+.stock-status.good {
+  background: #e8f6ec;
+  color: #26703b;
+}
+
+.stock-status.low {
+  background: #ffeceb;
+  color: #a62b23;
+}
+
+.coming-soon {
+  min-height: 350px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  text-align: center;
+}
+
+.settings-grid {
+  display: grid;
+  grid-template-columns: 1fr 1fr;
+  gap: 18px;
+}
+
+.settings-fields {
+  margin-top: 20px;
+  display: grid;
+  gap: 14px;
+}
+
+.settings-fields label {
+  display: grid;
+  gap: 6px;
+  color: #76787f;
+  font-size: 11px;
+  font-weight: 700;
+}
+
+.settings-fields input {
+  color: #4f5157;
+  background: #f8f8f9;
+}
+
+.danger-zone {
+  border-color: #efc7c3;
+}
+
+.danger-zone p {
+  margin: 9px 0 18px;
+}
+
+.danger-button {
+  display: flex;
+  align-items: center;
+  gap: 8px;
+  background: #b42318;
+  color: #fff;
+}
+
+@media (max-width: 1100px) {
+  .stats-grid {
+    grid-template-columns: repeat(2, 1fr);
+  }
+
+  .dashboard-grid,
+  .settings-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .pos-layout {
+    grid-template-columns: 1fr;
+  }
+
+  .checkout-panel {
+    position: static;
+  }
+}
+
+@media (max-width: 780px) {
+  .sidebar {
+    width: 72px;
+  }
+
+  .brand {
+    padding: 16px 14px;
+  }
+
+  .brand > div:last-child,
+  .nav-item span,
+  .sidebar-footer div {
+    display: none;
+  }
+
+  .nav-item {
+    justify-content: center;
+  }
+
+  .sidebar-footer {
+    justify-content: center;
+  }
+
+  .main-area {
+    width: calc(100% - 72px);
+    margin-left: 72px;
+  }
+
+  .topbar {
+    padding: 0 16px;
+  }
+
+  .page-area {
+    padding: 18px;
+  }
+
+  .stats-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .cart-row {
+    grid-template-columns: 1fr;
+  }
+
+  .cart-price {
+    text-align: left;
+  }
+
+  .page-heading {
+    align-items: flex-start;
+    flex-direction: column;
+  }
 }
diff --git a/src/main.jsx b/src/main.jsx
index b9a1a6d..6d9c6de 100644
--- a/src/main.jsx
+++ b/src/main.jsx
@@ -1,10 +1,16 @@
-import { StrictMode } from 'react'
-import { createRoot } from 'react-dom/client'
-import './index.css'
-import App from './App.jsx'
+import { StrictMode } from "react";
+import { createRoot } from "react-dom/client";
+import { BrowserRouter } from "react-router-dom";
+import App from "./App";
+import { ShopProvider } from "./context/ShopContext";
+import "./index.css";
 
-createRoot(document.getElementById('root')).render(
+createRoot(document.getElementById("root")).render(
   <StrictMode>
-    <App />
-  </StrictMode>,
-)
+    <BrowserRouter>
+      <ShopProvider>
+        <App />
+      </ShopProvider>
+    </BrowserRouter>
+  </StrictMode>
+);
diff --git a/src/pages/Dashboard.jsx b/src/pages/Dashboard.jsx
new file mode 100644
index 0000000..073cffe
--- /dev/null
+++ b/src/pages/Dashboard.jsx
@@ -0,0 +1,165 @@
+import {
+  IndianRupee,
+  PackageCheck,
+  ReceiptText,
+  TriangleAlert,
+} from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Dashboard() {
+  const { products, sales, getStock } = useShop();
+
+  const today = new Date().toDateString();
+
+  const todaysSales = sales.filter(
+    (sale) => new Date(sale.createdAt).toDateString() === today
+  );
+
+  const revenue = todaysSales.reduce(
+    (total, sale) => total + sale.grandTotal,
+    0
+  );
+
+  const averageBill = todaysSales.length
+    ? revenue / todaysSales.length
+    : 0;
+
+  const lowStockProducts = products.filter(
+    (product) => getStock(product.id) <= product.minimumStock
+  );
+
+  const inventoryValue = products.reduce(
+    (total, product) =>
+      total + getStock(product.id) * product.purchasePrice,
+    0
+  );
+
+  const cards = [
+    {
+      label: "Today's Sales",
+      value: money.format(revenue),
+      icon: IndianRupee,
+      note: "Revenue today",
+    },
+    {
+      label: "Bills Today",
+      value: todaysSales.length,
+      icon: ReceiptText,
+      note: `Avg ${money.format(averageBill)}`,
+    },
+    {
+      label: "Low Stock",
+      value: lowStockProducts.length,
+      icon: TriangleAlert,
+      note: "Needs attention",
+    },
+    {
+      label: "Inventory Value",
+      value: money.format(inventoryValue),
+      icon: PackageCheck,
+      note: "At purchase cost",
+    },
+  ];
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Dashboard</h2>
+          <p>Store overview and today's performance</p>
+        </div>
+      </div>
+
+      <div className="stats-grid">
+        {cards.map((card) => {
+          const Icon = card.icon;
+
+          return (
+            <div className="stat-card" key={card.label}>
+              <div className="stat-icon">
+                <Icon size={21} />
+              </div>
+
+              <div className="stat-label">{card.label}</div>
+              <div className="stat-value">{card.value}</div>
+              <div className="stat-note">{card.note}</div>
+            </div>
+          );
+        })}
+      </div>
+
+      <div className="dashboard-grid">
+        <section className="panel">
+          <div className="panel-header">
+            <div>
+              <h3>Recent Sales</h3>
+              <p>Latest completed bills</p>
+            </div>
+          </div>
+
+          {sales.length === 0 ? (
+            <div className="empty-state">
+              No sales yet. Open POS and complete your first bill.
+            </div>
+          ) : (
+            <div className="simple-list">
+              {sales.slice(0, 7).map((sale) => (
+                <div className="simple-list-row" key={sale.id}>
+                  <div>
+                    <strong>{sale.invoiceNumber}</strong>
+                    <span>
+                      {new Date(sale.createdAt).toLocaleString("en-IN")}
+                    </span>
+                  </div>
+
+                  <div className="align-right">
+                    <strong>{money.format(sale.grandTotal)}</strong>
+                    <span>{sale.paymentMethod}</span>
+                  </div>
+                </div>
+              ))}
+            </div>
+          )}
+        </section>
+
+        <section className="panel">
+          <div className="panel-header">
+            <div>
+              <h3>Low Stock Products</h3>
+              <p>Products at or below minimum level</p>
+            </div>
+          </div>
+
+          {lowStockProducts.length === 0 ? (
+            <div className="empty-state">No low-stock products.</div>
+          ) : (
+            <div className="simple-list">
+              {lowStockProducts.slice(0, 8).map((product) => (
+                <div className="simple-list-row" key={product.id}>
+                  <div>
+                    <strong>{product.name}</strong>
+                    <span>{product.category}</span>
+                  </div>
+
+                  <div className="stock-low">
+                    {getStock(product.id)} left
+                  </div>
+                </div>
+              ))}
+            </div>
+          )}
+        </section>
+      </div>
+
+      <div className="demo-note">
+        Development mode: product prices and barcodes are dummy test data.
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Inventory.jsx b/src/pages/Inventory.jsx
new file mode 100644
index 0000000..e36c169
--- /dev/null
+++ b/src/pages/Inventory.jsx
@@ -0,0 +1,115 @@
+import { useMemo, useState } from "react";
+import { Search } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Inventory() {
+  const { products, getStock } = useShop();
+  const [search, setSearch] = useState("");
+
+  const filteredProducts = useMemo(() => {
+    const value = search.toLowerCase().trim();
+
+    return products.filter((product) => {
+      if (!value) {
+        return true;
+      }
+
+      return (
+        product.name.toLowerCase().includes(value) ||
+        product.brand.toLowerCase().includes(value) ||
+        product.barcode.includes(value)
+      );
+    });
+  }, [products, search]);
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Inventory</h2>
+          <p>Current local stock levels</p>
+        </div>
+
+        <div className="page-actions">
+          <button className="secondary-button">+ Receive Stock</button>
+          <button className="primary-button">+ New Product</button>
+        </div>
+      </div>
+
+      <div className="panel">
+        <div className="table-toolbar">
+          <div className="table-search">
+            <Search size={18} />
+
+            <input
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search inventory..."
+            />
+          </div>
+        </div>
+
+        <div className="data-table-wrapper">
+          <table className="data-table">
+            <thead>
+              <tr>
+                <th>Product</th>
+                <th>Category</th>
+                <th>Barcode</th>
+                <th>Current Stock</th>
+                <th>Minimum</th>
+                <th>Status</th>
+                <th>Inventory Value</th>
+              </tr>
+            </thead>
+
+            <tbody>
+              {filteredProducts.map((product) => {
+                const stock = getStock(product.id);
+                const low = stock <= product.minimumStock;
+
+                return (
+                  <tr key={product.id}>
+                    <td>
+                      <div className="table-product">
+                        <strong>{product.name}</strong>
+                        <span>{product.size}</span>
+                      </div>
+                    </td>
+
+                    <td>{product.category}</td>
+                    <td className="mono">{product.barcode}</td>
+                    <td>
+                      <strong>{stock}</strong>
+                    </td>
+                    <td>{product.minimumStock}</td>
+                    <td>
+                      <span
+                        className={
+                          low
+                            ? "stock-status low"
+                            : "stock-status good"
+                        }
+                      >
+                        {low ? "LOW STOCK" : "IN STOCK"}
+                      </span>
+                    </td>
+                    <td>
+                      {money.format(stock * product.purchasePrice)}
+                    </td>
+                  </tr>
+                );
+              })}
+            </tbody>
+          </table>
+        </div>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/POS.jsx b/src/pages/POS.jsx
new file mode 100644
index 0000000..ef38367
--- /dev/null
+++ b/src/pages/POS.jsx
@@ -0,0 +1,444 @@
+import { useEffect, useMemo, useRef, useState } from "react";
+import {
+  Banknote,
+  CreditCard,
+  Minus,
+  Plus,
+  ScanBarcode,
+  Search,
+  ShoppingCart,
+  Smartphone,
+  Trash2,
+} from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function POS() {
+  const { products, getStock, completeSale } = useShop();
+
+  const [barcode, setBarcode] = useState("");
+  const [search, setSearch] = useState("");
+  const [cart, setCart] = useState([]);
+  const [paymentMethod, setPaymentMethod] = useState("CASH");
+  const [message, setMessage] = useState(
+    "Ready to scan. Try barcode 8900000010016"
+  );
+  const [messageType, setMessageType] = useState("info");
+
+  const barcodeRef = useRef(null);
+
+  useEffect(() => {
+    barcodeRef.current?.focus();
+  }, []);
+
+  const searchResults = useMemo(() => {
+    const value = search.trim().toLowerCase();
+
+    if (!value) {
+      return [];
+    }
+
+    return products
+      .filter(
+        (product) =>
+          product.name.toLowerCase().includes(value) ||
+          product.brand.toLowerCase().includes(value) ||
+          product.sku.toLowerCase().includes(value) ||
+          product.barcode.includes(value)
+      )
+      .slice(0, 8);
+  }, [search, products]);
+
+  function currentCartQuantity(productId) {
+    return (
+      cart.find((item) => item.product.id === productId)?.quantity || 0
+    );
+  }
+
+  function addProduct(product) {
+    const available = getStock(product.id);
+    const alreadyInCart = currentCartQuantity(product.id);
+
+    if (available <= 0) {
+      setMessage(`${product.name} is OUT OF STOCK.`);
+      setMessageType("error");
+      return;
+    }
+
+    if (alreadyInCart + 1 > available) {
+      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
+      setMessageType("error");
+      return;
+    }
+
+    setCart((currentCart) => {
+      const existing = currentCart.find(
+        (item) => item.product.id === product.id
+      );
+
+      if (existing) {
+        return currentCart.map((item) =>
+          item.product.id === product.id
+            ? { ...item, quantity: item.quantity + 1 }
+            : item
+        );
+      }
+
+      return [...currentCart, { product, quantity: 1 }];
+    });
+
+    setMessage(`${product.name} added to cart.`);
+    setMessageType("success");
+  }
+
+  function handleBarcodeSubmit(event) {
+    event.preventDefault();
+
+    const scannedBarcode = barcode.trim();
+
+    if (!scannedBarcode) {
+      return;
+    }
+
+    const product = products.find(
+      (item) => item.barcode === scannedBarcode
+    );
+
+    if (!product) {
+      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
+      setMessageType("error");
+    } else {
+      addProduct(product);
+    }
+
+    setBarcode("");
+
+    requestAnimationFrame(() => {
+      barcodeRef.current?.focus();
+    });
+  }
+
+  function changeQuantity(productId, delta) {
+    const item = cart.find(
+      (cartItem) => cartItem.product.id === productId
+    );
+
+    if (!item) {
+      return;
+    }
+
+    const newQuantity = item.quantity + delta;
+
+    if (newQuantity <= 0) {
+      removeItem(productId);
+      return;
+    }
+
+    const available = getStock(productId);
+
+    if (newQuantity > available) {
+      setMessage(`Only ${available} unit(s) available.`);
+      setMessageType("error");
+      return;
+    }
+
+    setCart((currentCart) =>
+      currentCart.map((cartItem) =>
+        cartItem.product.id === productId
+          ? { ...cartItem, quantity: newQuantity }
+          : cartItem
+      )
+    );
+  }
+
+  function removeItem(productId) {
+    setCart((currentCart) =>
+      currentCart.filter(
+        (item) => item.product.id !== productId
+      )
+    );
+  }
+
+  const subtotal = cart.reduce(
+    (total, item) => total + item.product.price * item.quantity,
+    0
+  );
+
+  const itemCount = cart.reduce(
+    (total, item) => total + item.quantity,
+    0
+  );
+
+  function handleCompleteSale() {
+    const result = completeSale(cart, paymentMethod);
+
+    if (!result.ok) {
+      setMessage(result.message);
+      setMessageType("error");
+      return;
+    }
+
+    setMessage(
+      `${result.sale.invoiceNumber} completed successfully for ${money.format(
+        result.sale.grandTotal
+      )}.`
+    );
+    setMessageType("success");
+    setCart([]);
+    setSearch("");
+
+    requestAnimationFrame(() => {
+      barcodeRef.current?.focus();
+    });
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>POS Billing</h2>
+          <p>Scan barcode or search a product manually</p>
+        </div>
+
+        <div className="cart-count">
+          <ShoppingCart size={18} />
+          {itemCount} item(s)
+        </div>
+      </div>
+
+      <div className="pos-layout">
+        <section className="pos-left">
+          <div className="panel barcode-panel">
+            <form onSubmit={handleBarcodeSubmit}>
+              <label className="input-label">
+                <ScanBarcode size={18} />
+                Scan Barcode
+              </label>
+
+              <div className="barcode-input-row">
+                <input
+                  ref={barcodeRef}
+                  className="barcode-input"
+                  value={barcode}
+                  onChange={(event) =>
+                    setBarcode(event.target.value)
+                  }
+                  placeholder="Scan barcode and press Enter"
+                  autoComplete="off"
+                />
+
+                <button className="primary-button" type="submit">
+                  Add
+                </button>
+              </div>
+            </form>
+
+            <div className={`pos-message ${messageType}`}>
+              {message}
+            </div>
+          </div>
+
+          <div className="panel">
+            <label className="input-label">
+              <Search size={18} />
+              Manual Product Search
+            </label>
+
+            <input
+              className="search-input"
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search by product, brand, SKU or barcode"
+            />
+
+            {searchResults.length > 0 && (
+              <div className="search-results">
+                {searchResults.map((product) => (
+                  <button
+                    type="button"
+                    className="search-result"
+                    key={product.id}
+                    onClick={() => addProduct(product)}
+                  >
+                    <div>
+                      <strong>{product.name}</strong>
+                      <span>
+                        {product.barcode} · {product.sku}
+                      </span>
+                    </div>
+
+                    <div className="search-result-right">
+                      <strong>{money.format(product.price)}</strong>
+                      <span>Stock: {getStock(product.id)}</span>
+                    </div>
+                  </button>
+                ))}
+              </div>
+            )}
+          </div>
+
+          <div className="panel">
+            <div className="panel-header">
+              <div>
+                <h3>Current Cart</h3>
+                <p>Products added to this bill</p>
+              </div>
+
+              {cart.length > 0 && (
+                <button
+                  className="text-button danger-text"
+                  onClick={() => setCart([])}
+                >
+                  Clear Cart
+                </button>
+              )}
+            </div>
+
+            {cart.length === 0 ? (
+              <div className="cart-empty">
+                <ShoppingCart size={42} />
+                <strong>Cart is empty</strong>
+                <span>Scan a barcode to begin billing.</span>
+              </div>
+            ) : (
+              <div className="cart-table">
+                {cart.map((item) => (
+                  <div className="cart-row" key={item.product.id}>
+                    <div className="cart-product">
+                      <strong>{item.product.name}</strong>
+                      <span>
+                        {item.product.barcode} · Stock{" "}
+                        {getStock(item.product.id)}
+                      </span>
+                    </div>
+
+                    <div className="quantity-control">
+                      <button
+                        onClick={() =>
+                          changeQuantity(item.product.id, -1)
+                        }
+                      >
+                        <Minus size={16} />
+                      </button>
+
+                      <strong>{item.quantity}</strong>
+
+                      <button
+                        onClick={() =>
+                          changeQuantity(item.product.id, 1)
+                        }
+                      >
+                        <Plus size={16} />
+                      </button>
+                    </div>
+
+                    <div className="cart-price">
+                      <span>{money.format(item.product.price)} each</span>
+                      <strong>
+                        {money.format(
+                          item.product.price * item.quantity
+                        )}
+                      </strong>
+                    </div>
+
+                    <button
+                      className="icon-button danger"
+                      onClick={() => removeItem(item.product.id)}
+                    >
+                      <Trash2 size={17} />
+                    </button>
+                  </div>
+                ))}
+              </div>
+            )}
+          </div>
+        </section>
+
+        <aside className="checkout-panel">
+          <div>
+            <h3>Bill Summary</h3>
+            <p>{itemCount} item(s)</p>
+          </div>
+
+          <div className="bill-lines">
+            <div>
+              <span>Subtotal</span>
+              <strong>{money.format(subtotal)}</strong>
+            </div>
+
+            <div>
+              <span>Discount</span>
+              <strong>{money.format(0)}</strong>
+            </div>
+          </div>
+
+          <div className="grand-total">
+            <span>Grand Total</span>
+            <strong>{money.format(subtotal)}</strong>
+          </div>
+
+          <div className="payment-title">Payment Method</div>
+
+          <div className="payment-options">
+            <button
+              className={
+                paymentMethod === "CASH"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("CASH")}
+            >
+              <Banknote size={21} />
+              CASH
+            </button>
+
+            <button
+              className={
+                paymentMethod === "UPI"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("UPI")}
+            >
+              <Smartphone size={21} />
+              UPI
+            </button>
+
+            <button
+              className={
+                paymentMethod === "CARD"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("CARD")}
+            >
+              <CreditCard size={21} />
+              CARD
+            </button>
+          </div>
+
+          <button
+            className="complete-sale"
+            onClick={handleCompleteSale}
+            disabled={cart.length === 0}
+          >
+            Complete Sale
+            <span>{money.format(subtotal)}</span>
+          </button>
+
+          <div className="test-barcode-box">
+            <strong>Test Scanner</strong>
+            <span>Try typing:</span>
+            <code>8900000010016</code>
+            <span>Then press Enter.</span>
+          </div>
+        </aside>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Placeholder.jsx b/src/pages/Placeholder.jsx
new file mode 100644
index 0000000..cd9af54
--- /dev/null
+++ b/src/pages/Placeholder.jsx
@@ -0,0 +1,19 @@
+export default function Placeholder({ title, description }) {
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>{title}</h2>
+          <p>{description}</p>
+        </div>
+      </div>
+
+      <div className="panel coming-soon">
+        <h3>{title}</h3>
+        <p>
+          This module is reserved for the next development chapters.
+        </p>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Products.jsx b/src/pages/Products.jsx
new file mode 100644
index 0000000..279103d
--- /dev/null
+++ b/src/pages/Products.jsx
@@ -0,0 +1,99 @@
+import { useMemo, useState } from "react";
+import { Search } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Products() {
+  const { products, getStock } = useShop();
+  const [search, setSearch] = useState("");
+
+  const filteredProducts = useMemo(() => {
+    const value = search.toLowerCase().trim();
+
+    if (!value) {
+      return products;
+    }
+
+    return products.filter(
+      (product) =>
+        product.name.toLowerCase().includes(value) ||
+        product.brand.toLowerCase().includes(value) ||
+        product.category.toLowerCase().includes(value) ||
+        product.barcode.includes(value) ||
+        product.sku.toLowerCase().includes(value)
+    );
+  }, [products, search]);
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Product Master</h2>
+          <p>{products.length} development products loaded</p>
+        </div>
+      </div>
+
+      <div className="panel">
+        <div className="table-toolbar">
+          <div className="table-search">
+            <Search size={18} />
+
+            <input
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search product, barcode, SKU or category"
+            />
+          </div>
+        </div>
+
+        <div className="data-table-wrapper">
+          <table className="data-table">
+            <thead>
+              <tr>
+                <th>Product</th>
+                <th>Barcode</th>
+                <th>SKU</th>
+                <th>Category</th>
+                <th>Stock</th>
+                <th>Selling Price</th>
+              </tr>
+            </thead>
+
+            <tbody>
+              {filteredProducts.map((product) => (
+                <tr key={product.id}>
+                  <td>
+                    <div className="table-product">
+                      <strong>{product.name}</strong>
+                      <span>{product.brand}</span>
+                    </div>
+                  </td>
+
+                  <td className="mono">{product.barcode}</td>
+                  <td>{product.sku}</td>
+                  <td>
+                    <span className="category-badge">
+                      {product.category}
+                    </span>
+                  </td>
+                  <td>{getStock(product.id)}</td>
+                  <td>{money.format(product.price)}</td>
+                </tr>
+              ))}
+            </tbody>
+          </table>
+        </div>
+      </div>
+
+      <div className="demo-note">
+        Barcodes and prices are dummy development values and are not official
+        product data.
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Sales.jsx b/src/pages/Sales.jsx
new file mode 100644
index 0000000..0525db6
--- /dev/null
+++ b/src/pages/Sales.jsx
@@ -0,0 +1,78 @@
+import { ReceiptText } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Sales() {
+  const { sales } = useShop();
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Sales History</h2>
+          <p>Completed local transactions</p>
+        </div>
+      </div>
+
+      <div className="panel">
+        {sales.length === 0 ? (
+          <div className="large-empty-state">
+            <ReceiptText size={48} />
+            <h3>No sales yet</h3>
+            <p>Complete a transaction from POS Billing.</p>
+          </div>
+        ) : (
+          <div className="data-table-wrapper">
+            <table className="data-table">
+              <thead>
+                <tr>
+                  <th>Invoice</th>
+                  <th>Date & Time</th>
+                  <th>Items</th>
+                  <th>Payment</th>
+                  <th>Total</th>
+                </tr>
+              </thead>
+
+              <tbody>
+                {sales.map((sale) => (
+                  <tr key={sale.id}>
+                    <td>
+                      <strong>{sale.invoiceNumber}</strong>
+                    </td>
+
+                    <td>
+                      {new Date(sale.createdAt).toLocaleString("en-IN")}
+                    </td>
+
+                    <td>
+                      {sale.items.reduce(
+                        (total, item) => total + item.quantity,
+                        0
+                      )}
+                    </td>
+
+                    <td>
+                      <span className="category-badge">
+                        {sale.paymentMethod}
+                      </span>
+                    </td>
+
+                    <td>
+                      <strong>{money.format(sale.grandTotal)}</strong>
+                    </td>
+                  </tr>
+                ))}
+              </tbody>
+            </table>
+          </div>
+        )}
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Settings.jsx b/src/pages/Settings.jsx
new file mode 100644
index 0000000..2cdfadf
--- /dev/null
+++ b/src/pages/Settings.jsx
@@ -0,0 +1,64 @@
+import { RotateCcw } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+export default function Settings() {
+  const { resetDemo } = useShop();
+
+  function handleReset() {
+    const confirmed = window.confirm(
+      "Reset inventory and delete all local demo sales?"
+    );
+
+    if (confirmed) {
+      resetDemo();
+      window.alert("Demo data has been reset.");
+    }
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Settings</h2>
+          <p>Prototype application settings</p>
+        </div>
+      </div>
+
+      <div className="settings-grid">
+        <section className="panel">
+          <h3>Store Information</h3>
+
+          <div className="settings-fields">
+            <label>
+              Store Name
+              <input value="Demo Wine Shop" readOnly />
+            </label>
+
+            <label>
+              Currency
+              <input value="INR (₹)" readOnly />
+            </label>
+
+            <label>
+              Data Mode
+              <input value="Browser LocalStorage" readOnly />
+            </label>
+          </div>
+        </section>
+
+        <section className="panel danger-zone">
+          <h3>Demo Data</h3>
+          <p>
+            Reset all inventory quantities back to opening stock and remove
+            local sales.
+          </p>
+
+          <button className="danger-button" onClick={handleReset}>
+            <RotateCcw size={18} />
+            Reset Demo Data
+          </button>
+        </section>
+      </div>
+    </div>
+  );
+}
```

## Exact source snapshot after this commit

The following files are read directly from the Git tree at this commit using `git show COMMIT:path`.

### `.gitattributes`

```text
* text=auto eol=lf
```

### `.gitignore`

```text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>wineshoppos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `package.json`

```json
{
  "name": "wineshoppos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.37.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

### `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

### `src/App.jsx`

```javascript
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Placeholder from "./pages/Placeholder";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="pos" element={<POS />} />

        <Route path="products" element={<Products />} />

        <Route path="inventory" element={<Inventory />} />

        <Route
          path="purchases"
          element={
            <Placeholder
              title="Purchases"
              description="Supplier purchases and receive-stock workflow"
            />
          }
        />

        <Route path="sales" element={<Sales />} />

        <Route
          path="reports"
          element={
            <Placeholder
              title="Reports"
              description="Sales, inventory and performance reporting"
            />
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

### `src/components/Layout.jsx`

```javascript
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
```

### `src/context/ShopContext.jsx`

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { products } from "../data/products";

const ShopContext = createContext(null);

const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";

function createInitialInventory() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
  } catch {
    saved = {};
  }

  return products.reduce((result, product) => {
    result[product.id] =
      typeof saved[product.id] === "number"
        ? saved[product.id]
        : product.openingStock;

    return result;
  }, {});
}

function createInitialSales() {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }) {
  const [inventory, setInventory] = useState(createInitialInventory);
  const [sales, setSales] = useState(createInitialSales);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  function getStock(productId) {
    return inventory[productId] ?? 0;
  }

  function completeSale(cart, paymentMethod) {
    if (!cart.length) {
      return {
        ok: false,
        message: "Cart is empty.",
      };
    }

    for (const item of cart) {
      const available = inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
        };
      }
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -= item.quantity;
    });

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;

    const sale = {
      id: crypto.randomUUID(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paymentMethod,
      subtotal,
      discount: 0,
      grandTotal: subtotal,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal: item.product.price * item.quantity,
      })),
    };

    setInventory(updatedInventory);
    setSales((currentSales) => [sale, ...currentSales]);

    return {
      ok: true,
      sale,
    };
  }

  function resetDemo() {
    const initialInventory = products.reduce((result, product) => {
      result[product.id] = product.openingStock;
      return result;
    }, {});

    setInventory(initialInventory);
    setSales([]);
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        getStock,
        completeSale,
        resetDemo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
```

### `src/data/products.js`

```javascript
export const products = [
  {
    id: "p001",
    barcode: "8900000010001",
    sku: "WH-RS-180",
    name: "Royal Stag 180ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 150,
    price: 210,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 48,
  },
  {
    id: "p002",
    barcode: "8900000010002",
    sku: "WH-RS-375",
    name: "Royal Stag 375ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 285,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p003",
    barcode: "8900000010003",
    sku: "WH-RS-750",
    name: "Royal Stag 750ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 540,
    price: 780,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 36,
  },
  {
    id: "p004",
    barcode: "8900000010004",
    sku: "WH-BP-375",
    name: "Blenders Pride 375ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 20,
  },
  {
    id: "p005",
    barcode: "8900000010005",
    sku: "WH-BP-750",
    name: "Blenders Pride 750ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1200,
    price: 1650,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p006",
    barcode: "8900000010006",
    sku: "WH-IB-180",
    name: "Imperial Blue 180ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 125,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 45,
  },
  {
    id: "p007",
    barcode: "8900000010007",
    sku: "WH-IB-375",
    name: "Imperial Blue 375ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 245,
    price: 350,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 32,
  },
  {
    id: "p008",
    barcode: "8900000010008",
    sku: "WH-IB-750",
    name: "Imperial Blue 750ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 460,
    price: 680,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 28,
  },
  {
    id: "p009",
    barcode: "8900000010009",
    sku: "WH-MD1-750",
    name: "McDowell's No.1 750ml",
    brand: "McDowell's",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 500,
    price: 730,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 30,
  },
  {
    id: "p010",
    barcode: "8900000010010",
    sku: "WH-RC-750",
    name: "Royal Challenge 750ml",
    brand: "Royal Challenge",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p011",
    barcode: "8900000010011",
    sku: "WH-SIG-750",
    name: "Signature Rare Aged 750ml",
    brand: "Signature",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 780,
    price: 1100,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },
  {
    id: "p012",
    barcode: "8900000010012",
    sku: "WH-AB-750",
    name: "Antiquity Blue 750ml",
    brand: "Antiquity",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1100,
    price: 1550,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 15,
  },
  {
    id: "p013",
    barcode: "8900000010013",
    sku: "WH-OC-750",
    name: "Officer's Choice 750ml",
    brand: "Officer's Choice",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 34,
  },
  {
    id: "p014",
    barcode: "8900000010014",
    sku: "WH-8PM-750",
    name: "8PM Whisky 750ml",
    brand: "8PM",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 430,
    price: 620,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 27,
  },

  {
    id: "p015",
    barcode: "8900000010015",
    sku: "BE-KFP-650",
    name: "Kingfisher Premium 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 105,
    price: 160,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 72,
  },
  {
    id: "p016",
    barcode: "8900000010016",
    sku: "BE-KFS-650",
    name: "Kingfisher Strong 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 180,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 84,
  },
  {
    id: "p017",
    barcode: "8900000010017",
    sku: "BE-KFU-330",
    name: "Kingfisher Ultra 330ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 95,
    price: 150,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 48,
  },
  {
    id: "p018",
    barcode: "8900000010018",
    sku: "BE-KFUM-650",
    name: "Kingfisher Ultra Max 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 150,
    price: 220,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 48,
  },
  {
    id: "p019",
    barcode: "8900000010019",
    sku: "BE-TS-650",
    name: "Tuborg Strong 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 125,
    price: 190,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 78,
  },
  {
    id: "p020",
    barcode: "8900000010020",
    sku: "BE-TG-650",
    name: "Tuborg Green 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 115,
    price: 175,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 60,
  },
  {
    id: "p021",
    barcode: "8900000010021",
    sku: "BE-BUD-330",
    name: "Budweiser Premium 330ml",
    brand: "Budweiser",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 110,
    price: 170,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 42,
  },
  {
    id: "p022",
    barcode: "8900000010022",
    sku: "BE-BM-500",
    name: "Budweiser Magnum 500ml",
    brand: "Budweiser",
    category: "Beer",
    size: "500 ml",
    purchasePrice: 135,
    price: 210,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 50,
  },
  {
    id: "p023",
    barcode: "8900000010023",
    sku: "BE-CE-650",
    name: "Carlsberg Elephant 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 130,
    price: 200,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 54,
  },
  {
    id: "p024",
    barcode: "8900000010024",
    sku: "BE-CS-650",
    name: "Carlsberg Smooth 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 185,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 55,
  },
  {
    id: "p025",
    barcode: "8900000010025",
    sku: "BE-HEI-330",
    name: "Heineken 330ml",
    brand: "Heineken",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 36,
  },
  {
    id: "p026",
    barcode: "8900000010026",
    sku: "BE-B91B-330",
    name: "Bira 91 Blonde 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 105,
    price: 165,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p027",
    barcode: "8900000010027",
    sku: "BE-B91W-330",
    name: "Bira 91 White 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 34,
  },

  {
    id: "p028",
    barcode: "8900000010028",
    sku: "RU-OM-180",
    name: "Old Monk 180ml",
    brand: "Old Monk",
    category: "Rum",
    size: "180 ml",
    purchasePrice: 130,
    price: 190,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 38,
  },
  {
    id: "p029",
    barcode: "8900000010029",
    sku: "RU-OM-375",
    name: "Old Monk 375ml",
    brand: "Old Monk",
    category: "Rum",
    size: "375 ml",
    purchasePrice: 260,
    price: 380,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p030",
    barcode: "8900000010030",
    sku: "RU-OM-750",
    name: "Old Monk 750ml",
    brand: "Old Monk",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 500,
    price: 720,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 31,
  },
  {
    id: "p031",
    barcode: "8900000010031",
    sku: "RU-MCR-750",
    name: "McDowell's Celebration Rum 750ml",
    brand: "McDowell's",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 430,
    price: 630,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p032",
    barcode: "8900000010032",
    sku: "RU-CON-750",
    name: "Contessa Rum 750ml",
    brand: "Contessa",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 410,
    price: 600,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 20,
  },

  {
    id: "p033",
    barcode: "8900000010033",
    sku: "VO-MM-180",
    name: "Magic Moments 180ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "180 ml",
    purchasePrice: 140,
    price: 210,
    minimumStock: 10,
    unitsPerCase: 48,
    openingStock: 35,
  },
  {
    id: "p034",
    barcode: "8900000010034",
    sku: "VO-MM-375",
    name: "Magic Moments 375ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 280,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p035",
    barcode: "8900000010035",
    sku: "VO-MM-750",
    name: "Magic Moments 750ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 26,
  },
  {
    id: "p036",
    barcode: "8900000010036",
    sku: "VO-ROM-750",
    name: "Romanov 750ml",
    brand: "Romanov",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 420,
    price: 620,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 21,
  },
  {
    id: "p037",
    barcode: "8900000010037",
    sku: "VO-SMI-375",
    name: "Smirnoff 375ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 420,
    price: 610,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 18,
  },
  {
    id: "p038",
    barcode: "8900000010038",
    sku: "VO-SMI-750",
    name: "Smirnoff 750ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 820,
    price: 1180,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p039",
    barcode: "8900000010039",
    sku: "VO-WM-750",
    name: "White Mischief 750ml",
    brand: "White Mischief",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 19,
  },

  {
    id: "p040",
    barcode: "8900000010040",
    sku: "BR-MH-750",
    name: "Mansion House 750ml",
    brand: "Mansion House",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 610,
    price: 890,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p041",
    barcode: "8900000010041",
    sku: "BR-MOR-750",
    name: "Morpheus Brandy 750ml",
    brand: "Morpheus",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 780,
    price: 1120,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 16,
  },
  {
    id: "p042",
    barcode: "8900000010042",
    sku: "BR-HB-750",
    name: "Honey Bee Brandy 750ml",
    brand: "Honey Bee",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 480,
    price: 700,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },

  {
    id: "p043",
    barcode: "8900000010043",
    sku: "WI-SCS-750",
    name: "Sula Cabernet Shiraz 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 620,
    price: 900,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 14,
  },
  {
    id: "p044",
    barcode: "8900000010044",
    sku: "WI-SCB-750",
    name: "Sula Chenin Blanc 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 600,
    price: 870,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p045",
    barcode: "8900000010045",
    sku: "WI-SBR-750",
    name: "Sula Brut 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 780,
    price: 1150,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p046",
    barcode: "8900000010046",
    sku: "WI-SZR-750",
    name: "Sula Zinfandel Rosé 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 690,
    price: 980,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 11,
  },
  {
    id: "p047",
    barcode: "8900000010047",
    sku: "WI-FCR-750",
    name: "Fratelli Cabernet Red 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 560,
    price: 820,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p048",
    barcode: "8900000010048",
    sku: "WI-FCB-750",
    name: "Fratelli Chenin Blanc 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p049",
    barcode: "8900000010049",
    sku: "WI-GZLR-750",
    name: "Grover Zampa La Réserve 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 760,
    price: 1100,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 9,
  },
  {
    id: "p050",
    barcode: "8900000010050",
    sku: "WI-GZAC-750",
    name: "Grover Zampa Art Collection 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 650,
    price: 950,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 8,
  },
];
```

### `src/index.css`

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  background: #f4f5f7;
  color: #17181c;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  background: #23111b;
  color: #fff;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 21px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #8e244d;
}

.brand-name {
  font-weight: 800;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #c6b5bd;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 19px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 45px;
  padding: 0 13px;
  border-radius: 9px;
  color: #cdbfc5;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-item.active {
  background: #8e244d;
  color: #fff;
}

.sidebar-footer {
  margin: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-footer div {
  display: flex;
  flex-direction: column;
}

.sidebar-footer strong {
  font-size: 13px;
}

.sidebar-footer span {
  color: #c6b5bd;
  font-size: 11px;
  margin-top: 2px;
}

.main-area {
  width: calc(100% - 250px);
  margin-left: 250px;
}

.topbar {
  height: 75px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e7e8eb;
}

.topbar h1 {
  margin: 0;
  font-size: 17px;
}

.topbar p {
  margin: 3px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: #8e244d;
}

.user-pill > div:last-child {
  display: flex;
  flex-direction: column;
}

.user-pill strong {
  font-size: 13px;
}

.user-pill span {
  color: #8a8c94;
  font-size: 11px;
}

.page-area {
  padding: 28px;
}

.page-heading {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-heading h2 {
  margin: 0;
  font-size: 25px;
  letter-spacing: -0.5px;
}

.page-heading p {
  margin: 5px 0 0;
  color: #787b83;
  font-size: 13px;
}

.page-actions {
  display: flex;
  gap: 9px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e6e9;
  border-radius: 13px;
  padding: 20px;
  box-shadow: 0 2px 7px rgba(28, 23, 26, 0.025);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
}

.panel-header h3,
.panel h3 {
  margin: 0;
  font-size: 16px;
}

.panel-header p,
.panel > p {
  margin: 4px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  position: relative;
  min-height: 145px;
  padding: 20px;
  border-radius: 13px;
  background: #fff;
  border: 1px solid #e5e6e9;
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  margin-bottom: 17px;
  background: #f5e9ee;
  color: #8e244d;
}

.stat-label {
  color: #73767d;
  font-size: 12px;
  font-weight: 600;
}

.stat-value {
  margin-top: 3px;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.stat-note {
  margin-top: 5px;
  color: #97999f;
  font-size: 11px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}

.simple-list {
  display: flex;
  flex-direction: column;
}

.simple-list-row {
  padding: 13px 0;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f0f1;
}

.simple-list-row:last-child {
  border-bottom: 0;
}

.simple-list-row > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.simple-list-row strong {
  font-size: 13px;
}

.simple-list-row span {
  color: #8d8f96;
  font-size: 11px;
}

.align-right {
  text-align: right;
}

.stock-low {
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  padding: 25px 5px;
  color: #8a8c94;
  font-size: 13px;
  text-align: center;
}

.large-empty-state {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
  color: #96989e;
}

.large-empty-state h3 {
  margin-top: 10px;
  color: #33353a;
}

.large-empty-state p {
  margin: 0;
}

.demo-note {
  margin-top: 17px;
  padding: 11px 14px;
  border-radius: 8px;
  background: #fff8e6;
  border: 1px solid #f3dfac;
  color: #775d1c;
  font-size: 11px;
}

.pos-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 18px;
  align-items: start;
}

.pos-left {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.input-label {
  margin-bottom: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
}

.barcode-input-row {
  display: flex;
  gap: 9px;
}

.barcode-input,
.search-input,
.settings-fields input {
  width: 100%;
  height: 45px;
  padding: 0 13px;
  border: 1px solid #dcdde0;
  border-radius: 9px;
  outline: none;
  background: #fff;
}

.barcode-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 1px;
}

.barcode-input:focus,
.search-input:focus {
  border-color: #8e244d;
  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.09);
}

.primary-button,
.secondary-button,
.danger-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  border: 0;
}

.primary-button {
  background: #8e244d;
  color: #fff;
}

.primary-button:hover {
  background: #761d40;
}

.secondary-button {
  background: #fff;
  border: 1px solid #dcdde0;
}

.pos-message {
  margin-top: 12px;
  padding: 9px 11px;
  border-radius: 7px;
  font-size: 12px;
}

.pos-message.info {
  background: #edf4ff;
  color: #315883;
}

.pos-message.success {
  background: #eaf8ee;
  color: #246b39;
}

.pos-message.error {
  background: #fff0ef;
  color: #a12b23;
}

.search-results {
  margin-top: 10px;
  border: 1px solid #e2e3e5;
  border-radius: 9px;
  overflow: hidden;
}

.search-result {
  width: 100%;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid #ededee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  text-align: left;
}

.search-result:last-child {
  border-bottom: 0;
}

.search-result:hover {
  background: #faf7f8;
}

.search-result > div,
.search-result-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.search-result strong {
  font-size: 12px;
}

.search-result span {
  color: #8a8c94;
  font-size: 10px;
}

.search-result-right {
  text-align: right;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
}

.danger-text {
  color: #b42318;
}

.cart-empty {
  min-height: 190px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  color: #a5a6aa;
}

.cart-empty strong {
  margin-top: 8px;
  color: #55575c;
}

.cart-empty span {
  font-size: 12px;
}

.cart-table {
  display: flex;
  flex-direction: column;
}

.cart-row {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) 120px 120px 35px;
  gap: 14px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #ededee;
}

.cart-row:last-child {
  border-bottom: 0;
}

.cart-product,
.cart-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cart-product strong {
  font-size: 13px;
}

.cart-product span,
.cart-price span {
  color: #8e9097;
  font-size: 10px;
}

.cart-price {
  text-align: right;
}

.quantity-control {
  height: 34px;
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  border: 1px solid #dedfe2;
  border-radius: 7px;
  overflow: hidden;
}

.quantity-control button {
  height: 100%;
  border: 0;
  display: grid;
  place-items: center;
  background: #f6f6f7;
}

.quantity-control strong {
  text-align: center;
  font-size: 12px;
}

.icon-button {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
}

.icon-button.danger {
  color: #b42318;
}

.icon-button:hover {
  background: #f7f7f8;
}

.checkout-panel {
  position: sticky;
  top: 94px;
  padding: 21px;
  border-radius: 13px;
  background: #23111b;
  color: #fff;
}

.checkout-panel h3 {
  margin: 0;
  font-size: 18px;
}

.checkout-panel > div:first-child p {
  margin: 4px 0 0;
  color: #bbaeb4;
  font-size: 11px;
}

.bill-lines {
  margin-top: 23px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.bill-lines > div,
.grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bill-lines span {
  color: #bbaeb4;
  font-size: 12px;
}

.bill-lines strong {
  font-size: 13px;
}

.grand-total {
  padding: 19px 0;
}

.grand-total span {
  font-size: 13px;
}

.grand-total strong {
  font-size: 26px;
}

.payment-title {
  margin-bottom: 9px;
  color: #cdbfc5;
  font-size: 11px;
  font-weight: 700;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.payment-button {
  min-height: 67px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  display: grid;
  place-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #d9cfd3;
  font-size: 10px;
  font-weight: 700;
}

.payment-button.selected {
  border-color: #d85d8c;
  background: #8e244d;
  color: #fff;
}

.complete-sale {
  width: 100%;
  margin-top: 17px;
  padding: 14px;
  border: 0;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  background: #cf477b;
  color: #fff;
  font-weight: 800;
}

.complete-sale:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.test-barcode-box {
  margin-top: 19px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}

.test-barcode-box strong {
  font-size: 11px;
}

.test-barcode-box span {
  color: #bbaeb4;
  font-size: 10px;
}

.test-barcode-box code {
  padding: 5px 7px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.22);
  color: #f4bdd2;
}

.cart-count {
  padding: 8px 11px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1px solid #e3e4e6;
  font-size: 12px;
  font-weight: 700;
}

.table-toolbar {
  margin-bottom: 17px;
}

.table-search {
  max-width: 430px;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dedfe2;
  border-radius: 8px;
}

.table-search input {
  width: 100%;
  border: 0;
  outline: 0;
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 11px 12px;
  text-align: left;
  background: #f7f7f8;
  color: #7c7e84;
  border-bottom: 1px solid #e4e5e7;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #eeeeef;
  font-size: 12px;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #fcfafb;
}

.table-product {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.table-product span {
  color: #919399;
  font-size: 10px;
}

.category-badge {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f2edf0;
  color: #673249;
  font-size: 10px;
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.stock-status {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}

.stock-status.good {
  background: #e8f6ec;
  color: #26703b;
}

.stock-status.low {
  background: #ffeceb;
  color: #a62b23;
}

.coming-soon {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.settings-fields {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.settings-fields label {
  display: grid;
  gap: 6px;
  color: #76787f;
  font-size: 11px;
  font-weight: 700;
}

.settings-fields input {
  color: #4f5157;
  background: #f8f8f9;
}

.danger-zone {
  border-color: #efc7c3;
}

.danger-zone p {
  margin: 9px 0 18px;
}

.danger-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #b42318;
  color: #fff;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .pos-layout {
    grid-template-columns: 1fr;
  }

  .checkout-panel {
    position: static;
  }
}

@media (max-width: 780px) {
  .sidebar {
    width: 72px;
  }

  .brand {
    padding: 16px 14px;
  }

  .brand > div:last-child,
  .nav-item span,
  .sidebar-footer div {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }

  .sidebar-footer {
    justify-content: center;
  }

  .main-area {
    width: calc(100% - 72px);
    margin-left: 72px;
  }

  .topbar {
    padding: 0 16px;
  }

  .page-area {
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .cart-row {
    grid-template-columns: 1fr;
  }

  .cart-price {
    text-align: left;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

### `src/main.jsx`

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ShopProvider } from "./context/ShopContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <App />
      </ShopProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### `src/pages/Dashboard.jsx`

```javascript
import {
  IndianRupee,
  PackageCheck,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock } = useShop();

  const today = new Date().toDateString();

  const todaysSales = sales.filter(
    (sale) => new Date(sale.createdAt).toDateString() === today
  );

  const revenue = todaysSales.reduce(
    (total, sale) => total + sale.grandTotal,
    0
  );

  const averageBill = todaysSales.length
    ? revenue / todaysSales.length
    : 0;

  const lowStockProducts = products.filter(
    (product) => getStock(product.id) <= product.minimumStock
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * product.purchasePrice,
    0
  );

  const cards = [
    {
      label: "Today's Sales",
      value: money.format(revenue),
      icon: IndianRupee,
      note: "Revenue today",
    },
    {
      label: "Bills Today",
      value: todaysSales.length,
      icon: ReceiptText,
      note: `Avg ${money.format(averageBill)}`,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: TriangleAlert,
      note: "Needs attention",
    },
    {
      label: "Inventory Value",
      value: money.format(inventoryValue),
      icon: PackageCheck,
      note: "At purchase cost",
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Store overview and today's performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-note">{card.note}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest completed bills</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              No sales yet. Open POS and complete your first bill.
            </div>
          ) : (
            <div className="simple-list">
              {sales.slice(0, 7).map((sale) => (
                <div className="simple-list-row" key={sale.id}>
                  <div>
                    <strong>{sale.invoiceNumber}</strong>
                    <span>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="align-right">
                    <strong>{money.format(sale.grandTotal)}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Low Stock Products</h3>
              <p>Products at or below minimum level</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">No low-stock products.</div>
          ) : (
            <div className="simple-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div className="simple-list-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="stock-low">
                    {getStock(product.id)} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="demo-note">
        Development mode: product prices and barcodes are dummy test data.
      </div>
    </div>
  );
}
```

### `src/pages/Inventory.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      if (!value) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.barcode.includes(value)
      );
    });
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>Current local stock levels</p>
        </div>

        <div className="page-actions">
          <button className="secondary-button">+ Receive Stock</button>
          <button className="primary-button">+ New Product</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory..."
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Current Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Inventory Value</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock = getStock(product.id);
                const low = stock <= product.minimumStock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <strong>{product.name}</strong>
                        <span>{product.size}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td className="mono">{product.barcode}</td>
                    <td>
                      <strong>{stock}</strong>
                    </td>
                    <td>{product.minimumStock}</td>
                    <td>
                      <span
                        className={
                          low
                            ? "stock-status low"
                            : "stock-status good"
                        }
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td>
                      {money.format(stock * product.purchasePrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### `src/pages/POS.jsx`

```javascript
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [message, setMessage] = useState(
    "Ready to scan. Try barcode 8900000010016"
  );
  const [messageType, setMessageType] = useState("info");

  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.brand.toLowerCase().includes(value) ||
          product.sku.toLowerCase().includes(value) ||
          product.barcode.includes(value)
      )
      .slice(0, 8);
  }, [search, products]);

  function currentCartQuantity(productId) {
    return (
      cart.find((item) => item.product.id === productId)?.quantity || 0
    );
  }

  function addProduct(product) {
    const available = getStock(product.id);
    const alreadyInCart = currentCartQuantity(product.id);

    if (available <= 0) {
      setMessage(`${product.name} is OUT OF STOCK.`);
      setMessageType("error");
      return;
    }

    if (alreadyInCart + 1 > available) {
      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart.`);
    setMessageType("success");
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode) {
      return;
    }

    const product = products.find(
      (item) => item.barcode === scannedBarcode
    );

    if (!product) {
      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
      setMessageType("error");
    } else {
      addProduct(product);
    }

    setBarcode("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  function changeQuantity(productId, delta) {
    const item = cart.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const available = getStock(productId);

    if (newQuantity > available) {
      setMessage(`Only ${available} unit(s) available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function removeItem(productId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCompleteSale() {
    const result = completeSale(cart, paymentMethod);

    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    setMessage(
      `${result.sale.invoiceNumber} completed successfully for ${money.format(
        result.sale.grandTotal
      )}.`
    );
    setMessageType("success");
    setCart([]);
    setSearch("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Scan barcode or search a product manually</p>
        </div>

        <div className="cart-count">
          <ShoppingCart size={18} />
          {itemCount} item(s)
        </div>
      </div>

      <div className="pos-layout">
        <section className="pos-left">
          <div className="panel barcode-panel">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="input-label">
                <ScanBarcode size={18} />
                Scan Barcode
              </label>

              <div className="barcode-input-row">
                <input
                  ref={barcodeRef}
                  className="barcode-input"
                  value={barcode}
                  onChange={(event) =>
                    setBarcode(event.target.value)
                  }
                  placeholder="Scan barcode and press Enter"
                  autoComplete="off"
                />

                <button className="primary-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className={`pos-message ${messageType}`}>
              {message}
            </div>
          </div>

          <div className="panel">
            <label className="input-label">
              <Search size={18} />
              Manual Product Search
            </label>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, brand, SKU or barcode"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <button
                    type="button"
                    className="search-result"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.barcode} · {product.sku}
                      </span>
                    </div>

                    <div className="search-result-right">
                      <strong>{money.format(product.price)}</strong>
                      <span>Stock: {getStock(product.id)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Current Cart</h3>
                <p>Products added to this bill</p>
              </div>

              {cart.length > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={42} />
                <strong>Cart is empty</strong>
                <span>Scan a barcode to begin billing.</span>
              </div>
            ) : (
              <div className="cart-table">
                {cart.map((item) => (
                  <div className="cart-row" key={item.product.id}>
                    <div className="cart-product">
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.product.barcode} · Stock{" "}
                        {getStock(item.product.id)}
                      </span>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="cart-price">
                      <span>{money.format(item.product.price)} each</span>
                      <strong>
                        {money.format(
                          item.product.price * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      className="icon-button danger"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-panel">
          <div>
            <h3>Bill Summary</h3>
            <p>{itemCount} item(s)</p>
          </div>

          <div className="bill-lines">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{money.format(0)}</strong>
            </div>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{money.format(subtotal)}</strong>
          </div>

          <div className="payment-title">Payment Method</div>

          <div className="payment-options">
            <button
              className={
                paymentMethod === "CASH"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote size={21} />
              CASH
            </button>

            <button
              className={
                paymentMethod === "UPI"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("UPI")}
            >
              <Smartphone size={21} />
              UPI
            </button>

            <button
              className={
                paymentMethod === "CARD"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard size={21} />
              CARD
            </button>
          </div>

          <button
            className="complete-sale"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
          >
            Complete Sale
            <span>{money.format(subtotal)}</span>
          </button>

          <div className="test-barcode-box">
            <strong>Test Scanner</strong>
            <span>Try typing:</span>
            <code>8900000010016</code>
            <span>Then press Enter.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### `src/pages/Placeholder.jsx`

```javascript
export default function Placeholder({ title, description }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel coming-soon">
        <h3>{title}</h3>
        <p>
          This module is reserved for the next development chapters.
        </p>
      </div>
    </div>
  );
}
```

### `src/pages/Products.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Product Master</h2>
          <p>{products.length} development products loaded</p>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, barcode, SKU or category"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Selling Price</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                  </td>

                  <td className="mono">{product.barcode}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>{getStock(product.id)}</td>
                  <td>{money.format(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-note">
        Barcodes and prices are dummy development values and are not official
        product data.
      </div>
    </div>
  );
}
```

### `src/pages/Sales.jsx`

```javascript
import { ReceiptText } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales History</h2>
          <p>Completed local transactions</p>
        </div>
      </div>

      <div className="panel">
        {sales.length === 0 ? (
          <div className="large-empty-state">
            <ReceiptText size={48} />
            <h3>No sales yet</h3>
            <p>Complete a transaction from POS Billing.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber}</strong>
                    </td>

                    <td>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {sale.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td>
                      <strong>{money.format(sale.grandTotal)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `src/pages/Settings.jsx`

```javascript
import { RotateCcw } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { resetDemo } = useShop();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset inventory and delete all local demo sales?"
    );

    if (confirmed) {
      resetDemo();
      window.alert("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Prototype application settings</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Store Information</h3>

          <div className="settings-fields">
            <label>
              Store Name
              <input value="Demo Wine Shop" readOnly />
            </label>

            <label>
              Currency
              <input value="INR (₹)" readOnly />
            </label>

            <label>
              Data Mode
              <input value="Browser LocalStorage" readOnly />
            </label>
          </div>
        </section>

        <section className="panel danger-zone">
          <h3>Demo Data</h3>
          <p>
            Reset all inventory quantities back to opening stock and remove
            local sales.
          </p>

          <button className="danger-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </section>
      </div>
    </div>
  );
}
```

### `vite.config.js`

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

## Reproduce this historical snapshot

```bash
git switch --detach d6d8334dae5b3821b43411cc070156bdfaae3f87
# inspect/run the historical code
git switch main
```

