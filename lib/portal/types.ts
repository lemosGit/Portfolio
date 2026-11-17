/**
 * Tipos do Portal do Cliente.
 * Fases e tarefas espelham o formato do GitHub (milestones e issues), para que a
 * troca dos dados de exemplo pela API real não mude a interface.
 */

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  initials: string;
};

/** Issue do GitHub com a label `cliente: visível`. */
export type Task = {
  number: number;
  title: string;
  area: "Frontend" | "Mobile" | "Backend" | "API" | "Design" | "Infra" | "Qualidade" | "Produto";
  state: "open" | "closed";
  /**
   * Situação de uma tarefa aberta, traduzida para o cliente:
   * progress = atribuída a alguém · review = `estado: em-revisão`
   * needs-client = `estado: precisa-info` · waiting = `estado: bloqueado`
   */
  stage?: "progress" | "review" | "needs-client" | "waiting";
  closedAt?: string; // ISO
  updatedAt: string; // ISO
};

/** Fase da metodologia (agrupa um ou mais milestones do GitHub). */
export type Phase = {
  number: number; // 1–6
  title: string;
  description: string;
  dueOn?: string; // ISO — o due_on mais tardio dos milestones da fase
  closed: boolean;
  /** Só as tarefas visíveis ao cliente. */
  tasks: Task[];
  /**
   * Contagem de TODAS as issues da fase (visíveis ou não), para a % refletir o
   * trabalho real. Sem este campo, a % usa apenas `tasks` (dados de exemplo).
   */
  counts?: { total: number; closedAt: string[] };
};

export type DemoLink = {
  id: string;
  kind: "web" | "android" | "ios";
  url: string;
  version: string;
  notes: string;
  createdAt: string; // ISO
};

export type Meeting = {
  id: string;
  title: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  callUrl: string;
  agenda: string[];
  notes?: string;
};

export type Feedback = {
  id: string;
  author: "client" | "admin";
  body: string;
  target: { kind: "geral" } | { kind: "fase"; ref: number } | { kind: "tarefa"; ref: number };
  createdAt: string; // ISO
};

export type Project = {
  id: string;
  slug: string;
  clientId: string;
  name: string;
  tagline: string;
  description: string;
  repo: { owner: string; name: string };
  startedOn: string;
  dueOn: string;
  team: { initials: string; name: string }[];
  phases: Phase[];
  demos: DemoLink[];
  meetings: Meeting[];
  syncedAt: string; // ISO — última leitura do GitHub
  /** "github" = dados reais; "exemplo" = dados de demonstração; "erro" = falhou a leitura. */
  source: "github" | "exemplo" | "erro";
};

/* ---------- valores calculados ---------- */

export type PhaseStatus = "done" | "current" | "pending";

export type PhaseView = Phase & {
  status: PhaseStatus;
  closedCount: number;
  total: number;
  percent: number;
};

export type ProjectView = Project & {
  phaseViews: PhaseView[];
  currentPhase: PhaseView;
  percent: number;
  closedCount: number;
  total: number;
  weekly: { day: string; closed: number }[];
  weeklyDelta: number; // pontos percentuais ganhos nos últimos 7 dias
  nextMeeting?: Meeting;
  pastMeetings: Meeting[];
  recentActivity: (Task & { phase: string })[];
  /** Tarefas abertas com `estado: precisa-info`. */
  needsClient: (Task & { phase: string })[];
  latestWeb?: DemoLink;
  latestApp?: DemoLink;
};
