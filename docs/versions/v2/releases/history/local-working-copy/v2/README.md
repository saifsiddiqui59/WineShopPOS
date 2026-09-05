# WineShopPOS V2

Status: Active production-hardening and feature-completion program.

## Branding

All new implementation documentation uses **V2 chapter numbering** so that
legacy Chapters 1–26 remain historical and cannot be mistaken for current state.

## Principle

```text
REPOSITORY EVIDENCE > OLD ASSUMPTIONS
REUSE > DUPLICATE
BACKEND SECURITY > FRONTEND HIDING
BUTTON CLICKED ≠ BUTTON WORKING
BUSINESS ENGINE CALCULATES
AI EXPLAINS
```

## V2 chapter map

| V2 Chapter | Scope |
| --- | --- |
| V2-01 | Current production baseline |
| V2-02 | Discovery, feature classification and UI inventory |
| V2-03 | Landed cost, receipt lots, ageing and FIFO |
| V2-04 | Reason codes, discount/price override and approvals |
| V2-05 | Loyalty, promotions and gift vouchers |
| V2-06 | Supplier score and Purchase Coach expansion |
| V2-07 | Advanced transfers, Leakage Shield and accountant export |
| V2-08 | Offline, backup, RLS, multi-shop, scanner and printing |
| V2-09 | AI tracing, evaluation, quality gates and monitoring |
| V2-10 | Whole-application QA, security and final regression |

## Required evidence

See `audit/` and `evidence/`. A feature must not be marked complete from
documentation or button presence alone.
