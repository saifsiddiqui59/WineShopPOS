-- WineShopPOS V3-01 API Automation Integration
-- Additive invoice evidence / Inbox layer. Existing purchases remain final stock transactions.
create extension if not exists pgcrypto;

create table if not exists public.invoice_ingestion_channels (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  channel text not null check (channel in ('EMAIL','WHATSAPP')),
  identity text not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_invoice_ingestion_channel_identity
  on public.invoice_ingestion_channels(channel, lower(identity));
drop trigger if exists trg_invoice_ingestion_channels_updated_at on public.invoice_ingestion_channels;
create trigger trg_invoice_ingestion_channels_updated_at before update on public.invoice_ingestion_channels
for each row execute function public.set_updated_at();

create table if not exists public.invoice_ingestions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_id uuid references public.purchases(id) on delete set null,
  source text not null check (source in ('MANUAL','EMAIL','WHATSAPP')),
  source_message_id text,
  source_identity text,
  original_file_name text not null,
  stored_file_name text not null,
  blob_container text not null,
  blob_path text not null,
  content_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  sha256 text,
  received_at timestamptz not null default now(),
  ocr_status text not null default 'STORED' check (ocr_status in ('STORED','PROCESSING','SUCCEEDED','FAILED')),
  review_status text not null default 'NEEDS_REVIEW' check (review_status in (
    'NEEDS_REVIEW','READY_TO_RECEIVE','POSSIBLE_DUPLICATE','DUPLICATE','RECEIVED','OCR_FAILED','FAILED'
  )),
  extracted_supplier_name text,
  extracted_invoice_number text,
  extracted_invoice_date text,
  extracted_total numeric(14,2),
  normalized_invoice jsonb,
  possible_duplicate_purchase_id uuid references public.purchases(id) on delete set null,
  duplicate_resolution text,
  duplicate_resolved_by uuid references auth.users(id) on delete set null,
  duplicate_resolved_at timestamptz,
  processing_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(shop_id, blob_path)
);
create index if not exists idx_invoice_ingestions_shop_received on public.invoice_ingestions(shop_id, received_at desc);
create index if not exists idx_invoice_ingestions_shop_status on public.invoice_ingestions(shop_id, review_status, received_at desc);
create index if not exists idx_invoice_ingestions_shop_invoice on public.invoice_ingestions(shop_id, extracted_invoice_number) where extracted_invoice_number is not null;
create index if not exists idx_invoice_ingestions_shop_hash on public.invoice_ingestions(shop_id, sha256) where sha256 is not null;
create unique index if not exists uq_invoice_ingestions_source_attachment
  on public.invoice_ingestions(shop_id, source, source_message_id, original_file_name)
  where source_message_id is not null;
drop trigger if exists trg_invoice_ingestions_updated_at on public.invoice_ingestions;
create trigger trg_invoice_ingestions_updated_at before update on public.invoice_ingestions
for each row execute function public.set_updated_at();

alter table public.invoice_ingestion_channels enable row level security;
alter table public.invoice_ingestions enable row level security;

drop policy if exists invoice_ingestion_channels_read on public.invoice_ingestion_channels;
create policy invoice_ingestion_channels_read on public.invoice_ingestion_channels for select using (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestion_channels.shop_id and m.active=true and m.role in ('ADMIN','MANAGER'))
);
drop policy if exists invoice_ingestion_channels_admin_write on public.invoice_ingestion_channels;
create policy invoice_ingestion_channels_admin_write on public.invoice_ingestion_channels for all using (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestion_channels.shop_id and m.active=true and m.role='ADMIN')
) with check (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestion_channels.shop_id and m.active=true and m.role='ADMIN')
);

drop policy if exists invoice_ingestions_manager_read on public.invoice_ingestions;
create policy invoice_ingestions_manager_read on public.invoice_ingestions for select using (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestions.shop_id and m.active=true and m.role in ('ADMIN','MANAGER'))
);
drop policy if exists invoice_ingestions_manager_insert on public.invoice_ingestions;
create policy invoice_ingestions_manager_insert on public.invoice_ingestions for insert with check (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestions.shop_id and m.active=true and m.role in ('ADMIN','MANAGER'))
);
drop policy if exists invoice_ingestions_manager_update on public.invoice_ingestions;
create policy invoice_ingestions_manager_update on public.invoice_ingestions for update using (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestions.shop_id and m.active=true and m.role in ('ADMIN','MANAGER'))
) with check (
  exists(select 1 from public.user_shop_memberships m where m.user_id=auth.uid() and m.shop_id=invoice_ingestions.shop_id and m.active=true and m.role in ('ADMIN','MANAGER'))
);

create or replace function public.invoice_record_ocr_result(
  p_ingestion_id uuid,p_supplier_name text,p_invoice_number text,p_invoice_date text,p_total numeric,p_normalized_invoice jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_shop uuid;v_dup uuid;v_status text:='NEEDS_REVIEW';
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if not exists(select 1 from public.invoice_ingestions i where i.id=p_ingestion_id and i.shop_id=v_shop) then raise exception 'Invoice ingestion not found'; end if;
  if nullif(trim(p_invoice_number),'') is not null then
    select p.id into v_dup from public.purchases p
    where p.shop_id=v_shop and lower(trim(p.invoice_number))=lower(trim(p_invoice_number))
      and (nullif(trim(p_invoice_date),'') is null or p.invoice_date::text=trim(p_invoice_date)
        or (p_total is not null and abs(coalesce(p.total,0)-p_total)<0.01)
        or (nullif(trim(p_supplier_name),'') is not null and lower(regexp_replace(coalesce(p.supplier_name_snapshot,''),'[^a-zA-Z0-9]+','','g'))=lower(regexp_replace(p_supplier_name,'[^a-zA-Z0-9]+','','g'))))
    order by p.created_at desc limit 1;
  end if;
  if v_dup is not null then v_status:='POSSIBLE_DUPLICATE'; end if;
  update public.invoice_ingestions set ocr_status='SUCCEEDED',review_status=v_status,
    extracted_supplier_name=nullif(trim(p_supplier_name),''),extracted_invoice_number=nullif(trim(p_invoice_number),''),
    extracted_invoice_date=nullif(trim(p_invoice_date),''),extracted_total=p_total,normalized_invoice=p_normalized_invoice,
    possible_duplicate_purchase_id=v_dup,processing_error=null where id=p_ingestion_id and shop_id=v_shop;
  return jsonb_build_object('review_status',v_status,'possible_duplicate_purchase_id',v_dup);
end;$$;

create or replace function public.invoice_resolve_duplicate(p_ingestion_id uuid,p_decision text,p_note text default null)
returns text language plpgsql security definer set search_path=public as $$
declare v_shop uuid;v_next text;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  if p_decision not in ('NOT_DUPLICATE','CONFIRMED_DUPLICATE') then raise exception 'Invalid duplicate resolution'; end if;
  v_next:=case when p_decision='NOT_DUPLICATE' then 'NEEDS_REVIEW' else 'DUPLICATE' end;
  update public.invoice_ingestions set review_status=v_next,
    duplicate_resolution=concat(p_decision,case when nullif(trim(p_note),'') is not null then ': '||trim(p_note) else '' end),
    duplicate_resolved_by=auth.uid(),duplicate_resolved_at=now(),
    possible_duplicate_purchase_id=case when p_decision='NOT_DUPLICATE' then null else possible_duplicate_purchase_id end
  where id=p_ingestion_id and shop_id=v_shop and review_status='POSSIBLE_DUPLICATE';
  if not found then raise exception 'Possible duplicate invoice not found'; end if;
  return v_next;
end;$$;

create or replace function public.invoice_assert_receivable(p_ingestion_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_shop uuid;v_status text;v_purchase uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();
  select review_status,purchase_id into v_status,v_purchase from public.invoice_ingestions where id=p_ingestion_id and shop_id=v_shop;
  if v_status is null then raise exception 'Invoice ingestion not found'; end if;
  if v_purchase is not null then raise exception 'Invoice is already linked to a received purchase'; end if;
  if v_status in ('POSSIBLE_DUPLICATE','DUPLICATE','OCR_FAILED','FAILED') then raise exception 'Invoice cannot be received while status is %',v_status; end if;
end;$$;

create or replace function public.invoice_link_purchase(p_ingestion_id uuid,p_purchase_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_shop uuid;
begin
  v_shop:=public.assert_shop_access();perform public.assert_manager_or_admin();perform public.invoice_assert_receivable(p_ingestion_id);
  if not exists(select 1 from public.purchases where id=p_purchase_id and shop_id=v_shop) then raise exception 'Purchase not found in current shop'; end if;
  update public.invoice_ingestions set purchase_id=p_purchase_id,review_status='RECEIVED' where id=p_ingestion_id and shop_id=v_shop;
end;$$;

create or replace function public.block_duplicate_purchase_invoice()
returns trigger language plpgsql set search_path=public as $$
begin
  if nullif(trim(new.invoice_number),'') is not null and exists(
    select 1 from public.purchases p where p.shop_id=new.shop_id and p.supplier_id=new.supplier_id and lower(trim(p.invoice_number))=lower(trim(new.invoice_number))
  ) then
    raise exception using errcode='23505',message='DUPLICATE_PURCHASE_INVOICE: supplier invoice already received for this shop';
  end if;
  return new;
end;$$;
drop trigger if exists trg_block_duplicate_purchase_invoice on public.purchases;
create trigger trg_block_duplicate_purchase_invoice before insert on public.purchases for each row execute function public.block_duplicate_purchase_invoice();

do $$
begin
  if not exists(select 1 from public.shops where id='5c94dbca-9bb5-451e-831a-8cfa42d06013'::uuid) then
    raise exception 'Configured V3 sample shop UUID does not exist';
  end if;
  update public.invoice_ingestion_channels
  set shop_id='5c94dbca-9bb5-451e-831a-8cfa42d06013'::uuid, active=true, notes='V3 sample sender; replace later with real shop Gmail.'
  where channel='EMAIL' and lower(identity)=lower('wineshoppos.sample.shop@gmail.com');
  if not found then
    insert into public.invoice_ingestion_channels(shop_id,channel,identity,active,notes)
    values('5c94dbca-9bb5-451e-831a-8cfa42d06013'::uuid,'EMAIL','wineshoppos.sample.shop@gmail.com',true,'V3 sample sender; replace later with real shop Gmail.');
  end if;
end $$;
