-- ============================================================
-- N6 STANDARDIZED REASON CODES
-- ============================================================

create table if not exists public.reason_codes (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  code text not null,
  label text not null,
  requires_note boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  unique(category, code)
);

insert into public.reason_codes(category,code,label,requires_note,sort_order)
values
 ('DISCOUNT_OVERRIDE','CUSTOMER_RESOLUTION','Customer Resolution',false,10),
 ('DISCOUNT_OVERRIDE','MANAGER_PROMOTION','Manager Promotion',false,20),
 ('DISCOUNT_OVERRIDE','NEAR_EXPIRY','Near Expiry',false,30),
 ('DISCOUNT_OVERRIDE','DAMAGED_LABEL','Damaged Label / Packaging',false,40),
 ('DISCOUNT_OVERRIDE','PRICING_ERROR','Pricing Error',false,50),
 ('DISCOUNT_OVERRIDE','OTHER','Other',true,999),

 ('PRICE_OVERRIDE','CUSTOMER_RESOLUTION','Customer Resolution',false,10),
 ('PRICE_OVERRIDE','MANAGER_PROMOTION','Manager Promotion',false,20),
 ('PRICE_OVERRIDE','NEAR_EXPIRY','Near Expiry',false,30),
 ('PRICE_OVERRIDE','DAMAGED_LABEL','Damaged Label / Packaging',false,40),
 ('PRICE_OVERRIDE','PRICING_ERROR','Pricing Error',false,50),
 ('PRICE_OVERRIDE','OTHER','Other',true,999),

 ('RETURN','DAMAGED_PRODUCT','Damaged Product',false,10),
 ('RETURN','WRONG_ITEM','Wrong Item',false,20),
 ('RETURN','CUSTOMER_RESOLUTION','Customer Resolution',false,30),
 ('RETURN','OTHER','Other',true,999),

 ('REFUND','CUSTOMER_RESOLUTION','Customer Resolution',false,10),
 ('REFUND','PRICING_ERROR','Pricing Error',false,20),
 ('REFUND','OTHER','Other',true,999),

 ('SALE_VOID','DUPLICATE_BILL','Duplicate Bill',false,10),
 ('SALE_VOID','PAYMENT_ERROR','Payment Error',false,20),
 ('SALE_VOID','PRICING_ERROR','Pricing Error',false,30),
 ('SALE_VOID','OTHER','Other',true,999),

 ('STOCK_ADJUSTMENT','COUNT_VARIANCE','Count Variance',false,10),
 ('STOCK_ADJUSTMENT','STOCK_DAMAGE','Stock Damage',false,20),
 ('STOCK_ADJUSTMENT','BREAKAGE','Breakage',false,30),
 ('STOCK_ADJUSTMENT','MANUAL_CORRECTION','Manual Correction',false,40),
 ('STOCK_ADJUSTMENT','OTHER','Other',true,999),

 ('PURCHASE_REJECTION','WRONG_QUANTITY','Wrong Quantity',false,10),
 ('PURCHASE_REJECTION','WRONG_PRICE','Wrong Price',false,20),
 ('PURCHASE_REJECTION','SUPPLIER_ISSUE','Supplier Issue',false,30),
 ('PURCHASE_REJECTION','OTHER','Other',true,999),

 ('TRANSFER_REJECTION','STOCK_UNAVAILABLE','Stock Unavailable',false,10),
 ('TRANSFER_REJECTION','WRONG_REQUEST','Wrong Request',false,20),
 ('TRANSFER_REJECTION','OTHER','Other',true,999),

 ('EXPENSE_VOID','DUPLICATE_ENTRY','Duplicate Entry',false,10),
 ('EXPENSE_VOID','WRONG_AMOUNT','Wrong Amount',false,20),
 ('EXPENSE_VOID','OTHER','Other',true,999),

 ('MANUAL_CORRECTION','DATA_CORRECTION','Data Correction',false,10),
 ('MANUAL_CORRECTION','OTHER','Other',true,999)
on conflict(category,code) do update
set label=excluded.label,
    requires_note=excluded.requires_note,
    sort_order=excluded.sort_order,
    active=true;

alter table public.reason_codes enable row level security;
drop policy if exists reason_codes_select on public.reason_codes;
create policy reason_codes_select
on public.reason_codes
for select to authenticated
using (active=true);

revoke insert,update,delete on public.reason_codes from authenticated;
grant select on public.reason_codes to authenticated;

-- ============================================================
-- N5 POS OVERRIDE POLICY
-- Default CASHIER policy:
--   <= 5% AND <= ₹500 discount can complete without manager approval.
--   any item price override requires manager/admin approval.
-- ADMIN/MANAGER may execute overrides directly with a reason.
-- ============================================================

create table if not exists public.sale_override_settings (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  cashier_max_discount_percent numeric(7,3) not null default 5
    check (cashier_max_discount_percent between 0 and 100),
  cashier_max_discount_amount numeric(14,2) not null default 500
    check (cashier_max_discount_amount >= 0),
  cashier_price_override_requires_approval boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.sale_override_settings enable row level security;
drop policy if exists sale_override_settings_select on public.sale_override_settings;
create policy sale_override_settings_select
on public.sale_override_settings
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
);
revoke insert,update,delete on public.sale_override_settings from authenticated;
grant select on public.sale_override_settings to authenticated;

create table if not exists public.sale_override_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED','USED','CANCELLED')),
  override_type text not null
    check (override_type in ('DISCOUNT_OVERRIDE','PRICE_OVERRIDE','DISCOUNT_AND_PRICE_OVERRIDE')),
  request_fingerprint text not null,
  request_snapshot jsonb not null,
  subtotal numeric(14,2) not null check (subtotal >= 0),
  requested_discount numeric(14,2) not null default 0 check (requested_discount >= 0),
  discount_percent numeric(9,4) not null default 0 check (discount_percent >= 0),
  reason_code_id uuid not null references public.reason_codes(id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  used_at timestamptz
);

create index if not exists idx_sale_override_requests_shop_status
  on public.sale_override_requests(shop_id,status,created_at desc);

alter table public.sale_override_requests enable row level security;
drop policy if exists sale_override_requests_select on public.sale_override_requests;
create policy sale_override_requests_select
on public.sale_override_requests
for select to authenticated
using (
  shop_id=public.current_shop_id()
  and public.shop_access_allowed(shop_id)
  and (
    public.current_user_role() in ('ADMIN','MANAGER')
    or requested_by=auth.uid()
  )
);
revoke insert,update,delete on public.sale_override_requests from authenticated;
grant select on public.sale_override_requests to authenticated;

create or replace function public.get_sale_override_policy()
returns table(
  cashier_max_discount_percent numeric,
  cashier_max_discount_amount numeric,
  cashier_price_override_requires_approval boolean
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
begin
  v_shop:=public.assert_shop_access();
  return query
  select
    coalesce(s.cashier_max_discount_percent,5::numeric),
    coalesce(s.cashier_max_discount_amount,500::numeric),
    coalesce(s.cashier_price_override_requires_approval,true)
  from (select 1) x
  left join public.sale_override_settings s on s.shop_id=v_shop;
end;
$$;

create or replace function public.v3_validate_reason(
  p_reason_code_id uuid,
  p_allowed_categories text[],
  p_note text default null
)
returns public.reason_codes
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_reason public.reason_codes%rowtype;
begin
  if p_reason_code_id is null then
    raise exception 'STANDARD_REASON_REQUIRED';
  end if;

  select * into v_reason
  from public.reason_codes
  where id=p_reason_code_id
    and active=true
    and category=any(p_allowed_categories);

  if not found then raise exception 'INVALID_REASON_CODE'; end if;

  if v_reason.requires_note
     and nullif(trim(coalesce(p_note,'')),'') is null
  then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;

  return v_reason;
end;
$$;

revoke all on function public.v3_validate_reason(uuid,text[],text) from public;
revoke all on function public.v3_validate_reason(uuid,text[],text) from authenticated;

create or replace function public.v3_pricing_snapshot(
  p_items jsonb,
  p_discount numeric default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_item jsonb;
  v_product uuid;
  v_qty integer;
  v_normal numeric;
  v_requested numeric;
  v_subtotal numeric:=0;
  v_has_price_override boolean:=false;
  v_rows jsonb:='[]'::jsonb;
begin
  v_shop:=public.assert_shop_access();

  if p_items is null or jsonb_array_length(p_items)=0 then
    raise exception 'Sale items required';
  end if;

  if coalesce(p_discount,0)<0 then raise exception 'Discount cannot be negative'; end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product:=(v_item->>'product_id')::uuid;
    v_qty:=coalesce((v_item->>'quantity')::integer,0);
    if v_qty<=0 then raise exception 'Invalid sale quantity'; end if;

    select selling_price into v_normal
    from public.products
    where id=v_product and shop_id=v_shop and active=true;

    if v_normal is null then raise exception 'Invalid/inactive product'; end if;

    v_requested:=coalesce(nullif(v_item->>'unit_price','')::numeric,v_normal);
    if v_requested<0 then raise exception 'Unit price cannot be negative'; end if;

    if round(v_requested,2)<>round(v_normal,2) then
      v_has_price_override:=true;
    end if;

    v_subtotal:=v_subtotal+(v_qty*v_requested);

    v_rows:=v_rows||jsonb_build_array(jsonb_build_object(
      'product_id',v_product,
      'quantity',v_qty,
      'normal_price',round(v_normal,2),
      'requested_price',round(v_requested,2)
    ));
  end loop;

  if coalesce(p_discount,0)>v_subtotal then
    raise exception 'Discount cannot exceed subtotal';
  end if;

  return jsonb_build_object(
    'items',v_rows,
    'subtotal',round(v_subtotal,2),
    'discount',round(coalesce(p_discount,0),2),
    'discount_percent',
      case when v_subtotal>0
           then round(coalesce(p_discount,0)/v_subtotal*100,4)
           else 0 end,
    'has_price_override',v_has_price_override
  );
end;
$$;

create or replace function public.v3_pricing_fingerprint(
  p_items jsonb,
  p_discount numeric default 0
)
returns text
language sql
stable
security definer
set search_path=public
as $$
  select md5(public.v3_pricing_snapshot(p_items,p_discount)::text);
$$;

create or replace function public.sale_override_requirement(
  p_items jsonb,
  p_discount numeric default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_role text;
  v_snap jsonb;
  v_pct_limit numeric:=5;
  v_amt_limit numeric:=500;
  v_price_requires boolean:=true;
  v_required boolean:=false;
begin
  perform public.assert_shop_access();
  v_role:=public.current_user_role();
  v_snap:=public.v3_pricing_snapshot(p_items,p_discount);

  select
    cashier_max_discount_percent,
    cashier_max_discount_amount,
    cashier_price_override_requires_approval
  into v_pct_limit,v_amt_limit,v_price_requires
  from public.get_sale_override_policy();

  if v_role='CASHIER' then
    v_required:=
      ((v_snap->>'has_price_override')::boolean and v_price_requires)
      or coalesce(p_discount,0)>v_amt_limit
      or (v_snap->>'discount_percent')::numeric>v_pct_limit;
  end if;

  return v_snap||jsonb_build_object(
    'role',v_role,
    'approval_required',v_required,
    'cashier_max_discount_percent',v_pct_limit,
    'cashier_max_discount_amount',v_amt_limit
  );
end;
$$;

grant execute on function public.get_sale_override_policy() to authenticated;
grant execute on function public.sale_override_requirement(jsonb,numeric) to authenticated;

create or replace function public.request_sale_override(
  p_items jsonb,
  p_discount numeric,
  p_reason_code_id uuid,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_role text;
  v_snap jsonb;
  v_reason public.reason_codes%rowtype;
  v_type text;
  v_id uuid;
  v_fingerprint text;
begin
  v_shop:=public.assert_shop_access();
  v_role:=public.current_user_role();
  v_snap:=public.sale_override_requirement(p_items,p_discount);

  if v_role<>'CASHIER' then
    raise exception 'Managers and admins do not need an approval request';
  end if;

  if not (v_snap->>'approval_required')::boolean then
    raise exception 'This pricing is within cashier policy';
  end if;

  if (v_snap->>'has_price_override')::boolean and coalesce(p_discount,0)>0 then
    v_type:='DISCOUNT_AND_PRICE_OVERRIDE';
    v_reason:=public.v3_validate_reason(
      p_reason_code_id,
      array['DISCOUNT_OVERRIDE','PRICE_OVERRIDE'],
      p_note
    );
  elsif (v_snap->>'has_price_override')::boolean then
    v_type:='PRICE_OVERRIDE';
    v_reason:=public.v3_validate_reason(
      p_reason_code_id,array['PRICE_OVERRIDE'],p_note
    );
  else
    v_type:='DISCOUNT_OVERRIDE';
    v_reason:=public.v3_validate_reason(
      p_reason_code_id,array['DISCOUNT_OVERRIDE'],p_note
    );
  end if;

  v_fingerprint:=public.v3_pricing_fingerprint(p_items,p_discount);

  select id into v_id
  from public.sale_override_requests
  where shop_id=v_shop
    and requested_by=auth.uid()
    and status='PENDING'
    and request_fingerprint=v_fingerprint
  order by created_at desc
  limit 1;

  if v_id is not null then return v_id; end if;

  insert into public.sale_override_requests(
    shop_id,requested_by,status,override_type,request_fingerprint,request_snapshot,
    subtotal,requested_discount,discount_percent,reason_code_id,note
  )
  values(
    v_shop,auth.uid(),'PENDING',v_type,v_fingerprint,v_snap,
    (v_snap->>'subtotal')::numeric,
    coalesce(p_discount,0),
    (v_snap->>'discount_percent')::numeric,
    v_reason.id,
    nullif(trim(coalesce(p_note,'')),'')
  )
  returning id into v_id;

  perform public.write_audit(
    v_shop,'SALE_OVERRIDE_REQUESTED','sale_override_request',v_id::text,
    null,null,
    jsonb_build_object(
      'type',v_type,
      'discount',coalesce(p_discount,0),
      'reason_code',v_reason.code
    )
  );

  return v_id;
end;
$$;

create or replace function public.approve_sale_override(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_req public.sale_override_requests%rowtype;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select * into v_req
  from public.sale_override_requests
  where id=p_request_id and shop_id=v_shop
  for update;

  if not found then raise exception 'Override request not found'; end if;
  if v_req.status<>'PENDING' then raise exception 'Override request already reviewed'; end if;

  update public.sale_override_requests
  set status='APPROVED',approved_by=auth.uid(),reviewed_at=now()
  where id=p_request_id;

  perform public.write_audit(
    v_shop,'SALE_OVERRIDE_APPROVED','sale_override_request',p_request_id::text,
    null,to_jsonb(v_req),null
  );
end;
$$;

create or replace function public.reject_sale_override(
  p_request_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_req public.sale_override_requests%rowtype;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  select * into v_req
  from public.sale_override_requests
  where id=p_request_id and shop_id=v_shop
  for update;

  if not found then raise exception 'Override request not found'; end if;
  if v_req.status<>'PENDING' then raise exception 'Override request already reviewed'; end if;

  update public.sale_override_requests
  set status='REJECTED',
      approved_by=auth.uid(),
      reviewed_at=now(),
      note=concat_ws(E'\n',note,nullif(trim(coalesce(p_note,'')),''))
  where id=p_request_id;

  perform public.write_audit(
    v_shop,'SALE_OVERRIDE_REJECTED','sale_override_request',p_request_id::text,
    null,to_jsonb(v_req),jsonb_build_object('review_note',p_note)
  );
end;
$$;

grant execute on function public.request_sale_override(jsonb,numeric,uuid,text) to authenticated;
grant execute on function public.approve_sale_override(uuid) to authenticated;
grant execute on function public.reject_sale_override(uuid,text) to authenticated;

-- ============================================================
-- COMPLETE SALE V3
-- Approval is validated before sale/stock/payment mutation.
-- ============================================================

create or replace function public.complete_sale_v3(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null,
  p_client_sale_id uuid default gen_random_uuid(),
  p_offline_created_at timestamptz default null,
  p_reason_code_id uuid default null,
  p_reason_note text default null,
  p_override_request_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_role text;
  v_existing uuid;
  v_sale_id uuid;
  v_invoice text;
  v_item jsonb;
  v_product uuid;
  v_name text;
  v_barcode text;
  v_qty integer;
  v_normal_price numeric;
  v_price numeric;
  v_before integer;
  v_after integer;
  v_subtotal numeric:=0;
  v_total numeric;
  v_shift uuid;

  v_req jsonb;
  v_approval_required boolean;
  v_has_price_override boolean;
  v_reason_required boolean;
  v_reason public.reason_codes%rowtype;
  v_fingerprint text;
  v_approval public.sale_override_requests%rowtype;
begin
  v_shop:=public.assert_shop_access();
  v_role:=public.current_user_role();

  if p_client_sale_id is null then p_client_sale_id:=gen_random_uuid(); end if;

  select id into v_existing
  from public.sales
  where shop_id=v_shop and client_sale_id=p_client_sale_id;

  if v_existing is not null then return v_existing; end if;

  if p_payment_method not in ('CASH','UPI','CARD') then
    raise exception 'Invalid payment method';
  end if;

  v_req:=public.sale_override_requirement(p_items,p_discount);
  v_approval_required:=(v_req->>'approval_required')::boolean;
  v_has_price_override:=(v_req->>'has_price_override')::boolean;
  v_reason_required:=coalesce(p_discount,0)>0 or v_has_price_override;

  if v_reason_required then
    if v_has_price_override and coalesce(p_discount,0)>0 then
      v_reason:=public.v3_validate_reason(
        p_reason_code_id,array['DISCOUNT_OVERRIDE','PRICE_OVERRIDE'],p_reason_note
      );
    elsif v_has_price_override then
      v_reason:=public.v3_validate_reason(
        p_reason_code_id,array['PRICE_OVERRIDE'],p_reason_note
      );
    else
      v_reason:=public.v3_validate_reason(
        p_reason_code_id,array['DISCOUNT_OVERRIDE'],p_reason_note
      );
    end if;
  end if;

  if v_approval_required then
    if p_override_request_id is null then
      raise exception 'OVERRIDE_APPROVAL_REQUIRED';
    end if;

    v_fingerprint:=public.v3_pricing_fingerprint(p_items,p_discount);

    select * into v_approval
    from public.sale_override_requests
    where id=p_override_request_id
      and shop_id=v_shop
      and requested_by=auth.uid()
    for update;

    if not found then raise exception 'OVERRIDE_REQUEST_NOT_FOUND'; end if;
    if v_approval.status<>'APPROVED' then raise exception 'OVERRIDE_NOT_APPROVED'; end if;
    if v_approval.request_fingerprint<>v_fingerprint then
      raise exception 'OVERRIDE_REQUEST_CHANGED';
    end if;
  end if;

  if p_offline_created_at is null then
    select id into v_shift
    from public.cashier_shifts
    where shop_id=v_shop
      and cashier_id=auth.uid()
      and status='OPEN'
    order by opened_at desc limit 1;
  else
    select id into v_shift
    from public.cashier_shifts
    where shop_id=v_shop
      and cashier_id=auth.uid()
      and opened_at<=p_offline_created_at
      and coalesce(closed_at,now()+interval '100 years')>=p_offline_created_at
      and status in ('OPEN','CLOSE_REQUESTED','CLOSED')
    order by opened_at desc limit 1;
  end if;

  if v_role='CASHIER' and v_shift is null then raise exception 'SHIFT_REQUIRED'; end if;

  v_invoice:=public.next_sale_number(v_shop);

  insert into public.sales(
    shop_id,invoice_number,cashier_id,status,payment_status,
    shift_id,client_sale_id,offline_created_at
  )
  values(
    v_shop,v_invoice,auth.uid(),'COMPLETED','PAID',
    v_shift,p_client_sale_id,p_offline_created_at
  )
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product:=(v_item->>'product_id')::uuid;
    v_qty:=(v_item->>'quantity')::integer;

    select product_name,barcode,selling_price
      into v_name,v_barcode,v_normal_price
    from public.products
    where id=v_product and shop_id=v_shop and active=true;

    if v_name is null then raise exception 'Invalid/inactive product'; end if;

    v_price:=coalesce(nullif(v_item->>'unit_price','')::numeric,v_normal_price);

    select quantity into v_before
    from public.inventory
    where shop_id=v_shop and product_id=v_product
    for update;

    if v_before is null or v_before<v_qty then
      raise exception 'Insufficient stock for %',v_name;
    end if;

    v_after:=v_before-v_qty;
    update public.inventory set quantity=v_after
    where shop_id=v_shop and product_id=v_product;

    insert into public.sale_items(
      shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,
      quantity,unit_price,discount,line_total
    )
    values(
      v_shop,v_sale_id,v_product,v_name,v_barcode,
      v_qty,v_price,0,v_qty*v_price
    );

    insert into public.stock_movements(
      shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,
      reference_type,reference_id,reason,created_by
    )
    values(
      v_shop,v_product,
      case when p_offline_created_at is null then 'SALE' else 'OFFLINE_SALE' end,
      -v_qty,v_before,v_after,'SALE',v_sale_id,
      case when p_offline_created_at is null then 'POS sale' else 'Synced offline POS sale' end,
      auth.uid()
    );

    v_subtotal:=v_subtotal+v_qty*v_price;
  end loop;

  if p_discount>v_subtotal then raise exception 'Discount cannot exceed subtotal'; end if;
  v_total:=v_subtotal-p_discount;

  update public.sales
  set subtotal=v_subtotal,
      discount=p_discount,
      grand_total=v_total,
      notes=case
        when v_reason_required then concat_ws(
          E'\n',notes,
          'Override reason: '||v_reason.category||'/'||v_reason.code||
          case when nullif(trim(coalesce(p_reason_note,'')),'') is null
               then '' else ' — '||trim(p_reason_note) end
        )
        else notes
      end
  where id=v_sale_id;

  insert into public.payments(
    shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id
  )
  values(
    v_shop,v_sale_id,p_payment_method,v_total,p_payment_reference,'PAYMENT',v_shift
  );

  if v_approval_required then
    update public.sale_override_requests
    set status='USED',used_at=now()
    where id=p_override_request_id;
  end if;

  perform public.write_audit(
    v_shop,
    case when v_reason_required then 'SALE_COMPLETED_WITH_OVERRIDE'
         when p_offline_created_at is null then 'SALE_COMPLETED'
         else 'OFFLINE_SALE_SYNCED' end,
    'sale',v_sale_id::text,null,null,
    jsonb_build_object(
      'invoice',v_invoice,
      'discount',p_discount,
      'client_sale_id',p_client_sale_id,
      'price_override',v_has_price_override,
      'reason_code',case when v_reason_required then v_reason.code else null end,
      'override_request_id',p_override_request_id
    )
  );

  return v_sale_id;
end;
$$;

grant execute on function public.complete_sale_v3(
  jsonb,text,numeric,text,uuid,timestamptz,uuid,text,uuid
) to authenticated;

notify pgrst, 'reload schema';
