# Segurança — matriz de permissões e políticas RLS
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M3-06] · Issue: #31 · Versão: 1.0 · Data: 2026-11-24
> Depende de: `docs/02-modelagem/dicionario-dados.md` (17 tabelas), `mer/*.md` §Segurança (provisórias), `estados/estados.md`, ADR-002 (link mágico), ADR-003 (ficheiros), `supabase/migrations/0001…0005`, `requisitos-nao-funcionais.md` RNF-3 · Perguntas/decisões usadas: Q-071, Q-072, D-012, D-049, D-051, D-052, D-069, D-080, D-081, D-098…D-102

## 1. Papéis
| Papel | Quem | Como é identificado | Onde corre |
|---|---|---|---|
| **anon** | visitante sem sessão (ex.: quem abre o link mágico) | sem JWT | browser |
| **cliente** | PER-02…PER-05, com sessão | `authenticated` + `private.owns_project(project_id)` | browser e Server Components/Actions com a sessão dele |
| **admin** | PER-01 | `authenticated` + `public.is_admin()` (`app_metadata.role = 'admin'`, definido só pela chave secreta) | Server Actions com `requireAdminStrict` (valida o utilizador no Auth) |
| **sistema** | o próprio servidor: cron de limpeza, link mágico, registo de uploads, contas | **chave secreta** (`SUPABASE_SECRET_KEY`), ignora a RLS | **só** Route Handlers / Server Actions; nunca no browser (RNF-306) |

Regras gerais:
1. **RLS ativa em todas as tabelas** do schema `public`. Sem política, ninguém lê nem escreve (negado por omissão).
2. **O cliente só lê** pelas tabelas. **Todas as escritas do cliente passam por funções SQL (RPC)** `security definer` que validam as regras numa transação (Q-071, D-098); os *triggers* das M2 ficam como **segunda barreira**.
3. O admin escreve pelas tabelas com a sua sessão (`is_admin()`), como hoje; os *triggers* garantem as transições (`estados.md`).
4. A chave secreta é usada **só** onde o cliente não tem sessão ou onde é preciso validar algo fora da BD (bytes de um ficheiro): link mágico, registo de uploads, limpeza, criação de contas (D-099).
5. Funções `security definer` têm `set search_path = ''`, estão no schema `private` quando só servem a RLS, e o `execute` é dado só a `authenticated` (como a `0003`).

## 2. Matriz papel × tabela × operação
`S` ler · `I` inserir · `U` alterar · `D` apagar · `—` sem acesso · *RPC* = só através da função indicada (§3)

| Tabela | Cliente (só do seu projeto) | Admin | Sistema | Notas |
|---|---|---|---|---|
| `clients` | S (a sua linha) | S I U D | S I U D | já existe |
| `projects` | S | S I U D | S | `service_type` imutável (trigger B3) |
| `demo_links`, `meetings` | S | S I U D | — | já existem (Tech) |
| `feedback` | S · I (como `client`) | S I U D | — | já existe; RN-52 aviso fora de horas é só de UI |
| `phase_templates` | — | S I U D | S | o cliente não precisa |
| `project_phases` | S | S I U | S (cron) | sem `D` (só cascade do projeto) |
| `phase_events` | S | S · I (pelo trigger) | S | **só inserção**: ninguém faz `U`/`D` |
| `project_status_events` | S | S · I (pelo trigger) | S | só inserção |
| `quotes` | S (só `enviado`, `aceite`, `substituido`) | S I U | — | o cliente **nunca** vê rascunhos |
| `payments` | S (sem `anulado`) | S I U | S (cron: anular no cancelamento) | **o cliente não tem `I`/`U`/`D`**: não altera valores nem estados |
| `approvals` | S | S I U | — | `snapshot` imutável depois de criado (trigger) |
| `approval_responses` | S · *RPC* `respond_approval` | S · I (`reabrir`) | — | só inserção; uma resposta fecha o pedido |
| `deliverables` | S (sem `interno`) | S I U | S I (registo de uploads do cliente) · U (`purged_at`) | o cliente não insere diretamente |
| `files` | S (metadados) | S I U | S I U | download só por URL assinada do servidor |
| `academic_briefs`, `design_specs` | S | S I U | — | |
| `academic_sections` | S (título e estado) | S I U D | — | |
| `adjustment_requests` | S · *RPC* `request_adjustment` | S U | — | só dentro do prazo (F3) |
| `activity_log` | — | S | I (triggers) | só inserção; só o admin lê |
| `access_links` | — | S | S I U | só o servidor; guarda só o SHA-256 (D-069) |

### Garantias pedidas na issue
| Garantia | Como |
|---|---|
| **O cliente só aprova o que é seu** | `respond_approval` verifica `private.owns_project(approval.project_id)` |
| **…e só uma vez** | verifica `status = 'pendente'` com `select … for update`; a resposta muda o estado na mesma transação; um 2.º pedido simultâneo encontra `aprovada` e falha |
| **…e só a versão atual** | numa `prova`/`entrega`, o `deliverable_id` tem de ser a versão mais alta da série |
| **O cliente não altera valores de pagamento** | `payments` não tem política de `insert`/`update`/`delete` para o cliente e não há RPC que lhe mexa; o aceite de um extra muda o estado pelo trigger da aprovação, não pelo cliente |
| **Storage: o cliente só lê ficheiros do seu projeto** | buckets privados **sem políticas para `authenticated`**; o servidor só gera a URL assinada (15 min) depois de ler a linha de `files` **com a sessão do cliente** (RLS) e de verificar bloqueio e `purged_at` |

## 3. Funções RPC do cliente (D-098)
| Função | Valida | Efeito |
|---|---|---|
| `public.respond_approval(p_approval uuid, p_kind text, p_comment text default null, p_attachment uuid default null)` | dono do projeto · `pendente` · `p_kind in ('aprovar','pedir_alteracoes')` · comentário obrigatório em `pedir_alteracoes` (RN-06) · versão atual · numa `prova`, `pedir_alteracoes` só com rondas restantes (senão erro "Sem rondas — peça uma ronda extra", RN-36) · anexo é uma `referencia` do mesmo projeto | `insert approval_responses` (`actor_role = 'client'`); o trigger faz o resto (`estados.md` §5) |
| `public.request_adjustment(p_project uuid, p_description text, p_attachment uuid default null)` | dono · projeto `academic` · `now() <= delivered_at + adjust_days` (RN-33) · 10–2000 caracteres | `insert adjustment_requests` |
| `public.mark_password_changed()` | (já existe) | |

Todas: `security definer`, `set search_path = ''`, `revoke all … from public, anon`, `grant execute … to authenticated`, mensagens de erro em português pensadas para o cliente.

**Pedir uma ronda extra** (RF-20.43) não precisa de RPC: o cliente envia uma mensagem `fase` (política atual de `feedback`) e o admin cria o pagamento `extra` + a aprovação.

## 4. Operações do sistema (chave secreta, só no servidor)
| Operação | Rota / ação | Verificações antes de usar a chave |
|---|---|---|
| Gerar link mágico | Server Action do admin | `requireAdminStrict`; limite 5/h (D-032); `verification_type = magiclink` (D-077) |
| Entrar pelo link | `POST /cliente/entrar` | `access_links` válido (não usado, não substituído, não expirado) |
| Pedir upload do cliente | Server Action | com a sessão do cliente: dono do projeto, fase com `client_can_upload`, < 10 ficheiros na fase (RN-09) |
| Registar upload do cliente | Server Action (passo 3, ADR-003) | assinatura dos bytes, tamanho real, pré-visualização válida; `deliverables.created_by = auth.uid()` do cliente |
| URL assinada de download | Server Action | linha de `files` lida com a sessão do cliente; versão não bloqueada nem apagada |
| Limpeza diária | `GET /api/cron/limpeza` | `Authorization: Bearer ${CRON_SECRET}` |
| Criar e apagar contas | Server Action do admin | `requireAdminStrict` (já existe) |

## 5. Políticas a criar na M5 (resumo por tabela)
```sql
-- padrão para as tabelas novas com project_id (leitura do cliente + gestão do admin)
alter table public.<t> enable row level security;
create policy "cliente lê <t>" on public.<t> for select to authenticated
  using ((select private.owns_project(project_id)) or (select public.is_admin()));
create policy "admin gere <t>" on public.<t> for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- exceções
-- quotes:        cliente só status in ('enviado','aceite','substituido')
-- payments:      cliente só status <> 'anulado'; admin sem DELETE
-- deliverables:  cliente só role <> 'interno'
-- phase_events, project_status_events, approval_responses, activity_log:
--                sem políticas de UPDATE/DELETE para ninguém (só inserção)
-- phase_templates, activity_log, access_links: sem política para o cliente
```
`(select …)` à volta das funções faz o Postgres avaliá-las uma vez por consulta, e não por linha (desempenho, RNF-101).

## 6. Testes de segurança (M5-13 #51, M9-05 #78)
| # | Cenário | Esperado |
|---|---|---|
| T1 | Cliente A lê `payments`/`files`/`approvals` do projeto do cliente B | 0 linhas |
| T2 | Cliente chama `respond_approval` num pedido de outro projeto | erro |
| T3 | Cliente aprova o mesmo pedido duas vezes (em paralelo) | 1 sucesso, 1 erro |
| T4 | Cliente aprova uma versão que já não é a atual | erro "Há uma versão mais recente" |
| T5 | Cliente pede alterações sem rondas restantes | erro "Sem rondas — peça uma ronda extra" |
| T6 | Cliente faz `update payments set amount_kz = 1` pela API REST | 0 linhas afetadas / negado |
| T7 | Cliente insere diretamente em `approval_responses` ou `deliverables` | negado |
| T8 | Cliente pede URL de um ficheiro bloqueado por pagamento | negado |
| T9 | Pedido direto ao Storage sem URL assinada (bucket privado) | 400/403 |
| T10 | Cliente lê `quotes` em rascunho, `deliverables` `interno`, `activity_log`, `access_links` | 0 linhas |
| T11 | Ninguém (nem o admin) faz `update`/`delete` em `phase_events`, `approval_responses`, `activity_log` | negado |
| T12 | `anon` chama qualquer RPC | negado |
| T13 | `GET /api/cron/limpeza` sem o `CRON_SECRET` | 401 |
| T14 | Pedido de ajuste fora do prazo | erro |
| T15 | Security Advisor do Supabase sem avisos de RLS em falta nem de `search_path` | 0 avisos |

## 7. Riscos e decisões
| ID | Decisão / risco |
|---|---|
| D-098 | Escritas do cliente só por RPC `security definer`; triggers como segunda barreira (Q-071) |
| D-099 | Chave secreta só para link mágico, uploads do cliente, URLs assinadas, limpeza e contas |
| D-100 | Buckets privados sem políticas para `authenticated`; todo o acesso por URL assinada gerada no servidor |
| D-101 | Tabelas de histórico (`phase_events`, `project_status_events`, `approval_responses`, `activity_log`) sem `update`/`delete` para ninguém |
| D-102 | R-01 aceite: ficar no plano Hobby da Vercel por agora (Q-072); rever no fim de cada milestone e antes da release v1.1 |
