"use server";

/**
 * Pedido de ajuste do cliente (M6-06, RF-10.71). Grava com a sessão do cliente: a BD valida o dono,
 * o Académico e o prazo (adjust_until, RN-33). O João recebe um email.
 */
import { revalidatePath } from "next/cache";
import { profile } from "@/lib/data";
import { sendEmail } from "@/lib/email/send";
import { adjustmentRequestEmail } from "@/lib/email/templates";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { checkDescription } from "./adjustments";

export type AdjustmentResult = { ok: true; message: string } | { ok: false; error: string };

export async function requestAdjustment(projectId: string, description: string): Promise<AdjustmentResult> {
  if (!supabaseEnabled) return { ok: false, error: "No modo de demonstração os pedidos não são guardados." };
  const text = checkDescription(String(description ?? ""));
  if (typeof text !== "string") return { ok: false, error: text.error };
  const sb = await createSupabaseServer();
  const { error } = await sb.from("adjustment_requests").insert({ project_id: String(projectId ?? ""), description: text });
  if (error) return { ok: false, error: error.message };

  const { data: p } = await sb
    .from("projects")
    .select("name, clients (name)")
    .eq("id", projectId)
    .maybeSingle<{ name: string; clients: { name: string } | null }>();
  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? profile.email,
    ...adjustmentRequestEmail({ clientName: p?.clients?.name ?? "O cliente", projectName: p?.name ?? "o projeto", projectId, description: text }),
  });
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Pedido enviado. O João responde aqui e por email." };
}
