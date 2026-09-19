create table if not exists public.checkout_attempts (
  checkout_id uuid primary key,
  shop_id uuid not null references public.shops(id) on delete cascade,
  cashier_id uuid not null,
  canonical_payload jsonb not null,
  status text not null default 'SUBMITTING'
    check (status in ('SUBMITTING','FAILED','CONFIRMED')),
  sale_id uuid references public.sales(id),
  initiated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  last_error text,
  attempt_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_checkout_attempts_shop_created
  on public.checkout_attempts(shop_id, initiated_at desc);

alter table public.checkout_attempts enable row level security;
revoke all on table public.checkout_attempts from anon, authenticated;

create or replace function public.canonical_checkout_payload_v1(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null,
  p_reason_code_id uuid default null,
  p_reason_note text default null,
  p_override_request_id uuid default null,
  p_customer_id uuid default null,
  p_coupon_code text default null,
  p_loyalty_points_to_redeem integer default 0,
  p_store_credit_amount numeric default 0,
  p_gift_voucher_code text default null
)
returns jsonb
language sql
immutable
set search_path to 'public'
as $function$
  with normalized_items as (
    select jsonb_build_object(
      'product_id', (item->>'product_id')::uuid,
      'quantity', (item->>'quantity')::integer,
      'unit_price',
        case
          when nullif(item->>'unit_price','') is null then null
          else round((item->>'unit_price')::numeric, 2)
        end
    ) as item
    from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) item
  ),
  payload_items as (
    select coalesce(
      jsonb_agg(
        item
        order by
          item->>'product_id',
          item->>'unit_price',
          item->>'quantity'
      ),
      '[]'::jsonb
    ) as items
    from normalized_items
  )
  select jsonb_build_object(
    'items', items,
    'payment_method', upper(trim(coalesce(p_payment_method,''))),
    'discount', round(coalesce(p_discount,0),2),
    'payment_reference', nullif(trim(coalesce(p_payment_reference,'')),''),
    'reason_code_id', p_reason_code_id,
    'reason_note', nullif(trim(coalesce(p_reason_note,'')),''),
    'override_request_id', p_override_request_id,
    'customer_id', p_customer_id,
    'coupon_code', nullif(trim(coalesce(p_coupon_code,'')),''),
    'loyalty_points_to_redeem', coalesce(p_loyalty_points_to_redeem,0),
    'store_credit_amount', round(coalesce(p_store_credit_amount,0),2),
    'gift_voucher_code', nullif(trim(coalesce(p_gift_voucher_code,'')),'')
  )
  from payload_items;
$function$;

revoke all on function public.canonical_checkout_payload_v1(
  jsonb,text,numeric,text,uuid,text,uuid,uuid,text,integer,numeric,text
) from public, anon, authenticated;

create or replace function public.complete_sale_safe_v1(
  p_checkout_id uuid,
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_payment_reference text default null,
  p_reason_code_id uuid default null,
  p_reason_note text default null,
  p_override_request_id uuid default null,
  p_customer_id uuid default null,
  p_coupon_code text default null,
  p_loyalty_points_to_redeem integer default 0,
  p_store_credit_amount numeric default 0,
  p_gift_voucher_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_payload jsonb;
  v_attempt public.checkout_attempts%rowtype;
  v_sale uuid;
  v_error text;
begin
  v_shop := public.assert_shop_access();

  if p_checkout_id is null then
    raise exception 'CHECKOUT_ID_REQUIRED';
  end if;

  v_payload := public.canonical_checkout_payload_v1(
    p_items,
    p_payment_method,
    p_discount,
    p_payment_reference,
    p_reason_code_id,
    p_reason_note,
    p_override_request_id,
    p_customer_id,
    p_coupon_code,
    p_loyalty_points_to_redeem,
    p_store_credit_amount,
    p_gift_voucher_code
  );

  insert into public.checkout_attempts(
    checkout_id, shop_id, cashier_id, canonical_payload, status
  )
  values(
    p_checkout_id, v_shop, auth.uid(), v_payload, 'SUBMITTING'
  )
  on conflict (checkout_id) do nothing;

  select *
  into v_attempt
  from public.checkout_attempts
  where checkout_id = p_checkout_id
  for update;

  if not found
     or v_attempt.shop_id <> v_shop
     or v_attempt.cashier_id is distinct from auth.uid() then
    raise exception 'CHECKOUT_ID_OWNERSHIP_CONFLICT';
  end if;

  if v_attempt.canonical_payload is distinct from v_payload then
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;

  if v_attempt.status = 'CONFIRMED' and v_attempt.sale_id is not null then
    return jsonb_build_object(
      'ok', true,
      'status', 'CONFIRMED',
      'sale_id', v_attempt.sale_id,
      'checkout_id', p_checkout_id,
      'initiated_at', v_attempt.initiated_at,
      'reused', true
    );
  end if;

  update public.checkout_attempts
  set status = 'SUBMITTING',
      attempt_count = attempt_count + 1,
      last_error = null,
      updated_at = now()
  where checkout_id = p_checkout_id;

  begin
    v_sale := public.complete_sale_v4(
      p_items,
      p_payment_method,
      p_discount,
      p_payment_reference,
      p_checkout_id,
      null,
      p_reason_code_id,
      p_reason_note,
      p_override_request_id,
      p_customer_id,
      p_coupon_code,
      p_loyalty_points_to_redeem,
      p_store_credit_amount,
      p_gift_voucher_code
    );
  exception
    when others then
      v_error := sqlerrm;

      update public.checkout_attempts
      set status = 'FAILED',
          last_error = v_error,
          updated_at = now()
      where checkout_id = p_checkout_id;

      return jsonb_build_object(
        'ok', false,
        'status', 'FAILED',
        'checkout_id', p_checkout_id,
        'initiated_at', v_attempt.initiated_at,
        'message', v_error
      );
  end;

  update public.checkout_attempts
  set status = 'CONFIRMED',
      sale_id = v_sale,
      confirmed_at = now(),
      last_error = null,
      updated_at = now()
  where checkout_id = p_checkout_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'CONFIRMED',
    'sale_id', v_sale,
    'checkout_id', p_checkout_id,
    'initiated_at', v_attempt.initiated_at,
    'reused', false
  );
end;
$function$;

revoke all on function public.complete_sale_safe_v1(
  uuid,jsonb,text,numeric,text,uuid,text,uuid,uuid,text,integer,numeric,text
) from public, anon;
grant execute on function public.complete_sale_safe_v1(
  uuid,jsonb,text,numeric,text,uuid,text,uuid,uuid,text,integer,numeric,text
) to authenticated;

create or replace function public.resolve_checkout_v1(p_checkout_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_attempt public.checkout_attempts%rowtype;
  v_sale uuid;
begin
  v_shop := public.assert_shop_access();

  select *
  into v_attempt
  from public.checkout_attempts
  where checkout_id = p_checkout_id
    and shop_id = v_shop;

  if found then
    return jsonb_build_object(
      'status', v_attempt.status,
      'checkout_id', p_checkout_id,
      'sale_id', v_attempt.sale_id,
      'initiated_at', v_attempt.initiated_at,
      'confirmed_at', v_attempt.confirmed_at,
      'message', v_attempt.last_error
    );
  end if;

  select id into v_sale
  from public.sales
  where shop_id = v_shop
    and client_sale_id = p_checkout_id
  limit 1;

  if v_sale is not null then
    return jsonb_build_object(
      'status', 'CONFIRMED',
      'checkout_id', p_checkout_id,
      'sale_id', v_sale,
      'legacy_recovery', true
    );
  end if;

  return jsonb_build_object(
    'status', 'NOT_FOUND',
    'checkout_id', p_checkout_id
  );
end;
$function$;

revoke all on function public.resolve_checkout_v1(uuid) from public, anon;
grant execute on function public.resolve_checkout_v1(uuid) to authenticated;

create or replace function public.sale_receipt_v1(p_sale_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_shop uuid;
  v_sale public.sales%rowtype;
  v_items jsonb;
  v_tenders jsonb;
  v_refunds jsonb;
  v_return_total numeric;
begin
  v_shop := public.assert_shop_access();

  select *
  into v_sale
  from public.sales
  where id = p_sale_id
    and shop_id = v_shop;

  if not found then
    raise exception 'Sale not found';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', si.id,
        'product_id', si.product_id,
        'product_name', si.product_name_snapshot,
        'barcode', si.barcode_snapshot,
        'quantity', si.quantity,
        'unit_price', si.unit_price,
        'line_total', si.line_total,
        'fifo_unit_cost', si.fifo_unit_cost,
        'fifo_line_cost', si.fifo_line_cost
      )
      order by si.created_at, si.id
    ),
    '[]'::jsonb
  )
  into v_items
  from public.sale_items si
  where si.sale_id = p_sale_id
    and si.shop_id = v_shop;

  with tender_rows as (
    select
      p.created_at,
      p.payment_method::text as tender_type,
      p.amount::numeric as amount,
      p.reference_number::text as reference,
      'EXTERNAL'::text as source
    from public.payments p
    where p.sale_id = p_sale_id
      and p.shop_id = v_shop
      and p.payment_type = 'PAYMENT'

    union all

    select
      t.created_at,
      t.tender_type::text,
      t.amount::numeric,
      t.reference::text,
      'ADJUSTMENT'::text
    from public.sale_tender_adjustments t
    where t.sale_id = p_sale_id
      and t.shop_id = v_shop
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'type', tender_type,
        'amount', amount,
        'reference', reference,
        'source', source
      )
      order by created_at, tender_type
    ),
    '[]'::jsonb
  )
  into v_tenders
  from tender_rows;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'method', p.payment_method,
        'amount', p.amount,
        'reference', p.reference_number,
        'return_request_id', p.return_request_id,
        'created_at', p.created_at
      )
      order by p.created_at, p.id
    ),
    '[]'::jsonb
  ),
  coalesce(sum(p.amount),0)
  into v_refunds, v_return_total
  from public.payments p
  join public.sale_return_requests rr
    on rr.id = p.return_request_id
   and rr.status = 'APPROVED'
  where p.sale_id = p_sale_id
    and p.shop_id = v_shop
    and p.payment_type = 'REFUND';

  return jsonb_build_object(
    'id', v_sale.id,
    'invoice_number', v_sale.invoice_number,
    'created_at', v_sale.created_at,
    'business_date', public.wsp_business_date(v_sale.created_at, v_sale.offline_created_at),
    'cashier_id', v_sale.cashier_id,
    'shift_id', v_sale.shift_id,
    'client_sale_id', v_sale.client_sale_id,
    'status', v_sale.status,
    'payment_status', v_sale.payment_status,
    'subtotal', v_sale.subtotal,
    'manual_discount', v_sale.manual_discount,
    'promotion_discount', v_sale.promotion_discount,
    'loyalty_discount', v_sale.loyalty_discount,
    'discount', v_sale.discount,
    'grand_total', v_sale.grand_total,
    'loyalty_points_redeemed', v_sale.loyalty_points_redeemed,
    'loyalty_points_earned', v_sale.loyalty_points_earned,
    'store_credit_used', v_sale.store_credit_used,
    'gift_voucher_used', v_sale.gift_voucher_used,
    'approved_return_total', round(coalesce(v_return_total,0),2),
    'items', v_items,
    'tenders', v_tenders,
    'refunds', v_refunds
  );
end;
$function$;

revoke all on function public.sale_receipt_v1(uuid) from public, anon;
grant execute on function public.sale_receipt_v1(uuid) to authenticated;
