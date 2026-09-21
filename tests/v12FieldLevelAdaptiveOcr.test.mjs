import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  analyzeAdaptiveRescueGroup,
  buildAdaptiveOcrPlan,
  mergeAdaptiveRescueResults,
} from "../supabase/functions/_shared/invoiceAdaptiveOcr.js";

function bound(x1, y1, x2, y2, pageNumber = 1) {
  return [{
    pageNumber,
    polygon: [
      { x: x1, y: y1 }, { x: x2, y: y1 },
      { x: x2, y: y2 }, { x: x1, y: y2 },
    ],
  }];
}

function primaryResult() {
  return {
    analyzeResult: {
      pages: [{ pageNumber: 1, width: 1000, height: 1000 }],
      documents: [{
        fields: {
          VendorName: { boundingRegions: bound(30, 40, 380, 80) },
          InvoiceId: { boundingRegions: bound(620, 40, 790, 75) },
          InvoiceDate: { boundingRegions: bound(620, 85, 900, 120) },
          InvoiceTotal: { boundingRegions: bound(700, 820, 930, 860) },
          AmountDue: { boundingRegions: bound(700, 865, 930, 905) },
        },
      }],
      tables: [{
        cells: [
          { rowIndex: 0, columnIndex: 0, content: "Description", boundingRegions: bound(30, 300, 350, 340) },
          { rowIndex: 0, columnIndex: 1, content: "Packing", boundingRegions: bound(350, 300, 470, 340) },
          { rowIndex: 0, columnIndex: 2, content: "Batch", boundingRegions: bound(470, 300, 600, 340) },
          { rowIndex: 0, columnIndex: 3, content: "Cases", boundingRegions: bound(600, 300, 680, 340) },
          { rowIndex: 0, columnIndex: 4, content: "Rate", boundingRegions: bound(680, 300, 790, 340) },
          { rowIndex: 0, columnIndex: 5, content: "Amount", boundingRegions: bound(790, 300, 940, 340) },
          { rowIndex: 1, columnIndex: 0, content: "KINGFISHER STRONG", boundingRegions: bound(30, 350, 350, 390) },
          { rowIndex: 1, columnIndex: 1, content: "650 ML", boundingRegions: bound(350, 350, 470, 390) },
          { rowIndex: 1, columnIndex: 2, content: "AB12 SEP-2026", boundingRegions: bound(470, 350, 600, 390) },
          { rowIndex: 1, columnIndex: 3, content: "10", boundingRegions: bound(600, 350, 680, 390) },
          { rowIndex: 1, columnIndex: 4, content: "1080", boundingRegions: bound(680, 350, 790, 390) },
          { rowIndex: 1, columnIndex: 5, content: "10800", boundingRegions: bound(790, 350, 940, 390) },
        ],
      }],
    },
  };
}

function invoice() {
  return {
    supplierName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    vendorName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    supplierReviewRequired: true,
    invoiceNumber: "19185",
    invoiceDate: "2021-07-19",
    invoiceDateReviewRequired: true,
    total: 70185,
    amountDue: 70185,
    items: [{
      description: "KINGFISHER STRONG",
      packing: "650 ML",
      mrp: 180,
      batchNumber: "GAJI SEP-2001",
      batchReviewRequired: true,
      caseCount: 10,
      ratePerCase: 1080,
      amount: 10800,
      confidence: 0.93,
    }],
    financialAdjustments: {
      reconciliationStatus: "MATCH",
      grossReconciliationStatus: "MATCH",
      printedInvoiceTotal: 70185,
      calculatedInvoiceTotal: 70185,
    },
    crossOcr: {
      reviewTargets: [
        { targetId: "header:supplier_name" },
        { targetId: "header:invoice_date" },
        { targetId: "item:0:batch_number" },
      ],
    },
  };
}

function secondary() {
  return {
    chosen: {
      supplierName: { value: "KAPIL ALCOTECH LLP" },
      invoiceDate: { value: "2020-04-19" },
      invoiceNumber: null,
      invoiceTotal: { value: 70185 },
    },
    itemBatches: { 0: [{ value: "AB12 SEP-2026" }] },
  };
}

test("field-level quality engine checks every ShopAI matrix field but rescues only uncertain fields", () => {
  const current = invoice();
  const plan = buildAdaptiveOcrPlan({
    primaryResult: primaryResult(),
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });

  assert.equal(plan.mode, "FIELD_LEVEL_ADAPTIVE_OCR_V1");
  assert.ok(plan.fieldCheckCount > 10);
  assert.ok(plan.passCount > 0);
  assert.ok(plan.rescueFieldCount >= 2);
  assert.ok(plan.rescueGroupCount >= 2);
  assert.ok(plan.rescueGroupCount <= 3);
  assert.equal(plan.maxRescueGroups, 3);
  assert.equal(plan.highResolutionPolicy, "ONLY_AFTER_DERIVATIVE_VISION_REMAINS_UNCERTAIN");
  assert.equal(plan.derivativePolicy, "BROWSER_MEMORY_ONLY_NOT_STORED");

  const supplier = plan.fieldChecks.find((row) => row.fieldId === "header:supplier_name");
  const date = plan.fieldChecks.find((row) => row.fieldId === "header:invoice_date");
  const batch = plan.fieldChecks.find((row) => row.fieldId === "item:0:batch_number");
  const amount = plan.fieldChecks.find((row) => row.fieldId === "item:0:amount");
  assert.equal(supplier.status, "RESCUE");
  assert.ok(supplier.reasons.includes("SUPPLIER_MATCHES_RECEIVING_SHOP"));
  assert.equal(date.status, "RESCUE");
  assert.equal(batch.status, "RESCUE");
  assert.equal(amount.status, "PASS");
});

function visionPayload(lines) {
  return {
    analyzeResult: {
      readResults: [{
        page: 1,
        width: 1000,
        height: 1000,
        lines: lines.map((row, index) => ({
          text: row.text,
          boundingBox: row.box || [20, 20 + index * 50, 950, 20 + index * 50, 950, 55 + index * 50, 20, 55 + index * 50],
          words: [{ confidence: row.confidence ?? 0.96 }],
        })),
      }],
    },
  };
}

test("adaptive header rescue rejects TP date and receiver, then finds invoice date and legal vendor", () => {
  const group = {
    groupId: "adaptive:1:header",
    receivingShopName: "Royal 21",
    fields: [
      { fieldId: "header:supplier_name", label: "Supplier", scope: "HEADER", kind: "TEXT" },
      { fieldId: "header:invoice_date", label: "Invoice date", scope: "HEADER", kind: "DATE" },
      { fieldId: "header:invoice_number", label: "Invoice number", scope: "HEADER", kind: "TEXT" },
    ],
  };
  const payload = visionPayload([
    { text: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI" },
    { text: "KAPIL ALCOTECH LLP" },
    { text: "TP Date 19-04-2020" },
    { text: "Invoice Date 19-09-2026" },
    { text: "Invoice No 19185" },
  ]);
  const result = analyzeAdaptiveRescueGroup({ payload, group, source: "VISION_DERIVATIVE" });
  const byId = new Map(result.fieldResults.map((row) => [row.fieldId, row]));
  assert.equal(byId.get("header:supplier_name").suggestedValue, "KAPIL ALCOTECH LLP");
  assert.equal(byId.get("header:invoice_date").suggestedValue, "2026-09-19");
  assert.equal(byId.get("header:invoice_number").suggestedValue, "19185");
  assert.equal(result.unresolvedFieldIds.length, 0);
});

test("split Invoice + Date label is spatially owned while standalone TP date is rejected", () => {
  const group = {
    groupId: "adaptive:split-date",
    receivingShopName: "Royal 21",
    fields: [
      { fieldId: "header:invoice_date", label: "Invoice date", scope: "HEADER", kind: "DATE" },
    ],
  };
  const payload = visionPayload([
    { text: "TP Date", box: [20, 40, 250, 40, 250, 75, 20, 75] },
    { text: "19-04-2020", box: [260, 40, 430, 40, 430, 75, 260, 75] },
    { text: "Invoice", box: [560, 130, 700, 130, 700, 165, 560, 165] },
    { text: "Date 19-09-2026", box: [560, 175, 860, 175, 860, 210, 560, 210] },
  ]);
  const result = analyzeAdaptiveRescueGroup({ payload, group, source: "VISION_DERIVATIVE" });
  assert.equal(result.fieldResults[0].suggestedValue, "2026-09-19");
});

test("generic Date without invoice ownership remains unresolved", () => {
  const group = {
    groupId: "adaptive:generic-date",
    receivingShopName: "Royal 21",
    fields: [
      { fieldId: "header:invoice_date", label: "Invoice date", scope: "HEADER", kind: "DATE" },
    ],
  };
  const result = analyzeAdaptiveRescueGroup({
    payload: visionPayload([{ text: "Date 19-09-2026" }]),
    group,
    source: "VISION_DERIVATIVE",
  });
  assert.equal(result.fieldResults[0].suggestedValue, "");
  assert.deepEqual(result.unresolvedFieldIds, ["header:invoice_date"]);
});

test("line-item rescue never borrows a value from a neighbouring row", () => {
  const group = {
    groupId: "adaptive:row-isolation",
    receivingShopName: "Royal 21",
    fields: [{
      fieldId: "item:0:batch_number",
      label: "Line 1 · Batch / lot",
      scope: "LINE_ITEM",
      kind: "TEXT",
      relativeRegion: { xMin: 0.40, xMax: 0.62, yMin: 0.05, yMax: 0.22 },
    }],
  };
  const payload = visionPayload([
    { text: "KINGFISHER STRONG", box: [20, 80, 350, 80, 350, 115, 20, 115] },
    { text: "AB12 SEP-2026", box: [470, 620, 650, 620, 650, 655, 470, 655] },
  ]);
  const result = analyzeAdaptiveRescueGroup({ payload, group, source: "VISION_DERIVATIVE" });
  assert.equal(result.fieldResults[0].suggestedValue, "");
  assert.deepEqual(result.unresolvedFieldIds, ["item:0:batch_number"]);
});

test("multiple unrelated legal entities do not produce a guessed supplier", () => {
  const group = {
    groupId: "adaptive:supplier-ambiguity",
    receivingShopName: "Royal 21",
    fields: [{ fieldId: "header:supplier_name", label: "Supplier", scope: "HEADER", kind: "TEXT" }],
  };
  const payload = visionPayload([
    { text: "KAPIL ALCOTECH LLP" },
    { text: "FAST TRANSPORT PRIVATE LIMITED" },
  ]);
  const result = analyzeAdaptiveRescueGroup({ payload, group, source: "VISION_DERIVATIVE" });
  assert.equal(result.fieldResults[0].suggestedValue, "");
  assert.deepEqual(result.unresolvedFieldIds, ["header:supplier_name"]);
});

test("quality engine uses line arithmetic only as a rescue trigger and does not rewrite core values", () => {
  const current = invoice();
  current.items[0].amount = 9999;
  const plan = buildAdaptiveOcrPlan({
    primaryResult: primaryResult(),
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });
  const amount = plan.fieldChecks.find((row) => row.fieldId === "item:0:amount");
  assert.equal(amount.currentValue, "9999");
  assert.equal(amount.status, "RESCUE");
  assert.ok(amount.reasons.includes("LINE_AMOUNT_ARITHMETIC_MISMATCH"));
});

test("rescue groups never merge fields across pages", () => {
  const current = invoice();
  current.items.push({
    description: "SECOND PRODUCT",
    packing: "750 ML",
    mrp: 220,
    batchNumber: "SECOND SEP-2026",
    batchReviewRequired: true,
    caseCount: 2,
    ratePerCase: 1200,
    amount: 2400,
    confidence: 0.93,
  });
  const primary = primaryResult();
  primary.analyzeResult.pages.push({ pageNumber: 2, width: 1000, height: 1000 });
  primary.analyzeResult.tables[0].cells.push(
    { rowIndex: 2, columnIndex: 0, content: "SECOND PRODUCT", boundingRegions: bound(30, 350, 350, 390, 2) },
    { rowIndex: 2, columnIndex: 1, content: "750 ML", boundingRegions: bound(350, 350, 470, 390, 2) },
    { rowIndex: 2, columnIndex: 2, content: "SECOND SEP-2026", boundingRegions: bound(470, 350, 600, 390, 2) },
    { rowIndex: 2, columnIndex: 3, content: "2", boundingRegions: bound(600, 350, 680, 390, 2) },
    { rowIndex: 2, columnIndex: 4, content: "1200", boundingRegions: bound(680, 350, 790, 390, 2) },
    { rowIndex: 2, columnIndex: 5, content: "2400", boundingRegions: bound(790, 350, 940, 390, 2) },
  );
  const secondaryOcr = secondary();
  secondaryOcr.itemBatches[1] = [{ value: "OTHER SEP-2026" }];
  const plan = buildAdaptiveOcrPlan({
    primaryResult: primary,
    primaryInvoice: current,
    secondaryOcr,
    invoice: current,
    receivingShopName: "Royal 21",
  });
  for (const group of plan.rescueGroups) {
    const pages = new Set((group.fields || []).map((field) => Number(field.region?.page || group.page || 1)));
    assert.equal(pages.size, 1);
  }
});

test("high-resolution disagreement never becomes a silent suggestion", () => {
  const merged = mergeAdaptiveRescueResults(
    [{ fieldResults: [{ fieldId: "header:invoice_date", label: "Invoice date", scope: "HEADER", source: "VISION_DERIVATIVE", suggestedValue: "2026-09-19", confidence: "MEDIUM", requiresHumanConfirmation: true }] }],
    [{ fieldResults: [{ fieldId: "header:invoice_date", label: "Invoice date", scope: "HEADER", source: "HIGH_RES_LAYOUT_DERIVATIVE", suggestedValue: "2020-10-19", confidence: "MEDIUM", requiresHumanConfirmation: true }] }],
  );
  assert.equal(merged.suggestions.length, 0);
  assert.equal(merged.conflicts.length, 1);
  assert.equal(merged.conflicts[0].suggestedValue, "");
  assert.equal(merged.derivativeStored, false);
});

test("source architecture uses standard prebuilt-invoice first and prebuilt-layout high-res only in rescue", () => {
  const edge = fs.readFileSync(new URL("../supabase/functions/ocr-invoice/index.ts", import.meta.url), "utf8");
  const ui = fs.readFileSync(new URL("../src/pages/AutomationHub.jsx", import.meta.url), "utf8");
  const derivative = fs.readFileSync(new URL("../src/lib/ocrDerivative.js", import.meta.url), "utf8");

  assert.match(edge, /modelId: "prebuilt-invoice"[\s\S]*features: \["keyValuePairs"\]/);
  assert.match(edge, /mode === "adaptive_rescue"/);
  assert.match(edge, /modelId: "prebuilt-layout"/);
  assert.match(edge, /features: \["ocrHighResolution"\]/);
  assert.match(edge, /HIGH_RES_LAYOUT_DERIVATIVE/);
  assert.doesNotMatch(edge, /@imagemagick\/magick-wasm/);

  assert.match(ui, /createAdaptiveOcrDerivatives/);
  assert.match(ui, /mode: "adaptive_rescue"/);
  assert.match(ui, /HUMAN_CONFIRMED_ADAPTIVE_OCR/);
  assert.doesNotMatch(ui, /Adaptive OCR Field Check/);
  assert.doesNotMatch(ui, /Suggestions never overwrite invoice values automatically/);
  assert.match(ui, /source: "ADAPTIVE_OCR"/);

  assert.match(derivative, /document\.createElement\("canvas"\)/);
  assert.match(derivative, /RAW_COLOR_ROI_V1/);
  assert.match(derivative, /image\/png/);
  assert.match(derivative, /imageSmoothingEnabled = false/);
  assert.doesNotMatch(derivative, /grayscale\(1\)|contrast\(1\.45\)|sharpenCanvas/);
  assert.match(derivative, /rescueGroups\.slice\(0, 3\)/);
  assert.match(derivative, /derivativeStored: false/);
  assert.doesNotMatch(derivative, /localStorage|sessionStorage|supabase|fetch\(/);
  assert.match(edge, /derivatives\.slice\(0, 3\)/);
  assert.match(edge, /rescueGroupLimit: 3/);
});


test("row-level confidence does not fan out rescue across otherwise valid line fields", () => {
  const current = invoice();
  current.items[0].confidence = 0.20;
  current.items[0].batchReviewRequired = false;
  current.supplierName = "KAPIL ALCOTECH LLP";
  current.vendorName = "KAPIL ALCOTECH LLP";
  current.supplierReviewRequired = false;
  current.invoiceDateReviewRequired = false;
  current.crossOcr = { reviewTargets: [] };

  const secondaryOcr = secondary();
  secondaryOcr.chosen.supplierName = { value: "KAPIL ALCOTECH LLP" };
  secondaryOcr.chosen.invoiceDate = { value: current.invoiceDate };
  secondaryOcr.itemBatches = {};

  const plan = buildAdaptiveOcrPlan({
    primaryResult: primaryResult(),
    primaryInvoice: current,
    secondaryOcr,
    invoice: current,
    receivingShopName: "Royal 21",
  });

  const description = plan.fieldChecks.find((row) => row.fieldId === "item:0:description");
  const amount = plan.fieldChecks.find((row) => row.fieldId === "item:0:amount");
  assert.ok(description);
  assert.ok(amount);
  assert.equal(description.reasons.includes("LOW_ROW_CONFIDENCE"), false);
  assert.equal(amount.reasons.includes("LOW_ROW_CONFIDENCE"), false);
});

test("line fields without exact DI field geometry fail closed to manual review instead of broad table rescue", () => {
  const current = invoice();
  const primary = primaryResult();
  primary.analyzeResult.tables = [];

  const plan = buildAdaptiveOcrPlan({
    primaryResult: primary,
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });

  assert.ok(plan.manualOnlyFieldIds.includes("item:0:batch_number"));
  assert.equal(
    plan.rescueGroups.some((group) =>
      (group.fields || []).some((field) => field.fieldId === "item:0:batch_number")
    ),
    false,
  );
});

test("LOW single-source adaptive OCR evidence is withheld from suggestions", () => {
  const merged = mergeAdaptiveRescueResults(
    [{
      fieldResults: [{
        fieldId: "item:0:batch_number",
        label: "Batch",
        scope: "LINE_ITEM",
        source: "VISION_DERIVATIVE",
        suggestedValue: "NOISY VALUE",
        confidence: "LOW",
        requiresHumanConfirmation: true,
      }],
    }],
    [],
  );

  assert.equal(merged.suggestions.length, 0);
  assert.equal(merged.fieldResults[0].state, "UNRESOLVED");
  assert.equal(merged.fieldResults[0].suggestedValue, "");
});

test("MEDIUM adaptive evidence becomes a suggestion only when Vision and high-res Layout agree", () => {
  const merged = mergeAdaptiveRescueResults(
    [{
      fieldResults: [{
        fieldId: "header:invoice_date",
        label: "Invoice date",
        scope: "HEADER",
        source: "VISION_DERIVATIVE",
        suggestedValue: "2026-09-19",
        confidence: "MEDIUM",
        requiresHumanConfirmation: true,
      }],
    }],
    [{
      fieldResults: [{
        fieldId: "header:invoice_date",
        label: "Invoice date",
        scope: "HEADER",
        source: "HIGH_RES_LAYOUT_DERIVATIVE",
        suggestedValue: "2026-09-19",
        confidence: "MEDIUM",
        requiresHumanConfirmation: true,
      }],
    }],
  );

  assert.equal(merged.suggestions.length, 1);
  assert.equal(merged.suggestions[0].suggestedValue, "2026-09-19");
  assert.equal(merged.suggestions[0].confidence, "MEDIUM");
});


test("V13 localizes disputed invoice date to semantic evidence instead of the broad header", () => {
  const current = invoice();
  const primary = primaryResult();
  primary.analyzeResult.pages[0].lines = [
    {
      content: "TP Date",
      polygon: [
        { x: 80, y: 135 }, { x: 230, y: 135 },
        { x: 230, y: 165 }, { x: 80, y: 165 },
      ],
    },
    {
      content: "19-04-2020",
      polygon: [
        { x: 240, y: 135 }, { x: 390, y: 135 },
        { x: 390, y: 165 }, { x: 240, y: 165 },
      ],
    },
    {
      content: "Invoice No 19185",
      polygon: [
        { x: 620, y: 210 }, { x: 790, y: 210 },
        { x: 790, y: 245 }, { x: 620, y: 245 },
      ],
    },
    {
      content: "Invoice",
      polygon: [
        { x: 620, y: 252 }, { x: 715, y: 252 },
        { x: 715, y: 282 }, { x: 620, y: 282 },
      ],
    },
    {
      content: "Date 19-7-2021",
      polygon: [
        { x: 620, y: 286 }, { x: 830, y: 286 },
        { x: 830, y: 318 }, { x: 620, y: 318 },
      ],
    },
  ];

  const plan = buildAdaptiveOcrPlan({
    primaryResult: primary,
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });

  assert.equal(plan.headerRescuePolicy, "TRUSTED_ANCHOR_SEMANTIC_ROI_V1");
  assert.equal(plan.evidenceLocalizationPolicy, "INVOICE_ID_AND_SEMANTIC_LABEL_GEOMETRY");
  assert.equal(plan.derivativePreprocessingPolicy, "RAW_COLOR_ROI_FIRST");

  const date = plan.fieldChecks.find((row) => row.fieldId === "header:invoice_date");
  assert.ok(date);
  assert.equal(date.status, "RESCUE");
  assert.ok(date.region);
  assert.ok(["SPLIT_INVOICE_DATE_LABEL", "INVOICE_NUMBER_DATE_NEIGHBORHOOD"].includes(date.evidenceLocator));
  assert.ok(date.region.xMin > 0.45);
  assert.ok(date.region.xMax < 0.95);
  assert.ok(date.region.yMax - date.region.yMin < 0.25);
  assert.notEqual(date.region.xMin, 0);
  assert.notEqual(date.region.xMax, 1);

  const group = plan.rescueGroups.find((row) =>
    (row.fields || []).some((field) => field.fieldId === "header:invoice_date")
  );
  assert.ok(group);
  assert.ok(group.region.xMin > 0.40);
  assert.ok(group.region.xMax < 0.98);
  assert.ok(group.region.yMax - group.region.yMin < 0.30);
});

test("V13 supplier rescue never falls back to the disputed receiver VendorName box", () => {
  const current = invoice();
  const primary = primaryResult();
  const plan = buildAdaptiveOcrPlan({
    primaryResult: primary,
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });

  const supplier = plan.fieldChecks.find((row) => row.fieldId === "header:supplier_name");
  assert.ok(supplier);
  assert.equal(supplier.status, "RESCUE");
  assert.ok(supplier.reasons.includes("SUPPLIER_MATCHES_RECEIVING_SHOP"));
  assert.equal(supplier.region, null);
  assert.ok(plan.manualOnlyFieldIds.includes("header:supplier_name"));
});

test("V13 supplier rescue uses one unique non-receiver legal vendor region when available", () => {
  const current = invoice();
  const primary = primaryResult();
  primary.analyzeResult.pages[0].lines = [
    {
      content: "KAPIL ALCOTECH LLP",
      polygon: [
        { x: 70, y: 70 }, { x: 370, y: 70 },
        { x: 370, y: 105 }, { x: 70, y: 105 },
      ],
    },
    {
      content: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
      polygon: [
        { x: 70, y: 170 }, { x: 430, y: 170 },
        { x: 430, y: 205 }, { x: 70, y: 205 },
      ],
    },
  ];

  const plan = buildAdaptiveOcrPlan({
    primaryResult: primary,
    primaryInvoice: current,
    secondaryOcr: secondary(),
    invoice: current,
    receivingShopName: "Royal 21",
  });

  const supplier = plan.fieldChecks.find((row) => row.fieldId === "header:supplier_name");
  assert.ok(supplier.region);
  assert.equal(supplier.evidenceLocator, "UNIQUE_LEGAL_VENDOR_LINE");
  assert.ok(supplier.region.xMax < 0.55);
  assert.ok(supplier.region.yMax < 0.20);
});


test("V13 semantic ROI can accept one unique non-TP date even when derivative OCR drops the Invoice word", () => {
  const group = {
    groupId: "adaptive:v13-date-roi",
    receivingShopName: "Royal 21",
    fields: [{
      fieldId: "header:invoice_date",
      label: "Invoice date",
      scope: "HEADER",
      kind: "DATE",
      evidenceLocator: "INVOICE_NUMBER_DATE_NEIGHBORHOOD",
    }],
  };
  const payload = visionPayload([
    { text: "TP Date", box: [20, 40, 220, 40, 220, 75, 20, 75] },
    { text: "19-04-2020", box: [230, 40, 410, 40, 410, 75, 230, 75] },
    { text: "Date", box: [560, 140, 650, 140, 650, 175, 560, 175] },
    { text: "19-09-2026", box: [665, 140, 860, 140, 860, 175, 665, 175] },
  ]);
  const result = analyzeAdaptiveRescueGroup({ payload, group, source: "VISION_DERIVATIVE" });
  assert.equal(result.fieldResults[0].suggestedValue, "2026-09-19");
});
