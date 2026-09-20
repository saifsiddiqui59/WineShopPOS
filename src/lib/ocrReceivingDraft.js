import { inferInvoiceSizeMl } from "./invoicePack.js";
import { normalizeBeerOcrText } from "./productInference.js";

function n(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function i(value) {
  return Math.max(0, Math.round(n(value)));
}

function productNameFromInvoice(item, index) {
  const source = normalizeBeerOcrText(
    item?.description || item?.productName || `Invoice line ${index + 1}`,
  ).trim();
  if (!source) return `Invoice line ${index + 1}`;
  const letters = source.replace(/[^A-Za-z]/g, "");
  if (letters && source === source.toUpperCase()) {
    return source
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }
  return source;
}

function packBaseline(row, capturedAt) {
  return {
    caseCount: i(row.caseCount),
    unitsPerCase: i(row.unitsPerCase),
    looseBottles: i(row.looseBottles),
    quantity: i(row.quantity),
    source: "OCR_PRESENTED",
    legacy: false,
    capturedAt,
  };
}

export function buildOcrReceivingPurchaseDraft({
  ingestionId,
  invoice,
  resolution = {},
  products = [],
  supplierId = "",
  supplierName = "",
  charges = {},
  shopAiOwnerDecision = null,
  now = new Date().toISOString(),
}) {
  if (!invoice || !ingestionId) {
    throw new Error("Stored OCR invoice and ingestion id are required.");
  }

  const productById = new Map(
    (products || []).map((product) => [String(product?.id || ""), product]),
  );

  const rows = (invoice.items || []).map((item, index) => {
    const reviewed = resolution?.[index] || {};
    const productId = String(reviewed?.productId || "");
    const product = productId ? productById.get(productId) : null;

    const unitsPerCase = Math.max(1, i(reviewed?.unitsPerCase || 1));
    const caseCount = i(reviewed?.caseCount);
    const looseBottles = i(reviewed?.looseBottles);
    const quantity = caseCount * unitsPerCase + looseBottles;
    const lineAmount = Math.max(0, n(item?.amount));
    const ratePerCase = Math.max(
      0,
      n(item?.ratePerCase || reviewed?.ocrUnitPrice),
    );
    const purchasePrice = quantity > 0 && lineAmount > 0
      ? lineAmount / quantity
      : Math.max(0, n(reviewed?.purchasePrice));

    const invoiceSizeMl = Math.max(
      0,
      n(
        reviewed?.sizeMl ||
        inferInvoiceSizeMl(item, unitsPerCase) ||
        0,
      ),
    );

    const pendingName = productNameFromInvoice(item, index);
    const canPreparePending =
      !productId &&
      Boolean(pendingName) &&
      invoiceSizeMl > 0 &&
      unitsPerCase > 0;

    const pendingProduct = canPreparePending
      ? {
          productName: pendingName,
          brand: "",
          categoryId: null,
          subcategory: "",
          packageType: String(item?.packageType || ""),
          sizeMl: invoiceSizeMl,
          barcode: "",
          mrp: Math.max(0, n(item?.mrp)),
          sellingPrice: Math.max(0, n(item?.mrp)),
          minimumStock: 5,
          unitsPerCase,
        }
      : null;

    const existingPackVerified =
      Boolean(productId) &&
      reviewed?.packReviewRequired === false &&
      !reviewed?.packConflict &&
      !reviewed?.packAutoSuggested;

    const packState =
      reviewed?.status === "CONFIRMED"
        ? "CONFIRMED_AS_POSTED"
        : existingPackVerified
          ? "VERIFIED_EVIDENCE"
          : "NEEDS_REVIEW";

    const batchReviewRequired = Boolean(item?.batchReviewRequired);

    const row = {
      lineKey: `ocr-${ingestionId}-${index}`,
      ocrIndex: index,
      sourceDescription: normalizeBeerOcrText(
        item?.description || pendingName,
      ),
      productId,
      productName: product?.name || pendingProduct?.productName || "",
      reviewedSourceDescription:
        reviewed?.status === "CONFIRMED" ? pendingName : "",
      pendingProduct,
      invoiceSizeMl,
      sizeMl: Math.max(0, n(product?.sizeMl || invoiceSizeMl)),
      caseCount,
      unitsPerCase,
      looseBottles,
      quantity,
      ratePerCase: Number(ratePerCase.toFixed(6)),
      purchasePrice: Number(purchasePrice.toFixed(6)),
      mrp: Math.max(0, n(item?.mrp || product?.mrp)),
      lineAmount: Number(lineAmount.toFixed(2)),
      batchNumber: String(item?.batchNumber || ""),
      batchOriginalValue: String(item?.batchOriginalValue || ""),
      batchSuggestionSource: String(item?.batchSuggestionSource || ""),
      batchSuggestionReason: String(item?.batchSuggestionReason || ""),
      batchReviewRequired,
      batchResolution: {
        state: batchReviewRequired
          ? "NEEDS_REVIEW"
          : item?.batchNumber
            ? "OCR_AGREEMENT"
            : "NOT_PRESENT",
        reason: "",
        updatedAt: null,
      },
      expiryDate: String(item?.expiryDate || ""),
      barcodeState: product?.barcode ? "KNOWN" : "ASSIGN_LATER",
      scannedBarcode: String(product?.barcode || ""),
      matchSource: productId
        ? String(reviewed?.source || "OCR_SELECTED_PRODUCT")
        : pendingProduct
          ? "PENDING_PRODUCT"
          : "UNMATCHED",
      matchScore: productId ? 1 : pendingProduct ? 1 : 0,
      packResolution: {
        state: packState,
        source: String(reviewed?.unitsPerCaseSource || "OCR_PRESENTED"),
        suggestedValue: Number(reviewed?.unitsPerCase || unitsPerCase),
        conflict: Boolean(reviewed?.packConflict),
        reason: String(
          reviewed?.packAutoWarning ||
          reviewed?.interpretation ||
          "",
        ),
        updatedAt: packState === "NEEDS_REVIEW" ? null : now,
      },
      packHistory: [],
      packBaseline: null,
      sourceItem: {
        description: String(item?.description || ""),
        packing: String(item?.packing || ""),
        packageType: String(item?.packageType || ""),
        unitsPerCaseHint: item?.unitsPerCaseHint ?? null,
      },
    };

    row.packBaseline = packBaseline(row, now);
    return row;
  });

  return {
    version: 2,
    receiveKey: `ocr-${ingestionId}`,
    ingestionId,
    supplierId: String(supplierId || ""),
    supplierName: String(supplierName || invoice?.supplierName || ""),
    invoiceNumber: String(invoice?.invoiceNumber || ""),
    invoiceDate: String(invoice?.invoiceDate || ""),
    invoiceDateReviewRequired: Boolean(invoice?.invoiceDateReviewRequired),
    notes: "",
    items: rows,
    charges: { ...(charges || {}) },
    financialSummary: {
      subtotal: invoice?.subtotal ?? null,
      total: invoice?.total ?? null,
      amountDue: invoice?.amountDue ?? null,
      totalSource: "OCR",
      resolutionAssist: invoice?.resolutionAssist || null,
      crossOcr: invoice?.crossOcr || null,
    },
    shopAiOwnerDecision: shopAiOwnerDecision || null,
    updatedAt: now,
  };
}
