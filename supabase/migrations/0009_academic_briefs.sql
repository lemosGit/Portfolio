-- ============================================================================
-- 0009 — Ficha do trabalho académico (M6-01, #54)
-- Modelo: docs/02-modelagem/mer/fichas-servico.md §3.1 · Segurança: seguranca.md §2 (S para o cliente; S I U admin)
-- Só a ficha: academic_sections, adjustment_requests e design_specs entram com as suas tarefas (D-149).
-- O prazo de entrega fica em projects.due_on (D-044) e não se repete aqui.
-- ============================================================================

create table public.academic_briefs (
  project_id       uuid primary key references public.projects (id) on delete cascade,
  topic            text not null check (char_length(btrim(topic)) between 1 and 300),
  work_type        text not null check (work_type in ('escolar', 'universitario', 'relatorio', 'formatacao', 'revisao')),
  education_level  text not null check (education_level in ('ensino_medio', 'licenciatura', 'mestrado', 'outro')),
  institution      text check (char_length(institution) <= 200),
  discipline       text check (char_length(discipline) <= 200),
  citation_style   text check (citation_style in ('APA', 'ABNT', 'NP 405', 'instituicao', 'outra')),
  citation_notes   text check (char_length(citation_notes) <= 1000),
  pages_target     smallint check (pages_target > 0 and pages_target <= 2000),
  uses_chapters    boolean not null default true,
  adjust_days      smallint not null default 7 check (adjust_days between 0 and 60),   -- RN-33, D-016
  delivered_at     timestamptz,                                                        -- começa o prazo de ajustes (RF-10.64)
  updated_at       timestamptz not null default now()
);

comment on table public.academic_briefs is 'Ficha do trabalho académico (RF-10.10): 1:1 com projects academic.';

-- F1: só em projetos Académico (RN-02).
create or replace function private.academic_briefs_check()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select service_type from public.projects where id = new.project_id) is distinct from 'academic' then
    raise exception 'A ficha do trabalho só existe em projetos Académico.' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger academic_briefs_check before insert or update on public.academic_briefs
  for each row execute function private.academic_briefs_check();

-- F6: alterações à ficha entram no activity_log (D-051). A ficha não tem `id`: a auditoria
-- passa a usar o `project_id` como entity_id quando a linha não tem `id`.
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
                             else tg_table_name end,
          coalesce((rec ->> 'id')::uuid, (rec ->> 'project_id')::uuid), act,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return null;
end $$;
create trigger audit_academic_briefs after insert or update or delete on public.academic_briefs
  for each row execute function private.audit();

-- RLS (seguranca.md §2): o cliente lê a ficha do seu projeto; o admin lê, cria e altera (sem apagar: só cascade).
alter table public.academic_briefs enable row level security;
create policy "cliente lê a ficha do seu projeto" on public.academic_briefs
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin cria a ficha" on public.academic_briefs
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera a ficha" on public.academic_briefs
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
