create table if not exists public.product_enrichment_cache (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  cache_key text not null,
  query_text text not null,
  query_size_ml integer,
  query_barcode text,
  response jsonb not null,
  providers text[] not null default '{}',
  hit_count integer not null default 0,
  expires_at timestamptz not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(shop_id, cache_key)
);

create index if not exists product_enrichment_cache_expiry_idx
  on public.product_enrichment_cache(shop_id, expires_at);

alter table public.product_enrichment_cache enable row level security;
revoke all on public.product_enrichment_cache from anon, authenticated;

create or replace function public.resolve_product_master_text(
  p_text text,
  p_size_ml integer default null,
  p_supplier_id uuid default null,
  p_limit integer default 8
)
returns table(
  product_id uuid,
  barcode text,
  product_name text,
  brand text,
  size_ml integer,
  score numeric,
  match_source text
)
language sql
stable
security definer
set search_path=public
as $$
  with q as (
    select lower(regexp_replace(coalesce(p_text,''),'[^a-zA-Z0-9]+',' ','g')) as txt
  ),
  alias_matches as (
    select
      pa.product_id,
      p.barcode,
      p.product_name,
      p.brand,
      p.size_ml,
      least(
        1::numeric,
        similarity(coalesce(pa.normalized_alias,''),q.txt)::numeric
          + case when p_size_ml is not null and p.size_ml=p_size_ml then 0.08 else 0 end
      ) as score,
      'ALIAS'::text as source
    from public.product_aliases pa
    join public.products p on p.id=pa.product_id
    cross join q
    where pa.shop_id=public.assert_shop_access()
      and p.active=true
      and (pa.supplier_id is null or p_supplier_id is null or pa.supplier_id=p_supplier_id)
  ),
  product_matches as (
    select
      p.id as product_id,
      p.barcode,
      p.product_name,
      p.brand,
      p.size_ml,
      least(
        1::numeric,
        greatest(
          similarity(lower(coalesce(p.product_name,'')),q.txt),
          similarity(lower(coalesce(p.brand,'')||' '||coalesce(p.product_name,'')||' '||coalesce(p.size_ml::text,'')),q.txt)
        )::numeric
        + case when p_size_ml is not null and p.size_ml=p_size_ml then 0.08 else 0 end
        + case when length(trim(coalesce(p.brand,'')))>=3 and q.txt like '%'||lower(trim(p.brand))||'%' then 0.03 else 0 end
      ) as score,
      'PRODUCT_MASTER'::text as source
    from public.products p
    cross join q
    where p.shop_id=public.assert_shop_access()
      and p.active=true
  ),
  combined as (
    select * from alias_matches
    union all
    select * from product_matches
  ),
  ranked as (
    select *, row_number() over(partition by product_id order by score desc) as rn
    from combined
  )
  select product_id,barcode,product_name,brand,size_ml,round(score,3),source
  from ranked
  where rn=1 and score>0.10
  order by score desc, product_name
  limit greatest(1,least(coalesce(p_limit,8),20));
$$;

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
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  if not exists(
    select 1 from public.products p
    where p.id=p_product_id and p.shop_id=v_shop and p.active=true
  ) then
    raise exception 'Product not found in current shop';
  end if;

  v_normalized:=lower(regexp_replace(trim(coalesce(p_alias_text,'')),'[^a-zA-Z0-9]+',' ','g'));
  v_normalized:=regexp_replace(v_normalized,'\s+',' ','g');
  if length(v_normalized)<3 then raise exception 'Alias text is too short'; end if;

  select pa.id into v_id
  from public.product_aliases pa
  where pa.shop_id=v_shop
    and pa.normalized_alias=v_normalized
    and ((p_supplier_id is null and pa.supplier_id is null) or pa.supplier_id=p_supplier_id)
  order by pa.created_at desc
  limit 1
  for update;

  if v_id is not null then
    update public.product_aliases
    set product_id=p_product_id,
        alias_text=trim(p_alias_text),
        created_by=auth.uid()
    where id=v_id;
    return v_id;
  end if;

  insert into public.product_aliases(
    shop_id,product_id,supplier_id,alias_text,normalized_alias,created_by
  ) values(
    v_shop,p_product_id,p_supplier_id,trim(p_alias_text),v_normalized,auth.uid()
  ) returning id into v_id;

  perform public.write_audit(
    v_shop,'PRODUCT_ALIAS_REMEMBERED','product',p_product_id::text,
    null,
    jsonb_build_object('alias_text',trim(p_alias_text),'normalized_alias',v_normalized,'supplier_id',p_supplier_id),
    jsonb_build_object('inventory_changed',false,'product_master_changed',false)
  );

  return v_id;
end;
$$;

grant execute on function public.resolve_product_master_text(text,integer,uuid,integer) to authenticated;
grant execute on function public.remember_product_alias(uuid,text,uuid) to authenticated;
