-- Incremental migration already applied to the connected Supabase project.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,email,role,status) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,'CLIENT','ACTIVE');
  insert into public.subscriptions(profile_id,plan_id,status,price,started_at,due_date)
  select new.id,p.id,'PENDING',p.price,now(),current_date from public.plans p where p.is_active=true order by p.created_at asc limit 1;
  return new;
end; $$;
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
