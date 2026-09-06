# Chapter V2-03 — Inventory Cost, Receipt Lots, Ageing & FIFO

Status: **Implement only where V2-02 proves functionality missing/partial.**

Scope:

- deterministic landed-cost engine
- receipt/batch lot traceability
- true stock ageing from receipt lots
- FIFO reporting/rotation foundation
- optional FEFO visibility where expiry data genuinely exists

Rules:

- business/database logic calculates landed cost; AI never calculates it
- historical landed cost must remain auditable/stable
- do not silently replace existing sale stock-deduction semantics
- stock-changing operations remain transaction-safe
