-- V3 first-five security advisor follow-up.
-- Pin the trigger helper search path so object resolution cannot be influenced
-- by a caller-controlled schema order.

begin;

alter function public.set_updated_at()
  set search_path = pg_catalog, public;

do $verify$
declare
  v_search_path text;
begin
  select config
    into v_search_path
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  cross join lateral unnest(coalesce(p.proconfig, array[]::text[])) as config
  where n.nspname = 'public'
    and p.proname = 'set_updated_at'
    and config like 'search_path=%';

  if v_search_path is null then
    raise exception
      'V3_SECURITY_HARDENING_FAILED: set_updated_at search_path remains mutable';
  end if;
end
$verify$;

commit;
;
