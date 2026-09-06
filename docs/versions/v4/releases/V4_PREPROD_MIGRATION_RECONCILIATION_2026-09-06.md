# V4 Pre-PROD Migration Reconciliation — 2026-09-06

Status: **PASS — SOURCE RECONCILED; PROD NOT MODIFIED**

- Candidate before reconciliation: `d541c1ea63f8092416c1d0f85ff7508d7ab682ee`
- main/PROD source at freeze: `3b2c3e98b310c430169229106b80d63abfb87705`
- V3 reference: `54794c4e25d75183cbefda5821cac866e0e4b0c4`
- DEV Supabase ref: `juhcypzoacauzmtzqnwd`
- PROD Supabase ref: `uiurgplnsgmawvxhjzzp`
- DEV business rows are NOT copied to PROD.
- UAT product markers are absent from migration SQL.
- PROD migration allowlist is intentionally not populated yet.
- Never use blind `supabase db push` for this release.

## Recovered migration source
- `supabase/migrations/20260905121213_v4_saas_subscription_platform_control.sql`
- `supabase/migrations/20260905121323_v4_saas_plan_admin_controls.sql`
- `supabase/migrations/20260905121348_v4_saas_runtime_config_environment_neutral.sql`
- `supabase/migrations/20260905121457_v4_saas_rpc_execute_hardening.sql`
- `supabase/migrations/20260905121610_v4_saas_align_plan_feature_tiers.sql`
- `supabase/migrations/20260905123241_v4_saas_public_catalog_policy_and_platform_plan_list.sql`
- `supabase/migrations/20260905123708_v4_saas_subscription_demo_control_layer.sql`
- `supabase/migrations/20260905204846_v3_first_five_commercial_security_hardening.sql`
- `supabase/migrations/20260905205918_v3_set_updated_at_search_path.sql`
- `supabase/migrations/20260905210140_v4_commercial_readiness_batch1_canonical.sql`

## Required next release gate
Compare these reconciled DEV migrations with LIVE PROD migration history,
review the SQL, classify an explicit PROD allowlist, prepare rollback evidence,
and verify PROD legal notice initializes DISABLED before frontend deployment.
