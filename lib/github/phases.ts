/**
 * Lê milestones e issues de um repositório do GitHub e converte-os nas 6 fases
 * que o cliente vê. Corre apenas no servidor: o GITHUB_TOKEN nunca chega ao browser.
 *
 * Convenções (iguais às do roteiro de engenharia, ver docs/especificacao_portal_cliente.md §6):
 * - milestones "Mx — …" agrupados pelo DEFAULT_PHASE_MAP (ou por projects.phase_map);
 * - só issues com a label `cliente: visível` aparecem como tarefas, mas todas contam para a %;
 * - labels `estado: …` e o assignee definem a situação de cada tarefa.
 */
import { DEFAULT_PHASE_MAP, PHASES, milestoneCode } from "@/lib/portal/phases";
import type { Phase, Task } from "@/lib/portal/types";

const API = "https://api.github.com";
/** Tempo máximo em cache; o webhook (/api/github/webhook) invalida antes disso. */
export const GITHUB_REVALIDATE = 600;

export const VISIBLE_LABEL = "cliente: visível";

export const githubTag = (owner: string, repo: string) => `gh:${owner}/${repo}`.toLowerCase();

type GhLabel = { name: string };
type GhMilestone = { number: number; title: string; state: "open" | "closed"; due_on: string | null };
type GhIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: (GhLabel | string)[];
  assignees: unknown[] | null;
  milestone: { number: number } | null;
  closed_at: string | null;
  updated_at: string;
  pull_request?: unknown;
};

export class GithubError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

/** "Cliente: Visível" e "cliente: visivel" contam como a mesma label. */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const VISIBLE = norm(VISIBLE_LABEL);

async function gh<T>(path: string, owner: string, repo: string, dates?: string[]): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GithubError("Falta GITHUB_TOKEN nas variáveis de ambiente.");
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: GITHUB_REVALIDATE, tags: [githubTag(owner, repo)] },
  });
  if (!res.ok) {
    const hint =
      res.status === 404
        ? "repositório não encontrado ou sem acesso pelo token"
        : res.status === 401
          ? "token inválido ou expirado"
          : res.status === 403
            ? "sem permissão ou limite de pedidos atingido"
            : res.statusText;
    throw new GithubError(`GitHub ${res.status} em ${owner}/${repo}: ${hint}.`, res.status);
  }
  // Com a cache do Next.js, o cabeçalho Date diz quando o GitHub foi realmente lido.
  const date = res.headers.get("date");
  if (date && dates) dates.push(new Date(date).toISOString());
  return res.json() as Promise<T>;
}

async function listAll<T>(path: string, owner: string, repo: string, dates: string[]): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= 10; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const batch = await gh<T[]>(`${path}${sep}per_page=100&page=${page}`, owner, repo, dates);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

const labelNames = (i: GhIssue) => i.labels.map((l) => norm(typeof l === "string" ? l : l.name));

const AREA: Record<string, Task["area"]> = {
  frontend: "Frontend",
  mobile: "Mobile",
  backend: "Backend",
  database: "Backend",
  devops: "Infra",
  arquitetura: "Infra",
  "ux-ui": "Design",
  qa: "Qualidade",
};

function toTask(i: GhIssue): Task {
  const labels = labelNames(i);
  const areaLabel = labels.find((l) => l.startsWith("area:"))?.slice(5).trim();
  let stage: Task["stage"];
  if (i.state === "open") {
    if (labels.includes("estado: precisa-info")) stage = "needs-client";
    else if (labels.includes("estado: bloqueado")) stage = "waiting";
    else if (labels.includes("estado: em-revisao")) stage = "review";
    else if (i.assignees?.length) stage = "progress";
  }
  return {
    number: i.number,
    // "[M7-04] Tela de login" → "Tela de login": o código é interno.
    title: i.title.replace(/^\s*\[[^\]]*\]\s*/, "").trim() || i.title,
    area: (areaLabel && AREA[areaLabel]) || "Produto",
    state: i.state,
    stage,
    closedAt: i.closed_at ?? undefined,
    updatedAt: i.updated_at,
  };
}

export type RepoPhases = { phases: Phase[]; visibleRule: "label" | "fallback"; fetchedAt: string };

/**
 * Converte o repositório nas 6 fases.
 * Enquanto nenhuma issue tiver a label `cliente: visível`, mostra as issues
 * `tipo: feature` e `tipo: bug` (regra provisória, ver §12 da especificação).
 */
export async function loadRepoPhases(
  owner: string,
  repo: string,
  phaseMap: Record<string, number> | null = null,
): Promise<RepoPhases> {
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const dates: string[] = [];
  const [milestones, items] = await Promise.all([
    listAll<GhMilestone>(`${base}/milestones?state=all`, owner, repo, dates),
    listAll<GhIssue>(`${base}/issues?state=all`, owner, repo, dates),
  ]);
  const issues = items.filter((i) => !i.pull_request);

  const map = { ...DEFAULT_PHASE_MAP, ...(phaseMap ?? {}) };
  const phaseOfMilestone = new Map<number, number>();
  for (const m of milestones) {
    const code = milestoneCode(m.title);
    const phase = code ? map[code] : undefined;
    if (phase) phaseOfMilestone.set(m.number, phase);
  }

  const anyLabelled = issues.some((i) => labelNames(i).includes(VISIBLE));
  const isVisible = (i: GhIssue) => {
    const labels = labelNames(i);
    return anyLabelled ? labels.includes(VISIBLE) : labels.includes("tipo: feature") || labels.includes("tipo: bug");
  };

  const phases: Phase[] = PHASES.map((def) => {
    const ms = milestones.filter((m) => phaseOfMilestone.get(m.number) === def.number);
    const phaseIssues = issues.filter((i) => i.milestone && phaseOfMilestone.get(i.milestone.number) === def.number);
    const open = phaseIssues.filter((i) => i.state === "open").length;
    const dues = ms.map((m) => m.due_on).filter((d): d is string => !!d).sort();
    return {
      ...def,
      dueOn: dues.at(-1),
      closed: ms.length > 0 && (ms.every((m) => m.state === "closed") || (phaseIssues.length > 0 && open === 0)),
      tasks: phaseIssues
        .filter(isVisible)
        .map(toTask)
        // Primeiro o que já foi feito (por data), depois o que falta (por número).
        .sort(
          (a, b) =>
            Number(b.state === "closed") - Number(a.state === "closed") ||
            (a.closedAt ?? "").localeCompare(b.closedAt ?? "") ||
            a.number - b.number,
        ),
      counts: {
        total: phaseIssues.length,
        closedAt: phaseIssues.filter((i) => i.state === "closed" && i.closed_at).map((i) => i.closed_at!),
      },
    };
  });

  return {
    phases,
    visibleRule: anyLabelled ? "label" : "fallback",
    fetchedAt: dates.sort()[0] ?? new Date().toISOString(),
  };
}

/** Fases vazias, para quando o projeto ainda não tem repositório ou a leitura falha. */
export function emptyPhases(): Phase[] {
  return PHASES.map((def) => ({ ...def, closed: false, tasks: [], counts: { total: 0, closedAt: [] } }));
}

/* ───────────── Painel /admin ───────────── */

export type AdminIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  phase: number | null; // 1–6, ou null se a issue não tem milestone mapeado
  milestone: string | null;
  labels: string[];
  /** Tem a label `cliente: visível`. */
  labelled: boolean;
  /** O cliente vê esta issue hoje (pela label, ou pela regra provisória). */
  visible: boolean;
};

/** Todas as issues do repositório, com a fase e a visibilidade para o cliente. */
export async function loadRepoIssues(
  owner: string,
  repo: string,
  phaseMap: Record<string, number> | null = null,
): Promise<{ issues: AdminIssue[]; visibleRule: "label" | "fallback" }> {
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const dates: string[] = [];
  const [milestones, items] = await Promise.all([
    listAll<GhMilestone & { title: string }>(`${base}/milestones?state=all`, owner, repo, dates),
    listAll<GhIssue & { milestone: { number: number; title: string } | null }>(`${base}/issues?state=all`, owner, repo, dates),
  ]);
  const map = { ...DEFAULT_PHASE_MAP, ...(phaseMap ?? {}) };
  const phaseOf = new Map<number, number>();
  for (const m of milestones) {
    const code = milestoneCode(m.title);
    if (code && map[code]) phaseOf.set(m.number, map[code]);
  }
  const issues = items.filter((i) => !i.pull_request);
  const anyLabelled = issues.some((i) => labelNames(i).includes(VISIBLE));

  return {
    visibleRule: anyLabelled ? "label" : "fallback",
    issues: issues
      .map((i) => {
        const labels = labelNames(i);
        const labelled = labels.includes(VISIBLE);
        return {
          number: i.number,
          title: i.title,
          state: i.state,
          phase: i.milestone ? (phaseOf.get(i.milestone.number) ?? null) : null,
          milestone: i.milestone?.title ?? null,
          labels: i.labels.map((l) => (typeof l === "string" ? l : l.name)),
          labelled,
          visible: anyLabelled ? labelled : labels.includes("tipo: feature") || labels.includes("tipo: bug"),
        };
      })
      .sort((a, b) => (a.phase ?? 99) - (b.phase ?? 99) || a.number - b.number),
  };
}

/** Adiciona ou remove a label `cliente: visível` (o token precisa de Issues: Read and write). */
export async function setIssueVisible(owner: string, repo: string, numbers: number[], visible: boolean) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GithubError("Falta GITHUB_TOKEN nas variáveis de ambiente.");
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const base = `${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`;
  for (const n of numbers) {
    const res = visible
      ? await fetch(`${base}/${n}/labels`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ labels: [VISIBLE_LABEL] }),
          cache: "no-store",
        })
      : await fetch(`${base}/${n}/labels/${encodeURIComponent(VISIBLE_LABEL)}`, { method: "DELETE", headers, cache: "no-store" });
    // 404 ao remover = a issue já não tinha a label.
    if (!res.ok && !(res.status === 404 && !visible)) {
      const hint =
        res.status === 403
          ? "o token não tem permissão de escrita (Issues: Read and write)"
          : res.status === 401
            ? "token inválido ou expirado"
            : res.statusText;
      throw new GithubError(`GitHub ${res.status} na issue #${n}: ${hint}.`, res.status);
    }
  }
}
