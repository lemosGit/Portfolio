-- ============================================================================
-- 0015 — Aprovação final da arte para produção (M7-04, #67)
-- RF-20.50…54 · RN-41, RN-42, RN-43 · D-021, D-022, D-071 · D-163
-- A aprovação de uma prova do Design já conclui Revisões e Aprovação da arte (0007) e a reabertura
-- já é recusada com a produção começada (RN-43, 0007). Esta migração acrescenta:
--   1. RN-42: o pedido de aprovação de uma prova copia para o snapshot os textos-chave, a quantidade,
--      as medidas e a data do evento da ficha técnica (o que o cliente confirmou fica fixo).
--   2. RN-41: com a arte de uma peça aprovada, não há novas provas (nem rondas) dessa peça;
--      só o admin a reabre (antes da produção, RN-43).
--   3. Depois da aprovação, a fase seguinte (Produção, ou Entrega sem impressão) começa sozinha
--      se nenhum pagamento por fazer a travar (RN-15: o restante trava a Produção).
-- ============================================================================

-- 1 + 2: antes de criar uma aprovação de prova.
create or replace function private.approvals_art_before()
returns trigger language plpgsql set search_path = '' as $$
declare
  d public.deliverables;
  s public.design_specs;
begin
  if new.subject <> 'prova' or new.deliverable_id is null then return new; end if;
  select * into d from public.deliverables where id = new.deliverable_id;
  -- RN-41: a arte desta peça (mesma série) já foi aprovada → não há mais provas para aprovar.
  if exists (
    select 1 from public.approvals a join public.deliverables x on x.id = a.deliverable_id
    where a.project_id = new.project_id and a.subject = 'prova' and a.status = 'aprovada' and x.series_key = d.series_key) then
    raise exception 'A arte desta peça já foi aprovada para produção. Reabra a aprovação para mudar alguma coisa.'
      using errcode = 'check_violation';
  end if;
  -- RN-42: textos-chave da ficha técnica no snapshot (só no Design, quando a ficha existe).
  select * into s from public.design_specs where project_id = new.project_id;
  if s.project_id is not null then
    new.snapshot := coalesce(new.snapshot, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
      'piece_type', s.piece_type,
      'key_texts', s.key_texts,
      'quantity', s.quantity,
      'width_cm', s.width_cm,
      'height_cm', s.height_cm,
      'event_date', s.event_date,
      'has_print', s.has_print));
  end if;
  return new;
end $$;
create trigger approvals_art_before before insert on public.approvals
  for each row execute function private.approvals_art_before();

-- 3: depois de aprovada, a fase seguinte à Aprovação da arte começa, se não estiver travada por um pagamento.
create or replace function private.approvals_art_after()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  nxt uuid;
  st text;
begin
  if new.subject <> 'prova' or new.status <> 'aprovada' or old.status = 'aprovada' then return null; end if;
  if (select service_type from public.projects where id = new.project_id) <> 'design' then return null; end if;
  nxt := private.phase_from(new.project_id, 6::smallint);                 -- Produção, ou Entrega sem impressão
  select status into st from public.project_phases where id = nxt;
  if st = 'por_iniciar' and not exists (
    select 1 from public.payments where gates_phase_id = nxt and status = 'pendente') then
    update public.project_phases set status = 'em_curso' where id = nxt;
  end if;
  return null;
end $$;
create trigger approvals_art_after after update of status on public.approvals
  for each row execute function private.approvals_art_after();
