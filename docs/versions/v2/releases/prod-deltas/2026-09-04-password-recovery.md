# V2 PROD Delta — Password Recovery / Custom Auth Email

Status: CURRENT PROD / USER-VERIFIED

Forgot Password / password recovery is working in current PROD.

Verified:
- reset request works,
- recovery email delivery works,
- usable subject/body/reset action,
- password update works,
- login with the changed password works.

Security/operations:
- never commit SMTP credentials/app passwords/recovery tokens/session tokens;
- recovery must return to the production application;
- email delivery alone is not E2E proof;
- test Incognito/InPrivate before mutating a known-good user when browser behavior conflicts with expected credentials.

The feature is also carried forward and working in V3. Its historical PROD origin remains a V2 PROD delta.
