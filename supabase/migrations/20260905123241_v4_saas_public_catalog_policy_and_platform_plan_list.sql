begin;

drop policy if exists subscription_plans_read on public.subscription_plans;
create policy subscription_plans_read on public.subscription_plans
for select to anon, authenticated
using (active = true);

create or replace function public.platform_list_plans()
returns table(
  plan_code text,
  display_name text,
  monthly_price numeric,
  annual_price numeric,
  currency_code text,
  trial_days integer,
  features jsonb,
  limits jsonb,
  active boolean,
  sort_order integer
)
language plpgsql
stable
security definer
set search_path=public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'PLATFORM_ADMIN_REQUIRED';
  end if;
  return query
  select p.plan_code,p.display_name,p.monthly_price,p.annual_price,p.currency_code,
         p.trial_days,p.features,p.limits,p.active,p.sort_order
  from public.subscription_plans p
  order by p.sort_order,p.plan_code;
end;
$$;

revoke execute on function public.platform_list_plans() from public, anon;
grant execute on function public.platform_list_plans() to authenticated;

commit;;
