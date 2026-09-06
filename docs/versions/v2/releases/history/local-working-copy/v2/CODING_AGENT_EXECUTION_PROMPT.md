# WineShopPOS V2 — Coding Agent Execution Handoff

You are operating on the actual synchronized WineShopPOS `main` repository.

Before changing feature code, read in this order:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/v2/MASTER_IMPLEMENTATION_SPECIFICATION_V2.md`
3. `docs/v2/audit/FEATURE_MATRIX.md`
4. `docs/v2/audit/ROUTE_INVENTORY.md`
5. `docs/v2/audit/BUTTON_ACTION_INVENTORY.md`
6. `docs/v2/audit/ROLE_SECURITY_INVENTORY.md`
7. `docs/v2/audit/API_RLS_RPC_INVENTORY.md`
8. `docs/v2/audit/DEPLOYMENT_REPOSITORY_DRIFT.md`
9. `docs/v2/audit/REGRESSION_PROTECTION_MATRIX.md`
10. current source/migrations/tests

Mandatory behavior:

- refine every feature status using source-level evidence
- do not rebuild working features
- do not create a second AI Function/Foundry project/model/Owner Agent
- reconcile any production/repository drift deliberately
- implement controlled batches 1–10
- after each batch: build → tests → UI/function regression → security checks
- use transaction-safe backend/database operations for stock-changing flows
- enforce authorization in backend/RLS/RPC, not by UI hiding
- update the relevant V2 chapter and implementation ledger with evidence
- use logical Git commits, not one giant commit
- complete the full application button/route/role/API/UI audit
- do not mark physical hardware tests PASS without physical hardware
- do not mark backup restore PASS without a controlled restore
- AI failure must never break POS

Do not stop at a plan. Continue implementation until blocked by a real
environment/credential/hardware dependency. Record every block precisely.
