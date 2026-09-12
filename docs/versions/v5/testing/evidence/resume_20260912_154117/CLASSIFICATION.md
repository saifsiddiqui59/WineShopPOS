# Failure Classification — Shift Close

- Classification: **HARNESS_STALE_EXPECTED_CASH**
- Application defect serial: **none**
- Environment: **DEV / QA only**
- PROD mutation: **none**

## What happened

The certification harness read `cashier_shifts.expected_cash` while the shift was still `OPEN` and passed that stale value as `p_actual_cash` to `request_close_shift`.

The database function `request_close_shift` is authoritative. It calls `shift_totals(shift_id)`, recalculates cash/UPI/card/refund totals and final expected cash, then stores `actual_cash`, `expected_cash`, and `cash_difference`.

For the failed run, the authoritative closed-shift values were:

- cash sales: 735.00
- cash refunds: 260.00
- expected cash: 475.00
- harness-supplied actual cash: 0.00
- cash difference: -475.00

The application therefore calculated the shift correctly. The test harness supplied an incorrect actual-cash value because it used the pre-close `expected_cash`.

## Required harness correction

Before `request_close_shift`, call `shift_totals(shift_id)` and use its returned `expected_cash` as the test's counted cash value.

The already-closed failed-run shift must not be reused. Certification continues with a fresh targeted shift-close verification, then analytics/report/final-ledger validation without repeating OCR, the large purchase, or the completed sales/return set.
