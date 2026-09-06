# WineShopPOS

WineShopPOS is a production-oriented, multi-shop wine retail POS and inventory SaaS built with React/Vite, Supabase and Azure.

## Current product modules

1. POS & Billing
2. Products
3. Purchases & Suppliers
4. Inventory
5. Operations
6. Owner Center
7. Reports & Compliance
8. Settings & Admin

The application includes barcode-first billing, product/inventory management, procurement, suppliers, purchase orders/GRN, returns/refunds, cashier shifts, physical stock count, transfers, expenses, customer credit, audit/loss workflows, reporting, thermal receipts, invoice OCR and multi-shop administration.

## Ask WineShopPOS — PRO

The AI Owner Assistant is now a verified production milestone.

ADMIN users can open **Owner Center → Ask WineShopPOS** and ask natural-language questions about business performance, including sales, profit, stock health, reorder priorities, supplier price history, stock movement, expenses, shifts and operational exceptions.

The AI is grounded through controlled WineShopPOS business tools. Shop/organization access is derived dynamically from the currently logged-in user's Supabase session.

## Technology

- Frontend: React + Vite
- Database/Auth/RLS: Supabase PostgreSQL + Supabase Auth
- Production static hosting: Azure Blob Static Website
- Invoice OCR: Azure AI Document Intelligence
- AI gateway: Azure Functions, Central India, Consumption Y1
- AI: Microsoft Foundry, South India, `gpt-5-mini`
- AI identity: Azure Function system-assigned managed identity

## Production

- App: `https://wineshoppos.z29.web.core.windows.net/`
- Azure resource group: `wineshopPOS`

## Roles

- ADMIN: full authorized shop administration, Owner Center, AI, users and settings
- MANAGER: operational management, inventory, products, purchases, suppliers, reports and approved workflows
- CASHIER: POS-focused workflows, receipts, shifts and limited operational access

## Documentation

Start with:

- `docs/PROJECT_CONTEXT.md`
- `docs/README.md`
- `docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
- `docs/ai/AI_OWNER_ASSISTANT_V1.md`
- `docs/ai/AZURE_SUPABASE_CONFIGURATION.md`
- `docs/ai/SECURITY_AND_TENANT_ISOLATION.md`
- `docs/ai/DEPLOYMENT_RUNBOOK.md`
- `docs/testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md`
- `docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt`

## Core inventory rule

Product Master defines products. Inventory is maintained in bottles. Purchases/receiving increase stock; sales/approved stock-changing workflows reduce or adjust stock through controlled transactional backend/database operations.

Inactive historical products are retained rather than destructively deleted.
