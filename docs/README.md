# WineShopPOS Documentation

**Current documentation generation: V2**

WineShopPOS maintains one living Handbook, one living User Manual and one
current Project Context. V2 updates the existing master documents rather than
creating competing copies.

## Canonical current documents

- `PROJECT_CONTEXT.md`
- `handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md`
- `manual/WineShopPOS_User_Manual_Master_Reconsolidation.md`
- `AI_PRODUCTION_BASELINE.md`
- `DOCUMENTATION_REGISTER.md`

## Historical + V2 chapters

The same `docs/chapters/` collection is used for project history.

- Chapters `01` through `26`: historical implementation record
- Chapters `V2-01` through `V2-10`: current V2 implementation/QA program

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
