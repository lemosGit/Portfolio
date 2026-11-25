-- ============================================================================
-- 0010 — Índice e capítulos do trabalho académico (M6-03, #56)
-- Modelo: docs/02-modelagem/mer/fichas-servico.md §3.2 (D-058) · Segurança: seguranca.md §2
-- O cliente vê só o título e o estado (D-015, RF-10.42); o progresso "X de Y" calcula-se na leitura (RF-10.41).
-- ============================================================================

create table public.academic_sections (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  position    smallint not null check (position between 1 and 200),
  title       text not null check (char_length(btrim(title)) between 1 and 200),
  status      text not null default 'por_iniciar' check (status in ('por_iniciar', 'em_curso', 'concluido')),   -- RF-10.40
  updated_at  timestamptz not null default now(),
  -- deferrable: reordenar troca posições dentro de uma transação sem violar a unicidade a meio
  constraint academic_sections_position_key unique (project_id, position) deferrable initially immediate
);
create index academic_sections_project_idx on public.academic_sections (project_id, position);

-- F1: só em projetos Académico (RN-02) + updated_at.
create or replace function private.academic_sections_check()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select service_type from public.projects where id = new.project_id) is distinct from 'academic' then
    raise exception 'Os capítulos só existem em projetos Académico.' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger academic_sections_check before insert or update on public.academic_sections
  for each row execute function private.academic_sections_check();

-- F6: auditoria (D-051).
create trigger audit_academic_sections after insert or update or delete on public.academic_sections
  for each row execute function private.audit();

-- Mover um capítulo uma posição para cima (-1) ou para baixo (+1), trocando com o vizinho.
-- security invoker: a RLS garante que só o admin altera.
create or replace function public.admin_move_section(p_section uuid, p_dir int)
returns void language plpgsql set search_path = '' as $$
declare
  s public.academic_sections;
  other public.academic_sections;
begin
  if p_dir not in (-1, 1) then raise exception 'Direção inválida.' using errcode = 'check_violation'; end if;
  select * into s from public.academic_sections where id = p_section for update;
  if s.id is null then raise exception 'Capítulo não encontrado ou sem permissão.' using errcode = 'insufficient_privilege'; end if;
  select * into other from public.academic_sections
  where project_id = s.project_id and position = (case when p_dir < 0 then
          (select max(position) from public.academic_sections where project_id = s.project_id and position < s.position)
        else
          (select min(position) from public.academic_sections where project_id = s.project_id and position > s.position)
        end)
  for update;
  if other.id is null then return; end if;   -- já está no topo ou no fim
  set constraints public.academic_sections_position_key deferred;
  update public.academic_sections set position = other.position where id = s.id;
  update public.academic_sections set position = s.position where id = other.id;
end $$;
revoke all on function public.admin_move_section(uuid, int) from public, anon;
grant execute on function public.admin_move_section(uuid, int) to authenticated;

-- RLS: o cliente lê os capítulos do seu projeto; o admin gere tudo (seguranca.md §2).
alter table public.academic_sections enable row level security;
create policy "cliente lê os capítulos do seu projeto" on public.academic_sections
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin cria capítulos" on public.academic_sections
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera capítulos" on public.academic_sections
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin apaga capítulos" on public.academic_sections
  for delete to authenticated using ((select public.is_admin()));
