-- ============================================================================
-- 0016 — Estado da produção e entrega/levantamento do Design (M7-05, #68)
-- RF-20.60…62, RF-20.70…74 · RN-15, RN-44 · Q-104, D-164
-- 1. O estado da produção mexe nas fases (Q-104): "a_imprimir" põe a Produção em curso (o gatilho do
--    pagamento recusa sem o restante pago, RN-15); "pronto" conclui a Produção e põe a Entrega em curso.
-- 2. public.admin_design_delivered: marca a peça entregue (RF-20.73): conclui a Entrega e o projeto.
-- ============================================================================

create or replace function private.design_specs_production()
returns trigger language plpgsql set search_path = '' as $$
declare
  prod text;
  ent text;
begin
  if new.production_status is not distinct from old.production_status or new.production_status is null then return null; end if;
  select status into prod from public.project_phases where project_id = new.project_id and key = 'producao';
  if prod is null or prod = 'nao_aplicavel' then return null; end if;
  if prod = 'por_iniciar' then
    update public.project_phases set status = 'em_curso' where project_id = new.project_id and key = 'producao';  -- RN-15 no gatilho do pagamento
    prod := 'em_curso';
  end if;
  if new.production_status = 'pronto' then
    if prod in ('em_curso', 'aguarda_cliente', 'atrasada') then
      update public.project_phases set status = 'concluida' where project_id = new.project_id and key = 'producao';
    end if;
    select status into ent from public.project_phases where project_id = new.project_id and key = 'entrega-levantamento';
    if ent = 'por_iniciar' then
      update public.project_phases set status = 'em_curso' where project_id = new.project_id and key = 'entrega-levantamento';
    end if;
  end if;
  return null;
end $$;
create trigger design_specs_production after update of production_status on public.design_specs
  for each row execute function private.design_specs_production();

-- Entregue (RF-20.73). security invoker: a RLS e o is_admin garantem o admin.
create or replace function public.admin_design_delivered(p_project uuid)
returns timestamptz language plpgsql set search_path = '' as $$
declare
  s public.design_specs;
  prod text;
  ent text;
  at timestamptz := now();
begin
  if not public.is_admin() then raise exception 'Sem permissão.' using errcode = 'insufficient_privilege'; end if;
  select * into s from public.design_specs where project_id = p_project;
  if s.project_id is null then raise exception 'Preencha primeiro a ficha técnica da peça.' using errcode = 'check_violation'; end if;
  if s.delivered_at is not null then raise exception 'A peça já foi marcada como entregue.' using errcode = 'check_violation'; end if;
  select status into prod from public.project_phases where project_id = p_project and key = 'producao';
  if prod is not null and prod not in ('concluida', 'nao_aplicavel') then
    raise exception 'A produção ainda não terminou: marque-a como pronta primeiro.' using errcode = 'check_violation';
  end if;
  select status into ent from public.project_phases where project_id = p_project and key = 'entrega-levantamento';
  if ent = 'por_iniciar' then
    update public.project_phases set status = 'em_curso' where project_id = p_project and key = 'entrega-levantamento';
    ent := 'em_curso';
  end if;
  if ent in ('em_curso', 'aguarda_cliente', 'atrasada') then
    update public.project_phases set status = 'concluida' where project_id = p_project and key = 'entrega-levantamento';
  end if;
  update public.design_specs set delivered_at = at where project_id = p_project;
  if (select status from public.projects where id = p_project) = 'ativo' then
    perform public.admin_set_project_status(p_project, 'entregue');
  end if;
  return at;
end $$;
revoke all on function public.admin_design_delivered(uuid) from public, anon;
grant execute on function public.admin_design_delivered(uuid) to authenticated;
