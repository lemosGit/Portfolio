-- ============================================================================
-- 0008 — Retenção dos ficheiros: adiar a limpeza dos 90 dias (#122, M5-09b)
-- RN-08 / D-025: ficheiros de um projeto concluído apagam-se 90 dias depois; o admin é avisado
-- 7 dias antes e pode adiar (Q-091: "Adiar 30 dias", repetível). Só acrescenta: nada existente muda.
-- A limpeza corre em /api/cron/limpeza (D-085) com a chave secreta.
-- ============================================================================

alter table public.projects
  add column files_keep_until date;

comment on column public.projects.files_keep_until is
  'Adiamento da limpeza dos ficheiros (RN-08): a purga só acontece depois desta data. Null = sem adiamento.';

-- Data em que os ficheiros de um projeto ficam elegíveis para a limpeza (null = nunca, ainda).
-- Entregue: completed_at + 90 dias; cancelado: cancelled_at + 90 dias (D-146); o adiamento ganha se for maior.
-- Em hora de Luanda, como as outras datas do portal.
create or replace function public.files_purge_on(p public.projects)
returns date language sql stable set search_path = '' as $$
  select case
    when p.status = 'entregue' and p.completed_at is not null
      then greatest(((p.completed_at at time zone 'Africa/Luanda')::date + 90), coalesce(p.files_keep_until, '-infinity'::date))
    when p.status = 'cancelado' and p.cancelled_at is not null
      then greatest(((p.cancelled_at at time zone 'Africa/Luanda')::date + 90), coalesce(p.files_keep_until, '-infinity'::date))
  end
$$;
revoke all on function public.files_purge_on(public.projects) from public, anon;
grant execute on function public.files_purge_on(public.projects) to authenticated, service_role;
