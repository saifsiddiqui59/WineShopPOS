# WineShopPOS

**Current branch generation: V4 (DEV / QA, not yet PROD)**

WineShopPOS is an existing production multi-shop POS application. V4 extends
the current product; it is not a rewrite.

## Environment rule

- `main` -> PROD only.
- V4 and other non-main development branches -> DEV only.
- PROD runtime/state, credentials and business data are never blindly copied
  into a development version.

## Canonical documentation

Start with:

1. `docs/CURRENT_VERSION`
2. `docs/DOCUMENTATION_REGISTER.md`
3. `docs/versions/v4/README.md`
4. `docs/versions/v4/reference/FEATURE_TRACEABILITY_CORE.md`
5. relevant architecture/security/testing/release records
6. `docs/shared/release/` before promotion work

## Global version inheritance rule

Every new version inherits PROD's repository structure, coding conventions,
documentation governance, testing structure, migration discipline, security
controls, environment-isolation rules, and release/promotion workflow — while
keeping its own version-specific code, migrations, DEV configuration, QA/UAT
evidence and version documentation.

PROD-only runtime/state items are not blindly copied.

## Truth order

CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED LIVE ENVIRONMENT +
VERIFIED TEST EVIDENCE > stale historical documentation.
