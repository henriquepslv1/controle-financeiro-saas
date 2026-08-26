create schema if not exists private;
create or replace function private.has_active_subscription(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.profile_id = p_user_id
      and s.status in ('ACTIVE','EXPIRING')
      and s.due_date + coalesce((select (value::text)::integer from public.settings where key='grace_period_days'),3) >= current_date
  );
$$;
revoke all on function private.has_active_subscription(uuid) from public, anon, authenticated;

-- Replace owner policies with subscription-aware policies. MASTER_ADMIN remains unrestricted.
drop policy if exists people_owner on public.people;
create policy people_owner on public.people for all to authenticated
using ((select is_master_admin()) or ((select auth.uid()) = profile_id and (select private.has_active_subscription((select auth.uid())))))
with check ((select is_master_admin()) or ((select auth.uid()) = profile_id and (select private.has_active_subscription((select auth.uid())))));

drop policy if exists loans_owner on public.loans;
create policy loans_owner on public.loans for all to authenticated
using ((select is_master_admin()) or ((select auth.uid()) = profile_id and (select private.has_active_subscription((select auth.uid())))))
with check ((select is_master_admin()) or ((select auth.uid()) = profile_id and (select private.has_active_subscription((select auth.uid())))));

drop policy if exists adjustments_owner on public.loan_adjustments;
create policy adjustments_owner on public.loan_adjustments for all to authenticated
using ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = loan_adjustments.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))))
with check ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = loan_adjustments.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))));

drop policy if exists periods_owner on public.loan_periods;
create policy periods_owner on public.loan_periods for all to authenticated
using ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = loan_periods.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))))
with check ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = loan_periods.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))));

drop policy if exists payments_owner on public.payments;
create policy payments_owner on public.payments for all to authenticated
using ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = payments.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))))
with check ((select is_master_admin()) or ((exists (select 1 from public.loans l where l.id = payments.loan_id and l.profile_id = (select auth.uid()))) and (select private.has_active_subscription((select auth.uid())))));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare v_plan uuid;
begin
  insert into public.profiles(id,full_name,email,role,status)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,'CLIENT','ACTIVE');
  select id into v_plan from public.plans where is_active = true order by price asc limit 1;
  if v_plan is not null then
    insert into public.subscriptions(profile_id,plan_id,status,price,started_at,due_date)
    select new.id,p.id,'PENDING',p.price,now(),current_date from public.plans p where p.id=v_plan;
  end if;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
