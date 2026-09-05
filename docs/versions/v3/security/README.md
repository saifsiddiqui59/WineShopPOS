# V3 Security Documentation

## Security artifacts

- threat model,
- Auth/session controls,
- role/access matrix,
- RLS/data API policy map,
- SECURITY DEFINER function exposure map,
- Storage access model,
- offline/cache trust model,
- CORS/interface controls,
- secrets/configuration handling,
- audit/logging,
- security regression evidence.

## Verification framework

Use OWASP ASVS as a verification reference where applicable.

Do not claim ASVS compliance merely because a checklist exists.

Each mapped requirement has:
- applicable/not applicable,
- WineShopPOS control,
- evidence,
- version/date,
- verification status.

## Threat model

Use the four-question cycle:
1. What are we working on?
2. What can go wrong?
3. What will we do about it?
4. Did we do a good enough job?

The threat model is maintained with the application, not written once and forgotten.
