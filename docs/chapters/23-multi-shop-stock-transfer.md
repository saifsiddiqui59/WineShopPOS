# Chapter 23 — Multi-Shop Stock Transfer

Status: Implemented in Chapters 16–26 production-expansion release.

## Architecture decision
The existing Chapter 15 `shop_id` model separated **customers/tenants**. It was unsafe to assume every shop belonged to the same owner. Chapter 23 adds `organizations`; existing shops are initially placed into separate organizations. Only shops intentionally assigned to the same organization become branches eligible for transfers.

## Workflow
Source Manager/Admin requests transfer. No inventory changes yet. Destination Manager/Admin approves. Approval locks source stock, revalidates quantity, creates/copies destination product by barcode if needed, subtracts source, adds destination, and posts paired `TRANSFER_OUT` / `TRANSFER_IN` movements in one transaction.

## Tests
- Unrelated organizations cannot appear as destinations.
- Request does not alter stock.
- Approval -24 source/+24 destination.
- Insufficient source stock at approval rejects entire transaction.
