-- Testes da migração 0018 (correções do teste em produção da v0.3, M7-99). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'

-- valor como no portal
do $$ begin
  assert private.kz_text(50000) = '50 000', private.kz_text(50000);
  assert private.kz_text(1250.5) = '1 250,50', private.kz_text(1250.5);
  assert private.kz_text(999) = '999', private.kz_text(999);
  assert private.kz_text(1234567.05) = '1 234 567,05', private.kz_text(1234567.05);
end $$;

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('d0000000-0000-0000-0000-0000000018a1', 'v03-convite', '10000000-0000-0000-0000-0000000000a1', 'Convite', 'design', '2027-01-20');
create function pg_temp.ph(k text) returns uuid language sql as $$
  select id from public.project_phases where project_id = 'd0000000-0000-0000-0000-0000000018a1' and key = k $$;

-- D-052: a mensagem do pagamento que trava a fase leva o valor formatado
set session_replication_role = replica;
update public.project_phases set status = 'concluida' where project_id = 'd0000000-0000-0000-0000-0000000018a1' and position <= 2;
insert into public.payments (project_id, kind, description, amount_kz, status, gates_phase_id) values
  ('d0000000-0000-0000-0000-0000000018a1', 'sinal', 'Sinal (50%)', 50000, 'pendente', pg_temp.ph('conceito'));
insert into public.quotes (project_id, version, total_kz, deposit_pct, deposit_kz, status, accepted_at, rounds_included)
  values ('d0000000-0000-0000-0000-0000000018a1', 1, 100000, 50, 50000, 'aceite', now(), 2);
set session_replication_role = origin;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare msg text;
begin
  begin perform admin_set_phase_status(pg_temp.ph('conceito'), 'em_curso'); msg := null;
  exception when check_violation then msg := sqlerrm; end;
  assert msg = 'Falta o pagamento "Sinal (50%)" (50 000 Kz) para iniciar esta fase.', coalesce(msg, 'sem erro');
end $$;
reset role;

-- RN-41: com a V2 aprovada, uma V3 de prova da mesma peça é recusada; outra peça e entregáveis não
set session_replication_role = replica;
insert into public.deliverables (id, project_id, role, series_key, version_no, label, uploaded_by_role) values
  ('d0000000-0000-0000-0000-00000018d001', 'd0000000-0000-0000-0000-0000000018a1', 'prova', 'convite', 1, 'V1', 'admin'),
  ('d0000000-0000-0000-0000-00000018d002', 'd0000000-0000-0000-0000-0000000018a1', 'prova', 'convite', 2, 'V2', 'admin');
insert into public.approvals (project_id, subject, deliverable_id, version_label, snapshot, status) values
  ('d0000000-0000-0000-0000-0000000018a1', 'prova', 'd0000000-0000-0000-0000-00000018d002', 'V2', '{}', 'aprovada');
set session_replication_role = origin;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean; p uuid := 'd0000000-0000-0000-0000-0000000018a1';
begin
  begin insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role) values (p, 'prova', 'convite', 3, 'V3', 'admin'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-41: nova prova de uma peça com a arte aprovada';
  -- outra peça (série) do mesmo projeto: aceita
  insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role) values (p, 'prova', 'lona', 1, 'V1', 'admin');
  -- ficheiros finais (entregável) da peça aprovada: aceites
  insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role) values (p, 'entregavel', 'convite-final', 1, 'V1', 'admin');
end $$;
reset role;

-- reaberta a aprovação, volta a poder carregar
set session_replication_role = replica;
update public.approvals set status = 'pendente' where deliverable_id = 'd0000000-0000-0000-0000-00000018d002';
set session_replication_role = origin;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role)
  values ('d0000000-0000-0000-0000-0000000018a1', 'prova', 'convite', 3, 'V3', 'admin');
reset role;

\echo '✔ 0018: valor formatado no travão do pagamento (D-052) e RN-41 no carregamento de provas'
