import { useEffect, useMemo, useRef, useState } from "react";
import ProductEnrichmentPanel from "./ProductEnrichmentPanel";
import MobileBarcodeScanner from "./MobileBarcodeScanner";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import {
  applyProductImageChoice,
  getPreSaveProductImageChoices,
  getProductImageChoices,
} from "../lib/productEnrichmentClient";
import { productImageUrl } from "../lib/productImages";

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
  sizeMl: "", alcoholPercentage: "", purchasePrice: "0.00", mrp: "0.00",
  price: "0.00", minimumStock: 5, unitsPerCase: 12,
  lookupPackageType: "", enrichmentSelection: null,
  imagePath: "", imageUrl: "", imageFile: null, removeImage: false,
  preSaveImageSelection: null,
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
    subcategory: form.subcategory === "__CUSTOM__" ? "" : String(form.subcategory || ""),
    sizeMl: form.sizeMl === "" ? 0 : Number(form.sizeMl || 0),
    alcoholPercentage: form.alcoholPercentage === "" ? "" : Math.max(0, Number(form.alcoholPercentage || 0)),
    purchasePrice: Number(Number(form.purchasePrice || 0).toFixed(2)),
    mrp: Number(Number(form.mrp || 0).toFixed(2)),
    price: Number(Number(form.price || 0).toFixed(2)),
    minimumStock: Math.max(0, Math.round(Number(form.minimumStock || 0))),
    unitsPerCase: Math.max(1, Math.round(Number(form.unitsPerCase || 1))),
  };
}

export default function ProductForm({ initialValue, onSubmit, submitLabel, onApply, onCancel }) {
  const { profile } = useAuth();
  const { refreshAll } = useShop();
  const [form, setForm] = useState(emptyProduct);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageChooserOpen, setImageChooserOpen] = useState(false);
  const [imageChoices, setImageChoices] = useState([]);
  const [imageChoiceCacheKey, setImageChoiceCacheKey] = useState("");
  const [imageChoiceBusy, setImageChoiceBusy] = useState(false);
  const [imageChoiceApplying, setImageChoiceApplying] = useState("");
  const [imageChoiceError, setImageChoiceError] = useState("");
  const [imageChoiceScope, setImageChoiceScope] = useState("INDIA");
  const [imageChoicePage, setImageChoicePage] = useState(0);
  const [barcodeCameraOpen, setBarcodeCameraOpen] = useState(false);
  const cameraImageInputRef = useRef(null);
  const initializedIdentityRef = useRef(null);
  const imageChoiceRequestRef = useRef(0);
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
        subcategory: String(initialValue.subcategory || ""),
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
    setImageChoices([]);
    setImageChoiceCacheKey("");
    setImageChoicePage(0);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!imageChooserOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !imageChoiceApplying) {
        setImageChooserOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [imageChooserOpen, imageChoiceApplying]);

  const subcategoryOptions = useMemo(() => {
    const source = SUBCATEGORY_BY_CATEGORY[String(form.category || "")];
    return Array.isArray(source) ? [...source] : [];
  }, [form.category]);

  const currentSubcategory = String(form.subcategory || "");
  const subcategorySelectValue = subcategoryOptions.includes(currentSubcategory)
    ? currentSubcategory
    : currentSubcategory
      ? "__CUSTOM__"
      : "";

  const imageChoicePageSize = 20;
  const imageChoiceTotalPages = Math.max(
    1,
    Math.ceil(imageChoices.length / imageChoicePageSize),
  );
  const imageChoiceStart = imageChoicePage * imageChoicePageSize;
  const visibleImageChoices = imageChoices.slice(
    imageChoiceStart,
    imageChoiceStart + imageChoicePageSize,
  );

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
    imageChoiceRequestRef.current += 1;
    setForm((current) => ({
      ...current,
      imageFile:file,
      removeImage:false,
      preSaveImageSelection:null,
    }));
    setMessage("");
  }

  function clearImage() {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setForm((current) => ({
      ...current,
      imageFile:null,
      removeImage:Boolean(current.imagePath),
      preSaveImageSelection:null,
    }));
  }

  function applyVerificationSelection(selection) {
    const physicalBarcode = String(selection?.physicalBarcode || "").trim();
    setForm((current) => ({
      ...current,
      barcode: physicalBarcode || current.barcode,
      enrichmentSelection: {
        ...selection,
        importImage: false,
      },
    }));
    setMessage(
      physicalBarcode
        ? `Physical barcode ${physicalBarcode} verified separately from Product Image.`
        : "Product identity reviewed. Product Image selection remains separate.",
    );
  }

  function preSaveIdentityKey() {
    return [
      String(form.name || "").trim().toLowerCase(),
      String(form.brand || "").trim().toLowerCase(),
      Number(form.sizeMl || 0) || 0,
      String(form.lookupPackageType || "").trim().toUpperCase(),
      String(imageChoiceScope || "INDIA").toUpperCase(),
    ].join("|");
  }

  function selectPreSaveImageChoice(choice, cacheKey, identityKey = preSaveIdentityKey()) {
    if (!choice?.candidateId || !choice?.imagePreviewUrl || !cacheKey) return false;
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(choice.imagePreviewUrl);
    setForm((current) => ({
      ...current,
      imageFile: null,
      removeImage: false,
      preSaveImageSelection: {
        choiceCacheKey: cacheKey,
        candidateId: choice.candidateId,
        imagePreviewUrl: choice.imagePreviewUrl,
        identityKey,
      },
    }));
    return true;
  }

  async function applyReturnedOnlineImage(result, successText) {
    if (result?.barcodeUnchanged !== true) {
      throw new Error("Barcode safety verification failed.");
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);

    const url = productImageUrl(result.imagePath);
    setImagePreview(url);
    setForm((current) => ({
      ...current,
      imagePath: result.imagePath,
      imageFile: null,
      removeImage: false,
    }));

    await refreshAll();

    setMessage(
      `${successText} Barcode ${result.barcodeAfter || result.barcodeBefore || "(none)"} was not changed.`,
    );
  }

  async function loadImageChoices(
    scope,
    { autoSelect = false, silent = false } = {},
  ) {
    const productId = initialValue?.id;
    const normalizedScope = scope === "GLOBAL" ? "GLOBAL" : "INDIA";
    const requestId = imageChoiceRequestRef.current + 1;
    imageChoiceRequestRef.current = requestId;

    if (!profile?.shop_id) {
      if (!silent) setMessage("Shop session is required for Product Image search.");
      return null;
    }

    if (!productId && String(form.name || "").trim().length < 3) {
      if (!silent) setMessage("Enter at least 3 characters of Product Name before image search.");
      return null;
    }

    setImageChoiceScope(normalizedScope);
    setImageChoicePage(0);
    setImageChoiceBusy(true);
    setImageChoiceError("");
    if (!silent) setMessage("");

    try {
      const result = productId
        ? await getProductImageChoices({
            shopId: profile.shop_id,
            productId,
            choiceScope: normalizedScope,
          })
        : await getPreSaveProductImageChoices({
            shopId: profile.shop_id,
            query: String(form.name || "").trim(),
            brand: String(form.brand || "").trim(),
            sizeMl: Number(form.sizeMl || 0) || null,
            packageType: form.lookupPackageType || "",
            choiceScope: normalizedScope,
          });

      if (requestId !== imageChoiceRequestRef.current) return null;

      if (result?.barcodeUnchanged !== true) {
        throw new Error("Barcode safety verification failed.");
      }

      const choices = Array.isArray(result.choices) ? result.choices : [];
      const cacheKey = String(result.choiceCacheKey || "");
      setImageChoices(choices);
      setImageChoiceCacheKey(cacheKey);

      if (!choices.length) {
        setImageChoiceError(
          "No " +
          (normalizedScope === "INDIA" ? "India" : "Global") +
          " image choices were found in the current free search results.",
        );
      } else if (!productId && autoSelect && !form.imageFile) {
        selectPreSaveImageChoice(
          choices[0],
          cacheKey,
          [
            String(form.name || "").trim().toLowerCase(),
            String(form.brand || "").trim().toLowerCase(),
            Number(form.sizeMl || 0) || 0,
            String(form.lookupPackageType || "").trim().toUpperCase(),
            normalizedScope,
          ].join("|"),
        );
      }

      return { ...result, choices };
    } catch (error) {
      if (requestId !== imageChoiceRequestRef.current) return null;
      setImageChoices([]);
      setImageChoiceCacheKey("");
      setImageChoiceError(error?.message || String(error));
      return null;
    } finally {
      if (requestId === imageChoiceRequestRef.current) {
        setImageChoiceBusy(false);
      }
    }
  }

  async function openImageChooser() {
    setImageChooserOpen(true);
    await loadImageChoices(imageChoiceScope || "INDIA");
  }

  async function switchImageChoiceScope(scope) {
    const normalizedScope = scope === "GLOBAL" ? "GLOBAL" : "INDIA";
    if (normalizedScope === imageChoiceScope && imageChoices.length) return;
    await loadImageChoices(normalizedScope);
  }

  async function chooseOnlineImage(candidateId) {
    const productId = initialValue?.id;
    if (!profile?.shop_id || !imageChoiceCacheKey) return;

    if (!productId) {
      const choice = imageChoices.find(
        (item) => String(item?.candidateId || "") === String(candidateId || ""),
      );
      if (selectPreSaveImageChoice(choice, imageChoiceCacheKey)) {
        setImageChooserOpen(false);
        setMessage(
          "Product Image selected before save. This exact image will be attached after Product Master creation. Barcode is not used or changed by this image action.",
        );
      }
      return;
    }

    setImageChoiceApplying(candidateId);
    setImageChoiceError("");

    try {
      const result = await applyProductImageChoice({
        shopId: profile.shop_id,
        productId,
        choiceCacheKey: imageChoiceCacheKey,
        candidateId,
      });

      await applyReturnedOnlineImage(result, "Selected image applied.");
      setImageChooserOpen(false);
    } catch (error) {
      setImageChoiceError(error?.message || String(error));
    } finally {
      setImageChoiceApplying("");
    }
  }

  useEffect(() => {
    if (
      initialValue?.id ||
      !profile?.shop_id ||
      form.imageFile ||
      String(form.name || "").trim().length < 3
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void loadImageChoices("INDIA", {
        autoSelect: true,
        silent: true,
      });
    }, 550);

    return () => {
      window.clearTimeout(timer);
      imageChoiceRequestRef.current += 1;
    };
  }, [
    initialValue?.id,
    profile?.shop_id,
    form.name,
    form.brand,
    form.sizeMl,
    form.lookupPackageType,
    form.imageFile,
  ]);

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
        SKU is generated automatically. Barcode is required when saving, but Find Product / Image can run before a barcode is known.
        Physical barcode confirmation is separate from internet barcode suggestions. For spreadsheet onboarding, use{" "}
        <a href="#/products/bulk-import">Bulk Product Import</a>.
      </div>

      <div className="product-enrichment-form-tools">
        <MobileBarcodeScanner open={barcodeCameraOpen} title="Scan Product Barcode" onClose={()=>setBarcodeCameraOpen(false)} onDetected={(code)=>{set("barcode",code);setBarcodeCameraOpen(false);setMessage(`Barcode ${code} scanned. Review and Save Product to persist it.`);}}/>

      <div className="form-grid">
          <label>
            Package (lookup only)
            <select
              value={form.lookupPackageType || ""}
              onChange={(event) => set("lookupPackageType", event.target.value)}
            >
              <option value="">Infer / Unknown</option>
              <option value="CAN">Can / Tin</option>
              <option value="BOTTLE">Bottle / Btl</option>
            </select>
            <small>Used for search/verification only; Product Master has no package-type column yet.</small>
          </label>
        </div>
        {form.enrichmentSelection ? (
          <div className="purchase-message success" style={{ marginTop: 10 }}>
            Physical barcode: <strong>{form.enrichmentSelection.physicalBarcode}</strong>
            {" · "}
            {form.enrichmentSelection.outcome === "CONFIRMED"
              ? "Internet identity confirmed"
              : form.enrichmentSelection.outcome === "UNVERIFIED"
                ? "Internet identity unverified — explicitly accepted"
                : "Manual details retained"}
            {form.enrichmentSelection.importImage ? " · image will import after save" : ""}
          </div>
        ) : null}
      </div>

      <div className="product-image-editor product-image-editor--auto">
        <div className="product-image-preview product-image-preview--autoload">
          {imagePreview ? (
            <img src={imagePreview} alt="Product bottle or can preview" />
          ) : !initialValue?.id && String(form.name || "").trim().length >= 3 ? (
            <span>
              {imageChoiceBusy
                ? "Searching Product Images…"
                : "No Product Image selected yet"}
            </span>
          ) : (
            <span>Enter Product Name to search Product Images</span>
          )}
        </div>
        <div>
          <strong>Product Image</strong>
          <p className="muted-text product-image-flow-copy">
            {initialValue?.id ? (
              <>
                Automatic image search uses the saved product name, brand and size only.
                <strong> It never changes the barcode.</strong>
              </>
            ) : (
              <>
                Product Image search starts automatically from Product Name, Brand and Size before barcode.
                Choose or try another image before save when needed.
                <strong> The exact selected image is applied after Product Master creation.</strong>
                <strong> Barcode is never used or changed by image processing.</strong>
              </>
            )}
          </p>

          {initialValue?.id ? (
            <div className="button-row" style={{ marginBottom: 10 }}>
              <button
                type="button"
                className="primary-button"
                disabled={busy || imageChoiceBusy}
                onClick={() => void openImageChooser()}
              >
                {imageChoiceBusy ? "Loading Images..." : "Try Another Image"}
              </button>
            </div>
          ) : (
            <div className="product-image-presave-tools">
              <div className="button-row" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className="primary-button"
                  disabled={busy || imageChoiceBusy || String(form.name || "").trim().length < 3}
                  onClick={() => void openImageChooser()}
                >
                  {imageChoiceBusy
                    ? "Searching Images..."
                    : imagePreview
                      ? "Try Another Image"
                      : "Find Product Images"}
                </button>
              </div>
              <p className="muted-text product-image-autoload-help">
                WineShopPOS searches free internet image results automatically from
                Product Name + Brand + Size before a barcode is required. The preview
                you select is carried through Product creation and that exact cached
                image is attached after save. Product Image processing never changes
                the barcode.
              </p>
              <ProductEnrichmentPanel
                shopId={profile?.shop_id}
                item={{ description: form.name, brand: form.brand }}
                brand={form.brand}
                sizeMl={Number(form.sizeMl || 0) || null}
                packageType={form.lookupPackageType || ""}
                barcode={form.barcode}
                disabled={busy}
                buttonLabel="Verify Product / Barcode"
                onUseCandidate={applyVerificationSelection}
              />
            </div>
          )}

          <p className="muted-text">
            {initialValue?.id
              ? "If the image is not right, click Try Another Image to open the image gallery, or upload your own JPEG, PNG or WebP (max 5 MB)."
              : "If the final automatic image is not right after save, open the product from Products and use Try Another Image. You can also upload your own JPEG, PNG or WebP now (max 5 MB)."}
          </p>
          <div className="product-image-local-actions"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/><input ref={cameraImageInputRef} type="file" accept="image/*" capture="environment" onChange={chooseImage} style={{display:"none"}}/><button type="button" className="secondary-button" onClick={()=>cameraImageInputRef.current?.click()}>Open Camera</button></div>
          {imagePreview ? (
            <button type="button" className="secondary-button" onClick={clearImage} style={{marginLeft:8}}>
              Remove Image
            </button>
          ) : null}
        </div>
      </div>

      {imageChooserOpen ? (
        <div
          className="product-image-chooser-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !imageChoiceApplying) {
              setImageChooserOpen(false);
            }
          }}
        >
          <section
            className="product-image-chooser-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-image-chooser-title"
          >
            <div className="product-image-chooser-header">
              <div>
                <h3 id="product-image-chooser-title">Choose Product Image</h3>
                <div className="product-image-chooser-product-name">
                  <strong>{form.name || initialValue?.name || "Unnamed Product"}</strong>
                  <span className="muted-text">
                    {form.brand ? form.brand + " · " : ""}
                    {Number(form.sizeMl || 0) > 0 ? String(Number(form.sizeMl)) + " ml" : "Size not set"}
                  </span>
                </div>
                <p className="muted-text">
                  Pick the closest bottle/can image for this Product Master item. This flow never changes the barcode.
                </p>
              </div>
              <button
                type="button"
                className="secondary-button product-image-chooser-close"
                disabled={Boolean(imageChoiceApplying)}
                onClick={() => setImageChooserOpen(false)}
                aria-label="Close image chooser"
              >
                ×
              </button>
            </div>

            <div className="product-image-scope-toggle" role="group" aria-label="Image search region">
              <button
                type="button"
                className={imageChoiceScope === "INDIA" ? "is-active" : ""}
                disabled={imageChoiceBusy || Boolean(imageChoiceApplying)}
                onClick={() => void switchImageChoiceScope("INDIA")}
              >
                India
              </button>
              <button
                type="button"
                className={imageChoiceScope === "GLOBAL" ? "is-active" : ""}
                disabled={imageChoiceBusy || Boolean(imageChoiceApplying)}
                onClick={() => void switchImageChoiceScope("GLOBAL")}
              >
                Global
              </button>
              <span className="muted-text">
                {imageChoiceScope === "INDIA"
                  ? "India is the default and is cached separately."
                  : "Global runs only when requested and its cache is missing."}
              </span>
            </div>

            <div className="product-image-chooser-scroll">
              {imageChoiceBusy ? (
                <div className="product-image-chooser-loading">
                  Finding {imageChoiceScope === "INDIA" ? "India" : "Global"} image choices...
                </div>
              ) : null}

              {imageChoiceError ? (
                <div className="purchase-message error">{imageChoiceError}</div>
              ) : null}

              {!imageChoiceBusy && visibleImageChoices.length ? (
                <>
                  <div className="product-image-choice-count">
                    Showing {imageChoiceStart + 1}-
                    {Math.min(imageChoiceStart + visibleImageChoices.length, imageChoices.length)}
                    {" "}of {imageChoices.length} cached image choices
                  </div>

                  <div className="product-image-choice-grid">
                    {visibleImageChoices.map((choice) => (
                      <button
                        type="button"
                        key={choice.candidateId}
                        className={"product-image-choice-card" + (choice.isCurrent ? " is-current" : "")}
                        disabled={Boolean(imageChoiceApplying) || choice.isCurrent}
                        onClick={() => void chooseOnlineImage(choice.candidateId)}
                      >
                        <div className="product-image-choice-preview">
                          {choice.imagePreviewUrl ? (
                            <img
                              src={choice.imagePreviewUrl}
                              alt={choice.title || "Product image choice"}
                              loading="lazy"
                            />
                          ) : (
                            <span>Preview unavailable</span>
                          )}
                        </div>

                        <div className="product-image-choice-copy">
                          <strong>{choice.title || "Product image"}</strong>
                          <span>{choice.publisher || "Web image"}</span>
                        </div>

                        <div className="product-image-choice-badges">
                          {choice.isCurrent ? <span>Current</span> : null}
                          {!choice.isCurrent && choice.wasUsed ? <span>Previously used</span> : null}
                          {choice.confidenceBand ? <span>{choice.confidenceBand}</span> : null}
                        </div>

                        <div className="product-image-choice-action">
                          {imageChoiceApplying === choice.candidateId
                            ? "Applying..."
                            : choice.isCurrent
                              ? "Current image"
                              : "Use this image"}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="product-image-chooser-footer">
              <div>
                <strong>{imageChoiceScope === "INDIA" ? "India" : "Global"}</strong>
                <span className="muted-text">
                  {" "}· 20 per page · Next 20 uses cached results
                </span>
              </div>

              <div className="button-row">
                {imageChoices.length > imageChoicePageSize ? (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={imageChoiceBusy || Boolean(imageChoiceApplying)}
                    onClick={() => {
                      setImageChoicePage((current) =>
                        current + 1 < imageChoiceTotalPages ? current + 1 : 0
                      );
                    }}
                  >
                    {imageChoicePage + 1 < imageChoiceTotalPages
                      ? "Refresh / Next 20"
                      : "Back to First 20"}
                  </button>
                ) : null}

                <button
                  type="button"
                  className="secondary-button"
                  disabled={Boolean(imageChoiceApplying)}
                  onClick={() => setImageChooserOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <div className="form-grid">
        <label>Barcode<div className="inline-field-actions"><input data-scanner-capture="barcode" inputMode="numeric" value={form.barcode} onChange={(e)=>set("barcode",e.target.value)} required/><button type="button" className="secondary-button" onClick={()=>setBarcodeCameraOpen(true)}>Scan Barcode</button></div></label>
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
          <select
            value={subcategorySelectValue}
            onChange={(event) => {
              const value = event.target.value;
              set("subcategory", value === "__CUSTOM__" ? "__CUSTOM__" : value);
            }}
          >
            <option value="">Select subcategory</option>
            {subcategoryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="__CUSTOM__">Other / Custom</option>
          </select>
          {subcategorySelectValue === "__CUSTOM__" ? (
            <input
              value={form.subcategory === "__CUSTOM__" ? "" : String(form.subcategory || "")}
              onChange={(event) => set("subcategory", event.target.value)}
              placeholder="Type custom subcategory"
              autoComplete="off"
            />
          ) : null}
          <small>Choose a category suggestion or use Other / Custom.</small>
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
