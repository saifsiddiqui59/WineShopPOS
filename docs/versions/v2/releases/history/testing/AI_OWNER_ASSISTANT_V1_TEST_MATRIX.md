# AI Owner Assistant V1 — Verified Test Matrix

**Verified date:** 2026-08-30

| Test | Result |
|---|---|
| Function `/api/ai/health` | PASS |
| unauthenticated `/api/ai/chat` returns 401 | PASS |
| Supabase ADMIN login | PASS |
| dynamic ADMIN shop membership | PASS |
| `ai_resolve_context` | PASS |
| `ai_rate_limit_check` | PASS |
| `ai_log_activity` | PASS |
| `ai_get_sales_summary` | PASS |
| `ai_get_profit_summary` | PASS |
| `ai_get_inventory_health` | PASS |
| `ai_get_reorder_recommendations` | PASS |
| `ai_get_supplier_price_history` | PASS |
| `ai_get_product_stock_history` | PASS |
| `ai_get_shift_variances` | PASS |
| `ai_get_audit_exceptions` | PASS |
| `ai_get_expense_summary` | PASS |
| Foundry `agent_reference` direct call | PASS |
| deprecated `body.agent` rejection identified | PASS |
| full local Foundry tool loop | PASS |
| multiple tool calls in one response | PASS |
| function-call outputs returned to model | PASS |
| final grounded answer generated | PASS |
| Azure Function Central India | PASS |
| Function Consumption Y1 | PASS |
| managed identity present | PASS |
| Foundry project RBAC corrected | PASS |
| real Azure `/api/ai/chat` production path | PASS |

## Verified business-answer sample

The end-to-end diagnostic question:

`How is my shop performing today?`

successfully used multiple business tools and returned the expected current facts for the test shop, including sales, profit, expenses, audit exceptions and shift variance information.

## Required tenant-isolation regression suite

- ADMIN A → own Shop A: PASS required
- ADMIN A → unauthorized Shop B: DENY required
- ADMIN B → own shop: PASS required
- MANAGER/CASHIER → Owner AI: DENY under current V1
- tampered shop ID from another organization: DENY
- ALL scope → only authorized ADMIN shops inside resolved organization
