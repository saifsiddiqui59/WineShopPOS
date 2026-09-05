# WineShopPOS Documentation Standard

## Truth order
CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE ENVIRONMENT + VERIFIED TEST EVIDENCE override stale documentation.

## Audience classes
- PUBLIC: customer workflows only.
- INTERNAL: product/architecture/testing/reference.
- RESTRICTED: schema/RPC/security/environment/release/failure/rebuild detail.

## Version rule
V1 = early/basic generation.
V2 = current production generation.
V3 = development generation until formal application/database promotion.

A feature-origin label does not automatically define the deployed product version.
If a V3-origin feature was actually deployed to V2 PROD, record it as a V2 PROD delta.

## Traceability
feature -> route/page -> source -> direct tables -> RPCs -> transitive tables -> storage/cache -> migrations -> security -> tests -> release evidence.

Generated dependency inventories are evidence aids, not authoritative until verified.
