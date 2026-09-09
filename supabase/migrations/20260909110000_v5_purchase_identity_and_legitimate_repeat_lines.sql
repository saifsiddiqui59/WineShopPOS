-- V5_22_PURCHASE_IDENTITY_AND_LEGITIMATE_REPEAT_LINES_20260909
--
-- Allows legitimate repeated Product Master rows while preserving each physical
-- invoice line and independently enforcing hard size/barcode identity at receipt.

create or replace function public.receive_purchase_v2(
  p_supplier_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_items jsonb,
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
  v_shop uuid;
  v_purchase uuid;
  v_purchase_number text;
  v_supplier_name text;
  v_subtotal numeric(14,2):=0;

  v_item jsonb;
  v_product uuid;
  v_product_size numeric;
  v_product_barcode text;
  v_invoice_size numeric;
  v_scanned_barcode text;

  v_quantity integer;
  v_purchase_price numeric;
  v_case_count integer;
  v_units_per_case integer;
  v_loose_bottles integer;

  v_before integer;
  v_after integer;
  v_expiry date;
  v_batch text;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then
    raise exception 'Purchase items required';
  end if;

  select supplier_name
  into v_supplier_name
  from public.suppliers
  where id=p_supplier_id
    and shop_id=v_shop
    and active=true;

  if v_supplier_name is null then
    raise exception 'Invalid supplier';
  end if;

  if nullif(trim(coalesce(p_invoice_number,'')),'') is null then
    raise exception 'Supplier invoice/reference is required';
  end if;

  if exists(
    select 1
    from public.purchases
    where shop_id=v_shop
      and lower(invoice_number)=lower(trim(p_invoice_number))
  ) then
    raise exception 'Supplier invoice already exists';
  end if;

  v_purchase_number:=public.next_purchase_number(v_shop);

  insert into public.purchases(
    shop_id,purchase_number,supplier_id,supplier_name_snapshot,
    invoice_number,invoice_date,status,notes,created_by
  )
  values(
    v_shop,v_purchase_number,p_supplier_id,v_supplier_name,
    trim(p_invoice_number),coalesce(p_invoice_date,current_date),
    'RECEIVED',p_notes,auth.uid()
  )
  returning id into v_purchase;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    begin
      v_product:=(v_item->>'product_id')::uuid;
      v_case_count:=coalesce(nullif(v_item->>'case_count','')::integer,0);
      v_units_per_case:=coalesce(nullif(v_item->>'units_per_case','')::integer,0);
      v_loose_bottles:=coalesce(nullif(v_item->>'loose_bottles','')::integer,0);
      v_quantity:=coalesce(nullif(v_item->>'quantity','')::integer,0);
      v_purchase_price:=coalesce(nullif(v_item->>'purchase_price','')::numeric,0);
      v_invoice_size:=coalesce(nullif(trim(v_item->>'invoice_size_ml'),'')::numeric,0);
    exception when others then
      raise exception 'Invalid purchase line values';
    end;

    if v_case_count<0
       or v_units_per_case<=0
       or v_loose_bottles<0
       or v_quantity<=0
       or v_purchase_price<0 then
      raise exception 'Invalid purchase item';
    end if;

    if v_quantity<>(v_case_count*v_units_per_case+v_loose_bottles) then
      raise exception 'Final bottle quantity must equal Cases × Bottles/Case + Loose Bottles';
    end if;

    select size_ml,barcode
    into v_product_size,v_product_barcode
    from public.products
    where id=v_product
      and shop_id=v_shop
      and active=true;

    if not found then
      raise exception 'Invalid/inactive product';
    end if;

    if v_invoice_size>0
       and coalesce(v_product_size,0)>0
       and abs(v_invoice_size-v_product_size)>5 then
      raise exception
        'Product identity size mismatch: invoice % ml, Product Master % ml',
        round(v_invoice_size),round(v_product_size);
    end if;

    v_scanned_barcode:=nullif(trim(coalesce(v_item->>'scanned_barcode','')),'');

    if v_scanned_barcode is not null
       and nullif(trim(coalesce(v_product_barcode,'')),'') is not null
       and v_scanned_barcode<>trim(v_product_barcode) then
      raise exception
        'Product identity barcode mismatch: scanned %, Product Master %',
        v_scanned_barcode,trim(v_product_barcode);
    end if;

    v_batch:=nullif(trim(coalesce(v_item->>'batch_number','')),'');
    v_expiry:=null;

    if nullif(trim(coalesce(v_item->>'expiry_date','')),'') is not null then
      begin
        v_expiry:=(v_item->>'expiry_date')::date;
      exception when others then
        raise exception 'Invalid expiry date on purchase line';
      end;
    end if;

    insert into public.inventory(shop_id,product_id,quantity)
    values(v_shop,v_product,0)
    on conflict(shop_id,product_id) do nothing;

    select quantity
    into v_before
    from public.inventory
    where shop_id=v_shop
      and product_id=v_product
    for update;

    if v_before is null then
      raise exception 'Inventory row unavailable for purchase product';
    end if;

    v_after:=v_before+v_quantity;

    update public.inventory
    set quantity=v_after
    where shop_id=v_shop
      and product_id=v_product;

    insert into public.purchase_items(
      shop_id,purchase_id,product_id,quantity,purchase_unit,
      case_count,units_per_case,loose_bottles,purchase_price,line_total,
      batch_number,expiry_date
    )
    values(
      v_shop,v_purchase,v_product,v_quantity,
      case when v_case_count>0 then 'CASE' else 'BOTTLE' end,
      v_case_count,v_units_per_case,v_loose_bottles,
      v_purchase_price,round(v_quantity*v_purchase_price,2),
      v_batch,v_expiry
    );

    insert into public.stock_movements(
      shop_id,product_id,movement_type,quantity_change,
      quantity_before,quantity_after,reference_type,reference_id,
      reason,created_by
    )
    values(
      v_shop,v_product,'PURCHASE',v_quantity,
      v_before,v_after,'PURCHASE',v_purchase,
      'Supplier purchase',auth.uid()
    );

    v_subtotal:=v_subtotal+round(v_quantity*v_purchase_price,2);
  end loop;

  update public.purchases
  set subtotal=round(v_subtotal,2),
      total=round(v_subtotal,2)
  where id=v_purchase
    and shop_id=v_shop;

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

  perform public.write_audit(
    v_shop,
    'V5_PURCHASE_IDENTITY_RECEIVED',
    'purchase',
    v_purchase::text,
    null,
    null,
    jsonb_build_object(
      'line_count',jsonb_array_length(p_items),
      'allows_repeated_product_master_lines',true,
      'server_identity_size_guard',true,
      'server_identity_barcode_guard',true
    )
  );

  return v_purchase;
end;
$$;

comment on function public.receive_purchase_v2(
  uuid,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) is
'V5.22 purchase receive: per-line transaction-safe receipt supporting legitimate repeated Product Master rows with invoice-size and scanned-barcode identity guards.';
