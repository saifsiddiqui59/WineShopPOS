const RESOLVED = new Set([
  "VERIFIED_EVIDENCE",
  "CONFIRMED_AS_POSTED",
  "CORRECTED",
  "MANUAL_ENTRY",
]);

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const norm = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const approx = (a, b, tolerance = 0.01) =>
  Math.abs(num(a) - num(b)) <= tolerance;

function correctionChangedPack(row) {
  const before = num(row?.old_values?.units_per_case);
  const after = num(row?.new_values?.units_per_case);
  return (
    num(row?.quantity_delta) !== 0 ||
    (before > 0 && after > 0 && before !== after)
  );
}

function draftResolved(row) {
  return RESOLVED.has(String(row?.packResolution?.state || ""));
}

function sameCommercialPack(draft, item) {
  if (num(draft?.caseCount) !== num(item?.case_count)) return false;
  if (num(draft?.unitsPerCase) !== num(item?.units_per_case)) return false;
  if (num(draft?.looseBottles) !== num(item?.loose_bottles)) return false;
  if (num(draft?.quantity) !== num(item?.quantity)) return false;

  const draftLine = num(draft?.lineAmount);
  const postedLine = num(item?.line_total);
  if (draftLine > 0 && postedLine > 0 && !approx(draftLine, postedLine, 0.02)) {
    return false;
  }

  const draftUnit = num(draft?.purchasePrice);
  const postedUnit = num(item?.purchase_price);
  if (draftUnit > 0 && postedUnit > 0 && !approx(draftUnit, postedUnit, 0.01)) {
    return false;
  }
  return true;
}

function pendingIdentityMatches(draft, item, productById) {
  const pending = draft?.pendingProduct;
  if (!pending) return false;

  const product = productById?.[item?.product_id];
  if (!product) return false;

  const pendingName = norm(
    pending.productName || draft.productName || draft.sourceDescription
  );
  const productName = norm(product.name);
  if (pendingName && productName && pendingName !== productName) return false;

  const pendingSize = num(pending.sizeMl || draft.sizeMl || draft.invoiceSizeMl);
  const productSize = num(product.sizeMl);
  if (
    pendingSize > 0 &&
    productSize > 0 &&
    Math.abs(pendingSize - productSize) > 5
  ) {
    return false;
  }

  const pendingBarcode = String(
    pending.barcode || draft.scannedBarcode || ""
  ).trim();
  const productBarcode = String(product.barcode || "").trim();
  if (
    pendingBarcode &&
    productBarcode &&
    pendingBarcode !== productBarcode
  ) {
    return false;
  }

  return true;
}

function findDraftMatch({
  draftItems,
  item,
  used,
  productById,
}) {
  const productId = String(item?.product_id || "");

  // Existing products: require exact Product Master ID + exact posted pack.
  for (let i = 0; i < draftItems.length; i += 1) {
    if (used.has(i)) continue;
    const draft = draftItems[i];
    if (!draftResolved(draft)) continue;
    if (!productId || String(draft?.productId || "") !== productId) continue;
    if (!sameCommercialPack(draft, item)) continue;
    return i;
  }

  // V5 atomic pending products intentionally had no productId before receipt.
  // Consume each retained pending row once; never collapse repeated rows.
  for (let i = 0; i < draftItems.length; i += 1) {
    if (used.has(i)) continue;
    const draft = draftItems[i];
    if (!draftResolved(draft)) continue;
    if (draft?.productId || !draft?.pendingProduct) continue;
    if (!pendingIdentityMatches(draft, item, productById)) continue;
    if (!sameCommercialPack(draft, item)) continue;
    return i;
  }

  return -1;
}

export function packResolutionState(reviewDraft, productId) {
  const line = (reviewDraft?.purchaseDraft?.items || []).find(
    (row) => String(row?.productId || "") === String(productId || "")
  );
  const state = String(line?.packResolution?.state || "");
  return { state, resolved: RESOLVED.has(state), line: line || null };
}

export function evaluatePurchasePackResolution({
  purchaseItems = [],
  reviewDraft = null,
  corrections = [],
  ocrUnitMatch = false,
  productById = {},
}) {
  if (ocrUnitMatch) {
    return {
      resolved: true,
      mode: "OCR_TOTAL_MATCH",
      label: "VERIFIED",
      unresolvedProductIds: [],
      unresolvedPurchaseItemIds: [],
      correctedCount: 0,
      receivingVerifiedCount: purchaseItems.length,
    };
  }

  const correctionRows = (corrections || []).filter(correctionChangedPack);
  const correctedItemIds = new Set(
    correctionRows
      .map((row) => String(row?.purchase_item_id || ""))
      .filter(Boolean)
  );

  // Old rows without purchase_item_id may fall back by product only if that
  // Product Master occurs exactly once. This prevents repeated-line false PASS.
  const productCounts = new Map();
  for (const item of purchaseItems) {
    const id = String(item?.product_id || "");
    if (id) productCounts.set(id, (productCounts.get(id) || 0) + 1);
  }
  const legacyCorrectedProducts = new Set(
    correctionRows
      .filter((row) => !row?.purchase_item_id)
      .map((row) => String(row?.product_id || ""))
      .filter((id) => id && productCounts.get(id) === 1)
  );

  const drafts = reviewDraft?.purchaseDraft?.items || [];
  const used = new Set();
  const unresolvedProductIds = [];
  const unresolvedPurchaseItemIds = [];
  let correctedCount = 0;
  let receivingVerifiedCount = 0;

  for (const item of purchaseItems) {
    const itemId = String(item?.id || "");
    const productId = String(item?.product_id || "");

    if (
      (itemId && correctedItemIds.has(itemId)) ||
      (productId && legacyCorrectedProducts.has(productId))
    ) {
      correctedCount += 1;
      continue;
    }

    const match = findDraftMatch({
      draftItems: drafts,
      item,
      used,
      productById,
    });

    if (match >= 0) {
      used.add(match);
      receivingVerifiedCount += 1;
    } else {
      unresolvedProductIds.push(productId);
      unresolvedPurchaseItemIds.push(itemId);
    }
  }

  const resolved =
    purchaseItems.length > 0 && unresolvedPurchaseItemIds.length === 0;

  const mode =
    resolved && correctedCount
      ? "LINE_CORRECTIONS"
      : resolved && receivingVerifiedCount === purchaseItems.length
        ? "VERIFIED_DURING_RECEIVING"
        : resolved
          ? "MIXED_LINE_RESOLUTION"
          : "OPEN";

  return {
    resolved,
    mode,
    label:
      mode === "VERIFIED_DURING_RECEIVING"
        ? "VERIFIED during receiving"
        : correctedCount && resolved
          ? "CORRECTED"
          : resolved
            ? "VERIFIED"
            : "REVIEW",
    unresolvedProductIds,
    unresolvedPurchaseItemIds,
    correctedCount,
    receivingVerifiedCount,
  };
}
