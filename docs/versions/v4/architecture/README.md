# V4 Architecture

Status: CURRENT V4 architecture index.

V4 preserves the existing WineShopPOS React/Vite + Supabase + Azure service
layout and extends it rather than creating a parallel application architecture.

## V4 extension areas

- Platform/SaaS access control: `src/context/SaaSContext.jsx`,
  `src/components/SaaSAccessBoundary.jsx`, `src/pages/PlatformAdmin.jsx`.
- Shop import: `src/pages/ShopImport.jsx`, `src/lib/onboardingImport.js`.
- Legal boundary: `src/components/LegalNoticeBoundary.jsx`,
  `src/components/LegalAdminCard.jsx`, `src/lib/clientIdentity.js`.
- Realtime stock propagation: `src/context/ShopContext.jsx`.
- Database evolution: version-controlled files under `supabase/migrations/`.

See `V4_COMMERCIAL_READINESS_BATCH1.md` for the existing V4 implementation
record and `../reference/FEATURE_TRACEABILITY_CORE.md` for source/data/test
traceability.

## Environment architecture rule

`main` is PROD-only. V4 and all non-main development generations are DEV-only.
No V4 frontend artifact may contain the PROD Supabase project ref.
