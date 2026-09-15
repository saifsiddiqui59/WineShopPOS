create or replace function public.dashboard_summary(p_date date default current_date)
returns jsonb
language plpgsql
stable security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_sales numeric:=0;
  v_returns numeric:=0;
  v_bills bigint:=0;
  v_low bigint:=0;
  v_inventory numeric:=0;
  v_top jsonb:='[]'::jsonb;
begin
  v_shop:=public.assert_shop_access();

  select coalesce(sum(s.grand_total),0),count(*)
  into v_sales,v_bills
  from public.sales s
  where s.shop_id=v_shop and s.status<>'VOID' and s.created_at::date=p_date;

  select coalesce(sum(r.total_refund),0)
  into v_returns
  from public.sale_return_requests r
  where r.shop_id=v_shop and r.status='APPROVED'
    and coalesce(r.reviewed_at,r.created_at)::date=p_date;

  select count(*) into v_low
  from public.products p
  left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
  where p.shop_id=v_shop and p.active=true and coalesce(i.quantity,0)<=p.minimum_stock;

  with lot as (
    select l.product_id,
           sum(l.remaining_quantity)::numeric tracked_qty,
           sum(l.remaining_quantity*l.landed_unit_cost)::numeric tracked_cost
    from public.inventory_receipt_lots l
    where l.shop_id=v_shop and l.remaining_quantity>0
    group by l.product_id
  )
  select coalesce(sum(
    coalesce(l.tracked_cost,0)
    + greatest(coalesce(i.quantity,0)-coalesce(l.tracked_qty,0),0)*coalesce(p.purchase_price,0)
  ),0)
  into v_inventory
  from public.products p
  join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
  left join lot l on l.product_id=p.id
  where p.shop_id=v_shop and p.active=true;

  with events as (
    select si.product_id,si.product_name_snapshot product_name,si.quantity::numeric qty
    from public.sale_items si
    join public.sales s on s.id=si.sale_id
    where si.shop_id=v_shop and s.status<>'VOID' and s.created_at::date<=p_date
    union all
    select ri.product_id,si.product_name_snapshot,-ri.quantity::numeric
    from public.sale_return_items ri
    join public.sale_return_requests rr on rr.id=ri.return_request_id
    join public.sale_items si on si.id=ri.sale_item_id
    where rr.shop_id=v_shop and rr.status='APPROVED'
      and coalesce(rr.reviewed_at,rr.created_at)::date<=p_date
  ), agg as (
    select product_id,max(product_name) product_name,sum(qty) qty
    from events group by product_id
    order by qty desc limit 5
  )
  select coalesce(jsonb_agg(jsonb_build_object('product_id',product_id,'label',product_name,'quantity',qty) order by qty desc),'[]'::jsonb)
  into v_top from agg;

  return jsonb_build_object(
    'date',p_date,
    'sales',round(v_sales-v_returns,2),
    'gross_sales',round(v_sales,2),
    'returns',round(v_returns,2),
    'bills',v_bills,
    'low_stock_count',v_low,
    'inventory_cost',round(v_inventory,2),
    'top_products',v_top
  );
end;$$;

grant execute on function public.dashboard_summary(date) to authenticated;
