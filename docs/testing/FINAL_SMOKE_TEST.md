# Final WineShopPOS Smoke Test

1. Login as Shop ADMIN.
2. Dashboard loads Supabase data.
3. Products shows seeded products.
4. Search barcode `8900000010016`.
5. POS sells one bottle.
6. Inventory decreases by one.
7. Sale appears in Sales.
8. Receive a purchase.
9. Inventory increases.
10. Add a new product.
11. Refresh browser; product remains.
12. Create Manager/Cashier in Users.
13. Login as Cashier; restricted menus are hidden.
14. Disable shop using `shops.access_enabled=false`; app shows subscription blocked.
15. Re-enable shop.
16. `npm run build` passes.
17. Azure static URL opens from another device.
