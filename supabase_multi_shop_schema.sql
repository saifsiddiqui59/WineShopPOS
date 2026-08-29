
-- WineShopPOS Supabase Production Schema
-- Multi-shop / multi-tenant, RLS, subscription kill switch, inventory-safe RPCs.
-- User hierarchy: PLATFORM OWNER -> SHOP ADMIN -> MANAGER/CASHIER.
-- Run once in a NEW Supabase project using SQL Editor.
-- Frontend must use only the Supabase publishable/anon key. NEVER service_role.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. COMMON TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. PLATFORM / TENANT TABLES
-- ============================================================
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  access_enabled boolean not null default true, -- SINGLE KILL SWITCH
  subscription_status text not null default 'TRIAL'
    check (subscription_status in ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED')),
  plan_code text not null default 'BASIC',
  max_users integer not null default 10 check (max_users > 0),
  subscription_end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete restrict,
  full_name text not null,
  email text,
  role text not null default 'CASHIER'
    check (role in ('ADMIN','MANAGER','CASHIER')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_settings (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  currency_code text not null default 'INR',
  currency_symbol text not null default '₹',
  invoice_prefix text not null default 'INV',
  purchase_prefix text not null default 'PUR',
  tax_enabled boolean not null default false,
  tax_percentage numeric(8,4) not null default 0 check (tax_percentage >= 0),
  receipt_footer text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. MASTER DATA
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, name)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  supplier_name text not null,
  contact_person text,
  mobile text,
  email text,
  gst_number text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  barcode text not null,
  sku text not null,
  product_name text not null,
  brand text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory text,
  size_ml integer not null check (size_ml > 0),
  alcohol_percentage numeric(6,2) check (alcohol_percentage is null or alcohol_percentage >= 0),
  purchase_price numeric(12,2) not null default 0 check (purchase_price >= 0),
  mrp numeric(12,2) not null default 0 check (mrp >= 0),
  selling_price numeric(12,2) not null default 0 check (selling_price >= 0),
  minimum_stock integer not null default 5 check (minimum_stock >= 0),
  units_per_case integer not null default 1 check (units_per_case > 0),
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, barcode),
  unique (shop_id, sku)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (shop_id, product_id),
  check (reserved_quantity <= quantity)
);

-- ============================================================
-- 4. PURCHASES
-- ============================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_number text not null,
  supplier_id uuid references public.suppliers(id) on delete restrict,
  supplier_name_snapshot text,
  invoice_number text not null,
  invoice_date date not null default current_date,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  status text not null default 'RECEIVED'
    check (status in ('DRAFT','RECEIVED','CANCELLED')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (shop_id, purchase_number),
  unique (shop_id, invoice_number)
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  purchase_unit text not null default 'BOTTLE'
    check (purchase_unit in ('BOTTLE','CASE')),
  case_count integer not null default 0 check (case_count >= 0),
  units_per_case integer not null default 1 check (units_per_case > 0),
  loose_bottles integer not null default 0 check (loose_bottles >= 0),
  purchase_price numeric(12,2) not null check (purchase_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. SALES / PAYMENTS
-- ============================================================
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  invoice_number text not null,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  grand_total numeric(14,2) not null default 0 check (grand_total >= 0),
  payment_status text not null default 'PAID'
    check (payment_status in ('PENDING','PAID','PARTIAL','REFUNDED')),
  cashier_id uuid references auth.users(id) on delete set null,
  status text not null default 'COMPLETED'
    check (status in ('COMPLETED','VOID','RETURNED','PARTIAL_RETURN')),
  notes text,
  created_at timestamptz not null default now(),
  unique (shop_id, invoice_number)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  barcode_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  payment_method text not null
    check (payment_method in ('CASH','UPI','CARD')),
  amount numeric(14,2) not null check (amount >= 0),
  reference_number text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. STOCK AUDIT
-- ============================================================
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null
    check (movement_type in (
      'OPENING_STOCK','PURCHASE','SALE','CUSTOMER_RETURN',
      'SUPPLIER_RETURN','DAMAGE','BROKEN','MISSING',
      'MANUAL_ADJUSTMENT','STOCK_CORRECTION'
    )),
  quantity_change integer not null,
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  reference_type text,
  reference_id uuid,
  reason text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  adjustment_type text not null
    check (adjustment_type in (
      'DAMAGE','BROKEN','MISSING','STOCK_CORRECTION',
      'CUSTOMER_RETURN','SUPPLIER_RETURN','OTHER'
    )),
  quantity_change integer not null,
  reason text not null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. COUNTERS
-- ============================================================
create table if not exists public.shop_counters (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  sale_counter bigint not null default 0,
  purchase_counter bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. INDEXES
-- ============================================================
create index if not exists idx_profiles_shop on public.profiles(shop_id);
create index if not exists idx_categories_shop on public.categories(shop_id);
create index if not exists idx_suppliers_shop on public.suppliers(shop_id);
create index if not exists idx_products_shop on public.products(shop_id);
create index if not exists idx_products_barcode on public.products(shop_id, barcode);
create index if not exists idx_products_sku on public.products(shop_id, sku);
create index if not exists idx_products_name on public.products(shop_id, product_name);
create index if not exists idx_products_brand on public.products(shop_id, brand);
create index if not exists idx_inventory_shop_product on public.inventory(shop_id, product_id);
create index if not exists idx_purchases_shop_date on public.purchases(shop_id, invoice_date desc);
create index if not exists idx_purchase_items_purchase on public.purchase_items(purchase_id);
create index if not exists idx_sales_shop_created on public.sales(shop_id, created_at desc);
create index if not exists idx_sale_items_sale on public.sale_items(sale_id);
create index if not exists idx_payments_sale on public.payments(sale_id);
create index if not exists idx_stock_movements_shop_product on public.stock_movements(shop_id, product_id, created_at desc);
create index if not exists idx_stock_adjustments_shop_product on public.stock_adjustments(shop_id, product_id, created_at desc);

-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================
drop trigger if exists trg_shops_updated_at on public.shops;
create trigger trg_shops_updated_at before update on public.shops
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_shop_settings_updated_at on public.shop_settings;
create trigger trg_shop_settings_updated_at before update on public.shop_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_suppliers_updated_at on public.suppliers;
create trigger trg_suppliers_updated_at before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_inventory_updated_at on public.inventory;
create trigger trg_inventory_updated_at before update on public.inventory
for each row execute function public.set_updated_at();

drop trigger if exists trg_shop_counters_updated_at on public.shop_counters;
create trigger trg_shop_counters_updated_at before update on public.shop_counters
for each row execute function public.set_updated_at();

-- ============================================================
-- 10. SECURITY HELPERS
-- ============================================================
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  );
$$;

create or replace function public.current_shop_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.shop_id
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
  limit 1;
$$;

create or replace function public.shop_access_allowed(p_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shops s
    where s.id = p_shop_id
      and s.active = true
      and s.access_enabled = true
      and s.subscription_status in ('TRIAL','ACTIVE')
      and (s.subscription_end_date is null or s.subscription_end_date >= current_date)
  );
$$;

create or replace function public.assert_shop_access()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
begin
  v_shop_id := public.current_shop_id();

  if v_shop_id is null then
    raise exception 'No active shop profile found';
  end if;

  if not public.shop_access_allowed(v_shop_id) then
    raise exception 'SHOP_ACCESS_DISABLED';
  end if;

  return v_shop_id;
end;
$$;

create or replace function public.assert_manager_or_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.current_user_role() not in ('ADMIN','MANAGER') then
    raise exception 'Manager or Admin role required';
  end if;
end;
$$;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'ADMIN' then
    raise exception 'Admin role required';
  end if;
end;
$$;

-- Simple frontend check after login.
create or replace function public.my_shop_access()
returns table (
  shop_id uuid,
  shop_name text,
  access_enabled boolean,
  subscription_status text,
  subscription_end_date date,
  allowed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name,
    s.access_enabled,
    s.subscription_status,
    s.subscription_end_date,
    public.shop_access_allowed(s.id)
  from public.shops s
  where s.id = public.current_shop_id();
$$;


-- Shop Admin UI helper.
create or replace function public.my_profile()
returns table (
  user_id uuid,
  shop_id uuid,
  full_name text,
  email text,
  role text,
  active boolean,
  shop_name text,
  shop_slug text,
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
    p.role,
    p.active,
    s.name,
    s.slug,
    s.max_users
  from public.profiles p
  join public.shops s on s.id = p.shop_id
  where p.id = auth.uid();
$$;

grant execute on function public.my_profile() to authenticated;

-- ============================================================
-- 11. DOCUMENT NUMBER HELPERS
-- ============================================================
create or replace function public.next_sale_number(p_shop_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counter bigint;
  v_prefix text;
begin
  insert into public.shop_counters(shop_id)
  values (p_shop_id)
  on conflict (shop_id) do nothing;

  update public.shop_counters
  set sale_counter = sale_counter + 1
  where shop_id = p_shop_id
  returning sale_counter into v_counter;

  select coalesce(invoice_prefix,'INV')
  into v_prefix
  from public.shop_settings
  where shop_id = p_shop_id;

  v_prefix := coalesce(v_prefix,'INV');

  return v_prefix || '-' || to_char(current_date,'YYYY') || '-' || lpad(v_counter::text, 6, '0');
end;
$$;

create or replace function public.next_purchase_number(p_shop_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counter bigint;
  v_prefix text;
begin
  insert into public.shop_counters(shop_id)
  values (p_shop_id)
  on conflict (shop_id) do nothing;

  update public.shop_counters
  set purchase_counter = purchase_counter + 1
  where shop_id = p_shop_id
  returning purchase_counter into v_counter;

  select coalesce(purchase_prefix,'PUR')
  into v_prefix
  from public.shop_settings
  where shop_id = p_shop_id;

  v_prefix := coalesce(v_prefix,'PUR');

  return v_prefix || '-' || to_char(current_date,'YYYY') || '-' || lpad(v_counter::text, 6, '0');
end;
$$;

-- ============================================================
-- 12. RPC: CREATE NEW PRODUCT + OPENING STOCK
-- ============================================================
create or replace function public.create_new_product(
  p_barcode text,
  p_sku text,
  p_product_name text,
  p_brand text,
  p_category_id uuid,
  p_subcategory text,
  p_size_ml integer,
  p_alcohol_percentage numeric,
  p_purchase_price numeric,
  p_mrp numeric,
  p_selling_price numeric,
  p_minimum_stock integer,
  p_units_per_case integer,
  p_opening_stock integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_product_id uuid;
begin
  v_shop_id := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_opening_stock < 0 then
    raise exception 'Opening stock cannot be negative';
  end if;

  insert into public.products(
    shop_id, barcode, sku, product_name, brand, category_id, subcategory,
    size_ml, alcohol_percentage, purchase_price, mrp, selling_price,
    minimum_stock, units_per_case, created_by
  )
  values (
    v_shop_id, trim(p_barcode), upper(trim(p_sku)), trim(p_product_name),
    trim(p_brand), p_category_id, p_subcategory, p_size_ml,
    p_alcohol_percentage, p_purchase_price, p_mrp, p_selling_price,
    p_minimum_stock, p_units_per_case, auth.uid()
  )
  returning id into v_product_id;

  insert into public.inventory(shop_id, product_id, quantity)
  values (v_shop_id, v_product_id, p_opening_stock);

  if p_opening_stock > 0 then
    insert into public.stock_movements(
      shop_id, product_id, movement_type, quantity_change,
      quantity_before, quantity_after, reference_type, reference_id,
      reason, created_by
    )
    values (
      v_shop_id, v_product_id, 'OPENING_STOCK', p_opening_stock,
      0, p_opening_stock, 'PRODUCT_CREATION', v_product_id,
      'Opening stock', auth.uid()
    );
  end if;

  return v_product_id;
end;
$$;

-- ============================================================
-- 13. RPC: RECEIVE PURCHASE
-- p_items example:
-- [{"product_id":"uuid","case_count":2,"units_per_case":12,
--   "loose_bottles":4,"quantity":28,"purchase_price":120}]
-- ============================================================
create or replace function public.receive_purchase(
  p_supplier_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_items jsonb,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_purchase_id uuid;
  v_purchase_number text;
  v_supplier_name text;
  v_subtotal numeric(14,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_purchase_price numeric(12,2);
  v_before integer;
  v_after integer;
  v_case_count integer;
  v_units_per_case integer;
  v_loose_bottles integer;
begin
  v_shop_id := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Purchase items required';
  end if;

  select supplier_name into v_supplier_name
  from public.suppliers
  where id = p_supplier_id
    and shop_id = v_shop_id
    and active = true;

  if v_supplier_name is null then
    raise exception 'Invalid supplier';
  end if;

  if exists (
    select 1 from public.purchases
    where shop_id = v_shop_id
      and lower(invoice_number) = lower(trim(p_invoice_number))
  ) then
    raise exception 'Supplier invoice already exists';
  end if;

  v_purchase_number := public.next_purchase_number(v_shop_id);

  insert into public.purchases(
    shop_id, purchase_number, supplier_id, supplier_name_snapshot,
    invoice_number, invoice_date, status, notes, created_by
  )
  values (
    v_shop_id, v_purchase_number, p_supplier_id, v_supplier_name,
    trim(p_invoice_number), coalesce(p_invoice_date,current_date),
    'RECEIVED', p_notes, auth.uid()
  )
  returning id into v_purchase_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_purchase_price := (v_item->>'purchase_price')::numeric;
    v_case_count := coalesce((v_item->>'case_count')::integer,0);
    v_units_per_case := coalesce((v_item->>'units_per_case')::integer,1);
    v_loose_bottles := coalesce((v_item->>'loose_bottles')::integer,0);

    if v_quantity <= 0 or v_purchase_price < 0 then
      raise exception 'Invalid purchase item';
    end if;

    if not exists (
      select 1 from public.products
      where id = v_product_id
        and shop_id = v_shop_id
        and active = true
    ) then
      raise exception 'Invalid/inactive product';
    end if;

    select quantity into v_before
    from public.inventory
    where shop_id = v_shop_id
      and product_id = v_product_id
    for update;

    if v_before is null then
      insert into public.inventory(shop_id, product_id, quantity)
      values (v_shop_id, v_product_id, 0)
      returning quantity into v_before;
    end if;

    v_after := v_before + v_quantity;

    update public.inventory
    set quantity = v_after
    where shop_id = v_shop_id
      and product_id = v_product_id;

    insert into public.purchase_items(
      shop_id, purchase_id, product_id, quantity, purchase_unit,
      case_count, units_per_case, loose_bottles, purchase_price, line_total
    )
    values (
      v_shop_id, v_purchase_id, v_product_id, v_quantity,
      case when v_case_count > 0 then 'CASE' else 'BOTTLE' end,
      v_case_count, v_units_per_case, v_loose_bottles,
      v_purchase_price, v_quantity * v_purchase_price
    );

    insert into public.stock_movements(
      shop_id, product_id, movement_type, quantity_change,
      quantity_before, quantity_after, reference_type, reference_id,
      reason, created_by
    )
    values (
      v_shop_id, v_product_id, 'PURCHASE', v_quantity,
      v_before, v_after, 'PURCHASE', v_purchase_id,
      'Supplier purchase', auth.uid()
    );

    v_subtotal := v_subtotal + (v_quantity * v_purchase_price);
  end loop;

  update public.purchases
  set subtotal = v_subtotal, total = v_subtotal
  where id = v_purchase_id;

  return v_purchase_id;
end;
$$;

-- ============================================================
-- 14. RPC: ADJUST STOCK
-- ============================================================
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_adjustment_type text,
  p_quantity_change integer,
  p_reason text,
  p_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_before integer;
  v_after integer;
  v_adjustment_id uuid;
begin
  v_shop_id := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_quantity_change = 0 then
    raise exception 'Quantity change cannot be zero';
  end if;

  select quantity into v_before
  from public.inventory
  where shop_id = v_shop_id
    and product_id = p_product_id
  for update;

  if v_before is null then
    raise exception 'Inventory record not found';
  end if;

  v_after := v_before + p_quantity_change;

  if v_after < 0 then
    raise exception 'Insufficient stock';
  end if;

  update public.inventory
  set quantity = v_after
  where shop_id = v_shop_id
    and product_id = p_product_id;

  insert into public.stock_adjustments(
    shop_id, product_id, adjustment_type, quantity_change,
    reason, notes, created_by
  )
  values (
    v_shop_id, p_product_id, p_adjustment_type, p_quantity_change,
    p_reason, p_notes, auth.uid()
  )
  returning id into v_adjustment_id;

  insert into public.stock_movements(
    shop_id, product_id, movement_type, quantity_change,
    quantity_before, quantity_after, reference_type, reference_id,
    reason, notes, created_by
  )
  values (
    v_shop_id, p_product_id,
    case
      when p_adjustment_type in ('DAMAGE','BROKEN','MISSING','STOCK_CORRECTION')
        then p_adjustment_type
      else 'MANUAL_ADJUSTMENT'
    end,
    p_quantity_change, v_before, v_after,
    'STOCK_ADJUSTMENT', v_adjustment_id,
    p_reason, p_notes, auth.uid()
  );

  return v_after;
end;
$$;

-- ============================================================
-- 15. RPC: COMPLETE SALE
-- p_items example:
-- [{"product_id":"uuid","quantity":2}]
-- Server reads current selling_price from products.
-- ============================================================
create or replace function public.complete_sale(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_sale_id uuid;
  v_invoice_number text;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_barcode text;
  v_quantity integer;
  v_unit_price numeric(12,2);
  v_before integer;
  v_after integer;
  v_subtotal numeric(14,2) := 0;
  v_grand_total numeric(14,2);
begin
  v_shop_id := public.assert_shop_access();

  if p_payment_method not in ('CASH','UPI','CARD') then
    raise exception 'Invalid payment method';
  end if;

  if p_discount < 0 then
    raise exception 'Discount cannot be negative';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Sale items required';
  end if;

  v_invoice_number := public.next_sale_number(v_shop_id);

  insert into public.sales(
    shop_id, invoice_number, cashier_id, status, payment_status
  )
  values (
    v_shop_id, v_invoice_number, auth.uid(), 'COMPLETED', 'PAID'
  )
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity <= 0 then
      raise exception 'Invalid sale quantity';
    end if;

    select product_name, barcode, selling_price
    into v_product_name, v_barcode, v_unit_price
    from public.products
    where id = v_product_id
      and shop_id = v_shop_id
      and active = true;

    if v_product_name is null then
      raise exception 'Invalid/inactive product';
    end if;

    select quantity into v_before
    from public.inventory
    where shop_id = v_shop_id
      and product_id = v_product_id
    for update;

    if v_before is null or v_before < v_quantity then
      raise exception 'Insufficient stock for %', v_product_name;
    end if;

    v_after := v_before - v_quantity;

    update public.inventory
    set quantity = v_after
    where shop_id = v_shop_id
      and product_id = v_product_id;

    insert into public.sale_items(
      shop_id, sale_id, product_id, product_name_snapshot,
      barcode_snapshot, quantity, unit_price, discount, line_total
    )
    values (
      v_shop_id, v_sale_id, v_product_id, v_product_name,
      v_barcode, v_quantity, v_unit_price, 0, v_quantity * v_unit_price
    );

    insert into public.stock_movements(
      shop_id, product_id, movement_type, quantity_change,
      quantity_before, quantity_after, reference_type, reference_id,
      reason, created_by
    )
    values (
      v_shop_id, v_product_id, 'SALE', -v_quantity,
      v_before, v_after, 'SALE', v_sale_id,
      'POS sale', auth.uid()
    );

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  end loop;

  if p_discount > v_subtotal then
    raise exception 'Discount cannot exceed subtotal';
  end if;

  v_grand_total := v_subtotal - p_discount;

  update public.sales
  set subtotal = v_subtotal,
      discount = p_discount,
      grand_total = v_grand_total
  where id = v_sale_id;

  insert into public.payments(
    shop_id, sale_id, payment_method, amount, reference_number
  )
  values (
    v_shop_id, v_sale_id, p_payment_method, v_grand_total, p_payment_reference
  );

  return v_sale_id;
end;
$$;

-- ============================================================
-- 16. RLS
-- ============================================================
alter table public.shops enable row level security;
alter table public.platform_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.shop_settings enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.shop_counters enable row level security;

-- shops: members can read their own shop even when disabled, so UI can show "subscription disabled".
drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops
for select to authenticated
using (
  id = public.current_shop_id()
  or public.is_platform_admin()
);

-- Only platform admin can directly change shop commercial status / kill switch.
drop policy if exists shops_platform_admin_all on public.shops;
create policy shops_platform_admin_all on public.shops
for all to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists platform_admins_self_select on public.platform_admins;
create policy platform_admins_self_select on public.platform_admins
for select to authenticated
using (user_id = auth.uid());

-- profiles: user reads own profile; shop admins can read shop users while access is enabled.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.is_platform_admin()
  or (
    shop_id = public.current_shop_id()
    and public.shop_access_allowed(shop_id)
    and public.current_user_role() = 'ADMIN'
  )
);

-- IMPORTANT:
-- Authenticated browser clients cannot INSERT/UPDATE/DELETE profiles directly.
-- Shop user creation/status changes go through the secure Edge Function
-- manage-shop-users, which uses service_role only on the server.
drop policy if exists profiles_admin_modify on public.profiles;

-- Read/write master data by tenant.
drop policy if exists shop_settings_select on public.shop_settings;
create policy shop_settings_select on public.shop_settings
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists shop_settings_admin_modify on public.shop_settings;
create policy shop_settings_admin_modify on public.shop_settings
for all to authenticated
using (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() = 'ADMIN'
)
with check (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() = 'ADMIN'
);

drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists categories_manage on public.categories;
create policy categories_manage on public.categories
for all to authenticated
using (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
)
with check (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists suppliers_select on public.suppliers;
create policy suppliers_select on public.suppliers
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists suppliers_manage on public.suppliers;
create policy suppliers_manage on public.suppliers
for all to authenticated
using (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
)
with check (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists products_select on public.products;
create policy products_select on public.products
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists products_manage on public.products;
create policy products_manage on public.products
for all to authenticated
using (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
)
with check (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

-- Inventory/audit/transactions: SELECT only. Changes happen through RPCs.
drop policy if exists inventory_select on public.inventory;
create policy inventory_select on public.inventory
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists purchases_select on public.purchases;
create policy purchases_select on public.purchases
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists purchase_items_select on public.purchase_items;
create policy purchase_items_select on public.purchase_items
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists sale_items_select on public.sale_items;
create policy sale_items_select on public.sale_items
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists stock_movements_select on public.stock_movements;
create policy stock_movements_select on public.stock_movements
for select to authenticated
using (shop_id = public.current_shop_id() and public.shop_access_allowed(shop_id));

drop policy if exists stock_adjustments_select on public.stock_adjustments;
create policy stock_adjustments_select on public.stock_adjustments
for select to authenticated
using (
  shop_id = public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

-- shop_counters intentionally has no tenant policy. RPCs manage it.

-- ============================================================
-- 17. GRANTS
-- ============================================================
grant usage on schema public to authenticated;

grant select on public.shops to authenticated;
grant select on public.profiles to authenticated;
grant select on public.shop_settings to authenticated;
grant select on public.categories to authenticated;
grant select on public.suppliers to authenticated;
grant select on public.products to authenticated;
grant select on public.inventory to authenticated;
grant select on public.purchases to authenticated;
grant select on public.purchase_items to authenticated;
grant select on public.sales to authenticated;
grant select on public.sale_items to authenticated;
grant select on public.payments to authenticated;
grant select on public.stock_movements to authenticated;
grant select on public.stock_adjustments to authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.suppliers to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.shop_settings to authenticated;
-- No browser write grant on profiles. User management is server-side only.

grant execute on function public.my_shop_access() to authenticated;
grant execute on function public.create_new_product(text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer,integer) to authenticated;
grant execute on function public.receive_purchase(uuid,text,date,jsonb,text) to authenticated;
grant execute on function public.adjust_stock(uuid,text,integer,text,text) to authenticated;
grant execute on function public.complete_sale(jsonb,text,numeric,text) to authenticated;

-- ============================================================
-- 18. KILL SWITCH EXAMPLES (RUN MANUALLY AS PLATFORM OWNER)
-- ============================================================
-- STOP one shop immediately:
-- update public.shops
-- set access_enabled = false,
--     subscription_status = 'SUSPENDED'
-- where slug = 'my-shop-slug';

-- RESTORE:
-- update public.shops
-- set access_enabled = true,
--     subscription_status = 'ACTIVE',
--     subscription_end_date = current_date + 30
-- where slug = 'my-shop-slug';

-- ============================================================
-- 19. FIRST-TIME PLATFORM SETUP EXAMPLE
-- ============================================================
-- 1) Create your own Supabase Auth user first.
-- 2) Find its UUID in Authentication > Users.
-- 3) Make yourself platform admin:
-- insert into public.platform_admins(user_id)
-- values ('YOUR-AUTH-USER-UUID');

-- 4) Create first shop:
-- insert into public.shops(name, slug, access_enabled, subscription_status, subscription_end_date)
-- values ('Demo Wine Shop','demo-wine-shop',true,'ACTIVE',current_date + 30)
-- returning id;

-- 5) Create settings/counter for that shop:
-- insert into public.shop_settings(shop_id) values ('SHOP-UUID');
-- insert into public.shop_counters(shop_id) values ('SHOP-UUID');

-- 6) Link shop owner user:
-- insert into public.profiles(id, shop_id, full_name, email, role)
-- values (
--   'OWNER-AUTH-UUID',
--   'SHOP-UUID',
--   'Shop Owner',
--   'owner@example.com',
--   'ADMIN'
-- );
--
-- PLATFORM RULE:
-- Only you/platform operations create the first ADMIN for a shop.
-- That ADMIN creates MANAGER/CASHIER accounts through the app.
-- Shop Admins are NOT allowed to create another ADMIN.

-- ============================================================
-- END
-- ============================================================
