-- Testes da migração 0007 (orçamentos, pagamentos, aprovações, ficheiros). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

-- Projetos novos para estes testes (os da 0006 ficam como estão). Cliente A: Académico; cliente B: Design.
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('30000000-0000-0000-0000-0000000aca01', 't7-mono', '10000000-0000-0000-0000-0000000000a1', 'Monografia T7', 'academic', '2026-12-01'),
  ('30000000-0000-0000-0000-0000000de501', 't7-convite', '10000000-0000-0000-0000-0000000000b1', 'Convite T7', 'design', '2027-01-20');

create temp table ids (k text primary key, v uuid);
grant all on ids to authenticated;
insert into ids select 'aca:' || key, id from project_phases where project_id = '30000000-0000-0000-0000-0000000aca01';
insert into ids select 'des:' || key, id from project_phases where project_id = '30000000-0000-0000-0000-0000000de501';
create function pg_temp.id(k text) returns uuid language sql as $$ select v from ids where ids.k = $1 $$;

-- ═════════ Académico: orçamento → aceite → sinal → fase 3 ═════════
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  perform admin_set_phase_status(pg_temp.id('aca:pedido-briefing'), 'em_curso');
  perform admin_set_phase_status(pg_temp.id('aca:pedido-briefing'), 'concluida');
  perform admin_set_phase_status(pg_temp.id('aca:orcamento-aceite'), 'em_curso');
  insert into quotes (project_id, version, total_kz, delivery_due_on) values ('30000000-0000-0000-0000-0000000aca01', 1, 50000, '2026-12-12');
  assert (select deposit_kz from quotes where project_id = '30000000-0000-0000-0000-0000000aca01') = 25000, 'sinal de 50% por omissão';
  update quotes set status = 'enviado' where project_id = '30000000-0000-0000-0000-0000000aca01';
  assert (select count(*) from approvals where project_id = '30000000-0000-0000-0000-0000000aca01' and status = 'pendente') = 1, 'aprovação criada ao enviar';
  assert (select snapshot ->> 'deposit_rule' from approvals where project_id = '30000000-0000-0000-0000-0000000aca01') like 'O sinal não é devolvido%', 'regra do sinal no snapshot (RN-13)';
  assert (select status from project_phases where id = pg_temp.id('aca:orcamento-aceite')) = 'aguarda_cliente', 'fase à espera do cliente';
  begin update quotes set status = 'aceite' where project_id = '30000000-0000-0000-0000-0000000aca01';
    raise exception 'admin não pode aceitar pelo cliente';
  exception when check_violation then null; end;
  begin update quotes set total_kz = 1 where project_id = '30000000-0000-0000-0000-0000000aca01';
    raise exception 'valores de um orçamento enviado não mudam';
  exception when check_violation then null; end;
end $$;
reset role;

-- cliente B não responde ao pedido de A
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  perform respond_approval((select id from approvals where project_id = '30000000-0000-0000-0000-0000000aca01' and status = 'pendente'), 'aprovar');
  raise exception 'B respondeu a um pedido de A';
exception when insufficient_privilege then null; end $$;
reset role;

-- cliente A: pedir alterações (comentário obrigatório), depois aceitar a v1 reenviada
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ap uuid := (select id from approvals where project_id = '30000000-0000-0000-0000-0000000aca01' and status = 'pendente');
begin
  begin perform respond_approval(ap, 'pedir_alteracoes', '   '); raise exception 'comentário vazio devia falhar';
  exception when check_violation then null; end;
  perform respond_approval(ap, 'pedir_alteracoes', 'Prefiro pagar o sinal em 40%.');
  assert (select status from approvals where id = ap) = 'alteracoes_pedidas', 'pedido fechado';
  assert (select count(*) from quotes where project_id = '30000000-0000-0000-0000-0000000aca01') = 0, 'em rascunho, o cliente deixa de ver o orçamento';
  assert (select status from project_phases where id = pg_temp.id('aca:orcamento-aceite')) = 'em_curso', 'fase retoma';
  begin insert into approval_responses (approval_id, kind, actor_role) values (ap, 'aprovar', 'client');
    raise exception 'cliente inseriu resposta diretamente';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  assert (select status from quotes where project_id = '30000000-0000-0000-0000-0000000aca01') = 'rascunho', 'orçamento volta a rascunho';
  update quotes set deposit_pct = 40, deposit_kz = 20000 where project_id = '30000000-0000-0000-0000-0000000aca01';
  update quotes set status = 'enviado' where project_id = '30000000-0000-0000-0000-0000000aca01';
end $$;
reset role;

select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare ap uuid := (select id from approvals where project_id = '30000000-0000-0000-0000-0000000aca01' and status = 'pendente');
begin
  perform respond_approval(ap, 'aprovar');
  assert (select status from quotes where project_id = '30000000-0000-0000-0000-0000000aca01') = 'aceite', 'orçamento aceite';
  assert (select count(*) from payments where project_id = '30000000-0000-0000-0000-0000000aca01') = 2, 'sinal e restante gerados';
  assert (select amount_kz from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'sinal') = 20000, 'sinal de 40%';
  assert (select amount_kz from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'restante') = 30000, 'restante';
  assert (select gates_phase_id from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'sinal') = pg_temp.id('aca:estrutura'), 'sinal trava a fase 3 (RN-11)';
  assert (select due_on from projects where id = '30000000-0000-0000-0000-0000000aca01') = '2026-12-12', 'prazo copiado do orçamento';
  assert (select status from project_phases where id = pg_temp.id('aca:orcamento-aceite')) = 'concluida', 'fase do orçamento concluída';
  begin perform respond_approval(ap, 'aprovar'); raise exception 'aprovar duas vezes devia falhar';
  exception when check_violation then null; end;
  update payments set amount_kz = 1;
  assert not found, 'cliente não altera pagamentos';
  assert (select count(*) from activity_log) = 0, 'cliente não lê a auditoria';
end $$;
reset role;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare sinal uuid := (select id from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'sinal');
begin
  begin perform admin_set_phase_status(pg_temp.id('aca:estrutura'), 'em_curso'); raise exception 'fase 3 sem sinal pago devia falhar (D-052)';
  exception when check_violation then null; end;
  begin update payments set status = 'pago' where id = sinal; raise exception 'pago sem data devia falhar';
  exception when check_violation then null; end;
  update payments set status = 'pago', paid_on = '2026-11-24' where id = sinal;
  perform admin_set_phase_status(pg_temp.id('aca:estrutura'), 'em_curso');
  -- entrega final bloqueada até ao restante (RN-14)
  insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
  values ('30000000-0000-0000-0000-0000000aca01', pg_temp.id('aca:entrega-final'), 'entregavel', 'entrega-final', 1, 'V1', 'admin');
  assert (select locked_by_payment_id from deliverables where series_key = 'entrega-final')
       = (select id from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'restante'), 'entrega bloqueada pelo restante';
  assert (select count(*) from activity_log where project_id = '30000000-0000-0000-0000-0000000aca01') > 0, 'auditoria preenchida';
  update activity_log set action = 'update';
  assert not found, 'ninguém altera a auditoria';
end $$;
reset role;

-- ═════════ Design: rondas, extra, versão atual, aprovação da arte, produção ═════════
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  perform admin_set_phase_status(pg_temp.id('des:briefing'), 'em_curso');
  perform admin_set_phase_status(pg_temp.id('des:briefing'), 'concluida');
  perform admin_set_phase_status(pg_temp.id('des:orcamento-sinal'), 'em_curso');
  insert into quotes (project_id, version, total_kz, design_kz, print_kz, rounds_included)
    values ('30000000-0000-0000-0000-0000000de501', 1, 60000, 30000, 30000, 2);
  begin insert into quotes (project_id, version, total_kz, design_kz, print_kz) values ('30000000-0000-0000-0000-0000000de501', 2, 60000, 10000, 10000);
    raise exception 'design + impressão ≠ total devia falhar';
  exception when check_violation then null; end;
  update quotes set status = 'enviado' where project_id = '30000000-0000-0000-0000-0000000de501';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
select respond_approval((select id from approvals where project_id = '30000000-0000-0000-0000-0000000de501' and status = 'pendente'), 'aprovar');
reset role;

-- admin: paga o sinal, conceito V1 e pedido de aprovação da prova
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  assert (select gates_phase_id from payments where project_id = '30000000-0000-0000-0000-0000000de501' and kind = 'restante') = pg_temp.id('des:producao'), 'restante trava a produção (RN-15)';
  update payments set status = 'pago', paid_on = '2026-11-24' where project_id = '30000000-0000-0000-0000-0000000de501' and kind = 'sinal';
  perform admin_set_phase_status(pg_temp.id('des:conceito'), 'em_curso');
  perform admin_set_phase_status(pg_temp.id('des:conceito'), 'concluida');
  perform admin_set_phase_status(pg_temp.id('des:revisoes'), 'em_curso');
end $$;

create function pg_temp.new_proof(n int) returns uuid language plpgsql as $$
declare d uuid; begin
  insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
  values ('30000000-0000-0000-0000-0000000de501', pg_temp.id('des:revisoes'), 'prova', 'prova', n, 'V' || n, 'admin') returning id into d;
  insert into approvals (project_id, project_phase_id, subject, deliverable_id, version_label, snapshot)
  values ('30000000-0000-0000-0000-0000000de501', pg_temp.id('des:revisoes'), 'prova', d, 'V' || n,
          jsonb_build_object('Noivos', 'Ana & Paulo', 'Quantidade', 120));
  return d;
end $$;
select pg_temp.new_proof(1);
reset role;

-- cliente B: 2 rondas incluídas
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
select respond_approval((select id from approvals where subject = 'prova' and status = 'pendente' and project_id = '30000000-0000-0000-0000-0000000de501'), 'pedir_alteracoes', 'Nomes maiores');
reset role;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated; select pg_temp.new_proof(2); reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
select respond_approval((select id from approvals where subject = 'prova' and status = 'pendente' and project_id = '30000000-0000-0000-0000-0000000de501'), 'pedir_alteracoes', 'Data errada');
do $$ begin
  assert (select used from design_rounds('30000000-0000-0000-0000-0000000de501')) = 2, '2 rondas usadas';
  assert (select remaining from design_rounds('30000000-0000-0000-0000-0000000de501')) = 0, '0 rondas restantes';
end $$;
reset role;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated; select pg_temp.new_proof(3); reset role;

select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  perform respond_approval((select id from approvals where subject = 'prova' and status = 'pendente' and project_id = '30000000-0000-0000-0000-0000000de501'), 'pedir_alteracoes', 'Mais uma');
  raise exception 'sem rondas devia falhar (RN-36)';
exception when check_violation then null; end $$;
reset role;

-- extra: 1 ronda paga, aceite pelo cliente
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare p uuid; begin
  insert into payments (project_id, kind, description, amount_kz, extra_rounds)
  values ('30000000-0000-0000-0000-0000000de501', 'extra', 'Ronda extra de revisão', 5000, 1) returning id into p;
  assert (select status from payments where id = p) = 'por_aceitar', 'extra começa por aceitar (RN-07)';
  insert into approvals (project_id, subject, payment_id, snapshot) values ('30000000-0000-0000-0000-0000000de501', 'extra', p, jsonb_build_object('amount_kz', 5000));
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  perform respond_approval((select id from approvals where subject = 'extra' and status = 'pendente'), 'aprovar');
  assert (select status from payments where kind = 'extra' and project_id = '30000000-0000-0000-0000-0000000de501') = 'pendente', 'extra aceite fica pendente';
  assert (select remaining from design_rounds('30000000-0000-0000-0000-0000000de501')) = 1, 'extra acrescenta 1 ronda';
end $$;
reset role;

-- versão desatualizada: chega a V4 enquanto a V3 está pendente
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
values ('30000000-0000-0000-0000-0000000de501', pg_temp.id('des:revisoes'), 'prova', 'prova', 4, 'V4', 'admin');
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  perform respond_approval((select a.id from approvals a join deliverables d on d.id = a.deliverable_id where d.label = 'V3' and d.project_id = '30000000-0000-0000-0000-0000000de501'), 'aprovar');
  raise exception 'aprovar uma versão antiga devia falhar';
exception when check_violation then null; end $$;
reset role;

-- admin cancela o pedido da V3 e pede a V4; o cliente aprova a arte
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare v4 uuid := (select id from deliverables where label = 'V4' and project_id = '30000000-0000-0000-0000-0000000de501');
begin
  update approvals set status = 'cancelada' where status = 'pendente' and subject = 'prova' and project_id = '30000000-0000-0000-0000-0000000de501';
  begin update approvals set snapshot = '{}' where deliverable_id = v4; raise exception 'snapshot imutável';
  exception when others then null; end;
  insert into approvals (project_id, project_phase_id, subject, deliverable_id, version_label, snapshot)
  values ('30000000-0000-0000-0000-0000000de501', pg_temp.id('des:revisoes'), 'prova', v4, 'V4', '{"Noivos":"Ana & Paulo"}');
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  perform respond_approval((select id from approvals where subject = 'prova' and status = 'pendente' and project_id = '30000000-0000-0000-0000-0000000de501'), 'aprovar');
  assert (select status from project_phases where id = pg_temp.id('des:revisoes')) = 'concluida', 'revisões concluídas';
  assert (select status from project_phases where id = pg_temp.id('des:aprovacao-arte')) = 'concluida', 'arte aprovada';
end $$;
reset role;

-- reabrir antes da produção: permitido; depois da produção começar: recusado (RN-43)
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ap uuid := (select id from approvals where subject = 'prova' and status = 'aprovada' and project_id = '30000000-0000-0000-0000-0000000de501');
begin
  begin insert into approval_responses (approval_id, kind, actor_role) values (ap, 'reabrir', 'admin');
    raise exception 'reabrir sem motivo devia falhar';
  exception when check_violation then null; end;
  insert into approval_responses (approval_id, kind, comment, actor_role) values (ap, 'reabrir', 'Cliente viu erro no nome', 'admin');
  assert (select status from approvals where id = ap) = 'pendente', 'reaberta';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
select respond_approval((select id from approvals where subject = 'prova' and status = 'pendente' and project_id = '30000000-0000-0000-0000-0000000de501'), 'aprovar');
reset role;
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ap uuid := (select id from approvals where subject = 'prova' and status = 'aprovada' and project_id = '30000000-0000-0000-0000-0000000de501');
begin
  begin perform admin_set_phase_status(pg_temp.id('des:producao'), 'em_curso'); raise exception 'produção sem restante devia falhar (RN-15)';
  exception when check_violation then null; end;
  update payments set status = 'pago', paid_on = '2026-11-25' where project_id = '30000000-0000-0000-0000-0000000de501' and kind = 'restante';
  perform admin_set_phase_status(pg_temp.id('des:producao'), 'em_curso');
  begin insert into approval_responses (approval_id, kind, comment, actor_role) values (ap, 'reabrir', 'Tarde demais', 'admin');
    raise exception 'reabrir depois da produção devia falhar (RN-43)';
  exception when check_violation then null; end;
end $$;
reset role;

-- ═════════ Ficheiros do cliente (como o sistema, chave secreta) ═════════
do $$ declare d uuid; i int; begin
  insert into deliverables (project_id, project_phase_id, role, series_key, version_no, label, uploaded_by_role)
  values ('30000000-0000-0000-0000-0000000aca01', pg_temp.id('aca:pedido-briefing'), 'referencia', 'referencias', 1, 'R1', 'client') returning id into d;
  begin insert into files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
        values (d, '30000000-0000-0000-0000-0000000aca01', 'client-uploads', 'x/big.pdf', 'big.pdf', 'application/pdf', 11000000);
    raise exception '11 MB no bucket do cliente devia falhar';
  exception when check_violation then null; end;
  begin insert into files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
        values (d, '30000000-0000-0000-0000-0000000aca01', 'project-files', 'x/a.pdf', 'a.pdf', 'application/pdf', 1000);
    raise exception 'ficheiro do cliente no bucket do admin devia falhar';
  exception when check_violation then null; end;
  for i in 1..10 loop
    insert into files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
    values (d, '30000000-0000-0000-0000-0000000aca01', 'client-uploads', 'x/f' || i || '.pdf', 'f.pdf', 'application/pdf', 1000);
  end loop;
  begin insert into files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
        values (d, '30000000-0000-0000-0000-0000000aca01', 'client-uploads', 'x/f11.pdf', 'f.pdf', 'application/pdf', 1000);
    raise exception '11.º ficheiro na fase devia falhar (RN-09)';
  exception when check_violation then null; end;
end $$;

-- ═════════ RLS de leitura ═════════
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
insert into quotes (project_id, version, total_kz) values ('30000000-0000-0000-0000-0000000aca01', 2, 99999);   -- rascunho
insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role)
values ('30000000-0000-0000-0000-0000000aca01', 'interno', 'notas', 1, 'N1', 'admin');
reset role;
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ begin
  assert (select count(*) from quotes where status = 'rascunho') = 0, 'cliente não vê rascunhos';
  assert (select count(*) from deliverables where role = 'interno') = 0, 'cliente não vê ficheiros internos';
  assert (select count(*) from payments where project_id = '30000000-0000-0000-0000-0000000de501') = 0, 'A não vê pagamentos de B';
  assert (select count(*) from approvals where project_id = '30000000-0000-0000-0000-0000000de501') = 0, 'A não vê aprovações de B';
  assert (select count(*) from files) = 10, 'A vê os seus ficheiros';
  assert (select count(*) from access_links) = 0, 'cliente não vê links';
end $$;
reset role;

-- M5-09 (#47): o cliente B nunca vê ficheiros nem versões do projeto de A, nem por junção.
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  assert (select count(*) from files where project_id = '30000000-0000-0000-0000-0000000aca01') = 0, 'B não vê ficheiros de A';
  assert (select count(*) from deliverables where project_id = '30000000-0000-0000-0000-0000000aca01') = 0, 'B não vê versões de A';
  assert (select count(*) from files f join deliverables d on d.id = f.deliverable_id
          where d.project_id = '30000000-0000-0000-0000-0000000aca01') = 0, 'B não vê ficheiros de A por junção';
  assert (select count(*) from files f where not exists (
            select 1 from deliverables d where d.id = f.deliverable_id and d.project_id = '30000000-0000-0000-0000-0000000de501')) = 0,
         'B só vê ficheiros do seu projeto';
end $$;
reset role;

-- ═════════ Cancelamento anula o que falta pagar (RN-13) ═════════
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ begin
  perform admin_set_project_status('30000000-0000-0000-0000-0000000aca01', 'cancelado', 'Desistiu');
  assert (select status from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'restante') = 'anulado', 'restante anulado';
  assert (select status from payments where project_id = '30000000-0000-0000-0000-0000000aca01' and kind = 'sinal') = 'pago', 'sinal pago fica';
end $$;
reset role;

\echo '✔ 0007: todos os testes passaram'
