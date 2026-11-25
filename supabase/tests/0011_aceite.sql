-- Testes da migração 0011 (o trabalho só começa com o orçamento aceite, M6-04). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('80000000-0000-0000-0000-0000000000a1', 'aceite-a', '10000000-0000-0000-0000-0000000000a1', 'Aceite A', 'academic', '2027-01-10');
create temp table ac_ids (k text primary key, v uuid);
grant all on ac_ids to authenticated;
insert into ac_ids select key, id from project_phases where project_id = '80000000-0000-0000-0000-0000000000a1';
create function pg_temp.ph(k text) returns uuid language sql as $$ select v from ac_ids where ac_ids.k = $1 $$;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  -- briefing e orçamento começam sem orçamento aceite
  perform admin_set_phase_status(pg_temp.ph('pedido-briefing'), 'em_curso');
  perform admin_set_phase_status(pg_temp.ph('pedido-briefing'), 'concluida');
  perform admin_set_phase_status(pg_temp.ph('orcamento-aceite'), 'em_curso');
  -- RN-11: sem aceite, a fase 3 não começa (ainda não há sinal a travar)
  begin perform admin_set_phase_status(pg_temp.ph('estrutura'), 'em_curso'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-11: fase 3 sem orçamento aceite';
  -- uma fase de trabalho mais à frente também não
  begin perform admin_set_phase_status(pg_temp.ph('desenvolvimento'), 'em_curso'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-11: fase 4 sem orçamento aceite';
  -- orçamento enviado ainda não chega
  insert into quotes (project_id, version, total_kz, delivery_due_on) values ('80000000-0000-0000-0000-0000000000a1', 1, 40000, '2027-01-20');
  update quotes set status = 'enviado' where project_id = '80000000-0000-0000-0000-0000000000a1';
  begin perform admin_set_phase_status(pg_temp.ph('estrutura'), 'em_curso'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-11: orçamento só enviado';
end $$;
reset role;

-- o cliente aceita
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select id from approvals where project_id = '80000000-0000-0000-0000-0000000000a1' and status = 'pendente'), 'aprovar') is not null;
reset role;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  assert (select due_on from projects where id = '80000000-0000-0000-0000-0000000000a1') = '2027-01-20', 'o aceite muda o prazo';
  -- aceite mas sinal por pagar: continua travada (D-052)
  begin perform admin_set_phase_status(pg_temp.ph('estrutura'), 'em_curso'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'D-013: aceite sem sinal pago';
  update payments set status = 'pago', paid_on = current_date where project_id = '80000000-0000-0000-0000-0000000000a1' and kind = 'sinal';
  perform admin_set_phase_status(pg_temp.ph('estrutura'), 'em_curso');
  assert (select status from project_phases where id = pg_temp.ph('estrutura')) = 'em_curso', 'aceite + sinal pago: a fase 3 começa';
end $$;
reset role;

-- M6-05: índice para aprovação ligado à fase Estrutura (RF-10.31, RF-10.32)
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  insert into approvals (project_id, project_phase_id, subject, version_label, snapshot)
  values ('80000000-0000-0000-0000-0000000000a1', pg_temp.ph('estrutura'), 'indice', 'V1', '{"title":"Índice","items":["1. Introdução","2. Métodos"]}');
  assert (select status from project_phases where id = pg_temp.ph('estrutura')) = 'aguarda_cliente', 'índice pedido: fase à espera do cliente';
end $$;
reset role;
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select id from approvals where project_id = '80000000-0000-0000-0000-0000000000a1' and subject = 'indice' and status = 'pendente'), 'pedir_alteracoes', 'Falta a metodologia') is not null;
reset role;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  assert (select status from project_phases where id = pg_temp.ph('estrutura')) = 'em_curso', 'RF-10.32: pedir alterações volta a em curso';
  insert into approvals (project_id, project_phase_id, subject, version_label, snapshot)
  values ('80000000-0000-0000-0000-0000000000a1', pg_temp.ph('estrutura'), 'indice', 'V2', '{"title":"Índice","items":["1. Introdução","2. Metodologia","3. Resultados"]}');
end $$;
reset role;
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select id from approvals where project_id = '80000000-0000-0000-0000-0000000000a1' and subject = 'indice' and status = 'pendente'), 'aprovar') is not null;
reset role;
do $$ begin
  assert (select status from project_phases where id = (select id from project_phases where project_id = '80000000-0000-0000-0000-0000000000a1' and key = 'estrutura')) = 'concluida',
    'índice V2 aprovado: fase Estrutura concluída';
end $$;

\echo '✔ 0011: o trabalho só começa com o orçamento aceite e o sinal pago (RN-11, D-013)'
