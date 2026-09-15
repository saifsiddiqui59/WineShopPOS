-- Already applied to PROD: Asia/Kolkata business-date consistency for financial analytics.
create or replace function public.business_analytics(p_from date, p_to date)
returns jsonb
language plpgsql
stable security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_gross_sales numeric:=0;
  v_returns numeric:=0;
  v_revenue numeric:=0;
  v_bills bigint:=0;
  v_discounts numeric:=0;
  v_discounted_bills bigint:=0;
  v_gross_cogs numeric:=0;
  v_returned_cogs numeric:=0;
  v_cogs numeric:=0;
  v_expenses numeric:=0;
  v_purchases numeric:=0;
  v_variance numeric:=0;
  v_low bigint:=0;
  v_inventory numeric:=0;
  v_trend jsonb:='[]'::jsonb;
  v_payments jsonb:='[]'::jsonb;
  v_top_products jsonb:='[]'::jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();
  if p_from is null or p_to is null or p_to<p_from then
    raise exception 'Invalid analytics date range';
  end if;

  select coalesce(sum(s.grand_total),0),count(*),coalesce(sum(s.discount),0),count(*) filter(where coalesce(s.discount,0)>0)
  into v_gross_sales,v_bills,v_discounts,v_discounted_bills
  from public.sales s
  where s.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

  select coalesce(sum(r.total_refund),0)
  into v_returns
  from public.sale_return_requests r
  where r.shop_id=v_shop and r.status='APPROVED'
    and (coalesce(r.reviewed_at,r.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to;

  v_revenue:=v_gross_sales-v_returns;

  select coalesce(sum(coalesce(si.fifo_line_cost,si.quantity*coalesce(si.cost_price_snapshot,0))),0)
  into v_gross_cogs
  from public.sale_items si
  join public.sales s on s.id=si.sale_id
  where si.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

  select coalesce(sum(ri.quantity*coalesce(si.fifo_unit_cost,si.cost_price_snapshot,0)),0)
  into v_returned_cogs
  from public.sale_return_items ri
  join public.sale_return_requests rr on rr.id=ri.return_request_id
  join public.sale_items si on si.id=ri.sale_item_id
  where rr.shop_id=v_shop and rr.status='APPROVED'
    and (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to;

  v_cogs:=v_gross_cogs-v_returned_cogs;

  select coalesce(sum(e.amount),0) into v_expenses
  from public.expenses e
  where e.shop_id=v_shop and e.status='ACTIVE' and e.expense_date between p_from and p_to;

  select coalesce(sum(p.total),0) into v_purchases
  from public.purchases p
  where p.shop_id=v_shop and p.status='RECEIVED' and p.invoice_date between p_from and p_to;

  select coalesce(sum(cs.cash_difference),0) into v_variance
  from public.cashier_shifts cs
  where cs.shop_id=v_shop and cs.status='CLOSED' and (cs.closed_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

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

  with days as (
    select generate_series(p_from,p_to,interval '1 day')::date d
  ), sale_day as (
    select (s.created_at at time zone 'Asia/Kolkata')::date d,sum(s.grand_total)::numeric amount
    from public.sales s
    where s.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    group by 1
  ), return_day as (
    select (coalesce(r.reviewed_at,r.created_at) at time zone 'Asia/Kolkata')::date d,sum(r.total_refund)::numeric amount
    from public.sale_return_requests r
    where r.shop_id=v_shop and r.status='APPROVED'
      and (coalesce(r.reviewed_at,r.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to
    group by 1
  )
  select coalesce(jsonb_agg(jsonb_build_object('date',d.d,'value',round(coalesce(s.amount,0)-coalesce(r.amount,0),2)) order by d.d),'[]'::jsonb)
  into v_trend
  from days d left join sale_day s on s.d=d.d left join return_day r on r.d=d.d;

  with pay as (
    select upper(coalesce(p.payment_method,'OTHER')) label,
           sum(case when coalesce(p.payment_type,'PAYMENT')='REFUND' then -p.amount else p.amount end)::numeric value
    from public.payments p
    where p.shop_id=v_shop and (p.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to
      and coalesce(p.payment_type,'PAYMENT') in ('PAYMENT','REFUND')
    group by 1
  )
  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',round(value,2)) order by label),'[]'::jsonb)
  into v_payments
  from pay where value<>0;

  with product_events as (
    select si.product_id,si.product_name_snapshot product_name,si.quantity::numeric quantity,
           case when coalesce(s.subtotal,0)>0 then si.line_total*s.grand_total/s.subtotal else si.line_total end::numeric value
    from public.sale_items si
    join public.sales s on s.id=si.sale_id
    where si.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    union all
    select ri.product_id,si.product_name_snapshot,-ri.quantity::numeric,-ri.line_refund::numeric
    from public.sale_return_items ri
    join public.sale_return_requests rr on rr.id=ri.return_request_id
    join public.sale_items si on si.id=ri.sale_item_id
    where rr.shop_id=v_shop and rr.status='APPROVED'
      and (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to
  ), ranked as (
    select product_id,max(product_name) product_name,sum(quantity) quantity,round(sum(value),2) value
    from product_events group by product_id
    order by value desc limit 7
  )
  select coalesce(jsonb_agg(jsonb_build_object('product_id',product_id,'label',product_name,'quantity',quantity,'value',value) order by value desc),'[]'::jsonb)
  into v_top_products
  from ranked;

  return jsonb_build_object(
    'from',p_from,'to',p_to,
    'gross_sales',round(v_gross_sales,2),
    'returns',round(v_returns,2),
    'revenue',round(v_revenue,2),
    'bills',v_bills,
    'discounts',round(v_discounts,2),
    'discounted_bills',v_discounted_bills,
    'cogs',round(v_cogs,2),
    'gross_profit',round(v_revenue-v_cogs,2),
    'expenses',round(v_expenses,2),
    'operating_profit',round(v_revenue-v_cogs-v_expenses,2),
    'purchases',round(v_purchases,2),
    'cash_variance',round(v_variance,2),
    'low_stock_count',v_low,
    'inventory_cost',round(v_inventory,2),
    'trend',v_trend,
    'payment_mix',v_payments,
    'top_products',v_top_products
  );
end;$$;

grant execute on function public.business_analytics(date,date) to authenticated;

create or replace function public.profit_by_product(
  p_from date default (((now() at time zone 'Asia/Kolkata')::date)-29),
  p_to date default ((now() at time zone 'Asia/Kolkata')::date)
)
returns table(product_id uuid,product_name text,quantity bigint,revenue numeric,cogs numeric,gross_profit numeric,margin_pct numeric)
language sql
stable security definer
set search_path=public
as $$
  with events as (
    select si.product_id,si.product_name_snapshot product_name,si.quantity::numeric quantity,
      case when coalesce(s.subtotal,0)>0 then si.line_total*s.grand_total/s.subtotal else si.line_total end::numeric revenue,
      coalesce(si.fifo_line_cost,si.quantity*coalesce(si.cost_price_snapshot,0))::numeric cogs
    from public.sale_items si
    join public.sales s on s.id=si.sale_id
    where si.shop_id=public.assert_shop_access()
      and public.current_user_role()='ADMIN'
      and s.status<>'VOID'
      and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    union all
    select ri.product_id,si.product_name_snapshot,-ri.quantity::numeric,-ri.line_refund::numeric,
      -(ri.quantity*coalesce(si.fifo_unit_cost,si.cost_price_snapshot,0))::numeric
    from public.sale_return_items ri
    join public.sale_return_requests rr on rr.id=ri.return_request_id
    join public.sale_items si on si.id=ri.sale_item_id
    where rr.shop_id=public.assert_shop_access()
      and public.current_user_role()='ADMIN'
      and rr.status='APPROVED'
      and (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to
  ), agg as (
    select e.product_id,max(e.product_name) product_name,sum(e.quantity) quantity,sum(e.revenue) revenue,sum(e.cogs) cogs
    from events e group by e.product_id
  )
  select a.product_id,a.product_name,round(a.quantity)::bigint,round(a.revenue,2),round(a.cogs,2),round(a.revenue-a.cogs,2),
    case when a.revenue<>0 then round((a.revenue-a.cogs)/a.revenue*100,2) else 0 end
  from agg a
  order by 6 desc;
$$;

grant execute on function public.profit_by_product(date,date) to authenticated;

create or replace function public.accountant_export_v2(p_from date,p_to date)
returns table(voucher_date date,voucher_type text,voucher_number text,ledger_name text,debit numeric,credit numeric,reference text,narration text,source_type text,source_id text)
language plpgsql
stable security definer
set search_path=public
as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();
  if p_to<p_from then raise exception 'Invalid export date range'; end if;

  return query
  select (s.created_at at time zone 'Asia/Kolkata')::date,'Sales'::text,s.invoice_number,
    case upper(p.payment_method) when 'CASH' then 'Cash' when 'UPI' then 'UPI Clearing' when 'CARD' then 'Card Clearing' else initcap(lower(p.payment_method)) end,
    p.amount::numeric,0::numeric,p.reference_number,'WineShopPOS sale receipt','SALE'::text,s.id::text
  from public.sales s join public.payments p on p.sale_id=s.id and coalesce(p.payment_type,'PAYMENT')='PAYMENT'
  where s.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

  return query
  select (s.created_at at time zone 'Asia/Kolkata')::date,'Sales'::text,s.invoice_number,
    case t.tender_type when 'STORE_CREDIT' then 'Customer Store Credit' else 'Gift Voucher Liability' end,
    t.amount::numeric,0::numeric,t.reference,'WineShopPOS non-cash tender','SALE'::text,s.id::text
  from public.sales s join public.sale_tender_adjustments t on t.sale_id=s.id
  where s.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

  return query
  select (s.created_at at time zone 'Asia/Kolkata')::date,'Sales'::text,s.invoice_number,'Sales Revenue'::text,0::numeric,s.grand_total::numeric,null::text,'WineShopPOS sale','SALE'::text,s.id::text
  from public.sales s
  where s.shop_id=v_shop and s.status<>'VOID' and (s.created_at at time zone 'Asia/Kolkata')::date between p_from and p_to;

  return query
  select (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date,'Sales Return'::text,
    'RET-'||substr(rr.id::text,1,8),'Sales Returns'::text,rr.total_refund::numeric,0::numeric,
    rr.refund_reference,'Approved customer return/refund','RETURN'::text,rr.id::text
  from public.sale_return_requests rr
  where rr.shop_id=v_shop and rr.status='APPROVED'
    and (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to;

  return query
  select (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date,'Sales Return'::text,
    'RET-'||substr(rr.id::text,1,8),
    case upper(rr.refund_method) when 'CASH' then 'Cash' when 'UPI' then 'UPI Clearing' when 'CARD' then 'Card Clearing' else 'Bank / Other' end,
    0::numeric,rr.total_refund::numeric,rr.refund_reference,'Customer refund payment','RETURN'::text,rr.id::text
  from public.sale_return_requests rr
  where rr.shop_id=v_shop and rr.status='APPROVED'
    and (coalesce(rr.reviewed_at,rr.created_at) at time zone 'Asia/Kolkata')::date between p_from and p_to;

  return query
  select p.invoice_date,'Purchase'::text,coalesce(p.invoice_number,p.purchase_number),'Purchases'::text,p.total::numeric,0::numeric,p.invoice_number,
    'Purchase from '||coalesce(s.supplier_name,'Supplier'),'PURCHASE'::text,p.id::text
  from public.purchases p left join public.suppliers s on s.id=p.supplier_id
  where p.shop_id=v_shop and p.status='RECEIVED' and p.invoice_date between p_from and p_to;

  return query
  select p.invoice_date,'Purchase'::text,coalesce(p.invoice_number,p.purchase_number),coalesce(s.supplier_name,'Supplier')::text,0::numeric,p.total::numeric,p.invoice_number,
    'Supplier payable','PURCHASE'::text,p.id::text
  from public.purchases p left join public.suppliers s on s.id=p.supplier_id
  where p.shop_id=v_shop and p.status='RECEIVED' and p.invoice_date between p_from and p_to;

  return query
  select e.expense_date,'Journal'::text,'EXP-'||substr(e.id::text,1,8),coalesce(ec.name,'Business Expense')::text,e.amount::numeric,0::numeric,null::text,
    coalesce(e.description,'Expense'),'EXPENSE'::text,e.id::text
  from public.expenses e left join public.expense_categories ec on ec.id=e.category_id
  where e.shop_id=v_shop and e.status='ACTIVE' and e.expense_date between p_from and p_to;

  return query
  select e.expense_date,'Journal'::text,'EXP-'||substr(e.id::text,1,8),
    case upper(e.payment_method) when 'CASH' then 'Cash' when 'UPI' then 'UPI Clearing' when 'CARD' then 'Card Clearing' else 'Bank / Other' end,
    0::numeric,e.amount::numeric,null::text,coalesce(e.description,'Expense payment'),'EXPENSE'::text,e.id::text
  from public.expenses e
  where e.shop_id=v_shop and e.status='ACTIVE' and e.expense_date between p_from and p_to;

  return query
  select sp.payment_date,'Payment'::text,'SP-'||substr(sp.id::text,1,8),coalesce(s.supplier_name,'Supplier')::text,sp.amount::numeric,0::numeric,sp.reference_number,
    'Supplier payment','SUPPLIER_PAYMENT'::text,sp.id::text
  from public.supplier_payments sp left join public.suppliers s on s.id=sp.supplier_id
  where sp.shop_id=v_shop and sp.payment_date between p_from and p_to;

  return query
  select sp.payment_date,'Payment'::text,'SP-'||substr(sp.id::text,1,8),
    case upper(sp.payment_method) when 'CASH' then 'Cash' when 'UPI' then 'UPI Clearing' when 'CARD' then 'Card Clearing' when 'BANK_TRANSFER' then 'Bank' when 'CHEQUE' then 'Bank' else 'Bank / Other' end,
    0::numeric,sp.amount::numeric,sp.reference_number,'Supplier payment','SUPPLIER_PAYMENT'::text,sp.id::text
  from public.supplier_payments sp left join public.suppliers s on s.id=sp.supplier_id
  where sp.shop_id=v_shop and sp.payment_date between p_from and p_to;
end;$$;

grant execute on function public.accountant_export_v2(date,date) to authenticated;
