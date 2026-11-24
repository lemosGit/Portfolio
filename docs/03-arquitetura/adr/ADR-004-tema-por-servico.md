# ADR-004 — Tema por serviço: uma base, três módulos
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M3-04] · Issue: #29 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **`docs/references/designer_system/Design System — GeniusFrela@2x.png` (Design System V1, referência obrigatória para todo o design)**, `app/globals.css`, `tailwind.config.ts`, `requisitos-nao-funcionais.md` RNF-204 · Perguntas/decisões usadas: Q-004, Q-067, Q-068, D-004 (substituída), D-086…D-091, PA-003

**Estado:** Aceite · **Data:** 2026-11-24

## Contexto
- O portal tem hoje o tema "aurora" (base ameixa `#110d18`, lavanda e violeta), aplicado pela classe `.app` (`app/globals.css`).
- A D-004 (2026-11-23) mantinha essa base e acrescentava acentos por serviço (ciano, âmbar `#F59E0B`, magenta). Ao verificar o contraste, vários desses acentos falhavam o AA (RNF-204) e o amarelo de "a aguardar" (`#EAB308`) confundia-se com o âmbar do Académico.
- Em 2026-11-24 o João entregou o **Design System V1** e pediu que **todas as tarefas de design** se baseiem nele (Q-067): *"Uma base, três módulos"*. A base fica profissional e igual em todo o lado; cada módulo recebe um acento suave, de baixa saturação, para o cliente saber sempre em que área está.

## Decisão

### 1. Neutros base — iguais nos 3 serviços (substituem a base ameixa)
| Token | Papel | Hex |
|---|---|---|
| `--n-night` | Noite (fundo da página) | `#0B0F17` |
| `--n-surface` | Superfície (cartões) | `#111723` |
| `--n-raised` | Elevada (cartões sobre cartões, campos) | `#172033` |
| `--n-border` | Borda | `#232D42` |
| `--n-ink-2` | Texto 2 (secundário) | `#9AA4B8` |
| `--n-ink` | Texto | `#E8ECF4` |

### 2. Marca e estados partilhados
| Token | Papel | Hex | Uso |
|---|---|---|---|
| `--brand-violet` | Violeta Genius | `#8B7CF6` | marca: portal público, cabeçalhos, login, admin |
| `--brand-blue` | Azul Genius | `#4C8DFF` | marca (com o violeta) |
| `--state-done` | Concluído | `#5BD69A` | fase/aprovação/pagamento concluídos |
| `--state-action` | **Ação sua** | `#FF8A7A` | **só** quando a ação é do cliente: "Aguarda a sua resposta", pagar, aprovar |
| `--state-planned` | Planeado | `#5C6780` | por iniciar; **só como ponto ou borda** (o texto do chip usa `--n-ink-2`) |
| `--whatsapp` | WhatsApp | `#25D366` | botões do WhatsApp |

**Em curso** usa a cor do módulo. **Atrasada** (atraso da GeniusFrela) continua na cor do módulo com a etiqueta "Atrasada" e a nova data no próximo passo; **não** usa o coral, para o cliente não pensar que a ação é dele (Q-068, D-088). **Não se aplica** usa o estilo de Planeado, com o texto "Não se aplica".

### 3. Acentos por módulo — `data-service` no layout
| Módulo (`service_type`) | Nome | `--m-primary` | `--m-soft` | `--m-tint` | `--m-on` |
|---|---|---|---|---|---|
| Tech (`development`) | **Azul Sistema** | `#4C8DFF` | `#9CC0FF` | `#13213D` | `#0A1530` |
| Design (`design`) | **Lilás Criativo** | `#A78BFA` | `#D2C4FF` | `#231B3F` | `#170F2E` |
| Académico (`academic`) | **Âmbar Saber** | `#E8B65A` | `#F5D79A` | `#2E2412` | `#221A08` |

Papéis: **primária** = botão primário, barra de progresso, fase ativa · **suave** = texto e ligações coloridas, texto do chip e do botão secundário · **tinta** = fundo do botão secundário e do chip · **sobre** = texto em cima da primária e fundo do chip "Em curso".

```css
/* app/globals.css — esboço para a M5-05 (#43) */
.app { --n-night: 11 15 23; --n-surface: 17 23 35; --n-raised: 23 32 51; /* … */ }
.app[data-service="development"] { --m-primary: #4C8DFF; --m-soft: #9CC0FF; --m-tint: #13213D; --m-on: #0A1530; }
.app[data-service="design"]      { --m-primary: #A78BFA; --m-soft: #D2C4FF; --m-tint: #231B3F; --m-on: #170F2E; }
.app[data-service="academic"]    { --m-primary: #E8B65A; --m-soft: #F5D79A; --m-tint: #2E2412; --m-on: #221A08; }
```
O layout da Área do Cliente põe `data-service={project.serviceType}` no elemento `.app`. Os componentes usam **só** os tokens (`--m-*`, `--n-*`, `--state-*`), nunca hex soltos. O admin, o login e o portal público não têm `data-service`: usam a marca.

### 4. Regras de uso (do Design System V1)
1. **O acento do módulo só aparece dentro do seu serviço:** botão primário, fase ativa, progresso, ligações.
2. **Neutros, tipografia e estados são iguais nos três:** muda a cor, não a estrutura.
3. **Portal público e cabeçalhos usam a marca** (violeta + azul).
4. **Botão primário:** fundo `--m-primary`, texto `--m-on` (escuro), peso 600. **Nunca texto branco** sobre a primária (falha o contraste).
5. **Botão secundário:** fundo `--m-tint`, texto `--m-soft`, **borda `--n-border`** (a tinta sozinha não se distingue da superfície: 1,1:1).
6. **Chip de estado:** ponto + texto; "Em curso" = fundo `--m-on`, texto `--m-soft`.

### 5. Tipografia, espaçamento e raio
| Nível | Letra | Peso · tamanho/linha |
|---|---|---|
| Display | Space Grotesk | 600 · 44/52 |
| Título de secção | Space Grotesk | 600 · 28/36 |
| Subtítulo de cartão | Inter | 600 · 18/28 |
| Corpo | Inter | 400 · 15/24 |
| Etiqueta | Inter | 600 · 12, maiúsculas, +12% de espaçamento |

- **Espaçamento:** 4 · 8 · 12 · 16 · 24 · 32 · 48. **Raio:** 8 · 12 · 20 · pill.
- O projeto já tem Space Grotesk (`@fontsource-variable/space-grotesk`). O **Inter** entra na M5-05 (`@fontsource-variable/inter`) e substitui o Manrope **na `.app`**; o portal público mantém as suas letras até ser revisto (D-090).

### 6. Contraste verificado (WCAG 2.1, calculado em 2026-11-24)
| Cor | sobre Noite | sobre Superfície | sobre Elevada | Uso permitido |
|---|---|---|---|---|
| Texto `#E8ECF4` | 16,2 | 15,2 | 13,7 | texto |
| Texto 2 `#9AA4B8` | 7,7 | 7,2 | 6,5 | texto |
| Violeta `#8B7CF6` | 5,8 | 5,4 | 4,9 | texto e UI |
| Azul `#4C8DFF` (Tech primária) | 6,0 | 5,6 | 5,1 | texto e UI |
| Lilás `#A78BFA` (Design primária) | 7,1 | 6,6 | 6,0 | texto e UI |
| Âmbar `#E8B65A` (Académico primária) | 10,3 | 9,6 | 8,7 | texto e UI |
| Suaves `#9CC0FF` / `#D2C4FF` / `#F5D79A` | ≥ 10,4 | ≥ 9,7 | ≥ 8,8 | texto |
| Concluído `#5BD69A` | 10,5 | 9,9 | 8,9 | texto e UI |
| Ação sua `#FF8A7A` | 8,4 | 7,8 | 7,1 | texto e UI |
| Planeado `#5C6780` | 3,4 | 3,2 | **2,9** | **só ponto/borda** sobre Noite e Superfície |

| Combinação | Contraste | Resultado |
|---|---|---|
| `--m-on` sobre primária (texto do botão) | Tech 5,6 · Design 6,7 · Académico 9,2 | ✅ AA |
| Branco sobre primária | Tech 3,2 · Design 2,7 · Académico 1,9 | ❌ não usar |
| Suave sobre tinta (botão secundário) | Tech 8,7 · Design 10,1 · Académico 10,9 | ✅ AA |
| Suave sobre "sobre" (chip Em curso) | Tech 9,8 · Design 11,4 · Académico 12,4 | ✅ AA |

Todas as combinações usadas passam **AA** (≥ 4,5:1 em texto; ≥ 3:1 em elementos gráficos), com a única restrição do Planeado.

## Alternativas consideradas
| Alternativa | Porque não |
|---|---|
| Manter a base ameixa e os acentos da D-004 | Substituída pelo Design System V1 (Q-067); vários acentos falhavam o AA e o amarelo de estado colidia com o âmbar |
| Um tema completo por serviço (fundos diferentes) | O cliente perderia a sensação de uma só plataforma; o DS pede "muda a cor, não a estrutura" |
| Cores do módulo em classes Tailwind por serviço (`bg-amber-…`) | Espalhava hex pelos componentes; com tokens, um 4.º serviço é só um bloco `[data-service=…]` (RNF-703) |

## Consequências
- **Positivas:** contraste AA em todas as combinações; um só sítio para mudar cores; o cliente reconhece o serviço pela cor; o Tech ganha uma identidade (Azul Sistema) e deixa de partilhar o violeta da marca.
- **Custos:** a M5-05 (#43) muda os neutros de `.app` de ameixa para os neutros do DS e o Manrope para o Inter na Área do Cliente e no admin. **É uma mudança visual no Desenvolvimento**, mas não de comportamento (RNF-701 continua a valer para o comportamento); a regressão visual é revista na M9-04 (#77). O botão violeta atual passa a botão primário do módulo (ou da marca, no admin).
- **Pedido de alteração PA-003** (aprovado): D-004 substituída; RF-20.02, RF-10.82 e RF-30.11 atualizados.

## RNF relacionados
RNF-204 (contraste AA) · RNF-205 (acessibilidade de base) · RNF-703 (novo serviço sem reescrever)
