# G1 — Requisitos da v1.1 multi-serviço (Académico e Design)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-09] · Issue: #19 · Versão: 1.0 · Data: 2026-11-23
> Perguntas/decisões usadas: Q-036…Q-041, D-005, D-014, D-018, D-021, D-022, D-024, D-025, D-029, D-030, D-032, D-036, D-037

**Data:** 2026-11-23
**Participantes:** João Pereira (GeniusFrela: dono do produto e admin). O projeto é interno, por isso o João aprova como cliente.
**Formato:** validação assíncrona na sessão de trabalho, com as perguntas registadas (Q-036…Q-041).

## Documentos apresentados
| Documento | Versão | Conteúdo |
|---|---|---|
| `docs/01-requisitos/visao-modulos.md` | 1.0 | Visão, objetivos O1–O5, contexto, âmbito e fora de âmbito |
| `docs/01-requisitos/personas.md` | 1.0 | PER-01…PER-05 (horário corrigido na M1-07) |
| `docs/01-requisitos/requisitos-funcionais.md` | 1.3 | 121 RF: RF-10 Académico (36), RF-20 Design (39), RF-30 Comum (46) |
| `docs/01-requisitos/requisitos-nao-funcionais.md` | 1.0 | 41 RNF com métrica verificável |
| `docs/01-requisitos/regras-negocio.md` | 1.0 | 38 RN |
| `docs/01-requisitos/priorizacao-moscow.md` | 1.0 | 83 Must · 36 Should · 2 Could · 15 Won't |
| `docs/01-requisitos/user-stories.md` | 1.0 | 36 US |
| `docs/01-requisitos/rastreabilidade.md` | 1.0 | Matriz RF ↔ PER ↔ US (0 RF sem US) |
| `docs/00-gestao/decisoes.md`, `registo-perguntas.md`, `riscos.md` | — | D-001…D-041, Q-001…Q-035, R-01…R-04 |

## Decisões assumidas, revistas neste gate
| Decisão | Pergunta | Resultado |
|---|---|---|
| D-005 — o Desenvolvimento mantém as 6 fases | Q-036 | **Confirmada** (regressão zero, RNF-701) |
| D-021, D-022, D-037 — aviso com textos-chave; só o admin reabre a arte; só antes da produção | Q-037 | **Confirmadas** |
| D-014 — "Estrutura" pode ser não aplicável; capítulos opcionais | Q-038 | **Confirmada** |
| Valores assumidos: sinal de 50% no Design (D-018), 10 ficheiros por fase (D-024), aviso 7 dias antes de apagar (D-025), gatilhos do plano pago (D-029), eliminação em ≤ 30 dias (D-030), mesmo horário ao fim de semana (D-036), 5 links mágicos por hora (D-032) | Q-039 | **Confirmados** |

## Decisão
**Aprovado** (Q-040). Os requisitos ficam congelados nas versões acima e são a base da M2 (Modelagem).

## Alterações pedidas
Nenhuma. A partir daqui, qualquer mudança aos requisitos entra em `docs/00-gestao/pedidos-alteracao.md`, com o impacto no prazo e no âmbito.

## Pendentes que passam para as milestones seguintes
| Pendente | Onde |
|---|---|
| R-01 — o plano Hobby da Vercel é só para uso não comercial | M3 (stack e custos) |
| Datas-limite das milestones M2–M10 | Depois do G1: definir com o João |
| PNG do diagrama de contexto (`src/contexto-modulos.mmd`) | Quando o `mermaid-cli` for autorizado |
| Coluna TEL da rastreabilidade | M4-02 |
| Limites do Resend (100/dia, 3 000/mês) por confirmar no painel | M3 |

## Próximo passo
M2-01 (#20): modelar o `service_type` e as fases como dados.

## Confirmação do cliente
Aprovação dada pelo João Pereira na sessão de 2026-11-23, registada em Q-040 (`registo-perguntas.md`). A integração dos PRs da M1 na `main` foi decidida em Q-041.
