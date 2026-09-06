begin;

insert into public.platform_runtime_config(
  environment_code,current_version,minimum_supported_version,force_update,update_message,
  flash_enabled,flash_level,flash_message,maintenance_mode,maintenance_message,updated_at,updated_by
)
select 'DEFAULT',current_version,minimum_supported_version,force_update,update_message,
       flash_enabled,flash_level,flash_message,maintenance_mode,maintenance_message,updated_at,updated_by
from public.platform_runtime_config
where environment_code='DEV'
on conflict(environment_code) do nothing;

delete from public.platform_runtime_config where environment_code='DEV';

create or replace function public.get_public_runtime_config()
returns table(
  environment_code text,
  current_version text,
  minimum_supported_version text,
  force_update boolean,
  update_message text,
  flash_enabled boolean,
  flash_level text,
  flash_message text,
  maintenance_mode boolean,
  maintenance_message text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  select c.environment_code,c.current_version,c.minimum_supported_version,c.force_update,c.update_message,c.flash_enabled,c.flash_level,c.flash_message,c.maintenance_mode,c.maintenance_message,c.updated_at
  from public.platform_runtime_config c
  where c.environment_code='DEFAULT'
  limit 1;
$$;

create or replace function public.platform_set_runtime_config(
  p_current_version text,
  p_minimum_supported_version text default null,
  p_force_update boolean default false,
  p_update_message text default null,
  p_flash_enabled boolean default false,
  p_flash_level text default 'INFO',
  p_flash_message text default null,
  p_maintenance_mode boolean default false,
  p_maintenance_message text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_level text := upper(trim(coalesce(p_flash_level,'INFO')));
begin
  if not public.is_platform_admin() then raise exception 'PLATFORM_ADMIN_REQUIRED'; end if;
  if v_level not in ('INFO','SUCCESS','WARNING','CRITICAL') then raise exception 'INVALID_FLASH_LEVEL'; end if;
  insert into public.platform_runtime_config(environment_code,current_version,minimum_supported_version,force_update,update_message,flash_enabled,flash_level,flash_message,maintenance_mode,maintenance_message,updated_at,updated_by)
  values('DEFAULT',coalesce(nullif(trim(p_current_version),''),'V4'),nullif(trim(coalesce(p_minimum_supported_version,'')),''),coalesce(p_force_update,false),nullif(trim(coalesce(p_update_message,'')),''),coalesce(p_flash_enabled,false),v_level,nullif(trim(coalesce(p_flash_message,'')),''),coalesce(p_maintenance_mode,false),nullif(trim(coalesce(p_maintenance_message,'')),''),now(),auth.uid())
  on conflict(environment_code) do update set
    current_version=excluded.current_version,
    minimum_supported_version=excluded.minimum_supported_version,
    force_update=excluded.force_update,
    update_message=excluded.update_message,
    flash_enabled=excluded.flash_enabled,
    flash_level=excluded.flash_level,
    flash_message=excluded.flash_message,
    maintenance_mode=excluded.maintenance_mode,
    maintenance_message=excluded.maintenance_message,
    updated_at=now(),
    updated_by=auth.uid();
end;
$$;

commit;;
