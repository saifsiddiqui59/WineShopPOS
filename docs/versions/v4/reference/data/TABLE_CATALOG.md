# V4 Table / Data Object Catalog

Status: CURRENT V4 MIGRATION-DERIVED DELTA + INHERITED V3 BASELINE

The complete inherited pre-V4 data baseline is preserved at:
`docs/versions/v3/reference/data/TABLE_CATALOG.md`.

The rows below are generated from exact V4-era repository migration SQL.
They are static migration evidence, not a substitute for the live PROD
read-only schema check required immediately before promotion.

## Tables created/redeclared by V4-era migration SQL

| Table | Migration source(s) |
|---|---|
| `legal_acceptances` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `legal_documents` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `onboarding_import_batches` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `platform_runtime_config` | `20260905121213_v4_saas_subscription_platform_control.sql` |
| `saas_announcements` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_demo_accounts` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_platform_admins` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_runtime_settings` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_shop_subscriptions` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `shop_subscription_events` | `20260905121213_v4_saas_subscription_platform_control.sql` |
| `subscription_plans` | `20260905121213_v4_saas_subscription_platform_control.sql` |

## Existing tables altered/referenced by ALTER TABLE in V4-era migration SQL

| Table | Migration source(s) |
|---|---|
| `legal_acceptances` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `legal_documents` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `onboarding_import_batches` | `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `platform_runtime_config` | `20260905121213_v4_saas_subscription_platform_control.sql` |
| `saas_announcements` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_demo_accounts` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_platform_admins` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_runtime_settings` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `saas_shop_subscriptions` | `20260905123708_v4_saas_subscription_demo_control_layer.sql`, `20260905210140_v4_commercial_readiness_batch1_canonical.sql` |
| `shop_subscription_events` | `20260905121213_v4_saas_subscription_platform_control.sql` |
| `shops` | `20260905121213_v4_saas_subscription_platform_control.sql` |
| `subscription_plans` | `20260905121213_v4_saas_subscription_platform_control.sql` |

## Authority

For V4 release decisions use current V4 migration SQL plus verified DEV/PROD
live schema state. This catalog is a traceability aid.
