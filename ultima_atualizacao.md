# Última atualização
> Projeto: GeniusFrela — Área do Cliente multi-serviço (Académico e Design) · Data: 2026-11-24

<!-- ESTADO:INICIO -->
## 📍 Estado actual
| | Tarefa | Issue | Entregável |
|---|---|---|---|
| ✅ Última feita | M5-12 Gerar e enviar o link mágico pelo admin | #50 | `lib/access/`, `app/cliente/entrar/page.tsx`, `app/admin/_components/AccessLinkPanel.tsx` |
| ⏭️ Próxima | M5-13 Testar as políticas RLS das novas tabelas | #51 | — |
| ❓ Perguntas em aberto | **R-08: definir `SUPABASE_DB_URL` e `BACKUP_PASSPHRASE` no GitHub** · Datas das milestones M2–M10 · R-01 Vercel Hobby aceite (rever no fim de cada milestone) · **R-06 pôr OTP a 86 400 s no painel (agora obrigatório: sem isto o link mágico expira em 1 h)** · PNG dos diagramas por gerar (contexto, 3 MER, 7 estados, 2 sequências): falta autorizar o `mermaid-cli` | | |
| 🎨 Referência de design | **Design System V1** — `docs/references/designer_system/Design System — GeniusFrela@2x.png` (todas as tarefas de design, D-086) | | |
<!-- ESTADO:FIM -->

## 🗒️ Registo — M0
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-23 | M0 | — | Perguntas Q-001…Q-004 e decisões D-001…D-008 | `docs/00-gestao/registo-perguntas.md`, `docs/00-gestao/decisoes.md` |
| 2026-11-23 | M0 | — | Backlog e scripts do GitHub (dry-run OK) | `scripts/tarefas.py`, `scripts/criar_issues.py`, `scripts/setup-github.sh`, `scripts/criar_quadro.py` |
| 2026-11-23 | M0 | — | GitHub: 37 labels novas, 9 milestones, 73 issues com dependências, quadro #9 (contagens verificadas) | `scripts/setup-github.sh`, `criar_issues.py`, `criar_quadro.py` |

## 🗒️ Registo — M1 Requisitos
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-23 | M1-01 | #11 | Visão e âmbito (Q-005…Q-007, D-009…D-011; issues M5-09/M5-11/M5-12 atualizadas) | `docs/01-requisitos/visao-modulos.md`, `docs/01-requisitos/src/contexto-modulos.mmd` |
| 2026-11-23 | M1-02 | #12 | Personas PER-01…PER-05 (Q-008…Q-011, D-012; issues M1-02/M6-03/M7-02 atualizadas) | `docs/01-requisitos/personas.md` |
| 2026-11-23 | M1-03 | #13 | RF-10 Académico: 36 RF (Q-012…Q-015, D-013…D-016; issues M5-09/M6-04/M6-06 atualizadas) | `docs/01-requisitos/requisitos-funcionais.md` |
| 2026-11-23 | M1-04 | #14 | RF-20 Design: 38 RF (Q-016…Q-019, D-017…D-022) | `docs/01-requisitos/requisitos-funcionais.md` |
| 2026-11-23 | M1-05 | #15 | RF-30 Blocos comuns: 42 RF (Q-020…Q-023, D-023…D-027) | `docs/01-requisitos/requisitos-funcionais.md` |
| 2026-11-23 | M1-06 | #16 | RNF: 41 RNF em 7 grupos (Q-024…Q-027, D-028…D-032), riscos R-01…R-04 | `docs/01-requisitos/requisitos-nao-funcionais.md`, `docs/00-gestao/riscos.md` |
| 2026-11-23 | M1-07 | #17 | Regras de negócio: 38 RN (Q-028…Q-031, D-033…D-037); horário corrigido na PER-01 | `docs/01-requisitos/regras-negocio.md`, `personas.md` |
| 2026-11-23 | M1-08 | #18 | MoSCoW (83 Must / 36 Should / 2 Could / 15 Won't), 5 RF novos, 36 US, matriz RF↔PER↔US (Q-032…Q-035, D-038…D-041) | `priorizacao-moscow.md`, `user-stories.md`, `rastreabilidade.md`, `scripts/gerar_us.py` |
| 2026-11-23 | M1-09 | #19 | **G1 aprovado** (Q-036…Q-041); decisões assumidas confirmadas | `docs/00-gestao/actas/G1-requisitos.md` |

## 🗒️ Registo — M2 Modelagem
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-23 | M2-01 | #20 | MER de service_type, phase_templates, project_phases, phase_events (Q-042…Q-045, D-042…D-047) | `docs/02-modelagem/mer/fases-servicos.md`, `src/mer-fases.mmd` |
| 2026-11-24 | M2-02 | #21 | MER de quotes, payments, approvals, approval_responses, deliverables, files, activity_log (Q-046…Q-049, D-048…D-054) | `docs/02-modelagem/mer/blocos-comuns.md`, `src/mer-blocos-comuns.mmd` |
| 2026-11-24 | M2-03 | #22 | MER de academic_briefs, academic_sections, adjustment_requests, design_specs (Q-050…Q-054, D-055…D-061); PA-001 aprovado | `docs/02-modelagem/mer/fichas-servico.md`, `docs/00-gestao/pedidos-alteracao.md` |
| 2026-11-24 | M2-04 | #23 | Dicionário de dados (15 tabelas, 176 colunas, 22 domínios) e revisão cruzada (RV-01…RV-03) | `docs/02-modelagem/dicionario-dados.md`, `revisao-modelagem.md`, `scripts/gerar_dicionario.py` |
| 2026-11-24 | M2-05 | #24 | 7 diagramas de estados com tabelas de transição; `project_status_events`; PA-002 aprovado (Q-055…Q-058, D-062…D-066) | `docs/02-modelagem/estados/estados.md`, `src/estados-*.mmd`, `regras-negocio.md` v1.2 |
| 2026-11-24 | M2-06 | #25 | Sequências do link mágico e da aprovação da arte; tabela `access_links` (Q-059…Q-061, D-067…D-071) | `docs/02-modelagem/sequencia/sequencias.md`, `src/sequencia-*.mmd` |

## 🗒️ Registo — M3 Arquitetura
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-24 | M3-01 | #26 | ADR-001: `PhaseSource` (github / database), % do projeto, impacto em `toView` (Q-062, Q-063, D-072…D-075) | `docs/03-arquitetura/adr/ADR-001-fases-bd-vs-github.md` |
| 2026-11-24 | M3-02 | #27 | ADR-002 + spike real (S1–S6 confirmados; armadilha do link `signup`); riscos R-05, R-06 (Q-064, D-076…D-079) | `docs/03-arquitetura/adr/ADR-002-link-magico.md`, `spikes/spike-link-magico.mjs` |
| 2026-11-24 | M3-03 | #28 | ADR-003: 2 buckets, upload direto, pré-visualizações no browser, limpeza diária, estimativa (~520 MB com 16 projetos); R-07 capas (Q-065, Q-066, D-080…D-085) | `docs/03-arquitetura/adr/ADR-003-ficheiros.md` |
| 2026-11-24 | M3-04 | #29 | ADR-004 com base no Design System V1; contraste AA verificado; PA-003 aprovado (D-004 substituída) (Q-067, Q-068, D-086…D-091) | `docs/03-arquitetura/adr/ADR-004-tema-por-servico.md`, `docs/references/designer_system/` |
| 2026-11-24 | M3-05 | #30 | Layout por blocos: esqueleto, navegação (barra inferior), 25 blocos, `SERVICE_LAYOUTS`, migração do Tech em 5 passos (Q-069, Q-070, D-092…D-097) | `docs/03-arquitetura/layout-blocos.md` |
| 2026-11-24 | M3-06 | #31 | Matriz de segurança: 4 papéis, 20 tabelas, RPC do cliente, 15 testes; R-01 aceite (Q-071, Q-072, D-098…D-102) | `docs/03-arquitetura/seguranca.md` |

## 🗒️ Registo — M4 UX/UI
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-24 | M4-01 | #32 | Referências R1–R6 com o que se aproveita; documento de layouts e capturas guardados no git (D-103, D-104) | `docs/04-ux-ui/referencias.md`, `docs/references/1/`, `docs/references/2/` |
| 2026-11-24 | M4-02 | #33 | 35 telas, variações por serviço, 5 fluxos; coluna TEL da rastreabilidade gerada (D-105, D-106) | `docs/04-ux-ui/fluxo-telas.md`, `rastreabilidade.md`, `user-stories.md` |
| 2026-11-24 | M4-03 | #34 | Wireframe Académico em HTML com o DS V1 (9 ecrãs) + `ds.css` + captura (Q-073, D-107, D-108) | `docs/04-ux-ui/wireframes/academico.html`, `academico.md`, `ds.css`, `img/academico.png` |
| 2026-11-24 | M4-04 | #35 | Wireframe Design em HTML com o DS V1 (9 ecrãs) + captura (D-109, D-110) | `docs/04-ux-ui/wireframes/design.html`, `design.md`, `img/design.png` |
| 2026-11-24 | M4-05 | #36 | Wireframe dos blocos comuns e do link mágico (8 ecrãs); logótipo corrigido nos 3 wireframes (D-111, D-112) | `docs/04-ux-ui/wireframes/blocos-comuns.html`, `blocos-comuns.md`, `img/*.png` |
| 2026-11-24 | M4-06 | #37 | Tokens por serviço validados nos 3 wireframes (0 cores fora dos tokens) | `docs/04-ux-ui/design-system.md` |
| 2026-11-24 | M4-07 | #38 | **G2 aprovado** (Q-074…Q-079); D-108…D-111 confirmadas | `docs/00-gestao/actas/G2-design.md` |

## 🗒️ Registo — M5 Fundação
| Data | Código | Issue | Tarefa | Entregáveis |
|------|--------|-------|--------|-------------|
| 2026-11-24 | M5-01 | #39 | Vitest (13 testes), Playwright (14 E2E + 12 capturas de referência do Tech), CI, `lib/clock.ts` (D-113…D-115) | `vitest.config.ts`, `playwright.config.ts`, `tests/`, `.github/workflows/ci.yml`, `docs/05-qa/testes.md` |
| 2026-11-24 | M5-02 | #40 | Migração 0006 testada localmente (Docker) e aplicada em produção após backup JSON; 2 projetos Tech intactos; Security Advisor sem avisos novos; testes SQL no CI (Q-080, D-116…D-118, R-08) | `supabase/migrations/0006_service_type_phases.sql`, `supabase/tests/`, `scripts/db-test.sh` |
| 2026-11-24 | M5-03 | #41 | Migração 0007 testada localmente (fluxos completos de Académico e Design, RLS) e aplicada em produção; buckets privados criados; dados intactos (D-119…D-122) | `supabase/migrations/0007_pagamentos_aprovacoes_ficheiros.sql`, `supabase/tests/0007_blocos.sql` |
| 2026-11-24 | M5-04 | #42 | `PhaseSource` (github/database), ramo BD no `toView()`, ligação no portal e no admin; correção da regressão de estados no admin (D-123, D-124, R-09); 20 unitários + 26 E2E/visuais verdes sem atualizar capturas | `lib/portal/phase-source.ts`, `lib/portal/data.ts`, `tests/unit/phase-source.test.ts` |
| 2026-11-24 | M5-05 | #43 | Portal e admin no DS V1 (neutros, Inter, Azul Sistema no Tech, marca no admin/login, coral, barra inferior); 12 capturas atualizadas após aprovação (Q-081, D-125); R-09 fechado | `app/globals.css`, `tailwind.config.ts`, layouts, `Sidebar.tsx`, widgets |
| 2026-11-24 | M5-06 | #44 | `SERVICE_LAYOUTS`, blocos do Tech extraídos sem mudança visual (provado), blocos comuns `phase-bar`/`next-step`, menu e etiqueta pelo registo, Académico de exemplo; capturas atualizadas após aprovação (Q-082, D-126, D-127) | `lib/portal/service-layouts.ts`, `app/cliente/_blocks/`, `tests/e2e/academico.spec.ts` |
| 2026-11-24 | M5-07 | #45 | Tipo de serviço obrigatório ao criar (cliente+projeto e projeto), repositório só no Tech, edição sem mudar o tipo; 7 testes unitários novos (D-128) | `lib/admin/project-form.ts`, `app/admin/_components/ServicePicker.tsx`, `tests/unit/project-form.test.ts` |
| 2026-11-24 | M5-08 | #46 | Página de fases no admin: avançar (concluir + iniciar a seguinte), recuar (reabrir com motivo), mudar estado, prazo, próximo passo e progresso, histórico; email ao cliente pelo Resend; resumo na página do projeto; 10 testes unitários (Q-083, D-129, D-130) | `app/admin/projetos/[id]/fases/page.tsx`, `lib/admin/phases.ts`, `lib/email/templates.ts`, `tests/unit/admin-phases.test.ts` |
| 2026-11-24 | M5-09 | #47 | Bloco Ficheiros: upload direto em 3 passos com bilhete assinado e verificação dos bytes, versões por série, bloqueio por pagamento, download por link de 15 min; página do admin e "Ficheiros" do cliente (Académico/Design); 13 unitários, 1 E2E, RLS entre clientes no SQL (Q-084, D-131…D-133) | `lib/files/`, `components/files/`, `app/admin/projetos/[id]/ficheiros/page.tsx`, `app/cliente/_components/ClientFiles.tsx`, `tests/unit/files.test.ts` |
| 2026-11-24 | M5-09b | #122 | Issue criada (miniaturas WebP + limpeza diária, D-133), com confirmação | `scripts/tarefas.py` |
| 2026-11-24 | M5-10 | #48 | Bloco Aprovações: pedir (índice, prova, entrega), cancelar e reabrir no admin; cliente aprova em 2 passos ou pede alterações com comentário; histórico; próximo passo do cliente; email ao João; 4 unitários, 1 E2E, captura do Académico atualizada (Q-085, D-134…D-136) | `lib/approvals/`, `app/cliente/_blocks/approvals.tsx`, `app/cliente/_components/ApprovalCard.tsx`, `app/admin/projetos/[id]/aprovacoes/page.tsx` |
| 2026-11-24 | M5-11 | #49 | Bloco Pagamentos: admin regista sinal/restante/extra, marca pago com data, desfaz e anula; extra pede aceitação; cliente vê total/pago/em falta e estados (em atraso calculado em Luanda); próximo passo "Pagar…"; 7 unitários, 1 E2E, captura do Académico atualizada (Q-086, D-137…D-139) | `lib/payments/model.ts`, `app/cliente/_blocks/payments.tsx`, `app/admin/projetos/[id]/pagamentos/page.tsx`, `tests/unit/payments.test.ts` |
| 2026-11-24 | M5-12 | #50 | Link mágico: gerar no projeto (limite 5/h, recusa links `signup`), Copiar / WhatsApp / Email, `/cliente/entrar` (GET mostra, POST entra), ecrã de link inválido com WhatsApp; 5 unitários, 1 E2E; **teste real em produção com o cliente de teste**, dados temporários apagados (Q-087, Q-088, D-140…D-142) | `lib/access/`, `app/cliente/entrar/page.tsx`, `app/admin/_components/AccessLinkPanel.tsx`, `middleware.ts` |
