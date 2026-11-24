# Wireframe — Área do Cliente Académico
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-03] · Issue: #34 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **Design System V1** (ADR-004), `fluxo-telas.md` (TEL-10, 11, 13, 14, 20), `layout-blocos.md` · Perguntas/decisões usadas: Q-073, D-014, D-015, D-049, D-071, D-088, D-105, D-107, D-108

**Abrir:** [`academico.html`](academico.html) no browser (usa [`ds.css`](ds.css), os tokens do DS V1). **Imagem:** [`img/academico.png`](img/academico.png).

## O que está desenhado
| Ecrã | TEL | Estado mostrado |
|---|---|---|
| A | TEL-10 | Fase 2 — orçamento por aceitar (ação do cliente, coral) |
| B | TEL-10 | Fase 4 — em desenvolvimento, 3 de 5 capítulos (sem ação do cliente) |
| C | TEL-10 | Fase 6 — entrega pronta, restante por pagar, prazo a 2 dias |
| D | TEL-10 | Fase 7 — ajustes, ficheiros disponíveis |
| — | TEL-11 | Projeto: 7 fases na vertical, capítulos dentro da fase em curso |
| — | TEL-20 | Folha "Orçamento" com o snapshot e a regra do sinal |
| — | TEL-14 | Folha "Pedir um ajuste" com dias restantes e anexo |
| — | TEL-13 | Folha "Detalhes do trabalho" |
| — | TEL-10 (computador) | Barra lateral + duas colunas |

## Decisões de desenho
1. **A contagem do prazo é o elemento principal** (Space Grotesk 600, 96 px no telemóvel, 120 px no computador, na primária Âmbar). Responde ao medo nº 1 da PER-03: falhar o prazo (RF-10.80). Depois da entrega passa a contar os dias de ajustes (RF-10.83).
2. **O botão primário só aparece quando a ação é do cliente** (estados A e C). No estado B não há botão: "Não precisa de fazer nada" é a mensagem (RNF-202, D-107).
3. **Coral só para "Aguarda a sua resposta"**; "Prazo próximo" e "Atrasada" usam a cor do módulo (D-088).
4. **A barra de fases é segmentada** (7 traços) com "Fase N de 7" e o nome da fase: cabe a 360 px sem nomes cortados; os nomes completos estão na TEL-11 (D-108).
5. **Capítulos só com título e estado**, nunca o texto (D-015). Sem capítulos (D-014), a TEL-11 mostra só a % da fase.
6. **A regra do sinal aparece antes do botão** "Aceitar orçamento" (RN-13), em linguagem simples.
7. **"Pedir ajuste" explica o que está incluído** numa frase (RN-31, RN-32).
8. **Texto curto e no "você"** do resto do portal; nada de termos técnicos (RNF-206).
9. **WhatsApp flutuante** acima da barra inferior; no computador, botão na barra lateral.

## Verificação
- 360 px sem scroll horizontal (RNF-201); alvos de toque ≥ 44 px (botões 48 px, RNF-203).
- Só tokens do DS V1 (`ds.css`); contraste conforme o ADR-004 §6 (texto do botão primário em `--m-on`).
- Revisto em captura (Chrome headless): corrigida a sobreposição do botão do WhatsApp com a lista de ficheiros no estado C.

## Para o G2
Pontos que o João deve confirmar: o tamanho da contagem; a ausência de botão no estado B; o texto da regra do sinal; a barra de fases segmentada.
