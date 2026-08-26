-- Controle.Financeiro V8.1
-- Administração segura de assinaturas pelo MASTER_ADMIN.
-- O frontend pode chamar estas funções sem executar SQL manualmente.

create or replace function public.master_activate_subscription(p_profile_id uuid, p_days integer default null)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.subscriptions;
  v_plan public.plans;
  v_days integer;
  v_start date := current_date;
  v_due date;
begin
  if auth.uid() is null or not public.is_master_admin() then
    raise exception 'not authorized';
  end if;

  select s.* into v_sub from public.subscriptions s where s.profile_id=p_profile_id for update;
  if not found then raise exception 'subscription not found'; end if;

  select * into v_plan from public.plans where id=v_sub.plan_id;
  v_days := coalesce(p_days, v_plan.period_days, 30);
  if v_days <= 0 then raise exception 'invalid period'; end if;
  v_due := v_start + v_days;

  update public.subscriptions
     set status='ACTIVE', started_at=coalesce(started_at,now()), due_date=v_due,
         last_payment_at=now(), price=coalesce(v_sub.price,v_plan.price), updated_at=now()
   where id=v_sub.id
   returning * into v_sub;

  update public.profiles set status='ACTIVE', updated_at=now() where id=p_profile_id;

  insert into public.subscription_payments(subscription_id,amount,payment_date,period_start,period_end,method,notes,created_by)
  values(v_sub.id,v_sub.price,current_date,v_start,v_due,'MANUAL','Ativação manual pelo Administrador Master',auth.uid());

  insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason)
  values(auth.uid(),'SUBSCRIPTION_ACTIVATED','subscription',v_sub.id,'status','PENDING','ACTIVE','Ativação manual pelo Administrador Master');

  return v_sub;
end;
$$;

create or replace function public.master_set_subscription_status(p_profile_id uuid, p_status public.subscription_status, p_reason text default null)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare v_sub public.subscriptions; v_old text;
begin
  if auth.uid() is null or not public.is_master_admin() then raise exception 'not authorized'; end if;
  select * into v_sub from public.subscriptions where profile_id=p_profile_id for update;
  if not found then raise exception 'subscription not found'; end if;
  v_old:=v_sub.status::text;
  update public.subscriptions set status=p_status,updated_at=now() where id=v_sub.id returning * into v_sub;
  update public.profiles set status=case when p_status in ('ACTIVE','EXPIRING') then 'ACTIVE'::user_status else 'SUSPENDED'::user_status end,updated_at=now() where id=p_profile_id;
  insert into public.audit_logs(profile_id,action,entity,entity_id,field,old_value,new_value,reason)
  values(auth.uid(),'SUBSCRIPTION_STATUS_CHANGED','subscription',v_sub.id,'status',v_old,p_status::text,p_reason);
  return v_sub;
end;
$$;

revoke all on function public.master_activate_subscription(uuid,integer) from public,anon;
grant execute on function public.master_activate_subscription(uuid,integer) to authenticated;
revoke all on function public.master_set_subscription_status(uuid,public.subscription_status,text) from public,anon;
grant execute on function public.master_set_subscription_status(uuid,public.subscription_status,text) to authenticated;
