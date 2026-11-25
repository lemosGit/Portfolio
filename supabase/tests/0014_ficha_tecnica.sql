-- Testes da migração 0014 (ficha técnica da peça de Design, M7-01). Corre com: bash scripts/db-test.sh
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\set ADMIN '{"sub":"00000000-0000-0000-0000-0000000000ad","app_metadata":{"role":"admin"}}'
\set CA '{"sub":"00000000-0000-0000-0000-0000000000a1"}'
\set CB '{"sub":"00000000-0000-0000-0000-0000000000b1"}'

insert into public.projects (id, slug, client_id, name, service_type, due_on) values
  ('b0000000-0000-0000-0000-0000000014a1', 'peca-a', '10000000-0000-0000-0000-0000000000a1', 'Convite A', 'design', '2027-01-10'),
  ('b0000000-0000-0000-0000-0000000014a2', 'peca-aca', '10000000-0000-0000-0000-0000000000a1', 'Monografia', 'academic', '2027-01-10');

create function pg_temp.producao() returns text language sql as $$
  select status from public.project_phases where project_id = 'b0000000-0000-0000-0000-0000000014a1' and key = 'producao'
$$;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  insert into design_specs (project_id, piece_type, piece_label, width_cm, height_cm, material, quantity, finish, has_print, has_digital_files, event_date, key_texts)
  values ('b0000000-0000-0000-0000-0000000014a1', 'convite_impresso', 'Convite do casamento', 14.8, 21, 'Couché 300 g', 120, 'Laminação mate', true, true, '2027-01-20',
          '[{"label":"Noivos","value":"Ana & Paulo"}]');
  assert pg_temp.producao() = 'por_iniciar', 'com impressão, a Produção fica por iniciar';
  -- F1: só em projetos Design
  begin
    insert into design_specs (project_id, piece_type, has_print, has_digital_files) values ('b0000000-0000-0000-0000-0000000014a2', 'lona', true, false);
    ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F1: ficha técnica num projeto Académico';
  -- domínios e limites
  begin update design_specs set piece_type = 'caneca' where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'tipo de peça fora da lista';
  begin update design_specs set quantity = 0 where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'quantidade > 0';
  begin update design_specs set width_cm = -1 where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'medidas > 0';
  begin update design_specs set key_texts = '{"a":1}' where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'key_texts tem de ser uma lista';
  begin update design_specs set key_texts = (select jsonb_agg(jsonb_build_object('label', 'L' || i, 'value', 'v')) from generate_series(1, 21) i)
        where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'no máximo 20 textos (D-057)';

  -- F2: sem impressão → Produção "não se aplica"; de volta → "por iniciar"
  update design_specs set has_print = false where project_id = 'b0000000-0000-0000-0000-0000000014a1';
  assert pg_temp.producao() = 'nao_aplicavel', 'F2: sem impressão salta a Produção';
  -- F5: estado da produção só com impressão
  begin update design_specs set production_status = 'a_imprimir' where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F5: estado da produção sem impressão';
  update design_specs set has_print = true where project_id = 'b0000000-0000-0000-0000-0000000014a1';
  assert pg_temp.producao() = 'por_iniciar', 'F2: com impressão a Produção volta a por iniciar';
end $$;
reset role;

-- produção já começada (fora dos gatilhos: o aceite e o sinal estão testados em 0011): não se tira a impressão
set session_replication_role = replica;
update public.project_phases set status = 'em_curso' where project_id = 'b0000000-0000-0000-0000-0000000014a1' and key = 'producao';
set session_replication_role = origin;

select set_config('request.jwt.claims', :'ADMIN', false); set role authenticated;
do $$ declare ok boolean;
begin
  begin update design_specs set has_print = false where project_id = 'b0000000-0000-0000-0000-0000000014a1'; ok := false;
  exception when check_violation then ok := true; end;
  assert ok, 'F2: não se tira a impressão com a produção começada';

  -- F6: auditoria (insert + 2 updates de has_print), entity = design_spec
  assert (select count(*) from activity_log where entity = 'design_spec' and entity_id = 'b0000000-0000-0000-0000-0000000014a1') = 3,
    format('F6: auditoria da ficha técnica (%s)', (select count(*) from activity_log where entity = 'design_spec' and entity_id = 'b0000000-0000-0000-0000-0000000014a1'));
end $$;
reset role;

-- O cliente A lê a sua ficha e não a altera; o cliente B não a vê nem a cria.
select set_config('request.jwt.claims', :'CA', false); set role authenticated;
do $$ declare n int;
begin
  assert (select quantity from design_specs where project_id = 'b0000000-0000-0000-0000-0000000014a1') = 120, 'A lê a sua ficha técnica';
  update design_specs set quantity = 1 where project_id = 'b0000000-0000-0000-0000-0000000014a1';
  get diagnostics n = row_count;
  assert n = 0, 'A altera a ficha técnica';
end $$;
reset role;
select set_config('request.jwt.claims', :'CB', false); set role authenticated;
do $$ declare ok boolean;
begin
  assert (select count(*) from design_specs where project_id = 'b0000000-0000-0000-0000-0000000014a1') = 0, 'B lê a ficha técnica de A';
  begin insert into design_specs (project_id, piece_type, has_print, has_digital_files) values ('b0000000-0000-0000-0000-0000000014a1', 'lona', true, false); ok := false;
  exception when insufficient_privilege then ok := true; end;
  assert ok, 'B cria uma ficha técnica';
end $$;
reset role;

\echo '✔ 0014: ficha técnica da peça (F1, F2, F5, domínios, auditoria, RLS)'
