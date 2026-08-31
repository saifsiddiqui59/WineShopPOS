-- WineShopPOS V3-01D — Invoice review reliability
-- Additive draft/cancel metadata only. Inventory remains controlled by receive RPCs.

alter table public.invoice_ingestions
  add column if not exists review_draft jsonb,
  add column if not exists review_draft_updated_at timestamptz,
  add column if not exists review_cancel_reason text,
  add column if not exists review_cancelled_at timestamptz,
  add column if not exists review_cancelled_by uuid references auth.users(id) on delete set null;

alter table public.invoice_ingestions
  drop constraint if exists invoice_ingestions_review_status_check;

alter table public.invoice_ingestions
  add constraint invoice_ingestions_review_status_check
  check (review_status in (
    'NEEDS_REVIEW',
    'READY_TO_RECEIVE',
    'POSSIBLE_DUPLICATE',
    'DUPLICATE',
    'RECEIVED',
    'OCR_FAILED',
    'FAILED',
    'CANCELLED'
  ));

create or replace function public.invoice_save_review_draft(
  p_ingestion_id uuid,
  p_review_draft jsonb,
  p_ready boolean default false
)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_status text;
  v_purchase uuid;
  v_next text;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status, purchase_id
    into v_status, v_purchase
  from public.invoice_ingestions
  where id=p_ingestion_id and shop_id=v_shop;

  if v_status is null then
    raise exception 'Invoice ingestion not found';
  end if;
  if v_purchase is not null or v_status='RECEIVED' then
    raise exception 'Received invoice review cannot be changed';
  end if;
  if v_status in ('POSSIBLE_DUPLICATE','DUPLICATE','OCR_FAILED','FAILED','CANCELLED') then
    raise exception 'Invoice review cannot be saved while status is %', v_status;
  end if;
  if p_review_draft is null or jsonb_typeof(p_review_draft) <> 'object' then
    raise exception 'Review draft must be a JSON object';
  end if;

  v_next := case when p_ready then 'READY_TO_RECEIVE' else 'NEEDS_REVIEW' end;

  update public.invoice_ingestions
  set review_draft=p_review_draft,
      review_draft_updated_at=now(),
      review_status=v_next
  where id=p_ingestion_id and shop_id=v_shop;

  return v_next;
end;
$$;

create or replace function public.invoice_cancel_review(
  p_ingestion_id uuid,
  p_reason text default null
)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_status text;
  v_purchase uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status, purchase_id
    into v_status, v_purchase
  from public.invoice_ingestions
  where id=p_ingestion_id and shop_id=v_shop;

  if v_status is null then
    raise exception 'Invoice ingestion not found';
  end if;
  if v_purchase is not null or v_status='RECEIVED' then
    raise exception 'Received invoice cannot be cancelled';
  end if;
  if v_status='DUPLICATE' then
    raise exception 'Confirmed duplicate invoice is already closed';
  end if;

  update public.invoice_ingestions
  set review_status='CANCELLED',
      review_cancel_reason=nullif(trim(p_reason),''),
      review_cancelled_at=now(),
      review_cancelled_by=auth.uid()
  where id=p_ingestion_id and shop_id=v_shop;

  return 'CANCELLED';
end;
$$;

create or replace function public.invoice_reopen_review(
  p_ingestion_id uuid
)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  update public.invoice_ingestions
  set review_status='NEEDS_REVIEW',
      review_cancel_reason=null,
      review_cancelled_at=null,
      review_cancelled_by=null
  where id=p_ingestion_id
    and shop_id=v_shop
    and review_status='CANCELLED'
    and purchase_id is null;

  if not found then
    raise exception 'Cancelled invoice review not found';
  end if;

  return 'NEEDS_REVIEW';
end;
$$;

create or replace function public.invoice_assert_receivable(p_ingestion_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_status text;
  v_purchase uuid;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status,purchase_id
    into v_status,v_purchase
  from public.invoice_ingestions
  where id=p_ingestion_id and shop_id=v_shop;

  if v_status is null then
    raise exception 'Invoice ingestion not found';
  end if;
  if v_purchase is not null then
    raise exception 'Invoice is already linked to a received purchase';
  end if;
  if v_status in ('POSSIBLE_DUPLICATE','DUPLICATE','OCR_FAILED','FAILED','CANCELLED') then
    raise exception 'Invoice cannot be received while status is %',v_status;
  end if;
end;
$$;

grant execute on function public.invoice_save_review_draft(uuid,jsonb,boolean) to authenticated;
grant execute on function public.invoice_cancel_review(uuid,text) to authenticated;
grant execute on function public.invoice_reopen_review(uuid) to authenticated;

comment on column public.invoice_ingestions.review_draft is
  'Server-persisted human OCR/purchase review state. Never mutates inventory.';
