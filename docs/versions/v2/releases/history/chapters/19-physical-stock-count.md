# Chapter 19 — Physical Stock Count

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Use barcode scanning to perform a controlled physical count and post only approved discrepancies.

## Database
- `stock_counts`
- `stock_count_items`

Creating a count snapshots every active SKU's current system quantity. Scanning increments counted quantity. Manual quantity is available for cases/shelves where scanning every unit is impractical.

Unscanned SKUs remain NULL rather than silently becoming zero. A deliberate **Mark Unseen = 0** step is required before submission. Approval replaces system quantity with counted quantity and creates both stock-adjustment and `STOCK_COUNT` movement records.

## Tests
Count expected 26 as 24 → submit → approval produces -2 movement. Cancel/unfinished count must never modify inventory.
