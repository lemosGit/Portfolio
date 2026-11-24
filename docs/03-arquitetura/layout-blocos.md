# Layout genérico por blocos — `SERVICE_LAYOUTS`
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M3-05] · Issue: #30 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **Design System V1** (`docs/references/designer_system/`, ADR-004), ADR-001 (`PhaseSource`), `requisitos-funcionais.md` (RF-10.0x, RF-20.05, RF-30.1x, RF-30.34), `docs/references/1/GeniusFrela_Projeto_e_Layouts.md` §4 · Perguntas/decisões usadas: Q-069, Q-070, D-063, D-072…D-075, D-086…D-091, D-092…D-097

## 1. Objetivo
Um serviço novo deve ser **só configuração**: as fases vêm do modelo na BD (M2-01), as cores do `data-service` (ADR-004) e **a composição dos ecrãs deste registo**. As páginas deixam de saber de que serviço é o projeto; pedem ao registo que blocos mostrar.

## 2. Esqueleto comum (igual nos 3 serviços)
```
┌──────────────────────────────────────────────┐
│ [chip do serviço]  Nome do projeto    ⋯ conta │  cabeçalho (marca)
│ Prazo 12 dez · Em curso                       │
│ ●━━━━●━━━━◐━━━━○━━━━○━━━━○━━━━○   (fases)     │  PhaseBar
├──────────────────────────────────────────────┤
│ FASE ATUAL · frase curta                      │  NextStep
│ [ Botão primário do próximo passo ]           │  (1 só botão, RNF-202)
├──────────────────────────────────────────────┤
│ slot "destaque"   (bloco específico)          │
│ slot "estado"     (aprovações · pagamentos)   │
│ slot "detalhes"   (ver detalhes ▸)            │
└──────────────────────────────────────────────┘
│  ⌂ Visão   ▦ Projeto   ▤ Ficheiros   ✉ Msg    │  BottomNav (telemóvel)
```
- **Neutros, tipografia, estados e estrutura são iguais**; muda a cor do módulo (`data-service`) e o conteúdo dos slots (DS V1, regra 2).
- **Um só botão primário por ecrã** (RNF-202), na cor do módulo com texto escuro (D-089).
- O pormenor fica atrás de "ver detalhes" (RF-30.12).

## 3. Navegação (Q-069, Q-070)
| Serviço | Entradas do menu | Notas |
|---|---|---|
| Tech (`development`) | Visão geral · Meu projeto · Entregas · Mensagens · Agenda | **Igual a hoje** (RNF-701) |
| Académico (`academic`) | Visão geral · Projeto · Ficheiros · Mensagens | Sem Agenda (D-092) |
| Design (`design`) | Visão geral · Projeto · Ficheiros · Mensagens | Sem Agenda (D-092) |

- **Rotas mantêm-se** (`/cliente`, `/cliente/projeto`, `/cliente/entregas`, `/cliente/mensagens`, `/cliente/agenda`); muda só o **rótulo** por serviço ("Entregas" → "Ficheiros"). `/cliente/agenda` redireciona para `/cliente` quando o serviço não a tem (D-096).
- **Telemóvel: barra inferior fixa** com os ícones das entradas (4 ou 5), ao alcance do polegar, com `safe-area-inset-bottom`; o botão flutuante do WhatsApp sobe acima dela. **Computador:** a barra lateral atual. Vale para os 3 serviços, incluindo o Tech (D-093).
- O badge de mensagens novas passa para o ícone da barra inferior.

## 4. Catálogo de blocos
Cada bloco é um **componente independente** em `app/cliente/_blocks/`, com uma interface única:

```ts
// app/cliente/_blocks/types.ts
export type BlockId =
  // comuns
  | "phase-bar" | "next-step" | "approvals" | "payments" | "files" | "messages"
  // Tech (extraídos das páginas atuais, sem mudar comportamento)
  | "tech-hero" | "tech-progress" | "tech-needs-client" | "tech-activity" | "tech-week" | "tech-demo" | "tech-meeting" | "tech-tasks"
  // Académico
  | "aca-countdown" | "aca-chapters" | "aca-brief" | "aca-adjustments"
  // Design
  | "des-latest-proof" | "des-rounds" | "des-gallery" | "des-spec" | "des-pickup";

export type BlockProps = { project: ProjectView; data: BlockData };   // dados já carregados
export type BlockDef = {
  id: BlockId;
  component: (p: BlockProps) => React.ReactNode;
  needs: DataKey[];          // o que o loader tem de trazer (ex.: "payments", "deliverables")
  hideWhenEmpty?: boolean;   // ex.: "approvals" só aparece se houver pendentes
};
```

| Bloco | Mostra | RF | Dados |
|---|---|---|---|
| `phase-bar` | Fases com o estado (Concluído, Em curso, Ação sua, Planeado, Atrasada, Não se aplica) | RF-10.03, RF-20.03 | `phases` |
| `next-step` | Fase atual, frase curta, **botão primário** e de quem é a ação | RF-10.04, RF-20.04, RF-30.24 | `phases`, `payments`, `approvals` |
| `approvals` | Aprovações pendentes em destaque; histórico em "ver detalhes" | RF-30.34 | `approvals` |
| `payments` | Total, pago, em falta, lista com estados | RF-30.23 | `payments` |
| `files` | Versões e ficheiros por série; bloqueados com cadeado | RF-30.4x | `deliverables` |
| `messages` | Últimas mensagens + aviso de fora de horário | RF-30.60, RF-30.63 | `feedback` |
| `aca-countdown` | Dias (ou horas) até ao prazo ajustado, etiquetas "Prazo próximo"/"Atrasada" | RF-10.80…83, RF-30.07 | `phases`, `project` |
| `aca-chapters` | "X de Y capítulos" e a lista com estados | RF-10.41, RF-10.42 | `sections` |
| `aca-brief` | Ficha do trabalho (em "ver detalhes") | RF-10.11 | `academicBrief` |
| `aca-adjustments` | Dias de ajustes restantes + "Pedir ajuste" | RF-10.71, RF-10.72 | `adjustments`, `academicBrief` |
| `des-latest-proof` | **Última prova em grande** (pré-visualização) | RF-20.05, RF-20.80 | `deliverables` |
| `des-rounds` | "Ronda X de N" | RF-20.41 | `approvals`, `quote` |
| `des-gallery` | V1, V2, V3… e comparar | RF-20.80…82 | `deliverables` |
| `des-spec` | Ficha técnica (em "ver detalhes") | RF-20.12 | `designSpec` |
| `des-pickup` | Data e local de levantamento, ficheiros finais | RF-20.70, RF-20.71 | `designSpec`, `deliverables` |
| `tech-*` | As secções atuais da Visão geral e de Meu projeto, **extraídas sem alterações** | (existente) | `phases` (GitHub), `meetings`, `demos` |

## 5. O registo `SERVICE_LAYOUTS`
```ts
// lib/portal/service-layouts.ts
export type ServiceLayout = {
  label: string;                         // "Académico"
  dataService: ServiceType;              // valor de data-service (ADR-004)
  phaseSource: PhaseSourceKind;          // ADR-001
  nav: { href: string; label: string; icon: IconName }[];
  pages: {
    overview: { hero: BlockId[]; state: BlockId[]; details: BlockId[] };
    project:  BlockId[];
    files:    BlockId[];
  };
};

export const SERVICE_LAYOUTS: Record<ServiceType, ServiceLayout> = {
  development: {
    label: "Desenvolvimento", dataService: "development", phaseSource: "github",
    nav: [NAV.overview, NAV.project("Meu projeto"), NAV.files("Entregas"), NAV.messages, NAV.agenda],
    pages: {
      // reproduz a ordem atual de app/cliente/(portal)/page.tsx, bloco a bloco
      overview: { hero: ["tech-needs-client", "tech-hero", "tech-progress"], state: ["tech-meeting", "tech-activity", "tech-week"], details: ["tech-demo"] },
      project: ["tech-tasks"],
      files: ["tech-demo", "files"],
    },
  },
  academic: {
    label: "Académico", dataService: "academic", phaseSource: "database",
    nav: [NAV.overview, NAV.project("Projeto"), NAV.files("Ficheiros"), NAV.messages],
    pages: {
      overview: { hero: ["aca-countdown", "next-step"], state: ["approvals", "payments"], details: ["aca-brief"] },
      project: ["phase-bar", "aca-chapters", "aca-adjustments"],
      files: ["files"],
    },
  },
  design: {
    label: "Design", dataService: "design", phaseSource: "database",
    nav: [NAV.overview, NAV.project("Projeto"), NAV.files("Ficheiros"), NAV.messages],
    pages: {
      overview: { hero: ["des-latest-proof", "des-rounds", "next-step", "des-pickup"], state: ["approvals", "payments"], details: ["des-spec"] },
      project: ["phase-bar", "des-gallery"],
      files: ["files"],
    },
  },
};
```
- **Um serviço novo** = uma entrada aqui + um modelo de fases na BD + um bloco `[data-service]` no CSS (+ blocos específicos, se precisar). O esqueleto, a navegação e os blocos comuns não mudam (RNF-703).
- O `phase-bar` e o `next-step` do Tech continuam dentro dos blocos `tech-*` até a migração visual (M5-05) os unificar.

## 6. Carregamento dos dados (D-095)
- Cada página chama **um só loader**: `loadBlocks(project, blockIds)`, que junta os `needs` de todos os blocos e faz **as consultas em paralelo** (`Promise.all`), uma vez por tipo de dado.
- Os blocos **não** fazem consultas próprias: evita pedidos em cascata e mantém a primeira vista dentro dos 2,5 s / 500 KB (RNF-101, RNF-102).
- As leituras usam a sessão do cliente (RLS); a fonte das fases vem de `PhaseSource` (ADR-001).
- Blocos com `hideWhenEmpty` não deixam espaços vazios (ex.: sem aprovações pendentes, o bloco não aparece).

## 7. Primeira vista no telemóvel (360 px, DS V1)
**Design (PER-04)** — RF-20.05: a prova primeiro.
```
┌──────────────────────────────┐
│ ● DESIGN  Convite casamento  │  chip Lilás (tinta + suave)
│ ●━●━●━◐━○━○━○  Revisões      │
│ ┌──────────────────────────┐ │
│ │                          │ │  des-latest-proof
│ │     PROVA V2 (grande)    │ │  pré-visualização ≤ 150 KB
│ │                          │ │
│ └──────────────────────────┘ │
│ Ronda 1 de 2 · restam 1      │  des-rounds
│ [   Aprovar arte   ]         │  next-step: primária Lilás + texto escuro
│  Pedir revisão               │  secundário (tinta + borda)
│ Levantamento: 14 fev · Loja X│  des-pickup
│ ! Aguarda a sua resposta     │  chip coral só quando a ação é do cliente
├──────────────────────────────┤
│ ⌂     ▦     ▤     ✉          │  BottomNav
└──────────────────────────────┘
```
**Académico (PER-03/05)** — RF-10.80: o prazo primeiro.
```
┌──────────────────────────────┐
│ ● ACADÉMICO  Monografia      │  chip Âmbar
│  12 dias                     │  aca-countdown (Display, Space Grotesk 600)
│  até à entrega · 12 dez      │
│ ●━●━●━◐━○━○━○  Desenvolvimento│
│ 3 de 5 capítulos ▓▓▓▓▓▓░░░ 49%│  progresso na primária Âmbar
│ [  Ver rascunho  ]           │  next-step (quando há ação)
├──────────────────────────────┤
│ Pagamentos · Sinal pago ✓    │  payments (resumo)
│ ver detalhes ▸               │  aca-brief
├──────────────────────────────┤
│ ⌂     ▦     ▤     ✉          │
└──────────────────────────────┘
```
Os wireframes finais são da M4 (M4-03 #34, M4-04 #35); estes fixam a **ordem** e os **slots**.

## 8. Plano de migração do layout Tech sem regressões (D-097)
| Passo | O quê | Garantia |
|---|---|---|
| 0 | **Antes de mexer:** testes E2E (Playwright) e capturas de ecrã das 5 páginas do Tech, em 360 px e 1280 px, com os dados de exemplo | Linha de base (M5-01 #39, M9-04 #77) |
| 1 | Extrair as secções atuais de `page.tsx` e `projeto/page.tsx` para blocos `tech-*`, **copiando o JSX sem alterações** | Os testes E2E passam; capturas iguais píxel a píxel |
| 2 | Criar `SERVICE_LAYOUTS.development` com a **ordem atual** e pôr as páginas a renderizar a partir do registo | Capturas iguais; mesmos pedidos ao GitHub |
| 3 | Introduzir o `PhaseSource` (ADR-001) com a fonte `github` | Testes unitários de `toView()` iguais aos de hoje |
| 4 | Acrescentar `academic` e `design` (blocos novos) | Não tocam nos blocos `tech-*` |
| 5 | **Migração visual** para o DS V1 (neutros, Inter, Azul Sistema, barra inferior) — M5-05 #43 | **Mudança visual intencional**: novas capturas de referência aprovadas pelo João; os testes E2E de comportamento continuam a passar |

Os passos 1–3 não mudam **nada** que o cliente do Tech veja; só o passo 5 muda o aspeto, de propósito e com aprovação.

## 9. Decisões
| ID | Decisão |
|---|---|
| D-092 | Académico e Design com 4 entradas (Visão geral, Projeto, Ficheiros, Mensagens); o Tech mantém 5 (Q-069) |
| D-093 | No telemóvel, barra inferior com ícones nos 3 serviços; no computador, a barra lateral (Q-070) |
| D-094 | `SERVICE_LAYOUTS` é código TypeScript (`lib/portal/service-layouts.ts`), não dados na BD |
| D-095 | Um loader por página (`loadBlocks`) com consultas em paralelo; os blocos não consultam dados |
| D-096 | As rotas mantêm-se; muda o rótulo por serviço; `/cliente/agenda` redireciona quando não existe |
| D-097 | Migração do Tech em 5 passos, com capturas de referência; a mudança visual (DS V1) é um passo próprio e aprovado |

## 10. Implementação (M5-06, 2026-11-24)
- `lib/portal/service-layouts.ts`: `SERVICE_LAYOUTS` com `label`, `nav` e `pages.overview` (lista ordenada de blocos, D-126).
- `app/cliente/_blocks/`: `tech.tsx` (as 4 linhas da Visão geral do Tech, sem alterações), `common.tsx` (`phase-bar`, `next-step`, `StateChip`), `index.tsx` (liga ids a componentes; um id sem componente falha no typecheck).
- O menu (barra lateral e barra inferior) e a etiqueta do cabeçalho vêm do registo; `/cliente/agenda` redireciona quando o serviço não a tem.
- O `loadBlocks` (D-095) chega com os primeiros blocos que precisam de dados próprios (aprovações e pagamentos, M5-10/M5-11).
