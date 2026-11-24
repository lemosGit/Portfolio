# ADR-001 — Fases na base de dados (Académico, Design) e no GitHub (Desenvolvimento)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M3-01] · Issue: #26 · Versão: 1.0 · Data: 2026-11-24
> Depende de: `docs/02-modelagem/mer/fases-servicos.md`, `estados/estados.md`, `lib/github/phases.ts`, `lib/portal/phases.ts`, `lib/portal/types.ts`, `lib/portal/data.ts` · Perguntas/decisões usadas: Q-001, Q-062, Q-063, D-001, D-005, D-042…D-046, D-063, D-072…D-075

**Estado:** Aceite · **Data:** 2026-11-24

## Contexto
- Hoje as fases e as tarefas vêm **só do GitHub**. `loadRepoPhases()` lê milestones e issues e agrupa-os nas 6 fases de `PHASES` (`lib/portal/phases.ts`); `toView()` calcula o estado das fases, a % (issues fechadas / total), a fase atual e o gráfico semanal.
- Os projetos **Académico e Design não têm repositório**, duram dias ou semanas, e as fases são avançadas à mão pelo admin (D-001).
- O layout do Desenvolvimento **não pode regredir** (RNF-701) e mantém as 6 fases (D-005).

## Decisão
1. **Duas fontes de fases, uma interface.** `PhaseSource` devolve sempre `Phase[]`:
   - `github`: o código atual (`loadRepoPhases`), sem alterações de comportamento, para `service_type = development`;
   - `database`: lê `project_phases` (+ `academic_sections` para a % do desenvolvimento) com a sessão do utilizador (RLS), para `academic` e `design`.
2. **Mesmo tipo, campos opcionais** (Q-063, D-073). `Phase` ganha campos opcionais que só a fonte `database` preenche. `ProjectView` não muda de forma; as páginas atuais do Desenvolvimento continuam a receber exatamente os mesmos dados.
3. **% do projeto Académico/Design = fases concluídas + parte das fases em curso** (Q-062, D-072), sem contar as fases "não aplicável".
4. A escolha da fonte é feita **uma vez**, em `lib/portal/data.ts`, por `project.service_type`. Nenhuma página escolhe a fonte.

### Interface (esboço para a M5-04, #42)
```ts
// lib/portal/phase-source.ts
export type PhaseSourceKind = "github" | "database";

export interface PhaseSource {
  kind: PhaseSourceKind;
  load(project: ProjectRow): Promise<{ phases: Phase[]; syncedAt: string; source: Project["source"] }>;
}

export const githubSource: PhaseSource = { kind: "github", load: (p) => loadGithubPhases(p.github_owner, p.github_repo, p.phase_map) };
export const databaseSource: PhaseSource = { kind: "database", load: (p) => loadDbPhases(p.id) };

export const sourceFor = (p: ProjectRow): PhaseSource =>
  p.service_type === "development" ? githubSource : databaseSource;
```

```ts
// lib/portal/types.ts — acréscimos, todos opcionais
export type Phase = {
  number: number;            // 1–6 (GitHub) ou position 1–7 (BD)
  title: string; description: string; dueOn?: string; closed: boolean;
  tasks: Task[];             // BD: sempre []
  counts?: { total: number; closedAt: string[] };   // só GitHub
  key?: string;              // BD: ex. "revisoes"
  state?: DbPhaseState;      // BD: por_iniciar | em_curso | aguarda_cliente | concluida | atrasada | nao_aplicavel
  nextStep?: { text: string; owner: "geniusfrela" | "cliente" };
  progress?: number;         // BD: 0–1, da fase (capítulos ou project_phases.progress)
  clientCanUpload?: boolean;
};
export type PhaseStatus = "done" | "current" | "pending" | "skipped";   // "skipped" só na BD
export type Project = { /* … */ serviceType: "development" | "academic" | "design";
  source: "github" | "bd" | "exemplo" | "erro"; };
```

### Como `toView()` trata cada fonte
| Valor | GitHub (sem mudanças) | Base de dados |
|---|---|---|
| `PhaseView.status` | `closed` → `done`; atividade → `current`; senão `pending` | `concluida` → `done` · `nao_aplicavel` → `skipped` · `em_curso`, `aguarda_cliente`, `atrasada` → `current` · `por_iniciar` → `pending` (atrasada automática pela `dueOn`, D-046) |
| `PhaseView.percent` | issues fechadas / total da fase | `progress` × 100 (capítulos concluídos / total, ou `project_phases.progress`); `done` = 100 |
| `currentPhase` | primeira `current`; sem atividade, a primeira por concluir | **a primeira, por `number`, que não é `done` nem `skipped`** (D-063) |
| `percent` do projeto | Σ issues fechadas / Σ issues | **(nº `done` + Σ `progress` das `current`) / nº de fases aplicáveis** (D-072) |
| `total` / `closedCount` | nº de issues | nº de fases aplicáveis / nº de fases `done` |
| `weekly`, `weeklyDelta` | issues fechadas por dia | `[]` e `0`: o gráfico semanal não aparece em Académico e Design (D-074) |
| `recentActivity`, `needsClient` | issues | `[]`: em Académico/Design o "próximo passo" e as aprovações pendentes substituem estas listas (RF-30.34) |
| `syncedAt` | data da leitura do GitHub | agora (leitura direta da BD) |

**Exemplo de %:** Design com 7 fases, `producao` não aplicável (6 aplicáveis), 3 concluídas e `revisoes` em curso sem `progress` → (3 + 0) / 6 = **50%**. Académico com 7 fases, 3 concluídas e `desenvolvimento` em curso com 2 de 5 capítulos → (3 + 0,4) / 7 = **49%**.

## Alternativas consideradas
| Alternativa | Porque não |
|---|---|
| **Tudo na BD, também o Desenvolvimento** | Duplicava o que o GitHub já faz bem (issues, labels, webhook), obrigava a sincronizar e mexia no layout que está em produção (RNF-701) |
| **Repositório GitHub "falso" para Académico e Design** | Um repositório por trabalho académico ou convite: ruído, issues sem sentido para o cliente, e o token precisaria de acesso a mais repositórios |
| **Fases fixas no código** (como `PHASES`) | O admin não conseguiria marcar "não aplicável", próximo passo ou datas sem um deploy; não há histórico para o prazo ajustado |
| **Tipos separados por fonte** (`GithubPhase` / `DbPhase`) | Cada página teria de tratar as duas formas, incluindo as páginas do Desenvolvimento que estão em produção (Q-063) |
| **% só por fases concluídas** ou **pesos por fase** | A primeira fica parada durante dias numa fase longa; a segunda é mais uma configuração para manter (Q-062) |

## Consequências
- **Positivas:** o Desenvolvimento não muda; Académico e Design ganham fases editáveis no admin, com histórico e prazo ajustado; um 4.º serviço é um novo modelo de fases (RNF-703).
- **Negativas / custos:** `toView()` passa a ter dois ramos; `Phase` fica com campos que só uma fonte usa; os dados de exemplo (modo demonstração) têm de ter projetos das duas fontes (M5-14, #52).
- **Testes (M5-01, #39):** testes unitários de `toView()` para as duas fontes, incluindo os exemplos de % acima; os testes E2E do Desenvolvimento garantem a regressão zero (M9-04, #77).
- **Cache:** a fonte GitHub mantém o `revalidate` de 600 s e o webhook; a fonte BD não tem cache (os dados mudam por ação do admin e devem aparecer logo).

## RNF relacionados
RNF-101 (desempenho: a fonte BD é uma consulta só, com as fases e os capítulos) · RNF-302 (RLS: a fonte BD usa a sessão do cliente) · RNF-701 (regressão zero) · RNF-703 (novo serviço sem reescrever)
