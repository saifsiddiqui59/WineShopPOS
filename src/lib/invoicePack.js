export function inferSizeMl(value) {
  const matches = [...String(value || "").matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
  if (!matches.length) return 0;
  const [, raw, unit] = matches[matches.length - 1];
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (unit.toLowerCase() === "l") return Math.round(n * 1000);
  if (unit.toLowerCase() === "cl") return Math.round(n * 10);
  return Math.round(n);
}

export function inferInvoiceUnitsPerCase(item = {}) {
  const structured = Number(item?.unitsPerCaseHint || 0);
  if (Number.isInteger(structured) && structured >= 1 && structured <= 100) {
    return {
      value: structured,
      source: "PRINTED_BOTTLE_TOTAL",
      strong: true,
    };
  }

  const text = `${String(item?.description || "")} ${String(item?.packing || "")}`.toLowerCase();
  const size = inferSizeMl(text);
  const canLike = /\b(can|cans|tin)\b/.test(text);
  const bottleLike = /\b(bottle|glass)\b/.test(text);
  const beerLike = /\b(beer|lager|witbier|stout)\b/.test(text);

  // Packaging profiles are suggestions, never invoice evidence.
  if (canLike && size > 0) {
    return { value: 24, source: "CAN_DEFAULT_24", strong: false };
  }
  if ((bottleLike || beerLike) && size > 0 && size < 500) {
    return { value: 24, source: "SMALL_GLASS_DEFAULT_24", strong: false };
  }
  if (beerLike && size > 500 && size <= 750) {
    return { value: 12, source: "LARGE_BEER_DEFAULT_12", strong: false };
  }
  return null;
}

export function resolveInvoiceUnitsPerCase(item = {}, product = null) {
  const invoiceHint = inferInvoiceUnitsPerCase(item);
  const productValue = Number(product?.unitsPerCase || 0);
  const productValid = Number.isInteger(productValue) && productValue > 0 && productValue <= 100;

  if (invoiceHint?.strong) {
    const conflict = productValid && productValue !== invoiceHint.value;
    return {
      value: invoiceHint.value,
      source: invoiceHint.source,
      strong: true,
      invoiceValue: invoiceHint.value,
      suggestedValue: null,
      productValue: productValid ? productValue : null,
      conflict,
      reviewRequired: conflict,
    };
  }

  if (invoiceHint && productValid) {
    const conflict = productValue !== invoiceHint.value;
    return {
      value: productValue,
      source: conflict ? "PRODUCT_MASTER_VS_PACK_PROFILE" : "PRODUCT_MASTER_CONFIRMED",
      strong: !conflict,
      invoiceValue: null,
      suggestedValue: invoiceHint.value,
      suggestionSource: invoiceHint.source,
      productValue,
      conflict,
      reviewRequired: conflict,
    };
  }

  if (invoiceHint) {
    return {
      value: invoiceHint.value,
      source: invoiceHint.source,
      strong: false,
      invoiceValue: null,
      suggestedValue: invoiceHint.value,
      productValue: null,
      conflict: false,
      reviewRequired: true,
    };
  }

  if (productValid) {
    return {
      value: productValue,
      source: "PRODUCT_MASTER",
      strong: true,
      invoiceValue: null,
      suggestedValue: null,
      productValue,
      conflict: false,
      reviewRequired: false,
    };
  }

  return {
    value: 12,
    source: "DEFAULT_REVIEW",
    strong: false,
    invoiceValue: null,
    suggestedValue: null,
    productValue: null,
    conflict: false,
    reviewRequired: true,
  };
}
