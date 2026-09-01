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
    return { value: structured, source: "PRINTED_BOTTLE_TOTAL", strong: true };
  }

  const text = `${String(item?.description || "")} ${String(item?.packing || "")}`.toLowerCase();
  const size = inferSizeMl(text);
  const canLike = /\b(can|cans)\b/.test(text);
  const beerLike = /\b(beer|lager|witbier|stout)\b/.test(text);

  if ((canLike || beerLike) && size > 0 && size <= 500) {
    return { value: 24, source: canLike ? "CAN_SIZE_PROFILE" : "BEER_SMALL_BOTTLE_PROFILE", strong: true };
  }
  if (beerLike && size > 500 && size <= 750) {
    return { value: 12, source: "BEER_LARGE_BOTTLE_PROFILE", strong: true };
  }
  return null;
}

export function resolveInvoiceUnitsPerCase(item = {}, product = null) {
  const invoiceHint = inferInvoiceUnitsPerCase(item);
  const productValue = Number(product?.unitsPerCase || 0);
  const productValid = Number.isInteger(productValue) && productValue > 0 && productValue <= 100;

  if (invoiceHint) {
    return {
      value: invoiceHint.value,
      source: invoiceHint.source,
      invoiceValue: invoiceHint.value,
      productValue: productValid ? productValue : null,
      conflict: productValid && productValue !== invoiceHint.value,
      reviewRequired: productValid && productValue !== invoiceHint.value,
    };
  }
  if (productValid) {
    return {
      value: productValue,
      source: "PRODUCT_MASTER",
      invoiceValue: null,
      productValue,
      conflict: false,
      reviewRequired: false,
    };
  }
  return {
    value: 12,
    source: "DEFAULT_REVIEW",
    invoiceValue: null,
    productValue: null,
    conflict: false,
    reviewRequired: true,
  };
}
