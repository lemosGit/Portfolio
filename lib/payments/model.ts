/**
 * Bloco Pagamentos (M5-11, RF-30.20…RF-30.25). Tipos e funções puras.
 * Registo manual, sem pagamento online (D-009). As transições e os efeitos (travão de fase D-052,
 * bloqueio de ficheiros RN-14, extras por aceitar RN-07) estão na BD (0007).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { nowMs } from "@/lib/clock";

export type PaymentKind = "sinal" | "restante" | "extra";
export type PaymentStatus = "por_aceitar" | "pendente" | "pago" | "anulado";
/** Estado mostrado: "atrasado" é calculado (pendente com a data limite ultrapassada, RF-30.21). */
export type PaymentView = "por_aceitar" | "pendente" | "atrasado" | "pago" | "anulado";

export type Payment = {
  id: string;
  kind: PaymentKind;
  description: string;
  amountKz: number;
  dueOn: string | null;
  status: PaymentStatus;
  paidOn: string | null;
  extraRounds: number;
  /** Fase que este pagamento trava (D-052). */
  gatesPhase: { key: string; name: string; position: number } | null;
  createdAt: string;
};

export const KIND_LABEL: Record<PaymentKind, string> = { sinal: "Sinal", restante: "Restante", extra: "Extra" };

export const VIEW_LABEL: Record<PaymentView, string> = {
  por_aceitar: "Por aceitar",
  pendente: "Pendente",
  atrasado: "Em atraso",
  pago: "Pago",
  anulado: "Anulado",
};

/** Data de hoje em Luanda (AAAA-MM-DD). */
export function todayLuanda(now = nowMs()): string {
  return new Date(now).toLocaleDateString("en-CA", { timeZone: "Africa/Luanda" });
}

/** "Em atraso" a partir do dia seguinte à data limite, em hora de Luanda (RF-30.21, D-026). */
export function paymentView(p: Pick<Payment, "status" | "dueOn">, today = todayLuanda()): PaymentView {
  if (p.status === "pendente" && p.dueOn && p.dueOn < today) return "atrasado";
  return p.status;
}

/** Totais para o cliente (RF-30.23): contam os pendentes e pagos; "por aceitar" e anulados ficam de fora (RN-07). */
export function totals(list: Pick<Payment, "status" | "amountKz">[]) {
  const counted = list.filter((p) => p.status === "pendente" || p.status === "pago");
  const total = counted.reduce((s, p) => s + p.amountKz, 0);
  const paid = counted.filter((p) => p.status === "pago").reduce((s, p) => s + p.amountKz, 0);
  return { total, paid, missing: total - paid };
}

/** 125000 → "125 000 Kz"; 1250.5 → "1 250,50 Kz" (cêntimos só quando existem). */
export function kz(amount: number): string {
  const [int, dec] = Math.abs(amount).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "-" : ""}${grouped}${dec === "00" ? "" : `,${dec}`} Kz`;
}

/** Valor escrito no admin → número: "125 000", "125000,50", "125.000" e "1.250,5" (vírgula = cêntimos). */
export function parseKz(raw: string): number | undefined {
  const t = raw.replace(/\s|kz/gi, "");
  if (!/^[\d.,]+$/.test(t)) return undefined;
  const normalized = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
}

/**
 * Pagamento que bloqueia o avanço (RF-30.24): o primeiro pendente que trava uma fase ainda não
 * começada, pela ordem das fases. Aparece como próximo passo do cliente ("Pagar o sinal").
 */
export function blockingPayment(list: Payment[], phaseStates: Record<string, string>): Payment | undefined {
  return list
    .filter((p) => p.status === "pendente" && p.gatesPhase && phaseStates[p.gatesPhase.key] === "por_iniciar")
    .sort((a, b) => (a.gatesPhase!.position - b.gatesPhase!.position))[0];
}

/** "Pagar o sinal (50%)" a partir da descrição. */
export const payLabel = (p: Pick<Payment, "kind" | "description">) =>
  p.kind === "extra" ? `Pagar: ${p.description}` : `Pagar o ${p.description.charAt(0).toLowerCase()}${p.description.slice(1)}`;

/* ───────────── Leitura (sessão de quem pede; RLS) ───────────── */

export type PaymentRow = {
  id: string;
  kind: PaymentKind;
  description: string;
  amount_kz: number | string;
  due_on: string | null;
  status: PaymentStatus;
  paid_on: string | null;
  extra_rounds: number;
  created_at: string;
  project_phases: { key: string; name: string; position: number } | null;
};

export const PAYMENT_COLS =
  "id, kind, description, amount_kz, due_on, status, paid_on, extra_rounds, created_at, project_phases (key, name, position)";

export const mapPayment = (r: PaymentRow): Payment => ({
  id: r.id,
  kind: r.kind,
  description: r.description,
  // numeric chega como texto do PostgREST.
  amountKz: Number(r.amount_kz),
  dueOn: r.due_on,
  status: r.status,
  paidOn: r.paid_on,
  extraRounds: r.extra_rounds,
  gatesPhase: r.project_phases,
  createdAt: r.created_at,
});

/** Ordem: sinal, restante, extras; dentro de cada, por data de criação. */
const ORDER: Record<PaymentKind, number> = { sinal: 0, restante: 1, extra: 2 };
export const sortPayments = (list: Payment[]) =>
  [...list].sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.createdAt.localeCompare(b.createdAt));

export async function loadPayments(sb: SupabaseClient, projectId: string): Promise<Payment[] | { error: string }> {
  const { data, error } = await sb.from("payments").select(PAYMENT_COLS).eq("project_id", projectId).returns<PaymentRow[]>();
  if (error) {
    console.error(`[pagamentos] Falha a ler o projeto ${projectId}:`, error.message);
    return { error: "Não foi possível ler os pagamentos." };
  }
  return sortPayments((data ?? []).map(mapPayment));
}
