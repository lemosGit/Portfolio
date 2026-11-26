# Testes automáticos
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M5-01] · Issue: #39 · Versão: 1.0 · Data: 2026-11-24
> Decisões: D-097, D-113, D-114, D-115 · RNF-701, RNF-702
> **Plano de testes** (casos por user story, dados de teste por serviço, lacunas): [`plano-testes.md`](plano-testes.md)

| Comando | O quê | Onde corre |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | local + CI |
| `npm test` | Vitest: `tests/unit/**/*.test.ts` | local + CI |
| `npm run e2e` | Playwright: comportamento do portal (sem `@visual`), a 360 px e 1280 px | local + CI |
| `npm run e2e:visual` | Playwright: compara com as **capturas de referência** em `tests/e2e/__screenshots__/` | **só local** |
| `bash scripts/db-test.sh` | Aplica `supabase/migrations/*.sql` num Postgres 17 local (Docker), com o auth/storage do Supabase simulados, e corre `supabase/tests/[0-9]*.sql` | local + CI |
| `npx supabase start` + `npm run e2e:fluxo` | Playwright: **fluxos de ponta a ponta** com um Supabase local (Docker) e as migrações; `tests/e2e/fluxo/` (D-172) | local + CI (job "Fluxos") |
| `npm run e2e:update` | Regera as capturas de referência | só quando uma mudança visual for **intencional e aprovada** |

## Como funciona
- **Modo de demonstração:** o `playwright.config.ts` arranca `next build && next start` (porta 3100) com as variáveis do Supabase e do GitHub **vazias**, por isso o portal usa os dados de exemplo e nenhum segredo é preciso (nem no CI).
- **Relógio fixo:** `PORTAL_FIXED_NOW=2026-11-25T10:00:00+01:00` e `TZ=Africa/Luanda`. O `lib/clock.ts` usa esse instante nos dados de exemplo e nas datas relativas; em produção a variável não existe e é a hora real (D-113).
- **Sessão de demonstração:** o teste põe o cookie `jp_portal_session=c_alex` (`tests/e2e/fixtures.ts`).
- **Capturas só locais** (D-114): a renderização das letras muda entre máquinas; no CI dariam falsos alarmes. Localmente usa-se o Google Chrome instalado (`channel: "chrome"`); no CI, o Chromium do Playwright (D-115).

## Capturas de referência do Tech (D-097, passo 0)
Tiradas em 2026-11-24, **antes de qualquer mudança da M5**: Visão geral, Meu projeto, Entregas, Mensagens, Agenda e Login, a 360 px e 1280 px (12 imagens). Duas execuções seguidas deram 0 diferenças.

- Os passos 1–3 da migração (extrair blocos, `SERVICE_LAYOUTS`, `PhaseSource`) têm de passar `npm run e2e:visual` **sem atualizar** as capturas.
- O passo 5 (DS V1, M5-05) mudou o aspeto de propósito: **capturas atualizadas a 2026-11-24, depois de aprovadas pelo João** (Q-081). Esta é a nova referência.

## CI
`.github/workflows/ci.yml`, em cada PR e em cada push para `main`: `npm ci` → typecheck → Vitest → Playwright (E2E). Se falhar, o relatório do Playwright fica como artefacto durante 7 dias.

## Base de dados
- `supabase/tests/_supabase_stub.sql` simula `auth.users`, `auth.uid()`, `auth.jwt()`, os papéis `anon`/`authenticated` e o `storage`.
- `supabase/tests/0006_fases.sql`: triggers B1–B6, transições de fase e de projeto, prazo ajustado (com sobreposição de intervalos) e RLS por papel (admin, cliente A, cliente B, anon). Um `assert` falhado pára o script.
- **Antes de aplicar uma migração na produção:** `bash scripts/db-test.sh` verde + backup (RNF-604).

## Esqueleto genérico (M5-06)
- `tests/e2e/academico.spec.ts`: com o cliente de exemplo `c_kiala` (Académico): etiqueta, barra de fases, próximo passo, menu de 4 entradas, redirecionamento da Agenda.
- Capturas de referência atualizadas a 2026-11-24 (Q-082): as do Tech ganharam a etiqueta "TECH"; novas `academico-visao-geral-*`. A extração dos blocos do Tech foi verificada **antes** da etiqueta, com as capturas antigas a passar sem alteração.

## Segurança / RLS (M5-13)
- `supabase/tests/0090_rls.sql`: o cliente A não lê nem escreve dados do cliente B, históricos só de inserção, `anon` sem acesso (T1, T2, T6, T7, T10–T12).
- `supabase/tests/concorrencia.sh`: duas aprovações em paralelo (T3), chamado no fim de `scripts/db-test.sh`.
- `scripts/teste-storage-t9.mjs`: T9 contra o Storage de produção (só com autorização).
- Relatório completo T1–T15: [`relatorios/M5-13-rls.md`](relatorios/M5-13-rls.md).

## Fluxos de ponta a ponta com Supabase local (M9-02, D-172)
- `npx supabase start` (Docker; a 1.ª vez descarrega as imagens) aplica `supabase/migrations/*` num Supabase local. `npx supabase stop` para parar.
- `npm run e2e:fluxo` faz o build em `.next-fluxo` e arranca o portal na porta 3200 apontado ao Supabase local (`supabase status`); recusa correr se o URL não for local. Sem emails, sem GitHub, hora real.
- `tests/e2e/fluxo/academico.fluxo.spec.ts`: link mágico (uso único) → aceite do orçamento (o sinal trava a Estrutura) → índice aprovado → entrega final bloqueada até ao restante, depois descarregada → ajuste resolvido com a V2. Cada execução cria os seus dados com um sufixo único.
- `tests/e2e/fluxo/design.fluxo.spec.ts` (M9-03): link mágico → aceite do orçamento com design + impressão (o sinal trava o Conceito) → V1 com alterações pedidas (ronda 1 de 2) → V2 aprovada para produção com os textos-chave e "Confirmo" → sem novas provas (RN-41) → "a imprimir" recusado sem o restante (RN-15) → em produção → pronto para levantar → entregue.
- Limite conhecido: o link é gerado pela lógica da ação, não pelo botão do admin (no Supabase local a resposta da ação fica presa no browser; #132).

