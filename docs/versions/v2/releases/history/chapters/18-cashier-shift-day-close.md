# Chapter 18 — Cashier Shift & Day Close

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Tie cashier activity to an auditable till shift.

## Database
`cashier_shifts` stores opening cash, Cash/UPI/Card totals, cash refunds, expected cash, actual cash, variance, approval and timestamps.

## Rules
- Cashier must have an OPEN shift before `complete_sale_v2` accepts a sale.
- Admin/Manager can bill without a cashier shift for administrative use.
- Close request snapshots payment totals.
- Expected cash = opening cash + cash payments - cash refunds.
- Manager/Admin approves CLOSE_REQUESTED to CLOSED.

## Tests
Open ₹5,000; sell ₹1,000 cash + ₹500 UPI; request close with ₹5,950 actual. Expected ₹6,000 and difference -₹50.
