-- Testes da migração 0017 (orçamento do Design: design + impressão e sinal, M7-06). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('d0000000-0000-0000-0000-0000000017a1', 'orc-convite', '10000000-0000-0000-0000-0000000000a1', 'Convite', 'design', '2027-01-20'),
  ('d0000000-0000-0000-0000-0000000017a2', 'orc-logo', '10000000-0000-0000-0000-0000000000a1', 'Logo', 'design', '2027-01-20');
create function pg_temp.ph(p uuid, k text) returns uuid language sql as $$ select id from public.project_phases where project_id = p and key = k $$;
create function pg_temp.st(p uuid, k text) returns text language sql as $$ select status from public.project_phases where project_id = p and key = k $$;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into design_specs (project_id, piece_type, quantity, has_print, has_digital_files) values
  ('d0000000-0000-0000-0000-0000000017a1', 'convite_impresso', 120, true, false),
  ('d0000000-0000-0000-0000-0000000017a2', 'logotipo_identidade', 1, false, true);

do $$ declare ok boolean; p uuid := 'd0000000-0000-0000-0000-0000000017a1'; l uuid := 'd0000000-0000-0000-0000-0000000017a2';
begin
  perform admin_set_phase_status(pg_temp.ph(p, 'briefing'), 'em_curso');
  perform admin_set_phase_status(pg_temp.ph(p, 'briefing'), 'concluida');
  perform admin_set_phase_status(pg_temp.ph(p, 'orcamento-sinal'), 'em_curso');

  -- RF-20.20: um rascunho só com o total guarda-se, mas não se envia
  insert into quotes (project_id, version, total_kz) values (p, 1, 120000);
  begin update quotes set status = 'enviado' where project_id = p; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RF-20.20: enviar sem design + impressão';
  assert (select status from quotes where project_id = p) = 'rascunho', 'continua em rascunho';

  -- com a divisão, envia; o snapshot do cliente leva o detalhe (RF-20.21)
  update quotes set design_kz = 45000, print_kz = 75000 where project_id = p;
  update quotes set status = 'enviado' where project_id = p;
  assert (select (snapshot->>'design_kz')::numeric = 45000 and (snapshot->>'print_kz')::numeric = 75000
          and (snapshot->>'deposit_kz')::numeric = 60000
          from approvals where project_id = p and subject = 'orcamento'), 'snapshot com design, impressão e sinal';

  -- RN-44: sem impressão na ficha técnica, a impressão tem de ser 0
  insert into quotes (project_id, version, total_kz, design_kz, print_kz) values (l, 1, 50000, 40000, 10000);
  begin update quotes set status = 'enviado' where project_id = l; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-44: impressão num logótipo sem impressão';
  update quotes set total_kz = 40000, print_kz = 0 where project_id = l;
  update quotes set status = 'enviado' where project_id = l;
  assert (select status from quotes where project_id = l) = 'enviado', 'só design, sem impressão: envia';
end $$;
reset role;

-- o cliente aceita o orçamento do convite
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select id from approvals where project_id = 'd0000000-0000-0000-0000-0000000017a1' and status = 'pendente'), 'aprovar') is not null;
reset role;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean; p uuid := 'd0000000-0000-0000-0000-0000000017a1';
begin
  -- o aceite gera o sinal, que trava o Conceito, e o restante, que trava a Produção (RN-11, RN-15)
  assert (select gates_phase_id = pg_temp.ph(p, 'conceito') and amount_kz = 60000 from payments where project_id = p and kind = 'sinal'),
    'o sinal trava o Conceito';
  assert (select gates_phase_id = pg_temp.ph(p, 'producao') and amount_kz = 60000 from payments where project_id = p and kind = 'restante'),
    'o restante trava a Produção';
  -- RN-11 / RF-20.23: aceite mas sinal por pagar → o Conceito não começa
  begin perform admin_set_phase_status(pg_temp.ph(p, 'conceito'), 'em_curso'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-11: conceito com o sinal por pagar';
  assert pg_temp.st(p, 'conceito') = 'por_iniciar', 'conceito continua por iniciar';
  -- sinal pago → o Conceito começa
  update payments set status = 'pago', paid_on = current_date where project_id = p and kind = 'sinal';
  perform admin_set_phase_status(pg_temp.ph(p, 'conceito'), 'em_curso');
  assert pg_temp.st(p, 'conceito') = 'em_curso', 'sinal pago: o conceito começa';
end $$;
reset role;

\echo '✔ 0017: orçamento do Design com design + impressão; o conceito só começa com o sinal pago (RF-20.20…23, RN-11, RN-44)'
