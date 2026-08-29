# WineShopPOS Current Project Context

## Repository

GitHub:

`saifsiddiqui59/WineShopPOS`

Local Windows folder:

`E:\WineShopPOS`

Git Bash:

`/e/WineShopPOS`

Branch:

`main`

## Technology

- React
- Vite
- JavaScript
- React Router
- Lucide React
- CSS
- Browser LocalStorage for current MVP

## LocalStorage keys

- `wineshop_products_v1`
- `wineshop_inventory_v1`
- `wineshop_sales_v1`
- `wineshop_purchases_v1`

## Product seed

`src/data/products.js`

contains approximately 50 dummy Indian-market products.

Barcodes/prices are development data only.

## Current completed modules

- Dashboard
- POS Billing
- barcode scanning
- manual product search
- cart
- discount
- Cash / UPI / Card
- optional UPI/Card payment reference
- sale completion
- invoice details
- browser print preview
- Product Master
- Add Product
- Edit Product
- activate / deactivate Product
- Inventory
- Receive Stock
- case + loose-bottle purchase handling
- Purchase History
- Sales History
- Reports
- JSON Export
- JSON Import
- Demo Reset

## Important inventory rules

Product Master = what the item is.

Inventory = how many sellable bottles exist.

Purchases increase inventory.

Sales decrease inventory.

Cases are converted to individual bottle quantities.

Editing product information does not directly overwrite stock.

Inactive products remain historically referenced and cannot be sold/received.

## Current persistence limitation

This is still a single-browser prototype.

LocalStorage is not suitable for a final multi-user shop.

## Planned production backend

Later chapters will introduce:

- Supabase PostgreSQL
- database tables
- transactional stock functions
- Supabase Auth
- ADMIN / MANAGER / CASHIER roles
- RLS
- secure inventory mutations
- audit / stock movements

## Hosting plan

Frontend can be statically hosted on Azure.

Production architecture may later use Azure Static Web Apps or another frontend host depending on authentication/routing needs.

## Scanner test barcode

`8900000010016`

Dummy product:

Kingfisher Strong 650ml
