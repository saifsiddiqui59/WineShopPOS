-- WineShopPOS V2 — Commercial + Accounting + Intelligence
-- N7, N8, N9, N10, N11, N14, N15
-- N12 Transfers and AI are intentionally untouched.

-- ============================================================
-- SALES COMMERCIAL SNAPSHOT COLUMNS
-- ============================================================

alter table public.sales
  add column if not exists manual_discount numeric(14,2) not null default 0,
  add column if not exists promotion_id uuid,
  add column if not exists promotion_discount numeric(14,2) not null default 0,
  add column if not exists loyalty_discount numeric(14,2) not null default 0,
  add column if not exists loyalty_points_redeemed integer not null default 0,
  add column if not exists loyalty_points_earned integer not null default 0,
  add column if not exists store_credit_used numeric(14,2) not null default 0,
  add column if not exists gift_voucher_used numeric(14,2) not null default 0;

-- ============================================================
-- N8 CUSTOMER LOYALTY
-- ============================================================

create table if not exists public.loyalty_settings (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  enabled boolean not null default true,
  earn_points_per_100_rupees numeric(10,4) not null default 1 check (earn_points_per_100_rupees >= 0),
  point_value_rupees numeric(10,4) not null default 1 check (point_value_rupees > 0),
  max_redeem_percent numeric(7,3) not null default 50 check (max_redeem_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  sale_id uuid references public.sales(id) on delete set null,
  entry_type text not null check (entry_type in ('EARN','REDEEM','ADJUSTMENT')),
  points integer not null check (points <> 0),
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_loyalty_customer
  on public.customer_loyalty_ledger(shop_id,customer_id,created_at desc);

create unique index if not exists uq_loyalty_sale_type
  on public.customer_loyalty_ledger(sale_id,entry_type)
  where sale_id is not null;

-- ============================================================
-- N9 COUPONS / PROMOTIONS
-- One table supports explicit coupon codes and automatic promotions.
-- ============================================================

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  code text,
  discount_type text not null check (discount_type in ('PERCENT','FIXED')),
  discount_value numeric(14,4) not null check (discount_value > 0),
  min_purchase numeric(14,2) not null default 0 check (min_purchase >= 0),
  max_discount numeric(14,2),
  valid_from date not null default current_date,
  valid_to date,
  total_usage_limit integer,
  per_customer_limit integer,
  auto_apply boolean not null default false,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from),
  check (max_discount is null or max_discount > 0),
  check (total_usage_limit is null or total_usage_limit > 0),
  check (per_customer_limit is null or per_customer_limit > 0)
);

create unique index if not exists uq_promotions_shop_code
  on public.promotions(shop_id,upper(code))
  where code is not null;

create table if not exists public.promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  promotion_id uuid not null references public.promotions(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  sale_id uuid not null references public.sales(id) on delete restrict,
  discount_amount numeric(14,2) not null check (discount_amount >= 0),
  created_at timestamptz not null default now(),
  unique(sale_id)
);

create index if not exists idx_promotion_redemptions_promo
  on public.promotion_redemptions(shop_id,promotion_id,created_at desc);

-- ============================================================
-- N10 STORE CREDIT + GIFT VOUCHERS
-- ============================================================

create table if not exists public.customer_store_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  sale_id uuid references public.sales(id) on delete set null,
  entry_type text not null check (entry_type in ('CREDIT','REDEEM','ADJUSTMENT')),
  amount numeric(14,2) not null check (amount <> 0),
  reference text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_credit_customer
  on public.customer_store_credit_ledger(shop_id,customer_id,created_at desc);

create unique index if not exists uq_store_credit_sale_type
  on public.customer_store_credit_ledger(sale_id,entry_type)
  where sale_id is not null;

create table if not exists public.gift_vouchers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  code text not null,
  customer_id uuid references public.customers(id) on delete set null,
  initial_balance numeric(14,2) not null check (initial_balance > 0),
  current_balance numeric(14,2) not null check (current_balance >= 0),
  expires_at date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','USED','EXPIRED','CANCELLED')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(shop_id,code)
);

create table if not exists public.gift_voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  voucher_id uuid not null references public.gift_vouchers(id) on delete restrict,
  sale_id uuid not null references public.sales(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique(sale_id,voucher_id)
);

create table if not exists public.sale_tender_adjustments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  tender_type text not null check (tender_type in ('STORE_CREDIT','GIFT_VOUCHER')),
  amount numeric(14,2) not null check (amount > 0),
  reference text,
  created_at timestamptz not null default now(),
  unique(sale_id,tender_type)
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.loyalty_settings enable row level security;
alter table public.customer_loyalty_ledger enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_redemptions enable row level security;
alter table public.customer_store_credit_ledger enable row level security;
alter table public.gift_vouchers enable row level security;
alter table public.gift_voucher_redemptions enable row level security;
alter table public.sale_tender_adjustments enable row level security;

drop policy if exists loyalty_settings_select on public.loyalty_settings;
create policy loyalty_settings_select on public.loyalty_settings
for select to authenticated
using (shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists customer_loyalty_select on public.customer_loyalty_ledger;
create policy customer_loyalty_select on public.customer_loyalty_ledger
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists promotions_select on public.promotions;
create policy promotions_select on public.promotions
for select to authenticated
using (shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists promotion_redemptions_select on public.promotion_redemptions;
create policy promotion_redemptions_select on public.promotion_redemptions
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists store_credit_select on public.customer_store_credit_ledger;
create policy store_credit_select on public.customer_store_credit_ledger
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists gift_vouchers_select on public.gift_vouchers;
create policy gift_vouchers_select on public.gift_vouchers
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists gift_voucher_redemptions_select on public.gift_voucher_redemptions;
create policy gift_voucher_redemptions_select on public.gift_voucher_redemptions
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists sale_tender_adjustments_select on public.sale_tender_adjustments;
create policy sale_tender_adjustments_select on public.sale_tender_adjustments
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

revoke insert,update,delete on
  public.loyalty_settings,
  public.customer_loyalty_ledger,
  public.promotions,
  public.promotion_redemptions,
  public.customer_store_credit_ledger,
  public.gift_vouchers,
  public.gift_voucher_redemptions,
  public.sale_tender_adjustments
from authenticated;

grant select on public.loyalty_settings,public.promotions to authenticated;
grant select on
  public.customer_loyalty_ledger,
  public.promotion_redemptions,
  public.customer_store_credit_ledger,
  public.gift_vouchers,
  public.gift_voucher_redemptions,
  public.sale_tender_adjustments
to authenticated;

-- ============================================================
-- CUSTOMER COMMERCIAL HELPERS
-- ============================================================

create or replace function public.customer_loyalty_balance(p_customer_id uuid)
returns integer
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(sum(l.points),0)::integer
  from public.customer_loyalty_ledger l
  where l.shop_id=public.assert_shop_access()
    and l.customer_id=p_customer_id;
$$;

create or replace function public.customer_store_credit_balance(p_customer_id uuid)
returns numeric
language sql
stable
security definer
set search_path=public
as $$
  select round(coalesce(sum(l.amount),0),2)
  from public.customer_store_credit_ledger l
  where l.shop_id=public.assert_shop_access()
    and l.customer_id=p_customer_id;
$$;

create or replace function public.customer_commercial_summary(p_customer_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_points integer;
  v_credit numeric;
  v_rate numeric:=1;
  v_point_value numeric:=1;
  v_max numeric:=50;
begin
  v_shop:=public.assert_shop_access();

  if not exists(
    select 1 from public.customers
    where id=p_customer_id and shop_id=v_shop and active=true
  ) then
    raise exception 'Customer not found';
  end if;

  v_points:=public.customer_loyalty_balance(p_customer_id);
  v_credit:=public.customer_store_credit_balance(p_customer_id);

  select
    earn_points_per_100_rupees,
    point_value_rupees,
    max_redeem_percent
  into v_rate,v_point_value,v_max
  from public.loyalty_settings
  where shop_id=v_shop and enabled=true;

  return jsonb_build_object(
    'loyalty_points',v_points,
    'store_credit',v_credit,
    'earn_points_per_100_rupees',coalesce(v_rate,1),
    'point_value_rupees',coalesce(v_point_value,1),
    'max_redeem_percent',coalesce(v_max,50)
  );
end;
$$;

create or replace function public.v4_promotion_quote(
  p_customer_id uuid,
  p_coupon_code text,
  p_base_amount numeric
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  r record;
  v_discount numeric:=0;
  v_total_uses integer:=0;
  v_customer_uses integer:=0;
begin
  v_shop:=public.assert_shop_access();

  if p_base_amount<=0 then return '{}'::jsonb; end if;

  if nullif(trim(coalesce(p_coupon_code,'')),'') is not null then
    select p.* into r
    from public.promotions p
    where p.shop_id=v_shop
      and p.active=true
      and p.code is not null
      and upper(p.code)=upper(trim(p_coupon_code))
      and current_date>=p.valid_from
      and (p.valid_to is null or current_date<=p.valid_to)
      and p_base_amount>=p.min_purchase
    order by p.created_at desc
    limit 1;

    if not found then raise exception 'COUPON_NOT_VALID'; end if;
  else
    select p.* into r
    from public.promotions p
    where p.shop_id=v_shop
      and p.active=true
      and p.auto_apply=true
      and current_date>=p.valid_from
      and (p.valid_to is null or current_date<=p.valid_to)
      and p_base_amount>=p.min_purchase
    order by
      case
        when p.discount_type='PERCENT'
          then least(p_base_amount*p.discount_value/100,coalesce(p.max_discount,p_base_amount))
        else least(p.discount_value,p_base_amount)
      end desc,
      p.created_at desc
    limit 1;

    if not found then return '{}'::jsonb; end if;
  end if;

  select count(*) into v_total_uses
  from public.promotion_redemptions
  where promotion_id=r.id;

  if r.total_usage_limit is not null and v_total_uses>=r.total_usage_limit then
    raise exception 'PROMOTION_USAGE_LIMIT_REACHED';
  end if;

  if r.per_customer_limit is not null and p_customer_id is not null then
    select count(*) into v_customer_uses
    from public.promotion_redemptions
    where promotion_id=r.id and customer_id=p_customer_id;

    if v_customer_uses>=r.per_customer_limit then
      raise exception 'CUSTOMER_PROMOTION_LIMIT_REACHED';
    end if;
  end if;

  if r.discount_type='PERCENT' then
    v_discount:=p_base_amount*r.discount_value/100;
  else
    v_discount:=r.discount_value;
  end if;

  v_discount:=least(v_discount,p_base_amount);
  if r.max_discount is not null then
    v_discount:=least(v_discount,r.max_discount);
  end if;

  return jsonb_build_object(
    'promotion_id',r.id,
    'promotion_name',r.name,
    'coupon_code',r.code,
    'promotion_discount',round(v_discount,2)
  );
end;
$$;

create or replace function public.commercial_quote(
  p_customer_id uuid default null,
  p_coupon_code text default null,
  p_subtotal numeric default 0,
  p_manual_discount numeric default 0,
  p_requested_points integer default 0,
  p_store_credit_amount numeric default 0,
  p_gift_voucher_code text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_base numeric;
  v_after_promo numeric;
  v_promo jsonb:='{}'::jsonb;
  v_promo_discount numeric:=0;

  v_points_available integer:=0;
  v_points_used integer:=0;
  v_point_value numeric:=1;
  v_max_redeem_percent numeric:=50;
  v_loyalty_discount numeric:=0;

  v_credit_available numeric:=0;
  v_credit_used numeric:=0;

  v_voucher_id uuid;
  v_voucher_balance numeric:=0;
  v_voucher_used numeric:=0;

  v_net numeric;
begin
  v_shop:=public.assert_shop_access();

  if p_subtotal<0 or p_manual_discount<0 or p_manual_discount>p_subtotal then
    raise exception 'Invalid commercial quote amount';
  end if;

  if coalesce(p_requested_points,0)<0 or coalesce(p_store_credit_amount,0)<0 then
    raise exception 'Requested redemption cannot be negative';
  end if;

  v_base:=round(p_subtotal-p_manual_discount,2);
  v_promo:=public.v4_promotion_quote(p_customer_id,p_coupon_code,v_base);
  v_promo_discount:=coalesce((v_promo->>'promotion_discount')::numeric,0);
  v_after_promo:=greatest(v_base-v_promo_discount,0);

  if p_customer_id is not null then
    if not exists(
      select 1 from public.customers
      where id=p_customer_id and shop_id=v_shop and active=true
    ) then
      raise exception 'Customer not found';
    end if;

    v_points_available:=public.customer_loyalty_balance(p_customer_id);
    v_credit_available:=public.customer_store_credit_balance(p_customer_id);

    select point_value_rupees,max_redeem_percent
    into v_point_value,v_max_redeem_percent
    from public.loyalty_settings
    where shop_id=v_shop and enabled=true;

    v_point_value:=coalesce(v_point_value,1);
    v_max_redeem_percent:=coalesce(v_max_redeem_percent,50);

    v_points_used:=least(
      coalesce(p_requested_points,0),
      greatest(v_points_available,0),
      floor(
        (v_after_promo*v_max_redeem_percent/100)
        /nullif(v_point_value,0)
      )::integer
    );

    v_loyalty_discount:=least(
      round(v_points_used*v_point_value,2),
      v_after_promo
    );
  elsif coalesce(p_requested_points,0)>0 or coalesce(p_store_credit_amount,0)>0 then
    raise exception 'Customer required for loyalty/store credit';
  end if;

  v_net:=greatest(v_after_promo-v_loyalty_discount,0);

  if p_customer_id is not null then
    v_credit_used:=least(
      coalesce(p_store_credit_amount,0),
      greatest(v_credit_available,0),
      v_net
    );
  end if;

  v_net:=greatest(v_net-v_credit_used,0);

  if nullif(trim(coalesce(p_gift_voucher_code,'')),'') is not null then
    select id,current_balance into v_voucher_id,v_voucher_balance
    from public.gift_vouchers
    where shop_id=v_shop
      and upper(code)=upper(trim(p_gift_voucher_code))
      and status='ACTIVE'
      and current_balance>0
      and (expires_at is null or expires_at>=current_date)
    for share;

    if v_voucher_id is null then raise exception 'GIFT_VOUCHER_NOT_VALID'; end if;

    v_voucher_used:=least(v_voucher_balance,v_net);
    v_net:=greatest(v_net-v_voucher_used,0);
  end if;

  return jsonb_build_object(
    'subtotal',round(p_subtotal,2),
    'manual_discount',round(p_manual_discount,2),
    'promotion_id',v_promo->>'promotion_id',
    'promotion_name',v_promo->>'promotion_name',
    'coupon_code',v_promo->>'coupon_code',
    'promotion_discount',round(v_promo_discount,2),
    'loyalty_points_available',v_points_available,
    'loyalty_points_used',v_points_used,
    'loyalty_discount',round(v_loyalty_discount,2),
    'store_credit_available',round(v_credit_available,2),
    'store_credit_used',round(v_credit_used,2),
    'gift_voucher_id',v_voucher_id,
    'gift_voucher_used',round(v_voucher_used,2),
    'external_payment_due',round(v_net,2)
  );
end;
$$;

grant execute on function public.customer_commercial_summary(uuid) to authenticated;
grant execute on function public.commercial_quote(uuid,text,numeric,numeric,integer,numeric,text) to authenticated;

-- ============================================================
-- MANAGEMENT RPCs
-- ============================================================

create or replace function public.create_promotion(
  p_name text,
  p_code text,
  p_discount_type text,
  p_discount_value numeric,
  p_min_purchase numeric default 0,
  p_max_discount numeric default null,
  p_valid_from date default current_date,
  p_valid_to date default null,
  p_total_usage_limit integer default null,
  p_per_customer_limit integer default null,
  p_auto_apply boolean default false
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  insert into public.promotions(
    shop_id,name,code,discount_type,discount_value,min_purchase,max_discount,
    valid_from,valid_to,total_usage_limit,per_customer_limit,auto_apply,created_by
  )
  values(
    v_shop,trim(p_name),nullif(upper(trim(coalesce(p_code,''))),''),
    upper(p_discount_type),p_discount_value,coalesce(p_min_purchase,0),p_max_discount,
    coalesce(p_valid_from,current_date),p_valid_to,p_total_usage_limit,p_per_customer_limit,
    coalesce(p_auto_apply,false),auth.uid()
  )
  returning id into v_id;

  perform public.write_audit(
    v_shop,'PROMOTION_CREATED','promotion',v_id::text,
    null,null,jsonb_build_object('name',p_name,'code',p_code)
  );

  return v_id;
end;
$$;

create or replace function public.issue_gift_voucher(
  p_code text,
  p_amount numeric,
  p_customer_id uuid default null,
  p_expires_at date default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_amount<=0 then raise exception 'Voucher amount must be positive'; end if;

  if p_customer_id is not null and not exists(
    select 1 from public.customers
    where id=p_customer_id and shop_id=v_shop and active=true
  ) then
    raise exception 'Customer not found';
  end if;

  insert into public.gift_vouchers(
    shop_id,code,customer_id,initial_balance,current_balance,expires_at,notes,created_by
  )
  values(
    v_shop,upper(trim(p_code)),p_customer_id,p_amount,p_amount,p_expires_at,p_notes,auth.uid()
  )
  returning id into v_id;

  perform public.write_audit(
    v_shop,'GIFT_VOUCHER_ISSUED','gift_voucher',v_id::text,
    null,null,jsonb_build_object('code',upper(trim(p_code)),'amount',p_amount)
  );

  return v_id;
end;
$$;

create or replace function public.grant_store_credit(
  p_customer_id uuid,
  p_amount numeric,
  p_reference text default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_amount<=0 then raise exception 'Store credit amount must be positive'; end if;

  if not exists(
    select 1 from public.customers
    where id=p_customer_id and shop_id=v_shop and active=true
  ) then raise exception 'Customer not found'; end if;

  insert into public.customer_store_credit_ledger(
    shop_id,customer_id,entry_type,amount,reference,description,created_by
  )
  values(
    v_shop,p_customer_id,'CREDIT',p_amount,p_reference,p_description,auth.uid()
  )
  returning id into v_id;

  perform public.write_audit(
    v_shop,'STORE_CREDIT_GRANTED','customer',p_customer_id::text,
    null,null,jsonb_build_object('amount',p_amount,'reference',p_reference)
  );

  return v_id;
end;
$$;

create or replace function public.adjust_loyalty_points(
  p_customer_id uuid,
  p_points integer,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_points=0 then raise exception 'Points adjustment cannot be zero'; end if;

  if not exists(
    select 1 from public.customers
    where id=p_customer_id and shop_id=v_shop and active=true
  ) then raise exception 'Customer not found'; end if;

  if public.customer_loyalty_balance(p_customer_id)+p_points<0 then
    raise exception 'Loyalty balance cannot become negative';
  end if;

  insert into public.customer_loyalty_ledger(
    shop_id,customer_id,entry_type,points,description,created_by
  )
  values(v_shop,p_customer_id,'ADJUSTMENT',p_points,p_description,auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_promotion(text,text,text,numeric,numeric,numeric,date,date,integer,integer,boolean) to authenticated;
grant execute on function public.issue_gift_voucher(text,numeric,uuid,date,text) to authenticated;
grant execute on function public.grant_store_credit(uuid,numeric,text,text) to authenticated;
grant execute on function public.adjust_loyalty_points(uuid,integer,text) to authenticated;

-- ============================================================
-- COMPLETE SALE V4
--
-- complete_sale_v3 remains authoritative for:
-- - manual discount / price override authorization
-- - stock mutation
-- - sale creation
-- - external payment
--
-- This wrapper adds commercial benefits atomically in the same DB transaction.
-- ============================================================

create or replace function public.complete_sale_v4(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null,
  p_client_sale_id uuid default gen_random_uuid(),
  p_offline_created_at timestamptz default null,
  p_reason_code_id uuid default null,
  p_reason_note text default null,
  p_override_request_id uuid default null,
  p_customer_id uuid default null,
  p_coupon_code text default null,
  p_loyalty_points_to_redeem integer default 0,
  p_store_credit_amount numeric default 0,
  p_gift_voucher_code text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_existing uuid;
  v_sale uuid;
  v_snap jsonb;
  v_quote jsonb;

  v_subtotal numeric;
  v_promo_id uuid;
  v_promo_discount numeric;
  v_points_used integer;
  v_loyalty_discount numeric;
  v_store_credit numeric;
  v_voucher_id uuid;
  v_voucher_used numeric;
  v_external_due numeric;
  v_final_discount numeric;
  v_final_total numeric;
  v_points_earned integer:=0;
  v_earn_rate numeric:=1;
begin
  v_shop:=public.assert_shop_access();

  select id into v_existing
  from public.sales
  where shop_id=v_shop and client_sale_id=p_client_sale_id;

  if v_existing is not null then return v_existing; end if;

  if p_offline_created_at is not null and (
    nullif(trim(coalesce(p_coupon_code,'')),'') is not null
    or coalesce(p_loyalty_points_to_redeem,0)>0
    or coalesce(p_store_credit_amount,0)>0
    or nullif(trim(coalesce(p_gift_voucher_code,'')),'') is not null
  ) then
    raise exception 'Commercial rewards require online checkout';
  end if;

  v_snap:=public.v3_pricing_snapshot(p_items,p_discount);
  v_subtotal:=(v_snap->>'subtotal')::numeric;

  v_quote:=public.commercial_quote(
    p_customer_id,
    p_coupon_code,
    v_subtotal,
    coalesce(p_discount,0),
    coalesce(p_loyalty_points_to_redeem,0),
    coalesce(p_store_credit_amount,0),
    p_gift_voucher_code
  );

  v_promo_id=nullif(v_quote->>'promotion_id','')::uuid;
  v_promo_discount:=coalesce((v_quote->>'promotion_discount')::numeric,0);
  v_points_used:=coalesce((v_quote->>'loyalty_points_used')::integer,0);
  v_loyalty_discount:=coalesce((v_quote->>'loyalty_discount')::numeric,0);
  v_store_credit:=coalesce((v_quote->>'store_credit_used')::numeric,0);
  v_voucher_id=nullif(v_quote->>'gift_voucher_id','')::uuid;
  v_voucher_used:=coalesce((v_quote->>'gift_voucher_used')::numeric,0);
  v_external_due:=coalesce((v_quote->>'external_payment_due')::numeric,0);

  -- Existing V3 performs all manual-override authorization BEFORE mutation.
  v_sale:=public.complete_sale_v3(
    p_items,
    p_payment_method,
    p_discount,
    p_payment_reference,
    p_client_sale_id,
    p_offline_created_at,
    p_reason_code_id,
    p_reason_note,
    p_override_request_id
  );

  if p_customer_id is not null then
    perform public.link_sale_customer(v_sale,p_customer_id);
  end if;

  v_final_discount:=round(coalesce(p_discount,0)+v_promo_discount+v_loyalty_discount,2);
  v_final_total:=round(greatest(v_subtotal-v_final_discount,0),2);

  update public.sales
  set manual_discount=round(coalesce(p_discount,0),2),
      promotion_id=v_promo_id,
      promotion_discount=v_promo_discount,
      loyalty_discount=v_loyalty_discount,
      loyalty_points_redeemed=v_points_used,
      store_credit_used=v_store_credit,
      gift_voucher_used=v_voucher_used,
      discount=v_final_discount,
      grand_total=v_final_total
  where id=v_sale and shop_id=v_shop;

  -- V3 inserted one external PAYMENT row. Reduce it to the actual cash/UPI/card
  -- amount after voucher/store-credit tender usage.
  if v_external_due>0 then
    update public.payments
    set amount=v_external_due
    where id=(
      select id from public.payments
      where sale_id=v_sale
        and shop_id=v_shop
        and payment_type='PAYMENT'
      order by created_at
      limit 1
    );
  else
    delete from public.payments
    where sale_id=v_sale
      and shop_id=v_shop
      and payment_type='PAYMENT';
  end if;

  if v_promo_id is not null and v_promo_discount>0 then
    insert into public.promotion_redemptions(
      shop_id,promotion_id,customer_id,sale_id,discount_amount
    )
    values(v_shop,v_promo_id,p_customer_id,v_sale,v_promo_discount);
  end if;

  if p_customer_id is not null and v_points_used>0 then
    insert into public.customer_loyalty_ledger(
      shop_id,customer_id,sale_id,entry_type,points,description,created_by
    )
    values(
      v_shop,p_customer_id,v_sale,'REDEEM',-v_points_used,
      'Redeemed at POS',auth.uid()
    );
  end if;

  if p_customer_id is not null and v_store_credit>0 then
    insert into public.customer_store_credit_ledger(
      shop_id,customer_id,sale_id,entry_type,amount,reference,description,created_by
    )
    values(
      v_shop,p_customer_id,v_sale,'REDEEM',-v_store_credit,
      'POS','Store credit used at POS',auth.uid()
    );

    insert into public.sale_tender_adjustments(
      shop_id,sale_id,tender_type,amount,reference
    )
    values(v_shop,v_sale,'STORE_CREDIT',v_store_credit,p_customer_id::text);
  end if;

  if v_voucher_id is not null and v_voucher_used>0 then
    update public.gift_vouchers
    set current_balance=current_balance-v_voucher_used,
        status=case
          when current_balance-v_voucher_used<=0 then 'USED'
          else status
        end
    where id=v_voucher_id and shop_id=v_shop;

    insert into public.gift_voucher_redemptions(
      shop_id,voucher_id,sale_id,amount
    )
    values(v_shop,v_voucher_id,v_sale,v_voucher_used);

    insert into public.sale_tender_adjustments(
      shop_id,sale_id,tender_type,amount,reference
    )
    values(v_shop,v_sale,'GIFT_VOUCHER',v_voucher_used,v_voucher_id::text);
  end if;

  if p_customer_id is not null then
    select earn_points_per_100_rupees
    into v_earn_rate
    from public.loyalty_settings
    where shop_id=v_shop and enabled=true;

    v_earn_rate:=coalesce(v_earn_rate,1);
    v_points_earned:=floor(v_final_total/100*v_earn_rate)::integer;

    if v_points_earned>0 then
      insert into public.customer_loyalty_ledger(
        shop_id,customer_id,sale_id,entry_type,points,description,created_by
      )
      values(
        v_shop,p_customer_id,v_sale,'EARN',v_points_earned,
        'Earned from sale',auth.uid()
      );
    end if;

    update public.sales
    set loyalty_points_earned=v_points_earned
    where id=v_sale;
  end if;

  perform public.write_audit(
    v_shop,'SALE_COMMERCIAL_BENEFITS_APPLIED','sale',v_sale::text,
    null,null,
    jsonb_build_object(
      'promotion_discount',v_promo_discount,
      'loyalty_points_redeemed',v_points_used,
      'loyalty_discount',v_loyalty_discount,
      'store_credit_used',v_store_credit,
      'gift_voucher_used',v_voucher_used,
      'loyalty_points_earned',v_points_earned
    )
  );

  return v_sale;
end;
$$;

grant execute on function public.complete_sale_v4(
  jsonb,text,numeric,text,uuid,timestamptz,uuid,text,uuid,uuid,text,integer,numeric,text
) to authenticated;

-- ============================================================
-- N11 SUPPLIER PERFORMANCE SCORE
-- ============================================================

create or replace function public.supplier_performance_scores(p_days integer default 180)
returns table(
  supplier_id uuid,
  supplier_name text,
  score numeric,
  fill_rate numeric,
  on_time_rate numeric,
  return_rate numeric,
  price_variation numeric,
  purchase_count bigint,
  total_spend numeric,
  outstanding numeric
)
language sql
stable
security definer
set search_path=public
as $$
with shop as (
  select public.assert_shop_access() id
),
purchase_stats as (
  select
    p.supplier_id,
    count(distinct p.id) purchase_count,
    coalesce(sum(p.total),0)::numeric total_spend
  from public.purchases p,shop
  where p.shop_id=shop.id
    and p.invoice_date>=current_date-greatest(p_days,1)
  group by p.supplier_id
),
return_stats as (
  select
    pr.supplier_id,
    coalesce(sum(pr.total),0)::numeric return_total
  from public.purchase_returns pr,shop
  where pr.shop_id=shop.id
    and pr.status='COMPLETED'
    and pr.created_at>=now()-(greatest(p_days,1)||' days')::interval
  group by pr.supplier_id
),
po_stats as (
  select
    po.supplier_id,
    coalesce(sum(poi.ordered_quantity),0)::numeric ordered_qty,
    coalesce(sum(poi.received_quantity),0)::numeric received_qty,
    count(distinct po.id) filter (where po.status in ('RECEIVED','COMPLETED')) received_pos,
    count(distinct po.id) filter (
      where po.status in ('RECEIVED','COMPLETED')
        and (
          po.expected_date is null
          or exists(
            select 1
            from public.purchases pp
            where pp.purchase_order_id=po.id
              and pp.invoice_date<=po.expected_date
          )
        )
    ) on_time_pos
  from public.purchase_orders po
  join public.purchase_order_items poi on poi.purchase_order_id=po.id
  join shop on shop.id=po.shop_id
  where po.created_at>=now()-(greatest(p_days,1)||' days')::interval
  group by po.supplier_id
),
price_stats as (
  select
    p.supplier_id,
    coalesce(stddev_samp(pi.purchase_price)/nullif(avg(pi.purchase_price),0)*100,0)::numeric variation
  from public.purchases p
  join public.purchase_items pi on pi.purchase_id=p.id
  join shop on shop.id=p.shop_id
  where p.invoice_date>=current_date-greatest(p_days,1)
  group by p.supplier_id
),
payment_stats as (
  select
    s.id supplier_id,
    greatest(
      coalesce(ps.total_spend,0)
      -coalesce(sp.paid,0)
      -coalesce(rs.return_total,0),
      0
    )::numeric outstanding
  from public.suppliers s
  join shop on shop.id=s.shop_id
  left join purchase_stats ps on ps.supplier_id=s.id
  left join return_stats rs on rs.supplier_id=s.id
  left join (
    select supplier_id,sum(amount)::numeric paid
    from public.supplier_payments,shop
    where shop_id=shop.id
    group by supplier_id
  ) sp on sp.supplier_id=s.id
)
select
  s.id,
  s.supplier_name,
  round(
    (
      0.30*case
        when coalesce(po.ordered_qty,0)>0 then least(po.received_qty/po.ordered_qty*100,100)
        else 70 end
      +0.25*case
        when coalesce(po.received_pos,0)>0 then po.on_time_pos::numeric/po.received_pos*100
        else 70 end
      +0.20*greatest(
        100-case
          when coalesce(ps.total_spend,0)>0
            then coalesce(rs.return_total,0)/ps.total_spend*500
          else 0 end,
        0
      )
      +0.15*greatest(100-least(coalesce(pr.variation,0),100),0)
      +0.10*least(coalesce(ps.purchase_count,0)::numeric/5*100,100)
    ),
    2
  ) score,
  round(
    case when coalesce(po.ordered_qty,0)>0
      then least(po.received_qty/po.ordered_qty*100,100)
      else 0 end,2
  ) fill_rate,
  round(
    case when coalesce(po.received_pos,0)>0
      then po.on_time_pos::numeric/po.received_pos*100
      else 0 end,2
  ) on_time_rate,
  round(
    case when coalesce(ps.total_spend,0)>0
      then coalesce(rs.return_total,0)/ps.total_spend*100
      else 0 end,2
  ) return_rate,
  round(coalesce(pr.variation,0),2) price_variation,
  coalesce(ps.purchase_count,0),
  round(coalesce(ps.total_spend,0),2),
  round(coalesce(pay.outstanding,0),2)
from public.suppliers s
join shop on shop.id=s.shop_id
left join purchase_stats ps on ps.supplier_id=s.id
left join return_stats rs on rs.supplier_id=s.id
left join po_stats po on po.supplier_id=s.id
left join price_stats pr on pr.supplier_id=s.id
left join payment_stats pay on pay.supplier_id=s.id
where s.active=true
order by score desc,s.supplier_name;
$$;

grant execute on function public.supplier_performance_scores(integer) to authenticated;

-- ============================================================
-- N15 PURCHASE COACH
-- ============================================================

create or replace function public.purchase_coach_v2(p_days integer default 30)
returns table(
  product_id uuid,
  product_name text,
  recommendation_type text,
  current_stock integer,
  units_sold bigint,
  avg_daily numeric,
  days_cover numeric,
  recommended_quantity integer,
  best_supplier_id uuid,
  best_supplier_name text,
  best_recent_cost numeric,
  estimated_margin_percent numeric,
  priority text,
  message text
)
language sql
stable
security definer
set search_path=public
as $$
with shop as (
  select public.assert_shop_access() id
),
sales_velocity as (
  select
    si.product_id,
    sum(si.quantity)::bigint units_sold
  from public.sale_items si
  join public.sales s on s.id=si.sale_id
  join shop on shop.id=s.shop_id
  where s.status<>'VOID'
    and s.created_at>=now()-(greatest(p_days,1)||' days')::interval
  group by si.product_id
),
best_supplier as (
  select distinct on (pi.product_id)
    pi.product_id,
    p.supplier_id,
    sp.supplier_name,
    avg(coalesce(pi.landed_unit_cost,pi.purchase_price)) over (
      partition by pi.product_id,p.supplier_id
    )::numeric avg_cost
  from public.purchase_items pi
  join public.purchases p on p.id=pi.purchase_id
  join public.suppliers sp on sp.id=p.supplier_id
  join shop on shop.id=p.shop_id
  where p.invoice_date>=current_date-180
  order by
    pi.product_id,
    avg(coalesce(pi.landed_unit_cost,pi.purchase_price)) over (
      partition by pi.product_id,p.supplier_id
    ),
    p.supplier_id
),
base as (
  select
    p.id,
    p.product_name,
    coalesce(i.quantity,0)::integer stock,
    coalesce(v.units_sold,0)::bigint units_sold,
    coalesce(v.units_sold,0)::numeric/greatest(p_days,1) avg_daily,
    case
      when coalesce(v.units_sold,0)>0
        then coalesce(i.quantity,0)/(v.units_sold::numeric/greatest(p_days,1))
      else null
    end days_cover,
    bs.supplier_id,
    bs.supplier_name,
    bs.avg_cost,
    p.selling_price
  from public.products p
  join shop on shop.id=p.shop_id
  left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
  left join sales_velocity v on v.product_id=p.id
  left join best_supplier bs on bs.product_id=p.id
  where p.active=true
)
select
  b.id,
  b.product_name,
  case
    when b.avg_daily>0 and coalesce(b.days_cover,0)<7 then 'REORDER'
    when b.avg_daily=0 and b.stock>0 then 'NO_MOVEMENT'
    when b.days_cover>45 then 'OVERSTOCK'
    when b.avg_cost is not null
      and b.selling_price>0
      and (b.selling_price-b.avg_cost)/b.selling_price*100<15 then 'MARGIN_RISK'
    else 'HEALTHY'
  end recommendation_type,
  b.stock,
  b.units_sold,
  round(b.avg_daily,3),
  round(b.days_cover,1),
  case
    when b.avg_daily>0 and coalesce(b.days_cover,0)<7
      then greatest(ceil(b.avg_daily*14-b.stock)::integer,0)
    else 0
  end recommended_quantity,
  b.supplier_id,
  b.supplier_name,
  round(b.avg_cost,2),
  round(
    case when b.selling_price>0 and b.avg_cost is not null
      then (b.selling_price-b.avg_cost)/b.selling_price*100
      else null end,
    2
  ) estimated_margin_percent,
  case
    when b.avg_daily>0 and coalesce(b.days_cover,0)<3 then 'HIGH'
    when b.avg_daily>0 and coalesce(b.days_cover,0)<7 then 'MEDIUM'
    when b.avg_daily=0 and b.stock>0 then 'MEDIUM'
    when b.days_cover>60 then 'MEDIUM'
    when b.avg_cost is not null and b.selling_price>0
      and (b.selling_price-b.avg_cost)/b.selling_price*100<10 then 'HIGH'
    else 'LOW'
  end priority,
  case
    when b.avg_daily>0 and coalesce(b.days_cover,0)<7
      then 'Reorder to approximately 14 days of cover using the best recent supplier cost.'
    when b.avg_daily=0 and b.stock>0
      then 'No sales in the selected history window. Avoid additional purchasing until reviewed.'
    when b.days_cover>45
      then 'Current stock is above 45 days of cover. Reduce or postpone purchasing.'
    when b.avg_cost is not null and b.selling_price>0
      and (b.selling_price-b.avg_cost)/b.selling_price*100<15
      then 'Recent purchase cost is compressing gross margin. Review supplier or selling price.'
    else 'No immediate purchase action required.'
  end message
from base b
where
  (b.avg_daily>0 and coalesce(b.days_cover,0)<7)
  or (b.avg_daily=0 and b.stock>0)
  or b.days_cover>45
  or (
    b.avg_cost is not null
    and b.selling_price>0
    and (b.selling_price-b.avg_cost)/b.selling_price*100<15
  )
order by
  case
    when b.avg_daily>0 and coalesce(b.days_cover,0)<3 then 1
    when b.avg_cost is not null and b.selling_price>0
      and (b.selling_price-b.avg_cost)/b.selling_price*100<10 then 2
    else 3
  end,
  b.product_name;
$$;

grant execute on function public.purchase_coach_v2(integer) to authenticated;

-- ============================================================
-- N14 LEAKAGE SHIELD EXPANSION
-- Extend existing neutral exception detection.
-- ============================================================

create or replace function public.loss_control_exceptions_v2(p_days integer default 30)
returns table(
  severity text,
  exception_type text,
  event_time timestamptz,
  summary text,
  amount numeric,
  entity_id text,
  action_path text
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
    e.severity::text,
    e.exception_type::text,
    e.event_time::timestamptz,
    e.summary::text,
    e.amount::numeric,
    e.entity_id::text,
    e.action_path::text
  from public.loss_control_exceptions(p_days) e;

  return query
  select
    case
      when s.subtotal>0 and s.discount/s.subtotal>=0.20 then 'HIGH'
      else 'MEDIUM'
    end,
    'HIGH_DISCOUNT_SALE'::text,
    s.created_at,
    'Sale '||s.invoice_number||' used discount '||
      round(case when s.subtotal>0 then s.discount/s.subtotal*100 else 0 end,2)||'%',
    s.discount::numeric,
    s.id::text,
    '/sales/'||s.id::text
  from public.sales s
  where s.shop_id=v_shop
    and s.status<>'VOID'
    and s.created_at>=now()-(greatest(p_days,1)||' days')::interval
    and s.subtotal>0
    and s.discount/s.subtotal>=0.10;

  return query
  select
    case when count(*)>=6 then 'HIGH' else 'MEDIUM' end,
    'REPEATED_POS_OVERRIDES'::text,
    max(r.used_at),
    count(*)||' approved POS overrides used by the same cashier in the review window',
    sum(r.requested_discount)::numeric,
    r.requested_by::text,
    '/operations/approvals'::text
  from public.sale_override_requests r
  where r.shop_id=v_shop
    and r.status='USED'
    and r.used_at>=now()-(greatest(p_days,1)||' days')::interval
  group by r.requested_by
  having count(*)>=3;

  return query
  select
    case when l.amount>=5000 then 'HIGH' else 'MEDIUM' end,
    'STORE_CREDIT_GRANT'::text,
    l.created_at,
    'Manual store credit granted: '||round(l.amount,2),
    l.amount::numeric,
    l.id::text,
    '/operations/customers'::text
  from public.customer_store_credit_ledger l
  where l.shop_id=v_shop
    and l.entry_type='CREDIT'
    and l.amount>=1000
    and l.created_at>=now()-(greatest(p_days,1)||' days')::interval;

  return query
  select
    case when g.initial_balance>=10000 then 'HIGH' else 'MEDIUM' end,
    'HIGH_VALUE_GIFT_VOUCHER'::text,
    g.created_at,
    'Gift voucher '||g.code||' issued for '||round(g.initial_balance,2),
    g.initial_balance::numeric,
    g.id::text,
    '/operations/customers'::text
  from public.gift_vouchers g
  where g.shop_id=v_shop
    and g.initial_balance>=5000
    and g.created_at>=now()-(greatest(p_days,1)||' days')::interval;
end;
$$;

grant execute on function public.loss_control_exceptions_v2(integer) to authenticated;

-- ============================================================
-- N7 ACCOUNTANT / TALLY-READY LEDGER EXPORT
--
-- Output is a balanced ledger-oriented CSV dataset suitable for accountant
-- mapping/import workflows. Exact Tally ledger names remain accountant-controlled.
-- ============================================================

create or replace function public.accountant_export_v2(
  p_from date,
  p_to date
)
returns table(
  voucher_date date,
  voucher_type text,
  voucher_number text,
  ledger_name text,
  debit numeric,
  credit numeric,
  reference text,
  narration text,
  source_type text,
  source_id text
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
  perform public.assert_manager_or_admin();

  if p_to<p_from then raise exception 'Invalid export date range'; end if;

  -- Sales: external payment debit rows.
  return query
  select
    s.created_at::date,
    'Sales'::text,
    s.invoice_number,
    case upper(p.payment_method)
      when 'CASH' then 'Cash'
      when 'UPI' then 'UPI Clearing'
      when 'CARD' then 'Card Clearing'
      else initcap(lower(p.payment_method))
    end,
    p.amount::numeric,
    0::numeric,
    p.reference_number,
    'WineShopPOS sale receipt',
    'SALE'::text,
    s.id::text
  from public.sales s
  join public.payments p on p.sale_id=s.id and p.payment_type='PAYMENT'
  where s.shop_id=v_shop
    and s.status<>'VOID'
    and s.created_at::date between p_from and p_to;

  -- Sales: store credit / gift voucher tender debit rows.
  return query
  select
    s.created_at::date,
    'Sales'::text,
    s.invoice_number,
    case t.tender_type
      when 'STORE_CREDIT' then 'Customer Store Credit'
      else 'Gift Voucher Liability'
    end,
    t.amount::numeric,
    0::numeric,
    t.reference,
    'WineShopPOS non-cash tender',
    'SALE'::text,
    s.id::text
  from public.sales s
  join public.sale_tender_adjustments t on t.sale_id=s.id
  where s.shop_id=v_shop
    and s.status<>'VOID'
    and s.created_at::date between p_from and p_to;

  -- Sales: revenue credit.
  return query
  select
    s.created_at::date,
    'Sales'::text,
    s.invoice_number,
    'Sales Revenue'::text,
    0::numeric,
    s.grand_total::numeric,
    null::text,
    'WineShopPOS sale',
    'SALE'::text,
    s.id::text
  from public.sales s
  where s.shop_id=v_shop
    and s.status<>'VOID'
    and s.created_at::date between p_from and p_to;

  -- Purchases: debit.
  return query
  select
    p.invoice_date,
    'Purchase'::text,
    coalesce(p.invoice_number,p.purchase_number),
    'Purchases'::text,
    p.total::numeric,
    0::numeric,
    p.invoice_number,
    'Purchase from '||coalesce(s.supplier_name,'Supplier'),
    'PURCHASE'::text,
    p.id::text
  from public.purchases p
  left join public.suppliers s on s.id=p.supplier_id
  where p.shop_id=v_shop
    and p.invoice_date between p_from and p_to;

  -- Purchases: supplier credit.
  return query
  select
    p.invoice_date,
    'Purchase'::text,
    coalesce(p.invoice_number,p.purchase_number),
    coalesce(s.supplier_name,'Supplier')::text,
    0::numeric,
    p.total::numeric,
    p.invoice_number,
    'Supplier payable',
    'PURCHASE'::text,
    p.id::text
  from public.purchases p
  left join public.suppliers s on s.id=p.supplier_id
  where p.shop_id=v_shop
    and p.invoice_date between p_from and p_to;

  -- Active expenses.
  return query
  select
    e.expense_date,
    'Journal'::text,
    'EXP-'||substr(e.id::text,1,8),
    coalesce(ec.name,'Business Expense')::text,
    e.amount::numeric,
    0::numeric,
    null::text,
    coalesce(e.description,'Expense'),
    'EXPENSE'::text,
    e.id::text
  from public.expenses e
  left join public.expense_categories ec on ec.id=e.category_id
  where e.shop_id=v_shop
    and e.status='ACTIVE'
    and e.expense_date between p_from and p_to;

  return query
  select
    e.expense_date,
    'Journal'::text,
    'EXP-'||substr(e.id::text,1,8),
    case upper(e.payment_method)
      when 'CASH' then 'Cash'
      when 'UPI' then 'UPI Clearing'
      when 'CARD' then 'Card Clearing'
      else 'Bank / Other'
    end,
    0::numeric,
    e.amount::numeric,
    null::text,
    coalesce(e.description,'Expense payment'),
    'EXPENSE'::text,
    e.id::text
  from public.expenses e
  where e.shop_id=v_shop
    and e.status='ACTIVE'
    and e.expense_date between p_from and p_to;

  -- Supplier payments.
  return query
  select
    sp.payment_date,
    'Payment'::text,
    'SP-'||substr(sp.id::text,1,8),
    coalesce(s.supplier_name,'Supplier')::text,
    sp.amount::numeric,
    0::numeric,
    sp.reference_number,
    'Supplier payment',
    'SUPPLIER_PAYMENT'::text,
    sp.id::text
  from public.supplier_payments sp
  left join public.suppliers s on s.id=sp.supplier_id
  where sp.shop_id=v_shop
    and sp.payment_date between p_from and p_to;

  return query
  select
    sp.payment_date,
    'Payment'::text,
    'SP-'||substr(sp.id::text,1,8),
    case upper(sp.payment_method)
      when 'CASH' then 'Cash'
      when 'UPI' then 'UPI Clearing'
      when 'CARD' then 'Card Clearing'
      when 'BANK_TRANSFER' then 'Bank'
      when 'CHEQUE' then 'Bank'
      else 'Bank / Other'
    end,
    0::numeric,
    sp.amount::numeric,
    sp.reference_number,
    'Supplier payment',
    'SUPPLIER_PAYMENT'::text,
    sp.id::text
  from public.supplier_payments sp
  where sp.shop_id=v_shop
    and sp.payment_date between p_from and p_to;
end;
$$;

grant execute on function public.accountant_export_v2(date,date) to authenticated;

notify pgrst, 'reload schema';
