create table if not exists public.shop_verification_policies (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  financial_auto_accept_amount numeric(14,2) not null default 1.00 check (financial_auto_accept_amount >= 0),
  financial_owner_review_amount numeric(14,2) not null default 10.00 check (financial_owner_review_amount >= financial_auto_accept_amount),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_verification_resolutions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  issue_code text not null check (issue_code in ('FINANCIAL_TOTAL')),
  resolution_type text not null check (resolution_type in ('ACCEPT_SMALL_VARIANCE','OCR_TOTAL_INCORRECT')),
  state text not null check (state in ('RESOLVED','ACCEPTED_WITH_TOLERANCE')),
  ocr_value numeric(14,2), verified_value numeric(14,2), posted_value numeric(14,2), variance_amount numeric(14,2),
  reason text not null,
  is_active boolean not null default true,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists purchase_verification_resolutions_one_active
  on public.purchase_verification_resolutions(shop_id,purchase_id,issue_code) where is_active;
create index if not exists purchase_verification_resolutions_purchase_idx
  on public.purchase_verification_resolutions(shop_id,purchase_id,created_at desc);

alter table public.shop_verification_policies enable row level security;
alter table public.purchase_verification_resolutions enable row level security;
revoke all on public.shop_verification_policies from anon, authenticated;
revoke all on public.purchase_verification_resolutions from anon, authenticated;

create or replace function public.get_purchase_verification_state(p_purchase_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_shop uuid; v_purchase public.purchases%rowtype; v_ocr_total numeric(14,2);
  v_auto numeric(14,2):=1.00; v_owner numeric(14,2):=10.00; v_variance numeric(14,2);
  v_resolution public.purchase_verification_resolutions%rowtype; v_financial_state text;
  v_active_count integer:=0; v_correction_count integer:=0; v_pack_correction_count integer:=0;
begin
  v_shop:=public.assert_shop_access();
  select * into v_purchase from public.purchases where id=p_purchase_id and shop_id=v_shop;
  if not found then raise exception 'Purchase not found in current shop'; end if;

  select coalesce(p.financial_auto_accept_amount,1.00),coalesce(p.financial_owner_review_amount,10.00)
  into v_auto,v_owner from public.shop_verification_policies p where p.shop_id=v_shop;
  if not found then v_auto:=1.00; v_owner:=10.00; end if;

  select ii.extracted_total into v_ocr_total from public.invoice_ingestions ii
  where ii.purchase_id=p_purchase_id and ii.shop_id=v_shop order by ii.received_at desc limit 1;
  if v_ocr_total is not null and v_purchase.total_landed_cost is not null then
    v_variance:=round(abs(v_ocr_total-v_purchase.total_landed_cost),2);
  end if;

  select * into v_resolution from public.purchase_verification_resolutions r
  where r.shop_id=v_shop and r.purchase_id=p_purchase_id and r.issue_code='FINANCIAL_TOTAL' and r.is_active
  order by r.created_at desc limit 1;

  if found then v_financial_state:=v_resolution.state;
  elsif v_ocr_total is null then v_financial_state:='INFORMATIONAL';
  elsif v_variance<=v_auto then v_financial_state:='ACCEPTED_WITH_TOLERANCE';
  else v_financial_state:='OPEN'; v_active_count:=v_active_count+1; end if;

  select count(*)::integer,
         count(*) filter (where coalesce((c.old_values->>'units_per_case')::numeric,0)<>coalesce((c.new_values->>'units_per_case')::numeric,0) or c.quantity_delta<>0)::integer
  into v_correction_count,v_pack_correction_count
  from public.purchase_item_corrections c where c.shop_id=v_shop and c.purchase_id=p_purchase_id;

  return jsonb_build_object(
    'purchase_id',p_purchase_id,
    'financial',jsonb_build_object(
      'state',v_financial_state,'ocr_total',v_ocr_total,'posted_total',v_purchase.total_landed_cost,'variance',v_variance,
      'auto_accept_amount',v_auto,'owner_review_amount',v_owner,
      'resolution_type',case when v_resolution.id is null then null else v_resolution.resolution_type end,
      'verified_value',case when v_resolution.id is null then null else v_resolution.verified_value end,
      'reason',case when v_resolution.id is null then null else v_resolution.reason end,
      'resolved_at',case when v_resolution.id is null then null else v_resolution.created_at end),
    'correction_count',v_correction_count,'pack_correction_count',v_pack_correction_count,'active_exception_count',v_active_count);
end; $$;

create or replace function public.resolve_purchase_financial_exception(
  p_purchase_id uuid,p_resolution_type text,p_verified_invoice_total numeric default null,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_shop uuid; v_purchase public.purchases%rowtype; v_ocr_total numeric(14,2);
  v_auto numeric(14,2):=1.00; v_owner numeric(14,2):=10.00; v_variance numeric(14,2);
  v_state text; v_verified numeric(14,2); v_id uuid;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if length(trim(coalesce(p_reason,'')))<4 then raise exception 'Resolution reason is required'; end if;

  select * into v_purchase from public.purchases where id=p_purchase_id and shop_id=v_shop for update;
  if not found then raise exception 'Purchase not found in current shop'; end if;
  if v_purchase.status<>'RECEIVED' then raise exception 'Only received purchases can be financially resolved'; end if;

  select coalesce(p.financial_auto_accept_amount,1.00),coalesce(p.financial_owner_review_amount,10.00)
  into v_auto,v_owner from public.shop_verification_policies p where p.shop_id=v_shop;
  if not found then v_auto:=1.00; v_owner:=10.00; end if;

  select ii.extracted_total into v_ocr_total from public.invoice_ingestions ii
  where ii.purchase_id=p_purchase_id and ii.shop_id=v_shop order by ii.received_at desc limit 1;
  if v_ocr_total is null then raise exception 'No retained OCR invoice total is available'; end if;
  if v_purchase.total_landed_cost is null then raise exception 'Purchase landed total is unavailable'; end if;
  v_variance:=round(abs(v_ocr_total-v_purchase.total_landed_cost),2);

  if p_resolution_type='ACCEPT_SMALL_VARIANCE' then
    if v_variance>v_owner then perform public.assert_admin(); end if;
    v_state:='ACCEPTED_WITH_TOLERANCE'; v_verified:=v_purchase.total_landed_cost;
  elsif p_resolution_type='OCR_TOTAL_INCORRECT' then
    if p_verified_invoice_total is null or p_verified_invoice_total<=0 then raise exception 'Verified invoice total is required'; end if;
    if abs(p_verified_invoice_total-v_purchase.total_landed_cost)>v_auto then
      raise exception 'Verified invoice total still differs from WineShopPOS landed total by more than the automatic tolerance';
    end if;
    v_state:='RESOLVED'; v_verified:=round(p_verified_invoice_total,2);
  else raise exception 'Unsupported financial resolution type'; end if;

  update public.purchase_verification_resolutions set is_active=false
  where shop_id=v_shop and purchase_id=p_purchase_id and issue_code='FINANCIAL_TOTAL' and is_active;

  insert into public.purchase_verification_resolutions(
    shop_id,purchase_id,issue_code,resolution_type,state,ocr_value,verified_value,posted_value,variance_amount,reason,is_active,resolved_by)
  values(v_shop,p_purchase_id,'FINANCIAL_TOTAL',p_resolution_type,v_state,v_ocr_total,v_verified,v_purchase.total_landed_cost,v_variance,trim(p_reason),true,auth.uid())
  returning id into v_id;

  perform public.write_audit(v_shop,'PURCHASE_FINANCIAL_VERIFICATION_RESOLVED','purchase',p_purchase_id::text,null,
    jsonb_build_object('resolution_id',v_id,'resolution_type',p_resolution_type,'state',v_state,'ocr_total',v_ocr_total,
      'verified_value',v_verified,'posted_total',v_purchase.total_landed_cost,'variance',v_variance,'reason',trim(p_reason)),
    jsonb_build_object('verification_only',true,'purchase_amounts_changed',false,'inventory_changed',false));

  return public.get_purchase_verification_state(p_purchase_id);
end; $$;

create or replace function public.reopen_purchase_financial_exception(p_purchase_id uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_shop uuid; v_old jsonb;
begin
  v_shop:=public.assert_shop_access(); perform public.assert_manager_or_admin();
  if length(trim(coalesce(p_reason,'')))<4 then raise exception 'Reopen reason is required'; end if;
  select to_jsonb(r) into v_old from public.purchase_verification_resolutions r
  where r.shop_id=v_shop and r.purchase_id=p_purchase_id and r.issue_code='FINANCIAL_TOTAL' and r.is_active
  order by r.created_at desc limit 1;
  if v_old is null then raise exception 'No active financial resolution exists'; end if;
  update public.purchase_verification_resolutions set is_active=false
  where shop_id=v_shop and purchase_id=p_purchase_id and issue_code='FINANCIAL_TOTAL' and is_active;
  perform public.write_audit(v_shop,'PURCHASE_FINANCIAL_VERIFICATION_REOPENED','purchase',p_purchase_id::text,v_old,null,
    jsonb_build_object('reason',trim(p_reason),'verification_only',true,'purchase_amounts_changed',false,'inventory_changed',false));
  return public.get_purchase_verification_state(p_purchase_id);
end; $$;

grant execute on function public.get_purchase_verification_state(uuid) to authenticated;
grant execute on function public.resolve_purchase_financial_exception(uuid,text,numeric,text) to authenticated;
grant execute on function public.reopen_purchase_financial_exception(uuid,text) to authenticated;
