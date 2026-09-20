import { parseOcrMoneyText } from "./invoiceFinance.js";

const MONTH_PATTERN = "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC";
const LEGAL_SUFFIX = /\b(llp|ltd|limited|pvt|private|company|co\.?|enterprises?|distributors?|industries?)\b/i;

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normBatch(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/SEPT/g, "SEP")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function validIsoDate(value) {
  const text = String(value || "");
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
}

function toIsoDate(a, b, c) {
  let year;
  let month;
  let day;
  if (String(a).length === 4) {
    year = Number(a);
    month = Number(b);
    day = Number(c);
  } else {
    day = Number(a);
    month = Number(b);
    year = Number(c) < 100 ? 2000 + Number(c) : Number(c);
  }
  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return validIsoDate(iso) ? iso : null;
}

function datesInText(text) {
  const out = [];
  const seen = new Set();
  for (const match of String(text || "").matchAll(/\b(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4})\b/g)) {
    const iso = toIsoDate(match[1], match[2], match[3]);
    if (!iso || seen.has(iso)) continue;
    seen.add(iso);
    out.push({ value: iso, raw: match[0] });
  }
  return out;
}

function moneyTokens(text) {
  const tokens = String(text || "").match(/\(?-?\d[\d,.:']*\d\)?|\(?-?\d\)?/g) || [];
  return tokens
    .map((raw) => ({ raw, value: parseOcrMoneyText(raw) }))
    .filter((row) => Number.isFinite(row.value));
}

function avgConfidence(words) {
  const values = (words || [])
    .map((word) => Number(word?.confidence))
    .filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function bboxStats(box) {
  let values = [];
  if (Array.isArray(box)) {
    if (box.length && typeof box[0] === "object") {
      values = box.flatMap((point) => [Number(point?.x), Number(point?.y)]);
    } else {
      values = box.map(Number);
    }
  }
  values = values.filter(Number.isFinite);
  if (values.length < 8) {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      xCenter: 0,
      yCenter: 0,
    };
  }
  const xs = [];
  const ys = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    xs.push(values[index]);
    ys.push(values[index + 1]);
  }
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return {
    x: xMin,
    y: (yMin + yMax) / 2,
    w: xMax - xMin,
    h: yMax - yMin,
    xMin,
    xMax,
    yMin,
    yMax,
    xCenter: (xMin + xMax) / 2,
    yCenter: (yMin + yMax) / 2,
  };
}

function flattenVisionLines(payload) {
  const pages = payload?.analyzeResult?.readResults || [];
  return pages.flatMap((page, pageIndex) =>
    (page?.lines || []).map((line, lineIndex) => {
      const box = bboxStats(line?.boundingBox);
      const pageWidth = Number(page?.width || 0);
      const pageHeight = Number(page?.height || 0);
      const safeWidth = pageWidth > 0 ? pageWidth : 1;
      const safeHeight = pageHeight > 0 ? pageHeight : 1;
      return {
        id: `vision:p${pageIndex + 1}:l${lineIndex + 1}`,
        page: Number(page?.page || pageIndex + 1),
        pageWidth,
        pageHeight,
        text: String(line?.text || "").trim(),
        confidence: avgConfidence(line?.words),
        x: box.x,
        y: box.y,
        h: box.h,
        xMinNorm: box.xMin / safeWidth,
        xMaxNorm: box.xMax / safeWidth,
        yMinNorm: box.yMin / safeHeight,
        yMaxNorm: box.yMax / safeHeight,
        xCenterNorm: box.xCenter / safeWidth,
        yCenterNorm: box.yCenter / safeHeight,
      };
    }),
  ).filter((line) => line.text);
}

function distinctiveTokens(value) {
  const generic = new Set([
    "beer", "strong", "premium", "quality", "wine", "fortified", "ml", "can",
    "bottle", "case", "cases", "product", "the", "and",
  ]);
  return norm(value)
    .split(" ")
    .filter((token) => token.length >= 3)
    .filter((token) => !generic.has(token));
}

function overlapScore(a, b) {
  const aa = new Set(distinctiveTokens(a));
  const bb = new Set(distinctiveTokens(b));
  if (!aa.size || !bb.size) return 0;
  const hit = [...aa].filter((token) => bb.has(token)).length;
  return hit / Math.max(aa.size, bb.size);
}

function batchCandidates(text) {
  const regex = new RegExp(
    `\\b([A-Z0-9]{2,10})[\\s-]+(${MONTH_PATTERN})[A-Z]*[\\s\\-/.]*(20\\d{2}|\\d{2})\\b`,
    "gi",
  );
  const out = [];
  const seen = new Set();
  for (const match of String(text || "").matchAll(regex)) {
    const raw = match[0].trim();
    const key = normBatch(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out;
}

function topUnique(rows, key = "value") {
  if (!rows?.length) return null;
  const bestScore = Math.max(...rows.map((row) => Number(row.score || 0)));
  const top = rows.filter((row) => Number(row.score || 0) === bestScore);
  const distinct = [...new Set(top.map((row) => String(row?.[key] ?? "")))];
  if (distinct.length !== 1) return null;
  return top[0];
}

function invoiceNumberFromLine(text) {
  const source = String(text || "");
  if (/\btp\s*(?:no|number|#)?\b/i.test(source)) return null;
  const explicit = source.match(/\b(?:invoice|inv|bill)\s*(?:no|number|#)\s*[:.-]?\s*([A-Z0-9][A-Z0-9/-]{1,30})\b/i);
  if (explicit?.[1]) return explicit[1];
  const punctuated = source.match(/\b(?:invoice|inv|bill)\s*[:#-]\s*([A-Z0-9][A-Z0-9/-]{1,30})\b/i);
  return punctuated?.[1] || null;
}

function publicCandidate(candidate) {
  if (!candidate) return null;
  return {
    value: candidate.value,
    raw: candidate.raw,
    confidence: candidate.confidence,
    evidenceId: candidate.evidenceId,
  };
}

function polygonRegion(polygon, pageWidth, pageHeight) {
  const box = bboxStats(polygon);
  const safeWidth = Number(pageWidth || 0) > 0 ? Number(pageWidth) : 1;
  const safeHeight = Number(pageHeight || 0) > 0 ? Number(pageHeight) : 1;
  if (!(box.w > 0) || !(box.h > 0)) return null;
  return {
    xMin: box.xMin / safeWidth,
    xMax: box.xMax / safeWidth,
    yMin: box.yMin / safeHeight,
    yMax: box.yMax / safeHeight,
  };
}

function diPageDimensions(primaryAnalyzeResult) {
  const pages = primaryAnalyzeResult?.analyzeResult?.pages || [];
  return new Map(
    pages.map((page, index) => [
      Number(page?.pageNumber || index + 1),
      {
        width: Number(page?.width || 0),
        height: Number(page?.height || 0),
      },
    ]),
  );
}

function diCellRegion(cell, pages) {
  const region = cell?.boundingRegions?.[0];
  if (!region?.polygon) return null;
  const page = Number(region?.pageNumber || 1);
  const dims = pages.get(page);
  if (!dims?.width || !dims?.height) return null;
  const normalized = polygonRegion(region.polygon, dims.width, dims.height);
  return normalized ? { ...normalized, page } : null;
}

function diDocumentFieldRegion(primaryAnalyzeResult, fieldName) {
  const pages = diPageDimensions(primaryAnalyzeResult);
  const field = primaryAnalyzeResult?.analyzeResult?.documents?.[0]?.fields?.[fieldName];
  const region = field?.boundingRegions?.[0];
  if (!region?.polygon) return null;
  const page = Number(region?.pageNumber || 1);
  const dims = pages.get(page);
  if (!dims?.width || !dims?.height) return null;
  const normalized = polygonRegion(region.polygon, dims.width, dims.height);
  return normalized ? { ...normalized, page } : null;
}

function visionLinesNearRegion(lines, region) {
  if (!region) return [];
  const padX = 0.05;
  const padY = 0.025;
  return (lines || []).filter((line) =>
    Number(line.page) === Number(region.page) &&
    line.xCenterNorm >= region.xMin - padX &&
    line.xCenterNorm <= region.xMax + padX &&
    line.yCenterNorm >= region.yMin - padY &&
    line.yCenterNorm <= region.yMax + padY
  );
}

function batchHeaderCell(cells) {
  return (cells || [])
    .filter((cell) => Number(cell?.rowIndex || 0) <= 10)
    .filter((cell) => /\b(batch|lot)\b/i.test(norm(cell?.content || "")))
    .sort(
      (a, b) =>
        Number(a?.rowIndex || 0) - Number(b?.rowIndex || 0) ||
        Number(a?.columnIndex || 0) - Number(b?.columnIndex || 0),
    )[0] || null;
}

function rowText(cells, rowIndex) {
  return (cells || [])
    .filter((cell) => Number(cell?.rowIndex || 0) === Number(rowIndex))
    .sort((a, b) => Number(a?.columnIndex || 0) - Number(b?.columnIndex || 0))
    .map((cell) => String(cell?.content || "").trim())
    .filter(Boolean)
    .join(" ");
}

function numericEvidenceScore(item, text) {
  const values = moneyTokens(text).map((token) => Number(token.value));
  let bonus = 0;
  const amount = Number(item?.amount || 0);
  const rate = Number(item?.ratePerCase || item?.unitPrice || 0);
  const mrp = Number(item?.mrp || 0);
  if (amount > 0 && values.some((value) => Math.abs(value - amount) <= 1)) bonus += 0.35;
  if (rate > 0 && values.some((value) => Math.abs(value - rate) <= 0.1)) bonus += 0.2;
  if (mrp > 0 && values.some((value) => Math.abs(value - mrp) <= 0.1)) bonus += 0.1;
  return bonus;
}

function buildDiBatchRegions(primaryAnalyzeResult, invoice) {
  const ar = primaryAnalyzeResult?.analyzeResult || {};
  const pages = diPageDimensions(primaryAnalyzeResult);
  const items = Array.isArray(invoice?.items) ? invoice.items : [];
  if (!items.length || !pages.size) return {};

  let best = { quality: -1, mapping: {} };

  for (const [tableIndex, table] of (ar.tables || []).entries()) {
    const cells = Array.isArray(table?.cells) ? table.cells : [];
    const header = batchHeaderCell(cells);
    if (!header) continue;

    const headerRow = Number(header.rowIndex || 0);
    const batchColumn = Number(header.columnIndex || 0);
    const rowIndexes = [...new Set(
      cells
        .map((cell) => Number(cell?.rowIndex || 0))
        .filter((rowIndex) => rowIndex > headerRow),
    )].sort((a, b) => a - b);

    const rows = rowIndexes
      .map((rowIndex) => {
        const batchCell = cells.find(
          (cell) =>
            Number(cell?.rowIndex || 0) === rowIndex &&
            Number(cell?.columnIndex || 0) === batchColumn,
        );
        const region = diCellRegion(batchCell, pages);
        if (!region) return null;
        return {
          tableIndex,
          rowIndex,
          region,
          text: rowText(cells, rowIndex),
        };
      })
      .filter(Boolean);

    if (!rows.length) continue;

    const mapping = {};
    let scoreSum = 0;

    if (rows.length === items.length) {
      rows.forEach((row, itemIndex) => {
        mapping[itemIndex] = {
          ...row.region,
          tableIndex,
          rowIndex: row.rowIndex,
          alignment: "DI_GEOMETRY_ORDER",
        };
        scoreSum += 1;
      });
    } else {
      const candidates = [];
      items.forEach((item, itemIndex) => {
        rows.forEach((row) => {
          const description = String(item?.description || item?.productName || "");
          const score =
            overlapScore(description, row.text) +
            numericEvidenceScore(item, row.text);
          if (score >= 0.25) {
            candidates.push({ itemIndex, row, score });
          }
        });
      });

      candidates.sort(
        (a, b) =>
          b.score - a.score ||
          a.itemIndex - b.itemIndex ||
          a.row.rowIndex - b.row.rowIndex,
      );

      const usedItems = new Set();
      const usedRows = new Set();
      for (const candidate of candidates) {
        const rowKey = `${candidate.row.tableIndex}:${candidate.row.rowIndex}`;
        if (usedItems.has(candidate.itemIndex) || usedRows.has(rowKey)) continue;
        usedItems.add(candidate.itemIndex);
        usedRows.add(rowKey);
        mapping[candidate.itemIndex] = {
          ...candidate.row.region,
          tableIndex,
          rowIndex: candidate.row.rowIndex,
          alignment: "DI_GEOMETRY_MATCHED",
          matchScore: Number(candidate.score.toFixed(4)),
        };
        scoreSum += candidate.score;
      }
    }

    const assigned = Object.keys(mapping).length;
    const quality = assigned * 1000 + scoreSum - Math.abs(rows.length - items.length) * 5;
    if (quality > best.quality) best = { quality, mapping };
  }

  return best.mapping;
}

function overlapLength(a1, a2, b1, b2) {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

function visionLinesInDiRegion(lines, region) {
  const width = Math.max(0.001, region.xMax - region.xMin);
  const height = Math.max(0.001, region.yMax - region.yMin);
  const padX = Math.max(0.003, Math.min(0.02, width * 0.2));
  const padY = Math.max(0.002, Math.min(0.012, height * 0.4));

  return (lines || [])
    .filter((line) => Number(line.page) === Number(region.page))
    .filter((line) => {
      const yInside =
        line.yCenterNorm >= region.yMin - padY &&
        line.yCenterNorm <= region.yMax + padY;
      if (!yInside) return false;

      const xOverlap = overlapLength(
        line.xMinNorm,
        line.xMaxNorm,
        region.xMin - padX,
        region.xMax + padX,
      );
      const xCenterInside =
        line.xCenterNorm >= region.xMin - padX &&
        line.xCenterNorm <= region.xMax + padX;
      return xCenterInside || xOverlap > 0;
    })
    .sort((a, b) => a.xMinNorm - b.xMinNorm);
}

function averageLineConfidence(lines) {
  const values = (lines || [])
    .map((line) => Number(line?.confidence))
    .filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildVisionReadSummary(payload, invoice, primaryAnalyzeResult = null) {
  const lines = flattenVisionLines(payload);
  const evidence = [];
  const dateCandidates = [];
  const invoiceNumberCandidates = [];
  const totalCandidates = [];
  const supplierCandidates = [];
  const itemBatches = {};

  const invoiceDateRegion = primaryAnalyzeResult
    ? diDocumentFieldRegion(primaryAnalyzeResult, "InvoiceDate")
    : null;

  for (const line of visionLinesNearRegion(lines, invoiceDateRegion)) {
    for (const date of datesInText(line.text)) {
      const row = {
        value: date.value,
        raw: date.raw,
        score: 260,
        confidence: line.confidence,
        evidenceId: `${line.id}:invoice-date-anchor:${dateCandidates.length}`,
      };
      dateCandidates.push(row);
      evidence.push({
        id: row.evidenceId,
        source: "vision_date_anchor",
        label: "DI InvoiceDate geometry",
        rawValue: date.raw,
        value: date.value,
        dateValue: date.value,
        confidence: line.confidence,
        itemIndexes: [],
      });
    }
  }

  for (const line of lines) {
    const text = line.text;
    const normalized = norm(text);

    for (const date of datesInText(text)) {
      let score = 0;
      if (/\b(invoice|bill)\s*date\b/i.test(text)) score = 120;
      else if (/^\s*date\b/i.test(text)) score = 80;
      else if (/\bdate\b/i.test(text) && !/\btp\b/i.test(text)) score = 40;
      if (!score) continue;
      const row = {
        value: date.value,
        raw: date.raw,
        score,
        confidence: line.confidence,
        evidenceId: `${line.id}:date:${dateCandidates.length}`,
      };
      dateCandidates.push(row);
      evidence.push({
        id: row.evidenceId,
        source: "vision_line",
        label: text,
        rawValue: date.raw,
        value: date.value,
        dateValue: date.value,
        confidence: line.confidence,
        itemIndexes: [],
      });
    }

    const invoiceNumber = invoiceNumberFromLine(text);
    if (invoiceNumber) {
      const row = {
        value: invoiceNumber,
        raw: invoiceNumber,
        score: /\binvoice\b/i.test(text) ? 120 : 80,
        confidence: line.confidence,
        evidenceId: `${line.id}:invoice-number`,
      };
      invoiceNumberCandidates.push(row);
      evidence.push({
        id: row.evidenceId,
        source: "vision_line",
        label: text,
        rawValue: invoiceNumber,
        value: invoiceNumber,
        confidence: line.confidence,
        itemIndexes: [],
      });
    }

    const isFinalTotal = /\b(grand total|invoice total|net payable|amount due|outstanding)\b/i.test(text);
    const isBareTotal = /^\s*total\b/i.test(text) && !/\b(sub\s*total|subtotal|gross|assessable)\b/i.test(text);
    if (isFinalTotal || isBareTotal) {
      const tokens = moneyTokens(text);
      const money = tokens[tokens.length - 1];
      if (money && Number(money.value) > 0) {
        const row = {
          value: Math.abs(Number(money.value)),
          raw: money.raw,
          score: isFinalTotal ? 150 : 90,
          confidence: line.confidence,
          evidenceId: `${line.id}:total`,
        };
        totalCandidates.push(row);
        evidence.push({
          id: row.evidenceId,
          source: "vision_line",
          label: text,
          rawValue: money.raw,
          value: row.value,
          moneyValue: row.value,
          confidence: line.confidence,
          itemIndexes: [],
        });
      }
    }

    if (LEGAL_SUFFIX.test(text) && /[a-z]/i.test(text) && normalized.length >= 5) {
      const row = {
        value: text,
        raw: text,
        score: /\b(llp|pvt|private|ltd|limited)\b/i.test(text) ? 100 : 60,
        confidence: line.confidence,
        evidenceId: `${line.id}:supplier`,
      };
      supplierCandidates.push(row);
      evidence.push({
        id: row.evidenceId,
        source: "vision_line",
        label: "Supplier candidate",
        rawValue: text,
        value: text,
        confidence: line.confidence,
        itemIndexes: [],
      });
    }
  }

  const diBatchRegions = primaryAnalyzeResult
    ? buildDiBatchRegions(primaryAnalyzeResult, invoice)
    : {};

  for (const [itemIndex, item] of (invoice?.items || []).entries()) {
    const geometryRegion = diBatchRegions[itemIndex] || null;

    if (primaryAnalyzeResult) {
      if (!geometryRegion) continue;
      const regionLines = visionLinesInDiRegion(lines, geometryRegion);
      const regionText = regionLines.map((line) => line.text).join(" ");
      const candidates = batchCandidates(regionText);
      if (!candidates.length) continue;

      const confidence = averageLineConfidence(regionLines);
      itemBatches[itemIndex] = candidates.map((value, batchIndex) => {
        const evidenceId = `vision:item:${itemIndex}:batch:${batchIndex}`;
        evidence.push({
          id: evidenceId,
          source: "vision_batch",
          label: "Batch",
          rawValue: value,
          value,
          confidence,
          itemIndexes: [itemIndex],
        });
        return {
          value,
          raw: value,
          score: 100,
          confidence,
          evidenceId,
          alignment: geometryRegion.alignment,
        };
      });
      continue;
    }

    // Legacy/offline fallback only. Production passes the raw DI result and
    // therefore uses DI row + Batch-cell geometry instead of same-Y guessing.
    const description = String(item?.description || item?.productName || "").trim();
    if (!description) continue;

    const scored = lines
      .map((line) => ({ line, score: overlapScore(description, line.text) }))
      .filter((row) => row.score >= 0.25)
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best) continue;

    const tolerance = Math.max(8, Number(best.line.h || 0) * 1.75);
    const nearbyText = lines
      .filter((line) => line.page === best.line.page && Math.abs(line.y - best.line.y) <= tolerance)
      .sort((a, b) => a.x - b.x)
      .map((line) => line.text)
      .join(" ");

    const candidates = batchCandidates(nearbyText);
    if (!candidates.length) continue;

    itemBatches[itemIndex] = candidates.map((value, batchIndex) => {
      const evidenceId = `vision:item:${itemIndex}:batch:${batchIndex}`;
      evidence.push({
        id: evidenceId,
        source: "vision_batch",
        label: "Batch",
        rawValue: value,
        value,
        confidence: best.line.confidence,
        itemIndexes: [itemIndex],
      });
      return {
        value,
        raw: value,
        score: Math.round(best.score * 100),
        confidence: best.line.confidence,
        evidenceId,
        alignment: "LEGACY_DESCRIPTION_FALLBACK",
      };
    });
  }

  const chosenDate = topUnique(dateCandidates);
  const chosenInvoiceNumber = topUnique(invoiceNumberCandidates);
  const chosenTotal = topUnique(totalCandidates);
  const chosenSupplier = topUnique(supplierCandidates);

  return {
    provider: "AZURE_VISION_READ_3_2",
    status: "SUCCEEDED",
    lineCount: lines.length,
    textLines: lines.slice(0, 180).map((line) => ({
      page: Number(line.page || 1),
      text: String(line.text || "").slice(0, 220),
      confidence: Number.isFinite(Number(line.confidence)) ? Number(line.confidence) : null,
    })),
    evidence: evidence.slice(0, 160),
    dateCandidates,
    invoiceNumberCandidates,
    totalCandidates,
    supplierCandidates,
    itemBatches,
    batchAlignment: {
      mode: primaryAnalyzeResult ? "DI_GEOMETRY" : "LEGACY_DESCRIPTION_FALLBACK",
      geometryRegionCount: Object.keys(diBatchRegions).length,
      candidateItemCount: Object.keys(itemBatches).length,
    },
    chosen: {
      invoiceDate: publicCandidate(chosenDate),
      invoiceNumber: publicCandidate(chosenInvoiceNumber),
      invoiceTotal: publicCandidate(chosenTotal),
      supplierName: publicCandidate(chosenSupplier),
    },
  };
}

function comparableSupplier(value) {
  return norm(value).replace(/\b(private|pvt|limited|ltd|llp|company|co)\b/g, " ").replace(/\s+/g, " ").trim();
}

function publicSecondary(summary) {
  return {
    provider: summary?.provider || "AZURE_VISION_READ_3_2",
    status: summary?.status || "UNAVAILABLE",
    lineCount: Number(summary?.lineCount || 0),
    chosen: summary?.chosen || {},
    dateCandidates: (summary?.dateCandidates || []).slice(0, 6).map(publicCandidate).filter(Boolean),
    batchAlignment: summary?.batchAlignment || {
      mode: "UNAVAILABLE",
      geometryRegionCount: 0,
      candidateItemCount: 0,
    },
    itemBatchCandidates: Object.fromEntries(
      Object.entries(summary?.itemBatches || {}).map(([index, rows]) => [
        index,
        (rows || []).map(publicCandidate).filter(Boolean),
      ]),
    ),
  };
}

export function applySecondaryOcrConsensus(invoice, summary) {
  const out = structuredClone(invoice || {});
  out.secondaryOcr = publicSecondary(summary || {});

  const agreements = [];
  const reviewTargets = [];

  if (summary?.status !== "SUCCEEDED") {
    out.crossOcr = {
      status: "SECONDARY_UNAVAILABLE",
      provider: summary?.provider || "AZURE_VISION_READ_3_2",
      agreements,
      reviewTargets,
      requiresHumanConfirmation: false,
    };
    return out;
  }

  const chosenDate = summary?.chosen?.invoiceDate;
  if (chosenDate?.value) {
    if (validIsoDate(out.invoiceDate) && out.invoiceDate === chosenDate.value) {
      agreements.push({ targetId: "header:invoice_date", value: chosenDate.value });
    } else if (validIsoDate(out.invoiceDate) && out.invoiceDate !== chosenDate.value) {
      out.invoiceDateReviewRequired = true;
      reviewTargets.push({
        targetId: "header:invoice_date",
        fieldScope: "HEADER",
        canonicalField: "invoice_date",
        reason: "CROSS_OCR_DATE_CONFLICT",
        primaryValue: out.invoiceDate,
        secondaryValue: chosenDate.value,
        secondaryEvidenceId: chosenDate.evidenceId,
        requiresHumanConfirmation: true,
      });
    } else {
      out.invoiceDateReviewRequired = true;
      reviewTargets.push({
        targetId: "header:invoice_date",
        fieldScope: "HEADER",
        canonicalField: "invoice_date",
        reason: "SECONDARY_DATE_CANDIDATE",
        primaryValue: out.invoiceDate || null,
        secondaryValue: chosenDate.value,
        secondaryEvidenceId: chosenDate.evidenceId,
        requiresHumanConfirmation: true,
      });
    }
  }

  const chosenInvoiceNumber = summary?.chosen?.invoiceNumber;
  if (chosenInvoiceNumber?.value && String(out.invoiceNumber || "").trim()) {
    if (norm(chosenInvoiceNumber.value) === norm(out.invoiceNumber)) {
      agreements.push({ targetId: "header:invoice_number", value: out.invoiceNumber });
    } else {
      reviewTargets.push({
        targetId: "header:invoice_number",
        fieldScope: "HEADER",
        canonicalField: "invoice_number",
        reason: "CROSS_OCR_INVOICE_NUMBER_CONFLICT",
        primaryValue: out.invoiceNumber,
        secondaryValue: chosenInvoiceNumber.value,
        secondaryEvidenceId: chosenInvoiceNumber.evidenceId,
        requiresHumanConfirmation: true,
      });
    }
  }

  const chosenSupplier = summary?.chosen?.supplierName;
  const primarySupplier = String(out.vendorName || out.supplierName || "").trim();
  if (chosenSupplier?.value && primarySupplier) {
    const a = comparableSupplier(chosenSupplier.value);
    const b = comparableSupplier(primarySupplier);
    if (a && b && (a === b || a.includes(b) || b.includes(a))) {
      agreements.push({ targetId: "header:supplier_name", value: primarySupplier });
    } else if (a && b) {
      reviewTargets.push({
        targetId: "header:supplier_name",
        fieldScope: "HEADER",
        canonicalField: "supplier_name",
        reason: "CROSS_OCR_SUPPLIER_CONFLICT",
        primaryValue: primarySupplier,
        secondaryValue: chosenSupplier.value,
        secondaryEvidenceId: chosenSupplier.evidenceId,
        requiresHumanConfirmation: true,
      });
    }
  }

  const finance = out.financialAdjustments || {};
  const primaryPrinted = out.total != null
    ? Number(out.total)
    : finance.printedInvoiceTotal != null
      ? Number(finance.printedInvoiceTotal)
      : null;
  const calculated = Number(finance.calculatedInvoiceTotal || 0) || null;
  const chosenTotal = summary?.chosen?.invoiceTotal;
  if (chosenTotal?.value > 0) {
    if (Number.isFinite(primaryPrinted) && Math.abs(primaryPrinted - chosenTotal.value) <= 1) {
      agreements.push({ targetId: "finance:invoice_total", value: chosenTotal.value });
    } else if (Number.isFinite(primaryPrinted)) {
      reviewTargets.push({
        targetId: "finance:invoice_total",
        fieldScope: "FINANCE",
        canonicalField: "invoice_total",
        reason: "CROSS_OCR_TOTAL_CONFLICT",
        primaryValue: primaryPrinted,
        secondaryValue: chosenTotal.value,
        secondaryEvidenceId: chosenTotal.evidenceId,
        arithmeticValue: calculated,
        requiresHumanConfirmation: true,
      });
    } else {
      reviewTargets.push({
        targetId: "finance:invoice_total",
        fieldScope: "FINANCE",
        canonicalField: "invoice_total",
        reason: calculated != null && Math.abs(calculated - chosenTotal.value) <= 1
          ? "SECONDARY_TOTAL_SUPPORTED_BY_ARITHMETIC"
          : "SECONDARY_TOTAL_CANDIDATE",
        primaryValue: null,
        secondaryValue: chosenTotal.value,
        secondaryEvidenceId: chosenTotal.evidenceId,
        arithmeticValue: calculated,
        requiresHumanConfirmation: true,
      });
    }
  }

  for (const [indexText, candidates] of Object.entries(summary?.itemBatches || {})) {
    const index = Number(indexText);
    const item = out.items?.[index];
    if (!item || !Array.isArray(candidates) || !candidates.length) continue;
    const distinct = [...new Map(candidates.map((row) => [normBatch(row.value), row])).values()];
    if (distinct.length !== 1) continue;
    const candidate = distinct[0];
    const current = String(item.batchNumber || "").trim();
    if (current && normBatch(current) === normBatch(candidate.value)) {
      item.batchReviewRequired = false;
      agreements.push({ targetId: `item:${index}:batch_number`, value: current });
    } else if (current) {
      item.batchReviewRequired = true;
      reviewTargets.push({
        targetId: `item:${index}:batch_number`,
        fieldScope: "LINE_ITEM",
        canonicalField: "batch_number",
        reason: "CROSS_OCR_BATCH_CONFLICT",
        primaryValue: current,
        secondaryValue: candidate.value,
        secondaryEvidenceId: candidate.evidenceId,
        requiresHumanConfirmation: true,
      });
    } else {
      item.batchReviewRequired = true;
      reviewTargets.push({
        targetId: `item:${index}:batch_number`,
        fieldScope: "LINE_ITEM",
        canonicalField: "batch_number",
        reason: "SECONDARY_BATCH_CANDIDATE",
        primaryValue: null,
        secondaryValue: candidate.value,
        secondaryEvidenceId: candidate.evidenceId,
        requiresHumanConfirmation: true,
      });
    }
  }

  out.crossOcr = {
    status: reviewTargets.length ? "REVIEW" : "AGREE_OR_NO_COMPARABLE_SIGNAL",
    provider: summary.provider,
    agreements,
    reviewTargets,
    requiresHumanConfirmation: reviewTargets.length > 0,
  };

  return out;
}
