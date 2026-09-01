-- V3-05: forward FIFO stock-out allocation and safe Admin test-product cleanup.
alter table public.sale_items
  add column if not exists fifo_unit_cost numeric(14,6),
  add column if not exists fifo_line_cost numeric(16,6);

create table if not exists public.inventory_fifo_allocations(
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  stock_movement_id uuid not null references public.stock_movements(id) on delete cascade,
  receipt_lot_id uuid references public.inventory_receipt_lots(id) on delete set null,
  movement_type text not null,
  reference_type text,
  reference_id uuid,
  source_type text not null check(source_type in('UNTRACKED_OPENING','RECEIPT_LOT','UNTRACKED_FALLBACK')),
  quantity integer not null check(quantity>0),
  landed_unit_cost numeric(14,6) not null default 0 check(landed_unit_cost>=0),
  allocated_cost numeric(16,6) not null default 0 check(allocated_cost>=0),
  created_at timestamptz not null default now()
);
create index if not exists idx_fifo_alloc_move on public.inventory_fifo_allocations(stock_movement_id);
create index if not exists idx_fifo_alloc_shop_product on public.inventory_fifo_allocations(shop_id,product_id,created_at desc);
alter table public.inventory_fifo_allocations enable row level security;
drop policy if exists fifo_alloc_select on public.inventory_fifo_allocations;
create policy fifo_alloc_select on public.inventory_fifo_allocations for select to authenticated
using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in('ADMIN','MANAGER'));
revoke insert,update,delete on public.inventory_fifo_allocations from authenticated;
grant select on public.inventory_fifo_allocations to authenticated;

create or replace function public.v3_record_fifo_stock_out()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_need integer;v_take integer;v_tracked integer:=0;v_untracked integer:=0;
  v_cost numeric:=0;v_total numeric:=0;r record;
begin
  if new.quantity_change>=0 then return new; end if;
  v_need:=abs(new.quantity_change);

  select coalesce(sum(remaining_quantity),0)::integer into v_tracked
  from public.inventory_receipt_lots
  where shop_id=new.shop_id and product_id=new.product_id and remaining_quantity>0;
  v_untracked:=greatest(coalesce(new.quantity_before,0)-v_tracked,0);

  if v_untracked>0 and v_need>0 then
    v_take:=least(v_untracked,v_need);
    select coalesce(purchase_price,0) into v_cost from public.products where id=new.product_id and shop_id=new.shop_id;
    insert into public.inventory_fifo_allocations(shop_id,product_id,stock_movement_id,movement_type,reference_type,reference_id,source_type,quantity,landed_unit_cost,allocated_cost)
    values(new.shop_id,new.product_id,new.id,new.movement_type,new.reference_type,new.reference_id,'UNTRACKED_OPENING',v_take,coalesce(v_cost,0),round(v_take*coalesce(v_cost,0),6));
    v_total:=v_total+round(v_take*coalesce(v_cost,0),6);v_need:=v_need-v_take;
  end if;

  for r in select id,remaining_quantity,landed_unit_cost from public.inventory_receipt_lots
    where shop_id=new.shop_id and product_id=new.product_id and remaining_quantity>0
    order by received_at asc,id asc
  loop
    exit when v_need<=0;
    v_take:=least(r.remaining_quantity,v_need);
    insert into public.inventory_fifo_allocations(shop_id,product_id,stock_movement_id,receipt_lot_id,movement_type,reference_type,reference_id,source_type,quantity,landed_unit_cost,allocated_cost)
    values(new.shop_id,new.product_id,new.id,r.id,new.movement_type,new.reference_type,new.reference_id,'RECEIPT_LOT',v_take,r.landed_unit_cost,round(v_take*r.landed_unit_cost,6));
    v_total:=v_total+round(v_take*r.landed_unit_cost,6);v_need:=v_need-v_take;
  end loop;

  if v_need>0 then
    select coalesce(purchase_price,0) into v_cost from public.products where id=new.product_id and shop_id=new.shop_id;
    insert into public.inventory_fifo_allocations(shop_id,product_id,stock_movement_id,movement_type,reference_type,reference_id,source_type,quantity,landed_unit_cost,allocated_cost)
    values(new.shop_id,new.product_id,new.id,new.movement_type,new.reference_type,new.reference_id,'UNTRACKED_FALLBACK',v_need,coalesce(v_cost,0),round(v_need*coalesce(v_cost,0),6));
    v_total:=v_total+round(v_need*coalesce(v_cost,0),6);v_need:=0;
  end if;

  if new.movement_type in('SALE','OFFLINE_SALE') and new.reference_type='SALE' and new.reference_id is not null then
    update public.sale_items set fifo_line_cost=round(v_total,6),fifo_unit_cost=case when quantity>0 then round(v_total/quantity,6) else 0 end
    where shop_id=new.shop_id and sale_id=new.reference_id and product_id=new.product_id;
  end if;
  return new;
end;$$;
revoke all on function public.v3_record_fifo_stock_out() from public,authenticated;
drop trigger if exists trg_v1_fifo_record_stock_movement on public.stock_movements;
create trigger trg_v1_fifo_record_stock_movement after insert on public.stock_movements
for each row execute function public.v3_record_fifo_stock_out();

create or replace function public.recent_fifo_allocations(p_limit integer default 100)
returns table(movement_time timestamptz,movement_type text,reference_id uuid,product_name text,source_type text,lot_number text,batch_number text,quantity integer,landed_unit_cost numeric,allocated_cost numeric)
language sql stable security definer set search_path=public as $$
 select sm.created_at,a.movement_type,a.reference_id,p.product_name,a.source_type,l.internal_lot_number,l.batch_number,a.quantity,a.landed_unit_cost,a.allocated_cost
 from public.inventory_fifo_allocations a join public.stock_movements sm on sm.id=a.stock_movement_id join public.products p on p.id=a.product_id left join public.inventory_receipt_lots l on l.id=a.receipt_lot_id
 where a.shop_id=public.assert_shop_access() and public.current_user_role() in('ADMIN','MANAGER') order by sm.created_at desc,a.created_at desc limit least(greatest(coalesce(p_limit,100),1),500);
$$;
grant execute on function public.recent_fifo_allocations(integer) to authenticated;

create or replace function public.admin_product_cleanup_check(p_product_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_shop uuid;v_stock integer:=0;v_sales integer:=0;v_purchases integer:=0;v_protected integer:=0;v_tx integer:=0;v_blockers text[]:='{}';
begin
 v_shop:=public.assert_shop_access();perform public.assert_admin();
 if not exists(select 1 from public.products where id=p_product_id and shop_id=v_shop) then raise exception 'Product not found'; end if;
 select coalesce(quantity,0) into v_stock from public.inventory where shop_id=v_shop and product_id=p_product_id;
 select count(*)::integer into v_sales from public.sale_items where shop_id=v_shop and product_id=p_product_id;
 select count(*)::integer into v_purchases from public.purchase_items where shop_id=v_shop and product_id=p_product_id;
 select (select count(*) from public.stock_count_items where shop_id=v_shop and product_id=p_product_id)
      +(select count(*) from public.sale_return_items where shop_id=v_shop and product_id=p_product_id)
      +(select count(*) from public.stock_transfer_items sti join public.stock_transfers st on st.id=sti.transfer_id where (st.source_shop_id=v_shop or st.destination_shop_id=v_shop) and (sti.source_product_id=p_product_id or sti.destination_product_id=p_product_id)) into v_protected;
 select count(*)::integer into v_tx from public.stock_movements where shop_id=v_shop and product_id=p_product_id and movement_type in('PURCHASE','SALE','OFFLINE_SALE','CUSTOMER_RETURN','SUPPLIER_RETURN','SALE_VOID','TRANSFER_OUT','TRANSFER_IN');
 if v_sales>0 then v_blockers:=array_append(v_blockers,'Sales history exists'); end if;
 if v_purchases>0 then v_blockers:=array_append(v_blockers,'Purchase history exists'); end if;
 if v_protected>0 then v_blockers:=array_append(v_blockers,'Protected return/count/transfer history exists'); end if;
 if v_tx>0 then v_blockers:=array_append(v_blockers,'Transactional stock movement history exists'); end if;
 return jsonb_build_object('deletable',(v_sales=0 and v_purchases=0 and v_protected=0 and v_tx=0),'current_stock',coalesce(v_stock,0),'sale_references',v_sales,'purchase_references',v_purchases,'protected_references',v_protected+v_tx,'blockers',to_jsonb(v_blockers));
end;$$;
grant execute on function public.admin_product_cleanup_check(uuid) to authenticated;

create or replace function public.admin_delete_test_product(p_product_id uuid,p_confirmation text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_shop uuid;v_check jsonb;v_name text;v_barcode text;
begin
 v_shop:=public.assert_shop_access();perform public.assert_admin();
 if p_confirmation is distinct from 'DELETE' then raise exception 'Type DELETE to confirm'; end if;
 select product_name,barcode into v_name,v_barcode from public.products where id=p_product_id and shop_id=v_shop for update;
 if not found then raise exception 'Product not found'; end if;
 v_check:=public.admin_product_cleanup_check(p_product_id);
 if coalesce((v_check->>'deletable')::boolean,false)=false then raise exception 'Hard delete blocked: transactional/protected history exists'; end if;
 perform public.write_audit(v_shop,'ADMIN_TEST_PRODUCT_PURGED','product',p_product_id::text,jsonb_build_object('product_name',v_name,'barcode',v_barcode),null,v_check);
 delete from public.inventory_fifo_allocations where shop_id=v_shop and product_id=p_product_id;
 delete from public.product_aliases where shop_id=v_shop and product_id=p_product_id;
 delete from public.inventory_receipt_lots where shop_id=v_shop and product_id=p_product_id and purchase_item_id is null;
 delete from public.stock_movements where shop_id=v_shop and product_id=p_product_id and movement_type in('OPENING_STOCK','DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION','STOCK_COUNT');
 delete from public.inventory where shop_id=v_shop and product_id=p_product_id;
 delete from public.products where id=p_product_id and shop_id=v_shop;
 return jsonb_build_object('ok',true,'message','Test product permanently deleted. Its barcode can now be reused.','product_name',v_name,'barcode',v_barcode);
end;$$;
grant execute on function public.admin_delete_test_product(uuid,text) to authenticated;
