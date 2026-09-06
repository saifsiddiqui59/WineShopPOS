# WineShopPOS V2 — Critical Regression Protection Matrix

| Flow | Risk | Required regression |
| --- | --- | --- |
| Login/session | HIGH | valid/invalid/expired/disabled access |
| Scan → cart → payment → sale → stock → receipt | HIGH | full sale with inventory verification |
| Purchase/receive → stock movement | HIGH | transaction integrity and history |
| Return/refund | HIGH | approval, inventory restoration and refund record |
| Sale void | HIGH | permission, reversal and audit |
| Shift open/close | HIGH | role and manager approval |
| Physical count/adjustment | HIGH | variance, reason, audit and stock |
| Transfer | HIGH | source/destination isolation and transaction safety |
| Multi-shop/RLS | CRITICAL | ORG_A must never access ORG_B |
| Offline queue | HIGH | replay/idempotency/duplicate prevention |
| OCR | MEDIUM/HIGH | review-before-inventory boundary |
| Owner Center | MEDIUM | correct shop/organization data |
| AI Owner Assistant | HIGH | tenant correctness; AI failure cannot break POS |
