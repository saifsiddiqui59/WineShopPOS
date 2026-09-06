# Chapter 21 — Supplier & Purchase Improvements

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Extend receiving into a procurement/ledger workflow.

## Database
- `purchase_orders`, `purchase_order_items`
- `supplier_payments`
- `purchase_returns`, `purchase_return_items`
- purchases may reference `purchase_order_id`.

## Workflow
Create PO → mark sent → receive full/partial quantities → regular `receive_purchase` updates inventory → supplier balance = received purchases - supplier payments - completed purchase returns.

Supplier return validates on-hand stock, deducts quantity and creates `SUPPLIER_RETURN` stock movements.

`purchase_price_history` provides historical unit purchase price by invoice. The Price History UI calculates oldest-to-latest percentage change.

## Tests
Create PO 24 bottles; receive → inventory +24. Record supplier payment → balance falls. Return 2 bottles → inventory -2 and balance falls by returned value.
