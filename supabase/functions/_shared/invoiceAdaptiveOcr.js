import { buildShopAiFieldMatrix } from "./invoiceShopAiReview.js";

const LEGAL_SUFFIX = /\b(llp|ltd|limited|pvt|private|company|co\.?|enterprises?|distributors?|industries?)\b/i;
const NON_INVOICE_DATE_CONTEXT = /\b(tp|transport|permit|dispatch|order|delivery|batch|lot|mfg|mfd|manufactur(?:e|ed|ing)|expiry|exp)\b/i;
const MONTH_PATTERN = "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC";
const MAX_RESCUE_GROUPS = 6;
const STRONG_DERIVATIVE_CONFIDENCE = 0.90;

function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compact(value) {
  return norm(value).replace(/\s+/g, "");
}

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function presentFinite(value) {
  if (value == null || String(value).trim() === "") return null;
  return finite(value);
}

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function validRegion(region) {
  return Boolean(
    region &&
    [region.xMin, region.xMax, region.yMin, region.yMax].every((v) => Number.isFinite(Number(v))) &&
    Number(region.xMax) > Number(region.xMin) &&
    Number(region.yMax) > Number(region.yMin)
  );
}

function paddedRegion(region, xPad = 0.02, yPad = 0.015) {
  if (!validRegion(region)) return null;
  return {
    page: Number(region.page || 1),
    xMin: clamp(Number(region.xMin) - xPad),
    xMax: clamp(Number(region.xMax) + xPad),
    yMin: clamp(Number(region.yMin) - yPad),
    yMax: clamp(Number(region.yMax) + yPad),
  };
}

function unionRegions(regions) {
  const rows = (regions || []).filter(validRegion);
  if (!rows.length) return null;
  const pages = new Set(rows.map((r) => Number(r.page || 1)));
  if (pages.size !== 1) return null;
  const page = Number(rows[0].page || 1);
  return paddedRegion({
    page,
    xMin: Math.min(...rows.map((r) => Number(r.xMin))),
    xMax: Math.max(...rows.map((r) => Number(r.xMax))),
    yMin: Math.min(...rows.map((r) => Number(r.yMin))),
    yMax: Math.max(...rows.map((r) => Number(r.yMax))),
  }, 0.025, 0.02);
}

function bboxStats(polygon) {
  let values = [];
  if (Array.isArray(polygon)) {
    if (polygon.length && typeof polygon[0] === "object") {
      values = polygon.flatMap((point) => [Number(point?.x), Number(point?.y)]);
    } else {
      values = polygon.map(Number);
    }
  }
  values = values.filter(Number.isFinite);
  if (values.length < 8) return null;
  const xs = [];
  const ys = [];
  for (let i = 0; i + 1 < values.length; i += 2) {
    xs.push(values[i]);
    ys.push(values[i + 1]);
  }
  return {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };
}

function pageDimensions(primaryResult) {
  const out = new Map();
  for (const [index, page] of (primaryResult?.analyzeResult?.pages || []).entries()) {
    out.set(Number(page?.pageNumber || index + 1), {
      width: Number(page?.width || 0),
      height: Number(page?.height || 0),
    });
  }
  return out;
}

function normalizedRegionFromBounding(bound, pages) {
  const page = Number(bound?.pageNumber || 1);
  const dims = pages.get(page);
  const box = bboxStats(bound?.polygon);
  if (!dims?.width || !dims?.height || !box) return null;
  return paddedRegion({
    page,
    xMin: box.xMin / dims.width,
    xMax: box.xMax / dims.width,
    yMin: box.yMin / dims.height,
    yMax: box.yMax / dims.height,
  }, 0.012, 0.01);
}

function documentFieldRegion(primaryResult, fieldName, pages) {
  const field = primaryResult?.analyzeResult?.documents?.[0]?.fields?.[fieldName];
  const bound = field?.boundingRegions?.[0];
  return normalizedRegionFromBounding(bound, pages);
}

function headerRole(value) {
  const n = norm(value);
  const c = compact(value);
  if (c.includes("batch") || c === "lot" || c.includes("lotno")) return "batch";
  if (c.includes("packing") || c === "pack" || c.includes("packsize") || c === "size") return "packing";
  if (c === "mrp") return "mrp";
  if (n.includes("mrp") && (n.includes("brand") || n.includes("item") || n.includes("description"))) return "mrpDescription";
  if (n === "brand" || n === "description" || n === "item" || n === "item name" || n.includes("product description") || n === "particulars") return "description";
  if (c === "qtycs" || c === "qtycase" || c === "qtycases" || c === "cases" || c === "case" || c === "cs") return "cases";
  if (c === "qtybtl" || c === "qtybottle" || c === "qtybottles" || c === "btl" || c === "bottles") return "bottles";
  if (c === "quantity" || c === "qty" || c === "totalquantity" || c === "totalqty") return "quantity";
  if (c.includes("ratecs") || c.includes("ratecase") || c.includes("ratepercase")) return "rateCase";
  if (n === "rate" || c === "unitrate" || c === "rateper") return "rate";
  if (n === "amount" || n === "amt" || c === "linetotal" || c === "netamount") return "amount";
  return null;
}

function tableGeometry(primaryResult, itemCount, pages) {
  let best = null;
  for (const table of primaryResult?.analyzeResult?.tables || []) {
    const cells = Array.isArray(table?.cells) ? table.cells : [];
    const rows = [...new Set(cells.map((c) => Number(c?.rowIndex || 0)))].sort((a, b) => a - b);
    for (const rowIndex of rows.slice(0, 10)) {
      const row = cells.filter((c) => Number(c?.rowIndex || 0) === rowIndex);
      const roles = {};
      for (const cell of row) {
        const role = headerRole(cell?.content || "");
        if (role && roles[role] == null) roles[role] = Number(cell?.columnIndex || 0);
      }
      const rateCol = roles.rateCase ?? roles.rate;
      const itemCol = roles.description ?? roles.mrpDescription ?? roles.mrp;
      const score =
        (itemCol != null ? 3 : 0) +
        (rateCol != null ? 2 : 0) +
        (roles.amount != null ? 2 : 0) +
        (roles.packing != null ? 1 : 0) +
        (roles.batch != null ? 1 : 0) +
        (roles.cases != null || roles.quantity != null ? 1 : 0);
      if (score < 6) continue;

      const dataRows = rows
        .filter((r) => r > rowIndex)
        .filter((r) => {
          const text = cells
            .filter((c) => Number(c?.rowIndex || 0) === r)
            .map((c) => String(c?.content || ""))
            .join(" ");
          return !/\b(total|subtotal|gross|assessable|tax|discount|tcs|rounding)\b/i.test(text);
        })
        .slice(0, Math.max(0, itemCount));

      const quality = score + Math.min(itemCount, dataRows.length) * 0.25;
      if (!best || quality > best.quality) best = { cells, roles, rateCol, itemCol, dataRows, quality };
    }
  }
  if (!best) return { fieldRegions: new Map(), rowRegions: new Map(), tableRegion: null };

  const fieldRegions = new Map();
  const rowRegions = new Map();
  const roleToSuffixes = {
    description: ["description"],
    mrpDescription: ["description", "mrp"],
    mrp: ["mrp"],
    packing: ["packing"],
    batch: ["batch_number"],
    cases: ["case_count"],
    bottles: ["printed_bottle_quantity", "units_per_case"],
    quantity: ["printed_bottle_quantity", "case_count"],
    rateCase: ["rate_per_case"],
    rate: ["rate_per_case"],
    amount: ["amount"],
  };

  for (const [itemIndex, rowIndex] of best.dataRows.entries()) {
    const rowCells = best.cells.filter((c) => Number(c?.rowIndex || 0) === rowIndex);
    const regions = rowCells
      .map((cell) => normalizedRegionFromBounding(cell?.boundingRegions?.[0], pages))
      .filter(Boolean);
    const rowRegion = unionRegions(regions);
    if (rowRegion) rowRegions.set(itemIndex, rowRegion);

    for (const [role, suffixes] of Object.entries(roleToSuffixes)) {
      const col = role === "rateCase" || role === "rate"
        ? best.rateCol
        : role === "description" || role === "mrpDescription"
          ? best.roles[role]
          : best.roles[role];
      if (col == null) continue;
      const cell = rowCells.find((c) => Number(c?.columnIndex || 0) === Number(col));
      const region = normalizedRegionFromBounding(cell?.boundingRegions?.[0], pages);
      if (!region) continue;
      for (const suffix of suffixes) fieldRegions.set(`item:${itemIndex}:${suffix}`, region);
    }
  }

  return {
    fieldRegions,
    rowRegions,
    tableRegion: unionRegions([...rowRegions.values()]),
  };
}

const HEADER_FIELD_MAP = {
  "header:supplier_name": "VendorName",
  "header:invoice_number": "InvoiceId",
  "header:invoice_date": "InvoiceDate",
};

const FINANCE_FIELD_MAP = {
  "finance:line_product_value": "SubTotal",
  "finance:tax_total": "TotalTax",
  "finance:printed_total": "InvoiceTotal",
  "finance:amount_due": "AmountDue",
};

function partyTokens(value) {
  const noise = new Set(["the", "and", "of", "beer", "wine", "wines", "liquor", "shop", "shopee", "store", "buyer", "customer", "bill", "ship", "to"]);
  return norm(value)
    .replace(/\b(private|pvt|limited|ltd|llp|company|co)\b/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !noise.has(token));
}

function partyLooksSame(a, b) {
  const aa = partyTokens(a);
  const bb = partyTokens(b);
  if (!aa.length || !bb.length) return false;
  if (aa.join(" ") === bb.join(" ")) return true;
  const small = aa.length <= bb.length ? aa : bb;
  const large = new Set(aa.length <= bb.length ? bb : aa);
  return small.length >= 2 && small.every((token) => large.has(token));
}

function financeNeedsReview(invoice) {
  const f = invoice?.financialAdjustments || {};
  const a = String(f?.reconciliationStatus || "").toUpperCase();
  const b = String(f?.grossReconciliationStatus || "").toUpperCase();
  return Boolean((a && a !== "MATCH") || (b && b !== "MATCH"));
}

function fieldCheck(field, invoice, receivingShopName) {
  const reasons = [];
  const fieldId = String(field?.fieldId || "");
  const current = String(field?.systemValue ?? "").trim();

  if (field?.diVisionConflict) reasons.push("DI_VISION_CONFLICT");

  if (fieldId === "document:line_coverage") {
    const expected = Array.isArray(invoice?.items) ? invoice.items.length : 0;
    const actual = Number(field?.systemValue || 0);
    if (actual !== expected) reasons.push("LINE_COVERAGE_MISMATCH");
  }

  if (fieldId.startsWith("header:")) {
    if (!current) reasons.push("MISSING_CRITICAL_HEADER");
    if (fieldId === "header:invoice_date" && invoice?.invoiceDateReviewRequired === true) reasons.push("DATE_REVIEW_REQUIRED");
    if (fieldId === "header:supplier_name" && invoice?.supplierReviewRequired === true) reasons.push("SUPPLIER_REVIEW_REQUIRED");
    if (fieldId === "header:supplier_name" && receivingShopName && partyLooksSame(current, receivingShopName)) reasons.push("SUPPLIER_MATCHES_RECEIVING_SHOP");
  }

  const itemMatch = fieldId.match(/^item:(\d+):(.+)$/);
  if (itemMatch) {
    const index = Number(itemMatch[1]);
    const suffix = itemMatch[2];
    const item = invoice?.items?.[index] || {};
    const critical = new Set(["description", "packing", "mrp", "case_count", "rate_per_case", "amount"]);
    if (!current && critical.has(suffix)) reasons.push("MISSING_CRITICAL_LINE_FIELD");
    if (suffix === "batch_number" && item?.batchReviewRequired === true) reasons.push("BATCH_REVIEW_REQUIRED");
    if (suffix === "mrp" && item?.mrpReviewRequired === true) reasons.push("MRP_REVIEW_REQUIRED");

    const caseCount = presentFinite(item?.caseCount);
    const ratePerCase = presentFinite(item?.ratePerCase);
    const lineAmount = presentFinite(item?.amount);
    if (
      ["case_count", "rate_per_case", "amount"].includes(suffix) &&
      caseCount != null && ratePerCase != null && lineAmount != null &&
      caseCount >= 0 && ratePerCase >= 0 && lineAmount >= 0
    ) {
      const expectedAmount = caseCount * ratePerCase;
      const tolerance = Math.max(1, Math.abs(lineAmount) * 0.001);
      if (Math.abs(expectedAmount - lineAmount) > tolerance) {
        reasons.push("LINE_AMOUNT_ARITHMETIC_MISMATCH");
      }
    }

    const unitsPerCase = presentFinite(item?.unitsPerCaseHint ?? item?.unitsPerCase);
    const printedBottleQuantity = presentFinite(item?.printedBottleQuantity);
    const looseBottles = presentFinite(item?.looseBottles) ?? 0;
    if (
      ["case_count", "units_per_case", "loose_bottles", "printed_bottle_quantity"].includes(suffix) &&
      caseCount != null && unitsPerCase != null && printedBottleQuantity != null &&
      caseCount >= 0 && unitsPerCase > 0 && printedBottleQuantity >= 0
    ) {
      const expectedBottles = caseCount * unitsPerCase + looseBottles;
      if (Math.abs(expectedBottles - printedBottleQuantity) > 0.01) {
        reasons.push("BOTTLE_QUANTITY_ARITHMETIC_MISMATCH");
      }
    }
  }

  if (fieldId.startsWith("finance:") && financeNeedsReview(invoice)) {
    if (current || ["finance:printed_total", "finance:amount_due", "finance:adjustment_coverage"].includes(fieldId)) {
      reasons.push("FINANCE_RECONCILIATION_REVIEW");
    }
  }

  return {
    fieldId,
    label: String(field?.label || fieldId),
    scope: String(field?.scope || "UNKNOWN"),
    kind: String(field?.kind || "TEXT"),
    currentValue: current,
    status: reasons.length ? "RESCUE" : "PASS",
    reasons,
  };
}

function fallbackRegion(check, rowRegions, tableRegion) {
  if (check.scope === "HEADER") return { page: 1, xMin: 0, xMax: 1, yMin: 0, yMax: 0.42 };
  if (check.scope === "FINANCE") return { page: 1, xMin: 0, xMax: 1, yMin: 0.48, yMax: 1 };
  if (check.scope === "DOCUMENT") return tableRegion || { page: 1, xMin: 0.02, xMax: 0.98, yMin: 0.25, yMax: 0.82 };
  const match = check.fieldId.match(/^item:(\d+):/);
  if (match) return rowRegions.get(Number(match[1])) || tableRegion;
  return null;
}

function relativeRegion(fieldRegion, groupRegion) {
  if (!validRegion(fieldRegion) || !validRegion(groupRegion)) return null;
  if (Number(fieldRegion.page || 1) !== Number(groupRegion.page || 1)) return null;
  const width = Math.max(0.0001, groupRegion.xMax - groupRegion.xMin);
  const height = Math.max(0.0001, groupRegion.yMax - groupRegion.yMin);
  return {
    xMin: clamp((fieldRegion.xMin - groupRegion.xMin) / width),
    xMax: clamp((fieldRegion.xMax - groupRegion.xMin) / width),
    yMin: clamp((fieldRegion.yMin - groupRegion.yMin) / height),
    yMax: clamp((fieldRegion.yMax - groupRegion.yMin) / height),
  };
}

function groupRescueChecks(checks) {
  const provisional = new Map();
  for (const check of checks) {
    const page = Number(check?.region?.page || 1);
    let key = `p${page}:document`;
    const item = check.fieldId.match(/^item:(\d+):/);
    if (check.scope === "HEADER") key = `p${page}:header`;
    else if (check.scope === "FINANCE") key = `p${page}:finance`;
    else if (item) key = `p${page}:line:${item[1]}`;
    const list = provisional.get(key) || [];
    list.push(check);
    provisional.set(key, list);
  }

  const fixed = [...provisional.entries()]
    .filter(([key]) => !key.includes(":line:"))
    .sort((a, b) => a[0].localeCompare(b[0]));
  const lineEntries = [...provisional.entries()]
    .filter(([key]) => key.includes(":line:"))
    .sort((a, b) => {
      const ap = Number(a[0].match(/^p(\d+):/)?.[1] || 1);
      const bp = Number(b[0].match(/^p(\d+):/)?.[1] || 1);
      if (ap !== bp) return ap - bp;
      const ai = Number(a[0].split(":").pop());
      const bi = Number(b[0].split(":").pop());
      return ai - bi;
    });

  const output = fixed.slice(0, MAX_RESCUE_GROUPS);
  let remaining = MAX_RESCUE_GROUPS - output.length;
  if (remaining <= 0 || !lineEntries.length) return output;

  const byPage = new Map();
  for (const entry of lineEntries) {
    const page = Number(entry[0].match(/^p(\d+):/)?.[1] || 1);
    const list = byPage.get(page) || [];
    list.push(entry);
    byPage.set(page, list);
  }

  const pages = [...byPage.keys()].sort((a, b) => a - b);
  for (let pageIndex = 0; pageIndex < pages.length && remaining > 0; pageIndex += 1) {
    const page = pages[pageIndex];
    const entries = byPage.get(page) || [];
    const pagesLeft = pages.length - pageIndex;
    const slotsForPage = Math.max(1, Math.floor(remaining / Math.max(1, pagesLeft)));
    const actualSlots = Math.min(slotsForPage, entries.length, remaining);
    const chunkSize = Math.ceil(entries.length / Math.max(1, actualSlots));
    for (let index = 0; index < entries.length && remaining > 0; index += chunkSize) {
      const chunk = entries.slice(index, index + chunkSize);
      const first = chunk[0][0].split(":").pop();
      const last = chunk[chunk.length - 1][0].split(":").pop();
      output.push([
        `p${page}:lines:${first}-${last}`,
        chunk.flatMap((entry) => entry[1]),
      ]);
      remaining -= 1;
    }
  }
  return output.slice(0, MAX_RESCUE_GROUPS);
}

export function buildAdaptiveOcrPlan({
  primaryResult,
  primaryInvoice,
  secondaryOcr,
  invoice,
  receivingShopName = "",
}) {
  const matrix = buildShopAiFieldMatrix({ primaryInvoice, secondaryOcr, invoice });
  const pages = pageDimensions(primaryResult);
  const table = tableGeometry(primaryResult, invoice?.items?.length || 0, pages);

  const fieldRegions = new Map(table.fieldRegions);
  for (const [fieldId, fieldName] of Object.entries(HEADER_FIELD_MAP)) {
    const region = documentFieldRegion(primaryResult, fieldName, pages);
    if (region) fieldRegions.set(fieldId, region);
  }
  for (const [fieldId, fieldName] of Object.entries(FINANCE_FIELD_MAP)) {
    const region = documentFieldRegion(primaryResult, fieldName, pages);
    if (region) fieldRegions.set(fieldId, region);
  }

  const checks = matrix.map((field) => {
    const base = fieldCheck(field, invoice, receivingShopName);
    const directRegion = fieldRegions.get(base.fieldId) || null;
    const reasons = [...base.reasons];
    const status = reasons.length ? "RESCUE" : "PASS";

    let region = directRegion;

    // A disputed header field must be rescued from semantic header context,
    // not from the DI field box that produced the disputed value. This is
    // especially important for invoice date/vendor, where DI may point at a
    // TP/transport date or the receiving shop. Geometry locates evidence;
    // semantic ownership decides the value.
    if (status === "RESCUE" && base.scope === "HEADER") {
      region = fallbackRegion(base, table.rowRegions, table.tableRegion);
    } else if (!region && base.scope === "DOCUMENT") {
      region = fallbackRegion(base, table.rowRegions, table.tableRegion);
    }

    return {
      ...base,
      status,
      reasons: [...new Set(reasons)],
      region: region || null,
      rescueEligible: status === "RESCUE" && Boolean(region),
    };
  });

  const rescueChecks = checks.filter((row) => row.rescueEligible);
  const grouped = groupRescueChecks(rescueChecks);
  const rescueGroups = grouped.map(([key, rows], groupIndex) => {
    const region = unionRegions(rows.map((row) => row.region));
    const safeRegion = region;
    return {
      groupId: `adaptive:${groupIndex + 1}:${key}`,
      groupKey: key,
      page: Number(safeRegion?.page || 1),
      region: safeRegion,
      receivingShopName,
      fields: rows.map((row) => ({
        fieldId: row.fieldId,
        label: row.label,
        scope: row.scope,
        kind: row.kind,
        currentValue: row.currentValue,
        reasons: row.reasons,
        region: row.region,
        relativeRegion: relativeRegion(row.region, safeRegion),
      })),
    };
  }).filter((group) => validRegion(group.region));

  const routedFieldIds = new Set(
    rescueGroups.flatMap((group) => (group.fields || []).map((field) => field.fieldId)),
  );
  const manualOnlyFieldIds = checks
    .filter((row) => row.status === "RESCUE" && !routedFieldIds.has(row.fieldId))
    .map((row) => row.fieldId);

  return {
    version: 1,
    mode: "FIELD_LEVEL_ADAPTIVE_OCR_V1",
    fieldCheckCount: checks.length,
    passCount: checks.filter((row) => row.status === "PASS").length,
    rescueFieldCount: rescueChecks.length,
    rescueGroupCount: rescueGroups.length,
    manualOnlyFieldCount: manualOnlyFieldIds.length,
    maxRescueGroups: MAX_RESCUE_GROUPS,
    highResolutionPolicy: "ONLY_AFTER_DERIVATIVE_VISION_REMAINS_UNCERTAIN",
    derivativePolicy: "BROWSER_MEMORY_ONLY_NOT_STORED",
    headerRescuePolicy: "SEMANTIC_HEADER_CONTEXT_ON_REVIEW",
    fieldChecks: checks,
    rescueGroups,
    manualOnlyFieldIds,
  };
}

function average(values) {
  const rows = values.map(Number).filter(Number.isFinite);
  if (!rows.length) return null;
  return rows.reduce((sum, value) => sum + value, 0) / rows.length;
}

function lineRegion(box, width, height) {
  const stats = bboxStats(box);
  if (!stats) return null;
  const safeW = Number(width || 0) > 0 ? Number(width) : 1;
  const safeH = Number(height || 0) > 0 ? Number(height) : 1;
  return {
    xMin: stats.xMin / safeW,
    xMax: stats.xMax / safeW,
    yMin: stats.yMin / safeH,
    yMax: stats.yMax / safeH,
  };
}

export function collectAdaptiveOcrLines(payload) {
  const readPages = payload?.analyzeResult?.readResults;
  if (Array.isArray(readPages)) {
    return readPages.flatMap((page, pageIndex) => (page?.lines || []).map((line, lineIndex) => ({
      id: `read:${pageIndex}:${lineIndex}`,
      text: String(line?.text || "").trim(),
      confidence: average((line?.words || []).map((word) => word?.confidence)),
      region: lineRegion(line?.boundingBox, page?.width, page?.height),
    }))).filter((line) => line.text);
  }

  const layoutPages = payload?.analyzeResult?.pages;
  if (Array.isArray(layoutPages)) {
    return layoutPages.flatMap((page, pageIndex) => (page?.lines || []).map((line, lineIndex) => ({
      id: `layout:${pageIndex}:${lineIndex}`,
      text: String(line?.content || "").trim(),
      confidence: null,
      region: lineRegion(line?.polygon, page?.width, page?.height),
    }))).filter((line) => line.text);
  }
  return [];
}

function lineCenter(region) {
  if (!validRegion(region)) return null;
  return {
    x: (Number(region.xMin) + Number(region.xMax)) / 2,
    y: (Number(region.yMin) + Number(region.yMax)) / 2,
  };
}

function linesForField(lines, field) {
  const sameRowRequired = String(field?.fieldId || "").startsWith("item:") || field?.scope === "LINE_ITEM";
  if (!validRegion(field?.relativeRegion)) return sameRowRequired ? [] : lines;
  const r = field.relativeRegion;
  const padX = 0.035;
  const padY = 0.035;
  const selected = lines.filter((line) => {
    const center = lineCenter(line.region);
    if (!center) return false;
    return center.x >= r.xMin - padX && center.x <= r.xMax + padX && center.y >= r.yMin - padY && center.y <= r.yMax + padY;
  });
  return selected.length ? selected : (sameRowRequired ? [] : lines);
}

function dateTokens(text) {
  const out = [];
  for (const match of String(text || "").matchAll(/\b(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4})\b/g)) {
    let [a, b, c] = [match[1], match[2], match[3]];
    let year, month, day;
    if (String(a).length === 4) {
      year = Number(a); month = Number(b); day = Number(c);
    } else {
      day = Number(a); month = Number(b); year = Number(c) < 100 ? 2000 + Number(c) : Number(c);
    }
    const dt = new Date(Date.UTC(year, month - 1, day));
    if (dt.getUTCFullYear() !== year || dt.getUTCMonth() + 1 !== month || dt.getUTCDate() !== day) continue;
    out.push({ raw: match[0], value: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` });
  }
  return out;
}

function lineDistance(a, b) {
  const ac = lineCenter(a?.region);
  const bc = lineCenter(b?.region);
  if (!ac || !bc) return Number.POSITIVE_INFINITY;
  const dx = Math.abs(ac.x - bc.x);
  const dy = Math.abs(ac.y - bc.y);
  return Math.sqrt((dx * 0.6) ** 2 + dy ** 2);
}

function linesSpatiallyNear(a, b) {
  const ac = lineCenter(a?.region);
  const bc = lineCenter(b?.region);
  if (!ac || !bc) return false;
  return Math.abs(ac.y - bc.y) <= 0.11 && Math.abs(ac.x - bc.x) <= 0.58;
}

function neighborhoodTexts(lines) {
  const sorted = [...lines].sort((a, b) => {
    const ay = lineCenter(a.region)?.y ?? 0;
    const by = lineCenter(b.region)?.y ?? 0;
    if (Math.abs(ay - by) > 0.025) return ay - by;
    const ax = lineCenter(a.region)?.x ?? 0;
    const bx = lineCenter(b.region)?.x ?? 0;
    return ax - bx;
  });
  const rows = sorted.map((line) => ({ text: line.text, lines: [line] }));
  for (let i = 0; i < sorted.length; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (b && linesSpatiallyNear(a, b)) {
      rows.push({ text: `${a.text} ${b.text}`, lines: [a, b] });
    }
    const c = sorted[i + 2];
    if (b && c && linesSpatiallyNear(a, b) && linesSpatiallyNear(b, c)) {
      rows.push({ text: `${a.text} ${b.text} ${c.text}`, lines: [a, b, c] });
    }
  }
  return rows;
}

function confidenceLabel(lines) {
  const value = average(lines.map((line) => line?.confidence));
  if (value == null) return { label: "MEDIUM", numeric: null };
  if (value >= STRONG_DERIVATIVE_CONFIDENCE) return { label: "HIGH", numeric: value };
  if (value >= 0.75) return { label: "MEDIUM", numeric: value };
  return { label: "LOW", numeric: value };
}

function uniqueCandidate(rows) {
  const nonBlank = rows.filter((row) => String(row?.value ?? "").trim());
  const byValue = new Map();
  for (const row of nonBlank) {
    const key = norm(row.value);
    if (!key) continue;
    if (!byValue.has(key)) byValue.set(key, row);
  }
  if (byValue.size !== 1) return null;
  return [...byValue.values()][0];
}

function dateOwner(line, lines) {
  const currentText = String(line?.text || "");
  const explicitInvoice = /\b(?:invoice|inv|bill)\s*(?:date|dt\.?)\b/i.test(currentText);
  if (NON_INVOICE_DATE_CONTEXT.test(currentText)) return "NON_INVOICE";
  if (explicitInvoice) return "INVOICE";

  const currentHasGenericDate = /\b(?:date|dt\.?)\b/i.test(currentText);
  const currentHasDateValue = dateTokens(currentText).length > 0;
  const nearby = (lines || [])
    .filter((candidate) => candidate !== line && linesSpatiallyNear(line, candidate))
    .map((candidate) => ({ candidate, distance: lineDistance(line, candidate) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  const roles = [];
  for (const row of nearby) {
    const text = String(row.candidate?.text || "");
    const explicit = /\b(?:invoice|inv|bill)\s*(?:date|dt\.?)\b/i.test(text);
    const splitInvoice = currentHasGenericDate && /^\s*(?:invoice|inv|bill)\s*[:.-]?\s*$/i.test(text);
    const excludedDate = NON_INVOICE_DATE_CONTEXT.test(text) && /\b(?:date|dt\.?)\b/i.test(text);
    if (excludedDate) roles.push({ role: "NON_INVOICE", distance: row.distance });
    if (explicit || splitInvoice) roles.push({ role: "INVOICE", distance: row.distance });
  }

  if (!currentHasDateValue && !currentHasGenericDate) return "UNKNOWN";
  if (!roles.length) return "UNKNOWN";
  roles.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) > 0.0001) return a.distance - b.distance;
    return a.role === "NON_INVOICE" ? -1 : 1;
  });
  return roles[0].role;
}

function parseHeaderDate(lines) {
  const candidates = [];
  for (const line of lines || []) {
    const tokens = dateTokens(line?.text || "");
    if (!tokens.length || dateOwner(line, lines) !== "INVOICE") continue;
    for (const date of tokens) {
      candidates.push({ value: date.value, lines: [line], reason: "SPATIALLY_OWNED_INVOICE_DATE" });
    }
  }
  return uniqueCandidate(candidates);
}

function parseInvoiceNumber(lines) {
  const candidates = [];
  for (const entry of neighborhoodTexts(lines)) {
    if (/\b(tp|permit|transport|dispatch|order)\b/i.test(entry.text)) continue;
    const match = entry.text.match(/\b(?:invoice|inv|bill)\s*(?:no|number|#)?\s*[:.-]?\s*([A-Z0-9][A-Z0-9/-]{1,30})\b/i);
    if (match?.[1] && !/^(date|dt)$/i.test(match[1])) candidates.push({ value: match[1], lines: entry.lines, reason: "EXPLICIT_INVOICE_NUMBER_LABEL" });
  }
  return uniqueCandidate(candidates);
}

function parseSupplier(lines, receivingShopName) {
  const candidates = lines
    .filter((line) => LEGAL_SUFFIX.test(line.text))
    .filter((line) => !/\b(buyer|bill\s*to|ship\s*to|consignee|customer|receiver)\b/i.test(line.text))
    .filter((line) => !receivingShopName || !partyLooksSame(line.text, receivingShopName))
    .map((line) => ({ value: line.text, lines: [line], reason: "LEGAL_VENDOR_LINE" }));
  if (!candidates.length) return null;
  const distinct = new Map(candidates.map((row) => [norm(row.value), row]));
  if (distinct.size === 1) return [...distinct.values()][0];

  const roleAnchored = [...distinct.values()].filter((row) =>
    /\b(supplier|vendor|seller|issuer)\b/i.test(row.value),
  );
  return roleAnchored.length === 1 ? roleAnchored[0] : null;
}

function numericTokens(text) {
  return (String(text || "").match(/-?\d[\d,]*(?:\.\d+)?/g) || [])
    .map((raw) => ({ raw, value: Number(raw.replace(/,/g, "")) }))
    .filter((row) => Number.isFinite(row.value));
}

function parseLineOrFinance(field, lines) {
  const selected = linesForField(lines, field);
  const joined = selected.map((line) => line.text).join(" ").trim();
  const suffix = String(field.fieldId || "").split(":").pop();

  if (suffix === "packing") {
    const matches = [...joined.matchAll(/\b(\d{2,4}(?:\.\d+)?)\s*(ml|cl|l)\b/gi)].map((m) => `${m[1]} ${m[2].toUpperCase()}`);
    const value = [...new Set(matches)][0];
    return matches.length && new Set(matches).size === 1 ? { value, lines: selected, reason: "PACKING_REGION" } : null;
  }

  if (suffix === "batch_number") {
    const regex = new RegExp(`\\b([A-Z0-9]{2,12})[\\s-]+(${MONTH_PATTERN})[A-Z]*[\\s\\-/.]*(20\\d{2}|\\d{2})\\b`, "i");
    const match = joined.match(regex);
    return match?.[0] ? { value: match[0], lines: selected, reason: "BATCH_REGION" } : null;
  }

  if (suffix === "description") {
    const textRows = selected.map((line) => line.text).filter((value) => /[a-z]/i.test(value) && !/^\s*(mrp|rate|amount|batch|packing|qty|cases?)\b/i.test(value));
    if (!textRows.length) return null;
    const value = textRows.sort((a, b) => b.length - a.length)[0];
    return value ? { value, lines: selected, reason: "DESCRIPTION_REGION" } : null;
  }

  if (field.scope === "FINANCE") {
    const labelTokens = norm(field.label).split(" ").filter((token) => token.length >= 4);
    const labelled = selected.filter((line) => {
      const n = norm(line.text);
      return labelTokens.some((token) => n.includes(token));
    });
    const source = labelled.length ? labelled : selected;
    const values = numericTokens(source.map((line) => line.text).join(" ")).map((row) => row.value);
    const unique = [...new Set(values.map((value) => Number(value.toFixed(2))))];
    return unique.length === 1 ? { value: String(unique[0]), lines: source, reason: "FINANCE_LABEL_REGION" } : null;
  }

  if (["case_count", "units_per_case", "loose_bottles", "printed_bottle_quantity"].includes(suffix) || field.kind === "COUNT") {
    const values = numericTokens(joined).map((row) => row.value).filter((value) => Number.isInteger(value) && value >= 0 && value <= 10000);
    const unique = [...new Set(values)];
    return unique.length === 1 ? { value: String(unique[0]), lines: selected, reason: "COUNT_REGION" } : null;
  }

  if (["mrp", "rate_per_case", "amount"].includes(suffix) || field.kind === "MONEY") {
    const values = numericTokens(joined).map((row) => row.value).filter((value) => value >= 0);
    const unique = [...new Set(values.map((value) => Number(value.toFixed(2))))];
    return unique.length === 1 ? { value: String(unique[0]), lines: selected, reason: "MONEY_REGION" } : null;
  }

  const distinct = [...new Set(selected.map((line) => line.text).filter(Boolean))];
  return distinct.length === 1 ? { value: distinct[0], lines: selected, reason: "FIELD_REGION" } : null;
}

function parseFieldCandidate(field, lines, receivingShopName) {
  if (field.fieldId === "header:invoice_date") return parseHeaderDate(lines);
  if (field.fieldId === "header:invoice_number") return parseInvoiceNumber(lines);
  if (field.fieldId === "header:supplier_name") return parseSupplier(lines, receivingShopName);
  return parseLineOrFinance(field, lines);
}

export function analyzeAdaptiveRescueGroup({ payload, group, source = "VISION_DERIVATIVE" }) {
  const lines = collectAdaptiveOcrLines(payload);
  const fieldResults = [];
  for (const field of group?.fields || []) {
    const candidate = parseFieldCandidate(field, lines, group?.receivingShopName || "");
    const confidence = confidenceLabel(candidate?.lines || []);
    const value = candidate?.value == null ? "" : String(candidate.value).trim();
    fieldResults.push({
      fieldId: field.fieldId,
      label: field.label,
      scope: field.scope,
      kind: field.kind,
      source,
      suggestedValue: value,
      confidence: value ? confidence.label : "LOW",
      numericConfidence: confidence.numeric,
      reason: value ? candidate.reason : "NO_UNIQUE_SAFE_CANDIDATE",
      requiresHumanConfirmation: true,
    });
  }
  return {
    groupId: group?.groupId || "unknown",
    source,
    lineCount: lines.length,
    fieldResults,
    unresolvedFieldIds: fieldResults
      .filter((row) => !row.suggestedValue || row.confidence !== "HIGH")
      .map((row) => row.fieldId),
  };
}

export function mergeAdaptiveRescueResults(standardGroups = [], highResolutionGroups = []) {
  const standard = new Map();
  const high = new Map();
  for (const group of standardGroups || []) {
    for (const row of group?.fieldResults || []) standard.set(row.fieldId, row);
  }
  for (const group of highResolutionGroups || []) {
    for (const row of group?.fieldResults || []) high.set(row.fieldId, row);
  }

  const ids = [...new Set([...standard.keys(), ...high.keys()])];
  const fieldResults = ids.map((fieldId) => {
    const a = standard.get(fieldId) || null;
    const b = high.get(fieldId) || null;
    const av = String(a?.suggestedValue || "").trim();
    const bv = String(b?.suggestedValue || "").trim();
    if (av && bv && norm(av) !== norm(bv)) {
      return {
        fieldId,
        label: b?.label || a?.label || fieldId,
        scope: b?.scope || a?.scope || "UNKNOWN",
        state: "CONFLICT",
        suggestedValue: "",
        confidence: "LOW",
        source: "ADAPTIVE_OCR_CONFLICT",
        candidates: [a, b],
        reason: "Standard derivative Vision and high-resolution Layout disagree.",
        requiresHumanConfirmation: true,
      };
    }
    const chosen = bv ? b : a;
    const aConfidence = String(a?.confidence || "LOW").toUpperCase();
    const bConfidence = String(b?.confidence || "LOW").toUpperCase();
    const chosenConfidence = String(chosen?.confidence || "LOW").toUpperCase();
    const corroborated = Boolean(
      av &&
      bv &&
      norm(av) === norm(bv) &&
      ["HIGH", "MEDIUM"].includes(aConfidence) &&
      ["HIGH", "MEDIUM"].includes(bConfidence)
    );
    const safeSuggestion = Boolean(
      chosen?.suggestedValue &&
      (chosenConfidence === "HIGH" || corroborated)
    );

    return {
      ...(chosen || { fieldId }),
      state: safeSuggestion ? "SUGGESTION" : "UNRESOLVED",
      suggestedValue: safeSuggestion ? String(chosen?.suggestedValue || "").trim() : "",
      candidates: [a, b].filter(Boolean),
      reason: safeSuggestion
        ? chosen?.reason
        : chosen?.suggestedValue
          ? "LOW_OR_SINGLE_SOURCE_MEDIUM_WITHHELD"
          : chosen?.reason,
      requiresHumanConfirmation: true,
    };
  });

  return {
    version: 1,
    mode: "FIELD_LEVEL_ADAPTIVE_OCR_V1",
    derivativeStored: false,
    fieldResults,
    suggestions: fieldResults.filter((row) => row.state === "SUGGESTION" && row.suggestedValue),
    conflicts: fieldResults.filter((row) => row.state === "CONFLICT"),
    unresolved: fieldResults.filter((row) => row.state === "UNRESOLVED"),
  };
}
