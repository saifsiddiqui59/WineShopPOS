# WineShopPOS V3 Production Promotion — 2026-09-05

Status: **PASS**

## Qualified V3

- Qualified V3 SHA: `93ba6ebd3f9dc545247c24f0875eedbebfd71907`
- Hosted-preview application SHA: `10bac5ea4a0f038dde19494694b6d811eeb8766e`
- Hosted Playwright: 7/7 PASS
- Combined hosted qualification: 8/8 PASS

## PROD database

Applied before frontend deployment:

1. `20260904125419_v3_security_definer_rpc_privileges`
   - applied version: `20260905092251`
2. `20260904162500_fix_stock_count_scan_ambiguous_product_id`
   - applied version: `20260905092302`

Post-verification:
- SECURITY DEFINER total: 152
- anon-executable SECURITY DEFINER: 0
- required authenticated RPC missing: 0
- internal helper authenticated exposure: 0
- stock_count_scan qualified fix: present
- stock_count_scan anon execute: denied
- stock_count_scan authenticated execute: allowed

## PROD invoice automation

- Edge Function: `invoice-automation-ingest`
- version: `10`
- verify_jwt: `false`
- bundle SHA-256: `9d54c6a7d9f66e2186c814100c8c1d2e4958bcd54a2565f0f81a424f5600af94`
- current V3 RAW_DMY_DATE-first parser deployed
- `x-wsp-automation-secret` caller authentication retained

## Owner AI

Qualified V3 had no Owner AI application-source delta.

Owner AI redeployment: **NOT REQUIRED / NOT PERFORMED**.

Frozen PROD AI baseline was preserved.

## Git promotion

Promotion merge SHA:

`a226a476c57031ccd8c0ba217957e81c15b1c571`

The merge has both:
- previous PROD main
- qualified V3 `93ba6ebd3f9dc545247c24f0875eedbebfd71907`

as parents.

`docs/CURRENT_VERSION`: `v3`

## Credential gate

Validated active PROD ADMIN used for release qualification:

`royal21beer.wine@gmail.com`

No password is stored in this evidence.

## Azure Storage authentication

Azure Blob data-plane deployment used the project's existing verified Failure-Class-6 fallback:



This was required because the current Azure identity does not have the Storage Blob Data RBAC role needed for .

No Storage account key was printed, written to the repository, or recorded in release evidence.

## PROD frontend

- Resource group: `wineshopPOS`
- Storage account: `wineshoppos`
- Production URL: `https://wineshoppos.z29.web.core.windows.net/`
- rollback copy: `/e/WineShopPOS_RELEASE_EVIDENCE/PROD_FRONTEND_PREDEPLOY_20260905T101430Z`
- previous index SHA-256: `09e35a31f6b51e74fa30dc90f6ad66ec6db3136f8fec89251a163a0f400d13e5`
- deployed index SHA-256: `b6050c1f19804d37a6cce8f1cc68117fe2a0a66014a0935d399967f15443983a`
- exact local/remote artifact identity: PASS

## PROD browser qualification

- ADMIN login: PASS
- Playwright: 7/7 PASS
- skipped: 0
- flaky: 0
- browser operational mutations: none

## Historical local dirt

Exactly three pre-existing tracked migration files remained unstaged and
byte-for-byte unchanged during this continuation:

- `supabase/migrations/20260829190000_chapters_16_26.sql`
- `supabase/migrations/20260829233000_master_reconsolidation.sql`
- `supabase/migrations/20260830070000_ai_owner_assistant_v1.sql`

Pre-existing untracked paths preserved: `425`.

No destructive Git cleanup was used.

## Final release state

V3 -> PROD promotion: **PASS**
