import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const purchases = fs.readFileSync("src/pages/Purchases.jsx", "utf8");
const automation = fs.readFileSync("src/pages/AutomationHub.jsx", "utf8");
const ocr = fs.readFileSync("supabase/functions/ocr-invoice/index.ts", "utf8");
const migration = fs.readFileSync(
  "supabase/migrations/20260912124500_v5_invoice_ocr_resolution_memory.sql",
  "utf8",
);
const failureRegister = fs.readFileSync(
  "docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md",
  "utf8",
);

test("manual correction remains for header, line, finance and printed total", () => {
  assert.match(purchases, /Supplier<input/);
  assert.match(purchases, /Invoice Number<input/);
  assert.match(purchases, /Invoice Date<input/);
  assert.match(purchases, /value=\{r\.caseCount\}/);
  assert.match(purchases, /value=\{r\.unitsPerCase/);
  assert.match(purchases, /value=\{r\.ratePerCase\}/);
  assert.match(purchases, /value=\{r\.lineAmount\}/);
  assert.match(purchases, /Cash \/ Supplier Discount/);
  assert.match(purchases, /Reviewed Printed Invoice Total/);
  assert.match(purchases, /totalSource:"MANUAL"/);
});

test("OCR resolver preserves V5 server-authoritative ingestion handoff and fail-open manual fallback", () => {
  const invokerStart = automation.indexOf("async function invokeOcrWithRetry");
  const analyzeStart = automation.indexOf("async function analyze()", invokerStart);
  assert.ok(invokerStart >= 0 && analyzeStart > invokerStart);

  const invokerBlock = automation.slice(invokerStart, analyzeStart);
  assert.match(
    invokerBlock,
    /invokeOcrWithRetry\s*\(\s*contentBase64\s*,\s*contentType\s*,\s*ingestionId\s*=\s*null\s*\)/,
  );
  assert.match(invokerBlock, /supabase\.functions\.invoke\(\s*["']ocr-invoice["']/);
  assert.match(
    invokerBlock,
    /body\s*:\s*\{\s*contentBase64\s*,\s*contentType\s*,\s*ingestionId\s*\}/,
  );

  const analyzeBlock = automation.slice(analyzeStart);
  const callStart = analyzeBlock.indexOf("const data = await invokeOcrWithRetry(");
  assert.ok(callStart >= 0);
  const callEnd = analyzeBlock.indexOf(");", callStart);
  assert.ok(callEnd > callStart);
  const callBlock = analyzeBlock.slice(callStart, callEnd + 2);
  assert.match(callBlock, /nextIngestionId/);

  assert.match(automation, /p_normalized_invoice: data\.invoice/);
  assert.match(automation, /purchasing\/receive\?ingestion=\$\{ingestionId\}/);
  assert.doesNotMatch(automation, /purchaseDraftWithAssist/);
  assert.match(ocr, /normalizeDocumentIntelligenceResult\(result\)/);
  assert.match(ocr, /resolveInvoiceExceptions/);
  assert.match(ocr, /RESOLVER_FAIL_OPEN_TO_MANUAL_REVIEW/);
});

test("learning occurs after successful human receive, not autonomous AI self-training", () => {
  assert.match(purchases, /recordOcrLearning/);
  assert.match(purchases, /invoice_ocr_record_review/);
  assert.match(purchases, /await recordOcrLearning\(\)\.catch/);
  assert.match(migration, /HUMAN_CONFIRMED_AI/);
  assert.match(migration, /v_outcome='CONFIRMED'/);
  assert.match(migration, /v_outcome='OVERRIDDEN'/);
  assert.match(migration, /set status='REJECTED'/);
  assert.match(migration, /unique\(shop_id,supplier_key,field_scope,normalized_label\)/);
  assert.doesNotMatch(migration, /unique\(shop_id,supplier_key,field_scope,canonical_field,normalized_label\)/);
  assert.match(migration, /enable row level security/i);
  assert.match(
    migration,
    /revoke all on public\.invoice_ocr_field_aliases/i,
  );
});

test("existing product alias learning remains intact", () => {
  assert.match(automation, /remember_product_alias/);
});

test("executor failure registry records all V5 resolver executor failures discovered before deployment", () => {
  assert.match(
    failureRegister,
    /V5_BRANCH_SPECIFIC_PATCH_ANCHOR_MISMATCH_20260912/,
  );
  assert.match(
    failureRegister,
    /V5_AI_EVIDENCE_BUDGET_AND_STATIC_ASSERTION_20260912/,
  );
  assert.match(
    failureRegister,
    /V5_STATIC_CONTRACT_ASSERTION_FALSE_NEGATIVE_20260912/,
  );
  assert.match(
    failureRegister,
    /V5_R4_RESOLVER_ROUTE_AND_AUTOMATION_WRITE_OMISSION_20260912/,
  );
  assert.match(
    failureRegister,
    /V5_R5_MANUAL_DATE_TRUSTED_PARTIAL_AND_STALE_OUTAGE_TEST_20260912/,
  );
  assert.match(failureRegister, /session handoff assist metadata count=0/);
  assert.match(failureRegister, /direct finance evidence/i);
  assert.match(failureRegister, /semantic data flow/);
  assert.match(failureRegister, /default-branch code search is discovery only/);
  assert.match(failureRegister, /human date-review\/candidate-selection flow/);
  assert.match(failureRegister, /genuinely AI-dependent novel\/ambiguous/);
});
