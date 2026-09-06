# V4 Core Feature Traceability

Status: CURRENT V4 CURATED TRACEABILITY

| V4 area | Main source surfaces | Primary data/RPC area | Key migrations | Test/evidence |
|---|---|---|---|---|
| Platform Control / SaaS access | `src/pages/PlatformAdmin.jsx`, `src/context/SaaSContext.jsx`, `src/components/SaaSAccessBoundary.jsx`, `src/components/SaaSBanner.jsx` | subscription/runtime/admin/announcement tables + SaaS/platform RPCs | `20260905121213` through `20260905123708`, plus `20260905210140` and hardening | `scripts/v4-platform-control-ux-regression.mjs`, `tests/e2e/v4-commercial-readiness.spec.mjs` |
| Shop onboarding import | `src/pages/ShopImport.jsx`, `src/lib/onboardingImport.js` | `onboarding_import_batches`, import validation/apply RPCs, products/inventory/suppliers | `20260905210140`, `20260906050120` | commercial regression + hosted V4 browser suite + DEV import UAT |
| Realtime inventory / oversell protection | `src/context/ShopContext.jsx`, `src/pages/POS.jsx` | `inventory`, sale/stock RPC transaction path | existing transactional sale/stock migrations + V4 hardening context | final DEV gate detailed UAT `PASS=26 WARN=0 FAIL=0` |
| Legal notice / acceptance | `src/components/LegalNoticeBoundary.jsx`, `src/components/LegalAdminCard.jsx`, `src/lib/clientIdentity.js` | `legal_documents`, `legal_acceptances`, legal/runtime RPCs | `20260905210140`, `20260906050120`, `20260906050403` | platform-control regression + final DEV gate; DEV legal notice verified disabled after gate |
| Commercial/mobile/readability hardening | `src/index.css`, V4 UI components/pages | application/UI only plus V4 runtime settings where applicable | V4 commercial-readiness migrations | lint, build, V4 regressions, hosted browser suite |

## Runtime qualification lineage

Runtime-qualified base:
`81107e0833abe4d2c7a09d5bd0d75bb924b7634a`

Final DEV evidence:
`/e/WineShopPOS_RELEASE_EVIDENCE/V4_FINAL_PREPROD_GATE_20260906T080132Z`

The V4_14 documentation-only successor must prove that application/runtime
files and the built frontend index remain identical to that qualified base.
