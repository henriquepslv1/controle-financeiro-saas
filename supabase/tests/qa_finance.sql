-- QA manual para o motor financeiro.
-- Execute em ambiente de desenvolvimento. Cada bloco usa ROLLBACK e não deixa dados de teste.

-- 1) R$60 somente encargo: principal permanece R$300 e abre o próximo período.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where email='paulohp.silva99@gmail.com'),true);
create temp table qa_one(principal numeric, periods bigint, status text);
do $$
declare v_person uuid; v_loan uuid; v_period uuid;
begin
  insert into public.people(profile_id,name) values ((select id from public.profiles where email='paulohp.silva99@gmail.com'),'QA') returning id into v_person;
  insert into public.loans(profile_id,person_id,operation_date,principal_initial,principal_current,rate_type,rate_value,due_date)
  values ((select id from public.profiles where email='paulohp.silva99@gmail.com'),v_person,current_date,300,300,'PERCENT_MONTHLY',20,current_date+30) returning id into v_loan;
  select id into v_period from public.create_loan_period(v_loan,current_date,current_date+30);
  perform public.record_payment(v_loan,v_period,60,60,0,current_date,'PIX','QA');
  insert into qa_one select (select principal_current from public.loans where id=v_loan),(select count(*) from public.loan_periods where loan_id=v_loan),(select status from public.loan_periods where id=v_period);
end $$;
select * from qa_one; -- esperado: 300.00 | 2 | PAID
rollback;

-- 2) R$110 = R$60 encargo + R$50 principal: principal fica R$250 e próximo encargo R$50.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where email='paulohp.silva99@gmail.com'),true);
create temp table qa_two(principal numeric, next_charge numeric);
do $$
declare v_person uuid; v_loan uuid; v_period uuid;
begin
  insert into public.people(profile_id,name) values ((select id from public.profiles where email='paulohp.silva99@gmail.com'),'QA') returning id into v_person;
  insert into public.loans(profile_id,person_id,operation_date,principal_initial,principal_current,rate_type,rate_value,due_date)
  values ((select id from public.profiles where email='paulohp.silva99@gmail.com'),v_person,current_date,300,300,'PERCENT_MONTHLY',20,current_date+30) returning id into v_loan;
  select id into v_period from public.create_loan_period(v_loan,current_date,current_date+30);
  perform public.record_payment(v_loan,v_period,110,60,50,current_date,'PIX','QA');
  insert into qa_two select (select principal_current from public.loans where id=v_loan),(select principal_current*rate_value/100 from public.loans where id=v_loan);
end $$;
select * from qa_two; -- esperado: 250.00 | 50.00
rollback;
