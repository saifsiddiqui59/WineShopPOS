begin;

insert into public.saas_runtime_settings(setting_key,setting_value)
values
  ('client_audit_enabled','false'::jsonb),
  ('customer_import_enabled','false'::jsonb)
on conflict(setting_key) do nothing;

create index if not exists idx_onboarding_import_batches_shop_created
  on public.onboarding_import_batches(shop_id, created_at desc);

create unique index if not exists uq_onboarding_import_source_once
  on public.onboarding_import_batches(shop_id, import_type, source_hash)
  where source_hash is not null and status='APPLIED';

create or replace function public.onboarding_apply_import(
  p_import_type text,
  p_rows jsonb,
  p_duplicate_policy text default 'SKIP',
  p_source_name text default null,
  p_source_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path=public,auth,extensions
as $$
declare
  v_shop uuid;
  v_validation jsonb;
  v_type text:=upper(trim(coalesce(p_import_type,'')));
  v_policy text:=upper(trim(coalesce(p_duplicate_policy,'SKIP')));
  v_batch uuid;
  v_payload_hash text;
  v_row jsonb;
  v_product uuid;
  v_category uuid;
  v_existing uuid;
  v_before integer;
  v_after integer;
  v_opening integer;
  v_applied integer:=0;
  v_skipped integer:=0;
  v_name text;
  v_barcode text;
  v_mobile text;
  v_norm text;
  v_source_hash text:=nullif(lower(trim(coalesce(p_source_hash,''))), '');
  v_existing_product public.products%rowtype;
  v_existing_supplier public.suppliers%rowtype;
  v_existing_customer public.customers%rowtype;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  perform pg_advisory_xact_lock(hashtext(v_shop::text || ':onboarding_import'));

  if v_source_hash is not null and v_source_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'SOURCE_HASH_MUST_BE_SHA256_HEX';
  end if;

  v_validation:=public.onboarding_validate_import(v_type,p_rows,v_policy);
  if coalesce((v_validation->>'ok')::boolean,false) is not true then
    return v_validation||jsonb_build_object('applied',false);
  end if;

  if v_source_hash is not null and exists(
    select 1 from public.onboarding_import_batches b
    where b.shop_id=v_shop
      and b.import_type=v_type
      and b.source_hash=v_source_hash
      and b.status='APPLIED'
  ) then
    return jsonb_build_object(
      'ok',false,
      'applied',false,
      'error_code','DUPLICATE_FILE_ALREADY_IMPORTED',
      'message','This exact file was already imported for this shop.'
    );
  end if;

  v_payload_hash:=encode(extensions.digest(convert_to(p_rows::text,'UTF8'),'sha256'),'hex');

  insert into public.onboarding_import_batches(
    shop_id,import_type,source_name,source_hash,payload_hash,duplicate_policy,rows_total,created_by
  )
  values(
    v_shop,v_type,left(nullif(trim(p_source_name),''),255),v_source_hash,
    v_payload_hash,v_policy,jsonb_array_length(p_rows),auth.uid()
  )
  returning id into v_batch;

  if v_type='PRODUCTS_STOCK' then
    for v_row in select value from jsonb_array_elements(p_rows)
    loop
      v_name:=btrim(v_row->>'product_name');
      v_barcode:=nullif(btrim(v_row->>'barcode'),'');
      v_existing:=null;
      v_existing_product:=null;

      if v_barcode is not null then
        select * into v_existing_product
        from public.products
        where shop_id=v_shop and barcode=v_barcode
        limit 1;
        if found then v_existing:=v_existing_product.id; end if;
      end if;

      if v_existing is not null and v_policy='SKIP' then
        v_skipped:=v_skipped+1;
        continue;
      end if;

      v_category:=null;
      if nullif(btrim(v_row->>'category'),'') is not null then
        select id into v_category
        from public.categories
        where shop_id=v_shop
          and lower(name)=lower(btrim(v_row->>'category'))
        order by created_at asc
        limit 1;

        if v_category is null then
          insert into public.categories(shop_id,name,active)
          values(v_shop,btrim(v_row->>'category'),true)
          returning id into v_category;
        end if;
      elsif v_existing is not null then
        v_category:=v_existing_product.category_id;
      end if;

      if v_existing is null then
        insert into public.products(
          shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,
          alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,
          units_per_case,active,created_by
        )
        values(
          v_shop,v_barcode,'AUTO',v_name,
          nullif(btrim(v_row->>'brand'),''),
          v_category,
          nullif(btrim(v_row->>'subcategory'),''),
          public.v4_try_integer(v_row->>'size_ml'),
          public.v4_try_numeric(v_row->>'alcohol_percentage'),
          coalesce(public.v4_try_numeric(v_row->>'purchase_price'),0),
          coalesce(public.v4_try_numeric(v_row->>'mrp'),0),
          coalesce(public.v4_try_numeric(v_row->>'selling_price'),0),
          greatest(coalesce(public.v4_try_integer(v_row->>'minimum_stock'),5),0),
          greatest(coalesce(public.v4_try_integer(v_row->>'units_per_case'),1),1),
          true,auth.uid()
        )
        returning id into v_product;

        insert into public.inventory(shop_id,product_id,quantity)
        values(v_shop,v_product,0)
        on conflict(shop_id,product_id) do nothing;
      else
        v_product:=v_existing;

        update public.products p
        set
          product_name=v_name,
          brand=case when nullif(btrim(v_row->>'brand'),'') is null then p.brand else btrim(v_row->>'brand') end,
          category_id=coalesce(v_category,p.category_id),
          subcategory=case when nullif(btrim(v_row->>'subcategory'),'') is null then p.subcategory else btrim(v_row->>'subcategory') end,
          size_ml=coalesce(public.v4_try_integer(v_row->>'size_ml'),p.size_ml),
          alcohol_percentage=case when nullif(btrim(v_row->>'alcohol_percentage'),'') is null then p.alcohol_percentage else public.v4_try_numeric(v_row->>'alcohol_percentage') end,
          purchase_price=case when nullif(btrim(v_row->>'purchase_price'),'') is null then p.purchase_price else public.v4_try_numeric(v_row->>'purchase_price') end,
          mrp=case when nullif(btrim(v_row->>'mrp'),'') is null then p.mrp else public.v4_try_numeric(v_row->>'mrp') end,
          selling_price=case when nullif(btrim(v_row->>'selling_price'),'') is null then p.selling_price else public.v4_try_numeric(v_row->>'selling_price') end,
          minimum_stock=case when nullif(btrim(v_row->>'minimum_stock'),'') is null then p.minimum_stock else greatest(public.v4_try_integer(v_row->>'minimum_stock'),0) end,
          units_per_case=case when nullif(btrim(v_row->>'units_per_case'),'') is null then p.units_per_case else greatest(public.v4_try_integer(v_row->>'units_per_case'),1) end,
          active=true,
          updated_at=now()
        where p.id=v_product and p.shop_id=v_shop;
      end if;

      if v_row ? 'opening_stock' and nullif(btrim(v_row->>'opening_stock'),'') is not null then
        if exists(select 1 from public.sales where shop_id=v_shop and status='COMPLETED') then
          raise exception 'OPENING_STOCK_LOCKED_AFTER_FIRST_COMPLETED_SALE';
        end if;

        v_opening:=public.v4_try_integer(v_row->>'opening_stock');

        select quantity into v_before
        from public.inventory
        where shop_id=v_shop and product_id=v_product
        for update;

        v_before:=coalesce(v_before,0);
        v_after:=coalesce(v_opening,0);

        if v_before<>0 and v_before<>v_after then
          raise exception 'Opening stock changed after validation for product %; import cancelled',v_name;
        end if;

        update public.inventory
        set quantity=v_after,updated_at=now()
        where shop_id=v_shop and product_id=v_product;

        if v_after<>v_before then
          insert into public.stock_movements(
            shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,
            reference_type,reference_id,reason,created_by
          )
          values(
            v_shop,v_product,'OPENING_STOCK',v_after-v_before,v_before,v_after,
            'ONBOARDING_IMPORT',v_batch,'Existing-shop opening stock import',auth.uid()
          );
        end if;
      end if;

      v_applied:=v_applied+1;
    end loop;

  elsif v_type='SUPPLIERS' then
    for v_row in select value from jsonb_array_elements(p_rows)
    loop
      v_name:=btrim(v_row->>'supplier_name');
      v_norm:=regexp_replace(lower(v_name),'[^a-z0-9]+','','g');
      v_existing:=null;
      v_existing_supplier:=null;

      select * into v_existing_supplier
      from public.suppliers
      where shop_id=v_shop
        and regexp_replace(lower(coalesce(supplier_name,'')),'[^a-z0-9]+','','g')=v_norm
      limit 1;
      if found then v_existing:=v_existing_supplier.id; end if;

      if v_existing is not null and v_policy='SKIP' then
        v_skipped:=v_skipped+1;
        continue;
      end if;

      if v_existing is null then
        insert into public.suppliers(
          shop_id,supplier_name,contact_person,mobile,email,gst_number,address,active
        )
        values(
          v_shop,v_name,
          nullif(btrim(v_row->>'contact_person'),''),
          nullif(btrim(v_row->>'mobile'),''),
          nullif(btrim(v_row->>'email'),''),
          nullif(btrim(v_row->>'gst_number'),''),
          nullif(btrim(v_row->>'address'),''),true
        );
      else
        update public.suppliers s
        set
          supplier_name=v_name,
          contact_person=coalesce(nullif(btrim(v_row->>'contact_person'),''),s.contact_person),
          mobile=coalesce(nullif(btrim(v_row->>'mobile'),''),s.mobile),
          email=coalesce(nullif(btrim(v_row->>'email'),''),s.email),
          gst_number=coalesce(nullif(btrim(v_row->>'gst_number'),''),s.gst_number),
          address=coalesce(nullif(btrim(v_row->>'address'),''),s.address),
          active=true,
          updated_at=now()
        where s.id=v_existing and s.shop_id=v_shop;
      end if;

      v_applied:=v_applied+1;
    end loop;

  else
    for v_row in select value from jsonb_array_elements(p_rows)
    loop
      v_name:=btrim(v_row->>'full_name');
      v_mobile:=nullif(btrim(v_row->>'mobile'),'');
      v_existing:=null;
      v_existing_customer:=null;

      if v_mobile is not null then
        select * into v_existing_customer
        from public.customers
        where shop_id=v_shop and mobile=v_mobile
        limit 1;
        if found then v_existing:=v_existing_customer.id; end if;
      end if;

      if v_existing is not null and v_policy='SKIP' then
        v_skipped:=v_skipped+1;
        continue;
      end if;

      if v_existing is null then
        insert into public.customers(shop_id,full_name,mobile,email,notes,active,created_by)
        values(
          v_shop,v_name,v_mobile,
          nullif(btrim(v_row->>'email'),''),
          nullif(btrim(v_row->>'notes'),''),true,auth.uid()
        );
      else
        update public.customers c
        set
          full_name=v_name,
          email=coalesce(nullif(btrim(v_row->>'email'),''),c.email),
          notes=coalesce(nullif(btrim(v_row->>'notes'),''),c.notes),
          active=true,
          updated_at=now()
        where c.id=v_existing and c.shop_id=v_shop;
      end if;

      v_applied:=v_applied+1;
    end loop;
  end if;

  update public.onboarding_import_batches
  set
    rows_applied=v_applied,
    rows_skipped=v_skipped,
    summary=jsonb_build_object(
      'rows_total',jsonb_array_length(p_rows),
      'rows_applied',v_applied,
      'rows_skipped',v_skipped,
      'payload_hash',v_payload_hash,
      'source_hash',v_source_hash
    )
  where id=v_batch;

  perform public.write_audit(
    v_shop,
    'ONBOARDING_IMPORT_APPLIED',
    'onboarding_import',
    v_batch::text,
    null,
    null,
    jsonb_build_object(
      'import_type',v_type,
      'rows_total',jsonb_array_length(p_rows),
      'rows_applied',v_applied,
      'rows_skipped',v_skipped,
      'source_hash',v_source_hash,
      'payload_hash',v_payload_hash
    )
  );

  return jsonb_build_object(
    'ok',true,
    'applied',true,
    'batch_id',v_batch,
    'rows_total',jsonb_array_length(p_rows),
    'rows_applied',v_applied,
    'rows_skipped',v_skipped,
    'payload_hash',v_payload_hash
  );
end;
$$;

revoke all on function public.onboarding_apply_import(text,jsonb,text,text,text) from public,anon;
grant execute on function public.onboarding_apply_import(text,jsonb,text,text,text) to authenticated;

create or replace function public.my_legal_notice()
returns table(
  enabled boolean,
  document_id uuid,
  document_type text,
  version text,
  title text,
  content text,
  content_sha256 text,
  accepted boolean
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_uid uuid:=auth.uid();
  v_enabled boolean:=false;
  v_doc uuid;
  v_is_demo boolean:=false;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  if public.saas_is_platform_admin(v_uid) then
    return query select false,null::uuid,null::text,null::text,null::text,null::text,null::text,false;
    return;
  end if;

  select exists(
    select 1 from public.saas_demo_accounts where user_id=v_uid and active=true
  ) into v_is_demo;

  if v_is_demo then
    return query select false,null::uuid,null::text,null::text,null::text,null::text,null::text,false;
    return;
  end if;

  select coalesce((setting_value::text)::boolean,false)
  into v_enabled
  from public.saas_runtime_settings
  where setting_key='legal_notice_enabled';

  if not coalesce(v_enabled,false) then
    return query select false,null::uuid,null::text,null::text,null::text,null::text,null::text,false;
    return;
  end if;

  begin
    select nullif(trim(both '"' from setting_value::text),'null')::uuid
    into v_doc
    from public.saas_runtime_settings
    where setting_key='legal_notice_document_id';
  exception when others then
    v_doc:=null;
  end;

  if v_doc is null then
    select id into v_doc
    from public.legal_documents
    where is_active=true
    order by effective_at desc,created_at desc
    limit 1;
  end if;

  if v_doc is null then raise exception 'LEGAL_DOCUMENT_NOT_CONFIGURED'; end if;

  return query
  select
    true,
    d.id,
    d.document_type,
    d.version,
    d.title,
    d.content,
    d.content_sha256,
    exists(
      select 1
      from public.legal_acceptances a
      where a.user_id=v_uid and a.legal_document_id=d.id
    )
  from public.legal_documents d
  where d.id=v_doc and d.is_active=true;
end;
$$;

create or replace function public.accept_legal_notice(
  p_document_id uuid,
  p_device_id uuid default null,
  p_session_id uuid default null,
  p_user_agent text default null,
  p_app_version text default 'V4'
)
returns uuid
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_uid uuid:=auth.uid();
  v_profile public.profiles%rowtype;
  v_context record;
  v_id uuid;
  v_inserted boolean:=false;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_profile from public.profiles where id=v_uid limit 1;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  select * into v_context from public.my_legal_notice() limit 1;
  if not coalesce(v_context.enabled,false) then raise exception 'LEGAL_NOTICE_DISABLED'; end if;
  if v_context.document_id is distinct from p_document_id then raise exception 'LEGAL_DOCUMENT_CHANGED'; end if;

  insert into public.legal_acceptances(
    user_id,shop_id,legal_document_id,email_snapshot,role_snapshot,app_version,
    device_id,session_id,user_agent,acceptance_method
  )
  values(
    v_uid,v_profile.shop_id,p_document_id,v_profile.email,v_profile.role,
    coalesce(nullif(trim(p_app_version),''),'V4'),p_device_id,p_session_id,
    left(nullif(trim(p_user_agent),''),1000),'CHECKBOX_AND_ACCEPT_BUTTON'
  )
  on conflict(user_id,legal_document_id) do nothing
  returning id into v_id;

  if v_id is not null then
    v_inserted:=true;
  else
    select id into v_id
    from public.legal_acceptances
    where user_id=v_uid and legal_document_id=p_document_id;
  end if;

  if v_inserted then
    perform public.write_audit(
      v_profile.shop_id,
      'LEGAL_NOTICE_ACCEPTED',
      'legal_document',
      p_document_id::text,
      null,
      null,
      jsonb_build_object(
        'legal_acceptance_id',v_id,
        'document_sha256',v_context.content_sha256,
        'document_version',v_context.version,
        'app_version',coalesce(nullif(trim(p_app_version),''),'V4'),
        'device_id',p_device_id,
        'session_id',p_session_id
      )
    );
  end if;

  return v_id;
end;
$$;

revoke all on function public.my_legal_notice() from public,anon;
revoke all on function public.accept_legal_notice(uuid,uuid,uuid,text,text) from public,anon;
grant execute on function public.my_legal_notice() to authenticated;
grant execute on function public.accept_legal_notice(uuid,uuid,uuid,text,text) to authenticated;

do $$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime')
     and not exists(
       select 1
       from pg_publication_rel pr
       join pg_publication p on p.oid=pr.prpubid
       where p.pubname='supabase_realtime'
         and pr.prrelid='public.inventory'::regclass
     )
  then
    alter publication supabase_realtime add table public.inventory;
  end if;
end $$;

commit;
