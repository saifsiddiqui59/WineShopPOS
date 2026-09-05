# V2 PROD Deltas — V3-Origin Work Actually Deployed Before Formal V3 Promotion

Production/main baseline: `af1d40ed9534d7205316ec6ac7b682f6c5b481d1`

A V3-origin label records development provenance. These sections are retained because their source docs explicitly record production deployment/verification.

## Demo-ready production state (20260831T160407Z)

Source: `docs/PROJECT_CONTEXT.md`

### Demo-ready production state (20260831T160407Z)
V3 invoice reliability plus the demo fixes are deployed to the production static site. The invoice Email Function is 64-bit; Gmail IMAP and SMTP health passed; registered senders receive >4 MB rejection feedback; barcode handling was normalized/tolerance-tested; and ADMINs have a controlled whole-shop operational Demo/Test Data Reset. Production URL: https://wineshoppos.z29.web.core.windows.net/. Logic App remains every 5 minutes for acceptance testing; lowering recurrence for cost is a future task.

## V3-03B production state (20260831T195134Z)

Source: `docs/PROJECT_CONTEXT.md`

### V3-03B production state (20260831T195134Z)
V3-03 finance/product-prefill improvements and Bulk Product Import scanner capture are deployed to preview and production. Barcode feature `94e65616a4df66148dfcf1e9d8da13f6c7970d53` fixes the flash-then-blank input behavior. Logic App `wsp-v3-email-scheduler-53b6e9a1` is intentionally Disabled until testing resumes.

## V3-02/V3-03 production clarification

Source: `docs/PROJECT_CONTEXT.md`

### V3-02/V3-03 production clarification
The V3-02 Email receipt acknowledgement ("received; allow up to 1 hour to reflect"), >4 MB rejection feedback, invoice finance UX, barcode capture and the other previous-build features are already in the production/main baseline. The Email Logic App is intentionally Disabled after testing; that pause does not remove deployed Email code.

## V3-04 production state (20260901T055315Z)

Source: `docs/PROJECT_CONTEXT.md`

### V3-04 production state (20260901T055315Z)
Feature `7340fac6604d9e0e6281dd7c82070ffb818d4c9f` passed synthetic tests plus a live Azure Document Intelligence regression using the supplied METRI SPIRITS invoice before deployment was allowed. Semantic-table-first liquor OCR, review-safe Batch/MRP handling, validated case derivation, 6-decimal unit-cost precision and FIFO SELL FIRST/BOX guidance are deployed. METRI normalized total: ₹148,132 with MATCH reconciliation. Logic App remains Disabled.

## V3-07 production AI complete â€” 20260901T143945Z

Source: `docs/PROJECT_CONTEXT.md`



## V3 Demo Ready â€” Invoice Reliability, Email Feedback, Reset, Barcode

Source: `docs/chapters/V3-01-api-automation-integration.md`
