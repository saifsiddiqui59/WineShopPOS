# Supplier Master + OCR Supplier Confirmation - Actual Git Code History

Release commit: `5fba09a9127fd4a5b22cb56cf908c12d7e16a85f`

Generated from the actual Git commit after successful build and deployment.

```text
commit 5fba09a9127fd4a5b22cb56cf908c12d7e16a85f
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sun Aug 30 01:38:23 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sun Aug 30 01:38:23 2026 -0400

    Patch - Supplier master and OCR supplier confirmation

 ...OS_Developer_Handbook_Master_Reconsolidation.md |   6 +
 .../NEXT_CHAT_CONTEXT_MASTER_RECONSOLIDATION.txt   |   4 +
 ...neShopPOS_User_Manual_Master_Reconsolidation.md |   8 +
 docs/patches/2026-08-30-supplier-ocr-workflow.md   |  41 ++++
 docs/testing/MASTER_RECONSOLIDATION_TEST_MATRIX.md |  15 ++
 src/App.jsx                                        |   3 +
 src/components/SupplierEditor.jsx                  | 162 ++++++++++++++
 src/config/navigation.js                           |   1 +
 src/masterConsolidation.css                        |   7 +
 src/pages/AutomationHub.jsx                        | 235 +++++++++++++++++++-
 src/pages/Procurement.jsx                          | 239 +++++++++++++++++++--
 src/pages/Suppliers.jsx                            |  86 ++++++++
 supabase/functions/ocr-invoice/index.ts            |   4 +
 13 files changed, 786 insertions(+), 25 deletions(-)
```

```diff
diff --git a/src/App.jsx b/src/App.jsx
index 9a56828..fc81b7d 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -19,6 +19,7 @@ import EditProduct from "./pages/EditProduct";
 import BarcodeLabels from "./pages/BarcodeLabels";
 import Purchases from "./pages/Purchases";
 import Procurement from "./pages/Procurement";
+import Suppliers from "./pages/Suppliers";
 import PurchaseIntelligence from "./pages/PurchaseIntelligence";
 import Inventory from "./pages/Inventory";
 import StockCount from "./pages/StockCount";
@@ -79,6 +80,7 @@ export default function App() {
           <Route path="purchasing" element={module("Purchases & Suppliers", "Receive goods, control procurement and understand supplier/purchase cost changes.", MODULE_TABS.purchasing)}>
             <Route index element={<Navigate to="receive" replace/>}/>
             <Route path="receive" element={<Purchases/>}/>
+            <Route path="suppliers" element={<Suppliers/>}/>
             <Route path="procurement" element={<Procurement/>}/>
             <Route path="intelligence" element={<PurchaseIntelligence/>}/>
           </Route>
@@ -141,6 +143,7 @@ export default function App() {
         <Route path="offline-queue" element={<Navigate to="/operations/offline" replace/>}/>
         <Route path="stock-count" element={<Navigate to="/inventory/count" replace/>}/>
         <Route path="purchases" element={<Navigate to="/purchasing/receive" replace/>}/>
+        <Route path="suppliers" element={<Navigate to="/purchasing/suppliers" replace/>}/>
         <Route path="procurement" element={<Navigate to="/purchasing/procurement" replace/>}/>
         <Route path="price-history" element={<Navigate to="/purchasing/intelligence" replace/>}/>
         <Route path="reorder" element={<Navigate to="/inventory/intelligence" replace/>}/>
diff --git a/src/components/SupplierEditor.jsx b/src/components/SupplierEditor.jsx
new file mode 100644
index 0000000..552ad65
--- /dev/null
+++ b/src/components/SupplierEditor.jsx
@@ -0,0 +1,162 @@
+import { useEffect, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useAuth } from "../context/AuthContext";
+
+const EMPTY = {
+  supplier_name: "",
+  contact_person: "",
+  mobile: "",
+  email: "",
+  gst_number: "",
+  address: "",
+  active: true,
+};
+
+export default function SupplierEditor({ open, supplier = null, defaults = null, onClose, onSaved }) {
+  const { profile } = useAuth();
+  const [form, setForm] = useState(EMPTY);
+  const [busy, setBusy] = useState(false);
+  const [message, setMessage] = useState("");
+
+  useEffect(() => {
+    if (!open) return;
+    let cancelled = false;
+
+    async function load() {
+      setMessage("");
+      setForm({ ...EMPTY, ...(defaults || {}), ...(supplier || {}) });
+      if (!supplier?.id) return;
+
+      const { data, error } = await supabase
+        .from("suppliers")
+        .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
+        .eq("id", supplier.id)
+        .single();
+
+      if (cancelled) return;
+      if (error) setMessage("Unable to load supplier details.");
+      else setForm({ ...EMPTY, ...data });
+    }
+
+    load();
+    return () => { cancelled = true; };
+  }, [open, supplier, defaults]);
+
+  if (!open) return null;
+
+  function setField(key, value) {
+    setForm((current) => ({ ...current, [key]: value }));
+  }
+
+  async function save(event) {
+    event.preventDefault();
+    const name = String(form.supplier_name || "").trim();
+    if (!name) {
+      setMessage("Supplier name is required.");
+      return;
+    }
+    if (!profile?.shop_id) {
+      setMessage("Active shop is not available.");
+      return;
+    }
+
+    setBusy(true);
+    setMessage("");
+    try {
+      const duplicateQuery = await supabase
+        .from("suppliers")
+        .select("id,supplier_name")
+        .eq("shop_id", profile.shop_id)
+        .limit(500);
+
+      if (duplicateQuery.error) throw duplicateQuery.error;
+      const duplicate = (duplicateQuery.data || []).find((row) =>
+        row.id !== supplier?.id && String(row.supplier_name || "").trim().toLowerCase() === name.toLowerCase()
+      );
+      if (duplicate) {
+        setMessage(`A supplier named “${duplicate.supplier_name}” already exists.`);
+        return;
+      }
+
+      const payload = {
+        supplier_name: name,
+        contact_person: String(form.contact_person || "").trim() || null,
+        mobile: String(form.mobile || "").trim() || null,
+        email: String(form.email || "").trim() || null,
+        gst_number: String(form.gst_number || "").trim() || null,
+        address: String(form.address || "").trim() || null,
+        active: form.active !== false,
+      };
+
+      let result;
+      if (supplier?.id) {
+        result = await supabase
+          .from("suppliers")
+          .update(payload)
+          .eq("id", supplier.id)
+          .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
+          .single();
+      } else {
+        result = await supabase
+          .from("suppliers")
+          .insert({ shop_id: profile.shop_id, ...payload })
+          .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
+          .single();
+      }
+
+      if (result.error) throw result.error;
+      await onSaved?.(result.data);
+      onClose?.();
+    } catch (error) {
+      console.error(error);
+      setMessage("Unable to save supplier. Check the details and try again.");
+    } finally {
+      setBusy(false);
+    }
+  }
+
+  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose?.(); }}>
+    <form className="modal-card supplier-editor" onSubmit={save} role="dialog" aria-modal="true" aria-label={supplier?.id ? "Edit supplier" : "Create supplier"}>
+      <div className="modal-header">
+        <div>
+          <h3>{supplier?.id ? "Edit Supplier" : "New Supplier"}</h3>
+          <p className="muted-text">Supplier details are available only to authorized shop management users.</p>
+        </div>
+        <button type="button" className="icon-button" aria-label="Close" onClick={onClose} disabled={busy}>×</button>
+      </div>
+
+      {message ? <div className="purchase-message error">{message}</div> : null}
+
+      <div className="form-grid">
+        <label>Supplier Name *
+          <input autoFocus required value={form.supplier_name || ""} onChange={(e) => setField("supplier_name", e.target.value)} />
+        </label>
+        <label>Contact Person
+          <input value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
+        </label>
+        <label>Mobile
+          <input inputMode="tel" value={form.mobile || ""} onChange={(e) => setField("mobile", e.target.value)} />
+        </label>
+        <label>Email
+          <input type="email" value={form.email || ""} onChange={(e) => setField("email", e.target.value)} />
+        </label>
+        <label>GST / Tax Number
+          <input value={form.gst_number || ""} onChange={(e) => setField("gst_number", e.target.value)} />
+        </label>
+        <label className="span-two">Address
+          <textarea rows="3" value={form.address || ""} onChange={(e) => setField("address", e.target.value)} />
+        </label>
+      </div>
+
+      {supplier?.id ? <label className="checkbox-row">
+        <input type="checkbox" checked={form.active !== false} onChange={(e) => setField("active", e.target.checked)} /> Active supplier
+      </label> : null}
+
+      <div className="button-row end">
+        <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancel</button>
+        <button className="primary-button" disabled={busy}>{busy ? "Saving..." : supplier?.id ? "Save Supplier" : "Create Supplier"}</button>
+      </div>
+    </form>
+  </div>;
+}
+
diff --git a/src/config/navigation.js b/src/config/navigation.js
index 2e84610..4bc8254 100644
--- a/src/config/navigation.js
+++ b/src/config/navigation.js
@@ -34,6 +34,7 @@ export const MODULE_TABS = {
   ],
   purchasing: [
     { path: "/purchasing/receive", label: "Receive Stock", roles: ["ADMIN", "MANAGER"] },
+    { path: "/purchasing/suppliers", label: "Suppliers", roles: ["ADMIN", "MANAGER"] },
     { path: "/purchasing/procurement", label: "Procurement", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
     { path: "/purchasing/intelligence", label: "Purchase Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
   ],
diff --git a/src/masterConsolidation.css b/src/masterConsolidation.css
index 08ac589..da78fe9 100644
--- a/src/masterConsolidation.css
+++ b/src/masterConsolidation.css
@@ -348,3 +348,10 @@ html[data-theme="dark"] .access-chip.allowed { color:#66d3a9; background:#10352a

 @media(max-width:1150px){.dashboard-chart-grid.primary,.dashboard-chart-grid{grid-template-columns:1fr}.role-summary-grid{grid-template-columns:1fr}.settings-action-bar{position:static;flex-direction:column;align-items:flex-start}.settings-action-bar .button-row{width:100%;}}
 @media(max-width:760px){.settings-fields{grid-template-columns:1fr}.settings-fields .span-two{grid-column:auto}.donut-layout{grid-template-columns:1fr}.dashboard-chart-grid{grid-template-columns:1fr}.theme-toggle span{display:none}.chart-card{min-height:280px}.role-rule-list>div{grid-template-columns:1fr}.column-chart{overflow-x:auto;justify-content:flex-start}.column-item{min-width:76px}.metric-card strong{font-size:22px!important}}
+
+
+/* SUPPLIER_OCR_PATCH_STYLES */
+.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.48);display:flex;align-items:center;justify-content:center;padding:24px;z-index:1200;backdrop-filter:blur(3px)}
+.modal-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:18px;box-shadow:0 24px 70px rgba(15,23,42,.22);padding:22px}
+.modal-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.modal-header h3{margin:0}.modal-header p{margin:5px 0 0}.supplier-editor .form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.supplier-editor .span-two{grid-column:1/-1}.supplier-editor textarea{resize:vertical}.checkbox-row{display:flex!important;align-items:center;gap:8px;margin:12px 0}.checkbox-row input{width:auto}.button-row.end{justify-content:flex-end}.filter-row{display:flex;gap:12px;align-items:center;justify-content:space-between}.filter-row .search-input{flex:1;min-width:220px}.table-subtext{font-size:12px;margin-top:4px;max-width:380px;white-space:normal}.supplier-inline-actions{margin:10px 0 16px}.ocr-supplier-summary{display:grid;gap:4px;padding:12px 14px;border:1px solid var(--border,#e2e8f0);border-radius:12px;background:var(--surface-soft,#f8fafc);margin-bottom:12px}.ocr-supplier-summary p{margin:0}.purchase-message.success{border-color:rgba(22,163,74,.25);background:rgba(22,163,74,.08)}
+@media(max-width:760px){.supplier-editor .form-grid{grid-template-columns:1fr}.supplier-editor .span-two{grid-column:auto}.filter-row{align-items:stretch;flex-direction:column}.modal-backdrop{padding:10px}.modal-card{border-radius:14px;padding:16px}}
diff --git a/src/pages/AutomationHub.jsx b/src/pages/AutomationHub.jsx
index 0211d1b..df3c3bb 100644
--- a/src/pages/AutomationHub.jsx
+++ b/src/pages/AutomationHub.jsx
@@ -1,11 +1,232 @@
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "../lib/supabase";
 import { useShop } from "../context/ShopContext";
+import SupplierEditor from "../components/SupplierEditor";
+
+function normalizeSupplierName(value) {
+  return String(value || "")
+    .toLowerCase()
+    .replace(/&/g, " and ")
+    .replace(/\b(private|pvt|limited|ltd|llp|company|co)\b/g, " ")
+    .replace(/[^a-z0-9]+/g, " ")
+    .trim()
+    .replace(/\s+/g, " ");
+}
+
+function supplierScore(ocrName, supplierName) {
+  const a = normalizeSupplierName(ocrName);
+  const b = normalizeSupplierName(supplierName);
+  if (!a || !b) return 0;
+  if (a === b) return 100;
+  if (a.includes(b) || b.includes(a)) return 88;
+  const aa = new Set(a.split(" ").filter(Boolean));
+  const bb = new Set(b.split(" ").filter(Boolean));
+  const intersection = [...aa].filter((token) => bb.has(token)).length;
+  const union = new Set([...aa, ...bb]).size;
+  return union ? Math.round((intersection / union) * 80) : 0;
+}
+
+export default function AutomationHub() {
+  const { products, suppliers, refreshAll } = useShop();
+  const navigate = useNavigate();
+  const [file, setFile] = useState(null);
+  const [result, setResult] = useState(null);
+  const [matches, setMatches] = useState({});
+  const [message, setMessage] = useState("");
+  const [busy, setBusy] = useState(false);
+  const [supplierId, setSupplierId] = useState("");
+  const [confirmedSupplier, setConfirmedSupplier] = useState(null);
+  const [supplierEditorOpen, setSupplierEditorOpen] = useState(false);
+
+  const supplierMatches = useMemo(() => {
+    if (!result?.supplierName) return [];
+    return suppliers
+      .filter((supplier) => supplier.active !== false)
+      .map((supplier) => ({ ...supplier, score: supplierScore(result.supplierName, supplier.supplier_name) }))
+      .filter((supplier) => supplier.score >= 35)
+      .sort((a, b) => b.score - a.score || a.supplier_name.localeCompare(b.supplier_name))
+      .slice(0, 5);
+  }, [result?.supplierName, suppliers]);
+
+  function toBase64(nextFile) {
+    return new Promise((resolve, reject) => {
+      const reader = new FileReader();
+      reader.onload = () => resolve(String(reader.result).split(",")[1]);
+      reader.onerror = () => reject(reader.error);
+      reader.readAsDataURL(nextFile);
+    });
+  }
+
+  async function analyze() {
+    if (!file) return;
+    if (file.size > 4 * 1024 * 1024) {
+      setMessage("F0 OCR accepts files up to 4 MB. Compress or split this invoice first.");
+      return;
+    }
+
+    setBusy(true);
+    setMessage("");
+    setConfirmedSupplier(null);
+    setSupplierId("");
+    try {
+      const contentBase64 = await toBase64(file);
+      const { data, error } = await supabase.functions.invoke("ocr-invoice", {
+        body: { contentBase64, contentType: file.type || "application/octet-stream" },
+      });
+      if (error) throw error;
+      if (!data?.ok) throw new Error(data?.message || "OCR failed");
+
+      setResult(data.invoice);
+      const next = {};
+      for (let i = 0; i < (data.invoice.items || []).length; i += 1) {
+        const item = data.invoice.items[i];
+        const { data: productMatches } = await supabase.rpc("match_product_text", {
+          p_text: item.description,
+          p_supplier_id: null,
+          p_limit: 5,
+        });
+        next[i] = productMatches || [];
+      }
+      setMatches(next);
+
+      const ranked = suppliers
+        .filter((supplier) => supplier.active !== false)
+        .map((supplier) => ({ ...supplier, score: supplierScore(data.invoice.supplierName, supplier.supplier_name) }))
+        .sort((a, b) => b.score - a.score);
+      if (ranked[0]?.score >= 80) setSupplierId(ranked[0].id);
+    } catch (error) {
+      setMessage(error.message || String(error));
+    } finally {
+      setBusy(false);
+    }
+  }
+
+  function confirmExistingSupplier() {
+    const supplier = suppliers.find((row) => row.id === supplierId);
+    if (!supplier) {
+      setMessage("Select an existing supplier first.");
+      return;
+    }
+    setConfirmedSupplier(supplier);
+    setMessage(`Supplier confirmed: ${supplier.supplier_name}.`);
+  }
+
+  async function supplierCreated(supplier) {
+    await refreshAll();
+    setSupplierId(supplier.id);
+    setConfirmedSupplier(supplier);
+    setMessage(`Supplier created and confirmed: ${supplier.supplier_name}.`);
+  }
+
+  function useDraft() {
+    if (!result) return;
+    if (!confirmedSupplier) {
+      setMessage("Confirm an existing supplier or create a reviewed supplier before continuing.");
+      return;
+    }
+
+    const lines = (result.items || []).map((item, index) => {
+      const selected = (matches[index] || [])[0];
+      const product = products.find((row) => row.id === selected?.product_id);
+      return {
+        description: item.description,
+        productId: product?.id || "",
+        quantity: Number(item.quantity || 1),
+        caseCount: 0,
+        unitsPerCase: product?.unitsPerCase || 1,
+        looseBottles: Number(item.quantity || 1),
+        purchasePrice: Number(item.unitPrice || product?.purchasePrice || 0),
+        confidence: item.confidence,
+        matchScore: selected?.score || 0,
+      };
+    });
+
+    sessionStorage.setItem("wineshop_ocr_purchase_draft", JSON.stringify({
+      supplierId: confirmedSupplier.id,
+      supplierName: confirmedSupplier.supplier_name,
+      invoiceNumber: result.invoiceNumber || "",
+      invoiceDate: result.invoiceDate || new Date().toISOString().slice(0, 10),
+      items: lines,
+      sourceFile: file?.name,
+      createdAt: new Date().toISOString(),
+    }));
+    navigate("/purchasing/receive");
+  }
+
+  const supplierDefaults = useMemo(() => ({
+    supplier_name: result?.supplierName || "",
+    gst_number: result?.vendorTaxId || "",
+    address: result?.vendorAddress || "",
+  }), [result?.supplierName, result?.vendorTaxId, result?.vendorAddress]);
+
+  return <div>
+    <div className="page-heading"><div><h2>OCR & Automation Hub</h2><p>Invoice OCR with mandatory supplier and product review before stock receipt.</p></div></div>
+    {message ? <div className="purchase-message">{message}</div> : null}
+
+    <div className="settings-grid">
+      <section className="panel">
+        <h3>Purchase Invoice OCR</h3>
+        <input type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
+        <br/><br/>
+        <button className="primary-button" disabled={!file || busy} onClick={analyze}>{busy ? "Analyzing..." : "Analyze Invoice"}</button>
+        <p><small>Azure Document Intelligence runs server-side. OCR never creates stock or a supplier silently. A Manager/Admin must review and confirm first.</small></p>
+      </section>
+      <section className="panel">
+        <h3>Safe OCR Workflow</h3>
+        <p>Invoice → OCR → supplier match → product match → human review → controlled stock receipt.</p>
+        <p className="muted-text">Vendor name, vendor address and vendor tax ID are used only as suggestions for supplier creation.</p>
+      </section>
+    </div>
+
+    {result ? <section className="panel" style={{ marginTop: 16 }}>
+      <h3>1. Confirm Supplier</h3>
+      <div className="ocr-supplier-summary">
+        <p>OCR Supplier: <strong>{result.supplierName || "Not detected"}</strong></p>
+        {result.vendorTaxId ? <p>Tax / GST ID: <strong>{result.vendorTaxId}</strong></p> : null}
+        {result.vendorAddress ? <p>Address: <strong>{result.vendorAddress}</strong></p> : null}
+      </div>
+
+      {confirmedSupplier ? <div className="purchase-message success">Confirmed supplier: <strong>{confirmedSupplier.supplier_name}</strong></div> : <>
+        {supplierMatches[0] ? <p className="muted-text">Best existing match: <strong>{supplierMatches[0].supplier_name}</strong> · confidence score {supplierMatches[0].score}%</p> : <p className="muted-text">No close existing supplier match was found.</p>}
+        <div className="form-grid">
+          <label>Existing Supplier
+            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
+              <option value="">Select existing supplier</option>
+              {suppliers.filter((supplier) => supplier.active !== false).map((supplier) => {
+                const scored = supplierMatches.find((match) => match.id === supplier.id);
+                return <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}{scored ? ` · ${scored.score}% match` : ""}</option>;
+              })}
+            </select>
+          </label>
+        </div>
+        <div className="button-row">
+          <button className="primary-button" type="button" disabled={!supplierId} onClick={confirmExistingSupplier}>Use Existing Supplier</button>
+          <button className="secondary-button" type="button" onClick={() => setSupplierEditorOpen(true)}>Create Supplier From Invoice</button>
+        </div>
+      </>}
+    </section> : null}
+
+    {result ? <section className="panel" style={{ marginTop: 16 }}>
+      <h3>2. Review Product Matches</h3>
+      <p>Invoice: <strong>{result.invoiceNumber || "-"}</strong> · Date: <strong>{result.invoiceDate || "-"}</strong></p>
+      <div className="data-table-wrapper"><table className="data-table">
+        <thead><tr><th>OCR Description</th><th>Qty</th><th>Unit Price</th><th>Best Product Match</th><th>Score</th></tr></thead>
+        <tbody>{(result.items || []).map((item, index) => {
+          const match = (matches[index] || [])[0];
+          return <tr key={index}><td>{item.description}</td><td>{item.quantity}</td><td>{item.unitPrice}</td><td>{match?.product_name || "No confident match"}</td><td>{match?.score || "-"}</td></tr>;
+        })}</tbody>
+      </table></div>
+      <button className="primary-button" disabled={!confirmedSupplier} onClick={useDraft}>Send Reviewed Draft to Receive Stock</button>
+      {!confirmedSupplier ? <p className="muted-text">Supplier confirmation is required before continuing.</p> : null}
+    </section> : null}
+
+    <SupplierEditor
+      open={supplierEditorOpen}
+      defaults={supplierDefaults}
+      onClose={() => setSupplierEditorOpen(false)}
+      onSaved={supplierCreated}
+    />
+  </div>;
+}

-export default function AutomationHub(){const{products}=useShop();const navigate=useNavigate();const[file,setFile]=useState(null);const[result,setResult]=useState(null);const[matches,setMatches]=useState({});const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
-function toBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
-async function analyze(){if(!file)return;if(file.size>4*1024*1024){setMessage("F0 OCR accepts files up to 4 MB. Compress or split this invoice first.");return}setBusy(true);setMessage("");try{const contentBase64=await toBase64(file);const{data,error}=await supabase.functions.invoke("ocr-invoice",{body:{contentBase64,contentType:file.type||"application/octet-stream"}});if(error)throw error;if(!data?.ok)throw new Error(data?.message||"OCR failed");setResult(data.invoice);const next={};for(let i=0;i<(data.invoice.items||[]).length;i++){const item=data.invoice.items[i];const{data:m}=await supabase.rpc("match_product_text",{p_text:item.description,p_supplier_id:null,p_limit:5});next[i]=m||[]}setMatches(next)}catch(e){setMessage(e.message||String(e))}finally{setBusy(false)}}
-function useDraft(){if(!result)return;const lines=(result.items||[]).map((item,i)=>{const selected=(matches[i]||[])[0];const p=products.find((x)=>x.id===selected?.product_id);return{description:item.description,productId:p?.id||"",quantity:Number(item.quantity||1),caseCount:0,unitsPerCase:p?.unitsPerCase||1,looseBottles:Number(item.quantity||1),purchasePrice:Number(item.unitPrice||p?.purchasePrice||0),confidence:item.confidence,matchScore:selected?.score||0}});sessionStorage.setItem("wineshop_ocr_purchase_draft",JSON.stringify({supplierName:result.supplierName||"",invoiceNumber:result.invoiceNumber||"",invoiceDate:result.invoiceDate||new Date().toISOString().slice(0,10),items:lines,sourceFile:file?.name,createdAt:new Date().toISOString()}));navigate("/purchases")}
-return <div><div className="page-heading"><div><h2>OCR & Automation Hub</h2><p>Invoice OCR with mandatory human review before stock receipt.</p></div></div>{message&&<div className="purchase-message error">{message}</div>}<div className="settings-grid"><section className="panel"><h3>Purchase Invoice OCR</h3><input type="file" accept="image/*,.pdf,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)}/><br/><br/><button className="primary-button" disabled={!file||busy} onClick={analyze}>{busy?"Analyzing...":"Analyze Invoice"}</button><p><small>Azure Document Intelligence F0 is configured server-side. F0 is intended for low-cost testing and processes only the first two pages of a document; upload files up to 4 MB. Human review is mandatory before inventory changes.</small></p></section><section className="panel"><h3>Compliance / AI Roadmap</h3><p>State excise/compliance reports are not claimed as implemented because the exact Indian state, licensing format and statutory report specification must be selected first.</p><p>Smart reorder is already rule-based. Future anomaly detection and an owner assistant should read audited business data, never bypass transaction controls.</p></section></div>
-{result&&<section className="panel" style={{marginTop:16}}><h3>Human Review</h3><p>Supplier: <strong>{result.supplierName||"-"}</strong> · Invoice: <strong>{result.invoiceNumber||"-"}</strong> · Date: <strong>{result.invoiceDate||"-"}</strong></p><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>OCR Description</th><th>Qty</th><th>Unit Price</th><th>Best Product Match</th><th>Score</th></tr></thead><tbody>{(result.items||[]).map((item,i)=>{const m=(matches[i]||[])[0];return <tr key={i}><td>{item.description}</td><td>{item.quantity}</td><td>{item.unitPrice}</td><td>{m?.product_name||"No confident match"}</td><td>{m?.score||"-"}</td></tr>})}</tbody></table></div><button className="primary-button" onClick={useDraft}>Send Reviewed Draft to Receive Stock</button></section>}</div>}
diff --git a/src/pages/Procurement.jsx b/src/pages/Procurement.jsx
index f719bed..6cb7496 100644
--- a/src/pages/Procurement.jsx
+++ b/src/pages/Procurement.jsx
@@ -5,21 +5,224 @@ import FeatureTierBadge from "../components/ui/FeatureTierBadge";
 import PageHeader from "../components/ui/PageHeader";
 import StatusBadge from "../components/ui/StatusBadge";
 import EmptyState from "../components/ui/EmptyState";
-const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
-const line=()=>({productId:"",quantity:12,purchasePrice:0});
-export default function Procurement(){const{products,suppliers,refreshAll}=useShop();const[orders,setOrders]=useState([]);const[balances,setBalances]=useState([]);const[supplierId,setSupplierId]=useState("");const[items,setItems]=useState([line()]);const[expected,setExpected]=useState("");const[message,setMessage]=useState("");const[payment,setPayment]=useState({supplierId:"",amount:"",method:"BANK_TRANSFER",reference:""});const[receive,setReceive]=useState({poId:"",invoice:"",date:new Date().toISOString().slice(0,10)});const[ret,setRet]=useState({supplierId:"",productId:"",qty:1,reason:"Damaged/incorrect supply"});
-async function load(){const[po,b]=await Promise.all([supabase.from("purchase_orders").select("*,purchase_order_items(*)").order("created_at",{ascending:false}).limit(150),supabase.rpc("supplier_balances")]);if(po.error||b.error)setMessage("Unable to load procurement data.");else{setOrders(po.data||[]);setBalances(b.data||[])}}useEffect(()=>{load()},[]);
-function update(i,k,v){setItems(x=>x.map((r,n)=>n===i?{...r,[k]:v,...(k==="productId"?{purchasePrice:products.find(p=>p.id===v)?.purchasePrice||0}:{})}:r))}const total=useMemo(()=>items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.purchasePrice||0),0),[items]);
-async function createPO(e){e.preventDefault();const payload=items.filter(i=>i.productId&&Number(i.quantity)>0).map(i=>({product_id:i.productId,quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{error}=await supabase.rpc("create_purchase_order",{p_supplier_id:supplierId,p_items:payload,p_expected_date:expected||null,p_notes:null});setMessage(error?"Unable to create purchase order.":"Draft purchase order created.");if(!error){setItems([line()]);await load()}}
-async function rpc(fn,args,ok){const{error}=await supabase.rpc(fn,args);setMessage(error?`Unable to complete ${ok.toLowerCase()}.`:ok);if(!error){await Promise.all([load(),refreshAll()])}}
-async function receivePO(e){e.preventDefault();if(!receive.poId)return;const{error}=await supabase.rpc("receive_purchase_order",{p_po_id:receive.poId,p_invoice_number:receive.invoice,p_invoice_date:receive.date,p_receive_items:null,p_notes:"Received from consolidated Procurement"});setMessage(error?"Unable to receive this purchase order. Check status, invoice number and quantities.":"Goods received; inventory and supplier balance updated transactionally.");if(!error){setReceive({...receive,poId:"",invoice:""});await Promise.all([load(),refreshAll()])}}
-async function pay(e){e.preventDefault();const{error}=await supabase.rpc("record_supplier_payment",{p_supplier_id:payment.supplierId,p_amount:Number(payment.amount),p_payment_method:payment.method,p_reference:payment.reference||null,p_payment_date:new Date().toISOString().slice(0,10),p_notes:null});setMessage(error?"Unable to record supplier payment.":"Supplier payment recorded.");if(!error){setPayment({...payment,amount:"",reference:""});load()}}
-async function purchaseReturn(e){e.preventDefault();const p=products.find(x=>x.id===ret.productId);if(!p)return;const{error}=await supabase.rpc("create_purchase_return",{p_supplier_id:ret.supplierId,p_items:[{product_id:ret.productId,quantity:Number(ret.qty),purchase_price:p.purchasePrice}],p_reason:ret.reason,p_purchase_id:null});setMessage(error?"Unable to complete supplier return.":"Supplier return completed; stock reduced with movement history.");if(!error){setRet({...ret,productId:"",qty:1});await Promise.all([load(),refreshAll()])}}
-return <div><PageHeader title="Advanced Supplier & Procurement" subtitle="Draft → approval → send → receive → supplier balance/payment → purchase return." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}
-<div className="settings-grid"><form className="panel" onSubmit={createPO}><h3>Create Purchase Order <FeatureTierBadge tier="PLUS"/></h3><div className="settings-fields"><label>Supplier<select value={supplierId} onChange={e=>setSupplierId(e.target.value)} required><option value="">Select supplier</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Expected Date<input type="date" value={expected} onChange={e=>setExpected(e.target.value)}/></label></div><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead><tbody>{items.map((i,n)=><tr key={n}><td><select value={i.productId} onChange={e=>update(n,"productId",e.target.value)} required><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><input type="number" min="1" value={i.quantity} onChange={e=>update(n,"quantity",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={i.purchasePrice} onChange={e=>update(n,"purchasePrice",e.target.value)}/></td><td><button type="button" className="icon-button" onClick={()=>setItems(x=>x.filter((_,xidx)=>xidx!==n))}>×</button></td></tr>)}</tbody></table></div><p><strong>Total: {money.format(total)}</strong></p><div className="button-row"><button type="button" className="secondary-button" onClick={()=>setItems(x=>[...x,line()])}>Add Line</button><button className="primary-button">Create Draft PO</button></div></form>
-<form className="panel" onSubmit={receivePO}><h3>Receive Approved/Sent PO</h3><div className="settings-fields"><label>Purchase Order<select value={receive.poId} onChange={e=>setReceive({...receive,poId:e.target.value})} required><option value="">Select ready PO</option>{orders.filter(o=>["APPROVED","SENT","PARTIALLY_RECEIVED"].includes(o.status)).map(o=><option key={o.id} value={o.id}>{o.po_number} · {o.status}</option>)}</select></label><label>Supplier Invoice<input required value={receive.invoice} onChange={e=>setReceive({...receive,invoice:e.target.value})}/></label><label>Invoice Date<input type="date" required value={receive.date} onChange={e=>setReceive({...receive,date:e.target.value})}/></label></div><p className="muted-text">Inventory changes only inside the controlled receive RPC.</p><button className="primary-button">Receive Goods</button></form></div>
-<div className="settings-grid" style={{marginTop:16}}><form className="panel" onSubmit={pay}><h3>Supplier Payment</h3><div className="settings-fields"><label>Supplier<select value={payment.supplierId} onChange={e=>setPayment({...payment,supplierId:e.target.value})} required><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})} required/></label><label>Method<select value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}>{["BANK_TRANSFER","UPI","CASH","CARD","CHEQUE","OTHER"].map(m=><option key={m}>{m}</option>)}</select></label><label>Reference<input value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></label></div><button className="primary-button">Record Payment</button></form>
-<form className="panel" onSubmit={purchaseReturn}><h3>Purchase Return</h3><div className="settings-fields"><label>Supplier<select required value={ret.supplierId} onChange={e=>setRet({...ret,supplierId:e.target.value})}><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label><label>Product<select required value={ret.productId} onChange={e=>setRet({...ret,productId:e.target.value})}><option value="">Select</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Quantity<input type="number" min="1" required value={ret.qty} onChange={e=>setRet({...ret,qty:e.target.value})}/></label><label>Reason<input required value={ret.reason} onChange={e=>setRet({...ret,reason:e.target.value})}/></label></div><button className="secondary-button">Complete Return</button></form></div>
-<section className="panel" style={{marginTop:16}}><h3>Purchase Orders</h3>{orders.length===0?<EmptyState title="No purchase orders" message="Create a draft purchase order to begin procurement."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Next Action</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.po_number}</td><td>{suppliers.find(s=>s.id===o.supplier_id)?.supplier_name||"Supplier"}</td><td><StatusBadge status={o.status}/></td><td>{o.expected_date||"-"}</td><td>{money.format(o.subtotal)}</td><td><div className="button-row compact">{o.status==="DRAFT"?<button className="secondary-button" onClick={()=>rpc("submit_purchase_order",{p_po_id:o.id},"Submitted for approval")}>Submit</button>:null}{o.status==="APPROVAL_PENDING"?<button className="primary-button" onClick={()=>rpc("approve_purchase_order",{p_po_id:o.id},"Purchase order approved")}>Approve</button>:null}{o.status==="APPROVED"?<button className="secondary-button" onClick={()=>rpc("set_purchase_order_status",{p_po_id:o.id,p_status:"SENT"},"Purchase order marked sent")}>Mark Sent</button>:null}</div></td></tr>)}</tbody></table></div>}</section>
-<section className="panel" style={{marginTop:16}}><h3>Supplier Balance</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead><tbody>{balances.map(b=><tr key={b.supplier_id}><td>{b.supplier_name}</td><td>{money.format(b.purchases)}</td><td>{money.format(b.payments)}</td><td>{money.format(b.returns)}</td><td><strong>{money.format(b.balance)}</strong></td></tr>)}</tbody></table></div></section>
-</div>}
+import SupplierEditor from "../components/SupplierEditor";
+
+const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
+const line = () => ({ productId: "", quantity: 12, purchasePrice: 0 });
+
+export default function Procurement() {
+  const { products, suppliers, refreshAll } = useShop();
+  const [orders, setOrders] = useState([]);
+  const [balances, setBalances] = useState([]);
+  const [supplierId, setSupplierId] = useState("");
+  const [items, setItems] = useState([line()]);
+  const [expected, setExpected] = useState("");
+  const [message, setMessage] = useState("");
+  const [supplierEditor, setSupplierEditor] = useState({ open: false, supplier: null });
+  const [payment, setPayment] = useState({ supplierId: "", amount: "", method: "BANK_TRANSFER", reference: "" });
+  const [receive, setReceive] = useState({ poId: "", invoice: "", date: new Date().toISOString().slice(0, 10) });
+  const [ret, setRet] = useState({ supplierId: "", productId: "", qty: 1, reason: "Damaged/incorrect supply" });
+
+  async function load() {
+    const [po, b] = await Promise.all([
+      supabase.from("purchase_orders").select("*,purchase_order_items(*)").order("created_at", { ascending: false }).limit(150),
+      supabase.rpc("supplier_balances"),
+    ]);
+    if (po.error || b.error) setMessage("Unable to load procurement data.");
+    else { setOrders(po.data || []); setBalances(b.data || []); }
+  }
+
+  useEffect(() => { load(); }, []);
+
+  function update(index, key, value) {
+    setItems((current) => current.map((row, rowIndex) => rowIndex === index ? {
+      ...row,
+      [key]: value,
+      ...(key === "productId" ? { purchasePrice: products.find((p) => p.id === value)?.purchasePrice || 0 } : {}),
+    } : row));
+  }
+
+  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0), [items]);
+  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId) || null;
+
+  async function supplierSaved(saved) {
+    await refreshAll();
+    if (saved?.id) setSupplierId(saved.id);
+    setMessage(saved?.supplier_name ? `Supplier “${saved.supplier_name}” saved and selected.` : "Supplier saved.");
+  }
+
+  async function createPO(event) {
+    event.preventDefault();
+    const payload = items
+      .filter((item) => item.productId && Number(item.quantity) > 0)
+      .map((item) => ({ product_id: item.productId, quantity: Number(item.quantity), purchase_price: Number(item.purchasePrice) }));
+    const { error } = await supabase.rpc("create_purchase_order", {
+      p_supplier_id: supplierId,
+      p_items: payload,
+      p_expected_date: expected || null,
+      p_notes: null,
+    });
+    setMessage(error ? "Unable to create purchase order." : "Draft purchase order created.");
+    if (!error) { setItems([line()]); await load(); }
+  }
+
+  async function rpc(fn, args, ok) {
+    const { error } = await supabase.rpc(fn, args);
+    setMessage(error ? `Unable to complete ${ok.toLowerCase()}.` : ok);
+    if (!error) await Promise.all([load(), refreshAll()]);
+  }
+
+  async function receivePO(event) {
+    event.preventDefault();
+    if (!receive.poId) return;
+    const { error } = await supabase.rpc("receive_purchase_order", {
+      p_po_id: receive.poId,
+      p_invoice_number: receive.invoice,
+      p_invoice_date: receive.date,
+      p_receive_items: null,
+      p_notes: "Received from consolidated Procurement",
+    });
+    setMessage(error ? "Unable to receive this purchase order. Check status, invoice number and quantities." : "Goods received; inventory and supplier balance updated transactionally.");
+    if (!error) {
+      setReceive({ ...receive, poId: "", invoice: "" });
+      await Promise.all([load(), refreshAll()]);
+    }
+  }
+
+  async function pay(event) {
+    event.preventDefault();
+    const { error } = await supabase.rpc("record_supplier_payment", {
+      p_supplier_id: payment.supplierId,
+      p_amount: Number(payment.amount),
+      p_payment_method: payment.method,
+      p_reference: payment.reference || null,
+      p_payment_date: new Date().toISOString().slice(0, 10),
+      p_notes: null,
+    });
+    setMessage(error ? "Unable to record supplier payment." : "Supplier payment recorded.");
+    if (!error) { setPayment({ ...payment, amount: "", reference: "" }); load(); }
+  }
+
+  async function purchaseReturn(event) {
+    event.preventDefault();
+    const product = products.find((item) => item.id === ret.productId);
+    if (!product) return;
+    const { error } = await supabase.rpc("create_purchase_return", {
+      p_supplier_id: ret.supplierId,
+      p_items: [{ product_id: ret.productId, quantity: Number(ret.qty), purchase_price: product.purchasePrice }],
+      p_reason: ret.reason,
+      p_purchase_id: null,
+    });
+    setMessage(error ? "Unable to complete supplier return." : "Supplier return completed; stock reduced with movement history.");
+    if (!error) {
+      setRet({ ...ret, productId: "", qty: 1 });
+      await Promise.all([load(), refreshAll()]);
+    }
+  }
+
+  return <div>
+    <PageHeader title="Advanced Supplier & Procurement" subtitle="Draft → approval → send → receive → supplier balance/payment → purchase return." tier="PLUS" />
+    {message ? <div className="purchase-message">{message}</div> : null}
+
+    <div className="settings-grid">
+      <form className="panel" onSubmit={createPO}>
+        <h3>Create Purchase Order <FeatureTierBadge tier="PLUS" /></h3>
+        <div className="settings-fields">
+          <label>Supplier
+            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
+              <option value="">Select supplier</option>
+              {suppliers.filter((s) => s.active !== false).map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
+            </select>
+          </label>
+          <label>Expected Date<input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></label>
+        </div>
+        <div className="button-row compact supplier-inline-actions">
+          <button type="button" className="secondary-button" onClick={() => setSupplierEditor({ open: true, supplier: null })}>+ New Supplier</button>
+          <button type="button" className="secondary-button" disabled={!selectedSupplier} onClick={() => setSupplierEditor({ open: true, supplier: selectedSupplier })}>Edit Selected Supplier</button>
+        </div>
+
+        <div className="data-table-wrapper"><table className="data-table">
+          <thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead>
+          <tbody>{items.map((item, index) => <tr key={index}>
+            <td><select value={item.productId} onChange={(e) => update(index, "productId", e.target.value)} required><option value="">Select</option>{products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
+            <td><input type="number" min="1" value={item.quantity} onChange={(e) => update(index, "quantity", e.target.value)} /></td>
+            <td><input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => update(index, "purchasePrice", e.target.value)} /></td>
+            <td><button type="button" className="icon-button" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>×</button></td>
+          </tr>)}</tbody>
+        </table></div>
+        <p><strong>Total: {money.format(total)}</strong></p>
+        <div className="button-row"><button type="button" className="secondary-button" onClick={() => setItems((current) => [...current, line()])}>Add Line</button><button className="primary-button">Create Draft PO</button></div>
+      </form>
+
+      <form className="panel" onSubmit={receivePO}>
+        <h3>Receive Approved/Sent PO</h3>
+        <div className="settings-fields">
+          <label>Purchase Order<select value={receive.poId} onChange={(e) => setReceive({ ...receive, poId: e.target.value })} required><option value="">Select ready PO</option>{orders.filter((o) => ["APPROVED", "SENT", "PARTIALLY_RECEIVED"].includes(o.status)).map((o) => <option key={o.id} value={o.id}>{o.po_number} · {o.status}</option>)}</select></label>
+          <label>Supplier Invoice<input required value={receive.invoice} onChange={(e) => setReceive({ ...receive, invoice: e.target.value })} /></label>
+          <label>Invoice Date<input type="date" required value={receive.date} onChange={(e) => setReceive({ ...receive, date: e.target.value })} /></label>
+        </div>
+        <p className="muted-text">Inventory changes only inside the controlled receive RPC.</p>
+        <button className="primary-button">Receive Goods</button>
+      </form>
+    </div>
+
+    <div className="settings-grid" style={{ marginTop: 16 }}>
+      <form className="panel" onSubmit={pay}>
+        <h3>Supplier Payment</h3>
+        <div className="settings-fields">
+          <label>Supplier<select value={payment.supplierId} onChange={(e) => setPayment({ ...payment, supplierId: e.target.value })} required><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label>
+          <label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} required /></label>
+          <label>Method<select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>{["BANK_TRANSFER", "UPI", "CASH", "CARD", "CHEQUE", "OTHER"].map((method) => <option key={method}>{method}</option>)}</select></label>
+          <label>Reference<input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></label>
+        </div>
+        <button className="primary-button">Record Payment</button>
+      </form>
+
+      <form className="panel" onSubmit={purchaseReturn}>
+        <h3>Purchase Return</h3>
+        <div className="settings-fields">
+          <label>Supplier<select required value={ret.supplierId} onChange={(e) => setRet({ ...ret, supplierId: e.target.value })}><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label>
+          <label>Product<select required value={ret.productId} onChange={(e) => setRet({ ...ret, productId: e.target.value })}><option value="">Select</option>{products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
+          <label>Quantity<input type="number" min="1" required value={ret.qty} onChange={(e) => setRet({ ...ret, qty: e.target.value })} /></label>
+          <label>Reason<input required value={ret.reason} onChange={(e) => setRet({ ...ret, reason: e.target.value })} /></label>
+        </div>
+        <button className="secondary-button">Complete Return</button>
+      </form>
+    </div>
+
+    <section className="panel" style={{ marginTop: 16 }}>
+      <h3>Purchase Orders</h3>
+      {orders.length === 0 ? <EmptyState title="No purchase orders" message="Create a draft purchase order to begin procurement." /> : <div className="data-table-wrapper"><table className="data-table sticky">
+        <thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Next Action</th></tr></thead>
+        <tbody>{orders.map((order) => <tr key={order.id}>
+          <td>{order.po_number}</td>
+          <td>{suppliers.find((s) => s.id === order.supplier_id)?.supplier_name || "Supplier"}</td>
+          <td><StatusBadge status={order.status} /></td>
+          <td>{order.expected_date || "-"}</td>
+          <td>{money.format(order.subtotal)}</td>
+          <td><div className="button-row compact">
+            {order.status === "DRAFT" ? <button className="secondary-button" onClick={() => rpc("submit_purchase_order", { p_po_id: order.id }, "Submitted for approval")}>Submit</button> : null}
+            {order.status === "APPROVAL_PENDING" ? <button className="primary-button" onClick={() => rpc("approve_purchase_order", { p_po_id: order.id }, "Purchase order approved")}>Approve</button> : null}
+            {order.status === "APPROVED" ? <button className="secondary-button" onClick={() => rpc("set_purchase_order_status", { p_po_id: order.id, p_status: "SENT" }, "Purchase order marked sent")}>Mark Sent</button> : null}
+          </div></td>
+        </tr>)}</tbody>
+      </table></div>}
+    </section>
+
+    <section className="panel" style={{ marginTop: 16 }}>
+      <h3>Supplier Balance</h3>
+      <div className="data-table-wrapper"><table className="data-table">
+        <thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead>
+        <tbody>{balances.map((balance) => <tr key={balance.supplier_id}><td>{balance.supplier_name}</td><td>{money.format(balance.purchases)}</td><td>{money.format(balance.payments)}</td><td>{money.format(balance.returns)}</td><td><strong>{money.format(balance.balance)}</strong></td></tr>)}</tbody>
+      </table></div>
+    </section>
+
+    <SupplierEditor
+      open={supplierEditor.open}
+      supplier={supplierEditor.supplier}
+      onClose={() => setSupplierEditor({ open: false, supplier: null })}
+      onSaved={supplierSaved}
+    />
+  </div>;
+}
+
diff --git a/src/pages/Suppliers.jsx b/src/pages/Suppliers.jsx
new file mode 100644
index 0000000..6d12c57
--- /dev/null
+++ b/src/pages/Suppliers.jsx
@@ -0,0 +1,86 @@
+import { useEffect, useMemo, useState } from "react";
+import { supabase } from "../lib/supabase";
+import { useShop } from "../context/ShopContext";
+import PageHeader from "../components/ui/PageHeader";
+import EmptyState from "../components/ui/EmptyState";
+import StatusBadge from "../components/ui/StatusBadge";
+import SupplierEditor from "../components/SupplierEditor";
+
+export default function Suppliers() {
+  const { refreshAll } = useShop();
+  const [rows, setRows] = useState([]);
+  const [query, setQuery] = useState("");
+  const [message, setMessage] = useState("");
+  const [loading, setLoading] = useState(true);
+  const [editor, setEditor] = useState({ open: false, supplier: null });
+
+  async function load() {
+    setLoading(true);
+    const { data, error } = await supabase
+      .from("suppliers")
+      .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active,created_at,updated_at")
+      .order("active", { ascending: false })
+      .order("supplier_name");
+    if (error) setMessage("Unable to load suppliers.");
+    else { setRows(data || []); setMessage(""); }
+    setLoading(false);
+  }
+
+  useEffect(() => { load(); }, []);
+
+  const filtered = useMemo(() => {
+    const term = query.trim().toLowerCase();
+    if (!term) return rows;
+    return rows.filter((row) => [row.supplier_name, row.contact_person, row.mobile, row.email, row.gst_number]
+      .some((value) => String(value || "").toLowerCase().includes(term)));
+  }, [rows, query]);
+
+  async function toggleActive(row) {
+    const { error } = await supabase.from("suppliers").update({ active: !row.active }).eq("id", row.id);
+    if (error) setMessage("Unable to change supplier status.");
+    else {
+      setMessage(row.active ? "Supplier deactivated. Existing history is preserved." : "Supplier reactivated.");
+      await Promise.all([load(), refreshAll()]);
+    }
+  }
+
+  async function afterSave() {
+    setMessage("Supplier saved.");
+    await Promise.all([load(), refreshAll()]);
+  }
+
+  return <div>
+    <PageHeader title="Supplier Master" subtitle="Create, edit and deactivate suppliers without leaving the procurement workflow." />
+    {message ? <div className="purchase-message">{message}</div> : null}
+
+    <section className="panel">
+      <div className="filter-row">
+        <input className="search-input" placeholder="Search supplier, mobile, email or GST..." value={query} onChange={(e) => setQuery(e.target.value)} />
+        <button className="primary-button" onClick={() => setEditor({ open: true, supplier: null })}>+ New Supplier</button>
+      </div>
+    </section>
+
+    <section className="panel" style={{ marginTop: 16 }}>
+      {loading ? <p className="muted-text">Loading suppliers...</p> : filtered.length === 0 ?
+        <EmptyState title="No suppliers found" message="Create your first supplier or clear the current search." /> :
+        <div className="data-table-wrapper"><table className="data-table sticky">
+          <thead><tr><th>Supplier</th><th>Contact</th><th>Mobile</th><th>Email</th><th>GST / Tax</th><th>Status</th><th>Actions</th></tr></thead>
+          <tbody>{filtered.map((row) => <tr key={row.id}>
+            <td><strong>{row.supplier_name}</strong><div className="muted-text table-subtext">{row.address || "No address"}</div></td>
+            <td>{row.contact_person || "-"}</td>
+            <td>{row.mobile || "-"}</td>
+            <td>{row.email || "-"}</td>
+            <td>{row.gst_number || "-"}</td>
+            <td><StatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} /></td>
+            <td><div className="button-row compact">
+              <button className="secondary-button" onClick={() => setEditor({ open: true, supplier: row })}>Edit</button>
+              <button className="secondary-button" onClick={() => toggleActive(row)}>{row.active ? "Deactivate" : "Reactivate"}</button>
+            </div></td>
+          </tr>)}</tbody>
+        </table></div>}
+    </section>
+
+    <SupplierEditor open={editor.open} supplier={editor.supplier} onClose={() => setEditor({ open: false, supplier: null })} onSaved={afterSave} />
+  </div>;
+}
+
diff --git a/supabase/functions/ocr-invoice/index.ts b/supabase/functions/ocr-invoice/index.ts
index 7f50ee8..003b716 100644
--- a/supabase/functions/ocr-invoice/index.ts
+++ b/supabase/functions/ocr-invoice/index.ts
@@ -163,6 +163,9 @@ Deno.serve(async (req) => {
       ok: true,
       invoice: {
         supplierName: String(fieldContent(fields.VendorName) || ""),
+        vendorAddress: String(fieldContent(fields.VendorAddress) || ""),
+        vendorTaxId: String(fieldContent(fields.VendorTaxId) || ""),
+        paymentTerm: String(fieldContent(fields.PaymentTerm) || ""),
         invoiceNumber: String(fieldContent(fields.InvoiceId) || ""),
         invoiceDate: String(fieldContent(fields.InvoiceDate) || ""),
         total: numberValue(fields.InvoiceTotal),
@@ -182,3 +185,4 @@ Deno.serve(async (req) => {
     );
   }
 });
+
```
