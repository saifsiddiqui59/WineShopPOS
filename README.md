# WineShopPOS

**Current product/documentation generation: V2**

WineShopPOS is an existing production multi-shop Wine Shop POS application
covering POS, barcode scanning, payments, inventory, purchasing, receiving,
returns, cashier operations, stock controls, owner intelligence, reporting,
OCR/offline foundations and the production WineShopPOS AI Owner Assistant.

## Production

`https://wineshoppos.z29.web.core.windows.net/`

## Current canonical documentation

- `docs/PROJECT_CONTEXT.md`
- `docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md`
- `docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
- `docs/AI_PRODUCTION_BASELINE.md`
- `docs/DOCUMENTATION_REGISTER.md`

## Chapter history

Chapters 1–26 remain historical implementation records.

V2 continues in the SAME chapter collection:

- `docs/chapters/V2-01-current-production-baseline.md`
- `docs/chapters/V2-02-discovery-feature-classification.md`
- `docs/chapters/V2-03-inventory-cost-lots-ageing-fifo.md`
- `docs/chapters/V2-04-controls-reasons-approvals.md`
- `docs/chapters/V2-05-customer-commercial.md`
- `docs/chapters/V2-06-purchase-intelligence.md`
- `docs/chapters/V2-07-operations-accounting.md`
- `docs/chapters/V2-08-reliability-security-hardware.md`
- `docs/chapters/V2-09-ai-production-quality.md`
- `docs/chapters/V2-10-full-application-qa-regression.md`
- `docs/chapters/V3-01-api-automation-integration.md`

## Source-of-truth rule

```text
CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED DEPLOYMENT
>
OLD DOCUMENTATION
```

V2 means:

```text
EXTEND + VERIFY + FIX
```

not:

```text
REWRITE + DUPLICATE + HOPE
```
