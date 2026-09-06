begin;

create table if not exists public.saas_platform_admins(
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.saas_shop_subscriptions(
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

create table if not exists public.saas_demo_accounts(
  user_id uuid primary key,
  active boolean not null default true,
  trial_days integer not null default 2 check (trial_days between 1 and 30),
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saas_runtime_settings(
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.saas_announcements(
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

revoke all on public.saas_platform_admins from public, anon, authenticated;
revoke all on public.saas_shop_subscriptions from public, anon, authenticated;
revoke all on public.saas_demo_accounts from public, anon, authenticated;
revoke all on public.saas_runtime_settings from public, anon, authenticated;
revoke all on public.saas_announcements from public, anon, authenticated;

insert into public.saas_runtime_settings(setting_key,setting_value)
values
  ('app_version',to_jsonb('V4'::text)),
  ('latest_version',to_jsonb('V4'::text)),
  ('minimum_supported_version',to_jsonb('V4'::text)),
  ('force_update','false'::jsonb),
  ('update_message',to_jsonb(''::text)),
  ('legal_notice_enabled','false'::jsonb),
  ('legal_notice_document_id','null'::jsonb)
on conflict(setting_key) do nothing;

create or replace function public.saas_is_platform_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,auth as $$
  select exists(select 1 from public.saas_platform_admins a where a.user_id=p_user_id);
$$;

create or replace function public.my_saas_context()
returns table(allowed boolean,reason text,mode text,plan_code text,subscription_status text,trial_ends_at timestamptz,expires_at timestamptz,is_platform_admin boolean,app_version text,latest_version text,minimum_supported_version text,force_update boolean,update_message text,announcement_message text,announcement_severity text)
language plpgsql security definer set search_path=public,auth as $$
declare
  v_uid uuid:=auth.uid(); v_profile public.profiles%rowtype; v_demo public.saas_demo_accounts%rowtype; v_sub public.saas_shop_subscriptions%rowtype;
  v_admin boolean:=false; v_now timestamptz:=now(); v_allowed boolean:=true; v_reason text:='ACTIVE'; v_mode text:='LIVE'; v_plan text:='LEGACY'; v_status text:='ACTIVE';
  v_trial_end timestamptz:=null; v_expiry timestamptz:=null; v_app text:='V4'; v_latest text:='V4'; v_min text:='V4'; v_force boolean:=false; v_update text:=''; v_announcement text:=''; v_severity text:='INFO';
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_profile from public.profiles where id=v_uid limit 1;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  v_admin:=public.saas_is_platform_admin(v_uid);
  select * into v_demo from public.saas_demo_accounts where user_id=v_uid and active=true;
  if found then
    v_mode:='DEMO'; v_plan:='DEMO'; v_status:='TRIALING';
    if v_demo.trial_starts_at is null then
      update public.saas_demo_accounts set trial_starts_at=v_now,trial_ends_at=v_now+make_interval(days=>trial_days),updated_at=v_now where user_id=v_uid returning * into v_demo;
    end if;
    v_trial_end:=v_demo.trial_ends_at; v_expiry:=v_demo.trial_ends_at;
    if v_demo.trial_ends_at is null or v_demo.trial_ends_at<=v_now then v_allowed:=false; v_status:='EXPIRED'; v_reason:='DEMO_TRIAL_EXPIRED'; end if;
  else
    select * into v_sub from public.saas_shop_subscriptions where shop_id=v_profile.shop_id;
    if found then
      v_plan:=v_sub.plan_code; v_status:=v_sub.status; v_trial_end:=v_sub.trial_ends_at; v_expiry:=coalesce(v_sub.current_period_ends_at,v_sub.trial_ends_at);
      if v_sub.status='TRIALING' then v_allowed:=v_sub.trial_ends_at is not null and v_sub.trial_ends_at>v_now; if not v_allowed then v_reason:='TRIAL_EXPIRED'; end if;
      elsif v_sub.status='ACTIVE' then v_allowed:=v_sub.current_period_ends_at is null or v_sub.current_period_ends_at>v_now; if not v_allowed then v_reason:='SUBSCRIPTION_EXPIRED'; end if;
      elsif v_sub.status='PAST_DUE' then v_allowed:=v_sub.grace_ends_at is not null and v_sub.grace_ends_at>v_now; if not v_allowed then v_reason:='PAST_DUE'; end if;
      else v_allowed:=false; v_reason:=v_sub.status; end if;
    end if;
  end if;
  if v_admin then v_allowed:=true; if v_reason<>'ACTIVE' then v_reason:='PLATFORM_ADMIN_OVERRIDE'; end if; end if;
  select trim(both '"' from setting_value::text) into v_app from public.saas_runtime_settings where setting_key='app_version';
  select trim(both '"' from setting_value::text) into v_latest from public.saas_runtime_settings where setting_key='latest_version';
  select trim(both '"' from setting_value::text) into v_min from public.saas_runtime_settings where setting_key='minimum_supported_version';
  select coalesce((setting_value::text)::boolean,false) into v_force from public.saas_runtime_settings where setting_key='force_update';
  select trim(both '"' from setting_value::text) into v_update from public.saas_runtime_settings where setting_key='update_message';
  select a.message,a.severity into v_announcement,v_severity from public.saas_announcements a where a.active=true and a.starts_at<=v_now and (a.ends_at is null or a.ends_at>v_now) order by a.created_at desc limit 1;
  return query select v_allowed,v_reason,v_mode,v_plan,v_status,v_trial_end,v_expiry,v_admin,coalesce(v_app,'V4'),coalesce(v_latest,'V4'),coalesce(v_min,'V4'),coalesce(v_force,false),coalesce(v_update,''),coalesce(v_announcement,''),coalesce(v_severity,'INFO');
end; $$;

create or replace function public.saas_admin_set_account_by_email(p_email text,p_plan_code text default 'BASIC',p_status text default 'ACTIVE',p_expires_at timestamptz default null,p_demo boolean default false,p_trial_days integer default 2)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare v_uid uuid; v_shop uuid;
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  select id,shop_id into v_uid,v_shop from public.profiles where lower(email)=lower(trim(p_email)) order by created_at asc limit 1;
  if v_uid is null then raise exception 'ACCOUNT_NOT_FOUND'; end if;
  if p_demo then
    insert into public.saas_demo_accounts(user_id,active,trial_days,trial_starts_at,trial_ends_at,updated_at) values(v_uid,true,greatest(1,least(coalesce(p_trial_days,2),30)),null,null,now())
    on conflict(user_id) do update set active=true,trial_days=excluded.trial_days,trial_starts_at=null,trial_ends_at=null,updated_at=now();
  else
    delete from public.saas_demo_accounts where user_id=v_uid;
    insert into public.saas_shop_subscriptions(shop_id,plan_code,status,current_period_ends_at,updated_at) values(v_shop,upper(p_plan_code),upper(p_status),p_expires_at,now())
    on conflict(shop_id) do update set plan_code=excluded.plan_code,status=excluded.status,current_period_ends_at=excluded.current_period_ends_at,updated_at=now();
  end if;
  return jsonb_build_object('ok',true,'user_id',v_uid,'shop_id',v_shop,'demo',p_demo);
end; $$;

create or replace function public.saas_admin_set_runtime(p_latest_version text,p_minimum_supported_version text,p_force_update boolean,p_update_message text)
returns void language plpgsql security definer set search_path=public,auth as $$
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  insert into public.saas_runtime_settings(setting_key,setting_value,updated_at,updated_by) values
    ('latest_version',to_jsonb(coalesce(p_latest_version,'V4')),now(),auth.uid()),
    ('minimum_supported_version',to_jsonb(coalesce(p_minimum_supported_version,'V4')),now(),auth.uid()),
    ('force_update',to_jsonb(coalesce(p_force_update,false)),now(),auth.uid()),
    ('update_message',to_jsonb(coalesce(p_update_message,'')),now(),auth.uid())
  on conflict(setting_key) do update set setting_value=excluded.setting_value,updated_at=now(),updated_by=auth.uid();
end; $$;

create or replace function public.saas_admin_publish_announcement(p_message text,p_severity text default 'INFO',p_hours integer default 24)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare v_id uuid;
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if nullif(trim(p_message),'') is null then raise exception 'MESSAGE_REQUIRED'; end if;
  if upper(coalesce(p_severity,'INFO')) not in ('INFO','SUCCESS','WARNING','CRITICAL') then raise exception 'INVALID_SEVERITY'; end if;
  update public.saas_announcements set active=false where active=true;
  insert into public.saas_announcements(message,severity,active,starts_at,ends_at,created_by) values(trim(p_message),upper(p_severity),true,now(),now()+make_interval(hours=>greatest(1,least(coalesce(p_hours,24),720))),auth.uid()) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.saas_admin_list_accounts()
returns table(user_id uuid,email text,full_name text,role text,shop_id uuid,demo boolean,plan_code text,status text,expires_at timestamptz)
language sql security definer set search_path=public,auth as $$
  select p.id,p.email,p.full_name,p.role,p.shop_id,(d.user_id is not null and d.active) as demo,
    case when d.user_id is not null and d.active then 'DEMO' else coalesce(s.plan_code,'LEGACY') end,
    case when d.user_id is not null and d.active then case when d.trial_ends_at is not null and d.trial_ends_at<=now() then 'EXPIRED' else 'TRIALING' end else coalesce(s.status,'ACTIVE') end,
    case when d.user_id is not null and d.active then d.trial_ends_at else s.current_period_ends_at end
  from public.profiles p left join public.saas_demo_accounts d on d.user_id=p.id left join public.saas_shop_subscriptions s on s.shop_id=p.shop_id
  where public.saas_is_platform_admin(auth.uid()) order by p.created_at desc;
$$;

create table if not exists public.onboarding_import_batches(
  id uuid primary key default gen_random_uuid(), shop_id uuid not null,
  import_type text not null check (import_type in ('PRODUCTS_STOCK','SUPPLIERS','CUSTOMERS')),
  source_name text,source_hash text,payload_hash text not null,
  duplicate_policy text not null check (duplicate_policy in ('SKIP','UPDATE','ERROR')),
  rows_total integer not null default 0,rows_applied integer not null default 0,rows_skipped integer not null default 0,
  status text not null default 'APPLIED' check (status in ('APPLIED','FAILED')),
  summary jsonb not null default '{}'::jsonb,created_by uuid,created_at timestamptz not null default now()
);
alter table public.onboarding_import_batches enable row level security;
do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='onboarding_import_batches' and policyname='onboarding_import_batches_select') then
    create policy onboarding_import_batches_select on public.onboarding_import_batches for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
  end if;
end $$;
revoke all on public.onboarding_import_batches from public,anon;
revoke insert,update,delete on public.onboarding_import_batches from authenticated;
grant select on public.onboarding_import_batches to authenticated;

create or replace function public.v4_try_integer(p_value text) returns integer language plpgsql immutable set search_path=public as $$
begin if p_value is null or btrim(p_value)='' then return null; end if; return p_value::integer; exception when others then return null; end; $$;
create or replace function public.v4_try_numeric(p_value text) returns numeric language plpgsql immutable set search_path=public as $$
begin if p_value is null or btrim(p_value)='' then return null; end if; return p_value::numeric; exception when others then return null; end; $$;
revoke all on function public.v4_try_integer(text) from public,anon,authenticated;
revoke all on function public.v4_try_numeric(text) from public,anon,authenticated;

create or replace function public.onboarding_validate_import(p_import_type text,p_rows jsonb,p_duplicate_policy text default 'SKIP')
returns jsonb language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  v_shop uuid; v_type text:=upper(trim(coalesce(p_import_type,''))); v_policy text:=upper(trim(coalesce(p_duplicate_policy,'SKIP')));
  v_errors jsonb:='[]'::jsonb; v_warnings jsonb:='[]'::jsonb; v_seen jsonb:='{}'::jsonb; v_row jsonb; v_idx integer:=0;
  v_name text; v_barcode text; v_mobile text; v_norm text; v_existing uuid; v_current_stock integer; v_size integer; v_units integer; v_opening integer;
  v_purchase numeric; v_mrp numeric; v_selling numeric; v_abv numeric; v_has_sales boolean;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if v_type not in ('PRODUCTS_STOCK','SUPPLIERS','CUSTOMERS') then raise exception 'INVALID_IMPORT_TYPE'; end if;
  if v_policy not in ('SKIP','UPDATE','ERROR') then raise exception 'INVALID_DUPLICATE_POLICY'; end if;
  if p_rows is null or jsonb_typeof(p_rows)<>'array' then raise exception 'ROWS_ARRAY_REQUIRED'; end if;
  if jsonb_array_length(p_rows)=0 then raise exception 'AT_LEAST_ONE_ROW_REQUIRED'; end if;
  if jsonb_array_length(p_rows)>2000 then raise exception 'MAX_2000_ROWS_PER_IMPORT'; end if;
  select exists(select 1 from public.sales where shop_id=v_shop and status='COMPLETED') into v_has_sales;
  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_idx:=v_idx+1;
    if v_type='PRODUCTS_STOCK' then
      v_name:=nullif(btrim(v_row->>'product_name'),''); v_barcode:=nullif(btrim(v_row->>'barcode'),''); v_size:=public.v4_try_integer(v_row->>'size_ml'); v_units:=public.v4_try_integer(v_row->>'units_per_case');
      v_opening:=case when v_row ? 'opening_stock' and nullif(btrim(v_row->>'opening_stock'),'') is not null then public.v4_try_integer(v_row->>'opening_stock') else null end;
      v_purchase:=coalesce(public.v4_try_numeric(v_row->>'purchase_price'),0); v_mrp:=coalesce(public.v4_try_numeric(v_row->>'mrp'),0); v_selling:=coalesce(public.v4_try_numeric(v_row->>'selling_price'),0); v_abv:=public.v4_try_numeric(v_row->>'alcohol_percentage');
      if v_name is null then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','product_name','message','Product name is required')); end if;
      if v_size is null or v_size<=0 then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','size_ml','message','Size ml must be a positive whole number')); end if;
      if v_units is null or v_units<=0 then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','units_per_case','message','Units per case must be a positive whole number')); end if;
      if v_purchase<0 or v_mrp<0 or v_selling<0 then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','price','message','Prices cannot be negative')); end if;
      if v_abv is not null and (v_abv<0 or v_abv>100) then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','alcohol_percentage','message','ABV must be between 0 and 100')); end if;
      if v_opening is not null and v_opening<0 then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','opening_stock','message','Opening stock cannot be negative')); end if;
      if v_barcode is not null then
        v_norm:=lower(v_barcode);
        if v_seen ? v_norm then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','barcode','message','Duplicate barcode appears more than once in this file')); else v_seen:=v_seen||jsonb_build_object(v_norm,v_idx); end if;
        select id into v_existing from public.products where shop_id=v_shop and barcode=v_barcode limit 1;
        if v_existing is not null then
          if v_policy='ERROR' then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','barcode','message','Barcode already exists in Product Master'));
          elsif v_policy='SKIP' then v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message','Existing barcode will be skipped'));
          else v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message','Existing barcode will update Product Master')); end if;
          if v_opening is not null and v_opening>0 then
            select coalesce(quantity,0) into v_current_stock from public.inventory where shop_id=v_shop and product_id=v_existing;
            if coalesce(v_current_stock,0)<>0 then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','opening_stock','message','Opening stock import cannot overwrite non-zero live stock')); end if;
          end if;
        end if;
      else
        v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message','No barcode: duplicate matching is limited for this row'));
      end if;
      if v_opening is not null and v_opening>0 and v_has_sales then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','opening_stock','message','Opening stock import is locked after the first completed WineShopPOS sale; use Stock Count/Adjustment instead')); end if;
    elsif v_type='SUPPLIERS' then
      v_name:=nullif(btrim(v_row->>'supplier_name'),'');
      if v_name is null then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','supplier_name','message','Supplier name is required'));
      else
        v_norm:=regexp_replace(lower(v_name),'[^a-z0-9]+','','g');
        if v_seen ? v_norm then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','supplier_name','message','Duplicate supplier appears more than once in this file')); else v_seen:=v_seen||jsonb_build_object(v_norm,v_idx); end if;
        select id into v_existing from public.suppliers where shop_id=v_shop and regexp_replace(lower(coalesce(supplier_name,'')),'[^a-z0-9]+','','g')=v_norm limit 1;
        if v_existing is not null then if v_policy='ERROR' then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','supplier_name','message','Supplier already exists')); else v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message',case when v_policy='SKIP' then 'Existing supplier will be skipped' else 'Existing supplier will be updated' end)); end if; end if;
      end if;
    else
      v_name:=nullif(btrim(v_row->>'full_name'),''); v_mobile:=nullif(btrim(v_row->>'mobile'),'');
      if v_name is null then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','full_name','message','Customer name is required')); end if;
      if v_mobile is not null then
        v_norm:=regexp_replace(v_mobile,'[^0-9]+','','g');
        if v_norm='' then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','mobile','message','Customer mobile number is invalid'));
        elsif v_seen ? v_norm then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','mobile','message','Duplicate customer mobile appears more than once in this file'));
        else v_seen:=v_seen||jsonb_build_object(v_norm,v_idx); end if;
        select id into v_existing from public.customers where shop_id=v_shop and mobile=v_mobile limit 1;
        if v_existing is not null then if v_policy='ERROR' then v_errors:=v_errors||jsonb_build_array(jsonb_build_object('row',v_idx,'field','mobile','message','Customer mobile already exists')); else v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message',case when v_policy='SKIP' then 'Existing customer will be skipped' else 'Existing customer will be updated' end)); end if; end if;
      else v_warnings:=v_warnings||jsonb_build_array(jsonb_build_object('row',v_idx,'message','Customer has no mobile number; automatic duplicate matching is limited')); end if;
    end if;
    v_existing:=null; v_current_stock:=null;
  end loop;
  return jsonb_build_object('ok',jsonb_array_length(v_errors)=0,'import_type',v_type,'duplicate_policy',v_policy,'rows_total',jsonb_array_length(p_rows),'error_count',jsonb_array_length(v_errors),'warning_count',jsonb_array_length(v_warnings),'errors',v_errors,'warnings',v_warnings);
end; $$;

create or replace function public.onboarding_apply_import(p_import_type text,p_rows jsonb,p_duplicate_policy text default 'SKIP',p_source_name text default null,p_source_hash text default null)
returns jsonb language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  v_shop uuid; v_validation jsonb; v_type text:=upper(trim(coalesce(p_import_type,''))); v_policy text:=upper(trim(coalesce(p_duplicate_policy,'SKIP'))); v_batch uuid; v_payload_hash text; v_row jsonb;
  v_product uuid; v_category uuid; v_existing uuid; v_before integer; v_after integer; v_opening integer; v_applied integer:=0; v_skipped integer:=0; v_name text; v_barcode text; v_mobile text; v_norm text;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  v_validation:=public.onboarding_validate_import(v_type,p_rows,v_policy);
  if coalesce((v_validation->>'ok')::boolean,false) is not true then return v_validation||jsonb_build_object('applied',false); end if;
  v_payload_hash:=encode(extensions.digest(convert_to(p_rows::text,'UTF8'),'sha256'),'hex');
  insert into public.onboarding_import_batches(shop_id,import_type,source_name,source_hash,payload_hash,duplicate_policy,rows_total,created_by)
  values(v_shop,v_type,left(nullif(trim(p_source_name),''),255),left(nullif(trim(p_source_hash),''),128),v_payload_hash,v_policy,jsonb_array_length(p_rows),auth.uid()) returning id into v_batch;
  if v_type='PRODUCTS_STOCK' then
    for v_row in select value from jsonb_array_elements(p_rows) loop
      v_name:=btrim(v_row->>'product_name'); v_barcode:=nullif(btrim(v_row->>'barcode'),''); v_existing:=null;
      if v_barcode is not null then select id into v_existing from public.products where shop_id=v_shop and barcode=v_barcode limit 1; end if;
      if v_existing is not null and v_policy='SKIP' then v_skipped:=v_skipped+1; continue; end if;
      v_category:=null;
      if nullif(btrim(v_row->>'category'),'') is not null then
        select id into v_category from public.categories where shop_id=v_shop and lower(name)=lower(btrim(v_row->>'category')) order by created_at asc limit 1;
        if v_category is null then insert into public.categories(shop_id,name,active) values(v_shop,btrim(v_row->>'category'),true) returning id into v_category; end if;
      end if;
      if v_existing is null then
        insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
        values(v_shop,v_barcode,'AUTO',v_name,nullif(btrim(v_row->>'brand'),''),v_category,nullif(btrim(v_row->>'subcategory'),''),public.v4_try_integer(v_row->>'size_ml'),public.v4_try_numeric(v_row->>'alcohol_percentage'),coalesce(public.v4_try_numeric(v_row->>'purchase_price'),0),coalesce(public.v4_try_numeric(v_row->>'mrp'),0),coalesce(public.v4_try_numeric(v_row->>'selling_price'),0),greatest(coalesce(public.v4_try_integer(v_row->>'minimum_stock'),5),0),greatest(coalesce(public.v4_try_integer(v_row->>'units_per_case'),1),1),true,auth.uid()) returning id into v_product;
        insert into public.inventory(shop_id,product_id,quantity) values(v_shop,v_product,0) on conflict(shop_id,product_id) do nothing;
      else
        v_product:=v_existing;
        update public.products set product_name=v_name,brand=nullif(btrim(v_row->>'brand'),''),category_id=v_category,subcategory=nullif(btrim(v_row->>'subcategory'),''),size_ml=public.v4_try_integer(v_row->>'size_ml'),alcohol_percentage=public.v4_try_numeric(v_row->>'alcohol_percentage'),purchase_price=coalesce(public.v4_try_numeric(v_row->>'purchase_price'),0),mrp=coalesce(public.v4_try_numeric(v_row->>'mrp'),0),selling_price=coalesce(public.v4_try_numeric(v_row->>'selling_price'),0),minimum_stock=greatest(coalesce(public.v4_try_integer(v_row->>'minimum_stock'),5),0),units_per_case=greatest(coalesce(public.v4_try_integer(v_row->>'units_per_case'),1),1),updated_at=now() where id=v_product and shop_id=v_shop;
      end if;
      if v_row ? 'opening_stock' and nullif(btrim(v_row->>'opening_stock'),'') is not null then
        v_opening:=public.v4_try_integer(v_row->>'opening_stock');
        select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update; v_before:=coalesce(v_before,0); v_after:=coalesce(v_opening,0);
        if v_before<>0 and v_before<>v_after then raise exception 'Opening stock changed after validation for product %; import cancelled',v_name; end if;
        update public.inventory set quantity=v_after,updated_at=now() where shop_id=v_shop and product_id=v_product;
        if v_after<>v_before then insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by) values(v_shop,v_product,'OPENING_STOCK',v_after-v_before,v_before,v_after,'ONBOARDING_IMPORT',v_batch,'Existing-shop opening stock import',auth.uid()); end if;
      end if;
      v_applied:=v_applied+1;
    end loop;
  elsif v_type='SUPPLIERS' then
    for v_row in select value from jsonb_array_elements(p_rows) loop
      v_name:=btrim(v_row->>'supplier_name'); v_norm:=regexp_replace(lower(v_name),'[^a-z0-9]+','','g'); v_existing:=null;
      select id into v_existing from public.suppliers where shop_id=v_shop and regexp_replace(lower(coalesce(supplier_name,'')),'[^a-z0-9]+','','g')=v_norm limit 1;
      if v_existing is not null and v_policy='SKIP' then v_skipped:=v_skipped+1; continue; end if;
      if v_existing is null then insert into public.suppliers(shop_id,supplier_name,contact_person,mobile,email,gst_number,address,active) values(v_shop,v_name,nullif(btrim(v_row->>'contact_person'),''),nullif(btrim(v_row->>'mobile'),''),nullif(btrim(v_row->>'email'),''),nullif(btrim(v_row->>'gst_number'),''),nullif(btrim(v_row->>'address'),''),true);
      else update public.suppliers set supplier_name=v_name,contact_person=nullif(btrim(v_row->>'contact_person'),''),mobile=nullif(btrim(v_row->>'mobile'),''),email=nullif(btrim(v_row->>'email'),''),gst_number=nullif(btrim(v_row->>'gst_number'),''),address=nullif(btrim(v_row->>'address'),''),active=true,updated_at=now() where id=v_existing and shop_id=v_shop; end if;
      v_applied:=v_applied+1;
    end loop;
  else
    for v_row in select value from jsonb_array_elements(p_rows) loop
      v_name:=btrim(v_row->>'full_name'); v_mobile:=nullif(btrim(v_row->>'mobile'),''); v_existing:=null;
      if v_mobile is not null then select id into v_existing from public.customers where shop_id=v_shop and mobile=v_mobile limit 1; end if;
      if v_existing is not null and v_policy='SKIP' then v_skipped:=v_skipped+1; continue; end if;
      if v_existing is null then insert into public.customers(shop_id,full_name,mobile,email,notes,active,created_by) values(v_shop,v_name,v_mobile,nullif(btrim(v_row->>'email'),''),nullif(btrim(v_row->>'notes'),''),true,auth.uid());
      else update public.customers set full_name=v_name,email=nullif(btrim(v_row->>'email'),''),notes=nullif(btrim(v_row->>'notes'),''),active=true,updated_at=now() where id=v_existing and shop_id=v_shop; end if;
      v_applied:=v_applied+1;
    end loop;
  end if;
  update public.onboarding_import_batches set rows_applied=v_applied,rows_skipped=v_skipped,summary=jsonb_build_object('rows_total',jsonb_array_length(p_rows),'rows_applied',v_applied,'rows_skipped',v_skipped) where id=v_batch;
  perform public.write_audit(v_shop,'ONBOARDING_IMPORT_APPLIED','onboarding_import',v_batch::text,null,null,jsonb_build_object('import_type',v_type,'rows_total',jsonb_array_length(p_rows),'rows_applied',v_applied,'rows_skipped',v_skipped,'source_hash',left(nullif(trim(p_source_hash),''),128)));
  return jsonb_build_object('ok',true,'applied',true,'batch_id',v_batch,'rows_total',jsonb_array_length(p_rows),'rows_applied',v_applied,'rows_skipped',v_skipped);
end; $$;

revoke all on function public.onboarding_validate_import(text,jsonb,text) from public,anon;
revoke all on function public.onboarding_apply_import(text,jsonb,text,text,text) from public,anon;
grant execute on function public.onboarding_validate_import(text,jsonb,text) to authenticated;
grant execute on function public.onboarding_apply_import(text,jsonb,text,text,text) to authenticated;

create table if not exists public.legal_documents(
  id uuid primary key default gen_random_uuid(),document_type text not null,version text not null,title text not null,content text not null,content_sha256 text not null,
  effective_at timestamptz not null default now(),is_active boolean not null default true,created_at timestamptz not null default now(),unique(document_type,version)
);
create table if not exists public.legal_acceptances(
  id uuid primary key default gen_random_uuid(),user_id uuid not null,shop_id uuid,legal_document_id uuid not null references public.legal_documents(id) on delete restrict,
  email_snapshot text,role_snapshot text,app_version text not null default 'V4',device_id uuid,session_id uuid,user_agent text,source_ip inet,
  acceptance_method text not null default 'CHECKBOX_AND_ACCEPT_BUTTON',accepted_at timestamptz not null default now(),unique(user_id,legal_document_id)
);
alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;
revoke all on public.legal_documents from public,anon,authenticated;
revoke all on public.legal_acceptances from public,anon,authenticated;

with d as (
  select 'PILOT_PRIVACY'::text document_type,'1.0'::text version,'WineShopPOS — Authorized Internal Pilot Use & Privacy Notice'::text title,
  $notice$WineShopPOS is currently provided as private pilot software for authorized internal testing, evaluation and operational use by participating shop users. It is not represented by this notice as a generally available commercial software service or as the product of an incorporated company.

Access is restricted to users authorized by the participating shop. Unauthorized access, copying, redistribution, resale, sublicensing or use outside the approved pilot environment is prohibited except where applicable law provides otherwise.

The pilot may process shop operational information needed to evaluate point-of-sale, product, inventory, purchasing, reporting, security and related functionality. Users should not enter unnecessary sensitive, confidential or personal information.

For authentication, security, troubleshooting, audit and dispute-resolution purposes, WineShopPOS may record the authenticated account identifier, shop association, role, server timestamps, application version, application-generated device and session identifiers, browser/user-agent information, and relevant application audit events. MAC addresses are not collected by this pilot notice. Source IP capture is not enabled by the current pilot implementation.

Business information entered by authorized users remains associated with the participating shop environment and is processed to operate and evaluate WineShopPOS. Demo business data may be temporary and subject to reset according to the demo environment behavior.

When this notice is enabled, selecting the unticked acknowledgement checkbox and choosing ACCEPT AND CONTINUE records the authenticated user's acceptance of this exact version using a server timestamp and document hash.

This pilot notice is a technical and operational acknowledgement and is not a guarantee of legal enforceability. Final commercial terms and privacy wording should be reviewed for the actual deployment and applicable law before general commercial release.$notice$::text content
)
insert into public.legal_documents(document_type,version,title,content,content_sha256,effective_at,is_active)
select document_type,version,title,content,encode(extensions.digest(convert_to(content,'UTF8'),'sha256'),'hex'),now(),true from d
on conflict(document_type,version) do nothing;

create or replace function public.my_legal_notice()
returns table(enabled boolean,document_id uuid,document_type text,version text,title text,content text,content_sha256 text,accepted boolean)
language plpgsql security definer set search_path=public,auth as $$
declare v_uid uuid:=auth.uid(); v_enabled boolean:=false; v_doc uuid; v_is_demo boolean:=false;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select exists(select 1 from public.saas_demo_accounts where user_id=v_uid and active=true) into v_is_demo;
  if v_is_demo then return query select false,null::uuid,null::text,null::text,null::text,null::text,null::text,false; return; end if;
  select coalesce((setting_value::text)::boolean,false) into v_enabled from public.saas_runtime_settings where setting_key='legal_notice_enabled';
  if not coalesce(v_enabled,false) then return query select false,null::uuid,null::text,null::text,null::text,null::text,null::text,false; return; end if;
  begin select nullif(trim(both '"' from setting_value::text),'null')::uuid into v_doc from public.saas_runtime_settings where setting_key='legal_notice_document_id'; exception when others then v_doc:=null; end;
  if v_doc is null then select id into v_doc from public.legal_documents where is_active=true order by effective_at desc,created_at desc limit 1; end if;
  if v_doc is null then raise exception 'LEGAL_DOCUMENT_NOT_CONFIGURED'; end if;
  return query select true,d.id,d.document_type,d.version,d.title,d.content,d.content_sha256,exists(select 1 from public.legal_acceptances a where a.user_id=v_uid and a.legal_document_id=d.id) from public.legal_documents d where d.id=v_doc and d.is_active=true;
end; $$;

create or replace function public.accept_legal_notice(p_document_id uuid,p_device_id uuid default null,p_session_id uuid default null,p_user_agent text default null,p_app_version text default 'V4')
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare v_uid uuid:=auth.uid(); v_profile public.profiles%rowtype; v_context record; v_id uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_profile from public.profiles where id=v_uid limit 1; if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  select * into v_context from public.my_legal_notice() limit 1;
  if not coalesce(v_context.enabled,false) then raise exception 'LEGAL_NOTICE_DISABLED'; end if;
  if v_context.document_id is distinct from p_document_id then raise exception 'LEGAL_DOCUMENT_CHANGED'; end if;
  insert into public.legal_acceptances(user_id,shop_id,legal_document_id,email_snapshot,role_snapshot,app_version,device_id,session_id,user_agent,acceptance_method)
  values(v_uid,v_profile.shop_id,p_document_id,v_profile.email,v_profile.role,coalesce(nullif(trim(p_app_version),''),'V4'),p_device_id,p_session_id,left(nullif(trim(p_user_agent),''),1000),'CHECKBOX_AND_ACCEPT_BUTTON')
  on conflict(user_id,legal_document_id) do update set user_id=excluded.user_id returning id into v_id;
  perform public.write_audit(v_profile.shop_id,'LEGAL_NOTICE_ACCEPTED','legal_document',p_document_id::text,null,null,jsonb_build_object('legal_acceptance_id',v_id,'document_sha256',v_context.content_sha256,'document_version',v_context.version,'app_version',coalesce(nullif(trim(p_app_version),''),'V4'),'device_id',p_device_id,'session_id',p_session_id));
  return v_id;
end; $$;

create or replace function public.saas_admin_list_legal_documents()
returns table(id uuid,document_type text,version text,title text,content_sha256 text,effective_at timestamptz,is_active boolean)
language sql security definer set search_path=public,auth as $$
  select d.id,d.document_type,d.version,d.title,d.content_sha256,d.effective_at,d.is_active from public.legal_documents d where public.saas_is_platform_admin(auth.uid()) order by d.effective_at desc,d.created_at desc;
$$;

create or replace function public.saas_admin_set_legal_notice(p_enabled boolean,p_document_id uuid default null)
returns void language plpgsql security definer set search_path=public,auth as $$
declare v_doc uuid:=p_document_id;
begin
  if not public.saas_is_platform_admin(auth.uid()) then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if coalesce(p_enabled,false) then
    if v_doc is null then select id into v_doc from public.legal_documents where is_active=true order by effective_at desc,created_at desc limit 1; end if;
    if v_doc is null or not exists(select 1 from public.legal_documents where id=v_doc and is_active=true) then raise exception 'ACTIVE_LEGAL_DOCUMENT_REQUIRED'; end if;
  end if;
  insert into public.saas_runtime_settings(setting_key,setting_value,updated_at,updated_by) values
    ('legal_notice_enabled',to_jsonb(coalesce(p_enabled,false)),now(),auth.uid()),
    ('legal_notice_document_id',case when v_doc is null then 'null'::jsonb else to_jsonb(v_doc::text) end,now(),auth.uid())
  on conflict(setting_key) do update set setting_value=excluded.setting_value,updated_at=now(),updated_by=auth.uid();
end; $$;

revoke all on function public.my_legal_notice() from public,anon;
revoke all on function public.accept_legal_notice(uuid,uuid,uuid,text,text) from public,anon;
revoke all on function public.saas_admin_list_legal_documents() from public,anon;
revoke all on function public.saas_admin_set_legal_notice(boolean,uuid) from public,anon;
grant execute on function public.my_legal_notice() to authenticated;
grant execute on function public.accept_legal_notice(uuid,uuid,uuid,text,text) to authenticated;
grant execute on function public.saas_admin_list_legal_documents() to authenticated;
grant execute on function public.saas_admin_set_legal_notice(boolean,uuid) to authenticated;

revoke all on function public.saas_is_platform_admin(uuid) from public,anon;
revoke all on function public.my_saas_context() from public,anon;
revoke all on function public.saas_admin_set_account_by_email(text,text,text,timestamptz,boolean,integer) from public,anon;
revoke all on function public.saas_admin_set_runtime(text,text,boolean,text) from public,anon;
revoke all on function public.saas_admin_publish_announcement(text,text,integer) from public,anon;
revoke all on function public.saas_admin_list_accounts() from public,anon;
grant execute on function public.saas_is_platform_admin(uuid) to authenticated;
grant execute on function public.my_saas_context() to authenticated;
grant execute on function public.saas_admin_set_account_by_email(text,text,text,timestamptz,boolean,integer) to authenticated;
grant execute on function public.saas_admin_set_runtime(text,text,boolean,text) to authenticated;
grant execute on function public.saas_admin_publish_announcement(text,text,integer) to authenticated;
grant execute on function public.saas_admin_list_accounts() to authenticated;

do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_rel pr join pg_publication p on p.oid=pr.prpubid where p.pubname='supabase_realtime' and pr.prrelid='public.inventory'::regclass) then
    alter publication supabase_realtime add table public.inventory;
  end if;
end $$;

commit;;
