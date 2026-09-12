import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { normalizeDocumentIntelligenceResult } from "../supabase/functions/_shared/invoiceDocument.js";
import {
  buildResolutionEvidence,
  detectInvoiceIssues,
  requestAiMappings,
  resolveInvoiceExceptions,
  validateAiMappingResponse,
} from "../supabase/functions/_shared/invoiceResolutionFallback.js";

function rawFixture(name) {
  const wrapper = JSON.parse(
    fs.readFileSync(`tests/fixtures/ocr/${name}.azure-finance-raw.json`, "utf8"),
  );
  assert.equal(wrapper.synthetic, false);
  return wrapper.azureEvidence;
}

function provider(payload) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify(payload),
              },
            ],
          },
        ],
      };
    },
  };
}

function findEvidence(evidence, labelRe, value) {
  const hit = evidence.find(
    (row) =>
      labelRe.test(row.label) &&
      Number(row.moneyValue) === Number(value),
  );
  assert.ok(
    hit,
    `Missing evidence ${labelRe}=${value}\n${JSON.stringify(evidence, null, 2)}`,
  );
  return hit;
}

function b3339Payload(evidence) {
  const discount0 = findEvidence(evidence, /discount/i, 0);
  const cd599 = findEvidence(evidence, /\bcd\b/i, 599);
  const freight700 = findEvidence(evidence, /freight/i, 700);
  const fee5 = findEvidence(evidence, /fee/i, 5);
  const tcs1737 = findEvidence(evidence, /tcs/i, 1737);
  const total88558 =
    evidence.find(
      (row) =>
        /outstanding/i.test(row.label) &&
        Number(row.moneyValue) === 88558,
    ) ||
    findEvidence(evidence, /\btotal\b/i, 88558);

  return {
    needs_review: false,
    mappings: [
      {
        target_id: "finance:invoice_discount",
        evidence_id: discount0.id,
      },
      {
        target_id: "finance:cash_discount",
        evidence_id: cd599.id,
      },
      {
        target_id: "finance:freight",
        evidence_id: freight700.id,
      },
      {
        target_id: "finance:fees",
        evidence_id: fee5.id,
      },
      {
        target_id: "finance:tcs",
        evidence_id: tcs1737.id,
      },
      {
        target_id: "finance:invoice_total",
        evidence_id: total88558.id,
      },
    ],
  };
}

const config = {
  enabled: true,
  baseUrl: "https://unit.invalid/openai/v1",
  apiKey: "unit-test",
  model: "gpt-5-mini",
  timeoutMs: 5000,
};

test("B-3339 evidence budget never drops direct finance summary behind the large line-item table", () => {
  const raw = rawFixture("B-3339");
  const invoice = normalizeDocumentIntelligenceResult(raw);
  const evidence = buildResolutionEvidence(raw, invoice);

  const required = [
    [/discount/i, 0],
    [/\bcd\b/i, 599],
    [/freight/i, 700],
    [/fee/i, 5],
    [/tcs/i, 1737],
    [/\btotal\b/i, 88558],
  ];

  for (const [labelRe, value] of required) {
    assert.ok(
      evidence.some(
        (row) =>
          labelRe.test(row.label) &&
          Number(row.moneyValue) === Number(value) &&
          row.source !== "line_table_cell",
      ),
      `Direct finance evidence ${labelRe}=${value} was starved by line-item evidence`,
    );
  }
});

test("B-3339: generic known finance vocabulary resolves real Azure evidence to exact MATCH before AI", async () => {
  const raw = rawFixture("B-3339");
  const baseline = normalizeDocumentIntelligenceResult(raw);

  let calls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult: raw,
    invoice: baseline,
    supabase: null,
    ingestionId: null,
    config,
    fetchImpl: async () => {
      calls += 1;
      throw new Error("Known direct B-3339 finance evidence must not spend an AI call");
    },
  });

  assert.equal(calls, 0);
  assert.equal(out.items.length, 14);
  assert.equal(out.financialAdjustments.lineProductValue, 86715);
  assert.equal(out.financialAdjustments.cashDiscountAmount, 599);
  assert.equal(out.financialAdjustments.otherDeductionAmount, 0);
  assert.equal(out.financialAdjustments.freightCartingAmount, 700);
  assert.equal(out.financialAdjustments.stampDutyAmount, 5);
  assert.equal(out.financialAdjustments.tcsAmount, 1737);
  assert.equal(out.financialAdjustments.printedInvoiceTotal, 88558);
  assert.equal(out.financialAdjustments.calculatedInvoiceTotal, 88558);
  assert.equal(out.financialAdjustments.difference, 0);
  assert.equal(out.financialAdjustments.reconciliationStatus, "MATCH");
  assert.equal(out.total, 88558);
  assert.equal(out.resolutionAssist.aiCalled, false);
  assert.ok(
    out.resolutionAssist.deterministicHits >= 6,
    `Expected >=6 deterministic mappings, got ${JSON.stringify(out.resolutionAssist)}`,
  );
});

test("AI needs_review=true preserves a validated direct mapping as a manual suggestion", async () => {
  const raw = rawFixture("B-3339");
  const baseline = normalizeDocumentIntelligenceResult(raw);
  const allEvidence = buildResolutionEvidence(raw, baseline);
  const freight700 = findEvidence(allEvidence, /freight/i, 700);
  const issues = [{
    targetId: "finance:freight",
    fieldScope: "FINANCE",
    canonicalField: "freight",
    reason: "UNIT_NEEDS_REVIEW_POLICY",
  }];
  const payload = {
    needs_review: true,
    mappings: [{
      target_id: "finance:freight",
      evidence_id: freight700.id,
    }],
  };

  const result = await requestAiMappings({
    config,
    supplierName: baseline.vendorName || baseline.supplierName,
    invoice: baseline,
    issues,
    evidence: [freight700],
    fetchImpl: async () => provider(payload),
  });

  assert.equal(
    result.ok,
    true,
    `AI mapping validation unexpectedly failed: ${result.reason || "unknown"}`,
  );
  assert.equal(result.called, true);
  assert.equal(result.needsReview, true);
  assert.equal(result.mappings.length, 1);
  assert.equal(result.mappings[0].value, 700);
  assert.equal(result.mappings[0].applied, false);
});

test("16845: receive-valid golden invoice has no actionable exception and spends zero AI calls", async () => {
  const raw = rawFixture("16845");
  const baseline = normalizeDocumentIntelligenceResult(raw);
  assert.equal(baseline.financialAdjustments.reconciliationStatus, "MATCH");

  // 16845's OCR normalizer deliberately leaves the invoice date on the
  // existing human date-review path. That is not an AI exception.
  assert.equal(baseline.invoiceDateReviewRequired, true);

  const issues = detectInvoiceIssues(baseline);
  assert.deepEqual(
    issues,
    [],
    `16845 should not create AI work for optional/derivable/manual-review fields: ${JSON.stringify(issues)}`,
  );

  let calls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult: raw,
    invoice: baseline,
    supabase: null,
    ingestionId: null,
    config,
    fetchImpl: async () => {
      calls += 1;
      throw new Error("AI should not be called");
    },
  });

  assert.equal(calls, 0);
  assert.equal(out.financialAdjustments.reconciliationStatus, "MATCH");
});

test("confirmed supplier mapping memory resolves repeat B-3339 without an AI call", async () => {
  const raw = rawFixture("B-3339");
  const baseline = normalizeDocumentIntelligenceResult(raw);
  const evidence = buildResolutionEvidence(raw, baseline);
  const normalizeLabel = (value) => String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  const picks = [
    ["cash_discount", findEvidence(evidence, /\bcd\b/i, 599)],
    ["freight", findEvidence(evidence, /freight/i, 700)],
    ["fees", findEvidence(evidence, /fee/i, 5)],
    ["tcs", findEvidence(evidence, /tcs/i, 1737)],
    [
      "invoice_total",
      evidence.find(
        (row) => /outstanding/i.test(row.label) && Number(row.moneyValue) === 88558,
      ) || findEvidence(evidence, /\btotal\b/i, 88558),
    ],
  ];

  const aliases = picks.map(([canonicalField, entry]) => ({
    fieldScope: "FINANCE",
    canonicalField,
    rawLabel: entry.label,
    normalizedLabel: normalizeLabel(entry.label),
    confirmations: 2,
    hitCount: 3,
  }));

  const supabase = {
    async rpc(name) {
      if (name === "invoice_ocr_resolve_aliases") {
        return { data: aliases, error: null };
      }
      if (name === "invoice_ocr_log_events") {
        return { data: 1, error: null };
      }
      return { data: null, error: new Error(`unexpected rpc ${name}`) };
    },
  };

  let calls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult: raw,
    invoice: baseline,
    supabase,
    ingestionId: "00000000-0000-0000-0000-000000000001",
    config,
    fetchImpl: async () => {
      calls += 1;
      throw new Error("AI should not be called after confirmed mapping memory resolves the invoice");
    },
  });

  assert.equal(calls, 0);
  assert.equal(out.resolutionAssist.memoryHits, 5);
  assert.equal(out.resolutionAssist.aiCalled, false);
  assert.equal(out.financialAdjustments.reconciliationStatus, "MATCH");
  assert.equal(out.financialAdjustments.printedInvoiceTotal, 88558);
});

test("16805: unresolved total remains safe-review; AI cannot invent 8044", async () => {
  const raw = rawFixture("16805");
  const baseline = normalizeDocumentIntelligenceResult(raw);

  let calls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult: raw,
    invoice: baseline,
    supabase: null,
    ingestionId: null,
    config,
    fetchImpl: async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const input = JSON.parse(body.input);
      assert.ok(
        input.unresolved_targets.some(
          (row) => row.target_id === "finance:invoice_total",
        ),
      );
      return provider({
        needs_review: true,
        mappings: [],
      });
    },
  });

  assert.equal(calls, 1);
  assert.equal(out.total, null);
  assert.equal(out.amountDue, null);
  assert.equal(out.financialAdjustments.cashDiscountAmount, 95);
  assert.equal(
    out.financialAdjustments.reconciliationStatus,
    "REVIEW_PRINTED_TOTAL_UNREADABLE",
  );
  assert.notEqual(out.total, 8044);
});

test("AI cannot swap CD and generic DISCOUNT", () => {
  const raw = rawFixture("B-3339");
  const invoice = normalizeDocumentIntelligenceResult(raw);
  const evidence = buildResolutionEvidence(raw, invoice);
  const issues = detectInvoiceIssues(invoice);
  const payload = b3339Payload(evidence);

  const cash = payload.mappings.find(
    (row) => row.target_id === "finance:cash_discount",
  );
  const discount = payload.mappings.find(
    (row) => row.target_id === "finance:invoice_discount",
  );

  [cash.evidence_id, discount.evidence_id] = [
    discount.evidence_id,
    cash.evidence_id,
  ];

  const checked = validateAiMappingResponse(
    payload,
    issues,
    evidence,
    invoice,
  );
  assert.equal(checked.ok, false);
  assert.match(checked.reason, /INCOMPATIBLE/);
});

test("first-time misspelled finance label is an AI suggestion, not an auto-trusted value", () => {
  const invoice = {
    items: [{ amount: 1000 }],
    financialAdjustments: { lineProductValue: 1000 },
  };
  const issues = [{
    targetId: "finance:freight",
    fieldScope: "FINANCE",
    canonicalField: "freight",
    reason: "FINANCE_UNRESOLVED",
  }];
  const evidence = [{
    id: "summary:9:r1:c2",
    source: "table_column_below",
    label: "FRIEGHT",
    normalizedLabel: "frieght",
    rawValue: "700",
    moneyValue: 700,
    dateValue: null,
    itemIndexes: [],
  }];

  const checked = validateAiMappingResponse(
    {
      needs_review: true,
      mappings: [{
        target_id: "finance:freight",
        evidence_id: "summary:9:r1:c2",
      }],
    },
    issues,
    evidence,
    invoice,
  );

  assert.equal(checked.ok, true);
  assert.equal(checked.mappings[0].semanticStatus, "NOVEL");
  assert.equal(checked.mappings[0].applied, false);
});

test("human-confirmed supplier memory can reuse a misspelled finance label without another AI call", async () => {
  const analyzeResult = {
    analyzeResult: {
      keyValuePairs: [
        {
          key: { content: "FRIEGHT" },
          value: { content: "700" },
        },
      ],
      tables: [],
    },
  };
  const invoice = {
    vendorName: "Supplier X",
    supplierName: "Supplier X",
    invoiceNumber: "A1",
    invoiceDate: "2026-09-12",
    items: [
      {
        description: "Beer",
        amount: 1000,
        ratePerCase: 1000,
        caseCount: 1,
      },
    ],
    total: null,
    amountDue: null,
    financialAdjustments: {
      lineProductValue: 1000,
      cashDiscountAmount: 0,
      otherDeductionAmount: 0,
      freightCartingAmount: 0,
      transportAmount: 0,
      handlingAmount: 0,
      loadingUnloadingAmount: 0,
      stampDutyAmount: 0,
      tcsAmount: 0,
      otherAdditionsAmount: 0,
      roundingAdjustment: 0,
      printedInvoiceTotal: null,
      reconciliationStatus: "REVIEW_PRINTED_TOTAL_UNREADABLE",
    },
  };

  const fakeSupabase = {
    async rpc(name) {
      if (name === "invoice_ocr_resolve_aliases") {
        return {
          data: [
            {
              fieldScope: "FINANCE",
              canonicalField: "freight",
              rawLabel: "FRIEGHT",
              normalizedLabel: "frieght",
            },
          ],
          error: null,
        };
      }
      if (name === "invoice_ocr_log_events") {
        return { data: 1, error: null };
      }
      return { data: null, error: null };
    },
  };

  let aiCalls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult,
    invoice,
    supabase: fakeSupabase,
    ingestionId: "00000000-0000-0000-0000-000000000001",
    config: {
      ...config,
      enabled: false,
    },
    fetchImpl: async () => {
      aiCalls += 1;
      throw new Error("AI must not run for confirmed memory");
    },
  });

  assert.equal(aiCalls, 0);
  assert.equal(out.freightAmount, 700);
  assert.equal(out.resolutionAssist.memoryHits, 1);
  assert.equal(out.resolutionAssist.mappings[0].source, "MEMORY");
  assert.equal(out.resolutionAssist.mappings[0].semanticStatus, "CONFIRMED_MEMORY");
  assert.equal(out.resolutionAssist.mappings[0].applied, true);
});

test("AI cannot remap a label that clearly belongs to another known finance field", () => {
  const invoice = {
    items: [{ amount: 1000 }],
    financialAdjustments: { lineProductValue: 1000 },
  };
  const issues = [{
    targetId: "finance:freight",
    fieldScope: "FINANCE",
    canonicalField: "freight",
    reason: "FINANCE_UNRESOLVED",
  }];
  const evidence = [{
    id: "summary:2:r1:c4",
    source: "table_column_below",
    label: "(+)TP FEES",
    normalizedLabel: "tp fees",
    rawValue: "5",
    moneyValue: 5,
    dateValue: null,
    itemIndexes: [],
  }];

  const checked = validateAiMappingResponse(
    {
      needs_review: false,
      mappings: [{
        target_id: "finance:freight",
        evidence_id: "summary:2:r1:c4",
      }],
    },
    issues,
    evidence,
    invoice,
  );

  assert.equal(checked.ok, false);
  assert.match(checked.reason, /INCOMPATIBLE/);
});

test("ambiguous line evidence associated with multiple normalized items is never AI-corrected", () => {
  const invoice = {
    items: [
      { description: "A", amount: 100 },
      { description: "B", amount: 200 },
    ],
    financialAdjustments: {
      lineProductValue: 300,
      reconciliationStatus: "MATCH",
    },
  };
  const issues = [{
    targetId: "item:0:rate_per_case",
    fieldScope: "LINE_ITEM",
    canonicalField: "rate_per_case",
    reason: "MISSING_LINE_RATE",
  }];
  const evidence = [{
    id: "line:1:r1:c4",
    source: "line_table_cell",
    label: "RATE",
    normalizedLabel: "rate",
    rawValue: "1884.05",
    moneyValue: 1884.05,
    dateValue: null,
    itemIndexes: [0, 1],
  }];

  const checked = validateAiMappingResponse(
    {
      needs_review: true,
      mappings: [{
        target_id: "item:0:rate_per_case",
        evidence_id: "line:1:r1:c4",
      }],
    },
    issues,
    evidence,
    invoice,
  );

  assert.equal(checked.ok, false);
  assert.match(checked.reason, /INCOMPATIBLE/);
});

test("AI cannot invent IDs, reuse evidence, or use a line TOTAL as invoice total", () => {
  const raw = rawFixture("B-3339");
  const invoice = normalizeDocumentIntelligenceResult(raw);
  const evidence = buildResolutionEvidence(raw, invoice);
  const issues = detectInvoiceIssues(invoice);
  const payload = b3339Payload(evidence);

  const invented = structuredClone(payload);
  invented.mappings[0].evidence_id = "invented:88558";
  assert.equal(
    validateAiMappingResponse(invented, issues, evidence, invoice).ok,
    false,
  );

  const duplicate = structuredClone(payload);
  duplicate.mappings[1].evidence_id =
    duplicate.mappings[0].evidence_id;
  assert.equal(
    validateAiMappingResponse(duplicate, issues, evidence, invoice).ok,
    false,
  );

  const lineTotal = evidence.find(
    (row) =>
      row.source === "line_table_cell" &&
      /\btotal\b/i.test(row.label) &&
      Number.isFinite(row.moneyValue),
  );
  if (lineTotal) {
    const badTotal = {
      needs_review: false,
      mappings: [
        {
          target_id: "finance:invoice_total",
          evidence_id: lineTotal.id,
        },
      ],
    };
    assert.equal(
      validateAiMappingResponse(badTotal, issues, evidence, invoice).ok,
      false,
    );
  }
});

test("AI provider outage preserves safe manual review for a genuinely novel unresolved label", async () => {
  const analyzeResult = {
    analyzeResult: {
      keyValuePairs: [
        {
          key: { content: "FRIEGHT" },
          value: { content: "700" },
        },
        {
          key: { content: "Outstanding" },
          value: { content: "1700" },
        },
      ],
      tables: [],
    },
  };

  const invoice = {
    vendorName: "Supplier X",
    supplierName: "Supplier X",
    invoiceNumber: "OUTAGE-1",
    invoiceDate: "2026-09-12",
    invoiceDateReviewRequired: false,
    items: [
      {
        description: "Beer",
        amount: 1000,
        ratePerCase: 1000,
        caseCount: 1,
      },
    ],
    total: null,
    amountDue: null,
    financialAdjustments: {
      lineProductValue: 1000,
      cashDiscountAmount: 0,
      otherDeductionAmount: 0,
      freightCartingAmount: 0,
      transportAmount: 0,
      handlingAmount: 0,
      loadingUnloadingAmount: 0,
      stampDutyAmount: 0,
      tcsAmount: 0,
      otherAdditionsAmount: 0,
      roundingAdjustment: 0,
      printedInvoiceTotal: null,
      reconciliationStatus: "REVIEW_PRINTED_TOTAL_UNREADABLE",
    },
  };

  let aiCalls = 0;
  const out = await resolveInvoiceExceptions({
    analyzeResult,
    invoice,
    supabase: null,
    ingestionId: null,
    config,
    fetchImpl: async () => {
      aiCalls += 1;
      throw new Error("simulated outage");
    },
  });

  assert.equal(aiCalls, 1);
  assert.equal(out.resolutionAssist.aiCalled, true);
  assert.equal(out.resolutionAssist.aiReason, "AI_PROVIDER_ERROR");

  // Known direct Outstanding evidence may be preserved, but the novel
  // FRIEGHT value must not be invented/applied when AI is unavailable.
  assert.equal(out.total, 1700);
  assert.equal(Number(out.freightAmount || 0), 0);
  assert.notEqual(out.financialAdjustments.reconciliationStatus, "MATCH");
  assert.equal(
    out.financialAdjustments.reconciliationStatus,
    "REVIEW_TOTAL_MISMATCH",
  );
});

test("AI request is compact, text-only and strict structured output", async () => {
  const raw = rawFixture("B-3339");
  const invoice = normalizeDocumentIntelligenceResult(raw);
  const evidence = buildResolutionEvidence(raw, invoice);
  const issues = detectInvoiceIssues(invoice);

  let body;
  await requestAiMappings({
    config,
    supplierName: invoice.vendorName,
    invoice,
    issues,
    evidence,
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return provider({
        needs_review: true,
        mappings: [],
      });
    },
  });

  const serialized = JSON.stringify(body);
  assert.doesNotMatch(serialized, /contentBase64|base64Source/i);
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, "json_schema");
  assert.equal(body.text.format.strict, true);
  assert.ok(serialized.length < 18000);
});
