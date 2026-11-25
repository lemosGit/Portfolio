-- ============================================================================
-- 0013 — Prazo ajustado: só dias inteiros, depois do aceite (M6-99, Q-101, D-158)
-- RN-21: o tempo "a aguardar o cliente" faz deslizar o prazo. Corrige dois defeitos do teste
-- em produção da v0.2:
--   1. contava a espera do aceite do orçamento, quando o prazo ainda não existia (nasce do aceite);
--   2. arredondava para cima (5 minutos de espera = +1 dia).
-- Agora: só conta o tempo depois do último orçamento aceite (sem orçamento aceite — Tech ou prazo
-- marcado à mão — conta desde o início) e só desliza por cada 24 h completas (floor).
-- ============================================================================

create or replace function public.project_adjusted_due(p_project uuid)
returns date language sql stable set search_path = '' as $$
  with since as (
    -- o prazo nasce do aceite: o que esperou antes não conta
    select coalesce(max(q.accepted_at), '-infinity'::timestamptz) as t
    from public.quotes q
    where q.project_id = p_project and q.accepted_at is not null
  ), phase_spans as (
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
  ), clipped as (
    select s.r * tstzrange((select t from since), null) as r from spans s
  ), merged as (
    select unnest(range_agg(r)) as r from clipped where not isempty(r)
  )
  select p.due_on + coalesce(floor(sum(extract(epoch from upper(m.r) - lower(m.r))) / 86400)::int, 0)
  from public.projects p
  left join merged m on true
  where p.id = p_project
  group by p.due_on
$$;
revoke all on function public.project_adjusted_due(uuid) from public, anon;
grant execute on function public.project_adjusted_due(uuid) to authenticated;
