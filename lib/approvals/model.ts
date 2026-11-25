/**
 * Bloco Aprovações (M5-10, RF-30.30…RF-30.35, estados.md §5). Tipos e funções puras.
 * As regras (uma pendente por alvo, irreversível para o cliente, efeitos nas fases) estão na BD (0007).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type ApprovalSubject = "orcamento" | "indice" | "prova" | "extra" | "entrega";
export type ApprovalStatus = "pendente" | "aprovada" | "alteracoes_pedidas" | "cancelada";
export type ResponseKind = "aprovar" | "pedir_alteracoes" | "reabrir";

/** Cópia fixa do que o cliente viu (não muda depois de criada). */
export type ApprovalSnapshot = {
  /** Título curto: "Índice", "Convite — V3"… */
  title?: string;
  /** Mensagem do admin ao pedir. */
  message?: string;
  /** Índice: um item por linha. */
  items?: string[];
  /** Prova / entrega: ficheiros da versão. */
  files?: string[];
  /** Prova do Design (0015, RN-42): o que o cliente confirma ao aprovar a arte, copiado da ficha técnica. */
  key_texts?: { label: string; value: string }[];
  quantity?: number;
  width_cm?: number;
  height_cm?: number;
  event_date?: string;
  has_print?: boolean;
  [k: string]: unknown;
};

export type ApprovalResponse = {
  kind: ResponseKind;
  comment: string | null;
  actorRole: "client" | "admin";
  createdAt: string;
};

export type Approval = {
  id: string;
  subject: ApprovalSubject;
  versionLabel: string | null;
  snapshot: ApprovalSnapshot;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt: string | null;
  phase: { position: number; name: string } | null;
  /** Mais antiga primeiro. */
  responses: ApprovalResponse[];
};

export const SUBJECT_LABEL: Record<ApprovalSubject, string> = {
  orcamento: "Orçamento",
  indice: "Índice",
  prova: "Prova",
  extra: "Pagamento extra",
  entrega: "Entrega",
};

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pendente: "Aguarda a sua resposta",
  aprovada: "Aprovada",
  alteracoes_pedidas: "Alterações pedidas",
  cancelada: "Cancelada",
};

export const RESPONSE_LABEL: Record<ResponseKind, string> = {
  aprovar: "Aprovou",
  pedir_alteracoes: "Pediu alterações",
  reabrir: "Reaberta",
};

/** "Índice V3", "Prova — Convite V2". */
export function approvalTitle(a: Pick<Approval, "subject" | "versionLabel" | "snapshot">): string {
  const base = a.snapshot.title?.trim() || SUBJECT_LABEL[a.subject];
  return a.versionLabel ? `${base} ${a.versionLabel}` : base;
}

/** Pendentes primeiro; depois as mais recentes. */
export function sortApprovals(list: Approval[]): Approval[] {
  return [...list].sort(
    (a, b) => Number(b.status === "pendente") - Number(a.status === "pendente") || b.requestedAt.localeCompare(a.requestedAt),
  );
}

/** Índice escrito no admin (um item por linha) → itens limpos, sem linhas vazias. */
export function parseItems(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 80);
}

/* ───────────── Leitura (sessão de quem pede; RLS) ───────────── */

export type ApprovalRow = {
  id: string;
  subject: ApprovalSubject;
  version_label: string | null;
  snapshot: ApprovalSnapshot;
  status: ApprovalStatus;
  requested_at: string;
  decided_at: string | null;
  project_phases: { position: number; name: string } | null;
  approval_responses: { kind: ResponseKind; comment: string | null; actor_role: "client" | "admin"; created_at: string }[];
};

export const APPROVAL_COLS =
  "id, subject, version_label, snapshot, status, requested_at, decided_at, project_phases (position, name), approval_responses (kind, comment, actor_role, created_at)";

export function mapApproval(r: ApprovalRow): Approval {
  return {
    id: r.id,
    subject: r.subject,
    versionLabel: r.version_label,
    snapshot: r.snapshot ?? {},
    status: r.status,
    requestedAt: r.requested_at,
    decidedAt: r.decided_at,
    phase: r.project_phases,
    responses: [...(r.approval_responses ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((x) => ({ kind: x.kind, comment: x.comment, actorRole: x.actor_role, createdAt: x.created_at })),
  };
}

export async function loadApprovals(sb: SupabaseClient, projectId: string): Promise<Approval[] | { error: string }> {
  const { data, error } = await sb
    .from("approvals")
    .select(APPROVAL_COLS)
    .eq("project_id", projectId)
    .order("requested_at", { ascending: false })
    .returns<ApprovalRow[]>();
  if (error) {
    console.error(`[aprovações] Falha a ler o projeto ${projectId}:`, error.message);
    return { error: "Não foi possível ler as aprovações." };
  }
  return sortApprovals((data ?? []).map(mapApproval));
}
