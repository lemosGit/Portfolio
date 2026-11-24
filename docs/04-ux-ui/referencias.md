# Referências visuais
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-01] · Issue: #32 · Versão: 1.0 · Data: 2026-11-24
> Depende de: ADR-004, `docs/03-arquitetura/layout-blocos.md` · Perguntas/decisões usadas: Q-067, D-086, D-103, D-104

## Hierarquia (o que manda quando há conflito)
1. **Design System V1** — referência obrigatória de cores, tipografia, espaçamento, raio, estados e botões (Q-067, D-086).
2. **Logótipo GeniusFrela** — marca no cabeçalho, login, ícone da aplicação.
3. **Documento de layouts** — o *quê* de cada serviço (fases, blocos), não o aspeto.
4. **Capturas do portal atual e da referência JP Studio** — estrutura, ritmo e tom de voz; **as cores e as letras delas já não valem**.

As referências ficam em `docs/references/` (já citadas em muitos documentos), e não em `docs/04-ux-ui/referencias/` como sugere a metodologia (D-103).

## Fichas

### R1 — Design System V1 ★
`docs/references/designer_system/Design System — GeniusFrela@2x.png` (2880 × 3920)

| Aproveita-se | Não se aproveita |
|---|---|
| Tudo: neutros Noite/Superfície/Elevada/Borda/Texto, marca violeta + azul, estados (Concluído, Ação sua, Planeado, WhatsApp), os 3 módulos com primária/suave/tinta/sobre, botões primário/secundário por módulo, chip "Em curso", barra "Fase 3 de 5 · 60%", tipografia Space Grotesk + Inter, espaçamento 4–48, raio 8/12/20/pill | — |
| As 3 regras: acento só dentro do serviço · muda a cor, não a estrutura · portal público e cabeçalhos usam a marca | |
| Tom: "Perfeita qualidade mora aqui"; descrições de módulo curtas ("Preciso, técnico, de confiança"…) | |

Formalizado no ADR-004.

### R2 — Logótipo GeniusFrela
`docs/references/logo/`: `Principal — fundo escuro@2x.png` (horizontal), `Versão vertical@1x.png`, `Ícone avatar@1x.png` (quadrado arredondado)

| Aproveita-se | Não se aproveita |
|---|---|
| "G" em arco com ponto, gradiente violeta → azul → ciano; "Genius" branco + "Frela" no gradiente | Fundo escuro do ficheiro (`~#0E0C18`) — o fundo do portal é o Noite do DS |
| Horizontal no cabeçalho do computador e no login; ícone na barra do telemóvel, favicon e PWA; vertical no ecrã do link mágico | O ciano do gradiente **não** é cor de interface (só existe no logótipo) |

Já existe em código: `components/BrandMark.tsx`.

### R3 — Documento de layouts por serviço
`docs/references/1/GeniusFrela_Projeto_e_Layouts.md`

| Aproveita-se | Não se aproveita |
|---|---|
| §2 jornada, §4 esqueleto comum, §5.2–5.3 fases e blocos de Académico e Design, §7 nota técnica | §6 paleta (`#0B0F1A`, `#7C3AED`, cores por serviço) — **substituída pelo DS V1** (PA-003) |
| | 7 fases no Tech (fica com 6, D-005) |
| | Horário "segunda a sexta, 18h–21h" (§2) — passou a todos os dias, 08h–20h (D-036) |

### R4 — Referência "JP Studio" (Visão geral, 2 capturas)
`docs/references/1/1-reference.png`, `docs/references/1/2-reference.png` (1818 × 857)

| Aproveita-se | Não se aproveita |
|---|---|
| Estrutura de painel: barra lateral com "Projeto ativo" e progresso, cabeçalho com saudação, grelha de cartões | Marca "JP Studio" e o roxo saturado |
| Roadmap horizontal com pontos numerados e linha (→ `phase-bar`) | Anel de progresso grande + gráfico semanal na 1.ª vista (só Tech, D-074) |
| Cartão "Próxima reunião" com a data em grande (→ ideia para `aca-countdown`: número grande + legenda) | "Sincronizado com GitHub", "GitHub sync" — linguagem técnica (RNF-206, `melhorar_designer.txt`) |
| Cartão "Canal direto" com campo de mensagem e "normalmente responde em…" (→ `messages` + aviso de horário RN-52) | Textos longos de boas-vindas |

### R5 — Portal atual em produção (3 capturas, 2026-11-21)
`docs/references/2/Captura de ecrã de 2026-11-21 14-28-25.png` (Visão geral), `…14-28-32.png` (O meu projeto), `…14-28-38.png` (Reuniões)

| Aproveita-se | Não se aproveita |
|---|---|
| Tom de voz próximo e curto: "Cada etapa, um passo mais perto", "Já podes espreitar.", "Um momento para conversar, alinhar e avançar." | Base ameixa e lavanda (substituídas pelo DS V1) |
| Etapas com ✓, ponto atual destacado e datas por baixo (→ `phase-bar`) | Rótulo "Modo demonstração" visível ao cliente |
| "O que há de novo" com ícone + frase + "há 2 dias" (→ atividade do Tech) | Excesso de texto na 1.ª vista (o utilizador já pediu para simplificar) |
| % grande "do caminho feito" (→ `percent` do ADR-001) | |
| Cartão de reunião com data em bloco e "O que vamos conversar" (Tech) | |
| Separadores Etapas · Tarefas · Demonstração em "O meu projeto" (Tech) | |

### R6 — Pedido de simplificação do cliente
`docs/melhorar_designer.txt` (pedido do João)

| Aproveita-se |
|---|
| Remover frases de enquadramento; % maior; sem "47 de 56 tarefas" nem "ligado ao GitHub" na 1.ª vista; imagem do projeto ao fundo do resumo; "ver detalhes ▸" em todas as navegações; **não mexer nas cores** fora do DS |

Já aplicado no PR #10 e refletido em RF-30.12 e no `layout-blocos.md`.

## Lacunas (pedir antes de desenhar a M4-03 e a M4-04)
- **Referências do cliente final** de Académico e Design (ex.: apps ou sites de que a PER-03/PER-04 gostam, exemplos de galerias de provas) — opcionais; sem elas, segue-se o DS V1.
- **Exemplos do que não se quer** — nenhum registado.
