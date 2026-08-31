import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import SupplierEditor from "../components/SupplierEditor";
import { storeManualInvoice } from "../lib/invoiceClient";

const STRONG_MATCH = 0.90;
const REVIEW_KEY = "wineshop_ocr_review_state";
const CREATED_KEY = "wineshop_ocr_created_product";
const BULK_CREATED_KEY = "wineshop_ocr_bulk_created_products";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(private|pvt|limited|ltd|llp|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function supplierScore(ocrName, supplierName) {
  const a = normalize(ocrName);
  const b = normalize(supplierName);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 88;
  const aa = new Set(a.split(" ").filter(Boolean));
  const bb = new Set(b.split(" ").filter(Boolean));
  const intersection = [...aa].filter((token) => bb.has(token)).length;
  const union = new Set([...aa, ...bb]).size;
  return union ? Math.round((intersection / union) * 80) : 0;
}

function emptyCharges() {
  return {
    freightAmount: 0,
    transportAmount: 0,
    handlingAmount: 0,
    loadingUnloadingAmount: 0,
    supplierDiscountAmount: 0,
    invoiceDiscountAmount: 0,
    miscellaneousAmount: 0,
    roundingAdjustment: 0,
  };
}

function chargesFromInvoice(invoice) {
  const finance = invoice?.financialAdjustments || {};
  return {
    ...emptyCharges(),
    freightAmount: Math.max(0, Number(invoice?.freightAmount || finance?.freightCartingAmount || invoice?.shippingAmount || 0)),
    transportAmount: Math.max(0, Number(invoice?.transportAmount || finance?.transportAmount || 0)),
    handlingAmount: Math.max(0, Number(invoice?.handlingAmount || finance?.handlingAmount || 0)),
    loadingUnloadingAmount: Math.max(0, Number(invoice?.loadingUnloadingAmount || finance?.loadingUnloadingAmount || 0)),
    supplierDiscountAmount: Math.max(0, Number(invoice?.supplierDiscountAmount || finance?.cashDiscountAmount || 0)),
    invoiceDiscountAmount: Math.max(0, Number(invoice?.invoiceDiscountAmount || finance?.otherDeductionAmount || invoice?.discountAmount || 0)),
    miscellaneousAmount: Math.max(0, Number(invoice?.miscellaneousAmount || finance?.miscellaneousAmount || invoice?.otherCharges || 0)),
    roundingAdjustment: Number(invoice?.roundingAdjustment ?? finance?.roundingAdjustment ?? 0),
  };
}

function shortHash(value) {
  let hash = 2166136261;
  for (const ch of String(value || "invoice")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function autoInvoiceReference({ invoiceDate, ingestionId, sourceFileName }) {
  const parsed = Date.parse(String(invoiceDate || ""));
  const date = Number.isFinite(parsed)
    ? new Date(parsed).toISOString().slice(0, 10).replaceAll("-", "")
    : new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `AUTO-${date}-${shortHash(ingestionId || sourceFileName || "OCR").slice(0, 8)}`;
}

function inferSizeMl(description) {
  const matches = [...String(description || "").matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
  if (!matches.length) return 0;
  const [, raw, unit] = matches[matches.length - 1];
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (unit.toLowerCase() === "l") return Math.round(value * 1000);
  if (unit.toLowerCase() === "cl") return Math.round(value * 10);
  return Math.round(value);
}

function inferUnitsPerCase(item, product) {
  if (Number(product?.unitsPerCase) > 0) return Number(product.unitsPerCase);
  const text = String(item?.description || "").toLowerCase();
  const size = inferSizeMl(text);
  if (/\b(can|cans)\b/.test(text) && size > 0 && size <= 500) return 24;
  if (/\b(beer|lager|witbier|stout)\b/.test(text) && size > 0 && size <= 500) return 24;
  return 12;
}

function nearWhole(value, tolerance = 0.06) {
  if (!Number.isFinite(value) || value <= 0) return null;
  const rounded = Math.round(value);
  return Math.abs(value - rounded) <= tolerance ? rounded : null;
}

function interpretQuantity(item, product) {
  const rawQuantity = Math.max(0, Number(item?.quantity ?? 0));
  const amount = Math.max(0, Number(item?.amount || 0));
  const explicitUnitPrice = Math.max(0, Number(item?.unitPrice || 0));
  const unitsPerCase = Math.max(1, inferUnitsPerCase(item, product));
  const unitText = String(item?.unitText || "").toLowerCase();
  const caseUnit = /\b(case|cases|cs|ctn|carton|cartons)\b/.test(unitText);

  let caseCount = 0;
  let looseBottles = 0;
  let quantity = 0;
  let priceBasis = "BOTTLE";
  let ocrUnitPrice = explicitUnitPrice;
  let purchasePrice = 0;
  let interpretation = "OCR quantity is ambiguous. Review Cases, Bottles/Case and Final Bottles.";

  const casesFromExplicitRate =
    explicitUnitPrice > 0 && amount > 0 ? nearWhole(amount / explicitUnitPrice) : null;
  const casesFromQuantityAsRate =
    rawQuantity > 0 && amount > 0 ? nearWhole(amount / rawQuantity) : null;

  if (
    rawQuantity > 0 &&
    !Number.isInteger(rawQuantity) &&
    casesFromQuantityAsRate &&
    casesFromQuantityAsRate <= 1000
  ) {
    caseCount = casesFromQuantityAsRate;
    quantity = caseCount * unitsPerCase;
    priceBasis = "CASE";
    ocrUnitPrice = rawQuantity;
    purchasePrice = rawQuantity / unitsPerCase;
    interpretation =
      `OCR Quantity (${rawQuantity}) behaves like Rate/Case because Amount ÷ value ≈ ${caseCount} cases. ` +
      "WineShopPOS corrected the case count; review Bottles/Case before confirmation.";
  } else if (casesFromExplicitRate && caseUnit && casesFromExplicitRate <= 1000) {
    caseCount = casesFromExplicitRate;
    quantity = caseCount * unitsPerCase;
    priceBasis = "CASE";
    purchasePrice = explicitUnitPrice / unitsPerCase;
    interpretation =
      `Line Amount ÷ OCR Rate/Case indicates ${caseCount} cases. Review Bottles/Case before confirmation.`;
  } else if (
    Number.isInteger(rawQuantity) &&
    rawQuantity > 0 &&
    rawQuantity <= 10000
  ) {
    const looksLikeBottleTotal =
      rawQuantity >= unitsPerCase * 2 &&
      rawQuantity % unitsPerCase === 0;

    if (looksLikeBottleTotal) {
      quantity = rawQuantity;
      caseCount = Math.floor(rawQuantity / unitsPerCase);
      looseBottles = rawQuantity % unitsPerCase;
      priceBasis = "BOTTLE";
      purchasePrice =
        explicitUnitPrice > 0 && !caseUnit
          ? explicitUnitPrice
          : amount > 0
            ? amount / rawQuantity
            : 0;
      interpretation =
        `OCR quantity ${rawQuantity} looks like total bottles. ` +
        `Derived ${caseCount} case(s) × ${unitsPerCase} bottles/case. Review before confirmation.`;
    } else if (caseUnit && rawQuantity <= 1000) {
      caseCount = rawQuantity;
      quantity = caseCount * unitsPerCase;
      priceBasis = "CASE";
      purchasePrice =
        explicitUnitPrice > 0
          ? explicitUnitPrice / unitsPerCase
          : amount > 0 && quantity > 0
            ? amount / quantity
            : 0;
      interpretation =
        `OCR explicitly indicates case/carton and quantity ${rawQuantity}. Review Bottles/Case before confirmation.`;
    } else {
      quantity = rawQuantity;
      looseBottles = rawQuantity;
      purchasePrice =
        explicitUnitPrice > 0
          ? explicitUnitPrice
          : amount > 0
            ? amount / rawQuantity
            : 0;
      interpretation =
        "OCR quantity treated as bottle/unit quantity. Review case breakdown before confirmation.";
    }
  }

  if (
    !Number.isInteger(caseCount) ||
    !Number.isInteger(looseBottles) ||
    !Number.isInteger(quantity) ||
    caseCount > 1000 ||
    quantity > 10000
  ) {
    caseCount = 0;
    looseBottles = 0;
    quantity = 0;
    purchasePrice = 0;
    interpretation =
      "OCR produced an unsafe/implausible quantity. WineShopPOS did not calculate stock; enter the reviewed case/bottle quantity manually.";
  }

  return {
    caseCount,
    unitsPerCase,
    looseBottles,
    quantity,
    priceBasis,
    ocrUnitPrice,
    purchasePrice: Number.isFinite(purchasePrice) ? Number(purchasePrice.toFixed(4)) : 0,
    interpretation,
  };
}

export default function AutomationHub() {
  const { products, suppliers, refreshAll } = useShop();
  const { profile, session } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState({});
  const [resolution, setResolution] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ingestionId, setIngestionId] = useState(null);
  const [sourceFileName, setSourceFileName] = useState("");
  const [charges, setCharges] = useState(emptyCharges());

  const [supplierId, setSupplierId] = useState("");
  const [confirmedSupplier, setConfirmedSupplier] = useState(null);
  const [supplierEditorOpen, setSupplierEditorOpen] = useState(false);

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  );

  const supplierMatches = useMemo(() => {
    if (!result?.supplierName) return [];
    return suppliers
      .filter((supplier) => supplier.active !== false)
      .map((supplier) => ({
        ...supplier,
        score: supplierScore(result.supplierName, supplier.supplier_name),
      }))
      .filter((supplier) => supplier.score >= 35)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.supplier_name.localeCompare(b.supplier_name),
      )
      .slice(0, 5);
  }, [result?.supplierName, suppliers]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(REVIEW_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        setResult(state.result || null);
        setMatches(state.matches || {});
        setResolution(state.resolution || {});
        setSupplierId(state.supplierId || "");
        setConfirmedSupplier(state.confirmedSupplier || null);
        setIngestionId(state.ingestionId || null);
        setSourceFileName(state.sourceFileName || "");
        setCharges({ ...emptyCharges(), ...(state.charges || chargesFromInvoice(state.result)) });
      }

      const created = sessionStorage.getItem(CREATED_KEY);
      if (created) {
        const state = JSON.parse(created);
        setResolution((current) => ({
          ...current,
          [state.lineIndex]: {
            ...(current[state.lineIndex] || {}),
            productId: state.productId,
            status: "SELECTED_NEEDS_CONFIRMATION",
            source: "CREATED_PRODUCT",
          },
        }));
        sessionStorage.removeItem(CREATED_KEY);
        setMessage(
          "New product created and linked. Confirm this line after reviewing bottles per case, final bottle quantity and price.",
        );
      }

      const bulkCreated = sessionStorage.getItem(BULK_CREATED_KEY);
      if (bulkCreated) {
        const createdRows = JSON.parse(bulkCreated);
        if (Array.isArray(createdRows) && createdRows.length) {
          setResolution((current) => {
            const next = { ...current };
            for (const item of createdRows) {
              next[item.lineIndex] = {
                ...(next[item.lineIndex] || {}),
                productId: item.productId,
                status: "SELECTED_NEEDS_CONFIRMATION",
                source: "CREATED_PRODUCT",
              };
            }
            return next;
          });
          setMessage(
            `${createdRows.length} new OCR product(s) were bulk-created and linked. Review quantity/price and confirm each line before Receive Stock.`,
          );
        }
        sessionStorage.removeItem(BULK_CREATED_KEY);
      }
    } catch {
      sessionStorage.removeItem(REVIEW_KEY);
      sessionStorage.removeItem(CREATED_KEY);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    sessionStorage.setItem(
      REVIEW_KEY,
      JSON.stringify({
        result,
        matches,
        resolution,
        supplierId,
        confirmedSupplier,
        ingestionId,
        sourceFileName,
        charges,
      }),
    );
  }, [result, matches, resolution, supplierId, confirmedSupplier, ingestionId, sourceFileName, charges]);

  function toBase64(nextFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(nextFile);
    });
  }

  async function resolveProductLines(invoice, nextSupplierId) {
    const nextMatches = {};
    const nextResolution = {};

    for (let i = 0; i < (invoice.items || []).length; i += 1) {
      const item = invoice.items[i];
      const { data: candidates, error } = await supabase.rpc(
        "match_product_text",
        {
          p_text: item.description,
          p_supplier_id: nextSupplierId || null,
          p_limit: 8,
        },
      );
      if (error) throw error;

      nextMatches[i] = candidates || [];
      const best = (candidates || [])[0];
      const strong =
        best && Number(best.score || 0) >= STRONG_MATCH;
      const product = activeProducts.find(
        (row) => row.id === best?.product_id,
      );

      nextResolution[i] = {
        productId: strong ? best.product_id : "",
        status: strong ? "STRONG_MATCH" : "NEEDS_PRODUCT",
        source: strong ? best.match_source : null,
        ...interpretQuantity(item, product),
      };
    }

    setMatches(nextMatches);
    setResolution(nextResolution);
  }

  async function analyze() {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMessage(
        "OCR accepts files up to 4 MB in the current configuration. Compress or split this invoice first.",
      );
      return;
    }

    setBusy(true);
    setMessage("");
    setConfirmedSupplier(null);
    setSupplierId("");
    setMatches({});
    setResolution({});
    setCharges(emptyCharges());

    try {
      const contentBase64 = await toBase64(file);
      let nextIngestionId = null;
      let storageWarning = "";
      let duplicateStatus = "";
      setIngestionId(null);
      setSourceFileName(file.name || "");
      try {
        const stored = await storeManualInvoice({ token: session?.access_token, fileName: file.name, contentType: file.type || "application/octet-stream", contentBase64 });
        if (stored?.duplicate) {
          setMessage(`Duplicate invoice file detected. Existing status: ${stored.existing_status || "UNKNOWN"}. Open Invoice Inbox instead of receiving it again.`);
          return;
        }
        nextIngestionId = stored?.ingestion_id || null;
        setIngestionId(nextIngestionId);
      } catch (storageError) {
        storageWarning = ` Original invoice storage is temporarily unavailable (${storageError?.message || "storage error"}). Existing OCR will continue.`;
      }
      const { data, error } = await supabase.functions.invoke("ocr-invoice", { body: { contentBase64, contentType: file.type || "application/octet-stream" } });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || "OCR failed");
      setResult(data.invoice);
      setCharges(chargesFromInvoice(data.invoice));
      if (nextIngestionId) {
        const { data: metadata, error: metadataError } = await supabase.rpc("invoice_record_ocr_result", { p_ingestion_id: nextIngestionId, p_supplier_name: data.invoice?.supplierName || null, p_invoice_number: data.invoice?.invoiceNumber || null, p_invoice_date: data.invoice?.invoiceDate || null, p_total: data.invoice?.total ?? null, p_normalized_invoice: data.invoice });
        if (metadataError) storageWarning += ` Invoice history metadata could not be updated (${metadataError.message}).`;
        else duplicateStatus = metadata?.review_status || "";
      }

      const ranked = suppliers
        .filter((supplier) => supplier.active !== false)
        .map((supplier) => ({
          ...supplier,
          score: supplierScore(
            data.invoice.supplierName,
            supplier.supplier_name,
          ),
        }))
        .sort((a, b) => b.score - a.score);

      if (ranked[0]?.score >= 80) {
        setSupplierId(ranked[0].id);
      }

      setMessage(
        duplicateStatus === "POSSIBLE_DUPLICATE"
          ? `OCR complete, but this looks like a possible duplicate. Resolve it in Invoice Inbox before Receive Stock.${storageWarning}`
          : `OCR complete. Confirm the supplier, then resolve and confirm every invoice line before stock receipt.${storageWarning}`,
      );
    } catch (error) {
      setMessage(error.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirmExistingSupplier() {
    const supplier = suppliers.find((row) => row.id === supplierId);
    if (!supplier || !result) {
      setMessage("Select an existing supplier first.");
      return;
    }

    setBusy(true);
    try {
      setConfirmedSupplier(supplier);
      await resolveProductLines(result, supplier.id);
      setMessage(
        `Supplier confirmed: ${supplier.supplier_name}. Product matching is ready for human review.`,
      );
    } catch (error) {
      setConfirmedSupplier(null);
      setMessage(error.message || "Unable to resolve invoice products.");
    } finally {
      setBusy(false);
    }
  }

  async function supplierCreated(supplier) {
    await refreshAll();
    setSupplierId(supplier.id);
    setConfirmedSupplier(supplier);

    try {
      await resolveProductLines(result, supplier.id);
      setMessage(
        `Supplier created and confirmed: ${supplier.supplier_name}. Resolve every product line before continuing.`,
      );
    } catch (error) {
      setMessage(error.message || "Unable to resolve invoice products.");
    }
  }

  function chooseProduct(index, productId) {
    const product = activeProducts.find((row) => row.id === productId);

    setResolution((current) => {
      const row = {
        ...(current[index] || {}),
        productId,
        status: productId ? "SELECTED_NEEDS_CONFIRMATION" : "NEEDS_PRODUCT",
        source: productId ? "HUMAN_SELECTION" : null,
      };

      if (productId) {
        row.unitsPerCase = Number(product?.unitsPerCase || row.unitsPerCase || 12);
        if (row.priceBasis === "CASE") {
          row.purchasePrice =
            Number(row.ocrUnitPrice || 0) / Math.max(1, row.unitsPerCase);
        }
      }

      row.quantity =
        Number(row.caseCount || 0) * Number(row.unitsPerCase || 1) +
        Number(row.looseBottles || 0);

      return { ...current, [index]: row };
    });
  }

  function updateQuantity(index, key, value) {
    setResolution((current) => {
      const row = {
        ...(current[index] || {}),
        [key]: Number(value || 0),
        status:
          current[index]?.productId
            ? "SELECTED_NEEDS_CONFIRMATION"
            : "NEEDS_PRODUCT",
      };

      row.unitsPerCase = Math.max(1, Number(row.unitsPerCase || 1));
      row.caseCount = Math.max(0, Number(row.caseCount || 0));
      row.looseBottles = Math.max(0, Number(row.looseBottles || 0));

      if (key === "unitsPerCase" && row.priceBasis === "CASE") {
        row.purchasePrice =
          Number(row.ocrUnitPrice || 0) / row.unitsPerCase;
      }

      row.quantity =
        row.caseCount * row.unitsPerCase + row.looseBottles;

      return { ...current, [index]: row };
    });
  }

  function updateBottlePrice(index, value) {
    setResolution((current) => ({
      ...current,
      [index]: {
        ...(current[index] || {}),
        purchasePrice: Math.max(0, Number(value || 0)),
        status: current[index]?.productId
          ? "SELECTED_NEEDS_CONFIRMATION"
          : "NEEDS_PRODUCT",
      },
    }));
  }

  async function saveAlias(index, productId) {
    const aliasText = String(
      result?.items?.[index]?.description || "",
    ).trim();

    if (!aliasText || !productId || !profile?.shop_id) return;

    const normalizedAlias = normalize(aliasText);

    let query = supabase
      .from("product_aliases")
      .select("id,product_id")
      .eq("shop_id", profile.shop_id)
      .eq("normalized_alias", normalizedAlias);

    query = confirmedSupplier?.id
      ? query.eq("supplier_id", confirmedSupplier.id)
      : query.is("supplier_id", null);

    const { data: existing, error: findError } = await query.limit(1);
    if (findError) throw findError;

    if (existing?.[0]?.id) {
      if (existing[0].product_id !== productId) {
        const { error } = await supabase
          .from("product_aliases")
          .update({ product_id: productId })
          .eq("id", existing[0].id);
        if (error) throw error;
      }
      return;
    }

    const { error } = await supabase.from("product_aliases").insert({
      shop_id: profile.shop_id,
      product_id: productId,
      supplier_id: confirmedSupplier?.id || null,
      alias_text: aliasText,
      created_by: profile.user_id || null,
    });

    if (error && error.code !== "23505") throw error;
  }

  async function confirmLine(index) {
    const row = resolution[index];
    if (!row?.productId) {
      setMessage("Select Existing Product or Create New Product first.");
      return;
    }

    const integerFields = [
      Number(row.caseCount || 0),
      Number(row.unitsPerCase || 0),
      Number(row.looseBottles || 0),
      Number(row.quantity || 0),
    ];

    if (
      !integerFields.every(Number.isInteger) ||
      Number(row.unitsPerCase) <= 0 ||
      Number(row.quantity) <= 0
    ) {
      setMessage(
        "Cases, bottles per case, loose bottles and final bottle quantity must resolve to positive whole-bottle quantities.",
      );
      return;
    }

    try {
      await saveAlias(index, row.productId);
      setResolution((current) => ({
        ...current,
        [index]: {
          ...current[index],
          status: "CONFIRMED",
          source:
            current[index]?.source === "CREATED_PRODUCT"
              ? "CREATED_PRODUCT"
              : "HUMAN_CONFIRMED",
        },
      }));
      setMessage(
        "Line confirmed. Description-to-product mapping was stored as an alias for future invoices.",
      );
    } catch (error) {
      setMessage(error.message || "Unable to save the product mapping.");
    }
  }

  function createProduct(index) {
    const item = result?.items?.[index];
    const row = resolution[index] || {};

    sessionStorage.setItem(
      REVIEW_KEY,
      JSON.stringify({
        result,
        matches,
        resolution,
        supplierId,
        confirmedSupplier,
        ingestionId,
        sourceFileName,
        charges,
      }),
    );

    const params = new URLSearchParams({
      ocr: "1",
      ocrLineIndex: String(index),
      name: String(item?.description || ""),
      purchasePrice: String(row.purchasePrice || item?.unitPrice || 0),
      unitsPerCase: String(row.unitsPerCase || 12),
    });

    navigate(`/products/new?${params.toString()}`);
  }

  function bulkCreateUnmatchedProducts() {
    if (!result) return;

    sessionStorage.setItem(
      REVIEW_KEY,
      JSON.stringify({
        result,
        matches,
        resolution,
        supplierId,
        confirmedSupplier,
        ingestionId,
        sourceFileName,
        charges,
      }),
    );

    navigate("/products/bulk-import?ocr=1");
  }

  function reviewDraftSnapshot(stage = "OCR_REVIEW", purchaseDraft = null) {
    return {
      version: 1,
      stage,
      result,
      matches,
      resolution,
      supplierId,
      confirmedSupplier: confirmedSupplier
        ? { id: confirmedSupplier.id, supplier_name: confirmedSupplier.supplier_name }
        : null,
      ingestionId,
      sourceFileName,
      charges,
      purchaseDraft,
      updatedAt: new Date().toISOString(),
    };
  }

  function reviewIsReady() {
    return Boolean(
      result?.items?.length &&
      confirmedSupplier &&
      result.items.every((_, index) => {
        const row = resolution[index];
        return (
          row?.productId &&
          row?.status === "CONFIRMED" &&
          Number.isInteger(Number(row?.quantity || 0)) &&
          Number(row?.quantity || 0) > 0
        );
      }),
    );
  }

  async function persistReviewDraft({ silent = true, stage = "OCR_REVIEW", purchaseDraft = null, ready = reviewIsReady() } = {}) {
    if (!ingestionId || !result) return { ok: true, skipped: true };
    const { data, error } = await supabase.rpc("invoice_save_review_draft", {
      p_ingestion_id: ingestionId,
      p_review_draft: reviewDraftSnapshot(stage, purchaseDraft),
      p_ready: Boolean(ready),
    });
    if (error) {
      if (!silent) setMessage(error.message || "Unable to save invoice review draft.");
      return { ok: false, error };
    }
    if (!silent) {
      setMessage(data === "READY_TO_RECEIVE" ? "Draft saved and ready for Receive Stock." : "Invoice review draft saved.");
    }
    return { ok: true, status: data };
  }

  useEffect(() => {
    if (!ingestionId || !result) return undefined;
    const timer = window.setTimeout(() => {
      persistReviewDraft({ silent: true });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [ingestionId, result, matches, resolution, supplierId, confirmedSupplier, sourceFileName, charges]);

  async function saveReviewDraft() {
    setBusy(true);
    await persistReviewDraft({ silent: false });
    setBusy(false);
  }

  async function cancelReview() {
    if (!ingestionId) {
      sessionStorage.removeItem(REVIEW_KEY);
      setResult(null);
      setResolution({});
      setMatches({});
      setConfirmedSupplier(null);
      setSupplierId("");
      setMessage("Local OCR review cleared. No received stock was changed.");
      return;
    }
    if (!window.confirm("Cancel this invoice review? This does not delete the original invoice and does not change inventory.")) return;
    const reason = window.prompt("Optional cancellation reason:", "") ?? "";
    setBusy(true);
    const { error } = await supabase.rpc("invoice_cancel_review", {
      p_ingestion_id: ingestionId,
      p_reason: reason || null,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message || "Unable to cancel invoice review.");
      return;
    }
    sessionStorage.removeItem(REVIEW_KEY);
    navigate("/purchasing/invoices");
  }

  const unresolved = useMemo(
    () =>
      (result?.items || []).filter(
        (_, index) =>
          !resolution[index]?.productId ||
          resolution[index]?.status !== "CONFIRMED" ||
          Number(resolution[index]?.quantity || 0) <= 0,
      ).length,
    [result, resolution],
  );

  const reviewedProductValue = useMemo(
    () =>
      (result?.items || []).reduce((sum, item, index) => {
        const row = resolution[index];
        const quantity = Number(row?.quantity || 0);
        const price = Number(row?.purchasePrice || 0);
        if (quantity > 0 && price > 0) return sum + quantity * price;
        return sum + Math.max(0, Number(item?.amount || 0));
      }, 0),
    [result, resolution],
  );

  const reviewedAdjustment = useMemo(
    () =>
      Number(charges.freightAmount || 0) +
      Number(charges.transportAmount || 0) +
      Number(charges.handlingAmount || 0) +
      Number(charges.loadingUnloadingAmount || 0) +
      Number(charges.miscellaneousAmount || 0) -
      Number(charges.supplierDiscountAmount || 0) -
      Number(charges.invoiceDiscountAmount || 0) +
      Number(charges.roundingAdjustment || 0),
    [charges],
  );

  const reviewedInvoiceTotal = reviewedProductValue + reviewedAdjustment;
  const printedInvoiceTotal = Number(result?.total || 0);
  const reconciliationDifference =
    printedInvoiceTotal > 0
      ? Number((printedInvoiceTotal - reviewedInvoiceTotal).toFixed(2))
      : null;
  const reconciliationMatches =
    reconciliationDifference == null || Math.abs(reconciliationDifference) <= 1;

  async function sendDraft() {
    if (!result || !confirmedSupplier) {
      setMessage("Confirm the supplier first.");
      return;
    }

    if (unresolved) {
      setMessage(`${unresolved} invoice line(s) still need product/quantity confirmation.`);
      return;
    }

    if (!reconciliationMatches) {
      setMessage(
        `Invoice financials do not reconcile. Difference: ₹${Math.abs(reconciliationDifference).toFixed(2)}. Review landed-cost adjustments before Receive Stock.`,
      );
      return;
    }

    setBusy(true);
    try {
      const lines = [];

      for (let index = 0; index < result.items.length; index += 1) {
        const item = result.items[index];
        const row = resolution[index];
        const product = activeProducts.find((entry) => entry.id === row.productId);

        if (!product) throw new Error(`Product unavailable on OCR line ${index + 1}.`);

        await saveAlias(index, product.id);

        lines.push({
          description: item.description,
          productId: product.id,
          caseCount: Number(row.caseCount || 0),
          unitsPerCase: Number(row.unitsPerCase || product.unitsPerCase || 1),
          looseBottles: Number(row.looseBottles || 0),
          quantity: Number(row.quantity || 0),
          purchasePrice: Number(row.purchasePrice || 0),
          batchNumber: String(item.batchNumber || ""),
          expiryDate: String(item.expiryDate || ""),
        });
      }

      const invoiceReference =
        String(result.invoiceNumber || "").trim() ||
        autoInvoiceReference({
          invoiceDate: result.invoiceDate,
          ingestionId,
          sourceFileName,
        });

      const purchaseDraft = {
        supplierId: confirmedSupplier.id,
        supplierName: confirmedSupplier.supplier_name,
        invoiceNumber: invoiceReference,
        invoiceNumberSource: result.invoiceNumber ? "OCR" : "AUTO",
        invoiceDate: result.invoiceDate || new Date().toISOString().slice(0, 10),
        items: lines,
        charges,
        financialSummary: {
          subtotal: result.subtotal ?? null,
          totalTax: result.totalTax ?? null,
          total: result.total ?? null,
          amountDue: result.amountDue ?? null,
          reviewedProductValue,
          reviewedInvoiceTotal,
          difference: reconciliationDifference,
          reconciliationStatus: reconciliationMatches ? "MATCH" : "REVIEW",
          financialAdjustments: result.financialAdjustments || null,
        },
        sourceFile: sourceFileName || file?.name || "OCR invoice",
        ingestionId: ingestionId || null,
        createdAt: new Date().toISOString(),
      };

      const persisted = await persistReviewDraft({
        silent: true,
        stage: "RECEIVE_STOCK",
        purchaseDraft,
        ready: true,
      });
      if (!persisted.ok) throw persisted.error;

      sessionStorage.setItem("wineshop_ocr_purchase_draft", JSON.stringify(purchaseDraft));
      sessionStorage.removeItem(REVIEW_KEY);
      navigate("/purchasing/receive");
    } catch (error) {
      setMessage(error.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  const supplierDefaults = useMemo(
    () => ({
      supplier_name: result?.supplierName || "",
      gst_number: result?.vendorTaxId || "",
      address: result?.vendorAddress || "",
    }),
    [result?.supplierName, result?.vendorTaxId, result?.vendorAddress],
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Invoice OCR</h2>
          <p>
            OCR extracts the invoice; supplier, product mapping and final bottle
            quantity are reviewed before inventory can be posted.
          </p>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      <section className="panel">
        <h3>Analyze Purchase Invoice</h3>
        <input
          type="file"
          accept="image/*,.pdf,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <br />
        <br />
        <button
          className="primary-button"
          disabled={!file || busy}
          onClick={analyze}
        >
          {busy ? "Analyzing..." : "Analyze Invoice"}
        </button>
        <p className="muted-text">
          OCR never posts inventory directly.
        </p>
      </section>

      {result ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <div className="button-row spread">
            <h3>1. Confirm Supplier</h3>
            <div className="button-row">
              <button type="button" className="secondary-button" disabled={busy} onClick={saveReviewDraft}>
                Save Draft
              </button>
              <button type="button" className="secondary-button" disabled={busy} onClick={cancelReview}>
                Cancel Review
              </button>
            </div>
          </div>
          <p>
            OCR Supplier: <strong>{result.supplierName || "Not detected"}</strong>
          </p>
          {result.vendorTaxId ? (
            <p>
              Tax / GST ID: <strong>{result.vendorTaxId}</strong>
            </p>
          ) : null}

          {confirmedSupplier ? (
            <div className="purchase-message success">
              Confirmed supplier:{" "}
              <strong>{confirmedSupplier.supplier_name}</strong>
            </div>
          ) : (
            <>
              {supplierMatches[0] ? (
                <p className="muted-text">
                  Best existing match:{" "}
                  <strong>{supplierMatches[0].supplier_name}</strong> ·{" "}
                  {supplierMatches[0].score}% match
                </p>
              ) : (
                <p className="muted-text">
                  No close existing supplier match was found.
                </p>
              )}

              <label>
                Existing Supplier
                <select
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                >
                  <option value="">Select existing supplier</option>
                  {suppliers
                    .filter((supplier) => supplier.active !== false)
                    .map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                </select>
              </label>

              <div className="button-row">
                <button
                  className="primary-button"
                  type="button"
                  disabled={!supplierId || busy}
                  onClick={confirmExistingSupplier}
                >
                  Use Existing Supplier
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setSupplierEditorOpen(true)}
                >
                  Create Supplier From Invoice
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}

      {result && confirmedSupplier ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <h3>Invoice Financial Summary</h3>
          <div className="metric-grid four">
            <div className="metric-card"><span>Subtotal OCR</span><strong>{result.subtotal == null ? "—" : Number(result.subtotal).toLocaleString("en-IN")}</strong></div>
            <div className="metric-card"><span>Tax OCR</span><strong>{result.totalTax == null ? "—" : Number(result.totalTax).toLocaleString("en-IN")}</strong></div>
            <div className="metric-card"><span>Invoice Total OCR</span><strong>{result.total == null ? "—" : Number(result.total).toLocaleString("en-IN")}</strong></div>
            <div className="metric-card"><span>Amount Due OCR</span><strong>{result.amountDue == null ? "—" : Number(result.amountDue).toLocaleString("en-IN")}</strong></div>
          </div>
          <p className="muted-text">
            WineShopPOS now recognizes common liquor-invoice summary rows such as Cash Discount, Other Deduction, Freight/Carting, Stamp Duty and TCS. Review the auto-filled values before posting.
          </p>
          <div className="metric-grid four" style={{ marginTop: 12 }}>
            <div className="metric-card"><span>Reviewed Product Value</span><strong>₹{reviewedProductValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>
            <div className="metric-card"><span>Calculated Invoice</span><strong>₹{reviewedInvoiceTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>
            <div className="metric-card"><span>Printed Invoice</span><strong>{printedInvoiceTotal > 0 ? `₹${printedInvoiceTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}</strong></div>
            <div className="metric-card"><span>Reconciliation</span><strong>{reconciliationDifference == null ? "No printed total" : reconciliationMatches ? `MATCH · ₹${Math.abs(reconciliationDifference).toFixed(2)}` : `REVIEW · ₹${Math.abs(reconciliationDifference).toFixed(2)}`}</strong></div>
          </div>
          <div className="form-grid" style={{ marginTop: 12 }}>
            {[
              ["freightAmount", "Freight / Carting"],
              ["transportAmount", "Transport"],
              ["handlingAmount", "Handling"],
              ["loadingUnloadingAmount", "Loading / Unloading"],
              ["supplierDiscountAmount", "Cash / Supplier Discount"],
              ["invoiceDiscountAmount", "Other / Invoice Deduction"],
              ["miscellaneousAmount", "TCS + Stamp Duty + Other Additions"],
            ].map(([key, label]) => (
              <label key={key}>{label}
                <input type="number" min="0" step="0.01" value={charges[key]}
                  onChange={(e) => setCharges((current) => ({ ...current, [key]: Number(e.target.value || 0) }))} />
              </label>
            ))}
            <label>Rounding Adjustment
              <input type="number" step="0.01" value={charges.roundingAdjustment}
                onChange={(e) => setCharges((current) => ({ ...current, roundingAdjustment: Number(e.target.value || 0) }))} />
            </label>
          </div>
        </section>
      ) : null}

      {result && confirmedSupplier ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <div className="section-row">
            <div>
              <h3>2. Resolve Every Product & Quantity</h3>
              <p>
                Invoice / Reference: <strong>{result.invoiceNumber || autoInvoiceReference({ invoiceDate: result.invoiceDate, ingestionId, sourceFileName })}</strong>
                {!result.invoiceNumber ? " (auto-filled)" : ""} · Date:{" "}
                <strong>{result.invoiceDate || "-"}</strong>
              </p>
            </div>
            <strong>
              {unresolved
                ? `${unresolved} line(s) need confirmation`
                : "All lines confirmed"}
            </strong>
          </div>

          <div className="button-row" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="secondary-button"
              onClick={bulkCreateUnmatchedProducts}
              disabled={
                !(result.items || []).some(
                  (_, index) => !resolution[index]?.productId,
                )
              }
            >
              Bulk Create Unmatched Products
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OCR Description</th>
                  <th>Product Resolution</th>
                  <th>Status</th>
                  <th>Cases</th>
                  <th>Bottles / Case</th>
                  <th>Loose Bottles</th>
                  <th>Final Bottles</th>
                  <th>Price / Bottle</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(result.items || []).map((item, index) => {
                  const row = resolution[index] || {};
                  const candidates = matches[index] || [];
                  const best = candidates[0];

                  return (
                    <tr key={index}>
                      <td>
                        <strong>{item.description || "Unnamed OCR line"}</strong>
                        <div className="muted-text">
                          OCR quantity: {item.quantity ?? "-"}
                          {item.unitText ? ` ${item.unitText}` : ""}
                        </div>
                        <div className="muted-text">
                          {row.interpretation || ""}
                        </div>
                      </td>

                      <td>
                        {best ? (
                          <div className="muted-text">
                            Best match: {best.product_name} ·{" "}
                            {Number(best.score || 0).toFixed(3)}
                          </div>
                        ) : (
                          <div className="muted-text">
                            No product match found.
                          </div>
                        )}

                        <select
                          value={row.productId || ""}
                          onChange={(event) =>
                            chooseProduct(index, event.target.value)
                          }
                        >
                          <option value="">Select Existing Product</option>
                          {activeProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {row.status === "CONFIRMED"
                          ? "Confirmed"
                          : row.status === "STRONG_MATCH"
                            ? "Strong match auto-selected — confirm line"
                            : candidates.length
                              ? "Uncertain match — human confirmation required"
                              : "Unmatched — select or create product"}
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.caseCount ?? 0}
                          onChange={(event) =>
                            updateQuantity(index, "caseCount", event.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={row.unitsPerCase ?? 12}
                          onChange={(event) =>
                            updateQuantity(
                              index,
                              "unitsPerCase",
                              event.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.looseBottles ?? 0}
                          onChange={(event) =>
                            updateQuantity(
                              index,
                              "looseBottles",
                              event.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        <strong>{row.quantity ?? 0}</strong>
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.purchasePrice ?? 0}
                          onChange={(event) =>
                            updateBottlePrice(index, event.target.value)
                          }
                        />
                      </td>

                      <td>
                        {row.status !== "CONFIRMED" ? (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => confirmLine(index)}
                            disabled={
                              !row.productId || Number(row.quantity || 0) <= 0
                            }
                          >
                            Confirm Line
                          </button>
                        ) : (
                          <span>✓ Ready</span>
                        )}{" "}

                        {!row.productId ? (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => createProduct(index)}
                          >
                            Create New Product
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            className="primary-button"
            onClick={sendDraft}
            disabled={busy || unresolved > 0}
          >
            {unresolved
              ? `Resolve ${unresolved} Line(s) First`
              : "Send Confirmed Draft to Receive Stock"}
          </button>
        </section>
      ) : null}

      <SupplierEditor
        open={supplierEditorOpen}
        defaults={supplierDefaults}
        onClose={() => setSupplierEditorOpen(false)}
        onSaved={supplierCreated}
      />
    </div>
  );
}

