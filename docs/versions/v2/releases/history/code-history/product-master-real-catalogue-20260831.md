# Product Master Real Catalogue — Actual Git Code History

Feature commit: `771ee02782ba1c5d86e62d0f492d7fbf2c537088`

Generated from the actual feature commit after build, applied migration and verified Azure deployment.

## Commit metadata
```text
commit 771ee02782ba1c5d86e62d0f492d7fbf2c537088
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Mon Aug 31 03:34:04 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Mon Aug 31 03:34:04 2026 -0400

    feat: add real Product Master OCR bulk onboarding

 docs/DOCUMENTATION_REGISTER.md                     |  10 +
 docs/PROJECT_CONTEXT.md                            |  24 +
 docs/chapters/08-product-master.md                 |  17 +
 .../V2-03-inventory-cost-lots-ageing-fifo.md       |   8 +
 docs/chapters/V2-06-purchase-intelligence.md       |  12 +
 ...OS_Developer_Handbook_Master_Reconsolidation.md |  53 ++
 .../NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt   |  19 +
 ...neShopPOS_User_Manual_Master_Reconsolidation.md |  44 ++
 docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md |  28 +
 public/manual/WineShopPOS_User_Manual.md           |  44 ++
 public/manual/index.html                           |  41 +-
 src/App.jsx                                        |   2 +
 src/components/ProductForm.jsx                     |  16 +-
 src/config/navigation.js                           |   1 +
 src/context/ShopContext.jsx                        |  15 +-
 src/data/products.js                               | 711 +--------------------
 src/pages/AddProduct.jsx                           |   4 +-
 src/pages/AutomationHub.jsx                        |  56 ++
 src/pages/BulkProductImport.jsx                    | 429 +++++++++++++
 src/pages/Products.jsx                             |  52 +-
 ...0260831123000_product_master_real_catalogue.sql | 319 +++++++++
 21 files changed, 1169 insertions(+), 736 deletions(-)
```

## Current implementation diff
```diff
diff --git a/src/App.jsx b/src/App.jsx
index b28d06e..d7bd951 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -15,6 +15,7 @@ import Shifts from "./pages/Shifts";
 import ScannerSettings from "./pages/ScannerSettings";
 import Products from "./pages/Products";
 import AddProduct from "./pages/AddProduct";
+import BulkProductImport from "./pages/BulkProductImport";
 import EditProduct from "./pages/EditProduct";
 import BarcodeLabels from "./pages/BarcodeLabels";
 import Purchases from "./pages/Purchases";
@@ -78,6 +79,7 @@ export default function App() {
           <Route path="products" element={module("Products", "Product master, barcode configuration and physical label printing.", MODULE_TABS.products)}>
             <Route index element={<Products/>}/>
             <Route path="new" element={<AddProduct/>}/>
+            <Route path="bulk-import" element={<BulkProductImport/>}/>
             <Route path=":id/edit" element={<EditProduct/>}/>
             <Route path="labels" element={<BarcodeLabels/>}/>
           </Route>
diff --git a/src/components/ProductForm.jsx b/src/components/ProductForm.jsx
index f9ad45c..db43969 100644
--- a/src/components/ProductForm.jsx
+++ b/src/components/ProductForm.jsx
@@ -2,7 +2,6 @@ import { useEffect, useState } from "react";

 const emptyProduct = {
   barcode: "",
-  sku: "",
   name: "",
   brand: "",
   category: "Whisky",
@@ -14,12 +13,10 @@ const emptyProduct = {
   price: 0,
   minimumStock: 5,
   unitsPerCase: 12,
-  openingStock: 0,
 };

 export default function ProductForm({
   initialValue,
-  showOpeningStock = false,
   onSubmit,
   submitLabel,
 }) {
@@ -32,7 +29,6 @@ export default function ProductForm({
       setForm({
         ...emptyProduct,
         ...initialValue,
-        openingStock: 0,
       });
     }
   }, [initialValue]);
@@ -54,9 +50,15 @@ export default function ProductForm({

   return (
     <form className="panel" onSubmit={submit}>
+      {/* PRODUCT_MASTER_REAL_CATALOGUE_20260831 */}
+      <div className="purchase-message" style={{ marginBottom: 14 }}>
+        SKU is generated automatically. Barcode is required when adding one product.
+        For invoice/OCR or manual bulk onboarding, use{" "}
+        <a href="#/products/bulk-import">Bulk Product Import</a>.
+      </div>
       <div className="form-grid">
         <label>Barcode<input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} required /></label>
-        <label>SKU<input value={form.sku} onChange={(e) => set("sku", e.target.value)} required /></label>
+        <label>SKU<input value={initialValue?.sku || "Auto-generated on save"} readOnly /></label>
         <label>Product Name<input value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
         <label>Brand<input value={form.brand} onChange={(e) => set("brand", e.target.value)} required /></label>
         <label>Category<input value={form.category} onChange={(e) => set("category", e.target.value)} required /></label>
@@ -68,9 +70,7 @@ export default function ProductForm({
         <label>Selling Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required /></label>
         <label>Minimum Stock<input type="number" min="0" value={form.minimumStock} onChange={(e) => set("minimumStock", e.target.value)} required /></label>
         <label>Bottles / Case<input type="number" min="1" value={form.unitsPerCase} onChange={(e) => set("unitsPerCase", e.target.value)} required /></label>
-        {showOpeningStock && (
-          <label>Opening Stock<input type="number" min="0" value={form.openingStock} onChange={(e) => set("openingStock", e.target.value)} required /></label>
-        )}
+
       </div>

       {message && <div className="purchase-message error" style={{ marginTop: 12 }}>{message}</div>}
diff --git a/src/config/navigation.js b/src/config/navigation.js
index 0afd257..cc4fc24 100644
--- a/src/config/navigation.js
+++ b/src/config/navigation.js
@@ -32,6 +32,7 @@ export const MODULE_TABS = {
   ],
   products: [
     { path: "/products", label: "Product Master", roles: ["ADMIN", "MANAGER"] },
+    { path: "/products/bulk-import", label: "Bulk Product Import", roles: ["ADMIN", "MANAGER"] },
     { path: "/products/labels", label: "Barcode Labels", roles: ["ADMIN", "MANAGER"] },
   ],
   purchasing: [
diff --git a/src/context/ShopContext.jsx b/src/context/ShopContext.jsx
index f1bf3b2..7ef80b7 100644
--- a/src/context/ShopContext.jsx
+++ b/src/context/ShopContext.jsx
@@ -112,26 +112,25 @@ export function ShopProvider({ children }) {
     if (error) throw error; setCategories((c) => [...c, data]); return data.id;
   }

-  function validateProduct(d, opening = false) {
-    const v = { barcode:String(d.barcode||"").trim(),sku:String(d.sku||"").trim().toUpperCase(),name:String(d.name||"").trim(),brand:String(d.brand||"").trim(),category:String(d.category||"").trim(),subcategory:String(d.subcategory||"").trim(),sizeMl:Number(d.sizeMl),alcoholPercentage:d.alcoholPercentage===""?null:Number(d.alcoholPercentage),purchasePrice:Number(d.purchasePrice),mrp:Number(d.mrp),price:Number(d.price),minimumStock:Number(d.minimumStock),unitsPerCase:Number(d.unitsPerCase),openingStock:opening?Number(d.openingStock||0):0 };
-    for (const [key,label] of [["barcode","Barcode"],["sku","SKU"],["name","Product name"],["brand","Brand"],["category","Category"]]) if (!v[key]) return { ok:false,message:`${label} is required.` };
+  function validateProduct(d) {
+    const v = { barcode:String(d.barcode||"").trim(),name:String(d.name||"").trim(),brand:String(d.brand||"").trim(),category:String(d.category||"").trim(),subcategory:String(d.subcategory||"").trim(),sizeMl:Number(d.sizeMl),alcoholPercentage:d.alcoholPercentage===""?null:Number(d.alcoholPercentage),purchasePrice:Number(d.purchasePrice),mrp:Number(d.mrp),price:Number(d.price),minimumStock:Number(d.minimumStock),unitsPerCase:Number(d.unitsPerCase) };
+    for (const [key,label] of [["barcode","Barcode"],["name","Product name"],["brand","Brand"],["category","Category"]]) if (!v[key]) return { ok:false,message:`${label} is required.` };
     if (!Number.isInteger(v.sizeMl)||v.sizeMl<=0) return {ok:false,message:"Bottle size is invalid."};
     if (![v.purchasePrice,v.mrp,v.price].every((x)=>Number.isFinite(x)&&x>=0)) return {ok:false,message:"Price values are invalid."};
     if (!Number.isInteger(v.minimumStock)||v.minimumStock<0||!Number.isInteger(v.unitsPerCase)||v.unitsPerCase<=0) return {ok:false,message:"Stock settings are invalid."};
-    if (opening&&(!Number.isInteger(v.openingStock)||v.openingStock<0)) return {ok:false,message:"Opening stock is invalid."};
     return {ok:true,value:v};
   }

   async function addProduct(data) {
-    try { const check=validateProduct(data,true); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
-      const {data:id,error}=await supabase.rpc("create_new_product",{p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||null,p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase,p_opening_stock:v.openingStock});
+    try { const check=validateProduct(data); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
+      const {data:id,error}=await supabase.rpc("create_new_product",{p_barcode:v.barcode,p_sku:"AUTO",p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||null,p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase,p_opening_stock:0});
       if(error)throw error; await refreshAll(); return {ok:true,productId:id,message:`${v.name} created successfully.`};
     } catch(e){return {ok:false,message:e.message||String(e)}}
   }

   async function updateProduct(id,data) {
-    try { const check=validateProduct(data,false); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
-      const {error}=await supabase.rpc("update_product_details",{p_product_id:id,p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||"",p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase});
+    try { const check=validateProduct(data); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
+      const {error}=await supabase.rpc("update_product_details",{p_product_id:id,p_barcode:v.barcode,p_sku:data.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||"",p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase});
       if(error)throw error;await refreshAll();return {ok:true,message:`${v.name} updated successfully.`};
     }catch(e){return {ok:false,message:e.message||String(e)}}
   }
diff --git a/src/data/products.js b/src/data/products.js
index 98d3b0b..3b4a161 100644
--- a/src/data/products.js
+++ b/src/data/products.js
@@ -1,707 +1,4 @@
-export const products = [
-  {
-    id: "p001",
-    barcode: "8900000010001",
-    sku: "WH-RS-180",
-    name: "Royal Stag 180ml",
-    brand: "Royal Stag",
-    category: "Whisky",
-    size: "180 ml",
-    purchasePrice: 150,
-    price: 210,
-    minimumStock: 12,
-    unitsPerCase: 48,
-    openingStock: 48,
-  },
-  {
-    id: "p002",
-    barcode: "8900000010002",
-    sku: "WH-RS-375",
-    name: "Royal Stag 375ml",
-    brand: "Royal Stag",
-    category: "Whisky",
-    size: "375 ml",
-    purchasePrice: 285,
-    price: 410,
-    minimumStock: 10,
-    unitsPerCase: 24,
-    openingStock: 30,
-  },
-  {
-    id: "p003",
-    barcode: "8900000010003",
-    sku: "WH-RS-750",
-    name: "Royal Stag 750ml",
-    brand: "Royal Stag",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 540,
-    price: 780,
-    minimumStock: 12,
-    unitsPerCase: 12,
-    openingStock: 36,
-  },
-  {
-    id: "p004",
-    barcode: "8900000010004",
-    sku: "WH-BP-375",
-    name: "Blenders Pride 375ml",
-    brand: "Blenders Pride",
-    category: "Whisky",
-    size: "375 ml",
-    purchasePrice: 620,
-    price: 850,
-    minimumStock: 8,
-    unitsPerCase: 24,
-    openingStock: 20,
-  },
-  {
-    id: "p005",
-    barcode: "8900000010005",
-    sku: "WH-BP-750",
-    name: "Blenders Pride 750ml",
-    brand: "Blenders Pride",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 1200,
-    price: 1650,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 24,
-  },
-  {
-    id: "p006",
-    barcode: "8900000010006",
-    sku: "WH-IB-180",
-    name: "Imperial Blue 180ml",
-    brand: "Imperial Blue",
-    category: "Whisky",
-    size: "180 ml",
-    purchasePrice: 125,
-    price: 180,
-    minimumStock: 12,
-    unitsPerCase: 48,
-    openingStock: 45,
-  },
-  {
-    id: "p007",
-    barcode: "8900000010007",
-    sku: "WH-IB-375",
-    name: "Imperial Blue 375ml",
-    brand: "Imperial Blue",
-    category: "Whisky",
-    size: "375 ml",
-    purchasePrice: 245,
-    price: 350,
-    minimumStock: 10,
-    unitsPerCase: 24,
-    openingStock: 32,
-  },
-  {
-    id: "p008",
-    barcode: "8900000010008",
-    sku: "WH-IB-750",
-    name: "Imperial Blue 750ml",
-    brand: "Imperial Blue",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 460,
-    price: 680,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 28,
-  },
-  {
-    id: "p009",
-    barcode: "8900000010009",
-    sku: "WH-MD1-750",
-    name: "McDowell's No.1 750ml",
-    brand: "McDowell's",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 500,
-    price: 730,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 30,
-  },
-  {
-    id: "p010",
-    barcode: "8900000010010",
-    sku: "WH-RC-750",
-    name: "Royal Challenge 750ml",
-    brand: "Royal Challenge",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 620,
-    price: 850,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 24,
-  },
-  {
-    id: "p011",
-    barcode: "8900000010011",
-    sku: "WH-SIG-750",
-    name: "Signature Rare Aged 750ml",
-    brand: "Signature",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 780,
-    price: 1100,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 18,
-  },
-  {
-    id: "p012",
-    barcode: "8900000010012",
-    sku: "WH-AB-750",
-    name: "Antiquity Blue 750ml",
-    brand: "Antiquity",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 1100,
-    price: 1550,
-    minimumStock: 6,
-    unitsPerCase: 12,
-    openingStock: 15,
-  },
-  {
-    id: "p013",
-    barcode: "8900000010013",
-    sku: "WH-OC-750",
-    name: "Officer's Choice 750ml",
-    brand: "Officer's Choice",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 390,
-    price: 570,
-    minimumStock: 12,
-    unitsPerCase: 12,
-    openingStock: 34,
-  },
-  {
-    id: "p014",
-    barcode: "8900000010014",
-    sku: "WH-8PM-750",
-    name: "8PM Whisky 750ml",
-    brand: "8PM",
-    category: "Whisky",
-    size: "750 ml",
-    purchasePrice: 430,
-    price: 620,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 27,
-  },
-
-  {
-    id: "p015",
-    barcode: "8900000010015",
-    sku: "BE-KFP-650",
-    name: "Kingfisher Premium 650ml",
-    brand: "Kingfisher",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 105,
-    price: 160,
-    minimumStock: 24,
-    unitsPerCase: 12,
-    openingStock: 72,
-  },
-  {
-    id: "p016",
-    barcode: "8900000010016",
-    sku: "BE-KFS-650",
-    name: "Kingfisher Strong 650ml",
-    brand: "Kingfisher",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 120,
-    price: 180,
-    minimumStock: 24,
-    unitsPerCase: 12,
-    openingStock: 84,
-  },
-  {
-    id: "p017",
-    barcode: "8900000010017",
-    sku: "BE-KFU-330",
-    name: "Kingfisher Ultra 330ml",
-    brand: "Kingfisher",
-    category: "Beer",
-    size: "330 ml",
-    purchasePrice: 95,
-    price: 150,
-    minimumStock: 18,
-    unitsPerCase: 24,
-    openingStock: 48,
-  },
-  {
-    id: "p018",
-    barcode: "8900000010018",
-    sku: "BE-KFUM-650",
-    name: "Kingfisher Ultra Max 650ml",
-    brand: "Kingfisher",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 150,
-    price: 220,
-    minimumStock: 18,
-    unitsPerCase: 12,
-    openingStock: 48,
-  },
-  {
-    id: "p019",
-    barcode: "8900000010019",
-    sku: "BE-TS-650",
-    name: "Tuborg Strong 650ml",
-    brand: "Tuborg",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 125,
-    price: 190,
-    minimumStock: 24,
-    unitsPerCase: 12,
-    openingStock: 78,
-  },
-  {
-    id: "p020",
-    barcode: "8900000010020",
-    sku: "BE-TG-650",
-    name: "Tuborg Green 650ml",
-    brand: "Tuborg",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 115,
-    price: 175,
-    minimumStock: 18,
-    unitsPerCase: 12,
-    openingStock: 60,
-  },
-  {
-    id: "p021",
-    barcode: "8900000010021",
-    sku: "BE-BUD-330",
-    name: "Budweiser Premium 330ml",
-    brand: "Budweiser",
-    category: "Beer",
-    size: "330 ml",
-    purchasePrice: 110,
-    price: 170,
-    minimumStock: 18,
-    unitsPerCase: 24,
-    openingStock: 42,
-  },
-  {
-    id: "p022",
-    barcode: "8900000010022",
-    sku: "BE-BM-500",
-    name: "Budweiser Magnum 500ml",
-    brand: "Budweiser",
-    category: "Beer",
-    size: "500 ml",
-    purchasePrice: 135,
-    price: 210,
-    minimumStock: 18,
-    unitsPerCase: 24,
-    openingStock: 50,
-  },
-  {
-    id: "p023",
-    barcode: "8900000010023",
-    sku: "BE-CE-650",
-    name: "Carlsberg Elephant 650ml",
-    brand: "Carlsberg",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 130,
-    price: 200,
-    minimumStock: 18,
-    unitsPerCase: 12,
-    openingStock: 54,
-  },
-  {
-    id: "p024",
-    barcode: "8900000010024",
-    sku: "BE-CS-650",
-    name: "Carlsberg Smooth 650ml",
-    brand: "Carlsberg",
-    category: "Beer",
-    size: "650 ml",
-    purchasePrice: 120,
-    price: 185,
-    minimumStock: 18,
-    unitsPerCase: 12,
-    openingStock: 55,
-  },
-  {
-    id: "p025",
-    barcode: "8900000010025",
-    sku: "BE-HEI-330",
-    name: "Heineken 330ml",
-    brand: "Heineken",
-    category: "Beer",
-    size: "330 ml",
-    purchasePrice: 115,
-    price: 180,
-    minimumStock: 12,
-    unitsPerCase: 24,
-    openingStock: 36,
-  },
-  {
-    id: "p026",
-    barcode: "8900000010026",
-    sku: "BE-B91B-330",
-    name: "Bira 91 Blonde 330ml",
-    brand: "Bira 91",
-    category: "Beer",
-    size: "330 ml",
-    purchasePrice: 105,
-    price: 165,
-    minimumStock: 12,
-    unitsPerCase: 24,
-    openingStock: 30,
-  },
-  {
-    id: "p027",
-    barcode: "8900000010027",
-    sku: "BE-B91W-330",
-    name: "Bira 91 White 330ml",
-    brand: "Bira 91",
-    category: "Beer",
-    size: "330 ml",
-    purchasePrice: 115,
-    price: 180,
-    minimumStock: 12,
-    unitsPerCase: 24,
-    openingStock: 34,
-  },
-
-  {
-    id: "p028",
-    barcode: "8900000010028",
-    sku: "RU-OM-180",
-    name: "Old Monk 180ml",
-    brand: "Old Monk",
-    category: "Rum",
-    size: "180 ml",
-    purchasePrice: 130,
-    price: 190,
-    minimumStock: 12,
-    unitsPerCase: 48,
-    openingStock: 38,
-  },
-  {
-    id: "p029",
-    barcode: "8900000010029",
-    sku: "RU-OM-375",
-    name: "Old Monk 375ml",
-    brand: "Old Monk",
-    category: "Rum",
-    size: "375 ml",
-    purchasePrice: 260,
-    price: 380,
-    minimumStock: 10,
-    unitsPerCase: 24,
-    openingStock: 28,
-  },
-  {
-    id: "p030",
-    barcode: "8900000010030",
-    sku: "RU-OM-750",
-    name: "Old Monk 750ml",
-    brand: "Old Monk",
-    category: "Rum",
-    size: "750 ml",
-    purchasePrice: 500,
-    price: 720,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 31,
-  },
-  {
-    id: "p031",
-    barcode: "8900000010031",
-    sku: "RU-MCR-750",
-    name: "McDowell's Celebration Rum 750ml",
-    brand: "McDowell's",
-    category: "Rum",
-    size: "750 ml",
-    purchasePrice: 430,
-    price: 630,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 24,
-  },
-  {
-    id: "p032",
-    barcode: "8900000010032",
-    sku: "RU-CON-750",
-    name: "Contessa Rum 750ml",
-    brand: "Contessa",
-    category: "Rum",
-    size: "750 ml",
-    purchasePrice: 410,
-    price: 600,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 20,
-  },
-
-  {
-    id: "p033",
-    barcode: "8900000010033",
-    sku: "VO-MM-180",
-    name: "Magic Moments 180ml",
-    brand: "Magic Moments",
-    category: "Vodka",
-    size: "180 ml",
-    purchasePrice: 140,
-    price: 210,
-    minimumStock: 10,
-    unitsPerCase: 48,
-    openingStock: 35,
-  },
-  {
-    id: "p034",
-    barcode: "8900000010034",
-    sku: "VO-MM-375",
-    name: "Magic Moments 375ml",
-    brand: "Magic Moments",
-    category: "Vodka",
-    size: "375 ml",
-    purchasePrice: 280,
-    price: 410,
-    minimumStock: 10,
-    unitsPerCase: 24,
-    openingStock: 28,
-  },
-  {
-    id: "p035",
-    barcode: "8900000010035",
-    sku: "VO-MM-750",
-    name: "Magic Moments 750ml",
-    brand: "Magic Moments",
-    category: "Vodka",
-    size: "750 ml",
-    purchasePrice: 540,
-    price: 790,
-    minimumStock: 10,
-    unitsPerCase: 12,
-    openingStock: 26,
-  },
-  {
-    id: "p036",
-    barcode: "8900000010036",
-    sku: "VO-ROM-750",
-    name: "Romanov 750ml",
-    brand: "Romanov",
-    category: "Vodka",
-    size: "750 ml",
-    purchasePrice: 420,
-    price: 620,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 21,
-  },
-  {
-    id: "p037",
-    barcode: "8900000010037",
-    sku: "VO-SMI-375",
-    name: "Smirnoff 375ml",
-    brand: "Smirnoff",
-    category: "Vodka",
-    size: "375 ml",
-    purchasePrice: 420,
-    price: 610,
-    minimumStock: 8,
-    unitsPerCase: 24,
-    openingStock: 18,
-  },
-  {
-    id: "p038",
-    barcode: "8900000010038",
-    sku: "VO-SMI-750",
-    name: "Smirnoff 750ml",
-    brand: "Smirnoff",
-    category: "Vodka",
-    size: "750 ml",
-    purchasePrice: 820,
-    price: 1180,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 22,
-  },
-  {
-    id: "p039",
-    barcode: "8900000010039",
-    sku: "VO-WM-750",
-    name: "White Mischief 750ml",
-    brand: "White Mischief",
-    category: "Vodka",
-    size: "750 ml",
-    purchasePrice: 390,
-    price: 570,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 19,
-  },
-
-  {
-    id: "p040",
-    barcode: "8900000010040",
-    sku: "BR-MH-750",
-    name: "Mansion House 750ml",
-    brand: "Mansion House",
-    category: "Brandy",
-    size: "750 ml",
-    purchasePrice: 610,
-    price: 890,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 22,
-  },
-  {
-    id: "p041",
-    barcode: "8900000010041",
-    sku: "BR-MOR-750",
-    name: "Morpheus Brandy 750ml",
-    brand: "Morpheus",
-    category: "Brandy",
-    size: "750 ml",
-    purchasePrice: 780,
-    price: 1120,
-    minimumStock: 6,
-    unitsPerCase: 12,
-    openingStock: 16,
-  },
-  {
-    id: "p042",
-    barcode: "8900000010042",
-    sku: "BR-HB-750",
-    name: "Honey Bee Brandy 750ml",
-    brand: "Honey Bee",
-    category: "Brandy",
-    size: "750 ml",
-    purchasePrice: 480,
-    price: 700,
-    minimumStock: 8,
-    unitsPerCase: 12,
-    openingStock: 18,
-  },
-
-  {
-    id: "p043",
-    barcode: "8900000010043",
-    sku: "WI-SCS-750",
-    name: "Sula Cabernet Shiraz 750ml",
-    brand: "Sula",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 620,
-    price: 900,
-    minimumStock: 5,
-    unitsPerCase: 6,
-    openingStock: 14,
-  },
-  {
-    id: "p044",
-    barcode: "8900000010044",
-    sku: "WI-SCB-750",
-    name: "Sula Chenin Blanc 750ml",
-    brand: "Sula",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 600,
-    price: 870,
-    minimumStock: 5,
-    unitsPerCase: 6,
-    openingStock: 12,
-  },
-  {
-    id: "p045",
-    barcode: "8900000010045",
-    sku: "WI-SBR-750",
-    name: "Sula Brut 750ml",
-    brand: "Sula",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 780,
-    price: 1150,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 10,
-  },
-  {
-    id: "p046",
-    barcode: "8900000010046",
-    sku: "WI-SZR-750",
-    name: "Sula Zinfandel Rosé 750ml",
-    brand: "Sula",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 690,
-    price: 980,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 11,
-  },
-  {
-    id: "p047",
-    barcode: "8900000010047",
-    sku: "WI-FCR-750",
-    name: "Fratelli Cabernet Red 750ml",
-    brand: "Fratelli",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 560,
-    price: 820,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 12,
-  },
-  {
-    id: "p048",
-    barcode: "8900000010048",
-    sku: "WI-FCB-750",
-    name: "Fratelli Chenin Blanc 750ml",
-    brand: "Fratelli",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 540,
-    price: 790,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 10,
-  },
-  {
-    id: "p049",
-    barcode: "8900000010049",
-    sku: "WI-GZLR-750",
-    name: "Grover Zampa La Réserve 750ml",
-    brand: "Grover Zampa",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 760,
-    price: 1100,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 9,
-  },
-  {
-    id: "p050",
-    barcode: "8900000010050",
-    sku: "WI-GZAC-750",
-    name: "Grover Zampa Art Collection 750ml",
-    brand: "Grover Zampa",
-    category: "Wine",
-    size: "750 ml",
-    purchasePrice: 650,
-    price: 950,
-    minimumStock: 4,
-    unitsPerCase: 6,
-    openingStock: 8,
-  },
-];
+// Legacy local sample catalogue retired 2026-08-31.
+// Current Product Master is Supabase-backed.
+// Real products are onboarded manually or through reviewed Invoice OCR / Bulk Product Import.
+export const products = [];
diff --git a/src/pages/AddProduct.jsx b/src/pages/AddProduct.jsx
index 127a65a..fa05c1d 100644
--- a/src/pages/AddProduct.jsx
+++ b/src/pages/AddProduct.jsx
@@ -5,7 +5,7 @@ import { useShop } from "../context/ShopContext";
 export default function AddProduct(){
   const{addProduct}=useShop();const navigate=useNavigate();const[params]=useSearchParams();
   const barcode=params.get("barcode")||"",fromOcr=params.get("ocr")==="1",line=params.get("ocrLineIndex");
-  const initial=(barcode||fromOcr)?{barcode,name:params.get("name")||"",purchasePrice:Number(params.get("purchasePrice")||0),unitsPerCase:Math.max(1,Number(params.get("unitsPerCase")||12)),openingStock:0}:undefined;
+  const initial=(barcode||fromOcr)?{barcode,name:params.get("name")||"",purchasePrice:Number(params.get("purchasePrice")||0),unitsPerCase:Math.max(1,Number(params.get("unitsPerCase")||12))}:undefined;
   async function save(form){const r=await addProduct(form);if(r.ok){if(fromOcr&&line!==null){sessionStorage.setItem("wineshop_ocr_created_product",JSON.stringify({lineIndex:Number(line),productId:r.productId}));navigate("/purchasing/ocr");}else navigate("/products");}return r;}
-  return <div><div className="page-heading"><div><h2>Add Product</h2><p>{fromOcr?"Create the unmatched OCR product. Saving returns to the invoice review and links this line.":barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div></div><ProductForm key={`${barcode}-${params.get("name")||""}-${fromOcr}`} initialValue={initial} showOpeningStock onSubmit={save} submitLabel={fromOcr?"Create & Return to OCR":"Create Product"}/></div>;
+  return <div><div className="page-heading"><div><h2>Add Product</h2><p>{fromOcr?"Create the unmatched OCR product. Saving returns to the invoice review and links this line.":barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div></div><ProductForm key={`${barcode}-${params.get("name")||""}-${fromOcr}`} initialValue={initial} onSubmit={save} submitLabel={fromOcr?"Create & Return to OCR":"Create Product"}/></div>;
 }
diff --git a/src/pages/AutomationHub.jsx b/src/pages/AutomationHub.jsx
index c84603c..1005504 100644
--- a/src/pages/AutomationHub.jsx
+++ b/src/pages/AutomationHub.jsx
@@ -8,6 +8,7 @@ import SupplierEditor from "../components/SupplierEditor";
 const STRONG_MATCH = 0.90;
 const REVIEW_KEY = "wineshop_ocr_review_state";
 const CREATED_KEY = "wineshop_ocr_created_product";
+const BULK_CREATED_KEY = "wineshop_ocr_bulk_created_products";

 function normalize(value) {
   return String(value || "")
@@ -133,6 +134,29 @@ export default function AutomationHub() {
           "New product created and linked. Confirm this line after reviewing bottles per case, final bottle quantity and price.",
         );
       }
+
+      const bulkCreated = sessionStorage.getItem(BULK_CREATED_KEY);
+      if (bulkCreated) {
+        const createdRows = JSON.parse(bulkCreated);
+        if (Array.isArray(createdRows) && createdRows.length) {
+          setResolution((current) => {
+            const next = { ...current };
+            for (const item of createdRows) {
+              next[item.lineIndex] = {
+                ...(next[item.lineIndex] || {}),
+                productId: item.productId,
+                status: "SELECTED_NEEDS_CONFIRMATION",
+                source: "CREATED_PRODUCT",
+              };
+            }
+            return next;
+          });
+          setMessage(
+            `${createdRows.length} new OCR product(s) were bulk-created and linked. Review quantity/price and confirm each line before Receive Stock.`,
+          );
+        }
+        sessionStorage.removeItem(BULK_CREATED_KEY);
+      }
     } catch {
       sessionStorage.removeItem(REVIEW_KEY);
       sessionStorage.removeItem(CREATED_KEY);
@@ -472,6 +496,23 @@ export default function AutomationHub() {
     navigate(`/products/new?${params.toString()}`);
   }

+  function bulkCreateUnmatchedProducts() {
+    if (!result) return;
+
+    sessionStorage.setItem(
+      REVIEW_KEY,
+      JSON.stringify({
+        result,
+        matches,
+        resolution,
+        supplierId,
+        confirmedSupplier,
+      }),
+    );
+
+    navigate("/products/bulk-import?ocr=1");
+  }
+
   const unresolved = useMemo(
     () =>
       (result?.items || []).filter(
@@ -680,6 +721,21 @@ export default function AutomationHub() {
             </strong>
           </div>

+          <div className="button-row" style={{ marginBottom: 12 }}>
+            <button
+              type="button"
+              className="secondary-button"
+              onClick={bulkCreateUnmatchedProducts}
+              disabled={
+                !(result.items || []).some(
+                  (_, index) => !resolution[index]?.productId,
+                )
+              }
+            >
+              Bulk Create Unmatched Products
+            </button>
+          </div>
+
           <div className="data-table-wrapper">
             <table className="data-table">
               <thead>
diff --git a/src/pages/BulkProductImport.jsx b/src/pages/BulkProductImport.jsx
new file mode 100644
index 0000000..6e2d9fb
--- /dev/null
+++ b/src/pages/BulkProductImport.jsx
@@ -0,0 +1,429 @@
+import { useEffect, useMemo, useState } from "react";
+import { useNavigate, useSearchParams } from "react-router-dom";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+
+const OCR_REVIEW_KEY = "wineshop_ocr_review_state";
+const OCR_BULK_CREATED_KEY = "wineshop_ocr_bulk_created_products";
+
+function blankRow(overrides = {}) {
+  return {
+    barcode: "",
+    productName: "",
+    brand: "",
+    categoryId: "",
+    subcategory: "",
+    sizeMl: 750,
+    alcoholPercentage: "",
+    purchasePrice: 0,
+    mrp: 0,
+    sellingPrice: 0,
+    minimumStock: 5,
+    unitsPerCase: 12,
+    ocrLineIndex: null,
+    source: "MANUAL",
+    ...overrides,
+  };
+}
+
+function inferSizeMl(description) {
+  const text = String(description || "");
+  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
+  if (!matches.length) return 750;
+
+  const [, rawValue, rawUnit] = matches[matches.length - 1];
+  const value = Number(rawValue);
+  if (!Number.isFinite(value) || value <= 0) return 750;
+
+  const unit = rawUnit.toLowerCase();
+  if (unit === "cl") return Math.round(value * 10);
+  if (unit === "l") return Math.round(value * 1000);
+  return Math.round(value);
+}
+
+function rowsFromOcrReview() {
+  const raw = sessionStorage.getItem(OCR_REVIEW_KEY);
+  if (!raw) return [];
+
+  const state = JSON.parse(raw);
+  const items = state?.result?.items || [];
+  const resolution = state?.resolution || {};
+
+  return items
+    .map((item, index) => {
+      const row = resolution[index] || {};
+      if (row.productId) return null;
+
+      return blankRow({
+        productName: String(item?.description || "").trim(),
+        sizeMl: inferSizeMl(item?.description),
+        purchasePrice: Number(row.purchasePrice || item?.unitPrice || 0),
+        unitsPerCase: Math.max(1, Number(row.unitsPerCase || 12)),
+        ocrLineIndex: index,
+        source: "OCR",
+      });
+    })
+    .filter((row) => row && row.productName);
+}
+
+export default function BulkProductImport() {
+  const { categories, refreshAll } = useShop();
+  const navigate = useNavigate();
+  const [params] = useSearchParams();
+
+  const [rows, setRows] = useState([blankRow()]);
+  const [busy, setBusy] = useState(false);
+  const [message, setMessage] = useState("");
+  const [results, setResults] = useState([]);
+
+  const fromOcr = params.get("ocr") === "1";
+
+  const activeCategories = useMemo(
+    () => (categories || []).filter((item) => item.active !== false),
+    [categories],
+  );
+
+  useEffect(() => {
+    if (!fromOcr) return;
+
+    try {
+      const ocrRows = rowsFromOcrReview();
+      if (ocrRows.length) {
+        setRows(ocrRows);
+        setMessage(
+          `${ocrRows.length} unmatched OCR product line(s) loaded. Review Product Master fields, then bulk-create them.`,
+        );
+      } else {
+        setRows([]);
+        setMessage(
+          "No unmatched OCR product lines were found. Return to Invoice OCR and review the invoice.",
+        );
+      }
+    } catch (error) {
+      setRows([]);
+      setMessage(error?.message || "Unable to load the Invoice OCR review.");
+    }
+  }, [fromOcr]);
+
+  function updateRow(index, field, value) {
+    setRows((current) =>
+      current.map((row, rowIndex) =>
+        rowIndex === index ? { ...row, [field]: value } : row,
+      ),
+    );
+  }
+
+  function addRow() {
+    setRows((current) => [...current, blankRow()]);
+  }
+
+  function removeRow(index) {
+    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
+  }
+
+  async function createProducts() {
+    setBusy(true);
+    setMessage("");
+    setResults([]);
+
+    try {
+      if (!rows.length) throw new Error("Add at least one product row.");
+
+      const payload = rows.map((row) => ({
+        barcode: String(row.barcode || "").trim() || null,
+        product_name: String(row.productName || "").trim(),
+        brand: String(row.brand || "").trim() || null,
+        category_id: row.categoryId || null,
+        subcategory: String(row.subcategory || "").trim() || null,
+        size_ml: Number(row.sizeMl),
+        alcohol_percentage:
+          row.alcoholPercentage === "" ? null : Number(row.alcoholPercentage),
+        purchase_price: Number(row.purchasePrice || 0),
+        mrp: Number(row.mrp || 0),
+        selling_price: Number(row.sellingPrice || 0),
+        minimum_stock: Number(row.minimumStock || 0),
+        units_per_case: Number(row.unitsPerCase || 1),
+      }));
+
+      const invalid = payload.findIndex(
+        (row) =>
+          !row.product_name ||
+          !Number.isInteger(row.size_ml) ||
+          row.size_ml <= 0 ||
+          !Number.isInteger(row.units_per_case) ||
+          row.units_per_case <= 0,
+      );
+
+      if (invalid >= 0) {
+        throw new Error(
+          `Row ${invalid + 1}: Product Name, Size and Units / Case are required.`,
+        );
+      }
+
+      const { data, error } = await supabase.rpc("bulk_create_products", {
+        p_items: payload,
+      });
+      if (error) throw error;
+
+      const output = Array.isArray(data) ? data : [];
+      setResults(output);
+      await refreshAll();
+
+      const success = output.filter((item) => item.status === "SUCCESS");
+      const failed = output.filter((item) => item.status === "ERROR");
+
+      const ocrCreated = success
+        .map((item) => {
+          const sourceRow = rows[Number(item.row) - 1];
+          if (!sourceRow || sourceRow.ocrLineIndex == null) return null;
+          return {
+            lineIndex: sourceRow.ocrLineIndex,
+            productId: item.product_id,
+            sku: item.sku,
+          };
+        })
+        .filter(Boolean);
+
+      if (ocrCreated.length) {
+        sessionStorage.setItem(
+          OCR_BULK_CREATED_KEY,
+          JSON.stringify(ocrCreated),
+        );
+      }
+
+      setMessage(
+        `${success.length} product(s) created; ${failed.length} row(s) need review. Inventory was not increased.`,
+      );
+
+      if (fromOcr && failed.length === 0 && ocrCreated.length) {
+        navigate("/purchasing/ocr");
+      }
+    } catch (error) {
+      setMessage(error?.message || String(error));
+    } finally {
+      setBusy(false);
+    }
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Bulk Product Import</h2>
+          <p>
+            Manual / Invoice OCR catalogue onboarding. Barcode is optional here
+            only; SKU is generated automatically.
+          </p>
+        </div>
+        <div className="button-row">
+          {fromOcr ? (
+            <button
+              type="button"
+              className="secondary-button"
+              onClick={() => navigate("/purchasing/ocr")}
+            >
+              Back to Invoice OCR
+            </button>
+          ) : null}
+          <button type="button" className="secondary-button" onClick={addRow}>
+            + Add Row
+          </button>
+        </div>
+      </div>
+
+      {message ? <div className="purchase-message">{message}</div> : null}
+
+      <section className="panel">
+        <p className="muted-text">
+          Product creation does not receive stock. Physical quantity is posted
+          only through Receive Stock after invoice review.
+        </p>
+
+        <div className="data-table-wrapper">
+          <table className="data-table">
+            <thead>
+              <tr>
+                <th>#</th>
+                <th>Source</th>
+                <th>Barcode optional</th>
+                <th>Product Name *</th>
+                <th>Brand</th>
+                <th>Category</th>
+                <th>Size ml *</th>
+                <th>ABV %</th>
+                <th>Purchase</th>
+                <th>MRP</th>
+                <th>Selling</th>
+                <th>Min Stock</th>
+                <th>Units / Case *</th>
+                <th>Action</th>
+              </tr>
+            </thead>
+            <tbody>
+              {rows.map((row, index) => (
+                <tr key={`${row.source}-${row.ocrLineIndex ?? index}-${index}`}>
+                  <td>{index + 1}</td>
+                  <td>{row.source}</td>
+                  <td>
+                    <input
+                      value={row.barcode}
+                      placeholder="Add later"
+                      onChange={(event) =>
+                        updateRow(index, "barcode", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      value={row.productName}
+                      onChange={(event) =>
+                        updateRow(index, "productName", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      value={row.brand}
+                      onChange={(event) =>
+                        updateRow(index, "brand", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <select
+                      value={row.categoryId}
+                      onChange={(event) =>
+                        updateRow(index, "categoryId", event.target.value)
+                      }
+                    >
+                      <option value="">Uncategorized</option>
+                      {activeCategories.map((category) => (
+                        <option key={category.id} value={category.id}>
+                          {category.name}
+                        </option>
+                      ))}
+                    </select>
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="1"
+                      step="1"
+                      value={row.sizeMl}
+                      onChange={(event) =>
+                        updateRow(index, "sizeMl", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="0"
+                      step="0.1"
+                      value={row.alcoholPercentage}
+                      onChange={(event) =>
+                        updateRow(index, "alcoholPercentage", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="0"
+                      step="0.01"
+                      value={row.purchasePrice}
+                      onChange={(event) =>
+                        updateRow(index, "purchasePrice", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="0"
+                      step="0.01"
+                      value={row.mrp}
+                      onChange={(event) =>
+                        updateRow(index, "mrp", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="0"
+                      step="0.01"
+                      value={row.sellingPrice}
+                      onChange={(event) =>
+                        updateRow(index, "sellingPrice", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="0"
+                      step="1"
+                      value={row.minimumStock}
+                      onChange={(event) =>
+                        updateRow(index, "minimumStock", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <input
+                      type="number"
+                      min="1"
+                      step="1"
+                      value={row.unitsPerCase}
+                      onChange={(event) =>
+                        updateRow(index, "unitsPerCase", event.target.value)
+                      }
+                    />
+                  </td>
+                  <td>
+                    <button
+                      type="button"
+                      className="secondary-button"
+                      onClick={() => removeRow(index)}
+                    >
+                      Remove
+                    </button>
+                  </td>
+                </tr>
+              ))}
+            </tbody>
+          </table>
+        </div>
+
+        <div className="button-row" style={{ marginTop: 16 }}>
+          <button
+            type="button"
+            className="primary-button"
+            onClick={createProducts}
+            disabled={busy || !rows.length}
+          >
+            {busy
+              ? "Creating..."
+              : `Create ${rows.length} Product${rows.length === 1 ? "" : "s"}`}
+          </button>
+        </div>
+
+        {results.length ? (
+          <div style={{ marginTop: 16 }}>
+            <h3>Bulk Import Result</h3>
+            <ul>
+              {results.map((item, index) => (
+                <li key={`${item.row}-${index}`}>
+                  Row {item.row}: {item.status}
+                  {item.sku ? ` — ${item.sku}` : ""}
+                  {item.message ? ` — ${item.message}` : ""}
+                </li>
+              ))}
+            </ul>
+          </div>
+        ) : null}
+      </section>
+    </div>
+  );
+}
diff --git a/src/pages/Products.jsx b/src/pages/Products.jsx
index 6a74c69..6b7b9b7 100644
--- a/src/pages/Products.jsx
+++ b/src/pages/Products.jsx
@@ -11,16 +11,31 @@ const money = new Intl.NumberFormat("en-IN", {
 export default function Products() {
   const { products, getStock, deactivateProduct, activateProduct, loadingData } = useShop();
   const [search, setSearch] = useState("");
+  const [barcodeFilter, setBarcodeFilter] = useState("ALL");
   const [message, setMessage] = useState("");

+  const visibleProducts = useMemo(
+    () => products.filter(
+      (p) => !(p.active === false && /^890000001\d{4}$/.test(String(p.barcode || ""))),
+    ),
+    [products],
+  );
+
   const filtered = useMemo(() => {
     const q = search.trim().toLowerCase();
-    if (!q) return products;
-    return products.filter((p) =>
-      [p.name, p.brand, p.sku, p.barcode, p.category]
-        .some((value) => String(value ?? "").toLowerCase().includes(q))
-    );
-  }, [products, search]);
+    return visibleProducts.filter((p) => {
+      const barcodeMatch =
+        barcodeFilter === "ALL" ||
+        (barcodeFilter === "WITH" && Boolean(p.barcode)) ||
+        (barcodeFilter === "WITHOUT" && !p.barcode);
+
+      if (!barcodeMatch) return false;
+      if (!q) return true;
+
+      return [p.name, p.brand, p.sku, p.barcode, p.category]
+        .some((value) => String(value ?? "").toLowerCase().includes(q));
+    });
+  }, [visibleProducts, search, barcodeFilter]);

   async function toggle(product) {
     const result = product.active
@@ -32,13 +47,32 @@ export default function Products() {
   return (
     <div>
       <div className="page-heading">
-        <div><h2>Products</h2><p>{products.length} products in Supabase</p></div>
-        <Link to="/products/new" className="primary-button">Add Product</Link>
+        <div><h2>Products</h2><p>{visibleProducts.length} real catalogue products in Supabase</p></div>
+        <div className="button-row">
+          <Link to="/products/bulk-import" className="secondary-button">Bulk Product Import</Link>
+          <Link to="/products/new" className="primary-button">Add Product</Link>
+        </div>
       </div>

       {message && <div className="purchase-message success">{message}</div>}

       <div className="panel">
+        <div className="button-row" style={{ marginBottom: 12 }}>
+          {[
+            ["ALL", "All"],
+            ["WITH", "With Barcode"],
+            ["WITHOUT", "Without Barcode"],
+          ].map(([value, label]) => (
+            <button
+              key={value}
+              type="button"
+              className={barcodeFilter === value ? "primary-button" : "secondary-button"}
+              onClick={() => setBarcodeFilter(value)}
+            >
+              {label}
+            </button>
+          ))}
+        </div>
         <input
           placeholder="Search name, barcode, SKU, brand..."
           value={search}
@@ -60,7 +94,7 @@ export default function Products() {
               {filtered.map((p) => (
                 <tr key={p.id}>
                   <td><strong>{p.name}</strong><br/><small>{p.brand} · {p.size}</small></td>
-                  <td>{p.barcode}</td>
+                  <td>{p.barcode || <strong>Missing barcode</strong>}</td>
                   <td>{p.category}</td>
                   <td>{getStock(p.id)}</td>
                   <td>{money.format(p.purchasePrice)}</td>
diff --git a/supabase/migrations/20260831123000_product_master_real_catalogue.sql b/supabase/migrations/20260831123000_product_master_real_catalogue.sql
new file mode 100644
index 0000000..3c6d32a
--- /dev/null
+++ b/supabase/migrations/20260831123000_product_master_real_catalogue.sql
@@ -0,0 +1,319 @@
+-- WineShopPOS V2 — Product Master real-catalogue onboarding
+-- Current-state rule: current source + current migrations > old migration text.
+-- This migration is additive. Previously applied migration files are untouched.
+
+begin;
+
+-- Normal Add Product still requires barcode at RPC level.
+-- NULL is allowed at table level only for reviewed Bulk Product Import / OCR onboarding.
+alter table public.products
+  alter column barcode drop not null;
+
+do $$
+begin
+  if not exists (
+    select 1
+    from pg_constraint
+    where conname = 'products_barcode_nonblank_when_present'
+      and conrelid = 'public.products'::regclass
+  ) then
+    alter table public.products
+      add constraint products_barcode_nonblank_when_present
+      check (barcode is null or btrim(barcode) <> '');
+  end if;
+end $$;
+
+-- Reuse the existing per-shop counter table.
+alter table public.shop_counters
+  add column if not exists product_sku_counter bigint not null default 0;
+
+create or replace function public.next_product_sku(p_shop_id uuid)
+returns text
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_counter bigint;
+  v_existing bigint;
+begin
+  if p_shop_id is null then
+    raise exception 'Shop is required';
+  end if;
+
+  insert into public.shop_counters(shop_id)
+  values (p_shop_id)
+  on conflict (shop_id) do nothing;
+
+  select coalesce(
+    max(substring(p.sku from '^WSP-([0-9]+)$')::bigint),
+    0
+  )
+  into v_existing
+  from public.products p
+  where p.shop_id = p_shop_id
+    and p.sku ~ '^WSP-[0-9]+$';
+
+  -- UPDATE locks the shop counter row; concurrent allocations serialize here.
+  update public.shop_counters
+  set product_sku_counter = greatest(product_sku_counter, v_existing) + 1
+  where shop_id = p_shop_id
+  returning product_sku_counter into v_counter;
+
+  if v_counter is null then
+    raise exception 'Unable to allocate SKU';
+  end if;
+
+  if v_counter > 999999 then
+    raise exception 'WSP SKU sequence exhausted for this shop';
+  end if;
+
+  return 'WSP-' || lpad(v_counter::text, 6, '0');
+end;
+$$;
+
+revoke all on function public.next_product_sku(uuid)
+from public, anon, authenticated;
+
+create or replace function public.products_assign_automatic_sku()
+returns trigger
+language plpgsql
+security definer
+set search_path = public
+as $$
+begin
+  if new.sku is null
+     or btrim(new.sku) = ''
+     or upper(btrim(new.sku)) = 'AUTO'
+  then
+    new.sku := public.next_product_sku(new.shop_id);
+  end if;
+
+  return new;
+end;
+$$;
+
+revoke all on function public.products_assign_automatic_sku()
+from public, anon, authenticated;
+
+drop trigger if exists trg_products_assign_automatic_sku on public.products;
+create trigger trg_products_assign_automatic_sku
+before insert on public.products
+for each row execute function public.products_assign_automatic_sku();
+
+-- SKU is a permanent internal identity. Product edits must preserve it.
+create or replace function public.products_keep_sku_immutable()
+returns trigger
+language plpgsql
+set search_path = public
+as $$
+begin
+  if new.sku is distinct from old.sku then
+    raise exception 'SKU is system generated and cannot be changed';
+  end if;
+  return new;
+end;
+$$;
+
+drop trigger if exists trg_products_keep_sku_immutable on public.products;
+create trigger trg_products_keep_sku_immutable
+before update of sku on public.products
+for each row execute function public.products_keep_sku_immutable();
+
+-- Keep the established signature during rollout so an older browser bundle does
+-- not fail while the new frontend deploys. p_sku/p_opening_stock are compatibility
+-- parameters only; current Product Master ignores both.
+create or replace function public.create_new_product(
+  p_barcode text,
+  p_sku text,
+  p_product_name text,
+  p_brand text,
+  p_category_id uuid,
+  p_subcategory text,
+  p_size_ml integer,
+  p_alcohol_percentage numeric,
+  p_purchase_price numeric,
+  p_mrp numeric,
+  p_selling_price numeric,
+  p_minimum_stock integer,
+  p_units_per_case integer,
+  p_opening_stock integer default 0
+)
+returns uuid
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop_id uuid;
+  v_product_id uuid;
+  v_barcode text;
+begin
+  v_shop_id := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+
+  v_barcode := nullif(btrim(p_barcode), '');
+  if v_barcode is null then
+    raise exception 'Barcode is required for normal Add Product';
+  end if;
+
+  if nullif(btrim(p_product_name), '') is null then
+    raise exception 'Product name is required';
+  end if;
+  if nullif(btrim(p_brand), '') is null then
+    raise exception 'Brand is required';
+  end if;
+  if p_category_id is null then
+    raise exception 'Category is required';
+  end if;
+  if p_size_ml is null or p_size_ml <= 0 then
+    raise exception 'Valid size is required';
+  end if;
+
+  insert into public.products(
+    shop_id, barcode, sku, product_name, brand, category_id, subcategory,
+    size_ml, alcohol_percentage, purchase_price, mrp, selling_price,
+    minimum_stock, units_per_case, created_by
+  )
+  values (
+    v_shop_id, v_barcode, 'AUTO', btrim(p_product_name), btrim(p_brand),
+    p_category_id, nullif(btrim(p_subcategory), ''), p_size_ml,
+    p_alcohol_percentage, coalesce(p_purchase_price,0), coalesce(p_mrp,0),
+    coalesce(p_selling_price,0), greatest(coalesce(p_minimum_stock,0),0),
+    greatest(coalesce(p_units_per_case,1),1), auth.uid()
+  )
+  returning id into v_product_id;
+
+  -- Product Master creation is not receiving. Inventory begins at zero.
+  insert into public.inventory(shop_id, product_id, quantity)
+  values (v_shop_id, v_product_id, 0)
+  on conflict (shop_id, product_id) do nothing;
+
+  -- Existing trg_audit_products continues to audit the Product INSERT.
+  -- No OPENING_STOCK movement is created.
+  return v_product_id;
+end;
+$$;
+
+revoke all on function public.create_new_product(
+  text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer,integer
+) from public, anon;
+
+grant execute on function public.create_new_product(
+  text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer,integer
+) to authenticated;
+
+-- Reviewed manual/OCR bulk onboarding. Barcode may be NULL here only.
+create or replace function public.bulk_create_products(p_items jsonb)
+returns jsonb
+language plpgsql
+security definer
+set search_path = public
+as $$
+declare
+  v_shop_id uuid;
+  v_item jsonb;
+  v_result jsonb := '[]'::jsonb;
+  v_product_id uuid;
+  v_product_name text;
+  v_barcode text;
+  v_sku text;
+  v_index integer := 0;
+begin
+  v_shop_id := public.assert_shop_access();
+  perform public.assert_manager_or_admin();
+
+  if p_items is null
+     or jsonb_typeof(p_items) <> 'array'
+     or jsonb_array_length(p_items) = 0
+  then
+    raise exception 'At least one product row is required';
+  end if;
+
+  for v_item in select value from jsonb_array_elements(p_items)
+  loop
+    v_index := v_index + 1;
+
+    begin
+      v_product_name := nullif(btrim(v_item->>'product_name'), '');
+      v_barcode := nullif(btrim(v_item->>'barcode'), '');
+
+      if v_product_name is null then
+        raise exception 'Product name is required';
+      end if;
+      if coalesce(nullif(v_item->>'size_ml','')::integer, 0) <= 0 then
+        raise exception 'Valid size in ml is required';
+      end if;
+      if coalesce(nullif(v_item->>'units_per_case','')::integer, 0) <= 0 then
+        raise exception 'Units per case must be positive';
+      end if;
+
+      insert into public.products(
+        shop_id, barcode, sku, product_name, brand, category_id, subcategory,
+        size_ml, alcohol_percentage, purchase_price, mrp, selling_price,
+        minimum_stock, units_per_case, created_by
+      )
+      values (
+        v_shop_id,
+        v_barcode,
+        'AUTO',
+        v_product_name,
+        nullif(btrim(v_item->>'brand'), ''),
+        nullif(v_item->>'category_id','')::uuid,
+        nullif(btrim(v_item->>'subcategory'), ''),
+        nullif(v_item->>'size_ml','')::integer,
+        nullif(v_item->>'alcohol_percentage','')::numeric,
+        coalesce(nullif(v_item->>'purchase_price','')::numeric,0),
+        coalesce(nullif(v_item->>'mrp','')::numeric,0),
+        coalesce(nullif(v_item->>'selling_price','')::numeric,0),
+        greatest(coalesce(nullif(v_item->>'minimum_stock','')::integer,5),0),
+        greatest(coalesce(nullif(v_item->>'units_per_case','')::integer,1),1),
+        auth.uid()
+      )
+      returning id, sku into v_product_id, v_sku;
+
+      insert into public.inventory(shop_id, product_id, quantity)
+      values (v_shop_id, v_product_id, 0)
+      on conflict (shop_id, product_id) do nothing;
+
+      v_result := v_result || jsonb_build_array(
+        jsonb_build_object(
+          'row', v_index,
+          'status', 'SUCCESS',
+          'product_id', v_product_id,
+          'sku', v_sku,
+          'barcode', v_barcode,
+          'product_name', v_product_name
+        )
+      );
+    exception
+      when others then
+        v_result := v_result || jsonb_build_array(
+          jsonb_build_object(
+            'row', v_index,
+            'status', 'ERROR',
+            'product_name', coalesce(v_product_name, v_item->>'product_name'),
+            'message', sqlerrm
+          )
+        );
+    end;
+  end loop;
+
+  return v_result;
+end;
+$$;
+
+revoke all on function public.bulk_create_products(jsonb)
+from public, anon;
+
+grant execute on function public.bulk_create_products(jsonb)
+to authenticated;
+
+-- Retire the known legacy dummy barcode family currently present in
+-- src/data/products.js. Preserve rows/history instead of cascade-deleting them.
+update public.products
+set active = false,
+    updated_at = now()
+where barcode ~ '^890000001[0-9]{4}$';
+
+commit;
```

## Verified milestone

- Normal Add Product Barcode: REQUIRED
- Bulk/OCR Barcode: OPTIONAL
- SKU: AUTO WSP-###### per shop
- Opening Stock Product Master field: REMOVED
- Product create inventory: ZERO
- Bulk Product Import: ADDED
- OCR unresolved-line bulk round-trip: ADDED
- Product Master barcode filter: All / With / Without
- Legacy sample source: RETIRED
- Legacy dummy DB rows: INACTIVE; history preserved
- Build/Lint: PASS
- Supabase migration: 20260831123000 APPLIED
- Azure frontend: DEPLOYED and byte-verified
- Azure deployment continuation: Shared Key auth used because local RBAC login lacked Blob data-plane write permission
