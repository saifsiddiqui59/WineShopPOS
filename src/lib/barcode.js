export function normalizeBarcode(value) {
  // Preserve leading zeros; remove whitespace/control characters scanners may append.
  return String(value ?? "").replace(/[\u0000-\u0020\u007f-\u009f]/g, "").trim();
}

export function scannerSequenceLooksValid(value, times = [], settings = {}) {
  const code = normalizeBarcode(value);
  const minLength = Math.max(1, Number(settings.minLength || 6));
  const maxAverageGapMs = Math.max(10, Number(settings.maxAverageGapMs || 100));
  if (code.length < minLength || !Array.isArray(times) || times.length < 2) return false;

  const usable = times.map(Number).filter(Number.isFinite);
  if (usable.length < 2) return false;
  const gaps = usable.slice(1).map((t, i) => t - usable[i]).filter((gap) => gap >= 0);
  if (!gaps.length) return false;
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return avgGap <= maxAverageGapMs;
}

export function findProductByBarcode(products, value) {
  const wanted = normalizeBarcode(value);
  if (!wanted) return null;
  return (products || []).find((product) =>
    normalizeBarcode(product?.barcode) === wanted
  ) || null;
}
