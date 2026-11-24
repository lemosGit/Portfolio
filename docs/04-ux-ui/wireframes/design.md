# Wireframe — Área do Cliente Design
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-04] · Issue: #35 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **Design System V1** (ADR-004), [`ds.css`](ds.css), `fluxo-telas.md` (TEL-30…TEL-35), `layout-blocos.md` · Decisões usadas: D-017, D-021, D-037, D-049, D-071, D-088, D-105, D-107, D-109, D-110

**Abrir:** [`design.html`](design.html) no browser. **Imagem:** [`img/design.png`](img/design.png).

## O que está desenhado
| Ecrã | TEL | Estado mostrado |
|---|---|---|
| A | TEL-30 | Revisões: prova V2 em grande, "Ronda 1 de 2", Aprovar arte / Pedir revisão, levantamento previsto |
| B | TEL-30 | Arte V3 aprovada, produção travada pelo restante (ação do cliente) |
| C | TEL-30 | Pronto para levantar: data, local, horário, ficheiros digitais, folga até ao evento |
| — | TEL-31 | Galeria (V2 atual marcada) + fases |
| — | TEL-32 | Comparar V1 e V2, uma por cima da outra, com o pedido que levou à V2 |
| — | TEL-33 | Pedir revisão, com o aviso de última ronda incluída |
| — | TEL-34 | Aprovar para produção: aviso, textos-chave, caixa "Confirmo" |
| — | TEL-33 (variante) | Sem rondas incluídas: aprovar ou pedir revisão extra |
| — | TEL-30 (computador) | Prova à esquerda, decisão à direita |

## Decisões de desenho
1. **A prova é a protagonista** (RF-20.05, PER-04): ocupa a primeira vista, numa moldura neutra (Superfície + Borda) para não competir com as cores da arte do cliente. A interface Lilás fica nos botões e nos estados (D-109).
2. **Dois botões, com hierarquia clara:** "Aprovar arte" é o primário (Lilás + texto escuro); "Pedir revisão" é o secundário (tinta + borda), como no DS V1.
3. **A ronda está sempre visível** junto da decisão ("Ronda 1 de 2"), e a folha de revisão avisa quando é a última incluída (RN-35, RN-36).
4. **Sem rondas não é um beco sem saída:** a folha explica as duas saídas e o extra só avança com o valor aceite (RN-07, D-110).
5. **Aprovar exige confirmar** os textos-chave do `snapshot` (Noivos, Data, Local, Quantidade, Versão) com a caixa "Confirmo" (D-071, RN-42). O aviso de irreversibilidade usa o coral, porque é uma ação do cliente com consequência.
6. **Depois da aprovação, o ecrã fala da produção e do levantamento**, não da arte: a decisão já está tomada.
7. **A folga até ao evento** ("tem 9 dias de folga") tranquiliza a PER-04 cujo objetivo é ter tudo antes da data (RF-20.74).

## Verificação
- 360 px sem scroll horizontal; alvos ≥ 44 px; só tokens do DS V1.
- Revisto em captura (Chrome headless): acrescentada a linha de levantamento previsto no estado A, que faltava para cumprir a ordem do RF-20.05.
- As provas são um convite fictício desenhado em SVG (Ana & Paulo), só para o wireframe.

## Para o G2
Confirmar: a prova numa moldura neutra; os dois botões lado a lado com a mesma altura; o texto do aviso de irreversibilidade; a variante "Sem rondas".
