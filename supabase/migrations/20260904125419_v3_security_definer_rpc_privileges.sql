begin;

-- ============================================================================
-- WineShopPOS V3 release hardening
-- SECURITY DEFINER function execution privileges
--
-- Goals:
--   1. Anonymous/Public callers must not execute any public SECURITY DEFINER RPC.
--   2. Existing authenticated application RPC grants remain intact.
--   3. Confirmed internal helpers must not be directly callable by authenticated
--      clients; they remain callable by owning SECURITY DEFINER routines.
--   4. Future postgres-owned public functions do not automatically become
--      client-callable. New public API functions must receive an explicit GRANT.
--
-- This migration changes privileges only. It does NOT replace function bodies.
-- ============================================================================

do $wsp$
declare
  r record;
begin
  for r in
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef = true
  loop
    execute format(
      'revoke execute on function %s from public, anon',
      r.oid::regprocedure
    );
  end loop;
end
$wsp$;

-- Internal-only helpers. These accept caller-controlled IDs/data and are
-- intended to be reached only from authorized server-side/database workflows.
revoke execute on function public.next_sale_number(uuid)
  from authenticated;
revoke execute on function public.next_purchase_number(uuid)
  from authenticated;
revoke execute on function public.next_po_number(uuid)
  from authenticated;
revoke execute on function public.write_audit(
  uuid,text,text,text,jsonb,jsonb,jsonb
) from authenticated;
revoke execute on function public.v2_refresh_receipt_lot_balance(uuid,uuid)
  from authenticated;

-- Fail-closed default for functions created by future WineShopPOS migrations.
-- External RPCs must be explicitly granted to authenticated/service roles.
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from authenticated;

-- --------------------------------------------------------------------------
-- Migration self-verification.
-- Any failure aborts the migration atomically.
-- --------------------------------------------------------------------------
do $verify$
declare
  v_name text;
begin
  -- No public SECURITY DEFINER function may remain anonymously executable.
  select p.oid::regprocedure::text
    into v_name
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef = true
    and has_function_privilege('anon', p.oid, 'EXECUTE')
  limit 1;

  if v_name is not null then
    raise exception
      'V3_SECURITY_HARDENING_FAILED: anon can still execute SECURITY DEFINER function %',
      v_name;
  end if;

  -- Confirmed internal helpers must not be directly client-callable.
  select p.oid::regprocedure::text
    into v_name
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'next_sale_number',
      'next_purchase_number',
      'next_po_number',
      'write_audit',
      'v2_refresh_receipt_lot_balance'
    )
    and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  limit 1;

  if v_name is not null then
    raise exception
      'V3_SECURITY_HARDENING_FAILED: internal helper remains authenticated-executable: %',
      v_name;
  end if;

  -- Core current V3 authenticated workflows must retain RPC access.
  select p.oid::regprocedure::text
    into v_name
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'my_profile',
      'my_shop_access',
      'get_products',
      'get_product_images',
      'complete_sale_v4',
      'open_shift',
      'receive_purchase_v2',
      'create_stock_count',
      'stock_count_scan',
      'submit_stock_count',
      'adjust_stock',
      'void_sale',
      'ai_resolve_context'
    )
    and not has_function_privilege('authenticated', p.oid, 'EXECUTE')
  limit 1;

  if v_name is not null then
    raise exception
      'V3_SECURITY_HARDENING_FAILED: required authenticated RPC lost EXECUTE: %',
      v_name;
  end if;
end
$verify$;

commit;
