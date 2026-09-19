-- Source record for migration already applied to QA and PROD.
-- These exact 19-Sep sales predate terminal-aware checkout.
-- Original sales remain unchanged; no terminal identity is fabricated.

insert into public.financial_legacy_terminal_acknowledgements(
  sale_id,shop_id,business_date,reason,acknowledged_by,acknowledged_at
)
select
  s.id,
  s.shop_id,
  public.wsp_business_date(s.created_at,s.offline_created_at),
  'Legacy sale created before terminal-aware checkout was deployed; original sale preserved without inventing a terminal.',
  null,
  now()
from public.sales s
where s.shop_id='5c94dbca-9bb5-451e-831a-8cfa42d06013'::uuid
  and s.id in (
    'bc29eaa9-a8ef-4d99-bea7-d32710702516'::uuid,
    '23c4d806-d016-4cf3-b24f-8bf1a9e419c3'::uuid,
    'e2e69fc2-8b36-4bd9-b6f0-6ddb25a34b81'::uuid,
    '6ff84076-8f77-44af-aa3d-1212c1778ea7'::uuid,
    'fa152b2a-aa2f-41fc-808a-6353284bd9dc'::uuid
  )
  and s.terminal_id is null
  and public.wsp_business_date(s.created_at,s.offline_created_at)='2026-09-19'::date
on conflict (sale_id) do nothing;

insert into public.audit_logs(
  shop_id,actor_id,action,entity_type,entity_id,metadata
)
select
  a.shop_id,
  null,
  'LEGACY_TERMINAL_SALE_ACKNOWLEDGED',
  'sale',
  a.sale_id::text,
  jsonb_build_object(
    'business_date',a.business_date,
    'reason',a.reason,
    'original_terminal_id',null
  )
from public.financial_legacy_terminal_acknowledgements a
where a.shop_id='5c94dbca-9bb5-451e-831a-8cfa42d06013'::uuid
  and a.sale_id in (
    'bc29eaa9-a8ef-4d99-bea7-d32710702516'::uuid,
    '23c4d806-d016-4cf3-b24f-8bf1a9e419c3'::uuid,
    'e2e69fc2-8b36-4bd9-b6f0-6ddb25a34b81'::uuid,
    '6ff84076-8f77-44af-aa3d-1212c1778ea7'::uuid,
    'fa152b2a-aa2f-41fc-808a-6353284bd9dc'::uuid
  )
  and not exists(
    select 1
    from public.audit_logs l
    where l.action='LEGACY_TERMINAL_SALE_ACKNOWLEDGED'
      and l.entity_id=a.sale_id::text
  );
