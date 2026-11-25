-- ============================================================================
-- 0012 — Entrega final e pedidos de ajuste do Académico (M6-06, #59)
-- Modelo: fichas-servico §3.3 (D-056) · RF-10.60…74 · RN-14, RN-31…34 · Q-098, D-154
-- ============================================================================

-- ───────────── 1. Fim do prazo de ajustes ─────────────
-- Até ao fim do último dia em Luanda (Q-098): entregue a 1/12 às 15h com 7 dias → até 8/12 às 23:59:59.
-- Devolve o instante em que o prazo ACABA (exclusivo); null se ainda não houve entrega.
create or replace function public.adjust_until(p_project uuid)
returns timestamptz language sql stable set search_path = '' as $$
  select (((b.delivered_at at time zone 'Africa/Luanda')::date + b.adjust_days + 1)::timestamp) at time zone 'Africa/Luanda'
  from public.academic_briefs b
  where b.project_id = p_project and b.delivered_at is not null
$$;
revoke all on function public.adjust_until(uuid) from public, anon;
grant execute on function public.adjust_until(uuid) to authenticated, service_role;

-- ───────────── 2. Pedidos de ajuste ─────────────
create table public.adjustment_requests (
  id                          uuid primary key default gen_random_uuid(),
  project_id                  uuid not null references public.projects (id) on delete cascade,
  description                 text not null check (char_length(btrim(description)) between 10 and 2000),
  attachment_deliverable_id   uuid references public.deliverables (id) on delete set null,
  status                      text not null default 'aberto' check (status in ('aberto', 'resolvido', 'recusado')),
  resolved_by_deliverable_id  uuid references public.deliverables (id) on delete set null,
  admin_note                  text check (char_length(admin_note) <= 1000),
  created_by                  uuid default auth.uid() references auth.users (id) on delete set null,
  created_at                  timestamptz not null default now(),
  resolved_at                 timestamptz,
  -- F4 (RN-32, RF-10.73)
  check (status <> 'recusado' or char_length(btrim(coalesce(admin_note, ''))) > 0),
  check (status <> 'resolvido' or resolved_by_deliverable_id is not null)
);
create index adjustment_requests_project_idx on public.adjustment_requests (project_id, created_at desc);
create index adjustment_requests_open_idx on public.adjustment_requests (project_id) where status = 'aberto';

-- F1 + F3: só no Académico, e o cliente só pede dentro do prazo (RN-33). O admin pode registar fora do prazo.
create or replace function private.adjustment_requests_before()
returns trigger language plpgsql set search_path = '' as $$
declare until timestamptz;
begin
  if tg_op = 'INSERT' then
    -- quem não é admin só pede no seu projeto (a mensagem não revela nada sobre projetos alheios)
    if not public.is_admin() and not private.owns_project(new.project_id) then
      raise exception 'Sem permissão.' using errcode = 'insufficient_privilege';
    end if;
    if (select service_type from public.projects where id = new.project_id) is distinct from 'academic' then
      raise exception 'Os pedidos de ajuste só existem em projetos Académico.' using errcode = 'check_violation';
    end if;
    if not public.is_admin() then
      until := public.adjust_until(new.project_id);
      if until is null then
        raise exception 'A entrega final ainda não foi feita.' using errcode = 'check_violation';
      end if;
      if now() >= until then
        raise exception 'O prazo de ajustes terminou. Fale connosco pelas mensagens.' using errcode = 'check_violation';
      end if;
      if new.status <> 'aberto' or new.resolved_by_deliverable_id is not null or new.admin_note is not null then
        raise exception 'Pedido inválido.' using errcode = 'check_violation';
      end if;
      new.created_by := auth.uid();
    end if;
    return new;
  end if;
  -- UPDATE: só se fecha um pedido aberto
  if old.status <> 'aberto' and new.status is distinct from old.status then
    raise exception 'Este pedido já foi fechado.' using errcode = 'check_violation';
  end if;
  if new.status <> old.status and new.status in ('resolvido', 'recusado') then new.resolved_at := now(); end if;
  return new;
end $$;
create trigger adjustment_requests_before before insert or update on public.adjustment_requests
  for each row execute function private.adjustment_requests_before();

create trigger audit_adjustment_requests after insert or update or delete on public.adjustment_requests
  for each row execute function private.audit();

alter table public.adjustment_requests enable row level security;
create policy "cliente lê os pedidos do seu projeto" on public.adjustment_requests
  for select to authenticated using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "cliente pede ajustes no seu projeto" on public.adjustment_requests
  for insert to authenticated with check ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin fecha pedidos" on public.adjustment_requests
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ───────────── 3. Disponibilizar a entrega final (RF-10.64, Q-098) ─────────────
-- security invoker: a RLS garante o admin. Exige um entregável na fase "entrega-final", não bloqueado
-- (restante pago, RN-14). Grava delivered_at, conclui a fase 6 e põe a fase Ajustes em curso.
create or replace function public.admin_deliver_final(p_project uuid)
returns timestamptz language plpgsql set search_path = '' as $$
declare
  ph_final uuid;
  ph_adj uuid;
  st text;
  at timestamptz := now();
begin
  if not public.is_admin() then raise exception 'Sem permissão.' using errcode = 'insufficient_privilege'; end if;
  select id, status into ph_final, st from public.project_phases where project_id = p_project and key = 'entrega-final';
  if ph_final is null then raise exception 'Este projeto não tem a fase Entrega final.' using errcode = 'check_violation'; end if;
  if not exists (select 1 from public.academic_briefs where project_id = p_project) then
    raise exception 'Preencha primeiro a ficha do trabalho (dias de ajustes).' using errcode = 'check_violation';
  end if;
  if (select delivered_at from public.academic_briefs where project_id = p_project) is not null then
    raise exception 'A entrega final já foi disponibilizada.' using errcode = 'check_violation';
  end if;
  if not exists (
    select 1 from public.deliverables d
    left join public.payments pay on pay.id = d.locked_by_payment_id
    where d.project_id = p_project and d.project_phase_id = ph_final and d.role = 'entregavel' and d.purged_at is null
      and (d.locked_by_payment_id is null or pay.status = 'pago')) then
    raise exception 'Falta o ficheiro final na fase Entrega final, ou o restante ainda não está pago (RN-14).' using errcode = 'check_violation';
  end if;

  update public.academic_briefs set delivered_at = at where project_id = p_project;
  if st = 'por_iniciar' then update public.project_phases set status = 'em_curso' where id = ph_final; st := 'em_curso'; end if;
  if st in ('em_curso', 'aguarda_cliente', 'atrasada') then update public.project_phases set status = 'concluida' where id = ph_final; end if;
  select id into ph_adj from public.project_phases where project_id = p_project and key = 'ajustes' and status = 'por_iniciar';
  if ph_adj is not null then update public.project_phases set status = 'em_curso' where id = ph_adj; end if;
  return at;
end $$;
revoke all on function public.admin_deliver_final(uuid) from public, anon;
grant execute on function public.admin_deliver_final(uuid) to authenticated;
