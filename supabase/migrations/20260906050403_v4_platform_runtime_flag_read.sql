begin;

create or replace function public.saas_admin_get_v4_flags()
returns table(
  legal_notice_enabled boolean,
  legal_document_id uuid,
  client_audit_enabled boolean,
  customer_import_enabled boolean
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_legal boolean:=false;
  v_doc uuid:=null;
  v_client boolean:=false;
  v_customer boolean:=false;
begin
  if not public.saas_is_platform_admin(auth.uid()) then
    raise exception 'PLATFORM_ADMIN_REQUIRED';
  end if;

  select coalesce((setting_value::text)::boolean,false)
  into v_legal
  from public.saas_runtime_settings
  where setting_key='legal_notice_enabled';

  begin
    select nullif(trim(both '"' from setting_value::text),'null')::uuid
    into v_doc
    from public.saas_runtime_settings
    where setting_key='legal_notice_document_id';
  exception when others then
    v_doc:=null;
  end;

  select coalesce((setting_value::text)::boolean,false)
  into v_client
  from public.saas_runtime_settings
  where setting_key='client_audit_enabled';

  select coalesce((setting_value::text)::boolean,false)
  into v_customer
  from public.saas_runtime_settings
  where setting_key='customer_import_enabled';

  return query select coalesce(v_legal,false),v_doc,coalesce(v_client,false),coalesce(v_customer,false);
end;
$$;

revoke all on function public.saas_admin_get_v4_flags() from public,anon;
grant execute on function public.saas_admin_get_v4_flags() to authenticated;

commit;
