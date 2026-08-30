-- WineShopPOS Master Reconsolidation
-- UX/product consolidation over the existing Chapters 1-26 architecture.
-- IMPORTANT: This migration is additive/replacement-only for functions and constraints.
-- It does not drop transactional history or rebuild existing sale/purchase/inventory tables.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. ACCOUNT / PROFILE UX + FUTURE MULTI-SHOP MEMBERSHIP
-- ============================================================
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists theme text not null default 'SYSTEM';

do $$ begin
  alter table public.profiles add constraint profiles_theme_check
    check (theme in ('SYSTEM','LIGHT','DARK'));
exception when duplicate_object then null; end $$;

create table if not exists public.user_shop_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  role text not null check (role in ('ADMIN','MANAGER','CASHIER')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

drop trigger if exists trg_user_shop_memberships_updated_at on public.user_shop_memberships;
create trigger trg_user_shop_memberships_updated_at before update on public.user_shop_memberships
for each row execute function public.set_updated_at();

insert into public.user_shop_memberships(user_id,shop_id,role,active)
select id,shop_id,role,active from public.profiles
on conflict (user_id,shop_id) do update
set role=excluded.role,active=excluded.active;

drop function if exists public.my_profile();
create function public.my_profile()
returns table (
  user_id uuid,
  shop_id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  theme text,
  role text,
  active boolean,
  shop_name text,
  shop_slug text,
  organization_id uuid,
  organization_name text,
  max_users integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.shop_id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.theme,
    p.role,
    p.active,
    s.name,
    s.slug,
    s.organization_id,
    o.name,
    s.max_users
  from public.profiles p
  join public.shops s on s.id=p.shop_id
  left join public.organizations o on o.id=s.organization_id
  where p.id=auth.uid();
$$;

create or replace function public.update_my_profile(
  p_full_name text,
  p_phone text default null,
  p_avatar_url text default null,
  p_theme text default 'SYSTEM'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(p_full_name),'') is null then raise exception 'Display name is required'; end if;
  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
  update public.profiles
  set full_name=trim(p_full_name),phone=nullif(trim(p_phone),''),avatar_url=nullif(trim(p_avatar_url),''),theme=p_theme
  where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

create or replace function public.my_shop_memberships()
returns table(shop_id uuid,shop_name text,shop_slug text,role text,is_current boolean)
language sql
stable
security definer
set search_path = public
as $$
  select m.shop_id,s.name,s.slug,m.role,(m.shop_id=public.current_shop_id())
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  where m.user_id=auth.uid() and m.active=true and s.active=true and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date)
  order by (m.shop_id=public.current_shop_id()) desc,s.name;
$$;

create or replace function public.switch_shop(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_role text;
begin
  select m.role into v_role
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  where m.user_id=auth.uid() and m.shop_id=p_shop_id and m.active=true and s.active=true and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date);
  if v_role is null then raise exception 'You do not have access to this shop'; end if;
  update public.profiles set shop_id=p_shop_id,role=v_role where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

-- ============================================================
-- 2. EXPENSE MANAGEMENT (CORE)
-- ============================================================
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(shop_id,name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  expense_date date not null default current_date,
  amount numeric(14,2) not null check (amount>0),
  description text not null,
  payment_method text not null check (payment_method in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER')),
  reference_number text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','VOID')),
  entered_by uuid not null references auth.users(id) on delete restrict,
  voided_by uuid references auth.users(id) on delete set null,
  void_reason text,
  voided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_expenses_shop_date on public.expenses(shop_id,expense_date desc);

insert into public.expense_categories(shop_id,name)
select s.id,x.name from public.shops s
cross join (values ('Rent'),('Salary'),('Electricity'),('Transport'),('Maintenance'),('Miscellaneous')) x(name)
on conflict(shop_id,name) do nothing;

create or replace function public.record_expense(
  p_category_id uuid,p_expense_date date,p_amount numeric,p_description text,p_payment_method text,p_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_amount<=0 then raise exception 'Expense amount must be positive'; end if;
  if nullif(trim(p_description),'') is null then raise exception 'Description is required'; end if;
  if p_payment_method not in ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE','OTHER') then raise exception 'Invalid payment method'; end if;
  if not exists(select 1 from public.expense_categories where id=p_category_id and shop_id=v_shop and active=true) then raise exception 'Expense category not found'; end if;
  insert into public.expenses(shop_id,category_id,expense_date,amount,description,payment_method,reference_number,entered_by)
  values(v_shop,p_category_id,coalesce(p_expense_date,current_date),p_amount,trim(p_description),p_payment_method,nullif(trim(p_reference),''),auth.uid())
  returning id into v_id;
  perform public.write_audit(v_shop,'EXPENSE_RECORDED','expense',v_id::text,null,null,jsonb_build_object('amount',p_amount,'category_id',p_category_id));
  return v_id;
end;$$;

create or replace function public.void_expense(p_expense_id uuid,p_reason text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if nullif(trim(p_reason),'') is null then raise exception 'Void reason is required'; end if;
  update public.expenses set status='VOID',voided_by=auth.uid(),void_reason=trim(p_reason),voided_at=now()
  where id=p_expense_id and shop_id=v_shop and status='ACTIVE';
  if not found then raise exception 'Active expense not found'; end if;
  perform public.write_audit(v_shop,'EXPENSE_VOIDED','expense',p_expense_id::text,null,null,jsonb_build_object('reason',p_reason));
end;$$;

-- ============================================================
-- 3. CUSTOMER + CREDIT / UDHAAR (PLUS)
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  full_name text not null,
  mobile text,
  email text,
  notes text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create unique index if not exists uq_customers_shop_mobile on public.customers(shop_id,mobile) where mobile is not null and mobile<>'';

alter table public.sales add column if not exists customer_id uuid references public.customers(id) on delete set null;

create table if not exists public.customer_credit_entries (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  entry_type text not null check (entry_type in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT')),
  amount numeric(14,2) not null check (amount>0),
  sale_id uuid references public.sales(id) on delete set null,
  reference_number text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_credit_shop_customer on public.customer_credit_entries(shop_id,customer_id,created_at desc);

create or replace function public.create_customer(p_full_name text,p_mobile text default null,p_email text default null,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();
  if public.current_user_role() not in ('ADMIN','MANAGER','CASHIER') then raise exception 'Role not allowed'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'Customer name is required'; end if;
  insert into public.customers(shop_id,full_name,mobile,email,notes,created_by)
  values(v_shop,trim(p_full_name),nullif(trim(p_mobile),''),nullif(trim(p_email),''),nullif(trim(p_notes),''),auth.uid())
  returning id into v_id;
  return v_id;
end;$$;

create or replace function public.link_sale_customer(p_sale_id uuid,p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
  update public.sales set customer_id=p_customer_id where id=p_sale_id and shop_id=v_shop;
  if not found then raise exception 'Sale not found'; end if;
end;$$;

create or replace function public.record_customer_credit(
  p_customer_id uuid,p_entry_type text,p_amount numeric,p_sale_id uuid default null,p_reference text default null,p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_entry_type not in ('CHARGE','PAYMENT','ADJUSTMENT_CREDIT','ADJUSTMENT_DEBIT') then raise exception 'Invalid credit entry type'; end if;
  if p_amount<=0 then raise exception 'Amount must be positive'; end if;
  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
  if p_sale_id is not null and not exists(select 1 from public.sales where id=p_sale_id and shop_id=v_shop) then raise exception 'Sale not found'; end if;
  insert into public.customer_credit_entries(shop_id,customer_id,entry_type,amount,sale_id,reference_number,description,created_by)
  values(v_shop,p_customer_id,p_entry_type,p_amount,p_sale_id,nullif(trim(p_reference),''),nullif(trim(p_description),''),auth.uid()) returning id into v_id;
  perform public.write_audit(v_shop,'CUSTOMER_CREDIT_'||p_entry_type,'customer_credit',v_id::text,null,null,jsonb_build_object('customer_id',p_customer_id,'amount',p_amount));
  return v_id;
end;$$;

create or replace function public.customer_balances()
returns table(customer_id uuid,full_name text,mobile text,total_charges numeric,total_payments numeric,outstanding numeric)
language sql
stable
security definer
set search_path=public
as $$
  select c.id,c.full_name,c.mobile,
    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else 0 end),0),
    coalesce(sum(case when e.entry_type in ('PAYMENT','ADJUSTMENT_CREDIT') then e.amount else 0 end),0),
    coalesce(sum(case when e.entry_type in ('CHARGE','ADJUSTMENT_DEBIT') then e.amount else -e.amount end),0)
  from public.customers c
  left join public.customer_credit_entries e on e.customer_id=c.id and e.shop_id=c.shop_id
  where c.shop_id=public.assert_shop_access() and c.active=true and public.current_user_role() in ('ADMIN','MANAGER')
  group by c.id,c.full_name,c.mobile
  order by 6 desc,c.full_name;
$$;

-- ============================================================
-- 4. COMPLIANCE FOUNDATION (NO LEGAL RULES HARDCODED)
-- ============================================================
create table if not exists public.compliance_profiles (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  state_code text,
  state_name text,
  license_number text,
  license_type text,
  license_valid_from date,
  license_valid_to date,
  excise_registration_number text,
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create or replace function public.upsert_compliance_profile(
  p_state_code text,p_state_name text,p_license_number text,p_license_type text,p_license_valid_from date,p_license_valid_to date,p_excise_registration_number text,p_notes text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  insert into public.compliance_profiles(shop_id,state_code,state_name,license_number,license_type,license_valid_from,license_valid_to,excise_registration_number,notes,updated_by,updated_at)
  values(v_shop,nullif(trim(p_state_code),''),nullif(trim(p_state_name),''),nullif(trim(p_license_number),''),nullif(trim(p_license_type),''),p_license_valid_from,p_license_valid_to,nullif(trim(p_excise_registration_number),''),nullif(trim(p_notes),''),auth.uid(),now())
  on conflict(shop_id) do update set state_code=excluded.state_code,state_name=excluded.state_name,license_number=excluded.license_number,license_type=excluded.license_type,license_valid_from=excluded.license_valid_from,license_valid_to=excluded.license_valid_to,excise_registration_number=excluded.excise_registration_number,notes=excluded.notes,updated_by=auth.uid(),updated_at=now();
end;$$;

-- ============================================================
-- 5. BACKUP / RECOVERY VERIFICATION LOG
-- ============================================================
create table if not exists public.backup_restore_tests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  test_date date not null default current_date,
  environment text not null,
  backup_reference text,
  result text not null check (result in ('PASS','FAIL')),
  notes text,
  tested_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create or replace function public.record_backup_restore_test(p_environment text,p_backup_reference text,p_result text,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;v_id uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  if p_result not in ('PASS','FAIL') then raise exception 'Result must be PASS or FAIL'; end if;
  if nullif(trim(p_environment),'') is null then raise exception 'Test environment is required'; end if;
  insert into public.backup_restore_tests(shop_id,environment,backup_reference,result,notes,tested_by)
  values(v_shop,trim(p_environment),nullif(trim(p_backup_reference),''),p_result,nullif(trim(p_notes),''),auth.uid()) returning id into v_id;
  perform public.write_audit(v_shop,'BACKUP_RESTORE_TEST_'||p_result,'backup_restore_test',v_id::text,null,null,jsonb_build_object('environment',p_environment));
  return v_id;
end;$$;

-- ============================================================
-- 6. HISTORICAL COST SNAPSHOT FOR PROFIT INTELLIGENCE
-- ============================================================
alter table public.sale_items add column if not exists cost_price_snapshot numeric(12,2);
alter table public.sale_items add column if not exists cost_snapshot_source text;

update public.sale_items si
set cost_price_snapshot=p.purchase_price,cost_snapshot_source='CURRENT_PRODUCT_BACKFILL'
from public.products p
where si.product_id=p.id and si.cost_price_snapshot is null;

create or replace function public.set_sale_item_cost_snapshot()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.cost_price_snapshot is null then
    select purchase_price into new.cost_price_snapshot from public.products where id=new.product_id and shop_id=new.shop_id;
    new.cost_snapshot_source:='SALE_TIME_PRODUCT_COST';
  end if;
  return new;
end;$$;

drop trigger if exists trg_sale_item_cost_snapshot on public.sale_items;
create trigger trg_sale_item_cost_snapshot before insert on public.sale_items
for each row execute function public.set_sale_item_cost_snapshot();

-- ============================================================
-- 7. ADVANCED PURCHASE-ORDER APPROVAL LIFECYCLE (PLUS)
-- ============================================================
alter table public.purchase_orders add column if not exists approved_by uuid references auth.users(id) on delete set null;
alter table public.purchase_orders add column if not exists approved_at timestamptz;

alter table public.purchase_orders drop constraint if exists purchase_orders_status_check;
alter table public.purchase_orders add constraint purchase_orders_status_check
check (status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED'));

create or replace function public.submit_purchase_order(p_po_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.purchase_orders set status='APPROVAL_PENDING' where id=p_po_id and shop_id=v_shop and status='DRAFT';
  if not found then raise exception 'Draft purchase order not found'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_SUBMITTED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.approve_purchase_order(p_po_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.purchase_orders set status='APPROVED',approved_by=auth.uid(),approved_at=now()
  where id=p_po_id and shop_id=v_shop and status='APPROVAL_PENDING';
  if not found then raise exception 'Purchase order is not awaiting approval'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_APPROVED','purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.set_purchase_order_status(p_po_id uuid,p_status text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_status='SENT' then
    update public.purchase_orders set status='SENT' where id=p_po_id and shop_id=v_shop and status='APPROVED';
  elsif p_status='CANCELLED' then
    update public.purchase_orders set status='CANCELLED' where id=p_po_id and shop_id=v_shop and status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT');
  else
    raise exception 'Unsupported purchase order status transition';
  end if;
  if not found then raise exception 'Purchase order cannot be changed from its current status'; end if;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_'||p_status,'purchase_order',p_po_id::text,null,null,'{}'::jsonb);
end;$$;

-- Replace receive_purchase_order only to enforce the approved procurement lifecycle.
create or replace function public.receive_purchase_order(
  p_po_id uuid,p_invoice_number text,p_invoice_date date,p_receive_items jsonb default null,p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;v_po public.purchase_orders%rowtype;r record;v_payload jsonb:='[]'::jsonb;v_qty integer;v_remaining integer;v_purchase uuid;v_all_received boolean;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('APPROVED','SENT','PARTIALLY_RECEIVED') for update;
  if not found then raise exception 'PO must be approved before receiving goods'; end if;
  if p_receive_items is null then
    for r in select * from public.purchase_order_items where purchase_order_id=p_po_id loop
      v_remaining:=r.ordered_quantity-r.received_quantity;
      if v_remaining>0 then
        v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_remaining,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_remaining,'po_item_id',r.id));
      end if;
    end loop;
  else
    for r in select poi.*,x.qty from public.purchase_order_items poi join lateral(
      select (e->>'po_item_id')::uuid id,(e->>'quantity')::integer qty from jsonb_array_elements(p_receive_items)e
    )x on x.id=poi.id where poi.purchase_order_id=p_po_id loop
      v_remaining:=r.ordered_quantity-r.received_quantity;v_qty:=r.qty;
      if v_qty<=0 or v_qty>v_remaining then raise exception 'Invalid receive quantity'; end if;
      v_payload:=v_payload||jsonb_build_array(jsonb_build_object('product_id',r.product_id,'quantity',v_qty,'purchase_price',r.purchase_price,'case_count',0,'units_per_case',1,'loose_bottles',v_qty,'po_item_id',r.id));
    end loop;
  end if;
  if jsonb_array_length(v_payload)=0 then raise exception 'Nothing remaining to receive'; end if;
  v_purchase:=public.receive_purchase(v_po.supplier_id,p_invoice_number,p_invoice_date,v_payload,p_notes);
  update public.purchases set purchase_order_id=p_po_id where id=v_purchase;
  for r in select * from jsonb_array_elements(v_payload) loop
    update public.purchase_order_items set received_quantity=received_quantity+(r->>'quantity')::integer where id=(r->>'po_item_id')::uuid;
  end loop;
  select not exists(select 1 from public.purchase_order_items where purchase_order_id=p_po_id and received_quantity<ordered_quantity) into v_all_received;
  update public.purchase_orders set status=case when v_all_received then 'RECEIVED' else 'PARTIALLY_RECEIVED' end where id=p_po_id;
  perform public.write_audit(v_shop,'PURCHASE_ORDER_RECEIVED','purchase_order',p_po_id::text,null,null,jsonb_build_object('purchase_id',v_purchase));
  return v_purchase;
end;$$;

-- ============================================================
-- 8. ADVANCED STOCK TRANSFER LIFECYCLE (PLUS)
-- Existing legacy APPROVED transfers already moved stock atomically; mark them COMPLETE.
-- New lifecycle: REQUESTED -> APPROVED -> DISPATCHED -> IN_TRANSIT -> RECEIVED -> COMPLETED
-- ============================================================
alter table public.stock_transfers drop constraint if exists stock_transfers_status_check;
update public.stock_transfers set status='COMPLETED' where status='APPROVED';
alter table public.stock_transfers add constraint stock_transfers_status_check
check (status in ('REQUESTED','APPROVED','REJECTED','CANCELLED','DISPATCHED','IN_TRANSIT','RECEIVED','COMPLETED'));

alter table public.stock_transfers add column if not exists dispatched_by uuid references auth.users(id) on delete set null;
alter table public.stock_transfers add column if not exists received_by uuid references auth.users(id) on delete set null;
alter table public.stock_transfers add column if not exists dispatched_at timestamptz;
alter table public.stock_transfers add column if not exists received_at timestamptz;
alter table public.stock_transfers add column if not exists completed_at timestamptz;

create or replace function public.approve_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;v_transfer public.stock_transfers%rowtype;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
  if not found then raise exception 'Incoming transfer request not found'; end if;
  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
  update public.stock_transfers set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_transfer_id;
  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
end;$$;

create or replace function public.dispatch_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_source uuid;v_transfer public.stock_transfers%rowtype;r record;v_src_product public.products%rowtype;v_dest_product uuid;v_cat_name text;v_dest_cat uuid;v_before integer;v_after integer;
begin
  v_source:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and source_shop_id=v_source and status='APPROVED' for update;
  if not found then raise exception 'Approved outgoing transfer not found'; end if;
  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_source;
    if not found then raise exception 'Source product missing'; end if;
    select quantity into v_before from public.inventory where shop_id=v_source and product_id=v_src_product.id for update;
    if v_before is null or v_before<r.quantity then raise exception 'Insufficient stock for %',v_src_product.product_name; end if;
    select id into v_dest_product from public.products where shop_id=v_transfer.destination_shop_id and barcode=v_src_product.barcode limit 1;
    if v_dest_product is null then
      select name into v_cat_name from public.categories where id=v_src_product.category_id;
      if v_cat_name is not null then
        select id into v_dest_cat from public.categories where shop_id=v_transfer.destination_shop_id and lower(name)=lower(v_cat_name) limit 1;
        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_transfer.destination_shop_id,v_cat_name) returning id into v_dest_cat; end if;
      end if;
      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
      values(v_transfer.destination_shop_id,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
      returning id into v_dest_product;
      insert into public.inventory(shop_id,product_id,quantity) values(v_transfer.destination_shop_id,v_dest_product,0);
    end if;
    update public.stock_transfer_items set destination_product_id=v_dest_product where id=r.id;
    v_after:=v_before-r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_source and product_id=v_src_product.id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_source,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer dispatched',auth.uid());
  end loop;
  update public.stock_transfers set status='DISPATCHED',dispatched_by=auth.uid(),dispatched_at=now() where id=p_transfer_id;
  perform public.write_audit(v_source,'TRANSFER_DISPATCHED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.mark_stock_transfer_in_transit(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='IN_TRANSIT' where id=p_transfer_id and source_shop_id=v_shop and status='DISPATCHED';
  if not found then raise exception 'Dispatched transfer not found'; end if;
  perform public.write_audit(v_shop,'TRANSFER_IN_TRANSIT','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

create or replace function public.receive_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;v_transfer public.stock_transfers%rowtype;r record;v_before integer;v_after integer;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status in ('DISPATCHED','IN_TRANSIT') for update;
  if not found then raise exception 'Transfer is not ready to receive'; end if;
  for r in select * from public.stock_transfer_items where transfer_id=p_transfer_id loop
    if r.destination_product_id is null then raise exception 'Destination product mapping missing'; end if;
    select quantity into v_before from public.inventory where shop_id=v_dest and product_id=r.destination_product_id for update;
    v_before:=coalesce(v_before,0);v_after:=v_before+r.quantity;
    update public.inventory set quantity=v_after where shop_id=v_dest and product_id=r.destination_product_id;
    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
    values(v_dest,r.destination_product_id,'TRANSFER_IN',r.quantity,v_before,v_after,'STOCK_TRANSFER',p_transfer_id,'Branch transfer received',auth.uid());
  end loop;
  update public.stock_transfers set status='RECEIVED',received_by=auth.uid(),received_at=now() where id=p_transfer_id;
  perform public.write_audit(v_dest,'TRANSFER_RECEIVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
end;$$;

create or replace function public.complete_stock_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_dest uuid;
begin
  v_dest:=public.assert_shop_access();perform public.assert_manager_or_admin();
  update public.stock_transfers set status='COMPLETED',completed_at=now() where id=p_transfer_id and destination_shop_id=v_dest and status='RECEIVED';
  if not found then raise exception 'Received transfer not found'; end if;
  perform public.write_audit(v_dest,'TRANSFER_COMPLETED','stock_transfer',p_transfer_id::text,null,null,'{}'::jsonb);
end;$$;

-- ============================================================
-- 9. PURCHASE / SUPPLIER INTELLIGENCE (PRO)
-- ============================================================
create or replace function public.supplier_price_comparison(p_product_id uuid,p_days integer default 180)
returns table(supplier_id uuid,supplier_name text,purchase_count bigint,total_units bigint,avg_price numeric,min_price numeric,max_price numeric,last_price numeric,last_purchase_date date)
language sql
stable
security definer
set search_path=public
as $$
  with rows as (
    select p.supplier_id,p.supplier_name_snapshot supplier_name,pi.quantity,pi.purchase_price,p.invoice_date,
           row_number() over(partition by p.supplier_id order by p.invoice_date desc,p.created_at desc) rn
    from public.purchase_items pi join public.purchases p on p.id=pi.purchase_id
    where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and p.status='RECEIVED'
      and p.invoice_date>=current_date-greatest(p_days,1)
  )
  select supplier_id,max(supplier_name),count(*),sum(quantity),round(avg(purchase_price),2),min(purchase_price),max(purchase_price),max(purchase_price) filter(where rn=1),max(invoice_date)
  from rows group by supplier_id order by avg(purchase_price),max(invoice_date) desc;
$$;

create or replace function public.supplier_intelligence(p_days integer default 180)
returns table(supplier_id uuid,supplier_name text,purchase_count bigint,purchase_total numeric,return_total numeric,payment_total numeric,outstanding numeric,po_ordered integer,po_received integer,receive_variance integer)
language sql
stable
security definer
set search_path=public
as $$
  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access() and active=true),
  p as (select supplier_id,count(*) cnt,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' and invoice_date>=current_date-greatest(p_days,1) group by supplier_id),
  r as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' and created_at>=now()-(greatest(p_days,1)||' days')::interval group by supplier_id),
  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() and payment_date>=current_date-greatest(p_days,1) group by supplier_id),
  po as (select o.supplier_id,sum(i.ordered_quantity)::int ordered,sum(i.received_quantity)::int received from public.purchase_orders o join public.purchase_order_items i on i.purchase_order_id=o.id where o.shop_id=public.current_shop_id() and o.created_at>=now()-(greatest(p_days,1)||' days')::interval group by o.supplier_id)
  select s.id,s.supplier_name,coalesce(p.cnt,0),coalesce(p.total,0),coalesce(r.total,0),coalesce(pay.total,0),coalesce(p.total,0)-coalesce(r.total,0)-coalesce(pay.total,0),coalesce(po.ordered,0),coalesce(po.received,0),coalesce(po.ordered,0)-coalesce(po.received,0)
  from s left join p on p.supplier_id=s.id left join r on r.supplier_id=s.id left join pay on pay.supplier_id=s.id left join po on po.supplier_id=s.id
  order by coalesce(p.total,0) desc,s.supplier_name;
$$;

-- ============================================================
-- 10. INVENTORY INTELLIGENCE (PRO)
-- ============================================================
create or replace function public.stock_explanation(p_product_id uuid,p_days integer default 365)
returns table(movement_type text,quantity_change bigint,event_count bigint)
language sql
stable
security definer
set search_path=public
as $$
  select sm.movement_type,sum(sm.quantity_change)::bigint,count(*)::bigint
  from public.stock_movements sm
  where sm.shop_id=public.assert_shop_access() and sm.product_id=p_product_id
    and sm.created_at>=now()-(greatest(p_days,1)||' days')::interval
  group by sm.movement_type order by sm.movement_type;
$$;

create or replace function public.inventory_health(p_history_days integer default 30,p_dead_days integer default 45)
returns table(product_id uuid,product_name text,current_stock integer,units_sold integer,avg_daily numeric,days_remaining numeric,last_sale_at timestamptz,classification text,inventory_cost numeric)
language sql
stable
security definer
set search_path=public
as $$
  with base as (
    select p.id,p.product_name,p.minimum_stock,p.purchase_price,coalesce(i.quantity,0) stock
    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    where p.shop_id=public.assert_shop_access() and p.active=true
  ),sales as (
    select si.product_id,
      sum(si.quantity) filter(where s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval)::int units,
      max(s.created_at) last_sale
    from public.sale_items si join public.sales s on s.id=si.sale_id
    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED')
    group by si.product_id
  ),calc as (
    select b.*,coalesce(s.units,0) units,s.last_sale,round(coalesce(s.units,0)::numeric/greatest(p_history_days,1),2) avgd
    from base b left join sales s on s.product_id=b.id
  )
  select id,product_name,stock,units,avgd,
    case when avgd>0 then round(stock/avgd,1) else null end,last_sale,
    case
      when stock=0 then 'OUT_OF_STOCK'
      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 'DEAD'
      when avgd>0 and stock/avgd<=3 then 'STOCKOUT_RISK'
      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 'OVERSTOCK'
      when units>=greatest(p_history_days,1) then 'FAST'
      when units<=2 then 'SLOW'
      else 'HEALTHY'
    end,
    round(stock*purchase_price,2)
  from calc order by
    case
      when stock=0 then 1
      when (last_sale is null or last_sale<now()-(greatest(p_dead_days,1)||' days')::interval) and stock>0 then 2
      when avgd>0 and stock/avgd<=3 then 3
      when stock>greatest(minimum_stock*4,ceil(avgd*30)::int) and stock>minimum_stock*2 then 4
      else 5 end,
    product_name;
$$;

-- ============================================================
-- 11. OWNER CENTER / PROFIT / LOSS CONTROL (PRO)
-- ============================================================
create or replace function public.owner_center_summary(p_from date default current_date-30,p_to date default current_date)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_shop uuid;v_revenue numeric;v_cogs numeric;v_expenses numeric;v_purchases numeric;v_returns numeric;v_variance numeric;v_bills bigint;v_low bigint;v_inventory numeric;
begin
  v_shop:=public.assert_shop_access();perform public.assert_admin();
  select coalesce(sum(grand_total),0),count(*) into v_revenue,v_bills from public.sales where shop_id=v_shop and status<>'VOID' and created_at::date between p_from and p_to;
  select coalesce(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),0) into v_cogs from public.sale_items si join public.sales s on s.id=si.sale_id where si.shop_id=v_shop and s.status<>'VOID' and s.created_at::date between p_from and p_to;
  select coalesce(sum(amount),0) into v_expenses from public.expenses where shop_id=v_shop and status='ACTIVE' and expense_date between p_from and p_to;
  select coalesce(sum(total),0) into v_purchases from public.purchases where shop_id=v_shop and status='RECEIVED' and invoice_date between p_from and p_to;
  select coalesce(sum(total_refund),0) into v_returns from public.sale_return_requests where shop_id=v_shop and status='APPROVED' and created_at::date between p_from and p_to;
  select coalesce(sum(cash_difference),0) into v_variance from public.cashier_shifts where shop_id=v_shop and status='CLOSED' and closed_at::date between p_from and p_to;
  select count(*) into v_low from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id where p.shop_id=v_shop and p.active=true and coalesce(i.quantity,0)<=p.minimum_stock;
  select coalesce(sum(i.quantity*p.purchase_price),0) into v_inventory from public.inventory i join public.products p on p.id=i.product_id where i.shop_id=v_shop and p.active=true;
  return jsonb_build_object('from',p_from,'to',p_to,'revenue',v_revenue,'bills',v_bills,'cogs',v_cogs,'gross_profit',v_revenue-v_cogs,'expenses',v_expenses,'operating_profit',v_revenue-v_cogs-v_expenses,'purchases',v_purchases,'returns',v_returns,'cash_variance',v_variance,'low_stock_count',v_low,'inventory_cost',v_inventory);
end;$$;

create or replace function public.profit_by_product(p_from date default current_date-30,p_to date default current_date)
returns table(product_id uuid,product_name text,quantity bigint,revenue numeric,cogs numeric,gross_profit numeric,margin_pct numeric)
language sql
stable
security definer
set search_path=public
as $$
  select si.product_id,max(si.product_name_snapshot),sum(si.quantity)::bigint,round(sum(si.line_total),2),round(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),round(sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2),
    case when sum(si.line_total)>0 then round((sum(si.line_total)-sum(si.quantity*coalesce(si.cost_price_snapshot,0)))/sum(si.line_total)*100,2) else 0 end
  from public.sale_items si join public.sales s on s.id=si.sale_id
  where si.shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and s.status<>'VOID' and s.created_at::date between p_from and p_to
  group by si.product_id order by 6 desc;
$$;

create or replace function public.loss_control_exceptions(p_days integer default 30)
returns table(exception_type text,severity text,event_time timestamptz,entity_id text,summary text,amount numeric,action_path text)
language sql
stable
security definer
set search_path=public
as $$
  with q as (
    select 'CASH_VARIANCE'::text type,case when abs(coalesce(cash_difference,0))>=1000 then 'HIGH' else 'MEDIUM' end severity,coalesce(closed_at,opened_at) t,id::text entity,
      'Shift cash difference '||coalesce(cash_difference,0)::text summary,abs(coalesce(cash_difference,0)) amount,'/operations/shifts' path
    from public.cashier_shifts where shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and status='CLOSED' and abs(coalesce(cash_difference,0))>=200 and opened_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'REFUND',case when total_refund>=2000 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Approved refund '||total_refund::text,total_refund,'/pos/returns'
    from public.sale_return_requests where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and status='APPROVED' and total_refund>=500 and created_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'DISCOUNT',case when discount>=1000 or (subtotal>0 and discount/subtotal>=0.20) then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Sale discount '||discount::text,discount,'/pos/sales'
    from public.sales where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and discount>0 and (discount>=500 or (subtotal>0 and discount/subtotal>=0.10)) and created_at>=now()-(greatest(p_days,1)||' days')::interval
    union all
    select 'STOCK_ADJUSTMENT',case when abs(quantity_change)>=12 then 'HIGH' else 'MEDIUM' end,created_at,id::text,'Stock adjustment '||quantity_change::text,abs(quantity_change)::numeric,'/inventory'
    from public.stock_movements where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and movement_type in ('DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION','STOCK_COUNT') and abs(quantity_change)>=5 and created_at>=now()-(greatest(p_days,1)||' days')::interval
  )
  select type,severity,t,entity,summary,amount,path from q order by case severity when 'HIGH' then 1 else 2 end,t desc;
$$;

create or replace function public.owner_recommendations(p_history_days integer default 30)
returns table(priority text,recommendation_type text,title text,message text,action_path text,tier text)
language sql
stable
security definer
set search_path=public
as $$
  with reorder as (
    select * from public.reorder_suggestions(p_history_days,7) limit 8
  ),dead as (
    select * from public.inventory_health(p_history_days,45) where classification in ('DEAD','OVERSTOCK') limit 8
  ),shiftx as (
    select * from public.loss_control_exceptions(p_history_days) where exception_type='CASH_VARIANCE' limit 5
  )
  select case when coalesce(days_remaining,999)<=2 then 'HIGH' else 'MEDIUM' end,'REORDER','Stockout risk: '||product_name,
    'Stock '||current_stock||'; suggested order '||suggested_cases||' case(s).','/inventory/intelligence','PLUS' from reorder where public.current_user_role()='ADMIN'
  union all
  select 'MEDIUM','INVENTORY_HEALTH',classification||': '||product_name,
    'Current stock '||current_stock||'; inventory cost '||inventory_cost::text||'.','/inventory/intelligence','PLUS' from dead where public.current_user_role()='ADMIN'
  union all
  select severity,'CASH_VARIANCE','Shift variance requires review',summary,'/owner/exceptions','PLUS' from shiftx where public.current_user_role()='ADMIN'
  limit 20;
$$;

-- ============================================================
-- 12. RLS / AUDIT / GRANTS FOR NEW TABLES
-- ============================================================
alter table public.user_shop_memberships enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.customers enable row level security;
alter table public.customer_credit_entries enable row level security;
alter table public.compliance_profiles enable row level security;
alter table public.backup_restore_tests enable row level security;

drop policy if exists user_shop_memberships_select on public.user_shop_memberships;
create policy user_shop_memberships_select on public.user_shop_memberships for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());

drop policy if exists expense_categories_select on public.expense_categories;
create policy expense_categories_select on public.expense_categories for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists customer_credit_select on public.customer_credit_entries;
create policy customer_credit_select on public.customer_credit_entries for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists compliance_profiles_select on public.compliance_profiles;
create policy compliance_profiles_select on public.compliance_profiles for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));

drop policy if exists backup_restore_tests_select on public.backup_restore_tests;
create policy backup_restore_tests_select on public.backup_restore_tests for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role()='ADMIN');

-- Generic audit triggers on new shop-scoped mutable business tables.
drop trigger if exists trg_audit_expenses on public.expenses;
create trigger trg_audit_expenses after insert or update on public.expenses for each row execute function public.audit_row_changes();
drop trigger if exists trg_audit_customers on public.customers;
create trigger trg_audit_customers after insert or update on public.customers for each row execute function public.audit_row_changes();

-- Direct browser mutations are not granted for transactional new tables; RPCs are authoritative.
grant select on public.user_shop_memberships,public.expense_categories,public.expenses,public.customers,public.customer_credit_entries,public.compliance_profiles,public.backup_restore_tests to authenticated;

grant execute on function public.my_profile() to authenticated;
grant execute on function public.update_my_profile(text,text,text,text) to authenticated;
grant execute on function public.my_shop_memberships() to authenticated;
grant execute on function public.switch_shop(uuid) to authenticated;
grant execute on function public.record_expense(uuid,date,numeric,text,text,text) to authenticated;
grant execute on function public.void_expense(uuid,text) to authenticated;
grant execute on function public.create_customer(text,text,text,text) to authenticated;
grant execute on function public.link_sale_customer(uuid,uuid) to authenticated;
grant execute on function public.record_customer_credit(uuid,text,numeric,uuid,text,text) to authenticated;
grant execute on function public.customer_balances() to authenticated;
grant execute on function public.upsert_compliance_profile(text,text,text,text,date,date,text,text) to authenticated;
grant execute on function public.record_backup_restore_test(text,text,text,text) to authenticated;
grant execute on function public.submit_purchase_order(uuid) to authenticated;
grant execute on function public.approve_purchase_order(uuid) to authenticated;
grant execute on function public.dispatch_stock_transfer(uuid) to authenticated;
grant execute on function public.mark_stock_transfer_in_transit(uuid) to authenticated;
grant execute on function public.receive_stock_transfer(uuid) to authenticated;
grant execute on function public.complete_stock_transfer(uuid) to authenticated;
grant execute on function public.supplier_price_comparison(uuid,integer) to authenticated;
grant execute on function public.supplier_intelligence(integer) to authenticated;
grant execute on function public.stock_explanation(uuid,integer) to authenticated;
grant execute on function public.inventory_health(integer,integer) to authenticated;
grant execute on function public.owner_center_summary(date,date) to authenticated;
grant execute on function public.profit_by_product(date,date) to authenticated;
grant execute on function public.loss_control_exceptions(integer) to authenticated;
grant execute on function public.owner_recommendations(integer) to authenticated;

-- Protect cost snapshots from Cashier direct queries. Owner/profit intelligence reads through security-definer RPCs.
revoke select on public.sale_items from authenticated;
grant select(id,shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total,created_at) on public.sale_items to authenticated;



-- ============================================================
-- 13. MODERN UX PATCH: THEME + EDITABLE SHOP SETTINGS
-- ============================================================
create or replace function public.update_my_theme(p_theme text)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_theme not in ('SYSTEM','LIGHT','DARK') then raise exception 'Invalid theme'; end if;
  update public.profiles set theme=p_theme where id=auth.uid() and active=true;
  if not found then raise exception 'Active profile not found'; end if;
end;
$$;

create or replace function public.get_shop_configuration()
returns table(
  shop_id uuid,
  shop_name text,
  shop_slug text,
  store_address text,
  store_phone text,
  tax_registration_number text,
  currency_code text,
  currency_symbol text,
  invoice_prefix text,
  purchase_prefix text,
  tax_enabled boolean,
  tax_percentage numeric,
  printer_paper_mm integer,
  receipt_footer text
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  return query
  select s.id,s.name,s.slug,ss.store_address,ss.store_phone,ss.tax_registration_number,
    ss.currency_code,ss.currency_symbol,ss.invoice_prefix,ss.purchase_prefix,
    ss.tax_enabled,ss.tax_percentage,ss.printer_paper_mm,ss.receipt_footer
  from public.shops s
  left join public.shop_settings ss on ss.shop_id=s.id
  where s.id=v_shop;
end;
$$;

create or replace function public.update_shop_configuration(
  p_shop_name text,
  p_store_address text default null,
  p_store_phone text default null,
  p_tax_registration_number text default null,
  p_currency_code text default 'INR',
  p_currency_symbol text default '₹',
  p_invoice_prefix text default 'INV',
  p_purchase_prefix text default 'PUR',
  p_tax_enabled boolean default false,
  p_tax_percentage numeric default 0,
  p_printer_paper_mm integer default 80,
  p_receipt_footer text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_old jsonb;
  v_new jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_admin();
  if nullif(trim(p_shop_name),'') is null then raise exception 'Shop name is required'; end if;
  if nullif(trim(p_currency_code),'') is null then raise exception 'Currency code is required'; end if;
  if nullif(trim(p_currency_symbol),'') is null then raise exception 'Currency symbol is required'; end if;
  if nullif(trim(p_invoice_prefix),'') is null then raise exception 'Invoice prefix is required'; end if;
  if nullif(trim(p_purchase_prefix),'') is null then raise exception 'Purchase prefix is required'; end if;
  if coalesce(p_tax_percentage,0)<0 then raise exception 'Tax percentage cannot be negative'; end if;
  if p_printer_paper_mm not in (58,80) then raise exception 'Printer paper must be 58 or 80 mm'; end if;

  select jsonb_build_object(
    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
    'receipt_footer',ss.receipt_footer
  ) into v_old
  from public.shops s left join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;

  update public.shops set name=trim(p_shop_name) where id=v_shop;
  insert into public.shop_settings(
    shop_id,currency_code,currency_symbol,invoice_prefix,purchase_prefix,tax_enabled,tax_percentage,
    receipt_footer,store_address,store_phone,tax_registration_number,printer_paper_mm
  ) values (
    v_shop,upper(trim(p_currency_code)),trim(p_currency_symbol),upper(trim(p_invoice_prefix)),upper(trim(p_purchase_prefix)),
    coalesce(p_tax_enabled,false),coalesce(p_tax_percentage,0),nullif(trim(p_receipt_footer),''),
    nullif(trim(p_store_address),''),nullif(trim(p_store_phone),''),nullif(trim(p_tax_registration_number),''),p_printer_paper_mm
  )
  on conflict(shop_id) do update set
    currency_code=excluded.currency_code,currency_symbol=excluded.currency_symbol,
    invoice_prefix=excluded.invoice_prefix,purchase_prefix=excluded.purchase_prefix,
    tax_enabled=excluded.tax_enabled,tax_percentage=excluded.tax_percentage,
    receipt_footer=excluded.receipt_footer,store_address=excluded.store_address,
    store_phone=excluded.store_phone,tax_registration_number=excluded.tax_registration_number,
    printer_paper_mm=excluded.printer_paper_mm;

  select jsonb_build_object(
    'shop_name',s.name,'store_address',ss.store_address,'store_phone',ss.store_phone,
    'tax_registration_number',ss.tax_registration_number,'currency_code',ss.currency_code,
    'currency_symbol',ss.currency_symbol,'invoice_prefix',ss.invoice_prefix,'purchase_prefix',ss.purchase_prefix,
    'tax_enabled',ss.tax_enabled,'tax_percentage',ss.tax_percentage,'printer_paper_mm',ss.printer_paper_mm,
    'receipt_footer',ss.receipt_footer
  ) into v_new
  from public.shops s join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;

  perform public.write_audit(v_shop,'UPDATE','SHOP_SETTINGS',v_shop::text,v_old,v_new,'{}'::jsonb);
end;
$$;

grant execute on function public.update_my_theme(text) to authenticated;
grant execute on function public.get_shop_configuration() to authenticated;
grant execute on function public.update_shop_configuration(text,text,text,text,text,text,text,text,boolean,numeric,integer,text) to authenticated;


notify pgrst,'reload schema';
