/**
 * Entrega final e pedidos de ajuste do Académico (M6-06, RF-10.60…74, RN-31…34). Puras + leitura.
 * A janela repete a função SQL adjust_until (0012): até ao fim do último dia, em Luanda (Q-098).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { luandaDate } from "./countdown";

export type AdjustmentStatus = "aberto" | "resolvido" | "recusado";
export type AdjustmentRequest = {
  id: string;
  description: string;
  status: AdjustmentStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByLabel: string | null;
};

export const ADJUSTMENT_LABEL: Record<AdjustmentStatus, string> = {
  aberto: "Em análise",
  resolvido: "Resolvido",
  recusado: "Não incluído",
};

const DAY = 86_400_000;
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

export type AdjustWindow = {
  /** Último dia em que se pode pedir (AAAA-MM-DD, Luanda). */
  lastDay: string;
  /** Instante em que o prazo acaba (exclusivo): 00:00 do dia seguinte ao último, em Luanda. */
  untilMs: number;
  open: boolean;
  /** Dias de calendário que faltam, contando hoje (último dia = 1). */
  daysLeft: number;
};

export function adjustWindow(deliveredAt: string, adjustDays: number, now: number): AdjustWindow {
  const lastDay = addDays(luandaDate(deliveredAt), adjustDays);
  const untilMs = Date.parse(`${addDays(lastDay, 1)}T00:00:00+01:00`);
  const today = luandaDate(new Date(now).toISOString());
  const daysLeft = Math.max(0, Math.round((Date.parse(`${lastDay}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY) + 1);
  return { lastDay, untilMs, open: now < untilMs, daysLeft: now < untilMs ? daysLeft : 0 };
}

/** Descrição do pedido: 10 a 2000 caracteres (como a BD). */
export function checkDescription(text: string): string | { error: string } {
  const t = text.trim();
  if (t.length < 10) return { error: "Descreva o ajuste em pelo menos 10 caracteres." };
  if (t.length > 2000) return { error: "A descrição tem no máximo 2000 caracteres." };
  return t;
}

type Row = {
  id: string;
  description: string;
  status: AdjustmentStatus;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  deliverables: { label: string; title: string | null } | null;
};

export async function loadAdjustments(sb: SupabaseClient, projectId: string): Promise<AdjustmentRequest[]> {
  const { data, error } = await sb
    .from("adjustment_requests")
    .select("id, description, status, admin_note, created_at, resolved_at, deliverables!adjustment_requests_resolved_by_deliverable_id_fkey (label, title)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  if (error) {
    console.error(`[ajustes] Falha a ler o projeto ${projectId}:`, error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    status: r.status,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    resolvedByLabel: r.deliverables ? `${r.deliverables.title ?? "Entrega"} ${r.deliverables.label}` : null,
  }));
}
