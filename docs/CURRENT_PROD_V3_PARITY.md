# WineShopPOS — PROD / V3 Parity Tracker

Updated: 2026-09-05

This file is intentionally maintained with the same content on `main` and `V3`.
It records what is common, what is environment-specific, and what is still pending.
Do not infer parity from branch names alone.

## Environment binding

| Area | PROD (`main`) | DEV (`V3`) |
|---|---|---|
| Static site | `https://wineshoppos.z29.web.core.windows.net/` | `https://wspv35c9453b6e9a1.z29.web.core.windows.net/` |
| Supabase ref | `uiurgplnsgmawvxhjzzp` | `juhcypzoacauzmtzqnwd` |
| Git branch | `main` | `V3` |
| Database rule | PROD only | DEV only |

Never point a non-main branch at PROD Supabase.
Never point `main` at DEV Supabase.

## Invoice OCR golden regression — invoice 16845

Expected values from the physical invoice:

- Invoice number: `16845`
- Invoice date: `26-08-2026`
- Product subtotal / assessable value: `175975`
- Carrying / forwarding: `1550`
- Cash / supplier discount: `1216`
- Other invoice deduction: `0`
- Stamp fee: `5`
- TCS: `3526`
- TCS + stamp + other additions: `3531`
- Printed invoice total: `179840`
- Expected calculated invoice: `179840`
- Expected reconciliation: `MATCH · ₹0.00`
- Expected total cases: `62`
- Expected loose bottles: `0`
- Expected final bottles: `864`

If OCR sees conflicting date-like values, the UI must require human date confirmation rather than guessing.

## Duplicate cash-discount defect

The confirmed defect was in frontend finance fallback semantics, not the core OCR label extraction.

A structured `otherDeductionAmount = 0` was treated as falsy and fell through to generic `discountAmount`, duplicating the same cash discount into **Other / Invoice Deduction**.

Correct rule:

- structured numeric zero is meaningful;
- use nullish fallback (`??`) rather than truthy fallback (`||`);
- do not deduplicate by comparing amounts because two legitimate deductions can have the same value.

## Current PROD state

Verified deployed on 2026-09-05:

- duplicate cash-discount fix: PASS
- invoice 16845 financial reconciliation: PASS
- OCR product-table totals footer: DEPLOYED
- expected footer: Cases `62`, Loose `0`, Final Bottles `864`, Invoice `₹1,75,975`, Reviewed `₹1,75,975`, Gap `MATCH · ₹0.00`
- production Windows app launcher: DEPLOYED
  - `WineShopPOS_Windows_App_Setup.cmd`
  - `WineShopPOS_Windows_App_Remove.cmd`
- current feature commit: `0dddf99f674ff5603aceaec11fa9ec6044817a6a`
- database changed by this release: NO
- Supabase changed by this release: NO
- Azure Function changed by this release: NO

## Current V3 state before parity repair

- duplicate cash-discount source fix: PRESENT
- OCR totals footer parity with PROD: PENDING
- Windows app launcher parity with PROD: PENDING
- V3 frontend Supabase: DEV `juhcypzoacauzmtzqnwd`
- shared Invoice API `wsp-v3-invoice-53b6e9a1`: PROD-bound to `uiurgplnsgmawvxhjzzp`
- result: DEV login token is rejected by that shared Invoice API and V3 can show `Sign in again`
- the existing PROD-bound Invoice API must NOT be rebound to DEV because production code also uses it
- V3 must use a separate DEV-only Invoice API (or an equivalent isolated DEV auth path)

Until V3 auth is repaired and browser UAT passes, V3 OCR is not end-to-end equivalent to PROD.

## Purchase / inventory invariant

OCR never changes inventory directly.

Expected flow:

`invoice evidence -> OCR -> human supplier/product/quantity/financial review -> controlled Receive Stock -> transaction-safe stock change`

Product creation alone must initialize zero stock and must not create opening inventory.

## Windows app launcher — customer sharing

Production customer-facing installer:

`WineShopPOS_Windows_App_Setup.cmd`

Recommended customer package:

- `WineShopPOS_Windows_App_Setup.cmd`
- optional `WineShopPOS_Windows_App_Remove.cmd`
- short README:
  `Download -> extract -> double-click WineShopPOS_Windows_App_Setup.cmd -> use the new WineShopPOS Desktop shortcut`

The setup:

- requires Windows + Microsoft Edge;
- does not require administrator rights;
- creates Desktop + Start Menu shortcuts;
- opens the production WineShopPOS site in Edge app mode;
- does not change browser policies;
- does not contain Supabase/Azure credentials.

Never share `.env` files, Supabase keys, Azure keys, repository access, or developer executors with customers.

## Promotion / parity rule

Before moving future OCR/purchase/UI changes between V3 and PROD:

1. compare exact touched files between `main` and `V3`;
2. preserve environment-specific URLs/keys;
3. run invoice 16845 golden regression;
4. run lint/build;
5. verify deployed bundle contains only the correct Supabase ref;
6. run authenticated browser UAT;
7. update this file on both branches with the same final status.

Source-of-truth order:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED DEPLOYMENT > OLD DOCUMENTATION`
