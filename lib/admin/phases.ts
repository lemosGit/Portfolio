/**
 * Gestão das fases no admin (M5-08, #46). Funções puras, testáveis sem BD.
 * As transições repetem as do trigger `project_phases_transition` (0006, estados.md §1):
 * a BD continua a ser quem decide; isto só serve para mostrar os botões certos.
 */
import type { DbPhaseState } from "@/lib/portal/types";

export type AdminPhase = {
  id: string;
  position: number;
  key: string;
  name: string;
  description: string;
  status: DbPhaseState;
  canBeSkipped: boolean;
  dueOn: string | null;
  nextStep: string | null;
  nextStepOwner: "geniusfrela" | "cliente" | null;
  progress: number | null;
  startedAt: string | null;
  completedAt: string | null;
};

export const PHASE_LABEL: Record<DbPhaseState, string> = {
  por_iniciar: "Por iniciar",
  em_curso: "Em curso",
  aguarda_cliente: "A aguardar o cliente",
  atrasada: "Atrasada",
  concluida: "Concluída",
  nao_aplicavel: "Não aplicável",
};

/** Cor da etiqueta (Badge do admin) de cada estado. */
export const PHASE_TONE: Record<DbPhaseState, "ok" | "warn" | "danger" | "accent" | "neutral"> = {
  por_iniciar: "neutral",
  em_curso: "accent",
  aguarda_cliente: "warn",
  atrasada: "danger",
  concluida: "ok",
  nao_aplicavel: "neutral",
};

/** Texto do botão que leva a cada estado. */
export const ACTION_LABEL: Record<DbPhaseState, string> = {
  por_iniciar: "Repor",
  em_curso: "Iniciar",
  aguarda_cliente: "A aguardar o cliente",
  atrasada: "Marcar atrasada",
  concluida: "Concluir",
  nao_aplicavel: "Não se aplica",
};

const TRANSITIONS: Record<DbPhaseState, DbPhaseState[]> = {
  por_iniciar: ["em_curso", "nao_aplicavel"],
  em_curso: ["aguarda_cliente", "atrasada", "concluida"],
  aguarda_cliente: ["em_curso", "concluida"],
  atrasada: ["em_curso", "concluida"],
  concluida: ["em_curso"],
  nao_aplicavel: ["por_iniciar"],
};

/** Estados para onde a fase pode ir (B4: "não aplicável" só se a fase o permitir). */
export function allowedTargets(ph: Pick<AdminPhase, "status" | "canBeSkipped">): DbPhaseState[] {
  return TRANSITIONS[ph.status].filter((s) => s !== "nao_aplicavel" || ph.canBeSkipped);
}

export const isTransitionAllowed = (ph: Pick<AdminPhase, "status" | "canBeSkipped">, to: DbPhaseState) =>
  allowedTargets(ph).includes(to);

/** Reabrir uma fase concluída pede motivo (D-062). */
export const needsNote = (from: DbPhaseState) => from === "concluida";

const open = (s: DbPhaseState) => s !== "concluida" && s !== "nao_aplicavel";

/** Fase atual: a primeira, por posição, que não está concluída nem é não aplicável (D-063). */
export function currentPhase(phases: AdminPhase[]): AdminPhase | undefined {
  return [...phases].sort((a, b) => a.position - b.position).find((p) => open(p.status));
}

export type Step = { id: string; name: string; from: DbPhaseState; to: DbPhaseState };

/**
 * Avançar (Q-083): conclui a fase e inicia a seguinte que está por iniciar.
 * Uma fase "por iniciar" é primeiro posta em curso (por_iniciar → concluida não existe).
 */
export function planAdvance(phases: AdminPhase[], phaseId: string): Step[] | { error: string } {
  const sorted = [...phases].sort((a, b) => a.position - b.position);
  const ph = sorted.find((p) => p.id === phaseId);
  if (!ph) return { error: "Fase não encontrada." };
  if (!open(ph.status)) return { error: `A fase “${ph.name}” já está ${PHASE_LABEL[ph.status].toLowerCase()}.` };
  const steps: Step[] = [];
  if (ph.status === "por_iniciar") steps.push({ id: ph.id, name: ph.name, from: "por_iniciar", to: "em_curso" });
  steps.push({ id: ph.id, name: ph.name, from: ph.status === "por_iniciar" ? "em_curso" : ph.status, to: "concluida" });
  const next = sorted.find((p) => p.position > ph.position && p.status === "por_iniciar");
  if (next) steps.push({ id: next.id, name: next.name, from: "por_iniciar", to: "em_curso" });
  return steps;
}

/**
 * Recuar (Q-083): reabre a última fase concluída antes da fase atual, com motivo (D-062).
 * As outras fases não mudam (estados.md §1): pode haver duas em curso (D-063).
 */
export function planBack(phases: AdminPhase[]): Step | { error: string } {
  const sorted = [...phases].sort((a, b) => a.position - b.position);
  const cur = currentPhase(sorted);
  const limit = cur ? cur.position : Infinity;
  const prev = sorted.filter((p) => p.position < limit && p.status === "concluida").pop();
  if (!prev) return { error: "Não há nenhuma fase concluída antes da atual para reabrir." };
  return { id: prev.id, name: prev.name, from: "concluida", to: "em_curso" };
}

/** Linha de project_phases (admin) → AdminPhase. */
export type AdminPhaseRow = {
  id: string;
  position: number;
  key: string;
  name: string;
  description: string;
  status: DbPhaseState;
  can_be_skipped: boolean;
  due_on: string | null;
  next_step: string | null;
  next_step_owner: "geniusfrela" | "cliente" | null;
  progress: number | null;
  started_at: string | null;
  completed_at: string | null;
};

export const ADMIN_PHASE_COLS =
  "id, position, key, name, description, status, can_be_skipped, due_on, next_step, next_step_owner, progress, started_at, completed_at";

export const mapAdminPhase = (r: AdminPhaseRow): AdminPhase => ({
  id: r.id,
  position: r.position,
  key: r.key,
  name: r.name,
  description: r.description,
  status: r.status,
  canBeSkipped: r.can_be_skipped,
  dueOn: r.due_on,
  nextStep: r.next_step,
  nextStepOwner: r.next_step_owner,
  progress: r.progress,
  startedAt: r.started_at,
  completedAt: r.completed_at,
});

/** Campos editáveis de uma fase, lidos do formulário. */
export type PhaseDetails = {
  due_on: string | null;
  next_step: string | null;
  next_step_owner: "geniusfrela" | "cliente" | null;
  progress: number | null;
};

export function readPhaseDetails(get: (k: string) => string): PhaseDetails | { error: string } {
  const due = get("prazo");
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return { error: "Data do prazo inválida." };
  const next = get("proximo");
  if (next.length > 200) return { error: "O próximo passo tem no máximo 200 caracteres." };
  const owner = get("dono");
  if (owner && owner !== "geniusfrela" && owner !== "cliente") return { error: "Indique de quem é o próximo passo." };
  const prog = get("progresso");
  let progress: number | null = null;
  if (prog) {
    progress = Number(prog);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) return { error: "O progresso vai de 0 a 100." };
  }
  return {
    due_on: due || null,
    next_step: next || null,
    next_step_owner: next ? ((owner || "geniusfrela") as "geniusfrela" | "cliente") : null,
    progress,
  };
}
