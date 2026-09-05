# WineShopPOS Documentation Standard

## Purpose

Provide one repeatable documentation structure across product versions.

## Truth order

CURRENT SOURCE
+ CURRENT MIGRATIONS
+ VERIFIED LIVE ENVIRONMENT
+ VERIFIED TEST EVIDENCE

override stale documentation.

## Audience classes

### PUBLIC
Operational user guidance only.

### INTERNAL
Product, architecture, engineering, testing and reference material.

### RESTRICTED
Environment identifiers, security internals, schema/RPC details, release/failure evidence and trusted AI continuation material.

## Required documentation per version

### User
- user manual,
- role quick starts,
- FAQ where useful.

### Product
- feature catalog,
- page catalog,
- feature/page docs.

### Architecture
- context,
- containers/components,
- runtime flows,
- deployment,
- cross-cutting concepts,
- ADRs,
- risks/technical debt.

### Reference
- table/view catalog,
- data dictionary,
- relationships/ERD,
- RPC/function catalog,
- storage/cache catalog,
- interface/API catalog,
- generated dependency inventory.

### Operations
- deployment,
- runbooks,
- backup/recovery,
- observability,
- incident continuation.

### Security
- threat model,
- control/status matrix,
- ASVS mapping where applicable,
- auth/RLS/storage/CORS/cache/offline controls.

### Testing
- test strategy,
- feature traceability,
- regression matrix,
- UAT/evidence.

### Releases
- release manifests,
- migration set,
- exact source SHA,
- environment bindings,
- verification results.

## Mandatory traceability

Every current feature must link:
feature -> page/route -> source -> tables -> RPCs -> indirect tables -> services -> migrations -> tests -> release evidence.

## Documentation change rule

When source changes, update only the documents whose contract changed.

Do not append release-history notes into general registries.

## Historical rule

Superseded docs remain available within their version/history area but must be labelled historical.

## AI context rule

Trusted AI starts from:
1. CURRENT_VERSION,
2. version README,
3. feature/page catalog,
4. traceability,
5. architecture/service/data reference,
6. security/testing/release docs relevant to the task,
7. old versions only when needed.
