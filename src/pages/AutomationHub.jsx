import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import SupplierEditor from "../components/SupplierEditor";

function normalizeSupplierName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(private|pvt|limited|ltd|llp|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function supplierScore(ocrName, supplierName) {
  const a = normalizeSupplierName(ocrName);
  const b = normalizeSupplierName(supplierName);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 88;
  const aa = new Set(a.split(" ").filter(Boolean));
  const bb = new Set(b.split(" ").filter(Boolean));
  const intersection = [...aa].filter((token) => bb.has(token)).length;
  const union = new Set([...aa, ...bb]).size;
  return union ? Math.round((intersection / union) * 80) : 0;
}

export default function AutomationHub() {
  const { products, suppliers, refreshAll } = useShop();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [confirmedSupplier, setConfirmedSupplier] = useState(null);
  const [supplierEditorOpen, setSupplierEditorOpen] = useState(false);

  const supplierMatches = useMemo(() => {
    if (!result?.supplierName) return [];
    return suppliers
      .filter((supplier) => supplier.active !== false)
      .map((supplier) => ({ ...supplier, score: supplierScore(result.supplierName, supplier.supplier_name) }))
      .filter((supplier) => supplier.score >= 35)
      .sort((a, b) => b.score - a.score || a.supplier_name.localeCompare(b.supplier_name))
      .slice(0, 5);
  }, [result?.supplierName, suppliers]);

  function toBase64(nextFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(nextFile);
    });
  }

  async function analyze() {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMessage("F0 OCR accepts files up to 4 MB. Compress or split this invoice first.");
      return;
    }

    setBusy(true);
    setMessage("");
    setConfirmedSupplier(null);
    setSupplierId("");
    try {
      const contentBase64 = await toBase64(file);
      const { data, error } = await supabase.functions.invoke("ocr-invoice", {
        body: { contentBase64, contentType: file.type || "application/octet-stream" },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || "OCR failed");

      setResult(data.invoice);
      const next = {};
      for (let i = 0; i < (data.invoice.items || []).length; i += 1) {
        const item = data.invoice.items[i];
        const { data: productMatches } = await supabase.rpc("match_product_text", {
          p_text: item.description,
          p_supplier_id: null,
          p_limit: 5,
        });
        next[i] = productMatches || [];
      }
      setMatches(next);

      const ranked = suppliers
        .filter((supplier) => supplier.active !== false)
        .map((supplier) => ({ ...supplier, score: supplierScore(data.invoice.supplierName, supplier.supplier_name) }))
        .sort((a, b) => b.score - a.score);
      if (ranked[0]?.score >= 80) setSupplierId(ranked[0].id);
    } catch (error) {
      setMessage(error.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  function confirmExistingSupplier() {
    const supplier = suppliers.find((row) => row.id === supplierId);
    if (!supplier) {
      setMessage("Select an existing supplier first.");
      return;
    }
    setConfirmedSupplier(supplier);
    setMessage(`Supplier confirmed: ${supplier.supplier_name}.`);
  }

  async function supplierCreated(supplier) {
    await refreshAll();
    setSupplierId(supplier.id);
    setConfirmedSupplier(supplier);
    setMessage(`Supplier created and confirmed: ${supplier.supplier_name}.`);
  }

  function useDraft() {
    if (!result) return;
    if (!confirmedSupplier) {
      setMessage("Confirm an existing supplier or create a reviewed supplier before continuing.");
      return;
    }

    const lines = (result.items || []).map((item, index) => {
      const selected = (matches[index] || [])[0];
      const product = products.find((row) => row.id === selected?.product_id);
      return {
        description: item.description,
        productId: product?.id || "",
        quantity: Number(item.quantity || 1),
        caseCount: 0,
        unitsPerCase: product?.unitsPerCase || 1,
        looseBottles: Number(item.quantity || 1),
        purchasePrice: Number(item.unitPrice || product?.purchasePrice || 0),
        confidence: item.confidence,
        matchScore: selected?.score || 0,
      };
    });

    sessionStorage.setItem("wineshop_ocr_purchase_draft", JSON.stringify({
      supplierId: confirmedSupplier.id,
      supplierName: confirmedSupplier.supplier_name,
      invoiceNumber: result.invoiceNumber || "",
      invoiceDate: result.invoiceDate || new Date().toISOString().slice(0, 10),
      items: lines,
      sourceFile: file?.name,
      createdAt: new Date().toISOString(),
    }));
    navigate("/purchasing/receive");
  }

  const supplierDefaults = useMemo(() => ({
    supplier_name: result?.supplierName || "",
    gst_number: result?.vendorTaxId || "",
    address: result?.vendorAddress || "",
  }), [result?.supplierName, result?.vendorTaxId, result?.vendorAddress]);

  return <div>
    <div className="page-heading"><div><h2>OCR & Automation Hub</h2><p>Invoice OCR with mandatory supplier and product review before stock receipt.</p></div></div>
    {message ? <div className="purchase-message">{message}</div> : null}

    <div className="settings-grid">
      <section className="panel">
        <h3>Purchase Invoice OCR</h3>
        <input type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <br/><br/>
        <button className="primary-button" disabled={!file || busy} onClick={analyze}>{busy ? "Analyzing..." : "Analyze Invoice"}</button>
        <p><small>Azure Document Intelligence runs server-side. OCR never creates stock or a supplier silently. A Manager/Admin must review and confirm first.</small></p>
      </section>
      <section className="panel">
        <h3>Safe OCR Workflow</h3>
        <p>Invoice → OCR → supplier match → product match → human review → controlled stock receipt.</p>
        <p className="muted-text">Vendor name, vendor address and vendor tax ID are used only as suggestions for supplier creation.</p>
      </section>
    </div>

    {result ? <section className="panel" style={{ marginTop: 16 }}>
      <h3>1. Confirm Supplier</h3>
      <div className="ocr-supplier-summary">
        <p>OCR Supplier: <strong>{result.supplierName || "Not detected"}</strong></p>
        {result.vendorTaxId ? <p>Tax / GST ID: <strong>{result.vendorTaxId}</strong></p> : null}
        {result.vendorAddress ? <p>Address: <strong>{result.vendorAddress}</strong></p> : null}
      </div>

      {confirmedSupplier ? <div className="purchase-message success">Confirmed supplier: <strong>{confirmedSupplier.supplier_name}</strong></div> : <>
        {supplierMatches[0] ? <p className="muted-text">Best existing match: <strong>{supplierMatches[0].supplier_name}</strong> · confidence score {supplierMatches[0].score}%</p> : <p className="muted-text">No close existing supplier match was found.</p>}
        <div className="form-grid">
          <label>Existing Supplier
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Select existing supplier</option>
              {suppliers.filter((supplier) => supplier.active !== false).map((supplier) => {
                const scored = supplierMatches.find((match) => match.id === supplier.id);
                return <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}{scored ? ` · ${scored.score}% match` : ""}</option>;
              })}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button className="primary-button" type="button" disabled={!supplierId} onClick={confirmExistingSupplier}>Use Existing Supplier</button>
          <button className="secondary-button" type="button" onClick={() => setSupplierEditorOpen(true)}>Create Supplier From Invoice</button>
        </div>
      </>}
    </section> : null}

    {result ? <section className="panel" style={{ marginTop: 16 }}>
      <h3>2. Review Product Matches</h3>
      <p>Invoice: <strong>{result.invoiceNumber || "-"}</strong> · Date: <strong>{result.invoiceDate || "-"}</strong></p>
      <div className="data-table-wrapper"><table className="data-table">
        <thead><tr><th>OCR Description</th><th>Qty</th><th>Unit Price</th><th>Best Product Match</th><th>Score</th></tr></thead>
        <tbody>{(result.items || []).map((item, index) => {
          const match = (matches[index] || [])[0];
          return <tr key={index}><td>{item.description}</td><td>{item.quantity}</td><td>{item.unitPrice}</td><td>{match?.product_name || "No confident match"}</td><td>{match?.score || "-"}</td></tr>;
        })}</tbody>
      </table></div>
      <button className="primary-button" disabled={!confirmedSupplier} onClick={useDraft}>Send Reviewed Draft to Receive Stock</button>
      {!confirmedSupplier ? <p className="muted-text">Supplier confirmation is required before continuing.</p> : null}
    </section> : null}

    <SupplierEditor
      open={supplierEditorOpen}
      defaults={supplierDefaults}
      onClose={() => setSupplierEditorOpen(false)}
      onSaved={supplierCreated}
    />
  </div>;
}

