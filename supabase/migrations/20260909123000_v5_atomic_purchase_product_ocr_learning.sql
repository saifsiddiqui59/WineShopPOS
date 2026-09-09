-- V5_23A_ATOMIC_PURCHASE_PRODUCT_CREATION_20260909
--
-- Purchase-originated Product Master creation and missing-barcode assignment
-- share the SAME PostgreSQL transaction as purchase receipt + inventory.
-- Any raised exception rolls back all writes made by this RPC.
--
-- receive_purchase_v2 is intentionally preserved for backward compatibility.

create or replace function public.receive_purchase_v3(
  p_supplier_name text,
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
  v_supplier uuid;
  v_supplier_name text;
  v_requested_supplier_name text;
  v_purchase uuid;
  v_purchase_number text;
  v_subtotal numeric(14,2):=0;

  v_item jsonb;
  v_pending jsonb;
  v_product uuid;
  v_product_name text;
  v_product_size numeric;
  v_product_barcode text;
  v_existing_barcode_product uuid;
  v_invoice_size numeric;
  v_scanned_barcode text;
  v_effective_barcode text;
  v_category uuid;

  v_quantity integer;
  v_purchase_price numeric;
  v_case_count integer;
  v_units_per_case integer;
  v_loose_bottles integer;

  v_before integer;
  v_after integer;
  v_expiry date;
  v_batch text;

  v_created_products integer:=0;
  v_assigned_barcodes integer:=0;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  v_requested_supplier_name:=nullif(trim(coalesce(p_supplier_name,'')),'');
  if v_requested_supplier_name is null then
    raise exception 'Supplier name is required';
  end if;

  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then
    raise exception 'Purchase items required';
  end if;

  if nullif(trim(coalesce(p_invoice_number,'')),'') is null then
    raise exception 'Supplier invoice/reference is required';
  end if;

  select s.id,s.supplier_name
  into v_supplier,v_supplier_name
  from public.suppliers s
  where s.shop_id=v_shop
    and s.active=true
    and lower(trim(s.supplier_name))=lower(v_requested_supplier_name)
  order by s.created_at
  limit 1
  for update;

  if v_supplier is null then
    insert into public.suppliers(shop_id,supplier_name,active)
    values(v_shop,v_requested_supplier_name,true)
    returning id,supplier_name into v_supplier,v_supplier_name;
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
    v_shop,v_purchase_number,v_supplier,v_supplier_name,
    trim(p_invoice_number),coalesce(p_invoice_date,current_date),
    'RECEIVED',p_notes,auth.uid()
  )
  returning id into v_purchase;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_product:=null;
    v_pending:=v_item->'pending_product';

    -- Exactly one product identity mode is required.
    if nullif(trim(coalesce(v_item->>'product_id','')),'') is not null
       and v_pending is not null
       and jsonb_typeof(v_pending)='object'
       and v_pending <> '{}'::jsonb then
      raise exception 'Purchase line cannot contain both existing product_id and pending_product';
    end if;

    if nullif(trim(coalesce(v_item->>'product_id','')),'') is null
       and (v_pending is null or jsonb_typeof(v_pending)<>'object' or v_pending='{}'::jsonb) then
      raise exception 'Purchase line requires existing product_id or pending_product';
    end if;

    begin
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

    v_scanned_barcode:=nullif(trim(coalesce(v_item->>'scanned_barcode','')),'');
    v_effective_barcode:=null;

    if nullif(trim(coalesce(v_item->>'product_id','')),'') is not null then
      begin
        v_product:=(v_item->>'product_id')::uuid;
      exception when others then
        raise exception 'Invalid existing product id';
      end;

      select p.product_name,p.size_ml,p.barcode
      into v_product_name,v_product_size,v_product_barcode
      from public.products p
      where p.id=v_product
        and p.shop_id=v_shop
        and p.active=true
      for update;

      if not found then
        raise exception 'Invalid/inactive product';
      end if;

      -- A known barcode is immutable through Purchase Receiving.
      if v_scanned_barcode is not null
         and nullif(trim(coalesce(v_product_barcode,'')),'') is not null
         and v_scanned_barcode<>trim(v_product_barcode) then
        raise exception
          'Product identity barcode mismatch: scanned %, Product Master %',
          v_scanned_barcode,trim(v_product_barcode);
      end if;

      -- Missing existing master barcode may be assigned, but only inside this
      -- purchase transaction. If any later line/financial step fails it rolls back.
      if v_scanned_barcode is not null
         and nullif(trim(coalesce(v_product_barcode,'')),'') is null then
        select p.id
        into v_existing_barcode_product
        from public.products p
        where p.shop_id=v_shop
          and p.barcode=v_scanned_barcode
          and p.id<>v_product
        limit 1;

        if v_existing_barcode_product is not null then
          raise exception 'Scanned barcode already belongs to another Product Master';
        end if;

        update public.products
        set barcode=v_scanned_barcode,
            updated_at=now()
        where id=v_product
          and shop_id=v_shop;

        v_product_barcode:=v_scanned_barcode;
        v_assigned_barcodes:=v_assigned_barcodes+1;
      end if;
    else
      v_product_name:=nullif(trim(coalesce(v_pending->>'product_name','')),'');
      if v_product_name is null then
        raise exception 'Prepared product name is required';
      end if;

      begin
        v_product_size:=coalesce(nullif(v_pending->>'size_ml','')::integer,0);
        v_units_per_case:=coalesce(nullif(v_pending->>'units_per_case','')::integer,v_units_per_case);
      exception when others then
        raise exception 'Prepared product size/pack is invalid';
      end;

      if v_product_size<=0 then
        raise exception 'Prepared product size must be positive';
      end if;
      if v_units_per_case<=0 then
        raise exception 'Prepared product bottles/case must be positive';
      end if;

      v_effective_barcode:=coalesce(
        nullif(trim(coalesce(v_pending->>'barcode','')),''),
        v_scanned_barcode
      );

      if v_effective_barcode is not null then
        select p.id
        into v_existing_barcode_product
        from public.products p
        where p.shop_id=v_shop
          and p.barcode=v_effective_barcode
        limit 1;

        if v_existing_barcode_product is not null then
          raise exception 'Prepared product barcode already belongs to an existing Product Master';
        end if;
      end if;

      v_category:=null;
      if nullif(trim(coalesce(v_pending->>'category_id','')),'') is not null then
        begin
          v_category:=(v_pending->>'category_id')::uuid;
        exception when others then
          raise exception 'Prepared product category is invalid';
        end;

        if not exists(
          select 1
          from public.categories c
          where c.id=v_category
            and c.shop_id=v_shop
            and c.active=true
        ) then
          raise exception 'Prepared product category does not belong to this shop';
        end if;
      end if;

      insert into public.products(
        shop_id,barcode,sku,product_name,brand,category_id,subcategory,
        size_ml,alcohol_percentage,purchase_price,mrp,selling_price,
        minimum_stock,units_per_case,created_by
      )
      values(
        v_shop,
        v_effective_barcode,
        'AUTO',
        v_product_name,
        nullif(trim(coalesce(v_pending->>'brand','')),''),
        v_category,
        nullif(trim(coalesce(v_pending->>'subcategory','')),''),
        v_product_size,
        null,
        v_purchase_price,
        greatest(coalesce(nullif(v_pending->>'mrp','')::numeric,0),0),
        greatest(coalesce(nullif(v_pending->>'selling_price','')::numeric,0),0),
        greatest(coalesce(nullif(v_pending->>'minimum_stock','')::integer,5),0),
        greatest(v_units_per_case,1),
        auth.uid()
      )
      returning id,barcode into v_product,v_product_barcode;

      insert into public.inventory(shop_id,product_id,quantity)
      values(v_shop,v_product,0)
      on conflict(shop_id,product_id) do nothing;

      v_created_products:=v_created_products+1;

      if nullif(trim(coalesce(v_item->>'source_description','')),'') is not null then
        perform public.remember_product_alias(
          v_product,
          trim(v_item->>'source_description'),
          v_supplier
        );
      end if;
    end if;

    -- Identity checks are repeated server-side independently of React.
    if v_invoice_size>0
       and coalesce(v_product_size,0)>0
       and abs(v_invoice_size-v_product_size)>5 then
      raise exception
        'Product identity size mismatch: invoice % ml, Product Master/prepared Product % ml',
        round(v_invoice_size),round(v_product_size);
    end if;

    if v_scanned_barcode is not null
       and nullif(trim(coalesce(v_product_barcode,'')),'') is not null
       and v_scanned_barcode<>trim(v_product_barcode) then
      raise exception
        'Product identity barcode mismatch: scanned %, Product %',
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
    'V5_ATOMIC_PURCHASE_RECEIVED',
    'purchase',
    v_purchase::text,
    null,
    null,
    jsonb_build_object(
      'line_count',jsonb_array_length(p_items),
      'created_products',v_created_products,
      'assigned_missing_barcodes',v_assigned_barcodes,
      'product_creation_atomic_with_purchase',true,
      'server_identity_size_guard',true,
      'server_identity_barcode_guard',true
    )
  );

  return v_purchase;
end;
$$;

revoke all on function public.receive_purchase_v3(
  text,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) from public,anon;

grant execute on function public.receive_purchase_v3(
  text,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) to authenticated;

comment on function public.receive_purchase_v3(
  text,text,date,jsonb,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric
) is
'V5.23A atomic receive: Purchase-originated new products and missing master barcodes commit only in the successful receipt transaction; failure rolls them back with purchase/inventory.';
