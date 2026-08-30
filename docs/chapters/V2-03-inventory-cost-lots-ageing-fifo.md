# Chapter V2-03 — Inventory Cost, Receipt Lots, Ageing & FIFO

Source implementation is present for deterministic landed cost, receipt lots,
true receipt ageing and FIFO analytical rotation. The production database
migration must still be applied and verified.

Existing POS sale stock deduction and sale-time cost snapshot behavior remain unchanged.
Landed cost is stored historically on purchase lines/receipt lots and can be consumed by
margin intelligence without silently changing existing sales accounting.

Legacy/opening/transfer stock without receipt provenance is explicitly shown as
UNTRACKED rather than receiving a fabricated age.
