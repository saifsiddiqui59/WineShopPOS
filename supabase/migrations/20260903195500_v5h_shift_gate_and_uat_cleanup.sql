begin;

-- ============================================================================
-- A. EVERY COMPLETED SALE MUST HAVE A VALID SHIFT
-- ============================================================================

create or replace function public.enforce_completed_sale_shift()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_shift public.cashier_shifts%rowtype;
begin
  if new.status <> 'COMPLETED' then
    return new;
  end if;

  if new.shift_id is null then
    raise exception 'SHIFT_REQUIRED';
  end if;

  select *
  into v_shift
  from public.cashier_shifts
  where id = new.shift_id
    and shop_id = new.shop_id
    and cashier_id = new.cashier_id;

  if not found then
    raise exception 'SHIFT_REQUIRED';
  end if;

  if new.offline_created_at is null then
    if v_shift.status <> 'OPEN' then
      raise exception 'SHIFT_REQUIRED';
    end if;
  else
    if v_shift.status not in ('OPEN','CLOSE_REQUESTED','CLOSED')
       or v_shift.opened_at > new.offline_created_at
       or coalesce(v_shift.closed_at, now() + interval '100 years') < new.offline_created_at
    then
      raise exception 'SHIFT_REQUIRED';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sales_require_valid_shift on public.sales;

create trigger trg_sales_require_valid_shift
before insert or update of status, shift_id, offline_created_at
on public.sales
for each row
execute function public.enforce_completed_sale_shift();

-- ============================================================================
-- B. AUTHORIZED V5-F UAT FIXTURE PURGE
-- Exact test fixture only; abort if it has any non-test operational usage.
-- ============================================================================

do $$
declare
  v_product uuid;
  v_shop uuid;
  v_purchase uuid;
  v_product_count integer;
  v_purchase_count integer;
  v_ingestion_count integer;
begin
  select count(*), min(id), min(shop_id)
  into v_product_count, v_product, v_shop
  from public.products
  where regexp_replace(lower(coalesce(product_name,'')), '[^a-z0-9]+','','g')
        = 'heinekenorginallagerbeercan330ml'
     or barcode = '111111111111111111111111';

  if v_product_count <> 1 then
    raise exception
      'UAT_PURGE_ABORTED: expected exactly one HEINEKEN UAT product, found %',
      v_product_count;
  end if;

  select count(*), min(id)
  into v_purchase_count, v_purchase
  from public.purchases
  where shop_id = v_shop
    and invoice_number = 'UAT-V5F-001';

  if v_purchase_count <> 1 then
    raise exception
      'UAT_PURGE_ABORTED: expected exactly one UAT-V5F-001 purchase, found %',
      v_purchase_count;
  end if;

  select count(*)
  into v_ingestion_count
  from public.invoice_ingestions
  where shop_id = v_shop
    and extracted_invoice_number in ('UAT-V5F-001','UAT-V5F-002');

  if v_ingestion_count <> 2 then
    raise exception
      'UAT_PURGE_ABORTED: expected exactly two V5-F invoice ingestions, found %',
      v_ingestion_count;
  end if;

  -- Safety: this product must never have been sold/returned/transferred.
  if exists(select 1 from public.sale_items where product_id=v_product)
     or exists(select 1 from public.sale_return_items where product_id=v_product)
     or exists(select 1 from public.purchase_return_items where product_id=v_product)
     or exists(select 1 from public.purchase_order_items where product_id=v_product)
     or exists(select 1 from public.stock_transfer_items where source_product_id=v_product)
     or exists(select 1 from public.stock_transfer_items where destination_product_id=v_product)
  then
    raise exception
      'UAT_PURGE_ABORTED: test product has sale/return/order/transfer usage';
  end if;

  -- Every purchase line for this product must belong to the exact UAT-A purchase.
  if exists(
    select 1
    from public.purchase_items
    where product_id=v_product
      and purchase_id<>v_purchase
  ) then
    raise exception
      'UAT_PURGE_ABORTED: test product has a non-UAT purchase';
  end if;

  if (
    select count(*)
    from public.purchase_items
    where purchase_id=v_purchase
  ) <> 1
  or not exists(
    select 1
    from public.purchase_items
    where purchase_id=v_purchase
      and product_id=v_product
      and quantity=24
  ) then
    raise exception
      'UAT_PURGE_ABORTED: UAT-A purchase shape no longer matches the authorized fixture';
  end if;

  if exists(
    select 1
    from public.purchase_returns
    where purchase_id=v_purchase
  ) then
    raise exception
      'UAT_PURGE_ABORTED: UAT purchase has a purchase return';
  end if;

  -- Remove old audit traces tied specifically to these test entities/labels.
  delete from public.audit_logs a
  where a.shop_id=v_shop
    and (
      a.entity_id=v_product::text
      or a.entity_id=v_purchase::text
      or a.entity_id in (
        select id::text
        from public.invoice_ingestions
        where shop_id=v_shop
          and extracted_invoice_number in ('UAT-V5F-001','UAT-V5F-002')
      )
      or coalesce(a.metadata::text,'') ilike '%UAT-V5F-001%'
      or coalesce(a.metadata::text,'') ilike '%UAT-V5F-002%'
      or coalesce(a.old_data::text,'') ilike '%HEINEKEN ORGINAL LAGER BEER CAN 330 ML%'
      or coalesce(a.new_data::text,'') ilike '%HEINEKEN ORGINAL LAGER BEER CAN 330 ML%'
    );

  -- Invoice review/evidence metadata rows.
  delete from public.invoice_ingestions
  where shop_id=v_shop
    and extracted_invoice_number in ('UAT-V5F-001','UAT-V5F-002');

  -- Purchase-side child rows.
  delete from public.purchase_verification_resolutions
  where purchase_id=v_purchase;

  delete from public.purchase_item_corrections
  where purchase_id=v_purchase
     or product_id=v_product;

  delete from public.inventory_receipt_lots
  where purchase_id=v_purchase
     or product_id=v_product;

  -- Product operational traces.
  delete from public.inventory_fifo_allocations where product_id=v_product;
  delete from public.stock_adjustments where product_id=v_product;
  delete from public.stock_count_items where product_id=v_product;
  delete from public.stock_movements where product_id=v_product;
  delete from public.product_aliases where product_id=v_product;

  -- Remove the received UAT purchase (purchase_items cascade).
  delete from public.purchases where id=v_purchase;

  -- Remove live test stock and Product Master row.
  delete from public.inventory where product_id=v_product;
  delete from public.products where id=v_product;

  -- Leave one generic maintenance audit, without retaining the test SKU name.
  insert into public.audit_logs(
    shop_id,
    organization_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at
  )
  select
    s.id,
    s.organization_id,
    null,
    'AUTHORIZED_UAT_FIXTURE_PURGED',
    'MAINTENANCE',
    null,
    jsonb_build_object(
      'scope','V5-F invoice/product UAT fixture',
      'purchase_removed',true,
      'invoice_ingestions_removed',2,
      'product_removed',true
    ),
    now()
  from public.shops s
  where s.id=v_shop;
end
$$;

commit;
