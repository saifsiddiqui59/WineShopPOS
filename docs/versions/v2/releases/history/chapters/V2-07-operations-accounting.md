# Chapter V2-07 — Accounting & Leakage Controls

**Status: implemented in source; production verification required**

## N7 Accountant / Tally-ready Export

Reports now include a balanced ledger-oriented export with:

- date
- voucher type
- voucher number
- ledger
- debit
- credit
- reference
- narration
- source type/id

Coverage includes:

- sales receipts
- store-credit/gift-voucher tender
- sales revenue
- purchases
- expenses
- supplier payments

This is accountant/Tally-ready data. Exact Tally ledger names and import configuration
must still be validated by the accountant for the target Tally company.

## N14 Leakage Shield Expansion

Existing loss-control exceptions are preserved and extended with:

- high-discount sale
- repeated approved POS overrides
- high manual store-credit grants
- high-value gift-voucher issuance

Signals are explicitly neutral review flags, not accusations.
