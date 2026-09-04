-- Applied to production on 2026-09-01.
-- Static original bottle/can images.

alter table public.products
  add column if not exists image_path text;

insert into storage.buckets(
  id,name,public,file_size_limit,allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists product_images_read_shop on storage.objects;
create policy product_images_read_shop
on storage.objects for select to authenticated
using (
  bucket_id='product-images'
  and (storage.foldername(name))[1]=public.current_shop_id()::text
);

drop policy if exists product_images_insert_manager on storage.objects;
create policy product_images_insert_manager
on storage.objects for insert to authenticated
with check (
  bucket_id='product-images'
  and (storage.foldername(name))[1]=public.current_shop_id()::text
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists product_images_update_manager on storage.objects;
create policy product_images_update_manager
on storage.objects for update to authenticated
using (
  bucket_id='product-images'
  and (storage.foldername(name))[1]=public.current_shop_id()::text
  and public.current_user_role() in ('ADMIN','MANAGER')
)
with check (
  bucket_id='product-images'
  and (storage.foldername(name))[1]=public.current_shop_id()::text
  and public.current_user_role() in ('ADMIN','MANAGER')
);

drop policy if exists product_images_delete_manager on storage.objects;
create policy product_images_delete_manager
on storage.objects for delete to authenticated
using (
  bucket_id='product-images'
  and (storage.foldername(name))[1]=public.current_shop_id()::text
  and public.current_user_role() in ('ADMIN','MANAGER')
);

create or replace function public.get_product_images()
returns table(product_id uuid,image_path text)
language sql
stable security definer
set search_path='public'
as $$
  select p.id,p.image_path
  from public.products p
  where p.shop_id=public.assert_shop_access();
$$;

revoke all on function public.get_product_images() from public;
revoke all on function public.get_product_images() from anon;
grant execute on function public.get_product_images() to authenticated;

create or replace function public.set_product_image(
  p_product_id uuid,
  p_image_path text
)
returns void
language plpgsql
security definer
set search_path='public'
as $$
declare
  v_shop uuid;
  v_path text;
begin
  v_shop:=public.assert_shop_access();
  perform public.assert_manager_or_admin();

  v_path:=nullif(btrim(p_image_path),'');
  if v_path is not null and split_part(v_path,'/',1)<>v_shop::text then
    raise exception 'Image path must belong to current shop';
  end if;

  update public.products
  set image_path=v_path
  where id=p_product_id and shop_id=v_shop;

  if not found then
    raise exception 'Product not found';
  end if;
end;
$$;

revoke all on function public.set_product_image(uuid,text) from public;
revoke all on function public.set_product_image(uuid,text) from anon;
grant execute on function public.set_product_image(uuid,text) to authenticated;
