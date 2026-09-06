create table if not exists public.saas_platform_admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.saas_shop_subscriptions (
  shop_id uuid primary key,
  plan_code text not null default 'BASIC' check (plan_code in ('BASIC','PLUS','PRO','ENTERPRISE')),
  status text not null default 'ACTIVE' check (status in ('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','EXPIRED','CANCELLED')),
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  grace_ends_at timestamptz,
  feature_overrides jsonb not null default '{}'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.saas_demo_accounts (
  user_id uuid primary key,
  active boolean not null default true,
  trial_days integer not null default 2 check (trial_days between 1 and 30),
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saas_runtime_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.saas_announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  severity text not null default 'INFO' check (severity in ('INFO','SUCCESS','WARNING','CRITICAL')),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.saas_platform_admins enable row level security;
alter table public.saas_shop_subscriptions enable row level security;
alter table public.saas_demo_accounts enable row level security;
alter table public.saas_runtime_settings enable row level security;
alter table public.saas_announcements enable row level security;

revoke all on public.saas_platform_admins from anon, authenticated;
revoke all on public.saas_shop_subscriptions from anon, authenticated;
revoke all on public.saas_demo_accounts from anon, authenticated;
revoke all on public.saas_runtime_settings from anon, authenticated;
revoke all on public.saas_announcements from anon, authenticated;

insert into public.saas_runtime_settings(setting_key, setting_value)
values
  ('app_version', '"V4"'::jsonb),
  ('latest_version', '"V4"'::jsonb),
  ('minimum_supported_version', '"V4"'::jsonb),
  ('force_update', 'false'::jsonb),
  ('update_message', '""'::jsonb)
on conflict (setting_key) do nothing;

create or replace function public.saas_is_platform_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists(select 1 from public.saas_platform_admins a where a.user_id = p_user_id);
$$;

create or replace function public.my_saas_context()
returns table(
  allowed boolean,
  reason text,
  mode text,
  plan_code text,
  subscription_status text,
  trial_ends_at timestamptz,
  expires_at timestamptz,
  is_platform_admin boolean,
  app_version text,
  latest_version text,
  minimum_supported_version text,
  force_update boolean,
  update_message text,
  announcement_message text,
  announcement_severity text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_demo public.saas_demo_accounts%rowtype;
  v_sub public.saas_shop_subscriptions%rowtype;
  v_admin boolean := false;
  v_now timestamptz := now();
  v_allowed boolean := true;
  v_reason text := 'ACTIVE';
  v_mode text := 'LIVE';
  v_plan text := 'LEGACY';
  v_status text := 'ACTIVE';
  v_trial_end timestamptz := null;
  v_expiry timestamptz := null;
  v_app text := 'V4';
  v_latest text := 'V4';
  v_min text := 'V4';
  v_force boolean := false;
  v_update text := '';
  v_announcement text := '';
  v_severity text := 'INFO';
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_profile from public.profiles where id = v_uid limit 1;
  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  v_admin := public.saas_is_platform_admin(v_uid);

  select * into v_demo from public.saas_demo_accounts where user_id = v_uid and active = true;
  if found then
    v_mode := 'DEMO';
    v_plan := 'DEMO';
    v_status := 'TRIALING';
    if v_demo.trial_starts_at is null then
      update public.saas_demo_accounts
         set trial_starts_at = v_now,
             trial_ends_at = v_now + make_interval(days => trial_days),
             updated_at = v_now
       where user_id = v_uid
       returning * into v_demo;
    end if;
    v_trial_end := v_demo.trial_ends_at;
    v_expiry := v_demo.trial_ends_at;
    if v_demo.trial_ends_at is null or v_demo.trial_ends_at <= v_now then
      v_allowed := false;
      v_status := 'EXPIRED';
      v_reason := 'DEMO_TRIAL_EXPIRED';
    end if;
  else
    select * into v_sub from public.saas_shop_subscriptions where shop_id = v_profile.shop_id;
    if found then
      v_plan := v_sub.plan_code;
      v_status := v_sub.status;
      v_trial_end := v_sub.trial_ends_at;
      v_expiry := coalesce(v_sub.current_period_ends_at, v_sub.trial_ends_at);

      if v_sub.status = 'TRIALING' then
        v_allowed := v_sub.trial_ends_at is not null and v_sub.trial_ends_at > v_now;
        if not v_allowed then v_reason := 'TRIAL_EXPIRED'; end if;
      elsif v_sub.status = 'ACTIVE' then
        v_allowed := v_sub.current_period_ends_at is null or v_sub.current_period_ends_at > v_now;
        if not v_allowed then v_reason := 'SUBSCRIPTION_EXPIRED'; end if;
      elsif v_sub.status = 'PAST_DUE' then
        v_allowed := v_sub.grace_ends_at is not null and v_sub.grace_ends_at > v_now;
        if not v_allowed then v_reason := 'PAST_DUE'; end if;
      else
        v_allowed := false;
        v_reason := v_sub.status;
      end if;
    end if;
  end if;

  if v_admin then
    v_allowed := true;
    if v_reason <> 'ACTIVE' then v_reason := 'PLATFORM_ADMIN_OVERRIDE'; end if;
  end if;

  select trim(both '"' from setting_value::text) into v_app from public.saas_runtime_settings where setting_key='app_version';
  select trim(both '"' from setting_value::text) into v_latest from public.saas_runtime_settings where setting_key='latest_version';
  select trim(both '"' from setting_value::text) into v_min from public.saas_runtime_settings where setting_key='minimum_supported_version';
  select coalesce((setting_value::text)::boolean,false) into v_force from public.saas_runtime_settings where setting_key='force_update';
  select trim(both '"' from setting_value::text) into v_update from public.saas_runtime_settings where setting_key='update_message';

  select a.message, a.severity
    into v_announcement, v_severity
    from public.saas_announcements a
   where a.active = true
     and a.starts_at <= v_now
     and (a.ends_at is null or a.ends_at > v_now)
   order by a.created_at desc
   limit 1;

  return query select
    v_allowed,
    v_reason,
    v_mode,
    v_plan,
    v_status,
    v_trial_end,
    v_expiry,
    v_admin,
    coalesce(v_app,'V4'),
    coalesce(v_latest,'V4'),
    coalesce(v_min,'V4'),
    coalesce(v_force,false),
    coalesce(v_update,''),
    coalesce(v_announcement,''),
    coalesce(v_severity,'INFO');
end;
$$;

create or replace function public.saas_admin_set_account_by_email(
  p_email text,
  p_plan_code text default 'BASIC',
  p_status text default 'ACTIVE',
  p_expires_at timestamptz default null,
  p_demo boolean default false,
  p_trial_days integer default 2
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid;
  v_shop uuid;
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  select id, shop_id into v_uid, v_shop from public.profiles where lower(email)=lower(trim(p_email)) order by created_at asc limit 1;
  if v_uid is null then raise exception 'ACCOUNT_NOT_FOUND'; end if;

  if p_demo then
    insert into public.saas_demo_accounts(user_id,active,trial_days,trial_starts_at,trial_ends_at,updated_at)
    values(v_uid,true,greatest(1,least(coalesce(p_trial_days,2),30)),null,null,now())
    on conflict(user_id) do update set active=true,trial_days=excluded.trial_days,trial_starts_at=null,trial_ends_at=null,updated_at=now();
  else
    delete from public.saas_demo_accounts where user_id=v_uid;
    insert into public.saas_shop_subscriptions(shop_id,plan_code,status,current_period_ends_at,updated_at)
    values(v_shop,upper(p_plan_code),upper(p_status),p_expires_at,now())
    on conflict(shop_id) do update set plan_code=excluded.plan_code,status=excluded.status,current_period_ends_at=excluded.current_period_ends_at,updated_at=now();
  end if;

  return jsonb_build_object('ok',true,'user_id',v_uid,'shop_id',v_shop,'demo',p_demo);
end;
$$;

create or replace function public.saas_admin_set_runtime(
  p_latest_version text,
  p_minimum_supported_version text,
  p_force_update boolean,
  p_update_message text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  insert into public.saas_runtime_settings(setting_key,setting_value,updated_at,updated_by)
  values
    ('latest_version',to_jsonb(coalesce(p_latest_version,'V4')),now(),auth.uid()),
    ('minimum_supported_version',to_jsonb(coalesce(p_minimum_supported_version,'V4')),now(),auth.uid()),
    ('force_update',to_jsonb(coalesce(p_force_update,false)),now(),auth.uid()),
    ('update_message',to_jsonb(coalesce(p_update_message,'')),now(),auth.uid())
  on conflict(setting_key) do update set setting_value=excluded.setting_value,updated_at=now(),updated_by=auth.uid();
end;
$$;

create or replace function public.saas_admin_publish_announcement(
  p_message text,
  p_severity text default 'INFO',
  p_hours integer default 24
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_id uuid;
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  update public.saas_announcements set active=false where active=true;
  insert into public.saas_announcements(message,severity,active,starts_at,ends_at,created_by)
  values(trim(p_message),upper(p_severity),true,now(),now()+make_interval(hours=>greatest(1,least(coalesce(p_hours,24),720))),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.saas_admin_list_accounts()
returns table(user_id uuid,email text,full_name text,role text,shop_id uuid,demo boolean,plan_code text,status text,expires_at timestamptz)
language sql
security definer
set search_path = public, auth
as $$
  select p.id,p.email,p.full_name,p.role,p.shop_id,
         (d.user_id is not null and d.active) as demo,
         case when d.user_id is not null and d.active then 'DEMO' else coalesce(s.plan_code,'LEGACY') end,
         case when d.user_id is not null and d.active then case when d.trial_ends_at is not null and d.trial_ends_at<=now() then 'EXPIRED' else 'TRIALING' end else coalesce(s.status,'ACTIVE') end,
         case when d.user_id is not null and d.active then d.trial_ends_at else s.current_period_ends_at end
    from public.profiles p
    left join public.saas_demo_accounts d on d.user_id=p.id
    left join public.saas_shop_subscriptions s on s.shop_id=p.shop_id
   where public.saas_is_platform_admin(auth.uid())
   order by p.created_at desc;
$$;

grant execute on function public.saas_is_platform_admin(uuid) to authenticated;
grant execute on function public.my_saas_context() to authenticated;
grant execute on function public.saas_admin_set_account_by_email(text,text,text,timestamptz,boolean,integer) to authenticated;
grant execute on function public.saas_admin_set_runtime(text,text,boolean,text) to authenticated;
grant execute on function public.saas_admin_publish_announcement(text,text,integer) to authenticated;
grant execute on function public.saas_admin_list_accounts() to authenticated;;
