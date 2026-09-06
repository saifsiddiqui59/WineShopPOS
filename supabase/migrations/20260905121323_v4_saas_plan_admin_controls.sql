begin;

create or replace function public.platform_update_plan(
  p_plan_code text,
  p_display_name text,
  p_monthly_price numeric,
  p_annual_price numeric,
  p_trial_days integer,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_plan text := upper(trim(coalesce(p_plan_code,'')));
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if v_plan='' then raise exception 'PLAN_CODE_REQUIRED'; end if;
  if coalesce(p_monthly_price,0) < 0 or coalesce(p_annual_price,0) < 0 then raise exception 'INVALID_PLAN_PRICE'; end if;
  if coalesce(p_trial_days,0) < 0 or coalesce(p_trial_days,0) > 90 then raise exception 'INVALID_TRIAL_DAYS'; end if;

  update public.subscription_plans
     set display_name=coalesce(nullif(trim(p_display_name),''),display_name),
         monthly_price=coalesce(p_monthly_price,monthly_price),
         annual_price=coalesce(p_annual_price,annual_price),
         trial_days=coalesce(p_trial_days,trial_days),
         active=coalesce(p_active,active),
         updated_at=now()
   where plan_code=v_plan;
  if not found then raise exception 'PLAN_NOT_FOUND'; end if;
end;
$$;

create or replace function public.platform_subscription_events(p_limit integer default 100)
returns table(
  id uuid,
  shop_id uuid,
  shop_name text,
  old_status text,
  new_status text,
  old_plan_code text,
  new_plan_code text,
  effective_at timestamptz,
  expires_at timestamptz,
  reason text,
  changed_by uuid
)
language plpgsql
stable
security definer
set search_path=public
as $$
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  return query
  select e.id,e.shop_id,s.name,e.old_status,e.new_status,e.old_plan_code,e.new_plan_code,e.effective_at,e.expires_at,e.reason,e.changed_by
  from public.shop_subscription_events e
  join public.shops s on s.id=e.shop_id
  order by e.created_at desc
  limit greatest(1,least(coalesce(p_limit,100),500));
end;
$$;

grant execute on function public.platform_update_plan(text,text,numeric,numeric,integer,boolean) to authenticated;
grant execute on function public.platform_subscription_events(integer) to authenticated;

commit;;
