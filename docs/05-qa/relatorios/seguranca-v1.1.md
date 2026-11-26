# Relatório — revisão de segurança da v1.1 (RLS, URLs assinadas, link mágico)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M9-05] · Issue: #78 · Versão: 1.0 · Data: 2026-11-26
> Depende de: `docs/03-arquitetura/seguranca.md`, `relatorios/M5-13-rls.md` (T1–T15), ADR-002 (link mágico), ADR-003 (ficheiros), migrações 0001…0018 · Decisões: D-069, D-078, D-098, D-143, D-172

## Resumo
| Critério (#78) | Resultado |
|---|---|
| Link reutilizado ou expirado é recusado | ✅ substituído, expirado e usado: recusados na página; o Auth também recusa o token gasto |
| URL assinada expira | ✅ o portal assina por **15 min**; o Supabase recusa o URL sem token, com o token alterado e depois de expirar |
| Advisors do Supabase sem avisos de segurança | ✅ **0 erros**; 4 avisos, todos aceites e justificados (§4) |
| OWASP: IDOR nas rotas de aprovação/ficheiros | ✅ o cliente A, a repetir as Server Actions com os ids de B, não descarrega nem aprova nada de B; o cookie do projeto não abre o projeto de B |

## Como correr
| Comando | O quê |
|---|---|
| `npx supabase start` + `npm run e2e:fluxo -- seguranca` | `tests/e2e/fluxo/seguranca.fluxo.spec.ts` (5 testes) com o Supabase local; também no CI (job "Fluxos") |
| `bash scripts/db-test.sh` | RLS por tabela e por papel (`0090_rls.sql`, T1–T12) e concorrência (T3) |
| Supabase MCP `get_advisors(security)` | Advisors da produção |

## 1. Link mágico (RN-53, ADR-002)
| Caso | Como | Resultado |
|---|---|---|
| Link **substituído** (gerado outro a seguir) | abrir o 1.º link | ✅ "Este link já não é válido", sem botão "Entrar" |
| Link **expirado** (24 h passadas) | `expires_at` no passado; abrir o link | ✅ recusado antes de chegar ao Auth |
| Link **usado** | entrar e voltar a abrir o mesmo link noutro browser | ✅ recusado |
| Token gasto **diretamente no Auth** (2.ª barreira) | `verifyOtp({ token_hash })` com o token já usado | ✅ o Supabase recusa ("expired or invalid") |
| O token nunca fica na BD | `access_links.token_digest` = SHA-256 (D-069) | ✅ (o teste usa o resumo para expirar o link) |

## 2. URL assinada dos downloads (ADR-003)
| Caso | Resultado |
|---|---|
| Validade do URL gerado por `fileDownloadUrl` | ✅ `exp − iat` = **900 s** (15 min), só para o ficheiro pedido, no caminho do projeto do cliente |
| URL **sem** token | ✅ recusado (≥ 400) |
| Token **alterado** | ✅ recusado (≥ 400) |
| URL **expirado** (assinado por 1 s, pedido 2,5 s depois) | ✅ recusado (≥ 400); o mesmo URL servia antes de expirar |
| Ficheiro bloqueado por pagamento (RN-14) | ✅ sem botão e a ação recusa (M9-02, `academico.fluxo.spec.ts`; `0012_ajustes.sql`) |

## 3. IDOR (OWASP A01: controlo de acessos)
Dois clientes reais no Supabase local, cada um com um projeto, um ficheiro e uma aprovação pendente. O teste **captura o pedido da Server Action do cliente A no browser** (sem o deixar seguir) e **repete-o com a sessão de A**, trocando só os argumentos:

| Ataque | Resposta | Efeito |
|---|---|---|
| `fileDownloadUrl(<ficheiro de B>)` | ✅ `{ ok: false, error: "Ficheiro não encontrado." }`, sem URL nem o id do projeto de B | nenhum |
| `respondToApproval(<aprovação de B>, "aprovar")` | ✅ `{ ok: false, error: "Pedido não encontrado." }` (nem confirma que existe) | B continua **pendente**, **0** respostas gravadas |
| Controlo: os mesmos pedidos com os ids de A | ✅ funcionam (URL assinado; aprovação aceite) | — |
| Cookie `jp_portal_project` = projeto de B | ✅ o portal mostra o projeto de A e os ficheiros de A | — |

Porquê: as ações leem com a **sessão de quem pede** (RLS: `owns_project`), e as escritas do cliente passam pela RPC `respond_approval`, que volta a verificar o dono (D-098). A nível da BD, T1, T2, T6 e T7 (`0090_rls.sql`) cobrem as 17 tabelas e as RPC.

## 4. Advisors de segurança do Supabase (produção, 2026-11-26)
**0 erros. 4 avisos, aceites:**

| Aviso | Porquê fica |
|---|---|
| `respond_approval` é SECURITY DEFINER e executável por `authenticated` | É a RPC do cliente prevista (D-098); valida dono, estado, comentário, versão e rondas. O §3 e T2/T3/T7 provam-no |
| `mark_password_changed` é SECURITY DEFINER e executável por `authenticated` | Só muda a linha do próprio cliente (0001); necessária no 1.º acesso |
| *Auth OTP long expiry* (> 1 h) | Decisão: o link mágico vale **24 h** (D-078, D-023), porque o cliente abre-o no WhatsApp quando pode. Compensado pelo uso único, pela substituição e pelo limite de 5 links por hora (D-032) |
| *Leaked password protection* desligada | Definição do Auth que depende do plano (D-143); o acesso principal é o link mágico |

Comparado com a M5-13 (24/11), nenhuma das funções novas das migrações 0009…0018 aparece como SECURITY DEFINER exposta, nem há tabelas sem RLS.

## 5. Fora deste relatório
- O botão "Gerar link de acesso" fica preso no Supabase local (pedido abortado no browser): não é um problema de segurança; seguido na #132 (D-172).
- Envio real dos emails (G3 do plano de testes): fora do âmbito; a regra RN-54 (sem dados sensíveis nos emails) fica por confirmar quando os emails forem ligados.
