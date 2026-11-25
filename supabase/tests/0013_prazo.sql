-- Testes da migração 0013 (prazo ajustado: dias inteiros, depois do aceite; Q-101, D-158). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on

-- Projeto Académico com o orçamento aceite a 05/11 às 10h; prazo 10/12.
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('a0000000-0000-0000-0000-0000000013a1', 'prazo-aceite', '10000000-0000-0000-0000-0000000000a1', 'Prazo aceite', 'academic', '2026-12-10');
-- dados de teste fora dos gatilhos (o fluxo do aceite está em 0011_aceite.sql)
set session_replication_role = replica;
insert into public.quotes (project_id, version, total_kz, deposit_pct, deposit_kz, delivery_due_on, status, sent_at, accepted_at) values
  ('a0000000-0000-0000-0000-0000000013a1', 1, 60000, 50, 30000, '2026-12-10', 'aceite', '2026-11-04 10:00+01', '2026-11-05 10:00+01');
set session_replication_role = origin;

create function pg_temp.wait(k text, a text, b text) returns void language sql as $$
  insert into public.phase_events (project_id, project_phase_id, to_status, created_at)
  select 'a0000000-0000-0000-0000-0000000013a1', id, s, t::timestamptz
  from (select id from public.project_phases where project_id = 'a0000000-0000-0000-0000-0000000013a1' and key = k) p,
       (values ('aguarda_cliente', a), ('em_curso', b)) v(s, t)
$$;

-- 1) a espera do aceite (antes de haver prazo) não conta: 04/11 10h → 05/11 10h
select pg_temp.wait('orcamento-aceite', '2026-11-04 10:00+01', '2026-11-05 10:00+01');
do $$ begin
  assert project_adjusted_due('a0000000-0000-0000-0000-0000000013a1') = date '2026-12-10',
    format('a espera antes do aceite não conta: obtido %s', project_adjusted_due('a0000000-0000-0000-0000-0000000013a1'));
end $$;

-- 2) 5 minutos depois do aceite não chegam a 1 dia (antes: +1)
select pg_temp.wait('estrutura', '2026-11-06 10:00+01', '2026-11-06 10:05+01');
do $$ begin
  assert project_adjusted_due('a0000000-0000-0000-0000-0000000013a1') = date '2026-12-10',
    format('5 minutos não deslizam: obtido %s', project_adjusted_due('a0000000-0000-0000-0000-0000000013a1'));
end $$;

-- 3) mais 30 h: total 30h05 → +1 dia (só 24 h completas)
select pg_temp.wait('desenvolvimento', '2026-11-10 10:00+01', '2026-11-11 16:00+01');
do $$ begin
  assert project_adjusted_due('a0000000-0000-0000-0000-0000000013a1') = date '2026-12-11',
    format('30 h = +1 dia: obtido %s', project_adjusted_due('a0000000-0000-0000-0000-0000000013a1'));
end $$;

-- 4) uma espera que começa antes do aceite só conta a parte depois: 03/11 10h → 07/11 10h = 2 dias depois do aceite
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('a0000000-0000-0000-0000-0000000013a2', 'prazo-corte', '10000000-0000-0000-0000-0000000000a1', 'Prazo corte', 'academic', '2026-12-10');
set session_replication_role = replica;
insert into public.quotes (project_id, version, total_kz, deposit_pct, deposit_kz, delivery_due_on, status, sent_at, accepted_at) values
  ('a0000000-0000-0000-0000-0000000013a2', 1, 60000, 50, 30000, '2026-12-10', 'aceite', '2026-11-04 10:00+01', '2026-11-05 10:00+01');
set session_replication_role = origin;
insert into public.project_status_events (project_id, to_status, client_requested, created_at) values
  ('a0000000-0000-0000-0000-0000000013a2', 'pausado', true,  '2026-11-03 10:00+01'),
  ('a0000000-0000-0000-0000-0000000013a2', 'ativo',   false, '2026-11-07 10:00+01');
do $$ begin
  assert project_adjusted_due('a0000000-0000-0000-0000-0000000013a2') = date '2026-12-12',
    format('pausa cortada no aceite = +2: obtido %s', project_adjusted_due('a0000000-0000-0000-0000-0000000013a2'));
end $$;
\echo '✔ 0013: prazo ajustado — só depois do aceite e só por 24 h completas (RN-21, Q-101)'
