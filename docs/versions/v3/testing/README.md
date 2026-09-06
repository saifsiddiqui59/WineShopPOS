# V3 Testing Documentation

## Layers

1. source/static checks,
2. environment checks,
3. schema/security regression,
4. transactional DEV UAT,
5. browser E2E,
6. manual visual UAT where required,
7. release qualification.

## Feature traceability

Every critical feature maps to:
- implementation,
- data/RPC dependencies,
- security boundary,
- automated tests,
- transactional/browser/manual evidence.

A later-gate failure does not erase an earlier verified PASS.
Do not replay successful transactional writes unless the earlier evidence is invalidated.
