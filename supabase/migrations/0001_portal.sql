-- Portal do Cliente — esquema inicial
-- Executar no Supabase: SQL Editor → colar este ficheiro → Run.
-- Fases e tarefas NÃO ficam aqui: vêm do GitHub (milestones/issues).

-- ───────────── Tabelas ─────────────

create table public.clients (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users (id) on delete cascade,
  name                  text not null,
  company               text,
  email                 text not null,
  must_change_password  boolean not null default true,
  created_at            timestamptz not null default now()
);

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  client_id     uuid not null references public.clients (id) on delete cascade,
  name          text not null,
  tagline       text,
  description   text,
  github_owner  text,
  github_repo   text,
  started_on    date,
  due_on        date,
  status        text not null default 'ativo' check (status in ('ativo', 'entregue', 'pausado')),
  team          jsonb not null default '[]'::jsonb, -- [{ "initials": "JP", "name": "João Pereira" }]
  created_at    timestamptz not null default now()
);
create index projects_client_id_idx on public.projects (client_id);

create table public.demo_links (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  kind        text not null check (kind in ('web', 'android', 'ios')),
  url         text not null,
  version     text not null default '0.1.0',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);
create index demo_links_project_id_idx on public.demo_links (project_id);

create table public.meetings (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  call_url    text not null,
  agenda      text[] not null default '{}',
  notes       text,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index meetings_project_id_idx on public.meetings (project_id);

create table public.feedback (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  author_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_role  text not null check (author_role in ('client', 'admin')),
  body         text not null check (char_length(body) between 2 and 2000),
  target_kind  text not null default 'geral' check (target_kind in ('geral', 'fase', 'tarefa')),
  target_ref   integer,
  parent_id    uuid references public.feedback (id) on delete set null,
  created_at   timestamptz not null default now(),
  check ((target_kind = 'geral') = (target_ref is null))
);
create index feedback_project_id_idx on public.feedback (project_id, created_at);

-- ───────────── Funções auxiliares ─────────────

-- Administrador = utilizador com app_metadata.role = 'admin' (definido pelo script, nunca pelo cliente).
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- O projeto pertence ao cliente com sessão iniciada?
create or replace function public.owns_project(pid uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = pid and c.user_id = auth.uid()
  )
$$;

-- Depois de o cliente definir a sua senha no primeiro acesso.
create or replace function public.mark_password_changed()
returns void
language sql security definer
set search_path = ''
as $$
  update public.clients set must_change_password = false where user_id = auth.uid()
$$;

-- Usado pelo cron diário para o projeto gratuito não ser pausado por inatividade.
create or replace function public.keepalive()
returns timestamptz
language sql stable
set search_path = ''
as $$
  select now()
$$;

revoke all on function public.owns_project(uuid) from public;
revoke all on function public.mark_password_changed() from public;
grant execute on function public.owns_project(uuid) to authenticated;
grant execute on function public.mark_password_changed() to authenticated;
grant execute on function public.keepalive() to anon, authenticated;

-- ───────────── Row Level Security ─────────────

alter table public.clients    enable row level security;
alter table public.projects   enable row level security;
alter table public.demo_links enable row level security;
alter table public.meetings   enable row level security;
alter table public.feedback   enable row level security;

-- clients: cada cliente vê apenas a sua linha
create policy "cliente lê os seus dados" on public.clients
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin gere clientes" on public.clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects
create policy "cliente lê os seus projetos" on public.projects
  for select to authenticated using (public.owns_project(id) or public.is_admin());
create policy "admin gere projetos" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- demo_links
create policy "cliente lê as suas demos" on public.demo_links
  for select to authenticated using (public.owns_project(project_id) or public.is_admin());
create policy "admin gere demos" on public.demo_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- meetings
create policy "cliente lê as suas reuniões" on public.meetings
  for select to authenticated using (public.owns_project(project_id) or public.is_admin());
create policy "admin gere reuniões" on public.meetings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- feedback: o cliente lê e escreve só no seu projeto, sempre como 'client'
create policy "cliente lê o feedback do seu projeto" on public.feedback
  for select to authenticated using (public.owns_project(project_id) or public.is_admin());
create policy "cliente envia feedback" on public.feedback
  for insert to authenticated
  with check (
    public.owns_project(project_id)
    and author_id = auth.uid()
    and author_role = 'client'
  );
create policy "admin gere feedback" on public.feedback
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
