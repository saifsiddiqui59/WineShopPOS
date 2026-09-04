# V3 SECURITY DEFINER RPC Privilege Hardening

Status: **V3 release blocker identified; repository hardening migration prepared**

Frozen discovery baseline:

```text
branch: V3
commit: ae3b427188085a7d358c490bf06cd84ad686e52f
```

## Finding

The live WineShopPOS Supabase project exposes a large `public` schema
`SECURITY DEFINER` surface. At discovery time:

```text
public SECURITY DEFINER functions: 152
anonymous-executable:              145
```

Many business RPCs already perform internal `auth.uid()`, shop and role checks,
so the broad grant alone does not prove those workflows are exploitable.

However, the following internal helpers were confirmed to be directly
executable by `anon` / `authenticated` while containing no caller
authorization check:

- `next_sale_number(uuid)`
- `next_purchase_number(uuid)`
- `next_po_number(uuid)`
- `write_audit(uuid,text,text,text,jsonb,jsonb,jsonb)`
- `v2_refresh_receipt_lot_balance(uuid,uuid)`

That is not an acceptable production release posture.

## Hardening policy

The V3 release migration must enforce:

1. No `public.SECURITY DEFINER` function is executable by `PUBLIC` or `anon`.
2. Existing externally required authenticated V3 RPCs retain their current
   authenticated access.
3. Confirmed internal-only helpers are not directly executable by
   `authenticated`.
4. Future postgres-owned functions in `public` receive no automatic
   `PUBLIC`, `anon` or `authenticated` EXECUTE grant.
5. Every future client-facing RPC must use an explicit role grant in the same
   migration that creates or changes the RPC.
6. Function-body authorization remains mandatory. EXECUTE grants are not a
   replacement for `auth.uid()`, shop-membership and role checks.

## Compatibility boundary

This change is privilege-only. It does not change:

- React/Vite frontend behavior
- POS barcode scanning
- shift logic
- stock-count logic
- function bodies
- RLS policies
- Supabase Auth
- Azure resources
- Foundry/model configuration
- AI Owner Assistant source, prompt, tools, authentication or authorization

## Release gate after database application

Before this release can be promoted:

- anonymous execution count for public `SECURITY DEFINER` functions = `0`
- the five internal helpers above are not executable by `authenticated`
- current application RPCs remain executable by `authenticated`
- ADMIN / MANAGER / CASHIER negative-role tests pass
- cross-shop tests pass
- POS sale/shift, purchase, stock-count, refund/void and AI smoke tests pass
- Supabase Security Advisor is rerun and findings are classified

## Future migration rule

A new public RPC must not rely on Supabase/PostgreSQL default EXECUTE
privileges. The migration must explicitly document and grant the intended
caller role, for example `authenticated` or `service_role`.

Historical implementation documents do not override this rule.

<!-- V3_SECURITY_DEV_APPLY_EVIDENCE_20260904 -->
## Verified DEV application evidence — 2026-09-04

Environment boundary:

```text
DEV  : WineshopPOS_DEV / juhcypzoacauzmtzqnwd
PROD : WineShopPOS     / uiurgplnsgmawvxhjzzp
```

The privilege hardening was applied to DEV only and recorded as:

```text
20260904125419_v3_security_definer_rpc_privileges
```

Verified post-apply:

```text
public SECURITY DEFINER functions      152
anon EXECUTE                              0
PUBLIC EXECUTE                            0
authenticated unsafe internal helpers     0
required authenticated V3 RPC missing     0
```

Rollback-only runtime probes passed for ADMIN, MANAGER and CASHIER authorization.
Temporary stock/shift/role mutations were rolled back and confirmed not persisted.

A read-only PROD verification after the DEV change showed PROD retained its
earlier privilege surface; production was not modified.
<!-- /V3_SECURITY_DEV_APPLY_EVIDENCE_20260904 -->
