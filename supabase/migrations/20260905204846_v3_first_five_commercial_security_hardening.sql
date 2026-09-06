begin;

-- ============================================================================
-- V3 first-five maturity hardening
--
-- 1. Gift-voucher quotes must be VOLATILE because they lock the voucher row.
-- 2. Use an update lock so concurrent checkouts cannot spend the same balance.
-- 3. Re-apply the V3 rule that no SECURITY DEFINER RPC is executable by
--    PUBLIC/anon. This also covers functions added later in the shared DEV DB.
-- ============================================================================

create or replace function public.commercial_quote(
  p_customer_id uuid default null,
  p_coupon_code text default null,
  p_subtotal numeric default 0,
  p_manual_discount numeric default 0,
  p_requested_points integer default 0,
  p_store_credit_amount numeric default 0,
  p_gift_voucher_code text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_base numeric;
  v_after_promo numeric;
  v_promo jsonb:='{}'::jsonb;
  v_promo_discount numeric:=0;

  v_points_available integer:=0;
  v_points_used integer:=0;
  v_point_value numeric:=1;
  v_max_redeem_percent numeric:=50;
  v_loyalty_discount numeric:=0;

  v_credit_available numeric:=0;
  v_credit_used numeric:=0;

  v_voucher_id uuid;
  v_voucher_balance numeric:=0;
  v_voucher_used numeric:=0;

  v_net numeric;
begin
  v_shop:=public.assert_shop_access();

  if p_subtotal<0 or p_manual_discount<0 or p_manual_discount>p_subtotal then
    raise exception 'Invalid commercial quote amount';
  end if;

  if coalesce(p_requested_points,0)<0 or coalesce(p_store_credit_amount,0)<0 then
    raise exception 'Requested redemption cannot be negative';
  end if;

  v_base:=round(p_subtotal-p_manual_discount,2);
  v_promo:=public.v4_promotion_quote(p_customer_id,p_coupon_code,v_base);
  v_promo_discount:=coalesce((v_promo->>'promotion_discount')::numeric,0);
  v_after_promo:=greatest(v_base-v_promo_discount,0);

  if p_customer_id is not null then
    if not exists(
      select 1 from public.customers
      where id=p_customer_id and shop_id=v_shop and active=true
    ) then
      raise exception 'Customer not found';
    end if;

    v_points_available:=public.customer_loyalty_balance(p_customer_id);
    v_credit_available:=public.customer_store_credit_balance(p_customer_id);

    select point_value_rupees,max_redeem_percent
    into v_point_value,v_max_redeem_percent
    from public.loyalty_settings
    where shop_id=v_shop and enabled=true;

    v_point_value:=coalesce(v_point_value,1);
    v_max_redeem_percent:=coalesce(v_max_redeem_percent,50);

    v_points_used:=least(
      coalesce(p_requested_points,0),
      greatest(v_points_available,0),
      floor(
        (v_after_promo*v_max_redeem_percent/100)
        /nullif(v_point_value,0)
      )::integer
    );

    v_loyalty_discount:=least(
      round(v_points_used*v_point_value,2),
      v_after_promo
    );
  elsif coalesce(p_requested_points,0)>0 or coalesce(p_store_credit_amount,0)>0 then
    raise exception 'Customer required for loyalty/store credit';
  end if;

  v_net:=greatest(v_after_promo-v_loyalty_discount,0);

  if p_customer_id is not null then
    v_credit_used:=least(
      coalesce(p_store_credit_amount,0),
      greatest(v_credit_available,0),
      v_net
    );
  end if;

  v_net:=greatest(v_net-v_credit_used,0);

  if nullif(trim(coalesce(p_gift_voucher_code,'')),'') is not null then
    select id,current_balance into v_voucher_id,v_voucher_balance
    from public.gift_vouchers
    where shop_id=v_shop
      and upper(code)=upper(trim(p_gift_voucher_code))
      and status='ACTIVE'
      and current_balance>0
      and (expires_at is null or expires_at>=current_date)
    for update;

    if v_voucher_id is null then raise exception 'GIFT_VOUCHER_NOT_VALID'; end if;

    v_voucher_used:=least(v_voucher_balance,v_net);
    v_net:=greatest(v_net-v_voucher_used,0);
  end if;

  return jsonb_build_object(
    'subtotal',round(p_subtotal,2),
    'manual_discount',round(p_manual_discount,2),
    'promotion_id',v_promo->>'promotion_id',
    'promotion_name',v_promo->>'promotion_name',
    'coupon_code',v_promo->>'coupon_code',
    'promotion_discount',round(v_promo_discount,2),
    'loyalty_points_available',v_points_available,
    'loyalty_points_used',v_points_used,
    'loyalty_discount',round(v_loyalty_discount,2),
    'store_credit_available',round(v_credit_available,2),
    'store_credit_used',round(v_credit_used,2),
    'gift_voucher_id',v_voucher_id,
    'gift_voucher_used',round(v_voucher_used,2),
    'external_payment_due',round(v_net,2)
  );
end;
$$;

do $wsp$
declare
  r record;
begin
  for r in
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef=true
  loop
    execute format(
      'revoke execute on function %s from public, anon',
      r.oid::regprocedure
    );
  end loop;
end
$wsp$;

grant execute on function public.commercial_quote(
  uuid,text,numeric,numeric,integer,numeric,text
) to authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from authenticated;

do $verify$
declare
  v_name text;
  v_volatility "char";
begin
  select p.provolatile
  into v_volatility
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.oid='public.commercial_quote(uuid,text,numeric,numeric,integer,numeric,text)'::regprocedure;

  if v_volatility <> 'v' then
    raise exception 'V3_FIRST_FIVE_FAILED: commercial_quote is not VOLATILE';
  end if;

  select p.oid::regprocedure::text
  into v_name
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.prosecdef=true
    and has_function_privilege('anon',p.oid,'EXECUTE')
  limit 1;

  if v_name is not null then
    raise exception 'V3_FIRST_FIVE_FAILED: anon can execute SECURITY DEFINER function %',v_name;
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.commercial_quote(uuid,text,numeric,numeric,integer,numeric,text)',
    'EXECUTE'
  ) then
    raise exception 'V3_FIRST_FIVE_FAILED: authenticated commercial_quote EXECUTE missing';
  end if;
end
$verify$;

commit;
;
