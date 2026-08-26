-- Hardens authenticated RPC endpoints against cross-account access.
-- create_loan_period and recalculate_loan are intentionally SECURITY DEFINER
-- because they perform controlled writes, but they now enforce ownership
-- (or MASTER_ADMIN) whenever called with an authenticated user context.

create or replace function public.create_loan_period(p_loan_id uuid, p_start date, p_end date)
returns public.loan_periods
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_loan public.loans;
  v_charge numeric;
  v_period public.loan_periods;
begin
  select * into v_loan from public.loans where id = p_loan_id;
  if not found then raise exception 'loan not found'; end if;

  if auth.uid() is not null
     and auth.uid() <> v_loan.profile_id
     and not public.is_master_admin() then
    raise exception 'not authorized';
  end if;

  if p_start is null or p_end is null or p_end < p_start then
    raise exception 'invalid period dates';
  end if;

  v_charge := public.calculate_period_charge(v_loan.principal_current, v_loan.rate_value);

  insert into public.loan_periods(
    loan_id,start_date,end_date,base_principal,configured_rule,
    calculated_charge,amount_paid,remaining_charge,status
  ) values (
    p_loan_id,p_start,p_end,v_loan.principal_current,
    jsonb_build_object('rate_type',v_loan.rate_type,'rate_value',v_loan.rate_value),
    v_charge,0,v_charge,'OPEN'
  ) returning * into v_period;

  return v_period;
end;
$function$;

create or replace function public.recalculate_loan(p_loan_id uuid)
returns public.loans
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_loan public.loans;
  v_paid_principal numeric;
  v_new_principal numeric;
  v_status public.loan_status;
  v_near_days integer := 3;
begin
  select * into v_loan from public.loans where id = p_loan_id for update;
  if not found then raise exception 'loan not found'; end if;

  if auth.uid() is not null
     and auth.uid() <> v_loan.profile_id
     and not public.is_master_admin() then
    raise exception 'not authorized';
  end if;

  select coalesce(sum(amount) filter (where type='ADD_PRINCIPAL'),0) -
         coalesce(sum(amount) filter (where type='REDUCE_PRINCIPAL'),0)
    into v_paid_principal
  from public.loan_adjustments where loan_id=p_loan_id;

  select greatest(
    v_loan.principal_initial + v_paid_principal - coalesce(sum(p.principal_amount),0),
    0
  ) into v_new_principal
  from public.payments p where p.loan_id=p_loan_id;

  if v_new_principal = 0 then
    v_status := 'PAID';
  elsif v_loan.due_date < current_date then
    v_status := 'OVERDUE';
  elsif v_loan.due_date <= current_date + v_near_days then
    v_status := 'NEAR_DUE';
  elsif exists(select 1 from public.payments p where p.loan_id=p_loan_id) then
    v_status := 'PARTIAL';
  else
    v_status := 'ACTIVE';
  end if;

  update public.loans
     set principal_current=v_new_principal,
         status=v_status,
         updated_at=now()
   where id=p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$function$;
