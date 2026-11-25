-- Testes da migração 0012 (entrega final e pedidos de ajuste, M6-06). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

-- Projeto Académico com ficha, orçamento aceite (restante por pagar) e fases até à entrega.
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('90000000-0000-0000-0000-0000000000a1', 'ajustes-a', '10000000-0000-0000-0000-0000000000a1', 'Ajustes A', 'academic', '2027-01-10');
insert into public.academic_briefs (project_id, topic, work_type, education_level, adjust_days)
values ('90000000-0000-0000-0000-0000000000a1', 'Tema', 'universitario', 'licenciatura', 7);
insert into public.quotes (project_id, version, total_kz) values ('90000000-0000-0000-0000-0000000000a1', 1, 1000);
update public.quotes set status = 'enviado' where project_id = '90000000-0000-0000-0000-0000000000a1';
select set_config('app.via_response', 'on', false);
update public.quotes set status = 'aceite' where project_id = '90000000-0000-0000-0000-0000000000a1';
select set_config('app.via_response', '', false);

-- adjust_until: fim do 7.º dia em Luanda (Q-098)
do $$ begin
  update academic_briefs set delivered_at = '2026-12-01 15:00+01' where project_id = '90000000-0000-0000-0000-0000000000a1';
  assert adjust_until('90000000-0000-0000-0000-0000000000a1') = '2026-12-09 00:00+01', 'até 8/12 23:59 em Luanda';
  update academic_briefs set delivered_at = null where project_id = '90000000-0000-0000-0000-0000000000a1';
  assert adjust_until('90000000-0000-0000-0000-0000000000a1') is null, 'sem entrega: sem prazo';
end $$;

-- antes da entrega o cliente não pede ajustes
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin insert into adjustment_requests (project_id, description) values ('90000000-0000-0000-0000-0000000000a1', 'Corrigir a página 3, por favor'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'pedido antes da entrega';
end $$;
reset role;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$
declare ok boolean; ph uuid := (select id from project_phases where project_id = '90000000-0000-0000-0000-0000000000a1' and key = 'entrega-final');
begin
  -- sem ficheiro final
  begin perform admin_deliver_final('90000000-0000-0000-0000-0000000000a1'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'disponibilizar sem ficheiro';
  -- ficheiro final com o restante por pagar → bloqueado (RN-14) → não disponibiliza
  insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
  values ('90000000-0000-0000-0000-0000000000a1', ph, 'entregavel', 'final', 1, 'V1', 'admin');
  assert (select locked_by_payment_id is not null from deliverables where project_id = '90000000-0000-0000-0000-0000000000a1' and series_key = 'final'), 'final bloqueado';
  begin perform admin_deliver_final('90000000-0000-0000-0000-0000000000a1'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'disponibilizar com o restante por pagar';
  update payments set status = 'pago', paid_on = current_date where project_id = '90000000-0000-0000-0000-0000000000a1';
  perform admin_deliver_final('90000000-0000-0000-0000-0000000000a1');
  assert (select delivered_at is not null from academic_briefs where project_id = '90000000-0000-0000-0000-0000000000a1'), 'delivered_at gravado';
  assert (select status from project_phases where id = ph) = 'concluida', 'fase 6 concluída';
  assert (select status from project_phases where project_id = '90000000-0000-0000-0000-0000000000a1' and key = 'ajustes') = 'em_curso', 'fase Ajustes em curso';
  begin perform admin_deliver_final('90000000-0000-0000-0000-0000000000a1'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'disponibilizar duas vezes';
end $$;
reset role;

-- dentro do prazo: A pede; descrição curta falha; B não pede no projeto de A
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ok boolean;
begin
  insert into adjustment_requests (project_id, description) values ('90000000-0000-0000-0000-0000000000a1', 'A bibliografia não segue a APA');
  assert (select created_by from adjustment_requests where project_id = '90000000-0000-0000-0000-0000000000a1') = '00000000-0000-0000-0000-0000000000a1', 'autor = cliente';
  begin insert into adjustment_requests (project_id, description) values ('90000000-0000-0000-0000-0000000000a1', 'curto'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'descrição com menos de 10 caracteres';
  begin insert into adjustment_requests (project_id, description, status) values ('90000000-0000-0000-0000-0000000000a1', 'Já resolvido por mim', 'resolvido'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'cliente não fecha pedidos';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin insert into adjustment_requests (project_id, description) values ('90000000-0000-0000-0000-0000000000a1', 'Intrusão no projeto de A'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  assert ok, 'B pede ajustes no projeto de A';
  assert (select count(*) from adjustment_requests where project_id = '90000000-0000-0000-0000-0000000000a1') = 0, 'B lê pedidos de A';
end $$;
reset role;

-- fora do prazo
update academic_briefs set delivered_at = now() - interval '10 days' where project_id = '90000000-0000-0000-0000-0000000000a1';
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin insert into adjustment_requests (project_id, description) values ('90000000-0000-0000-0000-0000000000a1', 'Mais um ajuste fora do prazo'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'RN-33: fora do prazo';
end $$;
reset role;

-- F4: recusar exige nota; resolver exige a nova versão; um pedido fechado não reabre
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean; r uuid := (select id from adjustment_requests where project_id = '90000000-0000-0000-0000-0000000000a1');
begin
  begin update adjustment_requests set status = 'recusado' where id = r; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F4: recusar sem nota';
  begin update adjustment_requests set status = 'resolvido' where id = r; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F4: resolver sem versão';
  update adjustment_requests set status = 'resolvido', resolved_by_deliverable_id = (select id from deliverables where series_key = 'final' and project_id = '90000000-0000-0000-0000-0000000000a1') where id = r;
  assert (select resolved_at is not null from adjustment_requests where id = r), 'resolved_at';
  begin update adjustment_requests set status = 'aberto' where id = r; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'pedido fechado não reabre';
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon', 'public.admin_deliver_final(uuid)', 'execute'), 'anon com EXECUTE em admin_deliver_final';
  assert not has_function_privilege('anon', 'public.adjust_until(uuid)', 'execute'), 'anon com EXECUTE em adjust_until';
end $$;

\echo '✔ 0012: entrega final e pedidos de ajuste (prazo em Luanda, RN-14, RN-33, F4, RLS)'
