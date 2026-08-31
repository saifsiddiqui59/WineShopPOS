-- WineShopPOS V2 — Product Master real-catalogue onboarding
-- Current-state rule: current source + current migrations > old migration text.
-- This migration is additive. Previously applied migration files are untouched.

begin;

-- Normal Add Product still requires barcode at RPC level.
-- NULL is allowed at table level only for reviewed Bulk Product Import / OCR onboarding.
alter table public.products
  alter column barcode drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_barcode_nonblank_when_present'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_barcode_nonblank_when_present
      check (barcode is null or btrim(barcode) <> '');
  end if;
end $$;

-- Reuse the existing per-shop counter table.
alter table public.shop_counters
  add column if not exists product_sku_counter bigint not null default 0;

create or replace function public.next_product_sku(p_shop_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counter bigint;
  v_existing bigint;
begin
  if p_shop_id is null then
    raise exception 'Shop is required';
  end if;

  insert into public.shop_counters(shop_id)
  values (p_shop_id)
  on conflict (shop_id) do nothing;

  select coalesce(
    max(substring(p.sku from '^WSP-([0-9]+)$')::bigint),
    0
  )
  into v_existing
  from public.products p
  where p.shop_id = p_shop_id
    and p.sku ~ '^WSP-[0-9]+$';

  -- UPDATE locks the shop counter row; concurrent allocations serialize here.
  update public.shop_counters
  set product_sku_counter = greatest(product_sku_counter, v_existing) + 1
  where shop_id = p_shop_id
  returning product_sku_counter into v_counter;

  if v_counter is null then
    raise exception 'Unable to allocate SKU';
  end if;

  if v_counter > 999999 then
    raise exception 'WSP SKU sequence exhausted for this shop';
  end if;

  return 'WSP-' || lpad(v_counter::text, 6, '0');
end;
$$;

revoke all on function public.next_product_sku(uuid)
from public, anon, authenticated;

create or replace function public.products_assign_automatic_sku()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sku is null
     or btrim(new.sku) = ''
     or upper(btrim(new.sku)) = 'AUTO'
  then
    new.sku := public.next_product_sku(new.shop_id);
  end if;

  return new;
end;
$$;

revoke all on function public.products_assign_automatic_sku()
from public, anon, authenticated;

drop trigger if exists trg_products_assign_automatic_sku on public.products;
create trigger trg_products_assign_automatic_sku
before insert on public.products
for each row execute function public.products_assign_automatic_sku();

-- SKU is a permanent internal identity. Product edits must preserve it.
create or replace function public.products_keep_sku_immutable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.sku is distinct from old.sku then
    raise exception 'SKU is system generated and cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_keep_sku_immutable on public.products;
create trigger trg_products_keep_sku_immutable
before update of sku on public.products
for each row execute function public.products_keep_sku_immutable();

-- Keep the established signature during rollout so an older browser bundle does
-- not fail while the new frontend deploys. p_sku/p_opening_stock are compatibility
-- parameters only; current Product Master ignores both.
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
  v_barcode text;
begin
  v_shop_id := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  v_barcode := nullif(btrim(p_barcode), '');
  if v_barcode is null then
    raise exception 'Barcode is required for normal Add Product';
  end if;

  if nullif(btrim(p_product_name), '') is null then
    raise exception 'Product name is required';
  end if;
  if nullif(btrim(p_brand), '') is null then
    raise exception 'Brand is required';
  end if;
  if p_category_id is null then
    raise exception 'Category is required';
  end if;
  if p_size_ml is null or p_size_ml <= 0 then
    raise exception 'Valid size is required';
  end if;

  insert into public.products(
    shop_id, barcode, sku, product_name, brand, category_id, subcategory,
    size_ml, alcohol_percentage, purchase_price, mrp, selling_price,
    minimum_stock, units_per_case, created_by
  )
  values (
    v_shop_id, v_barcode, 'AUTO', btrim(p_product_name), btrim(p_brand),
    p_category_id, nullif(btrim(p_subcategory), ''), p_size_ml,
    p_alcohol_percentage, coalesce(p_purchase_price,0), coalesce(p_mrp,0),
    coalesce(p_selling_price,0), greatest(coalesce(p_minimum_stock,0),0),
    greatest(coalesce(p_units_per_case,1),1), auth.uid()
  )
  returning id into v_product_id;

  -- Product Master creation is not receiving. Inventory begins at zero.
  insert into public.inventory(shop_id, product_id, quantity)
  values (v_shop_id, v_product_id, 0)
  on conflict (shop_id, product_id) do nothing;

  -- Existing trg_audit_products continues to audit the Product INSERT.
  -- No OPENING_STOCK movement is created.
  return v_product_id;
end;
$$;

revoke all on function public.create_new_product(
  text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer,integer
) from public, anon;

grant execute on function public.create_new_product(
  text,text,text,text,uuid,text,integer,numeric,numeric,numeric,numeric,integer,integer,integer
) to authenticated;

-- Reviewed manual/OCR bulk onboarding. Barcode may be NULL here only.
create or replace function public.bulk_create_products(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_item jsonb;
  v_result jsonb := '[]'::jsonb;
  v_product_id uuid;
  v_product_name text;
  v_barcode text;
  v_sku text;
  v_index integer := 0;
begin
  v_shop_id := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
  then
    raise exception 'At least one product row is required';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_index := v_index + 1;

    begin
      v_product_name := nullif(btrim(v_item->>'product_name'), '');
      v_barcode := nullif(btrim(v_item->>'barcode'), '');

      if v_product_name is null then
        raise exception 'Product name is required';
      end if;
      if coalesce(nullif(v_item->>'size_ml','')::integer, 0) <= 0 then
        raise exception 'Valid size in ml is required';
      end if;
      if coalesce(nullif(v_item->>'units_per_case','')::integer, 0) <= 0 then
        raise exception 'Units per case must be positive';
      end if;

      insert into public.products(
        shop_id, barcode, sku, product_name, brand, category_id, subcategory,
        size_ml, alcohol_percentage, purchase_price, mrp, selling_price,
        minimum_stock, units_per_case, created_by
      )
      values (
        v_shop_id,
        v_barcode,
        'AUTO',
        v_product_name,
        nullif(btrim(v_item->>'brand'), ''),
        nullif(v_item->>'category_id','')::uuid,
        nullif(btrim(v_item->>'subcategory'), ''),
        nullif(v_item->>'size_ml','')::integer,
        nullif(v_item->>'alcohol_percentage','')::numeric,
        coalesce(nullif(v_item->>'purchase_price','')::numeric,0),
        coalesce(nullif(v_item->>'mrp','')::numeric,0),
        coalesce(nullif(v_item->>'selling_price','')::numeric,0),
        greatest(coalesce(nullif(v_item->>'minimum_stock','')::integer,5),0),
        greatest(coalesce(nullif(v_item->>'units_per_case','')::integer,1),1),
        auth.uid()
      )
      returning id, sku into v_product_id, v_sku;

      insert into public.inventory(shop_id, product_id, quantity)
      values (v_shop_id, v_product_id, 0)
      on conflict (shop_id, product_id) do nothing;

      v_result := v_result || jsonb_build_array(
        jsonb_build_object(
          'row', v_index,
          'status', 'SUCCESS',
          'product_id', v_product_id,
          'sku', v_sku,
          'barcode', v_barcode,
          'product_name', v_product_name
        )
      );
    exception
      when others then
        v_result := v_result || jsonb_build_array(
          jsonb_build_object(
            'row', v_index,
            'status', 'ERROR',
            'product_name', coalesce(v_product_name, v_item->>'product_name'),
            'message', sqlerrm
          )
        );
    end;
  end loop;

  return v_result;
end;
$$;

revoke all on function public.bulk_create_products(jsonb)
from public, anon;

grant execute on function public.bulk_create_products(jsonb)
to authenticated;

-- Retire the known legacy dummy barcode family currently present in
-- src/data/products.js. Preserve rows/history instead of cascade-deleting them.
update public.products
set active = false,
    updated_at = now()
where barcode ~ '^890000001[0-9]{4}$';

commit;
