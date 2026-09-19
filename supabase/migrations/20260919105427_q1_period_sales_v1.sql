create or replace function public.sales_period_page_v1(
  p_from date,
  p_to date,
  p_offset integer default 0,
  p_limit integer default 500
)
returns table(
  id uuid,
  invoice_number text,
  business_date date,
  created_at timestamptz,
  item_count bigint,
  payment_method text,
  subtotal numeric,
  discount numeric,
  grand_total numeric,
  status text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_role text;
begin
  v_shop := public.assert_shop_access();
  v_role := public.current_user_role();

  if p_from is null or p_to is null or p_to < p_from then
    raise exception 'Invalid sales date range';
  end if;

  if v_role not in ('ADMIN','MANAGER','CASHIER') then
    raise exception 'Sales access denied';
  end if;

  return query
  select
    s.id,
    s.invoice_number,
    public.wsp_business_date(s.created_at, s.offline_created_at) as business_date,
    s.created_at,
    coalesce((
      select sum(si.quantity)::bigint
      from public.sale_items si
      where si.sale_id = s.id
        and si.shop_id = v_shop
    ),0) as item_count,
    coalesce((
      select string_agg(t.label, ' + ' order by t.label)
      from (
        select distinct upper(coalesce(p.payment_method,'OTHER'))::text as label
        from public.payments p
        where p.sale_id = s.id
          and p.shop_id = v_shop
          and coalesce(p.payment_type,'PAYMENT') = 'PAYMENT'
        union
        select distinct upper(coalesce(a.tender_type,'OTHER'))::text as label
        from public.sale_tender_adjustments a
        where a.sale_id = s.id
          and a.shop_id = v_shop
      ) t
    ), '')::text as payment_method,
    s.subtotal,
    s.discount,
    s.grand_total,
    s.status
  from public.sales s
  where s.shop_id = v_shop
    and (v_role <> 'CASHIER' or s.cashier_id = auth.uid())
    and public.wsp_business_date(s.created_at, s.offline_created_at) between p_from and p_to
  order by
    public.wsp_business_date(s.created_at, s.offline_created_at) desc,
    s.created_at desc,
    s.id
  offset greatest(p_offset,0)
  limit greatest(1,least(p_limit,1000));
end;
$function$;

revoke all on function public.sales_period_page_v1(date,date,integer,integer) from public, anon;
grant execute on function public.sales_period_page_v1(date,date,integer,integer) to authenticated;
