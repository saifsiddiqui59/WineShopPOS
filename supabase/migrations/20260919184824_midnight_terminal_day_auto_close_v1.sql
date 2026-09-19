-- Source record for migration already applied to QA and PROD.
-- At India midnight, previous-day terminal watermarks are CLOSED automatically.
-- This matches the hard-stop shift contract and prevents a stale terminal
-- watermark from blocking an otherwise clean completed day.

create or replace function public.rollover_all_shifts_midnight_v4()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shift record;
  v_cash numeric;
  v_upi numeric;
  v_card numeric;
  v_ref numeric;
  v_expected numeric;
  v_required boolean;
  v_count integer:=0;
begin
  for v_shift in
    select
      cs.id,
      cs.shop_id,
      cs.cashier_id,
      cs.business_date,
      cs.opening_cash,
      coalesce(ss.shift_closing_cash_required,true) as cash_required
    from public.cashier_shifts cs
    left join public.shop_settings ss on ss.shop_id=cs.shop_id
    where cs.status='OPEN'
      and cs.business_date < (now() at time zone 'Asia/Kolkata')::date
    for update of cs skip locked
  loop
    select
      coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount else 0 end),0),
      coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='UPI' then p.amount else 0 end),0),
      coalesce(sum(case when p.payment_type='PAYMENT' and p.payment_method='CARD' then p.amount else 0 end),0),
      coalesce(sum(case when p.payment_type='REFUND' and p.payment_method='CASH' then p.amount else 0 end),0),
      v_shift.opening_cash + coalesce(sum(
        case
          when p.payment_type='PAYMENT' and p.payment_method='CASH' then p.amount
          when p.payment_type='REFUND' and p.payment_method='CASH' then -p.amount
          else 0
        end
      ),0)
    into v_cash,v_upi,v_card,v_ref,v_expected
    from public.payments p
    where p.shift_id=v_shift.id;

    v_required := coalesce(v_shift.cash_required,true);

    if v_required then
      update public.cashier_shifts
      set status='CLOSE_REQUIRED',
          cash_sales=v_cash,
          upi_sales=v_upi,
          card_sales=v_card,
          cash_refunds=v_ref,
          expected_cash=v_expected,
          actual_cash=null,
          cash_difference=null,
          notes=concat_ws(E'\n',notes,
            'Hard stop at India midnight; closing cash not counted. New-day shift may open separately.')
      where id=v_shift.id;

      insert into public.audit_logs(
        shop_id,actor_id,action,entity_type,entity_id,metadata
      )
      values(
        v_shift.shop_id,null,
        'SHIFT_MIDNIGHT_HARD_STOP_CASH_REQUIRED',
        'cashier_shift',v_shift.id::text,
        jsonb_build_object(
          'business_date',v_shift.business_date,
          'cashier_id',v_shift.cashier_id,
          'cash_counted',false,
          'closing_cash_required',true,
          'rollover_timezone','Asia/Kolkata'
        )
      );
    else
      update public.cashier_shifts
      set status='CLOSED',
          cash_sales=v_cash,
          upi_sales=v_upi,
          card_sales=v_card,
          cash_refunds=v_ref,
          expected_cash=v_expected,
          actual_cash=null,
          cash_difference=null,
          close_requested_at=coalesce(close_requested_at,now()),
          closed_at=coalesce(closed_at,now()),
          approved_by=null,
          notes=concat_ws(E'\n',notes,
            'Auto-closed at India midnight; closing cash check OFF, cash not counted.')
      where id=v_shift.id;

      insert into public.audit_logs(
        shop_id,actor_id,action,entity_type,entity_id,metadata
      )
      values(
        v_shift.shop_id,null,
        'SHIFT_AUTO_CLOSED_MIDNIGHT_CASH_NOT_COUNTED',
        'cashier_shift',v_shift.id::text,
        jsonb_build_object(
          'business_date',v_shift.business_date,
          'cashier_id',v_shift.cashier_id,
          'cash_counted',false,
          'closing_cash_required',false,
          'expected_cash',v_expected,
          'rollover_timezone','Asia/Kolkata'
        )
      );
    end if;

    v_count := v_count+1;
  end loop;

  with closed_terminal as (
    update public.terminal_day_watermarks tdw
    set status='CLOSED',
        closed_at=coalesce(tdw.closed_at,now()),
        closed_by=null
    where tdw.status<>'CLOSED'
      and tdw.business_date < (now() at time zone 'Asia/Kolkata')::date
    returning
      tdw.shop_id,
      tdw.terminal_id,
      tdw.business_date,
      tdw.last_client_sequence,
      tdw.last_seen_at,
      tdw.closed_at
  )
  insert into public.audit_logs(
    shop_id,actor_id,action,entity_type,entity_id,metadata
  )
  select
    c.shop_id,
    null,
    'TERMINAL_DAY_AUTO_CLOSED_MIDNIGHT',
    'terminal_day',
    c.terminal_id::text || ':' || c.business_date::text,
    jsonb_build_object(
      'terminal_id',c.terminal_id,
      'business_date',c.business_date,
      'last_client_sequence',c.last_client_sequence,
      'last_seen_at',c.last_seen_at,
      'automatic',true,
      'rollover_timezone','Asia/Kolkata'
    )
  from closed_terminal c;

  return v_count;
end;
$function$;

revoke all on function public.rollover_all_shifts_midnight_v4()
  from public, anon, authenticated;

create or replace function public.auto_finalize_pending_business_days_v1()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_today date:=(now() at time zone 'Asia/Kolkata')::date;
  v_row record;
  v_result jsonb;
  v_final integer:=0;
  v_review integer:=0;
  v_retry integer:=0;
  v_errors integer:=0;
begin
  perform public.rollover_all_shifts_midnight_v4();

  for v_row in
    select distinct q.shop_id,q.business_date
    from (
      select s.id as shop_id,(v_today-1) as business_date
      from public.shops s
      union
      select fds.shop_id,fds.business_date
      from public.financial_day_state fds
      where fds.business_date<v_today
        and fds.status<>'FINAL'
    ) q
    order by q.business_date,q.shop_id
  loop
    begin
      v_result := public.auto_finalize_business_day_for_shop_v1(
        v_row.shop_id,v_row.business_date
      );

      case coalesce(v_result->>'status','')
        when 'FINAL' then v_final:=v_final+1;
        when 'NEEDS_REVIEW' then v_review:=v_review+1;
        when 'RETRY' then v_retry:=v_retry+1;
        else null;
      end case;
    exception when others then
      v_errors:=v_errors+1;

      insert into public.audit_logs(
        shop_id,actor_id,action,entity_type,entity_id,metadata
      )
      values(
        v_row.shop_id,null,
        'FINANCIAL_DAY_AUTO_CLOSE_ERROR',
        'financial_day',v_row.business_date::text,
        jsonb_build_object('message',sqlerrm,'automatic',true)
      );
    end;
  end loop;

  return jsonb_build_object(
    'finalized_or_already_final',v_final,
    'needs_review',v_review,
    'retry',v_retry,
    'errors',v_errors
  );
end;
$function$;

revoke all on function public.auto_finalize_pending_business_days_v1()
  from public, anon, authenticated;

do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname='wsp-midnight-shift-rollover'
  order by jobid desc
  limit 1;

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
end;
$$;

select cron.schedule(
  'wsp-midnight-shift-rollover',
  '30 18 * * *',
  $$select public.rollover_all_shifts_midnight_v4();$$
);
