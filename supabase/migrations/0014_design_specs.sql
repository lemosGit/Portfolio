-- ============================================================================
-- 0014 — Ficha técnica da peça de Design (M7-01, #64)
-- Modelo: docs/02-modelagem/mer/fichas-servico.md §4.1 · RF-20.10…12 · RN-44 · D-020, D-057 · Q-102, D-160
-- Regras: F1 (só em projetos Design), F2 (sem impressão → fase Produção "não se aplica"),
-- F5 (estado da produção só com impressão), F6 (auditoria). Segurança: S para o cliente; S I U admin.
-- As colunas da produção e do levantamento ficam já na tabela (M7-05), sem ecrã nesta tarefa.
-- ============================================================================

create table public.design_specs (
  project_id         uuid primary key references public.projects (id) on delete cascade,
  piece_type         text not null check (piece_type in ('logotipo_identidade', 'convite_digital', 'convite_impresso', 'lona', 'camisola', 'outro')),
  piece_label        text check (char_length(piece_label) <= 120),
  width_cm           numeric(7, 2) check (width_cm > 0),
  height_cm          numeric(7, 2) check (height_cm > 0),
  size_notes         text check (char_length(size_notes) <= 300),
  material           text check (char_length(material) <= 120),
  quantity           integer not null default 1 check (quantity > 0 and quantity <= 1000000),
  finish             text check (char_length(finish) <= 120),
  has_print          boolean not null,
  has_digital_files  boolean not null,
  event_date         date,
  key_texts          jsonb not null default '[]' check (jsonb_typeof(key_texts) = 'array' and jsonb_array_length(key_texts) <= 20),  -- D-057
  production_status  text check (production_status in ('a_imprimir', 'pronto')),
  pickup_at          timestamptz,
  pickup_place       text check (char_length(pickup_place) <= 200),
  delivered_at       timestamptz,
  updated_at         timestamptz not null default now(),
  check (production_status is null or has_print)                                                    -- F5
);

comment on table public.design_specs is 'Ficha técnica da peça de Design (RF-20.10): 1:1 com projects design.';

-- F1: só em projetos Design (RN-02).
create or replace function private.design_specs_check()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- só o admin escreve (a RLS também o garante); a mensagem não revela nada sobre projetos alheios.
  -- Sem utilizador (service_role, scripts) passa: a RLS não se aplica a esses papéis.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Sem permissão.' using errcode = 'insufficient_privilege';
  end if;
  if (select service_type from public.projects where id = new.project_id) is distinct from 'design' then
    raise exception 'A ficha técnica só existe em projetos Design.' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger design_specs_check before insert or update on public.design_specs
  for each row execute function private.design_specs_check();

-- F2 (RN-44, D-020): sem impressão, a fase Produção passa a "não se aplica"; com impressão, volta a "por iniciar".
-- Se a produção já começou, não se tira a impressão (a fase teria de ser revista à mão primeiro).
create or replace function private.design_specs_print()
returns trigger language plpgsql set search_path = '' as $$
declare st text;
begin
  if tg_op = 'UPDATE' and new.has_print = old.has_print then return null; end if;
  select status into st from public.project_phases where project_id = new.project_id and key = 'producao';
  if st is null then return null; end if;
  if not new.has_print then
    if st = 'por_iniciar' then
      update public.project_phases set status = 'nao_aplicavel' where project_id = new.project_id and key = 'producao';
    elsif st <> 'nao_aplicavel' then
      raise exception 'A produção já começou: reabra ou reveja a fase Produção antes de tirar a impressão.' using errcode = 'check_violation';
    end if;
  elsif st = 'nao_aplicavel' then
    update public.project_phases set status = 'por_iniciar' where project_id = new.project_id and key = 'producao';
  end if;
  return null;
end $$;
create trigger design_specs_print after insert or update of has_print on public.design_specs
  for each row execute function private.design_specs_print();

-- F6: auditoria (D-051); a ficha não tem `id`, usa o project_id.
create or replace function private.audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  act text := lower(tg_op);
begin
  if tg_op = 'UPDATE' and (to_jsonb(old) ->> 'purged_at') is null and (to_jsonb(new) ->> 'purged_at') is not null then
    act := 'purge';
  end if;
  insert into public.activity_log (project_id, entity, entity_id, action, before, after, actor_id)
  values ((rec ->> 'project_id')::uuid,
          case tg_table_name when 'quotes' then 'quote' when 'payments' then 'payment' when 'deliverables' then 'deliverable'
                             when 'files' then 'file' when 'approvals' then 'approval' when 'academic_briefs' then 'academic_brief'
                             when 'design_specs' then 'design_spec'
                             else tg_table_name end,
          coalesce((rec ->> 'id')::uuid, (rec ->> 'project_id')::uuid), act,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return null;
end $$;
create trigger audit_design_specs after insert or update or delete on public.design_specs
  for each row execute function private.audit();

-- RLS (seguranca.md §2): o cliente lê a ficha do seu projeto; o admin lê, cria e altera (sem apagar: só cascade).
alter table public.design_specs enable row level security;
create policy "cliente lê a ficha técnica do seu projeto" on public.design_specs
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin cria a ficha técnica" on public.design_specs
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera a ficha técnica" on public.design_specs
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
