# Requisitos funcionais — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefas: [M1-03] RF-10 · [M1-04] RF-20 · [M1-05] RF-30 · Issues: #13, #14, #15 · Versão: 1.0 (RF-10) · Data: 2026-11-23
> Depende de: `visao-modulos.md`, `personas.md`, `docs/references/1/GeniusFrela_Projeto_e_Layouts.md` §5.2 · Perguntas/decisões usadas: Q-005, Q-006, Q-008, Q-010, Q-012…Q-015, D-001, D-009, D-010, D-013…D-016

## Convenções
- **Grupos:** RF-10 Académico · RF-20 Design (M1-04) · RF-30 Blocos comuns (M1-05).
- **Prioridade** é provisória. A versão final sai da M1-08 (MoSCoW).
- **Origem:** `L§x` = documento de layouts · `Q-NNN` = resposta registada · `PER` = implicação das personas.
- Os RF que dependem de um bloco comum (Pagamentos, Aprovações, Ficheiros) remetem para o RF-30 correspondente, que será escrito na M1-05.

---

## RF-10 — Académico

Fluxo: **1** Pedido e briefing → **2** Orçamento e aceite → **3** Estrutura (índice) → **4** Desenvolvimento → **5** Revisão e formatação → **6** Entrega final → **7** Ajustes.

### RF-10.0 Projeto e cabeçalho
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.01 | O admin deve poder criar um projeto com `service_type = academic`, sem repositório GitHub, e o sistema cria as 7 fases a partir do modelo do Académico | PER-01 | Must | L§7, D-001 |
| RF-10.02 | O cliente deve ver, no topo, a etiqueta "Académico" na cor do serviço (âmbar), o prazo de entrega e o estado do projeto | PER-03, PER-05 | Must | L§4, L§5.2 |
| RF-10.03 | O cliente deve ver a barra de fases com as 7 fases e o estado de cada uma (concluída, em curso, a aguardar o cliente, atrasada, por iniciar) | PER-03, PER-05 | Must | L§4, L§6 |
| RF-10.04 | O cliente deve ver a fase atual com uma frase curta e o **próximo passo** (de quem está a ação: GeniusFrela ou o cliente) | PER-03, PER-05 | Must | L§4, PER |

### RF-10.1 Pedido e briefing (fase 1)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.10 | O admin deve registar a **ficha do trabalho**: tema, tipo (trabalho escolar, universitário, relatório, formatação, revisão), nível de ensino, instituição, disciplina, normas (ex.: APA), nº de páginas e prazo | PER-01 | Must | L§5.2 |
| RF-10.11 | O cliente deve ver a ficha do trabalho atrás de "ver detalhes", não na primeira vista | PER-03, PER-05 | Must | L§5.2, `docs/melhorar_designer.txt` |
| RF-10.12 | O cliente deve poder carregar ficheiros de referência (enunciado, normas da instituição, bibliografia, modelos) durante a fase 1 → RF-30 Ficheiros | PER-03, PER-05 | Must | Q-006, D-010 |
| RF-10.13 | O cliente deve poder assinalar um erro na ficha (ex.: prazo errado) por mensagem ligada à fase 1 | PER-03 | Should | L§4 (Mensagens) |

### RF-10.2 Orçamento e aceite (fase 2)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.20 | O admin deve registar o orçamento: valor total, valor do sinal (por omissão 50%) e prazo de entrega → RF-30 Pagamentos | PER-01 | Must | L§5.2, Q-012 |
| RF-10.21 | O cliente deve ver o valor, o sinal, o prazo e um botão **"Aceitar"** → RF-30 Aprovações | PER-03, PER-05 | Must | L§5.2 |
| RF-10.22 | O sistema deve registar o aceite com a data, a hora e o autor | PER-01 | Must | O2 (visão) |
| RF-10.23 | A fase 3 só pode começar depois de **aceite + sinal registado como pago** pelo admin. Antes disso, o próximo passo do cliente mostra "Pagar o sinal" | PER-01, PER-03 | Must | Q-012, D-013 |

### RF-10.3 Estrutura / índice (fase 3)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.30 | O admin deve registar o índice proposto como uma lista ordenada de capítulos ou secções | PER-01 | Must | L§5.2 |
| RF-10.31 | O cliente deve ver o índice e poder **aprovar** ou **pedir alterações** com comentário → RF-30 Aprovações | PER-03 | Must | L§5.2 |
| RF-10.32 | Um pedido de alterações deve voltar a fase 3 a "em curso" e avisar o admin | PER-01 | Must | L§5.2 |
| RF-10.33 | Em trabalhos sem capítulos (ex.: ensino médio), o admin pode marcar a fase 3 como "não aplicável" e ela é saltada | PER-05 | Should | PER, D-014 |

### RF-10.4 Desenvolvimento (fase 4)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.40 | O admin deve marcar cada capítulo como por iniciar, em curso ou concluído | PER-01 | Must | L§5.2 |
| RF-10.41 | O cliente deve ver o progresso como **"X de Y capítulos"** e a % da fase calculada pelos capítulos | PER-03 | Must | L§5.2 |
| RF-10.42 | O cliente vê **só o estado** dos capítulos. Os ficheiros com o texto não ficam disponíveis antes da entrega final | PER-03 | Must | Q-013, D-015 |
| RF-10.43 | Sem capítulos, o progresso mostrado é o da fase (o admin define a % ou só o estado) | PER-05 | Must | PER, D-014 |

### RF-10.5 Revisão e formatação (fase 5)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.50 | O cliente deve ver que o documento está em revisão e que normas estão a ser aplicadas (da ficha) | PER-03 | Must | L§5.2 |
| RF-10.51 | O cliente pode carregar ficheiros de referência adicionais nesta fase (ex.: indicações do orientador) → RF-30 Ficheiros | PER-03 | Should | D-010 |

### RF-10.6 Entrega final (fase 6)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.60 | O admin deve carregar o ficheiro final em **PDF e em Word** → RF-30 Ficheiros | PER-01 | Must | Q-015 |
| RF-10.61 | Os ficheiros finais só ficam disponíveis ao cliente depois de o admin registar o **restante como pago** | PER-01, PER-03 | Must | Q-012, D-013 |
| RF-10.62 | Antes do pagamento do restante, o cliente vê "Entrega pronta, falta pagar o restante" com o valor | PER-03, PER-05 | Must | Q-012 |
| RF-10.63 | O cliente deve receber um email quando a entrega fica disponível | PER-03 | Should | `lib/email` (existente) |
| RF-10.64 | Ao disponibilizar a entrega, o sistema regista a **data de entrega**, que inicia o prazo de ajustes | PER-01 | Must | Q-014 |

### RF-10.7 Ajustes (fase 7)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.70 | O admin deve definir, por projeto, o **nº de dias de ajustes** após a entrega (por omissão 7) | PER-01 | Must | Q-014, D-016 |
| RF-10.71 | O cliente deve ver quantos dias de ajustes restam e poder **pedir um ajuste** com descrição e ficheiro opcional | PER-03, PER-05 | Must | L§5.2, Q-014 |
| RF-10.72 | Depois do prazo de ajustes, o botão é substituído por "Prazo de ajustes terminado — fale connosco", que abre as mensagens | PER-03 | Must | RN (M1-07) |
| RF-10.73 | O admin deve poder carregar uma nova versão (PDF + Word) em resposta a um ajuste. Fica como versão nova, sem apagar a anterior | PER-01 | Must | RF-30 Ficheiros |
| RF-10.74 | O admin deve poder dar o projeto como **concluído**. Sem ação, o projeto conclui-se sozinho quando o prazo de ajustes termina sem pedidos abertos | PER-01 | Should | Assumido (D-016) |

### RF-10.8 Contagem do prazo
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.80 | O cliente deve ver, em destaque na primeira vista, os **dias restantes até ao prazo** de entrega | PER-03, PER-05 | Must | L§5.2 |
| RF-10.81 | Com menos de 2 dias, a contagem deve passar a **horas** | PER-05 | Should | PER (prazos curtos) |
| RF-10.82 | A cor muda para "a aguardar" (`#EAB308`) a ≤ 3 dias e para "atrasado" (`#EF4444`) depois do prazo, com o fuso Africa/Luanda | PER-03, PER-05 | Must | L§6, M6-02 |
| RF-10.83 | Depois da entrega final, a contagem do prazo dá lugar à contagem dos dias de ajustes (RF-10.71) | PER-03 | Should | Q-014 |

---

## RF-20 — Design
*Por escrever em M1-04 (#14).*

## RF-30 — Blocos comuns
*Por escrever em M1-05 (#15). Referências antecipadas pelo RF-10: Pagamentos (sinal/restante, estado pago, valor), Aprovações (aceitar, aprovar/pedir alterações, autor e data), Ficheiros (upload do cliente na fase 1 e 5, upload do admin, versões, disponibilidade condicionada ao pagamento).*
