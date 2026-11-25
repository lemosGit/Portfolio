import type { AdjustmentRequest } from "@/lib/academic/adjustments";
import type { Section } from "@/lib/academic/chapters";
import type { AcademicBrief } from "@/lib/academic/brief";
import type { Payment } from "@/lib/payments/model";
import type { Approval } from "@/lib/approvals/model";
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

/** Tipo de serviço do projeto (projects.service_type). */
export type ServiceType = "development" | "academic" | "design";

/** Estado de uma fase guardada na BD (project_phases.status) — Académico e Design. */
export type DbPhaseState = "por_iniciar" | "em_curso" | "aguarda_cliente" | "concluida" | "atrasada" | "nao_aplicavel";

/**
 * Fase da metodologia.
 * - GitHub (Desenvolvimento): agrupa um ou mais milestones; number = 1–6.
 * - BD (Académico, Design): uma linha de project_phases; number = position (1–7).
 * Os campos opcionais no fim só são preenchidos pela fonte BD (ADR-001).
 */
export type Phase = {
  number: number;
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
  /* ---- só fonte BD ---- */
  key?: string;
  state?: DbPhaseState;
  nextStep?: { text: string; owner: "geniusfrela" | "cliente" | null };
  /** Progresso da fase, 0–1 (capítulos ou project_phases.progress). */
  progress?: number;
  clientCanUpload?: boolean;
  /** Data de conclusão (fonte BD). */
  completedAt?: string;
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
  /** Imagem de capa (Supabase Storage), ao fundo do resumo. */
  coverUrl?: string;
  repo: { owner: string; name: string };
  startedOn: string;
  dueOn: string;
  team: { initials: string; name: string }[];
  phases: Phase[];
  demos: DemoLink[];
  meetings: Meeting[];
  syncedAt: string; // ISO — última leitura do GitHub
  /** Por omissão "development" (os projetos e dados de exemplo anteriores à 0006). */
  serviceType?: ServiceType;
  /** Aprovações (Académico e Design, M5-10): pendentes primeiro. */
  approvals?: Approval[];
  /** Pagamentos (Académico e Design, M5-11). O cliente não vê os anulados (RLS). */
  payments?: Payment[];
  /** false quando o projeto ainda não tem prazo (dueOn é então "agora", só para não ficar vazio). */
  dueOnSet?: boolean;
  /** Prazo ajustado (RN-21: + dias a aguardar o cliente), da função project_adjusted_due; só no Académico (M6-02). */
  adjustedDueOn?: string;
  /** Pedidos de ajuste depois da entrega final (M6-06); só no Académico. */
  adjustments?: AdjustmentRequest[];
  /** Índice e capítulos (M6-03): só o título e o estado (D-015); só no Académico. */
  sections?: Section[];
  /** Ficha do trabalho académico (M6-01); só no Académico. */
  academicBrief?: AcademicBrief;
  /** Data em que os ficheiros saem do armazenamento (projeto entregue/cancelado, #122). */
  filesPurgeOn?: string;
  /** "github"/"bd" = dados reais; "exemplo" = dados de demonstração; "erro" = falhou a leitura. */
  source: "github" | "bd" | "exemplo" | "erro";
};

/* ---------- valores calculados ---------- */

/** "skipped" só aparece na fonte BD (fase "não aplicável", D-075). */
export type PhaseStatus = "done" | "current" | "pending" | "skipped";

export type PhaseView = Phase & {
  status: PhaseStatus;
  /** Fonte BD: marcada "atrasada" pelo admin, ou com a data-limite ultrapassada (D-046). */
  late?: boolean;
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
