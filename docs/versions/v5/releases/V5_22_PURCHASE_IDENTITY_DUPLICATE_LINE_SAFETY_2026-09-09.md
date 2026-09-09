# V5.22 — Purchase identity + legitimate repeated-line safety

Date: 2026-09-09
Branch: V5
Starting SHA: runtime `origin/V5` fetched by the executor
Environment: V5 DEV/QA only

## Real invoice evidence

Kapil Alcotech invoice 16845 contains legitimate repeated product-family rows with
different MRP/rate/pack values. Those rows must not be rejected merely because they
resolve to the same Product Master.

The same UAT exposed a more serious issue: a Hoegaarden 500 ml invoice line could
resolve to a Hoegaarden 330 ml Product Master and still become READY.

## New invariants

A purchase line is READY only when:
- Product Master exists;
- integer quantity identity is valid;
- pack is resolved;
- Price/Bottle is below MRP when MRP is known;
- preserved invoice size does not conflict with Product Master size;
- explicit bottle/can evidence does not conflict;
- cautious product name/brand identity does not conflict;
- a scanned physical barcode does not conflict with an already-known Product Master barcode;
- suspicious exact repeated OCR evidence has been human-reviewed.

Repeated Product Master rows with different commercial values are legitimate and
remain separate purchase items.

The DEV database independently validates invoice size and physical scanned barcode,
then inserts every purchase line separately so repeated Product Master rows retain
their own batch/expiry and receipt lot.

No PROD mutation is permitted by this release.
