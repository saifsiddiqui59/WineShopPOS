begin;

-- Public read-only helpers do not need SECURITY DEFINER because their tables have safe RLS policies.
create or replace function public.get_subscription_catalog()
returns table(
  plan_code text,
  display_name text,
  monthly_price numeric,
  annual_price numeric,
  currency_code text,
  trial_days integer,
  features jsonb,
  limits jsonb
)
language sql
stable
security invoker
set search_path=public
as $$
  select p.plan_code,p.display_name,p.monthly_price,p.annual_price,p.currency_code,p.trial_days,p.features,p.limits
  from public.subscription_plans p
  where p.active=true
  order by p.sort_order,p.plan_code;
$$;

create or replace function public.get_public_runtime_config()
returns table(
  environment_code text,
  current_version text,
  minimum_supported_version text,
  force_update boolean,
  update_message text,
  flash_enabled boolean,
  flash_level text,
  flash_message text,
  maintenance_mode boolean,
  maintenance_message text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path=public
as $$
  select c.environment_code,c.current_version,c.minimum_supported_version,c.force_update,c.update_message,c.flash_enabled,c.flash_level,c.flash_message,c.maintenance_mode,c.maintenance_message,c.updated_at
  from public.platform_runtime_config c
  where c.environment_code='DEFAULT'
  limit 1;
$$;

revoke execute on function public.my_platform_admin_status() from public, anon;
revoke execute on function public.my_subscription() from public, anon;
revoke execute on function public.platform_list_shops() from public, anon;
revoke execute on function public.platform_set_shop_subscription(uuid,text,text,timestamptz,text) from public, anon;
revoke execute on function public.platform_start_trial(uuid,text,integer,text) from public, anon;
revoke execute on function public.platform_set_runtime_config(text,text,boolean,text,boolean,text,text,boolean,text) from public, anon;
revoke execute on function public.platform_update_plan(text,text,numeric,numeric,integer,boolean) from public, anon;
revoke execute on function public.platform_subscription_events(integer) from public, anon;

revoke execute on function public.get_subscription_catalog() from public;
revoke execute on function public.get_public_runtime_config() from public;
grant execute on function public.get_subscription_catalog() to anon, authenticated;
grant execute on function public.get_public_runtime_config() to anon, authenticated;
grant execute on function public.my_platform_admin_status() to authenticated;
grant execute on function public.my_subscription() to authenticated;
grant execute on function public.platform_list_shops() to authenticated;
grant execute on function public.platform_set_shop_subscription(uuid,text,text,timestamptz,text) to authenticated;
grant execute on function public.platform_start_trial(uuid,text,integer,text) to authenticated;
grant execute on function public.platform_set_runtime_config(text,text,boolean,text,boolean,text,text,boolean,text) to authenticated;
grant execute on function public.platform_update_plan(text,text,numeric,numeric,integer,boolean) to authenticated;
grant execute on function public.platform_subscription_events(integer) to authenticated;

commit;;
