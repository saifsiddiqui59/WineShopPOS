# WineShopPOS Documentation

Current branch documentation generation: **V3**

`docs/CURRENT_VERSION` is authoritative for this branch and must remain `v3`.

## Current V3
- `versions/v3/README.md`
- `versions/v3/architecture/`
- `versions/v3/reference/`
- `versions/v3/security/`
- `versions/v3/testing/`

## Previous deployed generations
- `versions/v2/` — previous/current PROD lineage inherited from main for traceability
- `versions/v1/` — historical early/basic generation

## Shared
- `shared/governance/`
- `shared/templates/`
- `shared/security/`
- `shared/release/`

## Backup provenance
- `backups/prod/`

## Version rule

A feature-origin label does not automatically define the deployed product version.
V3-origin work already deployed before formal V3 promotion remains recorded in
V2 PROD-delta history, while the same feature may also be CURRENT in V3.

Current V3 source + current V3 migrations + verified DEV/UAT evidence override
older V1/V2 history when determining V3 behavior.
