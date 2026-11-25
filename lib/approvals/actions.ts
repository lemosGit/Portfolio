"use server";

/**
 * Resposta do cliente a uma aprovação (M5-10). Passa pela RPC respond_approval (D-098), que
 * valida o dono, o estado, o comentário obrigatório e a versão mais recente, e aplica os efeitos.
 */
import { revalidatePath } from "next/cache";
import { profile } from "@/lib/data";
import { sendEmail } from "@/lib/email/send";
import { approvalAnsweredEmail } from "@/lib/email/templates";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { approvalTitle, type ApprovalSnapshot, type ApprovalSubject } from "./model";

export type RespondResult = { ok: true; message: string } | { ok: false; error: string };

export async function respondToApproval(id: string, kind: "aprovar" | "pedir_alteracoes", comment: string): Promise<RespondResult> {
  if (!supabaseEnabled) return { ok: false, error: "No modo de demonstração as respostas não são guardadas." };
  if (kind !== "aprovar" && kind !== "pedir_alteracoes") return { ok: false, error: "Resposta inválida." };
  const text = String(comment ?? "").trim();
  if (kind === "pedir_alteracoes" && !text) return { ok: false, error: "Escreva o que quer alterar." }; // RN-05
  if (text.length > 2000) return { ok: false, error: "O comentário tem no máximo 2000 caracteres." };

  const sb = await createSupabaseServer();
  const { error } = await sb.rpc("respond_approval", { p_approval: String(id ?? ""), p_kind: kind, p_comment: text || null });
  if (error) return { ok: false, error: error.message };

  // Aviso ao João (RF-30.35). Nunca faz falhar a resposta.
  const { data: a } = await sb
    .from("approvals")
    .select("subject, version_label, snapshot, project_id, projects (name, service_type, clients (name))")
    .eq("id", id)
    .maybeSingle<{
      subject: ApprovalSubject;
      version_label: string | null;
      snapshot: ApprovalSnapshot;
      project_id: string;
      projects: { name: string; service_type: string; clients: { name: string } | null } | null;
    }>();
  if (a) {
    // M7-04: no Design, aprovar uma prova é aprovar a arte para produção (o João prepara a impressão).
    const art = a.subject === "prova" && a.projects?.service_type === "design" && kind === "aprovar";
    const title = approvalTitle({ subject: a.subject, versionLabel: a.version_label, snapshot: a.snapshot });
    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? profile.email,
      ...approvalAnsweredEmail({
        clientName: a.projects?.clients?.name ?? "O cliente",
        projectName: a.projects?.name ?? "o projeto",
        projectId: a.project_id,
        title: art ? `${title} para produção` : title,
        approved: kind === "aprovar",
        comment: text || null,
      }),
    });
  }

  revalidatePath("/cliente", "layout");
  revalidatePath("/admin", "layout");
  const artDone = a?.subject === "prova" && a.projects?.service_type === "design" && kind === "aprovar";
  return {
    ok: true,
    message: artDone ? "Arte aprovada para produção. Obrigado!" : kind === "aprovar" ? "Feito. Obrigado!" : "Pedido de alterações enviado. Vamos tratar disso.",
  };
}
