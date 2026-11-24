-- Testes da migração 0006 (tipo de serviço e fases como dados). Corre com: bash scripts/db-test.sh
-- Cada DO falha com uma mensagem clara se a regra não se cumprir.
\set ON_ERROR_STOP 1

-- ───────── Dados de teste (como superutilizador) ─────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000ad', 'admin@test'),
  ('00000000-0000-0000-0000-0000000000a1', 'a@test'),
  ('00000000-0000-0000-0000-0000000000b1', 'b@test');
insert into public.clients (id, user_id, name, email, must_change_password) values
  ('10000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'Cliente A', 'a@test', false),
  ('10000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b1', 'Cliente B', 'b@test', false);

-- Projeto "antigo" (sem service_type explícito) → development, com GitHub.
insert into public.projects (id, slug, client_id, name, github_owner, github_repo) values
  ('20000000-0000-0000-0000-00000000de01', 'app-a', '10000000-0000-0000-0000-0000000000a1', 'App A', 'lemosGit', 'app');
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('20000000-0000-0000-0000-0000000aca01', 'mono-a', '10000000-0000-0000-0000-0000000000a1', 'Monografia A', 'academic', '2026-12-12'),
  ('20000000-0000-0000-0000-0000000de501', 'convite-b', '10000000-0000-0000-0000-0000000000b1', 'Convite B', 'design', '2027-02-05');

-- ───────── B1/B2: fases por serviço ─────────
do $$ begin
  assert (select service_type from projects where slug = 'app-a') = 'development', 'default development';
  assert (select count(*) from project_phases where project_id = '20000000-0000-0000-0000-00000000de01') = 0, 'Tech sem fases na BD';
  assert (select count(*) from project_phases where project_id = '20000000-0000-0000-0000-0000000aca01') = 7, 'Académico com 7 fases';
  assert (select count(*) from project_phases where project_id = '20000000-0000-0000-0000-0000000de501') = 7, 'Design com 7 fases';
  assert (select string_agg(key, ',' order by position) from project_phases where project_id = '20000000-0000-0000-0000-0000000de501')
         = 'briefing,orcamento-sinal,conceito,revisoes,aprovacao-arte,producao,entrega-levantamento', 'ordem do Design';
  assert (select count(*) from phase_events where project_id = '20000000-0000-0000-0000-0000000aca01') = 7, 'evento de criação por fase';
  assert (select count(*) from project_status_events where project_id = '20000000-0000-0000-0000-0000000aca01') = 1, 'evento de criação do projeto';
  assert (select count(*) from phase_templates) = 14, '14 modelos';
end $$;

do $$ begin
  begin
    insert into project_phases (project_id, position, key, name) values ('20000000-0000-0000-0000-00000000de01', 1, 'x', 'X');
    raise exception 'B2 falhou: fase criada num projeto Tech';
  exception when check_violation then null; end;
  begin
    update projects set service_type = 'design' where slug = 'mono-a';
    raise exception 'B3 falhou: service_type mudou';
  exception when check_violation then null; end;
  begin
    insert into projects (slug, client_id, name, service_type, github_repo) values ('x', '10000000-0000-0000-0000-0000000000a1', 'X', 'design', 'r');
    raise exception 'GitHub num projeto Design devia falhar';
  exception when check_violation then null; end;
end $$;

-- ───────── Transições de fase (como admin) ─────────
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}', false);
set role authenticated;

do $$
declare ph uuid := (select id from project_phases where project_id = '20000000-0000-0000-0000-0000000aca01' and key = 'pedido-briefing');
        est uuid := (select id from project_phases where project_id = '20000000-0000-0000-0000-0000000aca01' and key = 'estrutura');
        dev uuid := (select id from project_phases where project_id = '20000000-0000-0000-0000-0000000aca01' and key = 'desenvolvimento');
begin
  begin perform admin_set_phase_status(ph, 'concluida'); raise exception 'por_iniciar → concluida devia falhar';
  exception when check_violation then null; end;

  perform admin_set_phase_status(ph, 'em_curso');
  assert (select started_at is not null from project_phases where id = ph), 'started_at';
  perform admin_set_phase_status(ph, 'concluida');
  assert (select completed_at is not null from project_phases where id = ph), 'completed_at';

  begin perform admin_set_phase_status(ph, 'em_curso'); raise exception 'reabrir sem motivo devia falhar (D-062)';
  exception when check_violation then null; end;
  perform admin_set_phase_status(ph, 'em_curso', 'Concluída por engano');
  assert (select completed_at is null from project_phases where id = ph), 'reabrir limpa completed_at';
  assert (select note from phase_events where project_phase_id = ph order by created_at desc limit 1) = 'Concluída por engano', 'motivo no histórico';

  perform admin_set_phase_status(est, 'nao_aplicavel');            -- estrutura pode saltar (D-014)
  begin perform admin_set_phase_status(dev, 'nao_aplicavel'); raise exception 'B4 falhou';
  exception when check_violation then null; end;
end $$;

-- ───────── Estados do projeto ─────────
do $$ begin
  begin perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'pausado');
    raise exception 'pausar sem motivo devia falhar';
  exception when check_violation then null; end;
  perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'pausado', 'Cliente em exames', true);
  assert (select client_requested from project_status_events where project_id = '20000000-0000-0000-0000-0000000aca01'
          order by created_at desc limit 1), 'pausa a pedido do cliente registada';
  perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'ativo');
  perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'entregue');
  assert (select completed_at is not null from projects where slug = 'mono-a'), 'entregue preenche completed_at';
  begin perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'ativo');
    raise exception 'reabrir projeto sem motivo devia falhar';
  exception when check_violation then null; end;
  perform admin_set_project_status('20000000-0000-0000-0000-0000000aca01', 'ativo', 'Ajuste aceite fora do prazo');
  assert (select completed_at is null from projects where slug = 'mono-a'), 'reabrir para os 90 dias (D-065)';
  perform admin_set_project_status('20000000-0000-0000-0000-0000000de501', 'cancelado', 'Desistiu');
  begin perform admin_set_project_status('20000000-0000-0000-0000-0000000de501', 'ativo', 'x');
    raise exception 'cancelado devia ser final';
  exception when check_violation then null; end;
end $$;
reset role;

-- ───────── Prazo ajustado (RN-21, RN-25): intervalos simulados no passado ─────────
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('20000000-0000-0000-0000-0000000aca02', 'prazo', '10000000-0000-0000-0000-0000000000a1', 'Prazo', 'academic', '2026-12-10');
delete from phase_events where project_id = '20000000-0000-0000-0000-0000000aca02';
delete from project_status_events where project_id = '20000000-0000-0000-0000-0000000aca02';
insert into phase_events (project_id, project_phase_id, to_status, created_at)
select '20000000-0000-0000-0000-0000000aca02', id, s, t::timestamptz
from (select id from project_phases where project_id = '20000000-0000-0000-0000-0000000aca02' and key = 'orcamento-aceite') p,
     (values ('aguarda_cliente', '2026-11-01 10:00+01'), ('concluida', '2026-11-04 10:00+01')) v(s, t);       -- 3 dias
insert into project_status_events (project_id, to_status, client_requested, created_at) values
  ('20000000-0000-0000-0000-0000000aca02', 'pausado', true,  '2026-11-03 10:00+01'),                          -- sobrepõe 1 dia
  ('20000000-0000-0000-0000-0000000aca02', 'ativo',   false, '2026-11-06 10:00+01'),                          -- +2 dias novos
  ('20000000-0000-0000-0000-0000000aca02', 'pausado', false, '2026-11-08 10:00+01'),                          -- pausa da GeniusFrela: não conta
  ('20000000-0000-0000-0000-0000000aca02', 'ativo',   false, '2026-11-09 10:00+01');
do $$ begin
  assert project_adjusted_due('20000000-0000-0000-0000-0000000aca02') = date '2026-12-15',
    format('prazo ajustado: esperado 2026-12-15 (+5), obtido %s', project_adjusted_due('20000000-0000-0000-0000-0000000aca02'));
  assert project_adjusted_due('20000000-0000-0000-0000-0000000de501') = date '2027-02-05', 'sem espera = prazo acordado';
end $$;

-- ───────── RLS: cliente B só vê o seu projeto e não escreve ─────────
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1"}', false);
set role authenticated;
do $$ begin
  assert (select count(*) from project_phases where project_id = '20000000-0000-0000-0000-0000000aca01') = 0, 'B não vê fases de A';
  assert (select count(*) from project_phases where project_id = '20000000-0000-0000-0000-0000000de501') = 7, 'B vê as suas fases';
  assert (select count(*) from phase_events where project_id = '20000000-0000-0000-0000-0000000aca01') = 0, 'B não vê eventos de A';
  assert (select count(*) from phase_events where project_id = '20000000-0000-0000-0000-0000000de501') > 0, 'B vê os seus eventos';
  assert (select count(*) from phase_templates) = 0, 'cliente não lê modelos';
  assert project_adjusted_due('20000000-0000-0000-0000-0000000aca02') is null, 'B não calcula o prazo de A';
  update project_phases set status = 'em_curso' where project_id = '20000000-0000-0000-0000-0000000de501';
  assert not found, 'cliente não altera fases';
  begin
    perform admin_set_phase_status((select id from project_phases where project_id = '20000000-0000-0000-0000-0000000de501' limit 1), 'em_curso');
    raise exception 'cliente usou admin_set_phase_status';
  exception when insufficient_privilege then null; end;
  begin
    insert into phase_events (project_id, project_phase_id, to_status)
      values ('20000000-0000-0000-0000-0000000de501', (select id from project_phases where project_id = '20000000-0000-0000-0000-0000000de501' limit 1), 'concluida');
    raise exception 'cliente inseriu no histórico';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- admin também não altera nem apaga o histórico (D-101)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}', false);
set role authenticated;
do $$ begin
  update phase_events set note = 'x';
  assert not found, 'admin não altera eventos';
  delete from project_status_events;
  assert not found, 'admin não apaga eventos';
end $$;
reset role;

-- anon não lê nada
select set_config('request.jwt.claims', '', false);
set role anon;
do $$ begin
  assert (select count(*) from project_phases) = 0, 'anon não lê fases';
end $$;
reset role;

\echo '✔ 0006: todos os testes passaram'
