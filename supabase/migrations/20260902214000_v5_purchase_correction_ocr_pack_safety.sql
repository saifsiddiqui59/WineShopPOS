-- V5-B: audited completed-purchase line correction.
-- Supplier line value remains invariant; corrected quantity changes per-bottle cost.
-- Quantity-changing corrections are blocked once any unit from the receipt lot is consumed.

create table if not exists public.purchase_item_corrections (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  purchase_item_id uuid not null references public.purchase_items(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  old_values jsonb not null,
  new_values jsonb not null,
  quantity_delta integer not null,
  reason text not null,
  updated_product_master boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists purchase_item_corrections_purchase_idx
  on public.purchase_item_corrections(shop_id,purchase_id,created_at desc);

alter table public.purchase_item_corrections enable row level security;
revoke all on public.purchase_item_corrections from anon, authenticated;

create or replace function public.get_purchase_item_corrections(p_purchase_id uuid)
returns table(
  id uuid,
  purchase_item_id uuid,
  product_id uuid,
  old_values jsonb,
  new_values jsonb,
  quantity_delta integer,
  reason text,
  updated_product_master boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  select c.id,c.purchase_item_id,c.product_id,c.old_values,c.new_values,
         c.quantity_delta,c.reason,c.updated_product_master,c.created_at
  from public.purchase_item_corrections c
  where c.shop_id=public.assert_shop_access()
    and c.purchase_id=p_purchase_id
  order by c.created_at desc;
$$;

create or replace function public.correct_received_purchase_item(
  p_purchase_item_id uuid,
  p_case_count integer,
  p_units_per_case integer,
  p_loose_bottles integer,
  p_reason text,
  p_update_product_master boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_purchase uuid;
  v_product uuid;
  v_status text;
  v_old_qty integer;
  v_old_case integer;
  v_old_upc integer;
  v_old_loose integer;
  v_old_price numeric(14,6);
  v_line_total numeric(14,2);
  v_alloc numeric(14,2);
  v_old_landed numeric(14,6);
  v_new_qty integer;
  v_delta integer;
  v_new_price numeric(14,6);
  v_new_landed numeric(14,6);
  v_inv_before integer;
  v_inv_after integer;
  v_lot_received integer;
  v_lot_remaining integer;
  v_old jsonb;
  v_new jsonb;
  v_correction uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if coalesce(p_case_count,0)<0
     or coalesce(p_units_per_case,0)<=0
     or coalesce(p_loose_bottles,0)<0 then
    raise exception 'Invalid pack correction';
  end if;

  if length(trim(coalesce(p_reason,'')))<4 then
    raise exception 'Correction reason is required';
  end if;

  select pi.purchase_id,pi.product_id,pu.status,
         pi.quantity,pi.case_count,pi.units_per_case,pi.loose_bottles,
         pi.purchase_price,pi.line_total,pi.allocated_landed_cost,pi.landed_unit_cost
  into v_purchase,v_product,v_status,
       v_old_qty,v_old_case,v_old_upc,v_old_loose,
       v_old_price,v_line_total,v_alloc,v_old_landed
  from public.purchase_items pi
  join public.purchases pu on pu.id=pi.purchase_id
  where pi.id=p_purchase_item_id
    and pi.shop_id=v_shop
    and pu.shop_id=v_shop
  for update of pi,pu;

  if not found then raise exception 'Purchase item not found in current shop'; end if;
  if v_status<>'RECEIVED' then raise exception 'Only received purchases can be corrected'; end if;

  select received_quantity,remaining_quantity
  into v_lot_received,v_lot_remaining
  from public.inventory_receipt_lots
  where purchase_item_id=p_purchase_item_id
    and shop_id=v_shop
  for update;

  if not found then
    raise exception 'Receipt lot not found; use advanced/manual review';
  end if;

  if v_lot_remaining<>v_lot_received then
    raise exception 'Receipt lot has already been consumed. Use reversal/advanced correction instead of rewriting FIFO history.';
  end if;

  v_new_qty:=coalesce(p_case_count,0)*p_units_per_case+coalesce(p_loose_bottles,0);
  if v_new_qty<=0 then raise exception 'Corrected final bottle quantity must be positive'; end if;

  v_delta:=v_new_qty-v_old_qty;
  v_new_price:=round(v_line_total/v_new_qty,6);
  v_new_landed:=round(v_new_price+(coalesce(v_alloc,0)/v_new_qty),6);

  select quantity into v_inv_before
  from public.inventory
  where shop_id=v_shop and product_id=v_product
  for update;

  if v_inv_before is null then raise exception 'Inventory row not found'; end if;
  v_inv_after:=v_inv_before+v_delta;
  if v_inv_after<0 then raise exception 'Correction would make inventory negative'; end if;

  v_old:=jsonb_build_object(
    'case_count',v_old_case,
    'units_per_case',v_old_upc,
    'loose_bottles',v_old_loose,
    'quantity',v_old_qty,
    'purchase_price',v_old_price,
    'line_total',v_line_total,
    'allocated_landed_cost',v_alloc,
    'landed_unit_cost',v_old_landed
  );

  update public.inventory
  set quantity=v_inv_after
  where shop_id=v_shop and product_id=v_product;

  update public.purchase_items
  set case_count=p_case_count,
      units_per_case=p_units_per_case,
      loose_bottles=p_loose_bottles,
      quantity=v_new_qty,
      purchase_unit=case when p_case_count>0 then 'CASE' else 'BOTTLE' end,
      purchase_price=v_new_price,
      landed_unit_cost=v_new_landed
  where id=p_purchase_item_id and shop_id=v_shop;

  update public.inventory_receipt_lots
  set received_quantity=v_new_qty,
      remaining_quantity=v_new_qty,
      base_unit_cost=v_new_price,
      landed_unit_cost=v_new_landed,
      updated_at=now()
  where purchase_item_id=p_purchase_item_id and shop_id=v_shop;

  if coalesce(p_update_product_master,true) then
    update public.products
    set units_per_case=p_units_per_case,
        purchase_price=round(v_new_price,2),
        updated_at=now()
    where id=v_product and shop_id=v_shop;
  end if;

  if v_delta<>0 then
    insert into public.stock_movements(
      shop_id,product_id,movement_type,quantity_change,
      quantity_before,quantity_after,reference_type,reference_id,
      reason,notes,created_by
    ) values(
      v_shop,v_product,'STOCK_CORRECTION',v_delta,
      v_inv_before,v_inv_after,'PURCHASE',v_purchase,
      'Completed purchase correction',
      trim(p_reason),auth.uid()
    );
  end if;

  v_new:=jsonb_build_object(
    'case_count',p_case_count,
    'units_per_case',p_units_per_case,
    'loose_bottles',p_loose_bottles,
    'quantity',v_new_qty,
    'purchase_price',v_new_price,
    'line_total',v_line_total,
    'allocated_landed_cost',v_alloc,
    'landed_unit_cost',v_new_landed,
    'inventory_before',v_inv_before,
    'inventory_after',v_inv_after
  );

  insert into public.purchase_item_corrections(
    shop_id,purchase_id,purchase_item_id,product_id,
    old_values,new_values,quantity_delta,reason,
    updated_product_master,created_by
  ) values(
    v_shop,v_purchase,p_purchase_item_id,v_product,
    v_old,v_new,v_delta,trim(p_reason),
    coalesce(p_update_product_master,true),auth.uid()
  ) returning id into v_correction;

  perform public.write_audit(
    v_shop,'PURCHASE_ITEM_CORRECTED','purchase_item',p_purchase_item_id::text,
    v_old,v_new,
    jsonb_build_object(
      'purchase_id',v_purchase,
      'correction_id',v_correction,
      'reason',trim(p_reason),
      'quantity_delta',v_delta,
      'updated_product_master',coalesce(p_update_product_master,true)
    )
  );

  return jsonb_build_object(
    'correction_id',v_correction,
    'purchase_id',v_purchase,
    'purchase_item_id',p_purchase_item_id,
    'product_id',v_product,
    'quantity_delta',v_delta,
    'new_quantity',v_new_qty,
    'new_purchase_price',v_new_price,
    'new_landed_unit_cost',v_new_landed,
    'inventory_after',v_inv_after
  );
end;
$$;

grant execute on function public.get_purchase_item_corrections(uuid) to authenticated;
grant execute on function public.correct_received_purchase_item(uuid,integer,integer,integer,text,boolean) to authenticated;
