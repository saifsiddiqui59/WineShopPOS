-- V6 ShopAI authoritative review role-context fix.
-- PROD was already hotfixed with this exact migration through the connected
-- Supabase migration action. Repository history is synchronized by source
-- release only; do not replay this DDL from the source-sync executor.

create or replace function public.guard_invoice_shopai_review_authority()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_jwt_role text:=coalesce(auth.role()::text,'');
  v_legacy_jwt_role text:=coalesce(current_setting('request.jwt.claim.role',true),'');
  v_privileged boolean:=false;
begin
  v_privileged:=
    v_jwt_role='service_role'
    or v_legacy_jwt_role='service_role'
    or current_user in ('postgres','supabase_admin','service_role');

  if tg_op='INSERT' then
    if new.shopai_review is not null and not v_privileged then
      raise exception 'SHOPAI_REVIEW_SERVER_ONLY: authoritative ShopAI review can only be written by the server';
    end if;
    return new;
  end if;

  if (
    new.shopai_review is distinct from old.shopai_review
    or new.shopai_review_updated_at is distinct from old.shopai_review_updated_at
  ) and not v_privileged then
    raise exception 'SHOPAI_REVIEW_SERVER_ONLY: authoritative ShopAI review can only be changed by the server';
  end if;

  return new;
end;
$$;

comment on function public.guard_invoice_shopai_review_authority() is
  'Allows authoritative ShopAI review writes only for trusted server roles. Uses auth.role/current_user service_role plus legacy JWT role compatibility.';

