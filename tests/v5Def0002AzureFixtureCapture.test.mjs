import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const fixtures = [
  ["16845", "tests/fixtures/ocr/16845.azure-finance-raw.json"],
  ["B-3339", "tests/fixtures/ocr/B-3339.azure-finance-raw.json"],
  ["16805", "tests/fixtures/ocr/16805.azure-finance-raw.json"],
];

function textOf(fixture) {
  const ar = fixture.azureEvidence?.analyzeResult || {};
  const values = [];
  for (const page of ar.pages || []) {
    for (const line of page.lines || []) values.push(line.content || "");
  }
  for (const table of ar.tables || []) {
    for (const cell of table.cells || []) values.push(cell.content || "");
  }
  for (const pair of ar.keyValuePairs || []) {
    values.push(pair.key?.content || "");
    values.push(pair.value?.content || "");
  }
  return values.join("\n").toLowerCase();
}

test("DEF-0002: permanent Azure finance fixtures are real captured evidence", () => {
  const hashes = new Set();

  for (const [name, file] of fixtures) {
    assert.ok(fs.existsSync(file), `${name}: fixture missing`);
    const fixture = JSON.parse(fs.readFileSync(file, "utf8"));

    assert.equal(fixture.fixtureSchema, "WSP_AZURE_FINANCE_EVIDENCE_V1");
    assert.equal(fixture.devRef, "juhcypzoacauzmtzqnwd");
    assert.equal(fixture.synthetic, false, `${name}: fixture must never be synthetic`);
    assert.match(fixture.rawResultSha256, /^[a-f0-9]{64}$/);

    const ar = fixture.azureEvidence?.analyzeResult || {};
    const lineCount = (ar.pages || []).reduce(
      (sum, page) => sum + (page.lines || []).length,
      0,
    );
    const cellCount = (ar.tables || []).reduce(
      (sum, table) => sum + (table.cells || []).length,
      0,
    );

    assert.ok(lineCount > 20, `${name}: real page-line geometry missing`);
    assert.ok(cellCount > 20, `${name}: real semantic-table cells missing`);
    assert.ok((ar.documents || []).length >= 1, `${name}: prebuilt document fields missing`);

    hashes.add(fixture.rawResultSha256);
  }

  assert.equal(hashes.size, 3, "Each physical invoice must have a distinct raw Azure result.");
});

test("DEF-0002: B-3339 raw fixture contains actual finance vocabulary, not idealized test rows", () => {
  const fixture = JSON.parse(
    fs.readFileSync("tests/fixtures/ocr/B-3339.azure-finance-raw.json", "utf8"),
  );
  const text = textOf(fixture);

  assert.match(text, /discount/);
  assert.match(text, /freight/);
  assert.match(text, /tcs/);
  assert.match(text, /total/);

  // This fixture is intentionally raw. The parser regression added later
  // must consume this exact evidence instead of constructing clean fake
  // page lines for 599 / 700 / 5 / 88558.
  assert.equal(fixture.synthetic, false);
});
