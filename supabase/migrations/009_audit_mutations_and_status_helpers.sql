-- Incremental migration already applied to the connected Supabase project.
create or replace function public.audit_loan_update() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.principal_current is distinct from new.principal_current then insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason) values(new.profile_id,'UPDATE','loan',new.id,'principal_current',old.principal_current::text,new.principal_current::text,'Alteração direta do cadastro da operação'); end if;
  if old.person_id is distinct from new.person_id then insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason) values(new.profile_id,'UPDATE','loan',new.id,'person_id',old.person_id::text,new.person_id::text,'Pessoa alterada'); end if;
  if old.rate_value is distinct from new.rate_value then insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason) values(new.profile_id,'UPDATE','loan',new.id,'rate_value',old.rate_value::text,new.rate_value::text,'Taxa alterada'); end if;
  if old.due_date is distinct from new.due_date then insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason) values(new.profile_id,'UPDATE','loan',new.id,'due_date',old.due_date::text,new.due_date::text,'Vencimento alterado'); end if;
  return new;
end; $$;
drop trigger if exists trg_audit_loan_update on public.loans;
create trigger trg_audit_loan_update after update on public.loans for each row execute function public.audit_loan_update();
create or replace function public.loan_status_for(p_due_date date,p_principal numeric,p_initial numeric) returns public.loan_status language sql stable set search_path='' as $$ select case when p_principal<=0 then 'PAID'::public.loan_status when p_due_date<current_date then 'OVERDUE'::public.loan_status when p_due_date<=current_date+coalesce((select (value #>> '{}')::int from public.settings where key='near_due_days'),3) then 'NEAR_DUE'::public.loan_status when p_principal<p_initial then 'PARTIAL'::public.loan_status else 'ACTIVE'::public.loan_status end $$;
