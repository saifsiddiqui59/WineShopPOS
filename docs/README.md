# WineShopPOS Documentation

This folder contains the current production documentation for WineShopPOS.

## Current application

WineShopPOS is beyond the original Chapters 1–15/1–26 implementation and now uses the reconsolidated eight-module SaaS structure:

1. POS & Billing
2. Products
3. Purchases & Suppliers
4. Inventory
5. Operations
6. Owner Center
7. Reports & Compliance
8. Settings & Admin

## Current cloud architecture

```text
Barcode Scanner
    ↓
React/Vite
    ↓
Supabase Auth
    ↓
Supabase PostgreSQL + RLS + transactional RPCs
    ↓
Azure Blob Static Website
```

Additional services:

- Azure AI Document Intelligence for purchase-invoice OCR
- Azure Function App for the AI trust boundary
- Microsoft Foundry for Ask WineShopPOS PRO

## AI milestone

**Ask WineShopPOS PRO is verified working end-to-end.**

Production AI:

- Function App: Central India / Consumption Y1
- Foundry: South India
- Model: `gpt-5-mini`
- Agent: `WineShopPOS-Owner-Agent`
- Auth: existing logged-in Supabase session
- Shop authorization: dynamic membership resolution
- AI V1: controlled read-only business insights

## Canonical documents

### Product/user

- `manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
- `manual/WineShopPOS_User_Manual_Master_Reconsolidation.docx`

### Current-state/context

- `PROJECT_CONTEXT.md`
- `handoff/NEXT_CHAT_CONTEXT.txt`
- `handoff/NEXT_CHAT_CONTEXT_AI_V1.txt`

### AI

- `ai/AI_OWNER_ASSISTANT_V1.md`
- `ai/AZURE_SUPABASE_CONFIGURATION.md`
- `ai/SECURITY_AND_TENANT_ISOLATION.md`
- `ai/DEPLOYMENT_RUNBOOK.md`
- `ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md`
- `ai/AI_OBSERVABILITY_EVALUATION_PLAN.md`

### Testing

- `testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md`
- `testing/FINAL_SMOKE_TEST.md`
- `testing/TEST_MATRIX.md`

### History

Historical chapter documentation remains useful for implementation history, but it must not be treated as the current application state.
