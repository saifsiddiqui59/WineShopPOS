# WineShopPOS Documentation

## Completed Chapters

1. Project Foundation
2. UI Shell
3. Product Master
4. POS Billing
5. Barcode Scanner Integration
6. Local Inventory Engine
7. Receive Stock
8. Persistent Product Master
9. Payments & Sales
10. Dashboard
11. Reports
12. Backup
13. Azure Blob Static Hosting
14. Authentication, Multi-Shop Roles & Users
15. Supabase Live Data Integration

## Current Architecture

Barcode Scanner
→ React/Vite static frontend
→ Supabase Auth
→ Supabase PostgreSQL + RLS + RPCs
→ Azure Blob Static Website

## Roles

- Platform Owner: controls shop ADMIN + subscription/kill switch
- ADMIN: shop administration + Manager/Cashier creation
- MANAGER: inventory/products/purchases/reports/POS
- CASHIER: POS-focused access

## Cloud Source of Truth

Supabase is now the live source of truth for:
- products
- inventory
- purchases
- sales
- payments
- stock movements
- users/roles

## Production URL

`https://wineshoppos.z29.web.core.windows.net/`

## Future Enhancements

- Azure AI Document Intelligence invoice OCR
- 80mm receipt printer integration
- returns/refunds
- advanced tax/excise compliance
- custom domain
