# Chapter 15 — Supabase Live Data Integration

Status: COMPLETE for current cloud MVP.

## Source of truth

Business data now uses Supabase instead of LocalStorage:

- products
- categories
- suppliers
- inventory
- purchases
- purchase items
- sales
- sale items
- payments
- stock movements
- stock adjustments

## Transaction safety

Stock-changing operations use PostgreSQL RPCs:

- `create_new_product()`
- `receive_purchase()`
- `adjust_stock()`
- `complete_sale()`

This prevents the browser from directly mutating inventory.

## Roles

### Platform owner
Outside shop tenancy. Controls:
- first Shop ADMIN
- subscription
- kill switch

### ADMIN
- all shop screens
- create Manager/Cashier
- products
- inventory
- purchases
- reports
- settings
- POS

### MANAGER
- products
- inventory
- purchases
- reports
- POS
- sales

### CASHIER
- dashboard
- POS
- own sales view

## Subscription Kill Switch

`shops.access_enabled = false` blocks shop application data through RLS/RPC checks.

## OCR roadmap

Purchase invoice OCR is intentionally not enabled because Azure AI Document Intelligence credentials/resource are not configured.

Safe target flow:

invoice PDF/photo
-> OCR
-> supplier/invoice/line extraction
-> product matching
-> human review
-> `receive_purchase()`

OCR must never update stock without confirmation.

## Hosting

Frontend target:
Azure Storage static website `$web`.

HashRouter is used for SPA routing.
