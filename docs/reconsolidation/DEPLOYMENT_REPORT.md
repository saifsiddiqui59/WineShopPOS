# WineShopPOS Master Reconsolidation — Deployment Report

Generated: 2026-08-30 05:04:10 UTC

## Execution order

The release was deployed to Supabase/Azure before the release/documentation commits were pushed, as requested by the project owner.

## Baseline

- Branch: main
- Baseline commit: `2745dc7e69a22e7c4c7b9c37371642d193c8d90b`
- Baseline build: PASS
- Baseline lint: PASS
- Local safety archive: `.release-backups/pre-master-reconsolidation-20260830T050240Z.tar.gz`
- Pre-release tag: `pre-master-reconsolidation-20260830T050240Z`

## Release validation

- Post-overlay Vite build: PASS
- Post-overlay lint: PASS
- Supabase migration dry-run: PASS
- Supabase migration applied: `20260829233000_master_reconsolidation.sql`
- Updated Edge Function deployed: `manage-shop-users`
- Post-migration Vite build: PASS

## Azure

- Subscription: Azure subscription 1
- Resource group: wineshopPOS
- Storage account: wineshoppos
- Static website index in `$web`: confirmed
- Public URL: https://wineshoppos.z29.web.core.windows.net/
- Public HTTP check: PASS

## Product-tier rule

PLUS and PRO are presentation/product-classification metadata only in this release. No payment gateway, plan blocking, RLS plan enforcement, or entitlement paywall was introduced.

## Operational validation still required

A successful automated deployment does not prove physical scanner/printer behavior, real OCR invoices, offline reconnect conflicts, accounting import compatibility, legal/excise compliance, or a real database restore drill. Use the master regression test matrix.
