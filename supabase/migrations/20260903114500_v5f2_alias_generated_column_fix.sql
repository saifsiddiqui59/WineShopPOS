-- WineShopPOS V3 / V5-F.2
-- Root cause:
--   public.product_aliases.normalized_alias is GENERATED ALWAYS.
--   V5-F remember_product_alias() incorrectly inserted a manual value into it.
-- Fix:
--   Never insert/update normalized_alias directly. PostgreSQL derives it from alias_text.

create or replace function public.remember_product_alias(
  p_product_id uuid,
  p_alias_text text,
  p_supplier_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_shop uuid;
  v_normalized text;
  v_id uuid;
begin
  v_shop := public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if not exists(
    select 1
    from public.products p
    where p.id = p_product_id
      and p.shop_id = v_shop
      and p.active = true
  ) then
    raise exception 'Product not found in current shop';
  end if;

  v_normalized := lower(
    regexp_replace(
      trim(coalesce(p_alias_text, '')),
      '[^a-zA-Z0-9]+',
      ' ',
      'g'
    )
  );

  if length(trim(v_normalized)) < 3 then
    raise exception 'Alias text is too short';
  end if;

  select pa.id
    into v_id
  from public.product_aliases pa
  where pa.shop_id = v_shop
    and pa.normalized_alias = v_normalized
    and (
      (p_supplier_id is null and pa.supplier_id is null)
      or pa.supplier_id = p_supplier_id
    )
  order by pa.created_at desc
  limit 1
  for update;

  if v_id is not null then
    update public.product_aliases
    set product_id = p_product_id,
        alias_text = trim(p_alias_text),
        created_by = auth.uid()
    where id = v_id;

    return v_id;
  end if;

  -- normalized_alias is GENERATED ALWAYS: DO NOT list it here.
  insert into public.product_aliases(
    shop_id,
    product_id,
    supplier_id,
    alias_text,
    created_by
  )
  values(
    v_shop,
    p_product_id,
    p_supplier_id,
    trim(p_alias_text),
    auth.uid()
  )
  returning id into v_id;

  perform public.write_audit(
    v_shop,
    'PRODUCT_ALIAS_REMEMBERED',
    'product',
    p_product_id::text,
    null,
    jsonb_build_object(
      'alias_text', trim(p_alias_text),
      'normalized_alias', v_normalized,
      'supplier_id', p_supplier_id
    ),
    jsonb_build_object(
      'inventory_changed', false,
      'product_master_changed', false
    )
  );

  return v_id;
end;
$$;

grant execute on function public.remember_product_alias(uuid,text,uuid)
  to authenticated;
