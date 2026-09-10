import { normalizeOcrEvidenceText } from "./ocrLearningRules.js";

export function inferSizeMl(value) {
  const learned = normalizeOcrEvidenceText(value, { context: "SIZE" });
  const matches = [...String(learned || "").matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
  if (!matches.length) return 0;
  const [, raw, unit] = matches[matches.length - 1];
  const valueNumber = Number(raw);
  if (!Number.isFinite(valueNumber) || valueNumber <= 0) return 0;
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "l") return Math.round(valueNumber * 1000);
  if (normalizedUnit === "cl") return Math.round(valueNumber * 10);
  return Math.round(valueNumber);
}

function packageType(value) {
  const text = normalizeOcrEvidenceText(value, { context: "PRODUCT" }).toLowerCase();
  if (/\b(can|cans|tin)\b/.test(text)) return "CAN";
  if (/\b(bottle|bottles|glass|beer|lager|witbier|stout|ale)\b/.test(text)) return "BOTTLE";
  return "UNKNOWN";
}

function explicitItemSizeMl(item = {}) {
  const direct = Number(
    item?.sizeMl ??
    item?.size_ml ??
    item?.bottleSizeMl ??
    item?.bottle_size_ml ??
    0,
  );
  if (Number.isInteger(direct) && direct > 0) return direct;

  return inferSizeMl(
    [
      item?.description,
      item?.productName,
      item?.packing,
      item?.packSize,
      item?.packageSize,
      item?.size,
      item?.unitText,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function inferInvoiceSizeResolution(item = {}, unitsPerCaseOverride = null) {
  const explicit = explicitItemSizeMl(item);
  if (explicit > 0) {
    return {
      value: explicit,
      source: "EXPLICIT_OCR_SIZE",
      reviewRequired: false,
    };
  }

  const text = [
    item?.description,
    item?.productName,
    item?.packing,
    item?.packSize,
    item?.packageSize,
    item?.unitText,
  ]
    .filter(Boolean)
    .join(" ");

  // Shop fallback applies ONLY after explicit/learned OCR size was not found.
  // Explicit 500 MI -> learned 500 ml -> EXPLICIT_OCR_SIZE and can never be
  // overwritten by the pack-24 330 ml heuristic.
  const type = packageType(text);
  if (type === "CAN") {
    return {
      value: 500,
      source: "SHOP_RULE_CAN_500ML",
      reviewRequired: true,
    };
  }

  const pack = Number(
    unitsPerCaseOverride ??
    item?.unitsPerCaseHint ??
    item?.units_per_case_hint ??
    0,
  );

  if (pack === 24) {
    return {
      value: 330,
      source: "SHOP_RULE_PACK24_330ML",
      reviewRequired: true,
    };
  }

  if (pack === 12) {
    return {
      value: 650,
      source: "SHOP_RULE_PACK12_650ML",
      reviewRequired: true,
    };
  }

  return {
    value: 0,
    source: "UNKNOWN_SIZE_REVIEW_REQUIRED",
    reviewRequired: true,
  };
}

export function inferInvoiceSizeMl(item = {}, unitsPerCaseOverride = null) {
  return inferInvoiceSizeResolution(item, unitsPerCaseOverride).value;
}

export function inferInvoiceUnitsPerCase(item = {}) {
  const explicit = Number(item?.unitsPerCaseHint || 0);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 100) {
    return {
      value: explicit,
      source: "PRINTED_BOTTLE_TOTAL",
      strong: true,
    };
  }

  const text = `${item?.description || ""} ${item?.packing || ""}`;
  const size = explicitItemSizeMl(item);
  const type = packageType(text);

  if (size === 330 && type === "BOTTLE") {
    return { value: 24, source: "PRIOR_330ML_BOTTLE_24", strong: false };
  }
  // Shop rule: exact 500 ml defaults to 24 bottles/case regardless of
  // CAN/BOTTLE/UNKNOWN wording when no printed Bottles/Case exists.
  // Keep this weak so normal receiving confirmation and Product Master
  // conflict handling remain active.
  if (size === 500) {
    return { value: 24, source: "PRIOR_500ML_24", strong: false };
  }
  if (size === 650 && type === "BOTTLE") {
    return { value: 12, source: "PRIOR_650ML_BOTTLE_12", strong: false };
  }
  if (size === 750 && type === "BOTTLE") {
    return { value: 12, source: "PRIOR_750ML_BOTTLE_12", strong: false };
  }

  return null;
}

export function resolveInvoiceUnitsPerCase(item = {}, product = null) {
  const hint = inferInvoiceUnitsPerCase(item);
  const productValue = Number(product?.unitsPerCase || 0);
  const validProductPack =
    Number.isInteger(productValue) &&
    productValue > 0 &&
    productValue <= 100;

  if (hint?.strong) {
    const conflict = validProductPack && productValue !== hint.value;
    return {
      value: hint.value,
      source: hint.source,
      strong: true,
      invoiceValue: hint.value,
      suggestedValue: null,
      productValue: validProductPack ? productValue : null,
      conflict,
      reviewRequired: conflict,
    };
  }

  if (hint && validProductPack) {
    const conflict = productValue !== hint.value;
    return {
      value: productValue,
      source: conflict
        ? "PRODUCT_MASTER_VS_PACK_PRIOR"
        : "PRODUCT_MASTER_CONFIRMED",
      strong: !conflict,
      invoiceValue: null,
      suggestedValue: hint.value,
      suggestionSource: hint.source,
      productValue,
      conflict,
      reviewRequired: conflict,
    };
  }

  if (validProductPack) {
    return {
      value: productValue,
      source: "PRODUCT_MASTER",
      strong: true,
      invoiceValue: null,
      suggestedValue: hint?.value ?? null,
      suggestionSource: hint?.source ?? null,
      productValue,
      conflict: false,
      reviewRequired: false,
    };
  }

  if (hint) {
    return {
      value: hint.value,
      source: hint.source,
      strong: false,
      invoiceValue: null,
      suggestedValue: hint.value,
      suggestionSource: hint.source,
      productValue: null,
      conflict: false,
      reviewRequired: true,
    };
  }

  return {
    value: null,
    source: "UNKNOWN_REVIEW_REQUIRED",
    strong: false,
    invoiceValue: null,
    suggestedValue: null,
    suggestionSource: null,
    productValue: null,
    conflict: false,
    reviewRequired: true,
  };
}
