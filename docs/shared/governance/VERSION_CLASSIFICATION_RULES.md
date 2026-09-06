# Version Classification Rules

## V1

Initial/basic WineShopPOS generation:
- foundation,
- UI shell,
- local/basic POS,
- early product master,
- barcode scanner,
- local/basic inventory,
- early receiving,
- early sales/reports/backup.

Classification is based on document content, not filename alone.

## V2

Production/mid-generation documentation that describes the more advanced application state after the early foundation.

Advanced work that happened during V2 stays V2 and is grouped by feature/date.

Do not invent V2.5 unless an actual product release was formally named V2.5.

## V3

Current development-generation work on the V3 branch.

V3 documentation is not production truth until the V3 application/database release is promoted.

## Ambiguous documents

If a document spans multiple generations:
- keep the original as historical evidence,
- extract current facts into the correct version documents,
- record a classification note rather than duplicating the whole file.

## Global version inheritance rule

Every new version inherits PROD's repository structure, coding conventions,
documentation governance, testing structure, migration discipline, security
controls, environment-isolation rules, and release/promotion workflow — but
keeps its own version-specific code, migrations, DEV configuration, QA/UAT
evidence, and version documentation.

PROD-only runtime/state items, credentials, business data, deployment state,
emergency fixes, backups, or unknown production-only artifacts must never be
blindly copied.

This inheritance is established when a version is created, not reconstructed
only at production-promotion time.
