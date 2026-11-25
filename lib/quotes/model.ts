/**
 * Orçamentos (M6-04, RF-10.20…23, estados.md §3). Tipos e funções puras + leitura.
 * A BD faz o resto (0007): ao enviar cria a aprovação "orcamento" com a regra do sinal (RN-13);
 * ao aceitar muda o prazo do projeto e cria o sinal (trava a fase 3) e o restante.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseKz } from "@/lib/payments/model";

export type QuoteStatus = "rascunho" | "enviado" | "aceite" | "substituido";

export type Quote = {
  id: string;
  version: number;
  totalKz: number;
  depositPct: number;
  depositKz: number;
  deliveryDueOn: string | null;
  status: QuoteStatus;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

export const QUOTE_LABEL: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado ao cliente",
  aceite: "Aceite",
  substituido: "Substituído",
};

/** Sinal por omissão: 50% (RN-12). */
export const DEFAULT_DEPOSIT_PCT = 50;

/** Sinal a partir da percentagem, arredondado ao cêntimo (como a BD, 0007 quotes_before). */
export const depositFromPct = (total: number, pct: number) => Math.round(total * pct) / 100;

export type QuoteFields = { total_kz: number; deposit_pct: number; deposit_kz: number; delivery_due_on: string | null };

/** Formulário do admin → campos do orçamento. O sinal escrito em Kz ganha à percentagem. */
export function readQuote(get: (k: string) => string): QuoteFields | { error: string } {
  const total = parseKz(get("total"));
  if (!total) return { error: "Indique o valor total em Kz (ex.: 90 000)." };
  if (total >= 1e10) return { error: "Valor demasiado alto." };
  const pctRaw = get("sinal_pct") || String(DEFAULT_DEPOSIT_PCT);
  const pct = Number(pctRaw);
  if (!Number.isInteger(pct) || pct < 1 || pct > 100) return { error: "A percentagem do sinal vai de 1 a 100." };
  let deposit = depositFromPct(total, pct);
  const depRaw = get("sinal_kz");
  if (depRaw) {
    const d = parseKz(depRaw);
    if (!d) return { error: "Valor do sinal inválido." };
    if (d > total) return { error: "O sinal não pode ser maior do que o total." };
    deposit = d;
  }
  const due = get("prazo");
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return { error: "Data de entrega inválida." };
  return { total_kz: total, deposit_pct: pct, deposit_kz: deposit, delivery_due_on: due || null };
}

/** Snapshot da aprovação "orcamento" (gravado pela BD ao enviar, 0007). */
export type QuoteSnapshot = {
  total_kz?: number;
  deposit_pct?: number;
  deposit_kz?: number;
  remaining_kz?: number;
  delivery_due_on?: string | null;
  deposit_rule?: string;
};

type QuoteRow = {
  id: string;
  version: number;
  total_kz: number | string;
  deposit_pct: number;
  deposit_kz: number | string;
  delivery_due_on: string | null;
  status: QuoteStatus;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

export const mapQuote = (r: QuoteRow): Quote => ({
  id: r.id,
  version: r.version,
  totalKz: Number(r.total_kz),
  depositPct: r.deposit_pct,
  depositKz: Number(r.deposit_kz),
  deliveryDueOn: r.delivery_due_on,
  status: r.status,
  sentAt: r.sent_at,
  acceptedAt: r.accepted_at,
  createdAt: r.created_at,
});

export async function loadQuotes(sb: SupabaseClient, projectId: string): Promise<Quote[]> {
  const { data, error } = await sb
    .from("quotes")
    .select("id, version, total_kz, deposit_pct, deposit_kz, delivery_due_on, status, sent_at, accepted_at, created_at")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .returns<QuoteRow[]>();
  if (error) {
    console.error(`[orçamentos] Falha a ler o projeto ${projectId}:`, error.message);
    return [];
  }
  return (data ?? []).map(mapQuote);
}
