-- WineShopPOS documentation-only schema metadata export.
-- READ ONLY.
-- Run against the intended environment only.

-- Tables/views + RLS
select
  c.relname as object_name,
  case c.relkind
    when 'r' then 'table'
    when 'p' then 'partitioned_table'
    when 'v' then 'view'
    when 'm' then 'materialized_view'
    else c.relkind::text
  end as object_type,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
  and c.relkind in ('r','p','v','m')
order by c.relname;

-- Columns
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema='public'
order by table_name, ordinal_position;

-- PK/FK/unique/check constraints
select
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name=kcu.constraint_name
 and tc.table_schema=kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name=ccu.constraint_name
 and tc.table_schema=ccu.table_schema
where tc.table_schema='public'
order by tc.table_name, tc.constraint_type, tc.constraint_name, kcu.ordinal_position;

-- Public routines
select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
order by p.proname, identity_arguments;
