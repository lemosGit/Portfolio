-- ============================================================================
-- 0018 — Correções do teste em produção da v0.3 (M7-99, #73) · D-169
-- 1. RN-41: com a arte de uma peça aprovada, também não se carregam novas versões de prova dessa peça
--    (a 0015 só recusava o pedido de aprovação). Sem isto, a nova versão passava a "atual" no portal do
--    cliente e a versão aprovada ia para "Outras versões". Reabrir a aprovação (antes da produção,
--    RN-43) volta a permitir.
-- 2. D-052: a mensagem do pagamento que trava uma fase mostra o valor como no portal
--    ("50 000 Kz", não "50000.00 Kz").
-- ============================================================================

-- "50 000" / "1 250,50" (espaço nos milhares; vírgula e cêntimos só quando existem), como kz() em lib/payments/model.ts.
create or replace function private.kz_text(v numeric)
returns text language sql immutable set search_path = '' as $$
  select replace(trim(to_char(trunc(abs(v)), '999G999G999G999')), ',', ' ')
      || case when abs(v) = trunc(abs(v)) then '' else ',' || lpad(((abs(v) - trunc(abs(v))) * 100)::int::text, 2, '0') end
$$;

create or replace function private.project_phases_payment_gate()
returns trigger language plpgsql set search_path = '' as $$
declare p record;
begin
  if new.status = 'em_curso' and old.status is distinct from 'em_curso' then
    select description, amount_kz into p from public.payments
    where gates_phase_id = new.id and status = 'pendente' limit 1;
    if found then
      raise exception 'Falta o pagamento "%" (% Kz) para iniciar esta fase.', p.description, private.kz_text(p.amount_kz)
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

-- RN-41 no carregamento: nova versão de prova numa série com a arte aprovada.
create or replace function private.deliverables_art_lock()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role = 'prova' and exists (
    select 1 from public.approvals a join public.deliverables d on d.id = a.deliverable_id
    where a.project_id = new.project_id and a.subject = 'prova' and a.status = 'aprovada' and d.series_key = new.series_key) then
    raise exception 'A arte desta peça já foi aprovada para produção. Reabra a aprovação para carregar uma nova versão.'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger deliverables_art_lock before insert on public.deliverables
  for each row execute function private.deliverables_art_lock();
