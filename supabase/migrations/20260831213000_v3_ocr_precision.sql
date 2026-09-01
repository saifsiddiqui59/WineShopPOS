-- V3-04: preserve calculated unit cost to six decimals.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='purchase_price') then
    alter table public.products alter column purchase_price type numeric(14,6) using round(purchase_price::numeric,6);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='purchase_items' and column_name='purchase_price') then
    alter table public.purchase_items alter column purchase_price type numeric(14,6) using round(purchase_price::numeric,6);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='purchase_order_items' and column_name='purchase_price') then
    alter table public.purchase_order_items alter column purchase_price type numeric(14,6) using round(purchase_price::numeric,6);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='purchase_return_items' and column_name='purchase_price') then
    alter table public.purchase_return_items alter column purchase_price type numeric(14,6) using round(purchase_price::numeric,6);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='sale_items' and column_name='cost_price_snapshot') then
    alter table public.sale_items alter column cost_price_snapshot type numeric(14,6) using round(cost_price_snapshot::numeric,6);
  end if;
end $$;
