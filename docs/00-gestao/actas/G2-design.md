# G2 — Design da v1.1 multi-serviço (Académico e Design)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-07] · Issue: #38 · Versão: 1.0 · Data: 2026-11-24
> Perguntas/decisões usadas: Q-074…Q-079, D-086…D-112, PA-003

**Data:** 2026-11-24
**Participantes:** João Pereira (GeniusFrela: dono do produto e admin; aprova como cliente).
**Formato:** validação assíncrona na sessão de trabalho, com as perguntas registadas (Q-074…Q-079).

## Documentos apresentados
| Documento | Versão | Conteúdo |
|---|---|---|
| `docs/references/designer_system/Design System — GeniusFrela@2x.png` | V1 | Referência visual obrigatória |
| `docs/03-arquitetura/adr/ADR-004-tema-por-servico.md` | 1.0 | Tokens, tipografia, regras, contraste |
| `docs/03-arquitetura/layout-blocos.md` | 1.0 | Esqueleto, navegação, blocos, `SERVICE_LAYOUTS` |
| `docs/04-ux-ui/referencias.md` | 1.0 | Fichas R1–R6 |
| `docs/04-ux-ui/fluxo-telas.md` | 1.0 | 35 telas e fluxos |
| `docs/04-ux-ui/wireframes/academico.html` (+ `.md`, `img/`) | 1.0 | 9 ecrãs Académico |
| `docs/04-ux-ui/wireframes/design.html` (+ `.md`, `img/`) | 1.0 | 9 ecrãs Design |
| `docs/04-ux-ui/wireframes/blocos-comuns.html` (+ `.md`, `img/`) | 1.0 | 8 ecrãs comuns e link mágico |
| `docs/04-ux-ui/design-system.md` + `wireframes/ds.css` | 1.0 | Tokens por serviço e validação |

## Pontos confirmados
| Ponto | Decisão | Pergunta | Resultado |
|---|---|---|---|
| Contagem do prazo como elemento principal; barra de fases segmentada | D-108 | Q-074 | **Aprovado** |
| Prova numa moldura neutra; folha "Já usou as 2 revisões" | D-109, D-110 | Q-075 | **Aprovado** |
| Tons derivados da marca; WhatsApp como botão principal no link inválido e no "Gerar link" | D-111 | Q-076 | **Aprovado** |
| Textos: regra do sinal, irreversibilidade da arte, validade do link | — | Q-077 | **Aprovado** (podem ser afinados na implementação sem mudar o sentido) |

## Decisão
**Aprovado** (Q-078). O design fica congelado nas versões acima e é a base da M5 (fundação) e das M6/M7 (módulos).

## Alterações pedidas
Nenhuma. A partir daqui, mudanças de design entram em `docs/00-gestao/pedidos-alteracao.md`.

## Pendentes que passam para a implementação
| Pendente | Onde |
|---|---|
| Migrar `.app` da base ameixa para os neutros do DS V1 e Manrope → Inter (mudança visual também no Tech, com capturas aprovadas) | M5-05 (#43), D-097 passo 5 |
| PNG dos diagramas Mermaid (`mermaid-cli` não autorizado) | quando for autorizado |
| Teste do link mágico num Android real (browser do WhatsApp, R-05) | M9-05 (#78) |
| *Email OTP Expiration* = 86 400 s no painel (R-06) | M10-01 (#80) |
| Datas-limite das milestones M5–M10 | a definir com o João |

## Próximo passo
M5-01 (#39): configurar os testes (Vitest + Playwright) e o CI — inclui as capturas de referência do Tech antes de qualquer mudança (D-097, passo 0).

## Confirmação do cliente
Aprovação dada pelo João Pereira na sessão de 2026-11-24, registada em Q-074…Q-078 (`registo-perguntas.md`). A integração dos PRs da M4 foi decidida em Q-079.
