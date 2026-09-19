-- Source record of the PROD/QA migration already applied on 2026-09-19.
-- This release does NOT replay it.

alter table public.shop_settings
  add column if not exists shift_closing_cash_required boolean not null default true;

create or replace function public.shift_close_policy_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_role text;
  v_required boolean;
begin
  v_shop := public.assert_shop_access();
  v_role := public.current_user_role();

  select coalesce(ss.shift_closing_cash_required,true)
  into v_required
  from public.shop_settings ss
  where ss.shop_id=v_shop;

  v_required := coalesce(v_required,true);

  return jsonb_build_object(
    'shift_closing_cash_required',v_required,
    'can_manage',(v_role='ADMIN')
  );
end;
$function$;

revoke all on function public.shift_close_policy_v1() from public, anon;
grant execute on function public.shift_close_policy_v1() to authenticated;

create or replace function public.set_shift_close_policy_v1(
  p_shift_closing_cash_required boolean
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_admin();

  if p_shift_closing_cash_required is null then
    raise exception 'SHIFT_CLOSING_CASH_POLICY_REQUIRED';
  end if;

  insert into public.shop_settings(
    shop_id,
    shift_closing_cash_required,
    updated_at
  )
  values(
    v_shop,
    p_shift_closing_cash_required,
    now()
  )
  on conflict (shop_id) do update
  set shift_closing_cash_required=excluded.shift_closing_cash_required,
      updated_at=now();

  perform public.write_audit(
    v_shop,
    'SHIFT_CLOSE_POLICY_UPDATED',
    'shop_settings',
    v_shop::text,
    null,
    null,
    jsonb_build_object(
      'shift_closing_cash_required',p_shift_closing_cash_required
    )
  );

  return jsonb_build_object(
    'shift_closing_cash_required',p_shift_closing_cash_required,
    'can_manage',true
  );
end;
$function$;

revoke all on function public.set_shift_close_policy_v1(boolean) from public, anon;
grant execute on function public.set_shift_close_policy_v1(boolean) to authenticated;

create or replace function public.request_shift_close_v4(
  p_shift_id uuid,
  p_terminal_id uuid,
  p_client_sequence bigint,
  p_actual_cash numeric default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_role text;
  v_shift public.cashier_shifts%rowtype;
  v_cash numeric;
  v_upi numeric;
  v_card numeric;
  v_ref numeric;
  v_expected numeric;
  v_unresolved integer;
  v_cash_required boolean:=true;
  v_actual numeric;
  v_difference numeric;
begin
  v_shop := public.assert_shop_access();
  v_role := public.current_user_role();

  if p_shift_id is null then raise exception 'SHIFT_ID_REQUIRED'; end if;
  if p_terminal_id is null then raise exception 'TERMINAL_ID_REQUIRED'; end if;
  if p_actual_cash is not null and p_actual_cash < 0 then
    raise exception 'Actual cash must be zero or positive';
  end if;
  if coalesce(p_client_sequence,0) < 0 then
    raise exception 'INVALID_CLIENT_SEQUENCE';
  end if;

  select coalesce(ss.shift_closing_cash_required,true)
  into v_cash_required
  from public.shop_settings ss
  where ss.shop_id=v_shop;

  v_cash_required := coalesce(v_cash_required,true);

  if v_cash_required and p_actual_cash is null then
    raise exception 'CLOSING_CASH_REQUIRED';
  end if;

  perform public.register_terminal_v1(p_terminal_id,null,'{}'::jsonb);
  perform public.refresh_shift_rollover_v1();

  select *
  into v_shift
  from public.cashier_shifts
  where id=p_shift_id
    and shop_id=v_shop
    and status in ('OPEN','CLOSE_REQUIRED')
  for update;

  if not found then
    raise exception 'Shift is not open/close-required';
  end if;

  if v_shift.cashier_id <> auth.uid()
     and v_role not in ('ADMIN','MANAGER') then
    raise exception 'Not authorized to close this shift';
  end if;

  select count(*)::integer
  into v_unresolved
  from public.checkout_attempts ca
  where ca.shop_id=v_shop
    and ca.cashier_id=v_shift.cashier_id
    and ca.status in ('SUBMITTING','UNKNOWN')
    and (ca.initiated_at at time zone 'Asia/Kolkata')::date=v_shift.business_date;

  if v_unresolved>0 then
    raise exception 'UNRESOLVED_CHECKOUT_BLOCKS_SHIFT_CLOSE';
  end if;

  select *
  into v_cash,v_upi,v_card,v_ref,v_expected
  from public.shift_totals(v_shift.id);

  v_actual := p_actual_cash;
  v_difference := case
    when p_actual_cash is null then null
    else p_actual_cash-v_expected
  end;

  update public.cashier_shifts
  set status='CLOSE_REQUESTED',
      cash_sales=v_cash,
      upi_sales=v_upi,
      card_sales=v_card,
      cash_refunds=v_ref,
      expected_cash=v_expected,
      actual_cash=v_actual,
      cash_difference=v_difference,
      close_requested_at=now(),
      notes=concat_ws(E'\n',notes,p_notes)
  where id=v_shift.id;

  perform public.terminal_heartbeat_v1(
    p_terminal_id,
    v_shift.business_date,
    p_client_sequence,
    false
  );

  perform public.write_audit(
    v_shop,'SHIFT_CLOSE_REQUESTED_V4','cashier_shift',v_shift.id::text,
    null,null,
    jsonb_build_object(
      'actual_cash',v_actual,
      'expected_cash',v_expected,
      'cash_difference',v_difference,
      'closing_cash_required',v_cash_required,
      'business_date',v_shift.business_date,
      'previous_status',v_shift.status,
      'terminal_id',p_terminal_id,
      'client_sequence',p_client_sequence
    )
  );

  return jsonb_build_object(
    'shift_id',v_shift.id,
    'status','CLOSE_REQUESTED',
    'business_date',v_shift.business_date,
    'expected_cash',v_expected,
    'actual_cash',v_actual,
    'cash_difference',v_difference,
    'closing_cash_required',v_cash_required
  );
end;
$function$;

revoke all on function public.request_shift_close_v4(uuid,uuid,bigint,numeric,text)
  from public, anon;
grant execute on function public.request_shift_close_v4(uuid,uuid,bigint,numeric,text)
  to authenticated;
