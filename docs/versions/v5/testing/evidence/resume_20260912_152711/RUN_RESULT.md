# V5 Extended Certification Resume — Failure Evidence

- Environment: **DEV / QA only**
- Result: **FAIL**
- Classification: **HARNESS_SELECTOR_AMBIGUITY**
- Application defect serial: **none**
- PROD mutation: **none**
- Golden invoices: **PASS**
- 29-product purchase: **PASS**
- Duplicate purchase protection: **PASS**
- Existing first CASH sale: **PASS**
- Failure point: second resumed POS sale.

## Diagnosis

Two active Product Master rows legitimately share the display name `Budweiser Beer` but represent different SKUs/sizes (330 ml and 650 ml). The automated test searched by product name and clicked the first matching result. The intended second SKU was not uniquely selected; the already-tested 650 ml SKU was sold again.

The authoritative DEV database confirmed the second sale was a valid one-bottle CASH sale, but for the wrong product ID from the certification plan. This is a Playwright selector/harness issue, not a POS inventory/database defect.

## Evidence policy

This public repository stores sanitized text evidence and cryptographic hashes. Raw browser traces/session artifacts are intentionally not committed to the public repository because they may contain authentication/session data.
