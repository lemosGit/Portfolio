/**
 * Sessão do portal.
 * - Com Supabase configurado: Supabase Auth (cookies geridos por @supabase/ssr).
 * - Sem Supabase: modo de demonstração com um cookie que guarda o id do cliente.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getActiveProject, getClient, listFeedback } from "./data";
import { loadPortal } from "./supabase-repo";
import type { Feedback } from "./types";

export const SESSION_COOKIE = "jp_portal_session";
/** Projeto escolhido no seletor da barra lateral (só o id; a RLS impede ver projetos alheios). */
export const PROJECT_COOKIE = "jp_portal_project";

/** Respostas do João depois da última mensagem do cliente. */
function countUnread(feedback: Feedback[]) {
  const lastClient = feedback.findLast((f) => f.author === "client");
  return feedback.filter((f) => f.author === "admin" && (!lastClient || f.createdAt > lastClient.createdAt)).length;
}

/** Cliente e projeto da sessão atual; redireciona se não houver sessão válida. */
export const requirePortal = cache(async () => {
  if (supabaseEnabled) {
    const sb = await createSupabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) redirect("/cliente/sair");

    const preferred = (await cookies()).get(PROJECT_COOKIE)?.value;
    const data = await loadPortal(sb, user.id, preferred);
    if (!data || !data.project) redirect("/cliente/sair?motivo=sem-projeto");
    if (data.mustChangePassword) redirect("/cliente/nova-senha");
    return {
      client: data.client,
      project: data.project,
      projects: data.projects,
      feedback: data.feedback,
      unread: countUnread(data.feedback),
    };
  }

  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  const client = id ? await getClient(id) : undefined;
  if (!client) redirect("/cliente/sair"); // cookie inválido: limpa e volta ao login
  const project = await getActiveProject(client.id);
  if (!project) redirect("/cliente/sair?motivo=sem-projeto");
  const feedback = await listFeedback(project.id);
  const projects = [{ id: project.id, name: project.name, status: "ativo" as const }];
  return { client, project, projects, feedback, unread: countUnread(feedback) };
});
