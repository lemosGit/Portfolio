-- Endurecer funções SECURITY DEFINER (avisos do Security Advisor do Supabase).
-- 1) owns_project só é usada pelas regras RLS → passa para o schema `private`,
--    que não está exposto pela API REST.
-- 2) mark_password_changed continua chamável por utilizadores com sessão,
--    mas deixa de o ser pelo papel `anon`.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.owns_project(pid uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = pid and c.user_id = (select auth.uid())
  )
$$;
revoke all on function private.owns_project(uuid) from public, anon;
grant execute on function private.owns_project(uuid) to authenticated;

-- Recriar as políticas a apontar para private.owns_project.
drop policy "cliente lê os seus projetos" on public.projects;
create policy "cliente lê os seus projetos" on public.projects
  for select to authenticated using (private.owns_project(id) or public.is_admin());

drop policy "cliente lê as suas demos" on public.demo_links;
create policy "cliente lê as suas demos" on public.demo_links
  for select to authenticated using (private.owns_project(project_id) or public.is_admin());

drop policy "cliente lê as suas reuniões" on public.meetings;
create policy "cliente lê as suas reuniões" on public.meetings
  for select to authenticated using (private.owns_project(project_id) or public.is_admin());

drop policy "cliente lê o feedback do seu projeto" on public.feedback;
create policy "cliente lê o feedback do seu projeto" on public.feedback
  for select to authenticated using (private.owns_project(project_id) or public.is_admin());

drop policy "cliente envia feedback" on public.feedback;
create policy "cliente envia feedback" on public.feedback
  for insert to authenticated
  with check (
    private.owns_project(project_id)
    and author_id = (select auth.uid())
    and author_role = 'client'
  );

drop function public.owns_project(uuid);

revoke execute on function public.mark_password_changed() from anon;
