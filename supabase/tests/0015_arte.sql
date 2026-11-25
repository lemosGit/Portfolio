-- Testes da migração 0015 (aprovação final da arte para produção, M7-04). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'

-- Dois projetos Design do cliente A: com impressão (restante por pagar) e sem impressão (logótipo).
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('c0000000-0000-0000-0000-0000000015a1', 'arte-convite', '10000000-0000-0000-0000-0000000000a1', 'Convite arte', 'design', '2027-01-20'),
  ('c0000000-0000-0000-0000-0000000015a2', 'arte-logo', '10000000-0000-0000-0000-0000000000a1', 'Logo arte', 'design', '2027-01-20');
create temp table aids (k text primary key, v uuid);
grant all on aids to authenticated;
insert into aids select 'c:' || key, id from project_phases where project_id = 'c0000000-0000-0000-0000-0000000015a1';
insert into aids select 'l:' || key, id from project_phases where project_id = 'c0000000-0000-0000-0000-0000000015a2';
create function pg_temp.ph(k text) returns uuid language sql as $$ select v from aids where aids.k = $1 $$;
create function pg_temp.st(k text) returns text language sql as $$ select status from public.project_phases where id = pg_temp.ph(k) $$;

-- Fases 1 a 4 e o orçamento aceite fora dos gatilhos (o fluxo do aceite e do sinal está em 0007/0011).
set session_replication_role = replica;
update public.project_phases set status = 'concluida' where project_id::text like 'c0000000%' and position <= 3;
update public.project_phases set status = 'em_curso' where project_id::text like 'c0000000%' and key = 'revisoes';
insert into public.quotes (project_id, version, total_kz, deposit_pct, deposit_kz, status, accepted_at, rounds_included) values
  ('c0000000-0000-0000-0000-0000000015a1', 1, 60000, 50, 30000, 'aceite', now(), 2),
  ('c0000000-0000-0000-0000-0000000015a2', 1, 40000, 50, 20000, 'aceite', now(), 2);
insert into public.payments (project_id, kind, description, amount_kz, status, gates_phase_id) values
  ('c0000000-0000-0000-0000-0000000015a1', 'restante', 'Restante, antes da produção', 30000, 'pendente', pg_temp.ph('c:producao'));
set session_replication_role = origin;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into design_specs (project_id, piece_type, quantity, width_cm, height_cm, has_print, has_digital_files, event_date, key_texts) values
  ('c0000000-0000-0000-0000-0000000015a1', 'convite_impresso', 120, 14.8, 21, true, true, '2027-01-20', '[{"label":"Noivos","value":"Ana & Paulo"}]'),
  ('c0000000-0000-0000-0000-0000000015a2', 'logotipo_identidade', 1, null, null, false, true, null, '[{"label":"Nome","value":"Zungueira Café"}]');

create function pg_temp.proof(p uuid, n int, series text default 'arte') returns uuid language plpgsql as $$
declare d uuid; begin
  insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
  values (p, (select id from project_phases where project_id = p and key = 'revisoes'), 'prova', series, n, 'V' || n, 'admin') returning id into d;
  insert into approvals (project_id, project_phase_id, subject, deliverable_id, version_label, snapshot)
  values (p, (select id from project_phases where project_id = p and key = 'revisoes'), 'prova', d, 'V' || n, '{"title":"Convite"}');
  return d;
end $$;
select pg_temp.proof('c0000000-0000-0000-0000-0000000015a1', 1);
select pg_temp.proof('c0000000-0000-0000-0000-0000000015a2', 1);

-- RN-42: o snapshot leva os textos-chave, a quantidade, as medidas e a data do evento
do $$ declare s jsonb := (select snapshot from approvals where project_id = 'c0000000-0000-0000-0000-0000000015a1' and subject = 'prova');
begin
  assert s ->> 'title' = 'Convite', 'o título do pedido mantém-se';
  assert s -> 'key_texts' -> 0 ->> 'value' = 'Ana & Paulo', 'textos-chave no snapshot';
  assert (s ->> 'quantity')::int = 120, 'quantidade no snapshot';
  assert (s ->> 'width_cm')::numeric = 14.8 and s ->> 'event_date' = '2027-01-20', 'medidas e evento no snapshot';
  -- a ficha muda depois: o snapshot fica como o cliente o viu
  update design_specs set quantity = 150 where project_id = 'c0000000-0000-0000-0000-0000000015a1';
  assert ((select snapshot from approvals where project_id = 'c0000000-0000-0000-0000-0000000015a1' and subject = 'prova') ->> 'quantity')::int = 120, 'snapshot fixo';
end $$;
reset role;

-- O cliente aprova a arte: Revisões e Aprovação concluídas; a Produção fica travada pelo restante (RN-15)
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select id from approvals where project_id = 'c0000000-0000-0000-0000-0000000015a1' and status = 'pendente'), 'aprovar');
select respond_approval((select id from approvals where project_id = 'c0000000-0000-0000-0000-0000000015a2' and status = 'pendente'), 'aprovar');
reset role;
do $$ begin
  assert pg_temp.st('c:aprovacao-arte') = 'concluida', 'aprovação da arte concluída';
  assert pg_temp.st('c:producao') = 'por_iniciar', 'produção espera pelo restante';
  -- sem impressão, a Produção não se aplica e a Entrega começa logo
  assert pg_temp.st('l:producao') = 'nao_aplicavel', 'logótipo sem produção';
  assert pg_temp.st('l:entrega-levantamento') = 'em_curso', 'sem impressão, a entrega começa';
end $$;

-- RN-41: não há novas provas da peça aprovada; outra peça (outra série) pode ter provas
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin perform pg_temp.proof('c0000000-0000-0000-0000-0000000015a1', 2); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-41: nova prova de uma arte aprovada';
  perform pg_temp.proof('c0000000-0000-0000-0000-0000000015a1', 1, 'envelope');
end $$;
reset role;

-- O restante pago: o admin começa a produção; a arte já não se reabre (RN-43, 0007)
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean; ap uuid := (select a.id from approvals a join deliverables d on d.id = a.deliverable_id
                                        where a.project_id = 'c0000000-0000-0000-0000-0000000015a1' and d.series_key = 'arte' and a.status = 'aprovada');
begin
  -- reabrir antes da produção é permitido; volta a pendente e a peça aceita a resposta outra vez
  insert into approval_responses (approval_id, kind, comment, actor_role) values (ap, 'reabrir', 'O cliente viu um erro no nome', 'admin');
  assert (select status from approvals where id = ap) = 'pendente', 'reaberta antes da produção';
end $$;
reset role;
-- o restante pago antes de aprovar outra vez: a aprovação começa a produção sozinha
set session_replication_role = replica;
update public.payments set status = 'pago', paid_on = current_date where project_id = 'c0000000-0000-0000-0000-0000000015a1' and kind = 'restante';
set session_replication_role = origin;
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
select respond_approval((select a.id from approvals a join deliverables d on d.id = a.deliverable_id
                         where a.project_id = 'c0000000-0000-0000-0000-0000000015a1' and d.series_key = 'arte' and a.status = 'pendente'), 'aprovar');
reset role;
do $$ begin
  assert pg_temp.st('c:producao') = 'em_curso', 'com o restante pago, a produção começa';
end $$;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean; ap uuid := (select a.id from approvals a join deliverables d on d.id = a.deliverable_id
                                        where a.project_id = 'c0000000-0000-0000-0000-0000000015a1' and d.series_key = 'arte' and a.status = 'aprovada');
begin
  begin insert into approval_responses (approval_id, kind, comment, actor_role) values (ap, 'reabrir', 'tarde demais', 'admin'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-43: produção começada, a arte não se reabre';
end $$;
reset role;

\echo '✔ 0015: aprovação final da arte (snapshot RN-42, RN-41, produção ou entrega a seguir, RN-43)'
