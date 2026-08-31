function fieldNumber(field) {
  const value = field?.valueNumber ?? field?.valueCurrency?.amount ?? field?.content;
  const cleaned = String(value ?? "").replace(/,/g, "").replace(/[^0-9().-]/g, "");
  if (!cleaned) return null;
  const negative = /^\s*-/.test(cleaned) || /^\(.*\)$/.test(cleaned) || /\(-\)/.test(String(value ?? ""));
  const n = Number(cleaned.replace(/[()-]/g, ""));
  return Number.isFinite(n) ? (negative ? -Math.abs(n) : n) : null;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function parseMoneyText(value) {
  const text = String(value || "");
  const tokens = text.match(/\d[\d,]*(?:\.\d{1,2})?/g);
  if (!tokens?.length) return null;
  const raw = tokens[tokens.length - 1];
  const n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const negative = /\(-\)/.test(text) || /(^|[\s(])-+\s*\d/.test(text) || /\(\s*\d[\d,]*(?:\.\d+)?\s*\)/.test(text);
  return negative ? -Math.abs(n) : n;
}

function bounds(line) {
  const polygon = line?.polygon || [];
  let points = [];
  if (polygon.length && typeof polygon[0] === "number") {
    for (let i = 0; i + 1 < polygon.length; i += 2) points.push([Number(polygon[i]), Number(polygon[i + 1])]);
  } else {
    points = polygon.map((p) => [Number(p?.x), Number(p?.y)]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  }
  if (!points.length) return null;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  return {
    left, right, top, bottom,
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: Math.max(0.0001, right - left),
    height: Math.max(0.0001, bottom - top),
  };
}

function flattenLines(analyzeResult) {
  const rows = [];
  for (const [pageIndex, page] of (analyzeResult?.analyzeResult?.pages || []).entries()) {
    const pageWidth = Number(page?.width || 1);
    const pageHeight = Number(page?.height || 1);
    for (const line of page?.lines || []) {
      const b = bounds(line);
      if (!b) continue;
      rows.push({
        pageIndex,
        pageWidth,
        pageHeight,
        text: String(line?.content || ""),
        norm: normalizeText(line?.content || ""),
        ...b,
      });
    }
  }
  return rows;
}

function findLabeledAmount(lines, aliases) {
  const normalizedAliases = aliases.map(normalizeText);
  for (const label of lines) {
    if (!normalizedAliases.some((alias) => label.norm === alias || label.norm.includes(alias))) continue;

    const inline = parseMoneyText(label.text);
    if (inline != null && /\d/.test(label.text.replace(new RegExp(aliases[0], "i"), ""))) {
      return { value: inline, label: label.text, evidence: label.text, pageIndex: label.pageIndex, y: label.y };
    }

    const tolerance = Math.max(label.pageHeight * 0.012, label.height * 1.6);
    const candidates = lines
      .filter((row) =>
        row.pageIndex === label.pageIndex &&
        row.left > label.right + label.pageWidth * 0.03 &&
        Math.abs(row.y - label.y) <= tolerance &&
        parseMoneyText(row.text) != null
      )
      .sort((a, b) => b.right - a.right);

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

function findPrintedTotal(lines, summaryEvidence, baseValue) {
  const evidence = summaryEvidence.filter(Boolean);
  if (!evidence.length) return null;
  const pageIndex = Math.max(...evidence.map((x) => x.pageIndex));
  const startY = Math.min(...evidence.filter((x) => x.pageIndex === pageIndex).map((x) => x.y));
  const threshold = Math.max(100, Number(baseValue || 0) * 0.5);

  const candidates = lines
    .map((row) => ({ ...row, money: parseMoneyText(row.text) }))
    .filter((row) =>
      row.pageIndex === pageIndex &&
      row.y >= startY &&
      row.x >= row.pageWidth * 0.60 &&
      Number.isFinite(row.money) &&
      row.money > threshold
    )
    .sort((a, b) => b.y - a.y || b.right - a.right);

  return candidates[0]?.money ?? null;
}

const absOrZero = (entry) => Math.abs(Number(entry?.value || 0));

export function extractInvoiceFinancials(analyzeResult, fields = {}, items = []) {
  const lines = flattenLines(analyzeResult);
  const lineProductValue = Number(
    (items || []).reduce((sum, item) => sum + Math.max(0, Number(item?.amount || 0)), 0).toFixed(2),
  );

  const cashDiscount = findLabeledAmount(lines, ["cash discount", "cash disc"]);
  const otherDeduction = findLabeledAmount(lines, ["other deduction", "other ded"]);
  const freightCarting = findLabeledAmount(lines, ["freight carting", "freight/carting"]);
  const transport = findLabeledAmount(lines, ["transport"]);
  const handling = findLabeledAmount(lines, ["handling"]);
  const loadingUnloading = findLabeledAmount(lines, ["loading unloading", "loading/unloading"]);
  const stampDuty = findLabeledAmount(lines, ["stamp duty"]);
  const tcs = findLabeledAmount(lines, ["tcs"]);
  const otherAdditions = findLabeledAmount(lines, ["other additions"]);
  const roundOff = findLabeledAmount(lines, ["round off", "rounding adjustment"]);

  const evidence = [
    cashDiscount, otherDeduction, freightCarting, transport, handling,
    loadingUnloading, stampDuty, tcs, otherAdditions, roundOff,
  ];

  const standardDiscount = Math.max(0, Math.abs(Number(fieldNumber(fields.Discount) ?? fieldNumber(fields.TotalDiscount) ?? 0)));
  const standardFreight = Math.max(0, Math.abs(Number(fieldNumber(fields.Freight) ?? fieldNumber(fields.ShippingCost) ?? fieldNumber(fields.Shipping) ?? 0)));
  const standardOther = Math.max(0, Math.abs(Number(fieldNumber(fields.OtherCharges) ?? 0)));

  const supplierDiscountAmount = absOrZero(cashDiscount);
  let invoiceDiscountAmount = absOrZero(otherDeduction);
  if (!supplierDiscountAmount && !invoiceDiscountAmount) {
    invoiceDiscountAmount = standardDiscount;
  } else if (standardDiscount > supplierDiscountAmount + invoiceDiscountAmount) {
    invoiceDiscountAmount += Number((standardDiscount - supplierDiscountAmount - invoiceDiscountAmount).toFixed(2));
  }

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
  const subtotal = explicitSubtotal > 0 ? explicitSubtotal : (lineProductValue > 0 ? lineProductValue : null);

  const explicitTotal = Number(fieldNumber(fields.InvoiceTotal) || 0);
  let printedInvoiceTotal = explicitTotal > 0 ? explicitTotal : findPrintedTotal(lines, evidence, lineProductValue);

  const knownAdjustment =
    freightAmount + transportAmount + handlingAmount + loadingUnloadingAmount +
    miscellaneousAmount - supplierDiscountAmount - invoiceDiscountAmount;

  let roundingAdjustment = Number(roundOff?.value || 0);
  if (!roundOff && printedInvoiceTotal && lineProductValue > 0) {
    const delta = Number((printedInvoiceTotal - (lineProductValue + knownAdjustment)).toFixed(2));
    if (Math.abs(delta) <= 10) roundingAdjustment = delta;
  }

  const calculatedInvoiceTotal = Number(
    (lineProductValue + knownAdjustment + roundingAdjustment).toFixed(2),
  );

  if (!printedInvoiceTotal && calculatedInvoiceTotal > 0) {
    printedInvoiceTotal = null;
  }

  const difference = printedInvoiceTotal == null
    ? null
    : Number((printedInvoiceTotal - calculatedInvoiceTotal).toFixed(2));

  const reconciliationStatus = printedInvoiceTotal == null
    ? "NO_PRINTED_TOTAL"
    : Math.abs(difference) <= 1
      ? "MATCH"
      : "REVIEW";

  const standardTax = Number(fieldNumber(fields.TotalTax) || 0);
  const standardAmountDue = Number(fieldNumber(fields.AmountDue) || 0);

  return {
    subtotal,
    totalTax: standardTax || null,
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
    amountDue: standardAmountDue > 0 ? standardAmountDue : (printedInvoiceTotal || null),
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
      evidence: evidence.filter(Boolean).map((x) => x.evidence),
    },
  };
}
