-- ============================================================================
-- 0007 — Orçamentos, pagamentos, aprovações, ficheiros, auditoria e links (M5-03, #41)
-- Modelo: docs/02-modelagem/mer/blocos-comuns.md · Estados: estados/estados.md §3–§6
-- Segurança: docs/03-arquitetura/seguranca.md · Ficheiros: ADR-003 · Link: ADR-002
-- As fichas, os capítulos e os pedidos de ajuste (request_adjustment) entram na 0008.
-- ============================================================================

-- ───────────── 1. Tabelas ─────────────

create table public.quotes (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  version          smallint not null check (version > 0),
  total_kz         numeric(12,2) not null check (total_kz > 0),
  design_kz        numeric(12,2) check (design_kz >= 0),
  print_kz         numeric(12,2) check (print_kz >= 0),
  deposit_pct      smallint not null default 50 check (deposit_pct between 1 and 100),
  deposit_kz       numeric(12,2) check (deposit_kz > 0),
  delivery_due_on  date,
  rounds_included  smallint check (rounds_included >= 0),
  status           text not null default 'rascunho' check (status in ('rascunho', 'enviado', 'aceite', 'substituido')),
  sent_at          timestamptz,
  accepted_at      timestamptz,
  created_by       uuid default auth.uid() references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  unique (project_id, version),
  check (design_kz is null or print_kz is null or design_kz + print_kz = total_kz),
  check (deposit_kz is null or deposit_kz <= total_kz)
);
create unique index quotes_one_active on public.quotes (project_id) where status in ('enviado', 'aceite');

create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  quote_id        uuid references public.quotes (id) on delete set null,
  kind            text not null check (kind in ('sinal', 'restante', 'extra')),
  description     text not null check (char_length(description) between 1 and 200),
  amount_kz       numeric(12,2) not null check (amount_kz > 0),
  due_on          date,
  status          text not null default 'pendente' check (status in ('por_aceitar', 'pendente', 'pago', 'anulado')),
  paid_on         date,
  extra_rounds    smallint not null default 0 check (extra_rounds >= 0),   -- RN-36: rondas que este extra acrescenta
  gates_phase_id  uuid references public.project_phases (id) on delete set null,
  created_by      uuid default auth.uid() references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check ((status = 'pago') = (paid_on is not null)),
  check (kind = 'extra' or extra_rounds = 0)
);
create index payments_project_idx on public.payments (project_id);
create index payments_gate_idx on public.payments (gates_phase_id) where gates_phase_id is not null;

create table public.deliverables (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references public.projects (id) on delete cascade,
  project_phase_id      uuid references public.project_phases (id) on delete set null,
  role                  text not null check (role in ('entregavel', 'prova', 'referencia', 'interno')),
  series_key            text not null check (char_length(series_key) between 1 and 40),
  version_no            smallint not null check (version_no > 0),
  label                 text not null check (char_length(label) between 1 and 10),
  title                 text check (char_length(title) <= 120),
  notes                 text check (char_length(notes) <= 1000),
  uploaded_by_role      text not null check (uploaded_by_role in ('client', 'admin')),
  locked_by_payment_id  uuid references public.payments (id) on delete set null,
  created_by            uuid default auth.uid() references auth.users (id) on delete set null,
  created_at            timestamptz not null default now(),
  purged_at             timestamptz,
  unique (project_id, series_key, version_no),
  check (uploaded_by_role = 'admin' or role = 'referencia')                        -- RN-09
);
create index deliverables_project_idx on public.deliverables (project_id, series_key, version_no desc);

create table public.files (
  id              uuid primary key default gen_random_uuid(),
  deliverable_id  uuid not null references public.deliverables (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,
  bucket          text not null check (bucket in ('client-uploads', 'project-files')),
  storage_path    text not null check (char_length(storage_path) <= 300),
  original_name   text not null check (char_length(original_name) between 1 and 200),
  mime_type       text not null check (char_length(mime_type) <= 100),
  size_bytes      bigint not null check (size_bytes > 0),
  thumb_path      text check (char_length(thumb_path) <= 300),
  width           integer check (width > 0),
  height          integer check (height > 0),
  created_at      timestamptz not null default now(),
  purged_at       timestamptz,
  unique (bucket, storage_path),
  check (size_bytes <= case bucket when 'client-uploads' then 10485760 else 52428800 end)   -- D-024, RNF-503
);
create index files_deliverable_idx on public.files (deliverable_id);

create table public.approvals (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  project_phase_id  uuid references public.project_phases (id) on delete set null,
  subject           text not null check (subject in ('orcamento', 'indice', 'prova', 'extra', 'entrega')),
  quote_id          uuid references public.quotes (id) on delete cascade,
  deliverable_id    uuid references public.deliverables (id) on delete cascade,
  payment_id        uuid references public.payments (id) on delete cascade,
  version_label     text check (char_length(version_label) <= 10),
  snapshot          jsonb not null,
  status            text not null default 'pendente' check (status in ('pendente', 'aprovada', 'alteracoes_pedidas', 'cancelada')),
  requested_by      uuid default auth.uid() references auth.users (id) on delete set null,
  requested_at      timestamptz not null default now(),
  decided_at        timestamptz,
  check (case subject
    when 'orcamento' then quote_id is not null and deliverable_id is null and payment_id is null
    when 'prova'     then deliverable_id is not null and quote_id is null and payment_id is null
    when 'entrega'   then deliverable_id is not null and quote_id is null and payment_id is null
    when 'extra'     then payment_id is not null and quote_id is null and deliverable_id is null
    when 'indice'    then quote_id is null and deliverable_id is null and payment_id is null
  end)
);
create unique index approvals_one_pending_quote on public.approvals (quote_id) where status = 'pendente' and quote_id is not null;
create unique index approvals_one_pending_deliverable on public.approvals (deliverable_id) where status = 'pendente' and deliverable_id is not null;
create unique index approvals_one_pending_payment on public.approvals (payment_id) where status = 'pendente' and payment_id is not null;
create unique index approvals_one_pending_index on public.approvals (project_id) where status = 'pendente' and subject = 'indice';
create index approvals_project_idx on public.approvals (project_id, requested_at desc);

create table public.approval_responses (
  id                         uuid primary key default gen_random_uuid(),
  approval_id                uuid not null references public.approvals (id) on delete cascade,
  kind                       text not null check (kind in ('aprovar', 'pedir_alteracoes', 'reabrir')),
  comment                    text check (char_length(comment) <= 2000),
  attachment_deliverable_id  uuid references public.deliverables (id) on delete set null,
  actor_id                   uuid not null default auth.uid() references auth.users (id),
  actor_role                 text not null check (actor_role in ('client', 'admin')),
  created_at                 timestamptz not null default now(),
  check (kind = 'aprovar' or char_length(btrim(coalesce(comment, ''))) > 0),          -- RN-05, RN-06
  check (kind <> 'reabrir' or actor_role = 'admin')
);
create index approval_responses_approval_idx on public.approval_responses (approval_id, created_at);

create table public.activity_log (
  id          bigint generated always as identity primary key,
  project_id  uuid references public.projects (id) on delete set null,
  entity      text not null,
  entity_id   uuid not null,
  action      text not null check (action in ('insert', 'update', 'delete', 'purge')),
  before      jsonb,
  after       jsonb,
  actor_id    uuid default auth.uid() references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index activity_log_project_idx on public.activity_log (project_id, created_at desc);

create table public.access_links (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  project_id    uuid not null references public.projects (id) on delete cascade,
  token_digest  text not null unique check (token_digest ~ '^[0-9a-f]{64}$'),
  channel       text not null check (channel in ('copiar', 'whatsapp', 'email')),
  status        text not null default 'ativo' check (status in ('ativo', 'usado', 'substituido')),
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_by    uuid default auth.uid() references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index access_links_client_idx on public.access_links (client_id, created_at desc);

-- ───────────── 2. Funções auxiliares ─────────────

-- Primeira fase do projeto a partir de uma posição, ignorando as "não aplicável".
create or replace function private.phase_from(p_project uuid, p_min_position smallint)
returns uuid language sql stable set search_path = '' as $$
  select id from public.project_phases
  where project_id = p_project and position >= p_min_position and status <> 'nao_aplicavel'
  order by position limit 1
$$;

create or replace function private.phase_by_key(p_project uuid, p_key text)
returns uuid language sql stable set search_path = '' as $$
  select id from public.project_phases where project_id = p_project and key = p_key and status <> 'nao_aplicavel'
$$;

-- Leva uma fase até "concluida" pelas transições permitidas (sem saltar regras).
create or replace function private.complete_phase(p_phase uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare s text;
begin
  select status into s from public.project_phases where id = p_phase;
  if s is null or s in ('concluida', 'nao_aplicavel') then return; end if;
  if s = 'por_iniciar' then update public.project_phases set status = 'em_curso' where id = p_phase; end if;
  update public.project_phases set status = 'concluida' where id = p_phase;
end $$;

-- A fase passa a "a aguardar o cliente" quando lhe pedimos algo (só se estiver em curso).
create or replace function private.phase_wait_client(p_phase uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.project_phases set status = 'aguarda_cliente' where id = p_phase and status = 'em_curso';
end $$;

create or replace function private.phase_resume(p_phase uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.project_phases set status = 'em_curso' where id = p_phase and status = 'aguarda_cliente';
end $$;

-- Rondas de revisão (RN-35, RN-36): incluídas no orçamento aceite + extras aceites.
create or replace function public.design_rounds(p_project uuid)
returns table (included int, used int, remaining int) language sql stable set search_path = '' as $$
  with inc as (
    select coalesce((select rounds_included from public.quotes where project_id = p_project and status = 'aceite'), 0)
         + coalesce((select sum(extra_rounds) from public.payments
                     where project_id = p_project and kind = 'extra' and status in ('pendente', 'pago')), 0) as n
  ), usd as (
    select count(*)::int as n from public.approval_responses r join public.approvals a on a.id = r.approval_id
    where a.project_id = p_project and a.subject = 'prova' and r.kind = 'pedir_alteracoes'
  )
  select inc.n::int, usd.n, greatest(inc.n::int - usd.n, 0) from inc, usd
$$;
revoke all on function public.design_rounds(uuid) from public, anon;
grant execute on function public.design_rounds(uuid) to authenticated;

-- ───────────── 3. Orçamentos ─────────────

create or replace function private.quotes_before()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.deposit_kz is null then new.deposit_kz := round(new.total_kz * new.deposit_pct / 100.0, 2); end if;
    if new.status <> 'rascunho' then raise exception 'Um orçamento novo começa em rascunho.' using errcode = 'check_violation'; end if;
    return new;
  end if;
  if new.status = old.status then
    if old.status <> 'rascunho' and (new.total_kz, new.deposit_kz, new.design_kz, new.print_kz, new.rounds_included, new.delivery_due_on)
       is distinct from (old.total_kz, old.deposit_kz, old.design_kz, old.print_kz, old.rounds_included, old.delivery_due_on) then
      raise exception 'Só se alteram valores de um orçamento em rascunho. Crie uma versão nova.' using errcode = 'check_violation';
    end if;
    return new;
  end if;
  if not (old.status, new.status) in (('rascunho', 'enviado'), ('enviado', 'aceite'), ('enviado', 'rascunho'),
                                      ('enviado', 'substituido'), ('aceite', 'substituido')) then
    raise exception 'Transição de orçamento não permitida: % → %.', old.status, new.status using errcode = 'check_violation';
  end if;
  if (old.status, new.status) in (('enviado', 'aceite'), ('enviado', 'rascunho'))
     and current_setting('app.via_response', true) is distinct from 'on' then
    raise exception 'Só o cliente aceita ou pede alterações a um orçamento enviado.' using errcode = 'check_violation';
  end if;
  if (old.status, new.status) = ('aceite', 'substituido') and private.tx_note() is null then
    raise exception 'Indique o motivo para substituir um orçamento aceite.' using errcode = 'check_violation';
  end if;
  if new.status = 'enviado' then new.sent_at := now(); end if;
  if new.status = 'aceite' then new.accepted_at := now(); end if;
  return new;
end $$;
create trigger quotes_before before insert or update on public.quotes
  for each row execute function private.quotes_before();

create or replace function private.quotes_after()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  svc text;
  ph uuid;
  sinal_gate uuid;
  rest_gate uuid;
begin
  if new.status = old.status then return null; end if;
  select service_type into svc from public.projects where id = new.project_id;
  ph := coalesce(private.phase_by_key(new.project_id, 'orcamento-aceite'), private.phase_by_key(new.project_id, 'orcamento-sinal'));

  if new.status = 'enviado' then
    insert into public.approvals (project_id, project_phase_id, subject, quote_id, version_label, snapshot)
    values (new.project_id, ph, 'orcamento', new.id, 'v' || new.version, jsonb_build_object(
      'total_kz', new.total_kz, 'design_kz', new.design_kz, 'print_kz', new.print_kz,
      'deposit_pct', new.deposit_pct, 'deposit_kz', new.deposit_kz, 'remaining_kz', new.total_kz - new.deposit_kz,
      'delivery_due_on', new.delivery_due_on, 'rounds_included', new.rounds_included,
      'deposit_rule', 'O sinal não é devolvido se desistir depois de pagar, porque cobre o trabalho já começado.'));
  elsif new.status = 'aceite' then
    if new.delivery_due_on is not null then
      update public.projects set due_on = new.delivery_due_on where id = new.project_id;
    end if;
    sinal_gate := private.phase_from(new.project_id, 3::smallint);                         -- RN-11
    rest_gate := case when svc = 'design' then private.phase_by_key(new.project_id, 'producao') end;  -- RN-15
    insert into public.payments (project_id, quote_id, kind, description, amount_kz, gates_phase_id)
    values (new.project_id, new.id, 'sinal', 'Sinal (' || new.deposit_pct || '%)', new.deposit_kz, sinal_gate);
    if new.total_kz > new.deposit_kz then
      insert into public.payments (project_id, quote_id, kind, description, amount_kz, gates_phase_id)
      values (new.project_id, new.id, 'restante',
              case svc when 'design' then 'Restante, antes da produção' else 'Restante, antes da entrega' end,
              new.total_kz - new.deposit_kz, rest_gate);
    end if;
  elsif new.status = 'substituido' then
    update public.approvals set status = 'cancelada' where quote_id = new.id and status = 'pendente';
    update public.payments set status = 'anulado' where quote_id = new.id and status in ('pendente', 'por_aceitar');
  end if;
  return null;
end $$;
create trigger quotes_after after update of status on public.quotes
  for each row execute function private.quotes_after();

-- ───────────── 4. Pagamentos ─────────────

create or replace function private.payments_before()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    if new.kind = 'extra' and new.status = 'pendente' then new.status := 'por_aceitar'; end if;   -- RN-07
    return new;
  end if;
  if new.status = old.status then
    if old.status = 'pago' and new.amount_kz <> old.amount_kz then
      raise exception 'Um pagamento pago não muda de valor.' using errcode = 'check_violation';
    end if;
    return new;
  end if;
  if not (old.status, new.status) in (('por_aceitar', 'pendente'), ('por_aceitar', 'anulado'),
                                      ('pendente', 'pago'), ('pago', 'pendente'), ('pendente', 'anulado')) then
    raise exception 'Transição de pagamento não permitida: % → %.', old.status, new.status using errcode = 'check_violation';
  end if;
  if (old.status, new.status) = ('por_aceitar', 'pendente') and current_setting('app.via_response', true) is distinct from 'on' then
    raise exception 'Um extra só fica pendente quando o cliente o aceita.' using errcode = 'check_violation';
  end if;
  if new.status <> 'pago' then new.paid_on := null; end if;
  return new;
end $$;
create trigger payments_before before insert or update on public.payments
  for each row execute function private.payments_before();

-- D-052: uma fase não passa a "em curso" com um pagamento por pagar que a trava.
create or replace function private.project_phases_payment_gate()
returns trigger language plpgsql set search_path = '' as $$
declare p record;
begin
  if new.status = 'em_curso' and old.status is distinct from 'em_curso' then
    select description, amount_kz into p from public.payments
    where gates_phase_id = new.id and status = 'pendente' limit 1;
    if found then
      raise exception 'Falta o pagamento "%" (% Kz) para iniciar esta fase.', p.description, p.amount_kz
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger project_phases_payment_gate before update of status on public.project_phases
  for each row execute function private.project_phases_payment_gate();

-- RN-13: projeto cancelado anula os pagamentos por pagar (o sinal pago fica).
create or replace function private.projects_cancel_payments()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    update public.payments set status = 'anulado' where project_id = new.id and status in ('pendente', 'por_aceitar');
  end if;
  return null;
end $$;
create trigger projects_cancel_payments after update of status on public.projects
  for each row execute function private.projects_cancel_payments();

-- ───────────── 5. Entregáveis e ficheiros ─────────────

create or replace function private.deliverables_before()
returns trigger language plpgsql set search_path = '' as $$
declare rest uuid;
begin
  -- RN-14: a entrega final do Académico fica bloqueada até o restante estar pago.
  if new.role = 'entregavel' and new.locked_by_payment_id is null
     and new.project_phase_id is not null
     and (select key from public.project_phases where id = new.project_phase_id) = 'entrega-final' then
    select id into rest from public.payments
    where project_id = new.project_id and kind = 'restante' and status = 'pendente' limit 1;
    new.locked_by_payment_id := rest;
  end if;
  return new;
end $$;
create trigger deliverables_before before insert on public.deliverables
  for each row execute function private.deliverables_before();

-- RN-09: o cliente envia no máximo 10 ficheiros por fase.
create or replace function private.files_client_limit()
returns trigger language plpgsql set search_path = '' as $$
declare n int; ph uuid; who text;
begin
  select project_phase_id, uploaded_by_role into ph, who from public.deliverables where id = new.deliverable_id;
  if who = 'client' then
    if new.bucket <> 'client-uploads' then
      raise exception 'Ficheiros do cliente vão para o bucket client-uploads.' using errcode = 'check_violation';
    end if;
    select count(*) into n from public.files f join public.deliverables d on d.id = f.deliverable_id
    where d.project_id = new.project_id and d.uploaded_by_role = 'client'
      and d.project_phase_id is not distinct from ph and f.purged_at is null;
    if n >= 10 then
      raise exception 'Já enviou 10 ficheiros nesta fase.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger files_client_limit before insert on public.files
  for each row execute function private.files_client_limit();

-- ───────────── 6. Aprovações ─────────────

create or replace function private.approvals_before()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pendente' then raise exception 'Uma aprovação começa pendente.' using errcode = 'check_violation'; end if;
    return new;
  end if;
  if new.snapshot is distinct from old.snapshot then
    raise exception 'O conteúdo aprovado (snapshot) não se altera.' using errcode = 'check_violation';
  end if;
  if new.status <> old.status and not ((old.status, new.status) = ('pendente', 'cancelada')
                                       or current_setting('app.via_response', true) = 'on') then
    raise exception 'O estado de uma aprovação só muda por uma resposta.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger approvals_before before insert or update on public.approvals
  for each row execute function private.approvals_before();

create or replace function private.approvals_after_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.project_phase_id is not null then perform private.phase_wait_client(new.project_phase_id); end if;
  return null;
end $$;
create trigger approvals_after_insert after insert on public.approvals
  for each row execute function private.approvals_after_insert();

-- Valida cada resposta (cliente ou admin) antes de a gravar.
create or replace function private.approval_responses_before()
returns trigger language plpgsql set search_path = '' as $$
declare a public.approvals;
begin
  select * into a from public.approvals where id = new.approval_id for update;
  if new.kind in ('aprovar', 'pedir_alteracoes') and a.status <> 'pendente' then
    raise exception 'Este pedido já foi respondido.' using errcode = 'check_violation';
  end if;
  if new.kind = 'reabrir' then
    if a.status <> 'aprovada' then
      raise exception 'Só se reabre uma aprovação dada.' using errcode = 'check_violation';
    end if;
    if a.subject = 'prova' and exists (                                                -- RN-43
      select 1 from public.project_phases
      where project_id = a.project_id and key = 'producao' and status not in ('por_iniciar', 'nao_aplicavel')) then
      raise exception 'A produção já começou: a arte aprovada não se reabre.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger approval_responses_before before insert on public.approval_responses
  for each row execute function private.approval_responses_before();

-- Aplica os efeitos da resposta (estados.md §5).
create or replace function private.approval_responses_after()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a public.approvals;
begin
  perform set_config('app.via_response', 'on', true);
  select * into a from public.approvals where id = new.approval_id;

  if new.kind = 'aprovar' then
    update public.approvals set status = 'aprovada', decided_at = now() where id = a.id;
    if a.subject = 'orcamento' then
      update public.quotes set status = 'aceite' where id = a.quote_id;
    elsif a.subject = 'extra' then
      update public.payments set status = 'pendente' where id = a.payment_id and status = 'por_aceitar';
    end if;
    if a.subject = 'prova' then
      perform private.complete_phase(private.phase_by_key(a.project_id, 'revisoes'));
      perform private.complete_phase(private.phase_by_key(a.project_id, 'aprovacao-arte'));
    elsif a.project_phase_id is not null and a.subject <> 'extra' then
      perform private.complete_phase(a.project_phase_id);
    end if;

  elsif new.kind = 'pedir_alteracoes' then
    update public.approvals set status = 'alteracoes_pedidas', decided_at = now() where id = a.id;
    if a.subject = 'orcamento' then
      update public.quotes set status = 'rascunho' where id = a.quote_id;
    elsif a.subject = 'extra' then
      update public.payments set status = 'anulado' where id = a.payment_id and status = 'por_aceitar';
    end if;
    if a.project_phase_id is not null then perform private.phase_resume(a.project_phase_id); end if;

  elsif new.kind = 'reabrir' then
    update public.approvals set status = 'pendente', decided_at = null where id = a.id;
  end if;

  perform set_config('app.via_response', '', true);
  return null;
end $$;
create trigger approval_responses_after after insert on public.approval_responses
  for each row execute function private.approval_responses_after();

-- RPC do cliente (seguranca.md §3, D-098).
create or replace function public.respond_approval(
  p_approval uuid, p_kind text, p_comment text default null, p_attachment uuid default null)
returns public.approval_responses language plpgsql security definer set search_path = '' as $$
declare
  a public.approvals;
  d public.deliverables;
  r public.approval_responses;
  left_rounds int;
begin
  select * into a from public.approvals where id = p_approval for update;
  if a.id is null or not private.owns_project(a.project_id) then
    raise exception 'Pedido não encontrado.' using errcode = 'insufficient_privilege';
  end if;
  if p_kind not in ('aprovar', 'pedir_alteracoes') then
    raise exception 'Resposta inválida.' using errcode = 'check_violation';
  end if;
  if a.status <> 'pendente' then
    raise exception 'Este pedido já foi respondido.' using errcode = 'check_violation';
  end if;
  if p_kind = 'pedir_alteracoes' and char_length(btrim(coalesce(p_comment, ''))) = 0 then
    raise exception 'Escreva o que quer alterar.' using errcode = 'check_violation';
  end if;
  if a.subject in ('prova', 'entrega') then
    select * into d from public.deliverables where id = a.deliverable_id;
    if exists (select 1 from public.deliverables
               where project_id = d.project_id and series_key = d.series_key and version_no > d.version_no) then
      raise exception 'Há uma versão mais recente. Veja a versão atual.' using errcode = 'check_violation';
    end if;
  end if;
  if a.subject = 'prova' and p_kind = 'pedir_alteracoes' then
    select remaining into left_rounds from public.design_rounds(a.project_id);
    if left_rounds <= 0 then
      raise exception 'Sem rondas: peça uma revisão extra.' using errcode = 'check_violation';
    end if;
  end if;
  if p_attachment is not null and not exists (
      select 1 from public.deliverables where id = p_attachment and project_id = a.project_id and role = 'referencia') then
    raise exception 'Anexo inválido.' using errcode = 'check_violation';
  end if;

  insert into public.approval_responses (approval_id, kind, comment, attachment_deliverable_id, actor_id, actor_role)
  values (a.id, p_kind, nullif(btrim(coalesce(p_comment, '')), ''), p_attachment, auth.uid(), 'client')
  returning * into r;
  return r;
end $$;
revoke all on function public.respond_approval(uuid, text, text, uuid) from public, anon;
grant execute on function public.respond_approval(uuid, text, text, uuid) to authenticated;

-- ───────────── 7. Auditoria (D-051) ─────────────

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
                             when 'files' then 'file' when 'approvals' then 'approval' else tg_table_name end,
          (rec ->> 'id')::uuid, act,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return null;
end $$;
create trigger audit_quotes after insert or update or delete on public.quotes for each row execute function private.audit();
create trigger audit_payments after insert or update or delete on public.payments for each row execute function private.audit();
create trigger audit_deliverables after insert or update or delete on public.deliverables for each row execute function private.audit();
create trigger audit_files after insert or update or delete on public.files for each row execute function private.audit();
create trigger audit_approvals after insert or update or delete on public.approvals for each row execute function private.audit();

-- ───────────── 8. Buckets privados (ADR-003, D-080, D-100) ─────────────
-- Sem políticas para "authenticated": todo o acesso é por URL assinada gerada no servidor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('client-uploads', 'client-uploads', false, 10485760, array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('project-files', 'project-files', false, 52428800, array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/svg+xml', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/postscript', 'image/vnd.adobe.photoshop', 'application/zip'])
on conflict (id) do nothing;

-- ───────────── 9. Row Level Security (seguranca.md §2) ─────────────

alter table public.quotes              enable row level security;
alter table public.payments            enable row level security;
alter table public.deliverables        enable row level security;
alter table public.files               enable row level security;
alter table public.approvals           enable row level security;
alter table public.approval_responses  enable row level security;
alter table public.activity_log        enable row level security;
alter table public.access_links        enable row level security;

create policy "cliente lê orçamentos enviados" on public.quotes for select to authenticated
  using (((select private.owns_project(project_id)) and status in ('enviado', 'aceite', 'substituido')) or (select public.is_admin()));
create policy "admin cria orçamentos" on public.quotes for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera orçamentos" on public.quotes for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "cliente lê pagamentos" on public.payments for select to authenticated
  using (((select private.owns_project(project_id)) and status <> 'anulado') or (select public.is_admin()));
create policy "admin cria pagamentos" on public.payments for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera pagamentos" on public.payments for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "cliente lê entregáveis" on public.deliverables for select to authenticated
  using (((select private.owns_project(project_id)) and role <> 'interno') or (select public.is_admin()));
create policy "admin cria entregáveis" on public.deliverables for insert to authenticated
  with check ((select public.is_admin()) and uploaded_by_role = 'admin');
create policy "admin altera entregáveis" on public.deliverables for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "cliente lê ficheiros visíveis" on public.files for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.deliverables d
    where d.id = deliverable_id and d.role <> 'interno' and (select private.owns_project(d.project_id))));
create policy "admin cria ficheiros" on public.files for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera ficheiros" on public.files for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "cliente lê aprovações" on public.approvals for select to authenticated
  using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin cria aprovações" on public.approvals for insert to authenticated with check ((select public.is_admin()));
create policy "admin altera aprovações" on public.approvals for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "lê respostas" on public.approval_responses for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.approvals a where a.id = approval_id and (select private.owns_project(a.project_id))));
create policy "admin reabre" on public.approval_responses for insert to authenticated
  with check ((select public.is_admin()) and actor_role = 'admin' and actor_id = (select auth.uid()));

create policy "admin lê a auditoria" on public.activity_log for select to authenticated using ((select public.is_admin()));
create policy "admin lê os links" on public.access_links for select to authenticated using ((select public.is_admin()));
