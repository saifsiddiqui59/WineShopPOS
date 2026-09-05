# Chapter V2-01 — Current Production Baseline

Status: **Current-state baseline; verify repository/deployment evidence on every execution.**

## Application

WineShopPOS is an existing React/Vite production application with Supabase
backend architecture, multi-shop authorization and Azure static hosting.

## Critical preserved flows

- login
- scan → cart → pay → sale → inventory deduction → receipt
- purchase/PO/GRN → inventory increase → stock movement
- returns/refunds and sale void
- shifts and manager approval
- stock count/adjustment
- transfers
- RLS and multi-shop isolation
- offline queue
- OCR invoice review
- Owner Center
- existing AI Owner Assistant

Any change touching these flows is high risk until regression-tested.

## AI baseline

The existing Owner Assistant is production-working. Reuse:

- Function App `wineshoppos-ai-1a61d5885c` — Central India — Consumption Y1
- Foundry `wineshoppos-ai-in-1a61d5885c` — South India
- project `wineshoppos-ai`
- `gpt-5-mini` version `2025-08-07`
- logical agent `WineShopPOS-Owner-Agent`
- dynamic Supabase session/user authorization
- system-assigned Function managed identity for Foundry
