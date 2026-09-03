create or replace function public.loss_control_exceptions_v3(p_days integer default 30)
returns table(
  severity text,
  exception_type text,
  event_time timestamptz,
  summary text,
  amount numeric,
  entity_id text,
  action_path text
)
language sql
stable
security definer
set search_path=public
as $$
  with base as (
    select * from public.loss_control_exceptions_v2(p_days)
  )
  select
    b.severity,
    b.exception_type,
    b.event_time,
    b.summary,
    b.amount,
    b.entity_id,
    b.action_path
  from base b
  where not (
    b.exception_type='STOCK_ADJUSTMENT'
    and exists (
      select 1
      from public.stock_movements sm
      join public.purchase_item_corrections c
        on c.shop_id=sm.shop_id
       and c.purchase_id=sm.reference_id
       and c.product_id=sm.product_id
       and c.quantity_delta=sm.quantity_change
       and c.created_at=sm.created_at
       and trim(c.reason)=trim(coalesce(sm.notes,''))
      where sm.shop_id=public.assert_shop_access()
        and sm.id::text=b.entity_id
        and sm.movement_type='STOCK_CORRECTION'
        and sm.reference_type='PURCHASE'
    )
  )
  order by case b.severity when 'HIGH' then 1 when 'MEDIUM' then 2 else 3 end,
           b.event_time desc;
$$;

create or replace function public.loss_control_resolved_activity_v1(p_days integer default 30)
returns table(
  activity_type text,
  event_time timestamptz,
  summary text,
  quantity_change integer,
  entity_id text,
  action_path text,
  status text
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  if public.current_user_role()<>'ADMIN' then
    raise exception 'ADMIN_REQUIRED';
  end if;

  return query
  select
    'AUDITED_PURCHASE_CORRECTION'::text,
    c.created_at,
    coalesce(pr.product_name,'Product')
      ||' · '
      ||case when c.quantity_delta>=0 then '+' else '' end
      ||c.quantity_delta::text
      ||' bottles · '
      ||coalesce(pu.purchase_number,'Purchase')
      ||case when nullif(trim(coalesce(pu.invoice_number,'')),'') is not null then ' · Invoice '||pu.invoice_number else '' end
      ||' · '
      ||c.reason,
    c.quantity_delta,
    c.id::text,
    '/purchasing/receipts/'||c.purchase_id::text,
    'AUDITED'::text
  from public.purchase_item_corrections c
  join public.stock_movements sm
    on sm.shop_id=c.shop_id
   and sm.reference_type='PURCHASE'
   and sm.reference_id=c.purchase_id
   and sm.product_id=c.product_id
   and sm.movement_type='STOCK_CORRECTION'
   and sm.quantity_change=c.quantity_delta
   and sm.created_at=c.created_at
   and trim(coalesce(sm.notes,''))=trim(c.reason)
  left join public.products pr on pr.id=c.product_id and pr.shop_id=c.shop_id
  left join public.purchases pu on pu.id=c.purchase_id and pu.shop_id=c.shop_id
  where c.shop_id=v_shop
    and c.created_at>=now()-(greatest(p_days,1)||' days')::interval
  order by c.created_at desc;
end;
$$;

grant execute on function public.loss_control_exceptions_v3(integer) to authenticated;
grant execute on function public.loss_control_resolved_activity_v1(integer) to authenticated;

