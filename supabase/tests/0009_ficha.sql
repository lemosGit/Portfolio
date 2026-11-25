-- Testes da migração 0009 (ficha do trabalho académico, M6-01). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('60000000-0000-0000-0000-0000000000a1', 'ficha-a', '10000000-0000-0000-0000-0000000000a1', 'Ficha A', 'academic', '2027-01-10'),
  ('60000000-0000-0000-0000-0000000000b1', 'ficha-b', '10000000-0000-0000-0000-0000000000b1', 'Convite B', 'design', '2027-01-10');

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  insert into academic_briefs (project_id, topic, work_type, education_level, institution, citation_style, pages_target)
  values ('60000000-0000-0000-0000-0000000000a1', 'O microcrédito em Luanda', 'universitario', 'licenciatura', 'UAN', 'APA', 45);
  assert (select adjust_days from academic_briefs where project_id = '60000000-0000-0000-0000-0000000000a1') = 7, 'adjust_days por omissão = 7';
  assert (select uses_chapters from academic_briefs where project_id = '60000000-0000-0000-0000-0000000000a1'), 'uses_chapters por omissão';
  -- F1: só em projetos Académico
  begin
    insert into academic_briefs (project_id, topic, work_type, education_level) values ('60000000-0000-0000-0000-0000000000b1', 'x', 'escolar', 'outro');
    ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F1: ficha num projeto Design';
  -- domínios
  begin
    update academic_briefs set citation_style = 'Harvard' where project_id = '60000000-0000-0000-0000-0000000000a1';
    ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'norma fora da lista';
  begin
    update academic_briefs set adjust_days = 90 where project_id = '60000000-0000-0000-0000-0000000000a1';
    ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'adjust_days > 60 (RN-33)';
  -- F6: auditoria com entity_id = project_id
  update academic_briefs set pages_target = 50 where project_id = '60000000-0000-0000-0000-0000000000a1';
  assert (select count(*) from activity_log where entity = 'academic_brief' and entity_id = '60000000-0000-0000-0000-0000000000a1') = 2,
    'F6: insert + update na auditoria';
end $$;
reset role;

-- O cliente A lê a sua ficha e não a altera; o cliente B não a vê.
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare n int;
begin
  assert (select topic from academic_briefs where project_id = '60000000-0000-0000-0000-0000000000a1') = 'O microcrédito em Luanda', 'A lê a sua ficha';
  update academic_briefs set topic = 'mudado' where project_id = '60000000-0000-0000-0000-0000000000a1';
  get diagnostics n = row_count;
  assert n = 0, 'A altera a ficha';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  assert (select count(*) from academic_briefs where project_id = '60000000-0000-0000-0000-0000000000a1') = 0, 'B lê a ficha de A';
end $$;
reset role;

\echo '✔ 0009: ficha do trabalho académico (F1, domínios, auditoria, RLS)'
