import { useEffect, useMemo, useRef, useState } from "react";

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
  imagePath: "", imageUrl: "", imageFile: null, removeImage: false,
};

function moneyText(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

function defaultSellingFromMrp(value) {
  const mrp = Number(value);
  return Number.isFinite(mrp) && mrp > 0 ? Number((mrp + 15).toFixed(2)) : 0;
}

function initialFormIdentity(value) {
  if (!value) return "__EMPTY__";
  if (value.id) return `ID:${value.id}`;
  return ["NEW", value.barcode || "", value.name || "", value.sizeMl || "", value.purchasePrice || "", value.mrp || ""].join("|");
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
  const [imagePreview, setImagePreview] = useState("");
  const initializedIdentityRef = useRef(null);
  const [sellingPriceTouched, setSellingPriceTouched] = useState(false);

  useEffect(() => {
    const identity = initialFormIdentity(initialValue);
    if (initializedIdentityRef.current === identity) return;
    initializedIdentityRef.current = identity;

    if (initialValue) {
      const incomingMrp = Number(initialValue.mrp ?? 0);
      const incomingPrice = Number(initialValue.price ?? 0);
      const effectivePrice =
        Number.isFinite(incomingPrice) && incomingPrice > 0
          ? incomingPrice
          : defaultSellingFromMrp(incomingMrp);

      setForm({
        ...emptyProduct, ...initialValue,
        purchasePrice: moneyText(initialValue.purchasePrice ?? 0),
        mrp: moneyText(incomingMrp),
        price: moneyText(effectivePrice),
        imageFile: null,
        removeImage: false,
      });
      setSellingPriceTouched(Number.isFinite(incomingPrice) && incomingPrice > 0);
      setImagePreview(initialValue.imageUrl || "");
    } else {
      setForm(emptyProduct);
      setSellingPriceTouched(false);
      setImagePreview("");
    }
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Use a JPEG, PNG or WebP bottle/can image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Product image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setForm((current) => ({...current,imageFile:file,removeImage:false}));
    setMessage("");
  }

  function clearImage() {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setForm((current) => ({...current,imageFile:null,removeImage:Boolean(current.imagePath)}));
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

      <div className="product-image-editor">
        <div className="product-image-preview">
          {imagePreview ? <img src={imagePreview} alt="Product bottle or can preview" /> : <span>No image</span>}
        </div>
        <div>
          <strong>Original Bottle / Can Image</strong>
          <p className="muted-text">
            Optional. JPEG, PNG or WebP up to 5 MB. Use an image you own or are
            permitted to use from the manufacturer/distributor.
          </p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} />
          {imagePreview ? (
            <button type="button" className="secondary-button" onClick={clearImage} style={{marginLeft:8}}>
              Remove Image
            </button>
          ) : null}
        </div>
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
        <label>MRP<input
          type="number"
          min="0"
          step="0.01"
          value={form.mrp}
          onChange={(e) => {
            const nextMrpText = e.target.value;
            setForm((current) => {
              const currentMrp = Number(current.mrp || 0);
              const currentPrice = Number(current.price || 0);
              const previousDefault = defaultSellingFromMrp(currentMrp);
              const canApplyDefault =
                !sellingPriceTouched ||
                currentPrice === 0 ||
                Math.abs(currentPrice - previousDefault) < 0.001;
              const nextMrp = Number(nextMrpText || 0);
              return {
                ...current,
                mrp: nextMrpText,
                price:
                  canApplyDefault && Number.isFinite(nextMrp) && nextMrp > 0
                    ? moneyText(defaultSellingFromMrp(nextMrp))
                    : current.price,
              };
            });
          }}
          onBlur={() => normalizeMoneyField("mrp")}
          required
        /></label>
        <label>Selling Price<input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => {
            setSellingPriceTouched(true);
            set("price", e.target.value);
          }}
          onBlur={() => normalizeMoneyField("price")}
          required
        /><small>Defaults to MRP + ₹15 for a new product; you can edit it.</small></label>
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
