import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const purchases=fs.readFileSync("src/pages/Purchases.jsx","utf8");
const identity=fs.readFileSync("src/lib/purchaseIdentity.js","utf8");

test("15983 reviewed identity survives Purchases -> receiveStock transport",()=>{
  const startMarker='       items:payload.items.map(r=>({';
  const endMarker='       charges:payload.charges';

  const start=purchases.indexOf(startMarker);
  assert.ok(start>=0,"receiveStock mapping start marker missing");

  const end=purchases.indexOf(endMarker,start);
  assert.ok(end>start,"receiveStock mapping end marker missing");

  const block=purchases.slice(start,end);

  const raw='sourceDescription:r.sourceDescription||""';
  const reviewed='reviewedSourceDescription:r.reviewedSourceDescription||""';
  const invoice='invoiceSizeMl:Number(r.invoiceSizeMl||0)';

  assert.ok(block.includes(raw),"raw OCR identity must remain transported");
  assert.ok(block.includes(reviewed),"human-reviewed identity must be transported");
  assert.ok(block.includes(invoice),"invoice size must remain transported");
  assert.ok(
    block.indexOf(raw)<block.indexOf(reviewed) &&
    block.indexOf(reviewed)<block.indexOf(invoice),
    "raw -> reviewed -> invoice identity transport order changed"
  );

  // The helper must know about the reviewed identity mechanism already
  // introduced by the earlier 15983 identity correction.
  assert.ok(
    identity.includes("reviewedSourceDescription"),
    "purchase identity helper does not contain reviewedSourceDescription support"
  );
});
