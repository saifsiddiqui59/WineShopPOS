-- V3 UAT regression fix:
-- stock_count_scan() RETURNS TABLE includes output variable "product_id".
-- Unqualified references such as "product_id = v_product" are therefore
-- ambiguous in PL/pgSQL (SQLSTATE 42702).
--
-- Qualify every table column reference. No privilege model changes.

create or replace function public.stock_count_scan(
  p_stock_count_id uuid,
  p_barcode text
)
returns table(
  product_id uuid,
  product_name text,
  expected_quantity integer,
  counted_quantity integer
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_product uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if not exists(
    select 1
    from public.stock_counts sc
    where sc.id = p_stock_count_id
      and sc.shop_id = v_shop
      and sc.status = 'OPEN'
  ) then
    raise exception 'Stock count is not open';
  end if;

  select p.id
  into v_product
  from public.products p
  where p.shop_id = v_shop
    and p.barcode = trim(p_barcode)
    and p.active = true;

  if v_product is null then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  update public.stock_count_items sci
  set counted_quantity = coalesce(sci.counted_quantity, 0) + 1,
      first_scanned_at = coalesce(sci.first_scanned_at, now()),
      last_scanned_at = now()
  where sci.stock_count_id = p_stock_count_id
    and sci.shop_id = v_shop
    and sci.product_id = v_product;

  if not found then
    raise exception 'PRODUCT_NOT_IN_COUNT_SNAPSHOT';
  end if;

  return query
  select
    p.id,
    p.product_name,
    sci.expected_quantity,
    sci.counted_quantity
  from public.stock_count_items sci
  join public.products p
    on p.id = sci.product_id
  where sci.stock_count_id = p_stock_count_id
    and sci.shop_id = v_shop
    and sci.product_id = v_product;
end;
$function$;
