# WineShopPOS Documentation

**Current documentation generation: V3**

WineShopPOS maintains one living Handbook, one living User Manual and one
current Project Context. V2 updates the existing master documents rather than
creating competing copies.

## Canonical current documents

- `PROJECT_CONTEXT.md`
- `handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md`
- `manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
- `AI_PRODUCTION_BASELINE.md`
- `DOCUMENTATION_REGISTER.md`

## Historical + V2/V3 chapters

The same `docs/chapters/` collection is used for project history.

- Chapters `01` through `26`: historical implementation record
- Chapters `V2-01` through `V2-10`: completed V2 implementation/QA program
- Chapter `V3-01`: current API Automation / invoice-ingestion program

## V2 execution records

- `v2/MASTER_IMPLEMENTATION_SPECIFICATION_V2.md`
- `v2/audit/`
- `v2/evidence/`

These are execution/evidence artifacts, not duplicate manuals.

## Documentation rule

When an application feature changes, update all affected current documents in
the same implementation batch:

1. Project Context when architecture/current status changes
2. existing master Developer Handbook
3. existing master User Manual when the user workflow changes
4. AI Production Baseline when AI deployment/runtime changes
5. relevant V2 chapter
6. V2 implementation/audit record

<!-- CURRENT_DOC_STATUS_START -->
## Current V2 documentation status

Canonical current sources:

1. `PROJECT_CONTEXT.md`
2. `handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md`
3. `manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
4. `AI_PRODUCTION_BASELINE.md`
5. `chapters/V2-01...V2-10`
6. `v2/audit/`

Current documentation covers N1–N15, OCR product resolution, POS/billing
controls, customer commercial features, accounting export, supplier
intelligence, Leakage Shield and responsive POS/receipt UI.
<!-- CURRENT_DOC_STATUS_END -->
