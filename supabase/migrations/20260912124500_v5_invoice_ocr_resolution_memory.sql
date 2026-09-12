-- V5 low-cost OCR exception learning.
-- Direct table access is denied. Access is via authenticated RPC only.
-- No inventory, purchase, or Product Master row is changed by this migration.

create table if not exists public.invoice_ocr_field_aliases (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  supplier_key text not null,
  field_scope text not null check (field_scope in ('HEADER','FINANCE','LINE_ITEM')),
  canonical_field text not null check (
    canonical_field in (
      'supplier_name','invoice_number','invoice_date',
      'cash_discount','invoice_discount','freight','transport','handling',
      'loading_unloading','fees','tcs','other_addition','rounding','invoice_total',
      'description','case_count','rate_per_case','amount'
    )
  ),
  raw_label text not null,
  normalized_label text not null,
  status text not null default 'CONFIRMED'
    check (status in ('CONFIRMED','REJECTED')),
  confirmations integer not null default 1 check (confirmations >= 0),
  hit_count integer not null default 0 check (hit_count >= 0),
  source text not null default 'HUMAN_CONFIRMED_AI',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,
  unique(shop_id,supplier_key,field_scope,normalized_label)
);

create index if not exists invoice_ocr_field_aliases_lookup_idx
  on public.invoice_ocr_field_aliases(
    shop_id,supplier_key,normalized_label,status
  );

create table if not exists public.invoice_ocr_resolution_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  ingestion_id uuid references public.invoice_ingestions(id) on delete cascade,
  supplier_key text not null default '',
  field_scope text not null,
  canonical_field text,
  target_id text,
  raw_label text,
  raw_value text,
  resolution_source text not null,
  outcome text not null,
  detail jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists invoice_ocr_resolution_events_recent_idx
  on public.invoice_ocr_resolution_events(shop_id,created_at desc);

alter table public.invoice_ocr_field_aliases enable row level security;
alter table public.invoice_ocr_resolution_events enable row level security;
revoke all on public.invoice_ocr_field_aliases from anon,authenticated;
revoke all on public.invoice_ocr_resolution_events from anon,authenticated;

create or replace function public.invoice_ocr_assert_ingestion_manager(
  p_ingestion_id uuid
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
begin
  select i.shop_id into v_shop
  from public.invoice_ingestions i
  where i.id=p_ingestion_id;

  if v_shop is null then
    raise exception 'Invoice ingestion not found';
  end if;

  if not exists (
    select 1
    from public.user_shop_memberships m
    where m.user_id=auth.uid()
      and m.shop_id=v_shop
      and m.active=true
      and m.role in ('ADMIN','MANAGER')
  ) then
    raise exception 'Manager or Admin access required for this invoice';
  end if;

  return v_shop;
end;
$$;

create or replace function public.invoice_ocr_normalize_key(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    lower(regexp_replace(trim(coalesce(p_value,'')),'[^a-zA-Z0-9]+',' ','g')),
    '\s+',' ','g'
  );
$$;

create or replace function public.invoice_ocr_resolve_aliases(
  p_ingestion_id uuid,
  p_supplier_name text,
  p_labels jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_supplier_key text;
  v_result jsonb;
begin
  v_shop:=public.invoice_ocr_assert_ingestion_manager(p_ingestion_id);
  v_supplier_key:=public.invoice_ocr_normalize_key(p_supplier_name);

  if v_supplier_key=''
     or jsonb_typeof(coalesce(p_labels,'[]'::jsonb))<>'array'
  then
    return '[]'::jsonb;
  end if;

  with requested as (
    select distinct public.invoice_ocr_normalize_key(e.value #>> '{}') as normalized_label
    from jsonb_array_elements(coalesce(p_labels,'[]'::jsonb)) as e(value)
    where jsonb_typeof(e.value)='string'
  ),
  matched as (
    select a.id
    from public.invoice_ocr_field_aliases a
    join requested r on r.normalized_label=a.normalized_label
    where a.shop_id=v_shop
      and a.supplier_key=v_supplier_key
      and a.status='CONFIRMED'
  ),
  touched as (
    update public.invoice_ocr_field_aliases a
    set hit_count=a.hit_count+1,
        last_seen_at=now(),
        updated_at=now()
    where a.id in (select id from matched)
    returning a.*
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',id,
        'fieldScope',field_scope,
        'canonicalField',canonical_field,
        'rawLabel',raw_label,
        'normalizedLabel',normalized_label,
        'confirmations',confirmations,
        'hitCount',hit_count
      )
      order by confirmations desc,hit_count desc,created_at
    ),
    '[]'::jsonb
  )
  into v_result
  from touched;

  return coalesce(v_result,'[]'::jsonb);
end;
$$;

create or replace function public.invoice_ocr_log_events(
  p_ingestion_id uuid,
  p_supplier_name text,
  p_events jsonb
)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_supplier_key text;
  v_event jsonb;
  v_count integer:=0;
begin
  v_shop:=public.invoice_ocr_assert_ingestion_manager(p_ingestion_id);
  v_supplier_key:=public.invoice_ocr_normalize_key(p_supplier_name);

  if jsonb_typeof(coalesce(p_events,'[]'::jsonb))<>'array' then
    return 0;
  end if;

  for v_event in
    select e.value from jsonb_array_elements(p_events) as e(value)
  loop
    if v_count>=40 then exit; end if;

    insert into public.invoice_ocr_resolution_events(
      shop_id,ingestion_id,supplier_key,field_scope,canonical_field,target_id,
      raw_label,raw_value,resolution_source,outcome,detail,created_by
    ) values (
      v_shop,
      p_ingestion_id,
      v_supplier_key,
      left(coalesce(v_event->>'fieldScope','UNKNOWN'),32),
      nullif(left(coalesce(v_event->>'canonicalField',''),64),''),
      nullif(left(coalesce(v_event->>'targetId',''),160),''),
      nullif(left(coalesce(v_event->>'rawLabel',''),180),''),
      nullif(left(coalesce(v_event->>'rawValue',''),180),''),
      left(coalesce(v_event->>'source','SYSTEM'),40),
      left(coalesce(v_event->>'outcome','OBSERVED'),40),
      coalesce(v_event->'detail','{}'::jsonb),
      auth.uid()
    );
    v_count:=v_count+1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.invoice_ocr_record_review(
  p_ingestion_id uuid,
  p_supplier_name text,
  p_mappings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_supplier_key text;
  v_original_supplier text;
  v_mapping jsonb;
  v_scope text;
  v_field text;
  v_label text;
  v_normalized text;
  v_outcome text;
  v_source text;
  v_confirmed integer:=0;
  v_overridden integer:=0;
begin
  v_shop:=public.invoice_ocr_assert_ingestion_manager(p_ingestion_id);

  select nullif(trim(i.extracted_supplier_name),'')
    into v_original_supplier
  from public.invoice_ingestions i
  where i.id=p_ingestion_id;

  v_supplier_key:=public.invoice_ocr_normalize_key(
    coalesce(v_original_supplier,p_supplier_name)
  );

  if jsonb_typeof(coalesce(p_mappings,'[]'::jsonb))<>'array' then
    return jsonb_build_object('confirmed',0,'overridden',0);
  end if;

  for v_mapping in
    select e.value from jsonb_array_elements(p_mappings) as e(value)
  loop
    v_scope:=upper(coalesce(v_mapping->>'fieldScope',''));
    v_field:=lower(coalesce(v_mapping->>'canonicalField',''));
    v_label:=trim(coalesce(v_mapping->>'rawLabel',''));
    v_normalized:=public.invoice_ocr_normalize_key(v_label);
    v_outcome:=upper(coalesce(v_mapping->>'outcome','UNCONFIRMED'));
    v_source:=upper(coalesce(v_mapping->>'source','AI'));

    insert into public.invoice_ocr_resolution_events(
      shop_id,ingestion_id,supplier_key,field_scope,canonical_field,target_id,
      raw_label,raw_value,resolution_source,outcome,detail,created_by
    ) values (
      v_shop,p_ingestion_id,v_supplier_key,
      left(coalesce(v_scope,'UNKNOWN'),32),
      nullif(left(v_field,64),''),
      nullif(left(coalesce(v_mapping->>'targetId',''),160),''),
      nullif(left(v_label,180),''),
      nullif(left(coalesce(v_mapping->>'rawValue',''),180),''),
      left(v_source,40),
      left(v_outcome,40),
      jsonb_build_object(
        'evidence_id',v_mapping->>'evidenceId',
        'applied',coalesce((v_mapping->>'applied')::boolean,false)
      ),
      auth.uid()
    );

    if v_outcome='CONFIRMED'
       and v_supplier_key<>''
       and length(v_normalized)>=2
       and v_scope in ('HEADER','FINANCE','LINE_ITEM')
       and v_field in (
         'supplier_name','invoice_number','invoice_date',
         'cash_discount','invoice_discount','freight','transport','handling',
         'loading_unloading','fees','tcs','other_addition','rounding','invoice_total',
         'description','case_count','rate_per_case','amount'
       )
       and not (
         v_field='invoice_total'
         and v_normalized in ('total','amount','net')
       )
    then
      insert into public.invoice_ocr_field_aliases(
        shop_id,supplier_key,field_scope,canonical_field,
        raw_label,normalized_label,status,confirmations,hit_count,
        source,created_by,updated_by,last_seen_at
      ) values (
        v_shop,v_supplier_key,v_scope,v_field,
        v_label,v_normalized,'CONFIRMED',1,0,
        case when v_source='AI' then 'HUMAN_CONFIRMED_AI'
             when v_source='MEMORY' then 'HUMAN_RECONFIRMED_MEMORY'
             else 'HUMAN_CONFIRMED'
        end,
        auth.uid(),auth.uid(),now()
      )
      on conflict(shop_id,supplier_key,field_scope,normalized_label)
      do update set
        canonical_field=excluded.canonical_field,
        raw_label=excluded.raw_label,
        status='CONFIRMED',
        confirmations=public.invoice_ocr_field_aliases.confirmations+1,
        source=excluded.source,
        updated_by=auth.uid(),
        updated_at=now(),
        last_seen_at=now();

      v_confirmed:=v_confirmed+1;
    elsif v_outcome='OVERRIDDEN' then
      -- A human override of a remembered mapping must disable that alias.
      -- Otherwise the same bad memory would silently auto-apply forever.
      update public.invoice_ocr_field_aliases
      set status='REJECTED',
          updated_by=auth.uid(),
          updated_at=now(),
          last_seen_at=now()
      where shop_id=v_shop
        and supplier_key=v_supplier_key
        and field_scope=v_scope
        and canonical_field=v_field
        and normalized_label=v_normalized;

      v_overridden:=v_overridden+1;
    end if;
  end loop;

  perform public.write_audit(
    v_shop,
    'INVOICE_OCR_MAPPING_REVIEWED',
    'invoice_ingestion',
    p_ingestion_id::text,
    null,
    jsonb_build_object(
      'supplier_key',v_supplier_key,
      'confirmed',v_confirmed,
      'overridden',v_overridden
    ),
    jsonb_build_object(
      'inventory_changed',false,
      'purchase_changed',false,
      'mapping_memory_changed',v_confirmed>0
    )
  );

  return jsonb_build_object(
    'confirmed',v_confirmed,
    'overridden',v_overridden
  );
end;
$$;

revoke all on function public.invoice_ocr_assert_ingestion_manager(uuid) from public;
revoke all on function public.invoice_ocr_normalize_key(text) from public;
revoke all on function public.invoice_ocr_resolve_aliases(uuid,text,jsonb) from public;
revoke all on function public.invoice_ocr_log_events(uuid,text,jsonb) from public;
revoke all on function public.invoice_ocr_record_review(uuid,text,jsonb) from public;

grant execute on function public.invoice_ocr_resolve_aliases(uuid,text,jsonb)
  to authenticated;
grant execute on function public.invoice_ocr_log_events(uuid,text,jsonb)
  to authenticated;
grant execute on function public.invoice_ocr_record_review(uuid,text,jsonb)
  to authenticated;
