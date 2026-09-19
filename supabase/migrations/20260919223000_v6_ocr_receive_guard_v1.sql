-- V6 OCR SAFETY ARCHITECTURE V1
-- Server re-computes readiness; client p_ready is never authoritative by itself.
-- OCR-linked receive validates review, receives stock, and links the ingestion
-- in one PostgreSQL transaction.

create or replace function public.invoice_review_draft_ready_v2(p_review_draft jsonb)
returns boolean
language plpgsql
immutable
set search_path=public
as $$
declare
  d jsonb;
  rows jsonb;
  row jsonb;
  charges jsonb;
  finance jsonb;
  invoice_date_text text;
  parsed_date date;
  has_existing boolean;
  has_pending boolean;
  cases_n numeric;
  units_n numeric;
  loose_n numeric;
  qty_n numeric;
  line_amount numeric;
  purchase_price numeric;
  product_value numeric:=0;
  calculated numeric:=0;
  printed numeric;
begin
  if p_review_draft is null or jsonb_typeof(p_review_draft)<>'object' then return false; end if;
  if coalesce(p_review_draft->>'stage','')<>'RECEIVE_STOCK' then return false; end if;

  d:=p_review_draft->'purchaseDraft';
  if d is null or jsonb_typeof(d)<>'object' then return false; end if;
  if nullif(trim(coalesce(d->>'supplierName','')),'') is null then return false; end if;

  invoice_date_text:=trim(coalesce(d->>'invoiceDate',''));
  if invoice_date_text !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
  begin
    parsed_date:=invoice_date_text::date;
  exception when others then
    return false;
  end;
  if to_char(parsed_date,'YYYY-MM-DD')<>invoice_date_text then return false; end if;
  if d->>'invoiceDateReviewRequired' is null or lower(coalesce(d->>'invoiceDateReviewRequired','true'))<>'false' then return false; end if;

  rows:=d->'items';
  if rows is null or jsonb_typeof(rows)<>'array' or jsonb_array_length(rows)=0 then return false; end if;

  for row in select value from jsonb_array_elements(rows)
  loop
    has_existing:=nullif(trim(coalesce(row->>'productId','')),'') is not null;
    has_pending:=row->'pendingProduct' is not null
      and jsonb_typeof(row->'pendingProduct')='object'
      and row->'pendingProduct'<>'{}'::jsonb;
    if has_existing=has_pending then return false; end if;

    begin
      cases_n:=coalesce(nullif(row->>'caseCount','')::numeric,0);
      units_n:=coalesce(nullif(row->>'unitsPerCase','')::numeric,0);
      loose_n:=coalesce(nullif(row->>'looseBottles','')::numeric,0);
      qty_n:=coalesce(nullif(row->>'quantity','')::numeric,0);
      line_amount:=coalesce(nullif(row->>'lineAmount','')::numeric,0);
      purchase_price:=coalesce(nullif(row->>'purchasePrice','')::numeric,0);
    exception when others then
      return false;
    end;

    if cases_n<0 or units_n<=0 or loose_n<0 or qty_n<=0 then return false; end if;
    if trunc(cases_n)<>cases_n or trunc(units_n)<>units_n
       or trunc(loose_n)<>loose_n or trunc(qty_n)<>qty_n then return false; end if;
    if qty_n<>(cases_n*units_n+loose_n) then return false; end if;

    if coalesce(row->'packResolution'->>'state','') not in
      ('VERIFIED_EVIDENCE','CONFIRMED_AS_POSTED','CORRECTED','MANUAL_ENTRY') then
      return false;
    end if;

    if row->>'batchReviewRequired' is null then return false; end if;
    if lower(coalesce(row->>'batchReviewRequired','true'))<>'false' then return false; end if;

    if line_amount>0 then
      product_value:=product_value+line_amount;
    else
      product_value:=product_value+(qty_n*greatest(purchase_price,0));
    end if;
  end loop;

  charges:=coalesce(d->'charges','{}'::jsonb);
  finance:=coalesce(d->'financialSummary','{}'::jsonb);
  if finance->>'total' is null or trim(finance->>'total')='' then return false; end if;

  begin
    printed:=(finance->>'total')::numeric;
    calculated:=product_value
      +coalesce(nullif(charges->>'freightAmount','')::numeric,0)
      +coalesce(nullif(charges->>'transportAmount','')::numeric,0)
      +coalesce(nullif(charges->>'handlingAmount','')::numeric,0)
      +coalesce(nullif(charges->>'loadingUnloadingAmount','')::numeric,0)
      +coalesce(nullif(charges->>'miscellaneousAmount','')::numeric,0)
      -coalesce(nullif(charges->>'supplierDiscountAmount','')::numeric,0)
      -coalesce(nullif(charges->>'invoiceDiscountAmount','')::numeric,0)
      +coalesce(nullif(charges->>'roundingAdjustment','')::numeric,0);
  exception when others then
    return false;
  end;

  if printed<=0 or abs(printed-calculated)>1 then return false; end if;
  return true;
exception when others then
  return false;
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
  v_next text;
  v_server_ready boolean:=false;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status,purchase_id
    into v_status,v_purchase
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

  if p_ready then
    v_server_ready:=public.invoice_review_draft_ready_v2(p_review_draft);
    if not v_server_ready then
      raise exception 'Invoice is not server-ready: resolve date, line, batch and financial review before receiving';
    end if;
  end if;

  v_next:=case when p_ready and v_server_ready then 'READY_TO_RECEIVE' else 'NEEDS_REVIEW' end;

  update public.invoice_ingestions
  set review_draft=p_review_draft,
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
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select review_status,purchase_id,review_draft
    into v_status,v_purchase,v_review
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
end;
$$;

create or replace function public.receive_ocr_purchase_v1(
  p_ingestion_id uuid,
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
  v_purchase uuid;
begin
  perform public.invoice_assert_receivable(p_ingestion_id);

  v_purchase:=public.receive_purchase_v3(
    p_supplier_name,
    p_invoice_number,
    p_invoice_date,
    p_items,
    p_notes,
    p_freight_amount,
    p_transport_amount,
    p_handling_amount,
    p_loading_unloading_amount,
    p_supplier_discount_amount,
    p_invoice_discount_amount,
    p_miscellaneous_amount,
    p_rounding_adjustment
  );

  perform public.invoice_link_purchase(p_ingestion_id,v_purchase);
  return v_purchase;
end;
$$;
