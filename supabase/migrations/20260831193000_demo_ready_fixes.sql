-- WineShopPOS V3 Demo Ready fixes
-- ADMIN-only controlled operational test-data reset.
-- This is intentionally NOT an arbitrary client-side DELETE implementation.

drop function if exists public.demo_reset_current_shop(text);

create function public.demo_reset_current_shop(p_confirmation text)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_pass integer;
  v_progress bigint;
  v_count bigint;
  v_has boolean;
  v_deleted jsonb := '{}'::jsonb;
  v_unresolved text[] := '{}'::text[];
  r record;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_admin();

  if p_confirmation is distinct from 'DELETE DEMO DATA' then
    raise exception 'DEMO_RESET_CONFIRMATION_REQUIRED';
  end if;

  -- Delete operational shop-scoped records in dependency-safe passes.
  -- Preserve tenant/auth/config/reference/audit data required for the app to remain usable.
  for v_pass in 1..30 loop
    v_progress := 0;

    for r in
      select distinct c.table_name
      from information_schema.columns c
      join information_schema.tables t
        on t.table_schema=c.table_schema and t.table_name=c.table_name
      where c.table_schema='public'
        and c.column_name='shop_id'
        and t.table_type='BASE TABLE'
        and c.table_name not in (
          'profiles',
          'user_shop_memberships',
          'shop_settings',
          'shop_counters',
          'invoice_ingestion_channels',
          'compliance_profiles',
          'categories',
          'expense_categories',
          'audit_logs',
          'ai_activity_logs'
        )
        and c.table_name !~ '(_settings$|audit|activity_logs$)'
      order by c.table_name
    loop
      begin
        execute format('delete from public.%I where shop_id=$1', r.table_name) using v_shop;
        get diagnostics v_count = row_count;
        if v_count > 0 then
          v_progress := v_progress + v_count;
          v_deleted := v_deleted || jsonb_build_object(
            r.table_name,
            coalesce((v_deleted->>r.table_name)::bigint,0) + v_count
          );
        end if;
      exception
        when foreign_key_violation then
          -- A child table will be removed in this or a later pass.
          null;
      end;
    end loop;

    exit when v_progress=0;
  end loop;

  -- Refuse a silent half-reset if an unexpected dependency remains.
  for r in
    select distinct c.table_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema=c.table_schema and t.table_name=c.table_name
    where c.table_schema='public'
      and c.column_name='shop_id'
      and t.table_type='BASE TABLE'
      and c.table_name not in (
        'profiles',
        'user_shop_memberships',
        'shop_settings',
        'shop_counters',
        'invoice_ingestion_channels',
        'compliance_profiles',
        'categories',
        'expense_categories',
        'audit_logs',
        'ai_activity_logs'
      )
      and c.table_name !~ '(_settings$|audit|activity_logs$)'
    order by c.table_name
  loop
    execute format(
      'select exists(select 1 from public.%I where shop_id=$1)',
      r.table_name
    ) into v_has using v_shop;
    if v_has then
      v_unresolved := array_append(v_unresolved,r.table_name);
    end if;
  end loop;

  if cardinality(v_unresolved) > 0 then
    raise exception 'DEMO_RESET_BLOCKED_BY_DEPENDENCIES:%', array_to_string(v_unresolved,',');
  end if;

  update public.shop_counters
  set sale_counter=0,purchase_counter=0,updated_at=now()
  where shop_id=v_shop;

  perform public.write_audit(
    v_shop,
    'DEMO_TEST_DATA_RESET',
    'shop',
    v_shop::text,
    null,
    null,
    jsonb_build_object(
      'confirmation','DELETE DEMO DATA',
      'deleted_tables',v_deleted
    )
  );

  return jsonb_build_object(
    'ok',true,
    'shop_id',v_shop,
    'deleted',v_deleted,
    'preserved',jsonb_build_array(
      'shop identity',
      'users and memberships',
      'shop settings',
      'categories',
      'email sender mapping',
      'compliance/settings',
      'audit logs'
    )
  );
end;
$$;

revoke all on function public.demo_reset_current_shop(text) from public;
grant execute on function public.demo_reset_current_shop(text) to authenticated;
