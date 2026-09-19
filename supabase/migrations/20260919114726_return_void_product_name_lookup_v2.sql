create or replace function public.return_void_invoice_lookup_v1(
  p_lookup text,
  p_limit integer default 50
)
returns table(
  sale_id uuid,
  invoice_number text,
  business_date date,
  created_at timestamptz,
  sale_status text,
  grand_total numeric,
  match_type text,
  matched_products text,
  matched_sold_qty bigint,
  approved_returned_qty bigint,
  pending_return_qty bigint,
  available_return_qty bigint,
  has_return_activity boolean,
  void_eligible boolean
)
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_role text;
  v_lookup text;
begin
  v_shop := public.assert_shop_access();
  v_role := public.current_user_role();
  v_lookup := trim(coalesce(p_lookup,''));

  if v_role not in ('ADMIN','MANAGER','CASHIER') then
    raise exception 'Return/Void access denied';
  end if;

  if length(v_lookup) < 3 then
    raise exception 'Scan a barcode or enter at least 3 invoice/product characters';
  end if;

  return query
  with candidate_items as (
    select
      s.id as sale_id,
      s.invoice_number,
      public.wsp_business_date(s.created_at,s.offline_created_at) as business_date,
      s.created_at,
      s.status as sale_status,
      s.grand_total,
      si.id as sale_item_id,
      si.product_id,
      si.product_name_snapshot,
      si.barcode_snapshot,
      si.quantity as sold_qty,
      trim(coalesce(si.barcode_snapshot,'')) = v_lookup as barcode_match,
      s.invoice_number ilike '%' || v_lookup || '%' as invoice_match,
      si.product_name_snapshot ilike '%' || v_lookup || '%' as product_name_match
    from public.sales s
    join public.sale_items si
      on si.sale_id=s.id
     and si.shop_id=v_shop
    where s.shop_id=v_shop
      and (v_role <> 'CASHIER' or s.cashier_id=auth.uid())
      and (
        trim(coalesce(si.barcode_snapshot,'')) = v_lookup
        or s.invoice_number ilike '%' || v_lookup || '%'
        or si.product_name_snapshot ilike '%' || v_lookup || '%'
      )
  ),
  line_returns as (
    select
      ci.sale_item_id,
      coalesce(sum(sri.quantity) filter (where rr.status='APPROVED'),0)::bigint as approved_qty,
      coalesce(sum(sri.quantity) filter (where rr.status='PENDING'),0)::bigint as pending_qty
    from candidate_items ci
    left join public.sale_return_items sri
      on sri.sale_item_id=ci.sale_item_id
     and sri.shop_id=v_shop
    left join public.sale_return_requests rr
      on rr.id=sri.return_request_id
     and rr.shop_id=v_shop
    group by ci.sale_item_id
  ),
  grouped as (
    select
      ci.sale_id,
      ci.invoice_number,
      ci.business_date,
      ci.created_at,
      ci.sale_status,
      ci.grand_total,
      case
        when bool_or(ci.barcode_match) then 'BARCODE'
        when bool_or(ci.invoice_match) then 'INVOICE'
        else 'PRODUCT_NAME'
      end::text as match_type,
      string_agg(distinct ci.product_name_snapshot, ', ' order by ci.product_name_snapshot)::text as matched_products,
      sum(ci.sold_qty)::bigint as matched_sold_qty,
      sum(coalesce(lr.approved_qty,0))::bigint as approved_returned_qty,
      sum(coalesce(lr.pending_qty,0))::bigint as pending_return_qty
    from candidate_items ci
    left join line_returns lr on lr.sale_item_id=ci.sale_item_id
    group by
      ci.sale_id,ci.invoice_number,ci.business_date,ci.created_at,
      ci.sale_status,ci.grand_total
  )
  select
    g.sale_id,
    g.invoice_number,
    g.business_date,
    g.created_at,
    g.sale_status,
    g.grand_total,
    g.match_type,
    g.matched_products,
    g.matched_sold_qty,
    g.approved_returned_qty,
    g.pending_return_qty,
    greatest(
      g.matched_sold_qty-g.approved_returned_qty-g.pending_return_qty,
      0
    )::bigint as available_return_qty,
    exists(
      select 1
      from public.sale_return_requests rr
      where rr.sale_id=g.sale_id
        and rr.shop_id=v_shop
        and rr.status in ('PENDING','APPROVED')
    ) as has_return_activity,
    (
      g.sale_status='COMPLETED'
      and not exists(
        select 1
        from public.sale_return_requests rr
        where rr.sale_id=g.sale_id
          and rr.shop_id=v_shop
          and rr.status in ('PENDING','APPROVED')
      )
    ) as void_eligible
  from grouped g
  order by
    case g.match_type when 'BARCODE' then 1 when 'INVOICE' then 2 else 3 end,
    g.created_at desc,
    g.sale_id
  limit greatest(1,least(coalesce(p_limit,50),100));
end;
$function$;

revoke all on function public.return_void_invoice_lookup_v1(text,integer) from public, anon;
grant execute on function public.return_void_invoice_lookup_v1(text,integer) to authenticated;
