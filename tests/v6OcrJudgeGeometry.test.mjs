import test from "node:test";
import assert from "node:assert/strict";

import {
  buildVisionReadSummary,
} from "../supabase/functions/_shared/invoiceSecondaryOcr.js";
import {
  inspectAiProviderResponse,
  requestAiMappings,
} from "../supabase/functions/_shared/invoiceResolutionFallback.js";

function polygon(x1, y1, x2, y2) {
  return [x1, y1, x2, y1, x2, y2, x1, y2];
}

function diCell(rowIndex, columnIndex, content, x1, y1, x2, y2) {
  return {
    rowIndex,
    columnIndex,
    content,
    boundingRegions: [{
      pageNumber: 1,
      polygon: polygon(x1, y1, x2, y2),
    }],
  };
}

function visionLine(text, x1, y1, x2, y2, confidence = 0.99) {
  return {
    text,
    boundingBox: polygon(x1, y1, x2, y2),
    words: text.split(/\s+/).map((word) => ({ text: word, confidence })),
  };
}

function primaryAnalyzeResult() {
  return {
    analyzeResult: {
      pages: [{
        pageNumber: 1,
        width: 1200,
        height: 1800,
        unit: "pixel",
      }],
      tables: [{
        cells: [
          diCell(0, 0, "Brand", 100, 500, 650, 535),
          diCell(0, 1, "Batch No", 700, 500, 880, 535),

          diCell(1, 0, "Haywards 2000 Strong Beer", 100, 600, 650, 635),
          diCell(1, 1, "$00 Aue-2026", 700, 600, 880, 635),

          diCell(2, 0, "GROVER MISFIT CRAFT SPARK", 100, 680, 650, 715),
          diCell(2, 1, "GMCSI Jak2016", 700, 680, 880, 715),
        ],
      }],
    },
  };
}

function visionPayload() {
  return {
    status: "succeeded",
    analyzeResult: {
      readResults: [{
        page: 1,
        width: 1200,
        height: 1800,
        unit: "pixel",
        lines: [
          // Same-Y decoy. Old same-Y logic could reuse this across rows.
          visionLine("7436 AUG21", 100, 603, 360, 630),
          visionLine("500 Aug-2026", 715, 603, 865, 630),
          visionLine("GMCSI Jul-2026", 715, 683, 865, 710),
        ],
      }],
    },
  };
}

test("Vision batch evidence is constrained by DI Batch-cell geometry", () => {
  const invoice = {
    items: [
      {
        description: "Haywards 2000 Strong Beer",
        amount: 5319,
        ratePerCase: 1773.07,
        mrp: 160,
      },
      {
        description: "GROVER MISFIT CRAFT SPARK",
        amount: 30000,
        ratePerCase: 3000,
        mrp: 140,
      },
    ],
  };

  const result = buildVisionReadSummary(
    visionPayload(),
    invoice,
    primaryAnalyzeResult(),
  );

  assert.equal(result.batchAlignment.mode, "DI_GEOMETRY");
  assert.equal(result.batchAlignment.geometryRegionCount, 2);
  assert.deepEqual(
    result.itemBatches[0].map((row) => row.value),
    ["500 Aug-2026"],
  );
  assert.deepEqual(
    result.itemBatches[1].map((row) => row.value),
    ["GMCSI Jul-2026"],
  );
  assert.equal(
    JSON.stringify(result.itemBatches).includes("7436 AUG21"),
    false,
    "same-row decoy outside DI Batch column must not be reused",
  );
});

test("Responses API output_text content is parsed with safe diagnostics", () => {
  const payload = {
    id: "resp_test_1",
    status: "completed",
    model: "judge-deployment",
    output: [{
      type: "message",
      content: [{
        type: "output_text",
        text: JSON.stringify({
          needs_review: true,
          mappings: [],
        }),
      }],
    }],
    usage: {
      input_tokens: 100,
      output_tokens: 24,
      output_tokens_details: { reasoning_tokens: 8 },
    },
  };

  const inspected = inspectAiProviderResponse(payload, 200);
  assert.equal(inspected.reason, null);
  assert.equal(JSON.parse(inspected.text).needs_review, true);
  assert.equal(inspected.diagnostics.httpStatus, 200);
  assert.equal(inspected.diagnostics.providerStatus, "completed");
  assert.equal(inspected.diagnostics.hasOutputText, true);
  assert.deepEqual(inspected.diagnostics.contentTypes, ["output_text"]);
  assert.equal(inspected.diagnostics.reasoningTokens, 8);
});

test("incomplete reasoning-only provider response is classified, not mislabeled empty", () => {
  const inspected = inspectAiProviderResponse({
    id: "resp_test_2",
    status: "incomplete",
    incomplete_details: { reason: "max_output_tokens" },
    output: [{ type: "reasoning", content: [] }],
    usage: {
      input_tokens: 120,
      output_tokens: 450,
      output_tokens_details: { reasoning_tokens: 450 },
    },
  }, 200);

  assert.equal(inspected.text, "");
  assert.equal(
    inspected.reason,
    "AI_PROVIDER_INCOMPLETE_MAX_OUTPUT_TOKENS",
  );
  assert.equal(inspected.diagnostics.hasOutputText, false);
  assert.equal(inspected.diagnostics.reasoningTokens, 450);
});

test("Shop AI request diagnostics prove Vision evidence reached the judge request", async () => {
  const issues = [{
    targetId: "header:supplier_name",
    fieldScope: "HEADER",
    canonicalField: "supplier_name",
    reason: "CROSS_OCR_SUPPLIER_CONFLICT",
    requiresHumanConfirmation: true,
  }];

  const evidence = [{
    id: "vision:p1:l20:supplier",
    source: "vision_line",
    label: "Supplier candidate",
    rawValue: "KAPIL ALCOTECH LLP",
    value: "KAPIL ALCOTECH LLP",
    itemIndexes: [],
  }];

  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      id: "resp_test_3",
      status: "completed",
      model: "judge-deployment",
      output: [{
        type: "message",
        content: [{
          type: "output_text",
          text: JSON.stringify({
            needs_review: true,
            mappings: [{
              target_id: "header:supplier_name",
              evidence_id: "vision:p1:l20:supplier",
            }],
          }),
        }],
      }],
      usage: {
        input_tokens: 200,
        output_tokens: 40,
      },
    }),
  });

  const result = await requestAiMappings({
    config: {
      enabled: true,
      baseUrl: "https://unit.invalid/openai/v1",
      apiKey: "unit-test",
      model: "judge-deployment",
      timeoutMs: 3000,
    },
    supplierName: "ROYAL 21",
    invoice: {
      supplierName: "ROYAL 21",
      items: [],
      crossOcr: {
        status: "REVIEW",
        reviewTargets: [{
          targetId: "header:supplier_name",
          reason: "CROSS_OCR_SUPPLIER_CONFLICT",
          primaryValue: "ROYAL 21",
          secondaryValue: "KAPIL ALCOTECH LLP",
        }],
      },
    },
    issues,
    evidence,
    fetchImpl: fakeFetch,
  });

  assert.equal(result.called, true);
  assert.equal(result.ok, true);
  assert.equal(result.diagnostics.httpStatus, 200);
  assert.equal(result.diagnostics.visionEvidenceCount, 1);
  assert.equal(result.diagnostics.primaryEvidenceCount, 0);
  assert.deepEqual(result.diagnostics.evidenceSources, ["vision_line"]);
  assert.equal(result.diagnostics.hasOutputText, true);
});
