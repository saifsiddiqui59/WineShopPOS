-- PROD migration applied and verified as 20260919200033_smart_purchase_alerts_v1.
-- Smart Purchase Alerts V1: ADMIN-only, OFF by default, fixed 4-day lead + 2-day safety.

alter table public.shop_settings
  add column if not exists smart_purchase_alerts_enabled boolean not null default false,
  add column if not exists purchase_delivery_lead_days integer not null default 4,
  add column if not exists purchase_safety_stock_days integer not null default 2;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='shop_settings_purchase_delivery_lead_days_check') then
    alter table public.shop_settings add constraint shop_settings_purchase_delivery_lead_days_check
      check (purchase_delivery_lead_days between 1 and 30);
  end if;
  if not exists (select 1 from pg_constraint where conname='shop_settings_purchase_safety_stock_days_check') then
    alter table public.shop_settings add constraint shop_settings_purchase_safety_stock_days_check
      check (purchase_safety_stock_days between 0 and 14);
  end if;
end;
$$;

create table if not exists public.purchase_alert_states (
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  alert_type text not null default 'REORDER',
  last_condition_signature text,
  last_notified_at timestamptz,
  snoozed_until timestamptz,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (shop_id,product_id,alert_type),
  constraint purchase_alert_states_alert_type_check check (alert_type in ('REORDER'))
);

alter table public.purchase_alert_states enable row level security;
revoke all on table public.purchase_alert_states from public, anon, authenticated;

create index if not exists idx_purchase_orders_shop_status_expected
  on public.purchase_orders(shop_id,status,expected_date);
create index if not exists idx_purchase_order_items_shop_product_po
  on public.purchase_order_items(shop_id,product_id,purchase_order_id);

create or replace function public.purchase_alert_policy_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_enabled boolean:=false;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  select coalesce(ss.smart_purchase_alerts_enabled,false)
  into v_enabled
  from public.shop_settings ss where ss.shop_id=v_shop;
  return jsonb_build_object(
    'enabled',coalesce(v_enabled,false),
    'delivery_lead_days',4,
    'safety_stock_days',2,
    'reminder_hours',1,
    'can_manage',true
  );
end;
$function$;

revoke all on function public.purchase_alert_policy_v1() from public, anon;
grant execute on function public.purchase_alert_policy_v1() to authenticated;

create or replace function public.set_smart_purchase_alerts_v1(p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  if p_enabled is null then raise exception 'PURCHASE_ALERT_ENABLED_REQUIRED'; end if;

  insert into public.shop_settings(
    shop_id,smart_purchase_alerts_enabled,purchase_delivery_lead_days,
    purchase_safety_stock_days,updated_at
  ) values(v_shop,p_enabled,4,2,now())
  on conflict (shop_id) do update
  set smart_purchase_alerts_enabled=excluded.smart_purchase_alerts_enabled,
      purchase_delivery_lead_days=4,
      purchase_safety_stock_days=2,
      updated_at=now();

  perform public.write_audit(
    v_shop,'SMART_PURCHASE_ALERT_TOGGLED','shop_settings',v_shop::text,
    null,null,
    jsonb_build_object('enabled',p_enabled,'delivery_lead_days',4,'safety_stock_days',2,'reminder_hours',1)
  );
  return public.purchase_alert_policy_v1();
end;
$function$;

revoke all on function public.set_smart_purchase_alerts_v1(boolean) from public, anon;
grant execute on function public.set_smart_purchase_alerts_v1(boolean) to authenticated;

create or replace function public.purchase_alert_candidates_v1()
returns table(
  product_id uuid,
  product_name text,
  priority text,
  current_stock integer,
  minimum_stock integer,
  units_per_case integer,
  units_sold_30d bigint,
  avg_daily numeric,
  days_cover numeric,
  delivery_lead_days integer,
  safety_stock_days integer,
  reorder_trigger_days integer,
  recommended_quantity integer,
  recommended_cases integer,
  best_supplier_id uuid,
  best_supplier_name text,
  best_recent_cost numeric,
  committed_inbound_qty integer,
  timely_inbound_qty integer,
  pending_po_qty integer,
  earliest_inbound_date date,
  action_kind text,
  message text,
  condition_signature text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
with identity as (
  select public.assert_shop_access() as shop_id
),
cfg as (
  select i.shop_id,4::integer as lead_days,2::integer as safety_days
  from identity i left join public.shop_settings ss on ss.shop_id=i.shop_id
),
role_guard as (select public.assert_admin()),
coach as (
  select c.*
  from public.purchase_coach_v2(30) c
  cross join role_guard
  where c.recommendation_type='REORDER' and c.avg_daily>0
),
po_rows as (
  select poi.product_id,po.status,po.expected_date,
         greatest(poi.ordered_quantity-poi.received_quantity,0)::integer as outstanding
  from public.purchase_order_items poi
  join public.purchase_orders po on po.id=poi.purchase_order_id
  join cfg on cfg.shop_id=po.shop_id
  where po.status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT','PARTIALLY_RECEIVED')
    and greatest(poi.ordered_quantity-poi.received_quantity,0)>0
),
joined as (
  select
    c.product_id,c.product_name,c.current_stock,c.units_sold,c.avg_daily,c.days_cover,
    c.recommended_quantity as coach_recommended_quantity,
    c.best_supplier_id,c.best_supplier_name,c.best_recent_cost,
    p.minimum_stock,greatest(coalesce(p.units_per_case,1),1)::integer as units_per_case,
    cfg.lead_days,cfg.safety_days,
    coalesce(sum(r.outstanding) filter(where r.status in ('SENT','PARTIALLY_RECEIVED')),0)::integer as committed_qty,
    coalesce(sum(r.outstanding) filter(where r.status in ('DRAFT','APPROVAL_PENDING','APPROVED')),0)::integer as pending_qty,
    coalesce(sum(r.outstanding) filter(
      where r.status in ('SENT','PARTIALLY_RECEIVED')
        and r.expected_date is not null
        and c.days_cover>=1
        and r.expected_date < (now() at time zone 'Asia/Kolkata')::date + floor(c.days_cover)::integer
    ),0)::integer as timely_qty,
    min(r.expected_date) filter(where r.status in ('SENT','PARTIALLY_RECEIVED')) as earliest_inbound
  from coach c
  join public.products p on p.id=c.product_id
  join cfg on p.shop_id=cfg.shop_id
  left join po_rows r on r.product_id=c.product_id
  group by
    c.product_id,c.product_name,c.current_stock,c.units_sold,c.avg_daily,c.days_cover,
    c.recommended_quantity,c.best_supplier_id,c.best_supplier_name,c.best_recent_cost,
    p.minimum_stock,p.units_per_case,cfg.lead_days,cfg.safety_days
),
eligible as (
  select j.*,
    greatest(ceil(j.avg_daily*(j.lead_days+j.safety_days))::integer-j.current_stock,0) as threshold_gap,
    greatest(j.coach_recommended_quantity-j.timely_qty,0)::integer as remaining_recommended
  from joined j
  where j.current_stock=0 or j.days_cover <= j.lead_days+j.safety_days
),
actionable as (
  select * from eligible e
  where not (e.timely_qty>0 and e.timely_qty>=e.threshold_gap)
),
final as (
  select a.*,
    case when a.current_stock=0 then 'CRITICAL'
         when a.days_cover<=a.lead_days then 'CRITICAL'
         else 'HIGH' end as severity,
    case when a.pending_qty>0 then 'REVIEW_EXISTING_PO'
         when a.committed_qty>0 and a.earliest_inbound is null then 'CHECK_ETA'
         when a.committed_qty>0 and (
           a.days_cover<1 or
           a.earliest_inbound >= (now() at time zone 'Asia/Kolkata')::date + floor(a.days_cover)::integer
         ) then 'EXPEDITE_INBOUND'
         else 'REVIEW_PURCHASE' end as action_code,
    case when a.remaining_recommended<=0 then 0
         else ceil(a.remaining_recommended::numeric/a.units_per_case)::integer*a.units_per_case end as rounded_recommended
  from actionable a
)
select
  f.product_id,f.product_name,f.severity,f.current_stock,f.minimum_stock,f.units_per_case,
  f.units_sold,round(f.avg_daily,3),round(f.days_cover,1),f.lead_days,f.safety_days,
  f.lead_days+f.safety_days,f.rounded_recommended,
  case when f.rounded_recommended<=0 then 0
       else ceil(f.rounded_recommended::numeric/f.units_per_case)::integer end,
  f.best_supplier_id,f.best_supplier_name,f.best_recent_cost,
  f.committed_qty,f.timely_qty,f.pending_qty,f.earliest_inbound,f.action_code,
  case
    when f.current_stock=0 and f.pending_qty>0 then
      'Out of stock. A draft/approval-stage PO already exists; review it instead of creating another.'
    when f.current_stock=0 and f.committed_qty>0 and f.earliest_inbound is null then
      'Out of stock. An inbound PO exists but has no expected date; confirm supplier ETA.'
    when f.current_stock=0 then
      'Out of stock with recent demand. Review the purchase plan now.'
    when f.action_code='EXPEDITE_INBOUND' then
      'Recorded inbound stock may arrive after current stock runs out; review or expedite the PO.'
    when f.action_code='CHECK_ETA' then
      'An inbound PO exists without a reliable expected date; confirm ETA before ordering again.'
    when f.action_code='REVIEW_EXISTING_PO' then
      'Reorder threshold reached, but a draft/approval-stage PO already exists. Review that PO first.'
    when f.days_cover<=f.lead_days then
      'Current stock may not last through the configured supplier delivery window.'
    else
      'Current stock has entered the delivery plus safety-stock window.'
  end,
  md5(concat_ws('|',
    f.severity,
    floor(f.days_cover)::integer::text,
    f.action_code,
    case when f.rounded_recommended<=0 then '0'
         else ceil(f.rounded_recommended::numeric/f.units_per_case)::integer::text end,
    coalesce(f.earliest_inbound::text,'NO_ETA')
  ))
from final f
order by case f.severity when 'CRITICAL' then 1 else 2 end,
         f.days_cover,f.product_name;
$function$;

revoke all on function public.purchase_alert_candidates_v1() from public, anon;
grant execute on function public.purchase_alert_candidates_v1() to authenticated;

create or replace function public.purchase_alert_snapshot_v1(p_claim boolean default false)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_enabled boolean:=false;
  v_row record;
  v_state public.purchase_alert_states%rowtype;
  v_alerts jsonb:='[]'::jsonb;
  v_active integer:=0;
  v_due integer:=0;
  v_returned integer:=0;
  v_should_notify boolean:=false;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();

  select coalesce(ss.smart_purchase_alerts_enabled,false)
  into v_enabled from public.shop_settings ss where ss.shop_id=v_shop;

  if not coalesce(v_enabled,false) then
    return jsonb_build_object(
      'enabled',false,'active_count',0,'returned_count',0,'due_count',0,
      'delivery_lead_days',4,'safety_stock_days',2,'reminder_hours',1,'alerts','[]'::jsonb
    );
  end if;

  if p_claim then
    perform pg_advisory_xact_lock(hashtextextended('purchase-alert:'||v_shop::text,0));
  end if;

  select count(*)::integer into v_active from public.purchase_alert_candidates_v1();

  update public.purchase_alert_states s
  set snoozed_until=null,last_condition_signature=null,updated_at=now()
  where s.shop_id=v_shop and s.alert_type='REORDER'
    and s.last_condition_signature is not null
    and not exists (
      select 1 from public.purchase_alert_candidates_v1() c where c.product_id=s.product_id
    );

  for v_row in select * from public.purchase_alert_candidates_v1() limit 50
  loop
    v_should_notify:=false;
    if p_claim then
      select * into v_state
      from public.purchase_alert_states
      where shop_id=v_shop and product_id=v_row.product_id and alert_type='REORDER'
      for update;

      if not found then
        insert into public.purchase_alert_states(
          shop_id,product_id,alert_type,last_condition_signature,
          last_notified_at,snoozed_until,last_seen_at,updated_at
        ) values(v_shop,v_row.product_id,'REORDER',v_row.condition_signature,null,null,now(),now())
        returning * into v_state;
      else
        update public.purchase_alert_states
        set last_condition_signature=v_row.condition_signature,last_seen_at=now(),updated_at=now()
        where shop_id=v_shop and product_id=v_row.product_id and alert_type='REORDER'
        returning * into v_state;
      end if;

      v_should_notify :=
        coalesce(v_state.snoozed_until,'-infinity'::timestamptz)<=now()
        and (v_state.last_notified_at is null or v_state.last_notified_at<=now()-interval '1 hour');

      if v_should_notify then
        update public.purchase_alert_states
        set last_notified_at=now(),updated_at=now()
        where shop_id=v_shop and product_id=v_row.product_id and alert_type='REORDER';
        v_due:=v_due+1;
      end if;
    end if;

    v_returned:=v_returned+1;
    v_alerts:=v_alerts||jsonb_build_array(jsonb_build_object(
      'product_id',v_row.product_id,
      'product_name',v_row.product_name,
      'priority',v_row.priority,
      'current_stock',v_row.current_stock,
      'units_per_case',v_row.units_per_case,
      'units_sold_30d',v_row.units_sold_30d,
      'avg_daily',v_row.avg_daily,
      'days_cover',v_row.days_cover,
      'delivery_lead_days',v_row.delivery_lead_days,
      'safety_stock_days',v_row.safety_stock_days,
      'recommended_quantity',v_row.recommended_quantity,
      'recommended_cases',v_row.recommended_cases,
      'best_supplier_id',v_row.best_supplier_id,
      'best_supplier_name',v_row.best_supplier_name,
      'best_recent_cost',v_row.best_recent_cost,
      'committed_inbound_qty',v_row.committed_inbound_qty,
      'timely_inbound_qty',v_row.timely_inbound_qty,
      'pending_po_qty',v_row.pending_po_qty,
      'earliest_inbound_date',v_row.earliest_inbound_date,
      'action_kind',v_row.action_kind,
      'message',v_row.message,
      'should_notify',v_should_notify
    ));
  end loop;

  return jsonb_build_object(
    'enabled',true,'active_count',v_active,'returned_count',v_returned,'due_count',v_due,
    'delivery_lead_days',4,'safety_stock_days',2,'reminder_hours',1,'alerts',v_alerts
  );
end;
$function$;

revoke all on function public.purchase_alert_snapshot_v1(boolean) from public, anon;
grant execute on function public.purchase_alert_snapshot_v1(boolean) to authenticated;

create or replace function public.snooze_all_purchase_alerts_v1(p_days integer)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_until timestamptz;
  v_count integer:=0;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  if p_days not in (1,2) then raise exception 'PURCHASE_ALERT_SNOOZE_DAYS_INVALID'; end if;
  v_until:=now()+make_interval(days=>p_days);

  insert into public.purchase_alert_states(
    shop_id,product_id,alert_type,last_condition_signature,
    last_notified_at,snoozed_until,last_seen_at,updated_at
  )
  select v_shop,c.product_id,'REORDER',c.condition_signature,null,v_until,now(),now()
  from public.purchase_alert_candidates_v1() c
  on conflict (shop_id,product_id,alert_type) do update
  set last_condition_signature=excluded.last_condition_signature,
      snoozed_until=excluded.snoozed_until,
      last_seen_at=excluded.last_seen_at,
      updated_at=excluded.updated_at;

  get diagnostics v_count=row_count;
  perform public.write_audit(
    v_shop,'PURCHASE_ALERT_GROUP_SNOOZED','purchase_alert',v_shop::text,
    null,null,jsonb_build_object('days',p_days,'snoozed_until',v_until,'updated_count',v_count)
  );
  return jsonb_build_object('updated_count',v_count,'snoozed_until',v_until);
end;
$function$;

revoke all on function public.snooze_all_purchase_alerts_v1(integer) from public, anon;
grant execute on function public.snooze_all_purchase_alerts_v1(integer) to authenticated;

create or replace function public.dismiss_all_purchase_alerts_v1()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_count integer:=0;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();

  insert into public.purchase_alert_states(
    shop_id,product_id,alert_type,last_condition_signature,
    last_notified_at,snoozed_until,last_seen_at,updated_at
  )
  select v_shop,c.product_id,'REORDER',c.condition_signature,now(),null,now(),now()
  from public.purchase_alert_candidates_v1() c
  on conflict (shop_id,product_id,alert_type) do update
  set last_condition_signature=excluded.last_condition_signature,
      last_notified_at=excluded.last_notified_at,
      snoozed_until=null,
      last_seen_at=excluded.last_seen_at,
      updated_at=excluded.updated_at;

  get diagnostics v_count=row_count;
  perform public.write_audit(
    v_shop,'PURCHASE_ALERT_GROUP_DISMISSED','purchase_alert',v_shop::text,
    null,null,jsonb_build_object('reminder_hours',1,'updated_count',v_count)
  );
  return jsonb_build_object('updated_count',v_count,'reminder_hours',1);
end;
$function$;

revoke all on function public.dismiss_all_purchase_alerts_v1() from public, anon;
grant execute on function public.dismiss_all_purchase_alerts_v1() to authenticated;
