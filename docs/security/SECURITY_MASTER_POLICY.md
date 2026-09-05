# WineShopPOS Security Master Policy

Classification: RESTRICTED engineering/security documentation.

Security is enforced at the database/API boundary. UI hiding or redirect-only controls are never sufficient authorization.

## Mandatory invariants

- Keep every business row scoped to the authorized shop/organization.
- Stock-changing operations remain transaction-safe backend/database operations.
- Do not expose service-role keys, SMTP credentials, Azure/storage credentials, database passwords or user/session tokens.
- Privileged offline access must not trust locally editable role/cache state.
- Shared-device/browser cache behavior must not expose prior-user or prior-shop data.
- User/shop role boundaries must be enforced in backend policies/functions.
- Internal privileged helper functions must not be executable by anonymous/browser roles.
- Role denial must settle on a valid role home without redirect loops.
- Public Auth/self-signup, CORS, error handling and email-recovery behavior must be explicitly controlled.
- Browser/service-worker caching must never cache authenticated cross-origin/backend responses.
- Security headers require a supported hosting/edge mechanism and an explicit cost gate before paid infrastructure is provisioned.
- Security tests must distinguish source/build, backend authorization, browser behavior and manual UAT.
- A PASS may be claimed only with evidence.

## Release method

verify -> smallest authoritative fix -> negative and positive tests -> evidence -> documented rollback/safe continuation.

Never weaken security merely to make a test pass.
