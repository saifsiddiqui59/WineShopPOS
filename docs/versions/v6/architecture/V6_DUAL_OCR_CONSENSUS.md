# V6 Dual OCR Consensus — Document Intelligence + Azure Vision F0 + Existing App AI

## Goal

Use two independent OCR readings of the same supplier invoice, then let the existing WineShopPOS text AI compare direct evidence while deterministic accounting and inventory rules remain authoritative.

## Runtime

```text
Original invoice image/PDF
        |
        +--> Azure Document Intelligence F0
        |      prebuilt-invoice + semantic tables + key/value evidence
        |
        +--> Azure Vision ComputerVision F0
               Read 3.2 independent OCR text
        |
        +--> WineShopPOS cross-OCR consensus
               agreements are recorded
               conflicts become review targets
        |
        +--> existing WineShopPOS AI
               text/evidence mapping only
               one AI call maximum
               no image is sent to the model
        |
        +--> deterministic accounting/product/pack safety
        |
        +--> human confirmation only for unresolved/conflicting evidence
```

## Safety contracts

- Document Intelligence remains the primary structured invoice extractor.
- Azure Vision Read is a secondary OCR source; it cannot post inventory.
- The existing app AI receives text evidence IDs from both OCR engines; it never invents a value.
- Cross-OCR disagreements are never auto-applied. They remain human-review suggestions.
- A secondary total that agrees with accounting is still not silently substituted for unreadable printed evidence.
- Batch values are never inferred from invoice date.
- When both OCR engines independently agree on a batch value, the secondary consensus may clear the OCR batch-review flag.
- Vision failure is fail-open to the existing Document Intelligence/manual-review path; purchase/inventory safety is unchanged.
- Runtime can be disabled immediately with `WSP_SECONDARY_OCR_ENABLED=false` without removing code.

## Cost guard

Production provisioning accepts only Azure `ComputerVision` SKU `F0`. The release executor does not create or fall back to a paid SKU.

## API choice

The secondary path uses Azure Vision Read v3.2 because it accepts both images and PDF documents, allowing the same original file to be read independently from Document Intelligence. It is deliberately isolated behind an environment flag so the secondary provider can be replaced later without changing purchase/stock logic.
