import { useEffect, useState } from "react";

const emptyProduct = {
  barcode: "",
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
};

export default function ProductForm({
  initialValue,
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
      {/* PRODUCT_MASTER_REAL_CATALOGUE_20260831 */}
      <div className="purchase-message" style={{ marginBottom: 14 }}>
        SKU is generated automatically. Barcode is required when adding one product.
        For invoice/OCR or manual bulk onboarding, use{" "}
        <a href="#/products/bulk-import">Bulk Product Import</a>.
      </div>
      <div className="form-grid">
        <label>Barcode<input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} required /></label>
        <label>SKU<input value={initialValue?.sku || "Auto-generated on save"} readOnly /></label>
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
