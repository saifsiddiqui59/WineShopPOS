begin;

alter table public.shops add column if not exists subscription_expires_at timestamptz;

create table if not exists public.subscription_plans (
  plan_code text primary key,
  display_name text not null,
  monthly_price numeric(12,2) not null default 0,
  annual_price numeric(12,2) not null default 0,
  currency_code text not null default 'INR',
  trial_days integer not null default 2 check (trial_days between 0 and 90),
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.subscription_plans(plan_code,display_name,monthly_price,annual_price,currency_code,trial_days,features,limits,active,sort_order)
values
  ('BASIC','Basic',999,9990,'INR',2,'["POS","PRODUCTS","INVENTORY","PURCHASES","REPORTS_BASIC"]'::jsonb,'{"max_users":3,"max_shops":1}'::jsonb,true,10),
  ('PLUS','Plus',1499,14990,'INR',2,'["POS","PRODUCTS","INVENTORY","PURCHASES","REPORTS_BASIC","OFFLINE","OCR","PROCUREMENT","INVENTORY_INTELLIGENCE","CUSTOMERS"]'::jsonb,'{"max_users":7,"max_shops":1}'::jsonb,true,20),
  ('PRO','Pro',2499,24990,'INR',2,'["POS","PRODUCTS","INVENTORY","PURCHASES","REPORTS_BASIC","OFFLINE","OCR","PROCUREMENT","INVENTORY_INTELLIGENCE","CUSTOMERS","OWNER_CENTER","AI","PROFIT_INTELLIGENCE","EXCEPTIONS","WHATSAPP","ADVANCED_REPORTS"]'::jsonb,'{"max_users":15,"max_shops":5}'::jsonb,true,30)
on conflict (plan_code) do update set
  display_name=excluded.display_name,
  monthly_price=excluded.monthly_price,
  annual_price=excluded.annual_price,
  currency_code=excluded.currency_code,
  trial_days=excluded.trial_days,
  features=excluded.features,
  limits=excluded.limits,
  active=excluded.active,
  sort_order=excluded.sort_order,
  updated_at=now();

create table if not exists public.shop_subscription_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  old_status text,
  new_status text not null,
  old_plan_code text,
  new_plan_code text,
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  reason text,
  changed_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_runtime_config (
  environment_code text primary key,
  current_version text not null default 'V4',
  minimum_supported_version text,
  force_update boolean not null default false,
  update_message text,
  flash_enabled boolean not null default false,
  flash_level text not null default 'INFO',
  flash_message text,
  maintenance_mode boolean not null default false,
  maintenance_message text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

insert into public.platform_runtime_config(environment_code,current_version,minimum_supported_version,force_update,update_message,flash_enabled,flash_level,flash_message,maintenance_mode,maintenance_message)
values ('DEV','V4',null,false,null,false,'INFO',null,false,null)
on conflict (environment_code) do nothing;

alter table public.subscription_plans enable row level security;
alter table public.shop_subscription_events enable row level security;
alter table public.platform_runtime_config enable row level security;

drop policy if exists subscription_plans_read on public.subscription_plans;
create policy subscription_plans_read on public.subscription_plans
for select to anon, authenticated using (active=true or public.is_platform_admin());

drop policy if exists subscription_plans_platform_write on public.subscription_plans;
create policy subscription_plans_platform_write on public.subscription_plans
for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists runtime_config_read on public.platform_runtime_config;
create policy runtime_config_read on public.platform_runtime_config
for select to anon, authenticated using (true);

drop policy if exists runtime_config_platform_write on public.platform_runtime_config;
create policy runtime_config_platform_write on public.platform_runtime_config
for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists subscription_events_platform_read on public.shop_subscription_events;
create policy subscription_events_platform_read on public.shop_subscription_events
for select to authenticated using (public.is_platform_admin());

create or replace function public.shop_access_allowed(p_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from public.shops s
    where s.id=p_shop_id
      and s.active=true
      and s.access_enabled=true
      and s.subscription_status in ('TRIAL','ACTIVE')
      and (
        (s.subscription_expires_at is not null and s.subscription_expires_at > now())
        or
        (s.subscription_expires_at is null and (s.subscription_end_date is null or s.subscription_end_date >= current_date))
      )
  );
$$;

create or replace function public.my_platform_admin_status()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select public.is_platform_admin();
$$;

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
security definer
set search_path=public
as $$
  select p.plan_code,p.display_name,p.monthly_price,p.annual_price,p.currency_code,p.trial_days,p.features,p.limits
  from public.subscription_plans p
  where p.active=true
  order by p.sort_order,p.plan_code;
$$;

create or replace function public.my_subscription()
returns table(
  shop_id uuid,
  shop_name text,
  plan_code text,
  plan_name text,
  subscription_status text,
  subscription_end_date date,
  subscription_expires_at timestamptz,
  allowed boolean,
  monthly_price numeric,
  annual_price numeric,
  currency_code text,
  features jsonb,
  limits jsonb
)
language sql
stable
security definer
set search_path=public
as $$
  select s.id,s.name,s.plan_code,coalesce(p.display_name,s.plan_code),s.subscription_status,s.subscription_end_date,s.subscription_expires_at,
         public.shop_access_allowed(s.id),p.monthly_price,p.annual_price,coalesce(p.currency_code,'INR'),coalesce(p.features,'[]'::jsonb),coalesce(p.limits,'{}'::jsonb)
  from public.shops s
  left join public.subscription_plans p on p.plan_code=s.plan_code
  where s.id=public.current_shop_id();
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
security definer
set search_path=public
as $$
  select c.environment_code,c.current_version,c.minimum_supported_version,c.force_update,c.update_message,c.flash_enabled,c.flash_level,c.flash_message,c.maintenance_mode,c.maintenance_message,c.updated_at
  from public.platform_runtime_config c
  where c.environment_code='DEV'
  limit 1;
$$;

create or replace function public.platform_list_shops()
returns table(
  shop_id uuid,
  shop_name text,
  plan_code text,
  subscription_status text,
  access_enabled boolean,
  subscription_end_date date,
  subscription_expires_at timestamptz,
  allowed boolean
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
  select s.id,s.name,s.plan_code,s.subscription_status,s.access_enabled,s.subscription_end_date,s.subscription_expires_at,public.shop_access_allowed(s.id)
  from public.shops s
  order by s.name;
end;
$$;

create or replace function public.platform_set_shop_subscription(
  p_shop_id uuid,
  p_status text,
  p_plan_code text,
  p_expires_at timestamptz default null,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_old public.shops%rowtype;
  v_status text := upper(trim(coalesce(p_status,'')));
  v_plan text := upper(trim(coalesce(p_plan_code,'')));
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if v_status not in ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED') then raise exception 'INVALID_SUBSCRIPTION_STATUS'; end if;
  if not exists(select 1 from public.subscription_plans where plan_code=v_plan and active=true) then raise exception 'INVALID_PLAN_CODE'; end if;

  select * into v_old from public.shops where id=p_shop_id for update;
  if not found then raise exception 'SHOP_NOT_FOUND'; end if;

  update public.shops
     set subscription_status=v_status,
         plan_code=v_plan,
         subscription_expires_at=p_expires_at,
         subscription_end_date=case when p_expires_at is null then null else (p_expires_at at time zone 'UTC')::date end,
         updated_at=now()
   where id=p_shop_id;

  insert into public.shop_subscription_events(shop_id,old_status,new_status,old_plan_code,new_plan_code,expires_at,reason,changed_by)
  values(p_shop_id,v_old.subscription_status,v_status,v_old.plan_code,v_plan,p_expires_at,nullif(trim(coalesce(p_reason,'')),''),auth.uid());
end;
$$;

create or replace function public.platform_start_trial(
  p_shop_id uuid,
  p_plan_code text default 'PRO',
  p_trial_days integer default null,
  p_reason text default '2-day demo/trial'
)
returns timestamptz
language plpgsql
security definer
set search_path=public
as $$
declare
  v_days integer;
  v_expires timestamptz;
  v_plan text := upper(trim(coalesce(p_plan_code,'PRO')));
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  select trial_days into v_days from public.subscription_plans where plan_code=v_plan and active=true;
  if v_days is null then raise exception 'INVALID_PLAN_CODE'; end if;
  if p_trial_days is not null then v_days := greatest(1,least(90,p_trial_days)); end if;
  v_expires := now() + make_interval(days => v_days);
  perform public.platform_set_shop_subscription(p_shop_id,'TRIAL',v_plan,v_expires,p_reason);
  return v_expires;
end;
$$;

create or replace function public.platform_set_runtime_config(
  p_current_version text,
  p_minimum_supported_version text default null,
  p_force_update boolean default false,
  p_update_message text default null,
  p_flash_enabled boolean default false,
  p_flash_level text default 'INFO',
  p_flash_message text default null,
  p_maintenance_mode boolean default false,
  p_maintenance_message text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_level text := upper(trim(coalesce(p_flash_level,'INFO')));
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if v_level not in ('INFO','SUCCESS','WARNING','CRITICAL') then raise exception 'INVALID_FLASH_LEVEL'; end if;
  insert into public.platform_runtime_config(environment_code,current_version,minimum_supported_version,force_update,update_message,flash_enabled,flash_level,flash_message,maintenance_mode,maintenance_message,updated_at,updated_by)
  values('DEV',coalesce(nullif(trim(p_current_version),''),'V4'),nullif(trim(coalesce(p_minimum_supported_version,'')),''),coalesce(p_force_update,false),nullif(trim(coalesce(p_update_message,'')),''),coalesce(p_flash_enabled,false),v_level,nullif(trim(coalesce(p_flash_message,'')),''),coalesce(p_maintenance_mode,false),nullif(trim(coalesce(p_maintenance_message,'')),''),now(),auth.uid())
  on conflict(environment_code) do update set
    current_version=excluded.current_version,
    minimum_supported_version=excluded.minimum_supported_version,
    force_update=excluded.force_update,
    update_message=excluded.update_message,
    flash_enabled=excluded.flash_enabled,
    flash_level=excluded.flash_level,
    flash_message=excluded.flash_message,
    maintenance_mode=excluded.maintenance_mode,
    maintenance_message=excluded.maintenance_message,
    updated_at=now(),
    updated_by=auth.uid();
end;
$$;

grant execute on function public.my_platform_admin_status() to authenticated;
grant execute on function public.get_subscription_catalog() to anon, authenticated;
grant execute on function public.my_subscription() to authenticated;
grant execute on function public.get_public_runtime_config() to anon, authenticated;
grant execute on function public.platform_list_shops() to authenticated;
grant execute on function public.platform_set_shop_subscription(uuid,text,text,timestamptz,text) to authenticated;
grant execute on function public.platform_start_trial(uuid,text,integer,text) to authenticated;
grant execute on function public.platform_set_runtime_config(text,text,boolean,text,boolean,text,text,boolean,text) to authenticated;

commit;;
