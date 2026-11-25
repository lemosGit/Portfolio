-- ============================================================================
-- 0011 — O trabalho só começa com o orçamento aceite (M6-04, #57)
-- RN-11 / D-013 / RF-10.23: no Académico e no Design, as fases de trabalho (posição ≥ 3) só passam
-- de "por iniciar" a "em curso" com um orçamento aceite. O sinal por pagar já trava a fase (D-052);
-- isto fecha o caso em que ainda não há sinal porque ainda não há aceite (Q-097, D-152).
-- Reabrir uma fase concluída não é travado (já começou antes).
-- ============================================================================

create or replace function private.project_phases_quote_gate()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'em_curso' and old.status = 'por_iniciar' and new.position >= 3
     and (select service_type from public.projects where id = new.project_id) in ('academic', 'design')
     and not exists (select 1 from public.quotes where project_id = new.project_id and status = 'aceite') then
    raise exception 'Falta o aceite do orçamento para iniciar esta fase.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger project_phases_quote_gate before update of status on public.project_phases
  for each row execute function private.project_phases_quote_gate();
