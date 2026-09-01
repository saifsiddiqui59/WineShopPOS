import { extractInvoiceFinancials, parseOcrMoneyText } from "./invoiceFinance.js";

function fieldContent(field) {
  return field?.content ?? field?.valueString ?? field?.valueNumber ?? field?.valueDate ?? null;
}
function numberValue(field) {
  const typed = field?.valueNumber ?? field?.valueCurrency?.amount;
  if (typeof typed === "number" && Number.isFinite(typed)) return typed;
  return parseOcrMoneyText(field?.content ?? field?.valueString ?? typed);
}
function normalize(value) {
  return String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}
function whole(value) {
  const n = parseOcrMoneyText(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return Math.abs(n - rounded) <= 0.08 ? rounded : null;
}
function headerRole(value) {
  const n = normalize(value);
  const c = compact(value);
  if (c.includes("batch") || c === "lot" || c.includes("lotno")) return "batch";
  if (c.includes("packing") || c === "pack" || c.includes("packsize") || c === "size") return "packing";
  if (
    c === "qtycs" || c === "qtycase" || c === "qtycases" ||
    c === "nocs" || c === "cases" || c === "case" || c === "cs" ||
    ((c.includes("qty") || c.includes("no")) && (c.includes("case") || c.endsWith("cs")))
  ) return "cases";
  if (
    c === "qtybtl" || c === "qtybottle" || c === "qtybottles" ||
    c === "nobtl" || c === "nobottle" || c === "btl" || c === "bottles"
  ) return "bottles";
  if (c.includes("ratecs") || c.includes("ratecase") || c.includes("ratepercase")) return "rateCase";
  if (n === "rate per" || n === "rate" || c === "unitrate" || c === "rateper") return "rate";
  if (n === "amount" || n === "amt" || c === "linetotal" || c === "netamount") return "amount";
  if (c === "mrp") return "mrp";
  if (
    n === "brand" || n === "description" || n === "item" || n === "item name" ||
    n === "name of item" || n.includes("name of item") || n.includes("product description") ||
    n === "particulars"
  ) return "description";
  if (n.includes("mrp") && (n.includes("brand") || n.includes("item") || n.includes("description"))) return "mrpDescription";
  return null;
}

function parseMrpLead(text) {
  const raw = String(text || "").trim();
  const match = raw.match(/^\s*([0-9][0-9,.:']*\)?)(?:\s+|$)(.*)$/);
  if (!match) return { mrp: null, mrpRaw: "", descriptionRemainder: raw, review: false };
  const mrpRaw = match[1].replace(/\)$/, "");
  let mrp = null;
  let review = false;
  const sepMatches = [...mrpRaw.matchAll(/[,.:'']/g)];
  if (sepMatches.length === 1) {
    const sep = sepMatches[0];
    const tail = mrpRaw.slice((sep.index ?? -1) + 1).replace(/\D/g, "");
    const head = mrpRaw.slice(0, sep.index).replace(/\D/g, "");
    if (tail.length === 2 || tail.length === 3) {
      const n = Number(`${head || "0"}.${tail}`);
      if (Number.isFinite(n)) mrp = n;
    }
  } else if (sepMatches.length > 1) {
    mrp = parseOcrMoneyText(mrpRaw);
  } else {
    const digits = mrpRaw.replace(/\D/g, "");
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0 && n < 5000) mrp = n;
    else if (Number.isFinite(n) && n > 0) review = true;
  }
  return {
    mrp: Number.isFinite(mrp) && mrp > 0 ? mrp : null,
    mrpRaw,
    descriptionRemainder: String(match[2] || "").trim(),
    review: review || !Number.isFinite(mrp),
  };
}

function findHeader(table) {
  const cells = table?.cells || [];
  const rowIndexes = [...new Set(cells.map((c) => Number(c.rowIndex || 0)))].sort((a, b) => a - b);
  let best = null;
  for (const rowIndex of rowIndexes.slice(0, 10)) {
    const rowCells = cells.filter((c) => Number(c.rowIndex || 0) === rowIndex);
    const roles = {};
    let combinedMrpDescriptionCol = null;
    for (const cell of rowCells) {
      const role = headerRole(cell.content);
      const col = Number(cell.columnIndex || 0);
      if (role === "mrpDescription") combinedMrpDescriptionCol = col;
      else if (role && roles[role] == null) roles[role] = col;
    }
    const rateCol = roles.rateCase ?? roles.rate;
    const itemAnchor = combinedMrpDescriptionCol ?? roles.description ?? roles.mrp;
    const required = roles.batch != null && roles.packing != null && rateCol != null && roles.amount != null && itemAnchor != null;
    if (!required) continue;
    const score = 5 + (roles.cases != null ? 1 : 0) + (roles.bottles != null ? 1 : 0) + (roles.mrp != null ? 1 : 0) + (combinedMrpDescriptionCol != null ? 1 : 0);
    if (!best || score > best.score) {
      best = {
        rowIndex,
        roles,
        rateCol,
        combinedMrpDescriptionCol,
        itemStartCol: Math.min(itemAnchor, roles.mrp ?? itemAnchor, roles.description ?? itemAnchor),
        itemEndCol: roles.batch - 1,
        score,
      };
    }
  }
  return best;
}

function getCell(cells, ri, ci) {
  if (ci == null) return null;
  return cells.find((cell) => Number(cell.rowIndex || 0) === ri && Number(cell.columnIndex || 0) === ci) || null;
}
function rowCellsInRange(cells, ri, startCol, endCol) {
  return cells
    .filter((cell) => Number(cell.rowIndex || 0) === ri && Number(cell.columnIndex || 0) >= startCol && Number(cell.columnIndex || 0) <= endCol)
    .sort((a, b) => Number(a.columnIndex || 0) - Number(b.columnIndex || 0));
}
function plausibleBatch(raw, confidence) {
  const text = String(raw || "").trim();
  if (!text) return false;
  if (!Number.isFinite(Number(confidence))) return false;
  if (Number(confidence) < 0.85) return false;
  return /^\d{2,5}\s+[A-Za-z]{3}[- /.]\d{2}$/.test(text);
}

function findPrintedCaseTotal(table, header, derivedTotal) {
  if (!table || !header || !(derivedTotal > 0)) return null;
  const cells = table.cells || [];
  const rows = [...new Set(cells.map((c) => Number(c.rowIndex || 0)))].sort((a,b)=>a-b);
  for (const ri of rows.filter((x) => x > header.rowIndex)) {
    const row = cells.filter((c) => Number(c.rowIndex || 0) === ri);
    if (!row.some((c) => normalize(c.content) === "total")) continue;
    const candidates = row
      .filter((c) => {
        const ci = Number(c.columnIndex || 0);
        return ci !== header.roles.amount && ci !== header.rateCol;
      })
      .map((c) => whole(c.content))
      .filter((n) => Number.isFinite(n) && n > 0 && n <= 5000);
    const exact = candidates.find((n) => n === derivedTotal);
    if (exact != null) return exact;
  }
  return null;
}

function parseTable(table) {
  const cells = table?.cells || [];
  const header = findHeader(table);
  if (!header) return { items: [], meta: null };
  const rowIndexes = [...new Set(cells.map((c) => Number(c.rowIndex || 0)))].sort((a, b) => a - b);
  const output = [];

  for (const ri of rowIndexes.filter((x) => x > header.rowIndex)) {
    const itemCells = rowCellsInRange(cells, ri, header.itemStartCol, header.itemEndCol);
    const joinedItem = itemCells.map((c) => String(c.content || "").trim()).filter(Boolean).join(" ").trim();
    const packCell = getCell(cells, ri, header.roles.packing);
    const batchCell = getCell(cells, ri, header.roles.batch);
    const caseCell = getCell(cells, ri, header.roles.cases);
    const bottleCell = getCell(cells, ri, header.roles.bottles);
    const rateCell = getCell(cells, ri, header.rateCol);
    const amountCell = getCell(cells, ri, header.roles.amount);
    const explicitMrpCell = getCell(cells, ri, header.roles.mrp);

    const ratePerCase = parseOcrMoneyText(rateCell?.content);
    let amount = parseOcrMoneyText(amountCell?.content);
    if (!(ratePerCase > 0) || !(amount > 0)) continue;

    let mrp = explicitMrpCell ? parseOcrMoneyText(explicitMrpCell.content) : null;
    let mrpRaw = explicitMrpCell ? String(explicitMrpCell.content || "").trim() : "";
    let mrpReviewRequired = false;
    let description = joinedItem;

    if (header.combinedMrpDescriptionCol != null) {
      const firstCell = getCell(cells, ri, header.combinedMrpDescriptionCol);
      const split = parseMrpLead(firstCell?.content || "");
      mrp = split.mrp;
      mrpRaw = split.mrpRaw;
      mrpReviewRequired = split.review;
      const remaining = itemCells
        .filter((c) => Number(c.columnIndex || 0) !== header.combinedMrpDescriptionCol)
        .map((c) => String(c.content || "").trim())
        .filter(Boolean);
      description = [split.descriptionRemainder, ...remaining].filter(Boolean).join(" ").trim();
    } else if (header.roles.mrp != null && header.roles.description != null) {
      description = String(getCell(cells, ri, header.roles.description)?.content || "").trim();
    }

    const descNorm = normalize(description);
    if (!description || !/[a-z]/i.test(description) || /^(scheme details|total|subtotal|gross amount|assessable value|bank details)$/.test(descNorm)) continue;

    const directCases = whole(caseCell?.content);
    const ratio = amount / ratePerCase;
    const roundedRatio = Math.round(ratio);
    const derivedCases = roundedRatio > 0 && roundedRatio <= 1000 && Math.abs(ratio - roundedRatio) <= 0.08 ? roundedRatio : null;
    const caseCount = derivedCases ?? directCases;
    if (!(caseCount > 0)) continue;
    if (!(amount > 0) && caseCount > 0 && ratePerCase > 0) amount = Number((caseCount * ratePerCase).toFixed(2));

    const looseBottles = whole(bottleCell?.content) || 0;
    const packText = String(packCell?.content || "").trim();
    const batchNumber = String(batchCell?.content || "").trim();
    const confidences = [packCell, batchCell, caseCell, bottleCell, rateCell, amountCell, explicitMrpCell]
      .map((cell) => Number(cell?.confidence))
      .filter(Number.isFinite);

    output.push({
      description,
      productCode: "",
      quantity: caseCount,
      unitText: "case",
      unitPrice: ratePerCase,
      ratePerCase,
      amount,
      mrp: mrp > 0 ? mrp : null,
      mrpRaw,
      mrpReviewRequired,
      batchNumber,
      batchReviewRequired: !plausibleBatch(batchNumber, batchCell?.confidence),
      expiryDate: "",
      taxAmount: null,
      caseCount,
      caseCountSource: derivedCases != null ? "DERIVED_AMOUNT_RATE" : "OCR_CASE_COLUMN",
      directCaseCount: directCases,
      looseBottles,
      packing: packText,
      confidence: confidences.length ? Math.min(...confidences) : null,
      extractionSource: "SEMANTIC_TABLE",
    });
  }

  const derivedCaseTotal = output.reduce((sum, item) => sum + Number(item.caseCount || 0), 0);
  const printedCaseTotal = findPrintedCaseTotal(table, header, derivedCaseTotal);
  return {
    items: output,
    meta: {
      headerRow: header.rowIndex,
      derivedCaseTotal,
      printedCaseTotal,
      caseTotalMatches: printedCaseTotal == null ? null : printedCaseTotal === derivedCaseTotal,
    },
  };
}

function semanticTableExtraction(result) {
  const candidates = [];
  for (const table of result?.analyzeResult?.tables || []) {
    const parsed = parseTable(table);
    if (parsed.items.length) candidates.push(parsed);
  }
  if (!candidates.length) return { items: [], meta: null };
  candidates.sort((a, b) => b.items.length - a.items.length);
  return candidates[0];
}

function tokenScore(a, b) {
  const aa = new Set(normalize(a).split(" ").filter((x) => x.length > 1));
  const bb = new Set(normalize(b).split(" ").filter((x) => x.length > 1));
  if (!aa.size || !bb.size) return 0;
  const common = [...aa].filter((x) => bb.has(x)).length;
  return common / Math.max(aa.size, bb.size);
}

function mergeTableHints(rawItems, tableItems) {
  if (!tableItems.length) return rawItems;
  if (tableItems.length >= 2 && (!rawItems.length || tableItems.length >= Math.ceil(rawItems.length * 0.6))) return tableItems;
  const used = new Set();
  return rawItems.map((item, index) => {
    let bestIndex = -1;
    let bestScore = 0;
    tableItems.forEach((hint, hintIndex) => {
      if (used.has(hintIndex)) return;
      const score = tokenScore(item?.description, hint?.description);
      if (score > bestScore) { bestScore = score; bestIndex = hintIndex; }
    });
    if (bestIndex < 0 && rawItems.length === tableItems.length && !used.has(index)) { bestIndex = index; bestScore = 0.5; }
    if (bestIndex < 0 || bestScore < 0.35) return item;
    used.add(bestIndex);
    return { ...item, ...tableItems[bestIndex], description: tableItems[bestIndex].description || item.description, extractionSource: "SEMANTIC_TABLE_MERGE" };
  });
}

export function normalizeDocumentIntelligenceResult(result) {
  const document = result?.analyzeResult?.documents?.[0];
  const fields = document?.fields || {};
  const rawItems = (fields.Items?.valueArray || []).map((row) => {
    const item = row?.valueObject || {};
    return {
      description: String(fieldContent(item.Description) || fieldContent(item.ProductCode) || ""),
      productCode: String(fieldContent(item.ProductCode) || ""),
      quantity: numberValue(item.Quantity),
      unitText: String(fieldContent(item.Unit) || fieldContent(item.Units) || ""),
      unitPrice: numberValue(item.UnitPrice),
      ratePerCase: null,
      amount: numberValue(item.Amount),
      mrp: numberValue(item.MRP) ?? numberValue(item.ListPrice),
      batchNumber: String(fieldContent(item.BatchNumber) || fieldContent(item.LotNumber) || ""),
      expiryDate: String(fieldContent(item.ExpiryDate) || ""),
      taxAmount: numberValue(item.Tax),
      caseCount: null,
      looseBottles: 0,
      packing: "",
      confidence: row?.confidence ?? item?.Description?.confidence ?? null,
      extractionSource: "PREBUILT_INVOICE",
    };
  });

  const semantic = semanticTableExtraction(result);
  const items = mergeTableHints(rawItems, semantic.items);
  const financial = extractInvoiceFinancials(result, fields, items);
  return {
    supplierName: String(fieldContent(fields.VendorName) || ""),
    vendorAddress: String(fieldContent(fields.VendorAddress) || ""),
    vendorTaxId: String(fieldContent(fields.VendorTaxId) || ""),
    paymentTerm: String(fieldContent(fields.PaymentTerm) || ""),
    invoiceNumber: String(fieldContent(fields.InvoiceId) || ""),
    invoiceDate: String(fieldContent(fields.InvoiceDate) || ""),
    ...financial,
    items,
    ocrQuality: {
      documentConfidence: document?.confidence ?? null,
      semanticTableDetected: semantic.items.length > 0,
      semanticTableLineCount: semantic.items.length,
      genericItemLineCount: rawItems.length,
      extractionMode: semantic.items.length >= 2 ? "SEMANTIC_TABLE_FIRST" : "PREBUILT_INVOICE_FALLBACK",
      derivedCaseTotal: semantic.meta?.derivedCaseTotal ?? null,
      printedCaseTotal: semantic.meta?.printedCaseTotal ?? null,
      caseTotalMatches: semantic.meta?.caseTotalMatches ?? null,
    },
  };
}
