import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildAiRequest,
  requestAiMappings,
} from "../supabase/functions/_shared/invoiceResolutionFallback.js";

function baseInvoice() {
  return {
    supplierName: "ROYAL 21",
    items: [{ description: "Haywards 2000 Strong Beer", amount: 5319 }],
    crossOcr: {
      status: "REVIEW",
      reviewTargets: [{
        targetId: "header:supplier_name",
        reason: "CROSS_OCR_SUPPLIER_CONFLICT",
        primaryValue: "ROYAL 21",
        secondaryValue: "KAPIL ALCOTECH LLP",
      }],
    },
  };
}

function supplierIssue() {
  return {
    targetId: "header:supplier_name",
    fieldScope: "HEADER",
    canonicalField: "supplier_name",
    reason: "CROSS_OCR_SUPPLIER_CONFLICT",
    requiresHumanConfirmation: true,
  };
}

test("judge uses minimal reasoning and keeps DI + Vision evidence for a conflict", () => {
  const issues = [supplierIssue()];
  const evidence = [
    {
      id: "di:1",
      source: "key_value",
      label: "Vendor",
      rawValue: "ROYAL 21",
      value: "ROYAL 21",
      itemIndexes: [],
    },
    {
      id: "vision:1",
      source: "vision_line",
      label: "Supplier candidate",
      rawValue: "KAPIL ALCOTECH LLP",
      value: "KAPIL ALCOTECH LLP",
      itemIndexes: [],
    },
    {
      id: "vision:2",
      source: "vision_line",
      label: "Supplier candidate",
      rawValue: "KAPIL ALCOTECH LLP FL-1-12",
      value: "KAPIL ALCOTECH LLP FL-1-12",
      itemIndexes: [],
    },
  ];

  const request = buildAiRequest({
    model: "gpt-5-mini",
    supplierName: "ROYAL 21",
    invoice: baseInvoice(),
    issues,
    evidence,
  });

  const input = JSON.parse(request.input);
  assert.equal(request.reasoning.effort, "minimal");
  assert.equal(input.unresolved_targets.length, 1);
  assert.equal(input.evidence.length, 2);
  assert.ok(input.evidence.some((row) => row.source === "key_value"));
  assert.ok(input.evidence.some((row) => row.source === "vision_line"));
});

test("judge carries correlation id and does not send targets with no direct evidence", async () => {
  const issues = [
    supplierIssue(),
    {
      targetId: "finance:transport",
      fieldScope: "FINANCE",
      canonicalField: "transport",
      reason: "FINANCE_REVIEW",
    },
  ];

  const evidence = [{
    id: "vision:1",
    source: "vision_line",
    label: "Supplier candidate",
    rawValue: "KAPIL ALCOTECH LLP",
    value: "KAPIL ALCOTECH LLP",
    itemIndexes: [],
  }];

  let captured = null;
  const fakeFetch = async (_url, options) => {
    captured = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: "resp_test",
        status: "completed",
        model: "gpt-5-mini",
        output: [{
          type: "message",
          content: [{
            type: "output_text",
            text: JSON.stringify({
              needs_review: true,
              mappings: [{
                target_id: "header:supplier_name",
                evidence_id: "vision:1",
              }],
            }),
          }],
        }],
        usage: {
          input_tokens: 200,
          output_tokens: 30,
          output_tokens_details: { reasoning_tokens: 6 },
        },
      }),
    };
  };

  const result = await requestAiMappings({
    config: {
      enabled: true,
      baseUrl: "https://unit.invalid/openai/v1",
      apiKey: "unit-test",
      model: "gpt-5-mini",
      timeoutMs: 18000,
      correlationId: "11111111-2222-3333-4444-555555555555",
    },
    supplierName: "ROYAL 21",
    invoice: baseInvoice(),
    issues,
    evidence,
    fetchImpl: fakeFetch,
  });

  assert.equal(
    captured.headers["x-ms-client-request-id"],
    "11111111-2222-3333-4444-555555555555",
  );
  const sentBody = JSON.parse(captured.body);
  assert.equal(sentBody.reasoning.effort, "minimal");
  assert.equal(result.called, true);
  assert.equal(result.ok, true);
  assert.equal(result.diagnostics.requestedIssueCount, 2);
  assert.equal(result.diagnostics.sentIssueCount, 1);
  assert.equal(result.diagnostics.sentEvidenceCount, 1);
  assert.equal(result.diagnostics.reasoningEffort, "minimal");
  assert.equal(result.diagnostics.timeoutMs, 18000);
});

test("Edge source correlates DI, Vision and Shop AI without request/response logging", () => {
  const source = fs.readFileSync(
    new URL("../supabase/functions/ocr-invoice/index.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /if \(!ingestionId\) throw new Error\("Stored invoice ingestion ID is required"\)/);
  assert.match(source, /const correlationId = ingestionId;/);
  assert.doesNotMatch(source, /ingestionId \|\| crypto\.randomUUID/);
  assert.ok(
    (source.match(/"x-ms-client-request-id": correlationId/g) || []).length >= 2,
    "DI/Vision request headers must carry the correlation id",
  );
  assert.match(source, /correlationId,/);
  assert.match(source, /event: "WSP_OCR_TRACE"/);
  assert.doesNotMatch(source, /RequestResponse/);
});
