# Última atualização
> Projeto: GeniusFrela — Área do Cliente multi-serviço (Académico e Design) · Data: 2026-11-23

<!-- ESTADO:INICIO -->
## 📍 Estado actual
| | Tarefa | Issue | Entregável |
|---|---|---|---|
| ✅ Última feita | M4-04 Desenhar o wireframe da Área do Cliente Design | #35 | `docs/04-ux-ui/wireframes/design.html` |
| ⏭️ Próxima | M4-05 Desenhar os blocos comuns e o ecrã do link mágico | #36 | `docs/04-ux-ui/wireframes/blocos-comuns.html` |
| ❓ Perguntas em aberto | Datas das milestones M2–M10 · R-01 Vercel Hobby aceite (rever no fim de cada milestone) · R-06 pôr OTP a 86 400 s no painel · PNG dos diagramas por gerar (contexto, 3 MER, 7 estados, 2 sequências): falta autorizar o `mermaid-cli` | | |
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
