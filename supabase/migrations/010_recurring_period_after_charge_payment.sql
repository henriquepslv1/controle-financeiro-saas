-- Incremental migration already applied to the connected Supabase project.
create or replace function public.record_payment(p_loan_id uuid,p_loan_period_id uuid,p_total numeric,p_charge numeric,p_principal numeric,p_payment_date date,p_method public.payment_method,p_notes text default null) returns public.payments language plpgsql security definer set search_path='public' as $$
declare v_payment public.payments; v_profile uuid; v_period public.loan_periods; v_loan public.loans; v_next_start date; v_next_end date; v_new_period public.loan_periods;
begin
 if p_total<=0 or p_charge<0 or p_principal<0 or round(p_total,2)<>round(p_charge+p_principal,2) then raise exception 'invalid payment split'; end if;
 select * into v_loan from public.loans where id=p_loan_id; if not found then raise exception 'loan not found'; end if; v_profile:=v_loan.profile_id;
 if auth.uid() is null or (auth.uid()<>v_profile and not public.is_master_admin()) then raise exception 'not authorized'; end if;
 if p_loan_period_id is not null then select * into v_period from public.loan_periods where id=p_loan_period_id and loan_id=p_loan_id; if not found then raise exception 'period does not belong to loan'; end if; end if;
 insert into public.payments(loan_id,loan_period_id,total_amount,charge_amount,principal_amount,payment_date,payment_method,notes,created_by) values(p_loan_id,p_loan_period_id,round(p_total,2),round(p_charge,2),round(p_principal,2),coalesce(p_payment_date,current_date),p_method,p_notes,auth.uid()) returning * into v_payment;
 if p_loan_period_id is not null then update public.loan_periods lp set amount_paid=least(lp.calculated_charge,lp.amount_paid+p_charge),remaining_charge=greatest(lp.calculated_charge-(lp.amount_paid+p_charge),0),status=case when lp.amount_paid+p_charge>=lp.calculated_charge then 'PAID' else 'PARTIAL' end where lp.id=p_loan_period_id returning * into v_period; end if;
 perform public.recalculate_loan(p_loan_id); select * into v_loan from public.loans where id=p_loan_id;
 if p_loan_period_id is not null and v_period.status='PAID' and v_loan.principal_current>0 then v_next_start:=v_period.end_date+1; v_next_end:=(v_period.end_date+interval '1 month')::date; if not exists(select 1 from public.loan_periods where loan_id=p_loan_id and start_date=v_next_start and end_date=v_next_end) then select * into v_new_period from public.create_loan_period(p_loan_id,v_next_start,v_next_end); update public.loans set due_date=v_next_end where id=p_loan_id; end if; end if;
 perform public.recalculate_loan(p_loan_id);
 insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason) values(auth.uid(),'PAYMENT_CREATED','payments',v_payment.id,'allocation',null,jsonb_build_object('total',p_total,'charge',p_charge,'principal',p_principal)::text,p_notes);
 return v_payment;
end; $$;
