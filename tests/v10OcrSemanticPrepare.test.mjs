import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildVisionReadSummary,
  applySecondaryOcrConsensus,
} from "../supabase/functions/_shared/invoiceSecondaryOcr.js";
import { buildShopAiRequest } from "../supabase/functions/_shared/invoiceShopAiReview.js";
import { buildOcrReceivingPurchaseDraft } from "../src/lib/ocrReceivingDraft.js";

function line(text, x1, y1, x2, y2) {
  return {
    text,
    boundingBox: [x1,y1,x2,y1,x2,y2,x1,y2],
    words: [{ confidence: 0.96 }],
  };
}

function visionPayload() {
  return {
    analyzeResult: {
      readResults: [{
        page: 1,
        width: 1000,
        height: 1000,
        lines: [
          line("ROYAL 21 PRIVATE LIMITED", 40, 30, 400, 65),
          line("KAPIL ALCOTECH LLP", 40, 75, 380, 110),
          line("TP Date 19-04-2020", 600, 115, 900, 150),
          line("Invoice Date 19-09-2026", 40, 180, 390, 215),
          line("Invoice No 19185", 40, 225, 300, 255),
        ],
      }],
    },
  };
}

function primaryResult() {
  return {
    analyzeResult: {
      pages: [{ pageNumber: 1, width: 1000, height: 1000 }],
      documents: [{
        fields: {
          InvoiceDate: {
            boundingRegions: [{
              pageNumber: 1,
              polygon: [
                {x:600,y:115},{x:900,y:115},{x:900,y:150},{x:600,y:150},
              ],
            }],
          },
        },
      }],
      tables: [],
    },
  };
}

test("TP date cannot win even when DI geometry points at it", () => {
  const invoice = {
    supplierName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    vendorName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    invoiceNumber: "19185",
    invoiceDate: "2021-07-19",
    items: [],
  };

  const summary = buildVisionReadSummary(
    visionPayload(),
    invoice,
    primaryResult(),
    { currentShopName: "Royal 21" },
  );

  assert.equal(summary.chosen.invoiceDate.value, "2026-09-19");
  assert.equal(summary.chosen.invoiceDate.semanticRole, "INVOICE_DATE_LABEL");
  assert.equal(summary.chosen.supplierName.value, "KAPIL ALCOTECH LLP");

  const resolved = applySecondaryOcrConsensus(
    invoice,
    summary,
    { currentShopName: "Royal 21" },
  );

  // Independent OCR conflict is never silently written into the canonical
  // header. The semantic result is exposed as a one-click owner suggestion.
  assert.equal(resolved.invoiceDate, "2021-07-19");
  assert.equal(resolved.invoiceDateSuggestedValue, "2026-09-19");
  assert.equal(
    resolved.invoiceDateSuggestedSource,
    "VISION_SEMANTIC_SUGGESTION",
  );
  assert.equal(resolved.invoiceDateReviewRequired, true);

  assert.equal(
    resolved.supplierName,
    "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
  );
  assert.equal(resolved.supplierSuggestedValue, "KAPIL ALCOTECH LLP");
  assert.equal(
    resolved.supplierSuggestedSource,
    "VISION_ROLE_SUGGESTION",
  );
  assert.equal(resolved.supplierReviewRequired, true);
});

test("ShopAI receives buyer identity as role context but not OCR target values", () => {
  const primaryInvoice = {
    supplierName: "ROYAL 21 BEER AND WINE SHOPEE KOKANWADI",
    invoiceNumber: "19185",
    invoiceDate: "2021-07-19",
    items: [],
  };
  const secondaryOcr = {
    chosen: {
      supplierName: { value: "KAPIL ALCOTECH LLP" },
      invoiceDate: { value: "2026-09-19" },
    },
  };
  const invoice = {
    ...primaryInvoice,
    supplierName: "KAPIL ALCOTECH LLP",
    invoiceDate: "2026-09-19",
    invoiceDateReviewRequired: true,
    crossOcr: {
      status: "REVIEW_REQUIRED",
      reviewTargets: [
        { targetId: "header:supplier_name" },
        { targetId: "header:invoice_date" },
      ],
    },
  };

  const built = buildShopAiRequest({
    model: "gpt-5-mini",
    contentBase64: "YWJj",
    contentType: "image/jpeg",
    fileName: "invoice.jpg",
    primaryInvoice,
    secondaryOcr,
    invoice,
    documentPageCount: 1,
    receivingShopName: "Royal 21",
  });

  assert.equal(built.ok, true);
  const payload = JSON.parse(built.request.input[0].content[0].text);
  const serialized = JSON.stringify(payload);

  assert.equal(payload.business_context.receiving_shop_name, "Royal 21");
  assert.equal(
    payload.business_context.receiving_shop_role,
    "BUYER_RECEIVER_NOT_SUPPLIER",
  );
  assert.equal(
    serialized.includes("ROYAL 21 BEER AND WINE SHOPEE KOKANWADI"),
    false,
  );
  assert.equal(serialized.includes("KAPIL ALCOTECH LLP"), false);
  assert.equal(serialized.includes("2021-07-19"), false);
  assert.equal(serialized.includes("2026-09-19"), false);
});

test("Prepare builds a real server Purchase Receiving draft without inventory mutation", () => {
  const invoice = {
    supplierName: "KAPIL ALCOTECH LLP",
    invoiceNumber: "19185",
    invoiceDate: "2026-09-19",
    invoiceDateReviewRequired: true,
    subtotal: 31080,
    total: 31080,
    amountDue: 31080,
    items: [
      {
        description: "KNOWN STRONG BEER",
        packing: "650 ML",
        mrp: 180,
        batchNumber: "B1 SEP-2026",
        batchReviewRequired: false,
        caseCount: 1,
        ratePerCase: 1080,
        amount: 1080,
      },
      {
        description: "NEW CRAFT SPARK",
        packing: "330 ML",
        mrp: 140,
        batchNumber: "N1 SEP-2026",
        batchReviewRequired: true,
        caseCount: 10,
        ratePerCase: 3000,
        amount: 30000,
      },
    ],
  };

  const resolution = {
    0: {
      productId: "product-1",
      status: "CONFIRMED",
      source: "PRODUCT_MASTER",
      sizeMl: 650,
      caseCount: 1,
      unitsPerCase: 12,
      looseBottles: 0,
      quantity: 12,
      purchasePrice: 90,
      unitsPerCaseSource: "PRIOR_650ML_BOTTLE_12",
      packReviewRequired: false,
      packConflict: false,
      packAutoSuggested: false,
    },
    1: {
      productId: "",
      status: "NEEDS_PRODUCT",
      source: null,
      sizeMl: 330,
      caseCount: 10,
      unitsPerCase: 24,
      looseBottles: 0,
      quantity: 240,
      purchasePrice: 125,
      unitsPerCaseSource: "PRICE_MRP_AUTO_SUGGESTED",
      packReviewRequired: true,
      packAutoSuggested: true,
    },
  };

  const draft = buildOcrReceivingPurchaseDraft({
    ingestionId: "ingestion-19185",
    invoice,
    resolution,
    products: [{
      id: "product-1",
      name: "Known Strong Beer",
      sizeMl: 650,
      barcode: "890000000001",
      mrp: 180,
    }],
    supplierId: "supplier-kapil",
    supplierName: "Kapil Alcotech LLP",
    charges: { freightAmount: 600 },
  });

  assert.equal(draft.ingestionId, "ingestion-19185");
  assert.equal(draft.supplierName, "Kapil Alcotech LLP");
  assert.equal(draft.items.length, 2);

  assert.equal(draft.items[0].productId, "product-1");
  assert.equal(draft.items[0].pendingProduct, null);
  assert.equal(draft.items[0].packResolution.state, "CONFIRMED_AS_POSTED");

  assert.equal(draft.items[1].productId, "");
  assert.equal(draft.items[1].pendingProduct.productName, "New Craft Spark");
  assert.equal(draft.items[1].pendingProduct.sizeMl, 330);
  assert.equal(draft.items[1].pendingProduct.unitsPerCase, 24);
  assert.equal(draft.items[1].quantity, 240);
  assert.equal(draft.items[1].packResolution.state, "NEEDS_REVIEW");
  assert.equal(draft.items[1].batchResolution.state, "NEEDS_REVIEW");
});

test("source proves original bytes are sent to OCR and high-resolution is requested", () => {
  const source = fs.readFileSync(
    new URL("../supabase/functions/ocr-invoice/index.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /ocrHighResolution/);
  assert.match(source, /base64Source: contentBase64/);
  assert.match(source, /body: bytes/);
  assert.match(source, /resolveCanonicalInvoiceDocument/);
  assert.match(source, /sha256Hex/);
  assert.match(source, /wspHighResolution/);
  assert.match(source, /semanticPartyDateResolver/);
});

test("conflicting ShopAI supplier/date cannot silently overwrite semantic OCR review", () => {
  const source = fs.readFileSync(
    new URL("../src/pages/AutomationHub.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /allowConflict = false/);
  assert.match(source, /suggestion\.diVisionConflict && !allowConflict/);
  assert.match(source, /batch_number`,[\s\S]*\{ allowConflict: true \}/);
  assert.match(source, /suggestedIso && !shopAi\?\.diVisionConflict/);
  assert.match(source, /supplierSuggestedValue/);
  assert.match(source, /supplierSuggestedSource/);
  assert.match(source, /VISION_ROLE_SUGGESTION/);
  assert.match(source, /HUMAN_CONFIRMED_VISION_SEMANTIC/);
});

test("Prepare handoff saves RECEIVE_STOCK purchaseDraft while receive gates remain untouched", () => {
  const automation = fs.readFileSync(
    new URL("../src/pages/AutomationHub.jsx", import.meta.url),
    "utf8",
  );
  const purchases = fs.readFileSync(
    new URL("../src/pages/Purchases.jsx", import.meta.url),
    "utf8",
  );
  const sql = fs.readFileSync(
    new URL(
      "../supabase/migrations/20260920043000_v6_shopai_multimodal_judge_v1.sql",
      import.meta.url,
    ),
    "utf8",
  );

  const start = automation.indexOf("async function sendDraft()");
  const end = automation.indexOf("const supplierDefaults", start);
  const send = automation.slice(start, end);

  assert.match(send, /buildOcrReceivingPurchaseDraft/);
  assert.match(send, /stage: "RECEIVE_STOCK"/);
  assert.match(send, /purchaseDraft,/);
  assert.match(send, /ready: false/);
  assert.doesNotMatch(send, /purchaseDraft: null/);
  assert.doesNotMatch(send, /shopAiOwnerReady\(\)/);

  assert.match(purchases, /financialReady&&shopAiReady/);
  assert.match(purchases, /disabled=\{busy\|\|!ready\}/);
  assert.match(sql, /invoice_shopai_owner_gate_ok/);
  assert.match(sql, /SHOPAI_OWNER_REVIEW_REQUIRED/);
});
