-- Source record of the PROD/QA migration already applied on 2026-09-19.
-- This release does NOT replay it.

drop index if exists public.uq_cashier_open_shift;

create unique index uq_cashier_open_shift
  on public.cashier_shifts(shop_id,cashier_id)
  where status='OPEN';

comment on index public.uq_cashier_open_shift is
  'Only one OPEN shift per cashier. Historical CLOSE_REQUESTED shifts may coexist with a current OPEN shift.';
