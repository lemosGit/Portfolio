/**
 * Camada de dados do portal.
 * - fases e tarefas → API do GitHub (lib/github/phases.ts)
 * - restantes dados → Supabase (supabase-repo.ts) ou dados de exemplo
 * As páginas só usam estas funções, por isso a troca fica isolada aqui.
 */
import { emptyPhases, loadRepoPhases } from "@/lib/github/phases";
import { clients, feedbackSeed, projects } from "./mock-data";
import type { Client, Feedback, PhaseView, Project, ProjectView } from "./types";
import { now as clockNow, nowMs } from "@/lib/clock";

const DAY = 86_400_000;

export async function getClient(id: string): Promise<Client | undefined> {
  return clients.find((c) => c.id === id);
}

export async function findClientByEmail(email: string): Promise<Client | undefined> {
  return clients.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
}

export async function getActiveProject(clientId: string): Promise<ProjectView | undefined> {
  const project = projects.find((p) => p.clientId === clientId);
  if (!project) return undefined;
  // Pré-visualização local: PORTAL_DEMO_REPO=dono/repositorio mostra as fases reais
  // desse repositório dentro do projeto de exemplo (precisa de GITHUB_TOKEN).
  const demoRepo = process.env.PORTAL_DEMO_REPO?.split("/");
  if (demoRepo?.length === 2) {
    const [owner, name] = demoRepo;
    return toView({ ...project, repo: { owner, name }, ...(await syncPhases(owner, name)) });
  }
  return toView(project);
}

/** Fases do projeto lidas do GitHub. Se a leitura falhar, devolve fases vazias e o motivo. */
export async function syncPhases(
  owner: string | null | undefined,
  repo: string | null | undefined,
  phaseMap: Record<string, number> | null = null,
): Promise<Pick<Project, "phases" | "source" | "syncedAt">> {
  const now = clockNow().toISOString();
  if (!owner || !repo) return { phases: emptyPhases(), source: "erro", syncedAt: now };
  try {
    const r = await loadRepoPhases(owner, repo, phaseMap);
    return { phases: r.phases, source: "github", syncedAt: r.fetchedAt };
  } catch (e) {
    console.error(`[portal] Falha a ler o GitHub (${owner}/${repo}):`, e instanceof Error ? e.message : e);
    return { phases: emptyPhases(), source: "erro", syncedAt: now };
  }
}

export function toView(p: Project): ProjectView {
  const phaseViews: PhaseView[] = p.phases.map((ph) => {
    const total = ph.counts?.total ?? ph.tasks.length;
    const closedCount = ph.counts?.closedAt.length ?? ph.tasks.filter((t) => t.state === "closed").length;
    const active = closedCount > 0 || ph.tasks.some((t) => t.stage);
    const status: PhaseView["status"] = ph.closed ? "done" : active ? "current" : "pending";
    return { ...ph, total, closedCount, status, percent: total ? Math.round((closedCount / total) * 100) : 0 };
  });
  // Sem atividade ainda: a fase atual é a primeira por concluir.
  if (!phaseViews.some((ph) => ph.status === "current")) {
    const next = phaseViews.find((ph) => ph.status !== "done");
    if (next) next.status = "current";
  }

  const all = p.phases.flatMap((ph) => ph.tasks.map((t) => ({ ...t, phase: ph.title })));
  // Datas de fecho de todas as issues (visíveis ou não), para o gráfico semanal.
  const closedDates = p.phases.flatMap(
    (ph) => ph.counts?.closedAt ?? ph.tasks.filter((t) => t.closedAt).map((t) => t.closedAt!),
  );
  const total = phaseViews.reduce((s, ph) => s + ph.total, 0);
  const closedTotal = phaseViews.reduce((s, ph) => s + ph.closedCount, 0);
  const now = nowMs();

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(now - (6 - i) * DAY);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + DAY;
    return {
      day: dayStart.toLocaleDateString("pt-PT", { weekday: "short" }).replace(".", ""),
      closed: closedDates.filter((d) => {
        const c = new Date(d).getTime();
        return c >= dayStart.getTime() && c < dayEnd;
      }).length,
    };
  });
  const closedThisWeek = weekly.reduce((s, d) => s + d.closed, 0);
  // Em paralelo pode haver várias fases em curso; a fase atual é a primeira por concluir
  // (fechar uma tarefa avulsa da entrega não faz o projeto "saltar" para essa fase).
  const current = phaseViews.find((ph) => ph.status === "current");

  const sortedMeetings = [...p.meetings].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const latest = (kind: "web" | "app") =>
    p.demos
      .filter((d) => (kind === "web" ? d.kind === "web" : d.kind !== "web"))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

  return {
    ...p,
    phaseViews,
    currentPhase: current ?? phaseViews[phaseViews.length - 1],
    total,
    closedCount: closedTotal,
    percent: total ? Math.round((closedTotal / total) * 100) : 0,
    weekly,
    weeklyDelta: total ? Math.round((closedThisWeek / total) * 100) : 0,
    nextMeeting: sortedMeetings.find((m) => new Date(m.endsAt).getTime() > now),
    pastMeetings: sortedMeetings.filter((m) => new Date(m.endsAt).getTime() <= now).reverse(),
    recentActivity: [...all]
      .filter((t) => t.state === "closed" || t.stage === "progress" || t.stage === "review")
      .sort((a, b) => +new Date(b.closedAt ?? b.updatedAt) - +new Date(a.closedAt ?? a.updatedAt))
      .slice(0, 6),
    needsClient: all.filter((t) => t.state === "open" && t.stage === "needs-client"),
    latestWeb: latest("web"),
    latestApp: latest("app"),
  };
}

/* ---------- feedback (em memória até existir Supabase) ---------- */

// Em globalThis porque o Next.js pode carregar este módulo mais do que uma vez
// (ações do servidor e páginas em bundles diferentes) — assim há um único armazenamento.
const g = globalThis as typeof globalThis & { __jpFeedback?: Map<string, Feedback[]> };
const feedbackStore = (g.__jpFeedback ??= new Map<string, Feedback[]>(
  Object.entries(feedbackSeed).map(([k, v]) => [k, [...v]]),
));

export async function listFeedback(projectId: string): Promise<Feedback[]> {
  return [...(feedbackStore.get(projectId) ?? [])].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
}

export async function addFeedback(projectId: string, entry: Omit<Feedback, "id" | "createdAt">) {
  const item: Feedback = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  feedbackStore.set(projectId, [...(feedbackStore.get(projectId) ?? []), item]);
  return item;
}
