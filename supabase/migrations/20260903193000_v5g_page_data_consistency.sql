begin;

create temporary table _v5g_supplier_merge on commit drop as
with n as (
  select s.*,
    regexp_replace(lower(coalesce(s.supplier_name,'')), '[^a-z0-9]+','','g') norm
  from public.suppliers s
),
r as (
  select id,shop_id,norm,
    first_value(id) over(
      partition by shop_id,norm
      order by
        (nullif(trim(gst_number),'') is not null) desc,
        (nullif(trim(email),'') is not null) desc,
        (nullif(trim(mobile),'') is not null) desc,
        created_at asc,id
    ) canonical_id,
    row_number() over(
      partition by shop_id,norm
      order by
        (nullif(trim(gst_number),'') is not null) desc,
        (nullif(trim(email),'') is not null) desc,
        (nullif(trim(mobile),'') is not null) desc,
        created_at asc,id
    ) rn
  from n where nullif(norm,'') is not null
)
select id duplicate_id,canonical_id from r where rn>1;

delete from public.product_aliases d
using _v5g_supplier_merge m
where d.supplier_id=m.duplicate_id
and exists(
  select 1 from public.product_aliases c
  where c.shop_id=d.shop_id
    and c.supplier_id=m.canonical_id
    and c.alias_text=d.alias_text
);

update public.product_aliases x set supplier_id=m.canonical_id
from _v5g_supplier_merge m where x.supplier_id=m.duplicate_id;
update public.inventory_receipt_lots x set supplier_id=m.canonical_id
from _v5g_supplier_merge m where x.supplier_id=m.duplicate_id;
update public.purchase_orders x set supplier_id=m.canonical_id
from _v5g_supplier_merge m where x.supplier_id=m.duplicate_id;
update public.purchase_returns x set supplier_id=m.canonical_id
from _v5g_supplier_merge m where x.supplier_id=m.duplicate_id;
update public.supplier_payments x set supplier_id=m.canonical_id
from _v5g_supplier_merge m where x.supplier_id=m.duplicate_id;

update public.purchases p
set supplier_id=m.canonical_id,
    supplier_name_snapshot=regexp_replace(trim(c.supplier_name),'[[:space:]]+',' ','g')
from _v5g_supplier_merge m
join public.suppliers c on c.id=m.canonical_id
where p.supplier_id=m.duplicate_id;

delete from public.suppliers s
using _v5g_supplier_merge m
where s.id=m.duplicate_id;

update public.suppliers
set supplier_name=regexp_replace(trim(supplier_name),'[[:space:]]+',' ','g');

update public.purchases p
set supplier_name_snapshot=s.supplier_name
from public.suppliers s
where p.supplier_id=s.id
  and p.supplier_name_snapshot is distinct from s.supplier_name;

create unique index if not exists suppliers_shop_normalized_name_unique
on public.suppliers(
  shop_id,
  (regexp_replace(lower(coalesce(supplier_name,'')), '[^a-z0-9]+','','g'))
)
where nullif(regexp_replace(lower(coalesce(supplier_name,'')), '[^a-z0-9]+','','g'),'') is not null;

do $$
declare
  r record;
  m text[];
  fixed date;
begin
  for r in
    select id,purchase_id,normalized_invoice->>'invoiceDateRaw' raw_date
    from public.invoice_ingestions
    where coalesce(normalized_invoice->>'invoiceDateRaw','')
      ~ '^[[:space:]]*[0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{4}[[:space:]]*$'
  loop
    m:=regexp_match(trim(r.raw_date),'^([0-9]{1,2})[-/.]([0-9]{1,2})[-/.]([0-9]{4})$');
    if m is null then continue; end if;
    begin
      fixed:=make_date(m[3]::int,m[2]::int,m[1]::int);
    exception when others then
      continue;
    end;

    update public.invoice_ingestions
    set extracted_invoice_date=fixed::text,
        normalized_invoice=
          jsonb_set(
            jsonb_set(
              jsonb_set(coalesce(normalized_invoice,'{}'::jsonb),
                '{invoiceDate}',to_jsonb(fixed::text),true),
              '{invoiceDateSource}',to_jsonb('RAW_DMY_DATE'::text),true),
            '{invoiceDateReviewRequired}','false'::jsonb,true)
    where id=r.id;

    if r.purchase_id is not null then
      update public.purchases set invoice_date=fixed where id=r.purchase_id;
    end if;
  end loop;
end
$$;

commit;
