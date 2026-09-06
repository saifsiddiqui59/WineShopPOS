begin;

update public.subscription_plans
set features='["base_pos","base_products","base_inventory","base_purchasing","base_reports"]'::jsonb,
    updated_at=now()
where plan_code='BASIC';

update public.subscription_plans
set features='["base_pos","base_products","base_inventory","base_purchasing","base_reports","smart_recommendations","advanced_procurement","advanced_transfers","owner_whatsapp_summary","customer_credit"]'::jsonb,
    updated_at=now()
where plan_code='PLUS';

update public.subscription_plans
set features='["base_pos","base_products","base_inventory","base_purchasing","base_reports","smart_recommendations","advanced_procurement","advanced_transfers","owner_whatsapp_summary","customer_credit","smart_purchase_intelligence","inventory_intelligence","owner_control_center","profit_intelligence","audit_loss_control"]'::jsonb,
    updated_at=now()
where plan_code='PRO';

create or replace function public.my_feature_allowed(p_feature_key text)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(
    (
      select public.shop_access_allowed(s.id)
         and (
           p_feature_key is null
           or trim(p_feature_key)=''
           or coalesce(sp.features,'[]'::jsonb) ? trim(p_feature_key)
         )
      from public.shops s
      left join public.subscription_plans sp on sp.plan_code=s.plan_code and sp.active=true
      where s.id=public.current_shop_id()
      limit 1
    ),
    false
  );
$$;

revoke execute on function public.my_feature_allowed(text) from public, anon;
grant execute on function public.my_feature_allowed(text) to authenticated;

commit;;
