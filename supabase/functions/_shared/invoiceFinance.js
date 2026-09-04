export function parseOcrMoneyText(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const matches = text.match(/\(?-?\d[\d,.:']*\d\)?|\(?-?\d\)?/g);
  if (!matches?.length) return null;
  const globalNegative = /\(-\)/.test(text);

  const parseToken = (token) => {
    const raw = String(token || "").trim();
    const negative = /^-/.test(raw) || /^\(.*\)$/.test(raw);
    const body = raw.replace(/[()\-]/g, "");
    const digits = body.replace(/\D/g, "");
    if (!digits) return null;

    const separators = [...body.matchAll(/[,.:'']/g)];
    let number;
    if (!separators.length) {
      number = Number(digits);
    } else {
      const last = separators[separators.length - 1];
      const tailDigits = body.slice((last.index ?? -1) + 1).replace(/\D/g, "");
      if (tailDigits.length === 2) {
        const integerDigits = body.slice(0, last.index).replace(/\D/g, "") || "0";
        number = Number(`${integerDigits}.${tailDigits}`);
      } else {
        number = Number(digits);
      }
    }
    return Number.isFinite(number) ? (negative ? -Math.abs(number) : number) : null;
  };

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const parsed = parseToken(matches[i]);
    if (Number.isFinite(parsed)) return globalNegative ? -Math.abs(parsed) : parsed;
  }
  return null;
}

function fieldNumber(field) {
  const typed = field?.valueNumber ?? field?.valueCurrency?.amount;
  if (typeof typed === "number" && Number.isFinite(typed)) return typed;
  return parseOcrMoneyText(field?.content ?? field?.valueString ?? typed);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeLabelText(value) {
  return normalizeText(value)
    .replace(/\d+/g, " ")
    .replace(/([a-z])\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a, b) {
  const aa = String(a || "");
  const bb = String(b || "");
  const row = Array.from({ length: bb.length + 1 }, (_, i) => i);
  for (let i = 1; i <= aa.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= bb.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (aa[i - 1] === bb[j - 1] ? 0 : 1),
      );
      prev = saved;
    }
  }
  return row[bb.length];
}

function labelMatches(value, aliases) {
  const label = normalizeLabelText(value);
  return aliases.some((alias) => {
    const a = normalizeLabelText(alias);
    if (!a || !label) return false;
    if (label === a || label.startsWith(`${a} `) || label.endsWith(` ${a}`) || label.includes(` ${a} `)) return true;
    const maxDistance = Math.max(1, Math.floor(Math.max(label.length, a.length) * 0.08));
    return Math.min(label.length, a.length) >= 5 && editDistance(label, a) <= maxDistance;
  });
}

function parseMoneyText(value) {
  return parseOcrMoneyText(value);
}

function looksLikeStandaloneMoney(value) {
  const text = String(value || "").trim();
  if (!text || /[a-z]/i.test(text)) return false;
  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text)) return false;
  if (/\b\d{1,2}:\d{2}\b/.test(text)) return false;
  if (/^(19|20)\d{2}$/.test(text)) return false;
  return parseMoneyText(text) != null;
}

function bounds(polygon = []) {
  const points = [];
  if (polygon.length && typeof polygon[0] === "number") {
    for (let i = 0; i + 1 < polygon.length; i += 2) {
      points.push([Number(polygon[i]), Number(polygon[i + 1])]);
    }
  } else {
    for (const p of polygon) {
      const x = Number(p?.x);
      const y = Number(p?.y);
      if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]);
    }
  }
  if (!points.length) return null;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    left, right, top, bottom,
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: Math.max(0.0001, right - left),
    height: Math.max(0.0001, bottom - top),
  };
}

function flattenEvidence(analyzeResult) {
  const pages = analyzeResult?.analyzeResult?.pages || [];
  const out = [];

  pages.forEach((page, pageIndex) => {
    const pageWidth = Number(page?.width || 1);
    const pageHeight = Number(page?.height || 1);
    for (const line of page?.lines || []) {
      const b = bounds(line?.polygon || []);
      if (!b) continue;
      out.push({
        source: "line",
        pageIndex,
        pageWidth,
        pageHeight,
        text: String(line?.content || ""),
        norm: normalizeText(line?.content || ""),
        ...b,
      });
    }
  });

  for (const table of analyzeResult?.analyzeResult?.tables || []) {
    for (const cell of table?.cells || []) {
      const region = cell?.boundingRegions?.[0];
      const pageIndex = Math.max(0, Number(region?.pageNumber || 1) - 1);
      const page = pages[pageIndex] || {};
      const b = bounds(region?.polygon || []);
      if (!b) continue;
      out.push({
        source: "cell",
        pageIndex,
        pageWidth: Number(page?.width || 1),
        pageHeight: Number(page?.height || 1),
        text: String(cell?.content || ""),
        norm: normalizeText(cell?.content || ""),
        ...b,
      });
    }
  }

  const seen = new Set();
  return out.filter((row) => {
    const key = `${row.pageIndex}|${row.norm}|${Math.round(row.x * 100)}|${Math.round(row.y * 100)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findSpatialLabeledAmount(evidence, aliases) {
  for (const label of evidence) {
    if (!labelMatches(label.text, aliases)) continue;

    const tolerance = Math.max(label.pageHeight * 0.012, label.height * 1.6);
    const candidates = evidence
      .filter(
        (row) =>
          row !== label &&
          row.pageIndex === label.pageIndex &&
          row.left > label.right + label.pageWidth * 0.01 &&
          Math.abs(row.y - label.y) <= tolerance &&
          looksLikeStandaloneMoney(row.text),
      )
      .sort(
        (a, b) =>
          Math.abs(a.y - label.y) - Math.abs(b.y - label.y) ||
          b.right - a.right,
      );

    if (candidates[0]) {
      return {
        value: parseMoneyText(candidates[0].text),
        label: label.text,
        evidence: `${label.text} -> ${candidates[0].text}`,
        pageIndex: label.pageIndex,
        y: label.y,
      };
    }
  }
  return null;
}


function findTableLabeledAmount(analyzeResult, aliases) {
  const pages = analyzeResult?.analyzeResult?.pages || [];
  for (const table of analyzeResult?.analyzeResult?.tables || []) {
    const cells = table?.cells || [];
    for (const labelCell of cells) {
      if (!labelMatches(labelCell?.content || "", aliases)) continue;
      const rowIndex = Number(labelCell?.rowIndex);
      const labelColumn = Number(labelCell?.columnIndex ?? -1);
      if (!Number.isFinite(rowIndex)) continue;

      const candidates = cells
        .filter((cell) =>
          cell !== labelCell &&
          Number(cell?.rowIndex) === rowIndex &&
          Number(cell?.columnIndex ?? -1) > labelColumn &&
          looksLikeStandaloneMoney(cell?.content || ""),
        )
        .map((cell) => ({
          cell,
          value: parseMoneyText(cell?.content || ""),
          columnIndex: Number(cell?.columnIndex ?? -1),
        }))
        .filter((entry) => Number.isFinite(entry.value))
        .sort((a, b) => b.columnIndex - a.columnIndex);

      const best = candidates[0];
      if (!best) continue;

      const region = labelCell?.boundingRegions?.[0] || best.cell?.boundingRegions?.[0];
      const pageIndex = Math.max(0, Number(region?.pageNumber || 1) - 1);
      const b = bounds(region?.polygon || []) || {};
      return {
        value: best.value,
        label: String(labelCell?.content || ""),
        evidence: `${labelCell?.content || ""} -> ${best.cell?.content || ""}`,
        pageIndex,
        y: Number.isFinite(b.y) ? b.y : rowIndex,
        source: "table-row",
      };
    }
  }
  return null;
}

function findKeyValueLabeledAmount(analyzeResult, aliases) {
  const pairs = analyzeResult?.analyzeResult?.keyValuePairs || [];
  for (const pair of pairs) {
    const keyText = String(pair?.key?.content || "");
    if (!labelMatches(keyText, aliases)) continue;
    const valueText = String(pair?.value?.content || "");
    const value = parseMoneyText(valueText);
    if (!Number.isFinite(value)) continue;
    const region = pair?.key?.boundingRegions?.[0] || pair?.value?.boundingRegions?.[0];
    const pageIndex = Math.max(0, Number(region?.pageNumber || 1) - 1);
    const b = bounds(region?.polygon || []) || {};
    return {
      value,
      label: keyText,
      evidence: `${keyText} -> ${valueText}`,
      pageIndex,
      y: Number.isFinite(b.y) ? b.y : 0,
      source: "key-value",
    };
  }
  return null;
}

function tableHasMatchingLabel(analyzeResult, aliases) {
  for (const table of analyzeResult?.analyzeResult?.tables || []) {
    for (const cell of table?.cells || []) {
      if (labelMatches(cell?.content || "", aliases)) return true;
    }
  }
  return false;
}

function findLabeledAmount(analyzeResult, evidence, aliases) {
  const tableMatch = findTableLabeledAmount(analyzeResult, aliases);
  if (tableMatch) return tableMatch;

  const keyValueMatch = findKeyValueLabeledAmount(analyzeResult, aliases);
  if (keyValueMatch) return keyValueMatch;

  // A structured table label with no row amount is meaningful evidence that
  // the field is blank. Do not borrow a neighboring finance row's amount.
  if (tableHasMatchingLabel(analyzeResult, aliases)) return null;

  // Keep spatial fallback for invoices whose finance summary exists only as
  // ordinary page lines (for example older supplier layouts).
  return findSpatialLabeledAmount(evidence, aliases);
}

function findPrintedTotal(evidence, summaryEvidence, baseValue, expectedValue) {
  const ev = summaryEvidence.filter(Boolean);
  const pageIndex = ev.length
    ? Math.max(...ev.map((x) => x.pageIndex))
    : Math.max(0, ...evidence.map((x) => x.pageIndex));
  const pageRows = evidence.filter((x) => x.pageIndex === pageIndex);
  if (!pageRows.length) return null;

  const startY = ev.length
    ? Math.min(...ev.filter((x) => x.pageIndex === pageIndex).map((x) => x.y))
    : Math.max(...pageRows.map((x) => x.bottom)) * 0.55;

  const threshold = Math.max(100, Number(baseValue || 0) * 0.5);
  const expected = Number(expectedValue || 0);

  const candidates = pageRows
    .map((row) => ({ ...row, money: parseMoneyText(row.text) }))
    .filter(
      (row) =>
        row.y >= startY &&
        row.x >= row.pageWidth * 0.55 &&
        looksLikeStandaloneMoney(row.text) &&
        Number.isFinite(row.money) &&
        Math.abs(row.money) > threshold,
    );

  candidates.sort((a, b) => {
    if (expected > 0) {
      const da = Math.abs(Math.abs(a.money) - expected);
      const db = Math.abs(Math.abs(b.money) - expected);
      if (Math.abs(da - db) > 0.01) return da - db;
    }
    return b.y - a.y || b.right - a.right;
  });

  return candidates[0] ? Math.abs(candidates[0].money) : null;
}

const absOrZero = (entry) => Math.abs(Number(entry?.value || 0));

export function extractInvoiceFinancials(analyzeResult, fields = {}, items = []) {
  const evidence = flattenEvidence(analyzeResult);
  const lineProductValue = Number(
    (items || []).reduce((sum, item) => sum + Math.max(0, Number(item?.amount || 0)), 0).toFixed(2),
  );

  const cashDiscount = findLabeledAmount(analyzeResult, evidence, [
    "cash discount", "cash discounts", "cash disc",
  ]);
  const otherDeduction = findLabeledAmount(analyzeResult, evidence, [
    "other deduction", "other deductions", "other discount", "other discounts", "other ded",
  ]);
  const freightCarting = findLabeledAmount(analyzeResult, evidence, [
    "freight carting", "freight and carting",
    "carrying and forwarding", "carrying forwarding",
    "carriage and forwarding", "carriage forwarding",
  ]);
  const transport = findLabeledAmount(analyzeResult, evidence, ["transport"]);
  const handling = findLabeledAmount(analyzeResult, evidence, ["handling"]);
  const loadingUnloading = findLabeledAmount(analyzeResult, evidence, [
    "loading unloading", "loading and unloading",
  ]);
  const stampDuty = findLabeledAmount(analyzeResult, evidence, [
    "stamp duty", "stamp fee", "stamp fees",
  ]);
  const tcs = findLabeledAmount(analyzeResult, evidence, ["tcs"]);
  const otherAdditions = findLabeledAmount(analyzeResult, evidence, [
    "other additions", "other addition",
  ]);
  const roundOff = findLabeledAmount(analyzeResult, evidence, [
    "round off", "rounding adjustment",
  ]);

  const summaryEvidence = [
    cashDiscount, otherDeduction, freightCarting, transport, handling,
    loadingUnloading, stampDuty, tcs, otherAdditions, roundOff,
  ];

  const standardDiscount = Math.max(
    0,
    Math.abs(Number(fieldNumber(fields.Discount) ?? fieldNumber(fields.TotalDiscount) ?? 0)),
  );
  const standardFreight = Math.max(
    0,
    Math.abs(Number(
      fieldNumber(fields.Freight) ??
      fieldNumber(fields.ShippingCost) ??
      fieldNumber(fields.Shipping) ??
      0
    )),
  );
  const standardOther = Math.max(
    0,
    Math.abs(Number(fieldNumber(fields.OtherCharges) ?? 0)),
  );

  const hasLabeledDiscount = Boolean(cashDiscount || otherDeduction);
  const supplierDiscountAmount = absOrZero(cashDiscount);
  const invoiceDiscountAmount = otherDeduction
    ? absOrZero(otherDeduction)
    : hasLabeledDiscount
      ? 0
      : standardDiscount;

  const freightAmount = absOrZero(freightCarting) || standardFreight;
  const transportAmount = absOrZero(transport);
  const handlingAmount = absOrZero(handling);
  const loadingUnloadingAmount = absOrZero(loadingUnloading);
  const stampDutyAmount = absOrZero(stampDuty);
  const tcsAmount = absOrZero(tcs);
  const otherAdditionsAmount = absOrZero(otherAdditions);
  const recognizedMisc = stampDutyAmount + tcsAmount + otherAdditionsAmount;
  const miscellaneousAmount = Number((recognizedMisc || standardOther).toFixed(2));

  const explicitSubtotal = Number(fieldNumber(fields.SubTotal) || 0);
  const subtotal =
    lineProductValue > 0 &&
    (
      explicitSubtotal <= 0 ||
      Math.abs(explicitSubtotal - lineProductValue) > 1
    )
      ? lineProductValue
      : explicitSubtotal > 0
        ? explicitSubtotal
        : lineProductValue || null;

  const knownAdjustment =
    freightAmount + transportAmount + handlingAmount + loadingUnloadingAmount +
    miscellaneousAmount - supplierDiscountAmount - invoiceDiscountAmount;

  const expectedBeforeRounding = Number((lineProductValue + knownAdjustment).toFixed(2));
  const explicitTotal = Number(fieldNumber(fields.InvoiceTotal) || 0);
  const spatialTotal = findPrintedTotal(
    evidence, summaryEvidence, lineProductValue, expectedBeforeRounding,
  );

  let printedInvoiceTotal = explicitTotal > 0 ? explicitTotal : spatialTotal;

  if (spatialTotal > 0) {
    const explicitLooksImplausible =
      explicitTotal <= 0 ||
      explicitTotal < Math.max(100, lineProductValue * 0.5) ||
      Math.abs(explicitTotal - expectedBeforeRounding) >
        Math.abs(spatialTotal - expectedBeforeRounding) + 0.01;
    const explicitLooksLikeSubtotal =
      explicitTotal > 0 &&
      Math.abs(explicitTotal - lineProductValue) <= 1 &&
      Math.abs(knownAdjustment) > 1;
    if (explicitLooksImplausible || explicitLooksLikeSubtotal) {
      printedInvoiceTotal = spatialTotal;
    }
  }

  let roundingAdjustment = Number(roundOff?.value || 0);
  if (!roundOff && printedInvoiceTotal && lineProductValue > 0) {
    const delta = Number((printedInvoiceTotal - expectedBeforeRounding).toFixed(2));
    if (Math.abs(delta) <= 10) roundingAdjustment = delta;
  }

  const calculatedInvoiceTotal = Number(
    (lineProductValue + knownAdjustment + roundingAdjustment).toFixed(2),
  );
  const difference =
    printedInvoiceTotal == null
      ? null
      : Number((printedInvoiceTotal - calculatedInvoiceTotal).toFixed(2));
  const reconciliationStatus =
    printedInvoiceTotal == null
      ? "NO_PRINTED_TOTAL"
      : Math.abs(difference) <= 1
        ? "MATCH"
        : "REVIEW";

  const standardTax = Number(fieldNumber(fields.TotalTax) || 0);
  const totalTax =
    standardTax > 0 && Math.abs(standardTax - tcsAmount) > 1
      ? standardTax
      : null;

  return {
    subtotal,
    totalTax,
    discountAmount: Number((supplierDiscountAmount + invoiceDiscountAmount).toFixed(2)),
    freightAmount,
    shippingAmount: 0,
    otherCharges: miscellaneousAmount,
    supplierDiscountAmount,
    invoiceDiscountAmount,
    transportAmount,
    handlingAmount,
    loadingUnloadingAmount,
    miscellaneousAmount,
    roundingAdjustment,
    amountDue: printedInvoiceTotal || null,
    total: printedInvoiceTotal || null,
    financialAdjustments: {
      lineProductValue,
      cashDiscountAmount: supplierDiscountAmount,
      otherDeductionAmount: invoiceDiscountAmount,
      freightCartingAmount: freightAmount,
      transportAmount,
      handlingAmount,
      loadingUnloadingAmount,
      stampDutyAmount,
      tcsAmount,
      otherAdditionsAmount,
      miscellaneousAmount,
      roundingAdjustment,
      printedInvoiceTotal,
      calculatedInvoiceTotal,
      difference,
      reconciliationStatus,
      evidence: summaryEvidence.filter(Boolean).map((x) => x.evidence),
    },
  };
}

function legacyTokenScore(a, b) {
  const aa = new Set(normalizeText(a).split(" ").filter((x) => x.length > 1));
  const bb = new Set(normalizeText(b).split(" ").filter((x) => x.length > 1));
  if (!aa.size || !bb.size) return 0;
  return [...aa].filter((x) => bb.has(x)).length / Math.max(aa.size, bb.size);
}

// Backward-compatible helper retained for the established V3-03 regression.
// V3-04 production normalization is performed by invoiceDocument.js.
export function enrichItemsWithTableHints(analyzeResult, items = []) {
  const hints = [];
  for (const table of analyzeResult?.analyzeResult?.tables || []) {
    const cells = table?.cells || [];
    const rows = [...new Set(cells.map((c) => Number(c.rowIndex || 0)))].sort((a,b)=>a-b);
    let header = null, descCol = null, mrpCol = null;
    for (const ri of rows.slice(0,5)) {
      for (const c of cells.filter((x)=>Number(x.rowIndex||0)===ri)) {
        const n = normalizeText(c.content);
        if (n === "name of item" || n === "item name" || n === "description" || n === "brand" || n.includes("name of item")) {
          header = ri; descCol = Number(c.columnIndex);
        }
        if (n === "mrp" || n.startsWith("mrp ")) {
          header = header ?? ri; mrpCol = Number(c.columnIndex);
        }
      }
      if (descCol != null && mrpCol != null) break;
    }
    if (header == null || descCol == null || mrpCol == null) continue;
    for (const ri of rows.filter((x)=>x>header)) {
      const d = cells.find((c)=>Number(c.rowIndex||0)===ri && Number(c.columnIndex||0)===descCol)?.content;
      const m = cells.find((c)=>Number(c.rowIndex||0)===ri && Number(c.columnIndex||0)===mrpCol)?.content;
      const mrp = parseMoneyText(m);
      if (String(d||"").trim() && Number(mrp)>0) hints.push({description:String(d).trim(),mrp:Number(mrp)});
    }
  }
  if (!hints.length) return items;
  const used = new Set();
  return (items||[]).map((item,index)=>{
    if (Number(item?.mrp||0)>0) return item;
    let bi=-1, bs=0;
    hints.forEach((h,i)=>{
      if (used.has(i)) return;
      const sc=legacyTokenScore(item?.description,h.description);
      if (sc>bs) { bs=sc; bi=i; }
    });
    if (bi<0 && hints.length===items.length && !used.has(index)) { bi=index; bs=.5; }
    if (bi<0 || bs<.35) return item;
    used.add(bi);
    return {...item,mrp:hints[bi].mrp,mrpSource:"INVOICE_TABLE_MRP"};
  });
}
