-- Applied to production on 2026-09-01.
-- RLS already protected sale_items; authenticated was missing table-level SELECT.
grant select on table public.sale_items to authenticated;
