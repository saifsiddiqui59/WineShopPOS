-- Applied to production on 2026-09-01.
-- Allows correction of physically counted cash on CLOSE_REQUESTED before approval.
create or replace function public.revise_shift_actual_cash(
  p_shift_id uuid,
  p_actual_cash numeric,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_shop uuid;
  v_shift public.cashier_shifts%rowtype;
begin
  v_shop := public.assert_shop_access();
  if p_actual_cash is null then raise exception 'Actual cash is required'; end if;
  if p_actual_cash < 0 then raise exception 'Actual cash cannot be negative'; end if;

  select * into v_shift
  from public.cashier_shifts
  where id=p_shift_id and shop_id=v_shop and status='CLOSE_REQUESTED'
  for update;
  if not found then raise exception 'Close request not found'; end if;

  if v_shift.cashier_id <> auth.uid()
     and public.current_user_role() not in ('ADMIN','MANAGER') then
    raise exception 'Not authorized to revise this shift close';
  end if;

  update public.cashier_shifts
  set actual_cash=p_actual_cash,
      cash_difference=p_actual_cash-coalesce(expected_cash,0),
      notes=concat_ws(E'\n',notes,p_notes)
  where id=p_shift_id;

  perform public.write_audit(
    v_shop,'SHIFT_ACTUAL_CASH_REVISED','cashier_shift',p_shift_id::text,
    null,null,
    jsonb_build_object(
      'previous_actual_cash',v_shift.actual_cash,
      'new_actual_cash',p_actual_cash,
      'expected_cash',v_shift.expected_cash,
      'note',p_notes
    )
  );
end;
$$;
revoke all on function public.revise_shift_actual_cash(uuid,numeric,text) from public;
revoke all on function public.revise_shift_actual_cash(uuid,numeric,text) from anon;
grant execute on function public.revise_shift_actual_cash(uuid,numeric,text) to authenticated;
