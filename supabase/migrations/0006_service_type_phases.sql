-- ============================================================================
-- 0006 — Tipo de serviço e fases como dados (M5-02, #40)
-- Modelo: docs/02-modelagem/mer/fases-servicos.md · Estados: docs/02-modelagem/estados/estados.md
-- Segurança: docs/03-arquitetura/seguranca.md · ADR-001
--
-- Os projetos atuais ficam com service_type = 'development' e continuam a ler as fases do
-- GitHub: nenhuma linha nova é criada para eles (RNF-701).
-- O travão de pagamentos (payments.gates_phase_id, D-052) entra na 0007 (M5-03).
-- ============================================================================

-- ───────────── 1. projects: tipo de serviço e estados ─────────────

alter table public.projects
  add column service_type text not null default 'development'
    check (service_type in ('development', 'academic', 'design')),
  add column completed_at timestamptz,
  add column cancelled_at timestamptz;

alter table public.projects drop constraint projects_status_check;
alter table public.projects
  add constraint projects_status_check check (status in ('ativo', 'pausado', 'entregue', 'cancelado'));

-- GitHub só nos projetos Desenvolvimento (RF-30.02).
alter table public.projects
  add constraint projects_github_only_development check (
    service_type = 'development' or (github_owner is null and github_repo is null and phase_map is null)
  );

create index projects_service_type_idx on public.projects (service_type);

-- ───────────── 2. Tabelas ─────────────

create table public.phase_templates (
  id                 uuid primary key default gen_random_uuid(),
  service_type       text not null check (service_type in ('academic', 'design')),
  position           smallint not null check (position between 1 and 20),
  key                text not null check (char_length(key) between 1 and 40),
  name               text not null check (char_length(name) between 1 and 60),
  description        text not null default '' check (char_length(description) <= 200),
  client_can_upload  boolean not null default false,
  can_be_skipped     boolean not null default false,
  active             boolean not null default true,
  unique (service_type, position),
  unique (service_type, key)
);

create table public.project_phases (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects (id) on delete cascade,
  template_id        uuid references public.phase_templates (id) on delete set null,
  position           smallint not null check (position between 1 and 20),
  key                text not null check (char_length(key) between 1 and 40),
  name               text not null check (char_length(name) between 1 and 60),
  description        text not null default '' check (char_length(description) <= 200),
  client_can_upload  boolean not null default false,
  can_be_skipped     boolean not null default false,
  status             text not null default 'por_iniciar'
    check (status in ('por_iniciar', 'em_curso', 'aguarda_cliente', 'concluida', 'atrasada', 'nao_aplicavel')),
  due_on             date,
  next_step          text check (char_length(next_step) <= 200),
  next_step_owner    text check (next_step_owner in ('geniusfrela', 'cliente')),
  progress           smallint check (progress between 0 and 100),
  started_at         timestamptz,
  completed_at       timestamptz,
  updated_at         timestamptz not null default now(),
  unique (project_id, position),
  unique (project_id, key),
  check (status <> 'nao_aplicavel' or can_be_skipped)                  -- B4
);
create index project_phases_project_idx on public.project_phases (project_id, position);

create table public.phase_events (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  project_phase_id  uuid not null references public.project_phases (id) on delete cascade,
  from_status       text,
  to_status         text not null,
  note              text check (char_length(note) <= 500),
  actor_id          uuid default auth.uid() references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index phase_events_phase_idx on public.phase_events (project_phase_id, created_at);
create index phase_events_project_idx on public.phase_events (project_id, created_at);

create table public.project_status_events (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  from_status       text,
  to_status         text not null,
  client_requested  boolean not null default false,
  note              text check (char_length(note) <= 500),
  actor_id          uuid default auth.uid() references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index project_status_events_project_idx on public.project_status_events (project_id, created_at);

-- ───────────── 3. Modelos de fases (seed, mer §7) ─────────────

insert into public.phase_templates (service_type, position, key, name, description, client_can_upload, can_be_skipped) values
  ('academic', 1, 'pedido-briefing',    'Pedido e briefing',       'Tema, normas, páginas e prazo combinados.',            true,  false),
  ('academic', 2, 'orcamento-aceite',   'Orçamento e aceite',      'Valor, sinal e prazo para aceitar.',                   false, false),
  ('academic', 3, 'estrutura',          'Estrutura (índice)',      'Índice proposto para aprovar.',                        false, true),
  ('academic', 4, 'desenvolvimento',    'Desenvolvimento',         'Escrita dos capítulos.',                               false, false),
  ('academic', 5, 'revisao-formatacao', 'Revisão e formatação',    'Revisão do texto e aplicação das normas.',             true,  false),
  ('academic', 6, 'entrega-final',      'Entrega final',           'Ficheiros finais em PDF e Word.',                      false, false),
  ('academic', 7, 'ajustes',            'Ajustes',                 'Pequenas correções dentro do prazo combinado.',        true,  false),
  ('design',   1, 'briefing',           'Briefing',                'Tipo de peça, medidas, quantidades, referências e textos.', true, false),
  ('design',   2, 'orcamento-sinal',    'Orçamento e sinal',       'Valor do design e da impressão, e o sinal.',           false, false),
  ('design',   3, 'conceito',           'Conceito / esboço',       'Primeira proposta visual.',                            false, false),
  ('design',   4, 'revisoes',           'Revisões',                'Rondas de ajuste com os seus comentários.',            true,  false),
  ('design',   5, 'aprovacao-arte',     'Aprovação final da arte', 'Aprovar a arte para produção.',                        false, false),
  ('design',   6, 'producao',           'Produção / impressão',    'A peça está a ser produzida.',                         false, true),
  ('design',   7, 'entrega-levantamento','Entrega / levantamento', 'Data e local de levantamento, ficheiros finais.',      false, false);

-- ───────────── 4. Funções e triggers ─────────────
-- Notas e "a pedido do cliente" chegam aos triggers por settings da transação
-- (app.note, app.client_requested), definidos pelas funções admin_set_* abaixo.

create or replace function private.tx_note()
returns text language sql stable set search_path = '' as $$
  select nullif(current_setting('app.note', true), '')
$$;

-- B3: o tipo de serviço não muda (RN-02).
create or replace function private.projects_lock_service_type()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.service_type is distinct from old.service_type then
    raise exception 'O tipo de serviço de um projeto não pode mudar.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger projects_lock_service_type before update of service_type on public.projects
  for each row execute function private.projects_lock_service_type();

-- B6 + estados do projeto (estados.md §2).
create or replace function private.projects_status_transition()
returns trigger language plpgsql set search_path = '' as $$
declare
  ok boolean;
  note text := private.tx_note();
begin
  if new.status = old.status then return new; end if;
  ok := (old.status, new.status) in (
    ('ativo', 'pausado'), ('pausado', 'ativo'),
    ('ativo', 'entregue'), ('entregue', 'ativo'),
    ('ativo', 'cancelado'), ('pausado', 'cancelado'));
  if not ok then
    raise exception 'Transição de projeto não permitida: % → %.', old.status, new.status using errcode = 'check_violation';
  end if;
  if new.status in ('pausado', 'cancelado') or (old.status = 'entregue' and new.status = 'ativo') then
    if note is null then
      raise exception 'Indique o motivo (% → %).', old.status, new.status using errcode = 'check_violation';
    end if;
  end if;
  if new.status = 'entregue' then new.completed_at := now(); end if;
  if old.status = 'entregue' and new.status = 'ativo' then new.completed_at := null; end if;  -- D-065
  if new.status = 'cancelado' then new.cancelled_at := now(); end if;
  return new;
end $$;
create trigger projects_status_transition before update of status on public.projects
  for each row execute function private.projects_status_transition();

-- Histórico do projeto (D-066). security definer: ninguém insere diretamente pela API.
create or replace function private.projects_log_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.project_status_events (project_id, from_status, to_status, client_requested, note, actor_id)
    values (new.id,
            case when tg_op = 'UPDATE' then old.status end,
            new.status,
            coalesce(nullif(current_setting('app.client_requested', true), '')::boolean, false),
            private.tx_note(),
            auth.uid());
  end if;
  return null;
end $$;
create trigger projects_log_status after insert or update of status on public.projects
  for each row execute function private.projects_log_status();

-- B1: copiar o modelo de fases ao criar um projeto Académico ou Design (D-042, D-045).
create or replace function private.projects_create_phases()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.service_type in ('academic', 'design') then
    insert into public.project_phases
      (project_id, template_id, position, key, name, description, client_can_upload, can_be_skipped)
    select new.id, t.id, t.position, t.key, t.name, t.description, t.client_can_upload, t.can_be_skipped
    from public.phase_templates t
    where t.service_type = new.service_type and t.active
    order by t.position;
  end if;
  return null;
end $$;
create trigger projects_create_phases after insert on public.projects
  for each row execute function private.projects_create_phases();

-- B2: projetos Desenvolvimento não têm fases na BD (D-001).
create or replace function private.project_phases_check_project()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select service_type from public.projects where id = new.project_id) = 'development' then
    raise exception 'Projetos Desenvolvimento leem as fases do GitHub.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger project_phases_check_project before insert on public.project_phases
  for each row execute function private.project_phases_check_project();

-- Transições de fase (estados.md §1) + started_at/completed_at/updated_at.
create or replace function private.project_phases_transition()
returns trigger language plpgsql set search_path = '' as $$
declare ok boolean;
begin
  new.updated_at := now();
  if new.status = old.status then return new; end if;
  ok := (old.status, new.status) in (
    ('por_iniciar', 'em_curso'), ('por_iniciar', 'nao_aplicavel'),
    ('em_curso', 'aguarda_cliente'), ('aguarda_cliente', 'em_curso'),
    ('em_curso', 'atrasada'), ('atrasada', 'em_curso'),
    ('em_curso', 'concluida'), ('aguarda_cliente', 'concluida'), ('atrasada', 'concluida'),
    ('concluida', 'em_curso'), ('nao_aplicavel', 'por_iniciar'));
  if not ok then
    raise exception 'Transição de fase não permitida: % → %.', old.status, new.status using errcode = 'check_violation';
  end if;
  if old.status = 'concluida' and private.tx_note() is null then
    raise exception 'Indique o motivo para reabrir a fase.' using errcode = 'check_violation';   -- D-062
  end if;
  if new.status = 'em_curso' and new.started_at is null then new.started_at := now(); end if;
  if new.status = 'concluida' then new.completed_at := now(); end if;
  if old.status = 'concluida' then new.completed_at := null; end if;
  return new;
end $$;
create trigger project_phases_transition before update on public.project_phases
  for each row execute function private.project_phases_transition();

-- B5: histórico das fases (só inserção).
create or replace function private.project_phases_log()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.phase_events (project_id, project_phase_id, from_status, to_status, note, actor_id)
    values (new.project_id, new.id, case when tg_op = 'UPDATE' then old.status end, new.status, private.tx_note(), auth.uid());
  end if;
  return null;
end $$;
create trigger project_phases_log after insert or update of status on public.project_phases
  for each row execute function private.project_phases_log();

-- ───────────── 5. Funções chamadas pelo admin ─────────────
-- security invoker: a RLS garante que só o admin consegue alterar.

create or replace function public.admin_set_phase_status(p_phase uuid, p_status text, p_note text default null)
returns public.project_phases language plpgsql set search_path = '' as $$
declare r public.project_phases;
begin
  perform set_config('app.note', coalesce(p_note, ''), true);
  update public.project_phases set status = p_status where id = p_phase returning * into r;
  if r.id is null then raise exception 'Fase não encontrada ou sem permissão.' using errcode = 'insufficient_privilege'; end if;
  return r;
end $$;

create or replace function public.admin_set_project_status(
  p_project uuid, p_status text, p_note text default null, p_client_requested boolean default false)
returns public.projects language plpgsql set search_path = '' as $$
declare r public.projects;
begin
  perform set_config('app.note', coalesce(p_note, ''), true);
  perform set_config('app.client_requested', p_client_requested::text, true);
  update public.projects set status = p_status where id = p_project returning * into r;
  if r.id is null then raise exception 'Projeto não encontrado ou sem permissão.' using errcode = 'insufficient_privilege'; end if;
  return r;
end $$;

revoke all on function public.admin_set_phase_status(uuid, text, text) from public, anon;
revoke all on function public.admin_set_project_status(uuid, text, text, boolean) from public, anon;
grant execute on function public.admin_set_phase_status(uuid, text, text) to authenticated;
grant execute on function public.admin_set_project_status(uuid, text, text, boolean) to authenticated;

-- ───────────── 6. Prazo ajustado (RN-21…RN-25, D-064) ─────────────
-- due_on + dias em "a aguardar o cliente" (fases) + dias em pausa a pedido do cliente,
-- sem contar duas vezes os intervalos sobrepostos. security invoker: usa a RLS de quem chama.

create or replace function public.project_adjusted_due(p_project uuid)
returns date language sql stable set search_path = '' as $$
  with phase_spans as (
    select e.created_at as starts,
           lead(e.created_at) over (partition by e.project_phase_id order by e.created_at) as ends,
           e.to_status
    from public.phase_events e
    where e.project_id = p_project
  ), project_spans as (
    select e.created_at as starts,
           lead(e.created_at) over (order by e.created_at) as ends,
           e.to_status, e.client_requested
    from public.project_status_events e
    where e.project_id = p_project
  ), spans as (
    select tstzrange(starts, coalesce(ends, now())) as r from phase_spans where to_status = 'aguarda_cliente'
    union all
    select tstzrange(starts, coalesce(ends, now())) from project_spans where to_status = 'pausado' and client_requested
  ), merged as (
    select unnest(range_agg(r)) as r from spans
  )
  select p.due_on + coalesce(ceil(sum(extract(epoch from upper(m.r) - lower(m.r))) / 86400)::int, 0)
  from public.projects p
  left join merged m on true
  where p.id = p_project
  group by p.due_on
$$;
revoke all on function public.project_adjusted_due(uuid) from public, anon;
grant execute on function public.project_adjusted_due(uuid) to authenticated;

-- ───────────── 7. Row Level Security (seguranca.md §2, §5) ─────────────

alter table public.phase_templates        enable row level security;
alter table public.project_phases         enable row level security;
alter table public.phase_events           enable row level security;
alter table public.project_status_events  enable row level security;

-- phase_templates: só o admin (o cliente não precisa).
create policy "admin gere modelos de fases" on public.phase_templates
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- project_phases: o cliente lê as do seu projeto; o admin lê, cria e altera (sem apagar: só cascade).
create policy "cliente lê as fases do seu projeto" on public.project_phases
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin cria fases" on public.project_phases
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera fases" on public.project_phases
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Históricos: só leitura pela API (inseridos pelos triggers security definer, D-101).
create policy "lê o histórico das fases" on public.phase_events
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "lê o histórico do projeto" on public.project_status_events
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));

-- Os eventos iniciais dos projetos que já existem (para o histórico começar hoje).
insert into public.project_status_events (project_id, from_status, to_status, note, actor_id)
select id, null, status, 'Estado inicial (migração 0006)', null from public.projects;
