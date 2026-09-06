# Chapter V2-03 — Inventory Cost, Receipt Lots, Ageing & FIFO

Source implementation is present for deterministic landed cost, receipt lots,
true receipt ageing and FIFO analytical rotation. The production database
migration must still be applied and verified.

Existing POS sale stock deduction and sale-time cost snapshot behavior remain unchanged.
Landed cost is stored historically on purchase lines/receipt lots and can be consumed by
margin intelligence without silently changing existing sales accounting.

Legacy/opening/transfer stock without receipt provenance is explicitly shown as
UNTRACKED rather than receiving a fabricated age.

<!-- PRODUCT_MASTER_REAL_CATALOGUE_20260831 -->
## Product creation stock invariant

Opening Stock is no longer a Product Master input. New normal and bulk-created
Products start with inventory quantity 0 and no OPENING_STOCK movement. Receipt
lots, landed cost, ageing and FIFO provenance therefore begin at controlled
Receive Stock, not at catalogue creation.
