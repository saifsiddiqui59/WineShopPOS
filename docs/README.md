# WineShopPOS Documentation

Current branch documentation generation: **V4**

`docs/CURRENT_VERSION` is authoritative for this branch and must remain `v4`
while V4 is under DEV/QA qualification.

## Current V4

- `versions/v4/README.md`
- `versions/v4/architecture/`
- `versions/v4/reference/`
- `versions/v4/security/`
- `versions/v4/testing/`
- `versions/v4/releases/`

## Inherited production lineage

- `versions/v3/` — verified PROD/V3 lineage inherited from pinned PROD/main
- `versions/v2/` — previous PROD lineage/history
- `versions/v1/` — historical early/basic generation

## Shared cross-version governance

- `shared/governance/`
- `shared/templates/`
- `shared/security/` when present
- `shared/release/`

## Version inheritance rule

Every new version inherits PROD's repository structure, coding conventions,
documentation governance, testing structure, migration discipline, security
controls, environment-isolation rules, and release/promotion workflow — but
keeps its own version-specific code, migrations, DEV configuration, QA/UAT
evidence, and version documentation.

PROD-only runtime/state items, credentials, business data, deployment state,
emergency fixes, backups, or unknown production-only artifacts are never
blindly copied.

## Truth order

CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE ENVIRONMENT +
VERIFIED TEST EVIDENCE override stale historical documentation.

## AI context start order

1. `CURRENT_VERSION`
2. `versions/v4/README.md`
3. V4 traceability/reference
4. V4 architecture/security/testing/releases
5. shared governance/release controls
6. older versions only when lineage/history is needed
