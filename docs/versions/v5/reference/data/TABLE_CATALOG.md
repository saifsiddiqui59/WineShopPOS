# V5 Table / Data Object Catalog

Status: **CURRENT V5 CURATED DELTA + INHERITED V4 BASELINE**

The complete previous deployed baseline remains documented under:

`docs/versions/v4/reference/data/TABLE_CATALOG.md`

V5 promotion must reconcile this repository model with live PROD before applying
any migration. A filename containing `v5` does not prove that the migration is
absent from PROD.

## V5 business objects directly used by the purchase/OCR work

| Object | Role |
|---|---|
| `shops` | tenant/shop boundary |
| `user_shop_memberships` | user-to-shop authorization |
| `products` | Product Master |
| `categories` | Product category ownership |
| `suppliers` | supplier master |
| `inventory` | current stock |
| `stock_movements` | stock audit movement history |
| `purchases` | posted purchase header |
| `purchase_items` | posted purchase lines |
| `inventory_receipt_lots` | purchase/FIFO receipt-lot state |
| `invoice_ingestions` | retained OCR/original-invoice ingestion state |
| `product_aliases` | remembered supplier/OCR product aliases |
| `purchase_item_corrections` | audited completed-purchase corrections |
| `shop_verification_policies` | shop financial-verification tolerances |
| `purchase_verification_resolutions` | audited financial verification decisions |
| `product_enrichment_cache` | shop-scoped product-enrichment cache |

## Important V5 RPC/function surfaces

- `receive_purchase_v3`
- `get_purchase_item_corrections`
- `correct_received_purchase_item`
- `get_purchase_verification_state`
- `resolve_purchase_financial_exception`
- `reopen_purchase_financial_exception`
- `resolve_product_master_text`
- `remember_product_alias`
- existing shop-access / role assertions
- existing purchase landed-cost and audit helpers

## Important migration evidence

V5 functionality is represented by version-controlled migration files including:
- purchase correction / OCR pack safety;
- purchase verification resolution engine;
- product resolver / enrichment cache;
- purchase identity / legitimate repeated lines;
- atomic purchase Product Master + OCR learning.

The exact `main..V5` migration file delta must be regenerated immediately before
PROD deployment and reconciled against live PROD migration/schema state.

## Authority

Repository migrations + current source + read-only live PROD schema/migration
verification are authoritative for promotion decisions. This catalog is a
curated navigation aid.
