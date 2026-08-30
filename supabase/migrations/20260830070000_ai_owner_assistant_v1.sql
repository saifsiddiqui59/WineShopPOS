-- WineShopPOS AI Owner Assistant V1
-- Multi-tenant, ADMIN-only, read-only AI analytics layer.
-- Business engine calculates; AI explains.
--
-- SECURITY:
--   * reuses user_shop_memberships; does NOT create duplicate tenant membership concepts
--   * explicit AI shop scope is authorized server-side
--   * AI tools are read-only security-definer RPCs that re-check auth.uid() + membership
--   * no unrestricted SQL function is exposed
--   * no business transaction table is written by AI functions
--   * ai_activity_logs store operational metadata only, never prompt/response text

create extension if not exists pgcrypto;

-- Ensure legacy/current users remain represented in the scalable membership model.
insert into public.user_shop_memberships(user_id,shop_id,role,active)
select p.id,p.shop_id,p.role,p.active
from public.profiles p
where p.shop_id is not null
on conflict (user_id,shop_id) do update
set role=excluded.role, active=excluded.active, updated_at=now();

-- Query-path indexes for explicit tenant/shop analytics.
create index if not exists idx_user_shop_memberships_ai_access
  on public.user_shop_memberships(user_id,active,role,shop_id);

create index if not exists idx_sales_ai_shop_created
  on public.sales(shop_id,created_at desc);

create index if not exists idx_sale_items_ai_shop_product
  on public.sale_items(shop_id,product_id);

create index if not exists idx_payments_ai_shop_created
  on public.payments(shop_id,created_at desc,payment_type);

create index if not exists idx_stock_movements_ai_shop_product_created
  on public.stock_movements(shop_id,product_id,created_at desc);

create index if not exists idx_purchases_ai_shop_invoice_date
  on public.purchases(shop_id,invoice_date desc);

create index if not exists idx_purchase_items_ai_shop_product
  on public.purchase_items(shop_id,product_id);

create index if not exists idx_expenses_ai_shop_date
  on public.expenses(shop_id,expense_date desc);

-- Minimal operational audit. No question or answer body is stored by default.
create table if not exists public.ai_activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null unique,
  question_category text not null default 'GENERAL',
  tools_called text[] not null default '{}'::text[],
  status text not null check (status in ('STARTED','SUCCEEDED','FAILED','DENIED','RATE_LIMITED')),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_activity_user_time
  on public.ai_activity_logs(user_id,created_at desc);

create index if not exists idx_ai_activity_org_time
  on public.ai_activity_logs(organization_id,created_at desc);

drop trigger if exists trg_ai_activity_logs_updated_at on public.ai_activity_logs;
create trigger trg_ai_activity_logs_updated_at
before update on public.ai_activity_logs
for each row execute function public.set_updated_at();

alter table public.ai_activity_logs enable row level security;

drop policy if exists ai_activity_logs_self_select on public.ai_activity_logs;
create policy ai_activity_logs_self_select
on public.ai_activity_logs
for select
to authenticated
using (user_id=auth.uid());

-- Returns only ADMIN memberships belonging to the authenticated user.
-- ALL scope never crosses the anchor shop's organization.
create or replace function public.ai_scope_shops(
  p_anchor_shop_id uuid,
  p_scope text default 'SHOP'
)
returns table(
  shop_id uuid,
  shop_name text,
  organization_id uuid
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_scope text := upper(coalesce(p_scope,'SHOP'));
  v_org uuid;
begin
  if auth.uid() is null then
    raise exception 'AI_AUTH_REQUIRED';
  end if;

  if p_anchor_shop_id is null then
    raise exception 'AI_SHOP_REQUIRED';
  end if;

  if v_scope not in ('SHOP','ALL') then
    raise exception 'AI_SCOPE_INVALID';
  end if;

  select s.organization_id
  into v_org
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  join public.organizations o on o.id=s.organization_id
  where m.user_id=auth.uid()
    and m.shop_id=p_anchor_shop_id
    and m.active=true
    and m.role='ADMIN'
    and s.active=true
    and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date)
    and o.active=true;

  if v_org is null then
    raise exception 'AI_OWNER_ACCESS_DENIED';
  end if;

  if v_scope='SHOP' then
    return query
    select s.id,s.name,s.organization_id
    from public.shops s
    where s.id=p_anchor_shop_id
      and s.organization_id=v_org;
    return;
  end if;

  return query
  select s.id,s.name,s.organization_id
  from public.user_shop_memberships m
  join public.shops s on s.id=m.shop_id
  join public.organizations o on o.id=s.organization_id
  where m.user_id=auth.uid()
    and m.active=true
    and m.role='ADMIN'
    and s.organization_id=v_org
    and s.active=true
    and s.access_enabled=true
    and s.subscription_status in ('TRIAL','ACTIVE')
    and (s.subscription_end_date is null or s.subscription_end_date>=current_date)
    and o.active=true
  order by s.name;
end;
$$;

create or replace function public.ai_resolve_context(
  p_anchor_shop_id uuid,
  p_scope text default 'SHOP'
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_scope text := upper(coalesce(p_scope,'SHOP'));
  v_result jsonb;
begin
  with scoped as (
    select * from public.ai_scope_shops(p_anchor_shop_id,v_scope)
  )
  select jsonb_build_object(
    'user_id',auth.uid(),
    'organization_id',(select organization_id from scoped limit 1),
    'anchor_shop_id',p_anchor_shop_id,
    'scope',v_scope,
    'role','ADMIN',
    'shop_count',count(*),
    'can_all_shops',count(*)>1,
    'shops',coalesce(
      jsonb_agg(jsonb_build_object('shop_id',shop_id,'shop_name',shop_name) order by shop_name),
      '[]'::jsonb
    )
  )
  into v_result
  from scoped;

  if coalesce((v_result->>'shop_count')::integer,0)=0 then
    raise exception 'AI_OWNER_ACCESS_DENIED';
  end if;

  return v_result;
end;
$$;

-- Fixed server-side DB rate limit. Browser/model cannot raise this limit.
create or replace function public.ai_rate_limit_check(
  p_anchor_shop_id uuid,
  p_scope text default 'SHOP'
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer;
begin
  perform 1 from public.ai_scope_shops(p_anchor_shop_id,p_scope) limit 1;

  select count(*)::integer
  into v_count
  from public.ai_activity_logs
  where user_id=auth.uid()
    and created_at>=now()-interval '5 minutes';

  return jsonb_build_object(
    'allowed',v_count<20,
    'used',v_count,
    'limit',20,
    'window_seconds',300,
    'remaining',greatest(0,20-v_count)
  );
end;
$$;

create or replace function public.ai_log_activity(
  p_request_id uuid,
  p_anchor_shop_id uuid,
  p_scope text,
  p_question_category text,
  p_tools_called text[],
  p_status text,
  p_latency_ms integer default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_context jsonb;
  v_org uuid;
  v_log_shop uuid;
  v_status text := upper(coalesce(p_status,'FAILED'));
begin
  if v_status not in ('STARTED','SUCCEEDED','FAILED','DENIED','RATE_LIMITED') then
    raise exception 'AI_LOG_STATUS_INVALID';
  end if;

  v_context:=public.ai_resolve_context(p_anchor_shop_id,p_scope);
  v_org:=(v_context->>'organization_id')::uuid;
  v_log_shop:=case when upper(coalesce(p_scope,'SHOP'))='SHOP' then p_anchor_shop_id else null end;

  insert into public.ai_activity_logs(
    organization_id,shop_id,user_id,request_id,question_category,tools_called,status,latency_ms
  )
  values(
    v_org,v_log_shop,auth.uid(),p_request_id,
    left(coalesce(nullif(trim(p_question_category),''),'GENERAL'),80),
    coalesce(p_tools_called,'{}'::text[]),
    v_status,p_latency_ms
  )
  on conflict(request_id) do update set
    question_category=excluded.question_category,
    tools_called=excluded.tools_called,
    status=excluded.status,
    latency_ms=excluded.latency_ms,
    updated_at=now()
  where public.ai_activity_logs.user_id=auth.uid();
end;
$$;

create or replace function public.ai_period_bounds(p_period text)
returns table(from_date date,to_date date)
language plpgsql
stable
set search_path=public
as $$
declare
  v_period text := upper(coalesce(p_period,'LAST_7_DAYS'));
begin
  if v_period='TODAY' then
    return query select current_date,current_date;
  elsif v_period='YESTERDAY' then
    return query select current_date-1,current_date-1;
  elsif v_period='LAST_7_DAYS' then
    return query select current_date-6,current_date;
  elsif v_period='LAST_30_DAYS' then
    return query select current_date-29,current_date;
  elsif v_period='THIS_WEEK' then
    return query select date_trunc('week',current_date)::date,current_date;
  elsif v_period='LAST_WEEK' then
    return query select (date_trunc('week',current_date)::date-7),(date_trunc('week',current_date)::date-1);
  else
    raise exception 'AI_PERIOD_INVALID';
  end if;
end;
$$;

-- ------------------------------------------------------------------
-- READ-ONLY BUSINESS TOOLS
-- The model never controls p_anchor_shop_id or p_scope.
-- Azure Function injects those values from authenticated context.
-- ------------------------------------------------------------------

create or replace function public.ai_get_sales_summary(
  p_anchor_shop_id uuid,
  p_scope text,
  p_period text default 'LAST_7_DAYS'
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_from date;
  v_to date;
  v_result jsonb;
begin
  select from_date,to_date into v_from,v_to from public.ai_period_bounds(p_period);

  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  sales_base as (
    select s.*
    from public.sales s
    join scope sc on sc.shop_id=s.shop_id
    where s.status<>'VOID'
      and s.created_at::date between v_from and v_to
  ),
  totals as (
    select coalesce(sum(grand_total),0)::numeric revenue,count(*)::bigint bills
    from sales_base
  ),
  refund_totals as (
    select coalesce(sum(r.total_refund),0)::numeric refunds
    from public.sale_return_requests r
    join scope sc on sc.shop_id=r.shop_id
    where r.status='APPROVED'
      and r.created_at::date between v_from and v_to
  ),
  payment_mix as (
    select p.payment_method,round(sum(p.amount),2) amount
    from public.payments p
    join scope sc on sc.shop_id=p.shop_id
    where p.payment_type='PAYMENT'
      and p.created_at::date between v_from and v_to
    group by p.payment_method
  ),
  top_products as (
    select si.product_id,max(si.product_name_snapshot) product_name,
           sum(si.quantity)::bigint quantity,round(sum(si.line_total),2) revenue
    from public.sale_items si
    join sales_base s on s.id=si.sale_id
    group by si.product_id
    order by quantity desc,revenue desc
    limit 10
  ),
  daily as (
    select created_at::date sale_date,round(sum(grand_total),2) revenue,count(*)::bigint bills
    from sales_base
    group by created_at::date
    order by sale_date
  ),
  by_shop as (
    select sc.shop_id,sc.shop_name,
           coalesce(round(sum(s.grand_total),2),0) revenue,
           count(s.id)::bigint bills
    from scope sc
    left join sales_base s on s.shop_id=sc.shop_id
    group by sc.shop_id,sc.shop_name
    order by revenue desc,sc.shop_name
  )
  select jsonb_build_object(
    'period',upper(p_period),
    'from',v_from,
    'to',v_to,
    'revenue',(select revenue from totals),
    'bills',(select bills from totals),
    'approved_refunds',(select refunds from refund_totals),
    'payment_mix',coalesce((select jsonb_agg(to_jsonb(x) order by x.amount desc) from payment_mix x),'[]'::jsonb),
    'top_products',coalesce((select jsonb_agg(to_jsonb(x)) from top_products x),'[]'::jsonb),
    'daily_sales',coalesce((select jsonb_agg(to_jsonb(x) order by x.sale_date) from daily x),'[]'::jsonb),
    'shops',coalesce((select jsonb_agg(to_jsonb(x)) from by_shop x),'[]'::jsonb),
    'source_path','/pos/sales'
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.ai_get_profit_summary(
  p_anchor_shop_id uuid,
  p_scope text,
  p_period text default 'LAST_7_DAYS'
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_from date;
  v_to date;
  v_result jsonb;
begin
  select from_date,to_date into v_from,v_to from public.ai_period_bounds(p_period);

  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  sales_base as (
    select s.*
    from public.sales s
    join scope sc on sc.shop_id=s.shop_id
    where s.status<>'VOID'
      and s.created_at::date between v_from and v_to
  ),
  revenue as (
    select coalesce(sum(grand_total),0)::numeric value from sales_base
  ),
  cogs as (
    select coalesce(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),0)::numeric value
    from public.sale_items si
    join sales_base s on s.id=si.sale_id
  ),
  expense as (
    select coalesce(sum(e.amount),0)::numeric value
    from public.expenses e
    join scope sc on sc.shop_id=e.shop_id
    where e.status='ACTIVE' and e.expense_date between v_from and v_to
  ),
  by_shop as (
    select sc.shop_id,sc.shop_name,
      coalesce((select round(sum(s.grand_total),2) from sales_base s where s.shop_id=sc.shop_id),0) revenue,
      coalesce((select round(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),2)
                from public.sale_items si
                join sales_base s2 on s2.id=si.sale_id
                where si.shop_id=sc.shop_id),0) cogs,
      coalesce((select round(sum(e.amount),2)
                from public.expenses e
                where e.shop_id=sc.shop_id and e.status='ACTIVE' and e.expense_date between v_from and v_to),0) expenses
    from scope sc
  )
  select jsonb_build_object(
    'period',upper(p_period),
    'from',v_from,
    'to',v_to,
    'revenue',round(r.value,2),
    'cogs',round(c.value,2),
    'gross_profit',round(r.value-c.value,2),
    'expenses',round(e.value,2),
    'operating_profit',round(r.value-c.value-e.value,2),
    'gross_margin_pct',case when r.value>0 then round((r.value-c.value)/r.value*100,2) else 0 end,
    'shops',coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'shop_id',x.shop_id,
          'shop_name',x.shop_name,
          'revenue',x.revenue,
          'cogs',x.cogs,
          'gross_profit',round(x.revenue-x.cogs,2),
          'expenses',x.expenses,
          'operating_profit',round(x.revenue-x.cogs-x.expenses,2)
        )
        order by (x.revenue-x.cogs-x.expenses) desc
      )
      from by_shop x
    ),'[]'::jsonb),
    'source_path','/owner/profit'
  )
  into v_result
  from revenue r,cogs c,expense e;

  return v_result;
end;
$$;

create or replace function public.ai_get_inventory_health(
  p_anchor_shop_id uuid,
  p_scope text,
  p_history_days integer default 30,
  p_dead_days integer default 45
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_history integer := greatest(1,least(coalesce(p_history_days,30),180));
  v_dead integer := greatest(1,least(coalesce(p_dead_days,45),365));
  v_result jsonb;
begin
  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  sold as (
    select si.shop_id,si.product_id,
      coalesce(sum(si.quantity) filter(where s.created_at>=now()-(v_history||' days')::interval),0)::integer units,
      max(s.created_at) last_sale
    from public.sale_items si
    join public.sales s on s.id=si.sale_id
    join scope sc on sc.shop_id=si.shop_id
    where s.status not in ('VOID','RETURNED')
    group by si.shop_id,si.product_id
  ),
  calc as (
    select sc.shop_name,p.shop_id,p.id product_id,p.product_name,p.minimum_stock,p.units_per_case,
      p.purchase_price,coalesce(i.quantity,0)::integer current_stock,
      coalesce(so.units,0)::integer units_sold,
      round(coalesce(so.units,0)::numeric/v_history,2) avg_daily,
      so.last_sale
    from scope sc
    join public.products p on p.shop_id=sc.shop_id and p.active=true
    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    left join sold so on so.shop_id=p.shop_id and so.product_id=p.id
  ),
  classified as (
    select c.*,
      case when avg_daily>0 then round(current_stock/avg_daily,1) else null end days_remaining,
      case
        when current_stock=0 then 'OUT_OF_STOCK'
        when (last_sale is null or last_sale<now()-(v_dead||' days')::interval) and current_stock>0 then 'DEAD'
        when avg_daily>0 and current_stock/avg_daily<=3 then 'STOCKOUT_RISK'
        when current_stock>greatest(minimum_stock*4,ceil(avg_daily*30)::integer) and current_stock>minimum_stock*2 then 'OVERSTOCK'
        when units_sold>=v_history then 'FAST'
        when units_sold<=2 then 'SLOW'
        else 'HEALTHY'
      end classification,
      round(current_stock*purchase_price,2) inventory_cost
    from calc c
  ),
  attention as (
    select *
    from classified
    where classification in ('OUT_OF_STOCK','DEAD','STOCKOUT_RISK','OVERSTOCK','SLOW')
    order by
      case classification
        when 'OUT_OF_STOCK' then 1
        when 'STOCKOUT_RISK' then 2
        when 'DEAD' then 3
        when 'OVERSTOCK' then 4
        else 5
      end,
      coalesce(days_remaining,999999),
      product_name
    limit 25
  )
  select jsonb_build_object(
    'history_days',v_history,
    'dead_days',v_dead,
    'inventory_value',coalesce(round(sum(inventory_cost),2),0),
    'product_count',count(*)::integer,
    'out_of_stock_count',count(*) filter(where classification='OUT_OF_STOCK'),
    'stockout_risk_count',count(*) filter(where classification='STOCKOUT_RISK'),
    'dead_stock_count',count(*) filter(where classification='DEAD'),
    'dead_stock_value',coalesce(round(sum(inventory_cost) filter(where classification='DEAD'),2),0),
    'slow_stock_count',count(*) filter(where classification='SLOW'),
    'overstock_count',count(*) filter(where classification='OVERSTOCK'),
    'attention_items',coalesce((select jsonb_agg(to_jsonb(a)) from attention a),'[]'::jsonb),
    'source_path','/inventory/intelligence'
  )
  into v_result
  from classified;

  return v_result;
end;
$$;

create or replace function public.ai_get_reorder_recommendations(
  p_anchor_shop_id uuid,
  p_scope text,
  p_history_days integer default 30,
  p_target_days integer default 7
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_history integer := greatest(1,least(coalesce(p_history_days,30),180));
  v_target integer := greatest(1,least(coalesce(p_target_days,7),60));
  v_result jsonb;
begin
  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  sold as (
    select si.shop_id,si.product_id,coalesce(sum(si.quantity),0)::integer units
    from public.sale_items si
    join public.sales s on s.id=si.sale_id
    join scope sc on sc.shop_id=si.shop_id
    where s.status not in ('VOID','RETURNED')
      and s.created_at>=now()-(v_history||' days')::interval
    group by si.shop_id,si.product_id
  ),
  calc as (
    select sc.shop_name,p.shop_id,p.id product_id,p.barcode,p.product_name,p.minimum_stock,
      greatest(p.units_per_case,1) units_per_case,
      coalesce(i.quantity,0)::integer current_stock,
      coalesce(so.units,0)::integer units_sold,
      round(coalesce(so.units,0)::numeric/v_history,2) avg_daily
    from scope sc
    join public.products p on p.shop_id=sc.shop_id and p.active=true
    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    left join sold so on so.shop_id=p.shop_id and so.product_id=p.id
  ),
  suggestions as (
    select c.*,
      case when avg_daily>0 then round(current_stock/avg_daily,1) else null end days_remaining,
      greatest(0,ceil(greatest(avg_daily*v_target,minimum_stock)-current_stock))::integer suggested_bottles
    from calc c
  ),
  final as (
    select s.*,
      case when suggested_bottles=0 then 0
           else ceil(suggested_bottles::numeric/units_per_case)::integer end suggested_cases
    from suggestions s
    where current_stock<=minimum_stock or (avg_daily>0 and current_stock/avg_daily<=v_target)
    order by case when avg_daily>0 then current_stock/avg_daily else 999999 end,current_stock
    limit 30
  )
  select jsonb_build_object(
    'history_days',v_history,
    'target_days',v_target,
    'item_count',count(*)::integer,
    'items',coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb),
    'source_path','/inventory/intelligence'
  )
  into v_result
  from final f;

  return coalesce(v_result,jsonb_build_object(
    'history_days',v_history,'target_days',v_target,'item_count',0,'items','[]'::jsonb,
    'source_path','/inventory/intelligence'
  ));
end;
$$;

create or replace function public.ai_get_supplier_price_history(
  p_anchor_shop_id uuid,
  p_scope text,
  p_product_query text default '',
  p_days integer default 180
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_days integer := greatest(7,least(coalesce(p_days,180),730));
  v_query text := trim(coalesce(p_product_query,''));
  v_result jsonb;
begin
  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  rows as (
    select sc.shop_name,pi.shop_id,pi.product_id,p.product_name,p.barcode,p.sku,
      pu.supplier_id,pu.supplier_name_snapshot supplier_name,pu.invoice_date,
      pi.purchase_price,pi.quantity,pu.created_at,
      row_number() over(partition by pi.shop_id,pi.product_id order by pu.invoice_date desc,pu.created_at desc,pi.id desc) rn
    from public.purchase_items pi
    join public.purchases pu on pu.id=pi.purchase_id
    join public.products p on p.id=pi.product_id
    join scope sc on sc.shop_id=pi.shop_id
    where pu.status='RECEIVED'
      and pu.invoice_date>=current_date-v_days
      and (
        v_query=''
        or lower(p.product_name) like '%'||lower(v_query)||'%'
        or lower(coalesce(p.barcode,''))=lower(v_query)
        or lower(coalesce(p.sku,''))=lower(v_query)
      )
  ),
  change_rows as (
    select shop_name,shop_id,product_id,max(product_name) product_name,
      max(purchase_price) filter(where rn=1) current_price,
      max(purchase_price) filter(where rn=2) previous_price,
      max(supplier_name) filter(where rn=1) current_supplier,
      max(invoice_date) filter(where rn=1) current_date
    from rows
    group by shop_name,shop_id,product_id
  ),
  changes as (
    select *,
      round(current_price-previous_price,2) price_change,
      case when previous_price>0 then round((current_price-previous_price)/previous_price*100,2) else null end change_pct
    from change_rows
    where previous_price is not null and current_price is distinct from previous_price
    order by abs(current_price-previous_price) desc,current_date desc
    limit 20
  ),
  history as (
    select shop_name,product_id,product_name,supplier_id,supplier_name,invoice_date,purchase_price,quantity
    from rows
    order by invoice_date desc,created_at desc
    limit 30
  )
  select jsonb_build_object(
    'query',v_query,
    'days',v_days,
    'recent_price_changes',coalesce((select jsonb_agg(to_jsonb(c)) from changes c),'[]'::jsonb),
    'history',coalesce((select jsonb_agg(to_jsonb(h)) from history h),'[]'::jsonb),
    'source_path','/purchasing/intelligence'
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.ai_get_product_stock_history(
  p_anchor_shop_id uuid,
  p_scope text,
  p_product_query text,
  p_days integer default 90
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_days integer := greatest(1,least(coalesce(p_days,90),730));
  v_query text := trim(coalesce(p_product_query,''));
  v_result jsonb;
begin
  if v_query='' then
    raise exception 'AI_PRODUCT_QUERY_REQUIRED';
  end if;

  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  matched as (
    select sc.shop_name,p.shop_id,p.id product_id,p.product_name,p.barcode,p.sku,
      coalesce(i.quantity,0)::integer current_stock
    from scope sc
    join public.products p on p.shop_id=sc.shop_id and p.active=true
    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
    where lower(p.product_name) like '%'||lower(v_query)||'%'
       or lower(coalesce(p.barcode,''))=lower(v_query)
       or lower(coalesce(p.sku,''))=lower(v_query)
    order by
      case when lower(p.product_name)=lower(v_query) then 0 else 1 end,
      p.product_name
    limit 8
  ),
  movements as (
    select m.shop_name,m.product_id,m.product_name,sm.movement_type,sm.quantity_change,
      sm.quantity_before,sm.quantity_after,sm.reason,sm.reference_type,sm.reference_id,sm.created_at
    from matched m
    join public.stock_movements sm on sm.shop_id=m.shop_id and sm.product_id=m.product_id
    where sm.created_at>=now()-(v_days||' days')::interval
    order by sm.created_at desc
    limit 60
  )
  select jsonb_build_object(
    'query',v_query,
    'days',v_days,
    'products',coalesce((select jsonb_agg(to_jsonb(m)) from matched m),'[]'::jsonb),
    'movements',coalesce((select jsonb_agg(to_jsonb(mv)) from movements mv),'[]'::jsonb),
    'source_path','/inventory'
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.ai_get_shift_variances(
  p_anchor_shop_id uuid,
  p_scope text,
  p_days integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_days integer := greatest(1,least(coalesce(p_days,30),365));
  v_result jsonb;
begin
  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  rows as (
    select sc.shop_name,sh.id shift_id,sh.cashier_id,sh.opened_at,sh.closed_at,
      sh.opening_cash,sh.cash_sales,sh.upi_sales,sh.card_sales,sh.cash_refunds,
      sh.expected_cash,sh.actual_cash,sh.cash_difference,
      case
        when abs(coalesce(sh.cash_difference,0))>=1000 then 'HIGH'
        when abs(coalesce(sh.cash_difference,0))>=200 then 'MEDIUM'
        else 'LOW'
      end severity
    from public.cashier_shifts sh
    join scope sc on sc.shop_id=sh.shop_id
    where sh.status='CLOSED'
      and sh.closed_at>=now()-(v_days||' days')::interval
      and abs(coalesce(sh.cash_difference,0))>0
    order by abs(coalesce(sh.cash_difference,0)) desc,sh.closed_at desc
    limit 30
  )
  select jsonb_build_object(
    'days',v_days,
    'variance_count',count(*)::integer,
    'net_cash_difference',coalesce(round(sum(cash_difference),2),0),
    'absolute_cash_variance',coalesce(round(sum(abs(cash_difference)),2),0),
    'requires_review',coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb),
    'source_path','/operations/shifts'
  )
  into v_result
  from rows r;

  return coalesce(v_result,jsonb_build_object(
    'days',v_days,'variance_count',0,'net_cash_difference',0,'absolute_cash_variance',0,
    'requires_review','[]'::jsonb,'source_path','/operations/shifts'
  ));
end;
$$;

create or replace function public.ai_get_audit_exceptions(
  p_anchor_shop_id uuid,
  p_scope text,
  p_days integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_days integer := greatest(1,least(coalesce(p_days,30),365));
  v_result jsonb;
begin
  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  q as (
    select sc.shop_name,'CASH_VARIANCE'::text exception_type,
      case when abs(coalesce(sh.cash_difference,0))>=1000 then 'HIGH' else 'MEDIUM' end severity,
      coalesce(sh.closed_at,sh.opened_at) event_time,sh.id::text entity_id,
      'Shift cash variance requires review'::text summary,
      abs(coalesce(sh.cash_difference,0))::numeric amount,
      '/operations/shifts'::text action_path
    from public.cashier_shifts sh
    join scope sc on sc.shop_id=sh.shop_id
    where sh.status='CLOSED'
      and abs(coalesce(sh.cash_difference,0))>=200
      and sh.opened_at>=now()-(v_days||' days')::interval

    union all

    select sc.shop_name,'REFUND'::text,
      case when r.total_refund>=2000 then 'HIGH' else 'MEDIUM' end,
      r.created_at,r.id::text,
      'Approved refund requires review',
      r.total_refund,
      '/pos/returns'
    from public.sale_return_requests r
    join scope sc on sc.shop_id=r.shop_id
    where r.status='APPROVED'
      and r.total_refund>=500
      and r.created_at>=now()-(v_days||' days')::interval

    union all

    select sc.shop_name,'DISCOUNT'::text,
      case when s.discount>=1000 or (s.subtotal>0 and s.discount/s.subtotal>=0.20) then 'HIGH' else 'MEDIUM' end,
      s.created_at,s.id::text,
      'Sale discount requires review',
      s.discount,
      '/pos/sales'
    from public.sales s
    join scope sc on sc.shop_id=s.shop_id
    where s.discount>0
      and (s.discount>=500 or (s.subtotal>0 and s.discount/s.subtotal>=0.10))
      and s.created_at>=now()-(v_days||' days')::interval
  ),
  ordered as (
    select * from q
    order by case severity when 'HIGH' then 1 else 2 end,amount desc,event_time desc
    limit 40
  )
  select jsonb_build_object(
    'days',v_days,
    'exception_count',count(*)::integer,
    'high_severity_count',count(*) filter(where severity='HIGH'),
    'items',coalesce(jsonb_agg(to_jsonb(o)),'[]'::jsonb),
    'source_path','/owner/exceptions'
  )
  into v_result
  from ordered o;

  return coalesce(v_result,jsonb_build_object(
    'days',v_days,'exception_count',0,'high_severity_count',0,'items','[]'::jsonb,
    'source_path','/owner/exceptions'
  ));
end;
$$;

create or replace function public.ai_get_expense_summary(
  p_anchor_shop_id uuid,
  p_scope text,
  p_period text default 'LAST_30_DAYS'
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_from date;
  v_to date;
  v_result jsonb;
begin
  select from_date,to_date into v_from,v_to from public.ai_period_bounds(p_period);

  with scope as (
    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
  ),
  rows as (
    select sc.shop_name,e.shop_id,ec.name category,e.amount,e.payment_method,e.expense_date
    from public.expenses e
    join public.expense_categories ec on ec.id=e.category_id
    join scope sc on sc.shop_id=e.shop_id
    where e.status='ACTIVE' and e.expense_date between v_from and v_to
  ),
  by_category as (
    select category,round(sum(amount),2) amount,count(*)::integer entries
    from rows
    group by category
    order by amount desc
  ),
  by_shop as (
    select shop_id,shop_name,round(sum(amount),2) amount,count(*)::integer entries
    from rows
    group by shop_id,shop_name
    order by amount desc
  )
  select jsonb_build_object(
    'period',upper(p_period),
    'from',v_from,
    'to',v_to,
    'total_expenses',coalesce((select round(sum(amount),2) from rows),0),
    'by_category',coalesce((select jsonb_agg(to_jsonb(c)) from by_category c),'[]'::jsonb),
    'by_shop',coalesce((select jsonb_agg(to_jsonb(s)) from by_shop s),'[]'::jsonb),
    'source_path','/operations/expenses'
  )
  into v_result;

  return v_result;
end;
$$;

-- Direct table writes are intentionally not granted.
grant select on public.ai_activity_logs to authenticated;

grant execute on function public.ai_scope_shops(uuid,text) to authenticated;
grant execute on function public.ai_resolve_context(uuid,text) to authenticated;
grant execute on function public.ai_rate_limit_check(uuid,text) to authenticated;
grant execute on function public.ai_log_activity(uuid,uuid,text,text,text[],text,integer) to authenticated;
grant execute on function public.ai_period_bounds(text) to authenticated;
grant execute on function public.ai_get_sales_summary(uuid,text,text) to authenticated;
grant execute on function public.ai_get_profit_summary(uuid,text,text) to authenticated;
grant execute on function public.ai_get_inventory_health(uuid,text,integer,integer) to authenticated;
grant execute on function public.ai_get_reorder_recommendations(uuid,text,integer,integer) to authenticated;
grant execute on function public.ai_get_supplier_price_history(uuid,text,text,integer) to authenticated;
grant execute on function public.ai_get_product_stock_history(uuid,text,text,integer) to authenticated;
grant execute on function public.ai_get_shift_variances(uuid,text,integer) to authenticated;
grant execute on function public.ai_get_audit_exceptions(uuid,text,integer) to authenticated;
grant execute on function public.ai_get_expense_summary(uuid,text,text) to authenticated;

notify pgrst,'reload schema';
