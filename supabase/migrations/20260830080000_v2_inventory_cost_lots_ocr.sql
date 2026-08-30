-- WineShopPOS V2 Phase 1
-- Landed cost + receipt lots + true receipt ageing + FIFO analytical foundation.
-- Existing POS sale deduction, sale cost snapshots, and existing purchase RPCs remain authoritative.
-- Purchase tax is not silently included because recoverable/non-recoverable tax semantics are not yet explicit.

alter table public.purchases
  add column if not exists freight_amount numeric(14,2) not null default 0,
  add column if not exists transport_amount numeric(14,2) not null default 0,
  add column if not exists handling_amount numeric(14,2) not null default 0,
  add column if not exists loading_unloading_amount numeric(14,2) not null default 0,
  add column if not exists supplier_discount_amount numeric(14,2) not null default 0,
  add column if not exists invoice_discount_amount numeric(14,2) not null default 0,
  add column if not exists miscellaneous_amount numeric(14,2) not null default 0,
  add column if not exists rounding_adjustment numeric(14,2) not null default 0,
  add column if not exists total_landed_cost numeric(14,2),
  add column if not exists landed_cost_method text,
  add column if not exists landed_cost_finalized_at timestamptz;

alter table public.purchase_items
  add column if not exists batch_number text,
  add column if not exists expiry_date date,
  add column if not exists allocated_landed_cost numeric(14,2) not null default 0,
  add column if not exists landed_unit_cost numeric(14,6);

create table if not exists public.inventory_receipt_lots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  supplier_id uuid references public.suppliers(id) on delete set null,
  purchase_id uuid references public.purchases(id) on delete restrict,
  purchase_item_id uuid references public.purchase_items(id) on delete restrict,
  internal_lot_number text not null,
  batch_number text,
  received_at timestamptz not null,
  received_quantity integer not null check (received_quantity>0),
  remaining_quantity integer not null check (remaining_quantity>=0),
  base_unit_cost numeric(14,6) not null check (base_unit_cost>=0),
  landed_unit_cost numeric(14,6) not null check (landed_unit_cost>=0),
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(purchase_item_id),
  unique(shop_id,internal_lot_number)
);

create index if not exists idx_receipt_lots_shop_product_received
  on public.inventory_receipt_lots(shop_id,product_id,received_at,id);
create index if not exists idx_receipt_lots_remaining
  on public.inventory_receipt_lots(shop_id,product_id,remaining_quantity)
  where remaining_quantity>0;

drop trigger if exists trg_inventory_receipt_lots_updated_at on public.inventory_receipt_lots;
create trigger trg_inventory_receipt_lots_updated_at
before update on public.inventory_receipt_lots
for each row execute function public.set_updated_at();

do $$ begin
  alter table public.purchases
    add constraint v2_purchase_landed_nonnegative
    check (
      freight_amount>=0 and transport_amount>=0 and handling_amount>=0
      and loading_unloading_amount>=0 and supplier_discount_amount>=0
      and invoice_discount_amount>=0 and miscellaneous_amount>=0
      and (total_landed_cost is null or total_landed_cost>=0)
    );
exception when duplicate_object then null; end $$;

create or replace function public.v2_refresh_receipt_lot_balance(
  p_shop_id uuid,p_product_id uuid
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_stock integer;
begin
  select coalesce((select quantity from public.inventory
    where shop_id=p_shop_id and product_id=p_product_id),0)
  into v_stock;

  with ordered as (
    select id,received_quantity,
      coalesce(sum(received_quantity) over (
        order by received_at desc,id desc
        rows between unbounded preceding and 1 preceding
      ),0)::integer newer_qty
    from public.inventory_receipt_lots
    where shop_id=p_shop_id and product_id=p_product_id
  ),
  calc as (
    select id,
      greatest(least(received_quantity,v_stock-newer_qty),0)::integer remaining
    from ordered
  )
  update public.inventory_receipt_lots l
  set remaining_quantity=c.remaining,updated_at=now()
  from calc c
  where l.id=c.id and l.remaining_quantity is distinct from c.remaining;
end;
$$;

revoke all on function public.v2_refresh_receipt_lot_balance(uuid,uuid) from public;
revoke all on function public.v2_refresh_receipt_lot_balance(uuid,uuid) from authenticated;

create or replace function public.v2_refresh_lots_after_stock_movement()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if exists(select 1 from public.inventory_receipt_lots
    where shop_id=new.shop_id and product_id=new.product_id) then
    perform public.v2_refresh_receipt_lot_balance(new.shop_id,new.product_id);
  end if;
  return new;
end;
$$;

revoke all on function public.v2_refresh_lots_after_stock_movement() from public;
revoke all on function public.v2_refresh_lots_after_stock_movement() from authenticated;

drop trigger if exists trg_v2_refresh_lots_after_stock_movement on public.stock_movements;
create trigger trg_v2_refresh_lots_after_stock_movement
after insert on public.stock_movements
for each row execute function public.v2_refresh_lots_after_stock_movement();

create or replace function public.finalize_purchase_landed_cost(
  p_purchase_id uuid,
  p_freight_amount numeric default 0,
  p_transport_amount numeric default 0,
  p_handling_amount numeric default 0,
  p_loading_unloading_amount numeric default 0,
  p_supplier_discount_amount numeric default 0,
  p_invoice_discount_amount numeric default 0,
  p_miscellaneous_amount numeric default 0,
  p_rounding_adjustment numeric default 0
)
returns numeric
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_supplier uuid;
  v_org uuid;
  v_received_at timestamptz;
  v_base numeric:=0;
  v_qty integer:=0;
  v_count integer:=0;
  v_idx integer:=0;
  v_adjust numeric:=0;
  v_total numeric:=0;
  v_allocated numeric:=0;
  v_alloc numeric:=0;
  v_unit numeric:=0;
  r record;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if coalesce(p_freight_amount,0)<0 or coalesce(p_transport_amount,0)<0
     or coalesce(p_handling_amount,0)<0 or coalesce(p_loading_unloading_amount,0)<0
     or coalesce(p_supplier_discount_amount,0)<0 or coalesce(p_invoice_discount_amount,0)<0
     or coalesce(p_miscellaneous_amount,0)<0 then
    raise exception 'Landed-cost charges and discounts cannot be negative';
  end if;

  select p.supplier_id,s.organization_id,p.created_at
  into v_supplier,v_org,v_received_at
  from public.purchases p
  join public.shops s on s.id=p.shop_id
  where p.id=p_purchase_id and p.shop_id=v_shop
  for update;

  if not found then raise exception 'Purchase not found in current shop'; end if;

  select count(*)::integer,coalesce(sum(quantity),0)::integer,
         coalesce(sum(quantity*purchase_price),0)
  into v_count,v_qty,v_base
  from public.purchase_items
  where purchase_id=p_purchase_id and shop_id=v_shop;

  if v_count=0 or v_qty<=0 then raise exception 'Purchase has no items'; end if;

  v_adjust:=coalesce(p_freight_amount,0)+coalesce(p_transport_amount,0)
    +coalesce(p_handling_amount,0)+coalesce(p_loading_unloading_amount,0)
    +coalesce(p_miscellaneous_amount,0)-coalesce(p_supplier_discount_amount,0)
    -coalesce(p_invoice_discount_amount,0)+coalesce(p_rounding_adjustment,0);

  v_total:=round(v_base+v_adjust,2);
  if v_total<0 then raise exception 'Total landed cost cannot be negative'; end if;

  update public.purchases
  set freight_amount=round(coalesce(p_freight_amount,0),2),
      transport_amount=round(coalesce(p_transport_amount,0),2),
      handling_amount=round(coalesce(p_handling_amount,0),2),
      loading_unloading_amount=round(coalesce(p_loading_unloading_amount,0),2),
      supplier_discount_amount=round(coalesce(p_supplier_discount_amount,0),2),
      invoice_discount_amount=round(coalesce(p_invoice_discount_amount,0),2),
      miscellaneous_amount=round(coalesce(p_miscellaneous_amount,0),2),
      rounding_adjustment=round(coalesce(p_rounding_adjustment,0),2),
      total_landed_cost=v_total,
      landed_cost_method='PRO_RATA_LINE_VALUE',
      landed_cost_finalized_at=now()
  where id=p_purchase_id and shop_id=v_shop;

  for r in select * from public.purchase_items
    where purchase_id=p_purchase_id and shop_id=v_shop order by id
  loop
    v_idx:=v_idx+1;
    if v_idx=v_count then
      v_alloc:=round(v_adjust-v_allocated,2);
    elsif v_base>0 then
      v_alloc:=round(v_adjust*((r.quantity*r.purchase_price)::numeric/v_base),2);
    else
      v_alloc:=round(v_adjust*(r.quantity::numeric/v_qty),2);
    end if;

    v_allocated:=v_allocated+v_alloc;
    v_unit:=round(r.purchase_price+(v_alloc/r.quantity),6);
    if v_unit<0 then raise exception 'Allocated landed unit cost became negative'; end if;

    update public.purchase_items
    set allocated_landed_cost=v_alloc,landed_unit_cost=v_unit
    where id=r.id;

    insert into public.inventory_receipt_lots(
      organization_id,shop_id,product_id,supplier_id,purchase_id,purchase_item_id,
      internal_lot_number,batch_number,received_at,received_quantity,remaining_quantity,
      base_unit_cost,landed_unit_cost,expiry_date
    ) values(
      v_org,v_shop,r.product_id,v_supplier,p_purchase_id,r.id,
      'LOT-'||upper(substr(replace(p_purchase_id::text,'-',''),1,8))
        ||'-'||upper(substr(replace(r.id::text,'-',''),1,6)),
      nullif(trim(r.batch_number),''),
      coalesce(v_received_at,now()),r.quantity,r.quantity,
      r.purchase_price,v_unit,r.expiry_date
    )
    on conflict(purchase_item_id) do update
    set batch_number=excluded.batch_number,
        received_quantity=excluded.received_quantity,
        base_unit_cost=excluded.base_unit_cost,
        landed_unit_cost=excluded.landed_unit_cost,
        expiry_date=excluded.expiry_date,
        updated_at=now();

    perform public.v2_refresh_receipt_lot_balance(v_shop,r.product_id);
  end loop;

  perform public.write_audit(v_shop,'V2_LANDED_COST_FINALIZED','purchase',
    p_purchase_id::text,null,null,jsonb_build_object(
      'base_total',round(v_base,2),'net_adjustment',round(v_adjust,2),
      'total_landed_cost',v_total,'allocation_method','PRO_RATA_LINE_VALUE'));

  return v_total;
end;
$$;

create or replace function public.receive_purchase_v2(
  p_supplier_id uuid,p_invoice_number text,p_invoice_date date,p_items jsonb,
  p_notes text default null,
  p_freight_amount numeric default 0,p_transport_amount numeric default 0,
  p_handling_amount numeric default 0,p_loading_unloading_amount numeric default 0,
  p_supplier_discount_amount numeric default 0,p_invoice_discount_amount numeric default 0,
  p_miscellaneous_amount numeric default 0,p_rounding_adjustment numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_purchase uuid;
  v_base_items jsonb;
  v_item jsonb;
  v_product uuid;
  v_expiry date;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_items is null or jsonb_array_length(p_items)=0 then
    raise exception 'Purchase items required';
  end if;

  if exists(select 1 from (
    select (e->>'product_id')::uuid,count(*) c
    from jsonb_array_elements(p_items)e
    group by (e->>'product_id')::uuid having count(*)>1
  )d) then
    raise exception 'Combine duplicate product lines before receiving';
  end if;

  select jsonb_agg(jsonb_build_object(
    'product_id',e->>'product_id',
    'case_count',coalesce((e->>'case_count')::integer,0),
    'units_per_case',coalesce((e->>'units_per_case')::integer,1),
    'loose_bottles',coalesce((e->>'loose_bottles')::integer,0),
    'quantity',(e->>'quantity')::integer,
    'purchase_price',(e->>'purchase_price')::numeric
  )) into v_base_items
  from jsonb_array_elements(p_items)e;

  v_purchase:=public.receive_purchase(
    p_supplier_id,p_invoice_number,p_invoice_date,v_base_items,p_notes
  );

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product:=(v_item->>'product_id')::uuid;
    v_expiry:=case when nullif(trim(v_item->>'expiry_date'),'') is null
      then null else (v_item->>'expiry_date')::date end;

    update public.purchase_items
    set batch_number=nullif(trim(v_item->>'batch_number'),''),
        expiry_date=v_expiry
    where purchase_id=v_purchase and shop_id=v_shop and product_id=v_product;
  end loop;

  perform public.finalize_purchase_landed_cost(
    v_purchase,p_freight_amount,p_transport_amount,p_handling_amount,
    p_loading_unloading_amount,p_supplier_discount_amount,p_invoice_discount_amount,
    p_miscellaneous_amount,p_rounding_adjustment);

  return v_purchase;
end;
$$;

create or replace function public.receive_purchase_order_v2(
  p_po_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_receive_items jsonb default null,
  p_notes text default null,
  p_freight_amount numeric default 0,
  p_transport_amount numeric default 0,
  p_handling_amount numeric default 0,
  p_loading_unloading_amount numeric default 0,
  p_supplier_discount_amount numeric default 0,
  p_invoice_discount_amount numeric default 0,
  p_miscellaneous_amount numeric default 0,
  p_rounding_adjustment numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_purchase uuid;
begin
  perform public.assert_shop_access();
  perform public.assert_manager_or_admin();

  v_purchase:=public.receive_purchase_order(
    p_po_id,
    p_invoice_number,
    p_invoice_date,
    p_receive_items,
    p_notes
  );

  perform public.finalize_purchase_landed_cost(
    v_purchase,
    p_freight_amount,
    p_transport_amount,
    p_handling_amount,
    p_loading_unloading_amount,
    p_supplier_discount_amount,
    p_invoice_discount_amount,
    p_miscellaneous_amount,
    p_rounding_adjustment
  );

  return v_purchase;
end;
$$;

drop function if exists public.inventory_ageing_report();

create function public.inventory_ageing_report()
returns table(
  product_id uuid,product_name text,supplier_name text,lot_number text,
  batch_number text,receipt_date date,age_days integer,age_bucket text,
  quantity integer,landed_unit_cost numeric,cost_value numeric,inventory_percentage numeric
)
language sql
stable
security definer
set search_path=public
as $$
  with tracked as (
    select l.product_id,p.product_name,s.supplier_name,
      l.internal_lot_number as lot_number,l.batch_number,
      l.received_at::date as receipt_date,
      (current_date-l.received_at::date)::integer as age_days,
      case when current_date-l.received_at::date<=30 then '0-30'
        when current_date-l.received_at::date<=60 then '31-60'
        when current_date-l.received_at::date<=90 then '61-90'
        when current_date-l.received_at::date<=180 then '91-180'
        else '180+' end as age_bucket,
      l.remaining_quantity as quantity,l.landed_unit_cost,
      round(l.remaining_quantity*l.landed_unit_cost,2) as cost_value
    from public.inventory_receipt_lots l
    join public.products p on p.id=l.product_id
    left join public.suppliers s on s.id=l.supplier_id
    where l.shop_id=public.assert_shop_access()
      and public.current_user_role() in ('ADMIN','MANAGER')
      and l.remaining_quantity>0
  ),
  tracked_qty as (
    select product_id,sum(quantity)::integer qty from tracked group by product_id
  ),
  untracked as (
    select p.id as product_id,p.product_name,null::text as supplier_name,
      'UNTRACKED'::text as lot_number,null::text as batch_number,
      null::date as receipt_date,null::integer as age_days,'UNTRACKED'::text as age_bucket,
      greatest(i.quantity-coalesce(t.qty,0),0)::integer as quantity,
      p.purchase_price::numeric as landed_unit_cost,
      round(greatest(i.quantity-coalesce(t.qty,0),0)
        *p.purchase_price,2) as cost_value
    from public.inventory i
    join public.products p on p.id=i.product_id
    left join tracked_qty t on t.product_id=p.id
    where i.shop_id=public.assert_shop_access()
      and public.current_user_role() in ('ADMIN','MANAGER')
      and greatest(i.quantity-coalesce(t.qty,0),0)>0
  ),
  rows as (select * from tracked union all select * from untracked)
  select r.product_id,r.product_name,r.supplier_name,r.lot_number,r.batch_number,
    r.receipt_date,r.age_days,r.age_bucket,r.quantity,round(r.landed_unit_cost,6),
    round(r.cost_value,2),
    round(case when sum(r.cost_value) over()>0
      then 100*r.cost_value/sum(r.cost_value) over() else 0 end,2)
  from rows r
  order by case when r.age_bucket='UNTRACKED' then 1 else 0 end,
    r.receipt_date nulls last,r.product_name;
$$;

create or replace function public.fifo_receipt_lots()
returns table(
  product_id uuid,product_name text,lot_number text,batch_number text,
  received_at timestamptz,expiry_date date,remaining_quantity integer,
  landed_unit_cost numeric,supplier_name text
)
language sql
stable
security definer
set search_path=public
as $$
  select l.product_id,p.product_name,l.internal_lot_number,l.batch_number,
    l.received_at,l.expiry_date,l.remaining_quantity,l.landed_unit_cost,s.supplier_name
  from public.inventory_receipt_lots l
  join public.products p on p.id=l.product_id
  left join public.suppliers s on s.id=l.supplier_id
  where l.shop_id=public.assert_shop_access()
    and public.current_user_role() in ('ADMIN','MANAGER')
    and l.remaining_quantity>0
  order by p.product_name,l.received_at,l.id;
$$;

alter table public.inventory_receipt_lots enable row level security;

drop policy if exists inventory_receipt_lots_select on public.inventory_receipt_lots;
create policy inventory_receipt_lots_select on public.inventory_receipt_lots
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and public.current_user_role() in ('ADMIN','MANAGER')
);

revoke insert,update,delete on public.inventory_receipt_lots from authenticated;
grant select on public.inventory_receipt_lots to authenticated;

grant execute on function public.receive_purchase_v2(
  uuid,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) to authenticated;
grant execute on function public.receive_purchase_order_v2(
  uuid,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) to authenticated;
grant execute on function public.finalize_purchase_landed_cost(
  uuid,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) to authenticated;
grant execute on function public.inventory_ageing_report() to authenticated;
grant execute on function public.fifo_receipt_lots() to authenticated;

notify pgrst,'reload schema';
