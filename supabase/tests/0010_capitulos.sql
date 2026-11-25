-- Testes da migração 0010 (capítulos do trabalho académico, M6-03). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('70000000-0000-0000-0000-0000000000a1', 'cap-a', '10000000-0000-0000-0000-0000000000a1', 'Capítulos A', 'academic', '2027-01-10'),
  ('70000000-0000-0000-0000-0000000000b1', 'cap-b', '10000000-0000-0000-0000-0000000000b1', 'Convite B', 'design', '2027-01-10');

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$
declare a uuid := '70000000-0000-0000-0000-0000000000a1'; ok boolean; s2 uuid;
begin
  insert into academic_sections (project_id, position, title) values (a, 1, 'Introdução'), (a, 2, 'Revisão'), (a, 3, 'Metodologia');
  -- F1
  begin insert into academic_sections (project_id, position, title) values ('70000000-0000-0000-0000-0000000000b1', 1, 'x'); ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F1: capítulos num projeto Design';
  -- posição única
  begin insert into academic_sections (project_id, position, title) values (a, 2, 'Duplicado'); ok := false;
  exception when unique_violation then ok := true; end;
  assert ok, 'posição repetida';
  -- mover: Revisão sobe para 1; Introdução desce para 2
  s2 := (select id from academic_sections where project_id = a and title = 'Revisão');
  perform admin_move_section(s2, -1);
  assert (select string_agg(title, ',' order by position) from academic_sections where project_id = a) = 'Revisão,Introdução,Metodologia', 'subir';
  perform admin_move_section(s2, -1);   -- já no topo: nada muda
  assert (select position from academic_sections where id = s2) = 1, 'no topo não sobe';
  perform admin_move_section(s2, 1);
  assert (select string_agg(title, ',' order by position) from academic_sections where project_id = a) = 'Introdução,Revisão,Metodologia', 'descer';
  -- estados
  update academic_sections set status = 'concluido' where project_id = a and title = 'Introdução';
  begin update academic_sections set status = 'feito' where project_id = a and title = 'Revisão'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'estado fora da lista';
  assert (select count(*) from activity_log where entity = 'academic_sections' and project_id = a) >= 4, 'auditoria';
end $$;
reset role;

-- A lê os seus capítulos e não os altera nem move; B não os vê.
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare n int; ok boolean;
begin
  assert (select count(*) from academic_sections where project_id = '70000000-0000-0000-0000-0000000000a1') = 3, 'A lê os seus capítulos';
  update academic_sections set status = 'concluido' where project_id = '70000000-0000-0000-0000-0000000000a1';
  get diagnostics n = row_count;
  assert n = 0, 'A altera capítulos';
  begin perform admin_move_section((select id from academic_sections where title = 'Revisão' and project_id = '70000000-0000-0000-0000-0000000000a1'), 1); ok := false;
  exception when insufficient_privilege then ok := true; end;
  assert ok, 'A move capítulos';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ begin
  assert (select count(*) from academic_sections where project_id = '70000000-0000-0000-0000-0000000000a1') = 0, 'B lê os capítulos de A';
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon', 'public.admin_move_section(uuid, integer)', 'execute'), 'anon com EXECUTE em admin_move_section';
end $$;

\echo '✔ 0010: capítulos (F1, posição única, mover, estados, auditoria, RLS)'
