-- Testes da migração 0016 (estado da produção e entrega/levantamento, M7-05). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('d0000000-0000-0000-0000-0000000016a1', 'prod-lona', '10000000-0000-0000-0000-0000000000a1', 'Lona', 'design', '2027-01-20'),
  ('d0000000-0000-0000-0000-0000000016a2', 'prod-logo', '10000000-0000-0000-0000-0000000000a1', 'Logo', 'design', '2027-01-20');
create function pg_temp.st(p uuid, k text) returns text language sql as $$ select status from public.project_phases where project_id = p and key = k $$;

-- Até à aprovação da arte, fora dos gatilhos (testados em 0007/0015); o restante por pagar trava a Produção.
set session_replication_role = replica;
update public.project_phases set status = 'concluida' where project_id::text like 'd0000000%' and position <= 5;
insert into public.quotes (project_id, version, total_kz, deposit_pct, deposit_kz, status, accepted_at, rounds_included) values
  ('d0000000-0000-0000-0000-0000000016a1', 1, 80000, 50, 40000, 'aceite', now(), 2),
  ('d0000000-0000-0000-0000-0000000016a2', 1, 40000, 50, 20000, 'aceite', now(), 2);
insert into public.payments (project_id, kind, description, amount_kz, status, gates_phase_id) values
  ('d0000000-0000-0000-0000-0000000016a1', 'restante', 'Restante, antes da produção', 40000, 'pendente',
   (select id from public.project_phases where project_id = 'd0000000-0000-0000-0000-0000000016a1' and key = 'producao'));
set session_replication_role = origin;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into design_specs (project_id, piece_type, quantity, has_print, has_digital_files) values
  ('d0000000-0000-0000-0000-0000000016a1', 'lona', 2, true, false),
  ('d0000000-0000-0000-0000-0000000016a2', 'logotipo_identidade', 1, false, true);

do $$ declare ok boolean; p uuid := 'd0000000-0000-0000-0000-0000000016a1';
begin
  -- RN-15: "a imprimir" com o restante por pagar é recusado
  begin update design_specs set production_status = 'a_imprimir' where project_id = p; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-15: a imprimir sem o restante pago';
  assert pg_temp.st(p, 'producao') = 'por_iniciar', 'a produção continua por iniciar';
  -- a peça não se entrega sem a produção terminada
  begin perform admin_design_delivered(p); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'entregue antes da produção';
  update payments set status = 'pago', paid_on = current_date where project_id = p and kind = 'restante';
  update design_specs set production_status = 'a_imprimir' where project_id = p;
  assert pg_temp.st(p, 'producao') = 'em_curso', 'a imprimir → Produção em curso';
  update design_specs set production_status = 'pronto', pickup_at = '2027-01-15 10:00+01', pickup_place = 'Loja GeniusFrela, Talatona' where project_id = p;
  assert pg_temp.st(p, 'producao') = 'concluida', 'pronto → Produção concluída';
  assert pg_temp.st(p, 'entrega-levantamento') = 'em_curso', 'pronto → Entrega em curso';
  perform admin_design_delivered(p);
  assert pg_temp.st(p, 'entrega-levantamento') = 'concluida', 'entregue → Entrega concluída';
  assert (select status from projects where id = p) = 'entregue', 'entregue → projeto entregue (RF-20.73)';
  assert (select delivered_at is not null from design_specs where project_id = p), 'delivered_at gravado';
  begin perform admin_design_delivered(p); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'entregar duas vezes';
end $$;

-- sem impressão: a produção não se aplica e entrega-se logo
do $$ declare p uuid := 'd0000000-0000-0000-0000-0000000016a2';
begin
  assert pg_temp.st(p, 'producao') = 'nao_aplicavel', 'logótipo sem produção (F2)';
  perform admin_design_delivered(p);
  assert pg_temp.st(p, 'entrega-levantamento') = 'concluida' and (select status from projects where id = p) = 'entregue', 'logótipo entregue';
end $$;
reset role;

-- o cliente não marca a entrega nem muda a produção
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin perform admin_design_delivered('d0000000-0000-0000-0000-0000000016a1'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  assert ok, 'cliente marca entregue';
end $$;
reset role;

\echo '✔ 0016: estado da produção e entrega (RN-15, fases ligadas ao estado, entregue conclui o projeto)'
