-- V6 ShopAI Multimodal Invoice Judge V1
-- The OCR Edge Function stores an authoritative ShopAI review separately from
-- browser-provided normalized_invoice JSON. Browser clients may read the review
-- but cannot create/change that authoritative copy.

alter table public.invoice_ingestions
  add column if not exists shopai_review jsonb,
  add column if not exists shopai_review_updated_at timestamptz;

comment on column public.invoice_ingestions.shopai_review is
  'Authoritative server-written multimodal ShopAI invoice review. Browser normalized_invoice copy is non-authoritative.';

create or replace function public.guard_invoice_shopai_review_authority()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_jwt_role text:=coalesce(current_setting('request.jwt.claim.role',true),'');
  v_privileged boolean:=false;
begin
  v_privileged:=v_jwt_role='service_role' or current_user in ('postgres','supabase_admin');

  if tg_op='INSERT' then
    if new.shopai_review is not null and not v_privileged then
      raise exception 'SHOPAI_REVIEW_SERVER_ONLY: authoritative ShopAI review can only be written by the server';
    end if;
    return new;
  end if;

  if (
    new.shopai_review is distinct from old.shopai_review
    or new.shopai_review_updated_at is distinct from old.shopai_review_updated_at
  ) and not v_privileged then
    raise exception 'SHOPAI_REVIEW_SERVER_ONLY: authoritative ShopAI review can only be changed by the server';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_invoice_shopai_review_authority
  on public.invoice_ingestions;

create trigger trg_guard_invoice_shopai_review_authority
before insert or update of shopai_review,shopai_review_updated_at
on public.invoice_ingestions
for each row
execute function public.guard_invoice_shopai_review_authority();

create or replace function public.invoice_shopai_owner_gate_ok(
  p_shopai_review jsonb,
  p_review_draft jsonb
)
returns boolean
language plpgsql
immutable
set search_path=public
as $$
declare
  d jsonb;
  decision jsonb;
  v_status text;
  v_recommendation text;
  v_decision text;
  v_reason text;
begin
  -- Legacy invoices created before the multimodal judge remain reviewable.
  -- A normal post-release OCR run always writes a non-null authoritative row.
  if p_shopai_review is null then return true; end if;
  if jsonb_typeof(p_shopai_review)<>'object' then return false; end if;

  v_status:=upper(coalesce(p_shopai_review->>'status',''));
  if v_status='PROCESSING' then return false; end if;

  d:=case
    when p_review_draft->'purchaseDraft' is not null
      and jsonb_typeof(p_review_draft->'purchaseDraft')='object'
    then p_review_draft->'purchaseDraft'
    else p_review_draft
  end;

  if d is null or jsonb_typeof(d)<>'object' then return false; end if;
  decision:=d->'shopAiOwnerDecision';
  if decision is null or jsonb_typeof(decision)<>'object' then return false; end if;

  v_decision:=upper(coalesce(decision->>'decision',''));
  v_reason:=trim(coalesce(decision->>'overrideReason',decision->>'manualReason',''));

  if nullif(trim(coalesce(decision->>'reviewGeneratedAt','')),'') is distinct from
     nullif(trim(coalesce(p_shopai_review->>'generatedAt','')),'') then
    return false;
  end if;

  if v_status='UNAVAILABLE' then
    return v_decision='MANUAL_GO' and length(v_reason)>=4;
  end if;

  if v_status<>'COMPLETED' then return false; end if;
  if v_decision<>'GO' then return false; end if;

  v_recommendation:=upper(coalesce(p_shopai_review->>'recommendation','REVIEW'));
  if v_recommendation='GO' then return true; end if;

  -- The owner may override an advisory REVIEW/NO_GO only with an explicit
  -- audit reason. Existing deterministic date/batch/finance/product gates still
  -- have to pass separately and cannot be bypassed by this override.
  return length(v_reason)>=4;
exception when others then
  return false;
end;
$$;

create or replace function public.invoice_record_ocr_result(
  p_ingestion_id uuid,
  p_supplier_name text,
  p_invoice_number text,
  p_invoice_date text,
  p_total numeric,
  p_normalized_invoice jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_dup uuid;
  v_status text:='NEEDS_REVIEW';
  v_shopai jsonb;
  v_normalized jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select i.shopai_review
    into v_shopai
  from public.invoice_ingestions i
  where i.id=p_ingestion_id and i.shop_id=v_shop;

  if not found then raise exception 'Invoice ingestion not found'; end if;

  v_normalized:=coalesce(p_normalized_invoice,'{}'::jsonb)-'shopAiReview';
  if v_shopai is not null then
    v_normalized:=jsonb_set(v_normalized,'{shopAiReview}',v_shopai,true);
  end if;

  if nullif(trim(p_invoice_number),'') is not null then
    select p.id into v_dup
    from public.purchases p
    where p.shop_id=v_shop
      and lower(trim(p.invoice_number))=lower(trim(p_invoice_number))
      and (
        nullif(trim(p_invoice_date),'') is null
        or p.invoice_date::text=trim(p_invoice_date)
        or (p_total is not null and abs(coalesce(p.total,0)-p_total)<0.01)
        or (
          nullif(trim(p_supplier_name),'') is not null
          and lower(regexp_replace(coalesce(p.supplier_name_snapshot,''),'[^a-zA-Z0-9]+','','g'))
            =lower(regexp_replace(p_supplier_name,'[^a-zA-Z0-9]+','','g'))
        )
      )
    order by p.created_at desc
    limit 1;
  end if;

  if v_dup is not null then v_status:='POSSIBLE_DUPLICATE'; end if;

  update public.invoice_ingestions
  set ocr_status='SUCCEEDED',
      review_status=v_status,
      extracted_supplier_name=nullif(trim(p_supplier_name),''),
      extracted_invoice_number=nullif(trim(p_invoice_number),''),
      extracted_invoice_date=nullif(trim(p_invoice_date),''),
      extracted_total=p_total,
      normalized_invoice=v_normalized,
      possible_duplicate_purchase_id=v_dup,
      processing_error=null
  where id=p_ingestion_id and shop_id=v_shop;

  return jsonb_build_object(
    'review_status',v_status,
    'possible_duplicate_purchase_id',v_dup
  );
end;
$$;

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
  v_shopai jsonb;
  v_next text;
  v_server_ready boolean:=false;
  v_saved_review jsonb;
  v_owner_decision jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status,purchase_id,shopai_review
    into v_status,v_purchase,v_shopai
  from public.invoice_ingestions
  where id=p_ingestion_id and shop_id=v_shop
  for update;

  if v_status is null then raise exception 'Invoice ingestion not found'; end if;
  if v_purchase is not null or v_status='RECEIVED' then
    raise exception 'Received invoice review cannot be changed';
  end if;
  if v_status in ('POSSIBLE_DUPLICATE','DUPLICATE','OCR_FAILED','FAILED','CANCELLED') then
    raise exception 'Invoice review cannot be saved while status is %',v_status;
  end if;
  if p_review_draft is null or jsonb_typeof(p_review_draft)<>'object' then
    raise exception 'Review draft must be a JSON object';
  end if;

  v_saved_review:=p_review_draft;
  v_owner_decision:=case
    when p_review_draft->'purchaseDraft'->'shopAiOwnerDecision' is not null
      then p_review_draft->'purchaseDraft'->'shopAiOwnerDecision'
    else p_review_draft->'shopAiOwnerDecision'
  end;

  if v_owner_decision is not null and jsonb_typeof(v_owner_decision)='object' then
    v_saved_review:=jsonb_set(
      v_saved_review,
      '{shopAiOwnerAudit}',
      jsonb_build_object(
        'decision',coalesce(v_owner_decision->>'decision',''),
        'recommendation',coalesce(v_owner_decision->>'recommendation',''),
        'recordedBy',auth.uid(),
        'recordedAt',now()
      ),
      true
    );
  end if;

  if p_ready then
    v_server_ready:=public.invoice_review_draft_ready_v2(v_saved_review);
    if not v_server_ready then
      raise exception 'Invoice is not server-ready: resolve date, line, batch and financial review before receiving';
    end if;
    if not public.invoice_shopai_owner_gate_ok(v_shopai,v_saved_review) then
      raise exception 'SHOPAI_OWNER_REVIEW_REQUIRED: review ShopAI, resolve required fields, and record Owner GO before receiving';
    end if;
  end if;

  v_next:=case when p_ready and v_server_ready then 'READY_TO_RECEIVE' else 'NEEDS_REVIEW' end;

  update public.invoice_ingestions
  set review_draft=v_saved_review,
      review_draft_updated_at=now(),
      review_status=v_next
  where id=p_ingestion_id and shop_id=v_shop;

  return v_next;
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
  v_review jsonb;
  v_shopai jsonb;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status,purchase_id,review_draft,shopai_review
    into v_status,v_purchase,v_review,v_shopai
  from public.invoice_ingestions
  where id=p_ingestion_id and shop_id=v_shop
  for update;

  if v_status is null then raise exception 'Invoice ingestion not found'; end if;
  if v_purchase is not null then raise exception 'Invoice is already linked to a received purchase'; end if;
  if v_status<>'READY_TO_RECEIVE' then
    raise exception 'Invoice cannot be received while status is %',v_status;
  end if;
  if not public.invoice_review_draft_ready_v2(v_review) then
    raise exception 'Invoice server readiness validation failed';
  end if;
  if not public.invoice_shopai_owner_gate_ok(v_shopai,v_review) then
    raise exception 'SHOPAI_OWNER_REVIEW_REQUIRED: authoritative ShopAI owner gate failed';
  end if;
end;
$$;
