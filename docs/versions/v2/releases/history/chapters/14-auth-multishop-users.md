# Chapter 14 — Authentication, Multi-Shop Roles & User Management

## Hierarchy

PLATFORM OWNER / DEVELOPER
- creates/controls the first ADMIN for each shop
- controls subscription status / kill switch
- is stored separately in `platform_admins`
- is NOT a tenant/shop role

SHOP ADMIN
- manages its own shop
- can create MANAGER and CASHIER users
- cannot create another ADMIN
- can disable/re-enable Manager/Cashier users

MANAGER
- product/inventory/purchase/report/POS operational permissions

CASHIER
- POS-focused permissions

## Security

The browser never receives `service_role`.

`manage-shop-users` is a Supabase Edge Function.
It validates the logged-in caller is the shop ADMIN, then uses service-role only inside the server-side function.

## Kill Switch

`shops.access_enabled = false` blocks shop data/RPC access.

## OCR Purchase Roadmap

Recommended invoice-stock workflow:

Invoice image/PDF
-> Azure AI Document Intelligence prebuilt invoice model
-> supplier + invoice number + line items + quantity + unit price
-> match extracted items to Product Master
-> human review screen
-> user confirms
-> call `receive_purchase()`
-> inventory + stock movement updated transactionally

OCR must never directly change stock without user confirmation.
