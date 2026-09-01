const PREFIX = "wineshop_receipt_auto_print_v1";
const key = (shopId) => `${PREFIX}_${shopId || "unknown"}`;

export function getReceiptAutoPrint(shopId) {
  try { return localStorage.getItem(key(shopId)) === "true"; }
  catch { return false; }
}

export function setReceiptAutoPrint(shopId, enabled) {
  try { localStorage.setItem(key(shopId), enabled ? "true" : "false"); }
  catch { /* device storage unavailable; current session remains usable */ }
  return Boolean(enabled);
}
