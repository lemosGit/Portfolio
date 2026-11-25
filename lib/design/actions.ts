"use server";

/**
 * Pedido de revisão extra do cliente (M7-03, RF-20.43, Q-103). Sem rondas, o pedido de alterações é
 * recusado pela BD; o cliente descreve o que quer e o pedido chega ao João em Mensagens, ligado à fase
 * Revisões. O João regista o extra em Pagamentos (valor + rondas) e o cliente aceita-o em Aprovações.
 */
import { revalidatePath } from "next/cache";
import { addFeedback } from "@/lib/portal/data";
import { requirePortal } from "@/lib/portal/session";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { extraRequestMessage } from "./rounds";

export type ExtraResult = { ok: true; message: string } | { ok: false; error: string };

export async function requestExtraRound(version: string, comment: string): Promise<ExtraResult> {
  const { project } = await requirePortal();
  if (project.serviceType !== "design") return { ok: false, error: "As revisões extra só existem em projetos Design." };
  const text = String(comment ?? "").trim();
  if (text.length < 5) return { ok: false, error: "Diga-nos o que quer mudar." };
  if (text.length > 1500) return { ok: false, error: "O pedido tem no máximo 1500 caracteres." };
  const phase = project.phaseViews.find((p) => p.key === "revisoes");
  const body = extraRequestMessage(text, /^V\d+$/.test(version) ? version : null);
  const target = phase ? { kind: "fase" as const, ref: phase.number } : { kind: "geral" as const };

  if (supabaseEnabled) {
    const sb = await createSupabaseServer();
    const { error } = await sb.from("feedback").insert({
      project_id: project.id,
      author_role: "client",
      body,
      target_kind: target.kind,
      target_ref: target.kind === "geral" ? null : target.ref,
    });
    if (error) return { ok: false, error: "O pedido não foi enviado. Verifique a ligação e tente de novo." };
  } else {
    await addFeedback(project.id, { author: "client", body, target });
  }
  revalidatePath("/cliente", "layout");
  return { ok: true, message: "Pedido enviado. O João diz-lhe o valor; a revisão começa depois de o aceitar em Aprovações." };
}
