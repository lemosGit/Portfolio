-- Testes da migração 0008 (retenção dos ficheiros, #122). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('50000000-0000-0000-0000-0000000000a1', 'ret-a', '10000000-0000-0000-0000-0000000000a1', 'Retenção A', 'academic', '2027-01-10'),
  ('50000000-0000-0000-0000-0000000000a2', 'ret-b', '10000000-0000-0000-0000-0000000000a1', 'Retenção B', 'design', '2027-01-10');

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$
declare today date := (now() at time zone 'Africa/Luanda')::date;
begin
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a1') is null, 'ativo: sem data de limpeza';
  perform admin_set_project_status('50000000-0000-0000-0000-0000000000a1', 'entregue');
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a1') = today + 90, 'entregue: +90 dias';
  update projects set files_keep_until = today + 120 where id = '50000000-0000-0000-0000-0000000000a1';
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a1') = today + 120, 'adiamento ganha';
  update projects set files_keep_until = today + 10 where id = '50000000-0000-0000-0000-0000000000a1';
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a1') = today + 90, 'adiamento menor não encurta';
  perform admin_set_project_status('50000000-0000-0000-0000-0000000000a1', 'ativo', 'Reaberto');
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a1') is null, 'reaberto: a contagem para (RN-28)';
  perform admin_set_project_status('50000000-0000-0000-0000-0000000000a2', 'cancelado', 'Desistiu');
  assert (select files_purge_on(p) from projects p where id = '50000000-0000-0000-0000-0000000000a2') = today + 90, 'cancelado: +90 dias (D-146)';
end $$;
reset role;

-- o cliente não adia (projects só se altera pelo admin)
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare n int;
begin
  update projects set files_keep_until = '2099-01-01' where id = '50000000-0000-0000-0000-0000000000a2';
  get diagnostics n = row_count;
  assert n = 0, 'cliente adia a limpeza';
end $$;
reset role;
set role anon;
do $$ declare ok boolean;
begin
  begin perform files_purge_on(p) from projects p; ok := false;
  exception when insufficient_privilege then ok := true; end;
  assert ok or (select count(*) from projects) = 0, 'anon usa files_purge_on';
end $$;
reset role;

\echo '✔ 0008: retenção dos ficheiros (90 dias, adiamento, reabrir, cancelado)'
