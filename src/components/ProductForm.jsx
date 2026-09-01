import { useEffect, useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  "Beer", "Whisky", "Wine", "Vodka", "Rum", "Gin", "Brandy",
  "Tequila", "Liqueur", "RTD", "Cider", "Sparkling Wine", "Champagne", "Other",
];

const SUBCATEGORY_BY_CATEGORY = {
  Beer: ["Strong Beer", "Lager", "Premium Lager", "Wheat Beer", "Stout", "Ale", "Craft Beer"],
  Whisky: ["Indian Whisky", "Scotch Whisky", "Blended Scotch", "Single Malt", "Bourbon", "Rye Whisky"],
  Wine: ["Red Wine", "White Wine", "Rosé Wine", "Sparkling Wine", "Dessert Wine"],
  Vodka: ["Plain Vodka", "Flavoured Vodka", "Premium Vodka"],
  Rum: ["Dark Rum", "White Rum", "Spiced Rum", "Aged Rum"],
  Gin: ["London Dry Gin", "Dry Gin", "Flavoured Gin"],
  Brandy: ["Brandy", "Premium Brandy"],
  Tequila: ["Blanco", "Reposado", "Añejo"],
  Liqueur: ["Cream Liqueur", "Coffee Liqueur", "Fruit Liqueur", "Herbal Liqueur"],
  RTD: ["Premix", "Cocktail", "Hard Seltzer"],
  Cider: ["Apple Cider", "Fruit Cider"],
  "Sparkling Wine": ["Brut", "Prosecco", "Sparkling Rosé"],
  Champagne: ["Brut", "Rosé Champagne"],
};

const emptyProduct = {
  barcode: "", name: "", brand: "", category: "Whisky", subcategory: "",
  sizeMl: 750, alcoholPercentage: "", purchasePrice: "0.00", mrp: "0.00",
  price: "0.00", minimumStock: 5, unitsPerCase: 12,
};

function moneyText(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

function normalizedProduct(form) {
  return {
    ...form,
    sizeMl: Math.max(1, Number(form.sizeMl || 0)),
    alcoholPercentage: form.alcoholPercentage === "" ? "" : Math.max(0, Number(form.alcoholPercentage || 0)),
    purchasePrice: Number(Number(form.purchasePrice || 0).toFixed(2)),
    mrp: Number(Number(form.mrp || 0).toFixed(2)),
    price: Number(Number(form.price || 0).toFixed(2)),
    minimumStock: Math.max(0, Math.round(Number(form.minimumStock || 0))),
    unitsPerCase: Math.max(1, Math.round(Number(form.unitsPerCase || 1))),
  };
}

export default function ProductForm({ initialValue, onSubmit, submitLabel, onApply, onCancel }) {
  const [form, setForm] = useState(emptyProduct);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        ...emptyProduct, ...initialValue,
        purchasePrice: moneyText(initialValue.purchasePrice ?? 0),
        mrp: moneyText(initialValue.mrp ?? 0),
        price: moneyText(initialValue.price ?? 0),
      });
    } else {
      setForm(emptyProduct);
    }
  }, [initialValue]);

  const subcategoryOptions = useMemo(() => {
    const direct = SUBCATEGORY_BY_CATEGORY[form.category] || [];
    const all = Object.values(SUBCATEGORY_BY_CATEGORY).flat();
    return [...new Set([...direct, ...all])];
  }, [form.category]);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function normalizeMoneyField(name) {
    set(name, moneyText(form[name] || 0));
  }

  async function run(handler, successMessage = "") {
    setBusy(true);
    setMessage("");
    const result = await handler(normalizedProduct(form));
    if (!result?.ok) setMessage(result?.message || "Operation failed.");
    else if (successMessage) setMessage(successMessage);
    setBusy(false);
    return result;
  }

  async function submit(event) {
    event.preventDefault();
    await run(onSubmit);
  }

  async function applyChanges() {
    if (!onApply) return;
    await run(onApply, "Changes applied. You can continue editing.");
  }

  return (
    <form className="panel" onSubmit={submit}>
      {/* PRODUCT_MASTER_REAL_CATALOGUE_20260831 */}
      <div className="purchase-message" style={{ marginBottom: 14 }}>
        SKU is generated automatically. Barcode is required when adding one product.
        Click the Barcode field before scanning on this form. For invoice/OCR or manual bulk onboarding, use{" "}
        <a href="#/products/bulk-import">Bulk Product Import</a>.
      </div>

      <div className="form-grid">
        <label>Barcode<input data-scanner-capture="barcode" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} required /></label>
        <label>SKU<input value={initialValue?.sku || "Auto-generated on save"} readOnly /></label>
        <label>Product Name<input value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
        <label>Brand<input value={form.brand} onChange={(e) => set("brand", e.target.value)} required /></label>

        <label>
          Category
          <input
            list="product-category-options"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Type to search or enter a custom category"
            autoComplete="off"
            required
          />
          <datalist id="product-category-options">
            {CATEGORY_OPTIONS.map((option) => <option key={option} value={option} />)}
          </datalist>
          <small>Search by typing, or type your own custom category.</small>
        </label>

        <label>
          Subcategory
          <input
            list="product-subcategory-options"
            value={form.subcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            placeholder="Type to search or enter a custom subcategory"
            autoComplete="off"
          />
          <datalist id="product-subcategory-options">
            {subcategoryOptions.map((option) => <option key={option} value={option} />)}
          </datalist>
          <small>Suggestions follow the category; custom values are allowed.</small>
        </label>

        <label>Size (ml)<input type="number" min="1" value={form.sizeMl} onChange={(e) => set("sizeMl", e.target.value)} required /></label>
        <label>Alcohol %<input type="number" min="0" step="0.1" value={form.alcoholPercentage ?? ""} onChange={(e) => set("alcoholPercentage", e.target.value)} /></label>
        <label>Purchase Price<input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} onBlur={() => normalizeMoneyField("purchasePrice")} required /></label>
        <label>MRP<input type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} onBlur={() => normalizeMoneyField("mrp")} required /></label>
        <label>Selling Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} onBlur={() => normalizeMoneyField("price")} required /></label>
        <label>Minimum Stock<input type="number" min="0" step="1" value={form.minimumStock} onChange={(e) => set("minimumStock", e.target.value)} required /></label>
        <label>Bottles / Case<input type="number" min="1" step="1" value={form.unitsPerCase} onChange={(e) => set("unitsPerCase", e.target.value)} required /></label>
      </div>

      {message && <div className="purchase-message error" style={{ marginTop: 12 }}>{message}</div>}

      <div className="button-row" style={{ marginTop: 16 }}>
        <button type="submit" className="primary-button" disabled={busy}>{busy ? "Saving..." : submitLabel}</button>
        {onApply ? <button type="button" className="secondary-button" disabled={busy} onClick={applyChanges}>Apply</button> : null}
        {onCancel ? <button type="button" className="secondary-button" disabled={busy} onClick={onCancel}>Cancel</button> : null}
      </div>
    </form>
  );
}
