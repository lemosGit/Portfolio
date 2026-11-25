-- M5-13 (#51) — Testes das políticas RLS das tabelas novas (seguranca.md §6, T1–T12).
-- Critério: o cliente A não lê nem escreve dados do cliente B. Corre com: bash scripts/db-test.sh
-- Usa os utilizadores e clientes criados em 0006_fases.sql (A, B, admin) e projetos próprios (prefixo 4…).
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

-- ═════════ Dados (superutilizador): um projeto de A e um de B com uma linha em cada tabela ═════════
insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('40000000-0000-0000-0000-0000000000a1', 'rls-a', '10000000-0000-0000-0000-0000000000a1', 'RLS A', 'academic', '2027-01-10'),
  ('40000000-0000-0000-0000-0000000000b1', 'rls-b', '10000000-0000-0000-0000-0000000000b1', 'RLS B', 'design', '2027-01-20');

create temp table rls_ids (k text primary key, v uuid);
grant all on rls_ids to authenticated, anon;
create function pg_temp.rid(k text) returns uuid language sql as $$ select v from rls_ids where rls_ids.k = $1 $$;

do $$
declare
  a uuid := '40000000-0000-0000-0000-0000000000a1';
  b uuid := '40000000-0000-0000-0000-0000000000b1';
  p uuid; q uuid; pay uuid; d uuid; f uuid; ap uuid;
begin
  foreach p in array array[a, b] loop
    insert into quotes (project_id, version, total_kz) values (p, 1, 1000) returning id into q;
    insert into payments (project_id, quote_id, kind, description, amount_kz) values (p, q, 'sinal', 'Sinal', 500) returning id into pay;
    insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role) values (p, 'prova', 'arte', 1, 'V1', 'admin') returning id into d;
    insert into deliverables (project_id, role, series_key, version_no, label, uploaded_by_role) values (p, 'interno', 'notas', 1, 'N1', 'admin');
    insert into files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
      values (d, p, 'project-files', p || '/' || d || '/x.pdf', 'x.pdf', 'application/pdf', 100) returning id into f;
    insert into approvals (project_id, subject, deliverable_id, version_label, snapshot) values (p, 'prova', d, 'V1', '{}'::jsonb) returning id into ap;
    insert into access_links (client_id, project_id, token_digest, channel, expires_at)
      select client_id, p, encode(sha256(p::text::bytea), 'hex'), 'copiar', now() + interval '1 day' from projects where id = p;
    insert into feedback (project_id, author_id, author_role, body)
      select p, c.user_id, 'client', 'Olá' from projects x join clients c on c.id = x.client_id where x.id = p;
    insert into demo_links (project_id, kind, url, version) values (p, 'web', 'https://example.com', '1.0');
    insert into meetings (project_id, title, starts_at, ends_at, call_url) values (p, 'Reunião', now(), now() + interval '1 hour', 'https://meet.example.com');
    insert into rls_ids values
      ((case when p = a then 'a' else 'b' end) || ':quote', q), ((case when p = a then 'a' else 'b' end) || ':payment', pay),
      ((case when p = a then 'a' else 'b' end) || ':deliverable', d), ((case when p = a then 'a' else 'b' end) || ':file', f),
      ((case when p = a then 'a' else 'b' end) || ':approval', ap),
      ((case when p = a then 'a' else 'b' end) || ':phase', (select id from project_phases where project_id = p and position = 1));
  end loop;
  update quotes set status = 'enviado' where project_id in (a, b);   -- cria a aprovação do orçamento e o activity_log
end $$;

-- Executa um comando e diz se foi bloqueado: erro de permissão/RLS/regra, ou 0 linhas afetadas.
create function pg_temp.blocked(cmd text) returns boolean language plpgsql as $$
declare n bigint;
begin
  execute cmd;
  get diagnostics n = row_count;
  return n = 0;
exception
  when insufficient_privilege or check_violation or foreign_key_violation or not_null_violation or raise_exception then
    return true;
end $$;
grant execute on function pg_temp.blocked(text) to authenticated, anon;

-- ═════════ T1, T10: A não lê nada de B ═════════
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$
declare
  b uuid := '40000000-0000-0000-0000-0000000000b1';
  t text; n bigint;
begin
  foreach t in array array['project_phases', 'phase_events', 'project_status_events', 'quotes', 'payments', 'deliverables',
                           'files', 'approvals', 'activity_log', 'access_links', 'feedback', 'demo_links', 'meetings', 'academic_briefs', 'academic_sections'] loop
    execute format('select count(*) from public.%I where project_id = $1', t) into n using b;
    assert n = 0, format('T1: A lê %s linha(s) de %s do projeto de B', n, t);
  end loop;
  assert (select count(*) from projects where id = b) = 0, 'T1: A lê o projeto de B';
  assert (select count(*) from clients where user_id = '00000000-0000-0000-0000-0000000000b1') = 0, 'T1: A lê o cliente B';
  assert (select count(*) from approval_responses r join approvals x on x.id = r.approval_id where x.project_id = b) = 0, 'T1: respostas de B';
  -- por junção também não
  assert (select count(*) from files f join deliverables d on d.id = f.deliverable_id where d.project_id = b) = 0, 'T1: files ⋈ deliverables';
  -- T10: no próprio projeto, A não vê internos, auditoria nem links; os modelos de fases também não
  assert (select count(*) from deliverables where role = 'interno') = 0, 'T10: internos';
  assert (select count(*) from activity_log) = 0, 'T10: activity_log';
  assert (select count(*) from access_links) = 0, 'T10: access_links';
  assert (select count(*) from phase_templates) = 0, 'T10: phase_templates';
  -- mas vê o seu
  assert (select count(*) from payments where project_id = '40000000-0000-0000-0000-0000000000a1') = 1, 'A vê os seus pagamentos';
  assert (select count(*) from approvals where project_id = '40000000-0000-0000-0000-0000000000a1') = 2, 'A vê as suas aprovações';
end $$;

-- ═════════ T6, T7: A não escreve nada (nem no seu projeto, nem no de B) ═════════
do $$
declare
  a uuid := '40000000-0000-0000-0000-0000000000a1';
  b uuid := '40000000-0000-0000-0000-0000000000b1';
  t text;
begin
  -- UPDATE e DELETE em tudo o que é de B
  foreach t in array array['project_phases', 'quotes', 'payments', 'deliverables', 'files', 'approvals', 'access_links',
                           'feedback', 'demo_links', 'meetings', 'phase_events', 'project_status_events', 'activity_log', 'academic_briefs', 'academic_sections'] loop
    assert pg_temp.blocked(format('update public.%I set project_id = project_id where project_id = %L', t, b)), format('T6: A altera %s de B', t);
    assert pg_temp.blocked(format('delete from public.%I where project_id = %L', t, b)), format('T6: A apaga %s de B', t);
  end loop;
  assert pg_temp.blocked(format('update public.projects set name = %L where id = %L', 'x', b)), 'T6: A altera o projeto de B';
  assert pg_temp.blocked(format('delete from public.projects where id = %L', b)), 'T6: A apaga o projeto de B';

  -- T6: nem no seu próprio projeto o cliente muda valores (pela API REST seria o mesmo pedido)
  assert pg_temp.blocked(format('update public.payments set amount_kz = 1 where project_id = %L', a)), 'T6: A muda o valor do seu pagamento';
  assert pg_temp.blocked(format('update public.payments set status = %L, paid_on = current_date where project_id = %L', 'pago', a)), 'T6: A marca-se pago';
  assert pg_temp.blocked(format('update public.project_phases set status = %L where project_id = %L', 'em_curso', a)), 'T6: A muda a sua fase';
  assert pg_temp.blocked(format('update public.approvals set status = %L where project_id = %L', 'cancelada', a)), 'T6: A cancela a sua aprovação';
  assert pg_temp.blocked(format('update public.deliverables set locked_by_payment_id = null where project_id = %L', a)), 'T6: A desbloqueia um ficheiro';

  -- T7: INSERT direto, no seu projeto e no de B
  foreach t in array array[a::text, b::text] loop
    assert pg_temp.blocked(format($q$insert into public.deliverables (project_id, role, series_key, version_no, label, uploaded_by_role)
                                     values (%L, 'referencia', 'ref', 9, 'V9', 'client')$q$, t)), 'T7: A insere deliverables';
    assert pg_temp.blocked(format($q$insert into public.files (deliverable_id, project_id, bucket, storage_path, original_name, mime_type, size_bytes)
                                     values (%L, %L, 'client-uploads', 'p/x.pdf', 'x.pdf', 'application/pdf', 1)$q$,
                                   pg_temp.rid(case when t = a::text then 'a:deliverable' else 'b:deliverable' end), t)), 'T7: A insere files';
    assert pg_temp.blocked(format($q$insert into public.payments (project_id, kind, description, amount_kz) values (%L, 'extra', 'x', 1)$q$, t)), 'T7: A insere payments';
    assert pg_temp.blocked(format($q$insert into public.approvals (project_id, subject, snapshot) values (%L, 'indice', '{}')$q$, t)), 'T7: A insere approvals';
    assert pg_temp.blocked(format($q$insert into public.quotes (project_id, version, total_kz) values (%L, 9, 1)$q$, t)), 'T7: A insere quotes';
    assert pg_temp.blocked(format($q$insert into public.access_links (client_id, project_id, token_digest, channel, expires_at)
                                     values ('10000000-0000-0000-0000-0000000000a1', %L, repeat('a', 64), 'copiar', now())$q$, t)), 'T7: A insere access_links';
  end loop;
  assert pg_temp.blocked(format($q$insert into public.approval_responses (approval_id, kind, actor_role) values (%L, 'aprovar', 'client')$q$,
                                pg_temp.rid('a:approval'))), 'T7: A responde direto em approval_responses (sem a RPC)';
  assert pg_temp.blocked(format($q$insert into public.approval_responses (approval_id, kind, comment, actor_role) values (%L, 'reabrir', 'x', 'admin')$q$,
                                pg_temp.rid('a:approval'))), 'T7: A finge ser admin para reabrir';
  -- feedback: A escreve no seu projeto, nunca no de B
  assert pg_temp.blocked(format($q$insert into public.feedback (project_id, author_role, body) values (%L, 'client', 'intrusão')$q$, b)), 'T7: A escreve feedback em B';
end $$;

-- ═════════ T2 e RPCs: A não age sobre B por funções ═════════
do $$
declare ok boolean;
begin
  begin
    perform respond_approval(pg_temp.rid('b:approval'), 'aprovar');
    ok := false;
  exception when insufficient_privilege then ok := true;
  end;
  assert ok, 'T2: A responde a uma aprovação de B';
  begin
    perform admin_set_phase_status(pg_temp.rid('b:phase'), 'em_curso');
    ok := false;
  exception when insufficient_privilege then ok := true;
  end;
  assert ok, 'A muda uma fase de B pela RPC do admin';
  begin
    perform admin_set_project_status('40000000-0000-0000-0000-0000000000b1', 'pausado', 'x');
    ok := false;
  exception when insufficient_privilege then ok := true;
  end;
  assert ok, 'A pausa o projeto de B pela RPC do admin';
  -- funções de leitura com security invoker: sobre B não devolvem dados de B
  assert (select included + used from design_rounds('40000000-0000-0000-0000-0000000000b1')) = 0, 'design_rounds de B devolve só zeros';
  assert project_adjusted_due('40000000-0000-0000-0000-0000000000b1') is null, 'project_adjusted_due de B';
end $$;
reset role;

-- ═════════ T11: históricos só de inserção, nem o admin altera ou apaga ═════════
select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$
declare t text;
begin
  foreach t in array array['phase_events', 'project_status_events', 'approval_responses', 'activity_log'] loop
    assert pg_temp.blocked(format('update public.%I set created_at = created_at', t)), format('T11: admin altera %s', t);
    assert pg_temp.blocked(format('delete from public.%I', t)), format('T11: admin apaga %s', t);
  end loop;
  -- o admin também não apaga pagamentos nem aprovações (sem política de delete)
  assert pg_temp.blocked('delete from public.payments'), 'admin apaga pagamentos';
  assert pg_temp.blocked('delete from public.approvals'), 'admin apaga aprovações';
  -- mas lê tudo
  assert (select count(*) from access_links where project_id in ('40000000-0000-0000-0000-0000000000a1', '40000000-0000-0000-0000-0000000000b1')) = 2, 'admin lê os links';
  assert (select count(*) from activity_log) > 0, 'admin lê a auditoria';
end $$;
reset role;

-- ═════════ T12: anon não lê nada nem chama RPCs (só o keepalive) ═════════
set role anon;
do $$
declare t text; n bigint; ok boolean;
begin
  foreach t in array array['clients', 'projects', 'project_phases', 'phase_templates', 'phase_events', 'project_status_events', 'quotes',
                           'payments', 'deliverables', 'files', 'approvals', 'approval_responses', 'activity_log', 'access_links',
                           'feedback', 'demo_links', 'meetings', 'academic_briefs', 'academic_sections'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
    exception when insufficient_privilege then n := 0;
    end;
    assert n = 0, format('T12: anon lê %s', t);
  end loop;
  foreach t in array array[
      $q$select respond_approval('00000000-0000-0000-0000-000000000000', 'aprovar')$q$,
      $q$select admin_set_phase_status('00000000-0000-0000-0000-000000000000', 'em_curso')$q$,
      $q$select admin_set_project_status('00000000-0000-0000-0000-000000000000', 'pausado')$q$,
      $q$select project_adjusted_due('00000000-0000-0000-0000-000000000000')$q$,
      $q$select design_rounds('00000000-0000-0000-0000-000000000000')$q$,
      $q$select mark_password_changed()$q$] loop
    begin
      execute t;
      ok := false;
    exception when insufficient_privilege then ok := true;
    end;
    assert ok, format('T12: anon executa %s', t);
  end loop;
end $$;
reset role;

-- T12 (defesa em profundidade): o anon nem sequer tem EXECUTE nas RPCs, mesmo que a função também o recuse por dentro.
do $$
declare fn text;
begin
  foreach fn in array array['public.respond_approval(uuid, text, text, uuid)', 'public.admin_set_phase_status(uuid, text, text)',
                            'public.admin_set_project_status(uuid, text, text, boolean)', 'public.project_adjusted_due(uuid)',
                            'public.design_rounds(uuid)', 'public.mark_password_changed()',
                            'public.files_purge_on(public.projects)', 'public.admin_move_section(uuid, integer)'] loop
    assert not has_function_privilege('anon', fn, 'execute'), format('T12: anon tem EXECUTE em %s', fn);
    assert has_function_privilege('authenticated', fn, 'execute'), format('authenticated sem EXECUTE em %s', fn);
  end loop;
  assert has_function_privilege('anon', 'public.keepalive()', 'execute'), 'o keepalive continua aberto ao anon';
end $$;

\echo '✔ 0090: RLS — o cliente A não lê nem escreve dados do cliente B (T1, T2, T6, T7, T10, T11, T12)'
