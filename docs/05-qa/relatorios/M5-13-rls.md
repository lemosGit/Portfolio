# Relatório — testes das políticas RLS (T1–T15)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M5-13] · Issue: #51 · Versão: 1.0 · Data: 2026-11-24
> Depende de: `docs/03-arquitetura/seguranca.md` §6, migrações 0001–0007 · Perguntas/decisões usadas: Q-089, D-098, D-101, D-121, D-143, D-144

**Critério de aceitação:** o cliente A não lê nem escreve dados do cliente B → **cumprido** (T1, T2, T6, T7).

## Como correr
| Comando | O quê |
|---|---|
| `bash scripts/db-test.sh` | Postgres 17 local (Docker): migrações + `supabase/tests/0006_fases.sql`, `0007_blocos.sql`, **`0090_rls.sql`** e **`concorrencia.sh`** (também no CI) |
| `node --env-file=.env.local scripts/teste-storage-t9.mjs` | T9 contra o Storage **de produção**: cria 1 KB em cada bucket privado, testa e apaga. Só com autorização (Q-089) |
| Supabase MCP `get_advisors(security)` | T15 |

## Resultados
| # | Cenário (seguranca.md §6) | Onde | Resultado |
|---|---|---|---|
| T1 | A lê dados de B em 13 tabelas com `project_id`, `projects`, `clients`, `approval_responses` e `files ⋈ deliverables` | `0090_rls.sql` | ✅ 0 linhas |
| T2 | A chama `respond_approval`, `admin_set_phase_status` e `admin_set_project_status` sobre B | `0090_rls.sql` | ✅ `insufficient_privilege` |
| T3 | Duas aprovações do mesmo pedido **em paralelo** | `concorrencia.sh` (2 sessões; a 1.ª segura o cadeado 2 s) | ✅ 1 sucesso, 1 "já foi respondido", 1 resposta gravada |
| T4 | Aprovar uma versão que já não é a atual | `0007_blocos.sql` | ✅ erro |
| T5 | Pedir alterações sem rondas | `0007_blocos.sql` | ✅ erro (RN-36) |
| T6 | A altera/apaga dados de B (13 tabelas + projeto); no seu projeto muda valor, marca pago, muda fase, cancela aprovação, desbloqueia ficheiro | `0090_rls.sql` | ✅ 0 linhas afetadas ou erro |
| T7 | A insere direto em `deliverables`, `files`, `payments`, `approvals`, `quotes`, `access_links`, `approval_responses` (incl. fingir-se admin); feedback no projeto de B | `0090_rls.sql` | ✅ negado |
| T8 | URL de um ficheiro bloqueado por pagamento | `lib/files/actions.ts` (`fileDownloadUrl` recusa sem `isLocked` falso) + `tests/unit/files.test.ts` | ✅ por código e unitário; E2E com sessão real na **M9-05** |
| T9 | Ler um objeto **existente** de um bucket privado sem URL assinada (caminho público, anónimo, anónimo com Bearer; listar) | `scripts/teste-storage-t9.mjs` em produção | ✅ 400 nos 3 acessos, lista vazia; controlo com URL assinada = 200; objetos apagados (0 restantes) |
| T10 | A lê `deliverables` internos, `activity_log`, `access_links`, `phase_templates` | `0090_rls.sql` (+ `quotes` rascunho em `0007`) | ✅ 0 linhas |
| T11 | Admin faz `update`/`delete` em `phase_events`, `project_status_events`, `approval_responses`, `activity_log`; `delete` em `payments`, `approvals` | `0090_rls.sql` | ✅ 0 linhas afetadas |
| T12 | `anon` lê as 17 tabelas e executa as 6 RPCs; **e não tem `EXECUTE`** nelas (só no `keepalive`) | `0090_rls.sql` | ✅ negado |
| T13 | `GET /api/cron/limpeza` sem `CRON_SECRET` (ou com um errado) | `tests/e2e/tech.spec.ts` (#122) | ✅ 401 |
| T14 | Pedido de ajuste fora do prazo | — | ⏭️ `adjustment_requests` é da **M6** (D-144) |
| T15 | Security Advisor sem RLS em falta nem `search_path` | MCP `get_advisors` (2026-11-24) | ✅ 0 desses avisos. Ficam 3 avisos aceites, abaixo |

### Avisos do Security Advisor que ficam (aceites)
| Aviso | Porquê fica |
|---|---|
| `respond_approval` é SECURITY DEFINER e executável por `authenticated` | É a RPC do cliente prevista (D-098, D-121); valida dono, estado, comentário e versão. T2/T3/T7 provam-no |
| `mark_password_changed` é SECURITY DEFINER e executável por `authenticated` | Só muda a linha do próprio cliente (0001); necessária no primeiro acesso |
| *Leaked password protection* desligada | Definição do Auth no painel (D-143): ligar quando o plano o permitir; o acesso principal passa a ser o link mágico |

## Prova de que os testes detetam falhas (testes de mutação)
Corrido uma vez, à mão, numa BD com uma falha injetada de cada vez:
| Falha injetada | Detetada? |
|---|---|
| `create policy … on payments for select using (true)` | ✅ "T1: A lê 1 linha(s) de payments do projeto de B" |
| `create policy … on deliverables for insert with check (true)` | ✅ "T7: A insere deliverables" |
| `grant execute on respond_approval to anon` | ✅ "T12: anon tem EXECUTE…" (só depois de juntar o teste de privilégios: a função recusava por dentro com o mesmo erro) |
