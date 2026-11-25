-- ============================================================================
-- 0017 — Orçamento do Design: design + impressão em separado (M7-06, #69)
-- RF-20.20, RF-20.21, RF-20.23 · RN-11, RN-12, RN-44 · Q-105, D-165
-- As colunas design_kz / print_kz e o check design + impressão = total já existem (0007); o sinal já
-- trava a fase 3, Conceito (D-052), e sem aceite a fase 3 não começa (0011). Falta garantir que um
-- orçamento do Design não chega ao cliente sem o detalhe:
-- 1. ao enviar (rascunho → enviado), um projeto Design tem de ter design_kz e print_kz;
-- 2. se a ficha técnica diz "sem impressão" (RN-44), a impressão é 0.
-- Os rascunhos podem ficar incompletos; os orçamentos já enviados ou aceites não são revistos.
-- ============================================================================

create or replace function private.quotes_design_split()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status <> 'enviado' or old.status <> 'rascunho' then return new; end if;
  if (select service_type from public.projects where id = new.project_id) <> 'design' then return new; end if;
  if new.design_kz is null or new.print_kz is null then
    raise exception 'No Design, indique o valor do design e o da impressão em separado.' using errcode = 'check_violation';
  end if;
  if new.print_kz > 0
     and exists (select 1 from public.design_specs where project_id = new.project_id and not has_print) then
    raise exception 'A ficha técnica diz que a peça não tem impressão: a impressão tem de ser 0.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger quotes_design_split before update of status on public.quotes
  for each row execute function private.quotes_design_split();
