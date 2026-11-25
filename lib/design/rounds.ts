/**
 * Rondas de revisão do Design (M7-03, RN-35, RN-36, RF-20.40…44). Os números vêm da BD
 * (public.design_rounds, 0007): incluídas = orçamento aceite + extras aceites; usadas = pedidos de
 * alterações às provas; a BD recusa um pedido sem rondas ("Sem rondas: peça uma revisão extra.").
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type Rounds = { included: number; used: number; remaining: number };

/** "Ronda 1 de 2" (a ronda que deu a versão atual); antes do primeiro pedido, "2 rondas incluídas". */
export function roundsLabel(r: Rounds): string {
  if (r.used === 0) return r.included === 0 ? "Sem rondas incluídas" : r.included === 1 ? "1 ronda incluída" : `${r.included} rondas incluídas`;
  return `Ronda ${r.used} de ${r.included}`;
}

/** Aviso antes de pedir alterações (TEL-33): que ronda vai gastar e se é a última. */
export function changesNotice(r: Rounds): string | null {
  if (r.remaining <= 0) return null;
  const next = r.used + 1;
  return r.remaining === 1
    ? `Esta é a ronda ${next} de ${r.included} incluídas. Depois desta, cada nova revisão tem um custo extra.`
    : `Vai usar a ronda ${next} de ${r.included} incluídas.`;
}

/** Texto da mensagem enviada ao João quando o cliente pede uma revisão extra (Q-103). */
export const extraRequestMessage = (comment: string, version: string | null) =>
  `Pedido de revisão extra${version ? ` sobre a ${version}` : ""}: ${comment.trim()}`;

export async function loadRounds(sb: SupabaseClient, projectId: string): Promise<Rounds | undefined> {
  const { data, error } = await sb.rpc("design_rounds", { p_project: projectId });
  if (error) {
    console.error(`[rondas] Falha a ler o projeto ${projectId}:`, error.message);
    return undefined;
  }
  const row = (Array.isArray(data) ? data[0] : data) as Rounds | undefined;
  return row ? { included: Number(row.included), used: Number(row.used), remaining: Number(row.remaining) } : undefined;
}
